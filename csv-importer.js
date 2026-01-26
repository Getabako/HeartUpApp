/**
 * CSVインポート機能
 * 児童基本情報、支援計画、活動記録をCSVからインポート
 */

class CSVImporter {
    constructor() {
        this.supportedTypes = ['childInfo', 'supportPlan', 'record'];
    }

    /**
     * CSVテキストを解析
     * @param {string} csvText - CSVテキスト
     * @returns {Object} { headers: Array, rows: Array }
     */
    parseCSV(csvText) {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim());
        if (lines.length === 0) {
            throw new Error('CSVファイルが空です');
        }

        const headers = this.parseCSVLine(lines[0]);
        const rows = lines.slice(1).map(line => {
            const values = this.parseCSVLine(line);
            const obj = {};
            headers.forEach((h, i) => obj[h.trim()] = (values[i] || '').trim());
            return obj;
        });

        return { headers, rows };
    }

    /**
     * CSV行を解析（カンマ区切り、クォート対応）
     * @param {string} line - CSV行
     * @returns {Array} フィールド配列
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);

        return result;
    }

    /**
     * 児童基本情報をインポート
     * @param {File} file - CSVファイル
     * @returns {Promise<Object>} インポート結果
     */
    async importChildInfo(file) {
        const text = await this.readFile(file);
        const { headers, rows } = this.parseCSV(text);

        // 必須フィールドの確認
        const requiredFields = ['氏名'];
        const missingFields = requiredFields.filter(f => !headers.includes(f));
        if (missingFields.length > 0) {
            throw new Error(`必須フィールドがありません: ${missingFields.join(', ')}`);
        }

        const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
        const imported = [];

        for (const row of rows) {
            if (!row['氏名']) continue;

            const childName = row['氏名'];
            const fileName = `${childName}_アセスメントシート_imported.html`;

            const assessmentData = {
                childName: childName,
                childNameKana: row['ふりがな'] || row['フリガナ'] || '',
                birthDate: row['生年月日'] || '',
                gender: row['性別'] || '',
                diagnosis: row['診断名'] || '',
                certificateNumber: row['受給者証番号'] || '',
                // 追加フィールド
                address: row['住所'] || '',
                phone: row['電話番号'] || '',
                guardianName: row['保護者名'] || '',
                school: row['学校・園名'] || '',
                grade: row['学年'] || ''
            };

            assessments[fileName] = {
                fileName,
                data: assessmentData,
                createdAt: new Date().toISOString(),
                importedFrom: 'csv',
                html: this.generateBasicAssessmentHTML(assessmentData)
            };

            imported.push(childName);
        }

        localStorage.setItem('assessments', JSON.stringify(assessments));

        return {
            success: true,
            importedCount: imported.length,
            importedNames: imported,
            message: `${imported.length}名の児童情報をインポートしました`
        };
    }

    /**
     * 支援計画をインポート
     * @param {File} file - CSVファイル
     * @returns {Promise<Object>} インポート結果
     */
    async importSupportPlan(file) {
        const text = await this.readFile(file);
        const { headers, rows } = this.parseCSV(text);

        const requiredFields = ['児童名'];
        const missingFields = requiredFields.filter(f => !headers.includes(f));
        if (missingFields.length > 0) {
            throw new Error(`必須フィールドがありません: ${missingFields.join(', ')}`);
        }

        const supportPlans = JSON.parse(localStorage.getItem('supportPlans') || '{}');
        const imported = [];

        for (const row of rows) {
            if (!row['児童名']) continue;

            const childName = row['児童名'];
            const createdDate = row['作成日'] || new Date().toISOString().split('T')[0];
            const fileName = `${childName}_支援計画_${createdDate}.html`;

            const planData = {
                childName,
                createdDate,
                supportPeriod: row['支援期間'] || '',
                longTermGoal: row['長期目標'] || '',
                shortTermGoal: row['短期目標'] || '',
                supportContent: row['支援内容'] || '',
                familySupport: row['家族支援'] || '',
                notes: row['備考'] || ''
            };

            supportPlans[fileName] = {
                fileName,
                childName,
                data: planData,
                createdAt: new Date().toISOString(),
                importedFrom: 'csv',
                html: this.generateSupportPlanHTML(planData)
            };

            imported.push(childName);
        }

        localStorage.setItem('supportPlans', JSON.stringify(supportPlans));

        return {
            success: true,
            importedCount: imported.length,
            importedNames: imported,
            message: `${imported.length}件の支援計画をインポートしました`
        };
    }

    /**
     * 活動記録をインポート
     * @param {File} file - CSVファイル
     * @returns {Promise<Object>} インポート結果
     */
    async importRecords(file) {
        const text = await this.readFile(file);
        const { headers, rows } = this.parseCSV(text);

        const requiredFields = ['日付', '児童名'];
        const missingFields = requiredFields.filter(f => !headers.includes(f));
        if (missingFields.length > 0) {
            throw new Error(`必須フィールドがありません: ${missingFields.join(', ')}`);
        }

        const dailyReports = JSON.parse(localStorage.getItem('dailyReports') || '{}');
        const imported = [];

        for (const row of rows) {
            if (!row['日付'] || !row['児童名']) continue;

            const date = row['日付'];
            const childName = row['児童名'];
            const fileName = `${childName}_記録_${date}.html`;

            const recordData = {
                date,
                childName,
                activity: row['活動内容'] || '',
                observation: row['様子'] || row['観察内容'] || '',
                notes: row['備考'] || row['特記事項'] || ''
            };

            dailyReports[fileName] = {
                fileName,
                childName,
                data: recordData,
                activity: recordData.activity,
                observation: recordData.observation,
                createdAt: new Date().toISOString(),
                importedFrom: 'csv',
                html: this.generateRecordHTML(recordData)
            };

            imported.push(`${childName} (${date})`);
        }

        localStorage.setItem('dailyReports', JSON.stringify(dailyReports));

        return {
            success: true,
            importedCount: imported.length,
            importedNames: imported,
            message: `${imported.length}件の活動記録をインポートしました`
        };
    }

    /**
     * ファイルを読み込む
     * @param {File} file - ファイル
     * @returns {Promise<string>} ファイルテキスト
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Shift-JIS対応を試みる
                const text = e.target.result;
                resolve(text);
            };
            reader.onerror = (e) => reject(new Error('ファイルの読み込みに失敗しました'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    /**
     * 基本アセスメントHTMLを生成
     */
    generateBasicAssessmentHTML(data) {
        return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${data.childName} アセスメントシート（インポート）</title>
    <style>
        body { font-family: 'Hiragino Kaku Gothic ProN', sans-serif; padding: 20px; }
        .info-item { margin: 10px 0; }
        .label { font-weight: bold; color: #2e7d32; }
    </style>
</head>
<body>
    <h1>${data.childName} アセスメントシート</h1>
    <p style="color: #666;">※CSVからインポートされたデータです</p>
    <div class="info-item"><span class="label">氏名:</span> ${data.childName}</div>
    <div class="info-item"><span class="label">ふりがな:</span> ${data.childNameKana}</div>
    <div class="info-item"><span class="label">生年月日:</span> ${data.birthDate}</div>
    <div class="info-item"><span class="label">性別:</span> ${data.gender}</div>
    <div class="info-item"><span class="label">診断名:</span> ${data.diagnosis}</div>
    ${data.certificateNumber ? `<div class="info-item"><span class="label">受給者証番号:</span> ${data.certificateNumber}</div>` : ''}
    ${data.guardianName ? `<div class="info-item"><span class="label">保護者名:</span> ${data.guardianName}</div>` : ''}
    ${data.school ? `<div class="info-item"><span class="label">学校・園名:</span> ${data.school}</div>` : ''}
</body>
</html>
        `.trim();
    }

    /**
     * 支援計画HTMLを生成
     */
    generateSupportPlanHTML(data) {
        return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${data.childName} 支援計画（インポート）</title>
    <style>
        body { font-family: 'Hiragino Kaku Gothic ProN', sans-serif; padding: 20px; }
        .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        .section-title { font-weight: bold; color: #2e7d32; margin-bottom: 10px; }
    </style>
</head>
<body>
    <h1>${data.childName} 個別支援計画</h1>
    <p>作成日: ${data.createdDate}</p>
    ${data.supportPeriod ? `<p>支援期間: ${data.supportPeriod}</p>` : ''}

    <div class="section">
        <div class="section-title">長期目標</div>
        <p>${data.longTermGoal || '（未設定）'}</p>
    </div>

    <div class="section">
        <div class="section-title">短期目標</div>
        <p>${data.shortTermGoal || '（未設定）'}</p>
    </div>

    <div class="section">
        <div class="section-title">支援内容</div>
        <p>${data.supportContent || '（未設定）'}</p>
    </div>

    ${data.familySupport ? `
    <div class="section">
        <div class="section-title">家族支援</div>
        <p>${data.familySupport}</p>
    </div>
    ` : ''}

    ${data.notes ? `
    <div class="section">
        <div class="section-title">備考</div>
        <p>${data.notes}</p>
    </div>
    ` : ''}
</body>
</html>
        `.trim();
    }

    /**
     * 活動記録HTMLを生成
     */
    generateRecordHTML(data) {
        return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${data.childName} 活動記録 ${data.date}</title>
    <style>
        body { font-family: 'Hiragino Kaku Gothic ProN', sans-serif; padding: 20px; }
        .section { margin: 20px 0; }
        .label { font-weight: bold; color: #2e7d32; }
    </style>
</head>
<body>
    <h1>活動記録</h1>
    <p><span class="label">日付:</span> ${data.date}</p>
    <p><span class="label">児童名:</span> ${data.childName}</p>

    <div class="section">
        <p><span class="label">活動内容:</span></p>
        <p>${data.activity || '（未記入）'}</p>
    </div>

    <div class="section">
        <p><span class="label">様子・観察:</span></p>
        <p>${data.observation || '（未記入）'}</p>
    </div>

    ${data.notes ? `
    <div class="section">
        <p><span class="label">備考:</span></p>
        <p>${data.notes}</p>
    </div>
    ` : ''}
</body>
</html>
        `.trim();
    }
}

// グローバルインスタンス
const csvImporter = new CSVImporter();
