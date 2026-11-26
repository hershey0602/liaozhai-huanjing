import * as THREE from 'three';
export function batchStaticInk(scene,entries){
  if(!entries.length)return null;
  const chars=[...new Set(entries.map(e=>e.char))],grid=Math.ceil(Math.sqrt(chars.length)),canvas=document.createElement('canvas');
  canvas.width=canvas.height=grid*128;const ctx=canvas.getContext('2d');
  chars.forEach((c,i)=>ctx.drawImage(entries.find(e=>e.char===c).points.material.uniforms.uMap.value.image,i%grid*128,Math.floor(i/grid)*128));
  const atlas=new THREE.CanvasTexture(canvas);atlas.colorSpace=THREE.SRGBColorSpace;
  const material=entries[0].points.material.clone();material.uniforms.uMap.value=atlas;material.uniforms.uGrid={value:grid};
  material.vertexShader='attribute vec2 aCell;varying vec2 vCell;\n'+material.vertexShader.replace('void main() {','void main() {vCell=aCell;');
  material.fragmentShader='uniform float uGrid;varying vec2 vCell;\n'+material.fragmentShader.replace('texture2D(uMap, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y))','texture2D(uMap, (vCell+vec2(gl_PointCoord.x, 1.0-gl_PointCoord.y))/uGrid)');
  const tiles=new Map();let count=0;
  for(const {char,points} of entries){const attrs=points.geometry.attributes,index=chars.indexOf(char);
    for(let i=0;i<attrs.position.count;i++){const x=attrs.position.getX(i),y=attrs.position.getY(i),z=attrs.position.getZ(i),key=Math.floor(x/12)+':'+Math.floor(z/12);
      if(!tiles.has(key))tiles.set(key,{p:[],c:[],s:[],cell:[]});const t=tiles.get(key);
      t.p.push(x,y,z);t.c.push(attrs.color.getX(i),attrs.color.getY(i),attrs.color.getZ(i));t.s.push(attrs.aSize.getX(i));t.cell.push(index%grid,grid-1-Math.floor(index/grid));count++;
    }scene.remove(points);points.geometry.dispose();points.material.dispose();
  }
  for(const t of tiles.values()){
    const geo=new THREE.BufferGeometry();for(const [name,data,size]of [['position',t.p,3],['color',t.c,3],['aSize',t.s,1],['aCell',t.cell,2]])geo.setAttribute(name,new THREE.Float32BufferAttribute(data,size));
    geo.computeBoundingSphere();geo.boundingSphere.radius+=1;const ink=new THREE.Points(geo,material);ink.name='spatial-static-ink';scene.add(ink);
  }return{material,count,tiles:tiles.size};
}
