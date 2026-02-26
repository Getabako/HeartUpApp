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
        title: "ABC分析ケーススタディ",
        category: "case",
        description: "ABC分析を活用した具体的な事例を紹介します。実際の支援場面でのABC分析の適用方法と成果を詳しく解説。",
        date: "2024-09-18",
        tags: ["ABC分析", "事例研究", "ケーススタディ", "実践"],
        filename: "ABC分析ケーススタディ.pdf",
        hasFile: true
    },
    {
        id: 4,
        title: "知能検査",
        category: "aba",
        description: "知能検査の基礎知識と活用方法について解説します。検査結果の読み取り方や支援への活かし方を学びます。",
        date: "2024-10-27",
        tags: ["知能検査", "アセスメント", "発達評価", "支援方法"],
        filename: "知能検査.pdf",
        hasFile: true
    },
    {
        id: 5,
        title: "知能検査ケーススタディ",
        category: "case",
        description: "知能検査を活用した具体的な支援事例を紹介します。検査結果に基づく個別支援計画の立て方と実践例。",
        date: "2024-12-17",
        tags: ["知能検査", "事例研究", "ケーススタディ", "個別支援"],
        filename: "知能検査ケーススタディ.pdf",
        hasFile: true
    },
    {
        id: 6,
        title: "AI講座",
        category: "aba",
        description: "AIを活用した療育支援について学びます。最新のAI技術と療育現場での活用方法を解説。",
        date: "2024-12-22",
        tags: ["AI", "テクノロジー", "療育支援", "最新技術"],
        filename: "AI講座.pdf",
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

/**
 * HTMLコンテンツからPDFを生成
 * @param {string} htmlContent - 完全なHTMLドキュメント
 * @param {string} fileName - ファイル名（拡張子なし）
 * @returns {Promise<Blob>} PDFのBlob
 */
async function generatePDFFromHTML(htmlContent, fileName) {
    // 印刷ボタンを除去したHTMLを作成
    let cleanHTML = htmlContent.replace(/<button[^>]*class="print-button"[^>]*>.*?<\/button>/gi, '');
    cleanHTML = cleanHTML.replace(/<button[^>]*onclick="window\.print\(\)"[^>]*>.*?<\/button>/gi, '');

    // 一時的なdivを作成
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanHTML;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '210mm';  // A4幅
    document.body.appendChild(tempDiv);

    // レンダリングを待つ
    await new Promise(resolve => setTimeout(resolve, 500));

    // PDF生成オプション
    const opt = {
        margin: 10,
        filename: `${fileName}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: true,  // デバッグ用
            allowTaint: true,
            backgroundColor: '#ffffff',
            windowWidth: 800
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        }
    };

    try {
        // PDFをBlobとして生成
        const pdfBlob = await html2pdf().set(opt).from(tempDiv).outputPdf('blob');

        // 一時divを削除
        document.body.removeChild(tempDiv);

        return pdfBlob;
    } catch (error) {
        document.body.removeChild(tempDiv);
        console.error('PDF生成エラー:', error);
        throw error;
    }
}

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
                    if (targetAITab === 'batch-record') {
                        showBatchRecordForm();
                    } else if (targetAITab === 'plan') {
                        showPlanForm();
                    } else if (targetAITab === 'review') {
                        showReviewForm();
                    } else if (targetAITab === 'csv-import') {
                        showCsvImportForm();
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
    // 最初のタブ（一括記録作成）を表示
    showBatchRecordForm();
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
                ${resource.date}
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

    // アップロードされたメニューを結合
    const uploaded = JSON.parse(localStorage.getItem('uploadedPracticeMenus') || '[]');
    let filteredMenus = [...practiceMenus, ...uploaded];

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

        const categoryLabel = getPracticeCategoryLabel(menu.category);
        const difficultyClass = getDifficultyClass(menu.difficulty);

        if (menu.isUploaded) {
            // アップロードされたメニュー
            let footerHTML = '';
            if (menu.videoUrl) {
                const videoId = getYouTubeVideoId(menu.videoUrl);
                if (videoId) {
                    footerHTML += `<button class="btn-video" onclick="event.stopPropagation(); showYouTubeEmbed('${videoId}', '${menu.title.replace(/'/g, "\\'")}')">▶ 動画を見る</button>`;
                } else {
                    footerHTML += `<a href="${menu.videoUrl}" target="_blank" rel="noopener" class="btn-video" onclick="event.stopPropagation()">▶ 動画を見る</a>`;
                }
            }
            if (menu.pdfUrl) {
                footerHTML += `<a href="${menu.pdfUrl}" target="_blank" rel="noopener" class="view-pdf-btn" onclick="event.stopPropagation()">PDFを見る</a>`;
            }
            footerHTML += `<button class="btn-edit-uploaded" onclick="event.stopPropagation(); editUploadedMenu('${menu.id}')">編集</button>`;
            footerHTML += `<button class="btn-delete-menu" onclick="event.stopPropagation(); deleteUploadedMenu('${menu.id}')">削除</button>`;

            card.innerHTML = `
                <div class="practice-header">
                    <span class="practice-category-label">${categoryLabel}</span>
                    <span class="practice-difficulty ${difficultyClass}">${menu.difficulty}</span>
                    <span class="uploaded-badge">追加</span>
                </div>
                <h3>${menu.title}</h3>
                <p>${menu.description}</p>
                <div class="practice-footer" style="gap: 0.5rem; flex-wrap: wrap;">
                    ${footerHTML}
                </div>
            `;
        } else {
            // 標準メニュー - 紐付けられた動画があるかチェック
            const menuVideos = JSON.parse(localStorage.getItem('practiceMenuVideos') || '{}');
            const savedVideoUrl = menuVideos[menu.id] || '';

            let standardFooterHTML = '';
            if (savedVideoUrl) {
                const videoId = getYouTubeVideoId(savedVideoUrl);
                if (videoId) {
                    standardFooterHTML += `<button class="btn-video" onclick="event.stopPropagation(); showYouTubeEmbed('${videoId}', '${menu.title.replace(/'/g, "\\'")}')">▶ 動画</button>`;
                } else {
                    standardFooterHTML += `<a href="${savedVideoUrl}" target="_blank" rel="noopener" class="btn-video" onclick="event.stopPropagation()">▶ 動画</a>`;
                }
                standardFooterHTML += `<button class="btn-edit-video" onclick="event.stopPropagation(); editMenuVideo(${menu.id}, '${menu.title.replace(/'/g, "\\'")}')" title="動画を編集">✏️</button>`;
            } else {
                standardFooterHTML += `<button class="btn-add-video" onclick="event.stopPropagation(); editMenuVideo(${menu.id}, '${menu.title.replace(/'/g, "\\'")}')" title="動画を追加">+ 動画</button>`;
            }
            card.onclick = () => openPracticeMenuPDF(menu);
            card.innerHTML = `
                <div class="practice-header">
                    <span class="practice-category-label">${categoryLabel}</span>
                    <span class="practice-difficulty ${difficultyClass}">${menu.difficulty}</span>
                </div>
                <h3>${menu.title}</h3>
                <p>${menu.description}</p>
                <div class="practice-footer" style="gap: 0.5rem; flex-wrap: wrap;">
                    ${standardFooterHTML}
                </div>
            `;
        }

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
        ? `<button class="btn-primary" onclick="openResourcePDF('${resource.filename}')">資料を開く</button>`
        : `<button class="btn-primary" onclick="alert('この資料のPDFファイルはまだ追加されていません。')">資料を開く</button>`;

    modalBody.innerHTML = `
        <h2 style="color: #2e7d32; margin-bottom: 1rem;">${resource.title}</h2>
        <div style="margin-bottom: 1.5rem;">
            <span class="resource-type">${getCategoryLabel(resource.category)}</span>
            <span style="margin-left: 1rem; color: #666;">${resource.date}</span>
        </div>
        <div style="margin-bottom: 1.5rem;">
            ${resource.tags.map(tag => `<span style="display: inline-block; padding: 0.3rem 0.8rem; background: #e8f5e9; color: #2e7d32; border-radius: 15px; margin-right: 0.5rem; margin-bottom: 0.5rem; font-size: 0.9rem;">#${tag}</span>`).join('')}
        </div>
        <p style="line-height: 1.8; color: #333; margin-bottom: 1.5rem;">${resource.description}</p>
        <div style="padding: 1.5rem; background: #f8f9fa; border-radius: 10px; margin-bottom: 1.5rem;">
            <h3 style="color: #2e7d32; margin-bottom: 1rem;">資料について</h3>
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

    // localStorageからアセスメント一覧を取得（生徒選択用）
    const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
    const supportPlans = JSON.parse(localStorage.getItem('supportPlans') || '{}');
    const studentNames = [...new Set(Object.values(assessments).map(a => a.data?.childName).filter(Boolean))];

    // 生徒選択オプションを生成
    let studentOptions = '<option value="">選択してください</option>';
    studentNames.forEach(name => {
        studentOptions += `<option value="${name}">${name}</option>`;
    });

    container.innerHTML = `
        <form onsubmit="generateRecord(event)">
            <div class="form-group">
                <label>日付</label>
                <input type="date" id="recordDate" required value="${new Date().toISOString().split('T')[0]}">
            </div>

            <div class="form-group">
                <label>対象児童名</label>
                <div class="student-select-container">
                    <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
                        <input type="text" id="childNameSearch" placeholder="名前で検索..." oninput="filterRecordStudentOptions(this.value)" style="flex: 1;">
                        <button type="button" class="sync-btn" onclick="syncStudentDataFromDrive()" style="padding: 0.5rem 1rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;">
                            <span class="sync-icon">↻</span> 更新
                        </button>
                    </div>
                    <select id="childNameSelect" required onchange="onRecordStudentSelect(this.value)">
                        ${studentOptions}
                        <option value="__manual__">手動で入力</option>
                    </select>
                    <input type="text" id="childName" placeholder="児童名を入力" style="display: none; margin-top: 0.5rem;">
                </div>
            </div>

            <div id="recordAssessmentInfo" style="display: none; background: #e8f5e9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;"></div>

            <input type="hidden" id="supportPlanDataJson" value=''>
            
            <div class="form-group">
                <label>活動内容（複数選択可）</label>
                <div class="activity-checkboxes" id="activityTypeCheckboxes">
                    <label><input type="checkbox" name="activityType" value="warmup"><span>ウォーミングアップ</span></label>
                    <label><input type="checkbox" name="activityType" value="individual"><span>個別練習</span></label>
                    <label><input type="checkbox" name="activityType" value="group"><span>グループ活動</span></label>
                    <label><input type="checkbox" name="activityType" value="game"><span>ミニゲーム</span></label>
                    <label><input type="checkbox" name="activityType" value="skill"><span>スキル練習</span></label>
                    <label><input type="checkbox" name="activityType" value="cooldown"><span>クールダウン</span></label>
                    <label><input type="checkbox" name="activityType" value="event"><span>イベント</span></label>
                    <label><input type="checkbox" name="activityType" value="other"><span>その他</span></label>
                </div>
                <p style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">※1つ以上選択してください</p>
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
                <button class="btn-primary" onclick="saveRecordManually()">保存</button>
                <button class="btn-secondary" onclick="printRecord()">PDF出力</button>
            </div>
            <div id="recordSaveStatus" style="margin-top: 0.5rem;"></div>

            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e0e0e0;">
                <h4 style="color: #2e7d32; margin-bottom: 1rem;">修正・追加要望</h4>
                <div class="form-group">
                    <textarea id="recordRefinementRequest" placeholder="例: もっと具体的な表現にしてください、保護者向けに優しい言葉で書き直してください、5領域の評価をより詳しく記載してください" style="min-height: 100px;"></textarea>
                </div>
                <button class="btn-primary" onclick="refineRecord()">修正を依頼</button>
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

    // localStorageからアセスメント一覧を取得（生徒選択用）
    const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
    const studentNames = [...new Set(Object.values(assessments).map(a => a.data?.childName).filter(Boolean))];

    // 生徒選択オプションを生成
    let studentOptions = '<option value="">選択してください</option>';
    studentNames.forEach(name => {
        const selected = (name === childNameParam) ? 'selected' : '';
        studentOptions += `<option value="${name}" ${selected}>${name}</option>`;
    });

    container.innerHTML = `
        <form onsubmit="generatePlan(event)">
            <div class="form-group">
                <label>対象児童名</label>
                <div class="student-select-container">
                    <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
                        <input type="text" id="planChildNameSearch" placeholder="名前で検索..." oninput="filterPlanStudentOptions(this.value)" style="flex: 1;">
                        <button type="button" class="sync-btn" onclick="syncStudentDataFromDrive()" style="padding: 0.5rem 1rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;">
                            <span class="sync-icon">↻</span> 更新
                        </button>
                    </div>
                    <select id="planChildNameSelect" required onchange="onPlanStudentSelect(this.value)">
                        ${studentOptions}
                        <option value="__manual__">手動で入力</option>
                    </select>
                    <input type="text" id="planChildName" placeholder="児童名を入力" style="display: none; margin-top: 0.5rem;">
                </div>
            </div>

            <div id="planAssessmentInfo" style="display: none; background: #e8f5e9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;"></div>

            <div class="form-group">
                <label>年齢</label>
                <input type="number" id="childAge" min="3" max="18" placeholder="例: 8" required>
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

            <div class="form-group">
                <label>出力形式</label>
                <select id="planOutputFormat">
                    <option value="standard">標準形式</option>
                    <option value="official-support">公式様式（専門的支援実施計画）</option>
                    <option value="official-individual">公式様式（個別支援計画）</option>
                </select>
            </div>

            <input type="hidden" id="assessmentDataJson" value=''>

            <div style="display: flex; gap: 1rem;">
                <button type="submit" class="btn-primary">計画を生成</button>
                <button type="button" class="btn-secondary" onclick="closeToolDetail()">キャンセル</button>
            </div>
        </form>

        <div id="generatedPlan" style="margin-top: 2rem; display: none;">
            <h3 style="color: #2e7d32; margin-bottom: 1rem;">生成された支援計画</h3>
            <div style="padding: 1.5rem; background: #f8f9fa; border-radius: 10px;" id="planContent"></div>
            <div style="margin-top: 1rem; display: flex; gap: 1rem;">
                <button class="btn-primary" onclick="saveSupportPlanManually()">保存</button>
                <button class="btn-secondary" onclick="printSupportPlan()">PDF出力</button>
            </div>
            <div id="planSaveStatus" style="margin-top: 0.5rem;"></div>

            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e0e0e0;">
                <h4 style="color: #2e7d32; margin-bottom: 1rem;">修正・追加要望</h4>
                <div class="form-group">
                    <textarea id="planRefinementRequest" placeholder="例: 短期目標をもっと具体的にしてください、家族支援計画を充実させてください、優先課題領域に焦点を当ててください" style="min-height: 100px;"></textarea>
                </div>
                <button class="btn-primary" onclick="refinePlan()">修正を依頼</button>
            </div>
        </div>
    `;

    // URLパラメータで生徒名が指定されている場合、自動選択
    if (childNameParam) {
        setTimeout(() => {
            onPlanStudentSelect(childNameParam);
        }, 100);
    }
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
                <div class="student-select-container">
                    <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
                        <input type="text" id="reviewChildNameSearch" placeholder="名前で検索..." oninput="filterReviewStudentOptions(this.value)" style="flex: 1;">
                        <button type="button" class="sync-btn" onclick="syncStudentDataFromDrive()" style="padding: 0.5rem 1rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;">
                            <span class="sync-icon">↻</span> 更新
                        </button>
                    </div>
                    <select id="reviewChildNameSelect" required onchange="loadStudentDataForReview(this.value)">
                        ${studentOptions}
                        <option value="__manual__">手動で入力</option>
                    </select>
                    <input type="text" id="reviewChildNameManual" placeholder="児童名を入力" style="display: none; margin-top: 0.5rem;">
                </div>
            </div>

            <div id="driveDataStatus" style="display: none; margin-bottom: 1rem; padding: 1rem; background: #e3f2fd; border-radius: 8px;">
                <strong>Google Driveからデータを読み込み中...</strong>
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
                <button class="btn-primary" onclick="saveReviewManually()">保存</button>
                <button class="btn-secondary" onclick="printReview()">印刷</button>
            </div>

            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e0e0e0;">
                <h4 style="color: #2e7d32; margin-bottom: 1rem;">修正・追加要望</h4>
                <div class="form-group">
                    <textarea id="reviewRefinementRequest" placeholder="例: 各領域の成長をもっと詳しく分析してください、保護者へのメッセージを充実させてください、具体的な数値や事例を追加してください" style="min-height: 100px;"></textarea>
                </div>
                <button class="btn-primary" onclick="refineReview()">修正を依頼</button>
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
            statusDiv.innerHTML = '<strong>Google Driveからデータを読み込み中...</strong>';

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

                statusDiv.innerHTML = `<strong>データを読み込みました</strong><br>
                    アセスメント: ${studentData.assessments.length}件、記録: ${studentData.records.length}件`;
                statusDiv.style.background = '#e8f5e9';
            } else {
                statusDiv.innerHTML = '<strong>データの取得に失敗しました</strong>';
                statusDiv.style.background = '#fff3e0';
            }
        } catch (error) {
            console.error('Google Driveデータ取得エラー:', error);
            statusDiv.innerHTML = '<strong>Google Driveに接続できません（手動入力をご利用ください）</strong>';
            statusDiv.style.background = '#fff3e0';
        }
    } else {
        // localStorageからデータを取得
        const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
        const matchingAssessment = Object.values(assessments).find(a => a.data?.childName === studentName);

        if (matchingAssessment) {
            document.getElementById('driveAssessmentData').value = JSON.stringify([{ data: matchingAssessment.data }]);
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = '<strong>ローカルデータを読み込みました</strong>';
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
    // プルダウンまたは手動入力から生徒名を取得
    const selectValue = document.getElementById('childNameSelect').value;
    const childName = (selectValue === '__manual__')
        ? document.getElementById('childName').value
        : selectValue;

    // チェックボックスから選択された活動を取得（複数選択対応）
    const selectedActivities = [];
    document.querySelectorAll('#activityTypeCheckboxes input[type="checkbox"]:checked').forEach(checkbox => {
        selectedActivities.push(checkbox.value);
    });

    // 活動が選択されているか確認
    if (selectedActivities.length === 0) {
        alert('活動内容を1つ以上選択してください');
        return;
    }

    const observation = document.getElementById('observation').value;
    const notes = document.getElementById('notes').value;

    const activityLabels = {
        'warmup': 'ウォーミングアップ',
        'individual': '個別練習',
        'group': 'グループ活動',
        'game': 'ミニゲーム',
        'skill': 'スキル練習',
        'cooldown': 'クールダウン',
        'event': 'イベント',
        'other': 'その他'
    };

    // 選択された活動のラベルを取得
    const activityTypeLabels = selectedActivities.map(a => activityLabels[a] || a).join('、');

    // ローディング表示
    document.getElementById('recordContent').innerHTML = '<div class="ai-loading"><img src="soccerball.png" alt="読み込み中" class="ai-loading-ball"><span class="ai-loading-text">AIが記録を生成中...</span></div>';
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
                activityType: activityTypeLabels,
                activities: selectedActivities,
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
活動内容: ${activityTypeLabels}

◆ 活動の様子
${childName}さんは、本日の${activityTypeLabels}に参加しました。
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
            lastRecordData = { date, childName, activityType: activityTypeLabels, activities: selectedActivities, observation, notes };
        }

        // Google Driveに保存
        await saveRecordToDrive(childName, date, generatedText, lastRecordData);

    } catch (error) {
        console.error('記録生成エラー:', error);
        document.getElementById('recordContent').innerHTML = `
            <div style="color: #d32f2f;">
                エラーが発生しました: ${error.message}<br>
                <small>APIキーはVercel環境変数から自動的に注入されます。</small>
            </div>
        `;
    }
}

// 記録をGoogle Driveに保存（HTML形式）
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
            saveStatus.innerHTML = `Google Driveに保存しました（${driveResult.folder.folderName}フォルダ）`;
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
    const formattedContent = convertMarkdownToHTML(content);
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
            color: #333;
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
            font-size: 28px;
            margin-bottom: 10px;
        }
        .meta-info {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
            border-radius: 12px;
            border-left: 4px solid #2e7d32;
        }
        .meta-item {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        .meta-label {
            font-weight: bold;
            color: #2e7d32;
        }
        .content {
            color: #333;
        }
        .content h1, .content h2, .content h3, .content h4 {
            color: #2e7d32;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }
        .content h2 {
            font-size: 1.4rem;
            border-bottom: 2px solid #4caf50;
            padding-bottom: 0.5rem;
            margin-top: 2.5rem;
        }
        .content h3 {
            font-size: 1.2rem;
            border-left: 4px solid #4caf50;
            padding-left: 12px;
            margin-top: 2rem;
        }
        .section-box {
            background: #fafafa;
            border-radius: 8px;
            padding: 20px;
            margin: 1.5rem 0;
            border: 1px solid #e0e0e0;
        }
        .highlight-box {
            background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
            border-radius: 8px;
            padding: 15px 20px;
            margin: 1rem 0;
            border-left: 4px solid #ff9800;
        }
        .print-button {
            display: block;
            margin: 30px auto;
            padding: 12px 30px;
            background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
            color: white;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
        }
        .print-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        }
        @media print {
            .print-button { display: none; }
            body { padding: 0; margin: 0; background: white; }
            .record-sheet { 
                max-width: 100%; margin: 0; padding: 20px; box-shadow: none; 
            }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
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
        <div class="content">${formattedContent}</div>
        <button class="print-button" onclick="window.print()">印刷する</button>
    </div>
</body>
</html>`;
}

