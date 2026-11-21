/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SubjectId } from '../types';
import { SUBJECTS } from '../data/seedData';
import { StudentProgressCurve } from './StudentProgressCurve';
import {
  TrendingUp,
  Target,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Edit3,
  Sliders,
  Check,
  Zap,
  LineChart,
} from 'lucide-react';

interface StudentPerformanceProgressProps {
  compact?: boolean;
}

export const StudentPerformanceProgress: React.FC<StudentPerformanceProgressProps> = ({
  compact = false,
}) => {
  const { currentUser, sessions, updateStudentKkm, setSelectedSessionId, setActiveView } = useApp();

  const [activeTab, setActiveTab] = useState<'kurva_nilai' | 'per_mapel' | 'riwayat_tren'>('kurva_nilai');
  const [isEditingKkm, setIsEditingKkm] = useState(false);
  const [selectedSubjectTrend, setSelectedSubjectTrend] = useState<string>('semua');

  // Local state for KKM inputs while editing
  const [tempKkm, setTempKkm] = useState<{
    umum: number;
    matematika: number;
    bahasa_indonesia: number;
    ipa: number;
  }>({
    umum: currentUser?.customKkm?.umum ?? 75,
    matematika: currentUser?.customKkm?.matematika ?? 75,
    bahasa_indonesia: currentUser?.customKkm?.bahasa_indonesia ?? 75,
    ipa: currentUser?.customKkm?.ipa ?? 75,
  });

  if (!currentUser || currentUser.role !== 'murid') return null;

  // Completed sessions of the current student sorted chronologically ascending for trends
  const studentSessions = sessions
    .filter((s) => s.muridId === currentUser.id && s.status === 'selesai')
    .sort((a, b) => new Date(a.waktuSelesai || '').getTime() - new Date(b.waktuSelesai || '').getTime());

  const handleOpenEditKkm = () => {
    setTempKkm({
      umum: currentUser.customKkm?.umum ?? 75,
      matematika: currentUser.customKkm?.matematika ?? 75,
      bahasa_indonesia: currentUser.customKkm?.bahasa_indonesia ?? 75,
      ipa: currentUser.customKkm?.ipa ?? 75,
    });
    setIsEditingKkm(true);
  };

  const handleSaveKkm = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentKkm({
      umum: Math.min(100, Math.max(0, Number(tempKkm.umum) || 75)),
      matematika: Math.min(100, Math.max(0, Number(tempKkm.matematika) || 75)),
      bahasa_indonesia: Math.min(100, Math.max(0, Number(tempKkm.bahasa_indonesia) || 75)),
      ipa: Math.min(100, Math.max(0, Number(tempKkm.ipa) || 75)),
    });
    setIsEditingKkm(false);
  };

  // Get active student KKM for a subject (fallback to general KKM)
  const getSubjectKkm = (mapelId: SubjectId): number => {
    if (currentUser.customKkm && currentUser.customKkm[mapelId] !== undefined) {
      return currentUser.customKkm[mapelId]!;
    }
    return currentUser.customKkm?.umum ?? 75;
  };

  // Calculate statistics per subject
  const subjectStats = SUBJECTS.map((sub) => {
    const subSessions = studentSessions.filter((s) => s.mapelId === sub.id);
    const count = subSessions.length;
    const scores = subSessions.map((s) => s.persentaseNilai || 0);
    const avg = count > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / count) : 0;
    const highest = count > 0 ? Math.max(...scores) : 0;
    const lowest = count > 0 ? Math.min(...scores) : 0;
    const targetKkm = getSubjectKkm(sub.id);
    const isAboveKkm = avg >= targetKkm;
    const gap = avg - targetKkm;

    return {
      ...sub,
      count,
      avg,
      highest,
      lowest,
      targetKkm,
      isAboveKkm,
      gap,
      recentScores: scores.slice(-5), // last 5 sessions
    };
  });

  // Overall student average
  const totalCompleted = studentSessions.length;
  const overallAvg =
    totalCompleted > 0
      ? Math.round(
          studentSessions.reduce((acc, curr) => acc + (curr.persentaseNilai || 0), 0) /
            totalCompleted
        )
      : 0;
  const generalKkm = currentUser.customKkm?.umum ?? 75;
  const isOverallPassed = overallAvg >= generalKkm;

  // Filtered sessions for chronological trend chart
  const trendSessions = studentSessions.filter((s) => {
    if (selectedSubjectTrend !== 'semua' && s.mapelId !== selectedSubjectTrend) {
      return false;
    }
    return true;
  });

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-all">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-500/5 via-indigo-500/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              <TrendingUp className="h-5 w-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Diagram Tolok Ukur & Progres Belajar
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pantau capaian nilai ujianmu terhadap batas KKM target yang dapat kamu atur sendiri.
          </p>
        </div>

        {/* Action button to adjust KKM */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenEditKkm}
            className="flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors shadow-xs"
            title="Ubah Target Batas KKM Pribadi"
          >
            <Sliders className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Atur Batasan KKM</span>
          </button>
        </div>
      </div>

      {/* KKM Quick Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs">
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-400 block mb-0.5">Rata-Rata Seluruh Ujian</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              {overallAvg}%
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isOverallPassed
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
              }`}
            >
              {isOverallPassed ? 'TUNTAS' : 'BELUM TUNTAS'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Target KKM Umum: <strong>{generalKkm}</strong>
          </span>
        </div>

        {subjectStats.map((st) => (
          <div
            key={st.id}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs"
          >
            <span className="text-[11px] text-slate-400 block truncate mb-0.5">{st.nama}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                {st.avg}%
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  st.isAboveKkm
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                }`}
              >
                {st.isAboveKkm ? `+${st.gap}` : `${st.gap}`}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              KKM Target: <strong>{st.targetKkm}</strong> ({st.count} Sesi)
            </span>
          </div>
        ))}
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('kurva_nilai')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'kurva_nilai'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LineChart className="h-3.5 w-3.5" />
            <span>Kurva Perkembangan Nilai</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('per_mapel')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'per_mapel'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Diagram Bar & Garis KKM Mapel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('riwayat_tren')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'riwayat_tren'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Grafik Batang Tiap Sesi
          </button>
        </div>

        {activeTab === 'riwayat_tren' && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Mapel:</span>
            <select
              value={selectedSubjectTrend}
              onChange={(e) => setSelectedSubjectTrend(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 px-2 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="semua">Semua Mata Pelajaran</option>
              <option value="matematika">Matematika</option>
              <option value="bahasa_indonesia">Bahasa Indonesia</option>
              <option value="ipa">IPA (IPAS)</option>
            </select>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 sm:p-6">
        {activeTab === 'kurva_nilai' ? (
          <div className="-m-5 sm:-m-6">
            <StudentProgressCurve
              studentId={currentUser.id}
              compact={compact}
              onOpenSessionDetail={(sessionId) => {
                setSelectedSessionId(sessionId);
                setActiveView('murid-hasil');
              }}
            />
          </div>
        ) : activeTab === 'per_mapel' ? (
          <div className="space-y-6">
            {/* Subject Benchmark Visual Chart */}
            <div className="space-y-5">
              {subjectStats.map((sub) => {
                const isMTK = sub.id === 'matematika';
                const isBIND = sub.id === 'bahasa_indonesia';
                const barColor = isMTK
                  ? 'bg-indigo-600 dark:bg-indigo-500'
                  : isBIND
                  ? 'bg-violet-600 dark:bg-violet-500'
                  : 'bg-emerald-600 dark:bg-emerald-500';

                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            isMTK ? 'bg-indigo-500' : isBIND ? 'bg-violet-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {sub.nama}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({sub.count} kali ujian)
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <div className="text-slate-500 dark:text-slate-400">
                          Target KKM:{' '}
                          <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                            {sub.targetKkm}
                          </span>
                        </div>
                        <div className="text-slate-900 dark:text-white">
                          Capaian:{' '}
                          <span className="font-extrabold font-mono text-sm">{sub.avg}%</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[10px] flex items-center gap-1 ${
                            sub.isAboveKkm
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {sub.isAboveKkm ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Melampaui KKM (+{sub.gap})</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3" />
                              <span>Di Bawah KKM ({sub.gap})</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Gauge Bar with KKM Target Pin/Marker */}
                    <div className="relative pt-4 pb-1">
                      {/* Bar Track */}
                      <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
                        {/* Student Progress Fill */}
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                          style={{ width: `${Math.min(100, Math.max(0, sub.avg))}%` }}
                        />
                      </div>

                      {/* KKM Marker Line & Badge */}
                      <div
                        className="absolute top-0 bottom-0 pointer-events-none transition-all duration-500 flex flex-col items-center"
                        style={{ left: `${Math.min(96, Math.max(4, sub.targetKkm))}%` }}
                      >
                        <span className="text-[9px] font-bold font-mono px-1 py-0.2 rounded bg-amber-500 text-white shadow-xs -translate-x-1/2 -top-1 absolute">
                          KKM: {sub.targetKkm}
                        </span>
                        <div className="w-0.5 h-full bg-amber-500 ring-1 ring-amber-300 dark:ring-amber-800" />
                      </div>
                    </div>

                    {/* Scale Guide Labels */}
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
                      <span>0 (Mulai)</span>
                      <span>50 (Sedang)</span>
                      <span className="text-amber-500 font-semibold">KKM: {sub.targetKkm}</span>
                      <span>100 (Sempurna)</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Motivational Advice for Students */}
            <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
              <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-0.5 font-bold">Tips Mencapai Nilai Impian:</strong>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                  Batas KKM adalah tolok ukur pribadimu. Jika nilaimu sudah melewati garis KKM kuning, pertahankan dan coba tantang dirimu menaikkan target KKM di tombol <em>"Atur Batasan KKM"</em>. Periksa kembali butir soal yang salah di menu <strong>Riwayat & Hasil</strong> untuk memahami pembahasannya!
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Historical Trend Visual Chart */
          <div className="space-y-4">
            {trendSessions.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <HelpCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">Belum ada riwayat ujian yang selesai untuk mapel ini.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Urutan Ujian (Terdahulu → Terbaru)</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-600" />
                      <span>Nilai Siswa</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-4 border-b-2 border-dashed border-amber-500" />
                      <span>Batas KKM</span>
                    </span>
                  </div>
                </div>

                {/* Vertical Bar Chart of Sittings */}
                <div className="h-56 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 flex items-end justify-between gap-2 relative">
                  {/* Dashed KKM reference line */}
                  <div
                    className="absolute left-0 right-0 border-b-2 border-dashed border-amber-500/80 z-10 pointer-events-none flex items-center justify-end pr-2"
                    style={{ bottom: `${generalKkm}%` }}
                  >
                    <span className="text-[10px] font-mono font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded shadow-2xs">
                      KKM {generalKkm}
                    </span>
                  </div>

                  {trendSessions.map((ses, idx) => {
                    const score = ses.persentaseNilai || 0;
                    const mapelKkm = getSubjectKkm(ses.mapelId);
                    const passed = score >= mapelKkm;

                    return (
                      <div
                        key={ses.id}
                        className="flex-1 flex flex-col items-center h-full justify-end group relative"
                      >
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-lg whitespace-nowrap">
                          <div className="font-bold">{ses.paketJudul}</div>
                          <div>
                            Nilai: {score}% · KKM: {mapelKkm} ({passed ? 'Lulus' : 'Belum'})
                          </div>
                        </div>

                        {/* Value label above bar */}
                        <span className="text-[10px] font-bold font-mono mb-1 text-slate-700 dark:text-slate-300">
                          {score}
                        </span>

                        {/* Bar */}
                        <div
                          className={`w-full max-w-[36px] rounded-t-lg transition-all duration-500 ${
                            passed
                              ? 'bg-gradient-to-t from-emerald-600 to-teal-500'
                              : 'bg-gradient-to-t from-amber-600 to-rose-500'
                          }`}
                          style={{ height: `${Math.max(8, score)}%` }}
                        />

                        {/* Date label */}
                        <span className="text-[9px] font-mono text-slate-400 mt-2 truncate max-w-[45px]">
                          #{idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Dialog for Editing Student KKM */}
      {isEditingKkm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Atur Batasan KKM Pribadi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingKkm(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Tentukan nilai batas minimal (KKM) yang ingin kamu capai untuk memicu semangat belajarmu. Diagram pencapaian akan langsung menyesuaikan garis batasnya.
            </p>

            <form onSubmit={handleSaveKkm} className="space-y-4 pt-4 text-xs">
              {/* KKM Umum */}
              <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Target KKM Umum (Seluruh Ujian)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="40"
                    max="100"
                    value={tempKkm.umum}
                    onChange={(e) =>
                      setTempKkm({ ...tempKkm, umum: parseInt(e.target.value) || 0 })
                    }
                    className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-center font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500">Nilai standar (Contoh: 75)</span>
                </div>
              </div>

              {/* Per Mapel Overrides */}
              <div className="space-y-3 pt-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px]">
                  Target Spesifik Tiap Mata Pelajaran:
                </span>

                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Matematika Dasar & Berhitung
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="100"
                    value={tempKkm.matematika}
                    onChange={(e) =>
                      setTempKkm({ ...tempKkm, matematika: parseInt(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 font-mono font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Bahasa Indonesia & Literasi Membaca
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="100"
                    value={tempKkm.bahasa_indonesia}
                    onChange={(e) =>
                      setTempKkm({ ...tempKkm, bahasa_indonesia: parseInt(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 font-mono font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Ilmu Pengetahuan Alam (IPA / IPAS)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="100"
                    value={tempKkm.ipa}
                    onChange={(e) =>
                      setTempKkm({ ...tempKkm, ipa: parseInt(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 font-mono font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingKkm(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-semibold shadow-xs"
                >
                  <Check className="h-4 w-4" />
                  <span>Simpan Target KKM</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
