import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** Replace only the illustrated speaker body once the local CC0 model is ready. */
export function mountSpeaker() {
  const holder = document.querySelector<HTMLElement>('[data-speaker-model]');
  const canvas = holder?.querySelector<HTMLCanvasElement>('[data-speaker-canvas]');
  const fallback = document.querySelector<SVGSVGElement>('svg[data-speaker-surface]');
  if (!holder || !canvas || !fallback) return;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    return; // Keep the SVG when WebGL is unavailable.
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;

  const scene = new THREE.Scene();
  const ambient = new THREE.AmbientLight(0xfff1dd, 1.25);
  const warmLight = new THREE.DirectionalLight(0xffd29a, 2.1);
  warmLight.position.set(-0.3, 0.75, 0.6);
  scene.add(ambient, warmLight);

  // The GLB is modelled in metres, with the grille facing +Z and its feet at Y=0.
  const camera = new THREE.OrthographicCamera(-0.223, 0.223, 0.175, -0.175, 0.01, 10);
  camera.position.set(0.055, 0.21, 0.72);
  camera.lookAt(0, 0.154, 0);

  let model: THREE.Group | null = null;
  const draw = () => {
    if (!model) return;
    const width = holder.clientWidth;
    const height = holder.clientHeight;
    if (!width || !height) return;
    const halfWidth = 0.175 * width / height;
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    warmLight.intensity = document.querySelector<HTMLElement>('[data-scene]')?.dataset.lamp === 'off' ? 0.55 : 2.1;
    renderer.render(scene, camera);
  };

  new GLTFLoader().load('/media/models/portable-handle-speaker.glb', (gltf) => {
    model = gltf.scene;
    model.rotation.y = -0.06;
    scene.add(model);
    canvas.hidden = false;
    holder.classList.add('is-ready');
    holder.classList.toggle('is-playing', fallback.classList.contains('is-playing'));
    draw();
    fallback.setAttribute('hidden', '');
  }, undefined, () => renderer.dispose());

  window.addEventListener('resize', draw);
  window.addEventListener('shelf:lamp', draw);
  window.addEventListener('pagehide', () => {
    model?.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        Object.values(material).forEach((value) => { if (value instanceof THREE.Texture) value.dispose(); });
        material.dispose();
      });
    });
    renderer.dispose();
  }, { once: true });
}