// 記録を手動保存
async function saveRecordManually() {
    if (!lastGeneratedRecord || !lastRecordData) {
        alert('先に記録を生成してください');
        return;
    }

    const childName = lastRecordData.childName;
    const date = lastRecordData.date;
    const statusDiv = document.getElementById('recordSaveStatus');

    try {
        statusDiv.innerHTML = '<div style="padding: 0.5rem; background: #e3f2fd; border-radius: 8px; color: #1565c0;">Google Driveに保存中...</div>';

        const result = await saveRecordToDrive(childName, date, lastGeneratedRecord, lastRecordData);

        if (result && result.success) {
            statusDiv.innerHTML = `<div style="padding: 0.75rem; background: #e8f5e9; border-radius: 8px; color: #2e7d32;">Google Driveに保存しました（${result.folder.folderName}フォルダ）</div>`;
        } else {
            statusDiv.innerHTML = '<div style="padding: 0.5rem; background: #fff3e0; border-radius: 8px; color: #e65100;">保存に失敗しました</div>';
        }
    } catch (error) {
        console.error('記録保存エラー:', error);
        statusDiv.innerHTML = `<div style="padding: 0.5rem; background: #ffebee; border-radius: 8px; color: #c62828;">エラー: ${error.message}</div>`;
    }
}

// 記録を印刷
function printRecord() {
    const recordContent = document.getElementById('recordContent').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>活動記録</title>
            <style>
                body { font-family: 'Hiragino Kaku Gothic ProN', sans-serif; padding: 40px; line-height: 1.8; }
            </style>
        </head>
        <body>
            <h1 style="color: #2e7d32; text-align: center; border-bottom: 3px solid #2e7d32; padding-bottom: 10px;">活動記録</h1>
            ${recordContent}
            <script>window.print(); window.close();</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// 支援計画を生成
async function generatePlan(event) {
    event.preventDefault();

    // プルダウンまたは手動入力から生徒名を取得
    const selectValue = document.getElementById('planChildNameSelect').value;
    const childName = (selectValue === '__manual__')
        ? document.getElementById('planChildName').value
        : selectValue;
    const age = document.getElementById('childAge').value;
    const priorityArea = document.getElementById('priorityArea').value;
    const issues = document.getElementById('currentIssues').value;
    const strengths = document.getElementById('strengths').value;
    const parentRequest = document.getElementById('parentRequest').value;
    const outputFormat = document.getElementById('planOutputFormat')?.value || 'standard';

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
    document.getElementById('planContent').innerHTML = '<div class="ai-loading"><img src="soccerball.png" alt="読み込み中" class="ai-loading-ball"><span class="ai-loading-text">AIが支援計画を生成中...</span></div>';
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

            // 出力形式に応じて異なる生成処理を実行
            let generatedText;
            if (outputFormat === 'official-support') {
                // 公式様式（専門的支援実施計画）
                const assessmentSummary = assessmentData ? JSON.stringify(assessmentData, null, 2) : `課題: ${issues}\n強み: ${strengths}`;
                const officialData = await geminiAPI.generateOfficialSupportPlan({
                    childName,
                    diagnosis: assessmentData?.diagnosis || '',
                    certificateNumber: assessmentData?.certificateNumber || '',
                    supportPeriod: `${new Date().getFullYear()}年${new Date().getMonth() + 1}月〜`,
                    assessmentSummary
                });
                generatedText = renderOfficialSupportPlan(childName, officialData);
                window.lastOfficialPlanData = { type: 'support', data: officialData, childName };
            } else if (outputFormat === 'official-individual') {
                // 公式様式（個別支援計画）
                const assessmentSummary = assessmentData ? JSON.stringify(assessmentData, null, 2) : `課題: ${issues}\n強み: ${strengths}`;
                const today = new Date();
                const endDate = new Date(today);
                endDate.setMonth(endDate.getMonth() + 6);
                const officialData = await geminiAPI.generateOfficialIndividualPlan({
                    childName,
                    diagnosis: assessmentData?.diagnosis || '',
                    certificateNumber: assessmentData?.certificateNumber || '',
                    startDate: today.toLocaleDateString('ja-JP'),
                    endDate: endDate.toLocaleDateString('ja-JP'),
                    assessmentSummary
                });
                generatedText = renderOfficialIndividualPlan(childName, officialData);
                window.lastOfficialPlanData = { type: 'individual', data: officialData, childName };
            } else {
                // 標準形式
                generatedText = await geminiAPI.generateSupportPlan(planData);
                window.lastOfficialPlanData = null;
            }

            const renderedText = (outputFormat === 'standard') ? convertMarkdownToHTML(generatedText) : generatedText;
            document.getElementById('planContent').innerHTML = renderedText;

            // 修正用に保存
            lastGeneratedPlan = generatedText;
            lastPlanData = planData;
            lastPlanData.outputFormat = outputFormat;

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
                outputFormat,
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
            <h5 style="color: #ff9800; margin-bottom: 0.5rem;">短期目標（1-3ヶ月）</h5>
            <ul style="line-height: 1.8;">
                <li>基本的なボールタッチに慣れる</li>
                <li>指示を聞いて行動できる機会を増やす</li>
                <li>${strengths}を活かした活動を中心に自信をつける</li>
            </ul>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h5 style="color: #ff9800; margin-bottom: 0.5rem;">中期目標（3-6ヶ月）</h5>
            <ul style="line-height: 1.8;">
                <li>${issues}の改善に向けた段階的な練習</li>
                <li>ペアやグループでの協力活動への参加</li>
                ${parentRequest ? `<li>${parentRequest}を意識した支援</li>` : ''}
            </ul>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h5 style="color: #ff9800; margin-bottom: 0.5rem;">長期目標（1年）</h5>
            <ul style="line-height: 1.8;">
                <li>チーム活動への積極的な参加</li>
                <li>自己効力感の向上と社会性の発達</li>
                <li>運動スキルの総合的な向上</li>
            </ul>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h5 style="color: #2e7d32; margin-bottom: 0.5rem;">支援方法</h5>
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
                <small>APIキーはVercel環境変数から自動的に注入されます。</small>
            </div>
        `;
    }
}

// 振り返りを生成
async function generateReview(event) {
    event.preventDefault();

    // 手動入力の場合は手動入力フィールドから取得
    let childName = document.getElementById('reviewChildNameSelect').value;
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
    document.getElementById('reviewContent').innerHTML = '<div class="ai-loading"><img src="soccerball.png" alt="読み込み中" class="ai-loading-ball"><span class="ai-loading-text">AIが振り返りレポートを生成中...</span></div>';
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
            <h5 style="color: #2e7d32; margin-bottom: 0.5rem;">達成度評価</h5>
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
            <h5 style="color: #ff9800; margin-bottom: 0.5rem;">観察された成長</h5>
            <p style="line-height: 1.8;">
                ${changes}<br><br>
                期間中の活動（${activities}）を通じて、着実な成長が見られました。
            </p>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h5 style="color: #2e7d32; margin-bottom: 0.5rem;">強みと課題</h5>
            <p style="line-height: 1.8;">
                <strong>強み:</strong> 継続的な参加姿勢、向上心の高さ<br>
                <strong>課題:</strong> より複雑な動作の習得、集中力の持続
            </p>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h5 style="color: #2e7d32; margin-bottom: 0.5rem;">今後の方向性</h5>
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
                <small>APIキーはVercel環境変数から自動的に注入されます。</small>
            </div>
        `;
    }
}

