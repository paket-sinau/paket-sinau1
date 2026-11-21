/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { SUBJECTS } from '../data/seedData';
import { StudentPerformanceProgress } from '../components/StudentPerformanceProgress';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  FilePlus,
  Play,
  Award,
  Users,
  Layers,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const BerandaPage: React.FC = () => {
  const {
    currentUser,
    setActiveView,
    packages,
    questions,
    sessions,
    users,
    announcements,
    activeSession,
    setSelectedSessionId,
    startExam,
  } = useApp();

  if (!currentUser) return null;

  // Indonesian date formatter
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Murid statistics (sorted newest -> oldest)
  const studentSessions = sessions
    .filter((s) => s.muridId === currentUser.id && s.status === 'selesai')
    .sort(
      (a, b) =>
        new Date(b.waktuSelesai || b.waktuMulai).getTime() -
        new Date(a.waktuSelesai || a.waktuMulai).getTime()
    );
  const latestSession = studentSessions[0];

  // Calculate student average per subject
  const getSubjectAverage = (mapelId: string) => {
    const subSessions = studentSessions.filter((s) => s.mapelId === mapelId);
    if (subSessions.length === 0) return 0;
    const sum = subSessions.reduce((acc, curr) => acc + (curr.persentaseNilai || 0), 0);
    return Math.round(sum / subSessions.length);
  };

  // Guru statistics
  const mtkCount = questions.filter((q) => q.mapelId === 'matematika').length;
  const bindCount = questions.filter((q) => q.mapelId === 'bahasa_indonesia').length;
  const ipaCount = questions.filter((q) => q.mapelId === 'ipa').length;
  const allCompletedSessions = sessions.filter((s) => s.status === 'selesai');
  const classAvgScore =
    allCompletedSessions.length > 0
      ? Math.round(
          allCompletedSessions.reduce((acc, curr) => acc + (curr.persentaseNilai || 0), 0) /
            allCompletedSessions.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Top Header Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="uppercase tracking-wider">PAKET SINAU CBT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Selamat Datang, {currentUser.nama}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>{todayFormatted}</span>
              <span>·</span>
              <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                Peran: {currentUser.role} {currentUser.kelasId ? `(${currentUser.kelasId})` : ''}
              </span>
            </p>
          </div>

          {/* Action on Header */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser.role === 'murid' && (
              <button
                type="button"
                onClick={() => setActiveView('murid-paket')}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span>Lihat Paket Soal</span>
              </button>
            )}
            {currentUser.role === 'guru' && (
              <button
                type="button"
                onClick={() => setActiveView('guru-bank-soal')}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <FilePlus className="h-4 w-4" />
                <span>Input Soal Baru</span>
              </button>
            )}
            {currentUser.role === 'admin' && (
              <button
                type="button"
                onClick={() => setActiveView('admin-users')}
                className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Kelola Pengguna</span>
              </button>
            )}
          </div>
        </div>

        {/* Active In-Progress Exam Banner (If student has active session) */}
        {currentUser.role === 'murid' && activeSession && (
          <div className="rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                  Ujian Sedang Berlangsung!
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {activeSession.paketJudul}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Sisa waktu tercatat di sistem: {Math.floor(activeSession.sisaDetik / 60)} menit. Jawaban tersimpan otomatis.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('murid-ujian')}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Lanjutkan Pengerjaan Ujian</span>
            </button>
          </div>
        )}

        {/* ================= MURID DASHBOARD ================= */}
        {currentUser.role === 'murid' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 cols: Available Exam Packages */}
            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Paket Soal Ujian Tersedia</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveView('murid-paket')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Lihat Semua ({packages.length})
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {packages.slice(0, 3).map((pkg) => {
                    return (
                      <div
                        key={pkg.id}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              {pkg.mapelId.replace('_', ' ')}
                            </span>
                            <span>·</span>
                            <span>{pkg.durasiMenit} Menit</span>
                            <span>·</span>
                            <span>{pkg.soalIds.length} Butir Soal</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {pkg.judul}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-1">{pkg.deskripsi}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => startExam(pkg.id)}
                          className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-colors shrink-0"
                        >
                          <Play className="h-3 w-3 fill-white" />
                          <span>Mulai Ujian</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Performance Benchmark & KKM Progress */}
              <StudentPerformanceProgress />
            </div>

            {/* Right 4 cols: Latest Score & Shortcuts */}
            <div className="lg:col-span-4 space-y-6">
              {latestSession ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    <span>Hasil Ujian Terakhir</span>
                  </div>
                  <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-1">
                    {latestSession.persentaseNilai} <span className="text-sm font-normal text-slate-400">/ 100</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    {latestSession.paketJudul}
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800 text-center text-xs">
                    <div>
                      <div className="text-emerald-600 font-bold">{latestSession.jumlahBenar}</div>
                      <div className="text-[10px] text-slate-400">Benar</div>
                    </div>
                    <div>
                      <div className="text-rose-600 font-bold">{latestSession.jumlahSalah}</div>
                      <div className="text-[10px] text-slate-400">Salah</div>
                    </div>
                    <div>
                      <div className="text-slate-600 dark:text-slate-400 font-bold">{latestSession.jumlahKosong}</div>
                      <div className="text-[10px] text-slate-400">Kosong</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSessionId(latestSession.id);
                      setActiveView('murid-hasil');
                    }}
                    className="w-full mt-4 rounded-xl border border-slate-300 dark:border-slate-700 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Lihat Pembahasan Lengkap
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs text-center">
                  <GraduationCap className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum Ada Riwayat Ujian</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Kerjakan salah satu paket soal di sebelah kiri untuk melihat skor dan pembahasannya.
                  </p>
                </div>
              )}

              {/* Announcement widget */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Pengumuman Akademik
                </h3>
                <div className="space-y-3">
                  {announcements.slice(0, 2).map((a) => (
                    <div key={a.id} className="text-xs space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{a.judul}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2">{a.konten}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= GURU DASHBOARD ================= */}
        {currentUser.role === 'guru' && (
          <div className="space-y-6">
            {/* 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Total Bank Soal</span>
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {questions.length}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Semua mapel terdaftar
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Paket Soal Terbit</span>
                  <Layers className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-600">
                  {packages.length}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Siap dikerjakan siswa
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Rata-Rata Nilai Murid</span>
                  <TrendingUp className="h-4 w-4 text-violet-500" />
                </div>
                <div className="text-3xl font-extrabold text-violet-600">
                  {classAvgScore}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Dari {allCompletedSessions.length} sesi ujian selesai
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Komposisi Soal</span>
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-xs font-semibold space-y-0.5 mt-1">
                  <div className="flex justify-between"><span>MTK:</span> <span className="font-bold">{mtkCount} soal</span></div>
                  <div className="flex justify-between"><span>B.Indo:</span> <span className="font-bold">{bindCount} soal</span></div>
                  <div className="flex justify-between"><span>IPA:</span> <span className="font-bold">{ipaCount} soal</span></div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Aktivitas Ujian Siswa Terbaru
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveView('guru-hasil')}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Lihat Analisis Lengkap
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                        <th className="py-2 px-3">Nama Siswa</th>
                        <th className="py-2 px-3">Kelas</th>
                        <th className="py-2 px-3">Paket Ujian</th>
                        <th className="py-2 px-3 text-right">Skor</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sessions.slice(0, 5).map((ses) => (
                        <tr key={ses.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {ses.muridNama}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{ses.kelasNama}</td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                            {ses.paketJudul}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold font-mono text-indigo-600 dark:text-indigo-400">
                            {ses.persentaseNilai ?? '-'}%
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {ses.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Guru Shortcuts */}
              <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Pintasan Cepat Guru
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveView('guru-bank-soal')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FilePlus className="h-4 w-4 text-emerald-600" />
                    <span>Tambah Butir Soal Baru</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('guru-paket-soal')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    <span>Susun Paket Soal Baru</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('guru-hasil')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="h-4 w-4 text-violet-600" />
                    <span>Analisis Butir & Ekspor Excel</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= ADMIN DASHBOARD ================= */}
        {currentUser.role === 'admin' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Total Pengguna</span>
                  <Users className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {users.length}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {users.filter((u) => u.role === 'murid').length} Murid · {users.filter((u) => u.role === 'guru').length} Guru
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Total Soal</span>
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {questions.length}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Bank Soal CBT SD</div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Paket Ujian</span>
                  <Layers className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {packages.length}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Terbit dan siap diakses</div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Sesi Ujian Selesai</span>
                  <Award className="h-4 w-4 text-violet-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {sessions.length}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Terekam di sistem</div>
              </div>
            </div>

            {/* Admin Quick Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setActiveView('admin-users')}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 text-left transition-colors shadow-xs"
              >
                <Users className="h-6 w-6 text-indigo-600 mb-2" />
                <div className="font-bold text-sm text-slate-900 dark:text-white">Kelola Pengguna</div>
                <div className="text-xs text-slate-500 mt-1">
                  Tambah, ubah, reset password, dan import CSV massal murid & guru.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('admin-classes')}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 text-left transition-colors shadow-xs"
              >
                <Layers className="h-6 w-6 text-emerald-600 mb-2" />
                <div className="font-bold text-sm text-slate-900 dark:text-white">Kelola Kelas</div>
                <div className="text-xs text-slate-500 mt-1">
                  Manajemen rombongan belajar tingkat SD (Kelas 1 s.d. 6) dan penugasan wali kelas.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('admin-monitoring')}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 text-left transition-colors shadow-xs"
              >
                <Clock className="h-6 w-6 text-amber-600 mb-2" />
                <div className="font-bold text-sm text-slate-900 dark:text-white">Live Monitoring Ujian</div>
                <div className="text-xs text-slate-500 mt-1">
                  Pantau peserta yang sedang aktif mengerjakan serta log pindah tab.
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
