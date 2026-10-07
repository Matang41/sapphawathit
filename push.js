/* ============================================================
   push.js — Web Push (FCM) ฝั่งหน้าเว็บ · Firebase SDK v10 แบบ Modular (โหลดด้วย import() จาก CDN)
   1) ขอสิทธิ์แจ้งเตือน  2) ขอ FCM token ด้วย VAPID key  3) บันทึกลง people/{sid}/fcm/{hash}
   • ใช้ Firebase app ชื่อ "push" แยกจากแอปหลัก (ที่ใช้ compat SDK) จึงไม่ชนกัน
   • ลงทะเบียน firebase-messaging-sw.js ด้วย scope แยก จึงไม่ชนกับ sw.js ของแอป
   • ต้องกดจากปุ่มของผู้ใช้เท่านั้น (iOS ไม่อนุญาตให้ขอสิทธิ์โดยไม่มีการกด)
   ตั้งค่า: config.js › vapidKey = Web Push certificate (key pair) จาก Firebase Console
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, B = window.B, A = window.APP, C = M.C;
  const { esc, toast } = M;
  const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/', SW = 'firebase-messaging-sw.js', SCOPE = './firebase-cloud-messaging-push-scope';
  const standalone = () => { try { return window.matchMedia('(display-mode: standalone)').matches || !!navigator.standalone; } catch (e) { return false; } };
  const ios = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const supported = () => 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  const sha = async s => { try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 24); } catch (e) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return 'h' + h.toString(36) + s.length; } };
  const KEY = 'spw_push_key';

  async function waitActive(reg) {
    if (reg.active) return reg; const w = reg.installing || reg.waiting; if (!w) return reg;
    await new Promise(res => { if (w.state === 'activated') return res(); w.addEventListener('statechange', () => { if (w.state === 'activated') res(); }); }); return reg;
  }
  let MSG = null;
  async function messaging() {
    if (MSG) return MSG;
    const [app_, msg_] = await Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-messaging.js')]);
    if (!(await msg_.isSupported())) throw new Error('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน');
    const app = app_.getApps().find(a => a.name === 'push') || app_.initializeApp(C.firebase, 'push');
    const reg = await waitActive(await navigator.serviceWorker.register(SW, { scope: SCOPE }));
    const m = msg_.getMessaging(app);
    msg_.onMessage(m, p => { const d = p.data || p.notification || {}; toast((d.title ? d.title + ': ' : '') + (d.body || ''), 7000); });   /* ขณะเปิดแอปอยู่ */
    MSG = { m, reg, getToken: msg_.getToken, deleteToken: msg_.deleteToken }; return MSG;
  }

  /* silent = true: ไม่ขอสิทธิ์ใหม่ แค่ต่ออายุ token ที่เคยอนุญาตไว้ */
  async function enable(silent) {
    const sid = A.sid(); if (!sid) throw new Error('ใช้ได้เฉพาะบัญชีนักเรียน');
    if (!C.vapidKey) throw new Error('ยังไม่ได้ใส่ vapidKey ใน config.js');
    if (!supported()) throw new Error(ios() && !standalone() ? 'iPhone/iPad ต้องกด “เพิ่มไปยังหน้าจอโฮม” แล้วเปิดแอปจากไอคอนก่อน' : 'เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน');
    let perm = Notification.permission;
    if (perm === 'default' && !silent) perm = await Notification.requestPermission();   /* เรียกก่อน await อื่น เพื่อให้ยังนับเป็นการกดของผู้ใช้ */
    if (perm !== 'granted') throw new Error(perm === 'denied' ? 'การแจ้งเตือนถูกปิดกั้น — เปิดได้ที่ตั้งค่าของเบราว์เซอร์/เครื่อง' : 'ยังไม่ได้อนุญาตการแจ้งเตือน');
    const { m, reg, getToken } = await messaging();
    const token = await getToken(m, { vapidKey: C.vapidKey, serviceWorkerRegistration: reg });
    if (!token) throw new Error('ขอ token ไม่สำเร็จ');
    const key = await sha(token);
    await B.set('/people/' + sid + '/fcm/' + key, { t: token, at: Date.now(), p: standalone() ? 'pwa' : 'web', ua: navigator.userAgent.slice(0, 120) });
    try { localStorage.setItem(KEY, key); } catch (e) { /* ignore */ }
    return token;
  }
  async function disable() {
    const sid = A.sid(); let key = ''; try { key = localStorage.getItem(KEY) || ''; } catch (e) { /* ignore */ }
    try { const { m, deleteToken } = await messaging(); await deleteToken(m); } catch (e) { /* ignore */ }
    if (sid && key) await B.remove('/people/' + sid + '/fcm/' + key); try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  }

  /* ---------- การ์ดบนหน้าหลัก (นักเรียน) ---------- */
  A.HOME.push({ order: 97, html: () => {
    if (!A.sid() || A.teacher()) return '';
    let body, st = ('Notification' in window) ? Notification.permission : 'unsupported';
    if (!supported()) body = '<div class="muted">' + (ios() && !standalone() ? 'บน iPhone/iPad: กดปุ่มแชร์ › “เพิ่มไปยังหน้าจอโฮม” แล้วเปิดแอปจากไอคอนนั้น (ต้องใช้ iOS 16.4 ขึ้นไป) จึงจะเปิดการแจ้งเตือนได้' : 'เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน') + '</div>';
    else if (st === 'granted') body = '<div class="row wrap">' + A.chip('เปิดการแจ้งเตือนแล้ว', 'ok') + '<button class="btn ghost sm" data-act="pushOff">ปิดการแจ้งเตือน</button></div>';
    else if (st === 'denied') body = '<div class="muted">การแจ้งเตือนถูกปิดกั้นไว้ — เปิดได้ที่ตั้งค่าของเบราว์เซอร์หรือเครื่อง แล้วกลับมากดใหม่</div>';
    else body = '<div class="muted" style="margin-bottom:8px">รับแจ้งเตือนนัดซ้อม กิจกรรม และประกาศจากครู</div><button class="btn sm" data-act="pushOn">เปิดการแจ้งเตือน</button>';
    return '<section class="card"><div class="lb">การแจ้งเตือน</div>' + body + '</section>';
  } });
  Object.assign(A.ACT, {
    pushOn: async () => { try { await enable(false); toast('เปิดการแจ้งเตือนแล้ว', 3000); } catch (e) { console.error(e); toast('เปิดการแจ้งเตือนไม่สำเร็จ: ' + (e.message || e), 7000); } A.rerender(); },
    pushOff: async () => { try { await disable(); toast('ปิดการแจ้งเตือนแล้ว'); } catch (e) { toast('ปิดไม่สำเร็จ: ' + (e.message || e), 5000); } A.rerender(); }
  });
  /* ต่ออายุ token อัตโนมัติ 1 ครั้งต่อการเปิดแอป (เฉพาะคนที่เคยอนุญาตแล้ว) */
  let done = false;
  setInterval(() => { if (done || !A.sid() || A.teacher() || !('Notification' in window) || Notification.permission !== 'granted' || !C.vapidKey || A.STATUS.online === false) return; done = true; enable(true).catch(e => console.warn('push refresh', e)); }, 4000);
})();
