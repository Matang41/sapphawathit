/* ====================================================================
   ตำนานสรรพวาทิต ภาคแรก · โหมดเดินเล่นอิสระ (p1/free.js)
   ปลดล็อกเมื่อจบบทที่ 3 · เซฟแยกที่ spw_pisat_free (ไม่แตะเซฟบทที่ 1–3)
   · เดินทางไปมาระหว่างโรงเรียนสรรพวิทยาคม (ใช้สภาพหลังจบบทที่ 2) กับชุมชนแม่โกนเกน (หลังจบบทที่ 3) ด้วยรถสองแถว
   · นาฬิกาในเกม: กลางวัน → ตอนเย็น → กลางคืน · นอนพักข้ามเวลาได้
   · เควสสุ่มจากคนที่มี “!” · ครูโอโผล่ช่วงเย็นมาถามหาครูตังค์
   · ตำนานผีโรงเรียน (กลางคืน): ผียามอาคาร 2 · ผีคุณตาอาคาร 3 · ผีนางรำครึ่งตัวอาคาร 5
   · เหตุการณ์ตามปฏิทิน: วันไหว้ครู → กีฬาสี · สมุดตำนาน อีสเตอร์เอก ร้านค้า ตู้เสื้อผ้า อัลบั้มภาพ ฉากจบ 100%
   ตำนานผีเป็นเรื่องแต่งในเกม · ข้อมูลโรงเรียนและแม่สอดในสมุดตำนานเรียบเรียงจากแหล่งสาธารณะ
   พัฒนาโดย นายนนทพัทธ์ วงค์มูล 2026
   ==================================================================== */
