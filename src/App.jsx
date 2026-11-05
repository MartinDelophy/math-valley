import { t, useLocale } from './i18n/react';
import { useEffect,useRef,useState } from 'react';
import { ArrowArcLeft,ArrowArcRight,Check,Compass,Diamond } from '@phosphor-icons/react';
import { createGame } from './game';
import { createChapterGame } from './chapter/scene';
import { LEVELS } from './catalog';
import { createTopologyGame } from './topology/scene';
import { usable } from './chapter/spatial';
import { Journal } from './Journal';
import { FoldedHud } from './FoldedHud';
import {TeachingTour} from './teaching/TeachingTour';
import {lessonFor} from './teaching/lessons';
import {saves} from './storage/index';
import './chapter/chapter.css';
import './chapter/revision.css';
const blank={active:{},flow:{},paths:[],draft:[],blocked:[],side:[],runes:[],phase:0,layer:0,seals:0,raw:[],word:[],proof:[],position:'S',view:0,energy:0,moves:0,camera:{index:0},won:false,walking:false,turning:false,feedback:'',selected:null,interaction:'flow',groups:[]};
function readProgress(){const p=saves.profile();return {completed:p.completed,current:p.currentLevel==='intro'?-1:LEVELS.findIndex(level=>level.id===p.currentLevel)};}
const romans=['Ⅰ','Ⅱ','Ⅲ','Ⅳ'];
export function App(){
 const locale=useLocale();
 const [lessons,setLessons]=useState(()=>saves.profile().lessons),[tutorial,setTutorial]=useState(null);
 const saved=useRef(readProgress()),[index,setIndex]=useState(saved.current.current),[completed,setCompleted]=useState(saved.current.completed),[game,setGame]=useState(blank),[dialog,setDialog]=useState(null),[error,setError]=useState(false),[snapshot,setSnapshot]=useState(''),[labels,setLabels]=useState(()=>saves.profile().preferences.labels??false),[paperOpen,setPaperOpen]=useState(()=>saves.profile().preferences.paperOpen??window.innerWidth>900);
 const host=useRef(),engine=useRef(),hud=useRef({}),handle=useRef(),rotation=useRef(),drag=useRef(null),controlPointer=useRef(null);
 const intro=index<0,base=LEVELS[index],L=base?{...base,...base.phases?.[game.phase||0]}:null,shown=error?'error':tutorial?'tutorial':dialog||game.won&&'success'||null;
 const currentLesson=lessonFor(base,game.phase||0,game.interaction);
 useEffect(()=>{if(currentLesson&&!lessons[currentLesson]&&!shown&&!game.walking&&!game.camera?.busy)setTutorial(currentLesson);},[currentLesson,lessons,shown,game.walking,game.camera?.busy]);
 function finishTutorial(result){
  setLessons(previous=>{const next={...previous,[tutorial]:previous[tutorial]==='completed'?'completed':result};saves.saveProfile({lessons:next});return next;});
  setTutorial(null);
  if(intro){if(result==='completed')setCompleted(previous=>previous.includes('intro')?previous:[...previous,'intro']);select(0);}
 }
 function replayTutorial(){setDialog(null);setTutorial(currentLesson);}
 useEffect(()=>{
  setGame(blank);setError(false);setSnapshot('');hud.current={};
  const id=intro?'intro':base.id,callbacks={onState:setGame,resume:saves.level(id),onCheckpoint:checkpoint=>saves.saveLevel(id,checkpoint)};
  try{engine.current=intro?createGame(host.current,{...callbacks,onProject:({handle:h,label:l})=>{if(handle.current)handle.current.style.transform=`translate(${h.x}px,${h.y}px) translate(-50%,-50%)`;if(rotation.current)rotation.current.style.transform=`translate(${l.x}px,${l.y}px) translate(-50%,0)`;}}):base.chapter===2?createTopologyGame(host.current,base,callbacks):createChapterGame(host.current,base,{...callbacks,onProject:positions=>{for(const [kind,points] of Object.entries(positions))for(const [id,p] of Object.entries(points)){const el=hud.current[kind+id];if(el){el.style.transform=`translate(${p.x}px,${p.y}px) translate(-50%,-50%)`;el.style.visibility=p.visible===false?'hidden':'visible';}}}});}catch(e){console.error('Scene initialization failed',e);setError(true);}
  return()=>engine.current?.dispose();
 },[index]);
 useEffect(()=>{engine.current?.pause(Boolean(shown));},[shown,index]);
 useEffect(()=>{if(game.won){const id=intro?'intro':base.id;setCompleted(old=>old.includes(id)?old:[...old,id]);if(!intro)setSnapshot(engine.current?.snapshot?.()||'');}},[game.won,index]);
 useEffect(()=>{document.title=intro?t('数学漫游 · 序章'):`${t('数学漫游')} · ${t(base.chapter===2?'第二章 · 回环之塔':'第一章 · 桥与连通')} · ${base.displayId||base.id} ${t(base.title)}`;const canvas=host.current?.querySelector('canvas');if(canvas)canvas.setAttribute('aria-label',t(intro?'三维关卡：起点、可旋转桥梁和终点小屋':'三维数学关卡，桥梁、平台与机关均可操作'));},[index,locale]);
 useEffect(()=>{saves.saveProfile({completed,currentLevel:intro?'intro':base.id});},[index,completed]);
 useEffect(()=>{saves.saveProfile({preferences:{labels,paperOpen}});},[labels,paperOpen]);
 function open(kind){if(!intro&&engine.current?.snapshot)setSnapshot(engine.current.snapshot());setDialog(kind);}
 function close(){if(error)return;if(shown==='tutorial'){finishTutorial('skipped');return;}if(shown==='success'){setDialog('menu');return;}setDialog(null);}
 function reset(){setDialog(null);engine.current?.reset();}
 function select(i){setDialog(null);controlPointer.current=null;if(i!==index){setGame(blank);setSnapshot('');setIndex(i);}}
 function next(){if(index<LEVELS.length-1)select(index+1);else setDialog('menu');}
 useEffect(()=>{const key=e=>{if(e.key==='Escape'){if(shown)close();return;}if(shown)return;if(!intro&&['q','Q','e','E'].includes(e.key)){e.preventDefault();engine.current?.turnView(e.key.toLowerCase()==='q'?-1:1);return;}if(e.target instanceof HTMLButtonElement)return;if(e.key==='Enter'){e.preventDefault();intro?engine.current?.walk():engine.current?.test();}if(intro&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();engine.current?.rotate(e.key==='ArrowLeft'?Math.PI/2:-Math.PI/2);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[shown,index,error]);
 useEffect(()=>{if(!shown)return;const previous=document.activeElement,box=document.querySelector('[role="dialog"]');box?.querySelector('button:not(:disabled)')?.focus();const trap=e=>{if(e.key!=='Tab')return;const b=box?.querySelectorAll('button:not(:disabled)');if(!b?.length)return;if(e.shiftKey&&document.activeElement===b[0]){e.preventDefault();b[b.length-1].focus();}else if(!e.shiftKey&&document.activeElement===b[b.length-1]){e.preventDefault();b[0].focus();}};window.addEventListener('keydown',trap);return()=>{window.removeEventListener('keydown',trap);if(previous?.isConnected)previous.focus();else document.querySelector('.quiet-menu')?.focus();};},[shown]);
 const blocked=Boolean(shown)||game.walking||game.turning,spatial=!intro&&L.mode==='spatial',cameraBusy=game.camera?.busy,flow=!intro&&['flow','flowcut','capacitycut','residual','residualcut'].includes(L.mode),construct=!intro&&['mst','repair','tree','cut'].includes(L.mode),nodeMode=!intro&&(['vertex','paths','residual','capacitycut','residualcut'].includes(L.mode)||(L.mode==='flowcut'&&game.interaction==='cut'));
 const showNodes=spatial||labels||nodeMode||flow,adjacent=spatial?L.edges.filter(e=>(e.u===game.position||e.v===game.position)&&usable(L,game,e)).map(e=>e.u===game.position?e.v:e.u):[];
 const shadowedNodes=new Set();if(spatial&&!cameraBusy)for(const e of L.edges.filter(e=>e.portal&&e.view===game.view)){const keep=game.position===e.u||game.position===e.v?game.position:adjacent.includes(e.u)?e.u:adjacent.includes(e.v)?e.v:e.v;shadowedNodes.add(keep===e.u?e.v:e.u);}

 function tool(action){
  setDialog(null);
  if(action==='labels'){setLabels(v=>!v);return;}
  requestAnimationFrame(()=>{engine.current?.pause(false);if(action==='reset')engine.current?.reset();else if(action==='clear')engine.current?.clearPaths();else if(action==='overhead')engine.current?.toggleOverhead();else if(action==='view')engine.current?.resetView();else if(action==='zoomIn')engine.current?.zoom(.12);else if(action==='zoomOut')engine.current?.zoom(-.12);});
 }
 return <main className={`game-shell folded-shell ${paperOpen?'paper-open':'paper-closed'} ${labels?'show-structure':''}`}><div className="world" ref={host} data-layout="folded" inert={Boolean(shown)}/>
  <FoldedHud intro={intro} level={L} game={game} engine={engine} open={open} paperOpen={paperOpen} setPaperOpen={setPaperOpen} blocked={blocked} shown={shown}/>
  {t(intro?<><button ref={handle} className="crank-target" aria-label={t("旋转桥梁90度")} disabled={blocked} onPointerDown={e=>{drag.current=true;e.currentTarget.setPointerCapture(e.pointerId);engine.current?.beginHandleDrag(e.clientX,e.clientY);}} onPointerMove={e=>{if(drag.current)engine.current?.moveHandleDrag(e.clientX,e.clientY);}} onPointerUp={e=>{if(drag.current){drag.current=false;engine.current?.endHandleDrag(e.clientX,e.clientY);}}} onClick={e=>{if(e.detail===0)engine.current?.rotate();}}/>{t(!game.walking&&!game.won&&<div className="rotation-label" ref={rotation}><button aria-label={t("逆时针旋转90度")} disabled={blocked} onClick={()=>engine.current?.rotate(Math.PI/2)}><ArrowArcLeft size={34}/></button><span>{t(game.aligned?<><Check size={21}/>90°</>:'旋转')}</span><button aria-label={t("顺时针旋转90度")} disabled={blocked} onClick={()=>engine.current?.rotate(-Math.PI/2)}><ArrowArcRight size={34}/></button></div>)}</>:<div className="world-hud" inert={Boolean(shown)}>
   {t(L.nodes.map(n=><button key={n.id} ref={e=>{hud.current['nodes'+n.id]=e;}} aria-hidden={shadowedNodes.has(n.id)} tabIndex={shadowedNodes.has(n.id)?-1:0} className={`node-marker ${shadowedNodes.has(n.id)?'portal-overlapped':''} ${showNodes?'visible':''} ${!spatial&&nodeMode?'math-node':''} ${game.blocked?.includes(n.id)?'sealed':''} ${spatial&&game.position===n.id?'traveler-here':''} ${adjacent.includes(n.id)?'can-reach':''} ${game.side?.includes(n.id)&&flow&&game.interaction==='cut'?'source-side':''}`} aria-label={t(`平台 ${n.id}`)} title={t(`${n.id} · ${n.y>4.5?'上层':n.y>2?'中层':'下层'}${n.rune?' · 印记':''}`)} disabled={Boolean(shown)||game.walking||cameraBusy} onClick={()=>engine.current?.node(n.id)}><span>{t(n.id)}</span>{t(spatial&&n.rune&&<Diamond size={9} weight={game.runes?.includes(n.id)?'fill':'regular'}/>)}</button>))}
   {t(!spatial&&L.edges.filter(e=>flow||(construct&&e.control)).map(e=><button key={e.id} ref={el=>{hud.current[(construct&&e.control?'handles':'edges')+e.id]=el;}} className={`edge-marker ${flow?'capacity-marker':L.mode==='mst'?'cost-marker':labels?'visible':'knob-hit'} ${game.selected===e.id?'selected':''} ${flow||L.mode==='mst'?'math-edge':''}`} aria-label={t(flow?(['flow','flowcut'].includes(L.mode)?`闸门 ${e.id}`:`有向桥 ${e.id}`):`机关 ${e.id}`)} aria-pressed={construct?Boolean(game.active?.[e.id]):undefined} disabled={Boolean(shown)||game.walking||cameraBusy} onPointerDown={p=>{if(construct){controlPointer.current=e.id;p.currentTarget.setPointerCapture(p.pointerId);engine.current?.beginControlDrag(e.id,p.clientX,p.clientY);}}} onPointerMove={p=>{if(construct)engine.current?.moveControlDrag(p.clientX,p.clientY);}} onPointerUp={()=>{if(construct)engine.current?.endControlDrag();}} onPointerCancel={()=>{if(construct)engine.current?.endControlDrag();}} onClick={()=>{if(controlPointer.current===e.id){controlPointer.current=null;return;}engine.current?.edge(e.id);}}>{t(flow?<><small className="gate-direction">{t(e.u)}→{t(e.v)}</small><span>{t(L.mode==='capacitycut'?`c ${e.cap}`:`${game.flow?.[e.id]||0}/${e.cap}`)}</span></>:L.mode==='mst'?<><small>{t(e.u)}—{t(e.v)}</small><b>{t(e.cost)}</b></>:labels?`${e.u}—${e.v}`:'')}</button>))}
   {t(spatial&&<>{t(game.groups?.filter(g=>g.station===game.position).map(g=><button key={g.id} ref={e=>{hud.current['stations'+g.id]=e;}} className={`station-marker ${g.station===game.position?'nearby':'station-away'}`} aria-label={t(`联动机关 ${g.id}`)} onClick={()=>engine.current?.cycleGroup(g.id)} disabled={game.walking||cameraBusy}>{t(g.id)}<small>{t(romans[g.view])}</small></button>))}{t(L.edges.filter(e=>e.portal).map(e=><button key={e.id} ref={p=>{hud.current['portals'+e.id]=p;}} className={`portal-marker ${usable(L,game,e)&&!cameraBusy?'aligned':''}`} aria-label={t(`穿越 ${e.id}`)} onClick={()=>engine.current?.enterPortal(e.id)} disabled={game.walking||cameraBusy||![e.u,e.v].includes(game.position)}><Compass size={12}/>{t(romans[e.view])} · {t(usable(L,game,e)&&!cameraBusy?'穿越':'对齐')}</button>))}</>)}
  </div>)}
  {t(shown&&shown!=='tutorial'&&<Journal kind={shown} levelIndex={index} phase={game.phase} completed={completed} snapshot={snapshot} feedback={game.feedback} onClose={close} onReplay={reset} onNext={next} onMenu={()=>open('menu')} onSelect={select} onPrinciple={()=>open('principle')} onHint={()=>open('hint')} onTool={tool} onTutorial={replayTutorial} labels={labels}/>)}
  {shown==='tutorial'&&<TeachingTour key={tutorial} lessonKey={tutorial} onFinish={finishTutorial}/>}
 </main>;
}
