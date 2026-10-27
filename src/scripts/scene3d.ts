// A seekable, procedural 3D overview of the same workspace. The HTML scene
// remains the source of navigation, text and the no-WebGL fallback.
import * as THREE from 'three';
import { gsap } from 'gsap';

export function initScene3D() {
  const stage = document.querySelector<HTMLElement>('[data-scene]');
  const control = document.querySelector<HTMLButtonElement>('[data-scene-orbit]');
  const shelf = document.querySelector<HTMLElement>('.shelf');
  if (!stage || !control || !shelf) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'scene3d';
  canvas.setAttribute('aria-hidden', 'true');
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
  } catch { control.textContent = '3D unavailable'; control.setAttribute('aria-label', 'Three-dimensional overview is unavailable; the portfolio remains fully usable'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#c59570');
  const camera = new THREE.OrthographicCamera(-7.68, 7.68, 4.32, -4.32, 0.1, 80);
  camera.position.set(0, 2.8, 22);
  camera.lookAt(0, 0, 0);
  const root = new THREE.Group();
  scene.add(root);
  const resources = new Set<THREE.BufferGeometry | THREE.Material | THREE.Texture>();
  const track = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(resource: T): T => {
    resources.add(resource);
    return resource;
  };
  const worldX = (x: number) => (x - 768) / 100;
  const worldY = (y: number) => (432 - y) / 100;
  const mat = (color: string, roughness = .75, metalness = 0) => track(new THREE.MeshStandardMaterial({ color, roughness, metalness }));
  const walnut = mat('#ffffff', .64);
  const darkWood = mat('#3b2013', .72);
  const paleWood = mat('#a86e3d', .67);
  const brass = mat('#c49a55', .27, .75);
  const cream = mat('#f2e4c9', .94);
  const paper = mat('#fbf2de', .98);
  const cork = mat('#ad7445', .94);
  const leather = mat('#39261d', .87);
  const graphite = mat('#252320', .68, .25);
  const aluminium = mat('#a9a9a3', .34, .72);
  const ceramic = mat('#f0e5d1', .28);

  // A small deterministic texture gives the long cabinet and desk faces
  // directional grain without network assets or a large raster download.
  const grainCanvas = document.createElement('canvas');
  grainCanvas.width = 256; grainCanvas.height = 256;
  const context = grainCanvas.getContext('2d');
  if (context) {
    context.fillStyle = '#b17e52'; context.fillRect(0, 0, 256, 256);
    let seed = 73827;
    for (let i = 0; i < 520; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const y = seed % 256;
      const tone = 35 + (seed % 45);
      context.strokeStyle = `rgba(${tone},${Math.round(tone * .56)},${Math.round(tone * .32)},${.03 + (seed % 7) / 100})`;
      context.lineWidth = .3 + (seed % 4) / 8;
      context.beginPath(); context.moveTo(0, y);
      context.bezierCurveTo(64, y + (seed % 7) - 3, 180, y - (seed % 5), 256, y + (seed % 9) - 4);
      context.stroke();
    }
    const grain = track(new THREE.CanvasTexture(grainCanvas));
    grain.colorSpace = THREE.SRGBColorSpace;
    grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
    grain.repeat.set(2, 1);
    walnut.map = grain;
    walnut.needsUpdate = true;
  }

  const add = (geometry: THREE.BufferGeometry, material: THREE.Material, parent = root) => {
    const mesh = new THREE.Mesh(track(geometry), material);
    mesh.castShadow = true; mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const textPlaque = (label: string, x: number, y: number, z: number, w: number, h: number, size = 42, parent = root) => {
    const sheet = document.createElement('canvas'); sheet.width = 600; sheet.height = 112;
    const ink = sheet.getContext('2d');
    if (!ink) return;
    ink.clearRect(0, 0, sheet.width, sheet.height);
    ink.fillStyle = '#302118'; ink.textAlign = 'center'; ink.textBaseline = 'middle';
    ink.font = `bold ${size}px Georgia`;
    ink.fillText(label, 300, 55, 550);
    const texture = track(new THREE.CanvasTexture(sheet));
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = track(new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    const plaque = add(new THREE.PlaneGeometry(w / 100, h / 100), material, parent);
    plaque.position.set(worldX(x), worldY(y), z);
    plaque.castShadow = false;
    return plaque;
  };
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, material: THREE.Material, parent = root) => {
    const mesh = add(new THREE.BoxGeometry(w / 100, h / 100, d / 100), material, parent);
    mesh.position.set(worldX(x), worldY(y), z);
    return mesh;
  };
  const rounded = (x: number, y: number, z: number, w: number, h: number, d: number, radius: number, material: THREE.Material, parent = root) => {
    const a = w / 100, b = h / 100, r = Math.min(radius / 100, a / 2, b / 2);
    const shape = new THREE.Shape();
    shape.moveTo(-a / 2 + r, -b / 2);
    shape.lineTo(a / 2 - r, -b / 2); shape.quadraticCurveTo(a / 2, -b / 2, a / 2, -b / 2 + r);
    shape.lineTo(a / 2, b / 2 - r); shape.quadraticCurveTo(a / 2, b / 2, a / 2 - r, b / 2);
    shape.lineTo(-a / 2 + r, b / 2); shape.quadraticCurveTo(-a / 2, b / 2, -a / 2, b / 2 - r);
    shape.lineTo(-a / 2, -b / 2 + r); shape.quadraticCurveTo(-a / 2, -b / 2, -a / 2 + r, -b / 2);
    const mesh = add(new THREE.ExtrudeGeometry(shape, { depth: d / 100, bevelEnabled: true, bevelSize: r * .18, bevelThickness: r * .18, bevelSegments: 2, curveSegments: 3 }), material, parent);
    mesh.position.set(worldX(x), worldY(y), z - d / 200);
    return mesh;
  };
  const cylinder = (x: number, y: number, z: number, radius: number, height: number, material: THREE.Material, segments = 18) => {
    const mesh = add(new THREE.CylinderGeometry(radius / 100, radius / 100, height / 100, segments), material);
    mesh.position.set(worldX(x), worldY(y), z);
    return mesh;
  };
  const link = (a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material) => {
    const delta = new THREE.Vector3().subVectors(b, a);
    const mesh = add(new THREE.CylinderGeometry(radius, radius, delta.length(), 12), material);
    mesh.position.copy(a).addScaledVector(delta, .5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    return mesh;
  };

  // Wall, desk slab and leather writing mat establish true shared depth.
  box(768, 432, -2.5, 1900, 900, 8, mat('#c99973', 1));
  const desk = box(768, 740, 1.5, 1800, 35, 405, walnut);
  desk.position.z = 1;
  box(768, 773, 2.9, 1800, 30, 28, darkWood);
  const deskMat = rounded(624, 744, 3.16, 1120, 186, 6, 16, leather);
  deskMat.rotation.x = -.56;

  // Cabinet carcass, slot recesses, and eight separate drawer assemblies.
  rounded(618, 451, -.25, 646, 414, 123, 7, walnut);
  box(618, 454, .45, 598, 355, 4, darkWood);
  rounded(618, 248, .55, 675, 22, 132, 6, paleWood);
  rounded(618, 656, .62, 680, 35, 142, 7, walnut);
  const drawerLabels = ['About Me', 'Projects', 'Patents', 'Experience', 'Education', 'Achievements', 'Skills & Toolbox', 'Certifications'];
  const drawers: THREE.Group[] = [];
  for (let row = 0; row < 4; row++) for (let col = 0; col < 2; col++) {
    const x = col ? 779 : 457, y = 335 + row * 73;
    box(x, y, .92, 293, 60, 3, mat('#25140d', .95));
    const assembly = new THREE.Group(); root.add(assembly); drawers.push(assembly);
    box(x, y, 1.2, 276, 56, 84, walnut, assembly);
    rounded(x, y, 1.72, 287, 60, 8, 4, cream, assembly);
    rounded(x, y + 21, 1.82, 76, 9, 10, 4, brass, assembly);
    textPlaque(drawerLabels[row * 2 + col], x, y - 6, 1.9, 245, 29, 48, assembly);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      const pin = add(new THREE.SphereGeometry(.018, 8, 6), brass, assembly);
      pin.position.set(worldX(x + sx * 132), worldY(y + sy * 24), 1.82);
    }
  }
  box(617, 206, .2, 636, 13, 127, walnut);
  // Books, globe and the tiny portrait frame rest on the cabinet crown.
  for (const [index, height, material] of [[0, 124, darkWood], [1, 142, leather], [2, 115, paleWood], [3, 133, darkWood]] as const) {
    rounded(410 + index * 34, 197 - height / 2, 1.14, 29, height, 40, 3, material);
    box(410 + index * 34, 197 - height / 2, 1.37, 2, height - 12, 2, brass);
  }
  const globe = add(new THREE.SphereGeometry(.62, 28, 18), mat('#b6a474', .62));
  globe.position.set(worldX(624), worldY(140), 1.4);
  cylinder(624, 213, 1.4, 31, 9, brass);
  cylinder(624, 185, 1.4, 4, 47, graphite);
  rounded(765, 170, 1.5, 94, 98, 10, 3, brass);
  rounded(765, 170, 1.6, 76, 80, 3, 2, paper);

  // Articulated lamp. The point light has limited reach and follows the switch.
  cylinder(881, 218, 1.42, 32, 12, graphite);
  link(new THREE.Vector3(worldX(881), worldY(209), 1.4), new THREE.Vector3(worldX(906), worldY(112), 1.18), .035, brass);
  link(new THREE.Vector3(worldX(906), worldY(112), 1.18), new THREE.Vector3(worldX(773), worldY(58), 1.25), .032, brass);
  const shade = add(new THREE.CylinderGeometry(.22, .47, .38, 24, 1, true), graphite);
  shade.position.set(worldX(773), worldY(75), 1.32);
  shade.rotation.z = -.3;
  const bulb = add(new THREE.SphereGeometry(.13, 14, 10), track(new THREE.MeshStandardMaterial({ color: '#fff3cf', emissive: '#ffcf7a', emissiveIntensity: 1.8 })));
  bulb.position.set(worldX(764), worldY(93), 1.42);
  const lampLight = new THREE.PointLight('#ffcd88', 20, 5.5, 2);
  lampLight.position.copy(bulb.position); scene.add(lampLight);
  if (stage.dataset.lamp === 'off') {
    lampLight.intensity = 0;
    (bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
  }

  // The cork wall has separate pins, paper cards and a hanging headphone arc.
  rounded(1224, 341, -.35, 560, 365, 18, 5, aluminium);
  box(1224, 341, -.17, 535, 343, 3, cork);
  rounded(1035, 339, -.06, 158, 335, 3, 1, paper);
  textPlaque('Weekly planner', 1035, 215, .02, 142, 25, 42);
  for (let i = 0; i < 3; i++) {
    rounded(1210 + (i % 2) * 85, 265 + i * 65, .05 + i * .02, 74, 68, 2, 1, i === 1 ? cream : paper);
    const pin = add(new THREE.SphereGeometry(.042, 10, 8), brass);
    pin.position.set(worldX(1210 + (i % 2) * 85), worldY(236 + i * 65), .12 + i * .02);
  }
  const buildNames = [...document.querySelectorAll<HTMLElement>('.note__list a')].slice(0, 3).map((item) => item.textContent?.trim()).filter(Boolean);
  if (buildNames.length) {
    rounded(1217, 351, .18, 158, 118, 2, 2, cream);
    textPlaque('Pinned builds', 1217, 315, .25, 140, 19, 40);
    buildNames.forEach((name, index) => textPlaque(name!, 1217, 345 + index * 25, .25, 138, 19, 37));
  }
  const phones = add(new THREE.TorusGeometry(.51, .045, 8, 24, Math.PI), ceramic);
  phones.position.set(worldX(1285), worldY(451), .23);
  for (const offset of [-48, 48]) rounded(1285 + offset, 464, .28, 22, 45, 18, 8, ceramic);
  for (let i = 0; i < 3; i++) rounded(1430, 249 + i * 94, .2, 148, 72, 20, 5, aluminium);

  // Physically separate desktop objects, each planted on the desk plane.
  const laptopBase = rounded(671, 698, 3.25, 480, 130, 10, 8, aluminium);
  laptopBase.rotation.x = -.45;
  const laptopLid = rounded(671, 638, 2.95, 462, 145, 8, 7, aluminium);
  laptopLid.rotation.x = -.16;
  rounded(236, 725, 3.36, 265, 90, 12, 7, leather).rotation.x = -.5;
  rounded(236, 722, 3.43, 248, 82, 4, 6, paper).rotation.x = -.5;
  const pen = cylinder(230, 710, 3.55, 4, 158, graphite, 12);
  pen.rotation.z = Math.PI / 2.35;
  const mug = add(new THREE.CylinderGeometry(.43, .39, .75, 20, 1, true), ceramic);
  mug.position.set(worldX(977), worldY(700), 3.18);
  const coffee = cylinder(977, 663, 3.18, 39, 1, mat('#4f3220', .28));
  coffee.rotation.x = Math.PI / 2;
  rounded(1380, 691, 3.12, 187, 97, 105, 25, graphite);
  rounded(1193, 717, 3.2, 122, 62, 36, 9, darkWood);
  const moon = add(new THREE.SphereGeometry(.35, 20, 14), mat('#f0d18c', .6));
  moon.position.set(worldX(1193), worldY(654), 3.2);
  const rocket = add(new THREE.ConeGeometry(.13, 1.04, 12), aluminium);
  rocket.position.set(worldX(1090), worldY(648), 3.4);

  scene.add(new THREE.HemisphereLight('#ffebcf', '#6b452c', 2.6));
  const sun = new THREE.DirectionalLight('#ffe2b8', 2);
  sun.position.set(-4, 8, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -11; sun.shadow.camera.right = 11;
  sun.shadow.camera.top = 7; sun.shadow.camera.bottom = -7;
  sun.shadow.bias = -.0003;
  sun.shadow.radius = 4;
  scene.add(sun);

  const render = () => { camera.lookAt(0, 0, 0); renderer.render(scene, camera); };
  const resize = () => {
    const bounds = stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    renderer.setSize(bounds.width, bounds.height, false);
    const aspect = bounds.width / bounds.height;
    camera.left = -4.32 * aspect; camera.right = 4.32 * aspect;
    camera.updateProjectionMatrix(); render();
  };
  stage.append(canvas);
  const observer = new ResizeObserver(resize); observer.observe(stage);
  resize();
  control.dataset.sceneLoading = 'false';
  control.disabled = location.pathname !== '/';
  control.textContent = 'Rotate workspace';
  control.setAttribute('aria-label', 'Rotate the workspace for a three-dimensional overview');
  let timeline: gsap.core.Timeline | null = null;
  let active = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const settle = () => {
    active = false;
    stage.classList.remove('is-touring');
    control.textContent = 'Rotate workspace';
    control.setAttribute('aria-label', 'Rotate the workspace for a three-dimensional overview');
    camera.position.set(0, 2.8, 22); render();
  };
  control.addEventListener('click', () => {
    if (active) {
      timeline?.kill(); timeline = null;
      if (reduced.matches) settle();
      else gsap.to(camera.position, { x: 0, y: 2.8, z: 22, duration: .55, ease: 'power2.out', onUpdate: render, onComplete: settle });
      return;
    }
    if (location.pathname !== '/') return;
    active = true;
    stage.classList.add('is-touring');
    control.textContent = 'Stop overview';
    control.setAttribute('aria-label', 'Stop the three-dimensional overview and return');
    if (reduced.matches) { camera.position.set(8, 5, 18); render(); return; }
    timeline = gsap.timeline({ onUpdate: render, onComplete: settle });
    timeline.to(camera.position, { x: 9, y: 5, z: 18, duration: 1.5, ease: 'power2.inOut' });
    timeline.to(camera.position, { x: 1, y: 10, z: 17, duration: 1.4, ease: 'sine.inOut' });
    timeline.to(camera.position, { x: -8, y: 5, z: 19, duration: 1.5, ease: 'sine.inOut' });
    timeline.to(camera.position, { x: 0, y: 2.8, z: 22, duration: 1.2, ease: 'power2.inOut' });
  });
  window.addEventListener('shelf:lamp', ((event: CustomEvent<{ on: boolean }>) => {
    lampLight.intensity = event.detail.on ? 20 : 0;
    (bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = event.detail.on ? 1.8 : 0;
    render();
  }) as EventListener);
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault(); timeline?.kill(); settle(); control.hidden = true;
  });
  window.addEventListener('pagehide', () => {
    timeline?.kill(); observer.disconnect(); resources.forEach((resource) => resource.dispose()); renderer.dispose();
  }, { once: true });
}