'use strict';
(function(){
const FK='spw_pisat_free';
let F=null,ON=false;
const fsave=()=>{if(!F)return;try{localStorage.setItem(FK,JSON.stringify(F))}catch(e){}};
const fload=()=>{try{return JSON.parse(localStorage.getItem(FK)||'null')}catch(e){return null}};
const c3done=()=>{const v=load(3);return !!(v&&v.done)};
const clone=o=>JSON.parse(JSON.stringify(o));
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SCH=()=>ON&&F.cur==='sch',VILL=()=>ON&&F.cur==='vil';
const onWorld=()=>ON&&S&&(S.map==='world'||S.map==='village');

/* ---------------- นาฬิกา ---------------- */
const PHN=['กลางวัน','ตอนเย็น','กลางคืน'];
const hour=()=>Math.floor(F.clock/60)%24;
const PH=()=>{const h=hour();return h>=5&&h<16?0:h>=16&&h<19?1:2};
const hhmm=()=>String(hour()).padStart(2,'0')+':'+String(Math.floor(F.clock%60)).padStart(2,'0');
const midnight=()=>{const m=F.clock%1440;return m>=23*60+30||m<30};
function moonFull(){const d=new Date(),ref=Date.UTC(2000,0,6,18,14),syn=29.530588853*864e5,age=((d.getTime()-ref)%syn+syn)%syn/864e5;return Math.abs(age-14.77)<1.6}

/* ---------------- ข้อมูล ---------------- */
const LORE={
  L1:['กำเนิดสรรพวิทยาคม','โรงเรียนสรรพวิทยาคม อำเภอแม่สอด จังหวัดตาก ก่อตั้งเมื่อ 30 พฤศจิกายน 2458 สีประจำโรงเรียนคือม่วง–เหลือง ปรัชญาของโรงเรียนคือ “ขนฺตี หิตสุขาวหา” แปลว่า ความอดทนนำมาซึ่งประโยชน์และความสุข'],
  L2:['ขุนสามชนแห่งเมืองฉอด','อาคาร 4 ของโรงเรียนชื่อ “ขุนสามชน” ตามชื่อเจ้าเมืองฉอดในศิลาจารึกพ่อขุนรามคำแหง ที่เล่าว่าพ่อขุนรามคำแหงชนช้างกับขุนสามชน นักประวัติศาสตร์ยังถกเถียงกันว่าเมืองฉอดอยู่ตรงไหน แต่คนแม่สอดผูกพันกับชื่อนี้มาก อาคาร 1 ก็ชื่อ “ศรีเมืองฉอด”'],
  L3:['พะวอ ผู้เฝ้าด่าน','อาคาร 6 ชื่อ “พระวอมิ่งขวัญ” ชวนให้นึกถึงเจ้าพ่อพะวอ ที่คนแม่สอดนับถือ เล่ากันว่าท่านเป็นนักรบชาวกะเหรี่ยง เป็นนายด่านแม่ละเมาในสมัยสมเด็จพระเจ้าตากสิน และสู้จนเสียชีวิตเมื่อข้าศึกบุกมา ผู้ขับรถผ่านศาลบนถนนตาก–แม่สอดนิยมบีบแตรแสดงความเคารพ'],
  L4:['แม่น้ำเมยและสะพานมิตรภาพ','แม่น้ำเมยไหลขึ้นทางเหนือ เป็นเส้นพรมแดนไทย–เมียนมา ที่แม่สอดมีสะพานมิตรภาพไทย–เมียนมาข้ามแม่น้ำเมย และตลาดริมเมยที่คนหลายภาษามาค้าขายกัน ชุมชนแม่โกนเกนก็อยู่ริมแม่น้ำสายนี้'],
  L5:['หินสมดุลที่ดอยดินจี่','วัดพระธาตุดอยดินจี่ในแม่สอดมีหินก้อนใหญ่ตั้งอยู่บนหน้าผาอย่างสมดุล มองลงไปเห็นแม่น้ำเมย เหมือนวงดนตรีที่ทุกเสียงต้องสมดุลกันพอดี'],
  L6:['ตานก๋วยสลากกับกลองหลวง','ตานก๋วยสลากเป็นประเพณีทำบุญของภาคเหนือ ชาวบ้านจัดของใส่ก๋วย (ตะกร้าไม้ไผ่) ถวายวัดด้วยการจับสลาก ขบวนแห่ครัวตานมีวงกลองหลวงนำ ใช้กลองหลวง ฉาบ และฆ้อง ผู้ตีพันมือด้วยผ้า'],
  L7:['ตำนานผียามอาคาร 2','รุ่นพี่เล่าว่าลุงยามคนแรกของโรงเรียนเดินตรวจทุกคืน เป่านกหวีดเป็นจังหวะเดียวกันทุกคืน เพราะอยากให้เด็ก ๆ กลับบ้านก่อนมืด ใครตีจังหวะตรวจเวรของลุงได้ครบ ลุงจะยิ้มแล้วหายไปพร้อมไฟฉาย (เรื่องเล่าในเกม)'],
  L8:['ตำนานผีคุณตาอาคาร 3','เล่ากันว่ามีคุณตาครูดนตรีคนหนึ่งสอนเพลงเก่าให้เด็ก ๆ ที่อาคาร 3 เพลงยังสอนไม่จบ ท่านจึงนั่งรอศิษย์มาต่อเพลงให้จบทุกคืน ทำนองของท่านช้าแต่แอบเปลี่ยนกลางวรรค ต้องฟังให้ดี (เรื่องเล่าในเกม)'],
  L9:['ตำนานผีนางรำอาคาร 5','นางรำคนหนึ่งซ้อมรำที่อาคาร 5 ทุกเย็น แต่วันแสดงจริงฝนตกหนักจนงานเลิก เธอเลยยังรอรำกับวงดนตรีสักครั้ง ถ้าวงตีให้ตรงท่ารำของเธอ เธอจะได้รำจนจบเพลง (เรื่องเล่าในเกม)'],
  L10:['พานไหว้ครู','พานไหว้ครูมีดอกไม้ที่มีความหมาย หญ้าแพรกแทนสติปัญญาที่งอกงามแพร่ไปไว ดอกมะเขือแทนความนอบน้อม ดอกเข็มแทนปัญญาเฉียบแหลม ข้าวตอกแทนความรู้ที่แตกฉาน โรงเรียนส่วนใหญ่จัดวันไหว้ครูวันพฤหัสบดีหลังเปิดภาคเรียนในเดือนมิถุนายน'],
  L11:['กีฬาสีม่วง–เหลือง','กีฬาสีไม่ได้มีแค่การแข่ง ขบวนพาเหรด กองเชียร์ และวงดนตรีทำให้ทุกสีกลายเป็นโรงเรียนเดียวกัน ม่วงและเหลืองคือสีของสรรพวิทยาคม'],
  L12:['ภาพนักเรียนรุ่นแรก','ในตู้เก่าห้อง 512 คืนพระจันทร์เต็มดวง มีรูปถ่ายขาวดำเลือน ๆ ของนักเรียนกลุ่มหนึ่งยืนหน้าอาคารไม้ หลังรูปเขียนว่า “ปีแรก 2458” (ของแต่งในเกม)'],
  L13:['วงตอบตอนเที่ยงคืน','ถ้าตีฆ้องห้อง 512 ตอนเที่ยงคืน จะมีเสียงฆ้องวงหนึ่งตอบกลับมาเบา ๆ เหมือนรุ่นพี่ทุกรุ่นยังซ้อมอยู่ด้วยกัน (เรื่องเล่าในเกม)'],
  L14:['ต้นไม้ร้องเพลง','ต้นไม้ใหญ่ข้างป้อมยามได้ยินวงซ้อมมาหลายสิบปี ถ้าคุยกับมันบ่อย ๆ มันจะฮัมทำนองที่จำได้ให้ฟัง (เรื่องเล่าในเกม)'],
  L15:['เพี้ยนน้อยซ่อนหา','เพี้ยนน้อย มาสคอตห้อง 512 ชอบเล่นซ่อนหาตอนเย็น ใครหาเจอครบสามครั้ง มันจะยอมเล่าความลับของห้อง 512 (เรื่องเล่าในเกม)']};
const EGGS={midnight:'ตีฆ้องตอนเที่ยงคืน',moon:'ตู้เก่าคืนพระจันทร์เต็มดวง',tree:'ต้นไม้ร้องเพลง',mini:'จับเพี้ยนน้อยครบ 3 ครั้ง',elephant:'เงาช้างศึกที่อาคาร 4',dawn:'แสงแรกที่เจดีย์'};
const TRIVIA=[
  ['โรงเรียนสรรพวิทยาคมก่อตั้งเมื่อปีใด',['พ.ศ. 2458','พ.ศ. 2475','พ.ศ. 2500'],0,'L1'],
  ['สีประจำโรงเรียนสรรพวิทยาคมคือสีอะไร',['ม่วง–เหลือง','แดง–ขาว','เขียว–ทอง'],0,'L1'],
  ['“ขนฺตี หิตสุขาวหา” มีความหมายว่าอะไร',['ความอดทนนำมาซึ่งประโยชน์และความสุข','ความรู้คู่คุณธรรม','เรียนดี กีฬาเด่น'],0,'L1'],
  ['ขุนสามชน ชื่ออาคาร 4 เป็นเจ้าเมืองไหนในศิลาจารึก',['เมืองฉอด','เมืองตาก','เมืองแพร่'],0,'L2'],
  ['ตามศิลาจารึก ใครชนช้างกับขุนสามชน',['พ่อขุนรามคำแหง','สมเด็จพระเจ้าตากสิน','สมเด็จพระนเรศวร'],0,'L2'],
  ['คนแม่สอดเล่าว่าเจ้าพ่อพะวอเป็นใคร',['นักรบชาวกะเหรี่ยง นายด่านแม่ละเมา','พ่อค้าชาวจีน','เจ้าเมืองเชียงใหม่'],0,'L3'],
  ['ผู้ขับรถผ่านศาลเจ้าพ่อพะวอนิยมทำอะไร',['บีบแตรแสดงความเคารพ','จอดเปลี่ยนยางรถ','ร้องเพลงชาติ'],0,'L3'],
  ['สะพานมิตรภาพไทย–เมียนมาที่แม่สอดข้ามแม่น้ำอะไร',['แม่น้ำเมย','แม่น้ำปิง','แม่น้ำโขง'],0,'L4'],
  ['วัดพระธาตุดอยดินจี่มีอะไรโดดเด่น',['หินสมดุลบนหน้าผามองเห็นแม่น้ำเมย','เจดีย์ใต้น้ำ','ระฆังใหญ่ที่สุดในโลก'],0,'L5'],
  ['ตานก๋วยสลากถวายของกับวัดด้วยวิธีใด',['จับสลาก','ประมูล','แข่งเรือ'],0,'L6'],
  ['วงกลองหลวงประกอบด้วยเครื่องอะไร',['กลองหลวง ฉาบ ฆ้อง','ระนาด ขลุ่ย ซอ','กีตาร์ กลองชุด เบส'],0,'L6'],
  ['ในพานไหว้ครู ดอกมะเขือแทนอะไร',['ความนอบน้อม','ความร่ำรวย','ความเร็ว'],0,'L10'],
  ['ระนาดเอกมีกี่ลูก',['21 ลูก','16 ลูก','12 ลูก'],0,null],
  ['เสียง “ฉับ” ของฉิ่งคือจังหวะแบบไหน',['จังหวะหนัก','จังหวะเบา','ไม่ใช่จังหวะ'],0,null]];
const OUTFITS={
  def:{n:'ชุดนักเรียนเดิม',c:0},
  purple:{n:'ชุดกีฬาสีม่วง',c:30,o:{shirt:'#7a3ab0',shade:'#5a2a88',pants:'#2a2238',polo:'#f2c14e'}},
  yellow:{n:'ชุดกีฬาสีเหลือง',c:30,o:{shirt:'#f2c14e',shade:'#c89a2a',pants:'#3a2a5a',polo:'#7a3ab0'}},
  band:{n:'เสื้อวงสรรพวาทิต',c:45,o:{shirt:'#2a1a40',shade:'#1a1028',pants:'#1c2235',polo:'#f2c14e',pocket:'#f2c14e'}},
  thai:{n:'ชุดไทยออกงาน',c:60,o:{shirt:'#f0e6d0',shade:'#c8b890',pants:'#7a2a3a',polo:'#c8a040'}},
  pajama:{n:'ชุดนอนลายข้าวแต๋น',c:25,o:{shirt:'#f3dfae',shade:'#c0601a',pants:'#f3dfae',pocket:'#c0601a'}}};
const SHOPI={milk:6,moo:9,yadom:12};

/* ---------------- เริ่มโหมดอิสระ ---------------- */
function synth2(){const v=fresh2();Object.assign(v,{ch:2,intro:1,done:1,keys:21,phase:0,map:'world'});v.unlocked=CAST_ORDER.slice();MON2.forEach(m=>{v.beat[m.k]=1});v.beat.khun=1;return v}
function newF(){
  const c2=load(2),c3=load(3);
  const sch=c2&&c2.done?clone(c2):synth2();Object.assign(sch,{ch:2,done:1,intro:1,map:'world',x:15*T+8,y:19*T+12,dir:'d',phase:0});sch.unlocked=CAST_ORDER.slice();sch.keys=21;MON2.forEach(m=>{sch.beat[m.k]=1});sch.beat.khun=1;
  if(!sch.party||!sch.party.length)sch.party=['maha','pob','foo'];sch.party=sch.party.filter(k=>k!=='luwa');if(!sch.party.length)sch.party=['maha','pob','foo'];sch.lead=sch.party[0];
  const vil=clone(c3);Object.assign(vil,{ch:3,done:1,intro:1,map:'village',x:22*T+8,y:38*T+4,dir:'u'});vil.unlocked=CAST_ORDER3.slice();vil.got3=vil.got3||{beater:1,chab:1,mong:1,dance:1};
  const lv=Math.max(sch.lv||1,vil.lv||1);sch.lv=vil.lv=lv;sch.xp=vil.xp=0;const bag={milk:2,moo:2,yadom:2};sch.bag=clone(bag);vil.bag=clone(bag);
  return {v:1,cur:'sch',sch,vil,clock:7*60,day:1,coins:20,lore:{},eggs:{},ghosts:{},ev:{wk:{st:0},sp:{st:0}},album:[],outfit:'def',own:{def:1},rq:{},mini:0,tree:0,met:{},trv:0,fin:0}}
function bindS(){S=F[F.cur];S.ch=F.cur==='vil'?3:2;fixSave(S);if(S.ch===3){['luwa','pob'].forEach(k=>{if(!S.party.includes(k))S.party.unshift(k)});S.unlocked=CAST_ORDER3.slice()}else{S.unlocked=CAST_ORDER.slice();S.party=S.party.filter(k=>k!=='luwa');if(!S.party.length)S.party=['maha','pob','foo']}S.lead=S.party[0];S.hpMax=hpMaxCalc()}
function startFree(){
  if(!c3done()){alert('ปลดล็อกเมื่อเล่นบทที่ 3 จบ');return}
  audio();$('#title').classList.add('hide');F=fload()||newF();ON=true;bindS();if(window.LIFE)LIFE.onStart();F.lastPh=PH();applyOutfit();
  mode='world';prerenderInterior();showHud(true);setPad(true);startMusic();hud();
  setTimeout(async()=>{if(!F.intro){F.intro=1;fsave();busy=true;await talk([[null,'โหมดเดินเล่นอิสระ · หลังงานตานก๋วยสลาก ชมรมสรรพวาทิตกลับมาใช้ชีวิตปกติ'],['pob','ผู้จัดการขอประกาศ! ต่อจากนี้เราไปไหนก็ได้ ทั้งโรงเรียนและแม่โกนเกน นั่งรถสองแถวไปมา'],['maha','ตกเย็นอาจมีคนมาถามหาครูตังค์… ส่วนกลางคืน รุ่นพี่บอกว่าอาคาร 2 อาคาร 3 กับอาคาร 5 มีตำนานอยู่'],[null,'เคล็ดลับ: คนที่มีเครื่องหมาย “!” มีเควสให้ · ป้ายรถสองแถวอยู่หน้าเซเว่นริมถนนใหญ่ · นอนพักข้ามเวลาได้ที่มุมห้อง 512 · เปิดสมุดตำนานและอัลบั้มได้จากเมนูพัก']]);busy=false}banner(placeName()+' · '+dayLbl()+' · '+hhmm())},400)}
const dayLbl=()=>window.LIFE?LIFE.dateShort():'วันที่ '+F.day;
const placeName=()=>F.cur==='vil'?'ชุมชนแม่โกนเกน':'โรงเรียนสรรพวิทยาคม';

/* ---------------- บันทึก: เขียนลงเซฟโหมดอิสระแทนเซฟบท ---------------- */
const _save=save;
window.save=function(){if(ON){F[F.cur]=S;fsave();return}_save()};

/* ---------------- หน้าต่าง (ตัวเลือก รายการ) ---------------- */
const ov=document.createElement('div');ov.id='frOv';ov.className='ov hide';ov.innerHTML='<div class="card box"></div>';(document.querySelector('#stage')||document.body).appendChild(ov);
const card=ov.querySelector('.card');
const css=document.createElement('style');css.textContent=`#frOv .card{max-width:540px}#frOv .lst{display:grid;gap:6px;margin:8px 0}#frOv .lst .btn{margin:0;text-align:left;font-size:15px}#frOv .lst .btn small{display:block;opacity:.75;font-size:12px}
#frOv .lore{border:2px solid #4a3570;border-radius:8px;background:#22163a;padding:8px 10px;margin:6px 0;font-size:14px;line-height:1.5}#frOv .lore b{color:#f2c14e}#frOv .no{opacity:.4}
#frOv .alb{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}#frOv .alb figure{margin:0;background:#22163a;border:2px solid #4a3570;border-radius:8px;padding:4px;font-size:12px;text-align:center}#frOv .alb img{width:100%;image-rendering:pixelated;border-radius:4px}
#frOv .chk{list-style:none;padding:0;margin:6px 0}#frOv .chk li{padding:4px 0;font-size:14px}`;document.head.appendChild(css);
let ovRes=null;
function openOv(html,onClick){card.innerHTML=html;ov.classList.remove('hide');for(const k in keys)keys[k]=0;card.scrollTop=0;return new Promise(r=>{ovRes=r;card.onclick=e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;try{sfx.blip()}catch(x){}if(onClick&&onClick(b.dataset.a,b)===false)return;close(b.dataset.a)}})}
function close(v){ov.classList.add('hide');const r=ovRes;ovRes=null;if(r)r(v)}
async function choose(title,opts,note){const v=await openOv('<h2>'+esc(title)+'</h2>'+(note?'<p style="font-size:14px">'+note+'</p>':'')+'<div class="lst">'+opts.map((o,i)=>'<button class="btn" data-a="'+i+'"'+(o.off?' disabled':'')+'>'+esc(o.t||o)+(o.s?'<small>'+esc(o.s)+'</small>':'')+'</button>').join('')+'</div>');return +v}

/* ---------------- ตัวช่วยแผนที่ ---------------- */
function spotNear(tx,ty){if(window.LIFE&&LIFE.freeReach){const p=LIFE.freeReach(tx,ty);if(p)return {x:p.x,y:p.y}}for(let r=0;r<8;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=(tx+dx)*T+8,y=(ty+dy)*T+12;if(!blocked(x,y))return {x,y}}return {x:tx*T+8,y:ty*T+12}}
const SP={};function spot(key,tx,ty){if(!SP[key])SP[key]=spotNear(tx,ty);return SP[key]}
const near=(p,r)=>Math.hypot(S.x-p.x,S.y-p.y)<(r||20);
async function walkFlash(){flash('#000',300);await sleep(250)}
function coins(n,why){F.coins=(F.coins||0)+n;fsave();banner('🪙 +'+n+' เหรียญชมรม'+(why?' · '+why:''),2400);try{sfx.get()}catch(e){}}
function lore(id){if(!LORE[id]||F.lore[id])return;F.lore[id]=1;fsave();setTimeout(()=>banner('📜 สมุดตำนานหน้าใหม่: '+LORE[id][0],3200),500);check100()}
function egg(id){if(F.eggs[id])return;F.eggs[id]=1;fsave();setTimeout(()=>banner('🥚 อีสเตอร์เอก! '+EGGS[id],3200),300);check100()}
function snap(cap){try{const src=$('#cv');const c=document.createElement('canvas');c.width=240;c.height=Math.round(240*src.height/src.width);c.getContext('2d').drawImage(src,0,0,c.width,c.height);F.album=(F.album||[]).filter(a=>a.cap!==cap);F.album.push({cap,img:c.toDataURL('image/jpeg',.72),day:F.day});F.album=F.album.slice(-14);fsave();setTimeout(()=>banner('🖼️ เก็บภาพที่ระลึก: '+cap,2600),900)}catch(e){}}
async function fight(key,def){ENEMY[key]=def;return await battle(key)}

/* ---------------- ฟังแล้วตีตามทำนองตายตัว (ใช้กับซ้อมเพลงในเหตุการณ์) ---------------- */
async function echoSong(base,name,ns,show){
  ns=ns.map(g=>clamp(g-3,0,7));/* ลูกฆ้อง 3–10 (ด–ดํ) → แป้น 0–7 */
  const PL=4;let ptr=0,ph=0,ok=0,tot=0;const nph=Math.ceil(ns.length/PL);
  const e=Object.assign({},ENEMY[base]||ENEMY.note,{k:base,n:name,hp:100,atk:4,phr:[PL,PL],gap:.55,show:show||PL,slot:.32,echoOnly:1});['item','item3','boss','final','haze','call','ghost'].forEach(k=>delete e[k]);
  e.seqFn=(seq,len)=>{seq.length=0;for(let i=0;i<len;i++)seq.push(ns[(ptr+i)%ns.length]);ptr+=len;ph++;e.show=ph<=2?len:show||2;if(BT)bmsg('วรรคที่ '+ph+'/'+nph)};
  e.onEcho=res=>{res.forEach(v=>{tot++;if(v===1)ok++});if(BT){BT.hp=Math.max(0,Math.round(BT.max*(1-Math.min(1,ptr/ns.length))));ebar();if(ptr>=ns.length)BT.songDone=1}};
  const r=await fight('frSong',e);return r==='win'?(tot?ok/tot:1):-1}

/* ---------------- ผีโรงเรียน: ภาพ ---------------- */
const GH={
  gYam:{n:'ผียามอาคาร 2',bld:2,tx:31,ty:33,lore:'L7'},
  gTa:{n:'ผีคุณตาอาคาร 3',bld:3,tx:9,ty:20,lore:'L8'},
  gRam:{n:'ผีนางรำครึ่งตัวอาคาร 5',bld:5,tx:21,ty:19,lore:'L9'}};
function drawGhost(g,kind,x,y,t,s){s=s||1;const R=(c,a,b,w,h)=>{g.fillStyle=c;g.fillRect(Math.round(x+a*s),Math.round(y+b*s),Math.ceil(w*s),Math.ceil(h*s))};const bob=Math.round(Math.sin(t*2)*3),fl=.75+.2*Math.sin(t*5);
  g.save();g.globalAlpha*=fl;
  if(kind==='gYam'){// ลุงยามตัวสูง ไฟฉาย หมวก นกหวีด
    R('#bfe4ff',-11,-58+bob,22,50);R('#26407a',-11,-44+bob,22,30);R('#1a2c5a',-11,-20+bob,22,6);R('#f2c14e',-3,-40+bob,6,3);
    R('#e8f6ff',-9,-62+bob,18,16);R('#26407a',-12,-66+bob,24,6);R('#1a2c5a',-8,-70+bob,16,5);R('#f2c14e',-2,-69+bob,4,3);
    R('#0a1428',-6,-57+bob,4,4);R('#0a1428',2,-57+bob,4,4);R('#9fe8ff',-5,-56+bob,2,2);R('#9fe8ff',3,-56+bob,2,2);R('#0a1428',-3,-50+bob,6,2);
    R('#c0c0c0',11,-38+bob,8,4);g.fillStyle='rgba(255,250,200,'+(.18+.1*Math.sin(t*7))+')';g.beginPath();g.moveTo(x+19*s,y+(-36+bob)*s);g.lineTo(x+60*s,y+(-56+bob)*s);g.lineTo(x+60*s,y+(-10+bob)*s);g.fill();
    for(let i=0;i<4;i++)R('rgba(191,228,255,'+(.5-i*.12)+')',-9+i*2,-8+bob+i*3,18-i*4,3)}
  else if(kind==='gTa'){// คุณตาผมขาว เครายาว เสื้อม่อฮ่อม ถือซอ
    R('#d8e8d0',-12,-46+bob,24,40);R('#2a3a6a',-12,-34+bob,24,26);R('#1a2448',-12,-12+bob,24,4);
    R('#f0e0c8',-9,-56+bob,18,14);R('#ffffff',-10,-60+bob,20,5);R('#ffffff',-11,-54+bob,3,8);R('#ffffff',8,-54+bob,3,8);R('#ffffff',-6,-44+bob,12,10);
    R('#2a2010',-6,-52+bob,4,2);R('#2a2010',2,-52+bob,4,2);R('#8a3a2a',-2,-47+bob,4,1);
    R('#7a4a20',12,-48+bob,3,34);R('#c8a060',10,-20+bob,8,8);R('#e8e0c0',14,-48+bob,1,30);g.fillStyle='#c8a060';g.fillRect(Math.round(x-20*s),Math.round(y+(-30+Math.sin(t*4)*3+bob)*s),Math.ceil(32*s),Math.ceil(2*s));
    for(let i=0;i<4;i++)R('rgba(216,232,208,'+(.5-i*.12)+')',-10+i*2,-6+bob+i*3,20-i*4,3)}
  else{// นางรำครึ่งตัว: ชฎา ชุดรำ มือจีบ ท่อนล่างจางเป็นหมอก
    const sw=Math.sin(t*2.2)*4;R('#f6e0c8',-6,-60+bob,12,12);R('#e8b830',-6,-72+bob,12,10);R('#e8b830',-3,-80+bob,6,8);R('#ff6a8a',-1,-84+bob,2,4);R('#e8b830',-8,-62+bob,2,6);R('#e8b830',6,-62+bob,2,6);
    R('#2a1010',-4,-56+bob,3,2);R('#2a1010',1,-56+bob,3,2);R('#c03050',-2,-51+bob,4,1);
    R('#c03050',-10,-48+bob,20,16);R('#e8b830',-10,-48+bob,20,3);R('#e8b830',-2,-45+bob,4,13);R('#6a1a3a',-10,-34+bob,20,4);
    R('#f6e0c8',-20+sw,-50+bob,10,3);R('#f6e0c8',-22+sw,-56+bob,3,7);R('#e8b830',-23+sw,-58+bob,2,3);R('#f6e0c8',10-sw,-44+bob,10,3);R('#f6e0c8',19-sw,-44+bob,3,-6);
    for(let i=0;i<6;i++)R('rgba(255,200,220,'+(.45-i*.07)+')',-9+i*1.5,-30+bob+i*4,18-i*3,4)}
  g.restore()}
function drawKruoMini(g,x,y,t){// ครูโอแบบเล็กบนแผนที่ (ตัวใหญ่ หัวล้านใต้หมวกแก๊ป)
  const sp=SPR.kruo;if(sp){g.drawImage(sp.d[Math.floor(t*2)%2?1:0],Math.round(x-8),Math.round(y-24));return}}
const _dm=drawMon;
window.drawMon=function(g,kind,x,y,t,s){if(GH[kind])return drawGhost(g,kind,x,y,t,s);if(kind==='kruoB'&&SPR.kruo){s=s||1;const im=SPR.kruo.l[Math.floor(t*3)%2?1:0];g.imageSmoothingEnabled=false;g.drawImage(im,Math.round(x-16*s),Math.round(y-50*s+Math.sin(t*3)*2),Math.round(32*s),Math.round(48*s));return}return _dm(g,kind,x,y,t,s)};

/* ---------------- ตัวละครเพิ่ม: ครูโอ ---------------- */
function buildExtraSprites(){
  SPEC.kruo={skin:'#d9a27a',hair:'#3a2a20',hs:'short',cap:'#1a1a1a',shirt:'#b81e2a',shade:'#7a1018',polo:'#141414',pants:'#c8b07a',shoe:'#5a4030',shorts:'#d9a27a',chub:1};
  const k='kruo';SPR[k]={};for(const dir of ['d','u','r','l']){SPR[k][dir]=[0,1,2].map(f=>{const c=document.createElement('canvas');c.width=16;c.height=24;const g=c.getContext('2d');if(dir==='l'){g.translate(16,0);g.scale(-1,1)}drawChar(g,SPEC[k],dir==='l'?'r':dir,f);g.setTransform(1,0,0,1,0,0);return outline(c)})}
  WHO.kruo={n:'ครูโอ'};Object.keys(GH).forEach(k=>{WHO[k]={n:GH[k].n,img:null}});
  Object.keys(GH).forEach(k=>{const c=document.createElement('canvas');c.width=56;c.height=56;const g=c.getContext('2d');g.fillStyle='#10182a';g.fillRect(0,0,56,56);drawGhost(g,k,28,k==='gRam'?96:84,0,1.05);WHO[k].img=c.toDataURL()})}

/* ---------------- ตู้เสื้อผ้า ---------------- */
let SPEC0=null;
function applyOutfit(){const ks=CAST_ORDER3.slice();if(!SPEC0){SPEC0={};ks.forEach(k=>{if(SPEC[k])SPEC0[k]=clone(SPEC[k])})}
  const o=(OUTFITS[F&&F.outfit]||OUTFITS.def).o;
  ks.forEach(k=>{if(!SPEC[k]||!SPEC0[k])return;const base=clone(SPEC0[k]);if(o){Object.assign(base,o);delete base.tie;delete base.strap}SPEC[k]=base;
    SPR[k]={};for(const dir of ['d','u','r','l']){SPR[k][dir]=[0,1,2].map(f=>{const c=document.createElement('canvas');c.width=16;c.height=24;const g=c.getContext('2d');if(dir==='l'){g.translate(16,0);g.scale(-1,1)}if(SPEC[k].small){g.translate(dir==='l'?16:0,2);g.scale(dir==='l'?-1:1,1)}drawChar(g,SPEC[k],dir==='l'?'r':dir,f);g.setTransform(1,0,0,1,0,0);return outline(c)})}})}

/* ---------------- สิ่งที่โต้ตอบได้ในโหมดอิสระ ---------------- */
const BUS_SCH=()=>spot('busS',44,9),TANG=()=>({x:11*T+8,y:3*T+14}),BED=()=>({x:2*T+8,y:8*T+4});
const TREE=()=>spot('tree',42,11),EL4=()=>spot('el4',37,22),DOME=()=>spot('dome',19,22),FIELDC=()=>spot('fieldc',30,18),STANDS=()=>spot('stands',25,18),INDUS=()=>spot('indus',6,13);
const CHEDI=()=>spot('chedi',33,15),FARM=()=>spot('farm',38,18);
const SCRAPS={sch:[['L1',22,31],['L3',18,11],['L5',46,30]],vil:[['L4',8,24],['L6',30,21]]};
const RQS={};function rqSpots(){if(!RQS[F.cur])RQS[F.cur]=curPicks().map(p=>spotNear(p.x,p.y));return RQS[F.cur]}
const QGIV={sch:['stu','stuG','jao','ice','ing','kaimuk','captain','yum','che','mateo','waen','foo'],vil:['kidG','farmer','kid','dancer','luwa']};
function newRQ(){const sp=rqSpots(),r=Math.random,i=Math.floor(r()*sp.length),pool=QGIV[F.cur];const g={k:pool[Math.floor(r()*pool.length)],x:sp[i].x,y:sp[i].y};
  const types=['fetch','find','trivia','duel','deliver'];const type=types[Math.floor(r()*types.length)];const q={g,type,st:0};
  if(type==='fetch')q.it=r()<.5?'milk':'moo';
  if(type==='find'||type==='deliver'){let j=(i+2+Math.floor(r()*(sp.length-3)))%sp.length;q.t={x:sp[j].x,y:sp[j].y}}
  if(type==='deliver')q.k2=pool[(pool.indexOf(g.k)+1+Math.floor(r()*(pool.length-1)))%pool.length];
  if(type==='find')q.lost=pick(['สมุดโน้ตเล่มเล็ก','ไม้ตีฉิ่ง','ผ้าคาดหัวสีม่วง','ขลุ่ยเลาเล็ก','พวงกุญแจรูปฆ้อง']);
  if(type==='trivia')q.tv=(F.trv++)%TRIVIA.length;
  F.rq[F.cur]=q;fsave()}
const nmOf=k=>(WHO[k]&&WHO[k].n)||'เพื่อน';

function freeTargets(){const L=[];if(!ON||!S)return L;const room=S.map==='room';
  if(room&&!S.rm&&SCH()){L.push({...BED(),lb:'นอนพัก · ข้ามเวลา',act:'frBed'});const ws=F.ev.wk.st,ss=F.ev.sp.st;L.push({...TANG(),lb:'คุยกับครูตังค์',act:'frTang'})}
  if(!onWorld())return L;
  if(SCH()){L.push({...BUS_SCH(),lb:'ป้ายรถสองแถว · ไปแม่โกนเกน',act:'frBusS'});L.push({...TREE(),lb:'ต้นไม้ใหญ่ข้างป้อมยาม',act:'frTree'});
    const ph=PH();Object.keys(GH).forEach(k=>{const p=spot(k,GH[k].tx,GH[k].ty);if(ph===2)L.push({...p,lb:F.ghosts[k]?'คุยกับ'+GH[k].n:'มีบางอย่างอยู่ตรงนั้น…',act:'frGhost',k})});
    if(ph===1&&kruoHere())L.push({...kruoPos(),lb:'คุยกับครูโอ',act:'frKruo'});
    if(miniHere())L.push({...miniPos(),lb:'เอ๊ะ! อะไรแอบอยู่หลังพุ่มไม้',act:'frMini'});
    if(ph===2&&!F.eggs.elephant)L.push({...EL4(),lb:'อาคาร 4 ขุนสามชน · ได้ยินเสียงแปลก ๆ',act:'frEl'})}
  if(VILL()){if(!F.eggs.dawn&&hour()>=5&&hour()<8)L.push({...CHEDI(),lb:'เจดีย์ยามเช้าตรู่',act:'frDawn'})}
  const q=F.rq[F.cur];if(q){if(q.st===0||q.type==='fetch'||q.type==='trivia'||q.type==='duel'||(q.type==='find'&&q.st===2))L.push({x:q.g.x,y:q.g.y,lb:'คุยกับ'+nmOf(q.g.k),act:'frRQ'});if(q.type==='deliver'&&q.st===1)L.push({x:q.t.x,y:q.t.y,lb:'ส่งของให้'+nmOf(q.k2),act:'frRQ2'})}
  evTargets(L);return L}

/* ---------------- ครูโอ / เพี้ยนน้อย (สุ่มต่อวัน) ---------------- */
const dayR=(k)=>{let h=2166136261;const s=k+':'+F.day;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)/4294967296};
const kruoHere=()=>SCH()&&PH()===1&&dayR('kruo')<.75&&F.met.kruoDay!==F.day;
const kruoPos=()=>{const sp=rqSpots();return sp[Math.floor(dayR('kpos')*sp.length)]};
const miniHere=()=>SCH()&&PH()===1&&(F.mini||0)<3&&F.met.miniDay!==F.day&&dayR('mini')<.6;
const miniPos=()=>{const sp=rqSpots();return sp[Math.floor(dayR('mpos')*sp.length)]};

