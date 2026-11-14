// Mounts the studio layer after first paint. Returns false when WebGL is not
// available so the caller can start the illustrated fallbacks instead.
import * as THREE from 'three';
import { createStudio, type Built } from './core';
import { buildBook, buildBookLean, buildBookPair, buildClock, buildGlobe, buildHeadphones, buildLamp, buildMug, buildNotebook, buildPen, buildPendant, buildRocket, makeKit } from './objects';
import { globeTexture } from './textures';

/** Hands the main thread back between objects so input is never blocked. */
const breathe = () =>
  new Promise<void>((resolve) => {
    const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
    if (scheduler?.yield) void scheduler.yield().then(resolve);
    else setTimeout(resolve, 0);
  });

export async function mountStudio(options: { reduced: () => boolean }): Promise<boolean> {
  const stage = document.querySelector<HTMLElement>('[data-scene]');
  const canvas = stage?.querySelector<HTMLCanvasElement>('[data-studio-canvas]');
  if (!stage || !canvas) return false;
  const studio = createStudio(canvas, stage, options.reduced);
  if (!studio) return false;
  await breathe();
  const kit = makeKit(studio);
  const each = (kind: string) => [...stage.querySelectorAll<HTMLElement>(`[data-studio="${kind}"]`)];
  // Objects that are not laid out in this layout mode (for example the pendant
  // on phones) are not built at all.
  const shown = (el: HTMLElement) => el.getClientRects().length > 0;

  const builders: [string, (el: HTMLElement) => Built][] = [
    ['book', (el) => buildBook(kit, el)],
    ['bookpair', () => buildBookPair(kit)],
    ['booklean', () => buildBookLean(kit)],
    ['lamp', (el) => buildLamp(kit, el)],
    ['pendant', () => buildPendant(kit)],
    ['headphones', (el) => buildHeadphones(kit, el)],
    ['rocket', (el) => buildRocket(kit, el)],
    ['mug', () => buildMug(kit)],
    ['clock', (el) => buildClock(kit, el)],
    ['notebook', (el) => buildNotebook(kit, el)],
    ['pen', (el) => buildPen(kit, el)],
  ];
  for (const [kind, build] of builders) {
    for (const el of each(kind).filter(shown)) {
      studio.add(el, build(el));
      await breathe(); // one object per task
    }
  }
  await studio.start();

  // Secondary assets: the globe map and the CC0 speaker model (D-44).
  const globe = each('globe')[0];
  if (globe) {
    globeTexture(studio.maxAnisotropy)
      .then((map) => studio.add(globe, buildGlobe(kit, globe, map)))
      .catch(() => globe.dispatchEvent(new CustomEvent('studio:fallback')));
  }
  const speaker = each('speaker')[0];
  if (speaker && speaker.getClientRects().length) {
    void import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
      new GLTFLoader().load('/media/models/portable-handle-speaker.glb', (gltf) => {
        // The GLB is modelled in metres, grille facing +z, feet at y = 0.
        const root = new THREE.Group();
        const model = gltf.scene;
        model.scale.setScalar(440);
        model.rotation.y = -0.16;
        root.add(model);
        studio.add(speaker, { root, designW: 198, pitch: 0.12, depth: 20 });
        speaker.classList.add('is-ready');
        document.querySelector('svg[data-speaker-surface]')?.setAttribute('hidden', '');
      });
    });
  }
  return true;
}
