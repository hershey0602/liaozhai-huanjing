import {THREE,group,mesh,box,cylinder,sphere,curve,mat,pageMaterial,seeded} from './space-kit.js?build=hold-walk-76';
import {enrichThrone} from './royal-fittings.js?build=hold-walk-76';

export function waveHeight(x,z,t){return .055*Math.sin(x*.65+z*.42-t*.68)+.031*Math.sin(x*1.22-z*.77-t*.91)+.017*Math.sin(x*2.1+z*1.55-t*.54);}
export function livingSea(ink,{repeats=[12,6],strength=.86,opacity=1}={}){return new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uInk:{value:ink},uRepeat:{value:new THREE.Vector2(...repeats)},uInkStrength:{value:strength},uOpacity:{value:opacity}},side:THREE.DoubleSide,transparent:opacity<1,depthWrite:opacity===1,
  vertexShader:`uniform float uTime;varying vec2 vUv;varying vec3 vWorld;varying vec3 vNormal;
    void main(){vUv=uv;vec3 p=position;float a=p.x*.65+p.y*.42-uTime*.68;
      float b=p.x*1.22-p.y*.77-uTime*.91;float c=p.x*2.1+p.y*1.55-uTime*.54;
      p.z=.055*sin(a)+.031*sin(b)+.017*sin(c);
      float dx=.055*.65*cos(a)+.031*1.22*cos(b)+.017*2.1*cos(c);
      float dy=.055*.42*cos(a)-.031*.77*cos(b)+.017*1.55*cos(c);
      vNormal=normalize(mat3(modelMatrix)*vec3(-dx,-dy,1.));
      vWorld=(modelMatrix*vec4(p,1.)).xyz;
      gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`,
  fragmentShader:`uniform float uTime,uInkStrength,uOpacity;uniform vec2 uRepeat;uniform sampler2D uInk;varying vec2 vUv;varying vec3 vWorld;varying vec3 vNormal;
    void main(){vec3 n=normalize(vNormal)*(gl_FrontFacing?1.:-1.);vec3 eye=normalize(cameraPosition-vWorld);float fresnel=pow(1.-max(dot(n,eye),0.),3.);
      float spec=pow(max(dot(reflect(-normalize(vec3(-.45,.85,.3)),n),eye),0.),64.);
      float swell=sin(vWorld.x*.65-vWorld.z*.42-uTime*.68);
      float crest=pow(max(0.,sin(vWorld.x*1.8+vWorld.z*1.1-uTime*.44+sin(vWorld.z*.6))),24.);
      vec2 uv=vUv*uRepeat+vec2(n.x*.006,-uTime*.001+n.z*.004);
      float letters=texture2D(uInk,uv).a;
      vec3 water=mix(vec3(.54,.72,.75),vec3(.87,.92,.88),fresnel*.8+.18);
      water+=vec3(.12,.14,.12)*crest+vec3(.35,.31,.20)*spec;
      water=mix(water,vec3(.12,.29,.32),letters*uInkStrength);
      gl_FragColor=vec4(water,uOpacity);
      #include <colorspace_fragment>
    }`,
});}

