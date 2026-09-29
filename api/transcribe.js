// POST /api/transcribe
// body: { audio: 'data:audio/webm;base64,....', mimeType?: string, language?: 'ja', prompt?: string }
// OpenAI 音声認識で文字起こしを行い { text } を返す。
// OPENAI_API_KEY 未設定時は 501 を返す（クライアント側はブラウザ内蔵の音声認識にフォールバック）。
const { OPENAI_API_KEY, isConfigured, setCors, json, readJson } = require('./_openai');

const OPENAI_TRANSCRIBE_ENDPOINT = 'https://api.openai.com/v1/audio/transcriptions';

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
    const audio = String(body.audio || '');
    const match = audio.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return json(res, 400, { error: 'audio は data URL (base64) で送ってください' });
    const mimeType = body.mimeType || match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 20 * 1024 * 1024) return json(res, 400, { error: '音声が大きすぎます（20MBまで）' });

    const ext = mimeType.includes('mp4') ? 'mp4'
        : mimeType.includes('ogg') ? 'ogg'
        : mimeType.includes('wav') ? 'wav'
        : mimeType.includes('mpeg') ? 'mp3'
        : 'webm';

    try {
        const form = new FormData();
        form.append('file', new Blob([buffer], { type: mimeType }), `memo.${ext}`);
        form.append('model', process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-mini-transcribe');
        form.append('language', body.language || 'ja');
        form.append('response_format', 'json');
        if (body.prompt) form.append('prompt', String(body.prompt).slice(0, 500));

        const response = await fetch(OPENAI_TRANSCRIBE_ENDPOINT, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
            body: form
        });
        const text = await response.text();
        if (!response.ok) {
            console.error('OpenAI transcribe error:', text);
            let msg = '音声認識に失敗しました';
            try { msg = JSON.parse(text).error?.message || msg; } catch (e) { /* ignore */ }
            return json(res, response.status, { error: msg });
        }
        const data = JSON.parse(text);
        return json(res, 200, { text: data.text || '' });
    } catch (error) {
        console.error('transcribe error:', error);
        return json(res, 500, { error: error.message || 'サーバーエラー' });
    }
};

module.exports.config = { maxDuration: 60 };
