import {THREE,group,mesh,cylinder,sphere,curve,mat,glow} from './space-kit.js?build=room-light-68';
import {mergeGeometries} from './assets/utils/BufferGeometryUtils.js';

// Carvings are modelled separately, then share one draw call per material.
export function bakeCarvings(root){
  root.updateMatrixWorld(true);const inv=root.matrixWorld.clone().invert(),batches=new Map();let pieces=0;
  root.traverse(o=>{if(!o.isMesh)return;pieces++;const geo=o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld));
    if(!geo.attributes.uv)geo.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));
    if(!geo.index)geo.setIndex(Array.from({length:geo.attributes.position.count},(_,i)=>i));
    if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(geo);
  });
  const combined=[];for(const [material,parts] of batches){const geo=mergeGeometries(parts,false);if(!geo)throw new Error('Carving geometry could not be merged');const item=new THREE.Mesh(geo,material);item.castShadow=item.receiveShadow=true;combined.push(item);parts.forEach(p=>p.dispose());}
  root.clear();root.add(...combined);root.userData.carvedPieces=pieces;
}
function ring(p,r,t,m,x=0,y=0,z=0,flat=false){const o=mesh(p,new THREE.TorusGeometry(r,t,8,80),m,x,y,z);if(flat)o.rotation.x=-Math.PI/2;return o;}
function petalShape(length,width){const s=new THREE.Shape();s.moveTo(0,0);s.bezierCurveTo(-width*.9,length*.3,-width*.65,length*.76,0,length);s.bezierCurveTo(width*.65,length*.76,width*.9,length*.3,0,0);return s;}
function leafInlay(p,length,width,m){return mesh(p,new THREE.ShapeGeometry(petalShape(length,width),18),m);}
function scroll(p,x,y,z,scale,m,mirror=1){const points=[];for(let i=0;i<=30;i++){const t=i/30,a=t*Math.PI*2.5,r=scale*(1-t*.82);points.push([x+mirror*Math.cos(a)*r,y+Math.sin(a)*r,z]);}return curve(p,points,.022,m,.65);}

function dragonFace(p,m,scale=1){
  const g=group(p);g.scale.setScalar(scale);const gold=m.gold,dark=m.dark,ivory=m.white;
  sphere(g,.18,gold,0,0,0).scale.set(1.15,1,1.1);
  sphere(g,.14,gold,0,-.06,.19).scale.set(1.05,.62,1.45);
  // Jaw, nostrils, brows, antlers and whiskers distinguish the dragon's head.
  curve(g,[[-.14,-.10,.11],[0,-.16,.35],[.14,-.10,.11]],.029,dark);
  for(const s of [-1,1]){
    sphere(g,.025,dark,s*.067,-.035,.32);sphere(g,.026,ivory,s*.14,.055,.10);sphere(g,.014,dark,s*.15,.056,.12);
    curve(g,[[s*.07,.12,.16],[s*.17,.17,.1],[s*.21,.10,.0]],.025,gold,.5);
    curve(g,[[s*.11,.12,-.07],[s*.16,.31,-.15],[s*.29,.45,-.14],[s*.27,.52,-.24]],.027,gold,.2);
    curve(g,[[s*.18,.34,-.16],[s*.12,.43,-.25]],.016,gold,.15);
    curve(g,[[s*.09,-.07,.28],[s*.28,-.08,.43],[s*.45,.07,.36],[s*.48,.18,.2]],.014,gold,.15);
    for(let i=0;i<3;i++)curve(g,[[s*.15,-.09,-.05],[s*(.25+i*.035),-.22-i*.025,-.13],[s*.14,-.30-i*.04,-.08]],.019,gold,.15);
  }
  return g;
}

