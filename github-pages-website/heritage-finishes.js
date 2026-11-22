import {THREE,seeded,mat,group,mesh,box,curve} from './space-kit.js?build=room-light-68';

function canvasMap(draw,size=1024,color=true){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new THREE.CanvasTexture(c);if(color)t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
export function historicSurfaces(){
  const rnd=seeded(32168);
  const grain=canvasMap((b,s)=>{b.fillStyle='#886346';b.fillRect(0,0,s,s);
    for(let y=0;y<s;y++){b.beginPath();b.moveTo(0,y);for(let x=0;x<=s;x+=8)b.lineTo(x,y+Math.sin(x*.011+y*.017)*4+Math.sin(x*.034+y*.07)*1.2);b.strokeStyle=y%3?'rgba(36,20,11,.16)':'rgba(221,181,128,.23)';b.lineWidth=.5+rnd();b.stroke();}
    for(let i=0;i<7;i++){const x=rnd()*s,y=rnd()*s;for(let r=2;r<24;r+=2){b.beginPath();b.ellipse(x,y,r*3.5,r*.55,.02,0,6.283);b.strokeStyle='rgba(47,24,11,.17)';b.lineWidth=.7;b.stroke();}}
    for(let i=0;i<1100;i++){b.strokeStyle=i%3?'rgba(241,207,158,.09)':'rgba(21,12,6,.13)';b.beginPath();const x=rnd()*s,y=rnd()*s;b.moveTo(x,y);b.lineTo(x+3+rnd()*38,y+.3);b.stroke();}
  });
  const woodRough=canvasMap((b,s)=>{b.fillStyle='#b0b0b0';b.fillRect(0,0,s,s);for(let y=0;y<s;y+=3){b.strokeStyle=y%9?'#96969688':'#d7d7d766';b.beginPath();b.moveTo(0,y);b.lineTo(s,y+Math.sin(y)*2);b.stroke();}},512,false);
  const wood=new THREE.MeshPhysicalMaterial({color:'#5b4539',map:grain,bumpMap:grain,bumpScale:.014,roughnessMap:woodRough,roughness:.65,clearcoat:.18,clearcoatRoughness:.48,envMapIntensity:.28});
  const brown=wood.clone();brown.color.set('#ad8c6d');brown.roughness=.53;brown.clearcoat=.24;
  const plasterMap=canvasMap((b,s)=>{b.fillStyle='#ded2b6';b.fillRect(0,0,s,s);for(let i=0;i<95;i++){const x=rnd()*s,y=rnd()*s,r=20+rnd()*100,g=b.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,i%3?'rgba(120,108,84,.035)':'rgba(255,250,222,.12)');g.addColorStop(1,'rgba(160,145,115,0)');b.fillStyle=g;b.fillRect(x-r,y-r,r*2,r*2);}for(let i=0;i<45000;i++){b.fillStyle=i%2?'rgba(72,62,44,.07)':'rgba(255,255,240,.14)';b.fillRect(rnd()*s,rnd()*s,.8+rnd(),.8+rnd());}});
  const plaster=mat('#f6edd9',{map:plasterMap,bumpMap:plasterMap,bumpScale:.026,roughness:1,envMapIntensity:.1});
  const stoneMap=canvasMap((b,s)=>{b.fillStyle='#c4c2b9';b.fillRect(0,0,s,s);for(let i=0;i<180;i++){const x=rnd()*s,y=rnd()*s,r=8+rnd()*90,g=b.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,i%2?'rgba(64,62,53,.09)':'rgba(255,255,245,.12)');g.addColorStop(1,'rgba(128,128,128,0)');b.fillStyle=g;b.fillRect(x-r,y-r,r*2,r*2);}for(let i=0;i<19000;i++){b.fillStyle=i%4?'#4e4b4018':'#ffffff44';b.fillRect(rnd()*s,rnd()*s,1+rnd()*2,1+rnd());}b.strokeStyle='#665e4c33';b.lineWidth=3;b.strokeRect(2,2,s-4,s-4);});
  const floors=['#aaa69b','#b6afa1','#99998f','#b2b0a5'].map(c=>mat(c,{map:stoneMap,bumpMap:stoneMap,bumpScale:.021,roughness:.91,envMapIntensity:.12}));
  const weave=canvasMap((b,s)=>{b.fillStyle='#c8bfa9';b.fillRect(0,0,s,s);for(let x=0;x<s;x+=4){b.strokeStyle=x%8?'#f3ead3aa':'#625c4c55';b.lineWidth=1;b.beginPath();b.moveTo(x,0);b.lineTo(x,s);b.stroke();}for(let y=0;y<s;y+=5){b.strokeStyle=y%10?'#6e66544a':'#ece1c180';b.beginPath();b.moveTo(0,y);b.lineTo(s,y);b.stroke();}for(let i=0;i<180;i++){const x=rnd()*s,y=rnd()*s;b.fillStyle='#4e463020';b.fillRect(x,y,10+rnd()*20,.8);}});
  const linen=new THREE.MeshPhysicalMaterial({color:'#b8a383',map:weave,bumpMap:weave,bumpScale:.017,roughness:1,sheen:.35,sheenColor:new THREE.Color('#bcab8b'),sheenRoughness:1,side:THREE.DoubleSide,envMapIntensity:.12});
  const thatchMap=canvasMap((b,s)=>{b.fillStyle='#ad9464';b.fillRect(0,0,s,s);for(let y=0;y<s;y+=3){b.fillStyle=y%9?'#d7bd8666':'#55462e77';b.fillRect(0,y,s,.8);}for(let x=0;x<s;x+=22){b.fillStyle='#53422c';b.fillRect(x,0,2,s);b.fillStyle='#d7be8a';b.fillRect(x+3,0,2,s);}for(let y=0;y<s;y+=40){b.fillStyle='#5c4a3155';b.fillRect(0,y,s,2);}});
  const ceiling=mat('#a48c68',{map:thatchMap,bumpMap:thatchMap,bumpScale:.032,roughness:1,envMapIntensity:.10});
  return {wood,brown,plaster,floors,linen,ceiling};
}

