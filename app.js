/* ============================================================
   app.js — หน้าจอและการทำงานของแอปสรรพวาทิต (ขั้นที่ 1)
   ล็อกอิน · ทะเบียนสมาชิก · ตำแหน่งและสิทธิ์ · รอบซ้อม · ที่ปรึกษา · แผนผัง · ระดับฝีมือ · ส่งออก
   รูปแบบ: สร้าง HTML ทั้งหน้า → innerHTML (ข้ามเมื่อไม่เปลี่ยน) · ปุ่มใช้ data-act → ตาราง ACT
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, C = M.C;
  const { $, $$, esc, toast, modal, thNum } = M;
  let USER = null, ME = null, D = {}, LOADED = {}, OFFS = [], YOFFS = [], SIG = '', STATUS = {}, lastHTML = '', lastRoute = '';
  const SUBS = [], HOME = [], NAVS = [], TODO = [];   /* โมดูลอื่นลงทะเบียนเพิ่มผ่าน window.APP */
  const UI = { q: '', type: '', ses: '', grade: '' };
  const RULES_V = 3;   /* ★ เพิ่มเลขนี้พร้อมกับ rulesProbe ใน database.rules.json ทุกครั้งที่แก้ Rules */

  /* ---------- ไอคอน (เส้น) ---------- */
  const ICON = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    chart: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
    cog: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M15 15h3"/>',
    vote: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 12l3 3 5-6"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    band: '<circle cx="12" cy="6" r="2.5"/><circle cx="5" cy="13" r="2.5"/><circle cx="19" cy="13" r="2.5"/><circle cx="9" cy="19" r="2"/><circle cx="15" cy="19" r="2"/>',
    book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
    cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    left: '<path d="M14 6l-6 6 6 6"/>', right: '<path d="M10 6l6 6-6 6"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    me: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
    trash: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    down: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
    up: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
    star: '<path d="M12 4l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8z"/>',
    badge: '<circle cx="12" cy="9" r="5"/><path d="M9 13.5L7.5 21l4.5-2.5 4.5 2.5-1.5-7.5"/>'
  };
  const ic = (n, s) => '<svg class="ic" width="' + (s || 22) + '" height="' + (s || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[n] + '</svg>';

  /* ---------- ตัวช่วยข้อมูล ---------- */
  const members = () => D.members || {};
  const cfg = () => D.config || {};
  const year = () => cfg().year || C.club.year;
  const instList = () => (Array.isArray(cfg().instruments) && cfg().instruments.length ? cfg().instruments : C.instruments);
  const activeSids = () => Object.keys(members()).filter(s => members()[s] && members()[s].status === 'active');
  const fullName = m => (m.prefix || '') + (m.first || '') + ' ' + (m.last || '');
  const cls = m => m.grade ? 'ม.' + m.grade + '/' + (m.room || '-') : '-';
  const typeName = id => { const t = C.memberTypes.find(x => x.id === id); return t ? t.name : '-'; };
  const roleOf = sid => (D.roles || {})[sid] || null;
  const roleName = r => { if (!r) return ''; if (r.role === 'rep') return 'กรรมการ ม.' + r.grade; const x = C.roles.find(y => y.id === r.role); return x ? x.name : ''; };
  const insts = m => Object.keys((m && m.inst) || {});
  const lvOf = (sid, i) => { const s = ((D.skills || {})[sid] || {})[i]; return s && s.lv ? s.lv : 0; };
  const lvName = n => n ? C.levels[n - 1] : 'ยังไม่ประเมิน';
  const topLv = sid => Math.max(0, ...insts(members()[sid]).map(i => lvOf(sid, i)));
  const byClass = (a, b) => (members()[a].grade || 9) - (members()[b].grade || 9) || (members()[a].room || 0) - (members()[b].room || 0) || a.localeCompare(b);
  const ROLE_ORDER = ['president', 'vice', 'treasurer', 'secretary', 'rep'];
  const avatar = (m, c) => m && m.photo ? '<img class="av ' + (c || '') + '" src="' + esc(m.photo) + '" alt="">' : '<span class="av ' + (c || '') + '" aria-hidden="true">' + esc(((m && (m.first || m.name)) || '?').replace(/^(ครู|พ่อครู|แม่ครู|นาย|นางสาว|นาง)/, '').trim().charAt(0) || '?') + '</span>';
  const sesText = m => m.am && m.pm ? 'ซ้อมเช้าและเย็น' : m.am ? 'ซ้อมเช้า' : m.pm ? 'ซ้อมเย็น' : 'ยังไม่กำหนดรอบซ้อม';
  const advisors = () => Object.keys(cfg().advisors || {}).map(id => Object.assign({ id }, cfg().advisors[id])).sort((a, b) => (a.order || 99) - (b.order || 99));
  const myName = () => ME.teacher ? ((advisors().find(a => (a.email || '').toLowerCase() === ME.email) || {}).name || USER.name || 'ครู') : fullName(members()[ME.sid] || {});
  const by = () => ({ id: ME.teacher ? 'teacher' : ME.sid, name: myName() });
  const errTH = e => { const c = String((e && (e.code || e.message)) || e || ''); return /PERMISSION_DENIED|permission_denied/i.test(c) ? 'ฐานข้อมูลไม่อนุญาต (สิทธิ์ไม่พอ หรือ Rules ในฐานข้อมูลยังไม่ใช่รุ่นล่าสุด)' : /network|disconnect|offline/i.test(c) ? 'เครือข่ายขัดข้อง' : c; };
  const W = p => Promise.resolve(p).catch(e => { console.warn('write failed', e); toast('บันทึกไม่สำเร็จ: ' + errTH(e) + ' — แตะป้ายมุมขวาบนเพื่อดูรายละเอียด', 6000); });
  const log = (act, sid, detail) => W(B.set('history/' + B.uid(), { at: Date.now(), by: by(), act, sid: sid || '', detail: detail || '' }));

  /* ---------- สิทธิ์ (ฝั่งหน้าจอ — ของจริงบังคับที่ database.rules.json) ---------- */
  function refreshMe() {
    if (ME.teacher) return;
    const r = roleOf(ME.sid); ME.role = r ? r.role : ''; ME.roleGrade = r ? r.grade : 0;
  }
  const can = {
    edit: () => ME.teacher || ME.role === 'secretary',
    manage: () => ME.teacher,
    exp: () => ME.teacher || ['secretary', 'president', 'vice'].includes(ME.role),
    priv: sid => ME.teacher || ME.role === 'secretary' || ME.sid === sid || (ME.role === 'rep' && members()[sid] && +members()[sid].grade === +ME.roleGrade)
  };

  /* ============ ล็อกอิน ============ */
  function brand(big) { return '<img class="logo ' + (big ? 'big' : '') + '" src="icons/logo-256.png" alt="ตราชมรมสรรพวาทิต">'; }
  function renderLogin(msg) {
    lastHTML = '';
    $('#root').innerHTML = '<div class="login"><div class="login-card">' + brand(true) +
      '<h1>' + esc(C.club.name) + '</h1><div class="login-sub">' + esc(C.club.full) + '</div>' +
      (M.inAppBrowser() ? '<div class="note warn">กำลังเปิดในแอป LINE/Facebook ซึ่งล็อกอินด้วย Google ไม่ได้ — กดเมนู ⋯ แล้วเลือก “เปิดใน Safari/Chrome”</div>' : '') +
      (msg ? '<div class="note bad">' + msg + '</div>' : '') +
      '<button class="btn gold block lg" data-act="signin">เข้าสู่ระบบด้วยอีเมลโรงเรียน</button>' +
      '<div class="muted" style="margin-top:12px">นักเรียนใช้อีเมล เลขประจำตัว@' + esc(C.auth.domain) + '</div>' +
      (B.mode === 'demo' ? '<div class="note">โหมดสาธิต: ข้อมูลเป็นชื่อสมมติและเก็บในเบราว์เซอร์นี้เท่านั้น</div>' : '') +
      '<div class="login-foot">รุ่น ' + esc(C.version) + '</div></div></div>';
  }
  function renderDenied(kind, sid) {
    const t = kind === 'domain' ? 'บัญชี ' + esc(USER.email) + ' ไม่ใช่อีเมลโรงเรียน (@' + esc(C.auth.domain) + ') และไม่ได้เป็นครูที่ปรึกษาในระบบ'
      : 'เลขประจำตัว ' + esc(sid) + ' ยังไม่มีชื่อในทะเบียนสมาชิกชมรม — แจ้งครูที่ปรึกษาหรือเลขานุการให้เพิ่มชื่อก่อน';
    lastHTML = '';
    $('#root').innerHTML = '<div class="login"><div class="login-card">' + brand(true) + '<h1>เข้าใช้งานไม่ได้</h1><div class="note bad">' + t + '</div><button class="btn ghost block" data-act="signout">ออกจากระบบ / เปลี่ยนบัญชี</button></div></div>';
  }
  async function onAuth(u) {
    OFFS.forEach(f => f()); OFFS = []; YOFFS.forEach(f => f()); YOFFS = []; SIG = ''; D = {}; LOADED = {}; USER = u; ME = null;
    if (!u) return renderLogin(B.authError ? esc(B.authErrorText(B.authError)) : '');
    if (u.verified === false) return renderDenied('domain');
    let teacher = B.isBootTeacher(u.email); const sid = B.sidFromEmail(u.email);
    if (!teacher && !sid) { try { teacher = !!(await B.get('teachers/' + B.emailKey(u.email))); } catch (e) { teacher = false; } }
    if (teacher) ME = { teacher: true, email: u.email };
    else {
      if (!sid) return renderDenied('domain');
      let m = null; try { m = await B.get('members/' + sid); } catch (e) { m = null; }
      if (!m || m.status !== 'active') return renderDenied('nomember', sid);
      ME = { teacher: false, sid, email: u.email, role: '' };
    }
    B.get('rulesProbe/v' + RULES_V).then(() => { D.rulesOld = false; }).catch(() => { D.rulesOld = true; lastHTML = ''; render(); });   /* ตรวจว่า Rules ในฐานข้อมูลเป็นรุ่นเดียวกับแอป */
    const paths = ['config', 'members', 'roles', 'skills'];
    paths.forEach(k => OFFS.push(B.on(k, v => { D[k] = v || {}; LOADED[k] = true; render(); }, e => { LOADED[k] = true; D[k] = D[k] || {}; console.warn('read ' + k, e); render(); })));
    $('#root').innerHTML = '<div class="empty" style="padding-top:30vh">' + brand(true) + '<br>กำลังโหลดข้อมูล…</div>';
  }

  /* ============ โครงหน้า ============ */
  const route = () => { const h = (location.hash || '#/home').replace(/^#\/?/, '').split('/'); return { name: h[0] || 'home', arg: h[1] ? decodeURIComponent(h[1]) : '', arg2: h[2] ? decodeURIComponent(h[2]) : '' }; };
  NAVS.push({ id: 'home', label: 'หน้าหลัก', icon: 'home', tab: 1, order: 10 }, { id: 'members', label: 'สมาชิก', icon: 'users', tab: 1, order: 40, match: ['m'] },
    { id: 'chart', label: 'แผนผัง', icon: 'chart', order: 50 }, { id: 'manage', label: 'จัดการ', icon: 'cog', order: 90, show: () => can.manage() }, { id: 'me', label: 'ฉัน', icon: 'me', order: 95 },
    { id: 'more', label: 'เพิ่มเติม', icon: 'grid', tab: 1, tabOnly: 1, order: 99 });
  function navItems() { return NAVS.filter(n => !n.show || n.show()).sort((a, b) => a.order - b.order); }
  /* สมัครรับข้อมูลรายปี/ตามบทบาทของโมดูลต่าง ๆ — สมัครใหม่เมื่อปีการศึกษาหรือตำแหน่งของผู้ใช้เปลี่ยน */
  function resub() {
    YOFFS.forEach(f => f()); YOFFS = [];
    SUBS.forEach(sb => {
      const p = sb.path(year()); D[sb.key] = {}; if (!p) return;
      YOFFS.push(B.on(p, v => { D[sb.key] = sb.norm ? sb.norm(v || {}) : (v || {}); render(); }, e => { console.warn('read ' + p, e && e.code); }));
    });
  }
  function syncBadge() {
    if (STATUS.failed) return '<button class="sync bad" data-act="syncInfo">ส่งไม่สำเร็จ ' + STATUS.failed + ' · ดูรายละเอียด</button>';
    if (STATUS.pending) return '<button class="sync pend" data-act="syncInfo">กำลังส่ง ' + STATUS.pending + '</button>';
    if (STATUS.online === false) return '<span class="sync pend">ออฟไลน์</span>';
    return '<span class="sync ok">บันทึกแล้ว</span>';
  }
  function shell(r, title, body, back) {
    const nav = navItems(); const cur = (nav.find(n => n.id === r.name || (n.match || []).includes(r.name)) || {}).id || 'more';
    const side = nav.filter(n => !n.tabOnly), tabs = nav.filter(n => n.tab);
    return '<div class="app">' +
      '<aside class="side"><div class="side-brand">' + brand() + '<div><div class="side-name">' + esc(C.club.name) + '</div><div class="side-sub">' + (ME.teacher ? 'ครูที่ปรึกษา' : esc(roleName(roleOf(ME.sid)) || 'สมาชิก')) + '</div></div></div>' +
      '<div class="side-nav">' + side.map(n => '<a class="side-link' + (cur === n.id ? ' on' : '') + '" href="#/' + n.id + '">' + ic(n.icon) + n.label + (n.badge && n.badge() ? '<span class="bdg">' + n.badge() + '</span>' : '') + '</a>').join('') + '</div>' +
      '<div class="grow"></div><div class="side-foot"><img src="icons/school-logo.png" alt="ตราโรงเรียนสรรพวิทยาคม"><div>' + esc(C.club.school) + '<br>ปีการศึกษา ' + esc(year()) + '</div></div></aside>' +
      '<div class="main"><header class="topbar">' + (back ? '<a class="tb-back" href="' + back + '" aria-label="กลับ">' + ic('back') + '</a>' : '<span class="tb-logo">' + brand() + '</span>') +
      '<h1>' + esc(title) + '</h1>' + syncBadge() + '</header>' +
      (B.mode === 'demo' ? '<div class="demo-bar">โหมดสาธิต · ข้อมูลสมมติ เก็บในเบราว์เซอร์นี้เท่านั้น</div>' : '') +
      (D.rulesOld && ME.teacher ? '<div class="demo-bar bad">Rules ในฐานข้อมูลยังเป็นรุ่นเก่า บางเมนูจะบันทึกไม่ได้ — คัดลอกไฟล์ database.rules.json ไปวางที่ Firebase Console › Realtime Database › Rules แล้วกด Publish</div>' : '') +
      '<main class="page">' + body + '</main></div>' +
      '<nav class="tabbar" aria-label="เมนูหลัก">' + tabs.map(n => '<a class="' + ((n.id === 'more' ? !tabs.some(t => t.id === cur) || cur === 'more' : cur === n.id) ? 'on' : '') + '" href="#/' + n.id + '">' + ic(n.icon, 24) + '<span>' + n.label + '</span></a>').join('') + '</nav></div>';
  }
  function render() {
    if (!ME) return;
    if (!['config', 'members', 'roles', 'skills'].every(k => LOADED[k])) return;
    if (!ME.teacher && (!members()[ME.sid] || members()[ME.sid].status !== 'active')) { OFFS.forEach(f => f()); OFFS = []; return renderDenied('nomember', ME.sid); }
    refreshMe();
    const r = route(); const key = r.name + '/' + r.arg;
    const sig = year() + '|' + (ME.teacher ? 'T' : ME.sid + ':' + ME.role + ':' + ME.roleGrade);
    if (sig !== SIG) { SIG = sig; resub(); }
    if (!V[r.name] || (r.name === 'manage' && !can.manage())) { location.hash = '#/home'; return; }
    const out = V[r.name](r.arg, r); if (!out) return;
    const html = shell(r, out.title, out.body, out.back);
    if (html === lastHTML) return;
    const keep = document.activeElement && document.activeElement.id === 'q';
    $('#root').innerHTML = html; lastHTML = html;
    if (keep) { const q = $('#q'); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }
    if (key !== lastRoute) { lastRoute = key; window.scrollTo(0, 0); }
  }

  /* ============ ชิ้นส่วนที่ใช้ซ้ำ ============ */
  const chip = (t, c) => t ? '<span class="chip ' + (c || '') + '">' + esc(t) + '</span>' : '';
  function lvBar(n) { return '<div class="lvbar" role="img" aria-label="ระดับ ' + n + ' จาก 8"><i style="width:' + (n / 8 * 100) + '%"></i></div>'; }
  function sesToggle(sid, m) {
    return '<div class="ses" role="group" aria-label="รอบซ้อม">' +
      ['am', 'pm'].map(k => '<button class="tg' + (m[k] ? ' on' : '') + '" aria-pressed="' + (m[k] ? 'true' : 'false') + '" data-act="toggle" data-sid="' + esc(sid) + '" data-k="' + k + '">' + (k === 'am' ? 'เช้า' : 'เย็น') + '</button>').join('') + '</div>';
  }
  function memberRow(sid) {
    const m = members()[sid], r = roleOf(sid), lv = topLv(sid);
    return '<div class="mrow"><a class="mrow-main" href="#/m/' + esc(sid) + '">' + avatar(m) +
      '<span class="grow"><b>' + esc(fullName(m)) + '</b><span class="muted">' + esc(cls(m) + ' · ' + typeName(m.type) + (insts(m).length ? ' · ' + insts(m).join(', ') : '')) + '</span></span></a>' +
      '<span class="mrow-tags">' + chip(roleName(r), 'plum') + chip(lv ? lvName(lv) : '', 'gold') + '</span>' +
      (can.manage() ? '<span class="mrow-ses">' + sesToggle(sid, m) + '</span>' : '<span class="mrow-ses ro">' + chip(m.am ? 'เช้า' : '', 'line') + chip(m.pm ? 'เย็น' : '', 'line') + '</span>') +
      (can.edit() ? '<span class="mrow-act"><button class="icb" data-act="editMember" data-sid="' + esc(sid) + '" aria-label="แก้ไขข้อมูล ' + esc(m.first) + '">' + ic('edit', 20) + '</button>' +
        (can.manage() ? '<button class="icb danger" data-act="removeMember" data-sid="' + esc(sid) + '" aria-label="นำ ' + esc(m.first) + ' ออก">' + ic('trash', 20) + '</button>' : '') + '</span>' : '') + '</div>';
  }

  /* ============ หน้าหลัก ============ */
  function viewHome() {
    const act = activeSids(); const ms = members();
    const nType = t => act.filter(s => ms[s].type === t).length;
    const unassessed = act.filter(s => !insts(ms[s]).length || insts(ms[s]).some(i => !lvOf(s, i))).length;
    let b = '';
    if (!ME.teacher) {
      const m = ms[ME.sid], r = roleOf(ME.sid);
      b += '<section class="card hero"><div class="row">' + avatar(m, 'xl ring') + '<div class="grow"><div class="hero-name">' + esc(fullName(m)) + '</div><div class="hero-sub">' + esc(cls(m) + ' · สมาชิก' + typeName(m.type) + ' · เลขประจำตัว ' + ME.sid) + '</div></div></div>' +
        '<div class="row wrap" style="margin-top:12px;gap:8px">' + chip(roleName(r) || 'สมาชิก', 'gold') + chip(sesText(m), 'dark') + '</div></section>';
      b += '<section class="card"><div class="lb">เครื่องดนตรีและระดับฝีมือของฉัน</div>' + (insts(m).length ? insts(m).map(i => skillLine(ME.sid, i, false)).join('') : '<div class="muted">ยังไม่ได้ระบุเครื่องดนตรี — แจ้งเลขานุการหรือครู</div>') + '</section>';
    } else {
      b += '<section class="card hero"><div class="row">' + brand() + '<div class="grow"><div class="hero-name">' + esc(C.club.name) + '</div><div class="hero-sub">' + esc(C.club.full) + ' · ปีการศึกษา ' + esc(year()) + '</div></div></div></section>';
    }
    b += '<div class="tiles">' +
      '<a class="tile" href="#/members"><div class="lb">สมาชิกปัจจุบัน</div><div class="num">' + act.length + '</div><div class="muted">เริ่มต้น ' + nType('start') + ' · สามัญ ' + nType('regular') + ' · วิสามัญ ' + nType('special') + '</div></a>' +
      '<div class="tile"><div class="lb">กำหนดซ้อมเช้า</div><div class="num">' + act.filter(s => ms[s].am).length + '</div><div class="muted">คน</div></div>' +
      '<div class="tile"><div class="lb">กำหนดซ้อมเย็น</div><div class="num">' + act.filter(s => ms[s].pm).length + '</div><div class="muted">คน</div></div>' +
      (ME.teacher ? '<a class="tile dark" href="#/members"><div class="lb">รอประเมินฝีมือ</div><div class="num">' + unassessed + '</div><div class="muted">คน</div></a>' : '<a class="tile dark" href="#/chart"><div class="lb">ที่ปรึกษาชมรม</div><div class="num">' + advisors().length + '</div><div class="muted">ท่าน</div></a>') + '</div>';
    if (ME.teacher || ME.role) { const td = TODO.map(f => { try { return f(); } catch (e) { return null; } }).filter(x => x && x.n > 0);
      if (td.length) b += '<section class="card"><div class="lb">งานที่รอ' + (ME.teacher ? 'ครู' : 'คุณ') + '</div>' + td.map(x => '<a class="todo" href="' + x.href + '"><b>' + x.n + '</b><span class="grow">' + esc(x.label) + '</span>' + ic('right', 20) + '</a>').join('') + '</section>'; }
    HOME.slice().sort((x, y) => x.order - y.order).forEach(h => { try { b += h.html() || ''; } catch (e) { console.error(e); } });
    if (can.edit()) b += '<section class="card"><div class="lb">ทางลัด</div><div class="row wrap">' +
      '<button class="btn" data-act="addMember">' + ic('plus', 18) + 'เพิ่มสมาชิก</button><button class="btn ghost" data-act="importMembers">' + ic('up', 18) + 'นำเข้ารายชื่อ</button><button class="btn ghost" data-act="exportMenu">' + ic('down', 18) + 'ส่งออกบอร์ด / รายชื่อ</button></div></section>';
    const noSes = act.filter(s => !ms[s].am && !ms[s].pm);
    if (ME.teacher && noSes.length) b += '<section class="card"><div class="lb">ยังไม่กำหนดรอบซ้อม ' + noSes.length + ' คน</div>' + noSes.sort(byClass).slice(0, 5).map(memberRow).join('') + '</section>';
    return { title: 'หน้าหลัก', body: b };
  }
  function skillLine(sid, inst, editable) {
    const n = lvOf(sid, inst);
    return '<div class="skill"><div class="row"><span class="grow"><b>' + esc(inst) + '</b></span>' + chip(lvName(n), n ? 'gold' : 'line') +
      (editable ? '<button class="btn sm ghost" data-act="skill" data-sid="' + esc(sid) + '" data-inst="' + esc(inst) + '">ประเมิน</button>' : '') + '</div>' + lvBar(n) + '</div>';
  }

  /* ============ แผนผัง ============ */
  function person(m, sub, c) { return '<div class="pp ' + (c || '') + '">' + avatar(m, 'lg') + '<b>' + esc(m.first ? fullName(m) : m.name) + '</b><span>' + esc(sub) + '</span></div>'; }
  function viewChart() {
    const act = activeSids(); const ms = members();
    const withRole = id => act.filter(s => (roleOf(s) || {}).role === id).sort(byClass);
    const link = (s, sub) => '<a class="pp-link" href="#/m/' + esc(s) + '">' + person(ms[s], sub) + '</a>';
    let b = '';
    if (can.exp()) b += '<div class="row wrap" style="margin-bottom:14px"><button class="btn" data-act="exportMenu">' + ic('down', 18) + 'ส่งออกบอร์ด / แผนผัง / รายชื่อ</button></div>';
    b += '<section class="card tree"><div class="lb light">ที่ปรึกษาชมรม</div><div class="tier">' + (advisors().map(a => person(a, a.position || (a.kind === 'expert' ? 'วิทยากรท้องถิ่น' : 'ครูที่ปรึกษา'), 'top')).join('') || '<span class="muted light">ยังไม่ได้ระบุที่ปรึกษา</span>') + '</div>' +
      '<div class="stem"></div><div class="tier">' + (withRole('president').map(s => link(s, 'ประธานชมรม')).join('') || '<span class="muted light">ยังไม่มีประธาน</span>') + '</div>' +
      '<div class="stem"></div><div class="tier">' + ['vice', 'treasurer', 'secretary'].map(id => withRole(id).map(s => link(s, roleName({ role: id }))).join('')).join('') + '</div>' +
      '<div class="lb light" style="margin-top:18px">กรรมการตัวแทนระดับชั้น</div><div class="tier reps">' + [1, 2, 3, 4, 5, 6].map(g => { const s = act.find(x => { const r = roleOf(x); return r && r.role === 'rep' && +r.grade === g; }); return s ? link(s, 'ม.' + g) : '<div class="pp vacant"><span class="av lg">–</span><b>ว่าง</b><span>ม.' + g + '</span></div>'; }).join('') + '</div></section>';
    const used = instList().filter(i => act.some(s => (ms[s].inst || {})[i]));
    b += '<section class="card"><div class="lb">สมาชิกตามเครื่องดนตรี</div>' + (used.length ? used.map(i => {
      const ps = act.filter(s => (ms[s].inst || {})[i]).sort((a, c) => lvOf(c, i) - lvOf(a, i) || byClass(a, c));
      return '<div class="igroup"><div class="igroup-h"><b>' + esc(i) + '</b><span class="muted">' + ps.length + ' คน</span></div><div class="row wrap" style="gap:6px">' + ps.map(s => '<a class="pill" href="#/m/' + esc(s) + '">' + esc(ms[s].first) + '<i>' + esc(lvOf(s, i) ? lvName(lvOf(s, i)) : 'ยังไม่ประเมิน') + '</i></a>').join('') + '</div></div>';
    }).join('') : '<div class="muted">ยังไม่มีข้อมูลเครื่องดนตรี</div>') + '</section>';
    b += '<section class="card"><div class="lb">ลำดับระดับฝีมือ 8 ขั้น</div><ol class="lvlist">' + C.levels.map(l => '<li>' + esc(l) + '</li>').join('') + '</ol></section>';
    return { title: 'แผนผังชมรม', body: b };
  }

  /* ============ สมาชิก ============ */
  function filtered() {
    const ms = members(); const q = UI.q.trim().toLowerCase();
    return activeSids().filter(s => {
      const m = ms[s];
      if (UI.type && m.type !== UI.type) return false;
      if (UI.ses && !m[UI.ses]) return false;
      if (UI.grade && +m.grade !== +UI.grade) return false;
      if (q && !(fullName(m) + ' ' + s + ' ' + insts(m).join(' ') + ' ' + roleName(roleOf(s)) + ' ' + cls(m)).toLowerCase().includes(q)) return false;
      return true;
    }).sort(byClass);
  }
  function listHTML() { const l = filtered(); return (l.map(memberRow).join('') || '<div class="empty">ไม่พบสมาชิกตามเงื่อนไข</div>') + '<div class="muted" style="padding:10px 0 2px">แสดง ' + l.length + ' จาก ' + activeSids().length + ' คน</div>'; }
  function viewMembers() {
    const sel = (k, opts) => '<select class="in sm" data-filter="' + k + '" aria-label="' + esc(opts[0][1]) + '">' + opts.map(o => '<option value="' + o[0] + '"' + (String(UI[k]) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select>';
    let b = '';
    if (can.edit()) b += '<div class="row wrap" style="margin-bottom:14px"><button class="btn" data-act="addMember">' + ic('plus', 18) + 'เพิ่มสมาชิก</button><button class="btn ghost" data-act="importMembers">' + ic('up', 18) + 'นำเข้ารายชื่อ</button><a class="btn ghost" href="#/join">' + ic('doc', 18) + 'ใบสมัครผ่านลิงก์</a>' + (can.exp() ? '<button class="btn ghost" data-act="exportMenu">' + ic('down', 18) + 'ส่งออก</button>' : '') + '</div>';
    b += '<section class="card"><div class="filters"><input id="q" class="in" type="search" placeholder="ค้นหาชื่อ เลขประจำตัว เครื่องดนตรี" value="' + esc(UI.q) + '" aria-label="ค้นหาสมาชิก">' +
      sel('type', [['', 'ทุกประเภท']].concat(C.memberTypes.map(t => [t.id, t.name]))) +
      sel('ses', [['', 'ทุกรอบซ้อม'], ['am', 'ซ้อมเช้า'], ['pm', 'ซ้อมเย็น']]) +
      sel('grade', [['', 'ทุกระดับชั้น']].concat([1, 2, 3, 4, 5, 6].map(g => [g, 'ม.' + g]))) + '</div>' +
      (can.manage() ? '<div class="muted" style="margin:10px 0 0">ปุ่ม เช้า / เย็น กำหนดรอบซ้อมประจำของสมาชิก รายชื่อในการเช็กการซ้อมจะเปลี่ยนตาม</div>' : '') +
      '<div id="mlist">' + listHTML() + '</div></section>';
    return { title: 'สมาชิกชมรม', body: b };
  }
  function viewMember(sid) {
    const m = members()[sid]; if (!m) { location.hash = '#/members'; return null; }
    const r = roleOf(sid); const gone = m.status !== 'active';
    let b = '<section class="card hero"><div class="row">' + avatar(m, 'xl ring') + '<div class="grow"><div class="hero-name">' + esc(fullName(m)) + '</div><div class="hero-sub">' + esc(cls(m) + ' · สมาชิก' + typeName(m.type) + ' · เลขประจำตัว ' + sid) + '</div></div></div>' +
      '<div class="row wrap" style="margin-top:12px;gap:8px">' + chip(gone ? (m.status === 'alumni' ? 'ศิษย์เก่า' : 'นำออกแล้ว') : (roleName(r) || 'สมาชิก'), 'gold') + chip(topLv(sid) ? 'ระดับ ' + lvName(topLv(sid)) : '', 'dark') + '</div></section>';
    if (can.edit() && !gone) b += '<div class="row wrap" style="margin-bottom:14px"><button class="btn" data-act="editMember" data-sid="' + esc(sid) + '">' + ic('edit', 18) + 'แก้ไขข้อมูล</button>' +
      (can.manage() ? '<button class="btn ghost" data-act="role" data-sid="' + esc(sid) + '">' + ic('badge', 18) + 'กำหนดตำแหน่ง</button><button class="btn ghost danger" data-act="removeMember" data-sid="' + esc(sid) + '">' + ic('trash', 18) + 'นำออก</button>' : '') + '</div>';
    b += '<section class="card"><div class="lb">รอบซ้อมประจำ</div>' + (can.manage() && !gone ? '<div class="row">' + sesToggle(sid, m) + '<span class="muted">' + esc(sesText(m)) + '</span></div>' : '<div>' + esc(sesText(m)) + '</div>') + '</section>';
    b += '<section class="card"><div class="lb">เครื่องดนตรีและระดับฝีมือ' + (can.manage() ? '' : ' (ครูเป็นผู้ประเมิน)') + '</div>' + (insts(m).length ? insts(m).map(i => skillLine(sid, i, can.manage() && !gone)).join('') : '<div class="muted">ยังไม่ได้ระบุเครื่องดนตรี' + (can.edit() ? ' — กด “แก้ไขข้อมูล” เพื่อเลือก' : '') + '</div>') + '</section>';
    if (can.priv(sid)) b += '<section class="card"><div class="lb">ข้อมูลติดต่อ (เห็นเฉพาะเจ้าตัว ครู เลขานุการ และกรรมการชั้นเดียวกัน)</div><div id="priv" data-sid="' + esc(sid) + '">' + privHTML(sid) + '</div></section>';
    return { title: m.first || 'สมาชิก', body: b, back: '#/members' };
  }
  const PRIV = {};
  function privHTML(sid) {
    const p = PRIV[sid];
    if (p === undefined) { PRIV[sid] = null; B.get('privateInfo/' + sid).then(v => { PRIV[sid] = v || {}; }).catch(() => { PRIV[sid] = { _err: 1 }; }).then(() => { lastHTML = ''; render(); }); return '<span class="muted">กำลังโหลด…</span>'; }
    if (p === null) return '<span class="muted">กำลังโหลด…</span>';
    if (p._err) return '<span class="muted">ไม่มีสิทธิ์อ่านข้อมูลนี้</span>';
    const line = (k, v) => '<div class="kv"><span>' + k + '</span><b>' + (v ? esc(v) : '<span class="muted">ยังไม่ระบุ</span>') + '</b></div>';
    return line('เบอร์โทรนักเรียน', p.phone) + line('ชื่อผู้ปกครอง', p.parentName) + line('เบอร์โทรผู้ปกครอง', p.parentPhone);
  }

  /* ============ ฉัน ============ */
  function viewMe() {
    let b = '<section class="card"><div class="lb">บัญชีที่ใช้อยู่</div><div class="row">' + (ME.teacher ? '<span class="av lg">ค</span>' : avatar(members()[ME.sid], 'lg')) + '<div class="grow"><b>' + esc(myName()) + '</b><div class="muted">' + esc(USER.email) + '</div></div></div>' +
      '<div class="row wrap" style="margin-top:14px">' + (!ME.teacher ? '<a class="btn" href="#/m/' + esc(ME.sid) + '">ดูข้อมูลของฉัน</a><button class="btn ghost" data-act="editSelf">' + ic('edit', 18) + 'แก้รูปและเบอร์โทร</button>' : '') + '<button class="btn ghost" data-act="signout">ออกจากระบบ</button></div></section>';
    b += '<section class="card"><div class="lb">ติดตั้งเป็นแอปบนหน้าจอโฮม</div><div class="muted">iPhone / iPad: เปิดด้วย Safari › ปุ่มแชร์ › “เพิ่มไปยังหน้าจอโฮม”<br>Android: เปิดด้วย Chrome › เมนู ⋮ › “ติดตั้งแอป” หรือ “เพิ่มลงในหน้าจอหลัก”</div></section>';
    const d = B.diagnostics();
    b += '<section class="card"><div class="lb">สถานะระบบ</div><div class="muted">รุ่น ' + esc(C.version) + ' · ' + (d.mode === 'demo' ? 'โหมดสาธิต' : 'เชื่อมต่อ Firebase') + ' · ' + (d.online ? 'ออนไลน์' : 'ออฟไลน์') + ' · รอส่ง ' + d.pending + ' · ล้มเหลว ' + d.failed + (d.standalone ? ' · เปิดจากหน้าจอโฮม' : '') + '</div></section>';
    return { title: 'ฉัน', body: b };
  }

  /* ============ จัดการ (ครู) ============ */
  function viewManage() {
    const ms = members(); const gone = Object.keys(ms).filter(s => ms[s] && ms[s].status !== 'active').sort();
    let b = '<section class="card"><div class="row" style="margin-bottom:6px"><div class="lb grow" style="margin:0">ที่ปรึกษาชมรม</div><button class="btn sm" data-act="addAdvisor">' + ic('plus', 16) + 'เพิ่มที่ปรึกษา</button></div>' +
      (advisors().map(a => '<div class="mrow">' + '<span class="mrow-main">' + avatar(a) + '<span class="grow"><b>' + esc(a.name) + '</b><span class="muted">' + esc((a.position || '') + (a.kind === 'teacher' ? ' · ' + (a.email || 'ยังไม่ระบุอีเมล') + ' · ล็อกอินได้ สิทธิ์สูงสุด' : ' · มีชื่อในแผนผังและเอกสาร ไม่มีบัญชีเข้าใช้')) + '</span></span></span>' +
        '<span class="mrow-tags">' + chip(a.kind === 'teacher' ? 'ครู' : 'วิทยากรท้องถิ่น', a.kind === 'teacher' ? 'gold' : 'plum') + '</span><span class="mrow-act"><button class="icb" data-act="editAdvisor" data-id="' + esc(a.id) + '" aria-label="แก้ไขที่ปรึกษา">' + ic('edit', 20) + '</button><button class="icb danger" data-act="removeAdvisor" data-id="' + esc(a.id) + '" aria-label="นำที่ปรึกษาออก">' + ic('trash', 20) + '</button></span></div>').join('') || '<div class="muted">ยังไม่มีรายชื่อที่ปรึกษา</div>') + '</section>';
    b += '<section class="card"><div class="lb">นำเข้าและส่งออก</div><div class="row wrap"><button class="btn ghost" data-act="importMembers">' + ic('up', 18) + 'นำเข้ารายชื่อ</button><button class="btn ghost" data-act="exportMenu">' + ic('down', 18) + 'ส่งออกบอร์ด / แผนผัง / รายชื่อ</button></div></section>';
    b += '<section class="card"><div class="lb">ตั้งค่า</div><div class="kv"><span>ปีการศึกษาปัจจุบัน</span><b>' + esc(year()) + '</b><button class="btn sm ghost" data-act="setYear">แก้ไข</button></div><div class="kv"><span>รายการเครื่องดนตรี</span><b>' + instList().length + ' ชนิด</b><button class="btn sm ghost" data-act="setInst">แก้ไข</button></div></section>';
    b += '<section class="card"><div class="lb">สมาชิกที่นำออกแล้ว / ศิษย์เก่า (' + gone.length + ')</div>' + (gone.map(s => '<div class="mrow"><a class="mrow-main" href="#/m/' + esc(s) + '">' + avatar(ms[s]) + '<span class="grow"><b>' + esc(fullName(ms[s])) + '</b><span class="muted">' + esc(s + ' · ' + ((C.removeReasons.find(x => x.id === ms[s].removedReason) || {}).name || 'นำออก') + ' · ' + M.thDate(ms[s].removedAt)) + '</span></span></a>' +
      '<span class="mrow-act"><button class="btn sm ghost" data-act="restore" data-sid="' + esc(s) + '">กู้คืน</button>' + (ms[s].removedReason === 'mistake' ? '<button class="btn sm ghost danger" data-act="purge" data-sid="' + esc(s) + '">ลบถาวร</button>' : '') + '</span></div>').join('') || '<div class="muted">ไม่มี</div>') + '</section>';
    MANAGE.forEach(f => { try { b += f() || ''; } catch (e) { console.error(e); } });
    if (B.mode === 'demo') b += '<section class="card"><div class="lb">โหมดสาธิต</div><div class="muted" style="margin-bottom:10px">ล้างแล้วเริ่มข้อมูลสมมติชุดใหม่ ไม่กระทบข้อมูลจริง</div><button class="btn ghost danger" data-act="resetDemo">ล้างข้อมูลสาธิต</button></section>';
    return { title: 'จัดการชมรม', body: b };
  }

  /* ============ ฟอร์ม ============ */
  const fld = (label, inner, hint) => '<label class="fld"><span>' + label + '</span>' + inner + (hint ? '<small>' + hint + '</small>' : '') + '</label>';
  const opt = (list, cur) => list.map(o => '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(cur) ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('');
  function memberForm(sid, selfOnly) {
    const isNew = !sid; const m = isNew ? { prefix: 'ด.ช.', type: 'start', inst: {} } : members()[sid]; const F = { photo: undefined, print: undefined };
    const teacher = can.manage();
    let h = '<h3>' + (isNew ? 'เพิ่มสมาชิก' : selfOnly ? 'แก้รูปและเบอร์โทร' : 'แก้ไขข้อมูลสมาชิก') + '</h3><form class="form" novalidate>';
    h += '<div class="row" style="margin-bottom:6px"><span id="f-av">' + avatar(m, 'xl') + '</span><div class="grow">' + fld('รูปสมาชิก', '<input class="in" type="file" accept="image/*" id="f-photo">', 'ระบบย่อและครอปเป็นสี่เหลี่ยมจัตุรัสให้อัตโนมัติ') + '</div></div>';
    if (!selfOnly) {
      h += (isNew ? fld('เลขประจำตัวนักเรียน', '<input class="in" id="f-sid" inputmode="numeric" autocomplete="off" required>', 'ใช้ผูกกับอีเมล เลขประจำตัว@' + esc(C.auth.domain) + ' แก้ภายหลังไม่ได้') : '<div class="kv"><span>เลขประจำตัว</span><b>' + esc(sid) + '</b></div>') +
        '<div class="g3">' + fld('คำนำหน้า', '<select class="in" id="f-prefix">' + opt(C.prefixes.map(p => [p, p]), m.prefix) + '</select>') + fld('ชื่อ', '<input class="in" id="f-first" value="' + esc(m.first || '') + '" required>') + fld('นามสกุล', '<input class="in" id="f-last" value="' + esc(m.last || '') + '" required>') + '</div>' +
        '<div class="g3">' + fld('ระดับชั้น', '<select class="in" id="f-grade">' + opt([1, 2, 3, 4, 5, 6].map(g => [g, 'ม.' + g]), m.grade || 1) + '</select>') + fld('ห้อง', '<input class="in" id="f-room" inputmode="numeric" value="' + esc(m.room || '') + '" required>') + fld('ประเภทสมาชิก', '<select class="in" id="f-type">' + opt(C.memberTypes.map(t => [t.id, t.name]), m.type) + '</select>') + '</div>' +
        '<div class="fld"><span>เครื่องดนตรีที่เล่นได้</span><div class="checks">' + instList().map(i => '<label class="ck"><input type="checkbox" name="inst" value="' + esc(i) + '"' + ((m.inst || {})[i] ? ' checked' : '') + '><span>' + esc(i) + '</span></label>').join('') + '</div></div>';
      if (teacher) h += '<div class="fld"><span>รอบซ้อมประจำ</span><div class="checks"><label class="ck"><input type="checkbox" id="f-am"' + (m.am ? ' checked' : '') + '><span>ซ้อมเช้า</span></label><label class="ck"><input type="checkbox" id="f-pm"' + (m.pm ? ' checked' : '') + '><span>ซ้อมเย็น</span></label></div></div>';
    }
    h += '<div class="lb" style="margin-top:14px">ข้อมูลติดต่อ (ไม่แสดงต่อสมาชิกทั่วไป)</div><div class="g3">' + fld('เบอร์โทรนักเรียน', '<input class="in" id="f-phone" inputmode="tel">') + (selfOnly ? '' : fld('ชื่อผู้ปกครอง', '<input class="in" id="f-pname">') + fld('เบอร์โทรผู้ปกครอง', '<input class="in" id="f-pphone" inputmode="tel">')) + '</div>';
    h += '<div class="note bad" id="f-err" hidden></div><div class="row" style="margin-top:16px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button type="submit" class="btn grow">บันทึก</button></div></form>';
    const w = modal(h, { sticky: true, wide: true });
    if (!isNew) B.get('privateInfo/' + sid).then(p => { p = p || {}; const s = (id, v) => { const e = $(id, w); if (e && !e.value) e.value = v || ''; }; s('#f-phone', p.phone); s('#f-pname', p.parentName); s('#f-pphone', p.parentPhone); }).catch(() => { });
    $('#f-photo', w).addEventListener('change', async e => {
      const f = e.target.files[0]; if (!f) return;
      try { F.photo = await M.fileToSquare(f, 160, 0.8); F.print = await M.fileToSquare(f, 640, 0.82); $('#f-av', w).innerHTML = '<img class="av xl" src="' + F.photo + '" alt="">'; } catch (er) { toast(er.message); }
    });
    $('form', w).addEventListener('submit', e => {
      e.preventDefault(); const v = id => { const el = $(id, w); return el ? el.value.trim() : ''; };
      const err = t => { const el = $('#f-err', w); el.textContent = t; el.hidden = false; };
      const id = isNew ? v('#f-sid') : sid; const now = Date.now();
      const priv = { phone: v('#f-phone') }; if (!selfOnly) { priv.parentName = v('#f-pname'); priv.parentPhone = v('#f-pphone'); }
      if (selfOnly) {
        if (F.photo) { W(B.update('members/' + id, { photo: F.photo, updatedAt: now, updatedBy: by() })); W(B.set('photos/' + id, F.print)); }
        W(B.update('privateInfo/' + id, priv)); delete PRIV[id]; w.remove(); toast('บันทึกแล้ว'); return;
      }
      if (isNew) {
        if (!new RegExp(C.auth.sidPattern).test(id)) return err('เลขประจำตัวต้องเป็นตัวเลข 4–8 หลัก');
        if (members()[id]) return err(members()[id].status === 'active' ? 'เลขประจำตัวนี้มีในทะเบียนแล้ว' : 'เลขประจำตัวนี้เคยถูกนำออก — กู้คืนได้ที่ จัดการ › สมาชิกที่นำออกแล้ว');
      }
      if (!v('#f-first') || !v('#f-last')) return err('กรอกชื่อและนามสกุล');
      if (!/^[0-9]{1,2}$/.test(v('#f-room'))) return err('ห้องต้องเป็นตัวเลข');
      const inst = {}; $$('input[name=inst]:checked', w).forEach(c => inst[c.value] = true);
      const rec = { prefix: v('#f-prefix'), first: v('#f-first'), last: v('#f-last'), grade: +v('#f-grade'), room: +v('#f-room'), type: v('#f-type'), inst };
      if (teacher) { rec.am = $('#f-am', w).checked; rec.pm = $('#f-pm', w).checked; }
      if (F.photo) rec.photo = F.photo;
      if (isNew) {
        W(B.set('members/' + id, Object.assign({ status: 'active', am: false, pm: false, createdAt: now, createdBy: by() }, rec))); log('member.add', id, fullName(rec));
      } else {
        const diff = {}; Object.keys(rec).forEach(k => { if (JSON.stringify(rec[k]) !== JSON.stringify(m[k] === undefined ? (k === 'inst' ? {} : undefined) : m[k])) diff[k] = k === 'inst' && !Object.keys(inst).length ? null : rec[k]; });
        if (Object.keys(diff).length) { diff.updatedAt = now; diff.updatedBy = by(); W(B.update('members/' + id, diff)); log('member.edit', id, Object.keys(diff).filter(k => !/^updated/.test(k)).join(',')); }
      }
      if (F.print) W(B.set('photos/' + id, F.print));
      if (priv.phone || priv.parentName || priv.parentPhone || !isNew) { W(B.update('privateInfo/' + id, priv)); delete PRIV[id]; }
      w.remove(); toast(isNew ? 'เพิ่มสมาชิกแล้ว' : 'บันทึกแล้ว');
    });
  }
  function roleForm(sid) {
    const m = members()[sid], r = roleOf(sid) || {};
    const w = modal('<h3>กำหนดตำแหน่ง</h3><div class="muted" style="margin-bottom:10px">' + esc(fullName(m)) + ' · ' + esc(cls(m)) + '</div><form class="form">' +
      fld('ตำแหน่งในชมรม', '<select class="in" id="r-role">' + opt([['', 'สมาชิก (ไม่มีตำแหน่ง)']].concat(C.roles.map(x => [x.id, x.name])), r.role || '') + '</select>') +
      '<div id="r-gw"' + (r.role === 'rep' ? '' : ' hidden') + '>' + fld('ตัวแทนระดับชั้น', '<select class="in" id="r-grade">' + opt([1, 2, 3, 4, 5, 6].map(g => [g, 'ม.' + g]), r.grade || m.grade || 1) + '</select>') + '</div>' +
      '<div class="muted">ตำแหน่งกำหนดสิทธิ์การเข้าถึงข้อมูล มีผลทันทีเมื่อบันทึก</div><div class="row" style="margin-top:16px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button type="submit" class="btn grow">บันทึก</button></div></form>', { center: true, sticky: true });
    $('#r-role', w).addEventListener('change', e => { $('#r-gw', w).hidden = e.target.value !== 'rep'; });
    $('form', w).addEventListener('submit', async e => {
      e.preventDefault(); const role = $('#r-role', w).value, grade = +$('#r-grade', w).value; const upd = {};
      if (!role) upd[sid] = null;
      else {
        const clash = role === 'vice' ? [] : Object.keys(D.roles || {}).filter(s => s !== sid && members()[s] && members()[s].status === 'active' && D.roles[s] && D.roles[s].role === role && (role !== 'rep' || +D.roles[s].grade === grade));
        if (clash.length && !(await M.confirmBox('มีผู้ดำรงตำแหน่งนี้อยู่แล้ว', esc(clash.map(s => fullName(members()[s])).join(', ')) + ' จะกลับเป็นสมาชิกทั่วไป ต้องการเปลี่ยนหรือไม่', 'เปลี่ยนตำแหน่ง'))) return;
        clash.forEach(s => upd[s] = null); upd[sid] = role === 'rep' ? { role, grade } : { role };
      }
      W(B.update('roles', upd)); log('role.set', sid, role ? roleName(upd[sid]) : 'สมาชิก'); w.remove(); toast('บันทึกตำแหน่งแล้ว');
    });
  }
  function skillForm(sid, inst) {
    const cur = lvOf(sid, inst);
    const w = modal('<h3>ประเมินระดับฝีมือ</h3><div class="muted" style="margin-bottom:10px">' + esc(fullName(members()[sid])) + ' · ' + esc(inst) + '</div><div class="lvpick">' +
      C.levels.map((l, i) => '<button class="lvopt' + (cur === i + 1 ? ' on' : '') + '" data-lv="' + (i + 1) + '"><i>' + (i + 1) + '</i>' + esc(l) + '</button>').join('') + '</div>' +
      '<div class="row" style="margin-top:14px"><button class="btn ghost grow" data-close>ยกเลิก</button>' + (cur ? '<button class="btn ghost grow danger" data-lv="0">ล้างการประเมิน</button>' : '') + '</div>', { center: true });
    w.addEventListener('click', e => {
      const b = e.target.closest('[data-lv]'); if (!b) return; const lv = +b.dataset.lv;
      W(lv ? B.set('skills/' + sid + '/' + inst, { lv, at: Date.now(), by: myName() }) : B.remove('skills/' + sid + '/' + inst));
      log('skill.set', sid, inst + ' → ' + lvName(lv)); w.remove(); toast(lv ? 'ประเมินเป็น “' + lvName(lv) + '” แล้ว' : 'ล้างการประเมินแล้ว');
    });
  }
  function removeForm(sid) {
    const m = members()[sid];
    const w = modal('<h3>นำสมาชิกออก</h3><div class="muted" style="margin-bottom:10px">' + esc(fullName(m)) + ' · ' + esc(cls(m)) + '</div><form class="form"><div class="fld"><span>เหตุผล</span>' +
      C.removeReasons.map((r, i) => '<label class="ck wide"><input type="radio" name="why" value="' + r.id + '"' + (i ? '' : ' checked') + '><span>' + esc(r.name) + '</span></label>').join('') + '</div>' +
      '<div class="muted">สมาชิกจะหายจากรายชื่อและเข้าแอปไม่ได้ แต่ประวัติยังอยู่ครบและกู้คืนได้ที่ จัดการ › สมาชิกที่นำออกแล้ว</div><div class="row" style="margin-top:16px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button type="submit" class="btn danger grow">นำออก</button></div></form>', { center: true, sticky: true });
    $('form', w).addEventListener('submit', e => {
      e.preventDefault(); const why = $('input[name=why]:checked', w).value;
      const upd = {}; upd['members/' + sid + '/status'] = why === 'graduate' ? 'alumni' : 'removed'; upd['members/' + sid + '/removedReason'] = why; upd['members/' + sid + '/removedAt'] = Date.now(); upd['members/' + sid + '/removedBy'] = by();
      if (why === 'graduate') upd['members/' + sid + '/gradYear'] = year();
      upd['roles/' + sid] = null;
      W(B.update('', upd)); log('member.remove', sid, why); w.remove(); toast('นำออกแล้ว');
      if (route().name === 'm') location.hash = '#/members';
    });
  }
  function advisorForm(id) {
    const a = id ? cfg().advisors[id] : { kind: 'teacher' }; let photo;
    const w = modal('<h3>' + (id ? 'แก้ไขที่ปรึกษา' : 'เพิ่มที่ปรึกษา') + '</h3><form class="form">' +
      fld('ชื่อ-สกุล (พร้อมคำนำหน้า)', '<input class="in" id="a-name" value="' + esc(a.name || '') + '" required>') +
      fld('ประเภท', '<select class="in" id="a-kind">' + opt([['teacher', 'ครู (ล็อกอินได้ สิทธิ์สูงสุด)'], ['expert', 'วิทยากรท้องถิ่น (มีแค่ชื่อ ไม่มีบัญชี)']], a.kind) + '</select>') +
      '<div id="a-ew"' + (a.kind === 'expert' ? ' hidden' : '') + '>' + fld('อีเมลที่ใช้ล็อกอิน', '<input class="in" id="a-email" type="email" value="' + esc(a.email || '') + '" autocomplete="off">', 'ต้องเป็นบัญชี Google ครูทุกท่านเห็นและแก้ไขข้อมูลได้ทั้งหมด') + '</div>' +
      fld('ตำแหน่งที่แสดงในแผนผัง', '<input class="in" id="a-pos" value="' + esc(a.position || '') + '" placeholder="เช่น ครูที่ปรึกษาชมรม / วิทยากรท้องถิ่น">') +
      fld('รูป (ไม่บังคับ)', '<input class="in" type="file" accept="image/*" id="a-photo">') +
      '<div class="note bad" id="a-err" hidden></div><div class="row" style="margin-top:16px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button type="submit" class="btn grow">บันทึก</button></div></form>', { center: true, sticky: true });
    $('#a-kind', w).addEventListener('change', e => { $('#a-ew', w).hidden = e.target.value === 'expert'; });
    $('#a-photo', w).addEventListener('change', async e => { const f = e.target.files[0]; if (f) try { photo = await M.fileToSquare(f, 240, 0.82); } catch (er) { toast(er.message); } });
    $('form', w).addEventListener('submit', e => {
      e.preventDefault(); const name = $('#a-name', w).value.trim(), kind = $('#a-kind', w).value, email = kind === 'teacher' ? $('#a-email', w).value.trim().toLowerCase() : '';
      const err = t => { const el = $('#a-err', w); el.textContent = t; el.hidden = false; };
      if (!name) return err('กรอกชื่อ'); if (kind === 'teacher' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err('ครูต้องระบุอีเมลที่ใช้ล็อกอิน');
      const aid = id || 'a' + B.uid(); const upd = {};
      const rec = { name, kind, position: $('#a-pos', w).value.trim() || (kind === 'teacher' ? 'ครูที่ปรึกษาชมรม' : 'วิทยากรท้องถิ่น'), order: a.order || (advisors().length + 1) };
      if (email) rec.email = email; if (photo || a.photo) rec.photo = photo || a.photo;
      upd['config/advisors/' + aid] = rec;
      if (a.email && a.email !== email) upd['teachers/' + B.emailKey(a.email)] = null;
      if (email) upd['teachers/' + B.emailKey(email)] = true;
      W(B.update('', upd)); log('advisor.save', '', name); w.remove(); toast('บันทึกแล้ว');
    });
  }

  /* ---------- นำเข้ารายชื่อ (วางจากตาราง เช่น จากแบบ วก.12 หรือ Excel) ---------- */
  const toArabic = s => String(s).replace(/[๐-๙]/g, d => '๐๑๒๓๔๕๖๗๘๙'.indexOf(d));
  function parseRoster(text) {
    const PRE = [['เด็กชาย', 'ด.ช.'], ['เด็กหญิง', 'ด.ญ.'], ['นางสาว', 'น.ส.'], ['ด.ช.', 'ด.ช.'], ['ด.ญ.', 'ด.ญ.'], ['น.ส.', 'น.ส.'], ['นาย', 'นาย']];
    const out = [], bad = [];
    toArabic(text).split(/\r?\n/).forEach(raw => {
      let ln = raw.replace(/[|,\t]+/g, ' ').replace(/\s+/g, ' ').trim(); if (!ln) return;
      const c = ln.match(/ม\s*\.?\s*([1-6])\s*\/\s*([0-9]{1,2})/); const s = ln.match(/(?:^|\s)([0-9]{4,8})(?=\s|$)/);
      if (!c || !s) { if (/[ก-๙]/.test(ln) && !/ลำดับ|เลขประจำตัว/.test(ln)) bad.push(raw.trim()); return; }
      let rest = ln.replace(c[0], ' ').replace(s[1], ' ').replace(/^\s*[0-9]{1,3}\s+/, ' ').replace(/\s+/g, ' ').trim();
      let prefix = ''; for (const p of PRE) { if (rest.startsWith(p[0])) { prefix = p[1]; rest = rest.slice(p[0].length).trim(); break; } }
      const ps = rest.split(' '); const first = ps.shift() || ''; const last = ps.join(' ');
      if (!first || !last) { bad.push(raw.trim()); return; }
      out.push({ sid: s[1], prefix: prefix || (+c[1] <= 3 ? 'ด.ช.' : 'นาย'), first, last, grade: +c[1], room: +c[2], noPrefix: !prefix });
    });
    return { out, bad };
  }
  function importForm() {
    const w = modal('<h3>นำเข้ารายชื่อสมาชิก</h3><div class="muted" style="margin-bottom:10px">คัดลอกตารางรายชื่อ (เช่น จากไฟล์ วก.12 หรือ Excel) แล้ววางด้านล่าง หนึ่งคนต่อหนึ่งบรรทัด ต้องมี เลขประจำตัว ชื่อ-สกุล และชั้น เช่น<br><code>35065 ด.ช.ชื่อ นามสกุล ม.1/5</code></div>' +
      '<textarea class="in" id="i-text" rows="8" placeholder="วางรายชื่อที่นี่" aria-label="รายชื่อ"></textarea>' +
      fld('ประเภทสมาชิกของผู้ที่นำเข้า', '<select class="in" id="i-type">' + opt(C.memberTypes.map(t => [t.id, t.name]), 'start') + '</select>') +
      '<div id="i-res" class="note" hidden></div><div class="row" style="margin-top:16px"><button class="btn ghost grow" data-close>ปิด</button><button class="btn ghost grow" id="i-check">ตรวจรายชื่อ</button><button class="btn grow" id="i-go" disabled>นำเข้า</button></div>', { sticky: true, wide: true });
    let ready = [];
    $('#i-check', w).addEventListener('click', () => {
      const { out, bad } = parseRoster($('#i-text', w).value); const seen = {};
      ready = out.filter(o => !members()[o.sid] && !seen[o.sid] && (seen[o.sid] = 1)); const dup = out.length - ready.length;
      const r = $('#i-res', w); r.hidden = false;
      r.innerHTML = '<b>พร้อมนำเข้า ' + ready.length + ' คน</b>' + (dup ? ' · ข้าม ' + dup + ' คนที่มีในทะเบียนแล้วหรือซ้ำกัน' : '') + (bad.length ? '<br>อ่านไม่ได้ ' + bad.length + ' บรรทัด: ' + esc(bad.slice(0, 3).join(' / ')) + (bad.length > 3 ? ' …' : '') : '') +
        (ready.length ? '<div class="muted" style="margin-top:6px">' + esc(ready.slice(0, 4).map(o => o.sid + ' ' + o.prefix + o.first + ' ' + o.last + ' ม.' + o.grade + '/' + o.room).join(' · ')) + (ready.length > 4 ? ' …' : '') + '</div>' : '') +
        (ready.some(o => o.noPrefix) ? '<div class="muted">บางคนไม่มีคำนำหน้า ระบบใส่ให้ตามระดับชั้น ตรวจและแก้ได้ภายหลัง</div>' : '');
      $('#i-go', w).disabled = !ready.length;
    });
    $('#i-go', w).addEventListener('click', () => {
      const upd = {}, now = Date.now(), type = $('#i-type', w).value;
      ready.forEach(o => { upd[o.sid] = { prefix: o.prefix, first: o.first, last: o.last, grade: o.grade, room: o.room, type, status: 'active', am: false, pm: false, createdAt: now, createdBy: by() }; });
      W(B.update('members', upd)); log('member.import', '', ready.length + ' คน'); w.remove(); toast('นำเข้า ' + ready.length + ' คนแล้ว');
    });
  }

  /* ============ ส่งออก: บอร์ด / แผนผัง / รายชื่อ DOCX ============ */
  const SCOPES = [['all', 'สมาชิกทั้งหมด'], ['committee', 'เฉพาะคณะกรรมการ'], ['am', 'ผู้ซ้อมรอบเช้า'], ['pm', 'ผู้ซ้อมรอบเย็น']];
  function scopeSids(sc) {
    const ms = members(); let l = activeSids();
    if (sc === 'committee') l = l.filter(s => roleOf(s)); else if (sc === 'am' || sc === 'pm') l = l.filter(s => ms[s][sc]);
    return sc === 'committee' ? l.sort((a, b) => ROLE_ORDER.indexOf(roleOf(a).role) - ROLE_ORDER.indexOf(roleOf(b).role) || (roleOf(a).grade || 0) - (roleOf(b).grade || 0)) : l.sort(byClass);
  }
  const pageHead = (title, sub) => '<div class="rp-head"><img src="icons/logo-256.png" alt=""><div class="grow"><div class="rp-t">' + esc(title) + '</div><div class="rp-s">' + esc(sub) + '</div></div><img class="sch" src="icons/school-logo.png" alt=""></div>';
  const bigAv = (m, src) => src ? '<img class="rp-ph" src="' + esc(src) + '" alt="">' : '<div class="rp-ph none">' + esc(((m.first || m.name || '?').replace(/^(ครู|พ่อครู|แม่ครู|นาย|นางสาว|นาง)/, '').trim().charAt(0)) || '?') + '</div>';
  async function printPhotos(sids) { const o = {}; await Promise.all(sids.map(async s => { try { o[s] = await B.get('photos/' + s); } catch (e) { o[s] = null; } if (!o[s]) o[s] = members()[s].photo || null; })); return o; }
  async function boardPages(sc) {
    const sids = scopeSids(sc), ms = members(), ph = await printPhotos(sids), per = 12, root = document.createElement('div');
    const sub = C.club.full + ' · ปีการศึกษา ' + year() + ' · ' + SCOPES.find(x => x[0] === sc)[1] + ' ' + sids.length + ' คน';
    for (let i = 0; i < Math.max(1, sids.length); i += per) {
      const pg = document.createElement('div'); pg.className = 'rp-page';
      pg.innerHTML = pageHead('ทำเนียบสมาชิกชมรม' + C.club.name, sub) + '<div class="rp-grid">' + sids.slice(i, i + per).map(s => { const m = ms[s], lv = topLv(s);
        return '<div class="rp-card">' + bigAv(m, ph[s]) + '<div class="rp-n">' + esc(fullName(m)) + '</div><div class="rp-c">' + esc(cls(m) + ' · ' + typeName(m.type)) + '</div>' + (roleOf(s) ? '<div class="rp-r">' + esc(roleName(roleOf(s))) + '</div>' : '') + '<div class="rp-i">' + esc(insts(m).join(', ') || '-') + '</div>' + (lv ? '<div class="rp-l">' + esc(lvName(lv)) + '</div>' : '') + '</div>'; }).join('') +
        '</div><div class="rp-foot">หน้า ' + (i / per + 1) + ' / ' + Math.max(1, Math.ceil(sids.length / per)) + '</div>';
      root.appendChild(pg);
    }
    return root;
  }
  async function chartPages() {
    const ms = members(), act = activeSids(), ph = await printPhotos(act.filter(s => roleOf(s)));
    const p = (m, sub, src, c) => '<div class="rp-pp ' + (c || '') + '">' + bigAv(m, src) + '<div class="rp-n">' + esc(m.first ? fullName(m) : m.name) + '</div><div class="rp-r">' + esc(sub) + '</div></div>';
    const withRole = id => act.filter(s => (roleOf(s) || {}).role === id).sort(byClass);
    const tier = l => '<div class="rp-tier">' + l.join('') + '</div>';
    const root = document.createElement('div'); const pg = document.createElement('div'); pg.className = 'rp-page';
    pg.innerHTML = pageHead('แผนผังคณะกรรมการชมรม' + C.club.name, C.club.full + ' · ปีการศึกษา ' + year()) +
      '<div class="rp-lab">ที่ปรึกษาชมรม</div>' + tier(advisors().map(a => p(a, a.position || '', a.photo, 'top'))) +
      '<div class="rp-lab">ประธานชมรม</div>' + tier(withRole('president').map(s => p(ms[s], cls(ms[s]), ph[s], 'top'))) +
      '<div class="rp-lab">คณะกรรมการบริหาร</div>' + tier(['vice', 'treasurer', 'secretary'].map(id => withRole(id).map(s => p(ms[s], roleName({ role: id }), ph[s])).join(''))) +
      '<div class="rp-lab">กรรมการตัวแทนระดับชั้น</div>' + tier([1, 2, 3, 4, 5, 6].map(g => { const s = act.find(x => { const r = roleOf(x); return r && r.role === 'rep' && +r.grade === g; }); return s ? p(ms[s], 'ม.' + g, ph[s], 'sm') : '<div class="rp-pp sm"><div class="rp-ph none">–</div><div class="rp-n">ว่าง</div><div class="rp-r">ม.' + g + '</div></div>'; })) +
      '<div class="rp-foot">สมาชิกทั้งหมด ' + act.length + ' คน</div>';
    root.appendChild(pg); return root;
  }
  function rosterDocx(sc) {
    const sids = scopeSids(sc), ms = members();
    return M.docxTable({
      title: 'รายชื่อสมาชิกชมรม' + C.club.name, lines: [C.club.full + ' ปีการศึกษา ' + thNum(year()), SCOPES.find(x => x[0] === sc)[1] + ' จำนวน ' + thNum(sids.length) + ' คน'],
      head: ['ลำดับ', 'เลขประจำตัว', 'ชื่อ - สกุล', 'ชั้น', 'ประเภท', 'ตำแหน่ง', 'เครื่องดนตรี'], widths: [7, 13, 30, 9, 10, 15, 22], align: ['center', 'center', 'left', 'center', 'center', 'left', 'left'],
      rows: sids.map((s, i) => [thNum(i + 1), s, fullName(ms[s]), thNum('ม.' + ms[s].grade + '/' + ms[s].room), typeName(ms[s].type), thNum(roleName(roleOf(s))) || '-', insts(ms[s]).join(', ') || '-']),
      footer: ['', 'ข้อมูล ณ วันที่ ' + thNum(M.thDate(Date.now()))]
    });
  }
  function exportMenu() {
    const w = modal('<h3>ส่งออก</h3>' + fld('ขอบเขตรายชื่อ', '<select class="in" id="x-sc">' + opt(SCOPES) + '</select>') +
      '<div class="xlist"><button class="xbtn" data-x="board-pdf"><b>บอร์ดสมาชิก (PDF)</b><span>การ์ดรูป ชื่อ ชั้น ตำแหน่ง เครื่องดนตรี ระดับฝีมือ ขนาด A4 สำหรับพิมพ์ติดห้องดนตรี</span></button>' +
      '<button class="xbtn" data-x="board-png"><b>บอร์ดสมาชิก (รูป PNG)</b><span>หน้าละหนึ่งรูป นำไปขยายหรือจัดวางต่อได้</span></button>' +
      '<button class="xbtn" data-x="chart-pdf"><b>แผนผังคณะกรรมการ (PDF)</b><span>ที่ปรึกษา ประธาน กรรมการบริหาร และตัวแทนระดับชั้น</span></button>' +
      '<button class="xbtn" data-x="chart-png"><b>แผนผังคณะกรรมการ (รูป PNG)</b><span>รูปเดียว ความละเอียดสูง</span></button>' +
      '<button class="xbtn" data-x="docx"><b>รายชื่อสมาชิก (DOCX)</b><span>ตารางรายชื่อ เปิดแก้ต่อใน Word ได้</span></button>' +
      '<button class="xbtn" data-x="board-view"><b>ดูตัวอย่างบอร์ดก่อน</b><span>แสดงบนหน้าจอ ไม่บันทึกไฟล์</span></button></div>' +
      '<div class="muted" id="x-msg" style="margin-top:10px"></div><button class="btn ghost block" data-close style="margin-top:12px">ปิด</button>', { center: true });
    w.addEventListener('click', async e => {
      const b = e.target.closest('[data-x]'); if (!b || w.dataset.busy) return; const sc = $('#x-sc', w).value, x = b.dataset.x, msg = $('#x-msg', w);
      const prog = (i, n) => { msg.textContent = 'กำลังสร้างหน้า ' + i + ' / ' + n + ' …'; };
      w.dataset.busy = '1'; msg.textContent = 'กำลังเตรียมข้อมูล …';
      try {
        const tag = M.safeName(SCOPES.find(k => k[0] === sc)[1]) + '-' + year();
        if (x === 'docx') await M.saveBlob(rosterDocx(sc), 'รายชื่อสมาชิกสรรพวาทิต-' + tag + '.docx');
        else if (x === 'board-view') { const root = await boardPages(sc); w.remove(); M.previewPages(root, 'ตัวอย่างบอร์ดสมาชิก'); return; }
        else if (x === 'board-pdf') await M.exportPDF(await boardPages(sc), 'บอร์ดสมาชิกสรรพวาทิต-' + tag + '.pdf', prog);
        else if (x === 'board-png') await M.exportPNGs(await boardPages(sc), 'บอร์ดสมาชิกสรรพวาทิต-' + tag, prog);
        else if (x === 'chart-pdf') await M.exportPDF(await chartPages(), 'แผนผังสรรพวาทิต-' + year() + '.pdf', prog);
        else if (x === 'chart-png') await M.exportPNGs(await chartPages(), 'แผนผังสรรพวาทิต-' + year(), prog);
        msg.textContent = 'เสร็จแล้ว'; log('export', '', x + ' ' + sc);
      } catch (er) { console.error(er); msg.textContent = 'ส่งออกไม่สำเร็จ: ' + (er.message || er) + ' (PDF/PNG ต้องต่ออินเทอร์เน็ตครั้งแรกเพื่อโหลดตัวสร้างไฟล์)'; }
      delete w.dataset.busy;
    });
  }

  function viewMore() {
    const l = navItems().filter(n => !n.tab);
    return { title: 'เพิ่มเติม', body: '<div class="morelist">' + l.map(n => '<a class="more-i" href="#/' + n.id + '">' + ic(n.icon, 26) + '<span>' + n.label + '</span>' + (n.badge && n.badge() ? '<i class="bdg">' + n.badge() + '</i>' : '') + '</a>').join('') + '</div>' };
  }
  const V = { home: viewHome, chart: viewChart, members: viewMembers, m: viewMember, manage: viewManage, me: viewMe, more: viewMore };
  const MANAGE = [];   /* การ์ดเพิ่มในหน้าจัดการ */

  /* ============ ตารางการทำงานของปุ่ม ============ */
  const ACT = {
    signin: async () => { try { B.authError = null; await B.signIn({}); } catch (e) { renderLogin(esc(B.authErrorText(e))); } },
    signout: () => B.signOut(),
    retry: () => B.retryFailed(),
    syncInfo: async () => {
      const f = await B.failedOps(), pn = B.pendingList(); const line = o => (o.t === 'update' && !o.p ? Object.keys(o.v || {}).slice(0, 3).join(', ') : o.p) || '(ราก)';
      const txt = 'สรรพวาทิต ' + C.version + ' · ' + B.mode + ' · ' + (USER ? USER.email : '') + '\n' + f.map(o => 'FAILED ' + o.t + ' ' + line(o) + ' :: ' + o.error).concat(pn.map(o => 'PENDING ' + o.t + ' ' + line(o))).join('\n');
      const w = modal('<h3>สถานะการส่งข้อมูล</h3>' + (D.rulesOld ? '<div class="note bad">ฐานข้อมูลยังใช้ Rules รุ่นเก่า — คัดลอกไฟล์ database.rules.json ไปวางที่ Firebase Console › Realtime Database › Rules แล้วกด Publish</div>' : '') +
        '<div class="lb">ส่งไม่สำเร็จ (' + f.length + ')</div>' + (f.map(o => '<div class="li"><b>' + esc(line(o)) + '</b><div class="muted">' + esc(errTH({ code: o.error })) + ' · ' + esc(M.thDate(o.failedAt)) + '</div></div>').join('') || '<div class="muted">ไม่มี</div>') +
        '<div class="lb" style="margin-top:14px">กำลังรอส่ง (' + pn.length + ')</div><div class="muted">' + (pn.map(o => esc(line(o))).join('<br>') || 'ไม่มี') + (STATUS.online === false ? '<br>ขณะนี้ออฟไลน์ ระบบจะส่งเองเมื่อมีสัญญาณ' : '') + '</div>' +
        '<div class="row wrap" style="margin-top:16px">' + (f.length ? '<button class="btn" id="s-retry">ลองส่งใหม่</button><button class="btn ghost danger" id="s-clear">ล้างรายการที่ส่งไม่สำเร็จ</button>' : '') + '<button class="btn ghost" id="s-copy">คัดลอกรายละเอียด</button><button class="btn ghost" data-close>ปิด</button></div><div class="muted" style="margin-top:8px">ถ้าส่งไม่สำเร็จซ้ำ ๆ ให้คัดลอกรายละเอียดส่งให้ผู้พัฒนา</div>', { center: true, wide: true });
      const on = (id, fn) => { const el = $(id, w); if (el) el.addEventListener('click', fn); };
      on('#s-retry', async () => { await B.retryFailed(); w.remove(); toast('กำลังลองส่งใหม่'); }); on('#s-clear', async () => { await B.discardFailed(); w.remove(); toast('ล้างรายการแล้ว'); });
      on('#s-copy', async () => { try { await navigator.clipboard.writeText(txt); toast('คัดลอกแล้ว'); } catch (e) { modal('<h3>รายละเอียด</h3><textarea class="in" rows="8" readonly>' + esc(txt) + '</textarea><button class="btn ghost block" data-close style="margin-top:10px">ปิด</button>', { center: true }); } });
    },
    addMember: () => { if (can.edit()) memberForm(null); },
    editMember: d => { if (can.edit()) memberForm(d.sid); },
    editSelf: () => memberForm(ME.sid, true),
    removeMember: d => { if (can.manage()) removeForm(d.sid); },
    role: d => { if (can.manage()) roleForm(d.sid); },
    skill: d => { if (can.manage()) skillForm(d.sid, d.inst); },
    toggle: d => { if (!can.manage()) return; const m = members()[d.sid]; const u = {}; u[d.k] = !m[d.k]; W(B.update('members/' + d.sid, u)); },
    importMembers: () => { if (can.edit()) importForm(); },
    exportMenu: () => { if (can.exp()) exportMenu(); },
    addAdvisor: () => advisorForm(null),
    editAdvisor: d => advisorForm(d.id),
    removeAdvisor: async d => {
      const a = cfg().advisors[d.id]; if (!a) return;
      if (a.email && a.email.toLowerCase() === ME.email) return toast('นำบัญชีที่กำลังใช้อยู่ออกไม่ได้', 3500);
      if (!(await M.confirmBox('นำที่ปรึกษาออก', esc(a.name) + (a.kind === 'teacher' ? ' จะเข้าใช้ระบบในฐานะครูไม่ได้อีก' : ' จะไม่แสดงในแผนผังและเอกสาร'), 'นำออก', true))) return;
      const upd = {}; upd['config/advisors/' + d.id] = null; if (a.email) upd['teachers/' + B.emailKey(a.email)] = null;
      W(B.update('', upd)); log('advisor.remove', '', a.name);
    },
    restore: d => { const upd = { status: 'active', removedReason: null, removedAt: null, removedBy: null, gradYear: null }; W(B.update('members/' + d.sid, upd)); log('member.restore', d.sid); toast('กู้คืนแล้ว'); },
    purge: async d => {
      const m = members()[d.sid]; if (!m || m.removedReason !== 'mistake') return;
      if (!(await M.confirmBox('ลบถาวร', 'ลบข้อมูลของ ' + esc(fullName(m)) + ' ออกจากระบบทั้งหมด กู้คืนไม่ได้', 'ลบถาวร', true))) return;
      const upd = {}; ['members', 'roles', 'skills', 'privateInfo'].forEach(k => upd[k + '/' + d.sid] = null);
      W(B.update('', upd)); W(B.remove('photos/' + d.sid)); log('member.purge', d.sid, fullName(m));
    },
    setYear: () => {
      const w = modal('<h3>ปีการศึกษาปัจจุบัน</h3><form class="form">' + fld('ปี พ.ศ.', '<input class="in" id="y" inputmode="numeric" value="' + esc(year()) + '">', 'ใช้ในหัวเอกสารและบอร์ด (การเลื่อนชั้นและย้ายศิษย์เก่าอัตโนมัติจะมาในขั้นถัดไป)') + '<div class="row" style="margin-top:16px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn grow">บันทึก</button></div></form>', { center: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const y = $('#y', w).value.trim(); if (!/^25[0-9]{2}$/.test(y)) return toast('ปี พ.ศ. ไม่ถูกต้อง'); W(B.set('config/year', y)); w.remove(); });
    },
    setInst: () => {
      const w = modal('<h3>รายการเครื่องดนตรี</h3><form class="form"><div class="muted" style="margin-bottom:8px">หนึ่งชนิดต่อหนึ่งบรรทัด ลำดับนี้ใช้ในฟอร์มและแผนผัง</div><textarea class="in" id="il" rows="12" aria-label="รายการเครื่องดนตรี">' + esc(instList().join('\n')) + '</textarea><div class="row" style="margin-top:16px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn grow">บันทึก</button></div></form>', { center: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const l = Array.from(new Set($('#il', w).value.split(/\r?\n/).map(s => s.trim().replace(/[.#$/\[\]]/g, '-')).filter(Boolean))); if (!l.length) return toast('ต้องมีอย่างน้อยหนึ่งชนิด'); W(B.set('config/instruments', l)); w.remove(); });
    },
    resetDemo: async () => { if (!(await M.confirmBox('ล้างข้อมูลสาธิต', 'เริ่มข้อมูลสมมติชุดใหม่', 'ล้าง', true))) return; await B.resetDemo(); location.hash = '#/home'; location.reload(); }
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const f = ACT[b.dataset.act]; if (f) { e.preventDefault(); f(b.dataset, b); }
  });
  document.addEventListener('input', e => { if (e.target.id === 'q') { UI.q = e.target.value; const l = $('#mlist'); if (l) { l.innerHTML = listHTML(); lastHTML = ''; } } });
  document.addEventListener('change', e => { const k = e.target.dataset && e.target.dataset.filter; if (k) { UI[k] = e.target.value; const l = $('#mlist'); if (l) { l.innerHTML = listHTML(); lastHTML = ''; } } });

  /* ---------- เริ่มทำงาน ---------- */
  window.addEventListener('hashchange', () => { if (ME) render(); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => { });
  async function boot() {
    if (window.APP_PUBLIC && (await window.APP_PUBLIC())) return;   /* หน้าสาธารณะ (ผู้ปกครองเซ็นใบอนุญาต) ไม่ต้องล็อกอิน */
    try { await B.init(); } catch (er) { $('#root').innerHTML = '<div class="card" style="margin:20px">เชื่อมต่อระบบไม่สำเร็จ: ' + esc(er.message) + '<br>ตรวจอินเทอร์เน็ต แล้วลองเปิดใหม่</div>'; return; }
    B.onStatus(s => { const ch = s.pending !== STATUS.pending || s.failed !== STATUS.failed || s.online !== STATUS.online; STATUS = s; if (ch && ME) render(); });
    B.onAuth(u => { onAuth(u); });
  }
  document.addEventListener('DOMContentLoaded', boot);
  const todayISO = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const DOWS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'], MONTHS_F = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  /* 'YYYY-MM-DD' → ข้อความไทย: mode 'short' = 2 ต.ค. 69 · 'full' = 2 ตุลาคม 2569 · 'dow' = วันศุกร์ที่ 2 ตุลาคม 2569 */
  function dTH(iso, mode) { if (!iso) return ''; const p = iso.split('-').map(Number); const d = new Date(p[0], p[1] - 1, p[2]); const y = p[0] + 543; return mode === 'short' ? p[2] + ' ' + M.MONTHS[p[1] - 1] + ' ' + String(y).slice(2) : (mode === 'dow' ? 'วัน' + DOWS[d.getDay()] + 'ที่ ' : '') + p[2] + ' ' + MONTHS_F[p[1] - 1] + ' ' + y; }
  window.APP = { V, ACT, NAVS, SUBS, HOME, MANAGE, TODO, errTH, UI, PRIV, ICON, can, ic, chip, fld, opt, avatar, brand, members, cfg, year, instList, activeSids, fullName, cls, typeName, roleOf, roleName, insts, byClass, advisors, myName, by, W, log, lvOf, lvName, topLv, sesText, memberRow, pageHead, bigAv, printPhotos, route, todayISO, dTH, MONTHS_F, DOWS, ROLE_ORDER,
    get D() { return D; }, get ME() { return ME; }, get USER() { return USER; }, get STATUS() { return STATUS; },
    is: (...r) => !!ME && !ME.teacher && r.includes(ME.role), teacher: () => !!ME && ME.teacher, sid: () => ME && ME.sid,
    rerender() { lastHTML = ''; render(); } };
  window.__D = () => D; window.__ME = () => ME;
})();
