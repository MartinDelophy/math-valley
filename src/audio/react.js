import {useSyncExternalStore} from 'react';
import {audioStatus} from './controller';
export const useAudioStatus=()=>useSyncExternalStore(audioStatus.subscribe,audioStatus.get,audioStatus.get);
