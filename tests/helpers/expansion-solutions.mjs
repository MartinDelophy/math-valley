import assert from 'node:assert/strict';
import {initialExpansion,stepExpansion,evaluation,encode,distance,codebook} from '../../src/expansion/math.js';
// Complete constructive witnesses; no puzzle solver is shipped to players.
export const groupSolutions=[
 ['r','r','r','r','s','s'],
 ['r','s','test','s','r'],
 ['mark','s','mark','s','r','r','r','r'],
 ['mark','r','mark','r','s','mark','R','mark'],
 ['mark','r','mark','r','mark','r','mark','r','s','r','r','r','test','s','r','s'],
 ['mark','r','r','r','r','s','mark','r','r','r','test','r','s','R'],
 ['mark','r','r','mark','r','r','s','mark','r','r','mark','r','r'],
 ['mark','r','mark','r','r','r','r','s','mark','r','mark','r','r','r','r','test','r','s','R','s'],
];
export function solveGroup(L,solution){let s=initialExpansion(L),actions=[];for(const method of solution){const a=[method],next=stepExpansion(L,s,a);assert(next,`${L.id} rejects ${method} at ${s.raw}`);s=next;actions.push(a);}assert(evaluation(L,s).final,L.id);return {state:s,actions};}
export function solveCode(L){let state=initialExpansion(L),actions=[];const act=(method,arg)=>{const action=arg===undefined?[method]:[method,arg];state=stepExpansion(L,state,action);assert(state,`${L.id} rejects ${action}`);actions.push(action);};
 const changeTo=target=>{for(let i=0;i<L.bits;i++)if(target[i]!==state.bits[i])act('bit',i);};
 if(L.task==='ambiguity'){const candidates=codebook(true).filter(c=>distance(c,L.received)===2);assert(candidates.length>=2);for(const candidate of candidates.slice(0,2)){changeTo(candidate);act('mark');if(state.marks.length<2)act('received');}}
 else if(L.task==='distance')changeTo(codebook().find(c=>c.filter(Boolean).length===3));
 else {changeTo(encode(L.message,L.bits===8));if(L.twoStage){act('test');changeTo(encode(L.task==='relay'?L.relayMessage:L.message,L.bits===8));}}
 assert(evaluation(L,state).final,L.id);return {state,actions};}
