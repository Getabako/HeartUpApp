// ============================================
// Assessment Manager - Embedded in index.html
// Ported from assessment-manager.html
// All functions/variables prefixed with "am" to avoid conflicts
// ============================================

// グローバルデータキャッシュ
let amAllChildrenData = [];
let amCachedAssessments = {};
let amCachedSupportPlans = {};
let amCachedDailyReports = {};
let amCachedReviews = {};

// 学年計算（日本の学年制度: 4月2日〜翌4月1日が同学年）
function amCalculateGrade(birthDateStr) {
    if (!birthDateStr) {
        console.log('amCalculateGrade: birthDateStrが空', birthDateStr);
        return '';
    }
    const birth = new Date(birthDateStr);
    if (isNaN(birth.getTime())) {
        console.log('amCalculateGrade: 無効なbirthDateStr', birthDateStr);
        return '';
    }
    const now = new Date();
    const fiscalYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    let cohortStartYear;
    if (birth.getMonth() > 3 || (birth.getMonth() === 3 && birth.getDate() >= 2)) {
        cohortStartYear = birth.getFullYear();
    } else {
        cohortStartYear = birth.getFullYear() - 1;
    }
    const gradeAge = fiscalYear - cohortStartYear;
    const labels = { 0:'0歳児', 1:'1歳児', 2:'2歳児', 3:'年少', 4:'年中', 5:'年長',
        6:'小1', 7:'小2', 8:'小3', 9:'小4', 10:'小5', 11:'小6',
        12:'中1', 13:'中2', 14:'中3', 15:'高1', 16:'高2', 17:'高3' };
    const result = labels[gradeAge] || `${gradeAge}歳`;
    console.log('amCalculateGrade:', birthDateStr, '→', result, '(gradeAge:', gradeAge, ')');
    return result;
}

// 児童一覧の並び替え状態
let amSortBy = localStorage.getItem('heartup_am_sortPreference') || 'name';

// 児童データを並び替え
function amSortChildren(children, sortBy) {
    console.log('amSortChildren: ソート開始', children.length, '件, sortBy:', sortBy);
    if (children.length === 0) {
        console.warn('amSortChildren: ソート対象が空です');
        return [];
    }
    
    const childrenCopy = [...children];
    console.log('ソート前の最初の児童:', childrenCopy[0]);
    
    switch(sortBy) {
        case 'name':
            // 名前順（50音）
            console.log('名前順でソート');
            return childrenCopy.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
            
        case 'grade':
            // 学年順（amCalculateGradeの出力ラベルに合わせる）
            const gradeOrder = {
                '0歳児': 0, '1歳児': 1, '2歳児': 2,
                '年少': 3, '年中': 4, '年長': 5,
                '小1': 6, '小2': 7, '小3': 8, '小4': 9, '小5': 10, '小6': 11,
                '中1': 12, '中2': 13, '中3': 14,
                '高1': 15, '高2': 16, '高3': 17
            };
            return childrenCopy.sort((a, b) => {
                const gradeA = gradeOrder[a.grade] || 99;
                const gradeB = gradeOrder[b.grade] || 99;
                if (gradeA !== gradeB) return gradeA - gradeB;
                return a.name.localeCompare(b.name, 'ja');
            });
            
        case 'recent':
            // 最近追加順
            return childrenCopy.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            
        case 'location':
            // 拠点順（拠点名でソート、同じ拠点内は名前順）
            return childrenCopy.sort((a, b) => {
                const locationA = a.locationName || '';
                const locationB = b.locationName || '';
                if (locationA !== locationB) {
                    return locationA.localeCompare(locationB, 'ja');
                }
                // 同じ拠点なら名前順
                return a.name.localeCompare(b.name, 'ja');
            });
            
        default:
            return childrenCopy.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    }
}

// 並び替え順序を変更
function amChangeSortOrder(sortBy) {
    amSortBy = sortBy;
    localStorage.setItem('heartup_am_sortPreference', sortBy);
    
    // 現在のフィルター状態を保持して再描画
    amFilterChildren();
}

// 全データを読み込んで児童一覧を表示
async function amLoadChildren() {
    console.log('amLoadChildren: 開始');
    try {
        // Firebase接続時は認証完了を待つ（race condition対策）
        if (heartUpDB.isReady() && !heartUpDB.currentProfile) {
            console.log('認証完了を待機中...');
            try {
                const session = await heartUpDB.getSession();
                if (session) {
                    await heartUpDB.getMyProfile();
                    console.log('認証完了: profile=', heartUpDB.currentProfile?.name);
                }
            } catch (authErr) {
                console.warn('認証待機中にエラー:', authErr);
            }
        }

        const [children, assessments, supportPlans, dailyReports, reviews] = await Promise.all([
            dataAdapter.getChildren(),
            dataAdapter.getAssessments(),
            dataAdapter.getSupportPlans(),
            dataAdapter.getDailyReports(),
            dataAdapter.getReviews()
        ]);

        // 拠点マップを構築（locationId -> locationName）
        let locationMap = {};
        try {
            if (heartUpDB.isReady()) {
                console.log('拠点情報取得開始');
                const locations = await heartUpDB.getLocations();
                console.log('取得した拠点情報:', locations);
                locations.forEach(loc => {
                    locationMap[loc.id] = loc.name;
                });
                console.log('構築された拠点マップ:', locationMap);
            } else {
                console.log('Firebase未接続: 拠点情報の取得をスキップ');
            }
        } catch (e) {
            console.warn('拠点情報の取得に失敗:', e);
        }

        console.log('データ取得完了:', {
            children: Object.keys(children).length,
            assessments: Object.keys(assessments).length,
            supportPlans: Object.keys(supportPlans).length,
            dailyReports: Object.keys(dailyReports).length,
            reviews: Object.keys(reviews).length
        });

        amCachedAssessments = assessments;
        amCachedSupportPlans = supportPlans;
        amCachedDailyReports = dailyReports;
        amCachedReviews = reviews;

        const container = document.getElementById('amChildrenContainer');
        if (!container) return;

        // 拠点情報を表示
        const locationInfo = document.getElementById('amLocationInfo');
        if (locationInfo) {
            if (heartUpDB.isReady() && heartUpDB.currentProfile) {
                locationInfo.textContent = heartUpDB.getMyLocationName() + ' - データはクラウドに保存されています';
            } else {
                locationInfo.textContent = 'データは端末内に保存されています';
            }
        }

        // アセスメントを児童名でグループ化
        const assessmentsByChild = {};
        Object.entries(assessments).forEach(([fileName, a]) => {
            const name = a.data?.childName || '';
            if (!name) return;
            if (!assessmentsByChild[name]) assessmentsByChild[name] = [];
            assessmentsByChild[name].push({ fileName, ...a });
        });

        // 支援計画を児童名でグループ化
        const plansByChild = {};
        Object.entries(supportPlans).forEach(([fileName, p]) => {
            const name = p.childName || '';
            if (!name) return;
            if (!plansByChild[name]) plansByChild[name] = [];
            plansByChild[name].push({ fileName, ...p });
        });

        // 日々の記録を児童名でグループ化
        const reportsByChild = {};
        Object.entries(dailyReports).forEach(([fileName, r]) => {
            const name = r.childName || '';
            if (!name) return;
            if (!reportsByChild[name]) reportsByChild[name] = [];
            reportsByChild[name].push({ fileName, ...r });
        });

        // 振り返りを児童名でグループ化
        const reviewsByChild = {};
        Object.entries(reviews).forEach(([fileName, r]) => {
            const name = r.childName || '';
            if (!name) return;
            if (!reviewsByChild[name]) reviewsByChild[name] = [];
            reviewsByChild[name].push({ fileName, ...r });
        });

        // 児童データを統合
        amAllChildrenData = [];
        const processedNames = new Set();
        
        console.log('データ件数 - children:', Object.keys(children).length, 'assessments:', Object.keys(assessmentsByChild).length);

        // childrenコレクションから
        Object.entries(children).forEach(([name, child]) => {
            const childAssessments = assessmentsByChild[name] || [];
            const latest = childAssessments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
            const formData = latest?.data || {};
            const birthDate = formData.birthDate || child.birthDate || '';

            const locationId = child.locationId || '';
            const locationName = locationId ? (locationMap[locationId] || `拠点:${locationId}`) : '未設定';
            if (locationId && !locationMap[locationId]) {
                console.warn(`拠点マップに未登録: locationId=${locationId}, 児童=${name}`);
            }

            amAllChildrenData.push({
                name,
                childId: child.id,
                birthDate,
                gender: formData.gender || child.gender || '',
                diagnosis: formData.diagnosis || child.diagnosis || '',
                childNameKana: formData.childNameKana || child.childNameKana || '',
                createdAt: child.createdAt,
                locationId,
                assessmentCount: childAssessments.length,
                planCount: (plansByChild[name] || []).length,
                reportCount: (reportsByChild[name] || []).length,
                reviewCount: (reviewsByChild[name] || []).length,
                latestAssessmentFileName: latest?.fileName || null,
                grade: amCalculateGrade(birthDate),
                locationName: locationName
            });
            processedNames.add(name);
        });
        
        // assessmentsにしかいない児童も追加
        Object.entries(assessmentsByChild).forEach(([name, childAssessments]) => {
            if (processedNames.has(name)) return;
            const latest = childAssessments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
            const formData = latest?.data || {};
            const birthDate = formData.birthDate || '';

            const aLocId = latest?.locationId || '';
            amAllChildrenData.push({
                name,
                childId: null,
                birthDate,
                gender: formData.gender || '',
                diagnosis: formData.diagnosis || '',
                childNameKana: formData.childNameKana || '',
                createdAt: latest?.createdAt,
                locationId: aLocId,
                assessmentCount: childAssessments.length,
                planCount: (plansByChild[name] || []).length,
                reportCount: (reportsByChild[name] || []).length,
                reviewCount: (reviewsByChild[name] || []).length,
                latestAssessmentFileName: latest?.fileName || null,
                grade: amCalculateGrade(birthDate),
                locationName: aLocId ? (locationMap[aLocId] || `拠点:${aLocId}`) : '未設定'
            });
        });

        // 並び替え設定を適用してソート
        amAllChildrenData = amSortChildren(amAllChildrenData, amSortBy);
        
        console.log('amAllChildrenData構築完了:', amAllChildrenData.length, '件');

        amUpdateGradeFilter();
        await amUpdateLocationFilter();
        amRenderChildren(amAllChildrenData);

        // 並び替えセレクトボックスの状態を復元
        setTimeout(() => {
            const sortSelect = document.getElementById('amSortSelect');
            if (sortSelect) {
                sortSelect.value = amSortBy;
            }
        }, 100);
    } catch (error) {
        console.error('amLoadChildren エラー:', error);
        console.error('エラー詳細:', error.stack);
        
        // エラー時にも空の状態を表示
        const container = document.getElementById('amChildrenContainer');
        if (container) {
            container.innerHTML = `
                <div class="am-empty-state">
                    <h3>データ読み込みエラー</h3>
                    <p>児童データの読み込みに失敗しました。ページを再読み込みしてください。</p>
                    <p style="color: #666; font-size: 0.8rem;">エラー: ${error.message}</p>
                </div>
            `;
        }
    }
}

