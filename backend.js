/* ============================================================
   backend.js — ชั้นข้อมูลของแอปสรรพวาทิต (ปรับจากระบบ Mae Sot Musicology)
   • Firebase Realtime Database + Google Sign-in
   • โหมดสาธิต (ไม่ต้องมีเซิร์ฟเวอร์) — ข้อมูลอยู่ในเบราว์เซอร์นี้ เปิดหลายแท็บจำลองหลายผู้ใช้
   • กันข้อมูลหาย: ทุกการเขียนเข้า "กล่องขาออก" (Outbox) ใน IndexedDB ก่อน → ส่งขึ้นเซิร์ฟเวอร์
   ============================================================ */
(function () {
  'use strict';
  const C = window.APP_CONFIG;
  const clone = v => v == null ? null : JSON.parse(JSON.stringify(v));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const parts = p => String(p).split('/').filter(Boolean);
  function getAt(t, p) { let n = t; for (const k of parts(p)) { if (n == null || typeof n !== 'object') return null; n = n[k]; } return n === undefined ? null : n; }
  function setAt(t, p, v) {
    const ks = parts(p); let n = t;
    for (let i = 0; i < ks.length - 1; i++) { if (n[ks[i]] == null || typeof n[ks[i]] !== 'object') n[ks[i]] = {}; n = n[ks[i]]; }
    const last = ks[ks.length - 1];
    if (v == null) delete n[last]; else n[last] = clone(v);
  }
  function applyOp(t, op) {
    if (op.t === 'set') setAt(t, op.p, op.v);
    else if (op.t === 'update') Object.keys(op.v).forEach(k => setAt(t, op.p + '/' + k, op.v[k]));
    else if (op.t === 'remove') setAt(t, op.p, null);
  }
  const norm = p => parts(p).join('/');
  const under = (p, base) => { p = norm(p); base = norm(base); return p === base || !p || p.startsWith(base + '/') || base.startsWith(p + '/'); };
  const opTouches = (op, base) => op.t === 'update' ? Object.keys(op.v || {}).some(k => under(norm(op.p) + '/' + k, base)) : under(op.p, base);

  /* ---------- IndexedDB ---------- */
  const STORES = ['media', 'outbox', 'cache', 'snaps', 'demomedia', 'failed'];
  let dbp = null;
  function idbOpen() {
    if (!dbp) dbp = new Promise((res, rej) => {
      if (!window.indexedDB) return rej(new Error('no idb'));
      const r = indexedDB.open('spw-v1', 1);
      r.onupgradeneeded = () => STORES.forEach(s => { if (!r.result.objectStoreNames.contains(s)) r.result.createObjectStore(s, { keyPath: 'id' }); });
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  const mem = {}; STORES.forEach(s => mem[s] = new Map());
  async function idb(store, mode, fn) {
    try {
      const db = await idbOpen();
      return await new Promise((res, rej) => { const t = db.transaction(store, mode); const rq = fn(t.objectStore(store)); t.oncomplete = () => res(rq && rq.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); });
    } catch (e) { return undefined; }
  }
  const IDB = {
    async put(s, o) { mem[s].set(o.id, o); await idb(s, 'readwrite', st => st.put(o)); },
    async get(s, id) { const r = await idb(s, 'readonly', st => st.get(id)); return r || mem[s].get(id) || null; },
    async del(s, id) { mem[s].delete(id); await idb(s, 'readwrite', st => st.delete(id)); },
    async all(s) { const r = await idb(s, 'readonly', st => st.getAll()); return r || Array.from(mem[s].values()); },
    async clear(s) { mem[s].clear(); await idb(s, 'readwrite', st => st.clear()); }
  };

  /* ---------- สถานะ ---------- */
  const status = { online: navigator.onLine, pending: 0, failed: 0, lastSync: 0 };
  const statusCbs = new Set();
  function emitStatus() { statusCbs.forEach(cb => { try { cb(Object.assign({}, status)); } catch (e) { /* ignore */ } }); }

  /* ---------- Firebase implementation ---------- */
  const FBImpl = {
    name: 'firebase',
    async init() {
      await window.MC.loadLibs('fb');
      /* ถ้าเว็บอยู่บน Firebase Hosting ให้ใช้โดเมนเดียวกันเป็น authDomain → ล็อกอินได้ทุกเบราว์เซอร์ (รวม iPhone ที่ติดตั้งเป็นแอป) */
      const cfg = Object.assign({}, C.firebase); const h = location.hostname;
      if (/\.(web\.app|firebaseapp\.com)$/.test(h)) cfg.authDomain = h;
      this.sameOriginAuth = cfg.authDomain === h; this.authDomain = cfg.authDomain;
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      this.db = firebase.database(); this.auth = firebase.auth();
      try { await this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch (e) { /* ignore */ }
      try { await this.auth.getRedirectResult(); } catch (e) { B.authError = e; }
      this.db.ref('.info/connected').on('value', s => { status.online = !!s.val(); emitStatus(); });
    },
    onAuth(cb) { return this.auth.onAuthStateChanged(u => cb(u ? { uid: u.uid, email: (u.email || '').toLowerCase(), name: u.displayName || '', photo: u.photoURL || '', verified: u.emailVerified } : null)); },
    async signIn(opts) {
      const p = new firebase.auth.GoogleAuthProvider();
      const params = { prompt: 'select_account' }; if (opts && opts.hd) params.hd = opts.hd; p.setCustomParameters(params);
      /* ใช้ popup ก่อนเสมอ (ทำงานข้ามโดเมนได้) — redirect ใช้เฉพาะเมื่อเว็บอยู่โดเมนเดียวกับ authDomain เท่านั้น
         เพราะ redirect ข้ามโดเมน (github.io ↔ firebaseapp.com) ถูก Safari/Chrome บล็อกคุกกี้ ทำให้ล็อกอินค้าง */
      try { await this.auth.signInWithPopup(p); }
      catch (e) {
        if (this.sameOriginAuth && ['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/web-storage-unsupported'].includes(e.code)) return this.auth.signInWithRedirect(p);
        throw e;
      }
    },
    signOut() { return this.auth.signOut(); },
    raw(op) { const r = op.p ? this.db.ref(op.p) : this.db.ref(); return op.t === 'set' ? r.set(op.v) : op.t === 'update' ? r.update(op.v) : r.remove(); },
    get(p) { return this.db.ref(p).once('value').then(s => s.val()); },
    on(p, cb, err) { const r = this.db.ref(p); const h = s => cb(s.val()); r.on('value', h, e => err && err(e)); return () => r.off('value', h); },
    query(p, child, eq) { return this.db.ref(p).orderByChild(child).equalTo(eq).once('value').then(s => s.val()); }
  };

  /* ---------- Demo implementation (localStorage + IndexedDB) ---------- */
  const DKEY = 'spw_demo_db', DUSER = 'spw_demo_user';
  const DemoImpl = {
    name: 'demo', ls: [], authCb: null,
    tree() { try { return JSON.parse(localStorage.getItem(DKEY)) || {}; } catch (e) { return {}; } },
    save(t) {
      try { localStorage.setItem(DKEY, JSON.stringify(t)); }
      catch (e) { console.warn('demo storage full', e); if (window.MC) window.MC.toast('พื้นที่โหมดสาธิตเต็ม — ไปที่ จัดการ › ตั้งค่า › ล้างข้อมูลสาธิต', 5000); }
      this.emit(t);
    },
    async init() {
      if (!localStorage.getItem(DKEY)) this.save(seedDemo());
      window.addEventListener('storage', e => { if (e.key === DKEY) this.emit(); });
      status.online = true;
    },
    onAuth(cb) { this.authCb = cb; let u = null; try { u = JSON.parse(sessionStorage.getItem(DUSER)); } catch (e) { /* ignore */ } setTimeout(() => cb(u), 0); return () => { }; },
    async signIn() { const u = await demoChooser(); if (!u) return; sessionStorage.setItem(DUSER, JSON.stringify(u)); this.authCb && this.authCb(u); },
    async signOut() { sessionStorage.removeItem(DUSER); this.authCb && this.authCb(null); },
    async raw(op) {
      if (op.p && op.p.startsWith('photos/') && op.t !== 'update') { if (op.t === 'remove' || op.v == null) await IDB.del('demomedia', op.p); else await IDB.put('demomedia', { id: op.p, v: op.v }); return; }
      const t = this.tree(); applyOp(t, op); this.save(t);
    },
    async get(p) { if (p.startsWith('photos/') && parts(p).length === 2) { const r = await IDB.get('demomedia', p); return r ? clone(r.v) : null; } return clone(getAt(this.tree(), p)); },
    on(p, cb) { const l = { p, cb, last: undefined }; this.ls.push(l); this.fire(l); return () => { this.ls = this.ls.filter(x => x !== l); }; },
    emit(t) { t = t || this.tree(); this.ls.forEach(l => this.fire(l, t)); },
    fire(l, t) { t = t || this.tree(); const v = getAt(t, l.p); const s = JSON.stringify(v); if (s !== l.last) { l.last = s; setTimeout(() => l.cb(v == null ? null : JSON.parse(s)), 0); } },
    async query(p, child, eq) { const v = getAt(this.tree(), p) || {}; const o = {}; Object.keys(v).forEach(k => { if (v[k] && v[k][child] === eq) o[k] = v[k]; }); return Object.keys(o).length ? o : null; }
  };

  /* ข้อมูลสาธิต — ชื่อสมมติทั้งหมด ห้ามใส่ข้อมูลจริงของนักเรียนในไฟล์นี้ (repo เป็นสาธารณะ) */
  function seedDemo() {
    const now = Date.now(); const by = { id: 'teacher', name: 'ครูตัวอย่าง' };
    const t = { config: {}, members: {}, roles: {}, skills: {}, privateInfo: {}, teachers: {}, history: {} };
    t.config = {
      year: C.club.year,
      advisors: {
        a1: { name: 'ครูตัวอย่าง ใจดี', kind: 'teacher', email: (C.teacherEmails[0] || 'teacher@example.com'), position: 'ครูที่ปรึกษาชมรม', order: 1 },
        a2: { name: 'พ่อครูตัวอย่าง เสียงทอง', kind: 'expert', position: 'วิทยากรท้องถิ่น', order: 2 }
      }
    };
    const rows = [
      ['90001', 'นาย', 'กานต์', 'ตัวอย่างหนึ่ง', 5, 3, 'regular', 1, 1, ['ระนาดเอก', 'ฆ้องวงใหญ่'], 'president', 0, [4, 3]],
      ['90002', 'น.ส.', 'ขวัญ', 'ตัวอย่างสอง', 5, 1, 'regular', 1, 1, ['ซออู้', 'ซอด้วง'], 'vice', 0, [3, 3]],
      ['90003', 'นาย', 'คีตะ', 'ตัวอย่างสาม', 4, 7, 'regular', 0, 1, ['ฆ้องวงใหญ่'], 'treasurer', 0, [2]],
      ['90004', 'น.ส.', 'จันทร์', 'ตัวอย่างสี่', 4, 2, 'regular', 1, 0, ['ขิม'], 'secretary', 0, [3]],
      ['90005', 'ด.ช.', 'ชลธี', 'ตัวอย่างห้า', 1, 5, 'start', 1, 0, ['ฉิ่ง'], 'rep', 1, [1]],
      ['90006', 'ด.ญ.', 'ดารา', 'ตัวอย่างหก', 2, 6, 'start', 0, 1, ['ขลุ่ย'], 'rep', 2, [1]],
      ['90007', 'ด.ช.', 'ธนา', 'ตัวอย่างเจ็ด', 3, 8, 'regular', 1, 1, ['ระนาดทุ้ม'], 'rep', 3, [2]],
      ['90008', 'นาย', 'นที', 'ตัวอย่างแปด', 4, 10, 'regular', 0, 1, ['ตะโพน', 'กลองแขก'], 'rep', 4, [2, 2]],
      ['90009', 'น.ส.', 'ปราง', 'ตัวอย่างเก้า', 5, 7, 'regular', 1, 1, ['จะเข้'], 'rep', 5, [3]],
      ['90010', 'นาย', 'พบ', 'ตัวอย่างสิบ', 6, 6, 'special', 0, 1, ['ปี่'], 'rep', 6, [5]],
      ['90011', 'ด.ญ.', 'มุก', 'ตัวอย่างสิบเอ็ด', 2, 1, 'start', 1, 0, ['ซอด้วง'], '', 0, [0]],
      ['90012', 'ด.ช.', 'ยศ', 'ตัวอย่างสิบสอง', 1, 13, 'start', 0, 1, ['ฉาบ'], '', 0, [0]],
      ['90013', 'น.ส.', 'ริน', 'ตัวอย่างสิบสาม', 3, 2, 'regular', 1, 1, ['ขับร้อง'], '', 0, [2]],
      ['90014', 'นาย', 'วิน', 'ตัวอย่างสิบสี่', 6, 2, 'special', 0, 0, ['ฆ้องวงเล็ก'], '', 0, [4]]
    ];
    rows.forEach(r => {
      const inst = {}; r[9].forEach(n => inst[n] = true);
      t.members[r[0]] = { prefix: r[1], first: r[2], last: r[3], grade: r[4], room: r[5], type: r[6], status: 'active', am: !!r[7], pm: !!r[8], inst, createdAt: now, createdBy: by };
      if (r[10]) t.roles[r[0]] = r[10] === 'rep' ? { role: 'rep', grade: r[11] } : { role: r[10] };
      r[9].forEach((n, i) => { if (r[12][i]) { t.skills[r[0]] = t.skills[r[0]] || {}; t.skills[r[0]][n] = { lv: r[12][i], at: now, by: 'ครูตัวอย่าง' }; } });
    });
    t.members['90015'] = { prefix: 'นาย', first: 'ศักดิ์', last: 'ตัวอย่างสิบห้า', grade: 6, room: 1, type: 'regular', status: 'removed', removedReason: 'resign', removedAt: now, am: false, pm: false, createdAt: now, createdBy: by };
    t._demo = { seededAt: now };
    return t;
  }
  function demoChooser() {
    return new Promise(res => {
      const t = DemoImpl.tree(); const ms = t.members || {}; const rl = t.roles || {};
      const rn = id => { const r = (C.roles || []).find(x => x.id === id); return r ? r.name : 'สมาชิก'; };
      const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const tch = Object.values((t.config || {}).advisors || {}).filter(a => a.kind === 'teacher' && a.email).map(a => ({ email: a.email, name: a.name, note: 'ครูที่ปรึกษา (สิทธิ์สูงสุด)' }));
      const order = ['president', 'vice', 'treasurer', 'secretary', 'rep', ''];
      const studs = Object.keys(ms).filter(s => ms[s].status === 'active').sort((a, b) => order.indexOf((rl[a] || {}).role || '') - order.indexOf((rl[b] || {}).role || '') || a.localeCompare(b))
        .map(s => ({ email: s + '@' + C.auth.domain, name: ms[s].prefix + ms[s].first + ' ' + ms[s].last, note: rn((rl[s] || {}).role) + ((rl[s] || {}).grade ? ' ม.' + rl[s].grade : '') }));
      const list = tch.concat(studs.slice(0, 7));
      const w = document.createElement('div'); w.className = 'modal center';
      w.innerHTML = '<div class="modal-in"><h3>เลือกบัญชีสาธิต</h3><div class="muted" style="margin-bottom:10px">โหมดสาธิต: จำลองการล็อกอินด้วย Google แต่ละบทบาทเห็นเมนูและสิทธิ์ต่างกัน</div>' +
        list.map((u, i) => '<button class="acct" data-i="' + i + '"><b>' + esc(u.name) + '</b><span>' + esc(u.note) + ' · ' + esc(u.email) + '</span></button>').join('') +
        '<button class="acct" data-i="n"><b>นักเรียนที่ยังไม่มีชื่อในทะเบียน</b><span>99999@' + esc(C.auth.domain) + '</span></button>' +
        '<button class="acct" data-i="x"><b>บัญชีนอกโรงเรียน (ทดสอบการปฏิเสธ)</b><span>someone@gmail.com</span></button>' +
        '<button class="btn ghost block" data-i="c" style="margin-top:10px">ยกเลิก</button></div>';
      document.body.appendChild(w);
      w.onclick = e => {
        const b = e.target.closest('[data-i]'); if (!b) return; const i = b.dataset.i; w.remove();
        if (i === 'c') return res(null);
        if (i === 'x') return res({ uid: 'x', email: 'someone@gmail.com', name: 'ผู้ใช้ภายนอก', verified: true });
        if (i === 'n') return res({ uid: 'n', email: '99999@' + C.auth.domain, name: 'นักเรียนใหม่', verified: true });
        const u = list[+i]; res({ uid: 'demo-' + u.email, email: u.email, name: u.name, verified: true });
      };
    });
  }

  /* ---------- Outbox: ทุกการเขียนเก็บไว้ในเครื่องก่อน แล้วค่อยส่ง ---------- */
  let impl = null; const pendingOps = new Map();
  async function refreshCounts() { status.pending = pendingOps.size; status.failed = (await IDB.all('failed')).length; emitStatus(); }
  function send(op) {
    pendingOps.set(op.id, op); refreshCounts();
    return Promise.resolve(impl.raw(op)).then(async () => {
      pendingOps.delete(op.id); await IDB.del('outbox', op.id); status.lastSync = Date.now(); refreshCounts();
    }).catch(async e => {
      pendingOps.delete(op.id); await IDB.del('outbox', op.id);
      if (op.replayed && /^history\//.test(op.p || '')) { refreshCounts(); return; } // ประวัติที่ส่งสำเร็จไปแล้วก่อนปิดแอป
      op.error = (e && (e.code || e.message)) || String(e); op.failedAt = Date.now(); await IDB.put('failed', op);
      refreshCounts(); console.warn('write failed', op.p, e); throw e;
    });
  }
  async function write(t, p, v) {
    const op = { id: uid(), seq: Date.now() + Math.random(), t, p, v: clone(v), at: Date.now() };
    await IDB.put('outbox', op);
    overlayNotify(op);
    return send(op);
  }
  async function replayOutbox() {
    const ops = (await IDB.all('outbox')).sort((a, b) => a.seq - b.seq);
    ops.forEach(op => { op.replayed = true; send(op).catch(() => { }); });
    refreshCounts();
  }

  /* ---------- on(): แคช + ซ้อนการแก้ที่ยังไม่ได้ส่ง ---------- */
  const subs = new Set();
  function overlay(path, val) {
    const ops = Array.from(pendingOps.values()).filter(op => opTouches(op, path)).sort((a, b) => a.seq - b.seq);
    if (!ops.length) return val;
    const w = {}; setAt(w, path, val); ops.forEach(op => applyOp(w, op)); return clone(getAt(w, path));
  }
  function overlayNotify(op) { subs.forEach(s => { if (opTouches(op, s.p)) { pendingOps.set(op.id, op); s.cb(overlay(s.p, s.last)); } }); }
  const cacheT = {};
  function on(path, cb, err) {
    const s = { p: path, cb, last: null, got: false }; subs.add(s);
    IDB.get('cache', path).then(c => { if (c && !s.got) { s.last = c.v; cb(overlay(path, c.v)); } });
    const off = impl.on(path, v => {
      s.got = true; s.last = v; cb(overlay(path, v));
      clearTimeout(cacheT[path]); cacheT[path] = setTimeout(() => IDB.put('cache', { id: path, v, at: Date.now() }), 800);
    }, e => { if (err) err(e); });
    return () => { subs.delete(s); off(); };
  }

  /* ---------- สำเนาสำรองในเครื่อง (เก็บ 15 ชุดล่าสุด) ---------- */
  async function snapshot(key, data) {
    const all = (await IDB.all('snaps')).filter(s => s.key === key).sort((a, b) => b.at - a.at);
    if (all[0] && JSON.stringify(all[0].data) === JSON.stringify(data)) return;
    await IDB.put('snaps', { id: key + '@' + Date.now(), key, at: Date.now(), data: clone(data) });
    for (const old of all.slice(14)) await IDB.del('snaps', old.id);
  }
  async function snapshots(key) { return (await IDB.all('snaps')).filter(s => s.key === key).sort((a, b) => b.at - a.at); }

  /* ---------- public ---------- */
  const B = window.B = {
    mode: 'demo', status, IDB, uid, clone, getAt, setAt,
    configured() {
      try { const q = new URLSearchParams(location.search).get('demo');
        if (q === '1') sessionStorage.setItem('spw_force_demo', '1'); if (q === '0') sessionStorage.removeItem('spw_force_demo');
        if (sessionStorage.getItem('spw_force_demo')) return false; } catch (e) { /* ignore */ }
      return this.realConfigured(); },
    async init() {
      impl = this.configured() ? FBImpl : DemoImpl; this.mode = impl.name;
      await impl.init();
      window.addEventListener('online', () => { if (impl === DemoImpl) { status.online = true; emitStatus(); } });
      window.addEventListener('offline', () => { if (impl === DemoImpl) { status.online = false; emitStatus(); } });
      try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* ignore */ }
      await replayOutbox();
    },
    onAuth: cb => impl.onAuth(cb),
    signIn: opts => impl.signIn(opts),
    signOut: () => impl.signOut(),
    set: (p, v) => write('set', p, v),
    update: (p, v) => write('update', p, v),
    remove: p => write('remove', p, null),
    get: p => impl.get(p),
    on, query: (p, c, e) => impl.query(p, c, e),
    snapshot, snapshots,
    failedOps: () => IDB.all('failed'),
    async retryFailed() { for (const op of await IDB.all('failed')) { await IDB.del('failed', op.id); delete op.error; await IDB.put('outbox', op); send(op).catch(() => { }); } refreshCounts(); },
    onStatus(cb) { statusCbs.add(cb); cb(Object.assign({}, status)); return () => statusCbs.delete(cb); },
    authErrorText(e) {
      const code = (e && e.code) || ''; const host = location.hostname;
      const T = {
        'auth/unauthorized-domain': 'โดเมน ' + host + ' ยังไม่ได้รับอนุญาต → Firebase › Authentication › Settings › Authorized domains › เพิ่ม ' + host,
        'auth/operation-not-allowed': 'ยังไม่ได้เปิดการล็อกอินด้วย Google → Firebase › Authentication › Sign-in method › Google › Enable',
        'auth/popup-blocked': 'เบราว์เซอร์บล็อกหน้าต่างล็อกอิน → อนุญาต pop-up สำหรับเว็บนี้ แล้วกดใหม่',
        'auth/popup-closed-by-user': 'หน้าต่างล็อกอินถูกปิดก่อนเสร็จ — ถ้าหน้าต่าง Google ขึ้นว่า “Access blocked / ถูกบล็อก / ผู้ดูแลระบบจำกัดการเข้าถึง” แปลว่าผู้ดูแลอีเมลโรงเรียน (@sappha.ac.th) ต้องอนุญาตแอปนี้ก่อน ให้แจ้งครู; ถ้าไม่ใช่ ให้กดเข้าสู่ระบบใหม่',
        'auth/cancelled-popup-request': 'มีหน้าต่างล็อกอินเปิดอยู่แล้ว — ปิดแล้วกดใหม่',
        'auth/network-request-failed': 'เชื่อมต่ออินเทอร์เน็ตไม่ได้ — ตรวจสัญญาณแล้วลองใหม่',
        'auth/web-storage-unsupported': 'เบราว์เซอร์นี้ปิดการเก็บข้อมูล (โหมดส่วนตัว/บล็อกคุกกี้) — เปิดด้วย Safari/Chrome ปกติ',
        'auth/operation-not-supported-in-this-environment': 'แอปที่ติดตั้งบนหน้าจอโฮมล็อกอินด้วยวิธีนี้ไม่ได้ — เปิดผ่านเบราว์เซอร์ หรือย้ายเว็บไป Firebase Hosting (ดูคู่มือ)',
        'auth/internal-error': 'ระบบล็อกอินขัดข้อง — ถ้าเปิดจากแอปบนหน้าจอโฮม ให้ลองเปิดผ่านเบราว์เซอร์',
        'auth/too-many-requests': 'ลองหลายครั้งเกินไป — รอสักครู่แล้วลองใหม่'
      };
      return (T[code] || ((e && e.message) || String(e))) + (code ? ' [' + code + ']' : '');
    },
    diagnostics() {
      const ua = navigator.userAgent; const sa = window.matchMedia('(display-mode: standalone)').matches || !!navigator.standalone;
      return { mode: this.mode, host: location.hostname, authDomain: impl && impl.authDomain, sameOriginAuth: !!(impl && impl.sameOriginAuth), online: status.online, navigatorOnline: navigator.onLine,
        standalone: sa, ios: /iPhone|iPad|iPod/.test(ua), browser: (/CriOS|Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : /Firefox/.test(ua) ? 'Firefox' : 'อื่น ๆ'), pending: status.pending, failed: status.failed, lastAuthError: this.authError ? this.authErrorText(this.authError) : '' };
    },
    sidFromEmail(email) {
      email = String(email || '').toLowerCase(); const dom = '@' + C.auth.domain.toLowerCase();
      if (!email.endsWith(dom)) return null; const sid = email.slice(0, -dom.length);
      return new RegExp(C.auth.sidPattern).test(sid) ? sid : null;
    },
    isBootTeacher: email => (C.teacherEmails || []).map(e => e.toLowerCase()).includes(String(email || '').toLowerCase()),
    emailKey: email => String(email || '').toLowerCase().replace(/\./g, ','),
    realConfigured() { const f = C.firebase || {}; return !!(f.apiKey && f.databaseURL); },
    resetDemo() { localStorage.removeItem(DKEY); sessionStorage.removeItem(DUSER); return IDB.clear('demomedia'); }
  };
})();
