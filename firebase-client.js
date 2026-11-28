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
        // 認証状態をブラウザに永続化（ページ遷移後もログインを維持）。
        // ログインボタンを押した後にこれを待つと、iPhone ではログインの小窓が止められるので、ここで先に済ませる
        this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(e => console.warn('setPersistence失敗:', e));
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
            // 同じグループ（エリア）の拠点どうしは、互いの児童・記録を見られる
            const ids = this.getMyGroupLocationIds();
            ref = ids.length > 1
                ? ref.where('locationId', 'in', ids.slice(0, 10))
                : ref.where('locationId', '==', this.getMyLocationId());
        }
        return ref;
    },

    // 拠点のグループ名。管理画面で決めた値を優先し、未設定なら拠点名から決める
    locationGroupOf(loc) {
        if (!loc) return '';
        if (typeof loc.group === 'string') return loc.group.trim();
        const name = String(loc.name || '');
        if (/大正町|古野町|プリマ|鳥栖/.test(name)) return '鳥栖エリア';
        if (/長南/.test(name)) return '長南エリア';
        return '';
    },

    // 自分の拠点と同じグループの拠点 ID を覚える（ログイン時に 1 回）
    async _loadMyGroup(locationId) {
        this._groupLocationIds = locationId ? [locationId] : [];
        this._groupName = '';
        if (!locationId) return;
        try {
            const snap = await this.db.collection('locations').get();
            const locs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            const mine = locs.find(l => l.id === locationId);
            const group = this.locationGroupOf(mine);
            if (!group) return;
            const ids = locs.filter(l => this.locationGroupOf(l) === group).map(l => l.id);
            // 自分の拠点を先頭にする
            this._groupLocationIds = [locationId, ...ids.filter(id => id !== locationId)];
            this._groupName = group;
        } catch (e) { console.warn('拠点グループの読み込みに失敗:', e); }
    },

    getMyGroupLocationIds() {
        const my = this.getMyLocationId();
        if (!my) return [];
        const ids = this._groupLocationIds || [];
        return ids.length && ids[0] === my ? ids : [my];
    },

    getMyGroupName() {
        return this._groupName || '';
    },

    // クライアント側ソート（Firestore複合インデックス不要にするため）
    // equalityフィルタ(locationId) + orderBy を同時に使うと複合インデックスが必要になるため、
    // 並べ替えはJS側で行う。1拠点あたりの件数は小さく性能問題はない。
    _sortByName(docs) {
        return docs.slice().sort((a, b) =>
            String(a.data().name || '').localeCompare(String(b.data().name || ''), 'ja'));
    },

    _sortByCreatedDesc(docs) {
        const ms = (d) => {
            const c = d.data().createdAt;
            if (!c) return 0;
            if (c.toMillis) return c.toMillis();
            if (c.seconds) return c.seconds * 1000;
            const t = new Date(c).getTime();
            return isNaN(t) ? 0 : t;
        };
        return docs.slice().sort((a, b) => ms(b) - ms(a));
    },

    // ============================================================
    // 認証
    // ============================================================

    // ボタンを押したその場で小窓を開く（前に await を挟まない。挟むと iPhone で小窓が止められる）
    signInWithGoogle() {
        if (!this.isReady()) return Promise.reject(new Error('Firebase未初期化'));
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
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
        let data;
        if (doc.exists) {
            data = doc.data();
        } else {
            // UIDキーで見つからない場合、同一メールの既存プロフィールを引き継ぐ。
            // （Firebaseプロジェクト/プロジェクトID変更等でUIDが変わり、旧UIDキーの
            //   プロフィールが残っているケースに対応。登録画面の板挟みを防ぐ）
            const existing = await this.findProfileByEmail(user.email);
            if (!existing) return null;
            const { id: oldId } = existing;
            data = {
                email: existing.email,
                name: existing.name,
                role: existing.role,
                locationId: existing.locationId,
                createdAt: existing.createdAt || firebase.firestore.FieldValue.serverTimestamp()
            };
            try {
                // 現在のUIDをキーに作り直し、旧ドキュメントを削除（重複解消）
                await this.db.collection('staff_profiles').doc(user.uid).set(data, { merge: true });
                if (oldId && oldId !== user.uid) {
                    await this.db.collection('staff_profiles').doc(oldId).delete();
                }
            } catch (e) { console.warn('プロフィール引き継ぎに失敗:', e); }
        }

        // 拠点名も取得
        if (data.locationId) {
            try {
                const locDoc = await this.db.collection('locations').doc(data.locationId).get();
                if (locDoc.exists) data._locationName = locDoc.data().name;
            } catch (e) { /* ignore */ }
            if (data.role !== 'admin') await this._loadMyGroup(data.locationId);
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
        // 重複プロフィール防止
        const existing = await this.findProfileByEmail(email);
        if (existing && existing.id !== userId) {
            throw new Error(`このメール（${email}）は既に登録されています。管理者に既存プロフィールの削除を依頼してください。`);
        }
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
        if (profileData.role !== 'admin') await this._loadMyGroup(profileData.locationId);
        this.currentProfile = profileData;
        return profileData;
    },

    async isFirstUser() {
        const snapshot = await this.db.collection('staff_profiles').limit(1).get();
        return snapshot.empty;
    },

    async bootstrapFirstAdmin(user) {
        // 重複プロフィール防止
        const existing = await this.findProfileByEmail(user.email);
        if (existing && existing.id !== user.uid) {
            throw new Error(`このメール（${user.email}）は既に別アカウントで登録されています。管理者に既存プロフィールの削除を依頼してください。`);
        }
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
        const snapshot = await this._locationQuery('children').get();
        return this._sortByName(snapshot.docs).map(doc => ({ id: doc.id, ...doc.data(), created_at: this._ts(doc.data().createdAt) }));
    },

    async getChildByName(name) {
        if (!this.isReady()) return null;
        const locationId = this.getMyLocationId();
        // 複合インデックス回避: name単一フィルタで取得し、locationIdはJS側で絞る
        const snapshot = await this.db.collection('children').where('name', '==', name).get();
        if (snapshot.empty) return null;
        let docs = snapshot.docs;
        if (!this.isAdmin() && locationId) {
            // 自分の拠点の児童を優先し、いなければ同じグループの拠点の児童
            const ids = this.getMyGroupLocationIds();
            docs = docs.filter(d => ids.includes(d.data().locationId || ''))
                .sort((a, b) => ids.indexOf(a.data().locationId || '') - ids.indexOf(b.data().locationId || ''));
        }
        if (docs.length === 0) return null;
        return { id: docs[0].id, ...docs[0].data() };
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

    async updateChildBasicInfo(childName, info) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const snapshot = await this.db.collection('children').where('name', '==', childName).get();
        if (snapshot.empty) throw new Error('児童が見つかりません: ' + childName);
        const allowed = ['childNameKana', 'birthDate', 'gender', 'diagnosis', 'staffNotes', 'attendDays'];
        const updateData = { updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
        allowed.forEach(k => {
            if (info[k] !== undefined) updateData[k] = info[k];
        });
        const batch = this.db.batch();
        snapshot.docs.forEach(doc => batch.update(doc.ref, updateData));
        await batch.commit();
    },

    async deleteChildAndRelatedData(childName, childId, assessmentIds) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const collections = ['children', 'assessments', 'support_plans', 'daily_reports', 'reviews'];
        // 5 つの検索は同時に行う（順番に待つと、電波が弱いときに長くかかる）
        const snaps = await Promise.all(collections.map(col =>
            this.db.collection(col).where(col === 'children' ? 'name' : 'childName', '==', childName).get()));
        const refs = new Map();
        snaps.forEach(snap => snap.docs.forEach(doc => refs.set(doc.ref.path, doc.ref)));
        // 名前の表記ゆれで検索に掛からなくても、一覧に出ている児童そのものは必ず消す
        if (childId) { const r = this.db.collection('children').doc(childId); refs.set(r.path, r); }
        (assessmentIds || []).forEach(id => { const r = this.db.collection('assessments').doc(id); refs.set(r.path, r); });
        // 1 回にまとめて消せるのは 500 件まで。多いときは分ける
        const all = Array.from(refs.values());
        for (let k = 0; k < all.length; k += 400) {
            const batch = this.db.batch();
            all.slice(k, k + 400).forEach(r => batch.delete(r));
            await batch.commit();
        }
        console.log('Firebase deleteChildAndRelatedData 完了:', childName, all.length, '件削除');
    },

    // ============================================================
    // アセスメント CRUD
    // ============================================================

    async getAssessments() {
        if (!this.isReady()) return [];
        const snapshot = await this._locationQuery('assessments').get();
        return this._sortByCreatedDesc(snapshot.docs).map(doc => {
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
        const snapshot = await this._locationQuery('support_plans').get();
        return this._sortByCreatedDesc(snapshot.docs).map(doc => {
            const d = doc.data();
            return { id: doc.id, child_name: d.childName, plan_type: d.planType, plan_data: d.planData || {}, location_id: d.locationId || '', created_at: this._ts(d.createdAt) };
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

    async updateSupportPlan(id, updates) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const data = { updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
        if (updates.html !== undefined) data.html = updates.html;
        if (updates.planData !== undefined) data.planData = updates.planData;
        await this.db.collection('support_plans').doc(id).update(data);
        return { id };
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
        const snapshot = await this._locationQuery('daily_reports').get();
        return this._sortByCreatedDesc(snapshot.docs).map(doc => {
            const d = doc.data();
            return { id: doc.id, child_name: d.childName, report_date: d.reportDate, report_data: d.reportData || {}, location_id: d.locationId || '', created_at: this._ts(d.createdAt) };
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
        // 児童の登録が引けなくても（拠点が未設定の管理者など）、記録そのものは名前で保存する
        let child = { id: null };
        try { child = await this.getOrCreateChild(childName); } catch (e) { console.warn('児童の登録を引けませんでした:', childName, e); }
        const locationId = this.getMyLocationId() || child.locationId || '';
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
        const snapshot = await this._locationQuery('reviews').get();
        return this._sortByCreatedDesc(snapshot.docs).map(doc => {
            const d = doc.data();
            return { id: doc.id, child_name: d.childName, review_data: d.reviewData || {}, location_id: d.locationId || '', created_at: this._ts(d.createdAt) };
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

    // 拠点の設定を更新（例: { noSoccer: true } = サッカー活動を行わない拠点）
    async updateLocationSettings(id, settings) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        await this.db.collection('locations').doc(id).update(settings || {});
        this._locationsCache = null;
        return { id };
    },

    // 拠点一覧のキャッシュ付き取得（記録生成時の拠点設定参照用）
    async getLocationsCached() {
        if (!this.isReady()) return [];
        if (this._locationsCache && (Date.now() - this._locationsCacheAt) < 60000) return this._locationsCache;
        this._locationsCache = await this.getLocations();
        this._locationsCacheAt = Date.now();
        return this._locationsCache;
    },

    async deleteLocation(id) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        await this.db.collection('locations').doc(id).delete();
    },

    // 拠点に紐づくデータ件数を集計（マージ前の確認用）
    async countLocationUsage(locationId) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const cols = ['children', 'assessments', 'support_plans', 'daily_reports', 'reviews', 'staff_profiles'];
        const counts = {};
        for (const col of cols) {
            const snap = await this.db.collection(col).where('locationId', '==', locationId).get();
            counts[col] = snap.size;
        }
        return counts;
    },

    // 拠点マージ: fromId に紐づく全データを toId に書き換え → fromId 拠点を削除
    // データ削除は一切行わない（locationId の更新のみ）
    async mergeLocations(fromId, toId) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        if (fromId === toId) throw new Error('同一の拠点はマージできません');
        // toId 拠点が存在することを確認
        const toDoc = await this.db.collection('locations').doc(toId).get();
        if (!toDoc.exists) throw new Error('統合先の拠点が存在しません');

        const cols = ['children', 'assessments', 'support_plans', 'daily_reports', 'reviews', 'staff_profiles'];
        const moved = {};

        for (const col of cols) {
            const snap = await this.db.collection(col).where('locationId', '==', fromId).get();
            moved[col] = snap.size;
            // Firestoreのバッチは500件まで → 分割
            const docs = snap.docs;
            for (let i = 0; i < docs.length; i += 400) {
                const batch = this.db.batch();
                docs.slice(i, i + 400).forEach(d => batch.update(d.ref, { locationId: toId }));
                await batch.commit();
            }
        }

        // 移行後の検証
        const remain = await this.countLocationUsage(fromId);
        const total = Object.values(remain).reduce((a, b) => a + b, 0);
        if (total > 0) {
            throw new Error(`マージ検証失敗: ${fromId} に ${total} 件のデータが残存しています`);
        }

        // 空になった拠点を削除
        await this.db.collection('locations').doc(fromId).delete();
        return { moved };
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
        await this.db.collection('staff_profiles').doc(staffId).update({ locationId: locationId || '' });
        return { id: staffId };
    },

    async deleteStaffProfile(staffId) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        // 自分自身は削除させない（admin操作中の事故防止）
        const user = await this.getUser();
        if (user && user.uid === staffId) {
            throw new Error('自分自身のプロフィールは削除できません');
        }
        await this.db.collection('staff_profiles').doc(staffId).delete();
    },

    async findProfileByEmail(email) {
        if (!this.isReady()) return null;
        const snapshot = await this.db.collection('staff_profiles').where('email', '==', email).limit(1).get();
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
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
            // 複合インデックス回避: nameで取得しlocationIdはJS側で絞る
            const snapshot = await db.collection('children').where('name', '==', name).get();
            const match = snapshot.docs.find(d => (d.data().locationId || '') === locationId);
            if (match) {
                childMap[name] = match.id;
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
    },

    // ============================================================
    // 勉強会資料（アップロードPDF）
    // PDFはbase64化して study_resources/{id}/chunks/{n} に分割保存する
    // （Firestoreの1ドキュメント1MiB制限のため）
    // ============================================================

    // ============================================================
    // AI生成練習メニュー（拠点ごと）
    // ============================================================

    async getGeneratedMenus() {
        if (!this.isReady()) return [];
        // 練習メニューは全拠点で共有する（どの拠点が作ったものも見られる）
        const snapshot = await this._locationQuery('generated_menus', true).get();
        return this._sortByCreatedDesc(snapshot.docs).map(doc => ({ id: doc.id, ...doc.data(), created_at: this._ts(doc.data().createdAt) }));
    },

    async createGeneratedMenu(menu) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const locationId = this.getMyLocationId();
        const docRef = await this.db.collection('generated_menus').add({
            ...menu, locationId,
            createdBy: this.currentProfile?.name || this.currentProfile?.email || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id: docRef.id };
    },

    async updateGeneratedMenu(id, updates) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        await this.db.collection('generated_menus').doc(id).update({ ...updates, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        return { id };
    },

    async deleteGeneratedMenu(id) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        await this.db.collection('generated_menus').doc(id).delete();
    },

    // ============================================================
    // ためたメモ（その日のうちに、複数のスタッフが児童ごとに書きためる。一括記録で使う）
    // ============================================================

    async getMemoStock(date) {
        if (!this.isReady()) return [];
        const snapshot = await this._locationQuery('memo_stock').where('date', '==', date).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: this._ts(doc.data().createdAt) }))
            .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    },

    async addMemoStock(memo) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const docRef = await this.db.collection('memo_stock').add({
            childName: memo.childName, date: memo.date, text: memo.text,
            locationId: this.getMyLocationId() || '',
            staffName: this.currentProfile?.name || this.currentProfile?.email || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id: docRef.id };
    },

    async deleteMemoStock(id) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        await this.db.collection('memo_stock').doc(id).delete();
    },

    async getStudyResources() {
        if (!this.isReady()) return [];
        const snapshot = await this.db.collection('study_resources').get();
        return this._sortByCreatedDesc(snapshot.docs).map(d => ({ id: d.id, ...d.data(), createdAt: this._ts(d.data().createdAt) }));
    },

    async saveStudyResource(meta, base64Data, onProgress) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const CHUNK_SIZE = 700000; // 700KB相当（1MiB制限に対して余裕を持たせる）
        const chunkCount = Math.ceil(base64Data.length / CHUNK_SIZE);

        const docRef = await this.db.collection('study_resources').add({
            title: meta.title,
            description: meta.description || '',
            category: meta.category || 'other',
            tags: meta.tags || [],
            date: meta.date,
            fileName: meta.fileName || '',
            fileSize: meta.fileSize || 0,
            chunkCount: chunkCount,
            uploadedBy: this.currentUser?.email || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        try {
            for (let i = 0; i < chunkCount; i++) {
                await docRef.collection('chunks').doc(String(i).padStart(4, '0')).set({
                    index: i,
                    data: base64Data.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
                });
                if (onProgress) onProgress(i + 1, chunkCount);
            }
        } catch (e) {
            // 途中で失敗したら中途半端なデータを残さない
            await this.deleteStudyResource(docRef.id).catch(() => {});
            throw e;
        }
        return docRef.id;
    },

    async getStudyResourcePdf(id) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const snapshot = await this.db.collection('study_resources').doc(id).collection('chunks').get();
        const chunks = snapshot.docs
            .map(d => d.data())
            .sort((a, b) => a.index - b.index)
            .map(c => c.data);
        return chunks.join('');
    },

    async deleteStudyResource(id) {
        if (!this.isReady()) throw new Error('Firebase未初期化');
        const docRef = this.db.collection('study_resources').doc(id);
        const chunks = await docRef.collection('chunks').get();
        for (const d of chunks.docs) {
            await d.ref.delete();
        }
        await docRef.delete();
    }
};

// ============================================================
// 一覧の読み込みを軽くする（2026-11-25）
// 児童・アセスメント・支援計画・記録・振り返り・拠点の一覧は、画面を切り替えるたびに
// 全件を取り直していた。短い時間だけ覚えておき、同時に来た要求は 1 回にまとめる。
// 何かを保存・更新・削除したら、覚えた分は捨てて次は取り直す。
// ============================================================
(function () {
    const LISTS = ['getChildren', 'getAssessments', 'getSupportPlans', 'getDailyReports', 'getReviews', 'getLocations'];
    const TTL = 3 * 60 * 1000;
    let cache = {};
    // 行ごとに浅く写して返す（日時の型を壊さないため、深い複製はしない）
    const clone = (v) => (Array.isArray(v) ? v.map(r => (r && typeof r === 'object' ? Object.assign({}, r) : r)) : v);
    const scope = () => {
        try { return (heartUpDB.isAdmin() ? 'admin' : 'staff') + '|' + (heartUpDB.getMyGroupLocationIds().join(',') || ''); } catch (e) { return ''; }
    };
    const clear = () => { cache = {}; };

    LISTS.forEach(function (name) {
        const orig = heartUpDB[name];
        if (typeof orig !== 'function') return;
        heartUpDB[name] = function () {
            if (!this.isReady() || arguments.length) return orig.apply(this, arguments);
            const key = name + '|' + scope();
            const hit = cache[key];
            if (hit && Date.now() - hit.t < TTL) return hit.p.then(clone);
            const p = orig.apply(this, arguments);
            cache[key] = { t: Date.now(), p: p };
            p.catch(function () { if (cache[key] && cache[key].p === p) delete cache[key]; });
            return p.then(clone);
        };
    });

    Object.keys(heartUpDB).forEach(function (name) {
        if (!/^(create|update|delete|save|signOut)/.test(name) || typeof heartUpDB[name] !== 'function') return;
        const orig = heartUpDB[name];
        heartUpDB[name] = async function () {
            try { return await orig.apply(this, arguments); } finally { clear(); }
        };
    });

    heartUpDB.clearListCache = clear;
})();
