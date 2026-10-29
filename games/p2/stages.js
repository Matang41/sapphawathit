/* ====================================================================
   ตำนานสรรพวาทิต ภาค เจ็ดเสียงที่หายไปในแม่สอด — เนื้อเรื่องและด่าน (stages.js)
   เจ็ดเสียง = เพื่อนเจ็ดกลุ่มที่ถูกคำลวงของ “ท่านเสียงทอง” แยกออกจากวง
   ทุกตัวละครและเหตุผลเป็นการสมมุติจากคาแรกเตอร์ในเกม ไม่อิงคนจริง · คำลวงเป็นแบบทั่วไป ไม่ชี้ถึงคนหรือกลุ่มใด
   ==================================================================== */
'use strict';
const NOTES={
  ching:{t:'ฉิ่งกำกับจังหวะของวง เสียง “ฉิ่ง” คือจังหวะเบา เสียง “ฉับ” คือจังหวะหนัก ทั้งวงยึดฉิ่งเป็นหลัก'},
  waikhru:{t:'นักดนตรีไทยไหว้ครูก่อนเล่น และไม่ข้ามหรือเหยียบเครื่องดนตรี เพราะถือว่าเครื่องดนตรีเป็นสิ่งที่ควรเคารพ'},
  khlui:{t:'ขลุ่ยไทยมีหลายขนาด เช่น ขลุ่ยหลิบ ขลุ่ยเพียงออ ขลุ่ยอู้ ยิ่งเลาใหญ่เสียงยิ่งทุ้ม'},
  teacher:{t:'จะเป็นครูดนตรี ต้องเรียนทั้งการเล่น ทฤษฎี และวิธีสอน แล้วฝึกสอนในโรงเรียนจริงก่อนจบ'},
  ranad:{t:'ระนาดเอกมี 21 ลูก ใต้ลูกระนาดติดตะกั่วผสมขี้ผึ้ง ติดมากเสียงต่ำลง ติดน้อยเสียงสูงขึ้น'},
  listen:{t:'ในวงดนตรี การฟังเพื่อนสำคัญพอ ๆ กับการเล่นของตัวเอง ทำนองที่คุ้นหูช่วยให้หากันเจอ'},
  khongwong:{t:'ฆ้องวงใหญ่มีลูกฆ้อง 16 ลูก ถือเป็นหลักของทำนอง เครื่องอื่นแปรทำนองไปจากทางฆ้อง'},
  taphon:{t:'ตะโพนมีสองหน้า หน้าใหญ่เสียงทุ้ม หน้าเล็กเสียงแหลม ใช้ตีหน้าทับกำกับวงปี่พาทย์'},
  tehnaku:{t:'เตหน่ากูเป็นพิณของชาวกะเหรี่ยง มีราว 6–12 สาย ตั้งเสียงแบบห้าเสียง มือซ้ายเล่นเสียงประสาน มือขวาเล่นทำนอง'},
  hsaing:{t:'วงปี่พาทย์พม่า (ซายวาย) มีกลองวง 18–21 ใบเป็นหลัก ร่วมกับฆ้อง ปี่ และฉาบ จังหวะเปลี่ยนได้ฉับพลัน'},
  kuay:{t:'ตานก๋วยสลากเป็นประเพณีทำบุญของภาคเหนือ ชาวบ้านจัดของใส่ก๋วยหรือตะกร้าไม้ไผ่ แล้วถวายวัดโดยการจับสลาก'},
  klongluang:{t:'วงกลองหลวงมีกลองหลวง ฉาบ และฆ้อง ผู้ตีพันมือด้วยผ้า แห่นำขบวนในงานบุญของชุมชน'},
  nathap:{t:'หน้าทับคือแบบแผนการตีกลองที่ใช้กำกับจังหวะ เช่น หน้าทับปรบไก่ หน้าทับสองไม้'},
  media:{t:'ก่อนเชื่อคลิปเสียงหรือข้อความ ให้ถามว่า ใครพูด มีหลักฐานไหม เร่งให้รีบตัดสินใจหรือเปล่า แล้วเล่าให้คนที่ไว้ใจฟัง'}};
const REASONS=[
  {id:'relax',n:'ผ่อนคลาย',d:'เรียนมาทั้งวัน ได้เล่นดนตรีแล้วหายเหนื่อย',lie:'เล่นเพื่อผ่อนคลายน่ะ ไม่มีใครจำเธอได้หรอก'},
  {id:'love',n:'รักดนตรี',d:'ชอบเสียงดนตรีไทย อยากเล่นให้เก่งขึ้นเรื่อย ๆ',lie:'รักดนตรีแค่ไหนก็ไม่เก่งเท่าคนที่ศรัทธาฉัน'},
  {id:'career',n:'อยากเป็นครูหรือนักดนตรี',d:'อยากเอาดนตรีไปเป็นอาชีพในอนาคต',lie:'อยากเป็นนักดนตรีเหรอ ไม่ต้องเรียนต่อ แค่ทำตามที่ฉันบอก'},
  {id:'friends',n:'อยากมีเพื่อน',d:'อยากมีกลุ่มเพื่อนที่ทำอะไรด้วยกัน',lie:'เพื่อนพวกนี้ไม่ได้อยากให้เธออยู่หรอก มาอยู่กับฉันดีกว่า'}];
const myReason=()=>REASONS.find(r=>r.id===SAVE.reason)||REASONS[1];

/* ====================================================================
   บอส: ระยะ 1 สู้ → ระยะ 2 ฟังแล้วตีตาม/ถอดรหัส → ระยะ 3 บรรเลงทั้งวง
   ==================================================================== */
function bossAI(o){let n=0;return (b,dt,bt)=>{
  if(b.stun)return;
  const arena=LV.camLock||[b.x-200,b.x+200];
  if(o.move!=='still'){b.tx=b.tx==null?b.x:b.tx;if(Math.abs(b.tx-b.x)<4)b.tx=clamp(P.x+(Math.random()<.5?-1:1)*rnd(90,150),arena[0]+b.w,arena[1]-b.w);b.x+=Math.sign(b.tx-b.x)*Math.min(Math.abs(b.tx-b.x),(o.speed||30)*dt)}
  b.face=Math.sign(P.x-b.x)||-1;if(o.fly)b.y=o.fly+Math.sin(b.t*1.4)*12;
  if(b.dashT>0){b.dashT-=dt;b.x+=b.dashV*dt;b.x=clamp(b.x,arena[0]+b.w/2,arena[1]-b.w/2)}
  if(bt.k!==b.lastK&&Math.abs(bt.d)<.06){b.lastK=bt.k;n++;
    if(n%(o.every||4)===0){const a=o.acts[(n/(o.every||4))%o.acts.length|0];b.act=a;b.actT=T;
      if(a==='shoot')bossShoot(b,o.words,3,.3);
      else if(a==='rain'){bossRain(b,o.words,4);b.bub=1.8;b.say=pick(o.words)}
      else if(a==='summon'){if(LV.en.filter(e=>!e.dead).length<4)for(let i=0;i<2;i++){const e=enemy(o.minion||'mini',b.x+(i?40:-40),GY,{quiet:1});e.vy=-200}}
      else if(a==='dash'){b.dashT=.5;b.dashV=Math.sign(P.x-b.x)*240}
      else if(a==='slam'){shake=.25;[-1,1].forEach(d=>LV.eshots.push({x:b.x+d*b.w/2,y:GY-6,vx:d*150,t:0,wave:1,dmg:10}));sfx(t=>TS2.that(0,t,.8))}
      else if(a==='gust'){LV.gustT=1.2;pop(b.x,b.y-b.h-10,'ลมแรง!','#bfe6ff')}
      else if(a==='hearts'){for(let i=0;i<5;i++)LV.eshots.push({x:b.x,y:b.y-b.h*.6,vx:Math.cos(i/4*Math.PI)*-90*b.face,vy:-Math.sin(i/4*Math.PI)*90,g:60,t:0,heart:1,dmg:7})}
      else if(a==='clone'){for(let i=0;i<2;i++)enemy('echo',b.x+(i?70:-70),GY,{quiet:1,yb:GY-10})}}}}}
function drawBoss(b,c){const sx=b.x-c,cy=b.y-b.h/2;if(sx<-120||sx>W+120)return;g.save();if(b.hit>0)g.globalAlpha=.6+.4*Math.sin(T*60);if(b.dead)g.globalAlpha=Math.max(0,1-(T-b.deadT)*1.2);
  if(b.stun){g.globalAlpha*=.75;const k=Math.sin(T*20)*2;g.translate(k,0)}
  if(b.look==='phone'){R(g,'#14141c',sx-30,cy-46,60,92);R(g,'#ffd86a',sx-26,cy-40,52,74);R(g,'#fff6d0',sx-20,cy-34,40,6);for(let i=0;i<5;i++)R(g,'#f2a0b0',sx-20+i*9,cy-14,6,6);R(g,'#4a2a08',sx-12,cy-26,6,6);R(g,'#4a2a08',sx+6,cy-26,6,6);R(g,'#c02040',sx-10,cy+4,20,4);
    g.font='bold 9px '+FONT;g.fillStyle='#c02040';g.textAlign='center';g.fillText('1,000,000',sx,cy+20);g.textAlign='left';R(g,'#2a2a34',sx-6,cy+38,12,3)}
  else if(b.look==='tower'){R(g,'#2a1a10',sx-34,cy-60,68,120);R(g,'#4a3020',sx-30,cy-56,60,112);for(let i=0;i<3;i++){disc(g,'#14100c',sx,cy-34+i*34,13);disc(g,'#c89a3a',sx,cy-34+i*34,9);disc(g,'#3a2a14',sx,cy-34+i*34,3)}
    g.globalAlpha*=.9;for(let i=0;i<16;i++){const h=(Math.sin(T*8+i)*.5+.5)*30+6;R(g,'#f2c14e',sx-46+i*6,cy-90-h/2,3,h)}
    drawShade(sx,cy-108,1.6,b.face,b.t,{crown:1})}
  else drawShade(sx,cy,b.sc||3,b.face,b.t,Object.assign({ground:1,gy:b.y},b.opt||{}));
  g.restore()}
async function bossFight(o){
  LV.camLock=o.arena;P.x=clamp(P.x,o.arena[0]+30,o.arena[1]-30);
  const b={boss:1,name:o.name,x:o.x,y:o.y||GY,w:o.w||70,h:o.h||90,hp:o.hp||160,t:0,hit:0,vuln:1,face:-1,sc:o.sc,look:o.look,opt:o.opt,say:o.say,bub:4,lastK:-1};b.max=b.hp;
  b.ai=bossAI(o);b.draw=drawBoss;LV.boss=b;banner(o.name,o.sub||'',2.2);sfx(t=>{TS.khong(0,t,.6);TS2.that(1,t+.05,.7)});
  const bubT=setInterval(()=>{if(!b.stun&&LV.boss===b&&!b.dead){b.bub=2.6;b.say=pick(o.words)}},6500);
  if(o.onStart)o.onStart(b);
  await until(()=>!b.vuln);clearInterval(bubT);
  b.stun=1;b.bub=0;LV.eshots.length=0;LV.en.forEach(e=>{if(!e.dead)kill(e)});shake=.3;sfx(t=>{TS2.that(0,t,.9);TS.khong(0,t+.1,.7)});
  await waitS(.6);
  if(o.lineB)await talk(o.lineB);
  if(o.cr){say('ฟังให้ดีแล้วตีตาม ◀ ต่ำ · ตี กลาง · ▶ สูง',1);const miss=await callResponse(o.cr);ST.crMiss=(ST.crMiss||0)+miss}
  if(o.decode){await decode(o.decode)}
  if(o.preC)await o.preC(b);
  if(o.lineC)await talk(o.lineC);
  if(o.jam){const sc=await bandJam(o.jam);ST.jam=sc;if(sc>.85){unity(3);banner('บรรเลงพร้อมกันสวยมาก','ความสามัคคีของวงเพิ่มขึ้น',2)}}
  b.dead=1;b.deadT=T;for(let i=0;i<60;i++)LV.fx.push({x:b.x+rnd(-40,40),y:b.y-rnd(0,b.h),vx:rnd(-60,60),vy:rnd(-140,-20),g:120,t:0,life:rnd(.8,1.6),c:pick(['#f2c14e','#ffe08a','#ffffff']),s:2});
  for(let i=0;i<3;i++)LV.debris.push({x:b.x+rnd(-20,20),y:b.y-40,vx:rnd(-40,40),vy:-160,t:0,kind:b.look==='phone'?'phone':'speaker'});
  sfx(t=>{TS.khong(7,t,.7);TS2.ranadKey(21,t+.1,.6)});await waitS(1.2);LV.boss=null;LV.camLock=null}
