import {viewSize,viewPointer,viewRect} from './view-viewport.js?build=wechat-landscape-75';
import * as THREE from 'three';
import {treeBearing,guideMessage,walkFrameDistance,VALLEY_TAP_STEP} from './tree-navigation.js?build=wechat-landscape-75';
import {batchStaticInk} from './static-ink-batches.js?build=wechat-landscape-75';
import {dragView} from './view-drag.js?build=wechat-landscape-75';
import {opening,yieldToOpening} from './opening.js?build=wechat-landscape-75';
import { createPrologue } from './prologue.js?build=wechat-landscape-75';
import { createYingningCharacter } from './yingning-fox.js?build=geometric-fox-56';
import { createYingningStory } from './yingning-story.js?build=wechat-landscape-75';
import { createWatercolorLandscape, addWatercolorShrubs, addPaintedHorizons,
  addPaintedStream, addPaintedPath } from './watercolor-landscape.js?build=wechat-landscape-75';

const revision = new URLSearchParams(location.search).get('rev') ?? 'source-verse-2';
const prototypeInk = revision === 'layered-ink-prototype';
const expandedInk = revision === 'layered-ink-valley' || revision === 'source-verse-2';
const layeredInk = prototypeInk || expandedInk;
const stage = document.getElementById('stage');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#f0e6d3');
if (expandedInk) {
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 1024;
  skyCanvas.height = 512;
  const skyInk = skyCanvas.getContext('2d');
  const paperSky = skyInk.createLinearGradient(0, 0, 0, 512);
  paperSky.addColorStop(0, '#eae0cf');
  paperSky.addColorStop(0.55, '#f3ead9');
  paperSky.addColorStop(1, '#f6eddb');
  skyInk.fillStyle = paperSky;
  skyInk.fillRect(0, 0, 1024, 512);
  for (const [x, y, radius, tone] of [
    [145, 90, 280, 'rgba(188,163,123,0.065)'],
    [860, 130, 340, 'rgba(198,173,136,0.055)'],
    [500, 370, 420, 'rgba(222,190,146,0.065)'],
  ]) {
    const bloom = skyInk.createRadialGradient(x, y, 0, x, y, radius);
    bloom.addColorStop(0, tone);
    bloom.addColorStop(1, 'rgba(255,255,255,0)');
    skyInk.fillStyle = bloom;
    skyInk.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  const skyTexture = new THREE.CanvasTexture(skyCanvas);
  skyTexture.colorSpace = THREE.SRGBColorSpace;
  scene.background = skyTexture;
}
scene.fog = new THREE.Fog('#f0e6d3', 35, 100);
scene.add(new THREE.AmbientLight('#fff5e6', 0.86));
const hillsideSun = new THREE.DirectionalLight('#fff3df', 0.48);
hillsideSun.position.set(-17, 24, 13);
scene.add(hillsideSun);
const camera = new THREE.PerspectiveCamera(60, viewSize().width / viewSize().height, 0.05, 155);
const renderer = opening?.renderer ?? new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(viewSize().width, viewSize().height);
renderer.outputColorSpace = THREE.SRGBColorSpace;
if(!opening)stage.appendChild(renderer.domElement);
await yieldToOpening();

let seed = 63019;
function random() { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; }
function between(a, b) { return a + (b - a) * random(); }
function choose(items) { return items[Math.floor(random() * items.length)]; }
// A sequence of alternating turns keeps the next section of the flower path out of sight.
const pathKnots = [
  [44, -5.0], [32, -8.0], [18, -3.8], [4, -8.2],
  [-10, -4.2], [-24, -8.1], [-44, -5.2],
];
function pathX(z) {
  let i = 0;
  while (i < pathKnots.length - 2 && z < pathKnots[i + 1][0]) i++;
  const p0 = pathKnots[Math.max(0, i - 1)][1];
  const p1 = pathKnots[i][1], p2 = pathKnots[i + 1][1];
  const p3 = pathKnots[Math.min(pathKnots.length - 1, i + 2)][1];
  const t = THREE.MathUtils.clamp((pathKnots[i][0] - z) / (pathKnots[i][0] - pathKnots[i + 1][0]), 0, 1);
  return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
    + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
}
const scenicFolds = [
  { z: 20, side: -1, offset: 6.2, rise: 4.25, rx: 6.1, rz: 10.2 },
  { z: 5, side: 1, offset: 4.9, rise: 2.75, rx: 3.8, rz: 6.2 },
  { z: -10, side: -1, offset: 5.9, rise: 3.7, rx: 5.25, rz: 8.5 },
  { z: -24, side: 1, offset: 5.2, rise: 3.05, rx: 4.35, rz: 7.4 },
];
for (const fold of scenicFolds) fold.x = pathX(fold.z) + fold.side * fold.offset;
// Broad, rotated hills join the close bends into a varied valley rather than four matching mounds.
const rollingHills = [
  { x: -21, z: 37, rx: 12.0, rz: 13.5, rise: 3.9, angle: -0.32 },
  { x: 19, z: 37, rx: 8.0, rz: 10.0, rise: 2.1, angle: 0.24 },
  { x: -22, z: 18, rx: 10.5, rz: 16.0, rise: 4.9, angle: 0.33 },
  { x: 19, z: 20, rx: 12.8, rz: 9.0, rise: 3.15, angle: -0.27 },
  { x: -20, z: 0, rx: 7.2, rz: 9.5, rise: 2.35, angle: -0.48 },
  { x: 20, z: 1, rx: 10.8, rz: 14.5, rise: 4.45, angle: 0.35 },
  { x: -22, z: -17, rx: 12.5, rz: 13.0, rise: 4.25, angle: -0.23 },
  { x: 17, z: -19, rx: 7.5, rz: 9.5, rise: 2.5, angle: 0.49 },
  { x: -20, z: -36, rx: 8.7, rz: 9.0, rise: 2.6, angle: 0.21 },
  { x: 21, z: -34, rx: 11.0, rz: 12.0, rise: 3.65, angle: -0.39 },
  { x: 13.8, z: -35.5, rx: 4.8, rz: 7.0, rise: 4.8, angle: -0.12 },
];
function valleyBase(x, z) {
  const valleySide = 1.03 * THREE.MathUtils.smoothstep(Math.abs(x - pathX(z) - 2.0), 5.5, 22);
  return valleySide + 0.09 * Math.sin(x * 0.31) + 0.11 * Math.cos(z * 0.19)
    + 0.055 * Math.sin(x * 0.73 + z * 0.48);
}
function rawGround(x, z) {
  let foldHeight = 0;
  for (const fold of scenicFolds) {
    const dx = (x - fold.x) / fold.rx, dz = (z - fold.z) / fold.rz;
    foldHeight = Math.max(foldHeight, fold.rise * Math.exp(-1.55 * (dx * dx + dz * dz)));
  }
  let broadHeight = 0;
  for (const hill of rollingHills) {
    const cosine = Math.cos(hill.angle), sine = Math.sin(hill.angle);
    const u = (x - hill.x) * cosine + (z - hill.z) * sine;
    const v = (z - hill.z) * cosine - (x - hill.x) * sine;
    const main = Math.exp(-1.28 * (u / hill.rx) ** 2 - 1.7 * (v / hill.rz) ** 2);
    const shoulder = Math.exp(-2.1 * ((u - hill.rx * 0.63) / hill.rx) ** 2
      - 2.6 * ((v + hill.rz * 0.3) / hill.rz) ** 2);
    broadHeight = Math.max(broadHeight, hill.rise * (main + 0.17 * shoulder));
  }
  const pathCut = THREE.MathUtils.smoothstep(Math.abs(x - pathX(z)), 1.35, 4.2);
  const waterCut = THREE.MathUtils.smoothstep(Math.abs(x - riverX(z)), 1.8, 4.0);
  const relief = (Math.max(foldHeight, broadHeight) + 0.13 * Math.min(foldHeight, broadHeight)) * pathCut * waterCut;
  return valleyBase(x, z) + relief;
}
// The visible watercolor ground, tree roots and walking camera share one surface.
// Level the two courtyards and distant cottage pads within the surrounding hills.
function ground(x, z) {
  const height = rawGround(x, z);
  if (!expandedInk) return height;
  const gardenX = THREE.MathUtils.smoothstep(x, -24, -20)
    * (1 - THREE.MathUtils.smoothstep(x, -3, 1));
  const gardenZ = THREE.MathUtils.smoothstep(-z, 17, 21)
    * (1 - THREE.MathUtils.smoothstep(-z, 49, 53));
  let level = gardenX * gardenZ;
  for (const [cx, cz, inner, outer] of [
    [6.4, -35.6, 3.7, 6.9], [-22.5, -35.0, 3.7, 7.2],
  ]) {
    const distance = Math.hypot(x - cx, z - cz);
    level = Math.max(level, 1 - THREE.MathUtils.smoothstep(distance, inner, outer));
  }
  return THREE.MathUtils.lerp(height, 0.08, level);
}
function riverX(z) { return 1.65 + 0.042 * z + 1.95 * Math.sin(z * 0.115 + 0.85) + 0.38 * Math.sin(z * 0.28); }

// The same excerpt quoted in the design document supplies the landscape's ink.
const sourceSentences = [
  '窃闻山中有草，名「笑矣乎」，嗅之则笑不可止。',
  '房中植此一种，则合欢、忘忧，并无颜色矣。',
  '若解语花，正嫌其作态耳。',
];
const originalText = sourceSentences.join('');
const indices = Object.create(null);
function nextLetter(stream) {
  indices[stream] = (indices[stream] || 0) + 1;
  return originalText[(indices[stream] - 1) % originalText.length];
}
const sourceInk = {
  water: [...'乱山合沓空翠爽肌寂无人行止有鸟道'],
  cascade: [...'空翠爽肌遥望谷底'],
  foliage: [...'丛花乱树中花木四合其所'],
  blossom: [...'墙内桃杏犹繁夹道红花'],
  willow: [...'门前皆丝柳'],
  bamboo: [...'间以修竹'],
  grass: [...'细草铺毡杨花糁迳'],
};
function inkLetter(phrase, index) {
  return phrase[((index % phrase.length) + phrase.length) % phrase.length];
}

const glyphs = new Map();
function glyphTexture(char) {
  if (glyphs.has(char)) return glyphs.get(char);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, 128, 128);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#ffffff';
  context.font = '98px KaiTi, STKaiti, Noto Serif CJK SC, SimSun, serif';
  context.fillText(char, 64, 66);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  glyphs.set(char, texture);
  return texture;
}

const buckets = new Map();
const colorCache = new Map();
function put(char, x, y, z, color, size = 0.3, drift = false) {
  const motion = drift === true ? 'river' : (drift || 'still');
  const key = char + ':' + motion;
  if (!buckets.has(key)) buckets.set(key, { char, motion, positions: [], colors: [], sizes: [] });
  const bucket = buckets.get(key);
  bucket.positions.push(x, y, z);
  bucket.sizes.push(size * (size >= 0.5 ? 0.70 : 0.55));
  if (!colorCache.has(color)) colorCache.set(color, new THREE.Color(color));
  const c = colorCache.get(color);
  bucket.colors.push(c.r, c.g, c.b);
}

const blue = ['#4d8094', '#6397a7', '#73aabb', '#568b9d', '#7bb2be'];

// A restrained sepia wash varies across the hills; the spring fades into pale paper.
const landGeometry = new THREE.PlaneGeometry(110, 110, 176, 176);
const landPositions = landGeometry.attributes.position;
const landColors = [];
const darkPaper = new THREE.Color(expandedInk ? '#dcd1bc' : '#d8c6ae');
const lightPaper = new THREE.Color(expandedInk ? '#f3ead8' : '#f3eadc');
const pathPaper = new THREE.Color('#f6eddb');
const bankPaper = new THREE.Color(expandedInk ? '#e5dfce' : '#ede2d2');
const streamPaper = new THREE.Color(expandedInk ? '#f5eedf' : '#fcf9f2');
const meadowPaper = new THREE.Color('#c4c3a9');
const paperColor = new THREE.Color();
const waterColor = new THREE.Color();
for (let i = 0; i < landPositions.count; i++) {
  const x = landPositions.getX(i), z = -landPositions.getY(i);
  const height = ground(x, z);
  landPositions.setZ(i, height - 0.13);
  const wash = THREE.MathUtils.clamp(0.59 + 0.15 * Math.sin(x * 0.14 + z * 0.07)
    + 0.12 * Math.cos(z * 0.19 - x * 0.05)
    + 0.035 * Math.sin(x * 0.72 + z * 0.54) * Math.cos(z * 0.48 - x * 0.37)
    - 0.045 * height, 0.18, 0.92);
  paperColor.copy(darkPaper).lerp(lightPaper, wash);
  if (expandedInk) {
    const meadowWash = THREE.MathUtils.clamp(0.12
      + 0.045 * Math.sin(x * 0.19 + z * 0.12)
      + 0.035 * Math.cos(x * 0.34 - z * 0.22)
      - 0.028 * height, 0.04, 0.24);
    paperColor.lerp(meadowPaper, meadowWash);
  }
  const pathNarrowness = expandedInk ? THREE.MathUtils.smoothstep(z, -16, 8) : 0;
  const pathFade = 1 - THREE.MathUtils.smoothstep(Math.abs(x - pathX(z)),
    1.0 - pathNarrowness * 0.48, 3.0 - pathNarrowness * 0.95);
  paperColor.lerp(pathPaper, pathFade * 0.72);
  const fromStream = Math.abs(x - riverX(z));
  const streamFade = (1 - THREE.MathUtils.smoothstep(fromStream, 0.9, 3.45))
    * THREE.MathUtils.smoothstep(z, expandedInk ? -43 : -34, expandedInk ? -39 : -30);
  waterColor.copy(bankPaper).lerp(streamPaper, 1 - THREE.MathUtils.smoothstep(fromStream, 0.45, 2.9));
  paperColor.lerp(waterColor, streamFade);
  landColors.push(paperColor.r, paperColor.g, paperColor.b);
}
landGeometry.setAttribute('color', new THREE.Float32BufferAttribute(landColors, 3));
// The hill shape is only a nearly invisible scaffold. Its volume is drawn by upright ink columns.
const hillShellGeometry = landGeometry.clone();
hillShellGeometry.rotateX(-Math.PI / 2);
hillShellGeometry.computeVertexNormals();
const hillShell = new THREE.Mesh(hillShellGeometry, new THREE.MeshBasicMaterial({
  color: expandedInk ? '#b7b29b' : '#e5d9c8',
  transparent: true, opacity: expandedInk ? 0.095 : 0.035,
  depthWrite: false, side: THREE.FrontSide,
}));
hillShell.renderOrder = -1;
scene.add(hillShell);
for (let i = 0; i < landPositions.count; i++) {
  landPositions.setZ(i, expandedInk ? landPositions.getZ(i) + 0.15 : -0.17);
}
landGeometry.rotateX(-Math.PI / 2);
landGeometry.computeVertexNormals();
if (expandedInk) {
  const paperBase = landGeometry.clone();
  const basePositions = paperBase.attributes.position;
  for (let i = 0; i < basePositions.count; i++) basePositions.setY(i, -0.17);
  basePositions.needsUpdate = true;
  paperBase.computeVertexNormals();
  scene.add(new THREE.Mesh(paperBase, new THREE.MeshBasicMaterial({
    vertexColors: true, side: THREE.DoubleSide,
  })));
}
await yieldToOpening();
const watercolorGround = new THREE.Mesh(landGeometry, new THREE.MeshBasicMaterial({
  vertexColors: !expandedInk,
  map: expandedInk ? createWatercolorLandscape({ pathX, riverX,
    hills: rollingHills, folds: scenicFolds }) : null,
  side: THREE.DoubleSide,
  transparent: expandedInk, opacity: expandedInk ? 0.97 : 1,
  depthWrite: !expandedInk,
}));
watercolorGround.renderOrder = expandedInk ? -2 : 0;
scene.add(watercolorGround);
let paintedStreamMaterial = null;
let paintedPathMaterial = null;
if (expandedInk) {
  addPaintedHorizons(scene);
  paintedStreamMaterial = addPaintedStream(scene, { ground, riverX,
    verse: sourceInk.water + sourceInk.cascade });
  paintedPathMaterial = addPaintedPath(scene, { ground, pathX,
    verse: sourceSentences.join('') });
  addWatercolorShrubs(scene, { ground, pathX, riverX });
}

