/* ====================================================================
   ตำนานสรรพวาทิต ภาค เจ็ดเสียงที่หายไปในแม่สอด — เนื้อเรื่องและด่าน (stages.js)
   ปมเปิด: จ้าวกับไอซ์เล่นซนตอนซ้อมเช้า เผลอตี “กลองอาถรรพ์” ของครูโอ เสียงระเบิดตูม
   เสียงเครื่องดนตรีทั้งวงกระจายไปทั่วแม่สอดและแม่ระมาด กลายเป็น “เงาเพี้ยน” ตัวตลก ๆ
   มุกประจำเรื่อง: ครูโอพยายามชวนครูตังค์ไปงานเลี้ยงทุกฉาก ผู้เล่นช่วยครูตังค์หลบให้รอดเพราะต้องซ้อมกับเด็ก ๆ
   ตัวร้ายหลอกลวงมีฉากเดียว (ฉาก 7: ท่านเสียงทอง) บทเรียนขมวดทีเดียวตอนสรุปท้ายเรื่อง
   ตัวละครเป็นการสมมุติจากคาแรกเตอร์ในเกม ไม่อิงพฤติกรรมของคนจริง
   ==================================================================== */
'use strict';
const NOTES={
  ching:{t:'ฉิ่งกำกับจังหวะของวง เสียง “ฉิ่ง” คือจังหวะเบา เสียง “ฉับ” คือจังหวะหนัก ทั้งวงยึดฉิ่งเป็นหลัก'},
  waikhru:{t:'นักดนตรีไทยไหว้ครูก่อนเล่น และไม่ข้ามหรือเหยียบเครื่องดนตรี เพราะถือว่าเครื่องดนตรีเป็นสิ่งที่ควรเคารพ'},
  nathap:{t:'หน้าทับคือแบบแผนการตีกลองที่ใช้กำกับจังหวะ เช่น หน้าทับปรบไก่ หน้าทับสองไม้'},
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
  media:{t:'ก่อนเชื่อคลิปเสียงหรือข้อความ ให้ถามว่า ใครพูด มีหลักฐานไหม เร่งให้รีบตัดสินใจหรือเปล่า แล้วเล่าให้คนที่ไว้ใจฟัง'}};
const REASONS=[
  {id:'relax',n:'ผ่อนคลาย',d:'เรียนมาทั้งวัน ได้เล่นดนตรีแล้วหายเหนื่อย',lie:'เล่นเพื่อผ่อนคลายน่ะ ไม่ต้องซ้อมหรอก กดเปิดเสียงข้าก็พอ'},
  {id:'love',n:'รักดนตรี',d:'ชอบเสียงดนตรีไทย อยากเล่นให้เก่งขึ้นเรื่อย ๆ',lie:'รักดนตรีแค่ไหนก็ไม่เก่งเท่าคนที่ซื้อพลังวิเศษจากข้า'},
  {id:'career',n:'อยากเป็นครูหรือนักดนตรี',d:'อยากเอาดนตรีไปเป็นอาชีพในอนาคต',lie:'อยากเป็นนักดนตรีเหรอ ไม่ต้องเรียน ไม่ต้องซ้อม ซื้อเสียงสำเร็จรูปของข้าสิ'},
  {id:'friends',n:'อยากมีเพื่อน',d:'อยากมีกลุ่มเพื่อนที่ทำอะไรด้วยกัน',lie:'มีพลังวิเศษจากข้า เจ้าจะอยู่เหนือทุกคนในวง ไม่ต้องง้อเพื่อนอีกต่อไป'}];
const myReason=()=>REASONS.find(r=>r.id===SAVE.reason)||REASONS[1];
const STAGES={};

/* ====================================================================
   ตัวช่วยร่วม
   ==================================================================== */
function sceneStart(focus){mode='cut';P.frozen=1;if(focus!=null)LV.camFocus=focus}
function sceneEnd(){LV.camFocus=null;P.frozen=0;mode='play'}
function voiceBack(n,who,inst){SAVE.pool=Array.from(new Set((SAVE.pool||[]).concat(who)));store();banner('เสียงที่ '+n+' กลับมาแล้ว!',(who.length?who.map(nameOf).join(' · ')+' — ':'')+inst,3);sfx(t=>{[10,12,14,15,17].forEach((k,i)=>TS2.ranadKey(k,t+i*.1,.6))})}
function qset(id,t){const q=LV.q.find(q=>q.id===id);if(q)q.t=t}
function learn(id){if(!SAVE.notes.includes(id)){SAVE.notes.push(id);store()}(ST.noteList=ST.noteList||[]).push(id)}
/* ม่านพลังปิดทางจนกว่าเควสหลักจะครบ */
function gate(x,cond,msg){const w=wall(x,0,16,GY,'gate',{draw:(q,c)=>{if(q.off)return;const xx=q.x-c;for(let i=0;i<6;i++){g.fillStyle='rgba(198,155,255,'+(.2+.12*Math.sin(T*4+i))+')';g.fillRect(xx+i*3,0,2,GY)}}});
  let told=0;LV.tickers=(LV.tickers||[]).concat([()=>{if(w.off)return;if(cond()){w.off=1;sparks(x,GY-40,20,1);say('ทางเปิดแล้ว! ไปต่อกันเลย',1);return}if(Math.abs(P.x-x)<26&&!told&&mode==='play'){told=1;say(msg,1);setTimeout(()=>told=0,4000)}}]);return w}
/* บอส: เงาเพี้ยนตัวใหญ่ยืนบนฉาก แล้วเข้าหน้าจอประลองเสียงด้วยเครื่องดนตรีจริง */
function drawBoss(b,c){const sx=b.x-c;if(sx<-140||sx>W+140)return;g.save();if(b.hit>0)g.globalAlpha=.6+.4*Math.sin(T*60);if(b.dead)g.globalAlpha=Math.max(0,1-(T-b.deadT)*1.2);
  if(b.look==='tower'){const cy=b.y-60;R(g,'#2a1a10',sx-34,cy-60,68,120);R(g,'#4a3020',sx-30,cy-56,60,112);for(let i=0;i<3;i++){disc(g,'#14100c',sx,cy-34+i*34,13);disc(g,'#c89a3a',sx,cy-34+i*34,9+Math.sin(T*9+i)*1.5);disc(g,'#3a2a14',sx,cy-34+i*34,3)}
    for(let i=0;i<16;i++){const h=(Math.sin(T*8+i)*.5+.5)*30+6;R(g,'#f2c14e',sx-46+i*6,cy-90-h/2,3,h)}drawShade(sx,cy-108,1.6,b.face,b.t,{crown:1})}
  else{const k=b.kind||'walk',n=b.heads||1,mid=Math.floor(n/2);for(let i=0;i<n;i++){const ox=(i-(n-1)/2)*44*(b.sc/3),main=i===mid;drawPhian(sx+ox,b.y-50,b.sc*(main?1:.75),b.face,b.t+i*.7,{kind:k,x:b.x+ox,y:main?b.y:b.y-8})}
    if(b.zzz){g.font='600 13px '+FONT;g.fillStyle='#ffffff';g.fillText('z',sx+30,b.y-100-((T*20)%20));g.fillText('Z',sx+42,b.y-118-((T*14)%20))}}
  g.restore()}
async function battleFight(o){
  LV.camLock=o.arena;LV.room='main';P.x=Math.max(o.arena[0]+30,o.x-240);P.y=GY;P.vy=0;P.vx=0;P.face=1;const mid=(P.x+o.x)/2;
  const b={boss:1,name:o.name,x:o.x,y:GY,w:80,h:110,hp:1,max:1,t:0,hit:0,vuln:0,face:-1,sc:o.sc||3,kind:o.kind,heads:o.heads,look:o.look,zzz:o.zzz,bar:0,touch:0,draw:drawBoss};
  LV.boss=b;LV.en.forEach(e=>{if(!e.dead)kill(e)});banner(o.name,o.sub||'',2.2);sfx(t=>{TS.khong(0,t,.6);TS2.that(1,t+.05,.7)});
  sceneStart(mid);await waitS(.8);if(o.lineA)await talk(o.lineA);sceneEnd();LV.camFocus=mid;
  let win=false;while(!win){win=await instBattle({name:o.name,insts:o.insts,hp:o.hp||90,phr:o.phr||[3,5],show:o.show!=null?o.show:2,gap:o.gap||.5,atk:o.atk||6,bpm:o.bpm||STAGE.bpm});if(!win)await talk([['pian','ไม่เป็นไร พักหายใจแล้วลองใหม่!']])}
  b.dead=1;b.deadT=T;for(let i=0;i<70;i++)LV.fx.push({x:b.x+rnd(-50,50),y:b.y-rnd(0,b.h),vx:rnd(-80,80),vy:rnd(-160,-20),g:140,t:0,life:rnd(.8,1.6),c:pick(['#ff8ab0','#9fe0ff','#ffe08a','#b8f0a0','#c69bff']),s:2});
  sfx(t=>{TS.khong(7,t,.7);TS2.ranadKey(21,t+.1,.6)});await waitS(1.2);LV.boss=null;LV.camFocus=null;LV.camLock=o.keepLock?o.arena:null;P.hp=maxHP()}
/* ครูโอนั่งปิกนิกบนเสื่อ */
const kruoMat=(a,xx)=>{R(g,'#3a7ad8',xx-36,GY-3,72,3);for(let i=0;i<72;i+=9)R(g,'#ffffff',xx-36+i,GY-3,4,3);R(g,'#e8d8b0',xx-26,GY-10,12,7);R(g,'#c87a3a',xx-24,GY-9,8,3);R(g,'#e8b830',xx+18,GY-14,6,11);R(g,'#ffffff',xx+19,GY-15,4,1);drawSprite(g,setOf('kruo'),'idle',Math.floor(T*1.5)%2,xx,a.y,a.face)};

/* ====================================================================
   ฉาก 1 · ห้อง 512 ตูมสนั่น — เสียงฆ้องวงเล็ก ระนาดทุ้ม ซอด้วง (ฟู แว่น จักร)
   ==================================================================== */
