import test from 'node:test';
import assert from 'node:assert/strict';
import { CONGRUENCE_LEVELS } from '../src/number-theory/levels.js';
import { congruenceInternational } from '../src/i18n/congruence-international.js';
import { congruenceMessages } from '../src/i18n/congruence.js';
import { period } from '../src/number-theory/math.js';
import { evaluation, initialExpansion, replayExpansion, stepExpansion } from '../src/expansion/math.js';
import { expansionCheckpoint, restoreExpansion } from '../src/expansion/checkpoint.js';

test('all four clocktower puzzles accept their intended evidence and replay through saves', () => {
  const solutions = [
    [['jump', 1], ['jump', 1], ['jump', 1]],
    [['jump', 5], ['jump', 3], ['jump', 3]],
    [['jump', 4], ['jump', 6]],
    [['divisor', 2]],
  ];
  for (const [index, level] of CONGRUENCE_LEVELS.entries()) {
    const actions = solutions[index];
    assert.equal(evaluation(level, initialExpansion(level)).pass, false, level.id);
    const state = replayExpansion(level, actions);
    assert(evaluation(level, state).final, level.id);
    const checkpoint = expansionCheckpoint(level, actions, { index: 2 }, true);
    assert.deepEqual(restoreExpansion(level, checkpoint)?.state, state);
    assert.equal(restoreExpansion({ ...level, residues: [0] }, checkpoint), null);
  }
});

test('noncoprime clocks use their least common multiple and reject spurious certificates', () => {
  const [, , compatible, impossible] = CONGRUENCE_LEVELS;
  assert.equal(period(compatible), 12);
  assert.deepEqual(Array.from({ length: 12 }, (_, x) => x).filter(x => evaluation(compatible, { x }).pass), [10]);
  assert(Array.from({ length: 12 }, (_, x) => x).every(x => x % 4 !== 1 || x % 6 !== 2));
  for (const wrongDivisor of [3, 4]) {
    const state = replayExpansion(impossible, [['divisor', wrongDivisor]]);
    assert.equal(evaluation(impossible, state).pass, false);
  }
  const state = replayExpansion(compatible, [['jump', 4], ['jump', 4], ['jump', 4]]);
  assert.equal(state.x, 0);
  assert.equal(stepExpansion(compatible, state, ['jump', 4]), null);
  assert.equal(stepExpansion(compatible, initialExpansion(compatible), ['jump', 1]), null);
});

test('each Clocktower locale includes the complete chapter catalog', () => {
  for (const [locale, messages] of Object.entries(congruenceInternational)) {
    for (const [source] of congruenceMessages) assert(messages[source], `${locale}: ${source}`);
  }
});
