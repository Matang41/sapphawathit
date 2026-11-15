/* ============================================================
   library.js — รุ่น 3.1: คลังความรู้ (ครูอัปโหลด นักเรียนศึกษา)
   ข้อมูล: library/{id} = รายละเอียด · libfiles/{id} = เนื้อไฟล์ (base64, โหลดเมื่อเปิดดู) · config/libCats = หมวดหมู่
   ไฟล์เก็บในฐานข้อมูล จำกัด ~700 KB ต่อไฟล์ (รูปภาพถูกย่อให้อัตโนมัติ) ไฟล์ใหญ่/วิดีโอให้ใช้ “ลิงก์” (Google Drive, YouTube)
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP, C = M.C;
  const { $, esc, toast, modal } = M; const { ic, chip, fld, opt } = A;
  Object.assign(A.ICON, { lib: '<path d="M4 5h4v14H4zM10 5h4v14h-4z"/><path d="M16 6.5l3.8 1-3 11.5-3.8-1z"/>' });
  const T = () => A.teacher(), MAX = 700 * 1024, LB = { cat: '', q: '' };
  const cats = () => { const l = A.cfg().libCats; return Array.isArray(l) && l.length ? l : (C.libCats || ['อื่น ๆ']); };
  const items = () => Object.keys(A.D.library || {}).map(id => Object.assign({ id }, A.D.library[id])).filter(x => x.title).sort((a, b) => b.at - a.at);
  const allCats = () => cats().concat(items().map(x => x.cat).filter(c => c && !cats().includes(c))).filter((c, i, a) => a.indexOf(c) === i);
  const kindLabel = x => x.kind === 'song' ? 'โน้ตเพลง' : x.kind === 'chart' ? 'โน้ตเกมกลอง' : x.kind === 'link' ? 'ลิงก์' : /pdf/.test(x.mime || '') ? 'PDF' : /^image\//.test(x.mime || '') ? 'ภาพ' : /^audio\//.test(x.mime || '') ? 'เสียง' : /^video\//.test(x.mime || '') ? 'วิดีโอ' : 'ไฟล์';
  const size = n => n ? (n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB') : '';

  /* โน้ตเพลงที่บันทึกจากเกม “บันทึกโน้ตเพลงไทย” (kind: 'song') เปิดในตัวบันทึกโน้ตเพื่อเล่น/แก้/ส่งออก */
  function openSong(id, sub) {
    const x = sub ? (A.D.libsub || {})[id] : (A.D.library || {})[id]; if (!x) return;
    const me = (A.members() || {})[A.sid()] || {}, nm = A.teacher() ? 'คุณครู' : (me.first || A.myName() || '');
    const w = modal('<div class="row" style="margin-bottom:8px"><h3 class="grow" style="margin:0">' + esc(x.title) + '</h3><button class="btn ghost sm" data-close>ปิด</button></div><div class="gm-host"><iframe class="gm-f" src="games/notation.html?' + (sub ? 'sub=' : 'song=') + encodeURIComponent(id) + '&name=' + encodeURIComponent(nm) + '" title="' + esc(x.title) + '" allow="autoplay; fullscreen"></iframe></div>', { full: true, sticky: true });
    return w;
  }
  /* โน้ตเกมกลองปู่เจ่ที่มือกลองบันทึกจากคลิปวง (kind: 'chart') เปิดเป็นด่านในเกมแห่กลองปู่เจ่ */
  function openChart(id, sub) {
    const x = sub ? (A.D.libsub || {})[id] : (A.D.library || {})[id]; if (!x) return;
    return modal('<div class="row" style="margin-bottom:8px"><h3 class="grow" style="margin:0">' + esc(x.title) + '</h3><button class="btn ghost sm" data-close>ปิด</button></div><div class="gm-host"><iframe class="gm-f" src="games/pujae.html?' + (sub ? 'sub=' : 'chart=') + encodeURIComponent(id) + '" title="' + esc(x.title) + '" allow="autoplay; fullscreen"></iframe></div>', { full: true, sticky: true });
  }
  A.SUBS.push({ key: 'library', path: () => 'library' });
  /* ผลงานที่สมาชิกส่งมาให้ครูตรวจ: libsub/{id} = { kind: 'song' | 'tap' | 'chart', title, sid, by, at, … } */
  A.SUBS.push({ key: 'libsub', path: () => 'libsub' });
  const subs = () => Object.keys(A.D.libsub || {}).map(id => Object.assign({ id }, A.D.libsub[id])).filter(x => x && x.title).sort((a, b) => a.at - b.at);
  const subKind = x => x.kind === 'tap' ? 'หน้าทับ/จังหวะ' : x.kind === 'chart' ? 'โน้ตเกมกลองปู่เจ่' : 'โน้ตเพลง';
  function reviewHTML() {
    const l = subs(); if (T()) {
      if (!l.length) return '';
      return '<section class="card" style="border:2px solid var(--gold)"><div class="lb">ผลงานที่สมาชิกส่งมา รอครูตรวจ (' + l.length + ')</div>' + l.map(x =>
        '<div class="lib"><div class="row"><span class="lib-k">' + subKind(x) + '</span><div class="grow"><b>' + esc(x.title) + '</b><div class="muted">ส่งโดย ' + esc(x.by || x.sid) + ' · ' + M.thDate(x.at) + (x.target ? ' · ขอแก้เพลงเดิม' : '') + '</div>' + (x.desc ? '<div class="lib-d">' + esc(x.desc) + '</div>' : '') +
        '<div class="row wrap" style="margin-top:8px">' + (x.kind === 'song' || x.kind === 'chart' ? '<button class="btn ghost sm" data-act="subView" data-id="' + esc(x.id) + '">' + (x.kind === 'chart' ? 'ลองเล่น' : 'ดู / ฟัง') + '</button>' : '') + '<button class="btn sm" data-act="subOk" data-id="' + esc(x.id) + '">ยอมรับ</button><button class="btn ghost sm danger" data-act="subNo" data-id="' + esc(x.id) + '">ไม่รับ</button></div></div></div></div>').join('') + '</section>';
    }
    const mine = l.filter(x => x.sid === A.sid());
    return mine.length ? '<section class="card"><div class="lb">ผลงานของฉันที่รอครูตรวจ</div>' + mine.map(x => '<div class="muted">• ' + esc(x.title) + ' (' + subKind(x) + ') · ส่งเมื่อ ' + M.thDate(x.at) + '</div>').join('') + '</section>' : '';
  }
  A.TODO.push(() => T() && subs().length ? { n: subs().length, label: 'ผลงานที่สมาชิกส่งมา รอครูตรวจ', href: '#/library' } : null);
  A.NAVS.push({ id: 'library', label: 'คลังความรู้', icon: 'lib', order: 36 });

  function card(x) {
    const isNew = Date.now() - x.at < 7 * 864e5;
    return '<div class="lib"><div class="row"><span class="lib-k">' + kindLabel(x) + '</span><div class="grow"><b>' + esc(x.title) + '</b><div class="muted">' + esc([x.cat, x.kind === 'file' ? size(x.size) : '', M.thDate(x.at)].filter(Boolean).join(' · ')) + '</div></div>' + (isNew ? chip('ใหม่', 'hot') : '') + '</div>' +
      (x.desc ? '<div class="lib-d">' + esc(x.desc) + '</div>' : '') + '<div class="row wrap" style="margin-top:8px"><button class="btn sm" data-act="libOpen" data-id="' + esc(x.id) + '">เปิดดู</button>' +
      (T() ? '<button class="btn ghost sm" data-act="libEdit" data-id="' + esc(x.id) + '">แก้ไข</button><button class="btn ghost sm danger" data-act="libDel" data-id="' + esc(x.id) + '">ลบ</button>' : '') + '</div></div>';
  }
  function listHTML() {
    const q = LB.q.trim().toLowerCase(), all = items(), l = all.filter(x => (!LB.cat || x.cat === LB.cat) && (!q || (x.title + ' ' + (x.desc || '') + ' ' + (x.cat || '') + ' ' + (x.fname || '')).toLowerCase().includes(q)));
    return l.map(card).join('') || '<div class="empty">' + (all.length ? 'ไม่พบรายการตามเงื่อนไข' : 'ยังไม่มีสื่อการเรียนรู้' + (T() ? ' — กด “เพิ่มสื่อ”' : '')) + '</div>';
  }
  A.V.library = function () {
    const cs = allCats(); let b = reviewHTML();
    if (T()) b += '<div class="row wrap" style="margin-bottom:14px"><button class="btn" data-act="libNew">' + ic('plus', 18) + 'เพิ่มสื่อ / ไฟล์ความรู้</button><button class="btn ghost" data-act="libCats">จัดการหมวดหมู่</button></div>';
    b += '<div class="tabs" role="tablist"><button role="tab" aria-selected="' + !LB.cat + '" class="' + (!LB.cat ? 'on' : '') + '" data-act="libCat" data-c="">ทั้งหมด</button>' + cs.map(c => '<button role="tab" aria-selected="' + (LB.cat === c) + '" class="' + (LB.cat === c ? 'on' : '') + '" data-act="libCat" data-c="' + esc(c) + '">' + esc(c) + '</button>').join('') + '</div>' +
      '<section class="card"><input id="lq" class="in" type="search" placeholder="ค้นหาชื่อเรื่อง คำอธิบาย" value="' + esc(LB.q) + '" aria-label="ค้นหาในคลังความรู้" style="margin-bottom:10px"><div id="llist">' + listHTML() + '</div></section>';
    return { title: 'คลังความรู้', body: b };
  };
  document.addEventListener('input', e => { if (e.target.id === 'lq') { LB.q = e.target.value; const l = $('#llist'); if (l) l.innerHTML = listHTML(); } });
  A.HOME.push({ order: 36, html: () => { const l = items().slice(0, 3); return l.length ? '<section class="card"><div class="row"><div class="lb grow" style="margin:0 0 8px">คลังความรู้ล่าสุด</div><a href="#/library" class="muted">ดูทั้งหมด</a></div>' + l.map(x => '<a class="lib-r" href="#/library"><span class="lib-k">' + kindLabel(x) + '</span><span class="grow"><b>' + esc(x.title) + '</b><span class="muted">' + esc(x.cat || '') + '</span></span></a>').join('') + '</section>' : ''; } });

  const readURL = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(new Error('อ่านไฟล์ไม่ได้')); r.readAsDataURL(f); });
  const toBlob = d => { const i = d.indexOf(','), mime = (d.slice(5, i).split(';')[0]) || 'application/octet-stream', bin = atob(d.slice(i + 1)), u = new Uint8Array(bin.length); for (let k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k); return new Blob([u], { type: mime }); };

  function form(id) {
    const x = id ? A.D.library[id] : { kind: 'file' };
    const w = modal('<h3>' + (id ? 'แก้ไขรายการ' : 'เพิ่มสื่อ / ไฟล์ความรู้') + '</h3><form class="form">' + fld('ชื่อเรื่อง', '<input class="in" id="l-t" value="' + esc(x.title || '') + '" required>') +
      fld('หมวดหมู่', '<select class="in" id="l-c">' + opt(allCats().map(c => [c, c]), x.cat || cats()[0]) + '</select>') + fld('คำอธิบายสั้น ๆ', '<textarea class="in" id="l-d" rows="2">' + esc(x.desc || '') + '</textarea>') +
      (id ? (x.kind === 'link' ? fld('ลิงก์', '<input class="in" id="l-u" value="' + esc(x.url || '') + '">') : '<div class="muted">ไฟล์: ' + esc(x.fname || '') + ' (ถ้าต้องเปลี่ยนไฟล์ ให้ลบแล้วเพิ่มใหม่)</div>')
        : '<div class="fld"><span>ประเภท</span><div class="checks"><label class="ck"><input type="radio" name="lt" value="file" checked><span>อัปโหลดไฟล์</span></label><label class="ck"><input type="radio" name="lt" value="link"><span>ลิงก์ภายนอก</span></label></div></div>' +
          '<div id="l-fw">' + fld('เลือกไฟล์', '<input class="in" type="file" id="l-f" accept="image/*,application/pdf,audio/*,video/*,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt">', 'ไฟล์ละไม่เกิน ~700 KB (รูปภาพย่อให้อัตโนมัติ) ไฟล์ใหญ่หรือวิดีโอให้เก็บที่ Google Drive / YouTube แล้วใช้ “ลิงก์ภายนอก”') + '</div>' +
          '<div id="l-uw" hidden>' + fld('ลิงก์ (ขึ้นต้นด้วย https://)', '<input class="in" id="l-u" inputmode="url">') + '</div>') +
      '<div class="note bad" id="l-err" hidden></div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn grow">บันทึก</button></div></form>', { sticky: true, wide: true });
    w.addEventListener('change', e => { if (e.target.name === 'lt') { $('#l-fw', w).hidden = e.target.value !== 'file'; $('#l-uw', w).hidden = e.target.value !== 'link'; } });
    $('form', w).addEventListener('submit', async e => {
      e.preventDefault(); const v = k => { const el = $(k, w); return el ? el.value.trim() : ''; }, err = t => { const el = $('#l-err', w); el.textContent = t; el.hidden = false; }, btn = $('button.grow:not(.ghost)', w);
      if (!v('#l-t')) return err('กรอกชื่อเรื่อง');
      const base = { title: v('#l-t'), cat: v('#l-c'), desc: v('#l-d') || null };
      if (id) { if (x.kind === 'link') { if (!/^https?:\/\//i.test(v('#l-u'))) return err('ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://'); base.url = v('#l-u'); } A.W(B.update('library/' + id, base)); w.remove(); return toast('บันทึกแล้ว'); }
      const kind = $('input[name=lt]:checked', w).value, nid = B.uid();
      if (kind === 'link') { if (!/^https?:\/\//i.test(v('#l-u'))) return err('ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://'); A.W(B.set('library/' + nid, Object.assign(base, { kind: 'link', url: v('#l-u'), at: Date.now(), by: A.myName() }))); A.log('library.add', '', base.title); w.remove(); return toast('เพิ่มแล้ว'); }
      const f = $('#l-f', w).files[0]; if (!f) return err('เลือกไฟล์ก่อน'); if (A.STATUS.online === false) return err('ต้องออนไลน์จึงจะอัปโหลดไฟล์ได้');
      btn.disabled = true; btn.textContent = 'กำลังอัปโหลด …';
      try {
        let data; if (/^image\//.test(f.type)) data = await M.fileToImage(f, 1600, 0.8); else { if (f.size > MAX) throw new Error('ไฟล์ใหญ่เกิน 700 KB — ใช้ลิงก์ภายนอกแทน'); data = await readURL(f); }
        if (data.length > 990000) throw new Error('ไฟล์ใหญ่เกินไป — ใช้ลิงก์ภายนอกแทน');
        await B.direct('set', 'libfiles/' + nid, data);
        A.W(B.set('library/' + nid, Object.assign(base, { kind: 'file', fname: f.name, mime: data.slice(5, data.indexOf(';')), size: Math.round(data.length * 3 / 4), at: Date.now(), by: A.myName() })));
        A.log('library.add', '', base.title); w.remove(); toast('อัปโหลดแล้ว');
      } catch (er) { btn.disabled = false; btn.textContent = 'บันทึก'; err('อัปโหลดไม่สำเร็จ: ' + (er.message || A.errTH(er))); }
    });
  }

  Object.assign(A.ACT, {
    libCat: d => { LB.cat = d.c || ''; A.rerender(); },
    libNew: () => { if (T()) form(null); }, libEdit: d => { if (!T()) return; const x = (A.D.library || {})[d.id]; if (x && x.kind === 'song') return openSong(d.id); if (x && x.kind === 'chart') return openChart(d.id); form(d.id); },
    libDel: async d => { if (!T()) return; const x = A.D.library[d.id]; if (!x || !(await M.confirmBox('ลบรายการ', esc(x.title) + ' จะหายไปจากคลังความรู้', 'ลบ', true))) return; A.W(B.update('', { ['library/' + d.id]: null, ['libfiles/' + d.id]: null })); A.log('library.del', '', x.title); },
    libCats: () => {
      if (!T()) return; const w = modal('<h3>หมวดหมู่คลังความรู้</h3><form class="form"><div class="muted" style="margin-bottom:8px">หนึ่งหมวดต่อหนึ่งบรรทัด</div><textarea class="in" id="lc" rows="8" aria-label="หมวดหมู่">' + esc(cats().join('\n')) + '</textarea><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn grow">บันทึก</button></div></form>', { center: true, sticky: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const l = Array.from(new Set($('#lc', w).value.split(/\r?\n/).map(s => s.trim()).filter(Boolean))); if (!l.length) return toast('ต้องมีอย่างน้อยหนึ่งหมวด'); A.W(B.set('config/libCats', l)); w.remove(); toast('บันทึกหมวดหมู่แล้ว'); });
    },
    subView: d => { if (!T()) return; const x = (A.D.libsub || {})[d.id]; if (x && x.kind === 'chart') openChart(d.id, true); else openSong(d.id, true); },
    subOk: async d => {
      if (!T()) return; const x = (A.D.libsub || {})[d.id]; if (!x) return;
      if (!(await M.confirmBox('ยอมรับผลงาน', 'เผยแพร่ “' + esc(x.title) + '” ของ ' + esc(x.by || '') + ' เป็นสื่อของชมรม', 'ยอมรับ'))) return;
      if (x.kind === 'tap') {
        const p = x.preset || {}; const rec = { name: x.title, bpm: p.bpm || 120, rate: p.rate || 2, mix: p.mix || {}, by: x.by || '', bySid: x.sid || '', approvedBy: A.myName(), at: Date.now() };
        if (p.pid) rec.pid = p.pid; else rec.str = p.str || '';
        try { await B.direct('set', '/tapPresets/' + d.id, rec); } catch (e) { return toast('บันทึกไม่สำเร็จ: ' + A.errTH(e)); }
        A.W(B.remove('libsub/' + d.id));
      } else if (x.kind === 'chart') {
        const cs = cats(), cat = cs.includes('โน้ตและเพลง') ? 'โน้ตและเพลง' : (cs[0] || 'อื่น ๆ');
        A.W(B.update('', { ['library/chart_' + d.id.replace(/^sub_/, '')]: { title: x.title, cat, desc: x.desc || '', kind: 'chart', chart: x.chart || {}, at: Date.now(), by: x.by || '', bySid: x.sid || '', approvedBy: A.myName() }, ['libsub/' + d.id]: null }));
      } else {
        const lid = x.target && (A.D.library || {})[x.target] ? x.target : 'song_' + d.id.replace(/^sub_/, ''); const old = (A.D.library || {})[lid];
        const song = Object.assign({}, x.song, { libId: lid }); const cs = cats(), cat = cs.includes('โน้ตและเพลง') ? 'โน้ตและเพลง' : (cs[0] || 'อื่น ๆ');
        const au = (x.song && x.song.author) || { name: x.by, sid: x.sid };
        A.W(B.update('', { ['library/' + lid]: { title: x.title, cat, desc: x.desc || '', kind: 'song', song, at: old && old.at || Date.now(), edited: Date.now(), by: au.name || x.by || '', bySid: au.sid || x.sid || '', approvedBy: A.myName() }, ['libsub/' + d.id]: null }));
      }
      A.log('library.approve', x.sid || '', x.title); toast('ยอมรับแล้ว ขึ้นเป็นสื่อของชมรม พร้อมเครดิต ' + (x.by || ''));
    },
    subNo: async d => {
      if (!T()) return; const x = (A.D.libsub || {})[d.id]; if (!x) return;
      if (!(await M.confirmBox('ไม่รับผลงาน', '“' + esc(x.title) + '” ของ ' + esc(x.by || '') + ' จะถูกนำออก ไม่เผยแพร่', 'ไม่รับ', true))) return;
      A.W(B.remove('libsub/' + d.id)); A.log('library.reject', x.sid || '', x.title); toast('นำออกแล้ว');
    },
    libOpen: async d => {
      const x = (A.D.library || {})[d.id]; if (!x) return; if (x.kind === 'song') return openSong(d.id); if (x.kind === 'chart') return openChart(d.id); if (x.kind === 'link') { window.open(x.url, '_blank', 'noopener'); return; }
      let url = ''; const w = modal('<h3>' + esc(x.title) + '</h3><div id="lv" class="muted">กำลังโหลดไฟล์ …</div><button class="btn ghost block" data-close style="margin-top:12px">ปิด</button>', { center: true, wide: true, onClose: () => { if (url) URL.revokeObjectURL(url); } });
      try {
        const data = await B.get('libfiles/' + d.id); if (!data) throw new Error('ไม่พบไฟล์'); const blob = toBlob(data); url = URL.createObjectURL(blob); const mime = blob.type;
        const pv = /^image\//.test(mime) ? '<img src="' + url + '" alt="' + esc(x.title) + '" style="max-width:100%;border-radius:10px">' : /^audio\//.test(mime) ? '<audio controls src="' + url + '" style="width:100%"></audio>' : /^video\//.test(mime) ? '<video controls src="' + url + '" style="width:100%;border-radius:10px"></video>' : /pdf/.test(mime) ? '<iframe src="' + url + '" title="' + esc(x.title) + '" style="width:100%;height:55vh;border:1px solid var(--line);border-radius:10px"></iframe>' : '';
        $('#lv', w).innerHTML = (x.desc ? '<div style="margin-bottom:10px;white-space:pre-line">' + esc(x.desc) + '</div>' : '') + pv + '<div class="row wrap" style="margin-top:10px"><a class="btn sm" href="' + url + '" target="_blank" rel="noopener">เปิดในแท็บใหม่</a><button class="btn ghost sm" id="lv-save">บันทึกไฟล์ลงเครื่อง</button></div>';
        $('#lv-save', w).addEventListener('click', () => M.saveBlob(blob, x.fname || x.title));
      } catch (er) { $('#lv', w).textContent = 'เปิดไฟล์ไม่ได้: ' + (er.message || A.errTH(er)); }
    }
  });
})();

/* ============================================================
   คลังหน้าทับของชมรม (รุ่น 3.39)
   ข้อมูล: natab/{id} = { n ชื่อ, kit เครื่อง, r อัตรา 1–3, s โน้ต, tip, src, base, by, at }
     s = ห้องคั่นด้วยเว้นวรรค · ช่องคั่นด้วย , · ค่า = ลำดับเสียงของเครื่อง (แบบเดียวกับแถวเครื่องจังหวะในบันทึกโน้ต) · - = เว้น · a+b = สองเสียงในช่องเดียว
     base = รหัสหน้าทับตั้งต้นของระบบ (games/natab.js) ที่ครูแก้ทับ — เกมกลองแขกและเครื่องกำกับจังหวะจะใช้ฉบับที่ครูแก้
   ครูแก้ได้คนเดียว (กฎฐานข้อมูล) สมาชิกอ่านได้ · เกมอ่านผ่าน APP.D.natab ตอนเปิดเกม
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP;
  const { $, esc, toast, modal } = M; const { chip, fld, opt, ic } = A;
  const T = () => A.teacher();
  const KIT = { khaek: ['กลองแขก', ['ติง', 'โจ๊ะ', 'ทั่ม', 'จ๊ะ']], taphon: ['ตะโพน', ['ตุ๊บ', 'ติง', 'ตืด', 'เท่ง', 'เทิด', 'ถะ', 'ป๊ะ', 'พรึง', 'เพริ่ง', 'เพริด', 'พรืด']], that: ['กลองทัด', ['ตูม', 'ต้อม']], thon: ['โทน–รำมะนา', ['ติง', 'โจ๊ง', 'ทั่ม', 'จ๊ะ']],
    ching: ['ฉิ่ง', ['ฉิ่ง', 'ฉับ']], luang: ['วงกลองหลวง', ['ตึ้ง', 'ตึง', 'ตุ๊บ', 'โหม่ง', 'ฉ่า', 'แฉ่']], pujae: ['วงกลองปู่เจ่', ['ตึ่ง', 'ตุ๊บ', 'แต๊ก', 'ฉ่า', 'แฉ่', 'โหม่ง']] };
  const RATE = { 1: 'ชั้นเดียว', 2: 'สองชั้น', 3: 'สามชั้น' }, CH = { 'ต': 0, 'โ': 1, 'ท': 2, 'จ': 3 };
  const UI = { kit: 'khaek' };
  A.SUBS.push({ key: 'natab', path: () => 'natab' });
  const D = () => A.D.natab || {};
  let asked = false;
  function builtin() { if (!window.NATAB) { if (!asked) { asked = true; const s = document.createElement('script'); s.src = 'games/natab.js'; s.onload = () => A.rerender(); document.head.appendChild(s); } return {}; } return window.NATAB.ORIG || {}; }
  function toIdx(str) { const L = String(str).split('/').map(x => x.trim().split(/\s+/).filter(Boolean)); return (L[0] || []).map((b, bi) => Array.from(b).map((c, ci) => { const v = []; L.forEach(l => { const ch = Array.from(l[bi] || '')[ci]; if (ch in CH && !v.includes(CH[ch])) v.push(CH[ch]); }); return v.length ? v.slice(0, 2).join('+') : '-'; }).join(',')).join(' '); }
  function toText(kit, s) { const N = (KIT[kit] || ['', []])[1]; return String(s || '').split(' ').filter(Boolean).map(b => b.split(',').map(e => e === '-' || !e ? '-' : e.split('+').map(i => N[+i] || '?').join('+')).join(' ')).join(' / '); }
  function fromText(kit, txt) { const N = KIT[kit][1], bars = String(txt || '').split(/[\/|\n]+/).map(x => x.trim()).filter(Boolean), out = [];
    if (!bars.length) return { err: 'ยังไม่ได้ใส่โน้ตหน้าทับ' }; if (bars.length > 64) return { err: 'ยาวเกิน 64 ห้อง' };
    for (let i = 0; i < bars.length; i++) { const c = bars[i].split(/\s+/); if (c.length !== 4) return { err: 'ห้องที่ ' + (i + 1) + ' มี ' + c.length + ' ช่อง (ต้องมี 4 ช่อง ช่องว่างใส่ -)' };
      const o = []; for (const e of c) { if (/^[-–—]$/.test(e)) { o.push('-'); continue; } const p = e.split('+'); if (p.length > 2) return { err: 'ห้องที่ ' + (i + 1) + ': ช่องหนึ่งซ้อนได้ไม่เกิน 2 เสียง' };
        const ix = p.map(x => N.indexOf(x)); if (ix.some(n => n < 0)) return { err: 'ห้องที่ ' + (i + 1) + ': ไม่รู้จักคำ “' + p[ix.findIndex(n => n < 0)] + '” (ใช้ได้: ' + N.join(' ') + ')' }; o.push(ix.join('+')); }
      out.push(o.join(',')); }
    return { s: out.join(' ') }; }
  function list(kit) { const d = D(), o = [], ov = {};
    Object.keys(d).forEach(id => { const x = d[id]; if (!x || x.kit !== kit || !x.s) return; if (x.base) ov[x.base] = Object.assign({ id }, x); else o.push(Object.assign({ id }, x)); });
    o.sort((a, b) => String(a.n).localeCompare(String(b.n), 'th'));
    if (kit !== 'khaek') return o; const bi = builtin();
    return Object.keys(bi).map(id => ov[id] ? Object.assign({ fixed: true }, ov[id]) : { base: id, n: bi[id].name, kit: 'khaek', r: bi[id].r, s: toIdx(bi[id].s), tip: bi[id].tip, src: bi[id].src }).concat(o); }
  const row = x => '<section class="card"><div class="row" style="gap:6px;flex-wrap:wrap"><b class="grow">' + esc(x.n) + '</b>' + chip(RATE[x.r] || '', 'plum') + chip(x.s.split(' ').length + ' ห้อง', 'line') + (x.fixed ? chip('ครูแก้ไขแล้ว', 'gold') : '') + '</div>' +
    '<div style="margin:8px 0;line-height:1.9;font-size:.95rem">' + x.s.split(' ').map(bar => '<span style="display:inline-block;border:1px solid rgba(128,128,128,.35);border-radius:6px;padding:0 7px;margin:2px 3px 2px 0;white-space:nowrap">' + esc(toText(x.kit, bar)) + '</span>').join('') + '</div>' +
    (x.tip ? '<div class="muted" style="font-size:.85rem">' + esc(x.tip) + '</div>' : '') + (x.src || x.by ? '<div class="muted" style="font-size:.78rem">' + esc(x.src ? 'ที่มา: ' + x.src : 'บันทึกโดย ' + x.by) + '</div>' : '') +
    (T() ? '<div class="row" style="gap:6px;margin-top:8px"><button class="btn sm ghost" data-act="ntEdit" data-id="' + esc(x.id || '') + '" data-base="' + esc(x.base || '') + '">แก้ไข</button>' + (x.id ? '<button class="btn sm ghost" data-act="ntDel" data-id="' + esc(x.id) + '">' + (x.base ? 'คืนค่าเดิม' : 'ลบ') + '</button>' : '') + '</div>' : '') + '</section>';
  A.NAVS.push({ id: 'nt', label: 'คลังหน้าทับ', icon: 'lib', order: 35, show: () => true });
  A.V.nt = function () {
    const L = list(UI.kit);
    const b = '<div class="row" style="gap:6px;margin-bottom:10px;flex-wrap:wrap">' + Object.keys(KIT).map(k => '<button class="btn sm ' + (UI.kit === k ? 'gold' : 'ghost') + '" data-act="ntKit" data-k="' + k + '">' + esc(KIT[k][0]) + '</button>').join('') + '</div>' +
      (T() ? '<div class="row" style="margin-bottom:10px"><button class="btn gold" data-act="ntEdit" data-id="" data-base="">' + ic('plus', 18) + 'เพิ่มหน้าทับ</button></div><div class="note" style="margin-bottom:10px">ครูแก้หน้าทับได้คนเดียว · เมื่อบันทึก ทุกคนในชมรมจะได้ฉบับที่แก้แล้วในบันทึกโน้ต เครื่องกำกับจังหวะ และเกมกลองแขก เมื่อเปิดครั้งถัดไป · โน้ตเพลงที่เติมหน้าทับไปก่อนหน้านี้ไม่เปลี่ยนตาม ให้กดเติมซ้ำในเพลงนั้น</div>'
        : '<div class="muted" style="margin-bottom:10px">หน้าทับกลางของชมรม ใช้ร่วมกันในบันทึกโน้ต เครื่องกำกับจังหวะ และเกม · พบจุดผิดแจ้งครูได้เลย</div>') +
      (L.length ? L.map(row).join('') : '<div class="empty">ยังไม่มีหน้าทับของ' + esc(KIT[UI.kit][0]) + 'ในคลัง' + (T() ? ' — กด “เพิ่มหน้าทับ” หรือเก็บจากบรรทัดในบันทึกโน้ต (🥁 เครื่องจังหวะ › เก็บบรรทัดนี้เข้าคลัง)' : '') + '</div>');
    return { title: 'คลังหน้าทับ', body: b };
  };
  function form(id, base) { if (!T()) return; const d = D(), bi = builtin();
    const e = id ? d[id] : base && bi[base] ? { n: bi[base].name, kit: 'khaek', r: bi[base].r, s: toIdx(bi[base].s), tip: bi[base].tip, src: bi[base].src, base } : { kit: UI.kit, r: 2 };
    if (!e) return; const fixKit = !!(id || base);
    const w = modal('<h3>' + (fixKit ? 'แก้ไขหน้าทับ' : 'เพิ่มหน้าทับ') + '</h3><form class="form">' +
      fld('ชื่อหน้าทับ', '<input class="in" id="nf-n" maxlength="60" required value="' + esc(e.n || '') + '">') +
      '<div class="row" style="gap:8px">' + fld('เครื่อง', '<select class="in" id="nf-k"' + (fixKit ? ' disabled' : '') + '>' + opt(Object.keys(KIT).map(k => [k, KIT[k][0]]), e.kit) + '</select>') + fld('อัตราจังหวะ', '<select class="in" id="nf-r">' + opt([['3', 'สามชั้น'], ['2', 'สองชั้น'], ['1', 'ชั้นเดียว']], String(e.r || 2)) + '</select>') + '</div>' +
      fld('โน้ตหน้าทับ', '<textarea class="in" id="nf-s" rows="6" style="font-size:1rem">' + esc(toText(e.kit, e.s || '').replace(/ \/ /g, ' /\n')) + '</textarea>', 'ห้องละ 4 ช่อง คั่นช่องด้วยเว้นวรรค · คั่นห้องด้วย / หรือขึ้นบรรทัดใหม่ · ช่องว่างใส่ - · สองเสียงในช่องเดียวใช้ + เช่น ติง+ทั่ม') +
      '<div class="muted" id="nf-w" style="font-size:.85rem;margin:-4px 0 8px"></div>' +
      fld('คำแนะนำ (ไม่บังคับ)', '<input class="in" id="nf-t" maxlength="140" value="' + esc(e.tip || '') + '">') + fld('ที่มา / เครดิต (ไม่บังคับ)', '<input class="in" id="nf-c" maxlength="100" value="' + esc(e.src || '') + '">') +
      '<div class="note warn" id="nf-err" hidden></div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">บันทึก</button></div></form>');
    const words = () => { $('#nf-w', w).textContent = 'คำที่ใช้ได้: ' + KIT[$('#nf-k', w).value][1].join(' · '); }; words(); $('#nf-k', w).addEventListener('change', words);
    $('form', w).addEventListener('submit', ev => { ev.preventDefault(); const err = $('#nf-err', w), kit = $('#nf-k', w).value, n = $('#nf-n', w).value.trim(), r = fromText(kit, $('#nf-s', w).value);
      if (!n) { err.textContent = 'ใส่ชื่อหน้าทับ'; err.hidden = false; return; } if (r.err) { err.textContent = r.err; err.hidden = false; return; }
      const nid = id || B.uid(); A.W(B.set('natab/' + nid, { n, kit, r: +$('#nf-r', w).value || 2, s: r.s, tip: $('#nf-t', w).value.trim() || null, src: $('#nf-c', w).value.trim() || null, base: e.base || null, by: A.myName(), at: Date.now() }));
      A.log(id ? 'natab.edit' : base ? 'natab.fix' : 'natab.new', '', n); UI.kit = kit; w.remove(); toast('บันทึกแล้ว — ทั้งชมรมจะใช้ฉบับนี้เมื่อเปิดเกมหรือบันทึกโน้ตครั้งถัดไป'); A.rerender(); }); }
  Object.assign(A.ACT, {
    ntKit: d => { UI.kit = d.k; A.rerender(); },
    ntEdit: d => form(d.id || '', d.base || ''),
    ntDel: async d => { if (!T()) return; const x = D()[d.id]; if (!x) return;
      if (!(await M.confirmBox(x.base ? 'คืนค่าเดิม' : 'ลบหน้าทับ', esc(x.n) + (x.base ? ' — กลับไปใช้ฉบับตั้งต้นของระบบ' : ' — ลบออกจากคลังของชมรม (โน้ตเพลงที่เติมไปแล้วไม่เปลี่ยน)'), x.base ? 'คืนค่าเดิม' : 'ลบ', !x.base))) return;
      A.W(B.remove('natab/' + d.id)); A.log('natab.del', '', x.n); toast('เรียบร้อย'); }
  });
})();
