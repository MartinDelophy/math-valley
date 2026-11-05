import {createContext,useContext,useEffect,useRef,useState} from 'react';
import {GearSix,X,SpeakerHigh,MusicNotes,Globe,Check} from '@phosphor-icons/react';
import {LanguagePicker,t,useLocale} from '../i18n/react';
import {useSettings,updateSettings} from './store';
import {useAudioStatus} from '../audio/react';
import {installAudio,retryMusic,unlockAudio} from '../audio/controller';
import {saves} from '../storage/index';
import {SaveTools} from '../storage/SaveTools';
import './settings.css';
const Context=createContext({isOpen:false,open:()=>{}});
export const useSettingsPanel=()=>useContext(Context);
export function SettingsButton({className='',disabled=false,withLabel=false}){
 const {open}=useSettingsPanel();return <button className={`settings-trigger ${className}`} disabled={disabled} title={t('旅程设置')} aria-label={t('旅程设置')} onClick={open}><GearSix size={23} weight="light"/>{withLabel&&<span>{t('设置')}</span>}</button>;
}
function Toggle({setting,label,description}){
 const value=useSettings();return <div className="settings-control"><div><strong id={`setting-${setting}`}>{t(label)}</strong>{description&&<p>{t(description)}</p>}</div><button className="settings-toggle" role="switch" aria-checked={value[setting]} aria-labelledby={`setting-${setting}`} onClick={()=>{unlockAudio();updateSettings({[setting]:!value[setting]});}}><span/><Check size={12}/></button></div>;
}
function Volume({setting,label,disabled=false}){
 const p=useSettings();return <label className="settings-volume"><span>{t(label)}<output>{Math.round(p[setting]*100)}%</output></span><input aria-label={t(label)} type="range" min="0" max="100" step="1" value={Math.round(p[setting]*100)} disabled={disabled} onChange={e=>updateSettings({[setting]:Number(e.target.value)/100})}/></label>;
}
function SettingsPanel({onClose,returnFocus}){
 const locale=useLocale(),p=useSettings(),status=useAudioStatus(),box=useRef();
 useEffect(()=>{
  const before=returnFocus.current;box.current?.querySelector('button')?.focus();
  const key=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();onClose();return;}if(e.key!=='Tab')return;const controls=[...box.current.querySelectorAll('button:not(:disabled),input:not(:disabled),a[href]')].filter(el=>el.getClientRects().length);if(e.shiftKey&&document.activeElement===controls[0]){e.preventDefault();controls.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===controls.at(-1)){e.preventDefault();controls[0]?.focus();}};
  window.addEventListener('keydown',key,true);return()=>{window.removeEventListener('keydown',key,true);saves.flush();if(before?.isConnected)before.focus();};
 },[]);
 return <div className="settings-backdrop" onClick={onClose}><section className="settings-dialog" ref={box} role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={e=>e.stopPropagation()}>
  <header className="settings-heading"><div><span className="settings-eyebrow"><GearSix size={18}/>{t('语言与声音')}</span><h2 id="settings-title">{t('旅程设置')}</h2><p>{t('让旅程按你的节奏展开。')}</p></div><button className="settings-close" onClick={onClose} aria-label={t('关闭设置')}><X size={24}/></button></header>
  <div className="settings-body"><section className="settings-languages"><h3><Globe size={20}/>{t('界面语言')}</h3><p className="settings-help">{t('选择语言后立即生效，进度保持不变。')}</p><LanguagePicker/><div className="settings-motion"><h3>{t('显示与动态')}</h3><Toggle setting="openingMotion" label="开场动画" description="缓慢旋转建筑；系统减少动态效果时会自动停止。"/></div><SaveTools/></section>
   <section className="settings-sound"><h3><SpeakerHigh size={20}/>{t('声音')}</h3><Toggle setting="music" label="背景音乐"/><p className="settings-track"><MusicNotes size={18}/><span>{t('古典钢琴 · 巴赫《C大调前奏曲》')}<small>Kimiko Ishizaka · CC0</small></span></p><Volume setting="musicVolume" label="音乐音量" disabled={!p.music}/><p className="settings-help">{t('音乐会在首次操作后播放，离开页面时暂停。')}</p>
    {status.error&&<p className="settings-audio-error" role="status">{t(status.error)} <button onClick={retryMusic}>{t('重新播放音乐')}</button></p>}
    <div className="settings-divider"/><Toggle setting="soundEffects" label="效果音"/>
   </section></div>
  <footer className="settings-footer"><button onClick={onClose}>{t('完成设置')}<Check size={17}/></button></footer>
 </section></div>;
}
export function SettingsProvider({children}){
 const [isOpen,setOpen]=useState(false),returnFocus=useRef();useEffect(installAudio,[]);
 return <Context.Provider value={{isOpen,open:()=>{returnFocus.current=document.activeElement;setOpen(true);}}}><div className="application-shell" inert={isOpen} aria-hidden={isOpen||undefined}>{children}</div>{isOpen&&<SettingsPanel returnFocus={returnFocus} onClose={()=>setOpen(false)}/>}</Context.Provider>;
}
