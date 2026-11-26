import * as THREE from 'three';

function signature(g){
  let h=2166136261;const shape=[];
  for(const [name,a] of [...Object.entries(g.attributes),['index',g.index]]){
    if(!a)continue;if(a.isInterleavedBufferAttribute)return null;
    shape.push(name,a.itemSize,a.count,a.normalized);
    const bytes=new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength);
    for(let i=0;i<bytes.length;i++)h=Math.imul(h^bytes[i],16777619);
  }return shape.join(':')+':'+(h>>>0);
}
function equalGeometry(a,b){
  for(const key of [...Object.keys(a.attributes),'index']){
    const x=key==='index'?a.index:a.attributes[key],y=key==='index'?b.index:b.attributes[key];
    if(!x||!y){if(x!==y)return false;continue;}
    if(x.array.length!==y.array.length)return false;
    for(let i=0;i<x.array.length;i++)if(x.array[i]!==y.array[i])return false;
  }return true;
}
// Originals stay in the graph and on the picking layer. Rendering mirrors their
// current world matrices and inherited visibility; animations remain authoritative.
export function batchRepeatedMeshes(scene){
  const groups=new Map(),cache=new WeakMap();scene.updateMatrixWorld(true);
  scene.traverse(o=>{
    if(!o.isMesh||o.isSkinnedMesh||o.isInstancedMesh||o.morphTargetInfluences||Array.isArray(o.material)||o.material.transparent||o.material.isShaderMaterial||!['BoxGeometry','CylinderGeometry','SphereGeometry','TorusGeometry','ConeGeometry'].includes(o.geometry.type)||o.geometry.drawRange.count!==Infinity||o.layers.mask!==1)return;
    if(o.matrixWorld.determinant()<0)return;
    let hash=cache.get(o.geometry);if(hash===undefined){hash=signature(o.geometry);cache.set(o.geometry,hash);}if(!hash)return;
    const key=hash+':'+o.material.uuid+':'+o.castShadow+':'+o.receiveShadow+':'+o.renderOrder;
    if(!groups.has(key))groups.set(key,[]);const variants=groups.get(key);
    let group=variants.find(g=>equalGeometry(g[0].geometry,o.geometry));if(!group)variants.push(group=[]);group.push(o);
  });
  const batches=[],inverse=new THREE.Matrix4(),matrix=new THREE.Matrix4(),zero=new THREE.Matrix4().makeScale(0,0,0);
  let sources=0;
  for(const variants of groups.values())for(const originals of variants){
    if(originals.length<3)continue;const first=originals[0],batch=new THREE.InstancedMesh(first.geometry,first.material,originals.length);
    batch.name='mirrored-repeated-architecture';batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;batch.renderOrder=first.renderOrder;batch.frustumCulled=false;
    scene.add(batch);for(const original of originals)original.layers.set(1);
    batches.push({batch,originals,previous:new Float32Array(originals.length*16).fill(NaN)});sources+=originals.length;
  }
  function update(){
    inverse.copy(scene.matrixWorld).invert();
    for(const {batch,originals,previous} of batches){let dirty=false;
      originals.forEach((o,i)=>{let visible=true;for(let p=o;p;p=p.parent)if(!p.visible){visible=false;break;}
        if(visible)matrix.multiplyMatrices(inverse,o.matrixWorld);else matrix.copy(zero);
        let changed=false;for(let j=0;j<16;j++){const v=Math.fround(matrix.elements[j]);if(previous[i*16+j]!==v){changed=true;previous[i*16+j]=v;}}
        if(changed){batch.setMatrixAt(i,matrix);dirty=true;}
      });if(dirty)batch.instanceMatrix.needsUpdate=true;
    }
  }
  update();return{update,sources,batches:batches.length};
}