// 学年フィルタの選択肢を更新
function amUpdateGradeFilter() {
    const gradeSelect = document.getElementById('amGradeFilter');
    if (!gradeSelect) return;
    
    // 全学年のリスト（年少から高三まで）
    const allGrades = [
        '年少', '年中', '年長',
        '小1', '小2', '小3', '小4', '小5', '小6',
        '中1', '中2', '中3',
        '高1', '高2', '高3'
    ];
    
    // 登録されている学年を取得
    const registeredGrades = [...new Set(amAllChildrenData.map(c => c.grade).filter(Boolean))];
    
    gradeSelect.innerHTML = '<option value="">全学年</option>';
    
    // 全学年を表示（登録されている学年は太字などで強調したいが、一旦全表示）
    allGrades.forEach(g => {
        const isRegistered = registeredGrades.includes(g);
        gradeSelect.innerHTML += `<option value="${g}">${g}</option>`;
    });
}

// 拠点フィルタの選択肢を更新
async function amUpdateLocationFilter() {
    const locationSelect = document.getElementById('amLocationFilter');
    if (!locationSelect) return;

    console.log('amUpdateLocationFilter: 開始');

    // 児童データから拠点名を抽出（「未設定」は除外）
    const childLocationNames = [...new Set(amAllChildrenData.map(c => c.locationName).filter(n => n && n !== '未設定'))];
    console.log('児童データから抽出された拠点:', childLocationNames);

    // Firebaseから全登録拠点も取得（児童が0人の拠点も表示するため）
    let allLocationNames = [...childLocationNames];
    if (heartUpDB.isReady()) {
        try {
            const fbLocations = await heartUpDB.getLocations();
            fbLocations.forEach(loc => {
                if (loc.name && !allLocationNames.includes(loc.name)) {
                    allLocationNames.push(loc.name);
                }
            });
            console.log('Firebase拠点を含む全拠点:', allLocationNames);
        } catch (e) {
            console.warn('Firebase拠点取得エラー（フィルター用）:', e);
        }
    }

    allLocationNames.sort((a, b) => a.localeCompare(b, 'ja'));

    locationSelect.innerHTML = '<option value="">全拠点</option>';
    allLocationNames.forEach(l => {
        locationSelect.innerHTML += `<option value="${l}">${l}</option>`;
    });
    // 「未設定」の児童がいる場合はフィルターに追加
    if (amAllChildrenData.some(c => c.locationName === '未設定')) {
        locationSelect.innerHTML += '<option value="未設定">未設定</option>';
    }

    console.log('amUpdateLocationFilter: 完了, 追加されたオプション数:', allLocationNames.length);
}

// フィルタリング
function amFilterChildren() {
    const nameQuery = (document.getElementById('amNameSearch')?.value || '').toLowerCase();
    const gradeQuery = document.getElementById('amGradeFilter')?.value || '';
    const locationQuery = document.getElementById('amLocationFilter')?.value || '';
    const filtered = amAllChildrenData.filter(child => {
        const nameMatch = !nameQuery ||
            child.name.toLowerCase().includes(nameQuery) ||
            (child.childNameKana || '').toLowerCase().includes(nameQuery);
        const gradeMatch = !gradeQuery || child.grade === gradeQuery;
        const locationMatch = !locationQuery || child.locationName === locationQuery;
        return nameMatch && gradeMatch && locationMatch;
    });
    
    // 並び替えを適用
    const sorted = amSortChildren(filtered, amSortBy);
    amRenderChildren(sorted);
}

