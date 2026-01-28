/**
 * CSVインポート機能
 * 児童基本情報、支援計画、活動記録をCSVからインポート
 * 縦型（キー・バリュー形式）と横型（テーブル形式）の両方に対応
 */

class CSVImporter {
    constructor() {
        this.supportedTypes = ['childInfo', 'supportPlan', 'record'];
    }

    /**
     * CSVの形式を検出
     * @param {string} csvText - CSVテキスト
     * @returns {string} 'vertical' | 'horizontal'
     */
    detectCSVFormat(csvText) {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) return 'horizontal';

        // BOMを除去して確認
        const cleanText = csvText.replace(/^\ufeff/, '');

        // 縦型キーワードの検出（コロンを含む形式も対応）
        const verticalKeywords = ['氏名', '性別', '生年月日', '受給者証番号', '児童名', '施設名', '利用サービス', '作成日', '総合的な支援の方針', '長期目標', '短期目標'];

        // 最初の数行をチェック
        for (let i = 0; i < Math.min(10, lines.length); i++) {
            const line = lines[i].replace(/^\ufeff/, '');
            const cols = this.parseCSVLine(line);
            const firstCol = (cols[0] || '').trim();

            // キーワードが含まれているかチェック（「児童名：〇〇」形式も対応）
            for (const keyword of verticalKeywords) {
                if (firstCol.includes(keyword)) {
                    return 'vertical';
                }
            }
        }

