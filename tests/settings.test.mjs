import test from 'node:test';
import assert from 'node:assert/strict';
import {IDBFactory} from 'fake-indexeddb';
import {createSaveStore} from '../src/storage/database.js';
import {cleanPreferences} from '../src/settings/model.js';

test('new language and audio settings survive an IndexedDB restart and journey switch',async()=>{
 const indexedDB=new IDBFactory(),localStorage={getItem:()=>null,setItem:()=>{}};
 const make=()=>createSaveStore({indexedDB,localStorage});let store=make();await store.init();
 await store.saveProfile({locale:'zh-TW',preferences:{music:false,musicVolume:.3,openingMotion:false,soundEffects:false}});await store.flush();store.close();
 store=make();await store.init();assert.equal(store.profile().locale,'zh-TW');assert.equal(store.profile().preferences.musicVolume,.3);assert.equal(store.profile().preferences.music,false);assert.equal(store.profile().preferences.openingMotion,false);
 await store.startNewJourney();assert.equal(store.profile().locale,'zh-TW');assert.equal(store.profile().preferences.musicVolume,.3);store.close();
});
test('settings reject unknown fields and invalid types while clamping volume',()=>{
 assert.deepEqual(cleanPreferences({music:'true',voiceVolume:NaN,musicVolume:7,openingMotion:false,untrusted:'x'}),{openingMotion:false,musicVolume:1});
});
