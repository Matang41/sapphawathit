/* ====================================================================
   songbook.js — คลังทำนองเพลงไทยจริง ใช้ร่วมกันทุกเกม (ตำนานสรรพวาทิต ภาค 1 ใช้ตีกับผี/บอส/ผีลืมเพลง)
   · ห้องเพลง 1 ห้อง = 4 ช่อง (ตรงกับ “บันทึกโน้ตเพลงไทย” ของชมรม)
   · เพลงในคลังความรู้ของชมรม (kind:"song") ถอดเป็นห้อง ๆ ได้ด้วย SB.build()
   · เพลงติดตัว (builtin) เป็นทำนองเพลงไทยเดิม ถอดจากโน้ตที่เผยแพร่บนเว็บ แล้วแปลงเป็นลูกฆ้อง
     ระบบเดาช่วงเสียง (สูง/ต่ำ) จากการเคลื่อนที่ของทำนองที่ใกล้ที่สุด เพราะโน้ตบนเว็บไม่ระบุช่วงเสียง
     ฉบับร่าง ควรให้ครูตรวจกับผู้ชำนาญ แล้วแก้ใน “บันทึกโน้ตเพลงไทย” ได้ (ครูกด “นำเข้าเพลงไทยเดิม” ที่หน้าเกมในแอป)
   · ที่มาของโน้ต: gotoknow “พยาบาลกับดนตรีไทย” (ลาวดำเนินทราย ๒ ชั้น, ลาวจ้อย ๒ ชั้น) และบทความ
     gotoknow.org/posts/392807 (ทะเลบ้า ๒ ชั้น, แขกมอญบางขุนพรหม ๒ ชั้น) — ทำนองเพลงไทยเดิม
   พัฒนาโดย นายนนทพัทธ์ วงค์มูล 2026
   ==================================================================== */
