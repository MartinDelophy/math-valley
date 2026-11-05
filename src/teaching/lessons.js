import {expansionLessons} from '../expansion/lessons.js';
// Small, independent examples run in the same engines as the actual chapters.
// Their states never enter the journey's progress or current puzzle state.
export const lessonStorageKey='math-valley-lessons-v1';
export function lessonFor(level,phase=0,interaction='flow'){
 if(!level)return 'rotation';
 if(level.chapter>=3)return level.chapter===3?'symmetry':'coding';
 if(level.chapter===2){
  if(level.construct&&phase===0)return 'seams';
  if(level.evidence&&phase>0)return level.evidence;
  return level.kind==='universal'?'universal':level.kind==='free'?'words':'cover';
 }
 const mode=level.phases?.[phase]?.mode||level.mode;
 if(mode==='flowcut')return interaction==='cut'?'cut':'flow';
 return ({spatial:'spatial',mst:'bridges',repair:'bridges',tree:'bridges',cut:'edgecut',paths:'routes',vertex:'vertex',capacitycut:'cut',residualcut:'residualcut',flow:'flow',residual:'residual'})[mode];
}
export function readLessons(storage){try{const saved=JSON.parse(storage.getItem(lessonStorageKey)||'{}');return Object.fromEntries(Object.entries(saved).filter(([key,value])=>Object.hasOwn(LESSONS,key)&&['completed','skipped'].includes(value)));}catch{return {};}}
const n=(id,x,z,y=1.2)=>({id,x,z,y});
const edge=(u,v,more={})=>({id:u+v,u,v,...more});
const graph={id:'lesson',s:'S',t:'T',mode:'tree',nodes:[n('S',-3,2),n('A',0,-1,3),n('T',3,2,3)],edges:[],principles:[]};
const triangle={...graph,edges:[edge('S','A',{control:true}),edge('A','T',{control:true,on:false}),edge('S','T',{control:true,on:false})]};
const diamond={...graph,mode:'paths',nodes:[n('S',0,3),n('A',-3,0,3),n('B',3,0,3),n('T',0,-3,4.6)],edges:[edge('S','A'),edge('A','T'),edge('S','B'),edge('B','T')],target:2};
const bottleneck={...graph,mode:'vertex',nodes:[n('S',0,4),n('A',-3,1),n('B',3,1),n('X',0,-1,3),n('T',0,-4,4.6)],edges:[edge('S','A'),edge('S','B'),edge('A','X'),edge('B','X'),edge('X','T')]};
const directed={...graph,mode:'flow',target:1,edges:[edge('S','A',{cap:2,directed:true}),edge('A','T',{cap:2,directed:true})]};
const residual={...diamond,mode:'residual',target:2,edges:[edge('S','A',{cap:1,directed:true}),edge('S','B',{cap:1,directed:true}),edge('A','B',{cap:1,directed:true}),edge('A','T',{cap:1,directed:true}),edge('B','T',{cap:1,directed:true})],initialFlow:{SA:1,AB:1,BT:1}};
const spatial={...graph,mode:'spatial',nodes:[n('S',-3,3),n('A',0,2,3),n('B',Math.SQRT2*2,2+Math.SQRT2*2,5.4),n('T',3,-2,5.4)],edges:[edge('S','A'),edge('A','B',{portal:true,view:1,requires:['A']}),edge('B','T')],seals:['A'],energyLimit:8};
spatial.nodes[1].rune=true;
const topology={id:'lesson',chapter:2,mode:'topology',nodes:[],edges:[],kind:'circle',scene:'moon',sheets:2,start:0,actions:['a','A'],checkpoints:[],budget:6,targetWord:'a'};
const at=(method,args,label,copy,done)=>({method,args,label,copy,done});
const node=(id,copy,done)=>at('node',[id],`点击平台 ${id}`,copy,done);
const loop=(letter,copy,count)=>at('loop',[letter],letter===letter.toLowerCase()?`沿 ${letter} 正向绕行`:`沿 ${letter.toLowerCase()} 反向绕行`,copy,g=>g.raw?.length===count);
const test=(copy,done=g=>g.won)=>at('test',[],'检验这个小例子',copy,done);
export const LESSONS={
 ...expansionLessons,
 rotation:{title:'先看一次，再亲手试试',engine:'intro',principle:'旋转保持长度与形状，只改变方向；两端接通后，旅人才能通过。',steps:[
  at('rotate',[-Math.PI/2],'旋转桥梁90度','观察金色机关：转过一个直角，让桥梁两端对准台阶。',g=>g.aligned),
  at('walk',[],'走过桥梁','接通之后再行走。场景中的小屋，就是这次旅程的终点。',g=>g.won)]},
 spatial:{title:'视角、印记与穿越',engine:'chapter',level:spatial,principle:'只有标记过的穿越门会在指定视角接通；普通桥梁不会因为投影重合而相连。',steps:[
  node('A','先走到相邻平台 A，取得门所需的印记。',g=>g.position==='A'),
  at('setView',[1],'切换到Ⅱ侧','相机转到Ⅱ侧，观察两个门环。正式关卡也可以用 Q / E 或拖动空白处转动视角。',g=>g.view===1),
  at('enterPortal',['AB'],'进入穿越门','人在门边、印记齐全、视角正确，才能沿门的特殊连接抵达高层。',g=>g.position==='B'),
  node('T','最后沿实体通路抵达小屋。视角切换不消耗能量，行走与穿越会消耗。',g=>g.won)]},
 bridges:{title:'连接改变了什么',engine:'chapter',level:triangle,principle:'生成树必须连通且无环；正式关卡还会要求最小代价或故障后的备用通路。',steps:[
  at('edge',['AT'],'接通 A—T','点击金色机关接通桥梁，三座平台现在属于同一个连通分量。',g=>g.active?.AT),
  test('先检查整体结构，再提交。这个三顶点例子用两条边连通且不成环。')]},
 edgecut:{title:'用断路给出上界',engine:'chapter',level:{...triangle,mode:'cut',edges:triangle.edges.map(e=>({...e,on:true}))},principle:'边割必须截断所有 S 到 T 的路；只移除你看到的一条路线并不充分。',steps:[
  at('edge',['ST'],'收起 S—T','先收起直达桥，但 S—A—T 仍然提供绕行。',g=>!g.active?.ST),
  at('edge',['AT'],'收起 A—T','再截断另一条路。与已构造的两条边不交路线比较，得到匹配的上下界。',g=>!g.active?.AT),
  test('提交最小边割的证据，而不是只看旅人所在的位置。')]},
 routes:{title:'把路线完整地记录下来',engine:'chapter',level:diamond,principle:'一条证据必须从 S 连续走到 T；边不交限制共享桥，内部点不交还限制共享中间平台。',steps:[
  node('A','路线从 S 开始，依次点击相邻平台。',g=>g.draft?.at(-1)==='A'),
  node('T','点击 T 才会保存一条完整路线。随后可以从 S 构造下一条。',g=>g.paths?.length===1),
  node('B','第二条路线走另一侧。点错时可以使用左下角的“撤一步”。',g=>g.draft?.at(-1)==='B'),
  node('T','现在两条路线没有共享任何桥梁。',g=>g.paths?.length===2),
  test('记录完路线之后，提交证据。正式关卡可能还要独立构造割。')]},
 vertex:{title:'封闭平台，而不是桥',engine:'chapter',level:bottleneck,principle:'点割移除中间顶点及其相接的边；起点 S 和终点 T 不能用来充当中庭瓶颈。',steps:[
  node('X','两条下层路线都必须经过 X。点击中庭会封闭平台和相接通路。',g=>g.blocked?.includes('X')),
  test('验证所有绕行都已被截断，而不只是封住一条可见的路。')]},
 cut:{title:'划分源侧，累计割容量',engine:'chapter',level:{...directed,mode:'capacitycut',edges:[...directed.edges,edge('S','T',{cap:1,directed:true})]},principle:'割容量只累计从源侧流向汇侧的有向边；方向相反的边不计入。',steps:[
  node('A','S 固定在源侧、T 固定在汇侧。点击 A 把它划入源侧：边界上有 A→T 和 S→T。',g=>g.side?.includes('A')),
  test('边界容量为 2 + 1 = 3。提交的是平台划分，系统会累计所有跨界有向边。')]},
 residualcut:{title:'沿残量寻找可达侧',engine:'chapter',level:{...directed,mode:'residualcut',target:2,initialFlow:{SA:2,AT:2},edges:[edge('S','A',{cap:3,directed:true}),edge('A','T',{cap:2,directed:true})]},principle:'残量可达侧要同时考虑尚未用满的正向边和能够撤回旧流的反向边。',steps:[
  node('A','S→A 还剩一单位正向残量，A→T 已满。将能从 S 残量到达的 A 划入源侧。',g=>g.side?.includes('A')),
  test('这个例子只演示如何标记可达集合。正式关卡要检查所有正向和反向残量。')]},
 flow:{title:'流量必须在中庭守恒',engine:'chapter',level:directed,principle:'每条有向桥满足 0 ≤ f ≤ c；中间平台的流入总量必须等于流出总量。',steps:[
  at('edge',['SA'],'选中 S→A','先点击桥梁选中闸门，手札中的加减按钮才会调节这座桥。',g=>g.selected==='SA'),
  at('adjust',[1],'选中闸门增加1','给 S→A 增加一单位。此时 A 只流入、不流出，还不是可行流。',g=>g.flow?.SA===1),
  at('edge',['AT'],'选中 A→T','换到 A→T，观察选中边的起点与终点。',g=>g.selected==='AT'),
  at('adjust',[1],'选中闸门增加1','让 A 流出一单位，补齐守恒。数值显示为当前流量 / 容量。',g=>g.flow?.AT===1),
  test('保持每座中庭守恒，再检验送达 T 的整体流量。')]},
 residual:{title:'撤回一段旧流',engine:'chapter',level:residual,principle:'残量反向边表示减少原边的旧流，不是凭空新增一座永久的反向桥。',steps:[
  node('B','旧流沿 S→A→B→T 占用中桥。先从 S 沿尚有容量的 S→B 开始。',g=>g.draft?.at(-1)==='B'),
  node('A','接着走 B→A：这是撤回原来 A→B 的一单位流量。',g=>g.draft?.at(-1)==='A'),
  node('T','最后走 A→T，整条增广路把旧流重排为两条通路。',g=>g.flowStatus?.value===2),
  test('增广后仍须满足守恒。反向撤回是完整增广路的一部分。')]},
 cover:{title:'绕数与所在层要分开看',engine:'topology',level:topology,principle:'有限覆盖中的层号只记录绕数的余数；回到原层并不等于路径可缩。',steps:[
  loop('a','沿 a 绕一圈，观察旅人从Ⅰ层来到Ⅱ层。完整绕数变为 1。',1),
  loop('A','沿 a 的逆向返回，绕数减一，撤回刚才的路径。',2),
  loop('a','再正向绕行，获得与参考 a 相同的同伦类。',3),
  test('先看完整路径，再提交。正式关卡还要按顺序访问见证点。')]},
 words:{title:'回廊的先后也是信息',engine:'topology',level:{...topology,kind:'free',scene:'courts',sheets:3,actions:['a','A','b','B'],targetWord:'ab'},principle:'双孔骨架上，a·b 与 b·a 一般不同；逐孔统计绕数会丢失路径顺序。',steps:[
  loop('a','青廊记为 a，反向记为 a⁻¹。先走青廊，记录第一段。',1),
  loop('b','再走金廊 b，得到 a·b。相机只帮助观察，不改变门的对应。',2),
  test('比较完整约化词与参考路径；终点相同本身不足以证明同伦。')]},
 universal:{title:'把圆周展开',engine:'topology',level:{...topology,kind:'universal',scene:'helix',range:[-1,2],targetWord:undefined,targetLayer:1},principle:'圆的万有覆盖不对层号取余；每完整绕行一次，整数高度增加或减少一。',steps:[
  loop('A','先反向绕行，观察高度从 0 变为 −1。',1),
  loop('a','正向返回 0，再比较同一投影下的不同高度。',2),
  loop('a','继续绕行到 +1。这是展开空间中的另一处原像。',3),
  test('场景的可见边缘只是观察窗口，不是整个覆盖空间的边界。')]},
 reduction:{title:'为同伦补上消去证据',engine:'topology',level:{...topology,kind:'free',scene:'courts',sheets:3,actions:['a','A','b','B'],evidence:'reduction',minCancellations:1},principle:'在这里的双孔骨架上，只能连续消去相邻的互逆片段；不能跨过中间路径直接抵消。',steps:[
  loop('b','先走金廊，构造一个可以撤回的往返。',1),loop('B','沿同一回廊返回：b·b⁻¹ 是相邻逆路径。',2),loop('a','再接上 a，得到 b·b⁻¹·a。',3),
  test('先提交行走证据，再进入独立的证明阶段。',g=>g.phase===1),
  at('cancelPair',[0],'消去相邻逆路径','在正式手札中先选择第一段和下一段，再点击消去；这里消去 b·b⁻¹。',g=>g.proof?.join('')==='a'),
  test('留下 a 后，再提交同伦证据，完成第二次验证。')]},
 classification:{title:'闭合不等于可缩',engine:'topology',level:{...topology,targetWord:undefined,targetLayer:0,requireNontrivial:true,evidence:'classification'},principle:'二重覆盖中绕两圈会回到原层，但在穿孔基空间中绕数为 2，仍不能缩回基点。',steps:[
  loop('a','第一圈从Ⅰ层到Ⅱ层。',1),loop('a','第二圈回到Ⅰ层，但完整绕数已经是 2。',2),
  test('提交行走证据后，需要独立判断基空间中的路径。',g=>g.phase===1),
  at('choose',['nontrivial'],'仍然不可缩','选择“仍然不可缩”：覆盖中的闭合提升不保证原路径可缩。',g=>g.choice==='nontrivial'),
  test('用完整绕数支持判断，而不是只凭旅人回到了哪一层。')]},
 seams:{title:'每扇门必须有唯一去处',engine:'topology',level:{...topology,kind:'free',scene:'courts',sheets:3,actions:['a','A','b','B'],construct:true,targetPermutation:[1,0,2],targetWord:undefined,targetLayer:1},principle:'层的配对必须为双射，才能保证正向与反向提升都唯一；正式关卡要根据实验记录推断配对。',steps:[
  at('cycleSeam',[0],'修改Ⅰ层配对','这个小例子给定金廊配对 Ⅰ↔Ⅱ、Ⅲ不变。先将Ⅰ层出口改到Ⅱ层。',g=>g.seam?.[0]===1),
  at('cycleSeam',[1],'修改Ⅱ层配对','Ⅱ层出口每点击一次，按Ⅰ、Ⅱ、Ⅲ循环改变。',g=>g.seam?.[1]===2),
  at('cycleSeam',[1],'再次修改Ⅱ层配对','再点一次，将Ⅱ层出口改到Ⅰ层，现在每层都恰有一个原像。',g=>g.seam?.[1]===0),
  test('先检验配对，再用复原后的覆盖进行实际行走。',g=>g.phase===1),
  loop('b','沿金廊验证刚才设定的Ⅰ→Ⅱ。',1),test('配对和行走都需要证据，旋转相机不会改变配对。')]}
};
