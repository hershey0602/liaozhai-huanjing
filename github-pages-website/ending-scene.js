import {THREE,seeded,mat,group,mesh,box,cylinder,calligraphy,makeInkFigure} from './space-kit.js?build=tree-guide-74';
import {heritageRoom} from './heritage-room.js?build=tree-guide-74';

import {flexibleLeaf,endingPaperMaterial,turnProgress} from './ending-paper.js?build=tree-guide-74';

const comments=[
  ['异史氏曰 · 婴宁','观其孜孜憨笑，似全无心肝者；而墙下恶作剧，其黠孰甚焉。至凄恋鬼母，反笑为哭，我婴宁殆隐于笑者矣。'],
  ['异史氏曰 · 罗刹海市','花面逢迎，世情如鬼。嗜痂之癖，举世一辙。“小惭小好，大惭大好。”若公然带须眉以游都市，其不骇而走者盖几希矣！'],
  ['异史氏曰 · 小谢','绝世佳人，求一而难之，何遽得两哉！事千古而一见，惟不私奔女者能遘之也。'],
];
const excerpts=['我婴宁殆隐于笑者矣。','花面逢迎，世情如鬼。','绝世佳人，求一而难之，何遽得两哉！'];
export const endingTiming={portrait:8,window:1,comment:4,closing:2};
export function buildSpace(k){
  const {world,updates}=k,rnd=seeded(9721);const room=heritageRoom(k);
  k.locked=true;k.scene.background.set('#b9a786');k.setView(0,4.5,0,.025);
  const roomMaterials=new Map();world.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material]){if(!roomMaterials.has(m)){roomMaterials.set(m,m.opacity);m.transparent=true;m.needsUpdate=true;}}});

  const scroll=group(world,0,1.0,-4.98);scroll.scale.setScalar(.54);const portrait=new THREE.TextureLoader().load('./assets/pusongling-reference.jpg');portrait.colorSpace=THREE.SRGBColorSpace;
  const portraitMaterial=new THREE.MeshStandardMaterial({map:portrait,transparent:true,opacity:0,roughness:.98,envMapIntensity:.15});mesh(scroll,new THREE.PlaneGeometry(2.7,4.7),portraitMaterial,0,3.0,0);
  const rodMat=mat('#817050');for(const y of [.58,5.4]){const rod=cylinder(scroll,.05,.05,2.95,rodMat,0,y,0);rod.rotation.z=Math.PI/2;}
  const finish={root:room.portraitFrame,portraitKey:room.portraitKey,halo:room.halo};
  finish.root.traverse(o=>{if(o.isMesh){const m=o.material;if(!roomMaterials.has(m)){roomMaterials.set(m,m.opacity);m.transparent=true;m.needsUpdate=true;}}});
  const windowFigure=makeInkFigure(world,4.9,.1,-.4,{color:'#695c45',opacity:0});windowFigure.rotation.set(0,-.65,.12);
  const book=group(world,0,1.65,-.5);book.name='ending-reading-book';book.visible=false;book.rotation.x=-.16;
  const cloth=mat('#9b8057'),pageEdge=mat('#c8b48b');box(book,1.7,2.2,.12,cloth,0,0,-.10);box(book,1.58,2.09,.15,pageEdge,0,0,0);
  const pc=document.createElement('canvas');pc.width=512;pc.height=704;const px=pc.getContext('2d');
  const pageTexture=new THREE.CanvasTexture(pc);pageTexture.colorSpace=THREE.SRGBColorSpace;
  function writePage(text){px.fillStyle='#e1cda5';px.fillRect(0,0,512,704);px.strokeStyle='#8b7651';px.lineWidth=2;px.strokeRect(27,27,458,650);px.textAlign='center';px.textBaseline='middle';px.font='32px KaiTi,STKaiti,serif';px.fillStyle='#62503a';
    [...text.replace(/[，。；！？“”]/g,'')].forEach((c,i)=>{const col=Math.floor(i/16),row=i%16;if(col<7)px.fillText(c,447-col*61,66+row*37);});pageTexture.needsUpdate=true;}
  writePage(comments[0][1]);
  const pages=mesh(book,new THREE.PlaneGeometry(1.54,2.04),endingPaperMaterial(pageTexture),0,0,.09);
  const turnCanvas=document.createElement('canvas');turnCanvas.width=512;turnCanvas.height=704;
  const turnTexture=new THREE.CanvasTexture(turnCanvas);turnTexture.colorSpace=THREE.SRGBColorSpace;
  function rememberPage(){turnCanvas.getContext('2d').drawImage(pc,0,0);turnTexture.needsUpdate=true;}
  rememberPage();
  const turning=group(book,-.78,0,.17),leaf=flexibleLeaf(endingPaperMaterial(turnTexture));turning.add(leaf);
  const leftStack=group(book,-.78,0,.17);leftStack.name='ending-left-page-stack';
  const leftCanvas=document.createElement('canvas');leftCanvas.width=512;leftCanvas.height=704;const lx=leftCanvas.getContext('2d');lx.fillStyle='#e1cda5';lx.fillRect(0,0,512,704);lx.strokeStyle='#8b7651';lx.strokeRect(27,27,458,650);lx.fillStyle='#62503a';lx.font='54px KaiTi,STKaiti,serif';['异','史','氏','曰'].forEach((c,i)=>lx.fillText(c,230,160+i*105));
  const leftTexture=new THREE.CanvasTexture(leftCanvas);leftTexture.colorSpace=THREE.SRGBColorSpace;
  const leftPage=mesh(leftStack,new THREE.PlaneGeometry(1.54,2.04),endingPaperMaterial(leftTexture),-.77,0,0);
  for(let i=1;i<=4;i++)mesh(leftStack,new THREE.PlaneGeometry(1.54-i*.002,2.04-i*.002),mat(i%2?'#c9b68f':'#e2d0a9',{side:THREE.DoubleSide,roughness:1}),-.77,0,-i*.003);
  const coverCanvas=document.createElement('canvas');coverCanvas.width=512;coverCanvas.height=704;const cb=coverCanvas.getContext('2d');cb.fillStyle='#b8a27b';cb.fillRect(0,0,512,704);cb.fillStyle='#564b38';cb.font='90px KaiTi,serif';['聊','斋','志','异'].forEach((c,i)=>cb.fillText(c,210,160+i*140));
  const coverTexture=new THREE.CanvasTexture(coverCanvas);coverTexture.colorSpace=THREE.SRGBColorSpace;
  const reference=new Image();reference.onload=()=>{cb.drawImage(reference,0,170,650,1020,0,0,512,704);coverTexture.needsUpdate=true;};reference.src='./assets/liaozhai-reference-book.jpg';
  const coverHinge=group(book,-.86,0,.13);box(coverHinge,1.71,2.21,.045,cloth,.855,0,0);mesh(coverHinge,new THREE.PlaneGeometry(1.70,2.20),new THREE.MeshBasicMaterial({map:coverTexture,side:THREE.DoubleSide}),.855,0,.028);
  const bookMaterials=new Set();book.traverse(o=>{if(o.isMesh)bookMaterials.add(o.material);});
  function revealBook(opacity){for(const m of bookMaterials){m.transparent=true;if(m.uniforms?.uOpacity)m.uniforms.uOpacity.value=opacity;else m.opacity=opacity;}}
  const verse=document.createElement('div');verse.className='ending-verse';verse.setAttribute('aria-live','polite');verse.innerHTML='<small></small><p></p>';document.body.append(verse);
  const actions=document.createElement('div');actions.className='ending-actions';actions.hidden=true;actions.innerHTML='<a href="?space=prologue&v=tree-guide-74">再启书卷</a><a href="?space=nanshan&intro=0&v=tree-guide-74">重游三境</a>';document.body.append(actions);
  const textCache=new Map(),motes=[];const words=[...comments.map(a=>a[1]).join('')];
  for(let i=0;i<125;i++){const c=words[i%words.length];if(!textCache.has(c))textCache.set(c,calligraphy(c,{width:128,height:128,size:88,vertical:false,color:'#fff'}));
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:textCache.get(c),color:'#ceb58a',transparent:true,opacity:0,depthWrite:false}));s.scale.setScalar(.12+rnd()*.09);const origin=new THREE.Vector3((rnd()-.5)*17,.2+rnd()*5,-12+rnd()*22);s.position.copy(origin);world.add(s);motes.push({s,origin,delay:rnd()*.5});}
  let phase=0,at=k.time,quote=-1,readingAt=null,landedQuote=-1,exploring=false;
  const read=document.createElement('button');read.className='space-skip ending-read';read.textContent='读完整评语';read.hidden=true;document.body.append(read);
  read.onclick=()=>{if(phase!==2||readingAt!==null)return;readingAt=k.time;read.hidden=true;k.skip.hidden=true;k.say([comments[Math.max(0,quote)]],()=>{at+=k.time-readingAt;readingAt=null;read.hidden=false;k.skip.hidden=false;},'返回合卷');};
  const tour=document.createElement('button');tour.className='space-skip heritage-tour';tour.textContent='漫游聊斋旧居';document.body.append(tour);tour.onclick=()=>{if(phase!==0)return;exploring=true;portraitMaterial.opacity=1;k.locked=false;document.body.classList.add('heritage-exploring');tour.hidden=true;k.skip.textContent='继续合卷';};
  function nextPhase(){exploring=false;k.locked=true;document.body.classList.remove('heritage-exploring');tour.hidden=true;k.setView(0,4.5,0,.025);phase++;at=k.time;k.skip.textContent='继续';
    if(phase===2){book.visible=true;read.hidden=false;}
    if(phase===3){read.hidden=true;verse.querySelector('small').textContent='书页将尽';verse.querySelector('p').textContent='有花有酒春常在，无灯无烛夜自明。';verse.classList.add('visible');}
    if(phase>=4){read.hidden=true;k.skip.hidden=true;verse.querySelector('small').textContent='幻散 · 终章';verse.querySelector('p').textContent='我的故事讲完了，后面的故事就交由你们这些后人来讲。';verse.classList.add('visible');actions.hidden=false;}}
  k.skip.hidden=false;k.skip.textContent='继续';k.skip.onclick=()=>{if(readingAt!==null)return;if(exploring){nextPhase();return;}if(phase===2){const elapsed=k.time-at,index=Math.floor(elapsed/endingTiming.comment)+1;if(index>=3)nextPhase();else at=k.time-index*endingTiming.comment;}else nextPhase();};
  if(new URLSearchParams(globalThis.location?.search||'').get('tour')==='1')tour.onclick();
  k.clickable(scroll,()=>{if(phase===0)nextPhase();});
  updates.push(t=>{
    if(readingAt!==null||exploring)return;
    const age=t-at;
    if(phase===0){portraitMaterial.opacity=THREE.MathUtils.smoothstep(age,0,1);if(age>=endingTiming.portrait){nextPhase();return;}}
    if(phase===1){portraitMaterial.opacity=1-THREE.MathUtils.smoothstep(age,0,endingTiming.window);windowFigure.material.opacity=.25*THREE.MathUtils.smoothstep(age,0,endingTiming.window);k.ambient.intensity=.30-.15*Math.min(1,age/endingTiming.window);k.sun.intensity=0;if(age>=endingTiming.window){nextPhase();return;}}
    book.position.x=k.camera.aspect<1&&document.body.classList.contains('mobile-visitor')&&(phase===2||phase===3)?.78:0;
    if(phase===2){const index=Math.min(2,Math.floor(age/endingTiming.comment)),local=age-index*endingTiming.comment;if(index!==quote){quote=index;rememberPage();verse.querySelector('small').textContent=comments[index][0]+' · 节选';verse.querySelector('p').textContent=excerpts[index];writePage(comments[index][1]);}
      verse.classList.toggle('visible',local<3.7);const turn=turnProgress(local);
      leaf.visible=index>0&&turn<1;leaf.userData.bend(turn);leftPage.visible=true;leftStack.visible=true;leftStack.rotation.y=0;
      if(index>0&&turn>=1&&landedQuote!==index){lx.drawImage(turnCanvas,0,0);leftTexture.needsUpdate=true;landedQuote=index;}
      coverHinge.rotation.y=-Math.PI;const entrance=THREE.MathUtils.smootherstep(age,0,.65);revealBook(entrance);book.position.y=1.07+.08*entrance;book.scale.setScalar(.98+.02*entrance);
      const fade=THREE.MathUtils.smoothstep(age,0,endingTiming.comment*3);for(const [m,opacity] of roomMaterials)m.opacity=opacity*(1-fade*.88);
      motes.forEach(({s,origin,delay},i)=>{const p=THREE.MathUtils.clamp((fade-delay)/(1-delay),0,1);s.position.lerpVectors(origin,new THREE.Vector3(0,1.6,-.5),p);s.position.x+=Math.sin(t*.5+i)*.16*(1-p);s.material.opacity=Math.sin(p*Math.PI)*.45;});
      if(age>=endingTiming.comment*3){nextPhase();return;}
    }
    if(phase===3){const close=THREE.MathUtils.smootherstep(age,0,1.15);book.position.x*=1-close;coverHinge.rotation.y=-Math.PI*(1-close);leftStack.rotation.y=Math.PI*close;leaf.visible=false;leftStack.visible=close<.98;pages.visible=close<.98;revealBook(1);book.scale.setScalar(1);book.position.y=1.15;for(const {s} of motes)s.material.opacity*=.85;if(age>=endingTiming.closing)nextPhase();}
    if(phase>=4){coverHinge.rotation.y=0;leaf.visible=false;leftStack.visible=false;pages.visible=false;book.position.y=1.15;}
  });
}