const PAT_A=[[0,1],[1,0],[2,2],[3,1],[4,0],[4.5,1],[5,2],[6,1],[7,0]];
const PAT_B=[[0,0],[1,1],[1.5,1],[2,2],[3,1],[4,0],[5,2],[5.5,1],[6,0],[7,2]];
const PAT_C=[[0,1],[.5,0],[1,2],[2,1],[3,0],[3.5,1],[4,2],[5,1],[6,0],[6.5,2],[7,1]];
/* หนึ่งเสียงกลับมา */
function voiceBack(n,who,inst){SAVE.pool=Array.from(new Set((SAVE.pool||[]).concat(who)));store();banner('เสียงที่ '+n+' กลับมาแล้ว',who.map(nameOf).join(' · ')+' — '+inst,3);sfx(t=>{[10,12,14,15,17].forEach((k,i)=>TS2.ranadKey(k,t+i*.1,.6))})}
function glowActor(id,x,face){const a=actor(id,x,face||1,{glow:1});return a}
function sceneStart(focus){mode='cut';P.frozen=1;if(focus!=null)LV.camFocus=focus}
function sceneEnd(){LV.camFocus=null;P.frozen=0;mode='play'}

/* ====================================================================
   ฉาก 1 · ห้อง 512 และลานหน้าอาคาร 5 — เสียงที่ 1: ฟู แว่น จักร
   ==================================================================== */
const STAGES={};
STAGES[1]={id:1,name:'ห้อง 512',sub:'ห้องดนตรีไทยและลานหน้าอาคาร 5',who:['foo','waen','yum'],inst:'ฆ้องวงเล็ก ระนาดทุ้ม ซอด้วง',bpm:104,w:2960,start:70,
  music(k,t){const P5=[10,11,12,14,15,17,18,19];if(k%8===3)TS2.thon(2,t,.2,MUS);if(k%8===7)TS2.thon(2,t,.22,MUS);if(k%2===1&&Math.random()<.7){this.mi=clamp((this.mi||3)+pick([-1,-1,0,1,1,2,-2]),0,7);TS2.ranadKey(P5[this.mi],t,.12,MUS);if(Math.random()<.5)TS2.ranadKey(P5[clamp(this.mi+1,0,7)],t+BEAT/2,.1,MUS)}},
  build(){
    const [c,x]=mk(LV.w,H),r=seeded(3);drawRoom512(x,r,0);
    drawCourtyard(x,r,ROOM_END,LV.w,{trees:[[1330,62],[1560,52],[1990,58],[2390,50]],stoneT:[1380,1630,1880],cooler:[1741],planter:[[2060,150]],pole:2800});
    // เสาธงหน้าลาน
    R(x,'#c8c8c8',1470,30,4,200);[['#d02a2a',0],['#ffffff',4],['#1e3a8a',8],['#ffffff',16],['#d02a2a',20]].forEach(([col,o])=>R(x,col,1474,34+o,30,o===8?8:4));R(x,'#9a9a9a',1462,224,20,6);
    // ถังขยะ
    R(x,'#3a7a3a',2004,206,16,24);R(x,'#2a5a2a',2002,204,20,4);
    LV.L.world=c;LV.L.sky=skyCanvas([[0,'#7fb6e6'],[.6,'#cfe6f6'],[1,'#eef6fb']],'rgba(255,255,255,.85)',0,7);LV.L.far=courtFar();LV.L.fg=courtFG(ROOM_END);
    LV.floor=floorMaker([{x0:0,x1:ROOM_END,k:'room'},{x0:ROOM_END,x1:LV.w,k:'concrete'}]);
    [[148,196,60],[218,182,24],[1364,214,12],[1380,200,44],[1430,214,12],[1614,214,12],[1630,200,44],[1680,214,12],[1864,214,12],[1880,200,44],[1930,214,12],[2060,204,150],[2140,158,70],[2240,176,44],[1528,150,60],[1960,152,56]].forEach(([a,b,w])=>plat(a,b,w));
    wall(2296,150,10,80,'fence');plat(2296,150,10);item(2301,138,'note',{id:'nathap'});
    item(178,186,'mat',{m:'wood'});item(2134,148,'mat',{m:'bamboo'});item(1558,140,'note',{id:'ching'});item(1652,190,'lost',{n:'กระติกน้ำของน้อง',col:'#3aa8d8'});item(2470,200,'heal');
    cp(1741,'cooler','ตู้น้ำดื่ม');
    use(97,60,'ไหว้ครู',()=>{rest('ไหว้ครูก่อนเล่นทุกครั้ง แล้วจะใจนิ่ง ตีแม่นขึ้น');P.pose='wai';if(!SAVE.notes.includes('waikhru')){SAVE.notes.push('waikhru');store();banner('บันทึกความรู้',NOTES.waikhru.t,2.4)}star(6,'ไหว้ครูในห้อง 512')});
    use(283,60,'ตีระนาดเอก',()=>sfx(()=>{const b=nb();[10,11,12,14,15,17,18,19].forEach((k,i)=>TS2.ranadKey(k,b+i*BEAT/4,.7))}));
    use(363,60,'ตีระนาดทุ้ม',()=>sfx(()=>{const b=nb();[7,9,10,12,10,9,7].forEach((k,i)=>TS2.thum(k,b+i*BEAT/2,.8))}));
    use(448,50,'ตีกลองทัด',()=>sfx(()=>{const b=nb();[[0,0],[1,1],[2,0],[2.5,0],[3,1]].forEach(([d,k])=>TS2.that(k,b+d*BEAT,.85))}));
    use(660,120,'ตีฆ้องวงใหญ่',()=>sfx(()=>{const b=nb();[3,4,5,7,5,4,3,0].forEach((k,i)=>TS.khong(k,b+i*BEAT/2,.75))}));
    use(943,30,'ตีตะโพน',()=>sfx(()=>{const b=nb();[[0,0],[.5,3],[1,2],[1.5,3],[2,1]].forEach(([d,k])=>TS2.taphon(k,b+d*BEAT,.8))}));
    use(1024,64,'สีซออู้',()=>sfx(()=>{const b=nb();[229,257,289,344,289,257].forEach((f,i)=>TS2.sorou(f,b+i*BEAT/2,BEAT/2*.95,.6))}));
    use(1114,72,'สีซอด้วง',()=>sfx(()=>{const b=nb();[392,440,523,587,523,440].forEach((f,i)=>TS2.sor(f,b+i*BEAT/2,BEAT/2*.95,.55))}));
    use(2012,30,'เก็บขยะใส่ถัง',u=>{u.off=1;star(7,'เก็บขยะในลานโรงเรียน');say('ลานสะอาดแล้ว ขอบใจนะ',1)});
    const kid=actor('kid',1772,-1,{lookP:1});kid.talk=a=>{if(ST.lost&&ST.lost.got&&!ST.lost.back){ST.lost.back=1;talk([['kid','กระติกน้ำของผม! ขอบคุณครับพี่'],['pian','เก็บได้แล้วเอาไปคืน เท่านี้ก็เป็นฮีโร่แล้ว']]).then(()=>star(1,'คืนของที่เก็บได้'))}else talk([['kid','พี่เห็นกระติกน้ำสีฟ้าของผมไหมครับ ลืมไว้แถวม้าหิน']])};
    LV.paperFall=1;
    LV.drawMid=c=>{if(LV.paperFall)[[650,'#ffe27a'],[690,'#9fe0ff'],[722,'#ffb0c8'],[760,'#b8f0a0'],[800,'#ffc890']].forEach(([px,cc],i)=>{R(g,cc,px-c,GY-3-(i%2),10,3)})};
  },
  async run(){
    // ---------- เปิดเรื่อง: ต้นเทอมใหม่ ----------
    LV.paperFall=0;sceneStart(640);P.hide=1;
    const cast=[['che',330,1],['jao',400,1],['foo',450,1],['waen',480,1],['yum',515,1],['mateo',548,1],['maha',600,1],['kaimuk',632,-1],['ing',656,-1],['ice',680,-1],['tang',740,-1],['pob',800,-1],['luwa',836,-1],['captain',870,-1]];
    const A=cast.map(([id,x,f])=>actor(id,x,f));const me=actor('me',570,1);
    await waitS(.4);
    await talk([['sys','ต้นเทอมใหม่ ห้อง 512 อาคาร 5 โรงเรียนสรรพวิทยาคม'],['tang','ต้นเทอมนี้ ครูอยากให้ทุกคนเขียนกระดาษแปะบอร์ด “ฉันเล่นดนตรีเพื่อ…”'],
      ['che','ผมเล่นเพราะมันผ่อนคลายครับ เรียนมาทั้งวันได้ตีระนาดแล้วหายเหนื่อย'],['jao','ผมอยากเป็นครูดนตรีครับ'],['foo','ผมเล่นเพราะสนุก แล้วก็ได้อยู่กับแว่นด้วย'],['waen','ผมอยากรู้ว่าเพลงทำงานยังไง สักวันอยากแต่งเพลงเอง'],
      ['yum','ผมชอบบรรยากาศชมรม ซ้อมเสร็จได้กินของอร่อยด้วยกัน'],['maha','ผมรักดนตรีไทยครับ'],['kaimuk','พวกเราอยากขึ้นเวที!'],['mateo','ผม… อยากมีเพื่อนครับ'],['captain','ผมอยากกล้าพูดต่อหน้าคนครับ'],
      ['me','ฉันเล่นดนตรีเพื่อ… '+myReason().n+' — '+myReason().d],['tang','ไม่มีคำตอบไหนดีกว่ากัน ทุกคนมีที่ในวงเหมือนกันหมด แปะบอร์ดได้เลยครับ']]);
    await fade(1,.7);A.forEach(a=>a.vis=0);me.vis=0;
    await talk([['sys','คืนนั้น สามทุ่ม โทรศัพท์ของสมาชิกทุกคนสั่นพร้อมกัน'],['gold','สวัสดีเด็ก ๆ ชมรมสรรพวาทิต ฉันคือท่านเสียงทอง'],['gold','ฟังเสียงฉันแล้วจะเก่งทันที ไม่ต้องซ้อมสักวัน'],
      ['gold','เพื่อนในวงไม่เห็นค่าเธอหรอก ครูก็ไม่ได้รักเธอเท่าคนอื่น'],['gold','อย่าบอกใครนะ รู้กันแค่เรา'],
      ['pian','ฮัลโหล! ฉันเพี้ยนน้อย มาสคอตห้อง 512 อยู่ในแอปชมรมของเธอ'],['pian','เสียงเมื่อกี้ไม่มีหลักฐานสักคำ แถมสั่งให้เก็บเป็นความลับด้วย พรุ่งนี้ไปห้อง 512 แต่เช้านะ']]);
    LV.paperFall=1;const f1=glowActor('foo',600,1),f2=glowActor('waen',632,1),f3=glowActor('yum',664,-1);
    P.x=200;P.hide=0;LV.camFocus=420;await fade(0,.7);
    await talk([['sys','เช้าวันต่อมา กระดาษบนบอร์ดหลุดกระจายเต็มพื้น เพื่อนหลายคนไม่มาซ้อม'],['foo','เสียงทองบอกว่า… ไม่ต้องซ้อมก็เก่ง…'],['waen','ฉันคิดแล้ว… ทางลัดคุ้มกว่า…'],['yum','…ไม่หิวด้วยซ้ำ…'],
      ['pian','แย่แล้ว ทั้งสามคนเหม่อเหมือนโดนสะกด ต้องหาต้นเสียงให้เจอ'],['pian','ฉันจะคอยบอกทาง ไปไหว้ครูที่โต๊ะหมู่ก่อน แล้วลองเดินดูเครื่องในห้อง']]);
    sceneEnd();
    say(isTouch()?'ปุ่ม ◀ ▶ เดิน · ⤒ กระโดด · ตี ใช้ไม้ตีฆ้อง':'← → เดิน · Space กระโดด · J ตี · E ใช้');
    trig(220,()=>say('ได้ยิน ฉิ่ง… ฉับ… ไหม? กดตีตอน “ฉับ” จะแรงเป็นสองเท่า',1));
    trig(260,()=>say('ในห้อง 512 เราไม่ข้ามหรือเหยียบเครื่องดนตรีนะ ยืนข้างหน้าแล้วกด “ใช้”',1));
    trig(880,()=>{say('ลำโพงเสียงตามสายมีเสียงแปลก ๆ … ระวังตัวไว้',1);[[957,'walk'],[980,'float']].forEach(([sx,k],i)=>setTimeout(()=>{const e=enemy(k,sx,k==='float'?GY:58);e.x0=sx-60;e.vy=0;for(let j=0;j<12;j++)LV.fx.push({x:957,y:56,vx:rnd(-60,60),vy:rnd(-20,60),g:200,t:0,life:.8,c:'#f2c14e',s:2})},i*900))});
    trig(1200,()=>{say('ต้นเสียงอยู่ที่หอกระจายข่าวกลางลาน! ระวังลมหายใจด้วย',1);[['walk',1500],['shout',1652,200],['walk',1820],['float',2010],['shout',2150,204],['walk',2320],['shield',2440]].forEach(([k,x,y])=>enemy(k,x,y))});
    trig(1330,async()=>{const i=await choose('08:00 เพลงชาติดังจากลำโพงหน้าเสาธง (เสียงจริงของโรงเรียน ไม่ใช่เสียงทอง)',['หยุดยืนตรงเคารพธงชาติ','วิ่งต่อ ไม่มีเวลา']);if(i===0){P.pose='idle';star(0,'ยืนตรงเคารพธงชาติ')}else say('ไม่เป็นไร พรุ่งนี้ลองหยุดยืนตรงด้วยกันนะ',1)});
    trig(2420,()=>say('โล่สีฟ้ากันได้ ต้องตีตอนฉิ่งหรือฉับเท่านั้น!',1));
    await reach(2580);
    await bossFight({name:'เงาเก่งทันที',sub:'เงาคำลวงที่หอกระจายข่าว',x:2820,arena:[2560,LV.w],hp:150,sc:3.2,opt:{horn:1},words:['เก่งทันที!','ไม่ต้องซ้อม!','อย่าบอกครู!'],acts:['shoot','summon','rain','shoot','slam'],every:4,say:'ฟังฉันแล้วเก่งทันที ไม่ต้องซ้อม!',
      lineB:[['pian','มันเริ่มสั่นแล้ว! เงาคำลวงทนเสียงดนตรีจริงไม่ได้'],['pian','ฟังทำนองฆ้องที่มันขโมยมา แล้วตีตามให้ถูก']],cr:{inst:'khong',rounds:3,len:3},
      preC:async()=>{const ids=['foo','waen','yum'];[f1,f2,f3].forEach(a=>a.vis=0);ids.forEach((id,i)=>{const a=actor(id,2600+i*24,1);walk(a,2640+i*26,90)});await waitS(1)},
      lineC:[['foo','เสียงฆ้องนี่… ห้อง 512!'],['waen','ฉันจำทางได้ มาเล่นด้วยกัน'],['pian','สามเสียงกลับมาแล้ว บรรเลงพร้อมกันเลย!']],
      jam:{who:['me','foo','waen','yum'],inst:['khong','ranad','sor'],pattern:PAT_A,bars:2,title:'บรรเลงพร้อมกัน: ฆ้อง ระนาด ซอ'}});
    sceneStart(2700);const tg=actor('tang',2580,1);walk(tg,2650,60);
    await talk([['foo','เมื่อกี้ฉันเป็นอะไรไป… ได้ยินแต่เสียงทองว่าเก่งทันที'],['waen','ฉันลองคิดดูแล้ว “เก่งทันที” ไม่มีที่มาเลยสักนิด'],['yum','หิวแล้ว แปลว่าหายแล้วแน่ ๆ'],
      ['tang','ครูได้ยินเสียงฆ้องจากหน้าเสาธงเลยรีบมา'],['tang','ครูไม่มีพลังวิเศษให้ใคร ครูมีแค่เวลาซ้อมกับพวกเธอทุกวัน'],['tang','ถ้าใครสัญญาว่าเก่งทันที ให้ถามว่า “มีหลักฐานไหม” แล้วมาเล่าให้ครูหรือเพื่อนฟัง'],
      ['pian','ข้อความในกลุ่มชมรมบอกว่าจ้าวไปที่อุโมงค์ไผ่ทิวไผ่งาม ไปตามกันเถอะ']]);
    voiceBack(1,['foo','waen','yum'],this.inst);await waitS(2.5);sceneEnd()}};

