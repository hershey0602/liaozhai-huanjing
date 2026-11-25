import {setupMobileLandscape} from './mobile-landscape.js?build=mobile-landscape-69';
await setupMobileLandscape();
const chapters=[
  ['prologue','书卷 · 启灵'],['nanshan','南山 · 花坞'],['palace','玄溟 · 鲛宫'],
  ['study','芸庭 · 小榭'],['ending','幻散 · 终章'],
];
const params=new URLSearchParams(location.search);
const space=params.get('space') || (params.get('intro')==='0'||params.has('view')?'nanshan':'prologue');
const nav=document.createElement('nav');
nav.className='chapter-nav';nav.setAttribute('aria-label','书中五境');
for(const [key,title] of chapters){
  const link=document.createElement('a');link.textContent=title;
  link.href=`?space=${key}${key==='nanshan'?'&intro=0':''}&v=mobile-landscape-69`;
  if(key===space)link.setAttribute('aria-current','page');
  nav.append(link);
}
document.body.append(nav);
if(['palace','study','ending'].includes(space)){
  const {startSpace}=await import('./literary-spaces.js?build=mobile-landscape-69');
  startSpace(space);
}else{
  await import('./scene.js?build=mobile-landscape-69');
}