/* ---------------- ฉาก/เหตุการณ์ ---------------- */
async function busTrip(to){
  const v=await choose('ป้ายรถสองแถว',[{t:to==='vil'?'🚐 นั่งรถไปชุมชนแม่โกนเกน':'🚐 นั่งรถกลับโรงเรียนสรรพวิทยาคม',s:'ใช้เวลาราว 40 นาทีในเกม'},{t:'🌙 นั่งรอรถจนถึงช่วงถัดไป',s:'ข้ามเวลาไปตอนเย็นหรือกลางคืน'},{t:'ยกเลิก'}]);
  if(v===1){skipTo(PH()===0?16*60+10:PH()===1?19*60+10:7*60);return}if(v!==0)return;
  busy=true;stopMusic();const sh={lv:S.lv,xp:S.xp,bag:clone(S.bag),easy:S.easy};F[F.cur]=S;
  await busRideRun();F.clock+=40;if(F.clock>=1440){F.clock-=1440;F.day++}
  F.cur=to;Object.assign(F[to],sh);bindS();S.hp=S.hpMax;
  if(to==='vil')goVillage(22*T+8,38*T+4,'u');else{goWorld(BUS_SCH().x,BUS_SCH().y+16,'d')}
  prerenderInterior();hud();startMusic();busy=false;banner(placeName()+' · '+hhmm()+' '+PHN[PH()]);fsave()}
