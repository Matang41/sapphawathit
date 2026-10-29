/* ====================================================================
   ตำนานสรรพวาทิต ภาค เจ็ดเสียงที่หายไปในแม่สอด — แกนเกม (core.js)
   จอ 480–600×270 · ตัวละครด้านข้าง 32×48 · เสียงและจังหวะฉิ่ง–ฉับ · ผู้เล่น ทีม ศัตรู บอส
   ฉาก (art.js) และเนื้อเรื่อง (stages.js) เรียกใช้ฟังก์ชันในไฟล์นี้
   พัฒนาโดย นายนนทพัทธ์ วงค์มูล 2026
   ==================================================================== */
'use strict';
let W=480;const H=270,GY=230,WMAX=600;
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const cv=$('#cv'),g=cv.getContext('2d');cv.width=W;cv.height=H;
const ui=$('#ui'),ug=ui.getContext('2d');
let SC=1,DPR=1;
const isTouch=()=>document.body.classList.contains('touch');
if((window.matchMedia&&matchMedia('(pointer:coarse)').matches)||'ontouchstart'in window)document.body.classList.add('touch');
function fit(){const vw=innerWidth,vh=innerHeight;W=Math.round(clamp(H*vw/vh,480,WMAX));if(cv.width!==W){cv.width=W;g.imageSmoothingEnabled=false}
  SC=Math.min(vw/W,vh/H);const st=$('#stage');st.style.width=Math.floor(W*SC)+'px';st.style.height=Math.floor(H*SC)+'px';
  DPR=Math.min(2.5,window.devicePixelRatio||1);ui.width=Math.round(W*SC*DPR);ui.height=Math.round(H*SC*DPR);
  $('#rot').classList.toggle('on',isTouch()&&vh>vw)}
addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,200));
function mk(w,h){const c=document.createElement('canvas');c.width=Math.max(1,w|0);c.height=Math.max(1,h|0);const x=c.getContext('2d');x.imageSmoothingEnabled=false;return [c,x]}
function hex(h){const n=parseInt(h.slice(1),16);return [n>>16,(n>>8)&255,n&255]}
function sh(h,f){if(!h||h[0]!=='#')return h;const [r,gg,b]=hex(h);const c=v=>Math.max(0,Math.min(255,Math.round(v*f)));return 'rgb('+c(r)+','+c(gg)+','+c(b)+')'}
const R=(G,c,x,y,w,h)=>{G.fillStyle=c;G.fillRect(x|0,y|0,w||1,h||1)};
function limb(G,x0,y0,x1,y1,w,c){G.fillStyle=c;const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));for(let i=0;i<=n;i++)G.fillRect(Math.round(x0+(x1-x0)*i/n-w/2),Math.round(y0+(y1-y0)*i/n-w/2),w,w)}
function disc(G,c,x,y,r){G.fillStyle=c;G.beginPath();G.arc(x,y,r,0,7);G.fill()}
function outline(c,col){const w=c.width,h=c.height,G=c.getContext('2d'),d=G.getImageData(0,0,w,h),a=d.data,o=new Uint8ClampedArray(a);const [r,gg,b]=hex(col||'#1b1020');
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(a[i+3])continue;if((x>0&&a[i-1])||(x<w-1&&a[i+7])||(y>0&&a[i-w*4+3])||(y<h-1&&a[i+w*4+3])){o[i]=r;o[i+1]=gg;o[i+2]=b;o[i+3]=255}}
  d.data.set(o);G.putImageData(d,0,0);return c}
function seeded(s){return ()=>{s=(s*16807)%2147483647;return (s-1)/2147483646}}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ====================================================================
   บันทึก
   ==================================================================== */
const KEY='spw_pisat2',LATK='sapphawathit_audio_lat';
let SAVE=loadSave();
function loadSave(){let s={};try{s=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}
  return Object.assign({prog:1,done:{},pool:[],team:[],stars:{},mat:{},up:{},notes:[],lies:[],unity:20,best:{},mute:0,fin:0},s)}
const store=()=>{try{localStorage.setItem(KEY,JSON.stringify(SAVE))}catch(e){}};
const userLat=()=>{try{return +(localStorage.getItem(LATK)||0)}catch(e){return 0}};
const appSpec=()=>{try{const s=JSON.parse(localStorage.getItem('spw_px_spec'));return s&&s.skin?s:null}catch(e){return null}};

/* ====================================================================
   เสียง จังหวะฉิ่ง–ฉับ และเพลงประจำฉาก
   ==================================================================== */
let AC=null,MASTER=null,MUS=null,SFX=null;
let BPM=104,BEAT=60/BPM,beatT0=0,nextBeat=0;const perf0=performance.now()/1000;
let MUSIC=null; // ฟังก์ชันเพลงของฉาก (k,t,chab)
let musicOn=true,chingOn=true;
function audio(){
  if(AC){if(AC.state==='suspended')AC.resume();return}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  AC=new C();MASTER=AC.createGain();MASTER.gain.value=SAVE.mute?0:1;MASTER.connect(AC.destination);
  MUS=AC.createGain();MUS.gain.value=.6;MUS.connect(MASTER);SFX=AC.createGain();SFX.connect(MASTER);
  if(window.TS)TS.init(AC,SFX);if(window.TS2)TS2.init(AC,SFX);beatT0=AC.currentTime+.3;nextBeat=0}
const now=()=>AC?AC.currentTime:performance.now()/1000-perf0;
const lat=()=>AC?Math.max(0,(AC.outputLatency||0)+(AC.baseLatency||0)+userLat()/1000):0;
function setTempo(bpm){BPM=bpm;BEAT=60/bpm;beatT0=now()+.25;nextBeat=0}
/* d = ห่างจากจังหวะใกล้สุด (วินาที) · chab = จังหวะนั้นเป็นฉับ (จังหวะคี่) · ph = ตำแหน่งในจังหวะ 0–1 */
function beat(){const x=(now()-lat()-beatT0)/BEAT,k=Math.round(x);return {d:(x-k)*BEAT,k,chab:((k%2)+2)%2===1,ph:x-Math.floor(x),x}}
const nb=()=>{const t=now(),k=Math.ceil((t-beatT0)/BEAT+.01);return beatT0+k*BEAT};
function sched(){
  if(!AC)return;const t1=AC.currentTime+.18;
  while(beatT0+nextBeat*BEAT<t1){const k=nextBeat,t=beatT0+k*BEAT,chab=k%2===1;
    if(chingOn&&window.TS&&t>AC.currentTime-.02)TS.ching(!chab,t,chab? .3:.22,MUS);
    if(musicOn&&MUSIC&&window.TS2&&TS2.ready()&&t>AC.currentTime-.02)try{MUSIC(k,t,chab)}catch(e){}
    nextBeat++}
}
function sfx(fn){if(AC&&window.TS2)try{fn(AC.currentTime)}catch(e){}}
/* ปัตวาย่ง (กลองวงพม่า) สังเคราะห์: หนังขึงเสียงตกระดับ + เสียงกระทบ — ไม่มีเสียงอัดจริง */
const PATF=[196,220,262,294,330,392,440,523];
function patwaing(i,t,v,out){if(!AC)return;t=Math.max(t,AC.currentTime);const f=PATF[((i%8)+8)%8]*(i>=8?2:1);v=(v==null?1:v)*.5;
  const o=AC.createOscillator(),gg=AC.createGain();o.type='sine';o.frequency.setValueAtTime(f*1.35,t);o.frequency.exponentialRampToValueAtTime(f,t+.04);
  gg.gain.setValueAtTime(0,t);gg.gain.linearRampToValueAtTime(v,t+.004);gg.gain.exponentialRampToValueAtTime(.001,t+.32);o.connect(gg);gg.connect(out||MUS);o.start(t);o.stop(t+.35);
  const o2=AC.createOscillator(),g2=AC.createGain();o2.type='triangle';o2.frequency.value=f*2.3;g2.gain.setValueAtTime(v*.25,t);g2.gain.exponentialRampToValueAtTime(.001,t+.08);o2.connect(g2);g2.connect(out||MUS);o2.start(t);o2.stop(t+.1)}

/* ====================================================================
   ตัวละครด้านข้าง 32×48 (หันขวา) + เครื่องดนตรีที่ถือ
   ==================================================================== */
