import * as THREE from 'three';
import { GLTFLoader } from './assets/loaders/GLTFLoader.js';

export async function createYingningCharacter(scene, x, z, floor) {
  const gltf = await new GLTFLoader().loadAsync('./assets/fox-walk-rigged.glb');
  const model = gltf.scene;
  model.traverse(object => {
    if (!object.isMesh) return;
    object.frustumCulled = false;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if ('roughness' in material) material.roughness = Math.max(material.roughness, 0.82);
      if ('metalness' in material) material.metalness = 0;
    }
  });
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const height = box.getSize(new THREE.Vector3()).y;
  const scale = 1.16 / height;
  const body = new THREE.Group();
  body.scale.setScalar(scale);
  body.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  body.add(model);
  const actor = new THREE.Group();
  actor.position.set(x, floor, z);
  actor.visible = false;
  actor.userData.isYingning = true;
  actor.add(body);
  const clickTarget = new THREE.Mesh(new THREE.SphereGeometry(0.76, 12, 8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0,
      depthWrite: false, colorWrite: false }));
  clickTarget.position.y = 0.63;
  clickTarget.scale.set(1.18, 0.94, 0.86);
  actor.add(clickTarget);
  scene.add(actor);

  const mixer = new THREE.AnimationMixer(model);
  const survey = gltf.animations.find(clip => clip.name === 'Survey');
  const walk = gltf.animations.find(clip => clip.name === 'Walk');
  const surveyAction = survey ? mixer.clipAction(survey) : null;
  const walkAction = walk ? mixer.clipAction(walk) : null;
  surveyAction?.setEffectiveWeight(0.70).play();
  walkAction?.setEffectiveWeight(0.30).setEffectiveTimeScale(0.54).play();

  const warmLight = new THREE.PointLight('#fff4de', 1.25, 7);
  warmLight.position.set(x - 0.8, floor + 2.0, z + 1.5);
  warmLight.visible = false;
  scene.add(warmLight);
  let lastTime = null;
  let greetingAt = -100;
  return {
    actor,
    greet(time) { greetingAt = time; },
    update(time, player, revealAt) {
      if (revealAt < 0) return;
      const age = time - revealAt;
      actor.visible = age >= 0;
      warmLight.visible = actor.visible;
      if (!actor.visible) return;
      mixer.update(lastTime === null ? 0 : Math.min(0.08, Math.max(0, time - lastTime)));
      lastTime = time;
      const greeting = Math.max(0, 1 - (time - greetingAt) / 2.4);
      surveyAction?.setEffectiveWeight(0.70 - greeting * 0.24);
      walkAction?.setEffectiveWeight(0.30 + greeting * 0.24);
      const towardPlayer = Math.atan2(player.x - x, player.z - z);
      actor.rotation.y = towardPlayer + 0.58 + Math.sin(time * 0.42) * 0.12;
      body.position.x = -center.x * scale + Math.sin(time * 0.55) * 0.11;
      body.position.z = -center.z * scale + Math.sin(time * 0.73) * 0.09;
    },
  };
}
