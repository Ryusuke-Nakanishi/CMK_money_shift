// ── 講師評価機能: React コンポーネント ──
import React from 'react';
import ReactDOM from 'react-dom/client';
import Chart from 'chart.js/auto';

const EVAL_CATEGORIES = [
  { key: 'キャラクター', items: ['テンション','リアクション','表情','親しみ','声のトーン・明瞭さ','ユーモア'] },
  { key: 'コーチング', items: ['話し方','進め方','共感・傾聴','呼びかけ・励まし','柔軟性'] },
  { key: 'ホメ', items: ['個性','知識','優しさ','理解','思い付き','意欲','スピード','工夫'] },
  { key: '対応力', items: ['平等性','公平性','落ち着き・安定感','保護者への対応依頼','保護者への説明'] },
  { key: '積極性/成長力', items: ['積極性','自己FB能力','事前準備','前回からの改善力'] },
  { key: '社会性', items: ['報連相の頻度(Slack)','返信の速さ(Slack)','シフト安定性'] },
];
// カテゴリごとの識別色（淡いトーンで背景に使用。ダークモードでも破綻しないよう低い不透明度にしている）
const CATEGORY_TINTS = {
  'キャラクター': 'rgba(55,138,221,0.08)',
  'コーチング': 'rgba(76,175,80,0.08)',
  'ホメ': 'rgba(155,89,182,0.08)',
  '対応力': 'rgba(230,126,34,0.08)',
  '積極性/成長力': 'rgba(233,30,140,0.07)',
  '社会性': 'rgba(212,175,10,0.10)',
};
// レーダーチャートの軸ラベル用の短縮表記（長い文字列だとChart.jsが文字単位で折り返してしまうため）
const CATEGORY_SHORT_LABELS = {
  'キャラクター': '性格',
  'コーチング': 'コーチ',
  'ホメ': 'ホメ',
  '対応力': '対応力',
  '積極性/成長力': '成長力',
  '社会性': '社会性',
};

function categoryAverage(catData) {
  if (!catData) return null;
  const scores = Object.values(catData.items || {}).map(i => i.score).filter(s => typeof s === 'number');
  if (!scores.length) return null;
  return scores.reduce((a,b)=>a+b,0) / scores.length;
}
function overallAverage(evaluation) {
  if (!evaluation) return null;
  const avgs = EVAL_CATEGORIES.map(c => categoryAverage(evaluation.categories?.[c.key])).filter(v => v != null);
  if (!avgs.length) return null;
  return avgs.reduce((a,b)=>a+b,0) / avgs.length;
}
function fmtScore(n) { return (n === null || n === undefined) ? '-' : n.toFixed(1); }
function fmtDate(ts) { return ts ? new Date(ts).toLocaleDateString('ja-JP') : ''; }

function RadarChart({ current, previous }) {
  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);
  React.useEffect(() => {
    if (!canvasRef.current || typeof Chart === 'undefined') return;
    const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
    const muted = isDark ? '#aaaaaa' : '#666666';
    const grid = isDark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.12)';
    // レーダーチャートの軸ラベルは、長い日本語文字列だとChart.jsが文字単位で折り返してしまい表示が崩れることがあるため、
    // 短縮表記を使う（データ参照キー自体は変更しない）
    const labels = EVAL_CATEGORIES.map(c => CATEGORY_SHORT_LABELS[c.key] || c.key);
    const datasets = [{
      label: '今回',
      data: EVAL_CATEGORIES.map(c => categoryAverage(current?.categories?.[c.key])),
      borderColor: '#2a78d6', backgroundColor: 'rgba(42,120,214,0.15)', pointRadius: 2, borderWidth: 2
    }];
    if (previous) {
      datasets.push({
        label: '前回',
        data: EVAL_CATEGORIES.map(c => categoryAverage(previous?.categories?.[c.key])),
        borderColor: '#898781', backgroundColor: 'rgba(137,135,129,0.08)', pointRadius: 2, borderWidth: 1.5
      });
    }
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        layout: { padding: 16 },
        plugins: { legend: { display: false } },
        scales: { r: { min:0, max:5, ticks:{stepSize:1,color:muted,backdropColor:'transparent',font:{size:9}}, grid:{color:grid}, angleLines:{color:grid}, pointLabels:{color:muted,font:{size:11},centerPointLabels:false} } }
      }
    });
    // 初回描画時、コンテナのレイアウトが確定する前にChartが作られるとラベル位置が崩れることがあるため、
    // レイアウト確定後に強制的にリサイズし直す
    const chartInstance = chartRef.current;
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => { if (chartInstance) chartInstance.resize(); });
      chartRef.current && (chartRef.current._raf2 = raf2);
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (chartInstance && chartInstance._raf2) cancelAnimationFrame(chartInstance._raf2);
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [current, previous]);
  return <div style={{ position:'relative', height:260, width:'100%' }}><canvas ref={canvasRef}></canvas></div>;
}

function EvaluationDetail({ evaluation, previous, onTogglePublish }) {
  if (!evaluation) return null;
  const overall = overallAverage(evaluation);
  const prevOverall = previous ? overallAverage(previous) : null;
  const delta = (prevOverall != null && overall != null) ? (overall - prevOverall) : null;
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8, marginBottom:8 }}>
        <p style={{ fontSize:13, color:'var(--text2)', margin:0 }}>
          評価日 {fmtDate(evaluation.evaluatedAt)}
        </p>
        {onTogglePublish && (
          <button
            className="btn btn-sm"
            onClick={() => onTogglePublish(evaluation)}
            style={evaluation.published ? { background:'var(--success-bg)', color:'var(--success-text)', borderColor:'var(--success-text)' } : {}}
          >
            {evaluation.published ? '✓ 公開中（タップで非公開に）' : '非公開（タップで公開する）'}
          </button>
        )}
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap:8, margin:'4px 0 16px' }}>
        <span style={{ fontSize:13, color:'var(--text2)' }}>総合平均スコア</span>
        <span style={{ fontSize:32, fontWeight:500 }}>{fmtScore(overall)}</span>
        {delta != null && (
          <span style={{ fontSize:13, color: delta >= 0 ? 'var(--success-text)' : 'var(--danger-text)' }}>
            {delta >= 0 ? '▲' : '▼'}{Math.abs(delta).toFixed(1)} 前回比
          </span>
        )}
      </div>
      <RadarChart key={evaluation.id || evaluation.evaluatedAt} current={evaluation} previous={previous} />
      <div style={{ marginTop:16 }}>
        {EVAL_CATEGORIES.map(cat => {
          const catData = evaluation.categories?.[cat.key];
          const avg = categoryAverage(catData);
          const prevAvg = previous ? categoryAverage(previous.categories?.[cat.key]) : null;
          const catDelta = (avg != null && prevAvg != null) ? avg - prevAvg : null;
          return (
            <details key={cat.key} style={{ borderBottom:'.5px solid var(--border)' }}>
              <summary style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', cursor:'pointer', fontSize:13, listStyle:'none' }}>
                <span className="chev" style={{ fontSize:12, color:'var(--text3)' }}>▸</span>
                <span style={{ flex:1 }}>{cat.key}</span>
                <span style={{ fontWeight:500, width:36, textAlign:'right' }}>{fmtScore(avg)}</span>
                {catDelta != null && (
                  <span style={{ width:44, textAlign:'right', fontSize:12, color: catDelta >= 0 ? 'var(--success-text)' : 'var(--danger-text)' }}>
                    {catDelta >= 0 ? '+' : ''}{catDelta.toFixed(1)}
                  </span>
                )}
              </summary>
              <div style={{ padding:'4px 0 10px 4px' }}>
                {cat.items.map(itemName => {
                  const item = catData?.items?.[itemName];
                  if (!item) return null;
                  return (
                    <div key={itemName} style={{ marginBottom:8 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                        <span>{itemName}{item.wasNA && <span style={{ color:'var(--text3)', marginLeft:4 }}>（引継）</span>}</span>
                        <b>{item.score ?? 'N/A'}</b>
                      </div>
                      {item.comment && <p style={{ fontSize:11, color:'var(--text2)', margin:'2px 0 0' }}>{item.comment}</p>}
                    </div>
                  );
                })}
                {catData?.comment && <p style={{ fontSize:12, color:'var(--text2)', marginTop:6, fontStyle:'italic' }}>{catData.comment}</p>}
              </div>
            </details>
          );
        })}
      </div>
      {evaluation.overallComment && (
        <div style={{ marginTop:12, padding:'10px 12px', background:'var(--bg2)', borderRadius:'var(--radius-sm)' }}>
          <p style={{ fontSize:11, color:'var(--text2)', margin:'0 0 4px' }}>総合コメント</p>
          <p style={{ fontSize:13, margin:0 }}>{evaluation.overallComment}</p>
        </div>
      )}
    </div>
  );
}

