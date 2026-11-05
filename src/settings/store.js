import {useSyncExternalStore} from 'react';
import {saves} from '../storage/index';
import {DEFAULT_SETTINGS,cleanPreferences} from './model';
let value={...DEFAULT_SETTINGS};const listeners=new Set();
export const settings={get:()=>value,subscribe:listener=>{listeners.add(listener);return()=>listeners.delete(listener);}};
export function hydrateSettings(){value={...DEFAULT_SETTINGS,...cleanPreferences(saves.profile().preferences)};for(const listener of listeners)listener();}
export function updateSettings(patch){value={...value,...cleanPreferences(patch)};saves.saveProfile({preferences:value});for(const listener of listeners)listener();}
export const useSettings=()=>useSyncExternalStore(settings.subscribe,settings.get,settings.get);
