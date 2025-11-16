// Gemini API統合モジュール
class GeminiAPI {
    constructor() {
        this.apiKey = null;
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
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
                        maxOutputTokens: 8192,
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
あなたはサッカー療育の専門家です。以下の情報を基に、5つの発達領域（健康・生活、運動・感覚、認知・行動、言語・コミュニケーション、人間関係・社会性）の観点から療育活動の記録を作成してください。

【5つの発達領域】
1. 健康・生活：定期的な運動習慣を通じて身体的な健康を促進し、生活リズムの安定や体力向上につなげます
2. 運動・感覚：基本的な運動能力やバランス感覚を向上させ、身体の使い方や空間認識能力を育みます
3. 認知・行動：状況判断力や思考の切り替え、ルールの理解と遵守など、認知機能と適切な行動選択能力を育てます
4. 言語・コミュニケーション：チームメイトとの意思疎通やコーチからの指示理解など、言語的・非言語的コミュニケーション能力を高めます
5. 人間関係・社会性：チームプレーを通して協調性や役割理解、仲間との関係構築などの社会性を育みます

【入力情報】
日付: ${recordData.date}
対象児童: ${recordData.childName}
活動内容: ${recordData.activityType}
観察された様子: ${recordData.observation}
特記事項: ${recordData.notes || 'なし'}

【記録フォーマット】
以下の形式で、5つの発達領域に結びつけた記録を作成してください：

1. 活動の概要
2. 5つの発達領域からの評価
   【健康・生活】活動への参加状況、体力面の様子
   【運動・感覚】運動能力、身体の使い方、バランス感覚などの様子
   【認知・行動】ルール理解、状況判断、思考の切り替えなどの様子
   【言語・コミュニケーション】指示理解、意思疎通の様子
   【人間関係・社会性】仲間との関わり、協調性の様子
3. 本日の成長ポイント
4. 次回への課題と目標

各領域について具体的な観察内容を記載し、温かみのある文章で保護者にも分かりやすく記述してください。
`;

        return await this.generateContent(prompt);
    }

    // 支援計画を生成
    async generateSupportPlan(planData) {
        const priorityAreaText = planData.priorityArea ? `
優先課題領域: ${planData.priorityArea}` : '';

        const prompt = `
あなたはサッカー療育の支援計画作成の専門家です。以下の情報を基に、5つの発達領域を踏まえた個別支援計画を作成してください。

【5つの発達領域】
1. 健康・生活：定期的な運動習慣を通じて身体的な健康を促進し、生活リズムの安定や体力向上につなげます
2. 運動・感覚：基本的な運動能力やバランス感覚を向上させ、身体の使い方や空間認識能力を育みます
3. 認知・行動：状況判断力や思考の切り替え、ルールの理解と遵守など、認知機能と適切な行動選択能力を育てます
4. 言語・コミュニケーション：チームメイトとの意思疎通やコーチからの指示理解など、言語的・非言語的コミュニケーション能力を高めます
5. 人間関係・社会性：チームプレーを通して協調性や役割理解、仲間との関係構築などの社会性を育みます

【対象児童情報】
名前: ${planData.childName}
年齢: ${planData.age}歳
現在の課題: ${planData.issues}
強み・得意なこと: ${planData.strengths}
保護者の要望: ${planData.parentRequest || 'なし'}${priorityAreaText}

【支援計画フォーマット】
以下の構成で具体的な支援計画を作成してください：

1. 5つの発達領域からのアセスメント
   各領域について現状を分析し、特に優先課題領域を詳しく記載

2. 個別支援計画の優先順位
   最優先課題: ${planData.priorityArea || '5領域から最も気になる領域を選定'}
   その理由と本人に合わせた目標設定

3. 短期目標（1-3ヶ月）
   5領域それぞれの具体的な目標と評価基準

4. 中期目標（3-6ヶ月）
   5領域それぞれの具体的な目標と評価基準

5. 長期目標（1年）
   5領域を統合した総合的な目標

6. 専門的支援実施計画
   - サッカー療育を通じた具体的な支援方法
   - 各領域に対する専門的アプローチ
   - 個別配慮事項

7. 家族支援計画
   - 支援者と家族の一貫した支援体制の構築
   - 家庭での取り組み提案
   - 家族の負担軽減策

8. 移行支援計画
   - 進学や環境変化への準備
   - 新しい環境での適応支援
   - 引き継ぎ事項

9. 評価と見直しの時期

5領域のバランスを考慮しつつ、優先課題を中心とした実践的な計画を作成してください。
`;

        return await this.generateContent(prompt);
    }

    // 成長の振り返りを生成
    async generateReview(reviewData) {
        const prompt = `
あなたはサッカー療育の評価・分析の専門家です。以下の情報を基に、5つの発達領域の観点から成長の振り返りレポートを作成してください。

【5つの発達領域】
1. 健康・生活：定期的な運動習慣を通じて身体的な健康を促進し、生活リズムの安定や体力向上につなげます
2. 運動・感覚：基本的な運動能力やバランス感覚を向上させ、身体の使い方や空間認識能力を育みます
3. 認知・行動：状況判断力や思考の切り替え、ルールの理解と遵守など、認知機能と適切な行動選択能力を育てます
4. 言語・コミュニケーション：チームメイトとの意思疎通やコーチからの指示理解など、言語的・非言語的コミュニケーション能力を高めます
5. 人間関係・社会性：チームプレーを通して協調性や役割理解、仲間との関係構築などの社会性を育みます

【評価情報】
対象児童: ${reviewData.childName}
評価期間: ${reviewData.startDate} 〜 ${reviewData.endDate}
設定していた目標: ${reviewData.goals}
期間中の活動: ${reviewData.activities}
観察された変化: ${reviewData.changes}

【振り返りレポートフォーマット】
以下の構成で5つの発達領域に基づいた分析レポートを作成してください：

1. 評価期間の概要

2. 目標達成度の総合評価
   - 各目標に対する達成度（％）
   - 具体的な達成内容

3. 5つの発達領域からの成長分析
   【健康・生活】
   - 期間中の成長と変化
   - 達成度評価

   【運動・感覚】
   - 期間中の成長と変化
   - 達成度評価

   【認知・行動】
   - 期間中の成長と変化
   - 達成度評価

   【言語・コミュニケーション】
   - 期間中の成長と変化
   - 達成度評価

   【人間関係・社会性】
   - 期間中の成長と変化
   - 達成度評価

4. 効果的だった支援方法
   各領域で効果的だった取り組み

5. 今後の課題と改善点
   各領域における課題

6. 次期目標への提言
   5領域を踏まえた今後の方向性

7. 保護者へのフィードバック
   温かみのある励ましとアドバイス

データに基づいた客観的な評価と、各領域の具体的な成長を記載してください。
`;

        return await this.generateContent(prompt);
    }

    // コンテンツの修正を依頼
    async refineContent(originalContent, refinementRequest, contentType) {
        const typeLabels = {
            'record': '活動記録',
            'plan': '支援計画',
            'review': '振り返りレポート'
        };

        const prompt = `
以下は既に生成された${typeLabels[contentType]}です。ユーザーからの修正・追加要望に基づいて、内容を改善してください。

【現在の${typeLabels[contentType]}】
${originalContent}

【ユーザーからの修正・追加要望】
${refinementRequest}

【指示】
- 元の${typeLabels[contentType]}の良い部分は残しながら、ユーザーの要望を反映してください
- 5つの発達領域（健康・生活、運動・感覚、認知・行動、言語・コミュニケーション、人間関係・社会性）の観点を維持してください
- 全体の構成とフォーマットは元の形式を踏襲してください
- 修正後の${typeLabels[contentType]}のみを出力してください（説明や前置きは不要です）
`;

        return await this.generateContent(prompt);
    }
}

// グローバルインスタンスを作成
const geminiAPI = new GeminiAPI();