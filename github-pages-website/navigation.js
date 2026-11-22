export function blocked(p,obstacles,pad=.24){return obstacles.some(o=>Math.abs(p.x-o.x)<o.w/2+pad&&Math.abs(p.z-o.z)<o.d/2+pad);}
export function recoverPosition(p,obstacles){
  let q={x:p.x,z:p.z};for(let pass=0;pass<obstacles.length+1;pass++){
    const o=obstacles.find(o=>blocked(q,[o]));if(!o)break;
    const edges=[{x:o.x-o.w/2-.26,z:q.z},{x:o.x+o.w/2+.26,z:q.z},{x:q.x,z:o.z-o.d/2-.26},{x:q.x,z:o.z+o.d/2+.26}];
    edges.sort((a,b)=>Math.hypot(a.x-q.x,a.z-q.z)-Math.hypot(b.x-q.x,b.z-q.z));q=edges.find(e=>!blocked(e,obstacles))||edges[0];
  }return q;
}
export function walkStep(from,to,obstacles){
  let p=recoverPosition(from,obstacles);const dx=to.x-from.x,dz=to.z-from.z,n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12));
  for(let i=0;i<n;i++){const full={x:p.x+dx/n,z:p.z+dz/n};if(!blocked(full,obstacles)){p=full;continue;}const x={x:full.x,z:p.z};if(!blocked(x,obstacles))p=x;const z={x:p.x,z:full.z};if(!blocked(z,obstacles))p=z;}return p;
}
export function approachPosition(from,target,stop,obstacles){
  const angle=Math.atan2(from.z-target.z,from.x-target.x);let best=null,score=Infinity;
  for(let i=0;i<64;i++){const a=angle+i*Math.PI*2/64;const p={x:target.x+Math.cos(a)*stop,z:target.z+Math.sin(a)*stop};if(blocked(p,obstacles))continue;const cost=Math.hypot(p.x-from.x,p.z-from.z);if(cost<score){best=p;score=cost;}}
  return best||recoverPosition(from,obstacles);
}