// The older scattered-ground study remains accessible at its original URL for comparison.
if (!layeredInk) {
  for (let z = -43; z <= 43; z += 0.34) {
    for (let x = -34; x <= 34; x += 0.34) {
      const px = x + between(-0.12, 0.12), pz = z + between(-0.12, 0.12);
      const fromPath = Math.abs(px - pathX(pz));
      const fromWater = Math.abs(px - riverX(pz));
      if (fromPath < 1.66 || fromWater < 2.12) continue;
      if (summitScore(px, pz) > 0.30) continue;
      const height = ground(px, pz);
      const raised = THREE.MathUtils.smoothstep(height, 0.28, 4.4);
      const bank = 1 - THREE.MathUtils.smoothstep(Math.min(fromPath, fromWater), 2.2, 7.2);
      const density = 0.23 + raised * 0.15 + bank * 0.16;
      if (random() > density) continue;
      const deep = raised > 0.48 && random() < 0.30;
      const color = deep ? choose(['#777367', '#858073', '#948c7e'])
        : raised > 0.16 ? choose(['#8b8779', '#9a9283', '#aaa08d'])
          : choose(['#a59d8d', '#b4a997', '#c2b7a5']);
      put(nextLetter('meadowInk'), px, 0.12, pz, color, between(0.30, 0.42));
    }
  }
}

// Retain the earlier point-column mountain only in the comparison version.
await yieldToOpening();
function siteNoise(a, b, salt) {
  const value = Math.sin(a * 127.1 + b * 311.7 + salt * 74.7) * 43758.5453;
  return value - Math.floor(value);
}
if (!layeredInk) {
  for (let columnIndex = 0; columnIndex <= 206; columnIndex++) {
    for (let rowIndex = 0; rowIndex <= 228; rowIndex++) {
      const x = -33 + columnIndex * 0.32 + (siteNoise(columnIndex, rowIndex, 1) - 0.5) * 0.27;
      const z = -40 + rowIndex * 0.36 + (siteNoise(columnIndex, rowIndex, 2) - 0.5) * 0.29;
      const crest = summitScore(x, z);
      if (crest < 0.42) continue;
      if (Math.abs(x - pathX(z)) < 2.06 || Math.abs(x - riverX(z)) < 2.50) continue;
      const top = ground(x, z) - 0.10;
      if (top - valleyBase(x, z) < 1.30) continue;
      const character = columnIndex % 11 === 0 ? '岚' : '山';
      const lowerShade = crest > 0.66 ? '#81796d' : '#9a9082';
      for (let y = 0.13; y < top; y += 0.27) {
        const vertical = y / top;
        const shade = vertical > 0.76 ? '#beb4a5' : vertical > 0.40 ? '#a69c8e' : lowerShade;
        put(character, x, y, z, shade, 0.31);
        if ((columnIndex + rowIndex) % 6 === 0 && vertical < 0.82) {
          put(character, x + 0.09, y + 0.11, z + 0.11, '#c3b9aa', 0.25);
        }
      }
    }
  }
}

// One approval-stage hill: five transparent, gently curved inner leaves carry
// complete vertical phrases. Mipmaps merge the calligraphy into an ink wash at distance.
function addLayeredInkHill(fold) {
  const phrases = ['窃闻山中有草', '名笑矣乎', '嗅之则笑不可止', '房中植此一种', '合欢忘忧', '若解语花'];
  const distantHill = expandedInk && fold.z <= -24;
  const width = fold.rx * 1.72;
  const maxHeight = fold.rise * 1.21;
  const offsets = [-2.35, -1.16, 0, 1.16, 2.35];
  offsets.forEach((depth, layer) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 720;
    const ink = canvas.getContext('2d');
    const heightAt = u => {
      const x = fold.x + (u - 0.5) * width;
      const z = fold.z + depth + 0.36 * Math.sin(u * Math.PI * 1.55 + layer * 0.63);
      const relief = Math.max(0, ground(x, z) - valleyBase(x, z));
      const shoulder = Math.pow(Math.max(0, 1 - ((u - 0.5) * 2) ** 2), 0.42);
      return Math.min(maxHeight, relief * shoulder * (0.91 + 0.06 * Math.sin(u * 8 + layer * 1.3)));
    };
    ink.beginPath();
    ink.moveTo(0, canvas.height);
    for (let px = 0; px <= canvas.width; px += 5) {
      ink.lineTo(px, canvas.height * (1 - heightAt(px / canvas.width) / maxHeight));
    }
    ink.lineTo(canvas.width, canvas.height);
    ink.closePath();
    ink.save();
    ink.clip();
    const wash = ink.createLinearGradient(0, 0, 0, canvas.height);
    wash.addColorStop(0, 'rgba(164,151,132,0.005)');
    wash.addColorStop(0.52, distantHill ? 'rgba(143,129,109,0.065)'
      : expandedInk ? 'rgba(152,137,117,0.045)' : 'rgba(152,137,117,0.025)');
    wash.addColorStop(1, distantHill ? 'rgba(107,95,81,0.075)'
      : expandedInk ? 'rgba(116,103,88,0.052)' : 'rgba(116,103,88,0.014)');
    ink.fillStyle = wash;
    ink.fillRect(0, 0, canvas.width, canvas.height);
    ink.textAlign = 'center';
    ink.textBaseline = 'middle';
    ink.font = '18.5px KaiTi, STKaiti, Noto Serif CJK SC, SimSun, serif';
    const columnGap = 19.2;
    for (let column = 0; column < 62; column++) {
      const x = 12 + column * columnGap + layer * 3.1
        + 0.8 * Math.sin(column * 0.51 + layer * 1.7);
      if (x > canvas.width - 10) break;
      const top = canvas.height * (1 - heightAt(x / canvas.width) / maxHeight);
      if (top > canvas.height - 54) continue;
      const text = phrases[(column + layer * 2) % phrases.length];
      let row = 0;
      for (let y = top + 13; y < canvas.height - 9; y += 19.4, row++) {
        const character = text[row % text.length];
        const fromTop = (y - top) / Math.max(1, canvas.height - top);
        const baseFade = Math.min(1, (canvas.height - y) / 92);
        ink.globalAlpha = (0.62 + fromTop * 0.19) * baseFade
          * (layer < 2 ? 0.77 : 1) * (distantHill ? 0.94 : expandedInk ? 0.82 : 1);
        ink.fillStyle = layer < 2 ? '#888071' : fromTop > 0.47 ? '#655d51' : '#82796a';
        ink.fillText(character, x + 0.6 * Math.sin(row * 0.48 + column * 0.33), y);
      }
    }
    ink.restore();
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const vertices = [], uvs = [], indices = [];
    const segments = 48;
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const x = fold.x + (u - 0.5) * width;
      const z = fold.z + depth + 0.36 * Math.sin(u * Math.PI * 1.55 + layer * 0.63);
      vertices.push(x, 0.10, z, x, maxHeight + 0.10, z);
      uvs.push(u, 0, u, 1);
      if (i < segments) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const material = new THREE.MeshBasicMaterial({
      map: texture, transparent: true, opacity: distantHill ? 0.89 : 0.81,
      depthWrite: false, side: THREE.DoubleSide, alphaTest: 0.012,
    });
    const sheet = new THREE.Mesh(geometry, material);
    sheet.renderOrder = 1;
    scene.add(sheet);
  });
}
if (prototypeInk) addLayeredInkHill(scenicFolds[0]);
if (expandedInk) {
  for (const fold of scenicFolds) addLayeredInkHill(fold);
  for (const hill of [rollingHills[2], rollingHills[5], rollingHills[6],
    rollingHills[9], rollingHills[10]]) addLayeredInkHill(hill);
}

// The spring turns behind the outlying cottage before joining the upstream river.
const cascadeStartZ = expandedInk ? -35 : -42;
const cascadeEndZ = expandedInk ? -40.5 : -32;
function cascadeZ(t) { return cascadeStartZ + (cascadeEndZ - cascadeStartZ) * t; }
function cascadeX(t) {
  if (!expandedInk) return riverX(cascadeZ(t)) + 11.5 * Math.pow(1 - t, 1.32) + 0.23 * Math.sin(t * 12);
  const hillShoulder = rollingHills[10].x;
  const bend = THREE.MathUtils.smoothstep(t, 0.48, 1);
  return THREE.MathUtils.lerp(hillShoulder, riverX(cascadeEndZ), bend)
    + 0.48 * Math.sin(t * Math.PI * 2) * Math.sin(t * Math.PI);
}
function cascadeY(t) {
  const x = cascadeX(t), z = cascadeZ(t);
  return ground(x, z) + 0.13 + (expandedInk ? 0.07 * (1 - t) : 8.5 * Math.pow(1 - t, 1.5));
}
function cascadeWidth(t) { return 0.14 + 0.86 * Math.pow(t, 1.35); }
if (expandedInk) {
  const ridgeVerse = [...'乱山合沓空翠爽肌'];
  // Upright ink columns make the spring's hillside visible beneath the blue source.
  for (let layer = 0; layer < 2; layer++) {
    for (let column = 0; column < 31; column++) {
      const x = rollingHills[10].x - 3.6 + column * 0.24;
      const z = -34.72 - layer * 0.73 + 0.18 * Math.sin(column * 0.54 + layer);
      const top = ground(x, z) - 0.05;
      const bottom = valleyBase(x, z) + 0.12;
      for (let y = bottom, row = 0; y < top; y += 0.25, row++) {
        const height = (y - bottom) / Math.max(0.1, top - bottom);
        put(inkLetter(ridgeVerse, column * 3 + row + layer * 5),
          x + 0.025 * Math.sin(row * 0.62 + column), y, z,
          height > 0.65 ? '#736d5f' : '#8a8170', 0.23);
      }
    }
  }
}
for (let i = 0; i < 2500; i++) {
  const t = random();
  const halfWidth = 1.6 * cascadeWidth(t);
  const x = cascadeX(t) + between(-halfWidth, halfWidth);
  const fallingInk = expandedInk
    ? inkLetter(sourceInk.cascade, Math.floor(t * 185) + Math.floor((x - cascadeX(t)) * 7))
    : layeredInk ? '水' : nextLetter('cascade');
  const waterHeight = expandedInk
    ? ground(x, cascadeZ(t)) + 0.17 + 0.07 * (1 - t) + between(0, 0.035)
    : cascadeY(t) + between(0.10, 0.25);
  put(fallingInk, x, waterHeight, cascadeZ(t),
    choose(['#3e7892', '#4f90a7', '#80b8c6', '#d6ecec']), 0.25, 'cascade');
}
for (let i = 0; i < 460; i++) {
  const t = between(0.88, 1);
  const x = cascadeX(t) + between(-2.6, 2.6);
  const z = cascadeZ(t) + between(0, 2.7);
  put(expandedInk ? inkLetter(sourceInk.cascade, i) : layeredInk ? '水' : nextLetter('spray'),
    x, expandedInk ? ground(x, z) + between(0.12, 0.35) : cascadeY(t) + between(0.1, 1.0), z,
    choose(['#8fc5cf', '#b4dce0', '#e0eeee']), 0.17, 'spray');
}

// Each close-spaced longitudinal lane carries a continuous excerpt from the source.
let streamRow = 0;
for (let z = 43; z > (expandedInk ? -42 : -32); z -= expandedInk ? 0.15 : 0.22, streamRow++) {
  const center = riverX(z);
  const lineColor = choose(expandedInk
    ? ['#849c9e', '#8fa6a6', '#a1b5b1', '#92a7a7', '#b0bfba'] : blue);
  const laneCount = expandedInk ? 29 : 12;
  for (let lane = 0; lane < laneCount; lane++) {
    const offset = expandedInk ? -1.55 + lane * (3.10 / 28) : -1.55 + lane * 0.27;
    const x = center + offset
      + (expandedInk ? 0.009 * Math.sin(streamRow * 0.36 + lane * 0.57) : 0);
    const character = expandedInk ? inkLetter(sourceInk.water, streamRow + lane * 4)
      : layeredInk ? '水' : nextLetter('stream');
    put(character, x, ground(x, z) + 0.15, z, lineColor,
      expandedInk ? 0.235 : 0.31, true);
  }
  if (!layeredInk && random() < 0.82) {
    for (const side of [-1, 1]) {
      const x = center + side * between(1.73, 2.03);
      put(nextLetter('bank'), x, ground(x, z) + 0.11, z, choose(['#aaa396', '#b9af9f', '#c8bdac']), 0.29);
    }
  }
}

// The prototype leaves the path as a quiet ivory wash instead of scattered lettering.
if (!layeredInk) {
  for (let z = 43; z > -43; z -= 0.31) {
    const center = pathX(z);
    const lineColor = choose(['#6b6257', '#8b8072', '#a79a89', '#62594e']);
    for (let offset = -1.04; offset <= 1.05; offset += 0.35) {
      const x = center + offset;
      put(nextLetter('path'), x, ground(x, z) + 0.16, z, lineColor, 0.38);
    }
    if (random() < 0.45) {
      const side = random() < 0.5 ? -1 : 1;
      const x = center + side * between(1.28, 2.15);
      put(nextLetter('flowers'), x, ground(x, z) + between(0.16, 0.35), z + between(-0.3, 0.3), choose(['#d99998', '#e7b4ad', '#eec9bd']), 0.26);
    }
  }
}

// Along the expanded flower path, each line reads in order rather than scattering prose.
if (expandedInk) {
  const pathVerse = [...sourceSentences.join('').replace(/[，。「」]/g, '')];
  let step = 0;
  for (let z = 44; z > -43; z -= 0.225, step++) {
    const birdPath = 1 - 0.24 * THREE.MathUtils.smoothstep(z, -16, 8);
    for (let lane = -6; lane <= 6; lane++) {
      const x = pathX(z) + lane * 0.225 * birdPath;
      const shift = (lane + 6) * 7;
      put(pathVerse[(step + shift) % pathVerse.length], x, ground(x, z) + 0.16, z,
        lane % 3 === 0 ? '#9a8b73' : lane < 0 ? '#a89a83' : '#b1a28a', 0.30, 'path');
    }
  }
}

// Distant mountains use uninterrupted vertical rows, like the calligraphic reference image.
const ridges = [
  { axis: 'z', depth: -39, base: 2.5, peak: 5.3, phase: 0.4, spacing: 0.39, wash: '#a9a998', alpha: 0.17, ink: ['#8d8f7e', '#aaa998', '#c0bbae'] },
  { axis: 'z', depth: -51, base: 5.0, peak: 8.5, phase: 2.1, spacing: 0.55, wash: '#c2c0af', alpha: 0.20, ink: ['#bbb9a9', '#cac7b9', '#dad4c6'] },
  { axis: 'z', depth: 46, base: 2.2, peak: 5.1, phase: 1.6, spacing: 0.43, wash: '#b2af9e', alpha: 0.16, ink: ['#969787', '#b0ad9d', '#c4bcad'] },
  { axis: 'z', depth: 58, base: 5.1, peak: 8.0, phase: 3.5, spacing: 0.57, wash: '#c9c5b7', alpha: 0.19, ink: ['#c0bcae', '#d1cbbd', '#dfd8cb'] },
  { axis: 'x', depth: -42, base: 2.3, peak: 5.4, phase: 3.0, spacing: 0.43, wash: '#b1b09f', alpha: 0.15, ink: ['#969888', '#aeac9c', '#c6c1b2'] },
  { axis: 'x', depth: -55, base: 5.0, peak: 8.1, phase: 0.6, spacing: 0.57, wash: '#c7c4b4', alpha: 0.17, ink: ['#bab9aa', '#cfccbd', '#ded7c9'] },
  { axis: 'x', depth: 42, base: 2.1, peak: 5.5, phase: 2.6, spacing: 0.43, wash: '#b0ad9c', alpha: 0.15, ink: ['#969687', '#b0ac9b', '#c5bcac'] },
  { axis: 'x', depth: 55, base: 4.9, peak: 8.4, phase: 4.2, spacing: 0.57, wash: '#c6c3b3', alpha: 0.17, ink: ['#bab7a8', '#cfcbba', '#ddd6c8'] },
];
function mountainHeight(along, ridge) {
  const p = ridge.phase;
  const rolling = 0.85 * Math.sin(along * 0.11 + p) + 0.45 * Math.sin(along * 0.29 - p);
  const shoulder = ridge.peak * 0.83 * Math.exp(-Math.pow((along + 25 - p * 2) / 22, 2));
  const summit = ridge.peak * Math.exp(-Math.pow((along - 15 + p * 3) / 24, 2));
  const foothill = ridge.peak * 0.38 * Math.exp(-Math.pow((along + 3) / 40, 2));
  return Math.max(1.8, ridge.base + rolling + shoulder + summit + foothill);
}
function mountainPoint(ridge, along, heightFraction, jitter = 0) {
  const fold = 1.2 * Math.sin(along * 0.08 + ridge.phase) + (1 - heightFraction) * 2.6;
  const depth = ridge.depth + Math.sign(ridge.depth) * fold + jitter;
  return ridge.axis === 'z' ? [along, depth] : [depth, along];
}
for (const ridge of layeredInk ? [] : ridges) {
  let columnIndex = 0;
  for (let along = -67; along < 67; along += ridge.spacing, columnIndex++) {
    const height = mountainHeight(along, ridge);
    const character = columnIndex % 9 === 0 ? '岚' : '山';
    for (let y = 0.12; y < height; y += ridge.spacing * 0.78) {
      const fraction = y / height;
      const [x, z] = mountainPoint(ridge, along, fraction);
      put(character, x, y, z,
        fraction > 0.78 ? ridge.ink[2] : fraction > 0.39 ? ridge.ink[1] : ridge.ink[0],
        fraction > 0.82 ? 0.40 : 0.37);
      if (ridge.peak < 6 && columnIndex % 2 === 0 && fraction < 0.80) {
        const [backX, backZ] = mountainPoint(ridge, along + ridge.spacing * 0.22, fraction, 0.48);
        put(character, backX, y + ridge.spacing * 0.20, backZ, ridge.ink[2], 0.32);
      }
    }
  }
}

