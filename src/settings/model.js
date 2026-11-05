export const DEFAULT_SETTINGS=Object.freeze({music:true,soundEffects:true,openingMotion:true,musicVolume:.22});
export function cleanPreferences(value={}){
 const result={};
 for(const key of ['labels','paperOpen','music','soundEffects','openingMotion'])if(typeof value?.[key]==='boolean')result[key]=value[key];
 for(const key of ['musicVolume'])if(Number.isFinite(value?.[key]))result[key]=Math.max(0,Math.min(1,value[key]));
 return result;
}