// 振り返りレポートをGoogle Driveに保存（HTML形式）
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
            saveStatus.innerHTML = `Google Driveに保存しました（${driveResult.folder.folderName}フォルダ）`;
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
    const formattedContent = convertMarkdownToHTML(content);
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
            color: #333;
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
            font-size: 28px;
            margin-bottom: 10px;
        }
        .meta-info {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
            border-radius: 12px;
            border-left: 4px solid #2e7d32;
        }
        .meta-item {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        .meta-label {
            font-weight: bold;
            color: #2e7d32;
        }
        .content {
            color: #333;
        }
        .content h1, .content h2, .content h3, .content h4 {
            color: #2e7d32;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }
        .content h2 {
            font-size: 1.4rem;
            border-bottom: 2px solid #4caf50;
            padding-bottom: 0.5rem;
            margin-top: 2.5rem;
        }
        .content h3 {
            font-size: 1.2rem;
            border-left: 4px solid #4caf50;
            padding-left: 12px;
            margin-top: 2rem;
        }
        .print-button {
            display: block;
            margin: 30px auto;
            padding: 12px 30px;
            background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
            color: white;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
        }
        .print-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        }
        @media print {
            .print-button { display: none; }
            body { padding: 0; margin: 0; background: white; }
            .review-sheet { 
                max-width: 100%; margin: 0; padding: 20px; box-shadow: none; 
            }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
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
        <div class="content">${formattedContent}</div>
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
    document.getElementById('recordContent').innerHTML = '<div class="ai-loading"><img src="soccerball.png" alt="読み込み中" class="ai-loading-ball"><span class="ai-loading-text">AIが記録を修正中...</span></div>';

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
                <small>APIキーはVercel環境変数から自動的に注入されます。</small>
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
    document.getElementById('planContent').innerHTML = '<div class="ai-loading"><img src="soccerball.png" alt="読み込み中" class="ai-loading-ball"><span class="ai-loading-text">AIが支援計画を修正中...</span></div>';

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
                <small>APIキーはVercel環境変数から自動的に注入されます。</small>
            </div>
        `;
    }
}

// 支援計画を手動保存
async function saveSupportPlanManually() {
    if (!lastGeneratedPlan || !lastPlanData) {
        alert('先に支援計画を生成してください');
        return;
    }

    const childName = lastPlanData.childName;
    const statusDiv = document.getElementById('planSaveStatus');

    try {
        statusDiv.innerHTML = '<div style="padding: 0.5rem; background: #e3f2fd; border-radius: 8px; color: #1565c0;">Google Driveに保存中...</div>';

        const result = await saveSupportPlanToDrive(childName, lastGeneratedPlan, lastPlanData);

        if (result && result.success) {
            statusDiv.innerHTML = `<div style="padding: 0.75rem; background: #e8f5e9; border-radius: 8px; color: #2e7d32;">Google Driveに保存しました（${result.folder.folderName}フォルダ）</div>`;
        } else {
            statusDiv.innerHTML = '<div style="padding: 0.5rem; background: #fff3e0; border-radius: 8px; color: #e65100;">保存に失敗しました。ローカルには保存されています。</div>';
        }
    } catch (error) {
        console.error('支援計画保存エラー:', error);
        statusDiv.innerHTML = `<div style="padding: 0.5rem; background: #ffebee; border-radius: 8px; color: #c62828;">エラー: ${error.message}</div>`;
    }
}

// 支援計画をGoogle Driveに保存（HTML形式）
async function saveSupportPlanToDrive(childName, content, planData) {
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
        const today = new Date().toISOString().split('T')[0];
        const fileName = `${childName}_支援計画_${today}.html`;
        const htmlContent = generateSupportPlanHTML(childName, planData, content);

        const driveResult = await googleDriveAPI.saveSupportPlanToStudentFolder(
            childName,
            fileName,
            htmlContent,
            planData
        );

        if (driveResult.success) {
            console.log('支援計画をGoogle Driveに保存しました:', driveResult);

            // localStorageにも保存
            const supportPlans = JSON.parse(localStorage.getItem('supportPlans') || '{}');
            supportPlans[fileName] = {
                html: htmlContent,
                data: planData,
                content: content,
                createdAt: new Date().toISOString(),
                driveFileId: driveResult.html.fileId
            };
            localStorage.setItem('supportPlans', JSON.stringify(supportPlans));
        }

        return driveResult;
    } catch (error) {
        console.error('支援計画のGoogle Drive保存エラー:', error);
        return null;
    }
}

// 支援計画のHTMLを生成
function generateSupportPlanHTML(childName, planData, content) {
    const formattedContent = convertMarkdownToHTML(content);
    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${childName} 支援計画</title>
    <style>
        body {
            font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif;
            padding: 40px;
            background-color: #f5f5f5;
            line-height: 1.8;
            color: #333;
        }
        .plan-sheet {
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
            font-size: 28px;
            margin-bottom: 10px;
        }
        .meta-info {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
            border-radius: 12px;
            border-left: 4px solid #2e7d32;
        }
        .meta-item {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        .meta-label {
            font-weight: bold;
            color: #2e7d32;
        }
        .content {
            color: #333;
        }
        .content h1, .content h2, .content h3, .content h4 {
            color: #2e7d32;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }
        .content h2 {
            font-size: 1.4rem;
            border-bottom: 2px solid #4caf50;
            padding-bottom: 0.5rem;
            margin-top: 2.5rem;
        }
        .content h3 {
            font-size: 1.2rem;
            border-left: 4px solid #4caf50;
            padding-left: 12px;
            margin-top: 2rem;
        }
        .print-button {
            display: block;
            margin: 30px auto;
            padding: 12px 30px;
            background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
            color: white;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
        }
        .print-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        }
        @media print {
            .print-button { display: none; }
            body { padding: 0; margin: 0; background: white; }
            .plan-sheet { 
                max-width: 100%; margin: 0; padding: 20px; box-shadow: none; 
            }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
        }
    </style>
</head>
<body>
    <div class="plan-sheet">
        <div class="header">
            <h1>個別支援計画</h1>
        </div>
        <div class="meta-info">
            <div class="meta-item">
                <span class="meta-label">児童名:</span>
                <span>${childName}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">年齢:</span>
                <span>${planData.age || ''}歳</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">作成日:</span>
                <span>${new Date().toLocaleDateString('ja-JP')}</span>
            </div>
        </div>
        <div class="content">${formattedContent}</div>
        <button class="print-button" onclick="window.print()">印刷する</button>
    </div>
</body>
</html>`;
}

// 支援計画を印刷
function printSupportPlan() {
    const planContent = document.getElementById('planContent').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>支援計画</title>
            <style>
                body { font-family: 'Hiragino Kaku Gothic ProN', sans-serif; padding: 40px; line-height: 1.8; }
            </style>
        </head>
        <body>
            <h1 style="color: #2e7d32; text-align: center; border-bottom: 3px solid #2e7d32; padding-bottom: 10px;">個別支援計画</h1>
            ${planContent}
            <script>window.print(); window.close();</script>
        </body>
        </html>
    `);
    printWindow.document.close();
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
    document.getElementById('reviewContent').innerHTML = '<div class="ai-loading"><img src="soccerball.png" alt="読み込み中" class="ai-loading-ball"><span class="ai-loading-text">AIが振り返りレポートを修正中...</span></div>';

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
                <small>APIキーはVercel環境変数から自動的に注入されます。</small>
            </div>
        `;
    }
}

// ========================================
// API設定モーダル関連の関数
// ========================================

// API設定モーダルを開く
function openApiSettingsModal() {
    const modal = document.getElementById('apiSettingsModal');
    modal.classList.remove('hidden');

    // 現在のステータスを更新
    updateApiStatus();

    // 保存済みのAPIキーがあれば入力欄に表示（マスク）
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
        document.getElementById('geminiApiKeyInput').value = savedKey;
    }
}

// API設定モーダルを閉じる
function closeApiSettingsModal() {
    const modal = document.getElementById('apiSettingsModal');
    modal.classList.add('hidden');
}

// APIステータスを更新
function updateApiStatus() {
    const statusDiv = document.getElementById('apiStatus');
    const isConfigured = geminiAPI.isInitialized();

    if (isConfigured) {
        statusDiv.innerHTML = `
            <div style="padding: 1rem; background: #e8f5e9; border-radius: 8px; margin-bottom: 1rem; color: #2e7d32;">
                <strong>APIキーが設定されています</strong><br>
                <small>AI機能が利用可能です</small>
            </div>
        `;
    } else {
        statusDiv.innerHTML = `
            <div style="padding: 1rem; background: #fff3e0; border-radius: 8px; margin-bottom: 1rem; color: #e65100;">
                <strong>APIキーが未設定です</strong><br>
                <small>AI機能を使用するにはAPIキーを設定してください</small>
            </div>
        `;
    }
}

// APIキーを保存
function saveApiKey() {
    const apiKeyInput = document.getElementById('geminiApiKeyInput');
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
        alert('APIキーを入力してください');
        return;
    }

    if (!apiKey.startsWith('AIza')) {
        alert('無効なAPIキー形式です。Gemini APIキーは「AIza」で始まります。');
        return;
    }

    // APIキーを設定
    const success = geminiAPI.setApiKey(apiKey);

    if (success) {
        updateApiStatus();
        alert('APIキーを保存しました');
    } else {
        alert('APIキーの保存に失敗しました');
    }
}

