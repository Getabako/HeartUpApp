// Google Drive API統合モジュール
// アセスメントシートをGoogle Driveに自動保存するための機能

class GoogleDriveAPI {
    constructor() {
        // Google API設定（固定値）
        this.CLIENT_ID = '537186649664-12ft0p2d5a3jkbkpvjoquugfgpoiov86.apps.googleusercontent.com';
        this.API_KEY = 'AIzaSyDen7M5YfihnQYaiHtigRvNewb4f6utUbo';
        this.SCOPES = 'https://www.googleapis.com/auth/drive.file';
        this.DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

        // 保存先フォルダID（指定されたフォルダ）
        this.TARGET_FOLDER_ID = '1KvbKykAiUK6BKoqsFQQhyRqYQp7NQm77';

        this.tokenClient = null;
        this.gapiInited = false;
        this.gisInited = false;
        this.isSignedIn = false;
    }

    /**
     * Google API ライブラリをロード
     */
    async loadGoogleAPIs() {
        return new Promise((resolve, reject) => {
            // GAPI (Google API Client) をロード
            if (!document.getElementById('gapi-script')) {
                const gapiScript = document.createElement('script');
                gapiScript.id = 'gapi-script';
                gapiScript.src = 'https://apis.google.com/js/api.js';
                gapiScript.async = true;
                gapiScript.defer = true;
                gapiScript.onload = () => {
                    gapi.load('client', async () => {
                        await this.initializeGapiClient();
                        this.gapiInited = true;
                        this.maybeEnableAPI(resolve);
                    });
                };
                gapiScript.onerror = reject;
                document.head.appendChild(gapiScript);
            }

            // GIS (Google Identity Services) をロード
            if (!document.getElementById('gis-script')) {
                const gisScript = document.createElement('script');
                gisScript.id = 'gis-script';
                gisScript.src = 'https://accounts.google.com/gsi/client';
                gisScript.async = true;
                gisScript.defer = true;
                gisScript.onload = () => {
                    this.initializeGisClient();
                    this.gisInited = true;
                    this.maybeEnableAPI(resolve);
                };
                gisScript.onerror = reject;
                document.head.appendChild(gisScript);
            }

            // 既にロード済みの場合
            if (this.gapiInited && this.gisInited) {
                resolve();
            }
        });
    }

    /**
     * GAPI クライアントを初期化
     */
    async initializeGapiClient() {
        await gapi.client.init({
            apiKey: this.API_KEY,
            discoveryDocs: this.DISCOVERY_DOCS,
        });
    }

