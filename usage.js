/* ============================================================
   usage.js — รุ่น 3.6: บันทึกการเข้าใช้แอปและการเล่นเกม + หน้าสรุปสำหรับครู + คะแนนต่อเนื่องของนักเรียน
   ข้อมูล: c/{ชมรม}/usage/{sid}/last = เวลาที่เปิดแอปล่าสุด
           c/{ชมรม}/usage/{sid}/d/{วันที่}  = { n: จำนวนครั้งที่เปิดแอป, g: { เกม: ครั้ง }, m: { เกม: นาที } }
           c/{ชมรม}/usage/{sid}/nudged  = เวลาที่ตัวส่งเตือนชวนกลับครั้งล่าสุด (push-relay.gs เขียน)
   บันทึกเฉพาะบัญชีนักเรียน · นักเรียนอ่านได้เฉพาะของตัวเอง ครูอ่านได้ทั้งชมรม
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP, C = M.C;
  const { $, esc, toast, modal } = M; const { ic, chip } = A;
  const DAY = 864e5, T = () => A.teacher();
  const base = () => '/c/' + C.club.id + '/usage';
  const iso = d => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const daysBack = n => Array.from({ length: n }, (_, i) => iso(Date.now() - i * DAY));   /* วันนี้ย้อนหลัง n วัน (ใหม่ → เก่า) */
  Object.assign(A.ICON, { pulse: '<path d="M3 12h4l2.5-6 5 12 2.5-6H21"/>' });

  /* ---------- บันทึก (นักเรียน) ---------- */
  const inc = (p, k) => B.tx(p, v => (v || 0) + (k || 1)).catch(() => { });
  let lastOpen = 0;
  function opened() {
    const sid = A.sid(); if (!sid || T() || !A.members()[sid]) return;
    lastOpen = Date.now(); const day = iso(lastOpen);
    inc(base() + '/' + sid + '/d/' + day + '/n'); B.set(base() + '/' + sid + '/last', lastOpen).catch(() => { });
  }
  let started = false, hiddenAt = 0;
  setInterval(() => { if (!started && A.sid() && !T() && A.members && A.members()[A.sid()]) { started = true; opened(); } }, 2000);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    if (started && hiddenAt && Date.now() - hiddenAt > 30 * 60000) opened();   /* กลับมาใช้หลังพักเกิน 30 นาที = เปิดใหม่หนึ่งครั้ง */
  });
  /* เกม: นับครั้งที่เปิด + นาทีที่เล่น */
  setTimeout(() => {
    const orig = A.ACT.gamePlay; if (typeof orig !== 'function') return;
    A.ACT.gamePlay = d => {
      orig(d); const sid = A.sid(); if (!sid || T() || !d.id) return;
      const day = iso(Date.now()), p = base() + '/' + sid + '/d/' + day, t0 = Date.now(), gid = String(d.id).replace(/[.#$/[\]]/g, '_');
      inc(p + '/g/' + gid);
      const host = Array.from(document.querySelectorAll('.gm-host')).pop(); let done = false;
      const finish = () => { if (done) return; done = true; clearInterval(iv); const min = Math.min(180, Math.round((Date.now() - t0) / 60000)); if (min > 0) inc(p + '/m/' + gid, min); };
      const iv = setInterval(() => { if (!host || !document.body.contains(host)) finish(); }, 4000);
      window.addEventListener('pagehide', finish, { once: true });
    };
  }, 0);

  /* ---------- ข้อมูลสำหรับคำนวณ ---------- */
  A.SUBS.push({ key: 'usage', path: () => T() ? base() : (A.sid() ? base() + '/' + A.sid() : null), norm: v => T() ? v : { [A.sid()]: v } });
  const U = () => A.D.usage || {};
  const daysOf = sid => ((U()[sid] || {}).d) || {};
  function streak(sid) { const d = daysOf(sid); let n = 0; for (const k of daysBack(400)) { if ((d[k] || {}).n) n++; else if (n || k !== iso(Date.now())) break; } return n; }
  function stats(sid, period) {
    const d = daysOf(sid), ks = daysBack(period); let days = 0, opens = 0, plays = 0, mins = 0;
    ks.forEach(k => { const r = d[k]; if (!r) return; if (r.n) { days++; opens += r.n; } Object.values(r.g || {}).forEach(v => { plays += +v || 0; }); Object.values(r.m || {}).forEach(v => { mins += +v || 0; }); });
    const u = U()[sid] || {}, last = u.last || 0;
    return { days, opens, plays, mins, last, away: last ? Math.floor((Date.now() - last) / DAY) : null };
  }
  const ago = s => s.last ? (s.away === 0 ? 'วันนี้' : s.away === 1 ? 'เมื่อวาน' : s.away + ' วันก่อน') : 'ไม่เคยเข้า';
  const gameName = id => ((C.games || []).concat(A.GAMES || []).find(g => g.id === id) || {}).title || id;
  const UX = { period: 30, sort: 'low' };

  /* ---------- หน้าครู: การเข้าใช้งาน ---------- */
  A.NAVS.push({ id: 'usage', label: 'การเข้าใช้งาน', icon: 'pulse', order: 43, show: () => T() });
  const strip = sid => { const d = daysOf(sid); return '<span class="us-strip" aria-hidden="true">' + daysBack(14).reverse().map(k => { const n = (d[k] || {}).n || 0; return '<i class="' + (n >= 3 ? 'h2' : n ? 'h1' : '') + '" title="' + esc(A.dTH(k, 'short') + ' · ' + (n ? 'เปิด ' + n + ' ครั้ง' : 'ไม่ได้เข้า')) + '"></i>'; }).join('') + '</span>'; };
  const statusChip = (s, p) => !s.last ? chip('ไม่เคยเข้า', 'bad') : s.away >= 14 ? chip('หายไป ' + s.away + ' วัน', 'gold') : s.days >= Math.ceil(p * 0.4) ? chip('เข้าประจำ', 'ok') : '';
  A.V.usage = function () {
    if (!T()) { location.hash = '#/home'; return null; }
    const P = UX.period, sids = A.activeSids(), ms = A.members(), S = {}; sids.forEach(s => { S[s] = stats(s, P); });
    const never = sids.filter(s => !S[s].last), gone = sids.filter(s => S[s].last && S[s].away >= 14), act = sids.filter(s => S[s].days > 0);
    const order = sids.slice().sort(UX.sort === 'class' ? A.byClass : UX.sort === 'high' ? (a, b) => S[b].days - S[a].days || S[b].opens - S[a].opens : (a, b) => (S[a].last ? 1 : 0) - (S[b].last ? 1 : 0) || S[a].days - S[b].days || S[a].last - S[b].last);
    let b = '<section class="card"><div class="row wrap"><div class="grow"><div class="lb" style="margin:0">การเข้าใช้แอปของสมาชิก</div><div class="muted">นับเฉพาะบัญชีนักเรียน · เปิดแอปหรือกลับมาใช้หลังพักเกิน 30 นาทีนับเป็นหนึ่งครั้ง</div></div>' +
      '<select class="in sm" data-us="period" aria-label="ช่วงเวลา">' + A.opt([[7, '7 วันล่าสุด'], [30, '30 วันล่าสุด'], [90, '90 วันล่าสุด']], P) + '</select></div></section>';
    b += '<div class="tiles"><div class="tile"><div class="lb">เข้าใช้ใน ' + P + ' วัน</div><div class="num">' + act.length + '</div><div class="muted">จาก ' + sids.length + ' คน</div></div>' +
      '<div class="tile"><div class="lb">หายไปเกิน 14 วัน</div><div class="num">' + gone.length + '</div><div class="muted">คน</div></div>' +
      '<div class="tile"><div class="lb">ไม่เคยเข้าแอปเลย</div><div class="num">' + never.length + '</div><div class="muted">คน</div></div>' +
      '<div class="tile dark"><div class="lb">เปิดแอปรวม</div><div class="num">' + act.reduce((a, s) => a + S[s].opens, 0) + '</div><div class="muted">ครั้งใน ' + P + ' วัน</div></div></div>';
    if (gone.length || never.length) b += '<section class="card hl"><div class="lb">ชวนกลับมาใช้แอป</div><div class="muted" style="margin-bottom:10px">ระบบส่งข้อความชวนกลับให้อัตโนมัติเมื่อหายไปครบ 7, 14 และ 30 วัน (ขั้นละครั้ง) ' + (never.length ? '· คนที่ไม่เคยเข้าแอปยังไม่ได้ลงทะเบียนรับแจ้งเตือน ต้องตามด้วยตัวเองหรือทางกลุ่ม LINE' : '') + '</div>' +
      (gone.length ? '<button class="btn" data-act="usNudge">ส่งข้อความชวนกลับตอนนี้ (' + gone.length + ' คน)</button>' : '') + (never.length ? '<button class="btn ghost" data-act="usNever" style="margin-left:6px">ดูรายชื่อคนที่ไม่เคยเข้า</button>' : '') + '</section>';
    b += '<section class="card"><div class="row" style="margin-bottom:6px"><div class="lb grow" style="margin:0">รายคน</div><select class="in sm" data-us="sort" aria-label="เรียงลำดับ">' + A.opt([['low', 'เข้าน้อยก่อน'], ['high', 'เข้าบ่อยก่อน'], ['class', 'ตามชั้น']], UX.sort) + '</select></div>' +
      '<div class="muted" style="margin-bottom:6px">ช่อง 14 ช่อง = 14 วันล่าสุด (ซ้ายเก่า → ขวาวันนี้) · สีเข้ม = เปิดตั้งแต่ 3 ครั้ง</div>' +
      (order.map(s => { const x = S[s]; return '<button class="mrow us-row" data-act="usOne" data-sid="' + esc(s) + '"><span class="mrow-main">' + A.avatar(ms[s]) + '<span class="grow"><b>' + esc(A.fullName(ms[s])) + '</b><span class="muted">' + esc(A.cls(ms[s]) + ' · ล่าสุด ' + ago(x) + ' · ' + x.days + ' วัน ' + x.opens + ' ครั้ง' + (x.plays ? ' · เกม ' + x.plays + ' ครั้ง' : '')) + '</span></span></span><span class="us-r">' + strip(s) + statusChip(x, P) + '</span></button>'; }).join('') || '<div class="empty">ยังไม่มีสมาชิก</div>') + '</section>';
    b += gameCard(sids, P);
    return { title: 'การเข้าใช้งาน', body: b };
  };
  function gameCard(sids, P) {
    const G = {}, ks = daysBack(P);
    sids.forEach(s => { const d = daysOf(s); ks.forEach(k => { const r = d[k]; if (!r) return; Object.keys(r.g || {}).forEach(g => { const o = G[g] = G[g] || { plays: 0, mins: 0, by: {} }; o.plays += +r.g[g] || 0; o.by[s] = (o.by[s] || 0) + (+r.g[g] || 0); }); Object.keys(r.m || {}).forEach(g => { const o = G[g] = G[g] || { plays: 0, mins: 0, by: {} }; o.mins += +r.m[g] || 0; }); }); });
    const l = Object.keys(G).sort((a, b) => G[b].plays - G[a].plays), max = Math.max(1, ...l.map(g => G[g].plays)), ms = A.members();
    return '<section class="card"><div class="lb">เกมที่เล่น (' + P + ' วัน)</div>' + (l.map(g => { const o = G[g], top = Object.keys(o.by).sort((a, b) => o.by[b] - o.by[a]).slice(0, 3);
      return '<div class="li"><div class="row"><b class="grow">' + esc(gameName(g)) + '</b><span class="muted">' + o.plays + ' ครั้ง · ' + Object.keys(o.by).length + ' คน · ' + o.mins + ' นาที</span></div><div class="lvbar" title="' + o.plays + ' ครั้ง"><i style="width:' + Math.max(2, o.plays / max * 100) + '%"></i></div>' +
        '<div class="muted" style="margin-top:4px">เล่นบ่อยสุด: ' + top.map(s => esc((ms[s] || {}).first || s) + ' ' + o.by[s]).join(' · ') + '</div></div>'; }).join('') || '<div class="muted">ยังไม่มีการเล่นเกมในช่วงนี้</div>') + '</section>';
  }
  document.addEventListener('change', e => { const k = e.target && e.target.dataset && e.target.dataset.us; if (!k) return; UX[k] = k === 'period' ? +e.target.value : e.target.value; A.rerender(); });
  const NUDGE = n => ['คิดถึงนะ ' + n + ' แวะมาดูความเคลื่อนไหวของชมรมกันหน่อย', n + ' มีกิจกรรมและเกมฝึกฝีมือรออยู่ในแอปชมรม ลองเปิดดูสัก 5 นาทีไหม', 'ฝึกวันละนิด ฝีมือก้าวไกล ' + n + ' กลับมาซ้อมไปด้วยกันนะ'];
  Object.assign(A.ACT, {
    usOne: d => {
      const s = d.sid, m = A.members()[s], u = U()[s] || {}, x7 = stats(s, 7), x30 = stats(s, 30), d0 = daysOf(s), G = {};
      Object.keys(d0).forEach(k => Object.keys(d0[k].g || {}).forEach(g => { G[g] = (G[g] || 0) + (+d0[k].g[g] || 0); }));
      modal('<h3>' + esc(A.fullName(m)) + '</h3><div class="muted" style="margin-bottom:10px">' + esc(A.cls(m)) + '</div>' +
        '<div class="kv"><span>เข้าแอปล่าสุด</span><b>' + (u.last ? esc(M.thDate(u.last)) + ' ' + new Date(u.last).toTimeString().slice(0, 5) + ' น.' : 'ไม่เคยเข้า') + '</b></div>' +
        '<div class="kv"><span>7 วันล่าสุด</span><b>' + x7.days + ' วัน · ' + x7.opens + ' ครั้ง</b></div><div class="kv"><span>30 วันล่าสุด</span><b>' + x30.days + ' วัน · ' + x30.opens + ' ครั้ง</b></div>' +
        '<div class="kv"><span>เข้าต่อเนื่อง</span><b>' + streak(s) + ' วัน</b></div>' + (u.nudged ? '<div class="kv"><span>ระบบชวนกลับล่าสุด</span><b>' + esc(M.thDate(u.nudged)) + '</b></div>' : '') +
        '<div class="lb" style="margin-top:12px">เกมทั้งหมดที่เคยเล่น</div>' + (Object.keys(G).sort((a, b) => G[b] - G[a]).map(g => '<div class="kv"><span>' + esc(gameName(g)) + '</span><b>' + G[g] + ' ครั้ง</b></div>').join('') || '<div class="muted">ยังไม่เคยเล่นเกม</div>') +
        '<button class="btn ghost block" data-close style="margin-top:14px">ปิด</button>', { center: true });
    },
    usNever: () => { const l = A.activeSids().filter(s => !(U()[s] || {}).last).sort(A.byClass), ms = A.members();
      modal('<h3>ยังไม่เคยเข้าแอป (' + l.length + ' คน)</h3><div class="muted" style="margin-bottom:8px">คนกลุ่มนี้ยังไม่ได้เปิดรับแจ้งเตือน ระบบจึงส่งข้อความหาไม่ได้</div>' + l.map(s => '<div class="kv"><span>' + esc(A.fullName(ms[s])) + '</span><b>' + esc(A.cls(ms[s])) + '</b></div>').join('') + '<button class="btn ghost block" data-close style="margin-top:14px">ปิด</button>', { center: true }); },
    usNudge: () => {
      const l = A.activeSids().filter(s => { const u = U()[s] || {}; return u.last && Date.now() - u.last >= 14 * DAY; }); if (!l.length) return;
      const w = modal('<h3>ส่งข้อความชวนกลับ (' + l.length + ' คน)</h3><form class="form">' + A.fld('หัวข้อ', '<input class="in" id="un-t" maxlength="100" value="คิดถึงนะ กลับมาที่ชมรม' + esc(C.club.name) + 'กันเถอะ">') +
        A.fld('ข้อความ', '<textarea class="in" id="un-b" rows="3" maxlength="350">' + esc(NUDGE('')[1].trim()) + '</textarea>') + '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn grow">ส่ง</button></div></form>', { center: true, sticky: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); if (!window.PUSH) return toast('ไม่พบระบบแจ้งเตือน'); PUSH.notify('msg', { to: l, title: $('#un-t', w).value.trim(), body: $('#un-b', w).value.trim(), url: '#/home' }); A.log('usage.nudge', '', l.length + ' คน'); w.remove(); toast('ส่งเข้าคิวแล้ว ' + l.length + ' คน'); });
    }
  });

  /* ---------- นักเรียน: กำลังใจบนหน้าหลัก ---------- */
  A.HOME.push({ order: 6, html: () => {
    const sid = A.sid(); if (!sid || T()) return ''; const n = streak(sid), w = stats(sid, 7).days; if (!n && !w) return '';
    const msg = n >= 7 ? 'สุดยอด! เข้าแอปต่อเนื่องครบสัปดาห์แล้ว' : n >= 3 ? 'กำลังไปได้สวย รักษาความต่อเนื่องไว้นะ' : 'เริ่มต้นได้ดี พรุ่งนี้แวะมาอีกนะ';
    return '<section class="card us-me"><div class="row"><span class="us-fire">' + n + '</span><div class="grow"><b>เข้าแอปต่อเนื่อง ' + n + ' วัน</b><div class="muted">' + esc(msg) + ' · สัปดาห์นี้เข้า ' + w + ' วัน</div></div></div><div style="margin-top:8px">' + strip(sid) + '</div></section>';
  } });
  A.usage = { stats, streak };
})();
