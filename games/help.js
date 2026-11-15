/* ============================================================
   help.js — ปุ่ม “วิธีเล่น / วิธีใช้” มาตรฐานเดียวกันทุกเกมและเครื่องมือของชมรม
   ใส่ <script src="help.js"></script> ท้ายหน้าเกม · ข้อความแยกตามชื่อไฟล์เกม
   พัฒนาโดย นายนนทพัทธ์ วงค์มูล 2026
   ============================================================ */
(function () {
  'use strict';
  if (window.SPW_HELP) return; window.SPW_HELP = true;
  var H = {
    'klong-khaek': ['วิธีเล่น · กลองแขกคู่ขวัญ', ['เลือกหน้าทับและความเร็ว แล้วกด “ฟังตัวอย่าง” ก่อนได้', 'ตีให้ตรงจังหวะเมื่อโน้ตมาถึง — แตะปุ่มบนจอหรือใช้คีย์บอร์ด', 'ตีคู่ได้ 2 แบบ: เครื่องเดียวสองคน (ตัวผู้–ตัวเมีย) หรือสองเครื่องด้วยรหัสห้อง 4 ตัว', 'ถ้าเสียงกับภาพไม่ตรงกัน ให้ตั้ง “ค่าหน่วงเสียง” (ค่านี้ใช้ร่วมกันทุกเกมจังหวะ)', 'ผลความแม่นยำส่งเข้า “ทักษะดนตรีของฉัน” ด้านจังหวะ']],
    'hoo': ['วิธีเล่น · หูทองสรรพวาทิต', ['เลือกโหมด: ทายเครื่องดนตรี · ทายโน้ต · ทายหน้าทับ · ทำนองขึ้นหรือลง', 'เลือกระดับความยาก (มี 3 ระดับ) แล้วฟังเสียงให้ดี', 'แตะคำตอบที่คิดว่าถูก รอบละ 10 ข้อ', 'คะแนนส่งเข้า “ทักษะดนตรีของฉัน” ด้านการฟัง จังหวะ และเครื่องดนตรี']],
    'metronome': ['วิธีใช้ · เครื่องกำกับจังหวะ', ['เลือกอัตราจังหวะ (สามชั้น / สองชั้น / ชั้นเดียว) และหน้าทับ แล้วกดเล่น', 'ปรับความเร็วได้ตามต้องการระหว่างซ้อม', 'สร้างหน้าทับของตัวเองแล้วบันทึกไว้ใช้ซ้ำ หรือส่งให้ครูรับเป็นสื่อของชมรมได้', 'ถ้าใช้ลำโพงบลูทูธแล้วไฟกับเสียงไม่ตรงกัน ให้ตั้ง “ค่าหน่วงเสียง” (ใช้ร่วมกันทุกเกมจังหวะ)']],
    'band': ['วิธีใช้ · แทร็กซ้อมวง', ['เลือกเพลงจากสื่อชมรมหรือร่างในเครื่อง (จดโน้ตได้ในเกม “บันทึกโน้ตเพลงไทย”)', 'กดเลือกเครื่องที่ “ฉันเล่น” วงจะปิดเสียงเครื่องนั้นให้ซ้อมตาม (ติ๊กให้คงเสียงนำเบา ๆ ได้)', 'เปิด–ปิด และปรับความดังของแต่ละเครื่อง ปรับความเร็วได้', 'ถ้าเพลงเดียวกันมีโน้ตหลายทาง (ทางระนาด ทางซอ ฯลฯ) วงจะใช้ทางของเครื่องนั้นจริง · เล่นเที่ยวที่ ๒ เงาเสียง ✕ หยุดเสียง และแถวเครื่องจังหวะตามที่จดไว้', 'บันทึกเป็นไฟล์ MP3 ส่งเข้ากลุ่มไลน์ได้']],
    'play': ['วิธีใช้ · เครื่องดนตรีจำลอง', ['เลือกเครื่องดนตรีด้านบน แล้วแตะปุ่มเสียงด้านล่าง (กดด้วยนิ้วโป้งสองมือได้)', 'เครื่องเป่า/สี กดค้างเพื่อลากเสียง', 'กด “อัด” เพื่อบันทึกสิ่งที่เล่น แล้วเล่นซ้ำฟังได้', 'ใช้คีย์บอร์ดคอมพิวเตอร์กดแทนได้']],
    'tuner': ['วิธีใช้ · เทียบเสียง', ['เลือกเครื่อง (ซอด้วง / ซออู้) แล้วกดฟังเสียงอ้างอิงของแต่ละสาย', 'กดวัดเสียง แล้วอนุญาตไมโครโฟน สีหรือเป่าเสียงค้างไว้', 'ระบบบอกว่าเสียงสูงหรือต่ำไปกี่เซนต์ ปรับจนตรง', 'เสียงอ้างอิงตั้งตามระนาดเอกของชมรม']],
    'klongscan': ['วิธีใช้ · ถอดรหัสเสียงกลองหลวง', ['กดเลือกคลิปเสียงหรือวิดีโอวงกลองหลวง (ประมวลผลในเครื่อง ไม่อัปโหลดไปไหน)', 'รอระบบวิเคราะห์ จะได้ความเร็ว แพตเทิร์น และความพร้อมเพรียงของกลอง ฉาบ ฆ้อง', 'บันทึกผลของแต่ละวงไว้เทียบกันได้', 'คลิปที่เสียงชัดและไม่มีเสียงพูดแทรกจะได้ผลแม่นกว่า']]
  };
  var id = (location.pathname.split('/').pop() || '').replace(/\.html?$/, ''), h = H[id]; if (!h) return;
  function open() {
    var o = document.createElement('div');
    o.style.cssText = 'position:fixed;inset:0;z-index:2147483600;background:rgba(20,8,18,.72);display:flex;align-items:center;justify-content:center;padding:16px';
    o.innerHTML = '<div style="max-width:440px;width:100%;max-height:86vh;overflow:auto;background:#2b1628;color:#fff6e0;border:1px solid rgba(242,193,78,.5);border-radius:18px;padding:18px 18px 14px;font-family:Sarabun,sans-serif;font-size:15px;line-height:1.6;box-shadow:0 12px 40px rgba(0,0,0,.5)"><div style="font-family:Mitr,Sarabun,sans-serif;font-size:19px;color:#f2c14e;margin-bottom:8px"></div><ol style="margin:0 0 12px;padding-left:20px"></ol><button type="button" style="width:100%;font:inherit;font-family:Mitr,Sarabun,sans-serif;padding:10px;border-radius:12px;border:none;background:#f2c14e;color:#3b2205;cursor:pointer">เข้าใจแล้ว</button></div>';
    o.querySelector('div > div').textContent = h[0];
    var ol = o.querySelector('ol'); h[1].forEach(function (t) { var li = document.createElement('li'); li.textContent = t; li.style.margin = '4px 0'; ol.appendChild(li); });
    o.addEventListener('click', function (e) { if (e.target === o || e.target.tagName === 'BUTTON') o.remove(); });
    document.body.appendChild(o);
  }
  function mount() {
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', h[0]); b.textContent = '❔ ' + (h[0].indexOf('วิธีเล่น') === 0 ? 'วิธีเล่น' : 'วิธีใช้');
    b.style.cssText = 'position:fixed;right:10px;top:calc(8px + env(safe-area-inset-top));z-index:2147483500;font-family:Mitr,Sarabun,sans-serif;font-size:13px;padding:6px 11px;border-radius:999px;border:1px solid rgba(242,193,78,.6);background:rgba(43,22,40,.85);color:#f2c14e;cursor:pointer;backdrop-filter:blur(4px)';
    b.addEventListener('click', open); document.body.appendChild(b);
    try { var k = 'spw_help_seen_' + id; if (!localStorage.getItem(k)) { localStorage.setItem(k, '1'); setTimeout(open, 600); } } catch (e) { /* ignore */ }
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
