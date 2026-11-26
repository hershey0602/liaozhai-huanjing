import {viewSize,viewPointer,viewRect} from './view-viewport.js?build=hold-walk-76';
import * as THREE from 'three';

// The encounter is a short chapter with physical clues and a readable dialogue
// layer. The story advances only after the visitor interacts with each clue.
export function createYingningStory({ scene, camera, tree, characterPosition, ground, caption }) {
  const panel = document.getElementById('story-panel');
  const title = document.getElementById('story-title');
  const text = document.getElementById('story-text');
  const next = document.getElementById('story-next');
  const progress = document.getElementById('story-progress');
  const ending = document.getElementById('story-ending');
  document.getElementById('story-replay').addEventListener('click',()=>{ location.href=location.pathname+'?space=prologue&v=hold-walk-76'; });
  const marker = document.getElementById('story-marker');
  const hint = document.querySelector('.hint');
  const worldPoint = new THREE.Vector3();
  const branchPosition = new THREE.Vector3(tree.x - 2.6, 0, tree.z + 2.5);
  const teaPosition = new THREE.Vector3(tree.x + 1.0, 0, tree.z + 1.3);
  const characterMarkerPosition = new THREE.Vector3(tree.x - 1.2, 0, tree.z + 1.8);
  branchPosition.y = ground(branchPosition.x, branchPosition.z);
  teaPosition.y = ground(teaPosition.x, teaPosition.z);
  characterMarkerPosition.y = ground(characterMarkerPosition.x, characterMarkerPosition.z);
  const wood = new THREE.MeshStandardMaterial({ color:'#70624d', roughness:1 });
  const paleWood = new THREE.MeshStandardMaterial({ color:'#bba987', roughness:1 });
  const ceramic = new THREE.MeshStandardMaterial({ color:'#e8ddd0', roughness:.82 });
  const blossom = new THREE.MeshBasicMaterial({ color:'#df9ba1' });
  const branch = new THREE.Group();
  branch.position.copy(branchPosition);
  const twig = points => branch.add(new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),12,.008,5,false),wood));
  twig([[-.30,.055,0],[-.12,.09,.01],[.11,.14,-.02],[.28,.19,.015]]);
  twig([[-.08,.10,.01],[-.04,.17,.11],[.06,.21,.16]]);
  twig([[.10,.14,-.02],[.17,.20,-.11],[.23,.23,-.14]]);
  for(const [x,y,z] of [[-.22,.07,0],[.03,.19,.13],[.22,.23,-.14],[.27,.19,.015]]){
    for(let j=0;j<5;j++){
      const petal=new THREE.Mesh(new THREE.SphereGeometry(.020,6,4),blossom);
      petal.position.set(x+Math.cos(j*1.257)*.019,y+Math.sin(j*1.257)*.019,z);
      branch.add(petal);
    }
  }
  scene.add(branch);
  const table = new THREE.Group();
  table.position.copy(teaPosition);
  const mat = new THREE.Mesh(new THREE.CircleGeometry(.92,20),new THREE.MeshBasicMaterial({color:'#d3c4a8',side:THREE.DoubleSide,transparent:true,opacity:.44,depthWrite:false}));
  mat.rotation.x=-Math.PI/2;mat.position.y=.025;table.add(mat);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(.62,.58,.075,16),paleWood);
  top.position.y=.47;table.add(top);
  for(const x of [-.35,.35])for(const z of [-.25,.25]){
    const foot=new THREE.Mesh(new THREE.CylinderGeometry(.035,.044,.41,8),wood);
    foot.position.set(x,.23,z);table.add(foot);
  }
  for(const x of [-.18,.18]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(.09,.075,.11,12),ceramic);
    cup.position.set(x,.58,.04);table.add(cup);
  }
  scene.add(table);
  const state = { stage:0, waitSince:-1, teaWaiting:false, active:false, lines:[], index:0, done:null };
  const names = ['初遇花树','拾起梅枝','茶席停留','传递梅枝','听她说往事','循径离开','终章'];
  const step = stage => {
    state.stage=stage;
    progress.textContent=`婴宁 · ${names[stage]}`;
    progress.classList.add('visible');
    marker.hidden=false;
    if(stage===1) hint.innerHTML='花径旁有一枝梅花 · 走近点击「拾起梅枝」';
    if(stage===2) hint.innerHTML='古树旁设有茶席 · 走近点击「坐于茶席」';
    if(stage===3) hint.innerHTML='茶席对白结束 · 点击婴宁旁的「递出梅枝」';
    if(stage===4) hint.innerHTML='留在古树旁，听婴宁说一段往事';
    if(stage===5) hint.innerHTML='花影归卷 · 随书入海';
  };
  let departing=false;
  function finishChapter(){
    if(departing)return;departing=true;step(6);
    panel.classList.remove('visible');marker.hidden=true;
    ending.querySelector('p').textContent='花影归卷，下一页是海上的相逢。';
    ending.querySelector('button').hidden=true;
    const shortcut=ending.querySelector('.next-space');if(shortcut)shortcut.hidden=true;
    ending.classList.add('visible');
    setTimeout(()=>{location.href='?space=palace&v=hold-walk-76';},2600);
  }
  function show(lines, done) {
    state.lines=lines;state.index=0;state.done=done;state.active=true;
    panel.classList.add('visible');
    display();
  }
  function display() {
    const line=state.lines[state.index];
    title.textContent=line[0];text.textContent=line[1];
    next.textContent='继续';
  }
  next.addEventListener('click',()=>{
    if(!state.active)return;
    if(++state.index<state.lines.length){display();return;}
    panel.classList.remove('visible');state.active=false;
    const done=state.done;state.done=null;done?.();
  });
  function onCharacterClick() {
    if(state.active)return;
    if(state.stage===0){
      show([
        ['花树下 · 初遇','花影微动，一只灵狐回身望来，仿佛听懂了你的脚步。'],
        ['婴宁','视碧桃开未？'],
      ],()=>step(1));
    } else if(state.stage===3){
      show([
        ['递出梅枝','“此上元妹子所遗，故存之。”你把梅枝递到她面前，枝梢浮出细小墨字。'],
        ['婴宁','花都枯了，怎么还留着？'],
        ['花影成字','往日灯市的影子在梅枝间亮起，旋即化作飞散的字迹。'],
      ],()=>{step(4);state.waitSince=performance.now();});
    } else if(state.stage<5) caption(state.stage===2?'先在古树旁的茶席坐一会儿。':'花径边还有故事线索。');
  }
  marker.addEventListener('click',()=>{
    if(state.active)return;
    const p=state.stage===1?branchPosition:state.stage===2?teaPosition:null;
    if(p && Math.hypot(camera.position.x-p.x,camera.position.z-p.z)>8.5){
      caption('再走近些，线索就在眼前。');return;
    }
    if(state.stage===1){
      branch.visible=false;
      step(2);
      show([['拾起梅枝','花枝已褪去春色，却仍留着上元灯火的气息。']],()=>caption('古树旁有一方茶席。'));
    } else if(state.stage===2){
      marker.hidden=true;
      state.teaWaiting=true;
      state.waitSince=performance.now();
      caption('茶席静了下来。稍坐片刻，听溪水和花间的笑声。',5200);
    } else if(state.stage===3){
      if(Math.hypot(camera.position.x-characterMarkerPosition.x,
        camera.position.z-characterMarkerPosition.z)>8.5){
        caption('走近婴宁，把梅枝交给她。');return;
      }
      onCharacterClick();
    } else if(state.stage===5){
      finishChapter();
    }
  });
  function update(time, characterVisible) {
    if(!characterVisible || state.stage===0 || state.stage===4 || state.stage===6 || state.active || state.teaWaiting){
      marker.hidden=true;
    } else if(state.stage===1 || state.stage===2 || state.stage===3){
      const p=state.stage===1?branchPosition:state.stage===2?teaPosition:characterMarkerPosition;
      worldPoint.set(p.x,p.y+1.25,p.z).project(camera);
      marker.hidden=worldPoint.z<0 || worldPoint.z>1 || Math.abs(worldPoint.x)>.95 || Math.abs(worldPoint.y)>.88;
      marker.textContent=state.stage===1?'拾起梅枝':state.stage===2?'坐于茶席':'递出梅枝';
      if(!marker.hidden){
        marker.style.left=`${(worldPoint.x*.5+.5)*viewSize().width}px`;
        marker.style.top=`${(-worldPoint.y*.5+.5)*viewSize().height}px`;
      }
    } else if(state.stage===5){
      marker.hidden=false;marker.textContent='沿花径离开 · 返回书页';
      marker.style.left='50%';marker.style.top='82%';
    }
    if(state.stage===2 && state.waitSince>0 && performance.now()-state.waitSince>5000 && !state.active){
      state.waitSince=-1;
      state.teaWaiting=false;
      show([
        ['茶席 · 溪声渐近','风止于竹影，鸟鸣慢慢隐去，只听见水声。'],
        ['婴宁','你来了，上元节我们见过的。'],
        ['婴宁','今年山里的花，比去年开得早。'],
      ],()=>step(3));
    }
    if(state.stage===4 && state.waitSince>0 && performance.now()-state.waitSince>3000 && !state.active){
      state.waitSince=-1;
      show([
        ['婴宁 · 往事','“妾本狐产，母临去，以妾托鬼母。”她第一次说起自己的身世。'],
        ['婴宁 · 往事','“老母，岑寂山阿，无人怜而合厝之。”笑意渐隐，她望向山深处。'],
        ['花坞 · 尾声','那枝上元节的梅花，留住了相遇，也让她终于说出埋在心里的牵挂。'],
      ],()=>{step(5);finishChapter();});
    }
  }
  step(0);progress.classList.remove('visible');marker.hidden=true;
  return { update, onCharacterClick, state };
}
