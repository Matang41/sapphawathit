/* ============================================================
   court.js — รุ่น 3.41: ศาลชมรม (คดีเปิด)
   ข้อมูล: c/{ชมรม}/court/{id} = คดี · c/{ชมรม}/courtv/{id}/{sid} = บัตรลูกขุน (ลับ เจ้าตัว+ครูเห็น) · courtx/{sid}/{ชมรม}~{id} = หมายศาลข้ามชมรม
   ขั้น: def แก้ต่าง → vote ลูกขุนลงมติ → sent ผู้พิพากษากำหนดโทษ → done อ่านคำพิพากษา (อุทธรณ์ต่อครูได้ 1 ครั้ง) → closed
   องค์คณะ: ครู (ประธานองค์คณะ มีสิทธิ์ยับยั้ง) + ประธาน + รองประธานชมรม (ครูแต่งตั้งแทนได้ ข้ามชมรมได้)
   ผู้ต้องหาเป็นสมาชิกอีกชมรมได้ โทษไปลงในชมรมของผู้ต้องหา (ครูกด “ลงโทษตามคำพิพากษา” ในชมรมนั้น)
   ภาพห้องพิจารณาใช้ตัวละครพิกเซล (pixel.js) · เสียง: ฉิ่ง ฉับ โหม่ง ค้อน และทำนองพื้นหลังเบา ๆ ปิดได้
   พัฒนาโดย นายนนทพัทธ์ วงค์มูล 2026
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP;
  const { $, esc, toast, modal } = M; const { chip, fld, opt } = A;
  Object.assign(A.ICON, { court: '<path d="M12 3v17M5 7h14M5 7l-3 6h6zM19 7l-3 6h6zM8 20h8"/>' });
  const T = () => A.teacher(), me = () => A.sid(), cid = () => M.C.club.id, CP = c => '/c/' + (c || cid()) + '/';
  const STEP = ['ฟ้อง', 'แก้ต่าง', 'ลูกขุน', 'กำหนดโทษ', 'พิพากษา', 'อุทธรณ์'], SI = { def: 1, vote: 2, sent: 3, done: 4, closed: 5 };
  const PEN = ['prob', 'down', 'strip', 'jail', 'out'], PN = { prob: '⚠️ ทัณฑ์บน', down: '▼ ลดยศ', strip: '✕ ถอดยศ', jail: '⛓️ จำตรุ', out: '🚫 ขับออก' };
  const TA = () => (window.MIS && window.MIS.TAINT) || {}, tagTxt = t => (t || []).map(k => TA()[k] || k).join(' · ');
  const clubName = c => ((M.C.clubs.find(x => x.id === c) || {}).name || c), others = () => M.C.clubs.map(c => c.id).filter(c => c !== cid());
  const thNo = n => String(n).replace(/[0-9]/g, d => '๐๑๒๓๔๕๖๗๘๙'[d]);
  const caseNo = x => 'คดีที่ ' + thNo(x.no || 1) + '/' + thNo(x.y || '');
  const dt = ms => ms ? new Date(ms).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
  const nOf = (x, s) => s === 'T' ? 'ครูที่ปรึกษาชมรม' : ((x.ppl || {})[s] || {}).n || (A.members()[s] ? A.fullName(A.members()[s]) : s);
  const links = s => String(s || '').split(/\s+/).filter(u => /^https?:\/\/\S+$/i.test(u)).map(u => '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u.length > 48 ? u.slice(0, 46) + '…' : u) + '</a>').join('<br>');

  const st = document.createElement('style');
  st.textContent = '.ct-steps{display:flex;gap:3px;margin:0 0 8px}.ct-steps span{flex:1;text-align:center;font-size:.68rem;padding:5px 1px;border-radius:6px;background:#2f1a2b;color:#bba;white-space:nowrap;overflow:hidden}.ct-steps span.on{background:#F3C95B;color:#3b2205;font-weight:700}.ct-steps span.ok{background:#3f6a46;color:#e6ffe9}' +
    '.ct-room{max-width:640px;margin:0 auto;position:relative;border:3px solid #000;border-radius:8px;overflow:hidden;background:#140a12}.ct-room img{display:block;width:100%;image-rendering:pixelated}.ct-lab{position:absolute;transform:translate(-50%,0);font-size:.66rem;background:#000b;color:#fff;padding:0 5px;border-radius:4px;white-space:nowrap;pointer-events:none}.ct-lab.g{color:#F3C95B}' +
    '.ct-dlg{margin:14px 0 10px;border:3px solid #fff6e0;outline:3px solid #000;background:#120a18;color:#fff6e0;border-radius:6px;padding:12px;position:relative}.ct-dlg .who{position:absolute;top:-13px;left:10px;background:#F3C95B;color:#3b2205;font-weight:700;font-size:.78rem;padding:1px 8px;border:2px solid #000}.ct-dlg p{margin:6px 0 10px;line-height:1.6}' +
    '.ct-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ct-acts button{font:inherit;font-size:.86rem;padding:10px 6px;border:2px solid #000;border-radius:6px;background:#3a2240;color:#fff;box-shadow:0 3px 0 #000;cursor:pointer}.ct-acts button.p{background:#F3C95B;color:#3b2205;font-weight:700}.ct-acts button.r{background:#8c1d2b}.ct-acts button.g{background:#1f5a2c}.ct-acts button:disabled{opacity:.45}' +
    '.ct-note{font-size:.74rem;opacity:.75;margin-top:8px}.ct-ver{text-align:center;padding:14px;border:3px solid #F3C95B;background:#1d0f1a;color:#fff6e0;border-radius:8px;margin:10px 0}.ct-ver .big{font-size:1.25rem;font-weight:800;margin:6px 0}.ct-shake{animation:ctk .45s ease 2}@keyframes ctk{0%,100%{transform:none}30%{transform:translateY(3px) rotate(-1deg)}60%{transform:translateY(-2px) rotate(1deg)}}' +
    '.ct-rec .q{white-space:pre-wrap;margin:4px 0 8px}.ct-sec{font-weight:700;margin-top:10px}';
  document.head.appendChild(st);

  /* ---------- ข้อมูล ---------- */
  A.SUBS.push({ key: 'court', path: () => CP() + 'court' });
  let XK = '', XOFF = null, XIDX = {}; const XC = {}, TX = {}, MYV = {};
  function xidx() { if (T() || !me()) return {}; if (me() !== XK) { if (XOFF) XOFF(); XK = me(); XIDX = {}; XOFF = B.on('/courtx/' + XK, v => { XIDX = v || {}; A.rerender(); }, () => { }); } return XIDX; }
  function txClub(c) { if (!TX[c]) { TX[c] = { v: {} }; B.on(CP(c) + 'court', v => { TX[c].v = v || {}; A.rerender(); }, () => { }); } return TX[c].v; }
  function getCase(key) {
    const p = String(key || '').split('~'), c = p.length > 1 ? p[0] : cid(), id = p.length > 1 ? p[1] : p[0];
    if (c === cid()) return { c, id, key: id, x: (A.D.court || {})[id] };
    if (T()) return { c, id, key: c + '~' + id, x: txClub(c)[id] };
    const k = c + '~' + id; if (!XC[k]) { XC[k] = {}; B.on(CP(c) + 'court/' + id, v => { XC[k].x = v; A.rerender(); }, () => { XC[k].err = 1; A.rerender(); }); }
    return { c, id, key: k, x: XC[k].x, err: XC[k].err };
  }
  function myVote(o) { const k = o.c + '~' + o.id + '~' + me(); if (MYV[k] === undefined && me()) { MYV[k] = null; B.get(CP(o.c) + 'courtv/' + o.id + '/' + me()).then(v => { MYV[k] = v || ''; A.rerender(); }).catch(() => { MYV[k] = ''; }); } return MYV[k]; }
  function allCases() {
    const o = Object.keys(A.D.court || {}).map(id => getCase(id)).filter(q => q.x && q.x.d);
    if (T()) others().forEach(c => { const v = txClub(c); Object.keys(v).forEach(id => { const x = v[id]; if (x && x.dc === cid()) o.push({ c, id, key: c + '~' + id, x }); }); });
    else Object.keys(xidx()).forEach(k => { const q = getCase(k); if (q.x && q.x.d) o.push(q); });
    return o.sort((a, b) => (b.x.at || 0) - (a.x.at || 0));
  }
  const cnt = o => Object.keys(o || {}).length;
  function myTurn(x) { const s = me(); if (!x || !s || T()) return '';
    if (x.st === 'def' && x.d === s && !x.def) return 'เขียนคำแก้ต่าง';
    if (x.st === 'def' && (x.wit || {})[s] && !(x.wit[s] || {}).t) return 'ให้การในฐานะพยาน';
    if (x.st === 'vote' && (x.jury || {})[s] && !(x.jn || {})[s]) return 'ลงมติในฐานะลูกขุน';
    if (x.st === 'sent' && (x.judges || {})[s] && !(x.jd || {})[s]) return 'กำหนดโทษในฐานะผู้พิพากษา';
    if (x.st === 'done' && x.d === s && x.verdict && x.verdict.g && !x.apl && !x.acc && Date.now() < (x.aplUntil || 0)) return 'รับฟังคำพิพากษา / อุทธรณ์';
    return ''; }
  function tNeed(q) { const x = q.x; if (!x) return '';
    if (q.c !== cid()) return x.verdict && x.verdict.g && !x.applied ? 'ลงโทษตามคำพิพากษาในชมรมนี้' : '';
    if (x.st === 'def' && Date.now() > (x.due || 0)) return 'ครบเวลาแก้ต่าง — เริ่มให้ลูกขุนลงมติ';
    if (x.st === 'vote' && cnt(x.jn) >= cnt(x.jury)) return 'ลูกขุนลงมติครบ — นับคะแนน';
    if (x.st === 'sent' && !(x.jd || {}).T) return 'ครูยังไม่ได้เลือกโทษในฐานะผู้พิพากษา';
    if (x.st === 'sent' && cnt(x.jd) >= cnt(x.judges)) return 'องค์คณะเลือกโทษครบ — อ่านคำพิพากษา';
    if (x.st === 'done' && x.apl && !x.apr) return 'มีคำอุทธรณ์รอพิจารณา';
    if (x.st === 'done' && x.verdict && x.verdict.g && !x.applied && x.dc === cid()) return 'ลงโทษตามคำพิพากษา';
    return ''; }
  A.NAVS.push({ id: 'court', label: 'ศาลชมรม', icon: 'court', order: 72, match: [], show: () => T() || allCases().length > 0, badge: () => T() ? allCases().filter(tNeed).length : allCases().filter(q => myTurn(q.x)).length });
  A.TODO.push(() => { if (!T()) return null; const n = allCases().filter(tNeed).length; return n ? [{ n, label: 'คดีในศาลชมรมรอครูดำเนินการ', href: '#/court' }] : null; });
  A.HOME.push({ order: 12, html: () => { if (T() || !me()) return ''; const L = allCases().filter(q => myTurn(q.x)); if (!L.length) return '';
    return '<section class="card" style="border-left:4px solid #F3C95B"><div class="lb">⚖️ หมายศาลชมรม</div>' + L.map(q => '<a class="rowcard" href="#/court/' + esc(q.key) + '" style="display:block;padding:8px 0;border-top:1px dashed var(--line)"><b>' + esc(caseNo(q.x)) + '</b> <span class="muted">' + esc(clubName(q.c)) + '</span><div style="font-size:.85rem">ถึงตาคุณ: ' + esc(myTurn(q.x)) + '</div></a>').join('') + '</section>'; } });

  /* ---------- เสียง: ฉิ่ง ฉับ โหม่ง ค้อน · ทำนองพื้นหลังแบบระนาดเบา ๆ (บันไดเสียงไทย 7 เสียงเท่า) ---------- */
  const SND = { on: true, un: false }; try { SND.on = localStorage.getItem('spw_court_snd') !== '0'; } catch (e) { /* ignore */ }
  let AC = null, OUT = null, bgT = null, bgNext = 0, bgI = 0;
  function ac() { if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); OUT = AC.createGain(); OUT.gain.value = .8; OUT.connect(AC.destination); } if (AC.state === 'suspended') AC.resume(); return AC; }
  function tone(f, t, d, v, type) { const a = ac(); if (!a) return; const o = a.createOscillator(), g = a.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(OUT); o.start(t); o.stop(t + d + .05); }
  const FX = {
    ching: t => { tone(2793, t, 1.3, .05); tone(4186, t, .9, .025); tone(5920, t, .5, .012); },
    chap: t => { tone(2793, t, .09, .05); tone(4186, t, .07, .03); },
    mong: t => { tone(147, t, 2.6, .22); tone(296, t, 1.4, .07); tone(441, t, .8, .03); },
    gavel: t => { tone(1100, t, .05, .22, 'square'); tone(180, t, .18, .3, 'triangle'); }
  };
  function sfx(n, k, gap) { if (!SND.on || !SND.un) return; const a = ac(); if (!a) return; const t0 = a.currentTime + .05; for (let i = 0; i < (k || 1); i++) FX[n](t0 + i * (gap || .45)); }
  const MEL = [2, 4, 5, 4, 2, 1, 0, 1, 2, 4, 2, 1, 0, -2, 0, 1], BASE = 293.7, BEAT = .5;
  const nf = d => BASE * Math.pow(2, d / 7);
  function bgTick() { const a = AC; if (!a || !SND.on || !SND.un || !/^#\/court\//.test(location.hash)) { stopBg(); return; }
    while (bgNext < a.currentTime + .6) { const d = MEL[bgI % MEL.length], t = bgNext; tone(nf(d), t, .55, .035, 'triangle'); tone(nf(d) * 2, t, .25, .01);
      if (bgI % 4 === 3) (Math.floor(bgI / 4) % 2 ? FX.chap : t2 => { tone(2793, t2, .9, .018); tone(4186, t2, .6, .009); })(t); bgI++; bgNext += BEAT; } }
  function startBg() { if (bgT || !SND.on) return; const a = ac(); if (!a) return; bgNext = a.currentTime + .1; bgT = setInterval(bgTick, 200); }
  function stopBg() { if (bgT) { clearInterval(bgT); bgT = null; } }
  document.addEventListener('pointerdown', () => { if (!/^#\/court\//.test(location.hash)) return; if (!SND.un) { SND.un = true; ac(); } if (SND.on) startBg(); }, true);
  window.addEventListener('hashchange', () => { if (!/^#\/court\//.test(location.hash)) stopBg(); });
  const LAST = {};
  function stageSfx(key, x) { const k = x.st + (x.verdict ? 'v' : ''); if (LAST[key] === undefined) { LAST[key] = k; return; } if (LAST[key] === k) return; LAST[key] = k;
    if (x.st === 'vote') sfx('ching', 2, .6); else if (x.st === 'sent') sfx('mong'); else if (x.st === 'done') { sfx('gavel', 3, .35); setTimeout(() => sfx('mong'), 1100); } else sfx('ching'); }

  /* ---------- ภาพห้องพิจารณาคดี (พิกเซล 192×150) ---------- */
  const PK = () => Object.keys(PX.PRESETS).filter(k => k !== 'tang');
  const spec = s => { if (s === 'T') return PX.PRESETS.tang; const L = PK(); let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return PX.PRESETS[L[h % L.length]]; };
  const judgesOf = x => { const J = x.judges || {}, ks = Object.keys(J); return [ks.find(k => J[k].r === 'p'), 'T', ks.find(k => J[k].r === 'v')]; };
  const IMG = {}, W = 192, H = 150;
  function room(x, hi) {
    if (!window.PX) return '';
    const jd = judgesOf(x), jr = Object.keys(x.jury || {}).slice(0, 7), wt = Object.keys(x.wit || {})[0] || '', sig = [jd.join(), jr.join(), wt, x.d, hi].join('|');
    if (!IMG[sig]) {
      const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; const R = (col, a, b, w, h) => { g.fillStyle = col; g.fillRect(a, b, w, h); };
      const spr = (s, a, b, dir) => { if (s) g.drawImage(PX.sprite(spec(s), dir || 'd', 0), a, b, 16, 24); };
      const arrow = (a, b) => { R('#F3C95B', a - 3, b, 7, 2); R('#F3C95B', a - 2, b + 2, 5, 1); R('#F3C95B', a - 1, b + 3, 3, 1); R('#F3C95B', a, b + 4, 1, 1); };
      R('#3b2016', 0, 0, W, H); for (let a = 0; a < W; a += 16) { R('#4a2a1c', a + 1, 2, 14, 52); R('#55311f', a + 2, 3, 12, 4); } R('#2a160f', 0, 54, W, 2);
      const cx = 96; [[cx - 1, 6, 2, 18], [cx - 12, 9, 24, 2], [cx - 13, 11, 1, 6], [cx + 12, 11, 1, 6], [cx - 16, 17, 8, 2], [cx + 9, 17, 8, 2], [cx - 5, 24, 10, 2]].forEach(r => R('#F3C95B', ...r));
      for (let i = 0; i < 14; i++) { R(i % 2 ? '#7a1424' : '#951a2e', i * 2, 0, 2, 58); R(i % 2 ? '#7a1424' : '#951a2e', W - 28 + i * 2, 0, 2, 58); }
      R('#6b4a33', 0, 58, W, H - 58); for (let b = 60; b < H; b += 8) R('#5e402b', 0, b, W, 1); for (let a = 0; a < W; a += 24) R('#5e402b', a, 58, 1, H - 58); R('#7d2a35', 84, 58, 24, H - 58);
      spr(jd[0], 58, 24); spr('T', 88, 20); spr(jd[2], 118, 24);
      R('#2b140c', 40, 44, 112, 22); R('#4d2a17', 42, 46, 108, 18); R('#F3C95B', 40, 44, 112, 2); R('#F3C95B', 92, 50, 8, 8); R('#2b140c', 94, 52, 4, 4); R('#c88a3a', 104, 41, 8, 3); R('#8a5a22', 107, 44, 2, 4);
      jr.slice(0, 4).forEach((s, i) => spr(s, 2 + i * 12, 64, 'r')); jr.slice(4).forEach((s, i) => spr(s, 8 + i * 12, 74, 'r'));
      R('#2b140c', 0, 94, 56, 6); R('#4d2a17', 0, 100, 56, 12); R('#F3C95B', 0, 94, 56, 1);
      if (wt) spr(wt, 160, 72, 'l'); R('#2b140c', 152, 90, 32, 6); R('#4d2a17', 152, 96, 32, 10); R('#F3C95B', 152, 90, 32, 1);
      spr(x.d, 88, 94, 'u'); R('#2b140c', 80, 112, 32, 4); R('#4d2a17', 80, 116, 32, 8); R('#F3C95B', 80, 112, 32, 1);
      ['pob', 'luwa', 'yum', 'waen', 'captain', 'foo', 'ice', 'che'].forEach((k, i) => { const p = PX.PRESETS[k]; if (p) g.drawImage(PX.sprite(p, 'u', 0), 6 + i * 23 + (i > 3 ? 8 : 0), 128, 16, 24); });
      R('#2b140c', 0, 140, W, 10); R('#F3C95B', 0, 140, W, 1);
      if (hi === 'judges') arrow(96, 12); if (hi === 'jury') arrow(26, 56); if (hi === 'def') arrow(96, 87); if (hi === 'wit') arrow(168, 64);
      IMG[sig] = c.toDataURL();
    }
    const L = (t, a, b, g2) => '<span class="ct-lab' + (g2 ? ' g' : '') + '" style="left:' + (a / W * 100) + '%;top:' + (b / H * 100) + '%">' + esc(t) + '</span>';
    return '<div class="ct-room"><img src="' + IMG[sig] + '" alt="ห้องพิจารณาคดี: องค์คณะ ลูกขุน พยาน และผู้ต้องหา">' + L('ประธานองค์คณะ', 96, 1, 1) + L('ลูกขุน ' + cnt(x.jury) + ' คน', 26, 50) + (wt ? L('พยาน', 168, 60) : '') + L('ผู้ต้องหา', 96, 124, 1) + L('ผู้ฟัง · คดีเปิด', 96, 138) + '</div>';
  }

  /* ---------- หน้าจอ ---------- */
  const stLabel = x => x.st === 'closed' ? (x.verdict && x.verdict.drop ? 'ถอนฟ้อง' : 'ปิดคดี') : x.st === 'done' ? (x.verdict && x.verdict.g ? 'ผิด · ' + PN[x.verdict.k] : 'ยกฟ้อง') : STEP[SI[x.st]];
  const rel = ms => { const d = ms - Date.now(), h = Math.round(Math.abs(d) / 3600e3); return d < 0 ? 'ถึงเวลาแล้ว' : h < 1 ? 'อีกไม่ถึง 1 ชั่วโมง' : h < 48 ? 'อีก ' + h + ' ชั่วโมง' : 'อีก ' + Math.round(h / 24) + ' วัน'; };
  A.HOME.push({ order: 11, html: () => {
    if (!T() && !me()) return ''; const L = allCases(), now = Date.now();
    const hz = L.filter(q => q.x.hear && q.x.hear > now - 3600e3 && q.x.st !== 'done' && q.x.st !== 'closed'), vd = L.filter(q => q.x.verdict && q.x.vAt && now - q.x.vAt < 3 * 864e5 && !q.x.verdict.drop);
    if (!hz.length && !vd.length) return '';
    return '<section class="card" style="border:2px solid #F3C95B">' + hz.map(q => '<div class="lb">📅 นัดอ่านคำพิพากษา</div><a href="#/court/' + esc(q.key) + '" style="display:block"><b>' + esc(caseNo(q.x)) + '</b> · ' + esc(dt(q.x.hear)) + (q.x.place ? ' · ' + esc(q.x.place) : '') + '<div class="muted" style="font-size:.85rem">' + esc(rel(q.x.hear)) + ' · คดีเปิด เข้าฟังได้ทุกคน</div></a>').join('') +
      vd.map(q => '<div class="lb" style="margin-top:6px">🔨 คำพิพากษา</div><a href="#/court/' + esc(q.key) + '" style="display:block"><b>' + esc(caseNo(q.x)) + '</b> · ' + esc(q.x.verdict.g ? 'มีความผิด · ' + PN[q.x.verdict.k] : 'ยกฟ้อง ไม่มีความผิด') + '</a>').join('') + '</section>'; } });
  A.V.court = function (arg) {
    if (arg) { const q = getCase(arg); if (!q.x) return { title: 'ศาลชมรม', body: '<div class="empty">' + (q.err ? 'ไม่มีสิทธิ์เปิดคดีนี้' : 'กำลังโหลด…') + '</div>', back: '#/court' }; return caseView(q); }
    const L = allCases();
    let b = T() ? '<div class="row" style="margin-bottom:10px;gap:8px"><button class="btn gold" data-act="ctNew">⚖️ เปิดคดีใหม่</button></div>' : '<div class="muted" style="margin-bottom:10px">ศาลชมรมเป็นคดีเปิด สมาชิกทุกคนเข้าฟังได้ · บัตรของลูกขุนเป็นความลับจนอ่านคำพิพากษา</div>';
    b += L.length ? L.map(q => { const x = q.x, need = T() ? tNeed(q) : myTurn(x);
      return '<a class="card rowcard" href="#/court/' + esc(q.key) + '" style="display:block"><div class="row" style="gap:6px;flex-wrap:wrap"><b class="grow">' + esc(caseNo(x)) + ' · ' + esc(x.dn || '') + '</b>' + chip(stLabel(x), x.st === 'done' || x.st === 'closed' ? 'line' : 'gold') + (q.c !== cid() ? chip('ศาล' + clubName(q.c), 'plum') : '') + '</div><div class="muted" style="font-size:.85rem">ข้อหา: ' + esc(tagTxt(x.tags)) + '</div>' + (need ? '<div style="font-size:.85rem;color:#c0392b">● ' + esc(need) + '</div>' : '') + '</a>'; }).join('') : '<div class="empty">ยังไม่มีคดี</div>';
    return { title: 'ศาลชมรม', body: b };
  };
  function verdictCard(x) { const v = x.verdict; if (!v) return ''; const tl = x.tally ? '<div>ลูกขุน: ผิด <b>' + x.tally.g + '</b> · ไม่ผิด <b>' + x.tally.n + '</b></div>' : '';
    if (v.drop) return '<div class="ct-ver"><div class="big">ถอนฟ้อง</div><div style="font-size:.85rem">' + esc(v.why || '') + '</div></div>';
    if (!v.g) return '<div class="ct-ver ct-shake">' + tl + '<div class="big" style="color:#7be08a">ยกฟ้อง · ไม่มีความผิด</div></div>';
    const ch = v.ch || {}; return '<div class="ct-ver ct-shake"><div style="font-size:.8rem;opacity:.8">คำพิพากษา ' + esc(caseNo(x)) + '</div>' + tl + '<div class="big" style="color:#ff6b6b">มีความผิด · ' + esc(PN[v.k]) + '</div><div style="font-size:.82rem;line-height:1.6">ผู้พิพากษา: ' + Object.keys(ch).map(j => esc(nOf(x, j)) + ' → ' + esc(PN[ch[j]] || '-')).join(' · ') + (v.by === 'veto' ? '<br><b>ครูใช้สิทธิ์ยับยั้ง</b>: ' + esc(v.why || '') : '') + '</div></div>'; }
  function caseView(q) {
    const x = q.x, s = me(), K = esc(q.key), isD = !T() && x.d === s, isJ = T() || !!(x.judges || {})[s], isJu = !!(x.jury || {})[s], wme = (x.wit || {})[s];
    stageSfx(q.key, x);
    const si = SI[x.st] || 1, steps = '<div class="ct-steps">' + STEP.map((t, i) => '<span class="' + (i < si || (x.st === 'closed') ? 'ok' : i === si ? 'on' : '') + '">' + (i < si || x.st === 'closed' ? '✓ ' : '') + t + '</span>').join('') + '</div>';
    const hi = x.st === 'def' ? 'def' : x.st === 'vote' ? 'jury' : 'judges';
    let b = '<div class="row" style="gap:6px;margin-bottom:8px;flex-wrap:wrap"><b class="grow">' + esc(caseNo(x)) + (q.c !== cid() ? ' · ศาล' + esc(clubName(q.c)) : '') + '</b>' + chip('คดีเปิด', 'gold') + '<button class="btn sm ghost" data-act="ctSnd" aria-label="เปิดปิดเสียง">' + (SND.on ? '🔊' : '🔇') + '</button></div>' + steps + room(x, hi);
    if (x.hear && x.st !== 'done' && x.st !== 'closed') b += '<div class="note" style="margin-top:10px">📅 นัดอ่านคำพิพากษา <b>' + esc(dt(x.hear)) + '</b>' + (x.place ? ' · ' + esc(x.place) : '') + ' (' + esc(rel(x.hear)) + ') <button class="btn sm ghost" data-act="ctIcs" data-k="' + K + '">เพิ่มลงปฏิทิน</button></div>';
    if (x.st === 'done' || x.st === 'closed') b += verdictCard(x);
    let who = 'ศาล', p = '', acts = '', note = '';
    if (x.st === 'def') {
      if (isD) { p = 'ผู้ต้องหา ศาลเปิดโอกาสให้แถลงแก้ข้อกล่าวหา เขียนคำชี้แจง แนบลิงก์หลักฐาน และขอให้เพื่อนสมาชิกมาเป็นพยานได้ ภายใน ' + dt(x.due); acts = '<button class="p" data-act="ctDef" data-k="' + K + '">✍️ ' + (x.def ? 'แก้ไขคำแก้ต่าง' : 'เขียนคำแก้ต่าง') + '</button>' + (q.c === (x.dc || q.c) ? '<button data-act="ctWitReq" data-k="' + K + '">🙋 ขอพยาน</button>' : '<button disabled>🙋 ขอพยาน (แจ้งครู)</button>'); }
      else if (wme) { p = 'ท่านถูกเรียกเป็นพยานในคดีนี้ เล่าสิ่งที่ท่านรู้เห็นตามจริง'; acts = '<button class="p" data-act="ctWit" data-k="' + K + '">🗣️ ' + (wme.t ? 'แก้ไขคำให้การ' : 'ให้การ') + '</button>'; }
      else p = 'อยู่ระหว่างให้ผู้ต้องหาแก้ต่าง ถึง ' + dt(x.due) + ' · ผู้ฟังอ่านสำนวนด้านล่างได้';
    } else if (x.st === 'vote') {
      who = isJu ? 'ถึงลูกขุน' : 'ศาล';
      if (isJu && !(x.jn || {})[s] && !myVote(q)) { p = 'ท่านได้อ่านคำฟ้อง คำแก้ต่าง และคำให้การพยานแล้ว ผู้ต้องหามีความผิดตามข้อกล่าวหาหรือไม่'; acts = '<button class="r" data-act="ctVote" data-v="g" data-k="' + K + '" style="font-size:1.05rem">ผิด</button><button class="g" data-act="ctVote" data-v="n" data-k="' + K + '" style="font-size:1.05rem">ไม่ผิด</button>'; note = 'บัตรลับ ลงได้ครั้งเดียว แก้ไม่ได้ · ผลเปิดเผยตอนอ่านคำพิพากษา'; }
      else p = (isJu ? 'ท่านลงมติแล้ว ขอบคุณ · ' : '') + 'ลูกขุนลงมติแล้ว ' + cnt(x.jn) + ' จาก ' + cnt(x.jury) + ' คน';
    } else if (x.st === 'sent') {
      who = isJ ? 'ถึงผู้พิพากษา' : 'ศาล'; const mk = T() ? 'T' : s, mine = ((x.jd || {})[mk] || {}).k, mx = PEN.indexOf(x.max);
      p = 'ลูกขุนชี้ว่ามีความผิด (ผิด ' + ((x.tally || {}).g || 0) + ' · ไม่ผิด ' + ((x.tally || {}).n || 0) + ')' + (isJ ? ' · เลือกโทษที่เห็นสมควร ไม่เกิน ' + PN[x.max] : ' · องค์คณะกำลังกำหนดโทษ (' + cnt(x.jd) + '/' + cnt(x.judges) + ')');
      if (isJ) acts = PEN.filter((k, i) => i <= mx).map(k => '<button class="' + (mine === k ? 'p' : '') + '" data-act="ctPen" data-pk="' + k + '" data-k="' + K + '">' + (mine === k ? '✓ ' : '') + PN[k] + '</button>').join('');
    } else if (x.st === 'done') {
      if (isD && x.verdict && x.verdict.g && !x.apl && !x.acc && Date.now() < (x.aplUntil || 0)) { who = 'ผู้ต้องหา'; p = 'ไม่เห็นด้วยกับคำพิพากษา ยื่นอุทธรณ์ต่อครูได้ 1 ครั้ง ถึง ' + dt(x.aplUntil); acts = '<button class="p" data-act="ctApl" data-k="' + K + '">📮 ยื่นอุทธรณ์</button><button data-act="ctAcc" data-k="' + K + '">ยอมรับคำพิพากษา</button>'; }
      else p = x.apl && !x.apr ? 'ผู้ต้องหายื่นอุทธรณ์แล้ว รอครูพิจารณา' : 'ศาลอ่านคำพิพากษาแล้ว';
    } else p = x.apr ? 'ผลอุทธรณ์: ' + ({ keep: 'ยืนตามคำพิพากษาเดิม', change: 'แก้โทษ', drop: 'ยกฟ้อง' }[x.apr.r] || '') : 'ปิดคดีแล้ว';
    b += '<div class="ct-dlg"><span class="who">' + esc(who) + '</span><p>' + esc(p) + '</p>' + (acts ? '<div class="ct-acts">' + acts + '</div>' : '') + (note ? '<div class="ct-note">' + esc(note) + '</div>' : '') + '</div>';
    if (T()) b += tPanel(q);
    return { title: 'ศาลชมรม', body: b + record(q), back: '#/court' };
  }
  function tPanel(q) { const x = q.x, K = esc(q.key), B2 = (a, t, cl) => '<button class="btn ' + (cl || 'ghost') + '" data-act="' + a + '" data-k="' + K + '">' + t + '</button>';
    let h = '';
    if (q.c !== cid()) h = x.verdict && x.verdict.g && !x.applied ? B2('ctApply', '⚖️ ลงโทษตามคำพิพากษา', 'gold') : '<span class="muted">คดีของศาลชมรม' + esc(clubName(q.c)) + ' จัดการได้ในชมรมนั้น</span>';
    else if (x.st === 'def') h = B2('ctWitT', '🧑‍⚖️ เรียกพยาน') + B2('ctHear', '📅 นัดอ่านคำพิพากษา') + B2('ctToVote', '▶ เริ่มให้ลูกขุนลงมติ', 'gold') + B2('ctDrop', 'ถอนฟ้อง');
    else if (x.st === 'vote') h = B2('ctHear', '📅 นัดอ่านคำพิพากษา') + B2('ctCount', '🗳️ ปิดการลงมติและนับคะแนน', 'gold');
    else if (x.st === 'sent') h = B2('ctHear', '📅 นัดอ่านคำพิพากษา') + B2('ctRead', '🔨 อ่านคำพิพากษา', 'gold');
    else if (x.st === 'done') { if (x.verdict && x.verdict.g && !x.applied) h += x.dc === cid() ? B2('ctApply', '⚖️ ลงโทษตามคำพิพากษา', 'gold') : '<div class="note">ผู้ต้องหาอยู่ชมรม' + esc(clubName(x.dc)) + ' — สลับไปชมรมนั้นแล้วกด “ลงโทษตามคำพิพากษา” ในเมนูศาลชมรม</div>';
      if (x.apl && !x.apr) h += B2('ctApr', '📮 พิจารณาอุทธรณ์', 'gold'); else h += B2('ctClose', 'ปิดคดี'); }
    return h ? '<section class="card"><div class="lb">แผงควบคุมของครู</div><div class="row" style="gap:8px;flex-wrap:wrap">' + h + '</div>' + (x.applied ? '<div class="muted" style="margin-top:6px">ลงโทษตามคำพิพากษาแล้ว ' + esc(dt(x.applied)) + '</div>' : '') + '</section>' : ''; }
  function record(q) { const x = q.x, J = x.judges || {}, rn = { T: 'ประธานองค์คณะ', p: 'ผู้พิพากษา', v: 'ผู้พิพากษา' };
    let h = '<section class="card ct-rec"><div class="lb">สำนวนคดี</div><div>ผู้ต้องหา: <b>' + esc(x.dn || '') + '</b> · ชมรม' + esc(clubName(x.dc || q.c)) + '</div><div>ข้อหา: ' + esc(tagTxt(x.tags)) + '</div><div>โทษสูงสุดที่ขอ: ' + esc(PN[x.max] || '') + '</div>' +
      '<div class="ct-sec">คำฟ้อง</div><div class="q">' + esc(x.t || '') + '</div>' +
      '<div class="ct-sec">องค์คณะ</div><div class="q">' + Object.keys(J).sort((a, b) => (J[a].r === 'T' ? -1 : 0) - (J[b].r === 'T' ? -1 : 0)).map(j => esc(rn[J[j].r] || '') + ': ' + esc(nOf(x, j)) + (((x.ppl || {})[j] || {}).c && x.ppl[j].c !== q.c ? ' (ชมรม' + esc(clubName(x.ppl[j].c)) + ')' : '')).join('\n') + '\nลูกขุน: ' + Object.keys(x.jury || {}).map(j => esc(nOf(x, j))).join(', ') + '</div>' +
      '<div class="ct-sec">คำแก้ต่างของผู้ต้องหา</div>' + (x.def ? '<div class="q">' + esc(x.def.t || '') + '</div>' + (x.def.links ? '<div style="font-size:.85rem">หลักฐาน:<br>' + links(x.def.links) + '</div>' : '') + '<div class="muted" style="font-size:.75rem">ยื่นเมื่อ ' + esc(dt(x.def.at)) + '</div>' : '<div class="muted">ยังไม่ได้ยื่น</div>');
    const wt = x.wit || {}; h += '<div class="ct-sec">คำให้การพยาน</div>' + (Object.keys(wt).length ? Object.keys(wt).map(w => '<div style="margin:4px 0"><b>' + esc(nOf(x, w)) + '</b> <span class="muted" style="font-size:.78rem">' + (wt[w].by === 'd' ? 'พยานฝ่ายผู้ต้องหา' : 'ศาลเรียก') + '</span><div class="q">' + (wt[w].t ? esc(wt[w].t) : '<span class="muted">ยังไม่ได้ให้การ</span>') + '</div></div>').join('') : '<div class="muted">ไม่มีพยาน</div>');
    if (x.apl) h += '<div class="ct-sec">คำอุทธรณ์</div><div class="q">' + esc(x.apl.t || '') + '</div>' + (x.apr ? '<div><b>ผล:</b> ' + esc({ keep: 'ยืนตามคำพิพากษาเดิม', change: 'แก้โทษ', drop: 'ยกฟ้อง' }[x.apr.r] || '') + (x.apr.t ? ' · ' + esc(x.apr.t) : '') + '</div>' : '');
    if (x.acc) h += '<div class="muted" style="margin-top:6px">ผู้ต้องหายอมรับคำพิพากษาแล้ว</div>';
    return h + '<div class="muted" style="font-size:.75rem;margin-top:8px">เปิดคดี ' + esc(dt(x.at)) + '</div></section>'; }

  /* ---------- การกระทำ ---------- */
  const P = q => CP(q.c) + 'court/' + q.id, url = q => '#/court/' + q.c + '~' + q.id;
  const push = (k, o) => { try { if (window.PUSH) window.PUSH.notify(k, o); } catch (e) { /* ignore */ } };
  const parts = x => Object.keys(x.who || {});
  const Q = d => { const q = getCase(d.k); if (!q.x) { toast('ไม่พบคดี'); return null; } return q; };
  function textForm(title, hint, val, max, extra) { return new Promise(res => {
    const w = modal('<h3>' + esc(title) + '</h3><form class="form">' + fld(hint, '<textarea class="in" id="cf-t" rows="6" maxlength="' + max + '">' + esc(val || '') + '</textarea>') + (extra || '') + '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">บันทึก</button></div></form>', { center: true, sticky: true });
    w.addEventListener('click', e => { if (e.target.closest('[data-close]')) res(null); });
    $('form', w).addEventListener('submit', e => { e.preventDefault(); const t = $('#cf-t', w).value.trim(); if (!t) return toast('ยังไม่ได้เขียนข้อความ'); const o = { t }; w.querySelectorAll('[data-x]').forEach(i => { o[i.dataset.x] = i.value.trim(); }); w.remove(); res(o); }); }); }
  async function peopleAll() { const o = {}; A.activeSids().forEach(s => { o[s] = [A.fullName(A.members()[s]), cid()]; });
    for (const c of others()) { try { const v = await B.get(CP(c) + 'members') || {}; Object.keys(v).forEach(s => { if (v[s] && v[s].status === 'active' && !o[s]) o[s] = [A.fullName(v[s]), c]; }); } catch (e) { /* ignore */ } } return o; }
  const pOpt = (o, sel, skip) => opt([['', '— เลือก —']].concat(Object.keys(o).filter(s => !(skip || []).includes(s)).sort((a, b) => (o[a][1] === cid() ? 0 : 1) - (o[b][1] === cid() ? 0 : 1) || o[a][0].localeCompare(o[b][0], 'th')).map(s => [s, o[s][0] + (o[s][1] !== cid() ? ' · ชมรม' + clubName(o[s][1]) : '')])), sel || '');
  async function newForm() {
    if (!T()) return; toast('กำลังโหลดรายชื่อทั้งสองชมรม…', 1200); const PP = await peopleAll(), R = A.D.roles || {}, rf = r => Object.keys(R).find(s => R[s] && R[s].role === r && PP[s]);
    const ven = A.activeSids().sort(A.byClass), d0 = new Date(Date.now() + 3 * 864e5); d0.setHours(18, 0, 0, 0); const loc = new Date(d0 - d0.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
    const w = modal('<h3>⚖️ เปิดคดีใหม่ (คดีเปิด)</h3><form class="form">' + fld('ผู้ต้องหา (สมาชิกชมรมนี้หรืออีกชมรม)', '<select class="in" id="cn-d">' + pOpt(PP) + '</select>') +
      '<div class="fld"><span>ข้อหา (มลทิน)</span><div class="ms-pick" style="max-height:none">' + Object.keys(TA()).map(k => '<label><input type="checkbox" name="cn-tg" value="' + k + '"> <span>' + esc(TA()[k]) + '</span></label>').join('') + '</div></div>' +
      fld('คำฟ้อง / พฤติการณ์ (ผู้ฟังทุกคนเห็น)', '<textarea class="in" id="cn-t" rows="4" maxlength="2000" placeholder="เกิดอะไรขึ้น ที่ไหน เมื่อไร"></textarea>') +
      fld('โทษสูงสุดที่ขอ', '<select class="in" id="cn-m">' + opt(PEN.map(k => [k, PN[k]]), 'prob') + '</select>') +
      fld('ผู้พิพากษา (ประธานชมรม หรือผู้แทนที่ครูแต่งตั้ง)', '<select class="in" id="cn-p">' + pOpt(PP, rf('president')) + '</select>') + fld('ผู้พิพากษา (รองประธาน หรือผู้แทนที่ครูแต่งตั้ง)', '<select class="in" id="cn-v">' + pOpt(PP, rf('vice')) + '</select>') +
      '<div class="row" style="gap:8px;align-items:flex-end">' + fld('จำนวนลูกขุน', '<select class="in" id="cn-n">' + opt([['3', '3 คน'], ['5', '5 คน'], ['7', '7 คน']], '5') + '</select>') + '<button type="button" class="btn ghost" id="cn-r" style="margin-bottom:10px">🎲 สุ่มลูกขุน</button></div>' +
      '<div class="fld"><span>คณะลูกขุน (สมาชิกชมรมนี้) <b id="cn-c"></b></span><div class="ms-pick" id="cn-j">' + ven.map(s => '<label><input type="checkbox" name="cn-j" value="' + esc(s) + '"> <span>' + esc(A.fullName(A.members()[s]) + ' · ' + A.cls(A.members()[s])) + '</span></label>').join('') + '</div></div>' +
      fld('ยื่นคำแก้ต่างได้ถึง', '<input class="in" type="datetime-local" id="cn-due" value="' + loc + '">') +
      '<label class="ck wide"><input type="checkbox" id="cn-ann" checked> แจ้งทั้งชมรมว่าศาลเปิดพิจารณาคดีนี้ (คดีเปิด)</label><div class="note bad" id="cn-err" hidden></div>' +
      '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">เปิดคดี</button></div></form>', { center: true, sticky: true });
    const N = () => +$('#cn-n', w).value, sel = () => [...w.querySelectorAll('input[name="cn-j"]:checked')].map(c => c.value), cc = () => { $('#cn-c', w).textContent = sel().length + '/' + N(); };
    w.addEventListener('change', cc); cc();
    $('#cn-r', w).addEventListener('click', () => { const ex = [$('#cn-d', w).value, $('#cn-p', w).value, $('#cn-v', w).value], L = ven.filter(s => !ex.includes(s) && !(A.jailed && A.jailed(s))).sort(() => Math.random() - .5).slice(0, N());
      w.querySelectorAll('input[name="cn-j"]').forEach(c => { c.checked = L.includes(c.value); }); cc(); });
    $('form', w).addEventListener('submit', async e => { e.preventDefault(); const err = $('#cn-err', w), bad = t => { err.textContent = t; err.hidden = false; };
      const d = $('#cn-d', w).value, p = $('#cn-p', w).value, v = $('#cn-v', w).value, tags = [...w.querySelectorAll('input[name="cn-tg"]:checked')].map(c => c.value), t = $('#cn-t', w).value.trim(), jur = sel(), due = new Date($('#cn-due', w).value).getTime();
      if (!d) return bad('เลือกผู้ต้องหา'); if (!tags.length) return bad('เลือกข้อหาอย่างน้อย 1 ข้อ'); if (!t) return bad('เขียนคำฟ้อง');
      if (!p || !v) return bad('ระบุผู้พิพากษาให้ครบ 2 คน (ถ้าประธานหรือรองฯ ไม่ว่าง ให้เลือกผู้แทน)'); if (p === v || p === d || v === d) return bad('ผู้พิพากษาต้องเป็นคนละคน และไม่ใช่ผู้ต้องหา');
      if (jur.length !== N()) return bad('เลือกลูกขุนให้ครบ ' + N() + ' คน'); if (jur.some(s => [d, p, v].includes(s))) return bad('ผู้ต้องหาและผู้พิพากษาเป็นลูกขุนไม่ได้'); if (!(due > Date.now())) return bad('กำหนดเวลายื่นคำแก้ต่างในอนาคต');
      if (!(await M.confirmBox('เปิดคดี', 'ผู้ต้องหา: <b>' + esc(PP[d][0]) + '</b><br>ข้อหา: ' + esc(tagTxt(tags)) + '<br>ทุกคนในองค์คณะ ลูกขุน และผู้ต้องหาจะได้รับหมายศาล', 'เปิดคดี'))) return;
      const id = B.uid(), now = Date.now(), no = Object.values(A.D.court || {}).filter(x => x && x.y === A.year()).length + 1, ppl = {}, who = {}, upd = {};
      [d, p, v].concat(jur).forEach(s => { ppl[s] = { n: PP[s][0], c: PP[s][1] }; }); who[d] = 'd'; who[p] = 'j'; who[v] = 'j'; jur.forEach(s => { who[s] = 'u'; });
      const x = { no, y: A.year(), c: cid(), d, dn: PP[d][0], dc: PP[d][1], tags, t, max: $('#cn-m', w).value, judges: { T: { r: 'T' }, [p]: { r: 'p' }, [v]: { r: 'v' } }, jury: {}, ppl, who, st: 'def', due, at: now, by: A.myName() };
      jur.forEach(s => { x.jury[s] = true; }); upd[CP() + 'court/' + id] = x;
      Object.keys(who).forEach(s => { if (ppl[s].c !== cid()) upd['/courtx/' + s + '/' + cid() + '~' + id] = true; });
      await A.W(B.update('', upd)); A.log('court.new', d, caseNo(x) + ' · ' + tagTxt(tags)); w.remove(); const q = { c: cid(), id };
      push('msg', { title: '⚖️ หมายศาล ' + caseNo(x), body: 'ท่านถูกฟ้องข้อหา ' + tagTxt(tags) + ' · ยื่นคำแก้ต่างได้ถึง ' + dt(due), to: [d], url: url(q) });
      push('msg', { title: '⚖️ แต่งตั้งองค์คณะ ' + caseNo(x), body: 'ท่านได้รับแต่งตั้งเป็นผู้พิพากษาในคดีของ ' + PP[d][0], to: [p, v], url: url(q) });
      push('msg', { title: '⚖️ หมายเรียกลูกขุน ' + caseNo(x), body: 'ท่านได้รับเลือกเป็นลูกขุน อ่านสำนวนไว้ก่อน ศาลจะแจ้งเมื่อถึงเวลาลงมติ', to: jur, url: url(q) });
      if ($('#cn-ann', w).checked) push('ann', { title: '⚖️ ศาลชมรมเปิดพิจารณา ' + caseNo(x), body: 'คดีเปิด สมาชิกเข้าฟังได้ที่เมนูศาลชมรม', url: url(q) });
      toast('เปิดคดีแล้ว · ส่งหมายศาลแล้ว'); location.hash = '#/court/' + id; }); }
  function ics(q) { const x = q.x, z = t => new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const s = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//sapphawathit//court//TH', 'BEGIN:VEVENT', 'UID:' + q.c + '-' + q.id + '@sapphawathit', 'DTSTAMP:' + z(Date.now()), 'DTSTART:' + z(x.hear), 'DTEND:' + z(x.hear + 3600e3), 'SUMMARY:อ่านคำพิพากษา ' + caseNo(x), 'LOCATION:' + (x.place || ''), 'DESCRIPTION:ศาลชมรม' + clubName(q.c),
      'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:อีก 30 นาที ศาลชมรมอ่านคำพิพากษา', 'END:VALARM', 'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:พรุ่งนี้ศาลชมรมอ่านคำพิพากษา', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    M.saveBlob(new Blob([s], { type: 'text/calendar' }), 'นัดศาลชมรม-' + (x.no || '') + '.ics'); }
  Object.assign(A.ACT, {
    ctNew: () => newForm(),
    ctSnd: () => { SND.on = !SND.on; try { localStorage.setItem('spw_court_snd', SND.on ? '1' : '0'); } catch (e) { /* ignore */ } if (SND.on) { SND.un = true; startBg(); sfx('ching'); } else stopBg(); A.rerender(); },
    ctIcs: d => { const q = Q(d); if (q && q.x.hear) ics(q); },
    ctDef: async d => { const q = Q(d); if (!q) return; const o = await textForm('คำแก้ต่าง', 'ชี้แจงข้อเท็จจริงจากฝ่ายของเรา', (q.x.def || {}).t, 3000, fld('ลิงก์หลักฐาน (ไม่บังคับ · ขึ้นบรรทัดใหม่ทีละลิงก์ เช่น Google Drive)', '<textarea class="in" data-x="links" rows="2" maxlength="1500">' + esc((q.x.def || {}).links || '') + '</textarea>')); if (!o) return;
      A.W(B.update(P(q) + '/def', { t: o.t, links: o.links || '', at: Date.now() }).then(() => { toast('ยื่นคำแก้ต่างแล้ว'); sfx('chap'); })); },
    ctWit: async d => { const q = Q(d); if (!q) return; const o = await textForm('คำให้การพยาน', 'เล่าสิ่งที่รู้เห็นตามจริง', ((q.x.wit || {})[me()] || {}).t, 2000); if (!o) return; A.W(B.update(P(q) + '/wit/' + me(), { t: o.t, at: Date.now() }).then(() => toast('บันทึกคำให้การแล้ว'))); },
    ctWitReq: d => { const q = Q(d); if (!q) return; const x = q.x, ex = [x.d].concat(Object.keys(x.judges || {}), Object.keys(x.wit || {})), L = A.activeSids().filter(s => !ex.includes(s)).sort(A.byClass);
      const w = modal('<h3>🙋 ขอพยาน</h3><div class="muted" style="margin-bottom:8px">เลือกเพื่อนสมาชิกที่รู้เห็นเหตุการณ์ ระบบจะแจ้งให้มาให้การ</div><form class="form">' + fld('พยาน', '<select class="in" id="cw-s">' + opt([['', '— เลือก —']].concat(L.map(s => [s, A.fullName(A.members()[s])])), '') + '</select>') + '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">ขอพยาน</button></div></form>', { center: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const s = $('#cw-s', w).value; if (!s) return; A.W(B.set(P(q) + '/wit/' + s, { by: 'd', n: A.fullName(A.members()[s]) }).then(() => { w.remove(); toast('ส่งคำขอพยานแล้ว'); push('msg', { title: '⚖️ หมายเรียกพยาน ' + caseNo(x), body: 'ผู้ต้องหาขอให้ท่านมาให้การ', to: [s], url: url(q) }); })); }); },
    ctVote: async d => { const q = Q(d); if (!q) return; const g = d.v === 'g'; if (!(await M.confirmBox('ยืนยันมติของลูกขุน', 'ท่านลงมติว่าผู้ต้องหา <b>' + (g ? 'มีความผิด' : 'ไม่มีความผิด') + '</b><br>ลงแล้วแก้ไม่ได้', 'ยืนยัน'))) return;
      const upd = {}; upd[CP(q.c) + 'courtv/' + q.id + '/' + me()] = d.v; upd[P(q) + '/jn/' + me()] = true;
      A.W(B.update('', upd).then(() => { MYV[q.c + '~' + q.id + '~' + me()] = d.v; sfx('ching'); setTimeout(() => sfx('chap'), 500); toast('ลงมติแล้ว'); A.rerender(); })); },
    ctPen: d => { const q = Q(d); if (!q) return; A.W(B.set(P(q) + '/jd/' + (T() ? 'T' : me()), { k: d.pk, at: Date.now() }).then(() => { sfx('chap'); toast('บันทึกการกำหนดโทษ: ' + PN[d.pk]); })); },
    ctApl: async d => { const q = Q(d); if (!q) return; const o = await textForm('ยื่นอุทธรณ์', 'เหตุผลที่ไม่เห็นด้วยกับคำพิพากษา (ยื่นได้ครั้งเดียว)', '', 2000); if (!o) return; A.W(B.set(P(q) + '/apl', { t: o.t, at: Date.now() }).then(() => toast('ยื่นอุทธรณ์แล้ว รอครูพิจารณา'))); },
    ctAcc: async d => { const q = Q(d); if (!q) return; if (!(await M.confirmBox('ยอมรับคำพิพากษา', 'เมื่อยอมรับแล้วจะยื่นอุทธรณ์ไม่ได้', 'ยอมรับ'))) return; A.W(B.set(P(q) + '/acc', Date.now())); },
    ctWitT: async d => { const q = Q(d); if (!q || !T()) return; const PP = await peopleAll(), x = q.x, ex = [x.d].concat(Object.keys(x.wit || {}));
      const w = modal('<h3>🧑‍⚖️ ศาลเรียกพยาน</h3><form class="form">' + fld('พยาน (ชมรมนี้หรืออีกชมรม)', '<select class="in" id="cw-s">' + pOpt(PP, '', ex) + '</select>') + '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">เรียกพยาน</button></div></form>', { center: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const s = $('#cw-s', w).value; if (!s) return; const upd = {}; upd[P(q) + '/wit/' + s] = { by: 'T', n: PP[s][0] }; upd[P(q) + '/who/' + s] = 'w'; upd[P(q) + '/ppl/' + s] = { n: PP[s][0], c: PP[s][1] }; if (PP[s][1] !== cid()) upd['/courtx/' + s + '/' + q.c + '~' + q.id] = true;
        A.W(B.update('', upd).then(() => { w.remove(); toast('เรียกพยานแล้ว'); push('msg', { title: '⚖️ หมายเรียกพยาน ' + caseNo(x), body: 'ศาลชมรมเรียกท่านมาให้การ', to: [s], url: url(q) }); })); }); },
    ctHear: d => { const q = Q(d); if (!q || !T()) return; const x = q.x, d0 = new Date(x.hear || Date.now() + 2 * 864e5); if (!x.hear) d0.setHours(16, 30, 0, 0); const loc = new Date(d0 - d0.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
      const w = modal('<h3>📅 นัดอ่านคำพิพากษา</h3><form class="form">' + fld('วันเวลา', '<input class="in" type="datetime-local" id="ch-t" value="' + loc + '" required>') + fld('สถานที่', '<input class="in" id="ch-p" maxlength="60" value="' + esc(x.place || 'ห้องดนตรีไทย 512') + '">') + '<div class="muted" style="font-size:.85rem">แจ้งเตือนทันที: ผู้ต้องหา องค์คณะ ลูกขุน พยาน และประกาศทั้งชมรม · หน้าหลักทุกคนขึ้นนับถอยหลัง · มีปุ่มเพิ่มลงปฏิทินในเครื่อง (เตือนล่วงหน้า 1 วันและ 30 นาที)</div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">นัดและแจ้งเตือน</button></div></form>', { center: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const t = new Date($('#ch-t', w).value).getTime(), pl = $('#ch-p', w).value.trim(); if (!(t > Date.now())) return toast('เลือกเวลาในอนาคต');
        A.W(B.update(P(q), { hear: t, place: pl || null }).then(() => { w.remove(); sfx('mong'); toast('นัดอ่านคำพิพากษาแล้ว · ส่งแจ้งเตือนแล้ว');
          const body = caseNo(x) + ' · ' + dt(t) + (pl ? ' · ' + pl : '');
          push('msg', { title: '📅 นัดฟังคำพิพากษา', body: body + ' · ผู้เกี่ยวข้องกับคดีโปรดมาตามนัด', to: parts(x), url: url(q) }); push('ann', { title: '📅 ศาลชมรมนัดอ่านคำพิพากษา', body: body + ' · คดีเปิด เข้าฟังได้', url: url(q) }); })); }); },
    ctToVote: async d => { const q = Q(d); if (!q || !T()) return; if (!(await M.confirmBox('เริ่มให้ลูกขุนลงมติ', 'ปิดการแก้ต่างและการให้การ' + (q.x.def ? '' : '<br><b>ผู้ต้องหายังไม่ได้ยื่นคำแก้ต่าง</b>'), 'เริ่มลงมติ'))) return;
      A.W(B.update(P(q), { st: 'vote' }).then(() => push('msg', { title: '🗳️ ถึงเวลาลงมติ ' + caseNo(q.x), body: 'ลูกขุนโปรดอ่านสำนวนแล้วลงมติ ผิด / ไม่ผิด (บัตรลับ)', to: Object.keys(q.x.jury || {}), url: url(q) }))); },
    ctDrop: async d => { const q = Q(d); if (!q || !T()) return; const o = await textForm('ถอนฟ้อง', 'เหตุผลที่ถอนฟ้อง (ผู้ฟังเห็น)', '', 300); if (!o) return; A.W(B.update(P(q), { st: 'closed', verdict: { g: false, drop: true, why: o.t }, vAt: Date.now() }).then(() => push('msg', { title: '⚖️ ถอนฟ้อง ' + caseNo(q.x), body: o.t, to: parts(q.x), url: url(q) }))); },
    ctCount: async d => { const q = Q(d); if (!q || !T()) return; const x = q.x; let v = {}; try { v = await B.get(CP(q.c) + 'courtv/' + q.id) || {}; } catch (e) { return toast('อ่านบัตรไม่ได้'); }
      const J = Object.keys(x.jury || {}), g = J.filter(s => v[s] === 'g').length, n = J.filter(s => v[s] === 'n').length;
      if (!(await M.confirmBox('ปิดการลงมติและนับคะแนน', 'ลงมติแล้ว ' + (g + n) + ' จาก ' + J.length + ' คน' + (g + n < J.length ? '<br><b>ยังลงไม่ครบ</b> บัตรที่ไม่ได้ลงไม่นับ' : '') + '<br>ผลจะเปิดเผยในขั้นต่อไป (เสียงเท่ากันถือว่าไม่ผิด)', 'นับคะแนน'))) return;
      if (g > n) A.W(B.update(P(q), { st: 'sent', tally: { g, n } }).then(() => { push('msg', { title: '⚖️ ถึงเวลากำหนดโทษ ' + caseNo(x), body: 'ลูกขุนชี้ว่ามีความผิด (' + g + ':' + n + ') ผู้พิพากษาโปรดเลือกโทษ', to: Object.keys(x.judges || {}).filter(s => s !== 'T'), url: url(q) }); }));
      else A.W(B.update(P(q), { st: 'done', tally: { g, n }, verdict: { g: false }, vAt: Date.now() }).then(() => { push('msg', { title: '🔨 คำพิพากษา ' + caseNo(x), body: 'ยกฟ้อง ไม่มีความผิด (ลูกขุน ผิด ' + g + ' · ไม่ผิด ' + n + ')', to: parts(x), url: url(q) }); push('ann', { title: '🔨 ศาลชมรมอ่านคำพิพากษา ' + caseNo(x), body: 'ยกฟ้อง ไม่มีความผิด', url: url(q) }); })); },
    ctRead: d => { const q = Q(d); if (!q || !T()) return; const x = q.x, ch = {}; Object.keys(x.judges || {}).forEach(j => { const k = ((x.jd || {})[j] || {}).k; if (k) ch[j] = k; });
      const c = {}; Object.values(ch).forEach(k => { c[k] = (c[k] || 0) + 1; }); const maj = Object.keys(c).find(k => c[k] >= 2) || ch.T || '';
      const w = modal('<h3>🔨 อ่านคำพิพากษา</h3><div class="note">' + Object.keys(x.judges || {}).map(j => esc(nOf(x, j)) + ': ' + esc(PN[ch[j]] || 'ยังไม่เลือก')).join('<br>') + '<br><b>เสียงข้างมาก: ' + esc(PN[maj] || 'ไม่มี') + '</b></div><form class="form">' +
        fld('โทษตามคำพิพากษา', '<select class="in" id="cr-k">' + opt(PEN.map(k => [k, PN[k] + (k === maj ? ' (เสียงข้างมาก)' : '')]), maj || 'prob') + '</select>') + fld('เหตุผลการใช้สิทธิ์ยับยั้ง (ต้องใส่เมื่อเลือกต่างจากเสียงข้างมาก)', '<input class="in" id="cr-w" maxlength="200">') +
        '<label class="ck wide"><input type="checkbox" id="cr-a" checked> ประกาศคำพิพากษาให้ทั้งชมรมทราบ</label><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">อ่านคำพิพากษา</button></div></form>', { center: true, sticky: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const k = $('#cr-k', w).value, why = $('#cr-w', w).value.trim(), veto = k !== maj; if (veto && !why) return toast('ใส่เหตุผลการใช้สิทธิ์ยับยั้ง');
        const now = Date.now(), v = { g: true, k, by: veto ? 'veto' : 'maj', why: veto ? why : null, ch };
        A.W(B.update(P(q), { st: 'done', verdict: v, vAt: now, aplUntil: now + 3 * 864e5 }).then(() => { w.remove(); const body = 'มีความผิด · ' + PN[k] + ' (ลูกขุน ผิด ' + ((x.tally || {}).g || 0) + ' · ไม่ผิด ' + ((x.tally || {}).n || 0) + ')';
          push('msg', { title: '🔨 คำพิพากษา ' + caseNo(x), body: body + ' · ยื่นอุทธรณ์ได้ภายใน 3 วัน', to: [x.d], url: url(q) }); push('msg', { title: '🔨 คำพิพากษา ' + caseNo(x), body, to: parts(x).filter(s => s !== x.d), url: url(q) });
          if ($('#cr-a', w).checked) push('ann', { title: '🔨 ศาลชมรมอ่านคำพิพากษา ' + caseNo(x), body: x.dn + ' ' + body, url: url(q) }); toast('อ่านคำพิพากษาแล้ว · กด “ลงโทษตามคำพิพากษา” เพื่อบันทึกโทษ', 5000); })); }); },
    ctApply: d => { const q = Q(d); if (!q || !T()) return; const x = q.x; if (x.dc !== cid()) return toast('สลับไปชมรม' + clubName(x.dc) + ' ก่อน');
      if (!window.MIS || !window.MIS.downForm) return toast('ระบบลงโทษยังไม่พร้อม'); if (!A.members()[x.d]) return toast('ไม่พบผู้ต้องหาในทะเบียนชมรมนี้');
      window.MIS.downForm(x.d, null, { k: x.verdict.k, tags: x.tags, note: caseNo(x) + ' · คำพิพากษาศาลชมรม' + clubName(q.c), done: () => A.W(B.set(P(q) + '/applied', Date.now())) }); },
    ctApr: d => { const q = Q(d); if (!q || !T()) return; const x = q.x;
      const w = modal('<h3>📮 พิจารณาอุทธรณ์</h3><div class="note" style="white-space:pre-wrap">' + esc((x.apl || {}).t || '') + '</div><form class="form"><div class="fld"><span>ผล</span><div class="checks"><label class="ck"><input type="radio" name="ca-r" value="keep" checked><span>ยืนตามเดิม</span></label><label class="ck"><input type="radio" name="ca-r" value="change"><span>แก้โทษ</span></label><label class="ck"><input type="radio" name="ca-r" value="drop"><span>ยกฟ้อง</span></label></div></div>' + fld('เหตุผล', '<input class="in" id="ca-t" maxlength="300" required>') + '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">บันทึกผล</button></div></form>', { center: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const r = $('input[name="ca-r"]:checked', w).value, t = $('#ca-t', w).value.trim();
        A.W(B.update(P(q), { apr: { r, t, at: Date.now() }, st: 'closed' }).then(() => { w.remove(); push('msg', { title: '📮 ผลอุทธรณ์ ' + caseNo(x), body: { keep: 'ยืนตามคำพิพากษาเดิม', change: 'แก้โทษ', drop: 'ยกฟ้อง' }[r] + ' · ' + t, to: [x.d], url: url(q) });
          toast(r === 'keep' ? 'ยืนตามเดิมแล้ว' : 'บันทึกผลแล้ว — ถ้าลงโทษเดิมไปแล้ว ให้ยกเลิกโทษเดิมที่หน้าภารกิจ (ปล่อยพ้นโทษ / ยุติทัณฑ์บน / คืนยศ / กู้คืนสมาชิก)' + (r === 'change' ? ' แล้วลงโทษใหม่' : ''), 7000); })); }); },
    ctClose: async d => { const q = Q(d); if (!q || !T()) return; if (!(await M.confirmBox('ปิดคดี', 'ปิดคดีนี้ (ผู้ต้องหายื่นอุทธรณ์ไม่ได้อีก)', 'ปิดคดี'))) return; A.W(B.update(P(q), { st: 'closed' })); }
  });
  window.COURT = { allCases, getCase };
})();