/* ====================================================================
   ฉาก 2 · อุโมงค์ไผ่ทิวไผ่งาม — เสียงที่ 2: จ้าว (ขลุ่ย)
   ลมพัดแรงตอนฉับ เดินตอนฉิ่ง หลบหลังกอไผ่
   ==================================================================== */
STAGES[2]={id:2,name:'อุโมงค์ไผ่ทิวไผ่งาม',sub:'ต.แม่กาษา อ.แม่สอด',who:['jao'],inst:'ขลุ่ย',bpm:96,w:3100,start:60,
  music(k,t){const F=[523,587,659,784,880];if(k%2===0&&Math.random()<.6){this.mi=clamp((this.mi||2)+pick([-1,0,1,1,-1]),0,4);TS2.khlui(F[this.mi],t,BEAT*.9,.16,MUS)}if(k%8===0)TS2.thon(2,t,.18,MUS);if(k%8===4)TS2.thon(0,t,.14,MUS)},
  build(){artBamboo();
    LV.floor=floorMaker([{x0:0,x1:LV.w,k:'dirt',leaf:1}]);
    gap(640,90,'water');gap(1460,120,'water');gap(2210,100,'water');
    // สะพานไม้ไผ่แกว่ง
    [[650,200,40,{ay:10,sp:2}],[1470,196,44,{ay:14,sp:2.2}],[1530,186,40,{ay:12,sp:2.4,ph:1}],[2222,198,40,{ax:24,sp:1.6}]].forEach(([a,b,w,m])=>plat(a,b,w,{mv:Object.assign({x0:a,y0:b},m),draw:(q,c)=>{R(g,'#9ac85a',q.x-c,q.y,q.w,3);for(let i=0;i<q.w;i+=6)R(g,'#6a9a3a',q.x-c+i,q.y,1,3);R(g,'#5a8a30',q.x-c+q.w/2,0,1,q.y)}}));
    [[300,196,50],[900,190,60],[1100,170,40],[1180,150,40],[1800,190,70],[2000,170,50],[2480,196,60]].forEach(([a,b,w])=>plat(a,b,w,{draw:(q,c)=>{R(g,'#c8a868',q.x-c,q.y,q.w,4);R(g,'#8a6a3a',q.x-c,q.y+4,q.w,2);R(g,'#7a5a2a',q.x-c+3,q.y+6,3,GY-q.y-6);R(g,'#7a5a2a',q.x-c+q.w-6,q.y+6,3,GY-q.y-6)}}));
    wall(1240,150,10,80,'fence');plat(1240,150,10);item(1246,138,'note',{id:'khlui'});
    item(1190,140,'mat',{m:'bamboo'});item(2010,160,'mat',{m:'bamboo'});item(1830,180,'mat',{m:'string'});item(1700,200,'heal');
    cp(1360,'flag','ศาลาพักริมทาง');
    // กอไผ่บังลม
    LV.shelter=[[420,470],[1000,1050],[1700,1750],[2380,2430]];
    LV.windZones=[[340,1120],[1600,2200],[2500,2660]];
    LV.windAt=x=>{if(LV.gustT>0)return -950;if(!LV.windZones.some(z=>x>z[0]&&x<z[1])||LV.shelter.some(s=>x>s[0]&&x<s[1]))return 0;const b=beat(),k=Math.floor(b.x),fr=b.x-k;return (((k%2)+2)%2===1&&fr<.5)?-950:0};
    LV.tick=dt=>{if(LV.gustT>0)LV.gustT-=dt;const b=beat(),k=Math.floor(b.x),gusting=LV.gustT>0||(((k%2)+2)%2===1&&b.x-k<.5&&LV.windZones.some(z=>P.x>z[0]-200&&P.x<z[1]));if(gusting&&Math.random()<.6)LV.fx.push({x:cam+W+5,y:rnd(40,GY),vx:-rnd(260,360),vy:rnd(-10,10),t:0,life:2,c:pick(['#9ac85a','#c8d870','#7aa848']),s:2})};
    LV.drawMid=c=>{LV.shelter.forEach(([a,b])=>{const x=a-c;for(let k=0;k<5;k++){R(g,['#5a8a30','#4a7a28','#6a9a3a'][k%3],x+k*10,60,5,GY-60);for(let y=70;y<GY;y+=24)R(g,'#3e6a28',x+k*10,y,5,1)}disc(g,'#3f7a34',x+25,64,26);disc(g,'#4f8a3c',x+10,80,16);disc(g,'#4f8a3c',x+40,78,16)})};
    const farmer=actor('elder',1380,-1,{lookP:1});farmer.talk=()=>{if(!ST.helped){talk([['elder','ไม้ไผ่ล้มขวางทางเกวียน ช่วยลุงยกออกหน่อยได้ไหมหลาน'],['pian','กด “ใช้” ที่กองไม้ไผ่ข้าง ๆ ลุงได้เลย']])}else talk([['elder','ขอบใจหลาน ชาวบ้านปลูกไผ่ไว้ใช้ซ่อมบ้านทำเครื่องมือ ใครผ่านมาช่วยกันดูแลนะ']])};
    use(1420,40,'ยกไม้ไผ่ออก',u=>{u.off=1;ST.helped=1;star(7,'ช่วยลุงยกไม้ไผ่');sfx(t=>TS2.chab(2,t,.3))});
  },
  async run(){
    sceneStart(300);const j=glowActor('jao',2900,-1);
    await talk([['sys','อุโมงค์ไผ่ทิวไผ่งาม ต.แม่กาษา ชาวบ้านปลูกแนวไผ่สองข้างทางจนโค้งเข้าหากัน'],['foo','นั่นจ้าว! ยืนถือขลุ่ยอยู่ปลายอุโมงค์ แต่ไม่ยอมเป่า'],['gold','เล่นแบบนี้ไม่ต้องพัฒนาหรอก เดี๋ยวก็ได้อาชีพดี ๆ เอง'],['gold','ครูดนตรีน่ะ ใครก็เป็นได้ ไม่ต้องเรียน ไม่ต้องฝึก'],
      ['pian','ลมในอุโมงค์พัดแรงทุกครั้งที่ “ฉับ” ให้เดินตอน “ฉิ่ง” แล้วหลบหลังกอไผ่ตอนลมมา'],['pian','กด '+(isTouch()?'⇄':'Q')+' สลับเพื่อนในทีมได้ แต่ละคนเล่นเครื่องคนละแบบ']]);
    sceneEnd();
    trig(150,()=>{[['walk',560],['float',820],['shout',910,190],['walk',1150],['shield',1300]].forEach(([k,x,y])=>enemy(k,x,y))});
    trig(1240,()=>{if(!TEAM.includes('foo'))say('รั้วนี้ฟูปีนได้ ถ้ามาด้วยกันคราวหน้าลองดู',1);else say('ใช้ฟูปีนรั้ว: กดกระโดดค้างไว้ตอนชิดรั้ว',1)});
    trig(1560,()=>{[['dash',1700],['walk',1900],['float',2050],['shout',2010,170],['mini',2300],['mini',2340],['shield',2560]].forEach(([k,x,y])=>enemy(k,x,y))});
    await reach(2700);
    await bossFight({name:'เงาไม่ต้องพัฒนา',sub:'ปลายอุโมงค์ไผ่',x:2950,arena:[2700,LV.w],hp:170,sc:3,opt:{dash:1},words:['ไม่ต้องพัฒนา!','ใครก็เป็นครูได้!','ไม่ต้องเรียน!'],acts:['gust','shoot','dash','rain','summon'],every:4,say:'ไม่ต้องเรียน ไม่ต้องฝึก ก็ได้อาชีพดี ๆ',
      lineB:[['pian','ลมเริ่มเบาลงแล้ว ฟังทำนองขลุ่ยแล้วตีตาม']],cr:{inst:'khlui',rounds:3,len:3},
      preC:async()=>{j.glow=0;await walk(j,2860,50)},lineC:[['jao','เสียงขลุ่ย… นี่มันเพลงที่ผมซ้อมทุกเย็น'],['pian','จ้าวเป่าด้วยกันเลย!']],
      jam:{who:TEAM.concat(['jao']),inst:['khlui','ranad','khong'],pattern:PAT_B,bars:2,title:'บรรเลงพร้อมกัน: ขลุ่ยนำวง'}});
    sceneStart(2860);const tg=actor('tang',2740,1);walk(tg,2810,60);
    await talk([['jao','ผมอยากเป็นครูดนตรีครับ แต่เสียงนั่นบอกว่าไม่ต้องเรียนต่อ ไม่ต้องฝึกก็เป็นได้'],['tang','ทางจริงของครูดนตรีคือเรียนต่อ ฝึกเล่น ฝึกสอนในโรงเรียนจริง แล้วพัฒนาตัวเองไปตลอด'],
      ['tang','ครูเองก็ยังซ้อมทุกวัน ถ้าจ้าวอยากรู้ข้อมูลมหาวิทยาลัย มาคุยกับครูได้เลย'],['jao','งั้นผมจะซ้อมขลุ่ยทุกวัน แล้วช่วยสอนน้อง ๆ ด้วยครับ'],['pian','ข้อความใหม่ในกลุ่ม: เช่ไปนั่งเงียบ ๆ แถวน้ำตกธารารักษ์ ใกล้ถ้ำสีฟ้า']]);
    voiceBack(2,['jao'],this.inst);await waitS(2.5);sceneEnd()}};

