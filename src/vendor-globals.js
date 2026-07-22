// legacy-app.js（バニラJS側）が init() 実行時に window.Sortable を参照するため、
// legacy-app.js が読み込まれるより前に、必ずこのモジュールで window への公開を完了させておく。
// （ESモジュールは import したモジュールを、自分自身の処理が始まる前に全部評価しきってしまうため、
//  main.js内にただ書くだけだとlegacy-app.jsの評価の方が先に終わってしまうことがある）
import Sortable from 'sortablejs';

window.Sortable = Sortable;
