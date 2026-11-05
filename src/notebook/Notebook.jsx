import {useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import {CaretLeft,CaretRight,BookOpen} from '@phosphor-icons/react';
import {t,useLocale} from '../i18n/react';
import './notebook.css';
const GAP=24;
export function NotebookReader({children,resetKey,revealKey='',activeTab}){
 const viewport=useRef(),flow=useRef(),lastReveal=useRef(revealKey),[page,setPage]=useState(0),[layout,setLayout]=useState({count:1,stride:0});const locale=useLocale();
 useLayoutEffect(()=>{
  const measure=()=>{
   const width=viewport.current.clientWidth,stride=width+GAP;
   if(!width)return;
   const count=Math.max(1,Math.ceil((flow.current.scrollWidth+GAP-1)/stride));
   setLayout(old=>old.count===count&&old.stride===stride?old:{count,stride});
   const changed=lastReveal.current!==revealKey;lastReveal.current=revealKey;
   setPage(old=>changed&&revealKey?0:Math.min(old,count-1));
  };
  const observer=new ResizeObserver(measure);observer.observe(viewport.current);measure();let alive=true;document.fonts?.ready.then(()=>{if(alive)measure();});
  return()=>{alive=false;observer.disconnect();};
 },[children,locale,revealKey]);
 useEffect(()=>{setPage(0);},[resetKey,locale,activeTab]);
 return <section className="notebook-sheet" aria-label={t('手札内容')}>
  <div className="notebook-viewport" ref={viewport}>
   <div ref={flow} className="notebook-flow" style={{transform:`translateX(${-page*layout.stride}px)`}} onFocusCapture={event=>{
    const offset=event.target.getBoundingClientRect().left-flow.current.getBoundingClientRect().left;const next=Math.max(0,Math.min(layout.count-1,Math.floor((offset+1)/(layout.stride||1))));setPage(next);requestAnimationFrame(()=>{if(viewport.current)viewport.current.scrollLeft=0;});
   }}>{children}</div>
  </div>
  <nav className="notebook-pagination" aria-label={t('手札翻页')}>
   <button aria-label={t('上一页')} disabled={page===0} onClick={()=>setPage(value=>value-1)}><CaretLeft size={19}/></button>
   <output aria-live="polite" aria-atomic="true">{String(page+1).padStart(2,'0')} <span>/</span> {String(layout.count).padStart(2,'0')}</output>
   <button aria-label={t('下一页')} disabled={page>=layout.count-1} onClick={()=>setPage(value=>value+1)}><CaretRight size={19}/></button>
  </nav>
 </section>;
}
export function Notebook({kicker,goal,goalLines,stats,observe,prove,action,actionLabel,disabled=false,onPrinciple,resetKey,proofActive=false,feedbackKey='',className='',actionTab}){
 const [tab,setTab]=useState(proofActive?'prove':'observe');const id=useId();
 useEffect(()=>{setTab(proofActive?'prove':'observe');},[resetKey,proofActive]);
 useEffect(()=>{if(feedbackKey)setTab(proofActive?'prove':'observe');},[feedbackKey]);
 return <div className={`paper-content paper-notebook ${className}`}>
  <header className="notebook-heading"><p className="notebook-kicker">{t(kicker)}</p><h2 className="notebook-goal">{goalLines?goalLines.map(line=><span className="notebook-goal-line" key={line}>{t(line)}</span>):t(goal)}</h2></header>
  <div className="notebook-stats">{stats}</div>
  <div className="notebook-tabs" role="tablist" aria-label={t('手札视图')} onKeyDown={event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?'observe':event.key==='End'?'prove':tab==='observe'?'prove':'observe';setTab(next);event.currentTarget.querySelector(`[data-tab="${next}"]`)?.focus();
  }}>
   {['observe','prove'].map(kind=><button key={kind} role="tab" id={`${id}-${kind}`} data-tab={kind} aria-selected={tab===kind} aria-controls={`${id}-page`} tabIndex={tab===kind?0:-1} onClick={()=>setTab(kind)}>{t(kind==='observe'?'观察':'论证')}</button>)}
  </div>
  <div className="notebook-reader" role="tabpanel" id={`${id}-page`} aria-labelledby={`${id}-${tab}`}>
   <NotebookReader resetKey={resetKey} revealKey={feedbackKey} activeTab={tab}>{tab==='observe'?observe:prove}</NotebookReader>
  </div>
  <footer className="notebook-footer">
   <button className="paper-primary notebook-action" onClick={()=>{if(actionTab)setTab(actionTab);action?.();}} disabled={disabled}><span>{t(actionLabel)}</span></button>
   <button className="paper-book notebook-book" aria-label={t('原理手记')} onClick={onPrinciple}><BookOpen size={22} weight="light"/><span>{t('打开手记')}</span></button>
  </footer>
 </div>;
}
export function PrinciplePages({principles}){return principles.map(([title,copy])=><article className="notebook-leaf" key={title}><h3>{t(title)}</h3><p>{t(copy)}</p></article>);}
