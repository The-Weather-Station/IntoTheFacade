import { artUrl } from './generated-art';
import type { Place } from './data';
import type { createCardMotion } from './card-motion';

export const covers: Record<string, { asset: string; title: string; context: string; alt: string }> = {
  'stockyard-airsoft': { asset: 'missing-road-card', title: 'MISSING ROAD!!', context: 'One road. Two maps.', alt: 'Illustrated MISSING ROAD!! card with a vanishing road and occult eye' },
  'eagle-industries': { asset: 'illegal-dumping-card', title: 'ILLEGAL DUMPING!!', context: 'The shop closed. The solvent stayed.', alt: 'Illustrated ILLEGAL DUMPING!! card: Eagle Industries with theatrical toxic spills; not a photograph of site conditions' },
  'rhode-island-warehouse': { asset: 'organized-crime-card', title: 'ORGANIZED CRIME!!!', context: 'Suite 109 · the 2025 shipping case.', alt: 'Illustrated ORGANIZED CRIME!!! card: marijuana spilling from a cut couch; dramatization of the historical case, not evidence photography' },
};
export function caseStack(p: Place, active: boolean) {
  const c = covers[p.id];
  return `<article class="case-stack ${active ? 'selected' : ''}" data-card-key="${p.id}" data-place="${p.id}">
    <div class="stack-visual"><span class="stack-back" style="--stack-i:3" aria-hidden="true"></span><span class="stack-back" style="--stack-i:2" aria-hidden="true"></span><span class="stack-back" style="--stack-i:1" aria-hidden="true"></span>
      <button class="case-cover" data-select="${p.id}" aria-pressed="${active}" aria-label="Open ${p.name} case stack: ${c.title}"><img src="${artUrl(c.asset)}" alt="${c.alt}" width="1024" height="1536" decoding="async"></button>
    </div>
    <div class="stack-caption"><span class="eyebrow">CASE ${p.number} / ${p.evidence.length} RECORDS</span><h3>${p.name}</h3><p>${c.context}</p><span class="stack-state">${active ? '3 CARDS ON THE TABLE' : 'DEAL 3 CARDS ↗'}</span></div>
  </article>`;
}

