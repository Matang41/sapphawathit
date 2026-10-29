/* ====================================================================
   khaotaen.js — รางวัลแห่งการขำขัน “ข้าวแต๋นฟรีจากครูตังค์” (ใช้ร่วมทุกเกม)
   · เกมเรียก KT.roll('ชื่อเกม', เล่นดีไหม) ตอนจบรอบ ถ้าเล่นดีมีโอกาสสุ่มได้คูปองข้าวแต๋น
   · ได้ไม่เกินวันละ 1 ใบต่อเครื่อง · คูปองมีรหัส KT-XXXX-YY (YY คือเลขตรวจ) เอาไปแลกข้าวแต๋นจริงกับครูตังค์
   · ครูตรวจและตัดคูปองได้ที่หน้า “เกม” ในแอป (บันทึกการแลกไว้ที่ ktused/{รหัส} ของชมรม)
   · คูปองที่ได้เก็บในเครื่องที่ localStorage คีย์ spw_khaotaen
   พัฒนาโดย นายนนทพัทธ์ วงค์มูล 2026
   ==================================================================== */
(function(){
'use strict';
if(window.KT)return;
const KEY='spw_khaotaen',CHANCE=.1,PERDAY=1,AB='23456789ABCDEFGHJKLMNPQRSTUVWXYZ',SALT='สรรพวาทิต2458·ขนฺตีหิตสุขาวหา';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')||{list:[]}}catch(e){return {list:[]}}};
const store=o=>{try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function h32(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
const chk=b=>{const h=h32(b+SALT);return AB[h%32]+AB[(h>>>5)%32]};
function make(){let b='';const r=new Uint32Array(4);try{crypto.getRandomValues(r)}catch(e){for(let i=0;i<4;i++)r[i]=Math.random()*1e9}for(let i=0;i<4;i++)b+=AB[r[i]%32];return 'KT-'+b+'-'+chk(b)}
/* ตรวจรหัส: คืน รหัสมาตรฐาน หรือ null */
function verify(code){const c=String(code||'').toUpperCase().replace(/[^0-9A-Z]/g,'');const m=c.match(/^KT([0-9A-Z]{4})([0-9A-Z]{2})$/);if(!m)return null;return chk(m[1])===m[2]?'KT-'+m[1]+'-'+m[2]:null}
const NAMES={'khong-wong':'ฆ้องวงใหญ่แสนกล','klong-khaek':'กลองแขกคู่ขวัญ',hoo:'หูทองสรรพวาทิต',klongluang:'แห่กลองหลวง',pisat:'ตำนานสรรพวาทิต ภาคแรก',pisat2:'ตำนานสรรพวาทิต ภาค 2'};
const LINES=['ครูตังค์ทอดข้าวแต๋นเองกับมือ… ไหม้นิดหน่อย แต่ใจเต็มร้อย','ข้าวแต๋นแผ่นนี้ราดน้ำแตงโมเคี่ยวสูตรลับ ห้ามบอกครูโอ เดี๋ยวมาขอ','เก่งขนาดนี้ ครูตังค์ขอให้ข้าวแต๋นหนึ่งแผ่น! (ครูกินไปแล้วครึ่งแผ่นระหว่างทาง)',
  'รางวัลแห่งความขยัน: ข้าวแต๋นกรอบ ๆ หนึ่งแผ่น เคี้ยวเป็นจังหวะฉิ่ง–ฉับได้ด้วย','พบธรรมบอกว่าจะบริหารข้าวแต๋นให้… ครูเลยเอามาให้เองดีกว่า','ข้าวแต๋นแผ่นนี้ผ่านการไหว้ครูมาแล้ว อร่อยขึ้น 15 เปอร์เซ็นต์ (ครูวัดเอง)'];
const css=`#ktOv{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(12,6,18,.78);font-family:Mitr,Sarabun,system-ui,sans-serif;padding:14px;-webkit-user-select:text;user-select:text}
#ktOv .c{background:linear-gradient(180deg,#fff4d6,#ffe2a8);color:#3a2200;border:4px solid #8a5a10;border-radius:18px;max-width:380px;width:100%;max-height:100%;overflow:auto;padding:14px 16px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.5);animation:ktIn .5s cubic-bezier(.2,1.6,.4,1)}
#ktOv .t{display:flex;align-items:center;gap:10px;justify-content:center}#ktOv img{width:64px;height:64px;image-rendering:pixelated;border-radius:50%;border:3px solid #8a5a10;background:#f2c14e}
#ktOv .r{font-size:56px;line-height:1;animation:ktSpin 1.6s ease-in-out infinite}#ktOv h3{margin:6px 0 4px;font-size:19px;color:#a0400a}#ktOv p{margin:6px 0;font-size:14px;line-height:1.5}
#ktOv .code{font:700 26px/1.2 ui-monospace,Menlo,monospace;letter-spacing:3px;background:#3a2200;color:#ffe08a;border-radius:10px;padding:8px 6px;margin:8px 0}
#ktOv .s{font-size:12px;opacity:.8}#ktOv button{font:600 16px Mitr,sans-serif;border:0;border-radius:12px;padding:10px 18px;background:#a0400a;color:#fff;margin-top:8px;cursor:pointer}
@keyframes ktIn{from{transform:scale(.3) rotate(-8deg);opacity:0}to{transform:none;opacity:1}}@keyframes ktSpin{0%,100%{transform:rotate(-12deg) scale(1)}50%{transform:rotate(12deg) scale(1.12)}}`;
function face(){try{const P=window.PX||(window.parent!==window&&window.parent.PX);if(P&&P.avatar&&P.PRESETS&&P.PRESETS.tang)return P.avatar(P.PRESETS.tang,96,'#f2c14e')}catch(e){}return ''}
function nameOf(){try{return (new URLSearchParams(location.search).get('name')||'').trim().slice(0,30)}catch(e){return ''}}
function show(cp){const old=document.getElementById('ktOv');if(old)old.remove();if(!document.getElementById('ktCss')){const s=document.createElement('style');s.id='ktCss';s.textContent=css;document.head.appendChild(s)}
  const d=document.createElement('div');d.id='ktOv';const f=face();
  d.innerHTML='<div class="c"><div class="t">'+(f?'<img alt="ครูตังค์" src="'+f+'">':'')+'<div class="r"><svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#f3dfae" stroke="#d9b56a" stroke-width="3"/><circle cx="20" cy="22" r="2.6" fill="#fff4d8"/><circle cx="30" cy="16" r="2.6" fill="#fff4d8"/><circle cx="42" cy="20" r="2.6" fill="#fff4d8"/><circle cx="16" cy="34" r="2.6" fill="#fff4d8"/><circle cx="26" cy="30" r="2.6" fill="#fff4d8"/><circle cx="38" cy="30" r="2.6" fill="#fff4d8"/><circle cx="48" cy="34" r="2.6" fill="#fff4d8"/><circle cx="22" cy="44" r="2.6" fill="#fff4d8"/><circle cx="34" cy="42" r="2.6" fill="#fff4d8"/><circle cx="44" cy="46" r="2.6" fill="#fff4d8"/><circle cx="30" cy="52" r="2.6" fill="#fff4d8"/><circle cx="40" cy="10" r="2.6" fill="#fff4d8"/><path d="M12 30c8-6 14 6 22-2s14 4 18-2M14 42c8-5 12 5 20-1s12 3 16-3M20 18c6-3 10 3 16-1s8 2 12-1" fill="none" stroke="#c0601a" stroke-width="2.6" stroke-linecap="round"/></svg></div></div><h3>รางวัลพิเศษ! ข้าวแต๋นฟรีจากครูตังค์</h3><p>'+LINES[Math.floor(Math.random()*LINES.length)]+'</p>'+
    '<div class="code">'+cp.code+'</div><p class="s">'+(cp.name?cp.name+' · ':'')+(NAMES[cp.game]||cp.game)+' · '+cp.day+'</p><p>แคปหน้าจอหรือจดรหัสนี้ไว้ แล้วไปแลกข้าวแต๋นจริงกับครูตังค์ที่ห้อง 512<br><span class="s">หนึ่งรหัสแลกได้ครั้งเดียว · ดูคูปองทั้งหมดได้ที่หน้า “เกม” ในแอป</span></p><button type="button">เก็บไว้แล้ว!</button></div>';
  ['keydown','keyup','pointerdown','touchstart'].forEach(ev=>d.addEventListener(ev,e=>e.stopPropagation()));
  d.querySelector('button').onclick=()=>d.remove();(document.body||document.documentElement).appendChild(d);
  try{const AC=new (window.AudioContext||window.webkitAudioContext)(),t=AC.currentTime;[784,988,1175,1568].forEach((fq,i)=>{const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.value=fq;g.gain.setValueAtTime(.0001,t+i*.09);g.gain.exponentialRampToValueAtTime(.18,t+i*.09+.01);g.gain.exponentialRampToValueAtTime(.0001,t+i*.09+.35);o.connect(g);g.connect(AC.destination);o.start(t+i*.09);o.stop(t+i*.09+.4)});setTimeout(()=>AC.close(),1500)}catch(e){}}
/* เรียกตอนจบรอบ: ok = เล่นดีพอจะลุ้นรางวัล · คืนคูปองถ้าได้ */
function roll(game,ok,force){if(!ok&&!force)return null;const o=load(),d=today();const n=o.list.filter(x=>x.day===d).length;if(n>=PERDAY&&!force)return null;if(!force&&Math.random()>=CHANCE)return null;
  const cp={code:make(),game:String(game||''),day:d,at:Date.now(),name:nameOf()};o.list.unshift(cp);o.list=o.list.slice(0,60);store(o);
  try{if(window.parent!==window)window.parent.postMessage({source:'sapphawathit-game',type:'khaotaen',game:cp.game,code:cp.code},'*')}catch(e){}
  setTimeout(()=>show(cp),700);return cp}
window.KT={roll,verify,list:()=>load().list,show,NAMES};
})();
