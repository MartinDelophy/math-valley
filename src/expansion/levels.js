import {levelPrinciples} from './principles.js';
// Authored from Abstract Algebra §§3–6 and Information Theory §4.
const groupPrinciples=[['右乘与左作用','机关把生成元写在词的右侧：g → gr 或 gs。顶点上的作用为 (k,m)·x = k + (−1)^m x（模 n）；复合映射先作用右边。'],['从轨道到陪集','固定一个顶点的元素组成稳定子 H；gH 与顶点 g·0 一一对应。固定一个点并不等于固定所有点。'],['视角与数学状态','Q / E 只改变观察方向。金色镜门只有沿指定视线重合时才能穿越；穿越执行 s，绝不是把相机转动算作群运算。']];
const codePrinciples=[['在二元域中运算','所有求和都在 GF(2) 中进行。校验矩阵 H 的第 i 列是 i 的三位二进制表示，校验位位于 1、2、4，信息位位于 3、5、6、7。'],['综合征与距离','综合征 s = Hrᵀ。至多一位出错时，非零综合征给出错误所在的列；不附加错误数假设时，综合征不能唯一确定错误。'],['纠错的边界','Hamming(7,4) 的最小距离为 3；增加整体偶校验后最小距离为 4。扩展码可纠正一错、检测两错；距离相同的两个候选不能被武断地唯一译码。']];
const group=(i,title,task,goal,hint,more={})=>({id:`3-${String(i).padStart(2,'0')}`,displayId:String(i).padStart(2,'0'),chapter:3,mode:'algebra',scene:'symmetry',unit:'群与对称',nodes:[],edges:[],difficulty:i<3?3:i<6?4:5,n:4,budget:16,title,task,goal,shortGoal:goal,hint,action:'提交结构证据',source:'Abstract Algebra · Ch. 3–6',principles:[['群与对称',levelPrinciples[i-1]],...groupPrinciples],...more});
export const SYMMETRY_LEVELS=[
 group(1,'镜庭的六步归途','relations','绕行四次，再穿镜两次，回到单位元','按序访问 r、r²、r³、e、s、e。镜门上的罗马数字给出对齐视角；两层回廊分别代表旋转与反射。',{budget:6}),
 group(2,'先后之间','order','分别构造 rs 与 sr，比较整个顶点排列','先按 r、s 操作并提交，庭院会保留第一份排列。第二次从 e 出发按 s、r 操作；同一组机关可以产生不同终点。',{budget:2}),
 group(3,'静止的顶点','stabilizer','遍历顶点轨道，封存所有固定顶点 0 的元素','行走时观察 0 的像。只有抵达的群元素才能封存；收集完整轨道，再比较固定一个顶点和固定整个图形。',{budget:14}),
 group(4,'四座同影之门','cosets','为四个左陪集各选一个代表，旋转与反射各两枚','H 是顶点 0 的稳定子。两个代表若把 0 送到同一点，就属于同一个左陪集；在两层之间分配代表。',{budget:14}),
 group(5,'旋转之内','normal','封存全部旋转，再构造 srs 验证共轭','第一阶段找出旋转子群的全部元素。第二阶段从 e 出发构造 srs，观察它仍在旋转子群内，并比较 r 的逆。',{budget:12,twoStage:true,exhaustive:true}),
 group(6,'不封闭的镜面','nonnormal','构造稳定子，再找出共轭离开它的证据','先封存固定顶点 0 的全部元素；提交后从 e 出发构造 rsr⁻¹，检验它是否还固定顶点 0。',{budget:8,twoStage:true,exhaustive:true}),
 group(7,'看不见的运动','kernel','遍历八个元素，找出对两组对顶点都无影响的核','只观察集合 {0,2} 和 {1,3}。允许集合内部交换，但两个集合都必须保持各自不变。核与单个顶点的稳定子不同。',{budget:18}),
 group(8,'商庭的四扇门','quotient','给出四个商类代表，再验证非平凡交换子','在 D₆ 中令 N = ⟨r²⟩。先按 (k mod 2,m) 区分四个商类；再从 e 构造 rsr⁻¹s，检查它在 N 内但并非单位元。',{n:6,budget:16,twoStage:true,exhaustive:true}),
];
const code=(i,title,task,goal,hint,more={})=>({id:`4-${String(i).padStart(2,'0')}`,displayId:String(i).padStart(2,'0'),chapter:4,mode:'coding',scene:'beacons',unit:'纠错编码',nodes:[],edges:[],difficulty:i<3?3:i<6?4:5,bits:7,budget:7,title,task,goal,shortGoal:goal,hint,action:'提交信号证据',source:'Information Theory · Ch. 4',principles:[['纠错编码',levelPrinciples[i+7]],...codePrinciples],...more});
export const CODING_LEVELS=[
 code(1,'冗余之桥','encode','保留消息 1011，点亮三座校验信标','信息位已经锁定。切换视角观察三组校验拱线，再决定位置 1、2、4 的取值；所有校验都应为偶数。',{message:[1,0,1,1],editable:[0,1,3],budget:3}),
 code(2,'失落的两束光','erasures','只重建位置 3 与 5，恢复有效码字','问号表示已知位置的擦除，不是未知位置的翻转。把两个未知比特代入三个校验方程，保留其余五位。',{message:[1,1,0,1],erasures:[2,4],editable:[2,4],budget:2}),
 code(3,'错误留下的影子','correct','在一次修改内修复收到的七位信号','这次信道保证恰有一位错误。观察三组校验结果，把综合征与 H 的列比较；发送的消息不会直接显示。',{message:[0,1,1,0],errors:[5],budget:1}),
 code(4,'接力的两次校验','relay','连续修复两次独立的单比特错误','第一束信号修复后提交，第二束会使用另一条消息和另一处错误。每一段只有一次修改机会。',{message:[1,0,0,1],errors:[2],relayMessage:[0,0,1,1],relayErrors:[6],budget:1,twoStage:true}),
 code(5,'距离三的见证','distance','构造非零码字，用恰好三座灯证明距离上界','从全零码字出发，寻找三列相加为零的组合。H 没有零列且没有重复列，因此重量 1、2 都不可能成为非零码字。',{message:[0,0,0,0],budget:3}),
 code(6,'第八座哨塔','extended','修复扩展码的一位错误，兼顾整体奇偶','第八位是整体偶校验，不属于 H 的前三行。综合征为零而整体为奇数时，错误可能在第八位；本关保证至多一错。',{bits:8,message:[1,1,1,0],errors:[7],budget:1}),
 code(7,'无法唯一的回声','ambiguity','封存两个不同的有效码字，它们都距接收词两位','本关有两位错误。不要猜哪条消息才是真的；从接收词出发，分别构造两个距离为 2 的有效扩展码字，给出无法唯一纠错的证据。',{bits:8,received:[1,1,0,0,0,0,0,0],budget:8}),
 code(8,'越过噪声的归途','capstone','先完成扩展编码，再在一错信道中恢复消息','先为消息 1101 补齐四个校验位。提交后信道将翻转一位；第二阶段结合综合征和整体奇偶完成译码。',{bits:8,message:[1,1,0,1],editable:[0,1,3,7],errors:[4],budget:4,twoStage:true}),
];
const act=(roman,name,focus,ranks)=>({roman,name,focus,ranks});
export const SYMMETRY_ACTS=[act('Ⅰ','运算的次序','关系与不交换','3'),act('Ⅱ','轨道与陪集','稳定子与代表系','3–4'),act('Ⅲ','共轭的考验','正规性与反例','4'),act('Ⅳ','被遗忘的对称','作用的核与商群','5')];
export const CODING_ACTS=[act('Ⅰ','冗余的结构','编码与擦除','3'),act('Ⅱ','噪声的指纹','综合征与接力译码','3–4'),act('Ⅲ','距离的边界','最小距离与扩展码','4'),act('Ⅳ','可靠的证据','歧义见证与编码综合','5')];
