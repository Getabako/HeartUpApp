// Google Drive API統合モジュール
// アセスメントシートをGoogle Driveに自動保存するための機能

class GoogleDriveAPI {
    constructor() {
        // Google API設定（固定値）
        this.CLIENT_ID = '537186649664-12ft0p2d5a3jkbkpvjoquugfgpoiov86.apps.googleusercontent.com';
        this.API_KEY = 'AIzaSyDen7M5YfihnQYaiHtigRvNewb4f6utUbo';
        // drive.file + ユーザー情報取得用スコープ
        this.SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email';
        this.DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

        // 保存先フォルダID（デフォルト値、プロファイルで上書き可能）
        this.DEFAULT_FOLDER_ID = '1KvbKykAiUK6BKoqsFQQhyRqYQp7NQm77';
        this.TARGET_FOLDER_ID = this.DEFAULT_FOLDER_ID;

        this.tokenClient = null;
        this.gapiInited = false;
        this.gisInited = false;
        this.pickerInited = false;
        this.isSignedIn = false;
        this.currentUserEmail = null;
    }

    /**
     * ターゲットフォルダIDを設定
     * @param {string} folderId - フォルダID
     */
    setTargetFolderId(folderId) {
        if (folderId) {
            this.TARGET_FOLDER_ID = folderId;
            console.log('ターゲットフォルダIDを設定:', folderId);
        } else {
            this.TARGET_FOLDER_ID = this.DEFAULT_FOLDER_ID;
            console.log('ターゲットフォルダIDをデフォルトにリセット');
        }
    }

    /**
     * 現在のターゲットフォルダIDを取得
     */
    getTargetFolderId() {
        return this.TARGET_FOLDER_ID;
    }

