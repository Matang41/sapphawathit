/* ============================================================
   report.js — รุ่น 3.2: ส่งออกรายชื่อสมาชิกชมรมเป็น DOCX / PDF สำหรับรายงานโรงเรียน
   เลือกขอบเขต (ทั้งหมด/กรรมการ/รอบซ้อม/รายระดับชั้น) คอลัมน์ หัวเรื่อง และบล็อกลงชื่อครูที่ปรึกษา
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP, C = M.C;
  const { $, $$, esc, toast, modal } = M; const { fld, opt } = A;
  const SC = [['all', 'สมาชิกทั้งหมด'], ['committee', 'เฉพาะคณะกรรมการ'], ['am', 'ผู้ซ้อมรอบเช้า'], ['pm', 'ผู้ซ้อมรอบเย็น']].concat([1, 2, 3, 4, 5, 6].map(g => ['g' + g, 'ม.' + g + ' ทั้งระดับชั้น']));
  /* [id, หัวคอลัมน์, น้ำหนักความกว้าง, จัดชิด, เลือกตั้งต้น, ต้องมีสิทธิ์ดูข้อมูลติดต่อ] */
  const COLS = [['sid', 'เลขประจำตัว', 13, 'c', 1, 0], ['cls', 'ชั้น', 8, 'c', 1, 0], ['type', 'ประเภทสมาชิก', 12, 'c', 1, 0], ['role', 'ตำแหน่ง', 16, '', 1, 0], ['inst', 'เครื่องดนตรี', 22, '', 1, 0], ['ses', 'รอบซ้อม', 11, 'c', 0, 0], ['lv', 'ระดับฝีมือสูงสุด', 15, 'c', 0, 0], ['parent', 'ผู้ปกครอง / เบอร์โทร', 26, '', 0, 1], ['phone', 'เบอร์โทรนักเรียน', 14, 'c', 0, 1]];
  const sidsOf = sc => {
    const ms = A.members(); let l = A.activeSids();
    if (sc === 'committee') l = l.filter(s => A.roleOf(s)); else if (sc === 'am' || sc === 'pm') l = l.filter(s => ms[s][sc]); else if (/^g[1-6]$/.test(sc)) l = l.filter(s => +ms[s].grade === +sc.slice(1));
    return sc === 'committee' ? l.sort((a, b) => A.ROLE_ORDER.indexOf(A.roleOf(a).role) - A.ROLE_ORDER.indexOf(A.roleOf(b).role) || (A.roleOf(a).grade || 0) - (A.roleOf(b).grade || 0)) : l.sort(A.byClass);
  };
  async function privOf(sids) {
    const o = {};
    if (A.teacher()) { try { const all = (await B.get('privateInfo')) || {}; sids.forEach(s => { o[s] = all[s] || {}; }); return o; } catch (e) { /* ลองรายคน */ } }
    await Promise.all(sids.map(async s => { try { o[s] = (await B.get('privateInfo/' + s)) || {}; } catch (e) { o[s] = {}; } })); return o;
  }
  function form() {
    const S = A.school(), priv = A.can.edit();
    const w = modal('<h3>ส่งออกรายชื่อสมาชิก (DOCX / PDF)</h3><form class="form" onsubmit="return false">' + fld('หัวเรื่องเอกสาร', '<input class="in" id="r-t" value="รายชื่อสมาชิกชมรม' + esc(C.club.name) + '">') +
      fld('ข้อความใต้หัวเรื่อง (ไม่บังคับ)', '<input class="in" id="r-s" placeholder="เช่น เพื่อประกอบการขออนุญาต… / รายงานผู้บริหาร">') + fld('ขอบเขต', '<select class="in" id="r-sc">' + opt(SC) + '</select>') +
      '<div class="fld"><span>คอลัมน์ที่ต้องการ (ชื่อ - สกุล และลำดับมีเสมอ)</span><div class="checks">' + COLS.filter(c => !c[5] || priv).map(c => '<label class="ck"><input type="checkbox" name="rc" value="' + c[0] + '"' + (c[4] ? ' checked' : '') + '><span>' + esc(c[1]) + '</span></label>').join('') + '</div></div>' +
      '<label class="ck wide"><input type="checkbox" id="r-th"><span>ใช้เลขไทย</span></label><label class="ck wide"><input type="checkbox" id="r-sg" checked><span>มีช่องลงชื่อครูที่ปรึกษาท้ายเอกสาร</span></label>' + (A.mySigRec && A.mySigRec() ? '<label class="ck wide"><input type="checkbox" id="r-si" checked><span>ใส่ลายเซ็นครู (เฉพาะ PDF)</span></label>' : '') +
      '<div class="g3">' + fld('ชื่อผู้ลงนาม', '<input class="in" id="r-sn" value="' + esc(S.teacher || '') + '">') + fld('ตำแหน่ง', '<input class="in" id="r-sp" value="ครูที่ปรึกษาชมรม">') + '</div>' +
      '<div class="xlist" style="margin-top:12px"><button type="button" class="xbtn" data-x="pdf"><b>PDF</b><span>สำหรับพิมพ์ (คอลัมน์มาก ระบบจัดเป็นแนวนอนให้)</span></button><button type="button" class="xbtn" data-x="docx"><b>DOCX</b><span>เปิดแก้ต่อใน Word (ฟอนต์ TH SarabunPSK)</span></button></div><div class="muted" id="x-msg" style="margin-top:10px"></div><button type="button" class="btn ghost block" data-close style="margin-top:12px">ปิด</button></form>', { sticky: true, wide: true });
    w.addEventListener('click', async e => {
      const b = e.target.closest('[data-x]'); if (!b || w.dataset.busy) return; const v = id => $(id, w).value.trim(), msg = $('#x-msg', w); w.dataset.busy = '1'; msg.textContent = 'กำลังสร้างไฟล์ …';
      try {
        const sc = v('#r-sc'), sids = sidsOf(sc), ms = A.members(), cols = COLS.filter(c => $$('input[name=rc]:checked', w).some(x => x.value === c[0])), th = $('#r-th', w).checked, sign = $('#r-sg', w).checked;
        const P = cols.some(c => c[0] === 'parent' || c[0] === 'phone') ? await privOf(sids) : {};
        const val = (c, s) => { const m = ms[s], p = P[s] || {};
          return c[0] === 'sid' ? s : c[0] === 'cls' ? A.cls(m) : c[0] === 'type' ? A.typeName(m.type) : c[0] === 'role' ? (A.roleName(A.roleOf(s)) || '-') : c[0] === 'inst' ? (A.insts(m).join(', ') || '-') : c[0] === 'ses' ? (m.am && m.pm ? 'เช้า/เย็น' : m.am ? 'เช้า' : m.pm ? 'เย็น' : '-') : c[0] === 'lv' ? (A.topLv(s) ? A.lvName(A.topLv(s)) : '-') : c[0] === 'parent' ? ([p.parentName, p.parentPhone].filter(Boolean).join(' ') || '-') : (p.phone || '-'); };
        const tn = x => th ? M.thNum(x) : x, head = ['ลำดับ', 'ชื่อ - สกุล'].concat(cols.map(c => c[1])), rows = sids.map((s, i) => [tn(String(i + 1)), A.fullName(ms[s])].concat(cols.map(c => tn(String(val(c, s)))))), widths = [6, 26].concat(cols.map(c => c[2])), align = ['c', ''].concat(cols.map(c => c[3]));
        const title = v('#r-t') || 'รายชื่อสมาชิกชมรม' + C.club.name, scName = SC.find(x => x[0] === sc)[1], sub = [C.club.full + ' ปีการศึกษา ' + tn(A.year()), v('#r-s'), scName + ' จำนวน ' + tn(String(sids.length)) + ' คน'].filter(Boolean);
        const sn = v('#r-sn'), sp = v('#r-sp') || 'ครูที่ปรึกษาชมรม', dateTxt = tn(M.thDate(Date.now())), name = 'รายชื่อสมาชิก' + M.safeName(C.club.name) + '-' + M.safeName(scName) + '-' + A.year();
        if (b.dataset.x === 'docx') {
          const P_ = M.wPara, R = M.wRun, ws = widths.map(x => Math.round(9638 * x / widths.reduce((a, c) => a + c, 0))), sz = cols.length > 5 ? 24 : 28;
          const body = P_(R(title, { b: true, sz: 40 }), { jc: 'center' }) + sub.map((l, i) => P_(R(l, { sz: 30 }), { jc: 'center', after: i === sub.length - 1 ? 160 : 0 })).join('') + M.wTable([head].concat(rows), ws, { head: true, align: align.map(a => a === 'c' ? 'center' : 'left'), sz }) + P_('', {}) +
            (sign ? P_(R('ลงชื่อ ........................................................', { sz: 30 }), { jc: 'right' }) + P_(R('( ' + (sn || '........................................') + ' )', { sz: 30 }), { jc: 'right' }) + P_(R(sp, { sz: 30 }), { jc: 'right' }) : '') + P_(R('ข้อมูล ณ วันที่ ' + dateTxt, { sz: 26 }), { jc: 'right' });
          await M.saveBlob(M.docxDoc(body), name + '.docx');
        } else {
          const land = cols.length > 5, sg = A.mySigRec && A.mySigRec(), sigImg = (sg && $('#r-si', w) && $('#r-si', w).checked) ? '<div><img src="' + sg.img + '" style="height:54px" alt=""></div>' : '', after = sign ? '<div style="margin:22px 24px 0 auto;width:320px;text-align:center;font-size:16px;line-height:1.7">' + sigImg + 'ลงชื่อ ........................................<br>( ' + (sn ? esc(sn) : '........................................') + ' )<br>' + esc(sp) + '</div>' : '';
          const root = A.tablePages(title, sub.join(' · '), head, rows, { widths, align, per: land ? (sign ? 10 : 15) : (sign ? 19 : 25), after, foot: 'ข้อมูล ณ ' + dateTxt + ' ·' });
          if (land) Array.from(root.children).forEach(p => p.classList.add('land'));
          await M.exportPDF(root, name + '.pdf');
        }
        msg.textContent = 'เสร็จแล้ว'; A.log('export', '', 'roster ' + b.dataset.x + ' ' + sc);
      } catch (er) { console.error(er); msg.textContent = 'ส่งออกไม่สำเร็จ: ' + (er.message || er); }
      delete w.dataset.busy;
    });
  }
  A.ACT.rosterExport = () => { if (A.can.exp()) form(); };
  A.MANAGE.push(() => '<section class="card"><div class="lb">รายงานรายชื่อสมาชิก</div><div class="muted" style="margin-bottom:10px">ส่งออกรายชื่อเป็น DOCX / PDF เลือกขอบเขตและคอลัมน์ได้ สำหรับรายงานหรือขออนุญาตทางโรงเรียน</div><button class="btn" data-act="rosterExport">ส่งออกรายชื่อสมาชิก</button></section>');
})();
