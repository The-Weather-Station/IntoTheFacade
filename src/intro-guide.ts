// Once per page visit, the guide follows the cover while it is dealt in.
// It never intercepts pointer input and stops measuring as soon as a case opens.
export function createIntroGuide() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let dismissed = false, frame = 0;
  let loaded = document.readyState === 'complete', started = 0;
  window.addEventListener('load', () => { loaded = true; }, { once:true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('intro-arrow'); svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<defs><marker id="intro-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M1 1 L6 4 L1 7"/></marker><mask id="intro-draw-mask" maskUnits="userSpaceOnUse"><path class="intro-draw-path" pathLength="1" fill="none" stroke="white" stroke-width="30" stroke-dasharray="1" stroke-dashoffset="1"/></mask></defs><g mask="url(#intro-draw-mask)"><path class="intro-arrow-shadow"/><path class="intro-arrow-line" marker-end="url(#intro-arrowhead)"/></g>';
  function draw() {
    if (dismissed || !document.querySelector('.dossier-dock.is-welcome')) { svg.remove(); frame = 0; return; }
    const source = document.querySelector('#intro-start')?.getBoundingClientRect();
    const target = document.querySelector('[data-card-key="stockyard-airsoft"] .case-cover')?.getBoundingClientRect();
    const visible = source && target && target.bottom > 0 && target.top < innerHeight;
    svg.style.display = visible && loaded ? '' : 'none';
    if (visible && loaded) {
      const now = performance.now();
      if (!started) started = now + 650;
      const progress = reduced.matches ? 1 : Math.min(1, Math.max(0, (now - started) / 1150));
      svg.dataset.draw = progress < 1 ? 'drawing' : 'complete';
      svg.style.opacity = progress === 0 ? '0' : '1';
      svg.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
      const bob = reduced.matches ? 0 : Math.sin(performance.now() / 380) * 5;
      let path: string;
      if (innerWidth <= 580) {
        const x = target.left + target.width * .6, y = target.top - 8 + bob;
        path = `M ${x + 45} ${y - 45} Q ${x + 8} ${y - 50} ${x} ${y}`;
      } else {
        const x = target.right + 12 + bob, y = target.top + target.height * .38;
        const sx = Math.max(x + 70, source.left - 10), sy = Math.min(innerHeight - 60, Math.max(70, source.top + source.height / 2));
        path = `M ${sx} ${sy} C ${sx - 150} ${sy - 65}, ${x + 150} ${y - 70}, ${x} ${y}`;
      }
      svg.querySelectorAll('.intro-arrow-shadow,.intro-arrow-line,.intro-draw-path').forEach(p => p.setAttribute('d', path));
      svg.querySelector('.intro-draw-path')!.setAttribute('stroke-dashoffset', String(1 - progress));
      const mask = svg.querySelector('mask')!;
      mask.setAttribute('x','0'); mask.setAttribute('y','0');
      mask.setAttribute('width', String(innerWidth)); mask.setAttribute('height', String(innerHeight));
    }
    frame = requestAnimationFrame(draw);
  }
  function show() {
    if (dismissed || frame) return;
    document.body.append(svg); frame = requestAnimationFrame(draw);
  }
  function dismiss() {
    dismissed = true; cancelAnimationFrame(frame); frame = 0; svg.remove();
  }
  return { show, dismiss };
}
