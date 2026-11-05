import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {introCheckpoint,restoreIntro} from './storage/checkpoints.js';

const HALF = Math.PI / 2;
const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

// Everything in this scene is real geometry: the same bridge is rendered,
// rotated, raycast and crossed by the traveler.
export function createGame(container, callbacks) {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor('#35264f');
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.24;
  renderer.domElement.setAttribute('aria-label', '三维关卡：起点、可旋转桥梁和终点小屋');
  container.appendChild(renderer.domElement);
  const camera = new THREE.OrthographicCamera(-9,9,6.4,-6.4,.1,90);
  camera.position.set(22,18,8);
  camera.lookAt(0,1.3,0);
  const world = new THREE.Group(); scene.add(world);
  const hemi = new THREE.HemisphereLight('#f8e8e9','#675582',2.4); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0d7',3.8);
  sun.position.set(-5,12,4); sun.castShadow = true;
  sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.5,far:35});
  sun.shadow.normalBias=.035; sun.shadow.bias=-.00015; sun.shadow.radius=8;sun.shadow.blurSamples=12;
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#b4abd9',1.3); fill.position.set(6,5,-6);scene.add(fill);

  const loader = new THREE.TextureLoader();
  const texturedMaterials=[];
  const stoneTexture = loader.load('/assets/limestone.png',()=>{texturedMaterials.forEach(m=>{m.map=stoneTexture;m.bumpMap=stoneTexture;m.needsUpdate=true;});});
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
  // Purple studio floor catches real shadows, including moving bridge and traveler.
  scene.background=new THREE.Color('#35264f');
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.24}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-.035;floor.receiveShadow=true;scene.add(floor);

  const start=new THREE.Group();world.add(start);
  const startZ=4.12;
  // Cut stone blocks, with physical bevels and fine joints.
  function platform(parent,cx,cz,w,d,top,mat,cols=3,rows=2,thickness=top) {
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
      const bw=w/cols,bd=d/rows;
      box(parent,cx-w/2+bw*(i+.5),top-thickness/2,cz-d/2+bd*(j+.5),bw-.012,thickness,bd-.012,mat,.065);
    }
  }
  platform(start,0,startZ,1.96,1.7,.75,stone);
  // Four risers gain exactly the height of the bridge deck.
  const n=4, stepD=.31, stepH=.155;
  for(let i=0;i<n;i++){
    const top=.75+(i+1)*stepH;
    box(start,0,top/2,3.12-i*stepD,1.01,top,stepD+.018,paving,.035);
  }
  const deckTop=.75+n*stepH;
  // End of the stairs is z=2.035, bridge edge z=1.8; narrow joints complete the route.
  box(start,0,deckTop-.10,1.91,1.01,.20,.30,paving,.03);

  // Fixed circular plinth; upper walkway and brass crank rotate together.
  const base=cyl(world,0,.56,0,1.62,1.12,lilac,96);
  cyl(world,0,1.135,0,1.59,.09,paving,96);
  cyl(world,0,1.205,0,1.54,.055,lilac,96);
  // Ring of individually jointed blocks on the drum.
  for(let i=0;i<20;i++){
    const a=i*Math.PI/10;
    const block=box(world,Math.sin(a)*1.565,.60,Math.cos(a)*1.565,.49,1.07,.13,lilac,.035);
    block.rotation.y=a;
  }
  // Paving seam chords are physical narrow insets on the turntable.
  const seamMat=material('#92789f');
  for(const x of [-1.04,-.52,0,.52,1.04]){
    const len=2*Math.sqrt(1.50*1.50-x*x);
    box(world,x,1.24,0,.012,.007,len,seamMat,.002);
  }
  for(const z of [-1.04,-.52,0,.52,1.04]){
    const len=2*Math.sqrt(1.5*1.5-z*z);
    box(world,0,1.24,z,len,.007,.012,seamMat,.002);
  }
  const bridge=new THREE.Group();world.add(bridge);
  box(bridge,0,deckTop-.10,0,.86,.20,3.61,paving,.045);
  for(let i=0;i<7;i++)box(bridge,0,deckTop+.006,-1.55+i*.515,.76,.012,.495,trim,.02);
  for(const x of [-.46,.46]){
    box(bridge,x,deckTop+.09,0,.105,.23,3.66,trim,.025);
    for(const z of [-1.78,1.78])box(bridge,x,deckTop+.18,z,.16,.44,.16,cream,.03);
  }
  const crank=new THREE.Group();world.add(crank);
  crank.position.set(1.42,.66,-.86);crank.rotation.y=.54;
  const hub=cyl(crank,.02,0,0,.18,.14,gold,40);hub.rotation.z=Math.PI/2;
  const axle=cyl(crank,.29,0,0,.075,.5,goldEdge,32);axle.rotation.z=Math.PI/2;
  const cap=cyl(crank,.56,0,0,.135,.13,gold,40);cap.rotation.z=Math.PI/2;
  // Raycast target follows the moving crank; main drum is also interactive.
  const crankHit=new THREE.Mesh(new THREE.SphereGeometry(.43,16,12),new THREE.MeshBasicMaterial({visible:false}));
  crankHit.position.set(.3,0,0);crank.add(crankHit);

  const end=new THREE.Group();world.add(end);
  for(let i=0;i<4;i++){
    const top=deckTop+(i+1)*.155;
    box(end,0,top-.37,-1.94-i*.31,1.01,.74,.33,paving,.035);
  }
  const endTop=deckTop+.62;
  platform(end,0,-4.00,2.04,1.84,endTop,stone,3,2,.74);
  box(end,0,endTop-.08,-3.04,1.01,.16,.22,paving,.03);

  // Little house: actual arched opening, stone surrounds, separate roof tiles.
  const house=new THREE.Group();house.position.set(0,endTop,-4.13);house.rotation.y=.38;end.add(house);
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
  const glow=new THREE.PointLight('#ffc36a',1.7,3,2);glow.position.set(0,endTop+.55,-3.25);world.add(glow);

  // Original little explorer, fully articulated for the walking animation.
  const traveler=new THREE.Group();world.add(traveler);
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
  traveler.position.set(0,.75,4.23);traveler.rotation.y=Math.PI;

  const resumed=restoreIntro(callbacks.resume);
  let angle=resumed?.angle??HALF, targetAngle=angle, turn=null, walk=null, won=resumed?.won||false, disposed=false;
  let hint=false, paused=false, frame=0, lastTime=performance.now();
  let dragging=null, turnCount=resumed?.turns||0;
  bridge.rotation.y=angle;
  if(won){traveler.visible=false;traveler.position.set(0,endTop,-3.46);}
  const raycaster=new THREE.Raycaster();const mouse=new THREE.Vector2();
  const plane=new THREE.Plane(new THREE.Vector3(0,1,0),-deckTop);
  const point=new THREE.Vector3();
  const v3=new THREE.Vector3();
  
  const aligned=()=>Math.abs(Math.sin(targetAngle))<.01;
  function notify(){ callbacks.onState({aligned:aligned(),turning:!!turn,walking:!!walk,won,turns:turnCount,degrees:Math.round(Math.acos(Math.cos(targetAngle-HALF))*180/Math.PI)});if(!turn&&!walk&&!dragging&&!handleDrag)callbacks.onCheckpoint?.(introCheckpoint(targetAngle,turnCount,won)); }
  let audio;let handleDrag=null;let pausedAt=0;
  function chime(success=false) {
    try{
      audio??=new (window.AudioContext||window.webkitAudioContext)();
      if(audio.state==='suspended')audio.resume();
      const now=audio.currentTime;
      (success?[523.25,659.25,783.99]:[aligned()?523.25:392]).forEach((f,i)=>{
        const osc=audio.createOscillator(), gain=audio.createGain();
        osc.type='sine';osc.frequency.value=f;
        gain.gain.setValueAtTime(0,now+i*.09);gain.gain.linearRampToValueAtTime(.045,now+i*.09+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.09+.65);
        osc.connect(gain);gain.connect(audio.destination);osc.start(now+i*.09);osc.stop(now+i*.09+.7);
      });
    }catch{ /* Sound is optional; movement never depends on audio support. */ }
  }
  function rotate(delta=-HALF){
    if(turn||walk||won||paused)return;
    targetAngle=Math.round((angle+delta)/HALF)*HALF;
    turn={from:angle,to:targetAngle,start:performance.now(),duration:750};turnCount++;notify();
  }
  function walkToHouse(){
    if(!aligned()||turn||walk||won||paused)return;
    walk={start:performance.now(),duration:6200};notify();chime(true);
  }
  function reset(){
    angle=HALF;targetAngle=HALF;turn=null;walk=null;won=false;turnCount=0;hint=false;dragging=null;handleDrag=null;
    bridge.rotation.y=angle;traveler.position.set(0,.75,4.23);traveler.rotation.y=Math.PI;traveler.visible=true;traveler.scale.setScalar(1);
    legs.forEach(l=>l.rotation.x=0);arms.forEach(a=>a.rotation.x=0);notify();
  }
  function getRay(event){
    const rect=renderer.domElement.getBoundingClientRect();
    mouse.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(mouse,camera);
  }
  function down(event){
    if(event.button!==0||paused||won||walk||turn)return;
    getRay(event);
    const hit=raycaster.intersectObjects([base,bridge,crank],true);
    if(hit.length){
      raycaster.ray.intersectPlane(plane,point);
      dragging={x:event.clientX,y:event.clientY,startAngle:angle,polar:Math.atan2(point.x,point.z),moved:false};
      renderer.domElement.setPointerCapture(event.pointerId);container.classList.add('dragging');
    }else if(raycaster.intersectObject(house,true).length){walkToHouse();}
  }
  function move(event){
    if(dragging){
      getRay(event);raycaster.ray.intersectPlane(plane,point);
      let delta=Math.atan2(point.x,point.z)-dragging.polar;
      if(delta>Math.PI)delta-=Math.PI*2;if(delta<-Math.PI)delta+=Math.PI*2;
      if(Math.hypot(event.clientX-dragging.x,event.clientY-dragging.y)>4)dragging.moved=true;
      angle=dragging.startAngle+delta;bridge.rotation.y=angle;
    }else{
      getRay(event);
      const bridgeHover=raycaster.intersectObjects([base,bridge,crank],true).length>0;
      const houseHover=aligned()&&raycaster.intersectObject(house,true).length>0;
      renderer.domElement.style.cursor=paused?'default':bridgeHover?'grab':houseHover?'pointer':'default';
    }
  }
  function up(){
    if(!dragging)return;const moved=dragging.moved;dragging=null;container.classList.remove('dragging');
    if(moved){
      targetAngle=Math.round(angle/HALF)*HALF;
      turn={from:angle,to:targetAngle,start:performance.now(),duration:350};turnCount++;notify();
    }else rotate();
  }
  const canvas=renderer.domElement;
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
  function project(x,y,z){v3.set(x,y,z).project(camera);return {x:(v3.x+1)*container.clientWidth/2,y:(1-v3.y)*container.clientHeight/2};}
  function resize(){
    const w=container.clientWidth,h=container.clientHeight;
    renderer.setSize(w,h);
    const aspect=w/h;const height=Math.max(11.8,12.8/aspect);
    camera.left=-height*aspect/2;camera.right=height*aspect/2;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);resize();
  function update(now){
    if(disposed)return;
    frame=requestAnimationFrame(update);
    const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;
    if(turn&&!paused){
      const t=Math.min(1,(now-turn.start)/turn.duration);
      angle=THREE.MathUtils.lerp(turn.from,turn.to,ease(t));bridge.rotation.y=angle;
      if(t>=1){angle=targetAngle;turn=null;chime();notify();}
    }
    if(walk&&!paused){
      const t=Math.min(1,(now-walk.start)/walk.duration);
      const z=THREE.MathUtils.lerp(4.23,-3.46,t);
      let y=.75;
      if(z<3.32&&z>1.8)y=.75+(3.32-z)/1.52*(deckTop-.75);
      else if(z<=1.8&&z>=-1.8)y=deckTop;
      else if(z<-1.8)y=deckTop+Math.min(1,(-z-1.8)/1.3)*.62;
      traveler.position.set(0,y+Math.sin(t*46)*.025,z);
      legs[0].rotation.x=Math.sin(t*46)*.45;legs[1].rotation.x=-Math.sin(t*46)*.45;
      arms[0].rotation.x=-Math.sin(t*46)*.24;arms[1].rotation.x=Math.sin(t*46)*.24;
      if(t>.93)traveler.scale.setScalar(1-(t-.93)/.07*.9);
      if(t>=1){walk=null;won=true;traveler.visible=false;notify();chime(true);}
    }else if(!won&&!paused){body.position.y=Math.sin(now*.002)*.012;}
    // Screen-space control follows the crank, including while the bridge turns.
    const crankWorld=new THREE.Vector3(2.01,.66,-1.21);
    callbacks.onProject({handle:project(crankWorld.x,crankWorld.y,crankWorld.z),label:project(1.35,.05,.40),house:project(0,endTop+.7,-3.5)});
    renderer.render(scene,camera);
  }
  notify();frame=requestAnimationFrame(update);
  return {
    rotate,walk:walkToHouse,reset,
    beginHandleDrag(x,y){if(turn||walk||won||paused)return;handleDrag={x,y,angle};},
    moveHandleDrag(x,y){if(!handleDrag)return;angle=handleDrag.angle+((x-handleDrag.x)-(y-handleDrag.y))*.012;bridge.rotation.y=angle;},
    endHandleDrag(x,y){if(!handleDrag)return;const distance=Math.hypot(x-handleDrag.x,y-handleDrag.y);handleDrag=null;if(distance<8){rotate();return;}targetAngle=Math.round(angle/HALF)*HALF;turn={from:angle,to:targetAngle,start:performance.now(),duration:350};turnCount++;notify();},
    setHint(value){hint=value;},
    pause(value){if(value&&!paused){pausedAt=performance.now();}else if(!value&&paused){const elapsed=performance.now()-pausedAt;if(turn)turn.start+=elapsed;if(walk)walk.start+=elapsed;}paused=value;},
    dispose(){disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);
      scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});
      stoneTexture.dispose();renderer.dispose();audio?.close();container.removeChild(canvas);
    }
  };
}
