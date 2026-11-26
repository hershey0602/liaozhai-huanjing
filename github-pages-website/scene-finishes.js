import {THREE,seeded,mat,group,mesh,box,cylinder,sphere,curve,roof,glow,plaque,calligraphy} from './space-kit.js?build=fluid-book-72';
import {mergeGeometries} from './assets/utils/BufferGeometryUtils.js';

// Small carved details share materials and are baked into a few static meshes.
function bake(root){
  root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),byMaterial=new Map();
  root.traverse(o=>{if(!o.isMesh||!o.visible||o.isInstancedMesh||Array.isArray(o.material))return;
    const g=o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld));
    if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
    if(!g.index)g.setIndex(Array.from({length:g.attributes.position.count},(_,i)=>i));
    if(!byMaterial.has(o.material))byMaterial.set(o.material,[]);byMaterial.get(o.material).push(g);
  });
  const merged=[];for(const [material,geometries] of byMaterial){const geometry=mergeGeometries(geometries,false);if(!geometry)return;const m=new THREE.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;merged.push(m);for(const g of geometries)g.dispose();}
  root.clear();root.add(...merged);
}
function canvasMap(draw,size=1024){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
function stoneMap(){return canvasMap((b,s)=>{b.fillStyle='#e9eadc';b.fillRect(0,0,s,s);const rnd=seeded(27);
  for(let i=0;i<65;i++){b.beginPath();const y=rnd()*s;b.moveTo(-20,y);for(let x=0;x<=s+20;x+=20)b.lineTo(x,y+Math.sin(x*.007+i)*27+Math.sin(x*.023+i*3)*7);b.strokeStyle=i%3?'rgba(105,139,128,.08)':'rgba(178,163,129,.10)';b.lineWidth=.6+rnd()*2;b.stroke();}
  for(let i=0;i<14000;i++){b.fillStyle=i%2?'#fff9':'#738e7810';b.fillRect(rnd()*s,rnd()*s,.7,.7);}});}
function woodMap(){return canvasMap((b,s)=>{b.fillStyle='#a58a60';b.fillRect(0,0,s,s);const rnd=seeded(36);
  for(let y=0;y<s;y+=2){b.beginPath();b.moveTo(0,y);for(let x=0;x<=s;x+=12)b.lineTo(x,y+Math.sin(x*.009+y*.031)*2.4+Math.sin(x*.036+y)*.55);b.lineWidth=.4+rnd()*.8;b.strokeStyle=y%4?'rgba(54,36,19,.10)':'rgba(242,215,160,.12)';b.stroke();}
  for(let i=0;i<12;i++){const x=rnd()*s,y=rnd()*s;for(let r=2;r<12;r+=2){b.beginPath();b.ellipse(x,y,r*5,r,.06,0,Math.PI*2);b.strokeStyle='#75553622';b.lineWidth=.5;b.stroke();}}});}
function gildingMap(){return canvasMap((b,s)=>{b.fillStyle='#d3b36c';b.fillRect(0,0,s,s);const rnd=seeded(7);for(let i=0;i<24000;i++){const a=rnd();b.fillStyle=a<.4?'rgba(110,70,27,.055)':'rgba(255,241,173,.12)';b.fillRect(rnd()*s,rnd()*s,rnd()*3+1,.5+rnd());}},512);}
function glazeMap(){return canvasMap((b,s)=>{b.fillStyle='#739b8c';b.fillRect(0,0,s,s);for(let y=0;y<s;y+=64)for(let x=-32;x<s;x+=64){const xx=x+(y/64%2)*32;const g=b.createLinearGradient(xx,y,xx+64,y+64);g.addColorStop(0,'#88b0a1');g.addColorStop(.6,'#6a9181');g.addColorStop(1,'#547b70');b.fillStyle=g;b.beginPath();b.roundRect(xx,y,62,63,10);b.fill();b.strokeStyle='#b5d0b244';b.lineWidth=1.4;b.stroke();}});}
function silkMap(){return canvasMap((b,s)=>{b.fillStyle='#cec4a5';b.fillRect(0,0,s,s);b.lineWidth=.5;for(let x=0;x<s;x+=3){b.strokeStyle=x%6?'#ffffff12':'#655a3e10';b.beginPath();b.moveTo(x,0);b.lineTo(x,s);b.stroke();}for(let y=0;y<s;y+=4){b.strokeStyle='#ffffef13';b.beginPath();b.moveTo(0,y);b.lineTo(s,y);b.stroke();}},512);}
function environment(k){
  if(k.scene.environment)return;
  const studio=new THREE.Scene();studio.background=new THREE.Color('#aaa58d');
  for(const [x,y,z,w,h,color] of [[0,8,0,9,9,'#fff4d9'],[-8,3,4,6,9,'#f3ddb1'],[7,4,-6,5,9,'#d2e5db'],[0,3,-12,6,6,'#e6c98c']]){
    const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));p.position.set(x,y,z);p.lookAt(0,1,0);studio.add(p);
  }
  const pmrem=new THREE.PMREMGenerator(k.renderer),map=pmrem.fromScene(studio,.06,.1,40);k.scene.environment=map.texture;pmrem.dispose();
  k.renderer.toneMapping=THREE.ACESFilmicToneMapping;k.renderer.toneMappingExposure=1.12;
  k.sun.shadow.mapSize.set(2048,2048);k.sun.shadow.normalBias=.025;
}
function palette(){const goldTexture=gildingMap(),jadeTexture=stoneMap();return{
  gold:mat('#e4c588',{map:goldTexture,metalness:.74,roughness:.3,envMapIntensity:1.2}),
  oldGold:mat('#94713e',{metalness:.61,roughness:.43}),
  jade:mat('#ffffff',{map:jadeTexture,roughness:.29,metalness:.07,envMapIntensity:.8}),
  deepJade:mat('#4c7e73',{roughness:.35,metalness:.15}),
  ivory:mat('#f3e8ce',{roughness:.55}),walnut:mat('#b9a07a',{map:woodMap(),roughness:.43}),
  darkWood:mat('#5b4833',{roughness:.5}),cloth:mat('#e5d5b2',{map:silkMap(),roughness:.98,side:THREE.DoubleSide}),
  porcelain:mat('#eef0d9',{roughness:.22,metalness:.06,envMapIntensity:.9}),
};}
function torus(p,r,t,m,x=0,y=0,z=0){return mesh(p,new THREE.TorusGeometry(r,t,8,48),m,x,y,z);}
function lathe(p,profile,m,x=0,y=0,z=0){return mesh(p,new THREE.LatheGeometry(profile.map(a=>new THREE.Vector2(...a)),40),m,x,y,z);}
function cloud(p,x,y,z,s,m){const g=group(p,x,y,z);g.scale.setScalar(s);curve(g,[[-1,0,0],[-.68,.04,0],[-.65,.31,0],[-.34,.42,0],[0,.12,0],[.34,.42,0],[.65,.31,0],[.68,.04,0],[1,0,0]],.027,m);return g;}
function lotus(p,x,y,z,r,m){const g=group(p,x,y,z);for(let i=0;i<10;i++){const a=i*Math.PI/5;const petal=mesh(g,new THREE.SphereGeometry(1,10,7),m,Math.cos(a)*r*.35,Math.sin(a)*r*.35,0);petal.scale.set(r*.16,r*.46,r*.07);petal.rotation.z=a-Math.PI/2;}sphere(g,r*.14,m,0,0,.04);return g;}
function fretPanel(p,w,h,m,back=null){
  if(back)box(p,w,h,.06,back,0,0,-.045);
  for(const x of [-w/2,w/2])box(p,.055,h,.06,m,x,0,0);for(const y of [-h/2,h/2])box(p,w,.055,.06,m,0,y,0);
  const n=Math.max(1,Math.floor(w/.5));for(let i=0;i<n;i++){const x=(i-(n-1)/2)*w/n;const g=group(p,x,0,.03);
    const r=Math.min(w/n*.36,h*.34);const d=mesh(g,new THREE.PlaneGeometry(r*1.3,r*1.3),m);d.rotation.z=Math.PI/4;d.visible=false;
    curve(g,[[-r,0,0],[0,r*.8,0],[r,0,0],[0,-r*.8,0],[-r,0,0]],.018,m);
    for(const s of [-1,1]){box(g,.024,h*.8,.035,m,s*r*.5,0,-.01);}
  }
}
function bracket(p,x,y,z,m){const g=group(p,x,y,z);for(let i=0;i<4;i++){const w=.4+i*.25;box(g,w,.09,.23,m,0,i*.14,0);for(const side of [-1,1])curve(g,[[side*w*.47,i*.14,0],[side*(w*.55+.10),i*.14+.09,0],[side*(w*.55+.10),i*.14+.22,0]],.045,m);}return g;}
function dragon(p,x,y,z,scale,m,{wrapped=false}={}){
  const g=group(p,x,y,z);g.scale.setScalar(scale);const pts=[];
  if(wrapped){for(let i=0;i<=80;i++){const a=i/80*Math.PI*4.3;pts.push([Math.sin(a)*.42,i/80*4.8,Math.cos(a)*.42]);}}
  else{for(let i=0;i<=70;i++){const a=-.8+i/70*Math.PI*3.1,r=1.75-i/70*.9;pts.push([Math.cos(a)*r,Math.sin(a)*r,0]);}}
  curve(g,pts,wrapped?.065:.12,m.gold,.52);
  for(let i=4;i<pts.length-2;i+=2){const a=pts[i],b=pts[i+1],s=wrapped?.038:.074;const sc=sphere(g,s,m.oldGold,a[0],a[1],a[2]+.025);sc.scale.z=.42;}
  const headP=pts[pts.length-1];const head=group(g,...headP);
  sphere(head,wrapped?.14:.25,m.gold);const snout=sphere(head,wrapped?.09:.15,m.gold,.15,.02,.11);snout.scale.x=1.6;
  for(const side of [-1,1]){curve(head,[[side*.08,.13,-.02],[side*.15,.37,-.06],[side*.28,.45,-.02]],.025,m.gold,.24);curve(head,[[.13,0,.13],[.35,-.08,.2],[.48,.04,.24]],.009,m.oldGold,.3);}
  sphere(head,.026,m.deepJade,.09,.10,.19);return g;
}
function cloth(p,x,y,z,w,h,m){const verts=[],uvs=[],ids=[],nx=28,ny=12;for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const u=i/nx,v=j/ny;verts.push((u-.5)*w,(v-.5)*h,Math.sin(u*Math.PI*12)*.07);uvs.push(u,v);if(i<nx&&j<ny){const a=j*(nx+1)+i;ids.push(a,a+1,a+nx+1,a+1,a+nx+2,a+nx+1);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(ids);g.computeVertexNormals();return mesh(p,g,m,x,y,z);}
function vase(p,x,y,z,s,m){const g=group(p,x,y,z);g.scale.setScalar(s);lathe(g,[[.12,0],[.21,.04],[.28,.2],[.29,.42],[.22,.64],[.10,.77],[.09,.9],[.13,.94]],m.porcelain);
  for(const yy of [.08,.64,.89]){const band=torus(g,yy===.08?.23:yy===.64?.22:.10,.012,m.deepJade,0,yy,0);band.rotation.x=Math.PI/2;}
  for(let i=0;i<6;i++){const a=i*Math.PI/3;const stem=curve(g,[[0,.3,0],[Math.sin(a)*.24,.4,Math.cos(a)*.24],[Math.sin(a)*.25,.59,Math.cos(a)*.25]],.007,m.deepJade);}
  return g;}
function landscape(){const c=document.createElement('canvas');c.width=1600;c.height=900;const b=c.getContext('2d'),rnd=seeded(442);
  b.fillStyle='#e8dfc6';b.fillRect(0,0,1600,900);
  const bloom=b.createRadialGradient(650,360,50,650,360,900);bloom.addColorStop(0,'#f5edd6');bloom.addColorStop(1,'#d6c8a7');b.fillStyle=bloom;b.fillRect(0,0,1600,900);
  for(let layer=0;layer<6;layer++){b.beginPath();b.moveTo(0,900);for(let x=0;x<=1600;x+=8){const y=280+layer*75-130*Math.pow(Math.max(0,Math.sin(x*.005+layer*1.2)),3)-75*Math.sin(x*.011+layer);b.lineTo(x,y);}b.lineTo(1600,900);b.closePath();b.fillStyle=`rgba(77,109,95,${.055+layer*.026})`;b.fill();}
  b.beginPath();b.moveTo(760,470);b.bezierCurveTo(580,610,1040,570,910,710);b.bezierCurveTo(800,820,450,760,430,900);b.lineWidth=75;b.strokeStyle='#e7e2cd';b.stroke();b.lineWidth=2;b.strokeStyle='#a9b5a362';b.stroke();
  for(let i=0;i<270;i++){const x=rnd()*1600,y=520+rnd()*350;if(Math.abs(x-(600+(y-520)*.4))<60)continue;const h=12+rnd()*40;b.strokeStyle='#536c5a55';b.lineWidth=1.5;b.beginPath();b.moveTo(x,y);b.lineTo(x,y-h);b.stroke();for(let j=0;j<5;j++){b.beginPath();b.moveTo(x-(j+1)*3,y-h+j*5);b.quadraticCurveTo(x,y-h+j*5-5,x+(j+1)*3,y-h+j*5);b.stroke();}}
  function pine(x,y,h){b.strokeStyle='#455b48';b.lineWidth=7;b.beginPath();b.moveTo(x,y);b.bezierCurveTo(x-24,y-h*.35,x+45,y-h*.62,x+15,y-h);b.stroke();for(let j=0;j<8;j++){const yy=y-h*.2-j*h*.09,xx=x+Math.sin(j)*18,w=h*(.32-j*.025);b.lineWidth=3;b.beginPath();b.moveTo(xx,yy);b.quadraticCurveTo(xx+w*.25,yy-18,xx+w,yy-7);b.moveTo(xx,yy);b.quadraticCurveTo(xx-w*.4,yy-15,xx-w*.8,yy-2);b.stroke();for(let n=0;n<60;n++){b.fillStyle=`rgba(61,85,65,${.1+rnd()*.3})`;b.beginPath();b.ellipse(xx+(rnd()-.5)*w*2,yy-10+(rnd()-.5)*22,2+rnd()*5,1+rnd()*2,0,0,Math.PI*2);b.fill();}}}
  pine(1280,870,470);pine(1450,860,310);pine(110,880,240);
  for(let i=0;i<10000;i++){b.fillStyle=i%2?'#fff8':'#40391c09';b.fillRect(rnd()*1600,rnd()*900,.7,.7);}
  b.font='32px KaiTi,serif';b.fillStyle='#56614e';['空','翠','爽','肌'].forEach((a,i)=>b.fillText(a,1130,120+i*42));b.fillStyle='#a6634c';b.fillRect(1135,300,37,45);b.font='19px KaiTi,serif';b.fillStyle='#ecdfc4';b.fillText('山',1143,320);b.fillText('居',1143,341);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}
function frame(p,w,h,x,y,z,m,art=null){const g=group(p,x,y,z);box(g,w+.18,h+.18,.10,m.darkWood,0,0,-.045);box(g,w+.07,h+.07,.10,m.gold,0,0,-.015);box(g,w,h,.04,m.cloth,0,0,.045);if(art)mesh(g,new THREE.PlaneGeometry(w-.14,h-.14),new THREE.MeshBasicMaterial({map:art,toneMapped:false}),0,0,.072);return g;}

export function finishPalace(k,materials){
  environment(k);const p=palette(),deco=group(k.world),rnd=seeded(49);
  materials.stone.map=p.jade.map;materials.stone.color.set('#e4eff4');materials.stone.roughness=.32;materials.stone.envMapIntensity=.6;
  materials.jade.map=p.jade.map;materials.jade.color.set('#f7f6e7');materials.jade.roughness=.3;
  materials.gold.map=p.gold.map;materials.gold.color.set('#e6ca92');materials.gold.metalness=.73;materials.gold.roughness=.3;
  materials.roof.map=glazeMap();materials.roof.color.set('#bed3c1');materials.roof.roughness=.36;materials.roof.metalness=.12;materials.roof.emissiveIntensity=.035;
  materials.trim.color.set('#527d70');materials.wood.color.set('#94a789');
  k.ambient.intensity=1.05;k.ambient.groundColor.set('#8c9e8c');k.sun.intensity=2.0;k.sun.color.set('#fff0d0');
  // Engraved foundation, gilt fillets, threshold and patterned jade paving.
  for(const y of [.17,.65,.87])box(deco,22.55,.045,29.1,p.gold,0,y,-9.5);
  for(const z of [4.7,-23.8])box(deco,22.4,.23,.09,p.deepJade,0,.55,z);
  for(const x of [-11.2,11.2])box(deco,.09,.23,28.5,p.deepJade,x,.55,-9.5);
  for(let i=0;i<6;i++)box(deco,20.7-i*.16,.022,.035,p.gold,0,.15+i*.14,8.99-i*.66);
  for(const x of [-2.15,2.15])box(deco,.07,.012,41,p.gold,x,.116,24);
  const paving=canvasMap((b,s)=>{const rnd=seeded(70);b.fillStyle='#d9e5e7';b.fillRect(0,0,s,s);for(let j=0;j<10;j++)for(let i=0;i<8;i++){b.fillStyle=(i+j)%2?'#e5ece8':'#c9dce2';b.fillRect(i*s/8+1,j*s/10+1,s/8-2,s/10-2);b.strokeStyle='#758f9a24';b.lineWidth=.6;for(let n=0;n<4;n++){b.beginPath();const y=j*s/10+rnd()*s/10;b.moveTo(i*s/8,y);b.bezierCurveTo(i*s/8+35,y+8,i*s/8+70,y-10,(i+1)*s/8,y+3);b.stroke();}}});
  const marble=mat('#ffffff',{map:paving,roughness:.42,emissive:'#b8cdd2',emissiveIntensity:.065});
  const floor=mesh(deco,new THREE.PlaneGeometry(21.9,28.5),marble,0,.902,-9.3);floor.rotation.x=-Math.PI/2;
  const pier=mesh(deco,new THREE.PlaneGeometry(3.94,31),marble,0,.119,25);pier.rotation.x=-Math.PI/2;
  const aisle=mesh(deco,new THREE.PlaneGeometry(3.7,26.5),mat('#dce9ed',{map:stoneMap(),roughness:.3}),0,.922,-8.3);aisle.rotation.x=-Math.PI/2;
  for(const x of [-1.86,1.86])box(deco,.035,.015,26.6,p.gold,x,.915,-8.3);
  for(let z=2;z>-20;z-=3.0){const medallion=torus(deco,.6,.017,p.gold,0,.932,z);medallion.rotation.x=Math.PI/2;const flower=lotus(deco,0,.94,z,.47,p.oldGold);flower.rotation.x=-Math.PI/2;}
  // Two additional inner columns give the facade three formal bays.
  for(const x of [-5.65,5.65]){const col=group(deco,x,.9,3);lathe(col,[[.52,0],[.56,.12],[.43,.22],[.32,.44],[.31,5.4],[.45,5.55],[.50,5.7],[.40,5.94]],p.jade);}
  for(const x of [-9.1,-5.65,5.65,9.1])for(const z of x===-9.1||x===9.1?[3,-3,-9,-15,-21]:[3]){
    const g=group(deco,x,.9,z);
    for(const y of [.25,.48,5.42,5.68]){const t=torus(g,y<1?.39:.37,.026,p.gold,0,y,0);t.rotation.x=Math.PI/2;}
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const base=group(g,Math.sin(a)*.44,.30,Math.cos(a)*.44);base.rotation.y=a;cloud(base,0,0,0,.17,p.oldGold);}
    bracket(g,0,5.86,0,p.gold);const cross=bracket(g,0,5.86,0,p.gold);cross.rotation.y=Math.PI/2;
    if(z===3){dragon(g,0,.65,0,.93,p,{wrapped:true});}
  }
  // Painted beam bands, raised cloud carving and coffered ceiling rosettes.
  for(const z of [3,-9,-21]){box(deco,18.5,.53,.20,p.deepJade,0,6.78,z+.19);for(const y of [6.55,7.01])box(deco,18.6,.035,.23,p.gold,0,y,z+.20);for(let x=-8;x<=8;x+=1.5)cloud(deco,x,6.76,z+.325,.55,p.gold);}
  for(let z=1;z>=-20;z-=3.6)for(const x of [-6,-2,2,6]){
    const g=group(deco,x,7.11,z);g.rotation.x=Math.PI/2;box(g,3.25,3.15,.045,p.ivory);for(const xx of [-1.55,1.55])box(g,.055,3.1,.035,p.gold,xx,0,.04);for(const yy of [-1.48,1.48])box(g,3.1,.055,.035,p.gold,0,yy,.04);lotus(g,0,0,.06,.72,p.gold);}
  for(const side of [-1,1]){
    const drapeMat=mat('#83a797',{map:silkMap(),roughness:.85,side:THREE.DoubleSide});cloth(deco,side*7.3,4.55,3.1,1.25,4.3,drapeMat);
    for(const y of [2.46,6.61])box(deco,1.3,.06,.06,p.gold,side*7.3,y,3.2);
    for(let z=-6;z>-21;z-=5.4){const panel=group(deco,side*9.35,3.55,z);panel.rotation.y=side<0?Math.PI/2:-Math.PI/2;fretPanel(panel,3.3,3.2,p.gold);lotus(panel,0,0,.04,.7,p.deepJade);}
  }
  // Pearl strings and drop-cut crystals surround the original central light.
  const crystal=mat('#d7e8d9',{metalness:.1,roughness:.12,transparent:true,opacity:.73,envMapIntensity:1.1});
  for(const radius of [.85,1.5,2]){const crown=torus(deco,radius,.035,p.gold,0,7.1,-5);crown.rotation.x=Math.PI/2;}
  for(let i=0;i<20;i++){const a=i*Math.PI/10;for(let j=0;j<9;j++){const q=j/8,r=.4+q*1.6;const y=7.9-Math.sin(q*Math.PI/2)*.82;sphere(deco,.035,p.porcelain,Math.cos(a)*r,y,-5+Math.sin(a)*r);}const drop=mesh(deco,new THREE.SphereGeometry(.13,10,12),crystal,Math.cos(a)*1.96,6.78,-5+Math.sin(a)*1.96);drop.scale.set(.68,2.2,.68);}
  // Deep ceremonial backdrop: a carved coiling dragon above the throne.
  const apse=group(deco,0,.9,-21.1);box(apse,7.3,5.4,.16,p.deepJade,0,2.7,0);for(const x of [-3.55,3.55])box(apse,.08,5.4,.12,p.gold,x,2.7,.1);for(const y of [.1,5.3])box(apse,7.1,.08,.12,p.gold,0,y,.1);
  const disc=cylinder(apse,2.08,2.08,.09,p.oldGold,0,3.1,.16,64);disc.rotation.x=Math.PI/2;
  for(const r of [1.97,2.12])torus(apse,r,.027,p.gold,0,3.1,.23);
  dragon(apse,0,3.12,.27,.95,p);for(const x of [-2.7,2.7])for(const y of [1.0,2.0,3.0,4.0])cloud(apse,x,y,.18,.36,p.gold);
  for(const side of [-1,1]){const g=group(deco,side*4.4,.91,-18);vase(g,0,0,0,1.25,p);lotus(g,0,1.35,0,.3,p.gold);}
  // Carved railing infills replace the empty gaps between the simple rails.
  for(const side of [-1,1])for(let z=13.1;z<32;z+=1.1){const panel=group(deco,side*2.25,.57,z);panel.rotation.y=Math.PI/2;fretPanel(panel,.95,.38,p.oldGold);}
  for(const side of [-1,1])for(let z=2.7;z>-22;z-=1.1){const panel=group(deco,side*11,1.36,z);panel.rotation.y=Math.PI/2;fretPanel(panel,.95,.4,p.oldGold);}
  // Two distant pavilions and their corridors give the sea a layered horizon.
  for(const side of [-1,1]){const wing=group(deco,side*22,.25,-8);cylinder(wing,5.8,6.1,.45,p.jade,0,0,0,48);for(const x of [-3.2,3.2])for(const z of [-3.2,3.2]){cylinder(wing,.16,.22,4.8,p.jade,x,2.6,z);bracket(wing,x,4.75,z,p.gold);}roof(wing,9.4,9.4,5.4,2.5,materials.roof,p.gold);roof(wing,5.5,5.5,7.2,1.3,materials.roof,p.gold);vase(wing,0,.25,0,1.7,p);box(deco,10,.18,2.2,p.jade,side*16,.90,-6);
    for(const zz of [-7.1,-4.9]){box(deco,10,.06,.05,p.gold,side*16,1.5,zz);for(let x=12;x<21;x+=1.15)cylinder(deco,.04,.06,.6,p.jade,side*x,1.2,zz,8);}
  }
  for(const side of [-1,1])for(const z of [15,23,30]){const base=group(deco,side*2.35,.16,z);lathe(base,[[.19,0],[.26,.06],[.20,.2],[.09,.3],[.07,1.4],[.22,1.47],[.17,1.6]],p.jade);const lantern=mesh(base,new THREE.OctahedronGeometry(.21,1),crystal,0,1.79,0);lantern.scale.y=1.3;torus(base,.23,.015,p.gold,0,1.64,0).rotation.x=Math.PI/2;}
  for(const side of [-1,1]){const plant=group(deco,side*6,.1,18);cylinder(plant,.6,.72,.2,p.jade);for(let i=0;i<9;i++){const a=i*2.4,rr=.2+rnd()*.5;curve(plant,[[0,.1,0],[Math.cos(a)*rr,.5,Math.sin(a)*rr],[Math.cos(a)*rr*1.3,.8+rnd()*.45,Math.sin(a)*rr*1.3]],.04,p.ivory,.18);}}
  bake(deco);
  const warm=new THREE.PointLight('#ffe0aa',12,30,1.5);warm.position.set(0,6.2,-6);k.world.add(warm);
  const cool=new THREE.PointLight('#c3ecdf',8,24,1.5);cool.position.set(11,5.8,7);k.world.add(cool);
  // Slow caustic light is projected over the jade floor as translucent strokes.
  const lightMat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform float uTime;varying vec2 vUv;void main(){vec2 p=vUv*26.;float v=sin(p.x+sin(p.y*.7+uTime*.15))*sin(p.y*.85+sin(p.x*.7-uTime*.12));float a=pow(max(0.,v),12.)*.095;gl_FragColor=vec4(.91,.99,.88,a);}`});
  const caustic=mesh(k.world,new THREE.PlaneGeometry(20,27),lightMat,0,.98,-8);caustic.rotation.x=-Math.PI/2;caustic.castShadow=false;caustic.receiveShadow=false;k.updates.push(t=>lightMat.uniforms.uTime.value=t);
}

export function finishStudy(k,room,{finale=false}={}){
  environment(k);const p=palette(),d=group(k.world),rnd=seeded(387);
  room.m.wood.map=p.walnut.map;room.m.wood.color.set('#b6a17f');room.m.wood.roughness=.46;
  const floorTones=['#f4e7c7','#ded2b7','#efe1c2','#d4c9af'].map(color=>mat(color,{map:p.walnut.map,roughness:.67}));
  room.floorboards?.forEach((board,i)=>{board.material=floorTones[(i*7)%floorTones.length];});
  room.m.dark.color.set('#5e4b36');room.m.wall.color.set('#fbf4df');room.m.paper.color.set('#fff9ec');
  room.m.bronze.map=p.gold.map;room.m.bronze.color.set('#99834f');room.m.bronze.roughness=.4;room.m.bronze.metalness=.64;
  // Layered wainscot and carved transoms soften the bare rectangular shell.
  for(const side of [-1,1]){
    box(d,.12,.95,26,p.walnut,side*9.8,.62,-1.3);for(const y of [.18,1.1])box(d,.17,.045,26,p.oldGold,side*9.7,y,-1.3);
    for(let z=9;z>-14;z-=2){const panel=group(d,side*9.68,.65,z);panel.rotation.y=side<0?Math.PI/2:-Math.PI/2;fretPanel(panel,1.75,.55,p.darkWood);}
    box(d,.14,.4,25,p.walnut,side*9.7,5.2,-1.4);
    for(let z=9;z>-14;z-=2){const panel=group(d,side*9.58,5.2,z);panel.rotation.y=side<0?Math.PI/2:-Math.PI/2;cloud(panel,0,0,0,.70,p.oldGold);}
  }
  box(d,19.5,.95,.13,p.walnut,0,.6,-14.8);box(d,19.5,.045,.15,p.oldGold,0,1.12,-14.7);
  // A substantial landscape hanging gives the rear wall a clear focal point.
  const art=frame(d,5.5,2.85,0,3.6,-14.68,p,landscape());
  for(const y of [2.12,5.10]){const rod=cylinder(d,.05,.05,5.75,p.darkWood,0,y,-14.48);rod.rotation.z=Math.PI/2;}
  for(const x of [-3.15,3.15]){const scroll=frame(d,.62,2.8,x,3.6,-14.65,p);const text=x<0?'静息以伺其变':'生乐之习以为常';mesh(scroll,new THREE.PlaneGeometry(.48,2.62),new THREE.MeshBasicMaterial({map:calligraphy(text,{width:200,height:900,size:72,gap:99,color:'#62563e'}),transparent:true}),0,0,.08);}
  // Woven rush mat, carved desk apron, thread binding and celadon tea ware.
  const matTex=canvasMap((b,s)=>{b.fillStyle='#a99d78';b.fillRect(0,0,s,s);for(let y=0;y<s;y+=5){b.strokeStyle=y%10?'#d9c79f66':'#786b4966';b.lineWidth=2;b.beginPath();b.moveTo(0,y);b.lineTo(s,y);b.stroke();}b.strokeStyle='#6f6549';b.lineWidth=24;b.strokeRect(18,18,s-36,s-36);},512);
  const rug=mesh(d,new THREE.PlaneGeometry(6.9,4.2),mat('#f1e4bf',{map:matTex,roughness:1}),0,.083,-1.9);rug.rotation.x=-Math.PI/2;
  const table=group(d,0,.12,-2);
  box(table,5.55,.025,1.88,p.darkWood,0,.94,0);for(const z of [-.82,.82]){box(table,5.12,.22,.07,p.walnut,0,.66,z);for(let x=-2.1;x<2.2;x+=.7)cloud(table,x,.66,z+(z>0?.045:-.045),.27,p.darkWood);}
  for(const x of [-2.35,2.35])for(const z of [-.66,.66]){curve(table,[[x,.82,z],[x*1.045,.64,z],[x*.97,.41,z],[x*1.02,.10,z],[x*1.09,.06,z]],.072,p.walnut,.72);}
  if(!room.paperBook){for(let i=0;i<9;i++)box(room.book,.885,.003,.805,p.ivory,0,-.025+i*.007,0);
    for(let i=0;i<4;i++){const z=-.28+i*.18;curve(room.bookCover,[[.06,.019,z-.055],[.11,.030,z],[.06,.019,z+.055]],.005,p.ivory);}}
  const pot=group(table,-.83,1.0,-.58);lathe(pot,[[.08,0],[.1,.02],[.11,.19],[.1,.24],[.08,.25]],p.porcelain);
  for(let i=0;i<5;i++){const pen=cylinder(pot,.006,.009,.38,p.darkWood,(rnd()-.5)*.1,.32,(rnd()-.5)*.1,8);pen.rotation.z=(rnd()-.5)*.3;}
  const tray=group(table,1.8,1.0,-.57);box(tray,.67,.028,.46,p.darkWood);for(const x of [-.22,.22]){lathe(tray,[[.035,0],[.05,.02],[.065,.09],[.06,.10]],p.porcelain,x,.025,0);}
  const teapot=lathe(tray,[[.07,0],[.13,.06],[.13,.14],[.07,.19],[.06,.22]],p.porcelain,0,.03,-.04);sphere(tray,.023,p.deepJade,0,.275,-.04);curve(tray,[[.10,.12,-.04],[.22,.15,-.04],[.24,.23,-.04]],.022,p.porcelain);curve(tray,[[-.09,.11,-.04],[-.20,.17,-.04],[-.09,.24,-.04]],.016,p.porcelain);
  // Scroll bundles and vessels break the repeated empty shelf pattern.
  for(const side of [-1,1]){
    const shelf=group(d,side*8.7,0,-8.8);shelf.rotation.y=side===1?-Math.PI/2:Math.PI/2;
    for(const y of [.36,1.28,2.22,3.14]){box(shelf,4.5,.025,.91,p.oldGold,0,y+.07,.02);}
    for(const x of [-2.17,2.17]){box(shelf,.025,3.5,.03,p.oldGold,x,1.9,.47);}
    vase(shelf,-1.5,3.24,.1,.54,p);vase(shelf,1.5,2.31,.1,.45,p);
    for(let i=0;i<5;i++){const roll=cylinder(shelf,.055,.055,.58,p.ivory,-.6+i*.14,3.58,.08);roll.rotation.z=Math.PI/2;torus(shelf,.058,.008,p.darkWood,-.32+i*.14,3.58,.08).rotation.y=Math.PI/2;}
    const plant=group(d,side*5.8,.15,-11.8);vase(plant,0,0,0,.95,p);
    for(let i=0;i<7;i++){const a=i*2.4;curve(plant,[[0,.75,0],[Math.cos(a)*.17,1.2,Math.sin(a)*.15],[Math.cos(a)*.4,1.7+i*.04,Math.sin(a)*.36]],.011,p.darkWood,.28);for(let j=0;j<4;j++){const leaf=mesh(plant,new THREE.SphereGeometry(1,8,5),p.deepJade,Math.cos(a)*(.15+j*.07),1.18+j*.16,Math.sin(a)*(.15+j*.07));leaf.scale.set(.13,.018,.04);leaf.rotation.z=a;}}
  }
  // Patterned screens, draped silk and an ornate bronze incense vessel.
  for(const side of [-1,1]){const panel=group(d,side*4.65,3.25,9.6);fretPanel(panel,1.2,4.4,p.walnut);cloth(d,side*3.75,3.12,10.7,1.25,4.3,p.cloth);}
  for(const child of room.incense.children){if(child.isMesh&&child.geometry.type==='CylinderGeometry'&&child.position.y>1)child.visible=false;}
  const burner=group(d,-6,1.15,1.2);lathe(burner,[[.11,-.13],[.23,-.11],[.34,.04],[.32,.20],[.36,.22],[.36,.27],[.30,.29]],p.oldGold);
  const ash=cylinder(burner,.27,.27,.01,mat('#665c48'),0,.23,0);
  for(const side of [-1,1])curve(burner,[[side*.28,.03,0],[side*.49,.08,0],[side*.49,.31,0],[side*.30,.28,0]],.026,p.oldGold);
  for(let i=0;i<3;i++){const a=i*2.094;curve(burner,[[Math.cos(a)*.2,-.07,Math.sin(a)*.2],[Math.cos(a)*.24,-.25,Math.sin(a)*.24],[Math.cos(a)*.31,-.29,Math.sin(a)*.31]],.031,p.oldGold);}
  for(let i=0;i<10;i++){const a=i*Math.PI/5;const med=lotus(burner,Math.sin(a)*.32,.08,Math.cos(a)*.32,.07,p.gold);med.rotation.y=a;}
  const stool=group(d,0,.15,-4.1);cylinder(stool,.46,.43,.12,p.walnut,0,.5,0,32);for(const x of [-.28,.28])for(const z of [-.28,.28])box(stool,.065,.5,.065,p.darkWood,x,.25,z);
  bake(d);
  const moonWash=new THREE.SpotLight('#d4e5e1',finale?8:17,24,.62,.65,1.6);moonWash.position.set(9,4.3,-3.7);moonWash.target.position.set(-2,.2,1);k.world.add(moonWash,moonWash.target);
  const deskWarm=new THREE.PointLight('#ffe2af',finale?2.6:4.7,12,1.6);deskWarm.position.set(-1.9,2.0,-2.3);k.world.add(deskWarm);
  if(!finale){k.ambient.intensity=1.16;k.sun.intensity=.7;k.sun.color.set('#ece8d8');}
  room.finishes=p;
}

export function interiorPalette(k){environment(k);return palette();}
export function finishEnding(k,scroll){
  const p=palette(),d=group(k.world,0,0,-8.55);
  // A brocade hanging, paired lamps and carved frame give the portrait a setting.
  box(d,4.2,5.85,.12,p.darkWood,0,3,0);box(d,3.95,5.65,.06,p.gold,0,3,.08);box(d,3.80,5.50,.05,p.cloth,0,3,.13);
  for(const x of [-1.85,1.85]){for(let y=.6;y<5.5;y+=.55)cloud(d,x,y,.19,.16,p.oldGold);}
  for(const side of [-1,1]){const base=group(d,side*2.6,.1,.9);lathe(base,[[.35,0],[.40,.09],[.27,.22],[.16,.34],[.10,1.28],[.24,1.4],[.29,1.49]],p.oldGold);const flame=mesh(base,new THREE.SphereGeometry(.07,12,12),new THREE.MeshBasicMaterial({color:'#ffe1a0'}),0,1.68,0);flame.scale.set(.6,2,.6);}
  bake(d);const portraitKey=new THREE.SpotLight('#ffe2b0',18,24,.30,.7,1.4);portraitKey.position.set(-3,5.6,2);portraitKey.target.position.set(0,3,-8);k.world.add(portraitKey,portraitKey.target);
  const halo=glow(k.world,0,3.8,-8,'#e0ba73',5);halo.material.opacity=.10;
  return {root:d,portraitKey,halo};
}