STAGES[1]={id:1,name:'ห้อง 512 ตูมสนั่น',sub:'ห้องดนตรีไทยและลานหน้าอาคาร 5',who:['foo','waen','yum'],inst:'ฆ้องวงเล็ก ระนาดทุ้ม ซอด้วง',bpm:104,w:4520,start:300,team:['me','jao','ice'],
  music(k,t){const P5=[10,11,12,14,15,17,18,19];if(k%8===3)TS2.thon(2,t,.2,MUS);if(k%8===7)TS2.thon(2,t,.22,MUS);if(k%2===1&&Math.random()<.7){this.mi=clamp((this.mi||3)+pick([-1,-1,0,1,1,2,-2]),0,7);TS2.ranadKey(P5[this.mi],t,.12,MUS)}},
  build(){LV.mainW=2960;
    const [c,x]=mk(LV.w,H),r=seeded(3);drawRoom512(x,r,0);
    drawCourtyard(x,r,ROOM_END,3100,{trees:[[1330,62],[1560,52],[1990,58],[2390,50]],stoneT:[1380,1630,1880],cooler:[1741],planter:[[2060,150]],pole:2800});
    R(x,'#c8c8c8',1470,30,4,200);[['#d02a2a',0],['#ffffff',4],['#1e3a8a',8],['#ffffff',16],['#d02a2a',20]].forEach(([col,o])=>R(x,col,1474,34+o,30,o===8?8:4));R(x,'#9a9a9a',1462,224,20,6);
    R(x,'#3a7a3a',2004,206,16,24);R(x,'#2a5a2a',2002,204,20,4);
    [[1290,'#3a6aa8'],[2470,'#c84a2a']].forEach(([dx,col])=>{R(x,'#e8e4dc',dx-24,120,48,110);R(x,'#5a3a24',dx-18,140,36,90);R(x,'#3a2418',dx-16,142,32,88);R(x,col,dx-24,112,48,10);R(x,'#c8a060',dx+8,184,4,4)});
    drawCanteen(x,3100,3760);drawLibrary(x,3860,4520);
    LV.L.world=c;LV.L.sky=skyCanvas([[0,'#7fb6e6'],[.6,'#cfe6f6'],[1,'#eef6fb']],'rgba(255,255,255,.85)',0,7);LV.L.far=courtFar();LV.L.fg=courtFG(ROOM_END);
    LV.floor=floorMaker([{x0:0,x1:ROOM_END,k:'room'},{x0:ROOM_END,x1:3100,k:'concrete'},{x0:3100,x1:3760,k:'tile'},{x0:3860,x1:4520,k:'board'}]);
    room('canteen',3100,3760);room('library',3860,4520);
    door(1290,'เข้าห้องสมุด',3910,'library');door(3890,'ออกไปลาน',1290,'main');door(2470,'เข้าโรงอาหาร',3150,'canteen');door(3125,'ออกไปลาน',2470,'main');
    [[148,196,60],[218,182,24],[1364,214,12],[1380,200,44],[1430,214,12],[1614,214,12],[1630,200,44],[1680,214,12],[1864,214,12],[1880,200,44],[1930,214,12],[2060,204,150],[2140,158,70],[2240,176,44],[1528,150,60],[1960,152,56]].forEach(([a,b,w])=>plat(a,b,w));
    // โรงอาหาร: เคาน์เตอร์ โต๊ะ ลังน้ำ ตู้เย็นสูง (ขึ้นตู้เย็นได้เฉพาะไอซ์ที่กระโดดสูง)
    plat(3140,170,180,{noDraw:1});[3360,3470].forEach(tx=>plat(tx,196,70,{noDraw:1}));
    plat(3616,166,40,{draw:(q,c)=>{const xx=q.x-c;for(let i=0;i<2;i++){R(g,'#3a7ad8',xx,q.y+i*32,40,30);R(g,'#5a9af0',xx+2,q.y+i*32+2,36,4);R(g,'#ffffff',xx+14,q.y+i*32+12,12,6)}}});
    plat(3670,96,46,{noDraw:1});
    // ห้องสมุด: ชั้นหนังสือปีนได้
    for(let sx=3880;sx<4480;sx+=90)for(let s=0;s<5;s++)plat(sx,78+s*34,70,{noDraw:1});
    wall(2296,150,10,80,'fence');plat(2296,150,10);item(2301,138,'note',{id:'nathap'});
    item(178,186,'mat',{m:'wood'});item(2134,148,'mat',{m:'bamboo'});item(1558,140,'note',{id:'ching'});item(1652,190,'lost',{n:'กระติกน้ำของน้อง',col:'#3aa8d8'});item(2400,200,'heal');item(3420,180,'mat',{m:'string'});item(4100,96,'note',{id:'teacher'});
    cp(1741,'cooler','ตู้น้ำดื่ม');
    const orb=(x,y,n,col)=>item(x,y,'orb',{n,col,on:()=>{LV.orbs=(LV.orbs||0)+1;qset('orbs','ตามเก็บลูกเสียงในโรงเรียน ('+LV.orbs+'/3)');if(LV.orbs>=3)qdone('orbs')}});
    orb(2175,140,'เสียงฆ้องวงเล็กของฟู!','#ffd86a');orb(3693,78,'เสียงซอด้วงของจักร!','#ff9ab0');orb(4275,60,'เสียงระนาดทุ้มของแว่น!','#9fe0ff');
    gate(2560,()=>qis('orbs'),'ต้องเก็บลูกเสียงให้ครบ 3 ลูกก่อน! ลองเข้าห้องสมุดกับโรงอาหารดูนะ');
    use(97,60,'ไหว้ครู',()=>{rest('ไหว้ครูก่อนเล่น ใจนิ่ง ตีแม่นขึ้น');P.pose='wai';learn('waikhru');star(6,'ไหว้ครูในห้อง 512')});
    use(283,60,'ตีระนาดเอก',()=>sfx(()=>{const b=nb();[10,11,12,14,15,17,18,19].forEach((k,i)=>TS2.ranadKey(k,b+i*BEAT/4,.7))}));
    use(660,120,'ตีฆ้องวงใหญ่',()=>sfx(()=>{const b=nb();[3,4,5,7,5,4,3,0].forEach((k,i)=>TS.khong(k,b+i*BEAT/2,.75))}));
    use(1114,72,'สีซอด้วง',()=>say('ซอไม่มีเสียงเลย! เสียงซอหลุดไปกับระเบิดเมื่อเช้า',1));
    use(2012,30,'เก็บขยะใส่ถัง',u=>{u.off=1;star(7,'เก็บขยะในลานโรงเรียน');pop(P.x,P.y-50,'ลานสะอาดแล้ว!','#9ff0c0')});
    const foo=actor('foo',2100,-1,{lookP:1,mark:()=>qis('orbs')?'':'!'});foo.talk=()=>talk(qis('orbs')?[['foo','ฆ้องฉันมีเสียงแล้ว! ไปจัดการเจ้าตัวที่หอกระจายข่าวกัน']]:[['foo','ตีฆ้องวงเล็กแล้วเงียบกริบ… เหมือนตีหมอน'],['foo','เมื่อกี้เห็นแสงสีทองลอยไปติดกิ่งไม้ใหญ่ข้างหลังฉันนั่นแน่ะ'],['foo','ส่วนอีกสองแสงลอยเข้าห้องสมุดกับโรงอาหาร']]);
    const waen=actor('waen',4020,1,{lookP:1});waen.talk=()=>talk([['waen','ห้องสมุดต้องเงียบ… แต่ระนาดทุ้มฉันเงียบเกินไปแล้ว'],['waen','ฉันคำนวณแล้ว ลูกเสียงลอยไปอยู่บนชั้นหนังสือสูงสุด ปีนชั้นขึ้นไปได้เลย แต่ห้ามวิ่งนะ บรรณารักษ์ดุ']]);
    const yum=actor('yum',3430,1,{lookP:1,mark:()=>ST.rice===2?'':'!'});yum.talk=()=>{if(ST.rice===1){ST.rice=2;talk([['yum','ข้าวมันไก่! พี่คือฮีโร่ของผม'],['yum','อิ่มแล้วสมองแล่น ลูกเสียงซอของผมลอยขึ้นไปอยู่บนตู้เย็นนั่น! ไอซ์กระโดดสูงได้นะ ขึ้นลังน้ำก่อนแล้วค่อยโดด']]).then(()=>{qdone('rice');star(7,'หาข้าวให้เพื่อนที่หิว')})}
      else if(!ST.rice)talk([['yum','ผมหิวจนสีซอไม่ไหว… ซอก็ไม่มีเสียงอยู่ดี'],['yum','ช่วยไปขอข้าวมันไก่จากป้าแม่ครัวให้หน่อยได้ไหมครับ']]).then(()=>quest('rice','เอาข้าวมันไก่จากป้าแม่ครัวให้จักร'));else talk([['yum','อร่อยมาก ขอบคุณครับ ตู้เย็นอยู่ทางขวานะ']])};
    const cook=actor('vendor',3240,1,{lookP:1,mark:()=>qhas('rice')&&!ST.rice?'!':''});cook.talk=()=>{if(qhas('rice')&&!ST.rice){ST.rice=1;talk([['vendor','ข้าวมันไก่ให้จักรอีกแล้วเหรอ เอาไปจานนึง ฝากบอกให้กินผักด้วย']])}else talk([['vendor','เมื่อเช้าได้ยินเสียงตูมดังมาจากห้องดนตรี ป้าทำทัพพีหล่นเลย']])};
    const kid=actor('kid',1772,-1,{lookP:1,mark:()=>ST.lost&&!ST.lost.back?'!':''});kid.talk=()=>{if(ST.lost&&!ST.lost.back){ST.lost.back=1;talk([['kid','กระติกน้ำของผม! ขอบคุณครับพี่']]).then(()=>{star(1,'คืนของที่เก็บได้');quest('bottle','หากระติกน้ำสีฟ้าให้น้อง');qdone('bottle')})}else talk([['kid','พี่เห็นกระติกน้ำสีฟ้าของผมไหมครับ ลืมไว้แถวม้าหิน']]).then(()=>quest('bottle','หากระติกน้ำสีฟ้าให้น้อง'))};
    LV.drumHit=0;
    LV.drawMid=c=>{drawOldDrum(g,500-c,GY,!LV.drumHit)};
    LV.tick=dt=>{(LV.tickers||[]).forEach(f=>f())};
  },
  async run(){
    sceneStart(520);P.hide=1;SAVE.pool=Array.from(new Set((SAVE.pool||[]).concat(['jao','ice'])));store();
    const jao=actor('jao',420,1),ice=actor('ice',610,-1),tang=actor('tang',230,1,{vis:0}),cast=[['maha',330,1],['che',372,1],['foo',700,-1],['waen',730,-1],['yum',760,-1],['kaimuk',800,-1],['pob',860,-1],['luwa',890,-1]].map(([id,xx,f])=>actor(id,xx,f));
    const me=actor('me',300,1);
    await waitS(.4);
    await talk([['sys','เช้าวันจันทร์ ซ้อมเช้าที่ห้อง 512 อีกสองสัปดาห์จะถึงงานแสดงปลายเทอม'],['ice','จ้าว! พนันกันไหม ใครเล่นได้ดังกว่ากัน!'],['jao','ได้เลย ขลุ่ยผมดังทะลุอาคาร 5!'],
      ['maha','สองคนนั้นอีกแล้ว…'],['ice','ฉันกระโดดได้สูงกว่าด้วย ดูนะ!']]);
    walk(ice,500,140);await walk(jao,486,120);
    await talk([['foo','ระวัง! นั่นกลองที่ครูโอฝากไว้ มีป้าย “ห้ามตีก่อนไหว้”!'],['jao','อุ๊ย… ศอกผม—']]);
    LV.drumHit=1;shake=.8;LV.flash={t:T};sfx(t=>{TS2.klong(0,t,1);TS2.that(0,t,1);TS.khong(0,t+.05,.8);TS2.klmong(t+.1,.8)});
    for(let i=0;i<7;i++){const col=['#ffd86a','#9fe0ff','#ff9ab0','#b8f0a0','#c69bff','#ffb070','#ffffff'][i];for(let k=0;k<10;k++)LV.fx.push({x:540,y:GY-30,vx:rnd(-260,260),vy:rnd(-320,-120),g:120,t:0,life:2.2,c:col,s:3})}
    await waitS(1.4);
    await talk([['sys','ตู้ม!!! เสียงดังสนั่นจนกระจกหน้าต่างสั่น แสงเจ็ดสีพุ่งออกนอกหน้าต่างไปคนละทิศ'],['foo','ฆ้องฉันตีแล้วเงียบ!'],['waen','ระนาดทุ้มก็เงียบ… นี่มันผิดหลักฟิสิกส์'],['yum','ซอผมก็… แล้วก็หิวด้วย'],
      ['pian','ฮัลโหล! เพี้ยนน้อยเอง! ฉันเห็นจากในมือถือ เสียงเครื่องดนตรีทั้งวงกระจายไปทั่วแม่สอดกับแม่ระมาดเลย!'],['pian','บางเสียงไปผสมกับเสียงเพี้ยน ๆ แถวนั้น กลายเป็น “เงาเพี้ยน” ตัวป่วน ๆ']]);
    tang.vis=1;await walk(tang,350,90);
    await talk([['tang','เกิดอะไรขึ้นครับ… ทำไมเสียงดังถึงห้องพักครู'],['jao','ผมขอโทษครับครู ผมกับไอซ์เล่นกันแรงไป'],['ice','ขอโทษค่ะ… เราจะตามเอาเสียงกลับมาเองค่ะ'],
      ['tang','ดีมาก ยอมรับแล้วช่วยกันแก้ ใช้ได้'],['tang','อีกสองสัปดาห์งานแสดง เสียงต้องกลับมาครบ เริ่มจากในโรงเรียนก่อน สมาชิกใหม่ไปช่วยจ้าวกับไอซ์นะ']]);
    await talk([['sys','โทรศัพท์ครูตังค์ดังขึ้น หน้าจอขึ้นชื่อ “ครูโอ”'],['kruo','(เสียงในโทรศัพท์) ตังค์! เย็นนี้ว่างไหม ร้านหมูกระทะเจ้าประจำมีโปรฯ ชุดใหญ่ น้ำสีอำพันเย็นเจี๊ยบรอแล้ว!'],
      ['tang','วันนี้มีซ้อมครับครูโอ…'],['kruo','อ้อ แล้วกลองหลวงที่ฉันฝากไว้ ยังสบายดีใช่ไหม'],['tang','…สบายดีครับ ตอนนี้กลองกำลัง… พักผ่อนครับ'],
      ['pian','(กระซิบ) ภารกิจลับ: เอาเสียงกลับมาให้ครบ ก่อนครูโอรู้ว่ากลองแกถูกตี!']]);
    await fade(1,.4);cast.forEach(a=>a.vis=0);jao.vis=0;ice.vis=0;me.vis=0;tang.vis=0;P.x=320;P.hide=0;await fade(0,.4);sceneEnd();
    quest('orbs','ตามเก็บลูกเสียงในโรงเรียน (0/3)',1);
    say(isTouch()?'◀ ▶ เดิน · ⤒ กระโดด · ตี · ⇄ สลับเพื่อน (จ้าวยิงขลุ่ย ไอซ์กระโดดสูง)':'← → เดิน · Space กระโดด · J ตี · Q สลับเพื่อน · E ใช้/คุย');
    trig(420,()=>say('ได้ยิน ฉิ่ง… ฉับ… ไหม? ตีตอน “ฉับ” แรงเป็นสองเท่า',1));
    trig(800,()=>say('เก็บโน้ตทองไว้ปรับเครื่องที่ร้านช่างบนแผนที่ได้ด้วย',1));
    trig(1200,()=>{say('มีเงาเพี้ยนเต็มลานเลย! ใครมีเครื่องหมาย “!” บนหัว แปลว่ามีเรื่องอยากให้ช่วย',1);[['walk',1500],['shout',1652,200],['walk',1820],['float',2010],['mini',2320],['shield',2440]].forEach(([k,xx,y])=>enemy(k,xx,y))});
    trig(1330,async()=>{const i=await choose('08:00 เพลงชาติดังจากลำโพงหน้าเสาธง',['หยุดยืนตรงเคารพธงชาติ','วิ่งต่อ ไม่มีเวลา']);if(i===0){P.pose='idle';star(0,'ยืนตรงเคารพธงชาติ')}else say('ไม่เป็นไร พรุ่งนี้ลองหยุดยืนตรงด้วยกันนะ',1)});
    trig(1900,async()=>{sceneStart(1980);const k=actor('kruo',2090,-1,{big:1});await waitS(.3);
      await talk([['kruo','อ้าว เด็ก ๆ สรรพวาทิต! เห็นครูตังค์ไหม ครูจะชวนไปกินข้าวเย็น'],['kruo','แล้วเมื่อเช้าเสียงตูมนั่นมาจากไหนกันนะ ฟังคุ้น ๆ เหมือนกลองหลวงบ้านเกิดครูเลย']]);
      const i=await choose('ครูโอถามถึงเสียงตูม จะตอบว่าอะไร',['บอกความจริง: เพื่อนเผลอตีกลองของครูโอ','แกล้งทำเป็นไม่รู้']);
      if(i===0){await talk([['me','เพื่อนเผลอตีกลองของครูโอครับ ตอนนี้เรากำลังตามเสียงกลับมา'],['kruo','ฮ่า ๆ ๆ! กลองใบนั้นดังแบบนี้มาตั้งแต่สมัยปู่แล้ว'],['kruo','พูดความจริงแบบนี้ ครูชอบ! เสร็จงานแล้วไปช่วยครูพากลองกลับบ้านที่แม่จะเราด้วยนะ']]);star(1,'พูดความจริงกับครูโอ')}
      else await talk([['me','ไม่รู้เหมือนกันครับ…'],['kruo','งั้นเหรอ… (มองหน้าเด็ก ๆ แบบรู้ทัน) อืม ครูไปหาครูตังค์ก่อนละกัน'],['pian','(กระซิบ) คราวหน้าพูดความจริงเลยดีกว่านะ ครูโอดูออก']]);
      await walk(k,2330,90);k.vis=0;sceneEnd()});
    await until(()=>qis('orbs'));say('ครบสามลูก! ออกไปที่หอกระจายข่าวท้ายลาน เงาเพี้ยนตัวใหญ่รออยู่',1);
    await reach(2600);
    await battleFight({name:'เงาเพี้ยนสามหัว',sub:'ยึดหอกระจายข่าวไว้ตีเพลงเพี้ยน',x:2820,arena:[2320,2960],sc:3,heads:3,kind:'walk',insts:['khong','thum','sor'],hp:90,
      lineA:[['pian','มันกินเสียงฆ้อง ระนาดทุ้ม กับซอไว้ในท้อง! ฟังมันตีแล้วตีตามให้ถูก'],['pian','ตาเราให้ตีตอนวงแหวนหดแตะแป้น ยิ่งตรงจังหวะยิ่งแรง!']]});
    sceneStart(2760);actor('foo',2640,1);actor('waen',2670,1);actor('yum',2700,1);actor('tang',2600,1);
    await talk([['foo','ฆ้องฉันมีเสียงแล้ว! ปิ๊งป่อง ๆ'],['waen','ระนาดทุ้มก็กลับมา วิเคราะห์แล้วอารมณ์ดีขึ้น 87 เปอร์เซ็นต์'],['yum','ซอผมก็กลับมา… หิวอีกแล้ว'],
      ['tang','เก่งมาก เห็นไหม ไม่มีใครทำคนเดียวได้ ต้องช่วยกันทั้งนั้น'],['pian','เสียงที่เหลือกระจายไปห้าที่! อุโมงค์ไผ่ น้ำตกธารารักษ์ บ่อน้ำร้อนแม่กาษา ตลาดริมเมย และแม่จะเราที่แม่ระมาด'],['pian','จะไปที่ไหนก่อนก็ได้ เลือกบนแผนที่เลย!']]);
    voiceBack(1,['foo','waen','yum'],this.inst);await waitS(2.5);sceneEnd()}};

