// POST /api/generate-text
// body: { prompt: string, images?: [{ mimeType, data(base64) }], temperature?: number }
// Gemini で文章を作り { text } を返す。記録・連絡帳・支援計画・練習メニューなど、アプリの文章生成はすべてここを通る。
// 鍵はサーバー側だけに置く（ブラウザには渡さない）。
const { TEXT_MODELS, isConfigured, setCors, json, readJson, generate } = require('./_gemini');

const SAFETY = ['HARM_CATEGORY_HARASSMENT', 'HARM_CATEGORY_HATE_SPEECH', 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'HARM_CATEGORY_DANGEROUS_CONTENT']
    .map(category => ({ category, threshold: 'BLOCK_NONE' }));

module.exports = async (req, res) => {
    setCors(res);
    if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
    if (req.method === 'GET') return json(res, 200, { configured: isConfigured() });
    if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
    if (!isConfigured()) return json(res, 501, { error: 'AI の設定がされていません', configured: false });

    const body = await readJson(req);
    const prompt = String(body.prompt || '');
    if (!prompt.trim()) return json(res, 400, { error: 'prompt が空です' });

    const parts = [];
    (Array.isArray(body.images) ? body.images : []).slice(0, 4).forEach(img => {
        if (img && img.data) parts.push({ inlineData: { mimeType: img.mimeType || 'image/jpeg', data: String(img.data) } });
    });
    parts.push({ text: prompt });

    const temperature = typeof body.temperature === 'number' ? body.temperature : 0.7;
    const contents = [{ role: 'user', parts }];
    // 記録や連絡帳にそのまま貼られるので、前置きや結びを書かせない
    const systemInstruction = { parts: [{ text: '求められた本文だけを出力する。「以下の通り作成しました」「ご提案します」のような前置き、あいさつ、結びの言葉、区切り線（---）は書かない。' }] };

    try {
        const result = await generate(TEXT_MODELS, [
            { contents, systemInstruction, generationConfig: { temperature, maxOutputTokens: 16384 }, safetySettings: SAFETY },
            { contents, generationConfig: { temperature, maxOutputTokens: 16384 }, safetySettings: SAFETY },
            { contents }
        ]);
        if (!result.ok) return json(res, result.status || 500, { error: result.message || '文章の作成に失敗しました' });
        const out = result.data.candidates?.[0]?.content?.parts || [];
        const text = out.filter(p => !p.thought).map(p => p.text || '').join('');
        if (!text.trim()) return json(res, 502, { error: 'AI から文章が返りませんでした。もう一度お試しください' });
        return json(res, 200, { text, model: result.model, route: result.route });
    } catch (error) {
        console.error('generate-text error:', error);
        return json(res, 500, { error: error.message || 'サーバーエラー' });
    }
};

module.exports.config = { maxDuration: 120 };