// 児童一覧を描画
function amRenderChildren(childrenList) {
    console.log('amRenderChildren: 描画開始', childrenList.length, '件');
    console.log('childrenListサンプル:', childrenList.slice(0, 3)); // 最初の3件を表示
    
    const container = document.getElementById('amChildrenContainer');
    if (!container) {
        console.error('amRenderChildren: コンテナが見つかりません');
        return;
    }
    console.log('コンテナ要素:', container);

    const countEl = document.getElementById('amChildrenCount');
    if (countEl) {
        countEl.textContent = `（${childrenList.length}名）`;
        console.log('件数表示更新:', countEl.textContent);
    }

    if (childrenList.length === 0) {
        container.innerHTML = `
            <div class="am-empty-state">
                <h3>該当する児童がいません</h3>
                <p>検索条件を変更するか、「新規アセスメント作成」から登録してください</p>
            </div>`;
        return;
    }

    container.innerHTML = '';
    console.log('amRenderChildren: 各児童の拠点情報');
    childrenList.forEach((child, index) => {
        console.log(`児童 ${index + 1}: ${child.name}, locationName: "${child.locationName}"`);
        const childItem = document.createElement('div');
        childItem.className = 'am-child-item';
        const escapedName = child.name.replace(/'/g, "\\'");
        const hasAssessment = child.assessmentCount > 0;
        const latestFN = child.latestAssessmentFileName ? child.latestAssessmentFileName.replace(/'/g, "\\'") : '';

        const locBadgeStyle = child.locationName && child.locationName !== '未設定'
            ? 'background: #e3f2fd; color: #1565c0; border: 1px solid #90caf9;'
            : 'background: #fff3e0; color: #e65100; border: 1px solid #ffcc80;';

        childItem.innerHTML = `
            <div class="am-child-info">
                <h3>${child.name}${child.childNameKana ? `（${child.childNameKana}）` : ''}
                    ${child.grade ? `<span class="am-grade-badge">${child.grade}</span>` : ''}
                    <span class="am-location-badge" style="${locBadgeStyle} padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; margin-left: 6px; font-weight: normal; cursor: pointer;" onclick="amShowChangeLocationModal('${escapedName}', '${child.locationId || ''}', '${child.locationName || ''}')" title="クリックで拠点変更">📍${child.locationName || '未設定'}</span>
                </h3>
                <p>生年月日: ${child.birthDate || '未設定'} | 性別: ${child.gender || '未回答'}</p>
                <p>診断名: ${child.diagnosis || 'なし'}</p>
                <p>登録日: ${child.createdAt ? new Date(child.createdAt).toLocaleDateString('ja-JP') : '不明'}</p>
                <div class="am-child-records-summary">
                    ${child.assessmentCount ? `<span class="am-record-count-badge assessment">アセスメント ${child.assessmentCount}件</span>` : ''}
                    ${child.planCount ? `<span class="am-record-count-badge plan">支援計画 ${child.planCount}件</span>` : ''}
                    ${child.reportCount ? `<span class="am-record-count-badge daily">記録 ${child.reportCount}件</span>` : ''}
                    ${child.reviewCount ? `<span class="am-record-count-badge review">振り返り ${child.reviewCount}件</span>` : ''}
                </div>
            </div>
            <div class="am-child-actions">
                ${hasAssessment ? `
                    <button class="am-btn am-btn-primary" onclick="amShowChildAssessments('${escapedName}')">アセスメント表示</button>
                    <button class="am-btn am-btn-secondary" onclick="amShowChildSupportPlans('${escapedName}', '${latestFN}')">支援計画</button>
                    <button class="am-btn am-btn-tertiary" onclick="amShowChildDailyRecords('${escapedName}', '${latestFN}')">日々の記録</button>
                    <button class="am-btn am-btn-quaternary" onclick="amShowChildReviews('${escapedName}', '${latestFN}')">成長振り返り</button>
                ` : `
                    <button class="am-btn am-btn-primary" onclick="window.location.href='assessment/form-simple.html'">アセスメント作成</button>
                `}
                <button class="am-btn am-btn-danger" onclick="amDeleteChild('${escapedName}')" style="background:#d32f2f; color:white; margin-top:4px;">削除</button>
            </div>
        `;
        container.appendChild(childItem);
    });
}

// 児童を削除（関連データ含む）
window.amDeleteChild = async function(childName) {
    console.log('amDeleteChild 呼び出し:', childName);
    
    const totalRecords = amAllChildrenData.find(c => c.name === childName);
    const counts = totalRecords
        ? `アセスメント${totalRecords.assessmentCount}件、支援計画${totalRecords.planCount}件、記録${totalRecords.reportCount}件、振り返り${totalRecords.reviewCount}件`
        : '';
    
    console.log('削除確認ダイアログ表示:', childName, counts);
    if (!confirm(`「${childName}」を削除しますか？\n\n関連する全データ（${counts}）も削除されます。\nこの操作は元に戻せません。`)) {
        console.log('削除キャンセル');
        return;
    }
    
    try {
        console.log('削除実行開始:', childName);
        await dataAdapter.deleteChildAndRelatedData(childName);
        console.log('削除成功:', childName);
        alert(`「${childName}」と関連データを削除しました。`);
        
        // 削除後に児童一覧を再読み込み
        console.log('児童一覧再読み込み開始');
        
        // まず、メモリ内のデータを直接更新
        const beforeCount = amAllChildrenData.length;
        amAllChildrenData = amAllChildrenData.filter(c => c.name !== childName);
        const afterCount = amAllChildrenData.length;
        console.log('メモリ内データ更新:', beforeCount, '→', afterCount, '件');
        
        // フィルターと表示を更新
        amUpdateGradeFilter();
        await amUpdateLocationFilter();
        amRenderChildren(amAllChildrenData);

        // その後、サーバーからデータを再取得（非同期）
        setTimeout(async () => {
            try {
                console.log('サーバーデータ再取得開始');
                await amLoadChildren();
                console.log('サーバーデータ再取得完了');
            } catch (error) {
                console.error('サーバーデータ再取得エラー:', error);
                console.error('再取得エラー詳細:', error.stack);
            }
        }, 500);
    } catch (error) {
        console.error('児童削除エラー:', error);
        console.error('エラー詳細:', error.stack);
        alert('削除に失敗しました: ' + error.message);
    }
}

// 拠点変更モーダルを表示
window.amShowChangeLocationModal = async function(childName, currentLocationId, currentLocationName) {
    if (!heartUpDB.isReady()) {
        alert('拠点変更にはFirebase接続が必要です。');
        return;
    }

    let locations = [];
    try {
        locations = await heartUpDB.getLocations();
    } catch (e) {
        console.error('拠点一覧取得エラー:', e);
        alert('拠点一覧の取得に失敗しました。');
        return;
    }

    if (locations.length === 0) {
        alert('拠点が登録されていません。管理画面から拠点を追加してください。');
        return;
    }

    // 既存モーダルがあれば削除
    let existingModal = document.getElementById('locationChangeModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'locationChangeModal';
    modal.className = 'modal';
    modal.style.cssText = 'display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1100;';
    modal.innerHTML = `
        <div style="background:white; border-radius:16px; padding:1.5rem; max-width:400px; width:90%; position:relative; animation:slideIn 0.3s ease;">
            <span style="position:absolute; top:0.5rem; right:1rem; font-size:1.5rem; cursor:pointer; color:#666;" onclick="document.getElementById('locationChangeModal').remove()">&times;</span>
            <h3 style="margin:0 0 1rem; color:#333;">「${childName}」の拠点変更</h3>
            <p style="margin:0 0 0.5rem; font-size:0.9rem; color:#666;">現在の拠点: <strong>${currentLocationName || '未設定'}</strong></p>
            <div style="margin:1rem 0;">
                <label for="newLocationSelect" style="display:block; margin-bottom:0.5rem; font-weight:bold;">新しい拠点を選択:</label>
                <select id="newLocationSelect" style="width:100%; padding:0.5rem; border:1px solid #ddd; border-radius:4px; font-size:1rem;">
                    <option value="">未設定</option>
                    ${locations.map(loc => `<option value="${loc.id}" ${loc.id === currentLocationId ? 'selected' : ''}>${loc.name}</option>`).join('')}
                </select>
            </div>
            <div style="display:flex; gap:0.5rem; justify-content:flex-end; margin-top:1rem;">
                <button onclick="document.getElementById('locationChangeModal').remove()" style="padding:0.5rem 1rem; border:1px solid #ddd; border-radius:8px; background:white; cursor:pointer;">キャンセル</button>
                <button id="locationChangeSubmitBtn" onclick="amExecuteChangeLocation('${childName.replace(/'/g, "\\'")}', document.getElementById('newLocationSelect').value)" style="padding:0.5rem 1rem; border:none; border-radius:8px; background:#1976d2; color:white; cursor:pointer; font-weight:bold;">変更する</button>
            </div>
        </div>
    `;

    // モーダル背景クリックで閉じる
    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
}

// 拠点変更を実行
window.amExecuteChangeLocation = async function(childName, newLocationId) {
    const submitBtn = document.getElementById('locationChangeSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '変更中...';
    }

    try {
        await dataAdapter.updateChildLocation(childName, newLocationId);
        document.getElementById('locationChangeModal')?.remove();

        // メモリ内のデータも更新
        const child = amAllChildrenData.find(c => c.name === childName);
        if (child) {
            child.locationId = newLocationId;
            // 拠点名を取得
            if (newLocationId) {
                try {
                    const locations = await heartUpDB.getLocations();
                    const loc = locations.find(l => l.id === newLocationId);
                    child.locationName = loc ? loc.name : `拠点:${newLocationId}`;
                } catch (e) {
                    child.locationName = `拠点:${newLocationId}`;
                }
            } else {
                child.locationName = '未設定';
            }
        }

        // フィルタと表示を更新
        await amUpdateLocationFilter();
        amRenderChildren(amAllChildrenData);

        alert(`「${childName}」の拠点を変更しました。`);
    } catch (error) {
        console.error('拠点変更エラー:', error);
        alert('拠点変更に失敗しました: ' + error.message);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '変更する';
        }
    }
}

// アセスメントHTMLをform_dataから生成（htmlが空の場合のフォールバック）
function amGenerateAssessmentHtmlFromData(data) {
    if (!data) return '<p>データがありません</p>';
    const fields = [
        { label: '場面や指示の理解', value: data.situationEpisode },
        { label: '共感性', value: data.empathyEpisode },
        { label: '社会的ルール・協調性', value: data.cooperation },
        { label: 'コミュニケーション', value: data.communicationDetails },
        { label: 'こだわり', value: data.persistence },
        { label: '指示の受け入れ', value: data.instructionDetails },
        { label: '集中力', value: data.concentrationDetails },
        { label: '多動性', value: data.hyperactivityDetails },
        { label: '衝動性', value: data.impulsivityDetails },
        { label: 'パニック', value: data.panicDetails },
        { label: '粗大運動', value: data.grossMotorDetails },
        { label: '微細運動', value: data.fineMotorDetails },
        { label: 'バランス', value: data.balanceDetails },
        { label: '生活習慣', value: data.dailyLivingDetails },
        { label: '家庭での配慮', value: data.familySupport }
    ].filter(f => f.value);

    return `
        <div style="padding:20px;">
            <h2 style="color:#2e7d32; margin-bottom:20px; border-bottom:3px solid #4caf50; padding-bottom:10px;">
                ${data.childName || ''}のアセスメントシート
            </h2>
            <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
                <tr>
                    <th style="background:#e8f5e9; padding:10px; border:1px solid #c8e6c9; text-align:left; width:120px;">児童名</th>
                    <td style="padding:10px; border:1px solid #e0e0e0;">${data.childName || ''}（${data.childNameKana || ''}）</td>
                    <th style="background:#e8f5e9; padding:10px; border:1px solid #c8e6c9; text-align:left; width:120px;">生年月日</th>
                    <td style="padding:10px; border:1px solid #e0e0e0;">${data.birthDate || '未設定'}</td>
                </tr>
                <tr>
                    <th style="background:#e8f5e9; padding:10px; border:1px solid #c8e6c9; text-align:left;">性別</th>
                    <td style="padding:10px; border:1px solid #e0e0e0;">${data.gender || '未回答'}</td>
                    <th style="background:#e8f5e9; padding:10px; border:1px solid #c8e6c9; text-align:left;">診断名</th>
                    <td style="padding:10px; border:1px solid #e0e0e0;">${data.diagnosis || 'なし'}</td>
                </tr>
            </table>
            <h3 style="color:#2e7d32; margin:20px 0 15px; font-size:18px;">評価項目</h3>
            ${fields.map(f => `
                <div style="margin-bottom:15px; padding:15px; background:#f9f9f9; border-radius:8px; border-left:4px solid #4caf50;">
                    <h4 style="color:#2e7d32; margin-bottom:8px;">${f.label}</h4>
                    <p style="color:#333; line-height:1.6;">${f.value}</p>
                </div>
            `).join('')}
        </div>
    `;
}

// === モーダル操作 ===
window.amOpenModal = function() {
    const modal = document.getElementById('amAssessmentModal');
    if (modal) modal.classList.add('active');
};

window.amCloseModal = function() {
    const modal = document.getElementById('amAssessmentModal');
    if (modal) modal.classList.remove('active');
};

// === アセスメント表示 ===
window.amViewAssessment = async function(fileName) {
    const assessment = await dataAdapter.getAssessmentWithHtml(fileName);
    if (!assessment) {
        alert('アセスメントデータが見つかりません');
        return;
    }

    const modal = document.getElementById('amAssessmentModal');
    const content = document.getElementById('amAssessmentContent');

    let html = assessment.html;
    if (!html || html.trim() === '') {
        const data = assessment.form_data || assessment.data || {};
        html = amGenerateAssessmentHtmlFromData(data);
    }

    content.innerHTML = html;
    modal.classList.add('active');
};

// === 児童ごとのアセスメント一覧 ===
window.amShowChildAssessments = async function(childName) {
    const assessments = await dataAdapter.getAssessments();
    const modal = document.getElementById('amAssessmentModal');
    const content = document.getElementById('amAssessmentContent');

    const childAssessments = Object.entries(assessments)
        .filter(([_, a]) => a.data?.childName === childName)
        .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt));

    if (childAssessments.length === 0) {
        content.innerHTML = `<h2>${childName}のアセスメント</h2><div class="am-empty-state"><p>アセスメントがありません</p></div>`;
        modal.classList.add('active');
        return;
    }

    // 1件のみなら直接表示
    if (childAssessments.length === 1) {
        await amViewAssessment(childAssessments[0][0]);
        return;
    }

    let html = `<h2>${childName}のアセスメント</h2><div class="am-list-container">`;
    childAssessments.forEach(([fileName, a]) => {
        const esc = fileName.replace(/'/g, "\\'");
        html += `
            <div class="am-list-item">
                <div class="am-list-item-info">
                    <h4>${a.data?.childName || childName}</h4>
                    <p>作成日: ${new Date(a.createdAt).toLocaleDateString('ja-JP')}</p>
                </div>
                <div class="am-list-item-actions">
                    <button class="am-btn am-btn-primary" onclick="amViewAssessment('${esc}')">表示</button>
                    <button class="am-btn am-btn-danger-small" onclick="amDeleteAssessment('${esc}')">削除</button>
                </div>
            </div>`;
    });
    html += '</div>';
    content.innerHTML = html;
    modal.classList.add('active');
};

// === 児童ごとの支援計画一覧 ===
window.amShowChildSupportPlans = async function(childName, latestAssessmentFileName) {
    const supportPlans = await dataAdapter.getSupportPlans();
    const modal = document.getElementById('amAssessmentModal');
    const content = document.getElementById('amAssessmentContent');

    const childPlans = Object.entries(supportPlans)
        .filter(([_, p]) => p.childName === childName)
        .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt));

    let html = `<h2>${childName}の支援計画</h2>`;
    if (latestAssessmentFileName) {
        const esc = latestAssessmentFileName.replace(/'/g, "\\'");
        html += `<div style="margin-bottom:15px;"><button class="am-btn am-btn-secondary" onclick="amGenerateSupportPlan('${esc}')">＋ 新しい支援計画を作成</button></div>`;
    }

    if (childPlans.length === 0) {
        html += `<div class="am-empty-state"><p>支援計画はまだありません。上のボタンから作成できます。</p></div>`;
    } else {
        html += '<div class="am-list-container">';
        childPlans.forEach(([fileName, plan]) => {
            const esc = fileName.replace(/'/g, "\\'");
            html += `
                <div class="am-list-item">
                    <div class="am-list-item-info">
                        <h4>${plan.childName}</h4>
                        <p>種別: ${plan.type === 'support' ? '個別支援計画' : plan.type || '支援計画'}</p>
                        <p>作成日: ${new Date(plan.createdAt).toLocaleDateString('ja-JP')}</p>
                    </div>
                    <div class="am-list-item-actions">
                        <button class="am-btn am-btn-secondary" onclick="amViewSupportPlan('${esc}')">表示</button>
                        <button class="am-btn am-btn-danger-small" onclick="amDeleteSupportPlan('${esc}')">削除</button>
                    </div>
                </div>`;
        });
        html += '</div>';
    }

    content.innerHTML = html;
    modal.classList.add('active');
};

// === 児童ごとの日々の記録一覧 ===
window.amShowChildDailyRecords = async function(childName, latestAssessmentFileName) {
    const dailyReports = await dataAdapter.getDailyReports();
    const modal = document.getElementById('amAssessmentModal');
    const content = document.getElementById('amAssessmentContent');

    const childReports = Object.entries(dailyReports)
        .filter(([_, r]) => r.childName === childName)
        .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt));

    let html = `<h2>${childName}の日々の記録</h2>`;
    if (latestAssessmentFileName) {
        const esc = latestAssessmentFileName.replace(/'/g, "\\'");
        html += `<div style="margin-bottom:15px;"><button class="am-btn am-btn-tertiary" onclick="amCreateDailyReport('${esc}')">＋ 新しい記録を作成</button></div>`;
    }

    if (childReports.length === 0) {
        html += `<div class="am-empty-state"><p>日々の記録はまだありません。上のボタンから作成できます。</p></div>`;
    } else {
        html += '<div class="am-list-container">';
        childReports.forEach(([fileName, report]) => {
            const esc = fileName.replace(/'/g, "\\'");
            html += `
                <div class="am-list-item">
                    <div class="am-list-item-info">
                        <h4>${report.childName}</h4>
                        <p>活動: ${report.activity || report.data?.activity || '（詳細は記録内）'}</p>
                        <p>作成日: ${new Date(report.createdAt).toLocaleDateString('ja-JP')}</p>
                    </div>
                    <div class="am-list-item-actions">
                        <button class="am-btn am-btn-tertiary" onclick="amViewDailyReport('${esc}')">表示</button>
                        <button class="am-btn am-btn-danger-small" onclick="amDeleteDailyReport('${esc}')">削除</button>
                    </div>
                </div>`;
        });
        html += '</div>';
    }

    content.innerHTML = html;
    modal.classList.add('active');
};

// === 児童ごとの成長振り返り一覧 ===
window.amShowChildReviews = async function(childName, latestAssessmentFileName) {
    const reviews = await dataAdapter.getReviews();
    const modal = document.getElementById('amAssessmentModal');
    const content = document.getElementById('amAssessmentContent');

    const childReviews = Object.entries(reviews)
        .filter(([_, r]) => r.childName === childName)
        .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt));

    let html = `<h2>${childName}の成長振り返り</h2>`;
    if (latestAssessmentFileName) {
        const esc = latestAssessmentFileName.replace(/'/g, "\\'");
        html += `<div style="margin-bottom:15px;"><button class="am-btn am-btn-quaternary" onclick="amCreateReview('${esc}')">＋ 新しい振り返りを作成</button></div>`;
    }

    if (childReviews.length === 0) {
        html += `<div class="am-empty-state"><p>成長振り返りはまだありません。上のボタンから作成できます。</p></div>`;
    } else {
        html += '<div class="am-list-container">';
        childReviews.forEach(([fileName, review]) => {
            const esc = fileName.replace(/'/g, "\\'");
            html += `
                <div class="am-list-item">
                    <div class="am-list-item-info">
                        <h4>${review.childName}</h4>
                        <p>作成日: ${new Date(review.createdAt).toLocaleDateString('ja-JP')}</p>
                    </div>
                    <div class="am-list-item-actions">
                        <button class="am-btn am-btn-quaternary" onclick="amViewReview('${esc}')">表示</button>
                        <button class="am-btn am-btn-danger-small" onclick="amDeleteReview('${esc}')">削除</button>
                    </div>
                </div>`;
        });
        html += '</div>';
    }

    content.innerHTML = html;
    modal.classList.add('active');
};

// === 支援計画を生成 ===
window.amGenerateSupportPlan = async function(fileName) {
    let assessment = await dataAdapter.getAssessmentWithHtml(fileName);
    if (!assessment) {
        const assessments = await dataAdapter.getAssessments();
        assessment = assessments[fileName];
    }
    if (assessment && !assessment.data && assessment.form_data) {
        assessment.data = assessment.form_data;
    }

    if (!assessment) {
        alert('アセスメントデータが見つかりません');
        return;
    }

    const confirmMsg = `${assessment.data.childName}さんの支援計画を作成します。よろしいですか？`;
    if (!confirm(confirmMsg)) return;

    // modalとcontent変数を関数スコープで宣言
    let modal;
    let content;
    
    try {
        // ローディング表示を追加
        modal = document.getElementById('amAssessmentModal');
        content = document.getElementById('amAssessmentContent');
        if (modal && content) {
            content.innerHTML = `
                <div class="ai-loading">
                    <img src="soccerball.png" alt="読み込み中" class="ai-loading-ball">
                    <span class="ai-loading-text">AIが支援計画を生成中...</span>
                </div>
            `;
            modal.classList.add('active');
        }
        
        const today = new Date();
        const startDate = today.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '年').replace(/年(\d+)$/, '月$1日');
        const endDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '年').replace(/年(\d+)$/, '月$1日');

        const prompt = `
あなたは放課後等デイサービスの児童発達支援管理責任者です。
以下のアセスメント情報を分析し、公式様式に準拠した個別支援計画をJSON形式で作成してください。

【重要な指示】
- 必ずJSON形式のみを出力してください（説明文は不要）
- すべての項目に具体的な内容を記載してください
- 「ー」や空文字列は使用しないでください
- サッカー療育の文脈で記載してください

【児童情報】
児童名: ${assessment.data.childName}
診断名: ${assessment.data.diagnosis || '発達に課題のあるお子様'}

【アセスメント評価結果】
- 場面や指示の理解: ${assessment.data.situationEpisode || '個別の状況に応じた支援が必要'}
- 共感性: ${assessment.data.empathyEpisode || '他者理解の練習が必要'}
- 社会的ルール: ${assessment.data.cooperation || '集団活動での支援が必要'}
- コミュニケーション: ${assessment.data.communicationDetails || 'コミュニケーション支援が必要'}
- こだわり: ${assessment.data.persistence || '柔軟性の支援が必要'}
- 指示の受け入れ: ${assessment.data.instructionDetails || '指示理解の支援が必要'}
- 集中力: ${assessment.data.concentrationDetails || '集中力の維持支援が必要'}
- 多動性: ${assessment.data.hyperactivityDetails || '活動量の調整支援が必要'}
- 衝動性: ${assessment.data.impulsivityDetails || '衝動コントロールの支援が必要'}
- パニック: ${assessment.data.panicDetails || '感情コントロールの支援が必要'}
- 粗大運動: ${assessment.data.grossMotorDetails || '運動機能の支援が必要'}
- 微細運動: ${assessment.data.fineMotorDetails || '手先の器用さの支援が必要'}
- バランス: ${assessment.data.balanceDetails || 'バランス能力の支援が必要'}
- 生活習慣: ${assessment.data.dailyLivingDetails || '生活習慣の支援が必要'}
- 家庭での配慮: ${assessment.data.familySupport || '家庭との連携が必要'}

【出力形式】
以下のJSON形式で出力してください：
{
  "selfIntent": "本人の生活に対する意向（サッカーを楽しみたい等）",
  "familyIntent": "家族の生活に対する意向（感情のコントロールを学んでほしい等）",
  "supportPolicy": "総合的な支援の方針（200文字程度）",
  "longTermGoal": "長期目標（具体的な達成目標）",
  "shortTermGoal": "短期目標（3ヶ月程度で達成できる目標）",
  "selfSupport": [
    {
      "needs": "本人のニーズ1",
      "goal": "具体的な達成目標1",
      "content": "支援内容（5領域との関連を含む具体的な内容）",
      "period": "6ヶ月",
      "staff": "カラーズFCスタッフ、保護者",
      "notes": "留意事項（本人の役割を含む）",
      "priority": 1
    },
    {
      "needs": "本人のニーズ2",
      "goal": "具体的な達成目標2",
      "content": "支援内容2",
      "period": "6ヶ月",
      "staff": "カラーズFCスタッフ",
      "notes": "留意事項2",
      "priority": 2
    },
    {
      "needs": "本人のニーズ3",
      "goal": "具体的な達成目標3",
      "content": "支援内容3",
      "period": "6ヶ月",
      "staff": "カラーズFCスタッフ",
      "notes": "留意事項3",
      "priority": 3
    }
  ],
  "familySupport": {
    "needs": "家族支援のニーズ",
    "goal": "具体的な達成目標",
    "content": "支援内容",
    "period": "6ヶ月",
    "staff": "カラーズFCスタッフ",
    "notes": "留意事項"
  },
  "transitionSupport": {
    "needs": "移行支援のニーズ",
    "goal": "具体的な達成目標",
    "content": "支援内容",
    "period": "6ヶ月",
    "staff": "カラーズFCスタッフ、学校の先生",
    "notes": "留意事項"
  }
}

JSONのみを出力してください。`;

        const response = await geminiAPI.generateContent(prompt);

        let planData;
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                planData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('JSON not found in response');
            }
        } catch (e) {
            console.error('JSON parse error:', e);
            alert('支援計画の生成に失敗しました。再度お試しください。');
            return;
        }

        const supportPlanHTML = amGenerateOfficialSupportPlanHTML(assessment.data, planData, startDate, endDate);

        const planFileName = `${assessment.data.childName}_支援計画_${new Date().toISOString().split('T')[0]}.html`;
        await dataAdapter.saveSupportPlan(planFileName, supportPlanHTML, assessment.data.childName, planData, 'support');

        alert('支援計画が作成されました！');

        // modalとcontentは既に宣言済みなので再代入
        modal = document.getElementById('amAssessmentModal');
        content = document.getElementById('amAssessmentContent');
        content.innerHTML = supportPlanHTML;
        modal.classList.add('active');
    } catch (error) {
        console.error('Error generating support plan:', error);
        alert('支援計画の作成に失敗しました。もう一度お試しください。');
    }
};

