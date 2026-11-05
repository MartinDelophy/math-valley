import {useEffect,useRef,useState} from 'react';
import {ArrowRight,ArrowCounterClockwise,Compass,X,Check,BookmarkSimple,Pause,Play} from '@phosphor-icons/react';
import {t,useLocale} from '../i18n/react';
import {SettingsButton,useSettingsPanel} from '../settings/Settings';
import {useSettings} from '../settings/store';
import {FitText} from '../FitText';
import {LEVELS} from '../catalog';
import {createOpeningScene} from './scene';
import './opening.css';

export function journeyLocation(profile){
 const level=LEVELS.find(l=>l.id===profile.currentLevel);
 return level?`${t(level.chapter===2?'第二章 · 回环之塔':'第一章 · 桥与连通')} · ${level.displayId||level.id} ${t(level.title)}`:t('序章 · 方向与旋转');
}
export function OpeningPanel({kind,archives=[],busy,error,onCancel,onNew,onRestore}){
 const locale=useLocale(),box=useRef();
 useEffect(()=>{
  const previous=document.activeElement;box.current?.querySelector('button')?.focus();
  const key=e=>{if(e.key==='Escape'&&!busy)onCancel();if(e.key!=='Tab')return;const buttons=[...box.current.querySelectorAll('button:not(:disabled)')];if(!buttons.length)return;if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus();}};
  window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus();};
 },[busy]);
 return <div className="opening-shade" onClick={()=>{if(!busy)onCancel();}}><section ref={box} className="opening-dialog" role={kind==='new'?'alertdialog':'dialog'} aria-modal="true" aria-labelledby="opening-dialog-title" aria-describedby="opening-dialog-description" onClick={e=>e.stopPropagation()}>
  <button className="opening-close" aria-label={t('返回开场')} disabled={busy} onClick={onCancel}><X size={23}/></button>
  <Compass size={25} weight="light" className="opening-dialog-mark"/>
  <h2 id="opening-dialog-title">{t(kind==='new'?'开启新的旅程？':'往昔旅程')}</h2>
  <p id="opening-dialog-description">{t(kind==='new'?'新旅程将从序章教学开始。当前的进度会保留为备份，之后可以在“往昔旅程”中恢复。':'选择一段旅程继续。恢复时，当前旅程也会先留下备份。')}</p>
  {error&&<p className="opening-error" role="alert">{t(error)}</p>}
  {kind==='new'?<div className="opening-confirm-actions"><button className="opening-cancel" disabled={busy} onClick={onCancel}>{t('留在当前旅程')}</button><button className="opening-plate" disabled={busy} onClick={onNew}>{t(busy?'正在准备旅程…':'保留备份并出发')}<ArrowRight size={19}/></button></div>:<div className="opening-archives">{!archives.length&&<p className="opening-empty">{t('还没有往昔旅程。开始新旅程时，当前进度会自动留作备份。')}</p>}{archives.map(archive=><button className="opening-archive" key={archive.id} disabled={busy} onClick={()=>onRestore(archive.id)} aria-label={t(`恢复旅程 · ${new Date(archive.createdAt).toLocaleString(locale)}`)}><span><small>{new Date(archive.createdAt).toLocaleString(locale)}</small><strong>{journeyLocation(archive.profile)}</strong><em>{t(`已完成 ${archive.profile.completed.filter(id=>id!=='intro').length} / ${LEVELS.length} 关`)}</em></span><ArrowRight size={23}/></button>)}</div>}
 </section></div>;
}
export function StartScreen({profile,hasJourney,archives=[],isStale=false,onContinue,onNew,onRestore,onEntered}){
 const {isOpen:settingsOpen}=useSettingsPanel(),preferences=useSettings();
 const locale=useLocale(),host=useRef(),root=useRef(),scene=useRef(),mounted=useRef(false),locked=useRef(false),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(()=>typeof window!=='undefined'&&Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)),[departing,setDeparting]=useState(false),[panel,setPanel]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[sceneError,setSceneError]=useState(false);
 const display=useRef({profile,hasJourney});
 if(!busy)display.current={profile,hasJourney};
 profile=display.current.profile;hasJourney=display.current.hasJourney;
 useEffect(()=>{
  mounted.current=true;
  try{scene.current=createOpeningScene(host.current,{reduced,onFade:value=>{if(root.current)root.current.style.opacity=String(1-value);}});}catch(e){console.error('Opening scene unavailable',e);setSceneError(true);}
  return()=>{mounted.current=false;scene.current?.dispose();scene.current=null;};
 },[]);
 useEffect(()=>{const query=window.matchMedia?.('(prefers-reduced-motion: reduce)');const change=()=>setReduced(Boolean(query?.matches));query?.addEventListener('change',change);return()=>query?.removeEventListener('change',change);},[]);
 useEffect(()=>{scene.current?.reduce(reduced);},[reduced]);
 useEffect(()=>{scene.current?.pause(paused||!preferences.openingMotion||Boolean(panel)||busy||settingsOpen);},[paused,panel,busy,settingsOpen,preferences.openingMotion]);
 useEffect(()=>{document.title=`Math Valley · ${t('旅程的起点')}`;},[locale]);
 async function begin(action){
  if(locked.current)return;locked.current=true;setBusy(true);setError('');
  try{
   if(!await action()){setError('这次没有保存成功，原旅程仍然保留。请重试。');return;}
   if(!mounted.current)return;
   setPanel(null);setDeparting(true);
   // The destination is mounted behind the opaque opening while the camera
   // travels, so the final dissolve reveals a rendered scene instead of blank.
   const complete=scene.current?await scene.current.enter():true;
   if(complete&&mounted.current)onEntered?.();
  }catch{setError('这次没有保存成功，原旅程仍然保留。请重试。');setDeparting(false);if(root.current)root.current.style.opacity='1';}
  finally{if(mounted.current){locked.current=false;setBusy(false);}}
 }
 const done=profile.completed.filter(id=>id!=='intro').length,current=LEVELS.find(level=>level.id===profile.currentLevel);
 const chapter=current?t(current.chapter===2?'第二章 · 回环之塔':'第一章 · 桥与连通'):t('序章 · 方向与旋转');
 return <main ref={root} className={`opening-screen ${departing?'is-departing':''}`} aria-busy={busy}>
  <div className="opening-layout" inert={Boolean(panel)||departing}>
   <div className="opening-scene" ref={host} inert aria-hidden="true"/>
   {sceneError&&<div className="opening-fallback" aria-hidden="true"><img src="/social-preview.jpg" alt=""/></div>}
   <div className="opening-left">
    <h1>Math Valley</h1><p className="opening-local-name">{locale==='zh-CN'?'数学漫游':t('一场数学的漫游')}</p>
    <p className="opening-tagline">{t('在空间的转角，发现数学的结构。')}</p>
    <div className="opening-entry">
     {hasJourney&&<div className="opening-last"><BookmarkSimple className="opening-bookmark" weight="fill"/><div><p className="opening-chapter">{chapter}</p>{current&&<p className="opening-level">{current.displayId||current.id} {t(current.title)}</p>}<small><Check size={19}/>{t(`已完成 ${done} / ${LEVELS.length} 关`)}</small></div></div>}
     {isStale?<><p className="opening-error" role="alert">{t('另一个页面已切换旅程，请刷新后继续。')}</p><button className="opening-plate" onClick={()=>location.reload()}>{t('刷新旅程')}<ArrowCounterClockwise size={19}/></button></>:<>
      <button className="opening-plate opening-primary" disabled={busy} onClick={()=>begin(hasJourney?onContinue:onNew)}><FitText>{t(busy?'正在进入…':hasJourney?'继续旅程':'开始旅程')}</FitText></button>
      {hasJourney&&<button className="opening-new" disabled={busy} onClick={()=>{setError('');setPanel('new');}}><ArrowCounterClockwise size={17}/>{t('开始新旅程')}</button>}
      {!hasJourney&&<p className="opening-first">{t('从序章出发，先观察，再亲手验证。')}</p>}
     </>}
     {error&&<p className="opening-error" role="alert">{t(error)}</p>}
    </div>
    <footer className="opening-footer"><SettingsButton disabled={busy} withLabel/></footer>
   </div>
   <div className="opening-utilities">{!reduced&&preferences.openingMotion&&<button className="opening-motion" aria-label={t(paused?'播放开场动画':'暂停开场动画')} title={t(paused?'播放开场动画':'暂停开场动画')} disabled={busy} onClick={()=>setPaused(value=>!value)}>{paused?<Play size={19}/>:<Pause size={19}/>}</button>}<button className="opening-history" disabled={busy} onClick={()=>{setError('');setPanel('archives');}}>{t('往昔旅程')}<ArrowRight size={22}/></button></div>
  </div>
  {departing&&<span className="opening-status" role="status">{t('正在进入旅程…')}</span>}
  {panel&&<OpeningPanel kind={panel} archives={archives} busy={busy} error={error} onCancel={()=>{setError('');setPanel(null);}} onNew={()=>begin(onNew)} onRestore={id=>begin(()=>onRestore(id))}/>}
 </main>;
}
