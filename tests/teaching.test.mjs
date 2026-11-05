import test from 'node:test';
import assert from 'node:assert/strict';
import {LESSONS,lessonFor,readLessons,lessonStorageKey} from '../src/teaching/lessons.js';
import {initialState,evaluate,augment,flowCheck,residualReachable,cutCapacity} from '../src/chapter/math.js';
import {solveSpatial,BASE_AZIMUTH,CAMERA_SLOPE} from '../src/chapter/spatial.js';
import {initialTopologyState,stepTopology,topologyEvaluation,inverse} from '../src/topology/math.js';
import {LEVELS} from '../src/chapter/levels.js';
import {SYMMETRY_LEVELS,CODING_LEVELS} from '../src/expansion/levels.js';
import {TOPOLOGY_LEVELS} from '../src/topology/levels.js';
import {translate} from '../src/i18n/core.js';

test('every chapter mechanic and proof phase has an appropriate independent lesson',()=>{
 const keys=new Set(['rotation']);
 for(const level of [...LEVELS,...TOPOLOGY_LEVELS,...SYMMETRY_LEVELS,...CODING_LEVELS])for(let phase=0;phase<(level.phases?.length||((level.evidence||level.construct)?2:1));phase++)for(const interaction of ['flow','cut']){
  const key=lessonFor(level,phase,interaction);assert(LESSONS[key],`${level.id}/${phase}/${interaction}`);keys.add(key);
 }
 assert.deepEqual([...keys].sort(),Object.keys(LESSONS).sort());
 for(const lesson of Object.values(LESSONS))if(lesson.level)assert(![...LEVELS,...TOPOLOGY_LEVELS,...SYMMETRY_LEVELS,...CODING_LEVELS].includes(lesson.level));
});
test('lesson progress is separate and distinguishes skipping from completing',()=>{
 assert.notEqual(lessonStorageKey,'math-roam-chapter-v3');
 for(const raw of ['null','[]','bad'])assert.deepEqual(readLessons({getItem:()=>raw}),{});
 assert.deepEqual(readLessons({getItem:()=>' {"rotation":"skipped","spatial":"completed","unknown":"completed","flow":true} '}),{rotation:'skipped',spatial:'completed'});
 assert.deepEqual(readLessons({getItem:()=>{throw Error('storage blocked');}}),{});
});
test('all lesson copy and parameterized actions have complete four-language translations',()=>{
 for(const l of Object.values(LESSONS))for(const copy of [l.title,l.principle,...l.steps.flatMap(s=>[s.copy,s.label])])for(const locale of ['en','ja','ko']){
  const result=translate(copy,locale);assert.notEqual(result,copy,`${locale}: ${copy}`);
  if(locale!=='ja')assert(!/[\u3400-\u9fff]/.test(result),`${locale}: ${copy}`);
 }
});
test('the spatial lesson is solvable and its portal actually aligns in the advertised view',()=>{
 const l=LESSONS.spatial.level,solution=solveSpatial(l);assert(solution&&solution.energy<=l.energyLimit);
 const portal=l.edges.find(e=>e.portal),a=l.nodes.find(n=>n.id===portal.u),b=l.nodes.find(n=>n.id===portal.v),angle=BASE_AZIMUTH+portal.view*Math.PI/2;
 const horizontal=Math.hypot(b.x-a.x,b.z-a.z);
 assert(Math.abs((b.y-a.y)/horizontal-CAMERA_SLOPE)<1e-10);
 assert(Math.abs((b.x-a.x)/horizontal-Math.sin(angle))<1e-10);
 assert(Math.abs((b.z-a.z)/horizontal-Math.cos(angle))<1e-10);
});
test('the bridge example distinguishes a spanning tree from a cycle',()=>{
 const l=LESSONS.bridges.level,s=initialState(l);assert(!evaluate(l,s).pass);s.active.AT=true;assert(evaluate(l,s).pass);s.active.ST=true;assert(!evaluate(l,s).pass);
});
test('edge and vertex cuts block all routes, rather than a single visible one',()=>{
 const l=LESSONS.edgecut.level,s=initialState(l);s.active.ST=false;assert(!evaluate(l,s).pass);s.active.AT=false;assert(evaluate(l,s).pass);
 const v=LESSONS.vertex.level,state=initialState(v);state.blocked=['A'];assert(!evaluate(v,state).pass);state.blocked=['X'];assert(evaluate(v,state).pass);
});
test('the route example requires two complete edge-disjoint paths',()=>{
 const l=LESSONS.routes.level,s=initialState(l);s.paths=[['S','A','T']];assert(!evaluate(l,s).pass);s.paths.push(['S','B','T']);assert(evaluate(l,s).pass);s.paths[1]=s.paths[0];assert(!evaluate(l,s).pass);
});
test('the flow example first violates and then restores conservation',()=>{
 const l=LESSONS.flow.level,s=initialState(l);s.flow.SA=1;assert(!flowCheck(l,s.flow).valid);assert(!evaluate(l,s).pass);s.flow.AT=1;assert(flowCheck(l,s.flow).valid);assert(evaluate(l,s).pass);
});
test('the residual example cancels old flow along a valid augmenting path',()=>{
 const l=LESSONS.residual.level,s=initialState(l);assert(flowCheck(l,s.flow).valid);const result=augment(l,s.flow,['S','B','A','T']);assert(result.reverse);assert.equal(result.flow.AB,0);s.flow=result.flow;s.reversed=true;assert(evaluate(l,s).pass);
});
test('the directed cut and residual reachability examples have truthful certificates',()=>{
 const l=LESSONS.cut.level,s=initialState(l);s.side=['S','A'];assert.equal(cutCapacity(l.edges,s.side),3);assert(evaluate(l,s).pass);
 const r=LESSONS.residualcut.level,state=initialState(r);assert(flowCheck(r,state.flow).valid);assert.deepEqual([...residualReachable(r,state.flow)].sort(),['A','S']);state.side=['S','A'];assert(evaluate(r,state).pass);
});
for(const key of ['cover','words','universal','reduction','classification','seams'])test(`${key}: the scripted topology example respects every transition and verifies its final evidence`,()=>{
 const l=LESSONS[key].level;let s=initialTopologyState(l),verified=false;
 for(const step of LESSONS[key].steps){
  const [arg]=step.args;
  if(step.method==='loop'){s=stepTopology(l,s,arg);assert(s,`${key}: legal lift`);}
  else if(step.method==='cycleSeam')s.seam[arg]=(s.seam[arg]+1)%l.sheets;
  else if(step.method==='cancelPair'){assert.equal(s.proof[arg],inverse(s.proof[arg+1]));s.proof.splice(arg,2);}
  else if(step.method==='choose')s.choice=arg;
  else if(step.method==='test'){
   assert(topologyEvaluation(l,s).pass,`${key}: ${topologyEvaluation(l,s).detail}`);
   if(l.construct&&s.phase===0)s.phase=1;
   else if(l.evidence&&s.phase===0){s.phase=1;s.proof=[...s.raw];}
   else verified=true;
  }
 }
 assert(verified,`${key}: final verification`);
});