function skipTo(min){if(F.clock%1440>=min){F.day++}F.clock=min;F.lastPh=-1;if(S&&S.ch===2)S.phase=PH();fsave();flash('#000',400);try{sfx.heal()}catch(e){}S.hp=S.hpMax;hud();banner(dayLbl()+' · '+hhmm()+' '+PHN[PH()],2600)}
async function bed(){const v=await choose('นอนพักที่มุมห้อง 512',[{t:'☀️ ตื่นตอนเช้า (07:00)'},{t:'🌇 ตื่นตอนเย็น (16:30)'},{t:'🌙 ตื่นตอนค่ำ (19:30)'},{t:'ยกเลิก'}],'ฟื้นพลังเต็มและข้ามเวลา · เหตุการณ์บางอย่างเกิดแค่บางช่วงเวลา');if(v===0)skipTo(7*60);if(v===1)skipTo(16*60+30);if(v===2)skipTo(19*60+30)}

async function tangTalk(){
  if(await evTang())return;if(window.LIFE&&await LIFE.npcHook('tang'))return;
  const v=await choose('ครูตังค์'+(window.LIFE?' '+LIFE.hstr('tang'):''),[{t:'💬 คุยเล่น'},{t:'🛒 ร้านสหกรณ์ชมรม',s:'ซื้อของด้วยเหรียญชมรม และของขวัญ'},{t:'👕 ตู้เสื้อผ้าชมรม',s:'เปลี่ยนชุดทั้งวง'},{t:'📜 สมุดตำนาน'},{t:'🖼️ อัลบั้มภาพที่ระลึก'},{t:'✅ ความคืบหน้า 100%'},{t:'🎁 ให้ของขวัญครูตังค์'},{t:'ปิด'}]);if(v===6&&window.LIFE){await LIFE.giftTo('tang');return}
  if(v===0)await talk([['tang',pick(['ตอนเย็นถ้ามีใครมาถามหาครู… บอกว่าครูซ้อมอยู่นะ','กลางคืนอย่าเดินแถวอาคาร 2 คนเดียวนะ รุ่นพี่เล่ากันมาเยอะ','ข้าวแต๋นที่ครูแจก… ครูไม่ได้ทอดเองหรอก แต่ใจเต็มร้อยจริง','ปรัชญาโรงเรียนเรา “ขนฺตี หิตสุขาวหา” ความอดทนนำมาซึ่งประโยชน์และความสุข ซ้อมทุกวันก็คือความอดทนนะ'])]]);
  if(v===1)await shop('สหกรณ์ชมรม · ห้อง 512');if(v===2)await wardrobe();if(v===3)await loreBook();if(v===4)await album();if(v===5)await progress()}
async function shop(name){if(window.LIFE)return LIFE.shop(name);while(true){const ks=Object.keys(SHOPI);const v=await choose(name+' · 🪙 '+F.coins,ks.map(k=>({t:ITEMS[k].ic+' '+ITEMS[k].n+' · 🪙 '+SHOPI[k],s:ITEMS[k].d+' · มีอยู่ '+(S.bag[k]||0),off:F.coins<SHOPI[k]})).concat([{t:'เสร็จแล้ว'}]));
  if(v>=ks.length||isNaN(v))return;const k=ks[v];F.coins-=SHOPI[k];S.bag[k]=(S.bag[k]||0)+1;save();hud();try{sfx.get()}catch(e){}}}
async function wardrobe(){const ks=Object.keys(OUTFITS);const v=await choose('ตู้เสื้อผ้าชมรม · 🪙 '+F.coins,ks.map(k=>({t:(F.outfit===k?'✔ ':'')+OUTFITS[k].n+(F.own[k]?'':' · 🪙 '+OUTFITS[k].c),s:F.own[k]?'กดเพื่อใส่ทั้งวง':'ซื้อแล้วใส่ได้ตลอด',off:!F.own[k]&&F.coins<OUTFITS[k].c})).concat([{t:'ปิด'}]));
  if(v>=ks.length||isNaN(v))return;const k=ks[v];if(!F.own[k]){F.coins-=OUTFITS[k].c;F.own[k]=1}F.outfit=k;applyOutfit();fsave();banner('ทั้งวงเปลี่ยนเป็น '+OUTFITS[k].n,2400)}
async function loreBook(){const ks=Object.keys(LORE),n=ks.filter(k=>F.lore[k]).length;await openOv('<h2>📜 สมุดตำนานโรงเรียน '+n+'/'+ks.length+'</h2>'+ks.map(k=>F.lore[k]?'<div class="lore"><b>'+esc(LORE[k][0])+'</b><br>'+esc(LORE[k][1])+'</div>':'<div class="lore no">??? ยังไม่พบ · ลองสำรวจ ตอบคำถามเพื่อน หรือเดินตอนกลางคืน</div>').join('')+'<button class="btn s" data-a="x">ปิด</button>')}
async function album(){const a=F.album||[];await openOv('<h2>🖼️ อัลบั้มภาพที่ระลึก</h2>'+(a.length?'<div class="alb">'+a.map(p=>'<figure><img src="'+p.img+'" alt=""><figcaption>'+esc(p.cap)+' · วันที่ '+p.day+'</figcaption></figure>').join('')+'</div>':'<p>ยังไม่มีภาพ · ชนะตำนานผีหรือผ่านเหตุการณ์สำคัญแล้วจะได้ภาพที่ระลึก</p>')+'<button class="btn s" data-a="x">ปิด</button>')}
function prog(){return [['ตำนานผีโรงเรียน',Object.keys(GH).filter(k=>F.ghosts[k]).length,3],['เหตุการณ์ตามปฏิทิน',(F.ev.wk.st>=9?1:0)+(F.ev.sp.st>=9?1:0),2],['อีสเตอร์เอก',Object.keys(EGGS).filter(k=>F.eggs[k]).length,Object.keys(EGGS).length],['สมุดตำนาน',Object.keys(LORE).filter(k=>F.lore[k]).length,Object.keys(LORE).length]]}
async function progress(){const p=prog(),tot=p.reduce((a,x)=>a+x[1],0),max=p.reduce((a,x)=>a+x[2],0);await openOv('<h2>✅ ความคืบหน้า '+Math.floor(tot/max*100)+'%</h2><ul class="chk">'+p.map(x=>'<li>'+(x[1]>=x[2]?'✅':'⬜')+' '+esc(x[0])+' '+x[1]+'/'+x[2]+'</li>').join('')+'</ul><p style="font-size:13px">ครบ 100% แล้วจะมีฉากพิเศษรออยู่ที่สนามฟุตบอลตอนกลางคืน</p>'+(F.fin?'<p style="color:#7ef08a">ดูฉากจบพิเศษแล้ว ✓</p>':'')+'<button class="btn s" data-a="x">ปิด</button>')}
function check100(){const p=prog();if(p.every(x=>x[1]>=x[2])&&!F.fin&&!F.told100){F.told100=1;fsave();setTimeout(()=>banner('ครบ 100%! ไปสนามฟุตบอลตอนกลางคืน มีคนรออยู่…',4000),1500)}}

/* ---------------- เควสสุ่ม ---------------- */
async function rqTalk(){const q=F.rq[F.cur];if(!q)return;const g=q.g.k;
  if(q.type==='fetch'){if(q.st===0){q.st=1;fsave();await talk([[g,pick(['หิวจัง… ขอ','ซ้อมมาทั้งวัน อยากได้'])+ITEMS[q.it].n+'สักชิ้นได้ไหม']]);return}
    if(S.bag[q.it]>0){S.bag[q.it]--;save();hud();await talk([[g,'ขอบใจมาก! อิ่มแล้วซ้อมต่อได้อีกสามเพลง']]);return rqDone(15)}await talk([[g,'ยังไม่มี'+ITEMS[q.it].n+'เหรอ ซื้อได้ที่เซเว่นหรือร้านข้าวริมเมยนะ']]);return}
  if(q.type==='find'){if(q.st===0){q.st=1;fsave();await talk([[g,'เราทำ'+q.lost+'หายแถวนี้แหละ ช่วยหาหน่อยได้ไหม (มีประกายวิบวับ)']]);return}if(q.st===2){await talk([[g,'เจอแล้ว! '+q.lost+'ของเรา ขอบคุณมาก!']]);return rqDone(20)}await say(null,'ยังหา'+q.lost+'ไม่เจอ ลองมองหาประกายวิบวับ');return}
  if(q.type==='deliver'){if(q.st===0){q.st=1;fsave();await talk([[g,'ฝากเอาโน้ตเพลงนี้ไปให้'+nmOf(q.k2)+'หน่อยนะ ยืนอยู่ตรงที่มีลูกศรชี้']]);return}await say(null,'เอาโน้ตไปส่งให้'+nmOf(q.k2)+'ก่อนนะ');return}
  if(q.type==='trivia'){const tv=TRIVIA[q.tv%TRIVIA.length];await talk([[g,'มาทายกันหน่อย!']]);const ord=[0,1,2].sort(()=>Math.random()-.5);const v=await choose('❓ '+tv[0],ord.map(i=>({t:tv[1][i]})));
    if(ord[v]===tv[2]){await talk([[g,'ถูกต้อง! เก่งมาก']]);if(tv[3])lore(tv[3]);return rqDone(15)}await talk([[g,'ยังไม่ใช่ คำตอบคือ “'+tv[1][tv[2]]+'” ไว้มาทายข้อใหม่นะ']]);F.rq[F.cur]=null;fsave();return}
  if(q.type==='duel'){await talk([[g,'ประลองตีตามกันสักตา! แพ้ไม่ว่ากันนะ']]);const r=await fight('frDuel',Object.assign({},ENEMY[F.cur==='vil'?'puff':'note'],{n:nmOf(g)+'ท้าประลอง',hp:45,atk:5,phr:[4,5],show:2}));if(r==='win'){await talk([[g,'ยอมแล้ว! ฝีมือดีจริง']]);return rqDone(20)}}}
