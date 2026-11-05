import * as THREE from 'three';
import { BASE_AZIMUTH,CAMERA_SLOPE } from './spatial.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export function makeStage(container){
 const scene=new THREE.Scene();
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.domElement.setAttribute('aria-label','三维数学关卡，桥梁、平台与机关均可操作');container.append(renderer.domElement);
 const camera=new THREE.OrthographicCamera(-9,9,6,-6,.1,120);let azimuth=BASE_AZIMUTH,elevation=Math.atan(CAMERA_SLOPE),zoom=1.1,cameraTween=null,orbiting=false,overhead=false;const target=new THREE.Vector3(0,2.8,0);let radius=7,sceneHeight=8,dirty=true,viewportWidth=1,viewportHeight=1;
 const world=new THREE.Group();scene.add(world);
 scene.add(new THREE.HemisphereLight('#ffece9','#6b567f',2.3));
 const sun=new THREE.DirectionalLight('#ffebd1',3.2);sun.position.set(-6,13,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
 Object.assign(sun.shadow.camera,{left:-11,right:11,top:11,bottom:-11,near:.5,far:40});sun.shadow.normalBias=.035;sun.shadow.bias=-.00015;sun.shadow.radius=7;sun.shadow.blurSamples=12;scene.add(sun);
 const fill=new THREE.DirectionalLight('#b5b4d8',1.3);fill.position.set(7,7,-8);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({opacity:.24}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.position.y=-.04;scene.add(floor);
  const loader = new THREE.TextureLoader();
  const texturedMaterials=[];
  const stoneTexture = new THREE.Texture(new ImageData(new Uint8ClampedArray([255,255,255,255]),1,1));stoneTexture.needsUpdate=true;
  loader.load('/assets/limestone.png',loaded=>{stoneTexture.image=loaded.image;stoneTexture.needsUpdate=true;loaded.dispose();dirty=true;});
  stoneTexture.colorSpace=THREE.SRGBColorSpace;
  stoneTexture.wrapS=stoneTexture.wrapT=THREE.RepeatWrapping;
  stoneTexture.repeat.set(.8,.8);stoneTexture.anisotropy=4;
  const material = (color, opts={}) => new THREE.MeshStandardMaterial({ color, roughness:.88, ...opts });
  const stone = material('#bfa6b8',{bumpScale:.025});
  const lilac = material('#9d82b0',{bumpScale:.025});
  const paving = material('#d0b7c4',{bumpScale:.018});
  const trim = material('#e5cfc8',{});
  const cream = material('#ead9c6',{bumpScale:.02});
  texturedMaterials.push(stone,lilac,paving,trim,cream);

  for(const m of texturedMaterials){m.map=stoneTexture;m.bumpMap=stoneTexture;}
  const teal = material('#477c79',{roughness:.78});
  const tealEdge=material('#517f7c');
  const gold=material('#d99f3e',{metalness:.55,roughness:.33});
  const goldEdge=material('#f4cd75',{metalness:.4,roughness:.3});
  const doorLight = material('#ffd37d',{emissive:'#ffb64d',emissiveIntensity:1.2});
  const dark = material('#694f44');
  const jacket=material('#b58231'); const hat=material('#e5ae47');
  const skin=material('#d5b68b'); const boots=material('#614a38');
  const geometries = new Map();
  function box(parent,x,y,z,w,h,d,mat=stone,r=.055) {
    const key=[w,h,d,r].join(',');
    if (!geometries.has(key)) geometries.set(key,new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)));
    const mesh = new THREE.Mesh(geometries.get(key),mat);
    mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function cyl(parent,x,y,z,r,h,mat,segments=64,rt=r) {
    const geo=new THREE.CylinderGeometry(rt,r,h,segments,1);const m=new THREE.Mesh(geo,mat);
    m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  function sphere(parent,x,y,z,r,mat,sx=1,sy=1,sz=1) {
    const m=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;parent.add(m);return m;
  }
  function archShape(w,h,r) {
    const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-r);
    s.absarc(0,h-r,r,0,Math.PI,false);s.lineTo(-w/2,0);return s;
  }
  function archMesh(parent,x,y,z,w,h,depth,mat) {
    const shape=archShape(w,h,w/2);
    const geometry = new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:2,curveSegments:24});
    const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }

 function makeHouse(parent,position){
 const house=new THREE.Group();house.position.copy(position);house.rotation.y=.2;house.scale.setScalar(.76);parent.add(house);
  box(house,-.515,.70,0,.28,1.4,1.28,cream,.04);
  box(house,.515,.70,0,.28,1.4,1.28,cream,.04);
  box(house,0,.70,-.52,1.25,1.4,.24,cream,.04);
  // Front wall is extruded around a doorway hole.
  const frontShape=new THREE.Shape();frontShape.moveTo(-.65,0);frontShape.lineTo(.65,0);frontShape.lineTo(.65,1.4);frontShape.lineTo(0,2.01);frontShape.lineTo(-.65,1.4);frontShape.closePath();
  const hole=new THREE.Path();hole.moveTo(-.245,0);hole.lineTo(-.245,.66);hole.absarc(0,.66,.245,Math.PI,0,true);hole.lineTo(.245,0);hole.closePath();frontShape.holes.push(hole);
  const facade=new THREE.Mesh(new THREE.ExtrudeGeometry(frontShape,{depth:.16,bevelEnabled:true,bevelSize:.018,bevelThickness:.012,bevelSegments:2,curveSegments:32}),cream);
  facade.position.z=.48;facade.castShadow=true;facade.receiveShadow=true;house.add(facade);
  // Gable rear.
  const gable=new THREE.Shape();gable.moveTo(-.65,1.35);gable.lineTo(.65,1.35);gable.lineTo(0,2.01);gable.closePath();
  const backGable=new THREE.Mesh(new THREE.ExtrudeGeometry(gable,{depth:.12,bevelEnabled:false}),cream);backGable.position.z=-.64;house.add(backGable);
  archMesh(house,0,.02,.49,.43,.87,.02,doorLight);
  // Arch moulding made with a real swept tube and two jambs.
  const arcPts=[];for(let i=0;i<=32;i++){const a=i/32*Math.PI;arcPts.push(new THREE.Vector3(Math.cos(a)*.29,.66+Math.sin(a)*.29,.675));}
  const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arcPts),32,.055,10,false),gold);house.add(tube);
  for(const x of [-.29,.29])box(house,x,.34,.675,.11,.68,.1,gold,.016);
  box(house,0,.02,.77,.60,.045,.33,trim,.015);
  // Circular gable detail.
  const vent=cyl(house,0,1.27,.66,.065,.027,stone,32);vent.rotation.x=Math.PI/2;
  // Tiled gabled roof. Each tile is a subtly bevelled physical ceramic slab.
  const slope=Math.atan2(.70,.79), slopeLen=Math.hypot(.70,.79);
  for(const side of [-1,1]){
    const roof=box(house,side*.395,1.72,0,slopeLen,.095,1.65,teal,.04);roof.rotation.z=-side*slope;
    for(let row=0;row<4;row++)for(let col=0;col<5;col++){
      const t=(row+.5)/4;
      const tile=box(house,side*(.79*t),2.14-.70*t,col*.32-.64,slopeLen/4+.04,.065,.305, row%2===0?teal:tealEdge,.025);
      tile.rotation.z=-side*slope;
    }
  }
  for(let j=0;j<6;j++){
    const ridge=cyl(house,0,2.095,-.72+j*.285,.075,.30,teal,12);ridge.rotation.x=Math.PI/2;
  }
  box(house,.37,1.96,-.42,.25,.76,.26,cream,.025);
  box(house,.37,2.34,-.42,.32,.115,.33,trim,.025);
  box(house,.37,2.406,-.42,.19,.008,.19,lilac,.01);
  // Side window with inset warm glass and a timber mullion.
  box(house,.664,.82,.06,.035,.47,.45,dark,.025);
  box(house,.687,.82,.06,.025,.37,.35,doorLight,.015);
  box(house,.707,.82,.06,.036,.42,.037,teal,.008);
  box(house,.707,.82,.06,.036,.037,.40,teal,.008);
  const glow=new THREE.PointLight('#ffc36a',1.7,3,2);glow.position.copy(position).add(new THREE.Vector3(0,.55,.85));parent.add(glow);

