const step=(method,args,label,copy,done)=>({method,args,label,copy,done});
const common={nodes:[],edges:[]};
export const expansionLessons={
 symmetry:{title:'镜门如何记录运算',engine:'expansion',level:{...common,id:'lesson-symmetry',chapter:3,mode:'algebra',n:4,task:'order',budget:2},principle:'机关把生成元写在词的右侧。镜门切换旋转层与反射层；相机只改变视线，不改变当前的群元素。rs 与 sr 需要分别从 e 出发比较。',steps:[
 step('act',['r'],'执行一次 r','观察旅人沿下层回廊走向 r，同时查看顶点排列。',g=>g.raw?.join('')==='r'),
 step('setView',[1],'对齐第二视角','两扇金色镜门沿这一条视线重合；相机变化不会写入路径词。',g=>g.camera?.index===1),
 step('act',['s'],'穿镜并执行 s','现在穿越到上层，得到 rs。右乘的顺序记录在手记中。',g=>g.raw?.join('')==='rs'),
 step('test',[],'保留第一份实验','提交后从 e 重新出发。正式关卡需要你继续构造 sr，比较两个完整排列。',g=>g.phase===1),
 ]},
 coding:{title:'读懂信标的综合征',engine:'expansion',level:{...common,id:'lesson-coding',chapter:4,mode:'coding',bits:7,task:'correct',message:[1,0,0,0],errors:[1],budget:1},principle:'这个独立例子保证只有一位错误。综合征等于 H 中错误位置的列；先定位，再对齐信标，最后用全部校验验证。',steps:[
 step('setView',[1],'观察第二组校验','综合征为二进制 010。H 的第二列是 010，因此观察第二座信标。',g=>g.camera?.index===1),
 step('act',['bit',1],'切换第二座信标','翻转这一位。综合征归零；在至多一错的前提下，有效码字被唯一恢复。',g=>g.energy===1),
 step('test',[],'检验恢复的码字','校验方程与距离条件同时满足，桥梁可以接通。',g=>g.won),
 ]}
};