const SW=32,SH=48;
const RUN=[[[6,0],[-5,2],0],[[3,0],[-2,4],-1],[[-2,1],[3,4],-1],[[-5,2],[6,0],0],[[-2,4],[3,0],-1],[[3,4],[-2,1],-1]];
function drawSide(G,s,pose,f,wp){
  wp=wp||'mallet';
  const sm=s.small?2:0,ch=s.chub?1:0,skin=s.skin,skinD=sh(s.skin,.82),hr=s.hair||'#15100e';
  let bob=0,F=[2,0],B=[-2,0],hand=[2,9],handF=[-2,9],mal=null,hurt=pose==='hurt',lean=0,mouth=0;
  if(pose==='idle'){bob=f?1:0;hand=[2,10-bob];handF=[-2,10-bob];mal=[.95,1.9]}
  else if(pose==='run'){const r=RUN[f%6];F=r[0];B=r[1];bob=r[2];const sw=-F[0]*.7;hand=[2+sw,9];handF=[-2-sw,9];mal=[.95,1.6+sw*.06]}
  else if(pose==='jump'){if(f===0){F=[4,4];B=[-3,2];hand=[5,-3];handF=[-5,2];mal=[1,-.9]}else{F=[3,0];B=[-4,3];hand=[6,3];handF=[-5,5];mal=[1,.5]}}
  else if(pose==='atk'){F=[5,0];B=[-5,0];if(f===0){hand=[-3,-6];handF=[-4,6];mal=[1,-2.3];lean=-1}else if(f===1){hand=[9,1];handF=[-3,7];mal=[1,.12];bob=1;lean=1;mouth=1}else{hand=[7,6];handF=[-3,7];mal=[1,1.15];bob=1}}
  else if(pose==='play'){F=[2,0];B=[-2,0];hand=[6,f?2:4];handF=[3,f?5:3];mal=[1,f? .3:.9];bob=f?1:0}
  else if(pose==='wai'){F=[1,0];B=[-1,0];hand=[6,-2];handF=[5,-2];bob=1;mal=null}
  else if(hurt){F=[3,0];B=[-3,0];hand=[-5,-1];handF=[-5,3];lean=-1;mal=[1,-1.6]}
  if(wp==='flute'||wp==='pi'){if(pose==='atk'&&f>0){hand=[7,-6];handF=[3,-6]}}
  if(wp==='sor'&&pose==='atk'){hand=[f===1?10:4,2];handF=[4,-2]}
  if(wp==='chab'&&pose==='atk'){hand=[f===1?9:3,f===1?-1:-3];handF=[f===1?5:4,f===1?2:-3]}
  const U=sm+bob,hipY=33+sm,hy=2+U,ty=19+U,tx=11-ch+lean,tw=11+2*ch;
  if(s.hs==='long')R(G,hr,6+lean,hy+3,6,20-sm);
  const leg=(hx,[dx,lift],dark)=>{const ax=hx+dx,ay=43-lift,kx=(hx+ax)/2+(lift>0?2:0),ky=(hipY+ay)/2;const P=dark?sh(s.pants,.78):s.pants,K=dark?sh(skin,.85):skin;
    if(s.skirt){limb(G,hx,hipY+2,kx,ky,3,K);limb(G,kx,ky,ax,ay,3,K);R(G,dark?'#d8d8dc':'#f4f4f6',ax-1,ay-1,3,2)}
    else if(s.shorts){limb(G,hx,hipY,kx,ky,4,P);limb(G,kx,ky,ax,ay,3,K);R(G,dark?sh(s.shorts,.8):s.shorts,ax-1,ay-1,3,2);R(G,P,hx-2,hipY,5,4)}
    else{limb(G,hx,hipY,kx,ky,4,P);limb(G,kx,ky,ax,ay,4,P)}
    const S=dark?sh(s.shoe,.8):s.shoe;R(G,S,ax-2,ay+1,7,2);R(G,S,ax-1,ay,5,1)};
  leg(14,B,1);
  const shX=15+lean,shY=ty+3;
  limb(G,shX,shY,shX+handF[0]*.5,shY+handF[1]*.5,3,sh(s.shirt,.78));limb(G,shX+handF[0]*.5,shY+handF[1]*.5,shX+handF[0],shY+handF[1],3,skinD);
  if(wp==='chab')drawChab(G,shX+handF[0],shY+handF[1],1);
  leg(17,F,0);
  R(G,s.shirt,tx,ty,tw,14-sm);R(G,s.shade,tx,ty+11-sm,tw,3);R(G,sh(s.shirt,.86),tx,ty,1,12-sm);
  if(s.skirt){G.fillStyle=s.pants;G.beginPath();G.moveTo(tx,ty+11-sm);G.lineTo(tx+tw,ty+11-sm);G.lineTo(tx+tw+2,ty+19-sm);G.lineTo(tx-2,ty+19-sm);G.closePath();G.fill();R(G,sh(s.pants,.8),tx+3,ty+13-sm,1,6);R(G,sh(s.pants,.8),tx+7,ty+13-sm,1,6)}
  else if(!s.shorts)R(G,sh(s.pants,.7),tx,ty+13-sm,tw,1);
  if(s.polo){R(G,s.polo,tx+4,ty,5,1);R(G,s.polo,tx+8,ty+1,1,3)}
  if(s.tie){R(G,s.collar||'#f4f4f4',tx+5,ty,5,1);R(G,s.tie,tx+tw-2,ty+1,2,7)}
  if(s.pocket)R(G,s.pocket,tx+tw-4,ty+3,2,1);
  if(s.bow&&s.skirt)R(G,s.bow,tx+tw-3,ty,3,2);
  if(s.strap){limb(G,tx+tw-1,ty,tx+1,ty+11,1,s.strap);R(G,sh(s.strap,.75),tx-2,ty+8,3,4)}
  if(s.sash)limb(G,tx+tw-1,ty,tx+1,ty+11,2,s.sash);
  if(s.wrap){R(G,s.wrap,tx,ty+11-sm,tw,8);R(G,sh(s.wrap,.75),tx,ty+13-sm,tw,1);R(G,sh(s.wrap,.75),tx,ty+16-sm,tw,1)}
  if(wp==='drum'){const dx=tx+tw-2,dy=ty+8;R(G,'#8a5a30',dx-1,dy,8,7);R(G,'#e8d8b0',dx+6,dy,2,7);R(G,'#5a3418',dx-1,dy+3,8,1)}
  if(wp==='sor'&&pose==='atk'){R(G,'#5a3020',tx+tw-1,ty+5,6,6);R(G,'#3a1a10',tx+tw+1,ty-12,1,18);R(G,'#e8d8b0',tx+tw,ty+7,4,2)}
  R(G,skinD,15+lean,ty-2,3,3);
  const hx=8+lean;
  R(G,skin,hx,hy,16,15);[[0,0],[1,0],[0,1],[15,0],[14,0],[15,1],[0,14],[15,14]].forEach(([x,y])=>G.clearRect(hx+x,hy+y,1,1));
  R(G,skin,hx+16,hy+8,1,2);if(ch)R(G,skin,hx+2,hy+14,13,1);
  const hs=s.hs||'short';
  if(s.bald){R(G,sh(skin,.9),hx+2,hy-1,12,1)}else{
  R(G,hr,hx+2,hy-1,12,1);R(G,hr,hx,hy,16,4);R(G,hr,hx,hy+4,5,hs==='short'?6:7);
  if(hs==='short'){R(G,hr,hx+5,hy+4,11,1);R(G,hr,hx+6,hy+5,1,3)}
  if(hs==='bang'){R(G,hr,hx+5,hy+4,11,3);R(G,hr,hx+8,hy+7,2,1);R(G,hr,hx+12,hy+7,2,1)}
  if(hs==='vol'){R(G,hr,hx-1,hy-2,17,6);R(G,hr,hx-2,hy,3,10);R(G,hr,hx+5,hy+4,11,2);R(G,hr,hx+14,hy+6,2,1);R(G,sh(hr,1.8),hx+4,hy-1,5,1)}
  if(hs==='curly'){for(let i=0;i<6;i++)R(G,hr,hx-1+i*3,hy-2-(i%2),3,3);R(G,hr,hx-2,hy+1,4,9);R(G,hr,hx+5,hy+4,11,2);R(G,hr,hx+9,hy+6,2,1);R(G,'#3a2e26',hx+3,hy,1,1);R(G,'#3a2e26',hx+9,hy-1,1,1);R(G,'#3a2e26',hx+1,hy+5,1,1)}
  if(hs==='part'){R(G,hr,hx,hy-1,16,1);R(G,hr,hx+5,hy+4,11,2);R(G,hr,hx+6,hy+6,4,1);R(G,'#3a3448',hx+4,hy,8,1)}
  if(hs==='long'){R(G,hr,hx+5,hy+4,11,2);R(G,hr,hx-2,hy+2,3,12)}
  if(hs==='pony'){R(G,hr,hx+5,hy+4,11,2);limb(G,hx,hy+5,hx-4,hy+16,3,hr);if(s.bow)R(G,s.bow,hx-2,hy+3,3,2)}
  if(hs==='bun'){R(G,hr,hx+5,hy+4,11,2);disc(G,hr,hx+1,hy-1,3)}}
  if(s.cap){R(G,s.cap,hx-1,hy-2,17,4);R(G,s.cap,hx+14,hy+1,5,2)}
  if(s.turban){R(G,s.turban,hx-1,hy-2,18,5);R(G,sh(s.turban,.8),hx-1,hy+1,18,1);R(G,s.turban,hx-3,hy,3,3)}
  if(s.flower){R(G,s.flower,hx+1,hy-2,3,3);R(G,'#ffe08a',hx+2,hy-1,1,1)}
  R(G,skinD,hx+4,hy+7,2,3);
  const ex=hx+11,ey=hy+7;
  if(s.mask){R(G,'#f4f2ea',hx+5,hy+3,11,10);R(G,'#1a0c0c',ex,ey,2,2);R(G,'#d03030',ex+2,hy+11,2,1)}
  else{
  if(hurt){R(G,'#1a0c0c',ex,ey+1,3,1);R(G,'#1a0c0c',ex+1,ey,1,1)}
  else if(pose==='wai'){R(G,'#1a0c0c',ex,ey+1,2,1)}
  else if(s.eye==='side'){R(G,hr,ex-1,ey,4,1);R(G,'#1a0c0c',ex+1,ey+1,2,2)}
  else{R(G,'#1a0c0c',ex,ey,2,3);R(G,'#ffffff',ex,ey,1,1);R(G,s.bald?sh(skin,.7):hr,ex-1,ey-2,3,1)}
  if(s.glass){const gl=s.glass;R(G,gl,ex-2,ey-1,5,1);R(G,gl,ex-2,ey+3,5,1);R(G,gl,ex-2,ey-1,1,5);R(G,gl,ex+2,ey-1,1,5);R(G,gl,hx+5,ey,4,1)}
  if(s.blush)R(G,s.blush,ex-1,ey+3,2,1);
  if(s.thanaka){R(G,'#f0d8a0',ex-2,ey+2,3,3)}
  R(G,'#8a3a32',ex+2,hy+12,2,mouth?2:1)}
  const hxn=shX+hand[0],hyn=shY+hand[1];
  if(pose!=='wai')drawHeld(G,wp,pose,f,hxn,hyn,mal,hx,hy);
  limb(G,shX,shY,shX+hand[0]*.45,shY+hand[1]*.45,3,s.shirt);limb(G,shX+hand[0]*.45,shY+hand[1]*.45,hxn,hyn,3,skin);R(G,skin,hxn-1,hyn-1,3,3);
  if(wp==='chab'&&pose!=='wai')drawChab(G,hxn,hyn,0);
}
function drawChab(G,x,y,far){G.fillStyle=far?'#a88a3a':'#e0bc58';G.beginPath();G.ellipse(x+1,y,4,2,0,0,7);G.fill();R(G,far?'#7a6020':'#fff0a8',x,y-1,2,1)}
function drawHeld(G,wp,pose,f,hx,hy,mal,headX,headY){
  if(wp==='none'||wp==='chab'||wp==='drum'||(wp==='sor'&&pose==='atk'))return;
  if((wp==='flute'||wp==='pi')&&pose==='atk'&&f>0){const y=headY+12;R(G,wp==='pi'?'#4a2a18':'#c8a060',headX+13,y,15,2);for(let i=0;i<4;i++)R(G,'#3a2410',headX+16+i*3,y,1,1);if(wp==='pi'){R(G,'#b8b8c0',headX+27,y-1,3,4)}return}
  if(!mal)return;const ang=mal[1];
  if(wp==='flute'||wp==='pi'){const len=14,mx=hx+Math.cos(ang)*len,my=hy+Math.sin(ang)*len;limb(G,hx,hy,mx,my,2,wp==='pi'?'#4a2a18':'#c8a060');if(wp==='pi')R(G,'#b8b8c0',mx-1,my-1,3,3);return}
  if(wp==='sor'){const len=13,mx=hx+Math.cos(ang)*len,my=hy+Math.sin(ang)*len;limb(G,hx,hy,mx,my,1,'#3a1a10');disc(G,'#5a3020',mx,my,3);return}
  const len=wp==='ranad'?10:11,mx=hx+Math.cos(ang)*len*mal[0],my=hy+Math.sin(ang)*len;
  limb(G,hx,hy,mx,my,1,wp==='ranad'?'#3a2418':'#7a4a28');
  if(wp==='ranad'){disc(G,'#2a1a12',mx,my,2)}else{R(G,'#e8d8b0',mx-2,my-2,4,4);R(G,'#b9a070',mx-2,my+1,4,1)}
}
const POSES={idle:2,run:6,jump:2,atk:3,hurt:1,play:2,wai:1};
function frames(spec,wp){
  const set={};for(const p in POSES){set[p]=[];for(let f=0;f<POSES[p];f++){const [c,x]=mk(SW,SH);drawSide(x,spec,p,f,wp);set[p].push(outline(c))}}
  const [pc,px]=mk(64,64);if(window.PX)px.drawImage(PX.avatarCanvas(spec,64,spec.bg||'#5a3452'),0,0);set.face=pc;return set}
function drawSprite(G,set,pose,f,x,y,face,alpha){const arr=set[pose]||set.idle,c=arr[f%arr.length];G.save();if(alpha!=null)G.globalAlpha=alpha;
  if(face<0){G.translate(Math.round(x)+SW/2,0);G.scale(-1,1);G.drawImage(c,0,Math.round(y)-SH+2)}else G.drawImage(c,Math.round(x)-SW/2,Math.round(y)-SH+2);G.restore()}
/* เพี้ยนน้อย */
const MINI=(()=>{const out=[];for(let f=0;f<2;f++){const [c,x]=mk(20,30);const b=f;R(x,'#c69bff',3,17+b,11,9);R(x,'#e2c8ff',4,18+b,3,2);R(x,'#140c1c',5,20+b,2,2);R(x,'#140c1c',9,20+b,2,2);R(x,'#ff9ab0',4,23+b,2,1);R(x,'#ff9ab0',10,23+b,2,1);R(x,'#e8b830',5,13+b,7,4);R(x,'#140c1c',13,2+b,1,16);R(x,'#140c1c',13,2+b,5,2);R(x,'#140c1c',16,4+b,2,3);out.push(outline(c,'#2a1238'))}return out})();

/* ====================================================================
   ตัวละครทั้งหมด: เครื่องดนตรี ท่าโจมตี ความสามารถ
   ==================================================================== */
const CHAR={
  me:{wp:'mallet',atk:'slash',ab:null,inst:'ไม้ตีฆ้อง'},
  foo:{wp:'mallet',atk:'rapid',ab:'climb',inst:'ฆ้องวงเล็ก',abn:'ปีนรั้ว'},
  waen:{wp:'ranad',atk:'slash',ab:'decode',inst:'ระนาดทุ้ม',abn:'มองเห็นทางลับ'},
  yum:{wp:'sor',atk:'beam',ab:'smell',inst:'ซอด้วง',abn:'ดมกลิ่นของกิน'},
  jao:{wp:'flute',atk:'shot',ab:null,inst:'ขลุ่ย'},
  che:{wp:'ranad',atk:'rapid',ab:'push',inst:'ระนาดเอก',abn:'ดันของหนัก'},
  maha:{wp:'mallet',atk:'heavy',ab:null,inst:'ฆ้องวงใหญ่'},
  captain:{wp:'drum',atk:'quake',ab:null,inst:'ตะโพน'},
  kaimuk:{wp:'drum',atk:'quake',ab:null,inst:'โทน'},
  ing:{wp:'drum',atk:'shot',ab:null,inst:'รำมะนา'},
  ice:{wp:'drum',atk:'slash',ab:'high',inst:'โทน',abn:'กระโดดสูง'},
  luwa:{wp:'chab',atk:'parry',ab:null,inst:'ฉาบ'},
  pob:{wp:'pi',atk:'wave',ab:null,inst:'ปี่แน'},
  mateo:{wp:'mallet',atk:'slash',ab:'crawl',inst:'ฆ้องวงใหญ่',abn:'มุดทางแคบ'}};
const ATK={
  slash:{cd:.28,cost:2,dmg:10,box:[4,34,40,4],hit:.07,dur:.3},
  heavy:{cd:.5,cost:4,dmg:19,box:[2,40,44,2],hit:.12,dur:.42,kb:220},
  rapid:{cd:.14,cost:1,dmg:5,box:[4,28,36,6],hit:.04,dur:.16},
  shot:{cd:.32,cost:3,dmg:9,proj:{sp:230,pierce:0,kind:'note'},hit:.06,dur:.26},
  wave:{cd:.42,cost:4,dmg:8,proj:{sp:150,pierce:1,kind:'wave'},hit:.08,dur:.34},
  parry:{cd:.28,cost:2,dmg:8,box:[2,30,38,4],hit:.05,dur:.3,parry:.28},
  beam:{cd:.3,cost:3,dmg:7,beam:110,hit:.07,dur:.3},
  quake:{cd:.46,cost:4,dmg:9,quake:76,hit:.1,dur:.36}};
/* ตัวละครอื่นในเรื่อง (สมมุติทั้งหมด ไม่อิงคนจริง) */
const EXTRA={
  tang:null,
  karen:{skin:'#c98d62',hair:'#15100e',hs:'short',shirt:'#c0302a',shade:'#f2f0e8',pants:'#2a2a30',shoe:'#3a2a20',sash:'#f2f0e8'},
  myan:{skin:'#c98d62',hair:'#15100e',hs:'short',shirt:'#f4f2ea',shade:'#d8d4c8',pants:'#3a4a7a',shoe:'#3a2a20',wrap:'#3a4a7a',turban:'#e8c070'},
  myan2:{skin:'#d6a07a',hair:'#15100e',hs:'bun',shirt:'#e86a8a',shade:'#c04a6a',pants:'#5a2a7a',shoe:'#3a2a20',skirt:1,thanaka:1,flower:'#ff5a7a'},
  dancer:{skin:'#e2ad85',hair:'#15100e',hs:'bun',shirt:'#d02a3a',shade:'#a01a2a',pants:'#2a7a3a',shoe:'#3a2a20',skirt:1,mask:1,flower:'#ff8ab0'},
  chang:{skin:'#b97a55',hair:'#9a9a9a',hs:'short',shirt:'#6a5a4a',shade:'#4a3e32',pants:'#2a2a30',shoe:'#2a2018',glass:'#8a8a7a'},
  elder:{skin:'#b97a55',hair:'#d8d4cc',hs:'short',shirt:'#3a3a5a',shade:'#2a2a40',pants:'#2a2a30',shoe:'#2a2018'},
  vendor:{skin:'#d6a07a',hair:'#2a1a12',hs:'bun',shirt:'#e8a040',shade:'#c07a20',pants:'#4a3a6a',shoe:'#3a2a20',skirt:1},
  alum:{skin:'#e2ad85',hair:'#15100e',hs:'part',shirt:'#3a7ad8',shade:'#2a5aa8',pants:'#2a2a30',shoe:'#111'},
  kid:{skin:'#d6a07a',hair:'#15100e',hs:'bang',shirt:'#f3f3ee',shade:'#c4c7d4',pants:'#b89868',shorts:'#7a3a1a',shoe:'#8a3a22',small:1},
  drummer:{skin:'#b07448',hair:'#15100e',hs:'short',shirt:'#1a1820',shade:'#a8326e',pants:'#1a1820',shoe:'#111',polo:'#fff'}};
const XN={tang:'ครูตังค์',pian:'เพี้ยนน้อย',gold:'ท่านเสียงทอง',karen:'พี่ดาวิ (นักดนตรีกะเหรี่ยง)',myan:'ลุงหม่อง (วงปี่พาทย์พม่า)',myan2:'น้าเอ (นักร้อง)',dancer:'นักแสดงหน้ากาก',chang:'ลุงช่างเครื่องดนตรี',elder:'พ่อครูกลองหลวง',vendor:'ป้าแม่ค้า',alum:'พี่ต้น ศิษย์เก่า',kid:'เด็กในชุมชน',drummer:'พี่มือกลองหลวง',sys:'ประกาศ'};
const nameOf=id=>id==='me'?(SAVE.name||'สมาชิกใหม่'):XN[id]||(window.PX&&PX.NAMES[id])||id;
const specOf=id=>id==='me'?SAVE.spec:(window.PX&&PX.PRESETS[id])||EXTRA[id]||PX.PRESETS.jao;
const SETS={};function setOf(id){const k=id==='me'?'me:'+JSON.stringify(SAVE.spec):id;if(!SETS[k])SETS[k]=frames(specOf(id),(CHAR[id]||{wp:'none'}).wp);return SETS[k]}

