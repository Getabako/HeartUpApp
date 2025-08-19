# HeartUpApp - サッカー療育支援システム

サッカー療育事業向けのWebアプリケーション（デモ版）

## 機能

### 📚 資料閲覧機能
- サッカー療育、応用行動分析、事例研究の資料検索
- キーワード検索とカテゴリフィルター
- お気に入り機能

### 🤖 AI書類作成機能
- **記録作成補助**: 簡単な情報入力から詳細な療育記録を自動生成
- **支援計画作成**: 短期〜長期の包括的な支援計画を立案
- **成長の振り返り**: データ分析による成長レポート生成

## セットアップ

### Gemini API設定

1. [Google AI Studio](https://makersuite.google.com/app/apikey)でAPIキーを取得
2. `config.example.js`を`config.js`にコピー
3. `config.js`にAPIキーを設定
4. GitHub Pagesにデプロイする際は`config.js`を除外

### ローカル開発

```bash
# リポジトリをクローン
git clone https://github.com/Getabako/HeartUpApp.git
cd HeartUpApp

# config.jsを作成
cp config.example.js config.js

# config.jsにAPIキーを設定
# GEMINI_API_KEY: 'your-api-key-here'

# ローカルサーバーで実行（必須）
# CORSの制限により、file://では動作しません
python -m http.server 8000
# または
npx serve .
```

### GitHub Pagesでの公開

このアプリはGitHub Pagesで公開されています：
https://getabako.github.io/HeartUpApp/

APIキーの設定は、アプリ内のモーダルで行うか、各自で`config.js`を作成してください。

## 技術スタック

- HTML/CSS/JavaScript
- Gemini AI API
- GitHub Pages

## 注意事項

- APIキーは絶対にGitHubにアップロードしないでください
- ローカルでの開発にはHTTPサーバーが必要です
- GitHub Pages版では、APIキー設定モーダルから設定してください

## ライセンス

MIT License