// Far ridges use the same upright, clipped calligraphy as the close hills.
// Their pale silhouettes close the horizon without bringing back point grids.
function addDistantInkRidge(ridge) {
  const canvas = document.createElement('canvas');
  canvas.width = 1536;
  canvas.height = 512;
  const ink = canvas.getContext('2d');
  const maxHeight = 18;
  const ridgeTop = u => mountainHeight(-62 + u * 124, ridge);
  ink.beginPath();
  ink.moveTo(0, canvas.height);
  for (let x = 0; x <= canvas.width; x += 4) {
    ink.lineTo(x, canvas.height * (1 - ridgeTop(x / canvas.width) / maxHeight));
  }
  ink.lineTo(canvas.width, canvas.height);
  ink.closePath();
  ink.save();
  ink.clip();
  const wash = ink.createLinearGradient(0, 0, 0, canvas.height);
  wash.addColorStop(0, expandedInk ? 'rgba(137,169,160,0.025)' : 'rgba(136,137,125,0.01)');
  wash.addColorStop(0.55, expandedInk ? 'rgba(132,162,150,0.115)' : 'rgba(127,127,113,0.035)');
  wash.addColorStop(1, expandedInk ? 'rgba(153,171,150,0.165)' : 'rgba(112,109,97,0.055)');
  ink.fillStyle = wash;
  ink.fillRect(0, 0, canvas.width, canvas.height);
  if (expandedInk) {
    const pigments = [
      'rgba(123,156,149,0.11)',
      'rgba(165,179,157,0.11)',
      'rgba(190,166,145,0.075)',
    ];
    for (let i = 0; i < 22; i++) {
      const x = (i * 197 + 120 * Math.sin(i * 1.7 + ridge.phase) + 1536) % 1536;
      const y = 220 + 130 * Math.sin(i * 0.71 + ridge.phase);
      const radius = 95 + 55 * (0.5 + 0.5 * Math.sin(i * 2.3));
      const pigment = ink.createRadialGradient(x, y, 0, x, y, radius);
      pigment.addColorStop(0, pigments[i % pigments.length]);
      pigment.addColorStop(1, 'rgba(255,255,255,0)');
      ink.fillStyle = pigment;
      ink.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
  }
  ink.font = '17px KaiTi, STKaiti, Noto Serif CJK SC, SimSun, serif';
  ink.textAlign = 'center';
  ink.textBaseline = 'middle';
  const verse = [...'窃闻山中有草名笑矣乎嗅之则笑不可止'];
  for (let column = 0; column < 76; column++) {
    const x = 12 + column * 20;
    const top = canvas.height * (1 - ridgeTop(x / canvas.width) / maxHeight);
    for (let row = 0, y = top + 9; y < canvas.height - 4; row++, y += 19) {
      ink.globalAlpha = 0.27 * Math.min(1, (canvas.height - y) / 55);
      ink.fillStyle = row % 4 === 0 ? '#928f80' : '#777769';
      ink.fillText(verse[(row + column * 3) % verse.length], x, y);
    }
  }
  ink.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  const vertices = [], uvs = [], indices = [];
  for (let i = 0; i <= 64; i++) {
    const u = i / 64;
    const along = -62 + u * 124;
    const depth = ridge.depth + Math.sign(ridge.depth) * 26
      + Math.sign(ridge.depth) * 1.0 * Math.sin(along * 0.07 + ridge.phase);
    const x = ridge.axis === 'z' ? along : depth;
    const z = ridge.axis === 'z' ? depth : along;
    vertices.push(x, 0, z, x, maxHeight, z);
    uvs.push(u, 0, u, 1);
    if (i < 64) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  const material = new THREE.MeshBasicMaterial({
    map: texture, transparent: true, opacity: expandedInk ? 0.72 : 0.74,
    depthWrite: false, side: THREE.DoubleSide, alphaTest: 0.01,
    fog: !expandedInk,
  });
  scene.add(new THREE.Mesh(geometry, material));
}
if (expandedInk) {
  for (const ridge of [ridges[0], ridges[2], ridges[4], ridges[6]]) {addDistantInkRidge(ridge);await yieldToOpening();}
}

async function addTree(cx, cz, height, radius, blossoms = false, species = 'peach') {
  const base = ground(cx, cz) - (expandedInk ? 0.20 : 0);
  const bark = blossoms ? ['#554d45', '#62584c', '#716356'] : ['#625d50', '#766b58', '#877761'];
  const barkPhrase = expandedInk ? '丛花乱树中花木四合其所' : '树木葱茏枝叶扶疏';
  let barkIndex = 0;
  const barkLetter = () => barkPhrase[barkIndex++ % barkPhrase.length];
  const floweringVerse = species === 'crabapple'
    ? [...'窗外海棠枝朵'] : sourceInk.blossom;
  let leafIndex = 0, flowerIndex = 0;
  const leafLetter = flower => flower
    ? inkLetter(floweringVerse, flowerIndex++)
    : inkLetter(sourceInk.foliage, leafIndex++);
  const foregroundPeach = blossoms && cz > 9 && cz < 15 && cx > 7 && cx < 10;
  const oldPeach = blossoms && cz < -4 && cz > -9 && cx > 7 && cx < 10;
  const winding = foregroundPeach || oldPeach || random() < (blossoms ? 0.65 : 0.42);
  const leanX = foregroundPeach ? -2.65 : oldPeach ? -1.45
    : winding ? between(-1.75, 1.75) * (height / 5.5) : between(-0.20, 0.20);
  const leanZ = foregroundPeach ? -0.55 : winding ? between(-0.95, 0.95) : between(-0.17, 0.17);
  const curveX = winding ? between(-0.95, 0.95) : between(-0.11, 0.11);
  const curveZ = winding ? between(-0.78, 0.78) : between(-0.10, 0.10);
  const elbowX = winding ? between(-0.60, 0.60) : 0;
  const elbowZ = winding ? between(-0.48, 0.48) : 0;
  const trunkAt = t => ({
    x: cx + leanX * t * t * (3 - 2 * t) + curveX * Math.sin(Math.PI * t)
      + elbowX * Math.sin(2 * Math.PI * t) * t
      + 0.08 * Math.sin(t * 9 + cx) * t,
    y: base + height * t,
    z: cz + leanZ * t * t * (3 - 2 * t) + curveZ * Math.sin(Math.PI * t)
      + elbowZ * Math.sin(2 * Math.PI * t) * t
      + 0.07 * Math.sin(t * 8 + cz) * t,
  });
  // Overlapping glyph rings make a continuous tapered trunk, without punctuation gaps.
  for (let i = 0; i <= Math.ceil(height * 0.79 / 0.03); i++) {
    if(i%32===0)await yieldToOpening();
    const t = Math.min(0.79, i * 0.03 / height);
    const center = trunkAt(t);
    const taper = (blossoms ? 0.33 : 0.26) * Math.pow(1 - t, 1.28) + 0.048;
    const ringCount = Math.max(8, Math.ceil(2 * Math.PI * taper / 0.052));
    for (let j = 0; j < ringCount; j++) {
      const a = j * Math.PI * 2 / ringCount + t * 0.38;
      const barkGrain = 1 + 0.07 * Math.sin(t * 75 + j * 2.4);
      put(barkLetter(), center.x + Math.cos(a) * taper * barkGrain,
        center.y + (j % 2) * 0.012, center.z + Math.sin(a) * taper * barkGrain, choose(bark), 0.24);
    }
  }
  for (let root = 0; root < 5; root++) {
    const angle = root * Math.PI * 2 / 5 + cx;
    for (let i = 0; i < 14; i++) {
      const t = i / 13;
      const rootX = cx + Math.cos(angle) * t * 0.65;
      const rootZ = cz + Math.sin(angle) * t * 0.65;
      put(barkLetter(), rootX,
        ground(rootX, rootZ) - 0.045 + 0.08 * (1 - t), rootZ,
        choose(bark), 0.19);
    }
  }

  const branchCount = blossoms ? 14 : 11;
  const crown = trunkAt(blossoms ? 0.72 : 0.70);
  const crownVertical = blossoms ? Math.max(height * 0.44, radius * 0.65)
    : Math.max(height * 0.37, radius * 0.58);
  function domeHeight(x, z) {
    const distance = Math.hypot(x - crown.x, z - crown.z) / (radius * 1.08);
    return crown.y + crownVertical * Math.sqrt(Math.max(0.10, 1 - distance * distance));
  }
  function leafColor(x, y, z, flower) {
    const light = 0.72 * (y - crown.y) / crownVertical + 0.28 * (z - crown.z) / radius;
    if (flower) {
      if (species === 'plum') return choose(light > 0.12
        ? ['#f7e6e2', '#efcdd0', '#eabfc4'] : ['#cf969f', '#dfaab0', '#e9bfc0']);
      if (species === 'apricot') return choose(light > 0.12
        ? ['#fff3e5', '#f4e7df', '#f8dedb'] : ['#e2c8bf', '#e9d3c9', '#eddad2']);
      if (species === 'crabapple') return choose(light > 0.12
        ? ['#f2c6c3', '#f7d8ce', '#e7a8ad'] : ['#d78991', '#e5a6a9', '#eab7b4']);
      return choose(light > 0.12 ? ['#df9da4', '#eab0af', '#e5a5a8'] : ['#bd717d', '#cd828c', '#d98f98']);
    }
    return choose(light > 0.12 ? (blossoms ? ['#929383', '#aaa895'] : ['#838978', '#999b86', '#a9a996'])
      : (blossoms ? ['#636d61', '#747b6d'] : ['#505e54', '#657264', '#74806e']));
  }
  function leafSpray(center, count, scale = 1) {
    for (let n = 0; n < count; n++) {
      const azimuth = random() * Math.PI * 2;
      const elevation = between(-1, 1);
      const radial = Math.cbrt(random());
      const horizontal = Math.sqrt(1 - elevation * elevation) * radial;
      const x = center.x + Math.cos(azimuth) * horizontal * (blossoms ? 0.84 : 0.72) * scale;
      const y = center.y + elevation * radial * (blossoms ? 0.74 : 0.65) * scale;
      const z = center.z + Math.sin(azimuth) * horizontal * (blossoms ? 0.76 : 0.66) * scale;
      const domeDistance = ((x - crown.x) / (radius * (blossoms ? 0.99 : 1.08))) ** 2
        + ((y - crown.y) / (crownVertical * 1.08)) ** 2
        + ((z - crown.z) / (radius * (blossoms ? 1.02 : 1.12))) ** 2;
      if (domeDistance > 1.20) continue;
      const flower = blossoms && random() < 0.72;
      put(expandedInk ? leafLetter(flower)
        : layeredInk ? (flower ? '花' : '叶') : nextLetter(flower ? 'blossom' : 'foliage'), x, y, z,
        leafColor(x, y, z, flower), flower ? 0.17 : 0.15);
    }
  }
  function growBranch(start, angle, rise, length, thickness, level, writeVerse = false) {
    const forward = new THREE.Vector3(Math.cos(angle), rise, Math.sin(angle)).normalize();
    const sideways = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle));
    const bend = between(winding ? -0.55 : -0.35, winding ? 0.55 : 0.35) * length;
    const end = start.clone().addScaledVector(forward, length).addScaledVector(sideways, bend);
    end.y += length * between(0.01, 0.11);
    const reach = Math.hypot(end.x - crown.x, end.z - crown.z);
    const maxReach = radius * (blossoms ? 0.91 : 0.98);
    if (reach > maxReach) {
      const ratio = maxReach / reach;
      end.x = crown.x + (end.x - crown.x) * ratio;
      end.z = crown.z + (end.z - crown.z) * ratio;
    }
    const minRise = length * (level === 0 ? 0.12 : 0.075);
    end.y = Math.max(start.y + minRise, Math.min(end.y, domeHeight(end.x, end.z) - between(0.07, 0.20)));
    const control1 = start.clone().lerp(end, 0.28).addScaledVector(sideways, bend * (winding ? 0.52 : 0.14));
    const control2 = start.clone().lerp(end, 0.72).addScaledVector(sideways, bend * (winding ? -0.28 : 0.28));
    const climb = end.y - start.y;
    control1.y = start.y + climb * between(0.18, 0.34);
    control2.y = start.y + climb * between(0.66, 0.86);
    const curve = new THREE.CubicBezierCurve3(start, control1, control2, end);
    const steps = Math.max(9, Math.ceil(length / 0.052));
    const across = level === 0 ? 2 : level === 1 ? 1 : 0;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      const width = thickness * Math.pow(1 - t, 1.08) + 0.008;
      for (let side = -across; side <= across; side++) {
        put(barkLetter(), p.x - tangent.z * width * side * 0.46,
          p.y + width * side * 0.18, p.z + tangent.x * width * side * 0.46,
          choose(bark), level === 0 ? 0.21 : level === 1 ? 0.18 : 0.15);
      }
    }
    if (writeVerse) {
      const branchVerse = [...(species === 'crabapple' ? '窗外海棠枝朵'
        : blossoms ? '墙内桃杏犹繁' : '丛花乱树中')];
      for (let i = 0; i < branchVerse.length; i++) {
        const p = curve.getPoint(0.18 + 0.68 * i / Math.max(1, branchVerse.length - 1));
        put(branchVerse[i], p.x, p.y + 0.13, p.z + 0.12,
          blossoms ? '#7e6460' : '#4d5f4f', 0.23);
      }
    }
    if (level === 0) {
      const forks = [
        { at: 0.43, turn: -between(0.40, 0.78), size: between(0.60, 0.72) },
        { at: 0.70, turn: between(0.42, 0.82), size: between(0.56, 0.68) },
        { at: 0.98, turn: between(-0.26, 0.26), size: between(0.59, 0.74) },
      ];
      for (const fork of forks) growBranch(curve.getPoint(fork.at), angle + fork.turn,
        Math.max(0.16, rise * 0.68 + between(-0.08, 0.14)), length * fork.size, thickness * 0.59, 1);
    } else if (level === 1) {
      leafSpray(curve.getPoint(0.94), blossoms ? 90 : 70, 0.76);
      for (const sign of [-1, 1]) {
        const at = sign < 0 ? 0.66 : 0.95;
        growBranch(curve.getPoint(at), angle + sign * between(0.38, 0.77),
          Math.max(0.08, rise * 0.58 + between(-0.08, 0.14)), length * between(0.52, 0.73), thickness * 0.53, 2);
      }
    } else {
      leafSpray(end, blossoms ? 210 : 160, between(0.82, 1.02));
    }
  }
  for (let b = 0; b < branchCount; b++) {
    await yieldToOpening();
    const launch = 0.28 + (b / branchCount) * 0.40;
    const p = trunkAt(launch);
    growBranch(new THREE.Vector3(p.x, p.y, p.z), b * 2.39996 + between(-0.22, 0.22),
      blossoms ? between(0.85, 1.28) : between(0.62, 0.98),
      radius * (blossoms ? between(0.42, 0.62) : between(0.51, 0.75)),
      blossoms ? 0.23 : 0.18, 0, expandedInk && b % 5 === 0);
  }
  if (foregroundPeach) {
    const p = trunkAt(0.57);
    growBranch(new THREE.Vector3(p.x, p.y, p.z), Math.PI - 0.18, 0.55,
      radius * 0.96, 0.30, 0);
  }
  // Fine letter-leaves also fill the space between branches, creating a continuous soft crown.
  const crownCount = expandedInk ? (species === 'plum' ? 3800 : blossoms ? 5700 : 3100)
    : (blossoms ? 10000 : 5000);
  for (let n = 0; n < crownCount; n++) {
    if(n%384===0)await yieldToOpening();
    const azimuth = random() * Math.PI * 2;
    const elevation = between(-1, 1);
    const radial = n % 3 === 0 ? Math.pow(random(), 0.19) : Math.cbrt(random());
    const horizontal = Math.sqrt(1 - elevation * elevation) * radial;
    const edge = 1 + 0.045 * Math.sin(azimuth * 5 + cx) + 0.028 * Math.sin(azimuth * 9 + cz);
    const x = crown.x + Math.cos(azimuth) * horizontal * radius * (blossoms ? 0.82 : 0.93) * edge;
    const y = crown.y + elevation * radial * crownVertical;
    const z = crown.z + Math.sin(azimuth) * horizontal * radius * (blossoms ? 0.91 : 0.98) * edge;
    if (y < base + height * 0.49 && Math.hypot(x - cx, z - cz) < radius * 0.34) continue;
    const flower = blossoms && random() < 0.69;
    put(expandedInk ? leafLetter(flower)
      : layeredInk ? (flower ? '花' : '叶') : nextLetter(flower ? 'blossomFill' : 'foliageFill'), x, y, z,
      leafColor(x, y, z, flower), flower ? 0.16 : 0.145);
  }
  if (expandedInk) {
    const readable = [...(species === 'crabapple' ? '窗外海棠枝朵'
      : blossoms ? '墙内桃杏犹繁' : '丛花乱树中')];
    for (let row = 0; row < readable.length; row++) {
      put(readable[row], crown.x + 0.12 * Math.sin(row * 0.64),
        crown.y + crownVertical * 0.57 - row * 0.26,
        crown.z + radius * 0.78 + 0.04 * Math.sin(row * 0.8),
        blossoms ? '#85696a' : '#526858', 0.21);
    }
  }
}

