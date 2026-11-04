import { t } from './i18n/react';
import { useState,useEffect } from 'react';
import { List,ArrowArcLeft,ArrowArcRight,ArrowUUpLeft,BookOpen,Diamond,Lightning,CaretDoubleRight,CaretDoubleLeft,ArrowRight,Cube,Minus,Plus } from '@phosphor-icons/react';
import { usable } from './chapter/spatial';
import { modeLabels } from './chapter/levels';
import './folded-hud.css';
import { TopologyContent } from './topology/TopologyContent';

const romans=['Ⅰ','Ⅱ','Ⅲ','Ⅳ'];
const galleryNames={CX:'侧廊',CE:'高廊',AK:'外廊',AD:'中庭',FJ:'回廊',FT:'归途'};
const floor=n=>n?.y>4.5?'上层':n?.y>2?'中层':'下层';

export function FoldedHud({intro,level:L,game:g,engine,open,paperOpen,setPaperOpen,blocked,shown}){
 const [routesOpen,setRoutesOpen]=useState(false);
 useEffect(()=>setRoutesOpen(false),[L?.id,g.position]);
 const run=(method,...args)=>engine.current?.[method]?.(...args);
 const spatial=L?.mode==='spatial',busy=blocked||g.camera?.busy;
 const group=spatial?g.groups?.find(x=>x.station===g.position):null;
 const active=group?.options.find(o=>o.active),next=group?.options[(group.options.findIndex(o=>o.active)+1)%group.options.length];
 const portals=spatial?L.edges.filter(e=>e.portal&&[e.u,e.v].includes(g.position)):[];
 const adjacent=spatial?L.edges.filter(e=>!e.portal&&[e.u,e.v].includes(g.position)&&usable(L,g,e)).map(e=>({id:e.u===g.position?e.v:e.u,edge:e})):[];
 const selected=L?.edges.find(e=>e.id===g.selected);
 const flow=['flow','flowcut'].includes(L?.mode),route=['paths','residual'].includes(L?.mode);
 const cut=['capacitycut','residualcut'].includes(L?.mode)||(L?.mode==='flowcut'&&g.interaction==='cut');
 const controlled=next&&L.edges.find(e=>e.id===next.id);
 const requiredView=controlled?.controlView;
 const wrongView=requiredView!==undefined&&requiredView!==g.view;
 const missing=controlled?.requires?.filter(id=>!g.runes?.includes(id))||[];
 let contextTitle='探索通路',contextCopy='点击相邻平台，选择下一步。',primary=null;
 if(intro){contextTitle='方向与旋转';contextCopy=g.aligned?'桥梁已接通，走过去验证。':'拖动金色机关，观察桥梁的方向。';primary={label:g.aligned?'走过去验证':'转过一个直角',action:()=>run(g.aligned?'walk':'rotate')};}
 else if(spatial){
  if(group){contextTitle='联动机关';contextCopy=`当前：${galleryNames[active?.id]||active?.label||'未接通'}`;primary={label:wrongView?`对齐至${romans[requiredView]}侧`:missing.length?'寻找缺失的印记':`切换至${galleryNames[next?.id]||next?.label}`,action:()=>wrongView?run('setView',requiredView):run('cycleGroup',group.id),disabled:!wrongView&&missing.length>0};}
  else if(portals.length&&adjacent.some(n=>n.id===L.t)){contextTitle='最后一段通路';contextCopy='检查印记，沿通路走向小屋。';primary={label:'前往顶层小屋',action:()=>run('node',L.t)};}
  else if(portals.length){const p=portals[0],aligned=p.view===g.view,other=L.nodes.find(n=>n.id===(p.u===g.position?p.v:p.u));contextTitle='空间穿越';contextCopy=aligned?'两扇门已沿视线对齐。':`穿越门的朝向：${romans[p.view]}侧`;primary={label:aligned?`穿越至${floor(other)}`:`对齐至${romans[p.view]}侧`,action:()=>aligned?run('enterPortal',p.id):run('setView',p.view)};}
  else if(adjacent.length===1){const n=L.nodes.find(n=>n.id===adjacent[0].id);primary={label:`前往${n.id} · ${floor(n)}`,action:()=>run('node',n.id)};}
  else {contextCopy='前方有多条通路，观察印记与机关。';primary={label:routesOpen?'收起通路':'选择前进方向',action:()=>setRoutesOpen(!routesOpen)};}
 }else{
  contextTitle=modeLabels[L.mode];
  contextCopy=flow&&!cut?`选中闸门：${selected?.u} → ${selected?.v}`:route?'依次点击平台，标记完整路线。':cut?'点击平台，标记源点所在的一侧。':L.mode==='vertex'?'点击中庭，开合阻断通路的栅栏。':'点击金色机关，改变桥梁连接。';
  primary={label:L.action,action:()=>run('test')};
 }
 const statusA=spatial?`${g.runes?.length||0} / ${L.seals.length}`:intro?'90°':L.mode==='residual'?`${g.flowStatus?.value??0} / ${L.target}`:route?`${g.paths?.length||0} / ${L.target}`:L.mode==='mst'?`${L.edges.filter(e=>g.active?.[e.id]).reduce((n,e)=>n+e.cost,0)}`:L.mode==='vertex'?`${g.blocked?.length||0} 座`:cut?`${g.cutValue??0}`:flow?`${g.flowStatus?.value??0} / ${L.target||7}`:`${L.edges.filter(e=>g.active?.[e.id]).length} 桥`;
 const statusB=spatial?`${L.energyLimit-g.energy} / ${L.energyLimit}`:intro?'序章':L.phases?`${(g.phase||0)+1} / ${L.phases.length} 阶段`:L.mode==='mst'?'总代价':L.mode==='residual'?'增广证据':route?'路线证据':cut?'割容量':'构造证据';
 const goal=intro?'方向改变，长度不变':spatial?(L.id==='01'?'集齐印记，抵达顶层':L.id==='02'?'寻齐钥匙，穿过回环':L.id==='03'?'规划路线，抵达顶层':'解开相位，走出高塔'):L.goal;
 const preview=intro?'旋转保持形状与大小。':spatial?'视角改变可达关系。':L.mode==='mst'?'生成树连通，且不含回路。':flow||cut?'流与割，共同证明最优。':L.mode==='residual'?'撤回旧流，也能打开新路。':'路径与最小割互为上下界。';
 return <>
  <header className="folded-heading" inert={Boolean(shown)}><button className="quiet-menu" aria-label={t("旅途菜单")} onClick={()=>open('tools')}><List size={26} weight="light"/></button><span className="folded-heading-divider"/><h1>{t(intro?'序章 · 方向与旋转':`${L.displayId||L.id} · ${L.title}`)}</h1></header>
  {t(!intro&&<nav className="compass-dock" aria-label={t("空间视角")} inert={Boolean(shown)}>
   <button className="compass-arrow" aria-label={t("向左切换视角 Q")} disabled={g.walking} onClick={()=>run('turnView',-1)}><ArrowArcLeft size={27} weight="light"/><kbd>Q</kbd></button>
   <div className="compass-face"><img src="/assets/hud/compass-frame.png" alt=""/><span aria-live="polite">{t(g.camera?.overhead?'俯':romans[g.camera?.index??0])}</span></div>
   <button className="compass-arrow" aria-label={t("向右切换视角 E")} disabled={g.walking} onClick={()=>run('turnView',1)}><ArrowArcRight size={27} weight="light"/><kbd>E</kbd></button>
   <span className="compass-divider"/><button className="compass-undo" aria-label={t("撤一步")} title={t("撤回上一步")} disabled={busy||(!spatial&&!route&&L?.chapter!==2)||(!g.history&&!g.paths?.length&&!(g.draft?.length>1))} onClick={()=>run('undo')}><ArrowUUpLeft size={27} weight="light"/></button>
  </nav>)}
  <aside className={`folded-paper ${paperOpen?'is-open':''}`} aria-label={t("旅途手札")} inert={Boolean(shown)}>
   <img className="paper-art" src="/assets/hud/folded-paper.png" alt="" draggable="false"/>
   <button className="paper-tab" aria-label={t(paperOpen?'收起旅途手札':'展开旅途手札')} aria-expanded={paperOpen} onClick={()=>setPaperOpen(!paperOpen)}>{t(paperOpen?<CaretDoubleRight size={23}/>:<CaretDoubleLeft size={23}/>)}<span>{t("手札")}</span></button>
   {t(L?.chapter===2?<TopologyContent level={L} game={g} engine={engine} open={open} paperOpen={paperOpen}/>:<div className={`paper-content ${!spatial&&!intro?'math-paper':''}`} inert={!paperOpen}>
    <div className="paper-heading">{t("当前目标")}</div><h2 className={`paper-goal ${spatial||intro?'compact-goal':''}`} title={t(L?.goal)}>{t(goal)}</h2>
    <div className="paper-stats"><span><Diamond weight="duotone" size={27}/><b>{t(statusA)}</b></span><i/><span>{t(spatial&&<Lightning size={28} weight="fill"/>)}<b>{t(statusB)}</b></span></div>
    <div className="paper-context">
     <h3>{t(contextTitle)}</h3><p className="context-copy">{t(g.walking?'正在通路间行走…':contextCopy)}</p>
     {t(spatial&&missing.length>0&&<p className="paper-constraint">{t("需要印记：")}{t(missing.join('、'))}</p>)}
     {t(L?.mode==='mst'&&<p className="paper-constraint">{t("已保留")}{t(Object.values(g.active||{}).filter(Boolean).length)} / {t(L.nodes.length-1)}{t("座桥")}{t(L.required&&<><br/>{t("必留桥梁：")}{t(L.required.join('、'))}</>)}</p>)}
     {t(L?.mode==='repair'&&<p className="paper-constraint">{t("备用桥")}{t(L.edges.filter(e=>e.on===false&&g.active?.[e.id]).length)} / {t(L.maxAdded)}</p>)}
     {t(flow&&L.mode==='flowcut'&&<div className="paper-segment"><button aria-pressed={!cut} onClick={()=>run('setInteraction','flow')}>{t("调节流量")}</button><button aria-pressed={cut} onClick={()=>run('setInteraction','cut')}>{t("标记割")}</button></div>)}
     {t(L?.mode==='flowcut'&&<p className="paper-constraint">{t("流值")}{t(g.flowStatus?.value??0)}{t("· 割容量")}{t(g.cutValue??0)}</p>)}
     {t(flow&&!cut&&selected&&<div className="paper-gate"><button aria-label={t("选中闸门减少1")} disabled={busy} onClick={()=>run('adjust',-1)}><Minus size={18}/></button><span>{t(g.flow?.[selected.id]||0)} / {t(selected.cap)}</span><button aria-label={t("选中闸门增加1")} disabled={busy} onClick={()=>run('adjust',1)}><Plus size={18}/></button></div>)}
     {t(route&&<p className="paper-route">{t(g.draft?.join(' → ')||'S')}</p>)}
     {t(primary&&<button className="paper-primary" disabled={busy||primary.disabled} onClick={primary.action}>{t(g.walking?'旅途中…':primary.label)}</button>)}
     {t(spatial&&(group||portals.length>0)&&<button className="paper-text" aria-expanded={routesOpen} onClick={()=>setRoutesOpen(!routesOpen)}>{t(routesOpen?'收起其他通路':'查看其他通路')}<ArrowRight size={13}/></button>)}
     {t(spatial&&routesOpen&&<div className="paper-routes">{t(adjacent.map(n=><button key={n.id} disabled={busy} onClick={()=>{run('node',n.id);setRoutesOpen(false);}}>{t("前往")}{t(n.id)}<ArrowRight size={15}/></button>))}{t(portals.map(p=><button key={p.id} disabled={busy} onClick={()=>p.view===g.view?run('enterPortal',p.id):run('setView',p.view)}>{t(p.view===g.view?'进入穿越门':`对齐至${romans[p.view]}侧`)}<ArrowRight size={15}/></button>))}</div>)}
     {t(g.feedback&&(!spatial||g.tested||! /^(已抵达|取得|联动 |沿实体|空间对齐|位于 )/.test(g.feedback))&&<p className={`paper-feedback ${g.tested?'is-tested':''}`} role="status">{t(g.feedback)}</p>)}
    </div>
    <div className="paper-bottom"><p><Cube size={26} weight="light"/><span>{t(preview)}</span></p><button className="paper-book" onClick={()=>open('principle')}><BookOpen size={28} weight="light"/>{t("原理手记")}</button></div>
   </div>)}
  </aside>
 </>;
}
