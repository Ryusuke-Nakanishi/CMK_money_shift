import React from 'react';
import ReactDOM from 'react-dom/client';

const DEFAULT_CHAT_TREE = {
  '📅 シフト': {
    '登録したい': 'シフトタブから業務種別・日付・時刻を入力して「＋追加」をタップします。ホーム画面から「＋この日にシフトを追加」でも登録できます。',
    '編集・変更したい': '講師外業務（研修・開発・MTG・SNS）はシフト一覧の「編集」ボタンから変更できます。Googleカレンダーも自動更新されます。',
    '削除したい': 'シフト一覧の「削除」ボタンをタップします。Googleカレンダーのイベントも自動削除されます。',
    '一括登録したい': '一括タブから年月・時刻を入力し、週と曜日を選んで「一括登録する」をタップします。5週目がない月は自動スキップされます。',
    '生徒が来なかった（クローズ）': '生徒が来なかった場合はシフト一覧の「クローズ」ボタンをタップしてください。その授業はその他MTG 15分として自動計算され、請求書にも「授業クローズ 15分」として記載されます。間違えた場合は「解除」で元に戻せます。',
    '日またぎシフト': '終了時刻が開始より早い場合（例：23:00〜03:00）、追加ボタンを押すと確認ポップアップが出ます。OKで翌日として正しく計算・カレンダー登録されます。',
  },
  '📄 請求書': {
    '作り方・生成方法': '請求書タブで対象月を選んで「生成」→「コピー」をタップします。テキストがクリップボードにコピーされます。',
    '通常クラスを含めたい': '「通常クラスも含める」チェックボックスをONにすると「講師業務通常」セクションが追加されます。デフォルトはOFFです。',
    '何が掲載される？': 'キャンプクラス・研修業務・教材開発・その他MTG・SNSマーケティング・授業クローズが含まれます。通常クラスはデフォルト非掲載です。',
  },
  '💰 収支': {
    '振込額の入力方法': '収支タブの月別詳細で各月の入力欄に振り込まれた金額を入力してください。自動保存されます。',
    '年間目標の設定': '収支タブの「年間目標額」欄に目標金額を入力すると達成率バーが表示されます。',
    '集計期間について': '給与は翌月25日払いのため、集計期間は前年12月〜当年11月の労働分に対応しています。',
  },
  '⚙️ 設定': {
    '時給・単価の変更': '設定タブから各業務の時給・コマ単価を変更できます。変更後は自動保存されます。',
    '昇給があった場合': '設定タブの「期間別時給履歴」に開始月と新単価を登録すると、過去の月にも正しい金額が適用されます。',
    'データのバックアップ': '設定タブの「エクスポート」でJSONファイルとして保存できます。機種変更時は「インポート」で復元できます。',
  },
  '🔐 ログイン': {
    'ログインできない': 'Googleアカウントがアプリに登録されているか確認してください。未登録の場合は管理者にお問い合わせください。',
    'セッションについて': 'セッションは約1時間で自動終了します。残り5分で画面上部に警告が表示されます。終了後はログイン画面に移動しますが、データは保持されています。',
    '別端末で使いたい': '同じGoogleアカウントでログインすれば、どの端末からでもデータが同期されます。',
  },
};