// Keep full-sized trees off the crests: they belong on the shoulder of each fold.
function summitScore(x, z) {
  let score = 0;
  for (const fold of scenicFolds) {
    const dx = (x - fold.x) / fold.rx, dz = (z - fold.z) / fold.rz;
    score = Math.max(score, Math.exp(-1.55 * (dx * dx + dz * dz)));
  }
  for (const hill of rollingHills) {
    const cosine = Math.cos(hill.angle), sine = Math.sin(hill.angle);
    const u = (x - hill.x) * cosine + (z - hill.z) * sine;
    const v = (z - hill.z) * cosine - (x - hill.x) * sine;
    score = Math.max(score, Math.exp(-1.28 * (u / hill.rx) ** 2 - 1.7 * (v / hill.rz) ** 2));
  }
  return score;
}
const treeSites = [];
const blossomSites = [];
async function addTreeOnSlope(x, z, height, radius, blossoms = false, species = 'peach') {
  let siteX = x, siteZ = z;
  if (summitScore(x, z) > 0.62) {
    let best = Infinity;
    for (const distance of [2.8, 4.1, 5.5, 7.0, 8.5, 10.5, 12.0]) {
      for (let i = 0; i < 16; i++) {
        const angle = i * Math.PI * 2 / 16;
        const candidateX = x + Math.cos(angle) * distance;
        const candidateZ = z + Math.sin(angle) * distance;
        if (Math.abs(candidateX) > 32 || Math.abs(candidateZ) > 40) continue;
        if (Math.abs(candidateX - pathX(candidateZ)) < 3.0
          || Math.abs(candidateX - riverX(candidateZ)) < 3.2) continue;
        if (treeSites.some(([tx, tz]) => Math.hypot(candidateX - tx, candidateZ - tz) < 3.0)) continue;
        const crest = summitScore(candidateX, candidateZ);
        if (crest > 0.59 || crest < 0.18) continue;
        const cost = Math.abs(crest - 0.35) * 5 + distance * 0.06;
        if (cost < best) { best = cost; siteX = candidateX; siteZ = candidateZ; }
      }
    }
  }
  // A requested site may already be in the stream even when no summit search ran.
  // Keep the trunk and roots on a bank; the canopy may still lean over the water.
  if (expandedInk && siteZ > -42 && Math.abs(siteX - riverX(siteZ)) < 3.4) {
    const stream = riverX(siteZ);
    const side = siteX < stream ? -1 : 1;
    const banks = [stream + side * 3.4, stream - side * 3.4];
    siteX = banks.find(candidate => Math.abs(candidate) < 32
      && Math.abs(candidate - pathX(siteZ)) > 2.1
      && summitScore(candidate, siteZ) <= 0.62) ?? banks[0];
  }
  if (summitScore(siteX, siteZ) > 0.62) return;
  treeSites.push([siteX, siteZ]);
  if (blossoms) blossomSites.push([siteX, siteZ, radius]);
  await addTree(siteX, siteZ, height, radius, blossoms, species);
}

const trees = [
  [-15, 13, 4.3, 2.6], [-17.5, -1, 5.0, 2.8], [-15, -16, 4.8, 2.5],
  [15, 13, 4.6, 2.7], [15.4, -18, 4.9, 2.6], [-19, -29, 4.6, 2.7],
  [-19, 29, 5.4, 3.1], [-13, 35, 4.7, 2.8], [17, 28, 5.1, 2.9],
  [24, 10, 5.7, 3.2], [-26, 8, 5.8, 3.1], [27, -11, 5.3, 2.8],
  [-27, -17, 5.2, 2.8], [6, 36, 4.7, 2.6], [-5, 32, 4.8, 2.7],
  [30, 31, 5.5, 3.0], [-31, 32, 5.6, 3.0], [-30, -32, 5.8, 3.0],
];
if (!layeredInk) {
  for (const [x, z, h, r] of trees) await addTreeOnSlope(x, z, h, r);
  await addTreeOnSlope(8.3, -6.2, 8.2, 6.6, true);
  // A close blossom canopy frames the path like the branch in the illustration.
  await addTreeOnSlope(8.5, 12.0, 7.6, 6.2, true);
  await addTreeOnSlope(-11.2, 5.7, 5.3, 3.8, true);
  await addTreeOnSlope(-10.2, -23, 5.0, 3.2, true);
  await addTreeOnSlope(10.8, 29.5, 6.3, 4.5, true);
  await addTreeOnSlope(-23.4, 23.4, 5.4, 3.3, true);
  // Each wooded knoll hides the next turn until the visitor walks around it.
  for (const fold of scenicFolds) {
    await addTreeOnSlope(fold.x, fold.z, 5.5 + random() * 0.8, 3.7 + random() * 0.5, fold.z === 5);
    await addTreeOnSlope(fold.x + fold.side * 2.75, fold.z - 2.3, 4.3 + random() * 0.7, 2.7, false);
  }
  await addTreeOnSlope(pathX(34) - 5.2, 33, 5.0, 3.2, false);
  await addTreeOnSlope(riverX(33) + 4.8, 32, 5.7, 3.4, true);
  await addTreeOnSlope(pathX(28) + 5.3, 28, 5.1, 3.2, false);
} else if (expandedInk) {
  await addTreeOnSlope(pathX(34) - 6.5, 32, 5.4, 3.2);
  await yieldToOpening();
  await addTreeOnSlope(pathX(21) + 6.9, 21, 4.7, 2.9);
  await addTreeOnSlope(pathX(24) - 5.3, 24, 4.4, 2.8, true, 'plum');
  await yieldToOpening();
  await addTreeOnSlope(-12.0, 7.5, 5.7, 3.8, true);
  await addTreeOnSlope(9.2, -6.4, 7.1, 5.0, true);
  await yieldToOpening();
  await addTreeOnSlope(-14.2, -24.0, 4.7, 3.0, true, 'plum');
  await addTreeOnSlope(5.7, -21.0, 4.3, 2.4, true, 'plum');
  await addTreeOnSlope(9.0, -41.5, 4.2, 2.6, true, 'plum');
  await yieldToOpening();
  await addTreeOnSlope(-17.2, -15, 5.1, 3.0);
  await addTreeOnSlope(15.8, -22, 5.6, 3.2);
  await addTreeOnSlope(11.6, 16.6, 5.4, 3.4, true);
  await yieldToOpening();
}

// Sparse far-bank bamboo keeps the centre open, as in the document's concept image.
const bambooGroves = [[-8.5, -28, 9], [8.8, -29, 12], [16.3, -25, 8],
  [-5.8, 34, 11], [8.6, 39, 11], [29, 17, 12], [-29, 15, 12], [27, -26, 10]];
for (const [cx, cz, count] of prototypeInk ? [] : expandedInk
  ? [[16.3, -25, 7], [-8.5, -28, 6], [-17.2, -30.3, 5], [-4.7, -28.6, 5]] : bambooGroves) {
  for (let s = 0; s < count; s++) {
    const x = cx + between(-2.4, 2.4);
    const z = cz + between(-2.6, 2.6);
    if (Math.abs(x - riverX(z)) < 1.9) continue;
    const h = between(3.0, 5.9);
    const base = ground(x, z) - (expandedInk ? 0.07 : 0);
    let stalkRow = 0;
    for (let y = 0.15; y < h; y += 0.13, stalkRow++) {
      put(expandedInk ? inkLetter(sourceInk.bamboo, stalkRow) : layeredInk ? '竹' : nextLetter('bamboo'),
        x + Math.sin(y * 0.55 + z) * 0.055, base + y, z,
        choose(['#8b8373', '#a09683', '#776f61']), 0.21);
    }
    for (let n = 0; n < 48; n++) {
      const a = random() * Math.PI * 2;
      const length = between(0.13, 1.15);
      put(expandedInk ? inkLetter(sourceInk.bamboo, n) : layeredInk ? '叶' : nextLetter('bambooLeaves'),
        x + Math.cos(a) * length, base + h * between(0.54, 1.04),
        z + Math.sin(a) * length, choose(['#a19886', '#8d8473', '#b0a594']), 0.16);
    }
  }
}

// Uneven undergrowth gives the two riverbanks and path edges a continuous ink silhouette.
// The small marks remain letters up close; from walking distance they merge into foliage.
function addShrub(cx, cz, spread, height, flowering = false) {
  const base = ground(cx, cz);
  const stem = flowering ? '#85786b' : '#686d5a';
  for (let i = 0; i < 25; i++) {
    const t = i / 24;
    put(expandedInk ? inkLetter(sourceInk.foliage, i) : layeredInk ? '枝' : nextLetter('shrubStem'),
      cx + 0.07 * Math.sin(t * 4 + cz), base + height * t * 0.75,
      cz + 0.05 * Math.sin(t * 5 + cx), stem, 0.13);
  }
  const count = Math.floor(85 + spread * 55);
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    const radial = Math.sqrt(random());
    const x = cx + Math.cos(angle) * spread * radial;
    const z = cz + Math.sin(angle) * spread * 0.72 * radial;
    const y = ground(x, z) + 0.07 + height * (0.28 + 0.68 * random()) * (1 - 0.33 * radial);
    const bloom = flowering && random() < 0.19;
    put(expandedInk ? inkLetter(bloom ? sourceInk.blossom : sourceInk.foliage, i)
      : layeredInk ? (bloom ? '花' : '叶') : nextLetter(bloom ? 'hedgeFlower' : 'undergrowth'), x, y, z,
      bloom ? choose(['#d59a9a', '#e2aeaa', '#c6848b'])
        : choose(['#555f4f', '#6b755e', '#7e846b', '#8d8c71']), bloom ? 0.15 : 0.14);
  }
}
if (!layeredInk) {
  for (let z = -36; z <= 38; z += 2.45) {
    for (const side of [-1, 1]) {
      const cx = riverX(z) + side * between(2.55, 4.1);
      if (Math.abs(cx - pathX(z)) < 2.25) continue;
      addShrub(cx, z + between(-0.8, 0.8), between(0.7, 1.55), between(0.38, 0.86), random() < 0.26);
    }
    if (random() < 0.78) addShrub(pathX(z) - between(2.2, 3.2), z + between(-0.9, 0.9),
      between(0.52, 1.1), between(0.25, 0.7), random() < 0.32);
  }
  for (let i = 0; i < 125; i++) {
    const x = between(-33, 33), z = between(-39, 42);
    if (Math.abs(x - riverX(z)) < 5 || Math.abs(x - pathX(z)) < 4.1
      || summitScore(x, z) > 0.32) continue;
    addShrub(x, z, between(0.48, 1.35), between(0.25, 0.75), random() < 0.12);
  }
} else if (expandedInk) {
  for (let z = -33; z <= 36; z += 4.7) {
    for (const side of [-1, 1]) {
      const x = riverX(z) + side * 3.35;
      if (Math.abs(x - pathX(z)) > 3.1 && summitScore(x, z) < 0.55) {
        addShrub(x, z, 0.92, 0.56, random() < 0.3);
      }
    }
  }
}

