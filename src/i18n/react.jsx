import {useSyncExternalStore} from 'react';
import {LANGUAGES,isLocale,localeKey,translate} from './core.js';
import {saves} from '../storage/index.js';
import './locale.css';
function readLocale(){try{const saved=localStorage.getItem(localeKey);if(isLocale(saved))return saved;}catch{}return 'zh-CN';}
// Keep subscriptions intact when Vite refreshes the catalog during development.
const store=import.meta.hot?.data.localeStore??{locale:readLocale(),listeners:new Set()};
if(import.meta.hot)import.meta.hot.data.localeStore=store;
export const t=value=>translate(value,store.locale);
export function setLocale(value){
 if(!isLocale(value)||value===store.locale)return;
 store.locale=value;saves.saveProfile({locale:value});
 document.documentElement.lang=value;for(const listener of store.listeners)listener();
}
export function useLocale(){return useSyncExternalStore(listener=>{store.listeners.add(listener);return()=>store.listeners.delete(listener);},()=>store.locale,()=> 'zh-CN');}
export function LanguagePicker(){const current=useLocale();return <fieldset className="language-picker"><legend>{t('语言')}</legend><div>{LANGUAGES.map(language=><button key={language.id} lang={language.id} aria-pressed={current===language.id} onClick={()=>setLocale(language.id)}>{language.label}</button>)}</div></fieldset>;}
document.documentElement.lang=store.locale;
