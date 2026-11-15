/* ============================================================
   skill.js — ส่งผลการเล่นเกมเป็น “ทักษะดนตรี” ไปให้แอปชมรมเก็บไว้ในหน้าสรุปทักษะของครู
   ทักษะ 4 ด้าน
     ear    ฟัง      — แยกระดับเสียง ทายโน้ต ทำนองขึ้น/ลง
     rhythm จังหวะ   — ตีตรงจังหวะ ฟังหน้าทับ ตีเข้ากับวง
     melody ทำนอง    — จำและอ่านทำนองเพลงไทยทีละบรรทัด (8 ห้อง)
     inst   เครื่องดนตรี — ฟังแล้วบอกได้ว่าเป็นเครื่องอะไร
   ใช้: SKILL('rhythm', 0.85, {game:'pujae', lv:1})   ค่าความแม่นยำ 0–1 ต่อหนึ่งครั้งที่ทำ
   ถ้าเปิดเกมจากในแอป: ส่งให้แอปทันที (postMessage) · ถ้าเปิดเกมเดี่ยว ๆ: เก็บไว้ในเครื่อง แอปจะส่งให้ตอนเปิดครั้งถัดไป
   พัฒนาโดย นายนนทพัทธ์ วงค์มูล 2026
   ============================================================ */
(function () {
  'use strict';
  if (window.SKILL) return;
  const KS = ['ear', 'rhythm', 'melody', 'inst'], QK = 'spw_skill_q';
  function queue(m) {
    try { const q = JSON.parse(localStorage.getItem(QK) || '[]'); q.push(m); localStorage.setItem(QK, JSON.stringify(q.slice(-400))); } catch (e) { /* ignore */ }
  }
  const HUB = ['https://matang-smart-hub.web.app', 'https://matang-smart-hub.firebaseapp.com'];
  function hubOrigin() {
    let o = '';
    try { const a = location.ancestorOrigins; if (a && a.length) o = a[0]; } catch (e) { /* ignore */ }
    if (!o) { try { o = new URL(document.referrer).origin; } catch (e) { /* ignore */ } }
    if (HUB.indexOf(o) >= 0) { try { sessionStorage.setItem('spw_hub', o); } catch (e) { /* ignore */ } return o; }
    if (o === location.origin) { try { o = sessionStorage.getItem('spw_hub') || ''; } catch (e) { o = ''; } return HUB.indexOf(o) >= 0 ? o : ''; }
    return '';
  }
  window.SKILL = function (k, v, info) {
    if (KS.indexOf(k) < 0) return;
    v = Math.max(0, Math.min(1, +v || 0));
    const m = { type: 'spw-skill', k: k, v: Math.round(v * 100), g: String((info && info.game) || '').slice(0, 24), at: Date.now() };
    const P = window.parent;
    /* เปิดในกรอบของ MaTang Smart Hub (สมุดวิชาดนตรี): ส่งผลให้ Hub เก็บเอง */
    if (P && P !== window) { const po = hubOrigin(); if (po) { try { P.postMessage(m, po); } catch (e) { /* ignore */ } return; } }
    if (P && P !== window) { try { P.postMessage(m, location.origin); return; } catch (e) { /* ตกไปเก็บในเครื่อง */ } }
    queue(m);
  };
  window.SKILL.KS = KS;
})();
