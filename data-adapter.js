// HeartUpApp Data Adapter
// localStorage互換のインターフェースを提供し、Supabase接続時はSupabaseを使う
// 旧コードの JSON.parse(localStorage.getItem('xxx')) を await dataAdapter.getXxx() に置換するだけで移行可能

const dataAdapter = {

    // ============================================================
    // 児童
    // ============================================================

    async getChildren() {
        if (heartUpDB.isReady()) {
            try {
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
            } catch (e) {
                console.error('Supabase getChildren error:', e);
            }
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
            try {
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
            } catch (e) {
                console.error('Supabase getAssessments error:', e);
            }
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
            try {
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
            } catch (e) {
                console.error('Supabase getSupportPlans error:', e);
            }
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
            try {
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
            } catch (e) {
                console.error('Supabase getDailyReports error:', e);
            }
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
            try {
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
            } catch (e) {
                console.error('Supabase getReviews error:', e);
            }
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
    },
    
    // 児童の拠点を更新
    async updateChildLocation(childName, newLocationName) {
        console.log('dataAdapter.updateChildLocation:', childName, '→', newLocationName);
        
        // 拠点名からlocationIdを取得（簡易実装）
        let locationId = '';
        if (newLocationName === 'デフォルト拠点') {
            locationId = 'default';
        } else if (newLocationName === 'カラーズFC鳥栖') {
            locationId = 'colors_tosu';
        } else if (newLocationName === '鳥栖') {
            locationId = 'tosu';
        }
        
        console.log('対応するlocationId:', locationId);
        
        // Firebaseに接続されている場合
        if (heartUpDB.isReady()) {
            try {
                console.log('Firebaseで拠点更新を実行');
                // 実際のFirebase更新処理（後で実装）
                // await heartUpDB.updateChildLocation(childName, locationId, newLocationName);
                console.log('Firebase更新完了（仮）');
            } catch (error) {
                console.error('Firebase拠点更新エラー:', error);
                throw error;
            }
        }
        
        // localStorageの更新
        const children = JSON.parse(localStorage.getItem('children') || '{}');
        if (children[childName]) {
            console.log('localStorageの児童データを更新:', childName);
            children[childName].locationId = locationId;
            // 拠点名もメタデータに保存（表示用）
            if (!children[childName].metadata) {
                children[childName].metadata = {};
            }
            children[childName].metadata.locationName = newLocationName;
            localStorage.setItem('children', JSON.stringify(children));
            console.log('localStorage更新完了');
        } else {
            console.warn('児童が見つかりません:', childName);
            // 新規作成
            children[childName] = {
                id: 'local_' + Date.now(),
                createdAt: new Date().toISOString(),
                locationId: locationId,
                metadata: {
                    locationName: newLocationName
                }
            };
            localStorage.setItem('children', JSON.stringify(children));
            console.log('新規児童データを作成');
        }
        
        // 関連データの拠点情報も更新（assessments, supportPlans, dailyReports, reviews）
        this._updateRelatedDataLocation(childName, newLocationName);
        
        console.log('拠点更新完了:', childName, '→', newLocationName);
        return true;
    },
    
    // 関連データの拠点情報を更新
    _updateRelatedDataLocation(childName, newLocationName) {
        console.log('関連データの拠点情報を更新:', childName, newLocationName);
        
        // assessmentsの更新
        const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
        Object.entries(assessments).forEach(([fileName, assessment]) => {
            if (assessment.data?.childName === childName) {
                console.log('assessmentの拠点情報を更新:', fileName);
                assessment.data.locationName = newLocationName;
            }
        });
        localStorage.setItem('assessments', JSON.stringify(assessments));
        
        // supportPlansの更新
        const supportPlans = JSON.parse(localStorage.getItem('supportPlans') || '{}');
        Object.entries(supportPlans).forEach(([fileName, plan]) => {
            if (plan.childName === childName) {
                console.log('supportPlanの拠点情報を更新:', fileName);
                plan.locationName = newLocationName;
            }
        });
        localStorage.setItem('supportPlans', JSON.stringify(supportPlans));
        
        // dailyReportsの更新
        const dailyReports = JSON.parse(localStorage.getItem('dailyReports') || '{}');
        Object.entries(dailyReports).forEach(([fileName, report]) => {
            if (report.childName === childName) {
                console.log('dailyReportの拠点情報を更新:', fileName);
                report.locationName = newLocationName;
            }
        });
        localStorage.setItem('dailyReports', JSON.stringify(dailyReports));
        
        // reviewsの更新
        const reviews = JSON.parse(localStorage.getItem('reviews') || '{}');
        Object.entries(reviews).forEach(([fileName, review]) => {
            if (review.childName === childName) {
                console.log('reviewの拠点情報を更新:', fileName);
                review.locationName = newLocationName;
            }
        });
        localStorage.setItem('reviews', JSON.stringify(reviews));
        
        console.log('関連データの更新完了');
    }
};

// グローバルスコープで利用可能にする
window.dataAdapter = dataAdapter;
