/* ====================================================================
   ตำนานสรรพวาทิต ภาค เจ็ดเสียงที่หายไปในแม่สอด — หน้าจอประลองเสียง (battle.js)
   บอสทุกฉากสู้ด้วย “เครื่องดนตรีจริง” แบบภาคแรก
   · ตาเงา: เงาเพี้ยนตีทำนองบนเครื่อง → ฟังแล้วตีตามให้ถูก ครบแล้วสวนกลับ
   · ตาเรา: ตีให้ตรงจังหวะตอนวงแหวนหดเข้าหาแป้น ยิ่งตรงยิ่งแรง
   · เพื่อนในทีมช่วยต่างกัน เช่น มหาพราหมณ์เปิดไฟให้มากขึ้น แว่นจดโน้ตให้ จักรแบ่งขนม
   ==================================================================== */
'use strict';
const NOTE8=['ด','ร','ม','ฟ','ซ','ล','ท','ดํ'];
const RF=i=>TS2.RANADF[10+i];
const INST={
  khong:{n:'ฆ้องวง',k:'gong',pads:NOTE8,play:(i,t,v)=>TS.khong(3+i,t,v)},
  ranad:{n:'ระนาดเอก',k:'bar',pads:NOTE8,play:(i,t,v)=>TS2.ranadKey(10+i,t,v)},
  thum:{n:'ระนาดทุ้ม',k:'bar',pads:NOTE8,play:(i,t,v)=>TS2.thum(10+i,t,v)},
  khlui:{n:'ขลุ่ย',k:'hole',pads:NOTE8,play:(i,t,v)=>TS2.khlui(RF(i),t,.34,v)},
  sor:{n:'ซอด้วง',k:'string',pads:['ด','ร','ม','ซ','ล'],play:(i,t,v)=>TS2.sor(RF([0,1,2,4,5][i]),t,.4,v)},
  sorou:{n:'ซออู้',k:'string',pads:['ด','ร','ม','ซ','ล'],play:(i,t,v)=>TS2.sorou(RF([0,1,2,4,5][i])/2,t,.45,v)},
  taphon:{n:'ตะโพน',k:'face',pads:['หน้าใหญ่','หน้าใหญ่อุด','หน้าเล็ก'],play:(i,t,v)=>TS2.taphon([0,2,3][i],t,v)},
  thon:{n:'โทน–รำมะนา',k:'face',pads:['ทั่ม','ติง','จ๊ะ','จ๊ง'],play:(i,t,v)=>TS2.thon([2,0,3,1][i],t,v)},
  klong:{n:'วงกลองหลวง',k:'face',pads:['กลองหลวง','ฉาบเปิด','ฉาบปิด','ฆ้อง'],play:(i,t,v)=>[()=>TS2.klong(0,t,v),()=>TS2.klchab(0,t,v),()=>TS2.klchab(1,t,v),()=>TS2.klmong(t,v)][i]()},
  ching:{n:'ฉิ่ง',k:'cup',pads:['ฉิ่ง','ฉับ'],play:(i,t,v)=>TS.ching(i===0,t,v)},
  chab:{n:'ฉาบ',k:'cym',pads:['ฉาบเปิด','ฉาบปิด'],play:(i,t,v)=>TS2.klchab(i,t,v)},
  harp:{n:'เตหน่ากู',k:'string',pads:['1','2','3','4','5','6'],play:(i,t,v)=>TS2.harp(i,t,v)},
  pinae:{n:'ปี่แน',k:'hole',pads:['ด','ร','ม','ซ','ล','ดํ'],play:(i,t,v)=>TS2.pinae(TS2.PINAEF[[1,2,3,5,6,8][i]],t,.32,v)},
  pat:{n:'ปัตวาย่ง',k:'gong',pads:['1','2','3','4','5','6'],play:(i,t,v)=>patwaing(i,t,(v||1)*1.4,SFX)}};
