/**
 * 画面内トースト通知
 * ブラウザ標準の alert() の置き換え。メッセージ内容から種別を自動判定する。
 * 使い方: showToast('保存しました') / showToast('エラーが発生しました', 'error')
 */
(function () {
    const STYLE_ID = 'toast-style';
    const CONTAINER_ID = 'toastContainer';

    const CSS = `
#${CONTAINER_ID} {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    pointer-events: none;
    width: min(560px, calc(100vw - 32px));
}
.toast-item {
    pointer-events: auto;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    box-sizing: border-box;
    padding: 14px 18px;
    border-radius: 10px;
    background: #323232;
    color: #fff;
    font-size: 15px;
    line-height: 1.7;
    letter-spacing: 0.03em;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
    white-space: pre-wrap;
    word-break: break-word;
    border-left: 6px solid #9e9e9e;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.25s ease, transform 0.25s ease;
}
.toast-item.toast-visible { opacity: 1; transform: translateY(0); }
.toast-item.toast-success { background: #1b5e20; border-left-color: #66bb6a; }
.toast-item.toast-warning { background: #5d4300; border-left-color: #ffb300; }
.toast-item.toast-error   { background: #7f1d1d; border-left-color: #ef5350; }
.toast-item .toast-close {
    margin-left: auto;
    flex-shrink: 0;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    padding: 2px 4px;
}
.toast-item .toast-close:hover { color: #fff; }
@media (max-width: 480px) {
    #${CONTAINER_ID} { bottom: 16px; }
    .toast-item { font-size: 14px; padding: 12px 14px; }
}
`;

    function ensureSetup() {
        if (!document.getElementById(STYLE_ID)) {
            const style = document.createElement('style');
            style.id = STYLE_ID;
            style.textContent = CSS;
            document.head.appendChild(style);
        }
        let container = document.getElementById(CONTAINER_ID);
        if (!container) {
            container = document.createElement('div');
            container.id = CONTAINER_ID;
            container.setAttribute('role', 'status');
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }
        return container;
    }

    function detectType(message) {
        const text = String(message);
        if (/エラー|失敗|できませんでした|見つかりません|無効/.test(text)) return 'error';
        if (/してください|されていません|ありません|正しくありません|選択|未入力/.test(text)) return 'warning';
        return 'success';
    }

    window.showToast = function (message, type) {
        // DOM構築前に呼ばれた場合は構築後に再実行
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => window.showToast(message, type));
            return;
        }
        const container = ensureSetup();
        const resolvedType = type || detectType(message);

        const item = document.createElement('div');
        item.className = `toast-item toast-${resolvedType}`;

        const text = document.createElement('span');
        text.textContent = String(message);
        item.appendChild(text);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.setAttribute('aria-label', '閉じる');
        closeBtn.textContent = '×';
        item.appendChild(closeBtn);

        container.appendChild(item);
        requestAnimationFrame(() => item.classList.add('toast-visible'));

        const duration = resolvedType === 'success' ? 3500 : 6000;
        let timer = setTimeout(dismiss, duration);

        function dismiss() {
            clearTimeout(timer);
            item.classList.remove('toast-visible');
            setTimeout(() => item.remove(), 300);
        }
        closeBtn.addEventListener('click', dismiss);

        // 同時表示は最大3件（古いものから消す）
        const items = container.querySelectorAll('.toast-item');
        if (items.length > 3) items[0].remove();
    };
})();
