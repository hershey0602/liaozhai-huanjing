import * as THREE from 'three';

export {THREE};
const font='KaiTi, STKaiti, "Noto Serif CJK SC", SimSun, serif';
export function seeded(seed=7391){return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);}
export function paperTexture(color='#e4d5b9',wood=false){
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');
  x.fillStyle=color;x.fillRect(0,0,512,512);const rnd=seeded();
  for(let i=0;i<6500;i++){const a=rnd()*512,b=rnd()*512;
    x.fillStyle=i%3?'rgba(255,250,231,.045)':'rgba(67,60,41,.04)';
    x.fillRect(a,b,wood?40+rnd()*160:1+rnd()*3,wood?.4:1+rnd()*2);
  }
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;
}
export function mat(color,options={}){return new THREE.MeshStandardMaterial({color,roughness:.83,...options});}
export function pageMaterial(texture){
  return new THREE.ShaderMaterial({uniforms:{uPage:{value:texture}},side:THREE.DoubleSide,
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform sampler2D uPage;varying vec2 vUv;
      void main(){vec2 uv=vec2(gl_FrontFacing?vUv.x:1.0-vUv.x,vUv.y);
        gl_FragColor=texture2D(uPage,uv);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}
export function group(parent,x=0,y=0,z=0){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;}
export function mesh(parent,geometry,material,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function box(p,w,h,d,m,x=0,y=0,z=0){return mesh(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);}
export function cylinder(p,top,bottom,h,m,x=0,y=0,z=0,segments=16){return mesh(p,new THREE.CylinderGeometry(top,bottom,h,segments),m,x,y,z);}
export function sphere(p,r,m,x=0,y=0,z=0){return mesh(p,new THREE.SphereGeometry(r,16,12),m,x,y,z);}
export function curve(p,points,r,m,taper=1){
  const line=new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v)));
  const geo=new THREE.TubeGeometry(line,Math.max(12,points.length*5),r,7,false);
  if(taper!==1){const a=geo.attributes.position,n=geo.attributes.normal;
    for(let i=0;i<a.count;i++){const t=Math.floor(i/8)/(Math.max(12,points.length*5));const c=line.getPointAt(Math.min(1,t));
      const scale=1+(taper-1)*t;a.setXYZ(i,c.x+(a.getX(i)-c.x)*scale,c.y+(a.getY(i)-c.y)*scale,c.z+(a.getZ(i)-c.z)*scale);}
    a.needsUpdate=true;geo.computeVertexNormals();
  }
  return mesh(p,geo,m);
}
export function calligraphy(text,{size=28,color='#645b49',vertical=true,width=512,height=1024,gap=34}={}){
  const c=document.createElement('canvas');c.width=width;c.height=height;const b=c.getContext('2d');
  b.font=`${size}px ${font}`;b.fillStyle=color;b.textAlign='center';b.textBaseline='middle';
  const chars=[...text];
  if(vertical){const rows=Math.floor((height-40)/gap);for(let i=0;i<chars.length;i++){
    const x=width-32-Math.floor(i/rows)*gap,y=28+(i%rows)*gap;if(x<10)break;b.fillText(chars[i],x,y);}}
  else b.fillText(text,width/2,height/2);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}
export function plaque(p,text,w,h,x,y,z,{color='#69604c',background='#ddceb0',size=64}={}){
  const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const b=c.getContext('2d');
  b.fillStyle=background;b.fillRect(0,0,c.width,c.height);b.strokeStyle=color;b.globalAlpha=.4;b.lineWidth=4;b.strokeRect(12,12,c.width-24,c.height-24);b.globalAlpha=1;
  b.fillStyle=color;b.font=`${size}px ${font}`;b.textAlign='center';b.textBaseline='middle';
  [...text].forEach((ch,i)=>b.fillText(ch,c.width/2+(i-(text.length-1)/2)*size*1.3,c.height/2));
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  return mesh(p,new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}),x,y,z);
}
export function roof(p,w,d,base,rise,material,trim){
  const positions=[],indices=[],uv=[];const nx=32,nz=24;
  const height=(x,z)=>base+rise*(1-Math.pow(Math.abs(z)/(d/2),.78))+.40*Math.pow(Math.abs(x)/(w/2),12)+.20*Math.pow(Math.abs(z)/(d/2),12);
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=(i/nx-.5)*w,z=(j/nz-.5)*d;positions.push(x,height(x,z),z);uv.push(i/nx*6,j/nz*4);
    if(i<nx&&j<nz){const a=j*(nx+1)+i;indices.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
  const top=mesh(p,g,material);top.material.side=THREE.DoubleSide;
  for(let i=0;i<=24;i++){const x=(i/24-.5)*w;const pts=[];for(let j=0;j<=12;j++){const z=(j/12-.5)*d;pts.push([x,height(x,z)+.024,z]);}curve(p,pts,.028,trim);}
  for(const z of [-d/2,d/2]){const pts=[];for(let i=0;i<=16;i++){const x=(i/16-.5)*w;pts.push([x,height(x,z),z]);}curve(p,pts,.10,trim);}
  curve(p,[[-w/2,base+rise+.46,0],[-w*.3,base+rise+.12,0],[0,base+rise+.12,0],[w*.3,base+rise+.12,0],[w/2,base+rise+.46,0]],.12,trim);
}
export function railing(p,x1,z1,x2,z2,y,material){
  const length=Math.hypot(x2-x1,z2-z1),steps=Math.ceil(length/1.1);
  for(let i=0;i<=steps;i++){const t=i/steps,x=x1+(x2-x1)*t,z=z1+(z2-z1)*t;
    cylinder(p,.065,.09,.80,material,x,y+.4,z,8);sphere(p,.11,material,x,y+.84,z);}
  for(const h of [.30,.67])curve(p,[[x1,y+h,z1],[x2,y+h,z2]],.045,material);
}
export function haloTexture(){
  const c=document.createElement('canvas');c.width=c.height=128;const b=c.getContext('2d'),g=b.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,247,210,.9)');g.addColorStop(.18,'rgba(255,230,175,.38)');g.addColorStop(1,'rgba(255,220,155,0)');b.fillStyle=g;b.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);
}
export function glow(p,x,y,z,color='#f8d79c',size=1.5){
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTexture(),color,transparent:true,depthWrite:false,opacity:.5}));s.position.set(x,y,z);s.scale.setScalar(size);p.add(s);return s;
}
export function lantern(p,x,y,z,materials,{blue=false}={}){
  const g=group(p,x,y,z);const jade=materials.jade||materials.wood,trim=materials.gold||materials.wood;
  cylinder(g,.025,.025,.55,trim,0,.35,0,8);
  const body=mesh(g,new THREE.OctahedronGeometry(.28,0),mat(blue?'#d6e8d6':'#ecd3a5',{emissive:blue?'#9bcebb':'#e6b66f',emissiveIntensity:.28,transparent:true,opacity:.83}));body.scale.set(.8,1.25,.8);
  for(const yy of [-.29,.29])cylinder(g,.19,.21,.06,trim,0,yy,0,8);
  curve(g,[[0,-.32,0],[.04,-.61,0],[0,-.73,.02]],.012,trim);
  glow(g,0,0,0,blue?'#d5ead9':'#ffe1a0',1.25);return g;
}
export function makeInkFigure(p,x,y,z,{color='#746a53',opacity=.25}={}){
  const c=document.createElement('canvas');c.width=256;c.height=512;const b=c.getContext('2d');
  b.fillStyle=color;b.beginPath();b.ellipse(128,79,25,34,0,0,Math.PI*2);b.fill();
  b.beginPath();b.moveTo(111,107);b.bezierCurveTo(85,144,83,194,67,261);b.lineTo(95,269);b.lineTo(70,457);b.quadraticCurveTo(129,481,190,455);b.lineTo(156,246);b.lineTo(203,273);b.quadraticCurveTo(196,166,151,111);b.closePath();b.fill();
  b.strokeStyle=color;b.lineWidth=10;b.beginPath();b.moveTo(90,174);b.quadraticCurveTo(136,236,175,207);b.stroke();
  b.fillStyle=color;b.beginPath();b.ellipse(129,48,33,19,0,0,Math.PI*2);b.fill();
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.MeshBasicMaterial({map:t,transparent:true,opacity,side:THREE.DoubleSide,depthWrite:false});
  return mesh(p,new THREE.PlaneGeometry(1.4,2.8),m,x,y+1.4,z);
}

