import {t} from '../i18n/react';
import {Notebook,PrinciplePages} from '../notebook/Notebook';
import {groupLabel,image,mirrorView,bitView,parity,editable,received} from './math';
import './expansion.css';
const roman=['Ⅰ','Ⅱ','Ⅲ','Ⅳ'];
export function ExpansionContent({level:L,game:g,engine,open,paperOpen}){
 const group=L.chapter===3,busy=g.walking||g.camera?.busy,run=(method,...args)=>engine.current?.[method]?.(...args),stage=g.phase||0,view=g.camera?.overhead?-1:g.camera?.index??0;
 const current={k:g.k??0,m:g.m??0},mirror=mirrorView(current),bits=g.bits||Array(L.bits||7).fill(0),budget=L.task==='capstone'&&stage===1?1:L.budget;
 const markable=group&&!['relations','order'].includes(L.task)&&!stage||L.task==='ambiguity';
 return <div className="notebook-host" inert={!paperOpen}><Notebook
  className="expansion-notebook" kicker={`${t(group?'第三章':'第四章')} · ${L.displayId}${L.twoStage||L.task==='order'?` · ${t('阶段')}${stage+1}/2`:''}`} goal={stage?(group?'用刚才的结构，完成验证':L.task==='relay'?'修复第二束独立信号':'从噪声中恢复有效码字'):L.goal} resetKey={`${L.id}:${stage}`} feedbackKey={g.tested?g.feedback:''} action={()=>run('test')} actionLabel={g.walking?'观察变化…':group?'提交结构证据':'提交信号证据'} disabled={busy} onPrinciple={()=>open('principle')}
  stats={<><span><b>{group?groupLabel(current):`s = (${[1,2,4].map(p=>bits.slice(0,7).reduce((s,b,i)=>((i+1)&p)?s^b:s,0)).join(',')})`}</b></span><i/><span><b>{g.energy||0} / {budget}</b></span></>}
  observe={<>
   {g.tested&&g.feedback&&<article className="notebook-leaf"><h3>{t('数学线索')}</h3><p role="status">{t(g.feedback)}</p></article>}
   <article className="notebook-leaf"><h3>{t(group?'行走与变换':'信标控制')}</h3>
   {group?<>
    <p className="notebook-formula">{(g.raw||[]).map(c=>c==='R'?'r⁻¹':c).join(' · ')||'e'}</p>
    <div className="expansion-controls"><button disabled={busy} data-math-action="r" onClick={()=>run('act','r')}>r <small>+{360/L.n}°</small></button><button disabled={busy} data-math-action="R" onClick={()=>run('act','R')}>r⁻¹ <small>−{360/L.n}°</small></button><button disabled={busy} data-math-action="s" onClick={()=>view===mirror?run('act','s'):run('setView',mirror)}>s <small>{view===mirror?t('穿越镜门'):`${t('对齐')} ${roman[mirror]}`}</small></button></div>
    <p>{t('顶点排列：')}{Array.from({length:L.n},(_,x)=>image(current,x,L.n)).join(' · ')}</p>
    <p>{t('0 的像：')}{image(current,0,L.n)} · {t('已访问元素：')}{g.visited?.length||1}/{2*L.n}</p>
   </>:<>
    <p className="expansion-received">{t('当前信号：')}<code>{bits.join('')}</code></p>
    <div className="beacon-controls">{bits.map((bit,i)=>{const allowed=editable(L,g).includes(i),erased=L.erasures?.includes(i)&&!g.touched?.includes(i),required=bitView(i);return <button key={i} data-bit={i} aria-label={`${t('信标')} ${i+1} · ${erased?'?':bit} · ${roman[required]}`} aria-pressed={Boolean(bit)} disabled={busy||!allowed} onClick={()=>view===required?run('act','bit',i):run('setView',required)}><span>{i+1}<small>{roman[required]}</small></span><b>{erased?'?':bit}</b></button>;})}</div>
    <p>{t('先对齐对应视角，再点击信标切换 0 / 1。')}</p>
   </>}
   </article>
   {markable&&<article className="notebook-leaf"><h3>{t('封存证据')}</h3><p>{t(group?'封存当前抵达的元素，再行走寻找其他证据。再次封存同一元素可取消。':'只有距离接收词两位的有效码字才能封存。保留第一份证据，再恢复接收词寻找第二份。')}</p><div className="expansion-records">{g.marks?.length?g.marks.map(key=><code key={key}>{key}</code>):<span>∅</span>}</div><div className="expansion-controls"><button disabled={busy} data-math-action="mark" onClick={()=>run('act','mark')}>{t('封存当前证据')}</button>{!group&&<button disabled={busy} data-math-action="received" onClick={()=>run('act','received')}>{t('恢复接收词')}</button>}</div></article>}
   <article className="notebook-leaf"><h3>{t('本关约束')}</h3><p>{t(L.hint)}</p>{group&&L.exhaustive&&!stage&&<p>{t('提交前须访问全部群元素。')}</p>}{!group&&<><p>{t('三组校验：')}{[1,2,4].map(p=>bits.slice(0,7).reduce((s,b,i)=>((i+1)&p)?s^b:s,0)).join(' · ')}</p>{L.bits===8&&<p>{t('整体奇偶：')}{parity(bits)}</p>}{!['encode','distance'].includes(L.task)&&!(L.task==='capstone'&&stage===0)&&<p className="expansion-received">{t('接收记录：')}<code>{received(L,stage).map((bit,i)=>L.erasures?.includes(i)?'?':bit).join('')}</code></p>}</>}</article>
   {g.samples?.length>0&&<article className="notebook-leaf"><h3>{t('前一阶段的记录')}</h3>{g.samples.map((sample,i)=><p className="notebook-formula" key={i}>{Array.isArray(sample)?sample.join(''):groupLabel(sample)}</p>)}</article>}
  </>}
  prove={<PrinciplePages principles={L.principles}/>}
 /></div>;
}
