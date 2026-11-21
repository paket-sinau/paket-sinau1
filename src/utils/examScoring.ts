/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExamPackage, Question, StudentAnswerItem } from '../types';

export interface QuestionScoreResult {
  isFullyCorrect: boolean;
  scoreAwarded: number;
  maxScorePossible: number;
  isAnswered: boolean;
  details?: string;
}

/**
 * Menghitung skor untuk 1 butir soal berdasarkan model soal dan aturan paket ujian.
 */
export function calculateQuestionScore(
  question: Question,
  studentAnswer: StudentAnswerItem | undefined,
  examPackage: Pick<ExamPackage, 'bobotBenar' | 'bobotSalah' | 'bobotKosong'>
): QuestionScoreResult {
  const bobotBenar = examPackage.bobotBenar ?? 4;
  const bobotSalah = examPackage.bobotSalah ?? 0;
  const bobotKosong = examPackage.bobotKosong ?? 0;

  // Jika belum dijawab sama sekali
  if (!studentAnswer) {
    return {
      isFullyCorrect: false,
      scoreAwarded: bobotKosong,
      maxScorePossible: bobotBenar,
      isAnswered: false,
      details: 'Tidak dijawab',
    };
  }

  // Model 1: PILIHAN GANDA (PILGAN)
  if (question.modelSoal === 'pilgan') {
    const ans = studentAnswer.pilganAnswer;
    if (!ans) {
      return {
        isFullyCorrect: false,
        scoreAwarded: bobotKosong,
        maxScorePossible: bobotBenar,
        isAnswered: false,
        details: 'Kosong',
      };
    }

    const isCorrect = ans.trim().toUpperCase() === (question.pilganKunci || '').trim().toUpperCase();
    return {
      isFullyCorrect: isCorrect,
      scoreAwarded: isCorrect ? bobotBenar : bobotSalah,
      maxScorePossible: bobotBenar,
      isAnswered: true,
      details: isCorrect ? 'Benar' : 'Salah',
    };
  }

  // Model 2: PILIHAN GANDA KOMPLEKS (MCMA)
  if (question.modelSoal === 'mcma') {
    const ansList = studentAnswer.mcmaAnswer || [];
    if (ansList.length === 0) {
      return {
        isFullyCorrect: false,
        scoreAwarded: bobotKosong,
        maxScorePossible: bobotBenar,
        isAnswered: false,
        details: 'Kosong',
      };
    }

    const kunci = question.mcmaKunci || [];
    const kunciSet = new Set(kunci.map((k) => k.trim().toUpperCase()));
    const userSet = new Set(ansList.map((a) => a.trim().toUpperCase()));

    // Mode: Semua harus benar
    if (question.mcmaScoringMode === 'all_or_nothing') {
      const isExactMatch =
        kunciSet.size === userSet.size &&
        [...kunciSet].every((k) => userSet.has(k));

      return {
        isFullyCorrect: isExactMatch,
        scoreAwarded: isExactMatch ? bobotBenar : bobotSalah,
        maxScorePossible: bobotBenar,
        isAnswered: true,
        details: isExactMatch ? 'Semua opsi benar' : 'Sebagian salah',
      };
    }

    // Mode: Proporsional (Partial credit)
    // C = opsi benar yang dipilih user
    // W = opsi salah yang dipilih user
    // K = total kunci benar
    let correctPicks = 0;
    let wrongPicks = 0;

    userSet.forEach((item) => {
      if (kunciSet.has(item)) {
        correctPicks++;
      } else {
        wrongPicks++;
      }
    });

    const totalKunci = Math.max(1, kunciSet.size);
    // Formula proporsional dengan penalti opsi salah
    const rawRatio = (correctPicks - wrongPicks) / totalKunci;
    const finalRatio = Math.max(0, Math.min(1, rawRatio));
    const score = Number((finalRatio * bobotBenar).toFixed(2));
    const isFully = correctPicks === totalKunci && wrongPicks === 0;

    return {
      isFullyCorrect: isFully,
      scoreAwarded: score,
      maxScorePossible: bobotBenar,
      isAnswered: true,
      details: `${correctPicks}/${totalKunci} benar, ${wrongPicks} salah`,
    };
  }

  // Model 3: KATEGORI (Tabel Pernyataan 2 Kolom)
  if (question.modelSoal === 'kategori') {
    const userMap = studentAnswer.kategoriAnswer || {};
    const statements = question.kategoriPernyataan || [];

    if (statements.length === 0) {
      return {
        isFullyCorrect: true,
        scoreAwarded: bobotBenar,
        maxScorePossible: bobotBenar,
        isAnswered: true,
      };
    }

    const answeredCount = Object.keys(userMap).length;
    if (answeredCount === 0) {
      return {
        isFullyCorrect: false,
        scoreAwarded: bobotKosong,
        maxScorePossible: bobotBenar,
        isAnswered: false,
        details: 'Kosong',
      };
    }

    let correctRows = 0;
    statements.forEach((stmt) => {
      const userChoice = userMap[stmt.id];
      if (
        userChoice &&
        userChoice.trim().toLowerCase() === stmt.kunciJawaban.trim().toLowerCase()
      ) {
        correctRows++;
      }
    });

    const isAllCorrect = correctRows === statements.length;

    // Mode: Semua baris harus benar
    if (question.kategoriScoringMode === 'all_or_nothing') {
      return {
        isFullyCorrect: isAllCorrect,
        scoreAwarded: isAllCorrect ? bobotBenar : bobotSalah,
        maxScorePossible: bobotBenar,
        isAnswered: true,
        details: isAllCorrect ? 'Semua baris tepat' : 'Ada baris keliru',
      };
    }

    // Mode: Parsial per baris (per_row)
    const ratio = correctRows / statements.length;
    const score = Number((ratio * bobotBenar).toFixed(2));

    return {
      isFullyCorrect: isAllCorrect,
      scoreAwarded: score,
      maxScorePossible: bobotBenar,
      isAnswered: true,
      details: `${correctRows}/${statements.length} baris tepat`,
    };
  }

  return {
    isFullyCorrect: false,
    scoreAwarded: bobotKosong,
    maxScorePossible: bobotBenar,
    isAnswered: false,
  };
}

