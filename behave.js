/* ============================================================
   behave.js — รุ่น 3.2: ระบบประเมินรวม "พฤติกรรม + คุณลักษณะ" (ระบบเดียว แยกเป็นแท็บ/หมวด)
   • รายสัปดาห์   y/{ปี}/behave/{sid}/{วันจันทร์} = { s:1–4, note, at, by }   (ครูแตะระดับ)
   • ความตั้งใจ   y/{ปี}/focus/{sid}/{วัน_รอบ}  = 1–3                        (ผู้เช็กการซ้อมให้ในหน้า "การซ้อม" → มีผลต่อคะแนนพฤติกรรม)
   • คุณลักษณะ    y/{ปี}/traits/{sid} = { s:{รหัสข้อ:1–4}, note, at, by }     (หมวดตาม config.js › traitGroups)
   คะแนนพฤติกรรมรวม = ถ่วงน้ำหนัก (ครูประเมินรายสัปดาห์ : ความตั้งใจที่แปลงเป็นสเกล 4)  ตั้งที่ config.js › behaveWeights
   ระดับ 4 ดีเยี่ยม · 3 ดี · 2 พอใช้ · 1 ปรับปรุง  (เฉลี่ย ≥3.5 / ≥2.5 / ≥1.5)
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP, C = M.C;
  const { $, esc, toast, modal } = M; const { ic, chip, fld, opt, avatar } = A;
  const Y = () => 'y/' + A.year(), T = () => A.teacher();
  const LV = [[4, 'ดีเยี่ยม', 'ok'], [3, 'ดี', 'blue'], [2, 'พอใช้', 'gold'], [1, 'ปรับปรุง', 'bad']];
  const lv = n => LV.find(x => x[0] === n) || [0, 'ยังไม่ประเมิน', 'line'];
  const lvOfAvg = a => a >= 3.5 ? LV[0] : a >= 2.5 ? LV[1] : a >= 1.5 ? LV[2] : LV[3];
  const GROUPS = () => C.traitGroups || [], ITEMS = () => GROUPS().reduce((a, g) => a.concat(g.items), []);
  const f2 = x => x === null || x === undefined ? '-' : x.toFixed(2);
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const monday = (d, add) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7) + (add || 0) * 7); return iso(x); };
  const weekEnd = w => { const d = new Date(w + 'T00:00:00'); d.setDate(d.getDate() + 6); return iso(d); };
  const weekTxt = w => A.dTH(w, 'short') + ' – ' + A.dTH(weekEnd(w), 'short');
  const BH = { tab: 'week', week: monday(new Date()) };

  A.SUBS.push(
    { key: 'behave', path: y => A.teacher() ? 'y/' + y + '/behave' : 'y/' + y + '/behave/' + A.sid(), norm: v => A.teacher() ? v : { [A.sid()]: v } },
    { key: 'traits', path: y => A.teacher() ? 'y/' + y + '/traits' : (A.sid() ? 'y/' + y + '/traits/' + A.sid() : null), norm: v => A.teacher() ? v : { [A.sid()]: v } }
  );
  A.NAVS.push({ id: 'behave', get label() { return A.teacher() ? 'ประเมินพฤติกรรมและคุณลักษณะ' : 'ผลประเมินของฉัน'; }, icon: 'star', order: 25 });
  A.V.traits = function () { location.hash = '#/behave'; return null; };   /* ลิงก์เก่า */

  /* ---------- ข้อมูล / คำนวณ ---------- */
  const rec = (sid, w) => ((A.D.behave || {})[sid] || {})[w] || null;
  const behAvg = sid => { const r = (A.D.behave || {})[sid] || {}, ks = Object.keys(r).filter(k => r[k] && r[k].s); return ks.length ? { n: ks.length, avg: ks.reduce((a, k) => a + r[k].s, 0) / ks.length } : { n: 0, avg: 0 }; };
  const focusAvg = (sid, from, to) => { const f = ((A.D.focus || {})[sid]) || {}; let s = 0, n = 0; Object.keys(f).forEach(k => { const d = k.slice(0, 10); if ((!from || d >= from) && (!to || d <= to) && f[k] > 0) { s += f[k]; n++; } }); return n ? { avg: s / n, n } : null; };
  const scaled = f => 1 + (f - 1) * 1.5;
  function behaveScore(sid) {
    const a = behAvg(sid), f = focusAvg(sid), W = Object.assign({ teacher: 0.7, focus: 0.3 }, C.behaveWeights || {}); let sum = 0, w = 0;
    if (a.n) { sum += a.avg * W.teacher; w += W.teacher; } if (f) { sum += scaled(f.avg) * W.focus; w += W.focus; }
    if (!w) return null; const total = sum / w;
    return { total, level: lvOfAvg(total), tAvg: a.n ? a.avg : null, nT: a.n, fAvg: f ? f.avg : null, nF: f ? f.n : 0 };
  }
  const tRec = sid => (A.D.traits || {})[sid] || null, sOf = sid => (tRec(sid) || {}).s || {};
  function groupScores(sid) { const s = sOf(sid); return GROUPS().map(g => { const v = g.items.map(i => s[i.id]).filter(x => x !== undefined && x !== null); return { id: g.id, name: g.name, n: v.length, total: g.items.length, avg: v.length ? v.reduce((a, b) => a + b, 0) / v.length : null }; }); }
  function tScore(sid) { const s = sOf(sid), v = ITEMS().map(i => s[i.id]).filter(x => x !== undefined && x !== null); return { n: v.length, total: ITEMS().length, avg: v.length ? v.reduce((a, b) => a + b, 0) / v.length : null }; }
  function overall(sid) { const p = [], b = behaveScore(sid); if (b) p.push(b.total); groupScores(sid).forEach(g => { if (g.avg !== null) p.push(g.avg); }); return p.length ? p.reduce((a, b) => a + b, 0) / p.length : null; }
  A.assess = { behaveScore, groupScores, tScore, overall, lv, lvOfAvg, LV };

  /* ---------- ค่าแนะนำจากระบบที่มีอยู่ ---------- */
  function basis(sid) {
    const att = (A.D.att || {})[sid] || {}; let p = 0, l = 0, v = 0, a = 0;
    Object.keys(att).forEach(k => { const x = att[k]; if (x === 'p') p++; else if (x === 'l') l++; else if (x === 'v') v++; else if (x === 'a') a++; });
    const n = p + l + v + a, evs = Object.keys(A.D.events || {}).filter(e => { const x = A.D.events[e]; return x && x.status !== 'cancelled' && (x.people || {})[sid] && (x.dateEnd || x.date) <= A.todayISO(); }).length;
    return { pct: n ? Math.round((p + l) / n * 100) : null, n, bs: behaveScore(sid), fa: focusAvg(sid), top: A.topLv(sid), N: Math.max(1, A.levels().length), evs, role: A.roleOf(sid) };
  }
  const pctLv = p => p >= 90 ? 4 : p >= 75 ? 3 : p >= 60 ? 2 : 1;
  function suggest(sid) {
    const b = basis(sid), s = {};
    if (b.bs) s.t2 = Math.round(b.bs.level[0]);
    if (b.pct !== null) { s.t3 = pctLv(b.pct); s.pr3 = pctLv(b.pct); }
    if (b.fa) s.pr2 = lvOfAvg(scaled(b.fa.avg))[0];
    if (b.top > 0) { const r = b.top / b.N; s.t4 = r >= 0.5 ? 4 : r >= 0.25 ? 3 : 2; }
    const m = [s.t3, s.t4].filter(x => x !== undefined); if (m.length) s.t6 = Math.round(m.reduce((x, y) => x + y, 0) / m.length);
    if (b.evs || b.role || Object.keys(A.D.events || {}).length) { const pts = b.evs + (b.role ? 2 : 0); s.t8 = pts >= 4 ? 4 : pts >= 2 ? 3 : pts >= 1 ? 2 : 1; }
    return s;
  }
  function srcText(id, b) {
    if (id === 't2') return b.bs ? 'คะแนนพฤติกรรมรวม ' + f2(b.bs.total) + ' / 4' : 'ยังไม่มีผลประเมินพฤติกรรม';
    if (id === 't3' || id === 'pr3') return b.pct !== null ? 'มาซ้อม ' + b.pct + '% (จาก ' + b.n + ' ครั้งที่ถูกเช็ก)' : 'ยังไม่มีข้อมูลการเช็กซ้อม';
    if (id === 'pr2') return b.fa ? 'ความตั้งใจเฉลี่ย ' + f2(b.fa.avg) + ' / 3 (' + b.fa.n + ' ครั้ง)' : 'ยังไม่มีคะแนนความตั้งใจจากการเช็กซ้อม';
    if (id === 't4') return b.top ? 'ระดับฝีมือสูงสุด ' + A.lvName(b.top) + ' (จาก ' + b.N + ' ขั้น)' : 'ยังไม่ได้ประเมินระดับฝีมือ';
    if (id === 't6') return 'จากการมาซ้อมและการพัฒนาฝีมือ';
    if (id === 't8') return 'ร่วมกิจกรรมแล้ว ' + b.evs + ' ครั้ง' + (b.role ? ' · ดำรงตำแหน่ง' + A.roleName(b.role) : '');
    return '';
  }
  const CRIT = [
    ['คะแนนพฤติกรรมรวม', 'ถ่วงน้ำหนัก ครูประเมินรายสัปดาห์ ' + Math.round(((C.behaveWeights || {}).teacher || 0.7) * 100) + '% + ความตั้งใจจากการเช็กซ้อม ' + Math.round(((C.behaveWeights || {}).focus || 0.3) * 100) + '% (ความตั้งใจ 1–3 แปลงเป็นสเกล 1–4)', 'เฉลี่ย ≥3.5 ดีเยี่ยม · ≥2.5 ดี · ≥1.5 พอใช้ · ต่ำกว่านั้นปรับปรุง'],
    ['ซื่อสัตย์สุจริต', 'ระดับของคะแนนพฤติกรรมรวม', ''],
    ['มีวินัย / ความเพียรในการซ้อม', 'ร้อยละการมาซ้อม = (มา + สาย) ÷ รอบที่ถูกเช็ก', '≥90% ดีเยี่ยม · ≥75% ดี · ≥60% พอใช้ · ต่ำกว่านั้นปรับปรุง'],
    ['สมาธิและทักษะการฟัง', 'ความตั้งใจเฉลี่ยจากการเช็กซ้อม', 'แปลงเป็นสเกล 1–4 ตามเกณฑ์ระดับด้านบน'],
    ['ใฝ่เรียนรู้', 'ระดับฝีมือสูงสุดเทียบกับจำนวนขั้นทั้งหมด', '≥ครึ่งหนึ่งของขั้น ดีเยี่ยม · ≥หนึ่งในสี่ ดี · ประเมินแล้ว พอใช้'],
    ['มุ่งมั่นในการทำงาน', 'ค่าเฉลี่ยของระดับ “มีวินัย” และ “ใฝ่เรียนรู้”', ''],
    ['มีจิตสาธารณะ', 'จำนวนกิจกรรมที่เข้าร่วมแล้ว + ตำแหน่งกรรมการ (นับเป็น 2)', '≥4 ดีเยี่ยม · ≥2 ดี · ≥1 พอใช้ · 0 ปรับปรุง'],
    ['ข้ออื่น ๆ', 'ครูพิจารณาเอง (ไม่มีค่าแนะนำจากระบบ)', '']
  ];
  function fillTraits(sids) {
    const upd = {}, now = Date.now(); let n = 0;
    sids.forEach(s => { const sg = suggest(s), cur = sOf(s); let any = false; Object.keys(sg).forEach(t => { if (cur[t] === undefined || cur[t] === null) { upd[Y() + '/traits/' + s + '/s/' + t] = sg[t]; any = true; } }); if (any) { upd[Y() + '/traits/' + s + '/at'] = now; upd[Y() + '/traits/' + s + '/by'] = A.myName(); n++; } });
    if (Object.keys(upd).length) A.W(B.update('', upd)); return n;
  }

  /* ---------- แถบแท็บ ---------- */
  const tabsHTML = () => '<div class="tabs" role="tablist">' + [['week', 'รายสัปดาห์'], ['traits', 'คุณลักษณะ'], ['sum', 'สรุปรายคน']].map(t => '<button role="tab" aria-selected="' + (BH.tab === t[0]) + '" class="' + (BH.tab === t[0] ? 'on' : '') + '" data-act="bhTab" data-t="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>';
  const lvBtns = (cur, act, extra) => LV.map(x => '<button class="stb ' + (cur === x[0] ? x[2] : 'off') + '" aria-pressed="' + (cur === x[0]) + '" data-act="' + act + '" ' + extra + ' data-v="' + x[0] + '">' + x[1] + '</button>').join('');

  /* ============ รายสัปดาห์ (ครู) ============ */
  function weekTab() {
    const w = BH.week, list = A.activeSids().sort(A.byClass), ms = A.members(), done = list.filter(s => rec(s, w)).length, cur = w === monday(new Date()), sug = list.filter(s => !rec(s, w) && focusAvg(s, w, weekEnd(w))).length;
    let b = '<section class="card"><div class="row"><button class="icb" data-act="bhWeek" data-d="-1" aria-label="สัปดาห์ก่อนหน้า">' + ic('left') + '</button><div class="grow" style="text-align:center"><b>สัปดาห์ ' + esc(weekTxt(w)) + '</b><div class="muted">' + (cur ? 'สัปดาห์นี้ · ' : '') + 'ประเมินแล้ว ' + done + '/' + list.length + ' คน</div></div><button class="icb" data-act="bhWeek" data-d="1" aria-label="สัปดาห์ถัดไป"' + (cur ? ' disabled' : '') + '>' + ic('right') + '</button></div>' +
      '<div class="row wrap" style="margin-top:12px">' + (sug ? '<button class="btn gold" data-act="bhSug">ใช้ค่าแนะนำจากความตั้งใจ (' + sug + ')</button>' : '') + (done < list.length ? '<button class="btn ghost" data-act="bhAll">ให้ “ดี” คนที่ยังไม่ประเมิน (' + (list.length - done) + ')</button>' : '') + '<button class="btn ghost" data-act="bhExport">' + ic('down', 18) + 'ส่งออกสัปดาห์นี้</button></div>' +
      '<div class="muted" style="margin-top:8px">แตะระดับของแต่ละคน ระบบบันทึกทันที แตะซ้ำเพื่อยกเลิก · “ความตั้งใจ” มาจากคะแนน 1–3 ที่ผู้เช็กให้ในหน้า “การซ้อม” และมีผลต่อคะแนนพฤติกรรมรวม · “บันทึก” ใช้เขียนข้อความถึงนักเรียน</div></section>';
    b += '<section class="card">' + (list.map(s => { const r = rec(s, w), a = behAvg(s), fa = focusAvg(s, w, weekEnd(w));
      return '<div class="bh"><div class="mrow-main">' + avatar(ms[s]) + '<span class="grow"><b>' + esc(A.fullName(ms[s])) + '</b><span class="muted">' + esc(A.cls(ms[s])) + (a.n ? ' · เฉลี่ย ' + a.avg.toFixed(2) + ' จาก ' + a.n + ' สัปดาห์' : '') + (fa ? ' · ตั้งใจสัปดาห์นี้ ' + fa.avg.toFixed(1) + '/3' : '') + (r && r.note ? ' · มีบันทึก' : '') + '</span></span></div>' +
        '<div class="bh-b" role="group" aria-label="ระดับพฤติกรรมของ ' + esc(ms[s].first) + '">' + lvBtns(r && r.s, 'bhSet', 'data-sid="' + esc(s) + '"') + '<button class="btn ghost sm" data-act="bhNote" data-sid="' + esc(s) + '">บันทึก</button></div></div>'; }).join('') || '<div class="empty">ยังไม่มีสมาชิก</div>') + '</section>';
    return b;
  }

  /* ============ คุณลักษณะ (ครู) ============ */
  function traitsTab() {
    const list = A.activeSids().sort(A.byClass), ms = A.members(), N = ITEMS().length, done = list.filter(s => tScore(s).n === N).length;
    let b = '<section class="card"><div class="lb">คุณลักษณะ · ปีการศึกษา ' + esc(A.year()) + '</div><div class="muted">' + GROUPS().map(g => esc(g.name)).join(' · ') + '<br>ประเมินครบ ' + done + ' / ' + list.length + ' คน · ระดับ 4 ดีเยี่ยม · 3 ดี · 2 พอใช้ · 1 ปรับปรุง ระบบดึงข้อมูลการซ้อม พฤติกรรม ระดับฝีมือ และกิจกรรมมาเป็นค่าแนะนำ ครูตัดสินขั้นสุดท้าย</div>' +
      '<div class="row wrap" style="margin-top:12px"><button class="btn gold" data-act="trFillAll">ใช้ค่าแนะนำกับทุกคนที่ยังว่าง</button></div>' +
      '<details class="yr" style="margin-top:10px"><summary>เกณฑ์ที่ระบบใช้แนะนำ</summary>' + CRIT.map(c => '<div class="li"><b>' + esc(c[0]) + '</b><div class="muted">' + esc(c[1]) + '</div>' + (c[2] ? '<div class="muted">' + esc(c[2]) + '</div>' : '') + '</div>').join('') + '</details></section>';
    b += '<section class="card">' + (list.map(s => { const sc = tScore(s); return '<a class="mrow" style="text-decoration:none;color:inherit" href="#/behave/' + esc(s) + '"><span class="mrow-main">' + avatar(ms[s]) + '<span class="grow"><b>' + esc(A.fullName(ms[s])) + '</b><span class="muted">' + esc(A.cls(ms[s])) + ' · ประเมินแล้ว ' + sc.n + '/' + N + '</span></span></span><span class="mrow-tags">' + (sc.n ? chip(f2(sc.avg) + ' ' + lvOfAvg(sc.avg)[1], lvOfAvg(sc.avg)[2]) : chip('ยังไม่ประเมิน', 'line')) + '</span></a>'; }).join('') || '<div class="empty">ยังไม่มีสมาชิก</div>') + '</section>';
    return b;
  }
  function traitDetail(sid) {
    const m = A.members()[sid], b = basis(sid), sg = suggest(sid), r = tRec(sid) || {}, cur = r.s || {}, ov = overall(sid), gs = groupScores(sid);
    let h = '<section class="card hero"><div class="row">' + avatar(m, 'xl ring') + '<div class="grow"><div class="hero-name">' + esc(A.fullName(m)) + '</div><div class="hero-sub">' + esc(A.cls(m) + ' · ปีการศึกษา ' + A.year()) + '</div></div></div><div class="row wrap" style="margin-top:12px;gap:8px">' + (ov !== null ? chip('ภาพรวม ' + f2(ov) + ' · ' + lvOfAvg(ov)[1], 'gold') : chip('ยังไม่ประเมิน', 'dark')) + (b.bs ? chip('พฤติกรรม ' + f2(b.bs.total) + ' · ' + b.bs.level[1], 'dark') : '') + '</div></section>' +
      '<div class="row wrap" style="margin-bottom:14px"><button class="btn gold" data-act="trFill" data-sid="' + esc(sid) + '">ใช้ค่าแนะนำ (เฉพาะข้อที่ยังว่าง)</button><button class="btn ghost" data-act="trNote" data-sid="' + esc(sid) + '">บันทึกถึงนักเรียน</button><button class="btn ghost" data-act="awNew" data-sid="' + esc(sid) + '">ให้รางวัลคนนี้</button></div>' +
      '<section class="card"><div class="lb">ข้อมูลจากระบบที่มีอยู่</div><div class="kv"><span>การมาซ้อม</span><b>' + (b.pct === null ? 'ยังไม่มีข้อมูล' : b.pct + '% (' + b.n + ' ครั้ง)') + '</b></div><div class="kv"><span>ความตั้งใจเฉลี่ย (1–3)</span><b>' + (b.fa ? f2(b.fa.avg) + ' (' + b.fa.n + ' ครั้ง)' : 'ยังไม่มีข้อมูล') + '</b></div><div class="kv"><span>ครูประเมินพฤติกรรมรายสัปดาห์ (1–4)</span><b>' + (b.bs && b.bs.tAvg !== null ? f2(b.bs.tAvg) + ' (' + b.bs.nT + ' สัปดาห์)' : 'ยังไม่มีข้อมูล') + '</b></div><div class="kv"><span>ระดับฝีมือสูงสุด</span><b>' + (b.top ? esc(A.lvName(b.top)) : 'ยังไม่ประเมิน') + '</b></div><div class="kv"><span>กิจกรรมที่เข้าร่วมแล้ว</span><b>' + b.evs + ' ครั้ง</b></div></section>';
    GROUPS().forEach((g, gi) => { const sc = gs[gi];
      const body = g.items.map((t, i) => '<div class="trw"><div class="row"><b class="grow">' + (i + 1) + '. ' + esc(t.name) + '</b>' + (sg[t.id] !== undefined ? '<span class="chip line">แนะนำ: ' + lv(sg[t.id])[1] + '</span>' : '') + '</div>' + (t.desc ? '<div class="muted">' + esc(t.desc) + '</div>' : '') + (srcText(t.id, b) ? '<div class="muted">ข้อมูลประกอบ: ' + esc(srcText(t.id, b)) + '</div>' : '') + '<div class="bh-b">' + lvBtns(cur[t.id], 'trSet', 'data-sid="' + esc(sid) + '" data-t="' + t.id + '"') + '</div></div>').join('');
      h += g.fold ? '<details class="card yr"><summary>' + esc(g.name) + ' · ' + (sc.avg !== null ? f2(sc.avg) : 'ยังไม่ประเมิน') + '</summary>' + body + '</details>' : '<section class="card"><div class="row"><div class="lb grow" style="margin:0">' + esc(g.name) + '</div>' + (sc.avg !== null ? chip(f2(sc.avg) + ' ' + lvOfAvg(sc.avg)[1], lvOfAvg(sc.avg)[2]) : chip('ยังไม่ประเมิน', 'line')) + '</div>' + body + '</section>'; });
    if (r.note) h += '<div class="note">บันทึกถึงนักเรียน: ' + esc(r.note) + '</div>';
    return { title: 'ประเมินคุณลักษณะ', body: h, back: '#/behave' };
  }

  /* ============ สรุปรายคน (ครู) ============ */
  function sumRows() { return A.activeSids().sort(A.byClass).map(s => ({ s, bs: behaveScore(s), gs: groupScores(s), ov: overall(s) })); }
  function sumTab() {
    const ms = A.members(), l = sumRows(), cell = v => v === null ? '-' : '<b>' + f2(v) + '</b>';
    return '<section class="card"><div class="row wrap" style="margin-bottom:8px"><div class="lb grow" style="margin:0">สรุปคะแนนรายคน (เต็ม 4) · ปีการศึกษา ' + esc(A.year()) + '</div><button class="btn ghost sm" data-act="sumExport">' + ic('down', 16) + 'ส่งออก</button></div><div class="tw"><table class="tb"><thead><tr><th>สมาชิก</th><th>พฤติกรรม</th>' + GROUPS().map(g => '<th>' + esc(g.short || g.name) + '</th>').join('') + '<th>ภาพรวม</th></tr></thead><tbody>' +
      l.map(x => '<tr><td><a href="#/behave/' + esc(x.s) + '" style="text-decoration:none;color:inherit"><b>' + esc(A.fullName(ms[x.s])) + '</b><div class="muted">' + esc(A.cls(ms[x.s])) + '</div></a></td><td>' + cell(x.bs ? x.bs.total : null) + '</td>' + x.gs.map(g => '<td>' + cell(g.avg) + '</td>').join('') + '<td>' + (x.ov !== null ? chip(f2(x.ov) + ' ' + lvOfAvg(x.ov)[1], lvOfAvg(x.ov)[2]) : '-') + '</td></tr>').join('') + '</tbody></table></div>' + (l.length ? '' : '<div class="empty">ยังไม่มีข้อมูล</div>') + '</section>';
  }

  /* ============ มุมมองนักเรียน ============ */
  function studentView() {
    const sid = A.sid(), m = A.members()[sid]; if (!m) return { title: 'ผลประเมินของฉัน', body: '<div class="empty">ไม่พบข้อมูล</div>' };
    const bs = behaveScore(sid), ov = overall(sid), r = (A.D.behave || {})[sid] || {}, ks = Object.keys(r).filter(k => r[k] && r[k].s).sort().reverse(), s = sOf(sid), gs = groupScores(sid);
    let b = '<section class="card hero"><div class="row">' + avatar(m, 'xl ring') + '<div class="grow"><div class="hero-name">ผลประเมินของ ' + esc(m.first) + '</div><div class="hero-sub">ปีการศึกษา ' + esc(A.year()) + ' · คะแนนเต็ม 4 · ครูเป็นผู้ประเมิน</div></div></div><div class="row wrap" style="margin-top:12px;gap:8px">' + (ov !== null ? chip('ภาพรวม ' + f2(ov) + ' · ' + lvOfAvg(ov)[1], 'gold') : chip('ยังไม่มีผลประเมิน', 'dark')) + '</div></section>';
    b += '<section class="card"><div class="row"><div class="lb grow" style="margin:0 0 8px">พฤติกรรม</div>' + (bs ? chip(f2(bs.total) + ' · ' + bs.level[1], bs.level[2]) : '') + '</div>' + (bs ? '<div class="kv"><span>ครูประเมินรายสัปดาห์ (เฉลี่ย)</span><b>' + (bs.tAvg !== null ? f2(bs.tAvg) + ' (' + bs.nT + ' สัปดาห์)' : '-') + '</b></div><div class="kv"><span>ความตั้งใจในการซ้อม (เฉลี่ย 1–3)</span><b>' + (bs.fAvg !== null ? f2(bs.fAvg) + ' (' + bs.nF + ' ครั้ง)' : '-') + '</b></div>' : '<div class="muted">ยังไม่มีผลประเมิน</div>') +
      ks.slice(0, 8).map(k => '<div class="li"><div class="row"><span class="grow">' + esc(weekTxt(k)) + '</span>' + chip(lv(r[k].s)[1], lv(r[k].s)[2]) + '</div>' + (r[k].note ? '<div class="muted">ครู: ' + esc(r[k].note) + '</div>' : '') + '</div>').join('') + '</section>';
    GROUPS().forEach((g, gi) => { const sc = gs[gi]; b += '<section class="card"><div class="row"><div class="lb grow" style="margin:0 0 8px">' + esc(g.name) + '</div>' + (sc.avg !== null ? chip(f2(sc.avg) + ' ' + lvOfAvg(sc.avg)[1], lvOfAvg(sc.avg)[2]) : chip('ยังไม่ประเมิน', 'line')) + '</div>' + g.items.map(t => '<div class="kv"><span>' + esc(t.name) + '</span>' + (s[t.id] ? chip(lv(s[t.id])[1], lv(s[t.id])[2]) : '<span class="muted">ยังไม่ประเมิน</span>') + '</div>').join('') + '</section>'; });
    const note = (tRec(sid) || {}).note; if (note) b += '<div class="note">ข้อความจากครู: ' + esc(note) + '</div>';
    return { title: 'ผลประเมินของฉัน', body: b };
  }
  A.V.behave = function (arg) {
    if (!T()) return studentView();
    if (arg && A.members()[arg]) return traitDetail(arg);
    return { title: 'ประเมินพฤติกรรมและคุณลักษณะ', body: tabsHTML() + (BH.tab === 'traits' ? traitsTab() : BH.tab === 'sum' ? sumTab() : weekTab()) };
  };
  A.HOME.push({ order: 22, html: () => {
    const sid = A.sid(); if (!sid) return ''; const bs = behaveScore(sid), ov = overall(sid); if (!bs && ov === null) return '';
    const r = (A.D.behave || {})[sid] || {}, ks = Object.keys(r).filter(k => r[k] && r[k].s).sort().reverse();
    return '<section class="card"><div class="row"><div class="lb grow" style="margin:0">ผลประเมินพฤติกรรมและคุณลักษณะ</div><a href="#/behave" class="muted">ดูรายละเอียด</a></div><div class="row wrap" style="margin-top:8px;gap:8px">' + (bs ? chip('พฤติกรรม ' + f2(bs.total) + ' · ' + bs.level[1], bs.level[2]) : '') + (ov !== null ? chip('ภาพรวม ' + f2(ov) + ' · ' + lvOfAvg(ov)[1], 'gold') : '') + '</div>' +
      ks.slice(0, 2).filter(k => r[k].note).map(k => '<div class="li"><div class="muted">' + esc(weekTxt(k)) + ' · ครู: ' + esc(r[k].note) + '</div></div>').join('') + '</section>';
  } });
  A.TODO.push(() => T() && A.activeSids().length ? { n: A.activeSids().filter(s => !rec(s, monday(new Date()))).length, label: 'สมาชิกที่ยังไม่ได้ประเมินพฤติกรรมสัปดาห์นี้', href: '#/behave' } : null);

  /* ---------- ส่งออก ---------- */
  function exportModal(title, name, sub, head, rows, widths, align, legend) {
    const w = modal('<h3>' + esc(title) + '</h3><div class="xlist"><button class="xbtn" data-x="pdf"><b>PDF</b><span>สำหรับพิมพ์</span></button><button class="xbtn" data-x="docx"><b>DOCX</b><span>เปิดแก้ต่อใน Word</span></button></div><div class="muted" id="x-msg" style="margin-top:10px"></div><button class="btn ghost block" data-close style="margin-top:12px">ปิด</button>', { center: true });
    w.addEventListener('click', async e => { const x = e.target.closest('[data-x]'); if (!x) return; const msg = $('#x-msg', w); msg.textContent = 'กำลังสร้างไฟล์ …';
      try { if (x.dataset.x === 'docx') await M.saveBlob(M.docxTable({ title, lines: [sub.replace(/ · /g, ' ')], head, rows, widths, align: align.map(a => a === 'c' ? 'center' : 'left'), footer: ['', legend] }), name + '.docx');
        else await M.exportPDF(A.tablePages(title, sub, head, rows, { widths, align, foot: legend + ' ·' }), name + '.pdf'); msg.textContent = 'เสร็จแล้ว'; } catch (er) { msg.textContent = 'ส่งออกไม่สำเร็จ: ' + (er.message || er); } });
  }
  const LEG = 'ระดับ: ดีเยี่ยม 4 · ดี 3 · พอใช้ 2 · ปรับปรุง 1';

  /* ---------- การทำงานของปุ่ม ---------- */
  const saveWeek = (sid, s, note) => { const old = rec(sid, BH.week) || {}, v = { s, at: Date.now(), by: A.myName() }, n = note === undefined ? old.note : note; if (n) v.note = n; return A.W(B.set(Y() + '/behave/' + sid + '/' + BH.week, v)); };
  Object.assign(A.ACT, {
    bhTab: d => { BH.tab = d.t; A.rerender(); },
    bhWeek: d => { const x = monday(new Date(BH.week + 'T00:00:00'), +d.d); if (x > monday(new Date())) return; BH.week = x; A.rerender(); },
    bhSet: d => { if (!T()) return; const r = rec(d.sid, BH.week), s = +d.v; if (r && r.s === s && !r.note) A.W(B.remove(Y() + '/behave/' + d.sid + '/' + BH.week)); else saveWeek(d.sid, s); },
    bhAll: () => { if (!T()) return; const upd = {}, now = Date.now(); A.activeSids().forEach(s => { if (!rec(s, BH.week)) upd[s + '/' + BH.week] = { s: 3, at: now, by: A.myName() }; }); const n = Object.keys(upd).length; if (n) { A.W(B.update(Y() + '/behave', upd)); toast('ให้ “ดี” ' + n + ' คนแล้ว แก้รายคนได้'); } },
    bhSug: () => { if (!T()) return; const upd = {}, now = Date.now(); A.activeSids().forEach(s => { if (rec(s, BH.week)) return; const fa = focusAvg(s, BH.week, weekEnd(BH.week)); if (fa) upd[s + '/' + BH.week] = { s: lvOfAvg(scaled(fa.avg))[0], at: now, by: A.myName() }; }); const n = Object.keys(upd).length; if (n) { A.W(B.update(Y() + '/behave', upd)); toast('ใส่ค่าแนะนำ ' + n + ' คนแล้ว ตรวจและแก้รายคนได้'); } },
    bhNote: d => {
      if (!T()) return; const m = A.members()[d.sid], r = rec(d.sid, BH.week) || {};
      const w = modal('<h3>บันทึกถึงนักเรียน</h3><div class="muted" style="margin-bottom:8px">' + esc(A.fullName(m)) + ' · สัปดาห์ ' + esc(weekTxt(BH.week)) + '</div><form class="form">' + fld('ระดับ', '<select class="in" id="b-s">' + opt(LV.map(x => [x[0], x[1]]), r.s || 3) + '</select>') + fld('ข้อความ (นักเรียนคนนี้จะเห็น)', '<textarea class="in" id="b-n" rows="3">' + esc(r.note || '') + '</textarea>') + '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn grow">บันทึก</button></div></form>', { center: true, sticky: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); saveWeek(d.sid, +$('#b-s', w).value, $('#b-n', w).value.trim() || null); w.remove(); });
    },
    trSet: d => { if (!T()) return; const cur = sOf(d.sid)[d.t], v = +d.v, base = Y() + '/traits/' + d.sid, upd = {}; upd[base + '/s/' + d.t] = cur === v ? null : v; upd[base + '/at'] = Date.now(); upd[base + '/by'] = A.myName(); A.W(B.update('', upd)); },
    trFill: d => { if (!T()) return; toast(fillTraits([d.sid]) ? 'ใส่ค่าแนะนำแล้ว ตรวจและแก้ได้' : 'ไม่มีข้อที่ใส่ค่าแนะนำได้เพิ่ม'); },
    trFillAll: async () => { if (!T()) return; const l = A.activeSids().filter(s => Object.keys(suggest(s)).some(t => sOf(s)[t] === undefined)); if (!l.length) return toast('ไม่มีข้อที่ใส่ค่าแนะนำได้เพิ่ม');
      if (!(await M.confirmBox('ใช้ค่าแนะนำ', 'ใส่ค่าแนะนำของระบบให้สมาชิก ' + l.length + ' คน เฉพาะข้อที่ยังว่าง (ไม่ทับที่ครูประเมินแล้ว) แก้รายคนได้ภายหลัง', 'ใส่ค่าแนะนำ'))) return; fillTraits(l); toast('ใส่ค่าแนะนำแล้ว'); },
    trNote: d => { if (!T()) return; const m = A.members()[d.sid], r = tRec(d.sid) || {};
      const w = modal('<h3>บันทึกถึงนักเรียน</h3><div class="muted" style="margin-bottom:8px">' + esc(A.fullName(m)) + '</div><form class="form">' + fld('ข้อความ (นักเรียนคนนี้เห็นในหน้า “ผลประเมินของฉัน”)', '<textarea class="in" id="tn" rows="4">' + esc(r.note || '') + '</textarea>') + '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn grow">บันทึก</button></div></form>', { center: true, sticky: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const base = Y() + '/traits/' + d.sid; A.W(B.update('', { [base + '/note']: $('#tn', w).value.trim() || null, [base + '/at']: Date.now(), [base + '/by']: A.myName() })); w.remove(); toast('บันทึกแล้ว'); }); },
    bhExport: () => {
      const list = A.activeSids().sort(A.byClass), ms = A.members(), wk = BH.week;
      const head = ['ลำดับ', 'ชื่อ - สกุล', 'ชั้น', 'สัปดาห์นี้', 'ความตั้งใจ', 'พฤติกรรมรวม', 'บันทึก'], rows = list.map((s, i) => { const r = rec(s, wk), fa = focusAvg(s, wk, weekEnd(wk)), bs = behaveScore(s); return [String(i + 1), A.fullName(ms[s]), A.cls(ms[s]), r ? lv(r.s)[1] : '-', fa ? f2(fa.avg) : '-', bs ? f2(bs.total) : '-', (r && r.note) || '']; });
      exportModal('สรุปการประเมินพฤติกรรมรายสัปดาห์', 'ประเมินพฤติกรรม-' + wk, C.club.full + ' · ปีการศึกษา ' + A.year() + ' · สัปดาห์ ' + weekTxt(wk), head, rows, [7, 28, 9, 12, 11, 12, 21], ['c', '', 'c', 'c', 'c', 'c', ''], LEG + ' · ความตั้งใจเต็ม 3');
    },
    sumExport: () => {
      const ms = A.members(), l = sumRows(), head = ['ลำดับ', 'ชื่อ - สกุล', 'ชั้น', 'พฤติกรรม'].concat(GROUPS().map(g => g.short || g.name), ['ภาพรวม', 'ผล']);
      const rows = l.map((x, i) => [String(i + 1), A.fullName(ms[x.s]), A.cls(ms[x.s]), f2(x.bs ? x.bs.total : null)].concat(x.gs.map(g => f2(g.avg)), [f2(x.ov), x.ov !== null ? lvOfAvg(x.ov)[1] : '-']));
      exportModal('สรุปการประเมินพฤติกรรมและคุณลักษณะ', 'สรุปประเมิน-' + M.safeName(C.club.name) + '-' + A.year(), C.club.full + ' · ปีการศึกษา ' + A.year(), head, rows, [6, 26, 8, 10].concat(GROUPS().map(() => 11), [10, 11]), ['c', '', 'c', 'c'].concat(GROUPS().map(() => 'c'), ['c', 'c']), LEG + ' · เฉลี่ย ≥3.5 ดีเยี่ยม ≥2.5 ดี ≥1.5 พอใช้');
    }
  });
})();