// APIキーをテスト
async function testApiKey() {
    const apiKeyInput = document.getElementById('geminiApiKeyInput');
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
        alert('APIキーを入力してください');
        return;
    }

    const statusDiv = document.getElementById('apiStatus');
    statusDiv.innerHTML = `
        <div style="padding: 1rem; background: #e3f2fd; border-radius: 8px; margin-bottom: 1rem; color: #1565c0;">
            <strong>APIキーをテスト中...</strong>
        </div>
    `;

    try {
        // 一時的にAPIキーを設定してテスト
        const originalKey = geminiAPI.apiKey;
        geminiAPI.apiKey = apiKey;
        geminiAPI.initialized = true;

        const testResult = await geminiAPI.generateContent('こんにちは、テストです。「OK」と返答してください。');

        // テスト成功
        statusDiv.innerHTML = `
            <div style="padding: 1rem; background: #e8f5e9; border-radius: 8px; margin-bottom: 1rem; color: #2e7d32;">
                <strong>APIキーは有効です！</strong><br>
                <small>テスト応答: ${testResult.substring(0, 50)}...</small>
            </div>
        `;

        // 元に戻す（保存は別途行う）
        if (!originalKey) {
            geminiAPI.apiKey = originalKey;
            geminiAPI.initialized = false;
        }

    } catch (error) {
        console.error('APIテストエラー:', error);
        statusDiv.innerHTML = `
            <div style="padding: 1rem; background: #ffebee; border-radius: 8px; margin-bottom: 1rem; color: #c62828;">
                <strong>APIキーが無効です</strong><br>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// APIキーを削除
function clearApiKey() {
    if (confirm('APIキーを削除しますか？AI機能が使用できなくなります。')) {
        localStorage.removeItem('gemini_api_key');
        geminiAPI.apiKey = null;
        geminiAPI.initialized = false;

        document.getElementById('geminiApiKeyInput').value = '';
        updateApiStatus();
        alert('APIキーを削除しました');
    }
}

// モーダル外クリックで閉じる（API設定モーダル用）
document.addEventListener('click', function(event) {
    const apiModal = document.getElementById('apiSettingsModal');
    if (event.target === apiModal) {
        closeApiSettingsModal();
    }
});

// ============================================
// 記録作成フォーム用の生徒選択機能
// ============================================

// 記録作成用の生徒選択肢をフィルタリング
function filterRecordStudentOptions(searchText) {
    const select = document.getElementById('childNameSelect');
    const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
    const allNames = [...new Set(Object.values(assessments).map(a => a.data?.childName).filter(Boolean))];

    // 検索テキストで絞り込み
    const filtered = searchText
        ? allNames.filter(name => name.includes(searchText))
        : allNames;

    // オプションを再構築
    let options = '<option value="">選択してください</option>';
    filtered.forEach(name => {
        options += `<option value="${name}">${name}</option>`;
    });
    options += '<option value="__manual__">手動で入力</option>';

    select.innerHTML = options;
}

// 記録作成用の生徒選択時の処理
function onRecordStudentSelect(value) {
    const manualInput = document.getElementById('childName');
    const infoDiv = document.getElementById('recordAssessmentInfo');
    const supportPlanJson = document.getElementById('supportPlanDataJson');

    if (value === '__manual__') {
        // 手動入力モード
        manualInput.style.display = 'block';
        manualInput.required = true;
        document.getElementById('childNameSelect').required = false;
        infoDiv.style.display = 'none';
        supportPlanJson.value = '';
    } else if (value) {
        // 生徒を選択
        manualInput.style.display = 'none';
        manualInput.required = false;
        manualInput.value = value;
        document.getElementById('childNameSelect').required = true;

        // アセスメント情報を読み込み
        const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
        const supportPlans = JSON.parse(localStorage.getItem('supportPlans') || '{}');

        let assessmentData = null;
        for (const [key, assessment] of Object.entries(assessments)) {
            if (assessment.data?.childName === value) {
                assessmentData = assessment.data;
                break;
            }
        }

        // 支援計画を取得
        let supportPlanData = null;
        for (const [key, plan] of Object.entries(supportPlans)) {
            if (plan.childName === value) {
                supportPlanData = plan;
                break;
            }
        }

        if (assessmentData || supportPlanData) {
            let info = '<strong>読み込まれた情報:</strong><br>';
            if (assessmentData) {
                info += `• アセスメント: ${assessmentData.childName}`;
                if (assessmentData.birthDate) {
                    const age = calculateAge(assessmentData.birthDate);
                    info += ` (${age}歳)`;
                }
                info += '<br>';
            }
            if (supportPlanData) {
                info += `• 支援計画あり（目標連携可能）<br>`;
            }
            infoDiv.innerHTML = info;
            infoDiv.style.display = 'block';
        } else {
            infoDiv.style.display = 'none';
        }

        // 支援計画データを保存
        if (supportPlanData) {
            supportPlanJson.value = JSON.stringify(supportPlanData).replace(/'/g, "&apos;");
        } else {
            supportPlanJson.value = '';
        }
    } else {
        manualInput.style.display = 'none';
        manualInput.required = false;
        infoDiv.style.display = 'none';
        supportPlanJson.value = '';
    }
}

// ============================================
// 支援計画フォーム用の生徒選択機能
// ============================================

// 支援計画用の生徒選択肢をフィルタリング
function filterPlanStudentOptions(searchText) {
    const select = document.getElementById('planChildNameSelect');
    const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
    const allNames = [...new Set(Object.values(assessments).map(a => a.data?.childName).filter(Boolean))];

    // 検索テキストで絞り込み
    const filtered = searchText
        ? allNames.filter(name => name.includes(searchText))
        : allNames;

    // オプションを再構築
    let options = '<option value="">選択してください</option>';
    filtered.forEach(name => {
        options += `<option value="${name}">${name}</option>`;
    });
    options += '<option value="__manual__">手動で入力</option>';

    select.innerHTML = options;
}

// 支援計画用の生徒選択時の処理
function onPlanStudentSelect(value) {
    const manualInput = document.getElementById('planChildName');
    const infoDiv = document.getElementById('planAssessmentInfo');
    const ageInput = document.getElementById('childAge');
    const assessmentJson = document.getElementById('assessmentDataJson');

    if (value === '__manual__') {
        // 手動入力モード
        manualInput.style.display = 'block';
        manualInput.required = true;
        document.getElementById('planChildNameSelect').required = false;
        infoDiv.style.display = 'none';
        assessmentJson.value = '';
        ageInput.value = '';
    } else if (value) {
        // 生徒を選択
        manualInput.style.display = 'none';
        manualInput.required = false;
        manualInput.value = value;
        document.getElementById('planChildNameSelect').required = true;

        // アセスメント情報を読み込み
        const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');

        let assessmentData = null;
        for (const [key, assessment] of Object.entries(assessments)) {
            if (assessment.data?.childName === value) {
                assessmentData = assessment.data;
                break;
            }
        }

        if (assessmentData) {
            let info = '<strong>アセスメント情報を読み込みました:</strong> ' + assessmentData.childName;

            // 年齢を計算して自動入力
            if (assessmentData.birthDate) {
                const age = calculateAge(assessmentData.birthDate);
                info += ` (${age}歳)`;
                ageInput.value = age;
            }

            infoDiv.innerHTML = info;
            infoDiv.style.display = 'block';

            // アセスメントデータを保存
            assessmentJson.value = JSON.stringify(assessmentData).replace(/'/g, "&apos;");
        } else {
            infoDiv.style.display = 'none';
            assessmentJson.value = '';
            ageInput.value = '';
        }
    } else {
        manualInput.style.display = 'none';
        manualInput.required = false;
        infoDiv.style.display = 'none';
        assessmentJson.value = '';
        ageInput.value = '';
    }
}

// 年齢計算ヘルパー関数
function calculateAge(birthDateStr) {
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// ============================================
// ユーザー設定機能（シンプル版）
// ============================================

// 設定データのキー
const USER_SETTINGS_KEY = 'userSettings';

// 設定データを読み込み
function loadUserSettings() {
    try {
        const saved = localStorage.getItem(USER_SETTINGS_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('設定読み込みエラー:', e);
    }
    return { email: '', folderId: '', folderName: '' };
}

// 設定データを保存
function saveUserSettings(settings) {
    try {
        localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(settings));
        console.log('設定を保存しました:', settings);
    } catch (e) {
        console.error('設定保存エラー:', e);
    }
}

// 設定モーダルを開く
function openProfileSettingsModal() {
    const modal = document.getElementById('profileSettingsModal');
    modal.classList.remove('hidden');
    updateSettingsDisplay();
}

// 設定モーダルを閉じる
function closeProfileSettingsModal() {
    const modal = document.getElementById('profileSettingsModal');
    modal.classList.add('hidden');
}

// 設定表示を更新
function updateSettingsDisplay() {
    const settings = loadUserSettings();

    // Googleアカウント表示
    const accountDisplay = document.getElementById('googleAccountDisplay');
    const loginBtnText = document.getElementById('googleLoginBtnText');
    if (settings.email) {
        accountDisplay.innerHTML = `<span class="account-status connected">${settings.email}</span>`;
        loginBtnText.textContent = '別のアカウントでログイン';
    } else {
        accountDisplay.innerHTML = `<span class="account-status not-connected">未連携</span>`;
        loginBtnText.textContent = 'Googleでログイン';
    }

    // フォルダ表示
    const folderDisplay = document.getElementById('folderDisplay');
    if (settings.folderId) {
        const displayName = settings.folderName || settings.folderId;
        folderDisplay.innerHTML = `<span class="folder-status selected">${displayName}</span>`;
    } else {
        folderDisplay.innerHTML = `<span class="folder-status not-selected">未選択（デフォルトフォルダを使用）</span>`;
    }
}

// Googleアカウント連携
async function connectGoogleAccount() {
    try {
        // Google Drive API初期化
        if (!googleDriveAPI.isInitialized()) {
            await googleDriveAPI.initialize();
        }

        // 認証実行
        await googleDriveAPI.authorize();

        // メールアドレス取得
        const email = await googleDriveAPI.getCurrentUserEmail();
        if (email) {
            const settings = loadUserSettings();
            settings.email = email;
            saveUserSettings(settings);
            updateSettingsDisplay();
            showSettingComplete();
        }
    } catch (error) {
        console.error('Googleログインエラー:', error);
        alert('Googleログインに失敗しました: ' + error.message);
    }
}

// フォルダ選択
async function selectFolder() {
    try {
        // Google Drive API初期化・認証
        if (!googleDriveAPI.isInitialized()) {
            await googleDriveAPI.initialize();
        }
        if (!googleDriveAPI.isSignedIn) {
            await googleDriveAPI.authorize();
            // メールアドレスも取得して保存
            const email = await googleDriveAPI.getCurrentUserEmail();
            if (email) {
                const settings = loadUserSettings();
                settings.email = email;
                saveUserSettings(settings);
                updateSettingsDisplay();
            }
        }

        // フォルダ選択Picker起動
        googleDriveAPI.openFolderPicker((folderId, folderName, error) => {
            if (error) {
                alert('フォルダ選択エラー: ' + error);
                return;
            }
            if (folderId) {
                const settings = loadUserSettings();
                settings.folderId = folderId;
                settings.folderName = folderName;
                saveUserSettings(settings);

                // Google Drive APIにも設定
                googleDriveAPI.setTargetFolderId(folderId);

                updateSettingsDisplay();
                showSettingComplete();
            }
        });
    } catch (error) {
        console.error('フォルダ選択エラー:', error);
        alert('フォルダ選択の準備に失敗しました: ' + error.message);
    }
}

// 設定完了メッセージを表示
function showSettingComplete() {
    const completeMsg = document.getElementById('settingComplete');
    completeMsg.classList.remove('hidden');
    setTimeout(() => {
        completeMsg.classList.add('hidden');
    }, 2000);
}

// モーダル外クリックで閉じる
document.addEventListener('click', function(event) {
    const profileModal = document.getElementById('profileSettingsModal');
    if (event.target === profileModal) {
        closeProfileSettingsModal();
    }
});

// ============================================
// アプリ起動時の設定初期化
// ============================================
function initializeUserSettings() {
    const settings = loadUserSettings();
    if (settings.folderId) {
        googleDriveAPI.setTargetFolderId(settings.folderId);
        console.log('保存先フォルダIDを設定:', settings.folderId);
    }
}

// DOMContentLoadedイベントで設定初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeUserSettings();
});

// ============================================
// データ同期機能（Google Drive → localStorage）
// ============================================

/**
 * Google Driveから児童データを同期
 * 別端末で登録した児童データを反映する
 */
async function syncStudentDataFromDrive() {
    const syncBtn = document.querySelector('.sync-btn');
    const originalText = syncBtn ? syncBtn.innerHTML : '';

    try {
        // ボタンの状態を更新
        if (syncBtn) {
            syncBtn.innerHTML = '<span class="sync-icon spinning">↻</span> 同期中...';
            syncBtn.disabled = true;
        }

        // Google Drive APIの初期化確認
        if (!googleDriveAPI.isInitialized()) {
            await googleDriveAPI.initialize();
        }

        // 認証確認
        if (!googleDriveAPI.isSignedIn) {
            await googleDriveAPI.authorize();
        }

        // データ同期実行
        const result = await googleDriveAPI.syncAllStudentData();

        if (result.success) {
            // 同期成功
            const studentCount = result.syncedStudents.length;
            alert(`同期完了: ${studentCount}名の児童データを更新しました`);

            // フォームを再描画（選択肢を更新）
            refreshStudentSelects();
        } else {
            throw new Error(result.error || '同期に失敗しました');
        }
    } catch (error) {
        console.error('データ同期エラー:', error);
        alert('データ同期に失敗しました: ' + error.message);
    } finally {
        // ボタンの状態を復元
        if (syncBtn) {
            syncBtn.innerHTML = originalText;
            syncBtn.disabled = false;
        }
    }
}

/**
 * 児童選択プルダウンを更新
 */
function refreshStudentSelects() {
    // localStorageから最新のアセスメント一覧を取得
    const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
    const studentNames = [...new Set(Object.values(assessments).map(a => a.data?.childName).filter(Boolean))];

    // 記録作成フォームの選択肢を更新
    const recordSelect = document.getElementById('childNameSelect');
    if (recordSelect) {
        let options = '<option value="">選択してください</option>';
        studentNames.forEach(name => {
            options += `<option value="${name}">${name}</option>`;
        });
        options += '<option value="__manual__">手動で入力</option>';
        recordSelect.innerHTML = options;
    }

    // 支援計画フォームの選択肢を更新
    const planSelect = document.getElementById('planChildNameSelect');
    if (planSelect) {
        let options = '<option value="">選択してください</option>';
        studentNames.forEach(name => {
            options += `<option value="${name}">${name}</option>`;
        });
        options += '<option value="__manual__">手動で入力</option>';
        planSelect.innerHTML = options;
    }

    // 振り返りフォームの選択肢を更新
    const reviewSelect = document.getElementById('reviewChildNameSelect');
    if (reviewSelect) {
        let options = '<option value="">選択してください</option>';
        studentNames.forEach(name => {
            options += `<option value="${name}">${name}</option>`;
        });
        options += '<option value="__manual__">手動で入力</option>';
        reviewSelect.innerHTML = options;
    }

    console.log('児童選択肢を更新しました:', studentNames.length, '名');
}

/**
 * 最終同期日時を取得
 */
function getLastSyncTime() {
    const timestamp = localStorage.getItem('syncTimestamp');
    if (!timestamp) return '未同期';

    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP');
}

// ============================================
// 一括記録作成機能
// ============================================

// 一括記録のステップ管理用変数
let batchRecordState = {
    step: 1,
    date: '',
    activities: [],
    selectedChildren: [],
    childrenMemos: {}
};

/**
 * 一括記録作成フォームを表示
 */
function showBatchRecordForm() {
    const container = document.getElementById('batchRecordContent');

    // 状態をリセット
    batchRecordState = {
        step: 1,
        date: new Date().toISOString().split('T')[0],
        activities: [],
        selectedChildren: [],
        childrenMemos: {}
    };

    renderBatchRecordStep1(container);
}

/**
 * Step 1: 日付と活動内容の設定
 */
function renderBatchRecordStep1(container) {
    container.innerHTML = `
        <div class="batch-record-wizard">
            <div class="wizard-progress">
                <div class="progress-step active">1. 日付・活動</div>
                <div class="progress-step">2. 児童選択</div>
                <div class="progress-step">3. 記録入力</div>
            </div>

            <form onsubmit="batchRecordStep1Submit(event)">
                <div class="form-group">
                    <label>日付</label>
                    <input type="date" id="batchDate" required value="${batchRecordState.date}">
                </div>

                <div class="form-group">
                    <label>活動内容（複数選択可）</label>
                    <div class="activity-checkboxes" id="batchActivityCheckboxes">
                        <label><input type="checkbox" name="batchActivity" value="warmup"><span>ウォーミングアップ</span></label>
                        <label><input type="checkbox" name="batchActivity" value="individual"><span>個別練習</span></label>
                        <label><input type="checkbox" name="batchActivity" value="group"><span>グループ活動</span></label>
                        <label><input type="checkbox" name="batchActivity" value="game"><span>ミニゲーム</span></label>
                        <label><input type="checkbox" name="batchActivity" value="skill"><span>スキル練習</span></label>
                        <label><input type="checkbox" name="batchActivity" value="cooldown"><span>クールダウン</span></label>
                        <label><input type="checkbox" name="batchActivity" value="event"><span>イベント</span></label>
                        <label><input type="checkbox" name="batchActivity" value="other"><span>その他</span></label>
                    </div>
                    <p style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">※1つ以上選択してください</p>
                </div>

                <div class="wizard-buttons">
                    <button type="submit" class="btn-primary">次へ: 児童選択 →</button>
                </div>
            </form>
        </div>
    `;
}

/**
 * Step 1 送信処理
 */
function batchRecordStep1Submit(event) {
    event.preventDefault();

    const date = document.getElementById('batchDate').value;
    const selectedActivities = [];
    document.querySelectorAll('#batchActivityCheckboxes input:checked').forEach(cb => {
        selectedActivities.push(cb.value);
    });

    if (selectedActivities.length === 0) {
        alert('活動内容を1つ以上選択してください');
        return;
    }

    batchRecordState.date = date;
    batchRecordState.activities = selectedActivities;
    batchRecordState.step = 2;

    const container = document.getElementById('batchRecordContent');
    renderBatchRecordStep2(container);
}

/**
 * Step 2: 参加児童の選択
 */
function renderBatchRecordStep2(container) {
    // localStorageから児童一覧を取得
    const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
    const studentNames = [...new Set(Object.values(assessments).map(a => a.data?.childName).filter(Boolean))];

    const activityLabels = {
        'warmup': 'ウォーミングアップ',
        'individual': '個別練習',
        'group': 'グループ活動',
        'game': 'ミニゲーム',
        'skill': 'スキル練習',
        'cooldown': 'クールダウン',
        'event': 'イベント',
        'other': 'その他'
    };

    const selectedActivityLabels = batchRecordState.activities.map(a => activityLabels[a]).join('、');

    let childrenCheckboxes = '';
    if (studentNames.length === 0) {
        childrenCheckboxes = '<p style="color: #666; padding: 1rem;">登録されている児童がいません。先にアセスメントを作成してください。</p>';
    } else {
        studentNames.forEach(name => {
            const checked = batchRecordState.selectedChildren.includes(name) ? 'checked' : '';
            childrenCheckboxes += `
                <label class="child-checkbox-label">
                    <input type="checkbox" name="batchChild" value="${name}" ${checked}>
                    <span>${name}</span>
                </label>
            `;
        });
    }

    container.innerHTML = `
        <div class="batch-record-wizard">
            <div class="wizard-progress">
                <div class="progress-step completed">1. 日付・活動</div>
                <div class="progress-step active">2. 児童選択</div>
                <div class="progress-step">3. 記録入力</div>
            </div>

            <div class="batch-summary">
                <p><strong>日付:</strong> ${batchRecordState.date}</p>
                <p><strong>活動:</strong> ${selectedActivityLabels}</p>
            </div>

            <form onsubmit="batchRecordStep2Submit(event)">
                <div class="form-group">
                    <label>参加児童を選択</label>
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <button type="button" class="btn-small" onclick="selectAllBatchChildren()">全選択</button>
                        <button type="button" class="btn-small" onclick="deselectAllBatchChildren()">選択解除</button>
                        <button type="button" class="sync-btn" onclick="syncAndRefreshBatchChildren()" style="padding: 0.3rem 0.8rem; font-size: 0.85rem;">
                            <span class="sync-icon">↻</span> 更新
                        </button>
                    </div>
                    <div class="children-selection" id="batchChildrenList">
                        ${childrenCheckboxes}
                    </div>
                    <p style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">※1名以上選択してください</p>
                </div>

                <div class="wizard-buttons">
                    <button type="button" class="btn-secondary" onclick="batchRecordGoBack(1)">← 戻る</button>
                    <button type="submit" class="btn-primary">次へ: 記録入力 →</button>
                </div>
            </form>
        </div>
    `;
}

/**
 * 全選択
 */
function selectAllBatchChildren() {
    document.querySelectorAll('#batchChildrenList input[type="checkbox"]').forEach(cb => {
        cb.checked = true;
    });
}

/**
 * 選択解除
 */
function deselectAllBatchChildren() {
    document.querySelectorAll('#batchChildrenList input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
}

/**
 * 同期して児童リストを更新
 */
async function syncAndRefreshBatchChildren() {
    await syncStudentDataFromDrive();
    const container = document.getElementById('batchRecordContent');
    renderBatchRecordStep2(container);
}

/**
 * Step 2 送信処理
 */
function batchRecordStep2Submit(event) {
    event.preventDefault();

    const selectedChildren = [];
    document.querySelectorAll('#batchChildrenList input:checked').forEach(cb => {
        selectedChildren.push(cb.value);
    });

    if (selectedChildren.length === 0) {
        alert('参加児童を1名以上選択してください');
        return;
    }

    batchRecordState.selectedChildren = selectedChildren;
    batchRecordState.step = 3;

    // 各児童のメモを初期化
    selectedChildren.forEach(name => {
        if (!batchRecordState.childrenMemos[name]) {
            batchRecordState.childrenMemos[name] = { memo: '', noIssue: false };
        }
    });

    const container = document.getElementById('batchRecordContent');
    renderBatchRecordStep3(container);
}

/**
 * 前のステップに戻る
 */
function batchRecordGoBack(step) {
    batchRecordState.step = step;
    const container = document.getElementById('batchRecordContent');

    if (step === 1) {
        renderBatchRecordStep1(container);
    } else if (step === 2) {
        renderBatchRecordStep2(container);
    }
}

/**
 * Step 3: 個別メモ入力（一覧形式）
 */
function renderBatchRecordStep3(container) {
    const activityLabels = {
        'warmup': 'ウォーミングアップ',
        'individual': '個別練習',
        'group': 'グループ活動',
        'game': 'ミニゲーム',
        'skill': 'スキル練習',
        'cooldown': 'クールダウン',
        'event': 'イベント',
        'other': 'その他'
    };

    const selectedActivityLabels = batchRecordState.activities.map(a => activityLabels[a]).join('、');

    let childrenInputs = '';
    batchRecordState.selectedChildren.forEach((name, index) => {
        const memoData = batchRecordState.childrenMemos[name] || { memo: '', noIssue: false };
        childrenInputs += `
            <div class="batch-child-input">
                <div class="batch-child-header">
                    <span class="batch-child-number">${index + 1}</span>
                    <span class="batch-child-name">${name}</span>
                </div>
                <textarea
                    id="memo_${index}"
                    placeholder="本日の様子を入力..."
                    oninput="updateBatchMemo('${name}', this.value)"
                >${memoData.memo}</textarea>
                <label class="no-issue-label">
                    <input type="checkbox" id="noIssue_${index}"
                        ${memoData.noIssue ? 'checked' : ''}
                        onchange="updateBatchNoIssue('${name}', this.checked)">
                    <span>特に問題なし（定型文を使用）</span>
                </label>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="batch-record-wizard">
            <div class="wizard-progress">
                <div class="progress-step completed">1. 日付・活動</div>
                <div class="progress-step completed">2. 児童選択</div>
                <div class="progress-step active">3. 記録入力</div>
            </div>

            <div class="batch-summary">
                <p><strong>日付:</strong> ${batchRecordState.date}</p>
                <p><strong>活動:</strong> ${selectedActivityLabels}</p>
                <p><strong>参加児童:</strong> ${batchRecordState.selectedChildren.length}名</p>
            </div>

            <div class="batch-children-inputs">
                ${childrenInputs}
            </div>

            <div class="wizard-buttons">
                <button type="button" class="btn-secondary" onclick="batchRecordGoBack(2)">← 戻る</button>
                <button type="button" class="btn-primary" onclick="generateBatchRecords()">一括生成</button>
            </div>
        </div>
    `;
}

/**
 * メモを更新
 */
function updateBatchMemo(name, value) {
    if (!batchRecordState.childrenMemos[name]) {
        batchRecordState.childrenMemos[name] = { memo: '', noIssue: false };
    }
    batchRecordState.childrenMemos[name].memo = value;
}

/**
 * 問題なしフラグを更新
 */
function updateBatchNoIssue(name, checked) {
    if (!batchRecordState.childrenMemos[name]) {
        batchRecordState.childrenMemos[name] = { memo: '', noIssue: false };
    }
    batchRecordState.childrenMemos[name].noIssue = checked;
}

/**
 * 一括記録生成
 */
async function generateBatchRecords() {
    const container = document.getElementById('batchRecordContent');

    const activityLabels = {
        'warmup': 'ウォーミングアップ',
        'individual': '個別練習',
        'group': 'グループ活動',
        'game': 'ミニゲーム',
        'skill': 'スキル練習',
        'cooldown': 'クールダウン',
        'event': 'イベント',
        'other': 'その他'
    };

    const selectedActivityLabels = batchRecordState.activities.map(a => activityLabels[a]).join('、');

    // ローディング表示
    container.innerHTML = `
        <div class="ai-loading">
            <img src="soccerball.png" alt="読み込み中" class="ai-loading-ball">
            <span class="ai-loading-text">記録を一括生成中... (${batchRecordState.selectedChildren.length}名分)</span>
        </div>
    `;

    const results = [];

    try {
        for (const childName of batchRecordState.selectedChildren) {
            const memoData = batchRecordState.childrenMemos[childName] || { memo: '', noIssue: false };

            let observation = memoData.memo;
            if (memoData.noIssue && !observation) {
                observation = '本日も元気に参加しました。特に問題なく、活動に取り組みました。';
            }

            const recordData = {
                date: batchRecordState.date,
                childName,
                activityType: selectedActivityLabels,
                activities: batchRecordState.activities,
                observation,
                notes: memoData.noIssue ? '特に問題なし' : ''
            };

            let generatedText = '';

            if (geminiAPI.isInitialized()) {
                generatedText = await geminiAPI.generateRecord(recordData);
            } else {
                generatedText = `【活動記録】\n\n日付: ${batchRecordState.date}\n対象児童: ${childName}\n活動内容: ${selectedActivityLabels}\n\n◆ 活動の様子\n${observation}\n\n※ Gemini APIを設定すると、より詳細な記録が自動生成されます`;
            }

            results.push({
                childName,
                recordData,
                generatedText
            });

            // Google Driveに保存
            await saveRecordToDrive(childName, batchRecordState.date, generatedText, recordData);
        }

        // 結果表示
        renderBatchRecordResults(container, results);

    } catch (error) {
        console.error('一括記録生成エラー:', error);
        container.innerHTML = `
            <div style="color: #d32f2f; padding: 1rem;">
                エラーが発生しました: ${error.message}
            </div>
            <button class="btn-secondary" onclick="showBatchRecordForm()">最初からやり直す</button>
        `;
    }
}

/**
 * 一括記録結果を表示
 */
function renderBatchRecordResults(container, results) {
    // 結果をグローバルに保存（連絡帳生成用）
    window.batchRecordResults = results;

    let resultsHTML = '';
    results.forEach((result, index) => {
        resultsHTML += `
            <div class="batch-result-item">
                <div class="batch-result-header">
                    <span class="batch-child-number">${index + 1}</span>
                    <span class="batch-child-name">${result.childName}</span>
                    <span class="batch-result-status">✓ 保存済み</span>
                </div>
                <div class="batch-result-content" id="batchResult_${index}">
                    ${convertMarkdownToHTML(result.generatedText)}
                </div>
                <div class="parent-note-section" id="parentNote_${index}" style="display: none;">
                    <div class="parent-note-header">
                        <strong>保護者向け連絡帳</strong>
                    </div>
                    <div class="parent-note-content"></div>
                    <button class="btn-small" onclick="copyParentNote(${index})">コピー</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="batch-record-wizard">
            <div class="wizard-progress">
                <div class="progress-step completed">1. 日付・活動</div>
                <div class="progress-step completed">2. 児童選択</div>
                <div class="progress-step completed">3. 記録入力</div>
            </div>

            <div class="batch-summary" style="background: #e8f5e9; border-color: #4CAF50;">
                <h3 style="color: #2e7d32; margin-bottom: 0.5rem;">一括生成完了</h3>
                <p>${results.length}名分の記録をGoogle Driveに保存しました。</p>
            </div>

            <div class="batch-results">
                ${resultsHTML}
            </div>

            <div class="wizard-buttons">
                <button type="button" class="btn-secondary" onclick="generateAllParentNotes()">
                    連絡帳文章を一括生成
                </button>
                <button type="button" class="btn-primary" onclick="showBatchRecordForm()">新しい一括記録を作成</button>
            </div>
        </div>
    `;
}

/**
 * 全児童の連絡帳文章を一括生成
 */
async function generateAllParentNotes() {
    if (!window.batchRecordResults || window.batchRecordResults.length === 0) {
        alert('生成する記録がありません');
        return;
    }

    const btn = document.querySelector('.wizard-buttons .btn-secondary');
    const originalText = btn.textContent;
    btn.textContent = '生成中...';
    btn.disabled = true;

    try {
        const records = window.batchRecordResults.map(r => ({
            childName: r.childName,
            observation: r.recordData.observation,
            activities: r.recordData.activities,
            activityType: r.recordData.activityType,
            date: r.recordData.date
        }));

        if (geminiAPI.isInitialized()) {
            const parentNotes = await geminiAPI.generateBatchParentNotes(records);

            // 各連絡帳を表示
            parentNotes.forEach((note, index) => {
                const section = document.getElementById(`parentNote_${index}`);
                if (section && note.success) {
                    const content = section.querySelector('.parent-note-content');
                    content.textContent = note.parentNote;
                    section.style.display = 'block';
                    // 結果に連絡帳を追加
                    window.batchRecordResults[index].parentNote = note.parentNote;
                }
            });

            alert('連絡帳文章の生成が完了しました');
        } else {
            alert('Gemini APIが設定されていません。設定画面からAPIキーを設定してください。');
        }
    } catch (error) {
        console.error('連絡帳生成エラー:', error);
        alert('連絡帳の生成に失敗しました: ' + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// ========================================
// 公式様式レンダリング関数
// ========================================

/**
 * 専門的支援実施計画のHTMLをレンダリング
 */
function renderOfficialSupportPlan(childName, data) {
    const today = new Date().toLocaleDateString('ja-JP');
    const items = data.items || [];

    let itemsHTML = '';
    items.forEach(item => {
        itemsHTML += `
            <tr>
                <td style="text-align:center; font-weight:bold; width:120px;">${item.category || ''}</td>
                <td style="width:180px;">${item.goal || ''}</td>
                <td>${item.content || ''}</td>
                <td style="width:180px;">${item.method || ''}</td>
                <td style="text-align:center; width:80px;">${item.period || ''}</td>
            </tr>
        `;
    });

    return `
        <div class="official-plan-container" style="font-family: 'Hiragino Kaku Gothic ProN', sans-serif; background: white; padding: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <div>
                    <h2 style="color: #d35400; margin: 0;">${childName}さんの専門的支援実施計画</h2>
                </div>
                <div style="text-align: right; font-size: 11pt;">
                    <p style="margin: 3px 0;">施設名：カラーズFC鳥栖</p>
                    <p style="margin: 3px 0;">利用サービス：放課後等デイサービス</p>
                    <p style="margin: 3px 0;">作成日：${today}</p>
                </div>
            </div>

            <div style="margin-bottom: 15px; background: #f8f9fa; padding: 12px; border-radius: 8px;">
                <h4 style="color: #d35400; margin: 0 0 8px 0;">アセスメント結果</h4>
                <p style="margin: 5px 0;"><strong>本人：</strong>${data.assessmentSelf || ''}</p>
                <p style="margin: 5px 0;"><strong>家族：</strong>${data.assessmentFamily || ''}</p>
            </div>

            <div style="margin-bottom: 15px; background: #f8f9fa; padding: 12px; border-radius: 8px;">
                <h4 style="color: #d35400; margin: 0 0 8px 0;">総合的な支援の方針</h4>
                <p style="margin: 0;">${data.supportPolicy || ''}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                <tr>
                    <td style="background: #f8f9fa; padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #d35400; width: 100px;">長期目標</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${data.longTermGoal || ''}</td>
                </tr>
                <tr>
                    <td style="background: #f8f9fa; padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #d35400;">短期目標</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${data.shortTermGoal || ''}</td>
                </tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="border: 1px solid #ddd; padding: 10px; font-size: 10pt;">特に支援を要する項目</th>
                        <th style="border: 1px solid #ddd; padding: 10px; font-size: 10pt;">目指すべき達成目標</th>
                        <th style="border: 1px solid #ddd; padding: 10px; font-size: 10pt;">具体的な支援の内容</th>
                        <th style="border: 1px solid #ddd; padding: 10px; font-size: 10pt;">実施方法</th>
                        <th style="border: 1px solid #ddd; padding: 10px; font-size: 10pt;">達成時期</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * 個別支援計画のHTMLをレンダリング
 */
function renderOfficialIndividualPlan(childName, data) {
    const today = new Date().toLocaleDateString('ja-JP');
    const selfSupport = data.selfSupport || [];
    const familySupport = data.familySupport || {};
    const transitionSupport = data.transitionSupport || {};

    let selfSupportHTML = '';
    selfSupport.forEach((item, index) => {
        const rowspanAttr = index === 0 ? `rowspan="${selfSupport.length}"` : '';
        const categoryCell = index === 0 ? `<td style="text-align:center; font-weight:bold; width:60px; vertical-align:middle; background:#fafafa;" ${rowspanAttr}>本人支援</td>` : '';

        selfSupportHTML += `
            <tr>
                ${categoryCell}
                <td style="width:130px;">${item.needs || ''}</td>
                <td style="width:140px;">${item.goal || ''}</td>
                <td>${item.content || ''}</td>
                <td style="text-align:center; width:60px;">${item.period || ''}</td>
                <td style="width:90px;">${item.staff || ''}</td>
                <td style="width:130px;">${item.notes || ''}</td>
                <td style="text-align:center; width:40px;">${item.priority || ''}</td>
            </tr>
        `;
    });

    return `
        <div class="official-plan-container" style="font-family: 'Hiragino Kaku Gothic ProN', sans-serif; background: white; padding: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <div>
                    <h2 style="color: #d35400; margin: 0;">${childName}さんの個別支援計画</h2>
                    <p style="color: #666; margin: 5px 0 0 0;">（代替支援用）</p>
                </div>
                <div style="text-align: right; font-size: 11pt;">
                    <p style="margin: 3px 0;">施設名：カラーズFC鳥栖</p>
                    <p style="margin: 3px 0;">利用サービス：放課後等デイサービス</p>
                    <p style="margin: 3px 0;">作成日：${today}</p>
                </div>
            </div>

            <div style="margin-bottom: 15px; background: #f8f9fa; padding: 12px; border-radius: 8px;">
                <h4 style="color: #d35400; margin: 0 0 8px 0;">利用児及び家族の生活に対する意向</h4>
                <p style="margin: 5px 0;"><strong>本人：</strong>${data.intentSelf || ''}</p>
                <p style="margin: 5px 0;"><strong>家族：</strong>${data.intentFamily || ''}</p>
            </div>

            <div style="margin-bottom: 15px; background: #f8f9fa; padding: 12px; border-radius: 8px;">
                <h4 style="color: #d35400; margin: 0 0 8px 0;">総合的な支援の方針</h4>
                <p style="margin: 0;">${data.supportPolicy || ''}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                <tr>
                    <td style="background: #f8f9fa; padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #d35400; width: 150px;">長期目標<br><span style="font-size:9pt;color:#666;">（内容・期間等）</span></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${data.longTermGoal || ''}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; width: 200px; background: #fafafa;">
                        <div style="font-size: 9pt; color: #666; margin-bottom: 5px;">支援の標準的な提供時間等</div>
                        ${data.scheduleInfo || ''}
                    </td>
                </tr>
                <tr>
                    <td style="background: #f8f9fa; padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #d35400;">短期目標<br><span style="font-size:9pt;color:#666;">（内容・期間等）</span></td>
                    <td style="padding: 10px; border: 1px solid #ddd;" colspan="2">${data.shortTermGoal || ''}</td>
                </tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="border: 1px solid #ddd; padding: 8px;" colspan="2">項目（本人のニーズ等）</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">具体的な達成目標</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">支援内容</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">達成時期</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">担当者</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">留意事項</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">優先順位</th>
                    </tr>
                </thead>
                <tbody>
                    ${selfSupportHTML}
                    <tr>
                        <td style="text-align:center; font-weight:bold; width:60px; vertical-align:middle; background:#fafafa;">家族支援</td>
                        <td>${familySupport.needs || ''}</td>
                        <td>${familySupport.goal || ''}</td>
                        <td>${familySupport.content || ''}</td>
                        <td style="text-align:center;">${familySupport.period || ''}</td>
                        <td>${familySupport.staff || ''}</td>
                        <td>${familySupport.notes || ''}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td style="text-align:center; font-weight:bold; width:60px; vertical-align:middle; background:#fafafa;">移行支援</td>
                        <td>${transitionSupport.needs || ''}</td>
                        <td>${transitionSupport.goal || ''}</td>
                        <td>${transitionSupport.content || ''}</td>
                        <td style="text-align:center;">${transitionSupport.period || ''}</td>
                        <td>${transitionSupport.staff || ''}</td>
                        <td>${transitionSupport.notes || ''}</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

/**
 * 連絡帳文章をクリップボードにコピー
 */
function copyParentNote(index) {
    const content = document.querySelector(`#parentNote_${index} .parent-note-content`);
    if (content) {
        navigator.clipboard.writeText(content.textContent).then(() => {
            alert('連絡帳文章をコピーしました');
        }).catch(err => {
            console.error('コピーエラー:', err);
            // フォールバック
            const textarea = document.createElement('textarea');
            textarea.value = content.textContent;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('連絡帳文章をコピーしました');
        });
    }
}

/**
 * 振り返り用の生徒選択肢をフィルタリング
 */
function filterReviewStudentOptions(searchText) {
    const select = document.getElementById('reviewChildNameSelect');
    if (!select) return;

    const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
    const allNames = [...new Set(Object.values(assessments).map(a => a.data?.childName).filter(Boolean))];

    // 検索テキストで絞り込み
    const filtered = searchText
        ? allNames.filter(name => name.includes(searchText))
        : allNames;

    // オプションを再構築
    let options = '<option value="">選択してください</option>';
    filtered.forEach(name => {
        options += `<option value="${name}">${name}</option>`;
    });
    options += '<option value="__manual__">手動で入力</option>';

    select.innerHTML = options;
}

// ========================================
// CSVインポート機能
// ========================================

/**
 * CSVインポートフォームを表示
 */
function showCsvImportForm() {
    const container = document.getElementById('csvImportContent');
    if (!container) return;

    container.innerHTML = `
        <div class="csv-import-container">
            <div class="import-type-selector">
                <h4>インポートするデータの種類を選択</h4>
                <div class="import-type-buttons">
                    <button class="import-type-btn active" data-type="childInfo" onclick="selectImportType('childInfo')">
                        <span class="import-type-icon">👤</span>
                        <span class="import-type-label">児童基本情報</span>
                    </button>
                    <button class="import-type-btn" data-type="supportPlan" onclick="selectImportType('supportPlan')">
                        <span class="import-type-icon">📋</span>
                        <span class="import-type-label">支援計画</span>
                    </button>
                    <button class="import-type-btn" data-type="record" onclick="selectImportType('record')">
                        <span class="import-type-icon">📝</span>
                        <span class="import-type-label">活動記録</span>
                    </button>
                </div>
            </div>

            <div class="csv-import-form">
                <div id="importTypeInfo" class="import-type-info">
                    <h4>児童基本情報のインポート</h4>
                    <p>CSVファイルに以下のフィールドを含めてください：</p>
                    <div class="required-fields">
                        <span class="field-badge required">氏名（必須）</span>
                        <span class="field-badge">ふりがな</span>
                        <span class="field-badge">生年月日</span>
                        <span class="field-badge">性別</span>
                        <span class="field-badge">診断名</span>
                        <span class="field-badge">受給者証番号</span>
                        <span class="field-badge">保護者名</span>
                        <span class="field-badge">学校・園名</span>
                    </div>
                </div>

                <div class="file-upload-area" id="fileUploadArea">
                    <input type="file" id="csvFileInput" accept=".csv" onchange="handleCsvFileSelect(event)" style="display:none;">
                    <div class="upload-icon">📁</div>
                    <p>クリックしてCSVファイルを選択<br>またはドラッグ＆ドロップ</p>
                    <p class="file-hint">対応形式: CSV (UTF-8)</p>
                </div>

                <div id="selectedFileInfo" class="selected-file-info" style="display:none;">
                    <span class="file-icon">📄</span>
                    <span id="selectedFileName" class="file-name"></span>
                    <button class="btn-remove-file" onclick="clearCsvFile()">×</button>
                </div>

                <div class="import-actions">
                    <button class="btn-download-template" onclick="downloadCsvTemplate()">
                        テンプレートをダウンロード
                    </button>
                    <button id="importBtn" class="btn-primary" onclick="executeImport()" disabled>
                        インポート実行
                    </button>
                </div>
            </div>

            <div id="importResult" class="import-result" style="display:none;">
                <!-- インポート結果がここに表示 -->
            </div>
        </div>
    `;

    // ドラッグ＆ドロップ設定
    const uploadArea = document.getElementById('fileUploadArea');
    uploadArea.addEventListener('click', () => {
        document.getElementById('csvFileInput').click();
    });
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].name.endsWith('.csv')) {
            handleCsvFile(files[0]);
        } else {
            alert('CSVファイルを選択してください');
        }
    });

    // 現在の選択タイプを保存
    window.currentImportType = 'childInfo';
}

