/* ============================================================
   guardian.js — รุ่น 3.2: โหมดผู้ปกครอง/ผู้เข้าชม (ไม่ต้องล็อกอิน)
   • ครูสร้างลิงก์เฉพาะนักเรียนแต่ละคน  ?g=รหัสสุ่ม   (เก็บที่ gtok/{sid}; นักเรียนอ่านของตัวเองเพื่อส่งต่อให้ผู้ปกครองได้)
   • ระบบสรุปข้อมูล “สำเนาสำหรับผู้ปกครอง” ไว้ที่ pview/{รหัส} (อ่านได้ด้วยรหัสเท่านั้น) — ครูเปิดแอปอยู่ ระบบอัปเดตให้เองทุก ~2 นาที
   • แสดง: การมาซ้อม · ระดับ/คะแนนพฤติกรรม · รางวัลและเกียรติบัตร · เครื่องดนตรี (ไม่แสดงเบอร์โทร ข้อความจากครู หรือข้อมูลส่วนตัวอื่น)
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP, C = M.C;
  const { $, esc, toast, modal } = M; const { ic, chip } = A;
  const T = () => A.teacher();
  const newToken = () => { const a = new Uint8Array(18); crypto.getRandomValues(a); return Array.from(a).map(x => 'abcdefghijkmnpqrstuvwxyz23456789'[x % 32]).join(''); };
  const linkOf = t => location.origin + location.pathname + '?g=' + t + (B.mode === 'demo' ? '&demo=1' : '');
  const toks = () => A.D.gtok || {};

  A.SUBS.push({ key: 'gtok', path: () => A.teacher() ? 'gtok' : (A.sid() ? 'gtok/' + A.sid() : null), norm: v => A.teacher() ? v : { [A.sid()]: v } });
  A.NAVS.push({ id: 'guardian', label: 'โหมดผู้ปกครอง', icon: 'me', order: 44, show: () => A.teacher() });

  /* ---------- สำเนาข้อมูลสำหรับผู้ปกครอง (สร้างฝั่งครู) ---------- */
  function snap(sid) {
    const m = A.members()[sid], S = A.assess, att = (A.D.att || {})[sid] || {}, c = { p: 0, l: 0, v: 0, a: 0 }, recent = [];
    Object.keys(att).forEach(k => { const v = att[k]; if (c[v] !== undefined) c[v]++; recent.push({ d: k.slice(0, 10), s: k.slice(11), v }); });
    recent.sort((a, b) => (b.d + b.s).localeCompare(a.d + a.s)); const n = c.p + c.l + c.v + c.a;
    const bs = S.behaveScore(sid), bh = (A.D.behave || {})[sid] || {}, weeks = Object.keys(bh).filter(k => bh[k] && bh[k].s).sort().reverse().slice(0, 8).map(k => ({ w: k, s: bh[k].s }));
    const aw = Object.keys(A.D.awards || {}).map(k => A.D.awards[k]).filter(a => a.title && (a.rcp || {})[sid]).sort((a, b) => b.at - a.at).slice(0, 20).map(a => ({ t: a.title, d: a.at }));
    const ce = Object.keys(A.D.certs || {}).map(k => A.D.certs[k]).filter(x => x.no && x.sid === sid && x.status !== 'void').sort((a, b) => b.at - a.at).slice(0, 20).map(x => ({ t: x.title, no: x.no, d: x.date }));
    return JSON.parse(JSON.stringify({ cid: C.club.id, club: C.club.long || C.club.full, logo: C.club.logo, round: !!C.club.round, school: C.school, y: A.year(), name: A.fullName(m), cls: A.cls(m), role: A.roleName(A.roleOf(sid)) || null,
      insts: A.insts(m).map(i => ({ n: i, l: A.lvOf(sid, i) ? A.lvName(A.lvOf(sid, i)) : null })), att: { p: c.p, l: c.l, v: c.v, a: c.a, n, pct: n ? Math.round((c.p + c.l) / n * 100) : null, recent: recent.slice(0, 20) },
      bh: bs ? { score: Math.round(bs.total * 100) / 100, level: bs.level[1], k: bs.level[2], f: bs.fAvg !== null ? Math.round(bs.fAvg * 100) / 100 : null, weeks } : null, aw, ce }));
  }
  const SENT = {};
  function syncAll(force) {
    if (!T()) return 0; const t = toks(), upd = {}; let n = 0;
    Object.keys(t).forEach(sid => { const tk = t[sid], m = A.members()[sid]; if (!tk) return;
      if (m && m.status !== 'active') { upd['/pview/' + tk] = null; upd['gtok/' + sid] = null; n++; return; }   /* สมาชิกที่ถูกนำออก: ยกเลิกลิงก์อัตโนมัติ */
      if (!m) return; const s = snap(sid), j = JSON.stringify(s); if (!force && SENT[tk] === j) return; SENT[tk] = j; s.at = Date.now(); upd['/pview/' + tk] = s; n++; });
    if (n) A.W(B.update('', upd)); return n;
  }
  setInterval(() => { if (T() && A.STATUS.online !== false && Object.keys(toks()).length) syncAll(false); }, 120000);

  /* ---------- หน้าครู ---------- */
  A.V.guardian = function () {
    if (!T()) { location.hash = '#/home'; return null; }
    const list = A.activeSids().sort(A.byClass), ms = A.members(), t = toks(), has = list.filter(s => t[s]).length;
    let b = '<section class="card"><div class="lb">โหมดผู้ปกครอง · ดูข้อมูลของลูกโดยไม่ต้องล็อกอิน</div><div class="muted">สร้างลิงก์เฉพาะนักเรียนแต่ละคน ส่งให้ผู้ปกครองทาง LINE ผู้ปกครองจะเห็น การมาซ้อม ระดับ/คะแนนพฤติกรรม รางวัลและเกียรติบัตร (ไม่เห็นเบอร์โทรหรือข้อความจากครู) ข้อมูลอัปเดตให้อัตโนมัติขณะครูเปิดแอป หรือกด “อัปเดตตอนนี้”</div>' +
      '<div class="note warn">ใครมีลิงก์ก็เปิดดูได้ จึงควรส่งให้ผู้ปกครองโดยตรงเท่านั้น หากหลุดให้กด “ยกเลิก” แล้วสร้างลิงก์ใหม่ สมาชิกที่ถูกนำออกจากชมรมจะถูกยกเลิกลิงก์อัตโนมัติ</div>' +
      '<div class="row wrap"><button class="btn gold" data-act="gdMake">สร้างลิงก์ให้ทุกคนที่ยังไม่มี (' + (list.length - has) + ')</button><button class="btn ghost" data-act="gdSync">อัปเดตข้อมูลตอนนี้</button></div><div class="muted" style="margin-top:8px">มีลิงก์แล้ว ' + has + ' / ' + list.length + ' คน</div></section>';
    b += '<section class="card">' + (list.map(s => '<div class="mrow"><span class="mrow-main">' + A.avatar(ms[s]) + '<span class="grow"><b>' + esc(A.fullName(ms[s])) + '</b><span class="muted">' + esc(A.cls(ms[s])) + '</span></span></span><span class="mrow-act">' +
      (t[s] ? '<button class="btn ghost sm" data-act="gdCopy" data-t="' + esc(t[s]) + '">คัดลอก</button><button class="btn ghost sm" data-act="gdShare" data-t="' + esc(t[s]) + '" data-sid="' + esc(s) + '">ส่ง</button><button class="btn ghost sm danger" data-act="gdRevoke" data-sid="' + esc(s) + '">ยกเลิก</button>' : '<button class="btn sm" data-act="gdOne" data-sid="' + esc(s) + '">สร้างลิงก์</button>') + '</span></div>').join('') || '<div class="empty">ยังไม่มีสมาชิก</div>') + '</section>';
    return { title: 'โหมดผู้ปกครอง', body: b };
  };
  /* ---------- นักเรียน: ส่งลิงก์ต่อให้ผู้ปกครอง ---------- */
  A.HOME.push({ order: 96, html: () => { const sid = A.sid(), tk = sid && toks()[sid]; return tk && !T() ? '<section class="card"><div class="lb">ลิงก์สำหรับผู้ปกครอง</div><div class="muted" style="margin-bottom:8px">ส่งให้ผู้ปกครองเปิดดู การมาซ้อม พฤติกรรม และรางวัลของคุณ โดยไม่ต้องล็อกอิน</div><div class="row wrap"><button class="btn sm" data-act="gdShare" data-t="' + esc(tk) + '" data-sid="' + esc(sid) + '">ส่งลิงก์ให้ผู้ปกครอง</button><button class="btn ghost sm" data-act="gdCopy" data-t="' + esc(tk) + '">คัดลอกลิงก์</button></div></section>' : ''; } });

  Object.assign(A.ACT, {
    gdMake: async () => { try {
      if (!T()) return; if (!A.assess) return toast('ไฟล์ behave.js ยังเป็นรุ่นเก่า — อัปโหลด behave.js รุ่น 3.2 แล้วเปิดแอปใหม่', 8000); if (A.STATUS.online === false) return toast('ต้องออนไลน์จึงจะสร้างลิงก์ได้', 4000);
      const t = toks(), upd = {}, made = {}; let n = 0; A.activeSids().forEach(s => { if (t[s]) return; const tk = newToken(), sn = snap(s); upd['gtok/' + s] = tk; sn.at = Date.now(); upd['/pview/' + tk] = sn; made[tk] = JSON.stringify(snap(s)); n++; });
      if (!n) return toast('ทุกคนมีลิงก์แล้ว (ถ้ายังไม่เห็นปุ่มคัดลอก ให้รีเฟรชหน้า)', 4000);
      toast('กำลังสร้างลิงก์ ' + n + ' คน …', 6000);
      await B.update('', upd); Object.assign(SENT, made); toast('สร้างลิงก์ ' + n + ' คนแล้ว', 3500); A.rerender();
    } catch (e) { console.error(e); toast('สร้างลิงก์ไม่สำเร็จ: ' + (A.errTH(e) || e.message) + ' — ตรวจว่าวาง database.rules.json รุ่นล่าสุดใน Firebase แล้ว', 9000); } },
    gdOne: async d => { try {
      if (!T()) return; if (!A.assess) return toast('ไฟล์ behave.js ยังเป็นรุ่นเก่า — อัปโหลด behave.js รุ่น 3.2', 8000); if (A.STATUS.online === false) return toast('ต้องออนไลน์จึงจะสร้างลิงก์ได้', 4000);
      const tk = newToken(), sn = snap(d.sid); sn.at = Date.now(); await B.update('', { ['gtok/' + d.sid]: tk, ['/pview/' + tk]: sn }); SENT[tk] = JSON.stringify(snap(d.sid)); toast('สร้างลิงก์แล้ว'); A.rerender();
    } catch (e) { console.error(e); toast('สร้างลิงก์ไม่สำเร็จ: ' + (A.errTH(e) || e.message) + ' — ตรวจว่าวาง database.rules.json รุ่นล่าสุดใน Firebase แล้ว', 9000); } },
    gdSync: async () => { try { if (!T()) return; if (A.STATUS.online === false) return toast('ต้องออนไลน์', 3000); const n = syncAll(true); toast(n ? 'อัปเดตข้อมูลผู้ปกครอง ' + n + ' คนแล้ว' : 'ยังไม่มีลิงก์ให้อัปเดต'); } catch (e) { console.error(e); toast('อัปเดตไม่สำเร็จ: ' + (e.message || e), 7000); } },
    gdCopy: async d => { const l = linkOf(d.t); try { await navigator.clipboard.writeText(l); toast('คัดลอกลิงก์แล้ว'); } catch (e) { modal('<h3>ลิงก์สำหรับผู้ปกครอง</h3><textarea class="in" rows="3" readonly>' + esc(l) + '</textarea><button class="btn ghost block" data-close style="margin-top:12px">ปิด</button>', { center: true }); } },
    gdShare: async d => { const l = linkOf(d.t), m = A.members()[d.sid]; if (navigator.share) { try { await navigator.share({ title: 'ข้อมูลของ ' + (m ? m.first : 'นักเรียน') + ' ชมรม' + C.club.name, text: 'ดูการมาซ้อม พฤติกรรม และรางวัลของ ' + (m ? A.fullName(m) : 'นักเรียน') + ' (ชมรม' + C.club.name + ')', url: l }); return; } catch (e) { if (e && e.name === 'AbortError') return; } } A.ACT.gdCopy(d); },
    gdRevoke: async d => { if (!T()) return; const tk = toks()[d.sid]; if (!tk || !(await M.confirmBox('ยกเลิกลิงก์ผู้ปกครอง', 'ลิงก์เดิมจะเปิดไม่ได้อีก (สร้างลิงก์ใหม่ได้ภายหลัง)', 'ยกเลิกลิงก์', true))) return; delete SENT[tk]; A.W(B.update('', { ['gtok/' + d.sid]: null, ['/pview/' + tk]: null })); }
  });

  /* ============ หน้าสาธารณะ ?g=รหัส ============ */
  const prev = window.APP_PUBLIC;
  window.APP_PUBLIC = async function () {
    const t = new URLSearchParams(location.search).get('g'); if (t === null) return prev ? prev() : false;
    const root = $('#root'), page = h => { root.innerHTML = '<div class="pub"><div class="pub-in">' + h + '</div></div>'; };
    if (!/^[a-z0-9]{12,40}$/.test(t)) { page('<h1>ลิงก์ไม่ถูกต้อง</h1>'); return true; }
    try { await B.init(); } catch (e) { page('<h1>เชื่อมต่อระบบไม่สำเร็จ</h1><p>ตรวจอินเทอร์เน็ตแล้วเปิดลิงก์ใหม่</p>'); return true; }
    let s = null; try { s = await B.get('pview/' + t); } catch (e) { s = null; }
    if (!s) { page('<h1>ไม่พบข้อมูล</h1><p>ลิงก์อาจถูกยกเลิกแล้ว หรือครูยังไม่ได้อัปเดตข้อมูล กรุณาติดต่อครูที่ปรึกษาชมรม</p>'); return true; }
    document.documentElement.dataset.club = s.cid; document.title = 'ข้อมูลของ ' + s.name; B.setScope(s.cid);
    const LV = { ok: 'ok', blue: 'blue', gold: 'gold', bad: 'bad' }, ST = { p: ['มา', 'ok'], l: ['สาย', 'gold'], v: ['ลา', 'blue'], a: ['ขาด', 'bad'] }, SES = { am: 'เช้า', pm: 'เย็น' }, a = s.att || {}, lvN = n => (A.assess.lv(n) || [0, '-', 'line']);
    let h = '<div class="pub-head"><img' + (s.round ? ' class="round"' : '') + ' src="' + esc(s.logo) + '" alt=""><div><b>' + esc(s.name) + '</b><span>' + esc(s.cls + ' · ' + s.club) + '</span></div></div>' +
      '<div class="muted" style="margin-bottom:10px">ปีการศึกษา ' + esc(s.y) + ' · ข้อมูล ณ ' + esc(M.thDate(s.at)) + ' ' + esc(new Date(s.at).toTimeString().slice(0, 5)) + ' น. · ดูได้อย่างเดียว</div>';
    h += '<section class="card"><div class="lb">การมาซ้อม</div>' + (a.n ? '<div class="stat4"><div><b class="ok">' + a.p + '</b><span>มา</span></div><div><b class="gold">' + a.l + '</b><span>สาย</span></div><div><b class="blue">' + a.v + '</b><span>ลา</span></div><div><b class="bad">' + a.a + '</b><span>ขาด</span></div></div><div class="muted" style="margin-top:8px">มาซ้อม ' + a.pct + '% ของ ' + a.n + ' ครั้งที่ถูกเช็ก</div>' +
      '<div class="lb" style="margin-top:12px">ล่าสุด</div>' + (a.recent || []).slice(0, 10).map(r => '<div class="li"><div class="row"><span class="grow">' + esc(A.dTH(r.d, 'short') + ' · ช่วง' + (SES[r.s] || '')) + '</span>' + chip(ST[r.v][0], ST[r.v][1]) + '</div></div>').join('') : '<div class="muted">ยังไม่มีข้อมูลการเช็กซ้อม</div>') + '</section>';
    const bh = s.bh; h += '<section class="card"><div class="row"><div class="lb grow" style="margin:0 0 8px">พฤติกรรม</div>' + (bh ? chip(bh.score.toFixed(2) + ' / 4 · ' + bh.level, LV[bh.k] || 'line') : '') + '</div>' + (bh ? (bh.f !== null ? '<div class="kv"><span>ความตั้งใจในการซ้อม (เฉลี่ย 1–3)</span><b>' + bh.f.toFixed(2) + '</b></div>' : '') + (bh.weeks || []).map(w => '<div class="li"><div class="row"><span class="grow">สัปดาห์ ' + esc(A.dTH(w.w, 'short')) + '</span>' + chip(lvN(w.s)[1], lvN(w.s)[2]) + '</div></div>').join('') : '<div class="muted">ยังไม่มีผลประเมิน</div>') + '</section>';
    h += '<section class="card"><div class="lb">รางวัลและเกียรติยศ</div>' + ((s.aw || []).map(x => '<div class="li"><div class="row"><b class="grow">' + esc(x.t) + '</b><span class="muted">' + esc(M.thDate(x.d)) + '</span></div></div>').join('') || '<div class="muted">ยังไม่มีรางวัล</div>') + ((s.ce || []).length ? '<div class="lb" style="margin-top:12px">เกียรติบัตร</div>' + s.ce.map(x => '<div class="li"><div class="row"><span class="grow">' + esc(x.t) + '</span><span class="muted">' + esc('เลขที่ ' + x.no) + '</span></div></div>').join('') : '') + '</section>';
    if ((s.insts || []).length) h += '<section class="card"><div class="lb">เครื่องดนตรี</div>' + s.insts.map(i => '<div class="kv"><span>' + esc(i.n) + '</span><b>' + esc(i.l || 'ยังไม่ประเมิน') + '</b></div>').join('') + '</section>';
    h += '<section class="card"><details class="yr" id="g-rules"><summary>ข้อตกลงและกฎระเบียบชมรม</summary><div id="g-rb" class="muted">กำลังโหลด…</div></details></section>';
    page(h);
    $('#g-rules').addEventListener('toggle', async e => { if (!e.target.open || e.target.dataset.done) return; e.target.dataset.done = '1'; try { const ci = await A.clubInfoLoad(); $('#g-rb').innerHTML = ci.secs.length ? A.clubInfoHTML(ci.secs, ci.poster) : 'ไม่มีข้อมูล'; } catch (er) { $('#g-rb').textContent = 'โหลดไม่ได้'; } });
    return true;
  };
  A.MANAGE.push(() => '<section class="card"><div class="lb">โหมดผู้ปกครอง</div><div class="muted" style="margin-bottom:10px">สร้างลิงก์ให้ผู้ปกครองดูการมาซ้อม พฤติกรรม และรางวัลของลูก โดยไม่ต้องล็อกอิน</div><a class="btn" href="#/guardian">จัดการลิงก์ผู้ปกครอง</a></section>');
})();
