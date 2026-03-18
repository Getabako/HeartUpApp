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
                    // 未招待 → 承認待ち画面
                    this.showPendingApproval(user.email);
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

    showPendingApproval(email) {
        document.body.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#2e7d32,#4caf50);">
            <div style="background:white;padding:40px;border-radius:16px;max-width:400px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
                <h2 style="color:#2e7d32;margin-bottom:16px;">承認待ち</h2>
                <p style="color:#666;margin-bottom:8px;">ログイン: ${email}</p>
                <p style="color:#666;margin-bottom:24px;">管理者からの招待がまだ登録されていません。<br>管理者に連絡して招待を依頼してください。</p>
                <button onclick="authGuard.logout()" style="padding:12px 24px;background:#2e7d32;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;">ログアウト</button>
            </div>
        </div>`;
    },

    async logout() {
        await heartUpDB.signOut();
        window.location.href = '/login.html';
    }
};
