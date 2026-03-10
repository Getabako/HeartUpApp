// Remove import as it's causing issues - we don't need Gemini API for this form

/**
 * HTMLコンテンツからPDFを生成（アセスメント用）
 * @param {string} htmlContent - 完全なHTMLドキュメント
 * @param {string} fileName - ファイル名（拡張子なし）
 * @returns {Promise<Blob>} PDFのBlob
 */
async function generateAssessmentPDF(htmlContent, fileName) {
    // 印刷ボタンを除去したHTMLを作成
    let cleanHTML = htmlContent.replace(/<button[^>]*class="print-button"[^>]*>.*?<\/button>/gi, '');
    cleanHTML = cleanHTML.replace(/<button[^>]*onclick="window\.print\(\)"[^>]*>.*?<\/button>/gi, '');

    // 一時的なdivを作成
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanHTML;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '210mm';  // A4幅
    document.body.appendChild(tempDiv);

    // レンダリングを待つ
    await new Promise(resolve => setTimeout(resolve, 500));

    // PDF生成オプション
    const opt = {
        margin: 10,
        filename: `${fileName}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: true,  // デバッグ用
            allowTaint: true,
            backgroundColor: '#ffffff',
            windowWidth: 800
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        }
    };

    try {
        // PDFをBlobとして生成
        const pdfBlob = await html2pdf().set(opt).from(tempDiv).outputPdf('blob');

        // 一時divを削除
        document.body.removeChild(tempDiv);

        return pdfBlob;
    } catch (error) {
        document.body.removeChild(tempDiv);
        console.error('PDF生成エラー:', error);
        throw error;
    }
}

// 優先課題領域のバリデーション
function validatePriorityRanking() {
    const selects = [
        document.getElementById('priority_cognitive'),
        document.getElementById('priority_language'),
        document.getElementById('priority_health'),
        document.getElementById('priority_motor'),
        document.getElementById('priority_social')
    ];
    const errorEl = document.getElementById('priorityError');

    // 全て未選択の場合はOK（任意項目として扱う）
    const selectedValues = selects.map(s => s ? s.value : '').filter(v => v !== '');
    if (selectedValues.length === 0) {
        if (errorEl) errorEl.style.display = 'none';
        selects.forEach(s => { if (s) s.closest('.priority-item')?.classList.remove('error'); });
        return true;
    }

    // 一部選択されている場合は全て選択が必要
    if (selectedValues.length < 5) {
        if (errorEl) {
            errorEl.textContent = 'すべての領域に順位を付けてください。';
            errorEl.style.display = 'block';
        }
        return false;
    }

    // 重複チェック
    const duplicates = selectedValues.filter((v, i) => selectedValues.indexOf(v) !== i);
    if (duplicates.length > 0) {
        if (errorEl) {
            errorEl.textContent = `順位が重複しています。各領域に異なる順位を付けてください。`;
            errorEl.style.display = 'block';
        }
        // 重複しているselectにエラースタイル
        const counts = {};
        selectedValues.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
        selects.forEach(s => {
            if (s && counts[s.value] > 1) {
                s.closest('.priority-item')?.classList.add('error');
            } else if (s) {
                s.closest('.priority-item')?.classList.remove('error');
            }
        });
        return false;
    }

    if (errorEl) errorEl.style.display = 'none';
    selects.forEach(s => { if (s) s.closest('.priority-item')?.classList.remove('error'); });
    return true;
}

// DOMContentLoaded でイベントリスナーを登録
document.addEventListener('DOMContentLoaded', function() {
    // 順位selectにchangeイベントリスナーを追加
    const prioritySelects = document.querySelectorAll('.priority-item select');
    prioritySelects.forEach(select => {
        select.addEventListener('change', validatePriorityRanking);
    });

    // フォーム送信ハンドラ
    const assessmentForm = document.getElementById('assessmentForm');
    if (!assessmentForm) {
        console.error('assessmentForm が見つかりません');
        return;
    }

    assessmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleAssessmentSubmit(e).catch(function(error) {
            console.error('フォーム送信エラー:', error);
            alert('エラーが発生しました: ' + error.message);
            const btn = e.target.querySelector('button[type="submit"]');
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'アセスメントシートを作成';
            }
        });
    });
});

async function handleAssessmentSubmit(e) {
    // Show loading message
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : '';
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = '処理中...';
    }

    // 優先課題領域のバリデーション
    if (!validatePriorityRanking()) {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
        document.getElementById('priorityError')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    try {
        // Collect form data
        const formData = new FormData(e.target);
        const data = {};

        for (let [key, value] of formData.entries()) {
            // Handle multiple checkboxes (diagnosis checkboxes only)
            if (key === 'diagnosis') {
                if (!data[key]) {
                    data[key] = [];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }

        // Combine diagnosis checkboxes and other input
        if (Array.isArray(data.diagnosis)) {
            const diagnosisList = [...data.diagnosis];
            if (data.diagnosisOther && data.diagnosisOther.trim()) {
                diagnosisList.push(data.diagnosisOther);
            }
            data.diagnosis = diagnosisList.join('、');
        } else if (data.diagnosisOther && data.diagnosisOther.trim()) {
            data.diagnosis = data.diagnosisOther;
        } else {
            data.diagnosis = data.diagnosis || 'なし';
        }

        // 優先課題領域の順位データを収集
        const priorityFields = {
            cognitive: { id: 'priority_cognitive', label: '認知や行動' },
            language: { id: 'priority_language', label: '言語やコミュニケーション' },
            health: { id: 'priority_health', label: '健康や生活' },
            motor: { id: 'priority_motor', label: '運動や感覚' },
            social: { id: 'priority_social', label: '人間関係や社会性' }
        };
        data.priorityRanking = {};
        Object.entries(priorityFields).forEach(([key, field]) => {
            const el = document.getElementById(field.id);
            data.priorityRanking[key] = {
                rank: el ? (parseInt(el.value) || 0) : 0,
                label: field.label
            };
        });
        // ソート済み配列を作成（1位から順に）
        data.sortedPriorities = Object.values(data.priorityRanking)
            .filter(p => p.rank > 0)
            .sort((a, b) => a.rank - b.rank);

        // Add rating data (will be filled in assessment sheet generation)
        data.ratings = calculateRatings(data);

        // Generate assessment sheet HTML
        const assessmentHTML = await generateAssessmentSheet(data);

        // Save assessment sheet locally
        const fileName = `${data.childName}_アセスメントシート.html`;
        await saveAssessmentSheet(fileName, assessmentHTML, data);

        // AIによる支援計画自動生成
        let planResult = null;
        try {
            if (submitButton) submitButton.textContent = 'AIが支援計画を自動生成中...';
            planResult = await autoGeneratePlans(data);
        } catch (planError) {
            console.error('計画書自動生成エラー:', planError);
        }

        // Show success message
        let successMessage = `アセスメントシートが作成されました！\n\nファイル名: ${fileName}\nローカルに保存されました。`;

        if (planResult && planResult.success) {
            successMessage += `\n\nAIによる支援計画を自動生成しました！`;
        }

        successMessage += `\n\nこのメッセージを閉じるとアセスメント管理画面に移動します。`;

        alert(successMessage);

        // Redirect to assessment manager
        window.location.href = '../assessment-manager.html';
    } catch (error) {
        console.error('Error creating assessment sheet:', error);
        alert(`エラーが発生しました: ${error.message}`);
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }
}

function calculateRatings(data) {
    // Convert form responses to ratings (○, △, ×)
    const ratings = {};

    // Helper function to convert A/B/C to symbols
    function convertToSymbol(value) {
        if (value === 'A') return '○';
        if (value === 'B') return '△';
        if (value === 'C') return '×';
        return '';
    }

    // Interpersonal/Social
    ratings.situationUnderstanding = convertToSymbol(data.situationUnderstanding);
    ratings.empathy = convertToSymbol(data.empathy);
    ratings.socialRules = convertToSymbol(data.socialRules);
    ratings.ethics = convertToSymbol(data.ethics);
    ratings.communication = convertToSymbol(data.communication);
    ratings.flexibility = convertToSymbol(data.flexibility);

    // Behavior/Emotional
    ratings.instructionAcceptance = convertToSymbol(data.instructionAcceptance);
    ratings.concentration = convertToSymbol(data.concentration);
    ratings.hyperactivity = convertToSymbol(data.hyperactivity);
    ratings.impulsivity = convertToSymbol(data.impulsivity);
    ratings.apathy = data.apathy === 'A' ? '○' : (data.apathy === 'B' ? '△' : '×');
    ratings.panic = convertToSymbol(data.panic);
    ratings.aggression = convertToSymbol(data.aggression);
    ratings.psychosomatic = data.psychosomatic === 'A' ? '○' : (data.psychosomatic === 'B' ? '△' : '×');

    // Physical/Motor
    ratings.grossMotor = convertToSymbol(data.grossMotor);
    ratings.fineMotor = convertToSymbol(data.fineMotor);
    ratings.balance = convertToSymbol(data.balance);

    // Other
    ratings.dailyLiving = convertToSymbol(data.dailyLiving);
    ratings.schoolRefusal = convertToSymbol(data.schoolRefusal);

    return ratings;
}

async function generateAssessmentSheet(data) {
    const template = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.childName} アセスメントシート</title>
    <style>
        body {
            font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif;
            padding: 40px;
            background-color: #f5f5f5;
        }
        .assessment-sheet {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2e7d32;
        }
        .header h1 {
            color: #2e7d32;
            font-size: 28px;
            margin-bottom: 10px;
        }
        .basic-info {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 8px;
        }
        .info-item {
            display: flex;
            gap: 10px;
        }
        .info-label {
            font-weight: bold;
            color: #2e7d32;
            min-width: 120px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #4caf50;
            color: white;
            font-weight: bold;
        }
        .category-header {
            background-color: #e8f5e9;
            font-weight: bold;
            color: #2e7d32;
        }
        .rating {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
        }
        .rating-good { color: #4caf50; }
        .rating-fair { color: #ff9800; }
        .rating-poor { color: #f44336; }
        .details {
            font-size: 14px;
            color: #555;
            line-height: 1.6;
        }
        .print-button {
            display: block;
            margin: 20px auto;
            padding: 12px 30px;
            background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
            color: white;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
        }
        @media print {
            .print-button { display: none; }
            body { 
                padding: 0; 
                margin: 0;
                background: white; 
            }
            .assessment-sheet {
                max-width: 100%;
                margin: 0;
                padding: 20px;
                box-shadow: none;
            }
            table {
                page-break-inside: auto;
            }
            tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
            thead {
                display: table-header-group;
            }
            .header, .basic-info, .category-header {
                page-break-after: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="assessment-sheet">
        <div class="header">
            <h1>カラーズFC 特性シート①</h1>
        </div>

        <div class="basic-info">
            <div class="info-item">
                <span class="info-label">児童名:</span>
                <span>${data.childName}</span>
            </div>
            <div class="info-item">
                <span class="info-label">ふりがな:</span>
                <span>${data.childNameKana}</span>
            </div>
            <div class="info-item">
                <span class="info-label">生年月日:</span>
                <span>${data.birthDate}</span>
            </div>
            <div class="info-item">
                <span class="info-label">性別:</span>
                <span>${data.gender || '未回答'}</span>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
                <span class="info-label">診断名:</span>
                <span>${data.diagnosis || 'なし'}</span>
            </div>
        </div>

        <p style="font-size: 12px; color: #666; margin-bottom: 20px;">※各種心理・WISC検査結果を別紙でご提出お願い致します。</p>

        <table>
            <thead>
                <tr>
                    <th style="width: 30%;">評価項目</th>
                    <th style="width: 50%;">課題・実態・具体的エピソード</th>
                    <th style="width: 20%;">支援・配慮</th>
                </tr>
            </thead>
            <tbody>
                <!-- 対人社会性 -->
                <tr class="category-header">
                    <td colspan="3">対人社会性</td>
                </tr>
                <tr>
                    <td>場面や指示の理解</td>
                    <td class="details">${data.situationEpisode || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.situationUnderstanding)}">${data.ratings.situationUnderstanding}</td>
                </tr>
                <tr>
                    <td>人の気持ち、心の理解（共感性）</td>
                    <td class="details">${data.empathyEpisode || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.empathy)}">${data.ratings.empathy}</td>
                </tr>
                <tr>
                    <td>常識・社会的ルール（協調性）</td>
                    <td class="details">${data.cooperation || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.socialRules)}">${data.ratings.socialRules}</td>
                </tr>
                <tr>
                    <td>善悪の判断（価値意識）</td>
                    <td class="details">${data.ethicsReaction || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.ethics)}">${data.ratings.ethics}</td>
                </tr>
                <tr>
                    <td>対人・コミュニケーション力</td>
                    <td class="details">${data.communicationDetails || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.communication)}">${data.ratings.communication}</td>
                </tr>
                <tr>
                    <td>柔軟な対処の困難（こだわり）</td>
                    <td class="details">${data.persistence || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.flexibility)}">${data.ratings.flexibility}</td>
                </tr>
                <tr>
                    <td>その他</td>
                    <td class="details">${data.socialOther || '特記事項なし'}</td>
                    <td></td>
                </tr>

                <!-- 行動情緒 -->
                <tr class="category-header">
                    <td colspan="3">行動情緒</td>
                </tr>
                <tr>
                    <td>指示の受け入れ</td>
                    <td class="details">${data.instructionDetails || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.instructionAcceptance)}">${data.ratings.instructionAcceptance}</td>
                </tr>
                <tr>
                    <td>不注意・集中困難</td>
                    <td class="details">${data.concentrationDetails || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.concentration)}">${data.ratings.concentration}</td>
                </tr>
                <tr>
                    <td>多動性</td>
                    <td class="details">${data.hyperactivityDetails || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.hyperactivity)}">${data.ratings.hyperactivity}</td>
                </tr>
                <tr>
                    <td>衝動性</td>
                    <td class="details">${data.impulsivityDetails || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.impulsivity)}">${data.ratings.impulsivity}</td>
                </tr>
                <tr>
                    <td>寡動性・無気力・ぼんやり</td>
                    <td class="details">${data.apathyDetails || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.apathy)}">${data.ratings.apathy}</td>
                </tr>
                <tr>
                    <td>パニック（興奮・コントロール困難）</td>
                    <td class="details">${data.panicDetails || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.panic)}">${data.ratings.panic}</td>
                </tr>
                <tr>
                    <td>暴言・暴力</td>
                    <td class="details">${data.aggressionDetails || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.aggression)}">${data.ratings.aggression}</td>
                </tr>
                <tr>
                    <td>心因反応（心理社会的要因）</td>
                    <td class="details">${data.psychosomaticDetails || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.psychosomatic)}">${data.ratings.psychosomatic}</td>
                </tr>
                <tr>
                    <td>その他</td>
                    <td class="details">${data.behaviorOther || '特記事項なし'}</td>
                    <td></td>
                </tr>

                <!-- 身体運動 -->
                <tr class="category-header">
                    <td colspan="3">身体運動</td>
                </tr>
                <tr>
                    <td>身体・健康</td>
                    <td class="details">${data.physicalOther || '特記事項なし'}</td>
                    <td></td>
                </tr>
                <tr>
                    <td>粗大運動（全身、協応・筋力）</td>
                    <td class="details">${data.grossMotorDetails || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.grossMotor)}">${data.ratings.grossMotor}</td>
                </tr>
                <tr>
                    <td>微細運動（手指、足趾の巧緻性）</td>
                    <td class="details">${data.fineMotorDetails || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.fineMotor)}">${data.ratings.fineMotor}</td>
                </tr>
                <tr>
                    <td>バランス運動</td>
                    <td class="details">${data.balanceDetails || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.balance)}">${data.ratings.balance}</td>
                </tr>
                <tr>
                    <td>その他（別紙機能評価）</td>
                    <td class="details"></td>
                    <td></td>
                </tr>

                <!-- その他 -->
                <tr class="category-header">
                    <td colspan="3">その他</td>
                </tr>
                <tr>
                    <td>生活習慣・身辺自立</td>
                    <td class="details">${data.dailyLivingDetails || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.dailyLiving)}">${data.ratings.dailyLiving}</td>
                </tr>
                <tr>
                    <td>家庭での教育・養育配慮</td>
                    <td class="details">${data.familySupport || '特記事項なし'}</td>
                    <td></td>
                </tr>
                <tr>
                    <td>登校しぶり</td>
                    <td class="details">${data.schoolRefusalDetails || '特記事項なし'}</td>
                    <td class="rating rating-${getRatingClass(data.ratings.schoolRefusal)}">${data.ratings.schoolRefusal}</td>
                </tr>
                <tr>
                    <td>その他</td>
                    <td class="details">${data.overallOther || '特記事項なし'}</td>
                    <td></td>
                </tr>

                <!-- 保護者の希望・本人の強みと課題 -->
                <tr class="category-header">
                    <td colspan="3">保護者の希望・本人の強みと課題</td>
                </tr>
                <tr>
                    <td>保護者の希望</td>
                    <td class="details">${data.guardianWishes || '特記事項なし'}</td>
                    <td></td>
                </tr>
                <tr>
                    <td>本人の強み</td>
                    <td class="details">${data.childStrengths || '特記事項なし'}</td>
                    <td></td>
                </tr>
                <tr>
                    <td>本人の課題</td>
                    <td class="details">${data.childChallenges || '特記事項なし'}</td>
                    <td></td>
                </tr>

                <!-- 優先課題領域 -->
                ${data.sortedPriorities && data.sortedPriorities.length > 0 ? `
                <tr class="category-header">
                    <td colspan="3">優先課題領域（保護者評価）</td>
                </tr>
                ${data.sortedPriorities.map(p => `
                <tr>
                    <td>${p.rank}位: ${p.label}</td>
                    <td class="details"></td>
                    <td></td>
                </tr>
                `).join('')}
                ` : ''}
            </tbody>
        </table>

        <p style="font-size: 12px; color: #666;">※プラス評価○、普通○、弱い部分△で表示</p>

        <button class="print-button" onclick="window.print()">印刷する</button>
    </div>
</body>
</html>
`;

    return template;
}

function getRatingClass(rating) {
    if (rating === '○') return 'good';
    if (rating === '△') return 'fair';
    if (rating === '×') return 'poor';
    return '';
}

async function saveAssessmentSheet(fileName, html, data) {
    try {
        // Save to localStorage
        const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
        assessments[fileName] = {
            html: html,
            data: data,
            createdAt: new Date().toISOString(),
            filePath: `temp/assessmentSheet/${fileName}`
        };
        localStorage.setItem('assessments', JSON.stringify(assessments));

        // 児童一覧にも追加（端末間同期用）
        if (data.childName) {
            const children = JSON.parse(localStorage.getItem('children') || '{}');
            if (!children[data.childName]) {
                children[data.childName] = { createdAt: new Date().toISOString() };
                localStorage.setItem('children', JSON.stringify(children));
            }
        }

        // Create downloadable file
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Also save JSON metadata
        const metadata = {
            fileName,
            data,
            createdAt: new Date().toISOString(),
            filePath: `temp/assessmentSheet/${fileName}`
        };
        const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json;charset=utf-8' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = fileName.replace('.html', '.json');
        jsonLink.style.display = 'none';
        document.body.appendChild(jsonLink);
        jsonLink.click();
        document.body.removeChild(jsonLink);
        URL.revokeObjectURL(jsonUrl);

        console.log('アセスメントシート保存成功:', fileName);

        return {
            success: true,
            filePath: `temp/assessmentSheet/${fileName}`,
            message: 'アセスメントシートが保存されました'
        };
    } catch (error) {
        console.error('ファイル保存エラー:', error);
        throw new Error(`ファイルの保存に失敗しました: ${error.message}`);
    }
}

/**
 * アセスメントデータを文字列サマリーに変換
 */
function buildAssessmentSummary(data) {
    let summary = '';
    summary += `【保護者の希望】\n${data.guardianWishes || '未記入'}\n\n`;
    summary += `【本人の強み】\n${data.childStrengths || '未記入'}\n\n`;
    summary += `【本人の課題】\n${data.childChallenges || '未記入'}\n\n`;

    if (data.sortedPriorities && data.sortedPriorities.length > 0) {
        summary += `【優先課題領域】\n`;
        data.sortedPriorities.forEach(p => {
            summary += `${p.rank}位: ${p.label}\n`;
        });
        summary += '\n';
    }

    summary += `【対人社会性】\n`;
    summary += `- 指示の理解: ${data.situationEpisode || '未記入'}\n`;
    summary += `- コミュニケーション: ${data.communicationDetails || '未記入'}\n`;
    summary += `- こだわり: ${data.persistence || '未記入'}\n\n`;

    summary += `【行動情緒】\n`;
    summary += `- 集中力: ${data.concentrationDetails || '未記入'}\n`;
    summary += `- 衝動性: ${data.impulsivityDetails || '未記入'}\n`;
    summary += `- パニック: ${data.panicDetails || '未記入'}\n\n`;

    summary += `【身体運動】\n`;
    summary += `- 粗大運動: ${data.grossMotorDetails || '未記入'}\n`;
    summary += `- 微細運動: ${data.fineMotorDetails || '未記入'}\n`;
    summary += `- バランス: ${data.balanceDetails || '未記入'}\n\n`;

    summary += `【その他】\n`;
    summary += `- 生活習慣: ${data.dailyLivingDetails || '未記入'}\n`;
    summary += `- 登校しぶり: ${data.schoolRefusalDetails || '未記入'}\n`;
    summary += `- その他: ${data.overallOther || '未記入'}\n`;

    return summary;
}

/**
 * 専門的支援実施計画のHTMLをレンダリング（form.js独立版）
 */
function renderOfficialSupportPlanHTML(childData, planData) {
    const today = new Date().toLocaleDateString('ja-JP');
    const items = planData.items || [];

    let itemsHTML = '';
    items.forEach(item => {
        itemsHTML += `
            <tr>
                <td style="text-align:center; font-weight:bold; width:120px;">${item.category || ''}</td>
                <td style="width:180px;">${item.goal || ''}</td>
                <td>${item.content || ''}</td>
                <td style="width:180px;">${item.method || ''}</td>
                <td style="text-align:center; width:80px;">${item.period || ''}</td>
            </tr>
        `;
    });

    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${childData.childName}さんの専門的支援実施計画</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Hiragino Kaku Gothic ProN', sans-serif; font-size: 12px; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1100px; margin: 0 auto; background: white; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
        th { background: #f0f0f0; font-weight: bold; }
        @media print { body { padding: 0; background: white; } .container { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="container">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div><h2 style="color: #d35400;">${childData.childName}さんの専門的支援実施計画</h2></div>
            <div style="text-align: right; font-size: 11pt;">
                <p>施設名：カラーズFC鳥栖</p>
                <p>利用サービス：放課後等デイサービス</p>
                <p>作成日：${today}</p>
            </div>
        </div>
        <div style="margin-bottom: 15px; background: #f8f9fa; padding: 12px; border-radius: 8px;">
            <h4 style="color: #d35400;">アセスメント結果</h4>
            <p><strong>本人：</strong>${planData.assessmentSelf || ''}</p>
            <p><strong>家族：</strong>${planData.assessmentFamily || ''}</p>
        </div>
        <div style="margin-bottom: 15px; background: #f8f9fa; padding: 12px; border-radius: 8px;">
            <h4 style="color: #d35400;">総合的な支援の方針</h4>
            <p>${planData.supportPolicy || ''}</p>
        </div>
        <table>
            <tr><td style="background:#f8f9fa; font-weight:bold; color:#d35400; width:100px;">長期目標</td><td>${planData.longTermGoal || ''}</td></tr>
            <tr><td style="background:#f8f9fa; font-weight:bold; color:#d35400;">短期目標</td><td>${planData.shortTermGoal || ''}</td></tr>
        </table>
        <table>
            <thead><tr style="background:#f8f9fa;">
                <th>特に支援を要する項目</th><th>目指すべき達成目標</th><th>具体的な支援の内容</th><th>実施方法</th><th>達成時期</th>
            </tr></thead>
            <tbody>${itemsHTML}</tbody>
        </table>
    </div>
</body>
</html>`;
}

/**
 * 個別支援計画のHTMLをレンダリング（form.js独立版）
 */
function renderOfficialIndividualPlanHTML(childData, planData) {
    const today = new Date().toLocaleDateString('ja-JP');
    const selfSupport = planData.selfSupport || [];
    const familySupport = planData.familySupport || {};
    const transitionSupport = planData.transitionSupport || {};

    let selfSupportHTML = '';
    selfSupport.forEach((item, index) => {
        const rowspanAttr = index === 0 ? `rowspan="${selfSupport.length}"` : '';
        const categoryCell = index === 0 ? `<td style="text-align:center; font-weight:bold; width:60px; vertical-align:middle; background:#fafafa;" ${rowspanAttr}>本人支援</td>` : '';
        selfSupportHTML += `<tr>${categoryCell}<td>${item.needs||''}</td><td>${item.goal||''}</td><td>${item.content||''}</td><td style="text-align:center;">${item.period||''}</td><td>${item.staff||''}</td><td>${item.notes||''}</td><td style="text-align:center;">${item.priority||''}</td></tr>`;
    });

    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${childData.childName}さんの個別支援計画</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Hiragino Kaku Gothic ProN', sans-serif; font-size: 12px; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1100px; margin: 0 auto; background: white; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
        th { background: #f0f0f0; font-weight: bold; }
        @media print { body { padding: 0; background: white; } .container { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="container">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div>
                <h2 style="color: #d35400;">${childData.childName}さんの個別支援計画</h2>
                <p style="color: #666;">（代替支援用）</p>
            </div>
            <div style="text-align: right; font-size: 11pt;">
                <p>施設名：カラーズFC鳥栖</p>
                <p>利用サービス：放課後等デイサービス</p>
                <p>作成日：${today}</p>
            </div>
        </div>
        <div style="margin-bottom: 15px; background: #f8f9fa; padding: 12px; border-radius: 8px;">
            <h4 style="color: #d35400;">利用児及び家族の生活に対する意向</h4>
            <p><strong>本人：</strong>${planData.intentSelf || ''}</p>
            <p><strong>家族：</strong>${planData.intentFamily || ''}</p>
        </div>
        <div style="margin-bottom: 15px; background: #f8f9fa; padding: 12px; border-radius: 8px;">
            <h4 style="color: #d35400;">総合的な支援の方針</h4>
            <p>${planData.supportPolicy || ''}</p>
        </div>
        <table>
            <tr><td style="background:#f8f9fa; font-weight:bold; color:#d35400; width:150px;">長期目標</td><td>${planData.longTermGoal || ''}</td></tr>
            <tr><td style="background:#f8f9fa; font-weight:bold; color:#d35400;">短期目標</td><td>${planData.shortTermGoal || ''}</td></tr>
        </table>
        <table>
            <thead><tr style="background:#f8f9fa;">
                <th colspan="2">項目（本人のニーズ等）</th><th>具体的な達成目標</th><th>支援内容</th><th>達成時期</th><th>担当者</th><th>留意事項</th><th>優先順位</th>
            </tr></thead>
            <tbody>
                ${selfSupportHTML}
                <tr>
                    <td style="text-align:center; font-weight:bold; background:#fafafa;">家族支援</td>
                    <td>${familySupport.needs||''}</td><td>${familySupport.goal||''}</td><td>${familySupport.content||''}</td>
                    <td style="text-align:center;">${familySupport.period||''}</td><td>${familySupport.staff||''}</td><td>${familySupport.notes||''}</td><td></td>
                </tr>
                <tr>
                    <td style="text-align:center; font-weight:bold; background:#fafafa;">移行支援</td>
                    <td>${transitionSupport.needs||''}</td><td>${transitionSupport.goal||''}</td><td>${transitionSupport.content||''}</td>
                    <td style="text-align:center;">${transitionSupport.period||''}</td><td>${transitionSupport.staff||''}</td><td>${transitionSupport.notes||''}</td><td></td>
                </tr>
            </tbody>
        </table>
        <div style="margin-top: 30px; display: flex; justify-content: space-between;">
            <div><p>説明同意日　令和　　年　　月　　日</p><p>保護者氏名 ____________________</p></div>
            <div><p>カラーズFC鳥栖</p><p>児童発達支援管理責任者　岡本　陸佑</p></div>
        </div>
    </div>
</body>
</html>`;
}

/**
 * アセスメント送信後に支援計画を自動生成
 */
async function autoGeneratePlans(data) {
    if (typeof geminiAPI === 'undefined') {
        console.warn('geminiAPI が利用できません。計画書自動生成をスキップします。');
        return { success: false, message: 'Gemini APIが利用できません' };
    }

    try {
        // APIキー読み込み
        geminiAPI.loadApiKey();
        if (!geminiAPI.isInitialized()) {
            console.warn('Gemini APIキーが設定されていません。計画書自動生成をスキップします。');
            return { success: false, message: 'APIキーが未設定です' };
        }

        const assessmentSummary = buildAssessmentSummary(data);
        const today = new Date().toISOString().split('T')[0];
        const supportPlans = JSON.parse(localStorage.getItem('supportPlans') || '{}');
        const results = { support: null, individual: null };
        let supportPlanHTML = null;
        let supportFileName = null;
        let individualPlanHTML = null;
        let individualFileName = null;

        // 専門的支援実施計画を生成
        try {
            const supportPlanData = await geminiAPI.generateOfficialSupportPlan({
                childName: data.childName,
                diagnosis: data.diagnosis,
                certificateNumber: '',
                supportPeriod: '',
                assessmentSummary: assessmentSummary
            });

            supportPlanHTML = renderOfficialSupportPlanHTML(data, supportPlanData);
            supportFileName = `${data.childName}_専門的支援実施計画_${today}.html`;
            supportPlans[supportFileName] = {
                html: supportPlanHTML,
                childName: data.childName,
                planData: supportPlanData,
                createdAt: new Date().toISOString(),
                type: 'officialSupport'
            };
            results.support = supportFileName;
        } catch (e) {
            console.error('専門的支援実施計画の生成に失敗:', e);
        }

        // 個別支援計画を生成
        try {
            const individualPlanData = await geminiAPI.generateOfficialIndividualPlan({
                childName: data.childName,
                diagnosis: data.diagnosis,
                certificateNumber: '',
                startDate: '',
                endDate: '',
                assessmentSummary: assessmentSummary
            });

            individualPlanHTML = renderOfficialIndividualPlanHTML(data, individualPlanData);
            individualFileName = `${data.childName}_個別支援計画_${today}.html`;
            supportPlans[individualFileName] = {
                html: individualPlanHTML,
                childName: data.childName,
                planData: individualPlanData,
                createdAt: new Date().toISOString(),
                type: 'officialIndividual'
            };
            results.individual = individualFileName;
        } catch (e) {
            console.error('個別支援計画の生成に失敗:', e);
        }

        localStorage.setItem('supportPlans', JSON.stringify(supportPlans));

        return {
            success: results.support || results.individual,
            support: results.support,
            individual: results.individual
        };
    } catch (error) {
        console.error('計画書自動生成エラー:', error);
        return { success: false, message: error.message };
    }
}
