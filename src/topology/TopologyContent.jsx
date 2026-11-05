import { t } from '../i18n/react';
import {useEffect,useState} from 'react';
import {Diamond,Stack,ArrowRight,Lightning} from '@phosphor-icons/react';
import {formatWord,winding} from './math';
import './topology.css';
import {Notebook,PrinciplePages} from '../notebook/Notebook';
const roman=['Ⅰ','Ⅱ','Ⅲ'];
const actionNames={a:'进入青色回廊',A:'沿青廊反向行走',b:'进入金色回廊',B:'沿金廊反向行走'};
export function TopologyContent({level:L,game:g,engine,open,paperOpen}){
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
 const record=<><p className="topology-checkpoints">{t('见证：')}{L.checkpoints.map((c,i)=><span key={i} className={i<(g.seals||0)?'done':''}>{check(c)}{i<L.checkpoints.length-1?' → ':''}</span>)}</p>{L.targetWord&&<p className="topology-reference">{t('参考：')}{formatWord(L.targetWord)}</p>}<p className="topology-word">{t(L.kind==='free'?'路径：':'绕数：n = ')}{L.kind==='free'?formatWord(g.word||[]):winding(g.raw||[])}</p></>;
 const feedback=g.feedback&&!/^(沿|取得|抵达)/.test(g.feedback);
 const proofControls=<>
  {reduction?<><p>{t('选择相邻两段，验证它们能否互相退回。')}</p><div className="proof-word">{g.proof?.map((c,i)=><button key={`${i}-${c}`} aria-label={t(`选择第${i+1}段及下一段`)} aria-pressed={pair===i||pair===i-1} disabled={i===g.proof.length-1} onClick={()=>setPair(pair===i?null:i)}>{formatWord(c)}</button>)}</div>{pair!==null&&<button className="paper-text" onClick={()=>setPair(null)}>{t('取消选择')}</button>}</>:classification?<><p>{t('这条基空间中的路径，能缩回基点吗？')}</p><div className="topology-verdict"><button aria-pressed={g.choice==='null'} onClick={()=>run('choose','null')}>{t('可以缩回基点')}</button><button aria-pressed={g.choice==='nontrivial'} onClick={()=>run('choose','nontrivial')}>{t('仍然不可缩')}</button></div></>:<p>{t(L.hint)}</p>}
 </>;
 return <div className="notebook-host" inert={!paperOpen}><Notebook
  className="topology-notebook" kicker={`${t('第二章')} · ${L.displayId||L.id}${(L.evidence||L.construct)?` · ${t('阶段')}${(g.phase||0)+1}/2`:''}`} goal={construct?'复原门的对应，继续旅程':proof?'为刚才的路径，给出证据':L.shortGoal} resetKey={`${L.id}:${g.phase||0}`} proofActive={proof} feedbackKey={g.tested?g.feedback:''} action={submit} actionLabel={g.walking?'沿回廊前进…':primary} disabled={busy} onPrinciple={()=>open('principle')}
  stats={<><span><Stack size={20} weight="light"/><b>{layer}{t('层')}</b></span><i/><span><Diamond size={19}/><b>{g.seals??0} / {L.checkpoints.length}</b></span><i/><span><Lightning size={18} weight="light"/><b>{L.budget-(g.energy||0)} / {L.budget}</b></span></>}
  observe={<>
   {!proof&&feedback&&<article className="notebook-leaf"><h3>{t('数学线索')}</h3><p role="status">{t(g.feedback)}</p></article>}
   <article className="notebook-leaf"><h3>{t(title)}</h3>
    {construct?<><p>{t('青廊：Ⅰ→Ⅱ→Ⅲ→Ⅰ')}<br/>{t('实验「先金后青」：')}<br/>Ⅰ→Ⅰ · Ⅱ→Ⅲ · Ⅲ→Ⅱ</p><div className="seam-choices">{[0,1,2].map(i=><button key={i} aria-label={t(`修改金廊第${i+1}层配对`)} onClick={()=>run('cycleSeam',i)}>{t('金廊')}{roman[i]}<ArrowRight size={15}/>{roman[g.seam?.[i]??i]}</button>)}</div></>:<>{record}<p>{t(g.walking?'正在回廊间行走…':L.kind==='universal'?'同一角度，对应不同的高度。':L.kind==='free'?'观察回廊的颜色、方向与先后。':'绕行一圈，观察所在层。')}</p></>}
    {!proof&&!construct&&<><button className="paper-text" aria-expanded={alternatives} onClick={()=>setAlternatives(!alternatives)}>{t(alternatives?'收起其他走法':'选择其他走法')}<ArrowRight size={13}/></button>{alternatives&&<div className="topology-alternatives">{L.actions.map(a=><button key={a} aria-pressed={action===a} onClick={()=>{setAction(a);setAlternatives(false);}}>{t(names[a])}</button>)}</div>}<button className="topology-submit" disabled={busy} onClick={()=>run('test')}>{t('提交行走证据')}<ArrowRight size={14}/></button></>}
   </article><article className="notebook-leaf"><h3>{t('数学线索')}</h3><p>{t(L.hint)}</p></article>
  </>}
  prove={proof?<>
   {feedback&&<article className="notebook-leaf"><h3>{t('数学线索')}</h3><p role="status">{t(g.feedback)}</p></article>}
   <article className="notebook-leaf"><h3>{t('同伦证据')}</h3>{record}{proofControls}</article>
   <PrinciplePages principles={L.principles}/>
  </>:<PrinciplePages principles={L.principles}/>}
 /></div>;
}
