/* ====================================================================
   ตำนานสรรพวาทิต ภาค เจ็ดเสียงที่หายไปในแม่สอด — ฉากหลัง (art.js)
   วาดเป็นพิกเซลจากภาพถ่ายที่ครูส่ง (ห้อง 512 ถนนแม่สอด ตลาดริมเมย ป่า บึงน้ำ วงปี่พาทย์พม่า)
   และข้อมูลอ้างอิงออนไลน์ (อุโมงค์ไผ่ทิวไผ่งาม บ่อน้ำร้อนแม่กาษา น้ำตกธารารักษ์) — ไม่ใช้ภาพถ่ายในเกมโดยตรง
   ==================================================================== */
'use strict';
const ROOM_END=1240,DOOR=[1172,1222];
const layerW=f=>Math.ceil(LV.w*f+WMAX);
function skyCanvas(stops,clouds,stars,seed){const [c,x]=mk(WMAX,H);const gr=x.createLinearGradient(0,0,0,H);stops.forEach(([p,col])=>gr.addColorStop(p,col));x.fillStyle=gr;x.fillRect(0,0,WMAX,H);
  const r=seeded(seed||7);if(stars)for(let i=0;i<70;i++){x.fillStyle='rgba(255,255,240,'+(.3+r()*.6)+')';x.fillRect(r()*WMAX,r()*150,1,1)}
  if(clouds)for(let i=0;i<9;i++){const cx=r()*WMAX,cy=10+r()*70,s=8+r()*14;x.fillStyle=clouds;for(let j=0;j<5;j++){x.beginPath();x.arc(cx+j*s*.7,cy+(j%2?-s*.3:0),s*(.6+r()*.4),0,7);x.fill()}}return c}
function hills(x,w,base,amp,col,seed,step){const r=seeded(seed);x.fillStyle=col;x.beginPath();x.moveTo(0,H);let y=base;for(let i=0;i<=w;i+=step||20){y=clamp(y+(r()-.5)*amp,base-amp*2,base+amp);x.lineTo(i,y)}x.lineTo(w,H);x.closePath();x.fill()}
function blob(x,cx,cy,r0,cols,n,r){for(let i=0;i<n;i++){x.fillStyle=cols[Math.floor(r()*cols.length)];x.beginPath();x.arc(cx+(r()-.5)*r0*2,cy+(r()-.5)*r0,r0*(.35+r()*.4),0,7);x.fill()}}
function texRow(x0,x1,y,h,a,b,step){for(let i=Math.floor(x0/step)*step;i<x1;i+=step)R(g,(i/step)%2?a:b,i-cam,y,step/2,h)}

/* ---------- พื้น (วาดทุกเฟรมตามกล้อง) ---------- */
function floorMaker(segs){return c=>{const a=Math.max(0,Math.floor(c)),b=Math.min(LV.w,Math.ceil(c+W));
  for(const s of segs){const x0=Math.max(a,s.x0),x1=Math.min(b,s.x1);if(x1<=x0)continue;FLOORS[s.k](x0,x1,c,s)}
  for(const h of LV.haz){const x0=Math.max(a,h.x),x1=Math.min(b,h.x+h.w);if(x1<=x0)continue;
    if(h.kind==='water'||h.kind==='hot'){const top=h.kind==='hot'?'#7ad0c0':'#5a9a8a';g.fillStyle=top;g.fillRect(x0-c,GY+6,x1-x0,H-GY);g.fillStyle=h.kind==='hot'?'#c8f0e0':'#9ac8b8';for(let i=x0;i<x1;i+=14)g.fillRect(i-c+((T*20+i)%14),GY+8+((i/14)%3)*5,6,1)}
    else{g.fillStyle='#120a10';g.fillRect(x0-c,GY,x1-x0,H-GY)}}}}
const FLOORS={
  room(x0,x1,c){R(g,'#c48a52',x0-c,GY,x1-x0,22);for(let x=Math.floor(x0/4)*4;x<x1;x+=4){R(g,(x/4)%2?'#b87e48':'#cc9660',x-c,GY+((x/4)%3),2,1);R(g,'#b07642',x-c+2,GY+8+((x/8)%2)*6,2,1)}
    for(let m=0;m<x1;m+=170)if(m>=x0-2)R(g,'#5a3420',m-c,GY,2,22);R(g,'#5a3420',x0-c,GY,x1-x0,1);R(g,'#5a3420',x0-c,GY+21,x1-x0,1);
    R(g,'#9ab8d6',x0-c,GY+22,x1-x0,H-GY-22);for(let x=Math.floor(x0/30)*30;x<x1;x+=30)R(g,'#b8cee4',x-c,GY+22,1,H-GY-22);R(g,'#b8cee4',x0-c,GY+31,x1-x0,1)},
  night(x0,x1,c){FLOORS.room(x0,x1,c);g.fillStyle='rgba(10,16,48,.6)';g.fillRect(x0-c,GY,x1-x0,H-GY)},
  concrete(x0,x1,c){R(g,'#9c9c96',x0-c,GY,x1-x0,H-GY);R(g,'#b4b4ae',x0-c,GY,x1-x0,2);for(let x=Math.floor(x0/36)*36;x<x1;x+=36)R(g,'#8a8a84',x-c,GY+2,1,H-GY);R(g,'#8a8a84',x0-c,GY+18,x1-x0,1);R(g,'rgba(255,255,255,.12)',x0-c,GY+4,x1-x0,3)},
  dirt(x0,x1,c,s){R(g,s.c1||'#8a6a44',x0-c,GY,x1-x0,H-GY);R(g,s.c2||'#6a4e30',x0-c,GY,x1-x0,2);for(let x=Math.floor(x0/9)*9;x<x1;x+=9){R(g,s.c3||'#a08058',x-c,GY+5+((x*7)%13),2,1);R(g,s.c2||'#6a4e30',x-c+4,GY+12+((x*3)%17),3,1)}
    if(s.leaf)for(let x=Math.floor(x0/17)*17;x<x1;x+=17)R(g,(x/17)%2?'#c8a040':'#8aa840',x-c+((x*5)%7),GY+1+((x*11)%5),3,1)},
  rock(x0,x1,c){R(g,'#7a7468',x0-c,GY,x1-x0,H-GY);R(g,'#9a9484',x0-c,GY,x1-x0,2);for(let x=Math.floor(x0/23)*23;x<x1;x+=23){R(g,'#625c52',x-c,GY+6+((x*7)%9),12,1);R(g,'#8a8476',x-c+6,GY+16+((x*3)%11),9,1)}},
  tile(x0,x1,c){R(g,'#c8b8a0',x0-c,GY,x1-x0,H-GY);R(g,'#a89880',x0-c,GY,x1-x0,2);for(let x=Math.floor(x0/24)*24;x<x1;x+=24)R(g,'#b0a088',x-c,GY+2,1,H-GY);R(g,'#b0a088',x0-c,GY+14,x1-x0,1);R(g,'#b0a088',x0-c,GY+28,x1-x0,1)},
  board(x0,x1,c){R(g,'#8a5a30',x0-c,GY,x1-x0,H-GY);for(let y=GY;y<H;y+=6)R(g,'#6a4020',x0-c,y,x1-x0,1);R(g,'#b07a40',x0-c,GY,x1-x0,2)},
  road(x0,x1,c){R(g,'#5a5a5e',x0-c,GY,x1-x0,H-GY);R(g,'#8a7a5a',x0-c,GY,x1-x0,4);for(let x=Math.floor(x0/40)*40;x<x1;x+=40)R(g,'#e8e0c0',x-c,GY+20,18,2)}};

