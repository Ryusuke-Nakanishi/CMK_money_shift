# シフト・請求書管理アプリ

## ファイル構成

```
shift-app/
├── index.html     ← メインアプリ
├── sw.js          ← Service Worker（オフライン対応・自動更新）
├── manifest.json  ← PWA設定
├── icon-192.png   ← アプリアイコン（小）
├── icon-512.png   ← アプリアイコン（大）
└── README.md
```

---

## GitHubへのアップロード手順

1. GitHubで新しいリポジトリを作成（例: `shift-app`）
2. このフォルダの全ファイルをアップロード
   - GitHubのリポジトリページ →「Add file」→「Upload files」
   - 全ファイルをドラッグ&ドロップ → Commit

---

## Netlifyで公開する手順

1. [netlify.com](https://netlify.com) にアクセス → 無料アカウント作成
2. 「Add new site」→「Import an existing project」
3. 「GitHub」を選択 → リポジトリ（shift-app）を選択
4. Build設定はそのまま「Deploy site」をクリック
5. `https://xxxxxxxx.netlify.app` のURLが発行される

---

## スマホ・PCへのインストール方法

### iPhone（Safari）
1. Safariで公開URLを開く
2. 画面下の共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」→「追加」
4. ホーム画面にアプリとして表示される

### Android（Chrome）
1. Chromeで公開URLを開く
2. アドレスバー右のメニュー → 「アプリをインストール」

### Mac / Windows（Chrome）
1. Chromeで公開URLを開く
2. アドレスバー右のインストールアイコン（⊕）をクリック
3. 「インストール」→ デスクトップアプリとして起動可能

---

## バージョンアップ方法

1. `index.html` の `APP_VERSION` を更新（例: `'1.0.0'` → `'1.1.0'`）
2. `sw.js` の `CACHE_NAME` を更新（例: `'shift-app-v1.0.0'` → `'shift-app-v1.1.0'`）
3. GitHubに更新ファイルをアップロード（push）
4. Netlifyが自動でデプロイ → 全ユーザーのアプリに「更新ボタン」が表示される

---

## Google カレンダー連携の設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. 「APIとサービス」→「認証情報」→「OAuth 2.0 クライアントID」を作成
   - アプリの種類: ウェブアプリケーション
   - 承認済みのJavaScript生成元: `https://あなたのサイト.netlify.app`
3. クライアントIDをアプリの「設定」タブに入力

---

## データについて

- データは各ユーザーのブラウザ（localStorage）に保存されます
- 「設定」→「エクスポート」でJSONファイルに書き出し、別デバイスへ移行可能
- 複数人が同じURLを使っても、データは各自のデバイスに独立して保存されます