/* ====================================================================
   ฉาก 2 · อุโมงค์ไผ่ทิวไผ่งาม — ขลุ่ยเลาแรกของจ้าว
   ==================================================================== */
STAGES[2]={id:2,name:'ขลุ่ยเลาแรกของจ้าว',sub:'อุโมงค์ไผ่ทิวไผ่งาม ต.แม่กาษา',who:[],inst:'เสียงขลุ่ยของจ้าว',bpm:96,w:3100,start:60,
  music(k,t){const F=[523,587,659,784,880];if(k%2===0&&Math.random()<.6){this.mi=clamp((this.mi||2)+pick([-1,0,1,1,-1]),0,4);TS2.khlui(F[this.mi],t,BEAT*.9,.16,MUS)}if(k%8===0)TS2.thon(2,t,.18,MUS)},
  build(){artBamboo();LV.enCol={walk:'#6ab04a',float:'#3ab8a8',mini:'#a8d84a',dash:'#4a9a5a',shield:'#8ab04a',shout:'#c8d84a'};
    LV.floor=floorMaker([{x0:0,x1:LV.w,k:'dirt',leaf:1}]);
    gap(640,90,'water');gap(1460,120,'water');gap(2210,100,'water');
    [[650,200,40,{ay:10,sp:2}],[1470,196,44,{ay:14,sp:2.2}],[1530,186,40,{ay:12,sp:2.4,ph:1}],[2222,198,40,{ax:24,sp:1.6}]].forEach(([a,b,w,m])=>plat(a,b,w,{mv:Object.assign({x0:a,y0:b},m),draw:(q,c)=>{R(g,'#9ac85a',q.x-c,q.y,q.w,3);for(let i=0;i<q.w;i+=6)R(g,'#6a9a3a',q.x-c+i,q.y,1,3);R(g,'#5a8a30',q.x-c+q.w/2,0,1,q.y)}}));
    const deck=(q,c)=>{R(g,'#c8a868',q.x-c,q.y,q.w,4);R(g,'#8a6a3a',q.x-c,q.y+4,q.w,2);R(g,'#7a5a2a',q.x-c+3,q.y+6,3,GY-q.y-6);R(g,'#7a5a2a',q.x-c+q.w-6,q.y+6,3,GY-q.y-6)};
    [[300,196,50],[900,190,60],[1100,170,40],[1180,140,40],[1250,110,40],[1800,190,70],[2000,170,50],[2480,196,60]].forEach(([a,b,w])=>plat(a,b,w,{draw:deck}));
    wall(1340,120,10,110,'fence');plat(1340,120,10);item(1345,108,'note',{id:'khlui'});
    item(2010,160,'mat',{m:'bamboo'});item(1830,180,'mat',{m:'string'});item(1700,200,'heal');
    cp(1360,'flag','ศาลาพักริมทาง');
    const bam=(x,y)=>item(x,y,'thing',{n:'ไม้ไผ่เนื้อดี!',icon:(G,xx,yy)=>{R(G,'#9ac85a',xx-2,yy-7,5,14);R(G,'#5a8a30',xx-2,yy-2,5,1);R(G,'#5a8a30',xx-2,yy+3,5,1)},on:()=>{LV.bam=(LV.bam||0)+1;qset('bamboo','หาไม้ไผ่เนื้อดีให้จ้าว ('+LV.bam+'/3)');if(LV.bam>=3)qdone('bamboo')}});
    bam(1270,98);bam(1552,168);bam(2244,184);
    LV.shelter=[[420,470],[1000,1050],[1700,1750],[2380,2430]];LV.windZones=[[340,1120],[1600,2200]];
    LV.windAt=x=>{if(!LV.windZones.some(z=>x>z[0]&&x<z[1])||LV.shelter.some(s=>x>s[0]&&x<s[1]))return 0;const b=beat(),k=Math.floor(b.x),fr=b.x-k;return (((k%2)+2)%2===1&&fr<.5)?-950:0};
    LV.tick=dt=>{(LV.tickers||[]).forEach(f=>f());const b=beat(),k=Math.floor(b.x),gusting=(((k%2)+2)%2===1&&b.x-k<.5&&LV.windZones.some(z=>P.x>z[0]-200&&P.x<z[1]));if(gusting&&Math.random()<.5)LV.fx.push({x:cam+W+5,y:rnd(40,GY),vx:-rnd(260,360),vy:rnd(-10,10),t:0,life:2,c:pick(['#9ac85a','#c8d870','#7aa848']),s:2})};
    LV.drawMid=c=>{LV.shelter.forEach(([a,b])=>{const x=a-c;for(let k=0;k<5;k++){R(g,['#5a8a30','#4a7a28','#6a9a3a'][k%3],x+k*10,60,5,GY-60);for(let y=70;y<GY;y+=24)R(g,'#3e6a28',x+k*10,y,5,1)}disc(g,'#3f7a34',x+25,64,26)});
      const hx=2560-c;R(g,'#7a5a2a',hx,150,4,80);R(g,'#7a5a2a',hx+76,150,4,80);R(g,'#a8885a',hx-6,170,92,6);g.fillStyle='#c8a060';g.beginPath();g.moveTo(hx-14,152);g.lineTo(hx+40,118);g.lineTo(hx+94,152);g.fill();if(LV.bbq)drawBBQ(g,1890-c,GY)};
    const farmer=actor('elder',2590,-1,{lookP:1,mark:()=>qis('bamboo')&&!qis('craft')?'!':''});
    farmer.talk=async()=>{if(qis('bamboo')&&!qis('craft')){await talk([['elder','ไม้ไผ่ดีจริง ๆ ปล้องยาว เนื้อแน่น ลุงช่วยเจาะรูให้'],['jao','ผมจะทำขลุ่ยเลาแรก ไว้สอนน้อง ๆ ครับ'],['elder','อยากเป็นครูต้องลองทำเองก่อน ดีแล้วหลาน']]);learn('teacher');qdone('craft');sfx(()=>{const b=nb();[523,587,659,784,659].forEach((f,i)=>TS2.khlui(f,b+i*BEAT/2,.3,.7))})}
      else talk([['elder','ไผ่ในอุโมงค์นี้ชาวบ้านปลูกไว้ใช้ซ่อมบ้านทำเครื่องมือ'],['elder','ถ้าได้ไม้ไผ่ดี ๆ มา ลุงช่วยเจาะรูขลุ่ยให้ได้นะ']])};
    use(1420,40,'ยกไม้ไผ่ที่ล้มขวาง',u=>{u.off=1;star(7,'ช่วยยกไม้ไผ่ที่ล้มขวางทาง');qdone('clear')});
    LV.drawFG=c=>{const u=LV.uses.find(u=>u.n==='ยกไม้ไผ่ที่ล้มขวาง');if(u&&!u.off){const x=u.x-c;limb(g,x-24,GY-2,x+26,GY-14,4,'#9ac85a');R(g,'#5a8a30',x-4,GY-9,2,4)}};
    gate(2700,()=>qis('craft'),'จ้าวยังไม่มีขลุ่ย! หาไม้ไผ่ 3 ท่อนแล้วไปหาลุงที่ห้างนาก่อน');
    LV.tick0=LV.tick;
  },
  async run(){
    sceneStart(300);const j=actor('jao',380,-1);
    await talk([['sys','อุโมงค์ไผ่ทิวไผ่งาม แนวไผ่โค้งเข้าหากันเป็นอุโมงค์ยาว'],['jao','เสียงขลุ่ยผมปลิวมาทางนี้… แต่ขลุ่ยเลาเก่าผมก็แตกไปตอนระเบิดด้วย'],['jao','ผมอยากเป็นครูดนตรี อยากทำขลุ่ยเลาใหม่ด้วยมือตัวเอง ไว้สอนน้อง ๆ'],
      ['pian','งั้นต้องหาไม้ไผ่เนื้อดี 3 ท่อน! ระวังลมแรงตอน “ฉับ” ด้วย หลบหลังกอไผ่ได้']]);
    j.vis=0;sceneEnd();quest('bamboo','หาไม้ไผ่เนื้อดีให้จ้าว (0/3)',1);
    trig(150,()=>[['walk',560],['float',820],['shout',910,190],['walk',1150]].forEach(([k,x,y])=>enemy(k,x,y)));
    trig(1330,()=>{quest('clear','ไม้ไผ่ล้มขวางทางเกวียน ช่วยยกออก');if(TEAM.includes('foo'))say('รั้วไม้ไผ่นี้ให้ฟูปีน: กดกระโดดค้างตอนยืนชิดรั้ว',1);else say('รั้วสูง… คนที่ปีนเก่ง ๆ อย่างฟูน่าจะขึ้นได้',1)});
    trig(1600,()=>[['dash',1760],['walk',1960],['float',2050],['mini',2300],['mini',2340],['shield',2520]].forEach(([k,x,y])=>enemy(k,x,y)));
    trig(1700,async()=>{quest('tang1','ช่วยครูตังค์ตอบครูโอ');sceneStart(1830);LV.bbq=1;const tg=actor('tang',1770,1),k=actor('kruo',1930,-1,{big:1});
      await talk([['sys','ครูตังค์ตามมาดูเด็ก ๆ … แล้วโทรศัพท์ก็ดังอีก'],['kruo','(วิ่งมาถือตะเกียบ) ตังค์! ด่วนมาก!! มาที่ห้างนาเดี๋ยวนี้เลย!'],['tang','มีอะไรครับครูโอ!'],['kruo','หมูกระทะสุกพอดี! ด่วนแค่ไหนคิดดู'],['pian','ช่วยครูตังค์หาข้ออ้างหน่อย!']]);
      const i=await choose('ช่วยครูตังค์ตอบครูโอ',['“ครูตังค์ต้องสอนพวกเราเป่าขลุ่ยครับ”','“ครูตังค์แพ้หมูครับ” (โกหก)','ให้จ้าวโชว์เป่าใบไม้ใส่ครูโอ']);
      if(i===1){await talk([['kruo','แพ้หมู? เมื่อวานยังเห็นกินหมูปิ้งสามไม้'],['tang','…ครูไม่แพ้หมูครับ ครูต้องอยู่กับเด็ก ๆ'],['pian','พูดความจริงตรง ๆ ง่ายกว่าเยอะเลย']]);qdone('tang1',10)}
      else if(i===2){await talk([['jao','ปี๊~ ปู๊~ (เป่าใบไม้เพี้ยนสุด ๆ)'],['kruo','ฮ่า ๆ ๆ ! โอ๊ย ปวดท้อง! ไป ๆ ไปทำขลุ่ยให้ดีกว่านี้ก่อน ครูโอปิ้งรอ!'],['tang','(กระซิบ) ขอบใจนะ']]);qdone('tang1',25)}
      else{await talk([['kruo','โอ้โห ขยันกันจริง ๆ งั้นครูโอปิ้งรอก่อน เหลือไว้ให้สามชิ้น!'],['tang','(กระซิบ) ขอบใจนะ']]);qdone('tang1',25)}
      walk(k,2100,90).then(()=>k.vis=0);tg.vis=0;sceneEnd()});
    trig(2380,()=>{if(!qhas('craft'))quest('craft','พาไม้ไผ่ไปให้ลุงที่ห้างนาช่วยทำขลุ่ย',1)});
    await until(()=>qis('bamboo'));if(!qhas('craft'))quest('craft','พาไม้ไผ่ไปให้ลุงที่ห้างนาช่วยทำขลุ่ย',1);
    await until(()=>qis('craft'));
    await reach(2760);
    await battleFight({name:'ยักษ์ลมหวน',sub:'กลืนเสียงขลุ่ยไว้ในท้อง ปั่นลมหวนกลางอุโมงค์',x:2960,arena:[2460,LV.w],sc:3.2,kind:'float',insts:['khlui','ching'],hp:90,
      lineA:[['jao','นั่นเสียงขลุ่ยผม! อยู่ในท้องมัน!'],['pian','ฟังทำนองขลุ่ยแล้วตีตาม จ้าวอยู่ในทีม ไฟจะช่วยมากขึ้น!']]});
    sceneStart(2860);actor('jao',2800,1);actor('tang',2760,1);sfx(()=>{const b=nb();[523,587,659,784,880,784,659].forEach((f,i)=>TS2.khlui(f,b+i*BEAT/2,.32,.7))});
    await talk([['jao','ขลุ่ยเลาใหม่มีเสียงแล้ว! เสียงหวานกว่าเลาเก่าอีก'],['tang','ทำเองกับมือ เป่าเองทุกวัน แบบนี้แหละทางของคนเป็นครู'],['jao','ผมจะซ้อมทุกเย็น แล้วสอนน้องที่ชมรมด้วยครับ']]);
    voiceBack(2,[],this.inst);await waitS(2.5);sceneEnd()}};

