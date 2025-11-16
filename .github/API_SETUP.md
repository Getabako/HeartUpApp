# Gemini API キーのセットアップ手順

このアプリケーションはGoogle Gemini APIを使用しています。GitHub Secretsを使ってAPIキーを安全に管理します。

## 🔐 セキュリティ上の重要な注意

- ✅ **GitHub Secretsを使用**: APIキーはGitHub Secretsに保存し、絶対にコードに直接書き込まないでください
- ✅ **自動デプロイ**: GitHub Actionsが自動的にAPIキーを注入してデプロイします
- ❌ **config.jsをコミットしない**: このファイルは.gitignoreに含まれており、リポジトリにはコミットされません

---

## セットアップ手順

### ステップ1: Gemini APIキーの取得

1. **Google AI Studioにアクセス**
   - https://makersuite.google.com/app/apikey にアクセス

2. **APIキーを作成**
   - 「Create API Key」ボタンをクリック
   - 新しいAPIキーが生成されます

3. **APIキーをコピー**
   - 生成されたAPIキー（`AIza...` で始まる文字列）をコピーします

---

### ステップ2: GitHubリポジトリにAPIキーを登録

1. **GitHubリポジトリの設定を開く**
   - https://github.com/Getabako/HeartUpApp/settings/secrets/actions にアクセス

2. **新しいシークレットを作成**
   - `New repository secret` ボタンをクリック

3. **シークレット情報を入力**
   - **Name**: `GEMINI_API_KEY`
     - （この名前は正確に入力してください）
   - **Secret**: ステップ1でコピーしたGemini APIキーを貼り付け

4. **保存**
   - `Add secret` ボタンをクリック

---

### ステップ3: Claude Code OAuth トークンの登録

Claude Code Bot機能を使用する場合は、こちらも設定してください。

1. **手元のPCでOAuthトークンを生成**
   ```bash
   claude setup-token
   ```

2. **GitHubリポジトリに登録**
   - https://github.com/Getabako/HeartUpApp/settings/secrets/actions にアクセス
   - `New repository secret` ボタンをクリック
   - **Name**: `CLAUDE_CODE_OAUTH_TOKEN`
   - **Secret**: 生成されたトークン（`claudecode_oauth_...`）を貼り付け
   - `Add secret` ボタンをクリック

詳細は `.github/CLAUDE_SETUP.md` を参照してください。

---

### ステップ4: 自動デプロイの確認

APIキーを登録すると、次回のコミット時に自動的にGitHub Pagesにデプロイされます。

1. **デプロイワークフローの確認**
   - リポジトリの `Actions` タブを開く
   - 「Deploy to GitHub Pages」ワークフローが実行されていることを確認

2. **デプロイされたサイトにアクセス**
   - https://getabako.github.io/HeartUpApp/ にアクセス
   - AI機能が正常に動作することを確認

---

## ローカル開発環境でのセットアップ

ローカルで開発する場合は、以下の手順でAPIキーを設定します。

1. **config.example.jsをコピー**
   ```bash
   cp config.example.js config.js
   ```

2. **config.jsを編集**
   ```javascript
   const API_CONFIG = {
       GEMINI_API_KEY: 'ここにあなたのAPIキーを貼り付け',
       MODEL_NAME: 'gemini-2.5-flash'
   };
   ```

3. **注意事項**
   - config.jsは.gitignoreに含まれているため、Gitにコミットされません
   - 絶対にconfig.jsをリポジトリにプッシュしないでください

---

## トラブルシューティング

### APIキーのエラーが発生する場合

1. **シークレット名を確認**
   - `GEMINI_API_KEY` という名前で正確に登録されているか確認

2. **APIキーの有効性を確認**
   - Google AI StudioでAPIキーが有効であることを確認
   - 必要に応じて新しいAPIキーを生成

3. **ワークフローを再実行**
   - Actionsタブから「Deploy to GitHub Pages」を手動で再実行

### デプロイが失敗する場合

1. **GitHub Pagesが有効か確認**
   - Settings → Pages → Source が「GitHub Actions」になっているか確認

2. **ワークフローのログを確認**
   - Actionsタブでエラーメッセージを確認

---

## 登録が必要なシークレット一覧

| シークレット名 | 用途 | 必須 |
|---|---|---|
| `GEMINI_API_KEY` | Gemini AI機能 | ✅ 必須 |
| `CLAUDE_CODE_OAUTH_TOKEN` | Claude Code Bot機能 | オプション |

---

## 参考情報

- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [GitHub Secrets ドキュメント](https://docs.github.com/ja/actions/security-guides/encrypted-secrets)
- [GitHub Pages ドキュメント](https://docs.github.com/ja/pages)