/* ====================================================================
   ด่าน (LV): แพลตฟอร์ม กำแพง หลุม จุดใช้งาน ศัตรู ตัวละครในฉาก
   ==================================================================== */
let LV=null,STAGE=null,P=null,TEAM=['me'],AI=0,cam=0,camY=0,T=0,mode='title',hitstop=0,shake=0;
const ST={};
function newLevel(w){return {w,plats:[],walls:[],haz:[],items:[],cps:[],uses:[],acts:[],en:[],shots:[],eshots:[],fx:[],pops:[],debris:[],doors:[],trig:[],boss:null,camLock:null,auto:0,dark:0,wind:0,windT:0,L:{},drawBG:null,drawMid:null,drawFG:null,floor:null,name:'',groundGaps:[]}}
function plat(x,y,w,o){const p=Object.assign({x,y,w,one:1},o||{});LV.plats.push(p);return p}
function wall(x,y,w,h,k,o){const q=Object.assign({x,y,w,h,k:k||'rock'},o||{});LV.walls.push(q);return q}
function gap(x,w,kind){LV.haz.push({x,w,kind:kind||'pit'})}
function cp(x,kind,label){LV.cps.push({x,kind,label,used:0})}
function item(x,y,kind,data){LV.items.push(Object.assign({x,y,kind,got:0,t:Math.random()*6},data||{}))}
function use(x,w,n,act,o){const u=Object.assign({x,w,n,act},o||{});LV.uses.push(u);return u}
function actor(id,x,face,o){const a=Object.assign({id,x,y:GY,face:face||1,pose:'idle',f:0,ft:Math.random()*2,vis:1},o||{});LV.acts.push(a);return a}
function trig(x,fn,o){LV.trig.push(Object.assign({x,fn,done:0},o||{}))}
const groundAt=x=>!LV.haz.some(h=>x>h.x&&x<h.x+h.w);

/* ====================================================================
   ผู้เล่นและทีม
   ==================================================================== */
const K={},pressed={};
const keymap={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',Space:'j',KeyW:'j',ArrowUp:'j',KeyK:'j',KeyJ:'a',KeyX:'a',KeyZ:'a',KeyE:'u',KeyS:'u',ArrowDown:'u',Enter:'u',KeyQ:'s',ShiftLeft:'s',ShiftRight:'s',KeyL:'s',KeyC:'x',KeyI:'x'};
addEventListener('keydown',e=>{if(e.code==='Escape'||e.code==='KeyP'){if(window.togglePause)togglePause();return}const k=keymap[e.code];if(!k||!['play','talk','cr','jam','cut'].includes(mode))return;e.preventDefault();if(!K[k])pressed[k]=1;K[k]=1;audio()});
addEventListener('keyup',e=>{const k=keymap[e.code];if(k)K[k]=0});
function bindBtn(id,k){const b=$(id);if(!b)return;const on=e=>{e.preventDefault();audio();if(!K[k])pressed[k]=1;K[k]=1;b.classList.add('on')},off=e=>{if(e)e.preventDefault();K[k]=0;b.classList.remove('on')};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off)}
function clearPressed(){for(const k in pressed)delete pressed[k]}
const act=()=>TEAM[AI]||'me',C=()=>CHAR[act()]||CHAR.me;
const maxHP=()=>100+20*(SAVE.up.hp||0),maxBR=()=>100+20*(SAVE.up.br||0);
function newPlayer(x){return {band:0,x,y:GY,vx:0,vy:0,face:1,on:1,hp:maxHP(),br:maxBR(),inv:0,atk:-1,ak:null,cd:0,coy:0,jb:0,pose:'idle',f:0,ft:0,hurt:0,cp:x,safe:x,low:0,lastQ:null,prasan:0,sw:0,climb:0,parry:0,frozen:0,carry:null}}
function switchMember(dir){if(TEAM.length<2||P.frozen)return;const was=act();AI=(AI+(dir||1)+TEAM.length)%TEAM.length;
  const b=beat();if(P.lastHitT&&T-P.lastHitT<.7&&P.lastQ){P.prasan=1.2;pop(P.x,P.y-56,'ประสาน!','#9ff0c0');unity(1)}
  P.sw=.25;sparks(P.x,P.y-24,8,1,'#c69bff');sfx(t=>TS2.chab(2,t,.25));if(LV.onSwitch)LV.onSwitch(was,act())}
function hb(){return C().ab==='crawl'?24:40}
function hurt(d,dir){if(P.inv>0||mode!=='play'||window.__GOD)return;d=Math.max(3,Math.round(d*.6));P.hp-=d;P.inv=1.3;P.hurt=.3;P.vx=dir*130;P.vy=-140;P.on=0;ST.combo=0;shake=.2;sfx(t=>TS2.thon(3,t,.5));sparks(P.x,P.y-24,6,0,'#ff6a6a');
  if(P.hp<=0){ST.falls++;P.hp=0;unity(-1);P.frozen=1;setTimeout(()=>{respawn(P.cp);say('ไม่เป็นไร ลุกขึ้นมาใหม่ได้เสมอ เพื่อนรออยู่',1)},600)}}
function respawn(x){P.x=x;P.y=GY;P.vx=0;P.vy=0;P.hp=maxHP();P.br=maxBR();P.inv=1.5;P.frozen=0;cam=clamp(x-W*.42,0,LV.w-W)}
function rest(msg){P.hp=maxHP();P.br=maxBR();P.cp=P.x;if(msg)say(msg,1);for(let i=0;i<10;i++)LV.fx.push({x:P.x+rnd(-10,10),y:P.y-rnd(0,40),vx:0,vy:-rnd(10,30),t:0,life:1,c:'#9fe8a0',s:2})}
function unity(d){SAVE.unity=clamp((SAVE.unity||0)+d,0,100);ST.unity=(ST.unity||0)+d}
const VIRTUE=['รักชาติ ศาสน์ กษัตริย์','ซื่อสัตย์สุจริต','มีวินัย','ใฝ่เรียนรู้','อยู่อย่างพอเพียง','มุ่งมั่นในการทำงาน','รักความเป็นไทย','มีจิตสาธารณะ'];
function star(i,why){const key=STAGE.id+':'+why;SAVE.starLog=SAVE.starLog||{};if(SAVE.starLog[key])return;SAVE.starLog[key]=1;SAVE.stars[i]=(SAVE.stars[i]||0)+1;ST.stars=(ST.stars||0)+1;store();
  banner('★ '+VIRTUE[i],why,1.8);sfx(t=>{TS2.ranadKey(17,t,.5);TS2.ranadKey(21,t+.09,.5)})}

/* ====================================================================
   อัปเดต
   ==================================================================== */
const JC=5;
function update(dt){
  T+=dt;sched();
  if(shake>0)shake-=dt;
  LV.plats.forEach(p=>{if(p.mv){const m=p.mv;const ox=p.x,oy=p.y;m.t=(m.t||0)+dt;if(m.vx){p.x=m.x0+((m.t*m.vx)%(m.len||1e9))}else{p.x=m.x0+Math.sin(m.t*m.sp+(m.ph||0))*(m.ax||0);p.y=m.y0+Math.sin(m.t*m.sp+(m.ph||0))*(m.ay||0)}p.dx=p.x-ox;p.dy=p.y-oy}});
  if(LV.tick)LV.tick(dt);
  if(mode==='talk'||mode==='cut'){if(mode==='talk'&&(pressed.u||pressed.a||pressed.j))nextLine();clearPressed();actorsTick(dt);fxTick(dt);camTick(dt);return}
  if(mode==='cr'){crTick(dt);clearPressed();actorsTick(dt);fxTick(dt);camTick(dt);return}
  if(mode==='jam'){jamTick(dt);clearPressed();actorsTick(dt);fxTick(dt);camTick(dt);return}
  if(mode!=='play'){clearPressed();return}
  if(hitstop>0){hitstop-=dt;clearPressed();return}
  playerTick(dt);
  LV.en.forEach(e=>enemyTick(e,dt));LV.en=LV.en.filter(e=>!e.gone);
  if(LV.boss)bossTick(LV.boss,dt);
  shotsTick(dt);fxTick(dt);actorsTick(dt);
  LV.trig.forEach(t=>{if(!t.done&&P.x>=t.x&&(!t.cond||t.cond())){t.done=1;t.fn()}});
  LV.items.forEach(it=>{if(it.got||it.hid&&!it.shown)return;if(it.kind==='coin'){const dx=P.x-it.x,dy=(P.y-20)-it.y,d=Math.hypot(dx,dy),mr=46+12*(SAVE.up.mag||0);if(d<mr){it.x+=dx/d*Math.min(d,260*dt);it.y+=dy/d*Math.min(d,260*dt)}if(d<12)collect(it);return}if(Math.abs(P.x-it.x)<12&&Math.abs((P.y-20)-it.y)<24)collect(it)});
  if(P.on&&!LV.boss&&!LV.auto&&P.x>(LV.autoCp||0)+420&&groundAt(P.x)){LV.autoCp=P.x;P.cp=P.x}
  LV.cps.forEach(c=>{if(!c.used&&Math.abs(P.x-c.x)<16){c.used=1;P.cp=c.x;if(c.kind!=='shrine')rest('จุดพัก: '+(c.label||'บันทึกแล้ว'))}});
  camTick(dt);clearPressed();
}
function playerTick(dt){
  const p=P,c=C(),dir=p.frozen?0:(K.r?1:0)-(K.l?1:0);
  if(pressed.s&&!p.frozen)switchMember(1);
  if(pressed.x)bandBlast();
  p.sw-=dt;p.prasan-=dt;
  const acc=p.on?900:620,max=104+(LV.speedUp||0);
  if(dir){p.vx+=dir*acc*dt;p.face=dir}else{const fr=(p.on?1100:300)*dt;p.vx=Math.abs(p.vx)<=fr?0:p.vx-Math.sign(p.vx)*fr}
  if(p.atk>=0&&p.on)p.vx*=.86;
  // ลม (ฉากอุโมงค์ไผ่): ลมแรงตอนฉับ
  p.vx=clamp(p.vx,-max,max);
  if(LV.windAt&&!p.frozen){const wf=LV.windAt(p.x);if(wf)p.x+=wf*.08*dt}
  if(p.on&&!dir&&p.atk<0)p.br=Math.min(maxBR(),p.br+55*dt);else p.br=Math.min(maxBR(),p.br+(p.on?22:8)*dt);
  if(pressed.j&&!p.frozen)p.jb=.13;p.jb-=dt;p.coy-=dt;
  const jv=c.ab==='high'?-395:-318;
  if(p.jb>0&&p.coy>0){if(p.br>=JC){p.vy=jv;p.on=0;p.coy=0;p.jb=0;p.br-=JC;dust(p.x,p.y,4);p.ride=null}else{p.jb=0;lowBreath()}}
  // ปีนรั้ว (ฟู)
  p.climb=0;
  if(c.ab==='climb'&&(K.j||K.u)){const w=LV.walls.find(q=>q.k==='fence'&&p.y-2>q.y&&p.y-30<q.y+q.h&&p.x>q.x-6&&p.x<q.x+q.w+6);if(w){p.vy=-95;p.climb=1;p.br=Math.min(maxBR(),p.br+5*dt)}}
  if(!p.climb)p.vy+=(p.vy<0&&!K.j?2100:950)*dt;p.vy=Math.min(p.vy,430);
  // พาไปกับแพลตฟอร์มที่เคลื่อนที่
  if(p.ride&&p.on){p.x+=p.ride.dx||0;p.y+=p.ride.dy||0}
  const py=p.y,h=hb();
  p.x+=p.vx*dt;
  for(const q of LV.walls){if(q.off||q.k==='fence')continue;if(q.k==='low'&&h<=24)continue;if(p.x+6>q.x&&p.x-6<q.x+q.w&&p.y>q.y+.5&&p.y-h<q.y+q.h){
      if(q.k==='crate'&&c.ab==='push'&&dir){const nx=q.x+dir*40*dt;if(!q.lim||(nx>q.lim[0]&&nx<q.lim[1])){q.x=nx;q.pushed=1}}
      if(p.vx>0||p.x<q.x+q.w/2)p.x=q.x-6;else p.x=q.x+q.w+6;p.vx=0}}
  p.x=clamp(p.x,LV.camLock?LV.camLock[0]+8:12,LV.camLock?LV.camLock[1]-8:LV.w-12);
  p.y+=p.vy*dt;
  const wasOn=p.on;p.on=0;p.ride=null;
  for(const q of LV.walls){if(q.off||q.k==='fence')continue;if(q.k==='low'&&h<=24)continue;if(p.x+6>q.x&&p.x-6<q.x+q.w){
      if(p.vy>=0&&py<=q.y+.5&&p.y>=q.y){p.y=q.y;p.vy=0;p.on=1}
      else if(p.vy<0&&p.y-h<q.y+q.h&&py-h>=q.y+q.h-1){p.y=q.y+q.h+h;p.vy=0}}}
  if(!p.on&&p.vy>=0)for(const q of LV.plats){if(q.off||(q.hid&&!q.shown))continue;if(p.x>q.x-5&&p.x<q.x+q.w+5&&py<=q.y+.5+(q.dy>0?q.dy:0)&&p.y>=q.y){p.y=q.y;p.vy=0;p.on=1;p.ride=q.mv?q:null;if(q.onLand)q.onLand(q);break}}
  if(!p.on&&p.y>=GY&&groundAt(p.x)){p.y=GY;p.vy=0;p.on=1}
  if(p.on){p.coy=.1;if(!wasOn)dust(p.x,p.y,3);if(p.y>=GY-1&&groundAt(p.x))p.safe=p.x;else if(p.y<GY-1)p.safe=p.x}
  // ตกหลุม/น้ำ
  if(p.y>H+30){const hz=LV.haz.find(z=>p.x>z.x-20&&p.x<z.x+z.w+20);hurtFall(hz&&hz.kind)}
  // โจมตี
  p.cd-=dt;
  if(pressed.a&&p.cd<=0&&!p.frozen){const a=ATK[c.atk];if(p.br>=a.cost){p.br-=a.cost;p.atk=0;p.ak=a;p.cd=a.cd;ST.swings++;const b=beat();p.lastQ=Math.abs(b.d)<=.15?(b.chab?'chab':'ching'):null;p.hitDone=0;if(a.parry)p.parry=a.parry;
      sfx(t=>TS2.chab(p.lastQ==='chab'?0:2,t,p.lastQ? .45:.22))}else lowBreath()}
  if(p.atk>=0){p.atk+=dt;if(p.atk>p.ak.hit&&!p.hitDone){p.hitDone=1;doAttack(p)}if(p.atk>p.ak.dur)p.atk=-1}
  p.parry-=dt;p.inv-=dt;p.hurt-=dt;if(p.low>0)p.low-=dt;
  // จุดใช้งาน
  const u=nearUse(),n=u?null:nearActor(),dr=u||n?null:LV.doors.find(d=>Math.abs(P.x-d.x)<d.w/2);const ub=$('#bUse');if(ub){ub.classList.toggle('show',!!(u||n||dr));ub.textContent=u?(u.n.length>5?'ใช้':u.n):n?'คุย':dr?'เข้า':'ใช้'}
  if(pressed.u&&!p.frozen){if(u)u.act(u);else if(n&&n.talk)n.talk(n);else{const d=LV.doors.find(d=>Math.abs(P.x-d.x)<d.w/2);if(d)d.enter(d)}}
  const pose=p.hurt>0?'hurt':p.atk>=0?'atk':!p.on&&!p.climb?'jump':Math.abs(p.vx)>12||p.climb?'run':'idle';
  if(pose!==p.pose){p.pose=pose;p.ft=0}p.ft+=dt;
  p.f=pose==='run'?Math.floor(p.ft*13)%6:pose==='idle'?Math.floor(p.ft*1.6)%2:pose==='jump'?(p.vy<0?0:1):pose==='atk'?(p.atk<p.ak.hit?0:p.atk<p.ak.dur*.6?1:2):0;
}
function bandBlast(){const p=P;if(p.band<100||p.frozen)return;p.band=0;p.bandTold=0;ST.blasts=(ST.blasts||0)+1;shake=.35;LV.flash={t:T};
  sfx(t=>{TS.khong(0,t,.8);TS.khong(4,t,.6);TS2.ranadKey(17,t,.7);TS2.ranadKey(21,t+.08,.6);TS2.that(0,t,.9);TS2.taphon(0,t+.05,.7)});
  LV.en.forEach(e=>{if(e.dead)return;const [ex]=ebox(e);if(Math.abs(ex-cam-W/2)<W/2+20){e.hp-=40;e.hit=.3;sparks(ex,ebox(e)[1],14,1);if(e.hp<=0)kill(e)}});
  LV.eshots.forEach(s=>s.dead=1);if(LV.boss&&LV.boss.vuln){LV.boss.hp-=Math.round(LV.boss.max*.18);LV.boss.hit=.4;if(LV.boss.hp<1)LV.boss.hp=0}
  banner('ท่าประสานวง!',TEAM.map(nameOf).join(' · '),1.4)}
