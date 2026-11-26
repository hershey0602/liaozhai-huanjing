import {THREE,seeded,paperTexture,mat,group,mesh,box,cylinder,sphere,curve,plaque,glow,calligraphy,makeInkFigure} from './space-kit.js?build=tree-guide-74';
import {finishStudy} from './scene-finishes.js?build=tree-guide-74';
import {paperBook} from './crafted-objects.js?build=tree-guide-74';
import {makeCongeeStove} from './kitchen-stove.js?build=tree-guide-74';
import {livingFlame} from './living-flame.js?build=tree-guide-74';

export function makeStudyRoom(k,{finale=false}={}){
  const {world}=k,rnd=seeded(2821);
  const m={wood:mat('#796447',{map:paperTexture('#b49d74',true)}),dark:mat('#514936'),paper:mat('#e9dbb9',{map:paperTexture('#f0e3c6')}),wall:mat('#ded1b0',{map:paperTexture('#e7dabd')}),bronze:mat('#9b8b5f',{metalness:.4,roughness:.6}),ink:mat('#3d4439',{roughness:.25}),cloth:mat('#c5b58f')};
  m.wall.color.set('#f3eddb');m.paper.color.set('#ffffff');m.wood.color.set('#b3a382');
  box(world,21,.12,28,m.dark,0,-.16,-1.5);
  const floorboards=[];for(let x=-10;x<10;x+=.8)floorboards.push(box(world,.78,.18,27,m.wood,x,-.02,-1.5));
  box(world,20,.16,4,m.paper,0,-.04,14);
  for(const side of [-1,1]){box(world,.3,6,27,m.wall,side*10,3,-1.5);for(let z=11;z>-15;z-=4)box(world,.34,6.2,.34,m.dark,side*9.75,3.05,z);}
  box(world,20,6,.25,m.wall,0,3,-15);
  for(const z of [10,-2,-14]){box(world,20,.35,.36,m.dark,0,5.75,z);for(let x=-9;x<10;x+=3)curve(world,[[x-.7,5.8,z],[x-.5,5.4,z],[x,5.2,z],[x+.5,5.4,z],[x+.7,5.8,z]],.08,m.wood);}
  for(let x=-9;x<10;x+=2.5)box(world,.16,.18,27,m.dark,x,6,-1.5);
  for(const side of [-1,1])box(world,6.2,6,.2,m.wall,side*6.9,3,12);box(world,7.4,1.2,.22,m.dark,0,5.4,12);
  plaque(world,finale?'青 林 黑 塞':'芸 庭 小 榭',4.3,.8,0,4.85,11.8,{color:'#554b37',background:'#c7b385',size:107});
  // Moonlight, slender bamboo and a geometric lattice share one real window.
  const moonCanvas=document.createElement('canvas');moonCanvas.width=moonCanvas.height=512;const mb=moonCanvas.getContext('2d');
  const sky=mb.createLinearGradient(0,0,0,512);sky.addColorStop(0,'#adb9b4');sky.addColorStop(1,'#d8dcca');mb.fillStyle=sky;mb.fillRect(0,0,512,512);
  const moon=mb.createRadialGradient(310,165,1,310,165,108);moon.addColorStop(0,'#f6ecd3');moon.addColorStop(.5,'#eee5c8');moon.addColorStop(1,'rgba(236,228,201,0)');mb.fillStyle=moon;mb.fillRect(160,20,300,300);
  mb.strokeStyle='#6e85756b';mb.lineWidth=5;
  for(let b=0;b<6;b++){const x=50+b*69;mb.beginPath();mb.moveTo(x,512);mb.quadraticCurveTo(x-15,200,x+32,0);mb.stroke();
    for(let y=110;y<480;y+=65){mb.save();mb.translate(x,y);mb.fillStyle='#71857280';for(let i=0;i<6;i++){mb.rotate(.56);mb.beginPath();mb.ellipse(22,0,30,4,0,0,Math.PI*2);mb.fill();}mb.restore();}}
  const moonTex=new THREE.CanvasTexture(moonCanvas);moonTex.colorSpace=THREE.SRGBColorSpace;
  const windowGroup=group(world,9.80,3.1,-3.7);windowGroup.rotation.y=-Math.PI/2;
  mesh(windowGroup,new THREE.PlaneGeometry(5.1,3.2),new THREE.MeshBasicMaterial({map:moonTex}),0,0,0);
  for(const x of [-2.7,2.7])box(windowGroup,.15,3.5,.16,m.dark,x,0,.1);for(const y of [-1.7,1.7])box(windowGroup,5.55,.15,.16,m.dark,0,y,.1);
  for(let x=-2.55;x<2.6;x+=.63)box(windowGroup,.035,3.35,.1,m.wood,x,0,.12);
  for(let y=-1.5;y<1.6;y+=.55)box(windowGroup,5.4,.035,.1,m.wood,0,y,.12);
  const lattice=new THREE.Mesh(new THREE.RingGeometry(1.07,1.15,64),m.wood);lattice.position.z=.17;windowGroup.add(lattice);
  const moonLight=new THREE.PointLight('#cbdcd2',9,15,1.7);moonLight.position.set(8,4,-3);world.add(moonLight);
  // Carved low bookcases, scrolls, brush rests and bowls give the room lived detail.
  for(const side of [-1,1]){
    const shelf=group(world,side*8.7,0,-8.8);shelf.rotation.y=side===1?-Math.PI/2:Math.PI/2;
    box(shelf,4.4,3.5,.18,m.dark,0,1.8,-.4);
    for(const x of [-2.2,2.2])box(shelf,.16,3.8,.9,m.wood,x,1.9,0);
    for(let tier=0;tier<4;tier++){box(shelf,4.5,.12,.9,m.wood,0,.35+tier*.93,0);
      for(let i=0;i<10;i++){const books=group(shelf,-1.9+i*.4,.53+tier*.93,0);for(let j=0;j<3;j++)box(books,.31,.065,.45,j%2?m.cloth:m.paper,0,j*.07,0);}}
  }
  for(const x of [-6.5,6.5]){const scroll=mesh(world,new THREE.PlaneGeometry(1.15,3.15),new THREE.MeshBasicMaterial({map:calligraphy(x<0?'人鬼共处一斋本来隔着生死':'书是同一种书字是同一种字',{width:300,height:900,size:58,gap:73,color:'#73654a'}),transparent:true}),x,3.1,-14.8);
    for(const y of [1.45,4.75]){const r=cylinder(world,.045,.045,1.3,m.wood,x,y,-14.7);r.rotation.z=Math.PI/2;}}
  const desk=group(world,0,.12,-2);
  box(desk,5.5,.17,1.85,m.wood,0,.88,0);box(desk,5.4,.11,.16,m.dark,0,.68,.73);
  for(const x of [-2.35,2.35])for(const z of [-.66,.66]){box(desk,.15,.85,.15,m.dark,x,.41,z);curve(desk,[[x,.58,z],[x*.83,.38,z],[x*.8,.18,z]],.065,m.wood);}
  for(const x of [-1.7,1.7])box(desk,.7,.30,.9,m.wood,x,.58,-.04);
  box(desk,2.6,.014,1.2,m.paper,0,.975,0);
  const text=mesh(desk,new THREE.PlaneGeometry(2.35,1.03),new THREE.MeshBasicMaterial({map:calligraphy('生往除厅事薄暮置书其中静息以伺其变挑灯读暗中鬼影僮僮略不顾瞻',{width:800,height:400,size:38,gap:49}),transparent:true}),0,.987,0);text.rotation.x=-Math.PI/2;
  const brush=group(desk,-1.5,.995,.1);cylinder(brush,.014,.018,.32,m.wood,0,.16,0,10);const nib=mesh(brush,new THREE.ConeGeometry(.022,.09,12),m.ink,0,.365,0);const penrest=box(desk,.4,.035,.12,m.bronze,-1.5,.99,.35);
  const paperObject=paperBook(desk),book=paperObject.root,bookCover=paperObject.cover;
  const inkstone=group(desk,1.85,.99,.2);const inkBowl=cylinder(inkstone,.25,.28,.09,m.dark);inkBowl.scale.set(1.4,1,.85);const inkpool=cylinder(inkstone,.18,.18,.007,m.ink,0,.05,0);inkpool.scale.set(1.3,1,.75);
  const incense=group(world,-6,.12,1.2);box(incense,1.5,.15,1.1,m.wood,0,.85,0);for(const x of [-.55,.55])for(const z of [-.36,.36])box(incense,.08,.85,.08,m.dark,x,.42,z);
  cylinder(incense,.31,.22,.25,m.bronze,0,1.10,0);cylinder(incense,.36,.36,.045,m.bronze,0,1.24,0);
  for(let i=0;i<3;i++){const a=i*2.094;curve(incense,[[Math.cos(a)*.17,.99,Math.sin(a)*.17],[Math.cos(a)*.24,.91,Math.sin(a)*.24]],.035,m.bronze);curve(incense,[[Math.cos(a)*.12,1.23,Math.sin(a)*.12],[Math.cos(a)*.15,1.81,Math.sin(a)*.15]],.009,m.wood);}
  const lamps=[];
  function oilLamp(x,y,z){
    const g=group(world,x,y,z);g.name='bronze-wick-lamp';
    const profile=[[.11,0],[.15,.015],[.13,.04],[.055,.065],[.055,.12],[.18,.145],[.235,.19],[.24,.205],[.218,.205],[.19,.17],[.02,.16]];
    mesh(g,new THREE.LatheGeometry(profile.map(([r,h])=>new THREE.Vector2(r,h)),40),m.bronze);
    cylinder(g,.181,.181,.006,mat('#493521',{roughness:.22,metalness:.12}),0,.174,0,40);
    const rim=mesh(g,new THREE.TorusGeometry(.232,.012,8,48),m.bronze,0,.204,0);rim.rotation.x=-Math.PI/2;
    const fire=livingFlame(g,{height:.23,seed:lamps.length*2.37,power:finale?1.3:3.4});fire.root.position.y=.192;
    lamps.push(fire);return g;
  }
  oilLamp(-2.12,1.14,-2.4);oilLamp(5.8,1.1,-11);oilLamp(-7,1.0,7);
  const stove=makeCongeeStove(k);
  const ghosts=[makeInkFigure(world,-2.2,.12,-5.5,{color:'#a99e83',opacity:finale?.13:0}),makeInkFigure(world,2.1,.12,-5.1,{color:'#b1a28b',opacity:finale?.13:0})];
  k.updates.push(t=>{lamps.forEach(fire=>fire.update(t));});
  k.obstacles.push({x:0,z:-2,w:5.5,d:1.85},{x:-6,z:1.2,w:1.5,d:1.1},{x:-7,z:-7,w:2,d:1.1});
  const room={m,desk,brush,book,bookCover,paperBook:paperObject,floorboards,inkstone,incense,lamps,ghosts,stove};
  finishStudy(k,room,{finale});
  return room;
}