    /**
     * GIS クライアントを初期化
     */
    initializeGisClient() {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            callback: '', // 後で設定
        });
    }

    /**
     * 両方のAPIがロードされたらコールバックを実行
     */
    maybeEnableAPI(callback) {
        if (this.gapiInited && this.gisInited) {
            callback();
        }
    }

    /**
     * 初期化処理
     */
    async initialize() {
        try {
            await this.loadGoogleAPIs();
            console.log('Google Drive API: 初期化完了');
            return true;
        } catch (error) {
            console.error('Google Drive API 初期化エラー:', error);
            return false;
        }
    }

    /**
     * 認証状態を確認
     */
    isInitialized() {
        return this.gapiInited && this.gisInited && this.CLIENT_ID && this.API_KEY;
    }

    /**
     * ユーザー認証（サインイン）
     */
    async authorize() {
        return new Promise((resolve, reject) => {
            if (!this.tokenClient) {
                reject(new Error('Google API が初期化されていません'));
                return;
            }

            this.tokenClient.callback = async (response) => {
                if (response.error !== undefined) {
                    reject(response);
                    return;
                }
                this.isSignedIn = true;
                resolve(response);
            };

            if (gapi.client.getToken() === null) {
                // 初回認証 - ポップアップ表示
                this.tokenClient.requestAccessToken({ prompt: 'consent' });
            } else {
                // 既存トークンがある場合は再認証なしでリクエスト
                this.tokenClient.requestAccessToken({ prompt: '' });
            }
        });
    }

    /**
     * サインアウト
     */
    signOut() {
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken('');
            this.isSignedIn = false;
        }
    }

    /**
     * HTMLファイルをGoogle Driveにアップロード
     * @param {string} fileName - ファイル名
     * @param {string} htmlContent - HTMLコンテンツ
     * @param {string} folderId - 保存先フォルダID（省略時はデフォルトフォルダ）
     */
    async uploadHTMLFile(fileName, htmlContent, folderId = null) {
        if (!this.isSignedIn) {
            await this.authorize();
        }

        const targetFolderId = folderId || this.TARGET_FOLDER_ID;

        // ファイルメタデータ
        const fileMetadata = {
            name: fileName,
            mimeType: 'text/html',
            parents: [targetFolderId]
        };

        // マルチパートリクエストのboundary
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const closeDelim = "\r\n--" + boundary + "--";

        // リクエストボディを構築
        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(fileMetadata) +
            delimiter +
            'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
            htmlContent +
            closeDelim;

        try {
            const response = await gapi.client.request({
                path: '/upload/drive/v3/files',
                method: 'POST',
                params: { uploadType: 'multipart' },
                headers: {
                    'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                },
                body: multipartRequestBody
            });

            console.log('Google Drive アップロード成功:', response.result);
            return {
                success: true,
                fileId: response.result.id,
                fileName: response.result.name,
                webViewLink: `https://drive.google.com/file/d/${response.result.id}/view`
            };
        } catch (error) {
            console.error('Google Drive アップロードエラー:', error);
            throw error;
        }
    }

    /**
     * JSONファイルをGoogle Driveにアップロード
     * @param {string} fileName - ファイル名
     * @param {object} jsonData - JSONデータ
     * @param {string} folderId - 保存先フォルダID（省略時はデフォルトフォルダ）
     */
    async uploadJSONFile(fileName, jsonData, folderId = null) {
        if (!this.isSignedIn) {
            await this.authorize();
        }

        const targetFolderId = folderId || this.TARGET_FOLDER_ID;
        const jsonContent = JSON.stringify(jsonData, null, 2);

        const fileMetadata = {
            name: fileName,
            mimeType: 'application/json',
            parents: [targetFolderId]
        };

        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const closeDelim = "\r\n--" + boundary + "--";

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(fileMetadata) +
            delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            jsonContent +
            closeDelim;

        try {
            const response = await gapi.client.request({
                path: '/upload/drive/v3/files',
                method: 'POST',
                params: { uploadType: 'multipart' },
                headers: {
                    'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                },
                body: multipartRequestBody
            });

            console.log('Google Drive JSONアップロード成功:', response.result);
            return {
                success: true,
                fileId: response.result.id,
                fileName: response.result.name
            };
        } catch (error) {
            console.error('Google Drive JSONアップロードエラー:', error);
            throw error;
        }
    }

    /**
     * アセスメントシートをGoogle Driveに保存
     * HTMLとJSONの両方をアップロード
     */
    async saveAssessmentToDrive(fileName, htmlContent, assessmentData) {
        const results = {
            html: null,
            json: null,
            success: false
        };

        try {
            // HTMLファイルをアップロード
            results.html = await this.uploadHTMLFile(fileName, htmlContent);

            // JSONメタデータをアップロード
            const jsonFileName = fileName.replace('.html', '.json');
            const metadata = {
                fileName,
                data: assessmentData,
                createdAt: new Date().toISOString(),
                driveFileId: results.html.fileId
            };
            results.json = await this.uploadJSONFile(jsonFileName, metadata);

            results.success = true;
            return results;
        } catch (error) {
            console.error('Google Drive 保存エラー:', error);
            results.error = error.message;
            return results;
        }
    }

    /**
     * フォルダ内のファイル一覧を取得
     */
    async listFiles(folderId = null) {
        if (!this.isSignedIn) {
            await this.authorize();
        }

        const targetFolderId = folderId || this.TARGET_FOLDER_ID;

        try {
            const response = await gapi.client.drive.files.list({
                q: `'${targetFolderId}' in parents and trashed = false`,
                fields: 'files(id, name, mimeType, createdTime, webViewLink)',
                orderBy: 'createdTime desc'
            });

            return {
                success: true,
                files: response.result.files
            };
        } catch (error) {
            console.error('ファイル一覧取得エラー:', error);
            throw error;
        }
    }
}

// グローバルインスタンスを作成
const googleDriveAPI = new GoogleDriveAPI();

// エクスポート（モジュール環境用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GoogleDriveAPI, googleDriveAPI };
}