function hurtFall(kind){P.hp-=kind==='hot'?5:3;P.inv=1;sfx(t=>TS2.thon(3,t,.5));if(kind==='hot')say('ร้อน! น้ำพุร้อนห้ามลงไปนะ',1);else if(kind==='water')say('ตกน้ำ! ขึ้นมาก่อน',1);
  if(P.hp<=0){ST.falls++;respawn(P.cp);return}P.x=P.safe;P.y=GY-60;P.vy=0;P.vx=0;let tries=0;while(!groundAt(P.x)&&tries++<40)P.x-=8;if(LV.onFall)LV.onFall()}
function lowBreath(){P.low=.6;if(!ST.lowTold){ST.lowTold=1;say('เหนื่อยแล้ว! ยืนนิ่ง ๆ สักครู่ ลมหายใจจะกลับมา',1)}}
function mult(p){return (p.lastQ==='chab'?2:p.lastQ==='ching'?1.4:1)*(1+.15*(SAVE.up.atk||0))*(p.prasan>0?1.5:1)}
function doAttack(p){
  const a=p.ak,m=mult(p),dmg=Math.round(a.dmg*m);let hitAny=0;
  if(p.prasan>0)p.prasan=0;
  const hitE=(e,ex,ey)=>{if(e.guard){sparks(ex,ey,5,0,'#9ab0c0');pop(ex,ey-16,'สลับเพื่อนก่อน!','#bfe6ff');sfx(t=>TS2.chab(1,t,.3));return 0}if(e.shield&&!p.lastQ){e.hp-=2;e.hit=.1;sparks(ex,ey,5,0,'#9ab0c0');pop(ex,ey-16,'ตีตรงจังหวะ โล่จะแตก!','#bfe6ff');sfx(t=>TS2.chab(1,t,.3));if(e.hp<=0&&!e.boss)kill(e);return 0}if(e.shield&&p.lastQ&&!e.boss){e.shield=0;pop(ex,ey-16,'โล่แตก!','#9ff0c0')}
    e.hp-=dmg;e.hit=.18;e.vx=p.face*(a.kb||(m>1?150:90));if(e.kind!=='float'&&!e.boss)e.vy=-60;sparks(ex,ey,m>1?14:7,m>1);if(e.hp<=0&&!e.boss)kill(e);return 1};
  const targets=()=>LV.en.filter(e=>!e.dead).concat(LV.boss&&LV.boss.vuln?[LV.boss]:[]);
  if(a.box){const [b0,bw,bh,by]=a.box;const x0=p.face>0?p.x+b0:p.x-b0-bw,x1=x0+bw,y0=p.y-bh-by,y1=p.y-by;
    for(const e of targets()){const [ex,ey,rw,rh]=ebox(e);if(ex+rw>x0&&ex-rw<x1&&ey+rh>y0&&ey-rh<y1)hitAny|=hitE(e,ex,ey)}
    for(const s of LV.eshots){if(s.x>x0-6&&s.x<x1+6&&s.y>y0-8&&s.y<y1+8){if(a.parry){s.vx=-s.vx*1.3;s.ref=1;pop(s.x,s.y-8,'ปัดกลับ!','#ffe08a')}else{s.dead=1;pop(s.x,s.y-8,'ตีทิ้ง!','#ffffff')}hitAny=1;sparks(s.x,s.y,6,0)}}}
  if(a.proj){LV.shots.push({x:p.x+p.face*12,y:p.y-26,vx:p.face*a.proj.sp,dmg,pierce:a.proj.pierce,kind:a.proj.kind,t:0,hits:[],gold:m>1});sfx(t=>{if(act()==='pob')TS2.pinae(pick([420,470,517,551]),t,.18,.6);else TS2.khlui(pick([587,659,784,880]),t,.16,.5)})}
  if(a.beam){const x0=p.face>0?p.x+8:p.x-8-a.beam,x1=x0+a.beam;LV.fx.push({beam:1,x0,x1,y:p.y-28,t:0,life:.14,c:m>1?'#ffd86a':'#bfe6ff'});
    for(const e of targets()){const [ex,ey,rw,rh]=ebox(e);if(ex+rw>x0&&ex-rw<x1&&Math.abs(ey-(p.y-28))<rh+10)hitAny|=hitE(e,ex,ey)}sfx(t=>TS2.sor(pick([523,587,659]),t,.2,.5))}
  if(a.quake){LV.fx.push({ring:1,x:p.x,y:p.y-2,t:0,life:.35,r:a.quake,c:m>1?'#ffd86a':'#ffffff'});shake=.12;
    for(const e of targets()){const [ex,ey]=ebox(e);if(Math.abs(ex-p.x)<a.quake&&(e.boss||e.kind!=='float'||ey>GY-50))hitAny|=hitE(e,ex,ey)}sfx(t=>act()==='captain'?TS2.taphon(0,t,.7):TS2.thon(2,t,.7))}
  if(hitAny)registerHit(p,m);
  else if(p.lastQ)pop(p.x+p.face*16,p.y-46,p.lastQ==='chab'?'ฉับ':'ฉิ่ง','rgba(255,240,200,.7)');
}
function registerHit(p,m){ST.hits++;p.lastHitT=T;p.band=Math.min(100,(p.band||0)+(p.lastQ?14:5));if(p.band>=100&&!p.bandTold){p.bandTold=1;say('พลังวงเต็มแล้ว! กด '+(isTouch()?'★':'C')+' เรียกทั้งวงมาช่วย',1)}if(ST.combo>0&&ST.combo%5===0&&p.lastQ)banner(ST.combo>=10?'สุดยอด! ตรงจังหวะ ×'+ST.combo:'เยี่ยม! ตรงจังหวะ ×'+ST.combo,'',1);if(p.lastQ){ST.combo++;ST.best=Math.max(ST.best,ST.combo);if(p.lastQ==='chab')ST.onChab++;else ST.onChing++}else ST.combo=0;
  hitstop=m>1.5? .07:.04;sfx(t=>{TS2.ranadKey(10+Math.min(ST.combo,10),t,.6);if(p.lastQ==='chab')TS.khong(5+(ST.combo%3),t+.01,.5)});
  pop(p.x+p.face*20,p.y-46,p.lastQ==='chab'?'ตรงฉับ! ×2':p.lastQ==='ching'?'ตรงฉิ่ง ×1.4':'',p.lastQ==='chab'?'#ffd86a':'#bfe6ff')}
function nearUse(){return LV.uses.find(u=>!u.off&&Math.abs(P.x-u.x)<u.w/2&&(!u.y||Math.abs(P.y-u.y)<30))}
function nearActor(){return LV.acts.find(a=>a.vis&&a.talk&&Math.abs(P.x-a.x)<22&&Math.abs(P.y-a.y)<30)}
function collect(it){it.got=1;if(it.kind==='coin'){ST.coins=(ST.coins||0)+1;if(!it.drop)ST.coinsLv=(ST.coinsLv||0)+1;SAVE.coins=(SAVE.coins||0)+1;const k=T-(ST.lastCoin||0)<.5?(ST.cs=(ST.cs||0)+1):(ST.cs=0);ST.lastCoin=T;sfx(t=>TS2.ranadKey(12+(k%9),t,.28));LV.fx.push({x:it.x,y:it.y,vx:0,vy:-30,t:0,life:.3,c:'#fff2b0',s:2});return}
  sfx(t=>{TS2.ranadKey(15,t,.5);TS2.ranadKey(19,t+.08,.5)});sparks(it.x,it.y,10,1);
  if(it.kind==='note'){if(!SAVE.notes.includes(it.id)){SAVE.notes.push(it.id);store()}banner('บันทึกความรู้',NOTES[it.id]?NOTES[it.id].t:'',2.2);if(!ST.noteStar&&SAVE.notes.length%3===0){ST.noteStar=1;star(3,'เก็บบันทึกความรู้')}}
  else if(it.kind==='mat'){SAVE.mat[it.m]=(SAVE.mat[it.m]||0)+1;SAVE.coins=(SAVE.coins||0)+10;ST.coins=(ST.coins||0)+10;store();pop(it.x,it.y-12,'+'+MATN[it.m]+' +10 โน้ตทอง','#9ff0c0')}
  else if(it.kind==='heal'){P.hp=Math.min(maxHP(),P.hp+30);pop(it.x,it.y-12,'+พลัง','#ff9aa8')}
  else if(it.kind==='lost'){ST.lost=it;say('เจอ'+it.n+'! ต้องเอาไปคืนเจ้าของ',1)}
  if(it.on)it.on(it)}
const MATN={bamboo:'ไม้ไผ่',wood:'ไม้เนื้อแข็ง',hide:'หนังกลอง',wax:'ตะกั่วผสมขี้ผึ้ง',string:'สายซอ'};

/* ---------- กระสุนและเอฟเฟกต์ ---------- */
function shotsTick(dt){
  LV.shots.forEach(s=>{s.x+=s.vx*dt;s.t+=dt;if(s.t>1.6||s.x<cam-40||s.x>cam+W+40)s.dead=1;
    for(const e of LV.en.concat(LV.boss&&LV.boss.vuln?[LV.boss]:[])){if(e.dead||s.hits.includes(e))continue;const [ex,ey,rw,rh]=ebox(e);if(Math.abs(s.x-ex)<rw+4&&Math.abs(s.y-ey)<rh+6){
      if(e.guard||(e.shield&&!s.gold)){s.dead=1;sparks(s.x,s.y,4,0,'#9ab0c0');continue}e.hp-=s.dmg;e.hit=.15;sparks(s.x,s.y,6,s.gold);registerHit(P,s.gold?2:1);if(e.hp<=0&&!e.boss)kill(e);s.hits.push(e);if(!s.pierce){s.dead=1;break}}}});
  LV.shots=LV.shots.filter(s=>!s.dead);
  LV.eshots.forEach(s=>{s.x+=s.vx*dt;s.y+=(s.vy||0)*dt;if(s.g)s.vy+=s.g*dt;s.t+=dt;
    if(s.ref){for(const e of LV.en.concat(LV.boss&&LV.boss.vuln?[LV.boss]:[])){if(e.dead)continue;const [ex,ey,rw,rh]=ebox(e);if(Math.abs(s.x-ex)<rw+6&&Math.abs(s.y-ey)<rh+6){e.hp-=14;e.hit=.15;sparks(s.x,s.y,10,1);if(e.hp<=0&&!e.boss)kill(e);s.dead=1;break}}}
    else if(Math.abs(s.x-P.x)<12&&Math.abs(s.y-(P.y-22))<18&&!s.dead){if(P.parry>0&&Math.sign(s.x-P.x)===P.face){s.vx=-s.vx*1.3;s.vy=-(s.vy||0);s.ref=1;pop(s.x,s.y-8,'ปัดกลับ!','#ffe08a');sfx(t=>TS2.chab(0,t,.4))}else{s.dead=1;hurt(s.dmg||9,Math.sign(s.vx)||1)}}
    if(s.t>5||s.y>H+20)s.dead=1});
  LV.eshots=LV.eshots.filter(s=>!s.dead);
}
function fxTick(dt){LV.fx.forEach(f=>{f.t+=dt;if(f.vx!=null){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=(f.g||0)*dt}});LV.fx=LV.fx.filter(f=>f.t<f.life);
  LV.pops.forEach(o=>{o.t+=dt;o.y-=18*dt});LV.pops=LV.pops.filter(o=>o.t<1);
  LV.debris.forEach(d=>{d.vy+=700*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;if(d.y>GY){d.y=GY;d.vy*=-.35;d.vx*=.6}d.t+=dt});LV.debris=LV.debris.filter(d=>d.t<5)}
function actorsTick(dt){LV.acts.forEach(a=>{a.ft+=dt;if(a.tx!=null){const d=a.tx-a.x;if(Math.abs(d)<2){a.x=a.tx;a.tx=null;a.pose=a.endPose||'idle';if(a.res){a.res();a.res=null}}else{a.x+=Math.sign(d)*Math.min(Math.abs(d),(a.sp||70)*dt);a.face=Math.sign(d);a.pose='run'}}
  a.f=a.pose==='run'?Math.floor(a.ft*12)%6:a.pose==='play'?Math.floor(a.ft*4)%2:Math.floor(a.ft*1.5)%2;if(a.lookP&&mode==='play')a.face=P.x<a.x?-1:1})}
