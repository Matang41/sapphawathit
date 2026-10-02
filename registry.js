/* ============================================================
   registry.js — ทะเบียนนักเรียนกลาง (เฉพาะครู): รายชื่อชุดเดียวใช้ร่วมทุกชมรม ครูติ๊กว่าใครอยู่ชมรมไหน
   ข้อมูล: people/{sid} = { prefix, first, last, grade, room, photo, clubs: { spw: true, kt: true } }
   สำเนาชื่อ/ชั้น/รูปของแต่ละคนอยู่ใน c/{ชมรม}/members/{sid} ด้วย เพื่อให้สมาชิกชมรมหนึ่งมองไม่เห็นรายชื่อของอีกชมรม
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP, C = M.C;
  const { $, esc, toast, modal } = M; const { ic, fld, opt, avatar } = A;
  const R = { q: '', club: '' };
  const people = () => A.D.people || {};
  const myClubs = () => C.clubs.filter(c => A.myClubs().includes(c.id));
  const name = p => (p.prefix || '') + (p.first || '') + ' ' + (p.last || '');
  const byClass = (a, b) => (people()[a].grade || 9) - (people()[b].grade || 9) || (people()[a].room || 0) - (people()[b].room || 0) || a.localeCompare(b);

  A.NAVS.push({ id: 'people', label: 'ทะเบียนกลาง', icon: 'grid', order: 41, show: () => A.teacher() });
  function listHTML() {
    const q = R.q.trim().toLowerCase(), P = people();
    const l = Object.keys(P).filter(s => P[s] && P[s].first).filter(s => (!q || (name(P[s]) + ' ' + s + ' ม.' + P[s].grade + '/' + P[s].room).toLowerCase().includes(q)) && (!R.club || (R.club === '-' ? !Object.keys(P[s].clubs || {}).length : (P[s].clubs || {})[R.club]))).sort(byClass);
    return (l.map(s => { const p = P[s];
      return '<div class="mrow"><span class="mrow-main">' + avatar(p) + '<span class="grow"><b>' + esc(name(p)) + '</b><span class="muted">' + esc('เลขประจำตัว ' + s + ' · ม.' + (p.grade || '-') + '/' + (p.room || '-')) + '</span></span></span>' +
        '<span class="mrow-ses">' + myClubs().map(c => '<label class="ck tick"><input type="checkbox" data-tick="' + esc(s) + '" data-club="' + c.id + '"' + ((p.clubs || {})[c.id] ? ' checked' : '') + '><span>' + esc(c.name) + '</span></label>').join('') + '</span>' +
        '<span class="mrow-act"><button class="icb" data-act="regEdit" data-sid="' + esc(s) + '" aria-label="แก้ไขข้อมูล ' + esc(p.first) + '">' + ic('edit', 20) + '</button></span></div>'; }).join('') || '<div class="empty">ไม่พบนักเรียนตามเงื่อนไข</div>') + '<div class="muted" style="padding:10px 0 2px">แสดง ' + l.length + ' จาก ' + Object.keys(P).length + ' คน</div>';
  }
  A.V.people = function () {
    if (!A.teacher()) { location.hash = '#/home'; return null; }
    const b = '<section class="card"><div class="lb">ทะเบียนนักเรียนกลาง</div><div class="muted">รายชื่อชุดเดียวใช้ร่วมทุกชมรม ติ๊กชื่อชมรมเพื่อให้นักเรียนเป็นสมาชิก (ติ๊กได้มากกว่าหนึ่งชมรม) นักเรียนเห็นเฉพาะข้อมูลของชมรมที่ตัวเองเป็นสมาชิก<br>ชื่อ ชั้น ห้อง และรูป แก้ที่นี่หรือที่หน้าสมาชิกของชมรมใดก็ได้ ระบบปรับให้ตรงกันทุกชมรม</div>' +
      '<div class="row wrap" style="margin-top:12px"><button class="btn" data-act="regNew">' + ic('plus', 18) + 'เพิ่มนักเรียนในทะเบียน</button><a class="btn ghost" href="#/members">ไปหน้าสมาชิกของ' + esc(C.club.name) + ' (นำเข้ารายชื่อ / ใบสมัคร)</a></div></section>' +
      '<section class="card"><div class="filters"><input id="rq" class="in" type="search" placeholder="ค้นหาชื่อ เลขประจำตัว ชั้น" value="' + esc(R.q) + '" aria-label="ค้นหานักเรียน"><select class="in sm" data-reg="club" aria-label="กรองตามชมรม">' + opt([['', 'ทุกคน']].concat(myClubs().map(c => [c.id, 'อยู่' + c.name])).concat([['-', 'ยังไม่อยู่ชมรมใด']]), R.club) + '</select></div><div id="rlist">' + listHTML() + '</div></section>';
    return { title: 'ทะเบียนกลาง', body: b };
  };
  const relist = () => { const l = $('#rlist'); if (l) l.innerHTML = listHTML(); };
  document.addEventListener('input', e => { if (e.target.id === 'rq') { R.q = e.target.value; relist(); } });
  document.addEventListener('change', async e => {
    const t = e.target; if (t.dataset && t.dataset.reg) { R[t.dataset.reg] = t.value; return relist(); }
    const sid = t.dataset && t.dataset.tick; if (!sid || !A.teacher()) return;
    const cid = t.dataset.club, club = C.clubs.find(c => c.id === cid), p = people()[sid], on = t.checked, now = Date.now(), base = '/c/' + cid + '/', upd = {};
    t.disabled = true;
    try {
      if (on) {
        const ex = await B.get(base + 'members/' + sid).catch(() => null), sh = A.sharedOf(p);
        if (ex) { Object.keys(sh).forEach(f => { upd[base + 'members/' + sid + '/' + f] = sh[f]; }); ['removedReason', 'removedAt', 'removedBy', 'gradYear'].forEach(f => { upd[base + 'members/' + sid + '/' + f] = null; }); upd[base + 'members/' + sid + '/status'] = 'active'; }
        else upd[base + 'members/' + sid] = Object.assign({ type: 'start', status: 'active', am: false, pm: false, createdAt: now, createdBy: A.by() }, sh);
        upd['/people/' + sid + '/clubs/' + cid] = true;
      } else {
        if (!(await M.confirmBox('นำออกจากชมรม' + club.name, esc(name(p)) + ' จะเข้าแอปของชมรม' + esc(club.name) + 'ไม่ได้ ประวัติยังอยู่ครบและติ๊กกลับได้', 'นำออก', true))) { t.checked = true; t.disabled = false; return; }
        upd[base + 'members/' + sid + '/status'] = 'removed'; upd[base + 'members/' + sid + '/removedReason'] = 'resign'; upd[base + 'members/' + sid + '/removedAt'] = now; upd[base + 'roles/' + sid] = null; upd['/people/' + sid + '/clubs/' + cid] = null;
      }
      await B.update('', upd); toast((on ? 'เพิ่ม ' : 'นำ ') + p.first + (on ? ' เข้าชมรม' : ' ออกจากชมรม') + club.name + 'แล้ว');
    } catch (er) { t.checked = !on; toast('บันทึกไม่สำเร็จ: ' + A.errTH(er), 5000); }
    t.disabled = false;
  });
  function form(sid) {
    const p = sid ? people()[sid] : { prefix: C.prefixes[0], grade: 1 };
    const w = modal('<h3>' + (sid ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนในทะเบียน') + '</h3><form class="form">' + (sid ? '<div class="kv"><span>เลขประจำตัว</span><b>' + esc(sid) + '</b></div>' : fld('เลขประจำตัวนักเรียน', '<input class="in" id="g-sid" inputmode="numeric" autocomplete="off" required>', 'ใช้ผูกกับอีเมล เลขประจำตัว@' + esc(C.auth.domain))) +
      '<div class="g3">' + fld('คำนำหน้า', '<select class="in" id="g-prefix">' + opt(C.prefixes.map(x => [x, x]), p.prefix) + '</select>') + fld('ชื่อ', '<input class="in" id="g-first" value="' + esc(p.first || '') + '" required>') + fld('นามสกุล', '<input class="in" id="g-last" value="' + esc(p.last || '') + '" required>') + '</div>' +
      '<div class="g3">' + fld('ระดับชั้น', '<select class="in" id="g-grade">' + opt([1, 2, 3, 4, 5, 6].map(g => [g, 'ม.' + g]), p.grade || 1) + '</select>') + fld('ห้อง', '<input class="in" id="g-room" inputmode="numeric" value="' + esc(p.room || '') + '" required>') + '</div>' +
      (sid ? '' : '<div class="fld"><span>เพิ่มเข้าชมรม</span><div class="checks">' + myClubs().map(c => '<label class="ck"><input type="checkbox" name="gc" value="' + c.id + '"' + (c.id === C.club.id ? ' checked' : '') + '><span>' + esc(c.name) + '</span></label>').join('') + '</div></div>') +
      '<div class="note bad" id="g-err" hidden></div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn grow">บันทึก</button></div></form>', { center: true, sticky: true });
    $('form', w).addEventListener('submit', e => {
      e.preventDefault(); const v = k => $(k, w).value.trim(), err = t => { const el = $('#g-err', w); el.textContent = t; el.hidden = false; }, id = sid || v('#g-sid'), now = Date.now();
      if (!sid) { if (!new RegExp(C.auth.sidPattern).test(id)) return err('เลขประจำตัวต้องเป็นตัวเลข 4–8 หลัก'); if (people()[id]) return err('เลขประจำตัวนี้มีในทะเบียนแล้ว'); }
      if (!v('#g-first') || !v('#g-last')) return err('กรอกชื่อและนามสกุล'); if (!/^[0-9]{1,2}$/.test(v('#g-room'))) return err('ห้องต้องเป็นตัวเลข');
      const sh = { prefix: v('#g-prefix'), first: v('#g-first'), last: v('#g-last'), grade: +v('#g-grade'), room: +v('#g-room') }, upd = {};
      Object.keys(sh).forEach(f => { upd['/people/' + id + '/' + f] = sh[f]; });
      const clubs = sid ? Object.keys(p.clubs || {}).filter(c => A.myClubs().includes(c)) : Array.from(w.querySelectorAll('input[name=gc]:checked')).map(c => c.value);
      clubs.forEach(c => { if (sid) Object.keys(sh).forEach(f => { upd['/c/' + c + '/members/' + id + '/' + f] = sh[f]; }); else { upd['/c/' + c + '/members/' + id] = Object.assign({ type: 'start', status: 'active', am: false, pm: false, createdAt: now, createdBy: A.by() }, sh); upd['/people/' + id + '/clubs/' + c] = true; } });
      A.W(B.update('', upd)); w.remove(); toast('บันทึกแล้ว');
    });
  }
  Object.assign(A.ACT, { regNew: () => { if (A.teacher()) form(null); }, regEdit: d => { if (A.teacher()) form(d.sid); } });
})();
