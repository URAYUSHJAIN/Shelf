// Desk laptop: hinge phases, the on-screen search and a working keyboard.
// The controller owns URL state; this module only opens or closes the object
// when told to and reports user intent (navigate/close) back to it.
import { gsap } from 'gsap';

type Options = {
  navigate: (href: string, trigger?: HTMLElement | null) => void;
  close: () => void;
  reduced: () => boolean;
  overlay: () => boolean;
};

const LID_CLOSE_MS = 720; // matches the closing transition in laptop.css
const LIFT_MS = 380;
const MAX_RESULTS = 6;
const MODS = ['shift', 'ctrl', 'alt', 'meta', 'fn'] as const;
type Mod = (typeof MODS)[number];

export function initLaptop(root: HTMLElement, opts: Options) {
  const $ = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const $$ = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel));
  const trigger = $<HTMLAnchorElement>('.laptop__trigger');
  const frame = $('.lt-frame');
  const ui = $('[data-laptop-ui]');
  const keyboard = $('[data-keys]');
  const keys = $$('.key');
  const input = $<HTMLInputElement>('[data-laptop-input]');
  const list = $('[data-laptop-results]');
  const options = $$('[role="option"]');
  const empty = $('[data-laptop-empty]');
  const field = $('.lt-field');
  const hud = $('[data-laptop-hud]');
  const status = $('[data-laptop-status]');
  const trackpad = $('[data-trackpad]');
  const portfolioFrame = root.querySelector<HTMLIFrameElement>('.lt-portfolio-frame');
  const portfolioScreen = $('.lt-portfolio-screen');
  const portfolioViewport = $('.lt-portfolio-canvas');

  let open = root.dataset.lid === 'open';
  let version = 0;
  let lift: gsap.core.Tween | null = null;
  let shown: HTMLElement[] = [];
  let selected = -1;
  let caps = false;
  const mods = new Set<Mod>();
  let brightness = 1;
  let backlight = 0.2;

  // Measure layout pixels before the lid's 3D transform. CSS lengths cannot
  // be passed to scale(); use a unitless ratio and fill BOTH screen dimensions.
  function sizePortfolio(width: number, height: number) {
    if (!portfolioFrame || width <= 0 || height <= 0) return;
    const viewportWidth = Math.max(1024, width);
    const scale = width / viewportWidth;
    portfolioFrame.style.setProperty('--portfolio-width', `${viewportWidth}px`);
    portfolioFrame.style.setProperty('--portfolio-height', `${height / scale}px`);
    portfolioFrame.style.setProperty('--portfolio-scale', String(scale));
  }
  const screenObserver = new ResizeObserver(([entry]) => {
    sizePortfolio(entry.contentRect.width, entry.contentRect.height);
  });
  screenObserver.observe(portfolioViewport);

  function loadPortfolio() {
    if (portfolioFrame && !portfolioFrame.hasAttribute('src')) {
      portfolioFrame.src = portfolioFrame.dataset.src!;
    }
  }
  function showScreen(mode: 'portfolio' | 'search', focus = true) {
    root.dataset.screen = mode;
    ui.inert = !open || mode !== 'search';
    portfolioScreen.inert = !open || mode !== 'portfolio';
    if (open && focus) {
      if (mode === 'portfolio') portfolioFrame?.focus({ preventScroll: true });
      else input.focus({ preventScroll: true });
    }
  }
  $('[data-screen-search]').addEventListener('click', () => showScreen('search'));
  $('[data-screen-portfolio]').addEventListener('click', () => showScreen('portfolio'));
  showScreen('portfolio', false);
  if (open) loadPortfolio();

  /* ---------- Hinge ---------- */

  const wait = (ms: number) => new Promise((r) => window.setTimeout(r, opts.reduced() ? 0 : ms));

  function flip(from: DOMRect) {
    lift?.kill();
    gsap.set(frame, { clearProps: 'transform,transformOrigin' });
    const to = frame.getBoundingClientRect();
    // No lift from or to a hidden laptop (narrow screens hide it while closed).
    if (opts.reduced() || !to.width || !from.width) return Promise.resolve();
    return new Promise<void>((resolve) => {
      lift = gsap.fromTo(
        frame,
        { x: from.left - to.left, y: from.top - to.top, scale: from.width / to.width, transformOrigin: '0 0' },
        { x: 0, y: 0, scale: 1, duration: LIFT_MS / 1000, ease: 'power3.out', clearProps: 'transform,transformOrigin', onComplete: resolve, onInterrupt: resolve },
      );
    });
  }

  // The overlay drops the desk's size container (fixed positioning would be
  // trapped by it); pin the desk's scale so the objects behind stay put.
  const desk = root.closest<HTMLElement>('.g-desk');
  function fit() {
    if (!desk) return;
    if (root.classList.contains('is-open') && opts.overlay()) desk.style.setProperty('--u', `${desk.clientWidth / 760}px`);
    else desk.style.removeProperty('--u');
  }

  /* ---------- Cursor proximity ---------- */

  // Near the closed laptop the lid lifts a little and the body turns toward
  // the pointer. Mouse on the desk scene only; never with reduced motion.
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const lean = { peek: 0, yaw: 0 };
  const applyLean = () => {
    root.style.setProperty('--peek', `${lean.peek}deg`);
    root.style.setProperty('--yaw', `${lean.yaw}deg`);
    root.classList.toggle('is-near', lean.peek > 0.02 || Math.abs(lean.yaw) > 0.02);
  };
  const toPeek = gsap.quickTo(lean, 'peek', { duration: 0.6, ease: 'power3.out', onUpdate: applyLean });
  const toYaw = gsap.quickTo(lean, 'yaw', { duration: 0.6, ease: 'power3.out', onUpdate: applyLean });
  // Hand the lid back to its CSS hinge transition before it opens.
  function rest() {
    gsap.killTweensOf(lean);
    lean.peek = lean.yaw = 0;
    applyLean();
  }
  window.addEventListener('pointermove', (e) => {
    if (open || root.classList.contains('is-open') || e.pointerType !== 'mouse' || !finePointer.matches || opts.reduced() || opts.overlay()) return;
    const r = root.getBoundingClientRect();
    if (!r.width) return;
    const zone = r.width * 0.6;
    const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
    const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
    const p = Math.max(0, 1 - Math.hypot(dx, dy) / zone);
    const side = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2 + zone)));
    toPeek(p * p * 6);
    toYaw(side * p * 5);
  }, { passive: true });

  async function sync(next: boolean, instant = false) {
    if (next === open) return;
    open = next;
    const v = ++version;
    showScreen('portfolio', false);
    keyboard.inert = !next;
    if (next) {
      rest();
      loadPortfolio();
      const from = frame.getBoundingClientRect();
      if (desk && opts.overlay()) desk.style.setProperty('--u', `${desk.clientWidth / 760}px`);
      root.classList.add('is-open');
      if (opts.overlay() && !instant) {
        // Lift first so the hinge turns with the base at rest.
        await flip(from);
        if (v !== version) return;
      }
      root.dataset.lid = 'open';
      return;
    }
    clearQuery();
    releaseMods();
    root.dataset.lid = 'closed';
    if (!instant) await wait(LID_CLOSE_MS);
    if (v !== version) return;
    const overlay = opts.overlay() && root.classList.contains('is-open');
    const from = frame.getBoundingClientRect();
    root.classList.remove('is-open');
    fit();
    if (overlay && !instant) await flip(from);
    if (v !== version) return;
    const active = document.activeElement;
    if (!active || active === document.body || root.contains(active)) trigger.focus({ preventScroll: !opts.overlay() });
  }

  /* ---------- Search ---------- */

  function filter() {
    const q = input.value.trim().toLowerCase();
    field.classList.toggle('is-typing', input.value.length > 0);
    shown = [];
    if (q) {
      const scored = options
        .map((o) => {
          const t = o.dataset.title ?? '';
          const score = t.startsWith(q) ? 3 : t.includes(q) ? 2 : (o.dataset.search ?? '').includes(q) ? 1 : 0;
          return { o, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score);
      shown = scored.slice(0, MAX_RESULTS).map((x) => x.o);
    }
    for (const o of options) o.hidden = !shown.includes(o);
    list.hidden = shown.length === 0;
    empty.hidden = !q || shown.length > 0;
    input.setAttribute('aria-expanded', String(shown.length > 0));
    select(shown.length ? 0 : -1);
    status.textContent = q ? (shown.length ? `${shown.length} ${shown.length === 1 ? 'match' : 'matches'}` : 'No matches') : '';
  }

  function select(i: number) {
    selected = shown.length ? (i + shown.length) % shown.length : -1;
    shown.forEach((o, k) => o.setAttribute('aria-selected', String(k === selected)));
    const cur = shown[selected];
    if (cur) input.setAttribute('aria-activedescendant', cur.id);
    else input.removeAttribute('aria-activedescendant');
  }

  function activate(o = shown[selected]) {
    if (!o) return;
    opts.navigate(o.dataset.href!, trigger);
  }

  function clearQuery() {
    input.value = '';
    filter();
  }

  input.addEventListener('input', filter);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      select(selected + (e.key === 'ArrowDown' ? 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      activate();
    } else if (e.key === 'Escape' && input.value) {
      e.preventDefault(); // first Escape clears; the next one closes the laptop
      clearQuery();
    }
  });
  $('[data-laptop-search]').addEventListener('submit', (e) => {
    e.preventDefault();
    activate();
  });
  for (const o of options) {
    o.addEventListener('click', () => activate(o));
    o.addEventListener('pointermove', () => select(shown.indexOf(o)));
  }

  /* ---------- Editing (works whether or not the field has focus) ---------- */

  function edit(fn: (v: string, s: number, e: number) => [string, number, number?]) {
    const v = input.value;
    const s = input.selectionStart ?? v.length;
    const e = input.selectionEnd ?? s;
    const [nv, ns, ne = ns] = fn(v, s, e);
    const changed = nv !== v;
    input.value = nv;
    input.setSelectionRange(ns, ne);
    if (changed) filter();
  }
  const wordStart = (v: string, s: number) => v.slice(0, s).replace(/\S+\s*$|\s+$/, '').length;
  const wordEnd = (v: string, s: number) => s + (v.slice(s).match(/^\s*\S+/)?.[0].length ?? v.length - s);

  function insert(text: string) {
    edit((v, s, e) => [v.slice(0, s) + text + v.slice(e), s + text.length]);
  }
  function backspace() {
    edit((v, s, e) => {
      if (s !== e) return [v.slice(0, s) + v.slice(e), s];
      if (mods.has('fn')) return [v.slice(0, s) + v.slice(s + 1), s];
      const from = mods.has('meta') || mods.has('ctrl') ? 0 : mods.has('alt') ? wordStart(v, s) : Math.max(0, s - 1);
      return [v.slice(0, from) + v.slice(s), from];
    });
  }
  function caret(dir: -1 | 1) {
    edit((v, s, e) => {
      const at = dir < 0 ? s : e;
      let to: number;
      if (mods.has('meta') || mods.has('ctrl') || mods.has('fn')) to = dir < 0 ? 0 : v.length;
      else if (mods.has('alt')) to = dir < 0 ? wordStart(v, at) : wordEnd(v, at);
      else to = s !== e ? at : Math.min(v.length, Math.max(0, at + dir));
      return mods.has('shift') ? (dir < 0 ? [v, to, e] : [v, s, to]) : [v, to];
    });
  }

  /* ---------- Function keys ---------- */

  let hudTimer = 0;
  function notify(text: string) {
    hud.textContent = text;
    hud.classList.add('is-shown');
    status.textContent = text;
    window.clearTimeout(hudTimer);
    hudTimer = window.setTimeout(() => hud.classList.remove('is-shown'), 1100);
  }
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  function setBrightness(n: number) {
    brightness = Math.min(1, Math.max(0.25, Math.round(n * 100) / 100));
    root.style.setProperty('--sb', String(brightness));
    notify(`Screen brightness ${pct(brightness)}`);
  }
  function setBacklight(n: number) {
    backlight = Math.min(1, Math.max(0, Math.round(n * 100) / 100));
    root.style.setProperty('--bl', String(backlight));
    notify(backlight ? `Keyboard backlight ${pct(backlight)}` : 'Keyboard backlight off');
  }

  function setLatched(mod: Mod, on: boolean) {
    on ? mods.add(mod) : mods.delete(mod);
    for (const k of keys) if (k.dataset.act === mod) k.setAttribute('aria-pressed', String(on));
  }
  function releaseMods() {
    for (const m of MODS) if (mods.has(m)) setLatched(m, false);
  }

  /** Press one virtual key (pointer, or Enter/Space on the focused key). */
  function press(k: HTMLElement) {
    const act = k.dataset.act;
    if (act && (MODS as readonly string[]).includes(act)) {
      setLatched(act as Mod, !mods.has(act as Mod));
      return;
    }
    // Remote-page input belongs to its own browsing context. The virtual keys
    // continue to operate Shelf search, never an invisible field behind the site.
    if (k.dataset.ch || ['space', 'backspace', 'enter', 'tab', 'up', 'down', 'left', 'right', 'search'].includes(act ?? '')) {
      showScreen('search', false);
    }
    if (k.dataset.ch) {
      if ((mods.has('meta') || mods.has('ctrl')) && k.dataset.ch === 'a') {
        input.setSelectionRange(0, input.value.length);
        input.focus({ preventScroll: true });
      } else {
        const letter = /[a-z]/.test(k.dataset.ch);
        const upper = letter ? caps !== mods.has('shift') : mods.has('shift');
        insert(upper ? k.dataset.sh! : k.dataset.ch);
      }
    } else {
      switch (act) {
        case 'space': insert(' '); break;
        case 'backspace': backspace(); break;
        case 'enter': activate(); break;
        case 'tab': select(selected + (mods.has('shift') ? -1 : 1)); break;
        case 'up': select(selected - 1); break;
        case 'down': select(selected + 1); break;
        case 'left': caret(-1); break;
        case 'right': caret(1); break;
        case 'caps':
          caps = !caps;
          k.setAttribute('aria-pressed', String(caps));
          notify(caps ? 'Caps lock on' : 'Caps lock off');
          break;
        case 'esc':
          if (input.value) clearQuery();
          else opts.close();
          break;
        case 'bright-down': setBrightness(brightness - 0.15); break;
        case 'bright-up': setBrightness(brightness + 0.15); break;
        case 'backlight-down': setBacklight(backlight - 0.2); break;
        case 'backlight-up': setBacklight(backlight + 0.2); break;
        case 'search': input.focus({ preventScroll: true }); input.select(); break;
        case 'home': clearQuery(); showScreen('portfolio'); break;
        case 'power': opts.close(); break;
      }
    }
    releaseMods();
  }

  function flash(k: HTMLElement) {
    k.classList.add('is-down');
    window.setTimeout(() => k.classList.remove('is-down'), 110);
  }

  /* ---------- Keyboard: real controls, one tab stop (roving focus) ---------- */

  keyboard.removeAttribute('aria-hidden');
  keyboard.setAttribute('role', 'group');
  keyboard.setAttribute('aria-label', 'Laptop keyboard. Letter keys open Shelf search; Home returns to the live portfolio. Type directly in the portfolio using your own keyboard.');
  keyboard.inert = !open;
  let roving = keys.find((k) => k.dataset.ch === 'a') ?? keys[0];
  for (const k of keys) {
    k.setAttribute('role', 'button');
    k.setAttribute('aria-label', k.dataset.label ?? '');
    k.tabIndex = k === roving ? 0 : -1;
    if (k.dataset.act && ['caps', ...MODS].includes(k.dataset.act)) k.setAttribute('aria-pressed', 'false');
    // Pointer presses keep focus where it is (usually the field), like a real keyboard.
    k.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      k.classList.add('is-down');
      k.setPointerCapture(e.pointerId);
    });
    const up = () => k.classList.remove('is-down');
    k.addEventListener('pointerup', up);
    k.addEventListener('pointercancel', up);
    k.addEventListener('lostpointercapture', up);
    k.addEventListener('click', () => press(k));
    k.addEventListener('focus', () => {
      roving.tabIndex = -1;
      roving = k;
      k.tabIndex = 0;
    });
  }
  // Arrow keys move between keys on the focused keyboard; Enter/Space press.
  const rows: HTMLElement[][] = [];
  for (const k of keys) (rows[Number(k.dataset.row)] ??= []).push(k);
  const centre = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return r.left + r.width / 2;
  };
  keyboard.addEventListener('keydown', (e) => {
    const k = (e.target as HTMLElement).closest<HTMLElement>('.key');
    if (!k) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flash(k);
      press(k);
      return;
    }
    const dirs: Record<string, [number, number]> = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
    const d = dirs[e.key];
    if (!d) return;
    e.preventDefault();
    e.stopPropagation();
    const r = Number(k.dataset.row);
    const c = rows[r].indexOf(k);
    if (d[1]) rows[r][Math.min(rows[r].length - 1, Math.max(0, c + d[1]))].focus();
    else {
      const x = centre(k);
      const near = rows[Math.min(rows.length - 1, Math.max(0, r + d[0]))];
      near.reduce((a, b) => (Math.abs(centre(b) - x) < Math.abs(centre(a) - x) ? b : a)).focus();
    }
  });

  /* ---------- Physical keyboard while the laptop is open ---------- */

  const physical = (code: string) => keys.find((k) => k.dataset.code?.split(' ').includes(code));
  const editable = (el: Element | null) =>
    !!el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || (el as HTMLElement).isContentEditable);

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (root.dataset.screen === 'portfolio') return;
    const target = e.target as HTMLElement;
    // Typing in any other field never drives the laptop.
    if (editable(target) && target !== input) return;
    const k = physical(e.code);
    if (k) k.classList.add('is-down');
    if (target === input || target.closest('.key') || e.defaultPrevented) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const control = target.closest('a, button, [role="button"], [role="option"]');
    if (e.key.length === 1 && !(e.key === ' ' && control)) {
      e.preventDefault();
      input.focus({ preventScroll: true });
      insert(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      input.focus({ preventScroll: true });
      backspace();
    } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && shown.length) {
      e.preventDefault();
      select(selected + (e.key === 'ArrowDown' ? 1 : -1));
    } else if (e.key === 'Enter' && !control && shown.length) {
      e.preventDefault();
      activate();
    }
  });
  document.addEventListener('keyup', (e) => physical(e.code)?.classList.remove('is-down'));
  window.addEventListener('blur', () => keys.forEach((k) => k.classList.remove('is-down')));

  /* ---------- Trackpad: drag to move through matches, click to open ---------- */

  let dragY: number | null = null;
  let moved = 0;
  trackpad.addEventListener('pointerdown', (e) => {
    if (!open || e.button !== 0) return;
    if (root.dataset.screen === 'portfolio') {
      // Cross-origin security prevents driving the remote document from here.
      // Focus it; native wheel/touch/keyboard scrolling works inside its screen.
      e.preventDefault();
      portfolioFrame?.focus({ preventScroll: true });
      return;
    }
    e.preventDefault();
    dragY = e.clientY;
    moved = 0;
    trackpad.classList.add('is-down');
    trackpad.setPointerCapture(e.pointerId);
  });
  trackpad.addEventListener('pointermove', (e) => {
    if (dragY === null) return;
    const dy = e.clientY - dragY;
    if (Math.abs(dy) >= 14) {
      select(selected + Math.sign(dy));
      moved += Math.abs(dy);
      dragY = e.clientY;
    }
  });
  const endDrag = () => {
    if (dragY === null) return;
    dragY = null;
    trackpad.classList.remove('is-down');
    if (moved < 6) activate();
  };
  trackpad.addEventListener('pointerup', endDrag);
  trackpad.addEventListener('pointercancel', () => {
    dragY = null;
    trackpad.classList.remove('is-down');
  });

  // Overlay backdrop: a click outside the laptop closes it.
  root.addEventListener('click', (e) => {
    if (open && e.target === root) opts.close();
  });

  filter();
  return { sync, fit, trigger, title: () => $('#laptop-title') };
}
