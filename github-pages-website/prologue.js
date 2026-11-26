import * as THREE from 'three';
import {followPage,pageCurl} from './book-motion.js?build=fluid-book-72';
import {letterFlight} from './letter-flight.js?build=fluid-book-72';

const clamp = THREE.MathUtils.clamp;
const smooth = (a, b, t) => {
  const x = clamp((t - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
};

function makePaperTexture(kind) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 704;
  const c = canvas.getContext('2d');
  const cover = kind === 'cover';
  const fill = c.createLinearGradient(0, 0, 512, 704);
  if (cover) {
    fill.addColorStop(0, '#293334');
    fill.addColorStop(0.48, '#182829');
    fill.addColorStop(1, '#33403a');
  } else {
    fill.addColorStop(0, '#e7d8b9');
    fill.addColorStop(0.26, '#fff8e9');
    fill.addColorStop(0.8, '#f8ecd4');
    fill.addColorStop(1, '#dcc8a5');
  }
  c.fillStyle = fill;
  c.fillRect(0, 0, 512, 704);
  // The flecks and ruled margins are drawn into the material, not over the whole screen.
  for (let i = 0; i < 2100; i++) {
    const x = (i * 137.21) % 512;
    const y = (i * 281.73) % 704;
    c.fillStyle = cover ? 'rgba(215,196,142,0.035)' : 'rgba(119,87,47,0.035)';
    c.fillRect(x, y, 1 + i % 3, 1 + i % 2);
  }
  if (cover) {
    c.strokeStyle = '#a58e61';
    c.lineWidth = 4;
    c.strokeRect(38, 40, 436, 624);
    c.lineWidth = 1;
    c.strokeRect(51, 53, 410, 598);
    c.fillStyle = '#d5bc88';
    c.font = 'bold 78px KaiTi, STKaiti, SimSun, serif';
    c.textAlign = 'center';
    ['聊', '斋', '志', '异'].forEach((char, i) => c.fillText(char, 267, 211 + i * 90));
    c.font = '27px KaiTi, STKaiti, SimSun, serif';
    c.fillText('蒲松龄 著', 383, 601);
    c.fillStyle = '#9e4c3e';
    c.fillRect(98, 551, 55, 55);
    c.fillStyle = '#f1dcb7';
    c.font = '23px KaiTi, STKaiti, SimSun, serif';
    c.fillText('花坞', 125, 586);
  } else {
    c.strokeStyle = '#a38c69';
    c.lineWidth = 2;
    c.strokeRect(31, 31, 450, 641);
    c.strokeStyle = 'rgba(141,111,71,.4)';
    c.lineWidth = 1;
    c.strokeRect(42, 43, 428, 617);
    const lines = [
      '窃闻山中有草名笑矣乎',
      '嗅之则笑不可止房中植',
      '此一种则合欢忘忧并无',
      '颜色矣若解语花正嫌其',
      '作态耳空翠爽肌间以修',
      '竹门前皆丝柳夹道红花',
    ];
    c.textAlign = 'center';
    c.fillStyle = '#514636';
    c.font = '27px KaiTi, STKaiti, SimSun, serif';
    lines.forEach((line, col) => [...line].forEach((char, row) => {
      c.fillText(char, 430 - col * 72, 97 + row * 49);
    }));
    c.fillStyle = '#a56353';
    c.fillRect(62, 560, 38, 38);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function applyAntiqueBookReference(coverTexture, paperTexture) {
  const image = new Image();
  image.onload = () => {
    const coverCanvas = coverTexture.image;
    const coverInk = coverCanvas.getContext('2d');
    coverInk.clearRect(0, 0, 512, 704);
    // The supplied photograph's left leaf carries the original title page.
    coverInk.drawImage(image, 0, 170, 650, 1020, 0, 0, 512, 704);
    coverInk.fillStyle = 'rgba(77,53,29,.06)';
    coverInk.fillRect(0, 0, 512, 704);
    coverTexture.needsUpdate = true;

    const pageCanvas = paperTexture.image;
    const pageInk = pageCanvas.getContext('2d');
    pageInk.clearRect(0, 0, 512, 704);
    // The weathered blank leaf becomes the substrate for handwritten columns.
    pageInk.drawImage(image, 665, 0, 650, 1280, 0, 0, 512, 704);
    pageInk.fillStyle = 'rgba(240,224,191,.24)';
    pageInk.fillRect(0, 0, 512, 704);
    pageInk.strokeStyle = 'rgba(66,49,35,.64)';
    pageInk.lineWidth = 2.4;
    pageInk.strokeRect(31, 30, 450, 643);
    pageInk.strokeStyle = 'rgba(75,58,40,.23)';
    pageInk.lineWidth = 1;
    for (let col = 0; col < 6; col++) {
      const x = 427 - col * 67;
      pageInk.beginPath();
      pageInk.moveTo(x - 29, 43);
      pageInk.lineTo(x - 29, 660);
      pageInk.stroke();
    }
    const columns = [
      '窃闻山中有草名笑矣乎',
      '嗅之则笑不可止',
      '房中植此一种则合欢',
      '忘忧并无颜色矣',
      '若解语花正嫌其作态耳',
      '闻树头苏苏有声',
    ];
    pageInk.textAlign = 'center';
    pageInk.textBaseline = 'middle';
    pageInk.fillStyle = 'rgba(45,37,30,.9)';
    pageInk.font = '31px "华文行楷", "STXingkai", "KaiTi", serif';
    columns.forEach((line, col) => [...line].forEach((char, row) => {
      pageInk.fillText(char, 431 - col * 67, 82 + row * 48);
    }));
    pageInk.fillStyle = 'rgba(134,57,42,.78)';
    pageInk.fillRect(68, 552, 38, 38);
    pageInk.fillStyle = '#efe0bd';
    pageInk.font = '18px "华文行楷", "KaiTi", serif';
    pageInk.fillText('婴', 87, 571);
    paperTexture.needsUpdate = true;
  };
  image.src = './assets/liaozhai-reference-book.jpg';
}

function makeGlyphTexture(char) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const c = canvas.getContext('2d');
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = '#fff';
  c.font = '96px "华文行楷", "STXingkai", KaiTi, serif';
  c.fillText(char, 64, 68);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeInkTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const c = canvas.getContext('2d');
  for (let i = 0; i < 90; i++) {
    const angle = i * 2.39996;
    const radius = Math.sqrt(i / 90) * (48 + 11 * Math.sin(i * 0.91));
    const x = 128 + Math.cos(angle) * radius;
    const y = 128 + Math.sin(angle) * radius * 0.76;
    const size = 14 + (i * 17 % 18);
    const plume = c.createRadialGradient(x, y, 1, x, y, size);
    plume.addColorStop(0, 'rgba(34,40,35,0.16)');
    plume.addColorStop(1, 'rgba(34,40,35,0)');
    c.fillStyle = plume;
    c.fillRect(x - size, y - size, size * 2, size * 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createPrologue(renderer, onEnter) {
  const ui = document.querySelector('.prologue-ui');
  const uiTitle = ui.querySelector('.prologue-instruction');
  const uiSub = ui.querySelector('.prologue-sub');
  const world = new THREE.Scene();
  world.background = new THREE.Color('#030405');
  world.add(new THREE.AmbientLight('#f8e5c8', 1.5));
  const key = new THREE.DirectionalLight('#f7d8a4', 2.9);
  key.position.set(-3.3, 5.0, 7.0);
  world.add(key);
  const rim = new THREE.DirectionalLight('#b1c6c2', 1.3);
  rim.position.set(4, -1, -3);
  world.add(rim);
  const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.1, 80);
  camera.position.set(0, 0, 8.4);

  const book = new THREE.Group();
  book.rotation.set(-0.10, -0.08, -0.035);
  world.add(book);
  const paperTexture = makePaperTexture('page');
  const coverTexture = makePaperTexture('cover');
  applyAntiqueBookReference(coverTexture, paperTexture);
  const cloth = new THREE.MeshStandardMaterial({ color: '#8b7254', roughness: 0.95 });
  const paperEdge = new THREE.MeshStandardMaterial({ color: '#e2d2ae', roughness: 0.95 });
  const paperFront = new THREE.MeshBasicMaterial({ map: paperTexture, side: THREE.DoubleSide });
  const coverFront = new THREE.MeshBasicMaterial({ map: coverTexture, side: THREE.DoubleSide });
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.48, 3.17, 0.13), cloth);
  back.position.z = -0.08;
  book.add(back);
  const block = new THREE.Mesh(new THREE.BoxGeometry(2.32, 3.02, 0.18), paperEdge);
  block.position.z = 0.045;
  book.add(block);
  const rightPage = new THREE.Mesh(new THREE.PlaneGeometry(2.27, 2.96), paperFront);
  rightPage.position.z = 0.142;
  book.add(rightPage);
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.16, 0.26), cloth);
  spine.position.set(-1.20, 0, 0.03);
  book.add(spine);
  for (let i = 0; i < 3; i++) {
    const hinge = new THREE.Group();
    hinge.position.set(-1.15, 0, 0.155 + i * 0.012);
    const geometry = new THREE.PlaneGeometry(2.28, 2.96, 20, 14);
    geometry.translate(1.14, 0, 0);
    const position = geometry.attributes.position;
    for (let j = 0; j < position.count; j++) {
      const u = position.getX(j) / 2.28;
      position.setZ(j, 0.045 * Math.sin(Math.PI * u) * (1 - 0.15 * i));
    }
    geometry.computeVertexNormals();
    hinge.add(new THREE.Mesh(geometry, paperFront));
    hinge.userData.index = i;
    book.add(hinge);
    hinge.userData.isPage = true;
  }
  const coverHinge = new THREE.Group();
  coverHinge.position.set(-1.20, 0, 0.215);
  const coverPanel = new THREE.Mesh(new THREE.BoxGeometry(2.47, 3.16, 0.075), cloth);
  coverPanel.position.x = 1.235;
  coverHinge.add(coverPanel);
  const coverArt = new THREE.Mesh(new THREE.PlaneGeometry(2.44, 3.13), coverFront);
  coverArt.position.set(1.235, 0, 0.043);
  coverHinge.add(coverArt);
  book.add(coverHinge);

  const dustCount = 180;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustOrigins = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const a = i * 2.39996, radius = 1.85 + (i % 31) * 0.135;
    dustPositions[i * 3] = Math.cos(a) * radius;
    dustPositions[i * 3 + 1] = Math.sin(a * 0.64) * 2.8;
    dustPositions[i * 3 + 2] = -1.8 + (i % 13) * 0.31;
  }
  dustOrigins.set(dustPositions);
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({
    color: '#91836f', size: 0.014, transparent: true, opacity: 0.30,
    depthWrite: false, sizeAttenuation: true,
  }));
  world.add(dust);

  const pageVerse = [...'窃闻山中有草名笑矣乎嗅之则笑不可止房中植此一种则合欢忘忧并无颜色矣若解语花正嫌其作态耳'];
  const quote = Array.from({ length: pageVerse.length * 4 }, (_, i) => pageVerse[i % pageVerse.length]);
  const flightBatch=letterFlight(world,quote,makeGlyphTexture);
  const flyingLetters = quote.map((char, i) => {
    const sprite = flightBatch.letters[i];
    const pageIndex = i % pageVerse.length;
    sprite.position.set(0.78 - Math.floor(pageIndex / 11) * 0.31, 1.04 - (pageIndex % 11) * 0.215, 0.48);
    sprite.scale.set(0.17, 0.17, 1);
    return sprite;
  });
  const ink = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.58), new THREE.MeshBasicMaterial({
    map: makeInkTexture(), transparent: true, opacity: 0, depthWrite: false,
  }));
  ink.position.set(0.4, 0.5, 0.171);
  book.add(ink);

  let state = 'closed';
  const introStart = performance.now() / 1000;
  let stateAt = introStart;
  let progress = 0;
  let targetProgress=0,lastUpdate=introStart;
  let lastBentProgress=-1;
  let dragging = false;
  let dragX = 0;
  let dragProgress = 0;
  let viewEntered = false;

  function setState(next, now) {
    state = next;
    stateAt = now;
  }
  function pointerDown(event) {
    if (state !== 'closed' && state !== 'opening') return false;
    const x = event.clientX / innerWidth, y = event.clientY / innerHeight;
    if (x < 0.25 || x > 0.78 || y < 0.08 || y > 0.91) return false;
    dragging = true;
    dragX = event.clientX;
    dragProgress = progress;
    if (state === 'closed') setState('opening', performance.now() / 1000);
    renderer.domElement.setPointerCapture(event.pointerId);
    return true;
  }
  function pointerMove(event) {
    if (!dragging) return;
    targetProgress = clamp(dragProgress + (dragX - event.clientX) / Math.min(innerWidth * 0.32, 430), 0, 1);
  }
  function pointerUp() {
    if (!dragging) return;
    dragging = false;
    targetProgress=targetProgress>=.16?1:0;
    setState('settling',performance.now()/1000);
  }
  function update(time) {
    let elapsed = time - stateAt;
    const dt=Math.max(0,time-lastUpdate);lastUpdate=time;
    if(state==='opening'||state==='settling')progress=followPage(progress,targetProgress,dt);
    if(state==='settling'&&Math.abs(progress-targetProgress)<.002){
      progress=targetProgress;setState(progress===1?'observing':'closed',time);elapsed=0;
      if(progress===1){uiTitle.textContent='书页已启 · 请凝望墨迹';uiSub.textContent='文字将从纸上生长为山谷';}
    }
    if (state === 'closed') {
      book.scale.setScalar(smooth(0.8, 2.15, elapsed));
      if (elapsed > 0.8) document.body.classList.add('prologue-revealed');
    } else {
      book.scale.setScalar(1);
    }
    coverHinge.rotation.y = -Math.PI * progress;
    for (const child of book.children) {
      if (child.userData.isPage) {
        const i = child.userData.index;
        child.rotation.y = -Math.PI * clamp((progress - 0.10 - i * 0.08) / (0.72 + i * 0.06), 0, 1) * (0.99 - i * 0.035);
        if(progress!==lastBentProgress){
          const page=child.children[0],positions=page.geometry.attributes.position;
          for(let j=0;j<positions.count;j++){const u=positions.getX(j)/2.28;positions.setZ(j,pageCurl(u,progress)*(1-.15*i));}
          positions.needsUpdate=true;page.geometry.computeVertexNormals();
        }
      }
    }
    lastBentProgress=progress;
    book.position.x = progress * 0.75;
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = dustOrigins[i * 3] + Math.sin(time * 0.21 + i * 1.19) * 0.13;
      dustPositions[i * 3 + 1] = dustOrigins[i * 3 + 1] + Math.cos(time * 0.17 + i * 0.81) * 0.11;
    }
    dustGeometry.attributes.position.needsUpdate = true;
    dust.material.opacity = 0.30 * smooth(0.8, 2.0, time - introStart);
    if (state === 'opening') {
      uiTitle.textContent = progress > 0.16 ? '墨迹醒来' : '向左缓缓翻开';
      uiSub.textContent = progress > 0.16 ? '翻开至尽处，进入南山花坞' : '书页跟随你的手势';
      ink.material.opacity = 0.67 * smooth(0.16, 0.70, progress);
      ink.scale.setScalar(1 + 2.8 * smooth(0.16, 0.94, progress));
    }
    if (state === 'observing') {
      ink.material.opacity = 0.55 + 0.08 * Math.sin(elapsed * 2.3);
      ink.scale.setScalar(3.8 + elapsed * 0.42);
      if (elapsed >= .7) {
        setState('flight', time);
        elapsed=0;
        uiTitle.textContent = '字离书页 · 化作花径';
        uiSub.textContent = '沿文字长河，进入南山';
      }
    }
    if (state === 'flight') {
      const flight = clamp(elapsed / 2.8, 0, 1);
      const worldTone = new THREE.Color('#030405');
      worldTone.lerp(new THREE.Color('#33291f'), smooth(0.64, 0.83, flight));
      worldTone.lerp(new THREE.Color('#f0e6d3'), smooth(0.82, 1, flight));
      world.background.copy(worldTone);
      book.position.y = -5.1 * smooth(0.05, 0.82, flight);
      book.scale.setScalar(1 - 0.68 * smooth(0.17, 1, flight));
      coverHinge.rotation.y = -Math.PI * (1 - smooth(0.10, 0.72, flight));
      for (const child of book.children) {
        if (child.userData.isPage) child.rotation.y *= 1 - smooth(0.10, 0.72, flight);
      }
      camera.position.z = 8.4 - 2.45 * smooth(0.20, 1, flight);
      ink.material.opacity = .55 * (1 - smooth(0.15, 0.65, flight));
      for (let i = 0; i < flyingLetters.length; i++) {
        const letter = flyingLetters[i];
        // Successive pages of verse settle into a continuous, winding flower path.
        const delay = i * 0.00155;
        const t = smooth(delay, Math.min(0.99, delay + 0.68), flight);
        const lane = (i % 9) - 4;
        const route = Math.floor(i / 9) / Math.max(1, Math.ceil(flyingLetters.length / 9) - 1);
        const pageIndex = i % pageVerse.length;
        const x0 = 0.78 - Math.floor(pageIndex / 11) * 0.31;
        const y0 = 1.04 - (pageIndex % 11) * 0.215;
        const riverX = 0.25 * Math.sin(route * 7.0 + flight * 0.35);
        const x1 = riverX + lane * (0.17 - route * 0.10);
        const y1 = -0.94 + route * 2.33;
        const z1 = 2.38 - route * 2.08;
        letter.position.set(THREE.MathUtils.lerp(x0, x1, t),
          THREE.MathUtils.lerp(y0, y1, t) + 0.035 * Math.sin(flight * 7 - route * 8) * t,
          THREE.MathUtils.lerp(0.48, z1, t));
        const s = THREE.MathUtils.lerp(0.17, 0.16 - route * 0.045, t);
        letter.scale.set(s, s, 1);
        letter.material.color.set('#bda782').lerp(new THREE.Color('#695a47'), smooth(0.79, 1, flight));
        letter.material.opacity = smooth(delay, delay + 0.19, flight) * (1 - smooth(0.95, 1, flight));
      }
      if (flight >= 1 && !viewEntered) {
        if(onEnter() !== false){
          viewEntered = true;
          setState('entered', time);
        }
      }
    }
    flightBatch.update(renderer,camera,state==='flight');
    renderer.render(world, camera);
  }
  return {
    get active() { return state !== 'entered'; },
    get state() { return state; },
    get progress(){return progress;},
    pointerDown, pointerMove, pointerUp, update,
    resize() { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); },
  };
}