/* ---------- ฉาก 1 และ 7: ห้อง 512 (จากภาพถ่ายจริงสามมุม) ---------- */
function drawRoom512(x,r,night){
/* ---------- ห้อง 512 ---------- */
  // เพดานและคาน
  R(x,'#f3f4f1',0,0,ROOM_END,30);for(let bx=150;bx<ROOM_END;bx+=330){R(x,'#e5e7e3',bx,0,22,38);R(x,'#cfd2cd',bx,36,22,2)}
  // ผนังขาว
  R(x,'#e9ecee',0,30,ROOM_END,190);const wg=x.createLinearGradient(0,30,0,220);wg.addColorStop(0,'rgba(255,255,255,.35)');wg.addColorStop(1,'rgba(120,130,140,.12)');x.fillStyle=wg;x.fillRect(0,30,ROOM_END,190);
  // หลอดไฟเพดาน
  for(let lx=60;lx<ROOM_END;lx+=170){R(x,'#d9dcd6',lx,26,46,6);R(x,'#ffffff',lx+2,27,42,3);for(let i=0;i<42;i+=6)R(x,'#e6ebe6',lx+2+i,27,1,3)}
  // หน้าต่างบานเกล็ด (โปร่ง เห็นข้างนอก) + บานไม้ซี่กรงด้านล่าง  — ซ้ายของห้อง
  const louver=(x0,x1,y0,y1)=>{x.clearRect(x0,y0,x1-x0,y1-y0);for(let y=y0+2;y<y1-1;y+=5)R(x,'rgba(246,246,240,.94)',x0,y,x1-x0,3);R(x,'#3a2a22',x0-2,y0-2,x1-x0+4,2);R(x,'#3a2a22',x0-2,y1,x1-x0+4,2);for(let xx=x0-2;xx<=x1;xx+=Math.max(40,(x1-x0)/4))R(x,'#3a2a22',xx,y0-2,2,y1-y0+4)};
  louver(40,420,46,86);
  // บานไม้ด้านล่าง: บางบานเปิด เห็นซี่กรงและข้างนอก
  R(x,'#3a2a22',38,88,384,2);R(x,'#3a2a22',38,150,384,3);
  for(let wx=40,i=0;wx<420;wx+=32,i++){if(i%4===1||i%4===2){x.clearRect(wx,90,32,60);for(let b=wx+3;b<wx+32;b+=6)R(x,'#2a1a14',b,90,2,60)}else{R(x,'#55331f',wx,90,32,60);for(let b=wx+4;b<wx+32;b+=7)R(x,'#45281a',b,92,2,56);R(x,'#6a4028',wx,90,32,2);R(x,'#3a2216',wx+31,90,1,60)}}
  // หน้าต่างบานเกล็ดด้านขวาของห้องและเหนือประตู
  louver(980,1240,46,86);
  // พัดลมติดผนัง
  const fan=(fx)=>{R(x,'#d8d8d2',fx-3,36,6,10);x.fillStyle='#f0f0ec';x.beginPath();x.arc(fx,56,12,0,7);x.fill();x.strokeStyle='#b8b8b0';x.lineWidth=1;for(let a=0;a<6.3;a+=.5){x.beginPath();x.moveTo(fx,56);x.lineTo(fx+Math.cos(a)*12,56+Math.sin(a)*12);x.stroke()}R(x,'#c0c0b8',fx-2,54,4,4)};
  fan(470);fan(820);
  // ลำโพงเสียงตามสาย (ที่มาของเงาคำลวง)
  R(x,'#8a8f96',946,40,22,16);R(x,'#5a5f66',948,42,18,12);for(let i=0;i<5;i++)R(x,'#3a3f46',950,43+i*2.4,14,1);R(x,'#6a6f76',955,56,4,6);
  // โต๊ะหมู่บูชาเล็กข้างหน้าต่าง (ไหว้ครู)
  R(x,'#4a2c1e',62,186,70,4);R(x,'#3a2216',66,190,4,32);R(x,'#3a2216',124,190,4,32);R(x,'#5a3624',72,172,50,14);R(x,'#6a4028',84,162,26,10);
  R(x,'#e8c060',93,148,8,14);R(x,'#f4d880',95,145,4,4);R(x,'#c89a3a',91,160,12,3);
  [[76,160],[112,160]].forEach(([vx,vy])=>{R(x,'#c0a050',vx,vy+4,6,8);R(x,'#f2c94c',vx-2,vy-4,4,4);R(x,'#ffde59',vx+3,vy-6,4,4);R(x,'#5aa84a',vx+2,vy,2,4)});
  R(x,'#e8e4dc',76,176,10,8);R(x,'#7a6a5a',77,177,8,6);
  // โต๊ะครู โน้ตบุ๊ก เก้าอี้พลาสติก
  R(x,'#5a3624',148,196,60,4);R(x,'#3a2216',150,200,3,22);R(x,'#3a2216',203,200,3,22);R(x,'#3a2216',150,206,56,2);R(x,'#c8c8d0',160,186,22,10);R(x,'#9aa0b8',162,188,18,7);R(x,'#2a2a30',184,190,14,6);
  R(x,'#ecece8',218,182,24,4);R(x,'#ecece8',220,186,4,36);R(x,'#ecece8',238,186,4,36);R(x,'#dcdcd6',218,166,24,4);R(x,'#ecece8',220,170,20,12);
  // ระนาดเอก (รางทองแกะลาย) บนม้านั่งไม้
  const ranad=(rx,thum)=>{R(x,'#5a3624',rx+8,206,6,16);R(x,'#5a3624',rx+52,206,6,16);R(x,'#4a2c1e',rx+6,204,54,3);
    x.fillStyle='#c9a24a';x.beginPath();x.moveTo(rx,thum?182:178);x.quadraticCurveTo(rx+33,thum?194:200,rx+66,thum?182:178);x.lineTo(rx+60,204);x.lineTo(rx+6,204);x.closePath();x.fill();
    x.fillStyle='#8a6a2a';for(let i=8;i<60;i+=6){R(x,'#a07c34',rx+i,190,3,8);R(x,'#e8c870',rx+i+1,191,1,2)}R(x,'#e8c870',rx+2,thum?183:179,4,3);R(x,'#e8c870',rx+60,thum?183:179,4,3);
    for(let i=0;i<9;i++){const kx=rx+10+i*5.4,ky=thum?185:187-Math.sin(i/8*3.14)*4;R(x,'#2a1810',kx,ky,4,3);R(x,'#4a2c1e',kx,ky,4,1)}};
  ranad(250,0);ranad(330,1);
  // กลองทัดคู่
  const that=(dx,dw)=>{R(x,'#4a2418',dx,194,dw,28);R(x,'#5c2e1e',dx+2,194,dw-4,28);R(x,'#3a1a10',dx,206,dw,2);R(x,'#e8dcc0',dx-1,192,dw+2,3);for(let i=2;i<dw;i+=4){R(x,'#c0a060',dx+i,195,1,1);R(x,'#c0a060',dx+i,219,1,1)}};
  that(420,26);that(452,30);
  // โต๊ะยาวผ้าขาวจับจีบ (วางเครื่องดนตรี)
  R(x,'#5a3624',500,176,470,4);x.fillStyle='#f4f4f6';x.fillRect(500,180,470,34);for(let i=500;i<970;i+=7){R(x,'#dcdce2',i,180,2,34);R(x,'#ffffff',i+3,182,1,30)}R(x,'#cacad0',500,212,470,2);
  // ขิมเรียงบนพื้น
  for(let i=0;i<6;i++){const kx=508+i*76;R(x,'#2a1c18',kx,214,68,8);R(x,'#3c2a22',kx+2,214,64,2);for(let s=0;s<6;s++)R(x,'#c8b890',kx+6+s*10,216,6,1)}
  // บนโต๊ะ: กลองยาว/โทนตั้ง · ฆ้องโหม่งกรอบทอง · ฆ้องวงใหญ่ · ฆ้องวงเล็ก · ฉากทองลายแดง · ตะโพน
  [[506,10,26],[518,10,30],[530,12,28],[543,10,24]].forEach(([gx,gw,gh])=>{R(x,'#d8c08a',gx,176-gh,gw,gh);R(x,'#b89a60',gx,176-gh,gw,2);for(let y=176-gh+4;y<176;y+=4)R(x,'#c4aa70',gx,y,gw,1)});
  R(x,'#d4aa40',562,128,26,48);R(x,'#f0d070',564,130,22,3);R(x,'#7a5418',566,136,18,30);x.fillStyle='#3a3a34';x.beginPath();x.arc(575,150,8,0,7);x.fill();x.fillStyle='#6a6a5c';x.beginPath();x.arc(575,150,3,0,7);x.fill();
  const wong=(wx,ww,n)=>{R(x,'#b02828',wx,160,ww,4);R(x,'#b02828',wx,170,ww,4);for(let i=0;i<=n;i++){R(x,'#8a1a1a',wx+i*ww/n,160,2,16);R(x,'#e8c060',wx+i*ww/n,157,2,3)}for(let i=0;i<n;i++){const gx=wx+4+i*(ww-8)/n;R(x,'#5a4a2a',gx,164,(ww-8)/n-2,5);R(x,'#c8a050',gx+((ww-8)/n-2)/2-2,163,4,3)}};
  wong(596,128,9);wong(734,96,8);
  R(x,'#d0a040',860,118,60,58);for(let i=0;i<5;i++){R(x,'#a02828',864+i*11,124,8,46);R(x,'#f0d070',866+i*11,126,4,42);R(x,'#c03030',867+i*11,140,2,12)}R(x,'#f0d070',856,114,68,5);
  R(x,'#5c2e1e',928,150,30,22);R(x,'#e8dcc0',926,152,3,18);R(x,'#e8dcc0',956,154,3,14);R(x,'#3a1a10',934,172,4,4);R(x,'#3a1a10',948,172,4,4);
  // กระดานไวต์บอร์ด + กระดาษ “ฉันเล่นดนตรีเพื่อ…”
  R(x,'#9a9ea4',604,90,260,64);R(x,'#f6f6f2',607,93,254,58);R(x,'#e6e6e0',734,93,2,58);for(let i=0;i<14;i++)R(x,'#c8ccd4',620+r()*220,100+r()*44,6+r()*20,1);R(x,'#b4b8be',620,152,24,3);
  [['#ffe27a',640,104],['#9fe0ff',668,112],['#ffb0c8',700,102],['#b8f0a0',748,108],['#ffe27a',780,100],['#ffc890',812,112],['#9fe0ff',838,104]].forEach(([cc,px,py])=>{R(x,cc,px,py,16,14);R(x,'rgba(0,0,0,.18)',px+2,py+14,16,1);R(x,'#d03030',px+7,py-1,2,2);for(let l=0;l<3;l++)R(x,'rgba(60,40,30,.5)',px+3,py+4+l*3,10-l*2,1)});
  // ซออู้ห้าคัน · ซอด้วงห้าคัน แขวนผนัง · จะเข้บนม้านั่ง
  for(let i=0;i<5;i++){const sx=990+i*14;R(x,'#3a2418',sx,98,2,56);R(x,'#5a3624',sx-3,104,8,2);R(x,'#5a3624',sx-3,112,8,2);x.fillStyle='#3a2014';x.beginPath();x.ellipse(sx+1,158,6,7,0,0,7);x.fill();R(x,'#5a3020',sx-3,154,3,3)}
  R(x,'#e0e2dc',1062,110,8,12);R(x,'#8a8a84',1064,114,4,3);R(x,'#7a2a2a',1060,128,12,16);R(x,'#d8c8b0',1062,130,8,12);
  for(let i=0;i<5;i++){const sx=1082+i*15;R(x,'#2a1810',sx,96,2,58);x.fillStyle='#2a1810';x.beginPath();x.moveTo(sx,96);x.quadraticCurveTo(sx+6,96,sx+5,104);x.lineTo(sx+2,100);x.fill();R(x,'#5a3624',sx-3,106,8,2);R(x,'#5a3624',sx-3,114,8,2);R(x,'#4a2418',sx-2,152,7,8);R(x,'#6a3a24',sx-2,152,7,2)}
  const jakhe=(jx)=>{R(x,'#5a3624',jx+4,204,6,18);R(x,'#5a3624',jx+60,204,6,18);R(x,'#4a2a1a',jx,190,46,12);x.fillStyle='#6a3a20';x.beginPath();x.ellipse(jx+56,196,16,8,0,0,7);x.fill();R(x,'#d8c890',jx+6,188,58,1);for(let i=0;i<8;i++)R(x,'#e8d8a8',jx+14+i*5,186,2,3)};
  jakhe(984);jakhe(1078);
  // ประตูข้าง เปิดออกลานต้นไม้ (โปร่ง เห็นข้างนอก)
  x.clearRect(DOOR[0],46,DOOR[1]-DOOR[0],176);R(x,'#3a2a22',DOOR[0]-3,44,3,178);R(x,'#3a2a22',DOOR[1],44,3,178);R(x,'#3a2a22',DOOR[0]-3,86,DOOR[1]-DOOR[0]+6,3);
  R(x,'#f4f4f0',DOOR[1]+3,60,14,162);R(x,'#d8d8d2',DOOR[1]+15,60,2,162);
  // บัวผนังน้ำตาล พื้นกระเบื้องฟ้า เสื่อสีน้ำตาลอ่อน
  R(x,'#7a2e20',0,214,ROOM_END,8);R(x,'#9ab8d6',0,222,ROOM_END,8);for(let i=0;i<ROOM_END;i+=22)R(x,'#c2d6ea',i,222,1,8);
  // มุมซ้ายสุดของห้อง
  R(x,'#d4d8da',0,30,10,192);R(x,'#c0c4c6',10,30,2,192);
  
  if(night){x.save();x.globalCompositeOperation='source-atop';x.fillStyle='rgba(14,22,60,.62)';x.fillRect(0,0,ROOM_END,222);x.restore();
    for(let lx=60;lx<ROOM_END;lx+=170)R(x,'#5a6080',lx+2,27,42,3)}
}
/* ลานต้นไม้หน้าอาคาร 5 (ภาพประตูข้างห้อง 512) */
function drawCourtyard(x,r,x0,x1,o){o=o||{};
  R(x,'#f0f0ec',x0,0,22,222);R(x,'#d0d2cc',x0+20,0,2,222);R(x,'#e2e4e0',x0-30,0,52,14);
  const tree=(tx,th)=>{x.fillStyle='#5a4636';x.beginPath();x.moveTo(tx-14,GY);x.quadraticCurveTo(tx-6,GY-30,tx-8,th);x.lineTo(tx+8,th);x.quadraticCurveTo(tx+6,GY-30,tx+16,GY);x.closePath();x.fill();
    for(let i=0;i<6;i++){const lx=tx-7+i*3;R(x,'#6e5846',lx,th+10+i*7,1,40+r()*60)}R(x,'#4a382a',tx-8,th,2,GY-th);
    for(let i=0;i<5;i++)limb(x,tx,th+10,tx+(i-2)*30,th-14-r()*14,4,'#5a4636');
    for(let i=0;i<46;i++){const ax=tx+(r()*180-90),ay=th-20+(r()*52-26);x.fillStyle=['#3f7a34','#4f8a3c','#5f9c48','#356a2c'][Math.floor(r()*4)];x.beginPath();x.arc(ax,ay,10+r()*10,0,7);x.fill()}
    for(let i=0;i<8;i++){const hx=tx+(r()*120-60);R(x,'#6e5846',hx,th-4,1,20+r()*40)}};
  (o.trees||[]).forEach(([tx,th])=>tree(tx,th));
  R(x,'#a8a8a2',x0,222,x1-x0,8);
  (o.stoneT||[]).forEach(sx=>{R(x,'#e2e0da',sx,200,44,6);R(x,'#c8c6c0',sx,205,44,1);R(x,'#d6d4ce',sx+16,206,12,24);[sx-16,sx+50].forEach(bx=>{R(x,'#dcdad4',bx,214,12,16);R(x,'#c4c2bc',bx,214,12,2);R(x,'#b0aea8',bx+4,220,4,6)})});
  (o.cooler||[]).forEach(cx=>{R(x,'#c8ccd0',cx-11,190,22,40);R(x,'#e0e4e8',cx-9,192,18,10);R(x,'#3a7ad8',cx-7,194,14,4);R(x,'#9aa0a6',cx-2,204,4,4);R(x,'#5a6066',cx-7,214,14,2);R(x,'#7ac0f0',cx-5,180,10,10);R(x,'#b8e0f8',cx-4,181,4,8)});
  (o.planter||[]).forEach(([px,pw])=>{R(x,'#b86a48',px,204,pw,26);R(x,'#9a5236',px,204,pw,3);for(let i=px+4;i<px+pw-4;i+=18)R(x,'#a85c3e',i,208,1,20);for(let i=0;i<pw/11;i++){x.fillStyle=['#4f9a3c','#62ac48','#3f8a32'][i%3];x.beginPath();x.arc(px+6+i*11,200,6+r()*4,0,7);x.fill()}});
  if(o.pole){const px=o.pole;R(x,'#8a8a8a',px-3,40,6,190);R(x,'#6a6a6a',px-3,40,2,190);R(x,'#7a7a7a',px-20,60,40,4);
    [[-20,52,-1],[20,52,1],[-16,80,-1],[16,80,1]].forEach(([dx,dy,f])=>{x.fillStyle='#b8bcc0';x.beginPath();x.moveTo(px+dx,dy);x.lineTo(px+dx+f*16,dy-8);x.lineTo(px+dx+f*16,dy+10);x.closePath();x.fill();R(x,'#8a8e92',px+dx-2,dy-2,4,6)})}
  if(o.bld5){// อาคาร 5: ผนังขาว หน้าต่างบานเกล็ดแบบเดียวกับห้อง 512 ทางเดินชั้นล่าง
    const [bx,bw]=o.bld5;R(x,'#ecece6',bx,20,bw,202);R(x,'#d8d8d0',bx,20,bw,4);for(let fy=34;fy<200;fy+=62){R(x,'#c8c8c0',bx,fy+50,bw,4);for(let wx=bx+14;wx<bx+bw-30;wx+=56){x.clearRect(wx,fy,40,26);for(let yy=fy+2;yy<fy+25;yy+=5)R(x,'rgba(246,246,240,.9)',wx,yy,40,3);R(x,'#3a2a22',wx-2,fy-2,44,2);R(x,'#3a2a22',wx-2,fy+26,44,2)}}
    R(x,'#3a7ad8',bx+20,24,80,10);R(x,'#ffffff',bx+24,27,72,4)}
}
function courtFar(){const w=layerW(.3),[c,x]=mk(w,H);const r=seeded(11);
  for(let bx=0;bx<w;bx+=230){const bw=200,bh=110+((bx/230)%2)*30,by=GY-bh-10;R(x,'#e2b6aa',bx,by,bw,bh);R(x,'#c9978c',bx,by,bw,4);R(x,'#b88880',bx,by+bh-8,bw,8);
    for(let fy=by+14;fy<GY-30;fy+=28)for(let fx=bx+10;fx<bx+bw-14;fx+=22){R(x,'#7c95a8',fx,fy,14,14);R(x,'#a9c0d0',fx+1,fy+1,6,12);R(x,'#d8c6c0',fx,fy+14,14,2)}
    if((bx/230)%3===1){R(x,'#2f6fd0',bx+60,by+6,70,9);R(x,'#ffffff',bx+64,by+9,62,3)}}
  for(let i=0;i<w;i+=18){const cy=GY-60-r()*30,s=14+r()*14;x.fillStyle=['#4f8a3c','#5c9a46','#3f7432'][Math.floor(r()*3)];x.beginPath();x.arc(i,cy,s,0,7);x.fill()}
  R(x,'#6c8a5a',0,GY-40,w,50);return c}
