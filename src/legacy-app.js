const APP_VERSION='3.5.4';
document.getElementById('ver-badge').textContent='v'+APP_VERSION+' 📢';
document.getElementById('ver-display').textContent=APP_VERSION;

// ── アップデート情報 ──
// 新しい更新内容はこの配列の先頭に追加していく（新しい順に表示される）
const CHANGELOG = [
  { version:'3.5.4', date:'2026-07-22', changes:[
    '講師評価機能を追加しました。ご自身の評価が「講師評価」から確認できます（評価者が公開するまでは非表示になります）',
    '評価者に準ユニットリーダー以上の場合、「全講師評価管理」から評価の登録・確認ができます（担当コースの登録・優先順位設定、カテゴリごとの並び替え、コース・優先順位での絞り込みにも対応）',
    'ユニット（チーム）管理機能を追加しました。所属メンバー・準メンバーの追加・削除や、評価ページへのリンクにも対応しました（ユニットリーダーの兼任にも対応）',
    '講師とは別に「教材開発」「SNSマーケティング」の業務タイプを設定できるようにしました（該当する方はMTGの新規作成が可能になります）',
    'メールアドレス未定の方も、名前だけで先に登録できるようになりました（後日メールアドレスが判明したら紐付けられます）',
    'MTGの招待メンバー候補を、ユニット・役職・業務タイプで絞り込めるようにしました',
    'チャットボットの表示・動作を改善しました。カテゴリボタンの内容もQ&A管理画面から編集できるようになりました',
    '同じ内容のMTGが複数ある場合に、シフトが誤って削除されることがある不具合を修正しました',
    'ユーザー・ユニットを削除した際に、関連するデータもまとめて整理されるようにしました',
    'iPhoneで日付・時刻の入力欄が崩れて見える不具合を修正しました',
    'スマホでの不具合が確認されているため、一時的にMTGの新規作成をPC限定にしました',
    'このアップデート情報ページを追加しました',
  ]},
  { version:'3.3.0〜3.3.2', date:'2026-07-16', changes:[
    'MTG調整に、業務種別（研修・MTGなど）の選択を追加しました',
    '日程確定型のMTGで、招待された方は「参加する／参加しない」を選べるようにしました',
    'ホーム画面・MTGタブに、未回答のMTGをお知らせするバナーを追加しました',
  ]},
  { version:'3.0〜3.2', date:'2026-07-07', changes:[
    'Googleログイン・Firebase連携によるデータ同期機能を追加しました',
    'ホーム画面を追加しました（本日のシフト・ミニカレンダー・月間サマリー）',
    'login.html を分離し、トークンベースの認証に変更しました',
    'allowedUsersによるユーザー管理機能を追加しました',
    '役職設定（admin・operator・ul・sub_ul・instructor・trainee）を追加しました',
    '管理者タブからアプリ内でユーザーの追加・削除・役職変更ができるようになりました',
    'Q&A管理タブを追加しました（ul以上が編集可能・Firebaseに保存）',
    'チャットボットを追加しました（カテゴリ選択型・右下固定ボタン）',
    'MTG調整タブを追加しました（日程調整・候補日Googleカレンダー連携・シフト自動追加）',
    '請求書に通常クラスを含めるチェックボックスを追加しました',
    '日またぎシフトに対応しました',
    'タブの横スクロールに対応しました',
    'シフト編集モーダルに日付変更を追加しました',
  ]},
  { version:'2.0', date:'2026-06-20', changes:[
    'Googleアカウントでのログイン機能を追加しました',
    'Googleカレンダーへの自動登録・削除に対応しました',
    '複数端末でのデータ同期に対応しました',
  ]},
  { version:'1.0', date:'2026-06-07', changes:[
    'シフト登録・編集・削除機能をリリースしました',
    '月別一括登録機能を追加しました',
    '請求書テキスト自動生成機能を追加しました',
    '年間収支管理機能を追加しました',
    '期間別時給履歴に対応しました',
  ]},
];