/* ====================================================================
   ฉาก 3 · น้ำตกธารารักษ์ ยามเย็นแสงทอง — เช่หลับริมน้ำ (ระนาดเอก)
   ==================================================================== */
const REAL=[10,11,12,14,15,14,12,11],FAKE=[10,13,11,16,9,13,8,16];
function phrase(keys,fake){sfx(()=>{const b=nb();keys.forEach((k,i)=>{const t=b+i*BEAT/2;TS2.ranadKey(k,t,fake?.45:.6);if(fake&&i%3===1)TS2.chab(1,t+.05,.2)})})}
STAGES[3]={id:3,name:'เช่หลับริมน้ำตก',sub:'น้ำตกธารารักษ์ ริมทางหลวง 1090',who:['che'],inst:'ระนาดเอก',bpm:92,w:4100,start:60,
  music(k,t){if(k%4===0)TS2.sorou(pick([229,257,289,344]),t,BEAT*1.8,.12,MUS);if(k%2===1&&Math.random()<.4)TS2.harp(pick([0,1,2,3,4]),t,.1,MUS)},
  build(){LV.mainW=3400;artForest();const x=LV.L.world.getContext('2d');caveMouth(x,180);LV.enCol={walk:'#d88a4a',float:'#e8b040',echo:'#f0c070',mini:'#ffa070',dash:'#e8704a',shield:'#c8a040',shout:'#f0a060'};
    // ห้องลับหลังต้นไทร
    x.fillStyle='#2a2a1a';x.fillRect(3400,0,700,H);for(let i=0;i<60;i++){x.fillStyle='rgba(255,224,120,'+(.1+Math.random()*.2)+')';x.beginPath();x.arc(3420+Math.random()*660,30+Math.random()*170,2+Math.random()*3,0,7);x.fill()}
    LV.floor=floorMaker([{x0:0,x1:3400,k:'dirt',c1:'#8a6a44',c2:'#6a5032',c3:'#a08058',leaf:1},{x0:3400,x1:4100,k:'rock'}]);
    gap(1900,260,'water');[[1905,200,46],[1975,186,40],[2040,196,46],[2105,184,44]].forEach(([a,b,w])=>plat(a,b,w,{draw:(q,c)=>{R(g,'#8a6a40',q.x-c,q.y,q.w,4);R(g,'#5a4426',q.x-c,q.y+4,q.w,2);R(g,'#4a3420',q.x-c+q.w/2-1,q.y+6,3,GY+6-q.y)}}));
    [[500,190,60],[760,176,50],[1300,186,60],[1380,150,40],[1450,116,40],[2500,190,50],[2600,170,44],[2680,140,40]].forEach(([a,b,w])=>plat(a,b,w,{draw:(q,c)=>{R(g,'#7a7468',q.x-c,q.y,q.w,6);R(g,'#9a9484',q.x-c,q.y,q.w,2)}}));
    wall(2760,206,24,24,'crate',{lim:[2700,2840]});
    item(770,166,'note',{id:'ranad'});item(1320,176,'mat',{m:'wood'});item(2120,174,'heal');item(2610,160,'note',{id:'listen'});item(2810,200,'mat',{m:'wax'});
    cp(180,'cave','ถ้ำสีฟ้า');cp(1700,'flag','ศาลาริมอ่าง');
    const key=(x,y)=>item(x,y,'thing',{n:'ลูกระนาด!',icon:(G,xx,yy)=>{R(G,'#5a3418',xx-6,yy-3,12,6);R(G,'#8a5a30',xx-6,yy-3,12,2);R(G,'#2a1a0a',xx-2,yy+3,4,2)},on:()=>{LV.keys=(LV.keys||0)+1;sfx(t=>TS2.ranadKey(9+LV.keys,t,.6));qset('keys','เก็บลูกระนาดของเช่ ('+LV.keys+'/7)');if(LV.keys>=7)qdone('keys')}});
    [[420,200],[790,160],[1150,200],[1470,100],[2060,180],[2420,200],[3900,200]].forEach(([a,b])=>key(a,b));
    item(1466,50,'thing',{n:'ว่าวของน้อง!',icon:(G,xx,yy)=>{G.fillStyle='#ff5a7a';G.beginPath();G.moveTo(xx,yy-8);G.lineTo(xx+6,yy);G.lineTo(xx,yy+8);G.lineTo(xx-6,yy);G.fill();R(G,'#ffffff',xx,yy+8,1,8)},on:()=>{ST.kite=1;say('ได้ว่าวแล้ว เอาไปคืนน้อง',1)}});
    const kid=actor('kid',1260,1,{lookP:1,mark:()=>ST.kiteBack?'':'!'});kid.talk=()=>{if(ST.kite&&!ST.kiteBack){ST.kiteBack=1;talk([['kid','ว่าวผม! ขอบคุณครับ ไว้เย็นนี้จะเล่นให้ไกลกว่าเดิม']]).then(()=>{star(7,'ช่วยเอาว่าวคืนให้น้อง');qdone('kite')})}else if(!ST.kiteBack)talk([['kid','ว่าวผมลมพัดไปติดบนต้นไม้สูงโน่น'],['pian','ต้องกระโดดสูง ๆ … ไอซ์น่าจะช่วยได้']]).then(()=>quest('kite','เอาว่าวที่ติดบนต้นไม้คืนให้น้อง'));else talk([['kid','ขอบคุณอีกทีครับพี่!']])};
    // ทางลับตามเสียงทำนองคุ้นหู
    room('secret',3400,4100);
    door(980,'ตามเสียง ♪',3450,'secret',{draw:(dd,c)=>{const xx=dd.x-c;g.fillStyle='rgba(255,224,120,'+(.2+.15*Math.sin(T*5))+')';g.beginPath();g.ellipse(xx,GY-30,22,38,0,0,7);g.fill();g.fillStyle='#3a2a1a';g.beginPath();g.moveTo(xx-14,GY);g.quadraticCurveTo(xx-14,GY-56,xx,GY-60);g.quadraticCurveTo(xx+14,GY-56,xx+14,GY);g.fill()}});
    door(3425,'กลับทางเดิน',990,'main',{draw:(dd,c)=>{const xx=dd.x-c;g.fillStyle='rgba(255,224,120,.3)';g.beginPath();g.ellipse(xx,GY-30,18,34,0,0,7);g.fill()}});
    for(let i=0;i<20;i++)item(3520+i*22,GY-16-(i%3)*12,'coin');item(3980,200,'mat',{m:'hide'});
    LV.tick=dt=>{(LV.tickers||[]).forEach(f=>f());if(LV.room==='main'&&Math.abs(P.x-980)<160&&T-(LV.tuneT||0)>BEAT*9){LV.tuneT=T;phrase(REAL,0);pop(980,GY-80,'♪','#ffe08a')}if(Math.random()<.08)LV.fx.push({x:cam+rnd(0,W),y:rnd(80,200),vx:rnd(-6,6),vy:rnd(-8,-2),t:0,life:2.5,c:'#fff2a0',s:1})};
    LV.sleeper=actor('che',3200,-1,{draw:(a,x)=>{R(g,'#c84a4a',x-30,GY-4,60,4);for(let i=0;i<60;i+=8)R(g,'#ffffff',x-30+i,GY-4,4,4);drawSprite(g,setOf('che'),'idle',0,x,GY,1);g.font='600 10px '+FONT;g.fillStyle='#ffffff';g.fillText('z',x+12,GY-50-((T*16)%16));g.fillText('Z',x+20,GY-64-((T*12)%16))}});
    gate(2950,()=>qis('keys'),'ยังเก็บลูกระนาดไม่ครบ 7 ลูก ลองดูบนที่สูง ริมน้ำ และตามเสียงทำนองแปลก ๆ');
  },
  async run(){
    sceneStart(200);
    await talk([['sys','เย็นวันเสาร์ แสงแดดสีทองส่องลงป่าเชิงเขา ใกล้น้ำตกธารารักษ์'],['pian','ตรงนี้คือปากถ้ำสีฟ้า อยู่ในเขตวัด เราพักเงียบ ๆ ตรงนี้ได้'],['waen','เช่ส่งข้อความมาตอนบ่ายว่า “มาปิกนิกริมน้ำตก”… แล้วก็เงียบไปเลย'],
      ['pian','ฉันเห็นลูกระนาดของเช่กลิ้งกระจายไปทั่วป่า เก็บให้ครบ 7 ลูกแล้วไปปลุกเช่กัน!'],['pian','ถ้าได้ยินทำนองระนาดคุ้นหูแถวต้นไม้ใหญ่ ลองเดินตามเสียงไปดูนะ อาจมีของซ่อนอยู่']]);
    sceneEnd();quest('keys','เก็บลูกระนาดของเช่ (0/7)',1);
    trig(300,()=>[['walk',460],['float',680],['mini',820]].forEach(([k,x])=>enemy(k,x,GY,{yb:GY-10})));
    trig(900,()=>[['echo',1050],['shout',1310,186],['dash',1200],['walk',1520]].forEach(([k,x,y])=>enemy(k,x,y,{yb:GY-10})));
    trig(1100,()=>{if(!qhas('kite'))quest('kite','เอาว่าวที่ติดบนต้นไม้คืนให้น้อง')});
    trig(1600,async()=>{quest('tang2','ช่วยครูตังค์ผ่านเสื่อปิกนิกของครูโอ');sceneStart(1690);const tg=actor('tang',1630,1),k=actor('kruo',1770,-1,{big:1,draw:kruoMat});
      await talk([['sys','กลางทาง มีเสื่อปิกนิกผืนใหญ่ขวางทางเดิน'],['kruo','อ้าว ตังค์ บังเอิญจัง! ครูโอมาปิกนิกพอดี ข้าวเหนียวหมูทอด น้ำสีอำพันสูตรพิเศษ นั่งก่อน ๆ'],['tang','(กระซิบ) ครูยังต้องตามเด็ก ๆ … ช่วยครูที']]);
      const i=await choose('ครูโอปูเสื่อขวางทาง จะทำยังไงดี',['ชวนครูโอมาช่วยหาลูกระนาดด้วยกัน','พาครูตังค์อ้อมทางลำธาร']);
      if(i===0){await talk([['kruo','หาลูกระนาด? ได้! สมัยหนุ่ม ๆ ครูโอก็ตีระนาดนะ… ตีผิดบ่อยหน่อย'],['kruo','อ้าว นี่ไง มีเหรียญตกอยู่ใต้เสื่อเต็มเลย เอาไปเลยเด็ก ๆ !'],['tang','(ถอนหายใจโล่งอก) ขอบคุณครับครูโอ']]);for(let j=0;j<6;j++)item(1710+j*14,200,'coin',{drop:1});qdone('tang2',25)}
      else{await talk([['tang','ครูไปทางนี้นะ ครูโอเดี๋ยวตามไป!'],['kruo','ตังค์!! ข้าวเหนียวจะแข็งแล้ว!'],['pian','ฮ่า ๆ รอดไปอีกหนึ่ง']]);qdone('tang2',20)}
      k.vis=0;tg.vis=0;sceneEnd()});
    trig(2400,()=>[['shield',2550],['echo',2650],['mini',2820],['mini',2860]].forEach(([k,x])=>enemy(k,x,GY,{yb:GY-10})));
    await until(()=>qis('keys'));if(LV.room!=='main')await until(()=>LV.room==='main');await reach(3000);
    sceneStart(3120);await talk([['pian','เช่หลับปุ๋ยอยู่บนเสื่อ… ระนาดครบแล้ว ตีปลุกกันเลย!'],['sys','ลูกระนาดเรืองแสงลอยขึ้น เงาเพี้ยนตัวอ้วนที่นอนทับเสียงระนาดอยู่ลุกขึ้นมาหาว']]);sceneEnd();
    await battleFight({name:'เจ้าขี้เซา',sub:'นอนทับเสียงระนาดไว้ทั้งบ่าย',x:3120,arena:[2660,3300],sc:3.2,kind:'walk',zzz:1,insts:['ranad','ching'],hp:95,
      lineA:[['pian','มันละเมอตีระนาดเพี้ยน ๆ … ตีตามให้ถูก มันจะตื่น!']]});
    sceneStart(3120);LV.sleeper.vis=0;actor('che',3200,-1);
    await talk([['che','หาาว… ใครตีระนาดเพลงที่ผมชอบเนี่ย'],['foo','เช่! นอนกลางป่าทั้งบ่ายเลยนะ'],['che','ก็เล่นดนตรีแล้วสบายใจ ฟังน้ำตกแล้วก็เคลิ้ม… ระนาดกลับมาแล้วเหรอ เย้!'],['pian','เสียงระนาดเอกกลับมาแล้ว!']]);
    voiceBack(3,['che'],this.inst);await waitS(2.5);sceneEnd()}};