function courtFG(x0){const w=layerW(1.2),[c,x]=mk(w,H);const r=seeded(19);
  for(let i=Math.round(x0*1.2)+80;i<w;i+=150+r()*120){for(let j=0;j<10;j++){x.fillStyle=['rgba(40,90,40,.92)','rgba(30,70,32,.92)','rgba(50,104,46,.9)'][j%3];x.beginPath();x.arc(i+(r()*68-34),r()*28-6,10+r()*10,0,7);x.fill()}}return c}

/* ---------- ฉาก 2: อุโมงค์ไผ่ทิวไผ่งาม (ต.แม่กาษา) ---------- */
function artBamboo(){const r=seeded(23);
  LV.L.sky=skyCanvas([[0,'#a8d8a0'],[.6,'#e2f2c8'],[1,'#f4f8e4']],'rgba(255,255,255,.7)',0,23);
  {const w=layerW(.3),[c,x]=mk(w,H);hills(x,w,150,14,'#8ab878',5,24);hills(x,w,175,10,'#6ea05c',6,18);for(let i=0;i<w;i+=40){R(x,'#c8c870',i,200,30,4);R(x,'#9ab060',i+30,198,10,6)}R(x,'#7aa858',0,205,w,40);LV.L.far=c}
  {const w=layerW(.6),[c,x]=mk(w,H);for(let i=0;i<w;i+=22){const h=150+r()*40,lean=(r()-.5)*20;for(let k=0;k<3;k++)limb(x,i+k*4,GY,i+k*4+lean,GY-h,3,['#4a7a34','#3a6a2a','#5a8a3c'][k]);blob(x,i+lean,GY-h,22,['#3f7a34','#4f8a3c','#2f6a2a'],6,r)}LV.L.mid=c}
  const [c,x]=mk(LV.w,H);
  // กอไผ่ด้านหลังโค้งเข้าหากันเป็นอุโมงค์ + หลังคาใบไผ่ด้านบน
  for(let i=0;i<LV.w;i+=18){const lean=Math.sin(i/90)*30,h=200+r()*20;for(let k=0;k<2;k++){x.strokeStyle=['#6a9a3c','#5a8a30'][k];x.lineWidth=3;x.beginPath();x.moveTo(i+k*5,GY);x.quadraticCurveTo(i+k*5+lean*.3,GY-h*.6,i+k*5+lean,GY-h);x.stroke();for(let y=GY-20;y>GY-h+20;y-=26)R(x,'#3e6a28',i+k*5-1+lean*((GY-y)/h)*.5,y,3,1)}}
  for(let i=0;i<LV.w;i+=14)blob(x,i,26+Math.sin(i/70)*10,26,['#2f6a2a','#3f7a34','#4a8a3a','#2a5a24'],3,r);
  for(let i=0;i<LV.w;i+=7)R(x,'rgba(30,70,30,.9)',i,0,7,18+r()*14);
  // ลำแสงลอดใบไผ่
  for(let i=60;i<LV.w;i+=170+r()*80){x.fillStyle='rgba(255,250,210,.13)';x.beginPath();x.moveTo(i,40);x.lineTo(i+18,40);x.lineTo(i+70,GY);x.lineTo(i+40,GY);x.closePath();x.fill()}
  LV.L.world=c;
  {const w=layerW(1.2),[fc,fx]=mk(w,H);for(let i=120;i<w;i+=260+r()*160){for(let k=0;k<3;k++){fx.strokeStyle='rgba(60,100,40,.95)';fx.lineWidth=6;fx.beginPath();fx.moveTo(i+k*9,H+10);fx.quadraticCurveTo(i+k*9+10,120,i+k*9+40,-10);fx.stroke()}blob(fx,i+50,10,24,['rgba(40,90,40,.95)','rgba(50,104,46,.95)'],8,r)}LV.L.fg=fc}
}
/* ---------- ฉาก 3: ป่าเชิงเขาและน้ำตกธารารักษ์ (ภาพป่าและบึงน้ำใต้หน้าผาที่ครูส่ง) ---------- */
function artForest(){const r=seeded(31);
  LV.L.sky=skyCanvas([[0,'#3a2a5a'],[.45,'#c86a5a'],[.75,'#f2b070'],[1,'#f8d8a0']],'rgba(255,220,200,.35)',0,31);
  {const w=layerW(.3),[c,x]=mk(w,H);// หน้าผาหินปูน น้ำตก อ่างน้ำ เจดีย์ทองบนที่ราบด้านบน
    hills(x,w,120,22,'#4a4a5e',8,16);
    for(let i=0;i<w;i+=520){const fx=i+260;R(x,'#5a5a6e',fx-60,70,120,120);for(let y=70;y<190;y+=7)R(x,'#6a6a7e',fx-60+((y*7)%30),y,40,2);R(x,'rgba(220,240,255,.85)',fx-6,78,12,112);for(let y=80;y<190;y+=6)R(x,'#ffffff',fx-4+((y/6)%3)*3,y,2,4);
      R(x,'#d8a030',fx+30,52,10,18);x.fillStyle='#e8b840';x.beginPath();x.moveTo(fx+28,52);x.lineTo(fx+35,34);x.lineTo(fx+42,52);x.fill();R(x,'#f0d070',fx+34,30,2,5)}
    blob(x,0,0,0,['#000'],0,r);for(let i=0;i<w;i+=16)blob(x,i,190+r()*10,16,['#2a3a2e','#344a36','#3a4a30'],2,r);R(x,'#4a6a6a',0,200,w,70);for(let i=0;i<w;i+=10)R(x,'rgba(255,200,150,.25)',i,205+((i*7)%20),6,1);LV.L.far=c}
  {const w=layerW(.6),[c,x]=mk(w,H);for(let i=0;i<w;i+=34){const tw=4+r()*5;R(x,'#2a2426',i,0,tw,GY);R(x,'#3a3234',i+1,0,1,GY);blob(x,i,30+r()*40,30,['#1e2e22','#26382a','#2e4230'],4,r)}LV.L.mid=c}
  const [c,x]=mk(LV.w,H);
  for(let i=0;i<LV.w;i+=58+r()*30){const tw=8+r()*6;R(x,'#3a3030',i,0,tw,GY);R(x,'#4a3e3a',i+2,0,2,GY);for(let y=40;y<GY;y+=30)R(x,'#2a2222',i,y,tw,1);limb(x,i+tw/2,GY-120,i+tw/2+(r()-.5)*60,GY-150,2,'#3a3030')}
  for(let i=0;i<LV.w;i+=12)blob(x,i,14,24,['#1e3a24','#264a2c','#2e5232'],2,r);
  for(let i=0;i<LV.w;i+=26){x.fillStyle=['#2e5a30','#3a6a36'][Math.floor(r()*2)];x.beginPath();x.ellipse(i,GY-4,10+r()*8,6,0,Math.PI,0);x.fill()}
  LV.L.world=c}
