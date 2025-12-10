// 資料データ（実際のPDFファイル）
const sampleResources = [
    {
        id: 1,
        title: "サッカー療育",
        category: "soccer",
        description: "サッカーを通じた療育の基本的な考え方と、実際の指導方法について解説します。発達支援におけるサッカー活動の効果や、具体的な指導プログラムを紹介。",
        date: "2024-08-30",
        tags: ["サッカー", "療育", "実践方法", "指導"],
        filename: "サッカー療育.pdf",
        hasFile: true
    },
    {
        id: 2,
        title: "ABC分析",
        category: "aba",
        description: "応用行動分析のABC分析を使って、子どもの行動を理解し支援する方法を学びます。先行事象（Antecedent）、行動（Behavior）、結果（Consequence）の関係性を理解し、効果的な支援につなげます。",
        date: "2024-08-30",
        tags: ["ABC分析", "応用行動分析", "行動理解", "支援方法"],
        filename: "ABC分析.pdf",
        hasFile: true
    },
    {
        id: 3,
        title: "ケーススタディ",
        category: "case",
        description: "実際にサッカー療育で成長した子どもたちの事例を紹介します。具体的な支援内容、経過、成果を詳しく解説した実践的なケーススタディ集。",
        date: "2024-09-18",
        tags: ["事例研究", "ケーススタディ", "成功例", "実践"],
        filename: "ケーススタディ.pdf",
        hasFile: true
    }
];

// 練習メニューデータ - 実際のファイル名と完全一致させる
// categories配列で複数カテゴリに対応
const practiceMenus = [
    {
        id: 1,
        title: "ボールフィーリング",
        category: "warmup",
        categories: ["warmup", "tactile", "bodyimage"],
        difficulty: "☆",
        description: "ボールに慣れるための基本的な練習。触覚刺激とボディイメージの向上に効果的",
        filename: "ボールフィーリング☆.pdf"
    },
    {
        id: 2,
        title: "ボール運び",
        category: "warmup",
        categories: ["warmup", "concentration", "bodyimage"],
        difficulty: "☆",
        description: "ボールを運ぶ基礎練習。集中力とボディイメージを養う",
        filename: "ボール運び☆.pdf"
    },
    {
        id: 3,
        title: "フラフープ色鬼",
        category: "game",
        categories: ["game", "vestibular", "switching", "concentration"],
        difficulty: "☆",
        description: "フラフープを使った鬼ごっこ。前庭覚刺激と切り替え能力を養う",
        filename: "フラフープ色鬼☆.pdf"
    },
    {
        id: 4,
        title: "コーン倒しゲーム",
        category: "game",
        categories: ["game", "concentration", "competition"],
        difficulty: "☆",
        description: "コーンを倒すゲーム形式の練習。集中力と勝ち負けの理解を促す",
        filename: "コーン倒しゲーム☆.pdf"
    },
    {
        id: 5,
        title: "守護神ゲーム",
        category: "game",
        categories: ["game", "vestibular", "balance", "competition"],
        difficulty: "☆",
        description: "ゴールキーパーの基本練習。バランス感覚と前庭覚刺激",
        filename: "守護神ゲーム☆.pdf"
    },
    {
        id: 6,
        title: "色々な動き",
        category: "warmup",
        categories: ["warmup", "flexibility", "bodyimage", "vestibular"],
        difficulty: "★☆",
        description: "様々な動きを取り入れた運動。柔軟性とボディイメージの向上",
        filename: "色々な動き★☆.pdf"
    },
    {
        id: 7,
        title: "ステップトレーニング",
        category: "warmup",
        categories: ["warmup", "balance", "proprioceptive", "concentration"],
        difficulty: "★☆",
        description: "フットワークの基礎練習。バランスと固有覚刺激",
        filename: "ステップトレーニング★☆.pdf"
    },
    {
        id: 8,
        title: "コーンドリブル",
        category: "dribble",
        categories: ["dribble", "concentration", "switching", "bodyimage"],
        difficulty: "★☆",
        description: "コーンを使ったドリブル練習。集中力と切り替え能力を養う",
        filename: "コーンドリブル★☆.pdf"
    },
    {
        id: 9,
        title: "追跡ドリブル",
        category: "dribble",
        categories: ["dribble", "concentration", "vestibular", "switching"],
        difficulty: "★☆",
        description: "相手を追いかけながらのドリブル。前庭覚刺激と集中力",
        filename: "追跡ドリブル★☆.pdf"
    },
    {
        id: 10,
        title: "様々なターン",
        category: "dribble",
        categories: ["dribble", "switching", "bodyimage", "proprioceptive"],
        difficulty: "★☆",
        description: "ターン技術の習得。切り替え能力とボディイメージ",
        filename: "様々なターン★☆.pdf"
    },
    {
        id: 11,
        title: "対面パス",
        category: "match",
        categories: ["match", "concentration", "bodyimage"],
        difficulty: "★☆",
        description: "対面でのパス練習。集中力とボディコントロール",
        filename: "対面パス★☆.pdf"
    },
    {
        id: 12,
        title: "コントロールパス",
        category: "match",
        categories: ["match", "concentration", "tactile", "proprioceptive"],
        difficulty: "★☆",
        description: "正確なパスコントロール練習。触覚と固有覚刺激",
        filename: "コントロールパス★☆.pdf"
    },
    {
        id: 13,
        title: "けんけんシュート",
        category: "shoot",
        categories: ["shoot", "balance", "proprioceptive", "concentration"],
        difficulty: "★☆",
        description: "片足でのシュート練習。バランス感覚と固有覚刺激",
        filename: "けんけんシュート★☆.pdf"
    },
    {
        id: 14,
        title: "又抜きシュート",
        category: "shoot",
        categories: ["shoot", "bodyimage", "concentration"],
        difficulty: "★☆",
        description: "股抜きからのシュート練習。ボディイメージと集中力",
        filename: "又抜きシュート★☆.pdf"
    },
    {
        id: 15,
        title: "ゲート通過シュート",
        category: "shoot",
        categories: ["shoot", "concentration", "bodyimage"],
        difficulty: "★☆",
        description: "ゲートを通過してからのシュート。精密な動作制御",
        filename: "ゲート通過シュート★☆.pdf"
    },
    {
        id: 16,
        title: "さまざまなシュート",
        category: "shoot",
        categories: ["shoot", "switching", "bodyimage", "proprioceptive"],
        difficulty: "★☆",
        description: "いろいろな種類のシュート練習。切り替えと感覚統合",
        filename: "さまざまなシュート★☆.pdf"
    },
    {
        id: 17,
        title: "ボール集めゲーム",
        category: "game",
        categories: ["game", "concentration", "vestibular", "switching"],
        difficulty: "★☆",
        description: "ボールを集めるゲーム形式の練習。素早い判断と動き",
        filename: "ボール集めゲーム★☆.pdf"
    },
    {
        id: 18,
        title: "爆弾ゲーム",
        category: "game",
        categories: ["game", "switching", "vestibular", "concentration"],
        difficulty: "★☆",
        description: "爆弾に見立てたボールを使ったゲーム。切り替えと集中力",
        filename: "爆弾ゲーム★☆.pdf"
    },
    {
        id: 19,
        title: "たまご落としゲーム",
        category: "game",
        categories: ["game", "tactile", "concentration", "proprioceptive"],
        difficulty: "★☆",
        description: "卵に見立てたボールを使ったゲーム。繊細なコントロール",
        filename: "たまご落としゲーム★☆.pdf"
    },
    {
        id: 20,
        title: "逆鬼ごっこ",
        category: "game",
        categories: ["game", "vestibular", "switching", "concentration"],
        difficulty: "★☆",
        description: "通常と逆の鬼ごっこ。認知的な切り替えと前庭覚刺激",
        filename: "逆鬼ごっこ★☆.pdf"
    },
    {
        id: 21,
        title: "試合",
        category: "match",
        categories: ["match", "competition", "switching", "concentration"],
        difficulty: "★☆",
        description: "実際の試合形式での練習。勝ち負けの経験と総合的な能力",
        filename: "試合★☆.pdf"
    },
    {
        id: 22,
        title: "サッカー療育ウォーミングアップ編",
        category: "warmup",
        categories: ["warmup", "flexibility", "bodyimage", "balance"],
        difficulty: "総合",
        description: "ウォーミングアップの総合ガイド",
        filename: "サッカー療育ウォーミングアップ編.pdf"
    },
    {
        id: 23,
        title: "サッカー療育ドリブル編",
        category: "dribble",
        categories: ["dribble", "concentration", "switching", "bodyimage"],
        difficulty: "総合",
        description: "ドリブル技術の総合ガイド",
        filename: "サッカー療育ドリブル編.pdf"
    },
    {
        id: 24,
        title: "サッカー療育シュート編",
        category: "shoot",
        categories: ["shoot", "concentration", "bodyimage", "proprioceptive"],
        difficulty: "総合",
        description: "シュート技術の総合ガイド",
        filename: "サッカー療育シュート編.pdf"
    },
    {
        id: 25,
        title: "サッカー療育対人編",
        category: "match",
        categories: ["match", "competition", "switching", "concentration"],
        difficulty: "総合",
        description: "対人練習の総合ガイド",
        filename: "サッカー療育対人編.pdf"
    }
];

