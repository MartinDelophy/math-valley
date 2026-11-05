import {LEVELS} from '../catalog.js';
import {createSaveStore} from './database.js';
function access(name){try{return globalThis[name];}catch{return undefined;}}
// Initialized before mounting the game, so initial scene notifications can never
// overwrite a checkpoint while an asynchronous IndexedDB read is still pending.
export const saves=createSaveStore({indexedDB:access('indexedDB'),localStorage:access('localStorage'),levelIds:['intro',...LEVELS.map(level=>level.id)]});
