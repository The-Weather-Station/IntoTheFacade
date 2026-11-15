import { artUrl } from './generated-art';
import type { Place } from './data';
import type { createCardMotion } from './card-motion';
import { deckViews } from './deck-order';
import { createCardSounds } from './card-sounds';
import { preloadCardStock, cardStockReady } from './card-stock';

export const covers: Record<string, { asset: string; title: string; context: string; alt: string }> = {
  'stockyard-airsoft': { asset: 'missing-road-card', title: 'MISSING ROAD!!', context: 'One road. Two maps.', alt: 'Illustrated MISSING ROAD!! card with a vanishing road and occult eye' },
  'eagle-industries': { asset: 'illegal-dumping-card', title: 'ILLEGAL DUMPING!!', context: 'The shop closed. The solvent stayed.', alt: 'Illustrated ILLEGAL DUMPING!! card: Eagle Industries with theatrical toxic spills; not a photograph of site conditions' },
  'rhode-island-warehouse': { asset: 'organized-crime-card-cutout', title: 'ORGANIZED CRIME!!!', context: 'Suite 109 · the 2025 shipping case.', alt: 'Illustrated ORGANIZED CRIME!!! card: marijuana spilling from a cut couch with a theatrical blood pool behind it; decorative dramatization, not evidence photography' },
};
export function caseStack(p: Place, active: boolean) {
  const c = covers[p.id];
  const count = deckViews(p.id).length;
  return `<article class="case-stack ${active ? 'selected' : ''}" data-card-key="${p.id}" data-place="${p.id}">
    <div class="stack-visual">${Array.from({length:count},(_,i)=>`<span class="stack-back" style="--stack-i:${count-i}" aria-hidden="true"></span>`).join('')}
      <button class="case-cover" data-select="${p.id}" aria-pressed="${active}" aria-label="Open ${p.name} case stack: ${c.title}"><img src="${artUrl(c.asset)}" alt="${c.alt}" width="1024" height="1536" decoding="async"></button>
    </div>
    <div class="stack-caption"><span class="eyebrow">CASE ${p.number} / ${p.evidence.length} RECORDS</span><h3>${p.name}</h3><p>${c.context}</p><span class="stack-state">${active ? `${count} CARDS ON THE TABLE` : `DEAL ${count} CARDS ↗`}</span></div>
  </article>`;
}

