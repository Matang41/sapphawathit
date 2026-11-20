/* ============================================================
   court2.js — รุ่น 3.47: ส่วนต่อขยายศาลชมรม
   1) รื้อฟื้นคดี: ยื่นได้ภายใน 30 วันนับจากวันตัดสิน (ผู้ต้องหายื่นคำร้อง · ครูเปิดเองได้) ครูตั้งศาลชุดใหม่ ห้ามคนในคณะเดิมร่วมคณะ
      ถ้าศาลรื้อฟื้นยกฟ้อง → ยกเลิกโทษเดิมอัตโนมัติ (ทัณฑ์บน/จำตรุ/ลดยศ/ถอดยศ/ขับออก)
   2) ทวงความยุติธรรม: เมื่อศาลรื้อฟื้นเห็นว่าคำตัดสินเดิมไม่เป็นธรรม ครูฟ้องไต่สวนผู้พิพากษา/ลูกขุนชุดเดิมได้ (เปิดเป็นคดีใหม่ ใช้ขั้นตอนเดิม)
   3) หมายศาลเป็นภาพ (หมายเรียก · หมายนัด · คำพิพากษา) บันทึกเป็นภาพหรือแชร์เข้าแชทผ่านเมนูแชร์ของเครื่อง
   4) แนบพยานหลักฐาน: ภาพย่อ (≤150KB) + ลิงก์ ไม่เกิน 5 ชิ้นต่อคน เก็บที่ c/{ชมรม}/courte/{id}/{sid}_{n} ครูกด “รับเป็นหลักฐาน” ได้
   พัฒนาโดย นายนนทพัทธ์ วงค์มูล 2026
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP, C = window.COURT;
  if (!M || !B || !A || !C || !C.X || !A.V || !A.V.court) return;
  const X = C.X, $ = M.$, esc = M.esc, toast = M.toast, modal = M.modal, fld = A.fld;
  const T = () => A.teacher(), me = () => A.sid(), cid = () => M.C.club.id;
  const DAY = 864e5, LIM = 30 * DAY, MAXEV = 5;
  const caseNo = X.caseNo, dt = X.dt, PN = X.PN, clubName = X.clubName;

  const st = document.createElement('style');
  st.textContent = '.ct-evs{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-top:6px}.ct-ev{border:1px solid var(--line);border-radius:8px;padding:6px;font-size:.8rem}.ct-ev.ok{border-color:#3f9a55;box-shadow:0 0 0 1px #3f9a55 inset}.ct-ev img{width:100%;height:90px;object-fit:cover;border-radius:6px;display:block}.ct-evi{padding:0;border:0;background:none;width:100%;cursor:pointer;display:block}.ct-ev .r{display:flex;gap:4px;flex-wrap:wrap;margin-top:4px}.ct-big img{max-width:100%;border-radius:8px;display:block;margin:0 auto}.ct-sum{width:100%;height:auto;border:1px solid var(--line);border-radius:6px;display:block}.ct-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.ct-rt{border-left:4px solid #8c1d2b}';
  document.head.appendChild(st);

  const rtLeft = x => (x.vAt || 0) + LIM - Date.now();
  const canRt = x => !!(x && x.verdict && x.verdict.g && (x.st === 'done' || x.st === 'closed') && !x.rtd && !x.rtx && !(x.apr && x.apr.r === 'drop') && !x.re && rtLeft(x) > 0);
  const dleft = ms => Math.max(1, Math.ceil(ms / DAY)) + ' วัน';
  const href = k => '#/court/' + esc(k);

  /* ---------- 4) พยานหลักฐาน ---------- */
  const EV = {};
  function evOf(q) { const k = q.key; if (!EV[k]) { EV[k] = { v: {} }; B.on(X.CP(q.c) + 'courte/' + q.id, v => { EV[k].v = v || {}; A.rerender(); }, () => { EV[k].err = 1; }); } return EV[k]; }
  const canEv = q => { const x = q.x, s = me(); if (T()) return x.st !== 'closed'; return !!s && x.st === 'def' && (x.d === s || !!(x.wit || {})[s]); };
  const sideTxt = v => v.side === 'd' ? 'ฝ่ายผู้ต้องหา' : v.side === 'w' ? 'พยาน' : 'ศาล/โจทก์';
  function evHtml(q) {
    const x = q.x, e = evOf(q).v, ks = Object.keys(e).sort((a, b) => (e[a].at || 0) - (e[b].at || 0)), K = esc(q.key), s = me();
    let h = '<section class="card ct-rec"><div class="lb">📎 พยานหลักฐาน (' + ks.length + ')</div>';
    if (!ks.length) h += '<div class="muted">ยังไม่มีหลักฐานแนบ</div>';
    else h += '<div class="ct-evs">' + ks.map(k => { const v = e[k], ok = (x.evok || {})[k], mine = T() || v.s === s;
      return '<div class="ct-ev' + (ok ? ' ok' : '') + '">' + (v.img ? '<button class="ct-evi" data-act="ctEvView" data-k="' + K + '" data-e="' + esc(k) + '"><img src="' + esc(v.img) + '" alt="' + esc(v.cap || 'หลักฐาน') + '"></button>' : '<button class="ct-evi" data-act="ctEvView" data-k="' + K + '" data-e="' + esc(k) + '" style="font-size:1.8rem;height:90px">🔗</button>') +
        '<div><b>' + esc(v.cap || '') + '</b></div><div class="muted" style="font-size:.74rem">' + esc(sideTxt(v)) + ' · ' + esc(v.n || '') + '</div>' + (ok ? '<div style="color:#3f9a55;font-size:.74rem">✓ ศาลรับเป็นหลักฐาน</div>' : '') +
        '<div class="r">' + (T() ? '<button class="btn sm ' + (ok ? 'ghost' : 'gold') + '" data-act="ctEvOk" data-k="' + K + '" data-e="' + esc(k) + '">' + (ok ? 'ยกเลิกรับ' : 'รับเป็นหลักฐาน') + '</button>' : '') + (mine && x.st !== 'closed' && (T() || x.st === 'def') ? '<button class="btn sm ghost" data-act="ctEvDel" data-k="' + K + '" data-e="' + esc(k) + '">ลบ</button>' : '') + '</div></div>'; }).join('') + '</div>';
    if (canEv(q)) h += '<div class="row" style="margin-top:10px"><button class="btn gold" data-act="ctEvAdd" data-k="' + K + '">📎 แนบหลักฐาน</button></div><div class="muted" style="font-size:.75rem;margin-top:4px">แนบได้ ' + MAXEV + ' ชิ้นต่อคน · ภาพถูกย่อให้อัตโนมัติ · ผู้ต้องหาและพยานแนบได้ในช่วงแก้ต่าง</div>';
    return h + '</section>';
  }
  function shrink(file) { return new Promise((res, rej) => { const u = URL.createObjectURL(file), im = new Image();
    im.onload = () => { let m = 1280, q = .8, out = ''; for (let i = 0; i < 10; i++) { const r = Math.min(1, m / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.width * r)); c.height = Math.max(1, Math.round(im.height * r));
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height); out = c.toDataURL('image/jpeg', q); if (out.length <= 200000) break; if (q > .5) q -= .1; else m = Math.round(m * .75); }
      URL.revokeObjectURL(u); out.length <= 220000 ? res(out) : rej(new Error('ภาพใหญ่เกินไป')); };
    im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('เปิดไฟล์ภาพไม่ได้')); }; im.src = u; }); }

  /* ---------- 3) หมายศาลเป็นภาพ ---------- */
  function wrap(g, t, mw) { const out = []; String(t || '').split('\n').forEach(par => { const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? Array.from(new Intl.Segmenter('th', { granularity: 'word' }).segment(par), s => s.segment) : Array.from(par); let line = ''; seg.forEach(w => { if (line && g.measureText(line + w).width > mw) { out.push(line.trimEnd()); line = w.replace(/^\s+/, ''); } else line += w; }); out.push(line); }); return out; }
  function kindsOf(q) { const x = q.x, k = [['sum', 'หมายเรียก']]; if (x.hear) k.push(['hear', 'หมายนัดฟังคำพิพากษา']); if (x.verdict && !x.verdict.drop) k.push(['ver', 'คำพิพากษา']); return k; }
  function rowsOf(q, kind) { const x = q.x, R = [], P = (t, b) => R.push({ t, b }), nm = (x.dn || '') + ' (ชมรม' + clubName(x.dc || q.c) + ')';
    if (kind === 'sum') { P('ถึง ผู้ต้องหา', 1); P(nm); P('ข้อหา', 1); P(X.tagTxt(x.tags)); P('ตามคำฟ้อง', 1); P((x.t || '').slice(0, 280) + ((x.t || '').length > 280 ? '…' : '')); P('ให้ยื่นคำแก้ต่าง พร้อมหลักฐาน ภายใน', 1); P(dt(x.due)); P('โทษสูงสุดที่ขอ: ' + (PN[x.max] || '')); P('คดีนี้เป็นคดีเปิด สมาชิกทุกคนเข้าฟังได้ ผู้ต้องหามีสิทธิ์แก้ต่าง แนบหลักฐานและขอพยานได้'); if (x.re) P(x.re.k === 'jj' ? 'คดีนี้เป็นการไต่สวนการตัดสินที่ถูกเห็นว่าไม่เป็นธรรม' : 'คดีนี้เป็นการรื้อฟื้นคดีเดิม ' + caseNo({ no: x.re.no, y: x.re.y })); }
    else if (kind === 'hear') { P('ถึง ผู้ต้องหาและผู้เกี่ยวข้อง', 1); P(nm); P('ศาลนัดอ่านคำพิพากษา', 1); P(dt(x.hear) + (x.place ? ' · ' + x.place : '')); P('ผู้เกี่ยวข้องกับคดีโปรดมาตามนัด · คดีเปิด สมาชิกเข้าฟังได้ทุกคน'); }
    else { const v = x.verdict || {}; P('ผู้ต้องหา', 1); P(nm); P('ข้อหา', 1); P(X.tagTxt(x.tags)); P('คำพิพากษา', 1); if (x.tally) P('ลูกขุนลงมติ ผิด ' + x.tally.g + ' · ไม่ผิด ' + x.tally.n); P(v.g ? 'มีความผิด · ' + (PN[v.k] || '') : 'ยกฟ้อง ไม่มีความผิด', 1); if (v.by === 'veto') P('ครูใช้สิทธิ์ยับยั้ง: ' + (v.why || '')); if (v.g) P('ผู้ต้องหายื่นอุทธรณ์ได้ภายใน ๓ วัน และขอรื้อฟื้นคดีได้ภายใน ๓๐ วันนับจากวันตัดสิน (ถึง ' + dt((x.vAt || 0) + LIM) + ')'); }
    return R; }
  const TITLE = { sum: 'หมายเรียกผู้ต้องหา', hear: 'หมายนัดฟังคำพิพากษา', ver: 'คำพิพากษา' };
  function paper(q, kind) { const x = q.x, W = 900, F = '"Sarabun","Noto Sans Thai","Tahoma",sans-serif', cv = document.createElement('canvas'); cv.width = W; cv.height = 40; let g = cv.getContext('2d');
    const rows = rowsOf(q, kind), lines = [], gb = '700 30px ' + F;
    rows.forEach(r => { g.font = r.b ? gb : '30px ' + F; wrap(g, r.t, W - 160).forEach((t, i) => lines.push({ t, b: r.b, gap: i === 0 && lines.length && r.b ? 18 : 0 })); });
    const bodyH = lines.reduce((a, l) => a + 46 + l.gap, 0), H = 400 + bodyH + 300; cv.height = H; g = cv.getContext('2d');
    g.fillStyle = '#fbf3df'; g.fillRect(0, 0, W, H); g.strokeStyle = '#7a1424'; g.lineWidth = 6; g.strokeRect(22, 22, W - 44, H - 44); g.lineWidth = 2; g.strokeRect(36, 36, W - 72, H - 72);
    g.textAlign = 'center'; g.fillStyle = '#7a1424'; g.strokeStyle = '#7a1424'; g.lineWidth = 4; g.beginPath(); g.moveTo(W / 2, 70); g.lineTo(W / 2, 140); g.moveTo(W / 2 - 60, 90); g.lineTo(W / 2 + 60, 90); g.moveTo(W / 2 - 60, 90); g.lineTo(W / 2 - 80, 125); g.lineTo(W / 2 - 40, 125); g.closePath(); g.moveTo(W / 2 + 60, 90); g.lineTo(W / 2 + 40, 125); g.lineTo(W / 2 + 80, 125); g.closePath(); g.moveTo(W / 2 - 30, 142); g.lineTo(W / 2 + 30, 142); g.stroke();
    g.font = '700 48px ' + F; g.fillText('ศาลชมรม' + clubName(q.c), W / 2, 205); g.font = '28px ' + F; g.fillStyle = '#4a2a1c'; g.fillText('คดีเปิด · ' + caseNo(x), W / 2, 248);
    g.font = '700 42px ' + F; g.fillStyle = '#7a1424'; const tt = TITLE[kind] + (kind === 'sum' && x.re ? (x.re.k === 'jj' ? ' (ไต่สวนการตัดสิน)' : ' (คดีรื้อฟื้น)') : ''); g.fillText(tt, W / 2, 316); const tw = g.measureText(tt).width; g.fillRect(W / 2 - tw / 2, 328, tw, 3);
    g.textAlign = 'left'; let y = 392; lines.forEach(l => { y += l.gap; g.font = l.b ? gb : '30px ' + F; g.fillStyle = l.b ? '#7a1424' : '#2a160f'; g.fillText(l.t, 80, y); y += 46; });
    y = H - 270; g.fillStyle = '#4a2a1c'; g.font = '26px ' + F; g.fillText('ออกหมายเมื่อ ' + dt(Date.now()), 80, y); g.fillText('(ลงชื่อ) ..............................................', 80, y + 100); g.fillText('ครูที่ปรึกษาชมรม · ประธานองค์คณะ', 80, y + 140);
    g.save(); g.translate(W - 190, H - 200); g.rotate(-.25); g.strokeStyle = 'rgba(160,20,40,.85)'; g.fillStyle = 'rgba(160,20,40,.85)'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 80, 0, 7); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 68, 0, 7); g.stroke(); g.textAlign = 'center'; g.font = '700 34px ' + F; g.fillText('ศาลชมรม', 0, -2); g.font = '22px ' + F; g.fillText('คดีเปิด', 0, 34); g.restore();
    g.textAlign = 'center'; g.font = '20px ' + F; g.fillStyle = '#8a7a66'; g.fillText('ออกโดยระบบชมรมสรรพวาทิต · พัฒนาโดย นายนนทพัทธ์ วงค์มูล © 2026', W / 2, H - 52);
    return cv; }
  function showSum(q) { const ks = kindsOf(q); let cur = ks[ks.length - 1][0], cv = null;
    const w = modal('<h3>🧾 หมายศาล ' + esc(caseNo(q.x)) + '</h3><div class="ct-tabs" id="sm-t"></div><div id="sm-i"></div><div class="row" style="gap:8px;margin-top:10px"><button type="button" class="btn ghost grow" id="sm-s">💾 บันทึกเป็นภาพ</button><button type="button" class="btn gold grow" id="sm-h">📤 ส่งเข้าแชท / แชร์</button></div><div class="muted" style="font-size:.78rem;margin-top:6px">“ส่งเข้าแชท” เปิดเมนูแชร์ของเครื่อง เลือกแอปแชทที่ต้องการ (ถ้าเครื่องไม่รองรับจะบันทึกเป็นภาพให้แทน)</div><div class="row" style="margin-top:10px"><button type="button" class="btn ghost grow" data-close>ปิด</button></div>', { center: true });
    const draw = () => { cv = paper(q, cur); $('#sm-i', w).innerHTML = '<img class="ct-sum" alt="หมายศาล" src="' + cv.toDataURL('image/png') + '">'; $('#sm-t', w).innerHTML = ks.map(k => '<button type="button" class="btn sm ' + (k[0] === cur ? 'gold' : 'ghost') + '" data-sk="' + k[0] + '">' + esc(k[1]) + '</button>').join(''); };
    const blob = () => new Promise(r => cv.toBlob(r, 'image/png')), fn = () => 'หมายศาล-' + TITLE[cur] + '-' + (q.x.no || '') + '.png';
    w.addEventListener('click', async e => { const b = e.target.closest('[data-sk]'); if (b) { cur = b.dataset.sk; draw(); return; }
      if (e.target.closest('#sm-s')) { M.saveBlob(await blob(), fn()); toast('บันทึกภาพหมายศาลแล้ว'); }
      if (e.target.closest('#sm-h')) { const bl = await blob(), f = new File([bl], fn(), { type: 'image/png' });
        try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: TITLE[cur] + ' ' + caseNo(q.x) }); return; } } catch (er) { if (er && er.name === 'AbortError') return; }
        M.saveBlob(bl, fn()); toast('เครื่องนี้แชร์ภาพตรง ๆ ไม่ได้ — บันทึกภาพให้แล้ว นำไปส่งในแชทได้เลย', 5000); } });
    draw(); }

  /* ---------- 1-2) รื้อฟื้นคดี · ทวงความยุติธรรม ---------- */
  async function revoke(q, oq, quiet) {
    const ox = oq.x, s = ox.d, dc = ox.dc || oq.c, base = '/c/' + dc + '/', now = Date.now(), upd = {};
    let log = {}; try { log = await B.get(base + 'ranklog/' + s) || {}; } catch (e) { log = {}; }
    const pre = caseNo(ox) + ' · คำพิพากษาศาลชมรม';
    let hit = Object.keys(log).filter(id => log[id] && log[id].note && String(log[id].note).indexOf(pre) === 0 && !log[id].end);
    if (!hit.length) { const f = Object.keys(log).filter(id => log[id] && !log[id].end && log[id].k === (ox.verdict || {}).k && (log[id].at || 0) >= (ox.vAt || 0)); if (f.length === 1) hit = f; }
    hit.forEach(id => { const e = log[id]; upd[base + 'ranklog/' + s + '/' + id + '/end'] = now;
      if (e.k === 'jail') upd[base + 'jail/' + s] = null;
      if ((e.k === 'down' || e.k === 'strip') && e.from) Object.keys(e.from).forEach(i => { upd[base + 'skills/' + s + '/' + i + '/lv'] = e.from[i]; upd[base + 'skills/' + s + '/' + i + '/at'] = now; });
      if (e.k === 'out') { upd[base + 'members/' + s + '/status'] = 'active'; upd[base + 'members/' + s + '/removedReason'] = null; upd[base + 'members/' + s + '/removedAt'] = null; upd[base + 'members/' + s + '/removedBy'] = null; } });
    upd[X.P(oq) + '/rv'] = { at: now, via: q.key }; if (!ox.applied) upd[X.P(oq) + '/applied'] = now; upd[X.P(q) + '/rv'] = { at: now, n: hit.length };
    await B.update('', upd); A.log('court.revoke', s, caseNo(ox) + ' · ยกเลิกโทษเดิม ' + hit.length + ' รายการ');
    X.push('msg', { title: '⚖️ ศาลรื้อฟื้นคดี ' + caseNo(ox), body: 'ศาลรื้อฟื้นยกฟ้อง โทษเดิมถูกยกเลิกแล้ว' + (hit.some(id => log[id].k === 'out') ? ' · ได้คืนสถานะสมาชิกแล้ว' : ''), to: [s], url: X.url(q) });
    if (!quiet) toast(hit.length ? 'ยกเลิกโทษเดิมแล้ว ' + hit.length + ' รายการ' : 'ไม่พบโทษเดิมที่ต้องยกเลิก (ยังไม่ได้ลงโทษ) — ปิดการลงโทษคดีเดิมแล้ว', 6000);
    return hit.length; }
  const RV = new Set();
  function autoRevoke(q) { const x = q.x; if (!T() || !x.re || x.re.k !== 'rt' || x.rv || !x.verdict || x.verdict.g !== false || x.verdict.drop || x.st === 'def' || x.st === 'vote' || RV.has(q.key)) return;
    const oq = C.getCase(x.re.c + '~' + x.re.id); if (!oq || !oq.x) return; RV.add(q.key);
    revoke(q, oq).catch(e => toast('ยกเลิกโทษเดิมอัตโนมัติไม่สำเร็จ: ' + (A.errTH ? A.errTH(e) : e.message) + ' — กดปุ่ม “ยกเลิกโทษเดิม” ในแผงรื้อฟื้น', 7000)); }
  function rtHtml(q) { const x = q.x, K = esc(q.key), isD = !T() && x.d === me(); let h = '';
    if (x.re) h += '<div class="note"><b>' + (x.re.k === 'jj' ? '⚖️ คดีไต่สวนการตัดสินที่ไม่เป็นธรรม' : '🔁 คดีรื้อฟื้น') + '</b> · เกี่ยวเนื่องกับ ' + esc(caseNo({ no: x.re.no, y: x.re.y })) + ' <a href="' + href(x.re.c + '~' + x.re.id) + '">ดูคดีที่เกี่ยวข้อง</a>' + (x.rv ? '<br>✓ ยกเลิกโทษเดิมแล้ว ' + esc(dt(x.rv.at)) : '') + '</div>';
    if (x.rtd) h += '<div class="note">🔁 คดีนี้ถูกรื้อฟื้นแล้ว <a href="' + href(x.rtd.c + '~' + x.rtd.id) + '">ดูคดีรื้อฟื้น</a>' + (x.rv ? '<br>✓ โทษเดิมถูกยกเลิกแล้ว ' + esc(dt(x.rv.at)) : '') + '</div>';
    if (x.rtx) h += '<div class="note">ครูไม่รับคำร้องรื้อฟื้น: ' + esc(x.rtx.t || '') + '</div>';
    if (x.rq && !x.rtd && !x.rtx) h += '<div class="note">📮 ผู้ต้องหายื่นขอรื้อฟื้นคดีเมื่อ ' + esc(dt(x.rq.at)) + '<div class="q" style="white-space:pre-wrap;margin-top:4px">' + esc(x.rq.t || '') + '</div></div>';
    if (canRt(x)) { const left = '<div class="muted" style="font-size:.8rem">อายุความรื้อฟื้น: อีก ' + dleft(rtLeft(x)) + ' (ถึง ' + esc(dt((x.vAt || 0) + LIM)) + ') · รื้อฟื้นได้ครั้งเดียว</div>';
      if (isD && !x.rq) h += left + '<div class="row" style="margin-top:6px"><button class="btn gold" data-act="ctRtReq" data-k="' + K + '">🔁 ยื่นขอรื้อฟื้นคดี</button></div>';
      else if (T()) h += left + '<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:6px"><button class="btn gold" data-act="ctRtOpen" data-k="' + K + '">⚖️ ' + (x.rq ? 'ตั้งศาลรื้อฟื้น' : 'เปิดรื้อฟื้นคดีเอง') + '</button>' + (x.rq ? '<button class="btn ghost" data-act="ctRtNo" data-k="' + K + '">ไม่รับคำร้อง</button>' : '') + '</div>'; }
    else if (x.verdict && x.verdict.g && !x.rtd && !x.re && (x.st === 'done' || x.st === 'closed') && rtLeft(x) <= 0) h += '<div class="muted" style="font-size:.8rem">หมดอายุความรื้อฟื้นคดี (เกิน 30 วันนับจากวันตัดสิน)</div>';
    if (T() && x.re && x.re.k === 'rt' && x.verdict && !x.verdict.drop && (x.st === 'done' || x.st === 'closed')) {
      if (x.verdict.g === false) { h += '<div class="note"><b>ศาลรื้อฟื้นยกฟ้อง</b> — คำตัดสินเดิมไม่เป็นธรรม ' + (x.rv ? '(ยกเลิกโทษเดิมแล้ว)' : '<button class="btn sm gold" data-act="ctRtRevoke" data-k="' + K + '">↩️ ยกเลิกโทษเดิม</button>') + '</div>';
        const oq = C.getCase(x.re.c + '~' + x.re.id);
        if (oq && oq.x) { const ox = oq.x, ppl = ox.ppl || {}, L = Object.keys(ox.judges || {}).filter(s => s !== 'T').map(s => [s, 'ผู้พิพากษา']).concat(Object.keys(ox.jury || {}).map(s => [s, 'ลูกขุน']));
          h += '<div class="ct-sec">⚖️ ทวงความยุติธรรม — ไต่สวนคณะเดิม</div><div class="muted" style="font-size:.8rem">เปิดคดีใหม่ฟ้องผู้พิพากษา/ลูกขุนชุดเดิมที่ตัดสินไม่เป็นธรรม ครูเลือกเป็นรายบุคคล ใช้ขั้นตอนศาลเดิม ครูมีสิทธิ์ยับยั้ง</div>' +
            L.map(p => '<div class="row" style="gap:6px;padding:4px 0;border-top:1px dashed var(--line)"><span class="grow">' + esc((ppl[p[0]] || {}).n || p[0]) + ' <span class="muted" style="font-size:.78rem">' + p[1] + '</span></span>' + ((x.jj || {})[p[0]] ? '<a class="btn sm ghost" href="' + href(x.jj[p[0]].c + '~' + x.jj[p[0]].id) + '">ดูคดีไต่สวน</a>' : '<button class="btn sm ghost" data-act="ctJJ" data-k="' + K + '" data-s="' + esc(p[0]) + '">ฟ้องไต่สวน</button>') + '</div>').join(''); } }
      else h += '<div class="note"><b>ศาลรื้อฟื้นพิพากษา: ' + esc(PN[x.verdict.k] || '') + '</b><br>ถ้า “ยืนตามเดิม” ไม่ต้องทำอะไร (ระบบกันการลงโทษซ้ำ) · ถ้าให้แก้โทษ กดปุ่มด้านล่าง ระบบจะยกเลิกโทษเดิมแล้วเปิดแบบฟอร์มลงโทษใหม่' + (x.applied ? '<br>✓ ลงโทษใหม่แล้ว' : '<div class="row" style="margin-top:6px"><button class="btn sm gold" data-act="ctRtNew" data-k="' + K + '">ยกเลิกโทษเดิมแล้วลงโทษใหม่</button></div>') + '</div>'; }
    return h ? '<section class="card ct-rec ct-rt"><div class="lb">🔁 รื้อฟื้นคดี / ทวงความยุติธรรม</div>' + h + '</section>' : ''; }
  function extra(q) { const K = esc(q.key); return '<section class="card"><div class="lb">🧾 หมายศาล</div><div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn gold" data-act="ctSum" data-k="' + K + '">🧾 ดู / ส่งหมายศาลเป็นภาพ</button></div></section>' + evHtml(q) + rtHtml(q); }

  const V0 = A.V.court;
  A.V.court = function (arg) { const r = V0.apply(this, arguments); if (!arg || !r || typeof r.body !== 'string') return r; let q = null; try { q = C.getCase(arg); } catch (e) { q = null; } if (!q || !q.x) return r;
    try { autoRevoke(q); } catch (e) { /* ignore */ } return Object.assign({}, r, { body: r.body + extra(q) }); };
  A.TODO.push(() => { if (!T()) return null; let n = 0; try { n = C.allCases().filter(q => q.x.rq && !q.x.rtd && !q.x.rtx).length; } catch (e) { n = 0; } return n ? [{ n, label: 'คำร้องขอรื้อฟื้นคดีรอครู', href: '#/court' }] : null; });

  const openRt = (q, k, pre) => C.newForm(Object.assign({ of: { c: q.c, id: q.id, no: q.x.no, y: q.x.y }, k }, pre));
  Object.assign(A.ACT, {
    ctSum: d => { const q = X.Q(d); if (q) showSum(q); },
    ctEvView: d => { const q = X.Q(d); if (!q) return; const v = evOf(q).v[d.e]; if (!v) return;
      modal('<h3>📎 ' + esc(v.cap || 'หลักฐาน') + '</h3><div class="ct-big">' + (v.img ? '<img src="' + esc(v.img) + '" alt="' + esc(v.cap || '') + '">' : '') + '</div><div class="muted" style="margin-top:6px">' + esc(sideTxt(v)) + ' · ' + esc(v.n || '') + ' · ' + esc(dt(v.at)) + '</div>' + (v.link ? '<div style="margin-top:6px">' + String(v.link).split(/\s+/).filter(u => /^https?:\/\/\S+$/i.test(u)).map(u => '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u.length > 60 ? u.slice(0, 58) + '…' : u) + '</a>').join('<br>') + '</div>' : '') + '<div class="row" style="margin-top:10px"><button type="button" class="btn ghost grow" data-close>ปิด</button></div>', { center: true }); },
    ctEvAdd: d => { const q = X.Q(d); if (!q) return; if (!canEv(q)) return toast('ตอนนี้แนบหลักฐานไม่ได้'); const pre = T() ? 'T' : me(), ev = evOf(q).v; let idx = 0; while (idx < MAXEV && ev[pre + '_' + idx]) idx++; if (idx >= MAXEV) return toast('แนบได้สูงสุด ' + MAXEV + ' ชิ้นต่อคน ลบอันเก่าก่อน');
      const w = modal('<h3>📎 แนบพยานหลักฐาน</h3><form class="form">' + fld('ภาพ (ถ่ายภาพหรือสกรีนช็อต · ระบบย่อให้ไม่เกิน ~150 KB)', '<input class="in" type="file" id="ev-f" accept="image/*">') + fld('คำอธิบายหลักฐาน', '<input class="in" id="ev-c" maxlength="200" required>') + fld('ลิงก์เพิ่มเติม (ไม่บังคับ)', '<input class="in" id="ev-l" maxlength="300" placeholder="https://">') + '<div class="note bad" id="ev-e" hidden></div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">แนบ</button></div></form>', { center: true, sticky: true });
      $('form', w).addEventListener('submit', async e => { e.preventDefault(); const er = $('#ev-e', w), bad = t => { er.textContent = t; er.hidden = false; }, f = $('#ev-f', w).files[0], cap = $('#ev-c', w).value.trim(), link = $('#ev-l', w).value.trim();
        if (!f && !link) return bad('แนบภาพหรือใส่ลิงก์อย่างน้อย 1 อย่าง'); if (link && !/^https?:\/\/\S+$/i.test(link)) return bad('ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://');
        const o = { s: pre, side: T() ? 'T' : q.x.d === me() ? 'd' : 'w', cap, at: Date.now(), n: T() ? 'ครูที่ปรึกษาชมรม' : String(X.nOf(q.x, me())).slice(0, 80) }; if (link) o.link = link;
        if (f) { try { o.img = await shrink(f); } catch (x2) { return bad(x2.message); } }
        try { await B.set(X.CP(q.c) + 'courte/' + q.id + '/' + pre + '_' + idx, o); } catch (x3) { return bad('แนบไม่สำเร็จ: ' + (A.errTH ? A.errTH(x3) : x3.message)); } w.remove(); toast('แนบหลักฐานแล้ว'); }); },
    ctEvDel: async d => { const q = X.Q(d); if (!q) return; if (!(await M.confirmBox('ลบหลักฐาน', 'ลบหลักฐานชิ้นนี้ออกจากสำนวน', 'ลบ'))) return; const upd = {}; upd[X.CP(q.c) + 'courte/' + q.id + '/' + d.e] = null; if (T() && (q.x.evok || {})[d.e]) upd[X.P(q) + '/evok/' + d.e] = null; A.W(B.update('', upd)); },
    ctEvOk: d => { const q = X.Q(d); if (!q || !T()) return; A.W(B.set(X.P(q) + '/evok/' + d.e, (q.x.evok || {})[d.e] ? null : true).then(() => toast('บันทึกแล้ว'))); },
    ctRtReq: async d => { const q = X.Q(d); if (!q) return; if (!canRt(q.x) || q.x.rq) return toast('ยื่นไม่ได้แล้ว (หมดอายุความหรือยื่นไปแล้ว)');
      const o = await X.textForm('ขอรื้อฟื้นคดี', 'เหตุผลที่ขอรื้อฟื้น เช่น มีหลักฐานใหม่ พยานใหม่ หรือเห็นว่าคำพิพากษาไม่เป็นธรรม (ยื่นได้ครั้งเดียว ภายใน 30 วันนับจากวันตัดสิน)', '', 2000); if (!o) return;
      A.W(B.set(X.P(q) + '/rq', { t: o.t, at: Date.now(), by: me() }).then(() => { A.log('court.rq', q.x.d, caseNo(q.x)); toast('ยื่นขอรื้อฟื้นคดีแล้ว รอครูพิจารณา', 5000); })); },
    ctRtNo: async d => { const q = X.Q(d); if (!q || !T()) return; const o = await X.textForm('ไม่รับคำร้องรื้อฟื้น', 'เหตุผลที่ไม่รับ (ผู้ต้องหาเห็น)', '', 500); if (!o) return;
      A.W(B.set(X.P(q) + '/rtx', { t: o.t, at: Date.now() }).then(() => X.push('msg', { title: '⚖️ ผลคำร้องรื้อฟื้น ' + caseNo(q.x), body: 'ครูไม่รับคำร้อง: ' + o.t, to: [q.x.d], url: X.url(q) }))); },
    ctRtOpen: d => { const q = X.Q(d); if (!q || !T()) return; const x = q.x; if (!canRt(x)) return toast('รื้อฟื้นไม่ได้แล้ว (หมดอายุความหรือรื้อฟื้นไปแล้ว)');
      const ban = Object.keys(x.judges || {}).filter(s => s !== 'T').concat(Object.keys(x.jury || {})), t = ('รื้อฟื้นคดี ' + caseNo(x) + (x.rq ? ' ตามคำร้องของผู้ต้องหา: ' + x.rq.t : ' (ศาลเปิดรื้อฟื้นเอง)') + '\n\nคำฟ้องเดิม: ' + (x.t || '')).slice(0, 1990);
      openRt(q, 'rt', { d: x.d, tags: x.tags, max: x.max, t, ban }); },
    ctRtRevoke: async d => { const q = X.Q(d); if (!q || !T() || !q.x.re) return; const oq = C.getCase(q.x.re.c + '~' + q.x.re.id); if (!oq || !oq.x) return toast('กำลังโหลดคดีเดิม ลองอีกครั้ง'); try { await revoke(q, oq); } catch (e) { toast('ไม่สำเร็จ: ' + (A.errTH ? A.errTH(e) : e.message), 6000); } },
    ctRtNew: async d => { const q = X.Q(d); if (!q || !T() || !q.x.re) return; const x = q.x, oq = C.getCase(x.re.c + '~' + x.re.id); if (!oq || !oq.x) return toast('กำลังโหลดคดีเดิม ลองอีกครั้ง');
      if (!window.MIS || !window.MIS.downForm) return toast('ระบบลงโทษยังไม่พร้อม'); if (x.dc !== cid()) return toast('สลับไปชมรม' + clubName(x.dc) + ' ก่อน');
      if (!(await M.confirmBox('ยกเลิกโทษเดิมแล้วลงโทษใหม่', 'ระบบจะยกเลิกโทษเดิมของ ' + esc(caseNo(oq.x)) + ' ก่อน แล้วเปิดแบบฟอร์มลงโทษตามคำพิพากษารื้อฟื้น: <b>' + esc(PN[x.verdict.k] || '') + '</b>', 'ดำเนินการ'))) return;
      try { if (!x.rv) await revoke(q, oq, true); } catch (e) { return toast('ยกเลิกโทษเดิมไม่สำเร็จ: ' + (A.errTH ? A.errTH(e) : e.message), 6000); }
      window.MIS.downForm(x.d, null, { k: x.verdict.k, tags: x.tags, note: caseNo(x) + ' · คำพิพากษาศาลชมรม' + clubName(q.c), done: () => A.W(B.set(X.P(q) + '/applied', Date.now())) }); },
    ctJJ: d => { const q = X.Q(d); if (!q || !T() || !q.x.re) return; const x = q.x, oq = C.getCase(x.re.c + '~' + x.re.id); if (!oq || !oq.x) return toast('กำลังโหลดคดีเดิม ลองอีกครั้ง'); const ox = oq.x, s = d.s;
      const role = (ox.judges || {})[s] ? 'ผู้พิพากษา' : 'ลูกขุน', ban = Object.keys(ox.judges || {}).filter(k => k !== 'T').concat(Object.keys(ox.jury || {}), [x.d]).filter(k => k !== s);
      openRt(q, 'jj', { d: s, tags: ['other'], max: 'prob', t: 'ไต่สวนการตัดสินคดี ' + caseNo(ox) + ' ซึ่งศาลรื้อฟื้น (' + caseNo(x) + ') เห็นว่าไม่เป็นธรรม — ผู้ถูกไต่สวนเป็น' + role + 'ในคดีเดิม', ban }); }
  });
})();