/* ====================================================================
   ฉาก 3 · ป่าเชิงเขาและน้ำตกธารารักษ์ (ถ้ำสีฟ้าเป็นจุดพัก) — เสียงที่ 3: เช่ (ระนาดเอก)
   ป่ามืดยามเย็น ทางแยกสามจุด ฟังหาทำนองระนาดที่คุ้นหู
   ==================================================================== */
const REAL=[10,11,12,14,15,14,12,11],FAKE=[10,13,11,16,9,13,8,16];
function phrase(keys,x,fake){sfx(()=>{const b=nb();keys.forEach((k,i)=>{const t=b+i*BEAT/2;if(fake){TS2.ranadKey(k,t,.5);if(i%3===1)TS2.chab(1,t+.05,.2)}else TS2.ranadKey(k,t,.6)})})}
STAGES[3]={id:3,name:'ป่าเชิงเขา น้ำตกธารารักษ์',sub:'ริมทางหลวง 1090 ใกล้ถ้ำสีฟ้า',who:['che'],inst:'ระนาดเอก',bpm:88,w:3300,start:60,
  music(k,t){if(k%4===0)TS2.sorou(pick([229,257,289,344]),t,BEAT*1.8,.12,MUS);if(k%8===6)TS.khong(1,t,.12,MUS)},
  build(){artForest();
    const [c,x]=[LV.L.world,LV.L.world.getContext('2d')];caveMouth(x,180);
    LV.floor=floorMaker([{x0:0,x1:LV.w,k:'dirt',c1:'#4a3e30',c2:'#3a2e22',c3:'#5a4a38',leaf:1}]);
    gap(1900,260,'water');[[1905,200,46],[1975,186,40],[2040,196,46],[2105,184,44]].forEach(([a,b,w])=>plat(a,b,w,{draw:(q,c)=>{R(g,'#8a6a40',q.x-c,q.y,q.w,4);R(g,'#5a4426',q.x-c,q.y+4,q.w,2);R(g,'#4a3420',q.x-c+q.w/2-1,q.y+6,3,GY+6-q.y)}}));
    [[500,190,60],[760,176,50],[1300,186,60],[2500,190,50],[2600,170,44]].forEach(([a,b,w])=>plat(a,b,w,{draw:(q,c)=>{R(g,'#6a6458',q.x-c,q.y,q.w,6);R(g,'#8a8476',q.x-c,q.y,q.w,2)}}));
    wall(2700,206,24,24,'crate',{lim:[2640,2760]});item(2770,200,'mat',{m:'wax'});
    item(770,166,'note',{id:'ranad'});item(1320,176,'mat',{m:'wood'});item(2120,174,'heal');item(2610,160,'note',{id:'listen'});
    cp(180,'cave','ถ้ำสีฟ้า (เขตวัด เดินเงียบ ๆ)');cp(1700,'flag','ศาลาริมอ่าง');
    LV.lights=[];for(let i=0;i<24;i++)LV.lights.push({x:200+i*130+rnd(-30,30),y:rnd(100,200),r:10});
    // ทางแยกสามจุด: มีสองประตูต่อจุด ประตูที่ถูกมีทำนองระนาดที่คุ้นหู
    LV.forks=[{x:620,ok:Math.random()<.5,next:900},{x:1450,ok:Math.random()<.5,next:1720},{x:2260,ok:Math.random()<.5,next:2480}];
    LV.forks.forEach(f=>wall(f.x+170,20,24,210,'thicket',{draw:(q,c)=>{const x=q.x-c;R(g,'#16261a',x-6,q.y,q.w+12,q.h);for(let i=0;i<14;i++)disc(g,i%2?'#1e3a24':'#264a2c',x+q.w/2+Math.sin(i*2.1)*12,q.y+10+i*15,12)}}));
    LV.forks.forEach((f,fi)=>{[0,1].forEach(side=>{const d={x:f.x+side*120,w:36,n:'เข้าทางนี้',side,f,fi,last:-9,
      enter:dd=>{const right=(dd.side===0)===dd.f.ok;fade(1,.3).then(()=>{if(right){P.x=dd.f.next;P.cp=dd.f.next;say('ใช่แล้ว! ทำนองนี้แหละที่เช่ชอบเล่น',1);sfx(t=>TS2.ranadKey(17,t,.6))}else{P.x=dd.f.x-80;unity(-1);say('ทางนี้เสียงเพี้ยน… เป็นเสียงเลียนแบบ ฟังใหม่อีกที',1);enemy('echo',dd.f.x-20,GY,{quiet:1})}cam=clamp(P.x-W*.42,0,LV.w-W);fade(0,.3)})},
      draw:(dd,c)=>{const x=dd.x-c;g.fillStyle='#14100c';g.beginPath();g.moveTo(x-16,GY);g.quadraticCurveTo(x-16,GY-60,x,GY-64);g.quadraticCurveTo(x+16,GY-60,x+16,GY);g.fill();blob(g,x,GY-66,16,['#1e3a24','#264a2c'],5,seeded(dd.x));}};LV.doors.push(d)})});
    LV.tick=dt=>{const now_=T;LV.doors.forEach(d=>{const dist=Math.abs(P.x-d.x);if(dist<110&&now_-d.last>BEAT*8){d.last=now_;const right=(d.side===0)===d.f.ok;phrase(right?REAL:FAKE,d.x,!right);pop(d.x,GY-80,right?'♪':'♪?','#ffe08a')}})};
    LV.dark=0;
  },
  async run(){
    sceneStart(200);
    await talk([['sys','เย็นวันเสาร์ ป่าเชิงเขาริมทางหลวง 1090 ไม่ไกลจากน้ำตกธารารักษ์'],['pian','ตรงนี้คือปากถ้ำสีฟ้า อยู่ในเขตวัด เราพักใจเดินเงียบ ๆ ไม่สู้กันที่นี่'],['gold','เล่นเพื่อผ่อนคลายไม่มีค่าหรอก คนเก่งเขาเล่นจริงจังกัน ออกจากวงเถอะ'],
      ['waen','เช่ส่งข้อความมาว่า “อยากอยู่เงียบ ๆ” แล้วก็ไม่ตอบอีกเลย'],['pian','ฟ้ามืดลงเรื่อย ๆ ข้างหน้ามีทางแยก ฟังให้ดี ทางที่ถูกจะมีทำนองระนาดที่เช่ชอบเล่น'],['pian','ทำนองแบบนี้ไง…']]);
    phrase(REAL,0,0);await waitS(BEAT*5);sceneEnd();
    trig(300,()=>{LV.dark=.45;[['echo',440],['walk',560],['float',800]].forEach(([k,x])=>enemy(k,x,GY,{yb:GY-10}))});
    trig(900,()=>{LV.dark=.55;[['echo',1050],['shout',1310,186],['dash',1200],['walk',1380]].forEach(([k,x,y])=>enemy(k,x,y,{yb:GY-10}))});
    trig(1720,()=>{LV.dark=.62;[['float',1990],['echo',2150],['walk',2190]].forEach(([k,x])=>enemy(k,x,GY,{yb:GY-30}))});
    trig(2400,()=>{LV.dark=.66;[['shield',2550],['echo',2650],['mini',2820],['mini',2860]].forEach(([k,x])=>enemy(k,x,GY,{yb:GY-10}))});
    trig(2680,()=>{if(!TEAM.includes('che'))say('ลังไม้นี้ต้องให้คนแรงเยอะช่วยดัน… เช่ดันได้แน่',1)});
    await reach(2950);LV.dark=.5;const c3=glowActor('che',3240,-1);
    await bossFight({name:'เงาไร้ค่า',sub:'ริมลำธารใต้น้ำตก',x:3180,arena:[2950,LV.w],hp:170,sc:3,words:['ไม่มีค่า!','ออกจากวงเถอะ!','เล่นเล่นไม่มีใครฟัง!'],acts:['clone','shoot','rain','clone','dash'],every:4,say:'เล่นเพื่อผ่อนคลายน่ะไม่มีค่า',
      lineB:[['pian','เงาเริ่มจางแล้ว! ฟังเสียงระนาดแล้วตีตาม']],cr:{inst:'ranad',rounds:3,len:4},
      preC:async()=>{c3.glow=0;await walk(c3,3120,50)},lineC:[['che','…ระนาดนี่… เพลงที่ผมเล่นเล่นตอนพักซ้อม'],['pian','เช่ ตีด้วยกันเลย!']],
      jam:{who:TEAM.concat(['che']),inst:['ranad','khong','sor'],pattern:PAT_A,bars:2,title:'บรรเลงพร้อมกัน: ระนาดเอกนำ'}});
    LV.dark=0;sceneStart(3100);
    await talk([['che','ผมเล่นเพราะมันทำให้หายเหนื่อย… เสียงนั่นบอกว่าแบบนี้ไม่มีค่า ผมเลยอยากหายไปเงียบ ๆ'],['foo','ไม่มีค่าอะไรกัน ทุกครั้งที่เช่ตีระนาดเล่น ๆ ห้องเราครึกครื้นขึ้นทุกที'],
      ['waen','วงต้องการเช่แบบที่เช่เป็น ไม่ต้องเก่งที่สุดก็มีค่า'],['che','…งั้นพรุ่งนี้ผมไปซ้อมนะ'],['pian','ข้อความใหม่: มหาพราหมณ์กับกัปตันอยู่ที่บ่อน้ำร้อนแม่กาษา มีคนเห็นแสงสีทองแปลก ๆ']]);
    voiceBack(3,['che'],this.inst);await waitS(2.5);sceneEnd()}};

