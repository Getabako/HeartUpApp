// HeartUpApp Data Adapter
// localStorage互換のインターフェースを提供し、Supabase接続時はSupabaseを使う
// 旧コードの JSON.parse(localStorage.getItem('xxx')) を await dataAdapter.getXxx() に置換するだけで移行可能

const dataAdapter = {

    // ============================================================
    // 児童
    // ============================================================

    async getChildren() {
        if (heartUpDB.isReady()) {
            // 認証プロフィール未取得ならロード（race condition対策）
            // currentProfile が無いまま locationId フィルタを掛け損ねると、
            // 全件クエリ→ルール/インデックス失敗→localStorageフォールバックで
            // 端末ローカルの古いデータを表示する事故が起きるため待機する
            if (!heartUpDB.currentProfile) {
                try { await heartUpDB.getMyProfile(); } catch (e) { /* ignore */ }
            }
            // Firebase接続中はlocalStorageフォールバックしない（古いデータを誤表示しないため）
            const rows = await heartUpDB.getChildren();
            const obj = {};
            rows.forEach(r => {
                const metadata = r.metadata || {};
                obj[r.name] = {
                    id: r.id,
                    createdAt: r.created_at,
                    locationId: r.locationId,
                    metadata: metadata,
                    // 下位互換性のため主要なメタデータもルートレベルに展開
                    grade: metadata.grade,
                    characteristic: metadata.characteristic,
                    birthDate: metadata.birthDate,
                    gender: metadata.gender,
                    diagnosis: metadata.diagnosis,
                    childNameKana: metadata.childNameKana
                };
            });
            return obj;
        }
        return JSON.parse(localStorage.getItem('children') || '{}');
    },

    async saveChild(name, metadata) {
        if (heartUpDB.isReady()) {
            try {
                await heartUpDB.getOrCreateChild(name);
            } catch (e) {
                console.error('Supabase saveChild error:', e);
            }
        }
        // localStorageにもキャッシュ
        const children = JSON.parse(localStorage.getItem('children') || '{}');
        if (!children[name]) {
            children[name] = { createdAt: new Date().toISOString(), ...(metadata || {}) };
            localStorage.setItem('children', JSON.stringify(children));
        }
    },

    async updateChildLocation(childName, newLocationId) {
        if (heartUpDB.isReady()) {
            try {
                await heartUpDB.updateChildLocation(childName, newLocationId);
            } catch (e) {
                console.error('Firebase updateChildLocation error:', e);
                throw e;
            }
        }
        // localStorageも更新
        const children = JSON.parse(localStorage.getItem('children') || '{}');
        if (children[childName]) {
            children[childName].locationId = newLocationId || '';
            localStorage.setItem('children', JSON.stringify(children));
        }
    },

    async updateChildBasicInfo(childName, info) {
        if (heartUpDB.isReady()) {
            try {
                await heartUpDB.updateChildBasicInfo(childName, info);
            } catch (e) {
                console.error('Firebase updateChildBasicInfo error:', e);
                throw e;
            }
        }
        // localStorageキャッシュも更新
        const children = JSON.parse(localStorage.getItem('children') || '{}');
        if (children[childName]) {
            ['childNameKana', 'birthDate', 'gender', 'diagnosis', 'staffNotes'].forEach(k => {
                if (info[k] !== undefined) children[childName][k] = info[k];
            });
            localStorage.setItem('children', JSON.stringify(children));
        }
    },

    async deleteChildAndRelatedData(childName) {
        console.log('dataAdapter.deleteChildAndRelatedData 開始:', childName);

        // Firebase削除（エラーは呼び出し元に伝播させる）
        if (heartUpDB.isReady()) {
            await heartUpDB.deleteChildAndRelatedData(childName);
            console.log('Firebase削除成功:', childName);
        }

        // localStorageキャッシュも削除
        const children = JSON.parse(localStorage.getItem('children') || '{}');
        delete children[childName];
        localStorage.setItem('children', JSON.stringify(children));

        // 関連データも削除
        ['assessments', 'supportPlans', 'dailyReports', 'reviews'].forEach(key => {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            const updated = {};
            Object.entries(data).forEach(([k, v]) => {
                const shouldDelete = v.childName === childName || v.data?.childName === childName || k.startsWith(childName + '_');
                if (!shouldDelete) updated[k] = v;
            });
            localStorage.setItem(key, JSON.stringify(updated));
        });

        console.log('dataAdapter.deleteChildAndRelatedData 完了:', childName);
    },

    // ============================================================
    // アセスメント
    // ============================================================

    async getAssessments() {
        if (heartUpDB.isReady()) {
            if (!heartUpDB.currentProfile) {
                try { await heartUpDB.getMyProfile(); } catch (e) { /* ignore */ }
            }
            const rows = await heartUpDB.getAssessments();
            const obj = {};
            rows.forEach(r => {
                const fileName = this._assessmentFileName(r);
                obj[fileName] = {
                    _supabaseId: r.id,
                    data: r.form_data || {},
                    createdAt: r.created_at,
                    filePath: `temp/assessmentSheet/${fileName}`
                };
            });
            return obj;
        }
        return JSON.parse(localStorage.getItem('assessments') || '{}');
    },

    async getAssessmentWithHtml(fileNameOrId) {
        if (heartUpDB.isReady()) {
            try {
                // IDで取得を試みる
                const id = this._extractSupabaseId(fileNameOrId);
                if (id) {
                    return await heartUpDB.getAssessmentById(id);
                }
                // ファイル名からの取得（レガシー）- 一覧から探す
                const all = await this.getAssessments();
                const entry = all[fileNameOrId];
                if (entry && entry._supabaseId) {
                    return await heartUpDB.getAssessmentById(entry._supabaseId);
                }
            } catch (e) {
                console.error('Supabase getAssessmentWithHtml error:', e);
            }
        }
        const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
        return assessments[fileNameOrId] || null;
    },

    async saveAssessment(fileName, html, data) {
        if (heartUpDB.isReady()) {
            try {
                const childName = data?.childName || fileName.replace(/_アセスメント.*$/, '');
                const result = await heartUpDB.createAssessment(childName, html, data);
                // localStorageにもキャッシュ（htmlなし）
                this._cacheAssessmentLocally(fileName, data, result.id);
                return result;
            } catch (e) {
                console.error('Supabase saveAssessment error:', e);
            }
        }
        // フォールバック: localStorageのみ
        const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
        assessments[fileName] = {
            html: html,
            data: data,
            createdAt: new Date().toISOString(),
            filePath: `temp/assessmentSheet/${fileName}`
        };
        localStorage.setItem('assessments', JSON.stringify(assessments));
    },

    async deleteAssessment(fileNameOrId) {
        if (heartUpDB.isReady()) {
            try {
                const id = this._extractSupabaseId(fileNameOrId);
                if (id) {
                    await heartUpDB.deleteAssessment(id);
                } else {
                    const all = await this.getAssessments();
                    const entry = all[fileNameOrId];
                    if (entry?._supabaseId) {
                        await heartUpDB.deleteAssessment(entry._supabaseId);
                    }
                }
            } catch (e) {
                console.error('Supabase deleteAssessment error:', e);
            }
        }
        const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
        delete assessments[fileNameOrId];
        localStorage.setItem('assessments', JSON.stringify(assessments));
    },

    // ============================================================
    // 支援計画
    // ============================================================

    async getSupportPlans() {
        if (heartUpDB.isReady()) {
            if (!heartUpDB.currentProfile) {
                try { await heartUpDB.getMyProfile(); } catch (e) { /* ignore */ }
            }
            const rows = await heartUpDB.getSupportPlans();
            const obj = {};
            rows.forEach(r => {
                const fileName = this._supportPlanFileName(r);
                obj[fileName] = {
                    _supabaseId: r.id,
                    childName: r.child_name,
                    planData: r.plan_data || {},
                    createdAt: r.created_at,
                    type: r.plan_type
                };
            });
            return obj;
        }
        return JSON.parse(localStorage.getItem('supportPlans') || '{}');
    },

    async getSupportPlanWithHtml(fileNameOrId) {
        if (heartUpDB.isReady()) {
            try {
                const id = this._extractSupabaseId(fileNameOrId);
                if (id) {
                    return await heartUpDB.getSupportPlanById(id);
                }
                const all = await this.getSupportPlans();
                const entry = all[fileNameOrId];
                if (entry?._supabaseId) {
                    return await heartUpDB.getSupportPlanById(entry._supabaseId);
                }
            } catch (e) {
                console.error('Supabase getSupportPlanWithHtml error:', e);
            }
        }
        const plans = JSON.parse(localStorage.getItem('supportPlans') || '{}');
        return plans[fileNameOrId] || null;
    },

    async saveSupportPlan(fileName, html, childName, planData, planType) {
        if (heartUpDB.isReady()) {
            try {
                const result = await heartUpDB.createSupportPlan(childName, planType || 'support', html, planData);
                this._cacheSupportPlanLocally(fileName, childName, planData, planType, result.id);
                return result;
            } catch (e) {
                console.error('Supabase saveSupportPlan error:', e);
            }
        }
        const plans = JSON.parse(localStorage.getItem('supportPlans') || '{}');
        plans[fileName] = {
            html: html,
            childName: childName,
            planData: planData,
            createdAt: new Date().toISOString(),
            type: planType || 'support'
        };
        localStorage.setItem('supportPlans', JSON.stringify(plans));
    },

    async deleteSupportPlan(fileNameOrId) {
        if (heartUpDB.isReady()) {
            try {
                const id = this._extractSupabaseId(fileNameOrId);
                if (id) {
                    await heartUpDB.deleteSupportPlan(id);
                } else {
                    const all = await this.getSupportPlans();
                    const entry = all[fileNameOrId];
                    if (entry?._supabaseId) await heartUpDB.deleteSupportPlan(entry._supabaseId);
                }
            } catch (e) {
                console.error('Supabase deleteSupportPlan error:', e);
            }
        }
        const plans = JSON.parse(localStorage.getItem('supportPlans') || '{}');
        delete plans[fileNameOrId];
        localStorage.setItem('supportPlans', JSON.stringify(plans));
    },

    // ============================================================
    // 活動記録
    // ============================================================

    async getDailyReports() {
        if (heartUpDB.isReady()) {
            if (!heartUpDB.currentProfile) {
                try { await heartUpDB.getMyProfile(); } catch (e) { /* ignore */ }
            }
            const rows = await heartUpDB.getDailyReports();
            const obj = {};
            rows.forEach(r => {
                const fileName = this._dailyReportFileName(r);
                obj[fileName] = {
                    _supabaseId: r.id,
                    childName: r.child_name,
                    date: r.report_date,
                    data: r.report_data || {},
                    createdAt: r.created_at
                };
            });
            return obj;
        }
        return JSON.parse(localStorage.getItem('dailyReports') || '{}');
    },

    async getDailyReportWithHtml(fileNameOrId) {
        if (heartUpDB.isReady()) {
            try {
                const id = this._extractSupabaseId(fileNameOrId);
                if (id) {
                    return await heartUpDB.getDailyReportById(id);
                }
                const all = await this.getDailyReports();
                const entry = all[fileNameOrId];
                if (entry?._supabaseId) {
                    return await heartUpDB.getDailyReportById(entry._supabaseId);
                }
            } catch (e) {
                console.error('Supabase getDailyReportWithHtml error:', e);
            }
        }
        const reports = JSON.parse(localStorage.getItem('dailyReports') || '{}');
        return reports[fileNameOrId] || null;
    },

    async saveDailyReport(fileName, html, childName, reportDate, reportData) {
        if (heartUpDB.isReady()) {
            try {
                const result = await heartUpDB.createDailyReport(childName, reportDate, html, reportData);
                this._cacheDailyReportLocally(fileName, childName, reportDate, reportData, result.id);
                return result;
            } catch (e) {
                console.error('Supabase saveDailyReport error:', e);
            }
        }
        const reports = JSON.parse(localStorage.getItem('dailyReports') || '{}');
        reports[fileName] = {
            html: html,
            childName: childName,
            date: reportDate,
            data: reportData,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('dailyReports', JSON.stringify(reports));
    },

    async updateDailyReport(fileNameOrId, updates) {
        let firebaseId = null;
        if (heartUpDB.isReady()) {
            try {
                firebaseId = this._extractSupabaseId(fileNameOrId);
                if (!firebaseId) {
                    const all = await this.getDailyReports();
                    const entry = all[fileNameOrId];
                    if (entry?._supabaseId) firebaseId = entry._supabaseId;
                }
                if (firebaseId) {
                    await heartUpDB.updateDailyReport(firebaseId, updates);
                }
            } catch (e) {
                console.error('Firebase updateDailyReport error:', e);
            }
        }
        const reports = JSON.parse(localStorage.getItem('dailyReports') || '{}');
        if (reports[fileNameOrId]) {
            if (updates.html !== undefined) reports[fileNameOrId].html = updates.html;
            if (updates.reportData !== undefined) reports[fileNameOrId].data = updates.reportData;
            localStorage.setItem('dailyReports', JSON.stringify(reports));
        }
    },

    async deleteDailyReport(fileNameOrId) {
        if (heartUpDB.isReady()) {
            try {
                const id = this._extractSupabaseId(fileNameOrId);
                if (id) {
                    await heartUpDB.deleteDailyReport(id);
                } else {
                    const all = await this.getDailyReports();
                    const entry = all[fileNameOrId];
                    if (entry?._supabaseId) await heartUpDB.deleteDailyReport(entry._supabaseId);
                }
            } catch (e) {
                console.error('Supabase deleteDailyReport error:', e);
            }
        }
        const reports = JSON.parse(localStorage.getItem('dailyReports') || '{}');
        delete reports[fileNameOrId];
        localStorage.setItem('dailyReports', JSON.stringify(reports));
    },

    // ============================================================
    // 振り返り
    // ============================================================

    async getReviews() {
        if (heartUpDB.isReady()) {
            if (!heartUpDB.currentProfile) {
                try { await heartUpDB.getMyProfile(); } catch (e) { /* ignore */ }
            }
            const rows = await heartUpDB.getReviews();
            const obj = {};
            rows.forEach(r => {
                const fileName = this._reviewFileName(r);
                obj[fileName] = {
                    _supabaseId: r.id,
                    childName: r.child_name,
                    data: r.review_data || {},
                    createdAt: r.created_at
                };
            });
            return obj;
        }
        return JSON.parse(localStorage.getItem('reviews') || '{}');
    },

    async getReviewWithHtml(fileNameOrId) {
        if (heartUpDB.isReady()) {
            try {
                const id = this._extractSupabaseId(fileNameOrId);
                if (id) {
                    return await heartUpDB.getReviewById(id);
                }
                const all = await this.getReviews();
                const entry = all[fileNameOrId];
                if (entry?._supabaseId) {
                    return await heartUpDB.getReviewById(entry._supabaseId);
                }
            } catch (e) {
                console.error('Supabase getReviewWithHtml error:', e);
            }
        }
        const reviews = JSON.parse(localStorage.getItem('reviews') || '{}');
        return reviews[fileNameOrId] || null;
    },

    async saveReview(fileName, html, childName, reviewData) {
        if (heartUpDB.isReady()) {
            try {
                const result = await heartUpDB.createReview(childName, html, reviewData);
                this._cacheReviewLocally(fileName, childName, reviewData, result.id);
                return result;
            } catch (e) {
                console.error('Supabase saveReview error:', e);
            }
        }
        const reviews = JSON.parse(localStorage.getItem('reviews') || '{}');
        reviews[fileName] = {
            html: html,
            childName: childName,
            data: reviewData,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('reviews', JSON.stringify(reviews));
    },

    async deleteReview(fileNameOrId) {
        if (heartUpDB.isReady()) {
            try {
                const id = this._extractSupabaseId(fileNameOrId);
                if (id) {
                    await heartUpDB.deleteReview(id);
                } else {
                    const all = await this.getReviews();
                    const entry = all[fileNameOrId];
                    if (entry?._supabaseId) await heartUpDB.deleteReview(entry._supabaseId);
                }
            } catch (e) {
                console.error('Supabase deleteReview error:', e);
            }
        }
        const reviews = JSON.parse(localStorage.getItem('reviews') || '{}');
        delete reviews[fileNameOrId];
        localStorage.setItem('reviews', JSON.stringify(reviews));
    },

    // ============================================================
    // ヘルパー
    // ============================================================

    _assessmentFileName(row) {
        const date = row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
        return `${row.child_name}_アセスメントシート_${date}.html`;
    },

    _supportPlanFileName(row) {
        const date = row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
        const typeLabel = row.plan_type === 'officialIndividual' ? '個別支援計画' :
                          row.plan_type === 'officialSupport' ? '専門的支援実施計画' : '支援計画';
        return `${row.child_name}_${typeLabel}_${date}.html`;
    },

    _dailyReportFileName(row) {
        const date = row.report_date || (row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
        return `${row.child_name}_活動記録_${date}.html`;
    },

    _reviewFileName(row) {
        const date = row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
        return `${row.child_name}_振り返り_${date}.html`;
    },

    _extractSupabaseId(fileNameOrId) {
        // UUID形式（Supabase）またはFirebase自動生成ID（20文字英数字）ならIDとみなす
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(fileNameOrId)) {
            return fileNameOrId;
        }
        if (/^[A-Za-z0-9]{15,}$/.test(fileNameOrId)) {
            return fileNameOrId;
        }
        return null;
    },

    _cacheAssessmentLocally(fileName, data, supabaseId) {
        const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
        assessments[fileName] = {
            _supabaseId: supabaseId,
            data: data,
            createdAt: new Date().toISOString(),
            filePath: `temp/assessmentSheet/${fileName}`
        };
        localStorage.setItem('assessments', JSON.stringify(assessments));
    },

    _cacheSupportPlanLocally(fileName, childName, planData, planType, supabaseId) {
        const plans = JSON.parse(localStorage.getItem('supportPlans') || '{}');
        plans[fileName] = {
            _supabaseId: supabaseId,
            childName: childName,
            planData: planData,
            createdAt: new Date().toISOString(),
            type: planType || 'support'
        };
        localStorage.setItem('supportPlans', JSON.stringify(plans));
    },

    _cacheDailyReportLocally(fileName, childName, reportDate, reportData, supabaseId) {
        const reports = JSON.parse(localStorage.getItem('dailyReports') || '{}');
        reports[fileName] = {
            _supabaseId: supabaseId,
            childName: childName,
            date: reportDate,
            data: reportData,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('dailyReports', JSON.stringify(reports));
    },

    _cacheReviewLocally(fileName, childName, reviewData, supabaseId) {
        const reviews = JSON.parse(localStorage.getItem('reviews') || '{}');
        reviews[fileName] = {
            _supabaseId: supabaseId,
            childName: childName,
            data: reviewData,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('reviews', JSON.stringify(reviews));
    }
};

// グローバルスコープで利用可能にする
window.dataAdapter = dataAdapter;

// ============================================
// 生年月日ユーティリティ（全ページ共通）
// ============================================

// 生年月日文字列を YYYY-MM-DD に正規化する
// 対応: 和暦（令和/平成/昭和/大正・元年・R/H/S略記）、西暦（YYYY年MM月DD日、YYYY-MM-DD、YYYY/MM/DD）
// 「平成29年06月20日 (8歳) (小学3年生)」のような注釈付き文字列も注釈を除去して解釈する
// 解釈できない場合は '' を返す
function normalizeBirthDate(str) {
    if (!str) return '';
    let s = String(str).trim();
    // 全角数字・全角スペースを半角に
    s = s.replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)).replace(/　/g, ' ');
    // 括弧内の注釈（年齢・学年など）を除去
    s = s.replace(/[（(][^（()）]*[）)]/g, ' ').trim();
    const pad = n => String(parseInt(n, 10)).padStart(2, '0');
    const isValid = (y, m, d) => {
        const dt = new Date(y, m - 1, d);
        return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
    };
    // 和暦
    const eraBase = { '令和': 2018, 'R': 2018, '平成': 1988, 'H': 1988, '昭和': 1925, 'S': 1925, '大正': 1911, 'T': 1911 };
    const wareki = s.match(/(令和|平成|昭和|大正|[RHST])\s*(元|\d{1,2})\s*[年.\/-]\s*(\d{1,2})\s*[月.\/-]\s*(\d{1,2})\s*日?/);
    if (wareki) {
        const eraYear = wareki[2] === '元' ? 1 : parseInt(wareki[2], 10);
        const y = eraBase[wareki[1]] + eraYear;
        const m = parseInt(wareki[3], 10), d = parseInt(wareki[4], 10);
        return isValid(y, m, d) ? `${y}-${pad(m)}-${pad(d)}` : '';
    }
    // 西暦
    const seireki = s.match(/(\d{4})\s*[年.\/-]\s*(\d{1,2})\s*[月.\/-]\s*(\d{1,2})\s*日?/);
    if (seireki) {
        const y = parseInt(seireki[1], 10), m = parseInt(seireki[2], 10), d = parseInt(seireki[3], 10);
        if (isValid(y, m, d)) return `${y}-${pad(m)}-${pad(d)}`;
    }
    return '';
}

// 生年月日を「平成29年6月20日」のような和暦表示に変換（変換不能なら元の文字列のまま返す）
function formatBirthDateJa(birthDateStr) {
    const iso = normalizeBirthDate(birthDateStr);
    if (!iso) return birthDateStr || '';
    const [y, m, d] = iso.split('-').map(n => parseInt(n, 10));
    const time = new Date(y, m - 1, d).getTime();
    const eras = [
        { name: '令和', start: new Date(2019, 4, 1).getTime(), base: 2018 },
        { name: '平成', start: new Date(1989, 0, 8).getTime(), base: 1988 },
        { name: '昭和', start: new Date(1926, 11, 25).getTime(), base: 1925 },
    ];
    for (const era of eras) {
        if (time >= era.start) {
            const eraYear = y - era.base;
            return `${era.name}${eraYear === 1 ? '元' : eraYear}年${m}月${d}日`;
        }
    }
    return `${y}年${m}月${d}日`;
}

// 生年月日から現在の満年齢を計算（不正な日付は null）
function calculateAgeFromBirthDate(birthDateStr) {
    const iso = normalizeBirthDate(birthDateStr);
    if (!iso) return null;
    const [y, m, d] = iso.split('-').map(n => parseInt(n, 10));
    const today = new Date();
    let age = today.getFullYear() - y;
    if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) {
        age--;
    }
    return age;
}

window.normalizeBirthDate = normalizeBirthDate;
window.formatBirthDateJa = formatBirthDateJa;
window.calculateAgeFromBirthDate = calculateAgeFromBirthDate;
