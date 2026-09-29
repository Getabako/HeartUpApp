// HeartUpApp AI練習メニュー生成
// - テーマ・条件を入力 → Gemini が事業所の型（W-up / Tr.1 / Tr.2 / 試合）で練習メニューを構造化生成
// - ホワイトボード写真をアップロード → Gemini（画像読み取り）で内容を構造化
// - 生成結果から「イラスト生成用プロンプト」を作成（ChatGPT等に貼り付けて画像化できる）
// - Vercel に OPENAI_API_KEY が設定されていれば、アプリ内で直接イラストを生成（/api/generate-image）
// - 生成したメニューは拠点ごとに保存（Firestore、未接続時は localStorage）し、練習メニュー一覧にカード表示

const PracticeMenuGen = {
    cache: [],              // 生成済みメニュー（一覧表示用キャッシュ）
    current: null,          // 生成直後（未保存または保存済み）のメニュー
    aiStatus: null,         // /api/ai-status の結果
    mode: 'theme',          // 'theme' | 'photo'
    photo: null,            // { base64, mimeType, dataUrl }

    LEVELS: ['下級', '中級', '上級', '中・上級', '小集団', '全体'],
    SECTION_COLORS: { warmup: '#ff9800', training1: '#1e88e5', training2: '#43a047', game: '#8e24aa', other: '#607d8b' },

    async init() {
        await this.reload();
        this.aiStatus = await this.fetchAiStatus();
    },

    async reload() {
        try {
            this.cache = await dataAdapter.getGeneratedMenus();
        } catch (e) {
            console.error('生成メニューの読み込みエラー:', e);
            this.cache = [];
        }
        if (typeof displayPracticeMenus === 'function') displayPracticeMenus();
    },

    async fetchAiStatus() {
        try {
            const r = await fetch('/api/ai-status', { cache: 'no-store' });
            if (!r.ok) return { imageGeneration: false, transcription: false };
            return await r.json();
        } catch (e) {
            return { imageGeneration: false, transcription: false };
        }
    },

    esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    todayLabel() {
        const d = new Date();
        const w = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
        return `${d.getMonth() + 1}/${d.getDate()}（${w}）`;
    },

    // ============================================================
    // 入力フォーム
    // ============================================================
    open(mode) {
        this.mode = mode || 'theme';
        this.photo = null;
        this.current = null;
        const modal = document.getElementById('modal');
        const body = document.getElementById('modalBody');
        body.innerHTML = this.formHtml();
        modal.classList.remove('hidden');
        this.bindPhotoInput();
    },

    formHtml() {
        const isPhoto = this.mode === 'photo';
        const levelOpts = this.LEVELS.map(l => `<option value="${l}" ${l === '中級' ? 'selected' : ''}>${l}</option>`).join('');
        return `
            <h2 style="color:#2e7d32; margin-bottom:0.5rem;">AIで練習メニューを作成</h2>
            <p class="pm-lead">ホワイトボードに書いていた練習を、テーマから自動で組み立てたり、写真から読み取って整えたりできます。生成後にイラスト用のプロンプトを出力します。</p>
            <div class="pm-mode-tabs">
                <button type="button" class="pm-mode-tab ${!isPhoto ? 'active' : ''}" onclick="PracticeMenuGen.switchMode('theme')">テーマから作成</button>
                <button type="button" class="pm-mode-tab ${isPhoto ? 'active' : ''}" onclick="PracticeMenuGen.switchMode('photo')">ホワイトボード写真から</button>
            </div>
            <form id="pmForm" onsubmit="PracticeMenuGen.submit(event)">
                ${isPhoto ? `
                <div class="form-group">
                    <label>ホワイトボードの写真 <span style="color:#e74c3c;">*</span></label>
                    <div class="pm-photo-drop" id="pmPhotoDrop" onclick="document.getElementById('pmPhotoInput').click()">
                        <span id="pmPhotoDropText">写真をドラッグ＆ドロップ、またはクリックして選択（スマホはカメラ撮影も可）</span>
                        <img id="pmPhotoPreview" alt="" style="display:none;">
                    </div>
                    <input type="file" id="pmPhotoInput" accept="image/*" capture="environment" style="display:none;">
                </div>
                <div class="form-group">
                    <label>補足（任意）</label>
                    <textarea id="pmHints" rows="2" placeholder="例: 下級グループ向け。Tr.2は時間の都合で短め。読みにくい字の補足など"></textarea>
                </div>` : `
                <div class="form-group">
                    <label>テーマ <span style="color:#e74c3c;">*</span></label>
                    <input type="text" id="pmTheme" required placeholder="例: 見る・判断、切り替え、足裏トラップ、コミュニケーション">
                </div>
                <div class="form-group">
                    <label>目的・ねらい</label>
                    <textarea id="pmPurpose" rows="2" placeholder="例: まわりを見てパスかドリブルかを自分で選べるようになる"></textarea>
                </div>`}
                <div class="pm-grid">
                    <div class="form-group">
                        <label>日付</label>
                        <input type="text" id="pmDate" value="${this.todayLabel()}">
                    </div>
                    <div class="form-group">
                        <label>対象レベル</label>
                        <select id="pmLevel">${levelOpts}</select>
                    </div>
                    <div class="form-group">
                        <label>参加人数</label>
                        <input type="text" id="pmParticipants" placeholder="例: 8名" value="6〜10名">
                    </div>
                    <div class="form-group">
                        <label>時間</label>
                        <input type="text" id="pmDuration" placeholder="例: 60分" value="60分">
                    </div>
                </div>
                <div class="form-group">
                    <label>使える用具</label>
                    <input type="text" id="pmEquipment" value="コーン（橙・赤・青・黄・緑）、マーカー、ボール、ミニゴール、ビブス、ラダー">
                </div>
                <div class="form-group">
                    <label>配慮事項（児童の特性・注意点）</label>
                    <textarea id="pmConsiderations" rows="2" placeholder="例: 待ち時間が長いと離席しやすい子がいる。負けると崩れやすい子には得点ハンデ"></textarea>
                </div>
                <div class="pm-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal()">キャンセル</button>
                    <button type="submit" class="btn-primary" id="pmSubmitBtn">${isPhoto ? '写真を読み取って作成' : 'メニューを生成'}</button>
                </div>
            </form>`;
    },

    switchMode(mode) {
        this.mode = mode;
        const body = document.getElementById('modalBody');
        body.innerHTML = this.formHtml();
        this.bindPhotoInput();
    },

    bindPhotoInput() {
        const input = document.getElementById('pmPhotoInput');
        const drop = document.getElementById('pmPhotoDrop');
        if (!input || !drop) return;
        input.addEventListener('change', () => { if (input.files[0]) this.loadPhoto(input.files[0]); });
        ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('dragover'); }));
        ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('dragover'); }));
        drop.addEventListener('drop', e => {
            const f = e.dataTransfer?.files?.[0];
            if (f && f.type.startsWith('image/')) this.loadPhoto(f);
        });
    },

    // 写真を読み込み、Gemini に送れるサイズ（長辺1600px・JPEG）に縮小
    async loadPhoto(file) {
        try {
            const dataUrl = await this.resizeImage(file, 1600, 0.85);
            const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            this.photo = { base64: m[2], mimeType: m[1], dataUrl };
            const img = document.getElementById('pmPhotoPreview');
            const txt = document.getElementById('pmPhotoDropText');
            if (img) { img.src = dataUrl; img.style.display = 'block'; }
            if (txt) txt.textContent = '別の写真に変える場合はクリック';
        } catch (e) {
            console.error(e);
            showToast('写真の読み込みに失敗しました');
        }
    },

    resizeImage(fileOrDataUrl, maxSide, quality) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            if (typeof fileOrDataUrl === 'string') {
                img.src = fileOrDataUrl;
            } else {
                const fr = new FileReader();
                fr.onload = () => { img.src = fr.result; };
                fr.onerror = reject;
                fr.readAsDataURL(fileOrDataUrl);
            }
        });
    },

    // ============================================================
    // 生成
    // ============================================================
    async submit(event) {
        event.preventDefault();
        if (!geminiAPI.isInitialized()) {
            showToast('Gemini APIが設定されていません');
            return;
        }
        const params = {
            date: document.getElementById('pmDate')?.value.trim() || this.todayLabel(),
            level: document.getElementById('pmLevel')?.value || '中級',
            participants: document.getElementById('pmParticipants')?.value.trim() || '',
            duration: document.getElementById('pmDuration')?.value.trim() || '',
            equipment: document.getElementById('pmEquipment')?.value.trim() || '',
            considerations: document.getElementById('pmConsiderations')?.value.trim() || ''
        };
        let menu;
        const body = document.getElementById('modalBody');
        const loading = (text) => {
            body.innerHTML = `<div class="ai-loading"><img src="soccerball.png" alt="読み込み中" class="ai-loading-ball"><span class="ai-loading-text">${text}</span></div>`;
        };
        try {
            if (this.mode === 'photo') {
                if (!this.photo) { showToast('ホワイトボードの写真を選択してください'); return; }
                const hints = document.getElementById('pmHints')?.value.trim() || '';
                const hintText = [hints, `日付: ${params.date}`, `対象レベル: ${params.level}`, params.participants ? `参加人数: ${params.participants}` : '', params.duration ? `時間: ${params.duration}` : '', params.considerations ? `配慮事項: ${params.considerations}` : ''].filter(Boolean).join('\n');
                loading('AIがホワイトボードを読み取り中...');
                menu = await geminiAPI.analyzeWhiteboardMenu(this.photo.base64, this.photo.mimeType, hintText);
                menu.sourceType = 'photo';
                menu.sourcePhoto = await this.resizeImage(this.photo.dataUrl, 900, 0.7);
            } else {
                params.theme = document.getElementById('pmTheme')?.value.trim() || '';
                params.purpose = document.getElementById('pmPurpose')?.value.trim() || '';
                if (!params.theme) { showToast('テーマを入力してください'); return; }
                loading('AIが練習メニューを作成中...');
                menu = await geminiAPI.generatePracticeMenu(params);
                menu.sourceType = 'theme';
            }
            menu = this.normalize(menu, params);
            menu.illustrationPrompt = geminiAPI.buildIllustrationPrompt(menu);
            this.current = menu;
            this.renderResult();
        } catch (e) {
            console.error('練習メニュー生成エラー:', e);
            body.innerHTML = `
                <div style="color:#d32f2f; padding:1rem;">生成に失敗しました: ${this.esc(e.message || '')}</div>
                <div class="pm-actions"><button class="btn-secondary" onclick="PracticeMenuGen.open('${this.mode}')">入力に戻る</button></div>`;
        }
    },

    normalize(menu, params) {
        const m = Object.assign({}, menu);
        m.title = m.title || params.theme || '練習メニュー';
        m.date = m.date || params.date || '';
        m.level = m.level || params.level || '';
        m.purpose = m.purpose || params.purpose || '';
        m.duration = m.duration || params.duration || '';
        m.participants = m.participants || params.participants || '';
        m.equipment = Array.isArray(m.equipment) ? m.equipment : (m.equipment ? String(m.equipment).split(/[、,]/) : []);
        m.sections = Array.isArray(m.sections) ? m.sections : [];
        m.sections = m.sections.map((s, i) => {
            const type = s.type || ['warmup', 'training1', 'training2', 'game'][i] || 'other';
            const label = s.label || ({ warmup: 'W-up', training1: 'Tr.1', training2: 'Tr.2', game: '試合' }[type] || '');
            const arr = v => Array.isArray(v) ? v.filter(Boolean) : (v ? [String(v)] : []);
            const diff = (s.difficulty && typeof s.difficulty === 'object') ? s.difficulty : {};
            return {
                type, label,
                name: s.name || '',
                minutes: s.minutes || '',
                setup: s.setup || '',
                steps: arr(s.steps), rules: arr(s.rules), points: arr(s.points), coaching: arr(s.coaching),
                difficulty: { easy: diff.easy || '', normal: diff.normal || '', hard: diff.hard || '' },
                domains: arr(s.domains),
                notes: s.notes || ''
            };
        });
        m.category = this.guessCategory(m);
        return m;
    },

    guessCategory(menu) {
        const text = [menu.title, menu.purpose, ...(menu.sections || []).map(s => s.name)].join(' ');
        if (/シュート/.test(text)) return 'shoot';
        if (/ドリブル|ターン|足裏|足の裏/.test(text)) return 'dribble';
        if (/パス|1対1|試合|対人|2対1|3対3/.test(text)) return 'match';
        if (/鬼|ゲーム|リレー/.test(text)) return 'game';
        return 'warmup';
    },

    // ============================================================
    // 結果表示（モーダル内）
    // ============================================================
    renderResult() {
        const menu = this.current;
        const body = document.getElementById('modalBody');
        const saved = !!menu.id;
        const canImage = !!(this.aiStatus && this.aiStatus.imageGeneration);
        body.innerHTML = `
            <div class="pm-result-toolbar">
                <h2 style="color:#2e7d32; margin:0;">${saved ? '練習メニュー' : '生成結果（未保存）'}</h2>
                <span class="pm-source-badge">${menu.sourceType === 'photo' ? '写真から作成' : 'テーマから作成'}</span>
            </div>
            <div class="pm-poster" id="pmPoster">${this.posterHtml(menu)}</div>
            ${menu.imageData ? `<div class="pm-image-wrap"><h4>生成したイラスト</h4><img src="${menu.imageData}" alt="練習メニューのイラスト"><div class="pm-inline-actions"><a class="btn-small" href="${menu.imageData}" download="${this.esc(menu.title)}.jpg">画像を保存</a></div></div>` : ''}
            ${menu.sourcePhoto ? `<details class="pm-details"><summary>元のホワイトボード写真</summary><img src="${menu.sourcePhoto}" alt="ホワイトボード写真" style="max-width:100%; border-radius:8px; margin-top:8px;"></details>` : ''}
            <details class="pm-details" id="pmPromptDetails">
                <summary>イラスト生成用プロンプト（ChatGPTなどに貼り付けて画像化）</summary>
                <textarea id="pmPromptText" rows="8" readonly>${this.esc(menu.illustrationPrompt || '')}</textarea>
                <div class="pm-inline-actions">
                    <button type="button" class="btn-small" onclick="PracticeMenuGen.copyPrompt()">プロンプトをコピー</button>
                </div>
            </details>
            <div class="pm-image-status ${canImage ? 'ok' : 'off'}">
                ${canImage
                    ? 'アプリ内でのイラスト生成が使えます（1枚あたり料金が発生します。1日の目安: ' + (this.aiStatus.dailyImageLimit || 20) + '枚）'
                    : 'アプリ内イラスト生成は、事業所のOpenAI APIキーをVercelに設定すると使えるようになります。それまでは上のプロンプトをコピーしてChatGPTに貼り付けてください。'}
            </div>
            <div class="pm-refine">
                <label>修正依頼（任意）</label>
                <div class="pm-refine-row">
                    <input type="text" id="pmRefineText" placeholder="例: Tr.2をシュート練習に変えて。全体を10分短く。">
                    <button type="button" class="btn-small" onclick="PracticeMenuGen.refine()">修正して再生成</button>
                </div>
            </div>
            <div class="pm-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">閉じる</button>
                ${canImage ? `<button type="button" class="btn-secondary" id="pmImageBtn" onclick="PracticeMenuGen.generateImage()">イラストを生成${menu.imageData ? '（作り直す）' : ''}</button>` : ''}
                <button type="button" class="btn-secondary" onclick="PracticeMenuGen.print()">印刷 / PDF</button>
                <button type="button" class="btn-primary" onclick="PracticeMenuGen.save()">${saved ? '上書き保存' : '保存する'}</button>
            </div>`;
        body.scrollTop = 0;
    },

    posterHtml(menu) {
        const secHtml = (menu.sections || []).map(s => {
            const color = this.SECTION_COLORS[s.type] || this.SECTION_COLORS.other;
            const list = (title, items) => items && items.length ? `<div class="pm-sec-block"><span class="pm-sec-block-title">${title}</span><ul>${items.map(i => `<li>${this.esc(i)}</li>`).join('')}</ul></div>` : '';
            const diff = s.difficulty || {};
            const diffHtml = (diff.easy || diff.hard) ? `<div class="pm-sec-block"><span class="pm-sec-block-title">難易度調整</span><ul>${diff.easy ? `<li><strong>かんたん:</strong> ${this.esc(diff.easy)}</li>` : ''}${diff.normal ? `<li><strong>ふつう:</strong> ${this.esc(diff.normal)}</li>` : ''}${diff.hard ? `<li><strong>むずかしい:</strong> ${this.esc(diff.hard)}</li>` : ''}</ul></div>` : '';
            return `
                <div class="pm-sec" style="border-color:${color};">
                    <div class="pm-sec-head" style="background:${color};">
                        <span class="pm-sec-label">${this.esc(s.label)}</span>
                        <span class="pm-sec-name">${this.esc(s.name)}</span>
                        ${s.minutes ? `<span class="pm-sec-min">${this.esc(s.minutes)}分</span>` : ''}
                    </div>
                    <div class="pm-sec-body">
                        ${s.setup ? `<div class="pm-sec-block"><span class="pm-sec-block-title">配置・準備</span><p>${this.esc(s.setup)}</p></div>` : ''}
                        ${list('やり方', s.steps)}
                        ${list('ルール', s.rules)}
                        ${list('ポイント', s.points)}
                        ${list('声かけ例', s.coaching)}
                        ${diffHtml}
                        ${s.domains && s.domains.length ? `<div class="pm-domains">${s.domains.map(d => `<span>${this.esc(d)}</span>`).join('')}</div>` : ''}
                        ${s.notes ? `<p class="pm-sec-notes">${this.esc(s.notes)}</p>` : ''}
                    </div>
                </div>`;
        }).join('');
        return `
            <div class="pm-head">
                <div class="pm-date">${this.esc(menu.date)}</div>
                <h3 class="pm-title">「${this.esc(menu.title)}」${menu.level ? `<span class="pm-level">〈${this.esc(menu.level)}〉</span>` : ''}</h3>
                ${menu.purpose ? `<p class="pm-purpose"><strong>ねらい:</strong> ${this.esc(menu.purpose)}</p>` : ''}
                ${menu.keyword ? `<p class="pm-keyword">合言葉「${this.esc(menu.keyword)}」</p>` : ''}
                <div class="pm-meta">
                    ${menu.duration ? `<span>時間: ${this.esc(menu.duration)}</span>` : ''}
                    ${menu.participants ? `<span>人数: ${this.esc(menu.participants)}</span>` : ''}
                    ${menu.equipment && menu.equipment.length ? `<span>用具: ${this.esc(menu.equipment.join('、'))}</span>` : ''}
                </div>
            </div>
            ${secHtml}
            ${menu.summary ? `<div class="pm-summary"><strong>まとめ・大切なこと</strong><p>${this.esc(menu.summary)}</p></div>` : ''}
            ${menu.therapeuticNotes ? `<div class="pm-therapy"><strong>療育的配慮</strong><p>${this.esc(menu.therapeuticNotes)}</p></div>` : ''}`;
    },

    copyPrompt() {
        const ta = document.getElementById('pmPromptText');
        if (!ta) return;
        const text = ta.value;
        const done = () => showToast('プロンプトをコピーしました。ChatGPTに貼り付けて画像化してください。');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(() => { ta.select(); document.execCommand('copy'); done(); });
        } else {
            ta.select(); document.execCommand('copy'); done();
        }
    },

    async refine() {
        const req = document.getElementById('pmRefineText')?.value.trim();
        if (!req) { showToast('修正内容を入力してください'); return; }
        const menu = this.current;
        const body = document.getElementById('modalBody');
        body.innerHTML = `<div class="ai-loading"><img src="soccerball.png" alt="読み込み中" class="ai-loading-ball"><span class="ai-loading-text">AIがメニューを修正中...</span></div>`;
        try {
            const editable = Object.assign({}, menu);
            ['id', 'imageData', 'sourcePhoto', 'illustrationPrompt', 'createdAt', 'created_at', 'locationId', 'createdBy', 'category', 'sourceType'].forEach(k => delete editable[k]);
            const prompt = `
以下はサッカー療育の練習メニュー（JSON）です。スタッフからの修正依頼に基づいて内容を修正し、同じキー構成のJSONのみを出力してください。

【現在のメニュー】
${JSON.stringify(editable, null, 2)}

【修正依頼】
${req}

【指示】
- 修正依頼に関係する箇所だけを変更し、それ以外は維持する
- 各セクションの steps / points / coaching / difficulty は空にしない
- 絵文字・個人名は使わない
${GeminiAPI.PRACTICE_MENU_STYLE}`;
            const result = await geminiAPI.generateContent(prompt, { temperature: 0.5 });
            let refined = geminiAPI._extractJson(result);
            refined = this.normalize(refined, {});
            const keep = { id: menu.id, imageData: null, sourcePhoto: menu.sourcePhoto, sourceType: menu.sourceType, createdAt: menu.createdAt };
            this.current = Object.assign({}, refined, keep);
            this.current.illustrationPrompt = geminiAPI.buildIllustrationPrompt(this.current);
            this.renderResult();
            showToast('メニューを修正しました。内容を確認して保存してください。');
        } catch (e) {
            console.error(e);
            showToast('修正に失敗しました: ' + (e.message || ''));
            this.renderResult();
        }
    },

    // ============================================================
    // イラスト生成（OpenAI 画像生成。サーバー側で API キーが設定されている場合のみ）
    // ============================================================
    dailyCountKey() {
        return 'heartup_imageGenCount_' + new Date().toISOString().split('T')[0];
    },

    async generateImage() {
        const menu = this.current;
        if (!menu) return;
        const limit = (this.aiStatus && this.aiStatus.dailyImageLimit) || 20;
        const used = parseInt(localStorage.getItem(this.dailyCountKey()) || '0', 10);
        if (used >= limit) {
            if (!confirm(`本日この端末で ${used} 枚生成しています（目安 ${limit} 枚）。続けますか？`)) return;
        }
        const btn = document.getElementById('pmImageBtn');
        if (btn) { btn.disabled = true; btn.textContent = 'イラスト生成中（1分ほどかかります）...'; }
        try {
            const r = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: menu.illustrationPrompt, size: '1024x1536', quality: 'medium' })
            });
            const data = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(data.error || '画像生成に失敗しました');
            // 保存用に縮小（Firestore 1ドキュメント1MB制限のため）。元画像は即ダウンロードできるようにする
            menu.imageDataFull = data.image;
            menu.imageData = await this.resizeImage(data.image, 1200, 0.82);
            if (menu.imageData.length > 900 * 1024) menu.imageData = await this.resizeImage(data.image, 900, 0.75);
            localStorage.setItem(this.dailyCountKey(), String(used + 1));
            showToast('イラストを生成しました。「保存する」でメニューと一緒に保存できます。');
            this.renderResult();
            // フル解像度のダウンロードリンクを追加
            const wrap = document.querySelector('.pm-image-wrap .pm-inline-actions');
            if (wrap && menu.imageDataFull) {
                wrap.insertAdjacentHTML('beforeend', `<a class="btn-small" href="${menu.imageDataFull}" download="${this.esc(menu.title)}_full.png">高解像度で保存</a>`);
            }
        } catch (e) {
            console.error(e);
            showToast(e.message || '画像生成に失敗しました');
            if (btn) { btn.disabled = false; btn.textContent = 'イラストを生成'; }
        }
    },

    // ============================================================
    // 保存・一覧・削除・印刷
    // ============================================================
    async save() {
        const menu = this.current;
        if (!menu) return;
        const payload = Object.assign({}, menu);
        delete payload.imageDataFull;
        delete payload.created_at;
        try {
            if (menu.id) {
                await dataAdapter.updateGeneratedMenu(menu.id, payload);
                showToast('練習メニューを上書き保存しました');
            } else {
                const saved = await dataAdapter.saveGeneratedMenu(payload);
                this.current.id = saved.id;
                this.current.createdAt = saved.createdAt;
                showToast('練習メニューを保存しました');
            }
            await this.reload();
            this.renderResult();
        } catch (e) {
            console.error(e);
            showToast('保存に失敗しました: ' + (e.message || ''));
        }
    },

    async openSaved(id) {
        const menu = this.cache.find(m => m.id === id);
        if (!menu) { showToast('メニューが見つかりません'); return; }
        this.current = Object.assign({}, menu);
        if (!this.current.illustrationPrompt) this.current.illustrationPrompt = geminiAPI.buildIllustrationPrompt(this.current);
        if (!this.aiStatus) this.aiStatus = await this.fetchAiStatus();
        const modal = document.getElementById('modal');
        modal.classList.remove('hidden');
        this.renderResult();
    },

    async remove(id) {
        if (!confirm('この練習メニューを削除しますか？')) return;
        try {
            await dataAdapter.deleteGeneratedMenu(id);
            showToast('削除しました');
            await this.reload();
        } catch (e) {
            showToast('削除に失敗しました');
        }
    },

    // 一覧カード（displayPracticeMenus から呼ばれる）
    cardHtml(menu) {
        const label = (typeof getPracticeCategoryLabel === 'function') ? getPracticeCategoryLabel(menu.category) : '';
        const secNames = (menu.sections || []).map(s => s.name).filter(Boolean).slice(0, 4).join(' → ');
        const created = menu.createdAt ? new Date(menu.createdAt).toLocaleDateString('ja-JP') : '';
        return `
            <div class="practice-header">
                <span class="practice-category-label">${this.esc(label)}</span>
                ${menu.level ? `<span class="practice-difficulty difficulty-medium">${this.esc(menu.level)}</span>` : ''}
                <span class="uploaded-badge pm-badge">AI作成</span>
            </div>
            ${menu.imageData ? `<img class="pm-card-thumb" src="${menu.imageData}" alt="">` : ''}
            <h3>${this.esc(menu.title)}</h3>
            <p>${this.esc(menu.purpose || secNames)}</p>
            <p class="pm-card-sub">${this.esc(menu.date || '')}${created ? `　作成: ${created}` : ''}</p>
            <div class="practice-footer" style="gap:0.5rem; flex-wrap:wrap;">
                <button class="btn-small" onclick="event.stopPropagation(); PracticeMenuGen.openSaved('${menu.id}')">開く</button>
                <button class="btn-delete-menu" onclick="event.stopPropagation(); PracticeMenuGen.remove('${menu.id}')">削除</button>
            </div>`;
    },

    // 検索・カテゴリフィルタに合う生成メニューを返す
    filtered(category, searchTerm) {
        return this.cache.filter(m => {
            if (category && category !== 'all' && m.category !== category) return false;
            if (searchTerm) {
                const hay = [m.title, m.purpose, ...(m.sections || []).map(s => s.name)].join(' ').toLowerCase();
                if (!hay.includes(searchTerm)) return false;
            }
            return true;
        });
    },

    print() {
        const menu = this.current;
        if (!menu) return;
        const w = window.open('', '_blank');
        if (!w) { showToast('ポップアップがブロックされました'); return; }
        const css = `
            body { font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif; color:#222; margin: 16px; font-size: 15px; line-height: 1.8; letter-spacing: 0.03em; }
            .pm-head { text-align:center; margin-bottom: 14px; }
            .pm-date { color:#555; }
            .pm-title { font-size: 24px; margin: 4px 0; }
            .pm-level { font-size: 16px; color:#555; margin-left: 6px; }
            .pm-purpose, .pm-keyword { margin: 4px 0; }
            .pm-meta span { display:inline-block; margin: 0 8px; color:#555; font-size: 13px; }
            .pm-sec { border: 3px solid #999; border-radius: 12px; margin: 10px 0; page-break-inside: avoid; overflow:hidden; }
            .pm-sec-head { color:#fff; padding: 6px 12px; display:flex; gap: 10px; align-items:center; }
            .pm-sec-label { font-weight: bold; background: rgba(255,255,255,0.25); padding: 2px 8px; border-radius: 8px; }
            .pm-sec-name { font-weight: bold; font-size: 17px; }
            .pm-sec-min { margin-left:auto; font-size: 13px; }
            .pm-sec-body { padding: 8px 14px; }
            .pm-sec-block { margin: 4px 0; }
            .pm-sec-block-title { font-weight: bold; color:#2e7d32; margin-right: 6px; }
            .pm-sec-block ul { margin: 2px 0 6px 18px; padding: 0; }
            .pm-domains span { display:inline-block; background:#e8f5e9; color:#2e7d32; border-radius: 10px; padding: 1px 8px; font-size: 12px; margin-right: 4px; }
            .pm-summary, .pm-therapy { border: 2px dashed #ff9800; border-radius: 10px; padding: 8px 12px; margin-top: 10px; }
            img.poster { max-width: 100%; page-break-before: always; }
            @media print { body { margin: 8mm; } }`;
        w.document.write(`<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>${this.esc(menu.title)}</title><style>${css}</style></head><body>${this.posterHtml(menu)}${menu.imageData ? `<img class="poster" src="${menu.imageData}" alt="">` : ''}</body></html>`);
        w.document.close();
        setTimeout(() => { w.focus(); w.print(); }, 400);
    }
};

window.PracticeMenuGen = PracticeMenuGen;

document.addEventListener('DOMContentLoaded', () => {
    // Firebase の認証完了を待ってから読み込む（認証前だと拠点フィルタが効かないため）
    const start = () => PracticeMenuGen.init();
    if (typeof heartUpDB !== 'undefined' && heartUpDB.isReady && heartUpDB.isReady()) {
        let done = false;
        const tryStart = () => { if (!done) { done = true; start(); } };
        if (typeof heartUpDB.onAuthStateChange === 'function') {
            heartUpDB.onAuthStateChange(user => { if (user) tryStart(); });
        }
        setTimeout(tryStart, 4000);
    } else {
        start();
    }
});