export function enrichThrone(g,m){
  const gold=m.gold,jade=m.jade,deep=mat('#315e58',{roughness:.36,metalness:.22}),pearl=m.white;
  // Slender, genuinely open side wings frame the tall central back.
  for(const side of [-1,1]){
    const wing=[[side*1.30,1.34,-.92],[side*1.92,1.72,-.96],[side*2.06,2.58,-1.02],[side*1.87,3.39,-1.08],[side*1.55,3.92,-1.02]];
    curve(g,wing,.075,gold,.52);
    for(let i=0;i<5;i++){const y=1.75+i*.36;scroll(g,side*1.62,y,-.91,.22,gold,side);curve(g,[[side*1.35,y-.10,-.88],[side*1.72,y+.05,-.9],[side*1.91,y+.17,-.97]],.025,jade);}
    // Paired dragons climb beside the central medallion.
    const points=[];for(let i=0;i<=60;i++){const t=i/60;points.push([side*(.91+.24*Math.sin(t*8)),1.63+t*2.02,-.49+.045*Math.cos(t*8)]);}
    curve(g,points,.087,gold,.57);
    for(let i=0;i<32;i++){const t=i/31,a=t*8,x=side*(.91+.24*Math.sin(a)),y=1.63+t*2.02;
      for(const shift of [-1,1])curve(g,[[x+shift*.057,y-.045,-.403],[x+shift*.072,y,-.393],[x,y+.05,-.398]],.009,deep);}
    const head=dragonFace(g,{...m,dark:deep},.90);head.position.set(side*1.05,3.71,-.46);head.rotation.z=side*.30;
    for(const y of [2.10,2.95])for(let i=0;i<3;i++)curve(g,[[side*.99,y,-.43],[side*.70,y-.10,-.39],[side*(.62+i*.06),y-.19-i*.055,-.33]],.019,gold,.25);
    // The apron follows the curved seat and terminates in small cabriole paws.
    scroll(g,side*.91,.91,1.03,.28,gold,side);
    for(const z of [-.65,.65]){sphere(g,.12,gold,side*1.48,.55,z+.05).scale.set(1.2,.65,1.6);for(let i=-1;i<=1;i++)sphere(g,.04,deep,side*1.48+i*.06,.53,z+.22);}
  }
  const crest=group(g,0,4.20,-.60);sphere(crest,.145,pearl,0,.05,0);
  for(const side of [-1,1]){curve(crest,[[side*.06,.12,0],[side*.24,.35,-.02],[side*.49,.28,-.06],[side*.68,.45,-.1],[side*.80,.34,-.08]],.032,gold,.3);scroll(crest,side*.37,-.04,0,.20,gold,side);}
  // Raised lotus mandala behind the dragon crest, with engraved jade petals.
  for(let i=0;i<12;i++){const a=i*Math.PI/6,p=group(g,Math.sin(a)*.49,2.65+Math.cos(a)*.49,-.55);p.rotation.z=-a;const inlay=leafInlay(p,.18,.055,pearl);inlay.position.y=.03;}
  ring(g,.76,.018,gold,0,2.65,-.56);
  const medallionHead=dragonFace(g,{...m,dark:deep},.85);medallionHead.position.set(.06,2.77,-.39);medallionHead.rotation.z=-.28;
  // Piped cushion edges and small embroidery stitches remain visible up close.
  const edging=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;edging.push([Math.cos(a)*1.38,1.29,Math.sin(a)*.65-.04]);}curve(g,edging,.018,gold);
  for(let i=0;i<24;i++){const a=i*Math.PI/12;curve(g,[[Math.cos(a)*.85,1.365,Math.sin(a)*.38-.04],[Math.cos(a+.04)*.96,1.36,Math.sin(a+.04)*.43-.04]],.009,pearl);}
  for(let j=0;j<3;j++){const y=.11+j*.17;const pts=[];for(let i=0;i<=100;i++){const a=i/100*Math.PI*2;pts.push([Math.cos(a)*(2.77-j*.30),y,Math.sin(a)*(1.65-j*.20)]);}curve(g,pts,.018,gold);}
  g.userData.detail='paired scaled dragons, open scroll wings, antlers, whiskers, embroidered cushion, curved apron';
  bakeCarvings(g);
}