const DEFAULT_QA_LIST = [
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

function findAnswer(text, qaList) {
  const lower = text.toLowerCase();
  for (const qa of qaList) {
    if (qa.keywords.some(k => lower.includes(k))) return qa.answer;
  }
  return 'ご質問の内容が見つかりませんでした。担当者にお問い合わせいただくか、別のキーワードでお試しください。';
}

// Firebase管理のカテゴリボタン(フラットな配列)を、デフォルトのツリー構造にマージする
// (Q&A管理画面の「チャットのカテゴリボタン管理」で追加・編集された内容が優先される)
function mergeChatTree(defaultTree, fbCategories) {
  const tree = {};
  Object.keys(defaultTree).forEach(cat => { tree[cat] = { ...defaultTree[cat] }; });
  (fbCategories || []).forEach(c => {
    if (!tree[c.category]) tree[c.category] = {};
    tree[c.category][c.subcategory] = c.answer;
  });
  return tree;
}

function ChatBubble({ type, text }) {
  return (
    <div style={{
      maxWidth:'84%', fontSize:13, padding:'8px 12px', lineHeight:1.6, wordBreak:'break-word',
      borderRadius: type === 'bot' ? '10px 10px 10px 2px' : '10px 10px 2px 10px',
      background: type === 'bot' ? 'var(--bg2)' : 'var(--accent)',
      color: type === 'bot' ? 'var(--text)' : 'var(--accent-text)',
      alignSelf: type === 'bot' ? 'flex-start' : 'flex-end',
    }}>
      {text}
    </div>
  );
}

const navBtnStyle = {
  fontSize:12, padding:'5px 11px', borderRadius:20, border:'.5px solid var(--border)',
  background:'var(--bg)', color:'var(--text2)', cursor:'pointer', fontFamily:'inherit',
};
const backBtnStyle = {
  ...navBtnStyle, fontSize:11, padding:'3px 10px', background:'var(--bg2)', width:'100%', textAlign:'left', marginBottom:4,
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  // nav: {mode:'categories'} | {mode:'subcategories', category} | {mode:'answered', category} | {mode:'hidden'}
  const [nav, setNav] = React.useState({ mode: 'categories' });
  const [inputValue, setInputValue] = React.useState('');
  const [qaList, setQaList] = React.useState(DEFAULT_QA_LIST);
  const [chatTree, setChatTree] = React.useState(DEFAULT_CHAT_TREE);
  const msgsRef = React.useRef(null);

  // Firebase管理のQ&Aを取得してデフォルトにマージ（既存の設定タブ経由のマージロジックと同じ考え方）
  React.useEffect(() => {
    if (typeof window.fetchQAList !== 'function') return;
    window.fetchQAList().then(fbQA => {
      if (fbQA && fbQA.length) {
        const fbKeywords = fbQA.flatMap(q => q.keywords);
        const filteredDefault = DEFAULT_QA_LIST.filter(q => !q.keywords.some(k => fbKeywords.includes(k)));
        setQaList([...fbQA, ...filteredDefault]);
      }
    }).catch(e => console.warn('チャットボット用Q&Aの取得に失敗', e));
  }, []);

  // Firebase管理のカテゴリボタンを取得してデフォルトのツリーにマージ
  React.useEffect(() => {
    if (typeof window.fetchChatCategories !== 'function') return;
    window.fetchChatCategories().then(fbCats => {
      if (fbCats && fbCats.length) {
        setChatTree(mergeChatTree(DEFAULT_CHAT_TREE, fbCats));
      }
    }).catch(e => console.warn('チャットボット用カテゴリボタンの取得に失敗', e));
  }, []);

  React.useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages]);

  function addMsg(type, text) {
    setMessages(prev => [...prev, { type, text }]);
  }

  function handleToggle() {
    setIsOpen(prev => {
      const next = !prev;
      if (next) {
        setMessages(cur => cur.length ? cur : [{ type:'bot', text:'こんにちは！😊 操作についてのご質問はカテゴリから選ぶか、下の入力欄に直接入力してください。' }]);
      }
      return next;
    });
  }

  function selectCategory(cat) {
    addMsg('user', cat);
    setNav({ mode:'hidden' });
    setTimeout(() => {
      addMsg('bot', 'どのようなことでしょうか？');
      setNav({ mode:'subcategories', category:cat });
    }, 200);
  }

  function selectSubCategory(cat, sub) {
    addMsg('user', sub);
    setNav({ mode:'hidden' });
    setTimeout(() => {
      addMsg('bot', chatTree[cat][sub]);
      setNav({ mode:'answered', category:cat });
    }, 300);
  }

  function handleSend() {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue('');
    setNav({ mode:'hidden' });
    addMsg('user', text);
    setTimeout(() => {
      addMsg('bot', findAnswer(text, qaList));
    }, 300);
  }

  return (
    <React.Fragment>
      <button
        aria-label="よくある質問"
        onClick={handleToggle}
        style={{
          position:'fixed', bottom:20, right:20, width:54, height:54, borderRadius:'50%',
          background:'var(--accent)', color:'var(--accent-text)', border:'none', cursor:'pointer',
          fontSize:26, zIndex:900, boxShadow:'0 4px 12px rgba(0,0,0,0.25)',
          display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'inherit',
        }}
      >🤖</button>

      <div style={{
        position:'fixed', bottom:84, right:20, width:300,
        height: isOpen ? 420 : 0, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
        background:'var(--bg)', border:'.5px solid var(--border)', borderRadius:14, zIndex:900,
        display:'flex', flexDirection:'column', overflow:'hidden',
        boxShadow:'0 8px 30px rgba(0,0,0,0.18)',
        transition:'height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s',
      }}>
        <div style={{
          background:'var(--accent)', color:'var(--accent-text)', padding:'12px 16px',
          display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:20 }}>🤖</span>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>よくある質問</div>
              <div style={{ fontSize:10, opacity:0.8 }}>お気軽にどうぞ！</div>
            </div>
          </div>
          <button onClick={handleToggle} style={{ background:'none', border:'none', color:'var(--accent-text)', cursor:'pointer', fontSize:20, lineHeight:1, padding:'2px 4px', opacity:0.8 }}>✕</button>
        </div>

        <div ref={msgsRef} style={{ flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:8, minHeight:0, background:'var(--bg)' }}>
          {messages.map((m, i) => <ChatBubble key={i} type={m.type} text={m.text} />)}
        </div>

        <div style={{ padding:'8px 10px', display:'flex', flexWrap:'wrap', gap:5, borderTop:'.5px solid var(--border)', flexShrink:0, background:'var(--bg)' }}>
          {nav.mode === 'categories' && Object.keys(chatTree).map(cat => (
            <button key={cat} style={navBtnStyle} onClick={() => selectCategory(cat)}>{cat}</button>
          ))}
          {nav.mode === 'subcategories' && (
            <React.Fragment>
              <button style={backBtnStyle} onClick={() => setNav({ mode:'categories' })}>← 戻る</button>
              {Object.keys(chatTree[nav.category]).map(sub => (
                <button key={sub} style={navBtnStyle} onClick={() => selectSubCategory(nav.category, sub)}>{sub}</button>
              ))}
            </React.Fragment>
          )}
          {nav.mode === 'answered' && (
            <React.Fragment>
              <button style={{ ...backBtnStyle, width:'auto' }} onClick={() => setNav({ mode:'subcategories', category:nav.category })}>← {nav.category} に戻る</button>
              <button style={{ ...backBtnStyle, width:'auto' }} onClick={() => setNav({ mode:'categories' })}>🏠 最初に戻る</button>
            </React.Fragment>
          )}
        </div>

        <div style={{ padding:8, borderTop:'.5px solid var(--border)', display:'flex', gap:6, flexShrink:0, background:'var(--bg)' }}>
          <input
            placeholder="質問を入力..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            style={{ flex:1, fontSize:13, padding:'7px 10px', border:'.5px solid var(--border)', borderRadius:6, background:'var(--bg2)', color:'var(--text)', fontFamily:'inherit', outline:'none' }}
          />
          <button onClick={handleSend} style={{ padding:'7px 12px', borderRadius:6, border:'none', background:'var(--accent)', color:'var(--accent-text)', cursor:'pointer', fontSize:13, fontWeight:500, fontFamily:'inherit' }}>送信</button>
        </div>
      </div>
    </React.Fragment>
  );
}

export function mountChatbot() {
  const el = document.getElementById('chatbot-root');
  if (!el) return;
  if (!el._root) el._root = ReactDOM.createRoot(el);
  el._root.render(<ChatbotWidget />);
}