    /**
     * Google API ライブラリをロード
     */
    async loadGoogleAPIs() {
        console.log('Google APIs ロード開始...');
        return new Promise((resolve, reject) => {
            let gapiLoaded = document.getElementById('gapi-script') !== null;
            let gisLoaded = document.getElementById('gis-script') !== null;

            // GAPI (Google API Client) をロード
            if (!gapiLoaded) {
                const gapiScript = document.createElement('script');
                gapiScript.id = 'gapi-script';
                gapiScript.src = 'https://apis.google.com/js/api.js';
                gapiScript.async = true;
                gapiScript.defer = true;
                gapiScript.onload = () => {
                    console.log('GAPI スクリプト ロード完了');
                    // client と picker の両方をロード
                    gapi.load('client:picker', async () => {
                        try {
                            await this.initializeGapiClient();
                            this.gapiInited = true;
                            this.pickerInited = true;
                            console.log('GAPI クライアント + Picker 初期化完了');
                            this.maybeEnableAPI(resolve);
                        } catch (err) {
                            console.error('GAPI クライアント初期化エラー:', err);
                            reject(err);
                        }
                    });
                };
                gapiScript.onerror = (err) => {
                    console.error('GAPI スクリプト ロードエラー:', err);
                    reject(err);
                };
                document.head.appendChild(gapiScript);
            } else if (!this.gapiInited && typeof gapi !== 'undefined') {
                // 既にスクリプトはあるが初期化されていない
                gapi.load('client:picker', async () => {
                    try {
                        await this.initializeGapiClient();
                        this.gapiInited = true;
                        this.pickerInited = true;
                        console.log('GAPI クライアント + Picker 初期化完了 (再初期化)');
                        this.maybeEnableAPI(resolve);
                    } catch (err) {
                        console.error('GAPI クライアント初期化エラー:', err);
                        reject(err);
                    }
                });
            }

            // GIS (Google Identity Services) をロード
            if (!gisLoaded) {
                const gisScript = document.createElement('script');
                gisScript.id = 'gis-script';
                gisScript.src = 'https://accounts.google.com/gsi/client';
                gisScript.async = true;
                gisScript.defer = true;
                gisScript.onload = () => {
                    console.log('GIS スクリプト ロード完了');
                    this.initializeGisClient();
                    this.gisInited = true;
                    console.log('GIS クライアント初期化完了');
                    this.maybeEnableAPI(resolve);
                };
                gisScript.onerror = (err) => {
                    console.error('GIS スクリプト ロードエラー:', err);
                    reject(err);
                };
                document.head.appendChild(gisScript);
            } else if (!this.gisInited && typeof google !== 'undefined') {
                // 既にスクリプトはあるが初期化されていない
                this.initializeGisClient();
                this.gisInited = true;
                console.log('GIS クライアント初期化完了 (再初期化)');
                this.maybeEnableAPI(resolve);
            }

            // 既に両方ロード済みの場合
            if (this.gapiInited && this.gisInited) {
                console.log('Google APIs 既に初期化済み');
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
            this.currentUserEmail = null;
        }
    }

    /**
     * 認証済みユーザーのメールアドレスを取得
     * @returns {Promise<string|null>} メールアドレスまたはnull
     */
    async getCurrentUserEmail() {
        if (!this.isSignedIn) {
            return null;
        }

        // キャッシュがあればそれを返す
        if (this.currentUserEmail) {
            return this.currentUserEmail;
        }

        try {
            const token = gapi.client.getToken();
            if (!token) {
                return null;
            }

            // userinfo APIを呼び出してメールアドレスを取得
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${token.access_token}`
                }
            });

            if (response.ok) {
                const userInfo = await response.json();
                this.currentUserEmail = userInfo.email;
                console.log('ユーザーメールアドレス取得:', this.currentUserEmail);
                return this.currentUserEmail;
            }
            return null;
        } catch (error) {
            console.error('ユーザー情報取得エラー:', error);
            return null;
        }
    }

    /**
     * Google Picker でフォルダを選択
     * @param {function} callback - 選択完了時のコールバック (folderId, folderName)
     */
    openFolderPicker(callback) {
        if (!this.pickerInited) {
            console.error('Picker APIが初期化されていません');
            if (callback) callback(null, null, 'Picker APIが初期化されていません');
            return;
        }

        const token = gapi.client.getToken();
        if (!token) {
            console.error('認証が必要です');
            if (callback) callback(null, null, '認証が必要です');
            return;
        }

        try {
            // フォルダのみを表示するビュー
            const docsView = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
                .setSelectFolderEnabled(true)
                .setIncludeFolders(true)
                .setMimeTypes('application/vnd.google-apps.folder');

            const picker = new google.picker.PickerBuilder()
                .addView(docsView)
                .setOAuthToken(token.access_token)
                .setDeveloperKey(this.API_KEY)
                .setCallback((data) => {
                    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
                        const folder = data[google.picker.Response.DOCUMENTS][0];
                        console.log('フォルダ選択:', folder.name, folder.id);
                        if (callback) callback(folder.id, folder.name, null);
                    } else if (data[google.picker.Response.ACTION] === google.picker.Action.CANCEL) {
                        console.log('フォルダ選択キャンセル');
                        if (callback) callback(null, null, null);
                    }
                })
                .setTitle('保存先フォルダを選択')
                .build();

            picker.setVisible(true);
        } catch (error) {
            console.error('Picker エラー:', error);
            if (callback) callback(null, null, error.message);
        }
    }

    /**
     * フォルダ名を取得
     * @param {string} folderId - フォルダID
     * @returns {Promise<string|null>} フォルダ名またはnull
     */
    async getFolderName(folderId) {
        if (!this.isSignedIn) {
            await this.authorize();
        }

        try {
            const response = await gapi.client.drive.files.get({
                fileId: folderId,
                fields: 'name'
            });
            return response.result.name;
        } catch (error) {
            console.error('フォルダ名取得エラー:', error);
            return null;
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
     * PDFファイルをGoogle Driveにアップロード
     * @param {string} fileName - ファイル名（.pdf拡張子）
     * @param {Blob} pdfBlob - PDFのBlobデータ
     * @param {string} folderId - 保存先フォルダID（省略時はデフォルトフォルダ）
     */
    async uploadPDFFile(fileName, pdfBlob, folderId = null) {
        if (!this.isSignedIn) {
            await this.authorize();
        }

        const targetFolderId = folderId || this.TARGET_FOLDER_ID;

        // ファイルメタデータ
        const fileMetadata = {
            name: fileName,
            mimeType: 'application/pdf',
            parents: [targetFolderId]
        };

        // BlobをBase64に変換
        const base64Data = await this.blobToBase64(pdfBlob);

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
            'Content-Type: application/pdf\r\n' +
            'Content-Transfer-Encoding: base64\r\n\r\n' +
            base64Data +
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

            console.log('Google Drive PDFアップロード成功:', response.result);
            return {
                success: true,
                fileId: response.result.id,
                fileName: response.result.name,
                webViewLink: `https://drive.google.com/file/d/${response.result.id}/view`
            };
        } catch (error) {
            console.error('Google Drive PDFアップロードエラー:', error);
            throw error;
        }
    }

    /**
     * BlobをBase64文字列に変換
     * @param {Blob} blob - 変換するBlob
     * @returns {Promise<string>} Base64文字列
     */
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // data:application/pdf;base64, の部分を除去
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
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

    /**
     * 生徒名フォルダを検索または作成
     * @param {string} studentName - 生徒名
     * @param {string} parentFolderId - 親フォルダID（省略時はデフォルトフォルダ）
     * @returns {Promise<{folderId: string, folderName: string, isNew: boolean}>}
     */
    async getOrCreateStudentFolder(studentName, parentFolderId = null) {
        if (!this.isSignedIn) {
            await this.authorize();
        }

        const targetParentFolderId = parentFolderId || this.TARGET_FOLDER_ID;
        const folderName = studentName;

        try {
            // まず既存のフォルダを検索
            const searchResponse = await gapi.client.drive.files.list({
                q: `name = '${folderName}' and '${targetParentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
                fields: 'files(id, name)'
            });

            if (searchResponse.result.files && searchResponse.result.files.length > 0) {
                // 既存のフォルダが見つかった
                const existingFolder = searchResponse.result.files[0];
                console.log('既存の生徒フォルダを発見:', existingFolder.name);
                return {
                    folderId: existingFolder.id,
                    folderName: existingFolder.name,
                    isNew: false
                };
            }

            // フォルダが存在しない場合は作成
            const folderMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [targetParentFolderId]
            };

            const createResponse = await gapi.client.drive.files.create({
                resource: folderMetadata,
                fields: 'id, name'
            });

            console.log('新しい生徒フォルダを作成:', createResponse.result.name);
            return {
                folderId: createResponse.result.id,
                folderName: createResponse.result.name,
                isNew: true
            };
        } catch (error) {
            console.error('生徒フォルダ作成/取得エラー:', error);
            throw error;
        }
    }

    /**
     * 生徒フォルダ内のファイル一覧を取得
     * @param {string} studentName - 生徒名
     * @returns {Promise<{success: boolean, files: Array, folderId: string}>}
     */
    async listStudentFiles(studentName) {
        try {
            const folderInfo = await this.getOrCreateStudentFolder(studentName);
            const files = await this.listFiles(folderInfo.folderId);
            return {
                success: true,
                files: files.files,
                folderId: folderInfo.folderId
            };
        } catch (error) {
            console.error('生徒ファイル一覧取得エラー:', error);
            throw error;
        }
    }

    /**
     * アセスメントシートを生徒フォルダに保存
     * @param {string} studentName - 生徒名
     * @param {string} fileName - ファイル名
     * @param {string} htmlContent - HTMLコンテンツ
     * @param {object} assessmentData - アセスメントデータ
     */
    async saveAssessmentToStudentFolder(studentName, fileName, htmlContent, assessmentData) {
        const results = {
            html: null,
            json: null,
            folder: null,
            success: false
        };

        try {
            // 生徒フォルダを取得または作成
            const folderInfo = await this.getOrCreateStudentFolder(studentName);
            results.folder = folderInfo;

            // HTMLファイルをアップロード
            results.html = await this.uploadHTMLFile(fileName, htmlContent, folderInfo.folderId);

            // JSONメタデータをアップロード
            const jsonFileName = fileName.replace('.html', '.json');
            const metadata = {
                type: 'assessment',
                fileName,
                studentName,
                data: assessmentData,
                createdAt: new Date().toISOString(),
                driveFileId: results.html.fileId,
                folderId: folderInfo.folderId
            };
            results.json = await this.uploadJSONFile(jsonFileName, metadata, folderInfo.folderId);

            results.success = true;
            console.log('アセスメントシートを生徒フォルダに保存完了:', studentName);
            return results;
        } catch (error) {
            console.error('生徒フォルダへのアセスメント保存エラー:', error);
            results.error = error.message;
            return results;
        }
    }

    /**
     * 記録を生徒フォルダに保存
     * @param {string} studentName - 生徒名
     * @param {string} fileName - ファイル名
     * @param {string} htmlContent - HTMLコンテンツ
     * @param {object} recordData - 記録データ
     */
    async saveRecordToStudentFolder(studentName, fileName, htmlContent, recordData) {
        const results = {
            html: null,
            json: null,
            folder: null,
            success: false
        };

        try {
            // 生徒フォルダを取得または作成
            const folderInfo = await this.getOrCreateStudentFolder(studentName);
            results.folder = folderInfo;

            // HTMLファイルをアップロード
            results.html = await this.uploadHTMLFile(fileName, htmlContent, folderInfo.folderId);

            // JSONメタデータをアップロード
            const jsonFileName = fileName.replace('.html', '.json');
            const metadata = {
                type: 'record',
                fileName,
                studentName,
                data: recordData,
                createdAt: new Date().toISOString(),
                driveFileId: results.html.fileId,
                folderId: folderInfo.folderId
            };
            results.json = await this.uploadJSONFile(jsonFileName, metadata, folderInfo.folderId);

            results.success = true;
            console.log('記録を生徒フォルダに保存完了:', studentName);
            return results;
        } catch (error) {
            console.error('生徒フォルダへの記録保存エラー:', error);
            results.error = error.message;
            return results;
        }
    }

    /**
     * 支援計画を生徒フォルダに保存
     * @param {string} studentName - 生徒名
     * @param {string} fileName - ファイル名
     * @param {string} htmlContent - HTMLコンテンツ
     * @param {object} planData - 支援計画データ
     */
    async saveSupportPlanToStudentFolder(studentName, fileName, htmlContent, planData) {
        const results = {
            html: null,
            json: null,
            folder: null,
            success: false
        };

        try {
            // 生徒フォルダを取得または作成
            const folderInfo = await this.getOrCreateStudentFolder(studentName);
            results.folder = folderInfo;

            // HTMLファイルをアップロード
            results.html = await this.uploadHTMLFile(fileName, htmlContent, folderInfo.folderId);

            // JSONメタデータをアップロード
            const jsonFileName = fileName.replace('.html', '.json');
            const metadata = {
                type: 'supportPlan',
                fileName,
                studentName,
                data: planData,
                createdAt: new Date().toISOString(),
                driveFileId: results.html.fileId,
                folderId: folderInfo.folderId
            };
            results.json = await this.uploadJSONFile(jsonFileName, metadata, folderInfo.folderId);

            results.success = true;
            console.log('支援計画を生徒フォルダに保存完了:', studentName);
            return results;
        } catch (error) {
            console.error('生徒フォルダへの支援計画保存エラー:', error);
            results.error = error.message;
            return results;
        }
    }

    /**
     * 振り返りレポートを生徒フォルダに保存
     * @param {string} studentName - 生徒名
     * @param {string} fileName - ファイル名
     * @param {string} htmlContent - HTMLコンテンツ
     * @param {object} reviewData - 振り返りデータ
     */
    async saveReviewToStudentFolder(studentName, fileName, htmlContent, reviewData) {
        const results = {
            html: null,
            json: null,
            folder: null,
            success: false
        };

        try {
            // 生徒フォルダを取得または作成
            const folderInfo = await this.getOrCreateStudentFolder(studentName);
            results.folder = folderInfo;

            // HTMLファイルをアップロード
            results.html = await this.uploadHTMLFile(fileName, htmlContent, folderInfo.folderId);

            // JSONメタデータをアップロード
            const jsonFileName = fileName.replace('.html', '.json');
            const metadata = {
                type: 'review',
                fileName,
                studentName,
                data: reviewData,
                createdAt: new Date().toISOString(),
                driveFileId: results.html.fileId,
                folderId: folderInfo.folderId
            };
            results.json = await this.uploadJSONFile(jsonFileName, metadata, folderInfo.folderId);

            results.success = true;
            console.log('振り返りレポートを生徒フォルダに保存完了:', studentName);
            return results;
        } catch (error) {
            console.error('生徒フォルダへの振り返り保存エラー:', error);
            results.error = error.message;
            return results;
        }
    }

    /**
     * ターゲットフォルダ内の全生徒フォルダ一覧を取得
     * @returns {Promise<{success: boolean, folders: Array}>}
     */
    async listStudentFolders() {
        if (!this.isSignedIn) {
            await this.authorize();
        }

        try {
            // ターゲットフォルダ内のフォルダのみを取得
            const response = await gapi.client.drive.files.list({
                q: `'${this.TARGET_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
                fields: 'files(id, name, createdTime)',
                orderBy: 'name'
            });

            console.log('生徒フォルダ一覧取得:', response.result.files?.length || 0, '件');
            return {
                success: true,
                folders: response.result.files || []
            };
        } catch (error) {
            console.error('生徒フォルダ一覧取得エラー:', error);
            throw error;
        }
    }

    /**
     * Google Driveから全生徒データを同期してlocalStorageに保存
     * @returns {Promise<{success: boolean, syncedStudents: Array, assessments: Object, supportPlans: Object, records: Object}>}
     */
    async syncAllStudentData() {
        const result = {
            success: false,
            syncedStudents: [],
            assessments: {},
            supportPlans: {},
            records: {}
        };

        try {
            // 全生徒フォルダを取得
            const folderList = await this.listStudentFolders();

            for (const folder of folderList.folders) {
                try {
                    // 各フォルダ内のJSONファイルを取得
                    const filesResponse = await gapi.client.drive.files.list({
                        q: `'${folder.id}' in parents and mimeType = 'application/json' and trashed = false`,
                        fields: 'files(id, name, createdTime)',
                        orderBy: 'createdTime desc'
                    });

                    for (const file of filesResponse.result.files || []) {
                        try {
                            // JSONファイルの内容を取得
                            const fileContent = await gapi.client.drive.files.get({
                                fileId: file.id,
                                alt: 'media'
                            });

                            const data = typeof fileContent.body === 'string'
                                ? JSON.parse(fileContent.body)
                                : fileContent.result;

                            // ファイルタイプに応じて振り分け
                            // キーはlocalStorageと同じ形式を使用（重複防止）
                            const key = data.fileName || file.name;
                            if (data.type === 'assessment') {
                                result.assessments[key] = {
                                    html: data.html || '',
                                    data: data.data || data,
                                    createdAt: data.createdAt,
                                    filePath: data.filePath || `drive/${file.name}`
                                };
                            } else if (data.type === 'supportPlan') {
                                result.supportPlans[key] = data;
                            } else if (data.type === 'record') {
                                result.records[key] = data;
                            }
                        } catch (e) {
                            console.warn('ファイル読み込みスキップ:', file.name, e.message);
                        }
                    }

                    result.syncedStudents.push({
                        name: folder.name,
                        folderId: folder.id
                    });
                } catch (e) {
                    console.warn('フォルダ処理スキップ:', folder.name, e.message);
                }
            }

            // localStorageに保存（既存データとマージ）
            const existingAssessments = JSON.parse(localStorage.getItem('assessments') || '{}');
            const existingSupportPlans = JSON.parse(localStorage.getItem('supportPlans') || '{}');
            const existingRecords = JSON.parse(localStorage.getItem('dailyReports') || '{}');

            const mergedAssessments = { ...existingAssessments, ...result.assessments };
            const mergedSupportPlans = { ...existingSupportPlans, ...result.supportPlans };
            const mergedRecords = { ...existingRecords, ...result.records };

            localStorage.setItem('assessments', JSON.stringify(mergedAssessments));
            localStorage.setItem('supportPlans', JSON.stringify(mergedSupportPlans));
            localStorage.setItem('dailyReports', JSON.stringify(mergedRecords));
            localStorage.setItem('syncTimestamp', new Date().toISOString());

            result.success = true;
            result.assessments = mergedAssessments;
            result.supportPlans = mergedSupportPlans;
            result.records = mergedRecords;

            console.log('データ同期完了:', result.syncedStudents.length, '名の生徒データを同期');
            return result;
        } catch (error) {
            console.error('データ同期エラー:', error);
            result.error = error.message;
            return result;
        }
    }

    /**
     * 生徒フォルダからアセスメントと記録データを取得（振り返り用）
     * @param {string} studentName - 生徒名
     * @returns {Promise<{assessments: Array, records: Array}>}
     */
    async getStudentDataForReview(studentName) {
        try {
            const folderInfo = await this.getOrCreateStudentFolder(studentName);

            // JSONファイルのみを取得
            const response = await gapi.client.drive.files.list({
                q: `'${folderInfo.folderId}' in parents and mimeType = 'application/json' and trashed = false`,
                fields: 'files(id, name, createdTime)',
                orderBy: 'createdTime desc'
            });

            const assessments = [];
            const records = [];

            // 各JSONファイルの内容を取得
            for (const file of response.result.files || []) {
                try {
                    const fileContent = await gapi.client.drive.files.get({
                        fileId: file.id,
                        alt: 'media'
                    });

                    const data = typeof fileContent.body === 'string'
                        ? JSON.parse(fileContent.body)
                        : fileContent.result;

                    if (data.type === 'assessment') {
                        assessments.push(data);
                    } else if (data.type === 'record') {
                        records.push(data);
                    }
                } catch (e) {
                    console.warn('ファイル読み込みエラー:', file.name, e);
                }
            }

            return {
                success: true,
                assessments,
                records,
                folderId: folderInfo.folderId
            };
        } catch (error) {
            console.error('生徒データ取得エラー:', error);
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
