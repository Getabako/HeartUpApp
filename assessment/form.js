// Remove import as it's causing issues - we don't need Gemini API for this form

// Google Drive API初期化
let driveInitialized = false;

async function initGoogleDrive() {
    console.log('Google Drive API 初期化開始...');
    if (typeof googleDriveAPI !== 'undefined') {
        try {
            driveInitialized = await googleDriveAPI.initialize();
            console.log('Google Drive API 初期化結果:', driveInitialized);

            // アクティブプロファイルのフォルダIDを設定
            if (typeof profileManager !== 'undefined') {
                const activeProfile = profileManager.getActiveProfile();
                if (activeProfile && activeProfile.folderId) {
                    googleDriveAPI.setTargetFolderId(activeProfile.folderId);
                    console.log('アクティブプロファイルのフォルダIDを設定:', activeProfile.folderId);
                }
            }
        } catch (error) {
            console.error('Google Drive API 初期化エラー:', error);
        }
    } else {
        console.warn('googleDriveAPI が定義されていません');
    }
}

// ページロード時にGoogle Drive APIを初期化
document.addEventListener('DOMContentLoaded', initGoogleDrive);

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

document.getElementById('assessmentForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Show loading message
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = '処理中...';

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

        // Add rating data (will be filled in assessment sheet generation)
        data.ratings = calculateRatings(data);

        // Generate assessment sheet HTML
        const assessmentHTML = await generateAssessmentSheet(data);

        // Save assessment sheet locally
        const fileName = `${data.childName}_アセスメントシート.html`;
        await saveAssessmentSheet(fileName, assessmentHTML, data);

        // Google Driveへ自動保存（PDF形式、生徒名フォルダに保存）
        let driveResult = null;
        if (typeof googleDriveAPI !== 'undefined') {
            submitButton.textContent = 'PDFを生成中...';
            console.log('Google Drive保存開始...', { driveInitialized, isInit: googleDriveAPI.isInitialized() });
            try {
                // 初期化されていなければ再度初期化を試みる
                if (!driveInitialized) {
                    console.log('Google Drive API 再初期化中...');
                    driveInitialized = await googleDriveAPI.initialize();
                }

                if (driveInitialized) {
                    submitButton.textContent = 'Google Driveに保存中...';

                    // 生徒名フォルダに保存（フォルダがなければ自動作成）
                    driveResult = await googleDriveAPI.saveAssessmentToStudentFolder(
                        data.childName,
                        fileName,
                        assessmentHTML,
                        data
                    );
                    console.log('Google Drive保存結果:', driveResult);
                } else {
                    console.warn('Google Drive API が初期化されていません');
                }
            } catch (driveError) {
                console.error('Google Drive保存エラー:', driveError);
            }
        } else {
            console.warn('googleDriveAPI が利用できません');
        }

        // Show success message
        let successMessage = `アセスメントシートが作成されました！\n\nファイル名: ${fileName}`;

        if (driveResult && driveResult.success) {
            const folderStatus = driveResult.folder.isNew ? '（新規作成）' : '（既存）';
            successMessage += `\n\nGoogle Driveに保存されました！`;
            successMessage += `\n保存先フォルダ: ${driveResult.folder.folderName} ${folderStatus}`;
            successMessage += `\nファイルリンク: ${driveResult.html.webViewLink}`;
        } else {
            successMessage += `\n\n※ Google Driveへの保存はスキップされました`;
        }

        successMessage += `\n\nこのメッセージを閉じると支援計画作成画面に移動します。`;

        alert(successMessage);

        // Redirect to support plan creation page (AI Tools tab, Support Plan sub-tab)
        window.location.href = '../index.html?tab=ai-tools&subtab=plan&childName=' + encodeURIComponent(data.childName);
    } catch (error) {
        console.error('Error creating assessment sheet:', error);
        alert(`エラーが発生しました: ${error.message}`);
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
});

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
            body { padding: 0; background: white; }
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