        return 'horizontal';
    }

    /**
     * 縦型CSVをパース（キー・バリュー形式）
     * @param {string} csvText - CSVテキスト
     * @returns {Object} パースされたデータオブジェクト
     */
    parseVerticalCSV(csvText) {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim());
        const data = {};

        for (const line of lines) {
            const cols = this.parseCSVLine(line);
            if (cols.length >= 2) {
                let key = cols[0].trim();
                // BOMを除去
                key = key.replace(/^\ufeff/, '');
                const value = cols[1]?.trim() || '';

                if (key && value) {
                    data[key] = value;
                }
            }
        }

        return data;
    }

    /**
     * CSVテキストを解析（形式自動検出）
     * @param {string} csvText - CSVテキスト
     * @returns {Object} { headers: Array, rows: Array } または { data: Object }
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
        const format = this.detectCSVFormat(text);

        const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
        const imported = [];

        if (format === 'vertical') {
            // 縦型CSV（キー・バリュー形式）の処理
            const data = this.parseVerticalCSV(text);

            // 児童名を取得（様々なキー名に対応）
            let childName = '';
            const nameKeys = ['氏名', '児童名', '名前', 'お名前'];
            for (const key of nameKeys) {
                // 部分一致で検索
                const matchingKey = Object.keys(data).find(k => k.includes(key));
                if (matchingKey && data[matchingKey]) {
                    childName = data[matchingKey];
                    // 「さん」や括弧内のふりがなを除去
                    childName = childName.replace(/（.*?）/g, '').replace(/\(.*?\)/g, '').replace(/　さん$/, '').replace(/ さん$/, '').trim();
                    break;
                }
            }

            if (!childName) {
                throw new Error('児童名が見つかりません。「氏名」または「児童名」列が必要です。');
            }

            const fileName = `${childName}_アセスメントシート_imported.html`;

            // ふりがなを抽出
            let childNameKana = '';
            const originalName = data['氏名'] || data['児童名'] || '';
            const kanaMatch = originalName.match(/（(.+?)）/) || originalName.match(/\((.+?)\)/);
            if (kanaMatch) {
                childNameKana = kanaMatch[1];
            }

            // 診断名を取得（「症状」キーにも対応）
            const diagnosis = data['診断名'] || data['症状'] || '';

            const assessmentData = {
                childName: childName,
                childNameKana: childNameKana || data['ふりがな'] || data['フリガナ'] || '',
                birthDate: data['生年月日'] || '',
                gender: data['性別'] || '',
                diagnosis: diagnosis,
                certificateNumber: data['受給者証番号'] || '',
                // 追加フィールド
                address: data['住所'] || '',
                phone: data['電話番号'] || '',
                guardianName: data['保護者名'] || '',
                school: data['学校'] || data['学校・園名'] || '',
                grade: data['学年'] || data['指導'] || '',
                consultantOffice: data['相談支援事業所'] || '',
                consultantName: data['相談支援専門員'] || '',
                allergy: data['アレルギー'] || '',
                strengths: data['得意なこと・好きなこと'] || '',
                cautions: data['気をつけてほしいこと'] || '',
                teacher: data['担任名'] || ''
            };

            assessments[fileName] = {
                fileName,
                data: assessmentData,
                createdAt: new Date().toISOString(),
                importedFrom: 'csv',
                html: this.generateBasicAssessmentHTML(assessmentData)
            };

            imported.push(childName);
        } else {
            // 横型CSV（テーブル形式）の処理
            const { headers, rows } = this.parseCSV(text);

            // 必須フィールドの確認
            const requiredFields = ['氏名'];
            const missingFields = requiredFields.filter(f => !headers.includes(f));
            if (missingFields.length > 0) {
                throw new Error(`必須フィールドがありません: ${missingFields.join(', ')}`);
            }

            for (const row of rows) {
                if (!row['氏名']) continue;

                const childName = row['氏名'];
                const fileName = `${childName}_アセスメントシート_imported.html`;

                const assessmentData = {
                    childName: childName,
                    childNameKana: row['ふりがな'] || row['フリガナ'] || '',
                    birthDate: row['生年月日'] || '',
                    gender: row['性別'] || '',
                    diagnosis: row['診断名'] || row['症状'] || '',
                    certificateNumber: row['受給者証番号'] || '',
                    address: row['住所'] || '',
                    phone: row['電話番号'] || '',
                    guardianName: row['保護者名'] || '',
                    school: row['学校・園名'] || row['学校'] || '',
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
        const format = this.detectCSVFormat(text);

        const supportPlans = JSON.parse(localStorage.getItem('supportPlans') || '{}');
        const imported = [];

        if (format === 'vertical') {
            // 縦型CSV（公式様式からのコピペ）の処理
            const planData = this.parseVerticalSupportPlan(text);

            if (!planData.childName) {
                throw new Error('児童名が見つかりません');
            }

            const createdDate = planData.createdDate || new Date().toISOString().split('T')[0];
            const fileName = `${planData.childName}_支援計画_${createdDate}.html`;

            supportPlans[fileName] = {
                fileName,
                childName: planData.childName,
                data: planData,
                planData: planData,
                createdAt: new Date().toISOString(),
                importedFrom: 'csv',
                html: this.generateImportedSupportPlanHTML(planData)
            };

            imported.push(planData.childName);
        } else {
            // 横型CSV（テーブル形式）の処理
            const { headers, rows } = this.parseCSV(text);

            const requiredFields = ['児童名'];
            const missingFields = requiredFields.filter(f => !headers.includes(f));
            if (missingFields.length > 0) {
                throw new Error(`必須フィールドがありません: ${missingFields.join(', ')}`);
            }

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
     * 縦型支援計画CSVをパース
     * @param {string} csvText - CSVテキスト
     * @returns {Object} パースされた支援計画データ
     */
    parseVerticalSupportPlan(csvText) {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim());
        const planData = {
            childName: '',
            facilityName: '',
            serviceName: '',
            createdDate: '',
            certificateNumber: '',
            startDate: '',
            endDate: '',
            selfIntent: '',
            familyIntent: '',
            supportPolicy: '',
            longTermGoal: '',
            shortTermGoal: '',
            selfSupport: [],
            familySupport: { needs: '', goal: '', content: '', period: '', staff: '', notes: '' },
            transitionSupport: { needs: '', goal: '', content: '', period: '', staff: '', notes: '' }
        };

        let currentSection = '';
        let currentSupportItem = null;
        let intentSection = false;

        for (let i = 0; i < lines.length; i++) {
            const cols = this.parseCSVLine(lines[i]);
            // BOMを除去
            let firstCol = (cols[0] || '').replace(/^\ufeff/, '').trim();
            const secondCol = (cols[1] || '').trim();

            // 児童名（「児童名：〇〇」形式）
            if (firstCol.includes('児童名')) {
                // 「児童名：森田　亜羅斗」または「児童名,森田　亜羅斗」の両形式に対応
                const match = firstCol.match(/児童名[：:]/);
                if (match) {
                    // コロン以降を取得
                    planData.childName = firstCol.replace(/児童名[：:]/, '').trim();
                } else if (secondCol) {
                    planData.childName = secondCol;
                }
            }

            // 施設名
            if (firstCol.includes('施設名')) {
                const match = firstCol.match(/施設名[：:]/);
                if (match) {
                    planData.facilityName = firstCol.replace(/施設名[：:]/, '').trim();
                } else if (secondCol) {
                    planData.facilityName = secondCol;
                }
            }

            // 利用サービス
            if (firstCol.includes('利用サービス')) {
                const match = firstCol.match(/利用サービス[：:]/);
                if (match) {
                    planData.serviceName = firstCol.replace(/利用サービス[：:]/, '').trim();
                } else if (secondCol) {
                    planData.serviceName = secondCol;
                }
            }

            // 作成日
            if (firstCol.includes('作成日')) {
                const match = firstCol.match(/作成日[：:]/);
                if (match) {
                    planData.createdDate = firstCol.replace(/作成日[：:]/, '').trim();
                } else if (secondCol) {
                    planData.createdDate = secondCol;
                }
            }

            // 受給者証番号
            if (firstCol === '受給者証番号') {
                planData.certificateNumber = secondCol;
                // 同じ行に開始日、有効期限がある場合
                if (cols[2] === '開始日') planData.startDate = (cols[3] || '').trim();
                if (cols[4] === '有効期限') planData.endDate = (cols[5] || '').trim();
            }

            // 利用児及び家族の生活に対する意向
            if (firstCol.includes('利用児及び家族')) {
                intentSection = true;
                if (secondCol.includes('本人')) {
                    planData.selfIntent = secondCol.replace(/^本人[：:]/, '').trim();
                }
            }
            if (firstCol.includes('生活に対する意向') || (intentSection && firstCol === '')) {
                if (secondCol.includes('家族')) {
                    planData.familyIntent = secondCol.replace(/^家族[：:]/, '').trim();
                    intentSection = false;
                } else if (secondCol.includes('本人')) {
                    planData.selfIntent = secondCol.replace(/^本人[：:]/, '').trim();
                }
            }

            // 総合的な支援の方針
            if (firstCol === '総合的な支援の方針') {
                planData.supportPolicy = secondCol;
            }

            // 長期目標
            if (firstCol.includes('長期目標')) {
                planData.longTermGoal = secondCol;
            }

            // 短期目標
            if (firstCol.includes('短期目標')) {
                planData.shortTermGoal = secondCol;
            }

            // 本人支援セクション
            if (firstCol === '本人支援') {
                currentSection = 'selfSupport';
                currentSupportItem = {
                    needs: secondCol,
                    goal: (cols[2] || '').trim(),
                    content: (cols[3] || '').trim(),
                    period: (cols[4] || cols[5] || '').trim(),
                    staff: (cols[5] || cols[6] || '').trim(),
                    notes: (cols[6] || cols[7] || '').trim(),
                    priority: (cols[7] || cols[8] || '').trim()
                };
                planData.selfSupport.push(currentSupportItem);
            } else if (currentSection === 'selfSupport' && firstCol === '' && secondCol && !secondCol.startsWith('・')) {
                // 本人支援の新しい目標行（・で始まる行は継続内容なのでスキップ）
                currentSupportItem = {
                    needs: secondCol,
                    goal: (cols[2] || '').trim(),
                    content: (cols[3] || '').trim(),
                    period: (cols[4] || cols[5] || '').trim(),
                    staff: (cols[5] || cols[6] || '').trim(),
                    notes: (cols[6] || cols[7] || '').trim(),
                    priority: (cols[7] || cols[8] || '').trim()
                };
                planData.selfSupport.push(currentSupportItem);
            }

            // 家族支援セクション
            if (firstCol === '家族支援') {
                currentSection = 'familySupport';
                planData.familySupport = {
                    needs: secondCol,
                    goal: (cols[2] || '').trim(),
                    content: (cols[3] || '').trim(),
                    period: (cols[4] || cols[5] || '').trim(),
                    staff: (cols[5] || cols[6] || '').trim(),
                    notes: (cols[6] || cols[7] || '').trim()
                };
            }

            // 移行支援セクション
            if (firstCol === '移行支援') {
                currentSection = 'transitionSupport';
                planData.transitionSupport = {
                    needs: secondCol,
                    goal: (cols[2] || '').trim(),
                    content: (cols[3] || '').trim(),
                    period: (cols[4] || cols[5] || '').trim(),
                    staff: (cols[5] || cols[6] || '').trim(),
                    notes: (cols[6] || cols[7] || '').trim()
                };
            }
        }

        return planData;
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
    <title>${data.childName} 基本情報</title>
    <style>
        body { font-family: 'Hiragino Kaku Gothic ProN', sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2e7d32; border-bottom: 2px solid #4caf50; padding-bottom: 10px; }
        .info-section { margin: 20px 0; }
        .info-section h2 { color: #388e3c; font-size: 16px; margin-bottom: 15px; background: #e8f5e9; padding: 8px 12px; border-radius: 4px; }
        .info-item { display: flex; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #2e7d32; min-width: 150px; }
        .value { flex: 1; }
        .imported-badge { display: inline-block; background: #ff9800; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${data.childName} <span class="imported-badge">CSVインポート</span></h1>

        <div class="info-section">
            <h2>基本情報</h2>
            <div class="info-item"><span class="label">氏名:</span> <span class="value">${data.childName}</span></div>
            ${data.childNameKana ? `<div class="info-item"><span class="label">ふりがな:</span> <span class="value">${data.childNameKana}</span></div>` : ''}
            ${data.birthDate ? `<div class="info-item"><span class="label">生年月日:</span> <span class="value">${data.birthDate}</span></div>` : ''}
            ${data.gender ? `<div class="info-item"><span class="label">性別:</span> <span class="value">${data.gender}</span></div>` : ''}
            ${data.certificateNumber ? `<div class="info-item"><span class="label">受給者証番号:</span> <span class="value">${data.certificateNumber}</span></div>` : ''}
        </div>

        ${data.diagnosis ? `
        <div class="info-section">
            <h2>診断・症状</h2>
            <div class="info-item"><span class="label">診断名:</span> <span class="value">${data.diagnosis}</span></div>
            ${data.allergy ? `<div class="info-item"><span class="label">アレルギー:</span> <span class="value">${data.allergy}</span></div>` : ''}
        </div>
        ` : ''}

        ${data.school || data.grade || data.teacher ? `
        <div class="info-section">
            <h2>学校情報</h2>
            ${data.school ? `<div class="info-item"><span class="label">学校:</span> <span class="value">${data.school}</span></div>` : ''}
            ${data.grade ? `<div class="info-item"><span class="label">指導:</span> <span class="value">${data.grade}</span></div>` : ''}
            ${data.teacher ? `<div class="info-item"><span class="label">担任名:</span> <span class="value">${data.teacher}</span></div>` : ''}
        </div>
        ` : ''}

        ${data.consultantOffice || data.consultantName ? `
        <div class="info-section">
            <h2>相談支援</h2>
            ${data.consultantOffice ? `<div class="info-item"><span class="label">相談支援事業所:</span> <span class="value">${data.consultantOffice}</span></div>` : ''}
            ${data.consultantName ? `<div class="info-item"><span class="label">相談支援専門員:</span> <span class="value">${data.consultantName}</span></div>` : ''}
        </div>
        ` : ''}

        ${data.strengths || data.cautions ? `
        <div class="info-section">
            <h2>特記事項</h2>
            ${data.strengths ? `<div class="info-item"><span class="label">得意なこと・好きなこと:</span> <span class="value">${data.strengths}</span></div>` : ''}
            ${data.cautions ? `<div class="info-item"><span class="label">気をつけてほしいこと:</span> <span class="value">${data.cautions}</span></div>` : ''}
        </div>
        ` : ''}
    </div>
</body>
</html>
        `.trim();
    }

    /**
     * インポートした支援計画HTMLを生成（公式様式）
     */
    generateImportedSupportPlanHTML(data) {
        const today = data.createdDate || new Date().toLocaleDateString('ja-JP');

        return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${data.childName}さんの個別支援計画</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif; font-size: 12px; line-height: 1.4; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1100px; margin: 0 auto; background: white; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .header-left h1 { font-size: 18px; color: #333; margin-bottom: 5px; }
        .header-right { text-align: right; font-size: 11px; color: #666; }
        .imported-badge { display: inline-block; background: #ff9800; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .info-table th, .info-table td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; }
        .info-table th { background: #f0f0f0; font-weight: bold; width: 120px; }
        .content-row { display: flex; margin-bottom: 10px; }
        .content-label { width: 150px; font-weight: bold; padding: 8px; background: #fff8e1; border: 1px solid #ddd; }
        .content-value { flex: 1; padding: 8px; border: 1px solid #ddd; border-left: none; }
        .support-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
        .support-table th { background: #ff9800; color: white; padding: 8px; border: 1px solid #e65100; text-align: center; font-weight: bold; }
        .support-table td { padding: 8px; border: 1px solid #ddd; vertical-align: top; }
        .support-table .category { background: #fff8e1; font-weight: bold; text-align: center; width: 60px; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; }
        .footer-left, .footer-right { width: 45%; }
        @media print { body { padding: 0; background: white; } .container { box-shadow: none; padding: 15px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-left">
                <h1>${data.childName}さんの個別支援計画 <span class="imported-badge">CSVインポート</span></h1>
            </div>
            <div class="header-right">
                <p>施設名：${data.facilityName || 'カラーズFC鳥栖'}</p>
                <p>利用サービス：${data.serviceName || '放課後等デイサービス'}</p>
                <p>作成日：${today}</p>
            </div>
        </div>

        <table class="info-table">
            <tr>
                <th>受給者証番号</th>
                <td style="width:150px;">${data.certificateNumber || ''}</td>
                <th>開始日</th>
                <td style="width:120px;">${data.startDate || ''}</td>
                <th>有効期限</th>
                <td style="width:120px;">${data.endDate || ''}</td>
                <th>作成回数</th>
                <td style="width:60px;">1</td>
            </tr>
        </table>

        <div class="content-row">
            <div class="content-label">利用児及び家族の<br>生活に対する意向</div>
            <div class="content-value">
                <strong>本人：</strong>${data.selfIntent || ''}<br>
                <strong>家族：</strong>${data.familyIntent || ''}
            </div>
        </div>

        <div class="content-row">
            <div class="content-label">総合的な支援の方針</div>
            <div class="content-value">${data.supportPolicy || ''}</div>
        </div>

        <div class="content-row">
            <div class="content-label">長期目標</div>
            <div class="content-value">${data.longTermGoal || ''}</div>
        </div>

        <div class="content-row">
            <div class="content-label">短期目標</div>
            <div class="content-value">${data.shortTermGoal || ''}</div>
        </div>

        <table class="support-table">
            <thead>
                <tr>
                    <th colspan="2">項目（本人のニーズ等）</th>
                    <th>具体的な達成目標</th>
                    <th>支援内容</th>
                    <th>達成時期</th>
                    <th>担当者</th>
                    <th>留意事項</th>
                    <th>優先順位</th>
                </tr>
            </thead>
            <tbody>
                ${data.selfSupport && data.selfSupport.length > 0 ? data.selfSupport.map((item, index) => `
                <tr>
                    ${index === 0 ? `<td class="category" rowspan="${data.selfSupport.length}">本人支援</td>` : ''}
                    <td>${item.needs || ''}</td>
                    <td>${item.goal || ''}</td>
                    <td>${item.content || ''}</td>
                    <td>${item.period || ''}</td>
                    <td>${item.staff || ''}</td>
                    <td>${item.notes || ''}</td>
                    <td>${item.priority || ''}</td>
                </tr>
                `).join('') : '<tr><td class="category">本人支援</td><td colspan="7">（データなし）</td></tr>'}
                <tr>
                    <td class="category">家族支援</td>
                    <td>${data.familySupport?.needs || ''}</td>
                    <td>${data.familySupport?.goal || ''}</td>
                    <td>${data.familySupport?.content || ''}</td>
                    <td>${data.familySupport?.period || ''}</td>
                    <td>${data.familySupport?.staff || ''}</td>
                    <td>${data.familySupport?.notes || ''}</td>
                    <td></td>
                </tr>
                <tr>
                    <td class="category">移行支援</td>
                    <td>${data.transitionSupport?.needs || ''}</td>
                    <td>${data.transitionSupport?.goal || ''}</td>
                    <td>${data.transitionSupport?.content || ''}</td>
                    <td>${data.transitionSupport?.period || ''}</td>
                    <td>${data.transitionSupport?.staff || ''}</td>
                    <td>${data.transitionSupport?.notes || ''}</td>
                    <td></td>
                </tr>
            </tbody>
        </table>

        <div class="footer">
            <div class="footer-left">
                <p>説明同意日　令和　　年　　月　　日</p>
                <p>保護者氏名 ____________________</p>
            </div>
            <div class="footer-right">
                <p>${data.facilityName || 'カラーズFC鳥栖'}</p>
                <p>児童発達支援管理責任者　岡本　陸佑</p>
            </div>
        </div>
    </div>
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