const inTeam=id=>TEAM.includes(id);
let BT=null;
function bEl(){let d=$('#battle');if(!d){d=document.createElement('div');d.id='battle';d.innerHTML='<div class="btop"><div class="bnm"></div><div class="bbar"><i></i></div><div class="bme"><span class="bmeh">♥</span><b></b></div></div><div class="bmsg"></div><div class="bside"><button id="bRep" class="bsm">🔁 ฟังอีกครั้ง</button><button id="bLv" class="bsm">ยอมแพ้</button></div><div class="bpads"></div><div class="blose"><div class="card"><h2>ยังไม่ไหว…</h2><p class="muted">เงาเพี้ยนยังไม่ยอม ลองใหม่ได้ทันที</p><div class="row" style="justify-content:center"><button class="btn" data-r="1">ลองใหม่</button><button class="btn ghost" data-r="2">ลองใหม่แบบง่าย</button></div></div></div>';document.body.appendChild(d)}return d}
function bUI(){const d=bEl();d.querySelector('.bnm').textContent=BT.name+' · '+INST[BT.inst].n;d.querySelector('.bbar i').style.width=Math.max(0,BT.hp/BT.max*100)+'%';d.querySelector('.bme b').textContent=Math.max(0,Math.round(P.hp))}
function bMsg(t){const m=bEl().querySelector('.bmsg');m.textContent=t||'';m.style.display=t?'':'none'}
function bPads(inst){const I=INST[inst],d=bEl().querySelector('.bpads');d.className='bpads k-'+I.k;
  d.innerHTML=I.pads.map((l,i)=>'<button data-p="'+i+'" style="--i:'+i+';--n:'+I.pads.length+'"><span>'+l+'</span><i class="ring"></i></button>').join('');
  d.onpointerdown=e=>{const b=e.target.closest('button[data-p]');if(!b)return;e.preventDefault();audio();const i=+b.dataset.p;b.classList.add('dn');setTimeout(()=>b.classList.remove('dn'),110);if(BT&&BT.press)BT.press(i)};
  return Array.from(d.querySelectorAll('button'))}
function bLit(btns,i,ms,col){const b=btns[i];if(!b)return;b.classList.add('lit');if(col)b.style.outline='3px solid '+col;setTimeout(()=>{b.classList.remove('lit');b.style.outline=''},ms)}
/* แป้นคีย์บอร์ด: 1–8 หรือ A S D F G H J K */
addEventListener('keydown',e=>{if(!BT||!BT.press||mode!=='battle')return;const m='12345678'.indexOf(e.key),n='asdfghjk'.indexOf(e.key.toLowerCase()),i=m>=0?m:n;if(i>=0&&i<INST[BT.inst].pads.length){audio();BT.press(i);const b=bEl().querySelector('[data-p="'+i+'"]');if(b){b.classList.add('dn');setTimeout(()=>b.classList.remove('dn'),110)}}});

function instBattle(def){return new Promise(async res=>{
  const easy=!!SAVE.easy;
  BT=Object.assign({hp:def.hp||100,max:def.hp||100,turn:0,easy,res},def);BT.inst=def.insts[0];
  mode='battle';audio();musicOn=false;const d=bEl();d.classList.add('on');d.classList.remove('lose');document.body.classList.add('inbattle');
  if(def.bpm)setTempo(def.bpm);
  bUI();bMsg(def.intro||('ประลองเสียงกับ '+def.name+'!'));await sleep(1300);
  $('#bLv').onclick=()=>{if(BT){BT.quit=1;if(BT.press)BT.press(-9)}};
  while(true){
    BT.inst=def.insts[BT.turn%def.insts.length];bUI();
    const r1=await echoTurn();if(BT.quit)break;
    if(P.hp<=0){const again=await loseBox();if(again){P.hp=maxHP();BT.hp=BT.max;BT.turn=0;BT.easy=!!SAVE.easy;bUI();continue}break}
    if(BT.hp<=0)break;
    const r2=await rhythmTurn();if(BT.quit)break;
    if(BT.hp<=0)break;
    BT.turn++;
  }
  const win=BT.hp<=0;
  if(win){bMsg('เงาเพี้ยนแตกกระจาย! เสียงกลับมาเป็นเสียงดนตรีจริงแล้ว');sfx(t=>{[10,12,14,15,17].forEach((k,i)=>TS2.ranadKey(k,t+i*.08,.6))});await sleep(1500)}
  d.classList.remove('on');document.body.classList.remove('inbattle');BT=null;musicOn=true;mode='play';if(STAGE&&STAGE.bpm)setTempo(STAGE.bpm);res(win)})}
