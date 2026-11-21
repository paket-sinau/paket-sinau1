/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

// Fisher-Yates shuffle algorithm used in AppContext
const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

test('Fisher-Yates shuffle preserves all elements while producing permutations', () => {
  const original = ['mtk-1', 'mtk-2', 'mtk-3', 'mtk-4', 'mtk-5', 'mtk-6', 'mtk-7', 'mtk-8', 'mtk-9', 'mtk-10'];
  
  // Test 1: Contains exact same set of IDs
  const shuffled = shuffleArray(original);
  assert.equal(shuffled.length, original.length);
  assert.deepEqual(new Set(shuffled), new Set(original));

  // Test 2: Randomization across multiple runs produces distinct permutations for students
  const studentA = shuffleArray(original);
  const studentB = shuffleArray(original);
  
  // They both have 10 elements
  assert.equal(studentA.length, 10);
  assert.equal(studentB.length, 10);

  // Over multiple samples, permutations are not identical to original
  let differentCount = 0;
  for (let i = 0; i < 20; i++) {
    const run = shuffleArray(original);
    if (JSON.stringify(run) !== JSON.stringify(original)) {
      differentCount++;
    }
  }
  assert.ok(differentCount >= 18, 'Shuffle should produce distinct permutations in almost all runs');
});