function camTick(dt){let tgt;if(LV.auto){LV.autoX=(LV.autoX||0)+LV.auto*dt;tgt=LV.autoX}else if(LV.camLock){tgt=clamp(P.x-W*.42,LV.camLock[0],Math.max(LV.camLock[0],LV.camLock[1]-W))}else tgt=clamp(P.x-W*.42+P.face*28,0,LV.w-W);
  if(LV.camFocus!=null)tgt=clamp(LV.camFocus-W/2,0,LV.w-W);
  cam=LV.auto?tgt:lerp(cam,tgt,1-Math.pow(.002,dt));cam=clamp(cam,0,Math.max(0,LV.w-W))}
function sparks(x,y,n,gold,c){for(let i=0;i<n;i++)LV.fx.push({x,y,vx:rnd(-110,110),vy:rnd(-110,40),g:240,t:0,life:rnd(.25,.5),c:c||(gold?pick(['#ffd86a','#fff2b0']):pick(['#ffffff','#bfe6ff'])),s:gold?2:1})}
function dust(x,y,n){for(let i=0;i<n;i++)LV.fx.push({x:x+rnd(-6,6),y:y-1,vx:rnd(-30,30),vy:rnd(-20,-5),t:0,life:.35,c:'rgba(230,220,200,.8)',s:2})}
function pop(x,y,t,c){if(t)LV.pops.push({x,y,t:0,s:t,c})}

/* ====================================================================
   เงาคำลวง (ศัตรู) และบอส
   ==================================================================== */
const LIES=[
  {t:'เก่งทันทีไม่ต้องซ้อม!',k:'ทางลัด'},{t:'เล่นแบบนี้ไม่ต้องพัฒนาหรอก เดี๋ยวก็ได้อาชีพดี ๆ เอง',k:'ทางลัด'},
  {t:'ศรัทธาฉัน แล้วจะได้อำนาจวิเศษเหนือคนอื่น',k:'อยู่เหนือคนอื่น'},{t:'เธอเก่งกว่าทุกคนในวงอยู่แล้ว ไม่ต้องฟังใคร',k:'อยู่เหนือคนอื่น'},
  {t:'อย่าบอกครูนะ รู้กันแค่เรา',k:'ความลับ'},{t:'ทิ้งวงมาอยู่กับฉัน แล้วอย่าบอกเพื่อน',k:'ความลับ'},{t:'จ่ายนิดเดียว ได้ฝีมือทันที',k:'ทางลัด'},
  {t:'เพื่อนไม่เห็นค่าเธอหรอก มาอยู่กับฉันดีกว่า',k:'ความลับ'},{t:'ครูไม่รักเธอเท่าคนอื่น',k:'ความลับ'}];
const TELL={'ทางลัด':'สัญญาทางลัด ของจริงต้องซ้อมทีละนิด','อยู่เหนือคนอื่น':'ล่อให้อยู่เหนือคนอื่น วงดนตรีไม่มีใครอยู่เหนือใคร','ความลับ':'ให้เก็บเป็นความลับหรือแยกจากเพื่อน เรื่องจริงบอกครูและเพื่อนได้เสมอ'};
let lieI=0;
function enemy(kind,x,y,o){const L=(o&&o.lie)||LIES[lieI++%LIES.length];
  const e=Object.assign({kind,x,y:y||GY,x0:x,vx:0,vy:0,hp:{float:14,shout:16,dash:18,shield:20,echo:12,phone:12,mini:7,walk:18}[kind]||18,face:-1,t:Math.random()*6,hit:0,lie:L,told:0,dead:0,lastK:-1,sc:1},o||{});
  if(kind==='shield')e.shield=1;e.max=e.hp;LV.en.push(e);return e}
function ebox(e){if(e.boss)return [e.x,e.y-e.h/2,e.w/2,e.h/2];const s=e.sc||1;const cy=e.kind==='float'||e.kind==='phone'?e.y-30:e.y-16*s;return [e.x,cy,12*s,16*s]}
function enemyTick(e,dt){
  e.t+=dt;e.hit-=dt;
  if(e.dead){e.dt=(e.dt||0)+dt;if(e.dt>.5)e.gone=1;return}
  const p=P,dx=p.x-e.x,ad=Math.abs(dx),b=beat();
  if(e.sleep&&ad>e.sleep)return;
  if(!e.told&&ad<200&&!e.quiet){e.told=1;e.bub=3;if(!ST.lieTold){ST.lieTold=1;setTimeout(()=>say('ฟังให้ดี… คำนี้ไม่มีหลักฐาน มันคือคำลวง!',1),900)}}
  if(e.bub)e.bub=Math.max(0,e.bub-dt);
  const land=()=>{e.vy+=900*dt;e.y+=e.vy*dt;let l=groundAt(e.x)?GY:H+60;for(const q of LV.plats.concat(LV.walls)){if(q.off||(q.hid&&!q.shown))continue;if(e.x>q.x&&e.x<q.x+q.w&&e.y-e.vy*dt<=q.y+.5&&e.y>=q.y){l=q.y;break}}if(e.y>=l){e.y=l;e.vy=0;return 1}if(e.y>H+40)e.gone=1;return 0};
  const turnAtEdge=()=>{const ahead=e.x+e.face*14;if(!groundAt(ahead)&&e.y>=GY-1)e.face*=-1};
  if(e.kind==='walk'||e.kind==='mini'||e.kind==='shield'){
    const spd=(ad<150?44:26)*(e.kind==='mini'?1.6:1);if(ad<150)e.face=Math.sign(dx)||e.face;else{if(e.x<e.x0-60)e.face=1;if(e.x>e.x0+60)e.face=-1}turnAtEdge();
    if(ad<90&&b.chab&&b.k!==e.lastK&&Math.abs(b.d)<.05){e.lastK=b.k;e.vx=e.face*170;e.vy=-120}
    if(e.hit<=0)e.vx=lerp(e.vx,e.face*spd,1-Math.pow(.02,dt));e.x+=e.vx*dt;land()}
  else if(e.kind==='dash'){e.face=Math.sign(dx)||e.face;if(ad<220&&b.chab&&b.k%4===1&&b.k!==e.lastK&&Math.abs(b.d)<.05){e.lastK=b.k;e.vx=e.face*260;e.tell=0}
    e.vx*=Math.pow(.15,dt);e.x+=e.vx*dt;land()}
  else if(e.kind==='float'||e.kind==='phone'||e.kind==='echo'){
    if(ad<220){e.face=Math.sign(dx)||e.face;if(e.hit<=0)e.vx=lerp(e.vx,e.face*(e.kind==='phone'?40:34),1-Math.pow(.1,dt))}else e.vx*=.95;
    e.x+=e.vx*dt;e.y=(e.yb||GY)-11+Math.sin(e.t*1.7)*19;
    if(e.kind==='phone'&&ad<230&&b.chab&&b.k%4===3&&b.k!==e.lastK&&Math.abs(b.d)<.05){e.lastK=b.k;LV.eshots.push({x:e.x,y:e.y-30,vx:e.face*70,vy:30,t:0,w:'♥ ไลก์',heart:1,dmg:7})}}
  else if(e.kind==='shout'){e.face=Math.sign(dx)||e.face;e.x+=e.vx*dt;e.vx*=.9;land();
    if(ad<230&&b.chab&&b.k%4===3&&b.k!==e.lastK&&Math.abs(b.d)<.05){e.lastK=b.k;LV.eshots.push({x:e.x+e.face*10,y:e.y-22,vx:e.face*86,t:0,w:pick(e.words||['เก่งทันที!','ไม่ต้องซ้อม!','อย่าบอกใคร!','เหนือคนอื่น!']),dmg:9});sfx(t=>TS2.chab(1,t,.25))}}
  const [ex,ey,rw,rh]=ebox(e);
  if(Math.abs(dx)<rw+4&&Math.abs((p.y-22)-ey)<rh+6)hurt(e.dmg||10,Math.sign(dx)||1);
}
function kill(e){e.dead=1;ST.kills++;
  if(!SAVE.lies.find(l=>l.t===e.lie.t)){SAVE.lies.push(e.lie);store()}
  if(!ST.lies.find(l=>l.t===e.lie.t))ST.lies.push(e.lie);
  const [ex,ey]=ebox(e);
  for(let i=0;i<22;i++)LV.fx.push({x:ex+rnd(-8,8),y:ey+rnd(-10,10),vx:rnd(-80,80),vy:rnd(-120,10),g:300,t:0,life:rnd(.5,1.1),c:pick(['#f2c14e','#ffe08a','#c89a3a']),s:2});
  LV.debris.push({x:ex,y:ey,vx:rnd(-30,30),vy:-120,t:0,kind:e.kind==='phone'?'phone':'speaker'});
  sfx(t=>{TS2.chab(0,t,.45);TS2.that(0,t+.02,.45)});
  if(e.drop)item(ex,GY-12,e.drop.kind,e.drop);
  for(let i=0;i<3;i++)item(ex+(i-1)*12,Math.min(GY-14,ey),'coin',{drop:1});if(Math.random()<.25)item(ex,GY-12,'heal');
  if(e.onKill)e.onKill(e);
  const n=ST.kills;if(n===1||Math.random()<.35)setTimeout(()=>say(n===1&&STAGE.id===1?'เห็นไหม ข้างในกลวง เหลือแต่ลำโพงเก่า ๆ':'“'+e.lie.t+'” คือ'+TELL[e.lie.k]),350)}
/* บอส: ระยะ 1 สู้แบบแอ็กชัน */
function bossTick(b,dt){b.t+=dt;b.hit-=dt;if(b.dead)return;if(b.ai)b.ai(b,dt,beat());
  if(b.vuln&&b.hp<=0){b.vuln=0;b.hp=0;if(b.onDown)b.onDown(b)}
  const [ex,ey,rw,rh]=ebox(b);if(b.touch!==0&&Math.abs(P.x-ex)<rw&&Math.abs((P.y-22)-ey)<rh+6)hurt(b.dmg||12,Math.sign(P.x-ex)||1)}
function bossShoot(b,words,n,spread){for(let i=0;i<(n||1);i++){const a=(i-(n-1)/2)*(spread||.25);const dir=Math.sign(P.x-b.x)||-1;LV.eshots.push({x:b.x+dir*b.w/3,y:b.y-b.h*.6,vx:dir*95*Math.cos(a),vy:95*Math.sin(a),t:0,w:pick(words),dmg:10})}sfx(t=>TS2.chab(1,t,.3))}
function bossRain(b,words,n){for(let i=0;i<n;i++)LV.eshots.push({x:clamp(P.x+rnd(-120,120),cam+10,cam+W-10),y:-10-i*30,vx:0,vy:60,g:120,t:0,w:pick(words),dmg:9})}

/* ====================================================================
   บทพูด คัตซีน แบนเนอร์ (คืน Promise ให้สคริปต์ฉาก await ได้)
   ==================================================================== */
const PAL={x:40,y:GY-50,vx:0,vy:0,msg:'',mt:0,q:[]};
function say(t,now){if(now){PAL.q=PAL.q.filter(x=>x.k);PAL.q.unshift({t,k:1});nextSay();return}PAL.q.push({t});if(!PAL.mt)nextSay()}
function nextSay(){const o=PAL.q.shift();if(o){PAL.msg=o.t;PAL.mt=Math.max(2.2,o.t.length*.058)}else{PAL.msg='';PAL.mt=0}}
let TALK=null;
function talk(lines){return new Promise(res=>{TALK={lines,i:0,res,prev:mode==='talk'?'play':mode};mode='talk';tone(lines[0])})}
function tone(l){if(!l)return;const who=l[0];if(who==='gold')sfx(t=>{TS2.chab(1,t,.15);TS.khong(9,t,.12)})}
function nextLine(){if(!TALK)return;TALK.i++;if(TALK.i>=TALK.lines.length){const r=TALK.res,pm=TALK.prev;TALK=null;mode=pm==='cut'?'cut':'play';r()}else tone(TALK.lines[TALK.i])}
let BAN=null;function banner(t,s,d){BAN={t,s:s||'',d:d||2.4,t0:T}}
function waitS(s){return new Promise(r=>{const t0=T;const f=()=>{if(T-t0>=s)r();else requestAnimationFrame(f)};f()})}
function walk(a,x,sp,endPose){return new Promise(r=>{a.tx=x;a.sp=sp||70;a.res=r;a.endPose=endPose})}
function reach(x){return new Promise(r=>trig(x,r))}
function until(fn){return new Promise(r=>{const f=()=>{if(fn())r();else requestAnimationFrame(f)};f()})}
let FADE=0,FADET=0;function fade(to,s){return new Promise(r=>{const a=FADE,t0=T;const f=()=>{const k=Math.min(1,(T-t0)/(s||.5));FADE=lerp(a,to,k);if(k>=1)r();else requestAnimationFrame(f)};f()})}
function choose(q,opts){return new Promise(res=>{const d=$('#choice');d.innerHTML='<div class="card"><p>'+esc(q)+'</p><div class="opts">'+opts.map((o,i)=>'<button class="btn ghost" data-i="'+i+'">'+esc(o)+'</button>').join('')+'</div></div>';d.classList.add('on');const pm=mode;mode='cut';
  d.onclick=e=>{const b=e.target.closest('button');if(!b)return;d.classList.remove('on');d.onclick=null;mode=pm==='talk'?'play':pm;res(+b.dataset.i)}})}

/* ====================================================================
   มินิเกม 1: ฟังแล้วตีตาม (บอสระยะ 2)
   ปุ่ม ◀ = เสียงต่ำ · ตี = เสียงกลาง · ▶ = เสียงสูง
   ==================================================================== */
let CR=null;
const CRINST={khong:(l,t,v)=>TS.khong([1,4,7][l],t,v||.8),ranad:(l,t,v)=>TS2.ranadKey([10,12,15][l],t,v||.8),khlui:(l,t,v)=>TS2.khlui([523,659,784][l],t,.3,v||.7),
  sor:(l,t,v)=>TS2.sorou([257,344,429][l],t,.35,v||.8),harp:(l,t,v)=>TS2.harp([0,2,4][l],t,v||.9),klong:(l,t,v)=>l===0?TS2.klong(0,t,v||.9):l===1?TS2.klchab(0,t,v||.8):TS2.klmong(t,v||.8),
  pat:(l,t,v)=>patwaing([0,3,6][l],t,v||1),pinae:(l,t,v)=>TS2.pinae([351,470,619][l],t,.3,v||.8)};
