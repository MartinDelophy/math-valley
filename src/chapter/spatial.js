// Spatial puzzles use a finite state graph: (platform, view, switch configuration, collected seals).
export const BASE_AZIMUTH=-Math.PI/4;
export const CAMERA_SLOPE=.6;
export function portalAvailable(edge,view){return edge.view===undefined||edge.view===view;}
export function usable(level,state,edge){return state.active[edge.id]!==false&&(!edge.portal||portalAvailable(edge,state.view))&&(!edge.requires||edge.requires.every(n=>state.runes.includes(n)));}
export function switchState(level,state,id){const edge=level.edges.find(e=>e.id===id);if(!edge?.control)return null;if(edge.station&&edge.station!==state.position)return null;if(edge.controlView!==undefined&&edge.controlView!==state.view)return null;if(edge.requires&&!edge.requires.every(n=>state.runes.includes(n)))return null;
 const active={...state.active},next=!active[id];if(next&&edge.group)for(const e of level.edges)if(e.group===edge.group)active[e.id]=false;active[id]=next;return {...state,active,energy:state.energy+1,moves:state.moves+1};}
export function travelState(level,state,id){const e=level.edges.find(e=>((e.u===state.position&&e.v===id)||(!e.directed&&e.v===state.position&&e.u===id))&&usable(level,state,e));if(!e)return null;return {...state,position:id,runes:[...new Set([...state.runes,...(level.nodes.find(n=>n.id===id)?.rune?[id]:[])])],energy:state.energy+(e.cost??(e.portal?2:1)),moves:state.moves+1};}
export function spatialInitial(level){return {position:level.s,view:0,runes:[],active:Object.fromEntries(level.edges.map(e=>[e.id,e.on!==false])),energy:0,moves:0};}
export function spatialWon(level,state){return state.position===level.t&&(level.seals||[]).every(n=>state.runes.includes(n))&&state.energy<=(level.energyLimit??Infinity);}
export function spatialKey(level,s){return `${s.position}/${s.view}/${level.edges.filter(e=>e.control).map(e=>+s.active[e.id]).join('')}/${[...s.runes].sort().join('')}`;}
export function solveSpatial(level){const init=spatialInitial(level),queue=[{s:init,actions:[],score:0}],best=new Map([[spatialKey(level,init),0]]);let visited=0;
 while(queue.length){queue.sort((a,b)=>b.score-a.score);const q=queue.pop(),s=q.s,k=spatialKey(level,s);if(q.score!==best.get(k))continue;visited++;if(spatialWon({...level,energyLimit:Infinity},s))return {energy:s.energy,moves:q.actions.length,actions:q.actions,visited};
 const next=[];for(const delta of [-1,1]){const view=(s.view+delta+4)%4;next.push([{...s,view},['view',delta]]);}for(const n of level.nodes){const x=travelState(level,s,n.id);if(x)next.push([x,['node',n.id]]);}for(const e of level.edges){if(!e.control)continue;const x=switchState(level,s,e.id);if(x)next.push([x,['switch',e.id]]);}
 for(const [x,action] of next){const score=x.energy*1000+q.actions.length+1,key=spatialKey(level,x);if(score<(best.get(key)??Infinity)){best.set(key,score);queue.push({s:x,actions:[...q.actions,action],score});}}
 }return null;
}