function caveMouth(x,cx){// ถ้ำสีฟ้า: หินสีเทาฟ้าเป็นชั้นลายคลื่น (จุดพัก ไม่มีการต่อสู้)
  x.fillStyle='#6a7a90';x.beginPath();x.moveTo(cx-90,GY);x.quadraticCurveTo(cx-80,80,cx,70);x.quadraticCurveTo(cx+80,80,cx+90,GY);x.closePath();x.fill();
  for(let y=84;y<GY;y+=7){x.strokeStyle=y%14?'#8a9ab0':'#5a6a80';x.lineWidth=2;x.beginPath();x.moveTo(cx-80,y);x.quadraticCurveTo(cx,y-6+Math.sin(y)*3,cx+80,y);x.stroke()}
  x.fillStyle='#141824';x.beginPath();x.moveTo(cx-34,GY);x.quadraticCurveTo(cx-30,140,cx,132);x.quadraticCurveTo(cx+30,140,cx+34,GY);x.closePath();x.fill()}
/* ---------- ฉาก 4: บ่อน้ำร้อนและน้ำตกแม่กาษา ---------- */
function artSpring(){const r=seeded(41);
  LV.L.sky=skyCanvas([[0,'#8ac0e0'],[.6,'#d8ecf0'],[1,'#eef6f4']],'rgba(255,255,255,.75)',0,41);
  {const w=layerW(.3),[c,x]=mk(w,H);hills(x,w,110,20,'#5a8a6a',9,18);hills(x,w,140,14,'#4a7a5a',10,16);for(let i=0;i<w;i+=40)R(x,'rgba(255,255,255,.18)',i,120+((i*3)%30),60,8);LV.L.far=c}
  {const w=layerW(.6),[c,x]=mk(w,H);for(let i=0;i<w;i+=400){R(x,'#7a7468',i+120,90,90,140);R(x,'rgba(230,245,255,.9)',i+158,94,14,136);for(let y=96;y<230;y+=5)R(x,'#ffffff',i+160+((y/5)%3)*3,y,2,3)}for(let i=0;i<w;i+=20)blob(x,i,120+r()*30,22,['#3a6a40','#4a7a48','#2e5a36'],2,r);LV.L.mid=c}
  const [c,x]=mk(LV.w,H);
  for(let i=0;i<LV.w;i+=90+r()*60){x.fillStyle='#6a645a';x.beginPath();x.ellipse(i,GY,30+r()*30,20+r()*20,0,Math.PI,0);x.fill();R(x,'#8a8476',i-20,GY-26,30,2)}
  for(let i=0;i<LV.w;i+=30){const h=60+r()*60;limb(x,i,GY-20,i+(r()-.5)*30,GY-20-h,3,'#3a5a2a');blob(x,i,GY-20-h,18,['#3a7a40','#4a8a48'],3,r)}
  LV.L.world=c}