// The source-text route moves from a hidden hamlet to a north-facing cottage,
// then turns west through a second gate into the flower-filled rear garden.
await yieldToOpening();
if (expandedInk) {
  const wallCanvas = document.createElement('canvas');
  wallCanvas.width = wallCanvas.height = 512;
  const wallInk = wallCanvas.getContext('2d');
  const wallWash = wallInk.createLinearGradient(0, 0, 512, 512);
  wallWash.addColorStop(0, '#fffaf0');
  wallWash.addColorStop(0.5, '#f5eee2');
  wallWash.addColorStop(1, '#e9ddcb');
  wallInk.fillStyle = wallWash;
  wallInk.fillRect(0, 0, 512, 512);
  wallInk.textAlign = 'center';
  wallInk.font = '21px KaiTi, STKaiti, Noto Serif CJK SC, SimSun, serif';
  wallInk.fillStyle = 'rgba(113,101,83,0.22)';
  const wallPhrase = [...'粉壁光明如镜窗外海棠枝朵'];
  for (let col = 0; col < 24; col++) {
    for (let row = 0; row < 25; row++) {
      wallInk.fillText(wallPhrase[(col * 3 + row) % wallPhrase.length],
        13 + col * 21, 20 + row * 20);
    }
  }
  const roofCanvas = document.createElement('canvas');
  roofCanvas.width = roofCanvas.height = 512;
  const roofInk = roofCanvas.getContext('2d');
  const thatchWash = roofInk.createLinearGradient(0, 0, 0, 512);
  thatchWash.addColorStop(0, '#ad9d82');
  thatchWash.addColorStop(0.48, '#99866e');
  thatchWash.addColorStop(1, '#c0ae91');
  roofInk.fillStyle = thatchWash;
  roofInk.fillRect(0, 0, 512, 512);
  roofInk.textAlign = 'center';
  roofInk.font = '24px KaiTi, STKaiti, Noto Serif CJK SC, SimSun, serif';
  const thatchPhrase = [...'茅舍三楹修雅自然'];
  for (let row = 0; row < 24; row++) {
    for (let col = 0; col < 22; col++) {
      roofInk.fillStyle = row % 3 === 0 ? 'rgba(66,57,43,0.60)' : 'rgba(80,70,54,0.43)';
      roofInk.fillText(thatchPhrase[(row + col * 2) % thatchPhrase.length],
        11 + col * 23 + (row % 2) * 9, 20 + row * 21);
    }
  }
  const wallTexture = new THREE.CanvasTexture(wallCanvas);
  const roofTexture = new THREE.CanvasTexture(roofCanvas);
  for (const texture of [wallTexture, roofTexture]) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  }
  const plaster = new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.DoubleSide });
  const thatch = new THREE.MeshBasicMaterial({ map: roofTexture, side: THREE.DoubleSide });
  const timber = new THREE.MeshBasicMaterial({ color: '#665947' });
  const darkDoor = new THREE.MeshBasicMaterial({ color: '#716456' });
  const whiteWall = new THREE.MeshBasicMaterial({ color: '#f5f0e6' });
  const stones = ['#f6f3ec', '#eae5dc', '#f1ece3'].map(color =>
    new THREE.MeshBasicMaterial({ color }));
  const glass = new THREE.MeshBasicMaterial({ color: '#d9d9c9' });

  function quad(parent, corners, material) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(corners.flat(), 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute([
      0, 0, 1, 0, 1, 1, 0, 1,
    ], 2));
    geometry.setIndex([0, 1, 2, 0, 2, 3]);
    geometry.computeVertexNormals();
    parent.add(new THREE.Mesh(geometry, material));
  }
  function beam(parent, x, y, z, w, h, d, material = timber) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  function cottage(cx, cz, width, depth, wallHeight, bays = 1, angle = 0) {
    const house = new THREE.Group();
    house.position.set(cx, 0.09, cz);
    house.rotation.y = angle;
    scene.add(house);
    const xL = -width / 2, xR = width / 2;
    const zF = depth / 2, zB = -depth / 2;
    const yH = wallHeight;
    beam(house, 0, 0.02, 0, width + 0.26, 0.13, depth + 0.24, stones[1]);
    quad(house, [[xL, 0, zF], [xR, 0, zF], [xR, yH, zF], [xL, yH, zF]], plaster);
    quad(house, [[xR, 0, zB], [xL, 0, zB], [xL, yH, zB], [xR, yH, zB]], plaster);
    quad(house, [[xL, 0, zB], [xL, 0, zF], [xL, yH, zF], [xL, yH, zB]], plaster);
    quad(house, [[xR, 0, zF], [xR, 0, zB], [xR, yH, zB], [xR, yH, zF]], plaster);
    const eave = 0.68, roofPeak = wallHeight + 1.43;
    quad(house, [
      [xL - eave, yH - 0.05, zB - eave], [0, roofPeak, zB - eave],
      [0, roofPeak, zF + eave], [xL - eave, yH - 0.05, zF + eave],
    ], thatch);
    quad(house, [
      [0, roofPeak, zB - eave], [xR + eave, yH - 0.05, zB - eave],
      [xR + eave, yH - 0.05, zF + eave], [0, roofPeak, zF + eave],
    ], thatch);
    for (const z of [zF, zB]) {
      const gable = new THREE.BufferGeometry();
      gable.setAttribute('position', new THREE.Float32BufferAttribute([
        xL, yH, z, xR, yH, z, 0, roofPeak - 0.08, z,
      ], 3));
      gable.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0.5, 1], 2));
      gable.setIndex([0, 1, 2]);
      house.add(new THREE.Mesh(gable, plaster));
    }
    beam(house, 0, roofPeak + 0.01, 0, 0.13, 0.13, depth + 2 * eave, timber);
    beam(house, 0, yH - 0.10, zF + 0.16, width + 0.20, 0.16, 0.17);
    for (const x of [xL, xR]) {
      beam(house, x, yH * 0.5, zF + 0.04, 0.12, yH, 0.13);
      beam(house, x, yH * 0.5, zB - 0.04, 0.12, yH, 0.13);
    }
    const doorWidth = Math.min(1.18, width / (bays * 2.1));
    for (let i = 0; i < bays; i++) {
      const x = xL + width * (i + 0.5) / bays;
      const doorHeight = yH * 0.66;
      beam(house, x, doorHeight / 2, zF + 0.055, doorWidth, doorHeight, 0.065, darkDoor);
      beam(house, x, doorHeight + 0.08, zF + 0.11, doorWidth + 0.23, 0.09, 0.13);
      beam(house, x, doorHeight / 2, zF + 0.12, 0.035, doorHeight, 0.05, timber);
      for (const offset of [-0.33, -0.17, 0.17, 0.33]) {
        beam(house, x + offset * doorWidth, doorHeight * 0.55,
          zF + 0.13, 0.025, doorHeight * 0.76, 0.035, timber);
      }
      for (const fraction of [0.33, 0.68]) {
        beam(house, x, doorHeight * fraction, zF + 0.14,
          doorWidth - 0.06, 0.032, 0.035, timber);
      }
      put('门', cx + x, 1.28, cz + zF + 0.17, '#c8b491', 0.41);
    }
    if (bays === 1 && width > 5) {
      for (const x of [xL * 0.60, xR * 0.60]) {
        beam(house, x, yH * 0.53, zF + 0.06, 1.16, 0.95, 0.05, timber);
        beam(house, x, yH * 0.53, zF + 0.10, 0.99, 0.80, 0.04, glass);
        beam(house, x, yH * 0.53, zF + 0.14, 0.04, 0.81, 0.03, timber);
        for (const fraction of [-0.26, 0.26]) {
          beam(house, x, yH * 0.53 + fraction, zF + 0.14, 1.02, 0.035, 0.03, timber);
        }
      }
    }
    for (const x of [xL + 0.34, xR - 0.34]) {
      beam(house, x, yH * 0.52, zF + eave * 0.68, 0.11, yH * 0.91, 0.11, timber);
    }
    for (const side of [-1, 1]) {
      const edgeX = side * (width / 2 + eave);
      for (let z = zB - eave; z < zF + eave; z += 0.19) {
        const worldX = cx + edgeX * Math.cos(angle) + z * Math.sin(angle);
        const worldZ = cz - edgeX * Math.sin(angle) + z * Math.cos(angle);
        put('茅', worldX, yH - 0.12 + between(-0.06, 0.03), worldZ,
          choose(['#8b7b64', '#a18d70', '#baa583']), 0.16);
      }
    }
    for (const side of [-1, 1]) {
      const x = side * (width / 2 + 0.045);
      beam(house, x, yH * 0.52, 0, 0.07, 0.96, 1.25, timber);
      beam(house, x + side * 0.045, yH * 0.52, 0, 0.03, 0.78, 1.06, glass);
      beam(house, x + side * 0.09, yH * 0.52, 0, 0.04, 0.78, 0.05, timber);
    }
    return house;
  }
  function boundary(x1, z1, x2, z2, height = 1.63) {
    const dx = x2 - x1, dz = z2 - z1;
    const length = Math.hypot(dx, dz);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(length, height, 0.18), whiteWall);
    mesh.position.set((x1 + x2) / 2, 0.09 + height / 2, (z1 + z2) / 2);
    mesh.rotation.y = -Math.atan2(dz, dx);
    scene.add(mesh);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(length + 0.12, 0.12, 0.31), timber);
    cap.position.set(mesh.position.x, 0.09 + height + 0.05, mesh.position.z);
    cap.rotation.y = mesh.rotation.y;
    scene.add(cap);
  }
  function gate(cx, cz, width = 2.45) {
    for (const side of [-1, 1]) {
      beam(scene, cx + side * width / 2, 1.33, cz, 0.22, 2.48, 0.25);
    }
    beam(scene, cx, 2.63, cz, width + 0.58, 0.24, 0.36);
    beam(scene, cx, 2.86, cz, width + 0.88, 0.17, 0.53, thatch);
  }
  function gardenWash(cx, cz, rx, rz, shade) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ink = canvas.getContext('2d');
    const gradient = ink.createRadialGradient(128, 128, 20, 128, 128, 126);
    gradient.addColorStop(0, shade);
    gradient.addColorStop(0.64, 'rgba(157,176,135,0.28)');
    gradient.addColorStop(1, 'rgba(157,176,135,0)');
    ink.fillStyle = gradient;
    ink.fillRect(0, 0, 256, 256);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2, rz * 2),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas),
        transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(cx, 0.105, cz);
    scene.add(mesh);
  }
  function stoneTrail(points, count) {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const roadsideVerse = [...'夹道红花'];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const p = curve.getPoint(t), tangent = curve.getTangent(t).normalize();
      const slab = new THREE.Mesh(new THREE.BoxGeometry(between(0.65, 0.82), 0.065, between(0.40, 0.50)), choose(stones));
      slab.position.set(p.x + between(-0.035, 0.035), 0.10, p.z + between(-0.035, 0.035));
      slab.rotation.y = Math.atan2(tangent.x, tangent.z) + between(-0.055, 0.055);
      scene.add(slab);
      if (i % 3 === 0) put('石', slab.position.x, 0.165, slab.position.z, '#c5b8a5', 0.15);
      if (i % 2 === 0) {
        const side = i % 4 === 0 ? -1 : 1;
        const x = p.x + tangent.z * side * between(0.67, 0.98);
        const z = p.z - tangent.x * side * between(0.67, 0.98);
        for (let k = 0; k < 8; k++) {
          put(k % 4 === 0 ? inkLetter(roadsideVerse, i + k)
            : inkLetter(sourceInk.foliage, i + k), x + between(-0.25, 0.25),
            between(0.13, 0.57), z + between(-0.28, 0.28),
            k % 4 === 0 ? '#c7797d' : '#71816b', k % 4 === 0 ? 0.17 : 0.13);
        }
      }
    }
  }
  function willow(cx, cz, height) {
    const trunkAt = t => new THREE.Vector3(cx + 0.28 * Math.sin(t * 2.2),
      0.10 + height * t, cz + 0.18 * Math.sin(t * 1.8));
    for (let i = 0; i < 140; i++) {
      const t = i / 139 * 0.79, p = trunkAt(t);
      const upperTaper = 1 - THREE.MathUtils.smoothstep(t, 0.61, 0.79);
      const radius = (0.28 * (1 - t) + 0.052) * (0.20 + 0.80 * upperTaper);
      // Offset the two rings of source-text marks so a nearby view has no empty seams.
      const outerCount = t > 0.72 ? 9 : 15;
      for (let side = 0; side < outerCount; side++) {
        const a = side * Math.PI * 2 / outerCount + t * 0.46;
        put(inkLetter(sourceInk.willow, i + side), p.x + Math.cos(a) * radius, p.y,
          p.z + Math.sin(a) * radius, choose(['#6d6859', '#786f5d', '#887c68']),
          0.14 + 0.03 * upperTaper);
      }
      const innerCount = t > 0.72 ? 5 : 11;
      for (let side = 0; side < innerCount; side++) {
        const a = (side + 0.43) * Math.PI * 2 / innerCount + t * 0.46;
        put(inkLetter(sourceInk.willow, i * 2 + side), p.x + Math.cos(a) * (radius - 0.018),
          p.y + 0.027, p.z + Math.sin(a) * (radius - 0.018), '#827765', 0.12);
      }
    }
    for (let arm = 0; arm < 22; arm++) {
      const a = arm * Math.PI * 2 / 22 + 0.35 + between(-0.11, 0.11);
      const start = trunkAt(between(0.53, 0.79));
      const reach = between(2.0, 3.55);
      const end = new THREE.Vector3(cx + Math.cos(a) * reach,
        start.y + between(0.22, 1.08), cz + Math.sin(a) * reach);
      const branch = new THREE.QuadraticBezierCurve3(start,
        new THREE.Vector3((start.x + end.x) / 2, end.y + 0.45, (start.z + end.z) / 2), end);
      for (let i = 0; i <= 44; i++) {
        const p = branch.getPoint(i / 44);
        put(inkLetter(sourceInk.willow, i), p.x, p.y, p.z, '#6c6857', 0.16);
      }
      for (let strand = 0; strand < 9; strand++) {
        const p = branch.getPoint(0.19 + strand * 0.09);
        const drop = between(1.25, 2.28);
        const phase = between(0, Math.PI * 2);
        for (let i = 0; i < 25; i++) {
          const t = i / 24;
          const sway = 0.13 * Math.sin(t * 5.2 + phase);
          const x = p.x + sway + Math.cos(a) * t * 0.17;
          const y = p.y - drop * t;
          const z = p.z + 0.09 * Math.sin(t * 4.3 + phase) + Math.sin(a) * t * 0.17;
          put(inkLetter(sourceInk.willow, i + strand * 2 + arm), x, y, z,
            choose(['#66856b', '#789777', '#8da787']), 0.13);
          if (i > 2 && i < 23 && i % 3 === 0) {
            const leafWidth = 0.13 * Math.sin(Math.PI * t);
            for (const sign of [-1, 1]) {
              put(inkLetter(sourceInk.willow, i + strand + sign + arm),
                x + sign * Math.cos(a + Math.PI / 2) * leafWidth,
                y + sign * 0.025,
                z + sign * Math.sin(a + Math.PI / 2) * leafWidth,
                choose(['#719170', '#87a486', '#9bb399']), 0.12);
            }
          }
        }
      }
    }
  }
  function beanArbor(cx, cz) {
    const arborVerse = [...'豆棚花架满庭中'];
    for (const dx of [-1.75, 1.75]) {
      for (const dz of [-1.25, 1.25]) {
        beam(scene, cx + dx, 1.35, cz + dz, 0.13, 2.55, 0.13);
      }
    }
    for (const dz of [-1.25, 0, 1.25]) beam(scene, cx, 2.68, cz + dz, 3.75, 0.11, 0.12);
    for (const dx of [-1.75, -0.85, 0, 0.85, 1.75]) beam(scene, cx + dx, 2.75, cz, 0.08, 0.09, 2.9);
    for (let vine = 0; vine < 32; vine++) {
      const x = cx + between(-1.8, 1.8), z = cz + between(-1.3, 1.3);
      const length = between(0.30, 1.45);
      for (let j = 0; j < 12; j++) {
        const t = j / 11;
        put(inkLetter(arborVerse, j + vine * 2), x + 0.11 * Math.sin(t * 8 + vine),
          2.70 - length * t, z, choose(['#586c53', '#718267', '#849879']), 0.15);
      }
    }
  }
  function bird(cx, cy, cz, spread) {
    const points = [
      new THREE.Vector3(cx - spread, cy + spread * 0.18, cz),
      new THREE.Vector3(cx - spread * 0.32, cy, cz),
      new THREE.Vector3(cx, cy + spread * 0.07, cz),
      new THREE.Vector3(cx + spread * 0.32, cy, cz),
      new THREE.Vector3(cx + spread, cy + spread * 0.18, cz),
    ];
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: '#7d786b', transparent: true, opacity: 0.58 })));
  }

  // Distant roofs are glimpsed between the near folds before the main house appears.
  cottage(6.4, -35.6, 3.8, 3.0, 2.1, 1, -0.18);
  cottage(-22.5, -35.0, 3.5, 2.8, 2.05, 1, 0.22);
  gardenWash(-11.3, -27.1, 9.7, 8.3, 'rgba(128,157,111,0.40)');
  gardenWash(-13.6, -41.3, 10.5, 9.0, 'rgba(130,165,119,0.45)');
  boundary(-19.0, -20.5, -9.25, -20.5);
  boundary(-6.35, -20.5, -3.05, -20.5);
  boundary(-19.0, -20.5, -19.0, -34.7);
  boundary(-3.05, -20.5, -3.05, -34.7);
  boundary(-19.0, -34.7, -18.0, -34.7);
  boundary(-15.55, -34.7, -3.05, -34.7);
  gate(-7.80, -20.5, 2.66);
  gate(-16.78, -34.7, 2.35);
  cottage(-11.15, -27.65, 7.55, 4.75, 2.72);
  cottage(-12.15, -45.0, 8.35, 3.72, 2.45, 3);
  stoneTrail([
    [pathX(-18), -18], [-7.80, -20.5], [-8.15, -23.1],
    [-10.45, -25.3], [-14.85, -28.3], [-17.05, -31.4],
    [-16.78, -34.7], [-14.6, -38.2], [-12.15, -43.00],
  ], 72);
  willow(-13.2, -19.6, 6.35);
  willow(-4.65, -19.45, 5.90);
  const orchard = [
    [-16.3, -25.8, 4.6, 2.65, 'peach'],
    [-5.1, -30.7, 4.55, 2.65, 'apricot'],
    [-7.0, -27.2, 3.35, 2.1, 'crabapple'],
    [-17.4, -42.8, 4.7, 2.75, 'apricot'],
    [-6.9, -42.5, 4.45, 2.7, 'peach'],
  ];
  for (const [x, z, h, radius, kind] of orchard) {
    blossomSites.push([x, z, radius]);
    await addTree(x, z, h, radius, true, kind);
    await yieldToOpening();
  }
  beanArbor(-15.0, -31.8);
  for (const [cx, cz, spread] of [
    [-20.2, -38.1, 1.3], [-20.4, -44.8, 1.55], [-5.0, -38.4, 1.3],
    [-4.7, -46.5, 1.5], [-18.1, -48.2, 1.2], [-8.0, -48.6, 1.25],
    [-18.1, -26.5, 1.0], [-4.5, -24.4, 1.05],
  ]) {
    for (let i = 0; i < 155; i++) {
      const a = random() * Math.PI * 2, r = Math.sqrt(random()) * spread;
      const flower = random() < 0.22;
      put(inkLetter(flower ? sourceInk.blossom : sourceInk.foliage, i),
        cx + Math.cos(a) * r,
        between(0.10, 0.85) * (1 - r / (spread * 1.25)),
        cz + Math.sin(a) * r,
        flower ? choose(['#c98388', '#e3a8a4', '#f0c6bb'])
          : choose(['#6b7d62', '#829478', '#a0aa89']),
        flower ? 0.15 : 0.13);
    }
  }
  for (let i = 0; i < 6300; i++) {
    const x = between(-21, -4), z = between(-49, -34.8);
    if (Math.abs(x + 12.15) < 4.5 && Math.abs(z + 45.0) < 2.2) continue;
    put(inkLetter(sourceInk.grass, i), x, between(0.09, 0.19), z,
      choose(['#7b926d', '#8fa181', '#9aaa8b']), between(0.10, 0.14));
  }
  for (let i = 0; i < 75; i++) {
    const x = between(-17.7, -6.0), z = between(-48, -35);
    put(inkLetter([...'杨花糁迳'], i), x, 0.12, z, '#e6ded2', 0.12);
  }
  bird(-6.0, 5.6, -25.0, 0.24);
  bird(-4.8, 6.0, -26.3, 0.16);
  bird(-8.2, 5.2, -27.5, 0.19);
}