function rounded(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
export function dragonThrone(parent,m){
  const g=group(parent,0,.91,-18);g.name='sculpted-dragon-throne';
  const gold=m.gold,jade=m.jade,deep=m.dark;
  for(let i=0;i<3;i++){const step=mesh(g,new THREE.ExtrudeGeometry(rounded(5.7-i*.6,3.5-i*.4,.36),{depth:.17,bevelEnabled:true,bevelSize:.04,bevelThickness:.025,bevelSegments:3,steps:1}),jade,0,i*.17,0);step.rotation.x=-Math.PI/2;}
  const shape=new THREE.Shape();shape.moveTo(-1.4,1.25);shape.bezierCurveTo(-1.65,1.9,-1.65,2.6,-1.33,3.15);shape.bezierCurveTo(-1.75,3.5,-1.55,3.9,-1.13,3.72);shape.bezierCurveTo(-.65,3.52,-.55,4.28,0,4.30);shape.bezierCurveTo(.55,4.28,.65,3.52,1.13,3.72);shape.bezierCurveTo(1.55,3.9,1.75,3.5,1.33,3.15);shape.bezierCurveTo(1.65,2.6,1.65,1.9,1.4,1.25);shape.quadraticCurveTo(0,1.04,-1.4,1.25);
  const shell=new THREE.ExtrudeGeometry(shape,{depth:.11,bevelEnabled:true,bevelThickness:.045,bevelSize:.055,bevelSegments:4,curveSegments:20,steps:1});mesh(g,shell,gold,0,0,-.93);
  const inset=mesh(g,shell,deep,0,.16,-.77);inset.scale.set(.89,.92,.34);
  const rim=shape.getPoints(140).map(p=>[p.x,p.y,-.73]);curve(g,rim,.034,gold);
  const seat=mesh(g,new THREE.ExtrudeGeometry(rounded(3.3,1.8,.30),{depth:.18,bevelEnabled:true,bevelSize:.045,bevelThickness:.03,bevelSegments:4}),gold,0,1.02,-.04);seat.rotation.x=-Math.PI/2;
  const cushion=sphere(g,1,mat('#527b76',{roughness:.86}),0,1.25,-.04);cushion.scale.set(1.43,.13,.70);
  for(const side of [-1,1]){
    for(const z of [-.65,.65])curve(g,[[side*1.25,1.04,z],[side*1.40,.85,z],[side*1.26,.60,z],[side*1.48,.53,z],[side*1.56,.57,z+.08]],.085,gold,.75);
    const arm=[];for(let i=0;i<=30;i++){const p=i/30;arm.push([side*(1.48+.08*Math.sin(p*6.28)),1.54+.10*Math.sin(p*5),-.75+p*1.55]);}curve(g,arm,.115,gold,.85);
    for(let i=0;i<18;i++){const z=-.69+i*.079;sphere(g,.03,m.white,side*1.48,1.65,z);}
    const head=group(g,side*1.48,1.61,.84);const skull=sphere(head,.18,gold);skull.scale.set(.85,1,1.25);const nose=sphere(head,.12,gold,0,-.025,.2);nose.scale.set(.9,.6,1.6);
    for(const s of [-1,1]){sphere(head,.022,deep,s*.13,.05,.10);curve(head,[[s*.10,.10,-.05],[s*.16,.37,-.14],[s*.26,.43,-.10]],.022,gold,.25);curve(head,[[s*.07,0,.24],[s*.22,-.05,.36],[s*.36,.08,.39]],.012,gold,.2);}
  }
  const disc=cylinder(g,.64,.64,.06,jade,0,2.65,-.65,48);disc.rotation.x=Math.PI/2;
  const border=mesh(g,new THREE.TorusGeometry(.67,.035,8,64),gold,0,2.65,-.6);
  const coil=[];for(let i=0;i<=60;i++){const a=i/60*Math.PI*3,r=.51-i/60*.28;coil.push([Math.cos(a)*r,2.65+Math.sin(a)*r,-.53]);}curve(g,coil,.045,gold,.5);
  for(let i=0;i<24;i++){const a=i*Math.PI/12;sphere(g,.025,gold,Math.cos(a)*.67,2.65+Math.sin(a)*.67,-.56);}
  for(const side of [-1,1])for(let i=0;i<3;i++){const y=1.65+i*.6;curve(g,[[side*.87,y,-.57],[side*1.15,y+.16,-.57],[side*1.02,y+.35,-.57]],.023,gold);}
  enrichThrone(g,m);return g;
}

export function paperBook(parent){
  const root=group(parent,.15,1.015,-.10);root.name='flexible-thread-bound-book';
  const rnd=seeded(603),canvas=document.createElement('canvas');canvas.width=512;canvas.height=704;const b=canvas.getContext('2d');
  b.fillStyle='#eee3c9';b.fillRect(0,0,512,704);for(let i=0;i<5000;i++){b.fillStyle=i%3?'rgba(255,255,235,.18)':'rgba(124,94,51,.06)';b.fillRect(rnd()*512,rnd()*704,.5+rnd(),.5+rnd());}
  const gutter=b.createLinearGradient(0,0,90,0);gutter.addColorStop(0,'rgba(107,80,40,.25)');gutter.addColorStop(1,'rgba(107,80,40,0)');b.fillStyle=gutter;b.fillRect(0,0,90,704);
  b.strokeStyle='#9b8b6777';b.lineWidth=1.2;b.strokeRect(29,30,450,644);b.font='29px KaiTi,STKaiti,serif';b.textAlign='center';b.textBaseline='middle';b.fillStyle='#625039';
  const words=[...'生往除厅事薄暮置书其中静息以伺其变见二女自房中出相视而笑生以手按卷读二女微笑析薪溲米为生执爨生乐之习以为常'];words.forEach((c,i)=>{if(i<72)b.fillText(c,447-Math.floor(i/12)*69,73+i%12*48);});
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
  const paper=new THREE.ShaderMaterial({uniforms:{uPage:{value:tex}},side:THREE.DoubleSide,
    vertexShader:`varying vec2 vUv;varying vec3 vPaperNormal;void main(){vUv=uv;vPaperNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform sampler2D uPage;varying vec2 vUv;varying vec3 vPaperNormal;
      void main(){vec2 uv=vec2(gl_FrontFacing?vUv.x:1.-vUv.x,vUv.y);vec4 paper=texture2D(uPage,uv);
        float shade=.77+.23*abs(dot(normalize(vPaperNormal),normalize(vec3(-.3,.8,1.2))));gl_FragColor=vec4(paper.rgb*shade,paper.a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
  const coverMat=mat('#a6a48b',{roughness:.97,side:THREE.DoubleSide});
  const back=mesh(root,new THREE.PlaneGeometry(.90,.83),coverMat,0,-.005,0);back.rotation.x=-Math.PI/2;
  const cover=group(root,-.44,.052,0);const cv=mesh(cover,new THREE.PlaneGeometry(.90,.83,18,2),coverMat,.45,0,0);cv.rotation.x=-Math.PI/2;
  const labelCanvas=document.createElement('canvas');labelCanvas.width=128;labelCanvas.height=320;const lb=labelCanvas.getContext('2d');lb.fillStyle='#e3d6b7';lb.fillRect(0,0,128,320);lb.fillStyle='#564a37';lb.font='55px KaiTi,serif';lb.fillText('小',37,108);lb.fillText('谢',37,187);
  const lt=new THREE.CanvasTexture(labelCanvas);lt.colorSpace=THREE.SRGBColorSpace;const label=mesh(cover,new THREE.PlaneGeometry(.16,.34),new THREE.MeshBasicMaterial({map:lt}),.71,.004,-.12);label.rotation.x=-Math.PI/2;
  const sheets=[];const nx=40,nz=12;
  function sheet(index,moving){const v=[],uv=[],idx=[];for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const u=i/nx,z=j/nz;v.push(-.44+u*.87,.006+index*.003,(z-.5)*.79);uv.push(u,1-z);if(i<nx&&j<nz){const a=j*(nx+1)+i;idx.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();const page=mesh(root,geo,paper);page.userData.paperLeaf=true;sheets.push({page,index,moving});}
  for(let i=0;i<9;i++)sheet(i,i>=4);
  const thread=mat('#c7b18b',{roughness:1});for(let i=0;i<4;i++){const z=-.28+i*.18;curve(cover,[[.04,.005,z-.05],[.09,.014,z],[.04,.005,z+.05]],.004,thread);}
  function update(progress,time){const opened=THREE.MathUtils.smoothstep(progress,0,.32);cover.rotation.z=Math.PI*.998*opened;cover.position.y=.026-.037*opened;
    for(const {page,index,moving} of sheets){const p=moving?THREE.MathUtils.smoothstep(progress,.20+(8-index)*.065,.57+(8-index)*.065):0;
      const a=page.geometry.attributes.position;for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const u=i/nx,v=j/nz,k=j*(nx+1)+i;
        const bend=Math.sin(Math.PI*p)*(.70*Math.sin(u*Math.PI*.8)+.13*Math.sin(v*6.28+index));
        const angle=p*Math.PI+bend;const edge=(i===nx?.002*Math.sin(v*35+index):0);
        const x=-.44+(.87*u+edge)*Math.cos(angle),y=.002+index*.0012+.87*u*Math.sin(angle)+.004*Math.sin(u*Math.PI)+.003*Math.sin(v*Math.PI)*Math.sin(u*Math.PI)+progress*.002*Math.sin(time*.7+v*4+index);
        a.setXYZ(k,x,y,(v-.5)*.79+.003*Math.sin(u*5+index)*Math.sin(v*Math.PI));}
      a.needsUpdate=true;page.geometry.computeVertexNormals();}
  }
  update(0,0);return{root,cover,update};
}
