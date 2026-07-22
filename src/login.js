import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

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
