// サンプル資料データ
const sampleResources = [
    {
        id: 1,
        title: "サッカー療育の基本理念と実践",
        category: "soccer",
        description: "サッカーを通じた療育の基本的な考え方と、実際の指導方法について解説します。",
        date: "2024-01-15",
        tags: ["基礎", "理念", "実践方法"]
    },
    {
        id: 2,
        title: "ABC分析による行動理解",
        category: "aba",
        description: "応用行動分析のABC分析を使って、子どもの行動を理解し支援する方法を学びます。",
        date: "2024-02-10",
        tags: ["ABC分析", "行動分析", "支援方法"]
    },
    {
        id: 3,
        title: "運動スキル向上の事例研究",
        category: "case",
        description: "実際にサッカー療育で運動スキルが向上した子どもたちの事例を紹介します。",
        date: "2024-03-05",
        tags: ["事例", "運動スキル", "成功例"]
    },
    {
        id: 4,
        title: "コミュニケーション能力の育成",
        category: "soccer",
        description: "チームスポーツを通じて、コミュニケーション能力を育てる具体的な方法。",
        date: "2024-03-20",
        tags: ["コミュニケーション", "チーム活動", "社会性"]
    },
    {
        id: 5,
        title: "強化子の効果的な使い方",
        category: "aba",
        description: "正の強化を使った行動支援の実践的なテクニックと注意点。",
        date: "2024-04-01",
        tags: ["強化子", "正の強化", "モチベーション"]
    },
    {
        id: 6,
        title: "感覚統合とサッカー療育",
        category: "case",
        description: "感覚統合の課題を持つ子どもへのサッカーを使った支援事例。",
        date: "2024-04-15",
        tags: ["感覚統合", "事例", "個別支援"]
    }
];

// 現在のカテゴリフィルター
let currentCategory = 'all';

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // Gemini APIの初期化
    initializeGeminiAPI();
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
    
    // 初期表示
    displayResources();
    initializeAITabs();
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
            <h3 style="color: #2e7d32; margin-bottom: 1rem;">資料の内容（サンプル）</h3>
            <p style="color: #666; line-height: 1.6;">
                この資料では、${resource.title}について詳しく解説しています。
                実際の指導現場で活用できる具体的な方法や、注意すべきポイントなどを
                イラストや図表を交えて分かりやすく説明しています。
            </p>
        </div>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button class="btn-primary" onclick="alert('デモ版のため、実際の資料閲覧機能は実装されていません。')">
                📄 資料を開く
            </button>
            <button class="btn-secondary" onclick="alert('デモ版のため、お気に入り機能は実装されていません。')">
                ⭐ お気に入りに追加
            </button>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// モーダルを閉じる
function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
}

// 記録作成フォームを表示
function showRecordForm() {
    const container = document.getElementById('recordToolContent');
    
    container.innerHTML = `
        <form onsubmit="generateRecord(event)">
            <div class="form-group">
                <label>日付</label>
                <input type="date" id="recordDate" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            
            <div class="form-group">
                <label>対象児童名</label>
                <input type="text" id="childName" placeholder="例: 山田太郎" required>
            </div>
            
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
            <div style="padding: 1.5rem; background: #f8f9fa; border-radius: 10px; white-space: pre-wrap; line-height: 1.8;" id="recordContent"></div>
            <div style="margin-top: 1rem; display: flex; gap: 1rem;">
                <button class="btn-primary" onclick="alert('デモ版のため、保存機能は実装されていません。')">💾 保存</button>
                <button class="btn-secondary" onclick="alert('デモ版のため、エクスポート機能は実装されていません。')">📥 PDF出力</button>
            </div>
        </div>
    `;
}

// 支援計画フォームを表示
function showPlanForm() {
    const container = document.getElementById('planToolContent');
    
    container.innerHTML = `
        <form onsubmit="generatePlan(event)">
            <div class="form-group">
                <label>対象児童名</label>
                <input type="text" id="planChildName" placeholder="例: 山田太郎" required>
            </div>
            
            <div class="form-group">
                <label>年齢</label>
                <input type="number" id="childAge" min="3" max="18" placeholder="例: 8" required>
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
        </div>
    `;
}