/* ---------- ฉาก 5: ตลาดริมเมย (ภาพป้ายสุดประจิม แผงร้าน วงปี่พาทย์พม่า นักดนตรีกะเหรี่ยง) ---------- */
function artMarket(o){const r=seeded(53);
  LV.L.sky=skyCanvas([[0,'#6aa8e0'],[.6,'#cfe6f6'],[1,'#eef6fb']],'rgba(255,255,255,.85)',0,53);
  {const w=layerW(.3),[c,x]=mk(w,H);// แม่น้ำเมย ฝั่งตรงข้ามเป็นเนินเขา และสะพานข้ามแม่น้ำ
    hills(x,w,128,12,'#6a9a6a',12,20);R(x,'#6a9aa8',0,170,w,30);for(let i=0;i<w;i+=12)R(x,'#9ac8d0',i+((i*7)%9),176+((i*3)%18),6,1);
    for(let i=200;i<w;i+=700){R(x,'#b8b8b0',i,150,260,6);for(let k=0;k<6;k++)R(x,'#9a9a92',i+20+k*44,156,6,20);R(x,'#d8d8d0',i,146,260,3)}LV.L.far=c}
  {const w=layerW(.6),[c,x]=mk(w,H);for(let i=0;i<w;i+=70){const col=['#d84a6a','#3a7ad8','#e89a30','#5aa84a'][Math.floor(r()*4)];x.fillStyle=col;x.beginPath();x.moveTo(i,150);x.lineTo(i+35,132);x.lineTo(i+70,150);x.fill();R(x,sh(col,.7),i,150,70,40)}LV.L.mid=c}
  const [c,x]=mk(LV.w,H);
  (o.stalls||[]).forEach(([sx,col,goods])=>{R(x,'#6a5a4a',sx,120,3,110);R(x,'#6a5a4a',sx+87,120,3,110);x.fillStyle=col;x.beginPath();x.moveTo(sx-8,126);x.lineTo(sx+45,108);x.lineTo(sx+98,126);x.lineTo(sx+98,134);x.lineTo(sx-8,134);x.fill();for(let i=sx-8;i<sx+98;i+=12)R(x,sh(col,.75),i,126,6,8);
    R(x,'#8a6a4a',sx,186,90,6);R(x,'#6a4a30',sx+4,192,4,38);R(x,'#6a4a30',sx+82,192,4,38);R(x,'#c8c0b0',sx,192,90,30);
    for(let i=0;i<9;i++){const gc=goods[i%goods.length];R(x,gc,sx+4+i*9,176+((i*5)%6),7,10)}for(let i=0;i<6;i++)R(x,goods[(i+1)%goods.length],sx+8+i*13,140,6,16+((i*3)%8))});
  if(o.sign){const sx=o.sign;R(x,'#e8e4dc',sx,180,140,42);R(x,'#9a3a2a',sx,176,140,6);x.fillStyle='#1e2a50';x.beginPath();x.moveTo(sx+20,176);x.lineTo(sx+70,130);x.lineTo(sx+120,176);x.fill();R(x,'#f2c14e',sx+64,146,12,12);R(x,'#1e2a50',sx+14,188,112,22);for(let i=0;i<10;i++)R(x,'#f2c14e',sx+20+i*10,195,7,8);for(let i=0;i<4;i++){R(x,'#c8a040',sx+4+i*36,222,10,8);blob(x,sx+9+i*36,220,6,['#e86a8a','#f2c14e','#4a9a3a'],4,r)}
    [[sx-10,'#e82a2a'],[sx+150,'#2a3ad8']].forEach(([fx,fc])=>{R(x,'#9a9a9a',fx,120,2,60);R(x,fc,fx+2,122,14,9);R(x,'#ffffff',fx+2,125,14,3)})}
  if(o.stage){// เวทีเล็กของวงปี่พาทย์พม่า: กรอบกลองวงสีทองแดง แกะลาย และฆ้องราง
    const s=o.stage;R(x,'#7a2a1a',s,198,180,8);R(x,'#5a1a10',s,206,180,24);
    x.fillStyle='#d4a030';x.beginPath();x.ellipse(s+50,190,34,12,0,0,7);x.fill();for(let i=0;i<12;i++){const a=i/12*Math.PI*2;R(x,'#f0d070',s+50+Math.cos(a)*30-2,190+Math.sin(a)*10-14,4,14);R(x,'#c03030',s+50+Math.cos(a)*30-1,190+Math.sin(a)*10-10,2,4)}
    R(x,'#a01a1a',s+44,150,12,30);x.fillStyle='#e8b840';x.beginPath();x.moveTo(s+40,152);x.lineTo(s+50,128);x.lineTo(s+60,152);x.fill();
    R(x,'#c8962a',s+110,170,60,24);for(let i=0;i<5;i++){disc(x,'#5a4a2a',s+117+i*11,176,4);disc(x,'#c8a050',s+117+i*11,176,1.5)}R(x,'#f0d070',s+108,166,64,4)}
  LV.L.world=c}