function loseBox(){return new Promise(r=>{const d=bEl();d.classList.add('lose');d.querySelector('.blose').onclick=e=>{const b=e.target.closest('[data-r]');if(!b)return;if(b.dataset.r==='2'){SAVE.easy=1;store()}d.classList.remove('lose');r(1)}})}
function bHit(n,txt){BT.hp=Math.max(0,BT.hp-n);if(LV.boss){LV.boss.hit=.3}shake=.15;pop(LV.boss?LV.boss.x:cam+W*.7,(LV.boss?LV.boss.y-LV.boss.h:100),'-'+n+(txt?' '+txt:''),'#ffd86a');bUI()}
function bHurt(n){if(inTeam('mateo')&&Math.random()<.25){bMsg('มาเตโอตัวเล็ก หลบให้ทัน!');return}n=Math.max(1,Math.round(n*(BT.easy?.5:1)));P.hp-=n;shake=.2;sfx(t=>TS2.thon(3,t,.4));bUI();const m=bEl();m.classList.add('hurt');setTimeout(()=>m.classList.remove('hurt'),200)}

/* ตาเงา: ฟังแล้วตีตาม */
async function echoTurn(){
  const I=INST[BT.inst],np=I.pads.length,btns=bPads(BT.inst);
  if(inTeam('ing')&&Math.random()<.18){bMsg('อิ้งยิ้มหวาน… เงาเพี้ยนเขินจนลืมตีไปหนึ่งตา');await sleep(1600);return}
  if(inTeam('pob')&&Math.random()<.15){bMsg('พบธรรมแกล้งทำหน้าตลกใส่ เงาเพี้ยนหัวเราะจนงง!');bHit(6,'งง!');await sleep(1600);return}
  const [a,b]=BT.phr||[3,5];let len=Math.min(b,a+Math.floor(BT.turn/1.5));if(inTeam('captain'))len=Math.max(2,len-1);
  const seq=[];for(let i=0;i<len;i++){let g;do{g=Math.floor(Math.random()*np)}while(seq.length&&g===seq[seq.length-1]&&Math.random()<.75);seq.push(g)}
  /* ทำนองจริง: ตีวรรคสั้น ๆ จากเพลงไทย (songbook.js) แปลงลงจำนวนปุ่มของเครื่องนี้ */
  try{if(window.SB&&np>=4){const ph=SB.randomPhrase(len);if(ph&&ph.length===len){const m=ph.map(g=>Math.min(np-1,Math.round(g*(np-1)/7)));if(new Set(m).size>=2){seq.length=0;m.forEach(g=>seq.push(g))}}}}catch(e){}
  let show=BT.easy?len:(BT.show!=null?BT.show:2)+Math.floor(BT.turn/3)*0;if(inTeam('maha'))show+=2;if(BT.inst==='khlui'&&inTeam('jao'))show+=2;show=Math.min(len,show);
  const gap=(BT.gap||.48)*(BT.easy?1.2:1);let replays=(BT.easy?9:2)+(inTeam('foo')?1:0)+(inTeam('luwa')?1:0);
  const rp=$('#bRep');const upd=()=>{rp.textContent='🔁 ฟังอีกครั้ง'+(replays>8?'':' ('+replays+')');rp.disabled=replays<=0||BT.singing};
  const sing=async()=>{BT.singing=1;upd();const t0=AC?AC.currentTime+.15:0;seq.forEach((g,i)=>{sfx(()=>I.play(g,t0+i*gap,.95));if(i<show)setTimeout(()=>bLit(btns,g,gap*700),(.15+i*gap+lat())*1000)});if(LV.boss)LV.boss.sing=T;await sleep((len*gap+.35)*1000);BT.singing=0;upd()};
  bMsg(BT.inst==='klong'||BT.inst==='taphon'||BT.inst==='thon'||BT.inst==='ching'||BT.inst==='chab'?BT.name+' ตี'+I.n+' '+len+' ครั้ง… จำให้ได้!':BT.name+' เล่น'+I.n+' '+len+' เสียง… ฟังให้ดี!');
  await sleep(700);await sing();
  BT.seq=seq;BT.bk=0;bMsg('ตาเรา! ตีตามให้ครบ '+len+' เสียง'+(inTeam('waen')?' · แว่นจดให้: '+seq.map(g=>I.pads[g]).join(' '):''));
  let k=0,wrong=0;
  await new Promise(done=>{
    rp.onclick=async()=>{if(replays<=0||BT.singing)return;replays--;bMsg('ฟังอีกครั้ง… ตีต่อจากเสียงที่ '+(k+1));await sing()};
    BT.press=g=>{if(g===-9){BT.press=null;done();return}if(BT.singing)return;sfx(t=>I.play(g,t,.9));
      if(g===seq[k]){k++;bLit(btns,g,160,'#7ef08a');if(k>=len){BT.press=null;done()}}
      else{wrong++;bLit(btns,g,220,'#ff6a6a');bHurt(BT.atk||6);if(P.hp<=0){BT.press=null;done()}else bMsg('เพี้ยน! ลองต่อจากเสียงที่ '+(k+1)+(replays>0?' · กด 🔁 ฟังใหม่ได้':''))}}});
  rp.onclick=null;if(BT.quit||P.hp<=0)return;
  const dmg=Math.round((8+3*len)*(wrong?0.7:1)*(1+.15*(SAVE.up.atk||0)));bHit(dmg,wrong?'':'สวนกลับ!');sfx(t=>{TS2.chab(0,t,.5);TS.khong(10,t+.05,.5)});
  if(inTeam('yum')&&P.hp<maxHP()){P.hp=Math.min(maxHP(),P.hp+8);bMsg('ตีตามครบ! จักรแบ่งขนมให้ +8');}else bMsg(wrong?'ตีตามได้ แต่เพี้ยนไป '+wrong+' ครั้ง':'ตีตามได้ครบไม่มีพลาด! สวนกลับแรง');
  await sleep(1100)}

