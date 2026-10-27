// The Shelf controller: one owner for surface state, history and focus.
// State is always derived from the URL; every control is a real link or is
// enhanced from a non-interactive element, so nothing is dead without JS.
import { gsap } from 'gsap';
import { initGlobe } from './globe';
import { initLaptop } from './laptop';
import { initSteam } from './steam';

type State = { surface: string | null; record: string | null; params: URLSearchParams; hash: string };

const SURFACES = new Set(['about', 'projects', 'patents', 'experience', 'education', 'achievements', 'toolbox', 'certifications', 'writing', 'laptop', 'contact']);
const desktopMQ = window.matchMedia('(min-width: 1000px) and (min-height: 560px)');
const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

const stage = $('[data-scene]')!;
const baseTitle = 'The Shelf — Ayush Jain';
let lastTrigger: HTMLElement | null = null;
const laptopEl = $('[data-laptop]');
let laptop: ReturnType<typeof initLaptop> | null = null;
const surfaceEl = (surface: string) => (surface === 'laptop' ? laptopEl : $(`[data-surface="${surface}"]`));
let current: State = parse(location.href);

function parse(href: string): State {
  const url = new URL(href, location.href);
  const parts = url.pathname.split('/').filter(Boolean);
  let surface: string | null = parts[0] && SURFACES.has(parts[0]) ? parts[0] : null;
  let record: string | null = null;
  if (surface === 'projects' && parts[1]) {
    record = $(`[data-record-view="${CSS.escape(parts[1])}"]`) ? parts[1] : null;
  }
  if (!surface) record = null;
  return { surface, record, params: url.searchParams, hash: url.hash };
}

/* ---------------- Rendering ---------------- */

// The original front is temporarily housed with its tray. Its empty slot stays
// in the cabinet, preserving layout and exposing the recessed cavity.
let mounted: HTMLElement | null = null;
let renderVersion = 0;
// One paused timeline per mounted drawer runs closed (0) → open (1). Opening
// and closing both tween its progress with the same ease, so a push is the
// exact mirror of a pull and a mid-motion press reverses from where it is.
const PULL_S = 0.5;
let motion: gsap.core.Timeline | null = null;
let pull: gsap.core.Tween | null = null;
let closedPose: gsap.TweenVars = {};
let openPose: gsap.TweenVars = {};
let closedClipTop = 0;
const openClipTop = -24;

function placeDrawer(panel: HTMLElement) {
  const slot = $(`[data-drawer-slot="${panel.dataset.surface}"]`)!;
  const front = $('.drawer', panel) ?? $('.drawer', slot)!;
  const rect = slot.getBoundingClientRect();
  const mobile = !desktopMQ.matches;
  const viewport = window.visualViewport;
  const vh = viewport?.height ?? innerHeight;
  const vw = viewport?.width ?? innerWidth;
  const offsetTop = viewport?.offsetTop ?? 0;
  const frontHeight = rect.height;
  const width = mobile ? Math.min(640, vw - 24) : Math.min(590, vw - 48);
  const left = mobile ? (vw - width) / 2 : Math.max(24, Math.min(vw - width - 24, rect.left + rect.width / 2 - width / 2));
  // Desktop keeps the tray's rear at its slot. Narrow screens use a framed
  // wooden tray with an internal scroll area, keeping all controls in reach.
  const top = mobile ? offsetTop + 34 : Math.max(32, Math.min(rect.top + 28, vh - 280));
  const depth = mobile ? Math.max(100, vh - frontHeight - 86) : Math.min(465, vh - top - frontHeight - 38);
  const angle = mobile ? 2 : 7;
  panel.style.cssText = `--u:${getComputedStyle(slot).getPropertyValue('--u')};--tray-angle:${angle}deg;--tray-depth:${depth}px;--front-height:${frontHeight}px;left:${left}px;top:${top}px;width:${width}px;height:${depth + frontHeight + 18}px`;
  openPose = { x: 0, y: 0, scaleX: 1, scaleY: 1, rotationX: angle };
  closedClipTop = rect.top - top - 4;
  $('.drawer-front-mount', panel)!.append(front);
  slot.classList.add('is-vacant');
  panel.classList.add('is-mounted');
  closedPose = fitToSlot(panel, rect);
  front.setAttribute('aria-label', `Close ${$('.drawer__label', front)!.textContent}`);
}