/* ---------- ฉาก 6: ชุมชนแม่โกนเกน (งานตานก๋วยสลาก แห่กลองหลวง) ---------- */
function artVillage(o){const r=seeded(61);
  LV.L.sky=skyCanvas([[0,'#78b0e0'],[.6,'#d8eaf4'],[1,'#f2f6f0']],'rgba(255,255,255,.8)',0,61);
  {const w=layerW(.3),[c,x]=mk(w,H);hills(x,w,120,24,'#6a8aa0',13,22);hills(x,w,150,16,'#5a8a6a',14,18);
    for(let i=300;i<w;i+=900){// วัดไกล ๆ หลังคาแบบล้านนา (เป็นฉากหลัง ไม่ใช่ที่ต่อสู้)
      R(x,'#e8e0d0',i,150,60,40);x.fillStyle='#a03020';x.beginPath();x.moveTo(i-10,152);x.lineTo(i+30,120);x.lineTo(i+70,152);x.fill();R(x,'#f0c040',i+29,112,2,10)}
    for(let i=0;i<w;i+=6)R(x,i%12?'#c8b860':'#a8a050',i,186,4,20+((i*7)%8));R(x,'#9ab060',0,200,w,70);LV.L.far=c}
  {const w=layerW(.6),[c,x]=mk(w,H);for(let i=0;i<w;i+=8){const h=30+((i*13)%18);limb(x,i,GY,i+2,GY-h,2,'#7a9a3a');R(x,'#c8b050',i,GY-h-4,3,5)}LV.L.mid=c}
  const [c,x]=mk(LV.w,H);
  (o.houses||[]).forEach(hx=>{R(x,'#5a3a22',hx,150,4,80);R(x,'#5a3a22',hx+96,150,4,80);R(x,'#7a5232',hx,140,100,50);for(let i=hx;i<hx+100;i+=6)R(x,'#6a4428',i,140,1,50);R(x,'#3a2a1a',hx+30,152,20,26);
    x.fillStyle='#6a5a4a';x.beginPath();x.moveTo(hx-14,142);x.lineTo(hx+50,104);x.lineTo(hx+114,142);x.fill();for(let i=0;i<10;i++)R(x,'#5a4a3a',hx-8+i*12,136-i*2,2,6)});
  (o.kuay||[]).forEach(kx=>{R(x,'#c8a060',kx,110,3,120);for(let i=0;i<5;i++){const yy=118+i*16;R(x,'#d8b878',kx-10,yy,10,10);R(x,'#d8b878',kx+3,yy+6,10,10);R(x,['#e86a8a','#f2c14e','#5aa84a'][i%3],kx-8,yy-2,6,3)}R(x,'#f2c14e',kx-6,104,14,6)});
  LV.L.world=c}