// 現在のカテゴリフィルター
let currentCategory = 'all';
let currentPracticeCategory = 'all';

// 生成されたコンテンツを保存（修正用）
let lastGeneratedRecord = '';
let lastRecordData = null;
let lastGeneratedPlan = '';
let lastPlanData = null;
let lastGeneratedReview = '';
let lastReviewData = null;

// マークダウンをHTMLに変換する関数
function convertMarkdownToHTML(markdown) {
    let html = markdown;

    // エスケープ処理（XSS対策）
    html = html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');

    // 見出し
    html = html.replace(/^#### (.+)$/gm, '<h4 style="color: #2e7d32; margin-top: 1.5rem; margin-bottom: 0.5rem; font-size: 1.1rem;">$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3 style="color: #2e7d32; margin-top: 1.5rem; margin-bottom: 0.5rem; font-size: 1.2rem;">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 style="color: #2e7d32; margin-top: 2rem; margin-bottom: 1rem; font-size: 1.4rem; border-bottom: 2px solid #4caf50; padding-bottom: 0.5rem;">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 style="color: #2e7d32; margin-top: 2rem; margin-bottom: 1rem; font-size: 1.6rem;">$1</h1>');

    // 太字
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #2e7d32; font-weight: 600;">$1</strong>');

    // 水平線
    html = html.replace(/^---$/gm, '<hr style="border: none; border-top: 2px solid #e0e0e0; margin: 1.5rem 0;">');

    // リスト処理（複数行対応）
    const lines = html.split('\n');
    let inList = false;
    let result = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const listMatch = line.match(/^(\s*)\* (.+)$/);

        if (listMatch) {
            const indent = listMatch[1].length;
            const content = listMatch[2];

            if (!inList) {
                result.push('<ul style="margin: 0.5rem 0; padding-left: 2rem; line-height: 1.8;">');
                inList = true;
            }

            result.push(`<li style="margin: 0.3rem 0;">${content}</li>`);
        } else {
            if (inList) {
                result.push('</ul>');
                inList = false;
            }
            result.push(line);
        }
    }

    if (inList) {
        result.push('</ul>');
    }

    html = result.join('\n');

    // 段落（空行で区切られたテキストをpタグで囲む）
    html = html.replace(/\n\n+/g, '</p><p style="margin: 0.8rem 0; line-height: 1.8;">');
    html = '<p style="margin: 0.8rem 0; line-height: 1.8;">' + html + '</p>';

    // 空のpタグを削除
    html = html.replace(/<p[^>]*>\s*<\/p>/g, '');

    return html;
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // localStorageの無効なAPIキーをクリア
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey && (savedKey.includes('github.com') || savedKey.includes('http://') || savedKey.includes('https://'))) {
        console.warn('Clearing invalid API key from localStorage:', savedKey);
        localStorage.removeItem('gemini_api_key');
    }

    // Gemini APIの初期化
    initializeGeminiAPI();

    // Handle URL parameters (for redirect from assessment form)
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    const subtab = urlParams.get('subtab');
    const childName = urlParams.get('childName');

    // URLパラメータに基づいてタブを切り替え
    if (tab) {
        // メインタブを切り替え
        const mainTabButton = document.querySelector(`[data-tab="${tab}"]`);
        if (mainTabButton) {
            mainTabButton.click();

            // サブタブがある場合は切り替え
            if (subtab && tab === 'ai-tools') {
                setTimeout(() => {
                    const subTabButton = document.querySelector(`[data-ai-tab="${subtab}"]`);
                    if (subTabButton) {
                        subTabButton.click();

                        // 児童名がある場合は、フォームに反映（支援計画フォームに児童名を自動入力）
                        if (childName && subtab === 'plan') {
                            setTimeout(() => {
                                const childNameInput = document.querySelector('#planForm input[name="childName"]');
                                if (childNameInput) {
                                    childNameInput.value = decodeURIComponent(childName);
                                }
                            }, 100);
                        }
                    }
                }, 100);
            }
        }
    }

    // メインタブ切り替え機能
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // タブボタンのアクティブ状態を切り替え
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // タブコンテンツの表示を切り替え
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                    // AI書類作成タブが開かれた場合、最初のフォームを表示
                    if (targetTab === 'ai-tools') {
                        initializeAITabs();
                    }
                }
            });
        });
    });
    
    // AI機能内部のタブ切り替え
    const aiTabButtons = document.querySelectorAll('.ai-tab-button');
    const aiTabContents = document.querySelectorAll('.ai-tab-content');
    
    aiTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetAITab = this.getAttribute('data-ai-tab');
            
            // タブボタンのアクティブ状態を切り替え
            aiTabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // タブコンテンツの表示を切り替え
            aiTabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === 'ai-' + targetAITab) {
                    content.classList.add('active');
                    // 対応するフォームを表示
                    if (targetAITab === 'record') {
                        showRecordForm();
                    } else if (targetAITab === 'plan') {
                        showPlanForm();
                    } else if (targetAITab === 'review') {
                        showReviewForm();
                    }
                }
            });
        });
    });
    
    // カテゴリフィルター機能
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.getAttribute('data-category');
            displayResources();
        });
    });
    
    // 検索機能
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        displayResources();
    });
    
    // 練習メニューのカテゴリフィルター機能
    const practiceCategoryButtons = document.querySelectorAll('.practice-category-btn');
    practiceCategoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            practiceCategoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentPracticeCategory = this.getAttribute('data-category');
            displayPracticeMenus();
        });
    });

    // 練習メニューの検索機能
    const practiceSearchInput = document.getElementById('practiceSearchInput');
    if (practiceSearchInput) {
        practiceSearchInput.addEventListener('input', function() {
            displayPracticeMenus();
        });
    }

    // 初期表示
    displayResources();
    displayPracticeMenus();
    initializeAITabs();

    // Handle URL parameters to switch to specific tab and subtab
    if (tab && tab === 'ai-tools') {
        // Switch to AI Tools tab
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        const aiToolsButton = document.querySelector('.tab-button[data-tab="ai-tools"]');
        const aiToolsContent = document.getElementById('ai-tools');

        if (aiToolsButton && aiToolsContent) {
            aiToolsButton.classList.add('active');
            aiToolsContent.classList.add('active');

            // Switch to specific AI subtab (plan)
            if (subtab && subtab === 'plan') {
                const aiTabButtons = document.querySelectorAll('.ai-tab-button');
                const aiTabContents = document.querySelectorAll('.ai-tab-content');

                aiTabButtons.forEach(btn => btn.classList.remove('active'));
                aiTabContents.forEach(content => content.classList.remove('active'));

                const planButton = document.querySelector('.ai-tab-button[data-ai-tab="plan"]');
                const planContent = document.getElementById('ai-plan');

                if (planButton && planContent) {
                    planButton.classList.add('active');
                    planContent.classList.add('active');
                    showPlanForm();

                    // Auto-fill child name if provided
                    if (childName) {
                        setTimeout(() => {
                            const childNameInput = document.getElementById('planChildName');
                            if (childNameInput) {
                                childNameInput.value = childName;
                            }
                        }, 100);
                    }
                }
            }
        }
    }
});