function ArchiveList({ evaluations, onTogglePublish }) {
  if (!evaluations || evaluations.length <= 1) return null;
  const rest = evaluations.slice(1);
  return (
    <div style={{ marginTop:16, borderTop:'.5px solid var(--border)', paddingTop:12 }}>
      <p style={{ fontSize:12, color:'var(--text2)', margin:'0 0 8px' }}>過去の評価（アーカイブ）</p>
      {rest.map((ev, idx) => {
        const prev = rest[idx+1] || null;
        return (
          <details key={ev.id} style={{ borderBottom:'.5px solid var(--border)' }}>
            <summary style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', cursor:'pointer', fontSize:13, listStyle:'none' }}>
              <span className="chev" style={{ fontSize:12, color:'var(--text3)' }}>▸</span>
              <span style={{ flex:1 }}>{fmtDate(ev.evaluatedAt)}</span>
              {onTogglePublish && (
                <span style={{ fontSize:10, padding:'1px 7px', borderRadius:20, background: ev.published ? 'var(--success-bg)' : 'var(--bg2)', color: ev.published ? 'var(--success-text)' : 'var(--text3)' }}>
                  {ev.published ? '公開中' : '非公開'}
                </span>
              )}
              <span style={{ fontWeight:500, width:40, textAlign:'right' }}>{fmtScore(overallAverage(ev))}</span>
            </summary>
            <div style={{ padding:'8px 0' }}>
              <EvaluationDetail evaluation={ev} previous={prev} onTogglePublish={onTogglePublish} />
            </div>
          </details>
        );
      })}
    </div>
  );
}