async function rqDone(n){F.rq[F.cur]=null;F.rqN=(F.rqN||0)+1;fsave();coins(n,'เควสสำเร็จ');await gainXP(10);if(F.rqN%3===0)try{if(window.KT)KT.roll('pisat',true)}catch(e){}}

/* ---------------- ครูโอ ---------------- */
async function kruoTalk(){F.met.kruoDay=F.day;fsave();if(window.LIFE&&await LIFE.npcHook('kruo'))return;
  await talk([['kruo',pick(['อ้าว เด็ก ๆ ! เห็นครูตังค์ไหม ครูโอซื้อหมูกระทะมาเผื่อสามชุด','ตังค์อยู่ไหนน้า… เย็นนี้น้ำสีอำพันเย็นเจี๊ยบเลย','ครูโอแวะมาจากแม่จะเรา ตั้งใจมาชวนตังค์ไปงานเลี้ยงริมเมย!'])]]);
  const v=await choose('ครูโอมาถามหาครูตังค์',[{t:'บอกความจริง: ครูตังค์ซ้อมกับพวกเราอยู่'},{t:'ชวนครูโอมาตีกลองหลวงด้วยกันแทน'},{t:'ชี้ไปทางโรงอาหาร (แกล้ง)'},{t:'🎁 ให้ของขวัญครูโอ'}]);
  if(v===3&&window.LIFE){await LIFE.giftTo('kruo');await talk([['kruo','ครูโอไปหาตังค์ต่อละนะ! ฝากบอกด้วยว่าคืนนี้หมูกระทะ!']]);return}
  if(v===0){await talk([['kruo','ซ้อมอีกแล้ว! ตังค์นี่ขยันจริง… งั้นครูโอฝากข้าวแต๋นไปให้แทนก็ได้ ไว้วันหลังค่อยชวนใหม่'],['pob','ครูโอครับ ผมขอส่วนแบ่งค่าขนส่งข้าวแต๋นด้วย'],['kruo','ฮ่า ๆ ๆ เจ้าเด็กผู้จัดการนี่!']]);coins(15,'ครูโอฝากขนม')}
  else if(v===1){await talk([['kruo','ตีกลองหลวง? ได้เลย! ครูโอตีตั้งแต่ตัวเท่าก๋วยสลาก ตามจังหวะครูโอให้ทันนะ']]);const r=await fight('frKruo',Object.assign({},ENEMY.note,{k:'kruoB',n:'ครูโอตีกลองหลวงท้าประลอง',hp:70,atk:6,phr:[4,5],show:2,bg:'night'}));
    if(r==='win'){await talk([['kruo','โอ้โห! พวกเอ็งตีกลองหลวงได้ดีกว่าครูอีก งั้นวันนี้ไม่ชวนตังค์แล้ว ชวนพวกเอ็งไปกินข้าวแทน!'],[null,'ครูโอเลี้ยงข้าวเหนียวหมูปิ้งทั้งวง']]);S.bag.moo=(S.bag.moo||0)+2;save();hud();coins(25,'ประลองกับครูโอ')}}
  else{await talk([['kruo','โรงอาหาร? ขอบใจ! (วิ่งไปเร็วมาก)'],[null,'สามนาทีต่อมา…'],['kruo','(หอบ) ไม่มีใครเลย! มีแต่ป้าแม่ครัวบอกว่าตังค์ไม่เคยกินข้าวที่นี่ตอนเย็น… พวกเอ็งแกล้งครูใช่ไหม!'],['maha','ขอโทษครับครูโอ… ครูตังค์ซ้อมอยู่ห้อง 512 ครับ'],['kruo','ฮ่า ๆ พูดความจริงแต่แรกก็จบแล้ว! ไม่เป็นไร ครูโอก็ชอบวิ่งเล่นอยู่แล้ว']])}}

/* ---------------- อีสเตอร์เอก ---------------- */
async function treeTalk(){F.tree=(F.tree||0)+1;fsave();if(F.tree<7){await say(null,['ต้นไม้ใหญ่ใบไหวเบา ๆ','…ซ่า… ซ่า…','ใบไม้ร่วงลงมาหนึ่งใบเป็นรูปโน้ตดนตรีพอดี','เหมือนได้ยินเสียงฮัมเพลงแว่ว ๆ','ต้นไม้นิ่งฟังอยู่','รากไม้โผล่ขึ้นมาเป็นจังหวะ ฉิ่ง–ฉับ'][F.tree-1]);return}
  await say(null,'ต้นไม้ใหญ่ฮัมทำนองที่วงสรรพวาทิตทุกรุ่นเคยซ้อม… ทุกคนยืนฟังนิ่ง');if(AC){const t0=AC.currentTime+.1;[3,5,7,8,7,5,4,3,4,5].forEach((g,i)=>playInst('gong',g,t0+i*.45,.7))}egg('tree');lore('L14')}
async function miniCatch(){F.met.miniDay=F.day;F.mini=(F.mini||0)+1;fsave();await talk([['mini',['เอ๊ะ! โดนจับได้! พรุ่งนี้หาให้เจออีกนะ','ฮึ่ม… ครั้งที่สองแล้ว! เก่งนี่','ครั้งที่สาม! ยอมแล้ว ๆ ความลับของห้อง 512 คือ… ครูตังค์ซ่อนขนมไว้หลังฆ้อง!'][F.mini-1]||'เจอข้าอีกแล้ว!']]);if(F.mini>=3){egg('mini');lore('L15');S.bag.moo=(S.bag.moo||0)+1;save()}coins(8,'จับเพี้ยนน้อย')}
async function elephantEgg(){await walkFlash();await talk([[null,'กลางดึก หน้าอาคาร 4 ขุนสามชน… เงาช้างศึกขนาดใหญ่เดินผ่านผนังอาคารช้า ๆ ได้ยินเสียงกลองศึกแว่วมาไกล ๆ'],['maha','เงา… ไฟจากถนนตกกระทบต้นไม้หรือเปล่านะ'],['?waen','อาคาร 4 ชื่อขุนสามชน เจ้าเมืองฉอดในศิลาจารึกที่ชนช้างกับพ่อขุนรามคำแหงไงพี่'],[null,'เงาช้างหันมามองเหมือนพยักหน้า แล้วจางหายไป']]);egg('elephant');lore('L2');coins(15)}
async function dawnEgg(){await talk([[null,'เช้าตรู่ที่วัดห้วยมหาวงก์ แสงแรกส่องยอดเจดีย์ หมอกบาง ๆ ลอยเหนือแม่น้ำเมย'],['luwa','ตอนเด็ก ๆ ผมตื่นมาดูแสงแรกตรงนี้กับแม่อุ๊ยครับ ได้ยินเสียงกลองหลวงซ้อมแว่ว ๆ ทุกปีก่อนงานตาน'],[null,'ทุกคนยกมือไหว้พระเจดีย์อย่างสงบ']]);egg('dawn');lore('L6');S.hp=S.hpMax;hud();coins(10)}

/* ---------------- ตำนานผีโรงเรียน ---------------- */
function ghostRounds(k){
  const base={atk:12,xp:60,bg:'nightflat',k};
  if(k==='gYam')return [
    {n:'ผียาม · รอบเดินตรวจ',hp:110,phr:[5,6],gap:.44,show:1,slot:.28,ghost:1,lines:[['gYam','ปรี๊ด… ปรี๊ด… ใครยังไม่กลับบ้าน! ตีตามจังหวะเดินเวรของข้าให้ได้ก่อน!']]},
    {n:'ผียาม · รอบไฟฉายส่องหน้า',hp:100,phr:[4,4],gap:.42,show:1,slot:.27,call:1,lines:[['gYam','รับลูกล้อลูกขัดนกหวีดข้าให้ทัน!']]},
    {n:'ผียาม · รอบตีสาม',hp:140,phr:[6,7],gap:.38,show:0,slot:.26,atk:14,lines:[['gYam','ตีสามแล้ว! ไม่มีไฟช่วย ฟังด้วยหูล้วน ๆ!']]}].map(r=>Object.assign({},base,r));
  if(k==='gTa'){let mot=[2,4,5,4];return [
    {n:'ผีคุณตา · เพลงเก่าช้า ๆ',hp:120,phr:[6,6],gap:.62,show:2,slot:.34,seqFn:(seq,len)=>{mot=[ri(0,4),ri(1,5),ri(2,6),ri(1,5)];seq.length=0;for(let i=0;i<len;i++)seq.push(i===len-2?clamp(mot[i%4]+pick([-2,2]),0,7):mot[i%4])},lines:[['gTa','มาแล้วเหรอหลาน… ตาสอนเพลงนี้ค้างไว้ ฟังดี ๆ วรรคหลังตาแอบเปลี่ยนนะ']]},
    {n:'ผีคุณตา · ต่อเพลงให้จบ',hp:140,phr:[7,7],gap:.55,show:1,slot:.3,ghost:1,seqFn:(seq,len)=>{const m=[ri(0,3),ri(2,5),ri(3,7)];seq.length=0;for(let i=0;i<len;i++)seq.push(i>=len-2?clamp(m[i%3]+pick([-1,1,2]),0,7):m[i%3])},lines:[['gTa','วรรคสุดท้ายแล้ว… ตารอมาหลายสิบปี']]}].map(r=>Object.assign({},base,r))}
  return [
    {n:'ผีนางรำ · ท่าเปิด',hp:110,phr:[4,4],gap:.45,show:1,slot:.28,call:1,lines:[['gRam','(ร่ายรำช้า ๆ ลอยอยู่กลางอากาศ) ตีให้ตรงท่ารำของฉันนะ…']]},
    {n:'ผีนางรำ · ท่าจบ',hp:130,phr:[5,6],gap:.42,show:1,slot:.27,ghost:1,lines:[['gRam','ท่าสุดท้าย… ฉันรอรำกับวงมานานแล้ว']]}].map(r=>Object.assign({},base,r))}
const GINTRO={
  gYam:[[null,'กลางคืน หน้าอาคาร 2 ทิวสน… ลมหนาวพัดผ่านแถวต้นสน ไฟฉายดวงหนึ่งส่องมาจากไหนไม่รู้'],['gYam','ปรี๊ดดดด! ใครยังไม่กลับบ้าน!'],['pob','อ… ผู้จัดการขอลาป่วยกะทันหันครับ!'],['maha','ตั้งสติ… นั่นคือตำนานผียามที่รุ่นพี่เล่า ว่ากันว่าต้องใช้ฝีมือดนตรีขั้นสูงสุดถึงจะผ่านได้']],
  gTa:[[null,'กลางคืน ข้างอาคาร 3 เพชรประจิม… มีเสียงซอแว่ว ๆ ช้า ๆ ทำนองเก่ามาก'],['gTa','หลานมาต่อเพลงให้ตาหรือ… ตารอมานานเหลือเกิน'],['?waen','พี่ ๆ … คุณตาตัวโปร่งใสครับ'],['maha','ทำนองช้าแต่ฟังยาก วรรคท้ายเปลี่ยนตลอด ต้องฟังให้ดีที่สุด']],
  gRam:[[null,'กลางคืน หน้าอาคาร 5 อัญมณี… ใต้แสงไฟมีนางรำลอยอยู่ครึ่งตัว ท่อนล่างจางเป็นหมอก'],['gRam','วงดนตรีมาแล้ว… คืนนี้ฉันจะได้รำจนจบเพลงไหม'],['?kaimuk','สวยมาก… แต่ก็น่ากลัวมากด้วย!'],['maha','ตีให้ตรงท่ารำ ลูกล้อลูกขัดต้องรับให้ทัน']]};
