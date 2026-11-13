// Mesh builders for the studio layer. Each model is authored in the design
// units of its HTML anchor (the same numbers as the CSS scene grid), origin at
// the anchor's bottom centre, +y up, +z towards the viewer.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { gsap } from 'gsap';
import type { Built, Studio } from './core';
import { BOOK_TONES, canvas, drawClockFace, glowTexture, mugTexture, pagesTexture, sketchPage, spineTexture, toTexture, wordsPage } from './textures';

const V = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z);
const P = (pairs: [number, number][]) => pairs.map(([x, y]) => new THREE.Vector2(x, y));
const UP = V(0, 1, 0);

export interface Kit {
  studio: Studio;
  brass: THREE.MeshStandardMaterial;
  bronze: THREE.MeshStandardMaterial;
  steel: THREE.MeshStandardMaterial;
  walnut: THREE.MeshStandardMaterial;
  paper: THREE.MeshStandardMaterial;
  glow: THREE.Texture;
  shadow: THREE.Texture;
}

export function makeKit(studio: Studio): Kit {
  const wood = new THREE.TextureLoader().load('/textures/walnut.webp', () => studio.invalidate());
  wood.colorSpace = THREE.SRGBColorSpace;
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping;
  wood.anisotropy = 4;
  const pages = pagesTexture();
  return {
    studio,
    brass: new THREE.MeshStandardMaterial({ color: 0xc9983f, metalness: 1, roughness: 0.3 }),
    bronze: new THREE.MeshStandardMaterial({ color: 0x241a13, metalness: 0.85, roughness: 0.42 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xb9bcc2, metalness: 1, roughness: 0.28 }),
    walnut: new THREE.MeshStandardMaterial({ map: wood, color: 0xffffff, roughness: 0.5, metalness: 0 }),
    paper: new THREE.MeshStandardMaterial({ map: pages, roughness: 0.92 }),
    glow: glowTexture(),
    shadow: glowTexture('rgba(8,3,0,.72)', 'rgba(8,3,0,.3)'),
  };
}

/** A rod between two points. */
function rod(a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material, radial = 14) {
  const dir = b.clone().sub(a);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, dir.length(), radial), material);
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
  return mesh;
}

function halo(kit: Kit, size: number, opacity: number, color = 0xffffff) {
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: kit.glow, color, transparent: true, opacity, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, toneMapped: false }),
  );
  sprite.scale.set(size, size, 1);
  sprite.renderOrder = 10;
  return sprite;
}

/** Flat blob shadow lying on the object's own ground plane. */
function blob(kit: Kit, w: number, d: number, opacity = 0.7) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: kit.shadow, transparent: true, opacity, depthWrite: false, toneMapped: false }));
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

const lathe = (points: [number, number][], material: THREE.Material, segments = 48) => new THREE.Mesh(new THREE.LatheGeometry(P(points), segments), material);

/** Pointer + focus hover that also works for keyboard users. */
function onHover(el: HTMLElement, enter: () => void, leave: () => void) {
  el.addEventListener('pointerenter', (e) => e.pointerType !== 'touch' && enter());
  el.addEventListener('pointerleave', leave);
  el.addEventListener('focus', enter);
  el.addEventListener('blur', leave);
}

/* ---------------------------------------------------------------- Books */

function book(kit: Kit, w: number, h: number, tone: string, title: string | null) {
  const depth = 104;
  const { cover } = BOOK_TONES[tone] ?? BOOK_TONES.brown;
  const cloth = new THREE.MeshStandardMaterial({ color: new THREE.Color(cover), roughness: 0.78 });
  const spineMat = new THREE.MeshStandardMaterial({ map: spineTexture(w, h, tone, title, kit.studio.maxAnisotropy), roughness: 0.7 });
  const g = new THREE.Group();
  // Rounded spine: a slice of a cylinder whose chord is the book's width.
  const radius = w * 0.82;
  const alpha = Math.asin(w / 2 / radius);
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, h, 14, 1, true, -alpha, alpha * 2), spineMat);
  spine.position.set(0, h / 2, depth / 2 - 2 - radius * Math.cos(alpha));
  const board = new THREE.BoxGeometry(2, h, depth - 2);
  const left = new THREE.Mesh(board, cloth);
  left.position.set(-w / 2 + 1, h / 2, -1);
  const right = new THREE.Mesh(board, cloth);
  right.position.set(w / 2 - 1, h / 2, -1);
  const pages = new THREE.Mesh(new THREE.BoxGeometry(w - 4, h - 5, depth - 7), kit.paper);
  pages.position.set(0, (h - 5) / 2 + 2, -2.5);
  // Headband: the little woven strip where the pages meet the spine.
  const band = new THREE.Mesh(new THREE.BoxGeometry(w - 4, 1.6, 3), new THREE.MeshStandardMaterial({ color: 0xb08a4a, roughness: 0.8 }));
  band.position.set(0, h - 2.6, depth / 2 - 5);
  g.add(spine, left, right, pages, band);
  return g;
}

