// Generates the procedural material textures used by the scene (D-45).
// Run manually with `node scripts/make-textures.mjs`; outputs are committed
// under public/textures/. Uses sharp, which Astro already installs. Every
// texture tiles seamlessly because all noise is sampled on a periodic lattice.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const OUT = new URL('../public/textures/', import.meta.url);

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Periodic value noise: `px`/`py` lattice cells wrap. */
function makeNoise(seed, px, py) {
  const r = rng(seed);
  const g = new Float32Array(px * py);
  for (let i = 0; i < g.length; i++) g[i] = r();
  const at = (x, y) => g[(((y % py) + py) % py) * px + (((x % px) + px) % px)];
  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    let fx = x - xi;
    let fy = y - yi;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const c = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);
    return a + (b - a) * fx + (c - a + (a - b - c + d) * fx) * fy;
  };
}

/** fbm over a u,v in 0..1 domain with base lattice (bx, by); stays periodic. */
function fbm(seed, bx, by, octaves) {
  const layers = [];
  for (let o = 0; o < octaves; o++) layers.push(makeNoise(seed + o * 101, bx << o, by << o));
  return (u, v) => {
    let sum = 0;
    let amp = 0.5;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += amp * layers[o](u * (bx << o), v * (by << o));
      norm += amp;
      amp *= 0.5;
    }
    return sum / norm;
  };
}

const mix = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
function ramp(stops, t) {
  t = clamp01(t);
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1];
      const [t1, c1] = stops[i];
      const k = (t - t0) / (t1 - t0 || 1);
      return [mix(c0[0], c1[0], k), mix(c0[1], c1[1], k), mix(c0[2], c1[2], k)];
    }
  }
  return stops[stops.length - 1][1];
}

async function write(name, w, h, shade, quality = 84) {
  const buf = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = shade(x / w, y / h, x, y);
      const k = (y * w + x) * 3;
      buf[k] = Math.round(clamp01(c[0] / 255) * 255);
      buf[k + 1] = Math.round(clamp01(c[1] / 255) * 255);
      buf[k + 2] = Math.round(clamp01(c[2] / 255) * 255);
    }
  }
  await sharp(buf, { raw: { width: w, height: h, channels: 3 } }).webp({ quality, effort: 6 }).toFile(new URL(name, OUT).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  console.log('wrote', name);
}

/** Walnut: long cathedral figure along x, fine fibres, dark pores. */
function walnut(seed, palette) {
  const warp = fbm(seed, 1, 2, 4);
  const warp2 = fbm(seed + 7, 5, 9, 3);
  const fibre = fbm(seed + 13, 3, 200, 3);
  const pore = fbm(seed + 29, 40, 300, 2);
  const tone = fbm(seed + 41, 2, 2, 3);
  return (u, v) => {
    const w = warp(u, v) * 1.25 + warp2(u, v) * 0.12;
    const ring = 0.5 + 0.5 * Math.sin(Math.PI * 2 * (v * 8 + w * 2.2));
    const ring2 = 0.5 + 0.5 * Math.sin(Math.PI * 2 * (v * 23 + w * 4.4 + 0.3));
    const f = fibre(u, v);
    let t = 0.36 * ring + 0.16 * ring2 + 0.48 * f;
    t = mix(t, tone(u, v), 0.25);
    const c = ramp(palette, t);
    const p = smooth(0.7, 0.86, pore(u, v)) * 0.3 * (0.4 + 0.6 * (1 - ring));
    const hi = smooth(0.62, 0.9, f) * 0.1;
    return [c[0] * (1 - p) + 255 * hi * 0.5, c[1] * (1 - p) + 200 * hi * 0.5, c[2] * (1 - p) + 140 * hi * 0.5];
  };
}

const WALNUT = [
  [0, [38, 19, 9]],
  [0.3, [74, 40, 20]],
  [0.55, [104, 60, 31]],
  [0.8, [134, 82, 44]],
  [1, [162, 104, 58]],
];
const WALNUT_DARK = [
  [0, [24, 12, 6]],
  [0.35, [50, 27, 14]],
  [0.65, [76, 43, 22]],
  [1, [108, 64, 34]],
];

function cork(seed) {
  const blob = fbm(seed, 14, 14, 3);
  const grain = fbm(seed + 5, 64, 64, 2);
  const speck = fbm(seed + 9, 90, 90, 1);
  return (u, v) => {
    const b = blob(u, v);
    const g = grain(u, v);
    const t = 0.55 * b + 0.45 * g;
    const c = ramp(
      [
        [0, [120, 74, 38]],
        [0.4, [171, 116, 66]],
        [0.7, [198, 146, 90]],
        [1, [222, 176, 118]],
      ],
      t,
    );
    const d = smooth(0.72, 0.9, speck(u, v)) * 0.45;
    return [c[0] * (1 - d), c[1] * (1 - d), c[2] * (1 - d)];
  };
}

await mkdir(OUT, { recursive: true });
await write('walnut.webp', 1024, 512, walnut(11, WALNUT));
await write('walnut-dark.webp', 1024, 512, walnut(23, WALNUT_DARK));
await write('cork.webp', 512, 512, cork(5), 80);
