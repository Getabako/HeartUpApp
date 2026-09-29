// POST /api/generate-image
// body: { prompt: string, size?: '1024x1536' | '1024x1024' | '1536x1024', quality?: 'low'|'medium'|'high' }
// OpenAI 画像生成モデル（gpt-image-1）でイラストを生成し、base64 PNG を返す。
// これは事業所（クライアント）が自社契約の OPENAI_API_KEY を Vercel に設定して使う機能。
// OPENAI_API_KEY 未設定時は 501 を返す（クライアント側はプロンプト表示にフォールバック）。
const { OPENAI_API_KEY, isConfigured, setCors, json, readJson } = require('./_openai');

const ALLOWED_SIZES = ['1024x1024', '1024x1536', '1536x1024', 'auto'];
const OPENAI_IMAGES_ENDPOINT = 'https://api.openai.com/v1/images/generations';

module.exports = async (req, res) => {
    setCors(res);
    if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
    if (req.method === 'GET') {
        return json(res, 200, { configured: isConfigured() });
    }
    if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
    if (!isConfigured()) {
        return json(res, 501, { error: 'OPENAI_API_KEY が設定されていません', configured: false });
    }

    const body = await readJson(req);
    const prompt = String(body.prompt || '').trim();
    if (!prompt) return json(res, 400, { error: 'prompt は必須です' });
    if (prompt.length > 6000) return json(res, 400, { error: 'prompt が長すぎます（6000文字まで）' });

    const size = ALLOWED_SIZES.includes(body.size) ? body.size : '1024x1536';
    const quality = ['low', 'medium', 'high', 'auto'].includes(body.quality) ? body.quality : 'medium';

    try {
        const response = await fetch(OPENAI_IMAGES_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
                prompt,
                n: 1,
                size,
                quality,
                output_format: 'png'
            })
        });

        const text = await response.text();
        if (!response.ok) {
            console.error('OpenAI image error:', text);
            let msg = 'OpenAI 画像生成に失敗しました';
            try { msg = JSON.parse(text).error?.message || msg; } catch (e) { /* ignore */ }
            return json(res, response.status, { error: msg });
        }
        const data = JSON.parse(text);
        const b64 = data.data?.[0]?.b64_json;
        if (!b64) return json(res, 502, { error: '画像データが返されませんでした' });
        return json(res, 200, { image: `data:image/png;base64,${b64}`, size, quality });
    } catch (error) {
        console.error('generate-image error:', error);
        return json(res, 500, { error: error.message || 'サーバーエラー' });
    }
};

// 画像は base64 で返すためレスポンスが大きい。1024x1536 PNG で概ね 2〜3MB（Vercel の 4.5MB 制限内）。
module.exports.config = { maxDuration: 120 };
