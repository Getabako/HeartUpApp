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
- **用途**: 心の健康管理アプリケーション

---

## 重要な仕様・ルール

### Google Drive保存の仕様

- **保存先フォルダはユーザー（利用者）がGoogle Pickerで選択する**。サーバー側やコードで固定しない。
- 選択されたフォルダIDは`localStorage`に保存され、次回以降自動で使用される。
- `DRIVE_CONFIG.TARGET_FOLDER_ID`は常に空文字列とする（build.shでもハードコードしない）。
- この仕様を勝手に変更しないこと。

### Vercel環境変数

| 環境変数 | 用途 | 備考 |
|---------|------|------|
| `GEMINI_API_KEY` | Gemini API + Google Drive API | GeminiとDriveで同一キーを使用 |
| `GOOGLE_DRIVE_CLIENT_ID` | Google OAuth 2.0 クライアントID | Drive保存用 |
| `GOOGLE_DRIVE_API_KEY` | （任意）Drive APIキー | 未設定時は`GEMINI_API_KEY`にフォールバック |

- GeminiとDrive APIは同じAPIキーを使う運用。
- そのため、Google CloudプロジェクトでGemini API **と** Google Drive API の両方を有効にすること。
- `build.sh`がこれらの環境変数からconfig.jsを生成する。

### デプロイ

- Vercelでホスティング（`heartup.if-juku.net`）
- `vercel.json`の`buildCommand`で`build.sh`を実行し、config.jsを生成
- `config.js`は`.gitignore`に含まれておりgit管理外（ビルド時に生成）
