// Run only in an isolated diagnostics profile selected by the test launcher.
// This code is part of the app's own packaged integration test, not an IPC API.
const {app}=require('electron');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const {once}=require('node:events');
async function waitFor(win,expression) {
 const deadline=Date.now()+30000;
 while(Date.now()<deadline){if(await win.webContents.executeJavaScript(expression))return;await new Promise(resolve=>setTimeout(resolve,100));}
 throw Error(`Desktop renderer did not become ready: ${expression}`);
}
async function run({registerContent,createWindow}) {
 app.setName('Math Valley desktop smoke');
 app.setPath('userData',process.env.MATH_VALLEY_SMOKE_PROFILE);
 const output=process.env.MATH_VALLEY_SMOKE_OUTPUT,phase=process.env.MATH_VALLEY_SMOKE_PHASE;
 let win;const errors=[],failed=[];
 const timeout=setTimeout(()=>{console.error('Desktop smoke timed out');app.exit(1);},60000);
 try{
  await app.whenReady();registerContent();
  win=createWindow({show:false,backgroundThrottling:false});
  win.webContents.on('console-message',(_event,details,...rest)=>{const level=typeof details==='object'?details.level:details;const message=typeof details==='object'?details.message:rest[0];if(level==='error'||level===3)errors.push(message);});
  win.webContents.session.webRequest.onErrorOccurred(details=>failed.push({url:details.url,error:details.error}));
  await once(win.webContents,'did-finish-load');
  await waitFor(win,"Boolean(document.querySelector('.opening-primary') && document.querySelector('canvas')?.width)");
  const runtime=await win.webContents.executeJavaScript("({origin:location.origin,secure:isSecureContext,require:typeof require,process:typeof process,webgl:Boolean(document.querySelector('canvas').getContext('webgl2'))})");
  assert.equal(runtime.origin,'math-valley://app');assert.equal(runtime.secure,true);assert.equal(runtime.require,'undefined');assert.equal(runtime.process,'undefined');assert.equal(runtime.webgl,true);
  const saved=await win.webContents.executeJavaScript(`new Promise((resolve,reject)=>{const r=indexedDB.open('math-valley-desktop-smoke',1);r.onupgradeneeded=()=>r.result.createObjectStore('probe');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('probe',${phase==='create'?"'readwrite'":"'readonly'"});const request=${phase==='create'?"tx.objectStore('probe').put('persists-across-app-processes','key')":"tx.objectStore('probe').get('key')"};tx.oncomplete=()=>{const value=request.result;db.close();resolve(value);};tx.onabort=()=>reject(tx.error);};})`);
  if(phase==='verify'){assert.equal(saved,'persists-across-app-processes');assert.equal(await win.webContents.executeJavaScript("document.querySelector('.opening-primary').textContent"),'继续旅程');}
  // Capture after the first completed frame and all local textures have loaded.
  await new Promise(resolve=>setTimeout(resolve,1800));
  const image=await win.webContents.capturePage();assert(!image.isEmpty());
  const bitmap=image.getBitmap();let colorful=0;for(let i=0;i<bitmap.length;i+=400)if(bitmap[i+2]>150&&bitmap[i+1]>120)colorful++;
  assert(colorful>20,'3D ivory architecture did not render');
  await fs.mkdir(output,{recursive:true});await fs.writeFile(path.join(output,`desktop-${phase}.png`),image.toPNG());
  if(phase==='create'){
   for(const locale of ['en','ja','ko','zh-CN']){await win.webContents.executeJavaScript(`document.querySelector('.language-picker button[lang="${locale}"]').click()`);await waitFor(win,`document.documentElement.lang==="${locale}"`);}
   await win.webContents.executeJavaScript("document.querySelector('.opening-primary').click()");
   await waitFor(win,"Boolean(document.querySelector('.teaching-tour') || document.querySelector('[aria-labelledby=\"teaching-title\"]'))");
   await win.webContents.executeJavaScript("[...document.querySelectorAll('button')].find(button=>button.textContent==='回到开场').click()");
   await waitFor(win,"Boolean(document.querySelector('.opening-primary'))");
  }
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  const result={phase,runtime,errors,failed,persistence:phase==='verify'?'verified':'created'};
  await fs.writeFile(path.join(output,`desktop-${phase}.json`),JSON.stringify(result,null,2));console.log(JSON.stringify(result));clearTimeout(timeout);win.destroy();app.exit(0);
 }catch(error){console.error(error);clearTimeout(timeout);win?.destroy();app.exit(1);}
}
module.exports={run};