// The centred origin, taller tray front and its perspective Z-lift make the
// closed pose impractical to derive, so measure the mounted front and correct
// until it covers its cabinet slot exactly. Runs synchronously, before paint.
function fitToSlot(panel: HTMLElement, slot: DOMRect) {
  const assembly = $('.drawer-assembly', panel)!;
  const front = $('.drawer-front-mount', panel)!;
  const pose = { x: 0, y: 0, scaleX: 1, scaleY: 1, rotationX: 0 };
  for (let i = 0; i < 3; i++) {
    gsap.set(assembly, pose);
    let f = front.getBoundingClientRect();
    if (!f.width || !f.height) break; // not laid out; keep the last pose
    pose.scaleX *= slot.width / f.width;
    pose.scaleY *= slot.height / f.height;
    gsap.set(assembly, pose);
    f = front.getBoundingClientRect();
    pose.x += slot.left - f.left;
    pose.y += slot.top - f.top;
  }
  return pose;
}

function buildMotion(panel: HTMLElement, progress = 0) {
  motion?.kill();
  // The shell clip is tweened through its top inset only; computed clip-path
  // strings may be shortened by the browser and would not interpolate reliably.
  const clip = { top: closedClipTop };
  const applyClip = () => (panel.style.clipPath = `inset(${clip.top}px -40px -40px -40px)`);
  motion = gsap
    .timeline({ paused: true, defaults: { ease: 'none' } })
    .fromTo($('.drawer-assembly', panel)!, closedPose, { ...openPose, duration: 1 }, 0)
    .fromTo(clip, { top: closedClipTop }, { top: openClipTop, duration: 1, onUpdate: applyClip }, 0)
    // Contents surface as the tray clears the cabinet, and sink first on the push back.
    .fromTo($$('.panel__sheet > *', panel), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35 }, 0.65)
    .progress(progress);
  applyClip();
}

function animateDrawer(panel: HTMLElement, open: boolean, instant = false) {
  const sheet = $('.panel__sheet', panel)!;
  const target = open ? 1 : 0;
  pull?.kill();
  panel.dataset.phase = open ? 'opening' : 'closing';
  // Freeze only the content, so pressing the original front can reverse a pull.
  sheet.inert = true;
  // A partial reversal takes the matching share of the full travel time.
  const duration = instant || reduceMQ.matches ? 0 : PULL_S * Math.abs(target - motion!.progress());
  return new Promise<void>((resolve) => {
    pull = gsap.to(motion!, {
      progress: target,
      duration,
      ease: 'power2.inOut',
      onInterrupt: resolve,
      onComplete: () => {
        pull = null;
        panel.dataset.phase = open ? 'open' : 'closed';
        sheet.inert = !open;
        resolve();
      },
    });
  });
}

// Folders settle in: 2px rise, 30 ms stagger, capped at six (micro-interactions §5).
function settleFolders() {
  if (reduceMQ.matches) return;
  const shown = items.filter((li) => !li.hidden).slice(0, 6);
  gsap.fromTo(shown, { opacity: 0, y: 2 }, { opacity: 1, y: 0, duration: 0.24, stagger: 0.03, ease: 'power2.out', clearProps: 'opacity,transform' });
}

function restoreDrawer(panel: HTMLElement) {
  const slot = $(`[data-drawer-slot="${panel.dataset.surface}"]`)!;
  const front = $('.drawer', panel)!;
  slot.append(front);
  slot.classList.remove('is-vacant');
  front.removeAttribute('aria-label');
  panel.classList.remove('is-mounted');
  panel.removeAttribute('style');
  motion?.kill();
  motion = null;
  gsap.set($('.drawer-assembly', panel)!, { clearProps: 'all' });
  gsap.set($$('.panel__sheet > *', panel), { clearProps: 'opacity,transform' });
  panel.hidden = true;
  mounted = null;
}

