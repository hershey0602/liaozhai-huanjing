import * as THREE from 'three';

// A painted ground holds the landscape together; the moving calligraphy sits above it.
export function createWatercolorLandscape({ pathX, riverX, hills, folds }) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1536;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const px = x => (x + 55) * size / 110;
  const py = z => (z + 55) * size / 110;
  const unit = size / 110;
  let seed = 98437;
  const rnd = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);

  ctx.fillStyle = '#f4eedf';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 135; i++) {
    const x = rnd() * size, y = rnd() * size;
    const r = 48 + rnd() * 190;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, i % 3 === 0 ? 'rgba(222,196,151,0.11)' : 'rgba(252,249,237,0.22)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x-r, y-r, r*2, r*2);
  }

  function bloom(x, z, rx, rz, color, strength = 1, angle = 0) {
    ctx.save();
    ctx.translate(px(x), py(z));
    ctx.rotate(angle);
    ctx.scale(rx * unit, rz * unit);
    const g = ctx.createRadialGradient(-0.16, -0.18, 0, 0, 0, 1);
    g.addColorStop(0, color.replace('ALPHA', String(0.40 * strength)));
    g.addColorStop(0.52, color.replace('ALPHA', String(0.20 * strength)));
    g.addColorStop(1, color.replace('ALPHA', '0'));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  for (const hill of hills) {
    bloom(hill.x, hill.z, hill.rx * 1.5, hill.rz * 1.35,
      'rgba(90,125,102,ALPHA)', 0.75, hill.angle || 0);
    bloom(hill.x - hill.rx * 0.27, hill.z + hill.rz * 0.15,
      hill.rx * 0.8, hill.rz * 0.65, 'rgba(71,100,82,ALPHA)', 0.65);
    bloom(hill.x + hill.rx * 0.35, hill.z - hill.rz * 0.28,
      hill.rx * 0.85, hill.rz * 0.68, 'rgba(166,158,115,ALPHA)', 0.50);
  }
  for (const fold of folds) {
    bloom(fold.x, fold.z, fold.rx * 1.35, fold.rz,
      'rgba(102,137,110,ALPHA)', 0.9);
  }

  // Broad colored ink meadows give the close banks an uninterrupted silhouette.
  for (let z = -46; z <= 49; z += 3.4) {
    for (const side of [-1, 1]) {
      const bend = Math.sin(z * 0.27 + side) * 0.55;
      bloom(pathX(z) + side * (5.5 + bend), z,
        4.2, 4.0, 'rgba(79,121,83,ALPHA)', 1.28);
      bloom(pathX(z) + side * (8.0 + bend), z + 0.7,
        4.7, 4.2, 'rgba(105,139,99,ALPHA)', 0.85);
      bloom(riverX(z) + side * 5.5, z + 0.4,
        3.1, 3.5, 'rgba(84,126,107,ALPHA)', 0.75);
    }
  }

  // Irregular planted banks, with individual flowers visible between the ink letters.
  for (let i = 0; i < 650; i++) {
    const z = -44 + rnd() * 90;
    const river = rnd() < 0.48;
    const center = river ? riverX(z) : pathX(z);
    const side = rnd() < 0.5 ? -1 : 1;
    const x = center + side * (river ? 3.2 + rnd() * 6 : 2.4 + rnd() * 7);
    const r = 0.25 + rnd() * 1.40;
    bloom(x, z, r * 1.45, r * 0.8,
      rnd() < 0.5 ? 'rgba(47,91,66,ALPHA)' : 'rgba(105,140,102,ALPHA)',
      0.56 + rnd() * 0.40);
    if (rnd() < 0.18) {
      ctx.fillStyle = rnd() < 0.45 ? 'rgba(237,164,169,0.61)' : 'rgba(255,252,239,0.88)';
      ctx.beginPath();
      ctx.ellipse(px(x), py(z), 1.2 + rnd() * 2.5, 1 + rnd() * 2, rnd(), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function curvedChannel(center, z0, z1, color, width, alpha = 1, offset = 0) {
    ctx.beginPath();
    for (let z = z0, first = true; z >= z1; z -= 0.30) {
      const x = center(z) + offset;
      if (first) { ctx.moveTo(px(x), py(z)); first = false; }
      else ctx.lineTo(px(x), py(z));
    }
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width * unit;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // A broad, pale spring with blue mineral pigments and flowing brush contours.
  curvedChannel(riverX, 49, -42, '#9caeaa', 5.7, 0.24);
  curvedChannel(riverX, 49, -42, '#a8d6d9', 5.1, 0.51);
  curvedChannel(riverX, 49, -42, '#e8f0e9', 4.2, 0.92);
  curvedChannel(riverX, 49, -42, '#c7e5e8', 3.35, 0.43);
  for (let lane = -4; lane <= 4; lane++) {
    const offset = lane * 0.40;
    curvedChannel(z => riverX(z) + 0.07 * Math.sin(z * 0.71 + lane),
      46, -41, lane % 2 ? '#6d9da4' : '#d9eceb', 0.045 + (lane % 3) * 0.025,
      lane % 2 ? 0.28 : 0.57, offset);
  }

  // The entrance path is a complete painted trail, not just four rows of glyphs.
  curvedChannel(pathX, 49, -45, '#958c77', 4.5, 0.30);
  curvedChannel(pathX, 49, -45, '#e1d7c1', 4.15, 0.84);
  curvedChannel(pathX, 49, -45, '#f6f0e2', 3.52, 0.96);
  for (let lane = -4; lane <= 4; lane++) {
    curvedChannel(z => pathX(z) + 0.04 * Math.sin(z * 1.15 + lane),
      47, -44, lane % 2 ? '#c2b6a0' : '#fff9ec', 0.025 + (lane % 3) * 0.018,
      0.20, lane * 0.38);
  }
  for (let z = 45; z > -43; z -= 0.82) {
    const x = pathX(z);
    const tilt = Math.atan2(pathX(z + 0.2) - pathX(z - 0.2), 0.4);
    ctx.save(); ctx.translate(px(x), py(z)); ctx.rotate(tilt);
    ctx.strokeStyle = 'rgba(125,115,95,0.19)'; ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-1.4 * unit, (rnd() - 0.5) * 2);
    ctx.lineTo(1.4 * unit, (rnd() - 0.5) * 2);
    ctx.stroke(); ctx.restore();
  }

  for (let i = 0; i < 130; i++) {
    const z = -40 + rnd() * 86;
    const side = rnd() < 0.5 ? -1 : 1;
    const x = riverX(z) + side * (2.7 + rnd() * 2.0);
    const width = 0.20 + rnd() * 0.52;
    ctx.save(); ctx.translate(px(x), py(z)); ctx.rotate(rnd() * 1.8);
    const stone = ctx.createRadialGradient(-width * unit * 0.18, 0, 1,
      0, 0, width * unit * 1.25);
    stone.addColorStop(0, 'rgba(111,114,104,0.38)');
    stone.addColorStop(0.62, 'rgba(146,150,134,0.22)');
    stone.addColorStop(1, 'rgba(146,150,134,0)');
    ctx.fillStyle = stone;
    ctx.beginPath(); ctx.ellipse(0, 0, width * unit * 1.25,
      width * unit * 0.64, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Fine rice-paper grain merges the washes without obscuring the lettering.
  for (let i = 0; i < 19000; i++) {
    const x = rnd() * size, y = rnd() * size;
    ctx.fillStyle = i % 4 === 0 ? 'rgba(101,91,70,0.055)' : 'rgba(255,255,247,0.10)';
    ctx.fillRect(x, y, 0.6 + rnd() * 1.5, 0.6 + rnd() * 1.4);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
  return texture;
}

export function addWatercolorShrubs(scene, { ground, pathX, riverX }) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  let seed = 77193;
  const rnd = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
  // Each plane is a soft painted thicket, crossed with another plane for volume.
  for (let i = 0; i < 380; i++) {
    const x = 22 + rnd() * 215, y = 73 + rnd() * 151;
    const spread = Math.max(0.04, 1 - ((x - 128) / 126) ** 2);
    if (y < 82 + (1 - spread) * 100 - rnd() * 30) continue;
    const length = 3 + rnd() * 13;
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.58 + rnd() * 1.16);
    ctx.fillStyle = ['rgba(49,79,58,0.66)', 'rgba(82,116,79,0.64)',
      'rgba(132,149,104,0.56)', 'rgba(46,91,75,0.58)'][i % 4];
    ctx.beginPath(); ctx.ellipse(0, 0, length, 1.5 + rnd() * 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  for (let i = 0; i < 44; i++) {
    const x = 26 + rnd() * 204, y = 110 + rnd() * 100;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(241,165,173,0.86)' : 'rgba(255,251,233,0.91)';
    for (let p = 0; p < 5; p++) {
      const angle = p * Math.PI * 2 / 5;
      ctx.beginPath(); ctx.ellipse(x + Math.cos(angle) * 2.6, y + Math.sin(angle) * 2.6,
        2.7, 1.7, angle, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(180,124,72,0.8)'; ctx.fillRect(x - 0.7, y - 0.7, 1.4, 1.4);
  }
  ctx.globalCompositeOperation = 'destination-in';
  const edge = ctx.createRadialGradient(128, 185, 18, 128, 170, 124);
  edge.addColorStop(0, 'rgba(255,255,255,1)');
  edge.addColorStop(0.65, 'rgba(255,255,255,0.88)');
  edge.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = edge; ctx.fillRect(0, 0, 256, 256);
  ctx.globalCompositeOperation = 'source-over';
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true,
    depthWrite: false, side: THREE.DoubleSide, opacity: 0.83, alphaTest: 0.035 });
  const plants = [];
  for (let i = 0; i < 155; i++) {
    const z = -39 + rnd() * 85;
    const byWater = i % 3 === 0;
    const center = byWater ? riverX(z) : pathX(z);
    const side = i % 2 ? 1 : -1;
    const x = center + side * ((byWater ? 3.1 : 2.7) + rnd() * 3.4);
    if (Math.abs(x - pathX(z)) < 2.25 || Math.abs(x - riverX(z)) < 2.55) continue;
    plants.push({ x, z, height: 0.32 + rnd() * 0.58, angle: rnd() * Math.PI });
  }
  const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), material, plants.length * 2);
  const dummy = new THREE.Object3D();
  plants.forEach((plant, i) => {
    for (let side = 0; side < 2; side++) {
      dummy.position.set(plant.x, ground(plant.x, plant.z) + plant.height * 0.47, plant.z);
      dummy.rotation.set(0, plant.angle + side * Math.PI * 0.5, 0);
      dummy.scale.set(plant.height * (1.15 + 0.45 * Math.sin(i * 1.77)), plant.height, 1);
      dummy.updateMatrix(); mesh.setMatrixAt(i * 2 + side, dummy.matrix);
    }
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  scene.add(mesh);
}

export function addPaintedHorizons(scene) {
  const texture = new THREE.TextureLoader().load('./assets/watercolor-mountains.png');
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map:texture, transparent:true,
    opacity:0.74, depthWrite:false, side:THREE.DoubleSide, fog:false,
    alphaTest:0.015 });
  for (const [x,z,angle] of [[0,-82,0],[0,82,Math.PI],[-82,0,Math.PI/2],[82,0,-Math.PI/2]]) {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(158,66), material);
    plane.position.set(x,20,z); plane.rotation.y=angle;
    plane.renderOrder=-4; scene.add(plane);
  }
}

export function addPaintedStream(scene, { ground, riverX }) {
  const positions=[], uvs=[], indices=[];
  const rows=340;
  for(let i=0;i<=rows;i++){
    const z=47-i*90/rows;
    for(let j=0;j<=10;j++){
      const side=j/10*2-1;
      const x=riverX(z)+side*2.38;
      positions.push(x,ground(x,z)+0.064,z);
      uvs.push(j/10,i/rows);
      if(i<rows&&j<10){const a=i*11+j;
        indices.push(a,a+11,a+1,a+1,a+11,a+12);}
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  const material=new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},transparent:true,
    depthWrite:false,side:THREE.DoubleSide,
    vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform float uTime; varying vec2 vUv;
      void main(){float bank=smoothstep(0.0,0.19,vUv.x)*(1.0-smoothstep(0.81,1.0,vUv.x));
      float current=sin(vUv.y*112.0-uTime*0.72+sin(vUv.x*15.0)*0.45);
      float ripple=sin(vUv.y*210.0-uTime*0.41+vUv.x*21.0);
      vec3 blue=mix(vec3(0.57,0.77,0.79),vec3(0.86,0.94,0.91),
        clamp(0.55+current*0.17+ripple*0.08,0.0,1.0));
      float opacity=bank*(0.28+0.13*current+0.06*ripple);
      gl_FragColor=vec4(blue,opacity);}`});
  const stream=new THREE.Mesh(geometry,material);stream.renderOrder=0;
  scene.add(stream);return material;
}
