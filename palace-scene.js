import {THREE,seeded,paperTexture,mat,group,mesh,box,cylinder,sphere,curve,plaque,roof,railing,glow,lantern,calligraphy} from './space-kit.js?build=wechat-landscape-75';
import {createLetterWriting} from './letter-writing.js?build=wechat-landscape-75';
import {finishPalace} from './scene-finishes.js?build=wechat-landscape-75';
import {livingSea,dragonThrone} from './crafted-objects.js?build=wechat-landscape-75';
import {verseJadeTree} from './verse-jade-tree.js?build=wechat-landscape-75';
import {danceDais} from './royal-fittings.js?build=wechat-landscape-75';

const seaVerse='宫中有玉树一株围可合抱本莹澈如白琉璃中有心淡黄色叶类碧玉细碎有浓阴花开满树每一瓣落锵然作响仙尘路隔不能相依两地同心何必旦夕相守海水复合不可复见';
export function buildSpace(k){
  const {world,scene,updates}=k,rnd=seeded(8193);
  const m={jade:mat('#d0d9c1',{roughness:.47}),stone:mat('#ece5cf',{map:paperTexture('#eee6d4'),roughness:.94}),
    trim:mat('#8fa69b'),roof:mat('#a5b6a7',{map:paperTexture('#ced0b4',true)}),gold:mat('#bca575',{metalness:.35,roughness:.45}),
    wood:mat('#7c8d7b',{map:paperTexture('#c0c6ad',true)}),dark:mat('#526c62'),white:mat('#edf0d8'),
    crystal:mat('#d6e7d6',{transparent:true,opacity:.66,roughness:.18,metalness:.12}),lotus:mat('#be7c6d',{roughness:.32,metalness:.12})};
  m.stone.color.set('#ffffff');m.roof.color.set('#e7eddd');m.roof.emissive.set('#b8c2a8');m.roof.emissiveIntensity=.14;
  k.ambient.groundColor.set('#c5c9b5');k.ambient.intensity=1.65;
  const island=(x,z)=>Math.hypot(x-12,z-8)<3.8;
  const floor=(x,z)=>Math.abs(x)<11.2&&z<5&&z>-24?.90:Math.abs(x)<10.3&&z>=5&&z<9?.90*(9-z)/4+.12:island(x,z)?.18:.12;
  k.setFloor(floor);k.setBounds({x:19,minZ:-21,maxZ:32});
  // A real water surface carries the prose; architecture remains solid jade.
  const seaCanvas=document.createElement('canvas');seaCanvas.width=1024;seaCanvas.height=2048;const sc=seaCanvas.getContext('2d');
  sc.textAlign='center';sc.textBaseline='middle';sc.font='29px KaiTi, STKaiti, serif';
  for(let col=0;col<32;col++)for(let row=0;row<64;row++){sc.fillStyle=`rgba(255,255,255,${.80+rnd()*.17})`;sc.fillText(seaVerse[(row+col*64)%seaVerse.length],16+col*32,16+row*32);}
  const seaInk=new THREE.CanvasTexture(seaCanvas);seaInk.wrapS=seaInk.wrapT=THREE.RepeatWrapping;seaInk.anisotropy=8;
  const seaMat=livingSea(seaInk);
  const sea=mesh(world,new THREE.PlaneGeometry(220,220,256,256),seaMat,0,-.12,0);sea.rotation.x=-Math.PI/2;sea.receiveShadow=false;sea.name='continuous-wave-sea';
  const upperSeaMat=livingSea(seaInk,{repeats:[8,4],strength:.94,opacity:.88});
  const upperSea=mesh(world,new THREE.PlaneGeometry(170,170,192,192),upperSeaMat,0,4.6,0);upperSea.rotation.x=-Math.PI/2;upperSea.name='opening-legible-verse-water';upperSea.castShadow=false;
  updates.push(t=>{seaMat.uniforms.uTime.value=t;upperSeaMat.uniforms.uTime.value=t;});
  const lightBeam=mat('#fff6d6',{transparent:true,opacity:.035,depthWrite:false,side:THREE.DoubleSide});
  for(let i=0;i<7;i++){const ray=mesh(world,new THREE.PlaneGeometry(1.8+rnd()*2,42),lightBeam,-30+i*10,15,-32+rnd()*14);ray.rotation.z=-.28;}
  const bubbles=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.045,0),mat('#e6ecd8',{transparent:true,opacity:.35}),190),dummy=new THREE.Object3D(),bubbleOrigin=[];
  for(let i=0;i<190;i++)bubbleOrigin.push([(rnd()-.5)*70,rnd()*24,(rnd()-.5)*90]);world.add(bubbles);
  updates.push(t=>{bubbleOrigin.forEach(([x,y,z],i)=>{dummy.position.set(x+Math.sin(t*.13+i)*.24,(y+t*.18)%25,z);dummy.scale.setScalar(.4+(i%7)*.18);dummy.updateMatrix();bubbles.setMatrixAt(i,dummy.matrix);});bubbles.instanceMatrix.needsUpdate=true;});
  // Broad promenade, shallow steps and a columned hall are one navigable layout.
  box(world,4,.21,43,m.stone,0,0,24);
  for(let z=4.5;z>-23;z-=1.4)for(let x=-9.8;x<10;x+=1.4)box(world,1.38,.12,1.38,m.stone,x,.83,z);
  box(world,22.4,.74,29,m.stone,0,.42,-9.5);
  for(let i=0;i<6;i++)box(world,20.6-i*.16,.14,1.0,m.jade,0,.07+i*.14,8.5-i*.66);
  railing(world,-2.25,12,-2.25,33,.15,m.jade);railing(world,2.25,12,2.25,33,.15,m.jade);
  for(const side of [-1,1]){
    railing(world,side*11,4.2,side*11,-23,.9,m.jade);
    for(let z=3;z>=-21;z-=6){const pillar=group(world,side*9.1,.9,z);
      cylinder(pillar,.34,.42,5.95,m.jade,0,3,0);cylinder(pillar,.54,.58,.25,m.stone,0,.13,0);cylinder(pillar,.48,.51,.14,m.gold,0,5.83,0);
      for(const y of [.4,5.5])cylinder(pillar,.36,.36,.06,m.gold,0,y,0);
      curve(pillar,[[-.8,5.9,0],[-.65,5.55,0],[0,5.25,0],[.65,5.55,0],[.8,5.9,0]],.075,m.trim);
      lantern(world,side*7.6,5.6,z,m,{blue:true});
    }
    box(world,.18,.3,27,m.trim,side*9.1,6.88,-9);box(world,.14,.21,27,m.gold,side*9.1,7.1,-9);
  }
  for(const z of [3,-9,-21])box(world,18.6,.36,.3,m.trim,0,6.93,z);
  const mainRoof=group(world,0,0,-9);roof(mainRoof,25.6,31,7.15,3.9,m.roof,m.trim);
  const upperRoof=group(world,0,0,-9);roof(upperRoof,16,17,11.2,2.2,m.roof,m.trim);
  for(const side of [-1,1]){box(world,.18,2.0,15,m.jade,side*6.6,10.2,-9);box(world,13.3,.15,.18,m.gold,0,11.1,-9+side*7.3);}
  plaque(world,'玄 溟 鲛 宫',5.5,1.1,0,6.18,3.26,{color:'#586c5c',background:'#d4dcc1',size:104});
  for(const [x,text] of [[-5.6,'仙尘路隔不能相依'],[5.6,'两地同心即伉俪也']]){
    const hanging=mesh(world,new THREE.PlaneGeometry(1.2,2.7),new THREE.MeshBasicMaterial({map:calligraphy(text,{width:256,height:768,size:64,gap:79,color:'#74856d'}),transparent:true,side:THREE.DoubleSide}),x,4.6,-20.6);
    const rod=cylinder(world,.04,.04,1.38,m.gold,x,6.0,-20.6);rod.rotation.z=Math.PI/2;
  }
  // Crystal chandelier and carved cloud bands.
  for(let i=0;i<15;i++){const a=i*Math.PI*2/15,r=1.1+(i%3)*.32;curve(world,[[0,8.5,-5],[Math.cos(a)*r,7.6,-5+Math.sin(a)*r]],.015,m.gold);
    const crystal=mesh(world,new THREE.OctahedronGeometry(.19,0),m.crystal,Math.cos(a)*r,7.35-(i%3)*.3,-5+Math.sin(a)*r);crystal.scale.y=2.5;}
  glow(world,0,7,-5,'#edf4d7',5);
  const throne=dragonThrone(world,m);
  k.hotspot('龙王宝座',[0,3,-17],()=>k.say([['罗刹海市 · 归思','“闻都尉有故土之思，诘旦趣装，可乎？”'],['一海之隔','仙尘路隔，鱼水之爱与膝下之欢，终究难以两全。']]),{stop:4.5});
  k.obstacles.push({x:0,z:-18,w:5.6,d:3.4});
  // The library's third tier contains the letter and the paired red-jade lotuses.
  const shelf=group(world,-7.7,.9,-4.5);box(shelf,3.4,4.0,.22,m.dark,0,2,-.5);
  for(const x of [-1.7,1.7])box(shelf,.18,4.3,1,m.jade,x,2.15,0);
  for(let tier=0;tier<5;tier++){box(shelf,3.5,.11,1,m.jade,0,.45+tier*.78,0);
    for(let i=0;i<9;i++){const b=box(shelf,.19,.53+(i%3)*.025,.43,i%3?m.wood:m.gold,-1.32+i*.31,.77+tier*.78,0);b.rotation.z=(i%4===0?.07:0);}}
  plaque(shelf,'鳞 书 阁',3,.67,0,4.48,.05,{color:'#516858',background:'#d8dfc6',size:124});
  const letter=group(shelf,.12,2.24,.56);box(letter,1,.035,.6,m.white);const letterInk=mesh(letter,new THREE.PlaneGeometry(.89,.51),new THREE.MeshBasicMaterial({map:calligraphy('忽忽三年红尘永隔盈盈一水青鸟难通',{size:38,width:512,height:320,gap:48}),transparent:true}),0,.021,0);letterInk.rotation.x=-Math.PI/2;
  const letterGlow=glow(letter,0,.12,0,'#cfe8db',1.3);let hasLetter=false,stamped=false;
  const lotus=group(shelf,1.05,2.42,.54);
  for(let i=0;i<8;i++){const a=i*Math.PI/4,p=mesh(lotus,new THREE.SphereGeometry(.11,12,8),m.lotus,Math.cos(a)*.12,.03,Math.sin(a)*.12);p.scale.set(.58,1.2,1);p.rotation.z=Math.cos(a)*.45;}
  cylinder(lotus,.11,.06,.12,m.gold,0,-.08,0);
  const libraryLabel=k.hotspot('鳞书阁 · 锦囊书',[-7.7,4.3,-4],()=>{
    if(hasLetter){k.announce('信笺已在袖中，循东侧玉台落笔。');return;}
    k.say([['龙女锦囊书','忽忽三年，红尘永隔；盈盈一水，青鸟难通。'],['赤玉莲花','那一对赤玉莲花，是马骥与龙女约定后会的信物。']],()=>{hasLetter=true;letter.visible=false;k.announce('信笺轻轻收起。东侧，玉笔在信笺台上等候。',6);},'收起信笺');
  },{stop:2.6,distance:38});k.clickable(shelf,()=>libraryLabel.action());
  const shelfLabel=k.hotspot('赤玉莲花',[-6.55,3.5,-3.9],()=>k.say([['罗刹海市 · 为信','“女乞一物为信，生在罗刹国所得赤玉莲花一对，出以授女。”']]),{stop:2.5,distance:10});
  k.obstacles.push({x:-7.7,z:-4.5,w:3.7,d:1.3});
  // Jade writing stand, brush and dragon seal.
  const altar=group(world,7.2,.9,-4.0);
  box(altar,3.2,.20,1.7,m.white,0,1.05,0);for(const x of [-1.15,1.15])box(altar,.22,1,1.2,m.jade,x,.5,0);
  box(altar,1.5,.025,.82,m.stone,-.3,1.17,0);const brush=group(altar,-.2,1.2,-.4);cylinder(brush,.018,.024,1.05,m.gold);brush.rotation.z=1.48;
  const seal=box(altar,.27,.16,.27,m.jade,1.0,1.22,.1);curve(altar,[[.88,1.34,.1],[1,1.52,.05],[1.13,1.44,.1]],.04,m.gold);
  let goldAt=-100,departAt=Infinity,departed=false;const stampRing=mesh(world,new THREE.RingGeometry(.92,1,96),new THREE.MeshBasicMaterial({color:'#d4b676',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),7.2,2.11,-4);stampRing.rotation.x=-Math.PI/2;
  const writing=createLetterWriting(k,()=>{stamped=true;goldAt=k.time;k.announce('两地同心，即伉俪也。',5,'信笺已落印');k.say([['龙女','“归养双亲，见君之孝……人生聚散，百年犹旦暮耳。”'],['两地同心','“何必旦夕相守，乃谓之偕老乎？”']],()=>{k.announce('信已封，海水合拢。随书页回到一灯书斋。',3);k.skip.hidden=true;departAt=k.time+2.6;});});
  function atAltar(){if(!hasLetter){k.announce('先去鳞书阁，读一封隔海寄来的书信。');return;}if(stamped){k.announce('信笺已封，沿玉阶回舟。');return;}writing.open();}
  const altarLabel=k.hotspot('信笺台 · 落笔',[7.2,2.8,-3.7],atAltar,{stop:1.45,distance:35});k.clickable(altar,()=>altarLabel.action());k.obstacles.push({x:7.2,z:-4,w:3.2,d:1.8});
  // A crystalline tree with a pale yellow heart, jade leaves and agate flowers.
  cylinder(world,3.7,4.1,.28,m.stone,12,.02,8,48);railing(world,7,7.5,10,8,.15,m.jade);box(world,4,.16,1.25,m.stone,8.9,.1,7.8);
  const {tree,falling}=verseJadeTree(k);
  k.hotspot('玉树 · 听花',[12,4.5,8],()=>{k.chime([740,988,1175]);k.say([['罗刹海市 · 玉树','“本莹澈如白琉璃，中有心淡黄色……叶类碧玉，厚一钱许，细碎有浓阴。”'],['一瓣之声','“每一瓣落，锵然作响。拾视之，如赤瑙雕镂，光明可爱。”']]);},{stop:3.0});
  // A quiet dance dais offers an optional pause under the crystal light.
  danceDais(k,m);
  k.hotspot('霞舞台',[0,2,-8],()=>{k.chime([440,554,659]);k.say([['玉树之下','“常与女啸咏其下。花开满树，状类薝葡。”'],['海上回声','“时有异鸟来鸣，毛金碧色，尾长于身，声等哀玉，恻人肺腑。”']]);},{stop:3.5,distance:15});
  k.hotspot('回舟 · 入书斋',[0,2.4,12.5],()=>k.go('study'),{stop:1.8,enabled:()=>stamped});
  // The voyage is an opening movement; the hall can then be explored freely.
  const boat=group(world,0,.18,35);const hull=mesh(boat,new THREE.SphereGeometry(1,24,12),m.wood);hull.scale.set(.9,.36,2.3);
  box(boat,1.44,.1,3.7,m.stone,0,.18,0);for(const side of [-1,1])curve(boat,[[0,.35,-2.2],[side*.8,.55,-1.2],[side*.85,.55,1.1],[0,.36,2.2]],.07,m.gold);
  const city=group(world,0,0,0);city.visible=false;
  const mirageMat=mat('#8ba99a',{transparent:true,opacity:.18,depthWrite:false});
  for(let i=0;i<9;i++){const x=(i-4)*4.4,h=2.6+(i%3)*1.4,z=8-(i%2)*3;box(city,2.8,h,2.2,mirageMat,x,h/2,z);const rt=group(city,x,0,z);roof(rt,3.7,3,h,.8,mirageMat,mirageMat);}
  const curtain=mesh(world,new THREE.PlaneGeometry(48,16),new THREE.MeshBasicMaterial({color:'#e1ece2',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),0,5,7);
  const voyageStart=k.time;let arrived=false;
  function arrive(){if(arrived)return;arrived=true;k.locked=false;k.skip.hidden=true;city.visible=false;boat.visible=false;boat.position.set(0,.2,26.5);k.setView(0,24,0,.04);k.announce('青白玉阶尽处，鳞书阁的第三层微微发亮。',7,'玄溟 · 鲛宫');}
  k.locked=true;k.skip.hidden=false;k.skip.textContent='略过舟行';k.skip.onclick=arrive;k.announce('海水分开，文字沉入碧波。',7,'登船 · 入海');
  updates.push(t=>{
    if(!departed&&t>=departAt){departed=true;k.go('study');}
    if(!arrived){const age=t-voyageStart,p=THREE.MathUtils.smoothstep(age/12,0,1),z=35-11*p,descent=1-THREE.MathUtils.smoothstep(age,1.5,7);boat.position.z=z;boat.position.y=.18+descent*4.6+Math.sin(t*1.1)*.025;k.setCamera(0,boat.position.y+1.67,z+.2);upperSeaMat.uniforms.uOpacity.value=.88*(1-THREE.MathUtils.smoothstep(age,3,6));
      city.visible=age>7.8&&age<12;curtain.material.opacity=age>9?Math.sin(Math.min(1,(age-9)/3)*Math.PI)*.42:0;if(age>=12)arrive();}
    else {curtain.material.opacity*=.93;upperSea.visible=false;}
    letterGlow.material.opacity=.38+.16*Math.sin(t*1.6);tree.rotation.z=Math.sin(t*.3)*.007;
    falling.forEach((chip,i)=>{const age=(t*.27+i*.19)%1;chip.position.set(Math.sin(i*2.4)*1.2+Math.sin(t*.4+i)*.2,4.1-age*3.7,Math.cos(i*2.4)*1.2);chip.rotation.set(age*2,i+age,age*.8);});
    const age=t-goldAt;stampRing.material.opacity=age>0&&age<2?.6*Math.sin(age/2*Math.PI):0;stampRing.scale.setScalar(.2+Math.max(0,Math.min(2,age))*1.5);
  });
  finishPalace(k,m);
}
