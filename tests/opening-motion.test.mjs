import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningMotion,OPENING_ENTRY_MS} from '../src/opening/motion.js';

test('idle model rotates at a consistent speed without jumping after hidden tabs or long frames',()=>{
 const m=createOpeningMotion();let state;for(let i=0;i<300;i++)state=m.step(1000/30);
 assert(Math.abs(state.angle-Math.PI/9)<1e-10);
 const angle=state.angle;assert.equal(m.step(60000,false).angle,angle);
 assert(m.step(60000).angle-angle<.003);m.dispose();
});
test('pause and reduced motion independently stop rotation',()=>{
 const m=createOpeningMotion();const angle=m.step(40).angle;m.pause(true);assert.equal(m.step(40).angle,angle);
 m.pause(false);m.reduce(true);assert.equal(m.step(40).angle,angle);m.reduce(false);assert(m.step(40).angle>angle);m.dispose();
});
test('entry freezes rotation, advances monotonically, and reveals only after its visible-frame duration',async()=>{
 const m=createOpeningMotion();const angle=m.step(40).angle;let finished=false;
 const done=m.enter().then(value=>{finished=value;});let lastTravel=0,lastFade=0,state;
 for(let elapsed=0;elapsed<OPENING_ENTRY_MS-20;elapsed+=20){state=m.step(20);assert.equal(state.angle,angle);assert(state.travel>=lastTravel);assert(state.fade>=lastFade);assert(state.fade>=0&&state.fade<=1);lastTravel=state.travel;lastFade=state.fade;}
 await Promise.resolve();assert.equal(finished,false);assert.equal(m.step(10000,false).progress,state.progress);
 state=m.step(20);await done;assert.equal(finished,true);assert.equal(state.travel,1);assert.equal(state.fade,1);m.dispose();
});
test('double entry shares one pending animation and disposal cancels the handoff',async()=>{
 const m=createOpeningMotion();const a=m.enter(),b=m.enter();assert.equal(a,b);m.step(40);m.dispose();assert.equal(await a,false);assert.equal(await m.enter(),false);assert.equal(m.step(40).angle,0);
});
test('reduced motion uses a brief dissolve with no camera movement',async()=>{
 const m=createOpeningMotion({reduced:true}),done=m.enter();let state;for(let i=0;i<9;i++){state=m.step(20);assert.equal(state.travel,0);assert.equal(state.angle,0);}assert.equal(await done,true);assert.equal(state.fade,1);m.dispose();
});
test('turning reduced motion on during a camera move finishes safely without further zoom',async()=>{
 const m=createOpeningMotion(),done=m.enter();for(let i=0;i<20;i++)m.step(20);m.reduce(true);const state=m.step(20);assert.equal(state.travel,0);assert.equal(state.fade,1);assert.equal(await done,true);m.dispose();
});