// Low letter-sized grasses and blossoms soften the open hilltops without blocking their silhouette.
function addSummitFlowers(cx, cz, rx, rz, count) {
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    const radial = Math.sqrt(random()) * 0.58;
    const x = cx + Math.cos(angle) * rx * radial;
    const z = cz + Math.sin(angle) * rz * radial;
    if (Math.abs(x - pathX(z)) < 2.6 || Math.abs(x - riverX(z)) < 2.65) continue;
    if (summitScore(x, z) < 0.55) continue;
    const flowering = random() < 0.22;
    put(expandedInk ? inkLetter(flowering ? sourceInk.blossom : sourceInk.grass, i)
      : flowering ? '花' : '草', x, ground(x, z) + between(0.09, 0.25), z,
      flowering ? choose(['#c98e91', '#dfa8a3', '#e7bbb2'])
        : choose(['#777e67', '#899079', '#9b9d85']), flowering ? between(0.15, 0.19) : between(0.13, 0.17));
  }
}
if (!layeredInk) {
  for (const fold of scenicFolds) addSummitFlowers(fold.x, fold.z, fold.rx, fold.rz, 100);
  for (const hill of rollingHills) addSummitFlowers(hill.x, hill.z, hill.rx, hill.rz, 90);
} else if (expandedInk) {
  for (const fold of scenicFolds) addSummitFlowers(fold.x, fold.z, fold.rx, fold.rz, 28);
  for (const hill of rollingHills) addSummitFlowers(hill.x, hill.z, hill.rx, hill.rz, 14);
}

// Local mist marks a bend; it thins naturally as the camera approaches and passes it.
const mistCanvas = document.createElement('canvas');
mistCanvas.width = mistCanvas.height = 128;
const mistInk = mistCanvas.getContext('2d');
const mistGradient = mistInk.createRadialGradient(64, 64, 8, 64, 64, 64);
mistGradient.addColorStop(0, 'rgba(245,240,231,0.75)');
mistGradient.addColorStop(0.45, 'rgba(245,240,231,0.38)');
mistGradient.addColorStop(1, 'rgba(245,240,231,0)');
mistInk.fillStyle = mistGradient;
mistInk.fillRect(0, 0, 128, 128);
const mistTexture = new THREE.CanvasTexture(mistCanvas);
for (const fold of scenicFolds) {
  const z = fold.z - 3.5, x = pathX(z);
  const mist = new THREE.Sprite(new THREE.SpriteMaterial({
    map: mistTexture, color: '#f0e6d3', transparent: true, opacity: 0.28,
    depthWrite: false, fog: false,
  }));
  mist.position.set(x, ground(x, z) + 1.35, z);
  mist.scale.set(11.0, 4.0, 1);
  scene.add(mist);
}

// A modest tea place is tucked beneath the old flowering tree.
if (!layeredInk) {
  const teaX = 9.1, teaZ = -3.5, teaFloor = ground(teaX, teaZ);
  for (let x = -1.1; x <= 1.1; x += 0.19) {
    for (let z = -0.68; z <= 0.68; z += 0.19) {
      if ((x / 1.1) ** 2 + (z / 0.68) ** 2 < 1) put(nextLetter('teaSeat'), teaX + x, teaFloor + 0.66, teaZ + z, '#766954', 0.19);
    }
  }
  for (const dx of [-0.69, 0.69]) {
    for (const dz of [-0.34, 0.34]) {
      for (let y = 0.1; y < 0.65; y += 0.13) put(nextLetter('teaLeg'), teaX + dx, teaFloor + y, teaZ + dz, '#6b6052', 0.18);
    }
  }
  for (const side of [-1, 1]) {
    for (let i = 0; i < 65; i++) {
      const x = teaX + side * between(1.34, 2.55);
      const z = teaZ + between(-1.0, 1.0);
      put(nextLetter('mat'), x, ground(x, z) + 0.08, z, '#a39883', 0.20);
    }
  }
}
// Actual peach-petal silhouettes replace the drifting text. A soft painted texture
// keeps them distinct from the calligraphic landscape without looking like confetti.
const petalCanvas = document.createElement('canvas');
petalCanvas.width = petalCanvas.height = 128;
const petalInk = petalCanvas.getContext('2d');
const petalFill = petalInk.createLinearGradient(48, 108, 74, 18);
petalFill.addColorStop(0, '#fff8ef');
petalFill.addColorStop(0.34, '#ffe6e3');
petalFill.addColorStop(0.72, '#f4b7bf');
petalFill.addColorStop(1, '#e999a9');
petalInk.beginPath();
petalInk.moveTo(64, 113);
petalInk.bezierCurveTo(53, 102, 35, 79, 32, 53);
petalInk.bezierCurveTo(29, 28, 45, 14, 61, 21);
petalInk.bezierCurveTo(69, 12, 87, 22, 94, 43);
petalInk.bezierCurveTo(103, 74, 83, 102, 64, 113);
petalInk.closePath();
petalInk.fillStyle = petalFill;
petalInk.fill();
petalInk.strokeStyle = 'rgba(185,99,119,0.15)';
petalInk.lineWidth = 1.2;
petalInk.stroke();
petalInk.strokeStyle = 'rgba(255,255,248,0.42)';
for (const side of [-1, 1]) {
  petalInk.beginPath();
  petalInk.moveTo(64, 107);
  petalInk.quadraticCurveTo(64 + side * 8, 73, 64 + side * 16, 40);
  petalInk.stroke();
}
const petalTexture = new THREE.CanvasTexture(petalCanvas);
petalTexture.colorSpace = THREE.SRGBColorSpace;
petalTexture.minFilter = THREE.LinearFilter;
const petalMaterial = new THREE.MeshBasicMaterial({
  map: petalTexture, transparent: true, side: THREE.DoubleSide,
  depthWrite: false, alphaTest: 0.04, opacity: 0.91,
});
const petalCount = 230;
const petalMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), petalMaterial, petalCount);
petalMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
petalMesh.frustumCulled = false;
scene.add(petalMesh);
const petalMotion = [];
for (let i = 0; i < petalCount; i++) {
  let x, z;
  if (i % 3 === 0 || blossomSites.length === 0) {
    z = between(-35, 37);
    x = pathX(z) + between(-2.5, 2.5);
  } else {
    const [treeX, treeZ, crownRadius] = blossomSites[i % blossomSites.length];
    const angle = between(0, Math.PI * 2);
    const distance = Math.sqrt(random()) * crownRadius * 1.30;
    x = treeX + Math.cos(angle) * distance;
    z = treeZ + Math.sin(angle) * distance;
  }
  petalMotion.push({
    x, z, phase: between(0, 5.8), fall: between(0.16, 0.30),
    sway: between(0.14, 0.36), wobble: between(0, Math.PI * 2),
    spin: between(-0.82, 0.82), size: between(0.14, 0.25),
  });
  const petalTone = expandedInk && z < -34 && i % 3 === 0
    ? choose(['#fffdf2', '#f5f2e9', '#f7f4ea'])
    : choose(['#fff7ef', '#ffe5e5', '#f9d5d5', '#f5c9d1']);
  petalMesh.setColorAt(i, new THREE.Color(petalTone));
}
if (petalMesh.instanceColor) petalMesh.instanceColor.needsUpdate = true;
const petalObject = new THREE.Object3D();

// Rocks and clouds also remain typographic objects, with no polygon props.
if (!layeredInk) {
  for (const [cx, cz] of [[8, 5], [8.9, -5], [1.1, -21], [-10, 2], [6.6, -31],
    [11, 25], [-14, 28], [24, 14], [-23, 15], [27, -15], [-27, -20]]) {
    for (let i = 0; i < 74; i++) {
      const x = cx + between(-1.0, 1.0);
      const z = cz + between(-0.7, 0.7);
      const h = 0.1 + 0.85 * Math.max(0, 1 - Math.hypot(x - cx, z - cz));
      put(nextLetter('rocks'), x, ground(x, z) + between(0, h), z, choose(['#8e8778', '#b6aa99', '#777163']), 0.23);
    }
  }
  for (let c = 0; c < 18; c++) {
    const angle = between(0, Math.PI * 2), distance = between(36, 58);
    const cx = Math.cos(angle) * distance, cy = between(10, 17), cz = Math.sin(angle) * distance;
    for (let i = 0; i < 48; i++) put(nextLetter('clouds'), cx + between(-3.2, 3.2), cy + between(-0.7, 0.7), cz + between(-0.7, 0.7), '#d9d0c3', 0.52);
  }
}

// The readable lines are uninterrupted inscriptions, not another scatter layer.
function inscribeLine(text, z, color) {
  const step = 0.13;
  const startX = pathX(z) - ([...text].length - 1) * step * 0.5;
  [...text].forEach((char, index) => {
    const x = startX + index * step;
    put(char, x, ground(x, z) + 0.23, z, color, 0.35);
  });
}
if (!layeredInk) {
  inscribeLine('窃闻山中有草，名「笑矣乎」。', 4.7, '#4e453b');
  inscribeLine('嗅之则笑不可止。', 0.8, '#5d5042');
  inscribeLine('房中植此一种，则合欢、忘忧，', -7.5, '#625445');
  inscribeLine('并无颜色矣。', -11.1, '#625445');
  inscribeLine('若解语花，正嫌其作态耳。', -16.5, '#625445');
  inscribeLine('窃闻山中有草，名「笑矣乎」。', 26.5, '#5d5042');
  inscribeLine('房中植此一种，则合欢、忘忧，', 31.4, '#625445');
  for (let z = 38; z > -34; z -= 8.2) {
    const phrase = choose(['笑矣乎', '解语花', '合欢忘忧']);
    [...phrase].forEach((char, i) => {
      const zz = z - i * 0.62;
      const x = pathX(zz) + 0.16 * Math.sin(i * 1.8 + z);
      put(char, x, ground(x, zz) + 0.28, zz, '#65584d', 0.61);
    });
  }
}

// A few readable lines breathe through the painted hill volume.
if (expandedInk) {
  const hillVerse = [...'乱山合沓空翠爽肌谷底有鸟道丛花乱树'];
  for (const hill of [...scenicFolds, rollingHills[2], rollingHills[5], rollingHills[6]]) {
    for (let column = 0; column < 14; column++) {
      const x = hill.x + (column - 6.5) * hill.rx * 0.105;
      const z = hill.z + 2.24 + 0.13 * Math.sin(column * 0.72);
      const local = Math.max(0, 1 - ((x - hill.x) / (hill.rx * 0.9)) ** 2);
      const rise = hill.rise * Math.pow(local, 0.8) * 0.78;
      for (let row = 0; row < Math.floor(rise / 0.31); row++) {
        put(hillVerse[(row + column * 3) % hillVerse.length],
          x, 0.28 + row * 0.31, z,
          row % 4 === 0 ? '#7a8d79' : '#9a9d87', 0.19, 'mountain');
      }
    }
  }
}

const materials = [];
const waterObjects = [];
const pathObjects = [];
const staticInk=[];
for (const bucket of buckets.values()) {
  if(materials.length%8===0)await yieldToOpening();
  if (expandedInk && (bucket.motion === 'river' || bucket.motion === 'path')) continue;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(bucket.positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(bucket.colors, 3));
  geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(bucket.sizes, 1));
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: glyphTexture(bucket.char) },
      uViewport: { value: renderer.domElement.height },
      uPointCap: {value:renderer.getPixelRatio()/(document.body.classList.contains('mobile-visitor')?1.25:1.6)},
      uFog: { value: new THREE.Color('#f0e6d3') },
    },
    vertexShader: [
      'attribute vec3 color;',
      'attribute float aSize;',
      'varying vec3 vColor;',
      'varying float vDistance;',
      'uniform float uViewport;',
      'uniform float uPointCap;',
      'void main() {',
      '  vColor = color;',
      '  vec4 view = modelViewMatrix * vec4(position, 1.0);',
      '  vDistance = -view.z;',
      '  float depth = max(0.35, -view.z);',
      '  float inkWash = smoothstep(5.0, 17.0, depth);',
      '  float maxSize = aSize < 0.12 ? 18.0 : (aSize < 0.25 ? 27.0 : 38.0);',
      '  gl_PointSize = clamp(aSize * uViewport / pow(depth, 1.10) * mix(1.0, 1.5, inkWash), 1.0, maxSize*uPointCap);',
      '  gl_Position = projectionMatrix * view;',
      '}',
    ].join('\n'),
    fragmentShader: [
      'uniform sampler2D uMap;',
      'uniform vec3 uFog;',
      'varying vec3 vColor;',
      'varying float vDistance;',
      'void main() {',
      '  vec4 glyph = texture2D(uMap, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));',
      '  float inkWash = smoothstep(18.0, 48.0, vDistance);',
      '  float brush = 1.0 - smoothstep(0.20, 0.92, length(gl_PointCoord * 2.0 - 1.0));',
      '  float alpha = mix(smoothstep(0.04, 0.94, glyph.a) * 0.86, brush * 0.18, inkWash * 0.22);',
      '  if (alpha < 0.06) discard;',
      '  float fog = clamp((vDistance - 28.0) / 83.0, 0.0, 0.72);',
      '  vec3 ink = mix(vColor, uFog, fog);',
      '  gl_FragColor = vec4(ink, alpha * (1.0 - fog * 0.27));',
      '}',
    ].join('\n'),
    transparent: true,
    depthWrite: true,
  });
  materials.push(material);
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);
  if(bucket.motion==='still')staticInk.push({char:bucket.char,points});
  if (bucket.motion === 'path') pathObjects.push({ points, origin: Float32Array.from(bucket.positions),
    sizes: Float32Array.from(bucket.sizes), colors: Float32Array.from(bucket.colors) });
  else if (bucket.motion !== 'still') waterObjects.push({ points, origin: Float32Array.from(bucket.positions), motion: bucket.motion });
}

