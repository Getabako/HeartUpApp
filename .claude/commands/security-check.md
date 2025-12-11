# セキュリティチェック

コードに対してセキュリティ脆弱性のチェックを行い、問題点と修正案を提示してください。

## チェック対象の脆弱性

### 1. インジェクション攻撃

#### SQLインジェクション
```javascript
// 危険な例
const query = `SELECT * FROM users WHERE id = ${userId}`;

// 安全な例
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

#### コマンドインジェクション
```javascript
// 危険な例
exec(`ls ${userInput}`);

// 安全な例
execFile('ls', [sanitizedInput]);
```

### 2. クロスサイトスクリプティング (XSS)

#### 反射型XSS
```javascript
// 危険な例
element.innerHTML = userInput;

// 安全な例
element.textContent = userInput;
// または
element.innerHTML = DOMPurify.sanitize(userInput);
```

#### DOM Based XSS
```javascript
// 危険な例
document.write(location.hash);

// 安全な例
const sanitized = encodeURIComponent(location.hash);
```

### 3. クロスサイトリクエストフォージェリ (CSRF)
- CSRFトークンの実装確認
- SameSite Cookie属性の設定
- Refererヘッダーの検証

### 4. 認証・認可の問題
- パスワードのハッシュ化（bcrypt, argon2）
- セッション管理の安全性
- 権限チェックの実装
- JWTの適切な使用

### 5. 機密情報の露出
- ハードコードされた認証情報
- APIキーの露出
- デバッグ情報の本番環境での表示
- エラーメッセージでの情報漏洩

### 6. 安全でない設定
- HTTPS強制
- セキュリティヘッダー（CSP, X-Frame-Options等）
- CORSの適切な設定
- Cookie属性（HttpOnly, Secure, SameSite）

## チェックリスト

### 入力処理
- [ ] すべてのユーザー入力をバリデーション
- [ ] 入力の型、長さ、形式を検証
- [ ] ホワイトリスト方式での検証
- [ ] 適切なエスケープ処理

### 出力処理
- [ ] HTMLエスケープ
- [ ] URLエンコーディング
- [ ] JSONエスケープ
- [ ] SQLパラメータ化

### 認証・セッション
- [ ] 強力なパスワードポリシー
- [ ] 安全なセッション管理
- [ ] 適切なログアウト処理
- [ ] ブルートフォース対策

### データ保護
- [ ] 機密データの暗号化
- [ ] HTTPS通信の強制
- [ ] 適切なアクセス制御
- [ ] ログでの機密情報マスキング

## 出力フォーマット

```markdown
## セキュリティチェック結果

### 危険度: [高/中/低/なし]

### 発見された脆弱性

#### 危険度: 高
1. **[脆弱性名]**
   - ファイル: `path/to/file.js:行番号`
   - 説明: ...
   - 影響: ...
   - 修正案:
   ```javascript
   // 修正後のコード
   ```

#### 危険度: 中
...

#### 危険度: 低
...

### 推奨事項
1. ...
2. ...

### 確認済み項目（問題なし）
- [x] ...
- [x] ...
```

## OWASP Top 10 参照

1. インジェクション
2. 認証の不備
3. 機密データの露出
4. XML外部実体参照（XXE）
5. アクセス制御の不備
6. セキュリティ設定のミス
7. クロスサイトスクリプティング（XSS）
8. 安全でないデシリアライゼーション
9. 既知の脆弱性を持つコンポーネントの使用
10. 不十分なロギングとモニタリング

## 使用方法

このスキルを呼び出す際は、以下の情報を提供してください：
- チェック対象のコード
- 使用している言語・フレームワーク
- アプリケーションの種類（Web、API、etc）
