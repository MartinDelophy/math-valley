export const SAVE_FORMAT='math-valley-save';
export const SAVE_VERSION=1;
export const CONTENT_VERSION=3;
export const MAX_SAVE_BYTES=8*1024*1024;
export const safeLevelId=id=>typeof id==='string'&&/^(?:intro|[0-9]{2,4}|[0-9]{1,4}-[a-zA-Z0-9_-]{1,60})$/.test(id);
const object=value=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
function validJourney(journey){
 if(!object(journey?.profile)||journey.profile.schemaVersion!==1||!Array.isArray(journey.levels)||journey.levels.length>2000)return false;
 if(!Array.isArray(journey.profile.completed)||journey.profile.completed.length>2000||!journey.profile.completed.every(safeLevelId))return false;
 for(const key of ['knownLevelIds','newLevelIds'])if(journey.profile[key]!==undefined&&(!Array.isArray(journey.profile[key])||!journey.profile[key].every(safeLevelId)))return false;
 const seen=new Set();return journey.levels.every(row=>{
  if(!object(row)||!safeLevelId(row.levelId)||seen.has(row.levelId)||row.schemaVersion!==1||!Number.isFinite(row.updatedAt)||!object(row.checkpoint))return false;
  seen.add(row.levelId);return true;
 });
}
export function validateSave(value){
 if(!object(value)||value.format!==SAVE_FORMAT)throw Error('invalid-save');
 if(value.version!==SAVE_VERSION)throw Error(Number.isInteger(value.version)&&value.version>SAVE_VERSION?'unsupported-save':'invalid-save');
 if(!validJourney(value.payload)||!Array.isArray(value.payload.archives)||value.payload.archives.length>1000||!value.payload.archives.every(row=>row?.schemaVersion===1&&Number.isFinite(row.createdAt)&&validJourney(row)))throw Error('invalid-save');
 return value;
}
export function decodeSave(text){
 if(typeof text!=='string'||new TextEncoder().encode(text).byteLength>MAX_SAVE_BYTES)throw Error('invalid-save');
 try{return validateSave(JSON.parse(text));}catch(error){if(error.message==='unsupported-save')throw error;throw Error('invalid-save');}
}
export function encodeSave(payload,time=Date.now()){
 return {format:SAVE_FORMAT,version:SAVE_VERSION,contentVersion:CONTENT_VERSION,exportedAt:new Date(time).toISOString(),payload:JSON.parse(JSON.stringify(payload))};
}