function openUpdateInfoModal() {
  const el = document.getElementById('update-info-list');
  if (el) {
    el.innerHTML = CHANGELOG.map(entry => `
      <div style="padding:12px 0;border-bottom:.5px solid var(--border)">
        <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px">
          <span style="font-size:13px;font-weight:600">v${entry.version}</span>
          <span style="font-size:11px;color:var(--text3)">${entry.date}</span>
        </div>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:var(--text2);line-height:1.7">
          ${entry.changes.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }
  document.getElementById('update-info-modal').classList.add('open');
}
function closeUpdateInfoModal() {
  document.getElementById('update-info-modal').classList.remove('open');
}

const TYPE_LABEL  ={normal:'通常クラス',camp:'キャンプクラス',training:'研修業務',dev:'教材開発',mtg:'その他MTG',sns:'SNSマーケティング'};
const TYPE_GCAL   ={normal:'【通常】',camp:'【キャンプ】',training:'【研修】',dev:'【開発】',mtg:'【MTG】',sns:'【SNS】'};
const TYPE_COLOR  ={normal:'#3B6D11',camp:'#185FA5',training:'#854F0B',dev:'#534AB7',mtg:'#993556',sns:'#0e7490'};
const TYPE_INVOICE={normal:false,camp:true,training:true,dev:true,mtg:true,sns:true};
const TYPE_HOURLY ={normal:false,camp:false,training:true,dev:true,mtg:true,sns:true};
const DAYS_JA     =['日','月','火','水','木','金','土'];
const WEEK_LABELS =['第1週','第2週','第3週','第4週','第5週'];
const ALL_RATE_KEYS=['normal','camp','training','dev','mtg','sns','close'];

let shifts=[],rates={normal:0,camp:0,training:0,dev:0,mtg:0,sns:0,close:0};
let rateHistory=[],payments={},annualGoals={};
let viewMonth=new Date();viewMonth.setDate(1);
let viewYear=new Date().getFullYear();
let calMonth=new Date();calMonth.setDate(1);
window._gcalToken=localStorage.getItem('gcal_token');
window._statusState='';

// Firebase受信
window._fbShifts=null;window._fbRates=null;window._fbRateHistory=null;window._fbPayments=null;
window.onFirebaseDataLoaded=function(){
  if(window._fbShifts!==null)shifts=window._fbShifts;
  if(window._fbRates!==null)rates={...rates,...window._fbRates};
  if(window._fbRateHistory!==null)rateHistory=window._fbRateHistory;
  if(window._fbPayments!==null){const d=window._fbPayments;payments=d.amounts||d;annualGoals=d.goals||annualGoals;}
  saveLocal();renderAll();
  ALL_RATE_KEYS.forEach(k=>{const el=document.getElementById('rate-'+k);if(el)el.value=rates[k]||'';});
  // 確定MTGのシフト自動追加チェック
  setTimeout(checkConfirmedMTGShifts, 1000);
};
window.onAccountChanged=function(){
  shifts=[];rates={normal:0,camp:0,training:0,dev:0,mtg:0,sns:0,close:0};rateHistory=[];payments={};annualGoals={};
};

function renderAll(){renderShifts();renderMetrics();checkConflicts();renderAnnual();renderRateHistory();renderHome();}

function toLocalDateStr(dt){return`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;}
function toMonthStr(yr,mo){return`${yr}-${String(mo+1).padStart(2,'0')}`;}

function loadLocal(){
  try{
    const s=localStorage.getItem('shifts_v3');if(s)shifts=JSON.parse(s);
    const r=localStorage.getItem('rates_v2');if(r)rates={...rates,...JSON.parse(r)};
    const rh=localStorage.getItem('rate_history');if(rh)rateHistory=JSON.parse(rh);
    const p=localStorage.getItem('payments_v1');if(p){const d=JSON.parse(p);payments=d.amounts||d;annualGoals=d.goals||{};}
  }catch(e){}
}
function saveLocal(){
  try{
    localStorage.setItem('shifts_v3',JSON.stringify(shifts));
    localStorage.setItem('rate_history',JSON.stringify(rateHistory));
    localStorage.setItem('payments_v1',JSON.stringify({amounts:payments,goals:annualGoals}));
  }catch(e){}
}
function save(){
  saveLocal();
  if(typeof window.saveToFirebase==='function')window.saveToFirebase(shifts,rates,rateHistory,{amounts:payments,goals:annualGoals});
}
function saveRates(){
  ALL_RATE_KEYS.forEach(k=>{const el=document.getElementById('rate-'+k);if(el)rates[k]=parseFloat(el.value)||0;});
  try{localStorage.setItem('rates_v2',JSON.stringify(rates));}catch(e){}
  if(typeof window.saveToFirebase==='function')window.saveToFirebase(shifts,rates,rateHistory,{amounts:payments,goals:annualGoals});
  renderMetrics();
}

function getRatesForMonth(yrmo){
  if(!rateHistory.length)return rates;
  const applicable=rateHistory.filter(h=>h.from<=yrmo&&(!h.to||h.to>=yrmo)).sort((a,b)=>b.from.localeCompare(a.from));
  return applicable.length?{...rates,...applicable[0].rates}:rates;
}

// ── タブバー（ホーム固定＋お気に入り＋全項目メニュー） ──
// Home以外の全タブ定義。roles:nullは全員表示、配列指定はその役職以上のみ表示
window.TAB_REGISTRY = [
  { id:'shifts',     icon:'📅', label:'シフト',         roles:null },
  { id:'bulk',       icon:'📋', label:'一括',           roles:null },
  { id:'invoice',    icon:'📄', label:'請求書',         roles:null },
  { id:'annual',     icon:'💰', label:'収支',           roles:null },
  { id:'manual',     icon:'📖', label:'使い方',         roles:null },
  { id:'settings',   icon:'⚙️', label:'設定',           roles:null },
  { id:'mtg',        icon:'📆', label:'MTG調整',        roles:null, badge:'mtg-tab-badge' },
  { id:'evaluation', icon:'⭐', label:'講師評価',       roles:null },
  { id:'admin',      icon:'👥', label:'管理',           roles:['admin','operator','ul'] },
  { id:'qa',         icon:'❓', label:'Q&A管理',        roles:['admin','operator','ul'] },
  { id:'evalManage', icon:'📊', label:'全講師評価管理', roles:['sub_ul','ul','operator','admin'] },
  { id:'unitList', icon:'🗂️', label:'ユニット一覧', roles:null },
];
window.DEFAULT_FAVORITE_TABS = ['shifts','mtg'];

function visibleTabRegistry(){
  const role = window._currentUser?.role || '';
  return window.TAB_REGISTRY.filter(t => !t.roles || t.roles.includes(role));
}
function currentFavoriteTabs(){
  const visible = visibleTabRegistry().map(t=>t.id);
  const stored = window._currentUser?.favoriteTabs;
  const base = (stored && stored.length ? stored : window.DEFAULT_FAVORITE_TABS);
  // 表示権限が無くなった項目は除外
  return base.filter(id => visible.includes(id));
}

window.renderTabBar = function(){
  const container = document.getElementById('tabs-container');
  if (!container) return;
  const favorites = currentFavoriteTabs();
  let html = `<button class="tab active" data-tab="home" onclick="switchTab('home')">🏠 ホーム</button>`;
  html += `<span id="fav-tabs-container" style="display:contents">`;
  favorites.forEach(id => {
    const t = window.TAB_REGISTRY.find(x=>x.id===id);
    if (!t) return;
    html += `<button class="tab" data-tab="${t.id}" onclick="switchTab('${t.id}')" style="position:relative">${t.icon} ${t.label}`
      + (t.badge?`<span id="${t.badge}" style="display:none;position:absolute;top:2px;right:2px;background:var(--danger-text);color:#fff;font-size:9px;line-height:1;padding:2px 4px;border-radius:20px;min-width:14px;text-align:center"></span>`:'')
      + `</button>`;
  });
  html += `</span>`;
  html += `<button class="tab" id="tab-btn-menu" onclick="openTabMenu()">☰ メニュー</button>`;
  container.innerHTML = html;
  // 現在アクティブなパネルに合わせてタブのactive状態を復元
  const activePanel = document.querySelector('.panel.active');
  if (activePanel) {
    const activeId = activePanel.id.replace('tab-','');
    document.querySelectorAll('.tab[data-tab]').forEach(b=>b.classList.toggle('active', b.dataset.tab===activeId));
  }
  initFavTabsSortable();
};

function initFavTabsSortable(){
  const el = document.getElementById('fav-tabs-container');
  if (!el || typeof Sortable === 'undefined') return;
  if (el._sortableInstance) el._sortableInstance.destroy();
  el._sortableInstance = new Sortable(el, {
    animation:150,
    delay:350,               // タッチ操作の場合、この時間(ms)押し続けてからでないと並び替えが始まらない
    delayOnTouchOnly:true,    // PCのマウス操作には遅延をかけない（タップ操作の誤反応を防ぐため）
    touchStartThreshold:8,    // 長押し待ち中に指がこの距離(px)以上動いたら並び替えをキャンセルする
    onEnd: async function(){
      const newOrder = Array.from(el.querySelectorAll('.tab[data-tab]')).map(b=>b.dataset.tab);
      if (!window._currentUser) return;
      window._currentUser.favoriteTabs = newOrder;
      const email = window._currentUser.email;
      if (email && window.updateFavoriteTabs) await window.updateFavoriteTabs(email, newOrder);
    }
  });
}

function tabMenuListHTML(){
  const favorites = currentFavoriteTabs();
  return visibleTabRegistry().map(t => {
    const isFav = favorites.includes(t.id);
    return `<div style="display:flex;align-items:center;gap:10px;padding:12px 6px;border-bottom:.5px solid var(--border)">
      <span onclick="switchTab('${t.id}');closeTabMenu()" style="flex:1;cursor:pointer;font-size:15px">${t.icon} ${t.label}</span>
      <span onclick="toggleFavoriteTab('${t.id}')" style="cursor:pointer;font-size:20px;color:${isFav?'var(--accent)':'var(--text3)'}">${isFav?'★':'☆'}</span>
    </div>`;
  }).join('');
}
window.openTabMenu = function(){
  if (document.getElementById('tab-menu-container')) return;
  const btn = document.getElementById('tab-btn-menu');
  const rect = btn ? btn.getBoundingClientRect() : { bottom:60, right:window.innerWidth-16 };
  const top = rect.bottom + 6;
  const right = Math.max(8, window.innerWidth - rect.right);
  const div = document.createElement('div');
  div.id = 'tab-menu-container';
  div.innerHTML = `<div id="tab-menu-overlay" style="position:fixed;inset:0;z-index:999" onclick="closeTabMenu()"></div>
    <div style="position:fixed;top:${top}px;right:${right}px;background:var(--bg);width:300px;max-width:calc(100vw - 16px);max-height:min(75vh,560px);border-radius:var(--radius);border:.5px solid var(--border);box-shadow:0 10px 30px rgba(0,0,0,0.2);z-index:1000;display:flex;flex-direction:column;overflow:hidden">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:.5px solid var(--border);flex-shrink:0">
        <span style="font-weight:600;font-size:14px">メニュー</span>
        <button onclick="closeTabMenu()" style="background:none;border:none;font-size:20px;color:var(--text2);cursor:pointer;line-height:1">×</button>
      </div>
      <p style="font-size:11px;color:var(--text3);margin:8px 14px 4px">★でお気に入り登録/解除。タブバーでは長押しして並び替えできます</p>
      <div style="overflow-y:auto;padding:0 10px 10px">
        <div id="tab-menu-list">${tabMenuListHTML()}</div>
      </div>
    </div>`;
  document.body.appendChild(div);
};
window.closeTabMenu = function(){
  document.getElementById('tab-menu-container')?.remove();
};
window.toggleFavoriteTab = async function(id){
  const current = currentFavoriteTabs().slice();
  const idx = current.indexOf(id);
  if (idx === -1) current.push(id); else current.splice(idx,1);
  window._currentUser.favoriteTabs = current;
  window.renderTabBar();
  const listEl = document.getElementById('tab-menu-list');
  if (listEl) listEl.innerHTML = tabMenuListHTML();
  const email = window._currentUser?.email;
  if (email && window.updateFavoriteTabs) await window.updateFavoriteTabs(email, current);
};

function switchTab(t){
  document.querySelectorAll('.tab[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('tab-'+t).classList.add('active');
  if(t==='invoice'){const n=new Date();document.getElementById('inv-month').value=n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0');}
  if(t==='bulk')buildWeekGrid();
  if(t==='annual')renderAnnual();
  if(t==='home')renderHome();
  if(t==='admin')renderAdminUserList();
  if(t==='qa'){renderQAList();renderChatCatList();}
  if(t==='mtg')renderMTGTab();
  if(t==='evaluation'&&typeof window.mountEvaluationTab==='function')window.mountEvaluationTab();
  if(t==='evalManage'&&typeof window.mountEvalManageTab==='function')window.mountEvalManageTab();
  if(t==='unitList'&&typeof window.mountUnitListTab==='function')window.mountUnitListTab();
}

// ユニット一覧などから、特定の講師の評価詳細ページへ直接ジャンプする
function gotoStaffEvaluation(email) {
  switchTab('evalManage');
  if (typeof window.mountEvalManageTab === 'function') window.mountEvalManageTab(email);
}

function showFlash(id,txt,ok){
  const el=document.getElementById(id);
  el.textContent=txt;el.className='flash '+(ok?'ok':'err');
  setTimeout(()=>{el.className='flash';},3500);
}

// ホーム
function renderHome(){
  const now=new Date();
  const todayStr=toLocalDateStr(now);
  const days=['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'];
  const months=['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  document.getElementById('today-date').textContent=`${now.getFullYear()}年${months[now.getMonth()]}${now.getDate()}日`;
  document.getElementById('today-day').textContent=days[now.getDay()];
  const h=now.getHours();
  document.getElementById('today-greeting').textContent=h<12?'おはようございます！':h<18?'お疲れ様です！':'お疲れ様でした！';
  // 日付ピッカーを今日の日付で初期化
  const picker=document.getElementById('home-date-picker');
  if(picker&&!picker.value) picker.value=todayStr;
  renderHomeShifts();
  const yr=now.getFullYear(),mo=now.getMonth();
  const r=getRatesForMonth(toMonthStr(yr,mo));
  const list=shifts.filter(s=>{const d=new Date(s.date);return d.getFullYear()===yr&&d.getMonth()===mo;});
  let koma=0,pay=0;
  list.forEach(s=>{
    if(s.closed){pay+=(r.close||0)*0.25;}
    else if(s.type==='normal'){koma++;pay+=(r.normal||0);}
    else if(s.type==='camp'){koma++;pay+=(r.camp||0);}
    else if(TYPE_HOURLY[s.type]){pay+=durationH(s.start,s.end)*(r[s.type]||0);}
  });
  document.getElementById('home-metrics').innerHTML=`
    <div class="metric-card"><div class="label">今月のコマ数</div><div class="value">${koma}コマ</div></div>
    <div class="metric-card"><div class="label">今月の概算報酬</div><div class="value">¥${Math.round(pay).toLocaleString()}</div></div>`;
  renderMiniCal();
}

function renderHomeShifts(){
  const picker=document.getElementById('home-date-picker');
  if(!picker)return;
  // フォームが開いている場合は日付を更新
  const form=document.getElementById('home-add-form');
  if(form&&form.style.display!=='none'){
    const dateInput=document.getElementById('home-new-date');
    if(dateInput) dateInput.value=picker.value||toLocalDateStr(new Date());
  }
  const dateStr=picker.value||toLocalDateStr(new Date());
  const dt=new Date(dateStr+'T00:00:00');
  const days=['日','月','火','水','木','金','土'];
  const dayLabel=`（${days[dt.getDay()]}）`;
  const selectedShifts=shifts.filter(s=>s.date===dateStr).sort((a,b)=>a.start<b.start?-1:1);
  const tsEl=document.getElementById('today-shifts');
  if(!selectedShifts.length){
    tsEl.innerHTML='<div class="no-shift">この日のシフトはありません</div>';
  }else{
    tsEl.innerHTML=selectedShifts.map(s=>{
      const isHourly=TYPE_HOURLY[s.type];
      const isClass=s.type==="normal"||s.type==="camp";
      const h=durationH(s.start,s.end);
      let detail=isHourly?`${h.toFixed(1)}h`:"1コマ";
      if(s.closed)detail="クローズ 15分";
      const closedBadge=s.closed?`<span style="font-size:10px;padding:1px 6px;border-radius:20px;background:var(--warning-bg);color:var(--warning-text)">クローズ</span>`:"";
      const gcalBadge=s.gcalEventId?`<span style="font-size:10px;padding:1px 6px;border-radius:20px;background:var(--success-bg);color:var(--success-text)">📅</span>`:"";
      const editBtn=isHourly?`<button class="btn btn-edit btn-sm" onclick="openEditModal(${s.id})" style="font-size:11px;padding:3px 8px">編集</button>`:"";
      const closeBtn=isClass?`<button class="btn btn-sm ${s.closed?"btn-reopen":"btn-warn"}" onclick="toggleClose(${s.id});renderHomeShifts();" style="font-size:11px;padding:3px 8px">${s.closed?"解除":"クローズ"}</button>`:"";
      return`<div class="today-shift-item" style="align-items:flex-start;flex-wrap:wrap;gap:8px">
        <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
          <div style="width:8px;height:8px;border-radius:50%;background:${s.closed?"#888":TYPE_COLOR[s.type]};flex-shrink:0;margin-top:4px"></div>
          <div style="min-width:0">
            <div style="font-size:14px;font-weight:600;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              ${s.start}〜${s.end} ${closedBadge}${gcalBadge}
            </div>
            <div style="font-size:12px;color:var(--text2);margin-top:2px">${TYPE_LABEL[s.type]}${s.memo?"・"+s.memo:""} （${detail}）</div>
          </div>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0">${editBtn}${closeBtn}<button class="btn btn-sm btn-danger" onclick="deleteShift(${s.id});renderHomeShifts();" style="font-size:11px;padding:3px 8px">削除</button></div>
      </div>`;
    }).join("");
  }
}

function toggleHomeAddForm(show){
  const form=document.getElementById('home-add-form');
  const btn=document.getElementById('home-add-btn');
  if(show){
    form.style.display='block';
    btn.style.display='none';
    // 日付ピッカーの日付をフォームに反映
    const picker=document.getElementById('home-date-picker');
    const dateInput=document.getElementById('home-new-date');
    if(picker&&dateInput) dateInput.value=picker.value||toLocalDateStr(new Date());
    // 前回の入力をクリア
    document.getElementById('home-new-start').value='';
    document.getElementById('home-new-end').value='';
    document.getElementById('home-new-memo').value='';
    document.getElementById('home-add-msg').className='flash';
  } else {
    form.style.display='none';
    btn.style.display='';
  }
}

function addShiftFromHome(){
  const type=document.getElementById('home-new-type').value;
  const date=document.getElementById('home-new-date').value;
  const start=document.getElementById('home-new-start').value;
  const end=document.getElementById('home-new-end').value;
  const memo=document.getElementById('home-new-memo').value;
  if(!date||!start||!end){showFlash('home-add-msg','時刻を入力してください',false);return;}
  if(start>=end){
    const ok=confirm('開始時刻（'+start+'）が終了時刻（'+end+'）より遅くなっています。\n日をまたいで登録しますか？\n\n※ 終了時刻は翌日として計算されます');
    if(!ok)return;
  }
  const shift={id:Date.now()+Math.random(),type,date,start,end,memo,closed:false,gcalEventId:null,overnight:start>=end};
  shifts.push(shift);
  save();checkConflicts();renderShifts();renderMetrics();renderHomeShifts();
  showFlash('home-add-msg','追加しました',true);
  if(window._gcalToken)syncToGcal(shift);
  // フォームを閉じる
  setTimeout(()=>toggleHomeAddForm(false),1000);
}

function homePrevDay(){
  const picker=document.getElementById('home-date-picker');
  if(!picker)return;
  const d=new Date((picker.value||toLocalDateStr(new Date()))+"T00:00:00");
  d.setDate(d.getDate()-1);
  picker.value=toLocalDateStr(d);
  renderHomeShifts();
}
function homeNextDay(){
  const picker=document.getElementById('home-date-picker');
  if(!picker)return;
  const d=new Date((picker.value||toLocalDateStr(new Date()))+"T00:00:00");
  d.setDate(d.getDate()+1);
  picker.value=toLocalDateStr(d);
  renderHomeShifts();
}

function renderMiniCal(){
  const yr=calMonth.getFullYear(),mo=calMonth.getMonth();
  document.getElementById('cal-month-label').textContent=`${yr}年${mo+1}月`;
  document.getElementById('cal-day-headers').innerHTML=DAYS_JA.map((d,i)=>`<div class="mini-cal-day-header" style="${i===0?'color:var(--danger-text)':i===6?'color:#2563eb':''}">${d}</div>`).join('');
  const firstDay=new Date(yr,mo,1).getDay();
  const lastDate=new Date(yr,mo+1,0).getDate();
  const todayStr=toLocalDateStr(new Date());
  const shiftDates=new Set(shifts.map(s=>s.date));
  let cells='';
  for(let i=0;i<firstDay;i++){const pd=new Date(yr,mo,-(firstDay-i-1));cells+=`<div class="mini-cal-day other-month">${pd.getDate()}</div>`;}
  for(let d=1;d<=lastDate;d++){
    const dateStr=`${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dow=new Date(yr,mo,d).getDay();
    const cls=['mini-cal-day',dateStr===todayStr?'today':'',shiftDates.has(dateStr)?'has-shift':'',dow===0?'sun':dow===6?'sat':''].filter(Boolean).join(' ');
    cells+=`<div class="${cls}">${d}</div>`;
  }
  document.getElementById('cal-grid').innerHTML=cells;
}
function calPrevMonth(){calMonth.setMonth(calMonth.getMonth()-1);renderMiniCal();}
function calNextMonth(){calMonth.setMonth(calMonth.getMonth()+1);renderMiniCal();}

function addShift(){
  const type=document.getElementById('new-type').value;
  const date=document.getElementById('new-date').value;
  const start=document.getElementById('new-start').value;
  const end=document.getElementById('new-end').value;
  const memo=document.getElementById('new-memo').value;
  if(!date||!start||!end){showFlash('add-msg','日付・時刻を入力してください',false);return;}
  if(start>=end){
    const ok=confirm('開始時刻（'+start+'）が終了時刻（'+end+'）より遅くなっています。\n日をまたいで登録しますか？\n\n※ 終了時刻は翌日として計算されます');
    if(!ok)return;
  }
  const shift={id:Date.now()+Math.random(),type,date,start,end,memo,closed:false,gcalEventId:null,overnight:start>=end};
  shifts.push(shift);
  save();checkConflicts();renderShifts();renderMetrics();renderHome();
  showFlash('add-msg','追加しました',true);
  if(window._gcalToken)syncToGcal(shift);
}

function openEditModal(id){
  const s=shifts.find(x=>x.id===id);if(!s)return;
  document.getElementById('edit-shift-id').value=id;
  document.getElementById('edit-date').value=s.date;
  document.getElementById('edit-start').value=s.start;
  document.getElementById('edit-end').value=s.end;
  document.getElementById('edit-memo').value=s.memo||'';
  document.getElementById('edit-modal').classList.add('open');
}
function closeEditModal(){document.getElementById('edit-modal').classList.remove('open');}
function saveEdit(){
  const id=parseFloat(document.getElementById('edit-shift-id').value);
  const s=shifts.find(x=>x.id===id);if(!s)return;
  const newDate=document.getElementById('edit-date').value;
  const newStart=document.getElementById('edit-start').value;
  const newEnd=document.getElementById('edit-end').value;
  const newMemo=document.getElementById('edit-memo').value;
  if(!newDate){alert('日付を入力してください');return;}
  if(!newStart||!newEnd){alert('時刻を入力してください');return;}
  if(newStart>=newEnd){
    const ok=confirm('開始時刻が終了時刻より遅くなっています。\n日をまたいで登録しますか？');
    if(!ok)return;
  }
  const oldGcalId=s.gcalEventId;
  s.date=newDate;s.start=newStart;s.end=newEnd;s.memo=newMemo;
  s.overnight=newStart>=newEnd;s.gcalEventId=null;
  if(window._gcalToken&&oldGcalId){deleteFromGcal(oldGcalId);syncToGcal(s);}
  save();renderShifts();renderMetrics();renderHome();closeEditModal();
}

function toggleClose(id){
  const s=shifts.find(x=>x.id===id);if(!s)return;
  s.closed=!s.closed;
  save();renderShifts();renderMetrics();renderHome();
}
function deleteShift(id){
  if(!confirm('このシフトを削除しますか？'))return;
  const s=shifts.find(x=>x.id===id);
  if(s&&s.gcalEventId)deleteFromGcal(s.gcalEventId);
  shifts=shifts.filter(x=>x.id!==id);
  save();checkConflicts();renderShifts();renderMetrics();renderHome();
}

function durationH(s,e){
  const[sh,sm]=s.split(':').map(Number);
  const[eh,em]=e.split(':').map(Number);
  let diff=(eh*60+em)-(sh*60+sm);
  if(diff<=0)diff+=24*60;
  return diff/60;
}

function getConflictIds(){
  const sorted=[...shifts].filter(s=>!s.closed).sort((a,b)=>(a.date+a.start)<(b.date+b.start)?-1:1);
  const ids=new Set();
  for(let i=0;i<sorted.length-1;i++){const a=sorted[i],b=sorted[i+1];if(a.date===b.date&&a.end>b.start){ids.add(a.id);ids.add(b.id);}}
  return ids;
}

function renderShifts(){
  const yr=viewMonth.getFullYear(),mo=viewMonth.getMonth();
  document.getElementById('month-label').textContent=yr+'年'+(mo+1)+'月';
  const conflictIds=getConflictIds();
  const list=shifts.filter(s=>{const d=new Date(s.date);return d.getFullYear()===yr&&d.getMonth()===mo;}).sort((a,b)=>(a.date+a.start)<(b.date+b.start)?-1:1);
  const el=document.getElementById('shift-list');
  if(!list.length){el.innerHTML='<p style="font-size:13px;color:var(--text2)">この月のシフトはありません</p>';return;}
  el.innerHTML=list.map(s=>{
    const h=durationH(s.start,s.end);
    const isClass=s.type==='normal'||s.type==='camp';
    const isHourly=TYPE_HOURLY[s.type];
    let sub=isHourly?`${s.start}〜${s.end}（${h.toFixed(1)}h）${s.memo?'・'+s.memo:''}`:`${s.start}〜${s.end}（1コマ）${s.memo?'・'+s.memo:''}`;
    if(s.closed)sub+=` → クローズ（15分 ¥${Math.round((rates.close||0)*0.25).toLocaleString()}）`;
    const isConflict=conflictIds.has(s.id);
    const closedBadge=s.closed?'<span class="closed-badge">クローズ</span>':'';
    const gcalBadge=s.gcalEventId?'<span class="gcal-badge" style="font-size:13px;line-height:1">📅</span>':'';
    const conflictBadge=isConflict?'<span class="conflict-badge">⚠ 重複</span>':'';
    const closeBtn=isClass?`<button class="btn ${s.closed?'btn-reopen':'btn-warn'}" onclick="toggleClose(${s.id})">${s.closed?'解除':'クローズ'}</button>`:'';
    const editBtn=isHourly?`<button class="btn btn-edit" onclick="openEditModal(${s.id})">編集</button>`:'';
    return`<div class="shift-item${isConflict?' has-conflict':''}">
      <div class="shift-dot" style="background:${s.closed?'#888':TYPE_COLOR[s.type]}"></div>
      <div class="shift-body">
        <div class="shift-title">${s.date.slice(5).replace('-','/')} ${TYPE_LABEL[s.type]} ${closedBadge}${s.overnight?'<span style="font-size:11px;padding:2px 6px;border-radius:20px;background:var(--bg3);color:var(--text2)">日またぎ</span>':''}${gcalBadge}${conflictBadge}</div>
        <div class="shift-sub">${sub}</div>
      </div>
      <div class="shift-actions">${editBtn}${closeBtn}<button class="btn btn-sm btn-danger" onclick="deleteShift(${s.id})">削除</button></div>
    </div>`;
  }).join('');
}

function changeMonth(d){viewMonth.setMonth(viewMonth.getMonth()+d);renderShifts();renderMetrics();}

function renderMetrics(){
  const yr=viewMonth.getFullYear(),mo=viewMonth.getMonth();
  const r=getRatesForMonth(toMonthStr(yr,mo));
  const list=shifts.filter(s=>{const d=new Date(s.date);return d.getFullYear()===yr&&d.getMonth()===mo;});
  let komaNomal=0,komaCamp=0,hTraining=0,hDev=0,hMtg=0,hSns=0,pay=0;
  list.forEach(s=>{
    if(s.closed){hMtg+=0.25;pay+=(r.close||0)*0.25;}
    else if(s.type==='normal'){komaNomal++;pay+=(r.normal||0);}
    else if(s.type==='camp'){komaCamp++;pay+=(r.camp||0);}
    else if(s.type==='training'){const h=durationH(s.start,s.end);hTraining+=h;pay+=h*(r.training||0);}
    else if(s.type==='dev'){const h=durationH(s.start,s.end);hDev+=h;pay+=h*(r.dev||0);}
    else if(s.type==='mtg'){const h=durationH(s.start,s.end);hMtg+=h;pay+=h*(r.mtg||0);}
    else if(s.type==='sns'){const h=durationH(s.start,s.end);hSns+=h;pay+=h*(r.sns||0);}
  });
  document.getElementById('m-koma-normal').textContent=komaNomal+'コマ';
  document.getElementById('m-koma-camp').textContent=komaCamp+'コマ';
  document.getElementById('m-hours-training').textContent=hTraining.toFixed(2)+'h';
  document.getElementById('m-hours-dev').textContent=hDev.toFixed(2)+'h';
  document.getElementById('m-hours-mtg').textContent=hMtg.toFixed(2)+'h';
  document.getElementById('m-hours-sns').textContent=hSns.toFixed(2)+'h';
  document.getElementById('m-pay').textContent='¥'+Math.round(pay).toLocaleString();
}

function checkConflicts(){
  const sorted=[...shifts].filter(s=>!s.closed).sort((a,b)=>(a.date+a.start)<(b.date+b.start)?-1:1);
  const conflicts=[];
  for(let i=0;i<sorted.length-1;i++){const a=sorted[i],b=sorted[i+1];if(a.date===b.date&&a.end>b.start)conflicts.push(`${a.date.slice(5).replace('-','/')} ${TYPE_LABEL[a.type]}(${a.start}〜${a.end}) と ${TYPE_LABEL[b.type]}(${b.start}〜${b.end})`);}
  document.getElementById('conflict-zone').innerHTML=conflicts.length?`<div class="alert alert-danger">⚠ ダブルブッキングがあります！<br>${conflicts.map(c=>`• ${c}`).join('<br>')}</div>`:'';
}

function getNthWeekday(yr,mo,week,day){
  let d=new Date(yr,mo,1),count=0;
  while(d.getMonth()===mo){if(d.getDay()===day){if(count===week)return new Date(d);count++;}d.setDate(d.getDate()+1);}
  return null;
}
function buildWeekGrid(){
  const mv=document.getElementById('bulk-month').value;
  const grid=document.getElementById('week-grid');
  if(!mv){grid.innerHTML='<p style="font-size:13px;color:var(--text2)">年月を選択してください</p>';return;}
  const[yr,mo]=mv.split('-').map(Number);
  grid.innerHTML='';
  for(let w=0;w<5;w++){
    const block=document.createElement('div');block.className='week-block';
    const hdr=document.createElement('div');hdr.className='week-header';
    hdr.innerHTML=`<span>${WEEK_LABELS[w]}</span><span>▾</span>`;
    const body=document.createElement('div');body.className='week-body';
    const row=document.createElement('div');row.className='day-row';
    let anyExists=false;
    for(let dayIdx=0;dayIdx<7;dayIdx++){
      const dt=getNthWeekday(yr,mo-1,w,dayIdx);
      const btn=document.createElement('button');btn.className='day-btn';
      btn.textContent=DAYS_JA[dayIdx];
      if(!dt){btn.disabled=true;}
      else{btn.title=`${mo}/${dt.getDate()}`;btn.dataset.week=w;btn.dataset.day=dayIdx;btn.onclick=function(){this.classList.toggle('on');};anyExists=true;}
      row.appendChild(btn);
    }
    if(!anyExists){const note=document.createElement('p');note.style.cssText='font-size:12px;color:var(--text3)';note.textContent='この週は存在しません';row.appendChild(note);}
    body.appendChild(row);hdr.onclick=()=>body.classList.toggle('open');
    block.appendChild(hdr);block.appendChild(body);grid.appendChild(block);
  }
}
function executeBulk(){
  const mv=document.getElementById('bulk-month').value;
  const type=document.getElementById('bulk-type').value;
  const start=document.getElementById('bulk-start').value;
  const end=document.getElementById('bulk-end').value;
  const memo=document.getElementById('bulk-memo').value;
  if(!mv||!start||!end){showFlash('bulk-msg','年月・時刻を入力してください',false);return;}
  let isOvernight=start>=end;
  if(isOvernight){
    const ok=confirm('開始時刻（'+start+'）が終了時刻（'+end+'）より遅くなっています。\n日をまたいで一括登録しますか？\n\n※ 終了時刻は翌日として計算されます');
    if(!ok)return;
  }
  const[yr,mo]=mv.split('-').map(Number);
  const sel=document.querySelectorAll('#week-grid .day-btn.on');
  if(!sel.length){showFlash('bulk-msg','曜日を選択してください',false);return;}
  let count=0;
  sel.forEach(btn=>{
    const dt=getNthWeekday(yr,mo-1,parseInt(btn.dataset.week),parseInt(btn.dataset.day));
    if(dt){const shift={id:Date.now()+Math.random(),type,date:toLocalDateStr(dt),start,end,memo,closed:false,gcalEventId:null};shifts.push(shift);count++;if(window._gcalToken)syncToGcal(shift);}
  });
  save();checkConflicts();renderShifts();renderMetrics();renderHome();
  showFlash('bulk-msg',count+'件を登録しました（存在しない週は自動スキップ）',true);
  document.querySelectorAll('#week-grid .day-btn.on').forEach(b=>b.classList.remove('on'));
}

function calcMonthPay(yr,mo){
  const r=getRatesForMonth(toMonthStr(yr,mo));
  const list=shifts.filter(s=>{const d=new Date(s.date);return d.getFullYear()===yr&&d.getMonth()===mo;});
  let pay=0;
  list.forEach(s=>{
    if(s.closed){pay+=(r.close||0)*0.25;}
    else if(s.type==='normal'){pay+=(r.normal||0);}
    else if(s.type==='camp'){pay+=(r.camp||0);}
    else if(TYPE_HOURLY[s.type]){pay+=durationH(s.start,s.end)*(r[s.type]||0);}
  });
  return Math.round(pay);
}

function generateInvoice(){
  const mv=document.getElementById('inv-month').value;if(!mv)return;
  const[yr,mo]=mv.split('-').map(Number);
  const includeNormal=document.getElementById('inv-include-normal')?.checked||false;
  const sortFn=(a,b)=>(a.date+a.start)<(b.date+b.start)?-1:1;
  const inMonth=shifts.filter(s=>{const d=new Date(s.date);return d.getFullYear()===yr&&d.getMonth()+1===mo;}).sort(sortFn);
  const normalShifts =inMonth.filter(s=>s.type==='normal'&&!s.closed);
  const campShifts   =inMonth.filter(s=>s.type==='camp'&&!s.closed);
  const trainingShifts=inMonth.filter(s=>s.type==='training'&&!s.closed);
  const devShifts    =inMonth.filter(s=>s.type==='dev'&&!s.closed);
  const snsShifts    =inMonth.filter(s=>s.type==='sns'&&!s.closed);
  const mtgShifts    =inMonth.filter(s=>s.type==='mtg'&&!s.closed);
  const closedShifts =inMonth.filter(s=>(s.type==='normal'||s.type==='camp')&&s.closed);
  let lines=[];
  // 通常クラス（チェックONの場合のみ）
  if(includeNormal&&normalShifts.length){
    lines.push('講師業務通常');
    normalShifts.forEach(s=>{const d=new Date(s.date);const memo=s.memo?' '+s.memo:'';lines.push(`${d.getMonth()+1}/${d.getDate()} ${s.start}${memo}`);});
    lines.push('');
  }
  if(campShifts.length){
    lines.push('講師業務キャンプ');
    campShifts.forEach(s=>{const d=new Date(s.date);const memo=s.memo?' '+s.memo:'';lines.push(`${d.getMonth()+1}/${d.getDate()} ${s.start}${memo}`);});
    lines.push('');
  }
  const hasOuter=trainingShifts.length||devShifts.length||snsShifts.length||mtgShifts.length||closedShifts.length;
  if(hasOuter){
    lines.push('講師外業務');
    trainingShifts.forEach(s=>{const d=new Date(s.date);const memo=s.memo?' '+s.memo:'';lines.push(`${d.getMonth()+1}/${d.getDate()} ${s.start}-${s.end} (研修業務${memo})`);});
    devShifts.forEach(s=>{const d=new Date(s.date);const memo=s.memo?' '+s.memo:'';lines.push(`${d.getMonth()+1}/${d.getDate()} ${s.start}-${s.end} (教材開発${memo})`);});
    snsShifts.forEach(s=>{const d=new Date(s.date);const memo=s.memo?' '+s.memo:'';lines.push(`${d.getMonth()+1}/${d.getDate()} ${s.start}-${s.end} (SNSマーケティング${memo})`);});
    mtgShifts.forEach(s=>{const d=new Date(s.date);const memo=s.memo?' '+s.memo:'';lines.push(`${d.getMonth()+1}/${d.getDate()} ${s.start}-${s.end} (その他MTG${memo})`);});
    closedShifts.forEach(s=>{const d=new Date(s.date);lines.push(`${d.getMonth()+1}/${d.getDate()} ${s.start} (その他MTG 授業クローズ 15分)`);});
  }
  if(!lines.length)lines=['（この月の対象シフトはありません）'];
  document.getElementById('invoice-out').textContent=lines.join('\n');
}
function copyInvoice(){navigator.clipboard.writeText(document.getElementById('invoice-out').textContent).then(()=>alert('コピーしました')).catch(()=>alert('コピーに失敗しました'));}

function changeYear(d){viewYear+=d;renderAnnual();}
function saveGoal(){annualGoals[viewYear]=parseInt(document.getElementById('annual-goal-input').value)||0;save();renderAnnual();}
function savePayment(yrmo,val){payments[yrmo]=parseInt(val)||0;save();renderAnnual();}

function renderAnnual(){
  document.getElementById('year-label').textContent=viewYear+'年';
  const goal=annualGoals[viewYear]||0;
  document.getElementById('annual-goal-input').value=goal||'';
  document.getElementById('annual-goal-disp').textContent='¥'+goal.toLocaleString();
  let totalCalc=0,totalPaid=0;
  const rows=[];
  for(let i=0;i<12;i++){
    const workYr=i===0?viewYear-1:viewYear;
    const workMo=i===0?11:i-1;
    const payYrmo=`${viewYear}-${String(i+1).padStart(2,'0')}`;
    const calc=calcMonthPay(workYr,workMo);
    const paid=payments[payYrmo]||0;
    totalCalc+=calc;totalPaid+=paid;
    const workLabel=i===0?`${viewYear-1}年12月分`:`${viewYear}年${i}月分`;
    const payLabel=`${viewYear}/${String(i+1).padStart(2,'0')}/25振込`;
    rows.push({workLabel,payLabel,payYrmo,calc,paid});
  }
  document.getElementById('annual-calc').textContent='¥'+totalCalc.toLocaleString();
  document.getElementById('annual-paid').textContent='¥'+totalPaid.toLocaleString();
  const pct=goal>0?Math.min(100,Math.round(totalPaid/goal*100)):0;
  document.getElementById('annual-pct').textContent=pct+'%';
  document.getElementById('annual-bar').style.width=pct+'%';
  document.getElementById('monthly-list').innerHTML=rows.map(r=>`
    <div class="monthly-row">
      <span style="width:90px;font-size:11px;color:var(--text2);flex-shrink:0">${r.workLabel}</span>
      <span style="flex:1;font-size:12px;color:var(--text2)">¥${r.calc.toLocaleString()}<br><span style="font-size:10px;color:var(--text3)">${r.payLabel}</span></span>
      <span style="width:120px;flex-shrink:0">
        <input type="number" style="font-size:13px;padding:5px 8px;text-align:right;border:.5px solid var(--border2);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);width:100%"
          placeholder="振込額" value="${r.paid||''}" onchange="savePayment('${r.payYrmo}',this.value)">
      </span>
    </div>`).join('');
}

function addRateHistory(){
  const from=document.getElementById('rh-from').value;
  if(!from){showFlash('rh-msg','開始月を入力してください',false);return;}
  const to=document.getElementById('rh-to').value||'';
  const r={};
  ALL_RATE_KEYS.forEach(k=>{const v=parseFloat(document.getElementById('rh-'+k).value);if(v)r[k]=v;});
  if(!Object.keys(r).length){showFlash('rh-msg','少なくとも1つの単価を入力してください',false);return;}
  rateHistory.push({from,to,rates:r});rateHistory.sort((a,b)=>b.from.localeCompare(a.from));
  save();renderRateHistory();showFlash('rh-msg','追加しました',true);
  ['rh-from','rh-to',...ALL_RATE_KEYS.map(k=>'rh-'+k)].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}
function deleteRateHistory(idx){if(!confirm('この履歴を削除しますか？'))return;rateHistory.splice(idx,1);save();renderRateHistory();}
function renderRateHistory(){
  const el=document.getElementById('rate-history-list');
  if(!rateHistory.length){el.innerHTML='<p style="font-size:13px;color:var(--text2)">履歴がありません</p>';return;}
  el.innerHTML=rateHistory.map((h,i)=>{
    const rStr=Object.entries(h.rates).map(([k,v])=>`${TYPE_LABEL[k]||k}:¥${v}`).join('、');
    return`<div class="rate-history-item">
      <div style="flex:1"><div style="font-weight:500">${h.from} 〜 ${h.to||'現在'}</div><div style="font-size:12px;color:var(--text2);margin-top:2px">${rStr}</div></div>
      <button class="btn btn-sm btn-danger" onclick="deleteRateHistory(${i})">削除</button>
    </div>`;
  }).join('');
}

function syncToGcal(shift){
  if(!window._gcalToken)return;
  const isClass=!TYPE_HOURLY[shift.type];
  let endDate=shift.date;
  if(shift.overnight){
    const d=new Date(shift.date+'T00:00:00');
    d.setDate(d.getDate()+1);
    endDate=toLocalDateStr(d);
  }
  fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events',{
    method:'POST',headers:{'Authorization':'Bearer '+window._gcalToken,'Content-Type':'application/json'},
    body:JSON.stringify({
      summary:TYPE_GCAL[shift.type]+(shift.memo?' '+shift.memo:''),
      start:{dateTime:`${shift.date}T${shift.start}:00`,timeZone:'Asia/Tokyo'},
      end:{dateTime:`${endDate}T${shift.end}:00`,timeZone:'Asia/Tokyo'},
      reminders:{useDefault:false,overrides:isClass?[{method:'popup',minutes:15}]:[{method:'popup',minutes:10}]}
    })
  }).then(r=>r.json()).then(data=>{if(data.id){const s=shifts.find(x=>x.id===shift.id);if(s){s.gcalEventId=data.id;save();renderShifts();}}}).catch(()=>{});
}
function deleteFromGcal(gcalEventId){
  if(!window._gcalToken||!gcalEventId)return Promise.resolve();
  return fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${gcalEventId}`,{method:'DELETE',headers:{'Authorization':'Bearer '+window._gcalToken}})
    .catch(e=>console.warn('deleteFromGcal失敗', gcalEventId, e));
}

function exportData(){
  const blob=new Blob([JSON.stringify({version:APP_VERSION,shifts,rates,rateHistory,payments,annualGoals},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`shifts_${toLocalDateStr(new Date())}.json`;a.click();
  URL.revokeObjectURL(url);
}
function importData(){document.getElementById('import-file').click();}
function handleImport(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    try{
      const data=JSON.parse(ev.target.result);
      if(data.shifts){shifts=data.shifts;saveLocal();}
      if(data.rates){rates={...rates,...data.rates};try{localStorage.setItem('rates_v2',JSON.stringify(rates));}catch(ex){}}
      if(data.rateHistory)rateHistory=data.rateHistory;
      if(data.payments)payments=data.payments;
      if(data.annualGoals)annualGoals=data.annualGoals;
      renderAll();ALL_RATE_KEYS.forEach(k=>{const el=document.getElementById('rate-'+k);if(el)el.value=rates[k]||'';});
      alert('インポートしました');
    }catch(ex){alert('ファイルの読み込みに失敗しました');}
  };
  reader.readAsText(file);
}
function clearAll(){
  if(confirm('全データを削除しますか？この操作は取り消せません。')){
    shifts=[];rateHistory=[];payments={};annualGoals={};
    save();renderAll();
  }
}


// ── 管理者画面 ──
const ROLE_ORDER = ['admin','operator','ul','sub_ul','instructor','trainee'];

// 自分が変更できる役職を返す
function getEditableRoles(myRole) {
  if (myRole === 'admin' || myRole === 'operator') {
    return ROLE_ORDER; // 全役職変更可能
  } else if (myRole === 'ul') {
    return ['ul','sub_ul','instructor','trainee']; // ul以下
  }
  return [];
}

// ユーザー一覧を描画
async function renderAdminUserList() {
  const el = document.getElementById('admin-user-list');
  if (!el) return;
  el.innerHTML = '<p style="font-size:13px;color:var(--text2)">読み込み中...</p>';
  const users = await window.fetchAllUsers();
  const myRole = window._currentUser?.role || '';
  const editableRoles = getEditableRoles(myRole);
  const canAddDelete = ['admin','operator'].includes(myRole);
  const canAddPending = ['ul','operator','admin'].includes(myRole);
  // 追加ボタンの表示制御
  const addBtn = document.getElementById('admin-add-user-btn');
  if (addBtn) addBtn.style.display = canAddDelete ? '' : 'none';
  const addPendingBtn = document.getElementById('admin-add-pending-btn');
  if (addPendingBtn) addPendingBtn.style.display = canAddPending ? '' : 'none';

  // コースフィルターの選択肢を用意（初回のみ）
  const courseSelect = document.getElementById('admin-filter-course');
  if (courseSelect && courseSelect.options.length <= 1 && window.COURSE_LIST) {
    window.COURSE_LIST.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id; opt.textContent = c.id;
      courseSelect.appendChild(opt);
    });
  }
  const filterCourse = courseSelect?.value || '';
  const prioritySelect = document.getElementById('admin-filter-priority');
  if (prioritySelect) prioritySelect.style.display = filterCourse ? '' : 'none';
  const filterPriority = prioritySelect?.value || '';

  let filteredUsers = users;
  if (filterCourse) {
    filteredUsers = users.filter(u => (u.courses||[]).some(c =>
      c.course === filterCourse && (!filterPriority || (c.priority||99) <= Number(filterPriority))
    ));
  }

  if (!filteredUsers.length) {
    el.innerHTML = '<p style="font-size:13px;color:var(--text2)">該当するユーザーがいません</p>';
    return;
  }

  // 役職レベル順にソート
  filteredUsers.sort((a,b) => (window.ROLES[b.role]?.level||0) - (window.ROLES[a.role]?.level||0));

  el.innerHTML = filteredUsers.map(u => {
    const roleLabel = window.ROLES[u.role]?.label || u.role;
    const canEditThisUser = editableRoles.includes(u.role) && u.email !== window._currentUser?.email;
    const roleBg = {
      admin:'#fdecea', operator:'#fff8e1', ul:'#edfaef',
      sub_ul:'#e8f4fd', instructor:'#f5f5f5', trainee:'#fafafa'
    }[u.role] || '#f5f5f5';
    const roleColor = {
      admin:'#c0392b', operator:'#b45309', ul:'#1a7a32',
      sub_ul:'#185FA5', instructor:'#444', trainee:'#888'
    }[u.role] || '#444';

    const staffTypeBadges = (u.staffTypes||[]).map(t => {
      const label = STAFF_TYPE_LABELS[t] || t;
      const colors = { material_dev:{bg:'#eef0fd',color:'#534AB7'}, sns_marketing:{bg:'#e0f7fa',color:'#0e7490'} }[t] || {bg:'#f5f5f5',color:'#666'};
      return `<span style="font-size:10px;padding:1px 8px;border-radius:20px;background:${colors.bg};color:${colors.color};font-weight:500;white-space:nowrap">${label}</span>`;
    }).join('');

    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:.5px solid var(--border)">
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:500;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          <span>${u.name||'(名前未設定)'}</span>
          ${u.isPending ? '<span style="font-size:10px;padding:1px 8px;border-radius:20px;background:var(--warning-bg);color:var(--warning-text);font-weight:500;white-space:nowrap">仮登録</span>' : ''}
          ${staffTypeBadges}
        </div>
        <div style="font-size:12px;color:var(--text2);margin-top:2px">${u.email}</div>
      </div>
      <span style="font-size:11px;padding:2px 10px;border-radius:20px;background:${roleBg};color:${roleColor};font-weight:500;white-space:nowrap">${roleLabel}</span>
      <div style="display:flex;gap:4px;flex-shrink:0">
        ${canEditThisUser ? `<button class="btn btn-sm" onclick='openEditRoleModal(${JSON.stringify(u.email)},${JSON.stringify(u.name||"")},${JSON.stringify(u.role)},${JSON.stringify(u.staffTypes||[])})'>役職変更</button>` : ''}
        ${canAddDelete && u.email !== window._currentUser?.email ? `<button class="btn btn-sm btn-danger" onclick="deleteUser('${u.email}','${u.name||u.email}')">削除</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ユーザー追加モーダル
function openAddUserModal() {
  // 権限チェック
  const myRole = window._currentUser?.role || '';
  if (!['admin','operator'].includes(myRole)) {
    alert('ユーザーを追加する権限がありません');
    return;
  }
  document.getElementById('add-user-email').value = '';
  document.getElementById('add-user-name').value = '';
  document.getElementById('add-user-role').value = 'instructor';
  document.getElementById('add-user-msg').className = 'flash';
  // 自分の役職に応じて選択肢を制限
  const editableRoles = getEditableRoles(myRole);
  const sel = document.getElementById('add-user-role');
  Array.from(sel.options).forEach(opt => {
    opt.style.display = editableRoles.includes(opt.value) ? '' : 'none';
  });
  document.getElementById('add-user-modal').classList.add('open');
}
function closeAddUserModal() { document.getElementById('add-user-modal').classList.remove('open'); }
async function submitAddUser() {
  // 権限チェック
  const myRole = window._currentUser?.role || '';
  if (!['admin','operator'].includes(myRole)) {
    showFlash('add-user-msg','ユーザーを追加する権限がありません',false);
    return;
  }
  const email = document.getElementById('add-user-email').value.trim();
  const name  = document.getElementById('add-user-name').value.trim();
  const role  = document.getElementById('add-user-role').value;
  if (!email || !name) { showFlash('add-user-msg','メールアドレスと名前を入力してください',false); return; }
  if (!email.includes('@')) { showFlash('add-user-msg','正しいメールアドレスを入力してください',false); return; }
  const ok = await window.addAllowedUser(email, name, role);
  if (ok) {
    showFlash('add-user-msg','追加しました',true);
    setTimeout(() => { closeAddUserModal(); renderAdminUserList(); }, 1000);
  } else {
    showFlash('add-user-msg','追加に失敗しました',false);
  }
}

// 仮の講師登録（メールアドレス未定・UL以上）
function openAddPendingModal() {
  const myRole = window._currentUser?.role || '';
  if (!['ul','operator','admin'].includes(myRole)) { alert('仮登録を行う権限がありません'); return; }
  document.getElementById('add-pending-name').value = '';
  document.getElementById('add-pending-role').value = 'instructor';
  document.getElementById('add-pending-msg').className = 'flash';
  document.getElementById('add-pending-modal').classList.add('open');
}
function closeAddPendingModal() { document.getElementById('add-pending-modal').classList.remove('open'); }
async function submitAddPending() {
  const myRole = window._currentUser?.role || '';
  if (!['ul','operator','admin'].includes(myRole)) { showFlash('add-pending-msg','仮登録を行う権限がありません',false); return; }
  const name = document.getElementById('add-pending-name').value.trim();
  const role = document.getElementById('add-pending-role').value;
  if (!name) { showFlash('add-pending-msg','名前を入力してください',false); return; }
  const id = await window.createPendingStaff(name, role);
  if (id) {
    showFlash('add-pending-msg','仮登録しました',true);
    setTimeout(() => { closeAddPendingModal(); renderAdminUserList(); }, 1000);
  } else {
    showFlash('add-pending-msg','登録に失敗しました',false);
  }
}

// 業務タイプ（役職とは別枠。この2種類は役職に関わらずMTG作成が可能）
const STAFF_TYPE_LABELS = { material_dev:'教材開発', sns_marketing:'SNSマーケティング' };

// 役職変更モーダル
function openEditRoleModal(email, name, currentRole, currentStaffTypes) {
  document.getElementById('edit-role-email').value = email;
  document.getElementById('edit-role-user-name').textContent = `${name} (${email})`;
  document.getElementById('edit-role-msg').className = 'flash';
  // 選択可能な役職を設定
  const myRole = window._currentUser?.role || '';
  const editableRoles = getEditableRoles(myRole);
  const sel = document.getElementById('edit-role-select');
  sel.innerHTML = editableRoles.map(r =>
    `<option value="${r}" ${r===currentRole?'selected':''}>${window.ROLES[r]?.label||r}</option>`
  ).join('');
  // 業務タイプのチェックボックスを設定
  const types = currentStaffTypes || [];
  const typeArea = document.getElementById('edit-role-staff-types');
  if (typeArea) {
    typeArea.innerHTML = Object.entries(STAFF_TYPE_LABELS).map(([key,label]) => `
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;margin-bottom:6px">
        <input type="checkbox" value="${key}" ${types.includes(key)?'checked':''} style="width:16px;height:16px">
        ${label}
      </label>
    `).join('');
  }
  document.getElementById('edit-role-modal').classList.add('open');
}
function closeEditRoleModal() { document.getElementById('edit-role-modal').classList.remove('open'); }
async function submitEditRole() {
  const email   = document.getElementById('edit-role-email').value;
  const newRole = document.getElementById('edit-role-select').value;
  const typeArea = document.getElementById('edit-role-staff-types');
  const newTypes = typeArea
    ? Array.from(typeArea.querySelectorAll('input[type="checkbox"]:checked')).map(el => el.value)
    : [];
  const ok = await window.updateUserRole(email, newRole);
  const ok2 = await window.updateStaffTypes(email, newTypes);
  if (ok && ok2) {
    showFlash('edit-role-msg','役職を変更しました',true);
    setTimeout(() => { closeEditRoleModal(); renderAdminUserList(); }, 1000);
  } else {
    showFlash('edit-role-msg','変更に失敗しました',false);
  }
}

// ユーザー削除
async function deleteUser(email, name) {
  const myRole = window._currentUser?.role || '';
  if (!['admin','operator'].includes(myRole)) {
    alert('ユーザーを削除する権限がありません');
    return;
  }
  if (!confirm(`${name} を削除しますか？\nシフト履歴・受けた講師評価・ユニットのリーダー設定など、関連するデータもまとめて削除されます。\nこの操作は取り消せません。`)) return;
  const result = await window.cascadeDeleteUser(email);
  if (result.errors.length) {
    alert('一部の削除でエラーが発生しました:\n' + result.errors.join('\n'));
  } else {
    alert(`削除しました。\n・シフト履歴: ${result.uidDeleted ? '削除済み' : '対象なし'}\n・評価データ: ${result.evaluationsDeleted}件削除\n・ユニットのリーダー解除: ${result.unitsCleared}件`);
  }
  renderAdminUserList();
}





// Firestoreのフィールドキー用にメールアドレスをエスケープ
function escapeEmail(email) {
  return email.replace(/\./g, '_DOT_').replace(/@/g, '_AT_');
}
function unescapeEmail(key) {
  return key.replace(/_DOT_/g, '.').replace(/_AT_/g, '@');
}

// ── MTG調整 ──
let mtgCandidates = [];
let mtgFilter = 'all'; // フィルター状態
let mtgPersonFilter = ''; // 対象者（招待メンバー）フィルター state

function setMTGFilter(filter) {
  mtgFilter = filter;
  // ボタンのアクティブ状態を更新
  document.querySelectorAll('.mtg-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  loadMTGList();
}

function setMTGPersonFilter(email) {
  mtgPersonFilter = email || '';
  loadMTGList();
}

// 対象者フィルターの選択肢を読み込み（オペレーター以上のみ使用）
async function populateMTGPersonFilter() {
  const sel = document.getElementById('mtg-person-filter');
  if (!sel) return;
  const users = await window.fetchAllUsers();
  const options = ['<option value="">対象者：すべて</option>']
    .concat(users.map(u => `<option value="${u.email}">${u.name||u.email}</option>`));
  sel.innerHTML = options.join('');
  sel.value = mtgPersonFilter;
} // 候補日リスト
let currentMTGId = null; // 現在表示中のMTG ID


// 時刻入力の自動フォーマット
function formatTimeInput(input) {
  let v = input.value.replace(/[^0-9:]/g, '');
  // コロンなしで4桁入力された場合に自動挿入
  const digits = v.replace(/:/g, '');
  if (digits.length >= 4 && !v.includes(':')) {
    v = digits.slice(0,2) + ':' + digits.slice(2,4);
  } else if (digits.length === 3 && !v.includes(':')) {
    v = '0' + digits.slice(0,1) + ':' + digits.slice(1,3);
  }
  input.value = v;
}

// MTG候補の終了時刻を所要時間から自動計算
function autoCalcMTGEnd(idx) {
  const startVal = mtgCandidates[idx].start;
  const duration = parseInt(document.getElementById('mtg-duration')?.value) || 60;
  if (!startVal || !/^\d{2}:\d{2}$/.test(startVal)) return;
  const [h, m] = startVal.split(':').map(Number);
  const totalMin = h * 60 + m + duration;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  const endStr = `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`;
  mtgCandidates[idx].end = endStr;
  const endInput = document.getElementById(`mtg-c-end-${idx}`);
  if (endInput) endInput.value = endStr;
}

// MTGタブ表示
async function renderMTGTab() {
  const myRole = window._currentUser?.role || '';
  const myStaffTypes = window._currentUser?.staffTypes || [];
  const hasCreatePermission = ['admin','operator','ul'].includes(myRole) || myStaffTypes.some(t => ['material_dev','sns_marketing'].includes(t));
  // 現在、スマホ(タッチ操作端末)だと日時の自動計算が正しく動かないため、一時的にMTG新規作成をPC限定にしている
  const isTouchDevice = typeof window.matchMedia === 'function' && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const canCreate = hasCreatePermission && !isTouchDevice;
  const createBtn = document.getElementById('mtg-create-btn');
  if (createBtn) createBtn.style.display = canCreate ? '' : 'none';
  const mobileNote = document.getElementById('mtg-mobile-create-note');
  if (mobileNote) mobileNote.style.display = (hasCreatePermission && isTouchDevice) ? '' : 'none';
  // ステータスフィルター（すべて/調整中/確定/終了/キャンセル）は全ユーザーに表示
  // 対象者（招待メンバー）絞り込みはadmin・operator（オペレーター以上）のみ表示
  const personFilterArea = document.getElementById('mtg-person-filter-area');
  const canSeeAll = ['admin','operator'].includes(myRole);
  if (personFilterArea) personFilterArea.style.display = canSeeAll ? '' : 'none';
  if (canSeeAll) await populateMTGPersonFilter();
  showMTGMainView();
  await loadMTGList();
}

function showMTGMainView() {
  document.getElementById('mtg-main-view').style.display = '';
  document.getElementById('mtg-create-view').style.display = 'none';
  document.getElementById('mtg-detail-view').style.display = 'none';
}

// MTG一覧読み込み
async function loadMTGList() {
  const el = document.getElementById('mtg-list');
  if (!el) return;
  el.innerHTML = '<p style="font-size:13px;color:var(--text2)">読み込み中...</p>';
  const allList = await window.fetchMTGList();
  computeMTGReminders(allList);
  const myEmail = window._currentUser?.email || '';
  const myRole = window._currentUser?.role || '';
  const canSeeAll = ['admin','operator'].includes(myRole);

  // 役職ごとの表示フィルタリング
  let visibleList = allList;
  if (!canSeeAll) {
    visibleList = allList.filter(m => {
      const isCreator = m.createdBy === myEmail;
      const isInvited = (m.invitees||[]).includes(myEmail);
      if (myRole === 'ul') return isCreator || isInvited;
      return isInvited; // sub_ul・instructor・trainee
    });
  }

  // ステータスフィルタリング
  let list = mtgFilter === 'all' ? visibleList : visibleList.filter(m => m.status === mtgFilter);

  // 対象者（招待メンバー）フィルタリング（オペレーター以上のみ）
  if (canSeeAll && mtgPersonFilter) {
    list = list.filter(m => (m.invitees||[]).includes(mtgPersonFilter) || m.createdBy === mtgPersonFilter);
  }

  if (!visibleList.length) {
    el.innerHTML = '<p style="font-size:13px;color:var(--text2)">表示できるMTGがありません</p>';
    return;
  }
  if (!list.length) {
    el.innerHTML = `<p style="font-size:13px;color:var(--text2)">${mtgPersonFilter?'その対象者を含む':''}「${mtgFilter}」のMTGはありません</p>`;
    return;
  }
  el.innerHTML = list.map(mtg => {
    const isCreator = mtg.createdBy === myEmail;
    const isInvited = (mtg.invitees || []).includes(myEmail);
    // ネストしたレスポンスを考慮
    const escapedKey = escapeEmail(myEmail);
    const hasAnswered = mtg.responses && (mtg.responses[escapedKey] || mtg.responses[myEmail]);
    const statusColor = mtg.status === '確定' ? 'var(--success-text)' : mtg.status === '調整中' ? 'var(--warning-text)' : mtg.status === 'キャンセル' ? 'var(--danger-text)' : 'var(--text3)';
    const statusBg = mtg.status === '確定' ? 'var(--success-bg)' : mtg.status === '調整中' ? 'var(--warning-bg)' : mtg.status === 'キャンセル' ? 'var(--danger-bg)' : 'var(--bg3)';
    const answeredBadge = isInvited && !hasAnswered && mtg.status === '調整中'
      ? '<span style="font-size:10px;padding:1px 6px;border-radius:20px;background:var(--danger-bg);color:var(--danger-text)">未回答</span>' : '';
    return `<div style="padding:12px 0;border-bottom:.5px solid var(--border);cursor:pointer" onclick="showMTGDetail('${mtg.id}')">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <div style="font-size:14px;font-weight:500;display:flex;align-items:center;gap:6px">
          ${mtg.title} ${answeredBadge}
        </div>
        <span style="font-size:11px;padding:2px 8px;border-radius:20px;background:${statusBg};color:${statusColor}">${mtg.status}</span>
      </div>
      <div style="font-size:12px;color:var(--text2)">
        <span style="padding:1px 6px;border-radius:20px;background:var(--bg3);color:var(--text2);font-size:11px">${TYPE_LABEL[mtg.shiftType]||'その他MTG'}</span>
        ${mtg.type} · ${mtg.duration}分 · 期限:${mtg.deadline||'未設定'} · 候補${(mtg.candidates||[]).length}件
      </div>
      ${isCreator ? '<div style="font-size:11px;color:var(--text3);margin-top:2px">作成者</div>' : ''}
    </div>`;
  }).join('');
}

// MTG作成フォーム
function showMTGCreateForm() {
  mtgCandidates = [];
  document.getElementById('mtg-title').value = '';
  document.getElementById('mtg-duration').value = '60';
  document.getElementById('mtg-deadline').value = '';
  document.getElementById('mtg-description').value = '';
  document.getElementById('mtg-shift-type').value = 'mtg';
  document.getElementById('mtg-type').value = '調整型';
  document.getElementById('mtg-create-msg').className = 'flash';
  onMTGTypeChange();
  renderMTGInvitees();
  document.getElementById('mtg-main-view').style.display = 'none';
  document.getElementById('mtg-create-view').style.display = '';
  document.getElementById('mtg-detail-view').style.display = 'none';
}
function hideMTGCreateForm() { showMTGMainView(); loadMTGList(); }

// 種別切替（調整型／確定型）：確定型では候補を1件に固定し、複数追加できないようにする
function onMTGTypeChange() {
  const type = document.getElementById('mtg-type').value;
  const addBtn = document.getElementById('mtg-candidate-add-btn');
  const note = document.getElementById('mtg-fixed-type-note');
  if (type === '確定型') {
    if (addBtn) addBtn.style.display = 'none';
    if (note) note.style.display = '';
    if (mtgCandidates.length === 0) mtgCandidates.push({ id: Date.now()+'', date: '', start: '', end: '', gcalEventId: null });
    else if (mtgCandidates.length > 1) mtgCandidates = mtgCandidates.slice(0, 1);
  } else {
    if (addBtn) addBtn.style.display = '';
    if (note) note.style.display = 'none';
  }
  renderMTGCandidates();
}

// 候補日追加
function addMTGCandidate() {
  const type = document.getElementById('mtg-type')?.value;
  if (type === '確定型' && mtgCandidates.length >= 1) return; // 確定型は1件のみ
  mtgCandidates.push({ id: Date.now()+'', date: '', start: '', end: '', gcalEventId: null });
  renderMTGCandidates();
}
function removeMTGCandidate(id) {
  const type = document.getElementById('mtg-type')?.value;
  if (type === '確定型') return; // 確定型では候補を0件にできない（常に1件固定）
  mtgCandidates = mtgCandidates.filter(c => c.id !== id);
  renderMTGCandidates();
}
function renderMTGCandidates() {
  const el = document.getElementById('mtg-candidates');
  if (!el) return;
  const isFixedType = document.getElementById('mtg-type')?.value === '確定型';
  if (!mtgCandidates.length) {
    el.innerHTML = '<p style="font-size:12px;color:var(--text3)">候補日を追加してください（最大制限なし）</p>';
    return;
  }
  el.innerHTML = mtgCandidates.map((c,i) => `
    <div style="display:grid;grid-template-columns:minmax(130px,1fr) minmax(110px,1fr) minmax(110px,1fr) auto;gap:6px;align-items:end;margin-bottom:8px">
      <div class="form-group">
        ${i===0?'<label style="font-size:11px;color:var(--text2)">日付</label>':''}
        <input type="date" value="${c.date}" onchange="setMTGCandidateField(${i},'date',this.value)" style="padding:6px 8px;border:.5px solid var(--border2);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);width:100%;box-sizing:border-box">
      </div>
      <div class="form-group">
        ${i===0?'<label style="font-size:11px;color:var(--text2)">開始</label>':''}
        <input type="time" id="mtg-c-start-${i}" value="${c.start}" onchange="setMTGCandidateField(${i},'start',this.value);autoCalcMTGEnd(${i})" style="padding:6px 8px;border:.5px solid var(--border2);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);width:100%;box-sizing:border-box">
      </div>
      <div class="form-group">
        ${i===0?'<label style="font-size:11px;color:var(--text2)">終了</label>':''}
        <input type="time" id="mtg-c-end-${i}" value="${c.end}" onchange="setMTGCandidateField(${i},'end',this.value)" style="padding:6px 8px;border:.5px solid var(--border2);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);width:100%;box-sizing:border-box">
      </div>
      ${isFixedType ? '' : `<button class="btn btn-sm btn-danger" style="padding:6px 8px" onclick="removeMTGCandidate('${c.id}')" ${i===0?'style="margin-top:18px"':''}>×</button>`}
    </div>`).join('');
}
function setMTGCandidateField(idx, field, value) {
  if (!mtgCandidates[idx]) return;
  mtgCandidates[idx][field] = value;
}

// 招待メンバー
let mtgInvitees = [];
async function renderMTGInvitees() {
  const el = document.getElementById('mtg-invitees-list');
  if (!el) return;
  const users = await window.fetchAllUsers();
  const myEmail = window._currentUser?.email || '';
  let others = users.filter(u => u.email !== myEmail);

  // ユニットフィルターの選択肢を用意（初回のみ）
  const unitSelect = document.getElementById('mtg-invitee-filter-unit');
  if (unitSelect && unitSelect.options.length <= 1 && window.fetchAllUnits) {
    const units = await window.fetchAllUnits();
    units.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.id; opt.textContent = u.name;
      unitSelect.appendChild(opt);
    });
  }
  const filterUnit = unitSelect?.value || '';
  const filterRole = document.getElementById('mtg-invitee-filter-role')?.value || '';
  const filterType = document.getElementById('mtg-invitee-filter-type')?.value || '';

  if (filterUnit) others = others.filter(u => (u.units||[]).some(a => a.unit === filterUnit));
  if (filterRole) others = others.filter(u => u.role === filterRole);
  if (filterType) others = others.filter(u => (u.staffTypes||[]).includes(filterType));

  if (!others.length) {
    el.innerHTML = '<p style="font-size:12px;color:var(--text3)">該当するメンバーがいません</p>';
    return;
  }
  el.innerHTML = others.map(u => `
    <label style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:.5px solid var(--border);cursor:pointer;font-size:13px">
      <input type="checkbox" value="${u.email}" ${mtgInvitees.includes(u.email)?'checked':''} onchange="toggleMTGInvitee('${u.email}')" style="width:16px;height:16px">
      <span>${u.name||u.email}</span>
      <span style="font-size:11px;color:var(--text3)">${ROLES[u.role]?.label||u.role}</span>
    </label>`).join('');
}
function toggleMTGInvitee(email) {
  if (mtgInvitees.includes(email)) {
    mtgInvitees = mtgInvitees.filter(e => e !== email);
  } else {
    mtgInvitees.push(email);
  }
}

// MTG作成送信
async function submitCreateMTG() {
  const title = document.getElementById('mtg-title').value.trim();
  const type = document.getElementById('mtg-type').value;
  const shiftType = document.getElementById('mtg-shift-type').value || 'mtg';
  const duration = parseInt(document.getElementById('mtg-duration').value) || 60;
  const deadline = document.getElementById('mtg-deadline').value;
  const description = document.getElementById('mtg-description').value.trim();
  if (type === '確定型' && mtgCandidates.length > 1) mtgCandidates = mtgCandidates.slice(0, 1); // 確定型は1件のみ（念のための防御）
  if (!title) { showFlash('mtg-create-msg','タイトルを入力してください',false); return; }
  if (!mtgCandidates.length) { showFlash('mtg-create-msg','候補日を1件以上追加してください',false); return; }
  const invalidCandidates = mtgCandidates.some(c => !c.date || !c.start);
  if (invalidCandidates) { showFlash('mtg-create-msg','候補日の日付と開始時刻を入力してください',false); return; }

  // 候補IDを確定（インデックスベース）
  const candidates = await Promise.all(mtgCandidates.map(async (c, idx) => {
    const stableId = `c${idx}_${Date.now()}`;
    let gcalEventId = null;
    const token = window._gcalToken || localStorage.getItem('gcal_token');
    if (token) {
      window._gcalToken = token;
      gcalEventId = await addMTGCandidateToGcal(c, title, duration, shiftType);
    }
    return { ...c, id: stableId, gcalEventId };
  }));

  const mtgData = {
    title, type, shiftType, duration, deadline, description,
    candidates, invitees: mtgInvitees,
    createdBy: window._currentUser?.email || '',
    createdByName: window._currentUser?.name || '',
    responses: {}, status: '調整中'
  };
  const id = await window.createMTG(mtgData);
  if (id) {
    showFlash('mtg-create-msg','MTGを作成しました',true);
    setTimeout(() => { hideMTGCreateForm(); }, 1000);
  } else {
    showFlash('mtg-create-msg','作成に失敗しました',false);
  }
}

// MTGの業務種別からカレンダー表記用の短いラベルを取得（例: '研修', 'MTG'）
function mtgCalLabel(shiftType) {
  const bracketed = TYPE_GCAL[shiftType] || TYPE_GCAL['mtg'];
  return bracketed.replace(/[【】]/g, '');
}

// GoogleカレンダーにMTG候補を仮登録
async function addMTGCandidateToGcal(candidate, title, duration, shiftType) {
  const token = window._gcalToken || localStorage.getItem('gcal_token');
  if (!token || !candidate.date || !candidate.start) {
    console.log('GCal skip:', { token: !!token, date: candidate.date, start: candidate.start });
    return null;
  }
  window._gcalToken = token;
  try {
    const startDT = `${candidate.date}T${candidate.start}:00`;
    // 終了時刻が指定されていない場合は所要時間から計算
    let endTime = candidate.end;
    if (!endTime) {
      const [h,m] = candidate.start.split(':').map(Number);
      const totalMin = h*60 + m + duration;
      endTime = `${String(Math.floor(totalMin/60)).padStart(2,'0')}:${String(totalMin%60).padStart(2,'0')}`;
    }
    const endDT = `${candidate.date}T${endTime}:00`;
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method:'POST',
      headers:{'Authorization':'Bearer '+window._gcalToken,'Content-Type':'application/json'},
      body:JSON.stringify({
        summary:`【${mtgCalLabel(shiftType)}候補】${title}`,
        start:{dateTime:startDT,timeZone:'Asia/Tokyo'},
        end:{dateTime:endDT,timeZone:'Asia/Tokyo'},
        colorId:'5', // バナナ色（候補を示す）
        reminders:{useDefault:false,overrides:[]}
      })
    });
    const data = await res.json();
    return data.id || null;
  } catch(e) { return null; }
}

// MTG詳細表示
async function showMTGDetail(id) {
  currentMTGId = id;
  document.getElementById('mtg-main-view').style.display = 'none';
  document.getElementById('mtg-create-view').style.display = 'none';
  document.getElementById('mtg-detail-view').style.display = '';
  document.getElementById('mtg-detail-content').innerHTML = '<p style="font-size:13px;color:var(--text2)">読み込み中...</p>';
  const mtg = await window.fetchMTG(id);
  if (!mtg) { document.getElementById('mtg-detail-content').innerHTML = '<p style="font-size:13px;color:var(--danger-text)">取得に失敗しました</p>'; return; }
  document.getElementById('mtg-detail-title').textContent = mtg.title;
  renderMTGDetail(mtg);
}
function hideMTGDetail() { currentMTGId = null; showMTGMainView(); loadMTGList(); }

function renderMTGDetail(mtg) {
  const el = document.getElementById('mtg-detail-content');
  if (!el) return;
  const myEmail = window._currentUser?.email || '';
  const myRole = window._currentUser?.role || '';
  const isCreator = mtg.createdBy === myEmail;
  const canManage = isCreator || ['admin','operator'].includes(myRole);
  const isInvited = (mtg.invitees || []).includes(myEmail);
  const myResponseKey = escapeEmail(myEmail);
  const myResponse = mtg.responses?.[myResponseKey] || mtg.responses?.[myEmail];
  const candidates = mtg.candidates || [];
  const responses = mtg.responses || {};

  // 外部リンク
  const shareUrl = `${location.origin}/mtg-response.html?id=${mtg.id}`;

  // 回答集計
  // ネストしてしまったレスポンスをフラット化
  const flatResponses = {};
  Object.entries(responses).forEach(([k,v]) => {
    if (v && typeof v === 'object' && v.candidates) {
      flatResponses[k] = v;
    }
  });
  const responseSummary = candidates.map(c => {
    const count = Object.values(flatResponses).filter(r => (r.candidates||[]).includes(c.id)).length;
    const total = Object.keys(flatResponses).length;
    return { ...c, count, total };
  }).sort((a,b) => b.count - a.count);

  let html = `
    <div style="margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <span style="padding:1px 8px;border-radius:20px;background:var(--bg3);color:var(--text2);font-size:12px">${TYPE_LABEL[mtg.shiftType]||'その他MTG'}</span>
        <span style="font-size:13px;color:var(--text2)">${mtg.type}</span>
        <span style="font-size:13px;color:var(--text2)">·</span>
        <span style="font-size:13px;color:var(--text2)">${mtg.duration}分</span>
        ${mtg.deadline?`<span style="font-size:13px;color:var(--text2)">· 期限: ${mtg.deadline}</span>`:''}
      </div>
      ${mtg.description?`<p style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:8px">${mtg.description}</p>`:''}
      <div style="font-size:12px;color:var(--text3)">作成者: ${mtg.createdByName||mtg.createdBy} · 回答数: ${Object.keys(responses).length}名</div>
    </div>`;

  // 外部共有リンク
  if (canManage) {
    html += `
      <div style="margin-bottom:12px;padding:10px 12px;background:var(--bg2);border-radius:var(--radius-sm)">
        <div style="font-size:12px;color:var(--text2);margin-bottom:6px">外部共有リンク</div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="font-size:11px;color:var(--text3);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${shareUrl}</div>
          <button class="btn btn-sm" onclick="navigator.clipboard.writeText('${shareUrl}').then(()=>alert('コピーしました'))">コピー</button>
        </div>
      </div>`;
  }

  // 候補日一覧と回答集計
  html += `<div class="section-title">候補日程</div>`;
  html += responseSummary.map(c => {
    const pct = c.total > 0 ? Math.round(c.count/c.total*100) : 0;
    const myAnswered = myResponse && (myResponse.candidates||[]).includes(c.id);
    const isConfirmed = mtg.confirmedCandidate === c.id;
    return `
      <div style="padding:10px 12px;margin-bottom:6px;border-radius:var(--radius-sm);border:.5px solid ${isConfirmed?'var(--success-text)':'var(--border)'};background:${isConfirmed?'var(--success-bg)':'var(--bg2)'}">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <div style="font-size:13px;font-weight:500">${c.date} ${c.start}${c.end?'〜'+c.end:''}</div>
          <div style="display:flex;align-items:center;gap:6px">
            ${isConfirmed?'<span style="font-size:11px;padding:2px 8px;border-radius:20px;background:var(--success-bg);color:var(--success-text)">確定</span>':''}
            ${canManage && mtg.status==='調整中'?`<button class="btn btn-sm" style="font-size:11px;padding:3px 8px" onclick="confirmMTG('${mtg.id}','${c.id}')">確定</button>`:''}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;background:var(--bg3);border-radius:20px;height:6px;overflow:hidden">
            <div style="height:100%;border-radius:20px;background:var(--success-text);width:${pct}%;transition:width .3s"></div>
          </div>
          <div style="font-size:12px;color:var(--text2);white-space:nowrap">${c.count}/${c.total}名 (${pct}%)</div>
          ${myAnswered?'<span style="font-size:11px;color:var(--success-text)">✓参加可</span>':''}
        </div>
      </div>`;
  }).join('');

  // 自分の回答フォーム（招待されている場合）
  if ((isInvited || canManage) && mtg.status === '調整中') {
    const isFixedType = mtg.type === '確定型';
    html += `
      <div class="divider"></div>
      <div class="section-title">あなたの回答</div>`;
    if (isFixedType) {
      const c = candidates[0];
      const currentlyYes = myResponse && (myResponse.candidates||[]).includes(c?.id);
      const currentlyNo = myResponse && !currentlyYes;
      html += `
      <p style="font-size:12px;color:var(--text2);margin-bottom:10px">この日程に参加できますか？</p>
      <div id="mtg-response-form" data-mtg-type="確定型" data-candidate-id="${c?.id||''}">
        <div style="display:flex;gap:8px">
          <label style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border-radius:var(--radius-sm);border:.5px solid ${currentlyYes?'var(--success-text)':'var(--border2)'};background:${currentlyYes?'var(--success-bg)':'var(--bg)'};cursor:pointer;font-size:13px">
            <input type="radio" name="mtg-attend" value="yes" ${currentlyYes?'checked':''} style="width:16px;height:16px">
            参加する
          </label>
          <label style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border-radius:var(--radius-sm);border:.5px solid ${currentlyNo?'var(--danger-text)':'var(--border2)'};background:${currentlyNo?'var(--danger-bg)':'var(--bg)'};cursor:pointer;font-size:13px">
            <input type="radio" name="mtg-attend" value="no" ${currentlyNo?'checked':''} style="width:16px;height:16px">
            参加しない
          </label>
        </div>
      </div>`;
    } else {
      html += `
      <p style="font-size:12px;color:var(--text2);margin-bottom:10px">参加可能な日程を選んでください（複数選択可）</p>
      <div id="mtg-response-form" data-mtg-type="調整型">`;
      candidates.forEach(c => {
        const checked = myResponse && (myResponse.candidates||[]).includes(c.id);
        html += `
        <label style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:.5px solid var(--border);cursor:pointer;font-size:13px">
          <input type="checkbox" value="${c.id}" ${checked?'checked':''} style="width:16px;height:16px">
          <span>${c.date} ${c.start}${c.end?'〜'+c.end:''}</span>
        </label>`;
      });
      html += `</div>`;
    }
    html += `
      <div class="btn-row" style="margin-top:10px">
        <button class="btn btn-primary" onclick="submitMTGResponse('${mtg.id}')">回答を送信</button>
      </div>
      <div class="flash" id="mtg-response-msg"></div>`;
  }

  // 回答一覧を表形式で表示（作成者・管理者のみ）
  if (canManage && Object.keys(flatResponses).length > 0) {
    html += `<div class="divider"></div><div class="section-title">回答一覧</div>`;
    // 表ヘッダー
    html += `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">`;
    html += `<thead><tr style="background:var(--bg2)">`;
    html += `<th style="padding:8px 10px;text-align:left;border:.5px solid var(--border);white-space:nowrap">名前</th>`;
    candidates.forEach(c => {
      html += `<th style="padding:8px 6px;text-align:center;border:.5px solid var(--border);white-space:nowrap">${c.date.slice(5)}<br>${c.start}</th>`;
    });
    html += `</tr></thead><tbody>`;
    // 各ユーザーの回答行
    Object.entries(flatResponses).forEach(([key, r]) => {
      html += `<tr>`;
      html += `<td style="padding:8px 10px;border:.5px solid var(--border);font-weight:500;white-space:nowrap">${r.name||unescapeEmail(key)}</td>`;
      candidates.forEach(c => {
        const canAttend = (r.candidates||[]).includes(c.id);
        html += `<td style="padding:8px 6px;text-align:center;border:.5px solid var(--border);background:${canAttend?'var(--success-bg)':'var(--bg)'};color:${canAttend?'var(--success-text)':'var(--text3)'}">
          ${canAttend?'✓':'－'}
        </td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody></table></div>`;
  }

  // 終了・削除ボタン
  if (canManage) {
    html += '<div class="divider"></div><div style="display:flex;gap:8px;flex-wrap:wrap">';
    if (mtg.status === '確定') {
      html += `<button class="btn btn-sm" onclick="finishMTG('${mtg.id}')">✓ MTGを終了にする</button>`;
      if (isCreator) {
        html += `<button class="btn btn-sm btn-danger" onclick="cancelMTG('${mtg.id}')">このMTGをキャンセル</button>`;
      }
    }
    if (mtg.status === '調整中') {
      html += `<button class="btn btn-sm btn-danger" onclick="deleteMTGItem('${mtg.id}')">このMTGを削除</button>`;
    }
    html += '</div>';
  }

  el.innerHTML = html;
}

// 回答送信
async function submitMTGResponse(mtgId) {
  const form = document.getElementById('mtg-response-form');
  const isFixedType = form?.dataset.mtgType === '確定型';
  let selectedIds;
  if (isFixedType) {
    const checkedRadio = form.querySelector('input[name="mtg-attend"]:checked');
    if (!checkedRadio) { showFlash('mtg-response-msg','「参加する」「参加しない」のいずれかを選んでください',false); return; }
    const candidateId = form.dataset.candidateId;
    selectedIds = checkedRadio.value === 'yes' && candidateId ? [candidateId] : [];
  } else {
    const checkboxes = document.querySelectorAll('#mtg-response-form input[type="checkbox"]:checked');
    selectedIds = Array.from(checkboxes).map(cb => cb.value);
  }
  const myEmail = window._currentUser?.email || '';
  const myName = window._currentUser?.name || myEmail;
  const emailKey = escapeEmail(myEmail);

  // 候補一覧と自分の既存回答（前回選択した候補のgcalEventId）を取得
  const mtg = await window.fetchMTG(mtgId);
  if (!mtg) { showFlash('mtg-response-msg','MTGの取得に失敗しました',false); return; }
  const prevResponse = mtg.responses?.[emailKey] || mtg.responses?.[myEmail] || {};
  const prevSelected = prevResponse.candidates || [];
  const prevEventIds = prevResponse.gcalEventIds || {};

  // 選択した候補＝自分の可能日時 → 自分のGoogleカレンダーに仮登録／解除した候補は削除
  const newEventIds = {};
  if (window._gcalToken) {
    for (const c of (mtg.candidates || [])) {
      const wasSelected = prevSelected.includes(c.id);
      const isSelected = selectedIds.includes(c.id);
      if (isSelected && wasSelected) {
        if (prevEventIds[c.id]) newEventIds[c.id] = prevEventIds[c.id];
      } else if (isSelected && !wasSelected) {
        try {
          const eventId = await addMTGCandidateToGcal(c, mtg.title, mtg.duration, mtg.shiftType);
          if (eventId) newEventIds[c.id] = eventId;
        } catch(e) { console.warn('候補の仮登録に失敗', e); }
      } else if (!isSelected && wasSelected && prevEventIds[c.id]) {
        try { await deleteFromGcal(prevEventIds[c.id]); } catch(e) { console.warn('候補の仮登録解除に失敗', e); }
      }
    }
  }

  const updateData = {};
  updateData[`responses.${emailKey}`] = {
    name: myName, email: myEmail, candidates: selectedIds,
    answeredAt: Date.now(), gcalEventIds: newEventIds
  };
  const ok = await window.updateMTG(mtgId, updateData);
  if (ok) {
    showFlash('mtg-response-msg','回答を送信しました',true);
    // 回答済みになったので未回答リマインダーから即座に除外
    window._mtgUnanswered = (window._mtgUnanswered||[]).filter(m => m.id !== mtgId);
    renderMTGReminderUI();
    setTimeout(async () => {
      const mtg = await window.fetchMTG(mtgId);
      if (mtg) renderMTGDetail(mtg);
    }, 800);
  } else {
    showFlash('mtg-response-msg','送信に失敗しました',false);
  }
}

// MTG確定
async function confirmMTG(mtgId, candidateId) {
  if (!confirm('この日程でMTGを確定しますか？\n確定後は他の候補枠がGoogleカレンダーから削除されます。')) return;
  const mtg = await window.fetchMTG(mtgId);
  if (!mtg) return;
  const confirmedCandidate = mtg.candidates.find(c => c.id === candidateId);
  if (!confirmedCandidate) return;

  // 確定しなかった候補をGoogleカレンダーから削除
  if (window._gcalToken) {
    for (const c of mtg.candidates) {
      if (c.id !== candidateId && c.gcalEventId) {
        await deleteFromGcal(c.gcalEventId);
      }
    }
    // 確定候補のカレンダーイベントを「確定」に更新
    if (confirmedCandidate.gcalEventId) {
      try {
        await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${confirmedCandidate.gcalEventId}`, {
          method:'PATCH',
          headers:{'Authorization':'Bearer '+window._gcalToken,'Content-Type':'application/json'},
          body:JSON.stringify({ summary:`【${mtgCalLabel(mtg.shiftType)}確定】${mtg.title}`, colorId:'10' })
        });
      } catch(e) {}
    }
  }

  const shiftDate = confirmedCandidate.date;
  const shiftStart = confirmedCandidate.start;
  const shiftEnd = confirmedCandidate.end || (() => {
    const [h,m] = shiftStart.split(':').map(Number);
    const totalMin = h*60+m+mtg.duration;
    return `${String(Math.floor(totalMin/60)).padStart(2,'0')}:${String(totalMin%60).padStart(2,'0')}`;
  })();

  // 自分（作成者）のシフトに追加
  const myEmail = window._currentUser?.email || '';
  if (mtg.createdBy === myEmail) {
    const newShift = {
      id: Date.now()+Math.random(), type: mtg.shiftType || 'mtg', mtgId: mtgId,
      date:shiftDate, start:shiftStart, end:shiftEnd,
      memo:mtg.title, closed:false, gcalEventId:confirmedCandidate.gcalEventId||null
    };
    shifts.push(newShift);
    save();
    renderShifts();renderMetrics();renderHome();
  }

  // Firestoreに確定情報を保存
  // confirmedShiftInfoに確定日程情報を保存→招待者が次回ログイン時に自動取得
  await window.updateMTG(mtgId, {
    status: '確定',
    confirmedCandidate: candidateId,
    confirmedShift: {
      date: shiftDate, start: shiftStart, end: shiftEnd,
      title: mtg.title, type: mtg.shiftType || 'mtg'
    }
  });

  alert('MTGを確定しました！\n' + shiftDate + ' ' + shiftStart + '〜' + shiftEnd + '\n\n招待メンバーが次回アプリを開いた際にシフトに自動追加されます。');
  const updatedMTG = await window.fetchMTG(mtgId);
  if (updatedMTG) renderMTGDetail(updatedMTG);
}


// MTGキャンセル（主催者のみ）
async function cancelMTG(mtgId) {
  if (!confirm('このMTGをキャンセルしますか？\n確定済みのGoogleカレンダーイベントが削除され、参加者のシフトからも削除されます。')) return;
  const mtg = await window.fetchMTG(mtgId);
  if (!mtg) return;

  // 確定候補のGoogleカレンダーイベントを削除
  if (window._gcalToken) {
    const confirmed = (mtg.candidates||[]).find(c => c.id === mtg.confirmedCandidate);
    if (confirmed?.gcalEventId) {
      await deleteFromGcal(confirmed.gcalEventId);
    }
  }

  // Firestoreをキャンセル状態に更新
  await window.updateMTG(mtgId, { status: 'キャンセル', cancelledAt: Date.now() });

  // 自分（主催者）のシフトから削除
  const s = mtg.confirmedShift;
  if (s) {
    const idx = shifts.findIndex(sh =>
      sh.mtgId ? sh.mtgId === mtgId
        : (sh.date === s.date && sh.start === s.start && sh.memo === s.title && sh.type === (s.type || 'mtg'))
    );
    if (idx !== -1) {
      const gcalId = shifts[idx].gcalEventId;
      if (gcalId && window._gcalToken) deleteFromGcal(gcalId);
      shifts.splice(idx, 1);
      save();
      renderShifts();renderMetrics();renderHome();
    }
  }

  alert('MTGをキャンセルしました。\n招待メンバーが次回アプリを開いた際にシフトから自動削除されます。');
  const updatedMTG = await window.fetchMTG(mtgId);
  if (updatedMTG) renderMTGDetail(updatedMTG);
}

// MTG終了
async function finishMTG(mtgId) {
  if (!confirm('このMTGを終了済みにしますか？')) return;
  const ok = await window.updateMTG(mtgId, { status: '終了' });
  if (ok) {
    const mtg = await window.fetchMTG(mtgId);
    if (mtg) renderMTGDetail(mtg);
  } else {
    alert('更新に失敗しました');
  }
}

// MTG削除
async function deleteMTGItem(mtgId) {
  if (!confirm('このMTGを削除しますか？\nGoogleカレンダーの候補枠も削除されます。')) return;
  const mtg = await window.fetchMTG(mtgId);
  if (mtg && window._gcalToken) {
    for (const c of mtg.candidates||[]) {
      if (c.gcalEventId) await deleteFromGcal(c.gcalEventId);
    }
  }
  await window.deleteMTG(mtgId);
  hideMTGDetail();
}

// ROLES定義（JS側でも使用）
const ROLES = window.ROLES || {
  admin:{label:'管理者'}, operator:{label:'オペレーター'},
  ul:{label:'ユニットリーダー'}, sub_ul:{label:'準ユニットリーダー'},
  instructor:{label:'講師'}, trainee:{label:'研修中'}
};


// 確定MTGのシフト自動追加・キャンセル時の自動削除チェック（ログイン時に実行）
// 未回答MTG（招待されていて調整中・自分がまだ回答していない）を集計
window._mtgUnanswered = [];
async function computeMTGReminders(mtgListParam) {
  const myEmail = window._currentUser?.email || '';
  if (!myEmail || !window.fetchMTGList) { window._mtgUnanswered = []; renderMTGReminderUI(); return []; }
  const mtgList = mtgListParam || await window.fetchMTGList();
  const emailKey = escapeEmail(myEmail);
  window._mtgUnanswered = mtgList.filter(mtg => {
    if (mtg.status !== '調整中') return false;
    if (!(mtg.invitees||[]).includes(myEmail)) return false;
    const myResp = mtg.responses?.[emailKey] || mtg.responses?.[myEmail];
    return !myResp;
  });
  renderMTGReminderUI();
  return mtgList;
}

// 未回答MTGの通知表示（タブバッジ・MTGタブ内バナー・ホーム画面バナー）を更新
function renderMTGReminderUI() {
  const list = window._mtgUnanswered || [];
  const count = list.length;

  const badge = document.getElementById('mtg-tab-badge');
  if (badge) {
    badge.textContent = count > 9 ? '9+' : String(count);
    badge.style.display = count > 0 ? '' : 'none';
  }

  const mtgBanner = document.getElementById('mtg-invite-banner');
  if (mtgBanner) {
    if (count > 0) {
      mtgBanner.style.display = '';
      mtgBanner.innerHTML = `
        <div style="background:var(--warning-bg);color:var(--warning-text);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:12px;font-size:13px">
          <div>📨 招待が届いています（回答待ち ${count}件）</div>
          <div style="margin-top:6px;display:flex;flex-direction:column;gap:4px">
            ${list.map(m => `<div style="cursor:pointer;text-decoration:underline" onclick="showMTGDetail('${m.id}')">・${m.title}</div>`).join('')}
          </div>
        </div>`;
    } else {
      mtgBanner.style.display = 'none';
      mtgBanner.innerHTML = '';
    }
  }

  const homeBanner = document.getElementById('home-mtg-reminder');
  if (homeBanner) {
    if (count > 0) {
      homeBanner.style.display = '';
      homeBanner.innerHTML = `
        <div class="card" style="cursor:pointer;border-color:var(--warning-text);background:var(--warning-bg);padding:12px 16px" onclick="switchTab('mtg')">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
            <div style="font-size:14px;font-weight:500;color:var(--warning-text)">📨 未回答のMTGが${count}件あります。今すぐ回答しましょう</div>
            <span style="font-size:12px;color:var(--warning-text);white-space:nowrap">回答する ›</span>
          </div>
        </div>`;
    } else {
      homeBanner.style.display = 'none';
      homeBanner.innerHTML = '';
    }
  }
}

let _mtgSyncInProgress = false;
async function checkConfirmedMTGShifts() {
  if (!window.fetchMTGList) return;
  const myEmail = window._currentUser?.email || '';
  if (!myEmail) return;
  if (_mtgSyncInProgress) return; // onSnapshotの多重発火による重複実行を防止
  _mtgSyncInProgress = true;
  try {
    const mtgList = await computeMTGReminders();
    let changed = 0;

    // 既存のMTG由来シフト（mtgId未記録の古いデータ）に、内容が一致する確定MTGのIDを自動で後付けする
    // （以前は日付・時刻・タイトルの内容一致だけでシフトとMTGを紐付けていたため、同名・同日時の
    //  MTGが複数あると誤って別のMTGのシフトを操作してしまう不具合があった。ここで一度だけ補完しておくことで、
    //  以降はこのシフトもID一致で確実に判定できるようになる）
    let backfilled = false;
    shifts.forEach(sh => {
      if (sh.mtgId || !sh.date || !sh.start || !sh.memo) return;
      const match = mtgList.find(m =>
        m.status === '確定' && m.confirmedShift &&
        m.confirmedShift.date === sh.date && m.confirmedShift.start === sh.start &&
        m.confirmedShift.title === sh.memo && (m.confirmedShift.type || 'mtg') === sh.type &&
        (m.createdBy === myEmail || (m.invitees||[]).includes(myEmail))
      );
      if (match) { sh.mtgId = match.id; backfilled = true; }
    });
    if (backfilled) { save(); }

    for (const mtg of mtgList) {
      const isInvited = (mtg.invitees||[]).includes(myEmail);
      const isCreator = mtg.createdBy === myEmail;
      if (!isInvited && !isCreator) continue;
      const s = mtg.confirmedShift;
      if (!s) continue;

      const emailKey = escapeEmail(myEmail);
      const myResponse = mtg.responses?.[emailKey] || mtg.responses?.[myEmail] || null;
      const myEventIds = myResponse?.gcalEventIds || {};
      const hasPendingCleanup = Object.keys(myEventIds).length > 0;

      if (mtg.status === '確定' && isInvited && !isCreator) {
        // 確定した日時が自分の回答した「参加可能」候補に含まれているかどうか
        const iAmAttending = !!(myResponse && (myResponse.candidates||[]).includes(mtg.confirmedCandidate));

        if (iAmAttending) {
          // 参加する場合のみシフトに追加
          const alreadyAdded = shifts.some(sh =>
            sh.mtgId ? sh.mtgId === mtg.id
              : (sh.date === s.date && sh.start === s.start && sh.memo === s.title && sh.type === (s.type || 'mtg'))
          );
          if (!alreadyAdded) {
            let gcalEventId = myEventIds[mtg.confirmedCandidate] || null;
            if (window._gcalToken) {
              try {
                if (gcalEventId) {
                  // 自分が回答時に仮登録していたイベントを「確定」表記に更新
                  await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${gcalEventId}`, {
                    method:'PATCH',
                    headers:{'Authorization':'Bearer '+window._gcalToken,'Content-Type':'application/json'},
                    body:JSON.stringify({ summary:`【${mtgCalLabel(s.type)}確定】${s.title}`, colorId:'10' })
                  });
                } else {
                  // 仮登録が無かった場合のフォールバックとして新規作成
                  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                    method:'POST',
                    headers:{'Authorization':'Bearer '+window._gcalToken,'Content-Type':'application/json'},
                    body:JSON.stringify({
                      summary:`【${mtgCalLabel(s.type)}確定】${s.title}`,
                      start:{dateTime:`${s.date}T${s.start}:00`,timeZone:'Asia/Tokyo'},
                      end:{dateTime:`${s.date}T${s.end}:00`,timeZone:'Asia/Tokyo'},
                      colorId:'10',
                      reminders:{useDefault:false,overrides:[{method:'popup',minutes:10}]}
                    })
                  });
                  const data = await res.json();
                  gcalEventId = data.id || null;
                }
              } catch(e) { console.warn('MTG確定イベントの更新に失敗', e); }
            }
            shifts.push({
              id:Date.now()+Math.random(), type: s.type || 'mtg', mtgId: mtg.id,
              date:s.date, start:s.start, end:s.end,
              memo:s.title, closed:false, gcalEventId
            });
            changed++;
          }
          // 確定しなかった他の候補の仮登録を自分のカレンダーから削除
          if (window._gcalToken) {
            for (const [cid, eid] of Object.entries(myEventIds)) {
              if (cid !== mtg.confirmedCandidate && eid) {
                try { await deleteFromGcal(eid); } catch(e) {}
              }
            }
          }
          if (hasPendingCleanup) {
            await window.updateMTG(mtg.id, { [`responses.${emailKey}.gcalEventIds`]: { [mtg.confirmedCandidate]: myEventIds[mtg.confirmedCandidate] || null } });
          }
        } else if (hasPendingCleanup) {
          // 不参加になった場合：シフトには登録せず、自分が仮登録した候補をすべて片付ける
          if (window._gcalToken) {
            for (const eid of Object.values(myEventIds)) {
              if (eid) { try { await deleteFromGcal(eid); } catch(e) {} }
            }
          }
          await window.updateMTG(mtg.id, { [`responses.${emailKey}.gcalEventIds`]: {} });
        }
      } else if (mtg.status === 'キャンセル') {
        // キャンセルされたMTGをシフトから削除
        const idx = shifts.findIndex(sh =>
          sh.mtgId ? sh.mtgId === mtg.id
            : (sh.date === s.date && sh.start === s.start && sh.memo === s.title && sh.type === (s.type || 'mtg'))
        );
        if (idx !== -1) {
          const gcalId = shifts[idx].gcalEventId;
          if (gcalId && window._gcalToken) { try { await deleteFromGcal(gcalId); } catch(e) {} }
          shifts.splice(idx, 1);
          changed++;
        }
        // 自分が仮登録していた候補もすべて片付ける
        if (hasPendingCleanup) {
          if (window._gcalToken) {
            for (const eid of Object.values(myEventIds)) {
              if (eid) { try { await deleteFromGcal(eid); } catch(e) {} }
            }
          }
          await window.updateMTG(mtg.id, { [`responses.${emailKey}.gcalEventIds`]: {} });
        }
      }
    }

    if (changed > 0) {
      save();
      renderShifts();renderMetrics();renderHome();
    }
  } catch(e) { console.warn('checkConfirmedMTGShifts error', e); }
  finally { _mtgSyncInProgress = false; }
}

async function loadQAFromFirebase() {
  if(typeof window.fetchQAList !== 'function') return;
  const fbQA = await window.fetchQAList();
  if(fbQA.length) {
    // FirebaseのQ&AをマージしてデフォルトQ&Aより優先
    const fbKeywords = fbQA.flatMap(q=>q.keywords);
    const filteredDefault = qaList.filter(q=>!q.keywords.some(k=>fbKeywords.includes(k)));
    qaList = [...fbQA, ...filteredDefault];
  }
}

async function renderQAList() {
  const el=document.getElementById('qa-list');
  if(!el)return;
  el.innerHTML='<p style="font-size:13px;color:var(--text2)">読み込み中...</p>';
  await loadQAFromFirebase();
  const myRole=window._currentUser?.role||'';
  const canEdit=['admin','operator','ul'].includes(myRole);
  const addBtn=document.getElementById('qa-add-btn');
  if(addBtn)addBtn.style.display=canEdit?'':'none';
  if(!qaList.length){el.innerHTML='<p style="font-size:13px;color:var(--text2)">Q&Aがありません</p>';return;}
  el.innerHTML=qaList.map((qa,i)=>{
    const isFirebase=!!qa.id;
    return`<div style="padding:10px 0;border-bottom:.5px solid var(--border)">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:13px;font-weight:500">🔑 ${qa.keywords.join('・')}</span>
            ${isFirebase?'<span style="font-size:10px;padding:1px 6px;border-radius:20px;background:var(--success-bg);color:var(--success-text)">Firebase</span>':'<span style="font-size:10px;padding:1px 6px;border-radius:20px;background:var(--bg3);color:var(--text3)">デフォルト</span>'}
          </div>
          <div style="font-size:12px;color:var(--text2);line-height:1.6">${qa.answer}</div>
        </div>
        ${canEdit&&isFirebase?`<div style="display:flex;gap:4px;flex-shrink:0">
          <button class="btn btn-sm btn-edit" onclick="openEditQAModal(${i})">編集</button>
          <button class="btn btn-sm btn-danger" onclick="deleteQA(${i})">削除</button>
        </div>`:''}
      </div>
    </div>`;
  }).join('');
}

function openAddQAModal() {
  const myRole=window._currentUser?.role||'';
  if(!['admin','operator','ul'].includes(myRole)){alert('Q&Aを追加する権限がありません');return;}
  document.getElementById('qa-modal-title').textContent='Q&Aを追加';
  document.getElementById('qa-edit-index').value='';
  document.getElementById('qa-edit-id').value='';
  document.getElementById('qa-keywords').value='';
  document.getElementById('qa-answer').value='';
  document.getElementById('qa-msg').className='flash';
  document.getElementById('qa-modal').classList.add('open');
}
function openEditQAModal(i) {
  const myRole=window._currentUser?.role||'';
  if(!['admin','operator','ul'].includes(myRole)){alert('Q&Aを編集する権限がありません');return;}
  const qa=qaList[i];
  document.getElementById('qa-modal-title').textContent='Q&Aを編集';
  document.getElementById('qa-edit-index').value=i;
  document.getElementById('qa-edit-id').value=qa.id||'';
  document.getElementById('qa-keywords').value=qa.keywords.join(',');
  document.getElementById('qa-answer').value=qa.answer;
  document.getElementById('qa-msg').className='flash';
  document.getElementById('qa-modal').classList.add('open');
}
function closeQAModal(){document.getElementById('qa-modal').classList.remove('open');}
async function submitQA(){
  const idx=document.getElementById('qa-edit-index').value;
  const id=document.getElementById('qa-edit-id').value;
  const keywordsRaw=document.getElementById('qa-keywords').value.trim();
  const answer=document.getElementById('qa-answer').value.trim();
  if(!keywordsRaw||!answer){showFlash('qa-msg','キーワードと回答を入力してください',false);return;}
  const keywords=keywordsRaw.split(',').map(k=>k.trim()).filter(Boolean);
  let ok=false;
  if(id){
    ok=await window.updateQAItem(id,keywords,answer);
  }else{
    ok=await window.addQAItem(keywords,answer);
  }
  if(ok){
    showFlash('qa-msg','保存しました',true);
    setTimeout(()=>{closeQAModal();renderQAList();},800);
  }else{
    showFlash('qa-msg','保存に失敗しました',false);
  }
}
async function deleteQA(i){
  const qa=qaList[i];
  if(!qa.id){alert('デフォルトQ&Aは削除できません');return;}
  if(!confirm('このQ&Aを削除しますか？'))return;
  const ok=await window.deleteQAItem(qa.id);
  if(ok)renderQAList();
  else alert('削除に失敗しました');
}

// ── チャットボットのカテゴリボタン（シフト→登録したい、のようなツリー）管理 ──
let chatCatList = [
  { category:'📅 シフト', subcategory:'登録したい', answer:'シフトタブから業務種別・日付・時刻を入力して「＋追加」をタップします。ホーム画面から「＋この日にシフトを追加」でも登録できます。' },
  { category:'📅 シフト', subcategory:'編集・変更したい', answer:'講師外業務（研修・開発・MTG・SNS）はシフト一覧の「編集」ボタンから変更できます。Googleカレンダーも自動更新されます。' },
  { category:'📅 シフト', subcategory:'削除したい', answer:'シフト一覧の「削除」ボタンをタップします。Googleカレンダーのイベントも自動削除されます。' },
  { category:'📅 シフト', subcategory:'一括登録したい', answer:'一括タブから年月・時刻を入力し、週と曜日を選んで「一括登録する」をタップします。5週目がない月は自動スキップされます。' },
  { category:'📅 シフト', subcategory:'生徒が来なかった（クローズ）', answer:'生徒が来なかった場合はシフト一覧の「クローズ」ボタンをタップしてください。その授業はその他MTG 15分として自動計算され、請求書にも「授業クローズ 15分」として記載されます。間違えた場合は「解除」で元に戻せます。' },
  { category:'📅 シフト', subcategory:'日またぎシフト', answer:'終了時刻が開始より早い場合（例：23:00〜03:00）、追加ボタンを押すと確認ポップアップが出ます。OKで翌日として正しく計算・カレンダー登録されます。' },
  { category:'📄 請求書', subcategory:'作り方・生成方法', answer:'請求書タブで対象月を選んで「生成」→「コピー」をタップします。テキストがクリップボードにコピーされます。' },
  { category:'📄 請求書', subcategory:'通常クラスを含めたい', answer:'「通常クラスも含める」チェックボックスをONにすると「講師業務通常」セクションが追加されます。デフォルトはOFFです。' },
  { category:'📄 請求書', subcategory:'何が掲載される？', answer:'キャンプクラス・研修業務・教材開発・その他MTG・SNSマーケティング・授業クローズが含まれます。通常クラスはデフォルト非掲載です。' },
  { category:'💰 収支', subcategory:'振込額の入力方法', answer:'収支タブの月別詳細で各月の入力欄に振り込まれた金額を入力してください。自動保存されます。' },
  { category:'💰 収支', subcategory:'年間目標の設定', answer:'収支タブの「年間目標額」欄に目標金額を入力すると達成率バーが表示されます。' },
  { category:'💰 収支', subcategory:'集計期間について', answer:'給与は翌月25日払いのため、集計期間は前年12月〜当年11月の労働分に対応しています。' },
  { category:'⚙️ 設定', subcategory:'時給・単価の変更', answer:'設定タブから各業務の時給・コマ単価を変更できます。変更後は自動保存されます。' },
  { category:'⚙️ 設定', subcategory:'昇給があった場合', answer:'設定タブの「期間別時給履歴」に開始月と新単価を登録すると、過去の月にも正しい金額が適用されます。' },
  { category:'⚙️ 設定', subcategory:'データのバックアップ', answer:'設定タブの「エクスポート」でJSONファイルとして保存できます。機種変更時は「インポート」で復元できます。' },
  { category:'🔐 ログイン', subcategory:'ログインできない', answer:'Googleアカウントがアプリに登録されているか確認してください。未登録の場合は管理者にお問い合わせください。' },
  { category:'🔐 ログイン', subcategory:'セッションについて', answer:'セッションは約1時間で自動終了します。残り5分で画面上部に警告が表示されます。終了後はログイン画面に移動しますが、データは保持されています。' },
  { category:'🔐 ログイン', subcategory:'別端末で使いたい', answer:'同じGoogleアカウントでログインすれば、どの端末からでもデータが同期されます。' },
];

async function loadChatCatFromFirebase() {
  if(typeof window.fetchChatCategories !== 'function') return;
  const fbCats = await window.fetchChatCategories();
  if(fbCats.length) {
    const fbKeys = fbCats.map(c=>c.category+'::'+c.subcategory);
    const filteredDefault = chatCatList.filter(c=>!fbKeys.includes(c.category+'::'+c.subcategory));
    chatCatList = [...fbCats, ...filteredDefault];
  }
}

async function renderChatCatList() {
  const el=document.getElementById('chat-cat-list');
  if(!el)return;
  el.innerHTML='<p style="font-size:13px;color:var(--text2)">読み込み中...</p>';
  await loadChatCatFromFirebase();
  const myRole=window._currentUser?.role||'';
  const canEdit=['admin','operator','ul'].includes(myRole);
  const addBtn=document.getElementById('chat-cat-add-btn');
  if(addBtn)addBtn.style.display=canEdit?'':'none';
  if(!chatCatList.length){el.innerHTML='<p style="font-size:13px;color:var(--text2)">カテゴリボタンがありません</p>';return;}
  el.innerHTML=chatCatList.map((c,i)=>{
    const isFirebase=!!c.id;
    return`<div style="padding:10px 0;border-bottom:.5px solid var(--border)">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
            <span style="font-size:13px;font-weight:500">${c.category} → ${c.subcategory}</span>
            ${isFirebase?'<span style="font-size:10px;padding:1px 6px;border-radius:20px;background:var(--success-bg);color:var(--success-text)">Firebase</span>':'<span style="font-size:10px;padding:1px 6px;border-radius:20px;background:var(--bg3);color:var(--text3)">デフォルト</span>'}
          </div>
          <div style="font-size:12px;color:var(--text2);line-height:1.6">${c.answer}</div>
        </div>
        ${canEdit&&isFirebase?`<div style="display:flex;gap:4px;flex-shrink:0">
          <button class="btn btn-sm btn-edit" onclick="openEditChatCatModal(${i})">編集</button>
          <button class="btn btn-sm btn-danger" onclick="deleteChatCat(${i})">削除</button>
        </div>`:''}
      </div>
    </div>`;
  }).join('');
}

function openAddChatCatModal() {
  const myRole=window._currentUser?.role||'';
  if(!['admin','operator','ul'].includes(myRole)){alert('カテゴリボタンを追加する権限がありません');return;}
  document.getElementById('chat-cat-modal-title').textContent='カテゴリボタンを追加';
  document.getElementById('chat-cat-edit-index').value='';
  document.getElementById('chat-cat-edit-id').value='';
  document.getElementById('chat-cat-category').value='';
  document.getElementById('chat-cat-subcategory').value='';
  document.getElementById('chat-cat-answer').value='';
  document.getElementById('chat-cat-msg').className='flash';
  document.getElementById('chat-cat-modal').classList.add('open');
}
function openEditChatCatModal(i) {
  const myRole=window._currentUser?.role||'';
  if(!['admin','operator','ul'].includes(myRole)){alert('カテゴリボタンを編集する権限がありません');return;}
  const c=chatCatList[i];
  document.getElementById('chat-cat-modal-title').textContent='カテゴリボタンを編集';
  document.getElementById('chat-cat-edit-index').value=i;
  document.getElementById('chat-cat-edit-id').value=c.id||'';
  document.getElementById('chat-cat-category').value=c.category;
  document.getElementById('chat-cat-subcategory').value=c.subcategory;
  document.getElementById('chat-cat-answer').value=c.answer;
  document.getElementById('chat-cat-msg').className='flash';
  document.getElementById('chat-cat-modal').classList.add('open');
}
function closeChatCatModal(){document.getElementById('chat-cat-modal').classList.remove('open');}
async function submitChatCat(){
  const id=document.getElementById('chat-cat-edit-id').value;
  const category=document.getElementById('chat-cat-category').value.trim();
  const subcategory=document.getElementById('chat-cat-subcategory').value.trim();
  const answer=document.getElementById('chat-cat-answer').value.trim();
  if(!category||!subcategory||!answer){showFlash('chat-cat-msg','カテゴリ・サブカテゴリ・回答をすべて入力してください',false);return;}
  let ok=false;
  if(id){
    ok=await window.updateChatCategoryItem(id,category,subcategory,answer);
  }else{
    ok=await window.addChatCategoryItem(category,subcategory,answer);
  }
  if(ok){
    showFlash('chat-cat-msg','保存しました',true);
    setTimeout(()=>{closeChatCatModal();renderChatCatList();},800);
  }else{
    showFlash('chat-cat-msg','保存に失敗しました',false);
  }
}
async function deleteChatCat(i){
  const c=chatCatList[i];
  if(!c.id){alert('デフォルトのカテゴリボタンは削除できません');return;}
  if(!confirm('このカテゴリボタンを削除しますか？'))return;
  const ok=await window.deleteChatCategoryItem(c.id);
  if(ok)renderChatCatList();
  else alert('削除に失敗しました');
}

// ── チャットボット ──
let qaList = [
  { keywords:['請求書','作り方','生成','コピー'], answer:'請求書タブから対象月を選んで「生成」をタップするとテキストが自動作成されます。「コピー」で内容をコピーできます。通常クラスを含めるかどうかはチェックボックスで選択できます。' },
  { keywords:['シフト','登録','追加','入力'], answer:'シフトタブから業務種別・日付・開始〜終了時刻を入力して「＋追加」をタップします。ホーム画面の「＋この日にシフトを追加」からも登録できます。' },
  { keywords:['一括','まとめて','月別'], answer:'一括タブから対象年月・時刻を入力し、週と曜日を選んで「一括登録する」をタップします。5週目が存在しない月は自動スキップされます。' },
  { keywords:['クローズ','閉じ','来なかった','生徒'], answer:'シフト一覧の授業の「クローズ」ボタンをタップすると、その他MTG 15分として自動計算されます。間違えた場合は「解除」で戻せます。' },
  { keywords:['カレンダー','google','同期','連携'], answer:'Googleアカウントでログインするとシフト追加時に自動でGoogleカレンダーに登録されます。授業は15分前、講師外業務は10分前に通知が届きます。' },
  { keywords:['ログイン','サインイン','ログアウト','セッション'], answer:'セッションは約1時間で自動終了します。ログアウトは設定タブから行えます。再ログイン後もデータは保持されています。' },
  { keywords:['収支','年間','目標','振込'], answer:'収支タブで年間の収支を管理できます。給与は翌月25日払いのため、集計期間は前年12月〜当年11月です。各月の振込額を手動で入力してください。' },
  { keywords:['時給','単価','設定','変更'], answer:'設定タブから各業務の時給・コマ単価を変更できます。昇給があった場合は「期間別時給履歴」に登録すると過去の月にも正しい金額が適用されます。' },
  { keywords:['データ','消えた','バックアップ','引き継ぎ'], answer:'設定タブの「エクスポート」でデータをJSONファイルとして保存できます。同じGoogleアカウントで再ログインするとクラウドから復元されます。' },
  { keywords:['編集','修正','変更','時間'], answer:'講師外業務（研修・開発・MTG・SNS）はシフト一覧の「編集」ボタンから時間・メモを変更できます。変更するとGoogleカレンダーも自動更新されます。' },
];


// 時刻入力の自動フォーマット（例：1800 → 18:00）
function initTimeInputs() {
  // (flatpickrへの置き換えを試みたが元に戻した。現在は特に処理なし)
}

function init(){
  loadLocal();
  document.getElementById('new-date').value=toLocalDateStr(new Date());
  const now=new Date();
  document.getElementById('bulk-month').value=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  ALL_RATE_KEYS.forEach(k=>{const el=document.getElementById('rate-'+k);if(el)el.value=rates[k]||'';});
  renderAll();buildWeekGrid();
  initTimeInputs();
}
init();

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').then(reg=>{
    reg.addEventListener('updatefound',()=>{
      const nw=reg.installing;
      nw.addEventListener('statechange',()=>{
        if(nw.state==='installed'&&navigator.serviceWorker.controller)
          document.getElementById('update-banner').style.display='flex';
      });
    });
  });
}

