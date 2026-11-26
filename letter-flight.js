import * as THREE from 'three';

// One draw call, with the same 128px brush glyphs and all original letters.
export function letterFlight(world,quote,makeGlyphTexture){
  const chars=[...new Set(quote)],grid=Math.ceil(Math.sqrt(chars.length));
  const canvas=document.createElement('canvas');canvas.width=canvas.height=grid*128;
  const ctx=canvas.getContext('2d');
  chars.forEach((c,i)=>{const t=makeGlyphTexture(c);ctx.drawImage(t.image,i%grid*128,Math.floor(i/grid)*128);t.dispose();});
  const atlas=new THREE.CanvasTexture(canvas);atlas.colorSpace=THREE.SRGBColorSpace;
  const count=quote.length,positions=new Float32Array(count*3),colors=new Float32Array(count*3),sizes=new Float32Array(count),alphas=new Float32Array(count),cells=new Float32Array(count*2);
  quote.forEach((c,i)=>{const n=chars.indexOf(c);cells[i*2]=n%grid;cells[i*2+1]=grid-1-Math.floor(n/grid);});
  const geometry=new THREE.BufferGeometry();
  for(const [name,array,width] of [['position',positions,3],['color',colors,3],['aSize',sizes,1],['aAlpha',alphas,1],['aCell',cells,2]])geometry.setAttribute(name,new THREE.BufferAttribute(array,width));
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uMap:{value:atlas},uGrid:{value:grid},uProjection:{value:1}},
    vertexShader:'attribute float aSize;attribute float aAlpha;attribute vec2 aCell;varying vec3 vColor;varying float vAlpha;varying vec2 vCell;uniform float uProjection;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=aSize*uProjection/max(.01,-p.z);vColor=color;vAlpha=aAlpha;vCell=aCell;}',
    fragmentShader:'uniform sampler2D uMap;uniform float uGrid;varying vec3 vColor;varying float vAlpha;varying vec2 vCell;void main(){vec2 uv=(vCell+vec2(gl_PointCoord.x,1.-gl_PointCoord.y))/uGrid;float a=texture2D(uMap,uv).a*vAlpha;if(a<.005)discard;gl_FragColor=vec4(vColor,a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',vertexColors:true});
  const points=new THREE.Points(geometry,material);points.name='batched-opening-verse';points.frustumCulled=false;world.add(points);
  const letters=quote.map(()=>{const o=new THREE.Object3D();o.material={color:new THREE.Color('#bda782'),opacity:0};return o;});
  return{letters,update(renderer,camera,visible){points.visible=visible;if(!visible)return;
    material.uniforms.uProjection.value=renderer.domElement.height/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));
    letters.forEach((o,i)=>{o.position.toArray(positions,i*3);o.material.color.toArray(colors,i*3);sizes[i]=o.scale.x;alphas[i]=o.material.opacity;});
    for(const name of ['position','color','aSize','aAlpha'])geometry.attributes[name].needsUpdate=true;
  }};
}
