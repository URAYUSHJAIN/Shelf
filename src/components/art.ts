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
  /** Soft drop shadow under each leaf (needs #leafShadow). */
  shadow?: boolean;
  /** Water droplets on every nth leaf (0 disables). */
  drops?: number;
  /** Which gradient the first leaf uses. */
  first?: 'A' | 'B';
}

/**
 * A believable trailing stem: shaded cylindrical vine, curved stalks, leaves with a
 * darker half, veins, a wet gloss and a few water droplets. Returns SVG markup.
 */
export function vineMarkup(v: Vine, o: VineLook = {}) {
  const w = o.stem ?? 2.6;
  const k = o.scale ?? 1;
  const drops = o.drops ?? 0;
  let out = `<path d="${v.d}" fill="none" stroke="#25340f" stroke-width="${r(w + 1.8)}" stroke-linecap="round"/>`;
  out += `<path d="${v.d}" fill="none" stroke="#5f7c2b" stroke-width="${w}" stroke-linecap="round"/>`;
  out += `<path d="${v.d}" fill="none" stroke="#b9d065" stroke-opacity=".6" stroke-width="${r(w * 0.32)}" stroke-linecap="round" transform="translate(-.5 -.7)"/>`;
  v.leaves.forEach((l, i) => {
    const s = l.s * k;
    const grad = (i + (o.first === 'A' ? 1 : 0)) % 2 ? 'url(#leafA)' : 'url(#leafB)';
    const nodeR = r(w * 0.9);
    out += `<path d="M${l.px} ${l.py}L${l.x} ${l.y}" stroke="#3f5a1b" stroke-width="${r(w * 0.7)}" stroke-linecap="round"/>`;
    out += `<circle cx="${l.px}" cy="${l.py}" r="${nodeR}" fill="#6f8c34" stroke="#25340f" stroke-width=".7"/>`;
    const width = r(.66 + .3 * (1 + Math.sin(i * 2.4 + l.x * .08)) / 2);
    const curl = r(Math.sin(i * 1.9 + l.y * .04) * 12);
    out += `<g transform="translate(${l.x} ${l.y}) rotate(${l.a}) skewX(${curl}) scale(${width} 1)"${o.shadow ? ' filter="url(#leafShadow)"' : ''}>`;
    out += `<path d="${leafPath(s)}" fill="${grad}" stroke="#3e5426" stroke-width=".65" stroke-linejoin="round"/>`;
    out += `<path d="M0 0C${r(-0.51 * s)} ${r(0.1 * s)} ${r(-0.55 * s)} ${r(-0.53 * s)} 0 ${r(-s)}Z" fill="#0d2205" fill-opacity=".2"/>`;
    out += `<path d="${ribPath(s)}" fill="none" stroke="#c4cf8a" stroke-opacity=".38" stroke-width="${r(Math.max(0.4, s * 0.014))}" stroke-linecap="round"/>`;
    out += `<path d="M${r(.08 * s)} ${r(-.2 * s)}Q${r(.38 * s)} ${r(-.5 * s)} ${r(.04 * s)} ${r(-.86 * s)}Q${r(.22 * s)} ${r(-.44 * s)} ${r(.08 * s)} ${r(-.2 * s)}Z" fill="#e4e6af" fill-opacity=".13"/>`;
    if (drops && s > 18 && i % drops === 0) {
      const dx = r(0.14 * s);
      const dy = r(-0.52 * s);
      const rx = r(Math.max(1.3, s * 0.05));
      out += `<ellipse cx="${dx}" cy="${dy}" rx="${rx}" ry="${r(rx * 1.3)}" fill="#e4f6ff" fill-opacity=".5" stroke="#fff" stroke-opacity=".75" stroke-width=".5"/>`;
      out += `<circle cx="${r(dx - rx * 0.3)}" cy="${r(dy - rx * 0.4)}" r="${r(rx * 0.32)}" fill="#fff"/>`;
      out += `<ellipse cx="${r(-0.16 * s)}" cy="${r(-0.3 * s)}" rx="${r(rx * 0.75)}" ry="${r(rx * 0.95)}" fill="#e4f6ff" fill-opacity=".45" stroke="#fff" stroke-opacity=".6" stroke-width=".4"/>`;
    }
    out += '</g>';
  });
  return out;
}