/* ---------- ฉาก 7: หอประชุม (เวทีแสดงตอนจบ) ---------- */
function artHall(x,x0,x1){R(x,'#4a1a24',x0,0,x1-x0,222);for(let i=x0;i<x1;i+=40)R(x,'#3a141c',i,0,2,222);R(x,'#2a0c12',x0,0,x1-x0,24);
  const st=x1-560;R(x,'#6a1a1a',st,30,520,170);for(let i=st;i<st+520;i+=12){R(x,'#8a2222',i,30,6,170);R(x,'#5a1010',i+8,30,2,170)}R(x,'#f2c14e',st,26,520,6);
  R(x,'#1a1018',st+120,60,280,120);R(x,'#3a7ad8',st+150,40,220,14);for(let i=0;i<22;i++)R(x,'#ffffff',st+156+i*9,44,6,6);
  for(let i=0;i<6;i++){x.fillStyle='rgba(255,240,180,.08)';x.beginPath();x.moveTo(st+40+i*90,0);x.lineTo(st+60+i*90,0);x.lineTo(st+100+i*90,200);x.lineTo(st+i*90,200);x.fill()}
  R(x,'#8a5a30',st-20,196,560,26);R(x,'#b07a40',st-20,196,560,3)}

/* ---------- เส้นทางสองแถวระหว่างฉาก (ภาพถนนตัวเมืองแม่สอด กลางวันและพลบค่ำ) ---------- */
function townStrip(dusk){const w=1800,[c,x]=mk(w,H);const r=seeded(dusk?71:73);
  const sky=x.createLinearGradient(0,0,0,H);if(dusk){sky.addColorStop(0,'#2a2a5a');sky.addColorStop(.6,'#c87a6a');sky.addColorStop(1,'#f0b080')}else{sky.addColorStop(0,'#5a9ae0');sky.addColorStop(1,'#d8ecf8')}x.fillStyle=sky;x.fillRect(0,0,w,H);
  for(let bx=0;bx<w;){const bw=60+Math.floor(r()*50),bh=90+Math.floor(r()*80),col=['#d8d0c0','#c8c0b0','#e8e0d0','#b8b8b8','#d0c8b8'][Math.floor(r()*5)];
    R(x,col,bx,GY-bh,bw,bh);R(x,sh(col,.85),bx,GY-bh,bw,4);
    for(let fy=GY-bh+12;fy<GY-40;fy+=26)for(let fx=bx+6;fx<bx+bw-10;fx+=16){R(x,dusk&&r()<.5?'#ffe08a':'#6a7a8a',fx,fy,10,14);R(x,sh(col,.7),fx,fy+14,10,2)}
    R(x,'#3a3a3e',bx,GY-36,bw,36);const aw=['#c03030','#3a7ad8','#e8a030','#4a9a4a'][Math.floor(r()*4)];R(x,aw,bx,GY-44,bw,8);for(let i=bx;i<bx+bw;i+=8)R(x,sh(aw,.75),i,GY-44,4,8);
    if(r()<.35){R(x,'#f4f0e0',bx+6,GY-bh-14,bw-12,12);R(x,['#c03030','#2a7a3a','#c89a30'][Math.floor(r()*3)],bx+10,GY-bh-11,bw-20,6)}
    for(let i=0;i<3;i++)R(x,dusk?'#ffd86a':'#9aa8b8',bx+8+i*(bw-16)/3,GY-30,(bw-24)/3,22);bx+=bw+2}
  for(let px=40;px<w;px+=150){R(x,'#7a7a7a',px,60,4,170);R(x,'#5a5a5a',px-10,66,24,3);x.strokeStyle='#2a2a2a';x.lineWidth=1;for(let k=0;k<4;k++){x.beginPath();x.moveTo(px,68+k*4);x.quadraticCurveTo(px+75,88+k*4,px+150,68+k*4);x.stroke()}}
  R(x,'#5a5a5e',0,GY,w,H-GY);for(let i=0;i<w;i+=40)R(x,'#e8e0c0',i,GY+22,18,2);if(dusk){x.fillStyle='rgba(30,20,60,.25)';x.fillRect(0,0,w,H)}return c}