async function render(state: State, focus: 'move' | 'none' = 'move', instant = false) {
  const version = ++renderVersion;
  const prev = current;
  current = state;
  laptop?.sync(state.surface === 'laptop', instant);
  laptop?.fit();
  const next = state.surface ? $(`[data-drawer-surface="${state.surface}"]`) : null;
  if (mounted && mounted !== next) {
    const closing = mounted;
    await animateDrawer(closing, false, instant);
    if (version !== renderVersion) return;
    restoreDrawer(closing);
  }
  if (version !== renderVersion) return;
  renderContent(state, 'none', prev);
  if (next) {
    if (mounted !== next) {
      mounted = next;
      placeDrawer(next);
      buildMotion(next);
    } else if (instant) {
      // Resize or history: re-measure and keep the tray where it was.
      placeDrawer(next);
      buildMotion(next, motion?.progress() ?? 0);
    }
    if (next.dataset.phase !== 'open' || instant) await animateDrawer(next, true, instant);
    if (version !== renderVersion) return;
  }
  renderContent(state, focus, prev);
}

function renderContent(state: State, focus: 'move' | 'none', prev: State) {
  const modal = !desktopMQ.matches;

  for (const panel of $$('[data-surface]')) {
    const open = panel.dataset.surface === state.surface;
    const entering = open && panel.hidden && !panel.dataset.drawerSurface;
    panel.hidden = !open;
    if (entering && !reduceMQ.matches) {
      const sheet = $('.panel__sheet', panel);
      gsap.fromTo(sheet, desktopMQ.matches ? { x: 28, opacity: 0 } : { y: 24, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.26, ease: 'power2.out', clearProps: 'transform,opacity' });
    }
    if (open && modal) {
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
    } else {
      panel.setAttribute('role', 'region');
      panel.removeAttribute('aria-modal');
    }
  }

  // Active objects
  for (const el of $$('[data-nav]')) {
    const nav = el.dataset.nav;
    const isDrawer = el.classList.contains('drawer');
    if (nav && nav !== 'home' && !el.closest('[data-panels], .lt-ui') && !el.classList.contains('chip') && !el.closest('.note')) {
      if (nav === state.surface) el.setAttribute('aria-current', isDrawer ? 'page' : 'true');
      else el.removeAttribute('aria-current');
    }
  }
  for (const d of $$('.drawer')) d.setAttribute('aria-expanded', String(d.dataset.nav === state.surface));
  const laptopOpen = state.surface === 'laptop';
  if (laptopEl) {
    if (laptopOpen) {
      laptopEl.setAttribute('role', modal ? 'dialog' : 'region');
      laptopEl.setAttribute('aria-labelledby', 'laptop-title');
      modal ? laptopEl.setAttribute('aria-modal', 'true') : laptopEl.removeAttribute('aria-modal');
    } else {
      for (const a of ['role', 'aria-labelledby', 'aria-modal']) laptopEl.removeAttribute(a);
    }
  }

  // Background is inert while a modal sheet is open (tablet/mobile). The
  // laptop overlay lives inside the stage, so only its surroundings go inert.
  const inertBg = !!state.surface && modal;
  stage.inert = inertBg && !laptopOpen;
  isolate(inertBg && laptopOpen ? laptopEl : null);
  document.body.style.overflow = inertBg ? 'hidden' : '';

  if (state.surface === 'projects') renderProjects(state);
  if (state.surface === 'writing') selectTab(state.params.get('tab') || 'blogs', false);
  if (state.surface === 'patents' && state.hash.startsWith('#patent-')) {
    const d = $<HTMLDetailsElement>(state.hash);
    if (d) {
      d.open = true;
      requestAnimationFrame(() => d.scrollIntoView({ block: 'center', behavior: reduceMQ.matches ? 'auto' : 'smooth' }));
    }
  }
  if (prev.record && prev.record !== state.record) pauseVideos();
  if (prev.surface !== state.surface) pauseVideos();

  const panel = state.surface ? surfaceEl(state.surface) : null;
  const recordTitle = state.record ? $(`#record-${CSS.escape(state.record)}-title`) : null;
  const heading = laptopOpen ? laptop?.title() ?? null : $('.panel__title', panel ?? document);
  document.title = state.surface
    ? `${laptopOpen ? 'Laptop' : recordTitle?.textContent ?? heading?.textContent ?? ''} — The Shelf · Ayush Jain`
    : baseTitle;

  if (focus === 'none') return;
  if (state.surface && panel) {
    const target = recordTitle ?? (prev.record && !state.record ? null : heading);
    if (target) target.focus({ preventScroll: true });
    else if (prev.record && !state.record) {
      const folder = $(`.folder[data-record="${CSS.escape(prev.record)}"]`, panel) ?? heading;
      folder?.focus();
    }
    if (target === heading) $('.panel__body', panel)?.scrollTo({ top: 0 });
  } else if (prev.surface && !state.surface && prev.surface !== 'laptop') {
    const back =
      (lastTrigger && document.contains(lastTrigger) && !lastTrigger.closest('[data-panels]') ? lastTrigger : null) ??
      $(`.drawer[data-nav="${prev.surface}"]`) ??
      $(`[data-nav="${prev.surface}"]:not([data-panels] *)`);
    back?.focus({ preventScroll: !desktopMQ.matches ? false : true });
  }
}

