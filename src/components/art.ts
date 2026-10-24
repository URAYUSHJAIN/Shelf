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
  return `M0 0C${r(-0.58 * s)} ${r(-0.08 * s)} ${r(-0.66 * s)} ${r(-0.72 * s)} 0 ${r(-s)}C${r(0.66 * s)} ${r(-0.72 * s)} ${r(0.58 * s)} ${r(-0.08 * s)} 0 0Z`;
}

export function ribPath(s: number) {
  return `M0 ${r(-0.06 * s)}Q${r(0.05 * s)} ${r(-0.5 * s)} 0 ${r(-0.88 * s)}`;
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
}

/** Leaves alternating along a quadratic vine. */
export function vine(p0: Pt, c: Pt, p1: Pt, n: number, size: number, spread = 62, shrink = 0.25): { d: string; leaves: Leaf[] } {
  const leaves: Leaf[] = [];
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 0.4);
    const [x, y] = quad(p0, c, p1, t);
    const along = quadAngle(p0, c, p1, t);
    const side = i % 2 ? 1 : -1;
    leaves.push({ x: r(x), y: r(y), a: r(along + 90 + side * spread), s: r(size * (1 - shrink * t)) });
  }
  return { d: `M${p0[0]} ${p0[1]}Q${c[0]} ${c[1]} ${p1[0]} ${p1[1]}`, leaves };
}