// AI機能タブの初期化
function initializeAITabs() {
    // 最初のタブ（記録作成）を表示
    showRecordForm();
}

// 資料を表示する関数
function displayResources() {
    const grid = document.getElementById('resourcesGrid');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    // フィルタリング
    let filteredResources = sampleResources;
    
    // カテゴリフィルター
    if (currentCategory !== 'all') {
        filteredResources = filteredResources.filter(resource => 
            resource.category === currentCategory
        );
    }
    
    // 検索フィルター
    if (searchTerm) {
        filteredResources = filteredResources.filter(resource => 
            resource.title.toLowerCase().includes(searchTerm) ||
            resource.description.toLowerCase().includes(searchTerm) ||
            resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    
    // HTMLの生成
    grid.innerHTML = '';
    
    if (filteredResources.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">該当する資料が見つかりませんでした。</p>';
        return;
    }
    
    filteredResources.forEach(resource => {
        const card = document.createElement('div');
        card.className = 'resource-card';
        card.onclick = () => openResourceModal(resource);
        
        const categoryLabel = getCategoryLabel(resource.category);
        
        card.innerHTML = `
            <span class="resource-type">${categoryLabel}</span>
            <h3>${resource.title}</h3>
            <p>${resource.description}</p>
            <div style="margin-top: 1rem; font-size: 0.85rem; color: #999;">
                📅 ${resource.date}
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// 練習メニューの表示
function displayPracticeMenus() {
    const searchTerm = document.getElementById('practiceSearchInput')?.value.toLowerCase() || '';
    const grid = document.getElementById('practiceGrid');

    if (!grid) return;

    // フィルタリング
    let filteredMenus = practiceMenus;

    // カテゴリフィルター（categories配列を使用）
    if (currentPracticeCategory !== 'all') {
        filteredMenus = filteredMenus.filter(menu =>
            menu.categories && menu.categories.includes(currentPracticeCategory)
        );
    }

    // 検索フィルター
    if (searchTerm) {
        filteredMenus = filteredMenus.filter(menu =>
            menu.title.toLowerCase().includes(searchTerm) ||
            menu.description.toLowerCase().includes(searchTerm)
        );
    }

    // HTMLの生成
    grid.innerHTML = '';

    if (filteredMenus.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">該当する練習メニューが見つかりませんでした。</p>';
        return;
    }

    filteredMenus.forEach(menu => {
        const card = document.createElement('div');
        card.className = 'practice-card';
        card.onclick = () => openPracticeMenuPDF(menu);

        const categoryLabel = getPracticeCategoryLabel(menu.category);
        const difficultyClass = getDifficultyClass(menu.difficulty);

        card.innerHTML = `
            <div class="practice-header">
                <span class="practice-category-label">${categoryLabel}</span>
                <span class="practice-difficulty ${difficultyClass}">${menu.difficulty}</span>
            </div>
            <h3>${menu.title}</h3>
            <p>${menu.description}</p>
            <div class="practice-footer">
                <span class="view-pdf-btn">📄 PDFを見る</span>
            </div>
        `;

        grid.appendChild(card);
    });
}

// 練習メニューのカテゴリラベルを取得
function getPracticeCategoryLabel(category) {
    const labels = {
        'warmup': 'ウォーミングアップ',
        'dribble': 'ドリブル',
        'shoot': 'シュート',
        'match': '対人・試合',
        'game': 'ゲーム',
        'concentration': '集中力強化',
        'switching': '切り替え強化',
        'competition': '勝ち負け',
        'vestibular': '前庭覚刺激',
        'proprioceptive': '固有覚刺激',
        'tactile': '触覚刺激',
        'flexibility': '柔軟性（稼働域）',
        'bodyimage': 'ボディイメージ',
        'balance': 'バランス'
    };
    return labels[category] || 'その他';
}

// 難易度のクラスを取得
function getDifficultyClass(difficulty) {
    if (difficulty === '☆') return 'difficulty-easy';
    if (difficulty === '★☆') return 'difficulty-medium';
    return 'difficulty-advanced';
}

// 練習メニューのPDFを開く
function openPracticeMenuPDF(menu) {
    // GitHub Pages対応 - 相対パスとURLエンコーディング
    const isGitHubPages = window.location.hostname.includes('github.io');
    const baseUrl = isGitHubPages
        ? '/HeartUpApp/'
        : './';

    // ファイル名をエンコード（★☆などの特殊文字対応）
    const encodedFilename = menu.filename
        .replace(/★/g, '%E2%98%85')  // ★をURLエンコード
        .replace(/☆/g, '%E2%98%86');  // ☆をURLエンコード

    const pdfPath = `${baseUrl}practicemenu/${encodedFilename}`;

    // デバッグ用ログ（本番環境では削除可能）
    console.log('Opening PDF:', pdfPath);
    console.log('Original filename:', menu.filename);
    console.log('Encoded filename:', encodedFilename);
    console.log('Is GitHub Pages:', isGitHubPages);

    window.open(pdfPath, '_blank');
}

// カテゴリラベルを取得
function getCategoryLabel(category) {
    const labels = {
        'soccer': 'サッカー療育',
        'aba': '応用行動分析',
        'case': '事例研究'
    };
    return labels[category] || 'その他';
}

// 資料モーダルを開く
function openResourceModal(resource) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    // 資料を開くボタンの処理
    const openButtonHTML = resource.hasFile
        ? `<button class="btn-primary" onclick="openResourcePDF('${resource.filename}')">📄 資料を開く</button>`
        : `<button class="btn-primary" onclick="alert('この資料のPDFファイルはまだ追加されていません。')">📄 資料を開く</button>`;

    modalBody.innerHTML = `
        <h2 style="color: #2e7d32; margin-bottom: 1rem;">${resource.title}</h2>
        <div style="margin-bottom: 1.5rem;">
            <span class="resource-type">${getCategoryLabel(resource.category)}</span>
            <span style="margin-left: 1rem; color: #666;">📅 ${resource.date}</span>
        </div>
        <div style="margin-bottom: 1.5rem;">
            ${resource.tags.map(tag => `<span style="display: inline-block; padding: 0.3rem 0.8rem; background: #e8f5e9; color: #2e7d32; border-radius: 15px; margin-right: 0.5rem; margin-bottom: 0.5rem; font-size: 0.9rem;">#${tag}</span>`).join('')}
        </div>
        <p style="line-height: 1.8; color: #333; margin-bottom: 1.5rem;">${resource.description}</p>
        <div style="padding: 1.5rem; background: #f8f9fa; border-radius: 10px; margin-bottom: 1.5rem;">
            <h3 style="color: #2e7d32; margin-bottom: 1rem;">📚 資料について</h3>
            <p style="color: #666; line-height: 1.6;">
                この資料では、${resource.title}について詳しく解説しています。
                実際の指導現場で活用できる具体的な方法や、注意すべきポイントなどを
                イラストや図表を交えて分かりやすく説明しています。
            </p>
        </div>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            ${openButtonHTML}
            <button class="btn-secondary" onclick="closeModal()">閉じる</button>
        </div>
    `;

    modal.classList.remove('hidden');
}

// 資料PDFを開く
function openResourcePDF(filename) {
    // GitHub Pages対応
    const isGitHubPages = window.location.hostname.includes('github.io');
    const baseUrl = isGitHubPages
        ? '/HeartUpApp/'
        : './';

    const pdfPath = `${baseUrl}documents/${filename}`;

    console.log('Opening resource PDF:', pdfPath);
    console.log('Filename:', filename);

    window.open(pdfPath, '_blank');
}

// モーダルを閉じる
function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
}

// 記録作成フォームを表示
function showRecordForm() {
    const container = document.getElementById('recordToolContent');

    // localStorageから最新のアセスメントと支援計画を取得
    const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
    const supportPlans = JSON.parse(localStorage.getItem('supportPlans') || '{}');

    // 最新のアセスメントデータを取得（作成日時でソート）
    let latestAssessment = null;
    let latestChildName = '';
    const assessmentEntries = Object.entries(assessments);
    if (assessmentEntries.length > 0) {
        const sorted = assessmentEntries.sort((a, b) => {
            const dateA = new Date(a[1].createdAt || 0);
            const dateB = new Date(b[1].createdAt || 0);
            return dateB - dateA;
        });
        latestAssessment = sorted[0][1].data;
        latestChildName = latestAssessment?.childName || '';
    }

    // 対応する支援計画を取得
    let supportPlanData = null;
    if (latestChildName) {
        for (const [key, plan] of Object.entries(supportPlans)) {
            if (plan.childName === latestChildName) {
                supportPlanData = plan;
                break;
            }
        }
    }

    container.innerHTML = `
        ${latestChildName ? '<div style="background: #e8f5e9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;"><strong>最新のアセスメント情報を読み込みました:</strong> ' + latestChildName + '</div>' : ''}
        <form onsubmit="generateRecord(event)">
            <div class="form-group">
                <label>日付</label>
                <input type="date" id="recordDate" required value="${new Date().toISOString().split('T')[0]}">
            </div>

            <div class="form-group">
                <label>対象児童名</label>
                <input type="text" id="childName" placeholder="例: 山田太郎" value="${latestChildName}" required>
            </div>

            <input type="hidden" id="supportPlanDataJson" value='${supportPlanData ? JSON.stringify(supportPlanData).replace(/'/g, "&apos;") : ''}'>
            
            <div class="form-group">
                <label>活動内容</label>
                <select id="activityType" required>
                    <option value="">選択してください</option>
                    <option value="individual">個別練習</option>
                    <option value="group">グループ活動</option>
                    <option value="game">ミニゲーム</option>
                    <option value="skill">スキル練習</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>観察された様子（簡単に）</label>
                <textarea id="observation" placeholder="例: ボールを蹴る練習を楽しんでいた。友達とパスを交換できた。" required></textarea>
            </div>
            
            <div class="form-group">
                <label>特記事項</label>
                <input type="text" id="notes" placeholder="例: 集中力が向上、笑顔が多かった">
            </div>
            
            <div style="display: flex; gap: 1rem;">
                <button type="submit" class="btn-primary">記録を生成</button>
                <button type="button" class="btn-secondary" onclick="closeToolDetail()">キャンセル</button>
            </div>
        </form>
        
        <div id="generatedRecord" style="margin-top: 2rem; display: none;">
            <h3 style="color: #2e7d32; margin-bottom: 1rem;">生成された記録</h3>
            <div style="padding: 1.5rem; background: #f8f9fa; border-radius: 10px;" id="recordContent"></div>
            <div style="margin-top: 1rem; display: flex; gap: 1rem;">
                <button class="btn-primary" onclick="alert('デモ版のため、保存機能は実装されていません。')">💾 保存</button>
                <button class="btn-secondary" onclick="alert('デモ版のため、エクスポート機能は実装されていません。')">📥 PDF出力</button>
            </div>

            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e0e0e0;">
                <h4 style="color: #2e7d32; margin-bottom: 1rem;">📝 修正・追加要望</h4>
                <div class="form-group">
                    <textarea id="recordRefinementRequest" placeholder="例: もっと具体的な表現にしてください、保護者向けに優しい言葉で書き直してください、5領域の評価をより詳しく記載してください" style="min-height: 100px;"></textarea>
                </div>
                <button class="btn-primary" onclick="refineRecord()">🔄 修正を依頼</button>
            </div>
        </div>
    `;
}

// 支援計画フォームを表示
function showPlanForm() {
    const container = document.getElementById('planToolContent');

    // URLパラメータまたはlocalStorageからアセスメントデータを取得
    const urlParams = new URLSearchParams(window.location.search);
    const childNameParam = urlParams.get('childName');
    let assessmentData = null;

    // localStorageからアセスメントデータを探す
    if (childNameParam) {
        const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
        for (const [fileName, assessment] of Object.entries(assessments)) {
            if (assessment.data && assessment.data.childName === childNameParam) {
                assessmentData = assessment.data;
                break;
            }
        }
    }

    // 生年月日から年齢を計算
    let calculatedAge = '';
    if (assessmentData?.birthDate) {
        const birthDate = new Date(assessmentData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        calculatedAge = age.toString();
    }

    container.innerHTML = `
        ${assessmentData ? '<div style="background: #e8f5e9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;"><strong>アセスメント情報を読み込みました:</strong> ' + assessmentData.childName + (calculatedAge ? ' （' + calculatedAge + '歳）' : '') + '</div>' : ''}
        <form onsubmit="generatePlan(event)">
            <div class="form-group">
                <label>対象児童名</label>
                <input type="text" id="planChildName" placeholder="例: 山田太郎" value="${assessmentData?.childName || childNameParam || ''}" required>
            </div>

            <div class="form-group">
                <label>年齢</label>
                <input type="number" id="childAge" min="3" max="18" placeholder="例: 8" value="${calculatedAge}" required>
            </div>

            <div class="form-group">
                <label>優先課題領域（5つの発達領域から最も気になる領域を選択）</label>
                <select id="priorityArea" required>
                    <option value="">選択してください</option>
                    <option value="健康・生活">健康・生活</option>
                    <option value="運動・感覚">運動・感覚</option>
                    <option value="認知・行動">認知・行動</option>
                    <option value="言語・コミュニケーション">言語・コミュニケーション</option>
                    <option value="人間関係・社会性">人間関係・社会性</option>
                </select>
            </div>

            <div class="form-group">
                <label>現在の課題</label>
                <textarea id="currentIssues" placeholder="例: ボールコントロールが苦手、集団行動が困難" required></textarea>
            </div>

            <div class="form-group">
                <label>強み・得意なこと</label>
                <textarea id="strengths" placeholder="例: 走ることが好き、ルールの理解が早い" required></textarea>
            </div>

            <div class="form-group">
                <label>保護者の要望</label>
                <textarea id="parentRequest" placeholder="例: 友達と協力できるようになってほしい"></textarea>
            </div>

            <input type="hidden" id="assessmentDataJson" value='${assessmentData ? JSON.stringify(assessmentData).replace(/'/g, "&apos;") : ''}'>

            <div style="display: flex; gap: 1rem;">
                <button type="submit" class="btn-primary">計画を生成</button>
                <button type="button" class="btn-secondary" onclick="closeToolDetail()">キャンセル</button>
            </div>
        </form>

        <div id="generatedPlan" style="margin-top: 2rem; display: none;">
            <h3 style="color: #2e7d32; margin-bottom: 1rem;">生成された支援計画</h3>
            <div style="padding: 1.5rem; background: #f8f9fa; border-radius: 10px;" id="planContent"></div>
            <div style="margin-top: 1rem; display: flex; gap: 1rem;">
                <button class="btn-primary" onclick="alert('デモ版のため、保存機能は実装されていません。')">💾 保存</button>
                <button class="btn-secondary" onclick="alert('デモ版のため、エクスポート機能は実装されていません。')">📥 PDF出力</button>
            </div>

            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e0e0e0;">
                <h4 style="color: #2e7d32; margin-bottom: 1rem;">📝 修正・追加要望</h4>
                <div class="form-group">
                    <textarea id="planRefinementRequest" placeholder="例: 短期目標をもっと具体的にしてください、家族支援計画を充実させてください、優先課題領域に焦点を当ててください" style="min-height: 100px;"></textarea>
                </div>
                <button class="btn-primary" onclick="refinePlan()">🔄 修正を依頼</button>
            </div>
        </div>
    `;
}

// 成長振り返りフォームを表示
function showReviewForm() {
    const container = document.getElementById('reviewToolContent');

    // localStorageからアセスメント一覧を取得（生徒選択用）
    const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
    const studentNames = [...new Set(Object.values(assessments).map(a => a.data?.childName).filter(Boolean))];

    let studentOptions = '<option value="">選択してください</option>';
    studentNames.forEach(name => {
        studentOptions += `<option value="${name}">${name}</option>`;
    });

    container.innerHTML = `
        <form onsubmit="generateReview(event)">
            <div class="form-group">
                <label>対象児童名</label>
                <select id="reviewChildName" required onchange="loadStudentDataForReview(this.value)">
                    ${studentOptions}
                    <option value="__manual__">手動で入力</option>
                </select>
                <input type="text" id="reviewChildNameManual" placeholder="児童名を入力" style="display: none; margin-top: 0.5rem;">
            </div>

            <div id="driveDataStatus" style="display: none; margin-bottom: 1rem; padding: 1rem; background: #e3f2fd; border-radius: 8px;">
                <strong>📁 Google Driveからデータを読み込み中...</strong>
            </div>

            <div class="form-group">
                <label>評価期間</label>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <input type="date" id="startDate" required>
                    <span>〜</span>
                    <input type="date" id="endDate" required value="${new Date().toISOString().split('T')[0]}">
                </div>
            </div>

            <div class="form-group">
                <label>設定していた目標</label>
                <textarea id="goals" placeholder="例: ボールを正確に蹴れるようになる、友達とパス交換ができる" required></textarea>
            </div>

            <div class="form-group">
                <label>期間中の主な活動記録</label>
                <textarea id="activities" placeholder="例: 週2回の個別練習、月1回のミニゲーム参加（Google Driveから自動取得されます）" required></textarea>
            </div>

            <div class="form-group">
                <label>観察された変化</label>
                <textarea id="changes" placeholder="例: ボールコントロールが向上、積極的に参加するようになった" required></textarea>
            </div>

            <input type="hidden" id="driveAssessmentData" value="">
            <input type="hidden" id="driveRecordsData" value="">

            <div style="display: flex; gap: 1rem;">
                <button type="submit" class="btn-primary">振り返りを生成</button>
                <button type="button" class="btn-secondary" onclick="closeToolDetail()">キャンセル</button>
            </div>
        </form>

        <div id="generatedReview" style="margin-top: 2rem; display: none;">
            <h3 style="color: #2e7d32; margin-bottom: 1rem;">成長の振り返りレポート</h3>
            <div style="padding: 1.5rem; background: #f8f9fa; border-radius: 10px;" id="reviewContent"></div>
            <div style="margin-top: 1rem; display: flex; gap: 1rem;">
                <button class="btn-primary" onclick="saveReviewManually()">💾 保存</button>
                <button class="btn-secondary" onclick="printReview()">🖨️ 印刷</button>
            </div>

            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e0e0e0;">
                <h4 style="color: #2e7d32; margin-bottom: 1rem;">📝 修正・追加要望</h4>
                <div class="form-group">
                    <textarea id="reviewRefinementRequest" placeholder="例: 各領域の成長をもっと詳しく分析してください、保護者へのメッセージを充実させてください、具体的な数値や事例を追加してください" style="min-height: 100px;"></textarea>
                </div>
                <button class="btn-primary" onclick="refineReview()">🔄 修正を依頼</button>
            </div>
        </div>
    `;
}

// 生徒選択時にGoogle Driveからデータを読み込む
async function loadStudentDataForReview(studentName) {
    const manualInput = document.getElementById('reviewChildNameManual');

    if (studentName === '__manual__') {
        manualInput.style.display = 'block';
        manualInput.required = true;
        return;
    } else {
        manualInput.style.display = 'none';
        manualInput.required = false;
    }

    if (!studentName) return;

    const statusDiv = document.getElementById('driveDataStatus');

    // Google Drive APIが利用可能な場合、データを取得
    if (typeof googleDriveAPI !== 'undefined') {
        try {
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = '<strong>📁 Google Driveからデータを読み込み中...</strong>';

            // 初期化確認
            if (!googleDriveAPI.isInitialized()) {
                await googleDriveAPI.initialize();
            }

            // 生徒フォルダからデータを取得
            const studentData = await googleDriveAPI.getStudentDataForReview(studentName);

            if (studentData.success) {
                // アセスメントデータを保存
                if (studentData.assessments.length > 0) {
                    document.getElementById('driveAssessmentData').value = JSON.stringify(studentData.assessments);
                }

                // 記録データを保存
                if (studentData.records.length > 0) {
                    document.getElementById('driveRecordsData').value = JSON.stringify(studentData.records);

                    // 活動記録を自動入力
                    const activitiesSummary = studentData.records.map(r => {
                        const date = r.data?.date || r.createdAt?.split('T')[0] || '';
                        const activity = r.data?.activityType || '';
                        return `${date}: ${activity}`;
                    }).join('\n');

                    document.getElementById('activities').value = activitiesSummary;
                }

                statusDiv.innerHTML = `<strong>✓ データを読み込みました</strong><br>
                    アセスメント: ${studentData.assessments.length}件、記録: ${studentData.records.length}件`;
                statusDiv.style.background = '#e8f5e9';
            } else {
                statusDiv.innerHTML = '<strong>⚠️ データの取得に失敗しました</strong>';
                statusDiv.style.background = '#fff3e0';
            }
        } catch (error) {
            console.error('Google Driveデータ取得エラー:', error);
            statusDiv.innerHTML = '<strong>⚠️ Google Driveに接続できません（手動入力をご利用ください）</strong>';
            statusDiv.style.background = '#fff3e0';
        }
    } else {
        // localStorageからデータを取得
        const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
        const matchingAssessment = Object.values(assessments).find(a => a.data?.childName === studentName);

        if (matchingAssessment) {
            document.getElementById('driveAssessmentData').value = JSON.stringify([{ data: matchingAssessment.data }]);
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = '<strong>✓ ローカルデータを読み込みました</strong>';
            statusDiv.style.background = '#e8f5e9';
        }
    }
}

// 振り返りレポートを印刷
function printReview() {
    const reviewContent = document.getElementById('reviewContent').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>振り返りレポート</title>
            <style>
                body { font-family: 'Hiragino Kaku Gothic ProN', sans-serif; padding: 40px; }
            </style>
        </head>
        <body>
            ${reviewContent}
            <script>window.print(); window.close();</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// 振り返りレポートを手動保存
async function saveReviewManually() {
    if (!lastGeneratedReview || !lastReviewData) {
        alert('先に振り返りレポートを生成してください');
        return;
    }

    const childName = lastReviewData.childName;
    const endDate = lastReviewData.endDate;

    try {
        await saveReviewToDrive(childName, endDate, lastGeneratedReview, lastReviewData);
        alert('振り返りレポートを保存しました');
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    }
}

// ツール詳細を閉じる（現在は使用していないが、互換性のため残す）
function closeToolDetail() {
    // タブ形式になったため、この関数は不要だが互換性のため残す
}

// 記録を生成
async function generateRecord(event) {
    event.preventDefault();

    const date = document.getElementById('recordDate').value;
    const childName = document.getElementById('childName').value;
    const activityType = document.getElementById('activityType').value;
    const observation = document.getElementById('observation').value;
    const notes = document.getElementById('notes').value;

    const activityLabels = {
        'individual': '個別練習',
        'group': 'グループ活動',
        'game': 'ミニゲーム',
        'skill': 'スキル練習'
    };

    // ローディング表示
    document.getElementById('recordContent').innerHTML = '<div style="text-align: center; padding: 2rem;">🔄 AIが記録を生成中...</div>';
    document.getElementById('generatedRecord').style.display = 'block';

    try {
        // 支援計画データを取得
        const supportPlanDataJson = document.getElementById('supportPlanDataJson')?.value;
        let supportPlanData = null;
        if (supportPlanDataJson) {
            try {
                supportPlanData = JSON.parse(supportPlanDataJson);
            } catch (e) {
                console.error('Failed to parse support plan data:', e);
            }
        }

        let generatedText = '';

        // Gemini APIを使用して生成
        if (geminiAPI.isInitialized()) {
            const recordData = {
                date,
                childName,
                activityType: activityLabels[activityType],
                observation,
                notes,
                supportPlan: supportPlanData  // 支援計画データを追加
            };

            generatedText = await geminiAPI.generateRecord(recordData);
            document.getElementById('recordContent').innerHTML = convertMarkdownToHTML(generatedText);

            // 修正用に保存
            lastGeneratedRecord = generatedText;
            lastRecordData = recordData;
        } else {
            // APIが設定されていない場合はデフォルトのテキストを使用
            generatedText = `【活動記録】

日付: ${date}
対象児童: ${childName}
活動内容: ${activityLabels[activityType]}

◆ 活動の様子
${childName}さんは、本日の${activityLabels[activityType]}に参加しました。
${observation}

◆ 観察と評価
活動を通じて、${childName}さんの積極的な取り組みが見られました。
${notes ? `特に、${notes}という点が印象的でした。` : ''}
今回の活動では、運動スキルの向上だけでなく、社会性の発達においても良い変化が観察されました。

◆ 次回への課題
今回の成功体験を基に、次回はより発展的な活動にチャレンジすることで、
さらなる成長が期待できます。引き続き、本人のペースを大切にしながら
支援を継続していきます。

記録者: ＿＿＿＿＿＿

※ Gemini APIを設定すると、より詳細な記録が自動生成されます`;

            document.getElementById('recordContent').textContent = generatedText;
            lastGeneratedRecord = generatedText;
            lastRecordData = { date, childName, activityType: activityLabels[activityType], observation, notes };
        }

        // Google Driveに保存
        await saveRecordToDrive(childName, date, generatedText, lastRecordData);

    } catch (error) {
        console.error('記録生成エラー:', error);
        document.getElementById('recordContent').innerHTML = `
            <div style="color: #d32f2f;">
                エラーが発生しました: ${error.message}<br>
                <small>APIキーはGitHub Secretsから自動的に注入されます。デプロイ後にご利用ください。</small>
            </div>
        `;
    }
}

// 記録をGoogle Driveに保存
async function saveRecordToDrive(childName, date, content, recordData) {
    if (typeof googleDriveAPI === 'undefined') {
        console.warn('googleDriveAPI が利用できません');
        return null;
    }

    try {
        // Google Drive APIの初期化確認
        if (!googleDriveAPI.isInitialized()) {
            await googleDriveAPI.initialize();
        }

        // HTML形式で保存
        const fileName = `${childName}_記録_${date}.html`;
        const htmlContent = generateRecordHTML(childName, date, content, recordData);

        const driveResult = await googleDriveAPI.saveRecordToStudentFolder(
            childName,
            fileName,
            htmlContent,
            recordData
        );

        if (driveResult.success) {
            console.log('記録をGoogle Driveに保存しました:', driveResult);
            // 保存成功メッセージを表示
            const saveStatus = document.createElement('div');
            saveStatus.style.cssText = 'margin-top: 1rem; padding: 0.75rem; background: #e8f5e9; border-radius: 8px; color: #2e7d32;';
            saveStatus.innerHTML = `✓ Google Driveに保存しました（${driveResult.folder.folderName}フォルダ）`;
            document.getElementById('generatedRecord').appendChild(saveStatus);
        }

        return driveResult;
    } catch (error) {
        console.error('記録のGoogle Drive保存エラー:', error);
        return null;
    }
}

// 記録のHTMLを生成
function generateRecordHTML(childName, date, content, recordData) {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${childName} 活動記録 ${date}</title>
    <style>
        body {
            font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif;
            padding: 40px;
            background-color: #f5f5f5;
            line-height: 1.8;
        }
        .record-sheet {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2e7d32;
        }
        .header h1 {
            color: #2e7d32;
            font-size: 24px;
            margin-bottom: 10px;
        }
        .meta-info {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
        }
        .meta-item {
            display: flex;
            gap: 8px;
        }
        .meta-label {
            font-weight: bold;
            color: #2e7d32;
        }
        .content {
            white-space: pre-wrap;
            color: #333;
        }
        .print-button {
            display: block;
            margin: 20px auto;
            padding: 12px 30px;
            background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
            color: white;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
        }
        @media print {
            .print-button { display: none; }
            body { padding: 0; background: white; }
        }
    </style>
</head>
<body>
    <div class="record-sheet">
        <div class="header">
            <h1>活動記録</h1>
        </div>
        <div class="meta-info">
            <div class="meta-item">
                <span class="meta-label">日付:</span>
                <span>${date}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">児童名:</span>
                <span>${childName}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">活動:</span>
                <span>${recordData.activityType || ''}</span>
            </div>
        </div>
        <div class="content">${content}</div>
        <button class="print-button" onclick="window.print()">印刷する</button>
    </div>
</body>
</html>`;
}

