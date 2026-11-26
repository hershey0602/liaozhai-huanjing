export function followPage(current,target,dt){
  const step=Math.max(0,Math.min(.05,dt));
  const difference=(target-current)*(1-Math.exp(-step/ .085));
  return current+Math.sign(difference)*Math.min(Math.abs(difference),step*.85);
}
export function pageCurl(u,turn){return .045*Math.sin(Math.PI*u)+.17*Math.sin(Math.PI*turn)*Math.sin(Math.PI*u);}
