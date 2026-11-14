import test from 'node:test';
import assert from 'node:assert/strict';
import { createMapCamera } from '../src/map-camera.ts';

class ElementStub extends EventTarget {
  hidden = true;
  textContent = '';
  attrs = new Map<string,string>();
  captures = new Set<number>();
  classList = {toggle:()=>{}};
  setAttribute(key:string,value:string) { this.attrs.set(key,value); }
  hasPointerCapture(id:number) { return this.captures.has(id); }
  setPointerCapture(id:number) { this.captures.add(id); }
  releasePointerCapture(id:number) { this.captures.delete(id); }
}
function setup() {
  const canvas=new ElementStub(),pan=new ElementStub(),orbit=new ElementStub(),hint=new ElementStub(),readout=new ElementStub();
  const controls=Object.assign(new ElementStub(),{querySelector:(s:string)=>({'[data-camera="pan"]':pan,'[data-camera="orbit"]':orbit,'.camera-hint':hint,'.camera-readout':readout}[s])});
  let panning=true,pitch=30,bearing=0;
  const changes:any[]=[],handlers=new Map<string,()=>void>();
  const map={getCanvas:()=>canvas,dragPan:{isEnabled:()=>panning,enable:()=>{panning=true},disable:()=>{panning=false}},stop:()=>{},getPitch:()=>pitch,getBearing:()=>bearing,getMinPitch:()=>0,getMaxPitch:()=>85,
    jumpTo:(position:{pitch:number,bearing:number})=>{changes.push(position);pitch=position.pitch;bearing=position.bearing;handlers.get('pitch')?.();handlers.get('rotate')?.()},
    on:(name:string,handler:()=>void)=>handlers.set(name,handler),off:(name:string)=>handlers.delete(name)};
  const camera=createMapCamera(map as any,controls as any);
  const pointer=(type:string,id:number,x=100,y=100)=>canvas.dispatchEvent(Object.assign(new Event(type,{cancelable:true}),{pointerId:id,clientX:x,clientY:y,pointerType:'touch',button:0}));
  return {canvas,pan,orbit,controls,camera,changes,handlers,pointer,panning:()=>panning};
}
test('one-finger camera drag is opt-in; rotate and pitch together without panning',()=>{
  const s=setup();s.pointer('pointerdown',1);s.pointer('pointermove',1,150,50);
  assert.equal(s.changes.length,0);assert.equal(s.panning(),true);
  s.orbit.dispatchEvent(new Event('click'));s.pointer('pointerdown',1);s.pointer('pointermove',1,150,50);
  assert.deepEqual(s.changes.at(-1),{bearing:20,pitch:45});assert.equal(s.panning(),false);
  s.pointer('pointermove',1,150,-1000);assert.equal(s.changes.at(-1).pitch,70);
  s.pointer('pointermove',1,150,1000);assert.equal(s.changes.at(-1).pitch,0);
  s.pointer('pointerup',1);s.pointer('pointermove',1,200,200);assert.equal(s.changes.length,3);
});
test('a second finger hands control to native gestures until all fingers lift',()=>{
  const s=setup();s.orbit.dispatchEvent(new Event('click'));
  s.pointer('pointerdown',1);s.pointer('pointerdown',2);s.pointer('pointermove',1,120,120);
  s.pointer('pointerup',2);s.pointer('pointermove',1,140,140);assert.equal(s.changes.length,0);
  s.pointer('pointerup',1);s.pointer('pointerdown',3);s.pointer('pointermove',3,120,100);
  assert.equal(s.changes.at(-1).bearing,8);
});
test('cancel, mode reset, and renderer removal release captured pointers and handlers',()=>{
  const s=setup();s.orbit.dispatchEvent(new Event('click'));s.pointer('pointerdown',1);s.pointer('pointercancel',1);
  s.pointer('pointermove',1,140,140);assert.equal(s.changes.length,0);assert.equal(s.canvas.captures.size,0);
  s.pointer('pointerdown',2);s.camera.reset();assert.equal(s.canvas.captures.size,0);assert.equal(s.panning(),true);
  s.orbit.dispatchEvent(new Event('click'));s.camera.destroy();s.orbit.dispatchEvent(new Event('click'));
  assert.equal(s.panning(),true);assert.equal(s.handlers.size,0);assert.equal(s.controls.hidden,true);
});
test('orbit mode offers equivalent keyboard camera control',()=>{
  const s=setup();s.orbit.dispatchEvent(new Event('click'));
  s.canvas.dispatchEvent(Object.assign(new Event('keydown',{cancelable:true}),{key:'ArrowRight'}));
  s.canvas.dispatchEvent(Object.assign(new Event('keydown',{cancelable:true}),{key:'ArrowUp'}));
  assert.deepEqual(s.changes.at(-1),{bearing:10,pitch:35});
});
