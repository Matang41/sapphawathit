/* ====================================================================
   ตำนานสรรพวาทิต ภาค เจ็ดเสียงที่หายไปในแม่สอด — หน้าจอเมนู แผนที่ ร้านช่าง สมุด และวนลูปเกม (ui.js)
   ==================================================================== */
'use strict';
const SCR=['#title','#build','#reason','#map','#shop','#book','#pause','#res','#credits'];
function show(id){SCR.forEach(s=>{const e=$(s);if(e)e.classList.toggle('on',s===id)});document.body.classList.toggle('play',!id);if(id)mode=id.slice(1);fit()}
const PINS={1:[.47,.47],2:[.6,.22],3:[.86,.36],4:[.72,.12],5:[.14,.5],6:[.2,.8],7:[.53,.56]};
const PLACE={1:'ห้อง 512',2:'อุโมงค์ไผ่ทิวไผ่งาม',3:'น้ำตกธารารักษ์',4:'บ่อน้ำร้อนแม่กาษา',5:'ตลาดริมเมย',6:'ชุมชนแม่โกนเกน',7:'หอประชุม'};

/* ---------- หน้าแรก ---------- */
function titleScreen(){show('#title');MUSIC=null;
  const has=SAVE.spec&&SAVE.reason;$('#tBtns').innerHTML=has?'<button class="btn" id="tGo">เล่นต่อเป็น '+esc(SAVE.name||'สมาชิกใหม่')+'</button><button class="btn ghost" id="tNew">สร้างตัวละครใหม่</button>':'<button class="btn" id="tNew">เริ่มเป็นสมาชิกใหม่</button>';
  if(has)$('#tGo').onclick=()=>{audio();mapScreen()};
  $('#tNew').onclick=async()=>{if(has&&Object.keys(SAVE.done).length){const i=await choose('เริ่มเกมใหม่ตั้งแต่ฉากที่ 1? (โน้ตทอง การปรับเครื่อง และบันทึกความรู้ยังอยู่)',['เริ่มใหม่','ยกเลิก']);if(i!==0)return;resetStory(SAVE);store()}buildScreen()};
  if(SAVE.migrated){delete SAVE.migrated;store();$('#tBtns').insertAdjacentHTML('afterend','<p class="muted" style="color:#ffd86a">ภาค 2 มีเนื้อเรื่องใหม่ทั้งหมด ความคืบหน้าเดิมจึงเริ่มฉากที่ 1 ใหม่ ตัวละคร โน้ตทอง และการปรับเครื่องยังอยู่ครบ</p>')}
  const tc=$('#tcv').getContext('2d');tc.imageSmoothingEnabled=false;tc.clearRect(0,0,240,48);['maha','pob','luwa','che','jao','tang','foo','waen','kaimuk','ice','mateo'].forEach((k,i)=>tc.drawImage(setOf(k).idle[0],i*20+4,0));tc.drawImage(MINI[0],224,12)}
/* ---------- สร้างตัวละคร ---------- */
let B=null,bset=null;
function buildScreen(){show('#build');B=Object.assign({},SAVE.spec||appSpec()||PX.PRESETS.jao);$('#bName').value=SAVE.name||'';
  const ap=appSpec(),pres=Object.keys(PX.PRESETS).filter(k=>k!=='tang');
  $('#bPre').innerHTML=(ap?'<button data-pre="_app"><img src="'+PX.avatar(ap,48,'#3a2240')+'"><span>อวตารในแอป</span></button>':'')+pres.map(k=>'<button data-pre="'+k+'"><img src="'+PX.avatar(PX.PRESETS[k],48,'#3a2240')+'"><span>'+PX.NAMES[k]+'</span></button>').join('');paintB()}
