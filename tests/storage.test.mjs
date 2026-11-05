import test from 'node:test';
import assert from 'node:assert/strict';
import {IDBFactory} from 'fake-indexeddb';
import {createSaveStore,FALLBACK_KEY} from '../src/storage/database.js';
import {LEVELS} from '../src/catalog.js';
const ids=['intro',...LEVELS.map(l=>l.id)];
function memory(entries={}){const values=new Map(Object.entries(entries));return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};}
const create=(factory,local,extra={})=>createSaveStore({indexedDB:factory,localStorage:local,levelIds:ids,...extra});
test('legacy records migrate together without deleting their original keys',async()=>{
 const factory=new IDBFactory(),legacy=JSON.stringify({current:17,completed:['intro','01','2-01','invalid']});
 const local=memory({'math-roam-chapter-v3':legacy,'math-valley-locale':'ja','math-valley-lessons-v1':'{"rotation":"completed","spatial":"skipped"}'}),store=create(factory,local);
 const p=await store.init();assert.equal(store.backend(),'indexedDB');assert.equal(p.currentLevel,'2-02');assert.deepEqual(p.completed,['intro','01','2-01']);assert.equal(p.locale,'ja');assert.equal(p.lessons.rotation,'completed');assert.equal(local.getItem('math-roam-chapter-v3'),legacy);store.close();
 const reopened=create(factory,local);assert.deepEqual(await reopened.init(),p);reopened.close();
});
test('per-level checkpoints and settings survive reopening and remain independent',async()=>{
 const factory=new IDBFactory(),local=memory(),store=create(factory,local);await store.init();
 const snapshot={version:1,kind:'graph',state:{position:'A'}};await store.saveLevel('01',snapshot);snapshot.state.position='T';
 await store.saveLevel('2-01',{version:1,kind:'topology',state:{raw:['a']}});await store.saveProfile({currentLevel:'2-01',locale:'ko',completed:['01'],lessons:{rotation:'completed'},preferences:{paperOpen:false,labels:true}});await store.flush();store.close();
 const reopened=create(factory,local),p=await reopened.init();assert.equal(p.currentLevel,'2-01');assert.equal(p.locale,'ko');assert.deepEqual(p.completed,['01']);assert.deepEqual(p.preferences,{labels:true,paperOpen:false});assert.equal(reopened.level('01').state.position,'A');assert.deepEqual(reopened.level('2-01').state.raw,['a']);
 const read=reopened.level('01');read.state.position='S';assert.equal(reopened.level('01').state.position,'A');reopened.close();
});
test('stale legacy keys cannot override a migrated profile',async()=>{
 const factory=new IDBFactory(),local=memory({'math-valley-locale':'en'}),store=create(factory,local);await store.init();await store.saveProfile({locale:'ja',currentLevel:'15',completed:['14']});store.close();
 local.setItem('math-roam-chapter-v3','{"current":0,"completed":[]}');const reopened=create(factory,local),p=await reopened.init();assert.equal(p.locale,'ja');assert.equal(p.currentLevel,'15');assert.deepEqual(p.completed,['14']);reopened.close();
});
test('independent tabs merge completed levels and do not downgrade finished lessons',async()=>{
 const factory=new IDBFactory(),local=memory(),a=create(factory,local),b=create(factory,local);await Promise.all([a.init(),b.init()]);
 await Promise.all([a.saveProfile({completed:['01'],lessons:{rotation:'completed'}}),b.saveProfile({completed:['02'],lessons:{rotation:'skipped'}})]);a.close();b.close();
 const reopened=create(factory,local),p=await reopened.init();assert.deepEqual([...p.completed].sort(),['01','02']);assert.equal(p.lessons.rotation,'completed');reopened.close();
});
test('an aborted migration falls back without losing its data, then recovers to IndexedDB',async()=>{
 const factory=new IDBFactory(),failing={open(...args){const request=factory.open(...args);request.addEventListener('success',()=>{const db=request.result,original=db.transaction.bind(db);db.transaction=(stores,mode)=>{const tx=original(stores,mode);if(mode==='readwrite')queueMicrotask(()=>tx.abort());return tx;};});return request;}};
 const local=memory({'math-roam-chapter-v3':'{"current":3,"completed":["01"]}'}),store=create(failing,local);await store.init();assert.equal(store.backend(),'localStorage');await store.saveProfile({locale:'ko',completed:['02']});await store.saveLevel('04',{state:{moves:6}});assert(local.getItem(FALLBACK_KEY));store.close();
 const recovered=create(factory,local),p=await recovered.init();assert.equal(recovered.backend(),'indexedDB');assert.deepEqual(p.completed,['01','02']);assert.equal(p.locale,'ko');assert.equal(recovered.level('04').state.moves,6);recovered.close();
});
test('unavailable, blocked and malformed storage never prevents a playable session',async()=>{
 const local=memory({'math-roam-chapter-v3':'bad json','math-valley-lessons-v1':'null'}),fallback=create(undefined,local);assert.equal((await fallback.init()).currentLevel,'intro');assert.equal(fallback.backend(),'localStorage');
 const denied={getItem(){throw Error('denied');},setItem(){throw Error('quota');}},memoryOnly=create(undefined,denied);await memoryOnly.init();assert.equal(memoryOnly.backend(),'memory');assert.equal(await memoryOnly.saveProfile({currentLevel:'01'}),false);assert.equal(memoryOnly.profile().currentLevel,'01');
 const blocked=create({open:()=>({})},memory(),{openTimeout:5});await blocked.init();assert.equal(blocked.backend(),'localStorage');
});
test('a failed later write preserves newer fallback checkpoints over older database rows',async()=>{
 const factory=new IDBFactory(),local=memory();let fail=false;
 const intermittent={open(...args){const request=factory.open(...args);request.addEventListener('success',()=>{const db=request.result,original=db.transaction.bind(db);db.transaction=(stores,mode)=>{const tx=original(stores,mode);if(fail&&mode==='readwrite')queueMicrotask(()=>tx.abort());return tx;};});return request;}};
 const store=create(intermittent,local);await store.init();await store.saveLevel('01',{moves:1});fail=true;await store.saveLevel('01',{moves:2});await store.saveProfile({locale:'ja'});assert.equal(store.backend(),'localStorage');store.close();
 const recovered=create(factory,local);await recovered.init();assert.equal(recovered.level('01').moves,2);assert.equal(recovered.profile().locale,'ja');assert.equal(recovered.backend(),'indexedDB');recovered.close();
});
