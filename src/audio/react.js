import {useEffect,useSyncExternalStore} from 'react';
import {narrate,stopNarration,audioStatus} from './controller';
import {useSettings} from '../settings/store';
export const useAudioStatus=()=>useSyncExternalStore(audioStatus.subscribe,audioStatus.get,audioStatus.get);
export function useNarration(text,locale,active=true){
 const p=useSettings(),{voices}=useAudioStatus();
 useEffect(()=>{if(active&&p.narration)narrate(text,locale);return stopNarration;},[text,locale,active,p.narration,voices]);
}
