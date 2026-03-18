# HeartUpApp プロジェクト設定

## Web制作AIオーケストラ部隊

このプロジェクトでは、Web制作タスクを効率的に実行するための「AIオーケストラ部隊」構成を採用しています。

### 部隊構成

```
                    ┌─────────────────┐
                    │   ディレクター    │
                    │   (director)    │
                    └────────┬────────┘
                             │
          ┌──────────┬───────┴───────┬──────────┐
          │          │               │          │
    ┌─────┴─────┐┌───┴───┐    ┌──────┴─────┐┌───┴───┐
    │ コーディング ││ デザイン │    │ コンテンツ  ││ メディア │
    │  (coding) ││(design)│    │ (content) ││(media) │
    └───────────┘└────────┘    └───────────┘└────────┘
```

### サブエージェント一覧

| エージェント | ファイル | 担当領域 |
|------------|---------|---------|
| ディレクター | `.claude/agents/director.md` | 全体統括、タスク振り分け、品質管理 |
| コーディング | `.claude/agents/coding.md` | HTML/CSS/JS実装、API、テスト |
| デザイン | `.claude/agents/design.md` | UI/UX、レイアウト、ワイヤーフレーム |
| コンテンツ | `.claude/agents/content.md` | テキスト作成、SEOライティング |
| メディア | `.claude/agents/media.md` | 画像、アイコン、図表 |

### 共通スキル（コマンド）

| スキル | コマンド | 対象サブエージェント |
|-------|---------|-------------------|
| SEO最適化チェック | `/seo-check` | コンテンツ、デザイン、コーディング |
| デザインシステム参照 | `/design-system` | デザイン、コーディング、メディア |
| セキュリティチェック | `/security-check` | コーディング |
| Git操作 | `/git-ops` | コーディング、ディレクター |

### 標準ワークフロー

新しいページを作成する場合：

1. **ディレクター**: タスクを分解し、各サブエージェントに指示
2. **コンテンツ**: ページ構成とテキストのドラフト作成
3. **デザイン**: コンテンツに基づきUI/UXを設計
4. **メディア**: デザインに基づき必要な画像を生成
5. **コーディング**: デザインとコンテンツを実装 → `/seo-check`, `/security-check`
6. **ディレクター**: 全成果物を統合し最終レビュー

### サブエージェントの呼び出し方

Task toolを使用して以下のように呼び出します：

```
subagent_type: "coding"   → コーディング・サブエージェント
subagent_type: "design"   → デザイン・サブエージェント
subagent_type: "content"  → コンテンツ・サブエージェント
subagent_type: "media"    → メディア・サブエージェント
```

---

## プロジェクト情報

- **アプリ名**: HeartUpApp
- **用途**: サッカー療育支援システム（放課後等デイサービス向け）

---

## 重要な仕様・ルール

### データ保存方式（Firebase Firestore + localStorageキャッシュ）

- **プライマリ**: Firebase Firestore（拠点ごとにデータ分離）
- **キャッシュ**: localStorage（Firebase未接続時のフォールバック兼オフラインキャッシュ）
- `data-adapter.js` が橋渡し。全データ操作は `dataAdapter.getXxx()` / `dataAdapter.saveXxx()` 経由
- Firebase未設定の場合はlocalStorageのみで動作（後方互換性維持）
- Google Drive連携は廃止済み（`google-drive-api.js`は削除済み）

### 認証（Firebase Auth + Google OAuth）

- `login.html` でGoogleログイン → `staff_profiles` 照合 → 未招待は「承認待ち」
- `auth-guard.js` を全ページに設置（未認証 → login.htmlリダイレクト）
- 最初のユーザーは自動的にadminとして登録される（bootstrapFirstAdmin）
- スタッフ招待: admin が `staff_invitations` に登録 → スタッフがログイン時に自動プロフィール作成

### データ分離

- クエリレベルで `locationId` フィルタリング
- adminは全拠点のデータにアクセス可能
- Firestore Security Rules: 認証済みユーザーのみアクセス可能

### ファイル構成

| ファイル | 役割 |
|---------|------|
| `firebase-client.js` | Firebaseクライアント + 全CRUD + Auth + Admin操作 |
| `data-adapter.js` | localStorage互換アダプタ（旧コードとの橋渡し） |
| `auth-guard.js` | 全ページ共通の認証チェック + リダイレクト |
| `login.html` | ログインページ（Google OAuth） |
| `admin.html` | 管理画面（拠点/スタッフ管理、admin専用） |
| `firestore.rules` | Firestore Security Rules（Firebase Consoleに貼り付け） |

### Vercel環境変数

| 環境変数 | 用途 | 備考 |
|---------|------|------|
| `GEMINI_API_KEY` | Gemini API | AI書類生成で使用 |
| `FIREBASE_API_KEY` | Firebase APIキー | Firebase Consoleから取得 |
| `FIREBASE_AUTH_DOMAIN` | Firebase Authドメイン | `xxx.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase プロジェクトID | |

- `build.sh`がこれらの環境変数からconfig.jsを生成する。

### デプロイ

- Vercelでホスティング（`heartup.if-juku.net`）
- `vercel.json`の`buildCommand`で`build.sh`を実行し、config.jsを生成
- `config.js`は`.gitignore`に含まれておりgit管理外（ビルド時に生成）

### Firebase初期セットアップ手順

1. Firebase Console でプロジェクト作成
2. Firestore Database を作成（アジアリージョン推奨）
3. Authentication > Sign-in method > Google を有効化
4. Firestore > ルール に `firestore.rules` の内容を貼り付け
5. プロジェクト設定 > マイアプリ > ウェブアプリを追加 → 設定値を取得
6. Vercel環境変数に `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID` を設定
7. 最初のユーザーがログインすると自動的にadmin + デフォルト拠点が作成される
