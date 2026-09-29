// OpenAI API 共通ヘルパー（Vercel Serverless Functions 用）
// 環境変数 OPENAI_API_KEY が設定されていない場合は configured=false を返す。
// キーは Vercel の環境変数に設定するだけで有効になる（クライアントには渡さない）。

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

function isConfigured() {
    return !!OPENAI_API_KEY && !OPENAI_API_KEY.includes('YOUR_');
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

module.exports = { OPENAI_API_KEY, isConfigured, setCors, json, readJson };