const GWIN={
  gYam:[['gYam','(ลดไฟฉายลง ยิ้มกว้าง) …จังหวะเดินเวรของข้า ไม่มีใครตีได้ครบมาหลายสิบปีแล้ว'],['gYam','ข้าแค่อยากให้เด็ก ๆ กลับบ้านก่อนมืด… เดินทางกลับดี ๆ นะ ปรี๊ด!'],[null,'ผียามโบกมือ แล้วจางหายไปกับแสงไฟฉาย']],
  gTa:[['gTa','จบแล้ว… เพลงจบแล้ว หลานต่อให้ตาจนจบ'],['gTa','ดนตรีไทยไม่ได้อยู่ที่ตา อยู่ที่คนที่เล่นต่อ… เล่นต่อไปนะหลาน'],[null,'คุณตายิ้ม ยกมือไหว้วง แล้วค่อย ๆ จางไป']],
  gRam:[['gRam','(รำท่าสุดท้ายจนจบ แล้วยิ้มทั้งน้ำตา) ได้รำจนจบเพลงแล้ว…'],['gRam','ขอบใจวงดนตรีนะ ต่อไปถ้าเห็นใครซ้อมรำที่นี่ ช่วยตีให้เขาด้วยนะ'],[null,'นางรำค่อย ๆ จางเป็นละอองแสงสีชมพู']]};
async function ghostMeet(k){const G=GH[k];
  if(F.ghosts[k]){await talk([[k,pick({gYam:['ปรี๊ด! คืนนี้ก็กลับบ้านดี ๆ นะ','ข้ายังเดินเวรอยู่ ไม่ต้องห่วง'],gTa:['หลานซ้อมเพลงเก่าบ้างหรือเปล่า','ตาฟังวงหลานซ้อมทุกเย็นนะ'],gRam:['คืนนี้ไม่รำแล้ว… ขอนั่งฟังวงซ้อมอย่างเดียว','ขอบใจอีกครั้งนะ']}[k])]]);return}
  stopMusic();flash('#9fe8ff',200);shake(500);if(AC){const t=AC.currentTime;[0,1,2].forEach(i=>{try{tone(110-i*12,t+i*.25,.6,'sawtooth',.06)}catch(e){}})}
  if(!F.met[k]){F.met[k]=1;fsave();await talk(GINTRO[k])}
  const v=await choose(G.n,[{t:'🎵 ประลองด้วยดนตรี (ยากมาก)',s:'ศึกหลายยก · แนะนำเลเวล 8 ขึ้นไป และพกยาดม'},{t:'🏃 ถอยไปก่อน'}]);
  if(v!==0){await say(null,'ทุกคนถอยออกมาเงียบ ๆ … ไว้ฝีมือพร้อมค่อยกลับมา');startMusic();return}
  const R=ghostRounds(k);
  for(let i=0;i<R.length;i++){const r=R[i];if(r.lines)await talk(r.lines);const res=await fight('frGhost',Object.assign({},r,{n:r.n+' ('+(i+1)+'/'+R.length+')'}));
    if(res!=='win'){await say(null,'ยังไม่ไหว… วงถอยออกมาตั้งหลัก ตำนานยังรออยู่ตรงนั้น');startMusic();return}
    if(i<R.length-1){S.hp=Math.min(S.hpMax,S.hp+Math.round(S.hpMax*.35));hud();await say(null,'ยกที่ '+(i+1)+' ผ่านแล้ว! พักหายใจ ฟื้นพลังเล็กน้อย')}}
  F.ghosts[k]=1;fsave();await talk(GWIN[k]);lore(G.lore);snap('ปราบ'+G.n);coins(80,'ตำนานผี');await gainXP(80);try{if(window.KT)KT.roll('pisat',true)}catch(e){}startMusic();check100()}

/* ---------------- เหตุการณ์ตามปฏิทิน ---------------- */
const WKI={yaprak:['หญ้าแพรก','sch',30,20],khem:['ดอกเข็ม','sch',17,13],makhuea:['ดอกมะเขือ','vil',38,18],khaotok:['ข้าวตอก','vil','auntie']};
function evTargets(L){const w=F.ev.wk,s=F.ev.sp;
  if(w.st===2)Object.keys(WKI).forEach(k=>{const it=WKI[k];if(w[k]||it[1]!==F.cur||it[2]==='auntie')return;const p=spot('wk'+k,it[2],it[3]);L.push({...p,lb:'เก็บ'+it[0],act:'frWkItem',k})});
  if(w.st===2&&VILL()&&!w.khaotok){const a=NPC3.find(n=>n.k==='auntie');if(a)L.push({x:a.x,y:a.y,lb:'ขอข้าวตอกจากแม่อุ๊ย',act:'frWkItem',k:'khaotok'})}
  if(w.st===4&&SCH()&&PH()===0)L.push({...DOME(),lb:'โดมกิจกรรม · พิธีไหว้ครู',act:'frWkCer'});
  if(s.st===2&&SCH()){if(!s.cheer)L.push({...STANDS(),lb:'อัฒจันทร์ · ซ้อมเพลงเชียร์',act:'frSpCheer'});if(!s.sign)L.push({...INDUS(),lb:'อาคารอุตสาหกรรม · ทำป้ายนำขบวน',act:'frSpSign'})}
  if(s.st===3&&SCH()&&PH()!==2)L.push({...FIELDC(),lb:'สนามฟุตบอล · เริ่มขบวนพาเหรด',act:'frSpParade'});
  if(F.fin===0&&prog().every(x=>x[1]>=x[2])&&SCH()&&PH()===2)L.push({...FIELDC(),lb:'สนามฟุตบอล · มีคนรออยู่',act:'frFin'})}
async function evTang(){const w=F.ev.wk,s=F.ev.sp;
  if(w.st===1){w.st=2;fsave();await talk([['tang','มาพอดี! พฤหัสบดีนี้วันไหว้ครู ชมรมเราได้หน้าที่บรรเลงในพิธี แล้วก็ช่วยทำพานไหว้ครูของชั้นด้วย'],['tang','พานไหว้ครูต้องมีดอกไม้สี่อย่าง หญ้าแพรก ดอกเข็ม ดอกมะเขือ และข้าวตอก แต่ละอย่างมีความหมายนะ'],['tang','หญ้าแพรกกับดอกเข็มมีในโรงเรียน ดอกมะเขือต้องไปขอที่ไร่ลุงชาวนาแม่โกนเกน ส่วนข้าวตอก แม่อุ๊ยร้านข้าวคั่วเก่งที่สุด'],['pob','รับทราบ! ผู้จัดการขอแบ่งงานเป็นสองสาย… (ทุกคนเดินไปหมดแล้ว)']]);return true}
  if(w.st===2&&['yaprak','khem','makhuea','khaotok'].every(k=>w[k])){w.st=3;fsave();await talk([['tang','ครบสี่อย่าง! มาจัดพานกัน'],[null,'ทุกคนช่วยกันจัดพาน หญ้าแพรกรองพื้น ดอกเข็มเรียงเป็นแถว ดอกมะเขือวางตรงกลาง โรยข้าวตอกรอบ ๆ'],['tang','ทีนี้ซ้อมเพลงก่อนพิธีกัน ครูตีให้ฟังทีละวรรค ตีตามให้ครบนะ']]);
    const acc=await echoSong('mini','ซ้อมเพลงก่อนพิธีไหว้ครู',[3,4,5,7,5,4,3,4,5,7,8,7,5,7,8,10,8,7,5,4,3,4,5,3]);if(acc<0){w.st=2.5;fsave();await say(null,'ยังไม่ครบ ไว้กลับมาซ้อมกับครูตังค์ใหม่นะ');return true}
    w.st=4;w.day=F.day+1;fsave();await talk([['tang','ดีมาก! พรุ่งนี้เช้าพิธีที่โดมกิจกรรม ใส่ชุดให้เรียบร้อย มาก่อนเวลานะ'],[null,'(นอนพักที่มุมห้อง แล้วตื่นตอนเช้า เพื่อไปพิธีที่โดมกิจกรรม)']]);lore('L10');return true}
  if(w.st===2.5){const acc=await echoSong('mini','ซ้อมเพลงก่อนพิธีไหว้ครู',[3,4,5,7,5,4,3,4,5,7,8,7,5,7,8,10,8,7,5,4,3,4,5,3]);if(acc>=0){w.st=4;w.day=F.day+1;fsave();await talk([['tang','ผ่านแล้ว! พรุ่งนี้เช้าพิธีที่โดมกิจกรรมนะ']])}return true}
  if(w.st===2){const left=Object.keys(WKI).filter(k=>!w[k]).map(k=>WKI[k][0]);await talk([['tang','พานยังขาด '+left.join(' ')+' นะ']]);return false}
  if(s.st===1){s.st=2;fsave();await talk([['tang','ข่าวใหญ่! กีฬาสีปีนี้ วงดนตรีไทยของเราได้นำขบวนพาเหรดของทุกสี'],['tang','ทุกสีแข่งกันก็จริง แต่ขบวนเราต้องเดินนำทุกสีเข้าสนาม ต้องซ้อมเพลงเชียร์ที่อัฒจันทร์ กับทำป้ายนำขบวนที่อาคารอุตสาหกรรม'],['tang','แล้วนี่… ชุดกีฬาสีม่วง สีของโรงเรียน ครูซื้อให้ทั้งวง'],[null,'ได้ชุดกีฬาสีม่วง! เปลี่ยนชุดได้ที่ตู้เสื้อผ้า (คุยกับครูตังค์)']]);F.own.purple=1;F.outfit='purple';applyOutfit();fsave();return true}
  if(s.st===2&&s.cheer&&s.sign){s.st=3;fsave();await talk([['tang','พร้อมแล้ว! ไปสนามฟุตบอล เริ่มขบวนพาเหรดกัน (ตอนกลางวันหรือตอนเย็น)']]);return true}
  return false}
async function wkItem(k){const w=F.ev.wk,it=WKI[k];
  if(k==='khaotok'){await talk([['auntie','ข้าวตอกไปทำพานไหว้ครูเหรอลูก แม่อุ๊ยคั่วให้เดี๋ยวนี้เลย'],[null,'เสียงข้าวเปลือกแตกเป๊าะแป๊ะในกระทะ เหมือนจังหวะรัวระนาด'],['auntie','ข้าวที่โดนความร้อนแล้วแตกบานแบบนี้ เหมือนความรู้ที่ครูเคี่ยวเข็ญจนเราเข้าใจนะลูก']])}
  else if(k==='makhuea')await talk([['farmer','ดอกมะเขือ? เอาไปเลย ดอกมะเขือห้อยหัวลงเสมอ เขาว่าเหมือนคนนอบน้อม'],['luwa','ลุงครับ ขอดอกสวย ๆ นะครับ']]);
  else await say(null,k==='yaprak'?'เก็บหญ้าแพรกริมสนาม · หญ้าแพรกขึ้นงอกงามไว เหมือนความรู้ที่แพร่กระจาย':'เก็บดอกเข็มจากแปลงดอกไม้ · ดอกเข็มแหลมเหมือนปัญญาที่เฉียบแหลม');
  w[k]=1;fsave();try{sfx.get()}catch(e){}const n=Object.keys(WKI).filter(x=>w[x]).length;banner('ของใส่พานไหว้ครู '+n+'/4'+(n>=4?' · กลับไปหาครูตังค์ที่ห้อง 512':''),3000)}
