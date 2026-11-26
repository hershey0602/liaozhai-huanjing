import {viewSize,viewPointer,viewRect} from './view-viewport.js?build=wechat-landscape-75';
import * as THREE from 'three';
import {createPrologue} from './prologue.js?build=wechat-landscape-75';

export let opening=null;
export function startOpening(){
  if(opening)return opening;
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,document.body.classList.contains('mobile-visitor')?1.25:1.6));
  renderer.setSize(viewSize().width,viewSize().height);renderer.outputColorSpace=THREE.SRGBColorSpace;
  document.getElementById('stage').appendChild(renderer.domElement);
  let enter=null,frame=0;
  const prologue=createPrologue(renderer,()=>enter?enter():false);
  const canvas=renderer.domElement;
  const down=e=>prologue.pointerDown(e),move=e=>prologue.pointerMove(e),up=()=>prologue.pointerUp();
  function resize(){renderer.setSize(viewSize().width,viewSize().height);prologue.resize();}
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);
  canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);window.addEventListener('resize',resize);
  function render(){frame=requestAnimationFrame(render);prologue.update(performance.now()/1000);}
  opening={renderer,prologue,attach(callback){
    enter=callback;cancelAnimationFrame(frame);
    canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);
    canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);window.removeEventListener('resize',resize);
  }};
  render();performance.mark('liaozhai-book-ready');
  document.getElementById('startup-loading')?.remove();
  return opening;
}

// Give the opening animation and touch events a frame between valley build stages.
let lastSlice=performance.now();
export async function yieldToOpening(){
  // Never let generation steal frames from an active finger gesture.
  while(opening?.prologue.state==='opening')await new Promise(resolve=>requestAnimationFrame(resolve));
  if(performance.now()-lastSlice<5)return;
  await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));
  lastSlice=performance.now();
}