function paintB(){
  $('#bSkin').innerHTML=PX.SKIN.map(v=>'<button data-k="skin" data-v="'+v+'" style="background:'+v+'" class="'+(v===B.skin?'on':'')+'"></button>').join('');
  $('#bHc').innerHTML=PX.HCOL.map(v=>'<button data-k="hair" data-v="'+v+'" style="background:'+v+'" class="'+(v===B.hair?'on':'')+'"></button>').join('');
  $('#bHs').innerHTML=PX.HAIR.map(([v,n])=>'<button data-hs="'+v+'" class="'+(B.hs===v?'on':'')+'">'+n+'</button>').join('');
  $('#bOut').innerHTML=PX.OUTFIT.filter(o=>o[0]!=='สูทครู').map(([n,o])=>'<button data-of="'+n+'" class="'+(o.shirt===B.shirt&&!!o.skirt===!!B.skirt?'on':'')+'">'+n+'</button>').join('');
  $('#bEx').innerHTML=[['glass','แว่นตา'],['chub','แก้มป่อง'],['blush','แก้มแดง']].map(([k,n])=>'<button data-t="'+k+'" class="'+(B[k]?'on':'')+'">'+n+'</button>').join('');
  bset=frames(B,'mallet')}
$('#build').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!b.closest('.bopts'))return;
  if(b.dataset.pre)B=Object.assign({},b.dataset.pre==='_app'?appSpec():PX.PRESETS[b.dataset.pre]);
  else if(b.dataset.k)B[b.dataset.k]=b.dataset.v;else if(b.dataset.hs)B.hs=b.dataset.hs;
  else if(b.dataset.of)Object.assign(B,PX.OUTFIT.find(x=>x[0]===b.dataset.of)[1]);
  else if(b.dataset.t){const t=b.dataset.t;if(B[t])delete B[t];else B[t]=t==='glass'?'#a8a8b8':t==='blush'?'#d0706a':1}
  else return;Object.keys(B).forEach(k=>{if(B[k]===0)delete B[k]});paintB()});
$('#bBack').onclick=()=>titleScreen();
$('#bNext').onclick=()=>{SAVE.spec=Object.assign({},B);SAVE.name=$('#bName').value.trim()||'สมาชิกใหม่';store();reasonScreen()};
function reasonScreen(){show('#reason');$('#rList').innerHTML=REASONS.map(r=>'<button data-r="'+r.id+'" class="'+(SAVE.reason===r.id?'on':'')+'"><b>'+r.n+'</b>'+r.d+'</button>').join('');$('#rGo').disabled=!SAVE.reason}
$('#rList').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;SAVE.reason=b.dataset.r;store();$$('#rList button').forEach(x=>x.classList.toggle('on',x===b));$('#rGo').disabled=false});
$('#rBack').onclick=()=>buildScreen();
$('#rGo').onclick=()=>{audio();if(!SAVE.done[1])travel(1);else mapScreen()};