// 現在選択されているCSVファイル
window.selectedCsvFile = null;
window.currentImportType = 'childInfo';

/**
 * インポートタイプを選択
 */
function selectImportType(type) {
    window.currentImportType = type;

    // ボタンのアクティブ状態を更新
    document.querySelectorAll('.import-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    // 情報パネルを更新
    const infoPanel = document.getElementById('importTypeInfo');
    const typeInfo = {
        childInfo: {
            title: '児童基本情報のインポート',
            description: 'CSVファイルに以下のフィールドを含めてください：',
            fields: [
                { name: '氏名', required: true },
                { name: 'ふりがな', required: false },
                { name: '生年月日', required: false },
                { name: '性別', required: false },
                { name: '診断名', required: false },
                { name: '受給者証番号', required: false },
                { name: '保護者名', required: false },
                { name: '学校・園名', required: false }
            ]
        },
        supportPlan: {
            title: '支援計画のインポート',
            description: 'CSVファイルに以下のフィールドを含めてください：',
            fields: [
                { name: '児童名', required: true },
                { name: '作成日', required: false },
                { name: '支援期間', required: false },
                { name: '長期目標', required: false },
                { name: '短期目標', required: false },
                { name: '支援内容', required: false },
                { name: '家族支援', required: false },
                { name: '備考', required: false }
            ]
        },
        record: {
            title: '活動記録のインポート',
            description: 'CSVファイルに以下のフィールドを含めてください：',
            fields: [
                { name: '日付', required: true },
                { name: '児童名', required: true },
                { name: '活動内容', required: false },
                { name: '様子', required: false },
                { name: '備考', required: false }
            ]
        }
    };

    const info = typeInfo[type];
    const fieldsHTML = info.fields.map(f =>
        `<span class="field-badge${f.required ? ' required' : ''}">${f.name}${f.required ? '（必須）' : ''}</span>`
    ).join('');

    infoPanel.innerHTML = `
        <h4>${info.title}</h4>
        <p>${info.description}</p>
        <div class="required-fields">${fieldsHTML}</div>
    `;
}

/**
 * CSVファイル選択時の処理
 */
function handleCsvFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleCsvFile(file);
    }
}