// 支援計画を生成
async function generatePlan(event) {
    event.preventDefault();

    const childName = document.getElementById('planChildName').value;
    const age = document.getElementById('childAge').value;
    const priorityArea = document.getElementById('priorityArea').value;
    const issues = document.getElementById('currentIssues').value;
    const strengths = document.getElementById('strengths').value;
    const parentRequest = document.getElementById('parentRequest').value;

    // アセスメントデータを取得
    const assessmentDataJson = document.getElementById('assessmentDataJson').value;
    let assessmentData = null;
    if (assessmentDataJson) {
        try {
            assessmentData = JSON.parse(assessmentDataJson);
        } catch (e) {
            console.error('Failed to parse assessment data:', e);
        }
    }

    // ローディング表示
    document.getElementById('planContent').innerHTML = '<div style="text-align: center; padding: 2rem;">🔄 AIが支援計画を生成中...</div>';
    document.getElementById('generatedPlan').style.display = 'block';

    try {
        if (geminiAPI.isInitialized()) {
            const planData = {
                childName,
                age,
                priorityArea,
                issues,
                strengths,
                parentRequest,
                assessmentData  // アセスメントデータを追加
            };

            const generatedText = await geminiAPI.generateSupportPlan(planData);
            document.getElementById('planContent').innerHTML = convertMarkdownToHTML(generatedText);

            // 修正用に保存
            lastGeneratedPlan = generatedText;
            lastPlanData = planData;

            // localStorageに支援計画を保存
            const supportPlans = JSON.parse(localStorage.getItem('supportPlans') || '{}');
            const planKey = `${childName}_plan_${Date.now()}`;
            supportPlans[planKey] = {
                childName,
                age,
                priorityArea,
                issues,
                strengths,
                parentRequest,
                generatedText,
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('supportPlans', JSON.stringify(supportPlans));
            console.log('Support plan saved to localStorage:', planKey);
        } else {
            // デフォルトのHTML
            const planHTML = `
        <h4 style="color: #2e7d32; margin-bottom: 1rem;">個別支援計画書</h4>
        
        <div style="margin-bottom: 1.5rem;">
            <strong>対象児童:</strong> ${childName}（${age}歳）<br>
            <strong>作成日:</strong> ${new Date().toLocaleDateString('ja-JP')}
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h5 style="color: #ff9800; margin-bottom: 0.5rem;">📌 短期目標（1-3ヶ月）</h5>
            <ul style="line-height: 1.8;">
                <li>基本的なボールタッチに慣れる</li>
                <li>指示を聞いて行動できる機会を増やす</li>
                <li>${strengths}を活かした活動を中心に自信をつける</li>
            </ul>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h5 style="color: #ff9800; margin-bottom: 0.5rem;">📌 中期目標（3-6ヶ月）</h5>
            <ul style="line-height: 1.8;">
                <li>${issues}の改善に向けた段階的な練習</li>
                <li>ペアやグループでの協力活動への参加</li>
                ${parentRequest ? `<li>${parentRequest}を意識した支援</li>` : ''}
            </ul>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h5 style="color: #ff9800; margin-bottom: 0.5rem;">📌 長期目標（1年）</h5>
            <ul style="line-height: 1.8;">
                <li>チーム活動への積極的な参加</li>
                <li>自己効力感の向上と社会性の発達</li>
                <li>運動スキルの総合的な向上</li>
            </ul>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h5 style="color: #2e7d32; margin-bottom: 0.5rem;">🔧 支援方法</h5>
            <p style="line-height: 1.8;">
                ・スモールステップでの目標設定<br>
                ・${strengths}を活用した活動設計<br>
                ・視覚的な指示と具体的なフィードバック<br>
                ・成功体験の積み重ねによる自信の構築
            </p>
        </div>
    
    <p style="margin-top: 1rem; font-size: 0.85rem; color: #666;">
        ※ Gemini APIを設定すると、より詳細な計画が自動生成されます
    </p>`;
            
            document.getElementById('planContent').innerHTML = planHTML;
        }
    } catch (error) {
        console.error('計画生成エラー:', error);
        document.getElementById('planContent').innerHTML = `
            <div style="color: #d32f2f;">
                エラーが発生しました: ${error.message}<br>
                <small>APIキーはGitHub Secretsから自動的に注入されます。デプロイ後にご利用ください。</small>
            </div>
        `;
    }
}

// 振り返りを生成
async function generateReview(event) {
    event.preventDefault();

    // 手動入力の場合は手動入力フィールドから取得
    let childName = document.getElementById('reviewChildName').value;
    if (childName === '__manual__') {
        childName = document.getElementById('reviewChildNameManual').value;
    }

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const goals = document.getElementById('goals').value;
    const activities = document.getElementById('activities').value;
    const changes = document.getElementById('changes').value;

    // Google Driveから取得したデータ
    const driveAssessmentData = document.getElementById('driveAssessmentData')?.value;
    const driveRecordsData = document.getElementById('driveRecordsData')?.value;

    let assessmentData = null;
    let recordsData = null;

    try {
        if (driveAssessmentData) assessmentData = JSON.parse(driveAssessmentData);
        if (driveRecordsData) recordsData = JSON.parse(driveRecordsData);
    } catch (e) {
        console.warn('Drive data parse error:', e);
    }

    // ローディング表示
    document.getElementById('reviewContent').innerHTML = '<div style="text-align: center; padding: 2rem;">🔄 AIが振り返りレポートを生成中...</div>';
    document.getElementById('generatedReview').style.display = 'block';

    let generatedText = '';

    try {
        if (geminiAPI.isInitialized()) {
            const reviewData = {
                childName,
                startDate,
                endDate,
                goals,
                activities,
                changes,
                assessmentData,  // アセスメントデータを追加
                recordsData      // 記録データを追加
            };

            generatedText = await geminiAPI.generateReview(reviewData);
            document.getElementById('reviewContent').innerHTML = convertMarkdownToHTML(generatedText);

            // 修正用に保存
            lastGeneratedReview = generatedText;
            lastReviewData = reviewData;
        } else {
            // デフォルトのHTML
            const reviewHTML = `
        <h4 style="color: #2e7d32; margin-bottom: 1rem;">成長の振り返りレポート</h4>
        
        <div style="margin-bottom: 1.5rem;">
            <strong>対象児童:</strong> ${childName}<br>
            <strong>評価期間:</strong> ${startDate} 〜 ${endDate}
        </div>
        
        <div style="margin-bottom: 1.5rem; padding: 1rem; background: #e8f5e9; border-radius: 10px;">
            <h5 style="color: #2e7d32; margin-bottom: 0.5rem;">📈 達成度評価</h5>
            <div style="margin-bottom: 0.5rem;">
                <strong>設定目標:</strong> ${goals}
            </div>
            <div style="margin-top: 1rem;">
                <div style="background: white; border-radius: 20px; overflow: hidden; height: 30px;">
                    <div style="background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); width: 75%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                        達成度: 75%
                    </div>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h5 style="color: #ff9800; margin-bottom: 0.5rem;">✨ 観察された成長</h5>
            <p style="line-height: 1.8;">
                ${changes}<br><br>
                期間中の活動（${activities}）を通じて、着実な成長が見られました。
            </p>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h5 style="color: #2e7d32; margin-bottom: 0.5rem;">💪 強みと課題</h5>
            <p style="line-height: 1.8;">
                <strong>強み:</strong> 継続的な参加姿勢、向上心の高さ<br>
                <strong>課題:</strong> より複雑な動作の習得、集中力の持続
            </p>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h5 style="color: #2e7d32; margin-bottom: 0.5rem;">🎯 今後の方向性</h5>
            <p style="line-height: 1.8;">
                これまでの成長を踏まえ、次の段階として以下の支援を推奨します：<br>
                1. 成功体験を活かした、より発展的な課題への挑戦<br>
                2. グループ活動の機会を増やし、社会性の更なる向上<br>
                3. 個人の興味・関心に基づいた活動内容の工夫
            </p>
        </div>
    
    <p style="margin-top: 1rem; font-size: 0.85rem; color: #666;">
        ※ Gemini APIを設定すると、より詳細な分析が自動生成されます
    </p>`;

            document.getElementById('reviewContent').innerHTML = reviewHTML;
            generatedText = reviewHTML;
            lastGeneratedReview = generatedText;
            lastReviewData = { childName, startDate, endDate, goals, activities, changes };
        }

        // Google Driveに自動保存
        await saveReviewToDrive(childName, endDate, generatedText, lastReviewData);

    } catch (error) {
        console.error('振り返り生成エラー:', error);
        document.getElementById('reviewContent').innerHTML = `
            <div style="color: #d32f2f;">
                エラーが発生しました: ${error.message}<br>
                <small>APIキーはGitHub Secretsから自動的に注入されます。デプロイ後にご利用ください。</small>
            </div>
        `;
    }
}

// 振り返りレポートをGoogle Driveに保存
async function saveReviewToDrive(childName, endDate, content, reviewData) {
    if (typeof googleDriveAPI === 'undefined') {
        console.warn('googleDriveAPI が利用できません');
        return null;
    }

    try {
        // Google Drive APIの初期化確認
        if (!googleDriveAPI.isInitialized()) {
            await googleDriveAPI.initialize();
        }

        // HTML形式で保存
        const fileName = `${childName}_振り返りレポート_${endDate}.html`;
        const htmlContent = generateReviewHTML(childName, reviewData, content);

        const driveResult = await googleDriveAPI.saveReviewToStudentFolder(
            childName,
            fileName,
            htmlContent,
            reviewData
        );

        if (driveResult.success) {
            console.log('振り返りレポートをGoogle Driveに保存しました:', driveResult);
            // 保存成功メッセージを表示
            const saveStatus = document.createElement('div');
            saveStatus.style.cssText = 'margin-top: 1rem; padding: 0.75rem; background: #e8f5e9; border-radius: 8px; color: #2e7d32;';
            saveStatus.innerHTML = `✓ Google Driveに保存しました（${driveResult.folder.folderName}フォルダ）`;
            document.getElementById('generatedReview').appendChild(saveStatus);
        }

        return driveResult;
    } catch (error) {
        console.error('振り返りレポートのGoogle Drive保存エラー:', error);
        return null;
    }
}

// 振り返りレポートのHTMLを生成
function generateReviewHTML(childName, reviewData, content) {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${childName} 振り返りレポート ${reviewData.endDate || ''}</title>
    <style>
        body {
            font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif;
            padding: 40px;
            background-color: #f5f5f5;
            line-height: 1.8;
        }
        .review-sheet {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2e7d32;
        }
        .header h1 {
            color: #2e7d32;
            font-size: 24px;
            margin-bottom: 10px;
        }
        .meta-info {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
        }
        .meta-item {
            display: flex;
            gap: 8px;
        }
        .meta-label {
            font-weight: bold;
            color: #2e7d32;
        }
        .content {
            color: #333;
        }
        .print-button {
            display: block;
            margin: 20px auto;
            padding: 12px 30px;
            background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
            color: white;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
        }
        @media print {
            .print-button { display: none; }
            body { padding: 0; background: white; }
        }
    </style>
</head>
<body>
    <div class="review-sheet">
        <div class="header">
            <h1>成長の振り返りレポート</h1>
        </div>
        <div class="meta-info">
            <div class="meta-item">
                <span class="meta-label">児童名:</span>
                <span>${childName}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">評価期間:</span>
                <span>${reviewData.startDate || ''} 〜 ${reviewData.endDate || ''}</span>
            </div>
        </div>
        <div class="content">${content}</div>
        <button class="print-button" onclick="window.print()">印刷する</button>
    </div>
</body>
</html>`;
}

// モーダル外クリックで閉じる
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Gemini API関連の関数
function initializeGeminiAPI() {
    // APIキーを読み込み（config.jsから自動的に読み込まれる）
    geminiAPI.loadApiKey();
    console.log('Gemini API initialization completed. API key will be injected during deployment.');
}

// 記録の修正を依頼
async function refineRecord() {
    const refinementRequest = document.getElementById('recordRefinementRequest').value.trim();

    if (!refinementRequest) {
        alert('修正・追加要望を入力してください');
        return;
    }

    if (!lastGeneratedRecord || !lastRecordData) {
        alert('先に記録を生成してください');
        return;
    }

    // ローディング表示
    document.getElementById('recordContent').innerHTML = '<div style="text-align: center; padding: 2rem;">🔄 AIが記録を修正中...</div>';

    try {
        if (geminiAPI.isInitialized()) {
            const refinedText = await geminiAPI.refineContent(lastGeneratedRecord, refinementRequest, 'record');
            document.getElementById('recordContent').innerHTML = convertMarkdownToHTML(refinedText);

            // 修正後の内容で更新
            lastGeneratedRecord = refinedText;

            // 要望欄をクリア
            document.getElementById('recordRefinementRequest').value = '';
        } else {
            throw new Error('APIキーが設定されていません');
        }
    } catch (error) {
        console.error('記録修正エラー:', error);
        document.getElementById('recordContent').innerHTML = `
            <div style="color: #d32f2f;">
                エラーが発生しました: ${error.message}<br>
                <small>APIキーはGitHub Secretsから自動的に注入されます。デプロイ後にご利用ください。</small>
            </div>
        `;
    }
}

// 支援計画の修正を依頼
async function refinePlan() {
    const refinementRequest = document.getElementById('planRefinementRequest').value.trim();

    if (!refinementRequest) {
        alert('修正・追加要望を入力してください');
        return;
    }

    if (!lastGeneratedPlan || !lastPlanData) {
        alert('先に支援計画を生成してください');
        return;
    }

    // ローディング表示
    document.getElementById('planContent').innerHTML = '<div style="text-align: center; padding: 2rem;">🔄 AIが支援計画を修正中...</div>';

    try {
        if (geminiAPI.isInitialized()) {
            const refinedText = await geminiAPI.refineContent(lastGeneratedPlan, refinementRequest, 'plan');
            document.getElementById('planContent').innerHTML = convertMarkdownToHTML(refinedText);

            // 修正後の内容で更新
            lastGeneratedPlan = refinedText;

            // 要望欄をクリア
            document.getElementById('planRefinementRequest').value = '';
        } else {
            throw new Error('APIキーが設定されていません');
        }
    } catch (error) {
        console.error('支援計画修正エラー:', error);
        document.getElementById('planContent').innerHTML = `
            <div style="color: #d32f2f;">
                エラーが発生しました: ${error.message}<br>
                <small>APIキーはGitHub Secretsから自動的に注入されます。デプロイ後にご利用ください。</small>
            </div>
        `;
    }
}

// 振り返りの修正を依頼
async function refineReview() {
    const refinementRequest = document.getElementById('reviewRefinementRequest').value.trim();

    if (!refinementRequest) {
        alert('修正・追加要望を入力してください');
        return;
    }

    if (!lastGeneratedReview || !lastReviewData) {
        alert('先に振り返りを生成してください');
        return;
    }

    // ローディング表示
    document.getElementById('reviewContent').innerHTML = '<div style="text-align: center; padding: 2rem;">🔄 AIが振り返りレポートを修正中...</div>';

    try {
        if (geminiAPI.isInitialized()) {
            const refinedText = await geminiAPI.refineContent(lastGeneratedReview, refinementRequest, 'review');
            document.getElementById('reviewContent').innerHTML = convertMarkdownToHTML(refinedText);

            // 修正後の内容で更新
            lastGeneratedReview = refinedText;

            // 要望欄をクリア
            document.getElementById('reviewRefinementRequest').value = '';
        } else {
            throw new Error('APIキーが設定されていません');
        }
    } catch (error) {
        console.error('振り返り修正エラー:', error);
        document.getElementById('reviewContent').innerHTML = `
            <div style="color: #d32f2f;">
                エラーが発生しました: ${error.message}<br>
                <small>APIキーはGitHub Secretsから自動的に注入されます。デプロイ後にご利用ください。</small>
            </div>
        `;
    }
}