/* ====================================================================
   ฉาก 4 · บ่อน้ำร้อนแม่กาษา — พิธีกรมือใหม่ (มหาพราหมณ์ + กัปตัน)
   ==================================================================== */
const STONEC=['#e86a6a','#f2c14e','#6ac86a','#6ab0f0','#c69bff'],STONEK=[10,11,12,14,15];
function stonePuzzle(x0,seqLen){const pz={x0,seq:[],idx:0,solved:0,stones:[]};let k=Math.random()<.5?0:1;for(let i=0;i<seqLen;i++){pz.seq.push(k);k=clamp(k+pick([-1,1,1,1,0]),0,4);if(k===pz.seq[pz.seq.length-1]&&Math.random()<.5)k=clamp(k+1,0,4)}
  gap(x0,5*44+30,'hot');
  for(let i=0;i<5;i++){const s=plat(x0+12+i*44,GY-6-((i%2)*12),26,{key:i,pz,draw:(q,c)=>{if(q.off)return;const lit=q.lit>T||(q.pz.miss>=2&&!q.pz.solved&&q.pz.seq[q.pz.idx]===q.key&&Math.sin(T*8)>0);g.fillStyle=lit?'#ffffff':STONEC[q.key];g.beginPath();g.ellipse(q.x-c+13,q.y+3,14,5,0,0,7);g.fill();R(g,'rgba(0,0,0,.25)',q.x-c+2,q.y+5,24,2)},
    onLand:q=>{const p=q.pz;if(p.solved||q.sunk)return;TS2.ranadKey(STONEK[q.key],AC?AC.currentTime:0,.7);q.lit=T+.3;
      if(q.key===p.seq[p.idx]){p.idx++;if(p.idx>=p.seq.length){p.solved=1;sparks(q.x+13,q.y,16,1);pop(q.x,q.y-24,'ถูกทั้งทำนอง!','#9ff0c0');sfx(t=>{[10,12,14,15,17].forEach((k,i)=>TS2.ranadKey(k,t+i*.09,.5))})}}
      else{q.sunk=1;p.idx=0;p.miss=(p.miss||0)+1;pop(q.x+13,q.y-20,p.miss>=2?'หินที่ถูกจะเรืองแสงให้':'ผิดเสียง!','#ffb0b0');if(p.miss===1)setTimeout(()=>p.play(),900);setTimeout(()=>{q.off=1},650);setTimeout(()=>{q.off=0;q.sunk=0},1800)}}});pz.stones.push(s)}
  pz.play=()=>{const b=nb();pz.idx=0;pz.seq.forEach((k,i)=>{const t=b+i*BEAT;sfx(()=>TS2.ranadKey(STONEK[k],t,.75));setTimeout(()=>{pz.stones[k].lit=T+.35},Math.max(0,(t-now())*1000))})};
  use(x0-20,36,'ฟังทำนองหิน',()=>pz.play());trig(x0-80,()=>{pz.play();say('ฟังทำนอง แล้วกระโดดเหยียบหินตามลำดับเสียง',1)});return pz}
STAGES[4]={id:4,name:'พิธีกรมือใหม่',sub:'บ่อน้ำร้อนแม่กาษา อ.แม่สอด',who:['maha','captain'],inst:'ฆ้องวงใหญ่ ตะโพน',bpm:100,w:3200,start:60,
  music(k,t){if(k%2===0)TS2.thum([7,9,10,12][(k/2)%4|0],t,.16,MUS);if(k%8===0)TS2.taphon(0,t,.22,MUS);if(k%8===4)TS2.taphon(3,t,.18,MUS)},
  build(){artSpring();LV.enCol={walk:'#e86a4a',float:'#f0a040',mini:'#ff8a5a',dash:'#d84a3a',shield:'#e8904a',shout:'#f07a5a'};
    LV.floor=floorMaker([{x0:0,x1:LV.w,k:'rock'}]);
    LV.pz=[stonePuzzle(560,3),stonePuzzle(1380,4),stonePuzzle(2240,4)];
    const deck=(q,c)=>{R(g,'#a87a48',q.x-c,q.y,q.w,4);for(let i=0;i<q.w;i+=8)R(g,'#8a5a30',q.x-c+i,q.y,1,4);R(g,'#6a4420',q.x-c+4,q.y+4,3,GY-q.y-4);R(g,'#6a4420',q.x-c+q.w-7,q.y+4,3,GY-q.y-4)};
    [[300,196,60],[900,190,70],[1060,170,50],[1700,190,60],[1820,166,50],[1900,140,40],[2600,192,60]].forEach(([a,b,w])=>plat(a,b,w,{draw:deck}));
    [[1180,150,40],[1240,126,40],[1300,104,50]].forEach(([a,b,w])=>plat(a,b,w,{hid:1}));item(1320,92,'note',{id:'khongwong',hid:1});
    item(1070,160,'mat',{m:'wax'});item(1830,156,'mat',{m:'hide'});item(2000,200,'heal');item(2620,182,'note',{id:'taphon'});
    cp(1000,'flag','ศาลาพักริมบ่อ');cp(1960,'flag','ศาลาไม้');
    const page=(x,y)=>item(x,y,'thing',{n:'บทพิธีกร!',icon:(G,xx,yy)=>{R(G,'#ffffff',xx-5,yy-6,10,12);R(G,'#5a5a7a',xx-3,yy-3,6,1);R(G,'#5a5a7a',xx-3,yy,6,1);R(G,'#5a5a7a',xx-3,yy+3,4,1)},on:()=>{LV.pages=(LV.pages||0)+1;qset('pages','เก็บบทพิธีกรของกัปตัน ('+LV.pages+'/3)');if(LV.pages>=3)qdone('pages')}});
    page(1075,150);page(1910,128);page(2370,170);
    LV.vents=[[420,30],[1600,30],[2050,30],[2750,30]];
    LV.tick=dt=>{(LV.tickers||[]).forEach(f=>f());const b=beat(),k=Math.floor(b.x),erupt=(((k%2)+2)%2===1&&b.x-k<.4);LV.erupt=erupt;
      if(erupt&&mode==='play')for(const [vx,vw] of LV.vents)if(P.x>vx&&P.x<vx+vw&&P.y>GY-90)hurt(8,P.x<vx+vw/2?-1:1);
      LV.plats.forEach(q=>{if(q.hid&&!q.shown&&act()==='waen'&&Math.abs(P.x-q.x)<160){q.shown=1;sparks(q.x+q.w/2,q.y,8,0,'#c69bff');say('แว่นเห็นทางลับ!',1)}});LV.items.forEach(it=>{if(it.hid&&!it.shown&&act()==='waen'&&Math.abs(P.x-it.x)<160)it.shown=1})};
    LV.drawMid=c=>{for(const [vx,vw] of LV.vents){const x=vx-c;R(g,'#5a5448',x,GY-4,vw,4);if(LV.erupt){for(let i=0;i<8;i++){g.fillStyle='rgba(255,255,255,'+(.5-i*.05)+')';g.beginPath();g.arc(x+vw/2+Math.sin(T*9+i)*6,GY-10-i*11,8+i*1.5,0,7);g.fill()}}}
      const bx=820-c;R(g,'#a87a48',bx,GY-14,24,14);for(let i=0;i<4;i++)disc(g,'#f4f0e0',bx+4+i*5,GY-15,3);if(LV.egg.on){g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.arc(bx+40,GY-20-((T*20)%14),5,0,7);g.fill();g.font='600 10px '+FONT;g.fillStyle='#ffffff';g.fillText(Math.floor((T-LV.egg.t)/BEAT)+' จังหวะ',bx+28,GY-40)}};
    LV.egg={on:0};
    use(850,50,'ต้มไข่ในบ่อ',u=>{const E=LV.egg;if(!E.on){E.on=1;E.t=T;u.n='เก็บไข่ขึ้นจากบ่อ';say('ใส่ไข่แล้ว! นับจังหวะไปเรื่อย ๆ ราว 8 จังหวะแล้วค่อยเก็บ',1);if(!qhas('egg'))quest('egg','ต้มไข่ในบ่อน้ำร้อนให้ป้านักท่องเที่ยว')}
      else{const e=(T-E.t)/BEAT;E.on=0;u.n='ต้มไข่ในบ่อ';if(e<7)say('ยังไม่สุกเลย! ลองใหม่ รอให้นานขึ้นอีกหน่อย',1);else{say(e<=17?'ไข่ยางมะตูมพอดีเป๊ะ!':'สุกเกินไปนิด แต่ก็อร่อย!',1);ST.egg=1}}});
    const tour=actor('vendor',760,1,{lookP:1,mark:()=>qis('egg')?'':'!'});tour.talk=()=>{if(ST.egg&&!qis('egg')){talk([['vendor','ไข่ต้มน้ำแร่! หอมมาก ขอบใจนะหลาน']]).then(()=>{qdone('egg');star(4,'แบ่งไข่ต้มให้นักท่องเที่ยว')})}else if(!qis('egg'))talk([['vendor','เขาว่าต้มไข่ในบ่อน้ำร้อนนี่อร่อยนัก แต่ป้าไม่รู้ต้องรอนานแค่ไหน ช่วยป้าต้มหน่อยได้ไหม']]).then(()=>{if(!qhas('egg'))quest('egg','ต้มไข่ในบ่อน้ำร้อนให้ป้านักท่องเที่ยว')});else talk([['vendor','อร่อยมากจ้ะ']])};
    const lost=actor('kid',2520,-1,{lookP:1,vis:0,mark:()=>qhas('lostkid')&&!qis('lostkid')?'!':''});LV.lostKid=lost;lost.talk=()=>{if(qhas('lostkid')&&!qis('lostkid')){talk([['kid','พี่กัปตันประกาศชื่อผมผิดอีกแล้ว… แต่ขอบคุณที่มาหาครับ'],['captain','ขอโทษน้องนะ! พี่จะจำชื่อให้ได้ครั้งหน้า']]).then(()=>{lost.vis=0;qdone('lostkid');star(7,'ช่วยหาเด็กหลงทาง')})}};
    gate(2860,()=>qis('pages'),'กัปตันยังได้บทพิธีกรไม่ครบ 3 แผ่น ลองดูแถวไอน้ำกับบนที่สูง');
  },
  async run(){
    sceneStart(300);const cp_=actor('captain',380,-1),mh=actor('maha',420,-1);
    await talk([['sys','บ่อน้ำร้อนแม่กาษา ไอน้ำลอยกรุ่น น้ำร้อนจัด ห้ามลงไปเด็ดขาด'],['captain','(ฝึกพูด) ขอต้อนรับทุกท่านสู่… สู่… อ้าว บทหายไปไหน!'],['maha','ไอน้ำพ่นบทนายปลิวไปหมดแล้ว แล้วเสียงฆ้องกับตะโพนของเราก็หายไปด้วย'],
      ['captain','งานนี้ครูให้ผมเป็นพิธีกร ผมอยากกล้าพูดต่อหน้าคนให้ได้'],['pian','งั้นช่วยเก็บบท 3 แผ่นก่อน! หินข้ามบ่อแต่ละก้อนมีเสียงระนาด ฟังทำนองแล้วเหยียบตามลำดับนะ']]);
    cp_.vis=0;mh.vis=0;sceneEnd();quest('pages','เก็บบทพิธีกรของกัปตัน (0/3)',1);
    trig(150,()=>[['walk',360],['shout',920,190],['float',1100]].forEach(([k,x,y])=>enemy(k,x,y)));
    trig(1160,()=>{if(TEAM.includes('waen'))say('สลับเป็นแว่นแล้วมองขึ้นไปข้างบน…',1)});
    trig(1660,async()=>{quest('tang3','ช่วยกัปตันรับมือครูโอ');sceneStart(1750);const tg=actor('tang',1700,1),k=actor('kruo',1800,-1,{big:1}),cpt=actor('captain',1740,1);
      await talk([['kruo','ตังค์! ครูโอต้มไข่บ่อน้ำร้อนไว้สามสิบฟอง พร้อมน้ำสมุนไพรสูตรครูโอ เย็นนี้ไปด้วยกันนะ'],['tang','วันนี้กัปตันซ้อมพิธีกรครับครูโอ'],['kruo','งั้นให้กัปตันประกาศเชิญครูตังค์ไปงานเลี้ยงสิ ฝึกพูดไปในตัว!']]);
      const i=await choose('กัปตันจะประกาศว่าอะไรดี',['“ขอเชิญครูตังค์… ไปซ้อมดนตรีครับ!”','“ขอเชิญครูโอ… มาช่วยเด็ก ๆ หาบทพิธีกรครับ!”']);
      if(i===0)await talk([['captain','(ตกใจ) ประกาศ ๆ … ขอเชิญครูตังค์… ไปซ้อมดนตรีครับ!'],['kruo','ฮ่า ๆ ๆ เด็กคนนี้ใช้ได้! โดนหักมุม']]);
      else await talk([['captain','ประกาศ ๆ ขอเชิญครูโอ… มาช่วยพวกเราหาบทพิธีกรครับ!'],['kruo','ได้เลย! เมื่อกี้ครูเห็นกระดาษปลิวไปทางศาลาไม้ ข้างบนหลังคานั่นแหละ']]);
      await talk([['tang','(ยิ้ม) พิธีกรเราเก่งขึ้นแล้ว'],['sys','ทันใดนั้น มีเสียงร้องไห้ดังจากริมบ่อ'],['kruo','เด็กหลงทางนี่นา! กัปตัน ประกาศหาพ่อแม่เขาเลย'],['captain','ประกาศ ๆ น้องชื่อ… เอ่อ… ชื่ออะไรนะครับ! อ้าว น้องเดินหายไปทางปลายบ่อแล้ว!'],['pian','ไปตามน้องที่ปลายบ่อกัน!']]);
      qdone('tang3',25);quest('lostkid','ตามหาน้องที่หลงไปทางปลายบ่อน้ำร้อน');LV.lostKid.vis=1;k.vis=0;tg.vis=0;cpt.vis=0;sceneEnd()});
    trig(1680,()=>[['dash',1780],['shield',1900],['float',2050],['walk',2150]].forEach(([k,x,y])=>enemy(k,x,y)));
    trig(2520,()=>[['shout',2620,192],['walk',2700],['mini',2760],['mini',2800]].forEach(([k,x,y])=>enemy(k,x,y)));
    await until(()=>qis('pages'));await reach(2920);
    await battleFight({name:'หม้อไอน้ำเพี้ยน',sub:'ต้มเสียงฆ้องกับตะโพนจนเพี้ยน',x:3080,arena:[2560,LV.w],sc:3.3,kind:'dash',insts:['khong','taphon'],hp:100,
      lineA:[['captain','ขอผมประกาศเปิดการประลองเองครับ… ขอต้อนรับทุกท่าน!'],['maha','ดีมาก ทีนี้ฟังทำนองฆ้องให้ดี แล้วตีตามด้วยกัน']]});
    sceneStart(3020);actor('maha',2980,1);actor('captain',3010,1);
    await talk([['maha','ฆ้องวงใหญ่กลับมาแล้ว เป็นหลักให้วงได้อีกครั้ง'],['captain','วันนี้ผมพูดต่อหน้าคนตั้งหลายรอบ ไม่เป็นไรด้วย!'],['maha','ผู้นำที่ดีไม่ได้อยู่เหนือใครหรอก ฟังเพื่อนก่อน แล้วค่อยพูด นายทำได้แล้ว'],['pian','เสียงฆ้องวงใหญ่กับตะโพนกลับมาแล้ว!']]);
    voiceBack(4,['maha','captain'],this.inst);await waitS(2.5);sceneEnd()}};

