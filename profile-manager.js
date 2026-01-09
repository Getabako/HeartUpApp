// プロファイル管理モジュール
// 複数のGoogleアカウントと保存先フォルダを管理

class ProfileManager {
    constructor() {
        this.STORAGE_KEY = 'userProfiles';
        this.data = this.loadProfiles();
    }

    /**
     * localStorageからプロファイルデータを読み込み
     */
    loadProfiles() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('プロファイル読み込みエラー:', error);
        }
        // デフォルト構造
        return {
            profiles: [],
            activeProfileId: null
        };
    }

    /**
     * localStorageにプロファイルデータを保存
     */
    saveProfiles() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            console.log('プロファイルを保存しました');
        } catch (error) {
            console.error('プロファイル保存エラー:', error);
        }
    }

    /**
     * 全プロファイルを取得
     * @returns {Array} プロファイル配列
     */
    getProfiles() {
        return this.data.profiles || [];
    }

    /**
     * アクティブなプロファイルを取得
     * @returns {Object|null} アクティブなプロファイルまたはnull
     */
    getActiveProfile() {
        if (!this.data.activeProfileId) {
            return null;
        }
        return this.data.profiles.find(p => p.id === this.data.activeProfileId) || null;
    }

    /**
     * アクティブなプロファイルIDを取得
     * @returns {string|null}
     */
    getActiveProfileId() {
        return this.data.activeProfileId;
    }

    /**
     * プロファイルをIDで取得
     * @param {string} profileId
     * @returns {Object|null}
     */
    getProfileById(profileId) {
        return this.data.profiles.find(p => p.id === profileId) || null;
    }

    /**
     * アクティブなプロファイルを設定
     * @param {string} profileId - プロファイルID
     * @returns {boolean} 成功したかどうか
     */
    setActiveProfile(profileId) {
        const profile = this.getProfileById(profileId);
        if (!profile) {
            console.error('プロファイルが見つかりません:', profileId);
            return false;
        }
        this.data.activeProfileId = profileId;
        this.saveProfiles();
        console.log('アクティブプロファイルを設定:', profile.name);
        return true;
    }

    /**
     * 新しいプロファイルを追加
     * @param {Object} profile - プロファイルデータ
     * @param {string} profile.name - 表示名
     * @param {string} profile.email - Googleアカウントメールアドレス
     * @param {string} profile.folderId - Google DriveフォルダID
     * @param {string} profile.folderName - フォルダ名
     * @returns {Object} 作成されたプロファイル
     */
    addProfile(profile) {
        const newProfile = {
            id: this.generateUUID(),
            name: profile.name || '名称未設定',
            email: profile.email || '',
            folderId: profile.folderId || '',
            folderName: profile.folderName || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.data.profiles.push(newProfile);

        // 最初のプロファイルならアクティブに設定
        if (this.data.profiles.length === 1) {
            this.data.activeProfileId = newProfile.id;
        }

        this.saveProfiles();
        console.log('プロファイルを追加:', newProfile.name);
        return newProfile;
    }

    /**
     * プロファイルを更新
     * @param {string} profileId - プロファイルID
     * @param {Object} updates - 更新するフィールド
     * @returns {Object|null} 更新されたプロファイルまたはnull
     */
    updateProfile(profileId, updates) {
        const index = this.data.profiles.findIndex(p => p.id === profileId);
        if (index === -1) {
            console.error('プロファイルが見つかりません:', profileId);
            return null;
        }

        const profile = this.data.profiles[index];
        const updatedProfile = {
            ...profile,
            ...updates,
            id: profile.id, // IDは変更不可
            createdAt: profile.createdAt, // 作成日時は変更不可
            updatedAt: new Date().toISOString()
        };

        this.data.profiles[index] = updatedProfile;
        this.saveProfiles();
        console.log('プロファイルを更新:', updatedProfile.name);
        return updatedProfile;
    }

    /**
     * プロファイルを削除
     * @param {string} profileId - プロファイルID
     * @returns {boolean} 削除に成功したかどうか
     */
    deleteProfile(profileId) {
        const index = this.data.profiles.findIndex(p => p.id === profileId);
        if (index === -1) {
            console.error('プロファイルが見つかりません:', profileId);
            return false;
        }

        this.data.profiles.splice(index, 1);

        // 削除したのがアクティブプロファイルの場合
        if (this.data.activeProfileId === profileId) {
            // 残りのプロファイルがあれば最初のものをアクティブに
            if (this.data.profiles.length > 0) {
                this.data.activeProfileId = this.data.profiles[0].id;
            } else {
                this.data.activeProfileId = null;
            }
        }

        this.saveProfiles();
        console.log('プロファイルを削除しました');
        return true;
    }

    /**
     * プロファイルが存在するか確認
     * @returns {boolean}
     */
    hasProfiles() {
        return this.data.profiles.length > 0;
    }

    /**
     * メールアドレスでプロファイルを検索
     * @param {string} email
     * @returns {Object|null}
     */
    findProfileByEmail(email) {
        return this.data.profiles.find(p => p.email === email) || null;
    }

    /**
     * UUIDを生成
     * @returns {string}
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 全プロファイルをクリア（デバッグ用）
     */
    clearAll() {
        this.data = {
            profiles: [],
            activeProfileId: null
        };
        this.saveProfiles();
        console.log('全プロファイルをクリアしました');
    }
}

// グローバルインスタンスを作成
const profileManager = new ProfileManager();

// エクスポート（モジュール環境用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProfileManager, profileManager };
}
