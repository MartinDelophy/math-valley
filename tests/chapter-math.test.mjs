import test from 'node:test';import assert from 'node:assert/strict';
import { LEVELS } from '../src/chapter/levels.js';
import { initialState,evaluate,augment,flowCheck,validPaths,isTree,minimumTree,allowedEdgeCut,residualReachable,globalEdgeCut,phaseSpec } from '../src/chapter/math.js';
import { solveSpatial,spatialInitial,travelState,switchState,portalAvailable,BASE_AZIMUTH,CAMERA_SLOPE } from '../src/chapter/spatial.js';
const solves=LEVELS.slice(0,4).map(solveSpatial);
for(const [i,l] of LEVELS.entries())test(`${l.id}: nontrivial, solvable chapter construction`,()=>{let s=initialState(l);assert.equal(evaluate(l,s).pass,false);
 if(l.mode==='spatial'){const r=solves[i];assert.ok(r);for(const [type,arg] of r.actions){if(type==='view')s.view=(s.view+arg+4)%4;else s=type==='node'?travelState(l,s,arg):switchState(l,s,arg);assert.ok(s);}assert.ok(evaluate(l,s).pass);return;}
 if(l.mode==='mst'){const ids=minimumTree(l).ids;s.active=Object.fromEntries(l.edges.map(e=>[e.id,ids.includes(e.id)]));}
 for(const id of l.solution?.activate||[])s.active[id]=true;
 if(l.solution?.blocked)s.blocked=l.solution.blocked;
 if(l.solution?.paths)s.paths=l.solution.paths;
 if(l.solution?.flow)s.flow=l.solution.flow;
 if(l.solution?.side)s.side=l.solution.side;
 if(l.solution?.residualPath){const a=augment(l,s.flow,l.solution.residualPath);assert.ok(a);s.flow=a.flow;s.reversed=a.reverse;}
 assert.ok(evaluate(l,s).pass,JSON.stringify(evaluate(l,s)));
 if(l.phases){s.phase=1;s.side=[l.s];assert.equal(evaluate(l,s).pass,false,'second phase needs independent evidence');if(l.id==='08')for(const id of allowedEdgeCut(l).ids)s.active[id]=false;if(l.id==='12')s.blocked=['A','B','C'];if(l.id==='16')s.side=l.solution.side;assert.ok(evaluate(l,s).pass,JSON.stringify(evaluate(l,s)));}
});
test('spatial difficulty has increasing proven minimum actions and energy',()=>{for(let i=0;i<4;i++){assert.ok(solves[i].moves>=13);assert.ok(solves[i].energy<=LEVELS[i].energyLimit);if(i){assert.ok(solves[i].moves>solves[i-1].moves);assert.ok(solves[i].energy>solves[i-1].energy);}}});
test('portal endpoints truly coincide along the authored camera ray',()=>{for(const l of LEVELS.slice(0,4))for(const e of l.edges.filter(e=>e.portal)){const a=l.nodes.find(n=>n.id===e.u),b=l.nodes.find(n=>n.id===e.v),angle=BASE_AZIMUTH+e.view*Math.PI/2,d=[Math.sin(angle),CAMERA_SLOPE,Math.cos(angle)],p=[b.x-a.x,b.y-a.y,b.z-a.z],cross=[p[1]*d[2]-p[2]*d[1],p[2]*d[0]-p[0]*d[2],p[0]*d[1]-p[1]*d[0]];assert.ok(Math.hypot(...cross)<1e-8);assert.ok(portalAvailable(e,e.view));assert.equal(portalAvailable(e,(e.view+1)%4),false);}});
test('walking cannot cross a misaligned portal',()=>{const l=LEVELS[0],s=spatialInitial(l);s.position='B';assert.equal(travelState(l,s,'C'),null);s.view=1;assert.equal(travelState(l,s,'C').position,'C');});
test('switches require proximity, seals and the proper view; group choices are exclusive',()=>{const l=LEVELS[1],s=spatialInitial(l);assert.equal(switchState(l,s,'CE'),null);s.position='C';assert.equal(switchState(l,s,'CE'),null);s.runes=['D','J'];s.view=1;assert.equal(switchState(l,s,'CE'),null);s.view=0;const x=switchState(l,s,'CE');assert.ok(x.active.CE);assert.equal(x.active.CX,false);});
test('a weighted spanning tree must be globally cheapest, not merely acyclic',()=>{const l=LEVELS[4],s=initialState(l);s.active=Object.fromEntries(l.edges.map((e,i)=>[e.id,i<7]));assert.ok(isTree(l.nodes,l.edges.filter(e=>s.active[e.id])));assert.equal(evaluate(l,s).pass,false);assert.equal(minimumTree(l).cost,19);assert.equal(minimumTree(LEVELS[5]).cost,23);});
test('three shortcuts leave a star leaf vulnerable; four paired shortcuts cover all leaves',()=>{const l=LEVELS[6],s=initialState(l);for(const id of ['SA','BC','DE'])s.active[id]=true;assert.equal(evaluate(l,s).pass,false);s.active.FT=true;assert.ok(evaluate(l,s).pass);assert.equal(globalEdgeCut(l.nodes,l.edges.filter(e=>s.active[e.id])).value,2);});
test('an early greedy route can consume another route’s internal platform',()=>{const l=LEVELS[9],paths=[['S','A','E','F','T'],['S','B','D','G','T'],['S','C','F','T']];assert.equal(validPaths(l,paths,true),false);assert.ok(validPaths(l,l.solution.paths,true));});
test('residual reallocation cancels old flow, preserves conservation and reaches seven',()=>{const l=LEVELS[13],a=augment(l,l.initialFlow,l.solution.residualPath);assert.equal(a.flow.BD,1);assert.ok(a.reverse);assert.ok(flowCheck(l,a.flow).valid);assert.equal(flowCheck(l,a.flow).value,7);});
test('residual cut includes vertices reached via reverse residual edges',()=>{const l=LEVELS[14],seen=residualReachable(l,l.initialFlow);assert.deepEqual([...seen].sort(),[...l.solution.side].sort());assert.ok(seen.has('C'));assert.equal(seen.has('G'),false);});
test('energy budget remains a genuine spatial win condition',()=>{const l=LEVELS[2],s=initialState(l);s.position=l.t;s.runes=l.seals;s.energy=l.energyLimit+1;assert.equal(evaluate(l,s).pass,false);});
console.log('Spatial minimums:',solves.map((s,i)=>({level:i+1,moves:s?.moves,energy:s?.energy})));