export function buildBook(kit: Kit, el: HTMLElement): Built {
  const style = getComputedStyle(el);
  const w = parseFloat(style.getPropertyValue('--w')) || 34;
  const h = parseFloat(style.getPropertyValue('--h')) || 140;
  const model = book(kit, w, h, el.dataset.bookTone ?? 'brown', el.dataset.bookTitle ?? null);
  const root = new THREE.Group();
  root.add(model);
  // Hover: the book tips out of the row by its head, as a finger would pull it.
  const pose = { lift: 0, tip: 0 };
  const apply = () => {
    model.position.y = pose.lift;
    model.rotation.x = pose.tip;
    kit.studio.invalidate();
  };
  const to = (lift: number, tip: number, ease: string, duration: number) =>
    gsap.to(pose, { lift, tip, duration: kit.studio.reduced() ? 0 : duration, ease, overwrite: true, onUpdate: apply });
  onHover(el, () => to(5, 0.2, 'power3.out', 0.42), () => to(0, 0, 'power2.inOut', 0.5));
  el.addEventListener('pointerdown', () => to(2, 0.3, 'power2.out', 0.14));
  return { root, designW: w, designH: h, pitch: 0.1, depth: 20 };
}

export function buildBookPair(kit: Kit): Built {
  const root = new THREE.Group();
  const a = book(kit, 40, 136, 'slate', null);
  a.position.x = -22;
  const b = book(kit, 42, 152, 'brown', null);
  b.position.x = 20;
  root.add(a, b);
  return { root, designW: 84, designH: 154, pitch: 0.1, depth: 20 };
}

export function buildBookLean(kit: Kit): Built {
  const root = new THREE.Group();
  const b = book(kit, 24, 106, 'tan', null);
  // Leaning against its neighbour: the foot stays planted at the right.
  b.position.set(8, 0, 0);
  b.rotation.z = 0.2;
  root.add(b);
  return { root, designW: 44, designH: 108, pitch: 0.1, depth: 18 };
}

/* ---------------------------------------------------------------- Globe */

