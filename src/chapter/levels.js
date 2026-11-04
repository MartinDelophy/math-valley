import { BASE_AZIMUTH,CAMERA_SLOPE } from './spatial.js';
const n=(id,x,z,y=.9,more={})=>({id,x,z,y,...more});
const e=(u,v,more={})=>({id:u+v,u,v,...more});
const chain=(...pairs)=>pairs.map(p=>e(p[0],p[1]));
const common={s:'S',t:'T',source:'组合数学与图论 · 第5章 §5.2 / §5.4'};
function above(a,id,view,more={}){const angle=BASE_AZIMUTH+view*Math.PI/2,d=2.4/CAMERA_SLOPE;return n(id,a.x+Math.sin(angle)*d,a.z+Math.cos(angle)*d,a.y+2.4,more);}
function space(tier){const B=n('B',-1,-1),C=above(B,'C',1),E=n('E',4,-1,3.3,{rune:true}),F=above(E,'F',3),X=n('X',-2,2.1,3.3,{rune:true}),J=above(X,'J',2,{rune:true});
 const nodes=[n('S',-4,3),n('A',-4,-1),B,n('D',2,2,.9,{rune:true}),C,X,E,F,n('T',-2,-4,5.7)];
 const edges=[...chain('SA','AB','AD','DB'),e('B','C',{portal:true,view:1}),e('C','X',{control:true,on:true,station:'C',group:'α',rotary:true}),e('C','E',{control:true,on:false,station:'C',group:'α',requires:['D'],rotary:true}),e('E','F',{portal:true,view:3}),e('F','T',{requires:['X']})];
 if(tier>=2){nodes.push(J);edges.push(e('X','J',{portal:true,view:2}));edges.find(x=>x.id==='CE').requires=['D','J'];edges.find(x=>x.id==='CE').controlView=0;}
 if(tier>=3){nodes.push(n('K',-6,2,.9,{rune:true}));Object.assign(edges.find(x=>x.id==='AD'),{control:true,on:false,group:'β',station:'A',requires:['K'],controlView:3});edges.push(e('A','K',{control:true,on:true,group:'β',station:'A',controlView:3}));edges.find(x=>x.id==='AB').cost=4;}
 if(tier>=4){const L=above(C,'L',0,{rune:true});nodes.push(L);edges.push(e('F','J',{control:true,on:true,station:'F',group:'γ',requires:['E']}),e('J','L',{requires:['E']}),e('C','L',{portal:true,view:0,requires:['E']}));Object.assign(edges.find(x=>x.id==='FT'),{control:true,on:false,station:'F',group:'γ',requires:['L','E'],controlView:2});}
 return {nodes,edges,seals:nodes.filter(n=>n.rune).map(n=>n.id)};
}
const ring=[n('S',-4,2),n('A',-4,-2),n('B',0,-2),n('C',0,-2,3.3),n('D',4,-2,3.3),n('E',4,2,3.3),n('F',4,2,5.7),n('T',-4,2,5.7)];
const ringEdges=[...chain('SA','AB'),e('B','C',{lift:true}),...chain('CD','DE'),e('E','F',{lift:true}),e('F','T'),e('T','S',{lift:true}),...chain('SD','AE','BF','CT')];
const weighted=ringEdges.map((x,i)=>({...x,control:true,cost:[3,6,2,4,7,3,5,4,2,4,1,6][i]}));
const weave=[n('S',-5,0),n('A',-5,-3),n('B',-1.5,3),n('C',2,3),n('D',-5,-3,3.3),n('E',-1.5,3,3.3),n('F',2,3,3.3),n('G',-5,-3,5.7),n('T',2,-3,5.7)];
const weaveEdges=[...chain('SA','SB','SC'),e('A','D',{lift:true}),e('B','E',{lift:true}),e('C','F',{lift:true}),e('D','G',{lift:true}),...chain('GT','ET','FT','AE','BD','BF','CE','AB','BC','DE','EF')];
const networkEdges=[e('S','A',{cap:3}),e('S','B',{cap:3}),e('S','C',{cap:2}),e('A','D',{cap:2,lift:true}),e('A','E',{cap:1}),e('B','D',{cap:2}),e('B','E',{cap:2,lift:true}),e('B','F',{cap:1}),e('C','E',{cap:1}),e('C','F',{cap:2,lift:true}),e('D','G',{cap:2,lift:true}),e('E','G',{cap:1}),e('E','T',{cap:1}),e('E','F',{cap:1}),e('F','T',{cap:3}),e('G','T',{cap:6})];
const fullFlow={SA:3,SB:2,SC:2,AD:2,AE:1,BE:1,BF:1,CF:2,DG:2,EG:1,ET:1,FT:3,GT:3};
const trappedFlow={SA:1,SB:3,SC:2,AE:1,BD:2,BF:1,CF:2,DG:2,EG:1,FT:3,GT:3};
const routeProof={paths:[['S','A','D','G','T'],['S','B','E','T'],['S','C','F','T']]};
const spatialPrinciples=[['状态空间','同一个平台，在不同视角和机关配置下，可以有不同的后继状态。'],['投影对齐','两扇穿越门沿视线重合时建立临时通道；普通桥梁仍按实体连接。'],['可达性','印记与联动机关也是状态的一部分，先后次序会改变可达区域。']];
const treePrinciples=[['生成树','全部平台连通且无环，才是生成树；边数条件需要连通作前提。'],['交换与代价','局部最便宜的选择可能围成环，要同时比较连接分量和边权。'],['全局最优','连接两个分量的选择决定后续代价，最终须给出最低总代价。']];
const pathPrinciples=[['先安排稀缺位置','一条绕行过多中庭的路线，可能占用其他路线唯一的选择。'],['路径下界','互不相交的路线是一份下界证据；需要完整构造，而非目测。'],['Menger 对偶','最大不交路径数与相应的最小割大小相等；注意边版与点版的差异。']];
const flowPrinciples=[['容量与守恒','每条边满足容量约束，每座内部平台都需要流入等于流出。'],['残量网络','可增加的正向容量与可撤回的旧流共同构成可用残量边。'],['最优性的证据','可行流给下界，割给上界；二者相等时证明最优。']];
export const ACTS=[{roman:'Ⅰ',name:'折叠空间',focus:'视角、穿越与状态',ranks:'2 → 5'},{roman:'Ⅱ',name:'连接的代价',focus:'构造、预算与回路',ranks:'3 → 5'},{roman:'Ⅲ',name:'分离与对偶',focus:'多路、瓶颈与证明',ranks:'3 → 5'},{roman:'Ⅳ',name:'流与时间',focus:'守恒、撤回与最优',ranks:'4 → 5'}];
export const LEVELS=[
 {...common,id:'01',title:'折叠的回环',unit:'折叠空间',mode:'spatial',difficulty:2,...space(1),energyLimit:16,goal:'带齐三枚印记，穿过折叠空间，抵达顶层小屋。',action:'检验旅程',hint:'观察穿越门上的罗盘。转动视角让两扇门重合，再踏入通道；留意观察台的联动桥。',principles:spatialPrinciples},
 {...common,id:'02',title:'另一侧的钥匙',unit:'折叠空间',mode:'spatial',difficulty:3,...space(2),energyLimit:19,goal:'四枚印记，三组穿越门。找出开门条件之间的先后关系。',action:'检验旅程',hint:'一座门关着时，先比较不同视角可到达的区域。观察台机关也有朝向。',principles:spatialPrinciples},
 {...common,id:'03',title:'一步的代价',unit:'折叠空间',mode:'spatial',difficulty:4,...space(3),energyLimit:21,goal:'在有限能量内带齐五枚印记，避开昂贵的往返。',action:'检验旅程',hint:'岔路上的代价不同。把印记前提和机关位置一起纳入路径规划。',principles:[['扩展状态','最短路的顶点包含位置、视角、机关和已取得的印记。'],['边权','走桥、穿越和操作都消耗能量；转动视角本身不消耗能量。'],['重新规划','经过同一个平台，不代表回到了同一种状态。']]},
 {...common,id:'04',title:'相位之塔',unit:'折叠空间 · 综合',mode:'spatial',difficulty:5,...space(4),energyLimit:24,goal:'解开三组联动机关与四组穿越门，带齐六枚印记走出高塔。',action:'检验高塔',hint:'有些区域要在取得新印记后再访问。先判断每个机关何时可操作，再安排穿越顺序。',principles:spatialPrinciples},
 {...common,id:'05',title:'最轻的骨架',unit:'连接的代价',mode:'mst',difficulty:3,nodes:ring,edges:weighted,goal:'保持八座平台相通、消去所有环，并使桥梁总代价最小。',action:'检验最优骨架',hint:'从分量和割出发判断哪些桥值得保留；只数边不够。',principles:treePrinciples,solution:{}},
 {...common,id:'06',title:'必须留下的桥',unit:'连接的代价',mode:'mst',difficulty:4,nodes:ring,edges:weighted,required:['AB','CT'],goal:'保留指定的两座长桥，在约束下构造最轻的生成树。',action:'检验约束骨架',hint:'把必须保留的桥先收缩成分量，再比较剩余选择。',principles:treePrinciples,solution:{}},
 {...common,id:'07',title:'有限的备用连接',unit:'连接的代价',mode:'repair',allConnected:true,target:2,difficulty:4,nodes:[...ring,n('X',0,0,3.3)],edges:[...ring.map(p=>e('X',p.id)),...ringEdges.map(x=>({...x,control:true,on:false}))],maxAdded:4,goal:'最多启用四座备用桥，让任何一座桥失效后所有平台仍相通。',action:'模拟单桥失效',hint:'先找树的叶端与割边，再判断一座备用桥能同时保护哪些薄弱位置。',principles:[['基本环','向树加入一条边会产生一个环，这个环上的旧桥获得替代通路。'],['全局稳健性','让起终点相通还不够，这一关要求每个平台都免于单桥故障。'],['有限增广','预算限制下，一条跨过多个关键割的备用桥可能比局部短接更有用。']],solution:{activate:['SA','BC','DE','FT']}},
 {...common,id:'08',title:'三路与三刀',unit:'连接的代价 · 综合',mode:'paths',difficulty:5,nodes:weave,edges:weaveEdges.map(x=>({...x,control:true})),target:3,phases:[{mode:'paths',target:3,goal:'第一阶段：完整构造三条边不交的穿塔路线。',action:'提交路线证据'},{mode:'cut',goal:'第二阶段：找到最小边割，与刚才的路线下界匹配。',action:'提交割的证据'}],hint:'先构造互不共桥的完整路线，再用少量内部收桥动作截断所有可能的绕行。',principles:pathPrinciples,solution:routeProof},
 {...common,id:'09',title:'双重瓶颈',unit:'分离与对偶',mode:'vertex',difficulty:3,nodes:[n('S',-5,0),n('A',-4,-3),n('B',-2,3),n('C',1,3),n('X',-2,-1,3.3),n('Y',2,1,3.3),n('E',-2,-1,5.7),n('F',2,1,5.7),n('T',4,-3,5.7)],edges:chain('SA','SB','SC','AX','BX','BY','CY','XY','XE','YF','ET','FT'),goal:'封闭尽量少的中庭，让所有绕行方案都无法抵达小屋。',action:'验证点割',hint:'局部岔路很多。先把进入高层之前必经的中间结构找出来。',principles:pathPrinciples,solution:{blocked:['X','Y']}},
 {...common,id:'10',title:'把中庭留给别人',unit:'分离与对偶',mode:'paths',internal:true,target:3,difficulty:4,nodes:weave,edges:weaveEdges,goal:'安排三条内部点不交的路线；贪心绕路会占掉别人的中庭。',action:'验证三路',hint:'先考虑选择最少的那条路线。第一条路走得越长，留给后两条的空间未必越多。',principles:pathPrinciples,solution:routeProof},
 {...common,id:'11',title:'不在门口的割',unit:'分离与对偶',mode:'capacitycut',difficulty:4,nodes:weave,edges:networkEdges,goal:'入口与出口都不是最窄处。寻找真正的最小容量割。',action:'验证容量割',hint:'割是一组平台的划分；要累计所有从源侧离开的有向边，包括斜跨层的边。',principles:flowPrinciples,solution:{side:['S','A','B','C','D','E','F']}},
 {...common,id:'12',title:'三份路线，一份证明',unit:'分离与对偶 · 综合',mode:'paths',internal:true,target:3,difficulty:5,nodes:weave,edges:weaveEdges,phases:[{mode:'paths',internal:true,target:3,goal:'第一阶段：给出三条内部点不交的完整路线。',action:'提交路径下界'},{mode:'vertex',goal:'第二阶段：以最少中庭截断所有路线，给出匹配的上界。',action:'完成对偶证明'}],hint:'把路径构造和阻碍构造分开完成。检查所选中庭是否连未标记过的绕路也一并截断。',principles:pathPrinciples,solution:routeProof},
 {...common,id:'13',title:'整座塔都要守恒',unit:'流与时间',mode:'flow',target:7,difficulty:4,nodes:weave,edges:networkEdges,goal:'在十六座有向桥之间分配流量，守恒地送达七单位。',action:'检验整体流量',hint:'先估计各层出口能承担多少，再逐层回推需求，别把局部开满当成目标。',principles:flowPrinciples,solution:{flow:fullFlow}},
 {...common,id:'14',title:'撤回昨日的选择',unit:'流与时间',mode:'residual',target:7,difficulty:4,nodes:weave,edges:networkEdges,initialFlow:trappedFlow,goal:'现有流量被旧选择卡住。利用反向残量把六单位增加到七单位。',action:'验证重新分配',hint:'沿着源点还能增加的方向寻找阻碍。若前方满了，思考其中哪一单位旧流可以换路。',principles:flowPrinciples,solution:{residualPath:['S','A','D','B','E','T']}},
 {...common,id:'15',title:'残量的边界',unit:'流与时间',mode:'residualcut',difficulty:5,nodes:weave,edges:networkEdges,initialFlow:fullFlow,goal:'根据残量网络，准确标出从 S 可达的全部平台，形成最优割。',action:'验证残量边界',hint:'有流的桥还提供反向可达性。先别按原图的箭头直觉给平台归属。',principles:flowPrinciples,solution:{side:['S','A','B','C','D','E','F']}},
 {...common,id:'16',title:'让上下界相遇',unit:'流与时间 · 综合',mode:'residual',target:7,difficulty:5,nodes:weave,edges:networkEdges,initialFlow:trappedFlow,phases:[{mode:'residual',target:7,goal:'第一阶段：撤回并重排旧流，找到更大的可行流。',action:'提交流的构造'},{mode:'flowcut',goal:'第二阶段：保持守恒流，再构造与它同容量的割，完成最优性证明。',action:'证明全局最优'}],hint:'先消除旧分配造成的阻塞，再寻找一个能给最大流封顶的阻碍结构。',principles:flowPrinciples,solution:{residualPath:['S','A','D','B','E','T'],side:['S','A','B','C','D','E','F']}}
];
export const modeLabels={spatial:'空间行走',mst:'最轻骨架',repair:'有限增广',tree:'收桥',cut:'最小边割',vertex:'封门',paths:'构造路线',flow:'调节闸门',capacitycut:'标记割',residual:'残量寻路',residualcut:'残量边界',flowcut:'流与割'};
