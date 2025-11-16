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
        // 支援計画データがある場合は目標達成度を評価するセクションを追加
        let supportPlanSection = '';
        if (recordData.supportPlan) {
            const plan = recordData.supportPlan;
            supportPlanSection = `

【設定されている支援計画】
児童名: ${plan.childName}
年齢: ${plan.age}歳
優先課題領域: ${plan.priorityArea || '記載なし'}
現在の課題: ${plan.issues || '記載なし'}
強み: ${plan.strengths || '記載なし'}

【重要】この支援計画の目標と照らし合わせて、今回の活動が目標達成に向けて進んでいるか、以下の観点で評価してください：
1. 設定された課題に対する進捗状況
2. 優先課題領域における成長の兆し
3. 強みを活かせた場面
4. 支援計画の目標達成に向けた具体的な前進`;
        }

        const prompt = `
あなたはサッカー療育の専門家です。以下の情報を基に、5つの発達領域（健康・生活、運動・感覚、認知・行動、言語・コミュニケーション、人間関係・社会性）の観点から療育活動の記録を作成してください。${supportPlanSection ? '\n\n' + supportPlanSection : ''}

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
3. 本日の成長ポイント${recordData.supportPlan ? '\n4. 支援計画の目標に対する達成度評価\n   - 設定された課題への進捗\n   - 優先課題領域における成長\n   - 次回に向けた支援のポイント\n5. 次回への課題と目標' : '\n4. 次回への課題と目標'}

各領域について具体的な観察内容を記載し${recordData.supportPlan ? '、設定されている支援計画の目標との関連を明確にして、' : '、'}温かみのある文章で保護者にも分かりやすく記述してください。
`;

        return await this.generateContent(prompt);
    }

    // 支援計画を生成
    async generateSupportPlan(planData) {
        const priorityAreaText = planData.priorityArea ? `
優先課題領域: ${planData.priorityArea}` : '';

        // アセスメントデータから問題行動を分析
        let problemBehaviorAnalysis = '';
        let criticalBehaviors = [];

        if (planData.assessmentData) {
            const assessment = planData.assessmentData;

            // C評価（重度）の問題行動を特定
            if (assessment.flexibility === 'C') {
                criticalBehaviors.push('予定変更やいつもと違う状況に対する強い抵抗・パニック（柔軟性の困難）');
                if (assessment.persistence) {
                    criticalBehaviors.push(`こだわりの具体例: ${assessment.persistence}`);
                }
            }

            if (assessment.panic === 'C') {
                criticalBehaviors.push('感情のコントロール困難・パニックが頻繁に発生');
                if (assessment.panicDetails) {
                    criticalBehaviors.push(`パニックの詳細: ${assessment.panicDetails}`);
                }
            }

            if (assessment.aggression === 'C') {
                criticalBehaviors.push('思い通りにならない時の暴言・暴力が頻繁に発生');
                if (assessment.aggressionDetails) {
                    criticalBehaviors.push(`暴言暴力の詳細: ${assessment.aggressionDetails}`);
                }
            }

            if (assessment.instructionAcceptance === 'C') {
                criticalBehaviors.push('指示の受け入れ拒否・抵抗が多い');
                if (assessment.instructionDetails) {
                    criticalBehaviors.push(`指示受け入れの詳細: ${assessment.instructionDetails}`);
                }
            }

            if (assessment.concentration === 'C') {
                criticalBehaviors.push('集中力維持が非常に困難');
            }

            if (assessment.hyperactivity === 'C') {
                criticalBehaviors.push('多動性が顕著・座っていられない');
            }

            if (assessment.impulsivity === 'C') {
                criticalBehaviors.push('衝動性が高い・行動抑制が非常に困難');
            }

            // 問題行動分析セクションを作成
            if (criticalBehaviors.length > 0) {
                problemBehaviorAnalysis = `

【重要：優先的に対処すべき問題行動】
アセスメント結果より、以下の問題行動が「C」評価（重度）として特定されており、最優先で対処が必要です：
${criticalBehaviors.map((b, i) => `${i + 1}. ${b}`).join('\n')}

これらの問題行動は、本人の安全、周囲との関係構築、学習・療育活動への参加に重大な影響を及ぼします。
支援計画では、これらの問題行動への対応を最優先課題として位置づけ、具体的な介入方法を明確に示してください。`;
            }

            // その他のアセスメント情報も追加
            let additionalInfo = [];
            if (assessment.diagnosis && assessment.diagnosis.length > 0) {
                additionalInfo.push(`診断名: ${Array.isArray(assessment.diagnosis) ? assessment.diagnosis.join('、') : assessment.diagnosis}`);
            }
            if (assessment.situationUnderstanding) {
                additionalInfo.push(`場面や指示の理解: ${assessment.situationUnderstanding}評価`);
            }
            if (assessment.empathy) {
                additionalInfo.push(`共感性: ${assessment.empathy}評価`);
            }
            if (assessment.socialRules) {
                additionalInfo.push(`社会的ルールの理解: ${assessment.socialRules}評価`);
            }

            if (additionalInfo.length > 0) {
                problemBehaviorAnalysis += `

【その他のアセスメント情報】
${additionalInfo.join('\n')}`;
            }
        }

        const prompt = `
あなたはサッカー療育の支援計画作成の専門家です。以下の情報を基に、5つの発達領域を踏まえた個別支援計画を作成してください。
${problemBehaviorAnalysis}

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

${criticalBehaviors.length > 0 ? `1. **最優先課題：問題行動への介入計画**
   上記で特定された問題行動それぞれに対して：
   - 問題行動の機能分析（なぜその行動が起こるのか）
   - 具体的な予防策（先行事象への介入）
   - 問題行動発生時の対処法
   - 代替行動の教示方法
   - 成功体験を積むための環境調整
   - 評価指標（頻度・強度の測定方法）

2. ` : '1. '}5つの発達領域からのアセスメント
   各領域について現状を分析し、特に優先課題領域を詳しく記載

${criticalBehaviors.length > 0 ? '3. ' : '2. '}個別支援計画の優先順位
   最優先課題: ${criticalBehaviors.length > 0 ? '上記問題行動への対応' : planData.priorityArea || '5領域から最も気になる領域を選定'}
   その理由と本人に合わせた目標設定

${criticalBehaviors.length > 0 ? '4. ' : '3. '}短期目標（1-3ヶ月）
   ${criticalBehaviors.length > 0 ? '問題行動の軽減を最優先としつつ、' : ''}5領域それぞれの具体的な目標と評価基準

${criticalBehaviors.length > 0 ? '5. ' : '4. '}中期目標（3-6ヶ月）
   ${criticalBehaviors.length > 0 ? '問題行動の改善を踏まえた' : ''}5領域それぞれの具体的な目標と評価基準

${criticalBehaviors.length > 0 ? '6. ' : '5. '}長期目標（1年）
   5領域を統合した総合的な目標

${criticalBehaviors.length > 0 ? '7. ' : '6. '}専門的支援実施計画
   - サッカー療育を通じた具体的な支援方法${criticalBehaviors.length > 0 ? '（問題行動への対応を含む）' : ''}
   - 各領域に対する専門的アプローチ
   - 個別配慮事項
   ${criticalBehaviors.length > 0 ? '- 問題行動予防のための環境設定\n   - クールダウンの方法と場所' : ''}

${criticalBehaviors.length > 0 ? '8. ' : '7. '}家族支援計画
   - 支援者と家族の一貫した支援体制の構築${criticalBehaviors.length > 0 ? '（問題行動への対応方法の共有）' : ''}
   - 家庭での取り組み提案
   - 家族の負担軽減策

${criticalBehaviors.length > 0 ? '9. ' : '8. '}移行支援計画
   - 進学や環境変化への準備
   - 新しい環境での適応支援
   - 引き継ぎ事項

${criticalBehaviors.length > 0 ? '10. ' : '9. '}評価と見直しの時期

${criticalBehaviors.length > 0 ? '**重要**: 問題行動への対応を最優先としながらも、5領域のバランスを考慮した実践的な計画を作成してください。問題行動の軽減が、他の領域の成長にもつながることを意識してください。' : '5領域のバランスを考慮しつつ、優先課題を中心とした実践的な計画を作成してください。'}
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