export function buildGlobe(kit: Kit, el: HTMLElement, map: THREE.Texture): Built {
  const { studio } = kit;
  const root = new THREE.Group();
  const R = 58;
  const CY = 124;
  const TILT = -0.41; // 23.5° axial tilt

  const base = lathe([[0, 0], [41, 0], [42, 3], [38, 7], [24, 10], [12, 12], [7, 18], [5, 30], [6.5, 40], [5, 50], [4.4, CY - R - 6]], kit.brass, 56);
  const foot = lathe([[0, 0], [44, 0], [44, 2.5], [0, 2.5]], kit.bronze, 56);
  root.add(foot, base);

  const axis = new THREE.Group();
  axis.position.set(0, CY, 0);
  axis.rotation.z = TILT;
  root.add(axis);

  const spin = new THREE.Group();
  axis.add(spin);
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(R, 72, 48),
    new THREE.MeshPhysicalMaterial({ map, color: 0xe6d9c4, roughness: 0.6, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.35 }),
  );
  spin.add(sphere);

  // Brass semi-meridian from pole to pole, swung towards the viewer.
  const meridian = new THREE.Mesh(new THREE.TorusGeometry(R + 5.5, 2.5, 12, 72, Math.PI * 1.1), kit.brass);
  meridian.rotation.z = -Math.PI * 0.55;
  const swing = new THREE.Group();
  swing.rotation.y = -0.5;
  swing.add(meridian);
  axis.add(swing);
  for (const s of [1, -1]) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 9, 16), kit.brass);
    pin.position.y = s * (R + 3.5);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 12), kit.brass);
    cap.position.y = s * (R + 8);
    axis.add(pin, cap);
  }
  // Collar where the stem takes the meridian.
  const collar = new THREE.Mesh(new THREE.SphereGeometry(6, 20, 14), kit.brass);
  collar.position.set(0, CY - R - 5.5, 0);
  root.add(collar);

  // Drag to turn (with inertia), arrow keys to step, Home to reset.
  const START = -1.9; // Africa, India and Asia face the room
  spin.rotation.y = START;
  let velocity = 0;
  let dragging = false;
  let raf = 0;
  let last = 0;
  let lean = 0;
  const tick = (t: number) => {
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    if (!dragging) {
      velocity *= Math.pow(0.34, dt); // friction of the bearing
      spin.rotation.y += velocity * dt;
      lean *= Math.pow(0.02, dt);
    }
    axis.rotation.x = lean;
    studio.invalidate();
    raf = dragging || Math.abs(velocity) > 0.012 || Math.abs(lean) > 0.002 ? requestAnimationFrame(tick) : 0;
  };
  const wake = () => {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };
  el.setAttribute('role', 'button');
  el.tabIndex = 0;
  el.setAttribute('aria-label', 'Desk globe: drag or use the arrow keys to turn it');
  el.setAttribute('aria-describedby', 'globe-hint');
  let lastX = 0;
  let lastY = 0;
  let lastT = 0;
  let moved = 0;
  el.addEventListener('pointerdown', (e) => {
    dragging = true;
    moved = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = performance.now();
    velocity = 0;
    el.setPointerCapture(e.pointerId);
    el.classList.add('is-dragging');
    wake();
  });
  el.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const radiusPx = (el.getBoundingClientRect().width / 142) * R;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    moved += Math.abs(dx) + Math.abs(dy);
    const step = dx / radiusPx;
    spin.rotation.y += step;
    lean = THREE.MathUtils.clamp(lean + (dy / radiusPx) * 0.35, -0.24, 0.24);
    const now = performance.now();
    velocity = step / Math.max(0.008, (now - lastT) / 1000);
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = now;
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('is-dragging');
    if (performance.now() - lastT > 90) velocity = 0; // held still before letting go
    if (moved < 4) velocity = studio.reduced() ? 0 : 2.6; // a tap gives it one push
    if (moved < 4 && studio.reduced()) spin.rotation.y += 0.6;
    if (studio.reduced()) velocity = 0;
    velocity = THREE.MathUtils.clamp(velocity, -9, 9);
    wake();
  };
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      velocity = 0;
      const to = spin.rotation.y + (e.key === 'ArrowLeft' ? -0.4 : 0.4);
      gsap.to(spin.rotation, { y: to, duration: studio.reduced() ? 0 : 0.36, ease: 'power2.out', overwrite: true, onUpdate: studio.invalidate });
    } else if (e.key === 'Home') {
      e.preventDefault();
      velocity = 0;
      gsap.to(spin.rotation, { y: START, duration: studio.reduced() ? 0 : 0.6, ease: 'power2.inOut', overwrite: true, onUpdate: studio.invalidate });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (studio.reduced()) spin.rotation.y += 0.6;
      else velocity = 2.6;
      wake();
    }
  });
  return { root, designW: 142, pitch: 0.1, depth: 30, dispose: () => cancelAnimationFrame(raf) };
}

/* ---------------------------------------------------------------- Lamps */

interface Bulb {
  set: (on: boolean, instant: boolean) => void;
}
function bulb(kit: Kit, parent: THREE.Object3D, at: THREE.Vector3, size: number, inner: THREE.MeshStandardMaterial): Bulb {
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff3d2, toneMapped: false });
  const glass = new THREE.Mesh(new THREE.SphereGeometry(size, 20, 14), lampMat);
  glass.position.copy(at);
  const bloom = halo(kit, size * 15, 0.5, 0xffd9a0);
  bloom.position.copy(at);
  parent.add(glass, bloom);
  const state = { k: 1 };
  const apply = () => {
    lampMat.color.setRGB(0.22 + 0.78 * state.k, 0.2 + 0.75 * state.k, 0.17 + 0.65 * state.k);
    (bloom.material as THREE.SpriteMaterial).opacity = 0.5 * state.k;
    inner.emissiveIntensity = 1.5 * state.k;
    kit.studio.invalidate();
  };
  return {
    set(on, instant) {
      // A filament does not snap: it warms up quickly and cools a little slower.
      gsap.to(state, { k: on ? 1 : 0, duration: instant || kit.studio.reduced() ? 0 : on ? 0.45 : 0.7, ease: on ? 'power2.out' : 'power1.in', overwrite: true, onUpdate: apply });
    },
  };
}
// Both shade skins are double-sided: depth sorts which one the viewer sees.
const shadeInner = () => new THREE.MeshStandardMaterial({ color: 0xf4e3c0, emissive: 0xffc777, emissiveIntensity: 1.5, roughness: 0.6, side: THREE.DoubleSide });

