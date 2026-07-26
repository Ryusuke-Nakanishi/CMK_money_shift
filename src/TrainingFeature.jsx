import React from 'react';
import ReactDOM from 'react-dom/client';

// ── 研修機能 ──
// 研修項目は管理画面から自由に追加でき、項目ごとに「対象者条件」「記録できる役職」を設定できる。

const ROLE_KEYS = ['trainee','instructor','sub_ul','ul','operator','admin'];
const roleLabel = (r) => window.ROLES?.[r]?.label || r;

// その講師がこの研修項目の対象かどうかを判定する
// 役職・担当コース・所属ユニットの条件は「すべて満たす」必要があり、
// それとは別に個別指定(targetExtraEmails)されている人も対象に含める
function isTargetOf(item, user) {
  if ((item.targetExtraEmails || []).includes(user.email)) return true;
  const roles = item.targetRoles || [];
  const courses = item.targetCourses || [];
  const units = item.targetUnits || [];
  if (!roles.length && !courses.length && !units.length) return false;
  if (roles.length && !roles.includes(user.role)) return false;
  if (courses.length && !(user.courses || []).some(c => courses.includes(c.course))) return false;
  if (units.length && !(user.units || []).some(a => units.includes(a.unit))) return false;
  return true;
}

// ある講師のある研修項目における状態を返す
function statusOf(records, itemId, email) {
  const mine = records.filter(r => r.itemId === itemId && r.staffEmail === email);
  if (!mine.length) return { state:'none', attempts:0, records:[] };
  const sorted = mine.slice().sort((a,b) => (b.date||'').localeCompare(a.date||''));
  if (mine.some(r => r.result === 'pass')) return { state:'pass', attempts:mine.length, records:sorted };
  return { state:'trying', attempts:mine.length, records:sorted };
}

const STATE_STYLE = {
  pass:   { label:'合格',   bg:'var(--success-bg)', color:'var(--success-text)' },
  trying: { label:'挑戦中', bg:'var(--warning-bg)', color:'var(--warning-text)' },
  none:   { label:'未受講', bg:'var(--bg2)',        color:'var(--text3)' },
};

function StatusBadge({ state }) {
  const s = STATE_STYLE[state] || STATE_STYLE.none;
  return <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:s.bg, color:s.color, whiteSpace:'nowrap' }}>{s.label}</span>;
}