// Vite移行時の後方互換: HTMLのonclick属性やモジュール間の呼び出しから使えるようwindowに公開
Object.assign(window, {
  addMTGCandidate, addMTGCandidateToGcal, addRateHistory, addShift, addShiftFromHome, autoCalcMTGEnd, buildWeekGrid,
  calNextMonth, calPrevMonth, calcMonthPay, cancelMTG, changeMonth, changeYear, checkConfirmedMTGShifts, checkConflicts,
  clearAll, closeAddPendingModal, closeAddUserModal, closeChatCatModal, closeEditModal, closeEditRoleModal, closeQAModal, closeUpdateInfoModal, computeMTGReminders, confirmMTG, copyInvoice, gotoStaffEvaluation,
  deleteChatCat, openAddChatCatModal, openAddPendingModal, openEditChatCatModal, openUpdateInfoModal, renderChatCatList, setMTGCandidateField, submitAddPending, submitChatCat,
  currentFavoriteTabs, deleteFromGcal, deleteMTGItem, deleteQA, deleteRateHistory, deleteShift, deleteUser, durationH,
  escapeEmail, executeBulk, exportData, finishMTG, formatTimeInput, generateInvoice, getConflictIds,
  getEditableRoles, getNthWeekday, getRatesForMonth, handleImport, hideMTGCreateForm, hideMTGDetail, homeNextDay, homePrevDay,
  importData, init, initFavTabsSortable, initTimeInputs, loadLocal, loadMTGList, loadQAFromFirebase,
  mtgCalLabel, onMTGTypeChange, openAddQAModal, openAddUserModal, openEditModal, openEditQAModal, openEditRoleModal, populateMTGPersonFilter,
  removeMTGCandidate, renderAdminUserList, renderAll, renderAnnual, renderHome, renderHomeShifts,
  renderMTGCandidates, renderMTGDetail, renderMTGInvitees, renderMTGReminderUI, renderMTGTab, renderMetrics, renderMiniCal, renderQAList,
  renderRateHistory, renderShifts, save, saveEdit, saveGoal, saveLocal, savePayment, saveRates,
  setMTGFilter, setMTGPersonFilter, showFlash, showMTGCreateForm, showMTGDetail, showMTGMainView, submitAddUser,
  submitCreateMTG, submitEditRole, submitMTGResponse, submitQA, switchTab, syncToGcal, tabMenuListHTML, toLocalDateStr,
  toMonthStr, toggleClose, toggleHomeAddForm, toggleMTGInvitee, unescapeEmail, visibleTabRegistry,
});
