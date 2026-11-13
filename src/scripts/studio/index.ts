// Mounts the studio layer after first paint. Returns false when WebGL is not
// available so the caller can start the illustrated fallbacks instead.
import * as THREE from 'three';
import { createStudio } from './core';
import { buildBook, buildBookLean, buildBookPair, buildClock, buildGlobe, buildHeadphones, buildLamp, buildMug, buildNotebook, buildPen, buildPendant, buildRocket, makeKit } from './objects';
import { globeTexture } from './textures';

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export async function mountStudio(options: { reduced: () => boolean }): Promise<boolean> {
  const stage = document.querySelector<HTMLElement>('[data-scene]');
  const canvas = stage?.querySelector<HTMLCanvasElement>('[data-studio-canvas]');
  if (!stage || !canvas) return false;
  const studio = createStudio(canvas, stage, options.reduced);
  if (!studio) return false;
  const kit = makeKit(studio);
  const each = (kind: string) => [...stage.querySelectorAll<HTMLElement>(`[data-studio="${kind}"]`)];

  // Built in small batches so no single task blocks input.
  const batches: (() => void)[] = [
    () => {
      for (const el of each('book')) studio.add(el, buildBook(kit, el));
      for (const el of each('bookpair')) studio.add(el, buildBookPair(kit));
      for (const el of each('booklean')) studio.add(el, buildBookLean(kit));
    },
    () => {
      for (const el of each('lamp')) studio.add(el, buildLamp(kit, el));
      for (const el of each('pendant')) studio.add(el, buildPendant(kit));
      for (const el of each('headphones')) studio.add(el, buildHeadphones(kit, el));
    },
    () => {
      for (const el of each('rocket')) studio.add(el, buildRocket(kit, el));
      for (const el of each('mug')) studio.add(el, buildMug(kit));
      for (const el of each('clock')) studio.add(el, buildClock(kit, el));
    },
    () => {
      for (const el of each('notebook')) studio.add(el, buildNotebook(kit, el));
      for (const el of each('pen')) studio.add(el, buildPen(kit, el));
    },
  ];
  for (const batch of batches) {
    batch();
    await nextFrame();
  }

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
