/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { INITIAL_PACKAGES, INITIAL_QUESTIONS, INITIAL_SESSIONS } from '../data/seedData';
import { evaluateExamSession } from './examScoring';
import { StudentAnswerItem } from '../types';

test('TKA Matematika SD 2026 seed integrity: 30 questions with valid keys and existing images', () => {
  const mtkQuestions = INITIAL_QUESTIONS.filter((q) => q.mapelId === 'matematika');
  assert.equal(mtkQuestions.length, 30, 'Harus ada tepat 30 soal Matematika TKA SD 2026');

  const ids = mtkQuestions.map((q) => q.id);
  for (let i = 1; i <= 30; i++) {
    assert.ok(ids.includes(`mtk-${i}`), `Soal mtk-${i} harus tersedia`);
  }

  const assetRefs: string[] = [];

  for (const q of mtkQuestions) {
    assert.ok(q.teksSoal.trim().length > 0, `${q.id} teksSoal tidak boleh kosong`);
    assert.ok(q.pembahasan.trim().length > 0, `${q.id} pembahasan tidak boleh kosong`);
    if (q.gambarUrl) assetRefs.push(q.gambarUrl);

    if (q.modelSoal === 'pilgan') {
      assert.ok(q.pilganOptions && q.pilganOptions.length >= 4, `${q.id} harus punya min 4 opsi pilgan`);
      assert.ok(
        q.pilganOptions.some((o) => o.label === q.pilganKunci),
        `${q.id} pilganKunci ${q.pilganKunci} harus ada di pilganOptions`
      );
      q.pilganOptions.forEach((o) => {
        if (o.gambarUrl) assetRefs.push(o.gambarUrl);
      });
    } else if (q.modelSoal === 'mcma') {
      assert.ok(q.mcmaOptions && q.mcmaOptions.length >= 3, `${q.id} harus punya opsi mcma`);
      assert.ok(q.mcmaKunci && q.mcmaKunci.length >= 1, `${q.id} harus punya kunci mcma`);
      q.mcmaKunci.forEach((k) => {
        assert.ok(
          q.mcmaOptions!.some((o) => o.label === k),
          `${q.id} kunci MCMA ${k} harus ada di mcmaOptions`
        );
      });
      q.mcmaOptions.forEach((o) => {
        if (o.gambarUrl) assetRefs.push(o.gambarUrl);
      });
    } else if (q.modelSoal === 'kategori') {
      assert.ok(q.kategoriLabels && q.kategoriLabels.length === 2, `${q.id} harus punya 2 label kategori`);
      assert.ok(q.kategoriPernyataan && q.kategoriPernyataan.length >= 3, `${q.id} harus punya min 3 pernyataan`);
      q.kategoriPernyataan.forEach((stmt) => {
        assert.ok(
          q.kategoriLabels!.includes(stmt.kunciJawaban),
          `${q.id} pernyataan ${stmt.id} kunciJawaban harus cocok kategoriLabels`
        );
        if (stmt.gambarUrl) assetRefs.push(stmt.gambarUrl);
      });
    }
  }

  // Ensure every referenced /assets/math_tka/*.png file exists on disk and is non-empty
  const uniqueAssets = Array.from(new Set(assetRefs));
  assert.ok(uniqueAssets.length >= 30, 'Harus mereferensikan minimal 30 gambar TKA Matematika');
  for (const relUrl of uniqueAssets) {
    assert.ok(relUrl.startsWith('/assets/math_tka/'), `Asset path tidak valid: ${relUrl}`);
    const fullPath = path.resolve(process.cwd(), 'public', relUrl.slice(1));
    assert.ok(fs.existsSync(fullPath), `File gambar hilang: ${fullPath}`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 500, `File gambar terlalu kecil / rusak: ${fullPath}`);
  }
});

test('pkg-1 contains all 30 TKA Matematika questions and achieves 100% with keys', () => {
  const pkg1 = INITIAL_PACKAGES.find((p) => p.id === 'pkg-1');
  assert.ok(pkg1, 'pkg-1 harus ada');
  assert.equal(pkg1.soalIds.length, 30);

  const mtkMap = new Map(
    INITIAL_QUESTIONS.filter((q) => q.mapelId === 'matematika').map((q) => [q.id, q])
  );
  const pkgQuestions = pkg1.soalIds.map((id) => mtkMap.get(id)!);
  assert.ok(pkgQuestions.every(Boolean));

  const perfectAnswers: Record<string, StudentAnswerItem> = {};
  for (const q of pkgQuestions) {
    if (q.modelSoal === 'pilgan') {
      perfectAnswers[q.id] = {
        questionId: q.id,
        modelSoal: 'pilgan',
        state: 'sudah_dijawab',
        pilganAnswer: q.pilganKunci,
      };
    } else if (q.modelSoal === 'mcma') {
      perfectAnswers[q.id] = {
        questionId: q.id,
        modelSoal: 'mcma',
        state: 'sudah_dijawab',
        mcmaAnswer: q.mcmaKunci,
      };
    } else if (q.modelSoal === 'kategori') {
      const map: Record<string, string> = {};
      q.kategoriPernyataan?.forEach((s) => {
        map[s.id] = s.kunciJawaban;
      });
      perfectAnswers[q.id] = {
        questionId: q.id,
        modelSoal: 'kategori',
        state: 'sudah_dijawab',
        kategoriAnswer: map,
      };
    }
  }

  const summary = evaluateExamSession(pkgQuestions, perfectAnswers, pkg1);
  assert.equal(summary.jumlahBenar, 30);
  assert.equal(summary.jumlahSalah, 0);
  assert.equal(summary.jumlahKosong, 0);
  assert.equal(summary.persentaseNilai, 100);
});

test('ses-raditya-mtk-2 sample answers match new mtk-1..mtk-10 models', () => {
  const ses = INITIAL_SESSIONS.find((s) => s.id === 'ses-raditya-mtk-2');
  assert.ok(ses);
  const mtkMap = new Map(INITIAL_QUESTIONS.map((q) => [q.id, q]));
  for (const [qId, ans] of Object.entries(ses.answers)) {
    const q = mtkMap.get(qId);
    assert.ok(q, `Seed session merujuk ke ${qId} yang tidak ada`);
    assert.equal(ans.modelSoal, q.modelSoal, `Model jawaban ${qId} harus cocok dengan modelSoal`);
  }
});