// 成長振り返りフォームを表示
function showReviewForm() {
    const container = document.getElementById('reviewToolContent');
    
    container.innerHTML = `
        <form onsubmit="generateReview(event)">
            <div class="form-group">
                <label>対象児童名</label>
                <input type="text" id="reviewChildName" placeholder="例: 山田太郎" required>
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
                <textarea id="activities" placeholder="例: 週2回の個別練習、月1回のミニゲーム参加" required></textarea>
            </div>
            
            <div class="form-group">
                <label>観察された変化</label>
                <textarea id="changes" placeholder="例: ボールコントロールが向上、積極的に参加するようになった" required></textarea>
            </div>
            
            <div style="display: flex; gap: 1rem;">
                <button type="submit" class="btn-primary">振り返りを生成</button>
                <button type="button" class="btn-secondary" onclick="closeToolDetail()">キャンセル</button>
            </div>
        </form>
        
        <div id="generatedReview" style="margin-top: 2rem; display: none;">
            <h3 style="color: #2e7d32; margin-bottom: 1rem;">成長の振り返りレポート</h3>
            <div style="padding: 1.5rem; background: #f8f9fa; border-radius: 10px;" id="reviewContent"></div>
            <div style="margin-top: 1rem; display: flex; gap: 1rem;">
                <button class="btn-primary" onclick="alert('デモ版のため、保存機能は実装されていません。')">💾 保存</button>
                <button class="btn-secondary" onclick="alert('デモ版のため、共有機能は実装されていません。')">📤 共有</button>
            </div>
        </div>
    `;
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
        // Gemini APIを使用して生成
        if (geminiAPI.isInitialized()) {
            const recordData = {
                date,
                childName,
                activityType: activityLabels[activityType],
                observation,
                notes
            };
            
            const generatedText = await geminiAPI.generateRecord(recordData);
            document.getElementById('recordContent').textContent = generatedText;
        } else {
            // APIが設定されていない場合はデフォルトのテキストを使用
            const recordText = `【活動記録】

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
            
            document.getElementById('recordContent').textContent = recordText;
        }
    } catch (error) {
        console.error('記録生成エラー:', error);
        document.getElementById('recordContent').innerHTML = `
            <div style="color: #d32f2f;">
                エラーが発生しました: ${error.message}<br>
                <button class="btn-secondary" onclick="showApiKeyModal()" style="margin-top: 1rem;">APIキーを設定</button>
            </div>
        `;
    }
}

// 支援計画を生成
async function generatePlan(event) {
    event.preventDefault();
    
    const childName = document.getElementById('planChildName').value;
    const age = document.getElementById('childAge').value;
    const issues = document.getElementById('currentIssues').value;
    const strengths = document.getElementById('strengths').value;
    const parentRequest = document.getElementById('parentRequest').value;
    
    // ローディング表示
    document.getElementById('planContent').innerHTML = '<div style="text-align: center; padding: 2rem;">🔄 AIが支援計画を生成中...</div>';
    document.getElementById('generatedPlan').style.display = 'block';
    
    try {
        if (geminiAPI.isInitialized()) {
            const planData = {
                childName,
                age,
                issues,
                strengths,
                parentRequest
            };
            
            const generatedText = await geminiAPI.generateSupportPlan(planData);
            document.getElementById('planContent').innerHTML = `<div style="white-space: pre-wrap; line-height: 1.8;">${generatedText}</div>`;
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
                <button class="btn-secondary" onclick="showApiKeyModal()" style="margin-top: 1rem;">APIキーを設定</button>
            </div>
        `;
    }
}

// 振り返りを生成
async function generateReview(event) {
    event.preventDefault();
    
    const childName = document.getElementById('reviewChildName').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const goals = document.getElementById('goals').value;
    const activities = document.getElementById('activities').value;
    const changes = document.getElementById('changes').value;
    
    // ローディング表示
    document.getElementById('reviewContent').innerHTML = '<div style="text-align: center; padding: 2rem;">🔄 AIが振り返りレポートを生成中...</div>';
    document.getElementById('generatedReview').style.display = 'block';
    
    try {
        if (geminiAPI.isInitialized()) {
            const reviewData = {
                childName,
                startDate,
                endDate,
                goals,
                activities,
                changes
            };
            
            const generatedText = await geminiAPI.generateReview(reviewData);
            document.getElementById('reviewContent').innerHTML = `<div style="white-space: pre-wrap; line-height: 1.8;">${generatedText}</div>`;
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
        }
    } catch (error) {
        console.error('振り返り生成エラー:', error);
        document.getElementById('reviewContent').innerHTML = `
            <div style="color: #d32f2f;">
                エラーが発生しました: ${error.message}<br>
                <button class="btn-secondary" onclick="showApiKeyModal()" style="margin-top: 1rem;">APIキーを設定</button>
            </div>
        `;
    }
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
    // APIキーを読み込み
    if (!geminiAPI.loadApiKey()) {
        // APIキーが設定されていない場合、モーダルを表示
        setTimeout(() => {
            showApiKeyModal();
        }, 1000);
    }
}

function showApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    modal.classList.remove('hidden');
    
    // 既存のキーがあれば表示
    const existingKey = localStorage.getItem('gemini_api_key');
    if (existingKey) {
        document.getElementById('apiKeyInput').value = existingKey;
    }
}

function saveApiKey() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    
    if (!apiKey) {
        alert('APIキーを入力してください');
        return;
    }
    
    // APIキーを保存
    geminiAPI.setApiKey(apiKey);
    
    // モーダルを閉じる
    document.getElementById('apiKeyModal').classList.add('hidden');
    
    alert('APIキーが保存されました。AI機能が利用可能になりました。');
}

function skipApiKey() {
    document.getElementById('apiKeyModal').classList.add('hidden');
    alert('APIキーが設定されていないため、AI生成機能は制限されます。\n設定は後からでも可能です。');
}