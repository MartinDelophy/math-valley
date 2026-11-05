import {useLayoutEffect,useRef} from 'react';
// Fit the full primary label to its actual plate width, including loaded fonts.
export function FitText({children}){
 const ref=useRef();useLayoutEffect(()=>{
  const el=ref.current,parent=el.parentElement;let disposed=false;
  const fit=()=>{if(disposed)return;el.style.fontSize='';const style=getComputedStyle(parent),available=parent.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);const size=parseFloat(getComputedStyle(el).fontSize);if(el.scrollWidth>available&&available>0)el.style.fontSize=`${Math.max(14,size*available/el.scrollWidth-.5)}px`;};
  const observer=new ResizeObserver(fit);observer.observe(parent);fit();document.fonts?.ready.then(fit);return()=>{disposed=true;observer.disconnect();};
 },[children]);return <span className="fit-label" ref={ref}>{children}</span>;
}