return house;
}
 function makeTraveler(parent){
  const traveler=new THREE.Group();parent.add(traveler);
  const body=new THREE.Group();traveler.add(body);
  const legs=[];const arms=[];
  for(const x of [-.115,.115]){
    const leg=new THREE.Group();leg.position.set(x,.34,0);body.add(leg);
    box(leg,0,-.14,0,.13,.27,.15,boots,.035);box(leg,0,-.275,.055,.15,.10,.25,boots,.035);legs.push(leg);
  }
  const coat=cyl(body,0,.55,0,.235,.48,jacket,16,.175);
  sphere(body,0,.9,.015,.17,skin,.86,1,.87);
  const collar=cyl(body,0,.77,0,.185,.08,dark,32);
  const brim=cyl(body,0,1.04,0,.34,.055,hat,48);
  const crown=cyl(body,0,1.115,0,.215,.15,hat,40,.17);
  cyl(body,0,1.045,0,.215,.045,jacket,40,.215);
  box(body,0,.58,-.225,.34,.36,.19,dark,.065);
  box(body,0,.59,-.33,.25,.23,.065,jacket,.025);
  box(body,0,.73,-.34,.07,.11,.025,gold,.01);
  for(const side of [-1,1]){
    const arm=new THREE.Group();arm.position.set(side*.22,.73,0);body.add(arm);
    const sleeve=cyl(arm,0,-.14,0,.075,.29,jacket,16,.085);sleeve.rotation.z=side*.12;
    sphere(arm,side*.02,-.30,0,.065,skin);arms.push(arm);
  }
  traveler.scale.setScalar(.78);

return {traveler,body,legs,arms};
}

 function placeCamera(){camera.position.copy(target).add(new THREE.Vector3(Math.sin(azimuth)*Math.cos(elevation),Math.sin(elevation),Math.cos(azimuth)*Math.cos(elevation)).multiplyScalar(32));camera.lookAt(target);camera.updateMatrixWorld();dirty=true;}
 function resize(){const w=container.clientWidth,h=container.clientHeight,aspect=w/h;viewportWidth=w;viewportHeight=h;const size=renderer.getSize(new THREE.Vector2());if(size.x!==w||size.y!==h)renderer.setSize(w,h);const folded=container.dataset.layout==='folded',usable=Math.max(230,h-(folded?120:240)),vertical=2*radius*Math.sin(elevation)+sceneHeight*Math.cos(elevation),H=Math.max(vertical*1.05*h/usable,2*radius*1.16/aspect)/zoom,shift=(folded?0:-55)/h*H;camera.left=-H*aspect/2;camera.right=H*aspect/2;camera.top=H/2+shift;camera.bottom=-H/2+shift;camera.updateProjectionMatrix();placeCamera();}
 const ro=new ResizeObserver(resize);ro.observe(container);resize();
 function fitWorld(){const bounds=new THREE.Box3().setFromObject(world),size=bounds.getSize(new THREE.Vector3());bounds.getCenter(target);radius=Math.hypot(size.x,size.z)/2;sceneHeight=size.y;resize();}
 function viewState(){const index=overhead?-1:((Math.round((azimuth-BASE_AZIMUTH)/(Math.PI/2))%4)+4)%4;return {index,overhead,busy:!!cameraTween||orbiting,angle:Math.round(THREE.MathUtils.radToDeg(azimuth)),zoom};}
 function animateView(to,up=overhead){overhead=up;cameraTween={from:azimuth,to,fromElevation:elevation,toElevation:up?1.25:Math.atan(CAMERA_SLOPE),start:performance.now()};dirty=true;}
 function turnView(delta){animateView(BASE_AZIMUTH+(Math.round(((cameraTween?.to??azimuth)-BASE_AZIMUTH)/(Math.PI/2))+delta)*Math.PI/2,false);}
 function setView(index){const current=Math.round((azimuth-BASE_AZIMUTH)/(Math.PI/2)),delta=((index-current)%4+6)%4-2;animateView(BASE_AZIMUTH+(current+delta)*Math.PI/2,false);}
 function updateCamera(now){if(!cameraTween)return false;const t=Math.min(1,(now-cameraTween.start)/600),s=t*t*(3-2*t);azimuth=THREE.MathUtils.lerp(cameraTween.from,cameraTween.to,s);elevation=THREE.MathUtils.lerp(cameraTween.fromElevation,cameraTween.toElevation,s);if(t===1)cameraTween=null;resize();return true;}
 function orbit(dx){orbiting=true;cameraTween=null;overhead=false;elevation=Math.atan(CAMERA_SLOPE);azimuth+=dx*.008;placeCamera();}
 function snapView(){orbiting=false;animateView(BASE_AZIMUTH+Math.round((azimuth-BASE_AZIMUTH)/(Math.PI/2))*Math.PI/2,false);}
 function setZoom(delta){zoom=THREE.MathUtils.clamp(zoom+delta,.7,1.8);resize();}
 function restoreView(saved){cameraTween=null;orbiting=false;azimuth=BASE_AZIMUTH+(saved?.index??0)*Math.PI/2;overhead=Boolean(saved?.overhead);elevation=overhead?1.25:Math.atan(CAMERA_SLOPE);zoom=THREE.MathUtils.clamp(saved?.zoom??1.1,.7,1.8);resize();}
 function project(p){const q=p.clone().project(camera);return {x:(q.x+1)*viewportWidth/2,y:(1-q.y)*viewportHeight/2,visible:q.z>-1&&q.z<1&&Math.abs(q.x)<1.1&&Math.abs(q.y)<1.1};}
 function aligned(a,b){if(overhead||cameraTween)return false;const direction=camera.position.clone().sub(target).normalize();return a.clone().sub(b).cross(direction).length()<.12;}
 function snapshot(){const bg=scene.background,size=renderer.getSize(new THREE.Vector2()),illustration=camera.clone(),vertical=2*radius*Math.sin(elevation)+sceneHeight*Math.cos(elevation),H=Math.max(vertical*1.05,2*radius/1.25*1.1);illustration.left=-H*.625;illustration.right=H*.625;illustration.top=H/2;illustration.bottom=-H/2;illustration.updateProjectionMatrix();scene.background=null;floor.visible=false;renderer.setClearColor(0,0);renderer.setSize(1000,800,false);renderer.render(scene,illustration);const src=renderer.domElement.toDataURL('image/png');scene.background=bg;floor.visible=true;renderer.setSize(size.x,size.y,false);renderer.render(scene,camera);return src;}
 function dispose(){ro.disconnect();scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});stoneTexture.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}
 return {scene,renderer,camera,world,project,fitWorld,viewState,updateCamera,turnView,setView,orbit,snapView,setZoom,restoreView,aligned,toggleOverhead(){const a=BASE_AZIMUTH+Math.round(((cameraTween?.to??azimuth)-BASE_AZIMUTH)/(Math.PI/2))*Math.PI/2;animateView(a,!overhead);},resetView(){zoom=1.1;setView(0);},takeDirty(){const d=dirty;dirty=false;return d;},box,cyl,sphere,material,makeHouse,makeTraveler,snapshot,dispose,materials:{stone,lilac,paving,trim,cream,teal,gold,goldEdge,doorLight}};
}
