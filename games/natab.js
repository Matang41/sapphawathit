/* ============================================================
   natab.js — คลังหน้าทับกลองแขก ใช้ร่วมกันระหว่าง “กลองแขกคู่ขวัญ” และ “เครื่องกำกับจังหวะ”

   ที่มาของโน้ต: เอกสารประกอบรายวิชา 2062211 หน้าทับดนตรีไทย บทที่ 3 หน้าทับกลองแขก
                อาจารย์สุธินันท์ โสภาภาค มหาวิทยาลัยราชภัฏนครปฐม

   วิธีเขียนโน้ต: ห้องละ 4 ตัว เว้นวรรคระหว่างห้อง
     ต = ติง (ตัวผู้ หน้ารุ่ย)   โ = โจ๊ะ (ตัวผู้ หน้าต่าน)
     ท = ทั่ม (ตัวเมีย หน้ารุ่ย)  จ = จ๊ะ (ตัวเมีย หน้าต่าน)   - = เว้น
   ถ้าตัวผู้กับตัวเมียตีพร้อมกัน ให้เขียนแยกสองแถว คั่นด้วย /   (แถวแรกตัวผู้ / แถวสองตัวเมีย)

   อัตราจังหวะ (r) กำหนดตำแหน่งฉิ่ง–ฉับ ซึ่งตกตัวท้ายเสมอ สลับ ฉิ่ง → ฉับ
     3 = สามชั้น  ทุก 2 ห้อง   ·   2 = สองชั้น  ท้ายทุกห้อง   ·   1 = ชั้นเดียว  ทุกครึ่งห้อง
   sec = ช่วงที่บรรเลงต่อกัน (เถา = สามชั้น → สองชั้น → ชั้นเดียว) · n = จำนวนเที่ยวของช่วงนั้น
   end = ห้องลงจบ ตีครั้งเดียวตอนท้าย
   ============================================================ */