function drawSongthaew(G,x,y,t){R(G,'#2a6ad0',x,y-34,70,24);R(G,'#1a4aa0',x,y-12,70,4);R(G,'#2a6ad0',x+70,y-28,22,18);R(G,'#9ad0f0',x+74,y-26,14,9);R(G,'#f4f4f0',x+4,y-40,62,6);for(let i=0;i<5;i++)R(G,'#9ad0f0',x+6+i*12,y-30,8,8);
  [x+14,x+76].forEach(wx=>{disc(G,'#1a1a1a',wx,y-6,6);disc(G,'#8a8a8a',wx,y-6,2.5);R(G,'#5a5a5a',wx+Math.cos(t*20)*3,y-6+Math.sin(t*20)*3,1,1)})}
/* ---------- แผนที่แม่สอด ---------- */
function drawMapArt(G,w,h,prog,done){const gr=G.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#e8dcb8');gr.addColorStop(1,'#d8c898');G.fillStyle=gr;G.fillRect(0,0,w,h);
  G.strokeStyle='rgba(120,90,50,.18)';for(let i=0;i<w;i+=24){G.beginPath();G.moveTo(i,0);G.lineTo(i,h);G.stroke()}for(let i=0;i<h;i+=24){G.beginPath();G.moveTo(0,i);G.lineTo(w,i);G.stroke()}
  G.strokeStyle='#5a9ab8';G.lineWidth=7;G.beginPath();G.moveTo(w*.09,0);G.bezierCurveTo(w*.16,h*.3,w*.05,h*.55,w*.12,h);G.stroke();G.fillStyle='#3a6a88';G.font='600 11px '+FONT;G.save();G.translate(w*.07,h*.62);G.rotate(-1.4);G.fillText('แม่น้ำเมย',0,0);G.restore();
  G.strokeStyle='#b89a6a';G.lineWidth=4;G.beginPath();G.moveTo(w*.12,h*.55);G.lineTo(w*.45,h*.5);G.lineTo(w*.95,h*.45);G.stroke();G.beginPath();G.moveTo(w*.45,h*.5);G.lineTo(w*.6,h*.12);G.stroke();G.beginPath();G.moveTo(w*.45,h*.5);G.lineTo(w*.7,h*.9);G.stroke();
  G.fillStyle='#8a6a4a';G.font='600 9px '+FONT;G.fillText('ตัวเมืองแม่สอด',w*.4,h*.58);G.fillText('ทางหลวง 1090 →',w*.75,h*.4);
  for(let i=0;i<14;i++){G.fillStyle='rgba(80,130,70,.45)';G.beginPath();G.arc(w*(.62+((i*37)%30)/100),h*(.12+((i*53)%40)/100),8,0,7);G.fill()}}