/* ====================================================================
   ฉาก 4 · บ่อน้ำร้อนและน้ำตกแม่กาษา — เสียงที่ 4: มหาพราหมณ์ + กัปตัน
   หินข้ามบ่อเป็นลูกระนาด เหยียบตามทำนอง · ไอน้ำพุ่งตอนฉับ
   ==================================================================== */
const STONEC=['#e86a6a','#f2c14e','#6ac86a','#6ab0f0','#c69bff'],STONEK=[10,11,12,14,15];
function stonePuzzle(x0,seqLen){const pz={x0,seq:[],idx:0,solved:0,stones:[]};let k=Math.random()<.5?0:1;for(let i=0;i<seqLen;i++){pz.seq.push(k);k=clamp(k+pick([-1,1,1,1,0]),0,4);if(pz.seq.length&&k===pz.seq[pz.seq.length-1]&&Math.random()<.5)k=clamp(k+1,0,4)}
  gap(x0,5*44+30,'hot');
  for(let i=0;i<5;i++){const s=plat(x0+12+i*44,GY-6-((i%2)*12),26,{key:i,pz,draw:(q,c)=>{if(q.off)return;const lit=q.lit>T;g.fillStyle=lit?'#ffffff':STONEC[q.key];g.beginPath();g.ellipse(q.x-c+13,q.y+3,14,5,0,0,7);g.fill();R(g,'rgba(0,0,0,.25)',q.x-c+2,q.y+5,24,2)},
    onLand:q=>{const p=q.pz;if(p.solved||q.sunk)return;TS2.ranadKey(STONEK[q.key],AC?AC.currentTime:0,.7);q.lit=T+.3;
      if(q.key===p.seq[p.idx]){p.idx++;if(p.idx>=p.seq.length){p.solved=1;sparks(q.x+13,q.y,16,1);say('ถูกทั้งทำนอง! หินทั้งแถวแข็งแรงแล้ว',1);sfx(t=>{[10,12,14,15,17].forEach((k,i)=>TS2.ranadKey(k,t+i*.09,.5))})}}
      else{q.sunk=1;p.idx=0;pop(q.x+13,q.y-20,'ผิดเสียง!','#ffb0b0');setTimeout(()=>{q.off=1},250);setTimeout(()=>{q.off=0;q.sunk=0},1700)}}});pz.stones.push(s)}
  pz.play=()=>{const b=nb();pz.idx=0;pz.seq.forEach((k,i)=>{const t=b+i*BEAT;sfx(()=>TS2.ranadKey(STONEK[k],t,.75));setTimeout(()=>{pz.stones[k].lit=T+.35},Math.max(0,(t-now())*1000))})};
  use(x0-20,36,'ฟังทำนองหิน',()=>pz.play());trig(x0-80,()=>{pz.play();say('ฟังทำนอง แล้วกระโดดเหยียบหินตามลำดับเสียง',1)});return pz}
STAGES[4]={id:4,name:'บ่อน้ำร้อนแม่กาษา',sub:'น้ำพุร้อนและน้ำตกในป่า อ.แม่สอด',who:['maha','captain'],inst:'ฆ้องวงใหญ่ ตะโพน',bpm:100,w:3200,start:60,
  music(k,t){if(k%2===0)TS2.thum([7,9,10,12][(k/2)%4|0],t,.16,MUS);if(k%8===0)TS2.taphon(0,t,.22,MUS);if(k%8===4)TS2.taphon(3,t,.18,MUS)},
  build(){artSpring();
    LV.floor=floorMaker([{x0:0,x1:LV.w,k:'rock'}]);
    LV.pz=[stonePuzzle(560,3),stonePuzzle(1380,4),stonePuzzle(2240,5)];
    [[300,196,60],[900,190,70],[1060,170,50],[1700,190,60],[1820,166,50],[2600,192,60]].forEach(([a,b,w])=>plat(a,b,w,{draw:(q,c)=>{R(g,'#a87a48',q.x-c,q.y,q.w,4);for(let i=0;i<q.w;i+=8)R(g,'#8a5a30',q.x-c+i,q.y,1,4);R(g,'#6a4420',q.x-c+4,q.y+4,3,GY-q.y-4);R(g,'#6a4420',q.x-c+q.w-7,q.y+4,3,GY-q.y-4)}}));
    [[1180,150,40],[1240,126,40],[1300,104,50]].forEach(([a,b,w])=>plat(a,b,w,{hid:1}));item(1320,92,'note',{id:'khongwong',hid:1});
    item(1070,160,'mat',{m:'wax'});item(1830,156,'mat',{m:'hide'});item(2000,200,'heal');item(2620,182,'note',{id:'taphon'});
    cp(1000,'flag','ศาลาพักริมบ่อ');cp(1960,'flag','ศาลาไม้');
    LV.vents=[[420,30],[1600,30],[2050,30],[2750,30]];
    LV.tick=dt=>{const b=beat(),k=Math.floor(b.x),erupt=(((k%2)+2)%2===1&&b.x-k<.4);LV.erupt=erupt;
      if(erupt&&mode==='play')for(const [vx,vw] of LV.vents)if(P.x>vx&&P.x<vx+vw&&P.y>GY-90)hurt(8,P.x<vx+vw/2?-1:1);
      LV.plats.forEach(q=>{if(q.hid&&!q.shown&&act()==='waen'&&Math.abs(P.x-q.x)<160){q.shown=1;sparks(q.x+q.w/2,q.y,8,0,'#c69bff');say('แว่นเห็นทางลับ!',1)}});LV.items.forEach(it=>{if(it.hid&&!it.shown&&act()==='waen'&&Math.abs(P.x-it.x)<160)it.shown=1})};
    LV.drawMid=c=>{for(const [vx,vw] of LV.vents){const x=vx-c;R(g,'#5a5448',x,GY-4,vw,4);if(LV.erupt){for(let i=0;i<8;i++){g.fillStyle='rgba(255,255,255,'+(.5-i*.05)+')';g.beginPath();g.arc(x+vw/2+Math.sin(T*9+i)*6,GY-10-i*11,8+i*1.5,0,7);g.fill()}}else{g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.arc(x+vw/2,GY-8+Math.sin(T*3)*2,6,0,7);g.fill()}}
      for(let i=0;i<LV.w;i+=140){const x=i-c+((T*8)%140);if(x<-30||x>W+30)continue;g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.arc(x,GY-30-((T*12+i)%60),14,0,7);g.fill()}};
  },
  async run(){
    sceneStart(300);
    await talk([['sys','บ่อน้ำร้อนแม่กาษา ไอน้ำลอยขึ้นจากบ่อ น้ำร้อนจัด ห้ามลงไปเด็ดขาด'],['che','นั่นมหาพราหมณ์กับกัปตัน… มีแสงทองรอบตัวเหมือนมงกุฎ'],
      ['gold','ศรัทธาฉัน แล้วจะได้อำนาจวิเศษเหนือคนอื่น ทุกคนในวงต้องฟังเธอ'],['pian','สังเกตไหม คำลวงนี้ล่อให้อยู่ “เหนือคนอื่น” วงดนตรีไม่มีใครอยู่เหนือใคร'],
      ['pian','หินข้ามบ่อแต่ละก้อนมีเสียงระนาดคนละเสียง ฟังทำนองแล้วเหยียบตามลำดับ เหยียบผิดหินจะจม'],['pian','ระวังไอน้ำที่พุ่งขึ้นทุกครั้งที่ “ฉับ” ด้วย']]);
    sceneEnd();
    trig(150,()=>[['walk',360],['shout',920,190],['float',1100]].forEach(([k,x,y])=>enemy(k,x,y)));
    trig(1160,()=>{if(TEAM.includes('waen'))say('สลับเป็นแว่นแล้วมองขึ้นไปข้างบน…',1)});
    trig(1660,()=>[['dash',1760],['shield',1900],['float',2050],['walk',2150]].forEach(([k,x,y])=>enemy(k,x,y)));
    trig(2520,()=>[['shout',2620,192],['walk',2700],['mini',2760],['mini',2800]].forEach(([k,x,y])=>enemy(k,x,y)));
    await reach(2860);const m=glowActor('maha',3150,-1),cpt=glowActor('captain',3175,-1);
    await bossFight({name:'เงาอำนาจ',sub:'บัลลังก์ไอน้ำกลางบ่อ',x:3080,arena:[2860,LV.w],hp:190,sc:3.3,opt:{crown:1},words:['เหนือคนอื่น!','ทุกคนต้องฟังเธอ!','ศรัทธาฉัน!'],acts:['summon','slam','shoot','rain','slam'],every:4,minion:'walk',say:'ศรัทธาฉัน แล้วจะได้อำนาจเหนือคนอื่น',
      lineB:[['pian','มงกุฎทองเริ่มร้าวแล้ว! ฝีมือจริงฟังออกด้วยหู ฟังทำนองฆ้องแล้วตีตาม']],cr:{inst:'khong',rounds:3,len:4},
      preC:async()=>{m.glow=0;cpt.glow=0;walk(m,3010,50);await walk(cpt,3040,50)},lineC:[['maha','ทำนองฆ้องนี้… ผมเป็นคนสอนน้อง ๆ เอง'],['captain','ขอผมตีตะโพนกำกับด้วย!']],
      jam:{who:TEAM.concat(['maha','captain']),inst:['khong','ranad','klong'],pattern:PAT_C,bars:2,title:'บรรเลงพร้อมกัน: ฆ้องวงใหญ่และตะโพน'}});
    sceneStart(3020);
    await talk([['maha','ผมอยากเก่งที่สุดในวง จนลืมฟังคนอื่น'],['captain','ผมแค่อยากกล้าพูดต่อหน้าคน… นึกว่าต้องมีอำนาจก่อนถึงจะมีคนฟัง'],
      ['tang','(ข้อความเสียงจากครูตังค์) ผู้นำที่ดีไม่ได้อยู่เหนือใคร ผู้นำที่ดีฟังคนอื่นก่อน'],['tang','กัปตัน ลองเป็นพิธีกรงานแสดงปลายเทอมไหม ครูจะช่วยซ้อมพูดให้'],['captain','ลองครับ!'],
      ['pian','ข้อความใหม่: ไข่มุก อิ้ง ไอซ์ ไปถ่ายคลิปที่ตลาดริมเมย บอกว่าจะได้ยอดวิวล้าน']]);
    voiceBack(4,['maha','captain'],this.inst);await waitS(2.5);sceneEnd()}};

