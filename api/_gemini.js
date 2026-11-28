// Gemini API 共通ヘルパー（Vercel Serverless Functions 用）
// 画像生成・音声の文字起こしは、すでに設定済みの GEMINI_API_KEY だけで動く（OpenAI は使わない）。
// モデル名は環境変数で差し替えられる。先頭のモデルが使えないとき（廃止・未対応）は次の候補を順に試す。
//
// 呼び出し先は 2 通り（2026-11-27）:
// - 本線: GEMINI_API_KEY（ハートアップが発行した鍵）で Gemini API を呼ぶ。料金はハートアップ側
// - 予備: GOOGLE_VERTEX_SA（サービスアカウントの JSON を base64 にしたもの）で Google Cloud（Vertex AI）経由。
//   本線の鍵が Google に断られたときだけ使う。料金は高崎の Google Cloud（heartupapp）に付くので、常用しない

const crypto = require('crypto');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';

// 予備の経路は、ALLOW_VERTEX_FALLBACK=1 を入れたときだけ使う（2026-11-28 本人指示）。
// ふだんは切ってあり、ハートアップの鍵（GEMINI_API_KEY）が有効でないと AI は動かない
const VERTEX_ALLOWED = process.env.ALLOW_VERTEX_FALLBACK === '1';
const KEY_MISSING_MESSAGE = 'AI を使うための鍵（Gemini API キー）が登録されていないか、無効になっています。鍵を登録すると使えるようになります。管理者に連絡してください。';
let VERTEX_SA = null;
try {
    const raw = VERTEX_ALLOWED ? (process.env.GOOGLE_VERTEX_SA || '') : '';
    if (raw) VERTEX_SA = JSON.parse(raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8'));
} catch (e) {
    console.error('GOOGLE_VERTEX_SA を読み取れません:', e.message);
}
const VERTEX_LOCATION = process.env.GOOGLE_VERTEX_LOCATION || 'global';

const TEXT_MODELS = [process.env.GEMINI_TEXT_MODEL, 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-2.5-flash'].filter(Boolean);

// サービスアカウントでアクセストークンを取る（期限の少し前まで使い回す）
let cachedToken = { value: '', expires: 0 };
async function vertexToken() {
    if (cachedToken.value && Date.now() < cachedToken.expires - 60000) return cachedToken.value;
    const now = Math.floor(Date.now() / 1000);
    const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
        iss: VERTEX_SA.client_email,
        scope: 'https://www.googleapis.com/auth/cloud-platform',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600
    })}`;
    const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(VERTEX_SA.private_key).toString('base64url');
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) throw new Error('Google Cloud の認証に失敗しました');
    cachedToken = { value: data.access_token, expires: Date.now() + (data.expires_in || 3600) * 1000 };
    return cachedToken.value;
}

// 呼び出し先の URL とヘッダーを組み立てる。route は 'key'（ハートアップの Gemini の鍵）か 'vertex'（予備の Google Cloud 経由）
async function endpoint(route, model) {
    if (route === 'vertex') {
        const host = VERTEX_LOCATION === 'global' ? 'aiplatform.googleapis.com' : `${VERTEX_LOCATION}-aiplatform.googleapis.com`;
        return {
            url: `https://${host}/v1/projects/${VERTEX_SA.project_id}/locations/${VERTEX_LOCATION}/publishers/google/models/${model}:generateContent`,
            headers: { Authorization: `Bearer ${await vertexToken()}`, 'Content-Type': 'application/json' }
        };
    }
    return { url: `${BASE}${model}:generateContent`, headers: { 'x-goog-api-key': GEMINI_API_KEY, 'Content-Type': 'application/json' } };
}

// Google Cloud 経由は contents に role が要る
function withRole(body) {
    if (!Array.isArray(body.contents)) return body;
    return { ...body, contents: body.contents.map(c => (c.role ? c : { role: 'user', ...c })) };
}