/* ---------- แผนที่แม่สอด ---------- */
let SEL=1;
/* แผนที่เปิด: ผ่านฉาก 1 แล้วไปฉาก 2–6 ลำดับไหนก็ได้ · ครบ 2–6 แล้วฉาก 7 จึงเปิด */
const isOpen=n=>n===1||(SAVE.done[1]&&n<=6)||(n===7&&[2,3,4,5,6].every(k=>SAVE.done[k]));
const nextOpen=()=>{for(let n=1;n<=7;n++)if(isOpen(n)&&!SAVE.done[n])return n;return 7};
function mapScreen(){show('#map');MUSIC=null;if(!SEL||!isOpen(SEL)||SAVE.done[SEL])SEL=nextOpen();drawMap();mapPanel()}
function drawMap(){const c=$('#mcv'),x=c.getContext('2d'),w=c.width,h=c.height;drawMapArt(x,w,h);
  for(let n=1;n<=7;n++){const [px,py]=PINS[n],X=px*w,Y=py*h,open=isOpen(n),done=SAVE.done[n];
    x.fillStyle=done?'#3a9a5a':open?'#c03040':'#8a8070';x.beginPath();x.arc(X,Y,n===SEL?14:11,0,7);x.fill();x.strokeStyle=n===SEL?'#ffd86a':'#fff6e0';x.lineWidth=n===SEL?3:2;x.stroke();
    x.fillStyle='#fff';x.font='600 12px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText(open?String(n):'?',X,Y+1);x.fillStyle='#3a2a1a';x.font='600 10px '+FONT;x.fillText(open?PLACE[n]:'???',X,Y+(n===7?24:-22));if(SAVE.rate&&SAVE.rate[n]){x.fillStyle='#c8962a';x.font='600 10px '+FONT;x.fillText('★'.repeat(SAVE.rate[n]),X,Y+(n===7?36:16))}}
  const [sx,sy]=[.4*w,.66*h];x.fillStyle='#6a4a8a';x.fillRect(sx-9,sy-9,18,18);x.fillStyle='#fff';x.font='600 10px '+FONT;x.fillText('ช่าง',sx,sy);x.textAlign='left';x.textBaseline='alphabetic'}
$('#mcv').addEventListener('click',e=>{const c=$('#mcv'),r=c.getBoundingClientRect(),mx=(e.clientX-r.left)/r.width*c.width,my=(e.clientY-r.top)/r.height*c.height;
  for(let n=1;n<=7;n++){const [px,py]=PINS[n];if(Math.hypot(px*c.width-mx,py*c.height-my)<20&&isOpen(n)){SEL=n;drawMap();mapPanel();return}}
  if(Math.hypot(.4*c.width-mx,.66*c.height-my)<18)shopScreen()});
function mapPanel(){const S=STAGES[SEL],pool=(SAVE.pool||[]);SAVE.team=(SAVE.team||[]).filter(id=>pool.includes(id)).slice(0,2);
  if(SAVE.team.length<2)pool.forEach(id=>{if(SAVE.team.length<2&&!SAVE.team.includes(id))SAVE.team.push(id)});
  const tot=Object.values(SAVE.stars).reduce((a,b)=>a+b,0);
  $('#mInfo').innerHTML='<div class="muted">ฉากที่ '+SEL+(SAVE.done[SEL]?' · ผ่านแล้ว ✓':'')+'</div><h2>'+esc(S.name)+'</h2><p class="muted">'+esc(S.sub)+'</p><p>เสียงที่ '+SEL+': '+S.who.map(nameOf).join(' ')+' — '+esc(S.inst)+'</p>'+
    (SEL>1&&pool.length?'<div class="lb">ทีมที่ไปด้วย (เลือก 2 คน)</div><div class="pre" id="mTeam">'+pool.filter(id=>!(S.who.includes(id)&&!SAVE.done[SEL])).map(id=>'<button data-id="'+id+'" class="'+(SAVE.team.includes(id)?'on':'')+'"><img src="'+setOf(id).face.toDataURL()+'"><span>'+esc(nameOf(id))+'</span><small>'+esc(CHAR[id].inst)+(CHAR[id].abn?' · '+esc(CHAR[id].abn):'')+'</small></button>').join('')+'</div>':'')+
    '<div class="row" style="margin-top:10px"><button class="btn" id="mGo">ออกเดินทาง</button></div>'+
    '<p class="muted" style="margin-top:8px">ดาวคุณธรรม '+tot+' · ความสามัคคี '+(SAVE.unity||0)+'/100 · บันทึกความรู้ '+SAVE.notes.length+'/'+Object.keys(NOTES).length+'</p>';
  $('#mGo').onclick=()=>travel(SEL);
  const mt=$('#mTeam');if(mt)mt.onclick=e=>{const b=e.target.closest('button');if(!b)return;const id=b.dataset.id;if(SAVE.team.includes(id))SAVE.team=SAVE.team.filter(x=>x!==id);else{SAVE.team.push(id);if(SAVE.team.length>2)SAVE.team.shift()}store();mapPanel()}}
$('#mShop').onclick=()=>shopScreen();$('#mBook').onclick=()=>bookScreen();$('#mEdit').onclick=()=>buildScreen();$('#mHome').onclick=()=>titleScreen();

/* ---------- ร้านช่างเครื่องดนตรีในตัวเมือง ---------- */
const UPG=[{k:'atk',n:'แรงตี',d:'เปลี่ยนไม้ตีและหนังหุ้มให้แน่นขึ้น ตีแรงขึ้น 15% ต่อขั้น'},{k:'hp',n:'พลังชีวิต',d:'ซ้อมทุกวัน ใจนิ่งขึ้น พลังเพิ่ม 20 ต่อขั้น'},{k:'br',n:'ลมหายใจ',d:'ฝึกเป่าขลุ่ยไม้ไผ่ ลมหายใจเพิ่ม 20 ต่อขั้น'},{k:'mag',n:'แม่เหล็กโน้ต',d:'ดูดโน้ตทองจากไกลขึ้น'}];
const upCost=lv=>[40,90,160][lv];
function shopScreen(){show('#shop');const c=SAVE.coins||0;
  $('#sBody').innerHTML='<p class="muted">ลุงช่างทำเครื่องดนตรีในตัวเมืองแม่สอด รับโน้ตทองที่เก็บได้ไปปรับเครื่องให้ (วัตถุดิบที่เก็บได้แลกเป็นโน้ตทองให้แล้ว)</p><p style="font-size:18px;color:#ffd86a">♪ โน้ตทอง '+c+'</p>'+
    UPG.map(u=>{const lv=SAVE.up[u.k]||0,cost=upCost(lv),ok=lv<3&&c>=cost;return '<div class="stat"><b>'+u.n+' ขั้น '+lv+'/3</b>'+u.d+'<br>'+(lv<3?'<span class="muted">ใช้ ♪ '+cost+'</span><br><button class="btn sm" data-u="'+u.k+'"'+(ok?'':' disabled')+'>ปรับ</button>':'<span class="muted">เต็มแล้ว</span>')+'</div>'}).join('')}
$('#sBody').addEventListener('click',e=>{const b=e.target.closest('[data-u]');if(!b)return;const u=UPG.find(x=>x.k===b.dataset.u),lv=SAVE.up[u.k]||0,cost=upCost(lv);if((SAVE.coins||0)<cost||lv>=3)return;SAVE.coins-=cost;SAVE.up[u.k]=lv+1;store();sfx(t=>{TS2.ranadKey(14,t,.6);TS2.ranadKey(17,t+.1,.6);TS2.ranadKey(21,t+.2,.6)});shopScreen()});
$('#sBack').onclick=()=>mapScreen();
/* ---------- สมุดบันทึก ---------- */
let BOOKTAB='lies';
function bookScreen(){show('#book');const tabs=[['quests','เควสที่ทำสำเร็จ'],['notes','บันทึกความรู้'],['stars','ดาวคุณธรรม']];if(!tabs.some(t=>t[0]===BOOKTAB))BOOKTAB='quests';
  $('#kTabs').innerHTML=tabs.map(([k,n])=>'<button data-k="'+k+'" class="'+(BOOKTAB===k?'on':'')+'">'+n+'</button>').join('');
  let h='';if(BOOKTAB==='quests'){const L=SAVE.qlog||{},ks=Object.keys(L);h=ks.length?[1,2,3,4,5,6,7].map(n=>{const q=ks.filter(k=>k.split(':')[0]==n);return q.length?'<div class="lb">ฉากที่ '+n+' · '+esc(STAGES[n].name)+'</div><ul class="lies">'+q.map(k=>'<li>✓ '+esc(L[k])+'</li>').join('')+'</ul>':''}).join(''):'<p class="muted">ยังไม่มีเควสที่ทำสำเร็จ ลองคุยกับคนที่มีเครื่องหมาย “!” บนหัว</p>'}
  else if(BOOKTAB==='notes')h='<ul class="lies">'+Object.keys(NOTES).map(k=>'<li>'+(SAVE.notes.includes(k)?esc(NOTES[k].t):'<span class="muted">??? ยังไม่พบ</span>')+'</li>').join('')+'</ul>';
  else h='<p class="muted">ตามคุณลักษณะอันพึงประสงค์ 8 ประการ (ในเกมเท่านั้น ไม่ใช้ประเมินนักเรียนจริง)</p><ul class="lies">'+VIRTUE.map((v,i)=>'<li>'+esc(v)+' <span>★ '+(SAVE.stars[i]||0)+'</span></li>').join('')+'</ul>';
  $('#kBody').innerHTML=h}
$('#kTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;BOOKTAB=b.dataset.k;bookScreen()});$('#kBack').onclick=()=>mapScreen();

/* ---------- นั่งรถสองแถวระหว่างฉาก ---------- */
let TRAV=null;
function travel(n){audio();show(null);mode='travel';const dusk=n===3||n===7;TRAV={n,t:0,img:townStrip(dusk),dur:3.6};
  $('#stage').onpointerdown=()=>{if(mode==='travel')TRAV.t=TRAV.dur}}
function travelTick(dt){TRAV.t+=dt;const x=-(TRAV.t*140)%(TRAV.img.width-W);g.setTransform(1,0,0,1,0,0);g.drawImage(TRAV.img,Math.round(x),0);drawSongthaew(g,W*.38,GY+14,TRAV.t);
  const k=SC*DPR;ug.setTransform(1,0,0,1,0,0);ug.clearRect(0,0,ui.width,ui.height);ug.setTransform(k,0,0,k,0,0);ug.fillStyle='rgba(18,10,24,.8)';rr(W/2-120,20,240,40,8);ug.fill();ug.textAlign='center';ug.textBaseline='top';ug.font='600 11px '+FONT;ug.fillStyle='#ffd86a';ug.fillText('ฉากที่ '+TRAV.n+' · '+STAGES[TRAV.n].name,W/2,26);ug.font='7.5px '+FONT;ug.fillStyle='#fff6e0';ug.fillText(TRAV.n===1?'โรงเรียนสรรพวิทยาคม ตัวเมืองแม่สอด':'นั่งรถสองแถวจากตัวเมืองแม่สอดไป'+PLACE[TRAV.n],W/2,43);ug.font='6.5px '+FONT;ug.fillStyle='rgba(255,246,224,.6)';ug.fillText('แตะเพื่อข้าม',W/2,H-14);ug.textAlign='left';
  if(TRAV.t>=TRAV.dur){const n=TRAV.n;TRAV=null;$('#stage').onpointerdown=null;startStage(n)}}

/* ---------- โน้ตทองตามทาง: แถวบนพื้น โค้งข้ามหลุม และบนแพลตฟอร์ม ---------- */
function scatterCoins(){const end=LV.w-460;let n=0;
  const inWorld=x=>x<(LV.mainW||LV.w)-60||Object.values(LV.rooms).some(r=>x>r[0]+30&&x<r[1]-90);
  for(let x=180;x<end;x+=120){if(!inWorld(x))continue;const ok=[0,20,40].every(d=>groundAt(x+d))&&!LV.walls.some(q=>q.k!=='fence'&&x+48>q.x&&x-8<q.x+q.w&&q.y<GY);
    if(ok){for(let i=0;i<3;i++){item(x+i*18,GY-16,'coin');n++}}else{for(let i=0;i<4;i++){item(x+i*16,GY-40-Math.sin(i/3*Math.PI)*24,'coin');n++}}}
  LV.plats.forEach(q=>{if(q.hid||q.w<30||q.y<60)return;for(let i=0;i<Math.min(3,Math.floor(q.w/20));i++){item(q.x+10+i*16,q.y-14,'coin');n++}});
  LV.coinTotal=n}
/* ---------- เล่นฉาก ---------- */
async function startStage(n){
  STAGE=STAGES[n];LV=newLevel(STAGE.w);lieI=n*2;
  for(const k in ST)delete ST[k];Object.assign(ST,{start:Date.now(),starList:[],noteList:[],hits:0,onChab:0,onChing:0,swings:0,kills:0,best:0,combo:0,lies:[],falls:0,lowTold:0,lieTold:0,stars:0,unity:0,lost:null,helped:0,kuay:0,kuayDone:0,noteStar:0,crMiss:0,jam:0,coins:0,coinsLv:0,cs:0,blasts:0,rate:0,coinPct:0});
  TEAM=STAGE.team?STAGE.team.slice():['me'].concat((SAVE.team||[]).filter(id=>(SAVE.pool||[]).includes(id)&&!(STAGE.who.includes(id)&&!SAVE.done[n])).slice(0,2));AI=0;
  STAGE.build();scatterCoins();P=newPlayer(STAGE.start);cam=0;PAL.q=[];PAL.msg='';PAL.mt=0;PAL.x=P.x-30;PAL.y=GY-60;BAN=null;FADE=0;
  MUSIC=STAGE.music?STAGE.music.bind(STAGE):null;setTempo(STAGE.bpm);chingOn=true;musicOn=true;
  show(null);mode='play';banner('ฉากที่ '+n+' · '+STAGE.name,STAGE.sub,2.4);
  let res;try{res=await STAGE.run()}catch(e){showErr(e.message);return}
  if(ST.falls===0)star(2,'ผ่านฉากโดยไม่ล้มเลย');star(5,'ผ่านฉากที่ '+n);
  {const on=ST.onChab+ST.onChing,acc=ST.hits?on/ST.hits:0,cr=LV.coinTotal?(ST.coinsLv||0)/LV.coinTotal:0;ST.rate=1+(cr>=.6?1:0)+(acc>=.4?1:0);SAVE.rate=SAVE.rate||{};SAVE.rate[n]=Math.max(SAVE.rate[n]||0,ST.rate);ST.coinPct=Math.round(cr*100)}
  SAVE.done[n]=1;SAVE.prog=Math.max(SAVE.prog||1,Math.min(7,n+1));const sec=Math.round((Date.now()-ST.start)/1000);SAVE.best[n]=SAVE.best[n]?Math.min(SAVE.best[n],sec):sec;store();
  try{parent.postMessage({type:'spw-game',game:'pisat2',stage:n,fin:n===7},'*')}catch(e){}
  try{if(window.KT)KT.roll('pisat2',(ST.rate||1)>=2||n===7)}catch(e){}
  await waitS(1.2);
  if(res==='ending'){await ending();creditsScreen();return}
  resultScreen(n,sec)}
function resultScreen(n,sec){show('#res');const on=ST.onChab+ST.onChing,acc=ST.hits?Math.round(100*on/ST.hits):0;
  $('#eBody').innerHTML='<div style="font-size:34px;color:#ffd86a;letter-spacing:6px">'+'★'.repeat(ST.rate||1)+'<span style="opacity:.25">'+'★'.repeat(3-(ST.rate||1))+'</span></div><p class="muted">★ ผ่านฉาก · ★ เก็บโน้ตทอง 60% · ★ ตีตรงจังหวะ 40%</p><h2>ผ่านฉากที่ '+n+' · '+esc(STAGES[n].name)+'</h2><p>เสียงที่ '+n+' กลับมา: '+STAGES[n].who.map(nameOf).join(' ')+'</p><div class="stats"><div class="stat"><b>'+Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')+'</b>เวลา</div><div class="stat"><b>♪ '+(ST.coinsLv||0)+'/'+LV.coinTotal+'</b>โน้ตทอง ('+ST.coinPct+'%)</div><div class="stat"><b>'+ST.kills+'</b>เงาเพี้ยนที่สลาย</div><div class="stat"><b>'+acc+'%</b>ตีโดนตรงจังหวะ</div><div class="stat"><b>×'+ST.best+'</b>ตรงจังหวะติดกันสูงสุด</div><div class="stat"><b>★ '+(ST.stars||0)+'</b>ดาวคุณธรรมในฉากนี้</div></div>'+
    learnBox();
  $('#eNext').style.display=n<7?'':'none';$('#eNext').textContent=nextOpen()===7&&!isOpen(7)?'ไปแผนที่':'ฉากต่อไป';$('#eNext').onclick=()=>{SEL=nextOpen();mapScreen()};$('#eMap').onclick=()=>mapScreen()}
/* สรุปสิ่งที่ได้เรียนรู้ในฉากนี้: เควส ดาวคุณธรรม และบันทึกความรู้ */
function learnBox(){const q=LV.q.filter(q=>q.done),st=ST.starList||[],nt=Array.from(new Set(ST.noteList||[])).filter(k=>NOTES[k]);
  return (q.length?'<div class="lb">เควสที่ทำสำเร็จ</div><ul class="lies">'+q.map(x=>'<li>'+(x.main?'◆ ':'◇ ')+esc(x.t.replace(/\s*\(\d+\/\d+\)$/,''))+'</li>').join('')+'</ul>':'')+
    (st.length?'<div class="lb">ดาวคุณธรรมที่ได้</div><ul class="lies">'+st.map(([i,w])=>'<li>★ '+esc(VIRTUE[i])+'<span>'+esc(w)+'</span></li>').join('')+'</ul>':'')+
    (nt.length?'<div class="lb">ความรู้ใหม่</div><ul class="lies">'+nt.map(k=>'<li>'+esc(NOTES[k].t)+'</li>').join('')+'</ul>':'')}
function creditsScreen(){show('#credits');}
$('#cMap').onclick=()=>mapScreen();

/* ---------- พักเกม ---------- */
let pmode=null;
function togglePause(){if(['play','talk','cr','jam','cut'].includes(mode)){pmode=mode;show('#pause');mode='pause';$('#pLat').value=userLat();$('#pLatV').textContent=userLat()+' มิลลิวินาที (ใช้ค่าเดียวกับเกมแห่กลองหลวง)';return}
  if(mode==='pause'){show(null);mode=pmode||'play';if(AC){AC.resume();nextBeat=Math.max(nextBeat,Math.ceil((AC.currentTime-beatT0)/BEAT))}}}
window.togglePause=togglePause;
$('#pLat').oninput=e=>{try{localStorage.setItem(LATK,e.target.value)}catch(x){}$('#pLatV').textContent=e.target.value+' มิลลิวินาที (ใช้ค่าเดียวกับเกมแห่กลองหลวง)'};
$('#pGo').onclick=()=>togglePause();$('#pMap').onclick=()=>{TALK=null;CR=null;JAM=null;$('#choice').classList.remove('on');$('#mini').classList.remove('on');LV=null;mapScreen()};
$('#bPause').onclick=()=>togglePause();
$('#bMute').onclick=()=>{SAVE.mute=!SAVE.mute;store();if(MASTER)MASTER.gain.value=SAVE.mute?0:1;$('#bMute').textContent=SAVE.mute?'🔇':'🔊'};$('#bMute').textContent=SAVE.mute?'🔇':'🔊';
bindBtn('#bX','x');$('#bSkip').onclick=e=>{e.stopPropagation();if(mode==='talk'&&TALK){TALK.i=TALK.lines.length-1;nextLine()}};
bindBtn('#bL','l');bindBtn('#bR','r');bindBtn('#bJ','j');bindBtn('#bA','a');bindBtn('#bUse','u');bindBtn('#bS','s');
addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&!isTouch()){document.body.classList.add('touch');fit()}},{capture:true});
$('#stage').addEventListener('pointerdown',()=>{if(mode==='talk')nextLine()});

