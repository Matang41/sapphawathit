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
  const CHK = { date: A.todayISO(), ses: new Date().getHours() < 12 ? 'am' : 'pm', marks: {}, photo: null };
  const SUM = { range: 'term' };

  A.SUBS.push(
    { key: 'attmeta', path: y => 'y/' + y + '/attmeta' },
    { key: 'leavemark', path: y => 'y/' + y + '/leavemark' },
    { key: 'att', path: y => checker() ? 'y/' + y + '/att' : 'y/' + y + '/att/' + A.sid(), norm: v => checker() ? v : { [A.sid()]: v } },
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
    Object.keys(r).forEach(k => { if ((!from || k.slice(0, 10) >= from) && c[r[k]] !== undefined) c[r[k]]++; });
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
    const one = s => { if (!m[s]) return '<div class="grow"><div class="muted">ช่วง' + SES[s] + '</div><div class="muted">ไม่ได้กำหนด</div></div>'; const v = saved(sid, t, s), lm = lmark(t, s, sid);
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
    const dirty = Object.keys(CHK.marks).length || CHK.photo;
    let h = '<section class="card"><div class="lb">เช็กการซ้อม</div><div class="row wrap"><input class="in sm" type="date" data-ck="date" value="' + esc(d) + '" max="' + A.todayISO() + '" aria-label="วันที่">' +
      '<div class="seg" role="group" aria-label="รอบซ้อม">' + ['am', 'pm'].map(k => '<button class="' + (s === k ? 'on' : '') + '" aria-pressed="' + (s === k) + '" data-act="ckSes" data-k="' + k + '">ช่วง' + SES[k] + '</button>').join('') + '</div></div>' +
      '<div class="muted" style="margin:10px 0">' + esc(A.dTH(d, 'dow')) + ' · ' + (mt ? 'เช็กแล้วโดย ' + esc(mt.by.name) + (mt.confirmedBy ? ' · ยืนยันโดย ' + esc(mt.confirmedBy.name) : mt.by.id !== 'teacher' ? ' · รอผู้เช็กอีกคนหรือครูยืนยัน' : '') : 'ยังไม่ได้เช็ก') + '</div>';
    if (mt && !mt.confirmedBy && mt.by.id !== 'teacher' && mt.by.id !== me) h += '<button class="btn gold sm" data-act="ckConfirm" style="margin-bottom:10px">ยืนยันการเช็กชื่อรอบนี้</button>';
    h += '<div class="row wrap" style="margin-bottom:6px"><label class="btn ghost">' + ic('cam', 18) + (CHK.photo ? 'เลือกรูปใหม่' : mt && mt.hasPhoto ? 'เปลี่ยนรูปหลักฐาน' : 'ถ่ายรูปหลักฐาน') + '<input type="file" accept="image/*" capture="environment" data-ck="photo" hidden></label>' +
      (CHK.photo ? '<img class="thumb" src="' + CHK.photo + '" alt="รูปหลักฐานที่เลือก">' : mt && mt.hasPhoto ? '<button class="btn ghost" data-act="ckPhoto" data-d="' + esc(d) + '" data-s="' + s + '">ดูรูปหลักฐาน</button>' : '<span class="muted">ยังไม่มีรูปของรอบนี้</span>') + '</div>';
    h += '<div class="row" style="justify-content:space-between;margin-top:10px"><span class="lb" style="margin:0">ผู้ที่ครูกำหนดให้ซ้อมรอบ' + SES[s] + ' (แตะเพื่อเปลี่ยนสถานะ)</span><span class="muted">มา ' + (n.p + n.l) + '/' + list.length + '</span></div>';
    h += list.map(x => { const m = A.members()[x], v = markOf(x, d, s), lm = lmark(d, s, x);
      return '<div class="mrow"><span class="mrow-main">' + avatar(m) + '<span class="grow"><b>' + esc(A.fullName(m)) + '</b><span class="muted">' + esc(A.cls(m) + (A.insts(m).length ? ' · ' + A.insts(m).join(', ') : '')) + (lm ? ' · ใบลา' + (lm === 'pending' ? 'รอรับทราบ' : lm === 'ack' ? 'รับทราบแล้ว' : 'ไม่อนุญาต') : '') + '</span></span></span>' +
        '<button class="stb ' + ST[v][1] + '" data-act="ckMark" data-sid="' + esc(x) + '" aria-label="สถานะของ ' + esc(m.first) + ': ' + ST[v][0] + '">' + ST[v][0] + '</button></div>'; }).join('') || '<div class="empty">ยังไม่มีสมาชิกที่กำหนดรอบ' + SES[s] + ' — ครูกำหนดได้ที่หน้าสมาชิก</div>';
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
    return '<section class="card"><div class="row wrap" style="margin-bottom:8px"><div class="lb grow" style="margin:0">สรุปการซ้อมรายบุคคล (นับเฉพาะรอบที่ถูกเช็ก)</div><select class="in sm" data-sum="range" aria-label="ช่วงเวลา">' + opt(RANGES, SUM.range) + '</select>' +
      (A.teacher() ? '<button class="btn ghost sm" data-act="sumExport">' + ic('down', 16) + 'ส่งออกรายงาน</button>' : '') + '</div>' +
      '<div class="muted" style="margin-bottom:6px">เกณฑ์เฝ้าระวัง: ขาด ' + r.absent + ' ครั้ง หรือ ลา ' + r.leave + ' ครั้งขึ้นไป' + (A.teacher() ? ' · <a href="#" data-act="attRule">แก้เกณฑ์</a>' : '') + '</div>' +
      '<div class="tw"><table class="tb"><thead><tr><th>สมาชิก</th><th>มา</th><th>สาย</th><th>ลา</th><th>ขาด</th><th>มาซ้อม</th><th>สถานะ</th>' + (A.teacher() ? '<th><span class="sr">ดำเนินการ</span></th>' : '') + '</tr></thead><tbody>' +
      rows.map(x => { const f = flagOf(x.c); return '<tr><td><b>' + esc(A.fullName(x.m)) + '</b><div class="muted">' + esc(A.cls(x.m) + ' · ' + A.sesText(x.m)) + '</div></td><td>' + x.c.p + '</td><td>' + x.c.l + '</td><td>' + x.c.v + '</td><td>' + x.c.a + '</td><td>' + (x.c.pct === null ? '-' : x.c.pct + '%') + '</td><td>' + chip(f[0], f[1]) + '</td>' +
        (A.teacher() ? '<td><button class="btn ghost sm" data-act="attAction" data-sid="' + esc(x.sid) + '">ดำเนินการ</button></td>' : '') + '</tr>'; }).join('') + '</tbody></table></div>' + (rows.length ? '' : '<div class="empty">ยังไม่มีข้อมูล</div>') + '</section>';
  }
  A.V.practice = function () {
    let b = '';
    if (!A.teacher()) b += myCard();
    if (checker()) b += checkCard();
    if (A.teacher()) b += leavesCard();
    if (checker()) b += summaryCard();
    if (!A.teacher()) b += myLeaves();
    return { title: 'การซ้อม', body: b };
  };
  A.TODO.push(() => A.teacher() ? { n: pendingLeaves().length, label: 'ใบลารอรับทราบ', href: '#/practice' } : null);
  A.HOME.push({ order: 20, html: () => {
    const t = A.todayISO();
    if (A.teacher()) { const n = pendingLeaves().length; const st = s => { const mt = meta(t, s); return mt ? 'เช็กแล้ว (' + ((mt.n || {}).p + (mt.n || {}).l || 0) + ' คน)' : 'ยังไม่เช็ก'; };
      return '<section class="card"><div class="lb">การซ้อมวันนี้</div><div class="row"><div class="grow"><div class="muted">ช่วงเช้า</div><b>' + st('am') + '</b></div><div class="grow"><div class="muted">ช่วงเย็น</div><b>' + st('pm') + '</b></div></div><div class="row wrap" style="margin-top:12px"><a class="btn" href="#/practice">เช็กการซ้อม</a>' + (n ? '<a class="btn gold" href="#/practice">ใบลารอรับทราบ ' + n + '</a>' : '') + '</div></section>'; }
    const m = A.members()[A.sid()]; const one = s => m[s] ? (saved(A.sid(), t, s) ? ST[saved(A.sid(), t, s)][0] : meta(t, s) ? 'ไม่อยู่ในรายชื่อ' : 'ยังไม่เช็ก') : 'ไม่ได้กำหนด';
    return '<section class="card"><div class="lb">การซ้อมวันนี้</div><div class="row"><div class="grow"><div class="muted">ช่วงเช้า</div><b>' + one('am') + '</b></div><div class="grow"><div class="muted">ช่วงเย็น</div><b>' + one('pm') + '</b></div></div><div class="row wrap" style="margin-top:12px">' + (checker() ? '<a class="btn gold" href="#/practice">เช็กการซ้อม</a>' : '') + '<button class="btn ghost" data-act="leaveNew">แจ้งลาซ้อม</button></div></section>';
  } });

  /* ============ การทำงาน ============ */
  Object.assign(A.ACT, {
    ckSes: d => { CHK.ses = d.k; CHK.marks = {}; CHK.photo = null; A.rerender(); },
    ckMark: d => { if (!checker()) return; const v = markOf(d.sid, CHK.date, CHK.ses); CHK.marks[d.sid] = ORDER[(ORDER.indexOf(v) + 1) % 4]; A.rerender(); },
    ckSave: () => {
      if (!checker()) return; const d = CHK.date, s = CHK.ses, list = roster(d, s), upd = {}, n = { p: 0, l: 0, v: 0, a: 0 }, old = meta(d, s);
      list.forEach(x => { const v = markOf(x, d, s); n[v]++; upd[Y() + '/att/' + x + '/' + key(d, s)] = v; });
      upd[Y() + '/attmeta/' + d + '/' + s] = { by: A.by(), at: Date.now(), n, hasPhoto: !!(CHK.photo || (old && old.hasPhoto)) };
      A.W(B.update('', upd)); if (CHK.photo) A.W(B.set(Y() + '/attphoto/' + d + '/' + s, CHK.photo));
      CHK.marks = {}; CHK.photo = null; toast('บันทึกการเช็กชื่อแล้ว'); A.rerender();
    },
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
        A.W(B.update('', upd)); w.remove(); toast('ส่งใบลาแล้ว รอครูรับทราบ');
      });
    },
    leaveAck: d => {
      if (!A.teacher()) return; const l = ((A.D.leaves || {})[d.sid] || {})[d.id]; if (!l) return; const upd = {}, base = Y() + '/leaves/' + d.sid + '/' + d.id + '/';
      upd[base + 'status'] = d.v; upd[base + 'ackBy'] = A.myName(); upd[base + 'ackAt'] = Date.now();
      ['am', 'pm'].forEach(s => { if (!l[s]) return; upd[Y() + '/leavemark/' + key(l.date, s) + '/' + d.sid] = d.v; if (d.v === 'ack') upd[Y() + '/att/' + d.sid + '/' + key(l.date, s)] = 'v'; });
      A.W(B.update('', upd)); toast(d.v === 'ack' ? 'รับทราบแล้ว บันทึกเป็น “ลา” ในการเช็กชื่อ' : 'บันทึกว่าไม่อนุญาต');
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
      const sub = 'ชมรมดนตรีไทย โรงเรียนสรรพวิทยาคม · ปีการศึกษา ' + A.year() + ' · ' + lab, name = 'สรุปการซ้อม-' + M.safeName(lab) + '-' + A.year();
      const w = modal('<h3>ส่งออกรายงานการซ้อม</h3><div class="xlist"><button class="xbtn" data-x="pdf"><b>PDF</b><span>สำหรับพิมพ์หรือส่งต่อ</span></button><button class="xbtn" data-x="docx"><b>DOCX</b><span>เปิดแก้ต่อใน Word</span></button></div><div class="muted" id="x-msg" style="margin-top:10px"></div><button class="btn ghost block" data-close style="margin-top:12px">ปิด</button>', { center: true });
      w.addEventListener('click', async e => { const b = e.target.closest('[data-x]'); if (!b) return; const msg = $('#x-msg', w); msg.textContent = 'กำลังสร้างไฟล์ …';
        try { if (b.dataset.x === 'docx') await M.saveBlob(M.docxTable({ title: 'รายงานสรุปการซ้อม ชมรมสรรพวาทิต', lines: [sub.replace(/ · /g, ' ')], head, rows: data, widths: [7, 30, 9, 7, 7, 7, 7, 10, 12], align: ['center', 'left', 'center', 'center', 'center', 'center', 'center', 'center', 'center'], footer: ['', 'ข้อมูล ณ วันที่ ' + M.thDate(Date.now())] }), name + '.docx');
          else await M.exportPDF(A.tablePages('รายงานสรุปการซ้อม', sub, head, data, { widths: [7, 30, 9, 7, 7, 7, 7, 11, 13], align: ['c', '', 'c', 'c', 'c', 'c', 'c', 'c', 'c'], foot: 'ข้อมูล ณ ' + M.thDate(Date.now()) + ' ·' }), name + '.pdf');
          msg.textContent = 'เสร็จแล้ว'; } catch (er) { msg.textContent = 'ส่งออกไม่สำเร็จ: ' + (er.message || er); } });
    }
  });
  document.addEventListener('change', async e => {
    const k = e.target.dataset && e.target.dataset.ck;
    if (k === 'date') { CHK.date = e.target.value || A.todayISO(); CHK.marks = {}; CHK.photo = null; A.rerender(); }
    else if (k === 'photo') { const f = e.target.files[0]; if (!f) return; try { CHK.photo = await M.fileToImage(f, 900, 0.62); A.rerender(); } catch (er) { toast(er.message); } }
    else if (e.target.dataset && e.target.dataset.sum) { SUM.range = e.target.value; A.rerender(); }
  });
})();
