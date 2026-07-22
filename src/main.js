// Viteのエントリーポイント。
// 各モジュールは window.X 経由で従来通り連携するため、ここではまとめて読み込むだけでよい。
// vendor-globals.js は、legacy-app.js が使う window.Sortable などを先に用意しておくためのもの
// （ESモジュールはimportしたモジュールの中身を先に評価しきってから自分の処理に進むため、
//  legacy-app.jsより前に確実に読み込まれるようimportの並び順に注意している）
import './vendor-globals.js';
import './firebase.js';
import './legacy-app.js';
import './EvaluationFeature.jsx';
import { mountChatbot } from './Chatbot.jsx';

mountChatbot();