let inertAround: HTMLElement[] = [];
function isolate(el: HTMLElement | null) {
  for (const n of inertAround) n.inert = false;
  inertAround = [];
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    for (const sib of Array.from(n.parentElement?.children ?? [])) {
      if (sib !== n && sib instanceof HTMLElement && !sib.inert) {
        sib.inert = true;
        inertAround.push(sib);
      }
    }
  }
}

function navigate(href: string, trigger?: HTMLElement | null, replace = false) {
  const next = parse(href);
  if (trigger && !trigger.closest('[data-panels]')) lastTrigger = trigger.closest('.lt-ui') && laptop ? laptop.trigger : trigger;
  const url = new URL(href, location.href);
  const same = url.pathname + url.search + url.hash === location.pathname + location.search + location.hash;
  if (!same) history[replace ? 'replaceState' : 'pushState']({ shelf: true }, '', url);
  render(next);
}

/* ---------------- Projects: filters, search, records ---------------- */

const listEl = $('[data-project-list]');
const searchEl = $<HTMLInputElement>('[data-project-search]');
const items = $$('.folders li');

function renderProjects(state: State) {
  for (const art of $$('[data-record-view]')) art.hidden = art.dataset.recordView !== state.record;
  if (listEl) listEl.hidden = !!state.record;
  if (!state.record) {
    const q = state.params.get('q') ?? '';
    const group = state.params.get('group') ?? 'all';
    if (searchEl && document.activeElement !== searchEl) searchEl.value = q;
    if (q) $('#panel-projects')?.classList.add('is-searching');
    applyFilter(q, group);
  }
}

function applyFilter(q: string, group: string) {
  const needle = q.trim().toLowerCase();
  let shown = 0;
  for (const li of items) {
    const ok = (group === 'all' || li.dataset.group === group) && (!needle || (li.dataset.search ?? '').includes(needle));
    li.hidden = !ok;
    if (ok) shown++;
  }
  for (const b of $$('.filter')) b.setAttribute('aria-pressed', String(b.dataset.group === group));
  const count = $('[data-project-count]');
  if (count) count.textContent = shown === 1 ? '1 folder shown' : `${shown} folders shown`;
  const empty = $('[data-project-empty]');
  if (empty) empty.hidden = shown > 0;
}

function updateProjectQuery(q: string | null, group: string | null) {
  const url = new URL(location.href);
  if (q !== null) (q ? url.searchParams.set('q', q) : url.searchParams.delete('q'));
  if (group !== null) (group && group !== 'all' ? url.searchParams.set('group', group) : url.searchParams.delete('group'));
  history.replaceState({ shelf: true }, '', url);
  current = parse(url.href);
  applyFilter(url.searchParams.get('q') ?? '', url.searchParams.get('group') ?? 'all');
}

searchEl?.addEventListener('input', () => updateProjectQuery(searchEl.value, null));
$('[data-focus-search]')?.addEventListener('click', () => {
  if (current.record) navigate(`/projects/${location.search}`);
  $('#panel-projects')?.classList.add('is-searching');
  searchEl?.focus();
});
for (const b of $$('.filter')) b.addEventListener('click', () => {
  updateProjectQuery(null, b.dataset.group ?? 'all');
  settleFolders();
});

function pauseVideos(except?: HTMLVideoElement) {
  for (const v of $$<HTMLVideoElement>('video')) if (v !== except && !v.paused) v.pause();
}
document.addEventListener('play', (e) => pauseVideos(e.target as HTMLVideoElement), true);

/* ---------------- Book tabs ---------------- */

