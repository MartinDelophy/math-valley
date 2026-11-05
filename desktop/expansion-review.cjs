const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const {once}=require('node:events');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function review({win,output,waitFor}){
 const fixture=JSON.parse(await fs.readFile(path.join(output,'fixture.json'),'utf8')),js=code=>win.webContents.executeJavaScript(code);
 win.setContentSize(1366,850);win.show();win.focus();
 const click=async selector=>{await waitFor(win,`Boolean(document.querySelector(${JSON.stringify(selector)}))`);await js(`document.querySelector(${JSON.stringify(selector)}).focus({preventScroll:true})`);await delay(280);const rect=await js(`(()=>{const b=document.querySelector(${JSON.stringify(selector)}),r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,disabled:b.disabled};})()`);assert(!rect.disabled,selector);assert(rect.x>0&&rect.x<1366&&rect.y>0&&rect.y<850,`Control not reachable: ${selector} ${JSON.stringify(rect)}`);await js(`document.querySelector(${JSON.stringify(selector)}).click()`);};
 await js(`new Promise((resolve,reject)=>{const r=indexedDB.open('math-valley');r.onsuccess=()=>{const db=r.result,tx=db.transaction(['profile','levels'],'readwrite'),s=tx.objectStore('profile'),q=s.get('player');q.onsuccess=()=>s.put({...q.result,currentLevel:${JSON.stringify(fixture.id)},locale:'zh-CN',lessons:${JSON.stringify(fixture.lessons)},preferences:{paperOpen:true,music:false,soundEffects:false,openingMotion:false}},'player');tx.objectStore('levels').put({schemaVersion:1,levelId:${JSON.stringify(fixture.id)},updatedAt:Date.now(),checkpoint:${JSON.stringify(fixture.checkpoint)}});tx.oncomplete=()=>{db.close();resolve(true)};tx.onabort=()=>reject(tx.error)};r.onerror=()=>reject(r.error);})`);
 let loaded=once(win.webContents,'did-finish-load');win.webContents.reload();await loaded;await waitFor(win,"Boolean(document.querySelector('.opening-primary'))");await click('.opening-primary');await waitFor(win,"!document.querySelector('.opening-screen')&&Boolean(document.querySelector('.expansion-notebook'))");
 if(fixture.tutorial){
  await waitFor(win,"Boolean(document.querySelector('.teaching-overlay'))");await click('.teaching-actions>.teaching-secondary');
  for(let i=0;i<fixture.lessonSteps;i++){
   await waitFor(win,"Boolean(document.querySelector('.teaching-primary.is-guided:not(:disabled)'))");
   const old=await js("document.querySelector('.teaching-primary').textContent");await click('.teaching-primary');
   await waitFor(win,i===fixture.lessonSteps-1?"document.querySelector('.teaching-primary').textContent.includes('开始正式探索')":`document.querySelector('.teaching-primary').textContent!==${JSON.stringify(old)}&&!document.querySelector('.teaching-primary').disabled`);
  }
  await fs.writeFile(path.join(output,'teaching-complete.png'),(await win.webContents.capturePage()).toPNG());await click('.teaching-primary');await waitFor(win,"!document.querySelector('.teaching-overlay')");
  console.log(`Independent teaching practice passed: ${fixture.id}`);
 }

 const checkpoint=()=>js(`new Promise(resolve=>{const r=indexedDB.open('math-valley');r.onsuccess=()=>{const db=r.result,tx=db.transaction('levels','readonly'),q=tx.objectStore('levels').get(${JSON.stringify(fixture.id)});tx.oncomplete=()=>{db.close();resolve(q.result?.checkpoint)};}})`);
 const savedCount=async count=>{for(let n=0;n<80;n++){const c=await checkpoint();if(c?.actions?.length===count)return c;await delay(100);}throw Error(`Checkpoint action count ${count} not reached`)};
 await delay(650);await fs.writeFile(path.join(output,'scene-start.png'),(await win.webContents.capturePage()).toPNG());
 // Camera changes must not change the mathematical trace.
 const before=await checkpoint();await click('.compass-arrow:nth-of-type(2)');await waitFor(win,"!document.querySelector('.notebook-action').disabled");const after=await checkpoint();assert.deepEqual(after.actions,before.actions);
 // New settings must contain only music/effects, with no speech controls.
 await click('.quiet-menu');await click('.journal-settings');assert.equal(await js("Boolean(document.querySelector('[aria-labelledby=\"setting-narration\"],.settings-preview,.read-aloud'))"),false);await click('.settings-close');await click('.journal-close');
 const trace=[];
 for(const action of fixture.actions){
  const [method,arg]=action;await waitFor(win,"!document.querySelector('.notebook-action').disabled");
  if(method==='s'){
   const selector='[data-math-action="s"]';if(await js(`document.querySelector('${selector}').textContent.includes('对齐')`)){await click(selector);await waitFor(win,"!document.querySelector('.notebook-action').disabled");}await click(selector);
  }else if(method==='bit'){
   const view=fixture.views[arg];const current=await js("['Ⅰ','Ⅱ','Ⅲ','Ⅳ'].indexOf(document.querySelector('.compass-face span').textContent)");if(current!==view){await click(`[data-bit="${arg}"]`);await waitFor(win,"!document.querySelector('.notebook-action').disabled");}await click(`[data-bit="${arg}"]`);
  }else await click(method==='test'?'.notebook-action':`[data-math-action="${method}"]`);
  trace.push(action);const c=await savedCount(trace.length);assert.deepEqual(c.actions,trace);
  if(trace.length===2){
   // Real reload proves that new engines restore their own checkpoint and camera.
   const camera=c.camera;loaded=once(win.webContents,'did-finish-load');win.webContents.reload();await loaded;await waitFor(win,"Boolean(document.querySelector('.opening-primary'))");await click('.opening-primary');await waitFor(win,"!document.querySelector('.opening-screen')&&Boolean(document.querySelector('.expansion-notebook'))");
 if(fixture.tutorial){
  await waitFor(win,"Boolean(document.querySelector('.teaching-overlay'))");await click('.teaching-actions>.teaching-secondary');
  for(let i=0;i<fixture.lessonSteps;i++){
   await waitFor(win,"Boolean(document.querySelector('.teaching-primary.is-guided:not(:disabled)'))");
   const old=await js("document.querySelector('.teaching-primary').textContent");await click('.teaching-primary');
   await waitFor(win,i===fixture.lessonSteps-1?"document.querySelector('.teaching-primary').textContent.includes('开始正式探索')":`document.querySelector('.teaching-primary').textContent!==${JSON.stringify(old)}&&!document.querySelector('.teaching-primary').disabled`);
  }
  await fs.writeFile(path.join(output,'teaching-complete.png'),(await win.webContents.capturePage()).toPNG());await click('.teaching-primary');await waitFor(win,"!document.querySelector('.teaching-overlay')");
  console.log(`Independent teaching practice passed: ${fixture.id}`);
 }
await waitFor(win,"!document.querySelector('.notebook-action').disabled");const resumed=await checkpoint();assert.deepEqual(resumed.actions,trace);assert.deepEqual(resumed.camera,camera);
  }
 }
 await click('.notebook-action');await waitFor(win,"Boolean(document.querySelector('.journal-success'))");assert((await checkpoint()).won);await delay(250);await fs.writeFile(path.join(output,'scene-success.png'),(await win.webContents.capturePage()).toPNG());await fs.writeFile(path.join(output,'result.json'),JSON.stringify({id:fixture.id,passed:true,actions:trace.length,checkpoint:await checkpoint()},null,2));console.log(`Expansion native playthrough passed: ${fixture.id} (${trace.length} actions)`);
}
module.exports={review};