/* ตาเรา: ตีให้ตรงจังหวะ — วงแหวนหดเข้าหาแป้น */
function rhythmNotes(inst,n){const I=INST[inst],np=I.pads.length,out=[];
  const drumPat={klong:[[0,0],[1,1],[1.5,2],[2,0],[2.5,1],[3,3],[4,0],[5,1],[5.5,2],[6,0],[7,3]],taphon:[[0,0],[1,2],[1.5,2],[2,1],[3,0],[4,2],[5,0],[5.5,2],[6,1],[7,0]],thon:[[0,1],[1,0],[2,1],[2.5,2],[3,0],[4,1],[5,3],[6,0],[7,2]],ching:[[0,0],[1,1],[2,0],[3,1],[4,0],[5,1],[6,0],[6.5,0],[7,1]],chab:[[0,0],[1,1],[1.5,1],[2,0],[3,1],[4,0],[5,1],[6,0],[7,1]]};
  if(drumPat[inst])return drumPat[inst].map(([b,p])=>({b,p}));
  const song=gameSongChunk(np);if(song&&song.length>=6)return song.slice(0,n||10);
  let j=Math.floor(np/2);for(let b=0;b<8;b+=(Math.random()<.3?.5:1)){j=clamp(j+pick([-2,-1,-1,1,1,2]),0,np-1);out.push({b,p:j})}return out}
