export const mod=(x,n)=>(x%n+n)%n;
export const element=g=>g.m?`r^${g.k}s`:`r^${g.k}`;
export const groupLabel=g=>g.k===0?(g.m?'s':'e'):`r${g.k===1?'':`^${g.k}`}${g.m?'s':''}`;
export const product=(g,h,n)=>({k:mod(g.k+(g.m?-1:1)*h.k,n),m:g.m^h.m});
export const image=(g,x,n)=>mod(g.k+(g.m?-1:1)*x,n);
export const elements=n=>Array.from({length:2*n},(_,i)=>({k:i%n,m:Math.floor(i/n)}));
export const mirrorView=g=>mod(g.k,4);
export const syndrome=bits=>bits.slice(0,7).reduce((s,v,i)=>v?s^(i+1):s,0);
export const parity=bits=>bits.reduce((s,v)=>s^v,0);
export const distance=(a,b)=>a.reduce((s,v,i)=>s+(v!==b[i]),0);
export function encode(message,extended=false){const b=[0,0,message[0],0,message[1],message[2],message[3]];for(const p of [1,2,4])b[p-1]=b.reduce((s,v,i)=>(i+1)&p?s^v:s,0);if(extended)b.push(parity(b));return b;}
export const validCode=b=>syndrome(b)===0&&(b.length===7||parity(b)===0);
export const codebook=(extended=false)=>Array.from({length:16},(_,i)=>encode([3,2,1,0].map(b=>(i>>b)&1),extended));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function received(L,phase=0){if(L.received)return [...L.received];const second=L.task==='relay'&&phase===1,b=encode(second?L.relayMessage:L.message,L.bits===8);for(const i of (second?L.relayErrors:L.errors)||[])b[i]^=1;return b;}
function initialBits(L){if(['encode','capstone'].includes(L.task)){const b=encode(L.message,L.bits===8);for(const i of L.editable)b[i]^=1;return b;}const b=received(L);for(const i of L.erasures||[])b[i]=0;return b;}
export function initialExpansion(L){return L.chapter===3?{k:0,m:0,raw:[],marks:[],visited:['r^0'],phase:0,energy:0,samples:[]}:{bits:initialBits(L),touched:[],marks:[],phase:0,energy:0,samples:[]};}
const setEqual=(a,b)=>a.length===b.length&&a.every(x=>b.includes(x));
export function evaluation(L,s){
 let pass=false;
 if(L.chapter===3){
 const word=s.raw.join(''),want=f=>elements(L.n).filter(f).map(element),stabilizer=want(g=>image(g,0,L.n)===0);
 if(s.phase===1){pass=word===({order:'sr',normal:'srs',nonnormal:'rsR',quotient:'rsRs'})[L.task];}
 else switch(L.task){
 case 'relations':pass=word==='rrrrss';break;
 case 'order':pass=word==='rs';break;
 case 'stabilizer':pass=setEqual(s.marks,stabilizer)&&new Set(s.visited.map(key=>+key.match(/\d+/)[0])).size===L.n;break;
 case 'cosets':pass=s.marks.length===4&&new Set(s.marks.map(key=>+key.match(/\d+/)[0])).size===4&&s.marks.filter(key=>key.endsWith('s')).length===2;break;
 case 'normal':pass=setEqual(s.marks,want(g=>!g.m));break;
 case 'nonnormal':pass=setEqual(s.marks,stabilizer);break;
 case 'kernel':pass=setEqual(s.marks,want(g=>g.k%2===0))&&s.visited.length===8;break;
 case 'quotient':pass=s.marks.length===4&&new Set(s.marks.map(key=>`${+key.match(/\d+/)[0]%2}:${+key.endsWith('s')}`)).size===4;break;
 }
 if(L.exhaustive&&s.phase===0&&s.visited.length!==2*L.n)pass=false;
 }else{
 const b=s.bits,ok=validCode(b),d=distance(b,received(L,s.phase));
 switch(L.task){
 case 'encode':case 'erasures':pass=ok&&same(b,encode(L.message,L.bits===8));break;
 case 'correct':case 'extended':case 'relay':pass=ok&&d===1;break;
 case 'distance':pass=ok&&b.filter(Boolean).length===3;break;
 case 'ambiguity':pass=s.marks.length===2&&s.marks[0]!==s.marks[1]&&s.marks.every(v=>validCode([...v].map(Number))&&distance([...v].map(Number),L.received)===2);break;
 case 'capstone':pass=s.phase===0?ok&&same(b,encode(L.message,true)):ok&&d===1;break;
 }
 }
 return {pass,final:pass&&(!(L.twoStage||L.task==='order')||s.phase===1),detail:pass?'结构与证据均已验证。':'证据尚不完整。检查目标、封存记录与行动预算。'};
}
export const editable=(L,s)=>L.chapter===4?L.task==='capstone'&&s.phase===1||!L.editable?Array.from({length:L.bits},(_,i)=>i):L.editable:[];
export const bitView=i=>i===7?3:Math.log2((i+1)&-(i+1));
export function stepExpansion(L,s,action){
 const x=structuredClone(s),[method,arg]=action;

 if(method==='test'){
  const e=evaluation(L,s);if(!e.pass||e.final)return null;
  x.samples.push(L.chapter===3?{k:s.k,m:s.m,marks:[...s.marks],raw:[...s.raw]}:[...s.bits]);x.phase=1;x.energy=0;
  if(L.chapter===3){x.k=0;x.m=0;x.raw=[];x.marks=[];x.visited=['r^0'];}else{x.bits=received(L,1);x.touched=[];}
  return x;
 }
 if(L.chapter===3){
 if(['r','R','s'].includes(method)){
  if(x.energy>=L.budget)return null;const g=product(s,{k:method==='s'?0:method==='r'?1:-1,m:method==='s'?1:0},L.n);Object.assign(x,g);x.energy++;x.raw.push(method);x.visited=[...new Set([...s.visited,element(g)])];return x;
 }
 if(method==='mark'){const key=element(s);x.marks=x.marks.includes(key)?x.marks.filter(g=>g!==key):[...x.marks,key];return x;}
 }else{
 if(method==='bit'&&editable(L,s).includes(arg)&&x.energy<(L.task==='capstone'&&s.phase===1?1:L.budget)){x.bits[arg]^=1;x.energy++;x.touched=[...new Set([...x.touched,arg])];return x;}
 if(method==='mark'&&L.task==='ambiguity'&&validCode(s.bits)&&distance(s.bits,L.received)===2){const key=s.bits.join('');x.marks=x.marks.includes(key)?x.marks.filter(v=>v!==key):x.marks.length<2?[...x.marks,key]:x.marks;return same(x,s)?null:x;}
 if(method==='received'&&L.task==='ambiguity'){x.bits=received(L);x.energy=0;x.touched=[];return x;}
 }
 return null;
}
export function replayExpansion(L,actions){if(!Array.isArray(actions)||actions.length>160)return null;let state=initialExpansion(L);for(const action of actions){if(!Array.isArray(action)||action.length>2)return null;state=stepExpansion(L,state,action);if(!state)return null;}return state;}
