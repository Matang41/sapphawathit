/* ============================================================
   missions.js — รุ่น 3.31: ภารกิจที่ได้รับมอบหมาย + แต้มเลื่อนยศ (ต่อยอดระดับฝีมือ Lv. เดิม)
   • ครูมอบภารกิจรายคน/หลายคน กำหนดช่วงวัน ความยาก แต้ม และเป้าหมายย่อย
   • นักเรียนติ๊กเป้าหมายย่อย แนบบันทึก/ลิงก์ แล้วกด “ส่งให้ครูตรวจ”
   • ครูประเมินความคืบหน้า (%) · สำเร็จ → ได้แต้มเข้าหลอดของเครื่องดนตรีนั้น
   • หลอดเต็ม → ขึ้นเตือนให้ครูประเมิน · ครูกดเลื่อนยศเอง หรือ “สถาปนายศ” ได้ทุกเมื่อ
   • ทุกครั้งที่เลื่อนยศ: ประกาศเกียรติคุณบนหน้าหลัก + แจ้งเตือนทั้งชมรม
   ข้อมูล: mis/{mid} (ภารกิจ · ครูเขียน) · misp/{mid}/{sid} (ผลรายคน · ครูเขียน, นักเรียนเขียนได้เฉพาะ s/)
           skills/{sid}/{เครื่อง}/xp = แต้มในหลอด · pAt = เวลาเลื่อนยศครั้งล่าสุด · config/xpMax = แต้มเต็มหลอด
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP;
  const { $, esc, toast, modal } = M; const { ic, chip, fld, opt } = A;
  A.ICON.flag = '<path d="M5 21V4"/><path d="M5 4h12l-2.5 4L17 12H5"/>';
  const st = document.createElement('style');
  st.textContent = '.ms-bar{height:10px;border-radius:6px;background:#efe6ec;overflow:hidden}.ms-bar i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#f2c14e,#e0782f)}' +
    '.ms-pg .ms-bar i{background:linear-gradient(90deg,#8fd18f,#2e9d57)}.ms-xp{margin:8px 0}.ms-xph{display:flex;gap:6px;align-items:baseline;font-size:.85rem;margin-bottom:3px;flex-wrap:wrap}.ms-xph .grow{flex:1}' +
    '.ms-full{font-size:.8rem;color:#b5561d;font-weight:700;margin-top:3px}.ms-star{color:#e0a800;letter-spacing:1px;white-space:nowrap}' +
    '.ms-ppl{display:grid;gap:10px}.ms-p{border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:#fff}.ms-p .hd{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.ms-p .hd b{flex:1}' +
    '.ms-pgb{display:flex;gap:4px;flex-wrap:wrap;margin:8px 0}.ms-pgb button{flex:1 1 44px;border:1px solid var(--line);background:#fff;border-radius:8px;padding:6px 0;font:inherit;font-size:.82rem;cursor:pointer}.ms-pgb button.on{background:var(--plum);color:#fff;border-color:var(--plum)}' +
    '.ms-steps label{display:flex;gap:8px;align-items:center;padding:7px 0;border-top:1px dashed var(--line)}.ms-steps label:first-child{border-top:0}.ms-sv{font-size:.85rem;color:var(--mut);margin-top:6px;white-space:pre-wrap;word-break:break-word}' +
    '.ms-pick{max-height:280px;overflow:auto;border:1px solid var(--line);border-radius:10px;padding:4px 8px}.ms-pick label{display:flex;gap:8px;align-items:center;padding:5px 0;font-size:.9rem;border-top:1px dashed var(--line)}.ms-pick label:first-child{border-top:0}.ms-pick small{color:var(--mut)}' +
    '.ms-qb{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.ms-qb button{font:inherit;font-size:.8rem;padding:4px 10px;border-radius:999px;border:1px solid var(--line);background:#fff;cursor:pointer}' +
    '.ms-cele{text-align:center}.ms-cele .big{font-size:3.2rem;line-height:1.2}.ms-cele b{font-size:1.25rem;color:var(--plum)}.ms-days{font-size:.8rem;font-weight:700}.ms-days.bad{color:#c0392b}.ms-act{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.ms-act .btn{flex:1 1 120px}';
  document.head.appendChild(st);

  const T = () => A.teacher(), me = () => A.sid(), cid = () => M.C.club.id;
  const CP = () => '/c/' + cid() + '/';
  const CAT = { song: 'ฝึกเพลง', skill: 'ฝีมือเครื่องดนตรี', club: 'งานชมรม', serve: 'จิตอาสา/บริการ', other: 'อื่น ๆ', redeem: 'บำเพ็ญประโยชน์ไถ่โทษ' };
  const XPD = { 1: 10, 2: 20, 3: 40 };
  const ms = () => A.members();
  const nm = s => ms()[s] ? A.fullName(ms()[s]) : s;

  A.SUBS.push({ key: 'mis', path: () => CP() + 'mis' });
  const all = () => Object.keys(A.D.mis || {}).map(id => Object.assign({ id }, A.D.mis[id])).sort((a, b) => (b.at || 0) - (a.at || 0));
  const one = id => { const m = (A.D.mis || {})[id]; return m ? Object.assign({ id }, m) : null; };
  const who = m => Object.keys(m.who || {}).filter(s => ms()[s]);
  const mine = () => me() ? all().filter(m => (m.who || {})[me()]) : [];
  const steps = m => (Array.isArray(m.steps) ? m.steps : Object.values(m.steps || {})).filter(Boolean);
  const stars = n => '<span class="ms-star">' + '★'.repeat(n || 1) + '<span style="opacity:.25">' + '★'.repeat(3 - (n || 1)) + '</span></span>';
  const daysLeft = m => m.to ? Math.ceil((new Date(m.to + 'T23:59:59').getTime() - Date.now()) / 864e5) : null;
  const dl = m => { const d = daysLeft(m); if (d == null) return ''; return '<span class="ms-days' + (d < 0 ? ' bad' : d <= 2 ? ' bad' : '') + '">' + (d < 0 ? 'เลยกำหนด ' + (-d) + ' วัน' : d === 0 ? 'วันสุดท้าย!' : 'เหลือ ' + d + ' วัน') + '</span>'; };
  const period = m => (m.from ? A.dTH(m.from, 'short') : '') + ' – ' + (m.to ? A.dTH(m.to, 'short') : '');

  /* ---------- ผลรายคน: ครูอ่านทั้งหมด · นักเรียนอ่านเฉพาะของตัวเองรายภารกิจ ---------- */
  let pkey = '', poff = null, PALL = null, POK = false; const PS = {};
  function P() {
    const key = cid() + '|' + (T() ? 'T' : me());
    if (key !== pkey) {
      if (poff) poff(); poff = null; Object.keys(PS).forEach(k => { try { PS[k].off(); } catch (e) { /* ignore */ } delete PS[k]; });
      PALL = null; POK = false; pkey = key;
      if (T()) poff = B.on(CP() + 'misp', v => { PALL = v || {}; POK = true; A.rerender(); }, e => { POK = true; PALL = {}; console.warn('misp', e && e.code); });
    }
    if (T()) return POK ? PALL : null;
    const o = {}; let ok = true;
    mine().forEach(m => {
      if (!PS[m.id]) { const s = PS[m.id] = { v: null, ok: 0 }; s.off = B.on(CP() + 'misp/' + m.id + '/' + me(), v => { s.v = v; s.ok = 1; A.rerender(); }, e => { s.ok = 1; console.warn('misp', e && e.code); }); }
      if (!PS[m.id].ok) ok = false; o[m.id] = PS[m.id].v ? { [me()]: PS[m.id].v } : {};
    });
    return ok ? o : null;
  }
  const recOf = (mid, sid) => (((P() || {})[mid] || {})[sid]) || {};
  const waiting = r => !r.st && r.s && r.s.sent && (!r.rv || r.s.sent > r.rv);
  function stOf(m, r) {
    if (r.st === 'done') return ['สำเร็จ', 'ok']; if (r.st === 'fail') return ['ไม่สำเร็จ', 'bad'];
    if (waiting(r)) return ['รอครูตรวจ', 'gold']; if (m.st === 'closed') return ['ปิดภารกิจแล้ว', 'line'];
    const d = daysLeft(m); if (d != null && d < 0) return ['เลยกำหนด', 'bad']; return ['กำลังทำ', 'plum'];
  }
  const pgBar = (v, lbl) => '<div class="ms-pg"><div class="ms-xph"><span>' + (lbl || 'ความคืบหน้า (ครูประเมิน)') + '</span><span class="grow"></span><b>' + (v || 0) + '%</b></div><div class="ms-bar"><i style="width:' + Math.max(0, Math.min(100, v || 0)) + '%"></i></div></div>';

  /* ---------- แต้มในหลอด (ต่อเครื่องดนตรี) ---------- */
  const XPMAX = () => Math.max(10, +(A.cfg().xpMax) || 100);
  const sk = (sid, inst) => (((A.D.skills || {})[sid] || {})[inst]) || {};
  const xpOf = (sid, inst) => Math.max(0, +sk(sid, inst).xp || 0);
  const mainInst = sid => A.insts(ms()[sid])[0] || '';
  const instFor = (m, sid) => { const L = A.insts(ms()[sid]); return m.inst && m.inst !== 'main' && L.includes(m.inst) ? m.inst : (m.inst && m.inst !== 'main' && !L.length ? m.inst : mainInst(sid)); };
  function xpBar(sid, inst) {
    if (inst && A.jailed(sid)) return '<div class="ms-xp"><div class="ms-xph"><b>' + esc(inst) + '</b><span class="muted">⛓️ พักยศ (จำตรุ) · ไม่ได้รับแต้มจนพ้นโทษ</span></div></div>';
    if (!inst) return '<div class="muted">ยังไม่มีเครื่องดนตรีในข้อมูลสมาชิก</div>';
    const x = xpOf(sid, inst), mx = XPMAX(), pc = Math.min(100, Math.round(x / mx * 100)), lv = A.lvOf(sid, inst), nx = A.levels()[lv || 0];
    return '<div class="ms-xp"><div class="ms-xph"><b>' + esc(inst) + '</b><span class="muted">' + esc(A.lvName(lv)) + '</span><span class="grow"></span><span>' + x + ' / ' + mx + ' แต้ม</span></div><div class="ms-bar"><i style="width:' + pc + '%"></i></div>' +
      (x >= mx ? '<div class="ms-full">🔥 หลอดเต็มแล้ว — รอครูประเมินเลื่อนยศ</div>' : '') +
      (nx ? '<div class="muted" style="font-size:.8rem;margin-top:5px">🎯 เกณฑ์ยศถัดไป · Lv.' + (lv + 1) + ' ' + esc(nx.name || '') + (nx.desc ? ' — ' + esc(nx.desc) : '') + '</div>' : '') + '</div>';
  }
  function ready() {
    const out = [], mx = XPMAX();
    Object.keys(A.D.skills || {}).forEach(s => { if (!ms()[s] || ms()[s].status !== 'active') return; Object.keys(A.D.skills[s] || {}).forEach(i => { if (xpOf(s, i) >= mx) out.push({ sid: s, inst: i }); }); });
    return out;
  }
  const waitCount = () => { const p = P(); if (!p) return 0; let n = 0; all().filter(m => m.st !== 'closed').forEach(m => who(m).forEach(s => { if (waiting(((p[m.id] || {})[s]) || {})) n++; })); return n; };
  const myOpen = () => mine().filter(m => { const r = recOf(m.id, me()); return m.st !== 'closed' && !r.st; });

  /* ---------- เมนู · สิ่งที่ต้องทำ · หน้าหลัก ---------- */
  A.NAVS.push({ id: 'mis', label: 'ภารกิจ', icon: 'flag', order: 33, match: ['mi'], show: () => T() || mine().length > 0 || logOf(me()).length > 0, badge: () => T() ? waitCount() + ready().length : myOpen().length });
  A.TODO.push(() => {
    if (!T()) return null; const n = waitCount(), r = ready().length;
    return [n ? { n, label: 'ภารกิจที่นักเรียนส่งให้ตรวจ', href: '#/mis' } : null, r ? { n: r, label: 'หลอดแต้มเต็ม รอประเมินเลื่อนยศ', href: '#/mis', hot: true } : null];
  });
  A.HOME.push({ order: 14, html: () => {
    if (T() || !me()) return '';
    cele();
    const pb = probOf(me()), pbH = pb ? '<section class="card" style="border-left:4px solid #e0a800"><div class="lb">⚠️ อยู่ระหว่างทัณฑ์บน</div><div>ถึง ' + esc(A.dTH(pb.until, 'short')) + (pb.cond ? ' · ' + esc(pb.cond) : '') + '</div><a href="#/mis" class="muted" style="font-size:.85rem">ดูรายละเอียด →</a></section>' : '';
    const l = myOpen(); if (!l.length) return pbH;
    return pbH + '<section class="card"><div class="lb">' + ic('flag', 18) + ' ภารกิจของฉัน</div>' + l.map(m => { const r = recOf(m.id, me()), s = stOf(m, r);
      return '<a class="rowcard" href="#/mi/' + esc(m.id) + '" style="display:block;padding:8px 0;border-top:1px dashed var(--line)"><div class="row"><b class="grow">' + esc(m.t) + '</b>' + chip(s[0], s[1]) + '</div><div class="row" style="font-size:.82rem">' + stars(m.star) + '<span class="grow muted">+' + (m.xp || 0) + ' แต้ม</span>' + dl(m) + '</div>' + pgBar(r.pg) + '</a>'; }).join('') + '</section>';
  } });

  /* ฉลองเมื่อนักเรียนเปิดแอปหลังได้เลื่อนยศ (แสดงครั้งเดียวต่อการเลื่อน) */
  let celeDone = false;
  function cele() {
    if (celeDone || !me()) return; celeDone = true;
    const S = (A.D.skills || {})[me()] || {}; let best = null;
    Object.keys(S).forEach(i => { const p = S[i] && S[i].pAt; if (p && Date.now() - p < 14 * 864e5 && (!best || p > best.p)) best = { i, p, lv: S[i].lv }; });
    if (!best) return; const K = 'spw_cele_' + cid() + '_' + me(); let seen = 0; try { seen = +localStorage.getItem(K) || 0; } catch (e) { /* ignore */ }
    if (best.p <= seen) return; try { localStorage.setItem(K, String(best.p)); } catch (e) { /* ignore */ }
    setTimeout(() => modal('<div class="ms-cele"><div class="big">🎖️</div><h3>ยินดีด้วย!</h3><div>คุณได้รับการเลื่อนยศเป็น</div><b>' + esc(A.lvName(best.lv)) + '</b><div class="muted" style="margin:6px 0 14px">เครื่อง' + esc(best.i) + ' · ประกาศเกียรติคุณให้ทั้งชมรมรับรู้แล้ว</div><button class="btn gold block" data-close>ขอบคุณครับ/ค่ะ</button></div>', { center: true }), 600);
  }

  /* ---------- หน้า: รายการภารกิจ ---------- */
  const UI = { tab: 'open' };
  A.V.mis = function () {
    if (!T()) {
      const l = mine(); const ins = A.insts(ms()[me()]);
      let b = '<section class="card"><div class="lb">แต้มสะสมเพื่อเลื่อนยศ</div>' + (ins.length ? ins.map(i => xpBar(me(), i)).join('') : '<div class="muted">ยังไม่มีเครื่องดนตรีในข้อมูลของฉัน</div>') + '<div class="muted" style="font-size:.8rem">ทำภารกิจสำเร็จได้แต้มเข้าหลอด · หลอดเต็มแล้วครูจะประเมินเลื่อนยศ</div></section>';
      { const pb = probOf(me()), lg = logOf(me()); if (pb) b += '<div class="note bad">⚠️ คุณอยู่ระหว่างทัณฑ์บนถึง ' + esc(A.dTH(pb.until, 'short')) + (pb.cond ? ' — ' + esc(pb.cond) : '') + '</div>'; if (lg.length) b += '<details class="card"><summary class="lb" style="cursor:pointer;margin:0">ประวัติยศของฉัน (' + lg.length + ')</summary>' + lg.map(x => logRow(x)).join('') + '</details>'; }
      if (P() === null) return { title: 'ภารกิจของฉัน', body: b + '<div class="empty">กำลังโหลด…</div>' };
      b += l.map(m => { const r = recOf(m.id, me()), s = stOf(m, r);
        return '<a class="card rowcard" href="#/mi/' + esc(m.id) + '"><div class="grow"><b>' + esc(m.t) + '</b><div class="muted" style="font-size:.82rem">' + stars(m.star) + ' · ' + esc(CAT[m.cat] || '') + ' · ' + esc(period(m)) + ' · +' + (m.xp || 0) + ' แต้ม</div>' + (r.st ? '' : pgBar(r.pg)) + '</div>' + chip(s[0], s[1]) + '</a>'; }).join('') || '<div class="empty">ยังไม่มีภารกิจ</div>';
      return { title: 'ภารกิจของฉัน', body: b };
    }
    const p = P(), rd = ready();
    let b = '<div class="row wrap" style="margin-bottom:14px;gap:8px"><button class="btn gold" data-act="misNew">' + ic('plus', 18) + 'มอบภารกิจ</button><button class="btn" data-act="misCrown">🎖️ สถาปนายศ</button><button class="btn ghost" data-act="misCfg">ตั้งค่าหลอดแต้ม</button><button class="btn ghost" data-act="mainBulk">🎵 เครื่องหลักของสมาชิก</button><button class="btn ghost" data-act="misDown" style="color:#c0392b">⚖️ ลงโทษ / ทัณฑ์บน</button><button class="btn ghost" data-act="misReport">📄 รายงานรายบุคคล</button><a class="btn ghost" href="#/rep">🎵 สมุดต่อเพลง</a></div>';
    if (rd.length) b += '<section class="card alert"><div class="lb">🔥 หลอดเต็ม รอประเมินเลื่อนยศ (' + rd.length + ')</div>' + rd.map(x => '<div class="row" style="padding:6px 0;border-top:1px dashed var(--line)"><span class="grow"><b>' + esc(nm(x.sid)) + '</b><div class="muted" style="font-size:.82rem">' + esc(x.inst) + ' · ' + esc(A.lvName(A.lvOf(x.sid, x.inst))) + ' · ' + xpOf(x.sid, x.inst) + '/' + XPMAX() + ' แต้ม</div></span><button class="btn sm" data-act="misPromote" data-sid="' + esc(x.sid) + '" data-inst="' + esc(x.inst) + '">ประเมิน / เลื่อนยศ</button></div>').join('') + '</section>';
    { const lg = allLog(), pb = A.activeSids().map(s => [s, probOf(s)]).filter(x => x[1]);
      if (pb.length) b += '<section class="card" style="border-left:4px solid #e0a800"><div class="lb">⚠️ อยู่ระหว่างทัณฑ์บน (' + pb.length + ')</div>' + pb.map(x => '<div class="row" style="padding:6px 0;border-top:1px dashed var(--line)"><span class="grow"><b>' + esc(nm(x[0])) + '</b><div class="ms-sv">ถึง ' + esc(A.dTH(x[1].until, 'short')) + (x[1].cond ? ' · ' + esc(x[1].cond) : '') + ' · มลทิน: ' + esc(tagTxt(x[1].tags)) + '</div></span><button class="btn sm ghost" data-act="probEnd" data-sid="' + esc(x[0]) + '" data-id="' + esc(x[1].id) + '">ยุติทัณฑ์บน</button></div>').join('') + '</section>';
      const jl = Object.keys(A.D.jail || {}).filter(s => A.jailed(s));
      if (jl.length) b += '<section class="card" style="border-left:4px solid #c0392b"><div class="lb">⛓️ อยู่ระหว่างจำตรุ (' + jl.length + ')</div>' + jl.map(s => '<div class="row" style="padding:6px 0;border-top:1px dashed var(--line);gap:6px;flex-wrap:wrap"><span class="grow"><b>' + esc(nm(s)) + '</b><div class="ms-sv">พ้นโทษ ' + esc(A.dTH(A.D.jail[s].until, 'short')) + '</div></span><button class="btn sm ghost" data-act="jailExt" data-sid="' + esc(s) + '">ปรับวัน</button><button class="btn sm ghost" data-act="jailEnd" data-sid="' + esc(s) + '">ปล่อยพ้นโทษ</button></div>').join('') + '</section>';
      if (lg.length) b += '<details class="card"><summary class="lb" style="cursor:pointer;margin:0">ประวัติการเลื่อน / ลด / ถอดยศ และทัณฑ์บน (' + lg.length + ')</summary>' + lg.slice(0, 40).map(x => logRow(x, true)).join('') + '</details>'; }
    b += '<div class="row" style="gap:6px;margin-bottom:10px">' + [['open', 'กำลังดำเนินการ'], ['closed', 'ปิดแล้ว']].map(t => '<button class="btn sm' + (UI.tab === t[0] ? '' : ' ghost') + '" data-act="misTab" data-t="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>';
    const l = all().filter(m => UI.tab === 'closed' ? m.st === 'closed' : m.st !== 'closed');
    b += l.map(m => { const W = who(m), R = W.map(s => (((p || {})[m.id] || {})[s]) || {}), done = R.filter(r => r.st === 'done').length, wt = R.filter(waiting).length;
      return '<a class="card rowcard" href="#/mi/' + esc(m.id) + '"><div class="grow"><b>' + esc(m.t) + '</b><div class="muted" style="font-size:.82rem">' + stars(m.star) + ' · ' + esc(CAT[m.cat] || '') + ' · ' + esc(period(m)) + ' · ' + W.length + ' คน · สำเร็จ ' + done + '</div>' + (m.st !== 'closed' ? '<div>' + dl(m) + '</div>' : '') + '</div>' + (wt ? chip('รอตรวจ ' + wt, 'gold') : '') + '</a>'; }).join('') || '<div class="empty">' + (UI.tab === 'closed' ? 'ยังไม่มีภารกิจที่ปิดแล้ว' : 'ยังไม่มีภารกิจ — กด “มอบภารกิจ” เพื่อเริ่ม') + '</div>';
    return { title: 'ภารกิจและการเลื่อนยศ', body: b };
  };

  /* ---------- หน้า: ภารกิจเดียว ---------- */
  A.V.mi = function (mid) {
    const m = one(mid); if (!m || (!T() && !(m.who || {})[me()])) return { title: 'ไม่พบภารกิจ', body: '<div class="empty">ไม่พบภารกิจนี้</div>', back: '#/mis' };
    if (P() === null) return { title: m.t, body: '<div class="empty">กำลังโหลด…</div>', back: '#/mis' };
    let b = '<section class="card"><div class="row" style="gap:8px;flex-wrap:wrap">' + stars(m.star) + chip(CAT[m.cat] || '', 'line') + '<span class="grow"></span>' + (m.st === 'closed' ? chip('ปิดแล้ว', 'line') : dl(m)) + '</div>' +
      '<div class="muted" style="margin-top:6px;font-size:.85rem">ช่วงเวลา ' + esc(period(m)) + ' · สำเร็จได้ +' + (m.xp || 0) + ' แต้ม · ' + (m.inst && m.inst !== 'main' ? 'เข้าหลอดเครื่อง' + esc(m.inst) : 'เข้าหลอดเครื่องหลักของแต่ละคน') + '</div>' +
      (m.auto ? '<div class="note" style="margin-top:8px">🎮 ตรวจอัตโนมัติ: เล่นเกมฝึกทักษะด้าน' + (SKN[m.auto.k] || '') + ' ให้ได้ ' + m.auto.min + '% ขึ้นไป (เปิดเกมจากในแอป) ระบบจะส่งผลให้ครูตรวจเอง</div>' : '') +
      (m.d ? '<div style="margin-top:8px;white-space:pre-wrap">' + esc(m.d) + '</div>' : '') + '</section>';
    return { title: m.t, body: b + (T() ? tView(m) : sView(m)), back: '#/mis' };
  };

  function sView(m) {
    const r = recOf(m.id, me()), s = r.s || {}, ck = s.ck || {}, S = steps(m), stt = stOf(m, r), open = m.st !== 'closed' && !r.st;
    let b = '<section class="card"><div class="row"><div class="lb grow" style="margin:0">สถานะ</div>' + chip(stt[0], stt[1]) + '</div>' + pgBar(r.pg) + (r.tn ? '<div class="note" style="margin-top:8px">💬 ครู: ' + esc(r.tn) + '</div>' : '') +
      (r.st === 'done' ? '<div class="note ok" style="margin-top:8px">🎉 สำเร็จ! ได้ +' + (r.xp || 0) + ' แต้ม เข้าหลอดเครื่อง' + esc(r.inst || '') + '</div>' : '') + '</section>';
    if (S.length) b += '<section class="card"><div class="lb">เป้าหมายย่อย</div><div class="ms-steps">' + S.map((t, i) => '<label><input type="checkbox" data-msck="1" data-m="' + esc(m.id) + '" data-k="' + i + '"' + (ck[i] ? ' checked' : '') + (open ? '' : ' disabled') + '> <span>' + esc(t) + '</span></label>').join('') + '</div></section>';
    b += '<section class="card"><div class="lb">บันทึก / หลักฐานของฉัน</div>' +
      fld('เล่าสิ่งที่ทำ หรือปัญหาที่เจอ', '<textarea class="in" id="ms-note" rows="3" maxlength="800"' + (open ? '' : ' disabled') + '>' + esc(s.note || '') + '</textarea>') +
      fld('ลิงก์คลิป/รูป (ถ้ามี)', '<input class="in" id="ms-link" maxlength="300" placeholder="https://" value="' + esc(s.link || '') + '"' + (open ? '' : ' disabled') + '>') +
      (s.link ? '<div style="margin:4px 0"><a href="' + esc(/^https?:\/\//.test(s.link) ? s.link : '#') + '" target="_blank" rel="noopener">เปิดลิงก์ที่แนบ ↗</a></div>' : '') +
      (open ? '<div class="ms-act"><button class="btn ghost" data-act="misSave" data-m="' + esc(m.id) + '">บันทึก</button><button class="btn gold" data-act="misSend" data-m="' + esc(m.id) + '">📨 ส่งให้ครูตรวจ</button></div>' + (s.sent ? '<div class="muted" style="font-size:.8rem;margin-top:6px">ส่งตรวจล่าสุด ' + esc(M.thDate(s.sent)) + (waiting(r) ? ' · รอครูตรวจ' : ' · ครูดูแล้ว') + '</div>' : '') : '') + '</section>';
    b += '<section class="card"><div class="lb">หลอดแต้มของฉัน</div>' + xpBar(me(), r.inst || instFor(m, me())) + '</section>';
    return b;
  }

  function tView(m) {
    const p = P() || {}, W = who(m).sort(A.byClass), S = steps(m);
    let b = '<div class="row wrap" style="gap:6px;margin-bottom:12px"><button class="btn sm" data-act="misEdit" data-m="' + esc(m.id) + '">แก้ไข / เพิ่มคน / ต่อเวลา</button><button class="btn sm ghost" data-act="misClose" data-m="' + esc(m.id) + '">' + (m.st === 'closed' ? 'เปิดภารกิจอีกครั้ง' : 'ปิดภารกิจ') + '</button><button class="btn sm ghost danger" data-act="misDel" data-m="' + esc(m.id) + '">ลบ</button></div>';
    b += '<div class="ms-ppl">' + W.map(sid => {
      const r = ((p[m.id] || {})[sid]) || {}, s = r.s || {}, ck = s.ck || {}, stt = stOf(m, r), D = 'data-m="' + esc(m.id) + '" data-sid="' + esc(sid) + '"';
      return '<div class="ms-p"><div class="hd"><b>' + esc(nm(sid)) + ' <small class="muted">' + esc(A.cls(ms()[sid])) + '</small></b>' + chip(stt[0], stt[1]) + '</div>' + pgBar(r.pg, 'ความคืบหน้า') +
        (r.st ? '' : '<div class="ms-pgb">' + [0, 25, 50, 75, 100].map(v => '<button data-act="misPg" ' + D + ' data-v="' + v + '" class="' + ((r.pg || 0) === v ? 'on' : '') + '">' + v + '%</button>').join('') + '</div>') +
        (S.length ? '<div class="ms-sv">เป้าหมายย่อย: ' + S.map((t, i) => (ck[i] ? '✅ ' : '⬜ ') + esc(t)).join('  ·  ') + '</div>' : '') +
        (s.note ? '<div class="ms-sv">📝 ' + esc(s.note) + '</div>' : '') + (s.link ? '<div class="ms-sv">🔗 <a href="' + esc(/^https?:\/\//.test(s.link) ? s.link : '#') + '" target="_blank" rel="noopener">' + esc(s.link) + '</a></div>' : '') +
        (s.auto ? '<div class="ms-sv">🎮 ผ่านเกณฑ์จากเกม ' + esc(String(s.auto.v)) + '%' + (s.auto.g ? ' (' + esc(s.auto.g) + ')' : '') + '</div>' : '') +
        (s.sent ? '<div class="ms-sv">📨 ส่งตรวจ ' + esc(M.thDate(s.sent)) + '</div>' : '') + (r.tn ? '<div class="ms-sv">💬 ความเห็นครู: ' + esc(r.tn) + '</div>' : '') +
        (r.st === 'done' ? '<div class="ms-sv">🎉 ได้ +' + (r.xp || 0) + ' แต้ม · เครื่อง' + esc(r.inst || '') + '</div>' + xpBar(sid, r.inst) : '') +
        '<div class="ms-act">' + (r.st ? '<button class="btn sm ghost" data-act="misUndo" ' + D + '>↺ ยกเลิกผลประเมิน</button>' : '<button class="btn sm ghost" data-act="misNote" ' + D + '>💬 ความเห็น</button><button class="btn sm ghost danger" data-act="misFail" ' + D + '>ไม่สำเร็จ</button><button class="btn sm gold" data-act="misDone" ' + D + '>✓ สำเร็จ</button>') + '</div></div>';
    }).join('') + '</div>';
    return b || '<div class="empty">ยังไม่มีผู้รับภารกิจ</div>';
  }

  /* ---------- ฟอร์มมอบภารกิจ ---------- */
  function misForm(id) {
    const m = id ? one(id) : null, e = m || { star: 1, xp: XPD[1], cat: 'song', inst: 'main', from: A.todayISO(), to: '', who: {} };
    const act = A.activeSids().sort(A.byClass), ins = A.instList();
    const pick = act.map(s => '<label data-g="' + (ms()[s].grade || '') + '" data-i="' + esc(A.insts(ms()[s]).join('|')) + '"><input type="checkbox" value="' + esc(s) + '"' + ((e.who || {})[s] ? ' checked' : '') + '> <span class="grow">' + esc(nm(s)) + ' <small>' + esc(A.cls(ms()[s]) + (A.insts(ms()[s]).length ? ' · ' + A.insts(ms()[s]).join(', ') : '')) + '</small></span></label>').join('');
    const grades = [...new Set(act.map(s => ms()[s].grade).filter(Boolean))].sort();
    const w = modal('<h3>' + (m ? 'แก้ไขภารกิจ' : 'มอบภารกิจ') + '</h3><form class="form">' +
      fld('ชื่อภารกิจ', '<input class="in" id="mf-t" maxlength="120" required value="' + esc(e.t || '') + '" placeholder="เช่น ตีเพลงลาวดวงเดือน ท่อน ๑ ให้คล่อง">') +
      fld('รายละเอียด', '<textarea class="in" id="mf-d" rows="3" maxlength="1500">' + esc(e.d || '') + '</textarea>') +
      '<div class="row" style="gap:8px">' + fld('หมวด', '<select class="in" id="mf-c">' + opt(Object.keys(CAT).map(k => [k, CAT[k]]), e.cat) + '</select>') + fld('ความยาก', '<select class="in" id="mf-s">' + opt([[1, '★ ง่าย'], [2, '★★ กลาง'], [3, '★★★ ยาก']], e.star) + '</select>') + fld('แต้มเมื่อสำเร็จ', '<input class="in" id="mf-x" type="number" min="0" max="1000" value="' + (e.xp || 0) + '">') + '</div>' +
      fld('แต้มเข้าหลอดของเครื่อง', '<select class="in" id="mf-i">' + opt([['main', 'เครื่องหลักของแต่ละคน']].concat(ins.map(i => [i, i])), e.inst || 'main') + '</select>') +
      '<div class="row" style="gap:8px">' + fld('ตรวจอัตโนมัติจากเกม (ไม่บังคับ)', '<select class="in" id="mf-ak">' + opt([['', 'ไม่ใช้ — ครูตรวจเอง'], ['rhythm', 'เกมด้านจังหวะ (กลองแขกคู่ขวัญ แห่กลอง ฯลฯ)'], ['melody', 'เกมด้านทำนอง (ฆ้องวงใหญ่แสนกล ฯลฯ)'], ['ear', 'เกมด้านการฟัง (หูทอง)'], ['inst', 'เกมทายเครื่องดนตรี (หูทอง)']], (e.auto || {}).k || '') + '</select>') + fld('เกณฑ์ผ่าน (%)', '<input class="in" id="mf-am" type="number" min="1" max="100" value="' + ((e.auto || {}).min || 80) + '">') + '</div>' +
      '<div class="row" style="gap:8px">' + fld('วันเริ่ม', '<input class="in" id="mf-f" type="date" value="' + esc(e.from || '') + '" required>') + fld('วันสิ้นสุด', '<input class="in" id="mf-e" type="date" value="' + esc(e.to || '') + '" required>') + '</div>' +
      fld('เป้าหมายย่อย (บรรทัดละ 1 ข้อ · ไม่ใส่ก็ได้)', '<textarea class="in" id="mf-p" rows="3" maxlength="1200" placeholder="ตีท่อน ๑ ได้\nตีทั้งเพลงตามจังหวะ\nตีร่วมวงได้">' + esc(steps(e).join('\n')) + '</textarea>') +
      '<div class="fld"><span>ผู้รับภารกิจ <b id="mf-n"></b></span><input class="in" id="mf-q" placeholder="ค้นหาชื่อ / เครื่อง"><div class="ms-qb"><button type="button" data-q="all">เลือกทุกคน</button><button type="button" data-q="none">ล้าง</button>' + grades.map(g => '<button type="button" data-q="g' + g + '">ม.' + g + '</button>').join('') + ins.map(i => '<button type="button" data-q="i' + esc(i) + '">' + esc(i) + '</button>').join('') + '</div><div class="ms-pick" id="mf-w">' + pick + '</div></div>' +
      '<label class="ck wide"><input type="checkbox" id="mf-nt" checked> แจ้งเตือนผู้รับภารกิจ</label>' +
      '<div class="note bad" id="mf-err" hidden></div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">' + (m ? 'บันทึก' : 'มอบภารกิจ') + '</button></div></form>', { center: true, sticky: true });
    const box = $('#mf-w', w), cnt = () => { $('#mf-n', w).textContent = '(' + box.querySelectorAll('input:checked').length + ' คน)'; }; cnt();
    box.addEventListener('change', cnt);
    $('#mf-s', w).addEventListener('change', ev => { $('#mf-x', w).value = XPD[ev.target.value] || 10; });
    $('#mf-q', w).addEventListener('input', ev => { const q = ev.target.value.trim(); box.querySelectorAll('label').forEach(l => { l.hidden = !!q && !l.textContent.includes(q); }); });
    w.addEventListener('click', ev => { const q = ev.target.closest('[data-q]'); if (!q) return; const k = q.dataset.q;
      box.querySelectorAll('label').forEach(l => { if (l.hidden) return; const c = l.querySelector('input'); if (k === 'all') c.checked = true; else if (k === 'none') c.checked = false; else if (k[0] === 'g' && l.dataset.g === k.slice(1)) c.checked = true; else if (k[0] === 'i' && l.dataset.i.split('|').includes(k.slice(1))) c.checked = true; }); cnt(); });
    $('form', w).addEventListener('submit', ev => {
      ev.preventDefault(); const err = $('#mf-err', w), bad = t => { err.textContent = t; err.hidden = false; };
      const t = $('#mf-t', w).value.trim(), from = $('#mf-f', w).value, to = $('#mf-e', w).value, sel = [...box.querySelectorAll('input:checked')].map(c => c.value);
      if (!t) return bad('ใส่ชื่อภารกิจ'); if (!from || !to) return bad('ใส่วันเริ่มและวันสิ้นสุด'); if (to < from) return bad('วันสิ้นสุดต้องไม่ก่อนวันเริ่ม'); if (!sel.length) return bad('เลือกผู้รับภารกิจอย่างน้อย 1 คน');
      const whoO = {}; sel.forEach(s => { whoO[s] = true; });
      const v = { t, d: $('#mf-d', w).value.trim() || null, cat: $('#mf-c', w).value, star: +$('#mf-s', w).value || 1, xp: Math.max(0, Math.min(1000, Math.round(+$('#mf-x', w).value || 0))), inst: $('#mf-i', w).value || 'main', from, to,
        auto: $('#mf-ak', w).value ? { k: $('#mf-ak', w).value, min: Math.max(1, Math.min(100, Math.round(+$('#mf-am', w).value || 80))) } : null,
        steps: $('#mf-p', w).value.split('\n').map(x => x.trim()).filter(Boolean).slice(0, 20), who: whoO, st: m ? (m.st || 'open') : 'open', at: m ? m.at : Date.now(), by: m ? m.by : A.myName(), y: m ? m.y : A.year(), ed: m ? Date.now() : null };
      if (!v.steps.length) v.steps = null;
      const mid = id || B.uid(); A.W(B.set(CP() + 'mis/' + mid, v)); A.log(m ? 'mis.edit' : 'mis.new', '', t + ' · ' + sel.length + ' คน');
      const nw = m ? sel.filter(s => !(m.who || {})[s]) : sel;
      if ($('#mf-nt', w).checked && nw.length && window.PUSH) window.PUSH.notify('msg', { title: '📜 ภารกิจใหม่จากครู', body: t + ' · ถึง ' + A.dTH(to, 'short') + ' · +' + v.xp + ' แต้ม', to: nw, url: '#/mi/' + mid });
      w.remove(); toast(m ? 'บันทึกภารกิจแล้ว' : 'มอบภารกิจให้ ' + sel.length + ' คนแล้ว'); if (!m) location.hash = '#/mi/' + mid;
    });
  }

  /* ---------- ประเมินผลรายคน ---------- */
  const RP = (mid, sid) => CP() + 'misp/' + mid + '/' + sid;
  function doneForm(m, sid) {
    const L = A.insts(ms()[sid]), i0 = instFor(m, sid), list = L.length ? L : (i0 ? [i0] : []);
    if (!list.length) return toast('สมาชิกคนนี้ยังไม่มีเครื่องดนตรีในข้อมูล — เพิ่มเครื่องดนตรีก่อน', 5000);
    const w = modal('<h3>✓ ภารกิจสำเร็จ</h3><div class="muted" style="margin-bottom:10px">' + esc(nm(sid)) + ' · ' + esc(m.t) + '</div><form class="form">' +
      '<div class="row" style="gap:8px">' + fld('แต้มที่ได้', '<input class="in" id="md-x" type="number" min="0" max="1000" value="' + (m.xp || 0) + '">') + fld('เข้าหลอดเครื่อง', '<select class="in" id="md-i">' + opt(list.map(i => [i, i]), i0) + '</select>') + '</div>' +
      '<div id="md-pv"></div>' + fld('ความเห็นครู (นักเรียนเห็น)', '<textarea class="in" id="md-n" rows="2" maxlength="400"></textarea>') +
      (m.redeem ? '<div class="note" style="margin:6px 0"><b>ภารกิจไถ่โทษ</b>' + (m.redeem.from ? '<label class="ck wide"><input type="checkbox" id="md-bk" checked> คืนยศเดิม (' + esc(Object.keys(m.redeem.from).map(x => x + ' ' + A.lvName(m.redeem.from[x])).join(', ')) + ')</label>' : '') + (probOf(sid) ? '<label class="ck wide"><input type="checkbox" id="md-pe" checked> ยุติทัณฑ์บน</label>' : '') + '</div>' : '') +
      '<label class="ck wide"><input type="checkbox" id="md-aw"' + ((m.star || 1) >= 3 && !m.redeem ? ' checked' : '') + '> ประกาศยกย่องผลงานนี้บนหน้าหลัก</label>' +
      '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">บันทึกว่าสำเร็จ</button></div></form>', { center: true, sticky: true });
    const pv = () => { const i = $('#md-i', w).value, x = xpOf(sid, i) + Math.max(0, +$('#md-x', w).value || 0), mx = XPMAX(); $('#md-pv', w).innerHTML = '<div class="muted" style="font-size:.85rem;margin:2px 0 8px">หลอด' + esc(i) + ' จะเป็น ' + x + ' / ' + mx + ' แต้ม' + (x >= mx ? ' — <b style="color:#b5561d">เต็มหลอด รอประเมินเลื่อนยศ</b>' : '') + '</div>'; };
    pv(); $('#md-i', w).addEventListener('change', pv); $('#md-x', w).addEventListener('input', pv);
    $('form', w).addEventListener('submit', ev => {
      ev.preventDefault(); const inst = $('#md-i', w).value, pts = A.jailed(sid) ? (toast('อยู่ระหว่างจำตรุ — ภารกิจนี้ไม่ได้รับแต้ม', 4500), 0) : Math.max(0, Math.min(1000, Math.round(+$('#md-x', w).value || 0))), tn = $('#md-n', w).value.trim(), now = Date.now();
      const x1 = xpOf(sid, inst) + pts, upd = {};
      upd[RP(m.id, sid) + '/st'] = 'done'; upd[RP(m.id, sid) + '/pg'] = 100; upd[RP(m.id, sid) + '/xp'] = pts; upd[RP(m.id, sid) + '/inst'] = inst; upd[RP(m.id, sid) + '/rv'] = now; upd[RP(m.id, sid) + '/doneAt'] = now; if (tn) upd[RP(m.id, sid) + '/tn'] = tn;
      if (pts) upd[CP() + 'skills/' + sid + '/' + inst + '/xp'] = x1;
      if (m.redeem) redeemDone(m, sid, !!($('#md-bk', w) || {}).checked, !!($('#md-pe', w) || {}).checked, upd);
      if ($('#md-aw', w).checked) upd[CP() + 'awards/' + B.uid()] = { title: '🏅 ภารกิจสำเร็จ: ' + m.t, body: tn || m.d || ('ทำภารกิจ' + (CAT[m.cat] || '') + 'สำเร็จ'), rcp: { [sid]: nm(sid) }, at: now, by: A.myName(), y: A.year() };
      A.W(B.update('', upd)); A.log('mis.done', sid, m.t + ' +' + pts + ' (' + inst + ')');
      if (window.PUSH) window.PUSH.notify('msg', { title: '🎉 ภารกิจสำเร็จ', body: m.t + ' · +' + pts + ' แต้ม เข้าหลอด' + inst + (x1 >= XPMAX() ? ' · หลอดเต็มแล้ว!' : ''), to: [sid], url: '#/mi/' + m.id });
      w.remove(); toast(x1 >= XPMAX() ? 'บันทึกแล้ว · หลอดของ ' + nm(sid) + ' เต็มแล้ว — ประเมินเลื่อนยศได้ที่หน้าภารกิจ' : 'บันทึกว่าสำเร็จ +' + pts + ' แต้ม', 4500);
    });
  }

  /* ---------- เลื่อนยศ / สถาปนายศ + ประกาศเกียรติคุณทั้งชมรม ---------- */
  function announce(sid, inst, lv, reason, extra) {
    const now = Date.now(), m = ms()[sid]; if (!m) return;
    const body = A.fullName(m) + ' (' + A.cls(m) + ') ได้รับการเลื่อนยศเป็น ' + A.lvName(lv) + ' เครื่อง' + inst + (reason ? ' — ' + reason : '');
    const upd = extra || {};
    upd[CP() + 'ranklog/' + sid + '/' + B.uid()] = { k: 'up', inst, to: lv, note: reason || null, at: now, by: A.myName() };
    upd[CP() + 'awards/' + B.uid()] = { title: '🎖️ ประกาศเกียรติคุณ: เลื่อนยศ', body, rcp: { [sid]: A.fullName(m) }, at: now, by: A.myName(), y: A.year(), pinned: null };
    A.W(B.update('', upd));
    if (window.PUSH) window.PUSH.notify('ann', { title: '🎖️ ประกาศเกียรติคุณ', body: 'ขอแสดงความยินดีกับ ' + body, url: '#/home' });
  }
  function promoteForm(sid0, inst0) {
    if (sid0 && A.jailed(sid0)) return toast('สมาชิกคนนี้อยู่ระหว่างจำตรุ — ยศถูกพักไว้ เลื่อนยศได้เมื่อพ้นโทษ', 4500);
    const act = A.activeSids().filter(s => !A.jailed(s)).sort(A.byClass), lvs = A.levels();
    const w = modal('<h3>🎖️ ' + (sid0 ? 'ประเมินเลื่อนยศ' : 'สถาปนายศ') + '</h3><form class="form">' +
      fld('สมาชิก', '<select class="in" id="mp-s"' + (sid0 ? ' disabled' : '') + '>' + opt([['', '— เลือกสมาชิก —']].concat(act.map(s => [s, nm(s) + ' · ' + A.cls(ms()[s])])), sid0 || '') + '</select>') +
      fld('เครื่องดนตรี', '<select class="in" id="mp-i"></select>') + '<div id="mp-now"></div>' +
      fld('ยศใหม่ (ระดับฝีมือ)', '<select class="in" id="mp-l"></select>') +
      fld('เหตุผล / คำยกย่อง (ประกาศให้ทั้งชมรมเห็น)', '<textarea class="in" id="mp-r" rows="2" maxlength="300"></textarea>') +
      '<div class="muted" style="font-size:.82rem;margin:4px 0">เมื่อบันทึก: ประกาศเกียรติคุณบนหน้าหลัก และแจ้งเตือนสมาชิกทั้งชมรม · แต้มส่วนที่เกินหลอดยกไปหลอดใหม่</div>' +
      '<div class="note bad" id="mp-err" hidden></div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">เลื่อนยศและประกาศ</button></div></form>', { center: true, sticky: true });
    const fill = () => {
      const s = $('#mp-s', w).value, L = s ? A.insts(ms()[s]) : [], i0 = inst0 && (L.includes(inst0) || !L.length) ? inst0 : (L[0] || '');
      $('#mp-i', w).innerHTML = opt((L.length ? L : (inst0 ? [inst0] : [])).map(i => [i, i]), i0); fillLv();
    };
    const fillLv = () => {
      const s = $('#mp-s', w).value, i = $('#mp-i', w).value, cur = s && i ? A.lvOf(s, i) : 0;
      $('#mp-now', w).innerHTML = s && i ? '<div class="muted" style="font-size:.85rem;margin-bottom:6px">ปัจจุบัน: ' + esc(A.lvName(cur)) + ' · หลอด ' + xpOf(s, i) + '/' + XPMAX() + ' แต้ม</div>' : '';
      $('#mp-l', w).innerHTML = opt(lvs.map((l, k) => [k + 1, 'Lv.' + (k + 1) + (l.name ? ' ' + l.name : '') + (k + 1 === cur ? ' (ปัจจุบัน)' : '')]), Math.min(lvs.length, cur + 1));
      if (!$('#mp-r', w).value && s && i && xpOf(s, i) >= XPMAX()) $('#mp-r', w).value = 'สะสมแต้มจากภารกิจครบหลอด';
    };
    fill(); $('#mp-s', w).addEventListener('change', () => { $('#mp-r', w).value = ''; fill(); }); $('#mp-i', w).addEventListener('change', fillLv);
    $('form', w).addEventListener('submit', ev => {
      ev.preventDefault(); const err = $('#mp-err', w), bad = t => { err.textContent = t; err.hidden = false; };
      const s = $('#mp-s', w).value, i = $('#mp-i', w).value, lv = +$('#mp-l', w).value, cur = A.lvOf(s, i), reason = $('#mp-r', w).value.trim();
      if (!s) return bad('เลือกสมาชิก'); if (!i) return bad('สมาชิกคนนี้ยังไม่มีเครื่องดนตรีในข้อมูล'); if (!lv) return bad('เลือกยศใหม่');
      if (lv <= cur) return bad('ยศใหม่ต้องสูงกว่ายศปัจจุบัน (' + A.lvName(cur) + ') — ถ้าต้องการปรับลด ใช้การประเมินระดับฝีมือในหน้าสมาชิก');
      const x = xpOf(s, i), mx = XPMAX(), left = x >= mx ? x - mx : 0, now = Date.now(), upd = {};
      upd[CP() + 'skills/' + s + '/' + i] = { lv, at: now, by: A.myName(), pAt: now, xp: left || null };
      announce(s, i, lv, reason, upd); A.log('rank.up', s, i + ' → ' + A.lvName(lv) + (reason ? ' · ' + reason : ''));
      w.remove(); toast('เลื่อนยศ ' + nm(s) + ' เป็น ' + A.lvName(lv) + ' และประกาศให้ทั้งชมรมแล้ว', 4500);
    });
  }
  window.MIS = { announce, promoteForm };

  /* ---------- ลดยศ / ถอดยศ / ทัณฑ์บน / ไถ่โทษ (รุ่น 3.33) ----------
     ranklog/{sid}/{id} = ประวัติยศรายคน (ครู + เจ้าตัวเห็น) · rankpub/{id} = ประกาศต่อชมรม (เมื่อครูเลือกประกาศ) */
  const TAINT = { abs: 'ขาดซ้อม / ไม่มาตามนัดบ่อย', disc: 'ผิดวินัยหรือกฎของชมรม', resp: 'ไม่เคารพครู/รุ่นพี่ หรือพฤติกรรมไม่เหมาะสม', duty: 'ละทิ้งหน้าที่หรือภารกิจที่ได้รับมอบหมาย', prop: 'ทำเครื่องดนตรี/ทรัพย์สินชมรมเสียหายโดยประมาท', hon: 'ไม่ซื่อสัตย์ / ทุจริต', fame: 'ทำให้ชมรมเสื่อมเสียชื่อเสียง', skill: 'ฝีมือไม่เป็นไปตามระดับยศ', other: 'อื่น ๆ' };
  const KN = { up: ['▲ เลื่อนยศ', 'ok'], down: ['▼ ลดยศ', 'bad'], strip: ['✕ ถอดยศ', 'bad'], prob: ['⚠️ ทัณฑ์บน', 'gold'], back: ['↺ คืนยศ', 'ok'], jail: ['⛓️ จำตรุ', 'bad'], out: ['🚫 ขับออก', 'bad'] };
  const KT = { prob: 'ทัณฑ์บน', jail: 'โทษจำตรุ', out: 'การขับออก', strip: 'การถอดยศ', down: 'การลดยศ' };
  const kTxt = (k, to) => k === 'jail' ? 'จำตรุ' : k === 'out' ? 'ขับออก' : k === 'strip' ? 'ถอดยศ' : k === 'prob' ? 'ทัณฑ์บน' : k === 'back' ? 'คืนยศ' : 'ลดยศเป็น ' + A.lvName(to || 0);
  /* ทัณฑ์บนที่ยังมีผล: รายการ prob ที่ยังไม่ถึงวันสิ้นสุดและยังไม่ถูกยุติ */
  const probOf = sid => logOf(sid).find(x => x.k === 'prob' && !x.end && x.until && x.until >= A.todayISO());
  A.SUBS.push({ key: 'rankpub', path: () => CP() + 'rankpub' });
  let lkey = '', loff = null, LOG = null;
  function LOGS() {
    const key = cid() + '|' + (T() ? 'T' : me()); if (!T() && !me()) return {};
    if (key !== lkey) { if (loff) loff(); LOG = null; lkey = key;
      loff = B.on(CP() + 'ranklog' + (T() ? '' : '/' + me()), v => { LOG = T() ? (v || {}) : { [me()]: v || {} }; A.rerender(); }, e => { LOG = {}; console.warn('ranklog', e && e.code); }); }
    return LOG || {};
  }
  const logOf = sid => { const o = LOGS()[sid] || {}; return Object.keys(o).map(id => Object.assign({ id, sid }, o[id])).sort((a, b) => (b.at || 0) - (a.at || 0)); };
  const allLog = () => Object.keys(LOGS()).reduce((a, s) => a.concat(logOf(s)), []).sort((a, b) => (b.at || 0) - (a.at || 0));
  const tagTxt = t => (Array.isArray(t) ? t : Object.values(t || {})).map(k => TAINT[k] || k).join(' · ');
  function logRow(x, withName) {
    const k = KN[x.k] || ['', ''];
    return '<div style="padding:8px 0;border-top:1px dashed var(--line)"><div class="row" style="gap:6px;flex-wrap:wrap">' + chip(k[0], k[1]) + (withName ? '<b>' + esc(nm(x.sid)) + '</b>' : '') + '<span class="grow">' + esc(x.k === 'out' ? 'ขับออกจากชมรม' : x.k === 'prob' || x.k === 'jail' ? 'ถึง ' + A.dTH(x.until, 'short') + (x.end ? ' (ยุติแล้ว)' : x.until < A.todayISO() ? ' (พ้นโทษแล้ว)' : '') : (x.inst === '*' ? 'ทุกเครื่องดนตรี' : 'เครื่อง' + (x.inst || '')) + (x.k === 'strip' ? '' : ' → ' + A.lvName(x.to || 0))) + '</span><small class="muted">' + esc(M.thDate(x.at)) + '</small>' + (x.pub ? chip('ประกาศแล้ว', 'line') : '') + '</div>' +
      (x.tags ? '<div class="ms-sv">มลทิน: ' + esc(tagTxt(x.tags)) + '</div>' : '') + (x.cond ? '<div class="ms-sv">เงื่อนไข: ' + esc(x.cond) + '</div>' : '') + (x.note ? '<div class="ms-sv">' + esc(x.note) + '</div>' : '') + (x.mis ? '<div class="ms-sv"><a href="#/mi/' + esc(x.mis) + '">ภารกิจบำเพ็ญประโยชน์เพื่อไถ่โทษ ↗</a></div>' : '') + '</div>';
  }
  /* ประกาศต่อชมรม (7 วัน) บนหน้าหลักของทุกคน */
  A.HOME.push({ order: 13, html: () => {
    const p = A.D.rankpub || {}, l = Object.keys(p).map(id => p[id]).filter(x => x && Date.now() - (x.at || 0) < 7 * 864e5).sort((a, b) => b.at - a.at);
    if (!l.length) return '';
    return '<section class="card" style="border-left:4px solid #c0392b"><div class="lb">📢 ประกาศจากชมรม</div>' + l.map(x => '<div style="padding:6px 0;border-top:1px dashed var(--line)"><b>' + esc(x.name || '') + '</b> ' + esc(x.k === 'jail' ? 'ต้องโทษจำตรุ ถึง ' + A.dTH(x.until, 'short') : x.k === 'out' ? 'ถูกขับออกจากชมรม' : x.k === 'prob' ? 'อยู่ระหว่างทัณฑ์บน ถึง ' + A.dTH(x.until, 'short') : (x.k === 'strip' ? 'ถูกถอดยศ' : 'ถูกลดยศเป็น ' + A.lvName(x.to || 0)) + ' ' + (x.inst === '*' ? '(ทุกเครื่องดนตรี)' : '(เครื่อง' + (x.inst || '') + ')')) + '<div class="ms-sv">มลทิน: ' + esc(tagTxt(x.tags)) + '</div><small class="muted">' + esc(M.thDate(x.at)) + '</small></div>').join('') + '</section>';
  } });

  /* ---------- จำตรุ (รุ่น 3.40): jail/{sid} = { until, at, log } สมาชิกทุกคนอ่านได้ เพื่อให้ “พักยศ” เห็นตรงกันทั้งชมรม ----------
     ระหว่างจำตรุ: ยศทุกเครื่องถูกพัก (lvOf = 0) · ภารกิจไม่ได้รับแต้ม · ไม่ถูกเลือกในจัดวง/กิจกรรม/โหวต · นักเรียนเห็นเฉพาะหน้าโทษของตัวเองและภารกิจไถ่โทษ
     ครบวันพ้นโทษ ระบบปล่อยเอง (ไม่ต้องลบข้อมูล) · ครูปล่อยก่อนกำหนดหรือปรับวันได้ */
  A.SUBS.push({ key: 'jail', path: () => CP() + 'jail' });
  A.jailed = sid => { const j = (A.D.jail || {})[sid]; return !!(j && j.until && j.until >= A.todayISO()); };
  function hist(s) {
    if (!s) return ''; const L = logOf(s);
    return L.length ? '<div class="note" style="margin-bottom:8px"><b>ประวัติโทษ ' + L.length + ' ครั้ง</b>' + L.slice(0, 5).map(x => '<div class="ms-sv">' + esc((KN[x.k] || [''])[0]) + ' · ' + esc(M.thDate(x.at)) + (x.tags ? ' · ' + esc(tagTxt(x.tags)) : '') + '</div>').join('') + '</div>' : '<div class="muted" style="font-size:.85rem;margin-bottom:8px">ยังไม่มีประวัติโทษ</div>';
  }
  function jailView() {
    const j = (A.D.jail || {})[me()] || {}, x = logOf(me()).find(l => l.id === j.log) || {}, red = mine().filter(m => m.cat === 'redeem' && m.st !== 'closed');
    return { title: 'อยู่ระหว่างจำตรุ', body: '<section class="card" style="border:2px solid #c0392b;text-align:center"><div style="font-size:2.6rem;line-height:1">⛓️</div><h2 style="margin:6px 0 2px">อยู่ระหว่างโทษจำตรุ</h2><div>พ้นโทษวันที่ <b>' + esc(A.dTH(j.until, 'short')) + '</b> (เมื่อครบกำหนด ทุกอย่างกลับมาเหมือนเดิมเอง)</div>' +
      (x.tags ? '<div class="ms-sv" style="margin-top:8px">มลทิน: ' + esc(tagTxt(x.tags)) + '</div>' : '') + (x.cond ? '<div class="ms-sv">เงื่อนไข: ' + esc(x.cond) + '</div>' : '') + '</section>' +
      '<section class="card"><div class="lb">ระหว่างจำตรุ</div><div class="ms-sv">ยศทุกเครื่องถูกพักไว้ · ภารกิจไม่ได้รับแต้ม · ไม่ร่วมวง กิจกรรม และการโหวต · เข้าเกมและเมนูอื่นของชมรมไม่ได้</div></section>' +
      (red.length ? '<section class="card"><div class="lb">ภารกิจไถ่โทษ</div>' + red.map(m => '<a class="rowcard" href="#/mi/' + esc(m.id) + '" style="display:block;padding:8px 0;border-top:1px dashed var(--line)"><b>' + esc(m.t) + '</b><div class="row" style="font-size:.82rem"><span class="grow"></span>' + dl(m) + '</div></a>').join('') + '</section>' : '') +
      '<div class="muted" style="text-align:center;font-size:.85rem">มีข้อสงสัยเรื่องโทษ ติดต่อครูที่ปรึกษาชมรมโดยตรง</div>' };
  }
  A.GATE = r => { if (T() || !me() || !A.jailed(me())) return null; if (r.name === 'manual') return null; if (r.name === 'mi' && (one(r.arg) || {}).cat === 'redeem') return null; return jailView(); };
  A.ACT.jailEnd = async d => { if (!T()) return; if (!(await M.confirmBox('ปล่อยพ้นโทษจำตรุ', esc(nm(d.sid)) + ' พ้นโทษจำตรุก่อนกำหนด · ยศและสิทธิ์กลับมาเหมือนเดิม', 'ปล่อยพ้นโทษ'))) return;
    const j = (A.D.jail || {})[d.sid] || {}, upd = {}; upd[CP() + 'jail/' + d.sid] = null; if (j.log) upd[CP() + 'ranklog/' + d.sid + '/' + j.log + '/end'] = Date.now();
    A.W(B.update('', upd)); A.log('rank.jailEnd', d.sid, ''); if (window.PUSH) window.PUSH.notify('msg', { title: '🔓 พ้นโทษจำตรุ', body: 'ยศและสิทธิ์ในชมรมกลับมาเหมือนเดิมแล้ว', to: [d.sid], url: '#/home' }); toast('ปล่อยพ้นโทษแล้ว'); };
  A.ACT.jailExt = d => { if (!T()) return; const j = (A.D.jail || {})[d.sid]; if (!j) return;
    const w = modal('<h3>ปรับวันพ้นโทษจำตรุ</h3><div class="muted" style="margin-bottom:8px">' + esc(nm(d.sid)) + ' · เดิม ' + esc(A.dTH(j.until, 'short')) + '</div><form class="form">' + fld('วันพ้นโทษใหม่', '<input class="in" type="date" id="je-u" value="' + esc(j.until) + '" required>') + '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">บันทึก</button></div></form>', { center: true });
    $('form', w).addEventListener('submit', ev => { ev.preventDefault(); const u = $('#je-u', w).value; if (!u || u < A.todayISO()) return toast('เลือกวันตั้งแต่วันนี้เป็นต้นไป');
      const upd = {}; upd[CP() + 'jail/' + d.sid + '/until'] = u; if (j.log) upd[CP() + 'ranklog/' + d.sid + '/' + j.log + '/until'] = u; A.W(B.update('', upd)); A.log('rank.jailExt', d.sid, u); w.remove(); toast('ปรับวันพ้นโทษเป็น ' + A.dTH(u, 'short') + ' แล้ว'); }); };

  function downForm(sid0, inst0) {
    const act = A.activeSids().sort(A.byClass), lvs = A.levels();
    const w = modal('<h3>⚖️ ลงโทษ: ทัณฑ์บน / ลดยศ / ถอดยศ / จำตรุ / ขับออก</h3><form class="form">' +
      fld('สมาชิก', '<select class="in" id="md-s"' + (sid0 ? ' disabled' : '') + '>' + opt([['', '— เลือกสมาชิก —']].concat((sid0 && !act.includes(sid0) ? [sid0] : []).concat(act).map(s => [s, nm(s) + ' · ' + A.cls(ms()[s])])), sid0 || '') + '</select>') +
      '<div id="md-h"></div><div class="fld"><span>การดำเนินการ</span><div class="checks"><label class="ck"><input type="radio" name="md-k" value="down" checked><span>▼ ลดยศ</span></label><label class="ck"><input type="radio" name="md-k" value="strip"><span>✕ ถอดยศ</span></label><label class="ck"><input type="radio" name="md-k" value="prob"><span>⚠️ ทัณฑ์บน (ยังไม่ลดยศ)</span></label><label class="ck"><input type="radio" name="md-k" value="jail"><span>⛓️ จำตรุ</span></label><label class="ck"><input type="radio" name="md-k" value="out"><span>🚫 ขับออก</span></label></div></div>' +
      '<div id="md-iw">' + fld('เครื่องดนตรี', '<select class="in" id="md-i"></select>') + '<div id="md-now"></div></div>' +
      '<div id="md-pw" hidden>' + fld('ถึงวันที่ (วันพ้นโทษ)', '<input class="in" type="date" id="md-u">') + fld('เงื่อนไข (นักเรียนเห็น)', '<input class="in" id="md-c" maxlength="200" placeholder="เช่น หากขาดซ้อมโดยไม่ลาอีก จะถูกลดยศทันที">') + '</div>' +
      '<div class="note bad" id="md-ow" hidden>ขับออก = นำออกจากชมรมทันที เข้าแอปของชมรมนี้ไม่ได้ ยศถูกถอดทุกเครื่อง ประวัติเก็บไว้ · ครูกู้คืนได้ที่ จัดการ › สมาชิกที่นำออกแล้ว</div><div class="note" id="md-jw" hidden>จำตรุ = พักยศทุกเครื่อง ไม่ได้รับแต้ม ไม่ร่วมวง/กิจกรรม/โหวต เข้าเกมไม่ได้ เห็นเฉพาะหน้าโทษของตัวเองและภารกิจไถ่โทษ · ครบกำหนดพ้นโทษเอง</div>' + '<div id="md-lw">' + fld('ยศใหม่', '<select class="in" id="md-l"></select>') + '</div>' +
      '<div class="fld"><span>มลทิน (เลือกได้หลายข้อ)</span><div class="ms-pick" style="max-height:none">' + Object.keys(TAINT).map(k => '<label><input type="checkbox" name="md-t" value="' + k + '"> <span>' + esc(TAINT[k]) + '</span></label>').join('') + '</div></div>' +
      fld('รายละเอียด / พฤติการณ์ (บันทึกไว้ในประวัติ ไม่แสดงในประกาศ)', '<textarea class="in" id="md-n" rows="3" maxlength="600"></textarea>') +
      '<label class="ck wide" id="md-xw"><input type="checkbox" id="md-x" checked> ล้างแต้มในหลอดของเครื่องนี้</label>' +
      '<div class="fld" id="md-rr" style="border:1px dashed var(--line);border-radius:10px;padding:8px 10px"><label class="ck wide"><input type="checkbox" id="md-r"> มอบภารกิจบำเพ็ญประโยชน์เพื่อไถ่โทษ</label><div id="md-rw" hidden>' + fld('งานบำเพ็ญประโยชน์ที่ต้องทำ (ครูระบุ)', '<textarea class="in" id="md-rt" rows="2" maxlength="300" placeholder="เช่น ทำความสะอาดและจัดเก็บเครื่องดนตรีห้อง 512 หลังซ้อม 5 ครั้ง"></textarea>') + fld('ต้องทำให้เสร็จภายใน', '<input class="in" type="date" id="md-rd">') + '<div class="muted" style="font-size:.8rem">ทำสำเร็จแล้วครูเลือก “คืนยศเดิม” และ/หรือ “ยุติทัณฑ์บน” ได้ตอนตรวจภารกิจ</div></div></div>' +
      '<label class="ck wide"><input type="checkbox" id="md-me" checked> แจ้งนักเรียนคนนี้ (แจ้งเตือนส่วนตัว)</label>' +
      '<label class="ck wide"><input type="checkbox" id="md-pub"> ประกาศให้ทั้งชมรมทราบ (ขึ้นหน้าหลัก 7 วัน + แจ้งเตือนทุกคน · แสดงเฉพาะชื่อ ยศ และมลทิน)</label>' +
      '<div class="note bad" id="md-err" hidden></div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn grow danger" style="background:#c0392b;color:#fff">ยืนยัน</button></div></form>', { center: true, sticky: true });
    const K = () => ($('input[name="md-k"]:checked', w) || {}).value || 'down';
    const fill = () => {
      const s = $('#md-s', w).value, L = s ? A.insts(ms()[s]).filter(i => ((sk(s, i) || {}).lv || 0) > 0) : [], kk = K(), tm = kk === 'prob' || kk === 'jail', pr = tm || kk === 'out';
      $('#md-iw', w).hidden = pr; $('#md-pw', w).hidden = !tm; $('#md-xw', w).hidden = pr; $('#md-ow', w).hidden = kk !== 'out'; $('#md-jw', w).hidden = kk !== 'jail'; $('#md-rr', w).hidden = kk === 'out'; $('#md-h', w).innerHTML = hist(s); if (tm && !$('#md-u', w).value) { const d = new Date(Date.now() + 30 * 864e5); $('#md-u', w).value = d.toISOString().slice(0, 10); }
      const list = L.map(i => [i, i + ' · ' + A.lvName(A.lvOf(s, i))]).concat(K() === 'strip' && L.length > 1 ? [['*', 'ทุกเครื่องดนตรี']] : []);
      $('#md-i', w).innerHTML = list.length ? opt(list, inst0 && L.includes(inst0) ? inst0 : L[0]) : '<option value="">— ยังไม่มียศ —</option>'; fillLv();
    };
    const fillLv = () => {
      const s = $('#md-s', w).value, i = $('#md-i', w).value, cur = s && i && i !== '*' ? A.lvOf(s, i) : 0, strip = K() === 'strip';
      $('#md-lw', w).hidden = strip || ['prob', 'jail', 'out'].includes(K());
      $('#md-now', w).innerHTML = s && i && i !== '*' ? '<div class="muted" style="font-size:.85rem;margin-bottom:6px">ยศปัจจุบัน: ' + esc(A.lvName(cur)) + ' · หลอด ' + xpOf(s, i) + '/' + XPMAX() + ' แต้ม</div>' : '';
      $('#md-l', w).innerHTML = cur > 1 ? opt(lvs.slice(0, cur - 1).map((l, k) => [k + 1, 'Lv.' + (k + 1) + (l.name ? ' ' + l.name : '')]), cur - 1) : '<option value="">— ลดต่ำกว่านี้ไม่ได้ ใช้ “ถอดยศ” —</option>';
    };
    fill(); $('#md-s', w).addEventListener('change', fill); $('#md-i', w).addEventListener('change', fillLv);
    w.addEventListener('change', e => { if (e.target.name === 'md-k') fill(); if (e.target.id === 'md-r') { $('#md-rw', w).hidden = !e.target.checked; if (e.target.checked && !$('#md-rd', w).value) $('#md-rd', w).value = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10); } });
    $('form', w).addEventListener('submit', async ev => {
      ev.preventDefault(); const err = $('#md-err', w), bad = t => { err.textContent = t; err.hidden = false; };
      const s = $('#md-s', w).value, i = $('#md-i', w).value, k = K(), tags = Array.from(w.querySelectorAll('input[name="md-t"]:checked')).map(c => c.value), note = $('#md-n', w).value.trim();
      const pr = k === 'prob' || k === 'jail', nx = pr || k === 'out', until = $('#md-u', w).value, cond = $('#md-c', w).value.trim(), red = k !== 'out' && $('#md-r', w).checked, rt = $('#md-rt', w).value.trim(), rd = $('#md-rd', w).value;
      if (!s) return bad('เลือกสมาชิก'); if (!nx && !i) return bad('สมาชิกคนนี้ยังไม่มียศให้ลด/ถอด — ใช้ “ทัณฑ์บน” แทนได้'); if (!tags.length) return bad('เลือกมลทินอย่างน้อย 1 ข้อ');
      if (pr && (!until || until < A.todayISO())) return bad('กำหนดวันพ้นโทษ (ตั้งแต่วันนี้เป็นต้นไป)'); if (red && (!rt || !rd)) return bad('ระบุงานบำเพ็ญประโยชน์และวันที่ต้องทำให้เสร็จ');
      if (tags.includes('other') && !note) return bad('มลทิน “อื่น ๆ” — กรุณาระบุรายละเอียด');
      const to = k === 'down' ? +$('#md-l', w).value : 0; if (k === 'down' && !to) return bad('เลือกยศใหม่ (ถ้าลดต่ำกว่านี้ไม่ได้ ให้เลือก “ถอดยศ”)');
      const pub = $('#md-pub', w).checked, clr = $('#md-x', w).checked, now = Date.now(), list = pr ? [] : k === 'out' ? A.insts(ms()[s]).filter(x => ((sk(s, x) || {}).lv || 0) > 0) : i === '*' ? A.insts(ms()[s]).filter(x => A.lvOf(s, x) > 0) : [i];
      const what = k === 'out' ? 'ขับออกจากชมรม' : k === 'jail' ? 'จำตรุถึง ' + A.dTH(until, 'short') + (cond ? ' (' + cond + ')' : '') : pr ? 'ทัณฑ์บนถึง ' + A.dTH(until, 'short') + (cond ? ' (' + cond + ')' : '') : kTxt(k, to) + ' ' + (i === '*' ? 'ทุกเครื่องดนตรี' : 'เครื่อง' + i);
      if (!(await M.confirmBox('ยืนยัน' + KT[k], esc(nm(s)) + ' — ' + esc(what) + '<br>มลทิน: ' + esc(tagTxt(tags)) + (red ? '<br>มอบภารกิจไถ่โทษ: ' + esc(rt) : '') + (pub ? '<br><b>จะประกาศให้ทั้งชมรมทราบ</b>' : ''), 'ยืนยัน', true))) return;
      if (k === 'out' && !(await M.confirmBox('ยืนยันอีกครั้ง: ขับออกจากชมรม', '<b>' + esc(nm(s)) + '</b> จะถูกนำออกจากชมรมทันทีและเข้าแอปของชมรมนี้ไม่ได้<br>ยศทุกเครื่องถูกถอด · ประวัติเก็บไว้ · กู้คืนได้ภายหลัง', 'ขับออก', true))) return;
      const upd = {}, lid = B.uid(), from = {}; list.forEach(x => { from[x] = (sk(s, x) || {}).lv || 0; }); const mid = red ? B.uid() : null;
      list.forEach(x => { const old = sk(s, x), keep = !clr && old.xp ? { xp: old.xp } : {};
        upd[CP() + 'skills/' + s + '/' + x] = Object.assign(k === 'strip' || k === 'out' ? {} : { lv: to }, { at: now, by: A.myName(), dAt: now }, keep); });
      upd[CP() + 'ranklog/' + s + '/' + lid] = { k, inst: nx ? null : i, from: list.length ? from : null, to: k === 'down' ? to : null, until: pr ? until : null, cond: pr && cond ? cond : null, tags, note: note || null, pub: pub || null, mis: mid, at: now, by: A.myName() };
      if (pub) upd[CP() + 'rankpub/' + B.uid()] = { sid: s, name: nm(s), k, inst: nx ? null : i, to: k === 'down' ? to : null, until: pr ? until : null, tags, at: now, by: A.myName() };
      if (k === 'jail') upd[CP() + 'jail/' + s] = { until, at: now, log: lid };
      if (k === 'out') { const mp = CP() + 'members/' + s + '/'; upd[mp + 'status'] = 'removed'; upd[mp + 'removedReason'] = 'expel'; upd[mp + 'removedAt'] = now; upd[mp + 'removedBy'] = A.myName(); upd[CP() + 'roles/' + s] = null; upd[CP() + 'jail/' + s] = null; upd['/people/' + s + '/clubs/' + (M.C._club || cid())] = null; }
      if (red) upd[CP() + 'mis/' + mid] = { t: 'ไถ่โทษ: ' + rt.slice(0, 100), d: rt + '\n\n(ภารกิจบำเพ็ญประโยชน์เพื่อไถ่โทษ — มลทิน: ' + tagTxt(tags) + ')', cat: 'redeem', star: 1, xp: 0, inst: 'main', from: A.todayISO(), to: rd, who: { [s]: true }, st: 'open', at: now, by: A.myName(), y: A.year(), redeem: { sid: s, log: lid, k, from: list.length ? from : null } };
      A.W(B.update('', upd)); A.log('rank.' + k, s, what + ' · ' + tagTxt(tags) + (red ? ' · ไถ่โทษ: ' + rt : ''));
      if (window.PUSH) {
        if ($('#md-me', w).checked) window.PUSH.notify('msg', { title: k === 'jail' ? 'แจ้งโทษจำตรุ' : k === 'out' ? 'แจ้งการขับออกจากชมรม' : pr ? 'แจ้งการทัณฑ์บน' : k === 'strip' ? 'แจ้งการถอดยศ' : 'แจ้งการปรับลดยศ', body: what + ' · มลทิน: ' + tagTxt(tags) + (red ? ' · ภารกิจไถ่โทษ: ' + rt : '') + (note ? ' · ' + note : ''), to: [s], url: red ? '#/mi/' + mid : '#/mis' });
        if (pub) window.PUSH.notify('ann', { title: '📢 ประกาศจากชมรม', body: nm(s) + ' ' + (k === 'jail' ? 'ต้องโทษจำตรุถึง ' + A.dTH(until, 'short') : k === 'out' ? 'ถูกขับออกจากชมรม' : pr ? 'อยู่ระหว่างทัณฑ์บนถึง ' + A.dTH(until, 'short') : (k === 'strip' ? 'ถูกถอดยศ' : 'ถูกลดยศเป็น ' + A.lvName(to)) + ' (' + (i === '*' ? 'ทุกเครื่องดนตรี' : 'เครื่อง' + i) + ')') + ' · มลทิน: ' + tagTxt(tags), url: '#/home' });
      }
      w.remove(); toast('บันทึก' + KT[k] + 'แล้ว' + (red ? ' · มอบภารกิจไถ่โทษแล้ว' : '') + (pub ? ' · ประกาศให้ทั้งชมรมทราบ' : ' (ไม่ประกาศ)'), 4500);
    });
  }
  window.MIS.downForm = downForm;
  A.ACT.probEnd = async d => { if (!T()) return; if (!(await M.confirmBox('ยุติทัณฑ์บน', esc(nm(d.sid)) + ' พ้นทัณฑ์บนก่อนกำหนด', 'ยุติทัณฑ์บน'))) return; A.W(B.set(CP() + 'ranklog/' + d.sid + '/' + d.id + '/end', Date.now())); A.log('rank.probEnd', d.sid, ''); toast('ยุติทัณฑ์บนแล้ว'); };
  A.ACT.misDown = d => { if (T()) downForm(d && d.sid, d && d.inst); };
  A.ACT.rankDown = A.ACT.misDown;

  /* ภารกิจไถ่โทษสำเร็จ: คืนยศเดิม / ยุติทัณฑ์บน */
  function redeemDone(m, sid, back, endProb, upd) {
    const r = m.redeem || {}, now = Date.now();
    if (back && r.from) Object.keys(r.from).forEach(x => { const lv = +r.from[x]; if (!lv) return; const P0 = CP() + 'skills/' + sid + '/' + x + '/'; upd[P0 + 'lv'] = lv; upd[P0 + 'at'] = now; upd[P0 + 'by'] = A.myName(); });
    if (back && r.from) upd[CP() + 'ranklog/' + sid + '/' + B.uid()] = { k: 'back', inst: Object.keys(r.from).length > 1 ? '*' : Object.keys(r.from)[0], from: null, to: Object.keys(r.from).length === 1 ? +r.from[Object.keys(r.from)[0]] : null, tags: null, note: 'ทำภารกิจบำเพ็ญประโยชน์ไถ่โทษสำเร็จ: ' + String(m.t || '').replace(/^ไถ่โทษ:\s*/, ''), at: now, by: A.myName() };
    if (endProb) { const p = probOf(sid); if (p) upd[CP() + 'ranklog/' + sid + '/' + p.id + '/end'] = now; }
  }
  window.MIS.redeemDone = redeemDone; window.MIS.probOf = probOf; window.MIS.logOf = logOf; window.MIS.allLog = allLog; window.MIS.logRow = logRow;

  /* ---------- ปุ่ม ---------- */
  Object.assign(A.ACT, {
    misTab: d => { UI.tab = d.t; A.rerender(); },
    misNew: () => { if (T()) misForm(); },
    misEdit: d => { if (T()) misForm(d.m); },
    misCrown: () => { if (T()) promoteForm(); },
    misPromote: d => { if (T()) promoteForm(d.sid, d.inst); },
    misCfg: () => {
      if (!T()) return;
      const w = modal('<h3>ตั้งค่าหลอดแต้ม</h3><form class="form">' + fld('แต้มเต็มหลอด (ต่อการเลื่อน 1 ยศ)', '<input class="in" id="mc-x" type="number" min="10" max="10000" value="' + XPMAX() + '">', 'แนะนำ 100 · ภารกิจง่าย 10 กลาง 20 ยาก 40 แต้ม (ปรับได้ทุกภารกิจ)') +
        '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn grow">บันทึก</button></div></form>', { center: true });
      $('form', w).addEventListener('submit', ev => { ev.preventDefault(); const v = Math.max(10, Math.min(10000, Math.round(+$('#mc-x', w).value || 100))); A.W(B.set('config/xpMax', v)); A.log('mis.cfg', '', 'xpMax ' + v); w.remove(); toast('บันทึกแล้ว'); });
    },
    misClose: d => { const m = one(d.m); if (!T() || !m) return; A.W(B.set(CP() + 'mis/' + m.id + '/st', m.st === 'closed' ? 'open' : 'closed')); toast(m.st === 'closed' ? 'เปิดภารกิจอีกครั้งแล้ว' : 'ปิดภารกิจแล้ว'); },
    misDel: async d => { const m = one(d.m); if (!T() || !m) return; if (!(await M.confirmBox('ลบภารกิจ', 'ลบ “' + esc(m.t) + '” และผลรายคนทั้งหมด · แต้มที่ให้ไปแล้วยังอยู่ในหลอด', 'ลบ', true))) return;
      const upd = {}; upd[CP() + 'mis/' + m.id] = null; upd[CP() + 'misp/' + m.id] = null; A.W(B.update('', upd)); A.log('mis.del', '', m.t); location.hash = '#/mis'; },
    misPg: d => { if (!T()) return; const upd = {}; upd[RP(d.m, d.sid) + '/pg'] = +d.v; upd[RP(d.m, d.sid) + '/rv'] = Date.now(); A.W(B.update('', upd)); },
    misNote: d => { const m = one(d.m); if (!T() || !m) return; const r = recOf(m.id, d.sid);
      const w = modal('<h3>💬 ความเห็นถึง ' + esc(nm(d.sid)) + '</h3><form class="form">' + fld('ข้อความ (นักเรียนเห็น)', '<textarea class="in" id="mn-t" rows="3" maxlength="400">' + esc(r.tn || '') + '</textarea>') + '<label class="ck wide"><input type="checkbox" id="mn-p" checked> แจ้งเตือนนักเรียน</label><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn grow">บันทึก</button></div></form>', { center: true });
      $('form', w).addEventListener('submit', ev => { ev.preventDefault(); const t = $('#mn-t', w).value.trim(), upd = {}; upd[RP(m.id, d.sid) + '/tn'] = t || null; upd[RP(m.id, d.sid) + '/rv'] = Date.now(); A.W(B.update('', upd));
        if (t && $('#mn-p', w).checked && window.PUSH) window.PUSH.notify('msg', { title: '💬 ครูให้ความเห็นภารกิจ', body: m.t + ': ' + t, to: [d.sid], url: '#/mi/' + m.id }); w.remove(); toast('บันทึกแล้ว'); }); },
    misDone: d => { const m = one(d.m); if (T() && m) doneForm(m, d.sid); },
    misFail: async d => { const m = one(d.m); if (!T() || !m) return; if (!(await M.confirmBox('ภารกิจไม่สำเร็จ', esc(nm(d.sid)) + ' · ' + esc(m.t) + ' — ไม่ได้แต้ม (ยกเลิกผลได้ภายหลัง)', 'บันทึก'))) return;
      const upd = {}; upd[RP(m.id, d.sid) + '/st'] = 'fail'; upd[RP(m.id, d.sid) + '/rv'] = Date.now(); A.W(B.update('', upd)); A.log('mis.fail', d.sid, m.t); },
    misUndo: async d => { const m = one(d.m); if (!T() || !m) return; const r = recOf(m.id, d.sid);
      if (!(await M.confirmBox('ยกเลิกผลประเมิน', 'กลับเป็น “กำลังทำ”' + (r.st === 'done' && r.xp ? ' และหักแต้ม ' + r.xp + ' ออกจากหลอด' + esc(r.inst || '') : ''), 'ยกเลิกผล'))) return;
      const upd = {}; ['st', 'xp', 'inst', 'doneAt'].forEach(k => { upd[RP(m.id, d.sid) + '/' + k] = null; }); upd[RP(m.id, d.sid) + '/rv'] = Date.now();
      if (r.st === 'done' && r.xp && r.inst) upd[CP() + 'skills/' + d.sid + '/' + r.inst + '/xp'] = Math.max(0, xpOf(d.sid, r.inst) - r.xp) || null;
      A.W(B.update('', upd)); A.log('mis.undo', d.sid, m.t); },
    misSave: d => saveMine(d.m, false),
    misSend: d => saveMine(d.m, true)
  });
  /* ติ๊กเป้าหมายย่อย (นักเรียน) */
  document.addEventListener('change', e => { const c = e.target; if (!c || !c.dataset || !c.dataset.msck || T() || !me()) return; A.W(B.set(RP(c.dataset.m, me()) + '/s/ck/' + c.dataset.k, c.checked ? true : null)); });
  /* ---------- รุ่น 3.37: สมุดต่อเพลง · วันนี้ของฉัน · ภารกิจตรวจอัตโนมัติจากเกม · รายงานรายบุคคล ----------
     rep/{id} = เพลงที่ชมรมต่อ (ครูเขียน) · repp/{sid}/{id} = { st: 1 กำลังต่อ · 2 จำได้แล้ว · 3 ขึ้นวงได้ } (ครูเขียน เจ้าตัวอ่าน) */
  A.SUBS.push({ key: 'rep', path: () => CP() + 'rep' });
  const RST = [['·', 'ยังไม่เริ่ม', 'line'], ['◔', 'กำลังต่อ', 'gold'], ['◑', 'จำได้แล้ว', 'plum'], ['●', 'ขึ้นวงได้', 'ok']];
  const SKN = { ear: 'การฟัง', rhythm: 'จังหวะ', melody: 'ทำนอง', inst: 'เครื่องดนตรี' };
  const reps = () => Object.keys(A.D.rep || {}).map(id => Object.assign({ id }, A.D.rep[id])).sort((a, b) => (a.o || 0) - (b.o || 0));
  let rkey = '', roff = null, RPD = null;
  function REPP() {
    const key = cid() + '|' + (T() ? 'T' : me()); if (!T() && !me()) return {};
    if (key !== rkey) { if (roff) roff(); RPD = null; rkey = key; roff = B.on(CP() + 'repp' + (T() ? '' : '/' + me()), v => { RPD = T() ? (v || {}) : { [me()]: v || {} }; A.rerender(); }, () => { RPD = {}; }); }
    return RPD || {};
  }
  const rst = (sid, id) => +(((REPP()[sid] || {})[id] || {}).st) || 0;
  const st2 = document.createElement('style');
  st2.textContent = '.rp-w{overflow:auto;border:1px solid var(--line);border-radius:12px;background:#fff}.rp-g{border-collapse:collapse;font-size:.85rem}.rp-g th,.rp-g td{border-bottom:1px solid var(--line);padding:4px 6px;text-align:center;white-space:nowrap}.rp-g th:first-child,.rp-g td:first-child{position:sticky;left:0;background:#fff;text-align:left;z-index:1;max-width:150px;overflow:hidden;text-overflow:ellipsis}.rp-g thead th{position:sticky;top:0;background:#faf5f8;font-weight:600;max-width:110px;white-space:normal;vertical-align:bottom}.rp-c{border:0;background:none;font-size:1.25rem;line-height:1;cursor:pointer;padding:4px 8px;border-radius:8px}.rp-c.s1{color:#c9930a}.rp-c.s2{color:#7a3d73}.rp-c.s3{color:#2e9d57}.rp-c.s0{color:#bbb}';
  document.head.appendChild(st2);
  A.NAVS.push({ id: 'rep', label: 'สมุดต่อเพลง', icon: 'flag', order: 34, show: () => T() || reps().length > 0 });
  const RUI = { inst: '' };
  A.V.rep = function () {
    const L = reps(), leg = '<div class="muted" style="font-size:.82rem;margin:8px 0">' + RST.map(x => x[0] + ' ' + x[1]).join(' &nbsp; ') + '</div>';
    if (!T()) {
      const b = L.map(r => { const s = RST[rst(me(), r.id)]; return '<div class="card rowcard"><div class="grow"><b>' + esc(r.t) + '</b></div>' + chip(s[0] + ' ' + s[1], s[2]) + '</div>'; }).join('') || '<div class="empty">ครูยังไม่ได้ลงรายการเพลง</div>';
      return { title: 'สมุดต่อเพลงของฉัน', body: '<div class="note">ครูเป็นผู้บันทึกว่าแต่ละเพลงเราต่อถึงขั้นไหน — ต่อได้แล้วบอกครูให้ตรวจ</div>' + b };
    }
    const ins = A.instList(), act = A.activeSids().filter(s => !RUI.inst || A.insts(ms()[s]).includes(RUI.inst)).sort(A.byClass);
    let b = '<div class="row wrap" style="gap:8px;margin-bottom:10px"><button class="btn gold" data-act="repNew">' + ic('plus', 18) + 'เพิ่มเพลง</button><select class="in" data-rpi style="max-width:170px">' + opt([['', 'ทุกเครื่องดนตรี']].concat(ins.map(i => [i, i])), RUI.inst) + '</select></div>';
    if (!L.length) return { title: 'สมุดต่อเพลง', body: b + '<div class="empty">ยังไม่มีเพลง — กด “เพิ่มเพลง” เพื่อลงรายการเพลงที่ชมรมกำลังต่อ</div>' };
    b += '<div class="muted" style="font-size:.82rem">แตะช่องเพื่อเปลี่ยนสถานะทีละขั้น</div>' + leg + '<div class="rp-w"><table class="rp-g"><thead><tr><th>สมาชิก (' + act.length + ')</th>' + L.map(r => '<th>' + esc(r.t) + '<br><button class="rp-c s0" style="font-size:.8rem" data-act="repDel" data-id="' + esc(r.id) + '" title="ลบเพลงนี้">✕</button></th>').join('') + '</tr></thead><tbody>' +
      act.map(s => '<tr><td title="' + esc(nm(s)) + '">' + esc(ms()[s].first || nm(s)) + ' <small class="muted">' + esc(A.cls(ms()[s])) + '</small></td>' + L.map(r => { const v = rst(s, r.id); return '<td><button class="rp-c s' + v + '" data-act="repSet" data-sid="' + esc(s) + '" data-id="' + esc(r.id) + '" title="' + RST[v][1] + '">' + RST[v][0] + '</button></td>'; }).join('') + '</tr>').join('') +
      '<tr><td><b>ขึ้นวงได้</b></td>' + L.map(r => '<td><b>' + act.filter(s => rst(s, r.id) === 3).length + '</b></td>').join('') + '</tr></tbody></table></div>';
    return { title: 'สมุดต่อเพลง', body: b };
  };
  document.addEventListener('change', e => { if (e.target && e.target.dataset && 'rpi' in e.target.dataset) { RUI.inst = e.target.value; A.rerender(); } });
  Object.assign(A.ACT, {
    repSet: d => { if (!T()) return; const n = (rst(d.sid, d.id) + 1) % 4; A.W(B.set(CP() + 'repp/' + d.sid + '/' + d.id, n ? { st: n, at: Date.now(), by: A.myName() } : null)); },
    repNew: () => { if (!T()) return; const lib = Object.keys(A.D.library || {}).map(k => A.D.library[k]).filter(x => x && x.kind === 'song').map(x => (x.song && x.song.title) || x.title).filter(Boolean), have = new Set(reps().map(r => r.t));
      const w = modal('<h3>เพิ่มเพลงในสมุดต่อเพลง</h3><form class="form">' + fld('ชื่อเพลง', '<input class="in" id="rn-t" maxlength="80" list="rn-l" required placeholder="เช่น ลาวดวงเดือน สองชั้น"><datalist id="rn-l">' + [...new Set(lib)].filter(t => !have.has(t)).map(t => '<option value="' + esc(t) + '">').join('') + '</datalist>', 'พิมพ์เอง หรือเลือกจากเพลงในสื่อของชมรม') + '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">เพิ่ม</button></div></form>', { center: true });
      $('form', w).addEventListener('submit', ev => { ev.preventDefault(); const t = $('#rn-t', w).value.trim(); if (!t) return; A.W(B.set(CP() + 'rep/' + B.uid(), { t, o: Date.now(), at: Date.now(), by: A.myName() })); A.log('rep.new', '', t); w.remove(); toast('เพิ่มเพลงแล้ว'); }); },
    repDel: async d => { const r = (A.D.rep || {})[d.id]; if (!T() || !r) return; if (!(await M.confirmBox('ลบเพลงออกจากสมุด', '“' + esc(r.t) + '” และสถานะของทุกคนในเพลงนี้จะไม่แสดงอีก', 'ลบ', true))) return; A.W(B.remove(CP() + 'rep/' + d.id)); A.log('rep.del', '', r.t); },
    misReport: () => { if (T()) report(); }
  });
  /* การ์ด “วันนี้ของฉัน” บนสุดของหน้าหลักนักเรียน */
  A.HOME.push({ order: 4, html: () => {
    if (T() || !me() || !ms()[me()]) return ''; const i0 = mainInst(me()), op = myOpen(), near = op.slice().sort((a, b) => String(a.to || '').localeCompare(String(b.to || '')))[0], L = reps(), lrn = L.filter(r => rst(me(), r.id) === 1), got = L.filter(r => rst(me(), r.id) >= 2).length;
    const row = (href, a, b2) => '<a href="' + href + '" class="row" style="padding:7px 0;border-top:1px dashed var(--line);gap:8px;color:inherit;text-decoration:none"><span class="grow">' + a + '</span>' + b2 + '</a>';
    return '<section class="card" style="border:2px solid var(--plum)"><div class="lb">☀️ วันนี้ของฉัน</div>' + (i0 ? xpBar(me(), i0) : '') +
      row('#/mis', '📜 ภารกิจที่ต้องทำ' + (near ? '<div class="muted" style="font-size:.8rem">ใกล้กำหนด: ' + esc(near.t) + '</div>' : ''), '<b>' + op.length + '</b>' + (near ? dl(near) : '')) +
      (L.length ? row('#/rep', '🎵 เพลงที่กำลังต่อ' + (lrn.length ? '<div class="muted" style="font-size:.8rem">' + esc(lrn.slice(0, 3).map(r => r.t).join(' · ')) + '</div>' : ''), '<b>' + lrn.length + '</b><small class="muted">ได้แล้ว ' + got + '/' + L.length + '</small>') : '') + '</section>';
  } });
  /* ภารกิจตรวจอัตโนมัติ: ผลจากเกม (skill.js) ถึงเกณฑ์ → บันทึกผลและส่งให้ครูตรวจเอง */
  window.addEventListener('message', e => {
    const d = e.data; if (!d || d.type !== 'spw-skill' || e.origin !== location.origin || T() || !me()) return;
    myOpen().forEach(m => { if (!m.auto || m.auto.k !== d.k || +d.v < +m.auto.min) return; const r = recOf(m.id, me()); if (r.s && r.s.auto && +r.s.auto.v >= +d.v) return;
      A.W(B.update(RP(m.id, me()) + '/s', { auto: { v: Math.round(+d.v), g: String(d.g || '').slice(0, 24), at: Date.now() }, sent: Date.now() })); toast('🎯 ผ่านเกณฑ์ภารกิจ “' + m.t + '” (' + Math.round(+d.v) + '%) — ส่งให้ครูตรวจแล้ว', 5000); });
  });
  /* รายงานรายบุคคล: ยศ แต้ม ภารกิจ เพลง */
  function report() {
    const p = P() || {}, L = reps(), act = A.activeSids().sort(A.byClass), M0 = all();
    const head = ['ที่', 'ชื่อ-สกุล', 'ชั้น', 'เครื่องหลัก', 'ยศ', 'แต้ม', 'ภารกิจสำเร็จ', 'เพลงที่ได้', 'หมายเหตุ'];
    const rows = act.map((s, i) => { const i0 = mainInst(s), mine2 = M0.filter(m => (m.who || {})[s]), done = mine2.filter(m => (((p[m.id] || {})[s]) || {}).st === 'done').length, pb = probOf(s);
      return [String(i + 1), nm(s), A.cls(ms()[s]), i0 || '-', i0 ? A.lvName(A.lvOf(s, i0)) : '-', i0 ? xpOf(s, i0) + '/' + XPMAX() : '-', done + '/' + mine2.length, L.length ? L.filter(r => rst(s, r.id) >= 2).length + '/' + L.length : '-', pb ? 'ทัณฑ์บนถึง ' + A.dTH(pb.until, 'short') : '']; });
    const widths = [5, 22, 8, 12, 16, 9, 10, 9, 9], al = ['c', '', 'c', '', '', 'c', 'c', 'c', ''], title = 'รายงานยศ ภารกิจ และการต่อเพลงรายบุคคล', sub = M.C.club.full + ' · ข้อมูล ณ ' + M.thDate(Date.now()), name = M.safeName(title);
    const w = modal('<h3>ส่งออกรายงาน</h3><div class="muted" style="margin-bottom:8px">สมาชิก ' + act.length + ' คน · ยศและแต้มของเครื่องหลัก · ภารกิจสำเร็จ · เพลงที่จำได้แล้วขึ้นไป</div><div class="xlist"><button class="xbtn" data-x="pdf"><b>PDF</b><span>พิมพ์ / ส่งในแชท</span></button><button class="xbtn" data-x="docx"><b>DOCX</b><span>เปิดแก้ต่อใน Word</span></button></div><div class="muted" id="x-msg" style="margin-top:10px"></div><button class="btn ghost block" data-close style="margin-top:12px">ปิด</button>', { center: true });
    w.addEventListener('click', async ev => { const b = ev.target.closest('[data-x]'); if (!b) return; const msg = $('#x-msg', w); msg.textContent = 'กำลังสร้างไฟล์ …';
      try { if (b.dataset.x === 'docx') await M.saveBlob(M.docxTable({ title, lines: [sub], head, rows, widths, align: al.map(a => a === 'c' ? 'center' : 'left'), footer: ['', 'พัฒนาโดย นายนนทพัทธ์ วงค์มูล © 2026'] }), name + '.docx');
        else await M.exportPDF(A.tablePages(title, sub, head, rows, { widths, align: al, foot: 'ข้อมูล ณ ' + M.thDate(Date.now()) + ' ·' }), name + '.pdf'); msg.textContent = 'เสร็จแล้ว'; }
      catch (er) { msg.textContent = 'ส่งออกไม่สำเร็จ: ' + (er.message || er); } });
  }
  function saveMine(mid, send) {
    const m = one(mid); if (!m || !me()) return; const note = ($('#ms-note') || {}).value || '', link = (($('#ms-link') || {}).value || '').trim();
    if (link && !/^https?:\/\//i.test(link)) return toast('ลิงก์ต้องขึ้นต้นด้วย https://');
    const v = { note: note.trim() || null, link: link || null }; if (send) v.sent = Date.now();
    A.W(B.update(RP(mid, me()) + '/s', v).then(() => toast(send ? 'ส่งให้ครูตรวจแล้ว' : 'บันทึกแล้ว')));
  }
})();
