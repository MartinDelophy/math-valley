import * as THREE from 'three';
import {makeStage} from '../chapter/scene-kit';
import {buildTopologyModel} from '../topology/model';
import {initialTopologyState} from '../topology/math';
import {TOPOLOGY_LEVELS} from '../topology/levels';

// A title-screen diorama: real chapter geometry, with no game actions or save
// callbacks. Its own camera framing never changes the playable chapter cameras.
export function createOpeningScene(host){
 const K=makeStage(host),model=buildTopologyModel(K,TOPOLOGY_LEVELS[0],()=>{});
 model.update(initialTopologyState(TOPOLOGY_LEVELS[0]));
 K.restoreView({index:0,overhead:false,zoom:1.1});
 let frame,disposed=false,dirty=true;
 const floor=K.ground,original=floor.material;
 const texture=new THREE.TextureLoader().load('/assets/opening/plum-ground.jpg',()=>{dirty=true;});
 texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(13,13);texture.anisotropy=4;
 floor.material=new THREE.MeshStandardMaterial({map:texture,color:'#aa94bd',roughness:1});original.dispose();
 for(const gate of model.gates)if(gate.light)gate.light.material.opacity=.08;
 const door=model.gates.find(gate=>gate.layer===0&&gate.letter==='a');
 if(door){
  door.g.rotation.y+=Math.PI;
  const outline=new THREE.Shape();outline.moveTo(-.35,.02);outline.lineTo(.35,.02);outline.lineTo(.35,1.1);outline.absarc(0,1.1,.35,0,Math.PI,false);outline.closePath();
  const glow=new THREE.Mesh(new THREE.ShapeGeometry(outline,24),new THREE.MeshBasicMaterial({color:'#f3bb61',toneMapped:false,side:THREE.DoubleSide}));
  glow.position.z=.19;door.g.add(glow);
  const warm=new THREE.PointLight('#ffb74f',1.5,5,2);warm.position.set(0,.8,.6);door.g.add(warm);
  door.g.updateWorldMatrix(true,false);model.actor.traveler.position.copy(door.g.localToWorld(new THREE.Vector3(0,0,.72)));model.actor.traveler.rotation.y=door.g.rotation.y+Math.PI;
 }
 K.materials.stone.color.set('#c8a9ac');K.materials.paving.color.set('#d0b2b3');K.materials.trim.color.set('#e4c9b8');K.materials.cream.color.set('#e9c9af');
 K.renderer.toneMappingExposure=1.04;
 K.scene.traverse(light=>{if(light.isHemisphereLight)light.intensity=2.3;else if(light.isDirectionalLight){light.intensity=light.castShadow?2.4:.8;if(light.castShadow){light.position.set(6,15,9);light.shadow.radius=16;light.shadow.blurSamples=16;};}});
 K.world.updateMatrixWorld(true);
 const target=new THREE.Box3().setFromObject(K.world).getCenter(new THREE.Vector3());
 const point=new THREE.Vector3(),low=new THREE.Vector3(),high=new THREE.Vector3();
 function fit(){
  const w=host.clientWidth,h=host.clientHeight,aspect=w/h,mobile=w<=680;
  K.camera.position.copy(target).add(new THREE.Vector3(-22,13,22));K.camera.lookAt(target);K.camera.updateMatrixWorld();
  low.set(Infinity,Infinity,0);high.set(-Infinity,-Infinity,0);
  // Fit real vertices: circular galleries have much tighter projected bounds
  // than the corners of their enclosing box.
  K.world.traverse(mesh=>{if(!mesh.isMesh||!mesh.visible)return;const positions=mesh.geometry.getAttribute('position');for(let i=0;i<positions.count;i++){point.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld).applyMatrix4(K.camera.matrixWorldInverse);low.x=Math.min(low.x,point.x);low.y=Math.min(low.y,point.y);high.x=Math.max(high.x,point.x);high.y=Math.max(high.y,point.y);}});
  const region=mobile?{width:.93,height:.92,x:.5,y:.49}:{width:.585,height:.92,x:.675,y:.475};
  const H=Math.max((high.y-low.y)/region.height,(high.x-low.x)/(aspect*region.width)),W=H*aspect;
  const cx=(high.x+low.x)/2-(2*region.x-1)*W/2,cy=(high.y+low.y)/2-(1-2*region.y)*H/2;
  Object.assign(K.camera,{left:cx-W/2,right:cx+W/2,top:cy+H/2,bottom:cy-H/2});K.camera.updateProjectionMatrix();dirty=true;
 }
 const observer=new ResizeObserver(fit);observer.observe(host);fit();
 function update(){if(disposed)return;frame=requestAnimationFrame(update);if(dirty||K.takeDirty()){K.renderer.render(K.scene,K.camera);dirty=false;}}
 frame=requestAnimationFrame(update);
 return {dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();texture.dispose();K.dispose();}};
}
