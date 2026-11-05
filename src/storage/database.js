export const DATABASE_NAME='math-valley';
export const DATABASE_VERSION=1;
export const FALLBACK_KEY='math-valley-local-v1';
const clone=value=>JSON.parse(JSON.stringify(value));
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
const locales=['zh-CN','en','ja','ko'];
export function createSaveStore({indexedDB,localStorage,levelIds=['intro'],name=DATABASE_NAME,now=Date.now,openTimeout=3000}={}){
 const ids=new Set(levelIds),pending=new Set();let db=null,opening=null,initialized=false,backend='memory',lastTime=0;
 const stamp=()=>lastTime=Math.max(now(),lastTime+1);
 const defaults=()=>({schemaVersion:1,currentLevel:'intro',completed:[],locale:'zh-CN',lessons:{},preferences:{},updatedAt:0});
 function sanitize(value){
  const p=object(value)?value:{};
  return {...defaults(),currentLevel:ids.has(p.currentLevel)?p.currentLevel:'intro',completed:[...new Set(Array.isArray(p.completed)?p.completed.filter(id=>ids.has(id)):[])],locale:locales.includes(p.locale)?p.locale:'zh-CN',lessons:Object.fromEntries(Object.entries(object(p.lessons)?p.lessons:{}).filter(([key,v])=>/^[a-z]+$/.test(key)&&['completed','skipped'].includes(v))),preferences:Object.fromEntries(['labels','paperOpen'].filter(key=>typeof p.preferences?.[key]==='boolean').map(key=>[key,p.preferences[key]])),updatedAt:Number.isFinite(p.updatedAt)?p.updatedAt:0};
 }
 let profile=defaults();const levels=new Map();
 function readLocal(key){try{return JSON.parse(localStorage?.getItem(key)||'null');}catch{return null;}}
 function legacy(){
  const progress=readLocal('math-roam-chapter-v3');let locale;try{locale=localStorage?.getItem('math-valley-locale');}catch{}
  return sanitize({currentLevel:Number.isInteger(progress?.current)?levelIds[progress.current+1]:'intro',completed:progress?.completed,locale,lessons:readLocal('math-valley-lessons-v1')});
 }
 function merge(old,patch){
  const next=sanitize({...old,...patch,completed:[...(old?.completed||[]),...(patch.completed||[])],lessons:{...old?.lessons,...patch.lessons},preferences:{...old?.preferences,...patch.preferences}});
  // A cancelled replay must not downgrade an already completed lesson.
  for(const [key,status] of Object.entries(old?.lessons||{}))if(status==='completed')next.lessons[key]=status;
  return next;
 }
 function fallback(){
  try{localStorage.setItem(FALLBACK_KEY,JSON.stringify({schemaVersion:1,profile,levels:[...levels.values()]}));backend='localStorage';return true;}catch{backend='memory';return false;}
 }
 function track(promise){pending.add(promise);promise.finally(()=>pending.delete(promise));return promise;}
 function write(stores,action){
  if(!initialized)return Promise.resolve(false);
  if(!db)return Promise.resolve(fallback());
  return track(new Promise(resolve=>{
   try{
    const tx=db.transaction(stores,'readwrite');
    tx.oncomplete=()=>resolve(true);
    tx.onabort=()=>{db?.close();db=null;resolve(fallback());};
    tx.onerror=()=>{};
    action(tx);
   }catch{db?.close();db=null;resolve(fallback());}
  }));
 }
 async function init(){
  if(opening)return opening;
  opening=(async()=>{
   const backup=readLocal(FALLBACK_KEY);profile=backup?.schemaVersion===1?sanitize(backup.profile):legacy();
   if(backup?.schemaVersion===1&&Array.isArray(backup.levels))for(const row of backup.levels)if(ids.has(row?.levelId)&&row.schemaVersion===1&&object(row.checkpoint)&&Number.isFinite(row.updatedAt))levels.set(row.levelId,clone(row));
   try{
    db=await new Promise((resolve,reject)=>{
     if(!indexedDB){reject(Error('IndexedDB unavailable'));return;}
     let settled=false;const finish=(value,error)=>{if(settled){value?.close();return;}settled=true;clearTimeout(timer);error?reject(error):resolve(value);};
     const timer=setTimeout(()=>finish(null,Error('Database open timed out')),openTimeout);
     let request;try{request=indexedDB.open(name,DATABASE_VERSION);}catch(error){finish(null,error);return;}
     request.onupgradeneeded=()=>{const database=request.result;if(!database.objectStoreNames.contains('profile'))database.createObjectStore('profile');if(!database.objectStoreNames.contains('levels'))database.createObjectStore('levels',{keyPath:'levelId'});};
     request.onsuccess=()=>finish(request.result);request.onerror=()=>finish(null,request.error);request.onblocked=()=>finish(null,Error('Database upgrade blocked'));
    });
    db.onversionchange=()=>{db?.close();db=null;fallback();};
    const stored=await new Promise((resolve,reject)=>{
     const tx=db.transaction(['profile','levels'],'readonly'),p=tx.objectStore('profile').get('player'),l=tx.objectStore('levels').getAll();
     tx.oncomplete=()=>resolve({profile:p.result,levels:l.result});tx.onabort=()=>reject(tx.error);tx.onerror=()=>{};
    });
    if(stored.profile?.schemaVersion===1){const persisted=sanitize(stored.profile);profile=profile.updatedAt>persisted.updatedAt?merge(persisted,profile):merge(profile,persisted);}
    for(const row of stored.levels)if(ids.has(row?.levelId)&&row.schemaVersion===1&&object(row.checkpoint)&&(!levels.has(row.levelId)||row.updatedAt>=levels.get(row.levelId).updatedAt))levels.set(row.levelId,clone(row));
    lastTime=Math.max(profile.updatedAt,...[...levels.values()].map(row=>row.updatedAt));backend='indexedDB';initialized=true;
    // Commit migration as one transaction; the original legacy keys stay intact.
    await write(['profile','levels'],tx=>{
     const players=tx.objectStore('profile'),current=players.get('player');current.onsuccess=()=>{const latest=sanitize(current.result);profile=latest.updatedAt>profile.updatedAt?merge(profile,latest):merge(latest,profile);players.put(profile,'player');};
     const checkpoints=tx.objectStore('levels');for(const row of levels.values()){const request=checkpoints.get(row.levelId);request.onsuccess=()=>{if(request.result?.updatedAt>row.updatedAt)levels.set(row.levelId,clone(request.result));else checkpoints.put(row);};}
    });
   }catch{db?.close();db=null;initialized=true;fallback();}
   return clone(profile);
  })();return opening;
 }
 return {
  init,
  profile:()=>clone(profile),
  level:id=>levels.has(id)?clone(levels.get(id).checkpoint):null,
  backend:()=>backend,
  saveProfile(patch){
   profile=merge(profile,{...clone(patch),updatedAt:stamp()});
   const change=clone(patch),updatedAt=profile.updatedAt;
   return write(['profile'],tx=>{const store=tx.objectStore('profile'),request=store.get('player');request.onsuccess=()=>store.put(merge(request.result||defaults(),{...change,updatedAt}),'player');});
  },
  saveLevel(id,checkpoint){
   if(!ids.has(id)||!object(checkpoint))return Promise.resolve(false);
   if(JSON.stringify(levels.get(id)?.checkpoint)===JSON.stringify(checkpoint))return Promise.resolve(true);
   const row={levelId:id,schemaVersion:1,updatedAt:stamp(),checkpoint:clone(checkpoint)};levels.set(id,row);
   return write(['levels'],tx=>tx.objectStore('levels').put(row));
  },
  async flush(){await Promise.all([...pending]);},
  close(){db?.close();db=null;}
 };
}
