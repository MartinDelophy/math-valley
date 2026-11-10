function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

export function period(level) {
  return level.moduli.reduce((p, n) => p / gcd(p, n) * n, 1);
}

export function observe(level, x) {
  return level.moduli.map((n, index) => {
    const residue = x % n;
    const target = level.residues[index];
    return { n, residue, target, matches: residue === target };
  });
}

export function stepCongruence(level, state, [method, value]) {
  if (method === 'jump' && level.actions.includes(value) && state.energy < level.budget) {
    const cycle = period(level);
    const x = ((state.x + value) % cycle + cycle) % cycle;
    return { ...state, x, energy: state.energy + 1 };
  }
  if (method === 'divisor' && level.divisors?.includes(value) && value !== state.divisor) {
    return { ...state, divisor: value };
  }
  return null;
}

export function evaluateCongruence(level, state) {
  if (level.divisors) {
    const { divisor } = state;
    const common = divisor > 1 && level.moduli.every(n => n % divisor === 0);
    const pass = common && level.residues[0] % divisor !== level.residues[1] % divisor;
    const detail = pass ? '公因数给出了矛盾，两座钟无法同时对齐。'
      : common ? '这两个目标余数在所选公因数下没有矛盾。'
        : '请选择一个能整除两个模数的数。';
    return { pass, final: pass, detail };
  }
  const pass = observe(level, state.x).every(dial => dial.matches);
  return { pass, final: pass, detail: pass ? '所有目标余数都已对齐。' : '还有钟盘没有对齐目标余数。' };
}