const tabs = $$('[role="tab"][data-tab]');
function selectTab(id: string, focus: boolean) {
  const validBook = $$<HTMLElement>('[data-tabpanel]').some((p) => p.dataset.tabpanel === id);
  if (!validBook) id = 'blogs';
  for (const t of tabs) {
    const on = t.dataset.tab === id;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    if (on && focus) t.focus();
  }
  for (const p of $$('[data-tabpanel]')) p.hidden = p.dataset.tabpanel !== id;
}
for (const t of tabs) {
  t.addEventListener('click', () => {
    selectTab(t.dataset.tab!, false);
    const url = new URL(location.href);
    url.searchParams.set('tab', t.dataset.tab!);
    history.replaceState({ shelf: true }, '', url);
  });
  t.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(t);
    const n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
    if (n === null) return;
    e.preventDefault();
    const next = tabs[(n + tabs.length) % tabs.length];
    next.click();
    next.focus();
  });
}

/* ---------------- Link interception ---------------- */

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-nav]');
  if (!a || a.target === '_blank') return;
  e.preventDefault();
  const nav = a.dataset.nav!;
  if (nav === 'home') return navigate('/', a);
  if (nav === current.surface && (a.classList.contains('drawer') || a.closest('.g-cabinet, .g-top, .g-desk')) && !a.dataset.tab) {
    return navigate('/', a); // pressing an open drawer closes it
  }
  const href = new URL(a.getAttribute('href')!, location.href);
  if (current.surface === 'projects' && a.matches('.folder, .back')) href.search = current.params.toString();
  navigate(href.href, a);
});

window.addEventListener('popstate', () => render(parse(location.href), 'move', true));

document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented) return; // handled by a focused control (e.g. the laptop field clearing its text)
  if (e.key === ' ' && (e.target as Element).matches('.drawer')) {
    e.preventDefault();
    (e.target as HTMLElement).click();
    return;
  }
  if (e.key === 'Tab' && current.surface && !desktopMQ.matches) {
    const panel = surfaceEl(current.surface)!;
    const controls = $$<HTMLElement>('a[href], button, input, select, textarea, [tabindex="0"]', panel)
      .filter((el) => !el.closest('[hidden], [inert]') && !el.matches(':disabled') && el.getClientRects().length);
    const first = controls[0];
    const last = controls.at(-1);
    if (first && last && (e.shiftKey ? document.activeElement === first || !controls.includes(document.activeElement as HTMLElement) : document.activeElement === last)) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  }
  if (e.key !== 'Escape' || !current.surface) return;
  e.preventDefault();
  navigate(current.record ? `/projects/${location.search}` : '/');
});

let resizeFrame = 0;
function refitDrawer() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => render(current, 'none', true));
}
window.addEventListener('resize', refitDrawer);
window.visualViewport?.addEventListener('resize', refitDrawer);

/* ---------------- Ambient desk motion ---------------- */

// Plants sway once on load and again when the pointer brushes them.
const swayA = { '15%': { rotation: 1.8, scale: 1.01 }, '35%': { rotation: -1, scale: 1 }, '55%': { rotation: 0.8 }, '75%': { rotation: -0.5 }, '100%': { rotation: 0, scale: 1 } };
const swayB = { '20%': { rotation: -1.6, scale: 1.01 }, '45%': { rotation: 1, scale: 1 }, '65%': { rotation: -0.6 }, '85%': { rotation: 0.3 }, '100%': { rotation: 0, scale: 1 } };
function sway(plant: Element) {
  if (reduceMQ.matches || gsap.isTweening($$('.sway', plant))) return;
  for (const g of $$('.sway', plant)) {
    const a = g.classList.contains('sway--a');
    // Mirrors the CSS origins: the top plant's second stem hangs from its top.
    const origin = a || plant.classList.contains('desk-plant') ? '50% 100%' : '30% 0%';
    gsap.to(g, { keyframes: a ? swayA : swayB, duration: a ? 3.4 : 4, ease: 'none', easeEach: 'sine.inOut', transformOrigin: origin });
  }
}
for (const p of $$('[data-sway]')) {
  p.addEventListener('pointerenter', () => sway(p));
  sway(p);
}
// Mug steam: one shader puff (SVG wisps without WebGL) on load and on hover; never continuous.
const waves = $$('.steam__w');
const steamCanvas = $<HTMLCanvasElement>('.steam__gl');
if (steamCanvas) steamCanvas.hidden = false; // visible first so the rest frame can be measured
const puff = steamCanvas ? initSteam(steamCanvas, () => reduceMQ.matches) : null;
if (puff) $('.steam > svg')?.setAttribute('hidden', '');
else if (steamCanvas) steamCanvas.hidden = true;
function steam() {
  if (puff) return puff();
  if (reduceMQ.matches || !waves.length || gsap.isTweening(waves)) return;
  gsap.to(waves, {
    keyframes: { '0%': { y: 6, opacity: 0.2 }, '40%': { opacity: 0.85 }, '100%': { y: -10, opacity: 0.15 } },
    duration: 2.6, ease: 'none', easeEach: 'sine.inOut', repeat: 1, stagger: 0.4, clearProps: 'transform,opacity',
  });
}
$('[data-steam]')?.addEventListener('pointerenter', steam);
steam();

