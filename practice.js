/* ============================================================
   practice.js — ขั้นที่ 2: เช็กการซ้อมเช้า/เย็น · รูปหลักฐาน · ใบลา · สรุปการซ้อม
   ข้อมูล: y/{ปี}/att/{sid}/{วัน_รอบ} = p|l|v|a · attmeta · attphoto · leaves/{sid}/{id} · leavemark/{วัน_รอบ}/{sid}
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP;
  const { $, esc, toast, modal } = M; const { ic, chip, fld, opt, avatar } = A;
  const Y = () => 'y/' + A.year();
  const checker = () => A.teacher() || A.is('president', 'vice');
  const ST = { p: ['มา', 'ok'], l: ['สาย', 'gold'], v: ['ลา', 'blue'], a: ['ขาด', 'bad'] }, ORDER = ['p', 'l', 'v', 'a'];
  const SES = { am: 'เช้า', pm: 'เย็น' };
  const WHY = ['ป่วย', 'ธุระของครอบครัว', 'กิจกรรมของโรงเรียน', 'อื่น ๆ'];
  const ACTS = ['บันทึกการตักเตือน', 'นัดพบสมาชิก', 'แจ้งผู้ปกครอง', 'ปรับรอบซ้อม', 'ปรับประเภทสมาชิก', 'อื่น ๆ'];
  const CHK = { date: A.todayISO(), ses: new Date().getHours() < 12 ? 'am' : 'pm', marks: {}, focus: {}, photo: null };
  const SUM = { range: 'term' };
  (function () { const st = document.createElement('style'); st.textContent = '.rp-page.att-g{padding:22px 24px 16px;color:#000;font-size:11px}.ag-head{display:flex;align-items:center;gap:12px;margin-bottom:8px;border-bottom:2px solid #000;padding-bottom:6px}.ag-head img{height:46px;width:auto}.ag-t{font-weight:700;font-size:16.5px}.ag-s{font-size:12.5px}' +
    'table.ag{width:100%;border-collapse:collapse;table-layout:fixed}table.ag th,table.ag td{border:1px solid #000;padding:0 1px;height:19px;text-align:center;font-size:11px;line-height:1.15;overflow:hidden;white-space:nowrap}table.ag th{font-weight:700;background:#f3eaf0}table.ag .nm{text-align:left;padding-left:4px;text-overflow:ellipsis}table.ag .w{font-weight:400;font-size:9.5px}table.ag .ab{font-weight:700}table.ag tr.sum td{font-weight:700}' +
    '.ag-foot{display:flex;gap:18px;margin-top:8px;align-items:flex-end}.ag-leg{flex:1;font-size:11px;line-height:1.55}.ag-sign{width:280px;text-align:center;font-size:13.5px;line-height:1.6}.ag-line{position:relative;height:34px;border-bottom:1px dotted #000;margin:0 24px 2px;text-align:left}.ag-line img{position:absolute;left:50%;bottom:0;transform:translateX(-50%);height:42px}'; document.head.appendChild(st); })();

  A.SUBS.push(
    { key: 'attmeta', path: y => 'y/' + y + '/attmeta' },
    { key: 'attday', path: y => 'y/' + y + '/attday' },
    { key: 'leavemark', path: y => 'y/' + y + '/leavemark' },
    { key: 'att', path: y => checker() ? 'y/' + y + '/att' : 'y/' + y + '/att/' + A.sid(), norm: v => checker() ? v : { [A.sid()]: v } },
    { key: 'focus', path: y => checker() ? 'y/' + y + '/focus' : 'y/' + y + '/focus/' + A.sid(), norm: v => checker() ? v : { [A.sid()]: v } },
    { key: 'leaves', path: y => A.teacher() ? 'y/' + y + '/leaves' : 'y/' + y + '/leaves/' + A.sid(), norm: v => A.teacher() ? v : { [A.sid()]: v } }
  );
  const pendingLeaves = () => { const o = []; const L = A.D.leaves || {}; Object.keys(L).forEach(s => Object.keys(L[s] || {}).forEach(id => { if (L[s][id].status === 'pending') o.push(Object.assign({ sid: s, id }, L[s][id])); })); return o.sort((a, b) => a.at - b.at); };
  A.NAVS.push({ id: 'practice', label: 'การซ้อม', icon: 'check', tab: 1, order: 20, badge: () => A.teacher() ? pendingLeaves().length : 0 });

  const key = (d, s) => d + '_' + s;
  const meta = (d, s) => ((A.D.attmeta || {})[d] || {})[s] || null;
  const lmark = (d, s, sid) => ((A.D.leavemark || {})[key(d, s)] || {})[sid] || '';
  const saved = (sid, d, s) => ((A.D.att || {})[sid] || {})[key(d, s)] || '';
  function roster(d, s) {
    const ms = A.members(); const set = new Set(A.activeSids().filter(x => ms[x][s]));
    Object.keys(A.D.att || {}).forEach(x => { if (ms[x] && ms[x].status === 'active' && (A.D.att[x] || {})[key(d, s)]) set.add(x); });
    return Array.from(set).sort(A.byClass);
  }
  const markOf = (sid, d, s) => CHK.marks[sid] || saved(sid, d, s) || (lmark(d, s, sid) === 'ack' || lmark(d, s, sid) === 'pending' ? 'v' : 'p');

  /* ---------- สถานะของรอบซ้อม (รุ่น 3.22): ซ้อมปกติ · วันหยุด · งดซ้อม — ครูกำหนด ----------
     y/{ปี}/attday/{วันที่}/{am|pm} = { k: 'work'|'hol'|'off', why, by, at }   · config/attCal = { wkOff, from }
     รอบที่เป็นวันหยุด/งดซ้อม ไม่นับในสถิติทุกที่ · เสาร์–อาทิตย์ถือว่าไม่มีซ้อม (ถ้าเปิด wkOff) เว้นแต่มีการเช็กชื่อจริง */
  const KIND = { work: ['ซ้อมปกติ', 'ok'], hol: ['วันหยุด', 'line'], off: ['งดซ้อม', 'gold'], wk: ['เสาร์–อาทิตย์', 'line'] };
  const cal = () => Object.assign({ wkOff: true, from: '' }, A.cfg().attCal || {});
  const dayRec = (d, s) => ((A.D.attday || {})[d] || {})[s] || null;
  const isWeekend = d => { const w = new Date(d + 'T00:00:00').getDay(); return w === 0 || w === 6; };
  function dayKind(d, s) { const r = dayRec(d, s); if (r && KIND[r.k]) return r.k; return cal().wkOff && isWeekend(d) ? 'wk' : 'work'; }
  /* รอบที่ “นับ” ในสถิติ: ซ้อมปกติ หรือ เสาร์–อาทิตย์ที่มีการเช็กชื่อจริง */
  const held = (d, s) => { const k = dayKind(d, s); return k === 'work' || (k === 'wk' && !!meta(d, s)); };
  A.attHeld = held; A.attKind = dayKind;
  const isoOf = x => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  const addDays = (d, n) => { const x = new Date(d + 'T00:00:00'); x.setDate(x.getDate() + n); return isoOf(x); };
  /* รอบที่ผ่านไปแล้ว เป็นวันซ้อมปกติ มีคนต้องซ้อม แต่ยังไม่มีใครเช็กชื่อ */
  function unchecked() {
    const t = A.todayISO(), h = new Date().getHours(), metaDates = Object.keys(A.D.attmeta || {}).sort();
    let from = cal().from || metaDates[0] || addDays(t, -30); if (from < addDays(t, -150)) from = addDays(t, -150);
    const out = [];
    for (let d = from; d <= t; d = addDays(d, 1)) ['am', 'pm'].forEach(s => {
      if (d === t && (s === 'am' ? h < 12 : h < 19)) return;
      if (dayKind(d, s) !== 'work' || meta(d, s) || !roster(d, s).length) return;
      out.push({ d, s });
    });
    return out.reverse();
  }
  /* วันหยุดราชการที่วันที่ตายตัว (วันหยุดทางพุทธศาสนาและวันหยุดชดเชยให้ครูเพิ่มเองตามประกาศ ครม.) */
  const FIXED_HOL = [['01-01', 'วันขึ้นปีใหม่'], ['04-06', 'วันจักรี'], ['04-13', 'วันสงกรานต์'], ['04-14', 'วันสงกรานต์'], ['04-15', 'วันสงกรานต์'], ['05-04', 'วันฉัตรมงคล'], ['06-03', 'วันเฉลิมพระชนมพรรษาพระราชินี'],
    ['07-28', 'วันเฉลิมพระชนมพรรษา ร.10'], ['08-12', 'วันแม่แห่งชาติ'], ['10-13', 'วันนวมินทรมหาราช'], ['10-23', 'วันปิยมหาราช'], ['12-05', 'วันพ่อแห่งชาติ'], ['12-10', 'วันรัฐธรรมนูญ'], ['12-31', 'วันสิ้นปี']];
  const acadYearGreg = () => (+A.year() || (new Date().getFullYear() + 543)) - 543;
  /* เดือนในปีการศึกษา: พ.ค. ถึง มี.ค. ปีถัดไป */
  const acadMonths = () => { const g = acadYearGreg(), o = []; for (let i = 0; i < 11; i++) { const m = (4 + i) % 12, y = g + (4 + i >= 12 ? 1 : 0); o.push(y + '-' + String(m + 1).padStart(2, '0')); } return o; };
  const monthTH = ym => A.MONTHS_F[+ym.slice(5) - 1] + ' ' + (+ym.slice(0, 4) + 543);
  const termOf = ym => { const m = +ym.slice(5); return m >= 5 && m <= 10 ? 1 : m === 4 ? 0 : 2; };

  /* ความตั้งใจ 1–3 (ผู้เช็กให้ ใช้คำนวณคะแนนพฤติกรรม) */
  const savedFocus = (sid, d, s) => (((A.D.focus || {})[sid] || {})[key(d, s)]) || 0;
  const focusOf = (sid, d, s) => CHK.focus[sid] !== undefined ? CHK.focus[sid] : savedFocus(sid, d, s);
  const focusBtns = (sid, d, s, v) => (v !== 'p' && v !== 'l') ? '' : '<span class="fcs" role="group" aria-label="ความตั้งใจ">' + [1, 2, 3].map(n => '<button class="fc' + (focusOf(sid, d, s) === n ? ' on' : '') + '" aria-pressed="' + (focusOf(sid, d, s) === n) + '" data-act="ckFocus" data-sid="' + esc(sid) + '" data-v="' + n + '">' + n + '</button>').join('') + '</span>';

  /* ---------- ตารางรายงานแบบหน้า A4 (ใช้ร่วมกับโมดูลอื่น) ---------- */
  A.tablePages = function (title, sub, head, rows, o) {
    o = o || {}; const per = o.per || 26; const root = document.createElement('div'); const n = Math.max(1, Math.ceil(rows.length / per));
    for (let i = 0; i < n; i++) {
      const pg = document.createElement('div'); pg.className = 'rp-page';
      pg.innerHTML = A.pageHead(title, sub) + '<table class="rp-table"><thead><tr>' + head.map((h, j) => '<th style="' + ((o.widths || [])[j] ? 'width:' + o.widths[j] + '%' : '') + '">' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' +
        rows.slice(i * per, (i + 1) * per).map(r => '<tr>' + r.map((c, j) => '<td class="' + ((o.align || [])[j] || '') + '">' + esc(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>' + (i === n - 1 && o.after ? o.after : '') +
        '<div class="rp-foot">' + esc(o.foot || '') + ' หน้า ' + (i + 1) + ' / ' + n + '</div>';
      root.appendChild(pg);
    }
    return root;
  };

  /* ---------- สรุป ---------- */
  function rangeStart() {
    const d = new Date(); if (SUM.range === 'week') d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); else if (SUM.range === 'month') d.setDate(1); else return '';
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function countsOf(sid, from) {
    const c = { p: 0, l: 0, v: 0, a: 0 }; const r = (A.D.att || {})[sid] || {};
    Object.keys(r).forEach(k => { if ((!from || k.slice(0, 10) >= from) && c[r[k]] !== undefined && held(k.slice(0, 10), k.slice(11))) c[r[k]]++; });
    c.n = c.p + c.l + c.v + c.a; c.pct = c.n ? Math.round((c.p + c.l) / c.n * 100) : null; return c;
  }
  const rule = () => Object.assign({ absent: 3, leave: 5 }, A.cfg().attRule || {});
  function flagOf(c) { const r = rule(); return c.a >= r.absent ? ['ขาดบ่อย', 'bad'] : c.v >= r.leave ? ['ลาบ่อย', 'gold'] : ['ปกติ', 'ok']; }
  const RANGES = [['term', 'ทั้งปีการศึกษา'], ['month', 'เดือนนี้'], ['week', 'สัปดาห์นี้']];
  function summaryRows() {
    const from = rangeStart(), ms = A.members();
    return A.activeSids().filter(s => ms[s].am || ms[s].pm || (A.D.att || {})[s]).sort(A.byClass).map(s => ({ sid: s, m: ms[s], c: countsOf(s, from) }));
  }

  /* ============ หน้า การซ้อม ============ */
  function myCard() {
    const sid = A.sid(), m = A.members()[sid], t = A.todayISO(); const c = countsOf(sid, '');
    const one = s => { if (!m[s]) return '<div class="grow"><div class="muted">ช่วง' + SES[s] + '</div><div class="muted">ไม่ได้กำหนด</div></div>'; const v = saved(sid, t, s), lm = lmark(t, s, sid), dk = dayKind(t, s);
      if (dk === 'hol' || dk === 'off') return '<div class="grow"><div class="muted">ช่วง' + SES[s] + '</div><b>' + KIND[dk][0] + '</b>' + ((dayRec(t, s) || {}).why ? '<div class="muted">' + esc(dayRec(t, s).why) + '</div>' : '') + '</div>';
      return '<div class="grow"><div class="muted">ช่วง' + SES[s] + '</div><b>' + (v ? 'เช็กแล้ว · ' + ST[v][0] : lm === 'pending' ? 'ลา (รอครูรับทราบ)' : lm === 'ack' ? 'ลา (ครูรับทราบแล้ว)' : 'ยังไม่เช็ก') + '</b></div>'; };
    return '<section class="card"><div class="lb">การซ้อมของฉันวันนี้ · ' + esc(A.dTH(t, 'short')) + '</div><div class="row">' + one('am') + one('pm') + '</div>' +
      '<div class="row wrap" style="margin-top:12px"><button class="btn" data-act="leaveNew">แจ้งลาซ้อม</button></div></section>' +
      '<section class="card"><div class="lb">สรุปของฉัน · ปีการศึกษา ' + esc(A.year()) + '</div><div class="stat4">' + ORDER.map(k => '<div><b class="' + ST[k][1] + '">' + c[k] + '</b><span>' + ST[k][0] + '</span></div>').join('') + '</div>' +
      (c.pct !== null ? '<div class="muted" style="margin-top:8px">มาซ้อม ' + c.pct + '% ของ ' + c.n + ' ครั้งที่ถูกเช็ก</div>' : '') + '</section>';
  }
  function myLeaves() {
    const L = (A.D.leaves || {})[A.sid()] || {}; const ids = Object.keys(L).sort((a, b) => L[b].at - L[a].at); if (!ids.length) return '';
    const stt = { pending: ['รอครูรับทราบ', 'gold'], ack: ['ครูรับทราบแล้ว', 'ok'], denied: ['ไม่อนุญาต', 'bad'] };
    return '<section class="card"><div class="lb">ใบลาของฉัน</div>' + ids.slice(0, 12).map(id => { const l = L[id]; return '<div class="li"><div class="row"><b class="grow">' + esc(A.dTH(l.date, 'short')) + ' · รอบ' + [l.am ? 'เช้า' : '', l.pm ? 'เย็น' : ''].filter(Boolean).join('และ') + '</b>' + chip(stt[l.status][0], stt[l.status][1]) + '</div><div class="muted">' + esc(l.why + (l.detail ? ': ' + l.detail : '')) + (l.reply ? '<br>ครู: ' + esc(l.reply) : '') + '</div></div>'; }).join('') + '</section>';
  }
  function checkCard() {
    const d = CHK.date, s = CHK.ses, mt = meta(d, s), list = roster(d, s); const me = A.by().id;
    const n = { p: 0, l: 0, v: 0, a: 0 }; list.forEach(x => n[markOf(x, d, s)]++);
    const dirty = Object.keys(CHK.marks).length || Object.keys(CHK.focus).length || CHK.photo;
    let h = '<section class="card"><div class="lb">เช็กการซ้อม</div><div class="row wrap"><input class="in sm" type="date" data-ck="date" value="' + esc(d) + '" max="' + A.todayISO() + '" aria-label="วันที่">' +
      '<div class="seg" role="group" aria-label="รอบซ้อม">' + ['am', 'pm'].map(k => '<button class="' + (s === k ? 'on' : '') + '" aria-pressed="' + (s === k) + '" data-act="ckSes" data-k="' + k + '">ช่วง' + SES[k] + '</button>').join('') + '</div></div>' +
      '<div class="muted" style="margin:10px 0">' + esc(A.dTH(d, 'dow')) + ' · ' + (mt ? 'เช็กแล้วโดย ' + esc(mt.by.name) + (mt.confirmedBy ? ' · ยืนยันโดย ' + esc(mt.confirmedBy.name) : mt.by.id !== 'teacher' ? ' · รอผู้เช็กอีกคนหรือครูยืนยัน' : '') : 'ยังไม่ได้เช็ก') + '</div>' + dayBar(d, s);
    if (dayKind(d, s) === 'hol' || dayKind(d, s) === 'off') return h + '</section>';
    if (mt && !mt.confirmedBy && mt.by.id !== 'teacher' && mt.by.id !== me) h += '<button class="btn gold sm" data-act="ckConfirm" style="margin-bottom:10px">ยืนยันการเช็กชื่อรอบนี้</button>';
    h += '<div class="row wrap" style="margin-bottom:6px"><label class="btn ghost">' + ic('cam', 18) + (CHK.photo ? 'เลือกรูปใหม่' : mt && mt.hasPhoto ? 'เปลี่ยนรูปหลักฐาน' : 'ถ่ายรูปหลักฐาน') + '<input type="file" accept="image/*" capture="environment" data-ck="photo" hidden></label>' +
      (CHK.photo ? '<img class="thumb" src="' + CHK.photo + '" alt="รูปหลักฐานที่เลือก">' : mt && mt.hasPhoto ? '<button class="btn ghost" data-act="ckPhoto" data-d="' + esc(d) + '" data-s="' + s + '">ดูรูปหลักฐาน</button>' : '<span class="muted">ยังไม่มีรูปของรอบนี้</span>') + '</div>';
    h += '<div class="row wrap" style="margin-top:10px"><span class="muted grow">ความตั้งใจ (แตะ 1–3 ข้างชื่อ): 1 ควรปรับปรุง · 2 ปกติ · 3 ตั้งใจมาก — มีผลต่อคะแนนพฤติกรรม</span><button class="btn ghost sm" data-act="ckFocusAll">ให้ 2 ทุกคนที่ยังไม่ให้</button></div>';
    h += '<div class="row" style="justify-content:space-between;margin-top:10px"><span class="lb" style="margin:0">ผู้ที่ครูกำหนดให้ซ้อมรอบ' + SES[s] + ' (แตะเพื่อเปลี่ยนสถานะ)</span><span class="muted">มา ' + (n.p + n.l) + '/' + list.length + '</span></div>';
    h += list.map(x => { const m = A.members()[x], v = markOf(x, d, s), lm = lmark(d, s, x);
      return '<div class="mrow"><span class="mrow-main">' + avatar(m) + '<span class="grow"><b>' + esc(A.fullName(m)) + '</b><span class="muted">' + esc(A.cls(m) + (A.insts(m).length ? ' · ' + A.insts(m).join(', ') : '')) + (lm ? ' · ใบลา' + (lm === 'pending' ? 'รอรับทราบ' : lm === 'ack' ? 'รับทราบแล้ว' : 'ไม่อนุญาต') : '') + '</span></span></span>' +
        '<button class="stb ' + ST[v][1] + '" data-act="ckMark" data-sid="' + esc(x) + '" aria-label="สถานะของ ' + esc(m.first) + ': ' + ST[v][0] + '">' + ST[v][0] + '</button>' + focusBtns(x, d, s, v) + '</div>'; }).join('') || '<div class="empty">ยังไม่มีสมาชิกที่กำหนดรอบ' + SES[s] + ' — ครูกำหนดได้ที่หน้าสมาชิก</div>';
    if (list.length) h += '<button class="btn block" data-act="ckSave" style="margin-top:12px">' + (mt && !dirty ? 'บันทึกอีกครั้ง' : 'บันทึกการเช็กชื่อ') + '</button>';
    return h + '</section>';
  }
  function leavesCard() {
    const l = pendingLeaves();
    return '<section class="card"><div class="lb">ใบลารอรับทราบ (' + l.length + ')</div>' + (l.map(x => { const m = A.members()[x.sid] || {};
      return '<div class="li"><div class="row"><b class="grow">' + esc(A.fullName(m)) + ' · ' + esc(A.cls(m)) + '</b>' + (x.late ? chip('ลาย้อนหลัง', 'bad') : '') + '</div><div class="muted">' + esc(A.dTH(x.date, 'dow')) + ' · รอบ' + [x.am ? 'เช้า' : '', x.pm ? 'เย็น' : ''].filter(Boolean).join('และ') + ' · ส่งเมื่อ ' + esc(M.thDate(x.at)) + '</div><div style="margin:4px 0 8px">' + esc(x.why + ': ' + (x.detail || '')) + '</div>' +
        '<div class="row"><button class="btn gold grow" data-act="leaveAck" data-sid="' + esc(x.sid) + '" data-id="' + esc(x.id) + '" data-v="ack">รับทราบ</button><button class="btn ghost grow" data-act="leaveAck" data-sid="' + esc(x.sid) + '" data-id="' + esc(x.id) + '" data-v="denied">ไม่อนุญาต</button></div></div>'; }).join('') || '<div class="muted">ไม่มีใบลาค้าง</div>') + '</section>';
  }
  function summaryCard() {
    const rows = summaryRows(), r = rule();
    return '<section class="card"><div class="row wrap" style="margin-bottom:8px"><div class="lb grow" style="margin:0;flex-basis:100%">สรุปการซ้อมรายบุคคล (นับเฉพาะรอบที่ถูกเช็ก ไม่นับวันหยุด/งดซ้อม)</div><select class="in sm" data-sum="range" aria-label="ช่วงเวลา">' + opt(RANGES, SUM.range) + '</select>' +
      (A.teacher() ? '<button class="btn sm" data-act="attGrid">' + ic('down', 16) + 'แบบบันทึกเวลาซ้อม A4</button><button class="btn ghost sm" data-act="sumExport">' + ic('down', 16) + 'สรุปรายบุคคล</button>' : '') + '</div>' +
      '<div class="muted" style="margin-bottom:6px">เกณฑ์เฝ้าระวัง: ขาด ' + r.absent + ' ครั้ง หรือ ลา ' + r.leave + ' ครั้งขึ้นไป' + (A.teacher() ? ' · <a href="#" data-act="attRule">แก้เกณฑ์</a>' : '') + '</div>' +
      '<div class="tw"><table class="tb"><thead><tr><th>สมาชิก</th><th>มา</th><th>สาย</th><th>ลา</th><th>ขาด</th><th>มาซ้อม</th><th>สถานะ</th>' + (A.teacher() ? '<th><span class="sr">ดำเนินการ</span></th>' : '') + '</tr></thead><tbody>' +
      rows.map(x => { const f = flagOf(x.c); return '<tr><td><b>' + esc(A.fullName(x.m)) + '</b><div class="muted">' + esc(A.cls(x.m) + ' · ' + A.sesText(x.m)) + '</div></td><td>' + x.c.p + '</td><td>' + x.c.l + '</td><td>' + x.c.v + '</td><td>' + x.c.a + '</td><td>' + (x.c.pct === null ? '-' : x.c.pct + '%') + '</td><td>' + chip(f[0], f[1]) + '</td>' +
        (A.teacher() ? '<td><button class="btn ghost sm" data-act="attAction" data-sid="' + esc(x.sid) + '">ดำเนินการ</button></td>' : '') + '</tr>'; }).join('') + '</tbody></table></div>' + (rows.length ? '' : '<div class="empty">ยังไม่มีข้อมูล</div>') + '</section>';
  }

  /* ---------- สถานะรอบซ้อมบนหน้าเช็กชื่อ ---------- */
  function dayBar(d, s) {
    const k = dayKind(d, s), r = dayRec(d, s);
    let h = '';
    if (A.teacher()) h += '<div class="row wrap" style="margin:10px 0 4px"><span class="muted">รอบนี้เป็น</span><div class="seg" role="group" aria-label="สถานะรอบซ้อม">' +
      [['work', 'ซ้อมปกติ'], ['hol', 'วันหยุด'], ['off', 'งดซ้อม']].map(o => { const on = o[0] === k || (o[0] === 'work' && k === 'wk'); return '<button class="' + (on ? 'on' : '') + '" aria-pressed="' + on + '" data-act="ckDay" data-k="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div></div>';
    if (k === 'hol' || k === 'off') h += '<div class="note ' + (k === 'off' ? 'warn' : '') + '" style="margin-top:8px"><b>' + KIND[k][0] + '</b>' + (r && r.why ? ' · ' + esc(r.why) : '') + ' — รอบนี้ไม่เช็กชื่อ และไม่นับในสถิติการซ้อม' + (r && r.by ? '<br><span class="muted">กำหนดโดย ' + esc(r.by) + '</span>' : '') + '</div>';
    else if (k === 'wk') h += '<div class="muted" style="margin-top:6px">วันเสาร์–อาทิตย์ ไม่นับเป็นวันซ้อมปกติ — ถ้ามีซ้อมจริงเช็กชื่อได้ตามปกติ แล้วรอบนี้จะถูกนับในสถิติ</div>';
    return h;
  }
  function uncheckedCard() {
    const l = unchecked(); if (!l.length) return '';
    return '<section class="card" style="border:2px solid var(--bad)"><div class="lb">ยังไม่ได้เช็กชื่อ (' + l.length + ' รอบ)</div><div class="muted" style="margin-bottom:6px">รอบซ้อมปกติที่ผ่านไปแล้วแต่ยังไม่มีการเช็กชื่อ — เช็กย้อนหลัง หรือกำหนดเป็นวันหยุด/งดซ้อม</div>' +
      l.slice(0, 30).map(x => '<div class="li"><div class="row wrap"><b class="grow">' + esc(A.dTH(x.d, 'dow')) + ' · ช่วง' + SES[x.s] + '</b><button class="btn sm" data-act="ckGo" data-d="' + x.d + '" data-s="' + x.s + '">เช็กชื่อ</button><button class="btn ghost sm" data-act="ckDayQuick" data-d="' + x.d + '" data-s="' + x.s + '" data-k="hol">วันหยุด</button><button class="btn ghost sm" data-act="ckDayQuick" data-d="' + x.d + '" data-s="' + x.s + '" data-k="off">งดซ้อม</button></div></div>').join('') +
      (l.length > 30 ? '<div class="muted">และอีก ' + (l.length - 30) + ' รอบ</div>' : '') + '</section>';
  }
  function calendarCard() {
    const D = A.D.attday || {}, t = A.todayISO(), rows = [];
    Object.keys(D).sort().forEach(d => ['am', 'pm'].forEach(s => { const r = (D[d] || {})[s]; if (r && (r.k === 'hol' || r.k === 'off')) rows.push({ d, s, r }); }));
    /* รวมเช้า+เย็นของวันเดียวกันที่เหตุผลเหมือนกันเป็นแถวเดียว */
    const merged = []; rows.forEach(x => { const p = merged[merged.length - 1]; if (p && p.d === x.d && p.r.k === x.r.k && (p.r.why || '') === (x.r.why || '')) p.s = 'both'; else merged.push(Object.assign({}, x)); });
    const up = merged.filter(x => x.d >= t), past = merged.filter(x => x.d < t).reverse();
    const row = x => '<div class="li"><div class="row"><span class="grow"><b>' + esc(A.dTH(x.d, 'dow')) + '</b> · ' + (x.s === 'both' ? 'ทั้งวัน' : 'ช่วง' + SES[x.s]) + ' ' + chip(KIND[x.r.k][0], KIND[x.r.k][1]) + (x.r.why ? '<span class="muted"> ' + esc(x.r.why) + '</span>' : '') + '</span><button class="btn ghost sm" data-act="calDel" data-d="' + x.d + '" data-s="' + x.s + '" aria-label="ลบ">' + ic('x', 16) + '</button></div></div>';
    return '<section class="card"><div class="row wrap" style="margin-bottom:6px"><div class="lb grow" style="margin:0;flex-basis:100%">ปฏิทินวันหยุดและงดซ้อม</div><button class="btn sm" data-act="calAdd">' + ic('plus', 16) + 'เพิ่ม</button><button class="btn ghost sm" data-act="calHol">วันหยุดราชการ</button><button class="btn ghost sm" data-act="calSet">ตั้งค่า</button></div>' +
      '<div class="muted" style="margin-bottom:6px">' + (cal().wkOff ? 'เสาร์–อาทิตย์ไม่นับเป็นวันซ้อมปกติ' : 'เสาร์–อาทิตย์นับเป็นวันซ้อมปกติ') + (cal().from ? ' · ตรวจรอบที่ยังไม่เช็กตั้งแต่ ' + esc(A.dTH(cal().from, 'short')) : '') + '</div>' +
      (up.length ? '<div class="lb" style="margin-top:6px">ที่จะถึง</div>' + up.slice(0, 20).map(row).join('') : '<div class="muted">ยังไม่มีวันหยุด/งดซ้อมที่จะถึง</div>') +
      (past.length ? '<details style="margin-top:8px"><summary class="muted">ที่ผ่านมา (' + past.length + ')</summary>' + past.slice(0, 60).map(row).join('') + '</details>' : '') + '</section>';
  }
  function dayModal(d, sess, k, after) {
    const w = modal('<h3>กำหนดเป็น' + KIND[k][0] + '</h3><div class="muted" style="margin-bottom:8px">' + esc(A.dTH(d, 'dow')) + ' · ' + sess.map(s => 'ช่วง' + SES[s]).join(' และ ') + '</div><form class="form">' +
      fld('เหตุผล' + (k === 'off' ? ' (จำเป็น)' : ''), '<input class="in" id="dy-why" maxlength="80" placeholder="' + (k === 'off' ? 'เช่น สอบกลางภาค · กิจกรรมโรงเรียน · ครูติดราชการ' : 'เช่น วันพ่อแห่งชาติ') + '"' + (k === 'off' ? ' required' : '') + '>') +
      (sess.some(s => meta(d, s)) ? '<div class="note warn">รอบนี้มีการเช็กชื่อไว้แล้ว ข้อมูลยังเก็บอยู่ แต่จะไม่นับในสถิติ</div>' : '') +
      '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">บันทึก</button></div></form>', { center: true, sticky: true });
    $('form', w).addEventListener('submit', e => { e.preventDefault(); const why = $('#dy-why', w).value.trim(); if (k === 'off' && !why) return;
      const upd = {}; sess.forEach(s => { upd[Y() + '/attday/' + d + '/' + s] = { k, why: why || '', by: A.myName(), at: Date.now() }; });
      A.W(B.update('', upd)); A.log('att.day', '', d + ' ' + sess.join('+') + ' ' + k + ' ' + why); w.remove(); toast('บันทึกแล้ว'); if (after) after(); });
  }

  /* ---------- แบบบันทึกเวลาซ้อม A4 แนวนอน (เดือนละแผ่น แยกรอบเช้า/เย็น) ---------- */
  const DOW1 = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'], MK = { p: '/', l: 'ส', v: 'ล', a: 'ข' };
  function monthData(ym, s, from, to) {
    const y = +ym.slice(0, 4), m = +ym.slice(5), last = new Date(y, m, 0).getDate(), t = A.todayISO(), ms = A.members(), att = A.D.att || {}, start = cal().from || Object.keys(A.D.attmeta || {}).sort()[0] || t;
    const days = []; for (let i = 1; i <= last; i++) { const d = ym + '-' + String(i).padStart(2, '0'); if ((from && d < from) || (to && d > to)) continue;
      const k = dayKind(d, s), mt = meta(d, s), st = (k === 'hol' || k === 'off') ? k : k === 'wk' && !mt ? 'wk' : d > t ? 'future' : mt ? 'ok' : d >= start && roster(d, s).length ? 'none' : 'empty';
      days.push({ d, i, dow: new Date(d + 'T00:00:00').getDay(), st, why: (dayRec(d, s) || {}).why || '' }); }
    const sids = A.activeSids().filter(x => ms[x][s] || days.some(o => (att[x] || {})[key(o.d, s)])).sort(A.byClass);
    const people = sids.map(x => { const c = { p: 0, l: 0, v: 0, a: 0 }; const cells = days.map(o => { const v = (o.st === 'ok') ? ((att[x] || {})[key(o.d, s)] || '') : ''; if (v && c[v] !== undefined) c[v]++; return v; });
      const n = c.p + c.l + c.v + c.a; return { sid: x, m: ms[x], cells, c, pct: n ? Math.round((c.p + c.l) / n * 100) : null }; });
    const tot = days.map((o, j) => o.st === 'ok' ? people.filter(p => p.cells[j] === 'p' || p.cells[j] === 'l').length : null);
    return { ym, s, days, people, tot };
  }
  /* รวมวันที่ติดกันที่เหตุผลเดียวกัน เช่น 17–20, 23–26 วันหยุด (ปิดภาคเรียน) */
  function dayNotes(days) {
    const g = []; days.forEach((o, j) => { if (o.st !== 'hol' && o.st !== 'off') return; const lab = (o.st === 'hol' ? 'วันหยุด' : 'งดซ้อม') + (o.why ? ' (' + o.why + ')' : ''); let x = g.find(z => z.lab === lab); if (!x) g.push(x = { lab, r: [] });
      const last = x.r[x.r.length - 1]; if (last && last.j === j - 1) { last.b = o.i; last.j = j; } else if (last && days.slice(last.j + 1, j).every(z => z.st === 'wk')) { last.b = o.i; last.j = j; } else x.r.push({ a: o.i, b: o.i, j }); });
    return g.map(x => x.r.map(r => r.a === r.b ? r.a : r.a + '–' + r.b).join(', ') + ' ' + x.lab);
  }
  const stMark = o => o.st === 'hol' ? 'ห' : o.st === 'off' ? 'ง' : o.st === 'none' ? '?' : DOW1[o.dow];
  const stBg = o => o.st === 'hol' || o.st === 'off' ? '#d9d9d9' : o.st === 'wk' ? '#efefef' : o.st === 'none' ? '#fff3cd' : '';
  function gridPages(md, teacher) {
    const PER = 24, root = document.createElement('div'), n = Math.max(1, Math.ceil(md.people.length / PER)), C2 = M.C.club;
    const term = termOf(md.ym), sub = (C2.long || C2.full) + ' · ' + (term ? 'ภาคเรียนที่ ' + term + ' ' : '') + 'ปีการศึกษา ' + A.year();
    const sig = A.sigByName ? A.sigByName(teacher) : '';
    const notes = dayNotes(md.days);
    const miss = md.days.filter(o => o.st === 'none').map(o => o.i);
    for (let pi = 0; pi < n; pi++) {
      const pg = document.createElement('div'); pg.className = 'rp-page land att-g';
      const list = md.people.slice(pi * PER, (pi + 1) * PER);
      let h = '<div class="ag-head"><img src="' + C2.logo + '" alt=""><div class="grow"><div class="ag-t">แบบบันทึกเวลาการซ้อม ชมรม' + esc(C2.name) + ' · รอบ' + SES[md.s] + '</div><div class="ag-s">' + esc(sub) + ' · ประจำเดือน ' + esc(monthTH(md.ym)) + '</div></div><img class="sch" src="icons/school-logo.png" alt=""></div>';
      h += '<table class="ag"><colgroup><col style="width:24px"><col style="width:58px"><col style="width:150px"><col style="width:40px">' + md.days.map(() => '<col>').join('') + '<col style="width:24px"><col style="width:24px"><col style="width:24px"><col style="width:24px"><col style="width:28px"></colgroup><thead><tr><th rowspan="3">ที่</th><th rowspan="3" style="white-space:normal;font-size:9.5px;line-height:1.1">เลขประจำตัว</th><th rowspan="3" class="nm">ชื่อ - สกุล</th><th rowspan="3">ชั้น</th><th colspan="' + md.days.length + '">วันที่</th><th colspan="5">สรุป</th></tr>' +
        '<tr>' + md.days.map(o => '<th class="d" style="background:' + (stBg(o) || '#f3eaf0') + '">' + o.i + '</th>').join('') + '<th rowspan="2" class="t">มา</th><th rowspan="2" class="t">สาย</th><th rowspan="2" class="t">ลา</th><th rowspan="2" class="t">ขาด</th><th rowspan="2" class="t">%</th></tr>' +
        '<tr>' + md.days.map(o => '<th class="d w" style="background:' + (stBg(o) || '#f3eaf0') + '">' + stMark(o) + '</th>').join('') + '</tr></thead><tbody>';
      h += list.map((p, i) => '<tr><td class="c">' + (pi * PER + i + 1) + '</td><td class="c">' + esc(p.sid) + '</td><td class="nm">' + esc(A.fullName(p.m)) + '</td><td class="c">' + esc(A.cls(p.m)) + '</td>' +
        p.cells.map((v, j) => '<td class="d' + (v === 'a' ? ' ab' : '') + '" style="' + (stBg(md.days[j]) ? 'background:' + stBg(md.days[j]) : '') + '">' + (v ? MK[v] : '') + '</td>').join('') +
        '<td class="t">' + p.c.p + '</td><td class="t">' + p.c.l + '</td><td class="t">' + p.c.v + '</td><td class="t">' + p.c.a + '</td><td class="t">' + (p.pct === null ? '-' : p.pct) + '</td></tr>').join('');
      if (pi === n - 1) h += '<tr class="sum"><td colspan="4" style="text-align:right">จำนวนผู้มาซ้อม (คน)</td>' + md.tot.map((v, j) => '<td class="d" style="' + (stBg(md.days[j]) ? 'background:' + stBg(md.days[j]) : '') + '">' + (v === null ? '' : v) + '</td>').join('') + '<td colspan="5"></td></tr>';
      h += '</tbody></table>';
      if (pi === n - 1) h += '<div class="ag-foot"><div class="ag-leg"><b>คำอธิบาย</b> / มา · ส สาย · ล ลา · ข ขาด · ช่องว่าง = ไม่อยู่ในรอบนี้ · ห วันหยุด · ง งดซ้อม (แรเงา)' + (miss.length ? ' · ? ยังไม่ได้เช็กชื่อ (วันที่ ' + miss.join(', ') + ')' : '') +
        (notes.length ? '<br><b>วันหยุด/งดซ้อม</b> ' + esc(notes.join(' · ')) : '') + '<br>% = (มา + สาย) ÷ จำนวนรอบที่เช็กชื่อ ไม่นับวันหยุดและวันงดซ้อม</div>' +
        '<div class="ag-sign"><div class="ag-line">ลงชื่อ' + (sig ? '<img src="' + sig + '" alt="">' : '') + '</div><div>( ' + esc(teacher || '') + ' )</div><div>ครูที่ปรึกษาชมรม' + esc(C2.name) + '</div></div></div>';
      h += '<div class="rp-foot">พิมพ์เมื่อ ' + esc(M.thDate(Date.now())) + ' · หน้า ' + (pi + 1) + ' / ' + n + '</div>';
      pg.innerHTML = h; root.appendChild(pg);
    }
    return root;
  }
  /* DOCX แนวนอน — โครงเดียวกับ PDF */
  function gridDocx(list, teacher) {
    const C2 = M.C.club, NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
    const run = (t, o) => M.wRun(t, o), para = (r, o) => M.wPara(r, o);
    const cell = (t, w, o) => { o = o || {}; return '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' + (o.span ? '<w:gridSpan w:val="' + o.span + '"/>' : '') + (o.vm ? '<w:vMerge' + (o.vm === 'r' ? ' w:val="restart"' : '') + '/>' : '') + (o.fill ? '<w:shd w:val="clear" w:color="auto" w:fill="' + o.fill + '"/>' : '') + '<w:vAlign w:val="center"/></w:tcPr>' + para(run(t, { sz: o.sz || 20, b: o.b }), { jc: o.jc || 'center' }) + '</w:tc>'; };
    const bd = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(k => '<w:' + k + ' w:val="single" w:sz="4" w:space="0" w:color="000000"/>').join('');
    let body = '';
    list.forEach((md, mi) => {
      const W = { i: 360, sid: 760, nm: 2300, cls: 700, d: 300, t: 380 }, nd = md.days.length, ws = [W.i, W.sid, W.nm, W.cls].concat(md.days.map(() => W.d), [W.t, W.t, W.t, W.t, W.t + 60]);
      const fill = o => (stBg(o) || '#F3EAF0').replace('#', '').toUpperCase(), term = termOf(md.ym);
      if (mi) body += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
      body += para(run('แบบบันทึกเวลาการซ้อม ชมรม' + C2.name + ' · รอบ' + SES[md.s], { b: true, sz: 32 }), { jc: 'center' }) + para(run((C2.long || C2.full) + ' · ' + (term ? 'ภาคเรียนที่ ' + term + ' ' : '') + 'ปีการศึกษา ' + A.year() + ' · ประจำเดือน ' + monthTH(md.ym), { sz: 26 }), { jc: 'center', after: 120 });
      let t = '<w:tbl><w:tblPr><w:tblW w:w="' + ws.reduce((a, b) => a + b, 0) + '" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders>' + bd + '</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="20" w:type="dxa"/><w:right w:w="20" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>' + ws.map(x => '<w:gridCol w:w="' + x + '"/>').join('') + '</w:tblGrid>';
      const hdr = '<w:trPr><w:tblHeader/></w:trPr>';
      t += '<w:tr>' + hdr + cell('ที่', W.i, { vm: 'r', b: 1, fill: 'F3EAF0' }) + cell('เลขประจำตัว', W.sid, { vm: 'r', b: 1, fill: 'F3EAF0', sz: 18 }) + cell('ชื่อ - สกุล', W.nm, { vm: 'r', b: 1, fill: 'F3EAF0' }) + cell('ชั้น', W.cls, { vm: 'r', b: 1, fill: 'F3EAF0' }) + cell('วันที่', W.d * nd, { span: nd, b: 1, fill: 'F3EAF0' }) + cell('สรุป', W.t * 5 + 60, { span: 5, b: 1, fill: 'F3EAF0' }) + '</w:tr>';
      t += '<w:tr>' + hdr + cell('', W.i, { vm: 1 }) + cell('', W.sid, { vm: 1 }) + cell('', W.nm, { vm: 1 }) + cell('', W.cls, { vm: 1 }) + md.days.map(o => cell(String(o.i), W.d, { fill: fill(o), sz: 18, b: 1 })).join('') + ['มา', 'สาย', 'ลา', 'ขาด', '%'].map((x, i) => cell(x, W.t + (i === 4 ? 60 : 0), { vm: 'r', b: 1, fill: 'F3EAF0', sz: 18 })).join('') + '</w:tr>';
      t += '<w:tr>' + hdr + cell('', W.i, { vm: 1 }) + cell('', W.sid, { vm: 1 }) + cell('', W.nm, { vm: 1 }) + cell('', W.cls, { vm: 1 }) + md.days.map(o => cell(stMark(o), W.d, { fill: fill(o), sz: 16 })).join('') + [0, 1, 2, 3, 4].map(i => cell('', W.t + (i === 4 ? 60 : 0), { vm: 1 })).join('') + '</w:tr>';
      md.people.forEach((p, i) => { t += '<w:tr>' + cell(String(i + 1), W.i) + cell(p.sid, W.sid, { sz: 18 }) + cell(A.fullName(p.m), W.nm, { jc: 'left' }) + cell(A.cls(p.m), W.cls, { sz: 18 }) +
        p.cells.map((v, j) => cell(v ? MK[v] : '', W.d, { fill: stBg(md.days[j]) ? fill(md.days[j]) : '' })).join('') + [p.c.p, p.c.l, p.c.v, p.c.a].map(x => cell(String(x), W.t)).join('') + cell(p.pct === null ? '-' : String(p.pct), W.t + 60) + '</w:tr>'; });
      t += '<w:tr>' + cell('จำนวนผู้มาซ้อม (คน)', W.i + W.sid + W.nm + W.cls, { span: 4, jc: 'right', sz: 18 }) + md.tot.map((v, j) => cell(v === null ? '' : String(v), W.d, { fill: stBg(md.days[j]) ? fill(md.days[j]) : '', sz: 18 })).join('') + cell('', W.t * 5 + 60, { span: 5 }) + '</w:tr></w:tbl>';
      body += t;
      const notes = dayNotes(md.days), miss = md.days.filter(o => o.st === 'none').map(o => o.i);
      body += para(run('คำอธิบาย: / มา · ส สาย · ล ลา · ข ขาด · ช่องว่าง = ไม่อยู่ในรอบนี้ · ห วันหยุด · ง งดซ้อม (แรเงา)' + (miss.length ? ' · ? ยังไม่ได้เช็กชื่อ (วันที่ ' + miss.join(', ') + ')' : ''), { sz: 22 }), { after: 0 }) +
        (notes.length ? para(run('วันหยุด/งดซ้อม: ' + notes.join(' · '), { sz: 22 }), {}) : '') + para(run('% = (มา + สาย) ÷ จำนวนรอบที่เช็กชื่อ ไม่นับวันหยุดและวันงดซ้อม', { sz: 22 }), { after: 200 }) +
        para(run('ลงชื่อ ........................................................', { sz: 28 }), { jc: 'right' }) + para(run('( ' + (teacher || '') + ' )', { sz: 28 }), { jc: 'right' }) + para(run('ครูที่ปรึกษาชมรม' + C2.name, { sz: 28 }), { jc: 'right' });
    });
    return M.docxDoc(body, { land: true, margin: 567 });
  }
  function exportGrid() {
    const months = acadMonths(), cur = A.todayISO().slice(0, 7), defM = months.includes(cur) ? cur : months[0];
    const w = modal('<h3>แบบบันทึกเวลาการซ้อม (A4 แนวนอน)</h3><form class="form">' +
      fld('ช่วงเวลา', '<select class="in" id="g-r">' + opt([['m', 'รายเดือน'], ['t1', 'ภาคเรียนที่ 1 (พ.ค.–ต.ค.)'], ['t2', 'ภาคเรียนที่ 2 (พ.ย.–มี.ค.)'], ['c', 'กำหนดวันที่เอง']], 'm') + '</select>') +
      '<div id="g-m-w">' + fld('เดือน', '<select class="in" id="g-m">' + opt(months.map(m => [m, monthTH(m)]), defM) + '</select>') + '</div>' +
      '<div class="g3" id="g-c-w" hidden>' + fld('ตั้งแต่', '<input class="in" type="date" id="g-f">') + fld('ถึง', '<input class="in" type="date" id="g-t">') + '</div>' +
      fld('รอบซ้อม', '<select class="in" id="g-s">' + opt([['both', 'ทั้งเช้าและเย็น (แยกคนละแผ่น)'], ['am', 'เฉพาะรอบเช้า'], ['pm', 'เฉพาะรอบเย็น']], 'both') + '</select>') +
      '<div class="muted">เดือนละ 1 แผ่นต่อรอบ · ลงนามโดย ' + esc(A.myName()) + ' ครูที่ปรึกษาชมรม</div><div class="xlist" style="margin-top:12px"><button type="button" class="xbtn" data-x="pdf"><b>PDF</b><span>พร้อมพิมพ์</span></button><button type="button" class="xbtn" data-x="docx"><b>DOCX</b><span>เปิดแก้ใน Word</span></button></div><div class="muted" id="g-msg" style="margin-top:10px"></div><button type="button" class="btn ghost block" data-close style="margin-top:12px">ปิด</button></form>', { center: true, sticky: true });
    const sync = () => { const r = $('#g-r', w).value; $('#g-m-w', w).hidden = r !== 'm'; $('#g-c-w', w).hidden = r !== 'c'; }; $('#g-r', w).addEventListener('change', sync);
    w.addEventListener('click', async e => {
      const b = e.target.closest('[data-x]'); if (!b) return; const msg = $('#g-msg', w), r = $('#g-r', w).value; let mons = [], from = '', to = '';
      if (r === 'm') mons = [$('#g-m', w).value]; else if (r === 't1') mons = months.slice(0, 6); else if (r === 't2') mons = months.slice(6, 11);
      else { from = $('#g-f', w).value; to = $('#g-t', w).value; if (!from || !to || from > to) { msg.textContent = 'เลือกวันที่ให้ถูกต้อง'; return; } for (let ym = from.slice(0, 7); ym <= to.slice(0, 7);) { mons.push(ym); const y = +ym.slice(0, 4), m = +ym.slice(5); ym = (m === 12 ? y + 1 : y) + '-' + String(m === 12 ? 1 : m + 1).padStart(2, '0'); } }
      const t = A.todayISO().slice(0, 7); mons = mons.filter(m => m <= t); if (!mons.length) { msg.textContent = 'ช่วงที่เลือกยังไม่ถึง'; return; }
      const ss = $('#g-s', w).value === 'both' ? ['am', 'pm'] : [$('#g-s', w).value];
      const list = []; ss.forEach(s => mons.forEach(m => { const md = monthData(m, s, from, to); if (md.people.length) list.push(md); }));
      if (!list.length) { msg.textContent = 'ไม่มีสมาชิกในรอบที่เลือก'; return; }
      const teacher = A.myName(), name = 'แบบบันทึกเวลาซ้อม-' + M.safeName(M.C.club.name) + '-' + (r === 'm' ? M.safeName(monthTH(mons[0])) : r === 'c' ? from + '_' + to : 'ภาคเรียนที่' + r.slice(1)) + '-' + A.year();
      msg.textContent = 'กำลังสร้างไฟล์ …';
      try {
        if (b.dataset.x === 'docx') await M.saveBlob(gridDocx(list, teacher), name + '.docx');
        else { const root = document.createElement('div'); list.forEach(md => Array.from(gridPages(md, teacher).children).forEach(p => root.appendChild(p))); await M.exportPDF(root, name + '.pdf', (i, n) => { msg.textContent = 'กำลังสร้างหน้า ' + i + ' / ' + n; }); }
        msg.textContent = 'เสร็จแล้ว'; A.log('att.export', '', name);
      } catch (er) { msg.textContent = 'ส่งออกไม่สำเร็จ: ' + (er.message || er); }
    });
  }
  A.attGridPreview = (ym, s) => gridPages(monthData(ym, s || 'pm'), A.myName());

  A.V.practice = function () {
    let b = '';
    if (!A.teacher()) b += myCard();
    if (checker()) b += checkCard();
    if (A.teacher()) b += uncheckedCard() + leavesCard() + calendarCard();
    if (checker()) b += summaryCard();
    if (!A.teacher()) b += myLeaves();
    return { title: 'การซ้อม', body: b };
  };
  A.TODO.push(() => {
    if (A.teacher()) return { n: pendingLeaves().length, label: 'ใบลารอรับทราบ', href: '#/practice', hot: true };
    if (!checker()) return null; const t = A.todayISO(), s = new Date().getHours() < 12 ? 'am' : 'pm';
    return dayKind(t, s) === 'work' && !meta(t, s) && roster(t, s).length ? { badge: 'วันนี้', label: 'ยังไม่ได้เช็กการซ้อมช่วง' + SES[s], href: '#/practice', hot: true } : null;
  });
  A.TODO.push(() => { if (!A.teacher()) return null; const n = unchecked().length; return n ? { n, label: 'รอบซ้อมที่ยังไม่ได้เช็กชื่อ', href: '#/practice', hot: true } : null; });
  A.HOME.push({ order: 20, html: () => {
    const t = A.todayISO();
    if (A.teacher()) { const n = pendingLeaves().length; const st = s => { const mt = meta(t, s), k = dayKind(t, s); if (k === 'hol' || k === 'off') return KIND[k][0]; return mt ? 'เช็กแล้ว (' + ((mt.n || {}).p + (mt.n || {}).l || 0) + ' คน)' : 'ยังไม่เช็ก'; };
      return '<section class="card"><div class="lb">การซ้อมวันนี้</div><div class="row"><div class="grow"><div class="muted">ช่วงเช้า</div><b>' + st('am') + '</b></div><div class="grow"><div class="muted">ช่วงเย็น</div><b>' + st('pm') + '</b></div></div><div class="row wrap" style="margin-top:12px"><a class="btn" href="#/practice">เช็กการซ้อม</a>' + (n ? '<a class="btn gold" href="#/practice">ใบลารอรับทราบ ' + n + '</a>' : '') + '</div></section>'; }
    const m = A.members()[A.sid()]; const one = s => m[s] ? (saved(A.sid(), t, s) ? ST[saved(A.sid(), t, s)][0] : meta(t, s) ? 'ไม่อยู่ในรายชื่อ' : 'ยังไม่เช็ก') : 'ไม่ได้กำหนด';
    return '<section class="card"><div class="lb">การซ้อมวันนี้</div><div class="row"><div class="grow"><div class="muted">ช่วงเช้า</div><b>' + one('am') + '</b></div><div class="grow"><div class="muted">ช่วงเย็น</div><b>' + one('pm') + '</b></div></div><div class="row wrap" style="margin-top:12px">' + (checker() ? '<a class="btn gold" href="#/practice">เช็กการซ้อม</a>' : '') + '<button class="btn ghost" data-act="leaveNew">แจ้งลาซ้อม</button></div></section>';
  } });

  /* ============ การทำงาน ============ */
  Object.assign(A.ACT, {
    ckFocus: d => { if (!checker()) return; const cur = focusOf(d.sid, CHK.date, CHK.ses), v = +d.v; CHK.focus[d.sid] = cur === v ? 0 : v; A.rerender(); },
    ckFocusAll: () => { if (!checker()) return; roster(CHK.date, CHK.ses).forEach(x => { const v = markOf(x, CHK.date, CHK.ses); if ((v === 'p' || v === 'l') && !focusOf(x, CHK.date, CHK.ses)) CHK.focus[x] = 2; }); A.rerender(); },
    ckSes: d => { CHK.ses = d.k; CHK.marks = {}; CHK.focus = {}; CHK.photo = null; A.rerender(); },
    ckMark: d => { if (!checker()) return; const v = markOf(d.sid, CHK.date, CHK.ses); CHK.marks[d.sid] = ORDER[(ORDER.indexOf(v) + 1) % 4]; A.rerender(); },
    ckSave: () => {
      if (!checker()) return; const d = CHK.date, s = CHK.ses, list = roster(d, s), upd = {}, n = { p: 0, l: 0, v: 0, a: 0 }, old = meta(d, s);
      list.forEach(x => { const v = markOf(x, d, s); n[v]++; upd[Y() + '/att/' + x + '/' + key(d, s)] = v; const fv = (v === 'p' || v === 'l') ? focusOf(x, d, s) : 0; upd[Y() + '/focus/' + x + '/' + key(d, s)] = fv || null; });
      upd[Y() + '/attmeta/' + d + '/' + s] = { by: A.by(), at: Date.now(), n, hasPhoto: !!(CHK.photo || (old && old.hasPhoto)) };
      A.W(B.update('', upd)); if (CHK.photo) A.W(B.set(Y() + '/attphoto/' + d + '/' + s, CHK.photo));
      CHK.marks = {}; CHK.focus = {}; CHK.photo = null; toast('บันทึกการเช็กชื่อแล้ว'); if (!A.teacher()) window.PUSH && PUSH.notify('att', { ref: A.dTH(d, 'short') + ' ช่วง' + SES[s] }); A.rerender();
    },
    ckDay: d => {
      if (!A.teacher()) return; const dd = CHK.date, s = CHK.ses, k = d.k, cur = dayKind(dd, s);
      if (k === 'work') { if (cur === 'work') return; A.W(isWeekend(dd) && cal().wkOff ? B.set(Y() + '/attday/' + dd + '/' + s, { k: 'work', why: '', by: A.myName(), at: Date.now() }) : B.remove(Y() + '/attday/' + dd + '/' + s)); A.log('att.day', '', dd + ' ' + s + ' work'); return; }
      dayModal(dd, [s], k);
    },
    ckDayQuick: d => { if (A.teacher()) dayModal(d.d, [d.s], d.k); },
    ckGo: d => { CHK.date = d.d; CHK.ses = d.s; CHK.marks = {}; CHK.focus = {}; CHK.photo = null; A.rerender(); window.scrollTo(0, 0); },
    calDel: async d => { if (!A.teacher()) return; if (!(await M.confirmBox('ลบวันหยุด/งดซ้อม', esc(A.dTH(d.d, 'dow')) + ' จะกลับเป็นวันซ้อมปกติ', 'ลบ', true))) return;
      const upd = {}; (d.s === 'both' ? ['am', 'pm'] : [d.s]).forEach(s => { upd[Y() + '/attday/' + d.d + '/' + s] = null; }); A.W(B.update('', upd)); A.log('att.day', '', d.d + ' ' + d.s + ' remove'); },
    calAdd: () => {
      if (!A.teacher()) return; const t = A.todayISO();
      const w = modal('<h3>เพิ่มวันหยุด / งดซ้อม</h3><form class="form"><div class="g3">' + fld('ตั้งแต่', '<input class="in" type="date" id="ca-f" value="' + t + '" required>') + fld('ถึง', '<input class="in" type="date" id="ca-t" value="' + t + '" required>') + '</div>' +
        '<div class="g3">' + fld('รอบ', '<select class="in" id="ca-s">' + opt([['both', 'ทั้งเช้าและเย็น'], ['am', 'เฉพาะเช้า'], ['pm', 'เฉพาะเย็น']], 'both') + '</select>') + fld('ประเภท', '<select class="in" id="ca-k">' + opt([['hol', 'วันหยุด'], ['off', 'งดซ้อมกรณีพิเศษ']], 'hol') + '</select>') + '</div>' +
        fld('เหตุผล', '<input class="in" id="ca-w" maxlength="80" placeholder="เช่น ปิดภาคเรียน · สอบปลายภาค · วันมาฆบูชา">') + '<div class="muted">' + (cal().wkOff ? 'ข้ามเสาร์–อาทิตย์ให้อัตโนมัติ · ' : '') + 'ใส่ได้ไม่เกิน 200 วันต่อครั้ง</div><div class="note bad" id="ca-e" hidden></div>' +
        '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">บันทึก</button></div></form>', { center: true, sticky: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const f = $('#ca-f', w).value, to = $('#ca-t', w).value, k = $('#ca-k', w).value, why = $('#ca-w', w).value.trim(), ss = $('#ca-s', w).value === 'both' ? ['am', 'pm'] : [$('#ca-s', w).value];
        const err = x => { const el = $('#ca-e', w); el.textContent = x; el.hidden = false; };
        if (!f || !to || f > to) return err('เลือกช่วงวันที่ให้ถูกต้อง'); if (k === 'off' && !why) return err('งดซ้อมกรณีพิเศษต้องใส่เหตุผล');
        const upd = {}; let n = 0; for (let d = f; d <= to && n < 400; d = addDays(d, 1)) { if (cal().wkOff && isWeekend(d)) continue; ss.forEach(s => { upd[Y() + '/attday/' + d + '/' + s] = { k, why, by: A.myName(), at: Date.now() }; n++; }); }
        if (!n) return err('ช่วงที่เลือกมีแต่เสาร์–อาทิตย์'); if (n > 400) return err('ช่วงยาวเกินไป');
        A.W(B.update('', upd)); A.log('att.day', '', f + '→' + to + ' ' + k + ' ' + why); w.remove(); toast('บันทึก ' + n + ' รอบแล้ว'); });
    },
    calHol: () => {
      if (!A.teacher()) return; const g = acadYearGreg(), t = A.todayISO(), D = A.D.attday || {};
      const list = FIXED_HOL.map(x => { const mo = +x[0].slice(0, 2), y = mo >= 5 ? g : g + 1; return { d: y + '-' + x[0], n: x[1] }; }).filter(x => !(cal().wkOff && isWeekend(x.d))).sort((a, b) => a.d.localeCompare(b.d));
      const w = modal('<h3>วันหยุดราชการ ปีการศึกษา ' + esc(A.year()) + '</h3><div class="muted" style="margin-bottom:8px">เลือกวันที่จะกำหนดเป็นวันหยุดทั้งเช้าและเย็น · วันหยุดทางพุทธศาสนา (มาฆบูชา วิสาขบูชา อาสาฬหบูชา เข้าพรรษา) และวันหยุดชดเชย ให้เพิ่มเองตามประกาศ ครม. ด้วยปุ่ม “เพิ่ม”</div><form class="form">' +
        list.map((x, i) => { const has = D[x.d] && ((D[x.d].am || {}).k === 'hol' || (D[x.d].pm || {}).k === 'hol'); return '<label class="ck wide"><input type="checkbox" data-i="' + i + '"' + (has ? ' checked disabled' : x.d >= t ? ' checked' : '') + '><span>' + esc(A.dTH(x.d, 'dow')) + ' · ' + esc(x.n) + (has ? ' (กำหนดแล้ว)' : '') + '</span></label>'; }).join('') +
        '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">บันทึกวันที่เลือก</button></div></form>', { center: true, sticky: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const upd = {}; let n = 0; w.querySelectorAll('input[data-i]:checked:not(:disabled)').forEach(c => { const x = list[+c.dataset.i]; ['am', 'pm'].forEach(s => { upd[Y() + '/attday/' + x.d + '/' + s] = { k: 'hol', why: x.n, by: A.myName(), at: Date.now() }; }); n++; });
        if (n) { A.W(B.update('', upd)); A.log('att.day', '', 'holidays ' + n); } w.remove(); toast(n ? 'กำหนดวันหยุด ' + n + ' วันแล้ว' : 'ไม่มีการเปลี่ยนแปลง'); });
    },
    calSet: () => {
      if (!A.teacher()) return; const c = cal();
      const w = modal('<h3>ตั้งค่าวันซ้อม</h3><form class="form"><label class="ck wide"><input type="checkbox" id="cs-w"' + (c.wkOff ? ' checked' : '') + '><span>เสาร์–อาทิตย์ไม่นับเป็นวันซ้อมปกติ (ถ้ามีซ้อมจริงยังเช็กชื่อได้)</span></label>' +
        fld('ตรวจรอบที่ยังไม่เช็กชื่อตั้งแต่วันที่', '<input class="in" type="date" id="cs-f" value="' + esc(c.from || '') + '">', 'เว้นว่าง = นับจากวันแรกที่มีการเช็กชื่อในปีการศึกษานี้ (ย้อนหลังไม่เกิน 150 วัน)') +
        '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">บันทึก</button></div></form>', { center: true, sticky: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); A.W(B.set('config/attCal', { wkOff: $('#cs-w', w).checked, from: $('#cs-f', w).value || '' })); w.remove(); toast('บันทึกแล้ว'); });
    },
    attGrid: () => { if (A.teacher()) exportGrid(); },
    ckConfirm: () => { if (!checker()) return; A.W(B.set(Y() + '/attmeta/' + CHK.date + '/' + CHK.ses + '/confirmedBy', Object.assign({ at: Date.now() }, A.by()))); toast('ยืนยันแล้ว'); },
    ckPhoto: async d => {
      const w = modal('<div class="row" style="margin-bottom:10px"><h3 class="grow" style="margin:0">รูปหลักฐาน · ' + esc(A.dTH(d.d, 'short')) + ' รอบ' + SES[d.s] + '</h3><button class="btn ghost sm" data-close>ปิด</button></div><div id="ph" class="muted">กำลังโหลด…</div>', { center: true, wide: true });
      try { const p = await B.get(Y() + '/attphoto/' + d.d + '/' + d.s); $('#ph', w).innerHTML = p ? '<img src="' + p + '" alt="รูปหลักฐานการซ้อม" style="width:100%;border-radius:10px">' : 'ไม่พบรูป'; } catch (e) { $('#ph', w).textContent = 'โหลดรูปไม่ได้'; }
    },
    leaveNew: () => {
      const sid = A.sid(); if (!sid) return; const m = A.members()[sid];
      const w = modal('<h3>แจ้งลาซ้อม</h3><form class="form">' + fld('วันที่ลา', '<input class="in" type="date" id="l-date" value="' + A.todayISO() + '" required>') +
        '<div class="fld"><span>รอบที่ลา</span><div class="checks"><label class="ck"><input type="checkbox" id="l-am"' + (m.am ? ' checked' : '') + '><span>เช้า</span></label><label class="ck"><input type="checkbox" id="l-pm"' + (m.pm ? ' checked' : '') + '><span>เย็น</span></label></div></div>' +
        fld('เหตุผล', '<select class="in" id="l-why">' + opt(WHY.map(x => [x, x])) + '</select>') + fld('รายละเอียด (จำเป็น)', '<textarea class="in" id="l-detail" rows="3" required></textarea>', 'เหตุผลเห็นเฉพาะคุณกับครูที่ปรึกษา ประธานและรองประธานเห็นเพียงสถานะว่าลา') +
        '<div class="note bad" id="l-err" hidden></div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn grow">ส่งใบลา</button></div></form>', { center: true, sticky: true });
      $('form', w).addEventListener('submit', e => {
        e.preventDefault(); const date = $('#l-date', w).value, am = $('#l-am', w).checked, pm = $('#l-pm', w).checked, detail = $('#l-detail', w).value.trim();
        const err = t => { const el = $('#l-err', w); el.textContent = t; el.hidden = false; };
        if (!date) return err('เลือกวันที่'); if (!am && !pm) return err('เลือกรอบที่ลาอย่างน้อยหนึ่งรอบ'); if ((am && lmark(date, 'am', sid)) || (pm && lmark(date, 'pm', sid))) return err('มีใบลาของวันและรอบนี้อยู่แล้ว'); if (detail.length < 3) return err('กรอกรายละเอียด');
        const id = B.uid(), upd = {}; upd[Y() + '/leaves/' + sid + '/' + id] = { date, am, pm, why: $('#l-why', w).value, detail, at: Date.now(), status: 'pending', late: date < A.todayISO() };
        if (am) upd[Y() + '/leavemark/' + key(date, 'am') + '/' + sid] = 'pending'; if (pm) upd[Y() + '/leavemark/' + key(date, 'pm') + '/' + sid] = 'pending';
        A.W(B.update('', upd)); window.PUSH && PUSH.notify('leave', { ref: id }); w.remove(); toast('ส่งใบลาแล้ว รอครูรับทราบ');
      });
    },
    leaveAck: d => {
      if (!A.teacher()) return; const l = ((A.D.leaves || {})[d.sid] || {})[d.id]; if (!l) return; const upd = {}, base = Y() + '/leaves/' + d.sid + '/' + d.id + '/';
      upd[base + 'status'] = d.v; upd[base + 'ackBy'] = A.myName(); upd[base + 'ackAt'] = Date.now();
      ['am', 'pm'].forEach(s => { if (!l[s]) return; upd[Y() + '/leavemark/' + key(l.date, s) + '/' + d.sid] = d.v; if (d.v === 'ack') upd[Y() + '/att/' + d.sid + '/' + key(l.date, s)] = 'v'; });
      A.W(B.update('', upd)); window.PUSH && PUSH.notify('leaveok', { to: d.sid, title: d.v === 'ack' ? 'ครูรับทราบใบลาแล้ว' : 'ใบลาไม่ได้รับอนุญาต', body: 'ใบลาวันที่ ' + A.dTH(l.date, 'short'), url: '#/practice' }); toast(d.v === 'ack' ? 'รับทราบแล้ว บันทึกเป็น “ลา” ในการเช็กชื่อ' : 'บันทึกว่าไม่อนุญาต');
    },
    attRule: () => {
      const r = rule(); const w = modal('<h3>เกณฑ์เฝ้าระวัง</h3><form class="form"><div class="g3">' + fld('ขาดตั้งแต่ (ครั้ง)', '<input class="in" id="r-a" inputmode="numeric" value="' + r.absent + '">') + fld('ลาตั้งแต่ (ครั้ง)', '<input class="in" id="r-l" inputmode="numeric" value="' + r.leave + '">') + '</div><div class="muted">นับตามช่วงเวลาที่เลือกในตารางสรุป</div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn grow">บันทึก</button></div></form>', { center: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const a = +$('#r-a', w).value, l = +$('#r-l', w).value; if (!(a > 0 && l > 0)) return toast('กรอกตัวเลขมากกว่า 0'); A.W(B.set('config/attRule', { absent: a, leave: l })); w.remove(); });
    },
    attAction: async d => {
      if (!A.teacher()) return; const m = A.members()[d.sid], c = countsOf(d.sid, rangeStart());
      const w = modal('<h3>ดำเนินการ</h3><div class="muted" style="margin-bottom:8px">' + esc(A.fullName(m)) + ' · ' + esc(A.cls(m)) + ' · มา ' + c.p + ' สาย ' + c.l + ' ลา ' + c.v + ' ขาด ' + c.a + '</div><form class="form">' + fld('การดำเนินการ', '<select class="in" id="x-t">' + opt(ACTS.map(x => [x, x])) + '</select>') + fld('บันทึก', '<textarea class="in" id="x-n" rows="3"></textarea>', 'เห็นเฉพาะครูที่ปรึกษา') +
        '<div class="row wrap" style="margin-top:6px"><a class="btn ghost sm" href="#/m/' + esc(d.sid) + '" data-close>เปิดข้อมูลสมาชิก (ปรับรอบซ้อม/ประเภท)</a></div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ปิด</button><button class="btn grow">บันทึก</button></div></form><div class="lb" style="margin-top:16px">ประวัติการดำเนินการ</div><div id="x-h" class="muted">กำลังโหลด…</div>', { center: true, sticky: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); A.W(B.set('actions/' + d.sid + '/' + B.uid(), { type: $('#x-t', w).value, note: $('#x-n', w).value.trim(), at: Date.now(), by: A.myName() })); w.remove(); toast('บันทึกแล้ว'); });
      try { const h = (await B.get('actions/' + d.sid)) || {}; const ids = Object.keys(h).sort((a, b) => h[b].at - h[a].at); $('#x-h', w).innerHTML = ids.map(i => '<div class="li"><b>' + esc(h[i].type) + '</b> · ' + esc(M.thDate(h[i].at)) + '<br>' + esc(h[i].note || '') + '</div>').join('') || 'ยังไม่มี'; } catch (e) { $('#x-h', w).textContent = 'โหลดไม่ได้'; }
    },
    sumExport: () => {
      const rows = summaryRows(), lab = RANGES.find(x => x[0] === SUM.range)[1];
      const head = ['ลำดับ', 'ชื่อ - สกุล', 'ชั้น', 'มา', 'สาย', 'ลา', 'ขาด', 'มาซ้อม', 'สถานะ'], data = rows.map((x, i) => [String(i + 1), A.fullName(x.m), A.cls(x.m), String(x.c.p), String(x.c.l), String(x.c.v), String(x.c.a), x.c.pct === null ? '-' : x.c.pct + '%', flagOf(x.c)[0]]);
      const sub = '' + M.C.club.full + ' · ปีการศึกษา ' + A.year() + ' · ' + lab, name = 'สรุปการซ้อม-' + M.safeName(lab) + '-' + A.year();
      const w = modal('<h3>ส่งออกรายงานการซ้อม</h3><div class="xlist"><button class="xbtn" data-x="pdf"><b>PDF</b><span>สำหรับพิมพ์หรือส่งต่อ</span></button><button class="xbtn" data-x="docx"><b>DOCX</b><span>เปิดแก้ต่อใน Word</span></button></div><div class="muted" id="x-msg" style="margin-top:10px"></div><button class="btn ghost block" data-close style="margin-top:12px">ปิด</button>', { center: true });
      w.addEventListener('click', async e => { const b = e.target.closest('[data-x]'); if (!b) return; const msg = $('#x-msg', w); msg.textContent = 'กำลังสร้างไฟล์ …';
        try { if (b.dataset.x === 'docx') await M.saveBlob(M.docxTable({ title: 'รายงานสรุปการซ้อม ชมรม' + M.C.club.name + '', lines: [sub.replace(/ · /g, ' ')], head, rows: data, widths: [7, 30, 9, 7, 7, 7, 7, 10, 12], align: ['center', 'left', 'center', 'center', 'center', 'center', 'center', 'center', 'center'], footer: ['', 'ข้อมูล ณ วันที่ ' + M.thDate(Date.now())] }), name + '.docx');
          else await M.exportPDF(A.tablePages('รายงานสรุปการซ้อม', sub, head, data, { widths: [7, 30, 9, 7, 7, 7, 7, 11, 13], align: ['c', '', 'c', 'c', 'c', 'c', 'c', 'c', 'c'], foot: 'ข้อมูล ณ ' + M.thDate(Date.now()) + ' ·' }), name + '.pdf');
          msg.textContent = 'เสร็จแล้ว'; } catch (er) { msg.textContent = 'ส่งออกไม่สำเร็จ: ' + (er.message || er); } });
    }
  });
  document.addEventListener('change', async e => {
    const k = e.target.dataset && e.target.dataset.ck;
    if (k === 'date') { CHK.date = e.target.value || A.todayISO(); CHK.marks = {}; CHK.focus = {}; CHK.photo = null; A.rerender(); }
    else if (k === 'photo') { const f = e.target.files[0]; if (!f) return; try { CHK.photo = await M.fileToImage(f, 900, 0.62); A.rerender(); } catch (er) { toast(er.message); } }
    else if (e.target.dataset && e.target.dataset.sum) { SUM.range = e.target.value; A.rerender(); }
  });
})();