export function buildLamp(kit: Kit, el: HTMLElement): Built {
  const root = new THREE.Group();
  const B = V(88, 12, 0);
  const E = V(106, 116, 0);
  const H = V(-14, 190, 0);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(30.5, 0.9, 8, 56), kit.brass);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 4.4;
  const foot = new THREE.Group();
  foot.position.x = B.x;
  foot.add(lathe([[0, 0], [31, 0], [32, 2], [30, 5], [12, 8], [7, 12], [0, 12]], kit.bronze), ring);
  root.add(foot);
  // Two parallel arms per section, as on an architect's lamp.
  for (const dz of [-3.4, 3.4]) {
    root.add(rod(V(B.x, B.y, dz), V(E.x, E.y, dz), 1.7, kit.brass));
    root.add(rod(V(E.x, E.y, dz), V(H.x, H.y, dz), 1.7, kit.brass));
  }
  for (const [p, r] of [[B, 6.2], [E, 6.6], [H, 5.6]] as const) {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 11, 24), kit.bronze);
    knob.rotation.x = Math.PI / 2;
    knob.position.copy(p);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.5, r * 0.5, 12.6, 20), kit.brass);
    cap.rotation.x = Math.PI / 2;
    cap.position.copy(p);
    root.add(knob, cap);
  }
  // Head: a spun bell shade aimed down-left at the shelf, slightly at the room.
  const head = new THREE.Group();
  head.position.copy(H);
  head.quaternion.setFromUnitVectors(UP, V(-0.55, -0.74, 0.38).normalize());
  const profile: [number, number][] = [[5, 2], [8, 8], [14, 16], [27, 36], [35, 52], [36, 55]];
  const outer = lathe(profile, new THREE.MeshStandardMaterial({ color: 0x2b1f17, metalness: 0.8, roughness: 0.36, side: THREE.DoubleSide }));
  const innerMat = shadeInner();
  const inner = lathe(profile, innerMat);
  inner.scale.set(0.97, 0.995, 0.97);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(36, 1.1, 8, 56), kit.brass);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 55;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(5, 6, 10, 20), kit.brass);
  neck.position.y = 1;
  head.add(outer, inner, rim, neck);
  root.add(head);
  const light = bulb(kit, head, V(0, 34, 0), 8, innerMat);
  // The switch is the whole lamp; a press nods the head a few degrees.
  el.addEventListener('click', () => {
    if (kit.studio.reduced()) return;
    gsap.fromTo(head.rotation, { z: head.rotation.z }, { z: head.rotation.z + 0.05, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1, onUpdate: kit.studio.invalidate });
  });
  return { root, designW: 250, pitch: 0.1, depth: 40, lamp: light.set };
}

export function buildPendant(kit: Kit): Built {
  const root = new THREE.Group();
  root.add(rod(V(0, 0, 0), V(0, -58, 0), 0.9, kit.bronze, 8));
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(5, 7.5, 12, 24), kit.brass);
  cap.position.y = -62;
  const profile: [number, number][] = [[6, -66], [12, -69], [26, -78], [38, -92], [42, -104], [42.6, -107]];
  const outer = lathe(profile, new THREE.MeshStandardMaterial({ color: 0x241913, metalness: 0.75, roughness: 0.4, side: THREE.DoubleSide }));
  const innerMat = shadeInner();
  const inner = lathe(profile, innerMat);
  inner.scale.set(0.975, 1, 0.975);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(42.6, 1.2, 8, 56), kit.brass);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -107;
  root.add(cap, outer, inner, rim);
  const light = bulb(kit, root, V(0, -100, 0), 9.5, innerMat);
  return { root, designW: 104, origin: 'top', pitch: -0.22, depth: 40, lamp: light.set };
}

/* --------------------------------------------------------------- Rocket */