// A portrait that fails to load leaves the plain mat, never a broken-image icon.
for (const img of $$<HTMLImageElement>('.frame img')) {
  const empty = () => img.replaceWith(Object.assign(document.createElement('span'), { className: 'frame__empty' }));
  if (img.complete && !img.naturalWidth) empty();
  else img.addEventListener('error', empty, { once: true });
}

/* ---------------- Copy and contact ---------------- */

async function copyText(text: string, statusEl: Element | null, ok: string) {
  try {
    await navigator.clipboard.writeText(text);
    if (statusEl) statusEl.textContent = ok;
  } catch {
    if (statusEl) statusEl.textContent = 'Copy didn’t work. Select the text to copy it.';
  }
}
for (const b of $$('[data-copy]')) {
  b.addEventListener('click', () => copyText(b.dataset.copy!, $('[data-copy-status]'), 'Email address copied.'));
}
const form = $<HTMLFormElement>('[data-contact]');
if (form) {
  const status = $('[data-contact-status]');
  const compose = () => {
    const fd = new FormData(form);
    const name = String(fd.get('name') ?? '').trim();
    const subject = String(fd.get('subject') ?? '').trim();
    const body = String(fd.get('body') ?? '').trim();
    return { name, subject, body: name ? `${body}\n\n— ${name}` : body };
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const m = compose();
    const to = form.getAttribute('action')!;
    window.location.href = `${to}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`;
    if (status) status.textContent = 'Your email app should open with the message ready. Nothing has been sent yet.';
  });
  $('[data-copy-message]')?.addEventListener('click', () => {
    const m = compose();
    const to = form.getAttribute('action')!.replace('mailto:', '');
    copyText(`To: ${to}\nSubject: ${m.subject}\n\n${m.body}`, status, 'Message and address copied. Paste them into any email app.');
  });
}

/* ---------------- Media failures (ui-copy feedback strings) ---------------- */

document.addEventListener(
  'error',
  (e) => {
    const el = e.target;
    if (!(el instanceof HTMLVideoElement || el instanceof HTMLImageElement) || !el.closest('[data-panels]')) return;
    if (el.dataset.failed) return;
    el.dataset.failed = 'true';
    // A folder thumbnail is decorative: leave the plain art pane. A note here
    // would sit inside the grid cell and stretch the whole row.
    if (el.closest('.folder__art')) return el.remove();
    const note = document.createElement('p');
    note.className = 'media-error';
    note.textContent =
      el instanceof HTMLVideoElement
        ? 'This video could not be played. Read the walkthrough summary below.'
        : 'This image could not be loaded. The project description is still available.';
    (el.closest('a, figure') ?? el).insertAdjacentElement('afterend', note);
    el.hidden = true;
  },
  true,
);
// Thumbnails that already failed before this module ran never reach the listener.
for (const img of $$<HTMLImageElement>('.folder__art img')) if (img.complete && !img.naturalWidth) img.remove();

/* ---------------- Boot ---------------- */

const globeEl = $('[data-globe]');
if (globeEl) initGlobe(globeEl, reduceMQ.matches);

if (laptopEl) {
  laptop = initLaptop(laptopEl, {
    navigate: (href, trigger) => navigate(href, trigger),
    close: () => navigate('/'),
    reduced: () => reduceMQ.matches,
    overlay: () => !desktopMQ.matches,
  });
}

// Direct loads render the URL state without moving focus.
render(current, 'none', true);


