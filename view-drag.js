// Drag the visible scenery with the finger. The two camera implementations
// use opposite yaw conventions but must feel identical to the visitor.
export function dragView(yaw,pitch,dx,dy,{euler=false,speedX=.0035,speedY=.0032,min=-1.1,max=.9}={}){
  return{yaw:yaw+dx*speedX*(euler?1:-1),pitch:Math.max(min,Math.min(max,pitch+dy*speedY))};
}
