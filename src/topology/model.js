import * as THREE from 'three';
import {destination} from './math';
const TAU=Math.PI*2,START=Math.PI*.72,PITCH=2.35;
export function buildTopologyModel(K,level,onAction){
 const {world,box,cyl,materials:M}=K,hit=[],gates=[],seals=[],decks=[];
 const shape=v=>level.scene==='courts'?Math.sign(v)*Math.abs(v)**.55:v,cos=a=>shape(Math.cos(a)),sin=a=>shape(Math.sin(a));
 const teal=K.material('#6ba89d',{roughness:.68,emissive:'#285f5a',emissiveIntensity:.1}),amber=K.material('#c99750',{metalness:.35,roughness:.52});
 function touch(mesh,action){mesh.traverse(o=>{if(o.isMesh){o.userData.topologyAction=action;hit.push(o);}});}
 function ribbon(parent,cx,cz,r,w,start,end,height,mat,thickness=.24){
  const n=Math.max(3,Math.ceil(Math.abs(end-start)*20)),pos=[],idx=[];
  for(let i=0;i<=n;i++){const t=i/n,a=start+(end-start)*t,y=typeof height==='function'?height(t):height;for(const [rr,yy] of [[r+w/2,y],[r-w/2,y],[r+w/2,y-thickness],[r-w/2,y-thickness]])pos.push(cx+cos(a)*rr,yy,cz+sin(a)*rr);}
  for(let i=0;i<n;i++){const a=i*4;idx.push(a,a+1,a+4,a+1,a+5,a+4,a+2,a+6,a+3,a+3,a+6,a+7,a,a+4,a+2,a+2,a+4,a+6,a+1,a+3,a+5,a+3,a+7,a+5);}idx.push(0,2,1,1,2,3,n*4,n*4+1,n*4+2,n*4+1,n*4+3,n*4+2);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
 }
 function band(parent,cx,cz,r,y,start=0,end=TAU,mat=M.gold,w=.035){return ribbon(parent,cx,cz,r,w,start,end,y,mat,.025);}
 function colonnade(cx,cz,r,y,base,count=16){const archR=r*Math.sin(Math.PI/count),spring=y-.28-archR;
  for(let i=0;i<count;i++){const a=i/count*TAU,x=cx+cos(a)*r,z=cz+sin(a)*r,h=Math.max(.35,spring-base);box(world,x,base+h/2,z,.22,h,.22,M.stone,.025);box(world,x,base+.08,z,.35,.16,.35,M.trim,.025);box(world,x,spring,z,.33,.16,.33,M.trim,.025);cyl(world,x,spring-.15,z,.14,.055,M.gold,16);if(h>1.2)cyl(world,x,base+.4,z,.12,.06,M.gold,16);
   const end=a+TAU/count,ex=cx+cos(end)*r,ez=cz+sin(end)*r,half=Math.hypot(ex-x,ez-z)/2,inside=half-.12,rise=Math.min(inside,y-base-.52),springY=y-.36-rise;
   const shape=new THREE.Shape();shape.moveTo(-half,y-.23);shape.lineTo(half,y-.23);shape.lineTo(half,base);shape.lineTo(inside,base);shape.lineTo(inside,springY);shape.absarc(0,springY,rise,0,Math.PI,false);shape.lineTo(-inside,base);shape.lineTo(-half,base);shape.closePath();
   const geo=new THREE.ExtrudeGeometry(shape,{depth:.24,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:2,curveSegments:18});geo.translate(0,0,-.12);const mesh=new THREE.Mesh(geo,M.stone);mesh.position.set((x+ex)/2,0,(z+ez)/2);mesh.rotation.y=-Math.atan2(ez-z,ex-x);mesh.castShadow=true;mesh.receiveShadow=true;world.add(mesh);
  }
 }
 function ring(cx,cz,r,w,y,base,layer,letter,count=16){const g=new THREE.Group();world.add(g);const arc=ribbon(g,cx,cz,r,w,0,TAU,y,M.paving);touch(arc,{letter,layer});ribbon(g,cx,cz,r,w+.12,0,TAU,y-.22,M.trim,.1);band(g,cx,cz,r+w/2-.05,y+.05,0,TAU,M.trim,.06);band(g,cx,cz,r-w/2+.04,y+.05,0,TAU,M.trim,.07);band(g,cx,cz,r-.24,y+.027,0,TAU,letter==='b'?amber:teal,.055);
  for(let i=0;i<36;i++){const a=i/36*TAU,p=new THREE.Vector3(cx+cos(a)*r,y+.025,cz+sin(a)*r),tile=box(g,p.x,p.y,p.z,w-.06,.025,.018,M.trim,.004);tile.rotation.y=-a;}
  for(let i=0;i<10;i++){const a=i/10*TAU;if(Math.sin(a)<.4)ribbon(g,cx,cz,r+w/2-.08,.15,a+.03,a+TAU/10-.03,y+.25,M.cream,.25);}
  colonnade(cx,cz,r+w/2-.18,y,base,count);decks.push(g);return g;
 }
 function gate(position,rotation,letter,layer,scale=1){const g=new THREE.Group();world.add(g);g.position.copy(position);g.rotation.y=rotation;g.scale.setScalar(scale);const colored=letter.toLowerCase()==='b'?amber:teal;
  const outline=new THREE.Shape();outline.moveTo(-.58,0);outline.lineTo(.58,0);outline.lineTo(.58,1.13);outline.absarc(0,1.13,.58,0,Math.PI,false);outline.lineTo(-.58,0);const hole=new THREE.Path();hole.moveTo(-.36,0);hole.lineTo(-.36,1.1);hole.absarc(0,1.1,.36,Math.PI,0,true);hole.lineTo(.36,0);outline.holes.push(hole);const wall=new THREE.Mesh(new THREE.ExtrudeGeometry(outline,{depth:.32,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,curveSegments:24}),M.cream);wall.position.z=-.16;wall.castShadow=true;g.add(wall);
  for(const x of [-.41,.41]){box(g,x,.55,.20,.09,1.1,.09,M.goldEdge,.018);box(g,x,0,0,.37,.12,.5,M.trim,.025);}const arc=new THREE.Mesh(new THREE.TorusGeometry(.41,.075,8,28,Math.PI),M.goldEdge);arc.position.set(0,1.1,.20);g.add(arc);const light=new THREE.Mesh(new THREE.PlaneGeometry(.69,1.1),colored.clone());light.material.transparent=true;light.material.opacity=.26;light.material.side=THREE.DoubleSide;light.position.set(0,.62,.02);g.add(light);
  const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.11),colored);gem.position.set(0,1.65,.08);g.add(gem);if(letter===letter.toUpperCase()){const inset=new THREE.Mesh(new THREE.TorusGeometry(.1,.022,6,16),M.gold);inset.position.set(0,1.65,.17);g.add(inset);}if(level.scene==='moon'&&letter==='a'){const astro=new THREE.Group();astro.position.set(.85,.9,0);g.add(astro);for(const rot of [0,.9]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.34,.035,8,32),M.goldEdge);ring.rotation.y=rot;astro.add(ring);}K.sphere(astro,0,0,0,.07,M.gold);for(let i=0;i<4;i++){const a=i*Math.PI/2;K.sphere(astro,Math.cos(a)*.34,Math.sin(a)*.34,0,.055,M.gold);}}const dots=[];for(let i=0;i<3;i++)dots.push(K.sphere(g,(i-1)*.12,1.45,.23,.034,M.goldEdge));touch(g,{letter,layer});gates.push({g,light,layer,letter,dots});return g;
 }
 function marker(position,layer,index){const g=new THREE.Group();world.add(g);g.position.copy(position);cyl(g,0,.04,0,.24,.08,M.gold,24);cyl(g,0,.1,0,.20,.04,teal,24);const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.10),M.goldEdge);gem.position.y=.22;g.add(gem);seals.push({g,layer,index});}
 let hub,point,home;
 if(level.scene==='moon'){
  const r=3.65,w=1.3,n=level.sheets;hub=layer=>new THREE.Vector3(Math.cos(START)*r,1.4+layer*PITCH+.04,Math.sin(START)*r);
  ribbon(world,0,0,r,w+.38,0,TAU,.28,M.lilac,.28);band(world,0,0,r+w/2+.18,.31,0,TAU,M.trim,.12);
  for(let layer=0;layer<n;layer++){const y=hub(layer).y;ring(0,0,r,w,y,layer?hub(layer-1).y+.22:.3,layer,'a');
   const gp=hub(layer);const theta=START-.32;gate(new THREE.Vector3(Math.cos(theta)*r,y,Math.sin(theta)*r),-theta-Math.PI/2,'a',layer,1.0);gate(new THREE.Vector3(Math.cos(START+.32)*r,y,Math.sin(START+.32)*r),-START-.32-Math.PI/2,'A',layer,.72);
   marker(new THREE.Vector3(Math.cos(START+1.4)*r,y+.05,Math.sin(START+1.4)*r),layer,layer);
  }
  const top=n-1,angle=START+Math.PI;home=new THREE.Vector3(Math.cos(angle)*r,hub(top).y+.03,Math.sin(angle)*r);K.makeHouse(world,home);
  point=(from,to,letter,t)=>{const sign=letter==='a'?1:-1;if(t<.88){const a=START+sign*TAU*t/.88;return new THREE.Vector3(Math.cos(a)*r,hub(from).y,Math.sin(a)*r);}return hub(from).lerp(hub(to),((t-.88)/.12)**.5);};
 }else if(level.scene==='courts'){
  const r=2.1,w=1.02,n=3;hub=layer=>new THREE.Vector3(-r+cos(1.15)*r,1.4+(2-layer)*1.9,-1.2+sin(1.15)*r);
  for(let layer=0;layer<n;layer++){const y=hub(layer).y;
   ring(-r,-1.2,r,w,y,layer<2?hub(layer+1).y+.2:.2,layer,'a',12);ring(r,1.2,r,w,y+.65,layer<2?hub(layer+1).y+.85:.2,layer,'b',12);
   box(world,0,y-.13,0,1.8,.27,3.3,M.paving,.07);for(let k=0;k<6;k++)box(world,0,y+(k+1)*.65/6-.10,-.9+(k+.5)*2.1/6,1.05,.20,.38,M.paving,.025);
   gate(new THREE.Vector3(-.3,y,-1.2),-.25,'a',layer,.62);gate(new THREE.Vector3(.3,y+.65,1.2),-.25,'b',layer,.62);
   marker(new THREE.Vector3(-r*2,y+.08,-1.2),layer,layer);marker(new THREE.Vector3(r*2,y+.73,1.2),layer,layer);
  }
  home=new THREE.Vector3(3.84,hub(0).y+.69,2.94);box(world,home.x,home.y-.15,home.z,1.5,.3,1.5,M.paving,.05);K.makeHouse(world,home);
  point=(from,to,letter,t)=>{const b=letter.toLowerCase()==='b',sign=letter===letter.toLowerCase()?1:-1,y=hub(from).y,ty=hub(to).y;
   const left=(angle,height)=>new THREE.Vector3(-r+cos(angle)*r,height,-1.2+sin(angle)*r),right=(angle,height)=>new THREE.Vector3(r+cos(angle)*r,height+.65,1.2+sin(angle)*r);
   if(!b){if(t<.87)return left(1.15+sign*TAU*t/.87,y);return hub(from).lerp(hub(to),(t-.87)/.13);}
   if(t<.12)return left(1.15*(1-t/.12),y);if(t<.2)return left(0,y).lerp(right(Math.PI,y),(t-.12)/.08);if(t<.78)return right(Math.PI+sign*TAU*(t-.2)/.58,y);if(t<.87)return right(Math.PI,y).lerp(right(Math.PI,ty),(t-.78)/.09);if(t<.93)return right(Math.PI,ty).lerp(left(0,ty),(t-.87)/.06);return left(1.15*(t-.93)/.07,ty);};
 }else{
  const r=4.1,w=1.3,pitch=1.65,min=level.kind==='universal'?level.range[0]:0,max=level.kind==='universal'?level.range[1]:level.sheets;
  const yFor=layer=>1.25+(layer-min)*pitch;hub=layer=>new THREE.Vector3(Math.cos(START)*r,yFor(layer),Math.sin(START)*r);
  ribbon(world,0,0,r,w+.35,0,TAU,.3,M.lilac,.27);band(world,0,0,r,.34,0,TAU,M.gold,.025);
  for(let j=min;j<max;j++){const a0=START+j*TAU,h=t=>yFor(j)+t*pitch;ribbon(world,0,0,r,w,a0,a0+TAU,h,M.paving);ribbon(world,0,0,r+w/2-.06,.14,a0,a0+TAU,t=>h(t)+.25,M.cream,.25);band(world,0,0,r-w/2+.05,t=>h(t)+.035,a0,a0+TAU,M.trim,.07);band(world,0,0,r-.25,t=>h(t)+.04,a0,a0+TAU,teal,.045);
   for(let k=0;k<48;k++){const t=k/48,a=a0+t*TAU,tile=box(world,Math.cos(a)*r,h(t)+.012,Math.sin(a)*r,w-.05,.02,.015,M.trim,.003);tile.rotation.y=-a;tile.rotation.z=-Math.atan2(pitch,r*TAU);}
   // Keep the seam's arrival point clear in the default three-quarter view.
   for(let k=0;k<4;k++){const t=k/4+.075,a=a0+t*TAU,x=Math.cos(a)*(r+.37),z=Math.sin(a)*(r+.37),y=h(t);box(world,x,y/2,z,.20,y-.16,.20,M.stone,.025);box(world,x,y-.12,z,.38,.16,.38,M.trim,.025);cyl(world,x,y-.35,z,.13,.055,M.gold,16);}
   const a=a0+.01;box(world,Math.cos(a)*r,h(0)+.07,Math.sin(a)*r,w+.05,.05,.10,M.gold,.01).rotation.y=-a;marker(new THREE.Vector3(Math.cos(a0+1.9)*r,h(1.9/TAU)+.05,Math.sin(a0+1.9)*r),j,j-min);
  }
  const continuation=K.material('#c4b4cd',{transparent:true,opacity:.14,depthWrite:false});ribbon(world,0,0,r,w,START+min*TAU-.7,START+min*TAU,t=>yFor(min)-.2+t*.2,continuation);ribbon(world,0,0,r,w,START+max*TAU,START+max*TAU+.9,t=>yFor(max)+t*.25,continuation);
  const goal=level.targetLayer??2,angle=START+Math.PI*.7;home=new THREE.Vector3(Math.cos(angle)*r,yFor(Math.min(goal,max))+.15,Math.sin(angle)*r);box(world,home.x,home.y-.14,home.z,1.6,.28,1.6,M.paving,.06);K.makeHouse(world,home);
  for(let j=min;j<=Math.min(max,level.kind==='universal'?max:level.sheets-1);j++){const p=hub(j),g=new THREE.Group();g.position.copy(p).add(new THREE.Vector3(.65,0,.45));world.add(g);cyl(g,0,.18,0,.13,.35,M.gold,16);const ast=new THREE.Mesh(new THREE.TorusGeometry(.3,.035,8,32),M.gold);ast.position.y=.6;g.add(ast);const ast2=ast.clone();ast2.rotation.y=1.15;g.add(ast2);touch(g,{letter:'a',layer:j});gates.push({g,layer:j,letter:'a'});}
  point=(from,to,letter,t)=>{const sign=letter==='a'?1:-1,wrap=level.kind!=='universal'&&to!==from+sign,move=wrap?Math.min(t/.84,1):t,a=START+sign*TAU*move,p=new THREE.Vector3(Math.cos(a)*r,yFor(from)+sign*pitch*move,Math.sin(a)*r);return wrap&&t>.84?p.lerp(hub(to),(t-.84)/.16):p;};
 }
 const actor=K.makeTraveler(world);actor.traveler.scale.setScalar(.66);
 function update(state){actor.traveler.position.copy(hub(state.layer));for(const g of gates){if(g.light)g.light.material.opacity=g.layer===state.layer?.5:.12;g.g.visible=true;if(g.dots){const dest=destination(level,{...state,layer:g.layer},g.letter);g.dots.forEach((dot,i)=>dot.visible=i<=dest);}}for(const seal of seals)seal.g.scale.setScalar(seal.index<state.seals?.65:1);}
 K.fitWorld();K.setZoom(level.scene==='courts'?.08:.20);
 return {actor,hub,home,point,hit,gates,update,onAction};
}