async function wkCeremony(){const w=F.ev.wk;if(F.day<w.day){await say(null,'พิธีไหว้ครูเริ่มพรุ่งนี้เช้า (นอนพักที่มุมห้อง 512 แล้วตื่นตอนเช้า)');return}
  await walkFlash();await talk([[null,'เช้าวันพฤหัสบดี · พิธีไหว้ครูที่โดมกิจกรรม นักเรียนนั่งเรียงแถว ครูนั่งเก้าอี้แถวหน้า'],[null,'ตัวแทนนักเรียนกล่าวคำบูชาครู “ปาเจราจริยา โหนติ…” ทั้งโดมเงียบ มีแต่เสียงลมพัด'],['tang','(กระซิบ) เตรียมบรรเลงนะ…'],
    [null,'จู่ ๆ ฆ้องวงก็ดังเพี้ยน! ปีศาจขี้ลืมโผล่ออกมาจากกองสมุดโน้ต'],['book2','ข้าคือขี้ลืม! พิธีวันนี้ข้าจะทำให้ทุกคนลืมเพลงหมด!'],['maha','ไม่ได้! วันนี้วันที่เราได้ขอบคุณครู ทุกคน ตั้งใจฟังให้ดี!']]);
  const r=await fight('frWk',Object.assign({},ENEMY.book2,{n:'ปีศาจขี้ลืม (ป่วนพิธีไหว้ครู)',hp:110,atk:9,phr:[4,5],show:2,bg:'dome'}));
  if(r!=='win'){await say(null,'ปีศาจขี้ลืมยังวนอยู่ในโดม ตั้งหลักแล้วลองใหม่ (พิธียังรออยู่)');return}
  w.st=9;fsave();await talk([[null,'ปีศาจขี้ลืมกลายเป็นสมุดโน้ตเล่มเล็ก ตกลงตรงหน้าพาน วงบรรเลงต่อจนจบพิธี'],[null,'นักเรียนแต่ละชั้นนำพานดอกไม้ขึ้นไหว้ครู พานของชมรมดนตรีไทยมีหญ้าแพรก ดอกเข็ม ดอกมะเขือ และข้าวตอกครบ'],
    ['tang','(ยิ้ม) ครูได้รับพานแล้ว… แต่ของขวัญที่ดีที่สุดคือได้เห็นพวกเธอบรรเลงด้วยกันนะ'],['pob','ครูครับ ผู้จัดการขอใช้สิทธิ์ร้องไห้ห้านาที']]);
  snap('วันไหว้ครู');coins(70,'วันไหว้ครู');await gainXP(60);try{if(window.KT)KT.roll('pisat',true)}catch(e){}F.ev.sp.st=F.ev.sp.st||0;F.ev.sp.from=F.day;fsave();check100()}
async function spCheer(){await talk([[null,'อัฒจันทร์ · กองเชียร์ทุกสีมาซ้อมพร้อมกัน แต่นกหวีดของพี่สตาฟตัวหนึ่งเป่าเพี้ยนไม่หยุด'],['whistle','ปรี๊ด! ข้ากลับมาแล้ว! ลูกล้อลูกขัดแบบเดิม รับให้ทันนะ!']]);
  const r=await fight('frSp1',Object.assign({},ENEMY.whistle,{n:'นกหวีดเพี้ยน (ซ้อมเชียร์)',hp:90,call:1,bg:'court'}));if(r==='win'){F.ev.sp.cheer=1;fsave();await talk([[null,'กองเชียร์ทุกสีร้องตามจังหวะฉิ่งของวงได้พร้อมกันเป็นครั้งแรก!']]);banner('ซ้อมเชียร์สำเร็จ'+(F.ev.sp.sign?' · กลับไปหาครูตังค์':''),2600)}}
async function spSign(){await talk([[null,'อาคารอุตสาหกรรม · ครูช่างให้ยืมไม้อัดกับสี'],['?foo','ผมปีนขึ้นไปทาสีตัวอักษรบนสุดเองครับ!'],['?waen','ผมคำนวณระยะตัวอักษรแล้ว เส้นตรงทุกตัว'],[null,'ป้ายนำขบวน “ชมรมดนตรีไทยสรรพวาทิต · ม่วง–เหลืองหนึ่งเดียว” เสร็จเรียบร้อย']]);F.ev.sp.sign=1;fsave();banner('ทำป้ายเสร็จ'+(F.ev.sp.cheer?' · กลับไปหาครูตังค์':''),2600)}
/* ขบวนพาเหรด: เดินผ่านธงรอบสนามให้ครบภายในเวลา */
let PAR=null;
const PFLAGS=()=>[[26,11],[34,11],[34,25],[26,25],[30,18]].map(([x,y],i)=>spot('pf'+i,x,y));
async function spParade(){await talk([['tang','ขบวนพาเหรดเริ่ม! เดินนำขบวนผ่านธงทั้งห้าจุดรอบสนามให้ทันเพลง (90 วินาที)'],['pob','ทุกสีเดินตามเรา! ผู้จัดการนำขบวนเอง!']]);PAR={i:0,t0:performance.now(),lim:90000};banner('ขบวนพาเหรดเริ่ม! เดินไปที่ธงสีทอง',2400)}
async function parFinish(ok){const p=PAR;PAR=null;if(!ok){await say(null,'เพลงจบก่อนขบวนเดินครบ… ไม่เป็นไร ลองเดินใหม่ได้ที่สนามฟุตบอล');return}
  await talk([[null,'ขบวนวงดนตรีไทยนำทุกสีเดินครบรอบสนาม เสียงกลองหลวงกับฉิ่งดังก้อง ทุกสีปรบมือพร้อมกัน'],['whistle','ปรี๊ด! ข้า… ข้าจะเป่าให้ขบวนสะดุด!'],['maha','อีกแล้ว! ทุกคน ตั้งวง!']]);
  const r=await fight('frSp2',Object.assign({},ENEMY.whistle,{n:'นกหวีดกรรมการเพี้ยน (ป่วนกีฬาสี)',hp:120,call:1,ghost:1,atk:10,bg:'court'}));if(r!=='win'){F.ev.sp.st=3;fsave();await say(null,'นกหวีดยังป่วนอยู่ ลองเริ่มขบวนใหม่');return}
  F.ev.sp.st=9;fsave();await talk([[null,'นกหวีดเพี้ยนสงบลง กลายเป็นนกหวีดกรรมการธรรมดา เป่าเสียงเดียวตรงจังหวะพอดี'],[null,'ประธานกีฬาสีประกาศรางวัลพิเศษ “ขวัญใจทุกสี” ให้วงดนตรีไทยสรรพวาทิต'],['tang','จะสีไหนก็คนสรรพวิทยาคมเหมือนกัน วันนี้พวกเธอทำให้ทุกสีเดินไปด้วยกันได้'],['pob','ผู้จัดการขอประกาศ… ม่วง–เหลืองหนึ่งเดียว!']]);
  lore('L11');snap('ขบวนพาเหรดกีฬาสี');coins(70,'กีฬาสี');await gainXP(60);try{if(window.KT)KT.roll('pisat',true)}catch(e){}check100()}
const wkOpen=()=>{if(!window.LIFE)return F.day>=2;const c=LIFE.cal();return c.y>1||c.mi>=8};
const spOpen=()=>{if(!window.LIFE)return F.ev.wk.st>=9&&F.day>=(F.ev.sp.from||0)+2;const c=LIFE.cal();return c.y>1||c.mi>=2};
async function evNotice(){const w=F.ev.wk,s=F.ev.sp;if(busy||!onWorld()&&S.map!=='room')return;
  if(w.st===0&&SCH()&&wkOpen()&&PH()===0){w.st=1;fsave();busy=true;await talk([[null,'ประกาศหน้าเสาธงตอนเช้า: “พฤหัสบดีนี้ โรงเรียนจัดพิธีไหว้ครู ขอให้ทุกชั้นเตรียมพานไหว้ครู”'],['maha','ครูตังค์น่าจะมีงานให้ชมรมเราแน่ ไปหาครูที่ห้อง 512 กัน']]);busy=false;return}
  if(s.st===0&&SCH()&&spOpen()&&PH()===0){s.st=1;fsave();busy=true;await talk([[null,'เดือนธันวาคม… ป้ายผ้าหน้าโรงเรียนเขียนว่า “กีฬาสีสรรพวิทยาคม”'],['?ice','กีฬาสีมาแล้ว! ไอซ์อยู่สีเดียวกับอิ้งด้วย!'],['maha','ครูตังค์เรียกประชุมชมรมที่ห้อง 512 ด่วน']]);busy=false}}
async function finale(){F.fin=1;fsave();busy=true;await walkFlash();
  await talk([[null,'กลางคืนที่สนามฟุตบอล ใต้แสงดาวเต็มฟ้า… มีวงดนตรีวงใหญ่ตั้งรออยู่กลางสนาม'],['tang','มาแล้วเหรอ ทุกคนรอพวกเธออยู่'],[null,'ผียามถือไฟฉายส่องเวทีให้ คุณตานั่งตั้งซอ นางรำยืนรอรำ ขุนไม้เดี่ยวนั่งที่ระนาด เพี้ยนน้อยเกาะอยู่บนฆ้อง'],
    ['kruo','(วิ่งมาพร้อมข้าวแต๋นเต็มตะกร้า) ตังค์! วันนี้หนีไม่ได้แล้ว คอนเสิร์ตจบเลี้ยงข้าวแต๋นทั้งสนาม!'],['tang','(หัวเราะ) วันนี้ครูไม่หนีแล้วครับ'],['pob','ผู้จัดการขอประกาศ… คอนเสิร์ตใต้แสงดาว ชมรมสรรพวาทิต ทุกรุ่น ทุกคน ทุกตำนาน!']]);
  if(AC){const t0=AC.currentTime+.2;[3,5,7,8,10,8,7,5,7,8,10,11,10,8,7,5,4,3].forEach((g,i)=>{playInst('gong',g,t0+i*.42,.8);if(i%2)TS.ching(i%4===1,t0+i*.42,.3,SFX)})}
  await sleep(3000);snap('คอนเสิร์ตใต้แสงดาว · 100%');
  await talk([[null,'เพลงจบลงพร้อมเสียงปรบมือ ทั้งคน ทั้งตำนาน ทั้งปีศาจที่กลายเป็นเพื่อน'],['maha','ดนตรีไทยไม่ได้อยู่ที่เครื่อง ไม่ได้อยู่ที่ครู… อยู่ที่พวกเราที่เล่นต่อกันไปเรื่อย ๆ'],[null,'ขอบคุณที่สำรวจตำนานสรรพวาทิตจนครบ 100% · พัฒนาโดย นายนนทพัทธ์ วงค์มูล 2026']]);
  try{if(window.KT)KT.roll('pisat',true,!F.ktFin);F.ktFin=1;fsave()}catch(e){}coins(150,'ครบ 100%');busy=false}

/* ---------------- ต่อเข้าระบบเดิม ---------------- */
const _near=nearest;
window.nearest=function(){const b=_near();if(!ON||!S)return b;const fx=S.x,fy=S.y-6;let best=b,bd=b?(b.x!=null?Math.hypot(b.x-fx,b.y-fy):12):99;
  freeTargets().forEach(o=>{const d=Math.hypot(o.x-fx,o.y-fy);if(d<22&&d<bd){bd=d;best=o}});if(best&&best.act==='bus'&&VILL())best=Object.assign({},best,{lb:'ป้ายรถสองแถว · กลับโรงเรียน / รอรถข้ามเวลา'});if(best&&best.act==='seven'&&SCH())best=Object.assign({},best,{lb:'เซเว่น · ซื้อของ'});return best};
const _doAct=doAct;
window.doAct=async function(n){const a=n&&n.act;if(ON){
  if(a==='frBusS')return busTrip('vil');if(a==='bus'&&VILL())return busTrip('sch');if(a==='frBed')return bed();if(a==='frTang')return tangTalk();if(a==='frTree')return treeTalk();
  if(a==='frGhost')return ghostMeet(n.k);if(a==='frKruo')return kruoTalk();if(a==='frMini')return miniCatch();if(a==='frEl')return elephantEgg();if(a==='frDawn')return dawnEgg();
  if(a==='frRQ')return rqTalk();if(a==='frRQ2'){const q=F.rq[F.cur];q.st=2;await talk([[q.k2,'โน้ตเพลงจาก'+nmOf(q.g.k)+'เหรอ ขอบใจมาก!']]);return rqDone(15)}
  if(a==='frWkItem')return wkItem(n.k);if(a==='frWkCer')return wkCeremony();if(a==='frSpCheer')return spCheer();if(a==='frSpSign')return spSign();if(a==='frSpParade')return spParade();if(a==='frFin')return finale();
  if(a==='seven'&&SCH())return shop('เซเว่นหน้าโรงเรียน');if(a==='rimmoei'&&VILL())return shop('ร้านข้าวริมเมย');
  if(a==='gong'&&S.map==='room'&&midnight()){await say(null,'เที่ยงคืนตรง… ตีฆ้องเบา ๆ หนึ่งวรรค');if(AC){const t0=AC.currentTime+.1;[3,5,7,8].forEach((g,i)=>playInst('gong',g,t0+i*.4,.8));[3,5,7,8].forEach((g,i)=>playInst('gong',g,t0+2.2+i*.4,.3))}await sleep(4000);await say(null,'…มีเสียงฆ้องวงหนึ่งตอบกลับมาเบา ๆ จากที่ไหนสักแห่งในห้อง ทำนองเดียวกันเป๊ะ');egg('midnight');lore('L13');return}
  if(a==='cab'&&S.map==='room'&&moonFull()&&PH()===2){await say(null,'คืนพระจันทร์เต็มดวง… ตู้เก่าหลังห้องแง้มออกเอง ข้างในมีรูปถ่ายขาวดำเลือน ๆ ของนักเรียนกลุ่มหนึ่งหน้าอาคารไม้ หลังรูปเขียนว่า “ปีแรก 2458”');egg('moon');lore('L12');return}
  if(a==='cab'&&S.map==='room'&&!moonFull()&&PH()===2){await say(null,'ตู้เก่าหลังห้อง… ประตูตู้ขยับนิดหนึ่งแต่ไม่ยอมเปิด เหมือนรออะไรบางอย่าง (บางคืนตู้อาจเปิดเอง)');return}}
  return _doAct(n)};
