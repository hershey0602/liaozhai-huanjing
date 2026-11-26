import {THREE} from './space-kit.js?build=tree-guide-74';

export function turnProgress(seconds){
  const t=THREE.MathUtils.clamp((seconds-.18)/1.32,0,1);
  return t*t*t*(t*(t*6-15)+10);
}

export function endingPaperMaterial(texture){
  const material=new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:true,
    uniforms:{uPage:{value:texture},uOpacity:{value:1}},
    vertexShader:`varying vec2 vUv;varying vec3 vPaperNormal;void main(){vUv=uv;vPaperNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform sampler2D uPage;uniform float uOpacity;varying vec2 vUv;varying vec3 vPaperNormal;
      void main(){vec2 uv=vec2(gl_FrontFacing?vUv.x:1.-vUv.x,vUv.y);vec4 paper=texture2D(uPage,uv);
        vec3 n=normalize(vPaperNormal)*(gl_FrontFacing?1.:-1.);
        float light=.70+.30*abs(dot(n,normalize(vec3(-.45,.55,1.))));
        float gutter=1.-.20*exp(-vUv.x*26.);float back=gl_FrontFacing?1.:.94;
        // Curved-paper shading remains readable in the dim ending scene.
        gl_FragColor=vec4(paper.rgb*light*gutter*back,paper.a*uOpacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
  return material;
}

export function flexibleLeaf(material){
  const width=1.54,height=2.04,nx=64,ny=24,positions=[],uv=[],indices=[];
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
    positions.push(i/nx*width,(j/ny-.5)*height,0);uv.push(i/nx,j/ny);
    if(i<nx&&j<ny){const a=j*(nx+1)+i;indices.push(a,a+1,a+nx+1,a+1,a+nx+2,a+nx+1);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  const page=new THREE.Mesh(geometry,material);page.name='ending-flexible-paper';page.frustumCulled=false;
  page.userData.grid={nx,ny,width,height};
  page.userData.bend=progress=>{
    const p=THREE.MathUtils.clamp(progress,0,1),wave=Math.sin(Math.PI*p),a=geometry.attributes.position,ds=width/nx;
    for(let j=0;j<=ny;j++){
      const v=j/ny;let x=0,z=0;
      // Integrate a changing tangent along the sheet, preserving its arc length.
      // The far corner leads; the centre follows; the sewn edge stays fixed.
      const angle=u=>Math.PI*p+wave*(1.18*(1-.60*p)*Math.pow(u,.8)+.25*(v-.5)*u);
      a.setXYZ(j*(nx+1),0,(v-.5)*height,0);
      for(let i=1;i<=nx;i++){
        const u=i/nx,theta=angle((i-.5)/nx);x+=Math.cos(theta)*ds;z+=Math.sin(theta)*ds;
        const edgeLift=.018*wave*Math.sin(v*Math.PI*1.5)*u*u;
        a.setXYZ(j*(nx+1)+i,x,(v-.5)*height+edgeLift,z);
      }
    }
    a.needsUpdate=true;geometry.computeVertexNormals();
  };
  page.userData.bend(0);return page;
}