// 公式様式の支援計画HTMLを生成
function amGenerateOfficialSupportPlanHTML(childData, planData, startDate, endDate) {
    const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');

    return `
<div class="container" style="max-width:1100px; margin:0 auto; background:white; padding:30px;">
    <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
        <div>
            <h1 style="font-size:18px; color:#333; margin-bottom:5px;">${childData.childName}さんの個別支援計画（代替支援用）</h1>
        </div>
        <div style="text-align:right; font-size:11px; color:#666;">
            <p>施設名：カラーズFC鳥栖</p>
            <p>利用サービス：放課後等デイサービス</p>
            <p>作成日：${today}</p>
        </div>
    </div>
    <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
        <tr>
            <th style="background:#f0f0f0; padding:8px 10px; border:1px solid #ccc; text-align:left; width:120px; font-weight:bold;">受給者証番号</th>
            <td style="padding:8px 10px; border:1px solid #ccc; width:150px;"></td>
            <th style="background:#f0f0f0; padding:8px 10px; border:1px solid #ccc; text-align:left; width:120px; font-weight:bold;">開始日</th>
            <td style="padding:8px 10px; border:1px solid #ccc; width:120px;">${startDate}</td>
            <th style="background:#f0f0f0; padding:8px 10px; border:1px solid #ccc; text-align:left; width:120px; font-weight:bold;">有効期限</th>
            <td style="padding:8px 10px; border:1px solid #ccc; width:120px;">${endDate}</td>
            <th style="background:#f0f0f0; padding:8px 10px; border:1px solid #ccc; text-align:left; width:120px; font-weight:bold;">作成回数</th>
            <td style="padding:8px 10px; border:1px solid #ccc; width:60px;">1</td>
        </tr>
    </table>
    <div style="display:flex; margin-bottom:10px;">
        <div style="width:150px; font-weight:bold; padding:8px; background:#fff8e1; border:1px solid #ddd;">利用児及び家族の<br>生活に対する意向</div>
        <div style="flex:1; padding:8px; border:1px solid #ddd; border-left:none;">
            <strong>本人：</strong>${planData.selfIntent}<br>
            <strong>家族：</strong>${planData.familyIntent}
        </div>
    </div>
    <div style="display:flex; margin-bottom:10px;">
        <div style="width:150px; font-weight:bold; padding:8px; background:#fff8e1; border:1px solid #ddd;">総合的な支援の方針</div>
        <div style="flex:1; padding:8px; border:1px solid #ddd; border-left:none;">${planData.supportPolicy}</div>
    </div>
    <div style="display:flex; margin-bottom:10px;">
        <div style="width:150px; font-weight:bold; padding:8px; background:#fff8e1; border:1px solid #ddd;">長期目標（内容・期間等）</div>
        <div style="flex:1; padding:8px; border:1px solid #ddd; border-left:none;">${planData.longTermGoal}</div>
        <div style="width:180px; font-weight:bold; padding:8px; background:#fff8e1; border:1px solid #ddd; border-left:none;">支援の標準的な提供時間等<br>（曜日・頻度、時間）</div>
    </div>
    <div style="display:flex; margin-bottom:10px;">
        <div style="width:150px; font-weight:bold; padding:8px; background:#fff8e1; border:1px solid #ddd;">短期目標（内容・期間等）</div>
        <div style="flex:1; padding:8px; border:1px solid #ddd; border-left:none;">${planData.shortTermGoal}</div>
        <div style="width:180px; padding:8px; border:1px solid #ddd; border-left:none;">毎週月・金曜日 12:30〜18:00<br>休校日 10:00〜15:00</div>
    </div>
    <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:11px;">
        <thead>
            <tr>
                <th colspan="2" style="background:#ff9800; color:white; padding:8px; border:1px solid #e65100; text-align:center; font-weight:bold;">項目（本人のニーズ等）</th>
                <th style="background:#ff9800; color:white; padding:8px; border:1px solid #e65100; text-align:center; font-weight:bold;">具体的な達成目標</th>
                <th style="background:#ff9800; color:white; padding:8px; border:1px solid #e65100; text-align:center; font-weight:bold;">支援内容<br>（内容・支援の提供上のポイント・5領域との関連性等）</th>
                <th style="background:#ff9800; color:white; padding:8px; border:1px solid #e65100; text-align:center; font-weight:bold;">達成時期</th>
                <th style="background:#ff9800; color:white; padding:8px; border:1px solid #e65100; text-align:center; font-weight:bold;">担当者<br>提供機関</th>
                <th style="background:#ff9800; color:white; padding:8px; border:1px solid #e65100; text-align:center; font-weight:bold;">留意事項<br>（本人の役割を含む）</th>
                <th style="background:#ff9800; color:white; padding:8px; border:1px solid #e65100; text-align:center; font-weight:bold;">優先順位</th>
            </tr>
        </thead>
        <tbody>
            ${planData.selfSupport.map((item, index) => `
            <tr>
                ${index === 0 ? `<td style="background:#fff8e1; font-weight:bold; text-align:center; width:60px; padding:8px; border:1px solid #ddd; vertical-align:top;" rowspan="${planData.selfSupport.length}">本人支援</td>` : ''}
                <td style="width:120px; padding:8px; border:1px solid #ddd; vertical-align:top;">${item.needs}</td>
                <td style="width:150px; padding:8px; border:1px solid #ddd; vertical-align:top;">${item.goal}</td>
                <td style="width:280px; padding:8px; border:1px solid #ddd; vertical-align:top;">${item.content}</td>
                <td style="width:60px; text-align:center; padding:8px; border:1px solid #ddd; vertical-align:top;">${item.period}</td>
                <td style="width:100px; padding:8px; border:1px solid #ddd; vertical-align:top;">${item.staff}</td>
                <td style="width:180px; padding:8px; border:1px solid #ddd; vertical-align:top;">${item.notes}</td>
                <td style="width:40px; text-align:center; padding:8px; border:1px solid #ddd; vertical-align:top;">${item.priority}</td>
            </tr>
            `).join('')}
            <tr>
                <td style="background:#fff8e1; font-weight:bold; text-align:center; width:60px; padding:8px; border:1px solid #ddd; vertical-align:top;">家族支援</td>
                <td style="padding:8px; border:1px solid #ddd; vertical-align:top;">${planData.familySupport.needs}</td>
                <td style="padding:8px; border:1px solid #ddd; vertical-align:top;">${planData.familySupport.goal}</td>
                <td style="padding:8px; border:1px solid #ddd; vertical-align:top;">${planData.familySupport.content}</td>
                <td style="text-align:center; padding:8px; border:1px solid #ddd; vertical-align:top;">${planData.familySupport.period}</td>
                <td style="padding:8px; border:1px solid #ddd; vertical-align:top;">${planData.familySupport.staff}</td>
                <td style="padding:8px; border:1px solid #ddd; vertical-align:top;">${planData.familySupport.notes}</td>
                <td style="padding:8px; border:1px solid #ddd; vertical-align:top;"></td>
            </tr>
            <tr>
                <td style="background:#fff8e1; font-weight:bold; text-align:center; width:60px; padding:8px; border:1px solid #ddd; vertical-align:top;">移行支援</td>
                <td style="padding:8px; border:1px solid #ddd; vertical-align:top;">${planData.transitionSupport.needs}</td>
                <td style="padding:8px; border:1px solid #ddd; vertical-align:top;">${planData.transitionSupport.goal}</td>
                <td style="padding:8px; border:1px solid #ddd; vertical-align:top;">${planData.transitionSupport.content}</td>
                <td style="text-align:center; padding:8px; border:1px solid #ddd; vertical-align:top;">${planData.transitionSupport.period}</td>
                <td style="padding:8px; border:1px solid #ddd; vertical-align:top;">${planData.transitionSupport.staff}</td>
                <td style="padding:8px; border:1px solid #ddd; vertical-align:top;">${planData.transitionSupport.notes}</td>
                <td style="padding:8px; border:1px solid #ddd; vertical-align:top;"></td>
            </tr>
        </tbody>
    </table>
    <div style="margin-top:30px; display:flex; justify-content:space-between;">
        <div style="width:45%;">
            <div style="display:flex; margin-bottom:10px;">
                <span style="width:100px;">説明同意日</span>
                <span>令和　　年　　月　　日</span>
            </div>
            <div style="display:flex; margin-bottom:10px;">
                <span style="width:100px;">保護者氏名</span>
                <span style="flex:1; border-bottom:1px solid #333;"></span>
            </div>
        </div>
        <div style="width:45%;">
            <p>カラーズFC鳥栖</p>
            <div style="display:flex; margin-bottom:10px;">
                <span style="width:180px;">児童発達支援管理責任者</span>
                <span style="margin-left:20px;">岡本　陸佑</span>
            </div>
        </div>
    </div>
</div>`;
}

