// Run only in an isolated diagnostics profile selected by the test launcher.
// This code is part of the app's own packaged integration test, not an IPC API.
const {app}=require('electron');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const {once}=require('node:events');
async function waitFor(win,expression) {
 const deadline=Date.now()+60000;
 while(Date.now()<deadline){if(await win.webContents.executeJavaScript(expression))return;await new Promise(resolve=>setTimeout(resolve,100));}
 throw Error(`Desktop renderer did not become ready: ${expression}`);
}
async function run({registerContent,createWindow}) {
 app.setName('Math Valley desktop smoke');
 app.setPath('userData',process.env.MATH_VALLEY_SMOKE_PROFILE);
 const output=process.env.MATH_VALLEY_SMOKE_OUTPUT,phase=process.env.MATH_VALLEY_SMOKE_PHASE;
 if(['reduced','notebook','expansion'].includes(phase))app.commandLine.appendSwitch('force-prefers-reduced-motion');
 console.log(`Desktop smoke: ${phase} (packaged=${app.isPackaged}, arch=${process.arch})`);
 if(process.env.MATH_VALLEY_SMOKE_EXPECT_ARCH)assert.equal(process.arch,process.env.MATH_VALLEY_SMOKE_EXPECT_ARCH);
 let win;const errors=[],failed=[];
 const timeout=setTimeout(()=>{console.error('Desktop smoke timed out');app.exit(1);},['review','notebook','expansion'].includes(phase)?340000:90000);
 try{
  await app.whenReady();registerContent();
  win=createWindow({show:process.env.CI==='true',backgroundThrottling:false,width:1672,height:941,testViewport:true});
  win.webContents.on('render-process-gone',(_event,details)=>console.error('Renderer process exited',JSON.stringify(details)));
  win.webContents.on('console-message',event=>{if(event.level==='error')errors.push(event.message);});
  win.webContents.session.webRequest.onErrorOccurred(details=>{if(details.error==='net::ERR_ABORTED'&&details.url.endsWith('/audio/bach-prelude-bwv846.mp3'))return;failed.push({url:details.url,error:details.error});});
  await once(win.webContents,'did-finish-load');
  await waitFor(win,"Boolean(document.querySelector('.opening-primary') && document.querySelector('canvas')?.width)");
  if(phase==='expansion'){await require('./expansion-review.cjs').review({win,output,waitFor});assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);clearTimeout(timeout);win.destroy();app.exit(0);return;}
  if(phase==='notebook'){await require('./notebook-review.cjs').review({win,output,waitFor});assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);clearTimeout(timeout);win.destroy();app.exit(0);return;}
  if(phase==='review'){await fs.mkdir(output,{recursive:true});await require('./review.cjs').review({win,output,waitFor});assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);clearTimeout(timeout);win.destroy();app.exit(0);return;}
  const animated=await win.webContents.executeJavaScript("Boolean(document.querySelector('.opening-motion'))");
  const runtime=await win.webContents.executeJavaScript("({origin:location.origin,secure:isSecureContext,require:typeof require,process:typeof process,webgl:Boolean(document.querySelector('canvas').getContext('webgl2'))})");
  assert.equal(runtime.origin,'math-valley://app');assert.equal(runtime.secure,true);assert.equal(runtime.require,'undefined');assert.equal(runtime.process,'undefined');assert.equal(runtime.webgl,true);
  if(phase==='reduced'){assert.equal(animated,false);assert(await win.webContents.executeJavaScript("matchMedia('(prefers-reduced-motion: reduce)').matches"));}
  const saved=await win.webContents.executeJavaScript(`new Promise((resolve,reject)=>{const r=indexedDB.open('math-valley-desktop-smoke',1);r.onupgradeneeded=()=>r.result.createObjectStore('probe');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('probe',${phase==='create'?"'readwrite'":"'readonly'"});const request=${phase==='create'?"tx.objectStore('probe').put('persists-across-app-processes','key')":"tx.objectStore('probe').get('key')"};tx.oncomplete=()=>{const value=request.result;db.close();resolve(value);};tx.onabort=()=>reject(tx.error);};})`);
  if(phase!=='create'){assert.equal(saved,'persists-across-app-processes');assert.equal(await win.webContents.executeJavaScript("document.querySelector('.opening-primary').textContent"),'继续旅程');}
  // Capture after the first completed frame and all local textures have loaded.
  await new Promise(resolve=>setTimeout(resolve,1800));
  const image=await win.webContents.capturePage();assert(!image.isEmpty());
  const bitmap=image.toBitmap();let colorful=0;for(let i=0;i<bitmap.length;i+=400)if(bitmap[i+2]>150&&bitmap[i+1]>120)colorful++;
  assert(colorful>20,'3D ivory architecture did not render');
  await fs.mkdir(output,{recursive:true});await fs.writeFile(path.join(output,`desktop-${phase}.png`),image.toPNG());
  if(phase==='create'){
   if(animated){
    await new Promise(resolve=>setTimeout(resolve,800));const moving=await win.webContents.capturePage();assert(!moving.toPNG().equals(image.toPNG()),'The opening did not rotate');
    await win.webContents.executeJavaScript("document.querySelector('.opening-motion').click()");await new Promise(resolve=>setTimeout(resolve,200));
    const still=await win.webContents.capturePage();await new Promise(resolve=>setTimeout(resolve,500));assert((await win.webContents.capturePage()).toPNG().equals(still.toPNG()),'The pause control did not stop rotation');
    await win.webContents.executeJavaScript("document.querySelector('.opening-motion').click()");
   }
   await win.webContents.executeJavaScript("document.querySelector('.opening-footer .settings-trigger').click()");
   await waitFor(win,"Boolean(document.querySelector('.settings-dialog'))");
   // Audio interaction is checked separately on hardware; keep cloud CI silent.
   await win.webContents.executeJavaScript("for(const key of ['music']){const b=document.querySelector('[aria-labelledby=\"setting-'+key+'\"]');if(b.getAttribute('aria-checked')==='true')b.click();}");
   for(const locale of ['en','fr','de','es','pt-BR','zh-TW','ja','ko','zh-CN']){await win.webContents.executeJavaScript(`document.querySelector('.language-picker button[lang="${locale}"]').click()`);await waitFor(win,`document.documentElement.lang==="${locale}"`);}
   await win.webContents.executeJavaScript("document.querySelector('.settings-close').click()");
   await waitFor(win,"!document.querySelector('.settings-dialog')");
   const labelFits=await win.webContents.executeJavaScript("(()=>{const el=document.querySelector('.fit-label');return el.scrollWidth<=el.clientWidth+1&&el.getBoundingClientRect().height<document.querySelector('.opening-primary').clientHeight;})()");assert(labelFits,'Opening label overflowed its plate');
   await win.webContents.executeJavaScript("document.querySelector('.opening-primary').click()");
   if(animated){await waitFor(win,"Boolean(document.querySelector('.is-departing'))");await new Promise(resolve=>setTimeout(resolve,650));await fs.writeFile(path.join(output,'desktop-entry.png'),(await win.webContents.capturePage()).toPNG());}
   await waitFor(win,"Boolean(document.querySelector('.teaching-tour') || document.querySelector('[aria-labelledby=\"teaching-title\"]'))");
   await fs.writeFile(path.join(output,'desktop-teaching.png'),(await win.webContents.capturePage()).toPNG());
   await win.webContents.executeJavaScript("[...document.querySelectorAll('button')].find(button=>button.textContent==='回到开场').click()");
   await waitFor(win,"Boolean(document.querySelector('.opening-primary'))");
   // Isolated profile fixture matching the approved returning-player mock.
   await win.webContents.executeJavaScript(`new Promise((resolve,reject)=>{const r=indexedDB.open('math-valley');r.onsuccess=()=>{const db=r.result,tx=db.transaction('profile','readwrite'),store=tx.objectStore('profile'),p=store.get('player');p.onsuccess=()=>store.put({...p.result,currentLevel:'2-01',completed:['intro','2-02'],updatedAt:Date.now()},'player');tx.oncomplete=()=>{db.close();resolve(true);};tx.onabort=()=>reject(tx.error);};r.onerror=()=>reject(r.error);})`);
  }
  if(phase==='verify'||phase==='reduced'){
   await win.webContents.executeJavaScript("document.querySelector('.opening-primary').click()");
   await waitFor(win,"!document.querySelector('.opening-screen') && Boolean(document.querySelector('.game-shell'))");
   await new Promise(resolve=>setTimeout(resolve,300));
   if(phase==='verify'){
    await win.webContents.executeJavaScript("document.querySelector('[aria-label=\"跳过本次教学\"]')?.click()");
    await waitFor(win,"Boolean(document.querySelector('.paper-primary')) && !document.querySelector('.paper-primary').disabled && !document.querySelector('[aria-labelledby=\"teaching-title\"]')");
    await win.webContents.executeJavaScript("document.querySelector('.paper-primary').click()");
    await waitFor(win,"document.querySelector('.paper-primary').disabled");
    await waitFor(win,"!document.querySelector('.paper-primary').disabled");
    await win.webContents.executeJavaScript("document.querySelector('[aria-label=\"向右切换视角 E\"]').click()");
    await waitFor(win,"document.querySelector('.compass-face span').textContent==='Ⅱ'");
    await win.webContents.executeJavaScript("document.querySelector('.quiet-menu').click()");
    await waitFor(win,"Boolean(document.querySelector('.journal-text-button'))");
    await win.webContents.executeJavaScript("[...document.querySelectorAll('.journal-text-button')].find(button=>button.textContent.includes('回到开场')).click()");
    await waitFor(win,"Boolean(document.querySelector('.opening-primary'))");
    await win.webContents.executeJavaScript("document.querySelector('.opening-footer .settings-trigger').click()");
    await waitFor(win,"Boolean(document.querySelector('.save-tools-actions'))");
    const downloads=path.join(output,'downloads');await fs.mkdir(downloads,{recursive:true});const filename=path.join(downloads,'backup.json');
    const downloaded=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Save export did not download')),15000);win.webContents.session.once('will-download',(_event,item)=>{item.setSavePath(filename);item.once('done',(_event,state)=>{clearTimeout(timer);state==='completed'?resolve():reject(Error('Save download failed: '+state));});});});
    await win.webContents.executeJavaScript("document.querySelector('.save-tools-actions button:first-child').click()");await downloaded;
    const backup=JSON.parse(await fs.readFile(filename,'utf8'));assert.equal(backup.format,'math-valley-save');assert.equal(backup.version,1);assert.equal(backup.payload.profile.currentLevel,'2-01');
    await win.webContents.executeJavaScript("document.querySelector('.settings-close').click();document.querySelector('.opening-new').click()");
    await waitFor(win,"Boolean(document.querySelector('.opening-confirm-actions'))");await win.webContents.executeJavaScript("document.querySelector('.opening-confirm-actions .opening-plate').click()");
    await waitFor(win,"Boolean(document.querySelector('.teaching-actions'))");await win.webContents.executeJavaScript("document.querySelector('.teaching-actions>.teaching-secondary:last-child').click()");await waitFor(win,"Boolean(document.querySelector('.opening-primary'))");
    await win.webContents.executeJavaScript("document.querySelector('.opening-footer .settings-trigger').click()");await waitFor(win,"Boolean(document.querySelector('.save-tools-actions input'))");
    await win.webContents.executeJavaScript(`(()=>{const input=document.querySelector('.save-tools-actions input'),transfer=new DataTransfer();transfer.items.add(new File([${JSON.stringify(JSON.stringify(backup))}],'backup.json',{type:'application/json'}));input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await waitFor(win,"Boolean(document.querySelector('.save-preview'))");const reloaded=once(win.webContents,'did-finish-load');await win.webContents.executeJavaScript("document.querySelector('.save-preview button:last-child').click()");await reloaded;await waitFor(win,"Boolean(document.querySelector('.opening-primary'))");
    await win.webContents.executeJavaScript("document.querySelector('.opening-history').click()");await waitFor(win,"Boolean(document.querySelector('.opening-dialog .save-tools'))");win.show();win.focus();await win.webContents.executeJavaScript("document.getAnimations().forEach(a=>{if(Number.isFinite(a.effect.getTiming().iterations))a.finish();});new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))");await new Promise(resolve=>setTimeout(resolve,250));await fs.writeFile(path.join(output,'desktop-save-panel.png'),(await win.webContents.capturePage()).toPNG());
    win.setMinimumSize(320,600);win.setContentSize(390,844);await new Promise(resolve=>setTimeout(resolve,250));await fs.writeFile(path.join(output,'desktop-save-panel-mobile.png'),(await win.webContents.capturePage()).toPNG());win.setContentSize(1672,941);
    await win.webContents.executeJavaScript("document.querySelector('.opening-close').click()");
    console.log('Portable save export, preview, archive and restore passed');
   }else{
    await waitFor(win,"document.querySelector('.compass-face span').textContent==='Ⅱ'");
    const checkpoint=await win.webContents.executeJavaScript(`new Promise((resolve,reject)=>{const r=indexedDB.open('math-valley');r.onsuccess=()=>{const db=r.result,tx=db.transaction('levels','readonly'),q=tx.objectStore('levels').get('2-01');tx.oncomplete=()=>{const value=q.result.checkpoint;db.close();resolve(value);};tx.onabort=()=>reject(tx.error);};})`);
    assert.equal(checkpoint.state.layer,1);assert.equal(checkpoint.state.energy,1);assert.equal(checkpoint.camera.index,1);
    await fs.writeFile(path.join(output,'desktop-resumed-game.png'),(await win.webContents.capturePage()).toPNG());
   }
  }
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  const result={phase,arch:process.arch,runtime,errors,failed,persistence:phase==='create'?'created':'verified'};
  await fs.writeFile(path.join(output,`desktop-${phase}.json`),JSON.stringify(result,null,2));console.log(JSON.stringify(result));clearTimeout(timeout);win.destroy();app.exit(0);
 }catch(error){
  console.error(error);console.error('Renderer errors:',JSON.stringify(errors));clearTimeout(timeout);
  try{await fs.mkdir(output,{recursive:true});if(win&&!win.isDestroyed()){
   await fs.writeFile(path.join(output,`desktop-${phase}-failure.png`),(await win.webContents.capturePage()).toPNG());
   const state=await win.webContents.executeJavaScript("({text:document.body.innerText,compass:document.querySelector('.compass-face span')?.textContent,buttons:[...document.querySelectorAll('button')].map(button=>({text:button.textContent,label:button.getAttribute('aria-label'),disabled:button.disabled})),hidden:document.hidden})");
   console.error('Renderer state:',JSON.stringify(state));await fs.writeFile(path.join(output,`desktop-${phase}-failure.json`),JSON.stringify({message:error.message,state,errors,failed},null,2));
  }}catch(diagnosticError){console.error('Unable to capture diagnostics',diagnosticError.message);}
  win?.destroy();app.exit(1);
 }

}
module.exports={run};
