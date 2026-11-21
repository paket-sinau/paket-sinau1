/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { SUBJECTS } from '../data/seedData';
import {
  ArrowRight,
  Calculator,
  BookOpen,
  Atom,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  FileCheck2,
  ListFilter,
  Columns,
  GraduationCap,
} from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const { setActiveView, questions } = useApp();

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Calculator,
    BookOpen,
    Atom,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <img
                  src="/assets/aistudio/paket_sinau_724f1ed0.jpg"
                  alt="Logo Paket Sinau"
                  className="h-14 w-14 rounded-2xl shadow-lg ring-2 ring-amber-500/30 object-cover shrink-0"
                />
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/50 px-3.5 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Sistem CBT & Asesmen Belajar Sekolah Dasar (SD) 2026</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Belajar & Ujian Ceria <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
                  PAKET SINAU SD
                </span>
              </h1>

              <p className="max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mx-auto lg:mx-0">
                Aplikasi ujian berbasis komputer (CBT) ramah anak untuk siswa Sekolah Dasar. Dilengkapi 3 model soal interaktif, stimulus wacana bergambar yang menarik, dan pembahasan mudah dipahami.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveView('login')}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all"
                >
                  <GraduationCap className="h-5 w-5" />
                  <span>Masuk ke Portal CBT</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>

              {/* Roles Information Badge */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                  Portal Terpadu untuk Tiga Peran Pengguna:
                </div>
                <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
                  <div className="rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/60 dark:bg-indigo-950/30 px-3 py-1.5 text-xs font-medium text-indigo-800 dark:text-indigo-300">
                    👨‍🎓 <strong>Murid:</strong> Kerjakan Ujian, Nilai & Pembahasan
                  </div>
                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                    👩‍🏫 <strong>Guru:</strong> Bank Soal, Kelola Paket & Analisis
                  </div>
                  <div className="rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/30 px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-300">
                    ⚙️ <strong>Admin:</strong> Manajemen Akun, Kelas & Sistem
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2">
                <img
                  src="/src/assets/images/hero_sinau_tka_1793242665401.jpg"
                  alt="Siswa belajar interaktif Paket Sinau"
                  className="w-full h-auto rounded-xl object-cover"
                  loading="lazy"
                />
                <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-xl mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Integritas Terverifikasi CBT</span>
                  </div>
                  <div className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                    {questions.length} Soal Terverifikasi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Mata Pelajaran Utama */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Tiga Mata Pelajaran Utama Sekolah Dasar
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Dirancang sesuai capaian pembelajaran kurikulum SD dengan materi berbobot dan menyenangkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBJECTS.map((sub) => {
              const Icon = iconMap[sub.ikon] || BookOpen;
              const isMTK = sub.id === 'matematika';
              const isBIND = sub.id === 'bahasa_indonesia';

              return (
                <div
                  key={sub.id}
                  className={`rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg ${
                    isMTK
                      ? 'border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/40 to-white dark:from-slate-900 dark:to-slate-900'
                      : isBIND
                      ? 'border-violet-200 dark:border-violet-900/60 bg-gradient-to-b from-violet-50/40 to-white dark:from-slate-900 dark:to-slate-900'
                      : 'border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-b from-emerald-50/40 to-white dark:from-slate-900 dark:to-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        isMTK
                          ? 'bg-indigo-600 text-white'
                          : isBIND
                          ? 'bg-violet-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold font-mono tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {sub.singkatan}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {sub.nama}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {sub.deskripsi}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500">Bank Soal Tersedia</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {questions.filter((q) => q.mapelId === sub.id).length} Butir Soal
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3 Model Soal Interaktif */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Tiga Model Soal CBT Modern
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Menghadirkan ragam pengujian yang komprehensif mulai dari pemahaman konsep, pilihan ganda kompleks, hingga analisis kategorisasi pernyataan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Model 1: PILGAN */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      1. PILGAN (Pilihan Ganda)
                    </h3>
                    <span className="text-[11px] text-slate-500">Single Choice Radio</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Satu jawaban benar dari opsi A–E. Dilengkapi dukungan rumus matematika KaTeX dan opsi berbobot penalti minus.
                </p>

                {/* Visual miniature mockup */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/60 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                    <span className="h-4 w-4 rounded-full border border-indigo-600 bg-indigo-600 flex items-center justify-center text-[10px] text-white">✓</span>
                    <span>Opsi A: $x_1 = 3$ (Kunci)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-600"></span>
                    <span>Opsi B: $x_1 = 5$</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Model 2: MCMA */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                    <ListFilter className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      2. MCMA (Pilihan Kompleks)
                    </h3>
                    <span className="text-[11px] text-slate-500">Multiple Answers Checkbox</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Beberapa jawaban benar dari daftar opsi. Guru dapat memilih mode penilaian proporsional atau semua harus benar.
                </p>

                {/* Visual miniature mockup */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/60 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                    <span className="h-4 w-4 rounded-md border border-indigo-600 bg-indigo-600 flex items-center justify-center text-[10px] text-white">✓</span>
                    <span>Opsi A: Konsumen Primer</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                    <span className="h-4 w-4 rounded-md border border-indigo-600 bg-indigo-600 flex items-center justify-center text-[10px] text-white">✓</span>
                    <span>Opsi C: Fitoplankton</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Model 3: KATEGORI */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Columns className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      3. KATEGORI (Tabel Pernyataan)
                    </h3>
                    <span className="text-[11px] text-slate-500">Dua Kolom: Benar/Salah</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Tabel baris pernyataan dengan dua kolom (Benar/Salah, Fakta/Opini, Ya/Tidak). Penilaian otomatis per baris atau mutlak.
                </p>

                {/* Visual miniature mockup */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <div className="grid grid-cols-6 font-semibold pb-1 border-b border-slate-200 dark:border-slate-700 text-[10px]">
                    <span className="col-span-4">Pernyataan</span>
                    <span className="text-center">B</span>
                    <span className="text-center">S</span>
                  </div>
                  <div className="grid grid-cols-6 pt-1 text-[11px] text-slate-600 dark:text-slate-300 items-center">
                    <span className="col-span-4 truncate">1. Indonesia &gt;17.000 pulau</span>
                    <span className="text-center font-bold text-indigo-600">●</span>
                    <span className="text-center text-slate-400">○</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CBT Core Features & Architecture */}
      <section className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Timer Akurat & Autosave</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Hitung mundur real-time dengan autosave instan setiap kali opsi dipilih. Aman dari refresh halaman.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Anti-Cheat Tab Switch</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Mendeteksi siswa yang berpindah jendela atau tab browser, mencatat pelanggaran dan memberi peringatan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 shrink-0">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">LaTeX & Simbol Ilmiah</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Render persamaan matematika, matriks, pecahan, dan notasi kimia secara tajam menggunakan KaTeX.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Analisis Butir & Pembahasan</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Koreksi instan, solusi langkah demi langkah, dan statistik daya beda butir soal untuk guru.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