type Face = { element: HTMLElement; rect: DOMRect; backs: string[] };
// Transit copies are inert and short-lived. The real, full-size dossier is the
// only interactive reading surface, so no scaled copy can retain focus or IDs.
export function createCaseDeck(front: HTMLElement, dock: HTMLElement, motion: ReturnType<typeof createCardMotion>) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sounds = createCardSounds();
  preloadCardStock();
  let revision = 0, busy = false;
  let turnAnimation: Animation | undefined;
  let shuffleNode: HTMLElement | undefined, shuffleTarget: HTMLElement | undefined;
  const flights = new Set<{ node: HTMLElement; animation: Animation }>();
  const arrivals = new Set<Animation>();
  const returningStacks = new Set<HTMLElement>();
  const indexFrame = document.querySelector<HTMLElement>('.discovery')!;
  function capture(): Face {
    const node = front.cloneNode(true) as HTMLElement;
    node.removeAttribute('id'); node.removeAttribute('aria-label'); node.inert = true;
    node.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    node.classList.remove('card-motion', 'awaiting-deal');
    node.style.transform = 'none'; node.style.visibility = 'visible'; node.style.margin = '0';
    const reading = node.querySelector<HTMLElement>('.dossier-content');
    if (reading) reading.scrollTop = front.querySelector<HTMLElement>('.dossier-content')?.scrollTop ?? 0;
    return { element: node, rect: front.getBoundingClientRect(), backs:[...dock.querySelectorAll<HTMLElement>('.detail-underlay:not([hidden])')].map(card=>card.innerHTML) };
  }
  function anchor(id: string) {
    return document.querySelector<HTMLElement>(`[data-card-key="${id}"] .case-cover`)?.getBoundingClientRect() ?? new DOMRect(-240, 200, 180, 270);
  }
  function cancel() {
    revision++;
    sounds.stop();
    turnAnimation?.cancel(); turnAnimation = undefined;
    shuffleNode?.remove(); shuffleNode = undefined;
    if (shuffleTarget) shuffleTarget.style.visibility = '';
    shuffleTarget = undefined;
    delete dock.dataset.shufflePhase;
    for (const f of flights) { f.animation.cancel(); f.node.remove(); }
    for (const animation of arrivals) animation.cancel();
    arrivals.clear();
    for (const stack of returningStacks) stack.classList.remove('cards-returning');
    returningStacks.clear(); indexFrame.classList.remove('deck-index-in-transit');
    flights.clear(); busy = false; dock.classList.remove('deck-in-transit','deck-receiving');
    front.inert = false;
    front.style.visibility = ''; motion.pause(front, false);
  }
  async function revealMobileHand(stamp: number) {
    dock.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
    if (reduced.matches) return;
    // Deal after the reading surface arrives on screen, not while it is still
    // below the map. Watch actual scroll movement rather than guessing a delay.
    await new Promise<void>(resolve => {
      let lastTop = NaN, stableFrames = 0;
      const started = performance.now();
      const check = (now: number) => {
        if (stamp !== revision) { resolve(); return; }
        const top = dock.getBoundingClientRect().top;
        stableFrames = Math.abs(top - lastTop) < .5 ? stableFrames + 1 : 0;
        lastTop = top;
        if ((stableFrames >= 4 && top < innerHeight * .4) || now - started > 1800) { resolve(); return; }
        requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    });
  }
  function dealFrom(source: DOMRect) {
    // Animate the actual reading surfaces. They finish on their exact CSS poses,
    // so there is no scaled/rotated clone to swap out at the landing frame.
    const cards = [...dock.querySelectorAll<HTMLElement>('.detail-underlay:not([hidden])'),front];
    const parent = dock.getBoundingClientRect();
    const narrow = innerWidth < 951;
    return cards.map((card,index)=>{
      const home = getComputedStyle(card).transform;
      const centerX = parent.left + dock.clientLeft + card.offsetLeft - dock.scrollLeft + card.offsetWidth / 2;
      const centerY = parent.top + dock.clientTop + card.offsetTop - dock.scrollTop + card.offsetHeight / 2;
      const x = source.left + source.width / 2 - centerX;
      const y = source.top + source.height / 2 - centerY;
      const start = `translate3d(${x}px,${y}px,0) rotate(${-7+index*3}deg) scale(${source.width/card.offsetWidth},${source.height/card.offsetHeight})`;
      const animation = card.animate([{transform:start},{transform:home}],{
        duration:narrow ? 1450 : 950,delay:180+index*(narrow ? 110 : 75),easing:narrow ? 'cubic-bezier(.25,.55,.25,1)' : 'cubic-bezier(.16,.8,.2,1)',fill:'both',
      });
      arrivals.add(animation);
      return animation.finished.then(()=>{},()=>{});
    });
  }
  function fly(face: Face, from: DOMRect, to: DOMRect, index: number, incoming: boolean, delay: number) {
    const node = document.createElement('div'); node.className = 'case-flight'; node.inert = true; node.setAttribute('aria-hidden', 'true');
    node.style.width = face.rect.width + 'px'; node.style.height = face.rect.height + 'px'; node.style.zIndex = String(10000 + (incoming ? 10 : 0) + face.backs.length + 1 - index);
    const copy = face.element.cloneNode(true) as HTMLElement;
    copy.style.width = '100%'; copy.style.height = '100%'; copy.style.minHeight = '0';
    if (index > 0) copy.innerHTML = face.backs[face.backs.length - index] ?? '';
    node.append(copy); document.body.append(node);
    const transform = (r: DOMRect, rotation: number) => `translate3d(${r.left}px,${r.top}px,0) rotate(${rotation}deg) scale(${r.width / face.rect.width},${r.height / face.rect.height})`;
    const twist = (index - 1) * 3;
    const animation = node.animate([
      { transform: transform(from, incoming ? twist - 5 : twist), opacity: 1 },
      { transform: transform(to, incoming ? twist * .4 : twist - 5), opacity: 1 },
    ], { duration: incoming ? 850 : innerWidth < 951 ? 850 : 620, delay, easing: incoming ? 'cubic-bezier(.18,.76,.2,1)' : 'cubic-bezier(.5,0,.55,1)', fill: 'both' });
    const flight = { node, animation }; flights.add(flight);
    return animation.finished.catch(() => {}).then(() => { node.remove(); flights.delete(flight); });
  }
  async function switchCase(oldId: string | undefined, id: string, update: () => void): Promise<void> {
    cancel(); const stamp = revision, outgoing = capture();
    if (oldId !== id) motion.home(front);
    busy = true; motion.pause(front, true);
    update();
    const narrow = innerWidth < 951;
    if (reduced.matches || oldId === id) {
      busy = false; motion.pause(front, false);
      if (narrow) await revealMobileHand(stamp);
      return;
    }
    dock.classList.add('deck-in-transit'); front.inert = true; front.style.visibility = 'hidden';
    const stockReady = await cardStockReady(id);
    if (stamp !== revision) return;
    if (!stockReady) { cancel(); return; }
    if (narrow) await revealMobileHand(stamp);
    if (stamp !== revision) return;
    const incoming = capture();
    if (narrow) outgoing.rect = new DOMRect(incoming.rect.left, incoming.rect.top, outgoing.rect.width, outgoing.rect.height);
    if (oldId) sounds.play('return');
    sounds.play('deal');
    dock.classList.add('deck-receiving'); front.style.visibility = '';
    // Mobile has a vertical table: keep the same deal motion local to its hand.
    const source = narrow ? new DOMRect(incoming.rect.left - 100, incoming.rect.top + 60, incoming.rect.width * .7, incoming.rect.height * .7) : anchor(id);
    const destination = narrow ? new DOMRect(outgoing.rect.left - 90, outgoing.rect.top + 60, outgoing.rect.width * .6, outgoing.rect.height * .6) : anchor(oldId ?? id);
    // Keep the real covers above the flights, including while the index scrolls.
    // A fixed duplicate cover would visibly separate from its moving original.
    if (!narrow) indexFrame.classList.add('deck-index-in-transit');
    const returning = oldId ? document.querySelector<HTMLElement>(`[data-card-key="${oldId}"]`) : null;
    if (returning) { returning.classList.add('cards-returning'); returningStacks.add(returning); }
    const jobs: Promise<void>[] = [];
    const returnJobs: Promise<void>[] = [];
    if (oldId) {
      for (let i = outgoing.backs.length; i >= 0; i--) {
        const job = fly(outgoing, outgoing.rect, destination, i, false, (outgoing.backs.length - i) * 60);
        jobs.push(job); returnJobs.push(job);
      }
    }
    jobs.push(...dealFrom(source));
    void Promise.all(returnJobs).then(() => {
      if (stamp !== revision || !returning) return;
      returning.classList.remove('cards-returning'); returningStacks.delete(returning);
    });
    return Promise.all(jobs).then(() => {
      if (stamp !== revision) return;
      const cards = [...dock.querySelectorAll<HTMLElement>('.detail-underlay:not([hidden])'),front];
      const before = import.meta.env.DEV ? cards.map(card=>card.getBoundingClientRect()) : [];
      for (const animation of arrivals) animation.cancel();
      arrivals.clear();
      indexFrame.classList.remove('deck-index-in-transit');
      busy = false; front.inert = false; front.style.visibility = ''; dock.classList.remove('deck-in-transit','deck-receiving');
      if (import.meta.env.DEV) {
        const delta = cards.reduce((max,card,i)=>{
          const after=card.getBoundingClientRect(),prior=before[i];
          return Math.max(max,Math.abs(after.left-prior.left),Math.abs(after.top-prior.top),Math.abs(after.width-prior.width),Math.abs(after.height-prior.height));
        },0);
        console.debug(`[card-deck] Landing handoff shift: ${delta.toFixed(3)}px`);
      }
      motion.pause(front, false);
    });
  }
  function turn(previous: Face, oldView: string, view: string, direction = -1) {
    if (busy || !oldView || oldView === view || reduced.matches) return;
    cancel();
    const stamp = revision;
    motion.home(front); motion.pause(front, true);
    const target = dock.querySelector<HTMLElement>(`.detail-underlay:has([data-sheet="${oldView}"])`);
    if (!target) { motion.pause(front, false); return; }
    sounds.play('shuffle');
    // Keep the old face opaque until it has cleared the entire fanned hand.
    // Only then lower it to its actual destination layer and slide it home.
    const node = document.createElement('div');
    node.className = 'shuffle-card'; node.inert = true; node.setAttribute('aria-hidden', 'true');
    const copy = previous.element;
    Object.assign(copy.style, { width:'100%', height:'100%', minHeight:'0', maxHeight:'none' });
    node.append(copy); dock.append(node);
    shuffleNode = node; shuffleTarget = target; target.style.visibility = 'hidden';
    // Honor the chosen direction even at the viewport edge; lower the card's
    // layer only after it has fully exited, then return it behind the stack.
    const narrow = innerWidth < 951;
    const clear = `translate3d(${direction * (front.offsetWidth + (narrow ? 64 : 170))}px,-18px,0) rotate(${direction * 9}deg)`;
    const home = getComputedStyle(target).transform;
    node.style.zIndex = '20'; dock.dataset.shufflePhase = 'out';
    turnAnimation = node.animate([{transform:'none'}, {transform:clear}], {
      duration:narrow ? 760 : 420, easing:'cubic-bezier(.4,0,.2,1)', fill:'forwards',
    });
    void turnAnimation.finished.then(async () => {
      if (stamp !== revision) return;
      node.style.zIndex = getComputedStyle(target).zIndex;
      dock.dataset.shufflePhase = 'behind';
      turnAnimation!.cancel();
      turnAnimation = node.animate([{transform:clear}, {transform:home}], {
        duration:narrow ? 860 : 520, easing:'cubic-bezier(.2,.7,.2,1)', fill:'forwards',
      });
      await turnAnimation.finished;
      if (stamp !== revision) return;
      target.style.visibility = ''; node.remove();
      shuffleNode = shuffleTarget = undefined; turnAnimation = undefined;
      delete dock.dataset.shufflePhase; motion.pause(front, false);
    }).catch(() => {});
  }
  // Mobile browser chrome changes viewport height during scrolling. That must
  // not cancel a deal; only a new layout width invalidates the card geometry.
  let layoutWidth = innerWidth;
  window.addEventListener('resize', () => {
    if (innerWidth === layoutWidth) return;
    layoutWidth = innerWidth; cancel();
  });
  reduced.addEventListener('change', cancel);
  return { capture, switchCase, turn, cancel };
}
