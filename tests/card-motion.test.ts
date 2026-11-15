import test from 'node:test';
import assert from 'node:assert/strict';
import { createCardMotion } from '../src/card-motion.ts';

// Model visibility and frame delivery, including the offscreen entrance that
// originally caused continuous work on every hidden card.
function setup(phone = false, reduced = false) {
  let now = 0, id = 0, writes = 0;
  const pending = new Map<number, FrameRequestCallback>();
  const doc = Object.assign(new EventTarget(), { hidden:false });
  const win = new EventTarget();
  const media = Object.assign(new EventTarget(), {matches:reduced});
  let notify: IntersectionObserverCallback;
  Object.assign(globalThis, {
    document:doc, window:win, innerWidth:1200,
    matchMedia:(query:string)=>query.includes('reduce') ? media : Object.assign(new EventTarget(),{matches:phone}),
    requestAnimationFrame:(fn:FrameRequestCallback)=>{ pending.set(++id,fn); return id; },
    cancelAnimationFrame:(key:number)=>pending.delete(key),
    IntersectionObserver:class { constructor(fn:IntersectionObserverCallback){notify=fn;} observe(){} unobserve(){} },
  });
  let transform='';
  const classes=new Set<string>();
  const card=Object.assign(new EventTarget(),{
    classList:{add:(...xs:string[])=>xs.forEach(x=>classes.add(x)),remove:(...xs:string[])=>xs.forEach(x=>classes.delete(x)),toggle:(x:string,on:boolean)=>on?classes.add(x):classes.delete(x)},
    dataset:{},style:{get transform(){return transform;},set transform(v:string){transform=v;writes++;}},
    getBoundingClientRect:()=>({left:800,right:1100,top:0,bottom:600,width:300,height:600}),
    matches:()=>false,querySelector:()=>null,remove:()=>{},
  });
  const motion=createCardMotion();
  motion.mount(card as any,phone?'right':'left');
  return {motion,card,classes,doc,win,media,pending,writes:()=>writes,pose:()=>transform,
    visibility:(visible:boolean)=>notify([{target:card,isIntersecting:visible}] as any,{} as any),
    step:(count=1)=>{for(let i=0;i<count;i++){now+=1000/60;const jobs=[...pending.values()];pending.clear();jobs.forEach(fn=>fn(now));}},
  };
}

test('entrance completes even while its transformed card is offscreen; hidden cards stop consuming frames',()=>{
  const s=setup();s.visibility(true);s.step();s.visibility(false);s.step(240);
  assert.match(s.pose(),/^translate3d\(0.000px,0.000px,0\)/);
  assert.equal(s.pending.size,0);assert.equal(s.classes.has('awaiting-deal'),false);
  const writes=s.writes();s.step(60);assert.equal(s.writes(),writes);
  s.visibility(true);s.step(10);assert.equal(s.pending.size,1);assert.ok(s.writes()>writes);
});

test('mobile reading card settles without a perpetual animation loop',()=>{
  const s=setup(true);s.visibility(true);s.step(240);
  assert.equal(s.pending.size,0);assert.equal(s.classes.has('motion-active'),false);
});

test('hidden page cancels frames and restoring it resumes visible floating',()=>{
  const s=setup();s.visibility(true);s.step(160);
  s.doc.hidden=true;s.doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(s.pending.size,0);
  s.doc.hidden=false;s.doc.dispatchEvent(new Event('visibilitychange'));s.step(10);
  assert.equal(s.pending.size,1);
});

test('reduced motion and a paused deal remain flat without continuous repainting',()=>{
  const s=setup(false,true);s.visibility(true);s.step(10);assert.equal(s.pending.size,0);
  s.media.matches=false;s.media.dispatchEvent(new Event('change'));s.step(10);assert.equal(s.pending.size,1);
  s.motion.pause(s.card as any,true);s.step(2);assert.equal(s.pending.size,0);
  s.motion.pause(s.card as any,false);s.step(2);assert.equal(s.pending.size,1);
});
