// Small geometry helpers for the hand-drawn scene art (build time only).

type Pt = [number, number];

function quad(p0: Pt, c: Pt, p1: Pt, t: number): Pt {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
}

function quadAngle(p0: Pt, c: Pt, p1: Pt, t: number) {
  const dx = 2 * (1 - t) * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0]);
  const dy = 2 * (1 - t) * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1]);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

const r = (n: number) => Math.round(n * 10) / 10;

/** Pointed heart-ish leaf with its base at 0,0 and tip at 0,-s. */
export function leafPath(s: number) {
  return `M0 0C${r(-0.51 * s)} ${r(0.1 * s)} ${r(-0.55 * s)} ${r(-0.53 * s)} 0 ${r(-s)}C${r(0.17 * s)} ${r(-0.67 * s)} ${r(0.56 * s)} ${r(-0.63 * s)} ${r(0.39 * s)} ${r(-0.28 * s)}Q${r(0.25 * s)} ${r(0.07 * s)} 0 0Z`;
}

export function ribPath(s: number) {
  return `M0 ${r(-0.06 * s)}Q${r(0.05 * s)} ${r(-0.5 * s)} 0 ${r(-0.88 * s)}M0 ${r(-0.28 * s)}Q${r(-0.17 * s)} ${r(-0.3 * s)} ${r(-0.3 * s)} ${r(-0.49 * s)}M0 ${r(-0.46 * s)}Q${r(-0.14 * s)} ${r(-0.49 * s)} ${r(-0.23 * s)} ${r(-0.63 * s)}M0 ${r(-0.28 * s)}Q${r(0.18 * s)} ${r(-0.33 * s)} ${r(0.31 * s)} ${r(-0.49 * s)}M0 ${r(-0.48 * s)}Q${r(0.12 * s)} ${r(-0.5 * s)} ${r(0.21 * s)} ${r(-0.67 * s)}`;
}

/** Slim olive-like leaf for the wall branches. */
export function slimLeaf(s: number) {
  return `M0 0C${r(-0.32 * s)} ${r(-0.2 * s)} ${r(-0.3 * s)} ${r(-0.75 * s)} 0 ${r(-s)}C${r(0.3 * s)} ${r(-0.75 * s)} ${r(0.32 * s)} ${r(-0.2 * s)} 0 0Z`;
}

export interface Leaf {
  x: number;
  y: number;
  a: number;
  s: number;
  /** Where the leaf's stalk leaves the main stem. */
  px: number;
  py: number;
}

export type Vine = { d: string; leaves: Leaf[] };

/** Leaves alternating along a quadratic vine, each on a short stalk (petiole). */
export function vine(p0: Pt, c: Pt, p1: Pt, n: number, size: number, spread = 62, shrink = 0.25): Vine {
  const leaves: Leaf[] = [];
  for (let i = 1; i <= n; i++) {
    // Fixed variation, never randomness: server and client renders agree.
    const variation = Math.sin(i * 2.399 + p0[0] * .13 + p1[1] * .07);
    const t = (i + variation * .17) / (n + 0.4);
    const [px, py] = quad(p0, c, p1, t);
    const along = quadAngle(p0, c, p1, t);
    const side = i % 2 ? 1 : -1;
    const a = along + 90 + side * spread + variation * 17;
    const s = size * (1 - shrink * t) * (.84 + .16 * Math.cos(i * 1.7 + p0[1]));
    const rad = (a * Math.PI) / 180;
    const stalk = s * 0.24;
    leaves.push({ x: r(px + Math.sin(rad) * stalk), y: r(py - Math.cos(rad) * stalk), a: r(a), s: r(s), px: r(px), py: r(py) });
  }
  return { d: `M${p0[0]} ${p0[1]}Q${c[0]} ${c[1]} ${p1[0]} ${p1[1]}`, leaves };
}

interface VineLook {
  /** Stem thickness in scene units. */
  stem?: number;
  /** Scale applied to every leaf. */
  scale?: number;
  /** Which gradient the first leaf uses. */
  first?: 'A' | 'B';
}

/**
 * One leaf drawn at 100 units, shared by every vine through <use>. Scene.astro
 * places this once in the shared <defs>; strokes do not scale with the leaf.
 */
export function leafSymbols() {
  const s = 100;
  const leaf = (id: string, grad: string) =>
    `<g id="${id}">` +
    `<path d="${leafPath(s)}" fill="url(#${grad})" stroke="#3e5426" stroke-width=".65" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>` +
    `<path d="M0 0C${r(-0.51 * s)} ${r(0.1 * s)} ${r(-0.55 * s)} ${r(-0.53 * s)} 0 ${r(-s)}Z" fill="#0d2205" fill-opacity=".2"/>` +
    `<path d="${ribPath(s)}" fill="none" stroke="#c4cf8a" stroke-opacity=".38" stroke-width=".5" stroke-linecap="round" vector-effect="non-scaling-stroke"/>` +
    `<path d="M${r(0.08 * s)} ${r(-0.2 * s)}Q${r(0.38 * s)} ${r(-0.5 * s)} ${r(0.04 * s)} ${r(-0.86 * s)}Q${r(0.22 * s)} ${r(-0.44 * s)} ${r(0.08 * s)} ${r(-0.2 * s)}Z" fill="#e4e6af" fill-opacity=".13"/>` +
    '</g>';
  return leaf('leaf-a', 'leafA') + leaf('leaf-b', 'leafB');
}

/**
 * A believable trailing stem: shaded cylindrical vine, curved stalks and leaves
 * with a darker half, veins and a soft gloss. Returns SVG markup. Leaves are
 * instances of the shared symbols above.
 */
export function vineMarkup(v: Vine, o: VineLook = {}) {
  const w = o.stem ?? 2.6;
  const k = o.scale ?? 1;
  let out = `<path d="${v.d}" fill="none" stroke="#25340f" stroke-width="${r(w + 1.8)}" stroke-linecap="round"/>`;
  out += `<path d="${v.d}" fill="none" stroke="#5f7c2b" stroke-width="${w}" stroke-linecap="round"/>`;
  out += `<path d="${v.d}" fill="none" stroke="#b9d065" stroke-opacity=".6" stroke-width="${r(w * 0.32)}" stroke-linecap="round" transform="translate(-.5 -.7)"/>`;
  let stalks = '';
  let leaves = '';
  v.leaves.forEach((l, i) => {
    const s = l.s * k;
    const id = (i + (o.first === 'A' ? 1 : 0)) % 2 ? 'leaf-a' : 'leaf-b';
    stalks += `M${l.px} ${l.py}L${l.x} ${l.y}`;
    const width = 0.66 + (0.3 * (1 + Math.sin(i * 2.4 + l.x * 0.08))) / 2;
    const curl = r(Math.sin(i * 1.9 + l.y * 0.04) * 12);
    const sy = Math.round(s) / 100;
    const sx = Math.round(width * s) / 100;
    leaves += `<use href="#${id}" transform="translate(${l.x} ${l.y}) rotate(${l.a}) skewX(${curl}) scale(${sx} ${sy})"/>`;
  });
  out += `<path d="${stalks}" fill="none" stroke="#3f5a1b" stroke-width="${r(w * 0.7)}" stroke-linecap="round"/>`;
  out += leaves;
  return out;
}