/* ====================================================================
   ฉาก 5 · ตลาดริมเมย — ประกวดเปิดหมวก (ไข่มุก อิ้ง + ไอซ์)
   ==================================================================== */
STAGES[5]={id:5,name:'ประกวดเปิดหมวก',sub:'ตลาดริมเมย ริมแม่น้ำเมย',who:['kaimuk','ing'],inst:'ร้องนำ โทน รำมะนา',bpm:112,w:3400,start:60,
  music(k,t){if(k%2===0)TS2.harp([0,2,4,3,2,1,0,2][(k/2)%8|0],t,.2,MUS);if(k%4===1)patwaing([0,2,4,5][(k/4)%4|0],t,.25,MUS);if(k%8===6)TS2.thon(2,t,.2,MUS)},
  build(){artMarket({stalls:[[200,'#d84a6a',['#e8c060','#c03030','#6a9a3a']],[460,'#3a7ad8',['#f2f0e8','#e86a8a','#3a3ad8']],[900,'#e89a30',['#c8a060','#6a4a2a','#e8d8b0']],[1160,'#5aa84a',['#ffd86a','#ff8a4a','#c03030']],[1700,'#d84a6a',['#9a9aa8','#2a2a30','#c8c0b0']],[1960,'#3a7ad8',['#e8c060','#c03030','#6a9a3a']],[2500,'#e89a30',['#f2f0e8','#e86a8a','#3a3ad8']]],sign:620,stage:1380});
    LV.enCol={walk:'#e85aa8',float:'#5ad8e8',mini:'#ff7ab0',shout:'#f0c040',shield:'#c87ad8',dash:'#e8507a'};
    LV.floor=floorMaker([{x0:0,x1:LV.w,k:'tile'}]);
    [[200,186,90],[460,186,90],[900,186,90],[1160,186,90],[1700,186,90],[1960,186,90],[2500,186,90],[1380,198,180],[2240,150,60]].forEach(([a,b,w])=>plat(a,b,w,{noDraw:1}));
    [[200,134],[460,134],[900,134],[1160,134],[1700,134],[1960,134],[2500,134]].forEach(([a,b])=>plat(a-8,b-8,106,{draw:()=>{}}));
    item(2260,140,'mat',{m:'string'});item(1720,116,'mat',{m:'hide'});item(1180,116,'note',{id:'hsaing'});item(480,116,'heal');
    cp(620,'flag','ป้ายตลาดริมเมย');cp(2200,'flag','ร้านน้ำ');
    // แลกของต่อกัน: ป้าร้านผ้า ← ดอกไม้ ← น้าเอ ← เพลงกับพี่ดาวิ
    const kr=actor('karen',1300,1,{draw:(a,x)=>{drawSprite(g,setOf('karen'),'idle',0,x,a.y,1);R(g,'#c8a060',x+4,a.y-26,3,22);g.strokeStyle='#d8b878';g.lineWidth=2;g.beginPath();g.moveTo(x+6,a.y-6);g.quadraticCurveTo(x+22,a.y-10,x+20,a.y-34);g.stroke();for(let i=0;i<5;i++)R(g,'#e8e8e8',x+7+i*2,a.y-24+i*2,1,14-i*2)},
      mark:()=>qhas('song')&&!qis('song')?'!':''});
    kr.talk=async()=>{if(qhas('song')&&!qis('song')){await talk([['karen','อยากได้เพลงไปฝากน้าเอเหรอ งั้นเล่นด้วยกันสักเพลง'],['karen','พี่ดีดเตหน่ากู ลุงหม่องตีกลองวง น้อง ๆ ตีตามนะ']]);
        await instBattle({name:'เล่นด้วยกันกับพี่ดาวิ',insts:['harp','pat'],hp:40,phr:[3,4],show:3,gap:.5,atk:2});
        await talk([['myan2','เพราะมาก! คนเดินตลาดหยุดฟังกันเต็มเลย'],['karen','ดนตรีของเราต่างกัน แต่เล่นเพลงเดียวกันได้นะ']]);qdone('song');star(6,'เล่นดนตรีร่วมกับเพื่อนต่างวัฒนธรรม');learn('tehnaku')}
      else talk([['karen','สวัสดีครับ นี่คือเตหน่ากู พิณของพี่น้องกะเหรี่ยง'],['karen','มือซ้ายเล่นเสียงประสาน มือขวาเล่นทำนอง']]).then(()=>sfx(()=>{const b=nb();[0,2,4,3,2,1,2,0,5,4].forEach((k,i)=>TS2.harp(k,b+i*BEAT/2,.9))}))};
    actor('myan',1440,-1).talk=()=>talk([['myan','วงของลุงเป็นวงปี่พาทย์พม่า กลองวงนี่หัวใจของวงเลย'],['myan','งานแสดงของหลาน ลุงกับพี่ดาวิไปช่วยเล่นได้นะ']]);
    const ae=actor('myan2',1500,-1,{lookP:1,mark:()=>qhas('cloth')&&!ST.flower?'!':''});ae.talk=()=>{if(qis('song')&&!ST.flower){ST.flower=1;talk([['myan2','ได้ฟังเพลงเพราะ ๆ แล้ว นี่ดอกไม้ทัดหูให้ไปแลกนะหลาน']]).then(()=>say('ได้ดอกไม้! เอาไปให้ป้าร้านผ้า',1))}else if(qhas('cloth')&&!qhas('song'))talk([['myan2','ดอกไม้เหรอ น้ามีนะ แต่น้าอยากฟังเพลงเพราะ ๆ สักเพลงก่อน'],['myan2','ไปเล่นกับพี่ดาวิที่ดีดพิณอยู่ข้าง ๆ สิ']]).then(()=>quest('song','เล่นเพลงกับพี่ดาวิให้น้าเอฟัง'));else if(ST.flower)talk([['myan2','เอาดอกไม้ไปให้ป้าร้านผ้าเลยหลาน']]);else talk([['myan2','ตลาดนี้มีคนหลายภาษา แต่ฟังเพลงด้วยกันได้หมด']])};
    actor('dancer',1560,-1);actor('dancer',1586,-1);
    const v=actor('vendor',700,1,{lookP:1,mark:()=>qis('cloth')?'':'!'});v.talk=()=>{if(ST.flower&&!qis('cloth')){talk([['vendor','ดอกไม้สวยจัง! เอาผ้าคาดผมสีทองไปเลย แต่งเวทีให้ปัง ๆ']]).then(()=>qdone('cloth'))}else if(!qis('cloth'))talk([['vendor','ผ้าคาดผมสีทองเหรอ ป้าแลกกับดอกไม้สดสักช่อนะ'],['vendor','น้าเอที่ร้องเพลงกับวงพม่ากลางตลาดมีดอกไม้สวย ๆ']]);else talk([['vendor','ไปประกวดให้ปังนะหลาน!']])};
    const ko=actor('kruo',2100,-1,{big:1,lookP:1,mark:()=>qis('tang4')?'':'?'});ko.talk=async()=>{if(qis('tang4'))return talk([['kruo','ชาไข่มุกครูโอ แก้วละสิบบาท… สำหรับครูตังค์ฟรี ถ้ามางานเลี้ยงคืนนี้!']]);
      if(!qhas('tang4'))quest('tang4','แม่ค้าคนนี้ดูคุ้น ๆ …');
      await talk([['kruo','(ใส่ผ้าคลุมหัว ทำเสียงเล็ก) ชาไข่มุกสูตรพิเศษจ้า… ใครเห็นครูตังค์บ้างจ๊ะ'],['ice','…ครูโอใช่ไหมคะ ขาโผล่ออกมาหมดเลย'],['kruo','ชู่ว! ปลอมตัวอยู่ ครูโอจะชวนครูตังค์ไปงานเลี้ยงริมเมยคืนนี้']]);
      const i=await choose('ครูโอปลอมตัวเป็นแม่ค้า',['ชวนครูโอมาเป็นกองเชียร์ประกวด แล้วค่อยไปงานเลี้ยงหลังงานแสดง','แกล้งบอกว่าครูตังค์กลับบ้านแล้ว']);
      if(i===0){await talk([['kruo','เป็นกองเชียร์ก็ได้! ครูโอจะเชียร์ดังที่สุดในตลาด'],['pian','ได้กองเชียร์เสียงดังที่สุดในแม่สอดมาแล้ว']]);qdone('tang4',25)}else{await talk([['kruo','กลับบ้านแล้ว? แต่นั่นเสื้อครูตังค์อยู่หลังร้านน้ำนี่นา…'],['pian','พูดความจริงดีกว่านะ ครูโอดูออกทุกที']]);qdone('tang4',10)}};
    gate(2950,()=>qis('cloth'),'ยังไม่มีชุดประกวด! ไปแลกผ้าคาดผมกับป้าร้านผ้าก่อน');
    LV.tick=dt=>{(LV.tickers||[]).forEach(f=>f())};
  },
  async run(){
    sceneStart(400);const k1=actor('kaimuk',360,1),k2=actor('ing',386,1);
    await talk([['sys','ตลาดริมเมย ริมแม่น้ำเมยชายแดนตะวันตก วันนี้มีประกวดเปิดหมวกกลางตลาด'],['kaimuk','พวกเราสมัครประกวดไว้แล้ว! แต่เสียงร้องกับเสียงโทนรำมะนาหายไปกับระเบิด'],['ing','แถมชุดแต่งเวทียังไม่มีเลย'],
      ['ice','ไอซ์ผิดเองที่เล่นซน งานนี้ไอซ์ช่วยเต็มที่!'],['pian','ป้าร้านผ้าตรงนั้นมีผ้าคาดผมสีทองสวย ๆ ลองไปคุยดู แล้วคุยกับนักดนตรีในตลาดด้วยนะ!']]);
    k1.vis=0;k2.vis=0;sceneEnd();quest('cloth','แลกผ้าคาดผมสีทองมาแต่งชุดประกวด',1);
    trig(150,()=>[['walk',500],['float',780],['mini',980]].forEach(([k,x])=>enemy(k,x,GY,{yb:GY-20})));
    trig(1640,()=>[['float',1800],['shield',1900],['walk',2050],['dash',2300]].forEach(([k,x])=>enemy(k,x,GY,{yb:GY-20})));
    trig(2440,()=>[['float',2600],['walk',2700],['mini',2850]].forEach(([k,x])=>enemy(k,x,GY,{yb:GY-25})));
    await until(()=>qis('cloth'));await reach(3000);
    sceneStart(3150);const a1=actor('kaimuk',3100,1),a2=actor('ing',3126,1);
    await talk([['sys','บนเวทีประกวด จู่ ๆ ไมโครโฟนก็หอนลั่น “วี้~~~” กลายเป็นเงาเพี้ยนตัวชมพู'],['kaimuk','มันกินเสียงร้องของพวกเราไป!'],['ing','ตีมันด้วยโทนรำมะนาเลย!']]);a1.vis=0;a2.vis=0;sceneEnd();
    await battleFight({name:'ไมค์หอน',sub:'กลืนเสียงร้องกลางเวทีประกวด',x:3250,arena:[2760,LV.w],sc:3.1,kind:'shout',insts:['thon','harp','pat'],hp:100});
    sceneStart(3150);actor('kaimuk',3080,1);actor('ing',3106,1);actor('karen',3180,-1);actor('myan',3206,-1);
    await talk([['kaimuk','เสียงร้องกลับมาแล้ว! ร้องต่อเลย!'],['ing','คนดูตัวจริงยืนฟังกันเต็มตลาดเลย'],['sys','ผลประกวด: รางวัลขวัญใจตลาดริมเมย!'],['kaimuk','ได้ขึ้นเวทีจริง ๆ สนุกกว่าดูยอดวิวในมือถือตั้งเยอะ'],['pian','เสียงร้องกับโทนรำมะนากลับมาแล้ว!']]);
    voiceBack(5,['kaimuk','ing'],this.inst);await waitS(2.5);sceneEnd()}};

