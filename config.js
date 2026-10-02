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

  /* ★ 3) ชมรมในระบบ — ทะเบียนนักเรียนกลางใช้ร่วมกัน ข้อมูลอื่นแยกตามชมรม (ฐานข้อมูล: c/{id}/…)
        ถ้าเพิ่มชมรมใหม่ ต้องเพิ่ม id ในรายการ CLUBS ของ database.rules.json ด้วย (ดู README)
        levels / instruments เป็นค่าเริ่มต้น ครูแก้ได้ในแอป › จัดการ › ตั้งค่า */
  school: "โรงเรียนสรรพวิทยาคม",
  year: "2569",
  clubs: [
    { id: "spw", name: "สรรพวาทิต", full: "ชมรมดนตรีไทย โรงเรียนสรรพวิทยาคม", long: "ชมรมสรรพวาทิต (ชมรมดนตรีไทย) โรงเรียนสรรพวิทยาคม", logo: "icons/logo-256.png", logoPrint: "icons/logo-1024.jpg", round: false, themeColor: "#5E3650",
      levels: ["ไก่อ่อน", "นักดนตรีพื้นบ้าน", "นักดนตรีมีชื่อเสียง", "จางวาง", "หลวง", "พระ", "พระยา", "สมเด็จเจ้าพระยา"],
      instruments: ["ระนาดเอก", "ระนาดทุ้ม", "ฆ้องวงใหญ่", "ฆ้องวงเล็ก", "ซอด้วง", "ซออู้", "ซอสามสาย", "จะเข้", "ขิม", "ขลุ่ย", "ปี่", "ตะโพน", "กลองทัด", "กลองแขก", "โทน-รำมะนา", "ฉิ่ง", "ฉาบ", "กรับ", "โหม่ง", "ขับร้อง"] },
    { id: "kt", name: "แก้วทิพย์", full: "ชมรมดนตรีพื้นเมืองแก้วทิพย์ โรงเรียนสรรพวิทยาคม", logo: "icons/kt-logo-256.png", logoPrint: "icons/kt-logo-1024.jpg", round: true, themeColor: "#1B1917",
      levels: ["ระดับ 1", "ระดับ 2", "ระดับ 3", "ระดับ 4", "ระดับ 5"],
      instruments: [] }
  ],
  version: "3.0",

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

  removeReasons: [
    { id: "resign", name: "ลาออกจากชมรม" },
    { id: "graduate", name: "จบการศึกษา (ย้ายไปทำเนียบศิษย์เก่า)" },
    { id: "mistake", name: "เพิ่มผิด" }
  ]
};
