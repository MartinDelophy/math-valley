import {settings} from '../settings/store';
let context;
export function playEffect(kind='step'){
 if(!settings.get().soundEffects||document.hidden)return;
 try{context??=new (window.AudioContext||window.webkitAudioContext)();context.resume();const now=context.currentTime,notes=kind==='success'?[523.25,659.25,783.99]:kind==='portal'?[293.66,440,587.33]:kind==='mark'?[659.25,783.99]:[440];notes.forEach((frequency,i)=>{const tone=context.createOscillator(),gain=context.createGain(),start=now+i*.09;tone.type='sine';tone.frequency.setValueAtTime(frequency,start);gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.055,start+.012);gain.gain.exponentialRampToValueAtTime(.001,start+.38);tone.connect(gain).connect(context.destination);tone.start(start);tone.stop(start+.4);});}catch{/* Text and scene feedback remain available when audio is unavailable. */}
}
