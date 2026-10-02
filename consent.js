/* ============================================================
   consent.js — ขั้นที่ 4: ใบขออนุญาตผู้ปกครอง (ลิงก์ใช้ครั้งเดียว เซ็นบนเครื่องผู้ปกครอง ไม่ต้องล็อกอิน)
   ข้อมูล: ctoken/{token} = รายละเอียด + sign (เขียนได้ครั้งเดียว) + verified · y/{ปี}/consents/{sid}/{eid} = token
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP, C = M.C;
  const { $, esc, toast, modal } = M;
  const CT = {};   /* token → ข้อมูล (โหลดเมื่อเปิดหน้ากิจกรรม) */
  const canForm = () => A.teacher() || A.is('secretary');
  const Y = () => 'y/' + A.year();
  const newToken = () => { const a = new Uint8Array(18); crypto.getRandomValues(a); return Array.from(a).map(x => 'abcdefghijkmnpqrstuvwxyz23456789'[x % 32]).join(''); };
  const linkOf = t => location.origin + location.pathname + '?c=' + t + (B.mode === 'demo' ? '&demo=1' : '');
  const tokenOf = (sid, eid) => ((A.D.consents || {})[sid] || {})[eid] || '';
  const stOf = ct => !ct ? ['ยังไม่สร้างลิงก์', 'line'] : !ct.sign ? ['รอผู้ปกครอง', 'gold'] : ct.sign.allow ? (ct.verified ? ['อนุญาต · ครูยืนยันแล้ว', 'ok'] : ['อนุญาต · รอครูยืนยัน', 'ok']) : ['ไม่อนุญาต', 'bad'];

  if (A) A.SUBS.push({ key: 'consents', path: y => canForm() ? 'y/' + y + '/consents' : 'y/' + y + '/consents/' + A.sid(), norm: v => canForm() ? v : { [A.sid()]: v } });

  async function load(tokens) {
    const need = tokens.filter(t => t && CT[t] === undefined); if (!need.length) return;
    need.forEach(t => { CT[t] = null; });
    await Promise.all(need.map(async t => { try { CT[t] = (await B.get('ctoken/' + t)) || false; } catch (e) { CT[t] = false; } }));
    A.rerender();
  }

  /* ---------- ตัวหนังสือ (ใช้ทั้งหน้าผู้ปกครอง ตัวอย่าง และ PDF) ---------- */
  function letterHTML(ct) {
    const s = ct.sign;
    return '<div class="lt-logo"><img src="icons/school-logo.png" alt="ตราโรงเรียนสรรพวิทยาคม"></div><div class="lt-title">หนังสือขออนุญาตผู้ปกครอง</div><div class="lt-sub">ชมรมสรรพวาทิต (ชมรมดนตรีไทย) โรงเรียนสรรพวิทยาคม</div>' +
      '<div class="lt-r">วันที่ ' + esc(ct.issued) + '</div><div><b>เรื่อง</b> ขออนุญาตให้นักเรียนเข้าร่วมกิจกรรม</div><div><b>เรียน</b> ผู้ปกครองของ ' + esc(ct.student) + ' ชั้น ' + esc(ct.cls) + '</div>' +
      '<p class="lt-p">ด้วยชมรมสรรพวาทิต โรงเรียนสรรพวิทยาคม จะนำนักเรียนในความปกครองของท่านเข้าร่วม <b>' + esc(ct.title) + '</b> ' + esc(ct.when) + (ct.time ? ' เวลา ' + esc(ct.time) : '') + (ct.place ? ' ณ ' + esc(ct.place) : '') + (ct.purpose ? ' เพื่อ' + esc(ct.purpose) : '') +
      ' โดยมีครูที่ปรึกษาชมรมเป็นผู้ควบคุมดูแล จึงเรียนมาเพื่อขออนุญาต</p>' + (ct.note ? '<p class="lt-p" style="text-indent:0"><b>หมายเหตุ:</b> ' + esc(ct.note) + '</p>' : '') +
      '<div class="lt-sign">ขอแสดงความนับถือ<br><br>( ' + esc(ct.teacher || '.............................................') + ' )<br>ครูที่ปรึกษาชมรม</div>' +
      '<div class="lt-cut">ส่วนตอบรับของผู้ปกครอง</div>' +
      (s ? '<p class="lt-p" style="text-indent:0">ข้าพเจ้า <b>' + esc(s.name) + '</b> เกี่ยวข้องเป็น <b>' + esc(s.relation) + '</b> ของ ' + esc(ct.student) + ' โทรศัพท์ ' + esc(s.phone || '-') + '</p><div class="lt-ans ' + (s.allow ? 'yes' : 'no') + '">' + (s.allow ? 'อนุญาต' : 'ไม่อนุญาต') + 'ให้เข้าร่วมกิจกรรม</div>' +
        '<div class="lt-sign">' + (s.sig ? '<img src="' + s.sig + '" alt="ลายมือชื่อผู้ปกครอง">' : s.paper ? '<i>(รับเป็นเอกสารกระดาษ)</i><br>' : '') + '<br>( ' + esc(s.name) + ' )<br>ผู้ปกครอง</div>' +
        '<div class="lt-meta">' + (s.paper ? 'บันทึกโดยครูจากเอกสารกระดาษเมื่อ ' : 'ลงนามทางอิเล็กทรอนิกส์เมื่อ ') + esc(M.thDate(s.at)) + ' ' + esc(new Date(s.at).toTimeString().slice(0, 5)) + ' น.' + (ct.verified ? ' · ครูตรวจสอบและยืนยันแล้วโดย ' + esc(ct.verified.by) + ' เมื่อ ' + esc(M.thDate(ct.verified.at)) : ' · รอครูตรวจสอบ') + '</div>'
        : '<p class="lt-p" style="text-indent:0;color:#6B5A64">(ยังไม่ได้ตอบรับ)</p>');
  }
  function letterPage(ct) { const root = document.createElement('div'), pg = document.createElement('div'); pg.className = 'rp-page lt'; pg.innerHTML = letterHTML(ct); root.appendChild(pg); return root; }

  /* ============ การ์ดในหน้ากิจกรรม ============ */
  if (A) A.EVHOOKS.push(function (e, ps) {
    if (!ps.length && canForm()) return '<section class="card" id="consent"><div class="lb">ใบขออนุญาตผู้ปกครอง</div><div class="muted">เลือกผู้เข้าร่วมกิจกรรมก่อน (กด “แก้ไข”) แล้วจึงสร้างลิงก์ขออนุญาตได้</div></section>';
    if (canForm()) {
      const toks = ps.map(s => tokenOf(s, e.id)); load(toks);
      const cnt = { yes: 0, no: 0, wait: 0, none: 0 }; ps.forEach(s => { const t = tokenOf(s, e.id), ct = t ? CT[t] : null; if (!t) cnt.none++; else if (!ct || !ct.sign) cnt.wait++; else if (ct.sign.allow) cnt.yes++; else cnt.no++; });
      return '<section class="card" id="consent"><div class="lb">ใบขออนุญาตผู้ปกครอง</div><div class="stat4"><div><b class="ok">' + cnt.yes + '</b><span>อนุญาต</span></div><div><b class="bad">' + cnt.no + '</b><span>ไม่อนุญาต</span></div><div><b>' + cnt.wait + '</b><span>รอตอบ</span></div><div><b>' + cnt.none + '</b><span>ยังไม่มีลิงก์</span></div></div>' +
        '<div class="row wrap" style="margin:12px 0 4px">' + (cnt.none ? '<button class="btn" data-act="ctMake" data-id="' + esc(e.id) + '">สร้างลิงก์ให้ ' + cnt.none + ' คนที่ยังไม่มี</button>' : '') + (ps.length - cnt.none ? '<button class="btn ghost" data-act="ctRefresh" data-id="' + esc(e.id) + '">ตรวจคำตอบล่าสุด</button>' : '') + '</div>' +
        '<div class="muted" style="margin-bottom:6px">ส่งลิงก์ของแต่ละคนให้ผู้ปกครองเปิดเซ็นบนเครื่องของผู้ปกครองเอง ลิงก์หนึ่งเซ็นได้ครั้งเดียว</div>' +
        ps.map(s => { const m = A.members()[s], t = tokenOf(s, e.id), ct = t ? CT[t] : null, st = t && ct === null ? ['กำลังโหลด…', 'line'] : stOf(t ? ct : null);
          return '<div class="mrow"><span class="mrow-main"><span class="grow"><b>' + esc(A.fullName(m)) + '</b><span class="muted">' + esc(A.cls(m)) + '</span></span></span><span class="mrow-tags">' + A.chip(st[0], st[1]) + '</span><span class="mrow-act">' +
            (t ? '<button class="btn ghost sm" data-act="ctCopy" data-t="' + esc(t) + '">คัดลอกลิงก์</button>' : '') + (ct && ct.sign ? '<button class="btn ghost sm" data-act="ctView" data-t="' + esc(t) + '">ดูใบ</button>' : '') +
            (A.teacher() && ct && ct.sign && ct.sign.allow && !ct.verified ? '<button class="btn gold sm" data-act="ctVerify" data-t="' + esc(t) + '">ยืนยัน</button>' : '') +
            (A.teacher() && t && ct && !ct.sign ? '<button class="btn ghost sm" data-act="ctPaper" data-t="' + esc(t) + '">รับใบกระดาษ</button>' : '') + '</span></div>'; }).join('') + '</section>';
    }
    const sid = A.sid(); if (!sid || !(e.people || {})[sid]) return '';
    const t = tokenOf(sid, e.id); if (t) load([t]); const ct = t ? CT[t] : null, st = t && ct === null ? ['กำลังโหลด…', 'line'] : stOf(t ? ct : null);
    return '<section class="card"><div class="row"><div class="lb grow" style="margin:0">ใบขออนุญาตผู้ปกครองของฉัน</div>' + A.chip(st[0], st[1]) + '</div>' +
      (t ? '<div class="muted" style="margin:8px 0">ส่งลิงก์นี้ให้ผู้ปกครองเปิดบนโทรศัพท์ของผู้ปกครอง แล้วกรอกชื่อและเซ็นอนุญาต</div><div class="row wrap"><button class="btn" data-act="ctShare" data-t="' + esc(t) + '">ส่งลิงก์ให้ผู้ปกครอง</button>' + (ct && ct.sign ? '<button class="btn ghost" data-act="ctView" data-t="' + esc(t) + '">ดูใบขออนุญาต</button>' : '') + '</div>' : '<div class="muted" style="margin-top:8px">ครูหรือเลขานุการยังไม่ได้สร้างลิงก์ขออนุญาตสำหรับกิจกรรมนี้</div>') + '</section>';
  });

  /* ---------- หน้ารวม “ใบขออนุญาต” (เข้าจากเมนู) ---------- */
  const myTokens = () => { const o = (A.D.consents || {})[A.sid()] || {}; return Object.keys(o).filter(e => (A.D.events || {})[e]).map(e => ({ eid: e, t: o[e], ev: A.D.events[e] })).sort((a, b) => b.ev.date.localeCompare(a.ev.date)); };
  const myWaiting = () => myTokens().filter(x => x.ev.status !== 'cancelled' && (x.ev.dateEnd || x.ev.date) >= A.todayISO() && CT[x.t] !== undefined && CT[x.t] && !CT[x.t].sign);
  A.NAVS.push({ id: 'consent', label: 'ใบขออนุญาต', icon: 'doc', order: 33 });
  A.V.consent = function () {
    let b = '';
    if (canForm()) {
      const evs = A.evList().filter(e => e.status !== 'cancelled'), up = evs.filter(e => (e.dateEnd || e.date) >= A.todayISO()), past = evs.filter(e => (e.dateEnd || e.date) < A.todayISO()).reverse();
      b += '<section class="card"><div class="lb">วิธีขออนุญาตผู้ปกครอง</div><ol class="steps"><li>สร้างกิจกรรมและเลือกผู้เข้าร่วม (เมนูกิจกรรม)</li><li>กด “จัดการใบขออนุญาต” ของกิจกรรมนั้น แล้วกด “สร้างลิงก์”</li><li>นักเรียนเปิดแอป กด “ส่งลิงก์ให้ผู้ปกครอง” หรือครูคัดลอกลิงก์ส่งเอง</li><li>ผู้ปกครองเปิดลิงก์ กรอกชื่อ เซ็น แล้วส่ง ครูกด “ยืนยัน”</li></ol></section>';
      const row = e => { const ps = A.evPeople(e), toks = ps.map(s => tokenOf(s, e.id)), has = toks.filter(Boolean); if ((e.dateEnd || e.date) >= A.todayISO()) load(has);
        const yes = has.filter(t => CT[t] && CT[t].sign && CT[t].sign.allow).length, no = has.filter(t => CT[t] && CT[t].sign && !CT[t].sign.allow).length;
        return '<div class="li"><div class="row"><div class="grow"><b>' + esc(e.title) + '</b><div class="muted">' + esc(A.evDate(e) + ' · ผู้เข้าร่วม ' + ps.length + ' คน') + '</div></div><a class="btn sm" href="#/ev/' + esc(e.id) + '">จัดการใบขออนุญาต</a></div>' +
          '<div class="row wrap" style="gap:6px;margin-top:6px">' + (!ps.length ? A.chip('ยังไม่ได้เลือกผู้เข้าร่วม', 'line') : !has.length ? A.chip('ยังไม่ได้สร้างลิงก์', 'gold') : A.chip('อนุญาต ' + yes + '/' + ps.length, 'ok') + (no ? A.chip('ไม่อนุญาต ' + no, 'bad') : '') + (ps.length - has.length ? A.chip('ยังไม่มีลิงก์ ' + (ps.length - has.length), 'gold') : '')) + '</div></div>'; };
      b += '<section class="card"><div class="lb">กิจกรรมที่กำลังจะมาถึง</div>' + (up.map(row).join('') || '<div class="muted">ยังไม่มีกิจกรรม — สร้างที่เมนูกิจกรรมก่อน</div>') + '</section>';
      if (past.length) b += '<section class="card"><div class="lb">กิจกรรมที่ผ่านมา</div>' + past.slice(0, 15).map(e => '<a class="evc" href="#/ev/' + esc(e.id) + '"><span class="grow"><b>' + esc(e.title) + '</b><span class="muted">' + esc(A.evDate(e)) + '</span></span></a>').join('') + '</section>';
    }
    if (A.sid()) { const l = myTokens(); load(l.map(x => x.t));
      b += '<section class="card"><div class="lb">ใบขออนุญาตของฉัน</div>' + (l.map(x => { const ct = CT[x.t], st = ct === null || ct === undefined ? ['กำลังโหลด…', 'line'] : stOf(ct);
        return '<div class="li"><div class="row"><div class="grow"><b>' + esc(x.ev.title) + '</b><div class="muted">' + esc(A.evDate(Object.assign({}, x.ev))) + '</div></div>' + A.chip(st[0], st[1]) + '</div><div class="row wrap" style="margin-top:8px">' + (ct && !ct.sign ? '<button class="btn sm" data-act="ctShare" data-t="' + esc(x.t) + '">ส่งลิงก์ให้ผู้ปกครอง</button>' : '') + (ct && ct.sign ? '<button class="btn ghost sm" data-act="ctView" data-t="' + esc(x.t) + '">ดูใบขออนุญาต</button>' : '') + '<a class="btn ghost sm" href="#/ev/' + esc(x.eid) + '">ดูกิจกรรม</a></div></div>'; }).join('') || '<div class="muted">ยังไม่มีใบขออนุญาต — เมื่อครูสร้างลิงก์สำหรับกิจกรรมที่คุณเข้าร่วม จะแสดงที่นี่</div>') + '</section>'; }
    return { title: 'ใบขออนุญาตผู้ปกครอง', body: b };
  };
  A.HOME.push({ order: 32, html: () => { if (!A.sid()) return ''; load(myTokens().map(x => x.t)); const w = myWaiting(); return w.length ? '<section class="card"><div class="lb">รอผู้ปกครองเซ็นอนุญาต (' + w.length + ')</div>' + w.map(x => '<div class="li"><div class="row"><b class="grow">' + esc(x.ev.title) + '</b><button class="btn sm" data-act="ctShare" data-t="' + esc(x.t) + '">ส่งลิงก์ให้ผู้ปกครอง</button></div></div>').join('') + '</section>' : ''; } });

  if (A) Object.assign(A.ACT, {
    ctMake: d => {
      if (!canForm()) return; const e = A.D.events[d.id]; const upd = {}; let n = 0;
      A.evPeople(e).forEach(s => { if (tokenOf(s, d.id)) return; const m = A.members()[s], t = newToken(); n++;
        const ct = { y: A.year(), eid: d.id, sid: s, student: A.fullName(m), cls: A.cls(m), title: e.title, when: A.evDate(e, 'dow'), time: A.evTime(e) || null, place: e.place || null, purpose: e.purpose || null, note: e.note || null, teacher: A.school().teacher || null, issued: A.dTH(A.todayISO(), 'full'), createdAt: Date.now() };
        upd['ctoken/' + t] = JSON.parse(JSON.stringify(ct)); upd[Y() + '/consents/' + s + '/' + d.id] = t; CT[t] = ct; });
      if (n) { A.W(B.update('', upd)); A.log('consent.make', '', e.title + ' ' + n + ' คน'); toast('สร้างลิงก์แล้ว ' + n + ' คน'); }
    },
    ctRefresh: d => { A.evPeople(A.D.events[d.id]).forEach(s => { const t = tokenOf(s, d.id); if (t) delete CT[t]; }); A.rerender(); toast('กำลังตรวจคำตอบล่าสุด'); },
    ctCopy: async d => { const l = linkOf(d.t); try { await navigator.clipboard.writeText(l); toast('คัดลอกลิงก์แล้ว'); } catch (e) { modal('<h3>ลิงก์สำหรับผู้ปกครอง</h3><textarea class="in" rows="3" readonly>' + esc(l) + '</textarea><button class="btn ghost block" data-close style="margin-top:12px">ปิด</button>', { center: true }); } },
    ctShare: async d => { const l = linkOf(d.t), ct = CT[d.t] || {}; if (navigator.share) { try { await navigator.share({ title: 'ใบขออนุญาตผู้ปกครอง ชมรมสรรพวาทิต', text: 'ขออนุญาตให้ ' + (ct.student || 'นักเรียน') + ' เข้าร่วม ' + (ct.title || 'กิจกรรม'), url: l }); return; } catch (e) { if (e && e.name === 'AbortError') return; } } A.ACT.ctCopy(d); },
    ctView: d => {
      const ct = CT[d.t]; if (!ct) return;
      const w = M.previewPages(letterPage(ct), 'ใบขออนุญาตผู้ปกครอง', '<div class="row wrap" style="margin-bottom:10px"><button class="btn sm" id="lt-pdf">บันทึกเป็น PDF</button><span class="muted" id="lt-msg"></span></div>');
      $('#lt-pdf', w).addEventListener('click', async () => { const msg = $('#lt-msg', w); msg.textContent = 'กำลังสร้าง …'; try { await M.exportPDF(letterPage(ct), 'ใบขออนุญาต-' + M.safeName(ct.student) + '-' + M.safeName(ct.title) + '.pdf'); msg.textContent = 'เสร็จแล้ว'; } catch (er) { msg.textContent = 'สร้างไม่สำเร็จ: ' + (er.message || er); } });
    },
    ctVerify: d => { if (!A.teacher()) return; const v = { by: A.myName(), at: Date.now() }; A.W(B.set('ctoken/' + d.t + '/verified', v)); if (CT[d.t]) CT[d.t].verified = v; A.rerender(); toast('ยืนยันแล้ว'); },
    ctPaper: async d => {
      if (!A.teacher()) return; const ct = CT[d.t]; if (!ct) return;
      const w = modal('<h3>บันทึกใบอนุญาตแบบกระดาษ</h3><div class="muted" style="margin-bottom:10px">' + esc(ct.student) + '</div><form class="form">' + A.fld('ชื่อผู้ปกครอง', '<input class="in" id="p-n" required>') + A.fld('เกี่ยวข้องเป็น', '<input class="in" id="p-r" value="ผู้ปกครอง">') +
        '<div class="fld"><span>คำตอบ</span><div class="checks"><label class="ck"><input type="radio" name="al" value="1" checked><span>อนุญาต</span></label><label class="ck"><input type="radio" name="al" value="0"><span>ไม่อนุญาต</span></label></div></div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn grow">บันทึก</button></div></form>', { center: true, sticky: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const name = $('#p-n', w).value.trim(); if (!name) return; const s = { name, relation: $('#p-r', w).value.trim() || 'ผู้ปกครอง', allow: $('input[name=al]:checked', w).value === '1', paper: true, at: Date.now() }, v = { by: A.myName(), at: Date.now() };
        A.W(B.update('ctoken/' + d.t, { sign: s, verified: v })); ct.sign = s; ct.verified = v; w.remove(); A.rerender(); });
    }
  });

  /* ============ หน้าสาธารณะสำหรับผู้ปกครอง (?c=token) ============ */
  window.APP_PUBLIC = async function () {
    const t = new URLSearchParams(location.search).get('c'); if (!t) return false;
    const root = $('#root'); const page = h => { root.innerHTML = '<div class="pub"><div class="pub-in">' + h + '</div></div>'; };
    if (!/^[a-z0-9]{12,40}$/.test(t)) { page('<h1>ลิงก์ไม่ถูกต้อง</h1>'); return true; }
    try { await B.init(); } catch (e) { page('<h1>เชื่อมต่อระบบไม่สำเร็จ</h1><p>ตรวจอินเทอร์เน็ตแล้วเปิดลิงก์ใหม่</p>'); return true; }
    let ct = null; try { ct = await B.get('ctoken/' + t); } catch (e) { ct = null; }
    if (!ct) { page('<h1>ไม่พบใบขออนุญาตนี้</h1><p>ลิงก์อาจไม่ถูกต้องหรือถูกยกเลิกแล้ว กรุณาติดต่อครูที่ปรึกษาชมรม</p>'); return true; }
    const done = () => page('<div class="lt scr">' + letterHTML(ct) + '</div><div class="note" style="margin-top:16px">บันทึกคำตอบเรียบร้อยแล้ว ขอบคุณครับ/ค่ะ ปิดหน้านี้ได้เลย หากต้องการแก้ไขคำตอบ กรุณาติดต่อครูที่ปรึกษาชมรม</div>');
    if (ct.sign) { done(); return true; }
    page('<div class="lt scr">' + letterHTML(ct) + '</div><form class="form" id="pf" style="margin-top:8px">' +
      A.fld('ชื่อ-สกุลผู้ปกครอง', '<input class="in" id="p-n" autocomplete="name" required>') + '<div class="g3">' + A.fld('เกี่ยวข้องเป็น', '<select class="in" id="p-r">' + A.opt(['บิดา', 'มารดา', 'ผู้ปกครอง', 'ปู่ / ย่า / ตา / ยาย', 'ญาติ'].map(x => [x, x])) + '</select>') + A.fld('เบอร์โทรที่ติดต่อได้', '<input class="in" id="p-p" inputmode="tel" autocomplete="tel" required>') + '</div>' +
      '<div class="fld"><span>คำตอบ</span><div class="checks"><label class="ck"><input type="radio" name="al" value="1" checked><span>อนุญาต</span></label><label class="ck"><input type="radio" name="al" value="0"><span>ไม่อนุญาต</span></label></div></div>' +
      '<div class="fld"><span>ลายมือชื่อผู้ปกครอง (ใช้นิ้วเซ็นในกรอบ)</span><canvas id="sig" class="sig" width="640" height="240" aria-label="ช่องลงลายมือชื่อ"></canvas><button type="button" class="btn ghost sm" id="sig-clr" style="margin-top:6px">ล้างลายเซ็น</button></div>' +
      '<div class="note bad" id="p-err" hidden></div><button class="btn gold block lg">ส่งคำตอบ</button><div class="muted" style="margin-top:10px">ข้อมูลนี้ใช้เป็นหลักฐานการขออนุญาตของชมรมเท่านั้น ส่งแล้วแก้ไขไม่ได้</div></form>');
    const cv = $('#sig'), g = cv.getContext('2d'); let drawn = 0, down = false; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#1c1c3a';
    const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
    cv.addEventListener('pointerdown', e => { e.preventDefault(); down = true; cv.setPointerCapture(e.pointerId); const p = pos(e); g.beginPath(); g.moveTo(p[0], p[1]); });
    cv.addEventListener('pointermove', e => { if (!down) return; e.preventDefault(); const p = pos(e); g.lineTo(p[0], p[1]); g.stroke(); drawn++; });
    ['pointerup', 'pointercancel'].forEach(k => cv.addEventListener(k, () => { down = false; }));
    $('#sig-clr').addEventListener('click', () => { g.clearRect(0, 0, cv.width, cv.height); drawn = 0; });
    $('#pf').addEventListener('submit', async e => {
      e.preventDefault(); const err = x => { const el = $('#p-err'); el.textContent = x; el.hidden = false; };
      const name = $('#p-n').value.trim(), phone = $('#p-p').value.trim(); if (name.length < 4) return err('กรอกชื่อ-สกุลผู้ปกครอง'); if (!/^[0-9+\- ]{9,15}$/.test(phone)) return err('กรอกเบอร์โทรให้ถูกต้อง'); if (drawn < 8) return err('กรุณาเซ็นชื่อในกรอบ');
      const sign = { name, relation: $('#p-r').value, phone, allow: $('input[name=al]:checked').value === '1', sig: cv.toDataURL('image/png'), at: Date.now() };
      const btn = $('#pf button.block'); btn.disabled = true; btn.textContent = 'กำลังส่ง …';
      try { await B.direct('set', 'ctoken/' + t + '/sign', sign); ct.sign = sign; done(); window.scrollTo(0, 0); }
      catch (er) { btn.disabled = false; btn.textContent = 'ส่งคำตอบ'; err('ส่งไม่สำเร็จ — ลิงก์นี้อาจถูกใช้ตอบไปแล้ว หรืออินเทอร์เน็ตขัดข้อง'); }
    });
    return true;
  };
})();
