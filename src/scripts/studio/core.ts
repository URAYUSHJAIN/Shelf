// Studio layer (D-45): one WebGL renderer draws every physical desk object over
// its HTML anchor. The DOM keeps layout, semantics, focus and pointer events;
// this layer only supplies pixels. Frames are drawn on demand: an idle scene
// costs nothing.
import * as THREE from 'three';
import { gsap } from 'gsap';

export interface Built {
  /** Model root, authored in anchor design units with +y up. */
  root: THREE.Object3D;
  /** Anchor design width; the model is scaled so this spans the element. */
  designW: number;
  /** Set to also fit the height (books keep their slot at every breakpoint). */
  designH?: number;
  /** View pitch in radians: how far the viewer looks down on the object. */
  pitch?: number;
  /** Which edge of the anchor the model's origin sits on. */
  origin?: 'bottom' | 'top';
  /** Stacking depth for objects that overlap on screen. */
  depth?: number;
  lamp?: (on: boolean, instant: boolean) => void;
  dispose?: () => void;
}

interface Entry extends Built {
  el: HTMLElement;
  holder: THREE.Group;
}

export interface Studio {
  scene: THREE.Scene;
  reduced: () => boolean;
  invalidate: () => void;
  add: (el: HTMLElement, built: Built) => void;
  /** Compile every shader off the main thread, then draw the first frame. */
  start: () => Promise<void>;
  relayout: () => void;
  /** Track a resource for disposal on page hide. */
  own: <T extends { dispose: () => void }>(resource: T) => T;
  maxAnisotropy: number;
}