export function buildSpace(k){
  const {scene,world,updates}=k,r=makeStudyRoom(k);k.ambient.intensity=1.16;k.sun.intensity=.7;k.sun.color.set('#e4e4cf');k.sun.position.set(10,9,-2);k.setBounds({x:9.2,minZ:-13,maxZ:14});k.setView(0,6.8,0,-.015);
  const marks=[glow(r.desk,-1.5,1.5,.15,'#ffe0a1',.65),glow(r.desk,.15,1.5,-.1,'#ffe0a1',.65),glow(r.desk,1.85,1.5,.2,'#ffe0a1',.65)];marks.forEach(m=>m.visible=false);
  const state={nearAt:-1,fixed:[false,false,false],fixAt:[-100,-100,-100],conversation:false,incenseReady:false,litAt:-100,exit:false,holdAt:-1,departed:false};
  k.announce('月色透窗，书页轻响。书案上，像有人刚刚离去。',6,'芸庭 · 小榭');
  const deskMarker=k.hotspot('书案 · 一灯待客',[0,1.8,-2],()=>{if(state.nearAt<0)state.nearAt=k.time;k.announce('三处微光依次亮起，仿佛有人在等你回应。');},{stop:3.0,enabled:()=>state.nearAt<0});
  const lines=[
    ['小谢','笔尖朝天，墨就凝住啦——我费了好大劲才倒过来的，怕你来了没笔写字呀。'],
    ['秋容','这本书我翻了很多年，总停在同一页……你替我翻开它，好不好？'],
    ['小谢与秋容','砚台挪了半寸，墨才匀得开——我们碰不到实物，只能这样让你知道，我们在这儿呢。'],
  ];
  function correct(i){if(state.fixed[i])return;state.fixed[i]=true;state.fixAt[i]=k.time;marks[i].visible=false;k.chime([392+i*65,523+i*65]);k.say([lines[i]],()=>{
    if(state.fixed.every(Boolean)&&!state.conversation){state.conversation=true;k.say([['秋容','人鬼共处一斋，本来隔着生死。'],['小谢','可书是同一种书，字是同一种字——'],['小谢与秋容','你读到这里，我们就还在这书斋里。']],()=>{state.incenseReady=true;k.announce('斋侧有一炉未燃的香。',6);});}
  });}
  const labels=[['扶正毛笔',[-1.5,1.7,-1.8]],['翻开书页',[.15,1.7,-2.1]],['归置砚台',[1.85,1.7,-1.8]]].map(([name,p],i)=>k.hotspot(name,p,()=>correct(i),{stop:2.3,distance:13,pinNear:5,enabled:()=>state.nearAt>=0&&k.time-state.nearAt>=i*.8&&!state.fixed[i]}));
  [r.brush,r.book,r.inkstone].forEach((o,i)=>k.clickable(o,()=>{if(state.nearAt>=0&&k.time-state.nearAt>=i*.8)labels[i].action();}));
  const congeeSpot=k.hotspot('灶边 · 一碗粥',[-7,1.8,-6.8],()=>k.say([['小谢 · 原文','“二女微笑，转身向灶，析薪溲米，为生执爨。”'],['相处之常','“生乐之，习以为常。”从终夜相扰，到为他煮一碗粥，陌生渐渐成了日常。']]),{stop:1.9,distance:13});
  k.clickable(r.stove,()=>congeeSpot.action());
  const hold=document.createElement('button');hold.className='incense-hold';hold.textContent='长按燃香 · 三息';hold.hidden=true;document.body.append(hold);
  const incenseLabel=k.hotspot('香炉 · 长按燃香',[-6,2.25,1.2],()=>{hold.hidden=false;k.announce('按住三息，让一炉香慢慢亮起。',4);},{stop:1.45,enabled:()=>state.incenseReady&&state.litAt<0});
  function begin(e){e.preventDefault();if(state.litAt>0)return;state.holdAt=k.time;if(e.pointerId!==undefined)hold.setPointerCapture(e.pointerId);}
  function cancel(){if(state.litAt<0){state.holdAt=-1;hold.style.setProperty('--hold','0%');}}
  hold.addEventListener('pointerdown',begin);for(const ev of ['pointerup','pointercancel','lostpointercapture'])hold.addEventListener(ev,cancel);
  hold.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat)begin(e);});hold.addEventListener('keyup',cancel);
  const smoke=new THREE.Group();smoke.position.set(-6,1.9,1.2);world.add(smoke);const smokeSprites=[];
  for(let i=0;i<35;i++){const s=glow(smoke,0,0,0,'#e8ca83',.3);s.material.opacity=0;smokeSprites.push(s);}
  const gold=mesh(smoke,new THREE.RingGeometry(.97,1,96),new THREE.MeshBasicMaterial({color:'#d4b76c',transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}),0,1.35,0);gold.rotation.x=-Math.PI/2;
  k.hotspot('循灯离斋',[0,2.1,11.6],()=>k.go('ending'),{stop:1.4,enabled:()=>state.exit,distance:24});
  updates.push(t=>{
    if(state.nearAt<0&&Math.hypot(k.camera.position.x,k.camera.position.z+2)<2.15)state.nearAt=t;
    marks.forEach((g,i)=>{g.visible=state.nearAt>=0&&t-state.nearAt>=i*.8&&!state.fixed[i];g.material.opacity=.28+.1*Math.sin(t*2+i);});
    const p0=THREE.MathUtils.smoothstep(t-state.fixAt[0],0,1.15),p1=THREE.MathUtils.smoothstep(t-state.fixAt[1],0,3.2),p2=THREE.MathUtils.smoothstep(t-state.fixAt[2],0,1.05);
    if(state.fixed[0])r.brush.rotation.z=-Math.PI/2*p0;
    r.paperBook.update(state.fixed[1]?p1:0,t);
    if(state.fixed[2])r.inkstone.position.x=1.85-.53*p2;
    r.ghosts.forEach((g,i)=>{const amount=state.fixed.filter(Boolean).length/3;g.material.opacity=amount*(.16+.04*Math.sin(t*.6+i));g.position.y=1.52+Math.sin(t*.4+i)*.025;});
    if(state.holdAt>=0&&state.litAt<0){const p=Math.min(1,(t-state.holdAt)/3);hold.style.setProperty('--hold',`${p*100}%`);if(p>=1){state.litAt=t;state.holdAt=-1;hold.hidden=true;k.chime([330,440,660]);k.announce('一缕香，照见生死之间仍相通的文字。',6);}}
    if(state.litAt>0){const age=t-state.litAt;smokeSprites.forEach((s,i)=>{const f=(age*.16+i/35)%1,a=i*2.39996;s.position.set(Math.cos(a+age*.1)*f*.65,f*1.55,Math.sin(a)*f*.65);s.scale.setScalar(.23+f*.42);s.material.opacity=Math.sin(f*Math.PI)*.12*Math.min(1,age);});gold.scale.setScalar(Math.min(2,age*.65));gold.material.opacity=age<5?.18*Math.sin(age/5*Math.PI):0;if(age>5&&!state.exit){state.exit=true;k.announce('烛火将暗，香烟与文字一同归入书卷。',3);k.skip.hidden=true;}if(age>7.2&&!state.departed){state.departed=true;k.go('ending');}}
  });
}