export function buildRocket(kit: Kit, el: HTMLElement): Built {
  const { studio } = kit;
  const root = new THREE.Group();
  // Turned walnut stand with a scorched centre.
  root.add(lathe([[0, 0], [37, 0], [38, 3], [35, 7], [30, 9], [0, 9]], kit.walnut, 48));
  const scorch = new THREE.Mesh(new THREE.CircleGeometry(15, 32), new THREE.MeshBasicMaterial({ color: 0x120703, transparent: true, opacity: 0.55, depthWrite: false }));
  scorch.rotation.x = -Math.PI / 2;
  scorch.position.y = 9.2;
  root.add(scorch);

  const ship = new THREE.Group();
  ship.position.y = -4;
  root.add(ship);
  const enamel = new THREE.MeshPhysicalMaterial({ color: 0xf3efe6, roughness: 0.26, metalness: 0.08, clearcoat: 1, clearcoatRoughness: 0.1 });
  const red = new THREE.MeshPhysicalMaterial({ color: 0xb3261b, roughness: 0.3, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.12 });
  ship.add(lathe([[13.2, 34], [14.6, 46], [16.4, 64], [17.4, 86], [17.4, 106], [16, 124], [12.6, 142]], enamel, 56));
  ship.add(lathe([[12.6, 142], [8, 156], [3.4, 166], [0.6, 171], [0, 172]], red, 56));
  ship.add(lathe([[16.9, 58], [17.5, 61], [17.8, 66], [17.5, 70]], red, 56));
  ship.add(lathe([[8.5, 35], [10.5, 30], [12.4, 22]], new THREE.MeshStandardMaterial({ color: 0x33302c, metalness: 0.9, roughness: 0.35, side: THREE.DoubleSide }), 40));
  // Porthole.
  const port = new THREE.Group();
  port.position.set(0, 110, 16.9);
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(6.6, 1.7, 12, 36), kit.steel);
  const glass = new THREE.Mesh(new THREE.SphereGeometry(5.8, 28, 16), new THREE.MeshPhysicalMaterial({ color: 0x1b4a78, roughness: 0.05, metalness: 0.3, clearcoat: 1 }));
  glass.scale.z = 0.3;
  port.add(bezel, glass);
  ship.add(port);
  // Three swept fins: one facing the room, two raked back.
  const finShape = new THREE.Shape();
  finShape.moveTo(12.6, 62);
  finShape.quadraticCurveTo(30, 44, 33, 14);
  finShape.lineTo(27, 16);
  finShape.quadraticCurveTo(22, 28, 12.6, 32);
  finShape.closePath();
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 2.6, bevelEnabled: true, bevelSize: 0.7, bevelThickness: 0.7, bevelSegments: 2 });
  finGeo.translate(0, 0, -1.3);
  for (const a of [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6]) {
    const fin = new THREE.Mesh(finGeo, red);
    fin.rotation.y = a;
    ship.add(fin);
  }
  // Engine: two nested additive flames and a bloom, all driven by one throttle.
  const flame = new THREE.Group();
  flame.position.y = 22;
  const outer = new THREE.Mesh(new THREE.ConeGeometry(8, 30, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
  outer.rotation.x = Math.PI;
  outer.position.y = -15;
  const core = new THREE.Mesh(new THREE.ConeGeometry(4.2, 18, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff1b8, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
  core.rotation.x = Math.PI;
  core.position.y = -9;
  flame.add(outer, core);
  ship.add(flame);
  const bloom = halo(kit, 90, 0.3, 0xffb060);
  bloom.position.set(0, 14, 20);
  root.add(bloom);

  const REST = 0.34;
  const s = { throttle: REST, y: 0, x: 0, roll: 0 };
  const apply = () => {
    flame.scale.set(0.55 + s.throttle * 0.55, s.throttle, 0.55 + s.throttle * 0.55);
    (bloom.material as THREE.SpriteMaterial).opacity = 0.16 + s.throttle * 0.42;
    bloom.scale.setScalar(70 + s.throttle * 50);
    ship.position.set(s.x, -4 + s.y, 0);
    ship.rotation.z = s.roll;
    scorch.material.opacity = 0.55 + Math.min(0.3, s.throttle * 0.2);
    studio.invalidate();
  };
  apply();

  let flight: gsap.core.Timeline | null = null;
  const launch = () => {
    if (flight?.isActive()) return;
    if (studio.reduced()) {
      // No travel: the engine simply brightens and settles.
      flight = gsap.timeline({ onUpdate: apply }).to(s, { throttle: 1.2, duration: 0.01 }).to(s, { throttle: REST, duration: 0.01 }, 0.7);
      return;
    }
    flight = gsap
      .timeline({ onUpdate: apply, onComplete: () => el.removeAttribute('data-flying') })
      // Ignition: the engine catches and the airframe shudders on its stand.
      .to(s, { throttle: 1.35, duration: 0.34, ease: 'power2.in' }, 0)
      .to(s, { keyframes: { x: [0, 0.7, -0.6, 0.5, -0.4, 0.2, 0] }, duration: 0.36, ease: 'none' }, 0.02)
      // Lift-off: thrust beats gravity, then tapers into a short hover.
      .to(s, { y: 54, duration: 0.82, ease: 'power2.out' }, 0.3)
      .to(s, { throttle: 1.7, duration: 0.3, ease: 'power1.out' }, 0.3)
      .to(s, { roll: 0.045, duration: 0.5, ease: 'sine.inOut' }, 0.4)
      .to(s, { throttle: 1.05, duration: 0.42, ease: 'sine.inOut' }, 0.72)
      .to(s, { roll: -0.03, duration: 0.5, ease: 'sine.inOut' }, 0.9)
      // Controlled descent and a soft touchdown.
      .to(s, { y: 0, duration: 0.95, ease: 'power2.inOut' }, 1.22)
      .to(s, { throttle: 1.25, duration: 0.4, ease: 'sine.in' }, 1.5)
      .to(s, { roll: 0, duration: 0.5, ease: 'sine.out' }, 1.5)
      .to(s, { y: -1.4, duration: 0.09, ease: 'power1.out' }, 2.17)
      .to(s, { y: 0, duration: 0.3, ease: 'back.out(3)' }, 2.26)
      .to(s, { throttle: REST, duration: 0.5, ease: 'power2.out' }, 2.14);
    el.setAttribute('data-flying', '');
  };
  el.addEventListener('click', launch);
  onHover(
    el,
    () => {
      if (flight?.isActive() || studio.reduced()) return;
      gsap.to(s, { throttle: 0.6, duration: 0.3, ease: 'power2.out', onUpdate: apply });
      gsap.fromTo(s, { roll: 0 }, { keyframes: { roll: [0, 0.03, -0.02, 0.01, 0] }, duration: 0.7, ease: 'sine.inOut', onUpdate: apply });
    },
    () => {
      if (flight?.isActive()) return;
      gsap.to(s, { throttle: REST, duration: 0.5, ease: 'power2.out', onUpdate: apply });
    },
  );
  return { root, designW: 86, pitch: 0.26, depth: 30, dispose: () => flight?.kill() };
}

/* ------------------------------------------------------------------ Mug */

export function buildMug(kit: Kit): Built {
  const root = new THREE.Group();
  root.add(lathe([[0, 0], [60, 0], [61, 2], [59, 5], [0, 5]], kit.walnut, 48));
  const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xf6efe1, roughness: 0.32, clearcoat: 0.85, clearcoatRoughness: 0.18, side: THREE.DoubleSide });
  const mug = new THREE.Group();
  mug.position.y = 5;
  mug.add(lathe([[0, 0.4], [33, 0.4], [37.5, 2], [40, 7], [42.2, 80], [42.8, 84], [41.6, 86], [39.6, 84.5], [38, 12], [34, 8], [0, 8]], ceramic, 64));
  const wrap = new THREE.Mesh(
    new THREE.CylinderGeometry(42.35, 40.75, 56, 48, 1, true, -0.92, 1.84),
    new THREE.MeshStandardMaterial({ map: mugTexture(kit.studio.maxAnisotropy), transparent: true, roughness: 0.4, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
  );
  wrap.position.y = 45;
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(39.4, 48), new THREE.MeshPhysicalMaterial({ color: 0x2a1408, roughness: 0.12, clearcoat: 1 }));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 77;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(21, 5.6, 14, 36, Math.PI * 1.16), ceramic);
  handle.rotation.z = -Math.PI * 0.58;
  const arm = new THREE.Group();
  arm.position.set(40, 44, 0);
  arm.rotation.y = -0.42;
  arm.add(handle);
  mug.add(wrap, coffee, arm);
  root.add(mug);
  return { root, designW: 140, pitch: 0.34, depth: 60 };
}

/* ---------------------------------------------------------------- Clock */

export function buildClock(kit: Kit, el: HTMLElement): Built {
  const root = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(164, 62, 46, 5, 8), new THREE.MeshPhysicalMaterial({ color: 0x17110d, roughness: 0.3, metalness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.3 }));
  body.position.y = 35;
  const [face] = canvas(900, 300);
  const texture = toTexture(face, kit.studio.maxAnisotropy);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(150, 48), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
  screen.position.set(0, 35, 23.7);
  const bezel = new THREE.Mesh(new RoundedBoxGeometry(154, 52, 2, 3, 3), new THREE.MeshStandardMaterial({ color: 0x080504, roughness: 0.2, metalness: 0.4 }));
  bezel.position.set(0, 35, 22.4);
  root.add(body, bezel, screen);
  for (const x of [-62, 62]) {
    const footPad = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 4, 16), kit.bronze);
    footPad.position.set(x, 2, 8);
    root.add(footPad);
  }
  root.rotation.y = -0.1;
  const draw = (time: string, period: string) => {
    drawClockFace(face, time, period);
    texture.needsUpdate = true;
    kit.studio.invalidate();
  };
  draw(el.dataset.time ?? '--:--', el.dataset.period ?? '');
  const onClock = (event: Event) => {
    const { value, period } = (event as CustomEvent<{ value: string; period: string }>).detail;
    draw(value, period);
  };
  window.addEventListener('shelf:clock', onClock);
  return { root, designW: 172, pitch: 0.16, depth: 70, dispose: () => window.removeEventListener('shelf:clock', onClock) };
}

