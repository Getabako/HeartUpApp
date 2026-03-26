// HeartUpApp Auth Guard
// 全ページ共通の認証チェック + リダイレクト + ヘッダーUI

const authGuard = {
    async init() {
        // Firebase未初期化なら認証不要（localStorageモード）
        if (!heartUpDB.isReady()) {
            this.showHeader(null);
            return;
        }

        const session = await heartUpDB.getSession();
        if (!session) {
            window.location.href = '/login.html';
            return;
        }

        const user = await heartUpDB.getUser();
        let profile = await heartUpDB.getMyProfile();

        if (!profile) {
            // 招待チェック
            const invitation = await heartUpDB.checkInvitation(user.email);
            if (invitation) {
                profile = await heartUpDB.createProfileFromInvitation(user.uid, user.email, invitation);
            } else {
                // 最初のユーザーなら自動的にadminとして登録
                const isFirst = await heartUpDB.isFirstUser();
                if (isFirst) {
                    profile = await heartUpDB.bootstrapFirstAdmin(user);
                    alert('最初のユーザーとして管理者登録されました。\n管理画面から拠点名を変更できます。');
                } else {
                    // ユーザー登録フォームを表示
                    this.showRegistrationForm(user);
                    return;
                }
            }
        }

        this.showHeader(profile);

        // admin専用ページのガード
        if (document.body.dataset.adminOnly === 'true' && !heartUpDB.isAdmin()) {
            document.body.innerHTML = '<div style="text-align:center;padding:60px;color:#666;"><h2>アクセス権限がありません</h2><p>管理者に連絡してください。</p><a href="/index.html">トップに戻る</a></div>';
        }
    },

    showHeader(profile) {
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;

        if (!profile) return;

        const locationName = heartUpDB.getMyLocationName();
        const userName = profile.name || profile.email;
        const isAdmin = heartUpDB.isAdmin();

        const authInfo = document.createElement('div');
        authInfo.className = 'auth-info';
        authInfo.innerHTML = `
            <span class="location-badge">${locationName}</span>
            <span class="user-name">${userName}</span>
            ${isAdmin ? '<a href="/admin.html" class="admin-link">管理</a>' : ''}
            <button onclick="authGuard.logout()" class="logout-btn">ログアウト</button>
        `;
        headerRight.appendChild(authInfo);
    },

    async showRegistrationForm(user) {
        // 既存の拠点一覧を取得
        let locations = [];
        try { locations = await heartUpDB.getLocations(); } catch (e) { console.error(e); }

        const locationOptions = locations.map(l => `<option value="${l.id}">${l.name}</option>`).join('');

        document.body.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#2e7d32,#4caf50);">
            <div style="background:white;padding:40px;border-radius:16px;max-width:480px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
                <h2 style="color:#2e7d32;margin-bottom:8px;text-align:center;">ユーザー登録</h2>
                <p style="color:#666;margin-bottom:24px;text-align:center;font-size:14px;">ログイン: ${user.email}</p>

                <div style="margin-bottom:16px;">
                    <label style="display:block;color:#333;font-weight:bold;margin-bottom:6px;">表示名</label>
                    <input id="regName" type="text" value="${user.displayName || ''}" placeholder="名前を入力"
                        style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;font-size:16px;box-sizing:border-box;">
                </div>

                <div style="margin-bottom:16px;">
                    <label style="display:block;color:#333;font-weight:bold;margin-bottom:6px;">役割</label>
                    <div style="display:flex;gap:12px;">
                        <label style="flex:1;display:flex;align-items:center;gap:8px;padding:14px;border:2px solid #e0e0e0;border-radius:8px;cursor:pointer;transition:all 0.2s;" id="roleAdminLabel">
                            <input type="radio" name="regRole" value="admin" onchange="authGuard._onRoleChange('admin')">
                            <div>
                                <div style="font-weight:bold;color:#333;">管理者</div>
                                <div style="font-size:12px;color:#888;">拠点を作成・管理</div>
                            </div>
                        </label>
                        <label style="flex:1;display:flex;align-items:center;gap:8px;padding:14px;border:2px solid #e0e0e0;border-radius:8px;cursor:pointer;transition:all 0.2s;" id="roleStaffLabel">
                            <input type="radio" name="regRole" value="staff" onchange="authGuard._onRoleChange('staff')">
                            <div>
                                <div style="font-weight:bold;color:#333;">スタッフ</div>
                                <div style="font-size:12px;color:#888;">既存拠点に参加</div>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- 管理者用: 新規拠点名入力 -->
                <div id="adminLocationSection" style="display:none;margin-bottom:16px;">
                    <label style="display:block;color:#333;font-weight:bold;margin-bottom:6px;">新規拠点名</label>
                    <input id="regNewLocation" type="text" placeholder="例: カラーズFC 〇〇教室"
                        style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;font-size:16px;box-sizing:border-box;">
                </div>

                <!-- スタッフ用: 既存拠点選択 -->
                <div id="staffLocationSection" style="display:none;margin-bottom:16px;">
                    <label style="display:block;color:#333;font-weight:bold;margin-bottom:6px;">所属拠点</label>
                    ${locations.length > 0
                        ? `<select id="regExistingLocation" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;font-size:16px;box-sizing:border-box;">
                            <option value="">拠点を選択してください</option>
                            ${locationOptions}
                           </select>`
                        : `<p style="color:#e65100;font-size:14px;padding:12px;background:#fff3e0;border-radius:8px;">まだ拠点が作成されていません。管理者として登録して拠点を作成してください。</p>`
                    }
                </div>

                <p id="regError" style="color:#d32f2f;font-size:14px;margin-bottom:12px;display:none;"></p>

                <button id="regSubmitBtn" onclick="authGuard._submitRegistration()" disabled
                    style="width:100%;padding:14px;background:#ccc;color:white;border:none;border-radius:8px;cursor:not-allowed;font-size:16px;font-weight:bold;transition:all 0.2s;">
                    登録する
                </button>

                <div style="text-align:center;margin-top:16px;">
                    <button onclick="authGuard.logout()" style="padding:8px 20px;background:transparent;color:#666;border:1px solid #ddd;border-radius:8px;cursor:pointer;font-size:14px;">ログアウト</button>
                </div>
            </div>
        </div>`;

        // ユーザー情報を保持
        this._regUser = user;
    },

    _onRoleChange(role) {
        const adminSection = document.getElementById('adminLocationSection');
        const staffSection = document.getElementById('staffLocationSection');
        const adminLabel = document.getElementById('roleAdminLabel');
        const staffLabel = document.getElementById('roleStaffLabel');
        const submitBtn = document.getElementById('regSubmitBtn');

        if (role === 'admin') {
            adminSection.style.display = 'block';
            staffSection.style.display = 'none';
            adminLabel.style.borderColor = '#4caf50';
            adminLabel.style.background = '#e8f5e9';
            staffLabel.style.borderColor = '#e0e0e0';
            staffLabel.style.background = 'white';
        } else {
            adminSection.style.display = 'none';
            staffSection.style.display = 'block';
            staffLabel.style.borderColor = '#4caf50';
            staffLabel.style.background = '#e8f5e9';
            adminLabel.style.borderColor = '#e0e0e0';
            adminLabel.style.background = 'white';
        }

        submitBtn.disabled = false;
        submitBtn.style.background = 'linear-gradient(135deg, #2e7d32, #4caf50)';
        submitBtn.style.cursor = 'pointer';
    },

    async _submitRegistration() {
        const errorEl = document.getElementById('regError');
        const submitBtn = document.getElementById('regSubmitBtn');
        errorEl.style.display = 'none';

        const name = document.getElementById('regName').value.trim();
        const role = document.querySelector('input[name="regRole"]:checked')?.value;

        if (!name) {
            errorEl.textContent = '表示名を入力してください。';
            errorEl.style.display = 'block';
            return;
        }
        if (!role) {
            errorEl.textContent = '役割を選択してください。';
            errorEl.style.display = 'block';
            return;
        }

        let locationId = null;

        if (role === 'admin') {
            const newLocationName = document.getElementById('regNewLocation').value.trim();
            if (!newLocationName) {
                errorEl.textContent = '拠点名を入力してください。';
                errorEl.style.display = 'block';
                return;
            }
            submitBtn.disabled = true;
            submitBtn.textContent = '登録中...';
            try {
                const loc = await heartUpDB.createLocation(newLocationName);
                locationId = loc.id;
            } catch (e) {
                errorEl.textContent = '拠点の作成に失敗しました: ' + e.message;
                errorEl.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = '登録する';
                return;
            }
        } else {
            const selectEl = document.getElementById('regExistingLocation');
            if (!selectEl || !selectEl.value) {
                errorEl.textContent = '所属拠点を選択してください。';
                errorEl.style.display = 'block';
                return;
            }
            locationId = selectEl.value;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = '登録中...';

        try {
            const user = this._regUser;
            const profileData = {
                email: user.email,
                name: name,
                role: role,
                locationId: locationId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await heartUpDB.db.collection('staff_profiles').doc(user.uid).set(profileData);
            heartUpDB.currentProfile = profileData;

            window.location.reload();
        } catch (e) {
            errorEl.textContent = '登録に失敗しました: ' + e.message;
            errorEl.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = '登録する';
        }
    },

    async logout() {
        await heartUpDB.signOut();
        window.location.href = '/login.html';
    }
};
