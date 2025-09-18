// Gemini API統合モジュール
class GeminiAPI {
    constructor() {
        this.apiKey = null;
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.initialized = false;
    }

    // APIキーを設定
    setApiKey(key) {
        // 無効なキーをフィルタリング
        if (!key || key === 'YOUR_API_KEY_HERE' || key.includes('github.com') || key.includes('http://') || key.includes('https://')) {
            console.error('Invalid API key format:', key);
            return false;
        }
        
        this.apiKey = key;
        this.initialized = true;
        localStorage.setItem('gemini_api_key', key);
        console.log('API key set successfully');
        return true;
    }

    // 保存されたAPIキーを読み込み
    loadApiKey() {
        // 1. まずconfig.jsから読み込みを試みる
        if (typeof API_CONFIG !== 'undefined' && API_CONFIG.GEMINI_API_KEY && API_CONFIG.GEMINI_API_KEY !== 'YOUR_API_KEY_HERE') {
            console.log('Loading API key from config.js');
            this.setApiKey(API_CONFIG.GEMINI_API_KEY);
            return true;
        }
        
        // 2. localStorageから読み込み
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey && !savedKey.includes('github.com')) {  // GitHub URLが誤って保存されている場合は無視
            console.log('Loading API key from localStorage');
            this.setApiKey(savedKey);
            return true;
        } else if (savedKey && savedKey.includes('github.com')) {
            console.warn('Invalid API key found in localStorage (GitHub URL), clearing...');
            localStorage.removeItem('gemini_api_key');
        }
        
        console.log('No valid API key found');
        return false;
    }

    // APIキーが設定されているか確認
    isInitialized() {
        const isInit = this.initialized && this.apiKey && this.apiKey !== 'YOUR_API_KEY_HERE';
        if (!isInit) {
            console.log('API not initialized:', {
                initialized: this.initialized,
                hasApiKey: !!this.apiKey,
                apiKeyLength: this.apiKey ? this.apiKey.length : 0
            });
        }
        return isInit;
    }

    // プロンプトを送信して結果を取得
    async generateContent(prompt) {
        if (!this.isInitialized()) {
            throw new Error('APIキーが設定されていません');
        }

        try {
            const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 2048,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_NONE"
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Response Error:', errorText);
                try {
                    const error = JSON.parse(errorText);
                    if (error.error?.message?.includes('API key not valid')) {
                        throw new Error('API key not valid. Please pass a valid API key.');
                    }
                    throw new Error(error.error?.message || 'API呼び出しに失敗しました');
                } catch (parseError) {
                    throw new Error(`API呼び出しに失敗しました: ${errorText}`);
                }
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }

    // 記録を生成
    async generateRecord(recordData) {
        const prompt = `
あなたはサッカー療育の専門家です。以下の情報を基に、療育活動の記録を作成してください。

【入力情報】
日付: ${recordData.date}
対象児童: ${recordData.childName}
活動内容: ${recordData.activityType}
観察された様子: ${recordData.observation}
特記事項: ${recordData.notes || 'なし'}

【記録フォーマット】
以下の形式で、専門的かつ読みやすい記録を作成してください：

1. 活動の概要
2. 児童の様子と反応
3. 観察された成長や変化
4. 支援者の評価と考察
5. 次回への課題と目標

温かみのある文章で、保護者にも分かりやすく記述してください。
`;

        return await this.generateContent(prompt);
    }

    // 支援計画を生成
    async generateSupportPlan(planData) {
        const prompt = `
あなたはサッカー療育の支援計画作成の専門家です。以下の情報を基に、個別支援計画を作成してください。

【対象児童情報】
名前: ${planData.childName}
年齢: ${planData.age}歳
現在の課題: ${planData.issues}
強み・得意なこと: ${planData.strengths}
保護者の要望: ${planData.parentRequest || 'なし'}

【支援計画フォーマット】
以下の構成で具体的な支援計画を作成してください：

1. アセスメント（現状分析）
2. 短期目標（1-3ヶ月）
   - 具体的な目標を3つ
   - 各目標の評価基準
3. 中期目標（3-6ヶ月）
   - 具体的な目標を3つ
   - 各目標の評価基準
4. 長期目標（1年）
   - 具体的な目標を2つ
   - 各目標の評価基準
5. 支援方法とアプローチ
   - サッカー活動を通じた具体的な支援方法
   - 個別配慮事項
6. 評価と見直しの時期

サッカー療育の特性を活かし、運動面・社会性・認知面のバランスを考慮した計画にしてください。
`;

        return await this.generateContent(prompt);
    }

    // 成長の振り返りを生成
    async generateReview(reviewData) {
        const prompt = `
あなたはサッカー療育の評価・分析の専門家です。以下の情報を基に、成長の振り返りレポートを作成してください。

【評価情報】
対象児童: ${reviewData.childName}
評価期間: ${reviewData.startDate} 〜 ${reviewData.endDate}
設定していた目標: ${reviewData.goals}
期間中の活動: ${reviewData.activities}
観察された変化: ${reviewData.changes}

【振り返りレポートフォーマット】
以下の構成で分析レポートを作成してください：

1. 評価期間の概要
2. 目標達成度の評価
   - 各目標に対する達成度（％）
   - 具体的な達成内容
3. 成長と変化の分析
   - 運動面での成長
   - 社会性・コミュニケーション面での成長
   - 認知・理解面での成長
4. 効果的だった支援方法
5. 今後の課題と改善点
6. 次期目標への提言
7. 保護者へのフィードバック

データに基づいた客観的な評価と、温かみのある励ましのメッセージを含めてください。
`;

        return await this.generateContent(prompt);
    }
}

// グローバルインスタンスを作成
const geminiAPI = new GeminiAPI();