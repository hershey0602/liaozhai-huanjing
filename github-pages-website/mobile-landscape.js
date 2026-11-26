export function isMobileVisitor(nav,viewport){
  return /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent||'')||((nav.maxTouchPoints||0)>0&&Math.min(viewport.width,viewport.height)<900);
}

export async function requestLandscape(doc,display){
  let fullscreen=!!(doc.fullscreenElement||doc.webkitFullscreenElement),locked=false;
  if(!fullscreen){
    const enter=doc.documentElement.requestFullscreen||doc.documentElement.webkitRequestFullscreen;
    if(enter)try{await enter.call(doc.documentElement);fullscreen=true;}catch{}
  }
  if(typeof display?.orientation?.lock==='function')try{await display.orientation.lock('landscape');locked=true;}catch{}
  return{fullscreen,locked};
}

export function setupMobileLandscape(){
  const mobile=isMobileVisitor(navigator,{width:innerWidth,height:innerHeight})||new URLSearchParams(location.search).get('preview')==='mobile';
  if(!mobile)return Promise.resolve();
  document.body.classList.add('mobile-visitor');
  const button=document.createElement('button');button.className='landscape-toggle';button.type='button';button.setAttribute('aria-label','横屏与全屏游览');document.body.append(button);
  const notice=document.createElement('div');notice.className='landscape-notice';notice.setAttribute('role','status');notice.hidden=true;document.body.append(notice);
  let timer,requesting=false;
  const horizontal=()=>innerWidth>innerHeight;
  const full=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
  function message(text){notice.textContent=text;notice.hidden=false;clearTimeout(timer);timer=setTimeout(()=>notice.hidden=true,6500);}
  function sync(){
    document.body.classList.toggle('mobile-landscape',horizontal());
    button.textContent=full()?'退出全屏':horizontal()?'竖屏游览':'横屏游览';button.setAttribute('aria-pressed',String(full()));
    notice.hidden=true;
    // All scene renderers already listen to resize; fullscreen and visual viewport
    // changes also need to update camera aspect and canvas dimensions.
    requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
  }
  function viewportChanged(){
    document.body.classList.toggle('mobile-landscape',horizontal());
    button.textContent=full()?'退出全屏':horizontal()?'竖屏游览':'横屏游览';button.setAttribute('aria-pressed',String(full()));
  }
  async function enter(){
    if(requesting)return;requesting=true;
    const attempt=requestLandscape(document,window.screen);button.disabled=true;
    try{const result=await attempt;
      if(!result.locked&&!horizontal())message('请将手机横放；若画面不转，请关闭竖屏锁定或开启自动旋转。');
      else if(horizontal()&&!result.fullscreen)message('已使用横屏视野，可直接拖动看景、点击方向键行走。');
    }finally{requesting=false;button.disabled=false;viewportChanged();}
  }
  button.onclick=async()=>{
    if(full()){
      try{window.screen.orientation?.unlock?.();}catch{}
      const exit=document.exitFullscreen||document.webkitExitFullscreen;if(exit)try{await exit.call(document);}catch{}
      sync();
    }else if(horizontal()){
      let locked=false;try{if(window.screen.orientation?.lock){await window.screen.orientation.lock('portrait');locked=true;}}catch{}
      if(!locked)message('请将手机竖放，即可恢复竖屏游览。');
    }else await enter();
  };
  window.addEventListener('resize',viewportChanged);
  window.addEventListener('orientationchange',sync);
  window.screen.orientation?.addEventListener?.('change',sync);
  document.addEventListener('fullscreenchange',sync);document.addEventListener('webkitfullscreenchange',sync);
  window.visualViewport?.addEventListener('resize',sync);viewportChanged();
  return Promise.resolve();
}
