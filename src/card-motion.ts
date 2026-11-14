type CardState = {
  side: 'left' | 'right'; index: number; visible: boolean; dealt: boolean; hover: boolean; paused: boolean;
  px: number; py: number; vx: number; vy: number;
  aimX: number; aimY: number; rx: number; ry: number; rz: number;
  events: AbortController;
};
// One transform per physical card keeps its paper, image and live copy together.
// No hover scaling; tilt settles flat when reading with keyboard focus.
export function createCardMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const phone = matchMedia('(max-width: 580px)');
  const states = new Map<HTMLElement, CardState>();
  let lastTime = performance.now();
  function paint(card: HTMLElement, s: CardState) {
    card.style.transform = `translate3d(${s.px.toFixed(3)}px,${s.py.toFixed(3)}px,0) perspective(1200px) rotateX(${s.rx.toFixed(3)}deg) rotateY(${s.ry.toFixed(3)}deg) rotateZ(${s.rz.toFixed(3)}deg)`;
    card.style.setProperty('--tilt-x', s.rx.toFixed(3)+'deg');
    card.style.setProperty('--tilt-y', s.ry.toFixed(3)+'deg');
    card.style.setProperty('--tilt-z', s.rz.toFixed(3)+'deg');
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
  function destroy(card: HTMLElement) { states.get(card)?.events.abort(); observer.unobserve(card); states.delete(card); card.remove(); }
  function mount(card: HTMLElement, side: CardState['side'], index = 0) {
    const existing = states.get(card);
    if (existing) { existing.index = index; return existing; }
    const s: CardState = { side, index, visible: false, dealt: false, hover: false, paused: false, px: 0, py: 0, vx: 0, vy: 0, aimX: 0, aimY: 0, rx: 0, ry: 0, rz: 0, events: new AbortController() };
    states.set(card, s); card.classList.add('card-motion'); card.dataset.cardSide = side;
    if (!reduced.matches) card.classList.add('awaiting-deal');
    const options = { signal:s.events.signal, passive:true };
    const clearPointer = () => { s.hover = false; s.aimX = s.aimY = 0; };
    const movePointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || reduced.matches) return;
      if (side === 'right') {
        // Include the exposed backs, selector strips and nearby empty space.
        // Observe proximity without placing an invisible hitbox over the map.
        const dock = card.closest<HTMLElement>('.dossier-dock')!.getBoundingClientRect();
        if (event.clientX < dock.left - 42 || event.clientX > dock.right + 42 || event.clientY < dock.top - 24 || event.clientY > dock.bottom + 24) { clearPointer(); return; }
        s.hover = true;
      }
      // Use the stable layout box, not the transformed edges, to avoid feedback jitter.
      const parent = card.offsetParent as HTMLElement;
      const rect = parent.getBoundingClientRect();
      const left = rect.left + parent.clientLeft + card.offsetLeft - parent.scrollLeft;
      const top = rect.top + parent.clientTop + card.offsetTop - parent.scrollTop;
      s.aimX = Math.max(-1, Math.min(1, (event.clientX - left) / card.offsetWidth * 2 - 1));
      s.aimY = Math.max(-1, Math.min(1, (event.clientY - top) / card.offsetHeight * 2 - 1));
    };
    if (side === 'right') {
      document.addEventListener('pointermove', movePointer, options);
      document.addEventListener('pointerleave', clearPointer, options);
      window.addEventListener('blur', clearPointer, options);
    } else {
      card.addEventListener('pointerenter', () => { s.hover = true; }, options);
      card.addEventListener('pointerleave', clearPointer, options);
      card.addEventListener('pointermove', movePointer, options);
    }
    card.addEventListener('dragstart', e => e.preventDefault());
    observer.observe(card); return s;
  }
  function pause(card: HTMLElement, paused: boolean) {
    const s = states.get(card); if (!s) return;
    s.paused = paused;
    if (paused) { s.px = s.py = 0; s.vx = s.vy = s.rx = s.ry = s.rz = 0; paint(card, s); }
  }
  function home(card: HTMLElement) {
    const s = states.get(card); if (!s) return;
    s.px = s.py = s.vx = s.vy = 0; paint(card, s);
  }
  function leave(card: HTMLElement) { destroy(card); }
  reduced.addEventListener('change', () => {
    for (const [card, s] of states) { s.dealt = true; s.px = s.py = 0; s.vx = s.vy = s.rx = s.ry = s.rz = 0; card.classList.remove('awaiting-deal'); paint(card, s); }
  });
  function tick(now: number) {
    const dt = Math.min(.032, Math.max(.001, (now - lastTime) / 1000)); lastTime = now;
    if (!document.hidden) for (const [card, s] of states) {
      if (!s.dealt || s.paused) continue;
      const reading = s.hover || card.matches(':focus-within') || (s.side === 'right' && phone.matches);
      const phase = now / 1800 + s.index * 2.2, floating = !reduced.matches && !reading && s.visible;
      const tx = floating ? Math.sin(phase * .7) * 2.6 : 0;
      const ty = floating ? Math.sin(phase) * 4.8 : 0;
      for (let i = 0; i < 2; i++) {
        const h = dt / 2;
        s.vx += ((tx - s.px) * 145 - s.vx * 23) * h; s.vy += ((ty - s.py) * 145 - s.vy * 23) * h;
        s.px += s.vx * h; s.py += s.vy * h;
      }
      if (!floating && Math.hypot(tx - s.px, ty - s.py, s.vx, s.vy) < .025) { s.px = Math.round(tx); s.py = Math.round(ty); s.vx = s.vy = 0; }
      const blend = 1 - Math.exp(-11 * dt), tilt = s.side === 'left' ? 6 : 1.8;
      const still = reduced.matches || !!card.querySelector(':focus-visible');
      s.rx += ((still ? 0 : -s.aimY * tilt) - s.rx) * blend;
      s.ry += ((still ? 0 : s.aimX * tilt) - s.ry) * blend;
      s.rz += ((still ? 0 : floating ? Math.sin(phase * .65) * (s.side === 'left' ? 1.2 : .25) : s.aimX * .6) - s.rz) * blend;
      if (reduced.matches) { s.px = s.py = 0; s.rx = s.ry = s.rz = 0; }
      paint(card, s);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  return { mount, leave, pause, home, revealDossier: (card: HTMLElement) => mount(card, 'right', 3) };
}
