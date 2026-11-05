import {levelFingerprint,cameraCheckpoint} from '../storage/checkpoints.js';
import {replayExpansion,evaluation} from './math.js';
export function expansionCheckpoint(L,actions,camera,won=false){return {version:1,kind:'expansion',levelId:L.id,fingerprint:levelFingerprint(L),actions:structuredClone(actions),camera:cameraCheckpoint(camera),won};}
export function restoreExpansion(L,raw){
 if(raw?.version!==1||raw.kind!=='expansion'||raw.levelId!==L.id||raw.fingerprint!==levelFingerprint(L))return null;
 const state=replayExpansion(L,raw.actions);if(!state)return null;
 const c=raw.camera,camera=c&&Number.isInteger(c.index)&&c.index>=0&&c.index<4&&typeof c.overhead==='boolean'&&Number.isFinite(c.zoom)&&c.zoom>=.7&&c.zoom<=1.8?c:{index:0,overhead:false,zoom:1.1};
 return {state,actions:structuredClone(raw.actions),camera,won:raw.won===true&&evaluation(L,state).final};
}
