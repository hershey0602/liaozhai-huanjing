import {THREE,group,mesh,curve,mat,glow} from './space-kit.js?build=sea-verse-66';

// A narrow three-dimensional flame, rooted in a wick. Height-dependent bending
// moves the tip more than the base; no camera-facing oval sprite is used.
export function livingFlame(parent,{height=.24,seed=0,power=3.2}={}){
  const root=group(parent);root.name='wick-rooted-living-flame';
  curve(root,[[0,-.03,0],[.006,-.005,.001],[.003,.017,0]],.007,mat('#30271e'),.65);
  const layers=[];
  for(let layer=0;layer<2;layer++){
    const h=height*(layer?.68:1),rad=height*(layer?.15:.205),pos=[],uv=[],idx=[],rows=28,sides=20;
    for(let j=0;j<=rows;j++){const v=j/rows,r=rad*Math.pow(Math.sin(Math.PI*v),.65)*Math.pow(1-v,.60);for(let i=0;i<=sides;i++){const a=i/sides*Math.PI*2;pos.push(Math.cos(a)*r,v*h,Math.sin(a)*r);uv.push(i/sides,v);if(i<sides&&j<rows){const n=j*(sides+1)+i;idx.push(n,n+sides+1,n+1,n+1,n+sides+1,n+sides+2);}}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.FrontSide,blending:THREE.AdditiveBlending,
      uniforms:{uTime:{value:0},uSeed:{value:seed},uHeight:{value:h},uInner:{value:layer},uOpacity:{value:1}},
      vertexShader:`uniform float uTime,uSeed,uHeight;varying float vHeight;varying vec3 vNormal,vEye;
        void main(){vec3 p=position;float v=uv.y;vHeight=v;float phase=uTime+uSeed;
          p.x+=uHeight*(.075*sin(phase*3.7-v*3.)+.035*sin(phase*7.9+v*6.))*v*v;
          p.z+=uHeight*.044*sin(phase*4.8+v*4.)*v*v;
          p.y*=1.+.055*sin(phase*6.2)+.025*sin(phase*10.7);
          vec4 mv=modelViewMatrix*vec4(p,1.);vNormal=normalize(normalMatrix*normal);vEye=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
      fragmentShader:`uniform float uInner,uOpacity;varying float vHeight;varying vec3 vNormal,vEye;
        void main(){float face=pow(abs(dot(normalize(vNormal),normalize(vEye))),.5);
          vec3 orange=vec3(1.,.20,.018),amber=vec3(1.,.62,.13),cream=vec3(1.,.91,.62);
          vec3 col=mix(orange,amber,smoothstep(.05,.30,vHeight));col=mix(col,orange,smoothstep(.65,1.,vHeight));
          col=mix(col,cream,uInner*.87);col=mix(vec3(.16,.28,.84),col,smoothstep(.0,.13,vHeight));
          float alpha=(.22+uInner*.42)*face*smoothstep(0.,.07,vHeight)*(1.-smoothstep(.84,1.,vHeight))*uOpacity;
          gl_FragColor=vec4(col,alpha);
          #include <colorspace_fragment>
        }`});
    const flame=mesh(root,geo,material);flame.castShadow=flame.receiveShadow=false;flame.renderOrder=7+layer;flame.name=layer?'cream-flame-core':'tapered-amber-flame';
    flame.onBeforeRender=()=>{material.uniforms.uOpacity.value=material.opacity;};layers.push(flame);
  }
  const halo=glow(root,0,height*.45,0,'#ffc576',height*2.1);halo.material.opacity=.13;
  const light=new THREE.PointLight('#ffd098',power,9,1.8);light.position.y=height*.65;root.add(light);
  function update(t){for(const l of layers)l.material.uniforms.uTime.value=t;
    const f=Math.sin(t*5.6+seed)*.045+Math.sin(t*11.3+seed*2)*.024+Math.sin(t*2.4+seed)*.035;
    light.intensity=power*(1+f);halo.material.opacity=.13+f*.23;}
  update(0);return{root,layers,halo,light,update};
}
