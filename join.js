/* ============================================================
   join.js — ใบสมัครสมาชิกผ่านลิงก์ (นักเรียนกรอกเอง ไม่ต้องล็อกอิน) → ครู/เลขานุการรับเข้าทะเบียน
   ข้อมูล: public/join = { open, year } (ใครก็อ่านได้) · applications/{เลขประจำตัว} (เขียนได้ครั้งเดียวขณะเปิดรับ)
   หลังรับเข้าทะเบียน นักเรียนเข้าแอปด้วยอีเมล เลขประจำตัว@โดเมนโรงเรียน ได้ทันที
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP, C = M.C;
  const { $, $$, esc, toast, modal } = M;
  const canJoin = () => A.teacher() || A.is('secretary');
  const linkOf = () => location.origin + location.pathname + '?join=1&club=' + C.club.id + (B.mode === 'demo' ? '&demo=1' : '');
  const apps = () => Object.keys(A.D.applications || {}).map(s => Object.assign({ sid: s }, A.D.applications[s])).filter(a => a.first).sort((a, b) => a.at - b.at);
  const isOpen = () => !!((A.D.pub || {}).join || {}).open;

  A.SUBS.push({ key: 'pub', path: () => 'public' }, { key: 'applications', path: () => canJoin() ? 'applications' : null });
  A.TODO.push(() => canJoin() ? { n: apps().length, label: 'ใบสมัครสมาชิกใหม่รอรับเข้าทะเบียน', href: '#/join' } : null);
  A.NAVS.push({ id: 'join', label: 'ใบสมัคร', icon: 'plus', order: 42, show: canJoin, badge: () => apps().length });

  A.V.join = function () {
    if (!canJoin()) { location.hash = '#/home'; return null; }
    const l = apps(), open = isOpen();
    let b = '<section class="card"><div class="row"><div class="grow"><div class="lb" style="margin:0">ลิงก์ใบสมัครสมาชิก</div><b>' + (open ? 'กำลังเปิดรับสมัคร' : 'ปิดรับสมัครอยู่') + '</b></div>' + (A.teacher() ? '<button class="btn ' + (open ? 'ghost' : 'gold') + '" data-act="joinToggle">' + (open ? 'ปิดรับสมัคร' : 'เปิดรับสมัคร') + '</button>' : '') + '</div>' +
      '<div class="muted" style="margin:8px 0">ส่งลิงก์นี้ให้นักเรียนกรอกข้อมูลของตัวเอง (ไม่ต้องล็อกอิน ไม่ต้องแนบรูป) เมื่อรับเข้าทะเบียนแล้ว นักเรียนเข้าแอปด้วยอีเมล เลขประจำตัว@' + esc(C.auth.domain) + ' ได้ทันที</div>' +
      '<input class="in" readonly value="' + esc(linkOf()) + '" aria-label="ลิงก์ใบสมัคร" onclick="this.select()"><div class="row wrap" style="margin-top:10px"><button class="btn" data-act="joinCopy">คัดลอกลิงก์</button>' + (navigator.share ? '<button class="btn ghost" data-act="joinShare">แชร์ลิงก์</button>' : '') + '</div>' +
      (open ? '' : '<div class="note warn">ตอนนี้ปิดรับสมัคร นักเรียนที่เปิดลิงก์จะเห็นว่าปิดรับ' + (A.teacher() ? '' : ' (ครูเป็นผู้เปิด)') + '</div>') + '</section>';
    b += '<section class="card"><div class="row" style="margin-bottom:6px"><div class="lb grow" style="margin:0">ใบสมัครที่รอรับเข้าทะเบียน (' + l.length + ')</div>' + (l.length > 1 ? '<button class="btn sm" data-act="joinAll">รับทั้งหมด</button>' : '') + '</div>' +
      (l.map(a => '<div class="li"><div class="row"><div class="grow"><b>' + esc((a.prefix || '') + a.first + ' ' + a.last) + '</b><div class="muted">' + esc('เลขประจำตัว ' + a.sid + ' · ม.' + a.grade + '/' + a.room + (a.inst ? ' · ' + Object.keys(a.inst).join(', ') : '') + ' · ส่งเมื่อ ' + M.thDate(a.at)) + '</div>' +
        '<div class="muted">' + esc(['โทร ' + (a.phone || '-'), 'ผู้ปกครอง ' + (a.parentName || '-') + ' ' + (a.parentPhone || '')].join(' · ')) + '</div>' + (a.about ? '<div style="margin-top:4px;white-space:pre-line">' + esc(a.about) + '</div>' : '') + (A.members()[a.sid] ? '<div class="note bad">เลขประจำตัวนี้มีในทะเบียนแล้ว</div>' : '') + '</div></div>' +
        '<div class="row" style="margin-top:8px"><button class="btn gold grow" data-act="joinOk" data-sid="' + esc(a.sid) + '">รับเข้าทะเบียน</button><button class="btn ghost grow danger" data-act="joinNo" data-sid="' + esc(a.sid) + '">ไม่รับ / ลบใบสมัคร</button></div></div>').join('') || '<div class="muted">ยังไม่มีใบสมัครใหม่</div>') + '</section>';
    return { title: 'ใบสมัครสมาชิก', body: b };
  };
  function accept(a, upd) {
    if (A.members()[a.sid]) { upd['applications/' + a.sid] = null; return false; }
    const m = { prefix: a.prefix, first: a.first, last: a.last, grade: +a.grade, room: +a.room, type: 'start', status: 'active', am: false, pm: false, createdAt: Date.now(), createdBy: A.by(), joined: 'form' };
    if (a.inst && Object.keys(a.inst).length) m.inst = a.inst;
    upd['members/' + a.sid] = m; upd['/people/' + a.sid + '/clubs/' + C.club.id] = true;
    if (!(A.D.people || {})[a.sid]) A.sharedWrites(a.sid, A.sharedOf(m), upd); else Object.assign(m, A.sharedOf(A.D.people[a.sid]));
    const p = {}; ['phone', 'parentName', 'parentPhone'].forEach(k => { if (a[k]) p[k] = a[k]; }); if (Object.keys(p).length) upd['privateInfo/' + a.sid] = p;
    upd['applications/' + a.sid] = null; return true;
  }
  Object.assign(A.ACT, {
    joinToggle: () => { if (A.teacher()) A.W(B.set('public/join', { open: !isOpen(), year: A.year(), inst: A.instList() })); },
    joinCopy: async () => { try { await navigator.clipboard.writeText(linkOf()); toast('คัดลอกลิงก์แล้ว'); } catch (e) { toast('แตะที่ช่องลิงก์ค้างไว้แล้วเลือกคัดลอก', 3500); } },
    joinShare: async () => { try { await navigator.share({ title: 'ใบสมัครสมาชิกชมรม' + M.C.club.name + '', text: 'กรอกใบสมัครสมาชิก' + M.C.club.long + '', url: linkOf() }); } catch (e) { /* ยกเลิก */ } },
    joinOk: d => { if (!canJoin()) return; const a = apps().find(x => x.sid === d.sid); if (!a) return; const upd = {}; const ok = accept(a, upd); A.W(B.update('', upd)); A.log('join.accept', a.sid, a.first + ' ' + a.last); toast(ok ? 'รับ ' + a.first + ' เข้าทะเบียนแล้ว — กำหนดรอบซ้อมได้ที่หน้าสมาชิก' : 'มีในทะเบียนอยู่แล้ว ลบใบสมัครซ้ำออก', 3500); },
    joinAll: async () => { if (!canJoin()) return; const l = apps(); if (!(await M.confirmBox('รับทั้งหมด', 'รับผู้สมัคร ' + l.length + ' คนเข้าทะเบียนเป็นสมาชิกประเภท “เริ่มต้น”', 'รับทั้งหมด'))) return; const upd = {}; let n = 0; l.forEach(a => { if (accept(a, upd)) n++; }); A.W(B.update('', upd)); A.log('join.acceptAll', '', n + ' คน'); toast('รับเข้าทะเบียน ' + n + ' คนแล้ว'); },
    joinNo: async d => { if (!canJoin()) return; if (!(await M.confirmBox('ลบใบสมัคร', 'ใบสมัครนี้จะถูกลบ นักเรียนส่งใหม่ได้', 'ลบ', true))) return; A.W(B.remove('applications/' + d.sid)); }
  });

  /* ============ หน้าสาธารณะ ?join=1 ============ */
  const prevPublic = window.APP_PUBLIC;
  window.APP_PUBLIC = async function () {
    if (new URLSearchParams(location.search).get('join') === null) return prevPublic ? prevPublic() : false;
    const root = $('#root'); B.setScope(C.club.id); document.documentElement.dataset.club = C.club.id; document.title = 'ใบสมัครสมาชิกชมรม' + C.club.name;
    const page = h => { root.innerHTML = '<div class="pub"><div class="pub-in"><div class="pub-head"><img' + (C.club.round ? ' class="round"' : '') + ' src="' + C.club.logo + '" alt="ตราชมรม' + M.C.club.name + '"><div><b>ใบสมัครสมาชิกชมรม' + M.C.club.name + '</b><span>' + esc(C.club.full) + '</span></div></div>' + h + '</div></div>'; };
    try { await B.init(); } catch (e) { page('<p>เชื่อมต่อระบบไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วเปิดลิงก์ใหม่</p>'); return true; }
    let j = null; try { j = await B.get('public/join'); } catch (e) { j = null; }
    if (!j || !j.open) { page('<div class="note warn">ขณะนี้ยังไม่เปิดรับสมัคร กรุณาติดต่อครูที่ปรึกษาชมรม</div>'); return true; }
    const inst = Array.isArray(j.inst) && j.inst.length ? j.inst : (C.club.instruments || []), F = A.fld, O = A.opt;
    page('<form class="form" id="jf"><div class="muted" style="margin-bottom:10px">ปีการศึกษา ' + esc(j.year || C.club.year) + ' · กรอกข้อมูลของตัวเองให้ครบ ยังไม่ต้องแนบรูป</div>' +
      F('เลขประจำตัวนักเรียน', '<input class="in" id="j-sid" inputmode="numeric" autocomplete="off" required>', 'ใช้ผูกกับอีเมลโรงเรียน เลขประจำตัว@' + esc(C.auth.domain)) +
      '<div class="g3">' + F('คำนำหน้า', '<select class="in" id="j-prefix">' + O(C.prefixes.map(p => [p, p])) + '</select>') + F('ชื่อ', '<input class="in" id="j-first" required>') + F('นามสกุล', '<input class="in" id="j-last" required>') + '</div>' +
      '<div class="g3">' + F('ระดับชั้น', '<select class="in" id="j-grade">' + O([1, 2, 3, 4, 5, 6].map(g => [g, 'ม.' + g])) + '</select>') + F('ห้อง', '<input class="in" id="j-room" inputmode="numeric" required>') + F('เบอร์โทรนักเรียน', '<input class="in" id="j-phone" inputmode="tel">') + '</div>' +
      (inst.length ? '<div class="fld"><span>เครื่องดนตรีที่เล่นได้ (เลือกได้หลายอย่าง ถ้ายังเล่นไม่ได้ไม่ต้องเลือก)</span><div class="checks">' + inst.map(i => '<label class="ck"><input type="checkbox" name="inst" value="' + esc(i) + '"><span>' + esc(i) + '</span></label>').join('') + '</div></div>' : '') +
      '<div class="g3">' + F('ชื่อ-สกุลผู้ปกครอง', '<input class="in" id="j-pn" required>') + F('เบอร์โทรผู้ปกครอง', '<input class="in" id="j-pp" inputmode="tel" required>') + '</div>' +
      F('ประสบการณ์ด้านดนตรี หรือสิ่งที่อยากบอกครู (ไม่บังคับ)', '<textarea class="in" id="j-about" rows="3"></textarea>') +
      '<label class="ck wide"><input type="checkbox" id="j-ok"><span>ข้าพเจ้ายินยอมให้ชมรมเก็บข้อมูลนี้เพื่อใช้ในการบริหารชมรม</span></label>' +
      '<div class="note bad" id="j-err" hidden></div><button class="btn gold block lg">ส่งใบสมัคร</button></form>');
    $('#jf').addEventListener('submit', async e => {
      e.preventDefault(); const v = id => $(id).value.trim(), err = t => { const el = $('#j-err'); el.textContent = t; el.hidden = false; el.scrollIntoView({ block: 'center' }); };
      const sid = v('#j-sid'); if (!new RegExp(C.auth.sidPattern).test(sid)) return err('เลขประจำตัวต้องเป็นตัวเลข 4–8 หลัก');
      if (!v('#j-first') || !v('#j-last')) return err('กรอกชื่อและนามสกุล'); if (!/^[0-9]{1,2}$/.test(v('#j-room'))) return err('ห้องต้องเป็นตัวเลข');
      if (v('#j-pn').length < 3 || !/^[0-9+\- ]{9,15}$/.test(v('#j-pp'))) return err('กรอกชื่อและเบอร์โทรผู้ปกครองให้ถูกต้อง'); if (!$('#j-ok').checked) return err('กรุณาติ๊กยินยอมให้เก็บข้อมูล');
      const rec = { prefix: v('#j-prefix'), first: v('#j-first'), last: v('#j-last'), grade: +v('#j-grade'), room: +v('#j-room'), parentName: v('#j-pn'), parentPhone: v('#j-pp'), at: Date.now() };
      if (v('#j-phone')) rec.phone = v('#j-phone'); if (v('#j-about')) rec.about = v('#j-about').slice(0, 1000);
      const ins = {}; $$('input[name=inst]:checked').forEach(c => ins[c.value] = true); if (Object.keys(ins).length) rec.inst = ins;
      const btn = $('#jf button.block'); btn.disabled = true; btn.textContent = 'กำลังส่ง …';
      try { await B.direct('set', 'applications/' + sid, rec);
        page('<div class="note" style="font-size:1rem"><b>ส่งใบสมัครเรียบร้อยแล้ว</b><br>' + esc(rec.prefix + rec.first + ' ' + rec.last) + ' · เลขประจำตัว ' + esc(sid) + '</div><p style="text-align:left">เมื่อครูรับเข้าทะเบียนแล้ว เข้าใช้แอปชมรมด้วยอีเมลโรงเรียน <b>' + esc(sid) + '@' + esc(C.auth.domain) + '</b></p><a class="btn block" href="' + esc(location.pathname + '?club=' + C.club.id) + '">ไปหน้าเข้าสู่ระบบ</a>'); window.scrollTo(0, 0); }
      catch (er) { btn.disabled = false; btn.textContent = 'ส่งใบสมัคร'; err('ส่งไม่สำเร็จ — เลขประจำตัวนี้อาจส่งใบสมัครไปแล้ว หรือเป็นสมาชิกอยู่แล้ว หรืออินเทอร์เน็ตขัดข้อง หากต้องการแก้ไขข้อมูลให้แจ้งครู'); }
    });
    return true;
  };
})();
