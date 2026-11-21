/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MathRenderer } from '../../components/MathRenderer';
import { formatDuration } from '../../utils/examScoring';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Printer,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const ExamResultPage: React.FC = () => {
  const {
    selectedSessionId,
    sessions,
    questions,
    packages,
    setActiveView,
    startExam,
  } = useApp();

  const [filterMode, setFilterMode] = useState<'semua' | 'salah' | 'benar'>('semua');

  // Find session to display
  const session = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const pkg = session ? packages.find((p) => p.id === session.paketId) : null;

  // Trigger confetti if high score
  useEffect(() => {
    if (session && (session.persentaseNilai || 0) >= 75) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <HelpCircle className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Tidak ada data hasil ujian</h2>
          <button
            type="button"
            onClick={() => setActiveView('murid-paket')}
            className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Kembali ke Daftar Paket
          </button>
        </div>
      </div>
    );
  }

  const sessionQuestions = session.shuffledSoalIds
    .map((id) => questions.find((q) => q.id === id))
    .filter((q) => Boolean(q));

  const filteredQuestions = sessionQuestions.filter((q) => {
    if (!q) return false;
    const ans = session.answers[q.id];
    if (filterMode === 'benar') return ans?.isFullyCorrect;
    if (filterMode === 'salah') return !ans?.isFullyCorrect;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const isGoodScore = (session.persentaseNilai || 0) >= 70;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 print:bg-white print:text-black">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Navigation Action */}
        <div className="flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={() => setActiveView('murid-paket')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Paket Ujian</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Hasil (PDF)</span>
            </button>

            {pkg && (
              <button
                type="button"
                onClick={() => startExam(pkg.id)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Ulangi Ujian</span>
              </button>
            )}
          </div>
        </div>

        {/* Big Score Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6 text-center sm:text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                <Sparkles className="h-4 w-4" />
                <span>LEMBAR HASIL EVALUASI CBT</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {session.paketJudul}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Peserta: <strong>{session.muridNama}</strong> · Kelas: <strong>{session.kelasNama}</strong> · Selesai pada: {new Date(session.waktuSelesai || '').toLocaleString('id-ID')}
              </p>
            </div>

            {/* Score Ring / Pill */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-24 w-24 items-center justify-center rounded-2xl font-mono text-3xl font-extrabold shadow-md ${
                  isGoodScore
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-amber-500 text-white shadow-amber-500/20'
                }`}
              >
                {session.persentaseNilai}
              </div>
              <span className="text-[11px] font-semibold text-slate-400 mt-1">SKOR DARI 100</span>
            </div>
          </div>

          {/* Stats Breakdown Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-center text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-semibold">Jawaban Benar</span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                {session.jumlahBenar} <span className="text-xs font-normal text-slate-400">soal</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50">
              <div className="flex items-center justify-center gap-1 text-rose-600 mb-1">
                <XCircle className="h-4 w-4" />
                <span className="font-semibold">Jawaban Salah</span>
              </div>
              <div className="text-2xl font-bold font-mono text-rose-700 dark:text-rose-300">
                {session.jumlahSalah} <span className="text-xs font-normal text-slate-400">soal</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400 mb-1">
                <HelpCircle className="h-4 w-4" />
                <span className="font-semibold">Tidak Dijawab</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-300">
                {session.jumlahKosong} <span className="text-xs font-normal text-slate-400">soal</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center justify-center gap-1 text-indigo-600 mb-1">
                <Clock className="h-4 w-4" />
                <span className="font-semibold">Waktu Terpakai</span>
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-700 dark:text-indigo-300">
                {formatDuration(session.durasiDetikTerpakai)}
              </div>
            </div>
          </div>

          {session.jumlahPelanggaranTab > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <span>⚠️ Tercatat <strong>{session.jumlahPelanggaranTab} kali</strong> perpindahan tab selama sesi ujian berlangsung.</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900">
                Integritas CBT
              </span>
            </div>
          )}
        </div>

        {/* Pembahasan & Review Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <span>Pembahasan Butir Soal ({filteredQuestions.length})</span>
            </h2>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold print:hidden">
              <button
                type="button"
                onClick={() => setFilterMode('semua')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterMode === 'semua'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Semua Soal
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('salah')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterMode === 'salah'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Hanya yang Salah ({session.jumlahSalah})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('benar')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterMode === 'benar'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Hanya yang Benar ({session.jumlahBenar})
              </button>
            </div>
          </div>

          {/* Questions list with solutions */}
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              if (!q) return null;
              const ans = session.answers[q.id];
              const isCorrect = ans?.isFullyCorrect;

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-5 bg-white dark:bg-slate-900 space-y-4 shadow-xs transition-colors ${
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-900/60'
                      : 'border-rose-200 dark:border-rose-900/60'
                  }`}
                >
                  {/* Question header */}
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Soal Nomor {idx + 1}
                      </span>
                      <span>·</span>
                      <span className="text-slate-500 font-medium">{q.topik}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`flex items-center gap-1 font-bold text-xs px-2.5 py-0.5 rounded-full ${
                          isCorrect
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Benar (+{ans?.scoreAwarded ?? 4} Poin)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Belum Tepat ({ans?.scoreAwarded ?? 0} Poin)</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                    <MathRenderer content={q.teksSoal} />
                  </div>

                  {/* Question Image if any */}
                  {q.gambarUrl && (
                    <div className="max-w-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white p-1.5">
                      <img
                        src={q.gambarUrl}
                        alt={q.gambarAlt || 'Gambar Soal'}
                        className="w-full h-auto object-contain max-h-64"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Answers review based on model */}
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 text-xs space-y-2 border border-slate-200 dark:border-slate-700">
                    {q.modelSoal === 'pilgan' && (() => {
                      const pickedOpt = q.pilganOptions?.find((o) => o.label === ans?.pilganAnswer);
                      const keyOpt = q.pilganOptions?.find((o) => o.label === q.pilganKunci);
                      return (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-slate-500">Jawaban Anda:</span>
                            <span
                              className={`font-bold font-mono px-2 py-0.5 rounded ${
                                isCorrect ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                              }`}
                            >
                              {ans?.pilganAnswer || 'Tidak Dijawab'}
                            </span>
                            {pickedOpt?.teks && (
                              <span className="text-slate-700 dark:text-slate-300">
                                (<MathRenderer content={pickedOpt.teks} inline />)
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-slate-500">Kunci Jawaban:</span>
                            <span className="font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {q.pilganKunci}
                            </span>
                            {keyOpt?.teks && (
                              <span className="text-slate-700 dark:text-slate-300 font-semibold">
                                (<MathRenderer content={keyOpt.teks} inline />)
                              </span>
                            )}
                          </div>
                          {(pickedOpt?.gambarUrl || keyOpt?.gambarUrl) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              {pickedOpt?.gambarUrl && (
                                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-2">
                                  <div className="text-[10px] font-bold text-slate-500 mb-1">
                                    Gambar Pilihan Anda ({pickedOpt.label}):
                                  </div>
                                  <img
                                    src={pickedOpt.gambarUrl}
                                    alt={`Pilihan Anda ${pickedOpt.label}`}
                                    className="max-h-36 w-auto object-contain"
                                    loading="lazy"
                                  />
                                </div>
                              )}
                              {keyOpt?.gambarUrl && (
                                <div className="rounded-lg border border-emerald-300 bg-white p-2">
                                  <div className="text-[10px] font-bold text-emerald-700 mb-1">
                                    Gambar Kunci Jawaban ({keyOpt.label}):
                                  </div>
                                  <img
                                    src={keyOpt.gambarUrl}
                                    alt={`Kunci ${keyOpt.label}`}
                                    className="max-h-36 w-auto object-contain"
                                    loading="lazy"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {q.modelSoal === 'mcma' && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Pilihan Anda:</span>
                          <span className="font-bold font-mono">
                            {ans?.mcmaAnswer && ans.mcmaAnswer.length > 0
                              ? ans.mcmaAnswer.join(', ')
                              : 'Tidak Dijawab'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Kunci Jawaban Benar:</span>
                          <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {q.mcmaKunci?.join(', ')}
                          </span>
                        </div>
                      </div>
                    )}

                    {q.modelSoal === 'kategori' && (
                      <div className="space-y-1.5">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          Evaluasi Pernyataan Kategori:
                        </div>
                        <div className="space-y-1.5">
                          {q.kategoriPernyataan?.map((stmt) => {
                            const userPick = ans?.kategoriAnswer?.[stmt.id];
                            const isMatch = userPick === stmt.kunciJawaban;
                            return (
                              <div
                                key={stmt.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 px-2.5 rounded-lg bg-white dark:bg-slate-800 text-[11px]"
                              >
                                <div className="space-y-1.5 flex-1">
                                  <div className="text-slate-700 dark:text-slate-300">
                                    <MathRenderer content={stmt.teks} inline />
                                  </div>
                                  {stmt.gambarUrl && (
                                    <img
                                      src={stmt.gambarUrl}
                                      alt={stmt.teks}
                                      className="max-h-24 w-auto rounded border border-slate-200 bg-white p-1"
                                      loading="lazy"
                                    />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-slate-400">
                                    Pilihan: <strong>{userPick || '-'}</strong>
                                  </span>
                                  <span className="text-emerald-600 font-semibold">
                                    Kunci: {stmt.kunciJawaban}
                                  </span>
                                  {isMatch ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                  ) : (
                                    <XCircle className="h-3.5 w-3.5 text-rose-500" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comprehensive Step-by-Step Explanation */}
                  <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                      <Award className="h-4 w-4" />
                      <span>Pembahasan Lengkap & Langkah Solusi:</span>
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-loose font-serif whitespace-pre-line">
                      <MathRenderer content={q.pembahasan || 'Pembahasan belum tersedia untuk butir ini.'} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
