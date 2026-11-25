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
  let timer,overlay=null,resolveReady=null,requesting=false;
  const horizontal=()=>innerWidth>innerHeight;
  const full=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
  function message(text){notice.textContent=text;notice.hidden=false;clearTimeout(timer);timer=setTimeout(()=>notice.hidden=true,6500);}
  function remember(){try{sessionStorage.setItem('liaozhai-landscape-guide','seen');}catch{}}
  function dismiss(){overlay?.remove();overlay=null;remember();resolveReady?.();resolveReady=null;}
  function sync(){
    document.body.classList.toggle('mobile-landscape',horizontal());
    button.textContent=full()?'退出全屏':horizontal()?'全屏游览':'横屏游览';button.setAttribute('aria-pressed',String(full()));
    if(horizontal()){notice.hidden=true;if(overlay)dismiss();}
    // All scene renderers already listen to resize; fullscreen and visual viewport
    // changes also need to update camera aspect and canvas dimensions.
    requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
  }
  function viewportChanged(){
    document.body.classList.toggle('mobile-landscape',horizontal());
    button.textContent=full()?'退出全屏':horizontal()?'全屏游览':'横屏游览';button.setAttribute('aria-pressed',String(full()));
    if(horizontal()){notice.hidden=true;if(overlay)dismiss();}
  }
  async function enter(){
    if(requesting)return;requesting=true;
    const attempt=requestLandscape(document,window.screen);dismiss();button.disabled=true;
    try{const result=await attempt;
      if(!result.locked&&!horizontal())message('请将手机横放；若画面不转，请关闭竖屏锁定或开启自动旋转。');
      else if(horizontal()&&!result.fullscreen)message('已使用横屏视野，可直接拖动看景、点击方向键行走。');
    }finally{requesting=false;button.disabled=false;sync();}
  }
  button.onclick=async()=>{
    if(full()){
      try{window.screen.orientation?.unlock?.();}catch{}
      const exit=document.exitFullscreen||document.webkitExitFullscreen;if(exit)try{await exit.call(document);}catch{}
      sync();
    }else await enter();
  };
  window.addEventListener('resize',viewportChanged);
  window.addEventListener('orientationchange',sync);
  window.screen.orientation?.addEventListener?.('change',sync);
  document.addEventListener('fullscreenchange',sync);document.addEventListener('webkitfullscreenchange',sync);
  window.visualViewport?.addEventListener('resize',sync);viewportChanged();
  let seen=false;try{seen=sessionStorage.getItem('liaozhai-landscape-guide')==='seen';}catch{}
  if(horizontal()||seen)return Promise.resolve();
  return new Promise(resolve=>{
    resolveReady=resolve;overlay=document.createElement('section');overlay.className='landscape-guide';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','landscape-guide-title');
    overlay.innerHTML='<div class="landscape-card"><div class="turn-phone" aria-hidden="true"><span></span>↻</div><small>聊斋幻城 · 书中五境</small><h1 id="landscape-guide-title">横屏，展开书中山水</h1><p>更宽的视野，适合漫游山水、探索古宅。</p><button type="button" class="landscape-enter">横屏游览</button><button type="button" class="landscape-portrait">继续竖屏</button><em>点击后尝试全屏与横屏；也可以直接将手机横放。</em></div>';
    document.body.append(overlay);const primary=overlay.querySelector('.landscape-enter');primary.onclick=enter;overlay.querySelector('.landscape-portrait').onclick=dismiss;primary.focus();
  });
}