/* ====================================================================
   ฉาก 5 · ตลาดริมเมย — เสียงที่ 5: ไข่มุก อิ้ง ไอซ์ (ร้องนำ โทน รำมะนา)
   นักดนตรีกะเหรี่ยงและวงปี่พาทย์พม่า · ถอดรหัสคลิปตัดต่อ
   ==================================================================== */
STAGES[5]={id:5,name:'ตลาดริมเมย',sub:'สุดประจิมที่ริมเมย อ.แม่สอด',who:['kaimuk','ing','ice'],inst:'ร้องนำ โทน รำมะนา',bpm:112,w:3400,start:60,
  music(k,t){if(k%2===0)TS2.harp([0,2,4,3,2,1,0,2][(k/2)%8|0],t,.2,MUS);if(k%4===1)patwaing([0,2,4,5][(k/4)%4|0],t,.25,MUS);if(k%8===6)TS2.thon(2,t,.2,MUS)},
  build(){artMarket({stalls:[[200,'#d84a6a',['#e8c060','#c03030','#6a9a3a']],[460,'#3a7ad8',['#f2f0e8','#e86a8a','#3a3ad8']],[900,'#e89a30',['#c8a060','#6a4a2a','#e8d8b0']],[1160,'#5aa84a',['#ffd86a','#ff8a4a','#c03030']],[1700,'#d84a6a',['#9a9aa8','#2a2a30','#c8c0b0']],[1960,'#3a7ad8',['#e8c060','#c03030','#6a9a3a']],[2500,'#e89a30',['#f2f0e8','#e86a8a','#3a3ad8']]],sign:620,stage:1380});
    LV.floor=floorMaker([{x0:0,x1:LV.w,k:'tile'}]);
    [[200,186,90],[460,186,90],[900,186,90],[1160,186,90],[1700,186,90],[1960,186,90],[2500,186,90],[1380,198,180],[2240,150,60]].forEach(([a,b,w])=>plat(a,b,w,{noDraw:1}));
    [[200,134],[460,134],[900,134],[1160,134],[1700,134],[1960,134],[2500,134]].forEach(([a,b])=>plat(a-8,b-8,106,{draw:()=>{}}));
    item(2260,140,'mat',{m:'string'});item(1720,116,'mat',{m:'hide'});item(1180,116,'note',{id:'hsaing'});item(480,116,'heal');
    cp(620,'flag','ป้ายสุดประจิมที่ริมเมย');cp(2200,'flag','ร้านน้ำ');
    const kr=actor('karen',1300,1,{pose:'play',draw:(a,x)=>{drawSprite(g,setOf('karen'),'idle',0,x,a.y,1);R(g,'#c8a060',x+4,a.y-26,3,22);g.strokeStyle='#d8b878';g.lineWidth=2;g.beginPath();g.moveTo(x+6,a.y-6);g.quadraticCurveTo(x+22,a.y-10,x+20,a.y-34);g.stroke();for(let i=0;i<5;i++)R(g,'#e8e8e8',x+7+i*2,a.y-24+i*2,1,14-i*2)}});
    kr.talk=()=>{talk([['karen','สวัสดีครับ นี่คือเตหน่ากู พิณของพี่น้องกะเหรี่ยง'],['karen','มือซ้ายเล่นเสียงประสาน มือขวาเล่นทำนอง ลองฟังดูนะ']]).then(()=>{sfx(()=>{const b=nb();[0,2,4,3,2,1,2,0,5,4].forEach((k,i)=>TS2.harp(k,b+i*BEAT/2,.9))});if(!SAVE.notes.includes('tehnaku')){SAVE.notes.push('tehnaku');store();banner('บันทึกความรู้',NOTES.tehnaku.t,2.4)}})};
    const mm=actor('myan',1440,-1);mm.talk=()=>talk([['myan','วงของลุงเป็นวงปี่พาทย์พม่า กลองวงนี่เป็นหัวใจของวงเลย'],['myan','เดี๋ยวตอนบ่ายมีเล่นเปิดตลาด ถ้าหลานเล่นดนตรีไทยมาเล่นด้วยกันสิ']]);
    actor('myan2',1500,-1,{lookP:1}).talk=()=>talk([['myan2','น้าร้องเพลงกับวงนี้มาหลายปีแล้ว ตลาดนี้มีคนหลายภาษา แต่ฟังเพลงด้วยกันได้หมด']]);
    actor('dancer',1560,-1);actor('dancer',1586,-1);
    const v=actor('vendor',700,1,{lookP:1});v.talk=()=>talk([['vendor','ระวังร้านข้างหน้านะหลาน ขาย “คอร์สลัดเก่งทันที” ราคาแพง ไม่มีใครเก่งจริงสักคน']]);
    const shady=use(1030,50,'ร้านคอร์สลัด',async u=>{const i=await choose('ป้าย “คอร์สลัดเก่งทันที จ่ายวันนี้ เล่นเป็นพรุ่งนี้!” คนขายเร่งให้จ่ายตอนนี้เลย',['ไม่ซื้อ ฝีมือต้องมาจากการซ้อม','ซื้อ (จ่ายวัตถุดิบทั้งหมดที่มี)']);u.off=1;
      if(i===0){star(4,'ไม่ซื้อคอร์สลัด');say('ใช่เลย เขาเร่งให้รีบจ่าย นั่นคือจุดสังเกตของคำลวง',1)}else{SAVE.mat={};store();unity(-3);ST.lies.push({t:'จ่ายนิดเดียว ได้ฝีมือทันที',k:'ทางลัด'});say('…ได้แต่กระดาษแผ่นเดียว ไม่มีอะไรเลย คราวหน้าถามครูก่อนนะ',1)}});
    const fix=use(2120,50,'ร้านซ่อมมือถือ',async u=>{await talk([['alum','พี่เป็นศิษย์เก่าสรรพวาทิต ตอนนี้ซ่อมมือถืออยู่ที่นี่'],['alum','เมื่อก่อนพี่ก็เคยหลงเชื่อเสียงทอง เดี๋ยวพี่สอนดูคลิปตัดต่อให้']]);const n=await decode({title:'เรียนถอดรหัสเสียงกับพี่ต้น',kinds:['noise','gap','pitch']});
      if(n>=2)star(3,'ถอดรหัสคลิปตัดต่อ');u.off=1;await talk([['alum','จำไว้ คลิปตัดต่อมักมีรอยต่อ เสียงพื้นหลังเปลี่ยน ช่วงเงียบตัด หรือระดับเสียงกระโดด'],['pian','บันทึกความรู้ใหม่: ถามเสมอว่าใครพูด มีหลักฐานไหม']]);if(!SAVE.notes.includes('media')){SAVE.notes.push('media');store()}});
    actor('alum',2150,-1,{lookP:1});
    LV.tick=dt=>{const near=LV.acts.find(a=>a.id==='karen'&&Math.abs(P.x-a.x)<120);};
  },
  async run(){
    sceneStart(400);
    await talk([['sys','ตลาดริมเมย สุดเขตแดนตะวันตกริมแม่น้ำเมย มีคนหลายภาษามาค้าขาย'],['maha','นั่นไข่มุก อิ้ง ไอซ์ ยืนถ่ายคลิปอยู่กลางตลาด'],['gold','ยอดวิวล้าน! ถ้าทิ้งวงเดิมมาเป็นของฉัน จะได้ขึ้นเวทีใหญ่ทุกวัน'],
      ['pian','ระวังมือถือลอยได้ พวกมันยิงหัวใจไลก์ปลอมใส่เรา'],['pian','ตลาดนี้มีนักดนตรีจริงด้วย ลองคุยกับพี่ดาวิที่เล่นเตหน่ากู กับลุงหม่องวงปี่พาทย์พม่า']]);
    sceneEnd();
    trig(150,()=>[['phone',500],['walk',780],['phone',980]].forEach(([k,x])=>enemy(k,x,GY,{yb:GY-20})));
    trig(1250,()=>say('เวทีตรงกลางตลาด ลองไปคุยกับนักดนตรีก่อน',1));
    LV.uses.push({x:1400,w:60,n:'เล่นด้วยกันกับวง',act:async u=>{u.off=1;await talk([['myan','มาเลย หลานเล่นฆ้อง ลุงตีกลองวง พี่ดาวิดีดเตหน่ากู'],['karen','เพลงเดียวกัน คนละภาษา ลองดูนะ']]);
      const sc=await bandJam({who:TEAM.slice(),inst:['harp','pat','khong'],pattern:PAT_B,bars:2,title:'เล่นด้วยกัน: เตหน่ากู ปัตวาย่ง ฆ้อง',need:.4});
      await talk([['myan2','ดูสิ คนเดินตลาดหยุดฟังกันเต็มเลย'],['pian','คนดูที่หยุดฟังเมื่อกี้เป็นคนจริงทั้งนั้น ไม่ใช่ยอดวิวปลอม']]);star(6,'เล่นดนตรีร่วมกับเพื่อนต่างวัฒนธรรม');unity(2)}});
    trig(1640,()=>[['phone',1800],['shield',1900],['phone',2050],['dash',2300]].forEach(([k,x])=>enemy(k,x,GY,{yb:GY-20})));
    trig(2440,()=>[['phone',2600],['walk',2700],['phone',2850]].forEach(([k,x])=>enemy(k,x,GY,{yb:GY-25})));
    await reach(2950);const g1=glowActor('kaimuk',3330,-1),g2=glowActor('ing',3355,-1),g3=glowActor('ice',3380,-1);
    await bossFight({name:'ยอดวิวล้าน',sub:'จอยักษ์ปลายตลาด',x:3200,y:GY-20,arena:[2950,LV.w],hp:180,look:'phone',w:60,h:92,fly:GY-10,words:['ยอดวิวล้าน!','ทิ้งวงเดิมเถอะ!','กดไลก์สิ!'],acts:['hearts','summon','rain','hearts','dash'],every:4,minion:'phone',say:'ยอดวิวล้าน ถ้าทิ้งวงเดิมมาเป็นของฉัน',
      lineB:[['pian','จอเริ่มดับแล้ว! พิสูจน์ให้เพื่อนเห็นว่าคลิปยอดวิวนั้นถูกตัดต่อ']],decode:{title:'พิสูจน์คลิปยอดวิว',q:'คลิป “ยอดวิวล้าน” ที่ส่งมาให้ไข่มุก คลิปไหนถูกตัดต่อ',kinds:['noise','pitch']},
      preC:async()=>{[g1,g2,g3].forEach(a=>a.glow=0);walk(g1,3110,50);walk(g2,3136,50);await walk(g3,3162,50)},lineC:[['kaimuk','คลิปนั้นตัดต่อจริงด้วย… เราเกือบทิ้งวงเพราะตัวเลขปลอม'],['ice','เมื่อกี้คนดูตัวจริงหยุดฟังเพลงพวกเธอนี่นา'],['ing','งั้นมาเล่นให้คนจริงฟังกัน!']],
      jam:{who:TEAM.concat(['kaimuk','ing','ice']),inst:['harp','klong','khong'],pattern:PAT_C,bars:2,title:'บรรเลงพร้อมกัน: เสียงร้องและโทน'}});
    sceneStart(3140);
    await talk([['kaimuk','เราอยากขึ้นเวทีจริง ๆ ไม่ใช่ยอดวิวปลอม'],['karen','ดนตรีของพวกเราต่างกัน แต่เล่นเพลงเดียวกันได้'],['myan','งานแสดงปลายเทอมของหลาน ลุงกับพี่ดาวิไปช่วยเล่นได้นะ'],
      ['pian','ข้อความใหม่: ลู่วากับพบธรรมทะเลาะกันที่แม่โกนเกน ก่อนงานตานก๋วยสลาก']]);
    voiceBack(5,['kaimuk','ing','ice'],this.inst);await waitS(2.5);sceneEnd()}};

