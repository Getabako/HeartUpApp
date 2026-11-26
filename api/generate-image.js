// POST /api/generate-image
// body: { prompt: string, size?: '1024x1536' | '1024x1024' | '1536x1024' }
// Gemini の画像生成モデルでイラストを生成し、data URL を返す。
// GEMINI_API_KEY 未設定時は 501 を返す（クライアント側はプロンプト表示にフォールバック）。
const { IMAGE_MODELS, isConfigured, setCors, json, readJson, generate } = require('./_gemini');

// 画面側の指定（縦長・正方形・横長）を Gemini の縦横比に読み替える
const ASPECT = { '1024x1536': '2:3', '1024x1024': '1:1', '1536x1024': '3:2' };

module.exports = async (req, res) => {
    setCors(res);
    if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
    if (req.method === 'GET') {
        return json(res, 200, { configured: isConfigured() });
    }
    if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
    if (!isConfigured()) {
        return json(res, 501, { error: 'GEMINI_API_KEY が設定されていません', configured: false });
    }

    const body = await readJson(req);
    const prompt = String(body.prompt || '').trim();
    if (!prompt) return json(res, 400, { error: 'prompt は必須です' });
    if (prompt.length > 6000) return json(res, 400, { error: 'prompt が長すぎます（6000文字まで）' });
    const aspectRatio = ASPECT[body.size] || '2:3';

    try {
        const contents = [{ role: 'user', parts: [{ text: prompt }] }];
        const result = await generate(IMAGE_MODELS, [
            { contents, generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio } } },
            { contents: [{ role: 'user', parts: [{ text: `${prompt}\n\n画像の縦横比は ${aspectRatio}（縦長）にしてください。` }] }], generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } }
        ]);
        if (!result.ok) return json(res, result.status || 500, { error: result.message || '画像生成に失敗しました' });

        const parts = result.data.candidates?.[0]?.content?.parts || [];
        const img = parts.map(p => p.inlineData || p.inline_data).find(Boolean);
        if (!img || !img.data) {
            const reason = result.data.candidates?.[0]?.finishReason || result.data.promptFeedback?.blockReason || '';
            return json(res, 502, { error: '画像データが返されませんでした' + (reason ? `（${reason}）` : '') });
        }
        const mime = img.mimeType || img.mime_type || 'image/png';
        return json(res, 200, { image: `data:${mime};base64,${img.data}`, size: body.size || '1024x1536', model: result.model, route: result.route });
    } catch (error) {
        console.error('generate-image error:', error);
        return json(res, 500, { error: error.message || 'サーバーエラー' });
    }
};

// 画像は base64 で返すためレスポンスが大きい（Vercel の 4.5MB 制限内に収まる大きさで返る）。
module.exports.config = { maxDuration: 120 };
