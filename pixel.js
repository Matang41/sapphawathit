/* ============================================================
   pixel.js — รุ่น 3.7: ตัวละครพิกเซลสรรพวาทิต
   • PX.sprite(spec, dir, frame)  ภาพตัวละคร 16×24 (เหมือนในเกมตำนานสรรพวาทิต)
   • PX.avatar(spec, size, bg)    รูปโปรไฟล์สี่เหลี่ยม (dataURL PNG)
   • PX.builder(start)            หน้าต่างสร้างอวตาร → Promise<{photo, print, spec}|null>
   • PX.PRESETS                   ตัวละครจากเกม 14 ตัว ใช้เป็นแม่แบบ
   • อวตารที่กด “ใช้รูปนี้” ล่าสุดเก็บไว้ที่ localStorage spw_px_spec ให้เกมภาค 2 ดึงไปใช้
   ============================================================ */
(function () {
  'use strict';
function drawChar(g,s,dir,f){
  const P=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w||1,h||1)};
  const side=dir==='r',up=dir==='u',ch=s.chub?1:0;
  // ขา
  if(!side){const lu=f===1?1:0,ru=f===2?1:0;
    if(s.skirt){P(s.pants,4,18,8,3);P(s.skin,5,21,2,2-lu);P(s.skin,9,21,2,2-ru)}
    else if(s.shorts){P(s.pants,4,19,8,2);P(s.skin,5,21,2,1-lu);P(s.skin,9,21,2,1-ru);P(s.shorts,5,22-lu,2,1);P(s.shorts,9,22-ru,2,1)}
    else{P(s.pants,5,19,3,4-lu);P(s.pants,8,19,3,4-ru)}
    P(s.shoe,5,23-lu,3,1);P(s.shoe,8,23-ru,3,1)}
  else{const a=f===1?1:f===2?-1:0;
    if(s.skirt){P(s.pants,5,18,7,3);P(s.skin,6+a,21,2,2);P(s.skin,8-a,21,2,2)}
    else if(s.shorts){P(s.pants,5,19,7,2);P(s.skin,6+a,21,2,1);P(s.skin,8-a,21,2,1);P(s.shorts,6+a,22,2,1);P(s.shorts,8-a,22,2,1)}
    else{P(s.pants,6+a,19,3,4);P(s.pants,7-a,19,3,4)}
    P(s.shoe,6+a,23,4,1);P(s.shoe,7-a,23,4,1)}
  // ลำตัว
  const tx=side?5:4-ch,tw=side?6+ch:8+2*ch;
  P(s.shirt,tx,12,tw,7);P(s.shade,tx,17,tw,2);
  if(s.tie&&!up&&!side){P(s.collar,6,12,4,1);P(s.tie,7,13,2,4);P(s.tie,7,17,2,1);P(s.shade,tx,12,1,6);P(s.shade,tx+tw-1,12,1,6)}
  if(s.tie&&side){P(s.collar,9,12,2,1);P(s.tie,10,13,1,3)}
  if(s.pocket&&!up&&!side)P(s.pocket,tx+tw-3,13,1,1);
  if(s.polo){if(!up&&!side){P(s.polo,6,12,1,1);P(s.polo,9,12,1,1);P(s.polo,tx,14,1,2);P(s.polo,tx+tw-1,13,1,2)}else P(s.polo,tx+1,13,2,1)}
  if(s.bow&&!up&&!side&&s.skirt){P(s.bow,7,12,2,2)}
  if(s.strap){if(!side){for(let i=0;i<7;i++)P(s.strap,up?tx+1+i:tx+tw-2-i,12+i,1,1);if(!up)P(s.strap,tx-1,17,2,2)}else P(s.strap,8,12,1,6)}
  // แขน
  if(!side){const sw=f===1?1:f===2?-1:0;
    P(s.shirt,tx-1,13+sw,1,4);P(s.skin,tx-1,17+sw,1,1);
    P(s.shirt,tx+tw,13-sw,1,4);P(s.skin,tx+tw,17-sw,1,1)}
  else{const sw=f===1?1:f===2?-1:0;P(s.shade,7+sw,13,2,4);P(s.skin,7+sw,17,2,1)}
  // หัว
  const hx=side?4:4-ch,hw=side?8:8+2*ch;
  P(s.skin,hx,3,hw,9);g.clearRect(hx,3,1,1);g.clearRect(hx+hw-1,3,1,1);g.clearRect(hx,11,1,1);g.clearRect(hx+hw-1,11,1,1);
  P(s.skin,7,11,2,1);
  const hr=s.hair;
  if(up){P(hr,hx,2,hw,9);if(s.hs==='vol'||s.hs==='curly')P(hr,hx-1,1,hw+2,7);if(s.hs==='pony'){P(hr,hx+3,10,2,4);if(s.bow)P(s.bow,hx+2,9,4,1)}if(s.hs==='long')P(hr,hx,10,hw,4);if(s.cap)P(s.cap,hx,1,hw,3);return}
  if(side){
    P(hr,hx,2,hw,3);P(hr,hx,5,4,5);P(hr,hx+4,5,2,1);
    if(s.hs==='vol'){P(hr,hx-1,1,hw+1,5);P(hr,hx+3,6,4,1)}
    if(s.hs==='bang')P(hr,hx+4,5,4,2);
    if(s.hs==='part')P(hr,hx+4,5,3,1);
    if(s.hs==='long')P(hr,hx-1,5,4,8);
    if(s.hs==='curly'){P(hr,hx-1,0,hw+1,5);P(hr,hx+2,0,1,1);P(hr,hx+6,0,1,1);P(hr,hx+4,5,4,1);P('#2e2620',hx+1,1,1,1);P('#2e2620',hx+5,2,1,1)}
    if(s.hs==='pony'){P(hr,hx-2,5,2,5);if(s.bow)P(s.bow,hx-1,4,2,2)}
    P(s.skin,hx+hw,8,1,1);
    P('#1a0c0c',hx+hw-2,8,1,1);if(s.eye==='side')P(hr,hx+hw-3,7,2,1);
    if(s.glass){P(s.glass,hx+hw-3,7,3,1);P(s.glass,hx+hw-3,9,3,1);P(s.glass,hx+hw-3,8,1,1)}
    P('#8a3a32',hx+hw-2,10,2,1);
    if(s.cap){P(s.cap,hx,1,hw,3);P(s.cap,hx+hw-1,3,3,1)}
    return}
  // หน้าตรง
  P(hr,hx,2,hw,3);P(hr,hx,5,1,3);P(hr,hx+hw-1,5,1,3);
  if(s.hs==='vol'){P(hr,hx-1,0,hw+2,5);P(hr,hx-1,5,2,3);P(hr,hx+hw-1,5,2,3);P(hr,hx+1,5,hw-2,1);P(hr,hx+2,6,2,1);P(hr,hx+hw-4,6,2,1)}
  if(s.hs==='bang'){P(hr,hx+1,5,hw-2,1);P(hr,hx+1,6,2,1);P(hr,hx+4,6,1,1);P(hr,hx+hw-4,6,2,1)}
  if(s.hs==='part'){P(hr,hx,1,hw,1);P(hr,hx+1,5,5,1);P(hr,hx+1,6,2,1);P('#3a3448',hx+hw-4,2,1,2)}
  if(s.hs==='short')P(hr,hx+1,5,hw-2,1);
  if(s.hs==='long'){P(hr,hx-1,4,2,9);P(hr,hx+hw-1,4,2,9);P(hr,hx+1,5,hw-2,1)}
  if(s.hs==='curly'){P(hr,hx-1,0,hw+2,5);P(hr,hx-1,5,2,2);P(hr,hx+hw-1,5,2,2);P(hr,hx+1,5,3,1);P(hr,hx+hw-4,5,3,1);P(hr,hx+2,6,1,1);P(hr,hx+hw-3,6,1,1);P('#2e2620',hx+1,1,1,1);P('#2e2620',hx+4,0,1,1);P('#2e2620',hx+hw-2,2,1,1);P(hr,hx-2,2,1,2);P(hr,hx+hw+1,2,1,2)}
  if(s.hs==='pony'){P(hr,hx+1,5,hw-2,1);if(s.bow){P(s.bow,hx+hw-2,1,3,2)}}
  const ex1=hx+2,ex2=hx+hw-3;
  if(s.eye==='side'){P(hr,ex1-1,7,3,1);P(hr,ex2-1,7,3,1);P('#fff',ex1,8,1,1);P('#fff',ex2,8,1,1);P('#1a0c0c',ex1+1,8,1,1);P('#1a0c0c',ex2+1,8,1,1)}
  else{P('#1a0c0c',ex1,8,1,1);P('#1a0c0c',ex2,8,1,1)}
  if(s.glass){P(s.glass,ex1-1,7,3,1);P(s.glass,ex1-1,9,3,1);P(s.glass,ex1-1,8,1,1);P(s.glass,ex1+1,8,1,1);P(s.glass,ex2-1,7,3,1);P(s.glass,ex2-1,9,3,1);P(s.glass,ex2-1,8,1,1);P(s.glass,ex2+1,8,1,1);P(s.glass,ex1+2,8,ex2-ex1-3,1)}
  if(s.blush){P(s.blush,ex1-1,9,1,1);P(s.blush,ex2+1,9,1,1)}
  P(s.eye==='side'?'#7a3a30':'#8a3a32',hx+Math.floor(hw/2)-1,10,2,1);
  if(s.cap){P(s.cap,hx-1,1,hw+2,3);P(s.cap,hx,4,hw,1)}
}
function outline(c){
  const w=c.width,h=c.height,g=c.getContext('2d'),d=g.getImageData(0,0,w,h),a=d.data,o=new Uint8ClampedArray(a);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(a[i+3])continue;
    if((x>0&&a[i-1])||(x<w-1&&a[i+7])||(y>0&&a[i-w*4+3])||(y<h-1&&a[i+w*4+3])){o[i]=27;o[i+1]=16;o[i+2]=32;o[i+3]=255}}
  d.data.set(o);g.putImageData(d,0,0);return c}

  const PRESETS = {
  pob:{skin:'#b97a55',hair:'#17110e',hs:'bang',shirt:'#8b63cc',shade:'#6a47a8',pants:'#2b2a3a',shoe:'#14141a',chub:1,strap:'#ff4f9a',blush:'#c45a50'},
  luwa:{skin:'#d6a07a',hair:'#14100e',hs:'bang',shirt:'#2a6fd0',shade:'#141a2e',pants:'#1a1820',shoe:'#111',polo:'#fff'},
  maha:{skin:'#eab890',hair:'#120e16',hs:'vol',shirt:'#f3f3ee',shade:'#c4c7d4',pants:'#1c2235',shoe:'#0d0d12',eye:'side',pocket:'#3b5bb5'},
  mateo:{skin:'#b07448',hair:'#15100e',hs:'short',shirt:'#f3f3ee',shade:'#c4c7d4',pants:'#b89868',shorts:'#7a3a1a',shoe:'#8a3a22',small:1},
  foo:{skin:'#d9a07a',hair:'#14100e',hs:'curly',shirt:'#1a1820',shade:'#a8326e',pants:'#1a1820',shoe:'#111',polo:'#fff'},
  waen:{skin:'#d9a07a',hair:'#14100e',hs:'short',shirt:'#1a1820',shade:'#a8326e',pants:'#1a1820',shoe:'#111',polo:'#fff',glass:'#a8a8b8'},
  yum:{skin:'#e2ad85',hair:'#15100e',hs:'short',blush:'#d0706a',chub:1,shirt:'#f3f3ee',shade:'#c4c7d4',pants:'#b89868',shorts:'#7a3a1a',shoe:'#8a3a22'},
  che:{skin:'#c98d62',hair:'#15100e',hs:'short',shirt:'#f3f3ee',shade:'#c4c7d4',pants:'#b89868',shorts:'#7a3a1a',shoe:'#8a3a22',chub:1},
  jao:{skin:'#e2ad85',hair:'#15100e',hs:'bang',shirt:'#f3f3ee',shade:'#c4c7d4',pants:'#1c1c22',shoe:'#0d0d12',pocket:'#3b5bb5'},
  captain:{skin:'#f2cfae',hair:'#15100e',hs:'short',shirt:'#f3f3ee',shade:'#c4c7d4',pants:'#2a2a30',shorts:'#7a3a1a',shoe:'#111',pocket:'#3b5bb5'},
  kaimuk:{skin:'#f0c4a0',hair:'#1a1210',hs:'long',shirt:'#f6f4f8',shade:'#d4d0e0',pants:'#24305e',shoe:'#111',skirt:1,glass:'#6a5a8a',chub:1,bow:'#24305e'},
  ing:{skin:'#f2cbb0',hair:'#1a1210',hs:'long',shirt:'#f6f4f8',shade:'#d4d0e0',pants:'#24305e',shoe:'#111',skirt:1,bow:'#24305e'},
  ice:{skin:'#f2cbb0',hair:'#1a1210',hs:'pony',shirt:'#f6f4f8',shade:'#d4d0e0',pants:'#24305e',shoe:'#111',skirt:1,bow:'#3a7ad8'},
  tang:{skin:'#efc8a0',hair:'#14101a',hs:'part',shirt:'#1e2a57',shade:'#151d40',pants:'#1e2a57',shoe:'#0d0d12',glass:'#d8c48e',tie:'#f08a24',collar:'#f4f4f4'}
  };
  const NAMES = { pob: 'พบธรรม', luwa: 'ลู่วา', maha: 'มหาพราหมณ์', mateo: 'มาเตโอ', foo: 'ฟู', waen: 'แว่น', yum: 'จักร', che: 'เช่', jao: 'จ้าว', captain: 'กัปตัน', kaimuk: 'ไข่มุก', ing: 'อิ้ง', ice: 'ไอซ์', tang: 'ครูตังค์' };
  function sprite(spec, dir, f) {
    dir = dir || 'd'; f = f || 0; const c = document.createElement('canvas'); c.width = 16; c.height = 24; const g = c.getContext('2d');
    if (dir === 'l') { g.translate(16, 0); g.scale(-1, 1); }
    if (spec.small) { g.translate(dir === 'l' ? 16 : 0, 2); g.scale(dir === 'l' ? -1 : 1, 1); }
    drawChar(g, spec, dir === 'l' ? 'r' : dir, f); g.setTransform(1, 0, 0, 1, 0, 0); return outline(c);
  }
  /* รูปโปรไฟล์: ครอปหัวถึงอกจากภาพ 16×24 แล้วขยายแบบพิกเซลคม */
  function avatarCanvas(spec, size, bg) {
    size = size || 160; const s = sprite(spec, 'd', 0), c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
    const BG = bg || spec.bg || '#5a3452'; const gr = g.createRadialGradient(size / 2, size * .35, size * .1, size / 2, size / 2, size * .75);
    gr.addColorStop(0, shade(BG, 1.35)); gr.addColorStop(1, BG); g.fillStyle = gr; g.fillRect(0, 0, size, size);
    g.imageSmoothingEnabled = false; const k = size / 17; g.drawImage(s, 0, 0, 16, 17, (size - 16 * k) / 2, size * .06, 16 * k, 17 * k); return c;
  }
  function shade(hex, f) { const n = parseInt(hex.slice(1), 16); const ch = (v) => Math.max(0, Math.min(255, Math.round(v * f))); return 'rgb(' + ch(n >> 16) + ',' + ch((n >> 8) & 255) + ',' + ch(n & 255) + ')'; }
  const avatar = (spec, size, bg, jpg) => avatarCanvas(spec, size, bg).toDataURL(jpg ? 'image/jpeg' : 'image/png', .9);

  /* ---------- ตัวเลือกในหน้าต่างสร้างอวตาร ---------- */
  const SKIN = ['#f2cfae', '#eab890', '#e2ad85', '#d6a07a', '#c98d62', '#b97a55', '#b07448', '#8e5a38'];
  const HAIR = [['short', 'สั้น'], ['bang', 'หน้าม้า'], ['vol', 'ฟู'], ['curly', 'หยิก'], ['part', 'แสกข้าง'], ['long', 'ยาว'], ['pony', 'หางม้า']];
  const HCOL = ['#120e16', '#2a1a12', '#5a3a22', '#8a5a34', '#d8d4cc'];
  const OUTFIT = [
    ['ม.ต้น ชาย', { shirt: '#f3f3ee', shade: '#c4c7d4', pants: '#b89868', shorts: '#7a3a1a', shoe: '#8a3a22', skirt: 0, polo: 0, strap: 0, tie: 0, collar: 0 }],
    ['ม.ปลาย ชาย', { shirt: '#f3f3ee', shade: '#c4c7d4', pants: '#1c1c22', shorts: 0, shoe: '#0d0d12', pocket: '#3b5bb5', skirt: 0, polo: 0, strap: 0, tie: 0, collar: 0 }],
    ['นักเรียนหญิง', { shirt: '#f6f4f8', shade: '#d4d0e0', pants: '#24305e', shorts: 0, shoe: '#111', skirt: 1, bow: '#24305e', polo: 0, strap: 0, tie: 0, collar: 0 }],
    ['เสื้อชมรม', { shirt: '#8b63cc', shade: '#6a47a8', pants: '#2b2a3a', shorts: 0, shoe: '#14141a', skirt: 0, polo: 0, strap: 0, tie: 0, collar: 0 }],
    ['พื้นเมือง', { shirt: '#1a1820', shade: '#a8326e', pants: '#1a1820', shorts: 0, shoe: '#111', skirt: 0, polo: '#fff', strap: 0, tie: 0, collar: 0 }],
    ['เสื้อโปโลน้ำเงิน', { shirt: '#2a6fd0', shade: '#141a2e', pants: '#1a1820', shorts: 0, shoe: '#111', skirt: 0, polo: '#fff', strap: 0, tie: 0, collar: 0 }],
    ['สูทครู', { shirt: '#1e2a57', shade: '#151d40', pants: '#1e2a57', shorts: 0, shoe: '#0d0d12', skirt: 0, polo: 0, strap: 0, tie: '#f08a24', collar: '#f4f4f4' }]
  ];
  const BGS = ['#5a3452', '#2a6fd0', '#2a8a5a', '#c0602a', '#8a2a2a', '#3a3a4a', '#d0a030'];

  function builder(start) {
    return new Promise(res => {
      const M = window.MC; let spec = Object.assign({}, start || PRESETS.maha); spec.bg = spec.bg || '#5a3452';
      const sw = (list, key, cur, lab) => '<div class="px-sw">' + list.map(v => '<button type="button" data-k="' + key + '" data-v="' + v + '" title="' + (lab || '') + '" style="background:' + v + '" class="' + (v === cur ? 'on' : '') + '"></button>').join('') + '</div>';
      const html = '<h3 style="margin:0 0 8px">อวตารพิกเซล</h3><div class="px-wrap"><canvas class="px-prev" width="160" height="160"></canvas><canvas class="px-full" width="64" height="96"></canvas></div>' +
        '<div class="px-lb">เริ่มจากตัวละครในเกม</div><div class="px-pre">' + Object.keys(PRESETS).map(k => '<button type="button" data-pre="' + k + '"><img alt="" src="' + avatar(PRESETS[k], 48, '#3a2240') + '"><span>' + NAMES[k] + '</span></button>').join('') + '</div>' +
        '<div class="px-lb">สีผิว</div><div data-sw="skin"></div><div class="px-lb">ทรงผม</div><div class="px-chips" data-ch="hs"></div><div data-sw="hair"></div>' +
        '<div class="px-lb">ชุด</div><div class="px-chips" data-ch="outfit"></div>' +
        '<div class="px-lb">อื่น ๆ</div><div class="px-chips"><label><input type="checkbox" data-t="glass"> แว่นตา</label><label><input type="checkbox" data-t="chub"> แก้มป่อง</label><label><input type="checkbox" data-t="blush"> แก้มแดง</label></div>' +
        '<div class="px-lb">สีพื้นหลัง</div><div data-sw="bg"></div>' +
        '<div class="row" style="margin-top:14px;gap:8px;display:flex"><button type="button" class="btn ghost grow" data-x>ยกเลิก</button><button type="button" class="btn grow" data-ok>ใช้รูปนี้</button></div>';
      let w, own = false;
      if (M && M.modal) w = M.modal(html, { sticky: true });
      else { own = true; w = document.createElement('div'); w.className = 'px-ov'; w.innerHTML = '<div class="px-card">' + html + '</div>'; document.body.appendChild(w); }
      const q = s => w.querySelector(s), qa = s => Array.from(w.querySelectorAll(s));
      function paint() {
        const p = q('.px-prev'), g = p.getContext('2d'); g.clearRect(0, 0, 160, 160); g.drawImage(avatarCanvas(spec, 160), 0, 0);
        const f = q('.px-full'), h = f.getContext('2d'); h.clearRect(0, 0, 64, 96); h.imageSmoothingEnabled = false; h.drawImage(sprite(spec), 0, 0, 64, 96);
        q('[data-sw=skin]').innerHTML = sw(SKIN, 'skin', spec.skin); q('[data-sw=hair]').innerHTML = sw(HCOL, 'hair', spec.hair); q('[data-sw=bg]').innerHTML = sw(BGS, 'bg', spec.bg);
        q('[data-ch=hs]').innerHTML = HAIR.map(([v, n]) => '<button type="button" data-hs="' + v + '" class="' + (spec.hs === v ? 'on' : '') + '">' + n + '</button>').join('');
        q('[data-ch=outfit]').innerHTML = OUTFIT.map(([n, o], i) => '<button type="button" data-of="' + i + '" class="' + (o.shirt === spec.shirt && !!o.skirt === !!spec.skirt ? 'on' : '') + '">' + n + '</button>').join('');
        qa('[data-t]').forEach(c => c.checked = !!spec[c.dataset.t]);
      }
      w.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.pre) { const bg = spec.bg; spec = Object.assign({}, PRESETS[b.dataset.pre], { bg }); }
        else if (b.dataset.k) spec[b.dataset.k] = b.dataset.v;
        else if (b.dataset.hs) spec.hs = b.dataset.hs;
        else if (b.dataset.of != null) { Object.assign(spec, OUTFIT[+b.dataset.of][1]); }
        else if (b.hasAttribute('data-x')) { close(); res(null); return; }
        else if (b.hasAttribute('data-ok')) { try { localStorage.setItem('spw_px_spec', JSON.stringify(spec)); } catch (x) { } const out = { photo: avatar(spec, 160, null, 1), print: avatar(spec, 640, null, 1), spec: Object.assign({}, spec) }; close(); res(out); return; }
        else return;
        Object.keys(spec).forEach(k => { if (spec[k] === 0) delete spec[k]; }); paint();
      });
      w.addEventListener('change', e => { const t = e.target.dataset.t; if (!t) return; spec[t] = e.target.checked ? (t === 'glass' ? '#a8a8b8' : t === 'blush' ? '#d0706a' : 1) : 0; if (!e.target.checked) delete spec[t]; paint(); });
      function close() { w.remove(); }
      paint();
    });
  }
  /* สไตล์ของหน้าต่าง (ใส่ครั้งเดียว) */
  const css = '.px-wrap{display:flex;gap:14px;align-items:flex-end;justify-content:center}.px-prev{width:120px;height:120px;border-radius:50%;image-rendering:pixelated}.px-full{width:64px;height:96px;image-rendering:pixelated}' +
    '.px-lb{font-weight:600;margin:12px 0 6px;font-size:14px}.px-pre{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}.px-pre button{flex:none;border:1px solid rgba(127,127,127,.3);background:none;border-radius:12px;padding:4px;display:flex;flex-direction:column;align-items:center;font-size:11px;width:62px;cursor:pointer;color:inherit}.px-pre img{width:44px;height:44px;border-radius:50%;image-rendering:pixelated}' +
    '.px-sw{display:flex;gap:6px;flex-wrap:wrap}.px-sw button{width:30px;height:30px;border-radius:50%;border:2px solid rgba(127,127,127,.35);cursor:pointer}.px-sw button.on{border-color:currentColor;box-shadow:0 0 0 2px rgba(242,193,78,.8)}' +
    '.px-chips{display:flex;gap:6px;flex-wrap:wrap}.px-chips button,.px-chips label{border:1px solid rgba(127,127,127,.35);background:none;border-radius:99px;padding:5px 11px;font-size:13px;cursor:pointer;color:inherit}.px-chips button.on{background:#f2c14e;color:#3b2205;border-color:#f2c14e}' +
    '.px-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:999}.px-card{background:#2b1628;color:#fff6e0;border-radius:16px;padding:16px;max-width:420px;width:92%;max-height:90vh;overflow:auto}';
  if (typeof document !== 'undefined' && !document.getElementById('px-css')) { const st = document.createElement('style'); st.id = 'px-css'; st.textContent = css; document.head.appendChild(st); }
  window.PX = { sprite, avatar, avatarCanvas, builder, PRESETS, NAMES, SKIN, HAIR, HCOL, OUTFIT, BGS };
})();
