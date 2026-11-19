/* ============================================================
   werewolf.js — รุ่น 3.44: เกม “คืนปีศาจเสียงเพี้ยน” (แนวแววูฟ) เล่นเป็นกลุ่มในห้องซ้อม 5–15 คน
   • เครื่องผู้ดำเนินเกม (ครูหรือใครก็ได้ที่ไม่เล่น) เปิดห้อง ฉายขึ้นจอ เป็นผู้คุมกติกาและเสียง · ผู้เล่นใช้มือถือของตัวเอง เข้าด้วยรหัส 4 ตัว
   • ข้อมูล: ww/{รหัส}/meta (เจ้าของห้อง) · pl ผู้เล่น · pub สถานะที่ทุกคนเห็น · priv/{sid} บทบาทลับของแต่ละคน · act/{sid} การกระทำกลางคืน (ผู้ดำเนินเกมเท่านั้นที่อ่านได้) · vote/{sid} โหวตกลางวัน · hs สถานะลับของผู้ดำเนินเกม
   • ผู้ดำเนินเกมไม่เห็นบทบาทบนจอระหว่างเล่น (จอฉายขึ้นให้ทุกคนดู) เปิดเผยทั้งหมดตอนจบเกม
   พัฒนาโดย นายนนทพัทธ์ วงค์มูล 2026
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP;
  const { $, esc, toast, modal } = M; const { chip, fld, opt } = A;
  const T = () => A.teacher(), me = () => A.sid();
  const myEmail = () => { try { const u = window.firebase && window.firebase.auth && window.firebase.auth().currentUser; if (u && u.email) return u.email; } catch (e) { /* ignore */ } return (A.ME && A.ME.email) || (T() ? 'teacher@demo' : (me() || 'x') + '@sappha.ac.th'); };
  const RP = c => '/ww/' + c;
  const ROLES = {
    wolf: { n: 'ปีศาจเสียงเพี้ยน', i: '👹', team: 'w', d: 'กลางคืนตกลงกับพวกปีศาจ (เห็นตัวเลือกของกันและกันในมือถือ) เลือกสาปสมาชิก 1 คนให้เสียงเพี้ยนตกรอบ · ชนะเมื่อปีศาจมีจำนวนเท่ากับหรือมากกว่ามนุษย์' },
    minion: { n: 'ลูกคู่เสียงหลง', i: '🎭', team: 'w', d: 'คุณรู้ว่าใครเป็นปีศาจ แต่ปีศาจไม่รู้ว่าคุณเป็นใคร · หูทองฟังคุณแล้วเห็นเป็นมนุษย์ · ช่วยฝ่ายปีศาจให้ชนะ แม้ตัวเองจะตกรอบก็ตาม' },
    seer: { n: 'หูทอง', i: '👂', team: 'v', d: 'ทุกคืนฟังเสียงสมาชิก 1 คน รู้ทันทีว่าเป็นปีศาจหรือไม่ · ระวังอย่าเปิดตัวเร็วเกินไป' },
    doctor: { n: 'ช่างเทียบเสียง', i: '🔧', team: 'v', d: 'ทุกคืนคุ้มครองสมาชิก 1 คน (รวมตัวเองได้) ไม่ให้ถูกสาป · คุ้มครองคนเดิมสองคืนติดกันไม่ได้' },
    witch: { n: 'หมอยาพื้นบ้าน', i: '🌿', team: 'v', d: 'มียาชุบเสียง 1 ขวด ช่วยคนที่ถูกสาปคืนนั้น และยาพิษ 1 ขวด ให้ใครตกรอบก็ได้ · ใช้ได้อย่างละครั้งตลอดเกม' },
    hunter: { n: 'พรานกลองหลวง', i: '🥁', team: 'v', d: 'เมื่อคุณตกรอบไม่ว่าทางไหน ได้ตีกลองหลวงครั้งสุดท้าย พาสมาชิกอีก 1 คนออกไปด้วย' },
    cupid: { n: 'ผู้ผูกคู่ขวัญ', i: '🎎', team: 'v', d: 'คืนแรกผูกสมาชิก 2 คนเป็นคู่ขวัญ (ผูกตัวเองได้) ถ้าคนหนึ่งตกรอบ อีกคนตกรอบตาม · ถ้าคู่ขวัญรอดเป็นสองคนสุดท้าย คู่ขวัญชนะ' },
    jester: { n: 'จำอวด', i: '🃏', team: 'j', d: 'ชนะคนเดียวทันทีถ้าถูกโหวตออกตอนกลางวัน · ทำตัวให้น่าสงสัยเข้าไว้ แต่อย่าให้ใครจับได้' },
    vil: { n: 'นักดนตรีชาวบ้าน', i: '🎵', team: 'v', d: 'ไม่มีพลังพิเศษ ใช้การสังเกตและการถกเถียงหาตัวปีศาจ แล้วโหวตให้ถูกคน' }
  };
  const ORDER = ['wolf', 'minion', 'seer', 'doctor', 'witch', 'hunter', 'cupid', 'jester'];
  const preset = n => { const c = { wolf: n <= 6 ? 1 : n <= 10 ? 2 : 3, seer: 1, doctor: 1 }; if (n >= 6) c.hunter = 1; if (n >= 7) c.jester = 1; if (n >= 8) { c.witch = 1; c.cupid = 1; } if (n >= 9) c.minion = 1; return c; };
  const TEAM = { v: 'ฝ่ายนักดนตรี', w: 'ฝ่ายปีศาจ', j: 'จำอวด', l: 'คู่ขวัญ' };
  const PH = { lobby: 'รอผู้เล่น', role: 'ดูบทบาท', n1: 'กลางคืน', n2: 'กลางคืน', hunt: 'กลองหลวงดังครั้งสุดท้าย', day: 'กลางวัน · ถกเถียง', vote: 'กลางวัน · โหวต', end: 'จบเกม' };
  const night = p => p === 'n1' || p === 'n2' || p === 'role';

  /* ---------- ข้อมูลห้อง ---------- */
  const R = {}; let SUBK = '';
  function room(c) {
    if (!R[c]) { R[c] = { meta: undefined, pl: {}, pub: {}, priv: {}, act: {}, vote: {}, hs: {}, offs: [] };
      const r = R[c], on = (k, p) => r.offs.push(B.on(RP(c) + p, v => { r[k] = v === null || v === undefined ? (k === 'meta' ? null : {}) : v; if (isHost(c)) tick(c); A.rerender(); }, () => { }));
      on('meta', '/meta'); on('pl', '/pl'); on('pub', '/pub'); on('vote', '/vote'); if (me()) on('priv', '/priv/' + me()); }
    return R[c];
  }
  function hostSubs(c) { const r = room(c); if (r.hostOn) return; r.hostOn = true; const on = (k, p) => r.offs.push(B.on(RP(c) + p, v => { r[k] = v || {}; tick(c); A.rerender(); }, () => { })); on('act', '/act'); on('hs', '/hs'); }
  const isHost = c => { const m = (R[c] || {}).meta; return !!(m && m.h && m.h === myEmail()); };
  const PK = () => Object.keys(PX.PRESETS).filter(k => k !== 'tang');
  const spec = (r, s) => { const p = (r.pl || {})[s]; if (p && p.px && typeof p.px === 'object') return p.px; const L = PK(); let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return PX.PRESETS[L[h % L.length]]; };
  const nm = (r, s) => (((r.pl || {})[s] || {}).n || s);
  const short = n => String(n || '').replace(/^(ด\.ช\.|ด\.ญ\.|นาย|นางสาว|น\.ส\.|นาง)\s*/, '').split(' ')[0];
  const alive = r => Object.keys((r.pub || {}).alive || {}).filter(s => r.pub.alive[s]);

  /* ---------- เสียง (เฉพาะเครื่องผู้ดำเนินเกม) ---------- */
  const SND = { on: true }; try { SND.on = localStorage.getItem('spw_ww_snd') !== '0'; } catch (e) { /* ignore */ }
  let AC = null, OUT = null, loopT = null, loopN = 0, loopI = 0, loopPh = '';
  function ac() { if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); OUT = AC.createGain(); OUT.gain.value = .8; OUT.connect(AC.destination); } if (AC.state === 'suspended') AC.resume(); return AC; }
  function tone(f, t, d, v, type) { const a = ac(); if (!a) return; const o = a.createOscillator(), g = a.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(OUT); o.start(t); o.stop(t + d + .05); }
  const nf = d => 293.7 * Math.pow(2, d / 7);
  const FX = { ching: t => { tone(2793, t, 1.2, .05); tone(4186, t, .8, .025); }, mong: t => { tone(147, t, 2.6, .22); tone(296, t, 1.3, .07); }, drum: t => { tone(70, t, .6, .4, 'triangle'); tone(140, t, .2, .15); },
    win: t => { [0, 1, 2, 4, 5, 7, 8, 9].forEach((d, i) => tone(nf(d), t + i * .11, .4, .07, 'triangle')); } };
  function sfx(n, k, gap) { if (!SND.on) return; const a = ac(); if (!a) return; const t0 = a.currentTime + .05; for (let i = 0; i < (k || 1); i++) FX[n](t0 + i * (gap || .5)); }
  const NIGHT = [4, 2, 1, 2, 4, 5, 4, 2, 1, 0, -2, 0], DAY = [0, 2, 4, 5, 4, 2, 4, 5, 7, 5, 4, 2];
  function loop(ph) { const want = SND.on && /^#\/ww\//.test(location.hash) ? (night(ph) ? 'n' : ph === 'day' || ph === 'vote' ? 'd' : '') : '';
    if (want === loopPh) return; loopPh = want; if (loopT) { clearInterval(loopT); loopT = null; } if (!want) return; const a = ac(); if (!a) return; loopN = a.currentTime + .2; loopI = 0;
    loopT = setInterval(() => { if (!AC) return; while (loopN < AC.currentTime + .8) { const mel = loopPh === 'n' ? NIGHT : DAY, d = mel[loopI % mel.length], t = loopN;
      if (loopPh === 'n') { tone(nf(d) * 2, t, 1.3, .025); if (loopI % 6 === 0) tone(nf(-7), t, 3, .03, 'triangle'); loopN += .9; }
      else { tone(nf(d), t, .5, .03, 'triangle'); if (loopI % 4 === 3) (Math.floor(loopI / 4) % 2 ? FX.ching : t2 => tone(2793, t2, .08, .04))(t); loopN += .45; } loopI++; } }, 250); }

  /* ---------- เครื่องยนต์เกม: ทำงานบนเครื่องผู้ดำเนินเกมเท่านั้น ---------- */
  const W = (c, upd) => B.update(RP(c), upd).catch(e => { toast('บันทึกไม่สำเร็จ: ' + (A.errTH ? A.errTH(e) : e.message)); throw e; });
  const LOG = (r, s) => ((r.pub.log || []).concat([s])).slice(-8);
  const acted = (r, s, st) => { const a = (r.act || {})[s]; return !!(a && a.r === r.pub.r && a.s === st); };
  const busy = {};
  async function run(c, fn) { if (busy[c]) return; busy[c] = true; try { await fn(c); } catch (e) { console.error(e); } setTimeout(() => { busy[c] = false; tick(c); }, 1500); }
  function tick(c) {
    const r = R[c]; if (!r || !r.pub || !r.pub.ph || busy[c] || !isHost(c)) return; const p = r.pub, hs = r.hs || {}, roles = hs.roles || {}, now = Date.now();
    if (p.ph === 'n1') {
      const wolves = alive(r).filter(s => roles[s] === 'wolf'), wp = {}, upd = {}; wolves.forEach(s => { if (acted(r, s, 'n1')) wp[s] = r.act[s].t; });
      const k = JSON.stringify(wp); if (k !== r._wp) { r._wp = k; wolves.forEach(s => { upd['priv/' + s + '/wp'] = wp; }); }
      alive(r).filter(s => roles[s] === 'seer' && acted(r, s, 'n1')).forEach(s => { const t = r.act[s].t; if (t && !(r._seen || {})[s + t]) { (r._seen = r._seen || {})[s + t] = 1; upd['priv/' + s + '/seen/' + t] = roles[t] === 'wolf'; } });
      if (Object.keys(upd).length) W(c, upd).catch(() => { });
      const need = alive(r).filter(s => ['wolf', 'seer', 'doctor'].includes(roles[s]) || (roles[s] === 'cupid' && p.r === 1));
      if (need.every(s => acted(r, s, 'n1')) || now > p.t) run(c, resolveN1);
    } else if (p.ph === 'n2') { const w = alive(r).find(s => roles[s] === 'witch'); if (!w || acted(r, w, 'n2') || now > p.t) run(c, resolveNight); }
    else if (p.ph === 'hunt') { if (acted(r, p.hunter, 'hunt') || now > p.t) run(c, resolveHunt); }
    else if (p.ph === 'day') { if (p.t && now > p.t) run(c, startVote); }
    else if (p.ph === 'vote') { const vs = r.vote || {}; if (alive(r).every(s => vs[s] && vs[s].r === p.r) || now > p.t) run(c, resolveVote); }
  }
  async function startGame(c) {
    const r = R[c], ids = Object.keys(r.pl || {}).sort((a, b) => (r.pl[a].at || 0) - (r.pl[b].at || 0)), cnt = ((r.meta || {}).cfg || {}).roles || preset(ids.length), pool = [];
    ORDER.forEach(k => { for (let i = 0; i < (+cnt[k] || 0); i++) pool.push(k); });
    if (ids.length < 4) return toast('ต้องมีผู้เล่นอย่างน้อย 4 คน (แนะนำ 5 คนขึ้นไป)'); if (!pool.includes('wolf')) return toast('ต้องมีปีศาจอย่างน้อย 1 ตน');
    if (pool.length > ids.length) return toast('บทบาทพิเศษ (' + pool.length + ') มากกว่าจำนวนผู้เล่น (' + ids.length + ') — กดตั้งค่าบทบาท หรือใช้ “จัดอัตโนมัติ”');
    while (pool.length < ids.length) pool.push('vil'); for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const roles = {}; ids.forEach((s, i) => { roles[s] = pool[i]; }); const wolves = ids.filter(s => roles[s] === 'wolf'), al = {}; ids.forEach(s => { al[s] = true; });
    const upd = { act: null, vote: null, priv: {}, hs: { roles, pot: { h: 1, p: 1 }, last: '' }, 'meta/st': 'play' };
    ids.forEach(s => { upd.priv[s] = { role: roles[s], need: '', mates: roles[s] === 'wolf' ? wolves.filter(x => x !== s) : roles[s] === 'minion' ? wolves : null, pot: roles[s] === 'witch' ? { h: 1, p: 1 } : null }; });
    upd.pub = { ph: 'role', r: 0, alive: al, t: 0, log: ['🎭 แจกบทบาทแล้ว ' + ids.length + ' คน · ดูบทบาทในมือถือของตัวเอง อย่าให้ใครเห็น'] };
    r._seen = {}; r._wp = ''; await W(c, upd); sfx('ching', 2, .6);
  }
  async function startNight(c) {
    const r = R[c], p = r.pub, roles = r.hs.roles, rn = (p.r || 0) + 1, cfg = r.meta.cfg || {}, upd = { act: null };
    alive(r).forEach(s => { const k = roles[s]; upd['priv/' + s + '/need'] = k === 'wolf' ? 'kill' : k === 'seer' ? 'see' : k === 'doctor' ? 'save' : k === 'cupid' && rn === 1 ? 'cupid' : 'sus'; upd['priv/' + s + '/r'] = rn; upd['priv/' + s + '/wp'] = null; upd['priv/' + s + '/victim'] = null; if (k === 'doctor') upd['priv/' + s + '/last'] = r.hs.last || ''; });
    upd['pub/ph'] = 'n1'; upd['pub/r'] = rn; upd['pub/t'] = Date.now() + (+cfg.night || 60) * 1000; upd['pub/log'] = LOG(r, '🌙 คืนที่ ' + rn + ' · ทุกคนก้มดูมือถือ ทำหน้าที่ของตัวเองเงียบ ๆ'); r.pub.log = upd['pub/log'];
    r._wp = ''; await W(c, upd); sfx('mong');
  }
  async function resolveN1(c) {
    const r = R[c], p = r.pub, hs = r.hs, roles = hs.roles, al = alive(r), a1 = s => acted(r, s, 'n1') ? r.act[s] : null, tally = {};
    al.filter(s => roles[s] === 'wolf').forEach(s => { const a = a1(s); if (a && a.t && p.alive[a.t]) tally[a.t] = (tally[a.t] || 0) + 1; });
    const mx = Math.max(0, ...Object.values(tally)), top = Object.keys(tally).filter(k => tally[k] === mx), victim = mx ? top[Math.floor(Math.random() * top.length)] : '';
    let prot = ''; const doc = al.find(s => roles[s] === 'doctor'); if (doc) { const a = a1(doc); if (a && a.t && a.t !== hs.last) prot = a.t; }
    const upd = { 'hs/last': prot, 'hs/night': { victim, prot } }; hs.last = prot; hs.night = { victim, prot };
    const cup = al.find(s => roles[s] === 'cupid'); if (cup && p.r === 1) { const a = a1(cup); if (a && a.t && a.t2 && a.t !== a.t2 && p.alive[a.t] && p.alive[a.t2]) { upd['hs/lovers'] = [a.t, a.t2]; hs.lovers = [a.t, a.t2]; upd['priv/' + a.t + '/love'] = a.t2; upd['priv/' + a.t2 + '/love'] = a.t; } }
    const wit = al.find(s => roles[s] === 'witch'), pot = hs.pot || {};
    if (wit && (pot.h || pot.p)) { upd['pub/ph'] = 'n2'; upd['pub/t'] = Date.now() + (+(r.meta.cfg || {}).witch || 40) * 1000; upd['priv/' + wit + '/need'] = 'witch'; upd['priv/' + wit + '/victim'] = victim && victim !== prot ? victim : ''; upd['priv/' + wit + '/pot'] = pot; await W(c, upd); return; }
    await W(c, upd); await resolveNight(c);
  }
  async function resolveNight(c) {
    const r = R[c], p = r.pub, hs = r.hs, roles = hs.roles, n = hs.night || {}, wit = alive(r).find(s => roles[s] === 'witch'), pot = Object.assign({ h: 0, p: 0 }, hs.pot || {});
    let victim = n.victim && n.victim !== n.prot ? n.victim : '', poison = '';
    if (wit && acted(r, wit, 'n2')) { const a = r.act[wit]; if (a.h && pot.h && victim) { victim = ''; pot.h = 0; } if (a.p && pot.p && p.alive[a.p]) { poison = a.p; pot.p = 0; } }
    hs.pot = pot; if (wit) await W(c, { 'hs/pot': pot, ['priv/' + wit + '/pot']: pot });
    const L = []; if (victim) L.push([victim, 'kill']); if (poison && poison !== victim) L.push([poison, 'poison']);
    await kill(c, L, 'day', ['☀️ เช้าวันที่ ' + p.r]);
  }
  const HOW = { kill: 'ถูกปีศาจสาปจนเสียงเพี้ยน', poison: 'ถูกยาพิษของหมอยา', vote: 'ถูกที่ประชุมโหวตออก', hunt: 'ถูกกลองหลวงของพรานพาออกไป', love: 'ตรอมใจตามคู่ขวัญ' };
  async function kill(c, list, after, pre) {
    const r = R[c], p = r.pub, hs = r.hs, roles = hs.roles, al = Object.assign({}, p.alive), dead = Object.assign({}, p.dead || {}), rev = (r.meta.cfg || {}).reveal !== false, msgs = (pre || []).slice(), newly = [], q = list.slice();
    while (q.length) { const [s, how] = q.shift(); if (!al[s]) continue; al[s] = false; dead[s] = { r: p.r, how, role: rev ? roles[s] : null }; newly.push(s);
      msgs.push((rev ? ROLES[roles[s]].i + ' ' : '💀 ') + short(nm(r, s)) + ' ' + HOW[how] + (rev ? ' — เป็น' + ROLES[roles[s]].n : ''));
      const Lv = hs.lovers; if (Lv && Lv.includes(s)) { const o = Lv[0] === s ? Lv[1] : Lv[0]; if (al[o]) q.push([o, 'love']); } }
    if (!list.length) msgs.push(after === 'day' ? 'เมื่อคืนไม่มีใครตกรอบ' : 'ไม่มีใครถูกโหวตออก');
    const upd = { 'pub/alive': al, 'pub/dead': dead, 'pub/log': ((p.log || []).concat(msgs)).slice(-8) }; newly.forEach(s => { upd['priv/' + s + '/need'] = ''; });
    p.alive = al; p.dead = dead; p.log = upd['pub/log'];
    const shot = hs.shot || {}, h = newly.find(s => roles[s] === 'hunter' && !shot[s]);
    if (h) { (hs.shot = shot)[h] = true; Object.assign(upd, { ['hs/shot/' + h]: true, 'pub/ph': 'hunt', 'pub/hunter': h, 'pub/after': after, 'pub/t': Date.now() + 30000, ['priv/' + h + '/need']: 'hunt', ['priv/' + h + '/r']: p.r });
      upd['pub/log'] = p.log = p.log.concat(['🥁 ' + short(nm(r, h)) + ' คือพรานกลองหลวง! กำลังเลือกคนที่จะพาออกไปด้วย']).slice(-8); await W(c, upd); sfx('drum', 4, .3); return; }
    if (newly.length) sfx('mong');
    const win = winner(r, al); if (win) return end(c, win, upd);
    await W(c, upd); if (after === 'day') await startDay(c); else await startNight(c);
  }
  async function resolveHunt(c) { const r = R[c], p = r.pub, h = p.hunter, a = acted(r, h, 'hunt') ? r.act[h] : null, after = p.after || 'day';
    if (a && a.t && p.alive[a.t]) return kill(c, [[a.t, 'hunt']], after);
    const win = winner(r, p.alive); p.log = LOG(r, '🥁 พรานไม่ได้เลือกใคร'); if (win) return end(c, win, { 'pub/log': p.log });
    await W(c, { 'pub/log': p.log }); if (after === 'day') await startDay(c); else await startNight(c); }
  async function startDay(c) { const r = R[c], d = +((r.meta.cfg || {}).disc) || 180; r.pub.log = LOG(r, '💬 ถกเถียงกัน ' + Math.round(d / 60 * 10) / 10 + ' นาที แล้วโหวตหาตัวปีศาจ');
    await W(c, { 'pub/ph': 'day', 'pub/t': Date.now() + d * 1000, 'pub/log': r.pub.log, act: null }); sfx('ching', 2, .6); }
  async function startVote(c) { const r = R[c]; await W(c, { 'pub/ph': 'vote', 'pub/t': Date.now() + (+((r.meta.cfg || {}).vote) || 60) * 1000, vote: null }); sfx('ching'); }
  async function resolveVote(c) {
    const r = R[c], p = r.pub, roles = r.hs.roles, vs = r.vote || {}, tally = {};
    alive(r).forEach(s => { const v = vs[s]; if (v && v.r === p.r && v.t && p.alive[v.t]) tally[v.t] = (tally[v.t] || 0) + 1; });
    const mx = Math.max(0, ...Object.values(tally)), top = Object.keys(tally).filter(k => tally[k] === mx), sum = Object.keys(tally).sort((a, b) => tally[b] - tally[a]).map(k => short(nm(r, k)) + ' ' + tally[k]).join(' · ') || 'ไม่มีใครโหวต';
    if (!mx || top.length > 1) { p.log = LOG(r, '🗳️ ผลโหวต: ' + sum + ' → เสียงไม่ขาด ไม่มีใครออก'); await W(c, { 'pub/log': p.log }); return startNight(c); }
    const out = top[0];
    if (roles[out] === 'jester') { const al = Object.assign({}, p.alive); al[out] = false; return end(c, 'j', { 'pub/alive': al, 'pub/log': LOG(r, '🗳️ ผลโหวต: ' + sum + ' → ' + short(nm(r, out)) + ' ถูกโหวตออก… และเขาคือจำอวด 🃏') }); }
    await kill(c, [[out, 'vote']], 'night', ['🗳️ ผลโหวต: ' + sum]);
  }
  function winner(r, al) { const roles = r.hs.roles, L2 = Object.keys(al).filter(s => al[s]), w = L2.filter(s => roles[s] === 'wolf').length, Lv = r.hs.lovers;
    if (Lv && L2.length === 2 && L2.includes(Lv[0]) && L2.includes(Lv[1])) return 'l'; if (!w) return 'v'; if (w >= L2.length - w) return 'w'; return ''; }
  const WMSG = { v: '🎵 ฝ่ายนักดนตรีชนะ! ขับปีศาจเสียงเพี้ยนออกจากวงได้หมด', w: '👹 ฝ่ายปีศาจชนะ! วงดนตรีเสียงเพี้ยนทั้งวง', j: '🃏 จำอวดชนะคนเดียว!', l: '🎎 คู่ขวัญชนะ! รอดกันสองคนสุดท้าย' };
  async function end(c, win, upd) { const r = R[c]; upd = upd || {}; Object.assign(upd, { 'pub/ph': 'end', 'pub/win': win, 'pub/reveal': r.hs.roles, 'pub/lovers': r.hs.lovers || null, 'pub/t': 0, 'meta/st': 'end' });
    upd['pub/log'] = ((upd['pub/log'] || r.pub.log || []).concat([WMSG[win]])).slice(-8); await W(c, upd); sfx('win'); }
  const isWinner = (p, s) => { const role = (p.reveal || {})[s], t = (ROLES[role] || {}).team; return p.win === 'l' ? (p.lovers || []).includes(s) : p.win === 'j' ? role === 'jester' : t === p.win; };

  /* ---------- ภาพศาลาซ้อมยามค่ำ/กลางวัน ---------- */
  const IMG = {}, SW = 192, SH = 110;
  function scene(r) {
    if (!window.PX) return ''; const p = r.pub || {}, ids = Object.keys(r.pl || {}).sort((a, b) => (r.pl[a].at || 0) - (r.pl[b].at || 0)).slice(0, 15), nt = night(p.ph) || p.ph === 'hunt', dead = p.dead || {}, lov = p.ph === 'end' ? (p.lovers || []) : [];
    const sig = [nt, ids.join(), Object.keys(dead).join(), ids.map(s => JSON.stringify(spec(r, s)).length).join(), p.ph === 'end' ? p.win : ''].join('|');
    if (!IMG[sig]) { const cv = document.createElement('canvas'); cv.width = SW; cv.height = SH; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; const F = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
      const gr = g.createLinearGradient(0, 0, 0, 60); gr.addColorStop(0, nt ? '#070b24' : '#6cc0ef'); gr.addColorStop(1, nt ? '#1c2150' : '#bfe6f7'); g.fillStyle = gr; g.fillRect(0, 0, SW, 60);
      if (nt) { for (let i = 0; i < 40; i++) F(i % 3 ? '#cfd6ff' : '#fff', (i * 47) % SW, (i * 23) % 50, 1, 1); F('#f4ecc2', 160, 8, 10, 10); F('#070b24', 163, 7, 9, 9); }
      else { F('#f6d36b', 158, 7, 12, 12); F('#fff4b8', 160, 9, 8, 8); [[20, 14], [70, 8], [120, 18]].forEach(([x, y]) => { F('#fff', x, y, 18, 4); F('#fff', x + 4, y - 3, 10, 3); }); }
      F(nt ? '#1b2a1c' : '#4f8a45', 0, 60, SW, SH - 60); for (let y = 64; y < SH; y += 6) F(nt ? '#162418' : '#467d3d', 0, y, SW, 1);
      const rf = nt ? '#4a1420' : '#8c2232', rf2 = nt ? '#331018' : '#6b1a26', gd = '#F3C95B';
      for (let i = 0; i < 4; i++) F(i % 2 ? rf2 : rf, 52 + i * 6, 14 + i * 6, 88 - i * 12, 6); F(rf, 46, 38, 100, 4); F(gd, 46, 42, 100, 1); F(gd, 94, 8, 4, 6);
      [52, 74, 118, 138].forEach(x => F(nt ? '#3a2416' : '#6b4226', x, 43, 3, 16)); F(nt ? '#2a1a10' : '#8a5a34', 44, 58, 104, 4);
      const n = ids.length, rows = n > 8 ? [ids.slice(0, Math.ceil(n / 2)), ids.slice(Math.ceil(n / 2))] : [ids], Y = rows.length > 1 ? [56, 80] : [72];
      rows.forEach((row, ri) => row.forEach((s, i) => { const x = Math.round((SW - 16) * (i + 1) / (row.length + 1)) - 0, y = Y[ri], d = !!dead[s];
        g.globalAlpha = d ? .3 : 1; g.drawImage(PX.sprite(spec(r, s), 'd', 0), x, y, 16, 24); g.globalAlpha = 1;
        if (d) { F('#c0392b', x + 4, y - 4, 8, 2); F('#c0392b', x + 7, y - 7, 2, 8); }
        if (p.ph === 'end' && isWinner(p, s)) { F(gd, x + 3, y - 6, 10, 2); F(gd, x + 3, y - 9, 2, 3); F(gd, x + 7, y - 10, 2, 4); F(gd, x + 11, y - 9, 2, 3); } }));
      IMG[sig] = { src: cv.toDataURL(), pos: rows.map((row, ri) => row.map((s, i) => [s, Math.round((SW - 16) * (i + 1) / (row.length + 1)) + 8, Y[ri] + 25])) };
    }
    const im = IMG[sig];
    return '<div class="ct-room"><img src="' + im.src + '" alt="ศาลาซ้อม ผู้เล่นนั่งล้อมวง">' + im.pos.flat().map(([s, x, y]) => '<span class="ct-lab" style="left:' + (x / SW * 100) + '%;top:' + (y / SH * 100) + '%;font-size:.58rem;' + (dead[s] ? 'opacity:.55;text-decoration:line-through' : '') + '">' + esc(short(nm(r, s))) + '</span>').join('') + '</div>';
  }

  /* ---------- หน้าจอ ---------- */
  setInterval(() => { document.querySelectorAll('[data-wwt]').forEach(e => { const t = +e.dataset.wwt, d = Math.max(0, Math.round((t - Date.now()) / 1000)); e.textContent = t ? Math.floor(d / 60) + ':' + String(d % 60).padStart(2, '0') : ''; });
    Object.keys(R).forEach(c => { if (isHost(c)) { tick(c); loop(/^#\/ww\//.test(location.hash) ? ((R[c].pub || {}).ph || '') : ''); } }); }, 1000);
  const tmr = p => p.t && p.ph !== 'end' ? ' · ⏱ <b data-wwt="' + p.t + '"></b>' : '';
  const rolesHelp = () => '<details class="card"><summary class="lb" style="cursor:pointer">บทบาททั้งหมด (9)</summary>' + ORDER.concat(['vil']).map(k => '<div style="padding:6px 0;border-top:1px dashed var(--line)"><b>' + ROLES[k].i + ' ' + esc(ROLES[k].n) + '</b> <span class="muted" style="font-size:.78rem">' + TEAM[ROLES[k].team] + '</span><div style="font-size:.85rem">' + esc(ROLES[k].d) + '</div></div>').join('') + '</details>';
  A.GAMES = A.GAMES || []; A.GAMES.push({ id: 'ww', title: '👹 คืนปีศาจเสียงเพี้ยน', desc: 'เกมเล่นเป็นกลุ่มแนวแววูฟ 5–15 คน · ผู้ดำเนินเกมเปิดห้องฉายขึ้นจอ ผู้เล่นใช้มือถือ', mount: (host, close) => { close(); location.hash = '#/ww'; } });
  A.V.ww = function (code) {
    if (!code) return { title: 'คืนปีศาจเสียงเพี้ยน', back: '#/games', body: '<section class="card" style="text-align:center"><div style="font-size:2.4rem">👹🌙🎵</div><h2 style="margin:6px 0">คืนปีศาจเสียงเพี้ยน</h2><div class="muted">มีสมาชิกในวงถูกปีศาจเสียงเพี้ยนสิง · กลางคืนปีศาจสาปคนให้ตกรอบ กลางวันทุกคนถกเถียงแล้วโหวตหาตัวปีศาจ</div></section>' +
      '<section class="card"><div class="lb">เข้าร่วมเกม</div><div class="row" style="gap:8px"><input class="in" id="ww-code" maxlength="4" placeholder="รหัส 4 ตัว" style="text-transform:uppercase;font-size:1.3rem;letter-spacing:4px;text-align:center;max-width:180px"><button class="btn gold" data-act="wwJoin">เข้าห้อง</button></div></section>' +
      '<section class="card"><div class="lb">เป็นผู้ดำเนินเกม</div><div class="muted" style="font-size:.88rem;margin-bottom:8px">เปิดห้องบนคอมพิวเตอร์หรือแท็บเล็ตที่ฉายขึ้นจอ ผู้ดำเนินเกมไม่ได้เล่นและไม่เห็นบทบาทใครระหว่างเกม</div><button class="btn" data-act="wwNew">🎬 เปิดห้องใหม่</button></section>' + rolesHelp() };
    const c = String(code).toUpperCase(), r = room(c);
    if (r.meta === undefined) return { title: 'คืนปีศาจเสียงเพี้ยน', body: '<div class="empty">กำลังโหลด…</div>', back: '#/ww' };
    if (r.meta === null) return { title: 'คืนปีศาจเสียงเพี้ยน', body: '<div class="empty">ไม่พบห้อง ' + esc(c) + ' (ห้องอาจถูกปิดแล้ว)</div>', back: '#/ww' };
    return isHost(c) ? (hostSubs(c), hostView(c, r)) : playerView(c, r);
  };
  function head(c, r) { const p = r.pub || {}, ph = p.ph || 'lobby'; return '<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:8px"><b class="grow">ห้อง ' + esc(c) + ' · ' + esc(PH[ph] || '') + (p.r ? ' คืนที่ ' + p.r : '') + tmr(p) + '</b>' + chip(alive(r).length + '/' + Object.keys(r.pl || {}).length + ' คนยังอยู่', 'line') + '</div>'; }
  const logBox = p => (p.log || []).length ? '<section class="card"><div class="lb">เหตุการณ์</div>' + p.log.slice().reverse().map((x, i) => '<div style="padding:4px 0;border-top:1px dashed var(--line);' + (i ? 'opacity:.75;font-size:.88rem' : 'font-weight:700') + '">' + esc(x) + '</div>').join('') + '</section>' : '';
  function revealBox(r) { const p = r.pub; return '<section class="card"><div class="lb">เฉลยบทบาท</div>' + Object.keys(p.reveal || {}).map(s => { const k = p.reveal[s], w = isWinner(p, s); return '<div class="row" style="padding:5px 0;border-top:1px dashed var(--line);gap:6px"><span>' + ROLES[k].i + '</span><b class="grow">' + esc(nm(r, s)) + '</b><span class="muted" style="font-size:.82rem">' + esc(ROLES[k].n) + '</span>' + (w ? chip('ชนะ', 'gold') : '') + ((p.dead || {})[s] ? chip('ตกรอบ', 'line') : '') + '</div>'; }).join('') + '</section>'; }
  function hostView(c, r) {
    const p = r.pub || {}, ph = p.ph || 'lobby', ids = Object.keys(r.pl || {}), cfg = (r.meta || {}).cfg || {}, cnt = cfg.roles || preset(ids.length), K = esc(c);
    let b = head(c, r) + scene(r), say = '', btn = '';
    if (ph === 'lobby') { const n = ORDER.reduce((a, k) => a + (+cnt[k] || 0), 0);
      say = '<div style="font-size:1.05rem">ให้ผู้เล่นเปิดแอป › เกม › คืนปีศาจเสียงเพี้ยน แล้วใส่รหัส</div><div style="font-size:3rem;font-weight:800;letter-spacing:10px;color:#F3C95B;margin:6px 0">' + K + '</div><div>ผู้เล่น ' + ids.length + ' คน · บทบาท: ' + ORDER.filter(k => +cnt[k]).map(k => ROLES[k].i + (cnt[k] > 1 ? '×' + cnt[k] : '')).join(' ') + (ids.length > n ? ' ' + ROLES.vil.i + '×' + (ids.length - n) : '') + (cfg.roles ? '' : ' (จัดอัตโนมัติตามจำนวนคน)') + '</div>';
      btn = '<button data-act="wwCfg" data-c="' + K + '">⚙️ ตั้งค่า</button><button class="p" data-act="wwStart" data-c="' + K + '">▶ แจกบทบาท</button>';
      b += '<section class="card"><div class="lb">ผู้เล่นในห้อง (' + ids.length + ')</div>' + (ids.length ? ids.map(s => '<span class="chip" style="margin:2px">' + esc(short(nm(r, s))) + ' <a href="javascript:void 0" data-act="wwKick" data-c="' + K + '" data-s="' + esc(s) + '" title="นำออก">✕</a></span>').join('') : '<div class="muted">ยังไม่มีผู้เล่น</div>') + '</section>'; }
    else if (ph === 'role') { say = 'ทุกคนแตะดูบทบาทในมือถือของตัวเอง อย่าให้ใครเห็น · พร้อมแล้วเริ่มคืนแรก'; btn = '<button class="p" data-act="wwNight" data-c="' + K + '">🌙 เริ่มคืนที่ 1</button>'; }
    else if (ph === 'n1' || ph === 'n2') { say = '🌙 คืนที่ ' + p.r + ' · ทุกคนก้มดูมือถือ ทำหน้าที่ของตัวเองเงียบ ๆ ห้ามพูด ห้ามมองจอคนอื่น'; btn = '<button data-act="wwSkip" data-c="' + K + '">⏭ ข้ามเวลา</button>'; }
    else if (ph === 'hunt') { say = '🥁 พรานกลองหลวงกำลังเลือกคนที่จะพาออกไปด้วย…'; btn = '<button data-act="wwSkip" data-c="' + K + '">⏭ ข้ามเวลา</button>'; }
    else if (ph === 'day') { say = '☀️ ' + esc((p.log || []).slice(-3).join(' · ')) + '<div style="margin-top:6px">ถกเถียงกัน หาตัวปีศาจ แล้วโหวต</div>'; btn = '<button class="p" data-act="wwSkip" data-c="' + K + '">🗳️ เริ่มโหวตเลย</button><button data-act="wwMore" data-c="' + K + '">+1 นาที</button>'; }
    else if (ph === 'vote') { const vs = r.vote || {}, tl = {}; let n = 0; alive(r).forEach(s => { const v = vs[s]; if (v && v.r === p.r) { n++; if (v.t) tl[v.t] = (tl[v.t] || 0) + 1; } });
      say = '🗳️ โหวตแล้ว ' + n + '/' + alive(r).length + ' คน' + '<div style="margin-top:8px;text-align:left">' + Object.keys(tl).sort((a, b) => tl[b] - tl[a]).map(s => '<div class="row" style="gap:6px"><span style="width:90px">' + esc(short(nm(r, s))) + '</span><span style="height:12px;background:#c0392b;border-radius:3px;width:' + (tl[s] * 22) + 'px"></span><b>' + tl[s] + '</b></div>').join('') + '</div>'; btn = '<button class="p" data-act="wwSkip" data-c="' + K + '">ปิดโหวต</button>'; }
    else if (ph === 'end') { say = '<div style="font-size:1.3rem;font-weight:800">' + esc(WMSG[p.win] || '') + '</div>'; btn = '<button class="p" data-act="wwAgain" data-c="' + K + '">🔁 เล่นอีกรอบ</button><button data-act="wwClose" data-c="' + K + '">ปิดห้อง</button>'; }
    b += '<div class="ct-dlg" style="text-align:center"><span class="who">ผู้ดำเนินเกม</span><div style="margin:8px 0 12px;line-height:1.6">' + say + '</div><div class="ct-acts">' + btn + '<button data-act="wwSnd">' + (SND.on ? '🔊 เสียงเปิด' : '🔇 เสียงปิด') + '</button></div></div>';
    if (ph === 'end') b += revealBox(r);
    return { title: 'คืนปีศาจเสียงเพี้ยน · ผู้ดำเนินเกม', body: b + (ph !== 'lobby' ? logBox(p) : rolesHelp()), back: '#/ww' };
  }

  const SHOW = {}, MY = {}, CUP = {}, WIT = {}, LN = {};
  function playerView(c, r) {
    const p = r.pub || {}, ph = p.ph || 'lobby', v = r.priv || {}, s = me(), K = esc(c), inG = !!(s && (r.pl || {})[s]), live = !!(p.alive || {})[s], ro = ROLES[v.role];
    let b = head(c, r) + scene(r);
    if (!inG) { b += '<section class="card" style="text-align:center">' + (ph === 'lobby' && s ? '<div style="margin-bottom:8px">ห้อง ' + K + ' กำลังรอผู้เล่น</div><button class="btn gold" data-act="wwJoin2" data-c="' + K + '">เข้าร่วมเกม</button>' : '<div class="muted">' + (s ? 'เกมเริ่มไปแล้ว ดูได้อย่างเดียว' : 'ครูดูได้อย่างเดียว · ผู้ดำเนินเกมคือเครื่องที่เปิดห้อง') + '</div>') + '</section>';
      return { title: 'คืนปีศาจเสียงเพี้ยน', body: b + (ph === 'end' ? revealBox(r) : '') + logBox(p), back: '#/ww' }; }
    const lk = ph + '|' + (v.need || '') + '|' + (p.r || 0); if (LN[c] && LN[c] !== lk && v.need && v.need !== 'sus') { try { navigator.vibrate && navigator.vibrate(180); } catch (e) { /* ignore */ } } LN[c] = lk;
    if (ro) { const sh = SHOW[c], L = [];
      if (sh) { if (v.mates && v.mates.length) L.push((v.role === 'minion' ? 'ปีศาจคือ: ' : 'พวกปีศาจด้วยกัน: ') + v.mates.map(x => short(nm(r, x))).join(', '));
        if (v.love) L.push('🎎 คู่ขวัญของคุณ: ' + short(nm(r, v.love)));
        if (v.role === 'seer' && v.seen) L.push('ที่ฟังมาแล้ว: ' + Object.keys(v.seen).map(x => short(nm(r, x)) + (v.seen[x] ? ' 👹 ปีศาจ' : ' 🎵 ไม่ใช่')).join(' · '));
        if (v.role === 'witch' && v.pot) L.push('ยาชุบ ' + (v.pot.h ? '✓ เหลือ' : '✗ ใช้แล้ว') + ' · ยาพิษ ' + (v.pot.p ? '✓ เหลือ' : '✗ ใช้แล้ว')); }
      b += '<section class="card" data-act="wwShow" data-c="' + K + '" style="cursor:pointer;text-align:center;border:2px solid ' + (sh ? '#F3C95B' : 'var(--line)') + '">' + (sh ? '<div style="font-size:2.4rem">' + ro.i + '</div><b style="font-size:1.15rem">' + esc(ro.n) + '</b> <span class="muted">' + TEAM[ro.team] + '</span><div style="font-size:.88rem;margin-top:6px;text-align:left">' + esc(ro.d) + '</div>' + L.map(x => '<div style="margin-top:6px;font-weight:700;text-align:left">' + esc(x) + '</div>').join('') + '<div class="muted" style="font-size:.75rem;margin-top:6px">แตะเพื่อซ่อน</div>'
        : '<div style="font-size:1.8rem">🂠</div><b>แตะเพื่อดูบทบาทของคุณ</b><div class="muted" style="font-size:.8rem">ระวังคนข้าง ๆ เห็นจอ</div>') + '</section>'; }
    const others = alive(r).filter(x => x !== s), grid = (list, act, sel, st) => '<div class="ct-acts">' + list.map(t => '<button class="' + (sel === t ? 'p' : '') + '" data-act="' + act + '" data-c="' + K + '" data-t="' + esc(t) + '"' + (st ? ' data-s="' + st + '"' : '') + '>' + (sel === t ? '✓ ' : '') + esc(short(nm(r, t))) + '</button>').join('') + '</div>';
    const mk = st => c + ':' + p.r + ':' + st; let who = 'ผู้ดำเนินเกม', say = '', acts = '', note = '';
    if (ph === 'lobby') { say = 'รอผู้ดำเนินเกมแจกบทบาท · ผู้เล่นในห้อง ' + Object.keys(r.pl || {}).length + ' คน'; acts = '<div class="ct-acts"><button data-act="wwLeave" data-c="' + K + '">ออกจากห้อง</button></div>'; }
    else if (ph === 'role') say = 'จำบทบาทของตัวเองไว้ แล้วรอผู้ดำเนินเกมเริ่มคืนแรก';
    else if (ph === 'end') { say = WMSG[p.win] || ''; note = isWinner(p, s) ? '🏆 คุณอยู่ฝ่ายที่ชนะ!' : 'คราวหน้าเอาใหม่นะ'; }
    else if (!live && !(ph === 'hunt' && v.need === 'hunt')) { say = '👻 คุณตกรอบแล้ว ดูเกมต่อได้ แต่ห้ามบอกใบ้คนที่ยังอยู่'; }
    else if (ph === 'n1') { who = '🌙 คืนที่ ' + p.r; const n = v.need, sel = MY[mk('n1')];
      if (n === 'kill') { say = 'เลือกคนที่จะสาป'; acts = grid(others.filter(x => !(v.mates || []).includes(x)), 'wwAct', sel, 'n1'); const wp = v.wp || {}; note = Object.keys(wp).length ? 'ปีศาจเลือกแล้ว: ' + Object.keys(wp).map(x => short(nm(r, x)) + ' → ' + short(nm(r, wp[x]))).join(' · ') : 'เห็นตัวเลือกของพวกปีศาจด้วยกันที่นี่ · เสียงไม่ตรงกันระบบสุ่มจากที่ได้เสียงมากสุด'; }
      else if (n === 'see') { say = 'เลือกคนที่จะฟังเสียง'; acts = grid(others, 'wwAct', sel, 'n1'); if (sel && v.seen && v.seen[sel] !== undefined) note = short(nm(r, sel)) + (v.seen[sel] ? ' คือ 👹 ปีศาจ!' : ' ไม่ใช่ปีศาจ 🎵'); }
      else if (n === 'save') { say = 'เลือกคนที่จะคุ้มครอง'; acts = grid(alive(r).filter(x => x !== v.last), 'wwAct', sel, 'n1'); if (v.last) note = 'คืนนี้คุ้มครอง ' + short(nm(r, v.last)) + ' ซ้ำไม่ได้'; }
      else if (n === 'cupid') { const cs = CUP[c] || []; say = 'เลือก 2 คนเป็นคู่ขวัญ (' + cs.length + '/2)'; acts = '<div class="ct-acts">' + alive(r).map(t => '<button class="' + (cs.includes(t) ? 'p' : '') + '" data-act="wwCup" data-c="' + K + '" data-t="' + esc(t) + '">' + (cs.includes(t) ? '🎎 ' : '') + esc(short(nm(r, t))) + '</button>').join('') + (cs.length === 2 ? '<button class="g" data-act="wwCupGo" data-c="' + K + '">ผูกคู่ขวัญ</button>' : '') + '</div>'; if (sel) note = 'ผูกแล้ว'; }
      else { say = 'เลือกคนที่คุณสงสัย'; acts = grid(others, 'wwSus', MY[mk('sus')]); note = 'ทุกคนต้องแตะเลือกเหมือนกัน คนอื่นจะได้ดูไม่ออก'; } }
    else if (ph === 'n2') { who = '🌙 คืนที่ ' + p.r;
      if (v.need === 'witch') { const w = WIT[c] = WIT[c] || { h: 0, p: '' }, pot = v.pot || {}; say = v.victim ? 'คืนนี้ ' + short(nm(r, v.victim)) + ' ถูกสาป' : 'คืนนี้ไม่มีใครถูกสาป (หรือมีคนคุ้มครองไว้)';
        acts = '<div class="ct-acts">' + (pot.h && v.victim ? '<button class="' + (w.h ? 'g' : '') + '" data-act="wwWitH" data-c="' + K + '">' + (w.h ? '✓ ' : '') + '🌿 ใช้ยาชุบช่วย</button>' : '') + '</div>' + (pot.p ? '<div class="ct-note">ยาพิษ (แตะชื่อเพื่อเลือก แตะซ้ำเพื่อยกเลิก)</div><div class="ct-acts">' + others.map(t => '<button class="' + (w.p === t ? 'r' : '') + '" data-act="wwWitP" data-c="' + K + '" data-t="' + esc(t) + '">' + (w.p === t ? '☠️ ' : '') + esc(short(nm(r, t))) + '</button>').join('') + '</div>' : '') +
          '<div class="ct-acts" style="margin-top:8px"><button class="p" data-act="wwWitGo" data-c="' + K + '">' + (MY[mk('n2')] ? 'ส่งแล้ว · ส่งใหม่' : 'ยืนยัน') + '</button></div>'; }
      else { say = 'เลือกคนที่คุณสงสัย'; acts = grid(others, 'wwSus', MY[mk('sus')]); } }
    else if (ph === 'hunt') { if (v.need === 'hunt') { who = '🥁 พรานกลองหลวง'; say = 'คุณตกรอบแล้ว ตีกลองหลวงครั้งสุดท้าย เลือก 1 คนพาออกไปด้วย'; acts = grid(alive(r).filter(x => x !== s), 'wwAct', MY[mk('hunt')], 'hunt'); } else say = '🥁 พรานกลองหลวงกำลังเลือก…'; }
    else if (ph === 'day') say = 'ถกเถียงกับเพื่อนในห้อง ใครน่าจะเป็นปีศาจ? รอผู้ดำเนินเกมเปิดโหวต';
    else if (ph === 'vote') { const mv = ((r.vote || {})[s] || {}); const cur = mv.r === p.r ? (mv.t || '-') : ''; say = 'โหวตคนที่คิดว่าเป็นปีศาจ (เปลี่ยนได้จนปิดโหวต)';
      acts = grid(others, 'wwVote', cur).replace('</div>', '<button class="' + (cur === '-' ? 'p' : '') + '" data-act="wwVote" data-c="' + K + '" data-t="">' + (cur === '-' ? '✓ ' : '') + 'งดออกเสียง</button></div>'); }
    b += '<div class="ct-dlg"><span class="who">' + esc(who) + '</span><p>' + esc(say) + '</p>' + acts + (note ? '<div class="ct-note">' + esc(note) + '</div>' : '') + '</div>';
    if (ph === 'end') b += revealBox(r);
    return { title: 'คืนปีศาจเสียงเพี้ยน', body: b + logBox(p), back: '#/ww' };
  }

  /* ---------- ปุ่ม ---------- */
  const RQ = d => { const c = String(d.c || '').toUpperCase(); return [c, R[c]]; };
  async function join(c) { if (!/^[A-Z0-9]{4}$/.test(c)) return toast('ใส่รหัสห้อง 4 ตัว'); if (T() || !me()) { location.hash = '#/ww/' + c; return; }
    let m = null; try { m = await B.get(RP(c) + '/meta'); } catch (e) { return toast('เข้าห้องไม่ได้: ' + (A.errTH ? A.errTH(e) : e.message)); } if (!m) return toast('ไม่พบห้อง ' + c);
    if (m.st !== 'lobby') { toast('เกมเริ่มไปแล้ว เข้าดูได้อย่างเดียว'); location.hash = '#/ww/' + c; return; }
    try { await B.set(RP(c) + '/pl/' + me(), { n: A.myName(), px: (window.AVA && window.AVA.of(me())) || null, c: M.C.club.id, at: Date.now() }); } catch (e) { return toast('เข้าห้องไม่ได้: ' + (A.errTH ? A.errTH(e) : e.message)); }
    location.hash = '#/ww/' + c; }
  const host = (d, fn) => { const [c, r] = RQ(d); if (!r || !isHost(c)) return; run(c, fn); };
  Object.assign(A.ACT, {
    wwNew: async () => { const AL = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let c = ''; for (let k = 0; k < 6; k++) { c = Array.from({ length: 4 }, () => AL[Math.floor(Math.random() * AL.length)]).join(''); let ex = null; try { ex = await B.get(RP(c) + '/meta'); } catch (e) { ex = null; } if (!ex) break; }
      try { await B.set(RP(c) + '/meta', { h: myEmail(), by: A.myName(), st: 'lobby', at: Date.now(), cfg: { night: 60, witch: 40, disc: 180, vote: 60, reveal: true } }); } catch (e) { return toast('เปิดห้องไม่ได้: ' + (A.errTH ? A.errTH(e) : e.message)); }
      try { ac(); } catch (e) { /* ignore */ } location.hash = '#/ww/' + c; },
    wwJoin: () => join((($('#ww-code') || {}).value || '').trim().toUpperCase()),
    wwJoin2: d => join(String(d.c || '')),
    wwLeave: d => { const [c] = RQ(d); A.W(B.remove(RP(c) + '/pl/' + me())); location.hash = '#/ww'; },
    wwKick: d => { const [c, r] = RQ(d); if (r && isHost(c)) A.W(B.remove(RP(c) + '/pl/' + d.s)); },
    wwStart: d => host(d, startGame), wwNight: d => host(d, startNight),
    wwSkip: d => { const [c, r] = RQ(d); if (r && isHost(c)) { r.pub.t = Date.now() - 1; tick(c); } },
    wwMore: d => { const [c, r] = RQ(d); if (r && isHost(c)) W(c, { 'pub/t': Math.max(Date.now(), r.pub.t || 0) + 60000 }); },
    wwAgain: d => { const [c, r] = RQ(d); if (r && isHost(c)) { r._seen = {}; W(c, { pub: null, priv: null, act: null, vote: null, hs: null, 'meta/st': 'lobby' }); } },
    wwClose: async d => { const [c, r] = RQ(d); if (!r || !isHost(c)) return; if (!(await M.confirmBox('ปิดห้อง', 'ลบห้อง ' + esc(c) + ' และผลเกมทั้งหมด', 'ปิดห้อง', true))) return; location.hash = '#/ww'; A.W(B.remove(RP(c))); },
    wwSnd: () => { SND.on = !SND.on; try { localStorage.setItem('spw_ww_snd', SND.on ? '1' : '0'); } catch (e) { /* ignore */ } loopPh = '?'; if (SND.on) { ac(); sfx('ching'); } else loop(''); A.rerender(); },
    wwShow: d => { const [c] = RQ(d); SHOW[c] = !SHOW[c]; A.rerender(); },
    wwAct: d => { const [c, r] = RQ(d); if (!r) return; const st = d.s, p = r.pub; MY[c + ':' + p.r + ':' + st] = d.t; A.W(B.set(RP(c) + '/act/' + me(), { r: p.r, s: st, t: d.t })); try { navigator.vibrate && navigator.vibrate(40); } catch (e) { /* ignore */ } A.rerender(); },
    wwSus: d => { const [c, r] = RQ(d); if (!r) return; MY[c + ':' + r.pub.r + ':sus'] = d.t; try { navigator.vibrate && navigator.vibrate(40); } catch (e) { /* ignore */ } A.rerender(); },
    wwCup: d => { const [c] = RQ(d); const cs = CUP[c] = CUP[c] || []; const i = cs.indexOf(d.t); if (i >= 0) cs.splice(i, 1); else if (cs.length < 2) cs.push(d.t); A.rerender(); },
    wwCupGo: d => { const [c, r] = RQ(d); const cs = CUP[c] || []; if (!r || cs.length !== 2) return; MY[c + ':' + r.pub.r + ':n1'] = cs.join(); A.W(B.set(RP(c) + '/act/' + me(), { r: r.pub.r, s: 'n1', t: cs[0], t2: cs[1] })); toast('ผูกคู่ขวัญแล้ว'); A.rerender(); },
    wwWitH: d => { const [c] = RQ(d); const w = WIT[c] = WIT[c] || { h: 0, p: '' }; w.h = w.h ? 0 : 1; A.rerender(); },
    wwWitP: d => { const [c] = RQ(d); const w = WIT[c] = WIT[c] || { h: 0, p: '' }; w.p = w.p === d.t ? '' : d.t; A.rerender(); },
    wwWitGo: d => { const [c, r] = RQ(d); if (!r) return; const w = WIT[c] || { h: 0, p: '' }; MY[c + ':' + r.pub.r + ':n2'] = 1; A.W(B.set(RP(c) + '/act/' + me(), { r: r.pub.r, s: 'n2', h: !!w.h, p: w.p || '' })); toast('ส่งแล้ว'); WIT[c] = { h: 0, p: '' }; A.rerender(); },
    wwVote: d => { const [c, r] = RQ(d); if (!r) return; A.W(B.set(RP(c) + '/vote/' + me(), { r: r.pub.r, t: d.t || '' })); },
    wwCfg: d => { const [c, r] = RQ(d); if (!r || !isHost(c)) return; const cfg = r.meta.cfg || {}, n = Object.keys(r.pl || {}).length, cnt = cfg.roles || preset(Math.max(n, 5));
      const w = modal('<h3>⚙️ ตั้งค่าเกม</h3><form class="form"><label class="ck wide"><input type="checkbox" id="wc-auto"' + (cfg.roles ? '' : ' checked') + '> จัดบทบาทอัตโนมัติตามจำนวนผู้เล่น</label><div id="wc-r">' + ORDER.map(k => '<div class="row" style="gap:8px;padding:4px 0"><span class="grow">' + ROLES[k].i + ' ' + esc(ROLES[k].n) + '</span><input class="in" type="number" min="0" max="' + (k === 'wolf' ? 4 : 1) + '" data-k="' + k + '" value="' + (+cnt[k] || 0) + '" style="width:70px"></div>').join('') + '<div class="muted" style="font-size:.8rem">ที่เหลือเป็นนักดนตรีชาวบ้าน</div></div>' +
        '<div class="row" style="gap:8px">' + fld('กลางคืน (วินาที)', '<input class="in" type="number" id="wc-n" min="20" max="300" value="' + (cfg.night || 60) + '">') + fld('หมอยา (วินาที)', '<input class="in" type="number" id="wc-w" min="15" max="120" value="' + (cfg.witch || 40) + '">') + '</div><div class="row" style="gap:8px">' + fld('ถกเถียง (วินาที)', '<input class="in" type="number" id="wc-d" min="30" max="900" value="' + (cfg.disc || 180) + '">') + fld('โหวต (วินาที)', '<input class="in" type="number" id="wc-v" min="15" max="300" value="' + (cfg.vote || 60) + '">') + '</div>' +
        '<label class="ck wide"><input type="checkbox" id="wc-rv"' + (cfg.reveal === false ? '' : ' checked') + '> เปิดเผยบทบาทของคนที่ตกรอบ</label><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">บันทึก</button></div></form>', { center: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const ro = {}; w.querySelectorAll('[data-k]').forEach(i => { ro[i.dataset.k] = Math.max(0, Math.min(+i.max, +i.value || 0)); }); const num = (id, a, z) => Math.max(a, Math.min(z, +$(id, w).value || a));
        W(c, { 'meta/cfg': { roles: $('#wc-auto', w).checked ? null : ro, night: num('#wc-n', 20, 300), witch: num('#wc-w', 15, 120), disc: num('#wc-d', 30, 900), vote: num('#wc-v', 15, 300), reveal: $('#wc-rv', w).checked } }); w.remove(); toast('บันทึกแล้ว'); }); }
  });
  window.WW = { R, tick };
})();
