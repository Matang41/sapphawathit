/* ====================================================================
   songbook.js — คลังทำนองเพลงไทยจริง ใช้ร่วมกันทุกเกม (ตำนานสรรพวาทิต ภาค 1 ใช้ตีกับผี/บอส/ผีลืมเพลง)
   · หลักการบันทึกโน้ตเพลงไทยที่ใช้แบ่งวรรคในทุกเกม
       1 ห้องเพลง = 4 หน่วยเคาะ (ลูกตกอยู่ที่ตัวที่ 4 ของห้อง)
       4 ห้องเพลง = 1 จังหวะหน้าทับ (อัตราสองชั้น)
       1 บรรทัด  = 8 ห้องเพลง = วรรคหน้า 4 ห้อง + วรรคหลัง 4 ห้อง
     เกมใช้ “1 บรรทัด” เป็นหน่วยวรรคเพลง ไม่ตัดกลางห้อง ไม่ข้ามบรรทัด
     บรรทัดนับใหม่ทุกครั้งที่ขึ้นท่อนใหม่ในคลังโน้ต (บรรทัดสุดท้ายของท่อนอาจสั้นกว่า 8 ห้อง)
     ที่มา: DLTV วิชาดนตรีไทย “ในหนึ่งบรรทัดจะประกอบด้วยห้องเพลงทั้งหมด 8 ห้องเพลง”
            trueplookpanya “ในหนึ่งห้อง แบ่งออกได้เป็น 4 จังหวะ” · วิทยานิพนธ์ จุฬาฯ “หนึ่งประโยคมีสี่ห้องเพลงหรือหนึ่งจังหวะหน้าทับ”
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
  const bars=[],sec=[];
  (raw.lines||[]).forEach((l,li)=>{
    const R=String(l.bars||'').trim().split(/\s+/).filter(Boolean),L=String(l.barsL||'').trim().split(/\s+/).filter(Boolean);
    for(let rep=0;rep<(+l.rep===2?2:1);rep++){const b0=bars.length;
      R.forEach((b,i)=>bars.push({r:decBar(b),l:L[i]?decBar(L[i]):[]}));
      if(bars.length>b0)sec.push({b0,b1:bars.length-1,label:(l.label||('ท่อน '+(li+1)))+(rep?' (ซ้ำ)':'')})}
  });
  return {id:raw.id,title:raw.title||'เพลง',by:raw.by||'',bpm:+raw.bpm||160,bars,sec,src:raw.src||'lib'};
}
/* ---------- แบ่งเพลงเป็นบรรทัด (หน่วยวรรคเพลงของทุกเกม) ----------
   คืนรายการบรรทัด {b0,b1,nb,label,sec, ev:[{b,t,g}], n:[g], bars}
   b = ห้องที่ 0–7 ในบรรทัด · t = หน่วยเคาะ 0–3 ในห้อง · g = ปุ่ม 0–7 (ด–ดํ) */
const LINE=8,HALF=4;
const topOf=bar=>bar.r.filter(e=>!e.sub).map(e=>fold(Math.max(...e.g)));
function lines(s){
  if(s._ln)return s._ln;
  const out=[],secs=(s.sec&&s.sec.length)?s.sec:[{b0:0,b1:s.bars.length-1,label:''}];
  secs.forEach((c,ci)=>{
    for(let a=c.b0;a<=c.b1;a+=LINE){
      const b1=Math.min(c.b1,a+LINE-1),ev=[];
      for(let b=a;b<=b1;b++)s.bars[b].r.forEach(e=>{if(!e.sub)ev.push({b:b-a,t:Math.max(0,Math.min(3,Math.round(e.t))),g:fold(Math.max(...e.g))})});
      ev.sort((x,y)=>x.b-y.b||x.t-y.t);
      if(ev.length)out.push({b0:a,b1,nb:b1-a+1,label:c.label,sec:ci,ev,n:ev.map(x=>x.g),bars:s.bars.slice(a,b1+1)});
    }});
  return s._ln=out;
}
/* เดิมเกมเรียก phrases() — ตอนนี้ “วรรค” = 1 บรรทัด */
const phrases=lines;

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
const builtin=RAW.map(r=>{const bars=thai(r.text);return {id:'sb:'+r.key,key:r.key,title:r.title,by:'ทำนองเพลงไทยเดิม (ฉบับร่างจากเว็บ)',bpm:144,bars,sec:[{b0:0,b1:bars.length-1,label:r.title}],src:'sb'}});

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

