const base = {
  chapter: 5,
  mode: 'congruence',
  scene: 'clocktower',
  unit: '模运算',
  source: 'Computational Number Theory · §1.1',
  nodes: [],
  edges: [],
  start: 0,
};

const remainder = ['模运算', '若两个整数相差模数的整数倍，它们就有相同的余数。钟盘绕一圈后，位置回到起点。'];
const reconstruction = ['中国剩余定理', '模数两两互素时，各自的余数在一个公共周期内唯一确定一个位置。周期是模数的乘积。'];
const compatibility = ['相容条件', '对两个模数，余数之差须能被最大公因数整除。条件相容时，解以两个模数的最小公倍数为周期。'];

function level(number, title, goal, hint, rules, principles) {
  return { ...base, id: `5-0${number}`, displayId: `0${number}`, difficulty: number + 1,
    title, goal, shortGoal: goal, hint, principles, ...rules };
}

export const CONGRUENCE_LEVELS = [
  level(1, '越过零点', '把钟盘调到 x ≡ 1 (mod 8)', '从 6 出发。试着跨过钟盘的零点，观察余数怎样循环。',
    { moduli: [8], residues: [1], start: 6, actions: [1, -1], budget: 3 }, [remainder]),
  level(2, '两座钟的约定', '让 x ≡ 2 (mod 3) 与 x ≡ 1 (mod 5) 同时成立', '先观察哪个机关只改变一座钟。保持已经对齐的余数，再调整另一座钟。',
    { moduli: [3, 5], residues: [2, 1], actions: [3, 5], budget: 3 }, [remainder, reconstruction]),
  level(3, '共享的齿轮', '让 x ≡ 2 (mod 4) 与 x ≡ 4 (mod 6) 同时成立', '两座钟共享一个公因数。先检查目标余数是否同奇偶，再找出一个公共周期内的解。',
    { moduli: [4, 6], residues: [2, 4], actions: [4, 6], budget: 3 }, [remainder, compatibility]),
  level(4, '无法同响', '证明 x ≡ 1 (mod 4) 与 x ≡ 2 (mod 6) 无法同时成立', '转动钟盘观察规律，再选一个能整除两个模数的数，比较目标余数对它取模后的结果。',
    { moduli: [4, 6], residues: [1, 2], actions: [1, 4, 6], budget: 16, divisors: [2, 3, 4] }, [remainder, compatibility]),
];

export const CONGRUENCE_ACTS = [
  { roman: 'Ⅰ', name: '余数循环', focus: '模运算', ranks: '2' },
  { roman: 'Ⅱ', name: '双钟重构', focus: '中国剩余定理', ranks: '3' },
  { roman: 'Ⅲ', name: '共同周期', focus: '相容条件', ranks: '4' },
  { roman: 'Ⅳ', name: '矛盾的见证', focus: '公因数证据', ranks: '5' },
];

export const CONGRUENCE_LESSON = {
  title: '钟盘怎样记录余数',
  engine: 'expansion',
  level: { ...base, id: 'lesson-congruence', moduli: [5], residues: [1], start: 4, actions: [2], budget: 1 },
  principle: remainder[1],
  steps: [
    { method: 'act', args: ['jump', 2], label: '让钟盘前进两格', copy: '从 4 前进两格得到 6。因为 6 除以 5 余 1，旅人落在刻度 1。', done: g => g.x === 1 },
    { method: 'test', args: [], label: '检验这个小例子', copy: '检验当前余数。正式关卡会让两座不同周期的钟同时对齐。', done: g => g.won },
  ],
};
