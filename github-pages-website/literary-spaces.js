import {createSpace} from './space-kit.js?build=tree-guide-74';
export async function startSpace(key){
  const settings={
    palace:{title:'玄溟 · 鲛宫',legend:'碧玉为叶 · 赤瑙为花',background:'#dfe6db',fogNear:30,fogFar:104},
    study:{title:'芸庭 · 小榭',legend:'同一种书 · 同一种字',background:'#e2d7bd',fogNear:23,fogFar:67},
    ending:{title:'幻散 · 终章',legend:'异史氏曰',background:'#29271f',fogNear:12,fogFar:45},
  };
  const kit=createSpace(key,settings[key]);
  try{
    const module=key==='palace'?await import('./palace-scene.js?build=tree-guide-74')
      :key==='study'?await import('./study-scene.js?build=tree-guide-74')
        :await import('./ending-scene.js?build=tree-guide-74');
    module.buildSpace(kit);kit.start();
  }catch(error){console.error(error);kit.announce('书页尚未展开，请刷新重试。',60);kit.start();}
}