/* ---------- บรรทัดเพลงสุ่มจากเพลงจริง ไว้ให้ศัตรูในเกมตี ----------
   ศัตรูตีเต็มบรรทัดเสมอ (8 ห้อง) · ความยากของศัตรูเดิม (len) ใช้เป็น “จำนวนลูกท้ายบรรทัดที่ต้องจำเอง”
   เกมจะแสดงโน้ตบรรทัดนั้นบนจอ ลูกต้น ๆ มีชื่อโน้ตให้อ่าน ลูกท้าย ๆ ซ่อนไว้ให้ฟังแล้วจำ
   คืนอาร์เรย์ปุ่ม และติด .unit = บรรทัด (มี title) ไว้ให้เกมวาดแถบโน้ตและเล่นตามจังหวะจริง */
let LIB=[];
function setLib(list){LIB=(list||[]).filter(s=>s&&s.bars&&s.bars.length)}
function pool(){return builtin.concat(LIB)}
function randomLine(len,maxN){
  const ps=pool();if(!ps.length)return null;const all=[];
  ps.forEach(s=>lines(s).forEach(u=>{if(u.n.length>=3&&new Set(u.n).size>=2&&(!maxN||u.n.length<=maxN))all.push([s,u])}));
  if(!all.length)return null;
  const [s,u]=all[Math.floor(Math.random()*all.length)];
  const r=u.n.slice();r.unit=Object.assign({title:s.title},u);return r;
}
const randomPhrase=len=>randomLine(len);

/* ---------- แถบโน้ตบรรทัด (ใช้ร่วมทุกเกม) ----------
   ntl(unit, labels, {show, res, k}) → HTML 8 ห้อง ห้องละ 4 ช่อง เว้นช่องระหว่างวรรคหน้า–วรรคหลัง
   labels[i] = ชื่อโน้ตลูกที่ i (ลูกที่ i ≥ show แสดงเป็น • ให้จำเอง) */
function ntl(u,labels,o){
  o=o||{};const show=o.show==null?999:o.show,res=o.res||[],k=o.k==null?-1:o.k,at={};
  u.ev.forEach((e,i)=>at[e.b*4+e.t]=i);
  let h='';
  for(let b=0;b<u.nb;b++){
    if(b===HALF)h+='<i class="sbn-gap"></i>';
    h+='<span class="sbn-bar">';
    for(let q=0;q<4;q++){const i=at[b*4+q];
      if(i==null){h+='<b class="sbn-c sbn-r">-</b>';continue}
      const r=res[i],seen=i<show||r!=null,cls='sbn-c'+(seen?'':' sbn-h')+(r===1?' sbn-ok':r===2?' sbn-ok2':r===0?' sbn-bad':'')+(i===k?' sbn-cur':'')+(q===3?' sbn-tk':'');
      h+='<b class="'+cls+'">'+(seen?(labels[i]||'?'):'•')+'</b>'}
    h+='</span>'}
  return h;
}
(function css(){if(typeof document==='undefined'||document.getElementById('sbnCss'))return;const st=document.createElement('style');st.id='sbnCss';
  st.textContent='.sbn{display:flex;align-items:center;justify-content:center;gap:3px;font-family:Mitr,sans-serif;pointer-events:none}'+
  '.sbn-bar{display:inline-flex;border:1px solid #7a6aa0;border-radius:4px;background:rgba(18,10,30,.88);overflow:hidden}'+
  '.sbn-c{display:inline-block;width:var(--cw,18px);text-align:center;font-weight:600;font-size:var(--fs,12px);line-height:1.75;color:#ffe9a8;border-right:1px solid rgba(255,255,255,.07)}'+
  '.sbn-c:last-child{border-right:0}.sbn-r{color:#5a4a72;font-weight:400}.sbn-h{color:#a898c8}.sbn-tk{box-shadow:inset 0 -2px 0 rgba(255,233,168,.35)}'+
  '.sbn-ok{background:#2f6a3a;color:#eaffea}.sbn-ok2{background:#7a6a1a;color:#fff6c8}.sbn-bad{background:#8a2a2a;color:#ffe0e0}.sbn-cur{outline:2px solid #fff;outline-offset:-2px}'+
  '.sbn-gap{display:inline-block;width:8px}';
  (document.head||document.documentElement).appendChild(st)})();

window.SB={builtin,build,lines,phrases,fold,topOf,decBar,toLibSong,setLib,randomPhrase,randomLine,ntl,LINE,HALF,thai};
})();
