import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {SYMMETRY_LEVELS as GROUP,CODING_LEVELS as CODE} from '../src/expansion/levels.js';
import {bitView} from '../src/expansion/math.js';
import {expansionCheckpoint} from '../src/expansion/checkpoint.js';
import {LESSONS,lessonFor} from '../src/teaching/lessons.js';
import {CONGRUENCE_LEVELS} from '../src/number-theory/levels.js';
import {groupSolutions,solveGroup,solveCode} from '../tests/helpers/expansion-solutions.mjs';
const require=createRequire(import.meta.url),only=process.argv.slice(2).filter(a=>!a.startsWith('--')),lessonsMode=process.argv.includes('--lessons'),output=path.resolve('release/expansion-review');mkdirSync(output,{recursive:true});
const clockSolutions={
 '5-01':[['jump',1],['jump',1],['jump',1]],
 '5-02':[['jump',5],['jump',3],['jump',3]],
 '5-03':[['jump',4],['jump',6]],
 '5-04':[['jump',1],['jump',4],['divisor',2]],
};
for(const L of [...GROUP,...CODE,...CONGRUENCE_LEVELS].filter(l=>!only.length||only.includes(l.id))){
 const folder=path.join(output,L.id);mkdirSync(folder,{recursive:true});const profile=mkdtempSync(path.join(folder,'profile-'));
 const lesson=lessonFor(L);
 const actions=clockSolutions[L.id]||(L.chapter===3?solveGroup(L,groupSolutions[GROUP.indexOf(L)]):solveCode(L)).actions;
 writeFileSync(path.join(folder,'fixture.json'),JSON.stringify({id:L.id,tutorial:lessonsMode,lessonSteps:LESSONS[lesson].steps.length,views:Array.from({length:L.bits||0},(_,i)=>bitView(i)),checkpoint:expansionCheckpoint(L,[],{index:0,overhead:false,zoom:1.1}),actions,lessons:Object.fromEntries(Object.keys(LESSONS).filter(k=>!lessonsMode||k!==lesson).map(k=>[k,'completed']))}));
 const env={...process.env,MATH_VALLEY_DESKTOP_SMOKE:'1',MATH_VALLEY_SMOKE_PHASE:'expansion',MATH_VALLEY_SMOKE_PROFILE:profile,MATH_VALLEY_SMOKE_OUTPUT:folder};delete env.ELECTRON_RUN_AS_NODE;
 const args=process.env.MATH_VALLEY_EXPANSION_EXECUTABLE?[]:[path.resolve('desktop')],exe=process.env.MATH_VALLEY_EXPANSION_EXECUTABLE||require('../desktop/node_modules/electron');const result=spawnSync(exe,args,{env,encoding:'utf8',timeout:180000});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);
}
