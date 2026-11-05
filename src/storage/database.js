import {isLocale} from '../i18n/languages.js';
import {cleanPreferences} from '../settings/model.js';
export const DATABASE_NAME='math-valley';
export const DATABASE_VERSION=2;
export const FALLBACK_KEY='math-valley-local-v1';
const clone=value=>JSON.parse(JSON.stringify(value));
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
const generation=value=>value?.journeyId||'original';
const stores=['profile','levels','archives'];
export function createSaveStore({indexedDB,localStorage,levelIds=['intro'],name=DATABASE_NAME,now=Date.now,openTimeout=3000}={}){
 const ids=new Set(levelIds),pending=new Set(),levels=new Map(),archives=new Map();
 let db=null,opening=null,initialized=false,backend='memory',lastTime=0,stale=false,switching=false,transitionFrom=null;
 const stamp=()=>lastTime=Math.max(now(),lastTime+1);
 const identifier=()=>globalThis.crypto?.randomUUID?.()||`${stamp()}-${Math.random().toString(36).slice(2)}`;
 const defaults=()=>({schemaVersion:1,journeyId:'original',startedAt:0,currentLevel:'intro',completed:[],locale:'zh-CN',lessons:{},preferences:{},updatedAt:0});
 function sanitize(value){
  const p=object(value)?value:{};
  return {...defaults(),journeyId:typeof p.journeyId==='string'&&p.journeyId.length<100?p.journeyId:'original',startedAt:Number.isFinite(p.startedAt)?p.startedAt:0,currentLevel:ids.has(p.currentLevel)?p.currentLevel:'intro',completed:[...new Set(Array.isArray(p.completed)?p.completed.filter(id=>ids.has(id)):[])],locale:isLocale(p.locale)?p.locale:'zh-CN',lessons:Object.fromEntries(Object.entries(object(p.lessons)?p.lessons:{}).filter(([key,v])=>/^[a-z]+$/.test(key)&&['completed','skipped'].includes(v))),preferences:cleanPreferences(p.preferences),updatedAt:Number.isFinite(p.updatedAt)?p.updatedAt:0};
 }
 let profile=defaults();
 function readLocal(key){try{return JSON.parse(localStorage?.getItem(key)||'null');}catch{return null;}}
 function legacy(){
  const progress=readLocal('math-roam-chapter-v3');let locale;try{locale=localStorage?.getItem('math-valley-locale');}catch{}
  return sanitize({currentLevel:Number.isInteger(progress?.current)?levelIds[progress.current+1]:'intro',completed:progress?.completed,locale,lessons:readLocal('math-valley-lessons-v1')});
 }
 function merge(old,patch){
  if(generation(old)!==generation(patch))return sanitize(patch);
  const next=sanitize({...old,...patch,completed:[...(old?.completed||[]),...(patch.completed||[])],lessons:{...old?.lessons,...patch.lessons},preferences:{...old?.preferences,...patch.preferences}});
  for(const [key,status] of Object.entries(old?.lessons||{}))if(status==='completed')next.lessons[key]=status;
  return next;
 }
 const validRow=row=>ids.has(row?.levelId)&&row.schemaVersion===1&&object(row.checkpoint)&&Number.isFinite(row.updatedAt);
 const validArchive=row=>row?.schemaVersion===1&&typeof row.id==='string'&&Number.isFinite(row.createdAt)&&object(row.profile)&&Array.isArray(row.levels)&&row.levels.every(validRow);
 const meaningful=(p,rows)=>Boolean(p.startedAt||p.currentLevel!=='intro'||p.completed.length||Object.keys(p.lessons).length||rows.some(r=>r.levelId!=='intro'||r.checkpoint.turns||r.checkpoint.won));
 function bundle(){return {schemaVersion:1,profile,levels:[...levels.values()],archives:[...archives.values()],transitionFrom};}
 function persistLocal(value){try{localStorage.setItem(FALLBACK_KEY,JSON.stringify(value));backend='localStorage';return true;}catch{backend='memory';return false;}}
 const fallback=()=>persistLocal(bundle());
 function apply(value){profile=sanitize(value.profile);levels.clear();for(const row of value.levels)levels.set(row.levelId,clone(row));archives.clear();for(const row of value.archives)archives.set(row.id,clone(row));transitionFrom=value.transitionFrom||null;stale=false;}
 function track(promise){pending.add(promise);promise.finally(()=>pending.delete(promise));return promise;}
 function guard(latest,expected,tx,context){if(generation(latest)!==expected){context.stale=true;tx.abort();return false;}return true;}
 function write(names,action){
  if(!initialized||stale||switching)return Promise.resolve(false);
  if(!db)return Promise.resolve(fallback());
  return track(new Promise(resolve=>{
   const context={stale:false};
   try{const tx=db.transaction(names,'readwrite');tx.oncomplete=()=>resolve(true);tx.onabort=()=>{if(context.stale){stale=true;resolve(false);}else{db?.close();db=null;resolve(fallback());}};tx.onerror=()=>{};action(tx,context);}
   catch{db?.close();db=null;resolve(fallback());}
  }));
 }
 async function init(){
  if(opening)return opening;
  opening=(async()=>{
   const backup=readLocal(FALLBACK_KEY);profile=backup?.schemaVersion===1?sanitize(backup.profile):legacy();transitionFrom=backup?.transitionFrom||null;
   for(const row of Array.isArray(backup?.levels)?backup.levels:[])if(validRow(row)&&generation(row)===profile.journeyId)levels.set(row.levelId,clone(row));
   for(const row of Array.isArray(backup?.archives)?backup.archives:[])if(validArchive(row))archives.set(row.id,clone(row));
   try{
    db=await new Promise((resolve,reject)=>{
     if(!indexedDB){reject(Error('IndexedDB unavailable'));return;}
     let settled=false;const finish=(value,error)=>{if(settled){value?.close();return;}settled=true;clearTimeout(timer);error?reject(error):resolve(value);};
     const timer=setTimeout(()=>finish(null,Error('Database open timed out')),openTimeout);
     let request;try{request=indexedDB.open(name,DATABASE_VERSION);}catch(error){finish(null,error);return;}
     request.onupgradeneeded=()=>{const database=request.result;if(!database.objectStoreNames.contains('profile'))database.createObjectStore('profile');if(!database.objectStoreNames.contains('levels'))database.createObjectStore('levels',{keyPath:'levelId'});if(!database.objectStoreNames.contains('archives'))database.createObjectStore('archives',{keyPath:'id'});};
     request.onsuccess=()=>finish(request.result);request.onerror=()=>finish(null,request.error);request.onblocked=()=>finish(null,Error('Database upgrade blocked'));
    });
    db.onversionchange=()=>{db?.close();db=null;fallback();};
    const stored=await new Promise((resolve,reject)=>{
     const tx=db.transaction(stores,'readonly'),p=tx.objectStore('profile').get('player'),l=tx.objectStore('levels').getAll(),a=tx.objectStore('archives').getAll();
     tx.oncomplete=()=>resolve({profile:p.result,levels:l.result,archives:a.result});tx.onabort=()=>reject(tx.error);tx.onerror=()=>{};
    });
    if(stored.profile?.schemaVersion===1){
     const persisted=sanitize(stored.profile);
     if(profile.journeyId!==persisted.journeyId){if(transitionFrom!==persisted.journeyId||profile.updatedAt<=persisted.updatedAt){profile=persisted;levels.clear();transitionFrom=null;}}
     else profile=profile.updatedAt>persisted.updatedAt?merge(persisted,profile):merge(profile,persisted);
    }
    for(const row of stored.levels)if(validRow(row)&&generation(row)===profile.journeyId&&(!levels.has(row.levelId)||row.updatedAt>=levels.get(row.levelId).updatedAt))levels.set(row.levelId,clone(row));
    for(const row of stored.archives)if(validArchive(row))archives.set(row.id,clone(row));
    lastTime=Math.max(profile.updatedAt,...[...levels.values()].map(row=>row.updatedAt),...[...archives.values()].map(row=>row.createdAt));backend='indexedDB';initialized=true;
    await write(stores,(tx,context)=>{
     const players=tx.objectStore('profile'),current=players.get('player');current.onsuccess=()=>{
      const latest=sanitize(current.result);
      if(current.result&&latest.journeyId!==profile.journeyId&&latest.journeyId!==transitionFrom){context.stale=true;tx.abort();return;}
      if(latest.journeyId===profile.journeyId)profile=latest.updatedAt>profile.updatedAt?merge(profile,latest):merge(latest,profile);
      players.put(profile,'player');
     };
     const checkpoints=tx.objectStore('levels');for(const row of levels.values()){const request=checkpoints.get(row.levelId);request.onsuccess=()=>{if(generation(request.result)===profile.journeyId&&request.result?.updatedAt>row.updatedAt)levels.set(row.levelId,clone(request.result));else checkpoints.put(row);};}
     for(const row of archives.values())tx.objectStore('archives').put(row);
    });
   }catch{db?.close();db=null;initialized=true;fallback();}
   return clone(profile);
  })();return opening;
 }
 function candidate(base,rows,prior,targetId){
  const saved=targetId?prior.find(a=>a.id===targetId):null;if(targetId&&!saved)return null;
  const all=[...prior];if(meaningful(base,rows))all.push({schemaVersion:1,id:identifier(),createdAt:stamp(),profile:clone(base),levels:clone(rows)});
  const journeyId=identifier(),updatedAt=stamp();
  const next=sanitize({...saved?.profile,journeyId,startedAt:saved?.profile.startedAt||updatedAt,locale:base.locale,preferences:base.preferences,updatedAt});
  return {schemaVersion:1,profile:next,levels:(saved?.levels||[]).map(row=>({...clone(row),journeyId,updatedAt})),archives:all,transitionFrom:base.journeyId};
 }
 async function switchJourney(targetId){
  if(!initialized||stale||switching)return false;await Promise.all([...pending]);if(stale||switching)return false;switching=true;
  const expected=profile.journeyId;let next=null;
  const keepLocal=()=>{next??=candidate(profile,[...levels.values()],[...archives.values()],targetId);if(!next)return false;if(persistLocal(next)||!meaningful(profile,[...levels.values()])){apply(next);return true;}return false;};
  try{
   if(!db)return keepLocal();
   return await new Promise(resolve=>{
    try{
     const tx=db.transaction(stores,'readwrite'),p=tx.objectStore('profile').get('player'),l=tx.objectStore('levels').getAll(),a=tx.objectStore('archives').getAll();let count=0,conflict=false;
     tx.oncomplete=()=>{if(next){next.transitionFrom=null;apply(next);resolve(true);}else resolve(false);};
     tx.onabort=()=>{if(conflict){stale=true;resolve(false);}else{db?.close();db=null;resolve(keepLocal());}};tx.onerror=()=>{};
     const ready=()=>{if(++count!==3)return;const base=sanitize(p.result);if(base.journeyId!==expected){conflict=true;tx.abort();return;}
      next=candidate(base,l.result.filter(row=>validRow(row)&&generation(row)===expected),a.result.filter(validArchive),targetId);if(!next)return;
      for(const row of next.archives)tx.objectStore('archives').put(row);tx.objectStore('levels').clear();for(const row of next.levels)tx.objectStore('levels').put(row);tx.objectStore('profile').put(next.profile,'player');
     };p.onsuccess=l.onsuccess=a.onsuccess=ready;
    }catch{db?.close();db=null;resolve(keepLocal());}
   });
  }finally{switching=false;}
 }
 return {
  init,profile:()=>clone(profile),level:id=>levels.has(id)?clone(levels.get(id).checkpoint):null,backend:()=>backend,isStale:()=>stale,
  hasJourney:()=>meaningful(profile,[...levels.values()]),
  archives:()=>[...archives.values()].sort((a,b)=>b.createdAt-a.createdAt).map(({id,createdAt,profile})=>({id,createdAt,profile:clone(profile)})),
  startNewJourney:()=>switchJourney(null),restoreJourney:id=>switchJourney(id),
  saveProfile(patch){
   if(stale||switching)return Promise.resolve(false);const expected=profile.journeyId;
   const change={...clone(patch),journeyId:expected,updatedAt:stamp()};profile=merge(profile,change);
   return write(['profile'],(tx,context)=>{const store=tx.objectStore('profile'),request=store.get('player');request.onsuccess=()=>{if(guard(request.result,expected,tx,context))store.put(merge(request.result||defaults(),change),'player');};});
  },
  saveLevel(id,checkpoint){
   if(stale||switching||!ids.has(id)||!object(checkpoint))return Promise.resolve(false);
   if(JSON.stringify(levels.get(id)?.checkpoint)===JSON.stringify(checkpoint))return Promise.resolve(true);
   const expected=profile.journeyId,row={levelId:id,journeyId:expected,schemaVersion:1,updatedAt:stamp(),checkpoint:clone(checkpoint)};levels.set(id,row);
   return write(['profile','levels'],(tx,context)=>{const request=tx.objectStore('profile').get('player');request.onsuccess=()=>{if(guard(request.result,expected,tx,context))tx.objectStore('levels').put(row);};});
  },
  async flush(){await Promise.all([...pending]);},close(){db?.close();db=null;}
 };
}
