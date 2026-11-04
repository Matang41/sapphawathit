/* ============================================================
   musicskill.js — รุ่น 3.17: ทักษะดนตรีจากเกม (หน้าสรุปรายคนสำหรับครู + การ์ดของนักเรียน)
   เกมส่งผลผ่าน games/skill.js → แอปรวมเป็น 4 ด้าน
     ear ฟัง · rhythm จังหวะ · melody ทำนอง · inst เครื่องดนตรี   (คะแนน 0–100 ต่อหนึ่งครั้งที่ทำ)
   ข้อมูล: c/{ชมรม}/usage/{sid}/sk/{ทักษะ}        = { n ครั้ง, s ผลรวมคะแนน, b ดีที่สุด, l ล่าสุด, t เวลา }
           c/{ชมรม}/usage/{sid}/d/{วันที่}/k/{ทักษะ} = { n, s }   (ไว้ดูแนวโน้มรายวัน)
   บันทึกเฉพาะบัญชีนักเรียน · นักเรียนเห็นของตัวเอง ครูเห็นทั้งชมรม (ใช้ Rules รุ่น 11)
   พัฒนาโดย นายนนทพัทธ์ วงค์มูล 2026
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP, C = M.C;
  const { $, esc, toast, modal } = M; const { ic, chip } = A;
  const T = () => A.teacher(), DAY = 864e5, QK = 'spw_skill_q';
  const KS = [['ear', 'ฟัง', 'แยกระดับเสียง ทายโน้ต ทำนองขึ้น–ลง'], ['rhythm', 'จังหวะ', 'ตีตรงจังหวะ ฟังหน้าทับ ตีเข้ากับวง'], ['melody', 'ทำนอง', 'จำและอ่านทำนองเพลงไทยทีละบรรทัด'], ['inst', 'เครื่องดนตรี', 'ฟังแล้วบอกได้ว่าเป็นเครื่องอะไร']];
  const KN = Object.fromEntries(KS.map(k => [k[0], k[1]]));
  const TIP = { ear: 'หูทองสรรพวาทิต โหมด “ทายโน้ต” และ “ทำนองขึ้นหรือลง”', rhythm: 'แห่กลองปู่เจ่ · แห่กลองหลวง · หูทองโหมด “ทายหน้าทับ”', melody: 'ตำนานสรรพวาทิต: ผีลืมเพลงที่แท่นโน้ตห้อง 512', inst: 'หูทองสรรพวาทิต โหมด “ทายเครื่องดนตรี”' };
  Object.assign(A.ICON, { spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>' });
  const base = () => '/c/' + C.club.id + '/usage';
  const iso = d => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const daysBack = n => Array.from({ length: n }, (_, i) => iso(Date.now() - i * DAY));

  /* ---------- รับผลจากเกม (นักเรียน) ---------- */
  const BUF = {}; let flushT = 0; const drained = false;
  const me = () => { const sid = A.sid(); return sid && !T() && A.members && A.members()[sid] ? sid : null; };
  function add(k, v) {
    if (!KN[k]) return; v = Math.max(0, Math.min(100, Math.round(+v || 0)));
    const o = BUF[k] = BUF[k] || { n: 0, s: 0, b: 0, l: 0 }; o.n++; o.s += v; o.b = Math.max(o.b, v); o.l = v;
    clearTimeout(flushT); flushT = setTimeout(flush, 6000);
  }
  function requeue(k, o) { try { const q = JSON.parse(localStorage.getItem(QK) || '[]'), a = Math.round(o.s / o.n); for (let i = 0; i < Math.min(o.n, 40); i++) q.push({ k, v: a }); localStorage.setItem(QK, JSON.stringify(q.slice(-400))); } catch (e) { /* ignore */ } }
  async function flush() {
    const sid = me(); if (!sid) { if (!T()) Object.keys(BUF).forEach(k => { requeue(k, BUF[k]); delete BUF[k]; }); return; }   /* ยังไม่ได้เลือกชมรม/ยังโหลดไม่เสร็จ: เก็บไว้ก่อน */
    const day = iso(Date.now());
    for (const k of Object.keys(BUF)) {
      const o = BUF[k]; delete BUF[k];
      try {
        await B.tx(base() + '/' + sid + '/sk/' + k, v => { v = v || {}; return { n: (v.n || 0) + o.n, s: (v.s || 0) + o.s, b: Math.max(v.b || 0, o.b), l: o.l, t: Date.now() }; });
        await B.tx(base() + '/' + sid + '/d/' + day + '/k/' + k, v => { v = v || {}; return { n: (v.n || 0) + o.n, s: (v.s || 0) + o.s }; });
      } catch (e) { requeue(k, o); }   /* เช่น Rules บนเซิร์ฟเวอร์ยังเป็นรุ่นเก่า: เก็บไว้ส่งครั้งหน้า */
    }
  }
  window.addEventListener('message', e => { if (e.origin !== location.origin) return; const d = e.data; if (d && d.type === 'spw-skill') add(d.k, d.v); });
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  setInterval(() => { if (!me()) return; let q = []; try { q = JSON.parse(localStorage.getItem(QK) || '[]'); if (q.length) localStorage.removeItem(QK); } catch (e) { /* ignore */ } q.forEach(m => add(m.k, m.v)); }, drained ? 30000 : 4000);

  /* ---------- คำนวณ ---------- */
  const U = () => A.D.usage || {};
  const sk = sid => ((U()[sid] || {}).sk) || {};
  const avg = o => o && o.n ? Math.round(o.s / o.n) : null;
  const lvC = a => a == null ? 'none' : a >= 75 ? 'hi' : a >= 50 ? 'mid' : 'lo';
  const lvT = a => a == null ? 'ยังไม่มีข้อมูล' : a >= 75 ? 'ดี' : a >= 50 ? 'พอใช้' : 'ควรฝึกเพิ่ม';
  function prof(sid) {
    const s = sk(sid), o = {}; let n = 0, last = 0;
    KS.forEach(([k]) => { const x = s[k]; o[k] = { a: avg(x), n: (x && x.n) || 0, b: x && x.b, l: x && x.l, t: x && x.t }; n += o[k].n; last = Math.max(last, (x && x.t) || 0); });
    const has = KS.filter(([k]) => o[k].a != null), weak = has.slice().sort((a, b) => o[a[0]].a - o[b[0]].a)[0];
    return { o, n, last, weak: weak && o[weak[0]].a < 75 ? weak[0] : null, min: has.length ? Math.min(...has.map(([k]) => o[k].a)) : null };
  }
  function daily(sid, k, n) { const d = ((U()[sid] || {}).d) || {}; return daysBack(n).reverse().map(day => { const r = ((d[day] || {}).k || {})[k]; return r && r.n ? Math.round(r.s / r.n) : null; }); }

  /* ---------- หน้าตา ---------- */
  if (!document.getElementById('ms-css')) { const st = document.createElement('style'); st.id = 'ms-css';
    st.textContent = '.ms-g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;min-width:0}.ms-c{font-size:.72rem;color:var(--mut);min-width:0}.ms-c b{display:block;font-size:.95rem;color:var(--ink);font-variant-numeric:tabular-nums}' +
      '.ms-b{height:6px;border-radius:99px;background:var(--line);overflow:hidden;margin-top:3px}.ms-b i{display:block;height:100%;border-radius:99px}.ms-b .hi{background:#2f8a4a}.ms-b .mid{background:var(--gold-d)}.ms-b .lo{background:var(--bad)}' +
      '.ms-row{display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:none;border:0;border-top:1px solid var(--line);padding:10px 0;cursor:pointer;color:inherit;font:inherit}.ms-row .nm{width:34%;min-width:0}.ms-row .nm b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ms-row .ms-g{flex:1}' +
      '.ms-strip{display:flex;gap:2px}.ms-strip i{flex:1;height:14px;border-radius:2px;background:var(--line)}.ms-strip i.hi{background:#2f8a4a}.ms-strip i.mid{background:var(--gold-d)}.ms-strip i.lo{background:var(--bad)}' +
      '@media (max-width:560px){.ms-row{flex-wrap:wrap}.ms-row .nm{width:100%}}';
    document.head.appendChild(st); }
  const bars = p => '<div class="ms-g">' + KS.map(([k, n]) => { const x = p.o[k]; return '<div class="ms-c">' + n + '<b>' + (x.a == null ? '–' : x.a) + '</b><div class="ms-b"><i class="' + lvC(x.a) + '" style="width:' + (x.a == null ? 0 : Math.max(4, x.a)) + '%"></i></div></div>'; }).join('') + '</div>';
  const ago = t => { if (!t) return 'ยังไม่เคยเล่น'; const d = Math.floor((Date.now() - t) / DAY); return d <= 0 ? 'วันนี้' : d === 1 ? 'เมื่อวาน' : d + ' วันก่อน'; };

  /* ---------- หน้าครู ---------- */
  A.NAVS.push({ id: 'mskill', label: 'ทักษะดนตรี', icon: 'spark', order: 44, show: () => T() });
  const UX = { sort: 'weak', cls: '' };
  A.V.mskill = function () {
    if (!T()) { location.hash = '#/home'; return null; }
    const ms = A.members(), all = A.activeSids(), P = {}; all.forEach(s => { P[s] = prof(s); });
    const classes = Array.from(new Set(all.map(s => A.cls(ms[s])).filter(Boolean))).sort();
    const sids = all.filter(s => !UX.cls || A.cls(ms[s]) === UX.cls), withData = sids.filter(s => P[s].n > 0);
    const clubAvg = k => { const a = withData.map(s => P[s].o[k].a).filter(x => x != null); return a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null; };
    const help = withData.filter(s => KS.some(([k]) => P[s].o[k].n >= 3 && P[s].o[k].a < 50));
    const order = sids.slice().sort(UX.sort === 'class' ? A.byClass : UX.sort === 'many' ? (a, b) => P[b].n - P[a].n : UX.sort.indexOf('k:') === 0 ? ((k) => (a, b) => (P[a].o[k].a == null ? 999 : P[a].o[k].a) - (P[b].o[k].a == null ? 999 : P[b].o[k].a))(UX.sort.slice(2)) : (a, b) => (P[a].min == null ? 999 : P[a].min) - (P[b].min == null ? 999 : P[b].min));
    let b = '<section class="card"><div class="row wrap"><div class="grow"><div class="lb" style="margin:0">ทักษะดนตรีจากเกม</div><div class="muted">รวมผลจากเกมของชมรมเป็น 4 ด้าน คะแนนเฉลี่ย 0–100 · นับเฉพาะบัญชีนักเรียนที่เล่นผ่านแอป</div></div>' +
      '<select class="in sm" data-ms="cls" aria-label="ระดับชั้น"><option value="">ทุกชั้น</option>' + classes.map(c => '<option' + (c === UX.cls ? ' selected' : '') + '>' + esc(c) + '</option>').join('') + '</select>' +
      '<button class="btn ghost sm" data-act="msCsv" style="margin-left:6px">ดาวน์โหลด CSV</button></div></section>';
    b += '<div class="tiles">' + KS.map(([k, n, d]) => { const a = clubAvg(k); return '<div class="tile' + (k === 'ear' ? ' dark' : '') + '"><div class="lb">' + n + '</div><div class="num">' + (a == null ? '–' : a) + '</div><div class="muted">' + esc(d) + '</div></div>'; }).join('') + '</div>';
    if (help.length) b += '<section class="card hl"><div class="lb">ควรช่วยฝึกเพิ่ม (' + help.length + ' คน)</div><div class="muted" style="margin-bottom:6px">มีอย่างน้อยหนึ่งด้านที่ทำมาแล้ว 3 ครั้งขึ้นไปแต่เฉลี่ยต่ำกว่า 50</div>' +
      help.slice(0, 12).map(s => { const p = P[s], ks = KS.filter(([k]) => p.o[k].n >= 3 && p.o[k].a < 50).map(([k]) => KN[k] + ' ' + p.o[k].a); return '<button class="mrow" data-act="msOne" data-sid="' + esc(s) + '"><span class="mrow-main">' + A.avatar(ms[s]) + '<span class="grow"><b>' + esc(A.fullName(ms[s])) + '</b><span class="muted">' + esc(A.cls(ms[s])) + ' · ' + esc(ks.join(' · ')) + '</span></span></span></button>'; }).join('') + '</section>';
    b += '<section class="card"><div class="row" style="margin-bottom:4px"><div class="lb grow" style="margin:0">รายคน (' + sids.length + ' คน · มีข้อมูล ' + withData.length + ')</div><select class="in sm" data-ms="sort" aria-label="เรียงลำดับ">' +
      A.opt([['weak', 'ด้านที่อ่อนที่สุดก่อน'], ['many', 'เล่นมากที่สุดก่อน'], ['class', 'ตามชั้น'], ['k:ear', 'ด้านฟัง ต่ำก่อน'], ['k:rhythm', 'ด้านจังหวะ ต่ำก่อน'], ['k:melody', 'ด้านทำนอง ต่ำก่อน'], ['k:inst', 'ด้านเครื่องดนตรี ต่ำก่อน']], UX.sort) + '</select></div>' +
      '<div class="muted" style="margin-bottom:4px">สีเขียว 75 ขึ้นไป · สีทอง 50–74 · สีแดงต่ำกว่า 50 · ขีด = ยังไม่เคยฝึกด้านนี้</div>' +
      (order.map(s => { const p = P[s]; return '<button class="ms-row" data-act="msOne" data-sid="' + esc(s) + '"><span class="nm"><b>' + esc(A.fullName(ms[s])) + '</b><span class="muted" style="font-size:.78rem">' + esc(A.cls(ms[s])) + ' · ' + p.n + ' ครั้ง · ' + ago(p.last) + '</span></span>' + bars(p) + '</button>'; }).join('') || '<div class="muted">ยังไม่มีสมาชิก</div>') + '</section>';
    b += '<section class="card"><div class="lb">ฝึกด้านไหน เล่นเกมอะไร</div>' + KS.map(([k, n]) => '<div class="kv"><span>' + n + '</span><b>' + esc(TIP[k]) + '</b></div>').join('') + '</section>';
    return { title: 'ทักษะดนตรี', body: b };
  };
  document.addEventListener('change', e => { const k = e.target && e.target.dataset && e.target.dataset.ms; if (!k) return; UX[k] = e.target.value; A.rerender(); });
  Object.assign(A.ACT, {
    msOne: d => {
      const s = d.sid, m = A.members()[s], p = prof(s);
      modal('<h3>' + esc(A.fullName(m)) + '</h3><div class="muted" style="margin-bottom:10px">' + esc(A.cls(m)) + ' · ฝึกในเกม ' + p.n + ' ครั้ง · ล่าสุด ' + ago(p.last) + '</div>' +
        KS.map(([k, n, dsc]) => { const x = p.o[k], st = daily(s, k, 21); return '<div style="margin:12px 0"><div class="row"><b class="grow">' + n + ' <span class="muted" style="font-weight:400;font-size:.8rem">' + esc(dsc) + '</span></b>' + chip(x.a == null ? 'ยังไม่มีข้อมูล' : x.a + ' · ' + lvT(x.a), x.a == null ? 'line' : x.a >= 75 ? 'ok' : x.a >= 50 ? 'gold' : 'bad') + '</div>' +
          '<div class="muted" style="font-size:.8rem;margin:4px 0">' + (x.n ? x.n + ' ครั้ง · ดีที่สุด ' + x.b + ' · ล่าสุด ' + x.l : 'ยังไม่เคยฝึกด้านนี้') + '</div>' +
          '<div class="ms-strip" title="21 วันล่าสุด (ซ้ายเก่า → ขวาวันนี้)">' + st.map(v => '<i class="' + (v == null ? '' : lvC(v)) + '" title="' + (v == null ? 'ไม่ได้ฝึก' : v) + '"></i>').join('') + '</div></div>'; }).join('') +
        (p.weak ? '<div class="note" style="margin-top:8px">แนะนำให้ฝึกด้าน<b>' + KN[p.weak] + '</b>เพิ่ม: ' + esc(TIP[p.weak]) + '</div>' : '') +
        '<button class="btn ghost block" data-close style="margin-top:14px">ปิด</button>', { center: true });
    },
    msCsv: () => {
      const ms = A.members(), rows = [['เลขประจำตัว', 'ชื่อ', 'ชั้น'].concat(...KS.map(([, n]) => [n + ' เฉลี่ย', n + ' ครั้ง'])).concat(['ฝึกรวม (ครั้ง)', 'ล่าสุด'])];
      A.activeSids().slice().sort(A.byClass).forEach(s => { const p = prof(s); rows.push([s, A.fullName(ms[s]), A.cls(ms[s])].concat(...KS.map(([k]) => [p.o[k].a == null ? '' : p.o[k].a, p.o[k].n])).concat([p.n, p.last ? iso(p.last) : ''])); });
      const csv = '﻿' + rows.map(r => r.map(v => { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(',')).join('\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'ทักษะดนตรี_' + C.club.name + '_' + iso(Date.now()) + '.csv'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 3000); toast('ดาวน์โหลด CSV แล้ว');
    }
  });

  /* ---------- นักเรียน: การ์ดทักษะของฉันบนหน้าหลัก ---------- */
  A.HOME.push({ order: 7, html: () => {
    const sid = A.sid(); if (!sid || T()) return ''; const p = prof(sid);
    if (!p.n) return '<section class="card"><div class="lb">ทักษะดนตรีของฉัน</div><div class="muted">เล่นเกมของชมรม (หูทอง แห่กลองปู่เจ่ แห่กลองหลวง ตำนานสรรพวาทิต) แล้วผลทั้ง 4 ด้านจะขึ้นที่นี่</div></section>';
    return '<section class="card"><div class="lb">ทักษะดนตรีของฉัน</div>' + bars(p) + (p.weak ? '<div class="muted" style="margin-top:8px">ลองฝึกด้าน<b>' + KN[p.weak] + '</b>เพิ่ม: ' + esc(TIP[p.weak]) + '</div>' : '<div class="muted" style="margin-top:8px">เก่งมาก! ทุกด้านอยู่ในระดับดี</div>') + '</section>';
  } });
  A.mskill = { prof, add, flush };
})();
