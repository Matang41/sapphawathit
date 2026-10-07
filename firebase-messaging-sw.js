/* ============================================================
   firebase-messaging-sw.js — รับแจ้งเตือน (Web Push / FCM) ขณะปิดแอปหรืออยู่เบื้องหลัง
   ★ ต้องวางไฟล์นี้ในโฟลเดอร์เดียวกับ index.html (ไม่ใช่ในโฟลเดอร์ย่อย)
   ★ ส่งข้อความแบบ "data-only" (ไม่ใส่ฟิลด์ notification) เพื่อให้แสดงผลเสถียรทั้ง Android และ iOS:
        data: { title, body, url, tag }
   ============================================================ */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  "apiKey": "AIzaSyBLvy5DHuOo1bhmbklOb4B_Hocd7ziq6p4",
  "authDomain": "sapphawathit.firebaseapp.com",
  "databaseURL": "https://sapphawathit-default-rtdb.asia-southeast1.firebasedatabase.app",
  "projectId": "sapphawathit",
  "storageBucket": "sapphawathit.firebasestorage.app",
  "messagingSenderId": "549997282142",
  "appId": "1:549997282142:web:b0283161ff316617b785cf"
});
const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  if (payload.notification) return;   // ถ้ามี notification ในข้อความ เบราว์เซอร์แสดงให้เองแล้ว (กันซ้ำ)
  const d = payload.data || {};
  return self.registration.showNotification(d.title || 'แจ้งเตือนจากชมรม', {
    body: d.body || '',
    icon: 'icons/icon-192.png',
    badge: 'icons/favicon-32.png',
    tag: d.tag || undefined,
    data: { url: d.url || './' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || './', self.registration.scope.replace(/firebase-cloud-messaging-push-scope\/?$/, '')).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if (c.url.split('#')[0] === url.split('#')[0] && 'focus' in c) { if ('navigate' in c) c.navigate(url); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
