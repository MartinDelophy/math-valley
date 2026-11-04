import { t,useLocale } from '../i18n/react';
import {useEffect,useRef,useState} from 'react';
import {Diamond,Stack,BookOpen,Cube,ArrowRight,Lightning} from '@phosphor-icons/react';
import {formatWord,winding} from './math';
import './topology.css';
const roman=['Ⅰ','Ⅱ','Ⅲ'];
const actionNames={a:'进入青色回廊',A:'沿青廊反向行走',b:'进入金色回廊',B:'沿金廊反向行走'};
export function TopologyContent({level:L,game:g,engine,open,paperOpen}){
 const locale=useLocale(),context=useRef(null);
 useEffect(()=>{context.current?.scrollTo({top:0});},[locale,L.id,g.phase]);
 const [alternatives,setAlternatives]=useState(false),[action,setAction]=useState('a'),[pair,setPair]=useState(null);
 useEffect(()=>{setAction('a');setAlternatives(false);setPair(null);},[L.id]);
 useEffect(()=>setPair(null),[g.proof?.join('')]);
 const names={...actionNames,...(L.scene==='moon'?{a:'沿环廊前进',A:'沿环廊反向行走'}:L.scene==='helix'?{a:'继续向上绕行',A:'沿螺旋向下绕行'}:{})};
 const run=(method,...args)=>engine.current?.[method]?.(...args),busy=g.walking||g.camera?.busy;
 const construct=L.construct&&!g.phase,proof=Boolean(L.evidence&&g.phase>0),reduction=proof&&L.evidence==='reduction',classification=proof&&L.evidence==='classification';
 const layer=L.kind==='universal'?`${g.layer>=0?'+':''}${g.layer??0}`:roman[g.layer??0];
 const check=c=>c.winding!==undefined?`n=${c.winding}`:`${roman[c.layer]}${c.letter?`·${t(c.letter==='b'?'金':'青')}`:''}`;
 let title=construct?'门的配对':proof?'同伦证据':L.kind==='universal'?'绕行与高度':L.kind==='free'?'路径的组合':'覆盖空间';
 let primary=construct?'检验门的对应':reduction&&pair!==null?'消去所选两段':proof?'提交同伦证据':g.energy>=L.budget?'提交行走证据':names[action];
 const submit=()=>construct||proof||g.energy>=L.budget?(reduction&&pair!==null?run('cancelPair',pair):run('test')):run('loop',action);
 return <div className={`paper-content topology-paper ${proof?'proof-paper':''}`} inert={!paperOpen}>
  <p className="chapter-kicker">{t("第二章 · 回环之塔")}</p><div className="paper-heading">{t("当前目标")}</div><h2 className="paper-goal" title={t(L.goal)}>{t(construct?'复原门的对应，继续旅程':proof?'为刚才的路径，给出证据':L.shortGoal)}</h2>
  <div className="paper-stats"><span><Stack size={26} weight="light"/><b>{t(layer)}{t("层")}</b></span><i/><span><Diamond size={23}/><b>{t(g.seals??0)} / {t(L.checkpoints.length)}</b></span></div>
  <div className="topology-budget"><Lightning size={13} weight="fill"/>{t("行动余量")}{t(L.budget-(g.energy||0))} / {t(L.budget)}{t((L.evidence||L.construct)&&<span>{t("阶段")}{t((g.phase||0)+1)} / 2</span>)}</div>
  <section ref={context} className="paper-context" tabIndex={0} aria-label={t(title)}><h3>{t(title)}</h3>
   {t(construct?<><p className="context-copy topology-instructions">{t("青廊：Ⅰ→Ⅱ→Ⅲ→Ⅰ")}<br/>{t("实验「先金后青」：")}<br/>Ⅰ→Ⅰ · Ⅱ→Ⅲ · Ⅲ→Ⅱ</p><div className="seam-choices">{t([0,1,2].map(i=><button key={i} aria-label={t(`修改金廊第${i+1}层配对`)} onClick={()=>run('cycleSeam',i)}>{t("金廊")}{t(roman[i])}<ArrowRight size={15}/>{t(roman[g.seam?.[i]??i])}</button>))}</div></>:<>
    {t(!proof&&<p className="topology-checkpoints">{t("见证：")}{t(L.checkpoints.map((c,i)=><span key={i} className={i<(g.seals||0)?'done':''}>{t(check(c))}{t(i<L.checkpoints.length-1?' → ':'')}</span>))}</p>)}
    {t(L.targetWord&&<p className="topology-reference">{t("参考：")}{t(formatWord(L.targetWord))}</p>)}
    <p className="topology-word">{t(L.kind==='free'?'路径：':'绕数：n = ')}{t(L.kind==='free'?formatWord(g.word||[]):winding(g.raw||[]))}</p>
    {t(reduction?<><p className="topology-instructions">{t("选择相邻两段，验证它们能否互相退回。")}</p><div className="proof-word">{t(g.proof?.map((c,i)=><button key={`${i}-${c}`} aria-label={t(`选择第${i+1}段及下一段`)} aria-pressed={pair===i||pair===i-1} disabled={i===g.proof.length-1} onClick={()=>setPair(pair===i?null:i)}>{t(formatWord(c))}</button>))}</div>{t(pair!==null&&<button className="paper-text" onClick={()=>setPair(null)}>{t("取消选择")}</button>)}</>:classification?<><p className="topology-instructions">{t("这条基空间中的路径，能缩回基点吗？")}</p><div className="topology-verdict"><button aria-pressed={g.choice==='null'} onClick={()=>run('choose','null')}>{t("可以缩回基点")}</button><button aria-pressed={g.choice==='nontrivial'} onClick={()=>run('choose','nontrivial')}>{t("仍然不可缩")}</button></div></>:L.targetWord?null:<p className="context-copy">{t(g.walking?'正在回廊间行走…':L.kind==='universal'?'同一角度，对应不同的高度。':L.kind==='free'?'观察回廊的颜色、方向与先后。':'绕行一圈，观察所在层。')}</p>)}
   </>)}
   <button className="paper-primary" disabled={busy} onClick={submit}>{t(g.walking?'沿回廊前进…':primary)}</button>
   {t(!proof&&!construct&&<><button className="paper-text" aria-expanded={alternatives} onClick={()=>setAlternatives(!alternatives)}>{t(alternatives?'收起其他走法':'选择其他走法')}<ArrowRight size={13}/></button>{t(alternatives&&<div className="topology-alternatives">{t(L.actions.map(a=><button key={a} aria-pressed={action===a} onClick={()=>{setAction(a);setAlternatives(false);}}>{t(names[a])}</button>))}</div>)}<button className="topology-submit" disabled={busy} onClick={()=>run('test')}>{t("提交行走证据")}<ArrowRight size={14}/></button></>)}
   {t(g.feedback&&!/^(沿|取得|抵达)/.test(g.feedback)&&<p className={`paper-feedback ${g.tested?'is-tested':''}`} role="status">{t(g.feedback)}</p>)}
  </section>
  <div className="paper-bottom"><p><Cube size={24} weight="light"/><span>{t(L.scene==='helix'?'绕数记录在不同的高度。':L.kind==='free'?'路径的先后，可能改变终点。':'同一投影，可以有不同原像。')}</span></p><button className="paper-book" onClick={()=>open('principle')}><BookOpen size={27} weight="light"/>{t("原理手记")}</button></div>
 </div>;
}
