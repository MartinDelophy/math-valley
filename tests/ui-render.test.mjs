import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
let server,Journal,FoldedHud,TeachingTour,lessons,setLocale,levels,StartScreen,OpeningPanel;
before(async()=>{
 globalThis.document={documentElement:{lang:'zh-CN'}};
 globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
 server=await createServer({server:{middlewareMode:true,hmr:false,warmup:{clientFiles:[]}},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
 ({Journal}=await server.ssrLoadModule('/src/Journal.jsx'));
 ({FoldedHud}=await server.ssrLoadModule('/src/FoldedHud.jsx'));
 ({setLocale}=await server.ssrLoadModule('/src/i18n/react.jsx'));
 ({LEVELS:levels}=await server.ssrLoadModule('/src/catalog.js'));
 ({TeachingTour}=await server.ssrLoadModule('/src/teaching/TeachingTour.jsx'));
 ({StartScreen,OpeningPanel}=await server.ssrLoadModule('/src/opening/StartScreen.jsx'));
 ({LESSONS:lessons}=await server.ssrLoadModule('/src/teaching/lessons.js'));
});
after(async()=>{await server?.close();delete globalThis.document;delete globalThis.localStorage;});
for(const language of ['zh-CN','en','ja','ko'])test(`${language}: teaching scenes have accessible, translated welcome and skip controls`,()=>{
 setLocale(language);for(const lessonKey of Object.keys(lessons)){
  const html=renderToStaticMarkup(React.createElement(TeachingTour,{lessonKey,onFinish:()=>{}}));
  assert(html.includes('role="dialog"'));assert(html.includes('aria-modal="true"'));assert(html.includes('teaching-primary'));assert(html.includes('teaching-progress'));
  if(language==='en'||language==='ko')assert(!/[\u3400-\u9fff]/.test(html.replaceAll('中文','').replaceAll('日本語','')),`${language}/${lessonKey}`);
 }
});
for(const language of ['zh-CN','en','ja','ko'])test(`${language}: all chapter dialogs render with localized principles and no raw source text`,()=>{
 setLocale(language);for(let index=-1;index<levels.length;index++)for(const kind of ['tools','menu','principle','hint','success']){
 const html=renderToStaticMarkup(React.createElement(Journal,{kind,levelIndex:index,phase:0,completed:[],feedback:'行走与同伦证据均已验证。'}));
 assert(html.includes('role="dialog"'),`${language}/${index}/${kind}`);
 if(language==='en'||language==='ko'){
 const withoutNames=html.replaceAll('中文','').replaceAll('日本語','');assert(!/[\u3400-\u9fff]/.test(withoutNames),`${language}/${index}/${kind}: ${withoutNames.match(/.{0,20}[\u3400-\u9fff].{0,25}/)?.[0]}`);
 }
 }
});

for(const language of ['zh-CN','en','ja','ko'])test(`${language}: HUD and proof phases render for every level`,()=>{
 setLocale(language);for(const base of levels)for(let phase=0;phase<(base.phases?.length||((base.evidence||base.construct)?2:1));phase++){
 const level={...base,...base.phases?.[phase]};const game={active:Object.fromEntries(base.edges.map(e=>[e.id,e.on!==false])),flow:{},paths:[],draft:[],blocked:[],side:[],runes:[],groups:[],phase,layer:0,seals:0,energy:1,raw:['a'],word:['a'],proof:['a','A','b'],position:'S',view:0,camera:{index:0},feedback:'见证点尚未按序齐备：0 / 3。',tested:true};
 const html=renderToStaticMarkup(React.createElement(FoldedHud,{level,game,engine:{current:{}},open:()=>{},setPaperOpen:()=>{},paperOpen:true}));
 assert(html.includes('paper-primary'));if(language==='en'||language==='ko')assert(!/[\u3400-\u9fff]/.test(html),`${language}/${base.id}/${phase}: ${html.match(/.{0,20}[\u3400-\u9fff].{0,25}/)?.[0]}`);
 }
});

for(const language of ['zh-CN','en','ja','ko'])test(`${language}: opening supports new, returning, stale, confirmation and archive states`,()=>{
 setLocale(language);const profile={currentLevel:'2-01',completed:['intro','01']};
 const states=[React.createElement(StartScreen,{profile,hasJourney:false}),React.createElement(StartScreen,{profile,hasJourney:true}),React.createElement(StartScreen,{profile,hasJourney:true,isStale:true}),React.createElement(OpeningPanel,{kind:'new'}),React.createElement(OpeningPanel,{kind:'archives',archives:[]}),React.createElement(OpeningPanel,{kind:'archives',archives:[{id:'old',createdAt:100000,profile}]})];
 for(const view of states){const html=renderToStaticMarkup(view);assert(!html.includes('undefined'));if(language==='en'||language==='ko')assert(!/[\u3400-\u9fff]/.test(html.replaceAll('中文','').replaceAll('日本語','')),html);}
 const returning=renderToStaticMarkup(states[1]);assert(returning.includes('opening-primary'));assert(returning.includes('opening-new'));assert(returning.includes('opening-history'));
 assert(renderToStaticMarkup(states[3]).includes('role="alertdialog"'));assert(renderToStaticMarkup(states[4]).includes('opening-empty'));assert(renderToStaticMarkup(states[5]).includes('opening-archive'));
});
