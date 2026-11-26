import {viewPointer,viewRect} from './view-viewport.js?build=hold-walk-76';
export function createLetterWriting(kit,onComplete){
  const modal=document.createElement('section');modal.className='letter-modal';modal.hidden=true;
  modal.setAttribute('aria-label','信笺台 · 愿赴尘缘');modal.innerHTML=`
    <div class="letter-paper"><button class="letter-close" aria-label="暂收信笺">×</button>
    <div class="eyebrow">罗刹海市 · 锦囊书</div><h2>盈盈一水，青鸟难通。</h2>
    <p>“忽忽三年，红尘永隔；盈盈一水，青鸟难通。”<br>你是这一封信的见证者。沿淡墨写下四字，回应两地同心之约。</p>
    <div class="trace-wrap"><div class="trace-guides" aria-hidden="true"><span>愿</span><span>赴</span><span>尘</span><span>缘</span></div><canvas id="letter-trace" width="1000" height="238" aria-label="沿描红书写愿赴尘缘"></canvas></div>
    <div class="letter-toolbar"><button type="button" data-erase aria-pressed="false">擦除</button><button type="button" data-clear>重新落笔</button><small data-trace-status>沿淡墨落笔，四字成笺</small></div>
    <div class="seal-row"><button class="dragon-seal" aria-label="拖动龙形印章" disabled>龍印</button><p data-seal-hint>落墨后，将龙印拖至印位</p><button class="seal-target" aria-label="信笺盖印处">印位</button></div></div>`;
  document.body.append(modal);
  const canvas=modal.querySelector('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  const stamp=modal.querySelector('.dragon-seal'),target=modal.querySelector('.seal-target');
  const status=modal.querySelector('[data-trace-status]');let drawing=false,eraser=false,last=null,drag=null,selected=false,done=false;
  function point(e){e=viewPointer(e);const r=viewRect(canvas);return{x:(e.clientX-r.left)/r.width*canvas.width,y:(e.clientY-r.top)/r.height*canvas.height};}
  function coverage(){const d=ctx.getImageData(0,0,1000,238).data,counts=[0,0,0,0];for(let y=0;y<238;y+=2)for(let x=0;x<1000;x+=2)if(d[(y*1000+x)*4+3]>40)counts[Math.min(3,Math.floor(x/250))]++;const traced=counts.filter(n=>n>55).length;
    stamp.disabled=traced<4;status.textContent=traced===4?'四字已落墨 · 请将龙印落在右侧印位':`落墨 ${traced} / 4`;}
  canvas.addEventListener('pointerdown',e=>{e.preventDefault();drawing=true;last=point(e);canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drawing)return;const p=point(e);ctx.globalCompositeOperation=eraser?'destination-out':'source-over';ctx.strokeStyle='#61503b';ctx.lineWidth=eraser?25:6+Math.max(.1,e.pressure)*4;ctx.lineCap=ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;});
  for(const name of ['pointerup','pointercancel'])canvas.addEventListener(name,()=>{drawing=false;coverage();});
  modal.querySelector('[data-erase]').onclick=e=>{eraser=!eraser;e.currentTarget.setAttribute('aria-pressed',String(eraser));};
  modal.querySelector('[data-clear]').onclick=()=>{ctx.clearRect(0,0,1000,238);coverage();};
  function close(){modal.hidden=true;kit.locked=false;}
  modal.querySelector('.letter-close').onclick=close;
  function finish(){if(done||stamp.disabled)return;done=true;target.classList.add('stamped');target.textContent='两地同心';modal.querySelector('[data-seal-hint]').textContent='一笺落印，情义长存。';kit.chime([523,659,784]);setTimeout(()=>{close();onComplete();},1100);}
  stamp.addEventListener('pointerdown',e=>{e=viewPointer(e);if(stamp.disabled)return;e.preventDefault();drag={x:e.clientX,y:e.clientY};stamp.setPointerCapture(e.pointerId);selected=true;});
  stamp.addEventListener('pointermove',e=>{e=viewPointer(e);if(drag)stamp.style.transform=`translate(${e.clientX-drag.x}px,${e.clientY-drag.y}px) rotate(-5deg)`;});
  stamp.addEventListener('pointerup',e=>{e=viewPointer(e);if(!drag)return;const r=viewRect(target);if(e.clientX>r.left-15&&e.clientX<r.right+15&&e.clientY>r.top-15&&e.clientY<r.bottom+15)finish();drag=null;stamp.style.transform='';});
  stamp.addEventListener('pointercancel',()=>{drag=null;stamp.style.transform='';});
  stamp.addEventListener('click',()=>{selected=true;});target.onclick=()=>{if(selected)finish();};
  return {open(){modal.hidden=false;kit.locked=true;coverage();},get completed(){return done;}};
}
