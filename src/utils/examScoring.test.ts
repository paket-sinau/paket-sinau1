/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateQuestionScore, evaluateExamSession } from './examScoring';
import { Question, StudentAnswerItem } from '../types';

const defaultPackage = {
  bobotBenar: 4,
  bobotSalah: -1,
  bobotKosong: 0,
};

test('PILGAN scoring: correct answer receives full points', () => {
  const q: Question = {
    id: 'q1',
    mapelId: 'matematika',
    topik: 'Aljabar',
    tingkatKesulitan: 'sedang',
    modelSoal: 'pilgan',
    teksSoal: 'Berapakah $x$ jika $2x + 4 = 10$?',
    pilganKunci: 'B',
    pilganOptions: [
      { label: 'A', teks: '2' },
      { label: 'B', teks: '3' },
      { label: 'C', teks: '4' },
      { label: 'D', teks: '5' },
    ],
    pembahasan: '$2x = 6 \\implies x = 3$',
    pembuatId: 'g1',
    pembuatNama: 'Guru Budi',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const correctAns: StudentAnswerItem = {
    questionId: 'q1',
    modelSoal: 'pilgan',
    state: 'sudah_dijawab',
    pilganAnswer: 'B',
  };

  const result = calculateQuestionScore(q, correctAns, defaultPackage);
  assert.equal(result.isFullyCorrect, true);
  assert.equal(result.scoreAwarded, 4);
});

test('PILGAN scoring: wrong answer gets penalty and empty gets zero', () => {
  const q: Question = {
    id: 'q1',
    mapelId: 'matematika',
    topik: 'Aljabar',
    tingkatKesulitan: 'sedang',
    modelSoal: 'pilgan',
    teksSoal: 'Berapakah nilai $x$?',
    pilganKunci: 'B',
    pembahasan: '',
    pembuatId: 'g1',
    pembuatNama: 'Guru Budi',
    createdAt: '',
    updatedAt: '',
  };

  const wrongAns: StudentAnswerItem = {
    questionId: 'q1',
    modelSoal: 'pilgan',
    state: 'sudah_dijawab',
    pilganAnswer: 'C',
  };

  const wrongRes = calculateQuestionScore(q, wrongAns, defaultPackage);
  assert.equal(wrongRes.isFullyCorrect, false);
  assert.equal(wrongRes.scoreAwarded, -1);

  const emptyRes = calculateQuestionScore(q, undefined, defaultPackage);
  assert.equal(emptyRes.isFullyCorrect, false);
  assert.equal(emptyRes.scoreAwarded, 0);
  assert.equal(emptyRes.isAnswered, false);
});

test('MCMA scoring: proportional calculation handles correct and wrong picks', () => {
  const q: Question = {
    id: 'q2',
    mapelId: 'ipa',
    topik: 'Ekosistem',
    tingkatKesulitan: 'sulit',
    modelSoal: 'mcma',
    teksSoal: 'Pilihlah organisme yang berperan sebagai konsumen tingkat 1!',
    mcmaKunci: ['A', 'C'],
    mcmaScoringMode: 'proportional',
    pembahasan: 'A dan C adalah herbivora konsumen 1',
    pembuatId: 'g1',
    pembuatNama: 'Guru Budi',
    createdAt: '',
    updatedAt: '',
  };

  // Full correct (A and C)
  const fullAns: StudentAnswerItem = {
    questionId: 'q2',
    modelSoal: 'mcma',
    state: 'sudah_dijawab',
    mcmaAnswer: ['A', 'C'],
  };
  const fullRes = calculateQuestionScore(q, fullAns, defaultPackage);
  assert.equal(fullRes.isFullyCorrect, true);
  assert.equal(fullRes.scoreAwarded, 4);

  // Partial correct: picked 1 correct (A) out of 2 keys
  const partialAns: StudentAnswerItem = {
    questionId: 'q2',
    modelSoal: 'mcma',
    state: 'sudah_dijawab',
    mcmaAnswer: ['A'],
  };
  const partialRes = calculateQuestionScore(q, partialAns, defaultPackage);
  assert.equal(partialRes.isFullyCorrect, false);
  assert.equal(partialRes.scoreAwarded, 2); // 1/2 of 4 = 2

  // Picked 1 correct (A) and 1 wrong (B): penalty (1 - 1)/2 = 0
  const penaltyAns: StudentAnswerItem = {
    questionId: 'q2',
    modelSoal: 'mcma',
    state: 'sudah_dijawab',
    mcmaAnswer: ['A', 'B'],
  };
  const penRes = calculateQuestionScore(q, penaltyAns, defaultPackage);
  assert.equal(penRes.scoreAwarded, 0);
});

test('KATEGORI scoring: per-row partial scoring calculates correctly', () => {
  const q: Question = {
    id: 'q3',
    mapelId: 'bahasa_indonesia',
    topik: 'Teks Argumentasi',
    tingkatKesulitan: 'sedang',
    modelSoal: 'kategori',
    teksSoal: 'Tentukan apakah pernyataan berikut termasuk Fakta atau Opini!',
    kategoriLabels: ['Fakta', 'Opini'],
    kategoriScoringMode: 'per_row',
    kategoriPernyataan: [
      { id: 's1', teks: 'Indonesia memiliki lebih dari 17.000 pulau.', kunciJawaban: 'Fakta' },
      { id: 's2', teks: 'Pulau Bali adalah tempat terindah di dunia.', kunciJawaban: 'Opini' },
      { id: 's3', teks: 'Ibu kota negara Indonesia adalah Jakarta.', kunciJawaban: 'Fakta' },
      { id: 's4', teks: 'Bahasa Indonesia adalah bahasa paling mudah dipelajari.', kunciJawaban: 'Opini' },
    ],
    pembahasan: '',
    pembuatId: 'g2',
    pembuatNama: 'Guru Siti',
    createdAt: '',
    updatedAt: '',
  };

  // 3 out of 4 correct
  const answerItem: StudentAnswerItem = {
    questionId: 'q3',
    modelSoal: 'kategori',
    state: 'sudah_dijawab',
    kategoriAnswer: {
      s1: 'Fakta', // correct
      s2: 'Opini', // correct
      s3: 'Fakta', // correct
      s4: 'Fakta', // wrong (key is Opini)
    },
  };

  const res = calculateQuestionScore(q, answerItem, defaultPackage);
  assert.equal(res.isFullyCorrect, false);
  assert.equal(res.scoreAwarded, 3); // (3 / 4) * 4 = 3
});

test('Session evaluation: aggregates scores, percentages and counts accurately', () => {
  const q1: Question = {
    id: 'q1',
    mapelId: 'matematika',
    topik: 'Dasar',
    tingkatKesulitan: 'mudah',
    modelSoal: 'pilgan',
    teksSoal: '$1 + 1 = ?$',
    pilganKunci: 'A',
    pembahasan: '',
    pembuatId: 'g1',
    pembuatNama: '',
    createdAt: '',
    updatedAt: '',
  };

  const q2: Question = {
    id: 'q2',
    mapelId: 'matematika',
    topik: 'Dasar',
    tingkatKesulitan: 'mudah',
    modelSoal: 'pilgan',
    teksSoal: '$2 \\times 2 = ?$',
    pilganKunci: 'B',
    pembahasan: '',
    pembuatId: 'g1',
    pembuatNama: '',
    createdAt: '',
    updatedAt: '',
  };

  const answers: Record<string, StudentAnswerItem> = {
    q1: { questionId: 'q1', modelSoal: 'pilgan', state: 'sudah_dijawab', pilganAnswer: 'A' }, // Correct: 4 pts
    // q2 is unanswered: 0 pts
  };

  const summary = evaluateExamSession([q1, q2], answers, { bobotBenar: 4, bobotSalah: 0, bobotKosong: 0 });
  assert.equal(summary.totalSkor, 4);
  assert.equal(summary.skorMaksimal, 8);
  assert.equal(summary.persentaseNilai, 50);
  assert.equal(summary.jumlahBenar, 1);
  assert.equal(summary.jumlahKosong, 1);
  assert.equal(summary.jumlahSalah, 0);
});