export interface ExamEvaluationSummary {
  totalSkor: number;
  skorMaksimal: number;
  persentaseNilai: number;
  jumlahBenar: number;
  jumlahSalah: number;
  jumlahKosong: number;
  answers: Record<string, StudentAnswerItem>;
}

/**
 * Menghitung keseluruhan hasil ujian untuk satu paket dan jawaban murid.
 */
export function evaluateExamSession(
  questions: Question[],
  answersMap: Record<string, StudentAnswerItem>,
  examPackage: Pick<ExamPackage, 'bobotBenar' | 'bobotSalah' | 'bobotKosong'>
): ExamEvaluationSummary {
  let totalSkor = 0;
  let skorMaksimal = 0;
  let jumlahBenar = 0;
  let jumlahSalah = 0;
  let jumlahKosong = 0;

  const evaluatedAnswers: Record<string, StudentAnswerItem> = {};

  questions.forEach((q) => {
    const rawAnswer = answersMap[q.id];
    const result = calculateQuestionScore(q, rawAnswer, examPackage);

    skorMaksimal += result.maxScorePossible;
    totalSkor += result.scoreAwarded;

    if (!result.isAnswered) {
      jumlahKosong++;
    } else if (result.isFullyCorrect) {
      jumlahBenar++;
    } else {
      jumlahSalah++;
    }

    evaluatedAnswers[q.id] = {
      ...(rawAnswer || {
        questionId: q.id,
        modelSoal: q.modelSoal,
        state: 'belum_dijawab',
      }),
      isFullyCorrect: result.isFullyCorrect,
      scoreAwarded: result.scoreAwarded,
      maxScorePossible: result.maxScorePossible,
    };
  });

  const rawPercentage = skorMaksimal > 0 ? (totalSkor / skorMaksimal) * 100 : 0;
  const persentaseNilai = Number(Math.max(0, Math.min(100, rawPercentage)).toFixed(1));

  return {
    totalSkor: Number(totalSkor.toFixed(2)),
    skorMaksimal: Number(skorMaksimal.toFixed(2)),
    persentaseNilai,
    jumlahBenar,
    jumlahSalah,
    jumlahKosong,
    answers: evaluatedAnswers,
  };
}

/**
 * Format detik menjadi jam:menit:detik atau mm:ss
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `${h.toString().padStart(2, '0')}:${remM.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