function CourseDisplayBox({ courses }) {
  const list = courses || [];
  return (
    <div style={{ marginBottom:16 }}>
      <p style={{ fontSize:12, color:'var(--text2)', margin:'0 0 8px' }}>担当可能コース</p>
      {!list.length ? (
        <p style={{ fontSize:12, color:'var(--text3)' }}>まだ設定されていません</p>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
          {list.slice().sort((a, b) => (a.priority || 99) - (b.priority || 99)).map(entry => {
            const info = COURSE_LIST.find(c => c.id === entry.course);
            if (!info) return null;
            const isMain = entry.isMain || entry.priority === 1;
            return (
              <div key={entry.course} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:'var(--radius-sm)', background: isMain ? 'var(--bg2)' : 'transparent' }}>
                <span style={{ width:9, height:9, borderRadius:'50%', background:info.color, flexShrink:0 }}></span>
                <span style={{ fontSize:12, flex:1 }}>{info.id}</span>
                <span style={{ fontSize:10, color: isMain ? 'var(--accent)' : 'var(--text3)' }}>{isMain ? 'メイン' : `${entry.priority}位`}</span>
                <span style={{ fontSize:10, color: entry.canHandleMakeup ? 'var(--success-text)' : 'var(--text3)' }}>
                  {entry.canHandleMakeup ? '振替対応可' : '振替対応不可'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function UnitDisplayBox({ email, unitAssignments, allUnits }) {
  const list = unitAssignments || [];
  const units = allUnits || [];
  // このユーザーがリーダーを務めるユニット（何個でも持てる＝掛け持ち対応）
  const ledUnits = email ? units.filter(u => u.leaderEmail === email) : [];
  const hasAny = ledUnits.length > 0 || list.length > 0;
  if (!hasAny) return (
    <div style={{ marginBottom:16 }}>
      <p style={{ fontSize:12, color:'var(--text2)', margin:'0 0 8px' }}>所属ユニット</p>
      <p style={{ fontSize:12, color:'var(--text3)' }}>まだ設定されていません</p>
    </div>
  );
  return (
    <div style={{ marginBottom:16 }}>
      {ledUnits.length > 0 && (
        <div style={{ marginBottom:8 }}>
          <p style={{ fontSize:12, color:'var(--text2)', margin:'0 0 6px' }}>
            リーダーを務めるユニット{ledUnits.length > 1 ? '（掛け持ち）' : ''}
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {ledUnits.map(u => (
              <span key={u.id} style={{ fontSize:12, padding:'4px 10px', borderRadius:20, background:'var(--accent)', color:'var(--accent-text)' }}>
                {u.name}
              </span>
            ))}
          </div>
        </div>
      )}
      {list.length > 0 && (
        <div>
          <p style={{ fontSize:12, color:'var(--text2)', margin:'0 0 6px' }}>メンバーとして所属するユニット</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {list.slice().sort((a, b) => (a.isMain ? 0 : 1) - (b.isMain ? 0 : 1)).map(a => {
              const info = units.find(u => u.id === a.unit);
              if (!info) return null;
              return (
                <span key={a.unit} style={{ fontSize:12, padding:'4px 10px', borderRadius:20, background: a.isMain ? 'var(--bg2)' : 'transparent', border:'.5px solid var(--border)', color:'var(--text2)' }}>
                  {info.name}{a.isMain ? '（メイン）' : '（準メンバー）'}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MyEvaluationPage() {
  const [evals, setEvals] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [allUnits, setAllUnits] = React.useState([]);
  React.useEffect(() => {
    const email = window._currentUser?.email;
    if (!email || !window.fetchEvaluationsForStaff) { setEvals([]); return; }
    window.fetchEvaluationsForStaff(email)
      .then(setEvals)
      .catch(e => {
        console.error('講師評価の取得に失敗しました:', e);
        setError(e);
      });
    if (window.fetchAllUnits) window.fetchAllUnits().then(setAllUnits);
  }, []);
  if (error) return (
    <div className="card">
      <div className="section-title">講師評価</div>
      <p style={{ fontSize:13, color:'var(--danger-text)' }}>
        評価データの取得中にエラーが発生しました。ブラウザのコンソールにエラーの詳細が出ています。
        「index」「failed-precondition」のようなFirestoreのエラーの場合、コンソールに表示されるリンクをクリックすると索引が自動作成されます。
      </p>
    </div>
  );
  if (evals === null) return <p style={{ fontSize:13, color:'var(--text2)' }}>読み込み中...</p>;
  const publishedEvals = evals.filter(e => e.published === true);
  if (!publishedEvals.length) return (
    <div className="card">
      <div className="section-title">講師評価</div>
      <UnitDisplayBox email={window._currentUser?.email} unitAssignments={window._currentUser?.units} allUnits={allUnits} />
      <CourseDisplayBox courses={window._currentUser?.courses} />
      <p style={{ fontSize:13, color:'var(--text2)' }}>
        {evals.length ? 'まだ評価が公開されていません。公開されると、こちらで確認できるようになります。' : 'まだ評価が登録されていません。'}
      </p>
    </div>
  );
  const [latest, ...rest] = publishedEvals;
  return (
    <div className="card">
      <div className="section-title">講師評価</div>
      <UnitDisplayBox email={window._currentUser?.email} unitAssignments={window._currentUser?.units} allUnits={allUnits} />
      <CourseDisplayBox courses={window._currentUser?.courses} />
      <EvaluationDetail evaluation={latest} previous={rest[0] || null} />
      <ArchiveList evaluations={publishedEvals} />
    </div>
  );
}

const thStyle = { textAlign:'left', fontSize:11, color:'var(--text2)', fontWeight:500, padding:'8px 8px' };
const tdStyle = { fontSize:12, padding:'8px 8px' };

function EvalManageListPage({ jumpToEmail } = {}) {
  const [users, setUsers] = React.useState(null);
  const [allEvals, setAllEvals] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [onlyStale, setOnlyStale] = React.useState(false);
  const [filterCourse, setFilterCourse] = React.useState('');
  const [filterCoursePriority, setFilterCoursePriority] = React.useState('');
  const [sortBy, setSortBy] = React.useState(null); // null | 'overall' | カテゴリ名
  const [sortDir, setSortDir] = React.useState('desc');
  const [view, setView] = React.useState(jumpToEmail ? { mode:'detail', email: jumpToEmail } : { mode:'list' });
  const [showAddPending, setShowAddPending] = React.useState(false);
  const [pendingName, setPendingName] = React.useState('');
  const [pendingRole, setPendingRole] = React.useState('instructor');
  const [pendingSaving, setPendingSaving] = React.useState(false);

  const myRole = window._currentUser?.role || '';
  const canAddPending = ['ul','operator','admin'].includes(myRole);

  React.useEffect(() => {
    if (jumpToEmail) setView({ mode:'detail', email: jumpToEmail });
  }, [jumpToEmail]);

  function toggleSort(key) {
    if (sortBy === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(key); setSortDir('desc'); }
  }

  const reload = React.useCallback(async () => {
    const [u, e] = await Promise.all([window.fetchAllUsers(), window.fetchAllEvaluations()]);
    setUsers(u); setAllEvals(e);
  }, []);
  React.useEffect(() => { reload(); }, [reload]);

  async function handleAddPending() {
    if (!pendingName.trim()) return;
    setPendingSaving(true);
    await window.createPendingStaff(pendingName.trim(), pendingRole);
    setPendingSaving(false);
    setPendingName(''); setPendingRole('instructor'); setShowAddPending(false);
    await reload();
  }

  if (users === null || allEvals === null) return <p style={{ fontSize:13, color:'var(--text2)' }}>読み込み中...</p>;

  const evalsByEmail = {};
  allEvals.forEach(ev => { (evalsByEmail[ev.staffEmail] = evalsByEmail[ev.staffEmail] || []).push(ev); });

  if (view.mode === 'detail' || view.mode === 'form') {
    const staff = users.find(u => u.email === view.email) || { email: view.email };
    const evals = evalsByEmail[view.email] || [];
    return <StaffDetailPage staff={staff} evals={evals} view={view} setView={setView} onSaved={reload} />;
  }

  function mainCourseOf(user) {
    const list = user.courses || [];
    return list.find(c => c.isMain) || list.slice().sort((a,b)=>(a.priority||99)-(b.priority||99))[0] || null;
  }

  let rows = users.map(u => {
    const evals = evalsByEmail[u.email] || [];
    const latest = evals[0] || null;
    return { user:u, latest, overall: overallAverage(latest), mainCourse: mainCourseOf(u) };
  });
  if (search) rows = rows.filter(r => (r.user.name || r.user.email || '').includes(search));
  if (onlyStale) rows = rows.filter(r => !r.latest || (Date.now() - r.latest.evaluatedAt) > 1000*60*60*24*90);
  if (filterCourse) {
    rows = rows.filter(r => (r.user.courses || []).some(c =>
      c.course === filterCourse && (!filterCoursePriority || (c.priority || 99) <= Number(filterCoursePriority))
    ));
  }
  if (sortBy) {
    rows = rows.slice().sort((a, b) => {
      const va = sortBy === 'overall' ? a.overall : categoryAverage(a.latest?.categories?.[sortBy]);
      const vb = sortBy === 'overall' ? b.overall : categoryAverage(b.latest?.categories?.[sortBy]);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      return sortDir === 'desc' ? vb - va : va - vb;
    });
  }

  function exportCSV() {
    const header = ['名前', ...EVAL_CATEGORIES.flatMap(c => c.items.map(i => `${c.key}_${i}`)), ...EVAL_CATEGORIES.map(c => `${c.key}_平均`), '総合平均', '最終評価日'];
    const lines = [header.join(',')];
    rows.forEach(r => {
      const ev = r.latest;
      const itemVals = EVAL_CATEGORIES.flatMap(c => c.items.map(i => ev?.categories?.[c.key]?.items?.[i]?.score ?? ''));
      const catAvgs = EVAL_CATEGORIES.map(c => { const a = categoryAverage(ev?.categories?.[c.key]); return a == null ? '' : a.toFixed(1); });
      const overall = r.overall == null ? '' : r.overall.toFixed(1);
      const row = [r.user.name || r.user.email, ...itemVals, ...catAvgs, overall, fmtDate(ev?.evaluatedAt)];
      lines.push(row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
    });
    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `講師評価一覧_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, flexWrap:'wrap', gap:8 }}>
        <div className="section-title" style={{ marginBottom:0 }}>全講師評価管理</div>
        <div style={{ display:'flex', gap:8 }}>
          {canAddPending && <button className="btn btn-sm" onClick={() => setShowAddPending(v => !v)}>＋仮の講師を登録</button>}
          <button className="btn btn-sm" onClick={exportCSV}>CSVエクスポート</button>
        </div>
      </div>
      {showAddPending && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:12, padding:'10px 12px', border:'.5px solid var(--border)', borderRadius:'var(--radius-sm)' }}>
          <input placeholder="名前" value={pendingName} onChange={e => setPendingName(e.target.value)} style={{ width:160 }} />
          <select value={pendingRole} onChange={e => setPendingRole(e.target.value)} style={{ width:140 }}>
            {Object.keys(window.ROLES||{}).map(r => <option key={r} value={r}>{window.ROLES[r]?.label||r}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={handleAddPending} disabled={pendingSaving}>{pendingSaving?'登録中...':'登録'}</button>
          <button className="btn btn-sm" onClick={() => setShowAddPending(false)}>キャンセル</button>
          <p style={{ fontSize:11, color:'var(--text3)', width:'100%', margin:0 }}>メールアドレスが分かったら、個別ページから後で紐付けられます</p>
        </div>
      )}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12, alignItems:'center' }}>
        <input placeholder="名前で検索" value={search} onChange={e => setSearch(e.target.value)} style={{ width:160 }} />
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} style={{ width:220 }}>
          <option value="">担当コース：すべて</option>
          {COURSE_LIST.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
        </select>
        {filterCourse && (
          <select value={filterCoursePriority} onChange={e => setFilterCoursePriority(e.target.value)} style={{ width:130 }}>
            <option value="">順位：指定なし</option>
            {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}位以内</option>)}
          </select>
        )}
        <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--text2)' }}>
          <input type="checkbox" checked={onlyStale} onChange={e => setOnlyStale(e.target.checked)} style={{ width:16, height:16 }} />
          最近評価されていない人だけ
        </label>
      </div>
      <p style={{ fontSize:11, color:'var(--text3)', margin:'0 0 8px' }}>カテゴリ・総合の見出しをタップすると並び替えできます</p>
      <div style={{ overflowX:'auto', border:'.5px solid var(--border)', borderRadius:'var(--radius)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:900 }}>
          <thead>
            <tr style={{ background:'var(--bg2)' }}>
              <th style={thStyle}>名前</th>
              <th style={thStyle}>役職</th>
              <th style={thStyle}>メインコース</th>
              {EVAL_CATEGORIES.map(c => (
                <th key={c.key} style={{ ...thStyle, textAlign:'center', cursor:'pointer', userSelect:'none' }} onClick={() => toggleSort(c.key)}>
                  {c.key}{sortBy === c.key ? (sortDir === 'desc' ? ' ▼' : ' ▲') : ''}
                </th>
              ))}
              <th style={{ ...thStyle, textAlign:'center', cursor:'pointer', userSelect:'none' }} onClick={() => toggleSort('overall')}>
                総合{sortBy === 'overall' ? (sortDir === 'desc' ? ' ▼' : ' ▲') : ''}
              </th>
              <th style={{ ...thStyle, textAlign:'center' }}>公開状況</th>
              <th style={thStyle}>最終評価日</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const courseInfo = COURSE_LIST.find(c => c.id === r.mainCourse?.course);
              return (
                <tr key={r.user.email} style={{ borderTop:'.5px solid var(--border)' }}>
                  <td style={tdStyle}>
                    <a href="#" onClick={e => { e.preventDefault(); setView({ mode:'detail', email:r.user.email }); }} style={{ color:'var(--text)', textDecoration:'underline', fontWeight:500 }}>
                      {r.user.name || r.user.email}
                    </a>
                    {r.user.isPending && <span style={{ marginLeft:6, fontSize:10, padding:'1px 7px', borderRadius:20, background:'var(--warning-bg)', color:'var(--warning-text)' }}>仮登録</span>}
                  </td>
                  <td style={{ ...tdStyle, color:'var(--text2)' }}>{window.ROLES?.[r.user.role]?.label || r.user.role}</td>
                  <td style={tdStyle}>
                    {courseInfo ? (
                      <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ width:8, height:8, borderRadius:'50%', background:courseInfo.color, flexShrink:0 }}></span>
                        <span style={{ color:'var(--text2)' }}>{courseInfo.id}</span>
                      </span>
                    ) : <span style={{ color:'var(--text3)' }}>未設定</span>}
                  </td>
                  {EVAL_CATEGORIES.map(c => <td key={c.key} style={{ ...tdStyle, textAlign:'center' }}>{fmtScore(categoryAverage(r.latest?.categories?.[c.key]))}</td>)}
                  <td style={{ ...tdStyle, textAlign:'center', fontWeight:500 }}>{fmtScore(r.overall)}</td>
                  <td style={{ ...tdStyle, textAlign:'center' }}>
                    {r.latest ? (
                      <span style={{ fontSize:10, padding:'1px 8px', borderRadius:20, background: r.latest.published ? 'var(--success-bg)' : 'var(--bg2)', color: r.latest.published ? 'var(--success-text)' : 'var(--text3)' }}>
                        {r.latest.published ? '公開中' : '非公開'}
                      </span>
                    ) : <span style={{ color:'var(--text3)' }}>−</span>}
                  </td>
                  <td style={{ ...tdStyle, color:'var(--text2)' }}>{r.latest ? fmtDate(r.latest.evaluatedAt) : '未評価'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 担当コースの一覧（固有色つき、この並び順で表示する）
const COURSE_LIST = [
  { id:'マイプロプレジュニアコース', color:'#F2C94C' },
  { id:'マイプロジュニアコース', color:'#E24B4A' },
  { id:'マイプロスタンダードコース', color:'#378ADD' },
  { id:'コマンドスターターコース', color:'#9AD14A' },
  { id:'コマンドブースターコース', color:'#3B6D11' },
  { id:'コマンドエクストラコース', color:'#7F77DD' },
  { id:'ロブロックスコース', color:'var(--text)' },
];

function CourseSettingsPanel({ staff, onSaved }) {
  const buildInitial = () => {
    const init = {};
    COURSE_LIST.forEach(c => { init[c.id] = { capable:false, priority:'', canHandleMakeup:false }; });
    (staff.courses || []).forEach(entry => {
      if (init[entry.course]) {
        init[entry.course] = { capable:true, priority: entry.priority != null ? String(entry.priority) : '', canHandleMakeup: !!entry.canHandleMakeup };
      }
    });
    return init;
  };
  const [state, setState] = React.useState(buildInitial);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  function toggleCapable(id) {
    setState(prev => ({ ...prev, [id]: { ...prev[id], capable: !prev[id].capable } }));
    setSaved(false);
  }
  function setPriority(id, val) {
    setState(prev => ({ ...prev, [id]: { ...prev[id], priority: val } }));
    setSaved(false);
  }
  function toggleMakeup(id) {
    setState(prev => ({ ...prev, [id]: { ...prev[id], canHandleMakeup: !prev[id].canHandleMakeup } }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const courses = COURSE_LIST
      .filter(c => state[c.id].capable)
      .map(c => {
        const priority = Number(state[c.id].priority) || 99;
        return { course: c.id, priority, isMain: priority === 1, canHandleMakeup: state[c.id].canHandleMakeup };
      })
      .sort((a, b) => a.priority - b.priority);
    await window.updateStaffCourses(staff.email, courses);
    setSaving(false);
    setSaved(true);
    if (onSaved) await onSaved();
  }

  return (
    <details style={{ marginTop:16, border:'.5px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'10px 12px' }}>
      <summary style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', listStyle:'none', fontWeight:500, fontSize:14 }}>
        <span className="chev" style={{ fontSize:12, color:'var(--text3)' }}>▸</span>
        <span>担当コース設定</span>
      </summary>
      <div style={{ marginTop:10 }}>
        <p style={{ fontSize:11, color:'var(--text3)', margin:'0 0 10px' }}>順位1のコースが自動的にメイン担当コースになります</p>
        {COURSE_LIST.map(c => (
          <div key={c.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:'.5px solid var(--border)', flexWrap:'wrap' }}>
            <input type="checkbox" checked={state[c.id].capable} onChange={() => toggleCapable(c.id)} style={{ width:16, height:16 }} />
            <span style={{ width:10, height:10, borderRadius:'50%', background:c.color, flexShrink:0 }}></span>
            <span style={{ fontSize:13, flex:1, minWidth:140 }}>{c.id}{state[c.id].capable && Number(state[c.id].priority) === 1 && <span style={{ fontSize:11, color:'var(--accent)', marginLeft:6 }}>（メイン）</span>}</span>
            {state[c.id].capable && (
              <React.Fragment>
                <input type="number" min="1" placeholder="順位" value={state[c.id].priority} onChange={e => setPriority(c.id, e.target.value)} style={{ width:64 }} />
                <label style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'var(--text2)' }}>
                  <input type="checkbox" checked={state[c.id].canHandleMakeup} onChange={() => toggleMakeup(c.id)} style={{ width:14, height:14 }} />
                  振替対応
                </label>
              </React.Fragment>
            )}
          </div>
        ))}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10 }}>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? '保存中...' : 'コース設定を保存'}</button>
          {saved && <span style={{ fontSize:12, color:'var(--success-text)' }}>保存しました</span>}
        </div>
      </div>
    </details>
  );
}

function UnitSettingsPanel({ staff, onSaved }) {
  const [allUnits, setAllUnits] = React.useState(null);
  const [selections, setSelections] = React.useState(() => {
    const init = {};
    (staff.units || []).forEach(a => { init[a.unit] = { selected:true, isMain: !!a.isMain }; });
    return init;
  });
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => { if (window.fetchAllUnits) window.fetchAllUnits().then(setAllUnits); }, []);

  function toggle(unitId) {
    setSelections(prev => {
      const cur = prev[unitId] || { selected:false, isMain:false };
      return { ...prev, [unitId]: { selected: !cur.selected, isMain: cur.selected ? false : cur.isMain } };
    });
    setSaved(false);
  }
  function setMain(unitId) {
    setSelections(prev => {
      const next = {};
      Object.keys(prev).forEach(k => { next[k] = { ...prev[k], isMain: k === unitId ? true : false }; });
      if (!next[unitId]) next[unitId] = { selected:true, isMain:true };
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const units = Object.entries(selections)
      .filter(([, v]) => v.selected)
      .map(([unitId, v]) => ({ unit: unitId, isMain: !!v.isMain }));
    await window.updateStaffUnits(staff.email, units);
    setSaving(false);
    setSaved(true);
    if (onSaved) await onSaved();
  }

  if (allUnits === null) return null;

  return (
    <details style={{ marginTop:12, border:'.5px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'10px 12px' }}>
      <summary style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', listStyle:'none', fontWeight:500, fontSize:14 }}>
        <span className="chev" style={{ fontSize:12, color:'var(--text3)' }}>▸</span>
        <span>所属ユニット設定</span>
      </summary>
      <div style={{ marginTop:10 }}>
        <p style={{ fontSize:11, color:'var(--text3)', margin:'0 0 10px' }}>チェックで所属、「メインにする」でメインユニットを指定（1つのみ）</p>
        {!allUnits.length && <p style={{ fontSize:12, color:'var(--text3)' }}>まだユニットが登録されていません（「ユニット一覧」タブから作成できます）</p>}
        {allUnits.map(u => {
          const sel = selections[u.id] || { selected:false, isMain:false };
          return (
            <div key={u.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'.5px solid var(--border)' }}>
              <input type="checkbox" checked={sel.selected} onChange={() => toggle(u.id)} style={{ width:16, height:16 }} />
              <span style={{ fontSize:13, flex:1 }}>{u.name}</span>
              {sel.selected && (
                sel.isMain
                  ? <span style={{ fontSize:11, color:'var(--accent)' }}>メイン</span>
                  : <button className="btn btn-sm" onClick={() => setMain(u.id)}>メインにする</button>
              )}
            </div>
          );
        })}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10 }}>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '所属ユニットを保存'}</button>
          {saved && <span style={{ fontSize:12, color:'var(--success-text)' }}>保存しました</span>}
        </div>
      </div>
    </details>
  );
}

function PendingLinkPanel({ staff, setView, onSaved }) {
  const [email, setEmail] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [result, setResult] = React.useState(null);

  async function handleLink() {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) { setResult({ ok:false, msg:'正しいメールアドレスを入力してください' }); return; }
    setSaving(true);
    const res = await window.linkPendingStaffToEmail(staff.email, trimmed);
    setSaving(false);
    if (res.success) {
      setResult({ ok:true, msg:`紐付けました（評価${res.evaluationsMigrated}件・ユニットのリーダー設定${res.unitsMigrated}件を引き継ぎ）` });
      await onSaved();
      setTimeout(() => setView({ mode:'list' }), 1200);
    } else {
      setResult({ ok:false, msg:res.errors.join(' / ') || '紐付けに失敗しました' });
    }
  }

  return (
    <div style={{ marginTop:16, padding:'12px', border:'.5px solid var(--warning-text)', borderRadius:'var(--radius-sm)', background:'var(--warning-bg)' }}>
      <p style={{ fontSize:13, fontWeight:500, margin:'0 0 4px', color:'var(--warning-text)' }}>仮登録中の講師です</p>
      <p style={{ fontSize:11, color:'var(--text2)', margin:'0 0 10px' }}>メールアドレスが判明したら入力してください。これまでの評価・所属ユニット・担当コースはそのまま引き継がれ、ログインできるようになります。</p>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <input type="email" placeholder="本人のメールアドレス" value={email} onChange={e => setEmail(e.target.value)} style={{ width:220 }} />
        <button className="btn btn-primary btn-sm" onClick={handleLink} disabled={saving}>{saving ? '処理中...' : 'メールアドレスと紐付ける'}</button>
      </div>
      {result && <p style={{ fontSize:12, marginTop:8, color: result.ok ? 'var(--success-text)' : 'var(--danger-text)' }}>{result.msg}</p>}
    </div>
  );
}

function StaffDetailPage({ staff, evals, view, setView, onSaved }) {
  const myRole = window._currentUser?.role || '';
  const canManage = ['sub_ul','ul','operator','admin'].includes(myRole);
  const canLinkEmail = ['ul','operator','admin'].includes(myRole);
  const [allUnits, setAllUnits] = React.useState([]);
  React.useEffect(() => { if (window.fetchAllUnits) window.fetchAllUnits().then(setAllUnits); }, []);
  if (view.mode === 'form') {
    return (
      <EvaluationForm
        staff={staff} evals={evals} existing={view.existing || null}
        onCancel={() => setView({ mode:'detail', email: staff.email })}
        onSaved={async () => { await onSaved(); setView({ mode:'detail', email: staff.email }); }}
      />
    );
  }
  async function handleTogglePublish(ev) {
    await window.setEvaluationPublished(ev.id, !ev.published);
    await onSaved();
  }
  const [latest, ...rest] = evals;
  return (
    <div className="card">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10, flexWrap:'wrap', gap:8 }}>
        <div>
          <button className="btn btn-sm" onClick={() => setView({ mode:'list' })}>← 一覧に戻る</button>
          <h2 style={{ fontSize:18, fontWeight:600, margin:'8px 0 2px' }}>
            {staff?.name || staff?.email}
            {staff?.isPending && <span style={{ marginLeft:8, fontSize:11, padding:'2px 8px', borderRadius:20, background:'var(--warning-bg)', color:'var(--warning-text)', fontWeight:500, verticalAlign:'middle' }}>仮登録</span>}
          </h2>
          <p style={{ fontSize:12, color:'var(--text2)', margin:0 }}>{window.ROLES?.[staff?.role]?.label || staff?.role}</p>
        </div>
        {canManage && (
          <button className="btn btn-primary btn-sm" onClick={() => setView({ mode:'form', email: staff.email, existing:null })}>
            ＋新規評価を作成
          </button>
        )}
      </div>
      {staff?.isPending && canLinkEmail && <PendingLinkPanel staff={staff} setView={setView} onSaved={onSaved} />}
      <UnitDisplayBox email={staff?.email} unitAssignments={staff?.units} allUnits={allUnits} />
      <CourseDisplayBox courses={staff?.courses} />
      {!latest ? (
        <p style={{ fontSize:13, color:'var(--text2)' }}>まだ評価がありません。</p>
      ) : (
        <React.Fragment>
          <EvaluationDetail evaluation={latest} previous={rest[0] || null} onTogglePublish={canManage ? handleTogglePublish : undefined} />
          {canManage && (
            <button className="btn btn-sm" style={{ marginTop:8 }} onClick={() => setView({ mode:'form', email: staff.email, existing: latest })}>
              この評価を編集
            </button>
          )}
        </React.Fragment>
      )}
      <ArchiveList evaluations={evals} onTogglePublish={canManage ? handleTogglePublish : undefined} />
      {canManage && <CourseSettingsPanel staff={staff} onSaved={onSaved} />}
      {canManage && <UnitSettingsPanel staff={staff} onSaved={onSaved} />}
    </div>
  );
}

function EvaluationForm({ staff, evals, existing, onCancel, onSaved }) {
  const isEdit = !!existing;
  const previous = isEdit ? (evals[1] || null) : (evals[0] || null);

  const [data, setData] = React.useState(() => {
    if (existing) return JSON.parse(JSON.stringify(existing.categories || {}));
    const init = {};
    EVAL_CATEGORIES.forEach(c => {
      init[c.key] = { comment:'', items:{} };
      c.items.forEach(i => { init[c.key].items[i] = { score:null, comment:'' }; });
    });
    if (previous) {
      const prevOverall = overallAverage(previous);
      const prevPrev = evals[isEdit ? 2 : 1] || null;
      const prevPrevOverall = prevPrev ? overallAverage(prevPrev) : null;
      let suggestion = 3;
      if (prevOverall != null && prevPrevOverall != null) {
        const diff = prevOverall - prevPrevOverall;
        suggestion = Math.max(1, Math.min(5, Math.round(3 + diff * 2)));
      }
      init['積極性/成長力'].items['前回からの改善力'].score = suggestion;
      init['積極性/成長力'].items['前回からの改善力']._auto = true;
    }
    return init;
  });
  const [overallComment, setOverallComment] = React.useState(existing?.overallComment || '');
  const [saving, setSaving] = React.useState(false);

  function setScore(catKey, item, value) {
    setData(prev => ({ ...prev, [catKey]: { ...prev[catKey], items: { ...prev[catKey].items, [item]: { ...prev[catKey].items[item], score: value === '' ? null : Number(value) } } } }));
  }
  function setItemComment(catKey, item, value) {
    setData(prev => ({ ...prev, [catKey]: { ...prev[catKey], items: { ...prev[catKey].items, [item]: { ...prev[catKey].items[item], comment: value } } } }));
  }
  function setCatComment(catKey, value) {
    setData(prev => ({ ...prev, [catKey]: { ...prev[catKey], comment: value } }));
  }

  function resolveNAValues(rawCategories) {
    const resolved = JSON.parse(JSON.stringify(rawCategories));
    EVAL_CATEGORIES.forEach(cat => {
      cat.items.forEach(itemName => {
        const cell = resolved[cat.key].items[itemName];
        if (cell.score == null) {
          let found = null;
          for (const ev of evals) {
            const past = ev.categories?.[cat.key]?.items?.[itemName];
            if (past && typeof past.score === 'number' && !past.wasNA) { found = past.score; break; }
          }
          cell.score = found;
          cell.wasNA = true;
        } else {
          cell.wasNA = false;
        }
        delete cell._auto;
      });
    });
    return resolved;
  }

  async function handleSave() {
    setSaving(true);
    const resolved = resolveNAValues(data);
    const payload = {
      staffEmail: staff.email,
      staffName: staff.name || staff.email,
      evaluatorEmail: window._currentUser?.email || '',
      evaluatorName: window._currentUser?.name || '',
      categories: resolved,
      overallComment,
    };
    if (isEdit) await window.updateEvaluation(existing.id, payload);
    else await window.createEvaluation(payload);
    setSaving(false);
    onSaved();
  }

  return (
    <div className="card">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontSize:17, fontWeight:600, margin:0 }}>{isEdit ? '評価を編集' : '新規評価を作成'}</h2>
          <p style={{ fontSize:12, color:'var(--text2)', margin:'2px 0 0' }}>対象講師：{staff.name || staff.email}</p>
        </div>
        <span style={{ fontSize:11, color:'var(--text3)' }}>評価者：{window._currentUser?.name || window._currentUser?.email}（保存時の日時が記録されます）</span>
      </div>

      {EVAL_CATEGORIES.map(cat => (
        <details key={cat.key} style={{ border:'.5px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'10px 12px', marginBottom:10, background: CATEGORY_TINTS[cat.key] || 'transparent' }}>
          <summary style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', listStyle:'none', fontWeight:500, fontSize:14 }}>
            <span className="chev" style={{ fontSize:12, color:'var(--text3)' }}>▸</span>
            <span style={{ flex:1 }}>{cat.key}</span>
            <span style={{ fontSize:11, color:'var(--text3)', fontWeight:400 }}>{cat.items.length}項目</span>
          </summary>
          <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:14 }}>
            {cat.items.map(itemName => {
              const cell = data[cat.key].items[itemName];
              const prevCell = previous?.categories?.[cat.key]?.items?.[itemName];
              return (
                <div key={itemName}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontSize:13, width:150, flexShrink:0 }}>
                      {itemName}
                      {cell._auto && <span style={{ color:'var(--accent)', marginLeft:4, fontSize:11 }}>（自動提案）</span>}
                    </span>
                    <input type="text" placeholder="今回のコメントを入力" value={cell.comment} onChange={e => setItemComment(cat.key, itemName, e.target.value)} style={{ flex:1, minWidth:140 }} />
                    <select value={cell.score ?? ''} onChange={e => setScore(cat.key, itemName, e.target.value)} style={{ width:80, flexShrink:0 }}>
                      <option value="">N/A</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  {prevCell && <p style={{ fontSize:11, color:'var(--text3)', margin:'4px 0 0 158px' }}>前回：{prevCell.score ?? 'N/A'}{prevCell.comment ? `「${prevCell.comment}」` : ''}</p>}
                </div>
              );
            })}
            <div>
              <p style={{ fontSize:12, color:'var(--text2)', margin:'0 0 4px' }}>{cat.key}の総評コメント</p>
              <input type="text" placeholder="このカテゴリ全体へのコメントを入力" value={data[cat.key].comment} onChange={e => setCatComment(cat.key, e.target.value)} style={{ width:'100%' }} />
            </div>
          </div>
        </details>
      ))}

      <div style={{ marginBottom:16 }}>
        <p style={{ fontSize:13, color:'var(--text2)', margin:'0 0 6px' }}>総合コメント</p>
        <input type="text" placeholder="評価全体の総合コメントを入力" value={overallComment} onChange={e => setOverallComment(e.target.value)} style={{ width:'100%' }} />
      </div>

      <div style={{ display:'flex', gap:8 }}>
        <button className="btn btn-sm" onClick={onCancel} disabled={saving}>キャンセル</button>
        <button className="btn btn-primary" style={{ flex:1 }} onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '評価を保存'}</button>
      </div>
    </div>
  );
}

// 管理タブ（バニラJS側）からもコース一覧を参照できるよう公開
window.COURSE_LIST = COURSE_LIST;

window.mountEvaluationTab = function() {
  const el = document.getElementById('evaluation-root');
  if (!el) return;
  if (!el._root) el._root = ReactDOM.createRoot(el);
  el._root.render(<MyEvaluationPage />);
};
window.mountEvalManageTab = function(jumpToEmail) {
  const el = document.getElementById('eval-manage-root');
  if (!el) return;
  if (!el._root) el._root = ReactDOM.createRoot(el);
  el._root.render(<EvalManageListPage jumpToEmail={jumpToEmail} />);
};

function UnitListPage() {
  const myRole = window._currentUser?.role || '';
  const canManage = ['ul','operator','admin'].includes(myRole);
  const [units, setUnits] = React.useState(null);
  const [users, setUsers] = React.useState(null);
  const [newName, setNewName] = React.useState('');
  const [newLeader, setNewLeader] = React.useState('');
  const [newCourse, setNewCourse] = React.useState('');
  const [editingId, setEditingId] = React.useState(null);
  const [editName, setEditName] = React.useState('');
  const [editLeader, setEditLeader] = React.useState('');
  const [editCourse, setEditCourse] = React.useState('');
  const [filterCourse, setFilterCourse] = React.useState('');
  const [view, setView] = React.useState({ mode:'list' });

  const reload = React.useCallback(async () => {
    const [u, us] = await Promise.all([window.fetchAllUnits(), window.fetchAllUsers()]);
    setUnits(u); setUsers(us);
  }, []);
  React.useEffect(() => { reload(); }, [reload]);

  if (units === null || users === null) return <p style={{ fontSize:13, color:'var(--text2)' }}>読み込み中...</p>;

  const ulCandidates = users.filter(u => ['ul','sub_ul','operator','admin'].includes(u.role));
  const nameOf = (email) => users.find(u => u.email === email)?.name || email;
  const byLeader = {};
  units.forEach(u => { (byLeader[u.leaderEmail] = byLeader[u.leaderEmail] || []).push(u); });

  // ユニットごとのメンバー・準メンバーを集計（allowedUsersのunits配列から逆引き）
  const membersByUnit = {};
  users.forEach(u => {
    (u.units || []).forEach(a => {
      if (!membersByUnit[a.unit]) membersByUnit[a.unit] = { main: [], sub: [] };
      (a.isMain ? membersByUnit[a.unit].main : membersByUnit[a.unit].sub).push({ email:u.email, name:u.name||u.email });
    });
  });

  if (view.mode === 'detail') {
    const unit = units.find(u => u.id === view.unitId);
    if (!unit) return <p style={{ fontSize:13, color:'var(--text2)' }}>ユニットが見つかりません。</p>;
    return (
      <UnitDetailPage
        unit={unit} users={users} members={membersByUnit[unit.id] || { main:[], sub:[] }}
        canManage={canManage} nameOf={nameOf} setView={setView} onSaved={reload}
      />
    );
  }

  const visibleUnits = filterCourse ? units.filter(u => u.course === filterCourse) : units;

  async function addUnit() {
    if (!newName.trim() || !newLeader) return;
    await window.createUnit({ name: newName.trim(), leaderEmail: newLeader, course: newCourse || null });
    setNewName(''); setNewLeader(''); setNewCourse('');
    await reload();
  }
  async function saveEdit(id) {
    if (!editName.trim() || !editLeader) return;
    await window.updateUnit(id, { name: editName.trim(), leaderEmail: editLeader, course: editCourse || null });
    setEditingId(null);
    await reload();
  }
  async function removeUnit(id) {
    if (!confirm('このユニットを削除しますか？各講師の所属ユニット設定からも、このユニットへの参照が削除されます。')) return;
    const result = await window.cascadeDeleteUnit(id);
    if (result.errors.length) alert('一部の削除でエラーが発生しました:\n' + result.errors.join('\n'));
    await reload();
  }

  return (
    <div className="card">
      <div className="section-title">ユニット一覧</div>
      {canManage ? (
        <p style={{ fontSize:12, color:'var(--text3)', margin:'0 0 12px' }}>
          同じULを複数のユニットのリーダーに割り当てることで、掛け持ちを表現できます。
        </p>
      ) : (
        <p style={{ fontSize:12, color:'var(--text3)', margin:'0 0 12px' }}>
          同じチームに誰がアサインされているかを確認できます（作成・編集はユニットリーダー以上が行えます）。
        </p>
      )}

      {canManage && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12, alignItems:'center' }}>
          <input placeholder="新しいユニット名" value={newName} onChange={e => setNewName(e.target.value)} style={{ width:200 }} />
          <select value={newLeader} onChange={e => setNewLeader(e.target.value)} style={{ width:200 }}>
            <option value="">リーダーを選択</option>
            {ulCandidates.map(u => <option key={u.email} value={u.email}>{u.name || u.email}</option>)}
          </select>
          <select value={newCourse} onChange={e => setNewCourse(e.target.value)} style={{ width:230 }}>
            <option value="">コース：未設定</option>
            {COURSE_LIST.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={addUnit}>＋ユニットを追加</button>
        </div>
      )}

      <div style={{ marginBottom:12 }}>
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} style={{ width:230 }}>
          <option value="">コースで絞り込み：すべて</option>
          {COURSE_LIST.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
        </select>
      </div>

      <div style={{ overflowX:'auto', border:'.5px solid var(--border)', borderRadius:'var(--radius)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:820 }}>
          <thead>
            <tr style={{ background:'var(--bg2)' }}>
              <th style={thStyle}>ユニット名</th>
              <th style={thStyle}>コース</th>
              <th style={thStyle}>リーダー</th>
              <th style={thStyle}>メンバー</th>
              <th style={thStyle}>準メンバー</th>
              <th style={{ ...thStyle, width:110 }}></th>
            </tr>
          </thead>
          <tbody>
            {visibleUnits.map(u => {
              const courseInfo = COURSE_LIST.find(c => c.id === u.course);
              const members = membersByUnit[u.id] || { main:[], sub:[] };
              const isEditing = editingId === u.id;
              return (
                <tr key={u.id} style={{ borderTop:'.5px solid var(--border)' }}>
                  {isEditing ? (
                    <React.Fragment>
                      <td style={tdStyle}><input value={editName} onChange={e => setEditName(e.target.value)} style={{ width:140 }} /></td>
                      <td style={tdStyle}>
                        <select value={editCourse} onChange={e => setEditCourse(e.target.value)} style={{ width:210 }}>
                          <option value="">未設定</option>
                          {COURSE_LIST.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                        </select>
                      </td>
                      <td style={tdStyle}>
                        <select value={editLeader} onChange={e => setEditLeader(e.target.value)} style={{ width:190 }}>
                          {ulCandidates.map(c => <option key={c.email} value={c.email}>{c.name || c.email}</option>)}
                        </select>
                      </td>
                      <td style={tdStyle} colSpan={2}></td>
                      <td style={tdStyle}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-sm btn-primary" onClick={() => saveEdit(u.id)}>保存</button>
                          <button className="btn btn-sm" onClick={() => setEditingId(null)}>取消</button>
                        </div>
                      </td>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <td style={tdStyle}>
                        <a href="#" onClick={e => { e.preventDefault(); setView({ mode:'detail', unitId:u.id }); }} style={{ color:'var(--text)', textDecoration:'underline', fontWeight:500 }}>{u.name}</a>
                        {byLeader[u.leaderEmail].length > 1 && (
                          <span style={{ fontSize:10, color:'var(--accent)', marginLeft:6 }}>掛け持ち</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        {courseInfo ? (
                          <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <span style={{ width:8, height:8, borderRadius:'50%', background:courseInfo.color, flexShrink:0 }}></span>
                            <span style={{ color:'var(--text2)' }}>{courseInfo.id}</span>
                          </span>
                        ) : <span style={{ color:'var(--text3)' }}>未設定</span>}
                      </td>
                      <td style={{ ...tdStyle, color:'var(--text2)' }}>{nameOf(u.leaderEmail)}</td>
                      <td style={{ ...tdStyle, color:'var(--text2)' }}>{members.main.length ? members.main.map(m=>m.name).join('、') : <span style={{ color:'var(--text3)' }}>−</span>}</td>
                      <td style={{ ...tdStyle, color:'var(--text2)' }}>{members.sub.length ? members.sub.map(m=>m.name).join('、') : <span style={{ color:'var(--text3)' }}>−</span>}</td>
                      <td style={tdStyle}>
                        {canManage && (
                          <div style={{ display:'flex', gap:6 }}>
                            <button className="btn btn-sm" onClick={() => { setEditingId(u.id); setEditName(u.name); setEditLeader(u.leaderEmail); setEditCourse(u.course || ''); }}>編集</button>
                            <button className="btn btn-sm" onClick={() => removeUnit(u.id)}>削除</button>
                          </div>
                        )}
                      </td>
                    </React.Fragment>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!visibleUnits.length && <p style={{ fontSize:13, color:'var(--text2)', marginTop:10 }}>該当するユニットがありません。</p>}
    </div>
  );
}

function UnitDetailPage({ unit, users, members, canManage, nameOf, setView, onSaved }) {
  const [addEmail, setAddEmail] = React.useState('');
  const [addIsMain, setAddIsMain] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const memberEmails = new Set([...members.main, ...members.sub].map(m => m.email));
  const candidateUsers = users.filter(u => !memberEmails.has(u.email));

  async function addMember() {
    if (!addEmail) return;
    setSaving(true);
    const target = users.find(u => u.email === addEmail);
    const current = (target?.units || []).filter(a => a.unit !== unit.id);
    current.push({ unit: unit.id, isMain: addIsMain });
    await window.updateStaffUnits(addEmail, current);
    setSaving(false);
    setAddEmail('');
    await onSaved();
  }
  async function removeMember(email) {
    if (!confirm('このメンバーをユニットから外しますか？')) return;
    const target = users.find(u => u.email === email);
    const current = (target?.units || []).filter(a => a.unit !== unit.id);
    await window.updateStaffUnits(email, current);
    await onSaved();
  }
  function gotoEvaluation(email) {
    if (window.gotoStaffEvaluation) window.gotoStaffEvaluation(email);
  }

  function MemberRow({ m }) {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'.5px solid var(--border)' }}>
        <span style={{ flex:1, fontSize:13 }}>{m.name}</span>
        <button className="btn btn-sm" onClick={() => gotoEvaluation(m.email)}>評価を見る</button>
        {canManage && <button className="btn btn-sm btn-danger" onClick={() => removeMember(m.email)}>外す</button>}
      </div>
    );
  }

  return (
    <div className="card">
      <button className="btn btn-sm" onClick={() => setView({ mode:'list' })}>← 一覧に戻る</button>
      <h2 style={{ fontSize:18, fontWeight:600, margin:'8px 0 2px' }}>{unit.name}</h2>
      <p style={{ fontSize:12, color:'var(--text2)', margin:'0 0 16px' }}>リーダー：{nameOf(unit.leaderEmail)}</p>

      <p style={{ fontSize:12, color:'var(--text2)', margin:'0 0 8px', fontWeight:500 }}>メンバー</p>
      {members.main.length ? members.main.map(m => <MemberRow key={m.email} m={m} />) : <p style={{ fontSize:12, color:'var(--text3)' }}>まだいません</p>}

      <p style={{ fontSize:12, color:'var(--text2)', margin:'16px 0 8px', fontWeight:500 }}>準メンバー</p>
      {members.sub.length ? members.sub.map(m => <MemberRow key={m.email} m={m} />) : <p style={{ fontSize:12, color:'var(--text3)' }}>まだいません</p>}

      {canManage && (
        <div style={{ marginTop:16, padding:'12px', border:'.5px solid var(--border)', borderRadius:'var(--radius-sm)' }}>
          <p style={{ fontSize:13, fontWeight:500, margin:'0 0 8px' }}>＋メンバーを追加</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <select value={addEmail} onChange={e => setAddEmail(e.target.value)} style={{ width:200 }}>
              <option value="">講師を選択</option>
              {candidateUsers.map(u => <option key={u.email} value={u.email}>{u.name || u.email}</option>)}
            </select>
            <label style={{ display:'flex', alignItems:'center', gap:4, fontSize:13 }}>
              <input type="radio" checked={addIsMain} onChange={() => setAddIsMain(true)} /> メンバー
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:4, fontSize:13 }}>
              <input type="radio" checked={!addIsMain} onChange={() => setAddIsMain(false)} /> 準メンバー
            </label>
            <button className="btn btn-primary btn-sm" onClick={addMember} disabled={saving || !addEmail}>{saving ? '追加中...' : '追加'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
window.mountUnitListTab = function() {
  const el = document.getElementById('unit-list-root');
  if (!el) return;
  if (!el._root) el._root = ReactDOM.createRoot(el);
  el._root.render(<UnitListPage />);
};
