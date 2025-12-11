# デザインシステム参照

プロジェクトのデザインルールを参照し、一貫性のあるデザイン・実装を行うためのガイドです。

## カラーパレット

### プライマリカラー
```css
--color-primary: #007bff;
--color-primary-dark: #0056b3;
--color-primary-light: #66b2ff;
```

### セカンダリカラー
```css
--color-secondary: #6c757d;
--color-secondary-dark: #545b62;
--color-secondary-light: #adb5bd;
```

### セマンティックカラー
```css
--color-success: #28a745;
--color-warning: #ffc107;
--color-error: #dc3545;
--color-info: #17a2b8;
```

### ニュートラルカラー
```css
--color-white: #ffffff;
--color-gray-100: #f8f9fa;
--color-gray-200: #e9ecef;
--color-gray-300: #dee2e6;
--color-gray-400: #ced4da;
--color-gray-500: #adb5bd;
--color-gray-600: #6c757d;
--color-gray-700: #495057;
--color-gray-800: #343a40;
--color-gray-900: #212529;
--color-black: #000000;
```

## タイポグラフィ

### フォントファミリー
```css
--font-primary: 'Noto Sans JP', 'Hiragino Sans', sans-serif;
--font-heading: 'Noto Sans JP', 'Hiragino Sans', sans-serif;
--font-mono: 'Source Code Pro', monospace;
```

### フォントサイズ
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### 見出しスタイル
```css
h1 { font-size: var(--text-4xl); font-weight: 700; line-height: 1.2; }
h2 { font-size: var(--text-3xl); font-weight: 700; line-height: 1.3; }
h3 { font-size: var(--text-2xl); font-weight: 600; line-height: 1.4; }
h4 { font-size: var(--text-xl); font-weight: 600; line-height: 1.4; }
```

## スペーシング

### 基本単位
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## ブレークポイント

```css
--breakpoint-sm: 576px;   /* スマートフォン（横） */
--breakpoint-md: 768px;   /* タブレット */
--breakpoint-lg: 992px;   /* デスクトップ（小） */
--breakpoint-xl: 1200px;  /* デスクトップ（大） */
--breakpoint-xxl: 1400px; /* ワイドスクリーン */
```

## コンポーネント

### ボタン
```css
/* プライマリボタン */
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
  padding: var(--space-3) var(--space-6);
  border-radius: 4px;
  font-weight: 600;
  transition: background-color 0.2s;
}
.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

/* セカンダリボタン */
.btn-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: 4px;
}
```

### カード
```css
.card {
  background: var(--color-white);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: var(--space-6);
}
```

### フォーム要素
```css
.input {
  border: 1px solid var(--color-gray-300);
  border-radius: 4px;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
}
.input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}
```

## アイコン

- スタイル: ラインアイコン（ストローク幅: 2px）
- サイズ: 16px, 20px, 24px, 32px
- カラー: currentColorを使用（親要素のcolorを継承）

## トーン＆マナー

### ブランドボイス
- **専門的**: 信頼性のある、知識に基づいた表現
- **親しみやすい**: 堅すぎず、カジュアルすぎない
- **明確**: 曖昧さを避け、具体的に伝える
- **前向き**: ポジティブな表現を心がける

### 避けるべき表現
- 過度に専門的な用語（説明なしでの使用）
- 曖昧な表現（「など」「いろいろ」の多用）
- ネガティブな表現
- 過度に砕けた表現

## 使用方法

このスキルは以下の場面で参照してください：
1. 新しいコンポーネントの作成時
2. スタイリングの実装時
3. コンテンツのトーン確認時
4. デザインの一貫性チェック時