/* ----------------------------------------------------- Notebook and pen */

export function buildNotebook(kit: Kit, el: HTMLElement): Built {
  const { studio } = kit;
  const root = new THREE.Group();
  const bookGroup = new THREE.Group();
  bookGroup.position.y = 64; // flat objects centre on their anchor
  bookGroup.rotation.y = 0.06;
  root.add(bookGroup);
  const leather = new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: 0.62 });
  const cover = new THREE.Mesh(new RoundedBoxGeometry(384, 4, 256, 3, 3), leather);
  cover.position.y = 2;
  bookGroup.add(cover);
  const edge = kit.paper;
  const page = (x: number, map: THREE.Texture) => {
    const top = new THREE.MeshStandardMaterial({ map, color: 0xe9dfca, roughness: 0.9 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(184, 7, 244), [edge, edge, top, edge, edge, edge]);
    mesh.position.set(x, 7.5, 0);
    return mesh;
  };
  bookGroup.add(page(-92.5, sketchPage(studio.maxAnisotropy)), page(92.5, wordsPage(studio.maxAnisotropy)));
  const gutter = new THREE.Mesh(new THREE.PlaneGeometry(5, 244), new THREE.MeshBasicMaterial({ color: 0x3b2a1a, transparent: true, opacity: 0.6 }));
  gutter.rotation.x = -Math.PI / 2;
  gutter.position.y = 11.2;
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(7, 0.8, 54), new THREE.MeshStandardMaterial({ color: 0x8a2a1c, roughness: 0.7 }));
  ribbon.position.set(26, 11.5, 112);
  ribbon.rotation.y = 0.08;
  bookGroup.add(gutter, ribbon);
  const pose = { lift: 0 };
  const to = (lift: number) =>
    gsap.to(pose, {
      lift,
      duration: studio.reduced() ? 0 : 0.45,
      ease: 'power3.out',
      overwrite: true,
      onUpdate: () => {
        bookGroup.position.y = 64 + pose.lift;
        bookGroup.rotation.z = pose.lift * 0.002;
        studio.invalidate();
      },
    });
  onHover(el, () => to(5), () => to(0));
  return { root, designW: 390, pitch: 0.5, depth: 0 };
}

