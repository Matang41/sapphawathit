/* ============================================================
   games.js — รุ่น 3.1: เมนูเกม (เตรียมไว้สำหรับเกมที่ครูสร้างในอนาคต)

   วิธีเพิ่มเกม — เลือกอย่างใดอย่างหนึ่ง
   1) เกมเป็นไฟล์ HTML แยก (วางไว้ในโฟลเดอร์ games/) แล้วเพิ่มรายการใน config.js › games:
        { id: 'rhythm', title: 'ชื่อเกม', desc: 'คำอธิบายสั้น ๆ', src: 'games/rhythm.html', clubs: ['spw'] }   // clubs ไม่ใส่ = ทุกชมรม
   2) เกมเป็นโค้ด JS ที่ฝังในแอป (ไฟล์ .js ใหม่ที่โหลดหลัง games.js):
        APP.GAMES.push({ id: 'quiz', title: 'ควิซ', desc: '…', mount: (host, close, user) => { host.innerHTML = '…'; } })
      host = กล่องที่ใส่เกมได้ · close() = ปิดเกม · user = { sid, name, club }
   ============================================================ */
(function () {
  'use strict';
  const M = window.MC, A = window.APP, C = M.C;
  const { $, esc, modal } = M; const { ic, chip } = A;
  Object.assign(A.ICON, { game: '<rect x="3" y="8" width="18" height="10" rx="4"/><path d="M8 11v4M6 13h4M16 12.5h.01M18 14.5h.01"/>' });
  A.GAMES = A.GAMES || [];
  A.NAVS.push({ id: 'games', label: 'เกม', icon: 'game', order: 37 });
  const list = () => (C.games || []).concat(A.GAMES).filter(g => g && g.id && g.title && (!g.clubs || g.clubs.includes(C.club.id)));

  A.V.games = function () {
    const l = list(); let b = '';
    if (!l.length) {
      b += '<section class="card" style="text-align:center;padding:32px 16px">' + ic('game', 56) + '<h3 style="margin:10px 0 4px">เกมกำลังจะมาเร็ว ๆ นี้</h3><div class="muted">ครูกำลังเตรียมเกมสนุก ๆ ให้สมาชิกชมรมเล่นและฝึกฝีมือ รอติดตามนะ</div></section>';
      if (A.teacher()) b += '<section class="card"><div class="lb">สำหรับครู: วิธีเพิ่มเกม</div><div class="muted">วางไฟล์เกม (HTML) ไว้ในโฟลเดอร์ <code>games/</code> แล้วเพิ่มรายการที่ <code>config.js</code> › <code>games</code> ดูตัวอย่างและวิธีเพิ่มเกมแบบโค้ด JS ได้ที่หัวไฟล์ <code>games.js</code></div></section>';
    } else b += '<div class="gm-grid">' + l.map(g => '<button class="gm-c" data-act="gamePlay" data-id="' + esc(g.id) + '"><span class="gm-ic">' + ic('game', 30) + '</span><b>' + esc(g.title) + '</b>' + (g.desc ? '<span class="muted">' + esc(g.desc) + '</span>' : '') + '<span class="chip gold">เล่นเลย</span></button>').join('') + '</div>';
    return { title: 'เกม', body: b };
  };
  A.ACT.gamePlay = d => {
    const g = list().find(x => x.id === d.id); if (!g) return;
    const w = modal('<div class="row" style="margin-bottom:8px"><h3 class="grow" style="margin:0">' + esc(g.title) + '</h3><button class="btn ghost sm" data-close>ปิดเกม</button></div><div class="gm-host"></div>', { full: true, sticky: true });
    const host = $('.gm-host', w);
    if (g.src) host.innerHTML = '<iframe class="gm-f" src="' + esc(g.src) + '" title="' + esc(g.title) + '" allow="autoplay; fullscreen"></iframe>';
    else if (typeof g.mount === 'function') { try { g.mount(host, () => w.remove(), { sid: A.sid(), name: A.myName(), club: C.club.id }); } catch (e) { console.error(e); host.textContent = 'เปิดเกมไม่สำเร็จ'; } }
    else host.textContent = 'เกมนี้ยังไม่พร้อมเล่น';
  };
})();
