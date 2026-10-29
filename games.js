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

  /* ---------- รุ่น 3.7: เหรียญจากเกม (อ่านความคืบหน้าที่เกมเก็บไว้ในเครื่องนี้) ---------- */
  const J = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') || d || {}; } catch (e) { return d || {}; } };
  const BADGES = [
    { n: 'ปราบปีศาจเสียงเพี้ยน', d: 'จบตำนานสรรพวาทิต บทที่ 1', px: 'maha', bg: '#5a3452', ok: () => !!J('spw_pisat_v1').done },
    { n: 'ระนาดครบ 21 ลูก', d: 'จบตำนานสรรพวาทิต บทที่ 2', px: 'che', bg: '#2a6fd0', ok: () => !!J('spw_pisat_c2').done },
    { n: 'กลองหลวงดังก้อง', d: 'จบตำนานสรรพวาทิต บทที่ 3', px: 'luwa', bg: '#c0602a', ok: () => !!J('spw_pisat_c3').done },
    { n: 'ตำนานภาคแรก', d: 'เล่นตำนานสรรพวาทิตจบภาคแรก', px: 'tang', bg: '#d0a030', ok: () => { try { return localStorage.getItem('spw_pisat_fin') === '1'; } catch (e) { return false; } } },
    { n: 'หูทอง', d: 'หูทองสรรพวาทิต ระดับหูทอง ได้ 8/10 ขึ้นไป', px: 'kaimuk', bg: '#8a2a2a', ok: () => Object.entries(J('sapphawathit_hoo').best || {}).some(([k, v]) => /2$/.test(k) && v >= 8) },
    { n: 'นักแห่ครบวง', d: 'ผ่านด่าน “ครบวง” ในเกมแห่กลองหลวง', px: 'jao', bg: '#2a8a5a', ok: () => !!(J('sapphawathit_klongluang').pass || {})[2] },
    { n: 'ยอดมือกลองหลวง', d: 'ผ่านด่าน “แห่ยาวเร่งจังหวะ”', px: 'pob', bg: '#6a47a8', ok: () => !!(J('sapphawathit_klongluang').pass || {})[4] },
    { n: 'เจ็ดเสียงครบวง', d: 'จบตำนานสรรพวาทิต ภาค เจ็ดเสียงที่หายไปในแม่สอด', px: 'mateo', bg: '#1e2a57', ok: () => !!J('spw_pisat2').fin },
    { n: 'นักถอดรหัสเสียง', d: 'บันทึกผลถอดรหัสเสียงกลองหลวงอย่างน้อย 1 วง', px: 'waen', bg: '#3a3a4a', ok: () => J('sapphawathit_klongscan', []).length > 0 }
  ];
  const medalCache = {};
  function badgesHTML() {
    if (!window.PX) return '';
    const got = BADGES.map(x => { try { return x.ok(); } catch (e) { return false; } }), n = got.filter(Boolean).length;
    return '<section class="card"><div class="lb">เหรียญจากเกม · ได้ ' + n + '/' + BADGES.length + ' <span class="muted" style="font-weight:400;font-size:13px">(นับจากการเล่นในเครื่องนี้)</span></div><div class="gm-badges">' +
      BADGES.map((x, i) => { const k = x.px + x.bg; if (!medalCache[k]) medalCache[k] = window.PX.avatar(window.PX.PRESETS[x.px], 96, x.bg);
        return '<div class="gm-bd' + (got[i] ? ' on' : '') + '" title="' + esc(x.d) + '"><img alt="" src="' + medalCache[k] + '"><b>' + esc(x.n) + '</b><span>' + (got[i] ? esc(x.d) : '🔒 ' + esc(x.d)) + '</span></div>'; }).join('') + '</div></section>';
  }
  if (!document.getElementById('gm-bd-css')) { const st = document.createElement('style'); st.id = 'gm-bd-css'; st.textContent = '.gm-badges{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px}.gm-bd{text-align:center;font-size:12px;opacity:.55;filter:grayscale(1)}.gm-bd.on{opacity:1;filter:none}.gm-bd img{width:64px;height:64px;border-radius:50%;image-rendering:pixelated;border:3px solid #c9a227;box-shadow:0 0 0 2px rgba(0,0,0,.15)}.gm-bd.on img{border-color:#f2c14e;box-shadow:0 0 0 3px rgba(242,193,78,.35)}.gm-bd b{display:block;font-size:13px;margin-top:4px}.gm-bd span{display:block;color:var(--muted,#888);line-height:1.35}'; document.head.appendChild(st); }

  A.V.games = function () {
    const l = list(); let b = l.length ? badgesHTML() : '';
    if (!l.length) {
      b += '<section class="card" style="text-align:center;padding:32px 16px">' + ic('game', 56) + '<h3 style="margin:10px 0 4px">เกมกำลังจะมาเร็ว ๆ นี้</h3><div class="muted">ครูกำลังเตรียมเกมสนุก ๆ ให้สมาชิกชมรมเล่นและฝึกฝีมือ รอติดตามนะ</div></section>';
      if (A.teacher()) b += '<section class="card"><div class="lb">สำหรับครู: วิธีเพิ่มเกม</div><div class="muted">วางไฟล์เกม (HTML) ไว้ในโฟลเดอร์ <code>games/</code> แล้วเพิ่มรายการที่ <code>config.js</code> › <code>games</code> ดูตัวอย่างและวิธีเพิ่มเกมแบบโค้ด JS ได้ที่หัวไฟล์ <code>games.js</code></div></section>';
    } else b += '<div class="gm-grid">' + l.map(g => '<button class="gm-c" data-act="gamePlay" data-id="' + esc(g.id) + '"><span class="gm-ic">' + ic('game', 30) + '</span><b>' + esc(g.title) + '</b>' + (g.desc ? '<span class="muted">' + esc(g.desc) + '</span>' : '') + '<span class="chip gold">เล่นเลย</span></button>').join('') + '</div>';
    return { title: 'เกม', body: b };
  };
  A.ACT.gamePlay = d => {
    const g = list().find(x => x.id === d.id); if (!g) return;
    const w = modal('<div class="row" style="margin-bottom:8px"><h3 class="grow" style="margin:0">' + esc(g.title) + '</h3><button class="btn ghost sm" data-close>ปิดเกม</button></div><div class="gm-host"></div>', { full: true, sticky: true }); w.classList.add('gm-modal');
    const host = $('.gm-host', w);
    const cl = $('[data-close]', w); if (cl) cl.addEventListener('click', () => setTimeout(() => { try { A.rerender(); } catch (e) { } }, 60));
    if (g.src) { const me = (A.members() || {})[A.sid()] || {}, nm = A.teacher() ? 'คุณครู' : (me.first || A.myName() || ''); const url = g.src + (g.src.includes('?') ? '&' : '?') + 'name=' + encodeURIComponent(nm.trim());
      host.innerHTML = '<iframe class="gm-f" src="' + esc(url) + '" title="' + esc(g.title) + '" allow="autoplay; fullscreen; microphone"></iframe>'; }
    else if (typeof g.mount === 'function') { try { g.mount(host, () => w.remove(), { sid: A.sid(), name: A.myName(), club: C.club.id }); } catch (e) { console.error(e); host.textContent = 'เปิดเกมไม่สำเร็จ'; } }
    else host.textContent = 'เกมนี้ยังไม่พร้อมเล่น';
  };
})();