// === 日々の記録を作成 ===
window.amCreateDailyReport = async function(fileName) {
    const assessment = await dataAdapter.getAssessmentWithHtml(fileName);
    if (!assessment) {
        alert('アセスメントデータが見つかりません');
        return;
    }
    if (!assessment.data && assessment.form_data) assessment.data = assessment.form_data;

    const activity = prompt(`${assessment.data.childName}さんの本日の活動内容を入力してください:`);
    if (!activity) return;

    const observation = prompt('本日の様子や気づいたことを入力してください:');
    if (!observation) return;

    // modalとcontent変数を関数スコープで宣言
    let modal;
    let content;
    
    try {
        // ローディング表示を追加
        modal = document.getElementById('amAssessmentModal');
        content = document.getElementById('amAssessmentContent');
        if (modal && content) {
            content.innerHTML = `
                <div class="ai-loading">
                    <img src="soccerball.png" alt="読み込み中" class="ai-loading-ball">
                    <span class="ai-loading-text">AIが日々の記録を生成中...</span>
                </div>
            `;
            modal.classList.add('active');
        }
        
        const supportPlans = await dataAdapter.getSupportPlans();
        const childPlans = Object.entries(supportPlans)
            .filter(([key, plan]) => plan.childName === assessment.data.childName)
            .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt));

        const latestPlan = childPlans[0]?.[1];

        const promptText = `
児童発達支援の日々の指導記録を作成してください。

児童名: ${assessment.data.childName}
日付: ${new Date().toLocaleDateString('ja-JP')}

【本日の活動】
${activity}

【観察内容】
${observation}

【参考情報】
アセスメント情報:
- 診断名: ${assessment.data.diagnosis || 'なし'}
- 主な特性: ${assessment.data.situationEpisode}, ${assessment.data.communicationDetails}

${latestPlan ? `支援計画目標: ${latestPlan.html}` : ''}

【記録に含める内容】
1. 活動内容
2. 児童の反応と様子
3. 支援計画との関連
4. 成長が見られた点
5. 今後の支援で注意すべき点

HTMLフォーマットで、見やすく整理された日々の記録を作成してください。
`;

        const reportHTML = await geminiAPI.generateContent(promptText);

        const reportFileName = `${assessment.data.childName}_記録_${new Date().toISOString().split('T')[0]}.html`;
        const today = new Date().toISOString().split('T')[0];
        await dataAdapter.saveDailyReport(reportFileName, reportHTML, assessment.data.childName, today, {
            activity: activity,
            observation: observation
        });

        alert('日々の記録が作成されました！');

        // modalとcontentは既に宣言済みなので再代入
        modal = document.getElementById('amAssessmentModal');
        content = document.getElementById('amAssessmentContent');
        content.innerHTML = reportHTML;
        modal.classList.add('active');
    } catch (error) {
        console.error('Error creating daily report:', error);
        alert('日々の記録の作成に失敗しました。もう一度お試しください。');
    }
};

