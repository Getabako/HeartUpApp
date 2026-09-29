// HeartUpApp 音声入力モジュール
// - OPENAI_API_KEY が Vercel に設定されていれば /api/transcribe（サーバー側の音声認識）を使う
// - 未設定ならブラウザ内蔵の音声認識（Web Speech API）にフォールバック（Chrome / Edge / Safari）
// - どちらも使えない環境ではボタンを無効化してメッセージを出す
//
// 使い方: VoiceInput.attach(textareaElement, buttonElement)
//         VoiceInput.button(textareaId) → ボタンHTML文字列（onclickで自動的にattachされる）

const VoiceInput = {
    _status: null,          // { transcription: bool } サーバー側の状態
    _statusPromise: null,
    _active: null,          // 録音中の { stop } オブジェクト

    async serverStatus() {
        if (this._status) return this._status;
        if (!this._statusPromise) {
            this._statusPromise = fetch('/api/ai-status', { cache: 'no-store' })
                .then(r => r.ok ? r.json() : { transcription: false, imageGeneration: false })
                .catch(() => ({ transcription: false, imageGeneration: false }))
                .then(s => { this._status = s; return s; });
        }
        return this._statusPromise;
    },

    hasBrowserRecognition() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    },

    /** ボタンHTML（textareaのidを渡す） */
    button(textareaId, label) {
        return `<button type="button" class="btn-voice" data-target="${textareaId}" onclick="VoiceInput.toggle(this)" title="音声で入力">` +
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>` +
            `<span>${label || '音声入力'}</span></button>`;
    },

    /** ボタンのクリックで録音開始／停止を切り替える */
    async toggle(btn) {
        const target = document.getElementById(btn.dataset.target);
        if (!target) return;

        if (this._active) {
            const wasThis = this._active.btn === btn;
            this._active.stop();
            if (wasThis) return;
        }

        const status = await this.serverStatus();
        if (status.transcription) {
            await this._recordForServer(target, btn);
        } else if (this.hasBrowserRecognition()) {
            this._browserRecognize(target, btn);
        } else {
            if (typeof showToast === 'function') {
                showToast('この端末では音声入力が使えません。Chrome/Edge/Safariでお試しください。');
            }
        }
    },

    _setRecording(btn, on) {
        if (!btn) return;
        btn.classList.toggle('recording', on);
        const span = btn.querySelector('span');
        if (span) span.textContent = on ? '停止' : '音声入力';
    },

    _appendText(target, text) {
        if (!text) return;
        const cur = target.value || '';
        const sep = cur && !/[\n。]$/.test(cur) ? '。' : '';
        target.value = cur + sep + text;
        target.dispatchEvent(new Event('input', { bubbles: true }));
    },

    // ---- ブラウザ内蔵の音声認識 ----
    _browserRecognize(target, btn) {
        const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new Rec();
        rec.lang = 'ja-JP';
        rec.continuous = true;
        rec.interimResults = true;

        const base = target.value || '';
        let finalText = '';
        let interim = '';
        const render = () => {
            const sep = base && !/[\n。]$/.test(base) ? '。' : '';
            target.value = base + sep + finalText + interim;
        };

        rec.onresult = (e) => {
            interim = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const t = e.results[i][0].transcript;
                if (e.results[i].isFinal) finalText += t; else interim += t;
            }
            render();
        };
        rec.onerror = (e) => {
            console.warn('SpeechRecognition error:', e.error);
            if (e.error === 'not-allowed' && typeof showToast === 'function') {
                showToast('マイクの使用が許可されていません。ブラウザの設定を確認してください。');
            }
        };
        rec.onend = () => {
            interim = '';
            render();
            target.dispatchEvent(new Event('input', { bubbles: true }));
            this._setRecording(btn, false);
            if (this._active && this._active.btn === btn) this._active = null;
        };

        this._active = { btn, stop: () => { try { rec.stop(); } catch (e) { /* ignore */ } } };
        this._setRecording(btn, true);
        try {
            rec.start();
            if (typeof showToast === 'function') showToast('録音中です。話し終わったら「停止」を押してください。');
        } catch (e) {
            this._active = null;
            this._setRecording(btn, false);
        }
    },

    // ---- サーバー側（OpenAI）で文字起こし ----
    async _recordForServer(target, btn) {
        if (!navigator.mediaDevices || !window.MediaRecorder) {
            if (this.hasBrowserRecognition()) return this._browserRecognize(target, btn);
            if (typeof showToast === 'function') showToast('この端末では録音ができません。');
            return;
        }
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
            if (typeof showToast === 'function') showToast('マイクの使用が許可されていません。');
            return;
        }
        const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
            .find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || '';
        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        const chunks = [];
        recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = async () => {
            stream.getTracks().forEach(t => t.stop());
            this._setRecording(btn, false);
            if (this._active && this._active.btn === btn) this._active = null;
            if (chunks.length === 0) return;
            const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/webm' });
            btn.disabled = true;
            const span = btn.querySelector('span');
            if (span) span.textContent = '変換中';
            try {
                const dataUrl = await new Promise((resolve, reject) => {
                    const fr = new FileReader();
                    fr.onload = () => resolve(fr.result);
                    fr.onerror = reject;
                    fr.readAsDataURL(blob);
                });
                const r = await fetch('/api/transcribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ audio: dataUrl, mimeType: blob.type, language: 'ja', prompt: '放課後等デイサービスの活動記録メモ。児童の様子。' })
                });
                const data = await r.json().catch(() => ({}));
                if (!r.ok) throw new Error(data.error || '音声認識に失敗しました');
                this._appendText(target, (data.text || '').trim());
            } catch (e) {
                console.error(e);
                if (typeof showToast === 'function') showToast(e.message || '音声認識に失敗しました');
            } finally {
                btn.disabled = false;
                if (span) span.textContent = '音声入力';
            }
        };
        this._active = { btn, stop: () => { try { recorder.stop(); } catch (e) { /* ignore */ } } };
        this._setRecording(btn, true);
        recorder.start();
        if (typeof showToast === 'function') showToast('録音中です。話し終わったら「停止」を押してください。');
    }
};

window.VoiceInput = VoiceInput;