/* ====================================================================
   ฉาก 6 · ชุมชนแม่โกนเกน — เสียงที่ 6: ลู่วา + พบธรรม (ฉาบ ปี่แน)
   วิ่งตามเกวียนกลองหลวง · บอสสองหัวต้องสลับคนตี
   ==================================================================== */
STAGES[6]={id:6,name:'ชุมชนแม่โกนเกน',sub:'งานตานก๋วยสลาก',who:['luwa','pob'],inst:'ฉาบ ปี่แน',bpm:143,w:4200,start:60,
  music(k,t){const c=((k%4)+4)%4;TS2.klchab(k%2?1:0,t,.32,MUS);if(c===0){TS2.klong(0,t,.55,MUS);TS2.klmong(t,.35,MUS)}if(c===2)TS2.klong(1,t,.4,MUS);if(c===3&&Math.random()<.4)TS2.klong(2,t+BEAT/2,.3,MUS)},
  build(){artVillage({houses:[150,420,3700],kuay:[3300,3420,3560,3880,4020]});
    LV.floor=floorMaker([{x0:0,x1:LV.w,k:'dirt',c1:'#a08058',c2:'#7a5a38',c3:'#b8986a'}]);
    [[600,190,60],[3450,186,60]].forEach(([a,b,w])=>plat(a,b,w,{draw:(q,c)=>{R(g,'#a87a48',q.x-c,q.y,q.w,4);R(g,'#6a4420',q.x-c+4,q.y+4,3,GY-q.y-4);R(g,'#6a4420',q.x-c+q.w-7,q.y+4,3,GY-q.y-4)}}));
    // ช่วงวิ่งตามเกวียน: ท่อนไม้และแอ่งน้ำบนถนน
    [1100,1400,1650,1980,2250,2550,2800].forEach(x=>wall(x,216,22,14,'log',{draw:(q,c)=>{R(g,'#7a5232',q.x-c,q.y,q.w,q.h);R(g,'#9a7250',q.x-c,q.y,q.w,3);disc(g,'#c8a070',q.x-c+3,q.y+7,4)}}));
    [1250,1800,2400].forEach(x=>gap(x,46,'water'));
    wall(760,200,26,30,'crate',{lim:[700,820]});item(840,200,'mat',{m:'hide'});
    item(620,180,'note',{id:'kuay'});item(3460,176,'mat',{m:'wood'});item(3470,150,'mat',{m:'bamboo'});item(2900,200,'heal');
    cp(900,'flag','บ้านพ่อครู');cp(3150,'flag','ลานงาน');
    const el=actor('elder',300,1,{lookP:1});el.talk=()=>{if(ST.kuay&&!ST.kuayDone){ST.kuayDone=1;talk([['elder','ขอบใจหลาน ก๋วยใบนี้ลุงจะเอาไปถวายวัดตอนจับสลาก']]).then(()=>star(7,'ช่วยถือก๋วยสลากให้พ่อครู'))}else if(!ST.kuay)talk([['elder','หลานช่วยลุงถือก๋วยสลากไปลานงานหน่อย กองอยู่ข้างบ้านนั่นแน่ะ']]);else talk([['elder','ไปเถอะหลาน เกวียนกลองหลวงออกแล้ว']])};
    use(460,40,'ถือก๋วยสลาก',u=>{u.off=1;ST.kuay=1;say('ได้ก๋วยแล้ว เอาไปให้พ่อครู',1)});
    LV.cart={x:1000};
    LV.drawMid=c=>{if(LV.cart.on||LV.cart.show){const x=LV.cart.x-c;R(g,'#6a4428',x,186,110,10);[x+18,x+92].forEach(wx=>{disc(g,'#3a2414',wx,214,16);disc(g,'#8a6a44',wx,214,12);for(let i=0;i<6;i++){const a=i/6*Math.PI*2+T*(LV.auto?4:0);limb(g,wx,214,wx+Math.cos(a)*11,214+Math.sin(a)*11,1,'#3a2414')}disc(g,'#3a2414',wx,214,3)});
      R(g,'#c8a868',x+14,150,80,30);R(g,'#e8d8b0',x+90,148,8,34);R(g,'#8a6a3a',x+14,150,80,4);R(g,'#8a6a3a',x+14,176,80,4);for(let i=0;i<5;i++)R(g,'#c03030',x+22+i*15,150,4,30);
      drawSprite(g,setOf('drummer'),'play',Math.floor(T*6)%2,x+104,186,-1)}};
    LV.tick=dt=>{if(LV.auto){LV.cart.x=LV.autoX+W*.55;if(P.x<cam+14){P.x=cam+14;if(P.vx<0)P.vx=0}if(P.x>cam+W-14)P.x=cam+W-14}};
  },
  async run(){
    sceneStart(250);chingOn=false;
    await talk([['sys','ชุมชนแม่โกนเกน เช้าวันงานตานก๋วยสลาก ชาวบ้านจัดก๋วยไม้ไผ่ใส่ของเตรียมถวายวัด'],['che','ได้ยินเสียงกลองหลวงซ้อมแต่ไกลเลย'],
      ['gold','ชมรมพื้นเมืองกับปี่พาทย์ไม่ควรอยู่ด้วยกัน เลือกข้างได้แล้ว'],['pian','คำนี้แบ่งแยกเพื่อน ทั้งที่งานบุญนี้มีทั้งกลองหลวงและปี่พาทย์มาตั้งนาน'],
      ['pian','วงกลองหลวงไม่ใช้ฉิ่ง ให้ฟังฉาบแทน ฉาบเปิดคือฉิ่ง ฉาบปิดคือฉับ'],['pian','เกวียนกลองหลวงต้องไปถึงลานงานทันเวลา วิ่งตามเกวียนไป กระโดดข้ามท่อนไม้และแอ่งน้ำ']]);
    sceneEnd();
    trig(150,()=>[['walk',700],['float',880]].forEach(([k,x])=>enemy(k,x,GY,{yb:GY-15})));
    await reach(950);
    sceneStart(1000);LV.cart.show=1;LV.cart.x=1000;
    await talk([['drummer','ขึ้นเกวียนไม่ได้นะหลาน วิ่งตามมาข้าง ๆ แล้วช่วยไล่เงาทองที่ขวางทาง'],['pian','จอจะเลื่อนไปเอง อย่าตกขอบซ้ายนะ!']]);
    sceneEnd();LV.autoX=cam;LV.auto=92;LV.cart.on=1;
    const spawns=[[1200,'dash'],[1500,'float'],[1720,'walk'],[2000,'shield'],[2150,'float'],[2350,'dash'],[2600,'walk'],[2700,'float']];
    spawns.forEach(([x,k])=>trig(x+40,()=>enemy(k,x+W,GY,{yb:GY-25})));
    await until(()=>LV.autoX>=2950-W*.3);LV.auto=0;LV.cart.on=0;LV.cart.show=1;LV.cart.x=3000;
    say('ถึงลานงานแล้ว!',1);
    await reach(3500);const l=glowActor('luwa',4100,-1),pb=glowActor('pob',4140,-1);
    await bossFight({name:'เงาแบ่งวง',sub:'กลางลานงานตานก๋วยสลาก',x:3900,arena:[3500,LV.w],hp:200,sc:3,opt:{shield:1},words:['เลือกข้างสิ!','อย่าเล่นด้วยกัน!','คนละวงกัน!'],acts:['shoot','slam','summon','dash','rain'],every:4,say:'ชมรมพื้นเมืองกับปี่พาทย์ไม่ควรอยู่ด้วยกัน',
      onStart:b=>{b.vuln=1;b.guard=1;LV.onSwitch=()=>{if(LV.boss===b){b.guard=0;b.opt={};pop(b.x,b.y-b.h-10,'โล่แตก!','#9ff0c0');clearTimeout(b.gt);b.gt=setTimeout(()=>{if(LV.boss===b&&b.vuln){b.guard=1;b.opt={shield:1}}},4000)}};
        const ai=b.ai;b.ai=(bb,dt,bt)=>{ai(bb,dt,bt);bb.shield=bb.guard};say('เงานี้มีโล่ ต้องสลับเพื่อนแล้วตีต่อกัน โล่ถึงจะแตก!',1)},
      lineB:[['pian','เงาแบ่งวงเริ่มแตก! ฟังจังหวะกลองหลวงแล้วตีตาม']],cr:{inst:'klong',rounds:3,len:4},
      preC:async()=>{LV.onSwitch=null;l.glow=0;pb.glow=0;walk(l,3720,50);await walk(pb,3750,50)},lineC:[['pob','ผมอยู่ทั้งสองชมรม เสียงนั่นบอกให้เลือกข้าง ผมเลยทะเลาะกับลู่วา'],['luwa','เราไม่ต้องเลือกข้าง มาเล่นด้วยกันในงานนี้เลย']],
      jam:{who:TEAM.concat(['luwa','pob']),inst:['klong','pinae','khong'],pattern:PAT_B,bars:2,title:'บรรเลงพร้อมกัน: กลองหลวง ปี่แน และฆ้อง'}});
    sceneStart(3750);const el2=actor('elder',3600,1);walk(el2,3680,50);
    await talk([['elder','กลองหลวงกับปี่พาทย์อยู่ในงานบุญเดียวกันมาตั้งนานแล้วหลาน'],['luwa','พบธรรมเป็นคนเชื่อมสองชมรมไว้ด้วยกันต่างหาก'],['pob','งั้นงานปลายเทอม ผมขอเป่าปี่แนนำเข้าเวทีนะ!'],
      ['pian','เหลืออีกคนเดียว… มาเตโอไม่ตอบข้อความใครเลย สัญญาณมือถือล่าสุดอยู่ที่ห้อง 512']]);
    chingOn=true;voiceBack(6,['luwa','pob'],this.inst);await waitS(2.5);sceneEnd()}};

