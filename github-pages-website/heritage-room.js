import {THREE,seeded,mat,group,mesh,box,cylinder,sphere,curve,plaque,calligraphy,glow} from './space-kit.js?build=tree-guide-74';
import {historicSurfaces,finishHistoricLighting} from './heritage-finishes.js?build=tree-guide-74';
import {interiorPalette} from './scene-finishes.js?build=tree-guide-74';
import {bakeCarvings} from './royal-fittings.js?build=tree-guide-74';

function texture(draw,size=512){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
export function heritageRoom(k){
  const root=group(k.world);root.name='historic-liaozhai-room';const p=interiorPalette(k),rnd=seeded(1842),d=group(root);
  const surfaces=historicSurfaces(),wood=surfaces.wood,brown=surfaces.brown,cream=mat('#e3d0ac',{roughness:1}),brass=mat('#857249',{roughness:.55,metalness:.5});
  const plaster=surfaces.plaster,floorMats=surfaces.floors;
  for(let row=0;row<23;row++)for(let col=0;col<15;col++){const x=-5.1+col*.73+(row%2)*.365;if(x<5.25)box(d,.71,.06,.46,floorMats[(row+col*3)%4],x,.07,-5.15+row*.47);}
  box(d,10.8,4.9,.22,plaster,0,2.5,-5.4);
  // Side walls have actual openings around the lattice windows.
  for(const side of [-1,1]){
    box(d,.22,1.48,10.8,plaster,side*5.4,.78,0);box(d,.22,1.43,10.8,plaster,side*5.4,4.18,0);
    for(const z of [-3.6,3.4])box(d,.22,2.0,3.6,plaster,side*5.4,2.5,z);
    const w=group(d,side*5.27,2.5,0);w.rotation.y=side<0?Math.PI/2:-Math.PI/2;
    mesh(w,new THREE.PlaneGeometry(2.8,1.95),new THREE.MeshBasicMaterial({color:'#d7e5db'}),0,0,-.05);
    for(const x of [-1.46,1.46])box(w,.13,2.14,.18,wood,x,0,0);for(const y of [-1.04,1.04])box(w,3.0,.12,.18,wood,0,y,0);
    for(let i=-3;i<=3;i++){box(w,.045,1.96,.075,wood,i*.40,0,.045);box(w,2.83,.045,.075,wood,0,i*.28,.045);}
    // The inset central square echoes the actual room's geometric window.
    for(const x of [-.46,.46])box(w,.065,.80,.09,wood,x,0,.10);for(const y of [-.40,.40])box(w,.98,.065,.09,wood,0,y,.10);
  }
  for(const x of [-3.68,3.68])box(d,3.35,4.9,.22,plaster,x,2.5,5.4);box(d,4.2,1.7,.22,plaster,0,4.1,5.4);
  for(const x of [-1.85,1.85])box(d,.22,3.25,.30,wood,x,1.72,5.25);box(d,3.9,.24,.32,wood,0,3.32,5.25);
  plaque(d,'聊斋',2.35,.92,0,3.98,5.54,{background:'#64392c',color:'#51745a',size:220});
  const ceiling=surfaces.ceiling;
  for(const side of [-1,1]){const roof=box(d,5.65,.09,10.8,ceiling,side*2.68,5.25,0);roof.rotation.z=-side*.17;for(let z=-5.1;z<5.4;z+=.45)curve(d,[[0,5.75,z],[side*2.7,5.28,z],[side*5.4,4.81,z]],.035,brown);}
  for(const z of [-5.1,0,5.1])box(d,10.7,.19,.21,wood,0,4.77,z);box(d,.25,.25,10.7,brown,0,5.73,0);
  for(const x of [-5.15,5.15])for(const z of [-5.1,5.1])box(d,.17,4.65,.17,wood,x,2.42,z);

  function apron(g,w,depth,y){box(g,w,.12,depth,brown,0,y,0);
    for(const z of [-depth/2+.012,depth/2-.012]){curve(g,[[-w/2+.015,y+.035,z],[0,y+.035,z],[w/2-.015,y+.035,z]],.008,brown);curve(g,[[-w/2+.02,y-.05,z],[0,y-.05,z],[w/2-.02,y-.05,z]],.009,wood);}
    for(const z of [-depth/2+.05,depth/2-.05]){box(g,w-.12,.18,.07,wood,0,y-.15,z);for(let x=-w*.35;x<w*.4;x+=.32)curve(g,[[x-.10,y-.20,z+.04],[x,y-.11,z+.05],[x+.10,y-.20,z+.04]],.012,brown);}
    for(const x of [-w/2+.13,w/2-.13])for(const z of [-depth/2+.13,depth/2-.13]){curve(g,[[x,y-.04,z],[x*1.02,y*.65,z],[x*.98,.17,z],[x*1.03,.12,z]],.047,wood);box(g,.065,.16,.055,brown,x,y-.15,z);const peg=cylinder(g,.009,.009,.012,brass,x,y-.15,z+.032,12);peg.rotation.x=Math.PI/2;}}
  function chair(x,z,angle=0){const g=group(d,x,.10,z);g.rotation.y=angle;apron(g,.72,.66,.49);for(const s of [-1,1]){curve(g,[[s*.31,.49,-.26],[s*.33,.85,-.29],[s*.32,1.40,-.25]],.032,wood);curve(g,[[s*.31,.64,.23],[s*.35,.91,.17],[s*.34,.95,-.24]],.026,brown);}curve(g,[[-.35,1.38,-.25],[0,1.44,-.29],[.35,1.38,-.25]],.045,brown);box(g,.22,.65,.035,wood,0,1.04,-.27);for(const y of [.84,1.12])box(g,.15,.025,.045,brass,0,y,-.24);}
  const altar=group(d,0,.1,-4.53);altar.name='portrait-altar';apron(altar,4.8,.90,.94);
  const plaqueFrame=group(d,0,0,-5.14);plaqueFrame.name='portrait-wall-frame';
  box(plaqueFrame,1.7,2.97,.06,p.cloth,0,2.65,0);box(plaqueFrame,1.82,3.08,.04,brown,0,2.65,-.05);
  plaque(d,'聊斋',2.9,.72,0,4.30,-5.12,{background:'#a38c5b',color:'#2f2b24',size:215});
  for(const [x,text] of [[-1.52,'刺贪刺虐入骨三分'],[1.52,'写鬼写妖高人一等']]){
    const c=document.createElement('canvas');c.width=256;c.height=1536;const b=c.getContext('2d');b.fillStyle='#29211b';b.fillRect(0,0,256,1536);b.font='140px KaiTi,STKaiti,serif';b.textAlign='center';b.textBaseline='middle';b.fillStyle='#cfb16c';[...text].forEach((ch,i)=>b.fillText(ch,128,155+i*174));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
    box(d,.47,2.9,.055,wood,x,2.66,-5.13);mesh(d,new THREE.PlaneGeometry(.41,2.82),new THREE.MeshBasicMaterial({map:t}),x,2.66,-5.08);
  }
  // Scholars' rocks on the altar, with irregular silhouettes and open holes.
  for(const x of [-1.85,-1.15,1.65]){const rock=group(altar,x,1.04,0);cylinder(rock,.16,.20,.08,wood);for(let i=0;i<5;i++){const a=i*1.7;const tor=mesh(rock,new THREE.TorusGeometry(.09+i*.009,.035,7,15),mat('#7a6b50',{roughness:1}),Math.sin(a)*.055,.10+i*.07,Math.cos(a)*.04);tor.rotation.set(i*.32,i*.5,a*.2);}}
  const censer=group(altar,.65,1.04,0);cylinder(censer,.21,.16,.17,brass);for(const s of [-1,1])curve(censer,[[s*.17,.06,0],[s*.28,.12,0],[s*.19,.22,0]],.018,brass);
  // Right-hand desk with two matching chairs, facing into the small room.
  const desk=group(d,4.30,.1,-2.20);desk.name='right-desk';desk.rotation.y=-Math.PI/2;apron(desk,2.45,.93,.85);
  for(const x of [-.65,.65]){box(desk,.60,.65,.07,wood,x,.48,.43);for(const y of [.27,.56]){box(desk,.45,.018,.025,brown,x,y,.475);const escutcheon=cylinder(desk,.025,.025,.012,brass,x,y+.085,.48,16);escutcheon.rotation.x=Math.PI/2;const handle=mesh(desk,new THREE.TorusGeometry(.034,.006,6,20),brass,x,y+.060,.497);handle.rotation.x=.20;}}
  chair(4.30,-3.95,-Math.PI/2);chair(4.30,-.48,-Math.PI/2);
  const teapot=group(desk,0,.96,0);sphere(teapot,.12,mat('#866344',{roughness:.72}));cylinder(teapot,.06,.08,.03,wood,0,.12,0);curve(teapot,[[.09,0,0],[.21,.07,0],[.22,.13,0]],.027,brown);for(const x of [-.35,.35])cylinder(teapot,.055,.04,.07,brown,x,0,0,20);
  // A raised sleeping platform by the entrance, with woven cover and rolled quilt.
  const bed=group(d,3.77,.1,3.30);bed.name='entrance-bed';box(bed,2.7,.62,2.85,cream,0,.31,0);box(bed,2.77,.10,2.92,brown,0,.64,0);
  const cloth=surfaces.linen;
  const blanket=mesh(bed,new THREE.PlaneGeometry(2.75,3.05,50,56),cloth,0,.72,0);blanket.rotation.x=-Math.PI/2;const bp=blanket.geometry.attributes.position;for(let i=0;i<bp.count;i++){const x=bp.getX(i),y=bp.getY(i);bp.setZ(i,.012*Math.sin(x*21+y*4)+.034*Math.sin(y*7+x*2)+.023*Math.sin(x*9-y*3));}bp.needsUpdate=true;blanket.geometry.computeVertexNormals();
  for(const side of [-1,1])curve(bed,[[side*1.33,.72,-1.48],[side*1.34,.72,0],[side*1.33,.70,1.48]],.008,mat('#80745b',{roughness:1,map:cloth.map}));
  const pillow=sphere(bed,1,mat('#8e6c57',{map:surfaces.linen.map,bumpMap:surfaces.linen.bumpMap,bumpScale:.015,roughness:1}),-.72,.84,-.83);pillow.scale.set(.58,.11,.33);
  const quilt=mesh(bed,new THREE.CapsuleGeometry(.20,1.6,8,20),mat('#786652',{roughness:1,map:cloth.map}),.47,.94,-.80);quilt.rotation.z=Math.PI/2;
  for(let i=0;i<2;i++){box(d,1.25,.62-i*.08,.80,brown,4.56,1+i*.57,1.12);cylinder(d,.055,.055,.025,brass,4.56,1.0+i*.57,1.54).rotation.x=Math.PI/2;}
  // Left sitting couch and stepped book shelves beneath the geometric window.
  const couch=group(d,-4.18,.1,1.56);couch.name='left-sitting-couch';couch.rotation.y=Math.PI/2;apron(couch,2.6,1.35,.52);box(couch,2.42,.09,1.20,cloth,0,.61,0);
  box(couch,2.58,.42,.08,wood,0,.88,-.61);for(const x of [-1.25,1.25]){box(couch,.08,.27,1.2,brown,x,.80,0);curve(couch,[[x,.90,.55],[x,.98,0],[x,1.04,-.60]],.04,wood);}
  const shelf=group(d,-4.73,.1,-2.90);shelf.name='left-book-shelf';shelf.rotation.y=Math.PI/2;
  for(const x of [-1.40,1.40])box(shelf,.08,2.85,.68,wood,x,1.44,0);for(const y of [.12,.84,1.54,2.25,2.88])box(shelf,2.85,.075,.70,brown,0,y,0);
  for(let row=0;row<4;row++){box(shelf,.07,.65,.65,wood,row%2?.45:-.45,.47+row*.70,0);for(let j=0;j<4;j++){const x=-1.02+j*.65,h=.17+rnd()*.12;box(shelf,.48,h,.43,j%2?cloth:p.ivory,x,.18+row*.70+h/2,0);for(let l=0;l<5;l++)box(shelf,.45,.004,.015,cream,x,.18+row*.70+l*.027,.224);}}
  bakeCarvings(d);
  k.setFloor(()=>.12);k.setBounds({x:5.0,minZ:-4.9,maxZ:5.0});
  k.obstacles.push({x:0,z:-4.53,w:4.8,d:.9},{x:4.30,z:-2.20,w:.95,d:4.3},{x:3.77,z:3.30,w:2.8,d:2.95},{x:-4.18,z:1.56,w:1.4,d:2.7},{x:-4.73,z:-2.9,w:.75,d:2.9});
  const key=new THREE.SpotLight('#ffe5b9',13,18,.64,.65,1.3);key.position.set(-2.3,4.4,2.5);key.target.position.set(0,2.4,-5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);root.add(key,key.target);
  const fill=new THREE.PointLight('#dce7dd',1.8,15,1.5);fill.position.set(3.4,3.3,0);root.add(fill);
  const halo=glow(root,0,3.7,-4.8,'#e7cf95',1.1);halo.material.opacity=.035;
  finishHistoricLighting(k,root);
  return{root,portraitFrame:plaqueFrame,portraitKey:key,halo};
}
