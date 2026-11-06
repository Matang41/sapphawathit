/* ============================================================
   projects.js — โครงการเก็บเงิน/สั่งทำของ (เช่น เสื้อชมรม เข็มที่ระลึก) ใช้ซ้ำได้ทุกโครงการ
   หลัก: สมาชิกทุกคนอยู่ในรายชื่อโดยอัตโนมัติ · ครูยกเว้นได้พร้อมเหตุผล · นักเรียนยืนยันตัวเลือกได้ครั้งเดียว
        การรับเงินบันทึกพร้อมหลักฐาน แก้จำนวนไม่ได้ (ผิดให้ยกเลิกพร้อมเหตุผล) · ปิดโครงการ → ออกใบรับเงินรวม 1 ใบ
   ข้อมูล: proj/{pid} (ตั้งค่า) · projp/{pid}/{pk} (รายบุคคล) · projpay/{pid}/{pk}/{tid} (การรับเงิน) · projslip/{pid}/{pk}/{tid} (ภาพหลักฐาน)
           pk = เลขประจำตัวนักเรียน หรือ x… สำหรับบุคคลภายนอก
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP;
  const { $, esc, toast, modal, money } = M; const { ic, chip, fld, opt } = A;
  A.ICON.shirt = '<path d="M8 4L3 7l2 4 3-1v10h8V10l3 1 2-4-5-3c-.6 1.5-2.2 2.5-4 2.5S8.6 5.5 8 4z"/>';
  const st = document.createElement('style');
  st.textContent = '.pj-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:12px}.pj-k>div{background:#fff;border:1px solid var(--line);border-radius:12px;padding:10px 12px}.pj-k b{display:block;font-family:var(--head);font-size:1.3rem;color:var(--plum)}.pj-k span{font-size:.8rem;color:var(--mut)}' +
    '.pj-ed{display:grid;gap:6px;margin-bottom:8px}.pj-ed .r{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.pj-ed .r .in{min-width:0;flex:1 1 80px}.pj-ed .r .w2{flex:2 1 140px}.pj-ed label.ck{display:flex;gap:4px;align-items:center;font-size:.85rem;white-space:nowrap}' +
    '.pj-slip{max-width:100%;border-radius:10px;border:1px solid var(--line);margin-top:8px}.pj-pay{display:flex;gap:10px;align-items:flex-start;border-top:1px solid var(--line);padding:10px 0}.pj-pay:first-child{border-top:0}';
  document.head.appendChild(st);

  const P = { tab: 'sum', q: '', f: 'all' };
  const EX = { help: 'ครูช่วยออกค่าใช้จ่าย', have: 'มีของแล้ว', out: 'ไม่ร่วมโครงการ' };
  const PLAN = { inst: 'ผ่อนชำระ', later: 'จ่ายภายหลัง', help: 'ครูช่วยบางส่วน' };
  const KIND = { teacher: 'ครู / บุคลากร', alumni: 'ศิษย์เก่า', guest: 'บุคคลทั่วไป' };
  const T = () => A.teacher(), me = () => A.sid();
  const cid = () => M.C.club.id;

  A.SUBS.push({ key: 'proj', path: () => 'proj' });
  const projs = () => Object.keys(A.D.proj || {}).map(id => Object.assign({ id }, A.D.proj[id])).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const pj = id => { const p = (A.D.proj || {})[id]; return p ? Object.assign({ id }, p) : null; };
  const arr = v => Array.isArray(v) ? v.filter(Boolean) : Object.keys(v || {}).map(k => v[k]).filter(Boolean);
  const items = p => Object.keys(p.items || {}).map(id => Object.assign({ id }, p.items[id])).sort((a, b) => (a.o || 0) - (b.o || 0));
  const can = (p, k) => T() || (!!me() && !!((p.staff || {})[me()] || {})[k]) || (k === 'pay' && A.is('treasurer'));
  const staff = p => can(p, 'pay') || can(p, 'form');

  /* ---------- สมัครรับข้อมูลรายโครงการ (ทีมงานเห็นทุกคน · นักเรียนเห็นของตัวเอง) ---------- */
  const S = {};
  function data(p) {
    const full = staff(p), key = cid() + '|' + (full ? '*' : me());
    let s = S[p.id];
    if (s && s.key !== key) { s.offs.forEach(f => f()); s = null; }
    if (!s) {
      s = S[p.id] = { key, pp: {}, pay: {}, ok: { pp: 0, pay: 0 }, offs: [] };
      const sub = (k, path) => s.offs.push(B.on(path, v => { s[k] = full ? (v || {}) : (v ? { [me()]: v } : {}); s.ok[k] = 1; A.rerender(); }, e => { s.ok[k] = 1; console.warn('read ' + path, e && e.code); }));
      const tail = full ? '' : '/' + me();
      if (full || me()) { sub('pp', 'projp/' + p.id + tail); sub('pay', 'projpay/' + p.id + tail); }
    }
    return s;
  }

  /* ---------- คำนวณ ---------- */
  const sizes = p => arr(p.sizes);
  const fields = p => arr(p.fields);
  const sizeAdd = (p, s) => +((sizes(p).find(x => x.s === s) || {}).add) || 0;
  const pays = (s, pk) => Object.keys((s.pay || {})[pk] || {}).map(id => Object.assign({ id }, s.pay[pk][id])).sort((a, b) => (a.at || 0) - (b.at || 0));
  function qtyOf(it, r) { const o = ((r.self || {}).ord || {})[it.id]; if (it.req) return Math.max(1, +o || 1); return +o || 0; }
  function lines(p, r) {
    if (r.ex && r.ex.why !== 'help') return [];
    return items(p).map(it => { const q = qtyOf(it, r), unit = (+it.price || 0) + (it.sized ? sizeAdd(p, r.size) : 0); return { it, q, unit, sum: q * unit }; }).filter(l => l.q > 0);
  }
  function calc(p, s, pk) {
    const r = (s.pp || {})[pk] || {}, ls = lines(p, r), gross = ls.reduce((a, l) => a + l.sum, 0), due = r.ex ? 0 : gross;
    const ps = pays(s, pk), paid = ps.filter(x => x.st === 'ok').reduce((a, x) => a + (+x.amt || 0), 0), pend = ps.filter(x => x.st === 'pending').reduce((a, x) => a + (+x.amt || 0), 0);
    const left = Math.max(0, Math.round((due - paid) * 100) / 100), conf = !!r.self, out = !!(r.ex && r.ex.why !== 'help');
    const stt = out ? ['ยกเว้น · ' + EX[r.ex.why], 'line'] : r.ex ? ['ครูช่วยออก', 'blue'] : due > 0 && paid >= due ? ['จ่ายครบ', 'ok'] : pend > 0 ? ['รอตรวจสลิป', 'gold'] : paid > 0 ? ['ค้าง ' + money(left), 'gold'] : ['ยังไม่จ่าย', 'bad'];
    return { r, ls, gross, due, paid, pend, left, conf, out, stt, ps };
  }
  /* รายชื่อ: สมาชิกปัจจุบันทุกคน + คนนอกที่เพิ่มไว้ */
  function people(p, s) {
    const mem = A.activeSids().sort(A.byClass).map(pk => ({ pk, name: A.fullName(A.members()[pk]), sub: A.cls(A.members()[pk]), mem: 1 }));
    const ext = Object.keys(s.pp || {}).filter(k => k[0] === 'x' && s.pp[k].info).map(pk => ({ pk, name: s.pp[pk].info.name, sub: KIND[s.pp[pk].info.kind] || 'บุคคลภายนอก' }));
    return mem.concat(ext.sort((a, b) => a.name.localeCompare(b.name, 'th')));
  }
  function suggest(p, m) {
    const ch = +((m || {}).chest) || 0; if (!ch) return null;
    const need = ch + (p.ease === undefined ? 2 : +p.ease || 0), list = sizes(p).filter(x => +x.chest > 0).sort((a, b) => a.chest - b.chest);
    let z = list.find(x => +x.chest >= need) || list[list.length - 1]; if (!z) return null;
    const ln = +((m || {}).len) || 0; if (ln && +z.len && +z.len < ln) { const y = list.find(x => +x.chest >= +z.chest && +x.len >= ln); if (y) z = y; }
    return z.s;
  }

  /* ---------- เมนู ---------- */
  const pendAll = () => projs().filter(p => p.status === 'open' && can(p, 'pay')).reduce((n, p) => { const s = data(p); return n + Object.keys(s.pay || {}).reduce((a, pk) => a + pays(s, pk).filter(x => x.st === 'pending').length, 0); }, 0);
  A.NAVS.push({ id: 'proj', label: 'โครงการ / เสื้อ', icon: 'shirt', order: 62, match: ['pj'], show: () => T() || projs().some(p => p.status === 'open' || staff(p)), badge: () => pendAll() });
  A.TODO.push(() => { const n = pendAll(); return n ? { n, label: 'สลิปรอตรวจในโครงการ', href: '#/proj' } : null; });
  A.HOME.push({ order: 58, html: () => {
    if (T() || !me()) return '';
    return projs().filter(p => p.status === 'open').map(p => {
      const s = data(p); if (!s.ok.pp) return ''; const c = calc(p, s, me()); if (c.out) return '';
      return '<a class="card rowcard" href="#/pj/' + esc(p.id) + '"><div class="grow"><div class="lb" style="margin:0">' + ic('shirt', 18) + ' ' + esc(p.name) + '</div>' +
        (c.r.ex ? '<div class="muted">ครูช่วยออกค่าใช้จ่ายให้แล้ว</div>' : '<div class="num">' + (c.left > 0 ? 'ค้าง ' + money(c.left) + ' บาท' : 'จ่ายครบแล้ว') + '</div>') +
        '</div>' + (!c.conf && fields(p).some(f => f.who === 'student') || (!c.conf && items(p).some(i => i.extra || !i.req)) ? chip('ยังไม่ยืนยันตัวเลือก', 'bad') : chip(c.stt[0], c.stt[1])) + '</a>';
    }).join('');
  } });

  /* ---------- หน้า: รายการโครงการ ---------- */
  A.V.proj = function () {
    const l = projs().filter(p => T() || p.status === 'open' || staff(p));
    let b = T() ? '<div class="row wrap" style="margin-bottom:14px"><button class="btn gold" data-act="pjNew">' + ic('plus', 18) + 'สร้างโครงการ</button></div>' : '';
    b += l.map(p => {
      const s = data(p); let sub = '';
      if (staff(p) && s.ok.pp) { const ps = people(p, s).map(x => calc(p, s, x.pk)).filter(c => !c.out); sub = 'เก็บแล้ว ' + money(ps.reduce((a, c) => a + c.paid, 0)) + ' บาท · ครบ ' + ps.filter(c => c.due > 0 && c.left <= 0).length + '/' + ps.length + ' คน'; }
      else if (s.ok.pp && me()) { const c = calc(p, s, me()); sub = c.out ? 'ยกเว้น' : c.left > 0 ? 'ค้าง ' + money(c.left) + ' บาท' : 'จ่ายครบแล้ว'; }
      return '<a class="card rowcard" href="#/pj/' + esc(p.id) + '"><div class="grow"><b>' + esc(p.name) + '</b><div class="muted">' + esc(sub || (p.desc || '')) + (p.deadline ? ' · ปิดรับ ' + esc(A.dTH(p.deadline, 'short')) : '') + '</div></div>' + (p.status === 'open' ? chip('เปิดอยู่', 'ok') : chip('ปิดแล้ว', 'line')) + '</a>';
    }).join('') || '<div class="empty">ยังไม่มีโครงการ</div>';
    return { title: 'โครงการ / เสื้อชมรม', body: b };
  };

  /* ---------- หน้า: โครงการเดียว ---------- */
  A.V.pj = function (pid) {
    const p = pj(pid); if (!p) return { title: 'ไม่พบโครงการ', body: '<div class="empty">ไม่พบโครงการนี้</div>', back: '#/proj' };
    const s = data(p);
    if (!s.ok.pp || !s.ok.pay) return { title: p.name, body: '<div class="empty">กำลังโหลด…</div>', back: '#/proj' };
    return { title: p.name, body: staff(p) ? staffView(p, s) : studentView(p, s), back: '#/proj' };
  };

  function studentView(p, s) {
    const c = calc(p, s, me()), open = p.status === 'open';
    let b = '<section class="card hero"><div class="hero-sub">' + esc(p.name) + (p.deadline ? ' · ปิดรับ ' + esc(A.dTH(p.deadline, 'short')) : '') + '</div>';
    if (c.out) return b + '<div class="bal" style="font-size:1.4rem">' + esc(EX[c.r.ex.why]) + '</div><div class="hero-sub">' + esc(c.r.ex.note || 'ครูบันทึกไว้แล้ว') + '</div></section>';
    b += '<div class="bal">' + money(c.left) + '</div><div class="hero-sub">บาท ที่ต้องชำระเพิ่ม · ยอดทั้งหมด ' + money(c.due) + ' · จ่ายแล้ว ' + money(c.paid) + (c.pend ? ' · รอตรวจ ' + money(c.pend) : '') + '</div></section>';
    if (p.desc) b += '<div class="note">' + esc(p.desc) + '</div>';
    b += '<section class="card"><div class="lb">รายการของฉัน</div>' + (c.ls.map(l => '<div class="row"><span class="grow">' + esc(l.it.name) + (l.it.sized ? ' · ไซซ์ ' + esc(c.r.size || 'รอวัดตัว') : '') + ' × ' + l.q + '</span><b>' + money(l.sum) + '</b></div>').join('') || '<div class="muted">ไม่มีรายการ</div>') +
      (items(p).some(i => i.sized) && !c.r.size ? '<div class="muted" style="margin-top:6px">ราคาอาจเพิ่มตามไซซ์ หลังทีมงานวัดตัวแล้ว</div>' : '') + (c.r.ex ? '<div class="note">ครูช่วยออกค่าใช้จ่ายให้ ไม่ต้องจ่าย</div>' : '') + '</section>';
    const sf = fields(p).filter(f => f.who === 'student'), opts = items(p).filter(i => i.extra || !i.req);
    if (sf.length || opts.length) {
      b += '<section class="card"><div class="lb">ตัวเลือกของฉัน</div>';
      if (c.conf) b += sf.map(f => '<div class="row"><span class="grow muted">' + esc(f.label) + '</span><b>' + esc((c.r.self.opt || {})[f.id] || '-') + '</b></div>').join('') + '<div class="muted" style="margin-top:6px">ยืนยันแล้วเมื่อ ' + esc(M.thDate(c.r.self.at)) + ' · ต้องการเปลี่ยนให้แจ้งครู</div>';
      else b += open ? '<div class="note warn">ยังไม่ได้ยืนยันตัวเลือก — ยืนยันได้ครั้งเดียว ตรวจให้ดีก่อนกด</div><button class="btn gold block" data-act="pjSelf" data-p="' + esc(p.id) + '" data-k="' + esc(me()) + '">เลือกและยืนยัน</button>' : '<div class="muted">โครงการปิดรับแล้ว</div>';
      b += '</section>';
    }
    const mf = fields(p).filter(f => f.who !== 'student');
    if (mf.length || items(p).some(i => i.sized)) b += '<section class="card"><div class="lb">ขนาดตัว (' + esc(p.unit || 'นิ้ว') + ')</div>' + mf.map(f => '<div class="row"><span class="grow muted">' + esc(f.label) + '</span><b>' + esc(((c.r.m || {})[f.id]) || '-') + '</b></div>').join('') +
      '<div class="row"><span class="grow muted">ไซซ์</span><b>' + esc(c.r.size || 'ยังไม่กำหนด') + '</b></div>' + (p.selfMeasure && open ? '<button class="btn ghost block" style="margin-top:8px" data-act="pjForm" data-p="' + esc(p.id) + '" data-k="' + esc(me()) + '">กรอกขนาดตัวเอง</button>' : '') + '</section>';
    b += '<section class="card"><div class="lb">การชำระเงิน</div>' + (c.ps.map(payRow).join('') || '<div class="muted">ยังไม่มีรายการ</div>') +
      (open && c.left > 0 && !c.r.ex ? '<button class="btn gold block" style="margin-top:10px" data-act="pjPay" data-p="' + esc(p.id) + '" data-k="' + esc(me()) + '">แนบสลิปโอนเงิน</button>' : '') + '</section>';
    if (!c.r.ex && c.left > 0) b += '<div class="note">' + (c.r.plan ? 'แผนการชำระ: <b>' + esc(PLAN[c.r.plan.kind] || '') + '</b> ' + esc(c.r.plan.note || '') + '<br>' : '') + 'มีปัญหาเรื่องค่าใช้จ่าย แจ้งครูเป็นการส่วนตัวได้ที่ <a href="#/griev">ร้องทุกข์ (ครูเห็นคนเดียว)</a> ผ่อนชำระหรือขอความช่วยเหลือได้</div>';
    return b;
  }
  function payRow(x) {
    const S2 = { ok: ['รับเงินแล้ว', 'ok'], pending: ['รอตรวจ', 'gold'], void: ['ยกเลิก', 'line'] }[x.st] || ['-', ''];
    return '<div class="pj-pay"><div class="grow"><b>' + money(x.amt) + ' บาท</b> ' + chip(S2[0], S2[1]) + '<div class="muted">' + esc(M.thDate(x.at)) + ' · ' + esc(x.method || '') + ' · บันทึกโดย ' + esc((x.by || {}).name || '') + (x.vby ? ' · ตรวจโดย ' + esc(x.vby) : '') + (x.note ? ' · ' + esc(x.note) : '') + (x.st === 'void' ? ' · เหตุผล: ' + esc(x.voidWhy || '') : '') + '</div></div>' +
      (x.slip ? '<button class="btn ghost sm" data-act="pjSlip" data-t="' + esc(x.id) + '">หลักฐาน</button>' : '') + '</div>';
  }

  function staffView(p, s) {
    const ppl = people(p, s), cs = {}; ppl.forEach(x => cs[x.pk] = calc(p, s, x.pk));
    const inn = ppl.filter(x => !cs[x.pk].out), open = p.status === 'open';
    const tabs = [['sum', 'ภาพรวม'], ['ppl', 'รายชื่อ'], ['ord', 'สรุปสั่งร้าน']].concat(T() ? [['set', 'ตั้งค่า']] : [['me', 'ของฉัน']]);
    if (!tabs.some(t => t[0] === P.tab)) P.tab = 'sum';
    let b = '<div class="tabs" role="tablist">' + tabs.map(t => '<button role="tab" aria-selected="' + (P.tab === t[0]) + '" class="' + (P.tab === t[0] ? 'on' : '') + '" data-act="pjTab" data-t="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>';
    if (!open) b += '<div class="note">โครงการปิดแล้ว' + (p.ledgerNo ? ' · ออกใบรับเงินรวมเลขที่ ' + esc(p.ledgerNo) + ' ในบัญชีชมรมแล้ว' : '') + '</div>';
    if (P.tab === 'sum') {
      const sm = k => inn.reduce((a, x) => a + cs[x.pk][k], 0), full = inn.filter(x => cs[x.pk].due > 0 && cs[x.pk].left <= 0).length;
      const pendN = inn.reduce((a, x) => a + cs[x.pk].ps.filter(y => y.st === 'pending').length, 0), noConf = inn.filter(x => x.mem && !cs[x.pk].conf).length, noSize = items(p).some(i => i.sized) ? inn.filter(x => !cs[x.pk].r.size).length : 0;
      b += '<div class="pj-k"><div><b>' + inn.length + '</b><span>คนในโครงการ</span></div><div><b>' + full + '</b><span>จ่ายครบ</span></div><div><b>' + money(sm('paid')) + '</b><span>เก็บแล้ว (บาท)</span></div><div><b>' + money(sm('left')) + '</b><span>ค้างรวม (บาท)</span></div>' +
        '<div><b>' + pendN + '</b><span>สลิปรอตรวจ</span></div><div><b>' + noConf + '</b><span>ยังไม่ยืนยันตัวเลือก</span></div>' + (items(p).some(i => i.sized) ? '<div><b>' + noSize + '</b><span>ยังไม่มีไซซ์</span></div>' : '') + '</div>';
      b += '<section class="card"><div class="lb">ราคา</div>' + items(p).map(i => '<div class="row"><span class="grow">' + esc(i.name) + (i.req ? '' : ' (ไม่บังคับ)') + '</span><b>' + money(i.price) + ' บาท</b></div>').join('') +
        (sizes(p).some(z => +z.add) ? '<div class="muted">บวกเพิ่มตามไซซ์: ' + esc(sizes(p).filter(z => +z.add).map(z => z.s + ' +' + z.add).join(' · ')) + '</div>' : '') + (p.desc ? '<div class="muted" style="margin-top:6px">' + esc(p.desc) + '</div>' : '') + '</section>';
      b += '<div class="row wrap" style="margin-bottom:14px">' + (T() && open ? '<button class="btn" data-act="pjRemind" data-p="' + esc(p.id) + '" data-w="conf">' + ic('bell', 18) + 'เตือนคนยังไม่ยืนยัน</button><button class="btn" data-act="pjRemind" data-p="' + esc(p.id) + '" data-w="pay">' + ic('bell', 18) + 'เตือนคนค้างจ่าย</button>' : '') +
        '<button class="btn ghost" data-act="pjExport" data-p="' + esc(p.id) + '" data-w="status">' + ic('down', 18) + 'ส่งออกสถานะการจ่าย</button>' + (T() && open ? '<button class="btn danger" data-act="pjClose" data-p="' + esc(p.id) + '">ปิดโครงการ</button>' : '') + '</div>';
    } else if (P.tab === 'ppl') {
      const F = [['all', 'ทั้งหมด'], ['unpaid', 'ค้างจ่าย'], ['pend', 'รอตรวจ'], ['conf', 'ยังไม่ยืนยัน'], ['nosize', 'ไม่มีไซซ์'], ['ex', 'ยกเว้น']];
      const ok = x => { const c = cs[x.pk]; switch (P.f) { case 'unpaid': return !c.r.ex && c.left > 0; case 'pend': return c.pend > 0; case 'conf': return x.mem && !c.out && !c.conf; case 'nosize': return !c.out && !c.r.size; case 'ex': return !!c.r.ex; default: return true; } };
      const q = P.q.trim(), l = ppl.filter(ok).filter(x => !q || (x.name + ' ' + x.pk + ' ' + x.sub).includes(q));
      b += '<div class="row wrap" style="margin-bottom:10px"><input class="in" style="flex:1 1 100%" id="pjq" placeholder="ค้นหาชื่อ / เลขประจำตัว" value="' + esc(P.q) + '"><select class="in" data-pjf style="max-width:180px">' + opt(F, P.f) + '</select>' + (open && staff(p) ? '<button class="btn" data-act="pjAddX" data-p="' + esc(p.id) + '">' + ic('plus', 18) + 'เพิ่มคนนอก</button>' : '') + '</div>';
      b += '<section class="card" id="pjlist">' + (l.map(x => { const c = cs[x.pk]; return '<button class="txr" data-act="pjPerson" data-p="' + esc(p.id) + '" data-k="' + esc(x.pk) + '"><span class="grow"><b>' + esc(x.name) + '</b><span class="muted">' + esc(x.sub) + (c.r.size ? ' · ไซซ์ ' + c.r.size : '') + (x.mem && !c.out ? (c.conf ? ' · ยืนยันแล้ว' : ' · ยังไม่ยืนยัน') : '') + '</span><span>' + chip(c.stt[0], c.stt[1]) + (c.r.plan ? ' ' + chip(PLAN[c.r.plan.kind], 'plum') : '') + '</span></span><span style="white-space:nowrap;font-weight:600;font-size:.9rem;color:var(--plum)">' + money(c.paid) + '<br><span class="muted" style="font-weight:400">จาก ' + money(c.due) + '</span></span></button>'; }).join('') || '<div class="empty">ไม่พบรายชื่อ</div>') + '</section>';
    } else if (P.tab === 'ord') {
      const o = order(p, s, inn);
      b += '<section class="card"><div class="lb">จำนวนที่ต้องสั่ง</div><div class="tw"><table class="tb"><thead><tr><th>รายการ</th><th>แยกตาม</th><th>จำนวน</th></tr></thead><tbody>' + o.rows.map(r => '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td><b>' + r[2] + '</b></td></tr>').join('') + '</tbody></table></div>' +
        (o.miss ? '<div class="note warn">ยังไม่มีไซซ์ ' + o.miss + ' คน (นับเป็น “ไม่ระบุ”)</div>' : '') + '</section>';
      if (o.names.length) b += '<section class="card"><div class="lb">ข้อความที่ต้องปัก/สกรีน (' + o.names.length + ')</div><div class="muted">' + o.names.map(n => esc(n[1]) + ' — ' + esc(n[2])).join('<br>') + '</div></section>';
      b += '<button class="btn ghost" data-act="pjExport" data-p="' + esc(p.id) + '" data-w="order">' + ic('down', 18) + 'ส่งออกใบสั่งร้าน</button>';
    } else if (P.tab === 'me') b += studentView(p, s);
    else b += settingsHTML(p);
    return b;
  }
  function order(p, s, inn) {
    const ch = fields(p).filter(f => f.type === 'choice'), tx = fields(p).filter(f => f.type === 'text' && f.who === 'student'), cnt = {}, names = []; let miss = 0;
    inn.forEach(x => {
      const c = calc(p, s, x.pk), op = (c.r.self || {}).opt || {};
      if (c.ls.some(l => l.it.sized) && !c.r.size) miss++;
      c.ls.forEach(l => { const key = l.it.name + '|' + (l.it.sized ? 'ไซซ์ ' + (c.r.size || 'ไม่ระบุ') + ch.map(f => ' · ' + (op[f.id] || '-')).join('') : '-'); cnt[key] = (cnt[key] || 0) + l.q; });
      tx.forEach(f => { if (op[f.id]) names.push([x.pk, x.name, op[f.id]]); });
    });
    const ord = sizes(p).map(z => z.s), rk = k => { const m = /ไซซ์ (\S+)/.exec(k); const i = m ? ord.indexOf(m[1]) : -1; return i < 0 ? 99 : i; };
    const rows = Object.keys(cnt).sort((a, b) => a.split('|')[0].localeCompare(b.split('|')[0], 'th') || rk(a) - rk(b) || a.localeCompare(b, 'th')).map(k => [k.split('|')[0], k.split('|')[1], cnt[k]]);
    return { rows, names, miss };
  }

  /* ---------- ตั้งค่า (ครู) ---------- */
  const rowItem = (i = {}) => '<div class="r" data-row="it"><input class="in w2" data-f="name" placeholder="ชื่อรายการ" value="' + esc(i.name || '') + '"><input class="in" data-f="price" inputmode="decimal" placeholder="ราคา" value="' + esc(i.price === undefined ? '' : i.price) + '">' +
    '<label class="ck"><input type="checkbox" data-f="sized"' + (i.sized ? ' checked' : '') + '>มีไซซ์</label><label class="ck"><input type="checkbox" data-f="req"' + (i.req ? ' checked' : '') + '>ทุกคนได้</label><label class="ck"><input type="checkbox" data-f="extra"' + (i.extra ? ' checked' : '') + '>สั่งเพิ่มได้</label><input type="hidden" data-f="id" value="' + esc(i.id || '') + '"><button type="button" class="btn ghost sm" data-del>✕</button></div>';
  const rowSize = (z = {}) => '<div class="r" data-row="sz"><input class="in" data-f="s" placeholder="ไซซ์" value="' + esc(z.s || '') + '"><input class="in" data-f="chest" inputmode="decimal" placeholder="รอบอกเสื้อ" value="' + esc(z.chest || '') + '"><input class="in" data-f="len" inputmode="decimal" placeholder="ยาว" value="' + esc(z.len || '') + '"><input class="in" data-f="add" inputmode="decimal" placeholder="+บาท" value="' + esc(z.add || '') + '"><button type="button" class="btn ghost sm" data-del>✕</button></div>';
  const rowField = (f = {}) => '<div class="r" data-row="fd"><input class="in w2" data-f="label" placeholder="ชื่อช่อง เช่น รอบอก" value="' + esc(f.label || '') + '"><select class="in" data-f="type">' + opt([['num', 'ตัวเลข'], ['choice', 'ตัวเลือก'], ['text', 'ข้อความ']], f.type || 'num') + '</select><input class="in w2" data-f="opts" placeholder="ตัวเลือก คั่นด้วย ," value="' + esc((f.opts || []).join(',')) + '">' +
    '<select class="in" data-f="who">' + opt([['staff', 'ทีมงานกรอก'], ['student', 'นักเรียนเลือกเอง']], f.who || 'staff') + '</select><input type="hidden" data-f="id" value="' + esc(f.id || '') + '"><button type="button" class="btn ghost sm" data-del>✕</button></div>';
  function settingsHTML(p) {
    const st = p.staff || {}, sids = A.activeSids().sort(A.byClass);
    return '<form class="form card" id="pjset" data-p="' + esc(p.id) + '">' + fld('ชื่อโครงการ', '<input class="in" name="name" required value="' + esc(p.name || '') + '">') + fld('รายละเอียด / วิธีโอนเงิน', '<textarea class="in" name="desc" rows="3">' + esc(p.desc || '') + '</textarea>') +
      '<div class="g3">' + fld('ปิดรับวันที่', '<input class="in" type="date" name="deadline" value="' + esc(p.deadline || '') + '">') + fld('หน่วยวัด', '<select class="in" name="unit">' + opt([['นิ้ว', 'นิ้ว'], ['ซม.', 'ซม.']], p.unit || 'นิ้ว') + '</select>') + fld('เผื่อรอบอก', '<input class="in" name="ease" inputmode="decimal" value="' + esc(p.ease === undefined ? 2 : p.ease) + '">', 'ไซซ์ที่แนะนำ = รอบอกตัว + ค่านี้') + '</div>' +
      '<label class="ck" style="display:flex;gap:8px;margin:6px 0 12px"><input type="checkbox" name="selfMeasure"' + (p.selfMeasure ? ' checked' : '') + '>ให้นักเรียนกรอกขนาดตัวเองได้</label>' +
      '<div class="lb">รายการและราคา</div><div class="pj-ed" data-list="it">' + items(p).map(rowItem).join('') + '</div><button type="button" class="btn ghost sm" data-add="it">+ เพิ่มรายการ</button>' +
      '<div class="lb" style="margin-top:14px">ตารางไซซ์ (' + esc(p.unit || 'นิ้ว') + ')</div><div class="muted">ใส่ตามตารางของร้าน · “+บาท” = ราคาเพิ่มของไซซ์นั้น</div><div class="pj-ed" data-list="sz">' + sizes(p).map(rowSize).join('') + '</div><button type="button" class="btn ghost sm" data-add="sz">+ เพิ่มไซซ์</button>' +
      '<div class="lb" style="margin-top:14px">ช่องข้อมูลรายคน</div><div class="muted">ช่องชื่อ “รอบอก” และ “ความยาวเสื้อ” ใช้คำนวณไซซ์แนะนำ</div><div class="pj-ed" data-list="fd">' + fields(p).map(rowField).join('') + '</div><button type="button" class="btn ghost sm" data-add="fd">+ เพิ่มช่อง</button>' +
      '<div class="lb" style="margin-top:14px">ผู้ช่วยที่ครูมอบหมาย</div><div class="muted">เหรัญญิกรับเงินได้อยู่แล้ว · “รับเงิน” = บันทึก/ตรวจสลิป · “วัดตัว” = กรอกขนาดและไซซ์</div><div class="tw" style="max-height:320px;overflow:auto"><table class="tb"><thead><tr><th>ชื่อ</th><th>รับเงิน</th><th>วัดตัว</th></tr></thead><tbody>' +
      sids.map(k => '<tr><td>' + esc(A.fullName(A.members()[k])) + ' <span class="muted">' + esc(A.cls(A.members()[k])) + '</span></td><td><input type="checkbox" data-st="pay" data-s="' + esc(k) + '"' + ((st[k] || {}).pay ? ' checked' : '') + '></td><td><input type="checkbox" data-st="form" data-s="' + esc(k) + '"' + ((st[k] || {}).form ? ' checked' : '') + '></td></tr>').join('') + '</tbody></table></div>' +
      fld('สถานะ', '<select class="in" name="status">' + opt([['open', 'เปิดรับ'], ['closed', 'ปิดแล้ว']], p.status || 'open') + '</select>') +
      '<div class="note bad" id="pj-err" hidden></div><div class="row" style="margin-top:12px"><button class="btn gold grow">บันทึกการตั้งค่า</button></div><div class="row" style="margin-top:8px"><button type="button" class="btn ghost danger" data-act="pjDel" data-p="' + esc(p.id) + '">ลบโครงการ</button></div></form>';
  }
  document.addEventListener('click', e => {
    const f = e.target.closest('#pjset'); if (!f) return;
    const a = e.target.closest('[data-add]'); if (a) { e.preventDefault(); f.querySelector('[data-list="' + a.dataset.add + '"]').insertAdjacentHTML('beforeend', { it: rowItem, sz: rowSize, fd: rowField }[a.dataset.add]()); return; }
    const d = e.target.closest('[data-del]'); if (d) { e.preventDefault(); d.closest('.r').remove(); }
  });
  document.addEventListener('submit', e => {
    const f = e.target.closest('#pjset'); if (!f) return; e.preventDefault();
    const p = pj(f.dataset.p); if (!p || !T()) return;
    const err = x => { const el = $('#pj-err', f); el.textContent = x; el.hidden = false; }, num = v => { v = String(v || '').replace(/,/g, '').trim(); return v === '' ? 0 : +v; };
    const rows = k => [...f.querySelectorAll('[data-row="' + k + '"]')].map(r => { const o = {}; r.querySelectorAll('[data-f]').forEach(i => o[i.dataset.f] = i.type === 'checkbox' ? i.checked : i.value.trim()); return o; });
    const it = {}; let bad = '';
    rows('it').filter(r => r.name).forEach((r, i) => { const pr = num(r.price); if (!(pr >= 0) || isNaN(pr)) bad = 'ราคาของ ' + r.name + ' ไม่ถูกต้อง'; it[r.id || 'i' + B.uid().slice(-6)] = { name: r.name, price: pr, sized: !!r.sized, req: !!r.req, extra: !!r.extra, o: i }; });
    if (bad) return err(bad); if (!Object.keys(it).length) return err('ต้องมีรายการอย่างน้อย 1 รายการ');
    const sz = rows('sz').filter(r => r.s).map(r => { const z = { s: r.s }; ['chest', 'len', 'add'].forEach(k => { if (num(r[k])) z[k] = num(r[k]); }); return z; });
    const fd = rows('fd').filter(r => r.label).map(r => { const o = { id: r.id || 'f' + B.uid().slice(-6), label: r.label, type: r.type, who: r.who }; if (r.type === 'choice') o.opts = r.opts.split(',').map(x => x.trim()).filter(Boolean); return o; });
    if (fd.some(x => x.type === 'choice' && !(x.opts || []).length)) return err('ช่องแบบตัวเลือกต้องใส่ตัวเลือกคั่นด้วย ,');
    const staffM = {}; f.querySelectorAll('[data-st]').forEach(c => { if (c.checked) { staffM[c.dataset.s] = staffM[c.dataset.s] || {}; staffM[c.dataset.s][c.dataset.st] = true; } });
    const fv = n => f.elements[n].value.trim();
    const ch = { name: fv('name'), desc: fv('desc'), deadline: fv('deadline'), unit: fv('unit'), ease: num(fv('ease')), selfMeasure: f.elements.selfMeasure.checked, status: fv('status'), items: it, sizes: sz, fields: fd, staff: staffM };
    if (!ch.name) return err('ใส่ชื่อโครงการ');
    A.W(B.update('proj/' + p.id, ch)); A.log('proj.set', '', ch.name); toast('บันทึกการตั้งค่าแล้ว');
  });
  document.addEventListener('input', e => { if (e.target.id === 'pjq') { P.q = e.target.value; const pos = e.target.selectionStart; A.rerender(); const q = $('#pjq'); if (q) { q.focus(); try { q.setSelectionRange(pos, pos); } catch (er) { /* ignore */ } } } });
  document.addEventListener('change', e => { if (e.target.matches && e.target.matches('[data-pjf]')) { P.f = e.target.value; A.rerender(); } });

  const TEMPLATE = () => ({
    name: 'เสื้อและเข็มที่ระลึก ' + A.year(), desc: 'โอนเงินแล้วแนบสลิปในแอป หรือจ่ายเงินสดกับเหรัญญิก', status: 'open', unit: 'นิ้ว', ease: 2, selfMeasure: false,
    items: { shirt: { name: 'เสื้อชมรม', price: 0, sized: true, req: true, extra: true, o: 0 }, pin: { name: 'เข็มที่ระลึก', price: 0, req: true, extra: true, o: 1 } },
    sizes: [{ s: 'SS', chest: 34, len: 25 }, { s: 'S', chest: 36, len: 26 }, { s: 'M', chest: 38, len: 27 }, { s: 'L', chest: 40, len: 28 }, { s: 'XL', chest: 42, len: 29 }, { s: '2XL', chest: 44, len: 30, add: 20 }, { s: '3XL', chest: 46, len: 31, add: 40 }, { s: '4XL', chest: 48, len: 32, add: 60 }],
    fields: [{ id: 'chest', label: 'รอบอก', type: 'num', who: 'staff' }, { id: 'shoulder', label: 'ไหล่', type: 'num', who: 'staff' }, { id: 'len', label: 'ความยาวเสื้อ', type: 'num', who: 'staff' },
      { id: 'sleeve', label: 'ทรงแขน', type: 'choice', opts: ['แขนสั้น', 'แขนยาว'], who: 'student' }, { id: 'emb', label: 'ชื่อที่จะปัก', type: 'text', who: 'student' }]
  });

  /* ---------- การกระทำ ---------- */
  Object.assign(A.ACT, {
    pjTab: d => { P.tab = d.t; A.rerender(); },
    pjNew: async () => {
      if (!T()) return; const w = modal('<h3>สร้างโครงการ</h3><form class="form">' + fld('ชื่อโครงการ', '<input class="in" id="pn-n" required value="' + esc(TEMPLATE().name) + '">') + fld('เริ่มจากแบบ', '<select class="in" id="pn-t">' + opt([['shirt', 'เสื้อและเข็มที่ระลึก (มีตารางไซซ์ตั้งต้น)'], ['blank', 'โครงการเก็บเงินทั่วไป']], 'shirt') + '</select>') +
        '<div class="muted">สร้างแล้วไปที่แท็บ “ตั้งค่า” เพื่อใส่ราคา แก้ตารางไซซ์ตามร้าน และมอบหมายผู้ช่วย</div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">สร้าง</button></div></form>', { sticky: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const id = 'p' + B.uid().slice(-8), t = $('#pn-t', w).value;
        const rec = t === 'shirt' ? TEMPLATE() : { status: 'open', unit: 'นิ้ว', ease: 2, items: { a: { name: 'ค่าใช้จ่าย', price: 0, req: true, o: 0 } }, sizes: [], fields: [] };
        Object.assign(rec, { name: $('#pn-n', w).value.trim() || rec.name, createdAt: Date.now(), by: A.myName() }); A.W(B.set('proj/' + id, rec)); A.log('proj.new', '', rec.name); w.remove(); P.tab = 'set'; location.hash = '#/pj/' + id; });
    },
    pjDel: async d => { const p = pj(d.p); if (!p || !T()) return; const s = data(p); if (Object.keys(s.pay || {}).length) return toast('มีการรับเงินแล้ว ลบไม่ได้ ใช้ “ปิดโครงการ” แทน', 4000);
      if (!await M.confirmBox('ลบโครงการ', 'ลบ “' + esc(p.name) + '” และข้อมูลรายคนทั้งหมด?', 'ลบ', true)) return; A.W(B.remove('projp/' + p.id)); A.W(B.remove('proj/' + p.id)); location.hash = '#/proj'; },
    pjPerson: d => personModal(d.p, d.k),
    pjAddX: d => {
      const p = pj(d.p); if (!p) return; const w = modal('<h3>เพิ่มบุคคลภายนอก</h3><form class="form">' + fld('ชื่อ-สกุล', '<input class="in" id="x-n" required>') + fld('ประเภท', '<select class="in" id="x-k">' + opt(Object.keys(KIND).map(k => [k, KIND[k]])) + '</select>') +
        '<div class="muted">ใช้สำหรับครู ศิษย์เก่า หรือผู้ที่สั่งเพิ่มตามความสมัครใจ</div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">เพิ่ม</button></div></form>', { sticky: true });
      $('form', w).addEventListener('submit', e => { e.preventDefault(); const n = $('#x-n', w).value.trim(); if (!n) return; const pk = 'x' + B.uid().slice(-9); A.W(B.set('projp/' + p.id + '/' + pk + '/info', { name: n, kind: $('#x-k', w).value, at: Date.now(), by: A.myName() })); w.remove(); setTimeout(() => personModal(p.id, pk), 300); });
    },
    pjSelf: d => selfModal(d.p, d.k),
    pjForm: d => formModal(d.p, d.k),
    pjPay: d => payModal(d.p, d.k),
    pjSlip: async (d, el) => {
      const r = A.route(), pid = el.dataset.p || r.arg, pk = el.dataset.k || me(), w = modal('<h3>หลักฐานการชำระ</h3><div id="sl" class="muted">กำลังโหลด…</div><button class="btn ghost block" data-close style="margin-top:12px">ปิด</button>', { center: true });
      try { const v = await B.get('projslip/' + pid + '/' + pk + '/' + d.t); $('#sl', w).innerHTML = v ? '<img class="pj-slip" src="' + esc(v) + '" alt="สลิป">' : 'ไม่พบภาพ'; } catch (er) { $('#sl', w).textContent = 'เปิดไม่ได้: ' + A.errTH(er); }
    },
    pjRemind: async d => {
      const p = pj(d.p); if (!p || !T() || !window.PUSH) return; const s = data(p);
      const to = people(p, s).filter(x => x.mem).filter(x => { const c = calc(p, s, x.pk); return d.w === 'conf' ? !c.out && !c.conf : !c.r.ex && c.left > 0; }).map(x => x.pk);
      if (!to.length) return toast('ไม่มีใครต้องเตือน');
      if (!await M.confirmBox('ส่งการแจ้งเตือน', 'ส่งถึง ' + to.length + ' คน', 'ส่ง')) return;
      PUSH.notify('msg', { to, title: p.name, body: d.w === 'conf' ? 'ยังไม่ได้ยืนยันตัวเลือก เข้าแอปเพื่อเลือกและยืนยันได้เลย' : 'ยังมียอดค้างชำระ ตรวจยอดและแนบสลิปได้ในแอป มีปัญหาแจ้งครูเป็นการส่วนตัวได้', url: '#/pj/' + p.id });
      A.log('proj.remind', '', p.name + ' ' + d.w + ' ' + to.length); toast('ส่งเข้าคิวแล้ว ' + to.length + ' คน');
    },
    pjExport: d => exportX(d.p, d.w),
    pjClose: async d => {
      const p = pj(d.p); if (!p || !T()) return; const s = data(p);
      if (A.STATUS.online === false) return toast('ต้องออนไลน์จึงจะปิดโครงการได้', 4000);
      const ppl = people(p, s), all = ppl.map(x => calc(p, s, x.pk)), tot = Math.round(all.reduce((a, c) => a + c.paid, 0) * 100) / 100, pend = all.reduce((a, c) => a + c.pend, 0), n = all.filter(c => c.paid > 0).length;
      if (!await M.confirmBox('ปิดโครงการ', 'ยอดรับเงินที่ตรวจแล้ว <b>' + money(tot) + ' บาท</b> จาก ' + n + ' คน' + (pend ? '<br><b>ยังมีสลิปรอตรวจ ' + money(pend) + ' บาท ซึ่งจะไม่นับรวม</b>' : '') + '<br>ระบบจะออกใบรับเงินรวม 1 ใบในบัญชีชมรม และปิดรับข้อมูล', 'ปิดและออกใบรับเงิน', true)) return;
      try {
        const ch = { status: 'closed', closedAt: Date.now(), total: tot };
        if (tot > 0) {
          const y = 'y/' + A.year(), no = await B.tx(y + '/counters/in', c => (c || 0) + 1), id = B.uid();
          const rec = { kind: 'in', no: 'ร.' + String(no).padStart(3, '0') + '/' + A.year(), date: A.todayISO(), amount: tot, party: 'สมาชิกและผู้ร่วมโครงการ ' + n + ' คน', title: 'เงินโครงการ ' + p.name, cat: 'กิจกรรม / โครงการ', at: Date.now(), by: A.by(), status: 'approved', approvedBy: A.myName(), approvedAt: Date.now(), note: 'สรุปจากระบบโครงการ ' + p.id };
          await B.direct('set', y + '/ledger/' + id, rec); if (A.finPublish) A.finPublish(Object.assign({ id }, rec)); Object.assign(ch, { ledgerId: id, ledgerNo: rec.no, ledgerYear: A.year() });
        }
        await B.direct('update', 'proj/' + p.id, ch); A.log('proj.close', '', p.name + ' ' + money(tot)); toast(ch.ledgerNo ? 'ปิดโครงการแล้ว · ออกใบรับเงิน ' + ch.ledgerNo : 'ปิดโครงการแล้ว', 5000);
      } catch (er) { toast('ปิดไม่สำเร็จ: ' + A.errTH(er), 5000); }
    }
  });

  /* ---------- หน้าต่างรายบุคคล (ทีมงาน) ---------- */
  function personModal(pid, pk) {
    const p = pj(pid); if (!p) return; const s = data(p), x = people(p, s).find(y => y.pk === pk) || { pk, name: pk, sub: '' }, c = calc(p, s, pk), open = p.status === 'open';
    const mf = fields(p).filter(f => f.who !== 'student'), sf = fields(p).filter(f => f.who === 'student'), sg = suggest(p, c.r.m);
    let h = '<h3>' + esc(x.name) + '</h3><div class="muted">' + esc(x.sub) + ' · ' + chip(c.stt[0], c.stt[1]) + '</div>';
    h += '<div class="pj-k" style="margin-top:10px"><div><b>' + money(c.due) + '</b><span>ยอดที่ต้องจ่าย</span></div><div><b>' + money(c.paid) + '</b><span>จ่ายแล้ว</span></div><div><b>' + money(c.left) + '</b><span>คงค้าง</span></div></div>';
    h += '<div class="lb">รายการ</div>' + (c.ls.map(l => '<div class="row"><span class="grow">' + esc(l.it.name) + ' × ' + l.q + (l.it.sized ? ' (' + esc(c.r.size || 'ไม่มีไซซ์') + ')' : '') + '</span><b>' + money(l.sum) + '</b></div>').join('') || '<div class="muted">-</div>');
    h += '<div class="lb" style="margin-top:10px">ตัวเลือก</div>' + (c.conf ? sf.map(f => '<div class="row"><span class="grow muted">' + esc(f.label) + '</span><b>' + esc((c.r.self.opt || {})[f.id] || '-') + '</b></div>').join('') + '<div class="muted">ยืนยันแล้ว ' + esc(M.thDate(c.r.self.at)) + (c.r.self.by ? ' โดย ' + esc(c.r.self.by) : '') + '</div>' : '<div class="muted">ยังไม่ยืนยัน</div>') +
      ((T() || (pk[0] === 'x' && staff(p))) && open ? '<button class="btn ghost sm" data-act="pjSelf" data-p="' + esc(pid) + '" data-k="' + esc(pk) + '">' + (c.conf ? 'แก้ตัวเลือก (ครู)' : 'กรอกตัวเลือกแทน') + '</button>' : '');
    h += '<div class="lb" style="margin-top:10px">ขนาดตัว (' + esc(p.unit || 'นิ้ว') + ')</div>' + mf.map(f => '<div class="row"><span class="grow muted">' + esc(f.label) + '</span><b>' + esc((c.r.m || {})[f.id] || '-') + '</b></div>').join('') + '<div class="row"><span class="grow muted">ไซซ์</span><b>' + esc(c.r.size || '-') + '</b>' + (sg && sg !== c.r.size ? ' <span class="muted">แนะนำ ' + esc(sg) + '</span>' : '') + '</div>' +
      (can(p, 'form') && open ? '<button class="btn ghost sm" data-act="pjForm" data-p="' + esc(pid) + '" data-k="' + esc(pk) + '">บันทึกขนาด/ไซซ์</button>' : '');
    h += '<div class="lb" style="margin-top:10px">การรับเงิน</div><div data-pays>' + (c.ps.map(y => payRow(y).replace('data-act="pjSlip"', 'data-act="pjSlip" data-p="' + esc(pid) + '" data-k="' + esc(pk) + '"') + (can(p, 'pay') && y.st !== 'void' ? '<div class="row" style="justify-content:flex-end;margin:-4px 0 8px">' + (y.st === 'pending' ? '<button class="btn gold sm" data-ok="' + esc(y.id) + '">ยืนยันรับเงิน</button>' : '') + '<button class="btn ghost sm danger" data-void="' + esc(y.id) + '">ยกเลิก</button></div>' : '')).join('') || '<div class="muted">ยังไม่มีรายการ</div>') + '</div>' +
      (can(p, 'pay') && open ? '<button class="btn gold block" style="margin-top:8px" data-act="pjPay" data-p="' + esc(pid) + '" data-k="' + esc(pk) + '">บันทึกการรับเงิน</button>' : '');
    if (T()) h += '<div class="lb" style="margin-top:14px">ครูเท่านั้น</div><form class="form" id="pj-t"><div class="g3">' + fld('ยกเว้น', '<select class="in" id="t-ex">' + opt([['', 'ไม่ยกเว้น']].concat(Object.keys(EX).map(k => [k, EX[k]])), (c.r.ex || {}).why || '') + '</select>') + fld('แผนการชำระ', '<select class="in" id="t-pl">' + opt([['', 'ปกติ']].concat(Object.keys(PLAN).map(k => [k, PLAN[k]])), (c.r.plan || {}).kind || '') + '</select>') + '</div>' +
      fld('หมายเหตุ (นักเรียนเห็น)', '<input class="in" id="t-no" value="' + esc((c.r.ex || {}).note || (c.r.plan || {}).note || '') + '">') + '<button class="btn sm">บันทึก</button></form>';
    h += '<button class="btn ghost block" data-close style="margin-top:14px">ปิด</button>';
    const w = modal(h, { wide: true });
    w.addEventListener('click', async e => {
      const ok = e.target.closest('[data-ok]'), vd = e.target.closest('[data-void]');
      if (ok) { try { await B.direct('update', 'projpay/' + pid + '/' + pk + '/' + ok.dataset.ok, { st: 'ok', vby: A.myName(), vat: Date.now() }); A.log('proj.verify', pk, p.name); w.remove(); toast('ยืนยันรับเงินแล้ว'); } catch (er) { toast('ไม่สำเร็จ: ' + A.errTH(er), 4000); } }
      if (vd) { const m = modal('<h3>ยกเลิกรายการรับเงิน</h3><form class="form">' + fld('เหตุผล (จำเป็น)', '<input class="in" id="v-r" required>') + '<div class="muted">รายการยังอยู่พร้อมสถานะ “ยกเลิก”</div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ไม่ยกเลิก</button><button class="btn danger grow">ยกเลิกรายการ</button></div></form>', { center: true, sticky: true });
        $('form', m).addEventListener('submit', async ev => { ev.preventDefault(); const r = $('#v-r', m).value.trim(); if (!r) return; try { await B.direct('update', 'projpay/' + pid + '/' + pk + '/' + vd.dataset.void, { st: 'void', voidWhy: r, vby: A.myName(), vat: Date.now() }); A.log('proj.void', pk, p.name + ' ' + r); m.remove(); w.remove(); toast('ยกเลิกแล้ว'); } catch (er) { toast('ไม่สำเร็จ: ' + A.errTH(er), 4000); } }); }
    });
    const tf = $('#pj-t', w); if (tf) tf.addEventListener('submit', e => { e.preventDefault(); const ex = $('#t-ex', w).value, pl = $('#t-pl', w).value, no = $('#t-no', w).value.trim(), base = 'projp/' + pid + '/' + pk;
      A.W(ex ? B.set(base + '/ex', { why: ex, note: no, by: A.myName(), at: Date.now() }) : B.remove(base + '/ex')); A.W(pl ? B.set(base + '/plan', { kind: pl, note: no, at: Date.now() }) : B.remove(base + '/plan'));
      A.log('proj.ex', pk, p.name + ' ' + (ex || '-') + '/' + (pl || '-')); w.remove(); toast('บันทึกแล้ว'); });
  }

  /* ---------- ยืนยันตัวเลือก (นักเรียนครั้งเดียว · ครูแก้ได้) ---------- */
  function selfModal(pid, pk) {
    const p = pj(pid); if (!p || p.status !== 'open') return; const s = data(p), r = (s.pp || {})[pk] || {}, old = r.self || {}, mine = pk === me() && !T();
    if (mine && r.self) return toast('ยืนยันไปแล้ว ต้องการเปลี่ยนให้แจ้งครู');
    const its = items(p).filter(i => i.extra || !i.req), sf = fields(p).filter(f => f.who === 'student');
    const w = modal('<h3>เลือกและยืนยัน</h3><form class="form">' + its.map(i => fld(esc(i.name) + (i.req ? ' (จำนวนรวมของตัวเอง)' : ' (ไม่บังคับ)') + ' · ' + money(i.price) + ' บาท/ชิ้น', '<input class="in" type="number" min="' + (i.req ? 1 : 0) + '" max="20" data-q="' + esc(i.id) + '" value="' + esc((old.ord || {})[i.id] || (i.req ? 1 : 0)) + '">')).join('') +
      sf.map(f => fld(esc(f.label), f.type === 'choice' ? '<select class="in" data-o="' + esc(f.id) + '" required><option value="">— เลือก —</option>' + opt((f.opts || []).map(o => [o, o]), (old.opt || {})[f.id]) + '</select>' : '<input class="in" data-o="' + esc(f.id) + '" maxlength="40" value="' + esc((old.opt || {})[f.id] || '') + '">')).join('') +
      '<div class="note warn" id="sf-sum"></div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">' + (mine ? 'ยืนยัน (แก้ไม่ได้)' : 'บันทึก') + '</button></div></form>', { sticky: true, wide: true });
    const read = () => { const ord = {}, op = {}; w.querySelectorAll('[data-q]').forEach(i => { const v = Math.max(0, Math.min(20, Math.floor(+i.value || 0))); if (v) ord[i.dataset.q] = v; }); w.querySelectorAll('[data-o]').forEach(i => { if (i.value.trim()) op[i.dataset.o] = i.value.trim(); }); return { ord, opt: op }; };
    const upd = () => { const v = read(), c = lines(p, Object.assign({}, r, { self: v })), t = c.reduce((a, l) => a + l.sum, 0); $('#sf-sum', w).textContent = 'รวม ' + c.map(l => l.it.name + ' ' + l.q).join(', ') + ' = ' + money(t) + ' บาท' + (items(p).some(i => i.sized) && !r.size ? ' (ยังไม่รวมค่าไซซ์ใหญ่ถ้ามี)' : ''); };
    w.addEventListener('input', upd); upd();
    $('form', w).addEventListener('submit', async e => { e.preventDefault(); const v = read(); v.at = Date.now(); v.by = A.myName();
      if (mine && !await M.confirmBox('ยืนยันตัวเลือก', 'ยืนยันแล้วจะแก้ไขเองไม่ได้ ต้องให้ครูแก้ให้', 'ยืนยัน')) return;
      try { await B.direct('set', 'projp/' + pid + '/' + pk + '/self', v); A.log('proj.self', pk, p.name); w.remove(); toast('บันทึกแล้ว'); } catch (er) { toast('ไม่สำเร็จ: ' + A.errTH(er), 4000); } });
  }

  /* ---------- บันทึกขนาดตัว ---------- */
  function formModal(pid, pk) {
    const p = pj(pid); if (!p) return; const s = data(p), r = (s.pp || {})[pk] || {}, mf = fields(p).filter(f => f.who !== 'student');
    const w = modal('<h3>ขนาดตัว (' + esc(p.unit || 'นิ้ว') + ')</h3><form class="form"><div class="g3">' + mf.map(f => fld(esc(f.label), f.type === 'choice' ? '<select class="in" data-m="' + esc(f.id) + '"><option value=""></option>' + opt((f.opts || []).map(o => [o, o]), (r.m || {})[f.id]) + '</select>' : '<input class="in" data-m="' + esc(f.id) + '"' + (f.type === 'num' ? ' inputmode="decimal"' : '') + ' value="' + esc((r.m || {})[f.id] || '') + '">')).join('') + '</div>' +
      (sizes(p).length ? fld('ไซซ์', '<select class="in" id="m-s"><option value="">— ยังไม่กำหนด —</option>' + opt(sizes(p).map(z => [z.s, z.s + (z.chest ? ' · อก ' + z.chest : '') + (z.len ? ' ยาว ' + z.len : '') + (+z.add ? ' · +' + z.add + ' บาท' : '')]), r.size) + '</select>', '<span id="m-sg"></span>') : '') +
      '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">บันทึก</button></div></form>', { sticky: true, wide: true });
    const read = () => { const m = {}; w.querySelectorAll('[data-m]').forEach(i => { const v = i.value.trim(); if (v) m[i.dataset.m] = /^[0-9.]+$/.test(v) ? +v : v; }); return m; };
    const keyOf = re => (mf.find(f => re.test(f.label)) || {}).id;
    const upd = () => { const m = read(), sg = suggest(p, { chest: m[keyOf(/อก/)], len: m[keyOf(/ยาว/)] }), el = $('#m-sg', w); if (el) el.innerHTML = sg ? 'แนะนำ: <b>' + esc(sg) + '</b> <button type="button" class="btn ghost sm" id="m-use">ใช้ไซซ์นี้</button>' : ''; const u = $('#m-use', w); if (u) u.onclick = () => { $('#m-s', w).value = sg; }; };
    w.addEventListener('input', upd); upd();
    $('form', w).addEventListener('submit', async e => { e.preventDefault(); const m = read(), z = $('#m-s', w) ? $('#m-s', w).value : '', base = 'projp/' + pid + '/' + pk;
      try { await B.direct('set', base + '/m', Object.keys(m).length ? m : null); await B.direct('set', base + '/size', z || null); A.log('proj.form', pk, p.name); w.remove(); toast('บันทึกแล้ว'); } catch (er) { toast('ไม่สำเร็จ: ' + A.errTH(er), 4000); } });
  }

  /* ---------- รับเงิน / แนบสลิป ---------- */
  function payModal(pid, pk) {
    const p = pj(pid); if (!p) return; const s = data(p), c = calc(p, s, pk), stf = can(p, 'pay') && !(pk === me() && !T());
    const w = modal('<h3>' + (stf ? 'บันทึกการรับเงิน' : 'แนบสลิปโอนเงิน') + '</h3><form class="form"><div class="g3">' + fld('จำนวนเงิน (บาท)', '<input class="in" id="py-a" inputmode="decimal" required value="' + (c.left > 0 ? c.left : '') + '">') +
      (stf ? fld('วิธีชำระ', '<select class="in" id="py-m">' + opt([['เงินสด', 'เงินสด'], ['โอนเงิน', 'โอนเงิน']]) + '</select>') : '') + '</div>' +
      fld('ภาพหลักฐาน' + (stf ? ' (ถ้ามี)' : ''), '<input class="in" type="file" accept="image/*" id="py-f"' + (stf ? '' : ' required') + '>') + fld('หมายเหตุ', '<input class="in" id="py-n" maxlength="120">') +
      '<div class="muted" id="py-t"></div><div class="note warn">' + (stf ? 'บันทึกแล้วแก้จำนวนไม่ได้ ผิดให้ยกเลิกแล้วบันทึกใหม่' : 'ส่งแล้วสถานะเป็น “รอตรวจ” จนกว่าครูหรือเหรัญญิกจะยืนยัน') + '</div><div class="note bad" id="py-e" hidden></div>' +
      '<div class="row" style="margin-top:14px"><button type="button" class="btn ghost grow" data-close>ยกเลิก</button><button class="btn gold grow">บันทึก</button></div></form>', { sticky: true });
    const amt = () => { const v = $('#py-a', w).value.replace(/,/g, '').trim(); return /^[0-9]+(\.[0-9]{1,2})?$/.test(v) ? +v : NaN; };
    const showT = () => { const a = amt(); $('#py-t', w).textContent = a > 0 ? '( ' + M.bahtText(a) + ' )' : ''; }; $('#py-a', w).addEventListener('input', showT); showT();
    $('form', w).addEventListener('submit', async e => {
      e.preventDefault(); const er = x => { const el = $('#py-e', w); el.textContent = x; el.hidden = false; }, a = amt(), f = $('#py-f', w).files[0];
      if (!(a > 0) || a >= 100000) return er('จำนวนเงินไม่ถูกต้อง'); if (!stf && !f) return er('แนบภาพสลิปก่อน');
      const btn = $('button.gold', w); btn.disabled = true;
      try {
        const tid = B.uid(), rec = { amt: a, at: Date.now(), by: A.by(), st: stf ? 'ok' : 'pending', method: stf ? $('#py-m', w).value : 'โอนเงิน' }, n = $('#py-n', w).value.trim(); if (n) rec.note = n; if (stf) { rec.vby = A.myName(); rec.vat = Date.now(); }
        if (f) { const img = await M.fileToImage(f, 1000, 0.6); await B.direct('set', 'projslip/' + pid + '/' + pk + '/' + tid, img); rec.slip = true; }
        await B.direct('set', 'projpay/' + pid + '/' + pk + '/' + tid, rec); A.log('proj.pay', pk, p.name + ' ' + money(a));
        if (!stf && window.PUSH) PUSH.notify('tx', { ref: p.name + ' ' + money(a) });
        w.remove(); toast(stf ? 'บันทึกการรับเงินแล้ว' : 'ส่งสลิปแล้ว รอตรวจ');
      } catch (x) { btn.disabled = false; er('บันทึกไม่สำเร็จ: ' + A.errTH(x)); }
    });
  }

  /* ---------- ส่งออก ---------- */
  function exportX(pid, what) {
    const p = pj(pid); if (!p) return; const s = data(p), ppl = people(p, s);
    let head, rows, widths, al, title;
    if (what === 'order') { const o = order(p, s, ppl.filter(x => !calc(p, s, x.pk).out)); title = 'ใบสั่งร้าน ' + p.name; head = ['รายการ', 'ไซซ์ / ตัวเลือก', 'จำนวน']; rows = o.rows.map(r => [r[0], r[1], String(r[2])]).concat(o.names.length ? [['', 'ข้อความปัก/สกรีน', '']].concat(o.names.map(n => ['', n[1] + ' — ' + n[2], ''])) : []); widths = [30, 55, 15]; al = ['', '', 'c']; }
    else { const mf = fields(p).filter(f => f.who !== 'student'), sf = fields(p).filter(f => f.who === 'student'); title = 'สถานะการชำระ ' + p.name; head = ['ที่', 'ชื่อ-สกุล', 'ชั้น/ประเภท', 'ไซซ์', 'ตัวเลือก', 'ยอด', 'จ่ายแล้ว', 'สถานะ'];
      rows = ppl.map((x, i) => { const c = calc(p, s, x.pk), op = (c.r.self || {}).opt || {}; return [String(i + 1), x.name, x.sub, c.r.size || '-', sf.map(f => op[f.id]).filter(Boolean).join(' / ') + (mf.length && c.r.m ? ' [' + mf.map(f => f.label + ' ' + (c.r.m[f.id] || '-')).join(', ') + ']' : ''), money(c.due), money(c.paid), c.stt[0]]; });
      widths = [5, 22, 11, 7, 25, 9, 9, 12]; al = ['c', '', 'c', 'c', '', 'r', 'r', 'c']; }
    const sub = M.C.club.full + ' · ข้อมูล ณ ' + M.thDate(Date.now()), name = M.safeName(title);
    const w = modal('<h3>ส่งออก</h3><div class="xlist"><button class="xbtn" data-x="pdf"><b>PDF</b><span>พิมพ์ / ส่งในแชท</span></button><button class="xbtn" data-x="docx"><b>DOCX</b><span>เปิดแก้ต่อใน Word</span></button></div><div class="muted" id="x-msg" style="margin-top:10px"></div><button class="btn ghost block" data-close style="margin-top:12px">ปิด</button>', { center: true });
    w.addEventListener('click', async e => { const b = e.target.closest('[data-x]'); if (!b) return; const msg = $('#x-msg', w); msg.textContent = 'กำลังสร้างไฟล์ …';
      try { if (b.dataset.x === 'docx') await M.saveBlob(M.docxTable({ title, lines: [sub], head, rows, widths, align: al.map(a => a === 'c' ? 'center' : a === 'r' ? 'right' : 'left'), footer: ['', 'พัฒนาโดย นายนนทพัทธ์ วงค์มูล © 2026'] }), name + '.docx');
        else await M.exportPDF(A.tablePages(title, sub, head, rows, { widths, align: al, foot: 'ข้อมูล ณ ' + M.thDate(Date.now()) + ' ·' }), name + '.pdf'); msg.textContent = 'เสร็จแล้ว'; }
      catch (er) { msg.textContent = 'ส่งออกไม่สำเร็จ: ' + (er.message || er); } });
  }
})();