const batchedInk=batchStaticInk(scene,staticInk);
if(batchedInk)materials.push(batchedInk.material);
const sceneView = new URLSearchParams(location.search).get('view');
let yaw = prototypeInk ? -0.44 : expandedInk
  ? sceneView === 'garden' ? 0.02 : sceneView === 'village' ? -0.05
    : sceneView === 'yingning' ? 0.65 : sceneView === 'river' ? 0.08 : 0.05 : 0.17;
let pitch = prototypeInk ? 0.08 : expandedInk ? 0.025 : -0.025;
const startZ = expandedInk && sceneView === 'village' ? -10.0
  : expandedInk && sceneView === 'garden' ? -36.0
    : expandedInk && sceneView === 'yingning' ? -1.0 : 33.5;
const startX = expandedInk && sceneView === 'garden' ? -12.1
  : expandedInk && sceneView === 'yingning' ? 5.0
    : expandedInk && sceneView === 'river' ? riverX(startZ)
      : pathX(startZ) + (prototypeInk ? 2.7 : 0);
function walkingFloor(x, z) {
  return ground(x, z);
}
camera.position.set(startX, walkingFloor(startX, startZ) + 1.73, startZ);
let arrivalUnlockAt = 0;
const prologueEnabled = expandedInk && !sceneView && new URLSearchParams(location.search).get('intro') !== '0';
function enterValley(){
  document.body.classList.remove('prologue-active', 'prologue-revealed');
  for(const link of document.querySelectorAll('.chapter-nav a')){
    if(link.getAttribute('href').includes('space=nanshan'))link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  }
  document.body.classList.add('arrival', 'arrival-observe');
  arrivalUnlockAt = performance.now() + 450;
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('arrival-clearing')));
  setTimeout(() => document.body.classList.remove('arrival', 'arrival-clearing'), 650);
  setTimeout(() => document.body.classList.remove('arrival-observe'), 450);
}
const prologue = opening?.prologue ?? (prologueEnabled ? createPrologue(renderer, enterValley) : null);
if (!prologueEnabled) document.body.classList.remove('prologue-active');

// The first encounter is deliberately partial: a laugh among the letters,
// falling petals, then a sleeve glimpsed only when the visitor looks up.
const encounterCaption = document.getElementById('encounter-caption');
const ancientTreeTag = document.getElementById('ancient-tree-tag');
const encounterDebug = new URLSearchParams(location.search).has('qa')
  ? Object.assign(document.createElement('div'), {
    style:'position:fixed;z-index:99;left:12px;top:90px;padding:8px;background:#fff;color:#000;font:14px monospace',
  }) : null;
if (encounterDebug) document.body.append(encounterDebug);
let captionTimer = 0;
function showEncounterCaption(message, duration = 3600) {
  if (!encounterCaption) return;
  clearTimeout(captionTimer);
  encounterCaption.textContent = message;
  encounterCaption.classList.add('visible');
  captionTimer = setTimeout(() => encounterCaption.classList.remove('visible'), duration);
}
const encounterSite = expandedInk && blossomSites.length
  ? blossomSites.reduce((closest, site) => Math.hypot(site[0] - 9.2, site[1] + 6.4)
    < Math.hypot(closest[0] - 9.2, closest[1] + 6.4) ? site : closest)
  : null;