async function rhythmTurn(){
  const I=INST[BT.inst],btns=bPads(BT.inst),notes=rhythmNotes(BT.inst,10);
  bMsg('ตาเรา! ตีตอนวงแหวนหดแตะแป้นพอดี ตรงจังหวะ = แรง');
  const t0=nb()+BEAT*2,spd=BT.easy?1.25:1;notes.forEach(n=>{n.t=t0+n.b*BEAT*spd;n.st=0});
  (BT.layers||[]).forEach(L=>{const LI=INST[L];notes.forEach(n=>sfx(()=>LI.play(clamp(n.p,0,LI.pads.length-1),n.t,.4)))});
  let hit=0,perf=0;BT.notes=notes;BT.seq=null;
  BT.press=g=>{const tn=now()-lat();let best=null,bd=1;notes.forEach(n=>{if(n.st||n.p!==g)return;const d=Math.abs(n.t-tn);if(d<bd){bd=d;best=n}});
    sfx(t=>I.play(g,t,.9));if(best&&bd<.22){best.st=bd<.08?2:1;hit++;if(best.st===2)perf++;bLit(btns,g,140,best.st===2?'#ffd86a':'#7ef08a')}else bLit(btns,g,140,'#ff6a6a')};
  const end=notes[notes.length-1].t+.6;
  await new Promise(done=>{const f=()=>{if(!BT||BT.quit){done();return}const tn=now()-lat();
    btns.forEach((b,i)=>{const nx=notes.filter(n=>n.p===i&&!n.st&&n.t>tn-.15).sort((a,c)=>a.t-c.t)[0];const r=b.querySelector('.ring');if(nx&&nx.t-tn<1.1){const k=Math.max(0,(nx.t-tn))/1.1;r.style.opacity=String(1-k*.6);r.style.transform='scale('+(1+k*1.6)+')'}else{r.style.opacity='0'}});
    notes.forEach(n=>{if(!n.st&&tn>n.t+.22)n.st=-1});
    if(tn>end){btns.forEach(b=>b.querySelector('.ring').style.opacity='0');done();return}requestAnimationFrame(f)};f()});
  BT.press=null;if(BT.quit)return;
  const mul=(1+.15*(SAVE.up.atk||0))*(inTeam('che')?1.3:1);const dmg=Math.round((hit*2.6+perf*1.6)*mul);
  if(dmg>0)bHit(dmg,perf>=notes.length*.6?'สุดยอด!':'');bMsg('ตีโดน '+hit+'/'+notes.length+(perf?' · ตรงเป๊ะ '+perf:''));P.band=Math.min(100,(P.band||0)+hit*3);
  await sleep(1000)}

/* เพลงจบภาค: “เพลงเกม” จากคลังโน้ตของชมรม (ครูเพิ่มเองในแอป) ถ้ายังไม่มีใช้ทำนองชั่วคราว */
let GSONG=null;
function decBar(b){const out=[];let i=0;while(i<b.length&&out.length<4){const c=b[i];
  if(c==='~'||c==='-'){out.push(null);i++}
  else if(c==='['){const j=b.indexOf(']',i),body=b.slice(i+1,j),k=body.indexOf(':'),tk=body.slice(k+1),m=tk.match(/[a-p]/);out.push(m?m[0].charCodeAt(0)-97:null);i=j+1}
  else if(c==='('){const j=b.indexOf(')',i),v=b.slice(i+1,j).split('').map(x=>x.charCodeAt(0)-97).filter(x=>x>=0&&x<16);out.push(v.length?Math.max(...v):null);i=j+1}
  else{const v=c.charCodeAt(0)-97;out.push(v>=0&&v<16?v:null);i++}}while(out.length<4)out.push(null);return out}