/* ====================================================================
   ฉาก 6 · ต.แม่จะเรา อ.แม่ระมาด — พากลองกลับบ้าน (ลู่วา + พบธรรม)
   เริ่มที่ห้วยขี้เท่อ (สะพานไม้ โคมแดง) → วิ่งตามเกวียนกลองหลวง → ลานงานตานก๋วยสลาก
   ==================================================================== */
STAGES[6]={id:6,name:'พากลองกลับบ้าน',sub:'ห้วยขี้เท่อ และ ต.แม่จะเรา อ.แม่ระมาด',who:['luwa','pob'],inst:'ฉาบ ปี่แน',bpm:120,w:4300,start:60,
  music(k,t){const c=((k%4)+4)%4;TS2.klchab(k%2?1:0,t,.32,MUS);if(c===0){TS2.klong(0,t,.55,MUS);TS2.klmong(t,.35,MUS)}if(c===2)TS2.klong(1,t,.4,MUS)},
  build(){artVillage({houses:[1500,3800],kuay:[3300,3420,3560,3880,4020]});const x=LV.L.world.getContext('2d'),r=seeded(81);
    x.clearRect(0,0,1000,H);x.fillStyle='#a8d8a0';x.fillRect(0,0,1000,H);drawHuaiKhiThoe(x,0,1000,r);
    LV.enCol={walk:'#e8504a',float:'#f08a3a',mini:'#ff6a5a',dash:'#c83a3a',shield:'#d8a03a',shout:'#f0703a'};
    LV.floor=floorMaker([{x0:0,x1:1000,k:'board'},{x0:1000,x1:LV.w,k:'dirt',c1:'#a08058',c2:'#7a5a38',c3:'#b8986a'}]);
    gap(380,120,'water');plat(370,206,140,{draw:(q,c)=>{R(g,'#9a7a50',q.x-c,q.y,q.w,5);for(let i=0;i<q.w;i+=10)R(g,'#7a5a38',q.x-c+i,q.y,2,5);R(g,'#6a4a2a',q.x-c,q.y-20,3,20);R(g,'#6a4a2a',q.x-c+q.w-3,q.y-20,3,20);R(g,'#8a6a40',q.x-c,q.y-20,q.w,2)}});
    LV.drawFG=c=>{if(c<1100)drawLanternFG(c,0,1000)};
    [[600,190,60],[3450,186,60]].forEach(([a,b,w])=>plat(a,b,w,{draw:(q,c)=>{R(g,'#a87a48',q.x-c,q.y,q.w,4);R(g,'#6a4420',q.x-c+4,q.y+4,3,GY-q.y-4);R(g,'#6a4420',q.x-c+q.w-7,q.y+4,3,GY-q.y-4)}}));
    [1300,1600,1850,2180,2450,2750].forEach(xx=>wall(xx,216,22,14,'log',{draw:(q,c)=>{R(g,'#7a5232',q.x-c,q.y,q.w,q.h);R(g,'#9a7250',q.x-c,q.y,q.w,3);disc(g,'#c8a070',q.x-c+3,q.y+7,4)}}));
    [1450,2000,2600].forEach(xx=>gap(xx,46,'water'));
    wall(860,200,26,30,'crate',{lim:[820,920]});item(940,200,'mat',{m:'hide'});
    item(620,180,'note',{id:'kuay'});item(3460,176,'mat',{m:'wood'});item(2900,200,'heal');item(3600,190,'note',{id:'klongluang'});
    cp(900,'flag','ร้านกาแฟห้วยขี้เท่อ');cp(3150,'flag','ลานงาน');
    const kuay=(xx,y,n,col)=>item(xx,y,'thing',{n,col,on:()=>{LV.kuay=(LV.kuay||0)+1;qset('kuay','หาของใส่ก๋วยสลาก ('+LV.kuay+'/3)');if(LV.kuay>=3)qdone('kuay')}});
    kuay(3230,200,'ข้าวต้มมัด!','#6aa84a');kuay(3470,170,'ดอกไม้ธูปเทียน!','#f2c14e');kuay(3700,200,'ขนมใส่ตะกร้า!','#e86a8a');
    LV.cart={x:1100};
    LV.drawMid=c=>{if(LV.cart.show){const xx=LV.cart.x-c;R(g,'#6a4428',xx,186,110,10);[xx+18,xx+92].forEach(wx=>{disc(g,'#3a2414',wx,214,16);disc(g,'#8a6a44',wx,214,12);for(let i=0;i<6;i++){const a=i/6*Math.PI*2+(LV.auto?T*4:0);limb(g,wx,214,wx+Math.cos(a)*11,214+Math.sin(a)*11,1,'#3a2414')}disc(g,'#3a2414',wx,214,3)});drawOldDrum(g,xx+14,186,0);drawSprite(g,setOf('drummer'),'play',Math.floor(T*6)%2,xx+104,186,-1)}};
    LV.tick=dt=>{(LV.tickers||[]).forEach(f=>f());if(LV.auto){LV.cart.x=LV.autoX+W*.55;if(P.x<cam+14){P.x=cam+14;if(P.vx<0)P.vx=0}if(P.x>cam+W-14)P.x=cam+W-14}};
    const el=actor('elder',3300,1,{lookP:1,mark:()=>ST.kuayGiven?'':'!'});el.talk=()=>{if(qis('kuay')&&!ST.kuayGiven){ST.kuayGiven=1;talk([['elder','ครบแล้ว! ก๋วยสลากใบนี้ลุงจะเอาไปถวายวัดตอนจับสลาก ขอบใจหลาน']]).then(()=>star(7,'ช่วยเตรียมก๋วยสลาก'))}else if(!ST.kuayGiven)talk([['elder','ช่วยลุงหาของใส่ก๋วยสลากหน่อย ข้าวต้มมัด ดอกไม้ธูปเทียน กับขนม'],['elder','เด็ก ๆ วิ่งเล่นทำของหล่นกระจายไปทั่วลานแล้ว']]);else talk([['elder','ไปเถอะหลาน ลานงานอยู่ข้างหน้า']])};
    gate(3780,()=>qis('kuay')&&ST.kuayGiven,'ช่วยพ่อครูเตรียมก๋วยสลากให้เสร็จก่อนนะ');
  },
  async run(){
    sceneStart(300);chingOn=false;const k=actor('kruo',260,1,{big:1}),pb=actor('pob',300,1),lw=actor('luwa',340,-1),tg=actor('tang',200,1);
    await talk([['sys','ห้วยขี้เท่อ อ.แม่ระมาด สะพานไม้ข้ามลำห้วย โคมแดงแขวนเรียงรายใต้ร่มไม้'],['kruo','มาแล้ว ๆ ! วันนี้พากลองหลวงกลับบ้านที่แม่จะเรา ครูโอเป็นเจ้าภาพเอง'],
      ['pob','แผนของผมกับครูโอ: พากลองกลับบ้าน แล้วจัดงานเลี้ยงฉลองใหญ่ ให้ครูตังค์หนีไม่ได้!'],['tang','…สองคนนี้รวมหัวกันอีกแล้ว'],
      ['luwa','เสียงฉาบของหนูกับเสียงปี่แนของพบธรรมก็ปลิวมาทางนี้ด้วยนะ'],['kruo','กลองหลวงบ้านครูไม่ได้มีอาถรรพ์อะไรหรอก ป้ายนั่นครูเขียนขู่เด็กไว้ กลองมันแค่ดังมากเฉย ๆ ฮ่า ๆ'],
      ['pian','ไม่มีพลังวิเศษอะไรเลย มีแต่กลองที่ดังมาก กับเด็กที่ซนมาก! วงกลองหลวงไม่ใช้ฉิ่ง ให้ฟังฉาบแทนนะ']]);
    [k,pb,lw,tg].forEach(a=>a.vis=0);sceneEnd();
    trig(150,()=>[['walk',560],['float',760]].forEach(([kk,xx])=>enemy(kk,xx,GY,{yb:GY-15})));
    trig(820,()=>{if(TEAM.includes('che'))say('ลังขวางทางแคบ ๆ … เช่ดันได้นะ',1);else say('ลังนี้ดันได้ ลองเดินชนดูสิ',1)});
    await reach(1050);
    sceneStart(1160);LV.cart.show=1;LV.cart.x=1100;
    await talk([['drummer','ขึ้นเกวียนไม่ได้นะหลาน วิ่งตามมาข้าง ๆ แล้วช่วยไล่เงาเพี้ยนที่ขวางทาง'],['pian','จอจะเลื่อนไปเอง กระโดดข้ามท่อนไม้กับแอ่งน้ำ อย่าตกขอบซ้ายนะ!']]);
    sceneEnd();LV.autoX=cam;LV.auto=92;
    [[1300,'dash'],[1600,'float'],[1820,'walk'],[2100,'shield'],[2250,'float'],[2450,'dash'],[2700,'walk']].forEach(([xx,kk])=>trig(xx-200,()=>enemy(kk,xx+W*.5,GY,{yb:GY-25})));
    await until(()=>LV.autoX>=3000-W*.3);LV.auto=0;LV.cart.x=3050;
    sceneStart(3200);const k2=actor('kruo',3150,1,{big:1}),p2=actor('pob',3180,1);
    await talk([['sys','ต.แม่จะเรา ชาวบ้านเตรียมงานตานก๋วยสลากกันคึกคัก'],['kruo','ถึงบ้านแล้วกลองหลวง! พ่อครู! กลองกลับมาแล้ว'],['pob','ครูโอครับ ผมขอเป่าปี่แนนำขบวน… แต่เสียงปี่ผมยังไม่กลับมาเลย'],['pian','ช่วยพ่อครูเตรียมก๋วยสลากก่อน แล้วไปลานงานกัน!']]);
    k2.vis=0;p2.vis=0;sceneEnd();quest('kuay','หาของใส่ก๋วยสลาก (0/3)',1);
    await until(()=>qis('kuay')&&ST.kuayGiven);await reach(3840);
    await battleFight({name:'กลองเบิ้ลเพี้ยน',sub:'กลืนเสียงฉาบกับปี่แนไว้กลางลานงาน',x:4100,arena:[3660,LV.w],sc:3.3,kind:'dash',heads:2,insts:['klong','chab','pinae'],hp:105,bpm:112,
      lineA:[['luwa','ฉาบเปิดคือฉิ่ง ฉาบปิดคือฉับ จำไว้นะ!'],['pob','ครูโอ ช่วยเชียร์หน่อย!'],['kruo','(ตะโกน) สู้ ๆ เด็ก ๆ ! เสร็จแล้วกินข้าวกัน!']]});
    sceneStart(3960);actor('luwa',3900,1);actor('pob',3930,1);actor('kruo',3990,-1,{big:1});actor('tang',3870,1);actor('elder',4030,-1);
    sfx(()=>{const b=nb();[351,470,551,619,551,470].forEach((f,i)=>TS2.pinae(f,b+i*BEAT/2,.3,.7))});
    await talk([['pob','ปี่แนกลับมาแล้ว! ปู๊ด ปู๊ด~'],['luwa','ฉาบหนูก็กลับมา วงกลองหลวงกับวงปี่พาทย์เล่นด้วยกันได้สบายเลย'],['elder','กลองหลวงกับปี่พาทย์อยู่ในงานบุญเดียวกันมาตั้งนานแล้วหลาน'],
      ['kruo','ตังค์! งานแสดงเสร็จเมื่อไหร่ งานเลี้ยงที่ห้วยขี้เท่อ ห้ามหนี!'],['tang','…ครับ หลังงานแสดง ครูไปแน่นอน'],['pob','สำเร็จ! แผนของเราสำเร็จแล้วครูโอ!'],
      ['pian','เหลืออีกเสียงเดียว… มาเตโอเงียบหายไป ข้อความสุดท้ายบอกว่าอยู่ที่หอประชุม']]);
    chingOn=true;voiceBack(6,['luwa','pob'],this.inst);await waitS(2.5);sceneEnd()}};

/* ====================================================================
   ฉาก 7 · หอประชุม ก่อนงานแสดง — มาเตโอ และท่านเสียงทอง (ฉากเดียวที่มีตัวร้ายหลอกลวง)
   ==================================================================== */