/**
 * CSVファイルを処理
 */
function handleCsvFile(file) {
    window.selectedCsvFile = file;

    // ファイル情報を表示
    document.getElementById('fileUploadArea').style.display = 'none';
    const fileInfo = document.getElementById('selectedFileInfo');
    fileInfo.style.display = 'flex';
    document.getElementById('selectedFileName').textContent = file.name;

    // フォルダ選択UIを表示
    showFolderSelection();
}

/**
 * フォルダ選択UIを表示
 */
async function showFolderSelection() {
    const folderSection = document.getElementById('folderSelectionSection');
    if (!folderSection) {
        // フォルダ選択セクションを追加
        const importForm = document.querySelector('.csv-import-form');
        const folderHTML = `
            <div id="folderSelectionSection" class="folder-selection-section">
                <h4>保存先フォルダを選択</h4>
                <p class="folder-hint">Google Driveの生徒フォルダを選択、または新規作成できます</p>

                <div id="folderLoadingIndicator" class="folder-loading">
                    <span class="loading-spinner">⏳</span> フォルダ一覧を読み込み中...
                </div>

                <div id="folderList" class="folder-list" style="display:none;">
                    <!-- フォルダ一覧がここに表示 -->
                </div>

                <div class="folder-actions">
                    <button class="btn-new-folder" onclick="createNewImportFolder()">
                        ➕ 新規フォルダを作成
                    </button>
                </div>
            </div>
        `;
        importForm.insertAdjacentHTML('beforeend', folderHTML);
    }

    document.getElementById('folderSelectionSection').style.display = 'block';
    document.getElementById('folderLoadingIndicator').style.display = 'block';
    document.getElementById('folderList').style.display = 'none';

    // Google Driveから既存フォルダを取得
    try {
        if (typeof googleDriveAPI !== 'undefined' && googleDriveAPI.isInitialized()) {
            await googleDriveAPI.authorize();
            const result = await googleDriveAPI.listStudentFolders();

            if (result.success && result.folders.length > 0) {
                displayFolderList(result.folders);
            } else {
                displayFolderList([]);
            }
        } else {
            // Google Drive未接続の場合
            displayFolderList([]);
        }
    } catch (error) {
        console.error('フォルダ取得エラー:', error);
        displayFolderList([]);
    }

    document.getElementById('folderLoadingIndicator').style.display = 'none';
    document.getElementById('folderList').style.display = 'block';
}