export function createStudio(canvas: HTMLCanvasElement, stage: HTMLElement, reduced: () => boolean): Studio | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'default' });
  } catch {
    return null; // The illustrated fallbacks stay.
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setClearColor(0x000000, 0);

  const owned: { dispose: () => void }[] = [];
  const own = <T extends { dispose: () => void }>(resource: T) => {
    owned.push(resource);
    return resource;
  };

  const scene = new THREE.Scene();
  // Reflections for brass and lacquer: a six-face, 32 px sketch of the room
  // (bright ceiling, amber lamp to the right, dark desk below). Small enough
  // that prefiltering it costs almost nothing.
  scene.environment = own(roomEnvironment());
  scene.environmentIntensity = 0.5;

  // Warm room light: a soft sky/ground wash, the pendant as key from the upper
  // left, and the desk lamp as a lower amber rim from the right.
  const hemi = new THREE.HemisphereLight(0xffe7c8, 0x4a2610, 1.0);
  const key = new THREE.DirectionalLight(0xffdcae, 2.5);
  key.position.set(-0.55, 0.95, 0.85);
  const rim = new THREE.DirectionalLight(0xffa954, 1.15);
  rim.position.set(0.95, 0.35, 0.45);
  const front = new THREE.DirectionalLight(0xfff1dc, 0.55);
  front.position.set(0.1, 0.2, 1);
  scene.add(hemi, key, rim, front);
  const LIT = { hemi: 1.0, key: 2.5, rim: 1.15, front: 0.55, env: 0.5 };
  const DARK = { hemi: 0.55, key: 0.5, rim: 0.12, front: 0.32, env: 0.26 };

  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, 1, 6000);
  camera.position.z = 3000;

  const entries: Entry[] = [];
  let frame = 0;
  let lost = false;
  let started = false;
  let width = 0;
  let height = 0;

  const render = () => {
    frame = 0;
    if (lost || !width || !height) return;
    renderer.render(scene, camera);
    if (!canvas.classList.contains('is-live')) {
      canvas.classList.add('is-live');
      for (const e of entries) e.el.setAttribute('data-studio-ready', '');
    }
  };
  const invalidate = () => {
    if (started && !frame) frame = requestAnimationFrame(render);
  };
  const start = async () => {
    // Shaders compile in parallel where the driver allows it, so the first
    // frame does not stall the page.
    try {
      await renderer.compileAsync(scene, camera);
    } catch {
      /* fall through to a normal synchronous first frame */
    }
    started = true;
    invalidate();
  };

  const place = (e: Entry, stageRect: DOMRect) => {
    const r = e.el.getBoundingClientRect();
    if (!r.width || !r.height) {
      e.holder.visible = false;
      return;
    }
    e.holder.visible = true;
    const sx = r.width / e.designW;
    const sy = e.designH ? r.height / e.designH : sx;
    e.holder.scale.set(sx, sy, sx);
    const y = e.origin === 'top' ? r.top : r.bottom;
    e.holder.position.set(r.left + r.width / 2 - stageRect.left, -(y - stageRect.top), e.depth ?? 0);
  };

  const relayout = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    const resized = w !== width || h !== height;
    if (resized) {
      width = w;
      height = h;
      // Cap the backing store: sharp on desktop, bounded on long phone pages.
      let ratio = Math.min(window.devicePixelRatio || 1, 2);
      // Long phone pages get a smaller budget than a fitted desktop scene.
      const budget = window.matchMedia('(min-width: 1000px) and (min-height: 560px)').matches ? 5_200_000 : 2_600_000;
      if (w * h * ratio * ratio > budget) ratio = Math.max(1, Math.sqrt(budget / (w * h)));
      renderer.setPixelRatio(ratio);
      renderer.setSize(w, h, false);
      camera.right = w;
      camera.bottom = -h;
      camera.updateProjectionMatrix();
    }
    const rect = stage.getBoundingClientRect();
    for (const e of entries) place(e, rect);
    if (resized && started) {
      // Draw before the browser paints the resized canvas, so a stale frame is
      // never shown stretched.
      cancelAnimationFrame(frame);
      render();
    } else invalidate();
  };

  const add = (el: HTMLElement, built: Built) => {
    const holder = new THREE.Group();
    const tilt = new THREE.Group();
    tilt.rotation.x = built.pitch ?? 0;
    tilt.add(built.root);
    holder.add(tilt);
    scene.add(holder);
    const entry: Entry = { ...built, el, holder };
    entries.push(entry);
    place(entry, stage.getBoundingClientRect());
    built.lamp?.(stage.dataset.lamp !== 'off', true);
    if (canvas.classList.contains('is-live')) {
      // A late arrival (globe map, speaker model): compile it, then show it.
      const reveal = () => {
        el.setAttribute('data-studio-ready', '');
        invalidate();
      };
      renderer.compileAsync(holder, camera, scene).then(reveal, reveal);
    }
  };

  // The lamp switch re-lights every mesh in step with the CSS light layers.
  const setLamp = (on: boolean, instant: boolean) => {
    const to = on ? LIT : DARK;
    const duration = instant || reduced() ? 0 : 0.62;
    const state = { hemi: hemi.intensity, key: key.intensity, rim: rim.intensity, front: front.intensity, env: scene.environmentIntensity };
    gsap.to(state, {
      ...to,
      duration,
      ease: 'sine.inOut',
      onUpdate: () => {
        hemi.intensity = state.hemi;
        key.intensity = state.key;
        rim.intensity = state.rim;
        front.intensity = state.front;
        scene.environmentIntensity = state.env;
        invalidate();
      },
    });
    for (const e of entries) e.lamp?.(on, duration === 0);
  };
  if (stage.dataset.lamp === 'off') setLamp(false, true);
  const onLamp = (event: Event) => setLamp((event as CustomEvent<{ on: boolean }>).detail.on, false);
  window.addEventListener('shelf:lamp', onLamp);

  const observer = new ResizeObserver(relayout);
  observer.observe(stage, { box: 'border-box' });
  window.addEventListener('resize', relayout);
  // Flow layouts move anchors when fonts or images settle.
  window.addEventListener('load', relayout, { once: true });

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    lost = true;
  });
  canvas.addEventListener('webglcontextrestored', () => {
    lost = false;
    invalidate();
  });

  window.addEventListener(
    'pagehide',
    (event) => {
      if (event.persisted) return; // Back/forward cache keeps the scene alive.
      observer.disconnect();
      window.removeEventListener('resize', relayout);
      window.removeEventListener('shelf:lamp', onLamp);
      cancelAnimationFrame(frame);
      for (const e of entries) e.dispose?.();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        for (const m of Array.isArray(material) ? material : material ? [material] : []) {
          for (const value of Object.values(m)) if (value instanceof THREE.Texture) value.dispose();
          m.dispose();
        }
      });
      for (const resource of owned) resource.dispose();
      renderer.dispose();
    },
  );

  canvas.hidden = false;
  relayout();
  return { scene, reduced, invalidate, add, start, relayout, own, maxAnisotropy: renderer.capabilities.getMaxAnisotropy() };
}

function roomEnvironment() {
  const face = (paint: (ctx: CanvasRenderingContext2D) => void) => {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    paint(c.getContext('2d')!);
    return c;
  };
  const wash = (top: string, bottom: string, spot?: [number, number, number, string]) => (ctx: CanvasRenderingContext2D) => {
    const g = ctx.createLinearGradient(0, 0, 0, 32);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
    if (spot) {
      const [x, y, radius, colour] = spot;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, colour);
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 32, 32);
    }
  };
  // Order: +x, -x, +y, -y, +z, -z.
  const texture = new THREE.CubeTexture([
    face(wash('#e8c79c', '#6b4526', [10, 9, 12, '#fff1cf'])),
    face(wash('#d9b48a', '#5a3a20', [22, 7, 9, '#ffe9c4'])),
    face(wash('#fff3da', '#f0d2a4', [16, 16, 14, '#ffffff'])),
    face(wash('#3a2313', '#1c0f07')),
    face(wash('#f2d9b4', '#7a5230', [16, 6, 14, '#fff6e0'])),
    face(wash('#d2a878', '#4a2d18')),
  ]);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
