// GET /api/ai-status
// 画像生成・音声入力（どちらも Gemini）が利用可能かをクライアントに返す
const { isConfigured, setCors, json } = require('./_gemini');

module.exports = async (req, res) => {
    setCors(res);
    if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
    const configured = isConfigured();
    return json(res, 200, {
        imageGeneration: configured,
        transcription: configured,
        provider: 'gemini',
        // 1日あたりの画像生成上限（環境変数で調整可能。未設定なら 20）
        dailyImageLimit: parseInt(process.env.IMAGE_DAILY_LIMIT || '20', 10)
    });
};
