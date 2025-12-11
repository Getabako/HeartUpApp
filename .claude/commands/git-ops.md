# Git操作

リポジトリへのGit操作を安全に実行するためのガイドです。

## 基本操作

### 状態確認
```bash
# 現在の状態を確認
git status

# 変更内容を確認
git diff

# ステージング済みの変更を確認
git diff --staged

# コミット履歴を確認
git log --oneline -10
```

### ブランチ操作
```bash
# ブランチ一覧
git branch -a

# 新しいブランチを作成して切り替え
git checkout -b feature/[機能名]

# ブランチを切り替え
git checkout [ブランチ名]

# ブランチを削除
git branch -d [ブランチ名]
```

### コミット操作
```bash
# ファイルをステージング
git add [ファイル名]
git add .  # 全ファイル

# コミット
git commit -m "[コミットメッセージ]"

# 直前のコミットを修正（プッシュ前のみ）
git commit --amend
```

### リモート操作
```bash
# プッシュ
git push origin [ブランチ名]

# プル
git pull origin [ブランチ名]

# フェッチ
git fetch origin
```

## ブランチ命名規則

| プレフィックス | 用途 | 例 |
|--------------|------|-----|
| `feature/` | 新機能開発 | `feature/user-auth` |
| `fix/` | バグ修正 | `fix/login-error` |
| `hotfix/` | 緊急修正 | `hotfix/security-patch` |
| `refactor/` | リファクタリング | `refactor/api-structure` |
| `docs/` | ドキュメント | `docs/api-readme` |
| `style/` | スタイル変更 | `style/button-design` |
| `test/` | テスト追加 | `test/unit-tests` |

## コミットメッセージ規則

### フォーマット
```
[種類]: [簡潔な説明]

[詳細な説明（任意）]

[関連Issue（任意）]
```

### 種類（Type）
| 種類 | 説明 |
|-----|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメント |
| `style` | コードスタイル（動作に影響なし） |
| `refactor` | リファクタリング |
| `test` | テスト |
| `chore` | ビルド・補助ツール |

### 例
```
feat: ユーザー認証機能を追加

- ログイン/ログアウト機能を実装
- セッション管理を追加
- パスワードリセット機能を実装

Closes #123
```

## 安全なワークフロー

### 機能開発の流れ
```bash
# 1. mainブランチを最新に
git checkout main
git pull origin main

# 2. 機能ブランチを作成
git checkout -b feature/new-feature

# 3. 変更を加えてコミット
git add .
git commit -m "feat: 新機能を追加"

# 4. リモートにプッシュ
git push origin feature/new-feature

# 5. プルリクエストを作成（GitHub/GitLab上で）
```

### コンフリクト解決
```bash
# 1. mainの最新を取得
git fetch origin main

# 2. mainをマージ
git merge origin/main

# 3. コンフリクトを解決
# [ファイルを編集してコンフリクトを解消]

# 4. 解決をマーク
git add [解決したファイル]
git commit -m "merge: mainとのコンフリクトを解決"
```

## 注意事項

### やってはいけないこと
- `git push --force` を共有ブランチで実行
- コミットせずにブランチを切り替え（stashを使用）
- 機密情報（パスワード、APIキー）をコミット
- 巨大なバイナリファイルをコミット

### 推奨事項
- 小さく頻繁にコミット
- 意味のあるコミットメッセージ
- プッシュ前にdiffを確認
- 定期的にmainをマージ

## トラブルシューティング

### 直前のコミットを取り消す（プッシュ前）
```bash
git reset --soft HEAD~1  # 変更は保持
git reset --hard HEAD~1  # 変更も削除
```

### 特定のファイルを前の状態に戻す
```bash
git checkout HEAD -- [ファイル名]
```

### ステージングを取り消す
```bash
git reset HEAD [ファイル名]
```

### 誤ってコミットしたファイルを履歴から削除
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch [ファイル名]" \
  --prune-empty --tag-name-filter cat -- --all
```

## 使用方法

このスキルを呼び出す際は、以下の情報を提供してください：
- 実行したい操作
- 現在のブランチ状況（必要に応じて）
- 関連するファイルやコミット
