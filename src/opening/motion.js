const clamp=value=>Math.min(1,Math.max(0,value));
const smooth=value=>{const t=clamp(value);return t*t*(3-2*t);};
export const OPENING_ENTRY_MS=1500;

// This clock advances only by visible-frame time. A background tab cannot jump
// the camera across the building, and disposal never completes a stale entry.
export function createOpeningMotion({reduced=false}={}){
 let angle=0,paused=false,entry=null,disposed=false;
 return {
  pause(value){paused=value;},
  reduce(value){reduced=value;},
  enter(){
   if(disposed)return Promise.resolve(false);
   if(entry)return entry.promise;
   let resolve;const promise=new Promise(done=>{resolve=done;});
   entry={elapsed:0,promise,resolve};return promise;
  },
  step(delta,visible=true){
   const dt=visible?Math.max(0,Math.min(delta,80)):0;
   if(entry){
    entry.elapsed+=dt;const progress=clamp(entry.elapsed/(reduced?180:OPENING_ENTRY_MS));
    const state={angle,entering:true,progress,travel:reduced?0:smooth(progress),fade:reduced?smooth(progress):smooth((progress-.7)/.3)};
    if(progress===1){const done=entry;entry=null;done.resolve(true);}
    return state;
   }
   if(!disposed&&!paused&&!reduced)angle=(angle+dt*Math.PI*2/180000)%(Math.PI*2);
   return {angle,entering:false,progress:0,travel:0,fade:0};
  },
  dispose(){disposed=true;entry?.resolve(false);entry=null;}
 };
}
