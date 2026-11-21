/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDuration } from '../../utils/examScoring';
import { SUBJECTS } from '../../data/seedData';
import { StudentPerformanceProgress } from '../../components/StudentPerformanceProgress';
import {
  Clock,
  Award,
  TrendingUp,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const RiwayatMuridPage: React.FC = () => {
  const {
    currentUser,
    sessions,
    packages,
    setSelectedSessionId,
    setActiveView,
    startExam,
  } = useApp();

  const [selectedMapelFilter, setSelectedMapelFilter] = useState<string>('semua');

  if (!currentUser) return null;

  // Filter completed sessions for this student
  const studentSessions = sessions
    .filter((s) => s.muridId === currentUser.id && s.status === 'selesai')
    .sort((a, b) => new Date(b.waktuSelesai || '').getTime() - new Date(a.waktuSelesai || '').getTime());

  const filteredSessions = studentSessions.filter((s) => {
    if (selectedMapelFilter !== 'semua' && s.mapelId !== selectedMapelFilter) {
      return false;
    }
    return true;
  });

  // Calculate subject averages
  const statsPerSubject = SUBJECTS.map((sub) => {
    const subSessions = studentSessions.filter((s) => s.mapelId === sub.id);
    const count = subSessions.length;
    const avg =
      count > 0
        ? Math.round(subSessions.reduce((acc, curr) => acc + (curr.persentaseNilai || 0), 0) / count)
        : 0;
    const highest =
      count > 0 ? Math.max(...subSessions.map((s) => s.persentaseNilai || 0)) : 0;
    return { ...sub, count, avg, highest };
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span>Riwayat Ujian & Progres Nilai</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Pantau perkembangan nilai ujian dan evaluasi butir soal yang telah kamu kerjakan.
            </p>
          </div>
        </div>

        {/* Diagram Tolok Ukur & Batasan KKM Mandiri */}
        <StudentPerformanceProgress />

        {/* 3 Subject Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsPerSubject.map((stat) => {
            const isMTK = stat.id === 'matematika';
            const isBIND = stat.id === 'bahasa_indonesia';

            return (
              <div
                key={stat.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {stat.nama}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                    {stat.count} Sesi
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {stat.avg} <span className="text-xs font-normal text-slate-400">Rata-rata</span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-600">
                    Tertinggi: {stat.highest}
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isMTK ? 'bg-indigo-600' : isBIND ? 'bg-violet-600' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.max(5, stat.avg)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-indigo-600" />
            <span>Daftar Sesi Ujian ({filteredSessions.length})</span>
          </h2>

          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedMapelFilter('semua')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedMapelFilter === 'semua'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setSelectedMapelFilter('matematika')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedMapelFilter === 'matematika'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Matematika
            </button>
            <button
              type="button"
              onClick={() => setSelectedMapelFilter('bahasa_indonesia')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedMapelFilter === 'bahasa_indonesia'
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              B. Indonesia
            </button>
            <button
              type="button"
              onClick={() => setSelectedMapelFilter('ipa')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedMapelFilter === 'ipa'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              IPA
            </button>
          </div>
        </div>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
            <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Belum ada riwayat untuk kategori ini
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Silakan ambil paket ujian di menu Paket Soal.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((ses) => {
              const dateStr = new Date(ses.waktuSelesai || ses.waktuMulai).toLocaleDateString(
                'id-ID',
                {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              );

              return (
                <div
                  key={ses.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {ses.mapelId.replace('_', ' ')}
                      </span>
                      <span>·</span>
                      <span>{dateStr}</span>
                      <span>·</span>
                      <span>Waktu: {formatDuration(ses.durasiDetikTerpakai)}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {ses.paketJudul}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <span>Benar: <strong className="text-emerald-600">{ses.jumlahBenar}</strong></span>
                      <span>Salah: <strong className="text-rose-600">{ses.jumlahSalah}</strong></span>
                      <span>Kosong: <strong>{ses.jumlahKosong}</strong></span>
                      {ses.jumlahPelanggaranTab > 0 && (
                        <span className="text-amber-600 text-[11px]">
                          (Pelanggaran tab: {ses.jumlahPelanggaranTab}x)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                        {ses.persentaseNilai} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Skor Akhir</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSessionId(ses.id);
                        setActiveView('murid-hasil');
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-semibold transition-colors"
                    >
                      <span>Lihat Pembahasan</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
