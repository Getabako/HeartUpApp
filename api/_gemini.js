// Gemini API 共通ヘルパー（Vercel Serverless Functions 用）
// 画像生成・音声の文字起こしは、すでに設定済みの GEMINI_API_KEY だけで動く（OpenAI は使わない）。
// モデル名は環境変数で差し替えられる。先頭のモデルが使えないとき（廃止・未対応）は次の候補を順に試す。

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';

const IMAGE_MODELS = [process.env.GEMINI_IMAGE_MODEL, 'gemini-3-pro-image', 'gemini-3.1-flash-image', 'gemini-2.5-flash-image'].filter(Boolean);
const TRANSCRIBE_MODELS = [process.env.GEMINI_TRANSCRIBE_MODEL, 'gemini-3.5-transcribe', 'gemini-2.5-flash'].filter(Boolean);

function isConfigured() {
    return !!GEMINI_API_KEY && !GEMINI_API_KEY.includes('YOUR_');
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
            const response = await fetch(`${BASE}${model}:generateContent`, {
                method: 'POST',
                headers: { 'x-goog-api-key': GEMINI_API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
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

module.exports = { GEMINI_API_KEY, IMAGE_MODELS, TRANSCRIBE_MODELS, isConfigured, setCors, json, readJson, generate };
