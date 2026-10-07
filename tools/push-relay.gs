/* ============================================================
   push-relay.gs — ตัวส่งแจ้งเตือนของระบบชมรม (Google Apps Script · ฟรี ไม่ต้องใช้แผน Blaze)
   หน้าที่: อ่านคิว c/{ชมรม}/pushq ในฐานข้อมูล → เลือกผู้รับ → ส่งผ่าน Firebase Cloud Messaging → ลบคิว
            และเตือนล่วงหน้าหนึ่งวันก่อนกิจกรรม (ทุกวัน 17.00 น.)

   ติดตั้ง (ครั้งเดียว):
   1) script.google.com › โปรเจ็กต์ใหม่ › วางไฟล์นี้ทั้งหมดแทน Code.gs
   2) Firebase Console › Project settings › Service accounts › Generate new private key (ได้ไฟล์ .json)
      Apps Script › ⚙ การตั้งค่าโปรเจ็กต์ › คุณสมบัติสคริปต์ › เพิ่ม  ชื่อ: SERVICE_ACCOUNT  ค่า: วางเนื้อหาไฟล์ .json ทั้งหมด
      ★ ไฟล์ .json นี้เป็นความลับ ห้ามอัปขึ้น GitHub หรือส่งให้ใคร เก็บไว้ในคุณสมบัติสคริปต์เท่านั้น
   3) เลือกฟังก์ชัน setup แล้วกด “เรียกใช้” (อนุญาตสิทธิ์ตามที่ถาม) — สร้างตัวตั้งเวลาให้
   4) ทำให้ใช้งานได้ › การทำให้ใช้งานได้รายการใหม่ › ประเภท “เว็บแอป” › เรียกใช้ในฐานะ “ฉัน” › ผู้มีสิทธิ์เข้าถึง “ทุกคน”
      คัดลอก URL (ลงท้าย /exec) ไปวางที่ config.js › pushRelay
   5) ทดสอบ: เปิดการแจ้งเตือนในแอปด้วยบัญชีครู แล้วเรียกใช้ฟังก์ชัน testTeachers
   ============================================================ */
const DB = 'https://sapphawathit-default-rtdb.asia-southeast1.firebasedatabase.app';
const PROJECT = 'sapphawathit';
const CLUBS = { spw: 'สรรพวาทิต', kt: 'แก้วทิพย์' };
const PAGE = { spw: './index.html?club=spw', kt: './kaewthip.html?club=kt' };
const BOOT_TEACHERS = ['ntpwm2541@gmail.com'];          // ตรงกับ teacherEmails ใน config.js
const DEFAULT_YEAR = '2569';
const TZ = 'Asia/Bangkok';
const FROM_STUDENT = { leave: 1, griev: 1, tx: 1, att: 1, join: 1, ct: 1 };     // ตัวส่งแต่งข้อความเอง ส่งถึงครู
const STAFF_OK = { ann: 1, ev: 1 };                                               // กรรมการส่งถึงสมาชิกได้
const GROUP = { ann: 'ann', msg: 'ann', ev: 'ev', poll: 'poll', leaveok: 'own', cert: 'own', ctreq: 'own' };   // หมวดที่นักเรียนเลือกปิดได้

function doGet() { let r; try { r = run(); } catch (e) { r = 'error'; console.error(e); } return ContentService.createTextOutput(String(r)); }

function setup() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('run').timeBased().everyMinutes(5).create();
  ScriptApp.newTrigger('remind').timeBased().atHour(17).everyDays(1).inTimezone(TZ).create();
  token_(); console.log('พร้อมใช้งาน: ตั้งเวลาอ่านคิวทุก 5 นาที และเตือนก่อนกิจกรรมทุกวัน 17.00 น.');
}

