/* ============================================================
   config.js — ตั้งค่าแอป "สรรพวาทิต" (ระบบบริหารจัดการชมรมดนตรีไทย)
   ครูแก้เฉพาะส่วนที่มี ★ ก่อนนำขึ้นเว็บ
   ============================================================ */
window.APP_CONFIG = {

  /* ★ 1) ค่า Firebase ของโปรเจกต์ใหม่ (Firebase Console › Project settings › Your apps › Web app)
        ถ้ายังเว้นว่าง แอปจะทำงานใน "โหมดสาธิต" (ข้อมูลอยู่ในเบราว์เซอร์นี้เท่านั้น)
        ทดลองโดยไม่แตะข้อมูลจริงได้เสมอด้วย ?demo=1 */
  firebase: {
    apiKey: "AIzaSyBLvy5DHuOo1bhmbklOb4B_Hocd7ziq6p4",
    authDomain: "sapphawathit.firebaseapp.com",
    databaseURL: "https://sapphawathit-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sapphawathit",
    storageBucket: "sapphawathit.firebasestorage.app",
    messagingSenderId: "549997282142",
    appId: "1:549997282142:web:b0283161ff316617b785cf"
  },
  /* หมายเหตุ: apiKey ของ Firebase เว็บเปิดเผยได้ ความปลอดภัยอยู่ที่ database.rules.json — ต้องเผยแพร่ Rules ก่อนใช้งานจริง */

  /* ★ 2) อีเมลครูผู้ดูแลคนแรก (ต้องตรงกับใน database.rules.json)
        ครูท่านอื่นเพิ่มได้ในแอป › จัดการ › ที่ปรึกษาชมรม ไม่ต้องแก้ไฟล์นี้ */
  teacherEmails: ["ntpwm2541@gmail.com"],

  /* อีเมลนักเรียน = เลขประจำตัว@sappha.ac.th → ผูกกับทะเบียนสมาชิกอัตโนมัติ */
  auth: { domain: "sappha.ac.th", sidPattern: "^[0-9]{4,8}$" },

  club: {
    name: "สรรพวาทิต",
    full: "ชมรมดนตรีไทย โรงเรียนสรรพวิทยาคม",
    school: "โรงเรียนสรรพวิทยาคม",
    year: "2569"
  },
  version: "2.0",

  /* ตำแหน่งในชมรม (ลำดับ = ลำดับในแผนผัง) */
  roles: [
    { id: "president", name: "ประธานชมรม" },
    { id: "vice", name: "รองประธานชมรม" },
    { id: "treasurer", name: "เหรัญญิก" },
    { id: "secretary", name: "เลขานุการ" },
    { id: "rep", name: "กรรมการตัวแทนระดับชั้น" }
  ],

  memberTypes: [
    { id: "start", name: "เริ่มต้น" },
    { id: "regular", name: "สามัญ" },
    { id: "special", name: "วิสามัญ" }
  ],

  prefixes: ["ด.ช.", "ด.ญ.", "นาย", "น.ส."],

  /* ระดับฝีมือ 8 ขั้น (ครูเป็นผู้ประเมิน) */
  levels: ["ไก่อ่อน", "นักดนตรีพื้นบ้าน", "นักดนตรีมีชื่อเสียง", "จางวาง", "หลวง", "พระ", "พระยา", "สมเด็จเจ้าพระยา"],

  /* เครื่องดนตรีตั้งต้น — ครูเพิ่ม/ลดได้ในแอป › จัดการ › ตั้งค่า */
  instruments: ["ระนาดเอก", "ระนาดทุ้ม", "ฆ้องวงใหญ่", "ฆ้องวงเล็ก", "ซอด้วง", "ซออู้", "ซอสามสาย", "จะเข้", "ขิม", "ขลุ่ย", "ปี่", "ตะโพน", "กลองทัด", "กลองแขก", "โทน-รำมะนา", "ฉิ่ง", "ฉาบ", "กรับ", "โหม่ง", "ขับร้อง"],

  removeReasons: [
    { id: "resign", name: "ลาออกจากชมรม" },
    { id: "graduate", name: "จบการศึกษา (ย้ายไปทำเนียบศิษย์เก่า)" },
    { id: "mistake", name: "เพิ่มผิด" }
  ]
};
