import test from 'node:test';
import assert from 'node:assert/strict';
import {IDBFactory} from 'fake-indexeddb';
import {createSaveStore} from '../src/storage/database.js';
import {decodeSave} from '../src/storage/transfer.js';
const memory=()=>{const map=new Map();return {getItem:key=>map.get(key)||null,setItem:(key,value)=>map.set(key,value)};};
const make=(indexedDB,localStorage,levelIds=['intro','01','02','3-01'])=>createSaveStore({indexedDB,localStorage,levelIds});
test('adding levels keeps the exact checkpoint and completed records, and announces new content once',async()=>{
 const factory=new IDBFactory(),local=memory();let store=make(factory,local,['intro','01']);await store.init();await store.saveProfile({currentLevel:'01',completed:['01'],locale:'ja',preferences:{music:false}});await store.saveLevel('01',{version:1,state:{position:'A'},camera:{index:2}});store.close();
 store=make(factory,local);await store.init();assert.equal(store.profile().currentLevel,'01');assert.deepEqual(store.profile().completed,['01']);assert.equal(store.profile().locale,'ja');assert.equal(store.profile().preferences.music,false);assert.deepEqual(store.level('01').camera,{index:2});assert.deepEqual(store.profile().newLevelIds,['02','3-01']);store.close();
 store=make(factory,local);await store.init();assert.deepEqual(store.profile().newLevelIds,['02','3-01']);await store.saveProfile({completed:['02']});assert.deepEqual(store.profile().newLevelIds,['3-01']);store.close();
});
test('a portable backup restores the active journey and archives without losing the destination journey',async()=>{
 const source=make(new IDBFactory(),memory());await source.init();await source.saveProfile({currentLevel:'01',completed:['01']});await source.saveLevel('01',{state:{moves:4},camera:{index:3}});await source.startNewJourney();await source.saveProfile({currentLevel:'02'});await source.saveLevel('02',{state:{moves:7},camera:{index:1}});
 const backup=decodeSave(JSON.stringify(await source.exportSave()));assert.equal(backup.payload.archives.length,1);
 const factory=new IDBFactory(),local=memory();let target=make(factory,local);await target.init();await target.saveLevel('intro',{version:1,kind:'intro',turns:2,angle:0,won:false});assert(await target.importSave(backup));assert.equal(target.profile().currentLevel,'02');assert.equal(target.level('02').state.moves,7);assert.equal(target.level('02').camera.index,1);assert.equal(target.archives().length,3);target.close();
 target=make(factory,local);await target.init();assert.equal(target.level('02').state.moves,7);assert.equal(target.archives().length,3);target.close();source.close();
});
test('older catalogs retain temporarily unavailable level records for a later update',async()=>{
 const factory=new IDBFactory(),local=memory();let store=make(factory,local);await store.init();await store.saveProfile({completed:['3-01']});await store.saveLevel('3-01',{version:1,state:{moves:12}});store.close();
 store=make(factory,local,['intro','01']);await store.init();assert(store.profile().completed.includes('3-01'));assert.equal(store.level('3-01').state.moves,12);assert.equal(store.summary().completed,0);const file=await store.exportSave();assert(file.payload.levels.some(row=>row.levelId==='3-01'));store.close();
 store=make(factory,local);await store.init();assert.equal(store.level('3-01').state.moves,12);store.close();
});
test('invalid and future save formats are rejected before any local journey changes',async()=>{
 const store=make(new IDBFactory(),memory());await store.init();await store.saveProfile({currentLevel:'01',completed:['01']});const before=store.profile();
 for(const text of ['not json','{"format":"math-valley-save","version":9}',JSON.stringify({format:'math-valley-save',version:1,payload:{profile:{schemaVersion:1,completed:[]},levels:[{levelId:'../../x'}],archives:[]}})])assert.throws(()=>decodeSave(text));
 await assert.rejects(store.importSave({format:'math-valley-save',version:9}));assert.deepEqual(store.profile(),before);assert.equal(store.archives().length,0);store.close();
});
test('a stale tab cannot import over a journey selected by another tab',async()=>{
 const factory=new IDBFactory(),local=memory(),a=make(factory,local),b=make(factory,local);await a.init();await b.init();await a.saveProfile({completed:['01']});const backup=await a.exportSave();await b.startNewJourney();const active=b.profile().journeyId;assert.equal(await a.importSave(backup),false);assert(a.isStale());const reopened=make(factory,local);await reopened.init();assert.equal(reopened.profile().journeyId,active);a.close();b.close();reopened.close();
});
test('the real 44-to-48-level upgrade preserves an old checkpoint and announces the four new levels',async()=>{
 const {LEVELS}=await import('../src/catalog.js'),{initialTopologyState}=await import('../src/topology/math.js'),{topologyCheckpoint,restoreTopology}=await import('../src/storage/checkpoints.js');
 const factory=new IDBFactory(),local=memory(),oldIds=['intro',...LEVELS.slice(0,44).map(l=>l.id)],newIds=['intro',...LEVELS.map(l=>l.id)],level=LEVELS.find(l=>l.id==='2-01');
 let store=make(factory,local,oldIds);await store.init();const old=topologyCheckpoint(level,initialTopologyState(level),{camera:{index:2,overhead:false,zoom:1.2}});await store.saveProfile({currentLevel:level.id,completed:['intro','01','2-02'],locale:'de',preferences:{music:false}});await store.saveLevel(level.id,old);store.close();
 store=make(factory,local,newIds);await store.init();assert.equal(store.profile().currentLevel,level.id);assert.deepEqual(store.level(level.id),old);assert(restoreTopology(level,store.level(level.id)));assert.deepEqual(store.profile().newLevelIds,LEVELS.slice(44).map(l=>l.id));assert.deepEqual(store.profile().completed,['intro','01','2-02']);const file=decodeSave(JSON.stringify(await store.exportSave()));assert.equal(file.contentVersion,3);store.close();
});