STAGES[7]={id:7,name:'ซ้อมใหญ่ก่อนงานแสดง',sub:'ห้อง 512 ตอนเย็น และหอประชุม',who:['mateo'],inst:'ฆ้องวงใหญ่ และเสียงของทั้งวง',bpm:108,w:2900,start:80,
  music(k,t){if(k%2===0)TS.khong([3,5,6,7,6,5,3,2][(k/2)%8|0],t,.14,MUS);if(k%8===0)TS2.that(1,t,.25,MUS);if(k%8===5)TS2.taphon(3,t,.16,MUS)},
  build(){const [c,x]=mk(LV.w,H),r=seeded(3);drawRoom512(x,r,'eve');
    R(x,'#4a4a58',ROOM_END,0,300,222);for(let i=ROOM_END;i<ROOM_END+300;i+=50)R(x,'#3a3a46',i,0,4,222);R(x,'#6a6a7a',ROOM_END,120,300,4);
    artHall(x,ROOM_END+300,LV.w);LV.L.world=c;LV.L.sky=skyCanvas([[0,'#f0905a'],[.6,'#ffc890'],[1,'#ffe8c0']],'rgba(255,230,210,.6)',0,77);
    LV.floor=floorMaker([{x0:0,x1:ROOM_END,k:'room'},{x0:ROOM_END,x1:ROOM_END+300,k:'concrete'},{x0:ROOM_END+300,x1:LV.w,k:'board'}]);
    wall(ROOM_END+200,120,60,86,'low',{draw:(q,c)=>{R(g,'#2a2026',q.x-c,q.y,q.w,q.h);R(g,'#4a3a40',q.x-c,q.y+q.h-4,q.w,4);for(let i=0;i<q.w;i+=10)R(g,'#3a2a30',q.x-c+i,q.y,2,q.h)}});
    [[148,196,60],[218,182,24],[1700,170,60],[1900,150,50],[2100,176,60]].forEach(([a,b,w])=>plat(a,b,w));
    item(1910,140,'note',{id:'media'});item(1712,160,'mat',{m:'hide'});item(2110,166,'heal');item(1250,200,'mat',{m:'wax'});
    use(97,60,'ไหว้ครู',()=>{rest('ไหว้ครูก่อนขึ้นเวทีครั้งสำคัญ');P.pose='wai';learn('waikhru')});
    cp(1300,'flag','ทางเดินหลังเวที');LV.enCol={walk:'#9a6ad8',float:'#c69bff',shield:'#8a5ac8',dash:'#b07ae8',mini:'#d0a0ff'};
    LV.tick=dt=>{(LV.tickers||[]).forEach(f=>f())};
  },
  async run(){
    sceneStart(400);const band=[['maha',330],['che',360],['jao',390],['foo',420],['waen',450],['yum',480],['captain',520],['kaimuk',560],['ing',590],['ice',620],['luwa',650],['pob',680],['tang',720]].map(([id,xx])=>actor(id,xx,id==='tang'?-1:1));
    await talk([['sys','เย็นก่อนวันงานแสดง ห้อง 512 ทุกคนกลับมาซ้อมครบ… ยกเว้นมาเตโอ'],['maha','มาเตโอไม่ตอบข้อความเลย ฆ้องวงใหญ่ต้องตีคู่กันสองคน'],['ice','หนูเห็นเงาเล็ก ๆ วิ่งไปทางหอประชุม'],['tang','ไปตามมาเตโอกัน ทุกคนเตรียมเครื่องไว้ เดี๋ยวซ้อมใหญ่บนเวทีเลย']]);
    band.forEach(a=>a.vis=0);sceneEnd();quest('mateo','ตามหามาเตโอ',1);
    trig(300,()=>[['walk',500],['float',700],['mini',900]].forEach(([k,xx])=>enemy(k,xx,GY,{yb:GY-15})));
    await reach(1300);sceneStart(1400);const mt=actor('mateo',1470,-1);
    await talk([['sys','หลังเวทีมีช่องลอดแคบ ๆ มาเตโอนั่งกอดเข่าอยู่ตรงนั้น'],['mateo','ผมตื่นเวทีครับ… ผมตัวเล็กที่สุด กลัวตีผิดต่อหน้าคนเยอะ ๆ'],
      ['me','กระดาษบนบอร์ดของมาเตโอเขียนว่า “อยากมีเพื่อน” ตอนนี้เพื่อนรออยู่ทั้งวงเลยนะ'],['mateo','…จริงเหรอครับ'],['pian','มาเตโอตัวเล็ก มุดช่องใต้ฉากได้ ไปทางลัดหลังเวทีกัน! สลับเป็นมาเตโอนะ']]);
    mt.vis=0;if(!TEAM.includes('mateo'))TEAM.push('mateo');qdone('mateo');sceneEnd();
    say('ช่องใต้ฉากเตี้ยมาก ต้องสลับเป็นมาเตโอถึงจะมุดผ่านได้ ('+(isTouch()?'⇄':'Q')+')',1);
    trig(1520,()=>[['walk',1700],['shield',1850],['float',2000],['dash',2150]].forEach(([k,xx])=>enemy(k,xx,GY,{yb:GY-25})));
    await reach(2300);
    // ---------- ฉากเดียวที่มีตัวร้ายหลอกลวง ----------
    sceneStart(2560);LV.boss={boss:1,name:'ท่านเสียงทอง',x:2700,y:GY,w:70,h:120,hp:1,max:1,t:0,hit:0,vuln:0,face:-1,look:'tower',bar:0,touch:0,draw:drawBoss};
    await talk([['sys','บนเวทีหอประชุม ลำโพงยักษ์สีทองตั้งตระหง่าน จอใหญ่สว่างขึ้นเอง'],['gold','ยินดีต้อนรับ! ข้าคือท่านเสียงทอง ผู้ขาย “เสียงสำเร็จรูป” และ “อำนาจวิเศษ”'],
      ['gold','พรุ่งนี้ไม่ต้องเล่นจริงหรอก กดเปิดเสียงข้า แล้วทำท่าเหมือนเล่น ไม่ต้องซ้อมสักวัน!'],['gold','ศรัทธาข้า แล้วเจ้าจะมีอำนาจวิเศษ อยู่เหนือทุกคนในวง'],['gold',myReason().lie]]);
    const i=await choose('ท่านเสียงทองยื่นข้อเสนอ',['“มีหลักฐานไหม? ฉันจะถามเพื่อนกับครูก่อน”','“ฟังดูง่ายดี… รับไว้ก่อนก็ได้”']);
    if(i===0){await talk([['me','มีหลักฐานไหม? ฉันจะถามเพื่อนกับครูก่อน'],['gold','ห… หลักฐาน? ไม่ต้องหรอก รีบ ๆ ตัดสินใจเถอะ ของมีจำนวนจำกัด!'],['pian','เร่งให้รีบ ไม่ยอมให้ถามใคร… แบบนี้น่าสงสัยมาก!']]);star(3,'ถามหาหลักฐานก่อนเชื่อ')}
    else await talk([['me','ฟังดูง่ายดี…'],['mateo','เดี๋ยว! ถ้าไม่ต้องซ้อม แล้วที่พวกเราตามหาเสียงกันมาทั้งแม่สอดคืออะไรล่ะ'],['me','…จริงด้วย เกือบเชื่อแล้ว']]);
    await talk([['waen','(วิ่งตามมา) ฉันว่าเสียงนี้แปลก ๆ มีรอยต่อเหมือนเอาหลายเสียงมาตัดต่อกัน'],['pian','มาพิสูจน์กัน! ดูรูปคลื่นเสียงแล้วหารอยตัดต่อ']]);sceneEnd();
    await decode({title:'จับโป๊ะท่านเสียงทอง',q:'ทั้งสองคลิปเป็นเสียง “ท่านเสียงทอง” คลิปไหนเป็นเสียงที่ตัดต่อมา',kinds:['noise','gap','pitch']});
    sceneStart(2560);
    await talk([['sys','จอใหญ่กะพริบ แล้วขึ้นหน้าเพจขาย “คอร์สเก่งทันที ไม่ต้องซ้อม”'],['gold','อ… อย่าดูตรงนั้น!'],['tang','(เดินขึ้นเวที) เสียงทองคือคลิปตัดต่อจากเพจขายคอร์ส ครูกดรายงานเพจไปแล้วครับ'],['pian','ไม่มีอำนาจวิเศษอะไรเลย! มาไล่ลำโพงขี้โม้ออกจากเวทีด้วยเสียงดนตรีจริงกัน!']]);sceneEnd();
    LV.boss=null;learn('media');
    await battleFight({name:'ท่านเสียงทอง',sub:'ลำโพงขี้โม้บนเวทีหอประชุม',x:2700,arena:[2240,LV.w],look:'tower',insts:['khong','ranad','klong'],hp:120,keepLock:1});
    sceneStart(2600);actor('pian',2700,-1,{draw:(a,xx)=>{R(g,'#c8962a',xx-6,GY-14,12,14);disc(g,'#3a2a14',xx,GY-8,4);disc(g,'#c89a3a',xx,GY-8,2);R(g,'#fff6d0',xx-4,GY-14,2,2);R(g,'#fff6d0',xx+2,GY-14,2,2)}});
    await talk([['sys','ลำโพงยักษ์หดเล็กลงเรื่อย ๆ จนเหลือลำโพงจิ๋วตัวเท่ากำปั้น'],['gold','(เสียงเล็กแหลม) ข… ขอโทษ ข้าแค่อยากให้คนซื้อคอร์ส…'],['mateo','งั้นมาฟังพวกเราเล่นจริง ๆ ดูสิ'],['pian','ลำโพงจิ๋วตัวนี้ ให้มาเป็นลำโพงประจำห้อง 512 ดีไหม จะได้ฟังเสียงจริงทุกวัน'],['tang','พร้อมนะทุกคน ซ้อมใหญ่ “เพลงเกม” ทั้งวง!']]);
    sceneEnd();
    await concert(['khong','ranad','khlui','thon','taphon','klong','pinae'],'เพลงเกม');
    voiceBack(7,['mateo'],this.inst);await waitS(2);
    return 'ending'}};

/* ====================================================================
   ตอนจบ: งานแสดงปลายเทอม → สรุปที่บอร์ด → งานเลี้ยงที่ห้วยขี้เท่อ
   ==================================================================== */
async function ending(){
  LV=newLevel(1240);const [c,x]=mk(LV.w,H);drawRoom512(x,seeded(3),0);LV.L.world=c;LV.L.sky=skyCanvas([[0,'#7fb6e6'],[1,'#eef6fb']],'rgba(255,255,255,.8)',0,9);LV.floor=floorMaker([{x0:0,x1:ROOM_END,k:'room'}]);
  P=newPlayer(640);P.hide=1;P.frozen=1;cam=400;mode='cut';LV.camFocus=700;
  [['tang',740,-1],['maha',560,1],['mateo',590,1],['che',620,1],['jao',500,1],['foo',470,1],['waen',440,1],['yum',410,1],['captain',650,1],['kaimuk',800,-1],['ing',824,-1],['ice',848,-1],['luwa',880,-1],['pob',910,-1],['me',680,1]].forEach(([id,xx,f])=>actor(id,xx,f));
  await fade(0,.8);
  const tot=Object.values(SAVE.stars||{}).reduce((a,b)=>a+b,0);
  await talk([['sys','วันงานแสดงปลายเทอม หอประชุมเต็มไปด้วยผู้ปกครอง เพื่อน ๆ และชาวบ้านจากแม่จะเราและตลาดริมเมย'],['captain','(พิธีกร) ขอต้อนรับทุกท่าน… สู่การแสดงของชมรมดนตรีไทยสรรพวาทิตครับ!'],
    ['sys','พบธรรมเป่าปี่แนนำเข้าเวที กลองหลวงของครูโอดังกระหึ่ม ตามด้วยฆ้อง ระนาด ขลุ่ย ซอ โทน และเสียงร้อง พี่ดาวิกับลุงหม่องขึ้นมาเล่นร่วมกันตอนท้าย'],
    ['sys','หลังการแสดง ที่ห้อง 512 กระดาษ “ฉันเล่นดนตรีเพื่อ…” ของทุกคนแปะเรียงกันครบบนบอร์ด'],
    ['tang','ครูขอสรุปสั้น ๆ นะ'],['tang','เสียงหายเพราะเราเล่นซน แต่เสียงกลับมาเพราะทุกคนช่วยกัน ไม่มีใครทำสำเร็จได้คนเดียว'],
    ['tang','ไม่มีอำนาจวิเศษ ไม่มีเสียงสำเร็จรูป ใครสัญญาทางลัด ให้ถามว่ามีหลักฐานไหม แล้วมาเล่าให้เพื่อนกับครูฟัง'],
    ['tang','ในวงนี้ทุกคนเท่ากัน ใครจะเก่งแค่ไหนขึ้นกับความพยายามที่ซ้อมมา ไม่ได้ขึ้นกับใครมาเสกให้'],
    ['tang','และไม่ว่าจะเล่นเพื่อผ่อนคลาย เพราะรัก เพราะอยากเป็นครู หรืออยากมีเพื่อน ทุกเหตุผลมีที่ในวงเหมือนกันหมด'],
    ['sys','ดาวคุณธรรมที่ได้ '+tot+' ดวง · บันทึกความรู้ '+(SAVE.notes||[]).length+' เรื่อง · ความสามัคคีของวง '+(SAVE.unity||0)+'/100']]);
  await fade(1,.6);LV.acts=[];const [c2,x2]=mk(LV.w,H);x2.fillStyle='#3a5a3a';x2.fillRect(0,0,LV.w,H);drawHuaiKhiThoe(x2,0,LV.w,seeded(91));LV.L.world=c2;LV.L.sky=skyCanvas([[0,'#f0905a'],[1,'#ffd8a0']],0,0,93);LV.floor=floorMaker([{x0:0,x1:LV.w,k:'board'}]);LV.drawFG=cc=>drawLanternFG(cc,0,LV.w);
  LV.drawMid=cc=>drawBBQ(g,700-cc,GY);
  [['kruo',770,-1],['tang',650,1],['pob',810,-1],['luwa',840,-1],['maha',560,1],['mateo',590,1],['jao',500,1],['ice',530,1],['foo',470,1],['yum',730,1]].forEach(([id,xx,f])=>actor(id,xx,f,{big:id==='kruo'}));
  await fade(0,.6);
  await talk([['sys','คืนนั้น ห้วยขี้เท่อ อ.แม่ระมาด โคมแดงสว่างไสวทั้งสะพาน'],['kruo','ในที่สุด! ตังค์มางานเลี้ยงครูโอซะที!'],['tang','สัญญาแล้วนี่ครับ วันนี้ครูไปด้วย'],
    ['kruo','ยกแก้วน้ำสีอำพัน… เอ๊ย น้ำมะพร้าว! เพื่อเสียงดนตรีของเด็ก ๆ !'],['yum','หมูกระทะ! นี่คือรางวัลที่ดีที่สุดในโลก'],['pob','ครูโอครับ ปีหน้าเอากลองมาฝากอีกนะ'],['jao','แต่ห้ามแปะป้ายอาถรรพ์แล้วนะครับ!'],
    ['pian','เจ็ดเสียงที่หายไปกลับมาครบแล้ว… แล้วก็ได้เพื่อนเพิ่มอีกเยอะเลย!']]);
  SAVE.fin=1;SAVE.done[7]=1;store();
}