export function danceDais(k,m){
  const root=group(k.world,0,.90,-8.1);root.name='lotus-cloud-dance-dais';const d=group(root),gold=m.gold;
  const pale=mat('#e1e7dd',{roughness:.35,metalness:.08}),rose=mat('#c6a6a3',{roughness:.52}),dark=mat('#4d7974',{roughness:.4,metalness:.16});
  for(let i=0;i<4;i++){
    const r=2.73-i*.14,y=.065+i*.11;cylinder(d,r,r+.04,.11,i%2?m.jade:pale,0,y,0,96);ring(d,r,.018,gold,0,y+.049,0,true);
  }
  // Rounded lotus lobes form a sculpted apron instead of a plain cylinder wall.
  for(let i=0;i<32;i++){
    const a=i*Math.PI/16,g=group(d,Math.sin(a)*2.36,.28,Math.cos(a)*2.36);g.rotation.y=a;
    const l=mesh(g,new THREE.ShapeGeometry(petalShape(.23,.105),16),i%2?m.jade:rose,0,-.1,.01);l.material.side=THREE.DoubleSide;
    const pts=petalShape(.23,.105).getPoints(24).map(p=>[p.x,p.y-.1,.022]);curve(g,pts,.009,gold);
    sphere(g,.022,gold,0,.18,.025);
  }
  cylinder(d,2.25,2.25,.025,pale,0,.454,0,96);ring(d,2.17,.019,gold,0,.473,0,true);ring(d,1.95,.012,dark,0,.475,0,true);
  // Three nested petal layers are flush inlays, not floating ornaments.
  for(let row=0;row<3;row++)for(let i=0;i<12;i++){
    const a=(i+row*.5)*Math.PI/6,g=group(d,0,.480+row*.001,0);g.rotation.set(-Math.PI/2,0,a);
    const p=leafInlay(g,.76+row*.42,.15+row*.05,row===1?rose:dark);p.position.y=.25;
    const outline=petalShape(.76+row*.42,.15+row*.05).getPoints(28).map(p=>[p.x,p.y+.25,.003]);curve(g,outline,.009,gold);
  }
  cylinder(d,.37,.37,.012,m.jade,0,.490,0,64);ring(d,.38,.018,gold,0,.498,0,true);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const bead=sphere(d,.038,m.white,Math.sin(a)*.23,.51,Math.cos(a)*.23);bead.scale.y=.4;}
  // Shallow approach steps preserve the open view from the nave to the throne.
  for(let i=0;i<2;i++){const p=cylinder(d,.80,.84,.10,pale,0,.05+i*.12,2.73-i*.23,48);p.scale.z=.48;ring(d,.77,.012,gold,0,.107+i*.12,2.73-i*.23,true).scale.y=.48;}
  bakeCarvings(d);root.userData.levels=4;
  // Side lamps and curved silk ribbons leave the middle of the hall clear.
  const silks=[];
  for(const side of [-1,1])for(const back of [-1,1]){
    const p=group(root,side*3.0,0,back*1.20);cylinder(p,.23,.32,.15,m.jade,0,.075,0,24);cylinder(p,.043,.065,2.42,gold,0,1.35,0,16);
    curve(p,[[0,2.45,0],[-side*.1,2.67,0],[-side*.4,2.70,0],[-side*.46,2.52,0]],.025,gold);
    const lamp=group(p,-side*.43,2.15,0),silk=mat('#ecd7b0',{roughness:.8,emissive:'#ffbd64',emissiveIntensity:.42});
    mesh(lamp,new THREE.LatheGeometry([[.09,-.21],[.16,-.16],[.19,0],[.16,.16],[.09,.21]].map(([r,y])=>new THREE.Vector2(r,y)),32),silk);
    for(const y of [-.21,.21]){cylinder(lamp,.12,.13,.025,gold,0,y,0,16);ring(lamp,.12,.009,gold,0,y,0,true);}
    for(let i=0;i<8;i++){const a=i*Math.PI/4,pts=[];for(let j=0;j<=16;j++){const t=j/16,r=.09+.10*Math.sin(t*Math.PI);pts.push([Math.cos(a)*r,-.21+t*.42,Math.sin(a)*r]);}curve(lamp,pts,.006,gold);}
    curve(lamp,[[0,.21,0],[0,.37,0]],.009,gold);curve(lamp,[[0,-.22,0],[0,-.36,0]],.008,gold);
    for(let i=0;i<5;i++)curve(lamp,[[(i-2)*.008,-.36,0],[(i-2)*.012,-.48,0]],.003,rose);
    bakeCarvings(p);glow(p,-side*.43,2.15,0,'#ffe2ac',.65).material.opacity=.16;
    const silkMat=mat(back===1?'#d8b7ad':'#a7c1b6',{roughness:.95,side:THREE.DoubleSide,transparent:true,opacity:.86});
    const geo=new THREE.PlaneGeometry(.13,.75,4,20),ribbon=mesh(p,geo,silkMat,-side*.43,1.44,0);ribbon.userData.origin=Float32Array.from(geo.attributes.position.array);silks.push(ribbon);
  }
  k.updates.push(t=>{for(let j=0;j<silks.length;j++){const s=silks[j],a=s.geometry.attributes.position,base=s.userData.origin;for(let i=0;i<a.count;i++){const v=(.375-base[i*3+1])/.75;a.setZ(i,Math.sin(t*.7+v*4+j)*.045*v);}a.needsUpdate=true;}});
  k.obstacles.push({x:0,z:-8.1,w:5.4,d:5.4});
  return root;
}
