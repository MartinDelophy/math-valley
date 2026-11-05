import * as THREE from 'three';
import {BASE_AZIMUTH,CAMERA_SLOPE} from '../chapter/spatial.js';
import {elements,element,image,bitView,mirrorView,evaluation} from './math.js';
export function buildExpansionModel(K,L,act){
 const {world,box,cyl,sphere,materials:M}=K,hit=[],actor=K.makeTraveler(world),positions=new Map(),lamps=[],seals=[],groupTokens=[],beams=[],drawbridges=[];
 const ink=K.material('#54415c'),glass=K.material('#69b9b3',{emissive:'#266661',emissiveIntensity:.45}),muted=K.material('#806883'),glow=K.material('#f9d78d',{emissive:'#deab3e',emissiveIntensity:.7});
 function label(text,parent,x,y,z){const c=document.createElement('canvas');c.width=256;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#f8e7c8';ctx.font='bold 64px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,128,68);const tex=new THREE.CanvasTexture(c),sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:true}));sprite.position.set(x,y,z);sprite.scale.set(1.15,.57,1);parent.add(sprite);return sprite;}
 function path(a,b,mat=M.cream,width=.55){const d=b.clone().sub(a),len=d.length(),mesh=box(world,...a.clone().add(b).multiplyScalar(.5).toArray(),width,.16,len,mat,.035);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),d.normalize());return mesh;}
 function portal(p,action){const g=new THREE.Group();g.position.copy(p);world.add(g);const ring=new THREE.Mesh(new THREE.TorusGeometry(.43,.055,10,48),M.gold);ring.position.y=.72;ring.userData.expansionAction=action;g.add(ring);hit.push(ring);for(const x of [-.43,.43])box(g,x,.32,0,.12,.64,.18,M.trim);cyl(g,0,.015,0,.62,.08,M.gold);return g;}
 function pillar(p,i,high=true){cyl(world,p.x,p.y/2,p.z,.58,p.y,M.cream,32);cyl(world,p.x,p.y-.08,p.z,.82,.18,M.trim);cyl(world,p.x,.12,p.z,.77,.24,M.stone);if(high){for(let j=0;j<4;j++){const a=j*Math.PI/2,win=K.material('#5a4a62');box(world,p.x+Math.cos(a)*.56,p.y*.55,p.z+Math.sin(a)*.56,.16,.6,.16,win);}}}
 if(L.chapter===3){
  cyl(world,0,.18,0,3.3,.36,M.stone,64);cyl(world,0,.4,0,2.9,.16,M.trim,64);cyl(world,0,.54,0,2.55,.12,M.teal,64);
  const plinth=new THREE.Group();world.add(plinth);K.makeHouse(plinth,new THREE.Vector3(0,.6,0));
  for(let x=0;x<L.n;x++){const a=x*2*Math.PI/L.n,p=new THREE.Vector3(Math.sin(a)*1.95,.65,Math.cos(a)*1.95);const obelisk=cyl(world,...p.toArray(),.16,.8,x===0?M.gold:M.teal,6);const orb=sphere(world,p.x,1.2,p.z,.14,x===0?glow:glass);const tag=label(String(x),world,p.x,1.65,p.z);groupTokens.push({obelisk,orb,x,tag});}
  for(let k=0;k<L.n;k++){
   const a=k*2*Math.PI/L.n,lower=new THREE.Vector3(Math.sin(a)*4.4,1.3,Math.cos(a)*4.4),view=mirrorView({k}),az=BASE_AZIMUTH+view*Math.PI/2,upper=lower.clone().add(new THREE.Vector3(Math.sin(az)*2.5/CAMERA_SLOPE,2.5,Math.cos(az)*2.5/CAMERA_SLOPE));
   for(const [m,p] of [[0,lower],[1,upper]]){const g={k,m},key=element(g);positions.set(key,p);pillar(p,k);const entry=portal(p,['mirror',key]);entry.rotation.y=az;label(groupLabelFor(g),world,p.x,p.y+1.5,p.z);const seal=cyl(world,p.x,p.y+.08,p.z,.76,.04,M.gold);seal.visible=false;seals.push({key,seal});}
  }
  for(const m of [0,1])for(let k=0;k<L.n;k++){const a=positions.get(element({k,m})),b=positions.get(element({k:(k+1)%L.n,m}));path(a,b,m?M.paving:M.cream);}
  // A colonnade and entry steps make the two Cayley galleries spatially legible.
  const start=positions.get('r^0');for(let i=0;i<5;i++)box(world,start.x,start.y-.09-i*.14,start.z+.55+i*.23,1.4,.18,.45,M.trim);
  K.makeHouse(world,positions.get(element({k:L.n-1,m:1})).clone().add(new THREE.Vector3(0,0,-.8)));
 }else{
  const count=L.bits;
  cyl(world,0,.12,0,5.7,.24,M.stone,64);cyl(world,0,.28,0,5.3,.12,M.trim,64);
  for(let i=0;i<count;i++){
   const a=(i/count*1.65-.825)*Math.PI,p=new THREE.Vector3(Math.sin(a)*4.4,1.3+(i%3)*1.25,Math.cos(a)*4.4-1);positions.set(String(i),p);pillar(p,i);const g=new THREE.Group();g.position.copy(p);world.add(g);
   cyl(g,0,.5,0,.34,1,M.cream,24);cyl(g,0,1.03,0,.45,.14,M.gold,32);const lamp=sphere(g,0,1.35,0,.28,muted);lamp.userData.expansionAction=['bit',i];hit.push(lamp);lamps.push(lamp);
   const crown=cyl(g,0,1.75,0,.5,.45,M.teal,4,0);crown.rotation.y=Math.PI/4;label(String(i+1),world,p.x,p.y+2.2,p.z);
   const seal=cyl(g,0,.03,0,.77,.05,M.gold);seal.visible=false;seals.push({i,seal});
  }
  for(let i=0;i<count-1;i++){const bridge=path(positions.get(String(i)),positions.get(String(i+1)),i%2?M.paving:M.cream,.68);drawbridges.push(bridge);}
  // Three independent parity channels, with the overall parity visible at IV.
  const hub=new THREE.Vector3(0,5.8,-1.3);pillar(hub,0);K.makeHouse(world,hub);actor.traveler.position.copy(positions.get('0'));
  for(let check=0;check<4;check++)for(let i=0;i<count;i++)if(check===3||i<7&&((i+1)&(1<<check))){const p=positions.get(String(i)).clone().add(new THREE.Vector3(0,1.4,0)),mid=p.clone().add(hub).multiplyScalar(.5);mid.y+=1.3;const curve=new THREE.QuadraticBezierCurve3(p,mid,hub),beam=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.025,6,false),check%2?M.gold:glass);world.add(beam);beams.push({check,beam});}
 }
 K.fitWorld();
 function groupLabelFor(g){return g.k===0?(g.m?'s':'e'):`r${g.k===1?'':['⁰','¹','²','³','⁴','⁵'][g.k]}${g.m?'s':''}`;}
 return {hit,actor,positions,update(s,view){
  if(L.chapter===3){actor.traveler.position.copy(positions.get(element(s)));for(const {key,seal} of seals)seal.visible=s.marks.includes(key);for(const token of groupTokens){const a=image(s,token.x,L.n)*Math.PI*2/L.n;token.tag.position.x=token.obelisk.position.x=token.orb.position.x=Math.sin(a)*1.95;token.tag.position.z=token.obelisk.position.z=token.orb.position.z=Math.cos(a)*1.95;}}
  else{for(const bridge of drawbridges)bridge.visible=evaluation(L,s).pass;actor.traveler.position.copy(positions.get(String(s.touched.at(-1)??0)).clone().add(new THREE.Vector3(.58,0,.2)));for(let i=0;i<lamps.length;i++)lamps[i].material=s.bits[i]?glow:muted;for(const {check,beam} of beams)beam.visible=check===view;for(const {i,seal} of seals)seal.visible=s.touched.includes(i);}
 },point(s){const p=positions.get(L.chapter===3?element(s):String(s.touched.at(-1)??0)).clone();return L.chapter===3?p:p.add(new THREE.Vector3(.58,0,.2));}};
}
