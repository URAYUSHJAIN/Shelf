// The functional desk objects keep their own small, optional controller.
const stage = document.querySelector<HTMLElement>('[data-scene]');

// Browser-local time. Recalculate from Date on every tick so sleep and tab
// suspension cannot leave the display a minute behind.
const clock = document.querySelector<SVGSVGElement>('[data-clock]');
if (clock) {
  const digits = clock.querySelectorAll<SVGTextElement>('[data-clock-digit]');
  const period = clock.querySelector<SVGTextElement>('[data-clock-period]');
  const formatter = new Intl.DateTimeFormat(navigator.language, { hour: 'numeric', minute: '2-digit' });
  const update = () => {
    const now = new Date();
    const parts = formatter.formatToParts(now);
    const hour = parts.find((part) => part.type === 'hour')?.value ?? '--';
    const minute = parts.find((part) => part.type === 'minute')?.value ?? '--';
    const mark = parts.find((part) => part.type === 'dayPeriod')?.value ?? '';
    const value = `${hour}:${minute}`;
    digits.forEach((digit) => { digit.textContent = value; });
    if (period) period.textContent = mark;
    clock.setAttribute('aria-label', `Local time ${formatter.format(now)}`);
  };
  update();
  window.setInterval(update, 15000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
}

const lamp = document.querySelector<HTMLButtonElement>('[data-lamp-toggle]');
if (lamp && stage) {
  lamp.addEventListener('click', () => {
    const on = stage.dataset.lamp !== 'off';
    stage.dataset.lamp = on ? 'off' : 'on';
    lamp.setAttribute('aria-pressed', String(!on));
    lamp.setAttribute('aria-label', on ? 'Turn desk lamp on' : 'Turn desk lamp off');
    window.dispatchEvent(new CustomEvent('shelf:lamp', { detail: { on: !on } }));
  });
}

const audio = document.querySelector<HTMLAudioElement>('[data-speaker-audio]');
const play = document.querySelector<HTMLButtonElement>('[data-speaker-play]');
const surfaces = document.querySelectorAll<HTMLElement>('[data-speaker-surface]');
const volume = document.querySelector<HTMLInputElement>('[data-speaker-volume]');
const speakerStatus = document.querySelector<HTMLElement>('[data-speaker-status]');
if (audio && play) {
  const setPlaying = (playing: boolean) => {
    play.textContent = playing ? 'Pause music' : 'Play music';
    play.setAttribute('aria-pressed', String(playing));
    play.setAttribute('aria-label', playing ? 'Pause desk music' : 'Play desk music');
    surfaces.forEach((surface) => surface.classList.toggle('is-playing', playing));
    if (speakerStatus) { speakerStatus.textContent = playing ? 'Desk music playing.' : 'Desk music paused.'; speakerStatus.hidden = true; }
  };
  audio.volume = Number(volume?.value ?? 35) / 100;
  volume?.addEventListener('input', () => { audio.volume = Number(volume.value) / 100; });
  const toggle = async () => {
    if (!audio.paused) { audio.pause(); setPlaying(false); return; }
    try { await audio.play(); setPlaying(true); }
    catch { setPlaying(false); if (speakerStatus) { speakerStatus.textContent = 'Music could not load. Please try again later.'; speakerStatus.hidden = false; } }
  };
  play.addEventListener('click', toggle);
  surfaces.forEach((surface) => surface.addEventListener('click', toggle));
  audio.addEventListener('pause', () => setPlaying(false));
  audio.addEventListener('ended', () => setPlaying(false));
  audio.addEventListener('error', () => { setPlaying(false); if (speakerStatus) { speakerStatus.textContent = 'Music could not load. Please try again later.'; speakerStatus.hidden = false; } });
}

// A desktop enhancement; the illustrated speaker stays visible until the GLB loads.
if (document.querySelector('[data-speaker-canvas]') && matchMedia('(min-width: 1000px) and (min-height: 560px)').matches) {
  const start = () => { void import('./speaker-model').then(({ mountSpeaker }) => mountSpeaker()).catch(() => {}); };
  if ('requestIdleCallback' in window) window.requestIdleCallback(start);
  else setTimeout(start, 500);
}

const planner = document.querySelector<HTMLElement>('[data-planner]');
if (planner) {
  const key = 'the-shelf-demo-planner-v1';
  const fields = [...planner.querySelectorAll<HTMLInputElement>('[data-planner-text], [data-planner-done]')];
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (Array.isArray(saved)) fields.forEach((field, index) => {
      const value = saved[index];
      if (field.type === 'checkbox' && typeof value === 'boolean') field.checked = value;
      if (field.type === 'text' && typeof value === 'string') field.value = value.slice(0, 48);
    });
  } catch { /* Local storage can be disabled without affecting the planner. */ }
  const save = () => {
    try { localStorage.setItem(key, JSON.stringify(fields.map((field) => field.type === 'checkbox' ? field.checked : field.value))); }
    catch { /* Editing still works for the current visit. */ }
  };
  planner.addEventListener('input', save);
  planner.addEventListener('change', save);
}
