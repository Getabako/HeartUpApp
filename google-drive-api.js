// Google Drive API - 手動バックアップ/復元モジュール
// GIS(Google Identity Services)で認証 + fetch で Drive API を直接呼ぶ
// gapi.client 不要（Discovery Document の 403 問題を回避）

class GoogleDriveAPI {
    constructor() {
        this.CLIENT_ID = typeof DRIVE_CONFIG !== 'undefined' ? DRIVE_CONFIG.CLIENT_ID : '';
        this.SCOPES = 'https://www.googleapis.com/auth/drive.file';
        this.BACKUP_FOLDER_NAME = 'HeartUp_Data';
        this.DRIVE_API = 'https://www.googleapis.com/drive/v3';
        this.UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

        this.tokenClient = null;
        this.accessToken = null;
        this.initialized = false;
    }

    // ---- 初期化 ----

    isInitialized() {
        return this.initialized;
    }

    async loadGIS() {
        if (typeof google !== 'undefined' && google.accounts) return;
        await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://accounts.google.com/gsi/client';
            s.onload = resolve;
            s.onerror = () => reject(new Error('GIS ライブラリの読み込みに失敗'));
            document.head.appendChild(s);
        });
    }

    async initialize() {
        if (this.initialized) return true;
        try {
            await this.loadGIS();
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.CLIENT_ID,
                scope: this.SCOPES,
                callback: () => {},
                error_callback: (err) => console.error('GIS error:', err),
            });
            this.initialized = true;
            console.log('Google Drive API 初期化完了（GISのみ）');
            return true;
        } catch (error) {
            console.error('Google Drive API 初期化エラー:', error);
            return false;
        }
    }

    // ---- 認証 ----

    authorize() {
        return new Promise((resolve, reject) => {
            if (!this.tokenClient) {
                reject(new Error('初期化されていません'));
                return;
            }
            this.tokenClient.callback = (response) => {
                if (response.error) {
                    reject(new Error(response.error));
                } else {
                    this.accessToken = response.access_token;
                    resolve(response);
                }
            };
            this.tokenClient.error_callback = (err) => {
                reject(new Error(err.type || 'auth_error'));
            };
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        });
    }

    // ---- fetch ヘルパー ----

    async driveGet(path, params = {}) {
        const url = new URL(`${this.DRIVE_API}/${path}`);
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
        });
        if (!res.ok) throw new Error(`Drive API エラー: ${res.status}`);
        return res.json();
    }

    async drivePost(path, body, params = {}) {
        const url = new URL(`${this.DRIVE_API}/${path}`);
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`Drive API エラー: ${res.status}`);
        return res.json();
    }

    // ---- バックアップフォルダ管理 ----

    async getOrCreateBackupFolder() {
        const q = `name='${this.BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const data = await this.driveGet('files', { q, fields: 'files(id,name)', spaces: 'drive' });
        if (data.files && data.files.length > 0) {
            return data.files[0].id;
        }
        const created = await this.drivePost('files', {
            name: this.BACKUP_FOLDER_NAME,
            mimeType: 'application/vnd.google-apps.folder',
        }, { fields: 'id' });
        console.log('HeartUp_Dataフォルダを作成:', created.id);
        return created.id;
    }

    // ---- バックアップ ----

    async backupAllData() {
        const folderId = await this.getOrCreateBackupFolder();

        const backupData = {
            assessments: JSON.parse(localStorage.getItem('assessments') || '{}'),
            supportPlans: JSON.parse(localStorage.getItem('supportPlans') || '{}'),
            dailyReports: JSON.parse(localStorage.getItem('dailyReports') || '{}'),
            reviews: JSON.parse(localStorage.getItem('reviews') || '{}'),
            children: JSON.parse(localStorage.getItem('children') || '{}'),
        };

        const backup = {
            version: 1,
            appName: 'HeartUpApp',
            createdAt: new Date().toISOString(),
            data: backupData,
        };

        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        const fileName = `heartup_backup_${ts}.json`;

        const metadata = { name: fileName, mimeType: 'application/json', parents: [folderId] };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));

        const res = await fetch(`${this.UPLOAD_API}/files?uploadType=multipart&fields=id,name,createdTime`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.accessToken}` },
            body: form,
        });
        if (!res.ok) throw new Error(`アップロード失敗: ${res.status}`);

        const result = await res.json();
        console.log('バックアップ完了:', result.name);
        return { success: true, fileId: result.id, fileName: result.name, createdAt: result.createdTime };
    }

    // ---- バックアップ一覧 ----

    async listBackups() {
        const folderId = await this.getOrCreateBackupFolder();
        const q = `'${folderId}' in parents and name contains 'heartup_backup_' and trashed=false`;
        const data = await this.driveGet('files', {
            q,
            fields: 'files(id,name,createdTime,size)',
            orderBy: 'createdTime desc',
            pageSize: '20',
        });
        return data.files || [];
    }

    // ---- 復元 ----

    async restoreFromBackup(fileId) {
        const res = await fetch(`${this.DRIVE_API}/files/${fileId}?alt=media`, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
        });
        if (!res.ok) throw new Error(`ダウンロード失敗: ${res.status}`);

        const backup = await res.json();
        if (!backup.appName || backup.appName !== 'HeartUpApp') {
            throw new Error('HeartUpAppのバックアップファイルではありません');
        }

        const { data } = backup;
        if (data.assessments) localStorage.setItem('assessments', JSON.stringify(data.assessments));
        if (data.supportPlans) localStorage.setItem('supportPlans', JSON.stringify(data.supportPlans));
        if (data.dailyReports) localStorage.setItem('dailyReports', JSON.stringify(data.dailyReports));
        if (data.reviews) localStorage.setItem('reviews', JSON.stringify(data.reviews));
        if (data.children) localStorage.setItem('children', JSON.stringify(data.children));

        console.log('復元完了:', backup.createdAt);
        return { success: true, createdAt: backup.createdAt, dataKeys: Object.keys(data) };
    }
}

// グローバルインスタンス
const googleDriveAPI = new GoogleDriveAPI();