// ── 研修タブ（全員共通・自分の進捗を見る） ──
function MyTrainingPage() {
  const [items, setItems] = React.useState(null);
  const [records, setRecords] = React.useState([]);
  const [sessions, setSessions] = React.useState([]);
  const [respondingId, setRespondingId] = React.useState(null);

  const reload = React.useCallback(() => {
    const email = window._currentUser?.email;
    if (!email) { setItems([]); return; }
    Promise.all([window.fetchTrainingItems(), window.fetchTrainingRecordsForStaff(email), window.fetchTrainingSessions()])
      .then(([its, recs, sess]) => {
        setItems(its); setRecords(recs);
        setSessions(sess.filter(s => s.status === '調整中' && (s.targetEmails||[]).includes(email)));
      })
      .catch(e => { console.warn('研修情報の取得に失敗', e); setItems([]); });
  }, []);
  React.useEffect(() => { reload(); }, [reload]);

  if (items === null) return <p style={{ fontSize:13, color:'var(--text2)' }}>読み込み中...</p>;

  const me = window._currentUser || {};
  const myItems = items.filter(it => isTargetOf(it, me));

  async function respond(sessionId, candidateId) {
    setRespondingId(sessionId);
    await window.respondToTrainingSession(sessionId, me.email, candidateId);
    setRespondingId(null);
    reload();
  }

  return (
    <div className="card">
      <div className="section-title">研修</div>

      {sessions.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:12, color:'var(--text2)', margin:'0 0 8px', fontWeight:500 }}>日程調整のお願い</p>
          {sessions.map(s => {
            const key = window.escapeEmail(me.email);
            const myChoice = (s.assignments||{})[key] || (s.responses||{})[key]?.candidateId;
            return (
              <div key={s.id} style={{ border:'.5px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'10px 12px', marginBottom:8 }}>
                <p style={{ fontSize:13, fontWeight:500, margin:'0 0 8px' }}>{s.itemName}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {s.candidates.map(c => (
                    <button
                      key={c.id}
                      className="btn btn-sm"
                      onClick={() => respond(s.id, c.id)}
                      disabled={respondingId === s.id}
                      style={myChoice === c.id ? { background:'var(--accent)', color:'var(--accent-text)' } : {}}
                    >
                      {myChoice === c.id ? '✓ ' : ''}{c.date} {c.start}-{c.end}
                    </button>
                  ))}
                </div>
                {!myChoice && <p style={{ fontSize:11, color:'var(--text3)', margin:'8px 0 0' }}>ご都合の良い日程を選んでください</p>}
              </div>
            );
          })}
        </div>
      )}

      {!myItems.length ? (
        <p style={{ fontSize:13, color:'var(--text2)' }}>現在、受講対象の研修はありません。</p>
      ) : (
        <div>
          {myItems.map(it => {
            const st = statusOf(records, it.id, me.email);
            return (
              <details key={it.id} style={{ borderBottom:'.5px solid var(--border)' }}>
                <summary style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', cursor:'pointer', fontSize:13, listStyle:'none' }}>
                  <span className="chev" style={{ fontSize:12, color:'var(--text3)' }}>▸</span>
                  <span style={{ flex:1 }}>
                    {it.name}
                    {it.isRequiredForPromotion && <span style={{ fontSize:10, color:'var(--text3)', marginLeft:6 }}>（昇格必須）</span>}
                  </span>
                  {st.attempts > 1 && <span style={{ fontSize:10, color:'var(--text3)' }}>{st.attempts}回受講</span>}
                  <StatusBadge state={st.state} />
                </summary>
                <div style={{ padding:'4px 0 12px 22px' }}>
                  {!st.records.length ? (
                    <p style={{ fontSize:12, color:'var(--text3)', margin:0 }}>まだ記録がありません</p>
                  ) : st.records.map(r => (
                    <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 0', fontSize:12, color:'var(--text2)' }}>
                      <span style={{ width:90 }}>{r.date || '日付なし'}</span>
                      <span style={{ width:44 }}>{r.attended ? '出席' : '欠席'}</span>
                      <span style={{ width:44 }}>{r.result === 'pass' ? '合格' : r.result === 'fail' ? '不合格' : '—'}</span>
                      {r.memo && <span style={{ flex:1, color:'var(--text3)' }}>{r.memo}</span>}
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── 研修マトリクス（講師 × 研修項目の一覧表。対象外はグレーで「―」表示） ──
function TrainingMatrix({ items, records, users, canRecordItem, onSaved }) {
  const [editing, setEditing] = React.useState(null); // {item, staff}
  if (!items.length) return <p style={{ fontSize:12, color:'var(--text3)' }}>まだ研修項目が登録されていません</p>;
  const thStyleM = { textAlign:'left', fontSize:11, color:'var(--text2)', fontWeight:500, padding:'8px', whiteSpace:'nowrap' };
  const tdStyleM = { fontSize:12, padding:'8px', whiteSpace:'nowrap' };
  return (
    <div>
      <div style={{ overflowX:'auto', border:'.5px solid var(--border)', borderRadius:'var(--radius)' }}>
        <table style={{ borderCollapse:'collapse', minWidth: 160 + items.length * 110 }}>
          <thead>
            <tr style={{ background:'var(--bg2)' }}>
              <th style={{ ...thStyleM, position:'sticky', left:0, background:'var(--bg2)', zIndex:1 }}>名前</th>
              {items.map(it => <th key={it.id} style={{ ...thStyleM, textAlign:'center' }}>{it.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.email} style={{ borderTop:'.5px solid var(--border)' }}>
                <td style={{ ...tdStyleM, position:'sticky', left:0, background:'var(--bg)', fontWeight:500 }}>{u.name || u.email}</td>
                {items.map(it => {
                  if (!isTargetOf(it, u)) {
                    return <td key={it.id} style={{ ...tdStyleM, textAlign:'center', background:'var(--bg2)', color:'var(--text3)' }}>―</td>;
                  }
                  const st = statusOf(records, it.id, u.email);
                  const clickable = canRecordItem && canRecordItem(it);
                  return (
                    <td
                      key={it.id}
                      onClick={() => clickable && setEditing({ item:it, staff:u })}
                      style={{ ...tdStyleM, textAlign:'center', cursor: clickable ? 'pointer' : 'default' }}
                      title={clickable ? 'クリックして記録を追加' : ''}
                    >
                      <StatusBadge state={st.state} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>セルをクリックすると、その場で記録を追加できます（記録権限がある項目のみ）</p>

      {editing && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={e => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div style={{ background:'var(--bg)', borderRadius:'var(--radius)', padding:16, width:'100%', maxWidth:420, maxHeight:'85vh', overflowY:'auto' }}>
            <p style={{ fontSize:13, color:'var(--text2)', margin:'0 0 4px' }}>{editing.staff.name || editing.staff.email}</p>
            <TrainingRecordForm
              item={editing.item} staff={editing.staff} existing={null}
              onCancel={() => setEditing(null)}
              onSaved={async () => { setEditing(null); await onSaved(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── 研修項目の追加・編集フォーム ──
function TrainingItemForm({ existing, users, units, onCancel, onSaved }) {
  const [name, setName] = React.useState(existing?.name || '');
  const [isRequired, setIsRequired] = React.useState(!!existing?.isRequiredForPromotion);
  const [recorderRole, setRecorderRole] = React.useState(existing?.recorderRole || 'sub_ul');
  const [targetRoles, setTargetRoles] = React.useState(existing?.targetRoles || []);
  const [targetCourses, setTargetCourses] = React.useState(existing?.targetCourses || []);
  const [targetUnits, setTargetUnits] = React.useState(existing?.targetUnits || []);
  const [extraEmails, setExtraEmails] = React.useState(existing?.targetExtraEmails || []);
  const [order, setOrder] = React.useState(existing?.order != null ? String(existing.order) : '');
  const [saving, setSaving] = React.useState(false);

  function toggle(list, setList, value) {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      isRequiredForPromotion: isRequired,
      recorderRole,
      targetRoles, targetCourses, targetUnits,
      targetExtraEmails: extraEmails,
      order: Number(order) || 99,
    };
    if (existing) await window.updateTrainingItem(existing.id, payload);
    else await window.createTrainingItem(payload);
    setSaving(false);
    onSaved();
  }

  const chk = { width:16, height:16 };
  const labelStyle = { display:'flex', alignItems:'center', gap:6, fontSize:13, marginRight:12, marginBottom:6 };

  return (
    <div className="card">
      <h2 style={{ fontSize:17, fontWeight:600, margin:'0 0 12px' }}>{existing ? '研修項目を編集' : '研修項目を追加'}</h2>

      <div className="form-group" style={{ marginBottom:12 }}>
        <label>研修名</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="例: オリエンテーション" />
      </div>

      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:12 }}>
        <div className="form-group" style={{ width:180 }}>
          <label>記録できる役職</label>
          <select value={recorderRole} onChange={e => setRecorderRole(e.target.value)}>
            <option value="sub_ul">準ユニットリーダー以上</option>
            <option value="ul">ユニットリーダー以上</option>
          </select>
        </div>
        <div className="form-group" style={{ width:120 }}>
          <label>表示順</label>
          <input type="number" min="1" value={order} onChange={e => setOrder(e.target.value)} placeholder="1" />
        </div>
      </div>

      <label style={{ ...labelStyle, marginBottom:16 }}>
        <input type="checkbox" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} style={chk} />
        研修生から講師への昇格に必須の研修にする
      </label>

      <div style={{ padding:'12px', border:'.5px solid var(--border)', borderRadius:'var(--radius-sm)', marginBottom:12 }}>
        <p style={{ fontSize:13, fontWeight:500, margin:'0 0 4px' }}>対象者の条件</p>
        <p style={{ fontSize:11, color:'var(--text3)', margin:'0 0 10px' }}>
          役職・コース・ユニットを指定した場合、その<b>すべてを満たす人</b>が対象になります。何も指定しない場合、下の個別指定のみが対象です。
        </p>

        <p style={{ fontSize:12, color:'var(--text2)', margin:'0 0 4px' }}>役職</p>
        <div style={{ display:'flex', flexWrap:'wrap', marginBottom:10 }}>
          {ROLE_KEYS.map(r => (
            <label key={r} style={labelStyle}>
              <input type="checkbox" checked={targetRoles.includes(r)} onChange={() => toggle(targetRoles, setTargetRoles, r)} style={chk} />
              {roleLabel(r)}
            </label>
          ))}
        </div>

        <p style={{ fontSize:12, color:'var(--text2)', margin:'0 0 4px' }}>担当コース</p>
        <div style={{ display:'flex', flexWrap:'wrap', marginBottom:10 }}>
          {(window.COURSE_LIST || []).map(c => (
            <label key={c.id} style={labelStyle}>
              <input type="checkbox" checked={targetCourses.includes(c.id)} onChange={() => toggle(targetCourses, setTargetCourses, c.id)} style={chk} />
              {c.id}
            </label>
          ))}
        </div>

        <p style={{ fontSize:12, color:'var(--text2)', margin:'0 0 4px' }}>所属ユニット</p>
        <div style={{ display:'flex', flexWrap:'wrap', marginBottom:10 }}>
          {!units.length && <span style={{ fontSize:12, color:'var(--text3)' }}>ユニットが未登録です</span>}
          {units.map(u => (
            <label key={u.id} style={labelStyle}>
              <input type="checkbox" checked={targetUnits.includes(u.id)} onChange={() => toggle(targetUnits, setTargetUnits, u.id)} style={chk} />
              {u.name}
            </label>
          ))}
        </div>

        <p style={{ fontSize:12, color:'var(--text2)', margin:'0 0 4px' }}>個別に対象へ追加する人（条件に関係なく対象になります）</p>
        <div style={{ maxHeight:160, overflowY:'auto', border:'.5px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'8px' }}>
          {users.map(u => (
            <label key={u.email} style={{ ...labelStyle, marginBottom:4 }}>
              <input type="checkbox" checked={extraEmails.includes(u.email)} onChange={() => toggle(extraEmails, setExtraEmails, u.email)} style={chk} />
              {u.name || u.email}
              <span style={{ fontSize:10, color:'var(--text3)' }}>{roleLabel(u.role)}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:8 }}>
        <button className="btn btn-sm" onClick={onCancel} disabled={saving}>キャンセル</button>
        <button className="btn btn-primary" style={{ flex:1 }} onClick={handleSave} disabled={saving || !name.trim()}>
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}

// ── 研修記録の追加・編集フォーム ──
function TrainingRecordForm({ item, staff, existing, onCancel, onSaved }) {
  const [date, setDate] = React.useState(existing?.date || new Date().toISOString().slice(0,10));
  const [attended, setAttended] = React.useState(existing ? !!existing.attended : true);
  const [result, setResult] = React.useState(existing?.result || 'pending');
  const [memo, setMemo] = React.useState(existing?.memo || '');
  const [shiftStart, setShiftStart] = React.useState(existing?.shiftStart || '');
  const [shiftEnd, setShiftEnd] = React.useState(existing?.shiftEnd || '');
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    setSaving(true);
    const payload = {
      itemId: item.id, itemName: item.name,
      staffEmail: staff.email, staffName: staff.name || staff.email,
      date, attended, result, memo,
      shiftStart: shiftStart || null, shiftEnd: shiftEnd || null,
    };
    if (existing) await window.updateTrainingRecord(existing.id, payload);
    else await window.createTrainingRecord(payload);
    setSaving(false);
    onSaved();
  }

  return (
    <div style={{ padding:'12px', border:'.5px solid var(--border)', borderRadius:'var(--radius-sm)', marginTop:8 }}>
      <p style={{ fontSize:13, fontWeight:500, margin:'0 0 10px' }}>
        {existing ? '記録を編集' : '記録を追加'}：{item.name}
      </p>
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:10 }}>
        <div className="form-group" style={{ width:170 }}>
          <label>実施日</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="form-group" style={{ width:130 }}>
          <label>出欠</label>
          <select value={attended ? 'yes' : 'no'} onChange={e => setAttended(e.target.value === 'yes')}>
            <option value="yes">出席</option>
            <option value="no">欠席</option>
          </select>
        </div>
        <div className="form-group" style={{ width:130 }}>
          <label>合否</label>
          <select value={result} onChange={e => setResult(e.target.value)}>
            <option value="pending">保留</option>
            <option value="pass">合格</option>
            <option value="fail">不合格</option>
          </select>
        </div>
      </div>
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:10 }}>
        <div className="form-group" style={{ width:150 }}>
          <label>開始時刻（任意）</label>
          <input type="time" value={shiftStart} onChange={e => setShiftStart(e.target.value)} />
        </div>
        <div className="form-group" style={{ width:150 }}>
          <label>終了時刻（任意）</label>
          <input type="time" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)} />
        </div>
      </div>
      <p style={{ fontSize:11, color:'var(--text3)', margin:'0 0 10px' }}>
        出席かつ開始・終了時刻を入力すると、本人が次にアプリを開いた際、研修業務としてシフトに自動追加されます。
      </p>
      <div className="form-group" style={{ marginBottom:10 }}>
        <label>メモ（任意）</label>
        <input value={memo} onChange={e => setMemo(e.target.value)} placeholder="補足があれば入力" />
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button className="btn btn-sm" onClick={onCancel} disabled={saving}>キャンセル</button>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存'}</button>
      </div>
    </div>
  );
}

// ── 講師ごとの研修詳細ページ ──
function TrainingStaffDetail({ staff, items, records, users, canRecordItem, setView, onSaved }) {
  const [form, setForm] = React.useState(null); // {item, existing}

  const myItems = items.filter(it => isTargetOf(it, staff));

  async function removeRecord(id) {
    if (!confirm('この記録を削除しますか？')) return;
    await window.deleteTrainingRecord(id);
    await onSaved();
  }

  return (
    <div className="card">
      <button className="btn btn-sm" onClick={() => setView({ mode:'list' })}>← 一覧に戻る</button>
      <h2 style={{ fontSize:18, fontWeight:600, margin:'8px 0 2px' }}>{staff.name || staff.email}</h2>
      <p style={{ fontSize:12, color:'var(--text2)', margin:'0 0 16px' }}>{roleLabel(staff.role)}</p>

      {!myItems.length ? (
        <p style={{ fontSize:13, color:'var(--text2)' }}>この講師が対象の研修はありません。</p>
      ) : myItems.map(it => {
        const st = statusOf(records, it.id, staff.email);
        const canRecord = canRecordItem(it);
        return (
          <div key={it.id} style={{ borderBottom:'.5px solid var(--border)', padding:'10px 0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <span style={{ flex:1, fontSize:13, fontWeight:500 }}>
                {it.name}
                {it.isRequiredForPromotion && <span style={{ fontSize:10, color:'var(--text3)', marginLeft:6 }}>（昇格必須）</span>}
              </span>
              <StatusBadge state={st.state} />
              {canRecord && (
                <button className="btn btn-sm" onClick={() => setForm({ item:it, existing:null })}>＋記録を追加</button>
              )}
            </div>
            {st.records.map(r => (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0 6px 4px', fontSize:12, color:'var(--text2)', flexWrap:'wrap' }}>
                <span style={{ width:90 }}>{r.date || '日付なし'}</span>
                <span style={{ width:44 }}>{r.attended ? '出席' : '欠席'}</span>
                <span style={{ width:50 }}>{r.result === 'pass' ? '合格' : r.result === 'fail' ? '不合格' : '保留'}</span>
                {r.memo && <span style={{ flex:1, color:'var(--text3)' }}>{r.memo}</span>}
                {canRecord && (
                  <span style={{ display:'flex', gap:4 }}>
                    <button className="btn btn-sm" onClick={() => setForm({ item:it, existing:r })}>編集</button>
                    <button className="btn btn-sm btn-danger" onClick={() => removeRecord(r.id)}>削除</button>
                  </span>
                )}
              </div>
            ))}
            {form && form.item.id === it.id && (
              <TrainingRecordForm
                item={form.item} staff={staff} existing={form.existing}
                onCancel={() => setForm(null)}
                onSaved={async () => { setForm(null); await onSaved(); }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 研修管理タブ ──
function TrainingManagePage() {
  const [items, setItems] = React.useState(null);
  const [records, setRecords] = React.useState(null);
  const [users, setUsers] = React.useState(null);
  const [units, setUnits] = React.useState([]);
  const [sessions, setSessions] = React.useState([]);
  const [view, setView] = React.useState({ mode:'list' });
  const [search, setSearch] = React.useState('');
  const [filterItem, setFilterItem] = React.useState('');
  const [filterState, setFilterState] = React.useState('');

  const myRole = window._currentUser?.role || '';
  const roleRank = { trainee:1, instructor:2, sub_ul:3, ul:4, operator:5, admin:6 };
  const myRank = roleRank[myRole] || 0;
  // 項目ごとに設定された「記録できる役職」を満たしているか
  const canRecordItem = (item) => myRank >= (roleRank[item.recorderRole || 'sub_ul'] || 3);
  const canManageItems = ['ul','operator','admin'].includes(myRole);

  const reload = React.useCallback(async (keepView) => {
    const [its, recs, us, uns, sess] = await Promise.all([
      window.fetchTrainingItems(), window.fetchAllTrainingRecords(),
      window.fetchAllUsers(), window.fetchAllUnits(), window.fetchTrainingSessions(),
    ]);
    setItems(its); setRecords(recs); setUsers(us); setUnits(uns); setSessions(sess);
    if (keepView && view.mode === 'session') {
      const updated = sess.find(s => s.id === view.sessionId);
      if (updated) setView({ mode:'session', sessionId:updated.id });
    }
  }, [view]);
  React.useEffect(() => { reload(); }, []);

  if (items === null || records === null || users === null) {
    return <p style={{ fontSize:13, color:'var(--text2)' }}>読み込み中...</p>;
  }

  if (view.mode === 'itemForm') {
    return (
      <TrainingItemForm
        existing={view.existing || null} users={users} units={units}
        onCancel={() => setView({ mode:'list' })}
        onSaved={async () => { await reload(); setView({ mode:'list' }); }}
      />
    );
  }
  if (view.mode === 'sessionForm') {
    return (
      <TrainingSessionForm
        items={items} users={users}
        onCancel={() => setView({ mode:'list' })}
        onSaved={async () => { await reload(); setView({ mode:'list' }); }}
      />
    );
  }
  if (view.mode === 'session') {
    const session = sessions.find(s => s.id === view.sessionId);
    if (!session) return <p style={{ fontSize:13, color:'var(--text2)' }}>セッションが見つかりません。</p>;
    return (
      <TrainingSessionTable
        session={session} users={users}
        onCancel={() => setView({ mode:'list' })}
        onSaved={(keep) => reload(keep)}
      />
    );
  }
  if (view.mode === 'staff') {
    const staff = users.find(u => u.email === view.email);
    if (!staff) return <p style={{ fontSize:13, color:'var(--text2)' }}>講師が見つかりません。</p>;
    return (
      <TrainingStaffDetail
        staff={staff} items={items} records={records} users={users}
        canRecordItem={canRecordItem} setView={setView} onSaved={reload}
      />
    );
  }

  async function removeItem(item) {
    if (!confirm(`研修項目「${item.name}」を削除しますか？\nこの研修に関する全員の記録もまとめて削除されます。`)) return;
    const res = await window.cascadeDeleteTrainingItem(item.id);
    if (res.errors.length) alert(res.errors.join('\n'));
    else alert(`削除しました（記録${res.recordsDeleted}件も削除）`);
    await reload();
  }

  // 一覧の行を組み立て（対象者が1件以上ある講師のみ表示）
  let rows = users.map(u => {
    const myItems = items.filter(it => isTargetOf(it, u));
    const statuses = myItems.map(it => ({ item:it, st:statusOf(records, it.id, u.email) }));
    const requiredItems = statuses.filter(s => s.item.isRequiredForPromotion);
    const allRequiredPassed = requiredItems.length > 0 && requiredItems.every(s => s.st.state === 'pass');
    return { user:u, statuses, passedCount: statuses.filter(s => s.st.state === 'pass').length, allRequiredPassed };
  }).filter(r => r.statuses.length > 0);

  if (search) rows = rows.filter(r => (r.user.name || r.user.email || '').includes(search));
  if (filterItem) {
    rows = rows.filter(r => {
      const found = r.statuses.find(s => s.item.id === filterItem);
      if (!found) return false;
      return !filterState || found.st.state === filterState;
    });
  }

  return (
    <div className="card">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, flexWrap:'wrap', gap:8 }}>
        <div className="section-title" style={{ marginBottom:0 }}>研修管理</div>
        {canManageItems && (
          <button className="btn btn-sm" onClick={() => setView({ mode:'itemForm', existing:null })}>＋研修項目を追加</button>
        )}
      </div>

      {/* 研修項目の一覧・編集 */}
      <details style={{ border:'.5px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'10px 12px', marginBottom:14 }}>
        <summary style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', listStyle:'none', fontWeight:500, fontSize:14 }}>
          <span className="chev" style={{ fontSize:12, color:'var(--text3)' }}>▸</span>
          <span style={{ flex:1 }}>研修項目の設定</span>
          <span style={{ fontSize:11, color:'var(--text3)', fontWeight:400 }}>{items.length}件</span>
        </summary>
        <div style={{ marginTop:10 }}>
          {!items.length && <p style={{ fontSize:12, color:'var(--text3)' }}>まだ研修項目が登録されていません</p>}
          {items.map(it => (
            <div key={it.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'.5px solid var(--border)', flexWrap:'wrap' }}>
              <span style={{ flex:1, fontSize:13 }}>
                {it.name}
                {it.isRequiredForPromotion && <span style={{ fontSize:10, color:'var(--accent)', marginLeft:6 }}>昇格必須</span>}
              </span>
              <span style={{ fontSize:10, color:'var(--text3)' }}>記録：{it.recorderRole === 'ul' ? 'UL以上' : '準UL以上'}</span>
              {canManageItems && (
                <span style={{ display:'flex', gap:4 }}>
                  <button className="btn btn-sm" onClick={() => setView({ mode:'itemForm', existing:it })}>編集</button>
                  <button className="btn btn-sm btn-danger" onClick={() => removeItem(it)}>削除</button>
                </span>
              )}
            </div>
          ))}
        </div>
      </details>

      {/* 研修セッション（日程調整）の一覧 */}
      <details style={{ border:'.5px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'10px 12px', marginBottom:14 }}>
        <summary style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', listStyle:'none', fontWeight:500, fontSize:14 }}>
          <span className="chev" style={{ fontSize:12, color:'var(--text3)' }}>▸</span>
          <span style={{ flex:1 }}>研修セッション（日程調整）</span>
          <span style={{ fontSize:11, color:'var(--text3)', fontWeight:400 }}>{sessions.length}件</span>
        </summary>
        <div style={{ marginTop:10 }}>
          <button className="btn btn-sm" onClick={() => setView({ mode:'sessionForm' })} style={{ marginBottom:10 }} disabled={!items.length}>＋セッションを作成</button>
          {!items.length && <p style={{ fontSize:11, color:'var(--text3)' }}>先に研修項目を登録してください</p>}
          {!sessions.length ? (
            <p style={{ fontSize:12, color:'var(--text3)' }}>まだセッションがありません</p>
          ) : sessions.map(s => (
            <div key={s.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'.5px solid var(--border)', flexWrap:'wrap' }}>
              <span style={{ flex:1, fontSize:13 }}>{s.itemName}</span>
              <span style={{ fontSize:10, color: s.status === '確定' ? 'var(--success-text)' : 'var(--warning-text)' }}>{s.status}</span>
              <span style={{ fontSize:11, color:'var(--text3)' }}>対象{ (s.targetEmails||[]).length }名</span>
              <button className="btn btn-sm" onClick={() => setView({ mode:'session', sessionId:s.id })}>開く</button>
            </div>
          ))}
        </div>
      </details>

      {/* 研修マトリクス（講師 × 研修項目） */}
      <details style={{ border:'.5px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'10px 12px', marginBottom:14 }}>
        <summary style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', listStyle:'none', fontWeight:500, fontSize:14 }}>
          <span className="chev" style={{ fontSize:12, color:'var(--text3)' }}>▸</span>
          <span style={{ flex:1 }}>研修マトリクス（一覧表）</span>
        </summary>
        <div style={{ marginTop:10 }}>
          <TrainingMatrix items={items} records={records} users={users} canRecordItem={canRecordItem} onSaved={reload} />
        </div>
      </details>

      {/* フィルター */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12, alignItems:'center' }}>
        <input placeholder="名前で検索" value={search} onChange={e => setSearch(e.target.value)} style={{ width:160 }} />
        <select value={filterItem} onChange={e => setFilterItem(e.target.value)} style={{ width:200 }}>
          <option value="">研修項目：すべて</option>
          {items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
        </select>
        {filterItem && (
          <select value={filterState} onChange={e => setFilterState(e.target.value)} style={{ width:140 }}>
            <option value="">状態：すべて</option>
            <option value="pass">合格</option>
            <option value="trying">挑戦中</option>
            <option value="none">未受講</option>
          </select>
        )}
      </div>

      <div style={{ overflowX:'auto', border:'.5px solid var(--border)', borderRadius:'var(--radius)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:640 }}>
          <thead>
            <tr style={{ background:'var(--bg2)' }}>
              <th style={{ textAlign:'left', fontSize:11, color:'var(--text2)', fontWeight:500, padding:'8px' }}>名前</th>
              <th style={{ textAlign:'left', fontSize:11, color:'var(--text2)', fontWeight:500, padding:'8px' }}>役職</th>
              <th style={{ textAlign:'left', fontSize:11, color:'var(--text2)', fontWeight:500, padding:'8px' }}>研修の状況</th>
              <th style={{ textAlign:'center', fontSize:11, color:'var(--text2)', fontWeight:500, padding:'8px' }}>昇格条件</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.user.email} style={{ borderTop:'.5px solid var(--border)' }}>
                <td style={{ fontSize:12, padding:'8px' }}>
                  <a href="#" onClick={e => { e.preventDefault(); setView({ mode:'staff', email:r.user.email }); }} style={{ color:'var(--text)', textDecoration:'underline', fontWeight:500 }}>
                    {r.user.name || r.user.email}
                  </a>
                </td>
                <td style={{ fontSize:12, padding:'8px', color:'var(--text2)' }}>{roleLabel(r.user.role)}</td>
                <td style={{ fontSize:12, padding:'8px' }}>
                  <span style={{ color:'var(--text2)' }}>{r.passedCount}/{r.statuses.length} 合格</span>
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:4 }}>
                    {r.statuses.map(s => (
                      <span key={s.item.id} title={s.item.name} style={{ fontSize:10, padding:'1px 6px', borderRadius:20, background:(STATE_STYLE[s.st.state]||STATE_STYLE.none).bg, color:(STATE_STYLE[s.st.state]||STATE_STYLE.none).color }}>
                        {s.item.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ fontSize:12, padding:'8px', textAlign:'center' }}>
                  {r.allRequiredPassed
                    ? <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'var(--success-bg)', color:'var(--success-text)' }}>達成</span>
                    : <span style={{ color:'var(--text3)' }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <p style={{ fontSize:13, color:'var(--text2)', marginTop:10 }}>該当する講師がいません。</p>}
    </div>
  );
}

// ── 研修セッション（日程調整）の作成フォーム ──
function TrainingSessionForm({ items, users, onCancel, onSaved }) {
  const [itemId, setItemId] = React.useState(items[0]?.id || '');
  const [candidates, setCandidates] = React.useState([{ id:'c0', date:'', start:'', end:'' }]);
  const [targetEmails, setTargetEmails] = React.useState([]);
  const [saving, setSaving] = React.useState(false);

  const item = items.find(it => it.id === itemId);
  const helpers = window.__trainingHelpers;

  React.useEffect(() => {
    if (item && helpers) setTargetEmails(users.filter(u => helpers.isTargetOf(item, u)).map(u => u.email));
  }, [itemId]);

  function addCandidate() {
    setCandidates(cs => [...cs, { id:'c'+cs.length+'_'+Date.now(), date:'', start:'', end:'' }]);
  }
  function updateCandidate(id, field, value) {
    setCandidates(cs => cs.map(c => c.id === id ? { ...c, [field]: value } : c));
  }
  function removeCandidate(id) {
    setCandidates(cs => cs.filter(c => c.id !== id));
  }
  function toggleTarget(email) {
    setTargetEmails(list => list.includes(email) ? list.filter(e => e !== email) : [...list, email]);
  }

  async function handleSave() {
    if (!item || !candidates.some(c => c.date && c.start && c.end) || !targetEmails.length) return;
    setSaving(true);
    await window.createTrainingSession({
      itemId: item.id, itemName: item.name,
      candidates: candidates.filter(c => c.date && c.start && c.end),
      targetEmails,
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="card">
      <h2 style={{ fontSize:17, fontWeight:600, margin:'0 0 12px' }}>研修セッションを作成</h2>
      <div className="form-group" style={{ marginBottom:12, maxWidth:280 }}>
        <label>研修項目</label>
        <select value={itemId} onChange={e => setItemId(e.target.value)}>
          {items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
        </select>
      </div>

      <p style={{ fontSize:13, fontWeight:500, margin:'0 0 8px' }}>候補日程</p>
      {candidates.map(c => (
        <div key={c.id} style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'end', marginBottom:8 }}>
          <div className="form-group" style={{ width:160 }}>
            <label>日付</label>
            <input type="date" value={c.date} onChange={e => updateCandidate(c.id, 'date', e.target.value)} />
          </div>
          <div className="form-group" style={{ width:130 }}>
            <label>開始</label>
            <input type="time" value={c.start} onChange={e => updateCandidate(c.id, 'start', e.target.value)} />
          </div>
          <div className="form-group" style={{ width:130 }}>
            <label>終了</label>
            <input type="time" value={c.end} onChange={e => updateCandidate(c.id, 'end', e.target.value)} />
          </div>
          {candidates.length > 1 && <button className="btn btn-sm btn-danger" onClick={() => removeCandidate(c.id)}>×</button>}
        </div>
      ))}
      <button className="btn btn-sm" onClick={addCandidate} style={{ marginBottom:16 }}>＋候補日を追加</button>

      <p style={{ fontSize:13, fontWeight:500, margin:'0 0 8px' }}>対象者（研修項目の対象条件から自動選択。手動で調整できます）</p>
      <div style={{ maxHeight:200, overflowY:'auto', border:'.5px solid var(--border)', borderRadius:'var(--radius-sm)', padding:8, marginBottom:16 }}>
        {users.map(u => (
          <label key={u.email} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, marginBottom:4 }}>
            <input type="checkbox" checked={targetEmails.includes(u.email)} onChange={() => toggleTarget(u.email)} style={{ width:16, height:16 }} />
            {u.name || u.email}
          </label>
        ))}
      </div>

      <div style={{ display:'flex', gap:8 }}>
        <button className="btn btn-sm" onClick={onCancel} disabled={saving}>キャンセル</button>
        <button className="btn btn-primary" style={{ flex:1 }} onClick={handleSave} disabled={saving}>{saving ? '作成中...' : '作成'}</button>
      </div>
    </div>
  );
}

// ── 研修セッションの管理テーブル（対象者 × 候補日程） ──
function TrainingSessionTable({ session, users, onCancel, onSaved }) {
  const [confirming, setConfirming] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [addingTarget, setAddingTarget] = React.useState(false);
  const [newTargetEmail, setNewTargetEmail] = React.useState('');

  function nameOf(email) { return users.find(u => u.email === email)?.name || email; }
  function finalAssignmentOf(email) {
    const key = window.escapeEmail(email);
    return (session.assignments || {})[key] || (session.responses || {})[key]?.candidateId || null;
  }
  function isSelfResponse(email) {
    const key = window.escapeEmail(email);
    return !(session.assignments || {})[key] && !!(session.responses || {})[key]?.candidateId;
  }

  async function assign(email, candidateId) {
    await window.assignTrainingSession(session.id, email, candidateId);
    await onSaved(true);
  }
  async function handleConfirm() {
    if (!confirm('この内容で確定しますか？割り当てられた方の研修記録（保留状態）が作成されます。')) return;
    setConfirming(true);
    const res = await window.confirmTrainingSession(session.id);
    setConfirming(false);
    setResult(res);
    await onSaved();
  }
  async function handleDelete() {
    if (!confirm('このセッションを削除しますか？')) return;
    await window.deleteTrainingSession(session.id);
    onCancel();
  }
  async function addTarget() {
    if (!newTargetEmail) return;
    const updated = [...(session.targetEmails || []), newTargetEmail];
    await window.updateTrainingSession(session.id, { targetEmails: updated });
    setNewTargetEmail('');
    setAddingTarget(false);
    await onSaved(true);
  }
  async function removeTarget(email) {
    if (!confirm(`${nameOf(email)}さんをこのセッションの対象から外しますか？`)) return;
    const updated = (session.targetEmails || []).filter(e => e !== email);
    await window.updateTrainingSession(session.id, { targetEmails: updated });
    await onSaved(true);
  }

  const candidateUsers = users.filter(u => !(session.targetEmails || []).includes(u.email));

  const fmtCandidate = (c) => `${c.date} ${c.start}-${c.end}`;

  return (
    <div className="card">
      <button className="btn btn-sm" onClick={onCancel}>← 一覧に戻る</button>
      <h2 style={{ fontSize:17, fontWeight:600, margin:'8px 0 4px' }}>{session.itemName}</h2>
      <p style={{ fontSize:12, color:'var(--text2)', margin:'0 0 16px' }}>
        状態：{session.status === '確定' ? <span style={{ color:'var(--success-text)' }}>確定済み</span> : '調整中'}
      </p>

      {session.status !== '確定' && (
        <div style={{ marginBottom:16 }}>
          {!addingTarget ? (
            <button className="btn btn-sm" onClick={() => setAddingTarget(true)}>＋対象者を追加</button>
          ) : (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', padding:'10px 12px', border:'.5px solid var(--border)', borderRadius:'var(--radius-sm)' }}>
              <select value={newTargetEmail} onChange={e => setNewTargetEmail(e.target.value)} style={{ width:220 }}>
                <option value="">後から採用された方などを選択</option>
                {candidateUsers.map(u => <option key={u.email} value={u.email}>{u.name || u.email}</option>)}
              </select>
              <button className="btn btn-primary btn-sm" onClick={addTarget} disabled={!newTargetEmail}>追加</button>
              <button className="btn btn-sm" onClick={() => { setAddingTarget(false); setNewTargetEmail(''); }}>キャンセル</button>
              <p style={{ fontSize:11, color:'var(--text3)', width:'100%', margin:0 }}>
                追加された方は、次に「研修」タブを開いた時に候補日を選べるようになります
              </p>
            </div>
          )}
        </div>
      )}

      <div style={{ overflowX:'auto', border:'.5px solid var(--border)', borderRadius:'var(--radius)', marginBottom:16 }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 + session.candidates.length * 120 }}>
          <thead>
            <tr style={{ background:'var(--bg2)' }}>
              <th style={{ textAlign:'left', fontSize:11, color:'var(--text2)', padding:8 }}>対象者</th>
              {session.candidates.map(c => (
                <th key={c.id} style={{ textAlign:'center', fontSize:11, color:'var(--text2)', padding:8, whiteSpace:'nowrap' }}>{fmtCandidate(c)}</th>
              ))}
              {session.status !== '確定' && <th style={{ padding:8 }}></th>}
            </tr>
          </thead>
          <tbody>
            {(session.targetEmails || []).map(email => {
              const finalId = finalAssignmentOf(email);
              return (
                <tr key={email} style={{ borderTop:'.5px solid var(--border)' }}>
                  <td style={{ fontSize:12, padding:8 }}>
                    {nameOf(email)}
                    {finalId && isSelfResponse(email) && <span style={{ fontSize:10, color:'var(--text3)', marginLeft:6 }}>（本人選択）</span>}
                  </td>
                  {session.candidates.map(c => (
                    <td key={c.id} style={{ textAlign:'center', padding:8 }}>
                      <button
                        className="btn btn-sm"
                        onClick={() => assign(email, c.id)}
                        disabled={session.status === '確定'}
                        style={finalId === c.id ? { background:'var(--accent)', color:'var(--accent-text)' } : {}}
                      >
                        {finalId === c.id ? '✓' : '選択'}
                      </button>
                    </td>
                  ))}
                  {session.status !== '確定' && (
                    <td style={{ textAlign:'center', padding:8 }}>
                      <button className="btn btn-sm btn-danger" onClick={() => removeTarget(email)}>外す</button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {session.status !== '確定' && (
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>セッションを削除</button>
          <button className="btn btn-primary btn-sm" onClick={handleConfirm} disabled={confirming}>{confirming ? '確定中...' : 'この内容で確定する'}</button>
        </div>
      )}
      {result && (
        <p style={{ fontSize:12, color: result.errors.length ? 'var(--danger-text)' : 'var(--success-text)', marginTop:10 }}>
          {result.errors.length ? result.errors.join(' / ') : `確定しました（${result.created}件の研修記録を作成）`}
        </p>
      )}
    </div>
  );
}

window.mountTrainingTab = function() {
  const el = document.getElementById('training-root');
  if (!el) return;
  if (!el._root) el._root = ReactDOM.createRoot(el);
  el._root.render(<MyTrainingPage />);
};
window.mountTrainingManageTab = function() {
  const el = document.getElementById('training-manage-root');
  if (!el) return;
  if (!el._root) el._root = ReactDOM.createRoot(el);
  el._root.render(<TrainingManagePage />);
};

// 研修の出席記録をもとに、本人のシフトへ自動追加する処理から参照できるよう公開
window.__trainingHelpers = { isTargetOf, statusOf };
