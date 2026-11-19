import {THREE,seeded,mat,group,mesh,box,cylinder,sphere,curve,paperTexture} from './space-kit.js?build=sea-verse-66';

function lathe(parent,profile,material,x=0,y=0,z=0){return mesh(parent,new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),48),material,x,y,z);}
function ring(parent,r,t,material,x,y,z){const m=mesh(parent,new THREE.TorusGeometry(r,t,8,64),material,x,y,z);m.rotation.x=Math.PI/2;return m;}

export function makeCongeeStove(k){
  const root=group(k.world,-7,.07,-7);root.name='earthen-hearth-and-congee';const rnd=seeded(813);
  const clay=mat('#8d6e53',{roughness:.79,map:paperTexture('#d5c6a8')}),rim=mat('#4f4437',{roughness:.65});
  const brick=mat('#a79b83',{map:paperTexture('#d4c8af'),roughness:.95}),mortar=mat('#746d5d'),wood=mat('#927c58',{map:paperTexture('#d9c49b',true)});
  const ceramic=mat('#e3e7d3',{roughness:.25,metalness:.035}),celadon=mat('#6d9182',{roughness:.3}),dark=mat('#302d25');
  // A masonry hearth has a recessed arched firebox rather than a barrel body.
  box(root,1.12,.10,1.06,brick,0,.05,0);box(root,.17,.57,.98,brick,-.47,.37,0);box(root,.17,.57,.98,brick,.47,.37,0);box(root,.94,.57,.13,brick,0,.37,-.43);box(root,1.12,.12,1.06,brick,0,.70,0);
  const arch=new THREE.Shape();arch.moveTo(-.55,.1);arch.lineTo(-.55,.66);arch.lineTo(.55,.66);arch.lineTo(.55,.1);arch.lineTo(.30,.1);arch.lineTo(.30,.35);arch.bezierCurveTo(.30,.60,-.30,.60,-.30,.35);arch.lineTo(-.30,.1);arch.closePath();
  mesh(root,new THREE.ExtrudeGeometry(arch,{depth:.11,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,curveSegments:24}),brick,0,0,.39);
  box(root,.75,.46,.02,dark,0,.32,-.30);box(root,.81,.06,.70,mortar,0,.13,.03);
  for(const side of [-1,1])for(const y of [.24,.43,.62])box(root,.175,.013,.95,mortar,side*.47,y,0);
  for(const x of [-.43,.43])box(root,.012,.55,.01,mortar,x,.37,.515);
  const emberMat=mat('#6b3322',{emissive:'#bd4625',emissiveIntensity:.65,roughness:1});
  for(let i=0;i<12;i++){const ember=mesh(root,new THREE.DodecahedronGeometry(.04+rnd()*.025),emberMat,(rnd()-.5)*.49,.18,(rnd()-.5)*.35+.08);ember.scale.y=.5;}
  for(let i=0;i<4;i++)curve(root,[[-.23+i*.13,.18,.32],[-.16+i*.12,.19,-.10]],.027,wood);
  const fire=new THREE.PointLight('#ed9f53',1.8,3,1.8);fire.position.set(0,.3,.25);root.add(fire);
  // The pot wall includes its inner profile, lip, small foot and two clay handles.
  const pot=group(root,0,.77,0);pot.name='open-clay-porridge-pot';
  lathe(pot,[[.13,0],[.28,.035],[.39,.16],[.43,.30],[.42,.38],[.46,.40],[.46,.445],[.415,.445],[.397,.36],[.39,.22],[.27,.075],[.13,.05]],clay);
  ring(pot,.44,.018,rim,0,.425,0);ring(pot,.25,.012,rim,0,.035,0);
  for(const side of [-1,1])curve(pot,[[side*.39,.20,0],[side*.58,.21,0],[side*.59,.37,0],[side*.41,.35,0]],.035,clay);
  // Rice and a faint, creamy grain texture make the food readable up close.
  const foodCanvas=document.createElement('canvas');foodCanvas.width=foodCanvas.height=512;const b=foodCanvas.getContext('2d');
  b.fillStyle='#e7d8b4';b.fillRect(0,0,512,512);
  for(let i=0;i<1500;i++){const x=rnd()*512,y=rnd()*512;b.save();b.translate(x,y);b.rotate(rnd()*Math.PI);b.fillStyle=i%3?'rgba(255,248,218,.50)':'rgba(182,157,109,.17)';b.beginPath();b.ellipse(0,0,1.2+rnd(),3+rnd()*3,0,0,Math.PI*2);b.fill();b.restore();}
  const texture=new THREE.CanvasTexture(foodCanvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
  const congee=mat('#fff2d4',{map:texture,roughness:.58}),rice=mat('#f7eac8',{roughness:.7});
  const motions=[];
  function serve(parent,r,y,count,name){
    const liquid=mesh(parent,new THREE.CircleGeometry(r,72),congee,0,y,0);liquid.rotation.x=-Math.PI/2;liquid.name=name;
    const grains=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,5),rice,count),dummy=new THREE.Object3D();grains.name=name+'-rice-grains';
    for(let i=0;i<count;i++){const a=rnd()*Math.PI*2,d=Math.sqrt(rnd())*r*.94;dummy.position.set(Math.cos(a)*d,y+.002,Math.sin(a)*d);dummy.rotation.set((rnd()-.5)*.15,rnd()*Math.PI,(rnd()-.5)*.15);dummy.scale.set(.0038,.002,.008);dummy.updateMatrix();grains.setMatrixAt(i,dummy.matrix);}parent.add(grains);
    return liquid;
  }
  serve(pot,.392,.37,230,'simmering-rice-porridge');
  const bubbles=[];for(let i=0;i<8;i++){const a=rnd()*6.28,r=Math.sqrt(rnd())*.32;const bubble=sphere(pot,.013,congee,Math.cos(a)*r,.369,Math.sin(a)*r);bubbles.push({bubble,phase:rnd()*6});}
  for(let i=0;i<3;i++){const ripple=mesh(pot,new THREE.RingGeometry(.96,1,64),new THREE.MeshBasicMaterial({color:'#c6b28d',transparent:true,opacity:.1,depthWrite:false,side:THREE.DoubleSide}),0,.374+i*.0002,0);ripple.rotation.x=-Math.PI/2;motions.push({ripple,phase:i/3});}
  // Two filled bowls sit on their own small preparation table, away from the fire.
  const table=group(root,1.27,0,.25);box(table,1.05,.07,.87,wood,0,.79,0);for(const x of [-.40,.40])for(const z of [-.31,.31])box(table,.06,.77,.06,wood,x,.385,z);
  for(const x of [-.23,.23]){const bowl=group(table,x,.83,0);bowl.name=x<0?'filled-congee-bowl-one':'filled-congee-bowl-two';
    lathe(bowl,[[.065,0],[.072,.025],[.115,.055],[.16,.11],[.185,.18],[.181,.19],[.165,.18],[.147,.11],[.105,.065],[.065,.05]],ceramic);ring(bowl,.182,.007,celadon,0,.185,0);ring(bowl,.072,.006,celadon,0,.025,0);serve(bowl,.159,.155,65,x<0?'served-congee-one':'served-congee-two');}
  // A shallow carved ladle rests across the pot; a pair of chopsticks lies beside the bowls.
  const ladle=group(pot,.18,.47,.13);ladle.rotation.y=-.42;
  const scoop=lathe(ladle,[[0,-.06],[.04,-.055],[.075,-.025],[.09,.02],[.082,.025],[.067,-.012],[.035,-.04],[0,-.045]],wood);
  curve(ladle,[[.075,.01,0],[.26,.055,0],[.56,.11,.015],[.69,.115,.02]],.014,wood,.65);
  for(const z of [.25,.29])curve(table,[[-.42,.85,z],[.35,.85,z+.02]],.006,wood,.6);
  const lid=group(root,-.69,.29,-.13);lid.rotation.z=-.72;lathe(lid,[[0,.12],[.09,.11],[.24,.08],[.40,.02],[.42,0]],clay);sphere(lid,.045,rim,0,.15,0);
  // Soft white vapour rises on its own, in the pot and above the served bowl.
  const steamCanvas=document.createElement('canvas');steamCanvas.width=steamCanvas.height=128;const sb=steamCanvas.getContext('2d'),sg=sb.createRadialGradient(64,64,4,64,64,62);sg.addColorStop(0,'rgba(255,255,245,.38)');sg.addColorStop(.45,'rgba(255,255,245,.17)');sg.addColorStop(1,'rgba(255,255,245,0)');sb.fillStyle=sg;sb.fillRect(0,0,128,128);
  const steamTexture=new THREE.CanvasTexture(steamCanvas),vapour=[];
  for(let i=0;i<20;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:steamTexture,transparent:true,opacity:0,depthWrite:false,color:'#fffdf3'}));root.add(s);vapour.push(s);}
  k.updates.push(t=>{fire.intensity=1.6+.22*Math.sin(t*5)+.1*Math.sin(t*9);emberMat.emissiveIntensity=.58+.12*Math.sin(t*2);
    vapour.forEach((s,i)=>{const p=(t*.16+i/20)%1,bowl=i%4===0;const x=bowl?1.04:0,y=bowl?1.01:1.15;s.position.set(x+Math.sin(t*.55+i)*(.03+p*.10),y+p*.83,Math.cos(i*2.4+t*.3)*(.025+p*.09)+(bowl?.25:0));s.scale.set(.10+p*.30,.17+p*.42,1);s.material.opacity=Math.sin(p*Math.PI)*.52;});
    bubbles.forEach(({bubble,phase})=>{const p=(t*.20+phase)%1;const r=Math.sin(p*Math.PI);bubble.scale.set(r,r*.32,r);bubble.position.y=.37+r*.003;});
    motions.forEach(({ripple,phase})=>{const p=(t*.13+phase)%1;ripple.scale.setScalar(.05+p*.30);ripple.material.opacity=Math.sin(p*Math.PI)*.075;});
  });
  k.obstacles.push({x:-5.73,z:-6.75,w:1.05,d:.87});
  return root;
}
