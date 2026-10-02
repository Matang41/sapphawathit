/* ============================================================
   alumni.js — ขั้นที่ 7: ทำเนียบอดีตประธานและคณะกรรมการ · ศิษย์เก่า · การขึ้นปีการศึกษาใหม่
   ข้อมูล: archive/{ปี} = คณะกรรมการของปีนั้น (บันทึกตอนขึ้นปีใหม่) · alumni/{id} = ศิษย์เก่าที่ครูกรอกย้อนหลัง
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP;
  const { $, esc, toast, modal, money } = M; const { ic, chip, fld, avatar } = A;

  A.SUBS.push({ key: 'alumni', path: () => 'alumni' }, { key: 'archive', path: () => 'archive' });
  A.NAVS.push({ id: 'alumni', label: 'ทำเนียบ', icon: 'book', order: 80 });

  const manual = () => Object.keys(A.D.alumni || {}).map(id => Object.assign({ id }, A.D.alumni[id])).filter(a => a.name);
  function presidents() {
    const o = []; const ar = A.D.archive || {};
    Object.keys(ar).forEach(y => Object.keys((ar[y] || {}).roles || {}).forEach(s => { const r = ar[y].roles[s]; if (r.role === 'president') o.push({ year: y, name: r.name, sub: r.cls || '', m: A.members()[s] }); }));
    manual().filter(a => /ประธาน/.test(a.role || '') && !/รอง/.test(a.role || '')).forEach(a => o.push({ year: String(a.roleYear || a.gradYear || ''), name: a.name, sub: a.role, m: a }));
    return o.sort((a, b) => b.year.localeCompare(a.year));
  }
  A.V.alumni = function () {
    const T = A.teacher(), ms = A.members(), ar = A.D.archive || {};
    let b = T ? '<div class="row wrap" style="margin-bottom:14px"><button class="btn" data-act="alNew">' + ic('plus', 18) + 'เพิ่มศิษย์เก่า / อดีตกรรมการย้อนหลัง</button></div>' : '';
    const ps = presidents(), cur = A.activeSids().find(s => (A.roleOf(s) || {}).role === 'president');
    b += '<section class="card tree"><div class="lb light">ทำเนียบประธานชมรม</div><div class="tier">' + (cur ? '<div class="pp">' + avatar(ms[cur], 'lg') + '<b>' + esc(A.fullName(ms[cur])) + '</b><span>ปัจจุบัน · ' + esc(A.year()) + '</span></div>' : '') +
      ps.map(p => '<div class="pp">' + avatar(p.m || { first: p.name }, 'lg') + '<b>' + esc(p.name) + '</b><span>ปีการศึกษา ' + esc(p.year) + '</span></div>').join('') + (!cur && !ps.length ? '<span class="muted light">ยังไม่มีข้อมูล</span>' : '') + '</div></section>';
    const years = Object.keys(ar).sort().reverse();
    if (years.length) b += '<section class="card"><div class="lb">คณะกรรมการชมรมในอดีต</div>' + years.map(y => { const r = ar[y].roles || {}; const ks = Object.keys(r).sort((a, c) => A.ROLE_ORDER.indexOf(r[a].role) - A.ROLE_ORDER.indexOf(r[c].role) || (r[a].grade || 0) - (r[c].grade || 0));
      return '<details class="yr"><summary>ปีการศึกษา ' + esc(y) + ' <span class="muted">· สมาชิก ' + (ar[y].n || 0) + ' คน · กรรมการ ' + ks.length + ' คน</span></summary>' + ks.map(s => '<div class="kv"><span>' + esc(A.roleName(r[s])) + '</span><b>' + esc(r[s].name) + '</b></div>').join('') + '</details>'; }).join('') + '</section>';
    const al = Object.keys(ms).filter(s => ms[s] && ms[s].status === 'alumni').map(s => ({ name: A.fullName(ms[s]), gradYear: String(ms[s].gradYear || ''), inst: A.insts(ms[s]).join(', '), m: ms[s], lv: A.topLv(s) }))
      .concat(manual().map(a => ({ name: a.name, gradYear: String(a.gradYear || ''), inst: a.inst || '', role: a.role, m: a, id: a.id, note: a.note })));
    const gy = Array.from(new Set(al.map(a => a.gradYear))).sort().reverse();
    b += '<section class="card"><div class="lb">ศิษย์เก่าชมรม (' + al.length + ')</div>' + (gy.map(y => '<div class="mo-h">' + (y ? 'จบปีการศึกษา ' + esc(y) : 'ไม่ระบุปี') + '</div>' + al.filter(a => a.gradYear === y).map(a => '<div class="mrow"><span class="mrow-main">' + avatar(a.m.photo ? a.m : { first: a.name }) + '<span class="grow"><b>' + esc(a.name) + '</b><span class="muted">' + esc([a.role, a.inst, a.lv ? 'ระดับ ' + A.lvName(a.lv) : '', a.note].filter(Boolean).join(' · ')) + '</span></span></span>' +
      (T && a.id ? '<span class="mrow-act"><button class="icb" data-act="alEdit" data-id="' + esc(a.id) + '" aria-label="แก้ไข">' + ic('edit', 20) + '</button><button class="icb danger" data-act="alDel" data-id="' + esc(a.id) + '" aria-label="ลบ">' + ic('trash', 20) + '</button></span>' : '') + '</div>').join('')).join('') || '<div class="muted">ยังไม่มีข้อมูลศิษย์เก่า — สมาชิก ม.6 จะย้ายมาที่นี่เมื่อขึ้นปีการศึกษาใหม่ และครูเพิ่มรุ่นก่อนหน้าได้เอง</div>') + '</section>';
    return { title: 'ทำเนียบชมรม', body: b };
  };
  function alForm(id) {
    const a = id ? A.D.alumni[id] : {}; let photo;
    const w = modal('<h3>' + (id ? 'แก้ไขข้อมูล' : 'เพิ่มศิษย์เก่า / อดีตกรรมการ') + '</h3><form class="form">' + fld('ชื่อ-สกุล', '<input class="in" id="a-n" value="' + esc(a.name || '') + '" required>') +
      '<div class="g3">' + fld('จบปีการศึกษา (พ.ศ.)', '<input class="in" id="a-y" inputmode="numeric" value="' + esc(a.gradYear || '') + '">') + fld('ตำแหน่งในชมรม (ถ้ามี)', '<input class="in" id="a-r" value="' + esc(a.role || '') + '" placeholder="เช่น ประธานชมรม">') + fld('ปีที่ดำรงตำแหน่ง', '<input class="in" id="a-ry" inputmode="numeric" value="' + esc(a.roleYear || '') + '">') + '</div>' +
      fld('เครื่องดนตรี', '<input class="in" id="a-i" value="' + esc(a.inst || '') + '">') + fld('หมายเหตุ (ปัจจุบันทำอะไร ผลงาน)', '<input class="in" id="a-o" value="' + esc(a.note || '') + '">') + fld('รูป (ไม่บังคับ)', '<input class="in" type="file" accept="image/*" id="a-p">') +
      '<div class="muted">ควรได้รับความยินยอมจากเจ้าตัวก่อนนำชื่อและรูปขึ้นทำเนียบ</div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn grow">บันทึก</button></div></form>', { center: true, sticky: true });
    $('#a-p', w).addEventListener('change', async e => { const f = e.target.files[0]; if (f) try { photo = await M.fileToSquare(f, 200, 0.8); } catch (er) { toast(er.message); } });
    $('form', w).addEventListener('submit', e => { e.preventDefault(); const v = k => $(k, w).value.trim(); if (!v('#a-n')) return;
      const rec = { name: v('#a-n'), gradYear: v('#a-y') || null, role: v('#a-r') || null, roleYear: v('#a-ry') || null, inst: v('#a-i') || null, note: v('#a-o') || null, photo: photo || a.photo || null, at: Date.now() };
      A.W(B.set('alumni/' + (id || B.uid()), JSON.parse(JSON.stringify(rec)))); w.remove(); toast('บันทึกแล้ว'); });
  }

  /* ---------- ขึ้นปีการศึกษาใหม่ ---------- */
  A.MANAGE.push(() => '<section class="card"><div class="lb">ขึ้นปีการศึกษาใหม่</div><div class="muted" style="margin-bottom:10px">เลื่อนชั้นสมาชิก ย้าย ม.6 ไปทำเนียบศิษย์เก่า เก็บคณะกรรมการปี ' + esc(A.year()) + ' เข้าทำเนียบ แล้วเริ่มปี ' + (+A.year() + 1) + ' ข้อมูลการซ้อม กิจกรรม และบัญชีของปีเดิมยังเก็บไว้ครบ</div><button class="btn ghost" data-act="rollover">เริ่มขั้นตอนขึ้นปีการศึกษา ' + (+A.year() + 1) + '</button></section>');
  function rollover() {
    const y = A.year(), ny = String(+y + 1), ms = A.members(), act = A.activeSids(), m6 = act.filter(s => +ms[s].grade === 6), bal = A.finSummarize ? A.finSummarize().bal : 0;
    const w = modal('<h3>ขึ้นปีการศึกษา ' + ny + '</h3><div class="note warn">ทำครั้งเดียวตอนเปิดปีการศึกษาใหม่ ย้อนกลับเองไม่ได้ ควรส่งออกรายชื่อ (DOCX) เก็บไว้ก่อน</div><form class="form">' +
      '<div class="kv"><span>สมาชิกปัจจุบัน</span><b>' + act.length + ' คน</b></div><div class="kv"><span>ม.1–ม.5 เลื่อนขึ้นหนึ่งชั้น (ห้องคงเดิม แก้ภายหลังได้)</span><b>' + (act.length - m6.length) + ' คน</b></div>' +
      '<label class="ck wide"><input type="checkbox" id="r-m6" checked><span>ม.6 จำนวน ' + m6.length + ' คน จบการศึกษา → ย้ายไปทำเนียบศิษย์เก่า</span></label>' +
      '<label class="ck wide"><input type="checkbox" id="r-roles" checked><span>เก็บคณะกรรมการปี ' + y + ' เข้าทำเนียบ แล้วล้างตำแหน่งเพื่อแต่งตั้งชุดใหม่</span></label>' +
      '<label class="ck wide"><input type="checkbox" id="r-bal"' + (bal > 0 ? ' checked' : ' disabled') + '><span>ยกยอดเงินคงเหลือ ' + money(bal) + ' บาท ไปเป็น “ยอดยกมา” ของปี ' + ny + '</span></label>' +
      '<div class="muted">สมาชิก ม.3 ที่ไม่ได้เรียนต่อที่โรงเรียน ให้นำออกรายคนที่หน้าสมาชิก</div>' + fld('พิมพ์ปีการศึกษาใหม่เพื่อยืนยัน', '<input class="in" id="r-y" inputmode="numeric" placeholder="' + ny + '">') +
      '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn danger grow">ขึ้นปีการศึกษา ' + ny + '</button></div></form>', { sticky: true, wide: true });
    $('form', w).addEventListener('submit', e => {
      e.preventDefault(); if ($('#r-y', w).value.trim() !== ny) return toast('พิมพ์ ' + ny + ' เพื่อยืนยัน'); if (A.STATUS.online === false) return toast('ต้องออนไลน์', 3000);
      const upd = {}, now = Date.now(), roles = {}, grad = $('#r-m6', w).checked;
      act.forEach(s => { const r = A.roleOf(s); if (r) roles[s] = Object.assign({ name: A.fullName(ms[s]), cls: A.cls(ms[s]) }, r);
        if (+ms[s].grade === 6) { if (grad) { upd['members/' + s + '/status'] = 'alumni'; upd['members/' + s + '/removedReason'] = 'graduate'; upd['members/' + s + '/removedAt'] = now; upd['members/' + s + '/gradYear'] = y; } }
        else upd['members/' + s + '/grade'] = +ms[s].grade + 1; });
      upd['archive/' + y] = { roles: Object.keys(roles).length ? roles : null, n: act.length, at: now };
      if ($('#r-roles', w).checked) upd['roles'] = null; else if (grad) m6.forEach(s => { upd['roles/' + s] = null; });
      if ($('#r-bal', w).checked && bal > 0) { const rec = { kind: 'in', no: 'ร.001/' + ny, date: A.todayISO(), amount: bal, party: 'ชมรมสรรพวาทิต ปีการศึกษา ' + y, title: 'ยอดยกมาจากปีการศึกษา ' + y, cat: 'ยอดยกมา', at: now, by: A.by(), status: 'approved', approvedBy: A.myName(), approvedAt: now };
        upd['y/' + ny + '/ledger/carry'] = rec; upd['y/' + ny + '/counters/in'] = 1; upd['y/' + ny + '/finsum'] = { bal, inSum: bal, outSum: 0, n: 1, at: now, months: { [rec.date.slice(0, 7)]: { in: bal, out: 0 } } }; }
      upd['config/year'] = ny;
      A.W(B.update('', upd)); A.log('year.rollover', '', y + ' → ' + ny); w.remove(); toast('ขึ้นปีการศึกษา ' + ny + ' แล้ว', 4000); location.hash = '#/home';
    });
  }
  Object.assign(A.ACT, {
    alNew: () => { if (A.teacher()) alForm(null); }, alEdit: d => { if (A.teacher()) alForm(d.id); },
    alDel: async d => { if (!A.teacher()) return; if (!(await M.confirmBox('ลบรายการ', esc(A.D.alumni[d.id].name), 'ลบ', true))) return; A.W(B.remove('alumni/' + d.id)); },
    rollover: () => { if (A.teacher()) rollover(); }
  });
})();
