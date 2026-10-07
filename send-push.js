/* ============================================================
   tools/send-push.js — ส่งแจ้งเตือนถึงนักเรียน (รันบนคอมพิวเตอร์ของครู ไม่ต้องใช้แผน Blaze)
   วิธีใช้ (ครั้งแรก):  npm i firebase-admin
     1) Firebase Console › Project settings › Service accounts › Generate new private key → บันทึกเป็น tools/serviceAccount.json
        (ห้ามอัปโหลดไฟล์นี้ขึ้น GitHub / ใส่ใน .gitignore)
     2) node tools/send-push.js spw "นัดซ้อมรวมวง" "พรุ่งนี้ 16.00 น. ห้อง 512"            ← ส่งทุกคนในชมรม spw
        node tools/send-push.js spw "ประกาศ" "ข้อความ" "./#/events" 35065,35066          ← ส่งเฉพาะเลขประจำตัวที่ระบุ (+ลิงก์ที่จะเปิด)
   ============================================================ */
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.cert(require('./serviceAccount.json')), databaseURL: 'https://sapphawathit-default-rtdb.asia-southeast1.firebasedatabase.app' });
(async () => {
  const [club, title, body, url, only] = process.argv.slice(2);
  if (!club || !title) return console.log('ใช้: node tools/send-push.js <สรรพวาทิต=spw|แก้วทิพย์=kt> "หัวข้อ" "ข้อความ" ["./#/events"] [เลขประจำตัว,คั่นด้วยจุลภาค]');
  const db = admin.database(), want = only ? new Set(only.split(',').map(s => s.trim())) : null;
  const members = (await db.ref('c/' + club + '/members').get()).val() || {}, people = (await db.ref('people').get()).val() || {};
  const jobs = []; Object.keys(members).forEach(sid => { if (members[sid].status !== 'active' || (want && !want.has(sid))) return; Object.entries((people[sid] || {}).fcm || {}).forEach(([k, v]) => jobs.push({ sid, k, t: v.t })); });
  if (!jobs.length) return console.log('ไม่พบอุปกรณ์ที่เปิดการแจ้งเตือน');
  let ok = 0, bad = 0;
  for (let i = 0; i < jobs.length; i += 500) {
    const part = jobs.slice(i, i + 500);
    const r = await admin.messaging().sendEachForMulticast({ tokens: part.map(j => j.t), data: { title, body: body || '', url: url || './' }, webpush: { headers: { Urgency: 'high', TTL: '86400' } } });
    r.responses.forEach((x, n) => { if (x.success) ok++; else { bad++; const c = (x.error && x.error.code) || ''; if (/registration-token-not-registered|invalid-registration-token|invalid-argument/.test(c)) db.ref('people/' + part[n].sid + '/fcm/' + part[n].k).remove(); } });
  }
  console.log('ส่งสำเร็จ ' + ok + ' · ไม่สำเร็จ ' + bad + ' (token เสียถูกลบให้อัตโนมัติ)'); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
