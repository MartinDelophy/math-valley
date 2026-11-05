import {settings} from '../settings/store';
import {matchingVoice} from '../settings/model';
let music,unlocked=false,reading=false,currentToken=0,fadeTimer,error='',voices=[];
const listeners=new Set();let status={voices:[],reading:false,error:''};
const synth=()=>globalThis.speechSynthesis;
const emit=()=>{status={voices,reading,error};for(const listener of listeners)listener();};
export const audioStatus={get:()=>status,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}};
function fade(target){
 if(!music)return;clearInterval(fadeTimer);const start=music.volume,time=performance.now();
 fadeTimer=setInterval(()=>{const progress=Math.min(1,(performance.now()-time)/450);if(music)music.volume=Math.max(0,Math.min(1,start+(target-start)*progress));if(progress===1)clearInterval(fadeTimer);},25);
}
function apply(){
 const p=settings.get();if(!p.narration&&reading)stopNarration();
 if(!unlocked||!p.music||document.hidden){music?.pause();return;}
 if(!music){music=new Audio('/audio/bach-prelude-bwv846.mp3');music.loop=true;music.preload='none';music.volume=0;music.dataset.soundtrack='bach-bwv846';music.hidden=true;document.body.append(music);music.addEventListener('error',()=>{error='音乐暂时无法播放，请再试一次。';emit();});}
 if(music.paused)music.play().then(()=>{error='';emit();}).catch(e=>{if(e.name!=='AbortError'){error='音乐暂时无法播放，请再试一次。';emit();}});
 fade(p.musicVolume*(reading ? .22 : 1));
}
export function unlockAudio(){unlocked=true;apply();}
export function retryMusic(){if(music){music.load();error='';}unlockAudio();}
export function stopNarration(){currentToken++;synth()?.cancel();reading=false;emit();if(music)fade(settings.get().musicVolume);}
export function narrate(text,locale,{preview=false}={}){
 stopNarration();if(!text||!unlocked||document.hidden||(!settings.get().narration&&!preview))return;
 const voice=matchingVoice(voices,locale);if(!voice||!synth())return;
 const token=currentToken,parts=text.match(/[^.!?。！？\n]+[.!?。！？\n]?/g)||[text];
 reading=true;emit();if(music)fade(settings.get().musicVolume*.22);
 parts.forEach((part,i)=>{
  const utterance=new SpeechSynthesisUtterance(part);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=.94;utterance.volume=settings.get().voiceVolume;
  const finish=()=>{if(token===currentToken){reading=false;emit();if(music)fade(settings.get().musicVolume);}};
  if(i===parts.length-1)utterance.onend=finish;utterance.onerror=finish;synth().speak(utterance);
 });
}
export function installAudio(){
 const refreshVoices=()=>{voices=synth()?.getVoices()||[];emit();};
 const gesture=()=>{if(!unlocked)unlockAudio();};
 const visibility=()=>{if(document.hidden)stopNarration();apply();};
 refreshVoices();synth()?.addEventListener('voiceschanged',refreshVoices);
 window.addEventListener('pointerdown',gesture,{capture:true});window.addEventListener('keydown',gesture,{capture:true});document.addEventListener('visibilitychange',visibility);const unsubscribe=settings.subscribe(apply);
 return()=>{unsubscribe();window.removeEventListener('pointerdown',gesture,true);window.removeEventListener('keydown',gesture,true);document.removeEventListener('visibilitychange',visibility);synth()?.removeEventListener('voiceschanged',refreshVoices);stopNarration();music?.pause();clearInterval(fadeTimer);};
}
