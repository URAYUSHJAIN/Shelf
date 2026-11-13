// Canvas-drawn textures for the studio objects. Everything here is procedural
// decoration; no portfolio fact is ever rendered into a texture.
import * as THREE from 'three';

export function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
}

export function toTexture(c: HTMLCanvasElement, anisotropy = 4) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = anisotropy;
  return t;
}

/** Cheap deterministic speckle so surfaces never look vector-flat. */
function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, count: number, alpha: number, seed = 7) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < count; i++) {
    const v = rand();
    ctx.fillStyle = v > 0.5 ? `rgba(255,240,215,${alpha * rand()})` : `rgba(30,14,4,${alpha * rand()})`;
    ctx.fillRect(rand() * w, rand() * h, 1 + rand() * 2.2, 1 + rand() * 1.6);
  }
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Antique globe: parchment land, ochre sea, inked coasts and a 15° graticule. */
export async function globeTexture(anisotropy: number) {
  const W = 1536;
  const H = 768;
  const img = await loadImage('/textures/world.webp');
  const [c, ctx] = canvas(W, H);
  ctx.drawImage(img, 0, 0, W, H);
  const src = ctx.getImageData(0, 0, W, H);
  const d = src.data;
  const land = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) land[i] = 0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2] < 200 ? 1 : 0;
  let s = 11;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let y = 0; y < H; y++) {
    const lat = Math.abs(y / H - 0.5) * 2;
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const k = i * 4;
      const isLand = land[i];
      // Coast: land pixel beside sea (wrapping in longitude).
      let coast = 0;
      if (isLand) {
        const l = land[y * W + ((x + W - 1) % W)];
        const r = land[y * W + ((x + 1) % W)];
        const u = y > 0 ? land[i - W] : 1;
        const b = y < H - 1 ? land[i + W] : 1;
        coast = l && r && u && b ? 0 : 1;
      }
      // Shallow-water band two pixels off the coast reads as a printed halo.
      let halo = 0;
      if (!isLand) {
        const n = (dx: number, dy: number) => land[Math.min(H - 1, Math.max(0, y + dy)) * W + ((x + dx + W) % W)];
        halo = n(3, 0) || n(-3, 0) || n(0, 3) || n(0, -3) ? 1 : 0;
      }
      const g = (rand() - 0.5) * 9;
      let R: number;
      let G: number;
      let B: number;
      if (coast) [R, G, B] = [96, 62, 28];
      else if (isLand) [R, G, B] = [236 - lat * 16 + g, 214 - lat * 18 + g, 166 - lat * 14 + g];
      else if (halo) [R, G, B] = [196 + g, 150 + g, 88 + g];
      else [R, G, B] = [168 - lat * 22 + g, 118 - lat * 18 + g, 60 - lat * 10 + g];
      d[k] = R;
      d[k + 1] = G;
      d[k + 2] = B;
      d[k + 3] = 255;
    }
  }
  ctx.putImageData(src, 0, 0);
  ctx.strokeStyle = 'rgba(70,40,14,.3)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  for (let lon = 0; lon <= 360; lon += 15) {
    const x = (lon / 360) * W;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
  }
  for (let la = 15; la < 180; la += 15) {
    const y = (la / 180) * H;
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
  }
  ctx.stroke();
  // Equator and tropics in a heavier, dashed rule.
  ctx.strokeStyle = 'rgba(70,40,14,.5)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 7]);
  ctx.beginPath();
  for (const la of [90, 66.5, 113.5]) {
    ctx.moveTo(0, (la / 180) * H);
    ctx.lineTo(W, (la / 180) * H);
  }
  ctx.stroke();
  const t = toTexture(c, anisotropy);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