/**
 * フォルダ一覧を表示
 */
function displayFolderList(folders) {
    const folderList = document.getElementById('folderList');

    if (folders.length === 0) {
        folderList.innerHTML = `
            <div class="no-folders">
                <p>既存のフォルダがありません</p>
                <p class="hint">新規フォルダを作成するか、localStorageのみに保存されます</p>
            </div>
        `;
        // インポートボタンを有効化（localStorageのみ）
        window.selectedFolderId = null;
        window.selectedFolderName = null;
        document.getElementById('importBtn').disabled = false;
        return;
    }

    let html = '<div class="folder-grid">';
    folders.forEach(folder => {
        html += `
            <div class="folder-item" onclick="selectImportFolder('${folder.id}', '${folder.name}')" data-folder-id="${folder.id}">
                <span class="folder-icon">📁</span>
                <span class="folder-name">${folder.name}</span>
            </div>
        `;
    });
    html += '</div>';

    folderList.innerHTML = html;

    // インポートボタンはまだ無効（フォルダ選択待ち）
    document.getElementById('importBtn').disabled = true;
}

/**
 * インポート先フォルダを選択
 */
function selectImportFolder(folderId, folderName) {
    window.selectedFolderId = folderId;
    window.selectedFolderName = folderName;

    // 選択状態を更新
    document.querySelectorAll('.folder-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.folderId === folderId);
    });

    // 選択されたフォルダを表示
    let selectedIndicator = document.getElementById('selectedFolderIndicator');
    if (!selectedIndicator) {
        const folderSection = document.getElementById('folderSelectionSection');
        folderSection.insertAdjacentHTML('beforeend', '<div id="selectedFolderIndicator" class="selected-folder-indicator"></div>');
        selectedIndicator = document.getElementById('selectedFolderIndicator');
    }
    selectedIndicator.innerHTML = `<span class="check-icon">✓</span> 選択中: <strong>${folderName}</strong>`;

    // インポートボタンを有効化
    document.getElementById('importBtn').disabled = false;
}

/**
 * 新規フォルダを作成
 */
async function createNewImportFolder() {
    const folderName = prompt('新規フォルダ名を入力してください（児童名など）:');
    if (!folderName || !folderName.trim()) return;

    try {
        if (typeof googleDriveAPI !== 'undefined' && googleDriveAPI.isInitialized()) {
            await googleDriveAPI.authorize();
            const result = await googleDriveAPI.getOrCreateStudentFolder(folderName.trim());

            if (result.folderId) {
                alert(`フォルダ「${result.folderName}」を${result.isNew ? '作成' : '選択'}しました`);
                selectImportFolder(result.folderId, result.folderName);

                // フォルダ一覧を更新
                const folders = await googleDriveAPI.listStudentFolders();
                if (folders.success) {
                    displayFolderList(folders.folders);
                    // 再度選択状態を設定
                    selectImportFolder(result.folderId, result.folderName);
                }
            }
        } else {
            alert('Google Driveに接続されていません。設定からGoogle Driveを連携してください。');
        }
    } catch (error) {
        console.error('フォルダ作成エラー:', error);
        alert('フォルダの作成に失敗しました: ' + error.message);
    }
}

/**
 * 選択したCSVファイルをクリア
 */
function clearCsvFile() {
    resetCsvSelection();
    document.getElementById('importResult').style.display = 'none';
}

/**
 * CSV選択状態をリセット（結果表示は維持）
 */
function resetCsvSelection() {
    window.selectedCsvFile = null;
    window.selectedFolderId = null;
    window.selectedFolderName = null;
    document.getElementById('csvFileInput').value = '';
    document.getElementById('fileUploadArea').style.display = 'flex';
    document.getElementById('selectedFileInfo').style.display = 'none';
    document.getElementById('importBtn').disabled = true;

    // フォルダ選択セクションを非表示
    const folderSection = document.getElementById('folderSelectionSection');
    if (folderSection) {
        folderSection.style.display = 'none';
    }
}

/**
 * CSVテンプレートをダウンロード
 */