type Face = { element: HTMLElement; rect: DOMRect; backs: string[] };
// Transit copies are inert and short-lived. The real, full-size dossier is the
// only interactive reading surface, so no scaled copy can retain focus or IDs.
export function createCaseDeck(front: HTMLElement, dock: HTMLElement, motion: ReturnType<typeof createCardMotion>) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let revision = 0, busy = false;
  let turnAnimation: Animation | undefined;
  let shuffleNode: HTMLElement | undefined, shuffleTarget: HTMLElement | undefined;
  const flights = new Set<{ node: HTMLElement; animation: Animation }>();
  const coverCopies = new Set<HTMLElement>();
  function capture(): Face {
    const node = front.cloneNode(true) as HTMLElement;
    node.removeAttribute('id'); node.removeAttribute('aria-label'); node.inert = true;
    node.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    node.classList.remove('card-motion', 'awaiting-deal');
    node.style.transform = 'none'; node.style.visibility = 'visible'; node.style.margin = '0';
    const reading = node.querySelector<HTMLElement>('.dossier-content');
    if (reading) reading.scrollTop = front.querySelector<HTMLElement>('.dossier-content')?.scrollTop ?? 0;
    return { element: node, rect: front.getBoundingClientRect(), backs:[...dock.querySelectorAll<HTMLElement>('.detail-underlay')].map(card=>card.innerHTML) };
  }
  function anchor(id: string) {
    return document.querySelector<HTMLElement>(`[data-card-key="${id}"] .case-cover`)?.getBoundingClientRect() ?? new DOMRect(-240, 200, 180, 270);
  }
  function cancel() {
    revision++;
    turnAnimation?.cancel(); turnAnimation = undefined;
    shuffleNode?.remove(); shuffleNode = undefined;
    if (shuffleTarget) shuffleTarget.style.visibility = '';
    shuffleTarget = undefined;
    delete dock.dataset.shufflePhase;
    for (const f of flights) { f.animation.cancel(); f.node.remove(); }
    for (const cover of coverCopies) cover.remove();
    coverCopies.clear();
    flights.clear(); busy = false; dock.classList.remove('deck-in-transit');
    front.style.visibility = ''; motion.pause(front, false);
  }
  function coverInFront(id: string) {
    const cover = document.querySelector<HTMLElement>(`[data-card-key="${id}"] .case-cover`);
    if (!cover) return;
    const rect = cover.getBoundingClientRect(), copy = cover.querySelector('img')!.cloneNode(true) as HTMLElement;
    copy.className = 'transit-cover'; copy.setAttribute('aria-hidden','true'); copy.inert = true;
    Object.assign(copy.style, {left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
    document.body.append(copy); coverCopies.add(copy);
  }
  function fly(face: Face, from: DOMRect, to: DOMRect, index: number, incoming: boolean, delay: number) {
    const node = document.createElement('div'); node.className = 'case-flight'; node.inert = true; node.setAttribute('aria-hidden', 'true');
    node.style.width = face.rect.width + 'px'; node.style.height = face.rect.height + 'px'; node.style.zIndex = String(10000 + (incoming ? 10 : 0) + 3 - index);
    const copy = face.element.cloneNode(true) as HTMLElement;
    copy.style.width = '100%'; copy.style.height = '100%'; copy.style.minHeight = '0';
    if (index > 0) copy.innerHTML = face.backs[2 - index] ?? '';
    node.append(copy); document.body.append(node);
    const transform = (r: DOMRect, rotation: number) => `translate3d(${r.left}px,${r.top}px,0) rotate(${rotation}deg) scale(${r.width / face.rect.width},${r.height / face.rect.height})`;
    const twist = (index - 1) * 3;
    const animation = node.animate([
      { transform: transform(from, incoming ? twist - 5 : twist), opacity: 1 },
      { transform: transform(to, incoming ? twist * .4 : twist - 5), opacity: 1 },
    ], { duration: incoming ? 850 : 620, delay, easing: incoming ? 'cubic-bezier(.18,.76,.2,1)' : 'cubic-bezier(.5,0,.55,1)', fill: 'both' });
    const flight = { node, animation }; flights.add(flight);
    return animation.finished.catch(() => {}).then(() => { node.remove(); flights.delete(flight); });
  }
  function switchCase(oldId: string | undefined, id: string, update: () => void): Promise<void> {
    cancel(); const stamp = revision, outgoing = capture();
    if (oldId !== id) motion.home(front);
    busy = true; motion.pause(front, true);
    update(); const incoming = capture();
    if (reduced.matches || oldId === id) { busy = false; motion.pause(front, false); return Promise.resolve(); }
    dock.classList.add('deck-in-transit'); front.style.visibility = 'hidden';
    // Mobile has a vertical table: keep the same deal motion local to its hand.
    const narrow = innerWidth < 951;
    const source = narrow ? new DOMRect(incoming.rect.left - 70, incoming.rect.top + 50, incoming.rect.width * .7, incoming.rect.height * .7) : anchor(id);
    const destination = narrow ? new DOMRect(outgoing.rect.left - 90, outgoing.rect.top + 60, outgoing.rect.width * .6, outgoing.rect.height * .6) : anchor(oldId ?? id);
    if (!narrow) { if (oldId) coverInFront(oldId); coverInFront(id); }
    const jobs: Promise<void>[] = [];
    for (let i = 2; i >= 0; i--) {
      if (oldId) jobs.push(fly(outgoing, outgoing.rect, destination, i, false, (2 - i) * 60));
      jobs.push(fly(incoming, source, incoming.rect, i, true, 220 + (2 - i) * 90));
    }
    return Promise.all(jobs).then(() => {
      if (stamp !== revision) return;
      for (const cover of coverCopies) cover.remove();
      coverCopies.clear();
      busy = false; front.style.visibility = ''; dock.classList.remove('deck-in-transit'); motion.pause(front, false);
    });
  }
  function turn(previous: Face, oldView: string, view: string, direction = -1) {
    if (busy || !oldView || oldView === view || reduced.matches) return;
    cancel();
    const stamp = revision;
    motion.home(front); motion.pause(front, true);
    const target = dock.querySelector<HTMLElement>(`.detail-underlay:has([data-sheet="${oldView}"])`);
    if (!target) { motion.pause(front, false); return; }
    // Keep the old face opaque until it has cleared the entire fanned hand.
    // Only then lower it to its actual destination layer and slide it home.
    const node = document.createElement('div');
    node.className = 'shuffle-card'; node.inert = true; node.setAttribute('aria-hidden', 'true');
    const copy = previous.element;
    Object.assign(copy.style, { width:'100%', height:'100%', minHeight:'0', maxHeight:'none' });
    node.append(copy); dock.append(node);
    shuffleNode = node; shuffleTarget = target; target.style.visibility = 'hidden';
    // Keep the full exit visible on the table when the hand sits at the viewport edge.
    const exitSide = direction > 0 && front.getBoundingClientRect().right + front.offsetWidth + 170 > innerWidth ? -1 : direction;
    const clear = `translate3d(${exitSide * (front.offsetWidth + 170)}px,-18px,0) rotate(${exitSide * 9}deg)`;
    const home = getComputedStyle(target).transform;
    node.style.zIndex = '20'; dock.dataset.shufflePhase = 'out';
    turnAnimation = node.animate([{transform:'none'}, {transform:clear}], {
      duration:420, easing:'cubic-bezier(.4,0,.2,1)', fill:'forwards',
    });
    void turnAnimation.finished.then(async () => {
      if (stamp !== revision) return;
      node.style.zIndex = getComputedStyle(target).zIndex;
      dock.dataset.shufflePhase = 'behind';
      turnAnimation!.cancel();
      turnAnimation = node.animate([{transform:clear}, {transform:home}], {
        duration:520, easing:'cubic-bezier(.2,.7,.2,1)', fill:'forwards',
      });
      await turnAnimation.finished;
      if (stamp !== revision) return;
      target.style.visibility = ''; node.remove();
      shuffleNode = shuffleTarget = undefined; turnAnimation = undefined;
      delete dock.dataset.shufflePhase; motion.pause(front, false);
    }).catch(() => {});
  }
  window.addEventListener('resize', cancel);
  reduced.addEventListener('change', cancel);
  return { capture, switchCase, turn, cancel };
}