/* ====================================================================
   ฉาก 7 · ห้อง 512 ยามค่ำ → หอประชุม — เสียงที่ 7: มาเตโอ และเสียงของเราเอง
   ==================================================================== */
STAGES[7]={id:7,name:'ห้อง 512 ยามค่ำ และหอประชุม',sub:'คืนก่อนงานแสดงปลายเทอม',who:['mateo'],inst:'ฆ้องวงใหญ่ และเสียงของเราเอง',bpm:108,w:2900,start:80,
  music(k,t){if(k%2===0)TS.khong([0,2,3,4,3,2,0,-1][(k/2)%8|0],t,.14,MUS);if(k%8===0)TS2.that(1,t,.25,MUS);if(k%8===5)TS2.taphon(3,t,.16,MUS)},
  build(){const [c,x]=mk(LV.w,H),r=seeded(3);drawRoom512(x,r,1);
    // ทางเดินหลังห้องไปหอประชุม
    R(x,'#3a3a48',ROOM_END,0,300,222);for(let i=ROOM_END;i<ROOM_END+300;i+=50)R(x,'#2a2a36',i,0,4,222);R(x,'#5a5a6a',ROOM_END,120,300,4);
    artHall(x,ROOM_END+300,LV.w);LV.L.world=c;LV.L.sky=skyCanvas([[0,'#0a0e24'],[.7,'#1a2048'],[1,'#2a2a50']],0,1,77);
    LV.floor=floorMaker([{x0:0,x1:ROOM_END,k:'night'},{x0:ROOM_END,x1:ROOM_END+300,k:'concrete'},{x0:ROOM_END+300,x1:LV.w,k:'board'}]);
    // โต๊ะยาวที่มาเตโอซ่อน และช่องลอดใต้เวที
    wall(ROOM_END+200,120,60,86,'low',{draw:(q,c)=>{R(g,'#2a2026',q.x-c,q.y,q.w,q.h);R(g,'#4a3a40',q.x-c,q.y+q.h-4,q.w,4);for(let i=0;i<q.w;i+=10)R(g,'#3a2a30',q.x-c+i,q.y,2,q.h)}});
    [[148,196,60],[218,182,24],[1700,170,60],[1900,150,50],[2100,176,60]].forEach(([a,b,w])=>plat(a,b,w));
    item(1910,140,'note',{id:'media'});item(1712,160,'mat',{m:'hide'});item(2110,166,'heal');item(1250,200,'mat',{m:'wax'});
    use(97,60,'ไหว้ครู',()=>{rest('ไหว้ครูก่อนขึ้นเวทีครั้งสำคัญ');P.pose='wai'});
    cp(1300,'flag','ทางเดินหลังเวที');
    LV.lights=[{x:660,y:120,r:60},{x:1100,y:120,r:50}];
  },
  async run(){
    LV.dark=.5;sceneStart(300);
    await talk([['sys','คืนก่อนงานแสดงปลายเทอม ห้อง 512 ปิดไฟ เพื่อนทุกคนกลับมาซ้อมครบแล้ว ยกเว้นมาเตโอ'],['luwa','ไฟในห้องดับหมด แต่มีเสียงสะอื้นใต้โต๊ะยาว'],
      ['gold','ดีใจที่เธอมาคนเดียว '+(SAVE.name||'สมาชิกใหม่')],['gold',myReason().lie]]);
    const i=await choose('เสียงทองพูดถึงเหตุผลที่เธอเล่นดนตรี จะตอบว่าอะไร',['มีหลักฐานไหม? ฉันจะถามเพื่อนกับครูก่อน','…จริงเหรอ งั้นฉันไม่ไปแล้ว']);
    if(i===0){unity(3);await talk([['me','มีหลักฐานไหม? ฉันจะถามเพื่อนกับครูก่อน'],['pian','เยี่ยม! ถามหาหลักฐาน แล้วเล่าให้คนที่ไว้ใจฟัง คำลวงอยู่ไม่ได้หรอก']])}
    else{unity(-4);await talk([['me','…จริงเหรอ งั้นฉันไม่ไปแล้ว'],['foo','เดี๋ยวก่อน! นึกถึงบอร์ดของครูสิ ไม่มีเหตุผลไหนดีกว่ากัน'],['me','…จริงด้วย ขอโทษนะ ฉันเกือบเชื่อมันแล้ว']])}
    sceneEnd();
    trig(300,()=>[['echo',500],['walk',620],['float',900],['shout',1000,GY]].forEach(([k,x,y])=>enemy(k,x,y,{yb:GY-15})));
    await reach(820);sceneStart(820);LV.dark=.35;const mt=actor('mateo',880,-1,{pose:'idle'});
    await talk([['mateo','ผมตัวเล็กที่สุดในวง ไม่มีใครเห็นผมหรอก'],['mateo','เสียงทองบอกว่าวงไม่มีที่ให้ผม'],['maha','มาเตโอเป็นคนตีฆ้องวงใหญ่คู่กับผมมาตลอด ไม่มีมาเตโอ วงก็ไม่ครบ'],
      ['me','บอร์ดของครูยังมีกระดาษของมาเตโอแปะอยู่เลย “อยากมีเพื่อน” ตอนนี้มีครบทั้งวงแล้วนะ'],['mateo','…จริงเหรอครับ'],['pian','มาเตโอตัวเล็ก มุดผ่านช่องแคบได้ ใช้ทางลอดใต้เวทีไปหอประชุมกัน!']]);
    mt.vis=0;if(!TEAM.includes('mateo'))TEAM.push('mateo');sceneEnd();
    say('ช่องใต้เวทีสูงไม่พอ ต้องสลับเป็นมาเตโอถึงจะมุดผ่านได้ ('+(isTouch()?'⇄':'Q')+')',1);
    trig(1300,()=>{LV.dark=0;[['walk',1700],['shield',1850],['phone',2000],['dash',2150]].forEach(([k,x])=>enemy(k,x,GY,{yb:GY-25}))});
    await reach(2300);
    await talk([['sys','หอประชุม เวทีงานแสดงปลายเทอม จอใหญ่บนเวทีสว่างขึ้นเอง'],['gold','ในที่สุดก็มากันครบ… ดีเลย ฉันจะแยกพวกเธอทั้งหมดในคืนนี้']]);
    await bossFight({name:'ท่านเสียงทอง',sub:'จอใหญ่และลำโพงบนเวที',x:2700,arena:[2300,LV.w],hp:280,look:'tower',w:70,h:120,move:'still',words:['เก่งทันที!','ไม่มีใครเห็นค่าเธอ!','อย่าบอกครู!','เหนือคนอื่น!','เลือกข้างสิ!'],acts:['shoot','summon','rain','slam','hearts','clone'],every:3,minion:'phone',say:'คืนนี้วงของเธอจะแตก!',
      lineB:[['pian','เสียงทองสั่นแล้ว! ถึงเวลาพิสูจน์ว่าเสียงนี้ไม่ใช่พลังวิเศษ'],['waen','ถ้าเป็นเสียงตัดต่อ ต้องมีรอยต่อให้เห็น ช่วยกันหา!']],decode:{title:'พิสูจน์เสียงทอง',q:'ทั้งสองคลิปคือ “ท่านเสียงทอง” คลิปไหนเป็นเสียงที่ตัดต่อมา',kinds:['noise','gap','pitch']},
      preC:async b=>{await talk([['sys','จอใหญ่กะพริบ แล้วขึ้นหน้าเพจขาย “คอร์สลัดเก่งทันที”'],['waen','เสียงทองคือคลิปที่ตัดเสียงหลายคนมาต่อกัน เพื่อขายคอร์สให้เด็ก ๆ'],['tang','(ครูตังค์เดินขึ้นเวที) ครูแจ้งโรงเรียนกับผู้ปกครองแล้ว และรายงานเพจนี้ไปแล้วครับ'],['tang','ไม่มีพลังวิเศษอะไรเลย มีแต่คนที่อยากได้เงินจากความกลัวของเรา']])},
      lineC:[['tang','ทีนี้ มาเล่นให้ทุกคนฟังกันเถอะ ทั้งวง'],['pian','เจ็ดเสียงกลับมาครบแล้ว!']],
      jam:{who:['me','maha','che','jao','foo','waen','yum','captain','kaimuk','luwa','pob','mateo'],inst:['khong','ranad','klong'],pattern:PAT_C,bars:3,title:'เจ็ดเสียงบรรเลงพร้อมกัน'}});
    voiceBack(7,['mateo'],this.inst);await waitS(2);
    return 'ending'}};

/* ====================================================================
   ตอนจบ
   ==================================================================== */
async function ending(){
  LV=newLevel(1240);const [c,x]=mk(LV.w,H);drawRoom512(x,seeded(3),0);LV.L.world=c;LV.L.sky=skyCanvas([[0,'#7fb6e6'],[1,'#eef6fb']],'rgba(255,255,255,.8)',0,9);LV.floor=floorMaker([{x0:0,x1:ROOM_END,k:'room'}]);
  P=newPlayer(640);P.hide=1;cam=400;mode='cut';LV.camFocus=700;
  const cast=[['tang',740,-1],['maha',560,1],['mateo',590,1],['che',620,1],['jao',500,1],['foo',470,1],['waen',440,1],['yum',410,1],['captain',650,1],['kaimuk',800,-1],['ing',824,-1],['ice',848,-1],['luwa',880,-1],['pob',910,-1],['me',680,1]];
  cast.forEach(([id,xx,f])=>actor(id,xx,f));
  await fade(0,.8);
  const tot=Object.values(SAVE.stars).reduce((a,b)=>a+b,0);
  await talk([['sys','วันงานแสดงปลายเทอม หอประชุมเต็มไปด้วยผู้ปกครอง เพื่อน และชาวบ้านจากแม่โกนเกนและตลาดริมเมย'],['captain','(พิธีกร) ขอเชิญชมการแสดงของชมรมดนตรีไทยสรรพวาทิตครับ!'],
    ['sys','พบธรรมเป่าปี่แนนำเข้าเวที ตามด้วยฆ้อง ระนาด ขลุ่ย ซอ กลอง และเสียงร้อง พี่ดาวิกับลุงหม่องขึ้นมาเล่นร่วมด้วยตอนท้าย'],
    ['sys','หลังการแสดง ห้อง 512 กระดาษ “ฉันเล่นดนตรีเพื่อ…” กลับมาครบบนบอร์ด'],['tang','ครูไม่มีพลังวิเศษให้ใคร ครูมีแค่เวลาซ้อมกับพวกเธอทุกวัน'],
    ['tang','ทุกคนเล่นดนตรีด้วยเหตุผลไม่เหมือนกัน และนั่นคือเหตุผลที่วงเราเสียงครบ'],['pian','เจ็ดเสียงที่หายไปกลับมาครบแล้ว ถ้ามีเสียงแปลก ๆ มาอีก จำไว้นะ: ใครพูด มีหลักฐานไหม แล้วเล่าให้เพื่อนฟัง'],
    ['sys','ดาวคุณธรรมที่ได้ '+tot+' ดวง · ความสามัคคีของวง '+(SAVE.unity||0)+'/100'+(SAVE.unity>=60?' — วงแน่นแฟ้นมาก ทั้งชุมชนมาร่วมฟัง':'')]]);
  SAVE.fin=1;SAVE.done[7]=1;store();
}
