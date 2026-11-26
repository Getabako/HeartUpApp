// Gemini API 共通ヘルパー（Vercel Serverless Functions 用）
// 画像生成・音声の文字起こしは、すでに設定済みの GEMINI_API_KEY だけで動く（OpenAI は使わない）。
// モデル名は環境変数で差し替えられる。先頭のモデルが使えないとき（廃止・未対応）は次の候補を順に試す。
//
// 呼び出し先は 2 通り（2026-11-27）:
// - GOOGLE_VERTEX_SA（サービスアカウントの JSON を base64 にしたもの）があれば Google Cloud（Vertex AI）経由。
//   ふつうの Google Cloud の請求で動き、Gemini API の前払い残高に左右されない。こちらを優先する
// - なければ GEMINI_API_KEY で Gemini API を直接呼ぶ

const crypto = require('crypto');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';

let VERTEX_SA = null;
try {
    const raw = process.env.GOOGLE_VERTEX_SA || '';
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

// 呼び出し先の URL とヘッダーを組み立てる
async function endpoint(model) {
    if (VERTEX_SA) {
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
    if (!VERTEX_SA || !Array.isArray(body.contents)) return body;
    return { ...body, contents: body.contents.map(c => (c.role ? c : { role: 'user', ...c })) };
}

const IMAGE_MODELS = [process.env.GEMINI_IMAGE_MODEL, 'gemini-3-pro-image', 'gemini-3.1-flash-image', 'gemini-2.5-flash-image'].filter(Boolean);
const TRANSCRIBE_MODELS = [process.env.GEMINI_TRANSCRIBE_MODEL, 'gemini-3.5-transcribe', 'gemini-2.5-flash'].filter(Boolean);

function isConfigured() {
    return !!VERTEX_SA || (!!GEMINI_API_KEY && !GEMINI_API_KEY.includes('YOUR_'));
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
    for (const model of models) {
        for (const body of bodies) {
            const target = await endpoint(model);
            const response = await fetch(target.url, {
                method: 'POST',
                headers: target.headers,
                body: JSON.stringify(withRole(body))
            });
            const text = await response.text();
            if (response.ok) {
                try { return { ok: true, model, data: JSON.parse(text) }; } catch (e) { last = { status: 502, message: '応答を読み取れませんでした' }; continue; }
            }
            let message = `Gemini エラー (${response.status})`;
            try { message = JSON.parse(text).error?.message || message; } catch (e) { /* ignore */ }
            console.error('Gemini error:', model, response.status, message);
            last = { status: response.status, message };
            if (response.status !== 400 && response.status !== 404) return { ok: false, ...last };
        }
    }
    return { ok: false, ...last };
}

module.exports = { GEMINI_API_KEY, TEXT_MODELS, IMAGE_MODELS, TRANSCRIBE_MODELS, isConfigured, setCors, json, readJson, generate };