(function(){
'use strict';
if(window.SB)return;
const DEG={'ด':0,'ร':1,'ม':2,'ฟ':3,'ซ':4,'ช':4,'ล':5,'ท':6};
const fold=g=>{while(g>10)g-=7;while(g<3)g+=7;return g-3};   /* ลูกฆ้อง 3..10 → ปุ่ม 0..7 */

/* ---------- โน้ตตัวอักษรไทย (ด ร ม ฟ ซ ล ท) → ลูกฆ้อง 0..15 ---------- */
function thai(text){
  const bars=[];let prev=7;
  String(text).replace(/หยุด/g,' ').split(/[\s|]+/).filter(Boolean).forEach(b=>{
    if(b.length!==4)return;
    const r=[];
    [...b].forEach((c,t)=>{
      if(!(c in DEG))return;
      const d=DEG[c],cand=[];for(let k=-1;k<=2;k++){const g=3+d+7*k;if(g>=0&&g<=15)cand.push(g)}
      cand.sort((a,z)=>Math.abs(a-prev)-Math.abs(z-prev)||Math.abs(a-7)-Math.abs(z-7));
      const g=cand[0];prev=g;r.push({t,g:[g]});
    });
    bars.push({r,l:[]});
  });
  return bars;
}

/* ---------- โน้ตในคลัง (a–p, -, (ab), [span,t:..], ~) → เหตุการณ์ในห้อง ---------- */
function tokNotes(str){const out=[];let i=0;while(i<str.length){const c=str[i];
  if(c==='-'){out.push([]);i++}
  else if(c==='('){const j=str.indexOf(')',i);out.push(str.slice(i+1,j).split('').map(x=>x.charCodeAt(0)-97).filter(x=>x>=0&&x<16));i=j+1}
  else{const v=c.charCodeAt(0)-97;out.push(v>=0&&v<16?[v]:[]);i++}}return out}
function decBar(b){
  const ev=[];let i=0,slot=0;b=String(b||'');
  while(i<b.length&&slot<4){const c=b[i];
    if(c==='~'){slot++;i++}
    else if(c==='['){const j=b.indexOf(']',i);if(j<0)break;const body=b.slice(i+1,j),k=body.indexOf(':'),hd=body.slice(0,k).split(','),span=Math.max(1,Math.min(4,+hd[0]||1)),toks=tokNotes(body.slice(k+1));
      toks.forEach((g,n)=>{if(g.length)ev.push({t:slot+n*span/toks.length,g,sub:n>0})});slot++;i=j+1}
    else if(c==='('){const j=b.indexOf(')',i);if(j<0)break;const g=b.slice(i+1,j).split('').map(x=>x.charCodeAt(0)-97).filter(x=>x>=0&&x<16);if(g.length)ev.push({t:slot,g});slot++;i=j+1}
    else{const v=c.charCodeAt(0)-97;if(v>=0&&v<16)ev.push({t:slot,g:[v]});slot++;i++}}
  return ev;
}
/* raw = {id,title,by,bpm,lines:[{bars,barsL,rep}]} (รูปแบบเดียวกับที่ “บันทึกโน้ตเพลงไทย” เก็บ) */
function build(raw){
  const bars=[];
  (raw.lines||[]).forEach(l=>{
    const R=String(l.bars||'').trim().split(/\s+/).filter(Boolean),L=String(l.barsL||'').trim().split(/\s+/).filter(Boolean);
    for(let rep=0;rep<(+l.rep===2?2:1);rep++)R.forEach((b,i)=>bars.push({r:decBar(b),l:L[i]?decBar(L[i]):[]}));
  });
  return {id:raw.id,title:raw.title||'เพลง',by:raw.by||'',bpm:+raw.bpm||160,bars,src:raw.src||'lib'};
}
/* ห้องเพลงเป็นวรรค: ห้องที่มีโน้ตตั้งแต่ 2 ตัวขึ้นไปเป็น 1 วรรค · ห้องที่มีตัวเดียวควบกับห้องถัดไป · ห้องเงียบข้าม */
const topOf=bar=>bar.r.filter(e=>!e.sub).map(e=>fold(Math.max(...e.g)));
function phrases(s){
  if(s._ph)return s._ph;
  const out=[];let acc=[],b0=-1;
  s.bars.forEach((bar,i)=>{const n=topOf(bar);if(!n.length)return;if(b0<0)b0=i;acc=acc.concat(n);
    if(acc.length>=2){out.push({n:acc,b0,b1:i});acc=[];b0=-1}});
  if(acc.length){if(out.length){const l=out[out.length-1];l.n=l.n.concat(acc);l.b1=s.bars.length-1}else out.push({n:acc,b0:Math.max(0,b0),b1:s.bars.length-1})}
  return s._ph=out;
}

/* ---------- เพลงติดตัว: ทำนองเพลงไทยเดิม ---------- */
const RAW=[
 {key:'laodamnoen',title:'ลาวดำเนินทราย ๒ ชั้น ท่อน ๑',text:
  '---ร ดดดด ดรดล -ช-ม -ม-ม ชดรม -ช-ล ชมชล '+
  '-ล-ล ชมชล -ด-ร ดมรร --รม รรรร ชลชม ชรมช '+
  '-ช-ช -ด-ร -มชร มรดล -ล-ล ชมชล ดรดล ดชชช '+
  '-ช-ช ชมชล ดรดล ดชชช -ดรม -ช-ล -ดรม ชรมช '+
  '---ล ชมรด ---ร มรชม --มช มมมม ชลชม ชรมช '+
  '-ช-ช -ด-ร -มชร มรดล -ล-ล ชมชล -ดรม -ร-ด'},
 {key:'laojoi',title:'ลาวจ้อย ๒ ชั้น',text:
  '---ด รมชร ---- -ม-ร ---ด รมชร มรดร -ม-ช '+
  '---ม ชลดช ---ม รดรม --ชล -ด-ร มรดล --ดช '+
  '---ล -ชชช -ช-ล ดรมล --ชม -ช-ล --ชล ดชชช '+
  '---ล -ชชช ชมรด -ร-ม ---- -ช-ร มรดร -ม-ด'},
 {key:'talebaa',title:'ทะเลบ้า ๒ ชั้น ท่อน ๑',text:
  '-มซล --ดล -ร-ล -ดดด -รรร -ม-ซ -ล-ด ---ด '+
  '-มซล --ดล -ร-ล -ดดด -รรร -ม-ร ดทลซ ---ซ '+
  '-มซล ดซลด ซลดร มดรม -ลซม -ร-ด -รมซ -ร-ม '+
  '---- ---ม -มมม --มม'},
 {key:'khaekmon',title:'แขกมอญบางขุนพรหม ๒ ชั้น (บางท่อน)',text:
  '---ซ --ฟซ --ลซ ฟรฟซ ---ซ --ฟซ --ลซ ฟรฟร '+
  '---ซ --ฟซ --ลซ ฟรฟซ -ฟซล -รฟซ -ดรฟ -ทดร '+
  '-มมม ซมรด รดลด -ร-ฟ ซฟลซ ลฟซร ฟรซฟ ซรฟด '+
  'ซลทด รดทล ซฟซล ซลทด รรรซ รฟรด ทดซล ทรดท'}
];
const builtin=RAW.map(r=>({id:'sb:'+r.key,key:r.key,title:r.title,by:'ทำนองเพลงไทยเดิม (ฉบับร่างจากเว็บ)',bpm:144,bars:thai(r.text),src:'sb'}));

/* แปลงเป็นรูปแบบเพลงในคลังความรู้ (ให้ครูเปิดแก้ใน “บันทึกโน้ตเพลงไทย” ได้) */
function toLibSong(s,author){
  const lines=[];
  for(let i=0;i<s.bars.length;i+=8){
    const seg=s.bars.slice(i,i+8);
    const enc=b=>{const a=['-','-','-','-'];b.r.forEach(e=>{if(e.t>=0&&e.t<4&&Number.isInteger(e.t))a[e.t]=String.fromCharCode(97+e.g[0])});return a.join('')};
    lines.push({label:'ท่อน '+(lines.length+1),bars:seg.map(enc).join(' '),barsL:seg.map(()=>'----').join(' ')});
  }
  return {id:'song_sb_'+s.key,libId:'song_sb_'+s.key,title:s.title,voice:'khong',rate:2,bpm:s.bpm,natab:'pk2',mix:{khong:true,drum:true,ching:true},
    author:author||{name:'ทำนองเพลงไทยเดิม',sid:''},hands:true,west:{tr:0,chords:true},lines,at:Date.now()};
}

/* ---------- ทำนองสั้นสุ่มจากเพลงจริง ไว้ให้ศัตรูในเกมตี ---------- */
let LIB=[];
function setLib(list){LIB=(list||[]).filter(s=>s&&s.bars&&s.bars.length)}
function pool(){return builtin.concat(LIB)}
function randomPhrase(len){
  len=Math.max(2,Math.min(8,len|0||3));
  const ps=pool();if(!ps.length)return null;
  for(let t=0;t<8;t++){
    const s=ps[Math.floor(Math.random()*ps.length)],ph=phrases(s);if(!ph.length)continue;
    let i=Math.floor(Math.random()*ph.length),n=[];
    for(let k=0;k<ph.length&&n.length<len;k++){n=n.concat(ph[(i+k)%ph.length].n)}
    n=n.slice(0,len);
    if(n.length>=2&&new Set(n).size>=2)return n;
  }
  return null;
}

window.SB={builtin,build,phrases,fold,topOf,decBar,toLibSong,setLib,randomPhrase,thai};
})();
