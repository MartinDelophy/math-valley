import * as THREE from 'three';
import {makeStage} from '../chapter/scene-kit';
import {initialExpansion,stepExpansion,evaluation,replayExpansion,mirrorView,bitView,element} from './math';
import {expansionCheckpoint,restoreExpansion} from './checkpoint';
import {buildExpansionModel} from './model';
import {playEffect} from '../audio/effects';
export function createExpansionGame(container,L,cb){
 const K=makeStage(container),restored=restoreExpansion(L,cb.resume);let state=restored?.state||initialExpansion(L),actions=restored?.actions||[],won=restored?.won||false,feedback='',tested=false,paused=false,disposed=false,frame,dirty=true,motion=null,drag=null,lastBusy=false;
 const canvas=K.renderer.domElement,ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),model=buildExpansionModel(K,L,act);
 function notify(){dirty=true;cb.onState({...state,camera:K.viewState(),history:actions.length,walking:!!motion,won,feedback,tested,ready:evaluation(L,state).pass});if(!motion&&!drag&&!K.viewState().busy)cb.onCheckpoint?.(expansionCheckpoint(L,actions,K.viewState(),won));}
 function act(method,arg){
  if(paused||won||motion||K.viewState().busy)return;
  if(method==='mirror'){if(arg!==element(state))return;method='s';arg=undefined;}
  const view=K.viewState(),required=method==='s'?mirrorView(state):method==='bit'?bitView(arg):null;
  if(required!==null&&(view.overhead||view.index!==required)) {feedback=`先对齐至${['Ⅰ','Ⅱ','Ⅲ','Ⅳ'][required]}侧，再操作这一机关。`;tested=true;notify();return;}
  const next=stepExpansion(L,state,[method,...(arg===undefined?[]:[arg])]);
  if(!next){feedback='证据尚不完整。检查目标、封存记录与行动预算。';tested=true;notify();return;}
  tested=false;feedback='';const record=[method,...(arg===undefined?[]:[arg])];
  if(['r','R','s','bit'].includes(method)){
   const from=model.point(state),to=model.point(next);motion={from,to,next,record,method,start:performance.now(),duration:method==='s'?900:650};playEffect(method==='s'?'portal':'step');notify();
  }else{state=next;actions.push(record);playEffect(method==='mark'?'mark':'step');model.update(state,K.viewState().index);notify();}
 }
 function test(){if(paused||won||motion||K.viewState().busy)return;const result=evaluation(L,state);feedback=result.detail;tested=true;if(result.final){won=true;playEffect('success');notify();}else if(result.pass){act('test');}else notify();}
 function reset(){state=initialExpansion(L);actions=[];won=false;motion=null;feedback='';tested=false;K.restoreView({index:0,zoom:K.viewState().zoom});model.update(state,0);notify();}
 function pick(e){const b=canvas.getBoundingClientRect();mouse.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(mouse,K.camera);return ray.intersectObjects(model.hit,false)[0]?.object.userData.expansionAction;}
 function down(e){if(paused||motion)return;drag={x:e.clientX,y:e.clientY,last:e.clientX,action:pick(e),moved:false};canvas.setPointerCapture?.(e.pointerId);}
 function move(e){if(!drag){canvas.style.cursor=pick(e)?'pointer':'grab';return;}if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>5){drag.moved=true;K.orbit(e.clientX-drag.last);notify();}drag.last=e.clientX;}
 function up(){if(!drag)return;const d=drag;drag=null;if(d.moved){K.snapView();notify();}else if(d.action)act(...d.action);}
 function wheel(e){if(paused)return;e.preventDefault();K.setZoom(e.deltaY<0?.08:-.08);notify();}
 for(const [event,fn] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['wheel',wheel]])canvas.addEventListener(event,fn,{passive:false});
 function update(now){if(disposed)return;frame=requestAnimationFrame(update);const changed=K.updateCamera(now),busy=K.viewState().busy;if(busy!==lastBusy){lastBusy=busy;model.update(state,K.viewState().index);notify();}
  if(motion&&!paused){const t=Math.min(1,(now-motion.start)/motion.duration),p=t*t*(3-2*t);model.actor.traveler.position.lerpVectors(motion.from,motion.to,p);model.actor.traveler.position.y+=Math.sin(t*Math.PI)*(motion.method==='s'?.25:.16);model.actor.traveler.scale.setScalar(.78*(motion.method==='s'?.25+.75*Math.abs(2*t-1):1));dirty=true;if(t===1){state=motion.next;actions.push(motion.record);motion=null;model.actor.traveler.scale.setScalar(.78);model.update(state,K.viewState().index);notify();}}
  if(dirty||changed||K.takeDirty()){K.renderer.render(K.scene,K.camera);dirty=false;}
 }
 if(restored)K.restoreView(restored.camera);model.update(state,K.viewState().index);notify();frame=requestAnimationFrame(update);
 return {act,test,reset,undo(){if(paused||motion||!actions.length)return;actions.pop();state=replayExpansion(L,actions);won=false;feedback='';tested=false;model.update(state,K.viewState().index);notify();},setView(i){if(paused||motion)return;K.setView(i);notify();},turnView(d){if(paused||motion)return;K.turnView(d);notify();},toggleOverhead(){if(paused||motion)return;K.toggleOverhead();notify();},zoom(d){K.setZoom(d);notify();},resetView(){K.resetView();notify();},snapshot:K.snapshot,pause(v){if(!v&&paused&&motion)motion.start+=performance.now()-paused;paused=v?performance.now():false;},dispose(){disposed=true;cancelAnimationFrame(frame);for(const [event,fn] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['wheel',wheel]])canvas.removeEventListener(event,fn);K.dispose();}};
}
