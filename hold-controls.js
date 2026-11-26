// Direction controls are hold gestures, not selectable text or draggable images.
export function bindHoldControl(button,onStart,onStop,env={window,document}){
  const win=env.window,doc=env.document,pointerEvents=typeof win.PointerEvent!=='undefined';let active=null;
  const cancel=e=>{if(e.cancelable!==false)e.preventDefault();};
  const stop=()=>{if(!active)return;active=null;onStop();};
  function start(source,id,e){cancel(e);if(active||e.isPrimary===false||e.button>0)return;if(onStart(e)===false)return;active={source,id};
    if(source==='pointer')try{button.setPointerCapture(id);}catch{}
  }
  const direction=button.dataset.direction,rotation={forward:0,right:90,back:180,left:-90}[direction]??0;
  button.type='button';button.setAttribute('draggable','false');button.setAttribute('unselectable','on');
  button.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20V4M5 11L12 4L19 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${rotation} 12 12)"/></svg>`;
  for(const name of ['contextmenu','selectstart','dragstart'])button.addEventListener(name,cancel,{capture:true,passive:false});
  button.addEventListener('pointerdown',e=>start('pointer',e.pointerId,e),{passive:false});
  const pointerEnd=e=>{if(active?.source==='pointer'&&active.id===e.pointerId)stop();};
  for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,pointerEnd);
  for(const name of ['pointerup','pointercancel'])win.addEventListener(name,pointerEnd,{capture:true});
  button.addEventListener('touchstart',e=>{cancel(e);if(!pointerEvents&&e.changedTouches?.length)start('touch',e.changedTouches[0].identifier,e);},{passive:false});
  button.addEventListener('touchmove',cancel,{passive:false});
  const touchEnd=e=>{if(active?.source!=='touch')return;if([...e.changedTouches??[]].some(t=>t.identifier===active.id))stop();};
  for(const name of ['touchend','touchcancel']){button.addEventListener(name,e=>{cancel(e);touchEnd(e);},{passive:false});win.addEventListener(name,touchEnd,{capture:true});}
  if(!pointerEvents){button.addEventListener('mousedown',e=>start('mouse',0,e));win.addEventListener('mouseup',()=>{if(active?.source==='mouse')stop();},{capture:true});}
  button.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){cancel(e);if(!e.repeat)start('keyboard',e.key,e);}});
  button.addEventListener('keyup',e=>{if(active?.source==='keyboard'&&active.id===e.key){cancel(e);stop();}});
  button.addEventListener('blur',stop);win.addEventListener('blur',stop);win.addEventListener('pagehide',stop);
  doc.addEventListener('visibilitychange',()=>{if(doc.hidden)stop();});
  return{stop};
}