const _upd=updateWorld;
window.updateWorld=function(dt){_upd(dt);if(!ON||!S)return;if(mode==='world'&&!busy&&!paused&&$('#dlg').classList.contains('hide')){
  F.clock+=dt*2;if(F.clock>=1440){F.clock-=1440;F.day++;F.lastPh=-1}const p=PH();if(S.ch===2)S.phase=p;
  if(p!==F.lastPh){const first=F.lastPh===undefined;F.lastPh=p;if(!first)banner(['☀️ เช้าแล้ว · '+(window.LIFE?LIFE.dateText():'วันที่ '+F.day),'🌇 ตกเย็นแล้ว · อาจมีคนมาถามหาครูตังค์','🌙 กลางคืนแล้ว · ระวังตำนานผีโรงเรียน…'][p],3000);evNotice()}
  if(!F.rq[F.cur]&&onWorld()&&Math.random()<dt*.05)newRQ();
  const q=F.rq[F.cur];if(q&&q.type==='find'&&q.st===1&&Math.hypot(S.x-q.t.x,S.y-q.t.y)<14){q.st=2;fsave();try{sfx.get()}catch(e){}banner('เจอ'+q.lost+'แล้ว! เอาไปคืน'+nmOf(q.g.k),2600)}
  if(onWorld())(SCRAPS[F.cur]||[]).forEach(([id,tx,ty])=>{if(F.lore[id])return;const p=spot('scr'+id,tx,ty);if(Math.hypot(S.x-p.x,S.y-p.y)<14){try{sfx.get()}catch(e){}lore(id)}});
  if(PAR){const fl=PFLAGS()[PAR.i];if(Math.hypot(S.x-fl.x,S.y-fl.y)<18){PAR.i++;try{sfx.ok()}catch(e){}if(PAR.i>=5)parFinish(true);else banner('ธง '+PAR.i+'/5 · ไปต่อ!',1200)}else if(performance.now()-PAR.t0>PAR.lim)parFinish(false)}
  if(Math.random()<dt*.2)fsave()}};
const _draw=drawWorld;
window.drawWorld=function(t){_draw(t);if(!ON||!S)return;const cX=Math.round(camX),cY=Math.round(camY);
  const spr=(k,x,y,dir,f)=>{const s=SPR[k];if(s)cx.drawImage(s[dir||'d'][f||0],Math.round(x-8-cX),Math.round(y-24-cY))};
  const bang=(x,y,c)=>{cx.fillStyle=c||'#ffd34d';cx.font='bold 10px Mitr,sans-serif';cx.fillText('!',Math.round(x-2-cX),Math.round(y-30-cY+Math.sin(t*5)*2))};
  const spark=(x,y)=>{const k=(Math.sin(t*6)+1)/2;cx.fillStyle='rgba(255,240,160,'+(.35+.4*k)+')';cx.beginPath();cx.arc(x-cX,y-4-cY,5+k*2,0,7);cx.fill();cx.fillStyle='#fff';cx.fillRect(x-1-cX,y-12-k*3-cY,2,2)};
  if(S.map==='room'&&!S.rm&&SCH()){const p=TANG();spr('tang',p.x,p.y,'d',0);if(F.ev.wk.st===1||F.ev.sp.st===1||(F.ev.wk.st===2&&Object.keys(WKI).every(k=>F.ev.wk[k]))||(F.ev.sp.st===2&&F.ev.sp.cheer&&F.ev.sp.sign))bang(p.x,p.y);
    const b=BED();cx.fillStyle='#4a6ab0';cx.fillRect(b.x-12-cX,b.y-10-cY,24,12);cx.fillStyle='#e8e0d0';cx.fillRect(b.x-12-cX,b.y-10-cY,7,6)}
  if(!onWorld())return;
  if(SCH()){const b=BUS_SCH();cx.fillStyle='#2a8a86';cx.fillRect(b.x-2-cX,b.y-26-cY,3,22);cx.fillStyle='#ffffff';cx.fillRect(b.x-8-cX,b.y-30-cY,16,8);cx.fillStyle='#2a8a86';cx.font='bold 6px Mitr,sans-serif';cx.fillText('รถ',b.x-6-cX,b.y-24-cY);
    const ph=PH();if(ph===2)Object.keys(GH).forEach(k=>{const p=spot(k,GH[k].tx,GH[k].ty);cx.save();cx.globalAlpha=F.ghosts[k]?.5:.16+.14*Math.sin(t*2+p.x);drawGhost(cx,k,p.x-cX,p.y-cY,t,.55);cx.restore()});
    if(ph===1&&kruoHere()){const p=kruoPos();spr('kruo',p.x,p.y,'d',Math.floor(t*2)%2);bang(p.x,p.y)}
    if(miniHere()){const p=miniPos();cx.save();cx.globalAlpha=.75;drawMon(cx,'mini',p.x+6-cX,p.y-cY+Math.sin(t*3)*2,t,.6);cx.restore()}
    if(PAR){PFLAGS().forEach((f,i)=>{if(i<PAR.i)return;cx.fillStyle='#5a3a20';cx.fillRect(f.x-cX,f.y-22-cY,2,22);cx.fillStyle=i===PAR.i?'#ffd34d':'#7a3ab0';cx.fillRect(f.x+2-cX,f.y-22-cY,9,6)});const left=Math.max(0,Math.ceil((PAR.lim-(performance.now()-PAR.t0))/1000));cx.fillStyle='#fff';cx.font='bold 9px Mitr,sans-serif';cx.fillText('⏱ '+left,W-40,H-8)}}
  const q=F.rq[F.cur];if(q){const giv=q.st===0||q.type==='fetch'||q.type==='trivia'||q.type==='duel'||(q.type==='find'&&q.st===2);spr(q.g.k,q.g.x,q.g.y,'d',0);if(giv)bang(q.g.x,q.g.y);
    if(q.type==='find'&&q.st===1)spark(q.t.x,q.t.y);if(q.type==='deliver'&&q.st===1){spr(q.k2,q.t.x,q.t.y,'d',0);bang(q.t.x,q.t.y,'#7ef08a')}}
  (SCRAPS[F.cur]||[]).forEach(([id,tx,ty])=>{if(F.lore[id])return;const p=spot('scr'+id,tx,ty);cx.fillStyle='#f4ecd8';cx.fillRect(p.x-3-cX,p.y-6-cY,7,5);cx.fillStyle='#8a7a5a';cx.fillRect(p.x-2-cX,p.y-5-cY,5,1)});
  const L=[];evTargets(L);L.forEach(o=>{if(o.act==='frWkItem')spark(o.x,o.y);else bang(o.x,o.y,'#7ef08a')});
  const room=S.map==='room';if(VILL()){const p=PH();if(p===1){cx.fillStyle='rgba(255,140,60,.14)';cx.fillRect(0,0,W,H)}}};
/* หมู่บ้าน: กลางวันไม่มืด เย็นเป็นสีส้ม กลางคืนใช้แสงงานตานเดิม */
const _vsky=drawVillageSky;
window.drawVillageSky=function(cX,cY,t){if(ON&&PH()!==2)return;return _vsky(cX,cY,t)};
const _quest=quest;
window.quest=function(){if(!ON)return _quest();const w=F.ev.wk,s=F.ev.sp;let hint='';
  if(w.st===1)hint='ไปหาครูตังค์ที่ห้อง 512';else if(w.st===2)hint='เตรียมพานไหว้ครู '+Object.keys(WKI).filter(k=>w[k]).length+'/4';else if(w.st===3||w.st===2.5)hint='ซ้อมเพลงกับครูตังค์';else if(w.st===4)hint=F.day<w.day?'พรุ่งนี้เช้าพิธีไหว้ครู':'ไปโดมกิจกรรมตอนเช้า';
  else if(s.st===1)hint='ครูตังค์เรียกประชุม';else if(w.st===0&&s.st===0&&window.LIFE)hint='ไหว้ครูเดือน มิ.ย. · กีฬาสีเดือน ธ.ค.';else if(s.st===2)hint='ซ้อมเชียร์ '+(s.cheer?'✓':'·')+' ทำป้าย '+(s.sign?'✓':'·');else if(s.st===3)hint='ขบวนพาเหรดที่สนาม';
  return dayLbl()+' · '+hhmm()+' '+PHN[PH()]+' · 🪙 '+F.coins+' · '+placeName()+(hint?' · '+hint:'')};
const _pause=fillPause;
window.fillPause=function(){_pause();if(!ON)return;const c=document.querySelector('#pause .card');if(c&&!c.querySelector('#pFree')){const d=document.createElement('div');d.id='pFree';
    d.innerHTML='<button class="btn" data-f="lore">📜 สมุดตำนาน</button><button class="btn" data-f="alb">🖼️ อัลบั้มภาพ</button><button class="btn" data-f="prog">✅ ความคืบหน้า</button>';
    d.onclick=async e=>{const b=e.target.closest('[data-f]');if(!b)return;document.querySelector('#pause').classList.add('hide');paused=false;busy=true;try{if(b.dataset.f==='lore')await loreBook();if(b.dataset.f==='alb')await album();if(b.dataset.f==='prog')await progress()}finally{busy=false}};
    const ref=c.querySelector('#pEasy');c.insertBefore(d,ref||null)}};

/* ---------------- การ์ดบนหน้าแรก ---------------- */
function titleCard(){const chs=document.querySelector('#title .chs');if(!chs||document.querySelector('#cFree'))return;const ok=c3done();
  const d=document.createElement('div');d.className='chc box';d.innerHTML='<div class="cht">โหมดเดินเล่นอิสระ'+(ok?'':' 🔒')+'</div><div class="chd">'+(ok?'ชีวิตโรงเรียนครบหนึ่งปี เข้าได้ทุกอาคาร หัวใจความสนิท ผอ. ครูอินโฟ งานประจำปี เควสสุ่ม ตำนานผีโรงเรียน และความลับอีกมาก':'ปลดล็อกเมื่อเล่นบทที่ 3 จบ')+'</div><div class="chb"><button class="btn g" id="cFree"'+(ok?'':' disabled')+'>▶ เดินเล่นอิสระ</button>'+(ok&&fload()?'<button class="btn" id="cFreeN">✦ เริ่มใหม่</button>':'')+'</div>';
  chs.appendChild(d);$('#cFree').onclick=startFree;const n=$('#cFreeN');if(n)n.onclick=()=>{if(!confirm('เริ่มโหมดอิสระใหม่? ความคืบหน้าในโหมดอิสระจะหายไป (บทที่ 1–3 ไม่เปลี่ยน)'))return;try{localStorage.removeItem(FK)}catch(e){}startFree()}}
buildExtraSprites();titleCard();
window.FREE={api:{fsave,coins,choose,openOv,snap:c=>snap(c),lore,album,walkFlash,TRIVIA,spotNear},get F(){return F},get on(){return ON},startFree,PH,skipTo,newRQ,ghostMeet,finale,GH,spot,BUS_SCH,TANG,BED,FIELDC,DOME,STANDS,INDUS,PFLAGS,WKI,EL4,TREE,kruoPos,miniPos,CHEDI,applyOutfit,evNotice};
})();