/* ---------- วนลูป ---------- */
let last=performance.now();
function loop(ts){const dt=Math.min(.033,(ts-last)/1000);last=ts;
  document.body.classList.toggle('talking',mode==='talk'||mode==='cut'||mode==='travel');document.body.classList.toggle('intalk',mode==='talk');
  try{if(mode==='travel'&&TRAV)travelTick(dt);
  else if(LV&&P&&['play','talk','cr','jam','cut','battle'].includes(mode)){update(dt);draw();$('#bS').style.display=TEAM.length>1?'':'none'}
  else if(mode==='build'&&bset){const c=$('#bcv').getContext('2d');c.clearRect(0,0,32,48);const f=Math.floor(ts/80)%6,cyc=Math.floor(ts/2400)%3;c.drawImage(cyc===1?bset.idle[Math.floor(ts/600)%2]:cyc===2?bset.atk[Math.floor(ts/140)%3]:bset.run[f],0,0)}}catch(e){showErr(e.message+' (loop)');mode='error'}
  requestAnimationFrame(loop)}
function init(){fit();titleScreen();requestAnimationFrame(loop)}
window.__P2={get P(){return P},get LV(){return LV},get mode(){return mode},get CR(){return CR},get JAM(){return JAM},get TEAM(){return TEAM},STAGES,startStage,mapScreen,SAVE:()=>SAVE,beat,K,pressed,nextLine,setTempo};
