export function pageRotated(){return globalThis.document?.body?.dataset?.rotatedLandscape==='1';}
export function viewSize(){const width=globalThis.innerWidth,height=globalThis.innerHeight;return pageRotated()?{width:height,height:width}:{width,height};}
export function physicalToView(x,y,width,rotated){return rotated?{x:y,y:width-x}:{x,y};}
export function viewPointer(event){
  if(event.viewMapped||!pageRotated())return event;
  const p=physicalToView(event.clientX,event.clientY,globalThis.innerWidth,true);
  return new Proxy(event,{get(t,k){if(k==='viewMapped')return true;if(k==='clientX')return p.x;if(k==='clientY')return p.y;const v=Reflect.get(t,k,t);return typeof v==='function'?v.bind(t):v;}});
}
export function viewRect(element){
  const r=element.getBoundingClientRect();if(!pageRotated())return r;
  const left=r.top,top=globalThis.innerWidth-r.right,width=r.height,height=r.width;
  return{left,top,width,height,right:left+width,bottom:top+height};
}
export function applyViewLayout(wanted){
  const body=document.body,rotate=!!wanted&&globalThis.innerWidth<globalThis.innerHeight;
  body.dataset.rotatedLandscape=rotate?'1':'0';body.classList.toggle('force-landscape',rotate);
  const size=viewSize();body.classList.toggle('mobile-landscape',size.width>size.height);
  for(const [name,value] of Object.entries({'--device-width':globalThis.innerWidth+'px','--view-width':size.width+'px','--view-height':size.height+'px','--app-vw':size.width/100+'px','--app-vh':size.height/100+'px'}))body.style.setProperty?.(name,value);
  return size;
}
