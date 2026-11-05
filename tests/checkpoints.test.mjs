import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS} from '../src/chapter/levels.js';
import {TOPOLOGY_LEVELS} from '../src/topology/levels.js';
import {LESSONS} from '../src/teaching/lessons.js';
import {initialState,augment} from '../src/chapter/math.js';
import {initialTopologyState,stepTopology} from '../src/topology/math.js';
import {graphCheckpoint,restoreGraph,topologyCheckpoint,restoreTopology,introCheckpoint,restoreIntro,levelFingerprint} from '../src/storage/checkpoints.js';
test('every chapter initial state round-trips as structured data',()=>{
 for(const l of LEVELS){const s=initialState(l),c=graphCheckpoint(l,s),r=restoreGraph(l,JSON.parse(JSON.stringify(c)));assert(r,l.id);assert.deepEqual(r.state,s,l.id);}
 for(const l of TOPOLOGY_LEVELS){const s=initialTopologyState(l),c=topologyCheckpoint(l,s),r=restoreTopology(l,JSON.parse(JSON.stringify(c)));assert(r,l.id);assert.deepEqual(r.state,s,l.id);}
});
test('graph checkpoints retain partial constructions, route drafts, history and camera',()=>{
 const l=LEVELS[7],s=initialState(l);s.draft=['S','A'];s.paths=[['S','B','E','T']];s.view=2;
 const checkpoint=graphCheckpoint(l,s,{history:[initialState(l)],camera:{index:2,overhead:false,zoom:1.4},selected:'SA',interaction:'flow',feedback:'线索',tested:true});
 const r=restoreGraph(l,checkpoint);assert.deepEqual(r.state,s);assert.equal(r.history.length,1);assert.equal(r.camera.index,2);assert.equal(r.camera.zoom,1.4);assert.equal(r.feedback,'线索');assert.equal(r.tested,true);
 const proof=initialState(l);proof.phase=1;proof.certificates=['路线已验证'];assert.equal(restoreGraph(l,graphCheckpoint(l,proof)).state.phase,1);
});
test('partially edited flows and reverse augmentations are restored faithfully',()=>{
 const l=LEVELS[12],s=initialState(l);s.flow.SA=1;assert.deepEqual(restoreGraph(l,graphCheckpoint(l,s)).state.flow,{SA:1});
 const r=LEVELS[13],state=initialState(r),next=augment(r,state.flow,['S','A','D','B','E','T']);state.flow=next.flow;state.reversed=true;const restored=restoreGraph(r,graphCheckpoint(r,state,{won:true}));assert.equal(restored.state.reversed,true);assert.equal(restored.won,true);
});
test('corrupt, wrong-level, future-version and changed-rule checkpoints are ignored',()=>{
 const l=LEVELS[0],valid=graphCheckpoint(l,initialState(l));
 for(const c of [{...valid,version:2},{...valid,levelId:'02'},{...valid,state:{...valid.state,position:'invalid'}},{...valid,state:{...valid.state,active:{}}},{...valid,state:{...valid.state,draft:['missing']}}])assert.equal(restoreGraph(l,c),null);
 assert.equal(restoreGraph({...l,energyLimit:l.energyLimit+1},valid),null);assert.equal(levelFingerprint({...l,title:'Editorial change'}),levelFingerprint(l));assert.equal(restoreGraph(l,{...valid,won:true}).won,false);
});
test('topology snapshots restore witnesses and complete winding rather than only the sheet',()=>{
 const l=TOPOLOGY_LEVELS[0];let s=initialTopologyState(l);for(const a of ['a','A','A'])s=stepTopology(l,s,a);const r=restoreTopology(l,topologyCheckpoint(l,s,{history:[initialTopologyState(l)],camera:{index:3,overhead:false,zoom:1}}));assert.deepEqual(r.state,s);assert.equal(r.state.seals,3);assert.equal(r.history.length,1);assert.equal(r.camera.index,3);
 assert.equal(restoreTopology(l,topologyCheckpoint(l,{...s,layer:500})),null);assert.equal(restoreTopology(l,topologyCheckpoint(l,{...s,energy:0})),null);
});
test('a partially completed homotopy proof and its undo history survive restoration',()=>{
 const l=LESSONS.reduction.level;let s=initialTopologyState(l);for(const a of ['b','B','a'])s=stepTopology(l,s,a);const walk=structuredClone(s);s.phase=1;s.proof=['a'];
 const r=restoreTopology(l,topologyCheckpoint(l,s,{history:[walk],won:true}));assert.deepEqual(r.state.proof,['a']);assert.equal(r.state.phase,1);assert.equal(r.won,true);assert.equal(r.history.length,1);
 const forged={...s,proof:['a','A','a']};assert.equal(restoreTopology(l,topologyCheckpoint(l,forged)),null);
});
test('partially edited seam pairings and classification choices round-trip',()=>{
 const l=TOPOLOGY_LEVELS[9],s=initialTopologyState(l);s.seam=[1,1,2];assert.deepEqual(restoreTopology(l,topologyCheckpoint(l,s)).state.seam,s.seam);
 const c=LESSONS.classification.level;let state=initialTopologyState(c);for(const a of ['a','a'])state=stepTopology(c,state,a);state.phase=1;state.proof=[...state.raw];state.choice='nontrivial';assert.equal(restoreTopology(c,topologyCheckpoint(c,state,{won:true})).won,true);
});
test('prologue restoration rejects partial angles and preserves completed rotations',()=>{
 for(let i=0;i<4;i++){const c=introCheckpoint(i*Math.PI/2,4,false);assert.deepEqual(restoreIntro(c),c);}
 assert.equal(restoreIntro({version:1,kind:'intro',angle:.7,turns:1,won:false}),null);assert.equal(restoreIntro(introCheckpoint(Math.PI/2,2,true)).won,false);assert.equal(restoreIntro(introCheckpoint(Math.PI,2,true)).won,true);
});
