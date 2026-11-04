export const inverse=c=>c===c.toLowerCase()?c.toUpperCase():c.toLowerCase();
export function reduceWord(word){const out=[];for(const c of word){if(out.at(-1)===inverse(c))out.pop();else out.push(c);}return out;}
export function winding(word,letter='a'){return [...word].reduce((n,c)=>n+(c===letter?1:c===letter.toUpperCase()?-1:0),0);}
export function permutation(level,state,letter){if(letter==='b')return state?.seam??level.permutations?.b??[1,0,2];return level.permutations?.a??(level.kind==='free'?[1,2,0]:Array.from({length:level.sheets},(_,i)=>(i+1)%level.sheets));}
export function destination(level,state,letter){if(level.kind==='universal')return state.layer+(letter==='a'?1:-1);const p=permutation(level,state,letter.toLowerCase());return letter===letter.toLowerCase()?p[state.layer]:p.indexOf(state.layer);}
export function initialTopologyState(level){return {layer:level.start||0,raw:[],proof:[],seals:0,energy:0,phase:0,seam:level.construct?[0,1,2]:null,choice:null};}
export function checkpointMatches(c,state,letter){return (c.layer===undefined||state.layer===c.layer)&&(c.winding===undefined||winding(state.raw)===c.winding)&&(c.letter===undefined||letter===c.letter);}
export function stepTopology(level,state,letter){if((level.evidence&&state.phase>0)||!level.actions.includes(letter)||state.energy>=level.budget||(level.construct&&state.phase===0))return null;const layer=destination(level,state,letter);if(level.range&&(layer<level.range[0]||layer>level.range[1]))return null;const next={...state,layer,raw:[...state.raw,letter],energy:state.energy+1,choice:null};const check=level.checkpoints[state.seals];if(check&&checkpointMatches(check,next,letter))next.seals++;return next;}
export function topologyEvaluation(level,state){
 if(level.construct&&state.phase===0){if(new Set(state.seam).size!==level.sheets)return {pass:false,detail:'配对不是双射：有的原像被重复占用，反向提升不唯一。'};const pass=state.seam.every((x,i)=>x===level.targetPermutation[i]);return {pass,detail:pass?'每层的去处和观察记录一致，覆盖配对已复原。':'每层的配对仍与观察记录不符。检查Ⅰ、Ⅱ、Ⅲ三处原像。'};}
 const reduced=reduceWord(state.raw),cancel=(state.raw.length-reduced.length)/2;
 if(state.seals!==level.checkpoints.length)return {pass:false,detail:`见证点尚未按序齐备：${state.seals} / ${level.checkpoints.length}。`};
 if(state.energy>level.budget)return {pass:false,detail:'旅程超过行动预算，试着撤回并重排。'};
 if(level.targetLayer!==undefined&&state.layer!==level.targetLayer)return {pass:false,detail:'所在层与目标不一致。检查回廊的换层作用。'};
 if(level.targetWord&&reduced.join('')!==reduceWord(level.targetWord).join(''))return {pass:false,detail:'与参考路径的同伦类不同；同层并不足够，比较完整约化词。'};
 if(level.requireNontrivial&&reduced.length===0)return {pass:false,detail:'这条路径已可消去。本关需要一条同层但不可缩的反例。'};
 if(cancel<(level.minCancellations||0))return {pass:false,detail:`还需保留至少 ${level.minCancellations} 对可消去的往返，供第二阶段逐步验证。`};
 if(state.phase>0&&level.evidence==='reduction'&&state.proof.join('')!==reduceWord(state.raw).join(''))return {pass:false,detail:'证明尚未完成。只能消去相邻的正反路径，直到得到约化词。'};
 if(state.phase>0&&level.evidence==='classification'&&state.choice!==(reduced.length?'nontrivial':'null'))return {pass:false,detail:'判断尚未成立。终点相同或各孔绕数为零，都不能单独证明可缩。'};
 return {pass:true,detail:`完成 ${state.energy} 次绕行；${level.evidence?'行走与同伦证据均已验证。':'见证点、所在层与路径约束均已验证。'}`};
}
export function formatWord(word){return [...word].map(c=>c===c.toLowerCase()?c:`${c.toLowerCase()}⁻¹`).join(' · ')||'e';}
export const SEAM_OPTIONS=[[0,1,2],[1,0,2],[2,1,0],[0,2,1]];