export function buildPen(kit: Kit, el: HTMLElement): Built {
  const { studio } = kit;
  const root = new THREE.Group();
  const lay = new THREE.Group();
  lay.position.y = 30;
  lay.rotation.y = 0.42; // lying diagonally across the right-hand page
  root.add(lay);
  const shade = blob(kit, 150, 26, 0.55);
  shade.position.set(4, -3.6, 5);
  lay.add(shade);
  const pen = new THREE.Group();
  lay.add(pen);
  const lacquer = new THREE.MeshPhysicalMaterial({ color: 0x15110e, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, metalness: 0.2 });
  const part = (geometry: THREE.BufferGeometry, material: THREE.Material, x: number) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.z = -Math.PI / 2; // lathe axis (y) laid along +x
    mesh.position.x = x;
    pen.add(mesh);
    return mesh;
  };
  part(new THREE.CylinderGeometry(4.3, 4.6, 56, 24), lacquer, -38); // cap
  part(new THREE.SphereGeometry(4.3, 20, 12), lacquer, -66);
  part(new THREE.CylinderGeometry(4.9, 4.9, 3.4, 24), kit.brass, -11); // cap band
  part(new THREE.CylinderGeometry(3.4, 4.2, 52, 24), lacquer, 17); // barrel
  part(new THREE.CylinderGeometry(3.6, 3.6, 2.6, 24), kit.brass, 44);
  part(new THREE.CylinderGeometry(2.2, 3.3, 9, 20), lacquer, 50); // grip
  part(new THREE.ConeGeometry(2.3, 13, 20), kit.brass, 61); // nib
  const clip = new THREE.Mesh(new RoundedBoxGeometry(36, 1.4, 2.6, 2, 0.6), kit.brass);
  clip.position.set(-40, 5.2, 0);
  pen.add(clip);
  const s = { roll: 0, hop: 0 };
  const apply = () => {
    pen.rotation.x = s.roll;
    pen.position.set(0, s.hop, s.roll * 3.2);
    studio.invalidate();
  };
  // A nudge: the pen rolls a quarter turn on its clip and rocks back.
  onHover(
    el,
    () => !studio.reduced() && gsap.to(s, { roll: 0.9, hop: 1.5, duration: 0.5, ease: 'power2.out', overwrite: true, onUpdate: apply }),
    () => gsap.to(s, { roll: 0, hop: 0, duration: studio.reduced() ? 0 : 0.9, ease: 'elastic.out(1, 0.55)', overwrite: true, onUpdate: apply }),
  );
  return { root, designW: 118, pitch: 0.5, depth: 120 };
}