// === 成長振り返りを作成 ===
window.amCreateReview = async function(fileName) {
    const assessment = await dataAdapter.getAssessmentWithHtml(fileName);
    if (!assessment) {
        alert('アセスメントデータが見つかりません');
        return;
    }
    if (!assessment.data && assessment.form_data) assessment.data = assessment.form_data;

    const confirmMsg = `${assessment.data.childName}さんの成長の振り返りを作成します。よろしいですか？`;
    if (!confirm(confirmMsg)) return;

    // modalとcontent変数を関数スコープで宣言
    let modal;
    let content;
    
    try {
        // ローディング表示を追加
        modal = document.getElementById('amAssessmentModal');
        content = document.getElementById('amAssessmentContent');
        if (modal && content) {
            content.innerHTML = `
                <div class="ai-loading">
                    <img src="soccerball.png" alt="読み込み中" class="ai-loading-ball">
                    <span class="ai-loading-text">AIが成長振り返りを生成中...</span>
                </div>
            `;
            modal.classList.add('active');
        }
        
        const supportPlans = await dataAdapter.getSupportPlans();
        const dailyReports = await dataAdapter.getDailyReports();
        const reviews = await dataAdapter.getReviews();

        const childPlans = Object.entries(supportPlans)
            .filter(([key, plan]) => plan.childName === assessment.data.childName);

        const childReports = Object.entries(dailyReports)
            .filter(([key, report]) => report.childName === assessment.data.childName)
            .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt))
            .slice(0, 10);

        const previousReviews = Object.entries(reviews)
            .filter(([key, review]) => review.childName === assessment.data.childName)
            .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt));

        const promptText = `
児童発達支援の成長の振り返りレポートを作成してください。

児童名: ${assessment.data.childName}
作成日: ${new Date().toLocaleDateString('ja-JP')}

【アセスメント情報】
診断名: ${assessment.data.diagnosis || 'なし'}
主な特性:
- ${assessment.data.situationEpisode}
- ${assessment.data.communicationDetails}

【支援計画】
${childPlans.map(([key, plan]) => plan.html).join('\n')}

【最近の活動記録（直近10件）】
${childReports.map(([key, report]) => `
日付: ${new Date(report.createdAt).toLocaleDateString('ja-JP')}
活動: ${report.activity}
観察: ${report.observation}
`).join('\n')}

${previousReviews.length > 0 ? `
【過去の振り返り】
${previousReviews[0][1].html}
` : ''}

【振り返りレポートに含める内容】
1. この期間の全体的な成長の様子
2. 支援計画の達成状況
3. 特に成長が見られた領域
4. まだ支援が必要な領域
5. 今後の支援の方向性
6. 保護者へのフィードバック

HTMLフォーマットで、グラフや表を使用して視覚的に分かりやすい振り返りレポートを作成してください。
`;

        const reviewHTML = await geminiAPI.generateContent(promptText);

        const reviewFileName = `${assessment.data.childName}_振り返り_${new Date().toISOString().split('T')[0]}.html`;
        await dataAdapter.saveReview(reviewFileName, reviewHTML, assessment.data.childName, {});

        alert('成長の振り返りが作成されました！');

        // modalとcontentは既に宣言済みなので再代入
        modal = document.getElementById('amAssessmentModal');
        content = document.getElementById('amAssessmentContent');
        content.innerHTML = reviewHTML;
        modal.classList.add('active');
    } catch (error) {
        console.error('Error creating review:', error);
        alert('成長の振り返りの作成に失敗しました。もう一度お試しください。');
    }
};

