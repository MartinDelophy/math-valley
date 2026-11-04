import { messages } from './messages.js';
export const LANGUAGES=[{id:'zh-CN',label:'中文'},{id:'en',label:'English'},{id:'ja',label:'日本語'},{id:'ko',label:'한국어'}];
export const localeKey='math-valley-locale';
export const isLocale=value=>LANGUAGES.some(l=>l.id===value);
const column={en:1,ja:2,ko:3};
const exact=new Map(messages.map(row=>[row[0],row]));
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
// Engine feedback stays in its source form. Resolve its parameters only at render
// time so an in-progress journey can change language without resetting its state.
const patterns=messages.filter(row=>/\{\d+\}/.test(row[0])).map(row=>{
 const slots=[];let last=0,pattern='^';
 for(const match of row[0].matchAll(/\{(\d+)\}/g)){pattern+=escape(row[0].slice(last,match.index))+'([\\s\\S]*?)';slots.push(Number(match[1]));last=match.index+match[0].length;}
 pattern+=escape(row[0].slice(last))+'$';
 return {row,slots,regex:new RegExp(pattern),specificity:row[0].replace(/\{\d+\}/g,'').length};
}).sort((a,b)=>b.specificity-a.specificity);
const phrases=messages.filter(row=>!/[{}]/.test(row[0])&&row[0].trim().length>1).sort((a,b)=>b[0].length-a[0].length);
export function translate(value,locale='zh-CN',depth=0){
 if(Array.isArray(value))return value.map(v=>translate(v,locale,depth));
 if(typeof value!=='string'||locale==='zh-CN'||!column[locale]||!/[\u3400-\u9fff]/.test(value))return value;
 const row=exact.get(value);if(row)return row[column[locale]];
 if(depth<8)for(const item of patterns){const match=item.regex.exec(value);if(!match)continue;const params={};item.slots.forEach((slot,i)=>params[slot]=translate(match[i+1],locale,depth+1));return item.row[column[locale]].replace(/\{(\d+)\}/g,(_,i)=>params[i]);}
 // Some headings compose a Roman numeral with a catalog title. Translate the
 // longest source phrases in one pass; never reprocess the translated result.
 const available=phrases.filter(row=>value.includes(row[0]));
 if(!available.length)return value;
 const re=new RegExp(available.map(row=>escape(row[0])).join('|'),'g');
 return value.replace(re,key=>exact.get(key)[column[locale]]);
}
