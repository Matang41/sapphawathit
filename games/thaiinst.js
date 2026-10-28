/* ============================================================
   thaiinst.js — ชั้นกลางของเสียงเครื่องดนตรีไทยและเพลงในสื่อของชมรม
   ใช้ร่วมกันโดย บันทึกโน้ต · แทร็กซ้อมวง · เครื่องดนตรีจำลอง · ฝึกหู
   ต้องโหลด thaisound.js, thaisound2.js และ natab.js ก่อน
     TI.init(audioContext, outputNode)
     TI.note(inst, i, t, v, dur, out)   i = ลูกฆ้อง 0–15 (ซฺ ลฺ ทฺ ด ร ม ฟ ซ ล ท ดํ รํ มํ ฟํ ซํ ลํ) ใช้ระดับเสียงเดียวกันทุกเครื่อง โน้ตเกินช่วงเสียงจริงทบช่วงให้
     TI.perc(kind, k, t, v, out)        kind: ching (k 1=ฉิ่ง 2=ฉับ) · chab · thon · drum
     TI.songs()                         เพลงจากสื่อของชมรม + ร่างในเครื่อง
     TI.timeline(packedSong)            ช่องโน้ตทั้งเพลง พร้อมฉิ่งและหน้าทับของแต่ละช่อง
   ============================================================ */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  /* ช่วงเสียงจริงของแต่ละเครื่อง (ลูกฆ้อง i: 0 = ซฺ · 3 = ด · 15 = ลํ) โน้ตที่เกินช่วงจะทบช่วงเสียงเข้ามาเหมือนนักดนตรีจริง
     ระนาดเอก 21 ลูก ซฺ…ฟํ · ระนาดทุ้ม 17 ลูก · ขลุ่ย ด…ซํ · ซอด้วง ซ…ลํ · ฆ้องวงใหญ่ 16 ลูก ซฺ…ลํ */
  const RANGE = { ranad: [-7, 13], thum: [-7, 9], khlui: [3, 14], sor: [7, 15], khong: [0, 15], khongS: [0, 15] };
  function fold(i, inst) { const r = RANGE[inst]; if (!r) return i; while (i < r[0]) i += 7; while (i > r[1]) i -= 7; return clamp(i, r[0], r[1]) }
  let AC = null, OUT = null;
  function init(ac, out) { AC = ac; OUT = out || ac.destination; TS.init(ac, OUT); if (window.TS2) TS2.init(ac, OUT); }
  const INST = {
    khong: { n: 'ฆ้องวงใหญ่', s: 'ฆ้อง', hold: false },
    khongS: { n: 'ฆ้องวงเล็ก', s: 'ฆ้องเล็ก', hold: false },
    ranad: { n: 'ระนาดเอก', s: 'ระนาด', hold: false },
    thum: { n: 'ระนาดทุ้ม', s: 'ทุ้ม', hold: false },
    khlui: { n: 'ขลุ่ย', s: 'ขลุ่ย', hold: true },
    sor: { n: 'ซอด้วง', s: 'ซอ', hold: true }
  };
  /* ฆ้องวงเล็ก: เสียงฆ้องแบบโมดัล สูงกว่าฆ้องวงใหญ่หนึ่งช่วงทบ */
  function gongF(f, t, v, out) {
    if (!AC) return; t = Math.max(t || 0, AC.currentTime); v = (v == null ? 1 : v) * .5; out = out || OUT;
    const md = (fr, a, tau, att) => { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = fr; att = att || .003;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a * v, t + att); g.gain.setTargetAtTime(0, t + att, tau); o.connect(g); g.connect(out); o.start(t); o.stop(t + tau * 7 + .05); };
    md(f, .55, .34); md(f * 1.004, .12, .3); md(f * 1.72, .14, .2); md(f * 5.2, .05, .06, .001);
  }
  function note(inst, i, t, v, dur, out) {
    i = Math.round(i); v = v == null ? 1 : v; out = out || OUT; const T2 = window.TS2;
    i = fold(i, inst);
    /* ลูกระนาด k = ลูกฆ้อง i + 7 (ลูกระนาดลูกที่ 0 = ซฺ ลูกทวน) */
    if (inst === 'ranad' && T2 && T2.ranadKey(i + 7, t, v * .85, out)) return;
    if (inst === 'thum' && T2 && T2.thum(i + 7, t, v * .9, out)) return;
    if (inst === 'khlui' && T2 && T2.khlui(freq(i), t, dur || .5, v * .9, out)) return;
    if (inst === 'sor' && T2 && T2.sor(freq(i), t, dur || .45, v * .85, out)) return;
    i = clamp(i, 0, 15);
    if (inst === 'khongS') { gongF(TS.KF[i] * 2, t, v, out); return; }
    TS.khong(i, t, v, out);
  }
  function perc(kind, k, t, v, out) {
    out = out || OUT; v = v == null ? 1 : v; const T2 = window.TS2;
    if (kind === 'ching') TS.ching(k === 1, t, v * .7, out);
    else if (kind === 'chab') { if (!(T2 && T2.chab(k, t, v * .6, out))) TS.ching(false, t, v * .4, out); }
    else if (kind === 'thon') { if (!(T2 && T2.thon(k, t, v, out))) TS.drum(k, t, v, out); }
    else if (kind === 'drum') TS.drum(k, t, v, out);
  }
  /* ---------- เพลงจากบันทึกโน้ตเพลงไทย ---------- */
  function readToks(str) { const out = []; let i = 0; while (i < str.length) { const c = str[i]; if (c === '-') { out.push([]); i++ } else if (c === '(') { const j = str.indexOf(')', i); out.push(str.slice(i + 1, j).split('').map(x => x.charCodeAt(0) - 97).filter(x => x >= 0 && x < 16)); i = j + 1 } else { const v = c.charCodeAt(0) - 97; out.push(v >= 0 && v < 16 ? [v] : []); i++ } } return out }
  function decBars(str) {
    return String(str || '').trim().split(/\s+/).filter(Boolean).map(b => { const out = []; let i = 0;
      while (i < b.length && out.length < 4) { const c = b[i];
        if (c === '~') { out.push(null); i++ }
        else if (c === '[') { const j = b.indexOf(']', i), body = b.slice(i + 1, j), k = body.indexOf(':'), hd = body.slice(0, k).split(','); out.push({ span: clamp(+hd[0] || 1, 1, 4), t: hd[1] === 'tri' ? 'tri' : 'kyi', g: readToks(body.slice(k + 1)) }); i = j + 1 }
        else { out.push(readToks(c === '(' ? b.slice(i, b.indexOf(')', i) + 1) : c)[0]); i = c === '(' ? b.indexOf(')', i) + 1 : i + 1 } }
      while (out.length < 4) out.push([]); return out });
  }
  function parentApp() { try { const P = window.parent; if (P && P !== window && P.APP) return P } catch (e) { } return null }
  function songs() {
    const out = [];
    const P = parentApp();
    try { const L = (P && P.APP.D && P.APP.D.library) || {}; Object.keys(L).forEach(k => { const x = L[k]; if (x && x.kind === 'song' && x.song) out.push({ key: 'c:' + k, src: 'สื่อชมรม', title: x.song.title || x.title || 'เพลง', by: (x.song.author && x.song.author.name) || '', song: x.song, at: x.at || 0 }) }) } catch (e) { }
    try { (JSON.parse(localStorage.getItem('sapphawathit_songs') || '[]') || []).forEach(x => out.push({ key: 'd:' + x.id, src: 'ร่างในเครื่อง', title: x.title || 'เพลง', song: x, at: x.at || 0 })) } catch (e) { }
    try { const c = JSON.parse(localStorage.getItem('sapphawathit_song_cur') || 'null'); if (c && c.lines && !out.some(o => o.song.id === c.id)) out.push({ key: 'cur', src: 'กำลังแก้ในบันทึกโน้ต', title: c.title || 'เพลง', song: c, at: c.at || 0 }) } catch (e) { }
    return out.sort((a, b) => (b.at || 0) - (a.at || 0));
  }
  function timeline(o) {
    const NT = window.NATAB, rate0 = +o.rate || 2;
    const lines = Array.isArray(o.lines) ? o.lines : Object.values(o.lines || {});
    const natabFor = r => { if (!o.natab) return null; if (r === rate0) return NT.get(o.natab); return NT.get(o.natab.replace(/[0-9T]$/, '') + r) };
    const lineNatab = (l, r) => { const v = l.natab; if (v === 'none') return null; if (v && NT.get(v)) return NT.get(v); return natabFor(r) };
    const slots = []; let k = 0, dk = 0, prev = null, pp = null;
    /* ท่อนที่ตั้ง rep: 2 เล่นวนสองเที่ยว */
    const seq = []; lines.forEach(l => { seq.push(l); if (+l.rep === 2) seq.push(Object.assign({}, l, { label: (l.label || '') + ' (เที่ยวกลับ)' })) });
    seq.forEach(l => {
      const R = decBars(l.bars), L = l.barsL != null ? decBars(l.barsL) : R.map(() => [[], [], [], []]);
      const r = +l.rate || rate0, p = lineNatab(l, r), pid = p ? p.id : '';
      if (r !== prev) { k = 0; prev = r } if (pid !== pp || k === 0) { dk = 0; pp = pid }
      R.forEach((bar, bi) => bar.forEach((e, si) => slots.push({ R: e, L: (L[bi] || [])[si] === undefined ? [] : L[bi][si], r, p: pid, k: k++, dk: dk++, line: l.label || '' })));
    });
    const DT = {}; slots.forEach(s => { if (s.p && !DT[s.p]) DT[s.p] = NT.timeline(NT.get(s.p), { rate: s.r, end: false }) });
    slots.forEach(s => { const ev = NT.RATE[s.r].ev; s.ch = (s.k % ev) === ev - 1 ? (Math.floor(s.k / ev) % 2 === 0 ? 1 : 2) : 0; const dt = s.p && DT[s.p]; s.dl = dt ? dt[s.dk % dt.length].l : [];
      const top = e => { if (!e) return null; if (Array.isArray(e)) return e.length ? Math.max(...e) : null; const f = e.g.find(x => x.length); return f ? Math.max(...f) : null };
      const a = top(s.R), b = top(s.L); s.mel = a != null ? a : b; });
    return { title: o.title || 'เพลง', bpm: +o.bpm || 120, rate: rate0, slots };
  }
  /* ชื่อโน้ตของลูกที่ i (ลูกฆ้อง 0 = ซฺ) ใช้ได้ทั้งต่ำกว่า 0 และสูงกว่า 15 */
  const NM = ['ด', 'ร', 'ม', 'ฟ', 'ซ', 'ล', 'ท'];
  /* ใช้จุดเดียวตามการเขียนโน้ตของชมรม (ระนาด: ซฺลฺทฺดฺรฺมฺฟฺซฺลฺทฺ ดรมฟซลท ดํรํมํฟํ) */
  function noteName(i) { const d = ((i + 4) % 7 + 7) % 7, o = Math.floor((i + 4) / 7); return NM[d] + (o <= 0 ? 'ฺ' : o >= 2 ? 'ํ' : '') }
  /* ความถี่ของลูกที่ i ตามเสียงวงของชมรม (ระนาดเอกที่อัดไว้ ลูก i+5) */
  function freq(i) { const F = window.TS2 && TS2.RANADF; let k = i + 7, r = 1; if (F) { while (k > 21) { k -= 7; r *= 2 } while (k < 0) { k += 7; r /= 2 } if (F[k]) return F[k] * r } return TS.KF[clamp(i, 0, 15)] }
  const THON = (window.TS2 && TS2.THON_NAMES) || ['ติง', 'จ๊ง', 'ทั่ม', 'จ๊ะ'];
  window.TI = { init, INST, RANGE, fold, THON, note, perc, songs, timeline, decBars, noteName, freq, KNOTE: () => TS.KNOTE };
})();
