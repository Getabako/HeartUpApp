// HeartUpApp AI練習メニュー生成
// - テーマ・条件を入力 → Gemini が事業所の型（W-up / Tr.1 / Tr.2 / 試合）で練習メニューを構造化生成
// - ホワイトボード写真をアップロード → Gemini（画像読み取り）で内容を構造化
// - 生成結果から「イラスト生成用プロンプト」を作成（アプリ内で画像化。コピーして他の画像生成AIに貼ることもできる）
// - アプリ内で直接イラストを生成（/api/generate-image。Gemini の画像生成。GEMINI_API_KEY で動く）
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
            if (!r.ok) return null;
            return await r.json();
        } catch (e) {
            return null;   // 電波が弱いだけのことがある。使えないとは決めない
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
            <p class="pm-lead">ホワイトボードに書いていた練習を、テーマから自動で組み立てたり、写真から読み取って整えたりできます。生成後にイラストも作れます。</p>
            <div class="pm-mode-tabs">
                <button type="button" class="pm-mode-tab ${!isPhoto ? 'active' : ''}" onclick="PracticeMenuGen.switchMode('theme')">テーマから</button>
                <button type="button" class="pm-mode-tab ${isPhoto ? 'active' : ''}" onclick="PracticeMenuGen.switchMode('photo')">写真から</button>
            </div>
            <form id="pmForm" onsubmit="PracticeMenuGen.submit(event)">
                ${isPhoto ? `
                <div class="form-group">
                    <label>ホワイトボードの写真 <span style="color:#e74c3c;">*</span></label>
                    <div class="pm-photo-pick">
                        <button type="button" class="pm-photo-btn" data-ic="0" onclick="document.getElementById('pmPhotoPick').click()">${window.hIcon ? hIcon('upload') : ''}<span>保存してある写真から選ぶ</span></button>
                        <button type="button" class="pm-photo-btn pm-photo-btn-camera" data-ic="0" onclick="document.getElementById('pmPhotoInput').click()">${window.hIcon ? hIcon('camera') : ''}<span>いま写真を撮る</span></button>
                    </div>
                    <div class="pm-photo-drop" id="pmPhotoDrop">
                        <span id="pmPhotoDropText">選んだ写真がここに出ます（パソコンは、ここに写真を置いても選べます）</span>
                        <img id="pmPhotoPreview" alt="" style="display:none;">
                    </div>
                    <input type="file" id="pmPhotoPick" accept="image/*" style="display:none;">
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
        // 「撮る」と「保存してある写真から選ぶ」の両方。同じ写真を選び直せるよう、読み込んだら値を空に戻す
        [input, document.getElementById('pmPhotoPick')].forEach(el => {
            if (!el) return;
            el.addEventListener('change', () => { const f = el.files[0]; el.value = ''; if (f) this.loadPhoto(f); });
        });
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
            if (txt) txt.textContent = 'この写真を読み取ります。変えるときは上のボタンから選び直してください';
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
            this.autoImage();
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
            // 頭の ①② や 1. などは外す（画面側で番号を振るので二重になる）
            const arr = v => (Array.isArray(v) ? v.filter(Boolean) : (v ? [String(v)] : [])).map(x => String(x).replace(/^\s*(?:[①-⑳]|[(（]?\d{1,2}[)）.．、]|[・\-●])\s*/, ''));
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
        const canImage = !this.aiStatus || this.aiStatus.imageGeneration !== false;
        const ic = (n) => (window.hIcon ? window.hIcon(n) : '');
        const busy = this.imageBusy === menu;
        // いちばん上はイラスト。作っている間は待ち表示、まだなければ作るボタン
        let imageHtml = '';
        if (menu.imageData) {
            imageHtml = `<div class="pm-hero"><img src="${menu.imageData}" alt="練習メニューのイラスト">
                <div class="pm-hero-actions">
                    <a class="pm-mini-btn" href="${menu.imageDataFull || menu.imageData}" download="${this.esc(menu.title)}.${menu.imageDataFull ? 'png' : 'jpg'}">${ic('download')}画像を保存</a>
                    ${canImage ? `<button type="button" class="pm-mini-btn" data-ic="0" id="pmImageBtn" onclick="PracticeMenuGen.generateImage()">${ic('refresh')}絵を作り直す</button>` : ''}
                </div></div>`;
        } else if (busy) {
            imageHtml = `<div class="pm-hero pm-hero-wait"><img src="soccerball.png" alt="" class="ai-loading-ball"><b>イラストを作っています</b><span>20秒ほどかかります。下の内容は先に読めます</span></div>`;
        } else if (canImage) {
            imageHtml = `<div class="pm-hero pm-hero-empty">${menu.imageError ? `<p class="pm-hero-error">イラストを作れませんでした。電波のよい所でもう一度お試しください。<small>${this.esc(menu.imageError)}</small></p>` : ''}<button type="button" class="pm-hero-make" data-ic="0" id="pmImageBtn" onclick="PracticeMenuGen.generateImage()">${ic('spark')}<span>${menu.imageError ? 'もう一度イラストを作る' : 'イラストを作る'}</span></button></div>`;
        }
        body.innerHTML = `
            <div class="pm-result-toolbar">
                <h2>${saved ? '練習メニュー' : 'できました'}${saved ? '' : '<span class="pm-unsaved">保存はまだです</span>'}</h2>
            </div>
            ${imageHtml}
            <div class="pm-poster" id="pmPoster">${this.posterHtml(menu)}</div>
            <div class="pm-actions pm-actions-main">
                <button type="button" class="btn-primary" onclick="PracticeMenuGen.save()">${saved ? '上書き保存' : '保存する'}</button>
                <button type="button" class="btn-secondary" onclick="PracticeMenuGen.print()">印刷する</button>
            </div>
            <div class="pm-refine">
                <label>${ic('pen')}直したいところを伝える</label>
                <div class="pm-refine-row">
                    <input type="text" id="pmRefineText" placeholder="例: Tr.2をシュート練習に。全体を10分短く">
                    <button type="button" class="btn-small" onclick="PracticeMenuGen.refine()">AIに修正を依頼</button>
                </div>
            </div>
            ${menu.sourcePhoto ? `<details class="pm-details"><summary>元のホワイトボード写真</summary><img src="${menu.sourcePhoto}" alt="ホワイトボード写真" style="max-width:100%; border-radius:8px; margin-top:8px;"></details>` : ''}
            <div class="pm-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">閉じる</button>
            </div>`;
        body.scrollTop = 0;
    },

    // メニューができたら、聞かずにイラストも作る（1日の目安を超えているときは作らない）
    async autoImage() {
        const menu = this.current;
        if (!menu || menu.imageData) return;
        if (!this.aiStatus) this.aiStatus = await this.fetchAiStatus();
        if (this.current !== menu || (this.aiStatus && this.aiStatus.imageGeneration === false)) return;
        const limit = (this.aiStatus && this.aiStatus.dailyImageLimit) || 20;
        const used = parseInt(localStorage.getItem(this.dailyCountKey()) || '0', 10);
        if (used >= limit) return;
        this.generateImage(true);
    },

    // 一目で分かる形: 題名の帯 → 時間・人数・用具の札 → ねらい・合言葉 → 練習ごとの折りたたみ
    // openAll=true（印刷用）は全部ひらいた状態で出す
    posterHtml(menu, openAll) {
        const ic = (n) => (window.hIcon ? window.hIcon(n) : '');
        const secHtml = (menu.sections || []).map((s, idx) => {
            const color = this.SECTION_COLORS[s.type] || this.SECTION_COLORS.other;
            const blk = (icon, title, inner, cls) => inner ? `<div class="pm-blk ${cls || ''}"><div class="pm-blk-title">${ic(icon)}${title}</div>${inner}</div>` : '';
            const list = (items, ordered) => items && items.length ? `<${ordered ? 'ol' : 'ul'}>${items.map(i => `<li>${this.esc(i)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>` : '';
            const diff = s.difficulty || {};
            const diffHtml = (diff.easy || diff.hard) ? `<div class="pm-diff">${diff.easy ? `<div class="pm-diff-easy"><b>かんたん</b>${this.esc(diff.easy)}</div>` : ''}${diff.normal ? `<div class="pm-diff-normal"><b>ふつう</b>${this.esc(diff.normal)}</div>` : ''}${diff.hard ? `<div class="pm-diff-hard"><b>むずかしい</b>${this.esc(diff.hard)}</div>` : ''}</div>` : '';
            return `
                <details class="pm-sec" style="--sec:${color};" ${openAll || idx === 0 ? 'open' : ''}>
                    <summary class="pm-sec-head">
                        <span class="pm-sec-label">${this.esc(s.label)}</span>
                        <span class="pm-sec-name">${this.esc(s.name)}</span>
                        ${s.minutes ? `<span class="pm-sec-min">${ic('calendar')}${this.esc(s.minutes)}分</span>` : ''}
                        <span class="pm-sec-toggle">${ic('next')}</span>
                    </summary>
                    <div class="pm-sec-body">
                        ${blk('target', '準備', s.setup ? `<p>${this.esc(s.setup)}</p>` : '')}
                        ${blk('next', 'やり方', list(s.steps, true))}
                        ${blk('clipboard', 'ルール', list(s.rules))}
                        ${blk('spark', 'ポイント', list(s.points), 'pm-blk-point')}
                        ${blk('mic', '声かけ', list(s.coaching), 'pm-blk-voice')}
                        ${blk('layers', 'むずかしさを変える', diffHtml)}
                        ${s.domains && s.domains.length ? `<div class="pm-domains">${s.domains.map(d => `<span>${this.esc(d)}</span>`).join('')}</div>` : ''}
                        ${s.notes && !/[A-Za-z]{4,}/.test(s.notes) ? `<p class="pm-sec-notes">${this.esc(s.notes)}</p>` : ''}
                    </div>
                </details>`;
        }).join('');
        const chip = (icon, text) => text ? `<span class="pm-chip">${ic(icon)}${this.esc(text)}</span>` : '';
        return `
            <div class="pm-head">
                <div class="pm-head-top"><span class="pm-date">${this.esc(menu.date)}</span>${menu.level ? `<span class="pm-level">${this.esc(menu.level)}</span>` : ''}</div>
                <h3 class="pm-title">${this.esc(menu.title)}</h3>
                <div class="pm-meta">
                    ${chip('calendar', menu.duration)}
                    ${chip('users', menu.participants)}
                    ${chip('ball', menu.equipment && menu.equipment.length ? menu.equipment.join('・') : '')}
                </div>
                ${menu.purpose ? `<div class="pm-purpose"><b>${ic('target')}ねらい</b><p>${this.esc(menu.purpose)}</p></div>` : ''}
                ${menu.keyword ? `<div class="pm-keyword"><b>合言葉</b>${this.esc(menu.keyword)}</div>` : ''}
            </div>
            ${secHtml}
            ${menu.summary ? `<div class="pm-summary"><b>${ic('check')}大切なこと</b><p>${this.esc(menu.summary)}</p></div>` : ''}
            ${menu.therapeuticNotes ? `<div class="pm-therapy"><b>${ic('info')}療育的な配慮</b><p>${this.esc(menu.therapeuticNotes)}</p></div>` : ''}`;
    },

    copyPrompt() {
        const ta = document.getElementById('pmPromptText');
        if (!ta) return;
        const text = ta.value;
        const done = () => showToast('イラストの指示文をコピーしました。');
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
            this.autoImage();
        } catch (e) {
            console.error(e);
            showToast('修正に失敗しました: ' + (e.message || ''));
            this.renderResult();
        }
    },

    // ============================================================
    // イラスト生成（Gemini の画像生成。サーバー側の GEMINI_API_KEY を使う）
    // ============================================================
    dailyCountKey() {
        return 'heartup_imageGenCount_' + new Date().toISOString().split('T')[0];
    },

    async generateImage(auto) {
        const menu = this.current;
        if (!menu || this.imageBusy === menu) return;
        const limit = (this.aiStatus && this.aiStatus.dailyImageLimit) || 20;
        const used = parseInt(localStorage.getItem(this.dailyCountKey()) || '0', 10);
        if (!auto && used >= limit) {
            if (!confirm(`本日この端末で ${used} 枚生成しています（目安 ${limit} 枚）。続けますか？`)) return;
        }
        const hadImage = menu.imageData;
        this.imageBusy = menu;
        menu.imageError = '';
        menu.imageData = null;
        if (this.current === menu) this.renderResult();
        try {
            const r = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: menu.illustrationPrompt, size: '1024x1536', quality: 'medium' })
            });
            const data = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(data.error || '画像生成に失敗しました');
            // 保存用に縮小（Firestore 1ドキュメント1MB制限のため）。元画像は生成直後だけ保存できる
            menu.imageDataFull = data.image;
            menu.imageData = await this.resizeImage(data.image, 1200, 0.82);
            if (menu.imageData.length > 900 * 1024) menu.imageData = await this.resizeImage(data.image, 900, 0.75);
            localStorage.setItem(this.dailyCountKey(), String(used + 1));
            showToast('イラストができました。「保存する」で一緒に保存されます。');
        } catch (e) {
            console.error(e);
            menu.imageData = hadImage || null;
            menu.imageError = e.message || '画像生成に失敗しました';
            showToast('イラストを作れませんでした');
        } finally {
            if (this.imageBusy === menu) this.imageBusy = null;
            // 待っている間に別のメニューを開いていたら、そちらの画面は触らない
            if (this.current === menu && !document.getElementById('modal').classList.contains('hidden') && document.getElementById('pmPoster')) {
                const y = document.getElementById('modalBody').scrollTop;
                this.renderResult();
                document.getElementById('modalBody').scrollTop = y;
            }
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
        delete payload.imageError;
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
            .pm-head { text-align:left; }
            .pm-head-top span, .pm-chip { display:inline-block; margin-right: 10px; color:#555; font-size: 13px; }
            .pm-purpose b, .pm-keyword b, .pm-summary b, .pm-therapy b { margin-right: 8px; color:#2e7d32; }
            .pm-purpose p, .pm-summary p, .pm-therapy p { display:inline; margin:0; }
            details.pm-sec > summary { list-style:none; background: var(--sec); }
            details.pm-sec { border-color: var(--sec); }
            .pm-sec-toggle, svg { display:none; }
            .pm-blk { margin: 4px 0; } .pm-blk-title { font-weight:bold; color:#2e7d32; }
            .pm-blk ul, .pm-blk ol { margin: 2px 0 6px 20px; padding:0; } .pm-blk p { margin:2px 0; }
            .pm-diff b { margin-right: 8px; }
            img.poster { max-width: 100%; page-break-before: always; }
            @media print { body { margin: 8mm; } }`;
        w.document.write(`<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>${this.esc(menu.title)}</title><style>${css}</style></head><body>${this.posterHtml(menu, true)}${menu.imageData ? `<img class="poster" src="${menu.imageData}" alt="">` : ''}</body></html>`);
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