export function createSpace(key,{title,legend,background='#e9e4d5',fogNear=24,fogFar=95}={}){
  document.body.classList.remove('prologue-active','prologue-revealed','arrival','arrival-observe');document.body.dataset.space=key;
  document.querySelector('.brand strong').textContent=title;document.querySelector('.legend').textContent=legend;
  document.querySelector('.hint').textContent='拖动看四周 · 点击方向键漫游 · 循微光走近景物';
  document.getElementById('stage').setAttribute('aria-label',title+'三维文学空间');
  const scene=new THREE.Scene();scene.background=new THREE.Color(background);scene.fog=new THREE.Fog(background,fogNear,fogFar);
  const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.08,180);
  camera.position.set(0,1.75,18);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const canvas=renderer.domElement;document.getElementById('stage').append(canvas);
  const ambient=new THREE.HemisphereLight('#fff4da','#9ca69a',1.8);scene.add(ambient);
  const sun=new THREE.DirectionalLight('#fff1ce',2.1);sun.position.set(-12,25,16);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,far:80});sun.shadow.bias=-.001;scene.add(sun);
  const world=group(scene);const interactive=[],labels=[],updates=[],obstacles=[];
  let floor=()=>.12,bounds={x:24,minZ:-30,maxZ:36},yaw=0,pitch=-.035,locked=false,autowalk=null;
  let time=0,last=performance.now(),startedAt=last,held=null,dragging=false,down=null,dialogue=null;
  const caption=document.createElement('div');caption.className='space-caption';caption.setAttribute('aria-live','polite');document.body.append(caption);let captionUntil=0;
  const skip=document.createElement('button');skip.className='space-skip';skip.hidden=true;document.body.append(skip);
  const transition=document.createElement('div');transition.className='chapter-transition';transition.innerHTML='<small>字归书卷 · 书开新境</small><strong></strong>';document.body.append(transition);
  const panel=document.getElementById('story-panel'),next=document.getElementById('story-next');
  next.onclick=()=>{if(!dialogue)return;if(++dialogue.index>=dialogue.lines.length){const done=dialogue.done;dialogue=null;panel.classList.remove('visible');done?.();}else drawDialogue();};
  function drawDialogue(){const line=dialogue.lines[dialogue.index];document.getElementById('story-title').textContent=line[0];document.getElementById('story-text').textContent=line[1];next.textContent=dialogue.index===dialogue.lines.length-1?(dialogue.last||'继续'):'继续';}
  function say(lines,done,last){dialogue={lines,index:0,done,last};panel.classList.add('visible');drawDialogue();}
  function announce(text,duration=5,small=''){caption.textContent='';if(small){const a=document.createElement('small');a.textContent=small;caption.append(a);}caption.append(document.createTextNode(text));caption.classList.add('visible');captionUntil=time+duration;}
  function go(space){if(transition.classList.contains('visible'))return;locked=true;transition.querySelector('strong').textContent={palace:'玄溟 · 鲛宫',study:'芸庭 · 小榭',ending:'幻散 · 终章',prologue:'书卷 · 启灵',nanshan:'南山 · 花坞'}[space];transition.classList.add('visible');setTimeout(()=>{location.href=`?space=${space}&v=sea-verse-66`;},1200);}
  function look(){camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);}
  function setView(x,z,heading=0,tilt=-.035){camera.position.set(x,floor(x,z)+1.68,z);yaw=heading;pitch=tilt;look();}
  function pointAt(p){yaw=Math.atan2(camera.position.x-p.x,camera.position.z-p.z);pitch=THREE.MathUtils.clamp(Math.atan2(p.y-camera.position.y,Math.hypot(p.x-camera.position.x,p.z-camera.position.z)),-.55,.45);look();}
  function approach(position,action,stop=2.5){
    const d=Math.hypot(position.x-camera.position.x,position.z-camera.position.z);
    if(d<stop+.4){pointAt(position);action?.();return;}
    const dx=(camera.position.x-position.x)/d,dz=(camera.position.z-position.z)/d;
    autowalk={from:camera.position.clone(),to:new THREE.Vector3(position.x+dx*stop,0,position.z+dz*stop),at:time,duration:Math.min(3.4,Math.max(1,d/6)),target:position.clone(),done:action};
  }
  function hotspot(name,position,action,{distance=28,stop=2.4,pinNear=0,enabled=()=>true}={}){
    const button=document.createElement('button');button.className='world-label';button.textContent=name;document.body.append(button);
    const p=new THREE.Vector3(...position);const entry={button,p,distance,pinNear,enabled,action:()=>{const focus=p.clone();focus.y-=.6;approach(focus,action,stop);}};
    button.addEventListener('pointerdown',e=>e.stopPropagation());button.addEventListener('click',entry.action);labels.push(entry);return entry;
  }
  function clickable(object,action){interactive.push(object);object.userData.interact=action;return object;}
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  canvas.addEventListener('pointerdown',e=>{if((locked&&key==='ending')||dialogue||document.querySelector('.letter-modal:not([hidden])'))return;dragging=true;down={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;autowalk=null;yaw-=(e.clientX-down.x)*.0035;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-down.y)*.0032,-1.1,.9);down.x=e.clientX;down.y=e.clientY;look();});
  canvas.addEventListener('pointerup',e=>{if(!down)return;if(Math.hypot(e.clientX-down.startX,e.clientY-down.startY)<8&&!locked){pointer.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(interactive,true);if(hits[0]){let o=hits[0].object;while(o&&!o.userData.interact)o=o.parent;o?.userData.interact?.();}}dragging=false;down=null;});
  canvas.addEventListener('pointercancel',()=>{dragging=false;down=null;});
  const controls=document.querySelectorAll('[data-direction]');
  for(const b of controls){b.addEventListener('pointerdown',e=>{e.preventDefault();if(locked||dialogue)return;autowalk=null;held=b.dataset.direction;move(.135);b.setPointerCapture(e.pointerId);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>{held=null;});}
  const keymap={ArrowUp:'forward',ArrowDown:'back',ArrowLeft:'left',ArrowRight:'right'};
  window.addEventListener('keydown',e=>{if(keymap[e.key]&&!locked&&!dialogue){e.preventDefault();held=keymap[e.key];autowalk=null;}});
  window.addEventListener('keyup',e=>{if(keymap[e.key])held=null;});window.addEventListener('blur',()=>{held=null;});
  function move(dt){
    const directions={forward:[-Math.sin(yaw),-Math.cos(yaw)],back:[Math.sin(yaw),Math.cos(yaw)],left:[-Math.cos(yaw),Math.sin(yaw)],right:[Math.cos(yaw),-Math.sin(yaw)]};
    const [dx,dz]=directions[held],speed=3.3;const x=THREE.MathUtils.clamp(camera.position.x+dx*speed*dt,-bounds.x,bounds.x),z=THREE.MathUtils.clamp(camera.position.z+dz*speed*dt,bounds.minZ,bounds.maxZ);
    if(!obstacles.some(o=>x>o.x-o.w/2-.22&&x<o.x+o.w/2+.22&&z>o.z-o.d/2-.22&&z<o.z+o.d/2+.22)){camera.position.x=x;camera.position.z=z;}camera.position.y=floor(camera.position.x,camera.position.z)+1.68;
  }
  const projected=new THREE.Vector3();
  function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;time=(now-startedAt)/1000;
    if(held&&!locked&&!dialogue)move(dt);
    if(autowalk&&!locked){const t=THREE.MathUtils.smoothstep((time-autowalk.at)/autowalk.duration,0,1);camera.position.lerpVectors(autowalk.from,autowalk.to,t);camera.position.y=floor(camera.position.x,camera.position.z)+1.68;pointAt(autowalk.target);if(t>=1){const done=autowalk.done;autowalk=null;done?.();}}
    for(const f of updates)f(time,dt);
    camera.updateMatrixWorld();
    for(const a of labels){projected.copy(a.p).project(camera);const d=camera.position.distanceTo(a.p),pin=d<a.pinNear;a.button.hidden=locked||!!dialogue||!a.enabled()||d>a.distance||projected.z<0||projected.z>1||(!pin&&(Math.abs(projected.x)>.91||Math.abs(projected.y)>.85));if(!a.button.hidden){const x=pin?THREE.MathUtils.clamp(projected.x,-.8,.8):projected.x,y=pin?THREE.MathUtils.clamp(projected.y,-.72,.65):projected.y;a.button.style.left=`${(x*.5+.5)*innerWidth}px`;a.button.style.top=`${(.5-y*.5)*innerHeight}px`;a.button.style.opacity=Math.min(1,(a.distance-d)/4);}}
    if(time>captionUntil)caption.classList.remove('visible');renderer.render(scene,camera);
  }
  window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
  let audio;
  function chime(notes=[660,880,1100]){try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();notes.forEach((hz,i)=>{const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=hz;osc.connect(gain);gain.connect(audio.destination);const t=audio.currentTime+i*.075;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.025,t+.015);gain.gain.exponentialRampToValueAtTime(.0001,t+1.6);osc.start(t);osc.stop(t+1.7);});}catch{}}
  return {scene,world,camera,renderer,ambient,sun,updates,obstacles,hotspot,clickable,announce,say,go,setView,pointAt,approach,chime,skip,
    setFloor(fn){floor=fn;},setBounds(b){bounds=b;},set locked(v){locked=v;held=null;},get locked(){return locked;},get time(){return time;},get dialogue(){return !!dialogue;},
    start(){startedAt=last=performance.now();requestAnimationFrame(frame);},setCamera(x,y,z){camera.position.set(x,y,z);look();}};
}
