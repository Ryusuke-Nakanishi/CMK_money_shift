---
marp: true
theme: default
paginate: true
style: |
  section {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 17px;
    padding: 40px 60px;
  }
  h1 { color: #111; font-size: 34px; border-bottom: 2px solid #111; padding-bottom: 12px; }
  h2 { color: #111; font-size: 26px; }
  h3 { color: #444; font-size: 20px; }
  code { background: #f5f5f5; padding: 2px 8px; border-radius: 4px; font-size: 15px; }
  pre { background: #1e1e1e; color: #f0f0f0; padding: 16px; border-radius: 8px; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f5f5f5; padding: 8px 12px; font-size: 15px; }
  td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 15px; }
---

# ClassmallKids シフト・請求書管理
## 開発者向け資料

**対象：** 導入検討者・引き継ぎエンジニア
**バージョン：** v3.1.0
**作成者：** りゅう先生

---

## 目次

1. システム概要
2. 技術スタック
3. ファイル構成
4. アーキテクチャ
5. Firebase設定
6. Google Cloud設定
7. Netlify設定
8. セキュリティ設計
9. データ構造
10. カスタマイズ方法
11. 費用・運用コスト
12. 既知の制約・注意点

---

## 1. システム概要

ClassmallKidsのアルバイトスタッフ向けシフト管理・請求書自動生成Webアプリ。

### 主な機能

- Googleアカウントによる認証・複数端末データ同期
- シフト登録・編集・削除（個別・月別一括）
- Googleカレンダー自動連携
- 請求書テキスト自動生成
- 年間収支管理（振込額・目標額）
- 期間別時給履歴（昇給対応）
- PWA対応（ホーム画面追加・オフライン一部対応）

### 対象ユーザー規模

現在：テストモード（最大100名）
本番移行後：制限なし

---

## 2. 技術スタック

| カテゴリ | 技術 | 備考 |
|----------|------|------|
| フロントエンド | 純粋なHTML/CSS/JS | フレームワークなし |
| 認証 | Firebase Authentication | Googleログイン |
| データベース | Cloud Firestore | リアルタイム同期 |
| ホスティング | Netlify | 無料プラン |
| カレンダー | Google Calendar API | OAuth 2.0 |
| バージョン管理 | GitHub | Publicリポジトリ |
| PWA | Service Worker | キャッシュ・通知 |

### 依存ライブラリ

```
Firebase SDK v12.14.0（CDN経由）
Google Identity Services（CDN経由）
```

外部ライブラリはすべてCDN経由で読み込み、ビルド不要。

---

## 3. ファイル構成

```
CMK_money_shift/
├── index.html        メインアプリ（全機能含む）
├── login.html        ログイン専用ページ
├── privacy.html      プライバシーポリシー
├── terms.html        利用規約
├── sw.js             Service Worker（PWA・キャッシュ）
├── manifest.json     PWAマニフェスト
├── netlify.toml      Netlifyヘッダー設定
├── _headers          Cross-Origin設定
├── icon-192.png      PWAアイコン（192×192）
└── icon-512.png      PWAアイコン（512×512）
```

### アーキテクチャの特徴

- **単一HTMLファイル構成：** `index.html` に全タブ・全機能を内包
- **サーバーレス：** バックエンドサーバー不要
- **静的サイト：** ビルドプロセスなし

---

## 4. アーキテクチャ

```
ブラウザ（index.html）
    │
    ├── Firebase Auth ──→ Googleアカウント認証
    │                      tokeninfo APIでトークン有効期限取得
    │
    ├── Firestore ──→ リアルタイムデータ同期
    │                  users/{uid}/shifts, rates, rateHistory, payments
    │
    └── Google Calendar API ──→ シフト予定の登録・削除
                                 アクセストークンで直接呼び出し
```

### 認証フロー

1. `login.html` でGoogleログイン（signInWithPopup）
2. OAuthトークンを `tokeninfo` APIで有効期限確認
3. トークンと有効期限を `localStorage` に保存
4. `index.html` 読み込み時にトークン有効期限チェック
5. 期限切れ → `login.html` にリダイレクト
6. 30秒ごとに有効期限を監視・ステータスバーに残り時間表示

---

## 5. Firebase設定

### プロジェクト情報

| 項目 | 値 |
|------|----|
| プロジェクトID | `shift-app-1fa59` |
| プロジェクト番号 | `1014397065555` |
| プロジェクト名 | `shift-app` |
| コンソールURL | console.firebase.google.com |

### 使用サービス

- **Authentication：** Googleプロバイダのみ有効
- **Firestore：** `users` コレクション
- **Hosting：** 有効化済み（`init.json` エラー回避のため）

### Firestoreセキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

---

## 6. Google Cloud設定

### OAuthクライアント

| 項目 | 値 |
|------|----|
| クライアントID | `1014397065555-uoutos7...` |
| アプリケーション種別 | ウェブアプリケーション |

### 承認済みJavaScript生成元

```
https://cmkmoneyshift.netlify.app
```

### 有効なAPI

- Google Calendar API
- Firebase関連API（自動有効化済み）

### OAuth同意画面

- 現在：**テストモード**（登録済みユーザーのみ）
- 本番移行時：Googleの審査が必要
  - プライバシーポリシーURL必須
  - 利用規約URL必須

---

## 7. Netlify設定

### サイト情報

| 項目 | 値 |
|------|----|
| URL | `https://cmkmoneyshift.netlify.app` |
| プラン | 無料（クレジット制） |
| デプロイ | GitHubへのpushで自動デプロイ |

### netlify.toml（主要設定）

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin-allow-popups"
    Cross-Origin-Embedder-Policy = "unsafe-none"
```

> `Cross-Origin-Opener-Policy` の設定がないとGoogleログインのポップアップが正常に動作しない

### デプロイコスト

- 本番デプロイ1回：15クレジット消費
- 無料枠：月300クレジット（約20回/月）

---

## 8. セキュリティ設計

### 認証・認可

| 項目 | 対策 |
|------|------|
| APIキー公開 | Firebase・GCPのAPIキーはHTML内に記載。Firestoreルールで保護されているため実害なし |
| データアクセス | FirestoreルールでUID一致チェック。他ユーザーのデータへのアクセス不可 |
| トークン管理 | アクセストークンはlocalStorageに保存。1時間で自動失効・削除 |
| セッション管理 | tokeninfo APIで有効期限を取得し、30秒ごとにローカルチェック |
| テストモード | OAuthをテストモードに設定し、登録済みアカウントのみログイン可 |

### localStorageキー一覧

| キー | 内容 |
|------|------|
| `shifts_v3` | シフトデータ（JSON） |
| `rates_v2` | 現在の時給設定 |
| `rate_history` | 期間別時給履歴 |
| `payments_v1` | 振込額・目標額 |
| `gcal_token` | Googleカレンダートークン |
| `gcal_token_expires` | トークン有効期限（Unix ms） |
| `gcal_uid` | ログイン中のFirebase UID |
| `login_time` | ログイン時刻 |

---

## 9. データ構造

### Firestore: `users/{uid}`

```javascript
{
  shifts: [
    {
      id: 1234567890.123,      // float（Date.now() + Math.random()）
      type: "normal",          // normal | camp | training | dev | mtg | sns
      date: "2026-07-01",      // YYYY-MM-DD
      start: "18:00",          // HH:MM
      end: "19:30",            // HH:MM
      memo: "ジュニア",         // 担当コース（任意）
      closed: false,           // 授業クローズフラグ
      gcalEventId: "abc123"    // GoogleカレンダーイベントID（null or string）
    }
  ],
  rates: {
    normal: 2200, camp: 2350, training: 1300,
    dev: 1300, mtg: 1300, sns: 1300, close: 1300
  },
  rateHistory: [
    {
      from: "2025-04",         // 開始月（YYYY-MM）
      to: "2025-12",           // 終了月（空文字=現在以降）
      rates: { normal: 2000 }  // 変更された時給のみ
    }
  ],
  payments: {
    amounts: { "2026-01": 85000 },   // 振込額 {YYYY-MM: 金額}
    goals: { "2026": 1000000 }       // 年間目標額 {年: 金額}
  },
  updatedAt: 1720000000000           // 最終更新タイムスタンプ
}
```

---

## 10. カスタマイズ方法

### 業務種別の追加・変更

`index.html` の以下の定数を編集：

```javascript
const TYPE_LABEL = {
  normal:'通常クラス', camp:'キャンプクラス',
  training:'研修業務', dev:'教材開発',
  mtg:'その他MTG', sns:'SNSマーケティング'
};
const TYPE_HOURLY = {
  normal:false, camp:false,          // コマ単価
  training:true, dev:true, mtg:true, sns:true  // 時給計算
};
const TYPE_INVOICE = {
  normal:false, camp:true,           // 請求書掲載
  training:true, dev:true, mtg:true, sns:true
};
```

### カレンダータイトルのカスタマイズ

```javascript
const TYPE_GCAL = {
  normal:'【通常】', camp:'【キャンプ】',
  // ... 変更したいラベルを修正
};
```

### 通知時間の変更

```javascript
// syncToGcal関数内
reminders: { useDefault:false, overrides:
  isClass ? [{method:'popup', minutes:15}]  // 授業：15分前
          : [{method:'popup', minutes:10}]  // 講師外：10分前
}
```

---

## 11. 費用・運用コスト

### 月額コスト（100名規模）

| サービス | 無料枠 | 推定使用量 | 費用 |
|----------|--------|----------|------|
| Netlify | 300クレジット/月 | 15〜30クレジット | **¥0** |
| Firebase Auth | 5万MAU/月 | 〜100名 | **¥0** |
| Firestore 読み取り | 5万回/日 | 〜500回/日 | **¥0** |
| Firestore 書き込み | 2万回/日 | 〜100回/日 | **¥0** |
| Firestore 容量 | 1GB | 〜18MB/年 | **¥0** |
| Google Calendar API | 無料枠内 | 〜100回/日 | **¥0** |

**合計：¥0/月**

### 有料化が必要になるタイミング

- ユーザーが **数千人規模** になった場合
- 1日のFirestore読み取りが **5万回超** になった場合

---

## 12. 既知の制約・注意点

### 現在の制約

| 項目 | 内容 |
|------|------|
| OAuthモード | テストモード（100名上限）。本番移行にはGoogle審査が必要 |
| セッション時間 | Googleトークンは1時間で失効。再ログインが必要 |
| APIキー | GitHubのPublicリポジトリに公開中。Firestoreルールで保護済み |
| オフライン | Service Workerで基本動作はキャッシュ。データ更新はオンライン必須 |

### 本番移行時の対応事項

1. OAuthの審査申請（プライバシーポリシー・利用規約必須）
2. Netlify有料プランへの移行検討（大規模利用時）
3. FirebaseのBlaze（従量課金）プランへの移行検討
4. 独自ドメインの取得・設定

### 引き継ぎ時に必要なアクセス権

- GitHubリポジトリのオーナー権限
- Firebaseプロジェクトのオーナー権限
- Google Cloud ConsoleのOAuth設定権限
- Netlifyのサイト管理権限

---

## お問い合わせ・ライセンス

**開発者：** りゅう先生
**リポジトリ：** https://github.com/Ryusuke-Nakanishi/CMK_money_shift
**アプリURL：** https://cmkmoneyshift.netlify.app

本アプリはClassmallKids向けに開発されたカスタムアプリです。
商用利用・転用の際は開発者にご連絡ください。

---

*ClassmallKids シフト・請求書管理 v3.1.0*
*© 2026 りゅう先生*
