// The Shelf controller: one owner for surface state, history and focus.
// State is always derived from the URL; every control is a real link or is
// enhanced from a non-interactive element, so nothing is dead without JS.
import { initGlobe } from './globe';

type State = { surface: string | null; record: string | null; params: URLSearchParams; hash: string };

const SURFACES = new Set(['about', 'projects', 'patents', 'experience', 'education', 'achievements', 'toolbox', 'certifications', 'writing', 'laptop', 'contact']);
const desktopMQ = window.matchMedia('(min-width: 1000px) and (min-height: 560px)');
const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

const stage = $('[data-scene]')!;
const baseTitle = 'The Shelf — Ayush Jain';
let lastTrigger: HTMLElement | null = null;
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

function render(state: State, focus: 'move' | 'none' = 'move') {
  const prev = current;
  current = state;
  const modal = !desktopMQ.matches;

  for (const panel of $$('[data-surface]')) {
    const open = panel.dataset.surface === state.surface;
    panel.hidden = !open;
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
    if (nav && nav !== 'home' && !el.closest('[data-panels]') && !el.classList.contains('chip') && !el.closest('.note')) {
      if (nav === state.surface) el.setAttribute('aria-current', isDrawer ? 'page' : 'true');
      else el.removeAttribute('aria-current');
    }
  }
  for (const d of $$('.drawer')) d.setAttribute('aria-expanded', String(d.dataset.nav === state.surface));
  $('.laptop')?.classList.toggle('is-open', state.surface === 'laptop');

  // Background is inert while a modal sheet is open (tablet/mobile).
  const inertBg = !!state.surface && modal;
  stage.inert = inertBg;
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

  const panel = state.surface ? $(`[data-surface="${state.surface}"]`) : null;
  const recordTitle = state.record ? $(`#record-${CSS.escape(state.record)}-title`) : null;
  const heading = $('.panel__title', panel ?? document);
  document.title = state.surface
    ? `${recordTitle?.textContent ?? heading?.textContent ?? ''} — The Shelf · Ayush Jain`
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
  } else if (prev.surface && !state.surface) {
    const back =
      (lastTrigger && document.contains(lastTrigger) && !lastTrigger.closest('[data-panels]') ? lastTrigger : null) ??
      $(`.drawer[data-nav="${prev.surface}"]`) ??
      $(`[data-nav="${prev.surface}"]:not([data-panels] *)`);
    back?.focus({ preventScroll: !desktopMQ.matches ? false : true });
  }
}

function navigate(href: string, trigger?: HTMLElement | null, replace = false) {
  const next = parse(href);
  if (trigger && !trigger.closest('[data-panels]')) lastTrigger = trigger;
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
for (const b of $$('.filter')) b.addEventListener('click', () => updateProjectQuery(null, b.dataset.group ?? 'all'));

function pauseVideos(except?: HTMLVideoElement) {
  for (const v of $$<HTMLVideoElement>('video')) if (v !== except && !v.paused) v.pause();
}
document.addEventListener('play', (e) => pauseVideos(e.target as HTMLVideoElement), true);

/* ---------------- Book tabs ---------------- */

const tabs = $$('[role="tab"][data-tab]');
function selectTab(id: string, focus: boolean) {
  if (!tabs.some((t) => t.dataset.tab === id)) id = 'blogs';
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
  if (nav === current.surface && a.closest('.g-cabinet, .g-top, .g-desk') && !a.dataset.tab) {
    return navigate('/', a); // pressing an open drawer closes it
  }
  navigate(a.getAttribute('href')!, a);
});

window.addEventListener('popstate', () => render(parse(location.href), 'none'));

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !current.surface) return;
  if ((e.target as Element).closest?.('video, input, textarea') && (e.target as HTMLInputElement).value) return;
  e.preventDefault();
  navigate('/');
});

desktopMQ.addEventListener('change', () => render(current, 'none'));

/* ---------------- Enhanced controls (role=button on decorative objects) ---------------- */

function asButton(el: HTMLElement, label: string, onActivate: () => void, pressed?: boolean) {
  el.setAttribute('role', 'button');
  el.tabIndex = 0;
  el.setAttribute('aria-label', label);
  if (pressed !== undefined) el.setAttribute('aria-pressed', String(pressed));
  el.addEventListener('click', onActivate);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate();
    }
  });
}

// Lamp: object and switch share one state.
const root = document.documentElement;
const lampObj = $('[data-control="lamp"]');
const lampSwitch = $('[data-lamp-switch]');
function setLamp(on: boolean) {
  root.dataset.lamp = on ? 'on' : 'off';
  lampSwitch?.setAttribute('aria-checked', String(on));
  lampObj?.setAttribute('aria-pressed', String(on));
  try {
    localStorage.setItem('shelf-lamp', on ? 'on' : 'off');
  } catch {}
}
const lampOn = () => root.dataset.lamp !== 'off';
if (lampObj) asButton(lampObj, 'Desk lamp', () => setLamp(!lampOn()), lampOn());
lampSwitch?.addEventListener('click', () => setLamp(!lampOn()));
setLamp(lampOn());

// Rubik's cube: quarter turns of the whole cube; arrow keys pick the axis.
const cubeWrap = $('[data-control="cube"]');
const cube = $('[data-cube]');
let turnX = 0;
let turnY = 0;
function turnCube(dx: number, dy: number) {
  turnX += dx;
  turnY += dy;
  cube?.style.setProperty('--rx', `${-26 + turnX * 90}deg`);
  cube?.style.setProperty('--ry', `${-38 + turnY * 90}deg`);
}
if (cubeWrap) {
  let n = 0;
  asButton(cubeWrap, 'Rubik’s cube: turn it (arrow keys choose the direction)', () => {
    n++;
    n % 3 === 0 ? turnCube(1, 0) : turnCube(0, 1);
  });
  cubeWrap.addEventListener('keydown', (e) => {
    const map: Record<string, [number, number]> = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [1, 0], ArrowDown: [-1, 0] };
    const m = map[e.key];
    if (!m) return;
    e.preventDefault();
    turnCube(...m);
  });
}

// Plants sway once on load and again when the pointer brushes them.
function playOnce(el: Element, cls: string) {
  if (reduceMQ.matches || el.classList.contains(cls)) return;
  el.classList.add(cls);
  window.setTimeout(() => el.classList.remove(cls), 6000);
}
for (const p of $$('[data-sway]')) {
  p.addEventListener('pointerenter', () => playOnce(p, 'is-swaying'));
  playOnce(p, 'is-swaying');
}
// Mug steam: two gentle cycles on load and on hover; never continuous.
const desk = $('.g-desk');
const mug = $('[data-steam]');
function steam() {
  if (desk) playOnce(desk, 'is-steaming');
}
mug?.addEventListener('pointerenter', steam);
steam();

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

/* ---------------- Boot ---------------- */

const globeEl = $('[data-globe]');
if (globeEl) initGlobe(globeEl, reduceMQ.matches);

// Direct loads render the URL state without moving focus.
render(current, 'none');
