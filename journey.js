import {setupMobileLandscape} from './mobile-landscape.js?build=wechat-landscape-75';
const mobileReady=setupMobileLandscape();
const params=new URLSearchParams(location.search);
const space=params.get('space') || (params.get('intro')==='0'||params.has('view')?'nanshan':'prologue');
const revision=params.get('rev')??'source-verse-2';
const hasOpening=['prologue','nanshan'].includes(space)&&!params.has('view')&&params.get('intro')!=='0'&&['source-verse-2','layered-ink-valley'].includes(revision);
// Start the book directly in the current screen orientation, then prepare the valley.
const openingModule=hasOpening?import('./opening.js?build=wechat-landscape-75'):null;
await mobileReady;
const chapters=[
  ['prologue','书卷 · 启灵'],['nanshan','南山 · 花坞'],['palace','玄溟 · 鲛宫'],
  ['study','芸庭 · 小榭'],['ending','幻散 · 终章'],
];
const nav=document.createElement('nav');
nav.className='chapter-nav';nav.setAttribute('aria-label','书中五境');
for(const [key,title] of chapters){
  const link=document.createElement('a');link.textContent=title;
  link.href=`?space=${key}${key==='nanshan'?'&intro=0':''}&v=wechat-landscape-75`;
  if(key===space)link.setAttribute('aria-current','page');
  nav.append(link);
}
document.body.append(nav);
if(['palace','study','ending'].includes(space)){
  const {startSpace}=await import('./literary-spaces.js?build=wechat-landscape-75');
  startSpace(space);
}else{
  if(openingModule){(await openingModule).startOpening();await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));}
  await import('./scene.js?build=wechat-landscape-75');
}