/* ----------------------------------------------------------- Headphones */

export function buildHeadphones(kit: Kit, el: HTMLElement): Built {
  const { studio } = kit;
  const root = new THREE.Group();
  const hang = new THREE.Group(); // pivots on the tack
  hang.position.y = 140;
  root.add(hang);
  const body = new THREE.Group();
  body.position.y = -140;
  body.rotation.y = 0.32;
  hang.add(body);
  const pad = new THREE.MeshStandardMaterial({ color: 0x2a1d15, roughness: 0.72 });
  const shell = new THREE.MeshPhysicalMaterial({ color: 0x1b1512, roughness: 0.34, metalness: 0.3, clearcoat: 0.6 });
  const band = new THREE.Mesh(new THREE.TorusGeometry(40, 4.6, 14, 48, Math.PI), pad);
  band.position.y = 92;
  const inner = new THREE.Mesh(new THREE.TorusGeometry(40, 2, 10, 48, Math.PI * 0.86), kit.brass);
  inner.position.y = 92;
  inner.rotation.z = Math.PI * 0.07;
  inner.scale.set(0.93, 0.93, 1.5);
  body.add(band, inner);
  for (const side of [-1, 1]) {
    body.add(rod(V(side * 40, 92, 0), V(side * 40, 62, 0), 1.8, kit.brass));
    const cup = new THREE.Group();
    cup.position.set(side * 40, 42, 0);
    cup.rotation.z = Math.PI / 2;
    const can = new THREE.Mesh(new THREE.CylinderGeometry(21, 22, 13, 40), shell);
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 14.4, 32), kit.brass);
    const cushion = new THREE.Mesh(new THREE.TorusGeometry(16.5, 6, 14, 36), pad);
    cushion.rotation.x = Math.PI / 2;
    cushion.position.y = side * 8; // inside face (cup axis runs along ∓x)
    cup.add(can, plate, cushion);
    body.add(cup);
  }
  el.style.pointerEvents = 'auto';
  el.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'touch' || studio.reduced() || gsap.isTweening(hang.rotation)) return;
    // One push, then a damped pendulum back to rest.
    gsap.timeline({ onUpdate: studio.invalidate }).to(hang.rotation, { z: 0.11, duration: 0.28, ease: 'power2.out' }).to(hang.rotation, { z: 0, duration: 2.2, ease: 'elastic.out(1.1, 0.22)' });
  });
  return { root, designW: 122, pitch: 0.04, depth: 30 };
}