export function finishHistoricLighting(k,root){
  // Lighting belongs to this room only; the other chapters retain their palette.
  k.ambient.intensity=.30;k.ambient.color.set('#e5e4d9');k.ambient.groundColor.set('#6b5d48');k.sun.intensity=0;k.scene.environmentIntensity=.24;
  k.renderer.toneMappingExposure=1.02;
  const gobo=canvasMap((b,s)=>{b.fillStyle='#f8eed8';b.fillRect(0,0,s,s);b.strokeStyle='#353327';b.lineWidth=20;for(let i=1;i<6;i++){const a=i*s/6;b.beginPath();b.moveTo(a,0);b.lineTo(a,s);b.stroke();b.beginPath();b.moveTo(0,a);b.lineTo(s,a);b.stroke();}b.lineWidth=30;b.strokeRect(10,10,s-20,s-20);},512);
  const daylight=new THREE.SpotLight('#fff0d2',135,23,.78,.45,2);daylight.name='lattice-window-daylight';daylight.position.set(-5.04,3.22,.65);daylight.target.position.set(2.0,.3,-3.8);daylight.map=gobo;daylight.castShadow=true;daylight.shadow.mapSize.set(2048,2048);daylight.shadow.normalBias=.012;daylight.shadow.bias=-.00008;daylight.shadow.camera.near=.15;daylight.shadow.camera.far=23;root.add(daylight,daylight.target);
  const bounce=new THREE.PointLight('#dec69e',9,16,2);bounce.position.set(-1,2.8,2);root.add(bounce);
  const cool=new THREE.PointLight('#cbd8e4',5,12,2);cool.position.set(4.5,2.8,0);root.add(cool);
  const contactMap=canvasMap((b,s)=>{const g=b.createRadialGradient(s/2,s/2,s*.08,s/2,s/2,s*.5);g.addColorStop(0,'rgba(24,18,12,.85)');g.addColorStop(.45,'rgba(24,18,12,.5)');g.addColorStop(1,'rgba(24,18,12,0)');b.fillStyle=g;b.fillRect(0,0,s,s);},256);
  for(const [x,z,w,h] of [[0,-4.5,5.3,1.7],[4.3,-2.2,1.7,3.6],[-4.2,1.5,2.0,3.1],[-4.7,-2.9,1.4,3.1],[3.7,3.3,3.2,3.3]]){
    const shadow=mesh(root,new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:contactMap,transparent:true,opacity:.48,depthWrite:false}),x,.109,z);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;shadow.renderOrder=1;
  }
  // Subtle dust inside the oblique sun shaft adds depth without a solid beam.
  const rnd=seeded(466),positions=[];for(let i=0;i<90;i++){const t=rnd();positions.push(-4.8+t*6.8,(3.2-t*2.8)+(rnd()-.5)*.65,.65-t*4.4+(rnd()-.5)*1.1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const dust=new THREE.Points(geo,new THREE.PointsMaterial({color:'#f1dfb5',size:.012,transparent:true,opacity:.28,depthWrite:false}));root.add(dust);k.updates.push(t=>{dust.position.y=Math.sin(t*.18)*.035;});
}