// === 全アセスメント一覧 ===
window.amShowAllAssessments = async function() {
    const container = document.getElementById('amAssessmentListContent');
    if (!container) return;

    const assessments = await dataAdapter.getAssessments();

    if (Object.keys(assessments).length === 0) {
        container.innerHTML = `
            <div class="am-empty-state">
                <h3>登録されているアセスメントはありません</h3>
                <p>「新規アセスメント作成」から始めてください</p>
            </div>
        `;
        return;
    }

    let listHTML = '<h2 style="color:#2e7d32; margin-bottom:20px;">アセスメント一覧</h2><div class="am-list-container">';

    Object.entries(assessments)
        .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt))
        .forEach(([fileName, assessment]) => {
            const childData = assessment.data;
            const escapedFileName = fileName.replace(/'/g, "\\'");
            listHTML += `
                <div class="am-list-item">
                    <div class="am-list-item-info">
                        <h4>${childData.childName}（${childData.childNameKana || ''}）</h4>
                        <p>診断名: ${childData.diagnosis || 'なし'}</p>
                        <p>作成日: ${new Date(assessment.createdAt).toLocaleDateString('ja-JP')}</p>
                    </div>
                    <div class="am-list-item-actions">
                        <button class="am-btn am-btn-primary" onclick="amViewAssessment('${escapedFileName}')">表示</button>
                        <button class="am-btn am-btn-danger-small" onclick="amDeleteAssessment('${escapedFileName}')">削除</button>
                    </div>
                </div>
            `;
        });

    listHTML += '</div>';
    container.innerHTML = listHTML;
};

// === 全支援計画一覧 ===
window.amShowAllSupportPlans = async function() {
    const container = document.getElementById('amPlanListContent');
    if (!container) return;

    const supportPlans = await dataAdapter.getSupportPlans();

    if (Object.keys(supportPlans).length === 0) {
        container.innerHTML = `
            <div class="am-empty-state">
                <h3>作成された支援計画はありません</h3>
                <p>児童のアセスメントから「支援計画」をお試しください</p>
            </div>
        `;
        return;
    }

    let listHTML = '<h2 style="color:#2e7d32; margin-bottom:20px;">支援計画一覧</h2><div class="am-list-container">';

    Object.entries(supportPlans)
        .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt))
        .forEach(([fileName, plan]) => {
            const escapedFileName = fileName.replace(/'/g, "\\'");
            listHTML += `
                <div class="am-list-item">
                    <div class="am-list-item-info">
                        <h4>${plan.childName}</h4>
                        <p>ファイル名: ${fileName}</p>
                        <p>作成日: ${new Date(plan.createdAt).toLocaleDateString('ja-JP')}</p>
                    </div>
                    <div class="am-list-item-actions">
                        <button class="am-btn am-btn-secondary" onclick="amViewSupportPlan('${escapedFileName}')">表示</button>
                        <button class="am-btn am-btn-danger-small" onclick="amDeleteSupportPlan('${escapedFileName}')">削除</button>
                    </div>
                </div>
            `;
        });

    listHTML += '</div>';
    container.innerHTML = listHTML;
};