export const BOOK_TONES: Record<string, { cover: string; dark: string; foil: string }> = {
  green: { cover: '#22412f', dark: '#11231a', foil: '#e2c27a' },
  oxblood: { cover: '#6a231d', dark: '#3a110e', foil: '#e6c682' },
  tan: { cover: '#8a5a30', dark: '#4e3018', foil: '#f0d596' },
  navy: { cover: '#1f2c4c', dark: '#101830', foil: '#dcc07e' },
  brown: { cover: '#4c301d', dark: '#27170d', foil: '#d9b871' },
  slate: { cover: '#2c3440', dark: '#161b22', foil: '#d9c08a' },
};

/** Cloth-and-foil spine. The title reads bottom-to-top, as on a shelved book. */
export function spineTexture(w: number, h: number, tone: string, title: string | null, anisotropy: number) {
  const k = 9;
  const [c, ctx] = canvas(Math.round(w * k), Math.round(h * k));
  const W = c.width;
  const H = c.height;
  const { cover, dark, foil } = BOOK_TONES[tone] ?? BOOK_TONES.brown;
  ctx.fillStyle = cover;
  ctx.fillRect(0, 0, W, H);
  speckle(ctx, W, H, W * H * 0.012, 0.16, w * 31 + h);
  // Raised bands shade the cloth above and below them.
  const band = (y: number) => {
    const g = ctx.createLinearGradient(0, y - 12, 0, y + 22);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.35, 'rgba(255,240,210,.22)');
    g.addColorStop(0.6, dark);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 12, W, 34);
  };
  ctx.strokeStyle = foil;
  ctx.fillStyle = foil;
  const rule = (y: number, weight: number) => {
    ctx.lineWidth = weight;
    ctx.beginPath();
    ctx.moveTo(W * 0.06, y);
    ctx.lineTo(W * 0.94, y);
    ctx.stroke();
  };
  for (const y of [H * 0.085, H * 0.915]) {
    band(y);
    rule(y - 20, 5);
    rule(y - 34, 2);
    rule(y + 30, 2);
  }
  if (title) {
    ctx.save();
    ctx.translate(W / 2, H * 0.52);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.round(W * 0.56)}px Georgia, 'Times New Roman', serif`;
    ctx.fillStyle = 'rgba(0,0,0,.45)';
    ctx.fillText(title, 2, 4);
    ctx.fillStyle = foil;
    ctx.fillText(title, 0, 0);
    ctx.restore();
    // Small foil ornament above the title.
    ctx.save();
    ctx.translate(W / 2, H * 0.2);
    ctx.rotate(Math.PI / 4);
    ctx.lineWidth = 3;
    ctx.strokeRect(-W * 0.11, -W * 0.11, W * 0.22, W * 0.22);
    ctx.restore();
  } else {
    ctx.lineWidth = 3;
    ctx.strokeRect(W * 0.22, H * 0.34, W * 0.56, H * 0.3);
    ctx.save();
    ctx.translate(W / 2, H * 0.49);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-W * 0.09, -W * 0.09, W * 0.18, W * 0.18);
    ctx.restore();
    rule(H * 0.24, 3);
    rule(H * 0.74, 3);
  }
  return toTexture(c, anisotropy);
}

/** Stacked page edges. */
export function pagesTexture() {
  const [c, ctx] = canvas(64, 256);
  ctx.fillStyle = '#efe4cb';
  ctx.fillRect(0, 0, 64, 256);
  for (let x = 0; x < 64; x += 2) {
    ctx.fillStyle = `rgba(120,96,62,${0.1 + ((x * 37) % 11) / 60})`;
    ctx.fillRect(x, 0, 1, 256);
  }
  return toTexture(c);
}

/** Soft radial falloff, used for bulb halos, flame bloom and blob shadows. */
export function glowTexture(inner = 'rgba(255,236,190,1)', mid = 'rgba(255,190,100,.45)') {
  const [c, ctx] = canvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(0.3, mid);
  g.addColorStop(1, 'rgba(255,170,70,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return toTexture(c);
}

/** Mug lettering on a transparent wrap. */
export function mugTexture(anisotropy: number) {
  const [c, ctx] = canvas(768, 512);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#2b1a0f';
  ctx.font = "700 104px Georgia, 'Times New Roman', serif";
  const lines = ['MAKE ·', 'LEARN ·', 'REPEAT'];
  lines.forEach((line, i) => {
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '8px';
    ctx.fillText(line, 384, 104 + i * 150);
  });
  return toTexture(c, anisotropy);
}

// Seven-segment digits for the desk clock.
const SEGMENTS: Record<string, string> = {
  '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg',
  '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg', '-': 'g',
};
function digit(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ch: string) {
  const t = w * 0.19;
  const m = t * 0.32;
  const horiz = (cx: number, cy: number) => {
    ctx.beginPath();
    ctx.moveTo(cx - w / 2 + t * 0.7 + m, cy);
    ctx.lineTo(cx - w / 2 + t * 1.25 + m, cy - t / 2);
    ctx.lineTo(cx + w / 2 - t * 1.25 - m, cy - t / 2);
    ctx.lineTo(cx + w / 2 - t * 0.7 - m, cy);
    ctx.lineTo(cx + w / 2 - t * 1.25 - m, cy + t / 2);
    ctx.lineTo(cx - w / 2 + t * 1.25 + m, cy + t / 2);
    ctx.closePath();
    ctx.fill();
  };
  const vert = (cx: number, top: number, bottom: number) => {
    ctx.beginPath();
    ctx.moveTo(cx, top + t * 0.2 + m);
    ctx.lineTo(cx + t / 2, top + t * 0.75 + m);
    ctx.lineTo(cx + t / 2, bottom - t * 0.75 - m);
    ctx.lineTo(cx, bottom - t * 0.2 - m);
    ctx.lineTo(cx - t / 2, bottom - t * 0.75 - m);
    ctx.lineTo(cx - t / 2, top + t * 0.75 + m);
    ctx.closePath();
    ctx.fill();
  };
  const cx = x + w / 2;
  const mid = y + h / 2;
  const draw: Record<string, () => void> = {
    a: () => horiz(cx, y + t / 2),
    g: () => horiz(cx, mid),
    d: () => horiz(cx, y + h - t / 2),
    f: () => vert(x + t / 2, y, mid),
    b: () => vert(x + w - t / 2, y, mid),
    e: () => vert(x + t / 2, mid, y + h),
    c: () => vert(x + w - t / 2, mid, y + h),
  };
  const lit = SEGMENTS[ch] ?? '';
  for (const key of 'abcdefg') {
    const on = lit.includes(key);
    ctx.fillStyle = on ? '#ffb24d' : '#2a1407';
    ctx.shadowColor = on ? '#ff8a1f' : 'transparent';
    ctx.shadowBlur = on ? 26 : 0;
    draw[key]();
  }
}

/** Redraws the LED face in place; returns nothing so the caller flags the texture. */
export function drawClockFace(c: HTMLCanvasElement, time: string, period: string) {
  const ctx = c.getContext('2d')!;
  const W = c.width;
  const H = c.height;
  ctx.shadowBlur = 0;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#120a05');
  g.addColorStop(1, '#070302');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const [hh = '--', mm = '--'] = time.split(':');
  const chars = [...hh.padStart(2, ' '), ':', ...mm.padStart(2, '0')];
  const dw = H * 0.4;
  const dh = H * 0.66;
  const gap = dw * 0.24;
  const hasPeriod = period.length > 0;
  const total = 4 * dw + 3 * gap + dw * 0.5 + (hasPeriod ? dw * 1.0 : 0);
  let x = (W - total) / 2;
  const y = (H - dh) / 2;
  for (const ch of chars) {
    if (ch === ':') {
      ctx.fillStyle = '#ffb24d';
      ctx.shadowColor = '#ff8a1f';
      ctx.shadowBlur = 26;
      for (const cy of [y + dh * 0.32, y + dh * 0.68]) ctx.fillRect(x + dw * 0.1, cy - dw * 0.09, dw * 0.18, dw * 0.18);
      x += dw * 0.5;
    } else {
      if (ch !== ' ') digit(ctx, x, y, dw, dh, ch);
      x += dw + gap;
    }
  }
  if (hasPeriod) {
    ctx.shadowColor = '#ff8a1f';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffb24d';
    ctx.font = `700 ${Math.round(H * 0.2)}px 'Courier New', ui-monospace, monospace`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillText(period.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2), x - gap * 0.2, y + dh);
  }
  ctx.shadowBlur = 0;
  // Glass reflection.
  const sheen = ctx.createLinearGradient(0, 0, W, H);
  sheen.addColorStop(0, 'rgba(255,255,255,.1)');
  sheen.addColorStop(0.35, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);
}

function paper(ctx: CanvasRenderingContext2D, W: number, H: number, gutter: 'left' | 'right') {
  const g = ctx.createLinearGradient(0, 0, W, 0);
  const a = gutter === 'right' ? [1, 0.9, 0] : [0, 0.1, 1];
  g.addColorStop(a[0], '#c9b48e');
  g.addColorStop(a[1], '#f4ead4');
  g.addColorStop(a[2], '#fbf4e2');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  speckle(ctx, W, H, 2600, 0.07, 5);
  ctx.strokeStyle = 'rgba(92,120,150,.2)';
  ctx.lineWidth = 1.2;
  for (let y = 96; y < H - 40; y += 44) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(W - 30, y);
    ctx.stroke();
  }
}

/** Left page: a pencil rocket sketch. Decorative only. */
export function sketchPage(anisotropy: number) {
  const W = 512;
  const H = 704;
  const [c, ctx] = canvas(W, H);
  paper(ctx, W, H, 'right');
  ctx.strokeStyle = 'rgba(46,34,24,.88)';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 4;
  ctx.save();
  ctx.translate(250, 330);
  ctx.rotate(0.62);
  const p = new Path2D('M0-170C46-110 58-30 44 70H-44C-58-30-46-110 0-170Z M-44 20C-84 44-92 88-88 124L-44 84 M44 20C84 44 92 88 88 124L44 84 M-26 70 0 150 26 70 M-12 96 0 132 12 96');
  ctx.stroke(p);
  ctx.beginPath();
  ctx.arc(0, -52, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-40, -96);
  ctx.quadraticCurveTo(0, -84, 40, -96);
  ctx.stroke();
  ctx.restore();
  // Motion lines, a few stars and a dimension arrow, as an inventor might jot.
  ctx.lineWidth = 2.6;
  for (const [x, y, l] of [[70, 520, 70], [110, 570, 90], [60, 610, 50]] as const) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + l * 0.72, y - l * 0.62);
    ctx.stroke();
  }
  for (const [x, y, r] of [[396, 150, 12], [120, 170, 9], [420, 470, 8]] as const) {
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.lineTo(x + r, y);
    ctx.moveTo(x, y - r);
    ctx.lineTo(x, y + r);
    ctx.stroke();
  }
  return toTexture(c, anisotropy);
}

/** Right page: three handwritten words. Decorative only. */
export function wordsPage(anisotropy: number) {
  const W = 512;
  const H = 704;
  const [c, ctx] = canvas(W, H);
  paper(ctx, W, H, 'left');
  ctx.fillStyle = 'rgba(40,28,20,.9)';
  ctx.textAlign = 'center';
  ctx.font = "700 92px 'Segoe Script', 'Segoe Print', 'Bradley Hand', 'Brush Script MT', cursive";
  ['Dream', 'Build', 'Innovate'].forEach((word, i) => {
    ctx.save();
    ctx.translate(262, 220 + i * 132);
    ctx.rotate(-0.045);
    ctx.fillText(word, 0, 0, 420);
    ctx.restore();
  });
  ctx.strokeStyle = 'rgba(40,28,20,.8)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(110, 540);
  ctx.bezierCurveTo(200, 520, 300, 556, 410, 526);
  ctx.stroke();
  return toTexture(c, anisotropy);
}
