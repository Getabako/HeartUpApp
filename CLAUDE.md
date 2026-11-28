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

### Firebase のプロジェクトは 2 つある（取り違えない・2026-11-27）

- **本番は `heartup-app`**（ハイフンあり）。先方（ハートアップ）側の Google アカウントの持ち物で、高崎のアカウント（gcloud）からは見えない。Vercel の `FIREBASE_PROJECT_ID` はこちら
- `heartupapp`（ハイフンなし）は高崎名義の旧プロジェクト。2026-05-23 までの古いデータが残っているだけで、本番はつないでいない。いまは AI の予備経路（Vertex AI）にだけ使う
- gcloud で見えるのは旧プロジェクトのほう。本番のデータやスタッフを調べるつもりで旧プロジェクトを見ない

### 認証（Firebase Auth + Google OAuth）

- `login.html` でGoogleログイン → `staff_profiles` 照合 → 未招待は「承認待ち」
- `auth-guard.js` を全ページに設置（未認証 → login.htmlリダイレクト）
- 最初のユーザーは自動的にadminとして登録される（bootstrapFirstAdmin）
- スタッフ招待: admin が `staff_invitations` に登録 → スタッフがログイン時に自動プロフィール作成

### LINE などアプリの中の画面で開かれたとき（`inapp-browser.js`、2026-11-26 追加）

- LINE のトークから開くと LINE の中の画面になり、Google のログインができない（Google 側の決まり。白い画面のままになる）
- 各ページの `<head>` の先頭で `inapp-browser.js` を読み込み、LINE なら `?openExternalBrowser=1` を付けてふつうのブラウザで開き直す。開き直せないとき・ほかのアプリの中の画面のときは「ブラウザで開く」「アドレスをコピー」の案内を出す
- ログインが要るページを足すときは、同じ 1 行を `<head>` に入れる

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
| `GEMINI_API_KEY` | Gemini API | AI書類生成・練習メニュー生成・ホワイトボード写真の読み取り・練習メニューのイラスト生成・音声入力の文字起こしで使用 |
| `GOOGLE_VERTEX_SA` | 予備の経路。Google Cloud（Vertex AI）経由で Gemini を呼ぶためのサービスアカウント（JSON を base64 にしたもの） | 2026-11-27 追加。本線は `GEMINI_API_KEY`（ハートアップ発行の鍵・料金はハートアップ側）。その鍵が Google に断られたときだけこちらに回る（料金は高崎の Google Cloud に付くので常用しない。本人は自分の請求でほかの事業の分を払うのを望まない）。応答の `route` が `key` なら本線、`vertex` なら予備。元の JSON は `~/.secrets/heartup-vertex-sa.json` |
| `GEMINI_TEXT_MODEL` | 文章生成のモデル名（任意） | 未設定なら `gemini-3.5-flash` → `gemini-3.8-flash`（`gemini-2.5-flash` は Google Cloud 側で提供終了） |
| `GEMINI_IMAGE_MODEL` / `GEMINI_TRANSCRIBE_MODEL` | 画像生成・文字起こしのモデル名（任意） | 未設定なら `gemini-3-pro-image`（いちばん高品質。1枚 約0.134ドル）/ `gemini-3.5-transcribe`。使えないときは `gemini-3.1-flash-image` → `gemini-2.5-flash-image` / `gemini-2.5-flash` に自動で切り替え |
| `IMAGE_DAILY_LIMIT` | 画像生成の1日の目安枚数（任意） | 未設定なら20。端末ごとの目安表示に使う |
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

### サーバーレスAPI（`api/`、2026-09-29 追加）

| エンドポイント | 役割 |
|---------|------|
| `GET /api/ai-status` | 画像生成・音声認識（どちらも Gemini）が有効かを返す。クライアントはこれを見てUIを切り替える |
| `POST /api/generate-image` | 練習メニューのイラスト生成。`{ prompt, size, quality }` → `{ image: dataURL }`。キー未設定時は 501 |
| `POST /api/generate-text` | 文章生成（記録・連絡帳・支援計画・練習メニュー・写真の読み取り）。`{ prompt, images?, temperature? }` → `{ text }`。ブラウザの `gemini-api.js` はここだけを呼ぶ。鍵はブラウザに置かない（2026-11-27。それまでは `config.js` に鍵を書き出してブラウザから直接呼んでいた） |
| `POST /api/transcribe` | 音声メモの文字起こし。`{ audio: dataURL }` → `{ text }`。キー未設定時は 501 |

- 画像生成も音声の文字起こしも `GEMINI_API_KEY` だけで動く（2026-11-25 本人指示で OpenAI は使わない形に変更。共通部品は `api/_gemini.js`）
- ローカルは `npm run dev`（server.js が同じパスで api/ を提供）
- 画像は Firestore の1MB制限に合わせてクライアント側で縮小保存（高解像度は生成直後にダウンロード可）

### 拠点設定「サッカー活動の頻度」（2026-10-26 改訂）

- admin.html の拠点一覧で3択。`locations/{id}.soccerMode` = `always`（毎回）/ `partial`（一部の日のみ、週2回など）/ `none`（なし）。旧 `noSoccer` は `none` と同義で互換維持
- `none`: 活動記録・連絡帳・支援計画・モニタリング・修正依頼のすべてでサッカーに言及しない
- `partial`: 記録・連絡帳はその日に選んだ活動で判定（ウォーミングアップ〜クールダウンのサッカー系が1つでもあればサッカーの記録を残す）。計画書・モニタリングは `PARTIAL_SOCCER_NOTICE` でサッカー以外の活動も同比重で書かせる
- 活動内容が「公園・工作・料理・クラブ活動・お出かけ・イベント・その他」だけの記録は、拠点設定に関係なくサッカーに言及しない
- 判定は `script.js` の `resolveNonSoccer(locCtx, activities)`、参照は `dataAdapter.getChildLocationContext(childName)`

