// Reserve the widest retreat for the open palace and the least for the small
// historic room. Keep the lens moderate rather than forcing a whole room to fit.
export function portraitFraming(key,width,height,mobile){
  if(!mobile||width>=height)return{fov:58,retreat:0};
  const profile={palace:{fov:72,retreat:4.2},study:{fov:72,retreat:2.6},ending:{fov:70,retreat:.4}}[key];
  if(!profile)return{fov:58,retreat:0};
  const amount=Math.max(0,Math.min(1,(1-width/height)/.4));
  return{fov:58+(profile.fov-58)*amount,retreat:profile.retreat*amount};
}

export function framedPosition(entry,retreat,bounds={x:Infinity,minZ:-Infinity,maxZ:Infinity}){
  return{x:Math.max(-bounds.x,Math.min(bounds.x,entry.x+Math.sin(entry.heading)*retreat)),
    y:entry.y,z:Math.max(bounds.minZ,Math.min(bounds.maxZ,entry.z+Math.cos(entry.heading)*retreat))};
}
