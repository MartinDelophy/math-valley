const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const {once}=require('node:events');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function review({win,output,waitFor}){
 const js=code=>win.webContents.executeJavaScript(code),click=selector=>js(`document.querySelector(${JSON.stringify(selector)}).click()`),data=JSON.parse(await fs.readFile(path.join(output,'fixtures.json'),'utf8'));
 const report=[];win.setMinimumSize(320,500);win.show();win.focus();
 const capture=async name=>{await delay(250);await js("document.getAnimations().forEach(a=>{if(Number.isFinite(a.effect.getTiming().iterations))a.finish();})");await js("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))");const box=await js("(()=>{const r=document.querySelector('.folded-paper').getBoundingClientRect();return {x:Math.max(0,Math.floor(r.x-38)),y:Math.floor(r.y),width:Math.ceil(r.width+38),height:Math.ceil(r.height)};})()");await fs.writeFile(path.join(output,name+'.json'),JSON.stringify(await js("({tab:document.querySelector('[role=tab][aria-selected=true]')?.dataset.tab,page:document.querySelector('.notebook-pagination output')?.textContent,heading:document.querySelector('.notebook-flow h3')?.textContent})"),null,2));await fs.writeFile(path.join(output,name+'.png'),(await win.webContents.capturePage(box)).toPNG());};
 for(const fixture of data.fixtures){
  if(await js("Boolean(document.querySelector('.quiet-menu'))")){
   await click('.quiet-menu');await waitFor(win,"Boolean(document.querySelector('.journal-text-button'))");await js("[...document.querySelectorAll('.journal-text-button')].find(b=>b.querySelector('svg')&&b.textContent===document.querySelector('.journal-tools .journal-text-button')?.textContent)?.click()");
   await waitFor(win,"Boolean(document.querySelector('.opening-primary'))");
  }
    await js(`new Promise((resolve,reject)=>{const request=indexedDB.open('math-valley');request.onsuccess=()=>{const db=request.result,tx=db.transaction(['profile','levels'],'readwrite'),s=tx.objectStore('profile'),q=s.get('player');q.onsuccess=()=>s.put({...q.result,currentLevel:${JSON.stringify(fixture.id)},locale:${JSON.stringify('zh-CN')},lessons:${JSON.stringify(data.lessons)},preferences:{paperOpen:true,labels:false,music:false,openingMotion:false}},'player');const levels=tx.objectStore('levels');levels.clear();levels.put({schemaVersion:1,levelId:${JSON.stringify(fixture.id)},updatedAt:Date.now(),checkpoint:${JSON.stringify(fixture.checkpoint)}});tx.oncomplete=()=>{db.close();resolve(true);};tx.onabort=()=>reject(tx.error);};request.onerror=()=>reject(request.error);})`);
  const loaded=once(win.webContents,'did-finish-load');win.webContents.reload();await loaded;await waitFor(win,"Boolean(document.querySelector('.opening-primary'))");await click('.opening-primary');await waitFor(win,"!document.querySelector('.opening-screen')&&Boolean(document.querySelector('.paper-notebook'))");
  const sizes=process.env.MATH_VALLEY_NOTEBOOK_CAPTURE==='1'?[[1672,768]]:fixture.id==='intro'?[[1672,941],[1366,768],[800,600],[390,844]]:[[1366,768]];
  for(const [width,height] of sizes){win.setContentSize(width,height);
   for(const locale of ['zh-CN','zh-TW','en','ja','ko','fr','de','es','pt-BR']){
    await click('.quiet-menu');await waitFor(win,"Boolean(document.querySelector('.journal-settings'))");await click('.journal-settings');await waitFor(win,"Boolean(document.querySelector('.settings-dialog'))");await click(`.language-picker button[lang="${locale}"]`);await click('.settings-close');await click('.journal-close');await delay(50);
    if(fixture.id==='intro'&&width===1672&&locale==='de')await capture('reference-state-de');
    const checkpointBefore=await js(`new Promise((resolve,reject)=>{const r=indexedDB.open('math-valley');r.onsuccess=()=>{const db=r.result,tx=db.transaction('levels','readonly'),q=tx.objectStore('levels').get(${JSON.stringify(fixture.id)});tx.oncomplete=()=>{resolve(JSON.stringify(q.result.checkpoint.state||q.result.checkpoint));db.close();};};r.onerror=()=>reject(r.error);})`);
    for(const tab of ['observe','prove']){
     await click(`[data-tab="${tab}"]`);await waitFor(win,`document.querySelector('[data-tab="${tab}"]').getAttribute('aria-selected')==='true'`);await delay(40);
     const count=await js("Number(document.querySelector('.notebook-pagination output').textContent.split('/')[1])");assert(count>0&&count<40,`${fixture.name}/${locale}/${width}: invalid page count ${count}`);
     for(let page=0;page<count;page++){
      const metrics=await js(`(()=>{const viewport=document.querySelector('.notebook-viewport'),v=viewport.getBoundingClientRect(),flow=document.querySelector('.notebook-flow'),button=document.querySelector('.notebook-action'),r=button.getBoundingClientRect(),label=button.querySelector('span'),l=label.getBoundingClientRect(),issues=[];const walker=document.createTreeWalker(flow,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(!node.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(node);for(const q of range.getClientRects()){if(q.width<1||q.right<v.left+1||q.left>v.right-1)continue;if(q.top<v.top-3||q.bottom>v.bottom+3||q.left<v.left-3||q.right>v.right+3)issues.push({text:node.textContent.slice(0,45),rect:{left:q.left,top:q.top,right:q.right,bottom:q.bottom},viewport:{left:v.left,top:v.top,right:v.right,bottom:v.bottom}});}}return {issues,buttonFits:button.scrollWidth<=button.clientWidth+1&&l.top>=r.top&&l.bottom<=r.bottom,buttonLines:l.height/parseFloat(getComputedStyle(label).lineHeight),globalOverflow:document.documentElement.scrollWidth>innerWidth,paperOverflow:document.querySelector('.paper-content').scrollWidth>document.querySelector('.paper-content').clientWidth+1,buttonTop:r.top,buttonBottom:r.bottom};})()`);
      report.push({fixture:fixture.name,locale,width,height,tab,page:page+1,count,...metrics});
      if(metrics.issues.length||!metrics.buttonFits||metrics.globalOverflow||metrics.paperOverflow){await capture(`failure-${fixture.name}-${locale}-${width}-${tab}-${page+1}`);await fs.writeFile(path.join(output,'layout-failure.json'),JSON.stringify(report.at(-1),null,2));throw Error(`Notebook layout failed: ${fixture.name}/${locale}/${width}/${tab}/${page+1} ${JSON.stringify(metrics)}`);}
      if(page<count-1)await click('.notebook-pagination button:last-child');
     }
     if(fixture.id==='intro'&&['de','zh-CN'].includes(locale)&&width===390){while(await js("!document.querySelector('.notebook-pagination button:first-child').disabled"))await click('.notebook-pagination button:first-child');await capture(`mobile-${locale}-${tab}`);}
    }
    const checkpointAfter=await js(`new Promise((resolve,reject)=>{const r=indexedDB.open('math-valley');r.onsuccess=()=>{const db=r.result,tx=db.transaction('levels','readonly'),q=tx.objectStore('levels').get(${JSON.stringify(fixture.id)});tx.oncomplete=()=>{resolve(JSON.stringify(q.result.checkpoint.state||q.result.checkpoint));db.close();};};r.onerror=()=>reject(r.error);})`);assert.equal(checkpointAfter,checkpointBefore,'Notebook navigation changed the puzzle checkpoint');
    if(fixture.id==='intro'&&width===1672&&locale==='de'){
     await click('[data-tab="observe"]');await waitFor(win,"document.querySelector('[data-tab=\"observe\"]').getAttribute('aria-selected')==='true'");await delay(50);await capture('reference-state-de');await click('.notebook-pagination button:last-child');await capture('second-page-de');
    }
   }
  }
  console.log(`Notebook review: ${fixture.name} passed`);
 }
 await fs.writeFile(path.join(output,'layout-review.json'),JSON.stringify(report,null,2));console.log(`Notebook review passed: ${report.length} language/viewport/tab/page checks`);
}
module.exports={review};
