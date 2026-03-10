// Google Drive API - 手動バックアップ/復元モジュール
// localStorage全データを1つのJSONとしてDriveにバックアップ・復元する

class GoogleDriveAPI {
    constructor() {
        this.CLIENT_ID = typeof DRIVE_CONFIG !== 'undefined' ? DRIVE_CONFIG.CLIENT_ID : '';
        this.API_KEY = typeof DRIVE_CONFIG !== 'undefined' ? DRIVE_CONFIG.API_KEY : '';
        this.SCOPES = 'https://www.googleapis.com/auth/drive.file';
        this.DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
        this.BACKUP_FOLDER_NAME = 'HeartUp_Data';

        this.tokenClient = null;
        this.gapiInited = false;
        this.gisInited = false;
    }

    // ---- 初期化 ----

    isInitialized() {
        return this.gapiInited && this.gisInited;
    }

    async loadGoogleAPIs() {
        // gapi
        if (typeof gapi === 'undefined') {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://apis.google.com/js/api.js';
                s.onload = resolve;
                s.onerror = () => reject(new Error('gapi load failed'));
                document.head.appendChild(s);
            });
        }
        // gsi
        if (typeof google === 'undefined' || !google.accounts) {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://accounts.google.com/gsi/client';
                s.onload = resolve;
                s.onerror = () => reject(new Error('gsi load failed'));
                document.head.appendChild(s);
            });
        }
    }

    async initializeGapiClient() {
        await new Promise((resolve) => gapi.load('client', resolve));
        await gapi.client.init({
            apiKey: this.API_KEY,
            discoveryDocs: this.DISCOVERY_DOCS,
        });
        this.gapiInited = true;
    }

    initializeGisClient() {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            callback: () => {}, // 後でauthorize()内で上書き
            error_callback: (err) => {
                console.error('GIS error:', err);
            },
        });
        this.gisInited = true;
    }

    async initialize() {
        if (this.isInitialized()) return true;
        try {
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('初期化タイムアウト')), 10000)
            );
            await Promise.race([
                (async () => {
                    await this.loadGoogleAPIs();
                    await this.initializeGapiClient();
                    this.initializeGisClient();
                })(),
                timeout,
            ]);
            console.log('Google Drive API 初期化完了');
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
                reject(new Error('tokenClient未初期化'));
                return;
            }
            this.tokenClient.callback = (response) => {
                if (response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response);
                }
            };
            this.tokenClient.error_callback = (err) => {
                reject(new Error(err.type || 'auth_error'));
            };
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        });
    }

    // ---- バックアップフォルダ管理 ----

    async getOrCreateBackupFolder() {
        // 既存フォルダを検索
        const query = `name='${this.BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const res = await gapi.client.drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
        });
        if (res.result.files && res.result.files.length > 0) {
            return res.result.files[0].id;
        }
        // なければ作成
        const createRes = await gapi.client.drive.files.create({
            resource: {
                name: this.BACKUP_FOLDER_NAME,
                mimeType: 'application/vnd.google-apps.folder',
            },
            fields: 'id',
        });
        console.log('HeartUp_Dataフォルダを作成:', createRes.result.id);
        return createRes.result.id;
    }

    // ---- バックアップ ----

    async backupAllData() {
        const folderId = await this.getOrCreateBackupFolder();

        // localStorageから対象データを収集
        const data = {
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
            data: data,
        };

        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        const fileName = `heartup_backup_${timestamp}.json`;

        // アップロード
        const fileContent = JSON.stringify(backup, null, 2);
        const blob = new Blob([fileContent], { type: 'application/json' });

        const metadata = {
            name: fileName,
            mimeType: 'application/json',
            parents: [folderId],
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', blob);

        const token = gapi.client.getToken().access_token;
        const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form,
        });

        if (!uploadRes.ok) {
            throw new Error(`アップロード失敗: ${uploadRes.status}`);
        }

        const result = await uploadRes.json();
        console.log('バックアップ完了:', result.name);
        return { success: true, fileId: result.id, fileName: result.name, createdAt: result.createdTime };
    }

    // ---- バックアップ一覧 ----

    async listBackups() {
        const folderId = await this.getOrCreateBackupFolder();
        const query = `'${folderId}' in parents and name contains 'heartup_backup_' and trashed=false`;
        const res = await gapi.client.drive.files.list({
            q: query,
            fields: 'files(id, name, createdTime, size)',
            orderBy: 'createdTime desc',
            pageSize: 20,
        });
        return res.result.files || [];
    }

    // ---- 復元 ----

    async restoreFromBackup(fileId) {
        const token = gapi.client.getToken().access_token;
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            throw new Error(`ダウンロード失敗: ${res.status}`);
        }

        const backup = await res.json();

        // バリデーション
        if (!backup.appName || backup.appName !== 'HeartUpApp') {
            throw new Error('HeartUpAppのバックアップファイルではありません');
        }

        // localStorageに展開
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
