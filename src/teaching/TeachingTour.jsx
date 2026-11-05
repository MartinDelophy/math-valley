import {useEffect,useRef,useState} from 'react';
import {ArrowRight,Check,Play,Pause,ArrowCounterClockwise,X,Compass} from '@phosphor-icons/react';
import {t,useLocale} from '../i18n/react';
import {createGame} from '../game';
import {createChapterGame} from '../chapter/scene';
import {createTopologyGame} from '../topology/scene';
import {formatWord,winding} from '../topology/math';
import {LESSONS} from './lessons';
import {SettingsButton,useSettingsPanel} from '../settings/Settings';
import './teaching.css';

export function TeachingTour({lessonKey,onFinish,onHome}){
 const {isOpen:settingsOpen}=useSettingsPanel();
 const locale=useLocale(),lesson=LESSONS[lessonKey],host=useRef(),engine=useRef(),pins=useRef({}),overlay=useRef();
 const [stage,setStage]=useState('welcome'),[step,setStep]=useState(0),[epoch,setEpoch]=useState(0),[game,setGame]=useState({}),[armed,setArmed]=useState(false),[gesture,setGesture]=useState(false),[error,setError]=useState(false);
 const [reduced]=useState(()=>typeof window!=='undefined'&&(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false));
 const current=lesson.steps[step],busy=game.walking||game.turning||game.camera?.busy;
 useEffect(()=>{
  setGame({});setError(false);
  const project=positions=>{for(const [kind,items] of Object.entries(positions))for(const [id,p] of Object.entries(items)){const pin=pins.current[kind+id];if(pin){pin.style.transform=`translate(${p.x}px,${p.y}px) translate(-50%,-50%)`;pin.style.visibility=p.visible===false?'hidden':'visible';}}};
  try{
   engine.current=lesson.engine==='intro'?createGame(host.current,{onState:setGame,onProject:p=>project({intro:{handle:p.handle,house:p.house}})}):lesson.engine==='chapter'?createChapterGame(host.current,lesson.level,{onState:setGame,onProject:project}):createTopologyGame(host.current,lesson.level,{onState:setGame});
  }catch(e){console.error('Teaching scene failed',e);setError(true);}
  return()=>{engine.current?.dispose();engine.current=null;};
 },[lessonKey,epoch]);
 useEffect(()=>{host.current?.querySelector('canvas')?.setAttribute('aria-label',t('独立教学场景'));},[locale,epoch]);
 useEffect(()=>{overlay.current?.scrollTo({top:0});},[stage,epoch]);
 useEffect(()=>{if(['practice','summary','complete'].includes(stage))overlay.current?.querySelector('.teaching-primary')?.focus({preventScroll:true});},[stage,step]);
 useEffect(()=>{engine.current?.pause(stage==='paused'||settingsOpen);},[stage,epoch,settingsOpen]);
 function run(){if(busy||error||armed)return;setArmed(true);if(stage!=='practice'||!current.done(game))engine.current?.[current.method]?.(...current.args);}
 useEffect(()=>{if(stage==='practice'&&gesture&&!busy&&current.done(game))setArmed(true);},[game,gesture,stage,step,busy]);
 useEffect(()=>{
  if(stage!=='practice'||settingsOpen)return;
  const key=e=>{if(!['q','e'].includes(e.key.toLowerCase())||busy||armed||!engine.current?.turnView)return;e.preventDefault();engine.current.turnView(e.key.toLowerCase()==='q'?-1:1);setGesture(true);};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[stage,busy,armed,settingsOpen]);
 useEffect(()=>{
  if(stage!=='watch'||reduced||busy||error||armed||settingsOpen)return;
  const timer=setTimeout(run,1500);return()=>clearTimeout(timer);
 },[stage,step,busy,armed,error,epoch,settingsOpen]);
 useEffect(()=>{
  if(settingsOpen||!armed||busy||!['watch','practice'].includes(stage)||!current.done(game))return;
  const timer=setTimeout(()=>{
   setArmed(false);setGesture(false);
   if(step===lesson.steps.length-1)setStage(stage==='watch'?'summary':'complete');
   else setStep(value=>value+1);
  },650);return()=>clearTimeout(timer);
 },[game,armed,stage,step,busy,settingsOpen]);
 function start(next){setStep(0);setArmed(false);setGesture(false);setStage(next);setEpoch(value=>value+1);}
 const interactive=stage==='practice'||(stage==='watch'&&reduced),inScene=['watch','practice','paused'].includes(stage);
 let evidence=lesson.engine==='intro'?(game.aligned?'90° · ✓':'90°'):lesson.engine==='topology'?`${formatWord(game.raw||[])}  ·  n = ${winding(game.raw||[])}  ·  ${lesson.level.kind==='universal'?(game.layer??0):['Ⅰ','Ⅱ','Ⅲ'][game.layer??0]}`:lessonKey==='spatial'?`${game.position||'S'}  ·  ${['Ⅰ','Ⅱ','Ⅲ','Ⅳ'][game.view??0]}  ·  ◆ ${game.runes?.length||0}`:game.flowStatus?`f = ${game.flowStatus.value}  ·  ∂S = ${game.cutValue??0}`:lessonKey==='routes'?`${game.draft?.join(' → ')||'S'}  ·  ${game.paths?.length||0} / 2`:null;
 return <section className="teaching-overlay" ref={overlay} role="dialog" aria-modal="true" aria-labelledby="teaching-title">
  <div className="teaching-scene" ref={host} inert={!interactive||busy||armed} onPointerUp={()=>{if(stage==='practice')setGesture(true);}}/>
  <div className="teaching-pins" aria-hidden="true">
   {lesson.engine==='intro'?['handle','house'].map((id,i)=><span key={id} ref={el=>{pins.current['intro'+id]=el;}} className={`teaching-pin ${inScene&&step===i?'is-target':''}`}>{i+1}</span>):lesson.level?.nodes.map(n=><span key={n.id} ref={el=>{pins.current['nodes'+n.id]=el;}} className={`teaching-pin ${current.args?.[0]===n.id&&inScene?'is-target':''}`}>{n.id}</span>)}
   {lesson.engine==='chapter'&&lesson.level.edges.filter(e=>e.cap).map(e=><span key={e.id} ref={el=>{pins.current['edges'+e.id]=el;}} className={`teaching-pin teaching-edge ${game.selected===e.id?'is-selected':''}`}>{e.u}→{e.v} · {game.flow?.[e.id]||0}/{e.cap}</span>)}
  </div>
  <header className="teaching-heading"><Compass size={24} weight="light"/><span>{t('教学演示')}<small>{t('独立练习 · 不消耗关卡行动')}</small></span><SettingsButton className="teaching-settings-global"/></header>
  {evidence&&<output className="teaching-evidence" aria-label={t('演示中的数学记录')}>{evidence}</output>}
  <aside className="teaching-paper">
   <img className="teaching-paper-art" src="/assets/hud/folded-paper.png" alt=""/>
   <div className="teaching-content">
    <div className="teaching-topline"><span>{t(stage==='practice'?'轮到你了':stage==='complete'?'练习完成':'先观察，再验证')}</span><button className="teaching-skip" onClick={()=>onFinish('skipped')} aria-label={t('跳过本次教学')}><X size={18}/>{t('跳过')}</button></div>
    <h2 id="teaching-title">{t(lesson.title)}</h2>
    <ol className="teaching-progress" aria-label={t('教学步骤')}>{lesson.steps.map((_,i)=><li key={i} aria-current={i===step?'step':undefined} className={i<step||stage==='complete'||stage==='summary'?'is-done':''}><span>{i+1}</span></li>)}</ol>
    <div className="teaching-copy" aria-live="polite">
     {error?<><h3>{t('演示暂时未能打开')}</h3><p>{t('可以先跳过，稍后从旅途菜单重新观看。')}</p></>:stage==='welcome'?<><h3>{t('看懂动作背后的原理')}</h3><p>{t('先看旅人操作一遍，再在这个小场景中亲手验证。演示可以暂停或跳过，正式关卡的解法留给你。')}</p><div className="teaching-principle"><span>{t('这一页要理解')}</span><p>{t(lesson.principle)}</p></div></>:stage==='summary'||stage==='complete'?<><h3>{t(stage==='summary'?'刚才为什么能成功？':'动作与原理，已经连起来了')}</h3><p>{t(lesson.principle)}</p><p className="teaching-quiet">{t(stage==='summary'?'接下来由你操作同一个小例子。':'回到关卡后，先看目标，再观察结构，最后提交证据。')}</p></>:<><h3>{t(current.label)}</h3><p>{t(current.copy)}</p>{stage==='practice'&&<p className="teaching-quiet">{t('点击下方高亮动作，观察场景和数学记录的变化。')}</p>}{stage==='paused'&&<p className="teaching-quiet">{t('演示已暂停')}</p>}</>}
    </div>
    <div className="teaching-actions">
     {error?<button className="teaching-primary" onClick={()=>start('watch')}>{t('重试演示')}</button>:stage==='welcome'?<><button className="teaching-primary" onClick={()=>start('watch')}><Play size={19} weight="fill"/>{t('先看演示')}</button><button className="teaching-secondary" onClick={()=>start('practice')}>{t('直接动手试试')}<ArrowRight size={17}/></button></>:stage==='summary'?<><button className="teaching-primary" onClick={()=>start('practice')}>{t('轮到我试试')}<ArrowRight size={19}/></button><button className="teaching-secondary" onClick={()=>start('watch')}><ArrowCounterClockwise size={16}/>{t('再看一遍')}</button></>:stage==='complete'?<><button className="teaching-primary" onClick={()=>onFinish('completed')}><Check size={20}/>{t('开始正式探索')}</button><button className="teaching-secondary" onClick={()=>start('practice')}>{t('再练习一次')}</button></>:<><button className={`teaching-primary ${stage==='practice'?'is-guided':''}`} disabled={busy||armed||stage==='paused'||(stage==='watch'&&!reduced)} onClick={run}>{busy||armed?t('观察变化…'):t(stage==='watch'&&reduced?'演示下一步':stage==='watch'?'演示进行中':current.label)}</button><div className="teaching-playback">{stage!=='practice'&&<button onClick={()=>setStage(stage==='paused'?'watch':'paused')}>{stage==='paused'?<Play size={16}/>:<Pause size={16}/>} {t(stage==='paused'?'继续演示':'暂停演示')}</button>}<button onClick={()=>start(stage==='practice'?'practice':'watch')}><ArrowCounterClockwise size={16}/>{t('从头开始')}</button>{stage==='watch'&&<button onClick={()=>start('practice')}>{t('由我来操作')}</button>}</div></>}
     <p className="teaching-footnote">{t('之后可在旅途菜单中重看教学。')}</p>{onHome&&<button className="teaching-secondary" onClick={onHome}>{t('回到开场')}</button>}
    </div>
   </div>
  </aside>
 </section>;
}
