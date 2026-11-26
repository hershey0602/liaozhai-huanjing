export const VALLEY_WALK_SPEED=6;
export const VALLEY_TAP_STEP=.55;
export function walkFrameDistance(dt){return VALLEY_WALK_SPEED*Math.max(0,Math.min(.1,dt));}
export function treeBearing(dx,dz,yaw){
  const heading=Math.atan2(dx,-dz),angle=Math.atan2(Math.sin(heading-yaw),Math.cos(heading-yaw));
  const a=Math.abs(angle);
  return{heading:yaw+angle,angle,direction:a<.3?'前方':a>2.5?'后方':angle>0?'右侧':'左侧',arrow:a<.3?'↑':a>2.5?'↓':angle>0?'↗':'↖'};
}
export function guideMessage(bearing,distance,phase){
  if(distance<=8&&phase>=2)return '笑声古树 · 点击树下灵狐';
  if(distance<=18&&phase===0)return '笑声古树 · 停留片刻听笑声';
  return `${bearing.arrow} 笑声古树 · ${bearing.direction}`;
}
