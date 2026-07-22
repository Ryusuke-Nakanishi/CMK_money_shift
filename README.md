# CMKシフト管理 - Vite移行版

## セットアップ（最初の1回だけ）

```
npm install
```

## 開発中の確認方法

```
npm run dev
```
表示されるURL（`http://localhost:5173`など）をブラウザで開いて確認します。
コードを保存すると自動で画面が更新されます。

スマホの実機で確認したい場合は、PCとスマホを同じWi-Fiに繋いだ上で：
```
npm run dev -- --host
```
と実行し、ターミナルに出る「Network:」の方のURLをスマホのブラウザで開いてください。

## 本番用にビルドする

```
npm run build
```
`dist`フォルダに、公開用の完成したファイル一式が生成されます。
`npm run preview` でこの本番ビルドをローカルで確認できます。

## デプロイ前に必ずやること（重要）

このzipには含まれていない、既存プロジェクトのファイルを `public/` フォルダにコピーしてください：

- `manifest.json`
- `icon-192.png`
- `icon-512.png`
- `privacy.html`
- `terms.html`

これらは今のGitHubリポジトリに入っているはずです。`public/`フォルダに入れたファイルは、ビルド時にそのまま`dist`フォルダのトップに複製されます。

## Netlifyの設定

- Build command: `npm run build`
- Publish directory: `dist`

## 移行の中身について

- 見た目・機能は今までと同じです（デザインは変更していません）
- Firebase・Firestoreの設定はそのまま。変わったのはCDN読み込みからnpmパッケージ経由に変えた点だけです
- 講師評価まわりのReactコンポーネントは、これまでのBabel Standalone（ブラウザ内でのその場変換）をやめ、Viteが標準でJSXをコンパイルする形に変更しました
- 移行作業中に、コード内で偶然見つかった小さな重複バグ（`loadQAFromFirebase`が2重定義されていた）も直しています
