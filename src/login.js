import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

// メンテナンス告知の表示（未ログインでも見られるよう、settingsコレクションは読み取りを公開している）
function nextMaintenanceOccurrence(a) {
  const [sh,sm] = (a.startTime||'00:00').split(':').map(Number);
  const [eh,em] = (a.endTime||'00:00').split(':').map(Number);
  const now = new Date();
  let end = new Date(now.getFullYear(), now.getMonth(), a.dayOfMonth, eh, em);
  if (end < now) end = new Date(now.getFullYear(), now.getMonth()+1, a.dayOfMonth, eh, em);
  const start = new Date(end.getFullYear(), end.getMonth(), a.dayOfMonth, sh, sm);
  return { start, end };
}
function isWithinMaintenanceWindow(a) {
  if (!a.dayOfMonth) return false;
  const { start, end } = nextMaintenanceOccurrence(a);
  const displayStart = new Date(start);
  displayStart.setDate(displayStart.getDate() - (a.daysBeforeToShow || 8));
  displayStart.setHours(0,0,0,0);
  const now = new Date();
  return now >= displayStart && now <= end;
}
function fmtMaintOccurrence(a) {
  const { start, end } = nextMaintenanceOccurrence(a);
  const months=['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  const fmt=(d)=>`${d.getFullYear()}年${months[d.getMonth()]}${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  return `${fmt(start)} 〜 ${fmt(end)}`;
}
function isWithinTemporaryWindow(t) {
  if (!t.startAt || !t.endAt) return false;
  const end = new Date(t.endAt);
  const displayStart = new Date(t.startAt);
  displayStart.setDate(displayStart.getDate() - (t.daysBeforeToShow || 0));
  const now = new Date();
  return now >= displayStart && now <= end;
}
function fmtTempOccurrence(t) {
  const months=['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  const fmt=(v)=>{ const d=new Date(v); return `${d.getFullYear()}年${months[d.getMonth()]}${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
  return `${fmt(t.startAt)} 〜 ${fmt(t.endAt)}`;
}
(async () => {
  try {
    const [snapA, snapT] = await Promise.all([
      getDoc(doc(db, 'settings', 'maintenanceAnnouncement')),
      getDoc(doc(db, 'settings', 'temporaryMaintenance')),
    ]);
    const a = snapA.exists() ? snapA.data() : null;
    const t = snapT.exists() ? snapT.data() : null;
    let html = '';
    if (a && a.enabled && a.message && isWithinMaintenanceWindow(a)) {
      html += `<div style="background:#fff8e1;color:#b45309;border-radius:8px;padding:10px 14px;font-size:13px;margin:12px 0;text-align:left">
        <strong>📢 お知らせ</strong><div style="font-weight:600">${fmtMaintOccurrence(a)}</div><div style="white-space:pre-wrap;margin-top:4px">${a.message}</div>
      </div>`;
    }
    if (t && t.enabled && t.message && isWithinTemporaryWindow(t)) {
      html += `<div style="background:#fff8e1;color:#b45309;border-radius:8px;padding:10px 14px;font-size:13px;margin:12px 0;text-align:left">
        <strong>📢 臨時のお知らせ</strong><div style="font-weight:600">${fmtTempOccurrence(t)}</div><div style="white-space:pre-wrap;margin-top:4px">${t.message}</div>
      </div>`;
    }
    if (html) {
      const el = document.getElementById('login-maintenance-banner');
      el.innerHTML = html;
      el.style.display = '';
    }
    // 実際の使用制限（ログインさせないかどうか）は、ここでは判定しない。
    // ログイン画面の時点ではまだ誰がログインするか分からず、役職(admin/operator)を判定できないため、
    // ここでボタンを隠すと管理者自身もロックアウトされてしまう。
    // ログイン自体は誰でもできるようにしておき、ログイン直後にアプリ側(legacy-app.js)で
    // 役職を確認した上でブロック画面を出すかどうかを判定する。
  } catch(e) { console.warn('メンテナンス告知の取得に失敗', e); }
})();

// すでに有効なトークンがあればリダイレクト
const expiresAt = localStorage.getItem('gcal_token_expires');
const token     = localStorage.getItem('gcal_token');
if (token && expiresAt && Date.now() < parseInt(expiresAt)) {
  window.location.href = '/';
}

// URLパラメータでエラー表示
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('error') === 'not_allowed') {
  document.getElementById('login-error').textContent = 'このアカウントはアプリの利用が許可されていません。管理者にお問い合わせください。';
  document.getElementById('login-error').style.display = 'block';
}

window.doLogin = async function() {
  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.textContent = 'ログイン中...';
  document.getElementById('login-error').style.display = 'none';
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar.events');
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential && credential.accessToken) {
      const accessToken = credential.accessToken;
      // tokeninfo APIでexpiresAtを取得
      try {
        const res = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
        const info = await res.json();
        const expiresIn = info.expires_in || 3600;
        const expiresAt = Date.now() + (expiresIn * 1000);
        localStorage.setItem('gcal_token', accessToken);
        localStorage.setItem('gcal_token_expires', expiresAt);
        localStorage.setItem('gcal_uid', result.user.uid);
        localStorage.setItem('login_time', Date.now());
      } catch(e) {
        // tokeninfo失敗時は3600秒（1時間）でフォールバック
        const expiresAt = Date.now() + (3600 * 1000);
        localStorage.setItem('gcal_token', accessToken);
        localStorage.setItem('gcal_token_expires', expiresAt);
        localStorage.setItem('gcal_uid', result.user.uid);
        localStorage.setItem('login_time', Date.now());
      }
      window.location.href = '/';
    } else {
      throw new Error('トークンの取得に失敗しました');
    }
  } catch(e) {
    if (e.code !== 'auth/popup-closed-by-user') {
      document.getElementById('login-error').textContent = 'ログインに失敗しました: ' + e.message;
      document.getElementById('login-error').style.display = 'block';
    }
    btn.disabled = false;
    btn.textContent = 'Googleアカウントでログイン';
  }
};