// === 全成長記録一覧 ===
window.amShowAllReports = async function() {
    const container = document.getElementById('amRecordListContent');
    if (!container) return;

    const dailyReports = await dataAdapter.getDailyReports();
    const reviews = await dataAdapter.getReviews();

    const hasReports = Object.keys(dailyReports).length > 0;
    const hasReviews = Object.keys(reviews).length > 0;

    if (!hasReports && !hasReviews) {
        container.innerHTML = `
            <div class="am-empty-state">
                <h3>記録はまだありません</h3>
                <p>児童のアセスメントから「日々の記録」または「成長振り返り」を作成してください</p>
            </div>
        `;
        return;
    }

    let listHTML = '<h2 style="color:#2e7d32; margin-bottom:20px;">成長記録一覧</h2>';

    if (hasReports) {
        listHTML += '<h3 style="margin: 20px 0 10px; color: #ff9800;">日々の記録</h3><div class="am-list-container">';
        Object.entries(dailyReports)
            .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt))
            .forEach(([fileName, report]) => {
                const escapedFileName = fileName.replace(/'/g, "\\'");
                listHTML += `
                    <div class="am-list-item">
                        <div class="am-list-item-info">
                            <h4>${report.childName}</h4>
                            <p>活動: ${report.activity || '（詳細は記録内）'}</p>
                            <p>作成日: ${new Date(report.createdAt).toLocaleDateString('ja-JP')}</p>
                        </div>
                        <div class="am-list-item-actions">
                            <button class="am-btn am-btn-tertiary" onclick="amViewDailyReport('${escapedFileName}')">表示</button>
                            <button class="am-btn am-btn-danger-small" onclick="amDeleteDailyReport('${escapedFileName}')">削除</button>
                        </div>
                    </div>
                `;
            });
        listHTML += '</div>';
    }

    if (hasReviews) {
        listHTML += '<h3 style="margin: 20px 0 10px; color: #2196f3;">成長振り返り</h3><div class="am-list-container">';
        Object.entries(reviews)
            .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt))
            .forEach(([fileName, review]) => {
                const escapedFileName = fileName.replace(/'/g, "\\'");
                listHTML += `
                    <div class="am-list-item">
                        <div class="am-list-item-info">
                            <h4>${review.childName}</h4>
                            <p>作成日: ${new Date(review.createdAt).toLocaleDateString('ja-JP')}</p>
                        </div>
                        <div class="am-list-item-actions">
                            <button class="am-btn am-btn-quaternary" onclick="amViewReview('${escapedFileName}')">表示</button>
                            <button class="am-btn am-btn-danger-small" onclick="amDeleteReview('${escapedFileName}')">削除</button>
                        </div>
                    </div>
                `;
            });
        listHTML += '</div>';
    }

    container.innerHTML = listHTML;
};

// === アセスメント削除 ===
window.amDeleteAssessment = async function(fileName) {
    if (!confirm('このアセスメントを削除しますか？\n※関連する支援計画や活動記録は削除されません')) {
        return;
    }
    try {
        await dataAdapter.deleteAssessment(fileName);
        alert('削除しました');
        amCloseModal();
        await amLoadChildren();
    } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
    }
};

// === 支援計画削除 ===
window.amDeleteSupportPlan = async function(fileName) {
    if (!confirm('この支援計画を削除しますか？')) {
        return;
    }
    try {
        await dataAdapter.deleteSupportPlan(fileName);
        alert('削除しました');
        amCloseModal();
        await amLoadChildren();
    } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
    }
};

// === 支援計画を表示 ===
window.amViewSupportPlan = async function(fileName) {
    const plan = await dataAdapter.getSupportPlanWithHtml(fileName);
    const modal = document.getElementById('amAssessmentModal');
    const content = document.getElementById('amAssessmentContent');
    if (!plan) {
        content.innerHTML = '<div class="am-empty-state"><p>支援計画が見つかりません</p></div>';
        modal.classList.add('active');
        return;
    }
    content.innerHTML = plan.html || '<div class="am-empty-state"><p>支援計画のHTMLデータがありません</p></div>';
    modal.classList.add('active');
};

// === 日々の記録を表示 ===
window.amViewDailyReport = async function(fileName) {
    const report = await dataAdapter.getDailyReportWithHtml(fileName);
    const modal = document.getElementById('amAssessmentModal');
    const content = document.getElementById('amAssessmentContent');
    if (!report) {
        content.innerHTML = '<div class="am-empty-state"><p>記録が見つかりません</p></div>';
        modal.classList.add('active');
        return;
    }
    const rendered = (typeof renderDailyReportForView === 'function')
        ? renderDailyReportForView(report)
        : (report.html || '');
    content.innerHTML = rendered || '<div class="am-empty-state"><p>記録のHTMLデータがありません</p></div>';
    modal.classList.add('active');
};

// === 日々の記録を削除 ===
window.amDeleteDailyReport = async function(fileName) {
    if (!confirm('この記録を削除しますか？')) {
        return;
    }
    try {
        await dataAdapter.deleteDailyReport(fileName);
        alert('削除しました');
        amCloseModal();
        await amLoadChildren();
    } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
    }
};

// === 成長振り返りを表示 ===
window.amViewReview = async function(fileName) {
    const review = await dataAdapter.getReviewWithHtml(fileName);
    const modal = document.getElementById('amAssessmentModal');
    const content = document.getElementById('amAssessmentContent');
    if (!review) {
        content.innerHTML = '<div class="am-empty-state"><p>振り返りが見つかりません</p></div>';
        modal.classList.add('active');
        return;
    }
    content.innerHTML = review.html || '<div class="am-empty-state"><p>振り返りのHTMLデータがありません</p></div>';
    modal.classList.add('active');
};

// === 成長振り返りを削除 ===
window.amDeleteReview = async function(fileName) {
    if (!confirm('この成長振り返りを削除しますか？')) {
        return;
    }
    try {
        await dataAdapter.deleteReview(fileName);
        alert('削除しました');
        amCloseModal();
        await amLoadChildren();
    } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
    }
};

// === 拠点変更機能 ===

// 拠点変更モーダルを表示
window.amShowChangeLocationModal = function(childName, currentLocationId, currentLocationName) {
    console.log('拠点変更モーダル表示:', childName, currentLocationId, currentLocationName);
    
    // モーダルHTMLを生成
    const modalHtml = `
        <div id="amLocationChangeModal" class="am-modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
            <div class="am-modal-content" style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <h3 style="color: #2e7d32; margin-bottom: 20px;">拠点変更: ${childName}</h3>
                <p style="margin-bottom: 20px; color: #666;">現在の拠点: <strong>${currentLocationName || '未設定'}</strong></p>
                
                <div class="am-location-options" style="margin-bottom: 25px;">
                    <h4 style="margin-bottom: 10px; color: #444;">新しい拠点を選択:</h4>
                    <div class="am-location-option" style="margin: 8px 0; padding: 12px; background: #f8f9fa; border-radius: 8px; cursor: pointer; border: 2px solid #e0e0e0;" 
                         onclick="amChangeLocation('${childName}', 'デフォルト拠点')">
                        <strong>デフォルト拠点</strong>
                        <span style="color: #666; font-size: 0.9rem; display: block; margin-top: 4px;">基本の拠点</span>
                    </div>
                    <div class="am-location-option" style="margin: 8px 0; padding: 12px; background: #f8f9fa; border-radius: 8px; cursor: pointer; border: 2px solid #e0e0e0;" 
                         onclick="amChangeLocation('${childName}', 'カラーズFC鳥栖')">
                        <strong>カラーズFC鳥栖</strong>
                        <span style="color: #666; font-size: 0.9rem; display: block; margin-top: 4px;">鳥栖市の拠点</span>
                    </div>
                    <div class="am-location-option" style="margin: 8px 0; padding: 12px; background: #f8f9fa; border-radius: 8px; cursor: pointer; border: 2px solid #e0e0e0;" 
                         onclick="amChangeLocation('${childName}', '鳥栖')">
                        <strong>鳥栖</strong>
                        <span style="color: #666; font-size: 0.9rem; display: block; margin-top: 4px;">鳥栖市（旧名称）</span>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button onclick="amCloseLocationChangeModal()" style="padding: 10px 20px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 6px; cursor: pointer;">
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // モーダルを追加
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// 拠点変更モーダルを閉じる
window.amCloseLocationChangeModal = function() {
    const modal = document.getElementById('amLocationChangeModal');
    if (modal) {
        modal.remove();
    }
};

// 拠点変更を実行
window.amChangeLocation = async function(childName, newLocationName) {
    console.log('拠点変更実行:', childName, '→', newLocationName);
    
    // 確認ダイアログ
    if (!confirm(`${childName}の拠点を「${newLocationName}」に変更しますか？`)) {
        return;
    }
    
    try {
        // モーダルを閉じる
        amCloseLocationChangeModal();
        
        // ローディング表示
        const loadingMsg = document.createElement('div');
        loadingMsg.id = 'amLocationChangeLoading';
        loadingMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 8px; z-index: 1001;';
        loadingMsg.innerHTML = `<div style="text-align: center;">拠点を変更中...</div>`;
        document.body.appendChild(loadingMsg);
        
        // 拠点変更処理
        console.log('拠点変更処理開始:', childName, newLocationName);
        
        // dataAdapterを使用して拠点を更新
        await dataAdapter.updateChildLocation(childName, newLocationName);
        
        // ローディングを削除
        const loading = document.getElementById('amLocationChangeLoading');
        if (loading) loading.remove();
        
        // 成功メッセージ
        alert(`${childName}の拠点を「${newLocationName}」に変更しました！`);
        
        // データを再読み込み
        await amLoadChildren();
        
    } catch (error) {
        console.error('拠点変更エラー:', error);
        alert('拠点変更に失敗しました: ' + error.message);
        
        // ローディングを削除
        const loading = document.getElementById('amLocationChangeLoading');
        if (loading) loading.remove();
    }
};
