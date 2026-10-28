const board = document.querySelector<HTMLElement>('.g-board');
const selector = board?.querySelector<HTMLFieldSetElement>('[data-board-switch]');
const noteTitle = board?.querySelector<HTMLElement>('[data-board-title]');
const empty = board?.querySelector<HTMLElement>('[data-board-empty]');
const photo = board?.querySelector<HTMLElement>('[data-board-photo]');
const completed = board?.querySelector<HTMLElement>('[data-board-list="completed"]');
const building = board?.querySelector<HTMLElement>('[data-board-list="building"]');
const dialog = board?.querySelector<HTMLDialogElement>('[data-board-dialog]');

if (selector && noteTitle && empty && photo && completed && building) {
  selector.addEventListener('change', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.checked) return;
    const mode = input.value;
    selector.dataset.mode = mode;
    noteTitle.textContent = mode === 'ideas' ? 'Ideas' : mode === 'building' ? 'Currently Building' : 'Pinned Builds';
    completed.hidden = mode !== 'completed';
    building.hidden = mode !== 'building' || building.children.length === 0;
    photo.hidden = mode !== 'completed';
    empty.hidden = mode === 'completed' || (mode === 'building' && building.children.length > 0);
    empty.textContent = mode === 'ideas'
      ? 'No verified idea-stage projects are public yet.'
      : 'No verified current builds are public yet.';
  });
}

if (board && dialog) {
  let trigger: HTMLAnchorElement | null = null;
  const sections = [...dialog.querySelectorAll<HTMLElement>('[data-board-detail]')];
  board.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-board-preview]');
    if (!link || !board.contains(link)) return;
    const detail = sections.find((section) => section.dataset.boardDetail === link.dataset.boardPreview);
    if (!detail || !dialog.showModal) return; // The stable project URL works without JS.
    event.preventDefault();
    trigger = link;
    sections.forEach((section) => { section.hidden = section !== detail; });
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>('[data-board-close]')?.focus();
  });
  dialog.querySelector('[data-board-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
    if ((event.target as Element).closest('.board-preview__links a')) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (trigger?.isConnected && !trigger.hidden) trigger.focus({ preventScroll: true });
    trigger = null;
  });
}
