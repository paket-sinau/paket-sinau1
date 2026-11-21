/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCompletedSessionsChronological,
  computeStudentCurveSummary,
  computeChartPoints,
  generateSmoothCurvePath,
  generateAreaPath,
  resolveStudentKkm,
} from './studentCurveAnalytics';
import { ExamSession } from '../types';

const makeSession = (
  id: string,
  muridId: string,
  mapelId: ExamSession['mapelId'],
  persentaseNilai: number,
  waktuSelesai: string,
  status: ExamSession['status'] = 'selesai'
): ExamSession => ({
  id,
  paketId: 'pkg-1',
  paketJudul: `Tryout ${id}`,
  mapelId,
  muridId,
  muridNama: 'Siswa Uji',
  kelasNama: 'Kelas 6A',
  waktuMulai: waktuSelesai,
  waktuSelesai,
  durasiDetikTerpakai: 1200,
  sisaDetik: 600,
  status,
  answers: {},
  shuffledSoalIds: [],
  jumlahPelanggaranTab: 0,
  persentaseNilai,
  jumlahBenar: 8,
  jumlahSalah: 2,
  jumlahKosong: 0,
});

test('getCompletedSessionsChronological filters by student, completed status, subject, and sorts oldest->newest', () => {
  const sessions: ExamSession[] = [
    makeSession('s3', 'm1', 'ipa', 90, '2026-02-20T10:00:00Z'),
    makeSession('s1', 'm1', 'matematika', 70, '2026-02-01T10:00:00Z'),
    makeSession('s-active', 'm1', 'matematika', 100, '2026-02-25T10:00:00Z', 'berjalan'),
    makeSession('s-other', 'm2', 'matematika', 85, '2026-02-05T10:00:00Z'),
    makeSession('s2', 'm1', 'matematika', 82.5, '2026-02-10T10:00:00Z'),
  ];

  const allM1 = getCompletedSessionsChronological(sessions, 'm1', 'semua');
  assert.deepEqual(
    allM1.map((s) => s.id),
    ['s1', 's2', 's3']
  );

  const mtkM1 = getCompletedSessionsChronological(sessions, 'm1', 'matematika');
  assert.deepEqual(
    mtkM1.map((s) => s.id),
    ['s1', 's2']
  );

  const emptyM3 = getCompletedSessionsChronological(sessions, 'm3', 'semua');
  assert.equal(emptyM3.length, 0);
});

test('computeStudentCurveSummary handles empty, single, and multi-session progression accurately', () => {
  const empty = computeStudentCurveSummary([], 75);
  assert.equal(empty.totalSessions, 0);
  assert.equal(empty.delta, 0);
  assert.equal(empty.passRate, 0);

  const single = computeStudentCurveSummary([
    makeSession('s1', 'm1', 'matematika', 80, '2026-02-01T10:00:00Z'),
  ], 75);
  assert.equal(single.totalSessions, 1);
  assert.equal(single.delta, 0);
  assert.equal(single.passRate, 100);

  const multi = computeStudentCurveSummary([
    makeSession('s1', 'm1', 'matematika', 72.5, '2026-02-01T10:00:00Z'),
    makeSession('s2', 'm1', 'bahasa_indonesia', 80, '2026-02-05T10:00:00Z'),
    makeSession('s3', 'm1', 'ipa', 92.5, '2026-02-10T10:00:00Z'),
  ], 75);
  assert.equal(multi.totalSessions, 3);
  assert.equal(multi.initialScore, 72.5);
  assert.equal(multi.latestScore, 92.5);
  assert.equal(multi.delta, 20);
  assert.equal(multi.avgScore, 82);
  assert.equal(multi.highestScore, 92.5);
  assert.equal(multi.lowestScore, 72.5);
  assert.equal(multi.passedCount, 2);
  assert.equal(multi.passRate, 67);
});

test('computeChartPoints, generateSmoothCurvePath, and generateAreaPath build valid SVG geometry', () => {
  const dims = {
    svgWidth: 800,
    svgHeight: 300,
    paddingLeft: 55,
    paddingRight: 40,
    paddingTop: 30,
    paddingBottom: 45,
  };

  const sessions = [
    makeSession('s1', 'm1', 'matematika', 50, '2026-02-01T10:00:00Z'),
    makeSession('s2', 'm1', 'matematika', 75, '2026-02-02T10:00:00Z'),
    makeSession('s3', 'm1', 'matematika', 100, '2026-02-03T10:00:00Z'),
  ];

  const pts = computeChartPoints(sessions, dims);
  assert.equal(pts.length, 3);
  assert.equal(pts[0].x, 55 + 40);
  assert.equal(pts[2].x, 760 - 40);
  assert.equal(pts[2].y, 30); // 100% is at paddingTop
  assert.equal(pts[0].y, 30 + (300 - 30 - 45) * 0.5); // 50% is middle

  const path = generateSmoothCurvePath(pts);
  assert.ok(path.startsWith('M 95.0'));
  assert.ok(path.includes(' C '));

  const area = generateAreaPath(path, pts, 255);
  assert.ok(area.endsWith('L 720.0 255.0 L 95.0 255.0 Z'));

  assert.equal(generateSmoothCurvePath([]), '');
  assert.equal(generateAreaPath('', [], 255), '');
});

test('resolveStudentKkm prioritizes subject target over general target with 75 default', () => {
  assert.equal(resolveStudentKkm(undefined, 'semua'), 75);
  assert.equal(resolveStudentKkm({ umum: 80, matematika: 85 }, 'semua'), 80);
  assert.equal(resolveStudentKkm({ umum: 80, matematika: 85 }, 'matematika'), 85);
  assert.equal(resolveStudentKkm({ umum: 80, matematika: 85 }, 'ipa'), 80);
});