(function () {
  'use strict';
  const SYM = ['ติง', 'โจ๊ะ', 'ทั่ม', 'จ๊ะ'];
  const TOK = { 'ต': 0, 'โ': 1, 'ท': 2, 'จ': 3, '-': null };
  const RATE = { 1: { n: 'ชั้นเดียว', ev: 2 }, 2: { n: 'สองชั้น', ev: 4 }, 3: { n: 'สามชั้น', ev: 8 } };

  /* ---------- โน้ตจากเอกสาร ---------- */
  const PK3 = '-ท-ต -โ-จ -โ-จ -โ-จ ---- -โ-จ -โ-จ -โ-จ -ต-ต -ทตท ตท-ต -โ-จ -ต-ท -ต-ต -ท-ต -ต-ท';
  const PK2 = '-ท-ต -โ-จ -โ-จ -โ-จ -ต-ท -ต-ต -ท-ต -ต-ท';
  const PK1 = '--ตท -ต-- ตท-ต -ทตท';
  const SM3 = '-ท-ต -โ-จ -โ-จ -โ-จ -ต-ต -ทตท -ต-ต -ทตท';
  const SM2 = '--โจ ตต-ต --โจ ตต-ท';
  const SM1 = '--โจ ตต-ท';
  const SD3 = '-ท-ต -โ-จ -โ-จ -โ-จ ---- -โ-จ -โ-จ -โ-จ --ตต --ทท --ทท --ตต --ตต --ทท -ต-ท ตท-ต';
  const SD2 = '-ท-ต -โ-จ -โ-จ -โ-จ -ต-ท ตท-ต -ต-ท ตท-ต';
  const SD1 = '-โ-จ -โ-จ -ต-ท ตท-ต';
  const KM3 = '---- -โ-จ -โ-จ ---- -โ-จ -โ-จ -โ-จ -ต-ท ---- -โ-จ -โ-จ -ต-ท -โ-จ -ต-ท -ต-ท -โ-จ';
  const KM2 = '---- -โ-จ -โ-จ -ต-ท -โ-จ -ต-ท -ต-ท -โ-จ';
  const KM1 = '-โ-จ -ต-ท -ต-ท -โ-จ';
  const LUKMOD = '--ตโ -ต-ต -โตโ -ต-- --ตโ -ต-ต -โตโ -ต-- / ---- -จ-ท ---ท -จ-- -จ-จ -ท-ท ---ท -จ--';

  const SRC = 'เอกสารหน้าทับกลองแขก อ.สุธินันท์ โสภาภาค';
  const LIST = [
    { id: 'pk3', grp: 'ปรบไก่', name: 'ปรบไก่ สามชั้น', sec: [{ s: PK3, r: 3 }], tip: '16 ห้อง หน้าทับพื้นฐานที่ต้องฝึกก่อน ช่วงแรกโจ๊ะ–จ๊ะ ช่วงหลังติง–ทั่ม' },
    { id: 'pk2', grp: 'ปรบไก่', name: 'ปรบไก่ สองชั้น', sec: [{ s: PK2, r: 2 }], tip: '8 ห้อง ใช้บ่อยที่สุดในวง' },
    { id: 'pk1', grp: 'ปรบไก่', name: 'ปรบไก่ ชั้นเดียว', sec: [{ s: PK1, r: 1 }], tip: '4 ห้อง กระชับ ตีถี่' },
    { id: 'pkT', grp: 'ปรบไก่', name: 'ปรบไก่ เถา', sec: [{ s: PK3, r: 3 }, { s: PK2, r: 2 }, { s: PK1, r: 1 }], tip: 'สามชั้น → สองชั้น → ชั้นเดียว ต่อกัน ฉิ่งเปลี่ยนอัตราตามช่วง' },
    { id: 'sm3', grp: 'สองไม้', name: 'สองไม้ สามชั้น', sec: [{ s: SM3, r: 3 }], tip: '8 ห้อง' },
    { id: 'sm2', grp: 'สองไม้', name: 'สองไม้ สองชั้น', sec: [{ s: SM2, r: 2 }], end: 'ต---', tip: '4 ห้อง ลงจบด้วยติง' },
    { id: 'sm1', grp: 'สองไม้', name: 'สองไม้ ชั้นเดียว', sec: [{ s: SM1, r: 1 }], end: 'ต---', tip: '2 ห้อง ลงจบด้วยติง' },
    { id: 'smT', grp: 'สองไม้', name: 'สองไม้ เถา', sec: [{ s: SM3, r: 3 }, { s: SM2, r: 2 }, { s: SM1, r: 1 }], end: 'ต---', tip: 'สามชั้น → สองชั้น → ชั้นเดียว แล้วลงจบ' },
    { id: 'sd3', grp: 'สดายง', name: 'สดายง สามชั้น', sec: [{ s: SD3, r: 3 }], tip: '16 ห้อง ช่วงหลังตีคู่ ติงติง ทั่มทั่ม' },
    { id: 'sd2', grp: 'สดายง', name: 'สดายง สองชั้น', sec: [{ s: SD2, r: 2 }], tip: '8 ห้อง' },
    { id: 'sd1', grp: 'สดายง', name: 'สดายง ชั้นเดียว', sec: [{ s: SD1, r: 1 }], tip: '4 ห้อง' },
    { id: 'sdT', grp: 'สดายง', name: 'สดายง เถา', sec: [{ s: SD3, r: 3 }, { s: SD2, r: 2 }, { s: SD1, r: 1 }], tip: 'สามชั้น → สองชั้น → ชั้นเดียว' },
    { id: 'km3', grp: 'เขมร', name: 'เขมร สามชั้น', sec: [{ s: KM3, r: 3 }], tip: '16 ห้อง ขึ้นต้นด้วยห้องว่าง' },
    { id: 'km2', grp: 'เขมร', name: 'เขมร สองชั้น', sec: [{ s: KM2, r: 2 }], tip: '8 ห้อง' },
    { id: 'km1', grp: 'เขมร', name: 'เขมร ชั้นเดียว', sec: [{ s: KM1, r: 1 }], tip: '4 ห้อง' },
    { id: 'kmT', grp: 'เขมร', name: 'เขมร เถา', sec: [{ s: KM3, r: 3 }, { s: KM2, r: 2 }, { s: KM1, r: 1 }], tip: 'สามชั้น → สองชั้น → ชั้นเดียว' },
    { id: 'lao', grp: 'หน้าทับภาษาและอื่น ๆ', name: 'หน้าทับลาว', sec: [{ s: '-ต-โ -ต-ต ---ท -ต-ท', r: 2 }], tip: '4 ห้อง (เอกสารไม่ระบุอัตรา ตั้งไว้สองชั้น)' },
    { id: 'khaek1', grp: 'หน้าทับภาษาและอื่น ๆ', name: 'หน้าทับแขกตัวเดียว', sec: [{ s: '--จ- -จ-ท -ท-ท -จ-ท', r: 2 }], tip: '4 ห้อง ใช้กลองลูกเดียว (ตัวเมีย) · เอกสารไม่ระบุอัตรา ตั้งไว้สองชั้น' },
    { id: 'mon', grp: 'หน้าทับภาษาและอื่น ๆ', name: 'หน้าทับมอญ', sec: [{ s: '---- -ต-โ -ท-ต -ท-ต', r: 2 }], tip: '4 ห้อง (เอกสารไม่ระบุอัตรา ตั้งไว้สองชั้น)' },
    { id: 'lukmod', grp: 'หน้าทับภาษาและอื่น ๆ', name: 'ลูกหมด', sec: [{ s: LUKMOD, r: 1 }], tip: '8 ห้อง ตัวผู้กับตัวเมียมีบางตัวตีพร้อมกัน · เอกสารไม่ระบุอัตรา ตั้งไว้ชั้นเดียว' },
    /* แบบฝึกพื้นฐาน (แต่งเพิ่มสำหรับมือใหม่ ไม่ได้มาจากเอกสาร) */
    { id: 'p1', grp: 'แบบฝึกพื้นฐาน', name: 'แบบฝึก ๑ · ติง–ทั่ม ตอบกัน', sec: [{ s: '---ต ---ท ---ต ---ท', r: 2 }], tip: 'สำหรับมือใหม่ ฟังฉิ่งแล้วตีตัวท้ายห้อง' },
    { id: 'p2', grp: 'แบบฝึกพื้นฐาน', name: 'แบบฝึก ๒ · ถามตอบถี่ขึ้น', sec: [{ s: '-ต-ท -ต-ท -ต-ท -ตทท', r: 2 }], tip: 'ตีสลับทีละลูก' },
    { id: 'p3', grp: 'แบบฝึกพื้นฐาน', name: 'แบบฝึก ๓ · โจ๊ะ–จ๊ะ หน้าต่าน', sec: [{ s: '-โ-จ -โ-จ -โ-จ -โ-จ', r: 2 }], tip: 'ซ้อมหน้าต่านก่อนเข้าปรบไก่' }
  ];
  LIST.forEach(p => { p.src = p.grp === 'แบบฝึกพื้นฐาน' ? 'แต่งเพิ่มสำหรับฝึกพื้นฐาน' : SRC; });

  /* ---------- แปลงโน้ตเป็นช่อง ---------- */
  function parseLine(line) {
    const bars = String(line || '').trim().split(/\s+/).filter(Boolean), out = [];
    for (let i = 0; i < bars.length; i++) {
      const ch = Array.from(bars[i]);
      if (ch.length !== 4) return { err: 'ห้องที่ ' + (i + 1) + ' มี ' + ch.length + ' ตัว (ต้องมี 4 ตัว)' };
      for (const c of ch) { if (!(c in TOK)) return { err: 'ห้องที่ ' + (i + 1) + ' มีตัว “' + c + '” ที่ใช้ไม่ได้' }; out.push(TOK[c]); }
    }
    return { slots: out, bars: bars.length };
  }
  /* คืน { slots:[[lane,...],...], bars } — ช่องว่างคืน [] */
  function parse(str) {
    str = String(str || '').trim();
    if (!str) return { slots: [[], [], [], []], bars: 1, empty: true };
    const layers = str.split('/').map(parseLine);
    const bad = layers.find(l => l.err); if (bad) return { err: bad.err };
    const n = layers[0].slots.length;
    if (layers.some(l => l.slots.length !== n)) return { err: 'แถวตัวผู้กับแถวตัวเมียยาวไม่เท่ากัน' };
    if (layers[0].bars > 64) return { err: 'ยาวเกิน 64 ห้อง' };
    const slots = [];
    for (let i = 0; i < n; i++) { const s = []; layers.forEach(l => { const v = l.slots[i]; if (v != null && !s.includes(v)) s.push(v); }); slots.push(s); }
    return { slots, bars: layers[0].bars };
  }
  function check(p) {
    if (!p || !Array.isArray(p.sec) || !p.sec.length) return 'ไม่มีโน้ต';
    for (const s of p.sec) { const r = parse(s.s); if (r.err) return r.err; if (!RATE[s.r]) return 'อัตราจังหวะไม่ถูกต้อง'; }
    if (p.end) { const r = parse(p.end); if (r.err) return 'ห้องลงจบ: ' + r.err; }
    return '';
  }
  /* สร้างลำดับช่องทั้งเพลง
     opt.rate  : ใช้อัตรานี้แทน (เฉพาะหน้าทับช่วงเดียว)
     opt.fill  : เล่นซ้ำช่วงเดียวให้ได้อย่างน้อยกี่ห้อง (เกม)
     opt.end   : ใส่ห้องลงจบหรือไม่ (ค่าเริ่ม true)
     คืน [{ l:[lanes], ch:0|1|2 (ไม่มี|ฉิ่ง|ฉับ), sec, rate, end }] */
  function timeline(p, opt) {
    opt = opt || {}; const out = [];
    p.sec.forEach((s, si) => {
      const P = parse(s.s), rate = (p.sec.length === 1 && opt.rate) ? opt.rate : s.r, ev = RATE[rate].ev;
      let n = s.n || 1; if (opt.fill && p.sec.length === 1) n = Math.max(n, Math.ceil(opt.fill / P.bars));
      let k = 0;
      for (let r = 0; r < n; r++) P.slots.forEach(l => { out.push({ l: l.slice(), ch: (k % ev) === ev - 1 ? (Math.floor(k / ev) % 2 === 0 ? 1 : 2) : 0, sec: si, rate }); k++; });
    });
    if (p.end && opt.end !== false) {
      const E = parse(p.end), last = out[out.length - 1];
      E.slots.forEach(l => out.push({ l: l.slice(), ch: 0, sec: last ? last.sec : 0, rate: last ? last.rate : 2, end: true }));
    }
    return out;
  }
  /* ฉิ่งช่วงนับเข้า (ช่องที่ -n..-1) ให้สลับต่อเนื่องกับช่วงแรก */
  function countInCh(k, rate) { const ev = RATE[rate].ev, m = ((k % ev) + ev) % ev; if (m !== ev - 1) return 0; return ((Math.floor(k / ev) % 2) + 2) % 2 === 0 ? 1 : 2; }
  function get(id) { return LIST.find(p => p.id === id) || null; }
  function single(str, rate, name) { return { id: 'custom', name: name || 'หน้าทับที่พิมพ์เอง', sec: [{ s: str, r: rate || 2 }] }; }
  function rateText(p) { return p.sec.map(s => RATE[s.r].n).filter((v, i, a) => a.indexOf(v) === i).join(' → '); }
  function bars(p) { return p.sec.reduce((a, s) => a + parse(s.s).bars, 0); }

  window.NATAB = { SYM, RATE, LIST, parse, check, timeline, countInCh, get, single, rateText, bars };
})();
