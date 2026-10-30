/* ====================================================================
   ตำนานสรรพวาทิต ภาคแรก · ส่วนเสริม “หลังเลิกเรียน” (p1/dlc.js)
   ต่อยอดระบบเดิมของ pisat.html โดยไม่แตะเซฟบทที่ 1–3 (เก็บแยกที่ spw_pisat_x)
   · ปีศาจหลังเลิกเรียน: ทุกวันจะมีปีศาจเดิมกลับมาในร่างใหม่ 1 ตัวต่อบท ณ จุดสุ่มตามวันที่
   · กระดานเควสชมรม (ห้อง 512): เควสประจำวัน 3 อย่าง ทำครบได้รางวัลและสติกเกอร์
   · แท่นโน้ตเพลงของชมรม (ห้อง 512): เพลงที่ครูบันทึกในคลังโน้ตกลายเป็นด่าน “ฟังแล้วตีตามทีละวรรค”
   · สมุดสติกเกอร์: สะสมจากการเล่น เปิดได้จากกระดานหรือเมนูพัก
   พัฒนาโดย นายนนทพัทธ์ วงค์มูล 2026
   ==================================================================== */
'use strict';
(function(){
const XK='spw_pisat_x';
let X=(()=>{try{return JSON.parse(localStorage.getItem(XK)||'null')||{}}catch(e){return {}}})();
X.stk=X.stk||{};X.daily=X.daily||{};X.sb=X.sb||{};X.cnt=X.cnt||{};X.songs=X.songs||[];
const xsave=()=>{try{localStorage.setItem(XK,JSON.stringify(X))}catch(e){}};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const hsh=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const yday=()=>{const d=new Date();d.setDate(d.getDate()-1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};

/* ---------- สติกเกอร์ ---------- */
const STK={
  d_canteen:['🍳','ตะหลิวหลังเลิกเรียน','ชนะปีศาจตะหลิวร่างหลังเลิกเรียน'],d_library:['📕','ผีหนังสือรอบดึก','ชนะผีหนังสือร่างหลังเลิกเรียน'],d_dome:['🏟️','ยักษ์โดมก้องซ้ำ','ชนะยักษ์โดมร่างหลังเลิกเรียน'],
  d_pot:['🍲','หม้อแกงเดือดอีกรอบ','ชนะหม้อแกงร่างหลังเลิกเรียน'],d_saw:['🪚','เลื่อยรัวรอบสอง','ชนะหุ่นเลื่อยร่างหลังเลิกเรียน'],d_whistle:['📣','นกหวีดตั้งใจเป่า','ชนะนกหวีดร่างหลังเลิกเรียน'],
  d_folder:['🗂️','แฟ้มกองโตกว่าเดิม','ชนะปีศาจแฟ้มร่างหลังเลิกเรียน'],d_mist:['🌫️','หมอกขลุ่ยกลับบ้าน','ชนะหมอกขลุ่ยร่างหลังเลิกเรียน'],d_shadow:['🎭','เงาที่มีหน้าแล้ว','ชนะเงาวงปี่พาทย์ร่างหลังเลิกเรียน'],
  d_book2:['📓','สมุดโน้ตเล่มใหม่','ชนะสมุดโน้ตลายมือร่างหลังเลิกเรียน'],d_stove:['🔥','เตาถ่านรอบค่ำ','ชนะเตาถ่านร่างหลังเลิกเรียน'],d_log:['🪵','ขอนไม้กลับฝั่ง','ชนะขอนไม้ร่างหลังเลิกเรียน'],
  d_ember:['🌋','ถ่านแดงดับแล้ว','ชนะผีถ่านแดงร่างหลังเลิกเรียน'],d_bell:['🔔','ระฆังเลิกเรียน','ชนะระฆังร่างหลังเลิกเรียน'],
  q_first:['📌','เควสแรก','ทำเควสประจำวันสำเร็จครั้งแรก'],q_all:['✅','ครบทั้งวัน','ทำเควสประจำวันครบ 3 อย่าง'],streak3:['🔥','สามวันติด','ทำเควสครบ 3 วันติดกัน'],streak7:['🏆','เจ็ดวันติด','ทำเควสครบ 7 วันติดกัน'],
  ear5:['👂','หูทอง','ทายเสียงถูกครบ 5 ข้อในรอบเดียว'],find3:['🔎','นักสืบของหาย','เจอของหายครบ 3 ครั้ง'],roam10:['🎵','ต้อนโน้ตหลง','ชนะโน้ตหลงหรือควันน้อยรวม 10 ตัว'],
  song1:['📖','วรรคแรกจากคลัง','ตีตามเพลงจากคลังโน้ตครบหนึ่งท่อน'],song3s:['⭐','สามดาวเพลงชมรม','ได้สามดาวในท่อนเพลงจากคลัง'],song5:['📚','นักอ่านโน้ต','ตีตามเพลงจากคลังครบ 5 ท่อน']};
function sticker(id){if(!STK[id]||X.stk[id])return;X.stk[id]=today();xsave();setTimeout(()=>{banner('สติกเกอร์ใหม่! '+STK[id][0]+' '+STK[id][1],3200);try{sfx.get()}catch(e){}},400)}
const nStk=()=>Object.keys(X.stk).filter(k=>STK[k]).length;

/* ---------- ปีศาจหลังเลิกเรียน ---------- */
const DPOOL={1:['canteen','library','dome'],2:['pot','saw','whistle','folder','mist','shadow','book2','canteen','library','dome'],3:['stove','log','ember','bell']};
const MODS=[
  {id:'fast',n:'เร็วขึ้น',f:e=>{e.gap*=.88;e.slot*=.92}},
  {id:'long',n:'ทำนองยาวขึ้นหนึ่งลูก',f:e=>{e.phr=[e.phr[0]+1,e.phr[1]+1]}},
  {id:'tough',n:'ตัวแข็งเป็นพิเศษ',f:e=>{e.hp=Math.round(e.hp*1.35)}},
  {id:'ghost',n:'มีโน้ตหลอกแทรก',f:e=>{e.ghost=1}},
  {id:'dim',n:'ไฟช่วยน้อยลง',f:e=>{e.show=Math.max(1,(e.show||2)-1)}},
  {id:'call',n:'ลูกล้อลูกขัด',f:e=>{e.call=1}}];
const DLINES={
  canteen:['ป๊ง! ข้ากลับมาแล้ว! ฝึกตีกระทะมาทั้งคืน คราวนี้ตรงขึ้นนิดนึง… มั้ง','แม่ครัวไม่อยู่ ข้าขอยืมกระทะมาประลองอีกรอบ!'],
  library:['ชู่ว… หลังเลิกเรียนห้องสมุดเงียบมาก ข้าเลยหยิบโน้ตเพลงใหม่มาท้า','ข้าจัดหน้าหนังสือใหม่แล้ว แต่ยังเรียงผิดอยู่ดี มาตีตามข้าสิ!'],
  dome:['โด๊ม… โด๊ม… วันนี้เสียงก้องดังกว่าเมื่อวาน!','ข้าเพิ่งซ้อมระนาดในโดมมา ฟังดี ๆ นะ เสียงสะท้อนหลอกหูแน่'],
  pot:['ฉ่า! แกงหม้อใหม่เดือดกว่าเดิม!'],saw:['รื้อ… รื้อ… ข้ารัวได้เร็วขึ้นแล้ว!'],whistle:['ปรี๊ด! กรรมการคนเดิมกลับมาตัดสินใหม่!'],folder:['แฟ้มงานหลังเลิกเรียนกองสูงกว่าตึก!'],
  mist:['ข้าหลงมาอีกแล้ว… แต่คราวนี้ข้าเป่าขลุ่ยเป็นเพลงนะ'],shadow:['เงาข้ายังไม่มีหน้า… แต่มีจังหวะแล้ว ลองดู!'],book2:['ข้าเขียนโน้ตลายมือหน้าใหม่ อ่านออกไหมล่ะ'],
  stove:['ควันโขมงรอบค่ำ! ใครทนได้มาประลอง!'],log:['ข้าลอยทวนน้ำกลับมาท้าอีกรอบ!'],ember:['ถ่านข้ายังแดงอยู่นะ!'],bell:['เก๊ง! เก๊ง! หมดคาบแล้วแต่ข้ายังไม่เลิกดัง!']};
const worldMap=()=>S&&S.intro&&(S.map==='world'||S.map==='village');
function dState(){const ch=S.ch||1,d=today();let o=X.daily[ch];if(!o||o.day!==d){const r=hsh(d+':'+ch),pool=DPOOL[ch]||DPOOL[1];o=X.daily[ch]={day:d,base:pool[r%pool.length],mod:MODS[(r>>>5)%MODS.length].id,spot:(r>>>9)%curRoam().length,beaten:0};xsave()}return o}
const rp=(x,y)=>{try{if(window.LIFE&&S&&(S.map==='world'||S.map==='village')){const p=LIFE.reachNear(S.map==='village'?'village':'world',x,y);if(p)return {x:p.x,y:p.y}}}catch(e){}return {x:x*T+8,y:y*T+12}};
function dSpot(){const o=dState(),r=curRoam()[o.spot%curRoam().length];return rp(r.x,r.y)}
const dActive=()=>worldMap()&&ENEMY[dState().base]&&!dState().beaten;
async function dailyFight(){
  const o=dState(),src=ENEMY[o.base],mod=MODS.find(m=>m.id===o.mod)||MODS[0];
  const e=Object.assign({},src,{n:src.n+' · ร่างหลังเลิกเรียน',hp:Math.round(src.hp*1.15),phr:src.phr.slice()});
  ['item','item3','boss','final','haze'].forEach(k=>delete e[k]);mod.f(e);ENEMY.dlcDaily=e;
  await talk([[o.base,pick(DLINES[o.base]||['ข้ากลับมาแล้ว!'])],[null,'ร่างวันนี้: '+mod.n+' · ชนะแล้วได้สติกเกอร์ประจำตัว']]);
  const r=await battle('dlcDaily');
  if(r==='win'){o.beaten=1;xsave();sticker('d_'+o.base);const it=pick(['milk','moo','yadom','moo']);S.bag[it]=(S.bag[it]||0)+1;save();hud();
    await say(null,'ปีศาจหลังเลิกเรียนยอมแพ้! ได้ '+ITEMS[it].ic+' '+ITEMS[it].n+' · พรุ่งนี้มันจะกลับมาในร่างใหม่');await gainXP(Math.round((src.xp||30)*.8));qprog('daily')}}

/* ---------- เควสประจำวัน ---------- */
const QDEF={
  daily:{n:'ชนะปีศาจหลังเลิกเรียน',d:'ตามหาตัวที่มีวงแหวนทองในโรงเรียน (หรือในหมู่บ้าน บทที่ 3)',need:1},
  roam:{n:'ต้อนโน้ตหลงกลับเข้าจังหวะ 3 ตัว',d:'ชนะโน้ตหลง (บทที่ 3 คือควันน้อย) ที่เดินเพ่นพ่าน',need:3},
  find:{n:'ตามหาของหายแล้วเอามาคืนที่กระดาน',d:'',need:1},
  ear:{n:'ทายเสียงที่กระดานให้ถูก 4 จาก 5 ข้อ',d:'ฟังทำนองสั้น ๆ แล้วเลือกโน้ตที่ได้ยิน',need:1},
  song:{n:'ตีตามเพลงจากคลังโน้ตครบ 1 ท่อน',d:'ที่แท่นโน้ตเพลงในห้อง 512',need:1}};
const LOST=[['สมุดโน้ตของน้อง','📒'],['ไม้ตีฆ้องสำรอง','🥢'],['ผ้าเช็ดระนาด','🧻'],['ไม้ตีฉิ่งที่ผูกเชือกแดง','🔴'],['ขวดน้ำของพบธรรม','🧴']];
function qState(){const d=today();if(!X.q||X.q.day!==d){const r=hsh('q'+d);const a=r%2?'roam':'find',b=(r>>>3)%2?'ear':'song';const lost=LOST[(r>>>6)%LOST.length];
    X.q={day:d,list:[{id:'daily',p:0},{id:a,p:0},{id:b,p:0}],lost,got:0,back:0,spot:(r>>>9)};xsave()}return X.q}
function qprog(id,n){const q=qState(),it=q.list.find(x=>x.id===id);if(!it||it.done)return;it.p=Math.min(QDEF[id].need,it.p+(n||1));
  if(it.p>=QDEF[id].need){it.done=1;xsave();sticker('q_first');setTimeout(()=>banner('เควสสำเร็จ! '+QDEF[id].n+' · ไปรับรางวัลที่กระดานห้อง 512',3200),900);
    if(q.list.every(x=>x.done)){const y=yday();X.streak=X.lastAll===y?(X.streak||0)+1:(X.lastAll===today()?X.streak||1:1);X.lastAll=today();sticker('q_all');if(X.streak>=3)sticker('streak3');if(X.streak>=7)sticker('streak7')}}
  xsave()}
const findSpot=()=>{const q=qState(),P=curPicks(),p=P[q.spot%P.length];return rp(p.x,p.y)};
const findActive=()=>{const q=qState();return worldMap()&&q.list.some(x=>x.id==='find'&&!x.done)&&!q.got};

/* ---------- เพลงจากคลังโน้ต (แบ่งวรรคตามห้องเพลง) ---------- */
const BPP=8; /* ท่อนย่อยละ 8 ห้อง = 1 แถวของแผ่นโน้ต */
const built={};
function mk(raw){const k=raw.id+'|'+(raw.lines||[]).length;if(!built[k])built[k]=SB.build(raw);return built[k]}
function libSongs(){
  try{const Pw=window.parent;const L=(Pw&&Pw!==window&&Pw.APP&&Pw.APP.D&&Pw.APP.D.library)||null;
    if(L){const out=[];Object.keys(L).forEach(k=>{const x=L[k];if(!x||x.kind!=='song'||!x.song)return;const sg=x.song,ls=Array.isArray(sg.lines)?sg.lines:Object.values(sg.lines||{});
        const lines=ls.map(l=>({bars:String(l.bars||''),barsL:String(l.barsL||''),rep:+l.rep===2?2:0}));
        const raw={id:k,title:sg.title||x.title||'เพลง',by:x.by||'',bpm:sg.bpm||160,lines};
        if(SB.phrases(SB.build(raw)).length>=2)out.push(raw)});
      if(out.length){out.sort((a,b)=>a.title.localeCompare(b.title,'th'));X.songs=out.slice(0,40);xsave()}}}catch(e){}
  const lib=(X.songs||[]).filter(r=>r&&r.lines).map(mk);SB.setLib(lib);
  const have=new Set(lib.map(s=>s.title.trim()));
  return lib.concat(SB.builtin.filter(b=>!have.has(b.title.trim())))}
const partList=s=>{const ph=SB.phrases(s),m={};ph.forEach(p=>{const q=Math.floor(p.b0/BPP);(m[q]=m[q]||[]).push(p)});return Object.keys(m).map(Number).sort((a,b)=>a-b).map(q=>({q,ph:m[q]}))};
const parts=s=>partList(s).length;
async function songFight(s,pi){
  const pl=partList(s)[pi];if(!pl)return;const phr=pl.ph,nph=phr.length;let ph=0,ok=0,tot=0;
  const e=Object.assign({},ENEMY.library,{n:'ผีลืมเพลง · '+s.title,hp:100,atk:5,phr:[4,4],gap:.52,show:4,slot:.32,echoOnly:1});
  ['item','item3','boss','final','haze','call','ghost'].forEach(k=>delete e[k]);
  e.seqFn=(seq,len)=>{const q=phr[Math.min(ph,nph-1)];seq.length=0;q.n.forEach(g=>seq.push(g));const b=q.b0+1,b2=q.b1+1;ph++;e.show=ph<=2?q.n.length:ph<=4?2:1;if(BT)bmsg('ห้องเพลงที่ '+(b===b2?b:b+'–'+b2)+' · วรรคที่ '+ph+'/'+nph)};
  e.onEcho=res=>{res.forEach(v=>{tot++;if(v===1)ok++});if(BT){BT.hp=Math.max(0,Math.round(BT.max*(1-Math.min(1,ph/nph))));ebar();if(ph>=nph)BT.songDone=1}};
  ENEMY.dlcSong=e;
  await talk([['library','ชู่ว… หนังสือเพลง “'+s.title+'” ของข้าหน้าหลุดหมด! ข้าจำได้แค่ทำนอง'],['library','ข้าจะตีให้ฟังทีละห้องเพลง เจ้าตีตามให้ครบ แล้วข้าจะคืนเพลงให้ชมรม'],[null,'ท่อนที่ '+(pi+1)+'/'+parts(s)+' · '+nph+' วรรค (วรรคละ 1 ห้องเพลง) · วรรคแรก ๆ มีไฟช่วยครบ วรรคหลังไฟน้อยลง · จบแล้วจะได้ฟังเพลงเต็มหนึ่งรอบ']]);
  const r=await battle('dlcSong');
  if(r==='win'){const acc=tot?ok/tot:0,st=acc>=.9?3:acc>=.7?2:1;try{if(window.KT)KT.roll('pisat',st>=3)}catch(e){}const key=s.id+':'+pi,first=!X.sb[key];X.sb[key]=Math.max(X.sb[key]||0,st);X.cnt.songs=(X.cnt.songs||0)+(first?1:0);xsave();
    sticker('song1');if(st>=3)sticker('song3s');if(X.cnt.songs>=5)sticker('song5');qprog('song');
    await say(null,'คืนเพลง “'+s.title+'” ท่อนที่ '+(pi+1)+' ได้แล้ว! '+'★'.repeat(st)+'☆'.repeat(3-st)+' (ตีถูกตั้งแต่ครั้งแรก '+Math.round(acc*100)+'%)');await gainXP(10+st*5);
    await say('library','เพลงกลับมาครบแล้ว! ข้าจะตีทวนให้ฟังทั้งเพลงหนึ่งรอบ นั่งฟังให้ชื่นใจนะ');await replaySong(s)}}

/* ฟังเพลงเต็มหนึ่งรอบ (ตีทั้งสองมือตามโน้ตในคลัง) */
async function replaySong(s){
  if(!AC||!s||!s.bars.length)return;
  const slot=clamp(60/(+s.bpm||160),.26,.42),nb=s.bars.length,bl=slot*4;let stop=0;
  openOv('<h2>🎶 ฟังเพลง “'+esc(s.title)+'” ทั้งเพลง</h2><p id="rpB" style="font-size:15px;margin:6px 0">เตรียมตัว…</p><div class="rbar"><i id="rpF"></i></div><div id="rpN" class="rpn">&nbsp;</div><p style="font-size:12px;opacity:.7">'+nb+' ห้องเพลง · ฟังให้ครบแล้วเพลงจะถูกจดจำไว้</p><button class="btn s" data-a="skip">ข้ามไป ▶</button>');
  DLC.onBtn=a=>{if(a==='skip')stop=1};
  const t0=AC.currentTime+.4;let sched=0;
  const names=bar=>{const a=['–','–','–','–'];bar.r.forEach(e=>{const t=Math.round(e.t);if(!e.sub&&t>=0&&t<4)a[t]=TS.KNOTE[Math.max(...e.g)]||'?'});return a.join('  ')};
  const tick=()=>{const now=AC.currentTime;
    while(sched<nb&&t0+sched*bl<now+.8){const bar=s.bars[sched],bt=t0+sched*bl;bar.r.forEach(ev=>ev.g.forEach(g=>playInst('gong',g,bt+ev.t*slot,.9)));bar.l.forEach(ev=>ev.g.forEach(g=>playInst('gong',g,bt+ev.t*slot,.6)));sched++}
    const cur=Math.max(0,Math.min(nb-1,Math.floor((now-t0)/bl)));const B=document.getElementById('rpB');if(B&&now>=t0){B.textContent='ห้องเพลงที่ '+(cur+1)+' / '+nb;document.getElementById('rpF').style.width=Math.round((now-t0)/(nb*bl)*100)+'%';document.getElementById('rpN').textContent=names(s.bars[cur])}};
  const timer=setInterval(tick,70);
  await new Promise(res=>{const chk=setInterval(()=>{if(stop||AC.currentTime>t0+nb*bl+.8||ov.classList.contains('hide')){clearInterval(chk);res()}},120)});
  clearInterval(timer);closeOv();DLC.onBtn=null}

/* ---------- หน้าต่างของส่วนเสริม ---------- */
const css=document.createElement('style');css.textContent=`
#dlcOv .card{max-width:520px}
#dlcOv .ql{list-style:none;padding:0;margin:8px 0}#dlcOv .ql li{padding:8px 10px;margin:6px 0;border:2px solid #4a3570;border-radius:6px;background:#22163a;font-size:14px;line-height:1.4}
#dlcOv .ql li.ok{border-color:#7ef08a}#dlcOv .ql small{display:block;opacity:.75;font-size:12px}
#dlcOv .stk{display:grid;grid-template-columns:repeat(auto-fill,minmax(86px,1fr));gap:6px;margin:8px 0}
#dlcOv .stk div{border:2px solid #4a3570;border-radius:8px;background:#22163a;text-align:center;padding:6px 4px;font-size:11px;line-height:1.3}
#dlcOv .stk b{display:block;font-size:26px;line-height:1.2}#dlcOv .stk .no{opacity:.35;filter:grayscale(1)}
#dlcOv .row2{display:flex;gap:8px;flex-wrap:wrap}#dlcOv .row2 .btn{flex:1;min-width:120px}
#dlcOv .opt{display:grid;gap:6px;margin-top:8px}#dlcOv .opt .btn{margin:0;font-size:20px;letter-spacing:4px}
#dlcOv .rbar{height:10px;border-radius:5px;background:#22163a;border:2px solid #4a3570;overflow:hidden;margin:8px 0}#dlcOv .rbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffd34d,#ff8a4d)}#dlcOv .rpn{font-size:22px;letter-spacing:2px;text-align:center;margin:8px 0;min-height:30px;color:#ffd34d}
#dlcOv .sl .btn{text-align:left;font-size:14px}#dlcOv .sl .btn small{float:right;opacity:.8}
`;document.head.appendChild(css);
const ov=document.createElement('div');ov.id='dlcOv';ov.className='ov hide';ov.innerHTML='<div class="card box"></div>';(document.querySelector('#stage')||document.body).appendChild(ov);
const card=ov.querySelector('.card');
let ovRes=null;
function openOv(html){card.innerHTML=html;ov.classList.remove('hide');busy=true;for(const k in keys)keys[k]=0;card.scrollTop=0}
function closeOv(v){ov.classList.add('hide');busy=false;const r=ovRes;ovRes=null;if(r)r(v)}
const wait=()=>new Promise(r=>{ovRes=r});
ov.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;try{sfx.blip()}catch(x){}if(DLC.onBtn)DLC.onBtn(b.dataset.a,b)});

async function boardScreen(){
  const q=qState();let msg='';
  if(q.list.some(x=>x.id==='find'&&!x.done)&&q.got&&!q.back){q.back=1;xsave();qprog('find');X.cnt.find=(X.cnt.find||0)+1;xsave();if(X.cnt.find>=3)sticker('find3');msg='<p style="color:#7ef08a">คืน '+q.lost[1]+' '+esc(q.lost[0])+' ให้น้องแล้ว ขอบคุณมาก!</p>'}
  // รับรางวัลเควสที่ทำเสร็จ
  let gift=[];q.list.forEach(x=>{if(x.done&&!x.paid){x.paid=1;const it=x.id==='daily'?'moo':x.id==='song'||x.id==='ear'?'yadom':'milk';S.bag[it]=(S.bag[it]||0)+1;gift.push(ITEMS[it].ic+' '+ITEMS[it].n)}});
  if(gift.length){save();hud();xsave();msg+='<p style="color:#ffd34d">รับรางวัลเควส: '+gift.join(' · ')+(q.list.every(x=>x.done)&&!q.allPaid?' · โบนัสครบทั้งวัน +ประสบการณ์ 40':'')+'</p>'}
  const allBonus=q.list.every(x=>x.done)&&!q.allPaid;if(allBonus){q.allPaid=1;xsave()}
  const li=q.list.map(x=>{const D=QDEF[x.id];let d=D.d;if(x.id==='find')d=q.got?'เจอแล้ว! เอามาคืนที่กระดานนี้':'น้องทำ '+q.lost[1]+' '+q.lost[0]+' หล่นไว้ที่ไหนสักแห่งในโรงเรียน (มีประกายวิบวับ)';if(x.id==='daily'&&!S.intro)d='เริ่มเล่นบทก่อนแล้วปีศาจจะโผล่';
    return '<li class="'+(x.done?'ok':'')+'">'+(x.done?'✅ ':'⬜ ')+esc(D.n)+(D.need>1?' ('+x.p+'/'+D.need+')':'')+'<small>'+esc(d)+'</small></li>'}).join('');
  const hasEar=q.list.some(x=>x.id==='ear'&&!x.done);
  openOv('<h2>📌 กระดานเควสชมรม · '+esc(q.day)+'</h2>'+msg+'<ul class="ql">'+li+'</ul><p style="font-size:12px;opacity:.75">เควสเปลี่ยนทุกวัน · ทำครบ 3 อย่างติดกันหลายวันได้สติกเกอร์พิเศษ'+(X.streak?' · ตอนนี้ครบติดกัน '+X.streak+' วัน':'')+'</p>'+
    '<div class="row2">'+(hasEar?'<button class="btn g" data-a="ear">👂 ทายเสียง</button>':'')+'<button class="btn" data-a="book">📒 สมุดสติกเกอร์ ('+nStk()+'/'+Object.keys(STK).length+')</button></div><button class="btn s" data-a="close">ปิด</button>');
  DLC.onBtn=a=>{if(a==='close')closeOv();if(a==='book'){closeOv('book')}if(a==='ear')closeOv('ear')};
  const r=await wait();if(allBonus)await gainXP(40);
  if(r==='book')return bookScreen(boardScreen);if(r==='ear')return earQuiz()}
async function bookScreen(back){
  const ks=Object.keys(STK);
  openOv('<h2>📒 สมุดสติกเกอร์ '+nStk()+'/'+ks.length+'</h2><div class="stk">'+ks.map(k=>{const s=STK[k],h=X.stk[k];return '<div class="'+(h?'':'no')+'" title="'+esc(s[2])+'"><b>'+(h?s[0]:'❔')+'</b>'+esc(h?s[1]:s[2])+'</div>'}).join('')+'</div><button class="btn s" data-a="close">ปิด</button>');
  DLC.onBtn=a=>{if(a==='close')closeOv()};await wait();if(back)return back()}
async function earQuiz(){
  audio();const R=5;let right=0;
  for(let r=0;r<R;r++){const seq=[];for(let i=0;i<3;i++){let g;do{g=ri(0,7)}while(seq.length&&g===seq[seq.length-1]);seq.push(g)}
    const alt=()=>{const a=seq.slice(),i=ri(0,2);let g;do{g=clamp(a[i]+pick([-2,-1,1,2]),0,7)}while(g===a[i]);a[i]=g;return a};
    const opts=[seq];while(opts.length<3){const a=alt();if(!opts.some(o=>o.join()===a.join()))opts.push(a)}opts.sort(()=>Math.random()-.5);
    const nm=a=>a.map(g=>TS.KNOTE[GONGS[g]]).join(' ');
    const play=()=>{if(!AC)return;const t0=AC.currentTime+.08;seq.forEach((g,i)=>playInst('gong',GONGS[g],t0+i*.5,.95))};
    openOv('<h2>👂 ทายเสียง ข้อ '+(r+1)+'/'+R+'</h2><p>ฟังทำนอง 3 ลูก แล้วเลือกโน้ตที่ได้ยิน (ด ร ม ฟ ซ ล ท ดํ เรียงจากต่ำไปสูง)</p><button class="btn" data-a="play">▶ ฟังอีกครั้ง</button><div class="opt">'+opts.map((o,i)=>'<button class="btn g" data-a="o'+i+'">'+nm(o)+'</button>').join('')+'</div><p id="eRes" style="min-height:22px"></p>');
    setTimeout(play,250);
    const pickI=await new Promise(res=>{DLC.onBtn=a=>{if(a==='play')play();else if(a[0]==='o')res(+a.slice(1))}});
    const good=opts[pickI].join()===seq.join();if(good)right++;try{good?sfx.ok():sfx.bad()}catch(e){}
    card.querySelector('#eRes').innerHTML=good?'<b style="color:#7ef08a">ถูกต้อง!</b>':'<b style="color:#ff8a8a">ยังไม่ใช่ คำตอบคือ '+nm(seq)+'</b>';
    card.querySelectorAll('[data-a^=o]').forEach(b=>b.disabled=true);await sleep(1300)}
  const pass=right>=4;if(right>=5)sticker('ear5');if(pass)qprog('ear');
  openOv('<h2>👂 ทายเสียง · ได้ '+right+'/'+R+'</h2><p>'+(pass?'หูดีมาก! เควสทายเสียงสำเร็จ':'เกือบแล้ว! ต้องถูก 4 ข้อขึ้นไป ลองใหม่ได้ทันที')+'</p><div class="row2">'+(pass?'':'<button class="btn g" data-a="again">ลองใหม่</button>')+'<button class="btn" data-a="close">กลับกระดาน</button></div>');
  DLC.onBtn=a=>{if(a==='again')closeOv('again');if(a==='close')closeOv()};const r2=await wait();if(r2==='again')return earQuiz();return boardScreen()}
async function standScreen(){
  const L=libSongs();
  const inApp=(()=>{try{return !!(window.parent!==window&&window.parent.APP)}catch(e){return false}})();
  const list='<div class="sl">'+L.map((s,i)=>{const np=partList(s);let row='<div style="margin:8px 0 2px;font-size:13px;opacity:.85">'+esc(s.title)+(s.src==='sb'?' <small>(ทำนองเพลงไทยเดิม)</small>':'')+' · '+s.bars.length+' ห้อง</div>';
      np.slice(0,8).forEach((pl,p)=>{const st=X.sb[s.id+':'+p]||0;row+='<button class="btn" data-a="s'+i+':'+p+'">ท่อน '+(p+1)+' · ห้อง '+(pl.q*BPP+1)+'–'+Math.min(s.bars.length,pl.q*BPP+BPP)+'<small>'+(st?'★'.repeat(st)+'☆'.repeat(3-st):'ใหม่')+'</small></button>'});
      return row+'<button class="btn" data-a="h'+i+'" style="font-size:13px;opacity:.9">🔊 ฟังเพลงเต็มก่อน</button>'}).join('')+'</div>';
  openOv('<h2>🎼 แท่นโน้ตเพลงของชมรม</h2><p style="font-size:13px">เลือกเพลง ผีลืมเพลงจะตีให้ฟังทีละห้องเพลง ตีตามให้ครบเพื่อคืนเพลงให้ชมรม จบแล้วฟังเพลงเต็มหนึ่งรอบ'+(inApp?'':' (เปิดเกมจากในแอปชมรมหนึ่งครั้ง เกมจะจำเพลงในคลังไว้)')+'</p>'+list+'<button class="btn s" data-a="close">ปิด</button>');
  DLC.onBtn=a=>{if(a==='close')closeOv();else if(a[0]==='s'||a[0]==='h')closeOv(a)};
  const r=await wait();if(!r)return;busy=true;try{if(r[0]==='h')await replaySong(L[+r.slice(1)]);else{const [i,p]=r.slice(1).split(':').map(Number);await songFight(L[i],p)}}finally{busy=false}}

/* ---------- ต่อเข้ากับระบบเดิม ---------- */
const BOARD=()=>({x:2*T,y:2*T+14,lb:'กระดานเควสชมรม',act:'dlcBoard'});
const STAND=()=>({x:12*T+8,y:7*T+10,lb:'แท่นโน้ตเพลงของชมรม',act:'dlcStand'});
const _near=nearest;
window.nearest=function(){const b=_near();if(!S||!S.intro)return b;const fx=S.x,fy=S.y-6;let best=b,bd=b?(b.x!=null?Math.hypot(b.x-fx,b.y-fy):12):99;
  const c=[];if(S.map==='room'&&!S.rm){c.push(BOARD(),STAND())}
  if(dActive()){const p=dSpot();c.push({x:p.x,y:p.y,lb:'ท้าประลองปีศาจหลังเลิกเรียน',act:'dlcDaily'})}
  c.forEach(o=>{const d=Math.hypot(o.x-fx,o.y-fy);if(d<22&&d<bd){bd=d;best=o}});return best};
const _doAct=doAct;
window.doAct=async function(n){if(n&&n.act==='dlcBoard')return boardScreen();if(n&&n.act==='dlcStand')return standScreen();if(n&&n.act==='dlcDaily')return dailyFight();return _doAct(n)};
const _battle=battle;let depth=0;
window.battle=function(k){depth++;return _battle(k).then(r=>{depth--;if(!depth&&r==='win'&&(k==='note'||k==='puff')){X.cnt.roam=(X.cnt.roam||0)+1;xsave();if(X.cnt.roam>=10)sticker('roam10');qprog('roam')}
  /* ข้าวแต๋นฟรีจากครูตังค์: ลุ้นเมื่อชนะปีศาจตัวสำคัญ (ไม่นับโน้ตหลง/ควันน้อย) */
  if(!depth&&r==='win'&&k!=='note'&&k!=='puff'&&k!=='dlcSong'){try{if(window.KT)KT.roll('pisat',true)}catch(e){}}return r})};
const _upd=updateWorld;
window.updateWorld=function(dt){_upd(dt);if(!S||busy||mode!=='world')return;
  if(findActive()){const p=findSpot();if(Math.hypot(S.x-p.x,S.y-p.y)<14){const q=qState();q.got=1;xsave();try{sfx.get()}catch(e){}banner('เจอ '+q.lost[1]+' '+q.lost[0]+' แล้ว! เอาไปคืนที่กระดานเควสในห้อง 512',3200)}}
  if(worldMap()&&!DLC.toldDay&&dActive()){DLC.toldDay=1;setTimeout(()=>banner('มีปีศาจหลังเลิกเรียนโผล่มาแล้ว! มองหาวงแหวนทอง · เควสวันนี้ดูที่กระดานห้อง 512',3600),1500)}};
const _draw=drawWorld;
window.drawWorld=function(t){_draw(t);if(!S||!S.intro)return;const cX=Math.round(camX),cY=Math.round(camY);
  if(S.map==='room'&&!S.rm){const b=BOARD(),s=STAND();
    // กระดานไม้ก๊อกบนผนัง
    cx.fillStyle='#6a4426';cx.fillRect(T+2-cX,3-cY,2*T+4,24);cx.fillStyle='#c89a5a';cx.fillRect(T+4-cX,5-cY,2*T,20);
    [['#fff3a0',T+7,8],['#ffb0c8',T+19,10],['#a8e0ff',T+29,7]].forEach(([c,x,y])=>{cx.fillStyle=c;cx.fillRect(x-cX,y-cY,9,9);cx.fillStyle='#d03030';cx.fillRect(x+4-cX,y-cY,2,2)});
    const q=qState(),done=q.list.filter(x=>x.done).length;cx.fillStyle='#2a1a10';cx.font='bold 7px Mitr,sans-serif';cx.fillText('เควส '+done+'/3',T+8-cX,24-cY);
    if(q.list.some(x=>x.done&&!x.paid)||(q.got&&!q.back)){cx.fillStyle='#ffd34d';cx.font='bold 10px Mitr,sans-serif';cx.fillText('!',b.x+2-cX,b.y-22-cY+Math.sin(t*5)*2)}
    // แท่นโน้ต
    const x=s.x-cX,y=s.y-cY;cx.fillStyle='#2a1a10';cx.fillRect(x-1,y-16,2,16);cx.fillRect(x-5,y-1,10,2);cx.fillStyle='#3a2a20';cx.fillRect(x-8,y-24,16,10);cx.fillStyle='#f4ecd8';cx.fillRect(x-7,y-23,14,8);
    cx.fillStyle='#2a1a10';for(let i=0;i<3;i++)cx.fillRect(x-6,y-21+i*2.5,12,1);cx.fillStyle='#c69bff';cx.font='bold 9px Mitr,sans-serif';cx.fillText('♪',x+7,y-24+Math.sin(t*3)*2)}
  if(dActive()){const p=dSpot(),x=p.x-cX,y=p.y-cY;if(x>-30&&x<W+30&&y>-40&&y<H+30){cx.strokeStyle='rgba(255,211,77,'+(.5+.4*Math.sin(t*4))+')';cx.lineWidth=2;cx.beginPath();cx.ellipse(x,y,14+Math.sin(t*4)*2,5,0,0,7);cx.stroke();drawMon(cx,dState().base,x,y,t,.55);cx.fillStyle='#ffd34d';cx.font='bold 10px Mitr,sans-serif';cx.fillText('!',x-2,y-34+Math.sin(t*5)*2)}}
  if(findActive()){const p=findSpot(),x=p.x-cX,y=p.y-cY,k=(Math.sin(t*6)+1)/2;cx.fillStyle='rgba(255,240,160,'+(.35+.4*k)+')';cx.beginPath();cx.arc(x,y-4,5+k*2,0,7);cx.fill();cx.fillStyle='#fff';cx.fillRect(x-1,y-12-k*3,2,2);cx.fillRect(x+5,y-8,2,2);cx.fillRect(x-6,y-6,1,1)}};
const _quest=quest;
window.quest=function(){const s=_quest();if(!S||!S.intro)return s;const q=qState(),n=q.list.filter(x=>x.done).length;return s+(n<3?' · 📌 เควสวันนี้ '+n+'/3':'')};
const _pause=fillPause;
window.fillPause=function(){_pause();const c=document.querySelector('#pause .card');if(c&&!c.querySelector('#pDlc')){const b=document.createElement('button');b.className='btn';b.id='pDlc';b.textContent='📒 สมุดสติกเกอร์ · เควสวันนี้';
    b.onclick=async()=>{document.querySelector('#pause').classList.add('hide');paused=false;await bookScreen()};const ref=c.querySelector('#pEasy');c.insertBefore(b,ref||null)}
  const b=document.querySelector('#pDlc');if(b)b.textContent='📒 สมุดสติกเกอร์ '+nStk()+'/'+Object.keys(STK).length};
window.DLC={get X(){return X},qState,dState,dSpot,findSpot,boardScreen,standScreen,bookScreen,earQuiz,dailyFight,songFight,libSongs,STK,today,onBtn:null,toldDay:0,sticker};
})();