function callResponse(o){return new Promise(res=>{CR=Object.assign({rounds:3,len:3,inst:'khong',r:0,state:'intro',t:0,ph:[],i:0,flash:[-1,0],res,miss:0},o);mode='cr';CR.state='listen';crNew()})}
function crNew(){const n=CR.len+Math.floor(CR.r/2);CR.ph=[];for(let i=0;i<n;i++)CR.ph.push(i&&Math.random()<.35?CR.ph[i-1]:Math.floor(Math.random()*3));crPlay()}
function crPlay(){CR.state='listen';CR.i=0;CR.t=0;const b=nb()+BEAT;CR.ph.forEach((l,i)=>{const t=b+i*BEAT;sfx(()=>CRINST[CR.inst](l,t));setTimeout(()=>{if(CR)CR.flash=[l,T]},Math.max(0,(t-now())*1000))});
  setTimeout(()=>{if(CR){CR.state='play';CR.i=0}},Math.max(0,(b+CR.ph.length*BEAT-now())*1000))}
function crTick(dt){if(!CR)return;CR.t+=dt;if(CR.state!=='play')return;let l=-1;if(pressed.l)l=0;else if(pressed.a||pressed.u)l=1;else if(pressed.r)l=2;if(l<0)return;
  sfx(t=>CRINST[CR.inst](l,t));CR.flash=[l,T];
  if(l===CR.ph[CR.i]){CR.i++;if(CR.i>=CR.ph.length){CR.r++;sparks(P.x,P.y-30,12,1);pop(P.x,P.y-56,'ถูกต้อง!','#9ff0c0');if(CR.r>=CR.rounds){const r=CR.res,m=CR.miss;CR=null;mode='play';setTimeout(()=>r(m),300)}else{CR.state='wait';setTimeout(()=>{if(CR)crNew()},700)}}}
  else{CR.miss++;CR.state='wait';pop(P.x,P.y-56,'ฟังอีกครั้งนะ','#ffb0b0');setTimeout(()=>{if(CR)crPlay()},800)}}

/* ====================================================================
   มินิเกม 2: บรรเลงทั้งวง (บอสระยะ 3) — โน้ตลงมาสามช่อง
   ==================================================================== */
let JAM=null;
function bandJam(o){return new Promise(res=>{const notes=[];const pat=o.pattern||[[0,1],[1,0],[2,2],[3,1],[4,0],[4.5,1],[5,2],[6,1],[7,0]];const bars=o.bars||2;
  for(let b=0;b<bars;b++)pat.forEach(([bt,l])=>notes.push({b:b*8+bt,l,st:0}));
  const t0=nb()+BEAT*4;JAM=Object.assign({notes,t0,res,hit:0,perf:0,miss:0,inst:o.inst||['khong','ranad','khlui'],who:o.who||TEAM.slice(),title:o.title||'บรรเลงพร้อมกันทั้งวง',need:o.need||.4,count:0},o);mode='jam'})}
function jamTick(dt){if(!JAM)return;const tn=now()-lat();
  const lane=pressed.l?0:(pressed.a||pressed.u)?1:pressed.r?2:-1;
  if(lane>=0){let best=null,bd=1;JAM.notes.forEach(n=>{if(n.st||n.l!==lane)return;const d=Math.abs(JAM.t0+n.b*BEAT-tn);if(d<bd){bd=d;best=n}});
    if(best&&bd<.21){best.st=bd<.08?2:1;JAM.hit++;if(best.st===2)JAM.perf++;const inst=JAM.inst[lane];sfx(t=>CRINST[inst](lane,t,.9));JAM.fl=[lane,T,best.st]}else{JAM.fl=[lane,T,0];sfx(t=>TS2.chab(2,t,.2))}}
  JAM.notes.forEach(n=>{if(!n.st&&tn>JAM.t0+n.b*BEAT+.18){n.st=-1;JAM.miss++}});
  const last=JAM.notes[JAM.notes.length-1];if(tn>JAM.t0+last.b*BEAT+.6){const sc=JAM.hit/JAM.notes.length;const r=JAM.res;
    if(sc<JAM.need){JAM.notes.forEach(n=>n.st=0);JAM.t0=nb()+BEAT*4;JAM.hit=0;JAM.perf=0;JAM.miss=0;JAM.retry=(JAM.retry||0)+1;say('ฟังจังหวะฉับ แล้วลองอีกรอบ เพื่อน ๆ รอเล่นด้วยกัน',1)}
    else{JAM=null;mode='play';r(sc)}}}

/* ====================================================================
   มินิเกม 3: ถอดรหัสเสียง (หน้าต่าง HTML) — คลิปไหนถูกตัดต่อ
   ==================================================================== */
function genClip(edit,kind,seed){const sr=22050,n=Math.floor(sr*2.4),d=new Float32Array(n);const r=seeded(seed||7);let ph=0;const cut=Math.floor(n*(.42+r()*.16));
  const f0=150+r()*60;let nl=.012;
  for(let i=0;i<n;i++){const t=i/sr;const syl=Math.max(0,Math.sin(t*Math.PI*4.2+r()*0.01));let f=f0*(1+.12*Math.sin(t*2.3)+.05*Math.sin(t*7));
    if(edit&&i>cut){if(kind==='pitch')f*=1.32;if(kind==='noise')nl=.05}
    ph+=2*Math.PI*f/sr;let v=0;for(let h=1;h<8;h++)v+=Math.sin(ph*h)*(h===2||h===3? .6:.3)/h;v*=.35*syl;
    let nz=(Math.random()*2-1)*nl;if(edit&&kind==='gap'&&i>cut&&i<cut+sr*.09){v=0;nz=0}
    d[i]=v+nz}
  if(edit&&kind!=='gap'){for(let i=cut-2;i<cut+2;i++)d[i]=.8*(i%2?1:-1)}return {d,sr,cut:edit?cut/n:null}}
function playClip(c){if(!AC)return;const b=AC.createBuffer(1,c.d.length,c.sr);b.getChannelData(0).set(c.d);const s=AC.createBufferSource();s.buffer=b;s.connect(SFX);s.start()}
function drawClip(cv,c,reveal){const x=cv.getContext('2d'),w=cv.width,h=cv.height;x.fillStyle='#120a18';x.fillRect(0,0,w,h);x.strokeStyle='#ffd86a';x.lineWidth=1;x.beginPath();
  const step=Math.floor(c.d.length/w);for(let i=0;i<w;i++){let mn=0,mx=0;for(let j=0;j<step;j++){const v=c.d[i*step+j];if(v<mn)mn=v;if(v>mx)mx=v}x.moveTo(i+.5,h/2-mx*h*.45);x.lineTo(i+.5,h/2-mn*h*.45)}x.stroke();
  if(reveal&&c.cut!=null){x.strokeStyle='#ff5a6a';x.setLineDash([4,3]);x.beginPath();x.moveTo(c.cut*w,0);x.lineTo(c.cut*w,h);x.stroke();x.setLineDash([])}}
const DECODE_TIP={noise:'เสียงพื้นหลังดังขึ้นกะทันหันตรงรอยต่อ เหมือนเอาเสียงสองที่มาต่อกัน',gap:'มีช่วงเงียบสนิทสั้น ๆ ทั้งที่เสียงห้องควรมีอยู่ตลอด',pitch:'ระดับเสียงกระโดดขึ้นทันทีกลางประโยค คนพูดจริงไม่เปลี่ยนเร็วขนาดนั้น'};
function decode(o){return new Promise(res=>{const kinds=(o&&o.kinds)||['noise','gap','pitch'];let r=0,right=0;const d=$('#mini');const pm=mode;mode='cut';
  const round=()=>{const k=kinds[r],edA=Math.random()<.5,seed=Math.floor(Math.random()*1e5);const A=genClip(edA,k,seed),B=genClip(!edA,k,seed+1);
    d.innerHTML='<div class="card"><h2>'+esc((o&&o.title)||'ถอดรหัสเสียง')+' · '+(r+1)+'/'+kinds.length+'</h2><p class="muted">'+esc((o&&o.q)||'สองคลิปนี้พูดประโยคเดียวกัน คลิปไหนถูกตัดต่อ? ฟังและดูรูปคลื่นเสียง')+'</p>'+
      '<div class="clips">'+['A','B'].map(n=>'<div class="clip"><b>คลิป '+n+'</b><canvas width="300" height="70" data-c="'+n+'"></canvas><div class="row"><button class="btn ghost" data-p="'+n+'">▶ ฟัง</button><button class="btn" data-a="'+n+'">ถูกตัดต่อ</button></div></div>').join('')+'</div><p id="dTip" class="muted"></p></div>';
    d.classList.add('on');drawClip(d.querySelector('[data-c=A]'),A);drawClip(d.querySelector('[data-c=B]'),B);
    d.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.p){audio();playClip(b.dataset.p==='A'?A:B);return}
      if(b.dataset.a){const pickA=b.dataset.a==='A',ok=pickA===edA;if(ok)right++;drawClip(d.querySelector('[data-c=A]'),A,1);drawClip(d.querySelector('[data-c=B]'),B,1);
        $('#dTip').innerHTML=(ok?'<b style="color:#9ff0c0">ถูกต้อง!</b> ':'<b style="color:#ffb0b0">ยังไม่ใช่</b> คลิปที่ตัดต่อคือคลิป '+(edA?'A':'B')+' · ')+esc(DECODE_TIP[k])+'<br><button class="btn" data-n="1" style="margin-top:8px">'+(r+1<kinds.length?'คลิปต่อไป':'เสร็จแล้ว')+'</button>';
        sfx(t=>ok?TS2.ranadKey(17,t,.6):TS2.chab(1,t,.4));d.querySelectorAll('[data-a]').forEach(x=>x.disabled=true);return}
      if(b.dataset.n){r++;if(r<kinds.length)round();else{d.classList.remove('on');d.onclick=null;mode=pm==='talk'?'play':pm;res(right)}}};};
  round()})}

/* ====================================================================
   วาด
   ==================================================================== */