const encounterTree = encounterSite ? {
  x:encounterSite[0], z:encounterSite[1], radius:encounterSite[2],
  floor:ground(encounterSite[0], encounterSite[1]),
} : null;
const encounterState = {
  phase:sceneView === 'yingning' ? 2 : 0,
  dwellAt:0, anchorX:camera.position.x, anchorZ:camera.position.z,
  firstAt:sceneView === 'yingning' ? -4 : -100,
  secondAt:sceneView === 'yingning' ? 0 : -100,
  petalsAt:-100, petalCount:0,
  sleeveAt:-100, sleeveSeen:sceneView === 'yingning', greetingHintShown:false,
};
let yingningCharacter = null;
if (encounterTree) {
  const characterX = encounterTree.x - 1.2;
  const characterZ = encounterTree.z + 1.8;
  createYingningCharacter(scene, characterX, characterZ,
    ground(characterX, characterZ) + 0.03).then(character => {
    yingningCharacter = character;
    if (new URLSearchParams(location.search).has('qa')) document.body.dataset.character = 'loaded';
  }).catch(error => {
    if (new URLSearchParams(location.search).has('qa')) document.body.dataset.character = 'error:' + error.message;
    console.error('婴宁人物加载失败：', error);
  });
}
const yingningStory = encounterTree ? createYingningStory({
  scene, camera, tree:encounterTree, ground, caption:showEncounterCaption,
}) : null;
const sleeveCanvas = document.createElement('canvas');
sleeveCanvas.width = 128; sleeveCanvas.height = 192;
const sleeveInk = sleeveCanvas.getContext('2d');
const sleeveShade = sleeveInk.createLinearGradient(22, 20, 107, 171);
sleeveShade.addColorStop(0, '#fffdf5');
sleeveShade.addColorStop(0.56, '#efe8db');
sleeveShade.addColorStop(1, '#d5c9ba');
sleeveInk.beginPath();
sleeveInk.moveTo(44, 10);
sleeveInk.bezierCurveTo(63, 6, 77, 14, 84, 32);
sleeveInk.bezierCurveTo(77, 59, 97, 112, 113, 152);
sleeveInk.bezierCurveTo(89, 166, 55, 178, 24, 164);
sleeveInk.bezierCurveTo(37, 127, 46, 78, 34, 42);
sleeveInk.closePath();
sleeveInk.fillStyle = sleeveShade; sleeveInk.fill();
sleeveInk.strokeStyle = 'rgba(112,93,79,.35)'; sleeveInk.lineWidth = 2; sleeveInk.stroke();
sleeveInk.beginPath();
sleeveInk.moveTo(28, 151); sleeveInk.quadraticCurveTo(70, 169, 108, 143);
sleeveInk.strokeStyle = 'rgba(174,143,139,.5)'; sleeveInk.lineWidth = 3; sleeveInk.stroke();
const sleeveTexture = new THREE.CanvasTexture(sleeveCanvas);
sleeveTexture.colorSpace = THREE.SRGBColorSpace;
const encounterSleeve = new THREE.Sprite(new THREE.SpriteMaterial({
  map:sleeveTexture, transparent:true, opacity:0, depthWrite:false,
}));
encounterSleeve.visible = false;
if (encounterTree) {
  encounterSleeve.position.set(encounterTree.x - encounterTree.radius * 0.18,
    encounterTree.floor + 4.95, encounterTree.z + 0.2);
  encounterSleeve.scale.set(0.48, 0.72, 1);
  scene.add(encounterSleeve);
}
const encounterPetals = encounterTree ? Array.from({ length:7 }, (_, i) => {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map:petalTexture, transparent:true, opacity:0, depthWrite:false,
  }));
  sprite.visible = false;
  sprite.scale.set(0.22 + (i % 3) * 0.04, 0.32 + (i % 3) * 0.04, 1);
  scene.add(sprite);
  return sprite;
}) : [];
const laughLetters = encounterTree ? Array.from({ length:3 }, (_, i) => {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map:glyphTexture('笑'), color:'#8c7770', transparent:true,
    opacity:0, depthTest:false, depthWrite:false,
  }));
  sprite.visible = false;
  sprite.scale.setScalar(0.20 + i * 0.035);
  scene.add(sprite);
  return sprite;
}) : [];
const treeGazeDirection = new THREE.Vector3();
const viewerGazeDirection = new THREE.Vector3();
const treeTagPoint = new THREE.Vector3();
let guideAim=null;
const treeGuide=document.createElement('button');treeGuide.className='tree-guide';treeGuide.type='button';treeGuide.hidden=true;
treeGuide.setAttribute('aria-label','看向笑声古树');treeGuide.title='点击转向古树，再按向前靠近';document.body.append(treeGuide);
treeGuide.onclick=()=>{
  if(!encounterTree)return;
  const target=encounterState.phase>=2&&yingningCharacter?.actor.visible?{x:yingningCharacter.actor.position.x,y:yingningCharacter.actor.position.y+1,z:yingningCharacter.actor.position.z}:{x:encounterTree.x,y:encounterTree.floor+2,z:encounterTree.z};
  const dx=target.x-camera.position.x,dz=target.z-camera.position.z,bearing=treeBearing(dx,dz,yaw);
  guideAim={at:performance.now(),fromYaw:yaw,fromPitch:pitch,toYaw:bearing.heading,toPitch:THREE.MathUtils.clamp(Math.atan2(target.y-camera.position.y,Math.hypot(dx,dz)),-.46,.52)};
};
function updateEncounter(time) {
  if (!encounterTree) return;
  const state = encounterState;
  const distance = Math.hypot(camera.position.x - encounterTree.x,
    camera.position.z - encounterTree.z);
  treeGuide.hidden=(yingningStory?.state.stage??0)>0||!!yingningStory?.state.active;
  if(!treeGuide.hidden){const message=guideMessage(treeBearing(encounterTree.x-camera.position.x,encounterTree.z-camera.position.z,yaw),distance,state.phase);if(treeGuide.textContent!==message)treeGuide.textContent=message;}
  if (ancientTreeTag) {
    camera.updateMatrixWorld();
    treeTagPoint.set(encounterTree.x, encounterTree.floor + 5.9,
      encounterTree.z).project(camera);
    const inView = treeTagPoint.z > -1 && treeTagPoint.z < 1
      && Math.abs(treeTagPoint.x) < 0.86 && treeTagPoint.y > -0.78 && treeTagPoint.y < 0.78;
    ancientTreeTag.classList.toggle('visible', distance > 3 && inView);
    if (inView) {
      ancientTreeTag.style.left = `${(treeTagPoint.x * 0.5 + 0.5) * viewSize().width}px`;
      ancientTreeTag.style.top = `${(-treeTagPoint.y * 0.5 + 0.5) * viewSize().height}px`;
    }
  }
  const drift = Math.hypot(camera.position.x - state.anchorX,
    camera.position.z - state.anchorZ);
  if (drift > 0.22 || distance > 18) {
    state.anchorX = camera.position.x; state.anchorZ = camera.position.z;
    state.dwellAt = time;
  }
  if (state.phase === 0 && distance <= 18 && time - state.dwellAt >= 2) {
    state.phase = 1;
    state.firstAt = time;
    state.petalsAt = time;
    state.petalCount = 3;
    showEncounterCaption('枝头忽有轻笑。抬头望向花间。');
  }
  if (state.phase === 1 && distance <= 8 && time - state.firstAt > 1.5) {
    state.phase = 2;
    state.secondAt = time;
    state.petalsAt = time;
    state.petalCount = 7;
    showEncounterCaption('闻树头苏苏有声，花影中灵狐回眸。', 4200);
  }
  yingningCharacter?.update(time, camera.position,
    state.phase >= 2 ? state.secondAt + 0.6 : -1);
  yingningStory?.update(time, yingningCharacter?.actor.visible ?? false);
  if (yingningCharacter?.actor.visible && !state.greetingHintShown
    && yingningStory?.state.stage === 0
    && time - state.secondAt > 4.2
    && Math.hypot(camera.position.x - yingningCharacter.actor.position.x,
      camera.position.z - yingningCharacter.actor.position.z) < 7) {
    state.greetingHintShown = true;
    showEncounterCaption('走近并点击灵狐，听婴宁回应。', 3600);
  }
  for (let i = 0; i < encounterPetals.length; i++) {
    const sprite = encounterPetals[i];
    const age = time - state.petalsAt - i * 0.31;
    sprite.visible = i < state.petalCount && age >= 0 && age < 5;
    if (!sprite.visible) continue;
    const sway = Math.sin(age * 1.35 + i * 2.4);
    sprite.position.set(encounterTree.x + Math.sin(i * 2.4) * 1.4 + sway * 0.24,
      encounterTree.floor + 5.1 - age * 0.35,
      encounterTree.z + Math.cos(i * 2.1) * 1.0 + age * 0.12);
    sprite.material.opacity = 0.8 * Math.min(1, age * 2.8) * Math.min(1, (5 - age) * 1.8);
    sprite.material.rotation = age * 0.65 + i;
  }
  for (let i = 0; i < laughLetters.length; i++) {
    const sprite = laughLetters[i];
    const age = time - state.firstAt - i * 0.32;
    sprite.visible = age >= 0 && age < 2.1;
    if (!sprite.visible) continue;
    sprite.position.set(encounterTree.x - 0.3 + i * 0.31,
      encounterTree.floor + 4.55 + age * 0.28,
      encounterTree.z + 0.25);
    sprite.material.opacity = 0.44 * Math.sin(Math.PI * age / 2.1);
  }
  if (state.phase && !state.sleeveSeen && time - state.firstAt > 0.65) {
    treeGazeDirection.set(encounterSleeve.position.x - camera.position.x,
      encounterSleeve.position.y - camera.position.y,
      encounterSleeve.position.z - camera.position.z).normalize();
    camera.getWorldDirection(viewerGazeDirection);
    if (treeGazeDirection.dot(viewerGazeDirection) > 0.91) {
      state.sleeveSeen = true;
      state.sleeveAt = time;
    }
  }
  const sleeveAge = time - state.sleeveAt;
  encounterSleeve.visible = false;
  if (encounterSleeve.visible) {
    encounterSleeve.material.opacity = 0.78 * Math.min(1, sleeveAge * 10)
      * Math.min(1, (0.65 - sleeveAge) * 9);
  }
  if (new URLSearchParams(location.search).has('qa')) {
    window.__encounterQA = { phase:state.phase, distance, sleeveSeen:state.sleeveSeen,
      tree:{ x:encounterTree.x, z:encounterTree.z },
      characterVisible:yingningCharacter?.actor.visible ?? false };
    document.body.dataset.encounter = `${state.phase}/${yingningCharacter?.actor.visible ?? false}`;
    encounterDebug.textContent = `phase=${state.phase} distance=${distance.toFixed(1)}
      load=${document.body.dataset.character || 'pending'} visible=${yingningCharacter?.actor.visible ?? false}`;
  }
}
if (prototypeInk) {
  document.querySelector('.legend').textContent = '分层成山 · 花径入谷';
  document.querySelector('.hint').innerHTML = '左前方是一座分层文字山样板<br>拖动视角比较远景与近景';
} else if (expandedInk) {
  document.querySelector('.legend').textContent = '乱山鸟道 · 谷底花坞';
  document.querySelector('.hint').innerHTML = sceneView === 'yingning'
    ? '婴宁人物近景 · 拖动视角观察衣袖与花树<br>点击方向键可走近人物'
    : '循鸟道下山，沿溪寻找「笑声古树」<br>点击方向键，留意花径上的文字波纹';
}
function updateCamera() {
  camera.position.y = walkingFloor(camera.position.x, camera.position.z) + 1.73;
  camera.lookAt(camera.position.x + Math.sin(yaw) * Math.cos(pitch), camera.position.y + Math.sin(pitch), camera.position.z - Math.cos(yaw) * Math.cos(pitch));
}
updateCamera();
function footSurface(x, z) {
  if (z > -42 && Math.abs(x - riverX(z)) < 1.55) return 'water';
  if (Math.abs(x - pathX(z)) < 1.18) return 'path';
  return 'meadow';
}
const rippleTones = {
  path: new THREE.Color('#a18d70'),
  water: new THREE.Color('#8faeaf'),
  meadow: new THREE.Color('#a5aa8a'),
};
function footTint(x, z, surface) {
  const ix = THREE.MathUtils.clamp(Math.round((x + 55) / 110 * 176), 0, 176);
  const iz = THREE.MathUtils.clamp(Math.round((z + 55) / 110 * 176), 0, 176);
  const index = (iz * 177 + ix) * 3;
  return new THREE.Color(landColors[index], landColors[index + 1], landColors[index + 2])
    .lerp(rippleTones[surface], surface === 'water' ? 0.77 : 0.64);
}
const rippleWaves = expandedInk ? Array.from({ length: 5 }, () => {
  const material = new THREE.ShaderMaterial({
    uniforms: { uPhase:{value:1}, uWater:{value:0}, uTint:{value:new THREE.Color()} },
    transparent:true, depthWrite:false, side:THREE.DoubleSide,
    vertexShader:`varying vec2 vUv; void main(){vUv=uv;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`varying vec2 vUv; uniform float uPhase; uniform float uWater;
      uniform vec3 uTint;
      void main(){
        vec2 p=(vUv-.5)*2.0;
        float r=length(p*vec2(1.0,1.04));
        float a=atan(p.y,p.x);
        float wobble=.009*sin(a*3.0+uPhase*1.5)+.004*sin(a*7.0);
        float rings=0.0; float light=0.0;
        for(int i=0;i<4;i++){
          float progress=uPhase-float(i)*.105;
          float radius=.08+.81*max(progress,0.0);
          float envelope=smoothstep(0.0,.12,progress)*(1.0-smoothstep(.43,1.0,progress));
          float d=r-radius-wobble;
          rings+=exp(-pow(d/.014,2.0))*envelope*(1.0-float(i)*.16);
          light+=exp(-pow((d-.023)/.023,2.0))*envelope*(1.0-float(i)*.16);
        }
        float strength=mix(.18,.48,uWater);
        vec3 ink=mix(uTint,vec3(.97,.96,.89),light/(rings+light+.001));
        float alpha=(rings+light*.64)*strength*(1.0-smoothstep(.8,1.0,r));
        if(alpha<.002)discard;
        gl_FragColor=vec4(ink,alpha);
      }`,
  });
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.4),material);
  mesh.rotation.x=-Math.PI/2;
  mesh.visible=false;
  mesh.renderOrder=3;
  scene.add(mesh);
  return { x:0, z:0, at:-100, surface:'path', tint:new THREE.Color(), mesh };
}) : [];
let rippleWaveCursor = 0;
function addFootstep() {
  const forwardX = Math.sin(yaw), forwardZ = -Math.cos(yaw);
  const sideX = Math.cos(yaw), sideZ = Math.sin(yaw);
  const side = footParity++ % 2 ? 1 : -1;
  const at = clock.getElapsedTime();
  const surface = footSurface(camera.position.x, camera.position.z);
  const tint = footTint(camera.position.x, camera.position.z, surface);
  camera.updateMatrixWorld();
  let visibleX = camera.position.x + forwardX * 1.4 + sideX * side * 0.18;
  let visibleZ = camera.position.z + forwardZ * 1.4 + sideZ * side * 0.18;
  const projected = new THREE.Vector3();
  for (let distance = 1.4; distance <= 6.4; distance += 0.2) {
    const x = camera.position.x + forwardX * distance + sideX * side * 0.18;
    const z = camera.position.z + forwardZ * distance + sideZ * side * 0.18;
    projected.set(x, ground(x, z) + 0.22, z).project(camera);
    if (projected.y > -0.94 && projected.y < 0.75 && Math.abs(projected.x) < 0.82) {
      visibleX = x;
      visibleZ = z;
      break;
    }
  }
  footsteps.push({ x:camera.position.x + sideX * side * 0.18,
    z:camera.position.z + sideZ * side * 0.18, at, surface });
  footsteps.push({ x:visibleX, z:visibleZ, at, surface });
  if (new URLSearchParams(location.search).has('qa')) {
    projected.set(visibleX, ground(visibleX, visibleZ) + 0.22, visibleZ).project(camera);
    window.__rippleQA = { surface, x:projected.x, y:projected.y,
      color:tint.getStyle(), distance:Math.hypot(visibleX - camera.position.x, visibleZ - camera.position.z) };
  }
  if (footsteps.length > 16) footsteps.splice(0, footsteps.length - 16);
  if (rippleWaves.length) {
    const wave = rippleWaves[rippleWaveCursor++ % rippleWaves.length];
    wave.x = visibleX;
    wave.z = visibleZ;
    wave.at = at;
    wave.surface = footSurface(visibleX, visibleZ);
    wave.tint.copy(footTint(visibleX, visibleZ, wave.surface));
    if(wave.surface==='water' && paintedStreamMaterial){
      const index=(rippleWaveCursor-1)%rippleWaves.length;
      paintedStreamMaterial.uniforms.uSteps.value[index].set(visibleX,visibleZ,at);
    }
    if(wave.surface==='path' && paintedPathMaterial){
      const index=(rippleWaveCursor-1)%rippleWaves.length;
      paintedPathMaterial.uniforms.uSteps.value[index].set(visibleX,visibleZ,at);
    }
  }
}
function move(direction, amount = .65, startStep = false) {
  if (prologue?.active || performance.now() < arrivalUnlockAt) return;
  guideAim=null;
  let dx = 0, dz = 0;
  if (direction === 'forward') { dx = Math.sin(yaw); dz = -Math.cos(yaw); }
  if (direction === 'back') { dx = -Math.sin(yaw); dz = Math.cos(yaw); }
  if (direction === 'left') { dx = -Math.cos(yaw); dz = -Math.sin(yaw); }
  if (direction === 'right') { dx = Math.cos(yaw); dz = Math.sin(yaw); }
  const oldX = camera.position.x, oldZ = camera.position.z;
  camera.position.x = THREE.MathUtils.clamp(oldX + dx * amount, -32, 32);
  camera.position.z = THREE.MathUtils.clamp(oldZ + dz * amount, expandedInk ? -51 : -40, 40);
  updateCamera();
  const traveled = Math.hypot(camera.position.x - oldX, camera.position.z - oldZ);
  if (traveled > 0) {
    walkDirection.set(dx, dz);
    stepDistance += traveled;
    if (startStep) {
      addFootstep();
      stepDistance = 0;
    }
    if (stepDistance >= 0.62) {
      stepDistance %= 0.62;
      addFootstep();
    }
  }
}
let heldDirection=null;
window.addEventListener('blur',()=>{heldDirection=null;});
for (const button of document.querySelectorAll('[data-direction]')) {
  button.addEventListener('pointerdown', event => { event=viewPointer(event);
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    move(button.dataset.direction, VALLEY_TAP_STEP, true);
    heldDirection=button.dataset.direction;
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(name, () => {heldDirection=null;});
}
let dragging = false, lastX = 0, lastY = 0, pressX = 0, pressY = 0;
const yingningRaycaster = new THREE.Raycaster();
const clickPosition = new THREE.Vector2();
function clickYingning(event) {
  if (!yingningCharacter?.actor.visible || performance.now() < arrivalUnlockAt) return;
  const actor = yingningCharacter.actor;
  if (Math.hypot(camera.position.x - actor.position.x,
    camera.position.z - actor.position.z) > 7.5) return;
  const rect = viewRect(renderer.domElement);
  clickPosition.set((event.clientX - rect.left) / rect.width * 2 - 1,
    -(event.clientY - rect.top) / rect.height * 2 + 1);
  camera.updateMatrixWorld();
  yingningRaycaster.setFromCamera(clickPosition, camera);
  if (!yingningRaycaster.intersectObject(actor, true).length) return;
  yingningCharacter.greet(clock.getElapsedTime());
  yingningStory?.onCharacterClick();
}
renderer.domElement.addEventListener('pointerdown', event => { event=viewPointer(event);
  if (prologue?.active) { prologue.pointerDown(event); return; }
  if (performance.now() < arrivalUnlockAt) return;
  dragging = true;
  pressX = event.clientX; pressY = event.clientY;
  lastX = event.clientX; lastY = event.clientY;
  renderer.domElement.setPointerCapture(event.pointerId);
});
renderer.domElement.addEventListener('pointermove', event => { event=viewPointer(event);
  if (prologue?.active) { prologue.pointerMove(event); return; }
  if (performance.now() < arrivalUnlockAt) return;
  if (!dragging) return;
  guideAim=null;
  ({yaw,pitch}=dragView(yaw,pitch,event.clientX-lastX,event.clientY-lastY,{speedX:.0044,speedY:.0031,min:-.46,max:.52}));
  lastX = event.clientX; lastY = event.clientY;
  updateCamera();
});
renderer.domElement.addEventListener('pointerup', event => { event=viewPointer(event);
  const clicked = !prologue?.active
    && Math.hypot(event.clientX - pressX, event.clientY - pressY) < 7;
  if (prologue?.active) prologue.pointerUp();
  dragging = false;
  if (clicked) clickYingning(event);
});
renderer.domElement.addEventListener('pointercancel', () => { if (prologue?.active) prologue.pointerUp(); dragging = false; });
window.addEventListener('resize', () => {
  camera.aspect = viewSize().width / viewSize().height;
  camera.updateProjectionMatrix();
  renderer.setSize(viewSize().width, viewSize().height);
  for (const material of materials) material.uniforms.uViewport.value = renderer.domElement.height;
  prologue?.resize();
});

const clock = new THREE.Clock();
const footsteps = [];
const walkDirection = new THREE.Vector2(0, -1);
let stepDistance = 0;
let footParity = 0;
const rippleInk = new THREE.Color('#8e806b');
const rippleDuration = 1.85;
function animate() {
  requestAnimationFrame(animate);
  const dt=clock.getDelta(),time=clock.elapsedTime;
  if (paintedStreamMaterial) paintedStreamMaterial.uniforms.uTime.value = time;
  if (paintedPathMaterial) paintedPathMaterial.uniforms.uTime.value = time;
  if (prologue?.active) {
    prologue.update(performance.now() / 1000);
    return;
  }
  if(heldDirection)move(heldDirection,walkFrameDistance(dt));
  if(guideAim){const t=THREE.MathUtils.smoothstep((performance.now()-guideAim.at)/450,0,1);yaw=THREE.MathUtils.lerp(guideAim.fromYaw,guideAim.toYaw,t);pitch=THREE.MathUtils.lerp(guideAim.fromPitch,guideAim.toPitch,t);updateCamera();if(t>=1)guideAim=null;}
  updateEncounter(time);
  for (const { points, origin, sizes, colors } of pathObjects) {
    const position = points.geometry.attributes.position;
    const sizeAttribute = points.geometry.attributes.aSize;
    const colorAttribute = points.geometry.attributes.color;
    for (let i = 0; i < position.count; i++) {
      const k = i * 3;
      const ox = origin[k], oy = origin[k + 1], oz = origin[k + 2];
      const flow = (time * 0.045) % 0.225;
      let z = oz - flow;
      let x = pathX(z) + (ox - pathX(oz));
      let y = oy;
      let waveStrength = 0;
      for (const step of footsteps) {
        if (step.surface !== 'path') continue;
        const age = time - step.at;
        if (age < 0 || age > 0.6) continue;
        const rx = ox - step.x, rz = oz - step.z;
        const distance = Math.hypot(rx, rz);
        if (distance > 0.95) continue;
        const ring = 0.70 * age / 0.6;
        const pulse = Math.exp(-Math.pow((distance - ring) / 0.22, 2))
          * Math.sin(Math.PI * age / 0.6);
        waveStrength = Math.max(waveStrength, pulse);
        x += rx / Math.max(distance, 0.1) * pulse * 0.13;
        z += rz / Math.max(distance, 0.1) * pulse * 0.13;
        y += pulse * 0.055;
      }
      position.array[k] = x;
      position.array[k + 1] = y;
      position.array[k + 2] = z;
      sizeAttribute.array[i] = sizes[i] * (1 + waveStrength * 0.14);
      colorAttribute.array[k] = THREE.MathUtils.lerp(colors[k], rippleInk.r, waveStrength);
      colorAttribute.array[k + 1] = THREE.MathUtils.lerp(colors[k + 1], rippleInk.g, waveStrength);
      colorAttribute.array[k + 2] = THREE.MathUtils.lerp(colors[k + 2], rippleInk.b, waveStrength);
    }
    position.needsUpdate = true;
    sizeAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
  }
  while (footsteps.length && time - footsteps[0].at > rippleDuration) footsteps.shift();
  for (const wave of rippleWaves) {
    const age=time-wave.at;
    wave.mesh.visible=age>=0 && age<rippleDuration;
    if(!wave.mesh.visible)continue;
    wave.mesh.position.set(wave.x,ground(wave.x,wave.z)+0.18,wave.z);
    wave.mesh.material.uniforms.uPhase.value=age/rippleDuration;
    wave.mesh.material.uniforms.uWater.value=wave.surface==='water'?1:0;
    wave.mesh.material.uniforms.uTint.value.copy(wave.tint);
  }
  for (const { points, origin, motion } of waterObjects) {
    const positions = points.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const k = i * 3;
      if (motion === 'river') {
        let z = origin[k + 2] + (time * 0.045) % 0.15
          + 0.015 * Math.sin(origin[k + 2] * 0.85 - time * 0.38);
        const lateral = origin[k] - riverX(origin[k + 2]);
        let x = riverX(z) + lateral + Math.sin(z * 0.7 - time * 0.38) * 0.018;
        let lift = 0;
        for (const step of footsteps) {
          if (step.surface !== 'water') continue;
          const age = time - step.at;
          if (age < 0 || age > rippleDuration) continue;
          const dx = x - step.x, dz = z - step.z;
          const distance = Math.hypot(dx, dz);
          if (distance > 0.7) continue;
          const front=age*0.40;
          const pulse=Math.sin((distance-front)*28.0)
            * Math.exp(-Math.pow((distance-front)/0.22,2))
            * Math.sin(Math.PI*age/rippleDuration);
          x += dx / Math.max(distance, 0.1) * pulse * 0.045;
          z += dz / Math.max(distance, 0.1) * pulse * 0.045;
          lift += pulse * 0.075;
        }
        positions.array[k] = x;
        positions.array[k + 1] = ground(x, z) + 0.11 + Math.sin(z * 0.85 - time * 0.38) * 0.024 + lift;
        positions.array[k + 2] = z;
      } else if (motion === 'cascade') {
        const sourceT = (origin[k + 2] - cascadeStartZ) / (cascadeEndZ - cascadeStartZ);
        const t = sourceT;
        const lateral = origin[k] - cascadeX(sourceT);
        const wave = Math.sin(t * 19 - time * 0.88) * Math.sin(Math.PI * t);
        positions.array[k] = cascadeX(t) + lateral + wave * 0.055;
        positions.array[k + 2] = cascadeZ(t) + wave * 0.045;
        positions.array[k + 1] = expandedInk
          ? ground(positions.array[k], positions.array[k + 2]) + 0.19 + 0.07 * (1 - t) + wave * 0.028
          : origin[k + 1] + wave * 0.12;
      } else if (motion === 'mountain') {
        positions.array[k] = origin[k] + 0.035 * Math.sin(time * 0.37 + origin[k + 1] * 1.8);
        positions.array[k + 1] = origin[k + 1] - (time * 0.055) % 0.31
          + 0.022 * Math.sin(time * 0.42 + origin[k] * 0.6);
        positions.array[k + 2] = origin[k + 2];
      } else {
        positions.array[k] = origin[k] + Math.sin(time * 0.8 + i) * 0.09;
        positions.array[k + 1] = origin[k + 1] + Math.sin(time * 0.9 + i * 0.5) * 0.035;
      }
    }
    positions.needsUpdate = true;
  }
  for (let i = 0; i < petalCount; i++) {
    const petal = petalMotion[i];
    const x = petal.x + petal.sway * Math.sin(time * 0.54 + petal.wobble);
    const z = petal.z + petal.sway * 0.55 * Math.cos(time * 0.43 + petal.wobble);
    const floor = ground(x, z) + 0.20;
    const y = floor + 0.32 + ((petal.phase - time * petal.fall + 5.8) % 5.8 + 5.8) % 5.8;
    petalObject.position.set(x, y, z);
    petalObject.rotation.set(0.28 * Math.sin(time * 0.71 + petal.wobble),
      0.44 * Math.cos(time * 0.61 + petal.wobble), time * petal.spin + petal.wobble);
    petalObject.scale.set(petal.size * 0.79, petal.size, 1);
    petalObject.updateMatrix();
    petalMesh.setMatrixAt(i, petalObject.matrix);
  }
  petalMesh.instanceMatrix.needsUpdate = true;
  renderer.render(scene, camera);
}
if(opening){
  // Upload full-resolution textures before the handoff rather than on its first frame.
  const textures=new Set();scene.traverse(o=>{for(const material of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){
    for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
    for(const uniform of Object.values(material.uniforms??{}))if(uniform.value?.isTexture)textures.add(uniform.value);
  }});
  for(const texture of textures){renderer.initTexture(texture);await yieldToOpening();}
  if(renderer.compileAsync)try{await renderer.compileAsync(scene,camera);}catch(error){console.warn('预编译回退至正常绘制',error);}
}
opening?.attach(enterValley);
performance.mark('liaozhai-valley-ready');
animate();
document.getElementById('startup-loading')?.remove();
