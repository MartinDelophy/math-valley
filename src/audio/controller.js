import {settings} from '../settings/store';
let music,unlocked=false,fadeTimer,error='';
const listeners=new Set();let status={error:''};
const emit=()=>{status={error};for(const listener of listeners)listener();};
export const audioStatus={get:()=>status,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}};
function fade(target){
 if(!music)return;clearInterval(fadeTimer);const start=music.volume,time=performance.now();
 fadeTimer=setInterval(()=>{const progress=Math.min(1,(performance.now()-time)/450);if(music)music.volume=Math.max(0,Math.min(1,start+(target-start)*progress));if(progress===1)clearInterval(fadeTimer);},25);
}
function apply(){
 const p=settings.get();
 if(!unlocked||!p.music||document.hidden){music?.pause();return;}
 if(!music){music=new Audio('/audio/bach-prelude-bwv846.mp3');music.loop=true;music.preload='none';music.volume=0;music.dataset.soundtrack='bach-bwv846';music.hidden=true;document.body.append(music);music.addEventListener('error',()=>{error='音乐暂时无法播放，请再试一次。';emit();});}
 if(music.paused)music.play().then(()=>{error='';emit();}).catch(e=>{if(e.name!=='AbortError'){error='音乐暂时无法播放，请再试一次。';emit();}});
 fade(p.musicVolume);
}
export function unlockAudio(){unlocked=true;apply();}
export function retryMusic(){if(music){music.load();error='';}unlockAudio();}
export function installAudio(){
 const gesture=()=>{if(!unlocked)unlockAudio();};
 const visibility=()=>apply();
 window.addEventListener('pointerdown',gesture,{capture:true});window.addEventListener('keydown',gesture,{capture:true});document.addEventListener('visibilitychange',visibility);const unsubscribe=settings.subscribe(apply);
 return()=>{unsubscribe();window.removeEventListener('pointerdown',gesture,true);window.removeEventListener('keydown',gesture,true);document.removeEventListener('visibilitychange',visibility);music?.pause();clearInterval(fadeTimer);};
}
