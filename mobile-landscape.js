import {applyViewLayout,viewSize} from './view-viewport.js?build=wechat-landscape-75';
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
  let timer,requesting=false,wanted=false;
  try{wanted=sessionStorage.getItem('liaozhai-landscape-requested')==='1';}catch{}
  const horizontal=()=>viewSize().width>viewSize().height;
  const full=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
  function message(text){notice.textContent=text;notice.hidden=false;clearTimeout(timer);timer=setTimeout(()=>notice.hidden=true,6500);}
  function sync(){
    applyViewLayout(wanted);
    button.textContent=horizontal()?'竖屏游览':'横屏游览';button.setAttribute('aria-pressed',String(horizontal()));
    notice.hidden=true;
    // All scene renderers already listen to resize; fullscreen and visual viewport
    // changes also need to update camera aspect and canvas dimensions.
    requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
  }
  function viewportChanged(){
    applyViewLayout(wanted);
    button.textContent=horizontal()?'竖屏游览':'横屏游览';button.setAttribute('aria-pressed',String(horizontal()));
  }
  async function enter(){
    if(requesting)return;requesting=true;
    const attempt=requestLandscape(document,window.screen);wanted=true;try{sessionStorage.setItem('liaozhai-landscape-requested','1');}catch{}sync();button.disabled=true;
    try{const result=await attempt;
      if(!result.locked&&document.body.dataset.rotatedLandscape==='1')message('已切换横向画面，请将手机横放游览。');
      else if(horizontal()&&!result.fullscreen)message('已使用横屏视野，可直接拖动看景、点击方向键行走。');
    }finally{requesting=false;button.disabled=false;viewportChanged();}
  }
  button.onclick=async()=>{
    if(horizontal()||wanted){
      wanted=false;try{sessionStorage.removeItem('liaozhai-landscape-requested');}catch{}
      try{window.screen.orientation?.unlock?.();}catch{}
      const exit=document.exitFullscreen||document.webkitExitFullscreen;if(full()&&exit)try{await exit.call(document);}catch{}
      try{if(innerWidth>innerHeight)await window.screen.orientation?.lock?.('portrait');}catch{}
      sync();
    }else await enter();
  };
  window.addEventListener('resize',viewportChanged);
  window.addEventListener('orientationchange',sync);
  window.screen.orientation?.addEventListener?.('change',sync);
  document.addEventListener('fullscreenchange',sync);document.addEventListener('webkitfullscreenchange',sync);
  window.visualViewport?.addEventListener('resize',sync);viewportChanged();
  return Promise.resolve();
}
