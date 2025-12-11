// Gemini API設定ファイル
// APIキーはユーザーがUI上で設定します（localStorageに保存）

const API_CONFIG = {
    // Gemini APIキー（ユーザーが設定画面から入力）
    GEMINI_API_KEY: '',

    // 使用するモデル
    MODEL_NAME: 'gemini-2.0-flash-exp'
};

// Google Drive API設定
const DRIVE_CONFIG = {
    // OAuth 2.0 クライアントID（Google Cloud Consoleで取得）
    CLIENT_ID: '537186649664-12ft0p2d5a3jkbkpvjoquugfgpoiov86.apps.googleusercontent.com',

    // APIキー（Google Cloud Console > 認証情報 > APIキーを作成）
    API_KEY: 'AIzaSyDen7M5YfihnQYaiHtigRvNewb4f6utUbo',

    // 保存先フォルダID
    TARGET_FOLDER_ID: '1KvbKykAiUK6BKoqsFQQhyRqYQp7NQm77'
};