function drawParallax(img,f,y){if(!img)return;const x=-Math.round(cam*f)%img.width;g.drawImage(img,x,y||0);if(x+img.width<W)g.drawImage(img,x+img.width,y||0)}
function draw(){
  g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;
  const sx=shake>0?rnd(-2,2):0;g.translate(sx|0,0);
  const c=Math.round(cam),Lr=LV.L;
  if(Lr.sky)drawParallax(Lr.sky,.06);else{g.fillStyle='#000';g.fillRect(0,0,W,H)}
  if(LV.drawSky)LV.drawSky(c);
  if(Lr.far)g.drawImage(Lr.far,-Math.round(c*.3),0);
  if(Lr.mid)g.drawImage(Lr.mid,-Math.round(c*.6),0);
  if(LV.drawBG)LV.drawBG(c);
  if(Lr.world)g.drawImage(Lr.world,-c,0);
  if(LV.floor)LV.floor(c);
  if(LV.drawMid)LV.drawMid(c);
  // แพลตฟอร์มเคลื่อนที่/ซ่อน/กำแพงพิเศษ
  LV.plats.forEach(q=>{if(q.draw)q.draw(q,c);else if(q.hid&&q.shown){g.globalAlpha=.85;R(g,'#c69bff',q.x-c,q.y,q.w,3);R(g,'#8a5ac8',q.x-c,q.y+3,q.w,2);g.globalAlpha=1}else if(q.mv&&!q.noDraw){R(g,'#8a6a3a',q.x-c,q.y,q.w,4);R(g,'#5a4426',q.x-c,q.y+4,q.w,2)}});
  LV.walls.forEach(q=>{if(q.off||q.noDraw)return;if(q.draw){q.draw(q,c);return}const x=q.x-c;if(q.k==='crate'){R(g,'#8a5a30',x,q.y,q.w,q.h);R(g,'#6a4020',x,q.y,q.w,2);limb(g,x+2,q.y+2,x+q.w-2,q.y+q.h-2,1,'#6a4020');limb(g,x+q.w-2,q.y+2,x+2,q.y+q.h-2,1,'#6a4020')}
    else if(q.k==='fence'){for(let i=0;i<q.w;i+=5)R(g,'#6a7a6a',x+i,q.y,2,q.h);R(g,'#8a9a8a',x,q.y+4,q.w,2);R(g,'#8a9a8a',x,q.y+q.h-8,q.w,2)}
    else if(q.k==='low'){R(g,'#5a4a3a',x,q.y,q.w,q.h);R(g,'#3a2e24',x,q.y+q.h-3,q.w,3)}
    else{R(g,'#6a6a62',x,q.y,q.w,q.h);R(g,'#8a8a80',x,q.y,q.w,2)}});
  // จุดพัก ของที่เก็บได้
  LV.cps.forEach(cp=>{if(cp.kind==='flag'){const x=cp.x-c;R(g,'#8a8a8a',x,GY-40,2,40);R(g,cp.used?'#9ff0c0':'#c69bff',x+2,GY-40,10,7)}});
  LV.items.forEach(it=>{if(it.got||(it.hid&&!it.shown))return;const x=it.x-c,y=it.y+Math.sin(T*3+it.t)*2;if(x<-20||x>W+20)return;
    if(it.kind==='coin'){const sp=Math.abs(Math.sin(T*4+it.t));R(g,'#c89a3a',x-3*sp-1,y-4,6*sp+2,8);R(g,'#ffe08a',x-2*sp,y-3,4*sp+1,5);R(g,'#5a3a08',x+1,y-7,1,5);return}
    if(it.kind==='note'){R(g,'#fff6e0',x-5,y-6,10,12);R(g,'#c8b890',x-5,y-6,10,2);R(g,'#7a5a3a',x-3,y-2,6,1);R(g,'#7a5a3a',x-3,y+1,6,1);g.globalAlpha=.4+.3*Math.sin(T*5);disc(g,'#ffe08a',x,y,9);g.globalAlpha=1}
    else if(it.kind==='mat'){const col={bamboo:'#9ac85a',wood:'#8a5a30',hide:'#e8d8b0',wax:'#9a9aa8',string:'#f2f0e8'}[it.m]||'#fff';R(g,col,x-4,y-4,8,8);R(g,'#2a1830',x-4,y+4,8,1);g.globalAlpha=.35;disc(g,'#9ff0c0',x,y,8);g.globalAlpha=1}
    else if(it.kind==='heal'){R(g,'#ff5a6a',x-4,y-3,8,6);R(g,'#ffffff',x-1,y-2,2,4);R(g,'#ffffff',x-2,y-1,4,2)}
    else if(it.kind==='lost'){R(g,it.col||'#3a7ad8',x-5,y-4,10,8);R(g,'#ffffff',x-3,y-2,6,1);g.globalAlpha=.35;disc(g,'#ffe08a',x,y,8);g.globalAlpha=1}});
  // ประตู/ทางแยก
  LV.doors.forEach(d=>{if(d.draw)d.draw(d,c)});
  // ตัวละครในฉาก
  LV.acts.forEach(a=>{if(!a.vis)return;const x=a.x-c;if(x<-40||x>W+40)return;if(a.glow){g.fillStyle='rgba(242,193,78,'+(.25+.15*Math.sin(T*4+a.x))+')';g.beginPath();g.ellipse(x,a.y-22,16,28,0,0,7);g.fill();R(g,'#ffe08a',x-6+Math.sin(T*3)*8,a.y-52-((T*20)%20),2,2)}if(a.draw){a.draw(a,x);return}drawSprite(g,setOf(a.id),a.pose,a.f,x,a.y,a.face,a.alpha)});
  LV.debris.forEach(d=>{const x=d.x-c,a=d.t>4?1-(d.t-4):1;g.globalAlpha=a;if(d.kind==='phone'){R(g,'#2a2a30',x-4,d.y-9,8,9);R(g,'#5a6a7a',x-3,d.y-8,6,6)}else{R(g,'#6a6f76',x-6,d.y-9,12,9);R(g,'#3a3f46',x-4,d.y-7,8,5);R(g,'#8a8f96',x-2,d.y-6,4,3)}g.globalAlpha=1});
  LV.en.forEach(e=>drawEnemy(e,c));
  if(LV.boss&&LV.boss.draw)LV.boss.draw(LV.boss,c);
  LV.eshots.forEach(s=>{const x=s.x-c;if(s.wave){g.strokeStyle=s.ref?'#9ff0c0':'#f2c14e';g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.arc(x-Math.sign(s.vx)*i*5,GY,8-i*2,Math.PI,0);g.stroke()}return}if(s.heart){disc(g,s.ref?'#9ff0c0':'#ff6a8a',x-3,s.y,4);disc(g,s.ref?'#9ff0c0':'#ff6a8a',x+3,s.y,4);g.fillStyle=s.ref?'#9ff0c0':'#ff6a8a';g.beginPath();g.moveTo(x-7,s.y+1);g.lineTo(x+7,s.y+1);g.lineTo(x,s.y+8);g.fill();return}
    g.fillStyle=s.ref?'rgba(160,240,190,.9)':'rgba(242,193,78,.88)';g.beginPath();g.ellipse(x,s.y,15,7,0,0,7);g.fill();R(g,'#fff2b0',x-8,s.y-2,16,1)});
  LV.shots.forEach(s=>{const x=s.x-c;if(s.kind==='wave'){g.strokeStyle=s.gold?'#ffd86a':'#bfe6ff';g.lineWidth=2;g.beginPath();g.arc(x-Math.sign(s.vx)*6,s.y,9,-1,1);if(s.vx<0){g.beginPath();g.arc(x+6,s.y,9,Math.PI-1,Math.PI+1)}g.stroke()}
    else{R(g,s.gold?'#ffd86a':'#ffffff',x-2,s.y-1,4,4);R(g,s.gold?'#ffd86a':'#ffffff',x+1,s.y-7,1,7);R(g,s.gold?'#ffd86a':'#ffffff',x+1,s.y-7,3,1)}});
  // ผู้เล่น
  if(P&&mode!=='title'&&!P.hide){const set=setOf(act());if(!(P.inv>0&&Math.floor(T*20)%2))drawSprite(g,set,P.pose,P.f,P.x-c,P.y,P.face);
    if(P.atk>=0&&P.ak&&P.ak.box&&P.atk>=P.ak.hit&&P.atk<P.ak.hit+.13){const ax=P.x-c+P.face*18;g.strokeStyle=P.lastQ==='chab'?'rgba(255,216,106,.9)':'rgba(255,255,255,.7)';g.lineWidth=P.lastQ==='chab'?3:2;g.beginPath();g.arc(ax-P.face*8,P.y-24,P.ak===ATK.heavy?24:18,P.face>0?-1.2:Math.PI-1.0,P.face>0?1.0:Math.PI+1.2);g.stroke()}
    if(P.parry>0){g.strokeStyle='rgba(255,224,120,.6)';g.lineWidth=2;g.beginPath();g.arc(P.x-c+P.face*10,P.y-24,16,P.face>0?-1.3:Math.PI-1.3,P.face>0?1.3:Math.PI+1.3);g.stroke()}
    // เพี้ยนน้อย
    const tx=P.x-P.face*22,ty=P.y-58+Math.sin(T*3)*3;PAL.vx+=(tx-PAL.x)*.08;PAL.vy+=(ty-PAL.y)*.08;PAL.vx*=.78;PAL.vy*=.78;PAL.x+=PAL.vx;PAL.y+=PAL.vy;
    g.drawImage(MINI[Math.floor(T*3)%2],Math.round(PAL.x-c-10),Math.round(PAL.y-15))}
  LV.fx.forEach(f=>{const a=Math.max(0,1-f.t/f.life);g.globalAlpha=a;if(f.beam){R(g,f.c,f.x0-c,f.y-1,f.x1-f.x0,3);R(g,'#ffffff',f.x0-c,f.y,f.x1-f.x0,1)}else if(f.ring){g.strokeStyle=f.c;g.lineWidth=2;g.beginPath();g.ellipse(f.x-c,f.y,f.r*(f.t/f.life),6*(f.t/f.life)+2,0,0,7);g.stroke()}else R(g,f.c,f.x-c,f.y,f.s,f.s)});g.globalAlpha=1;
  if(LV.drawFG)LV.drawFG(c);
  if(Lr.fg)g.drawImage(Lr.fg,-Math.round(c*1.2),0);
  if(LV.dark){const [dc,dx]=darkLayer();g.drawImage(dc,0,0)}
  const u=mode==='play'?nearUse():null;if(u){const x=u.x-c;g.strokeStyle='rgba(242,193,78,'+(.5+.3*Math.sin(T*6))+')';g.lineWidth=1;g.strokeRect(x-u.w/2+.5,(u.y||GY)-4.5,u.w-1,4)}
  if(LV.flash&&T-LV.flash.t<.5){g.fillStyle='rgba(255,236,160,'+(.6*(1-(T-LV.flash.t)/.5))+')';g.fillRect(-4,0,W+8,H)}
  if(FADE>0){g.fillStyle='rgba(8,4,12,'+FADE+')';g.fillRect(-4,0,W+8,H)}
  g.setTransform(1,0,0,1,0,0);
  drawUI(u);
}
let DARK=null;function darkLayer(){if(!DARK||DARK[0].width!==W)DARK=mk(W,H);const [dc,dx]=DARK;dx.globalCompositeOperation='source-over';dx.clearRect(0,0,W,H);dx.fillStyle='rgba(6,4,18,'+LV.dark+')';dx.fillRect(0,0,W,H);
  dx.globalCompositeOperation='destination-out';const L=(x,y,r)=>{const gr=dx.createRadialGradient(x,y,4,x,y,r);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');dx.fillStyle=gr;dx.beginPath();dx.arc(x,y,r,0,7);dx.fill()};
  L(P.x-cam,P.y-24,74+10*Math.sin(T*2));L(PAL.x-cam,PAL.y,30);(LV.lights||[]).forEach(l=>L(l.x-cam,l.y,l.r*(1+.1*Math.sin(T*3+l.x))));LV.en.forEach(e=>{if(!e.dead&&e.kind!=='echo')L(e.x-cam,ebox(e)[1],24)});dx.globalCompositeOperation='source-over';return DARK}
function drawEnemy(e,c){
  const sx=e.x-c;if(sx<-50||sx>W+50)return;const [ex,cy]=ebox(e),w=e.t,dead=e.dead?Math.min(1,(e.dt||0)*2):0;
  g.save();g.globalAlpha=1-dead;if(e.hit>0)g.globalAlpha*=.6+.4*Math.sin(T*60);
  if(e.kind==='echo'){const b=beat();g.globalAlpha*=Math.abs(P.x-e.x)<70? .85:.15+.5*Math.max(0,1-b.ph*3)}
  if(e.kind==='phone'){R(g,'#1a1a22',sx-9,cy-14,18,28);R(g,'#ffd86a',sx-7,cy-12,14,22);R(g,'#fff6d0',sx-5,cy-8,10,2);disc(g,'#ff6a8a',sx,cy+2,3);R(g,'#4a2a08',sx-4,cy-4,2,2);R(g,'#4a2a08',sx+2,cy-4,2,2);g.restore();return}
  drawShade(sx,cy,(e.kind==='float'? .95:e.kind==='mini'? .75:1.15)*(e.sc||1),e.face,w,{shield:e.shield,horn:e.kind==='shout',ground:e.kind!=='float'&&e.kind!=='echo',gy:e.y,dash:e.kind==='dash'});
  g.restore()}
/* วาดเงาคำลวง: สีทองเกล็ดเสียง ข้างในกลวง เห็นลำโพงเก่า */
function drawShade(sx,cy,s,face,w,o){o=o||{};const bw=13*s,bh=17*s;
  if(o.ground){g.fillStyle='rgba(30,16,8,.25)';g.beginPath();g.ellipse(sx,o.gy,10*s,2,0,0,7);g.fill()}
  g.fillStyle=o.col||'rgba(212,160,48,.9)';g.beginPath();g.moveTo(sx-bw,cy+bh*.6);for(let i=0;i<=8;i++){const a=Math.PI+i/8*Math.PI;g.lineTo(sx+Math.cos(a)*bw*(1+.06*Math.sin(w*6+i)),cy+Math.sin(a)*bh)}g.lineTo(sx+bw,cy+bh*.6);
  for(let i=0;i<5;i++)g.lineTo(sx+bw-(i+.5)*bw*2/5,cy+bh*.6+(i%2?-3:4)*s+Math.sin(w*5+i)*2);g.closePath();g.fill();
  for(let yy=-2;yy<3;yy++)for(let xx=-2;xx<3;xx++){if((xx+yy)%2)continue;const px=sx+(xx*5+(yy%2)*2)*s,py=cy+yy*5*s;if(Math.hypot(px-sx,(py-cy)*.8)<bw-3)R(g,'rgba(255,236,160,.8)',px,py,2*s,2*s)}
  g.fillStyle='rgba(40,20,10,.75)';g.beginPath();g.ellipse(sx,cy+2*s,bw*.45,bh*.38,0,0,7);g.fill();g.fillStyle='rgba(120,124,130,.7)';g.beginPath();g.arc(sx,cy+2*s,3*s,0,7);g.fill();
  const ex=sx+face*4*s;R(g,'#fff6d0',ex-4*s,cy-8*s,3*s,3*s);R(g,'#fff6d0',ex+2*s,cy-8*s,3*s,3*s);R(g,'#4a2a08',ex+(-3+face)*s,cy-7*s,s,2*s);R(g,'#4a2a08',ex+(3+face)*s,cy-7*s,s,2*s);
  if(o.horn){g.fillStyle='rgba(255,226,120,.9)';g.beginPath();g.moveTo(sx+face*bw,cy-2*s);g.lineTo(sx+face*(bw+8*s),cy-7*s);g.lineTo(sx+face*(bw+8*s),cy+5*s);g.fill()}
  if(o.shield){g.strokeStyle='rgba(180,210,255,.85)';g.lineWidth=2;g.beginPath();g.arc(sx,cy,bw+5,0,7);g.stroke();R(g,'#dff0ff',sx+face*(bw+3)-1,cy-6,3,12)}
  if(o.dash){R(g,'rgba(255,240,180,.7)',sx-face*(bw+4),cy-2,6,2);R(g,'rgba(255,240,180,.5)',sx-face*(bw+9),cy+3,5,2)}
  if(o.crown){g.fillStyle='#ffe060';g.beginPath();g.moveTo(sx-8*s,cy-bh+2);g.lineTo(sx-8*s,cy-bh-7*s);g.lineTo(sx-4*s,cy-bh-2*s);g.lineTo(sx,cy-bh-9*s);g.lineTo(sx+4*s,cy-bh-2*s);g.lineTo(sx+8*s,cy-bh-7*s);g.lineTo(sx+8*s,cy-bh+2);g.fill()}
}

/* UI ความละเอียดสูง */
const FONT='Mitr,Sarabun,Tahoma,sans-serif';
function wrap(t,maxW,font){ug.font=font;const out=[];let line='';
  for(const word of String(t).split(/(\s+)/)){if(!word)continue;const test=line+word;if(ug.measureText(test).width<=maxW||!line){if(ug.measureText(test).width>maxW){let cur=line;for(const ch of Array.from(word)){if(ug.measureText(cur+ch).width>maxW&&cur&&!/[ัิ-ฺ็-๎]/.test(ch)){out.push(cur);cur=ch}else cur+=ch}line=cur}else line=test}else{out.push(line.trimEnd());line=word.trimStart()}}
  if(line)out.push(line);return out}
function rr(x,y,w,h,r){ug.beginPath();ug.moveTo(x+r,y);ug.arcTo(x+w,y,x+w,y+h,r);ug.arcTo(x+w,y+h,x,y+h,r);ug.arcTo(x,y+h,x,y,r);ug.arcTo(x,y,x+w,y,r);ug.closePath()}
function bubble(x,y,text,opt){opt=opt||{};const fs=opt.fs||8.5,font=(opt.bold?'600 ':'')+fs+'px '+FONT,maxW=opt.w||150;const lines=wrap(text,maxW,font);ug.font=font;
  const tw=Math.min(maxW,Math.max(...lines.map(l=>ug.measureText(l).width))),pad=5,lh=fs*1.45,bh=lines.length*lh+pad*2-2,bw=tw+pad*2;
  let bx=clamp(x-bw/2,4,W-bw-4),by=y-bh-6;if(by<40)by=40;
  ug.fillStyle=opt.bg||'rgba(255,250,236,.96)';ug.strokeStyle=opt.bd||'#2a1830';ug.lineWidth=.8;rr(bx,by,bw,bh,5);ug.fill();ug.stroke();
  const ax=clamp(x,bx+6,bx+bw-6);ug.beginPath();ug.moveTo(ax-4,by+bh-.4);ug.lineTo(ax,by+bh+5);ug.lineTo(ax+4,by+bh-.4);ug.fill();
  ug.fillStyle=opt.fg||'#2a1830';ug.textBaseline='top';lines.forEach((l,i)=>ug.fillText(l,bx+pad,by+pad+i*lh+.5))}
function drawUI(u){
  const k=SC*DPR;ug.setTransform(1,0,0,1,0,0);ug.clearRect(0,0,ui.width,ui.height);ug.setTransform(k,0,0,k,0,0);ug.textBaseline='top';ug.imageSmoothingEnabled=false;
  const c=Math.round(cam),p=P;if(!p)return;
  // แถบสถานะ: ผู้เล่นที่ใช้อยู่ + ทีม
  ug.fillStyle='rgba(18,10,24,.66)';rr(6,6,132,34,6);ug.fill();
  const set=setOf(act());ug.drawImage(set.face,9,9,28,28);ug.strokeStyle='#f2c14e';ug.lineWidth=.8;ug.strokeRect(9,9,28,28);
  ug.font='600 7.5px '+FONT;ug.fillStyle='#fff6e0';ug.fillText(nameOf(act())+' · '+C().inst,41,8.5);
  ug.fillStyle='#3a2030';ug.fillRect(41,20,92,5);ug.fillStyle=p.hp>30?'#ff5a6a':'#ff2a3a';ug.fillRect(41,20,92*Math.max(0,p.hp)/maxHP(),5);
  ug.fillStyle='#1e2a40';ug.fillRect(41,28,92,4);ug.fillStyle=p.low>0&&Math.floor(T*10)%2?'#ff8a6a':'#6ac8ff';ug.fillRect(41,28,92*p.br/maxBR(),4);
  ug.font='5.5px '+FONT;ug.fillStyle='rgba(255,246,224,.7)';ug.fillText('ลมหายใจ',41,33);
  {const bx=W-128,by=44,full=(p.band||0)>=100;ug.fillStyle='rgba(18,10,24,.6)';rr(bx,by,68,12,5);ug.fill();ug.fillStyle=full&&Math.floor(T*6)%2?'#ffd86a':'rgba(255,246,224,.8)';ug.fillText(full?'พลังวงเต็ม!':'พลังวง',bx+4,by+3);ug.fillStyle='#3a2a10';ug.fillRect(bx+34,by+4,30,4);ug.fillStyle='#f2c14e';ug.fillRect(bx+34,by+4,30*(p.band||0)/100,4);
   ug.fillStyle='rgba(18,10,24,.6)';rr(bx,16,68,12,5);ug.fill();ug.fillStyle='#ffd86a';ug.font='600 6.5px '+FONT;ug.fillText('♪ '+(ST.coins||0)+(LV.coinTotal?' / '+LV.coinTotal:''),bx+5,18.5)}
  {const bx=$('#bX');if(bx)bx.classList.toggle('show',(p.band||0)>=100)}
  if(TEAM.length>1){TEAM.forEach((id,i)=>{const x=8+i*20,y=43;ug.globalAlpha=i===AI?1:.55;ug.drawImage(setOf(id).face,x,y,17,17);ug.strokeStyle=i===AI?'#f2c14e':'rgba(255,246,224,.4)';ug.strokeRect(x,y,17,17);ug.globalAlpha=1});
    if(!isTouch()){ug.font='5.5px '+FONT;ug.fillStyle='rgba(255,246,224,.6)';ug.fillText('Q สลับตัว',10+TEAM.length*20,48)}}
  // ความสามัคคี
  ug.font='5.5px '+FONT;ug.fillStyle='rgba(255,246,224,.75)';const ux=W-128;ug.fillStyle='rgba(18,10,24,.6)';rr(ux,30,68,12,5);ug.fill();ug.fillStyle='rgba(255,246,224,.8)';ug.fillText('สามัคคี',ux+4,33);ug.fillStyle='#2a3a2a';ug.fillRect(ux+28,34,36,4);ug.fillStyle='#9ff0c0';ug.fillRect(ux+28,34,36*(SAVE.unity||0)/100,4);
  // จังหวะ
  const b=beat(),cx0=W/2,isChabNext=((Math.floor(b.x)+1)%2+2)%2===1;
  ug.fillStyle='rgba(18,10,24,.6)';rr(cx0-40,6,80,20,6);ug.fill();
  const pulse=Math.max(0,1-b.ph*3);
  [[cx0-30,'ฉิ่ง',false],[cx0+8,'ฉับ',true]].forEach(([x,t,ch])=>{const ac=(b.chab===ch)&&Math.abs(b.d)<.2;ug.fillStyle=ch?'#c8962a':'#8a9aa8';ug.beginPath();ug.arc(x,16,4+(ac?pulse*2.5:0),0,7);ug.fill();ug.fillStyle=ac?'#fff6e0':'rgba(255,246,224,.55)';ug.font='600 7px '+FONT;ug.textBaseline='middle';ug.fillText(t,x+8,16.5);ug.textBaseline='top'});
  if(isChabNext){ug.strokeStyle='rgba(255,216,106,.85)';ug.lineWidth=1;ug.beginPath();ug.arc(cx0+8,16,4+(1-b.ph)*9,0,7);ug.stroke()}
  if(ST.combo>1){ug.font='600 8px '+FONT;ug.fillStyle='#ffd86a';ug.textAlign='center';ug.fillText('ตรงจังหวะ ×'+ST.combo,cx0,29);ug.textAlign='left'}
  // บอส
  const B=LV.boss;if(B&&!B.dead&&B.bar!==0){const bw=Math.min(240,W-120),bx=(W-bw)/2,by=H-22;ug.fillStyle='rgba(18,10,24,.75)';rr(bx-4,by-11,bw+8,19,5);ug.fill();ug.font='600 7px '+FONT;ug.fillStyle='#ffd86a';ug.fillText(B.name,bx,by-9);ug.fillStyle='#3a2030';ug.fillRect(bx,by,bw,4);ug.fillStyle='#f2c14e';ug.fillRect(bx,by,bw*Math.max(0,B.hp)/B.max,4)}
  // ป้ายใช้งาน
  if(u&&mode==='play'){ug.font='600 7.5px '+FONT;const t=(isTouch()?'ใช้: ':'E: ')+u.n,tw=ug.measureText(t).width+10;const sx=clamp(u.x-c-tw/2,4,W-tw-4);ug.fillStyle='rgba(18,10,24,.8)';rr(sx,(u.y||GY)-28,tw,13,6);ug.fill();ug.fillStyle='#ffd86a';ug.fillText(t,sx+5,(u.y||GY)-26)}
  const n=mode==='play'&&!u?nearActor():null;if(n){ug.font='600 7.5px '+FONT;const t=(isTouch()?'คุย: ':'E: ')+nameOf(n.id),tw=ug.measureText(t).width+10;const sx=clamp(n.x-c-tw/2,4,W-tw-4);ug.fillStyle='rgba(18,10,24,.8)';rr(sx,n.y-62,tw,13,6);ug.fill();ug.fillStyle='#ffd86a';ug.fillText(t,sx+5,n.y-60)}
  LV.doors.forEach(d=>{if(mode==='play'&&Math.abs(P.x-d.x)<d.w/2){ug.font='600 7.5px '+FONT;const t=(isTouch()?'ใช้: ':'E: ')+(d.n||'เข้าทางนี้'),tw=ug.measureText(t).width+10;const sx=clamp(d.x-c-tw/2,4,W-tw-4);ug.fillStyle='rgba(18,10,24,.8)';rr(sx,GY-74,tw,13,6);ug.fill();ug.fillStyle='#ffd86a';ug.fillText(t,sx+5,GY-72)}});
  LV.en.forEach(e=>{if(e.bub>0&&!e.dead){const cy=ebox(e)[1];bubble(e.x-c,cy-18,'“'+e.lie.t+'”',{bg:'rgba(60,36,8,.92)',fg:'#ffe08a',bd:'#f2c14e',w:130,fs:8})}});
  if(B&&B.bub>0)bubble(B.x-c,B.y-B.h-4,'“'+B.say+'”',{bg:'rgba(60,36,8,.94)',fg:'#ffe08a',bd:'#f2c14e',w:170,fs:8.5,bold:1});
  LV.eshots.forEach(s=>{if(s.heart||!s.w)return;ug.font='600 6.5px '+FONT;ug.fillStyle='#4a2a08';ug.textAlign='center';ug.textBaseline='middle';ug.fillText(s.w,s.x-c,s.y+.5);ug.textAlign='left';ug.textBaseline='top'});
  LV.pops.forEach(o=>{ug.globalAlpha=Math.max(0,1-o.t);ug.font='600 9px '+FONT;ug.textAlign='center';ug.lineWidth=2.4;ug.strokeStyle='rgba(30,16,30,.9)';ug.strokeText(o.s,o.x-c,o.y);ug.fillStyle=o.c;ug.fillText(o.s,o.x-c,o.y);ug.textAlign='left';ug.globalAlpha=1});
  LV.acts.forEach(a=>{if(a.bub&&a.vis)bubble(a.x-c,a.y-50,a.bub,{w:150,fs:8})});
  if(PAL.msg&&(mode==='play'||mode==='cr'||mode==='jam')){bubble(PAL.x-c,PAL.y-14,PAL.msg,{w:170,fs:8});PAL.mt-=1/60;if(PAL.mt<=0)nextSay()}
  if(mode==='cr'&&CR)drawCR();
  if(mode==='jam'&&JAM)drawJam();
  // แบนเนอร์
  if(BAN){const e=T-BAN.t0;if(e>BAN.d)BAN=null;else{const a=Math.min(1,e*4,(BAN.d-e)*3);ug.globalAlpha=a;ug.fillStyle='rgba(18,10,24,.82)';const bw=Math.min(W-40,300);rr((W-bw)/2,64,bw,BAN.s?40:26,8);ug.fill();ug.textAlign='center';ug.font='600 11px '+FONT;ug.fillStyle='#ffd86a';ug.fillText(BAN.t,W/2,70);if(BAN.s){ug.font='7.5px '+FONT;ug.fillStyle='#fff6e0';const ls=wrap(BAN.s,bw-20,'7.5px '+FONT);ug.textAlign='center';ls.slice(0,2).forEach((l,i)=>ug.fillText(l,W/2,86+i*9))}ug.textAlign='left';ug.globalAlpha=1}}
  if(mode==='talk'&&TALK){const [who,t]=TALK.lines[TALK.i];const bx=30,by=H-76,bw=W-60,bh=64;ug.fillStyle=who==='gold'?'rgba(48,30,6,.96)':'rgba(18,10,24,.95)';ug.strokeStyle='#f2c14e';ug.lineWidth=1;rr(bx,by,bw,bh,8);ug.fill();ug.stroke();
    let tx=bx+10;if(who&&who!=='sys'){if(who==='gold'){drawGoldFace(bx+8,by+8,46)}else if(who==='pian'){ug.fillStyle='#2a1838';ug.fillRect(bx+8,by+8,46,46);ug.drawImage(MINI[Math.floor(T*3)%2],bx+18,by+10,26,39)}else ug.drawImage(setOf(who).face,bx+8,by+8,46,46);tx=bx+62;
      ug.font='600 8px '+FONT;ug.fillStyle='#ffd86a';ug.fillText(nameOf(who),tx,by+7)}
    const lines=wrap(t,bw-(tx-bx)-12,'8.5px '+FONT);ug.font='8.5px '+FONT;ug.fillStyle=who==='gold'?'#ffe08a':'#fff6e0';lines.slice(0,3).forEach((l,i)=>ug.fillText(l,tx,by+(who&&who!=='sys'?20:12)+i*12.5));
    ug.font='6.5px '+FONT;ug.fillStyle='rgba(255,246,224,.55)';ug.textAlign='right';ug.fillText((isTouch()?'แตะ':'กด E')+' เพื่อไปต่อ ▸',bx+bw-8,by+bh-11);ug.textAlign='left'}
}
function drawGoldFace(x,y,s){ug.fillStyle='#1a1006';ug.fillRect(x,y,s,s);for(let i=0;i<14;i++){const h=(Math.sin(T*9+i*1.3)*.5+.5)*s*.7+3;ug.fillStyle='#f2c14e';ug.fillRect(x+3+i*3,y+s/2-h/2,2,h)}}
function drawCR(){const bw=150,bx=(W-bw)/2,by=H-78;ug.fillStyle='rgba(18,10,24,.86)';rr(bx-10,by-26,bw+20,74,10);ug.fill();ug.font='600 8px '+FONT;ug.fillStyle='#ffd86a';ug.textAlign='center';
  ug.fillText(CR.state==='listen'?'ฟังให้ดี… ('+(CR.r+1)+'/'+CR.rounds+')':CR.state==='play'?'ตีตามให้ครบ '+CR.i+'/'+CR.ph.length:'…',W/2,by-20);
  ['◀ ต่ำ','ตี กลาง','▶ สูง'].forEach((t,i)=>{const x=bx+i*52,lit=CR.flash[0]===i&&T-CR.flash[1]<.25;ug.fillStyle=lit?'#f2c14e':'rgba(255,246,224,.15)';rr(x,by,46,36,8);ug.fill();ug.fillStyle=lit?'#2b1a05':'#fff6e0';ug.font='600 8px '+FONT;ug.fillText(t,x+23,by+14)});
  ug.textAlign='left';const dots=CR.ph.length;for(let i=0;i<dots;i++){ug.fillStyle=CR.state==='play'&&i<CR.i?'#9ff0c0':'rgba(255,246,224,.3)';ug.beginPath();ug.arc(W/2-(dots-1)*5+i*10,by+43,2.5,0,7);ug.fill()}}
function drawJam(){const tn=now()-lat(),lx=W/2-75,ly=40,lh=H-100,hitY=ly+lh;ug.fillStyle='rgba(18,10,24,.78)';rr(lx-10,ly-14,170,lh+40,10);ug.fill();
  ug.font='600 8px '+FONT;ug.fillStyle='#ffd86a';ug.textAlign='center';ug.fillText(JAM.title,W/2,ly-10);
  for(let i=0;i<3;i++){const x=lx+i*52;ug.fillStyle='rgba(255,246,224,.07)';ug.fillRect(x,ly+4,46,lh);const lit=JAM.fl&&JAM.fl[0]===i&&T-JAM.fl[1]<.15;ug.fillStyle=lit?(JAM.fl[2]?'#f2c14e':'#ff8a8a'):'rgba(255,246,224,.25)';rr(x,hitY-4,46,10,4);ug.fill()}
  JAM.notes.forEach(n=>{if(n.st>0||n.st<0&&tn-(JAM.t0+n.b*BEAT)>.3)return;const dt=JAM.t0+n.b*BEAT-tn;const y=hitY-dt*120;if(y<ly-6||y>hitY+20)return;const x=lx+n.l*52;ug.fillStyle=n.st<0?'rgba(255,120,120,.5)':['#9fd0ff','#ffd86a','#ffa0c8'][n.l];rr(x+6,y-4,34,8,4);ug.fill()});
  ['◀','ตี','▶'].forEach((t,i)=>{ug.fillStyle='rgba(255,246,224,.7)';ug.font='600 7px '+FONT;ug.fillText(t,lx+i*52+23,hitY+9)});
  ug.font='600 7.5px '+FONT;ug.fillStyle='#9ff0c0';ug.fillText('ตีโดน '+JAM.hit+'/'+JAM.notes.length,W/2,hitY+19);ug.textAlign='left';
  JAM.who.forEach((id,i)=>{ug.drawImage(setOf(id).face,6,60+i*22,20,20)})}
