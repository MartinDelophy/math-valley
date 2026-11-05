import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {LEVELS} from '../src/catalog.js';
import {LESSONS} from '../src/teaching/lessons.js';
import {initialState} from '../src/chapter/math.js';
import {initialTopologyState,stepTopology,topologyEvaluation,reduceWord} from '../src/topology/math.js';
import {introCheckpoint,graphCheckpoint,topologyCheckpoint,restoreTopology} from '../src/storage/checkpoints.js';
const require=createRequire(import.meta.url),captureOnly=process.argv.includes('--capture'),output=path.resolve(captureOnly?'release/notebook-capture':'release/notebook-review');mkdirSync(output,{recursive:true});
const fixtures=[{id:'intro',name:'intro',checkpoint:introCheckpoint(0,1,false)}];
for(const id of ['01','05','08','13','2-01','2-02','2-03','2-10']){
 const level=LEVELS.find(l=>l.id===id);let state=level.chapter===2?initialTopologyState(level):initialState(level);
 if(level.chapter===2&&level.evidence){
  const queue=[state],seen=new Set();for(let head=0;head<queue.length;head++){
   const current=queue[head];if(topologyEvaluation(level,current).pass){state={...current,phase:1,proof:[...current.raw]};break;}
   for(const letter of level.actions){const n=stepTopology(level,current,letter);if(!n)continue;const word=reduceWord(n.raw),target=reduceWord(level.targetWord||'');if(level.targetWord){let i=0;while(i<word.length&&i<target.length&&word[i]===target[i])i++;if(word.length+target.length-2*i>level.budget-n.energy)continue;}const key=[n.layer,word.join(''),n.seals,Math.min((n.raw.length-word.length)/2,level.minCancellations||0)].join(':');if(!seen.has(key)){seen.add(key);queue.push(n);}}
  }
 }
 if(id==='08')state.phase=1;
 const checkpoint=level.chapter===2?topologyCheckpoint(level,state):graphCheckpoint(level,state);
 if(level.chapter===2&&!restoreTopology(level,checkpoint))throw Error(`Invalid review fixture ${id}`);
 fixtures.push({id,name:`${id}${state.phase?'-proof':''}`,checkpoint});
}
const selected=captureOnly?fixtures.slice(0,1):fixtures;
for(const fixture of selected){
 const folder=path.join(output,fixture.name);mkdirSync(folder,{recursive:true});
 const data={fixtures:[fixture],lessons:Object.fromEntries(Object.keys(LESSONS).map(key=>[key,'completed']))};writeFileSync(path.join(folder,'fixtures.json'),JSON.stringify(data));
 const profile=mkdtempSync(path.join(folder,'profile-')),env={...process.env,MATH_VALLEY_DESKTOP_SMOKE:'1',MATH_VALLEY_SMOKE_PHASE:'notebook',MATH_VALLEY_NOTEBOOK_CAPTURE:captureOnly?'1':'',MATH_VALLEY_SMOKE_PROFILE:profile,MATH_VALLEY_SMOKE_OUTPUT:folder};delete env.ELECTRON_RUN_AS_NODE;
 const result=spawnSync(require('../desktop/node_modules/electron'),[path.resolve('desktop')],{env,encoding:'utf8',timeout:180000});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);
}
