// POST /api/transcribe
// body: { audio: 'data:audio/webm;base64,....', mimeType?: string, language?: 'ja', prompt?: string }
// Gemini で音声を文字起こしし { text } を返す。
// GEMINI_API_KEY 未設定時は 501 を返す（クライアント側はブラウザ内蔵の音声認識にフォールバック）。
const { TRANSCRIBE_MODELS, isConfigured, setCors, json, readJson, generate } = require('./_gemini');

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
    const audio = String(body.audio || '');
    const match = audio.match(/^data:([^;,]+)[^,]*;base64,(.+)$/);
    if (!match) return json(res, 400, { error: 'audio は data URL (base64) で送ってください' });
    // "audio/webm;codecs=opus" のような指定は種類だけにする
    const mimeType = String(body.mimeType || match[1]).split(';')[0].trim() || 'audio/webm';
    const base64 = match[2];
    if (base64.length > 14 * 1024 * 1024) return json(res, 400, { error: '音声が長すぎます。短く区切って録音してください' });

    const hint = body.prompt ? `場面: ${String(body.prompt).slice(0, 500)}\n` : '';
    const instruction = `${hint}この音声を日本語でそのまま文字に起こしてください。\n- 話された言葉だけを書く。要約・言い換え・補足・説明をしない\n- 「えー」「あのー」などの言いよどみは省く\n- 句読点を入れる\n- 聞き取れる言葉がなければ、何も書かずに空で返す`;

    try {
        const contents = [{ role: 'user', parts: [{ inlineData: { mimeType, data: base64 } }, { text: instruction }] }];
        const result = await generate(TRANSCRIBE_MODELS, [
            { contents, generationConfig: { temperature: 0 } },
            { contents }
        ]);
        if (!result.ok) return json(res, result.status || 500, { error: result.message || '音声認識に失敗しました' });
        const parts = result.data.candidates?.[0]?.content?.parts || [];
        const text = parts.filter(p => !p.thought).map(p => p.text || '').join('').trim();
        return json(res, 200, { text, model: result.model, route: result.route });
    } catch (error) {
        console.error('transcribe error:', error);
        return json(res, 500, { error: error.message || 'サーバーエラー' });
    }
};

module.exports.config = { maxDuration: 60 };
