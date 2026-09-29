// Gemini API統合モジュール
class GeminiAPI {
    // サッカーを含まない活動ID（これらのみの記録はサッカーに言及しない）
    static NON_SOCCER_ACTIVITIES = ['event', 'other', 'park', 'craft', 'cooking', 'club'];

    static NON_SOCCER_NOTICE = '【重要】この事業所ではサッカーは行っていません。サッカーに関する内容（練習・プレー・ボール・チームプレー・試合・コーチ等）は一切記載せず、実際に行われた活動と観察された様子のみに基づいて作成してください。';

    constructor() {
        this.apiKey = null;
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
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
    // options.images: [{ mimeType, data(base64) }] を渡すと画像付き（マルチモーダル）で問い合わせる
    async generateContent(prompt, options = {}) {
        if (!this.isInitialized()) {
            throw new Error('APIキーが設定されていません');
        }

        const parts = [];
        (options.images || []).forEach(img => {
            if (img && img.data) {
                parts.push({ inline_data: { mime_type: img.mimeType || 'image/jpeg', data: img.data } });
            }
        });
        parts.push({ text: prompt });

        try {
            const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts
                    }],
                    generationConfig: {
                        temperature: options.temperature !== undefined ? options.temperature : 0.7,
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

        // サッカー系の活動（ウォーミングアップ等）が含まれない場合（イベント/その他のみ）は
        // サッカーに言及しない汎用の療育プロンプトを使用する
        const isNonSoccer = recordData.nonSoccer === true || (Array.isArray(recordData.activities)
            && recordData.activities.length > 0
            && recordData.activities.every(a => GeminiAPI.NON_SOCCER_ACTIVITIES.includes(a)));

        const expertLine = isNonSoccer
            ? 'あなたは児童発達支援・放課後等デイサービスの療育の専門家です。'
            : 'あなたはサッカー療育の専門家です。';

        const domainSection = isNonSoccer ? `【5つの発達領域】
1. 健康・生活：活動への参加を通じて生活リズムの安定や体調管理、基本的な生活習慣の定着につなげます
2. 運動・感覚：活動の中での身体の使い方や感覚の調整、手先の器用さなどを育みます
3. 認知・行動：状況判断力や思考の切り替え、ルールや手順の理解と遵守など、認知機能と適切な行動選択能力を育てます
4. 言語・コミュニケーション：スタッフや友達との意思疎通、指示理解など、言語的・非言語的コミュニケーション能力を高めます
5. 人間関係・社会性：集団活動を通して協調性や役割理解、仲間との関係構築などの社会性を育みます

【重要】この事業所ではサッカーは行っていません。サッカーに関する内容（練習・プレー・ボール・チームプレー等）は一切記載せず、実際に行われた活動内容と観察された様子のみに基づいて記録を作成してください。` : `【5つの発達領域】
1. 健康・生活：定期的な運動習慣を通じて身体的な健康を促進し、生活リズムの安定や体力向上につなげます
2. 運動・感覚：基本的な運動能力やバランス感覚を向上させ、身体の使い方や空間認識能力を育みます
3. 認知・行動：状況判断力や思考の切り替え、ルールの理解と遵守など、認知機能と適切な行動選択能力を育てます
4. 言語・コミュニケーション：チームメイトとの意思疎通やコーチからの指示理解など、言語的・非言語的コミュニケーション能力を高めます
5. 人間関係・社会性：チームプレーを通して協調性や役割理解、仲間との関係構築などの社会性を育みます`;

        const prompt = `
${expertLine}以下の情報を基に、5つの発達領域（健康・生活、運動・感覚、認知・行動、言語・コミュニケーション、人間関係・社会性）の観点から療育活動の記録を作成してください。${supportPlanSection ? '\n\n' + supportPlanSection : ''}

${domainSection}

【入力情報】
日付: ${recordData.date}
対象児童: ${recordData.childName}
活動内容: ${recordData.activityType}${recordData.detailedActivities ? `\n詳細活動: ${recordData.detailedActivities}` : ''}${recordData.goals ? `\n本日の目標項目: ${recordData.goals}` : ''}
観察された様子（スタッフメモ・原文）: ${recordData.observation}
特記事項: ${recordData.notes || 'なし'}

【最重要: 事実ベースで書くこと】
- 記録は「観察された様子（スタッフメモ）」に書かれている事実だけを根拠にしてください
- メモに書かれていない行動・様子・エピソード（例:「静かに話を聞いていた」「友達と笑顔で協力していた」等）を創作・推測して書くことは禁止です
- メモに記載がない領域は、無理に埋めず「本日は特記事項なし」「本日の活動では特に目立った様子は見られませんでした」など、事実の範囲で簡潔に記載してください
- メモの内容は省略せず、書かれている事柄はすべて記録に反映してください（できたこと・課題・気になった行動を含む）
- 「〜と思われます」「〜かもしれません」のような推測を書く場合は、必ずメモ中の事実に基づき、推測であることが分かる表現にしてください
- 特記事項が「特に問題なし」の場合は、活動内容に沿った参加の事実を簡潔に記載し、具体的な行動を捏造しないでください

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

各領域はメモに根拠がある内容だけを記載し${recordData.supportPlan ? '、設定されている支援計画の目標との関連を明確にして、' : '、'}落ち着いた丁寧な文章で保護者にも分かりやすく記述してください。根拠のない領域は短く「特記事項なし」で構いません。
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
   - ${planData.nonSoccer ? '事業所の活動（運動・遊び・制作・集団活動など）を通じた具体的な支援方法' : 'サッカー療育を通じた具体的な支援方法'}${criticalBehaviors.length > 0 ? '（問題行動への対応を含む）' : ''}
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
${planData.nonSoccer ? GeminiAPI.NON_SOCCER_NOTICE : ''}
`;

        return await this.generateContent(prompt);
    }

    // 成長の振り返りを生成
    async generateReview(reviewData) {
        const prompt = `
あなたは${reviewData.nonSoccer ? '児童発達支援・放課後等デイサービスの療育' : 'サッカー療育'}の評価・分析の専門家です。以下の情報を基に、5つの発達領域の観点から成長の振り返りレポートを作成してください。
${reviewData.nonSoccer ? '\n' + GeminiAPI.NON_SOCCER_NOTICE + '\n' : ''}

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

    /**
     * 保護者向け連絡帳文章を生成
     * スタッフのメモを要約＋丁寧語に変換
     * @param {Object} data - { staffNote, childName, activities, date }
     * @returns {Promise<string>} 生成された連絡帳文章
     */
    async generateParentNote(data) {
        const { staffNote, childName, activities, date, nonSoccer } = data;

        const prompt = `
あなたは児童発達支援施設「カラーズFC」のスタッフです。
以下のスタッフメモを、保護者向けの連絡帳に適した丁寧な文章に変換してください。

【児童名】${childName}
【日付】${date}
【活動内容】${activities}
【スタッフメモ】
${staffNote}

【変換ルール】
1. 事業所から保護者への正式な連絡文としてふさわしい、落ち着いた丁寧な文体で書く（「〜しておりました」「〜される様子が見られました」「〜に取り組んでおられました」等）
2. 感嘆符（！）や絵文字は使わない
3. 「〜でしたよ！」「〜ですね！」のような話し言葉・フランクな表現は使わない
4. 「私たちもうれしく思いました」のようなスタッフの感想を主役にした表現は避け、児童の様子・事実を中心に記述する
5. スタッフメモに書かれている内容は省略せず、すべて文章に反映する。メモが長い場合も要約して削らず、段落を分けて丁寧に組み立てる
6. 良かった点だけでなく、本人の課題点・気になった行動・うまくいかなかった場面もメモにあれば必ず伝える。課題は保護者が受け止めやすいよう、事実→スタッフの関わり→今後の見通し（家庭でお願いしたいことがあれば添える）の順で書く
7. メモに書かれていない出来事や様子を創作・推測して付け足さない
8. 専門用語は平易な言葉に置き換える
9. 文字数の上限は設けない。メモの情報量に応じて、内容が十分に伝わる長さ（目安として200〜500文字、メモが多ければそれ以上）で書く。メモが一言程度の場合は無理に膨らませない
10. 活動内容に沿って「何をして、どのような様子だったか」が具体的に分かる文章にする
${nonSoccer ? '11. この事業所ではサッカーは行っていません。サッカー・ボール・チーム練習などの表現は使わず、実際の活動内容に沿って書く' : ''}

【出力形式】
保護者向けの連絡帳文章のみを出力してください。
挨拶文や署名は不要です。
「本日は」から始めてください。
`;

        return await this.generateContent(prompt);
    }

    /**
     * 一括で複数児童の連絡帳文章を生成
     * @param {Array} records - 各児童の記録データの配列
     * @returns {Promise<Array>} 生成された連絡帳文章の配列
     */
    async generateBatchParentNotes(records) {
        const results = [];

        for (const record of records) {
            try {
                const parentNote = await this.generateParentNote({
                    staffNote: record.observation || record.memo,
                    childName: record.childName,
                    activities: record.activityType || record.activities?.join('、') || '',
                    date: record.date,
                    nonSoccer: !!record.nonSoccer
                });
                results.push({
                    childName: record.childName,
                    parentNote,
                    success: true
                });
            } catch (error) {
                console.error(`連絡帳生成エラー (${record.childName}):`, error);
                results.push({
                    childName: record.childName,
                    parentNote: '',
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * 公式様式の専門的支援実施計画を生成
     * @param {Object} data - 児童データとアセスメント結果
     * @returns {Promise<Object>} 計画データ
     */
    async generateOfficialSupportPlan(data) {
        if (!this.isInitialized()) {
            throw new Error('APIキーが設定されていません');
        }

        const prompt = `以下の児童情報とアセスメント結果に基づいて、放課後等デイサービスの専門的支援実施計画を作成してください。

【児童情報】
氏名: ${data.childName}
診断名: ${data.diagnosis || '未記入'}
受給者証番号: ${data.certificateNumber || ''}
支援期間: ${data.supportPeriod || ''}

【アセスメント結果】
${data.assessmentSummary || '詳細なアセスメント結果なし'}

【出力形式】
以下のJSON形式で出力してください。

{
    "assessmentSelf": "本人の意向（サッカーを楽しみたいです等）",
    "assessmentFamily": "家族の意向（感情のコントロールを学んで欲しい等）",
    "supportPolicy": "総合的な支援の方針（300文字程度）",
    "longTermGoal": "長期目標（具体的で達成可能な目標）",
    "shortTermGoal": "短期目標（3ヶ月程度で達成できる目標）",
    "items": [
        {
            "category": "言語やコミュニケーション",
            "goal": "目指すべき達成目標",
            "content": "具体的な支援の内容",
            "method": "実施方法（SSTの実施等）",
            "period": "12か月"
        },
        {
            "category": "認知や行動",
            "goal": "目指すべき達成目標",
            "content": "具体的な支援の内容",
            "method": "実施方法",
            "period": "12か月"
        },
        {
            "category": "運動や感覚",
            "goal": "目指すべき達成目標",
            "content": "具体的な支援の内容",
            "method": "実施方法",
            "period": "12か月"
        }
    ]
}

サッカー療育の文脈で、以下の点を考慮してください：
- サッカーを通じた社会性の発達
- チーム活動における協調性
- 感情コントロールの練習
- 運動機能の向上
- 自己肯定感の向上

JSONのみを出力し、他の説明は不要です。`;

        try {
            const result = await this.generateContent(prompt);
            // JSONを抽出
            let jsonStr = result;
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            }
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Official support plan generation error:', error);
            throw error;
        }
    }

    /**
     * 公式様式の個別支援計画を生成
     * @param {Object} data - 児童データとアセスメント結果
     * @returns {Promise<Object>} 計画データ
     */
    async generateOfficialIndividualPlan(data) {
        if (!this.isInitialized()) {
            throw new Error('APIキーが設定されていません');
        }

        const prompt = `以下の児童情報とアセスメント結果に基づいて、放課後等デイサービスの個別支援計画を作成してください。

【児童情報】
氏名: ${data.childName}
診断名: ${data.diagnosis || '未記入'}
受給者証番号: ${data.certificateNumber || ''}
開始日: ${data.startDate || ''}
有効期限: ${data.endDate || ''}

【アセスメント結果】
${data.assessmentSummary || '詳細なアセスメント結果なし'}

【出力形式】
以下のJSON形式で出力してください。

{
    "intentSelf": "本人の生活に対する意向",
    "intentFamily": "家族の生活に対する意向",
    "supportPolicy": "総合的な支援の方針（300文字程度）",
    "longTermGoal": "長期目標（具体的で達成可能な目標）",
    "shortTermGoal": "短期目標（3ヶ月程度で達成できる目標）",
    "scheduleInfo": "毎週月・金曜日 12:30〜18:00等",
    "selfSupport": [
        {
            "needs": "本人のニーズ（感情を理解する等）",
            "goal": "具体的な達成目標",
            "content": "支援内容（5領域との関連も含む）",
            "period": "6ヶ月",
            "staff": "カラーズFCスタッフ",
            "notes": "留意事項",
            "priority": 1
        },
        {
            "needs": "本人のニーズ2",
            "goal": "具体的な達成目標2",
            "content": "支援内容2",
            "period": "6ヶ月",
            "staff": "カラーズFCスタッフ",
            "notes": "留意事項2",
            "priority": 2
        },
        {
            "needs": "本人のニーズ3",
            "goal": "具体的な達成目標3",
            "content": "支援内容3",
            "period": "6ヶ月",
            "staff": "カラーズFCスタッフ",
            "notes": "留意事項3",
            "priority": 3
        }
    ],
    "familySupport": {
        "needs": "保護者に対する支援のニーズ",
        "goal": "具体的な達成目標",
        "content": "支援内容",
        "period": "6ヶ月",
        "staff": "カラーズFCスタッフ",
        "notes": "留意事項"
    },
    "transitionSupport": {
        "needs": "移行支援のニーズ",
        "goal": "具体的な達成目標",
        "content": "支援内容",
        "period": "6ヶ月",
        "staff": "カラーズFCスタッフ、学校の先生",
        "notes": "留意事項"
    }
}

${data.nonSoccer ? GeminiAPI.NON_SOCCER_NOTICE + '\n事業所で実際に行う活動（運動遊び・制作・調理・公園活動・集団活動など）の文脈で、' : 'サッカー療育の文脈で、'}5領域（認知や行動、言語やコミュニケーション、健康や生活、運動や感覚、人間関係や社会性）との関連を含めてください。

JSONのみを出力し、他の説明は不要です。`;

        try {
            const result = await this.generateContent(prompt);
            // JSONを抽出
            let jsonStr = result;
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            }
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Official individual plan generation error:', error);
            throw error;
        }
    }

    // レスポンスからJSONオブジェクトを抽出
    _extractJson(text) {
        if (!text) throw new Error('AIの応答が空でした');
        let s = text.trim();
        s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
        const match = s.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('AIの応答からJSONを取得できませんでした');
        return JSON.parse(match[0]);
    }

    /**
     * 公式様式（JSON構造）の計画書を修正依頼に基づいて更新
     * @param {Object} planData - 既存の計画データ（selfSupport等を含むJSON）
     * @param {string} refinementRequest - 修正依頼
     * @param {Object} opts - { nonSoccer }
     * @returns {Promise<Object>} 更新後の計画データ（同じキー構成）
     */
    async refineStructuredPlan(planData, refinementRequest, opts = {}) {
        const prompt = `
以下は放課後等デイサービスの個別支援計画のデータ（JSON）です。スタッフからの修正依頼に基づいて内容を修正してください。

【現在の計画データ】
${JSON.stringify(planData, null, 2)}

【スタッフからの修正依頼】
${refinementRequest}

【指示】
- 修正依頼に関係する項目だけを変更し、それ以外の項目は原文のまま維持してください
- キー構成・配列の要素数は変えないでください（値のみ更新）
- 「ー」や空文字列は使用しないでください
- 5領域（健康・生活、運動・感覚、認知・行動、言語・コミュニケーション、人間関係・社会性）の観点は維持してください
${opts.nonSoccer ? '- ' + GeminiAPI.NON_SOCCER_NOTICE : ''}
- 修正後のJSONのみを出力してください（説明文・前置きは不要）
`;
        const result = await this.generateContent(prompt, { temperature: 0.4 });
        return this._extractJson(result);
    }

    // ============================================================
    // 練習メニュー生成（ホワイトボード写真の読み取り / テーマからの生成）
    // ============================================================

    // 練習メニューの共通スタイル指針（既存83枚のホワイトボード・イラストから抽出）
    static PRACTICE_MENU_STYLE = `
【この事業所の練習メニューの型】
- 見出し: 「M/D（曜）」＋テーマ名（かぎ括弧）＋対象レベル（下級/中級/上級、小集団 など）。テーマは技術名だけでなく療育的な能力名（見る・判断、切り替え、空間認知、コミュニケーション、感謝の気持ち 等）
- 構成: W-up（ウォーミングアップ）→ Tr.1（トレーニング1）→ Tr.2（トレーニング2）→ 試合/ゲーム → まとめ・合言葉。1コマ50〜60分（W-up 5〜10分、Tr各10〜20分、試合15〜30分）
- 各セクション: 練習名 / 人数・用具・コーン配置（本数・色・間隔m）/ やり方（①②③の番号）/ ルール / ポイント / 声かけ例（「ナイス」「ドンマイ」「こっち！」等の具体的なセリフ）/ 難易度調整（レベル1〜3、慣れたら〜、出来そうな子はこっち）
- W-up定番: ステップトレーニング（ダッシュ・スキップ・サイドステップ・バックステップ・ケンケン）、ボールフィーリング、ばくだんゲーム、2ゴール鬼ごっこ、色おにタッチ、キックターゲット、リフティング（自己ベスト+1）、だるまさんが転んだ
- Tr定番: 対面パス、四角形パス（A〜D）、ゲート通過ドリブル（色指定）、コーンドリブル、足裏ボールタッチ、トラップ＆シュート、ダイレクトシュート、ワンツーシュート、1対1、2対1（2ゴール）
- 用具: 三角コーン（橙が基本、色指示は赤・青・黄・緑）、皿マーカー、ラダー、ミニハードル、ゲート、ビブス、フットサルゴール（大・ミニ）、笛、ストップウォッチ、色カード
- 療育的配慮: 失敗を許容する声かけ、段階的難易度、学年別ハンデ、視覚・聴覚の合図（色カード・笛）、順番・待機の工夫、5領域との対応、恐怖心の軽減、成功体験
`;

    // イラスト生成用の画風指針
    static ILLUSTRATION_STYLE = `日本の子ども向け教材風のフラットなイラスト。太めの輪郭線、明るいパステル〜原色（緑の芝、青空、橙コーン）。子どもは2〜3頭身で丸顔・笑顔、青シャツ＋白か黒のパンツ。相手役・守備は赤ビブス、GKは緑。コーチは黒ジャージで笛や色カードを持つ。コートは緑の芝を俯瞰し白ライン、白いネット付きゴール。コーンは三角、マーカーは平たい円盤。矢印は実線=走る、点線=パス・シュート、波線=ドリブル。手順は①②③の丸数字、セクションは色付き角丸枠（W-up=橙/黄、Tr.1=青、Tr.2=緑、試合=紫）に白抜きラベル。文字は日本語の太い丸ゴシック体でふりがな付き。飾りはサッカーボール・星・太陽程度。絵文字は使わない。縦長（A4縦、ホワイトボードに貼る掲示用）。`;

    /**
     * ホワイトボード写真から練習メニューを読み取り、構造化する
     * @param {string} base64 - 画像データ（base64、ヘッダなし）
     * @param {string} mimeType
     * @param {string} hints - スタッフの補足（任意）
     */
    async analyzeWhiteboardMenu(base64, mimeType, hints) {
        const prompt = `
あなたはサッカー療育（放課後等デイサービス）の指導者です。添付の画像は、指導者がホワイトボードに手書きした本日の練習メニューです。
画像に書かれている内容をできる限り忠実に読み取り、下記のJSON形式で構造化してください。読み取れない箇所は、この事業所の練習メニューの型に沿って自然に補ってください（補った箇所は各項目の "notes" に「補足」と明記）。
${hints ? `\n【スタッフからの補足】\n${hints}\n` : ''}
${GeminiAPI.PRACTICE_MENU_STYLE}

${GeminiAPI.PRACTICE_MENU_JSON_FORMAT}

JSONのみを出力してください。`;
        const result = await this.generateContent(prompt, { images: [{ mimeType, data: base64 }], temperature: 0.4 });
        return this._extractJson(result);
    }

    /**
     * テーマ・条件から練習メニューを生成する
     * @param {Object} p - { theme, purpose, level, participants, duration, equipment, considerations, date, useWhiteboardImage }
     */
    async generatePracticeMenu(p) {
        const prompt = `
あなたはサッカー療育（放課後等デイサービス）の経験豊富な指導者です。以下の条件に合う本日の練習メニューを、この事業所の型に沿って作成してください。

【条件】
日付: ${p.date || '未定'}
テーマ: ${p.theme || '（テーマ未指定。目的から適切に設定）'}
目的・ねらい: ${p.purpose || '（テーマに沿って設定）'}
対象レベル: ${p.level || '中級'}
参加人数: ${p.participants || '6〜10名'}
時間: ${p.duration || '60分'}
使える用具: ${p.equipment || 'コーン、マーカー、ボール、ミニゴール、ビブス'}
配慮事項（児童の特性など）: ${p.considerations || '特になし'}
${p.reference ? `\n【参考にする既存メニュー】\n${p.reference}\n` : ''}
${GeminiAPI.PRACTICE_MENU_STYLE}

【作成ルール】
- 子どもが見て分かる平易な言葉。専門用語には短い説明を添える
- 各セクションに「声かけ例」と「難易度調整（かんたん/ふつう/むずかしい）」を必ず入れる
- コーンの本数・色・間隔（m）、人の並び方、ボールの流れを具体的に書く（イラスト化できる粒度）
- 5領域（健康・生活、運動・感覚、認知・行動、言語・コミュニケーション、人間関係・社会性）のうち関係するものを各セクションに紐づける
- 絵文字は使わない。個人名は使わない

${GeminiAPI.PRACTICE_MENU_JSON_FORMAT}

JSONのみを出力してください。`;
        const result = await this.generateContent(prompt, { temperature: 0.8 });
        return this._extractJson(result);
    }

    static PRACTICE_MENU_JSON_FORMAT = `【出力形式（JSON）】
{
  "title": "テーマ名（かぎ括弧なし）",
  "date": "M/D（曜）または空文字",
  "level": "下級/中級/上級/小集団 など",
  "purpose": "目的・ねらい（1〜2文）",
  "keyword": "今日の合言葉（短く）",
  "duration": "60分",
  "participants": "6〜10名",
  "equipment": ["コーン（橙）6本", "ボール 人数分", "ミニゴール 2"],
  "sections": [
    {
      "type": "warmup",
      "label": "W-up",
      "name": "練習名",
      "minutes": 10,
      "setup": "コーン配置・人の並び（イラスト化できる具体さで）",
      "steps": ["①〜", "②〜", "③〜"],
      "rules": ["ルール1", "ルール2"],
      "points": ["ポイント1", "ポイント2"],
      "coaching": ["声かけ例1", "声かけ例2"],
      "difficulty": { "easy": "かんたんにする方法", "normal": "基本", "hard": "むずかしくする方法" },
      "domains": ["運動・感覚", "認知・行動"],
      "notes": "補足（任意）"
    },
    { "type": "training1", "label": "Tr.1", "name": "...", "minutes": 15, "setup": "...", "steps": [], "rules": [], "points": [], "coaching": [], "difficulty": {"easy":"","normal":"","hard":""}, "domains": [], "notes": "" },
    { "type": "training2", "label": "Tr.2", "name": "...", "minutes": 15, "setup": "...", "steps": [], "rules": [], "points": [], "coaching": [], "difficulty": {"easy":"","normal":"","hard":""}, "domains": [], "notes": "" },
    { "type": "game", "label": "試合", "name": "...", "minutes": 15, "setup": "...", "steps": [], "rules": [], "points": [], "coaching": [], "difficulty": {"easy":"","normal":"","hard":""}, "domains": [], "notes": "" }
  ],
  "summary": "まとめ・大切なこと（2〜3項目を「/」区切り）",
  "therapeuticNotes": "療育的配慮（待機の工夫、苦手な子へのフォロー、安全面など）"
}`;

    /**
     * 構造化メニューからイラスト生成用プロンプト（日本語）を組み立てる
     * ChatGPT等に貼り付けて画像化できる形にする
     */
    buildIllustrationPrompt(menu) {
        const sec = (menu.sections || []).map((s, i) => {
            const steps = (s.steps || []).join(' ');
            return `${i + 1}. ${s.label || ''}「${s.name || ''}」（${s.minutes || ''}分）: 配置=${s.setup || ''} 手順=${steps} ポイント=${(s.points || []).slice(0, 2).join('、')}`;
        }).join('\n');
        return `次の内容で、放課後等デイサービスのサッカー療育「本日の練習メニュー」ポスターを1枚のイラストにしてください。

【画風】
${GeminiAPI.ILLUSTRATION_STYLE}

【レイアウト】
上部: 「${menu.date || ''}「${menu.title || ''}」${menu.level ? '〈' + menu.level + '〉' : ''}」を大きく。下に「ねらい: ${menu.purpose || ''}」${menu.keyword ? 'と合言葉「' + menu.keyword + '」' : ''}。
本文: 以下のセクションを上から順に、色付き角丸枠＋白抜きラベルで並べる。各セクションは左にコート俯瞰図（コーン配置・人・矢印）、右にやり方①②③とポイントの箇条書き。
${sec}
最下部: 帯で「${menu.summary || ''}」。

【文字の注意】
文字はすべて日本語で正確に描く（誤字・崩れ・意味不明な文字列は不可）。漢字にはふりがな。絵文字は使わない。個人名は入れない。`;
    }
}

// グローバルインスタンスを作成
const geminiAPI = new GeminiAPI();