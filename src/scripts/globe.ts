// Desk globe: orthographic projection of the Natural Earth texture onto a
// small 2D canvas. Drag, click or arrow keys spin it; hover turns it gently.
// The frame loop runs only while it is moving, so an idle globe costs nothing.

const OCEAN = [244, 228, 201];
const LAND = [186, 128, 78];
const LINE = 0.86;

export async function initGlobe(el: HTMLElement, reduced: boolean) {
  const canvas = el.querySelector('canvas')!;
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) return;

  const img = new Image();
  img.src = '/textures/world.webp';
  try {
    await img.decode();
  } catch {
    return; // CSS fallback texture stays visible
  }
  const TW = 512;
  const TH = 256;
  const tc = document.createElement('canvas');
  tc.width = TW;
  tc.height = TH;
  const tctx = tc.getContext('2d')!;
  tctx.drawImage(img, 0, 0, TW, TH);
  const tex = tctx.getImageData(0, 0, TW, TH).data;
  const land = new Uint8Array(TW * TH);
  for (let i = 0; i < TW * TH; i++) {
    const l = 0.3 * tex[i * 4] + 0.59 * tex[i * 4 + 1] + 0.11 * tex[i * 4 + 2];
    land[i] = l < 200 ? 1 : 0;
  }

  let size = 0;
  let px: Float32Array; // per pixel: base longitude (rad), row index, shade, inside flag
  let out: ImageData;
  const setup = () => {
    const css = canvas.getBoundingClientRect().width || 140;
    const s = Math.max(64, Math.min(320, Math.round(css * Math.min(2, window.devicePixelRatio || 1))));
    if (s === size) return;
    size = s;
    canvas.width = canvas.height = s;
    out = ctx.createImageData(s, s);
    px = new Float32Array(s * s * 4);
    const r = s / 2;
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const nx = (x + 0.5 - r) / r;
        const ny = (y + 0.5 - r) / r;
        const d = nx * nx + ny * ny;
        const k = (y * s + x) * 4;
        if (d > 1) {
          px[k + 3] = 0;
          continue;
        }
        const nz = Math.sqrt(1 - d);
        const lat = Math.asin(-ny);
        px[k] = Math.atan2(nx, nz);
        px[k + 1] = lat;
        px[k + 2] = 0.78 + 0.22 * nz;
        px[k + 3] = d > 0.985 ? 0.5 : 1;
      }
    }
  };

  let angle = 1.4; // start with Africa/Asia facing the viewer
  let vel = 0;
  let hovering = false;
  let dragging = false;
  let raf = 0;
  let last = 0;

  const draw = () => {
    const s = size;
    const data = out.data;
    const deg = 180 / Math.PI;
    for (let i = 0, n = s * s; i < n; i++) {
      const k = i * 4;
      const a = px[k + 3];
      if (!a) {
        data[k + 3] = 0;
        continue;
      }
      let lon = px[k] + angle;
      lon = ((lon + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
      const lat = px[k + 1];
      const col = Math.min(TW - 1, Math.floor(((lon + Math.PI) / (2 * Math.PI)) * TW));
      const row = Math.min(TH - 1, Math.floor((0.5 - lat / Math.PI) * TH));
      const c = land[row * TW + col] ? LAND : OCEAN;
      let sh = px[k + 2];
      const lonD = Math.abs((lon * deg) % 30);
      const latD = Math.abs((lat * deg) % 30);
      if (lonD < 0.7 || lonD > 29.3 || latD < 0.6 || latD > 29.4) sh *= LINE;
      data[k] = c[0] * sh;
      data[k + 1] = c[1] * sh;
      data[k + 2] = c[2] * sh;
      data[k + 3] = 255 * a;
    }
    ctx.putImageData(out, 0, 0);
  };

  const tick = (t: number) => {
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    if (!dragging) {
      if (hovering && !reduced) vel += (0.5 - vel) * Math.min(1, dt * 2.5);
      else vel *= Math.pow(reduced ? 0 : 0.42, dt);
      angle += vel * dt;
    }
    draw();
    if (dragging || Math.abs(vel) > 0.01 || (hovering && !reduced)) raf = requestAnimationFrame(tick);
    else raf = 0;
  };
  const wake = () => {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  setup();
  draw();
  canvas.style.background = 'transparent';
  window.addEventListener('resize', () => {
    setup();
    draw();
  });

  // Accessible control: arrow keys rotate, Home resets, Enter/Space spins.
  el.setAttribute('role', 'button');
  el.tabIndex = 0;
  el.setAttribute('aria-label', 'Desk globe: spin it');
  el.setAttribute('aria-describedby', 'globe-hint');
  el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      vel = 0;
      angle += e.key === 'ArrowLeft' ? 0.35 : -0.35;
      draw();
    } else if (e.key === 'Home') {
      e.preventDefault();
      vel = 0;
      angle = 1.4;
      draw();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      spin();
    }
  });

  const spin = () => {
    if (reduced) {
      angle += 0.6;
      draw();
      return;
    }
    vel = 3.2;
    wake();
  };

  let startX = 0;
  let startAngle = 0;
  let lastX = 0;
  let lastT = 0;
  let moved = false;
  el.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') {
      hovering = true;
      wake();
    }
  });
  el.addEventListener('pointerleave', () => {
    hovering = false;
  });
  el.addEventListener('pointerdown', (e) => {
    dragging = true;
    moved = false;
    startX = lastX = e.clientX;
    lastT = performance.now();
    startAngle = angle;
    el.setPointerCapture(e.pointerId);
    el.classList.add('is-dragging');
    wake();
  });
  el.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const w = canvas.getBoundingClientRect().width || 140;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 3) moved = true;
    angle = startAngle - (dx / w) * Math.PI;
    const now = performance.now();
    const dtm = Math.max(1, now - lastT);
    vel = (-(e.clientX - lastX) / w) * Math.PI * (1000 / dtm);
    lastX = e.clientX;
    lastT = now;
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('is-dragging');
    if (!moved) spin();
    else if (reduced) vel = 0;
    vel = Math.max(-8, Math.min(8, vel));
    wake();
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);

  // One gentle turn on arrival that settles within a few seconds.
  if (!reduced) {
    vel = 1.1;
    wake();
  }
}