function keyConfigured() {
    return !!GEMINI_API_KEY && !GEMINI_API_KEY.includes('YOUR_');
}

// 使う順番: まずハートアップの Gemini の鍵。鍵そのものが断られたとき（無効・権限なし・残高なし）だけ、予備の Google Cloud 経由に回す。
// 断られた鍵を毎回試すと遅くなるので、10 分間は予備を先に使う。鍵が直れば自動で鍵に戻る。
let keyRefusedUntil = 0;
function routes() {
    const list = [];
    const keyOk = keyConfigured() && Date.now() >= keyRefusedUntil;
    if (keyOk) list.push('key');
    if (VERTEX_SA) list.push('vertex');
    if (!keyOk && keyConfigured() && !VERTEX_SA) list.push('key');
    return list;
}
function keyRefused(status, message) {
    return status === 401 || status === 402 || status === 403 || (status === 400 && /API key/i.test(message || ''));
}

const IMAGE_MODELS = [process.env.GEMINI_IMAGE_MODEL, 'gemini-3-pro-image', 'gemini-3.1-flash-image', 'gemini-2.5-flash-image'].filter(Boolean);
const TRANSCRIBE_MODELS = [process.env.GEMINI_TRANSCRIBE_MODEL, 'gemini-3.5-transcribe', 'gemini-2.5-flash'].filter(Boolean);

function isConfigured() {
    return !!VERTEX_SA || keyConfigured();
}

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, status, body) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
}

// リクエストボディを JSON として読む（Vercel の Node ランタイムでは req.body が既にある場合もある）
async function readJson(req) {
    if (req.body && typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
        try { return JSON.parse(req.body); } catch (e) { return {}; }
    }
    return new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => {
            try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); }
        });
    });
}

// generateContent を呼ぶ。bodies は「試す順のリクエスト本文」。モデル×本文を順に試し、最初に成功したものを返す。
// 400（その書き方を受け付けない）・404（モデルがない）のときだけ次を試す。それ以外の失敗はそのまま返す。
async function generate(models, bodies) {
    let last = { status: 500, message: 'Gemini の呼び出しに失敗しました' };
    for (const route of routes()) {
        const result = await generateVia(route, models, bodies);
        if (result.ok) return result;
        last = result;
        if (route === 'key' && keyRefused(result.status, result.message)) {
            console.error('Gemini の鍵が断られました:', result.status, result.message);
            if (!VERTEX_SA) break;
            keyRefusedUntil = Date.now() + 10 * 60 * 1000;
            continue;
        }
        break;
    }
    if (keyRefused(last.status, last.message)) return { ok: false, status: 503, message: KEY_MISSING_MESSAGE };
    return { ok: false, status: last.status, message: last.message };
}

async function generateVia(route, models, bodies) {
    let last = { status: 500, message: 'Gemini の呼び出しに失敗しました' };
    for (const model of models) {
        for (const body of bodies) {
            const target = await endpoint(route, model);
            const response = await fetch(target.url, {
                method: 'POST',
                headers: target.headers,
                body: JSON.stringify(route === 'vertex' ? withRole(body) : body)
            });
            const text = await response.text();
            if (response.ok) {
                try { return { ok: true, model, route, data: JSON.parse(text) }; } catch (e) { last = { status: 502, message: '応答を読み取れませんでした' }; continue; }
            }
            let message = `Gemini エラー (${response.status})`;
            try { message = JSON.parse(text).error?.message || message; } catch (e) { /* ignore */ }
            console.error('Gemini error:', route, model, response.status, message);
            last = { status: response.status, message };
            if (response.status !== 400 && response.status !== 404) return { ok: false, ...last };
            if (keyRefused(response.status, message)) return { ok: false, ...last };
        }
    }
    return { ok: false, ...last };
}

module.exports = { GEMINI_API_KEY, TEXT_MODELS, IMAGE_MODELS, TRANSCRIBE_MODELS, isConfigured, setCors, json, readJson, generate };
