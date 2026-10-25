// The Shelf controller: one owner for surface state, history and focus.
// State is always derived from the URL; every control is a real link or is
// enhanced from a non-interactive element, so nothing is dead without JS.
import { initGlobe } from './globe';
import { initLaptop } from './laptop';

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
let drawerMotion: Animation[] = [];
let closedTransform = '';
let closedClip = '';
const openTransform = 'translate3d(0, 0, 0) rotateX(var(--tray-angle, 7deg))';

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
  panel.style.cssText = `--u:${getComputedStyle(slot).getPropertyValue('--u')};--tray-angle:${mobile ? 2 : 7}deg;--tray-depth:${depth}px;--front-height:${frontHeight}px;left:${left}px;top:${top}px;width:${width}px;height:${depth + frontHeight + 18}px`;
  closedTransform = `translate3d(${rect.left - left}px, ${rect.top - top - depth}px, 0) scaleX(${rect.width / width})`;
  closedClip = `inset(${rect.top - top - 4}px -40px -40px -40px)`;
  $('.drawer-front-mount', panel)!.append(front);
  slot.classList.add('is-vacant');
  panel.classList.add('is-mounted');
  front.setAttribute('aria-label', `Close ${$('.drawer__label', front)!.textContent}`);
}

async function animateDrawer(panel: HTMLElement, open: boolean, instant = false) {
  const assembly = $('.drawer-assembly', panel)!;
  const from = getComputedStyle(assembly).transform;
  const clip = getComputedStyle(panel).clipPath;
  drawerMotion.forEach((a) => a.cancel());
  const duration = instant || reduceMQ.matches ? 0 : open ? 460 : 300;
  panel.dataset.phase = open ? 'opening' : 'closing';
  // Freeze only the content, so pressing the original front can reverse a pull.
  $('.panel__sheet', panel)!.inert = true;
  const motion = assembly.animate([
    { transform: from === 'none' ? closedTransform : from },
    { transform: open ? openTransform : closedTransform },
  ], { duration, easing: 'cubic-bezier(.22,.8,.24,1)', fill: 'forwards' });
  const reveal = panel.animate([
    { clipPath: clip === 'none' ? closedClip : clip },
    { clipPath: open ? 'inset(-24px -40px -40px -40px)' : closedClip },
  ], { duration, easing: 'cubic-bezier(.22,.8,.24,1)', fill: 'forwards' });
  drawerMotion = [motion, reveal];
  try { await Promise.all(drawerMotion.map((a) => a.finished)); } catch { return; }
  assembly.style.transform = open ? openTransform : closedTransform;
  panel.style.clipPath = open ? 'inset(-24px -40px -40px -40px)' : closedClip;
  drawerMotion.forEach((a) => a.cancel());
  drawerMotion = [];
  panel.dataset.phase = open ? 'open' : 'closed';
  $('.panel__sheet', panel)!.inert = !open;
}

function restoreDrawer(panel: HTMLElement) {
  const slot = $(`[data-drawer-slot="${panel.dataset.surface}"]`)!;
  const front = $('.drawer', panel)!;
  slot.append(front);
  slot.classList.remove('is-vacant');
  front.removeAttribute('aria-label');
  panel.classList.remove('is-mounted');
  panel.removeAttribute('style');
  $('.drawer-assembly', panel)!.removeAttribute('style');
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
      $('.drawer-assembly', next)!.style.transform = closedTransform;
      next.style.clipPath = closedClip;
    } else if (instant) {
      placeDrawer(next);
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
for (const b of $$('.filter')) b.addEventListener('click', () => updateProjectQuery(null, b.dataset.group ?? 'all'));

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


