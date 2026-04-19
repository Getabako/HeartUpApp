// HeartUpApp Firebase Client
// Supabase互換インターフェース（heartUpDB）を提供

const heartUpDB = {
    db: null,
    auth: null,
    initialized: false,
    currentUser: null,
    currentProfile: null,

    // ============================================================
    // 初期化
    // ============================================================

    init() {
        if (this.initialized) return;
        if (typeof FIREBASE_CONFIG === 'undefined' || !FIREBASE_CONFIG.apiKey) {
            console.warn('Firebase設定が見つかりません。localStorageモードで動作します。');
            return;
        }
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.initialized = true;
        console.log('Firebase client initialized');
    },

    isReady() {
        return this.initialized && this.db !== null;
    },

    // ============================================================
    // 内部ヘルパー
    // ============================================================

    _ts(firestoreTimestamp) {
        if (!firestoreTimestamp) return new Date().toISOString();
        if (firestoreTimestamp.toDate) return firestoreTimestamp.toDate().toISOString();
        return firestoreTimestamp;
    },

    _locationQuery(collectionName, skipLocationFilter) {
        let ref = this.db.collection(collectionName);
        if (!skipLocationFilter && !this.isAdmin() && this.getMyLocationId()) {
            ref = ref.where('locationId', '==', this.getMyLocationId());
        }
        return ref;
    },

    // ============================================================
    // 認証
    // ============================================================

    async signInWithGoogle() {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const provider = new firebase.auth.GoogleAuthProvider();
        return this.auth.signInWithPopup(provider);
    },

    async signOut() {
        if (!this.isReady()) return;
        await this.auth.signOut();
        this.currentUser = null;
        this.currentProfile = null;
    },

    async getSession() {
        if (!this.isReady()) return null;
        return new Promise(resolve => {
            const unsub = this.auth.onAuthStateChanged(user => {
                unsub();
                resolve(user || null);
            });
        });
    },

    async getUser() {
        if (!this.isReady()) return null;
        const firebaseUser = this.auth.currentUser || await this.getSession();
        if (!firebaseUser) { this.currentUser = null; return null; }
        this.currentUser = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName
        };
        return this.currentUser;
    },

    onAuthStateChange(callback) {
        if (!this.isReady()) return { data: { subscription: { unsubscribe: () => {} } } };
        return this.auth.onAuthStateChanged(callback);
    },

    // ============================================================
    // スタッフプロフィール
    // ============================================================

    async getMyProfile() {
        if (!this.isReady()) return null;
        const user = await this.getUser();
        if (!user) return null;

        const doc = await this.db.collection('staff_profiles').doc(user.uid).get();
        if (!doc.exists) return null;

        const data = doc.data();
        // 拠点名も取得
        if (data.locationId) {
            try {
                const locDoc = await this.db.collection('locations').doc(data.locationId).get();
                if (locDoc.exists) data._locationName = locDoc.data().name;
            } catch (e) { /* ignore */ }
        }
        this.currentProfile = data;
        return data;
    },

    async checkInvitation(email) {
        if (!this.isReady()) return null;
        const snapshot = await this.db.collection('staff_invitations')
            .where('email', '==', email).limit(1).get();
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },

    async createProfileFromInvitation(userId, email, invitation) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const profileData = {
            email: email,
            name: invitation.name,
            role: invitation.role,
            locationId: invitation.locationId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await this.db.collection('staff_profiles').doc(userId).set(profileData);
        // 招待を削除
        await this.db.collection('staff_invitations').doc(invitation.id).delete();
        // 拠点名も取得
        try {
            const locDoc = await this.db.collection('locations').doc(invitation.locationId).get();
            if (locDoc.exists) profileData._locationName = locDoc.data().name;
        } catch (e) { /* ignore */ }
        this.currentProfile = profileData;
        return profileData;
    },

    async isFirstUser() {
        const snapshot = await this.db.collection('staff_profiles').limit(1).get();
        return snapshot.empty;
    },

    async bootstrapFirstAdmin(user) {
        // デフォルト拠点を作成
        const locRef = await this.db.collection('locations').add({
            name: 'デフォルト拠点',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        // admin プロフィールを作成
        const profileData = {
            email: user.email,
            name: user.displayName || user.email,
            role: 'admin',
            locationId: locRef.id,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await this.db.collection('staff_profiles').doc(user.uid).set(profileData);
        profileData._locationName = 'デフォルト拠点';
        this.currentProfile = profileData;
        return profileData;
    },

    getMyLocationId() {
        return this.currentProfile?.locationId || null;
    },

    getMyLocationName() {
        return this.currentProfile?._locationName || '';
    },

    isAdmin() {
        return this.currentProfile?.role === 'admin';
    },

    // ============================================================
    // 児童 CRUD
    // ============================================================

    async getChildren() {
        if (!this.isReady()) return [];
        const snapshot = await this._locationQuery('children').orderBy('name').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), created_at: this._ts(doc.data().createdAt) }));
    },

    async getChildByName(name) {
        if (!this.isReady()) return null;
        const locationId = this.getMyLocationId();
        let q = this.db.collection('children').where('name', '==', name);
        if (locationId) q = q.where('locationId', '==', locationId);
        const snapshot = await q.limit(1).get();
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },

    async getOrCreateChild(name) {
        let child = await this.getChildByName(name);
        if (child) return child;
        const locationId = this.getMyLocationId();
        if (!locationId) throw new Error('拠点が設定されていません');
        const docRef = await this.db.collection('children').add({
            name, locationId, metadata: {},
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id: docRef.id, name, locationId };
    },

    async updateChildLocation(childName, newLocationId) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const snapshot = await this.db.collection('children').where('name', '==', childName).get();
        if (snapshot.empty) throw new Error('児童が見つかりません: ' + childName);
        const batch = this.db.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { locationId: newLocationId || '' });
        });
        await batch.commit();
    },

    async deleteChildAndRelatedData(childName) {
        console.log('Firebase deleteChildAndRelatedData 開始:', childName);
        if (!this.isReady()) {
            console.error('Firebase未初期化');
            throw new Error('Firebase未初期化');
        }
        
        const batch = this.db.batch();
        const collections = ['children', 'assessments', 'support_plans', 'daily_reports', 'reviews'];
        let totalDeleted = 0;
        
        for (const col of collections) {
            const field = col === 'children' ? 'name' : 'childName';
            console.log(`Firebase ${col}削除検索:`, childName);
            const snapshot = await this.db.collection(col).where(field, '==', childName).get();
            console.log(`Firebase ${col}削除対象:`, snapshot.docs.length, '件');
            
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
                totalDeleted++;
            });
        }
        
        console.log('Firebaseバッチコミット: 合計', totalDeleted, '件の削除');
        await batch.commit();
        
        // 削除の検証: childrenコレクションに残っていないか確認
        const verify = await this.db.collection('children').where('name', '==', childName).get();
        if (!verify.empty) {
            console.error('Firebase削除検証失敗: データが残っています');
            throw new Error('Firebaseからの削除に失敗しました。データが残っています。');
        }
        
        console.log('Firebase deleteChildAndRelatedData 完了:', childName, totalDeleted, '件削除');
    },

    // ============================================================
    // アセスメント CRUD
    // ============================================================

    async getAssessments() {
        if (!this.isReady()) return [];
        const snapshot = await this._locationQuery('assessments').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const d = doc.data();
            return { id: doc.id, child_name: d.childName, form_data: d.formData || {}, created_at: this._ts(d.createdAt) };
        });
    },

    async getAssessmentById(id) {
        if (!this.isReady()) return null;
        const doc = await this.db.collection('assessments').doc(id).get();
        if (!doc.exists) return null;
        const d = doc.data();
        return { id: doc.id, child_name: d.childName, html: d.html, form_data: d.formData || {}, created_at: this._ts(d.createdAt) };
    },

    async createAssessment(childName, html, formData) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const child = await this.getOrCreateChild(childName);
        const locationId = this.getMyLocationId();
        const docRef = await this.db.collection('assessments').add({
            childId: child.id, childName, locationId,
            html: html || '', formData: formData || {},
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id: docRef.id, child_name: childName };
    },

    async deleteAssessment(id) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        await this.db.collection('assessments').doc(id).delete();
    },

    // ============================================================
    // 支援計画 CRUD
    // ============================================================

    async getSupportPlans() {
        if (!this.isReady()) return [];
        const snapshot = await this._locationQuery('support_plans').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const d = doc.data();
            return { id: doc.id, child_name: d.childName, plan_type: d.planType, plan_data: d.planData || {}, created_at: this._ts(d.createdAt) };
        });
    },

    async getSupportPlanById(id) {
        if (!this.isReady()) return null;
        const doc = await this.db.collection('support_plans').doc(id).get();
        if (!doc.exists) return null;
        const d = doc.data();
        return { id: doc.id, child_name: d.childName, html: d.html, plan_type: d.planType, plan_data: d.planData || {}, created_at: this._ts(d.createdAt) };
    },

    async createSupportPlan(childName, planType, html, planData) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const child = await this.getOrCreateChild(childName);
        const locationId = this.getMyLocationId();
        const docRef = await this.db.collection('support_plans').add({
            childId: child.id, childName, locationId,
            planType: planType || 'support', html: html || '', planData: planData || {},
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id: docRef.id, child_name: childName };
    },

    async deleteSupportPlan(id) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        await this.db.collection('support_plans').doc(id).delete();
    },

    // ============================================================
    // 活動記録 CRUD
    // ============================================================

    async getDailyReports() {
        if (!this.isReady()) return [];
        const snapshot = await this._locationQuery('daily_reports').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const d = doc.data();
            return { id: doc.id, child_name: d.childName, report_date: d.reportDate, report_data: d.reportData || {}, created_at: this._ts(d.createdAt) };
        });
    },

    async getDailyReportById(id) {
        if (!this.isReady()) return null;
        const doc = await this.db.collection('daily_reports').doc(id).get();
        if (!doc.exists) return null;
        const d = doc.data();
        return { id: doc.id, child_name: d.childName, html: d.html, report_date: d.reportDate, report_data: d.reportData || {}, created_at: this._ts(d.createdAt) };
    },

    async createDailyReport(childName, reportDate, html, reportData) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const child = await this.getOrCreateChild(childName);
        const locationId = this.getMyLocationId();
        const docRef = await this.db.collection('daily_reports').add({
            childId: child.id, childName, locationId,
            reportDate: reportDate || null, html: html || '', reportData: reportData || {},
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id: docRef.id, child_name: childName };
    },

    async updateDailyReport(id, updates) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const data = { updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
        if (updates.html !== undefined) data.html = updates.html;
        if (updates.reportData !== undefined) data.reportData = updates.reportData;
        await this.db.collection('daily_reports').doc(id).update(data);
        return { id };
    },

    async deleteDailyReport(id) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        await this.db.collection('daily_reports').doc(id).delete();
    },

    // ============================================================
    // 振り返り CRUD
    // ============================================================

    async getReviews() {
        if (!this.isReady()) return [];
        const snapshot = await this._locationQuery('reviews').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const d = doc.data();
            return { id: doc.id, child_name: d.childName, review_data: d.reviewData || {}, created_at: this._ts(d.createdAt) };
        });
    },

    async getReviewById(id) {
        if (!this.isReady()) return null;
        const doc = await this.db.collection('reviews').doc(id).get();
        if (!doc.exists) return null;
        const d = doc.data();
        return { id: doc.id, child_name: d.childName, html: d.html, review_data: d.reviewData || {}, created_at: this._ts(d.createdAt) };
    },

    async createReview(childName, html, reviewData) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const child = await this.getOrCreateChild(childName);
        const locationId = this.getMyLocationId();
        const docRef = await this.db.collection('reviews').add({
            childId: child.id, childName, locationId,
            html: html || '', reviewData: reviewData || {},
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id: docRef.id, child_name: childName };
    },

    async deleteReview(id) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        await this.db.collection('reviews').doc(id).delete();
    },

    // ============================================================
    // Admin: 拠点管理
    // ============================================================

    async getLocations() {
        if (!this.isReady()) return [];
        const snapshot = await this.db.collection('locations').orderBy('name').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), created_at: this._ts(doc.data().createdAt) }));
    },

    async createLocation(name) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const docRef = await this.db.collection('locations').add({
            name, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id: docRef.id, name };
    },

    async updateLocation(id, name) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        await this.db.collection('locations').doc(id).update({ name });
        return { id, name };
    },

    async deleteLocation(id) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        await this.db.collection('locations').doc(id).delete();
    },

    // ============================================================
    // Admin: スタッフ管理
    // ============================================================

    async getStaffProfiles() {
        if (!this.isReady()) return [];
        const snapshot = await this.db.collection('staff_profiles').orderBy('name').get();
        const profiles = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            // 拠点名を取得
            let locationName = '';
            if (data.locationId) {
                try {
                    const locDoc = await this.db.collection('locations').doc(data.locationId).get();
                    if (locDoc.exists) locationName = locDoc.data().name;
                } catch (e) { /* ignore */ }
            }
            profiles.push({ id: doc.id, ...data, locations: { name: locationName } });
        }
        return profiles;
    },

    async updateStaffRole(staffId, role) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        await this.db.collection('staff_profiles').doc(staffId).update({ role });
        return { id: staffId, role };
    },

    async updateStaffLocation(staffId, locationId) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        await this.db.collection('staff_profiles').doc(staffId).update({ location_id: locationId });
        return { id: staffId };
    },

    // ============================================================
    // Admin: 招待管理
    // ============================================================

    async getInvitations() {
        if (!this.isReady()) return [];
        const snapshot = await this.db.collection('staff_invitations').orderBy('createdAt', 'desc').get();
        const invitations = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            let locationName = '';
            if (data.locationId) {
                try {
                    const locDoc = await this.db.collection('locations').doc(data.locationId).get();
                    if (locDoc.exists) locationName = locDoc.data().name;
                } catch (e) { /* ignore */ }
            }
            invitations.push({ id: doc.id, ...data, locations: { name: locationName } });
        }
        return invitations;
    },

    async createInvitation(email, name, role, locationId) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const docRef = await this.db.collection('staff_invitations').add({
            email, name, role, locationId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id: docRef.id, email, name, role, locationId };
    },

    async deleteInvitation(id) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        await this.db.collection('staff_invitations').doc(id).delete();
    },

    // ============================================================
    // データ移行（localStorageから一括インポート）
    // ============================================================

    async migrateFromLocalStorage(locationId) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const results = { children: 0, assessments: 0, supportPlans: 0, dailyReports: 0, reviews: 0 };
        const childMap = {};
        const db = this.db;

        async function ensureChild(name) {
            if (childMap[name]) return childMap[name];
            const snapshot = await db.collection('children')
                .where('name', '==', name).where('locationId', '==', locationId).limit(1).get();
            if (!snapshot.empty) {
                childMap[name] = snapshot.docs[0].id;
                return childMap[name];
            }
            const docRef = await db.collection('children').add({
                name, locationId, metadata: {},
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            childMap[name] = docRef.id;
            results.children++;
            return docRef.id;
        }

        // children
        const childrenData = JSON.parse(localStorage.getItem('children') || '{}');
        for (const name of Object.keys(childrenData)) {
            await ensureChild(name);
        }

        // assessments
        const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
        for (const [, val] of Object.entries(assessments)) {
            const childName = val.data?.childName || 'unknown';
            const childId = await ensureChild(childName);
            await db.collection('assessments').add({
                childId, childName, locationId,
                html: val.html || '', formData: val.data || {},
                createdAt: new Date(val.createdAt || Date.now())
            });
            results.assessments++;
        }

        // supportPlans
        const supportPlans = JSON.parse(localStorage.getItem('supportPlans') || '{}');
        for (const [, val] of Object.entries(supportPlans)) {
            const childName = val.childName || 'unknown';
            const childId = await ensureChild(childName);
            await db.collection('support_plans').add({
                childId, childName, locationId,
                planType: val.type || 'support', html: val.html || '', planData: val.planData || {},
                createdAt: new Date(val.createdAt || Date.now())
            });
            results.supportPlans++;
        }

        // dailyReports
        const dailyReports = JSON.parse(localStorage.getItem('dailyReports') || '{}');
        for (const [, val] of Object.entries(dailyReports)) {
            const childName = val.childName || 'unknown';
            const childId = await ensureChild(childName);
            await db.collection('daily_reports').add({
                childId, childName, locationId,
                reportDate: val.date || null, html: val.html || '', reportData: val.data || {},
                createdAt: new Date(val.createdAt || Date.now())
            });
            results.dailyReports++;
        }

        // reviews
        const reviews = JSON.parse(localStorage.getItem('reviews') || '{}');
        for (const [, val] of Object.entries(reviews)) {
            const childName = val.childName || 'unknown';
            const childId = await ensureChild(childName);
            await db.collection('reviews').add({
                childId, childName, locationId,
                html: val.html || '', reviewData: val.data || {},
                createdAt: new Date(val.createdAt || Date.now())
            });
            results.reviews++;
        }

        return results;
    }
};
