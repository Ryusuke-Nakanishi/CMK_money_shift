  import { initializeApp } from 'firebase/app';
  import { getAuth, onAuthStateChanged, signOut }
    from 'firebase/auth';
  import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, getDocs, deleteDoc, addDoc, updateDoc, query, orderBy, where }
    from 'firebase/firestore';

  const firebaseConfig = {
    apiKey: "AIzaSyB4JpPFCP0tigTHFaHkwVihEBfa24-oaJ8",
    authDomain: "shift-app-1fa59.firebaseapp.com",
    projectId: "shift-app-1fa59",
    storageBucket: "shift-app-1fa59.firebasestorage.app",
    messagingSenderId: "1014397065555",
    appId: "1:1014397065555:web:d681d7b76c565313b569a6"
  };

  const app  = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db   = getFirestore(app);
  let unsubscribe    = null;
  let expiryTimer    = null;

  // トークン有効期限を監視してステータスバーを更新
  function startExpiryWatch() {
    if (expiryTimer) clearInterval(expiryTimer);
    expiryTimer = setInterval(() => {
      const expiresAt = parseInt(localStorage.getItem('gcal_token_expires') || '0');
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        clearInterval(expiryTimer);
        localStorage.removeItem('gcal_token');
        localStorage.removeItem('gcal_token_expires');
        window.location.href = '/login.html';
      } else if (remaining <= 5 * 60 * 1000) {
        setStatusBar('expiring');
      } else if (window._statusState === 'synced') {
        setStatusBar('synced'); // 残り時間を毎分更新
      }
    }, 60 * 1000); // 1分ごとにチェック・更新
  }

  // 再ログイン（トークンをクリアしてログインページへ）
  window.reloginNow = function() {
    localStorage.removeItem('gcal_token');
    localStorage.removeItem('gcal_token_expires');
    window.location.href = '/login.html';
  };

  // ログアウト
  window.doSignOut = async function() {
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
    if (expiryTimer) { clearInterval(expiryTimer); expiryTimer = null; }
    localStorage.removeItem('gcal_token');
    localStorage.removeItem('gcal_token_expires');
    localStorage.removeItem('gcal_uid');
    localStorage.removeItem('login_time');
    await signOut(auth);
    window.location.href = '/login.html';
  };

  // データ保存
  window.saveToFirebase = async function(shifts, rates, rateHistory, payments) {
    const user = auth.currentUser; if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        shifts, rates, rateHistory: rateHistory||[], payments: payments||{}, updatedAt: Date.now()
      });
      updateSyncTime();
    } catch(e) { console.warn('Firebase save error', e); }
  };

  // ステータスバー更新
  function setStatusBar(state) {
    const bar = document.getElementById('status-bar');
    if (!bar) return;
    const expiresAt = parseInt(localStorage.getItem('gcal_token_expires') || '0');
    const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 60000));
    if (state === 'synced') {
      bar.style.display='flex';bar.style.background='var(--success-bg)';bar.style.color='var(--success-text)';bar.style.borderBottom='0.5px solid var(--success-text)';
      const name = window._displayName || auth.currentUser?.displayName || auth.currentUser?.email || '';
      bar.innerHTML=`✓ 同期済み &nbsp;<strong>${name}</strong><span style="margin-left:auto;font-size:11px">残り${remaining}分 | ${new Date().toLocaleTimeString('ja-JP')}</span>`;
    } else if (state === 'syncing') {
      bar.style.display='flex';bar.style.background='var(--warning-bg)';bar.style.color='var(--warning-text)';bar.style.borderBottom='0.5px solid var(--close-color)';
      bar.innerHTML='⟳ 同期中...';
    } else if (state === 'expiring') {
      bar.style.display='flex';bar.style.background='var(--warning-bg)';bar.style.color='var(--warning-text)';bar.style.borderBottom='0.5px solid var(--close-color)';
      bar.innerHTML=`⚠ セッションの有効期限が間もなく切れます（残り${remaining}分）&nbsp;<button onclick="reloginNow()" style="font-size:11px;padding:2px 8px;cursor:pointer;border:.5px solid var(--warning-text);border-radius:4px;background:none;color:var(--warning-text);font-family:inherit">再ログイン</button>`;
    } else {
      bar.style.display='none';
    }
  }

  function updateSyncTime() {
    const bar = document.getElementById('status-bar');
    if (!bar || window._statusState !== 'synced') return;
    setStatusBar('synced');
  }

  // リアルタイム同期
  function startSync(user) {
    if (unsubscribe) unsubscribe();
    setStatusBar('syncing');
    window._statusState = 'syncing';
    unsubscribe = onSnapshot(doc(db, 'users', user.uid), snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.shifts)      window._fbShifts     = data.shifts;
        if (data.rates)       window._fbRates       = data.rates;
        if (data.rateHistory) window._fbRateHistory = data.rateHistory;
        if (data.payments)    window._fbPayments    = data.payments;
        if (typeof window.onFirebaseDataLoaded === 'function') window.onFirebaseDataLoaded();
      }
      window._statusState = 'synced';
      setStatusBar('synced');
    }, err => {
      console.warn('snapshot error', err);
    });
  }


  // ── MTG調整 Firebase操作 ──
  window.createMTG = async function(data) {
    try {
      const ref = await addDoc(collection(db, 'mtgList'), {
        ...data, createdAt: Date.now(), status: '調整中'
      });
      return ref.id;
    } catch(e) { console.warn('createMTG error', e); return null; }
  };
  window.fetchMTGList = async function() {
    try {
      const snap = await getDocs(query(collection(db, 'mtgList'), orderBy('createdAt', 'desc')));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { console.warn('fetchMTGList error', e); return []; }
  };
  window.fetchMTG = async function(id) {
    try {
      const snap = await getDoc(doc(db, 'mtgList', id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch(e) { console.warn('fetchMTG error', e); return null; }
  };
  window.updateMTG = async function(id, data) {
    try {
      await updateDoc(doc(db, 'mtgList', id), data);
      return true;
    } catch(e) { console.warn('updateMTG error', e); return false; }
  };
  window.deleteMTG = async function(id) {
    try {
      await deleteDoc(doc(db, 'mtgList', id));
      return true;
    } catch(e) { console.warn('deleteMTG error', e); return false; }
  };
  // ── Q&A Firebase操作 ──
  window.fetchQAList = async function() {
    try {
      const snap = await getDocs(collection(db, 'qaList'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { console.warn('fetchQAList error', e); return []; }
  };
  window.addQAItem = async function(keywords, answer) {
    try {
      await addDoc(collection(db, 'qaList'), { keywords, answer, createdAt: Date.now() });
      return true;
    } catch(e) { console.warn('addQAItem error', e); return false; }
  };
  window.updateQAItem = async function(id, keywords, answer) {
    try {
      await updateDoc(doc(db, 'qaList', id), { keywords, answer, updatedAt: Date.now() });
      return true;
    } catch(e) { console.warn('updateQAItem error', e); return false; }
  };
  window.deleteQAItem = async function(id) {
    try {
      await deleteDoc(doc(db, 'qaList', id));
      return true;
    } catch(e) { console.warn('deleteQAItem error', e); return false; }
  };

  // ── チャットボットのカテゴリボタン（CHAT_TREE）管理 ──
  window.fetchChatCategories = async function() {
    try {
      const snap = await getDocs(collection(db, 'chatCategories'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { console.warn('fetchChatCategories error', e); return []; }
  };
  window.addChatCategoryItem = async function(category, subcategory, answer) {
    try {
      await addDoc(collection(db, 'chatCategories'), { category, subcategory, answer, createdAt: Date.now() });
      return true;
    } catch(e) { console.warn('addChatCategoryItem error', e); return false; }
  };
  window.updateChatCategoryItem = async function(id, category, subcategory, answer) {
    try {
      await updateDoc(doc(db, 'chatCategories', id), { category, subcategory, answer, updatedAt: Date.now() });
      return true;
    } catch(e) { console.warn('updateChatCategoryItem error', e); return false; }
  };
  window.deleteChatCategoryItem = async function(id) {
    try {
      await deleteDoc(doc(db, 'chatCategories', id));
      return true;
    } catch(e) { console.warn('deleteChatCategoryItem error', e); return false; }
  };

  // ── 講師評価 Firebase操作 ──
  // 新規評価の作成
  window.createEvaluation = async function(data) {
    try {
      const ref = await addDoc(collection(db, 'evaluations'), {
        ...data,
        published: false, // 作成時は非公開。準UL以上が個別に公開するまで本人には見えない
        evaluatedAt: Date.now(),
      });
      return ref.id;
    } catch(e) { console.warn('createEvaluation error', e); return null; }
  };
  // 評価の公開・非公開を切り替える（準UL以上）
  window.setEvaluationPublished = async function(id, published) {
    try {
      await updateDoc(doc(db, 'evaluations', id), { published });
      return true;
    } catch(e) { console.warn('setEvaluationPublished error', e); return false; }
  };
  // 評価の更新（編集時：評価者・評価日を編集者・編集日で上書き）
  window.updateEvaluation = async function(id, data) {
    try {
      await updateDoc(doc(db, 'evaluations', id), { ...data, evaluatedAt: Date.now() });
      return true;
    } catch(e) { console.warn('updateEvaluation error', e); return false; }
  };
  // 評価の削除（UL以上）
  window.deleteEvaluation = async function(id) {
    try {
      await deleteDoc(doc(db, 'evaluations', id));
      return true;
    } catch(e) { console.warn('deleteEvaluation error', e); return false; }
  };
  // 特定の1件を取得
  window.fetchEvaluation = async function(id) {
    try {
      const snap = await getDoc(doc(db, 'evaluations', id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch(e) { console.warn('fetchEvaluation error', e); return null; }
  };
  // ある講師の評価を新しい順に全件取得（本人の閲覧・アーカイブ表示用）
  window.fetchEvaluationsForStaff = async function(staffEmail) {
    // ここではエラーを握りつぶさず呼び出し元に伝える（UI側で「未登録」と「エラー」を区別して表示するため）
    const snap = await getDocs(query(
      collection(db, 'evaluations'),
      where('staffEmail', '==', staffEmail),
      orderBy('evaluatedAt', 'desc')
    ));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  };
  // 全講師分の評価を新しい順に全件取得（評価者向け一覧・管理用）
  window.fetchAllEvaluations = async function() {
    try {
      const snap = await getDocs(query(collection(db, 'evaluations'), orderBy('evaluatedAt', 'desc')));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { console.warn('fetchAllEvaluations error', e); return []; }
  };

  // ── お気に入りタブ設定 ──
  window.updateFavoriteTabs = async function(email, favoriteTabs) {
    try {
      await setDoc(doc(db, 'allowedUsers', email), { favoriteTabs }, { merge: true });
      return true;
    } catch(e) { console.warn('updateFavoriteTabs error', e); return false; }
  };

  // ── 講師の担当コース・レベル ──
  window.updateStaffCourses = async function(email, courses) {
    try {
      await setDoc(doc(db, 'allowedUsers', email), { courses }, { merge: true });
      return true;
    } catch(e) { console.warn('updateStaffCourses error', e); return false; }
  };
  window.updateStaffLevel = async function(email, level) {
    try {
      await setDoc(doc(db, 'allowedUsers', email), { level }, { merge: true });
      return true;
    } catch(e) { console.warn('updateStaffLevel error', e); return false; }
  };

  // ── ユニット（チーム）管理 ──
  window.fetchAllUnits = async function() {
    try {
      const snap = await getDocs(collection(db, 'units'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { console.warn('fetchAllUnits error', e); return []; }
  };
  window.createUnit = async function(data) {
    try {
      const ref = await addDoc(collection(db, 'units'), data);
      return ref.id;
    } catch(e) { console.warn('createUnit error', e); return null; }
  };
  window.updateUnit = async function(id, data) {
    try {
      await updateDoc(doc(db, 'units', id), data);
      return true;
    } catch(e) { console.warn('updateUnit error', e); return false; }
  };
  window.deleteUnit = async function(id) {
    try {
      await deleteDoc(doc(db, 'units', id));
      return true;
    } catch(e) { console.warn('deleteUnit error', e); return false; }
  };
  // ユニット削除（関連データもまとめて削除するカスケード版）
  // 削除対象：各講師の「所属ユニット設定」に残っている、このユニットIDへの参照
  window.cascadeDeleteUnit = async function(id) {
    const result = { referencesCleared:0, errors:[] };
    try {
      const usersSnap = await getDocs(collection(db, 'allowedUsers'));
      for (const d of usersSnap.docs) {
        const units = d.data().units;
        if (!Array.isArray(units) || !units.some(a => a.unit === id)) continue;
        const filtered = units.filter(a => a.unit !== id);
        try {
          await setDoc(doc(db, 'allowedUsers', d.id), { units: filtered }, { merge: true });
          result.referencesCleared++;
        } catch(e) { result.errors.push(`${d.id} の所属ユニット更新に失敗: ` + e.message); }
      }
      await deleteDoc(doc(db, 'units', id));
    } catch(e) { result.errors.push('ユニット本体の削除に失敗: ' + e.message); }
    return result;
  };
  // 講師の所属ユニット設定（メイン1つ＋準メンバーとして複数）
  window.updateStaffUnits = async function(email, units) {
    try {
      await setDoc(doc(db, 'allowedUsers', email), { units }, { merge: true });
      return true;
    } catch(e) { console.warn('updateStaffUnits error', e); return false; }
  };

  // 役職定義
  window.ROLES = {
    admin:      { label:'管理者',             level:6 },
    operator:   { label:'オペレーター',        level:5 },
    ul:         { label:'ユニットリーダー',     level:4 },
    sub_ul:     { label:'準ユニットリーダー',   level:3 },
    instructor: { label:'講師',               level:2 },
    trainee:    { label:'研修中',             level:1 },
  };
  window._currentUser = null; // allowedUsersのデータ

  // allowedUsersからユーザー情報取得
  async function fetchAllowedUser(email) {
    try {
      const snap = await getDoc(doc(db, 'allowedUsers', email));
      if (snap.exists()) return snap.data();
      return null;
    } catch(e) { console.warn('fetchAllowedUser error', e); return null; }
  }

  // allowedUsers全件取得（管理者用）
  window.fetchAllUsers = async function() {
    try {
      const snap = await getDocs(collection(db, 'allowedUsers'));
      return snap.docs.map(d => ({ email: d.id, ...d.data() }));
    } catch(e) { console.warn('fetchAllUsers error', e); return []; }
  };

  // ユーザー追加
  window.addAllowedUser = async function(email, name, role) {
    try {
      await setDoc(doc(db, 'allowedUsers', email), {
        name, role, addedAt: new Date().toISOString().slice(0,10),
        addedBy: auth.currentUser?.email || ''
      });
      return true;
    } catch(e) { console.warn('addAllowedUser error', e); return false; }
  };

  // ── 仮登録（メールアドレス未定の講師を、名前だけで先に登録する） ──
  // 仮登録IDは自動採番。このIDが確定するまでの間、staffEmail等の代わりとして使われる
  window.createPendingStaff = async function(name, role) {
    try {
      const ref = await addDoc(collection(db, 'allowedUsers'), {
        name, role: role || 'instructor', isPending: true,
        addedAt: new Date().toISOString().slice(0,10),
        addedBy: auth.currentUser?.email || ''
      });
      return ref.id;
    } catch(e) { console.warn('createPendingStaff error', e); return null; }
  };
  // 仮登録に、判明した本人のメールアドレスを紐付ける（評価・ユニットのリーダー設定もあわせて移行する）
  window.linkPendingStaffToEmail = async function(pendingId, realEmail) {
    const result = { success:false, evaluationsMigrated:0, unitsMigrated:0, errors:[] };
    try {
      const pendingSnap = await getDoc(doc(db, 'allowedUsers', pendingId));
      if (!pendingSnap.exists()) { result.errors.push('仮登録データが見つかりません'); return result; }
      const existingSnap = await getDoc(doc(db, 'allowedUsers', realEmail));
      if (existingSnap.exists()) { result.errors.push('このメールアドレスはすでに別のユーザーとして登録されています'); return result; }

      const data = pendingSnap.data();
      delete data.isPending;
      await setDoc(doc(db, 'allowedUsers', realEmail), data);

      try {
        const evalSnap = await getDocs(query(collection(db, 'evaluations'), where('staffEmail', '==', pendingId)));
        for (const d of evalSnap.docs) { await updateDoc(doc(db, 'evaluations', d.id), { staffEmail: realEmail }); result.evaluationsMigrated++; }
      } catch(e) { result.errors.push('評価データの移行に失敗: ' + e.message); }

      try {
        const unitSnap = await getDocs(query(collection(db, 'units'), where('leaderEmail', '==', pendingId)));
        for (const d of unitSnap.docs) { await updateDoc(doc(db, 'units', d.id), { leaderEmail: realEmail }); result.unitsMigrated++; }
      } catch(e) { result.errors.push('ユニットのリーダー設定の移行に失敗: ' + e.message); }

      await deleteDoc(doc(db, 'allowedUsers', pendingId));
      result.success = true;
    } catch(e) { result.errors.push('紐付けに失敗: ' + e.message); }
    return result;
  };

  // ユーザー削除
  window.removeAllowedUser = async function(email) {
    try {
      await deleteDoc(doc(db, 'allowedUsers', email));
      return true;
    } catch(e) { console.warn('removeAllowedUser error', e); return false; }
  };

  // ユーザー削除（関連データもまとめて削除するカスケード版）
  // 削除対象：①シフト・時給・支払い履歴(users/{uid}) ②その人が受けた講師評価(evaluations)
  //          ③リーダーに設定されていたユニットのleaderEmail（ユニット自体は残し、リーダー未設定に戻す）
  // 削除しない（履歴として残す）：MTG調整の作成者・招待履歴、Q&Aの投稿内容
  window.cascadeDeleteUser = async function(email) {
    const result = { uidDeleted:false, evaluationsDeleted:0, unitsCleared:0, errors:[] };
    try {
      // uidを取得（無ければusers側のシフト履歴は削除できない＝古いデータで未記録の場合のみ）
      const allowedSnap = await getDoc(doc(db, 'allowedUsers', email));
      const uid = allowedSnap.exists() ? allowedSnap.data().uid : null;

      if (uid) {
        try { await deleteDoc(doc(db, 'users', uid)); result.uidDeleted = true; }
        catch(e) { result.errors.push('シフト履歴の削除に失敗: ' + e.message); }
      }

      try {
        const evalSnap = await getDocs(query(collection(db, 'evaluations'), where('staffEmail', '==', email)));
        for (const d of evalSnap.docs) { await deleteDoc(doc(db, 'evaluations', d.id)); result.evaluationsDeleted++; }
      } catch(e) { result.errors.push('評価データの削除に失敗: ' + e.message); }

      try {
        const unitSnap = await getDocs(query(collection(db, 'units'), where('leaderEmail', '==', email)));
        for (const d of unitSnap.docs) { await updateDoc(doc(db, 'units', d.id), { leaderEmail: null }); result.unitsCleared++; }
      } catch(e) { result.errors.push('ユニットのリーダー解除に失敗: ' + e.message); }

      await deleteDoc(doc(db, 'allowedUsers', email));
    } catch(e) { result.errors.push('ユーザー本体の削除に失敗: ' + e.message); }
    return result;
  };

  // 役職変更
  window.updateUserRole = async function(email, newRole) {
    try {
      const snap = await getDoc(doc(db, 'allowedUsers', email));
      if (!snap.exists()) return false;
      await setDoc(doc(db, 'allowedUsers', email), { ...snap.data(), role: newRole });
      return true;
    } catch(e) { console.warn('updateUserRole error', e); return false; }
  };

  // 業務タイプ（教材開発・SNSマーケティングなど、役職とは別枠の権限付与に使う）
  window.updateStaffTypes = async function(email, staffTypes) {
    try {
      await setDoc(doc(db, 'allowedUsers', email), { staffTypes }, { merge: true });
      return true;
    } catch(e) { console.warn('updateStaffTypes error', e); return false; }
  };

  // 認証状態監視
  onAuthStateChanged(auth, async user => {
    const userName = document.getElementById('auth-user-name');
    if (user) {
      // allowedUsersチェック
      const allowedData = await fetchAllowedUser(user.email);
      if (!allowedData) {
        // 未登録ユーザー → ログアウトしてlogin.htmlへ
        await signOut(auth);
        localStorage.removeItem('gcal_token');
        localStorage.removeItem('gcal_token_expires');
        window.location.href = '/login.html?error=not_allowed';
        return;
      }
      // ユーザー情報を保存
      window._currentUser = { ...allowedData, uid: user.uid, email: user.email };
      // allowedUsersにuidを記録（メールアドレスからシフト履歴(users/{uid})を特定できるようにするため）
      if (allowedData.uid !== user.uid) {
        setDoc(doc(db, 'allowedUsers', user.email), { uid: user.uid }, { merge: true }).catch(e => console.warn('uid記録エラー', e));
      }
      // 表示名をallowedUsersのnameから取得
      const displayName = allowedData.name || user.displayName || user.email;
      if (userName) userName.textContent = displayName;
      // 役職バッジを設定タブに表示
      const roleEl = document.getElementById('user-role-badge');
      if (roleEl) {
        const roleLabel = window.ROLES[allowedData.role]?.label || allowedData.role;
        roleEl.textContent = roleLabel;
      }
      // タブバー（お気に入り＋メニュー構成）を描画
      if (typeof window.renderTabBar === 'function') window.renderTabBar();

      // 別アカウント切り替え検知
      const prevUid = localStorage.getItem('gcal_uid');
      if (prevUid && prevUid !== user.uid) {
        localStorage.removeItem('shifts_v3');
        if (typeof window.onAccountChanged === 'function') window.onAccountChanged();
      }
      localStorage.setItem('gcal_uid', user.uid);
      window._gcalToken = localStorage.getItem('gcal_token');
      startSync(user);
      startExpiryWatch();
      // ステータスバーに登録名を表示
      window._displayName = displayName;
    } else {
      window.location.href = '/login.html';
    }
  });
