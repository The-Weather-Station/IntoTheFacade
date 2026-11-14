// A single-use guide follows the actual cover, including while it is dealt in.
// It never intercepts pointer input and stops measuring as soon as a case opens.
export function createIntroGuide() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let dismissed = false, frame = 0;
  try { dismissed = localStorage.getItem('itf:intro-dismissed') === 'true'; } catch { /* Session-only when storage is blocked. */ }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('intro-arrow'); svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<defs><marker id="intro-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M1 1 L6 4 L1 7"/></marker></defs><path class="intro-arrow-shadow"/><path class="intro-arrow-line" marker-end="url(#intro-arrowhead)"/>';
  function draw() {
    if (dismissed || !document.querySelector('.dossier-dock.is-welcome')) { svg.remove(); frame = 0; return; }
    const source = document.querySelector('#intro-start')?.getBoundingClientRect();
    const target = document.querySelector('[data-card-key="stockyard-airsoft"] .case-cover')?.getBoundingClientRect();
    const visible = source && target && target.bottom > 0 && target.top < innerHeight;
    svg.style.display = visible ? '' : 'none';
    if (visible) {
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
      svg.querySelectorAll(':scope > path').forEach(p => p.setAttribute('d', path));
    }
    frame = requestAnimationFrame(draw);
  }
  function show() {
    if (dismissed || frame) return;
    document.body.append(svg); frame = requestAnimationFrame(draw);
  }
  function dismiss() {
    dismissed = true; cancelAnimationFrame(frame); frame = 0; svg.remove();
    try { localStorage.setItem('itf:intro-dismissed', 'true'); } catch { /* Keep the session dismissal. */ }
  }
  return { show, dismiss };
}
