export const DEFAULT_SETTINGS=Object.freeze({music:true,narration:true,soundEffects:true,openingMotion:true,musicVolume:.22,voiceVolume:.9});
export function cleanPreferences(value={}){
 const result={};
 for(const key of ['labels','paperOpen','music','narration','soundEffects','openingMotion'])if(typeof value?.[key]==='boolean')result[key]=value[key];
 for(const key of ['musicVolume','voiceVolume'])if(Number.isFinite(value?.[key]))result[key]=Math.max(0,Math.min(1,value[key]));
 return result;
}
export function matchingVoice(voices,locale){
 const normalized=locale.toLowerCase(),language=normalized.split('-')[0];
 // Mandarin variants must not silently fall back to the other script/region.
 const candidates=voices.filter(voice=>{const id=voice.lang.replace('_','-').toLowerCase();return language==='zh'?id===normalized||(normalized==='zh-cn'&&id==='zh'):id.split('-')[0]===language;});
 const preferred={en:/Samantha|Daniel|Karen|Zira|Aria|Jenny/i,zh:/Tingting|Meijia|婷婷|美佳|Huihui|Hanhan|Xiaoxiao/i,ja:/Kyoko|Otoya|Haruka|Nanami/i,ko:/Yuna|Heami|SunHi/i,fr:/Thomas|Amelie|Audrey|Denise/i,de:/Anna|Katja|Hedda/i,es:/Monica|Mónica|Paulina|Jorge|Helena|Elvira/i,pt:/Luciana|Joana|Maria|Francisca/i}[language];
 const score=voice=>(voice.localService?100:0)+(preferred?.test(voice.name||'')?50:0)+(voice.lang.replace('_','-').toLowerCase()===normalized?20:0)+(voice.default?10:0);
 return candidates.sort((a,b)=>score(b)-score(a))[0]||null;
}