function downloadCsvTemplate() {
    const templates = {
        childInfo: {
            filename: '児童基本情報_テンプレート.csv',
            headers: ['氏名', 'ふりがな', '生年月日', '性別', '診断名', '受給者証番号', '保護者名', '学校・園名', '学年'],
            sample: ['山田太郎', 'やまだたろう', '2015-04-01', '男', 'ASD', '1234567890', '山田花子', '○○小学校', '3年']
        },
        supportPlan: {
            filename: '支援計画_テンプレート.csv',
            headers: ['児童名', '作成日', '支援期間', '長期目標', '短期目標', '支援内容', '家族支援', '備考'],
            sample: ['山田太郎', '2024-04-01', '2024年4月〜2024年9月', '集団活動への参加', 'ルールを守って活動できる', '視覚的支援を用いた説明', '家庭での様子の共有', '']
        },
        record: {
            filename: '活動記録_テンプレート.csv',
            headers: ['日付', '児童名', '活動内容', '様子', '備考'],
            sample: ['2024-04-15', '山田太郎', 'ウォーミングアップ、ミニゲーム', '積極的に参加できた', '']
        }
    };

    const template = templates[window.currentImportType];
    const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    const content = bom + [template.headers.join(','), template.sample.join(',')].join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = template.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * インポートを実行
 */
async function executeImport() {
    try {
        if (!window.selectedCsvFile) {
            alert('CSVファイルを選択してください');
            return;
        }

        const btn = document.getElementById('importBtn');
        if (!btn) {
            alert('インポートボタンが見つかりません');
            return;
        }
        const originalText = btn.textContent;
        btn.textContent = 'インポート中...';
        btn.disabled = true;

        try {
            // CSVの内容を先読みしてデータ種別を自動検出
            const csvText = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
                reader.readAsText(window.selectedCsvFile, 'UTF-8');
            });

            const detectedType = csvImporter.detectContentType(csvText);
            const importType = detectedType || window.currentImportType;

            // 自動検出でタイプが変わった場合、UIのタイプも更新
            if (detectedType && detectedType !== window.currentImportType) {
                console.log(`CSVの内容を自動検出: ${window.currentImportType} → ${detectedType}`);
                window.currentImportType = detectedType;
            }

            let result;
            const options = {
                folderId: window.selectedFolderId || null,
                folderName: window.selectedFolderName || null,
                saveToGoogleDrive: !!window.selectedFolderId
            };

            switch (importType) {
                case 'childInfo':
                    result = await csvImporter.importChildInfo(window.selectedCsvFile, options);
                    break;
                case 'supportPlan':
                    result = await csvImporter.importSupportPlan(window.selectedCsvFile, options);
                    break;
                case 'record':
                    result = await csvImporter.importRecords(window.selectedCsvFile, options);
                    break;
                default:
                    throw new Error('不明なインポートタイプ: ' + importType);
            }

            if (!result) {
                throw new Error('インポート結果が返されませんでした');
            }

            // Google Driveに保存
            if (options.saveToGoogleDrive && result.success) {
                btn.textContent = 'Google Driveに保存中...';
                try {
                    await saveImportedDataToGoogleDrive(result, options);
                    result.message += `\n\nGoogle Drive「${options.folderName}」フォルダに保存しました`;
                } catch (driveError) {
                    console.error('Google Drive保存エラー:', driveError);
                    result.message += '\n\n（Google Drive保存に失敗しましたが、ローカルには保存されています）';
                }
            }

            // 成功メッセージをアラートで表示
            alert(result.success ? result.message : 'インポートに失敗しました: ' + result.message);

            // 結果を表示
            showImportResult(result);

            // 結果が見えるようにスクロール
            const resultDiv = document.getElementById('importResult');
            if (resultDiv) resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (error) {
            console.error('インポートエラー:', error);
            alert('インポートエラー: ' + error.message);
            try {
                showImportResult({
                    success: false,
                    message: error.message
                });
                const resultDiv = document.getElementById('importResult');
                if (resultDiv) resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (displayError) {
                console.error('結果表示エラー:', displayError);
            }
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
            window.selectedFolderId = null;
            window.selectedFolderName = null;
        }
    } catch (outerError) {
        console.error('executeImport 外側エラー:', outerError);
        alert('予期しないエラー: ' + outerError.message);
    }
}

/**
 * インポートしたデータをGoogle Driveに保存
 */
async function saveImportedDataToGoogleDrive(result, options) {
    if (!options.folderId || typeof googleDriveAPI === 'undefined') return;

    try {
        // インポートタイプに応じてlocalStorageからデータを取得して保存
        const type = window.currentImportType;

        if (type === 'childInfo') {
            const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
            for (const name of result.importedNames || []) {
                const key = Object.keys(assessments).find(k => k.includes(name));
                if (key && assessments[key]) {
                    const data = assessments[key];
                    await googleDriveAPI.uploadHTMLFile(
                        `${name}_基本情報.html`,
                        data.html,
                        options.folderId
                    );
                    // JSONも保存
                    await googleDriveAPI.uploadJSONFile(
                        `${name}_基本情報.json`,
                        { type: 'assessment', ...data },
                        options.folderId
                    );
                }
            }
        } else if (type === 'supportPlan') {
            const plans = JSON.parse(localStorage.getItem('supportPlans') || '{}');
            for (const name of result.importedNames || []) {
                const key = Object.keys(plans).find(k => k.includes(name));
                if (key && plans[key]) {
                    const data = plans[key];
                    await googleDriveAPI.uploadHTMLFile(
                        key,
                        data.html,
                        options.folderId
                    );
                    await googleDriveAPI.uploadJSONFile(
                        key.replace('.html', '.json'),
                        { type: 'supportPlan', ...data },
                        options.folderId
                    );
                }
            }
        } else if (type === 'record') {
            const reports = JSON.parse(localStorage.getItem('dailyReports') || '{}');
            for (const nameDate of result.importedNames || []) {
                // "森田亜羅斗 (2026/1/19)" 形式から名前を抽出
                const name = nameDate.split(' (')[0];
                const keys = Object.keys(reports).filter(k => k.includes(name));
                for (const key of keys) {
                    if (reports[key]) {
                        const data = reports[key];
                        await googleDriveAPI.uploadHTMLFile(
                            key,
                            data.html,
                            options.folderId
                        );
                        await googleDriveAPI.uploadJSONFile(
                            key.replace('.html', '.json'),
                            { type: 'record', ...data },
                            options.folderId
                        );
                    }
                }
            }
        }

        console.log('Google Driveへの保存完了');
    } catch (error) {
        console.error('Google Drive保存エラー:', error);
        throw error;
    }
}

/**
 * インポート結果を表示
 */
function showImportResult(result) {
    const resultDiv = document.getElementById('importResult');
    resultDiv.style.display = 'block';

    if (result.success) {
        const namesHTML = result.importedNames
            ? result.importedNames.map(name => `<span class="imported-name">${name}</span>`).join('')
            : '';

        resultDiv.innerHTML = `
            <div class="import-success">
                <div class="success-icon">✓</div>
                <h4>インポート完了</h4>
                <p>${result.message}</p>
                ${namesHTML ? `<div class="imported-names">${namesHTML}</div>` : ''}
            </div>
        `;

        // 成功時は自動でファイル選択をリセット（続けて別のファイルをインポート可能に）
        resetCsvSelection();
    } else {
        resultDiv.innerHTML = `
            <div class="import-error">
                <div class="error-icon">✗</div>
                <h4>インポート失敗</h4>
                <p>${result.message}</p>
            </div>
            <div class="import-result-actions">
                <button class="btn-secondary" onclick="clearCsvFile()">やり直す</button>
            </div>
        `;
    }
}

// ========================================
// 練習メニューアップロード機能
// ========================================

const PRACTICE_UPLOAD_PASSWORD = 'heartup';

/**
 * 練習メニューアップロードフォームを表示
 */
function showPracticeUploadForm() {
    const password = prompt('管理パスワードを入力してください:');
    if (password !== PRACTICE_UPLOAD_PASSWORD) {
        if (password !== null) alert('パスワードが正しくありません。');
        return;
    }

    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h2 style="color: #2e7d32; margin-bottom: 1.5rem;">練習メニューを追加</h2>
        <form id="practiceUploadForm" onsubmit="submitPracticeUpload(event)">
            <div class="form-group">
                <label for="uploadTitle">タイトル <span style="color: #e74c3c;">*</span></label>
                <input type="text" id="uploadTitle" required placeholder="例：ラダートレーニング">
            </div>
            <div class="form-group">
                <label for="uploadDescription">説明</label>
                <textarea id="uploadDescription" rows="3" placeholder="メニューの説明を入力"></textarea>
            </div>
            <div class="form-group">
                <label for="uploadCategory">カテゴリ</label>
                <select id="uploadCategory">
                    <option value="warmup">ウォーミングアップ</option>
                    <option value="dribble">ドリブル</option>
                    <option value="shoot">シュート</option>
                    <option value="match">対人・試合</option>
                    <option value="game">ゲーム</option>
                    <option value="concentration">集中力強化</option>
                    <option value="switching">切り替え強化</option>
                    <option value="competition">勝ち負け</option>
                    <option value="vestibular">前庭覚刺激</option>
                    <option value="proprioceptive">固有覚刺激</option>
                    <option value="tactile">触覚刺激</option>
                    <option value="flexibility">柔軟性（稼働域）</option>
                    <option value="bodyimage">ボディイメージ</option>
                    <option value="balance">バランス</option>
                </select>
            </div>
            <div class="form-group">
                <label for="uploadDifficulty">難易度</label>
                <select id="uploadDifficulty">
                    <option value="☆">☆（初級）</option>
                    <option value="★☆">★☆（中級）</option>
                    <option value="★★">★★（上級）</option>
                </select>
            </div>
            <div class="form-group">
                <label for="uploadVideoUrl">動画URL（YouTube等）</label>
                <input type="url" id="uploadVideoUrl" placeholder="https://www.youtube.com/watch?v=...">
            </div>
            <div class="form-group">
                <label for="uploadPdfUrl">PDFファイルURL</label>
                <input type="url" id="uploadPdfUrl" placeholder="https://example.com/file.pdf">
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">キャンセル</button>
                <button type="submit" class="btn-primary">保存</button>
            </div>
        </form>
    `;

    modal.classList.remove('hidden');
}

/**
 * 練習メニューアップロードを保存
 */
function submitPracticeUpload(event) {
    event.preventDefault();

    const title = document.getElementById('uploadTitle').value.trim();
    if (!title) {
        alert('タイトルを入力してください。');
        return;
    }

    const menu = {
        id: 'uploaded_' + Date.now(),
        title: title,
        description: document.getElementById('uploadDescription').value.trim() || '',
        category: document.getElementById('uploadCategory').value,
        categories: [document.getElementById('uploadCategory').value],
        difficulty: document.getElementById('uploadDifficulty').value,
        videoUrl: document.getElementById('uploadVideoUrl').value.trim() || '',
        pdfUrl: document.getElementById('uploadPdfUrl').value.trim() || '',
        isUploaded: true,
        createdAt: new Date().toISOString()
    };

    const uploaded = JSON.parse(localStorage.getItem('uploadedPracticeMenus') || '[]');
    uploaded.push(menu);
    localStorage.setItem('uploadedPracticeMenus', JSON.stringify(uploaded));

    closeModal();
    displayPracticeMenus();
    alert('練習メニューを追加しました！');
}

/**
 * YouTube URLからVideo IDを抽出
 */
function getYouTubeVideoId(url) {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * YouTube動画をモーダルで表示
 */
function showYouTubeEmbed(videoId, title) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h3 style="color: #2e7d32; margin-bottom: 1rem;">${title}</h3>
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px;">
            <iframe
                src="https://www.youtube.com/embed/${videoId}?autoplay=1"
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                allow="autoplay; encrypted-media"
                allowfullscreen>
            </iframe>
        </div>
    `;

    modal.classList.remove('hidden');
}

/**
 * アップロードされた練習メニューを削除
 */
function deleteUploadedMenu(menuId) {
    const password = prompt('管理パスワードを入力してください:');
    if (password !== PRACTICE_UPLOAD_PASSWORD) {
        if (password !== null) alert('パスワードが正しくありません。');
        return;
    }

    if (!confirm('このメニューを削除しますか？')) return;

    const uploaded = JSON.parse(localStorage.getItem('uploadedPracticeMenus') || '[]');
    const filtered = uploaded.filter(m => m.id !== menuId);
    localStorage.setItem('uploadedPracticeMenus', JSON.stringify(filtered));

    displayPracticeMenus();
    alert('メニューを削除しました。');
}

/**
 * 既存メニューに動画を追加/編集
 */
function editMenuVideo(menuId, menuTitle) {
    const password = prompt('管理パスワードを入力してください:');
    if (password !== PRACTICE_UPLOAD_PASSWORD) {
        if (password !== null) alert('パスワードが正しくありません。');
        return;
    }

    const menuVideos = JSON.parse(localStorage.getItem('practiceMenuVideos') || '{}');
    const currentUrl = menuVideos[menuId] || '';

    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h2 style="color: #2e7d32; margin-bottom: 1rem;">「${menuTitle}」に動画を設定</h2>
        <div class="form-group">
            <label for="editVideoUrl">動画URL（YouTube等）</label>
            <input type="url" id="editVideoUrl" value="${currentUrl}" placeholder="https://www.youtube.com/watch?v=...">
        </div>
        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
            ${currentUrl ? `<button class="btn-danger" style="margin-right:auto;" onclick="removeMenuVideo(${menuId}); closeModal();">削除</button>` : ''}
            <button class="btn-secondary" onclick="closeModal()">キャンセル</button>
            <button class="btn-primary" onclick="saveMenuVideo(${menuId})">保存</button>
        </div>
    `;

    modal.classList.remove('hidden');
}

/**
 * 既存メニューの動画URLを保存
 */
function saveMenuVideo(menuId) {
    const url = document.getElementById('editVideoUrl').value.trim();
    const menuVideos = JSON.parse(localStorage.getItem('practiceMenuVideos') || '{}');

    if (url) {
        menuVideos[menuId] = url;
    } else {
        delete menuVideos[menuId];
    }

    localStorage.setItem('practiceMenuVideos', JSON.stringify(menuVideos));
    closeModal();
    displayPracticeMenus();
}

/**
 * 既存メニューの動画URLを削除
 */
function removeMenuVideo(menuId) {
    const menuVideos = JSON.parse(localStorage.getItem('practiceMenuVideos') || '{}');
    delete menuVideos[menuId];
    localStorage.setItem('practiceMenuVideos', JSON.stringify(menuVideos));
    displayPracticeMenus();
}

/**
 * アップロード済みメニューを編集
 */
function editUploadedMenu(menuId) {
    const password = prompt('管理パスワードを入力してください:');
    if (password !== PRACTICE_UPLOAD_PASSWORD) {
        if (password !== null) alert('パスワードが正しくありません。');
        return;
    }

    const uploaded = JSON.parse(localStorage.getItem('uploadedPracticeMenus') || '[]');
    const menu = uploaded.find(m => m.id === menuId);
    if (!menu) {
        alert('メニューが見つかりません。');
        return;
    }

    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h2 style="color: #2e7d32; margin-bottom: 1rem;">メニューを編集</h2>
        <form onsubmit="saveUploadedMenuEdit('${menuId}', event)">
            <div class="form-group">
                <label for="editUpTitle">タイトル</label>
                <input type="text" id="editUpTitle" value="${menu.title.replace(/"/g, '&quot;')}" required>
            </div>
            <div class="form-group">
                <label for="editUpDescription">説明</label>
                <textarea id="editUpDescription" rows="3">${menu.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="editUpCategory">カテゴリ</label>
                <select id="editUpCategory">
                    <option value="warmup" ${menu.category === 'warmup' ? 'selected' : ''}>ウォーミングアップ</option>
                    <option value="dribble" ${menu.category === 'dribble' ? 'selected' : ''}>ドリブル</option>
                    <option value="shoot" ${menu.category === 'shoot' ? 'selected' : ''}>シュート</option>
                    <option value="match" ${menu.category === 'match' ? 'selected' : ''}>対人・試合</option>
                    <option value="game" ${menu.category === 'game' ? 'selected' : ''}>ゲーム</option>
                    <option value="concentration" ${menu.category === 'concentration' ? 'selected' : ''}>集中力強化</option>
                    <option value="switching" ${menu.category === 'switching' ? 'selected' : ''}>切り替え強化</option>
                    <option value="competition" ${menu.category === 'competition' ? 'selected' : ''}>勝ち負け</option>
                    <option value="vestibular" ${menu.category === 'vestibular' ? 'selected' : ''}>前庭覚刺激</option>
                    <option value="proprioceptive" ${menu.category === 'proprioceptive' ? 'selected' : ''}>固有覚刺激</option>
                    <option value="tactile" ${menu.category === 'tactile' ? 'selected' : ''}>触覚刺激</option>
                    <option value="flexibility" ${menu.category === 'flexibility' ? 'selected' : ''}>柔軟性（稼働域）</option>
                    <option value="bodyimage" ${menu.category === 'bodyimage' ? 'selected' : ''}>ボディイメージ</option>
                    <option value="balance" ${menu.category === 'balance' ? 'selected' : ''}>バランス</option>
                </select>
            </div>
            <div class="form-group">
                <label for="editUpDifficulty">難易度</label>
                <select id="editUpDifficulty">
                    <option value="☆" ${menu.difficulty === '☆' ? 'selected' : ''}>☆（初級）</option>
                    <option value="★☆" ${menu.difficulty === '★☆' ? 'selected' : ''}>★☆（中級）</option>
                    <option value="★★" ${menu.difficulty === '★★' ? 'selected' : ''}>★★（上級）</option>
                </select>
            </div>
            <div class="form-group">
                <label for="editUpVideoUrl">動画URL（YouTube等）</label>
                <input type="url" id="editUpVideoUrl" value="${menu.videoUrl || ''}" placeholder="https://www.youtube.com/watch?v=...">
            </div>
            <div class="form-group">
                <label for="editUpPdfUrl">PDFファイルURL</label>
                <input type="url" id="editUpPdfUrl" value="${menu.pdfUrl || ''}" placeholder="https://example.com/file.pdf">
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">キャンセル</button>
                <button type="submit" class="btn-primary">保存</button>
            </div>
        </form>
    `;

    modal.classList.remove('hidden');
}

/**
 * アップロード済みメニューの編集を保存
 */
function saveUploadedMenuEdit(menuId, event) {
    event.preventDefault();

    const title = document.getElementById('editUpTitle').value.trim();
    if (!title) {
        alert('タイトルを入力してください。');
        return;
    }

    const uploaded = JSON.parse(localStorage.getItem('uploadedPracticeMenus') || '[]');
    const index = uploaded.findIndex(m => m.id === menuId);
    if (index === -1) {
        alert('メニューが見つかりません。');
        return;
    }

    uploaded[index].title = title;
    uploaded[index].description = document.getElementById('editUpDescription').value.trim() || '';
    uploaded[index].category = document.getElementById('editUpCategory').value;
    uploaded[index].categories = [document.getElementById('editUpCategory').value];
    uploaded[index].difficulty = document.getElementById('editUpDifficulty').value;
    uploaded[index].videoUrl = document.getElementById('editUpVideoUrl').value.trim() || '';
    uploaded[index].pdfUrl = document.getElementById('editUpPdfUrl').value.trim() || '';

    localStorage.setItem('uploadedPracticeMenus', JSON.stringify(uploaded));
    closeModal();
    displayPracticeMenus();
    alert('メニューを更新しました。');
}