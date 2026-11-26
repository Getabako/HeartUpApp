// LINE などの「アプリの中の画面」では Google のログインができない（Google 側の決まり）。
// そこで開かれたら、いつものブラウザ（Chrome / Safari）で開き直す。開き直せないときは案内を出す。
// どのページでも <head> のいちばん上で読み込む。
(function () {
    var ua = navigator.userAgent || '';
    var isIOS = /iPhone|iPad|iPod/i.test(ua);
    var isAndroid = /Android/i.test(ua);
    var isLine = /\bLine\//i.test(ua);
    var isOtherApp = /FBAN|FBAV|FB_IAB|Instagram|MicroMessenger|KAKAOTALK|YJApp|Twitter/i.test(ua)
        || (isAndroid && /; wv\)/.test(ua))
        || (isIOS && !/Safari\//.test(ua));
    var KEY = 'openExternalBrowser';
    var params = new URLSearchParams(location.search);

    if (!isLine && !isOtherApp) {
        // ふつうのブラウザ。開き直し用の目印がアドレスに残っていたら消す
        if (params.has(KEY)) {
            params.delete(KEY);
            var q = params.toString();
            try { history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash); } catch (e) {}
        }
        return;
    }

    window.__inAppBrowser = true;
    var clean = new URL(location.href);
    clean.searchParams.delete(KEY);
    var plainUrl = clean.toString();
    var ext = new URL(plainUrl);
    ext.searchParams.set(KEY, '1');
    var lineUrl = ext.toString();

    // LINE は、この目印が付いたアドレスを外のブラウザで開く
    if (isLine && !params.has(KEY)) {
        location.replace(lineUrl);
    }

    function openHref() {
        if (isLine) return lineUrl;
        if (isAndroid) {
            return 'intent://' + plainUrl.replace(/^https?:\/\//, '') + '#Intent;scheme=https;action=android.intent.action.VIEW;S.browser_fallback_url=' + encodeURIComponent(plainUrl) + ';end';
        }
        if (isIOS) return 'x-safari-' + plainUrl;
        return plainUrl;
    }

    function show() {
        if (document.getElementById('inappGuide')) return;
        var appName = isLine ? 'LINE' : 'このアプリ';
        var wrap = document.createElement('div');
        wrap.id = 'inappGuide';
        wrap.setAttribute('style', 'position:fixed;inset:0;z-index:2147483647;overflow:auto;background:#eef6ee;display:flex;align-items:center;justify-content:center;padding:20px;font-family:"Hiragino Sans","Noto Sans JP","Meiryo",sans-serif;letter-spacing:0.04em;');
        wrap.innerHTML =
            '<div style="background:#fff;border:1px solid #cfe3cf;border-radius:16px;max-width:440px;width:100%;padding:28px 22px;text-align:center;box-sizing:border-box;">' +
                '<img src="/images/guide/guide_practice.png" alt="" style="width:120px;height:auto;margin-bottom:12px;" onerror="this.style.display=\'none\'">' +
                '<h1 style="font-size:22px;line-height:1.6;color:#1b5e20;margin:0 0 12px;">ブラウザで開いてください</h1>' +
                '<p style="font-size:17px;line-height:1.9;color:#333;margin:0 0 22px;text-align:left;">' + appName + ' の中の画面では、Google のログインができません。下のボタンを押して、いつものブラウザ（Chrome や Safari）で開いてください。</p>' +
                '<a id="inappOpen" href="' + openHref().replace(/"/g, '&quot;') + '" style="display:flex;align-items:center;justify-content:center;gap:10px;min-height:56px;padding:12px 16px;background:#2e7d32;color:#fff;font-size:18px;font-weight:bold;text-decoration:none;border-radius:12px;box-shadow:0 5px 0 #1b5e20;margin-bottom:22px;">' +
                    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>' +
                    '<span>ブラウザで開く</span></a>' +
                '<p style="font-size:16px;line-height:1.9;color:#555;margin:0 0 10px;text-align:left;">開かないときは、アドレスをコピーして、ブラウザのアドレス欄に貼り付けてください。</p>' +
                '<button id="inappCopy" type="button" style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:52px;padding:10px 16px;background:#f2a900;color:#3a2a00;font-size:17px;font-weight:bold;border:none;border-radius:12px;box-shadow:0 5px 0 #b97f00;font-family:inherit;letter-spacing:inherit;cursor:pointer;">' +
                    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/></svg>' +
                    '<span id="inappCopyText">アドレスをコピー</span></button>' +
                '<p style="font-size:15px;line-height:1.8;color:#555;margin:16px 0 0;word-break:break-all;">' + plainUrl.replace(/</g, '&lt;') + '</p>' +
            '</div>';
        (document.body || document.documentElement).appendChild(wrap);
        document.getElementById('inappCopy').addEventListener('click', function () {
            var done = function () { document.getElementById('inappCopyText').textContent = 'コピーしました'; };
            var fallback = function () {
                var t = document.createElement('textarea');
                t.value = plainUrl;
                t.setAttribute('style', 'position:fixed;top:0;left:0;opacity:0;');
                document.body.appendChild(t);
                t.select();
                try { document.execCommand('copy'); done(); } catch (e) {}
                document.body.removeChild(t);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(plainUrl).then(done, fallback);
            } else {
                fallback();
            }
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show);
    else show();
})();
