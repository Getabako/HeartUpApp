// アイコン（SVG）。絵文字は使わない。
// hIcon('name') で SVG 文字列を返す。ボタンには文言からアイコンを自動で付ける。
(function () {
    const P = {
        book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/><path d="M9 7h6M9 11h6"/>',
        ball: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5l4 3-1.5 4.5h-5L8 10.5z"/><path d="M12 3v4.5M3.6 9.5L8 10.5M20.4 9.5L16 10.5M6.5 19l3-4M17.5 19l-3-4"/>',
        doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 12h7M9 16h7"/>',
        spark: '<path d="M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
        users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14c2.7.2 4.5 2 4.5 5"/>',
        userPlus: '<circle cx="10" cy="8" r="3.5"/><path d="M3 20c0-3.6 3-6 7-6 1.5 0 2.8.3 3.9.9"/><path d="M19 13v6M16 16h6"/>',
        clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M8.5 12l2 2 4-4M8.5 17h7"/>',
        target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
        chart: '<path d="M4 20V4M4 20h16"/><path d="M7 15l4-4 3 3 5-6"/>',
        layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
        upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>',
        download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 16v4h16v-4"/>',
        gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
        logout: '<path d="M10 4H5v16h5"/><path d="M14 8l4 4-4 4M18 12H9"/>',
        search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
        plus: '<path d="M12 5v14M5 12h14"/>',
        eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>',
        pen: '<path d="M4 20l1-4.5L16.5 4l3.5 3.5L8.5 19z"/><path d="M14 6.5l3.5 3.5"/>',
        trash: '<path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13"/><path d="M10 11v6M14 11v6"/>',
        save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
        print: '<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="8" rx="1.5"/><path d="M7 14h10v6H7z"/>',
        copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
        refresh: '<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.5 4.5L20 16"/><path d="M20 20v-4h-4"/>',
        back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
        next: '<path d="M5 12h14M13 6l6 6-6 6"/>',
        close: '<path d="M6 6l12 12M18 6L6 18"/>',
        mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
        camera: '<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
        mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
        check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
        calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>',
        home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
        info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.500"/>'
    };

    function hIcon(name, cls) {
        const d = P[name];
        if (!d) return '';
        return '<svg class="h-ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + d + '</svg>';
    }
    window.hIcon = hIcon;

    // 文言 → アイコン（上から順に当てる）
    const RULES = [
        [/削除|消す/, 'trash'],
        [/キャンセル|閉じる|やめる/, 'close'],
        [/戻る/, 'back'],
        [/次へ|進む/, 'next'],
        [/音声/, 'mic'],
        [/写真|ホワイトボード|撮影/, 'camera'],
        [/AI|生成|修正を依頼|作り直/, 'spark'],
        [/印刷|PDF/, 'print'],
        [/コピー/, 'copy'],
        [/ダウンロード|エクスポート|書き出/, 'download'],
        [/インポート|取り込|アップロード|ファイルを選/, 'upload'],
        [/保存|登録する|確定/, 'save'],
        [/編集|修正|書き直/, 'pen'],
        [/連絡帳/, 'mail'],
        [/計画書更新|更新/, 'refresh'],
        [/支援計画|計画/, 'target'],
        [/振り返り|モニタリング/, 'chart'],
        [/日々の記録|記録/, 'clipboard'],
        [/アセスメント/, 'doc'],
        [/検索|絞り込/, 'search'],
        [/追加|新規|作成|開く/, 'plus'],
        [/表示|見る|詳細|プレビュー/, 'eye'],
        [/完了|OK|はい|決定/, 'check']
    ];
    const SKIP = '.tab-button,.ai-tab-button,.category-btn,.practice-category-btn,.close-button,.am-close-modal,.logout-btn,.admin-link,.h-noic,.toast,[data-noic]';

    function decorate(root) {
        const list = (root.querySelectorAll ? root.querySelectorAll('button, a.am-btn, a.btn') : []);
        list.forEach(function (b) {
            if (b.dataset.ic || b.matches(SKIP) || b.querySelector('svg, img')) { b.dataset.ic = b.dataset.ic || '0'; return; }
            const t = (b.textContent || '').trim();
            if (!t || t.length > 24 || /^[×✕+＋\-\d\s.]+$/.test(t)) { b.dataset.ic = '0'; return; }
            for (let i = 0; i < RULES.length; i++) {
                if (RULES[i][0].test(t)) {
                    b.dataset.ic = RULES[i][1];
                    // 文言の頭の「+ 」はアイコンと重なるので外す
                    if (b.childNodes.length === 1 && b.firstChild.nodeType === 3) b.firstChild.nodeValue = t.replace(/^[+＋]\s*/, '');
                    b.insertAdjacentHTML('afterbegin', hIcon(RULES[i][1], 'h-ic-btn'));
                    return;
                }
            }
            b.dataset.ic = '0';
        });
        // 読み込み中の表示: 回るボールを、オオカミのリフティング・ドリブル・シュートに置きかえる（毎回どれかが出る）
        (root.querySelectorAll ? root.querySelectorAll('img.ai-loading-ball') : []).forEach(function (img) {
            const kinds = ['lift', 'dribble', 'shoot'];
            let k = kinds[Math.floor(Math.random() * kinds.length)];
            if (k === lastWolf) k = kinds[(kinds.indexOf(k) + 1) % kinds.length];
            lastWolf = k;
            const el = document.createElement('span');
            el.className = 'wolf-anim wa-' + k;
            el.setAttribute('role', 'img');
            el.setAttribute('aria-label', '読み込み中');
            el.innerHTML = '<img class="wa-f wa-f1" src="images/wolf/' + k + '_1.png" alt=""><img class="wa-f wa-f2" src="images/wolf/' + k + '_2.png" alt=""><img class="wa-ball" src="soccerball.png" alt=""><i class="wa-ground"></i>';
            img.replaceWith(el);
        });
        // data-icon="name" を持つ要素にアイコンを入れる
        (root.querySelectorAll ? root.querySelectorAll('[data-icon]:not([data-icon-done])') : []).forEach(function (el) {
            el.dataset.iconDone = '1';
            el.insertAdjacentHTML('afterbegin', hIcon(el.dataset.icon));
        });
    }

    let lastWolf = '';
    let queued = false;
    function schedule() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () { queued = false; decorate(document.body); });
    }
    function start() {
        decorate(document.body);
        new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();

// ============================================================
// 横スワイプで 資料 / 練習メニュー / AI書類作成 を切りかえる（2026-11-25）
// ウィンドウが開いている間、入力中、横に動かせる表の上では反応しない
// ============================================================
(function () {
    const OPEN = '#modal:not(.hidden), .am-modal.active, .am-busy-overlay, #locationChangeModal, #amEditChildModal, #amIntentModal';
    let sx = 0, sy = 0, st = 0, ok = false;
    function scrollsSideways(el) {
        for (; el && el !== document.body; el = el.parentElement) {
            if (el.scrollWidth > el.clientWidth + 8) {
                const o = getComputedStyle(el).overflowX;
                if (o === 'auto' || o === 'scroll') return true;
            }
        }
        return false;
    }
    document.addEventListener('touchstart', function (e) {
        ok = false;
        if (e.touches.length !== 1 || document.querySelector(OPEN)) return;
        const t = e.target;
        // 入力中の欄（カーソルを動かす操作と重なる）と、つまみを横に動かす部品の上では反応しない
        if (t.closest && t.closest('[contenteditable="true"], input[type="range"], canvas, .am-modal, .modal, #amEditChildModal, #amIntentModal')) return;
        if (t === document.activeElement && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
        if (scrollsSideways(t)) return;
        sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now(); ok = true;
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
        if (!ok) return;
        ok = false;
        const p = e.changedTouches[0];
        const dx = p.clientX - sx, dy = p.clientY - sy;
        if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 2 || Date.now() - st > 700) return;
        if (document.querySelector(OPEN) || (window.getSelection && String(window.getSelection()))) return;
        const tabs = Array.prototype.slice.call(document.querySelectorAll('.tab-button'));
        const cur = tabs.findIndex(function (b) { return b.classList.contains('active'); });
        const next = cur + (dx < 0 ? 1 : -1);   // 左へはらうと右のタブへ
        if (cur < 0 || next < 0 || next >= tabs.length) return;
        document.documentElement.dataset.swipe = dx < 0 ? 'left' : 'right';
        tabs[next].click();
        window.scrollTo(0, 0);
        setTimeout(function () { delete document.documentElement.dataset.swipe; }, 300);
    }, { passive: true });
})();
