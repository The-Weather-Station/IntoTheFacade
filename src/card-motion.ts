type CardState = {
  side: 'left' | 'right'; index: number; visible: boolean; dealt: boolean; hover: boolean; paused: boolean;
  x: number; y: number; px: number; py: number; vx: number; vy: number;
  aimX: number; aimY: number; rx: number; ry: number; rz: number;
};
type Drag = { card: HTMLElement; state: CardState; id: number; startX: number; startY: number; x: number; y: number; anchorX: number; anchorY: number; width: number; active: boolean; lastX: number; lastY: number; time: number; vx: number; vy: number };

// Subpixel compositor motion with elapsed-time damping. Only artwork tilts;
// live copy never scales and settles onto whole pixels while being read.
export function createCardMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const phone = matchMedia('(max-width: 580px)');
  const states = new Map<HTMLElement, CardState>();
  let drag: Drag | undefined, topCard = 10, suppressClickUntil = 0, lastTime = performance.now();
  function paint(card: HTMLElement, s: CardState) {
    card.style.transform = 'translate3d('+s.px.toFixed(3)+'px,'+s.py.toFixed(3)+'px,0)';
    card.style.setProperty('--tilt-x', s.rx.toFixed(3)+'deg');
    card.style.setProperty('--tilt-y', s.ry.toFixed(3)+'deg');
    card.style.setProperty('--tilt-z', s.rz.toFixed(3)+'deg');
  }
  function raise(card: HTMLElement) {
    const level = String(++topCard); card.style.zIndex = level;
    const dock = card.closest<HTMLElement>('.discovery,.dossier-dock');
    if (dock) dock.style.zIndex = level;
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const card = entry.target as HTMLElement, s = states.get(card);
      if (!s) continue;
      s.visible = entry.isIntersecting;
      if (s.visible && !s.dealt) {
        s.dealt = true; card.classList.remove('awaiting-deal');
        if (!reduced.matches) {
          const rect = card.getBoundingClientRect();
          s.px = s.side === 'left' ? -rect.right - 25 : innerWidth - rect.left + 25;
          s.py = 25; paint(card, s);
        }
      }
    }
  }, { rootMargin: '40px' });
  function destroy(card: HTMLElement) { observer.unobserve(card); states.delete(card); card.remove(); }
  function mount(card: HTMLElement, side: CardState['side'], index = 0) {
    if (!card.querySelector('.card-grip')) {
      const grip = document.createElement('button');
      grip.type = 'button'; grip.className = 'card-grip'; grip.textContent = '⠿';
      grip.setAttribute('aria-label', 'Move card. Drag, or use arrow keys; Home returns it to its place.');
      grip.title = 'Drag card · Arrow keys to move · Home to return';
      (card.querySelector('.dossier-top') ?? card).prepend(grip);
    }
    const existing = states.get(card);
    if (existing) { existing.index = index; return existing; }
    const s: CardState = { side, index, visible: false, dealt: false, hover: false, paused: false, x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, aimX: 0, aimY: 0, rx: 0, ry: 0, rz: 0 };
    states.set(card, s); card.classList.add('card-motion'); card.dataset.cardSide = side;
    if (!reduced.matches) card.classList.add('awaiting-deal');
    card.addEventListener('pointerenter', () => { s.hover = true; raise(card); });
    card.addEventListener('pointerleave', () => { s.hover = false; s.aimX = s.aimY = 0; });
    card.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch' || drag || reduced.matches) return;
      const rect = card.getBoundingClientRect();
      s.aimX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      s.aimY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
    });
    card.addEventListener('focusin', () => raise(card));
    card.addEventListener('dragstart', e => e.preventDefault());
    card.addEventListener('pointerdown', event => {
      const target = event.target as HTMLElement, handle = target.closest('.card-grip');
      if (event.button !== 0 || s.paused || (event.pointerType === 'touch' && !handle)) return;
      if (!handle && !target.closest('.stack-visual,.dossier-hero,.dossier-top')) return;
      if (!handle && target.closest('a,input,textarea,.icon-button,.hero-source')) return;
      const rect = card.getBoundingClientRect();
      drag = { card, state: s, id: event.pointerId, startX: event.clientX, startY: event.clientY, x: s.px, y: s.py, anchorX: rect.left - s.px, anchorY: rect.top - s.py, width: rect.width, active: false, lastX: event.clientX, lastY: event.clientY, time: performance.now(), vx: 0, vy: 0 };
      raise(card);
    });
    card.addEventListener('keydown', event => {
      if (!(event.target as HTMLElement).closest('.card-grip')) return;
      const step = event.shiftKey ? 40 : 10;
      const delta: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (event.key === 'Home' || event.key === 'Escape') { event.preventDefault(); s.x = s.y = 0; return; }
      if (!delta[event.key]) return;
      event.preventDefault(); const [dx, dy] = delta[event.key], rect = card.getBoundingClientRect();
      s.x = s.px + Math.max(8 - rect.left, Math.min(innerWidth - rect.width - 8 - rect.left, dx));
      s.y = s.py + Math.max(8 - rect.top, Math.min(innerHeight - 60 - rect.top, dy));
    });
    observer.observe(card); return s;
  }
  function clamp(d: Drag, x: number, y: number) {
    return [Math.max(8 - d.anchorX, Math.min(innerWidth - d.width - 8 - d.anchorX, x)), Math.max(8 - d.anchorY, Math.min(innerHeight - 60 - d.anchorY, y))];
  }
  window.addEventListener('pointermove', event => {
    const d = drag; if (!d || event.pointerId !== d.id) return;
    const dx = event.clientX - d.startX, dy = event.clientY - d.startY;
    if (!d.active && Math.hypot(dx, dy) < 6) return;
    if (!d.active) { d.active = true; d.card.setPointerCapture(d.id); d.card.classList.add('is-dragging'); }
    event.preventDefault(); const now = performance.now(), dt = Math.max(10, now - d.time);
    d.vx = (event.clientX - d.lastX) / dt; d.vy = (event.clientY - d.lastY) / dt;
    d.lastX = event.clientX; d.lastY = event.clientY; d.time = now;
    [d.state.x, d.state.y] = clamp(d, d.x + dx, d.y + dy);
    d.state.px = d.state.x; d.state.py = d.state.y; d.state.vx = d.state.vy = 0;
    d.state.ry = Math.max(-9, Math.min(9, d.vx * 5)); paint(d.card, d.state);
  }, { passive: false });
  function finishDrag(cancel = false) {
    const d = drag; if (!d) return; drag = undefined; d.card.classList.remove('is-dragging');
    if (d.card.hasPointerCapture(d.id)) d.card.releasePointerCapture(d.id);
    if (!d.active) return;
    suppressClickUntil = performance.now() + 160;
    const fresh = performance.now() - d.time < 100;
    [d.state.x, d.state.y] = cancel ? [d.x, d.y] : clamp(d, d.state.x + (fresh ? d.vx * 55 : 0), d.state.y + (fresh ? d.vy * 55 : 0));
  }
  window.addEventListener('pointerup', () => finishDrag());
  window.addEventListener('pointercancel', () => finishDrag(true));
  window.addEventListener('blur', () => finishDrag(true));
  window.addEventListener('keydown', event => { if (event.key === 'Escape' && drag) finishDrag(true); });
  document.addEventListener('click', event => {
    if (performance.now() < suppressClickUntil && (event.target as HTMLElement).closest('.card-motion')) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  function resetAll() { finishDrag(true); for (const s of states.values()) { s.x = s.y = 0; } }
  function pause(card: HTMLElement, paused: boolean) {
    const s = states.get(card); if (!s) return;
    s.paused = paused;
    if (paused) { s.px = s.x; s.py = s.y; s.vx = s.vy = s.rx = s.ry = s.rz = 0; paint(card, s); }
  }
  function home(card: HTMLElement) {
    const s = states.get(card); if (!s) return;
    s.x = s.y = s.px = s.py = s.vx = s.vy = 0; paint(card, s);
  }
  function leave(card: HTMLElement) { destroy(card); }
  window.addEventListener('resize', resetAll);
  reduced.addEventListener('change', () => {
    for (const [card, s] of states) { s.dealt = true; s.px = s.x; s.py = s.y; s.vx = s.vy = s.rx = s.ry = s.rz = 0; card.classList.remove('awaiting-deal'); paint(card, s); }
  });
  function tick(now: number) {
    const dt = Math.min(.032, Math.max(.001, (now - lastTime) / 1000)); lastTime = now;
    if (!document.hidden) for (const [card, s] of states) {
      if (!s.dealt || s.paused || drag?.card === card) continue;
      const reading = s.hover || card.matches(':focus-within') || (s.side === 'right' && phone.matches);
      const phase = now / 1800 + s.index * 2.2, floating = !reduced.matches && !reading && s.visible;
      const tx = floating ? s.x + Math.sin(phase * .7) * 2.6 : Math.round(s.x);
      const ty = floating ? s.y + Math.sin(phase) * 4.8 : Math.round(s.y);
      for (let i = 0; i < 2; i++) {
        const h = dt / 2;
        s.vx += ((tx - s.px) * 145 - s.vx * 23) * h; s.vy += ((ty - s.py) * 145 - s.vy * 23) * h;
        s.px += s.vx * h; s.py += s.vy * h;
      }
      if (!floating && Math.hypot(tx - s.px, ty - s.py, s.vx, s.vy) < .025) { s.px = Math.round(tx); s.py = Math.round(ty); s.vx = s.vy = 0; }
      const blend = 1 - Math.exp(-11 * dt), tilt = s.side === 'left' ? 8 : 3;
      s.rx += ((reduced.matches ? 0 : -s.aimY * tilt) - s.rx) * blend;
      s.ry += ((reduced.matches ? 0 : s.aimX * tilt) - s.ry) * blend;
      s.rz += ((floating ? Math.sin(phase * .65) * (s.side === 'left' ? 1.2 : .25) : s.aimX * .6) - s.rz) * blend;
      if (reduced.matches) { s.px = s.x; s.py = s.y; s.rx = s.ry = s.rz = 0; }
      paint(card, s);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  return { mount, leave, pause, home, resetAll, revealDossier: (card: HTMLElement) => mount(card, 'right', 3) };
}
