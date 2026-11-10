import {initialState,evaluate} from '../chapter/math.js';
import {initialTopologyState,stepTopology,topologyEvaluation,inverse} from '../topology/math.js';
const clone=value=>JSON.parse(JSON.stringify(value));
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
const integer=(value,min=0,max=100000)=>Number.isInteger(value)&&value>=min&&value<=max;
const list=(value,valid,max=100)=>Array.isArray(value)&&value.length<=max&&value.every(valid);
const unique=value=>new Set(value).size===value.length;
// Ignore editorial text, but invalidate a checkpoint if authored rules change.
export function levelFingerprint(level){
 const fields=['id','chapter','mode','nodes','edges','s','t','seals','energyLimit','target','required','maxAdded','allConnected','internal','initialFlow','kind','scene','sheets','start','actions','checkpoints','budget','targetWord','targetLayer','evidence','construct','range','permutations','targetPermutation','requireNontrivial','minCancellations','n','task','bits','message','errors','relayMessage','relayErrors','editable','received','erasures','twoStage','exhaustive','moduli','residues','divisors'];
 const rules=Object.fromEntries(fields.filter(key=>level[key]!==undefined).map(key=>[key,level[key]]));
 if(level.phases)rules.phases=level.phases.map(({mode,target,internal})=>({mode,target,internal}));
 let hash=2166136261;for(const char of JSON.stringify(rules))hash=Math.imul(hash^char.charCodeAt(0),16777619);return (hash>>>0).toString(16);
}
export function cameraCheckpoint(camera){
 return {index:camera.index===-1?((Math.round(((camera.angle??-45)+45)/90)%4)+4)%4:camera.index??0,overhead:Boolean(camera.overhead),zoom:camera.zoom??1.1};
}
function readCamera(raw){return object(raw)&&integer(raw.index,0,3)&&typeof raw.overhead==='boolean'&&Number.isFinite(raw.zoom)&&raw.zoom>=.7&&raw.zoom<=1.8?clone(raw):{index:0,overhead:false,zoom:1.1};}
function matches(level,raw,kind){return object(raw)&&raw.version===1&&raw.kind===kind&&raw.levelId===level.id&&raw.fingerprint===levelFingerprint(level);}
function graphState(level,raw){
 if(!object(raw))return null;
 const nodes=new Set(level.nodes.map(n=>n.id)),edges=new Map(level.edges.map(e=>[e.id,e])),runes=new Set(level.nodes.filter(n=>n.rune).map(n=>n.id));
 if(!nodes.has(raw.position)||!integer(raw.view,-1,3)||!integer(raw.phase,0,(level.phases?.length||1)-1)||!integer(raw.energy)||!integer(raw.moves))return null;
 if(!object(raw.active)||level.edges.some(e=>typeof raw.active[e.id]!=='boolean')||Object.keys(raw.active).some(id=>!edges.has(id)))return null;
 if(!object(raw.flow)||Object.entries(raw.flow).some(([id,value])=>!edges.get(id)?.cap||!integer(value,0,edges.get(id).cap)))return null;
 if(!list(raw.runes,id=>runes.has(id))||!unique(raw.runes)||!list(raw.blocked,id=>nodes.has(id)&&id!==level.s&&id!==level.t)||!unique(raw.blocked))return null;
 if(!list(raw.side,id=>nodes.has(id)&&id!==level.t)||!unique(raw.side)||!raw.side.includes(level.s))return null;
 const path=p=>list(p,id=>nodes.has(id),level.nodes.length)&&unique(p)&&p[0]===level.s;
 if(!path(raw.draft)||!list(raw.paths,p=>path(p)&&p.at(-1)===level.t,10)||!list(raw.certificates,v=>typeof v==='string'&&v.length<=2000,5))return null;
 if(raw.reversed!==undefined&&typeof raw.reversed!=='boolean')return null;
 return Object.fromEntries(Object.keys(initialState(level)).map(key=>[key,clone(raw[key]??initialState(level)[key])]));
}
export function graphCheckpoint(level,state,{history=[],camera={},...extra}={}){
 return {version:1,kind:'graph',levelId:level.id,fingerprint:levelFingerprint(level),state:clone(state),history:clone(history.slice(-80)),camera:cameraCheckpoint(camera),...extra};
}
export function restoreGraph(level,raw){
 if(!matches(level,raw,'graph'))return null;const state=graphState(level,raw.state);if(!state)return null;
 const history=list(raw.history,value=>Boolean(graphState(level,value)),80)?raw.history.map(value=>graphState(level,value)):[];
 const camera=readCamera(raw.camera);state.view=camera.overhead?-1:camera.index;
 return {state,history,camera,selected:level.edges.some(e=>e.id===raw.selected)?raw.selected:level.edges[0]?.id,interaction:raw.interaction==='cut'?'cut':'flow',won:Boolean(raw.won)&&state.phase===(level.phases?.length||1)-1&&evaluate(level,state).pass,feedback:typeof raw.feedback==='string'?raw.feedback.slice(0,2000):'',tested:Boolean(raw.tested)};
}
function canCancelTo(raw,proof,seen=new Set()){
 const key=raw.join('');if(key===proof.join(''))return true;if(raw.length<=proof.length||seen.has(key))return false;seen.add(key);
 for(let i=0;i<raw.length-1;i++)if(inverse(raw[i])===raw[i+1]&&canCancelTo([...raw.slice(0,i),...raw.slice(i+2)],proof,seen))return true;
 return false;
}
function topologyState(level,raw){
 if(!object(raw)||!list(raw.raw,c=>level.actions.includes(c),level.budget)||!list(raw.proof,c=>level.actions.includes(c),level.budget)||!integer(raw.phase,0,level.construct||level.evidence?1:0))return null;
 let state=initialTopologyState(level);
 if(level.construct){
  if(!list(raw.seam,v=>integer(v,0,level.sheets-1),level.sheets)||raw.seam.length!==level.sheets)return null;
  state.seam=[...raw.seam];if(raw.phase===1){if(!topologyEvaluation(level,state).pass)return null;state.phase=1;}
 }
 for(const letter of raw.raw){state=stepTopology(level,state,letter);if(!state)return null;}
 if(raw.layer!==state.layer||raw.energy!==state.energy||raw.seals!==state.seals)return null;
 if(level.evidence&&raw.phase===1){
  if(!topologyEvaluation(level,state).pass)return null;state.phase=1;
  if(level.evidence==='reduction'&&!canCancelTo(state.raw,raw.proof))return null;
  state.proof=[...raw.proof];
  if(![null,'null','nontrivial'].includes(raw.choice))return null;state.choice=raw.choice;
 }else if(raw.proof.length||raw.choice!==null)return null;
 return state;
}
export function topologyCheckpoint(level,state,{history=[],camera={},...extra}={}){
 return {version:1,kind:'topology',levelId:level.id,fingerprint:levelFingerprint(level),state:clone(state),history:clone(history.slice(-80)),camera:cameraCheckpoint(camera),...extra};
}
export function restoreTopology(level,raw){
 if(!matches(level,raw,'topology'))return null;const state=topologyState(level,raw.state);if(!state)return null;
 return {state,history:list(raw.history,value=>Boolean(topologyState(level,value)),80)?raw.history.map(value=>topologyState(level,value)):[],camera:readCamera(raw.camera),won:Boolean(raw.won)&&(!level.evidence&&!level.construct||state.phase===1)&&topologyEvaluation(level,state).pass,feedback:typeof raw.feedback==='string'?raw.feedback.slice(0,2000):'',tested:Boolean(raw.tested)};
}
export function introCheckpoint(angle,turns,won){return {version:1,kind:'intro',angle:((angle%(2*Math.PI))+2*Math.PI)%(2*Math.PI),turns,won};}
export function restoreIntro(raw){
 if(!object(raw)||raw.version!==1||raw.kind!=='intro'||!Number.isFinite(raw.angle)||raw.angle<0||raw.angle>=2*Math.PI||Math.abs(raw.angle/(Math.PI/2)-Math.round(raw.angle/(Math.PI/2)))>.0001||!integer(raw.turns)||typeof raw.won!=='boolean')return null;
 return {...raw,won:raw.won&&Math.abs(Math.sin(raw.angle))<.01};
}
