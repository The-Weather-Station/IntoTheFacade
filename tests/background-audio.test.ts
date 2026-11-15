import test from 'node:test';
import assert from 'node:assert/strict';
import { initBackgroundAudio } from '../src/background-audio.ts';

class ElementStub extends EventTarget {
  hidden=false;value='';textContent='';innerHTML='';dataset={};attrs=new Map<string,string>();
  setAttribute(k:string,v:string){this.attrs.set(k,v);} getAttribute(k:string){return this.attrs.get(k)??null;}
  closest(){return null;}
  get src(){return this.attrs.get('src')??'';} set src(v:string){this.attrs.set('src',v);}
}
function setup() {
  const toggle=new ElementStub(),volume=new ElementStub(),status=new ElementStub(),welcome=new ElementStub(),close=new ElementStub(),playButton=new ElementStub();
  const panel=Object.assign(new ElementStub(),{querySelector:(s:string)=>({'button':toggle,'input':volume,'[role=status]':status}[s])});
  const attempts:{resolve:()=>void;reject:(e:Error)=>void}[]=[];
  const audio=Object.assign(new ElementStub(),{paused:true,volume:.16,loop:false,preload:'',
    play(){this.paused=false;return new Promise<void>((resolve,reject)=>attempts.push({resolve,reject}));},
    pause(){this.paused=true;},
  });
  const doc=Object.assign(new EventTarget(),{hidden:false,createElement:()=>audio,body:{append:()=>{}},
    querySelector:(s:string)=>({'#soundtrack-control':panel,'#sound-welcome':welcome,'#sound-welcome-close':close,'#sound-welcome-play':playButton}[s])});
  const win=new EventTarget(),storage=new Map<string,string>();
  Object.assign(globalThis,{document:doc,window:win,Element:ElementStub,localStorage:{getItem:(k:string)=>storage.get(k)??null,setItem:(k:string,v:string)=>storage.set(k,v)}});
  initBackgroundAudio('/music.mp3');
  return {doc,win,audio,attempts,toggle,welcome,close,status};
}
const flush=async()=>{await Promise.resolve();await Promise.resolve();};

test('audio stays lazy; repeated scroll/click inputs share a single play attempt',async()=>{
  const s=setup();assert.equal(s.audio.src,'');assert.equal(s.attempts.length,0);
  s.doc.dispatchEvent(new Event('wheel'));s.doc.dispatchEvent(new Event('wheel'));s.doc.dispatchEvent(new Event('click'));
  assert.equal(s.attempts.length,1);s.attempts[0].resolve();await flush();
  s.doc.dispatchEvent(new Event('wheel'));assert.equal(s.attempts.length,1);assert.equal(s.audio.paused,false);
});

test('a blocked scroll leaves a tap retry available',async()=>{
  const s=setup();s.doc.dispatchEvent(new Event('wheel'));
  s.attempts[0].reject(Object.assign(new Error('blocked'),{name:'NotAllowedError'}));s.audio.paused=true;await flush();
  s.doc.dispatchEvent(new Event('click'));assert.equal(s.attempts.length,2);
});

test('hide during loading invalidates the stale promise and resumes only one new attempt',async()=>{
  const s=setup();s.doc.dispatchEvent(new Event('click'));
  s.doc.hidden=true;s.doc.dispatchEvent(new Event('visibilitychange'));assert.equal(s.audio.paused,true);
  s.doc.hidden=false;s.doc.dispatchEvent(new Event('visibilitychange'));assert.equal(s.attempts.length,2);
  s.attempts[0].reject(Object.assign(new Error('old request'),{name:'AbortError'}));await flush();
  s.doc.dispatchEvent(new Event('click'));assert.equal(s.attempts.length,2);
  s.attempts[1].resolve();await flush();assert.equal(s.audio.paused,false);
});

test('back/forward restore shows the reminder and resumes music, respecting explicit pause',async()=>{
  const s=setup();s.doc.dispatchEvent(new Event('click'));s.attempts[0].resolve();await flush();
  s.close.dispatchEvent(new Event('click'));assert.equal(s.welcome.hidden,true);
  s.win.dispatchEvent(new Event('pagehide'));s.win.dispatchEvent(Object.assign(new Event('pageshow'),{persisted:true}));
  assert.equal(s.welcome.hidden,false);assert.equal(s.attempts.length,2);s.attempts[1].resolve();await flush();
  s.toggle.dispatchEvent(new Event('click'));s.win.dispatchEvent(new Event('pagehide'));
  s.win.dispatchEvent(Object.assign(new Event('pageshow'),{persisted:true}));assert.equal(s.attempts.length,2);assert.equal(s.audio.paused,true);
});
