type Motion = { fromX: number; fromY: number; toX: number; toY: number; start: number; duration: number; exit?: boolean };
type CardState = {
  side: 'left' | 'right'; index: number; visible: boolean; dealt: boolean; view?: string;
  x: number; y: number; paintedX: number; paintedY: number; hover: boolean; motion?: Motion;
};
type Drag = { card: HTMLElement; state: CardState; id: number; startX: number; startY: number; x: number; y: number; anchorX: number; anchorY: number; width: number; active: boolean; lastX: number; lastY: number; time: number; vx: number; vy: number };

// Integer layout offsets keep live type native: never scaled, rotated or filtered.
export function createCardMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const phone = matchMedia('(max-width: 580px)');
  const states = new Map<HTMLElement, CardState>();
  let drag: Drag | undefined, topCard = 10, suppressClickUntil = 0;
  function paint(card: HTMLElement, state: CardState, x: number, y: number) {
    const px = Math.round(x), py = Math.round(y);
    if (px !== state.paintedX) card.style.setProperty('--card-x', `${px}px`);
    if (py !== state.paintedY) card.style.setProperty('--card-y', `${py}px`);
    state.paintedX = px; state.paintedY = py;
  }
  function raise(card: HTMLElement) {
    const level = String(++topCard); card.style.zIndex = level;
    const dock = card.closest<HTMLElement>('.discovery,.dossier-dock');
    if (dock) dock.style.zIndex = level;
  }
  function move(card: HTMLElement, state: CardState, x: number, y: number, duration = 600, delay = 0, exit = false) {
    if (reduced.matches) { state.x = x; state.y = y; paint(card, state, x, y); if (exit) destroy(card); return; }
    state.motion = { fromX: state.paintedX, fromY: state.paintedY, toX: x, toY: y, start: performance.now() + delay, duration, exit };
    card.classList.add(exit ? 'is-leaving' : 'is-dealing');
  }
  function deal(card: HTMLElement, state: CardState) {
    state.dealt = true; card.classList.remove('awaiting-deal');
    if (reduced.matches) return;
    const rect = card.getBoundingClientRect();
    paint(card, state, state.side === 'left' ? -rect.right - 30 : innerWidth - rect.left + 30, 28);
    move(card, state, 0, 0, 950, state.index * 110);
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const card = entry.target as HTMLElement, state = states.get(card);
      if (!state) continue;
      state.visible = entry.isIntersecting;
      if (state.visible && !state.dealt) deal(card, state);
    }
  });
  function destroy(card: HTMLElement) { observer.unobserve(card); states.delete(card); card.remove(); }
  function addGrip(card: HTMLElement) {
    if (card.querySelector('.card-grip')) return;
    const grip = document.createElement('button');
    grip.type = 'button'; grip.className = 'card-grip'; grip.textContent = '⠿ Drag card';
    grip.setAttribute('aria-label', 'Move card. Drag, or use arrow keys; Home returns it to its place.');
    grip.title = 'Drag anywhere on the table · Arrow keys to move · Home to return';
    const top = card.querySelector('.dossier-top');
    if (top) top.append(grip); else card.prepend(grip);
  }
  function mount(card: HTMLElement, side: CardState['side'], index = 0) {
    addGrip(card);
    const existing = states.get(card);
    if (existing) {
      existing.index = index;
      if (existing.motion?.exit) { existing.motion = undefined; card.inert = false; card.classList.remove('is-leaving'); move(card, existing, existing.x, existing.y); }
      return existing;
    }
    const state: CardState = { side, index, visible: false, dealt: false, x: 0, y: 0, paintedX: 0, paintedY: 0, hover: false };
    states.set(card, state); card.classList.add('card-motion'); card.dataset.cardSide = side;
    card.style.zIndex = String(++topCard);
    if (!reduced.matches) card.classList.add('awaiting-deal');
    card.addEventListener('pointerenter', () => { state.hover = true; raise(card); });
    card.addEventListener('pointerleave', () => { state.hover = false; });
    card.addEventListener('focusin', () => raise(card));
    card.addEventListener('dragstart', event => event.preventDefault());
    card.addEventListener('pointerdown', event => {
      const target = event.target as HTMLElement;
      const handle = target.closest('.card-grip');
      if (event.button !== 0 || state.motion?.exit || (event.pointerType === 'touch' && !handle)) return;
      if (!handle && !target.closest('.card-art,.dossier-hero,.mystery-card>img,.dossier-top')) return;
      if (!handle && target.closest('a,input,textarea,.icon-button,.hero-source')) return;
      state.motion = undefined; card.classList.remove('is-dealing');
      const rect = card.getBoundingClientRect();
      drag = { card, state, id: event.pointerId, startX: event.clientX, startY: event.clientY, x: state.paintedX, y: state.paintedY, anchorX: rect.left - state.paintedX, anchorY: rect.top - state.paintedY, width: rect.width, active: false, lastX: event.clientX, lastY: event.clientY, time: performance.now(), vx: 0, vy: 0 };
      raise(card);
    });
    card.addEventListener('keydown', event => {
      if (!(event.target as HTMLElement).closest('.card-grip')) return;
      const step = event.shiftKey ? 40 : 10;
      const delta: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (event.key === 'Home' || event.key === 'Escape') { event.preventDefault(); move(card, state, 0, 0); return; }
      if (!delta[event.key]) return;
      event.preventDefault(); state.motion = undefined;
      const [dx, dy] = delta[event.key], rect = card.getBoundingClientRect();
      state.x = state.paintedX + Math.max(8 - rect.left, Math.min(innerWidth - rect.width - 8 - rect.left, dx));
      state.y = state.paintedY + Math.max(8 - rect.top, Math.min(innerHeight - 48 - rect.top, dy));
      paint(card, state, state.x, state.y);
    });
    observer.observe(card);
    return state;
  }
  function clampDrag(d: Drag, x: number, y: number) {
    return [Math.max(8 - d.anchorX, Math.min(innerWidth - d.width - 8 - d.anchorX, x)), Math.max(8 - d.anchorY, Math.min(innerHeight - 60 - d.anchorY, y))];
  }
  window.addEventListener('pointermove', event => {
    const d = drag; if (!d || event.pointerId !== d.id) return;
    const dx = event.clientX - d.startX, dy = event.clientY - d.startY;
    if (!d.active && Math.hypot(dx, dy) < 5) return;
    if (!d.active) { d.active = true; d.card.setPointerCapture(d.id); d.card.classList.add('is-dragging'); }
    event.preventDefault();
    const now = performance.now(), dt = Math.max(16, now - d.time);
    d.vx = (event.clientX - d.lastX) / dt; d.vy = (event.clientY - d.lastY) / dt;
    d.lastX = event.clientX; d.lastY = event.clientY; d.time = now;
    const [x, y] = clampDrag(d, d.x + dx, d.y + dy);
    d.state.x = x; d.state.y = y; paint(d.card, d.state, x, y);
  }, { passive: false });
  function finishDrag(cancel = false) {
    const d = drag; if (!d) return;
    drag = undefined; d.card.classList.remove('is-dragging');
    if (d.card.hasPointerCapture(d.id)) d.card.releasePointerCapture(d.id);
    if (!d.active) return;
    suppressClickUntil = performance.now() + 120;
    if (cancel) { move(d.card, d.state, d.x, d.y); return; }
    const fresh = performance.now() - d.time < 80;
    const [x, y] = clampDrag(d, d.state.x + (fresh ? d.vx * 70 : 0), d.state.y + (fresh ? d.vy * 70 : 0));
    move(d.card, d.state, x, y, 520);
  }
  window.addEventListener('pointerup', () => finishDrag());
  window.addEventListener('pointercancel', () => finishDrag(true));
  window.addEventListener('blur', () => finishDrag(true));
  window.addEventListener('keydown', event => { if (event.key === 'Escape' && drag) finishDrag(true); });
  document.addEventListener('click', event => {
    if (performance.now() < suppressClickUntil && (event.target as HTMLElement).closest('.card-motion')) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  function leave(card: HTMLElement) {
    const state = states.get(card);
    if (!state || !state.visible || reduced.matches) { destroy(card); return; }
    if (state.motion?.exit) return;
    card.inert = true; move(card, state, state.paintedX - card.getBoundingClientRect().right - 40, state.paintedY + 20, 340, 0, true);
  }
  function revealDossier(card: HTMLElement, content: HTMLElement, view: string) {
    const state = mount(card, 'right', 2), previous = state.view; state.view = view;
    if (!previous || previous === view || reduced.matches) return;
    if (previous.split(':')[0] !== view.split(':')[0] && state.visible) {
      const x = state.x, y = state.y, rect = card.getBoundingClientRect();
      paint(card, state, state.paintedX + innerWidth - rect.left + 30, y + 22);
      move(card, state, x, y, 850);
    } else content.animate([{ opacity: .3 }, { opacity: 1 }], { duration: 180 });
  }
  function resetAll() { finishDrag(true); for (const [card, state] of states) if (!state.motion?.exit) move(card, state, 0, 0, 650); }
  reduced.addEventListener('change', () => {
    for (const [card, state] of states) {
      if (state.motion?.exit) { destroy(card); continue; }
      state.motion = undefined; state.dealt = true; card.classList.remove('is-dealing', 'awaiting-deal'); paint(card, state, state.x, state.y);
    }
  });
  window.addEventListener('resize', resetAll);
  function tick(now: number) {
    for (const [card, state] of states) {
      if (drag?.card === card) continue;
      const motion = state.motion;
      if (motion) {
        const t = Math.max(0, Math.min(1, (now - motion.start) / motion.duration));
        const p = motion.exit ? t * t : 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
        paint(card, state, motion.fromX + (motion.toX - motion.fromX) * p, motion.fromY + (motion.toY - motion.fromY) * p);
        if (t === 1) {
          if (motion.exit) { destroy(card); continue; }
          state.x = motion.toX; state.y = motion.toY; state.motion = undefined; card.classList.remove('is-dealing');
        }
      } else if (state.dealt && state.visible && !state.hover && !card.matches(':focus-within') && !reduced.matches && !(state.side==='right' && phone.matches) && !document.hidden) {
        const phase = now / 1500 + state.index * 2.1;
        paint(card, state, state.x + Math.sin(phase * .7) * 2, state.y + Math.sin(phase) * 4);
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  return { mount, leave, revealDossier, resetAll };
}