/* ---------- สิทธิ์เข้าถึง ---------- */
function token_() {
  const cache = CacheService.getScriptCache(), hit = cache.get('tok'); if (hit) return hit;
  const raw = PropertiesService.getScriptProperties().getProperty('SERVICE_ACCOUNT');
  if (!raw) throw new Error('ยังไม่ได้ใส่คุณสมบัติสคริปต์ SERVICE_ACCOUNT');
  const sa = JSON.parse(raw), now = Math.floor(Date.now() / 1000);
  const enc = o => Utilities.base64EncodeWebSafe(JSON.stringify(o)).replace(/=+$/, '');
  const input = enc({ alg: 'RS256', typ: 'JWT' }) + '.' + enc({ iss: sa.client_email, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email' });
  const sig = Utilities.base64EncodeWebSafe(Utilities.computeRsaSha256Signature(input, sa.private_key)).replace(/=+$/, '');
  const res = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', { method: 'post', payload: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: input + '.' + sig } });
  const tok = JSON.parse(res.getContentText()).access_token; cache.put('tok', tok, 3000); return tok;
}
function db_(method, path, body) {
  const opt = { method: method, headers: { Authorization: 'Bearer ' + token_() }, muteHttpExceptions: true };
  if (body !== undefined) { opt.contentType = 'application/json'; opt.payload = JSON.stringify(body); }
  const res = UrlFetchApp.fetch(DB + '/' + path + '.json', opt);
  if (res.getResponseCode() >= 300) throw new Error('DB ' + method + ' ' + path + ' → ' + res.getResponseCode() + ' ' + res.getContentText().slice(0, 200));
  return JSON.parse(res.getContentText());
}

/* ---------- ข้อมูลผู้รับของชมรม ---------- */
function ctx_(cid) {
  const members = db_('get', 'c/' + cid + '/members') || {}, people = db_('get', 'people') || {}, teachers = db_('get', 'teachers') || {}, tpush = db_('get', 'tpush') || {};
  const key = e => String(e).toLowerCase().replace(/\./g, ',');
  const tkeys = {}; BOOT_TEACHERS.forEach(e => { tkeys[key(e)] = 1; });
  Object.keys(teachers).forEach(k => { const v = teachers[k]; if (v === true || (v && v[cid] === true)) tkeys[k] = 1; });
  const name = sid => { const m = members[sid]; return m ? (m.prefix || '') + (m.first || '') + ' ' + (m.last || '') : 'สมาชิก'; };
  const active = () => Object.keys(members).filter(s => members[s] && members[s].status === 'active');
  /* token ของนักเรียน (ข้ามคนที่ปิดหมวดนั้น) */
  const stu = (sids, group) => { const out = []; sids.forEach(s => { const p = people[s]; if (!p || !p.fcm || !members[s] || members[s].status !== 'active') return; if (group && p.poff && p.poff[group]) return;
    Object.keys(p.fcm).forEach(k => out.push({ t: p.fcm[k].t, path: 'people/' + s + '/fcm/' + k })); }); return out; };
  const tea = group => { const out = []; Object.keys(tkeys).forEach(k => { const p = tpush[k]; if (!p || !p.fcm) return; if (group && p.off && p.off[group]) return;
    Object.keys(p.fcm).forEach(h => out.push({ t: p.fcm[h].t, path: 'tpush/' + k + '/fcm/' + h })); }); return out; };
  return { cid: cid, members: members, name: name, active: active, stu: stu, tea: tea };
}

/* ---------- อ่านคิวแล้วส่ง ---------- */
function run() {
  const lock = LockService.getScriptLock(); if (!lock.tryLock(500)) return 'busy';
  try {
    let n = 0;
    Object.keys(CLUBS).forEach(cid => {
      const q = db_('get', 'c/' + cid + '/pushq'); if (!q) return;
      const cx = ctx_(cid);
      Object.keys(q).sort((a, b) => (q[a].at || 0) - (q[b].at || 0)).forEach(id => {
        const it = q[id] || {};
        try { if (Date.now() - (it.at || 0) < 24 * 3600 * 1000) n += handle_(cx, id, it); } catch (e) { console.error(id, e); }
        db_('delete', 'c/' + cid + '/pushq/' + id);
      });
    });
    return 'sent ' + n;
  } finally { lock.releaseLock(); }
}
function handle_(cx, id, it) {
  const cid = cx.cid, club = CLUBS[cid], k = String(it.k || ''), by = String(it.by || ''), page = PAGE[cid];
  const fromT = by === 'T', who = fromT ? 'ครู' : cx.name(by);
  if (FROM_STUDENT[k]) {                                   // นักเรียน/ผู้ปกครอง → ครู : ข้อความกำหนดโดยตัวส่ง
    let title, body, url;
    if (k === 'leave') { title = 'ใบลาใหม่'; body = who + ' ส่งใบลา รอครูรับทราบ'; url = '#/practice'; }
    else if (k === 'griev') { title = 'ข้อความร้องทุกข์ใหม่'; body = 'มีข้อความใหม่ถึงครูที่ปรึกษา'; url = '#/griev'; }
    else if (k === 'tx') { title = 'รายการเงินรออนุมัติ'; body = who + ' ส่งรายการ ' + String(it.ref || '').slice(0, 30); url = '#/finance'; }
    else if (k === 'att') { title = 'เช็กชื่อการซ้อมแล้ว'; body = who + ' บันทึกการเช็กชื่อ ' + String(it.ref || '').slice(0, 40); url = '#/practice'; }
    else if (k === 'join') { const a = db_('get', 'c/' + cid + '/applications/' + encodeURIComponent(it.ref)) || {}; if (!a.first) return 0; title = 'ใบสมัครสมาชิกใหม่'; body = (a.prefix || '') + a.first + ' ' + (a.last || '') + ' ม.' + a.grade + '/' + a.room; url = '#/join'; }
    else { const c = db_('get', 'ctoken/' + encodeURIComponent(it.ref)) || {}; if (!c.sign || c.cid !== cid) return 0; title = 'ผู้ปกครองตอบใบขออนุญาตแล้ว'; body = (c.student || '') + ' — ' + (c.sign.allow ? 'อนุญาต' : 'ไม่อนุญาต') + ' · ' + (c.title || ''); url = '#/consent'; }
    return send_(cx.tea(k), { title: title + ' · ' + club, body: body, url: page + url, tag: k + '-' + id });
  }
  if (!fromT && !STAFF_OK[k]) return 0;                    // นักเรียนทั่วไปส่งถึงสมาชิกไม่ได้
  if (!fromT && !cx.members[by]) return 0;
  if (!it.title) return 0;
  let sids = it.to ? String(it.to).split(',').map(s => s.trim()).filter(s => cx.members[s]) : cx.active();
  if (it.grade) sids = sids.filter(s => +cx.members[s].grade === +it.grade);
  if (!fromT) sids = sids.filter(s => s !== by);
  const msg = { title: String(it.title).slice(0, 120), body: (fromT ? '' : who + ': ') + String(it.body || '').slice(0, 400), url: page + (it.url && /^#\//.test(it.url) ? it.url : ''), tag: k + '-' + id };
  let list = cx.stu(sids, GROUP[k] || 'own');
  if (!fromT) list = list.concat(cx.tea('ann'));           // ครูรับรู้สิ่งที่กรรมการประกาศ
  return send_(list, msg);
}

/* ---------- ส่งผ่าน FCM (HTTP v1) ---------- */
function send_(list, msg) {
  const seen = {}; list = list.filter(x => x.t && !seen[x.t] && (seen[x.t] = 1)); if (!list.length) return 0;
  const tok = token_(), url = 'https://fcm.googleapis.com/v1/projects/' + PROJECT + '/messages:send'; let ok = 0;
  for (let i = 0; i < list.length; i += 40) {
    const part = list.slice(i, i + 40);
    const res = UrlFetchApp.fetchAll(part.map(x => ({ url: url, method: 'post', contentType: 'application/json', headers: { Authorization: 'Bearer ' + tok }, muteHttpExceptions: true,
      payload: JSON.stringify({ message: { token: x.t, data: { title: msg.title, body: msg.body || '', url: msg.url || './', tag: msg.tag || '' }, webpush: { headers: { Urgency: 'high', TTL: '86400' } } } }) })));
    res.forEach((r, n) => { const c = r.getResponseCode(); if (c === 200) ok++; else if (c === 404 || /UNREGISTERED|registration-token-not-registered/.test(r.getContentText())) { try { db_('delete', part[n].path); } catch (e) { /* ignore */ } } else console.warn(c, r.getContentText().slice(0, 200)); });
  }
  return ok;
}

/* ---------- เตือนหนึ่งวันก่อนกิจกรรม (ตัวตั้งเวลารายวัน) ---------- */
function remind() {
  const tm = Utilities.formatDate(new Date(Date.now() + 24 * 3600 * 1000), TZ, 'yyyy-MM-dd'); let n = 0;
  Object.keys(CLUBS).forEach(cid => {
    const year = db_('get', 'c/' + cid + '/config/year') || DEFAULT_YEAR, evs = db_('get', 'c/' + cid + '/y/' + year + '/events') || {};
    const due = Object.keys(evs).filter(id => evs[id] && evs[id].date === tm && evs[id].status !== 'cancelled'); if (!due.length) return;
    const cx = ctx_(cid);
    due.forEach(id => { const e = evs[id], sids = e.people ? Object.keys(e.people) : cx.active();
      n += send_(cx.stu(sids, 'ev'), { title: 'พรุ่งนี้: ' + e.title, body: [e.start ? 'เวลา ' + e.start + (e.end ? '–' + e.end : '') : '', e.place ? 'ณ ' + e.place : ''].filter(String).join(' ') || CLUBS[cid], url: PAGE[cid] + '#/ev/' + id, tag: 'rem-' + id }); });
  });
  console.log('remind sent ' + n); return n;
}

/* ---------- ทดสอบ ---------- */
function testTeachers() { let n = 0; Object.keys(CLUBS).forEach(cid => { n += send_(ctx_(cid).tea(null), { title: 'ทดสอบการแจ้งเตือน · ' + CLUBS[cid], body: 'ตัวส่งทำงานแล้ว', url: PAGE[cid], tag: 'test' }); }); console.log('ส่งถึงเครื่องครู ' + n + ' เครื่อง'); }
