// Local visual review of our application, always in an isolated test profile.
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function review({win,output,waitFor}){
 const js=code=>win.webContents.executeJavaScript(code),click=selector=>js(`document.querySelector(${JSON.stringify(selector)}).click()`);
 const capture=async name=>{await js("document.getAnimations().forEach(animation=>{if(Number.isFinite(animation.effect.getTiming().iterations))animation.finish();})");await js("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))");await delay(200);await fs.writeFile(path.join(output,name+'.png'),(await win.webContents.capturePage()).toPNG());};
 const report=[];win.setMinimumSize(320,500);
 await js(`new Promise((resolve,reject)=>{const r=indexedDB.open('math-valley');r.onsuccess=()=>{const db=r.result,tx=db.transaction('profile','readwrite'),s=tx.objectStore('profile'),q=s.get('player');q.onsuccess=()=>s.put({...q.result,currentLevel:'2-01',completed:['intro','2-02'],lessons:{rotation:'completed',cover:'skipped'}},'player');tx.oncomplete=()=>{db.close();resolve(true);};};r.onerror=()=>reject(r.error);})`);
 await win.webContents.reload();await waitFor(win,"Boolean(document.querySelector('.opening-primary'))");await delay(1500);
 await click('.opening-motion');
 win.show();win.focus();await delay(400);
 const point=await js("(()=>{const r=document.querySelector('.opening-footer .settings-trigger').getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};})()");
 win.webContents.sendInputEvent({type:'mouseDown',...point,button:'left',clickCount:1});win.webContents.sendInputEvent({type:'mouseUp',...point,button:'left',clickCount:1});
 await waitFor(win,"Boolean(document.querySelector('.settings-dialog'))");
 await waitFor(win,"Boolean(document.querySelector('audio')?.readyState>=2&&!document.querySelector('audio').paused)");
 const before=await js("document.querySelector('audio').currentTime");await delay(700);const after=await js("document.querySelector('audio').currentTime");assert(after>before,'Piano audio did not advance');
 const audio=await js("({time:document.querySelector('audio').currentTime,error:document.querySelector('audio').error,voices:speechSynthesis.getVoices().map(v=>({name:v.name,lang:v.lang,local:v.localService}))})");
 await waitFor(win,"speechSynthesis.getVoices().length>0");
 audio.voices=await js("speechSynthesis.getVoices().map(v=>({name:v.name,lang:v.lang,local:v.localService}))");
 await click('.settings-preview');await waitFor(win,"speechSynthesis.speaking");await delay(500);audio.speechStarted=true;
 await click('.settings-preview');await waitFor(win,"!speechSynthesis.speaking");audio.speechStopped=true;
 await fs.writeFile(path.join(output,'audio-review.json'),JSON.stringify(audio,null,2));
 await js("for(const key of ['music','narration']){const b=document.querySelector('[aria-labelledby=\"setting-'+key+'\"]');if(b.getAttribute('aria-checked')==='true')b.click();}");
 assert(await js("document.querySelector('audio').paused"),'Music toggle did not pause playback');
 await click('.settings-close');
 for(const [w,h] of [[1672,941],[1366,768],[800,600],[390,844]]){
  win.setContentSize(w,h);await delay(300);
  for(const locale of ['en','fr','de','es','pt-BR','zh-TW','ja','ko','zh-CN']){
   await click('.opening-footer .settings-trigger');await waitFor(win,"Boolean(document.querySelector('.settings-dialog'))");
   await click(`.language-picker button[lang="${locale}"]`);
   if(w===1366&&['zh-CN','en','de'].includes(locale)||w===390&&['en','zh-CN'].includes(locale))await capture(`settings-${w}-${locale}`);
   await click('.settings-close');
   const state=await js("(()=>{const b=document.querySelector('.opening-primary'),t=b.querySelector('.fit-label'),r=b.getBoundingClientRect(),s=t.getBoundingClientRect();return {label:t.textContent,fits:t.scrollWidth<=t.clientWidth+1&&s.top>=r.top&&s.bottom<=r.bottom,pageOverflow:document.documentElement.scrollWidth>innerWidth};})()");
   assert(state.fits,`${w}/${locale}: primary label overflow`);assert(!state.pageOverflow,`${w}/${locale}: page overflow`);report.push({w,h,locale,...state});
   if(w===1366&&['en','zh-TW','de'].includes(locale)||w===390&&['en','zh-CN'].includes(locale))await capture(`opening-${w}-${locale}`);
  }
 }
 win.setContentSize(1366,768);await delay(300);
 await click('.opening-new');await waitFor(win,"Boolean(document.querySelector('.opening-dialog'))");await capture('opening-confirmation-zh-CN');await click('.opening-close');
 await click('.opening-history');await waitFor(win,"Boolean(document.querySelector('.opening-dialog'))");await capture('opening-archives-zh-CN');await click('.opening-close');
 await click('.opening-primary');await waitFor(win,"!document.querySelector('.opening-screen')&&Boolean(document.querySelector('.quiet-menu'))");
 await js("document.querySelector('[aria-label=\"跳过本次教学\"]')?.click()");await delay(300);
 for(const [type,selector] of [['tools','.quiet-menu'],['principle','.paper-book']]){
  await click(selector);await waitFor(win,"Boolean(document.querySelector('.journal'))");await capture(`journal-${type}-zh-CN`);await click('.journal-close');
 }
 await click('.quiet-menu');await js("[...document.querySelectorAll('.tool-list>button')].find(button=>button.textContent==='路上的提示').click()");await waitFor(win,"Boolean(document.querySelector('.journal-hint'))");await capture('journal-hint-zh-CN');await click('.journal-close');
 await click('.quiet-menu');await waitFor(win,"Boolean(document.querySelector('.journal-settings'))");await click('.journal-settings');await waitFor(win,"Boolean(document.querySelector('.settings-dialog'))");await click('.language-picker button[lang="de"]');await click('.settings-close');await capture('journal-tools-de');
 await js("[...document.querySelectorAll('.tool-list>button')].find(button=>button.textContent.includes('Kapitel')).click()");await delay(300);await capture('journal-chapters-de');
 await click('.journal-close');await click('.quiet-menu');await js("[...document.querySelectorAll('.tool-list>button')].find(button=>button.textContent.includes('Demonstration')).click()");
 await waitFor(win,"Boolean(document.querySelector('.teaching-settings-global'))");await capture('teaching-de');
 await click('.teaching-settings-global');await waitFor(win,"Boolean(document.querySelector('.settings-dialog'))");await capture('teaching-settings-de');await click('.settings-close');
 await js("document.querySelector('.teaching-actions>.teaching-secondary:last-child').click()");await waitFor(win,"Boolean(document.querySelector('.opening-primary'))");
 await click('.opening-primary');await waitFor(win,"!document.querySelector('.opening-screen')&&Boolean(document.querySelector('.quiet-menu'))");await js("document.querySelector('.teaching-skip')?.click()");await delay(300);
 await click('.quiet-menu');await js("[...document.querySelectorAll('.tool-list>button')].find(button=>button.textContent.includes('Kapitel')).click()");await click('.journal-menu .journal-text-button');
 await waitFor(win,"Boolean(document.querySelector('.crank-target'))");await click('.crank-target');await waitFor(win,"document.querySelector('.rotation-label>span')?.textContent.includes('90°')");await waitFor(win,"!document.querySelector('.paper-primary').disabled");await click('.paper-primary');await waitFor(win,"Boolean(document.querySelector('.journal-success'))");await capture('journal-success-de');
 win.setContentSize(390,844);await capture('journal-success-390-de');
 await fs.writeFile(path.join(output,'layout-review.json'),JSON.stringify(report,null,2));
 console.log(`Native layout review passed: ${report.length} title/locale/viewport combinations`);
}
module.exports={review};
