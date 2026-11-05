import {SpeakerHigh,Stop} from '@phosphor-icons/react';
import {t,useLocale} from '../i18n/react';
import {useNarration,useAudioStatus} from './react';
import {narrate,stopNarration,unlockAudio} from './controller';
import {matchingVoice} from '../settings/model';
import {useSettingsPanel} from '../settings/Settings';
export function ReadAloud({text}){
 const locale=useLocale(),status=useAudioStatus(),{isOpen}=useSettingsPanel();const translated=t(text);useNarration(translated,locale,!isOpen);
 if(!matchingVoice(status.voices,locale))return null;
 return <button className="read-aloud" onClick={()=>{unlockAudio();status.reading?stopNarration():narrate(translated,locale,{preview:true});}}>{status.reading?<Stop size={15}/>:<SpeakerHigh size={15}/>}<span>{t(status.reading?'停止朗读':'朗读这一页')}</span></button>;
}
