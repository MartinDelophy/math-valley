const source='代数拓扑 · §1.1 / §1.3；复分析与Riemann曲面 · §7.1';
const common={chapter:2,mode:'topology',nodes:[],edges:[],source,unit:'回环之塔',start:0,actions:['a','A'],kind:'circle',sheets:2,scene:'moon',budget:9};
const circle=[['同伦与绕数','在去掉中心孔的环廊中，固定端点的路径同伦由完整绕数区分。绕圈时路径可以交叉，但不能穿过孔。'],['覆盖与原像','同一角度可以对应不同层。层号记录绕数的余数，不能代替完整绕数。'],['正反路径','沿回廊返回，对应原路径的逆；相邻的一正一反可以连续消去。']];
const words=[['路径有先后','基空间的双井庭院形变收缩到两个圆的楔合。青廊记为 a，金廊记为 b；反向记为 a⁻¹、b⁻¹。'],['同伦的证据','在这个特定骨架上，路径的自由约化词相同，才属于同一个保基点同伦类。'],['绕数不充分','分别统计两个孔的绕数会丢掉顺序。a b a⁻¹ b⁻¹ 的两个绕数都是零，却不是平凡路径。']];
const cover=[['唯一提升','给定起始原像后，每条有向回廊都有唯一去处。反向行走采用对应置换的逆。'],['纤维上的作用','完整绕过一条回廊，会对同一基点上方的层作置换；先后次序可能改变结果。'],['视角与结构','旋转相机揭示接缝与遮挡，不改变覆盖本身的配对。这里的换层作用也不能直接等同于覆盖变换群。']];
const universal=[['展开的圆','圆周的万有覆盖可用实数线表示。螺旋只是把这条展开的线放进三维空间。'],['整数高度','完整绕行使整数高度增加或减少一。同一角度的不同高度，对应不同绕数。'],['观察窗口','场景只展示可探索的一段；延伸处没有被宣称为整个覆盖空间的边界。']];
const w=n=>({winding:n}),s=n=>({layer:n});
const levels=[
 {title:'固定的归处',goal:'经过三个绕行见证点，构造与参考路径同伦的归途。',shortGoal:'保留绕数，找到归途',targetWord:'aa',checkpoints:[w(1),w(0),w(-1)],budget:7,principles:circle,hint:'同层只记录余数。把见证点的完整绕数依次写下，再安排正反走法。'},
 {title:'可退的回声',scene:'courts',kind:'free',sheets:3,actions:['a','A','b','B'],targetWord:'abA',checkpoints:[s(2),s(1)],minCancellations:2,budget:9,evidence:'reduction',principles:words,hint:'先安排必须到访的层，再把多走的路成对退回。证明页只能消去相邻的正反路径。'},
 {title:'绕数的边界',scene:'courts',kind:'free',sheets:3,actions:['a','A','b','B'],targetWord:'abAB',checkpoints:[s(2),s(0)],budget:8,evidence:'classification',principles:words,hint:'两个孔各自的绕数相抵，不保证整条路径可缩。观察仍留在约化词中的顺序。'},
 {title:'归处的另一层',targetLayer:1,checkpoints:[w(1),w(-1),w(2)],budget:8,principles:[circle[1],...cover.slice(0,2)],goal:'按序经过绕数 1、−1、2 的见证点，再抵达Ⅱ层。',shortGoal:'按序寻齐印记，抵达上层',hint:'相机中的高度是覆盖层，手札中的绕数是完整记录。最后一段可比较正走和反走。'},
 {title:'三重回声',sheets:3,targetLayer:2,checkpoints:[w(-1),w(2),w(1)],budget:7,principles:[circle[1],cover[0],circle[2]],goal:'依次经过绕数 −1、2、1 的见证点，在预算内抵达Ⅲ层。',shortGoal:'穿过三重回声',hint:'三重覆盖中的反走会去哪里？先计算每段的方向，再检查终点余数。'},
 {title:'倒着走的门',sheets:3,permutations:{a:[2,0,1]},targetLayer:1,checkpoints:[s(1),s(0),s(2)],budget:6,principles:cover,goal:'青廊的换层方向被反转。按Ⅰ→Ⅱ→Ⅰ→Ⅲ的观察结果规划归途，最后抵达Ⅱ层。',shortGoal:'找到逆向的归途',hint:'从当前层观察正走的去处，反走必须把它准确撤回。不要沿用上一关的换层方向。'},
 {title:'展开的圆',kind:'universal',scene:'helix',range:[-1,3],targetLayer:3,checkpoints:[w(1),w(-1),w(2)],budget:8,principles:universal,goal:'依次访问整数高度 1、−1、2，在预算内抵达 +3 层。',shortGoal:'沿展开的圆，抵达第三层',hint:'这里不对层号取余。先到负层再返回，安排折返次数。'},
 {title:'先后之间',kind:'free',scene:'courts',sheets:3,actions:['a','A','b','B'],targetLayer:2,checkpoints:[{layer:2,letter:'b'},{layer:1,letter:'a'},{layer:0,letter:'b'}],budget:8,principles:cover,goal:'依次在Ⅲ层走金廊、Ⅱ层走青廊、Ⅰ层走金廊，最后抵达Ⅲ层。',shortGoal:'安排绕行，抵达指定层',hint:'把两条回廊看作层的置换。记录每次的出发层与到达层，反走也可能帮助减少绕行。'},
 {title:'封闭的错觉',scene:'helix',sheets:3,targetLayer:0,requireNontrivial:true,checkpoints:[s(2),s(1),s(2)],budget:7,evidence:'classification',principles:[circle[1],words[2],['闭合提升','三重覆盖中，绕三圈可以回到原层，但在基空间仍有非零绕数。闭合提升不是可缩的充分条件。']],goal:'构造一条回到Ⅰ层、但在基空间不可缩的路径，再提交判断证据。',shortGoal:'回到原层，仍未回到原路',hint:'别让净绕数归零。让它成为三的非零倍数，然后比较“同层”和“可缩”。'},
 {title:'拼回一座塔',kind:'free',scene:'courts',sheets:3,actions:['a','A','b','B'],construct:true,targetPermutation:[2,1,0],targetLayer:1,checkpoints:[s(2),s(0),s(2),s(1)],budget:6,principles:cover,goal:'先依据观察记录复原金廊配对，再通过复原的覆盖到达目标层。',shortGoal:'拼回门的对应，继续旅程',hint:'每层都必须恰有一个去处，反向也必须唯一。先金后青的实验终点记录为Ⅰ→Ⅰ、Ⅱ→Ⅲ、Ⅲ→Ⅱ。结合青廊的三循环，倒推金廊。'},
 {title:'同路异形',kind:'universal',scene:'helix',range:[-2,3],targetWord:'aa',checkpoints:[w(-1),w(1),w(0)],minCancellations:2,budget:9,evidence:'reduction',principles:[circle[0],circle[2],universal[1]],goal:'经过 −1、1、0 三个见证高度，构造与绕两圈同伦的路径，并逐步消去冗余往返。',shortGoal:'消去折返，保留同伦类',hint:'路径可以有不同形状和长度。证明时只消去相邻的逆路径，最终留下完整绕数。'},
 {title:'归塔之证',kind:'free',scene:'courts',sheets:3,actions:['a','A','b','B'],targetWord:'abAbaB',checkpoints:[s(2),s(0),s(1)],minCancellations:1,budget:12,evidence:'reduction',principles:[words[1],cover[1],['双重验证','合法到达给出行走证据；完整的约化过程给出同伦证据。仅凭终点或两个绕数，无法替代后者。']],goal:'访问三处见证层，在预算内匹配参考路线，再独立完成同伦证据。',shortGoal:'以路径与证据，走出回环',hint:'先在纸上约化参考路径，再检查途中缺少哪些见证层。允许可退的绕行，但要为预算和证明留余地。'}
];
export const TOPOLOGY_LEVELS=levels.map((l,i)=>({...common,...l,id:`2-${String(i+1).padStart(2,'0')}`,displayId:String(i+1).padStart(2,'0'),difficulty:Math.min(5,2+Math.floor(i/3)),action:l.construct?'检验门的对应':l.evidence?'提交行走证据':'检验旅程'}));
export const TOPOLOGY_ACTS=[{roman:'Ⅰ',name:'路径的身份',focus:'绕数、逆路径与同伦',ranks:'2 → 3'},{roman:'Ⅱ',name:'覆盖中的行走',focus:'原像、换层与逆作用',ranks:'3 → 4'},{roman:'Ⅲ',name:'展开的空间',focus:'整数高度与顺序',ranks:'4 → 5'},{roman:'Ⅳ',name:'证据与归途',focus:'复原、消去与证明',ranks:'5'}];