### 連絡帳の文体（2026-10-26 追加）

- 「おられました」「存じます」などの過剰敬語は禁止し、「です・ます・でした」に統一（`gemini-api.js` の `PLAIN_POLITE_STYLE`。記録生成・修正依頼にも適用）
- 拠点ごとの追加ルールは admin.html の「連絡帳の文体ルール」欄（`locations/{id}.parentNoteStyle`）。連絡帳生成時に「最優先で守ること」として付加される。修正依頼で直した内容をここに書き足していくのが「AIに学習させる」運用

### CSV/Excelインポート（2026-10-26 改訂）

- `.xlsx` も受け付ける（SheetJS をCDN読み込み、先頭シートをCSV化。日付セルは YYYY-MM-DD に正規化）。Shift_JIS の CSV も自動判定
- 活動記録は「日付・児童名・活動内容・様子・備考」の横型（他事業所がExcelで作った独自様式）と HUG 形式の縦型の両方に対応。列名のゆれ（氏名/利用者名、本日の様子/観察内容 等）も吸収
- 一括記録の活動に「お出かけ」を追加。選ぶと「お出かけ先・内容」欄が出て、記録と連絡帳に「お出かけ（〇〇）」として反映

### 練習メニュー生成（`practice-menu-generator.js`）

- 「テーマから作成」「ホワイトボード写真から作成」の2モード。Gemini が W-up / Tr.1 / Tr.2 / 試合 の型で構造化JSONを返す
- 型と画風の指針は `gemini-api.js` の `PRACTICE_MENU_STYLE` / `ILLUSTRATION_STYLE`（現場のホワイトボード写真83枚を分析して抽出）
- 生成結果からイラスト用プロンプトを組み立て、アプリ内で画像生成（Gemini）
- 保存先は Firestore `generated_menus`（拠点ごと）、未接続時は localStorage `generatedPracticeMenus`
- 参考写真フォルダ `メニュー/` は児童名が写るため git 管理外

### 修正依頼機能

- 支援計画一覧・成長記録一覧の「表示」モーダル下部に修正依頼欄。AIが修正して上書き保存
- 計画書は公式様式JSON（`planData.selfSupport` 等）を修正して再レンダリング。日付は `planData._startDate/_endDate` に保持
- 活動記録は `reportData.rawMarkdown` を修正。連絡帳文章（`.saved-parent-note`）は保持

### 音声入力（`voice-input.js`）

- 一括記録の各メモ欄・単発記録の観察欄に「音声入力」ボタン
- サーバー側キーがあれば `/api/transcribe`、無ければブラウザの Web Speech API（Chrome/Edge/Safari）

### 一括記録まわりの追加（2026-11-27）

- **利用する曜日**: 児童データの直下に `attendDays`（0=日〜6=土 の配列）。児童の「基本情報の編集」か、一括記録の児童選択にある「いま選んでいる児童を〇曜日の児童として登録する」で入れる。一括記録では、その日付の曜日の児童が最初から選ばれる
- **メモをためる**（AI書類作成のタブ `memo-stock`）: Firestore `memo_stock`（`childName / date / text / locationId / staffName`）。複数のスタッフがその日のメモをためておき、一括記録の「記録入力」で、メモ欄が空の児童に自動で入る
- **練習メニューの連動**: 一括記録の最初の画面で、保存済みの練習メニュー（`generated_menus`）を選べる。選ぶと内容を短い文章にして記録の AI に渡す（「何をしたか」の説明にだけ使い、児童の様子はメモだけを根拠にする）
- **端末内の保存がいっぱいでも止まらない**: `data-adapter.js` の `lsSet`。Firebase 接続中の localStorage は控えなので、いっぱいなら DB 保存済みの分を捨てる。記録を DB に保存できなかったときは、端末内だけに保存せずエラーを出す（ほかの人から見えない記録を作らない）
- **あいうえお順**: `compareByKana`（script.js）。ふりがなで比べ、ふりがなの無い漢字だけの児童は後ろにまとめる
- **練習メニューは全拠点で共有**: `getGeneratedMenus` は拠点でしぼらない
- **記録と連絡帳は同時に作る**: 一括記録は児童ごとに記録と連絡帳を 1 回で作って保存する（連絡帳だけ失敗しても記録は残す）
- **メモは複数の児童へ**: 「メモをためる」は児童を何人でも選べ、同じメモを 1 人ずつ保存する

### 拠点グループと専門支援（2026-11-28）

- **拠点グループ**: 同じグループの拠点は、互いの児童・記録を見られる。`firebase-client.js` の `locationGroupOf`（拠点の `group` を優先。未設定なら拠点名から 鳥栖エリア＝大正町・鳥栖・古野町・プリマヴェーラ／長南エリア＝長南・長南2）、`_loadMyGroup`（ログイン時）、`_locationQuery`（グループなら `locationId in [...]`）。管理画面の拠点一覧に「グループ」の欄がある。管理者は今までどおり全拠点
- **専門支援メニュー**: `generated_menus` に `kind: 'support'`・`category: 'support'` で保存（練習メニューは `kind` なしか `practice`）。作成は `PracticeMenuGen.open('theme', 'support')` → `geminiAPI.generateSupportMenu`。構成は 導入 → 活動1 → 活動2 → ふり返り。テーマの選択肢は `SUPPORT_THEMES`（先方の画像で読めた 5 つ。全 28 件の残りは未反映）。一括記録の最初の画面で練習メニューとは別に選べ、記録の AI には `supportMenu` として渡す
