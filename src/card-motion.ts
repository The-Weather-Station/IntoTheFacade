type CardState = {
  side: 'left' | 'right'; delay: number; visible: boolean; dealt: boolean;
  motion?: Animation; exit?: Animation; view?: string;
};

// Layout stays in normal flow. WAAPI handles the deal; CSS adds a separate,
// low-amplitude drift and pointer tilt, without a canvas or animation library.
export function createCardMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const states = new Map<HTMLElement, CardState>();
  const neutral = 'perspective(1100px) translate3d(0,0,0) rotate(0deg) scale(1)';

  function rest(card: HTMLElement) {
    card.style.setProperty('--card-rx','0deg'); card.style.setProperty('--card-ry','0deg');
    card.style.setProperty('--card-lift','0px'); card.style.setProperty('--card-scale','1');
  }
  function deal(card: HTMLElement, state: CardState) {
    state.dealt=true; card.classList.remove('awaiting-deal');
    if(reduced.matches) return;
    const phoneDossier = state.side==='right' && matchMedia('(max-width: 580px)').matches;
    const direction = state.side==='left' ? -1 : 1;
    state.motion?.cancel();
    card.classList.add('is-dealing');
    const animation=card.animate([
      {opacity:0, transform:phoneDossier?'translateY(28px)':`perspective(1100px) translate3d(${direction*65}px,48px,0) rotate(${direction*7}deg) scale(.88)`},
      {opacity:1, transform:phoneDossier?'translateY(-3px)':`perspective(1100px) translate3d(${-direction*4}px,-6px,0) rotate(${-direction*.7}deg) scale(1.012)`, offset:.76},
      {opacity:1, transform:neutral},
    ],{duration:phoneDossier?420:660,delay:state.delay,easing:'cubic-bezier(.18,.75,.24,1)',fill:'backwards'});
    state.motion=animation;
    animation.onfinish=()=>{if(state.motion===animation){state.motion=undefined;card.classList.remove('is-dealing');}};
  }
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries) {
      const card=entry.target as HTMLElement, state=states.get(card);
      if(!state)continue;
      state.visible=entry.isIntersecting;
      card.dataset.inView=String(state.visible);
      if(state.visible&&!state.dealt&&!state.exit)deal(card,state);
      if(!state.visible)rest(card);
    }
  },{threshold:0});

  function mount(card: HTMLElement, side: CardState['side'], index=0) {
    const current=states.get(card);
    if(current) {
      const interrupted=current.exit;
      const style=interrupted?getComputedStyle(card):undefined;
      const from=style?{opacity:style.opacity,transform:style.transform}:undefined;
      interrupted?.cancel(); current.exit=undefined; card.inert=false;
      card.classList.remove('is-leaving');
      if(from&&!reduced.matches) {
        const animation=card.animate([from,{opacity:1,transform:neutral}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'});
        current.motion=animation;
        animation.onfinish=()=>{if(current.motion===animation)current.motion=undefined;};
      }
      return current;
    }
    const state:CardState={side,delay:Math.min(index*95,190),visible:false,dealt:false};
    states.set(card,state);
    card.classList.add('card-motion'); card.dataset.cardSide=side;
    card.style.setProperty('--float-phase',`${-index*1.7}s`);
    if(!reduced.matches)card.classList.add('awaiting-deal');
    card.addEventListener('pointermove',event=>{
      if(event.pointerType!=='mouse'||!finePointer.matches||reduced.matches||state.exit||card.classList.contains('is-dealing'))return;
      const rect=card.getBoundingClientRect();
      const x=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));
      const y=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));
      const amount=side==='right'?.65:4.5;
      card.style.setProperty('--card-rx',`${-y*amount}deg`);
      card.style.setProperty('--card-ry',`${x*amount}deg`);
      card.style.setProperty('--card-lift',side==='right'?'-1px':'-4px');
      card.style.setProperty('--card-scale',side==='right'?'1.002':'1.025');
    });
    card.addEventListener('pointerleave',()=>rest(card));
    card.addEventListener('pointercancel',()=>rest(card));
    card.addEventListener('pointerdown',event=>{
      if(event.pointerType==='touch'||reduced.matches||state.exit)return;
      card.style.setProperty('--card-scale',side==='right'?'1':'.985');
    });
    card.addEventListener('pointerup',event=>{
      if(event.pointerType==='mouse'&&finePointer.matches&&!reduced.matches&&card.matches(':hover')) {
        card.style.setProperty('--card-scale',side==='right'?'1.002':'1.025');
      } else rest(card);
    });
    observer.observe(card);
    return state;
  }
  function destroy(card: HTMLElement) {
    const state=states.get(card); state?.motion?.cancel(); state?.exit?.cancel();
    observer.unobserve(card); states.delete(card); card.remove();
  }
  function leave(card: HTMLElement) {
    const state=states.get(card);
    if(state?.exit)return;
    if(!state||!state.visible||reduced.matches){destroy(card);return;}
    const style=getComputedStyle(card), from={opacity:style.opacity,transform:style.transform};
    state.motion?.cancel(); card.classList.remove('is-dealing','awaiting-deal');
    card.classList.add('is-leaving'); card.inert=true;
    const animation=card.animate([from,{opacity:0,transform:'translate3d(-35px,18px,0) rotate(-4deg) scale(.94)'}],{duration:190,easing:'ease-in',fill:'forwards'});
    state.exit=animation;
    animation.onfinish=()=>{if(state.exit===animation)destroy(card);};
  }
  function revealDossier(card: HTMLElement, content: HTMLElement, view: string) {
    const state=mount(card,'right',2), previous=state.view;
    state.view=view;
    if(!previous||previous===view||reduced.matches||!state.visible)return;
    content.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'});
    if(state.motion)return;
    // Small re-settle on a tab change; the long phone dossier stays level.
    const phone=matchMedia('(max-width: 580px)').matches;
    const from=getComputedStyle(card).transform;
    const animation=card.animate([{transform:from},{transform:phone?'translateY(-3px)':'perspective(1100px) translate3d(-4px,-5px,0) rotate(-.55deg)',offset:.4},{transform:from}],{duration:440,easing:'cubic-bezier(.22,.8,.3,1)'});
    state.motion=animation;
    animation.onfinish=()=>{if(state.motion===animation)state.motion=undefined;};
  }
  reduced.addEventListener('change',()=>{
    for(const [card,state] of states) {
      rest(card); state.motion?.cancel(); state.motion=undefined;
      card.classList.remove('awaiting-deal','is-dealing');
      if(state.exit)destroy(card);
      else state.dealt=true;
    }
  });
  return {mount,leave,revealDossier};
}