function gameSong(){if(GSONG)return GSONG;
  try{const Pw=window.parent;const D=(Pw&&Pw!==window&&Pw.APP&&Pw.APP.D)||{},L=Object.assign({},D.libsub||{},D.library||{});
    const k=Object.keys(L).find(k=>{const x=L[k];return x&&x.kind==='song'&&x.song&&/เพลงเกม/.test((x.song.title||'')+' '+(x.title||''))});
    if(k){const sg=L[k].song,ls=Array.isArray(sg.lines)?sg.lines:Object.values(sg.lines||{});const out=[];let slot=0;
      ls.forEach(l=>{for(let r=0;r<(+l.rep===2?2:1);r++)String(l.bars||'').trim().split(/\s+/).filter(Boolean).forEach(b=>decBar(b).forEach(g=>{if(g!=null)out.push({s:slot,g});slot++}))});
      if(out.length>=8){GSONG={notes:out,src:'lib',title:sg.title||L[k].title,bpm:+sg.bpm||0};try{localStorage.setItem('spw_pisat2_song',JSON.stringify(GSONG))}catch(e){}return GSONG}}}catch(e){}
  try{const c=JSON.parse(localStorage.getItem('spw_pisat2_song')||'null');if(c&&c.notes&&c.notes.length){GSONG=c;return GSONG}}catch(e){}
  const P8=[3,4,5,7,8,10];const out=[];let j=2;for(let s=0;s<64;s++){if(s%2===1||Math.random()<.25){j=clamp(j+pick([-1,-1,0,1,1,2,-2]),0,5);out.push({s,g:P8[j]})}}
  GSONG={notes:out,src:'gen',title:'ทำนองชั่วคราว (รอ “เพลงเกม” ในคลังโน้ต)'};return GSONG}
/* แปลงช่วงหนึ่งของเพลงเป็นโน้ตบนแป้น 8 ลูก (ด–ดํ = ลูกฆ้อง 3–10) */
function gameSongChunk(np){const s=gameSong();if(!s||!s.notes.length)return null;const base=s.notes[0].s,nc=Math.max(1,Math.ceil((s.notes[s.notes.length-1].s-base+1)/16)),c=(BT?BT.turn:0)%nc,a=base+c*16;
  const part=s.notes.filter(n=>n.s>=a&&n.s<a+16);if(part.length<4)return null;
  /* พับเสียงที่เกินช่วงแป้นกลับเข้าคู่แปด (ลูกฆ้อง 3–10 = ด–ดํ) แป้นที่น้อยกว่า 8 ลูก ย่อสัดส่วนลง */
  return part.map(n=>{let v=n.g;while(v>10)v-=7;while(v<3)v+=7;return {b:(n.s-a)/2,p:np>=8?v-3:clamp(Math.round((v-3)*(np-1)/7),0,np-1)}})}

/* คอนเสิร์ตจบภาค: เล่น “เพลงเกม” ทีละเครื่อง เครื่องที่เล่นผ่านแล้วจะคลอตามไปเรื่อย ๆ จนครบวง */
function concert(list,title){return new Promise(async res=>{BT={name:title||'เพลงเกม',hp:1,max:1,turn:0,easy:!!SAVE.easy,layers:[],inst:list[0]};
  mode='battle';audio();musicOn=false;const d=bEl();d.classList.add('on','concert');document.body.classList.add('inbattle');let tot=0,hits=0;
  const s=gameSong();if(s.bpm)setTempo(clamp(s.bpm,70,130));bMsg('บรรเลง “'+s.title+'” · เครื่องดนตรีเข้าวงทีละเสียง');await sleep(1600);
  for(let i=0;i<list.length;i++){BT.inst=list[i];BT.turn=i;d.querySelector('.bnm').textContent='เสียงที่ '+(i+1)+' · '+INST[list[i]].n;d.querySelector('.bbar i').style.width=((i)/list.length*100)+'%';
    const before=BT.hp;await rhythmTurn();BT.layers.push(list[i]);BT.hp=1}
  d.querySelector('.bbar i').style.width='100%';bMsg('ครบทั้งวง!');sfx(t=>{TS.khong(3,t,.7);TS.khong(10,t,.6);TS2.ranadKey(17,t,.6);TS2.that(0,t,.8)});await sleep(1600);
  d.classList.remove('on','concert');document.body.classList.remove('inbattle');BT=null;musicOn=true;mode='play';if(STAGE&&STAGE.bpm)setTempo(STAGE.bpm);res()})}
