/* ============================================================
   court3.js — รุ่น 3.48: คดีพ่วง (ผู้ต้องหาหลายคน) · ซัดทอด
   - ครูเพิ่มผู้ต้องหาระหว่างไต่สวนได้ (ผู้พิพากษาเสนอชื่อ ครูยืนยัน) แต่ละคนเป็นคดีย่อยที่ผูกกับคดีหลัก ใช้องค์คณะ ข้อหา สำนวนร่วมกัน
     แก้ต่าง ลงมติ กำหนดโทษ ยกฟ้อง อุทธรณ์ รื้อฟื้น แยกรายคน
   - น้ำหนักโทษรายคนตามบทบาท: ตัวการ / ร่วมกระทำ (≤จำตรุ) / ผู้สนับสนุน (≤ลดยศ) / รู้เห็นเป็นใจ (≤ทัณฑ์บน)
   - ลูกขุน/พยานที่ถูกซัดทอด: สถานะเป็นผู้ต้องหาทันที · บัตรลูกขุนถูกตัด + ตั้งคนแทน · คำให้การพยานถูกหมายเหตุ · แจ้งเตือนเป็นกราฟิกและแจ้งเตือนแอป
   ข้อมูล: คดีหลัก court/{id}/cod/{sid} = {c,id,at,from,rl} · prop/{pid} = ข้อเสนอของผู้พิพากษา · คดีย่อย court/{id2}.grp = {c,id,from,why}, sub, rl, max0
   พัฒนาโดย นายนนทพัทธ์ วงค์มูล 2026
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP, C = window.COURT;
  if (!M || !B || !A || !C || !C.X || !C.X.peopleAll || !A.V || !A.V.court) return;
  const X = C.X, $ = M.$, esc = M.esc, toast = M.toast, modal = M.modal, fld = A.fld, opt = A.opt;
  const T = () => A.teacher(), me = () => A.sid(), cid = () => M.C.club.id;
  const PEN = X.PEN, PN = X.PN, caseNo = X.caseNo, dt = X.dt;
  const RL = { p: ['ตัวการ', 4], j: ['ร่วมกระทำ', 3], s: ['ผู้สนับสนุน', 1], k: ['รู้เห็นเป็นใจ', 0] }, RK = ['p', 'j', 's', 'k'];
  const FROM = { u: 'ลูกขุน', w: 'พยาน', n: '' };
  const STL = { def: 'แก้ต่าง', vote: 'ลูกขุนลงมติ', sent: 'กำหนดโทษ' };
  const stOf = x => x.st === 'closed' || x.st === 'done' ? (x.verdict ? (x.verdict.drop ? 'ถอนฟ้อง' : x.verdict.g ? 'ผิด · ' + (PN[x.verdict.k] || '') : 'ยกฟ้อง') : 'ปิดคดี') : (STL[x.st] || x.st);
  const capOf = (max0, rl) => PEN[Math.min(Math.max(0, PEN.indexOf(max0)), (RL[rl] || RL.p)[1])];

  const st = document.createElement('style');
  st.textContent = '.co-row{display:flex;gap:8px;align-items:center;padding:6px 0;border-top:1px dashed var(--line);flex-wrap:wrap}.co-row .grow{min-width:140px}.co-strip{display:block;max-width:100%;image-rendering:pixelated;background:#140a12;border:2px solid #000;border-radius:6px;margin:6px 0}' +
    '.ct-alarm{text-align:center;padding:16px 10px;border-radius:10px;background:#1a0508;color:#fff;animation:ctal 1s steps(2) infinite;border:4px solid #ff3b3b}.ct-alarm .big{font-size:1.35rem;font-weight:800;color:#ffd166;margin:8px 0}.ct-alarm img{width:96px;image-rendering:pixelated;animation:ctk2 .4s ease 4}.ct-alarm .chip2{display:inline-block;background:#c0392b;color:#fff;font-weight:700;border-radius:999px;padding:3px 12px;margin-top:6px}' +
    '@keyframes ctal{0%{box-shadow:0 0 0 0 #ff3b3b88}50%{box-shadow:0 0 0 14px #ff3b3b00}}@keyframes ctk2{0%,100%{transform:none}25%{transform:translateX(-6px) rotate(-3deg)}75%{transform:translateX(6px) rotate(3deg)}}';
  document.head.appendChild(st);

  /* ---------- กลุ่มคดี ---------- */
  const leadOf = q => q.x && q.x.grp ? C.getCase(q.x.grp.c + '~' + q.x.grp.id) : q;
  function group(L) { if (!L || !L.x) return []; const o = [{ s: L.x.d, q: L, rl: L.x.rl || 'p', from: '' }], cd = L.x.cod || {};
    Object.keys(cd).sort((a, b) => (cd[a].at || 0) - (cd[b].at || 0)).forEach(s => { const i = cd[s]; o.push({ s, q: C.getCase(i.c + '~' + i.id), rl: i.rl || 'j', from: i.from || 'n' }); }); return o; }
  const nmOf = (L, s) => X.nOf(L.x, s);
  function specOf(x, s) { const own = window.AVA && window.AVA.of(s); if (own) return own; const pp = (x.ppl || {})[s]; if (pp && pp.px && typeof pp.px === 'object') return pp.px; const P = window.PX && window.PX.PRESETS; if (!P) return null; const L = Object.keys(P).filter(k => k !== 'tang'); let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return P[L[h % L.length]]; }
  const SIMG = {};
  function spriteUrl(x, s, k) { if (!window.PX) return ''; const sp = specOf(x, s); if (!sp) return ''; const sig = s + JSON.stringify(sp) + (k || 1); if (!SIMG[sig]) { const c = document.createElement('canvas'), z = k || 1; c.width = 16 * z; c.height = 24 * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(window.PX.sprite(sp, 'd', 0), 0, 0, 16 * z, 24 * z); SIMG[sig] = c.toDataURL(); } return SIMG[sig]; }
  function strip(L, list) { if (!window.PX || list.length < 2) return ''; const n = list.length, W = Math.max(96, n * 22 + 10), c = document.createElement('canvas'); c.width = W; c.height = 34; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#3b2016'; g.fillRect(0, 0, W, 34); g.fillStyle = '#4d2a17'; g.fillRect(0, 26, W, 8); g.fillStyle = '#F3C95B'; g.fillRect(0, 26, W, 1);
    list.forEach((m, i) => { const sp = specOf(m.q && m.q.x ? m.q.x : L.x, m.s); if (sp) g.drawImage(window.PX.sprite(sp, 'u', 0), 5 + i * 22, 3, 16, 24); });
    return '<img class="co-strip" style="width:' + Math.min(100, n * 18) + '%" src="' + c.toDataURL() + '" alt="ผู้ต้องหา ' + n + ' คน ยืนหน้าบัลลังก์">'; }

  function coHtml(q) { const L = leadOf(q); if (!L || !L.x) return ''; const lx = L.x, list = group(L), K = esc(q.key), isJ = !T() && !!(lx.judges || {})[me()], open = lx.st !== 'closed';
    if (list.length < 2 && !T() && !isJ) return '';
    let h = '<section class="card ct-rec"><div class="lb">👥 ผู้ต้องหาในคดีนี้ (' + list.length + ' คน)</div>' + strip(L, list);
    h += list.map((m, i) => { const mx = m.q && m.q.x; return '<div class="co-row"><span class="grow"><b>' + (i + 1) + '. ' + esc(nmOf(L, m.s)) + '</b> <span class="muted" style="font-size:.78rem">' + esc(RL[m.rl] ? RL[m.rl][0] : '') + (m.from && m.from !== 'n' ? ' · ซัดทอดจาก' + FROM[m.from] : '') + '</span><div class="muted" style="font-size:.78rem">' + (mx ? esc(stOf(mx)) + ' · โทษสูงสุด ' + esc(PN[mx.max] || '') : 'กำลังโหลด…') + '</div></span>' +
      (mx && m.q.key !== q.key ? '<a class="btn sm ghost" href="#/court/' + esc(m.q.key) + '">เปิดคดีย่อย</a>' : '') + (T() && mx && (mx.st === 'def' || mx.st === 'vote') ? '<button class="btn sm ghost" data-act="ctRole" data-k="' + esc(m.q.key) + '" data-s="' + esc(m.s) + '">ปรับบทบาท/น้ำหนักโทษ</button>' : '') + '</div>'; }).join('');
    const pr = lx.prop || {}, pk = Object.keys(pr);
    if (pk.length && (T() || isJ)) h += '<div class="ct-sec">ข้อเสนอชื่อผู้ต้องหาเพิ่ม (รอครูยืนยัน)</div>' + pk.map(p => '<div class="co-row"><span class="grow"><b>' + esc(nmOf(L, pr[p].s) || pr[p].s) + '</b><div class="muted" style="font-size:.78rem">เสนอโดย ' + esc(nmOf(L, pr[p].by)) + ' · ' + esc(pr[p].why || '') + '</div></span>' + (T() && open ? '<button class="btn sm gold" data-act="ctCoAdd" data-k="' + esc(L.key) + '" data-s="' + esc(pr[p].s) + '" data-p="' + esc(p) + '">ยืนยัน</button><button class="btn sm ghost" data-act="ctCoNo" data-k="' + esc(L.key) + '" data-p="' + esc(p) + '">ไม่รับ</button>' : '') + '</div>').join('');
    if (open && T()) h += '<div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap"><button class="btn gold" data-act="ctCoAdd" data-k="' + esc(L.key) + '">➕ เพิ่มผู้ต้องหา</button></div><div class="muted" style="font-size:.75rem;margin-top:4px">พบผู้เกี่ยวข้องเพิ่มจากการไต่สวน · ถ้าเป็นลูกขุนหรือพยาน ระบบเปลี่ยนสถานะเป็นผู้ต้องหาทันที ตัดบัตรลูกขุน และแจ้งเตือนทุกคนในคดี</div>';
    else if (open && isJ) h += '<div class="row" style="margin-top:10px"><button class="btn ghost" data-act="ctCoProp" data-k="' + esc(L.key) + '">🙋 เสนอชื่อผู้ต้องหาเพิ่ม</button></div>';
    return h + '</section>'; }

  /* ---------- กราฟิกแจ้งเตือน “พบผู้ต้องหาจากการซัดทอด” ---------- */
  let ALON = false;
  function siren() { try { const Cc = window.AudioContext || window.webkitAudioContext; if (!Cc) return; const a = new Cc(), o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; g.gain.value = .05; o.connect(g); g.connect(a.destination); const t = a.currentTime; for (let i = 0; i < 6; i++) { o.frequency.setValueAtTime(i % 2 ? 660 : 880, t + i * .28); } o.start(t); o.stop(t + 1.7); setTimeout(() => a.close && a.close(), 2200); } catch (e) { /* ignore */ } }
  function alarm(q) { const x = q.x, L = leadOf(q), g = x.grp || {}, mine = x.d === me(), img = spriteUrl(x, x.d, 6); ALON = true;
    const w = modal('<div class="ct-alarm" role="alert"><div style="font-size:2rem">🚨</div><div class="big">พบผู้ต้องหาจากการซัดทอด</div>' + (img ? '<img src="' + img + '" alt="">' : '') + '<div style="font-size:1.1rem;font-weight:700;margin-top:6px">' + esc(x.dn || '') + '</div><div style="opacity:.85;font-size:.9rem">' + (g.from && g.from !== 'n' ? 'จาก' + FROM[g.from] + 'ในคดี → ' : '') + esc(caseNo(L && L.x ? L.x : x)) + '</div><div class="chip2">สถานะ: ผู้ต้องหา</div>' + (mine ? '<div style="margin-top:10px;font-size:.9rem">ท่านมีสิทธิ์แก้ต่าง แนบหลักฐาน และขอพยาน ภายใน ' + esc(dt(x.due)) + '</div>' : '') + '</div><div class="row" style="gap:8px;margin-top:12px"><button type="button" class="btn ghost grow" data-close>รับทราบ</button><a class="btn gold grow" href="#/court/' + esc(q.key) + '" data-close>' + (mine ? 'ไปเขียนคำแก้ต่าง' : 'เปิดคดี') + '</a></div>', { center: true });
    w.addEventListener('click', () => setTimeout(() => { if (!document.body.contains(w)) ALON = false; }, 50)); setTimeout(() => { if (!document.body.contains(w)) ALON = false; }, 60000); siren(); }
  function check() { if (ALON || (!me() && !T())) return; let L0 = []; try { L0 = C.allCases(); } catch (e) { return; } const now = Date.now(), h = location.hash;
    L0 = L0.slice().sort((p, r) => ((r.x && r.x.d === me()) ? 1 : 0) - ((p.x && p.x.d === me()) ? 1 : 0));
    for (const q of L0) { const x = q.x; if (!x || !x.grp || now - (x.at || 0) > 7 * 864e5) continue; const k = 'spw_ct_al_' + q.key + '_' + (T() ? 'T' : me()); let seen = false; try { seen = !!localStorage.getItem(k); } catch (e) { seen = true; }
      if (seen) continue; const inView = h.indexOf(q.id) >= 0 || h.indexOf(x.grp.id) >= 0; if (x.d === me() || (inView && x.grp.by !== A.myName())) { try { localStorage.setItem(k, '1'); } catch (e) { /* ignore */ } alarm(q); return; } } }
  setInterval(check, 2500); window.addEventListener('hashchange', () => setTimeout(check, 400));

  /* ---------- หน้าจอ ---------- */
  const V0 = A.V.court;
  A.V.court = function (arg) { const r = V0.apply(this, arguments); if (!arg || !r || typeof r.body !== 'string') return r; let q = null; try { q = C.getCase(arg); } catch (e) { q = null; } if (!q || !q.x) return r;
    let pre = ''; const x = q.x;
    if (x.grp) pre = '<div class="note" style="border-left:4px solid #c0392b"><b>👥 คดีพ่วง · ผู้ต้องหาที่ ' + X.thNo(x.sub || 2) + '</b> ' + (x.grp.from && x.grp.from !== 'n' ? '· ซัดทอดจาก' + FROM[x.grp.from] + 'ในคดี ' : '') + '· บทบาท: ' + esc((RL[x.rl] || RL.j)[0]) + ' · โทษสูงสุด ' + esc(PN[x.max] || '') + ' <a href="#/court/' + esc(x.grp.c + '~' + x.grp.id) + '">ดูคดีหลัก</a></div>';
    const wi = x.wit || {}, imp = Object.keys(wi).filter(s => wi[s] && wi[s].imp);
    if (imp.length) pre += '<div class="note">หมายเหตุ: คำให้การของ ' + imp.map(s => esc(X.nOf(x, s))).join(', ') + ' ให้ไว้ก่อนถูกซัดทอดเป็นผู้ต้องหา โปรดรับฟังด้วยความระมัดระวัง</div>';
    return Object.assign({}, r, { body: r.body + pre + coHtml(q) }); };
  A.TODO.push(() => { if (!T()) return null; let n = 0; try { n = C.allCases().reduce((a, q) => a + Object.keys(q.x.prop || {}).length, 0); } catch (e) { n = 0; } return n ? [{ n, label: 'ข้อเสนอเพิ่มผู้ต้องหารอครูยืนยัน', href: '#/court' }] : null; });

  /* ---------- การกระทำ ---------- */
  function rnd(L, pool, ex) { return pool.filter(s => !ex.includes(s) && !(A.jailed && A.jailed(s))).sort(() => Math.random() - .5)[0] || ''; }
  async function addForm(L, s0, pid) { if (!T() || !L || !L.x) return; if (L.c !== cid()) return toast('สลับไปชมรม' + X.clubName(L.c) + ' ก่อน'); const lx = L.x; if (lx.st === 'closed') return toast('คดีปิดแล้ว');
    toast('กำลังโหลดรายชื่อ…', 1000); const PP = await X.peopleAll(), G = group(L), defs = G.map(m => m.s), judges = Object.keys(lx.judges || {}).filter(j => j !== 'T');
    const jurAll = new Set(), witAll = new Set(); G.forEach(m => { const gx = m.q && m.q.x; if (!gx) return; Object.keys(gx.jury || {}).forEach(j => jurAll.add(j)); Object.keys(gx.wit || {}).forEach(j => witAll.add(j)); });
    const pool = A.activeSids().filter(s => !defs.includes(s) && !judges.includes(s) && !jurAll.has(s)), d0 = new Date(Date.now() + 2 * 864e5); d0.setHours(18, 0, 0, 0); const loc = new Date(d0 - d0.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
    const pr = pid ? (lx.prop || {})[pid] : null;
    const w = modal('<h3>➕ เพิ่มผู้ต้องหา (คดีพ่วง)</h3><div class="muted" style="margin-bottom:8px">' + esc(caseNo(lx)) + ' · ข้อหา ' + esc(X.tagTxt(lx.tags)) + '</div><form class="form">' + fld('ผู้ต้องหาเพิ่ม', '<select class="in" id="co-s">' + X.pOpt(PP, s0 || '', defs.concat(judges)) + '</select>') +
      '<div class="note" id="co-f" hidden></div>' +
      '<div class="fld"><span>บทบาทในความผิด (น้ำหนักโทษ)</span><div class="checks">' + RK.map(k => '<label class="ck"><input type="radio" name="co-r" value="' + k + '"' + (k === 'j' ? ' checked' : '') + '><span>' + RL[k][0] + ' <small class="muted">≤ ' + esc(PN[capOf(lx.max0 || lx.max, k)]) + '</small></span></label>').join('') + '</div></div>' +
      fld('พฤติการณ์ / คำซัดทอดที่พบจากการไต่สวน (ผู้ฟังเห็น)', '<textarea class="in" id="co-w" rows="3" maxlength="500">' + esc(pr ? pr.why : '') + '</textarea>') + fld('ยื่นคำแก้ต่างได้ถึง', '<input class="in" type="datetime-local" id="co-d" value="' + loc + '">') +
      '<div id="co-rp" hidden>' + fld('ลูกขุนแทน (บัตรของผู้ถูกซัดทอดถูกตัดทุกคดีในกลุ่ม)', '<div class="row" style="gap:6px"><select class="in grow" id="co-x">' + opt([['', '— ไม่ตั้งคนแทน —']].concat(pool.map(s => [s, A.fullName(A.members()[s])])), '') + '</select><button type="button" class="btn ghost" id="co-xr">🎲</button></div>') + '</div>' +
      '<div class="note bad" id="co-e" hidden></div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">เพิ่มผู้ต้องหา</button></div></form>', { center: true, sticky: true });
    const upd8 = () => { const s = $('#co-s', w).value, f = $('#co-f', w), isU = jurAll.has(s), isW = witAll.has(s); f.hidden = !(isU || isW); f.innerHTML = isU ? '🚨 <b>ผู้นี้เป็นลูกขุนในคดีนี้</b> — จะถูกตัดบัตรและเปลี่ยนสถานะเป็นผู้ต้องหาทันที (ซัดทอด)' : isW ? '🚨 <b>ผู้นี้เป็นพยานในคดีนี้</b> — คำให้การเดิมถูกหมายเหตุ และเปลี่ยนสถานะเป็นผู้ต้องหาทันที (ซัดทอด)' : ''; $('#co-rp', w).hidden = !isU; if (isU && !$('#co-x', w).value) $('#co-x', w).value = rnd(L, pool, [s]); };
    $('#co-s', w).addEventListener('change', upd8); $('#co-xr', w).addEventListener('click', () => { $('#co-x', w).value = rnd(L, pool, [$('#co-s', w).value]); }); upd8();
    $('form', w).addEventListener('submit', async e => { e.preventDefault(); const er = $('#co-e', w), bad = t => { er.textContent = t; er.hidden = false; };
      const s = $('#co-s', w).value, rl = ($('input[name="co-r"]:checked', w) || {}).value || 'j', why = $('#co-w', w).value.trim(), due = new Date($('#co-d', w).value).getTime(), rep = jurAll.has(s) ? $('#co-x', w).value : '';
      if (!s) return bad('เลือกผู้ต้องหา'); if (defs.includes(s)) return bad('ผู้นี้เป็นผู้ต้องหาในคดีนี้อยู่แล้ว'); if (judges.includes(s)) return bad('ผู้พิพากษามีเอี่ยว: ให้ถอนฟ้องแล้วเปิดคดีใหม่ด้วยองค์คณะใหม่'); if (!why) return bad('เขียนพฤติการณ์ที่พบจากการไต่สวน'); if (!(due > Date.now())) return bad('กำหนดเวลายื่นคำแก้ต่างในอนาคต');
      const from = jurAll.has(s) ? 'u' : witAll.has(s) ? 'w' : 'n';
      if (!(await M.confirmBox('เพิ่มผู้ต้องหา', '<b>' + esc(PP[s][0]) + '</b> · ' + RL[rl][0] + (from !== 'n' ? '<br>🚨 ซัดทอดจาก' + FROM[from] + ' — สถานะเปลี่ยนเป็นผู้ต้องหาทันที' : '') + '<br>ระบบส่งหมายศาลและแจ้งเตือนทุกคนในคดี', 'เพิ่มผู้ต้องหา'))) return;
      try { await doAdd(L, PP, s, rl, why, due, rep, from, pid); } catch (x2) { return bad('ไม่สำเร็จ: ' + (A.errTH ? A.errTH(x2) : x2.message)); } w.remove(); }); }
  async function doAdd(L, PP, s, rl, why, due, rep, from, pid) {
    const lx = L.x, now = Date.now(), id = B.uid(), G = group(L).filter(m => m.q && m.q.x), base = X.CP(L.c), upd = {}, pp = k => { const o = { n: PP[k] ? PP[k][0] : X.nOf(lx, k), c: PP[k] ? PP[k][1] : L.c }; if (PP[k] && PP[k][2]) o.px = PP[k][2]; return o; };
    G.forEach(m => { const P = X.P(m.q), gx = m.q.x, open = gx.st === 'def' || gx.st === 'vote';
      if ((gx.jury || {})[s] && open) { upd[P + '/jury/' + s] = null; upd[P + '/jn/' + s] = null; upd[base + 'courtv/' + m.q.id + '/' + s] = null; if (rep) { upd[P + '/jury/' + rep] = true; upd[P + '/who/' + rep] = 'u'; upd[P + '/ppl/' + rep] = pp(rep); } }
      if ((gx.wit || {})[s]) upd[P + '/wit/' + s + '/imp'] = now;
      upd[P + '/who/' + s] = 'x'; if (!(gx.ppl || {})[s]) upd[P + '/ppl/' + s] = pp(s); });
    const J = Object.keys(lx.jury || {}).filter(j => j !== s); if (rep && !J.includes(rep) && (lx.jury || {})[s]) J.push(rep); if (rep && !J.includes(rep) && !(lx.jury || {})[s]) J.push(rep);
    const max0 = lx.max0 || lx.max, judges = lx.judges || {}, ppl = {}, who = {}; who[s] = 'd'; ppl[s] = pp(s);
    Object.keys(judges).filter(j => j !== 'T').forEach(j => { who[j] = 'j'; ppl[j] = (lx.ppl || {})[j] || pp(j); }); const jury = {}; J.forEach(j => { jury[j] = true; who[j] = 'u'; ppl[j] = (lx.ppl || {})[j] || pp(j); });
    const S = { no: lx.no || 1, y: lx.y || '', sub: G.length + 1, c: L.c, d: s, dn: PP[s][0], dc: PP[s][1], tags: lx.tags || [], t: ('[ผู้ต้องหาเพิ่มจากการไต่สวน' + (from !== 'n' ? ' · ซัดทอดจาก' + FROM[from] + 'ในคดี' : '') + '] ' + why + '\n\nคำฟ้องเดิม: ' + (lx.t || '')).slice(0, 2000), max0, rl, max: capOf(max0, rl), judges, jury, ppl, who, st: 'def', due, at: now, by: A.myName(), grp: { c: L.c, id: L.id, from, why: why.slice(0, 500), by: A.myName() } };
    if (lx.hear) S.hear = lx.hear; if (lx.place) S.place = lx.place;
    upd[base + 'court/' + id] = S; upd[X.P(L) + '/cod/' + s] = { c: L.c, id, at: now, from, rl }; if (pid) upd[X.P(L) + '/prop/' + pid] = null;
    await B.update('', upd);
    const ux = {}; Object.keys(who).forEach(k => { if (ppl[k] && ppl[k].c !== L.c) ux['/courtx/' + k + '/' + L.c + '~' + id] = true; }); if (Object.keys(ux).length) B.update('', ux).catch(er => toast('ส่งหมายศาลข้ามชมรมไม่สำเร็จ: ' + (A.errTH ? A.errTH(er) : er.message), 6000));
    A.log('court.co', s, caseNo(lx) + ' · ' + RL[rl][0] + (from !== 'n' ? ' · ซัดทอดจาก' + FROM[from] : ''));
    const q2 = { c: L.c, id }, others = Object.keys(lx.who || {}).filter(k => k !== s);
    X.push('msg', { title: '🚨 พบผู้ต้องหาจากการซัดทอด', body: 'ท่านถูกระบุเป็นผู้ต้องหาใน' + caseNo(lx) + ' (' + RL[rl][0] + ') · ยื่นคำแก้ต่างได้ถึง ' + dt(due), to: [s], url: X.url(q2) });
    if (others.length) X.push('msg', { title: '🚨 พบผู้ต้องหาเพิ่ม ' + caseNo(lx), body: PP[s][0] + (from !== 'n' ? ' (เดิมเป็น' + FROM[from] + ')' : '') + ' ถูกเพิ่มเป็นผู้ต้องหาจากการไต่สวน', to: others, url: X.url(q2) });
    if (rep) X.push('msg', { title: '⚖️ หมายเรียกลูกขุน (แทน) ' + caseNo(lx), body: 'ท่านได้รับแต่งตั้งเป็นลูกขุนแทน อ่านสำนวนไว้ก่อน', to: [rep], url: X.url(L) });
    toast('เพิ่มผู้ต้องหาแล้ว · ส่งหมายศาลแล้ว', 4000); location.hash = '#/court/' + id; }

  Object.assign(A.ACT, {
    ctCoAdd: d => { const q = X.Q(d); if (!q) return; addForm(leadOf(q), d.s, d.p); },
    ctCoNo: async d => { const q = X.Q(d); if (!q || !T()) return; if (!(await M.confirmBox('ไม่รับข้อเสนอ', 'ลบข้อเสนอชื่อนี้', 'ไม่รับ'))) return; A.W(B.set(X.P(q) + '/prop/' + d.p, null)); },
    ctCoProp: d => { const q = X.Q(d); if (!q) return; const L = leadOf(q); if (!L || !L.x) return; const lx = L.x, ex = group(L).map(m => m.s).concat(Object.keys(lx.judges || {}));
      const w = modal('<h3>🙋 เสนอชื่อผู้ต้องหาเพิ่ม</h3><div class="muted" style="margin-bottom:8px">ครูเป็นผู้ยืนยัน · ถ้าผู้ถูกเสนอเป็นลูกขุนหรือพยาน ระบบจะเปลี่ยนสถานะเมื่อครูยืนยัน</div><form class="form">' + fld('ผู้ที่พบว่ามีส่วนเกี่ยวข้อง', '<select class="in" id="cp-s">' + opt([['', '— เลือก —']].concat(A.activeSids().filter(s => !ex.includes(s)).map(s => [s, A.fullName(A.members()[s])])), '') + '</select>') + fld('เหตุผล / สิ่งที่พบจากการไต่สวน', '<textarea class="in" id="cp-w" rows="3" maxlength="500"></textarea>') + '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">ส่งข้อเสนอ</button></div></form>', { center: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const s = $('#cp-s', w).value, why = $('#cp-w', w).value.trim(); if (!s || !why) return toast('เลือกชื่อและเขียนเหตุผล');
        A.W(B.set(X.P(L) + '/prop/' + B.uid(), { s, why, by: me(), at: Date.now() }).then(() => { w.remove(); toast('ส่งข้อเสนอให้ครูแล้ว'); })); }); },
    ctRole: d => { const q = X.Q(d); if (!q || !T()) return; const x = q.x; if (!(x.st === 'def' || x.st === 'vote')) return toast('ปรับได้ก่อนขั้นกำหนดโทษเท่านั้น'); const L = leadOf(q), max0 = x.max0 || x.max, cur = x.rl || (x.grp ? 'j' : 'p');
      const w = modal('<h3>⚖️ บทบาทและน้ำหนักโทษ</h3><div class="muted" style="margin-bottom:8px">' + esc(x.dn || '') + ' · โทษสูงสุดที่ขอในคดี ' + esc(PN[max0] || '') + '</div><form class="form"><div class="checks" style="display:grid;gap:6px">' + RK.map(k => '<label class="ck"><input type="radio" name="cr-r" value="' + k + '"' + (k === cur ? ' checked' : '') + '><span>' + RL[k][0] + ' — โทษไม่เกิน ' + esc(PN[capOf(max0, k)]) + '</span></label>').join('') + '</div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">บันทึก</button></div></form>', { center: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const r = $('input[name="cr-r"]:checked', w).value, upd = {}; upd[X.P(q) + '/rl'] = r; upd[X.P(q) + '/max0'] = max0; upd[X.P(q) + '/max'] = capOf(max0, r); if (L && L.x && L.key !== q.key && (L.x.cod || {})[x.d]) upd[X.P(L) + '/cod/' + x.d + '/rl'] = r;
        A.W(B.update('', upd).then(() => { w.remove(); toast('บันทึกบทบาทแล้ว · โทษสูงสุด ' + PN[capOf(max0, r)]); })); }); }
  });
})();
