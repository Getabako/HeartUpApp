// Gemini API設定ファイルのサンプル
// このファイルをconfig.jsとしてコピーし、実際のAPIキーを設定してください
// 注意: config.jsは絶対にGitHubにアップロードしないでください！

const API_CONFIG = {
    // Gemini APIキーをここに設定
    // https://makersuite.google.com/app/apikey で取得
    GEMINI_API_KEY: 'YOUR_API_KEY_HERE',

    // 使用するモデル
    MODEL_NAME: 'gemini-1.5-flash'
};

// Google Drive API設定
// Google Cloud Consoleで設定してください
// 1. https://console.cloud.google.com にアクセス
// 2. APIとサービス > 認証情報 > 認証情報を作成 > OAuth 2.0 クライアント ID
// 3. アプリケーションの種類: ウェブアプリケーション
// 4. 承認済みの JavaScript 生成元にドメインを追加（例: http://localhost:3000）
// 5. APIとサービス > ライブラリ > Google Drive API を有効化
const DRIVE_CONFIG = {
    // OAuth 2.0 クライアントID
    CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',

    // APIキー（Google Cloud Console > 認証情報 > APIキーを作成）
    API_KEY: 'YOUR_API_KEY_HERE',

    // 保存先フォルダID（Google DriveのフォルダURLから取得）
    // 例: https://drive.google.com/drive/folders/1KvbKykAiUK6BKoqsFQQhyRqYQp7NQm77
    //     この場合のIDは「1KvbKykAiUK6BKoqsFQQhyRqYQp7NQm77」
    TARGET_FOLDER_ID: '1KvbKykAiUK6BKoqsFQQhyRqYQp7NQm77'
};