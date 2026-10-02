/* ============================================================
   behave.js — ประเมินพฤติกรรมสมาชิกรายสัปดาห์ (ครูเป็นผู้ประเมิน)
   ข้อมูล: y/{ปี}/behave/{sid}/{วันจันทร์ของสัปดาห์} = { s: 1–4, note, at, by }
   ครูแตะระดับครั้งเดียวต่อคน ระบบบันทึกทันที · สมาชิกเห็นเฉพาะผลของตัวเอง
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP;
  const { $, esc, toast, modal } = M; const { ic, chip, avatar } = A;
  const Y = () => 'y/' + A.year();
  const LV = [[4, 'ดีเยี่ยม', 'ok'], [3, 'ดี', 'blue'], [2, 'พอใช้', 'gold'], [1, 'ควรปรับปรุง', 'bad']];
  const lv = n => LV.find(x => x[0] === n) || [0, 'ยังไม่ประเมิน', 'line'];
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const monday = (d, add) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7) + (add || 0) * 7); return iso(x); };
  const BH = { week: monday(new Date()) };
  const weekTxt = w => { const a = new Date(w + 'T00:00:00'), b = new Date(a); b.setDate(a.getDate() + 6); return A.dTH(w, 'short') + ' – ' + A.dTH(iso(b), 'short'); };

  A.SUBS.push({ key: 'behave', path: y => A.teacher() ? 'y/' + y + '/behave' : 'y/' + y + '/behave/' + A.sid(), norm: v => A.teacher() ? v : { [A.sid()]: v } });
  A.NAVS.push({ id: 'behave', label: 'ประเมินพฤติกรรม', icon: 'star', order: 25, show: () => A.teacher() });
  const rec = (sid, w) => ((A.D.behave || {})[sid] || {})[w] || null;
  const avgOf = sid => { const r = (A.D.behave || {})[sid] || {}, ks = Object.keys(r).filter(k => r[k] && r[k].s); return ks.length ? { n: ks.length, avg: Math.round(ks.reduce((a, k) => a + r[k].s, 0) / ks.length * 100) / 100 } : { n: 0, avg: 0 }; };
  const todo = () => A.activeSids().filter(s => !rec(s, monday(new Date()))).length;
  A.TODO.push(() => A.teacher() && A.activeSids().length ? { n: todo(), label: 'สมาชิกที่ยังไม่ได้ประเมินพฤติกรรมสัปดาห์นี้', href: '#/behave' } : null);

  A.V.behave = function () {
    if (!A.teacher()) { location.hash = '#/home'; return null; }
    const w = BH.week, list = A.activeSids().sort(A.byClass), ms = A.members(), done = list.filter(s => rec(s, w)).length, cur = w === monday(new Date());
    let b = '<section class="card"><div class="row"><button class="icb" data-act="bhWeek" data-d="-1" aria-label="สัปดาห์ก่อนหน้า">' + ic('left') + '</button><div class="grow" style="text-align:center"><b>สัปดาห์ ' + esc(weekTxt(w)) + '</b><div class="muted">' + (cur ? 'สัปดาห์นี้ · ' : '') + 'ประเมินแล้ว ' + done + '/' + list.length + ' คน</div></div><button class="icb" data-act="bhWeek" data-d="1" aria-label="สัปดาห์ถัดไป"' + (cur ? ' disabled' : '') + '>' + ic('right') + '</button></div>' +
      '<div class="row wrap" style="margin-top:12px">' + (done < list.length ? '<button class="btn" data-act="bhAll">ให้ “ดี” กับคนที่ยังไม่ประเมิน (' + (list.length - done) + ')</button>' : '') + '<button class="btn ghost" data-act="bhExport">' + ic('down', 18) + 'ส่งออกสรุป</button></div>' +
      '<div class="muted" style="margin-top:8px">แตะระดับของแต่ละคน ระบบบันทึกทันที แตะซ้ำเพื่อยกเลิก · “บันทึก” ใช้เขียนข้อความถึงนักเรียน (นักเรียนเห็นเฉพาะของตัวเอง)</div></section>';
    b += '<section class="card">' + (list.map(s => { const r = rec(s, w), a = avgOf(s);
      return '<div class="bh"><div class="mrow-main">' + avatar(ms[s]) + '<span class="grow"><b>' + esc(A.fullName(ms[s])) + '</b><span class="muted">' + esc(A.cls(ms[s])) + (a.n ? ' · เฉลี่ย ' + a.avg.toFixed(2) + ' จาก ' + a.n + ' สัปดาห์' : '') + (r && r.note ? ' · มีบันทึก' : '') + '</span></span></div>' +
        '<div class="bh-b" role="group" aria-label="ระดับพฤติกรรมของ ' + esc(ms[s].first) + '">' + LV.map(x => '<button class="stb ' + (r && r.s === x[0] ? x[2] : 'off') + '" aria-pressed="' + !!(r && r.s === x[0]) + '" data-act="bhSet" data-sid="' + esc(s) + '" data-s="' + x[0] + '">' + x[1] + '</button>').join('') +
        '<button class="btn ghost sm" data-act="bhNote" data-sid="' + esc(s) + '">บันทึก</button></div></div>'; }).join('') || '<div class="empty">ยังไม่มีสมาชิก</div>') + '</section>';
    return { title: 'ประเมินพฤติกรรมรายสัปดาห์', body: b };
  };
  /* สมาชิก: ผลของตัวเองบนหน้าหลัก */
  A.HOME.push({ order: 22, html: () => {
    const sid = A.sid(); if (!sid) return ''; const r = (A.D.behave || {})[sid] || {}, ks = Object.keys(r).filter(k => r[k] && r[k].s).sort().reverse(); if (!ks.length) return '';
    const a = avgOf(sid);
    return '<section class="card"><div class="row"><div class="lb grow" style="margin:0">ผลประเมินพฤติกรรมรายสัปดาห์จากครู</div><span class="muted">เฉลี่ย ' + a.avg.toFixed(2) + ' / 4</span></div>' + ks.slice(0, 4).map(k => '<div class="li"><div class="row"><span class="grow">' + esc(weekTxt(k)) + '</span>' + chip(lv(r[k].s)[1], lv(r[k].s)[2]) + '</div>' + (r[k].note ? '<div class="muted">ครู: ' + esc(r[k].note) + '</div>' : '') + '</div>').join('') + '</section>';
  } });

  const save = (sid, s, note) => { const old = rec(sid, BH.week) || {}; const v = { s: s, at: Date.now(), by: A.myName() }; const n = note === undefined ? old.note : note; if (n) v.note = n; return A.W(B.set(Y() + '/behave/' + sid + '/' + BH.week, v)); };
  Object.assign(A.ACT, {
    bhWeek: d => { const x = monday(new Date(BH.week + 'T00:00:00'), +d.d); if (x > monday(new Date())) return; BH.week = x; A.rerender(); },
    bhSet: d => { if (!A.teacher()) return; const r = rec(d.sid, BH.week), s = +d.s; if (r && r.s === s && !r.note) A.W(B.remove(Y() + '/behave/' + d.sid + '/' + BH.week)); else save(d.sid, s); },
    bhAll: () => { if (!A.teacher()) return; const upd = {}, now = Date.now(); A.activeSids().forEach(s => { if (!rec(s, BH.week)) upd[s + '/' + BH.week] = { s: 3, at: now, by: A.myName() }; }); const n = Object.keys(upd).length; if (n) { A.W(B.update(Y() + '/behave', upd)); toast('ให้ “ดี” ' + n + ' คนแล้ว แก้รายคนได้'); } },
    bhNote: d => {
      if (!A.teacher()) return; const m = A.members()[d.sid], r = rec(d.sid, BH.week) || {};
      const w = modal('<h3>บันทึกถึงนักเรียน</h3><div class="muted" style="margin-bottom:8px">' + esc(A.fullName(m)) + ' · สัปดาห์ ' + esc(weekTxt(BH.week)) + '</div><form class="form">' + A.fld('ระดับ', '<select class="in" id="b-s">' + A.opt(LV.map(x => [x[0], x[1]]), r.s || 3) + '</select>') + A.fld('ข้อความ (นักเรียนคนนี้จะเห็น)', '<textarea class="in" id="b-n" rows="3">' + esc(r.note || '') + '</textarea>') + '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn grow">บันทึก</button></div></form>', { center: true, sticky: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); save(d.sid, +$('#b-s', w).value, $('#b-n', w).value.trim() || null); w.remove(); });
    },
    bhExport: () => {
      const list = A.activeSids().sort(A.byClass), ms = A.members(), wk = BH.week;
      const head = ['ลำดับ', 'ชื่อ - สกุล', 'ชั้น', 'สัปดาห์นี้', 'เฉลี่ยทั้งปี', 'จำนวนสัปดาห์', 'บันทึก'], rows = list.map((s, i) => { const r = rec(s, wk), a = avgOf(s); return [String(i + 1), A.fullName(ms[s]), A.cls(ms[s]), r ? lv(r.s)[1] : '-', a.n ? a.avg.toFixed(2) : '-', String(a.n), (r && r.note) || '']; });
      const sub = 'ชมรมดนตรีไทย โรงเรียนสรรพวิทยาคม · ปีการศึกษา ' + A.year() + ' · สัปดาห์ ' + weekTxt(wk), name = 'ประเมินพฤติกรรม-' + wk;
      const w = modal('<h3>ส่งออกสรุปการประเมินพฤติกรรม</h3><div class="xlist"><button class="xbtn" data-x="pdf"><b>PDF</b><span>สำหรับพิมพ์</span></button><button class="xbtn" data-x="docx"><b>DOCX</b><span>เปิดแก้ต่อใน Word</span></button></div><div class="muted" id="x-msg" style="margin-top:10px"></div><button class="btn ghost block" data-close style="margin-top:12px">ปิด</button>', { center: true });
      w.addEventListener('click', async e => { const x = e.target.closest('[data-x]'); if (!x) return; const msg = $('#x-msg', w); msg.textContent = 'กำลังสร้างไฟล์ …';
        try { if (x.dataset.x === 'docx') await M.saveBlob(M.docxTable({ title: 'สรุปการประเมินพฤติกรรมรายสัปดาห์ ชมรมสรรพวาทิต', lines: [sub.replace(/ · /g, ' ')], head, rows, widths: [7, 28, 9, 13, 11, 11, 21], align: ['center', 'left', 'center', 'center', 'center', 'center', 'left'], footer: ['', 'ระดับ: ดีเยี่ยม 4 · ดี 3 · พอใช้ 2 · ควรปรับปรุง 1'] }), name + '.docx');
          else await M.exportPDF(A.tablePages('สรุปการประเมินพฤติกรรมรายสัปดาห์', sub, head, rows, { widths: [7, 28, 9, 13, 11, 11, 21], align: ['c', '', 'c', 'c', 'c', 'c', ''], foot: 'ระดับ: ดีเยี่ยม 4 · ดี 3 · พอใช้ 2 · ควรปรับปรุง 1 ·' }), name + '.pdf'); msg.textContent = 'เสร็จแล้ว'; }
        catch (er) { msg.textContent = 'ส่งออกไม่สำเร็จ: ' + (er.message || er); } });
    }
  });
})();
