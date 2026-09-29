// GET /api/ai-status
// OpenAI 連携（画像生成・音声入力）が利用可能かをクライアントに返す
const { isConfigured, setCors, json } = require('./_openai');

module.exports = async (req, res) => {
    setCors(res);
    if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
    const configured = isConfigured();
    return json(res, 200, {
        imageGeneration: configured,
        transcription: configured,
        // 1日あたりの画像生成上限（環境変数で調整可能。未設定なら 20）
        dailyImageLimit: parseInt(process.env.IMAGE_DAILY_LIMIT || '20', 10)
    });
};
