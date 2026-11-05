import {useEffect,useRef,useState} from 'react';
import {Archive,DownloadSimple,UploadSimple,Check} from '@phosphor-icons/react';
import {t,useLocale} from '../i18n/react';
import {saves} from './index';
import {decodeSave,MAX_SAVE_BYTES} from './transfer';
import './save-tools.css';
export function SaveTools(){
 const locale=useLocale(),input=useRef(),[summary,setSummary]=useState(saves.summary),[preview,setPreview]=useState(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{let alive=true;saves.flush().then(()=>{if(alive)setSummary(saves.summary());});return()=>{alive=false;};},[]);
 async function download(){setBusy(true);setMessage('');try{
  const data=await saves.exportSave(),blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=`math-valley-save-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);setMessage('备份已生成，请保存下载文件。');setSummary(saves.summary());
 }catch{setMessage('备份暂时未能生成，请重试。');}finally{setBusy(false);}}
 async function choose(event){setMessage('');setPreview(null);const file=event.target.files?.[0];event.target.value='';if(!file)return;try{if(file.size>MAX_SAVE_BYTES)throw Error('invalid-save');setPreview(decodeSave(await file.text()));}catch(error){setMessage(error.message==='unsupported-save'?'存档来自其他版本，请更新游戏后再导入。':'存档文件无效或过大，请选择 Math Valley 导出的备份。');}}
 async function restore(){setBusy(true);setMessage('');try{if(!await saves.importSave(preview))throw Error('save-failed');await saves.flush();location.reload();}catch{setMessage('存档未能导入，当前旅程仍然保留。');setBusy(false);}}
 const imported=preview?.payload;
 return <section className="save-tools" aria-labelledby="save-tools-title"><h3 id="save-tools-title"><Archive size={19} weight="light"/>{t('旅程存档')}</h3>
  <p className="save-tools-status">{t(saves.backend()==='memory'?'此设备暂时无法保存，请导出备份。':'进度自动保存在此设备。')}</p>
  <p className="save-tools-count">{t(`已完成 ${summary.completed} 关`)}{summary.newLevels>0&&<span>{t(`新增 ${summary.newLevels} 个关卡`)}</span>}</p>
  {summary.updatedAt>0&&<p className="save-tools-date">{t('上次保存')}{' · '}{new Date(summary.updatedAt).toLocaleString(locale,{dateStyle:'short',timeStyle:'short'})}</p>}
  <p className="settings-help">{t('更新会保留旧进度，新增关卡可继续探索。')}</p>
  <div className="save-tools-actions"><button disabled={busy} onClick={download}><DownloadSimple size={17}/>{t('导出备份')}</button><button disabled={busy} onClick={()=>input.current.click()}><UploadSimple size={17}/>{t('导入备份')}</button><input ref={input} hidden type="file" accept=".json,application/json" onChange={choose}/></div>
  {preview&&<div className="save-preview"><strong>{t('恢复这个存档？')}</strong><p>{t(`备份含 ${imported.profile.completed.filter(id=>id!=='intro').length} 个已完成关卡与 ${imported.archives.length} 段往昔旅程。`)}</p><p className="settings-help">{t('恢复前会自动备份当前旅程。')}</p><div><button disabled={busy} onClick={()=>setPreview(null)}>{t('取消恢复')}</button><button disabled={busy} onClick={restore}><Check size={15}/>{t(busy?'正在准备旅程…':'恢复存档')}</button></div></div>}
  {message&&<p className="save-tools-message" role="status">{t(message)}</p>}
 </section>;
}
