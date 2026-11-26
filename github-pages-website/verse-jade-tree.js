import {THREE,group,seeded,mesh} from './space-kit.js?build=fluid-book-72';
export function verseJadeTree(k){
  const root=group(k.world,12,.18,8);root.name='verse-jade-tree';const rnd=seeded(813),points=[],colors=[],glyphs=[],sizes=[];
  const words=[...new Set([...'宫中有玉树一株围可合抱本莹澈如白琉璃中有心淡黄色叶类碧玉厚一钱许细碎有浓阴常与女啸咏其下花开满树状类薝葡每一瓣落锵然作响光明可爱'])];
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const ctx=canvas.getContext('2d');ctx.font='94px KaiTi,STKaiti,serif';ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.textBaseline='middle';
  words.forEach((ch,i)=>ctx.fillText(ch,(i%8)*128+64,Math.floor(i/8)*128+64));
  const atlas=new THREE.CanvasTexture(canvas);atlas.minFilter=THREE.LinearMipmapLinearFilter;atlas.magFilter=THREE.LinearFilter;
  function put(p,size,color,index){points.push(p.x,p.y,p.z);const c=new THREE.Color(color);colors.push(c.r,c.g,c.b);sizes.push(size);glyphs.push(index%words.length);}
  function branch(path,radius,index){const line=new THREE.CatmullRomCurve3(path.map(p=>new THREE.Vector3(...p)));const n=Math.ceil(line.getLength()/.045),up=new THREE.Vector3(0,1,0);
    for(let j=0;j<=n;j++){const t=j/n,p=line.getPoint(t),tangent=line.getTangent(t),side=new THREE.Vector3().crossVectors(tangent,up).normalize();if(side.length()<.1)side.set(1,0,0);const other=new THREE.Vector3().crossVectors(tangent,side).normalize(),r=radius*Math.pow(1-t,.66)+.012;
      const ring=Math.max(6,Math.ceil(r*150));for(let i=0;i<ring;i++){const a=(i/ring)*Math.PI*2+.04*Math.sin(j);put(p.clone().addScaledVector(side,Math.cos(a)*r).addScaledVector(other,Math.sin(a)*r),.075,rnd()>.5?'#798c81':'#667e73',j+i+index);}}
  }
  branch([[0,-.10,0],[-.23,1.1,.05],[-.12,2.15,.12],[.36,3.1,0],[.20,4.1,-.12],[.44,5.15,-.10]],.34,0);
  for(let b=0;b<10;b++){const a=b*2.39996,len=1.5+rnd()*.65,y=2.3+b*.16,x=Math.cos(a)*len,z=Math.sin(a)*len;
    branch([[.0,y-.5,0],[x*.25,y+.2,z*.25],[x*.65,y+.66,z*.65],[x,y+1.30,z]],.13,b*7);
    for(const s of [-1,1])branch([[x*.55,y+.58,z*.55],[x*.82+s*.22,y+1.0,z*.8],[x+s*.30,y+1.58,z+.18*s]],.055,b*9);
  }
  // Full, overlapping crown volumes fill the spaces between curved branches.
  for(let i=0;i<31000;i++){const a=rnd()*Math.PI*2,u=rnd()*2-1,r=Math.cbrt(rnd()),w=Math.sqrt(1-u*u);const x=Math.cos(a)*w*r*2.45,z=Math.sin(a)*w*r*2.05,y=4.65+u*r*1.52;
    const blossom=rnd()<.15;put(new THREE.Vector3(x+.18,y,z),blossom?.073:.065,blossom?(rnd()<.6?'#c1978b':'#e2b99d'):(rnd()<.5?'#799e89':'#507c6c'),i);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geo.setAttribute('aColor',new THREE.Float32BufferAttribute(colors,3));geo.setAttribute('aGlyph',new THREE.Float32BufferAttribute(glyphs,1));geo.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));
  const material=new THREE.ShaderMaterial({uniforms:{uAtlas:{value:atlas},uPixels:{value:700},uTime:{value:0}},transparent:true,depthWrite:true,
    vertexShader:`attribute vec3 aColor;attribute float aGlyph,aSize;uniform float uPixels,uTime;varying vec3 vColor;varying float vGlyph;void main(){vec3 p=position;if(p.y>3.)p.x+=sin(uTime*.55+p.y*.9+p.z)*.025*(p.y-3.);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*uPixels/max(.5,-mv.z),1.,100.);vColor=aColor;vGlyph=aGlyph;}`,
    fragmentShader:`uniform sampler2D uAtlas;varying vec3 vColor;varying float vGlyph;void main(){vec2 tile=vec2(mod(vGlyph,8.),7.-floor(vGlyph/8.));vec2 uv=(tile+vec2(gl_PointCoord.x,1.-gl_PointCoord.y))/8.;float a=texture2D(uAtlas,uv).a;if(a<.18)discard;gl_FragColor=vec4(vColor,a*.88);
      #include <colorspace_fragment>
    }`});
  const ink=new THREE.Points(geo,material);ink.name='jade-tree-original-prose';root.add(ink);
  const shape=new THREE.Shape();shape.moveTo(0,-.10);shape.bezierCurveTo(-.12,-.03,-.10,.12,0,.16);shape.bezierCurveTo(.12,.11,.12,-.03,0,-.10);
  const falling=[];for(let i=0;i<7;i++){const p=mesh(root,new THREE.ShapeGeometry(shape,12),new THREE.MeshBasicMaterial({color:'#dbac9e',side:THREE.DoubleSide}));falling.push(p);}
  k.updates.push(t=>{material.uniforms.uTime.value=t;material.uniforms.uPixels.value=(k.renderer.domElement?.height||800)*.85;});
  return{tree:root,falling};
}
