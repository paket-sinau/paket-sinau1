/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SubjectId } from '../../types';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Play,
  Search,
  Filter,
  Layers,
  Award,
  Lock,
} from 'lucide-react';

export const PaketSoalList: React.FC = () => {
  const { packages, currentUser, sessions, startExam, setActiveView, setSelectedSessionId } = useApp();
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'semua'>('semua');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'belum' | 'selesai'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [accessCodeInput, setAccessCodeInput] = useState<Record<string, string>>({});
  const [codeError, setCodeError] = useState<Record<string, string>>({});

  // Check if current student has completed a package
  const completedSessionMap = useMemo(() => {
    const map: Record<string, string> = {}; // pkgId -> sessionId
    if (!currentUser) return map;
    sessions.forEach((s) => {
      if (s.muridId === currentUser.id && s.status === 'selesai') {
        map[s.paketId] = s.id;
      }
    });
    return map;
  }, [sessions, currentUser]);

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      // Mapel filter
      if (selectedSubject !== 'semua' && pkg.mapelId !== selectedSubject) {
        return false;
      }

      // Status filter
      const isCompleted = Boolean(completedSessionMap[pkg.id]);
      if (filterStatus === 'belum' && isCompleted) return false;
      if (filterStatus === 'selesai' && !isCompleted) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = pkg.judul.toLowerCase().includes(query);
        const matchDesc = pkg.deskripsi.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }

      return true;
    });
  }, [packages, selectedSubject, filterStatus, searchQuery, completedSessionMap]);

  const handleStartWithCode = (pkgId: string, requiredCode?: string) => {
    if (requiredCode) {
      const entered = accessCodeInput[pkgId] || '';
      if (entered.trim().toUpperCase() !== requiredCode.trim().toUpperCase()) {
        setCodeError((prev) => ({ ...prev, [pkgId]: 'Kode akses salah. Hubungi guru pengawas.' }));
        return;
      }
    }
    startExam(pkgId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <span>Daftar Paket Ujian CBT SD</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Pilih paket evaluasi atau latihan CBT SD yang ingin kamu kerjakan. Jawaban akan tersimpan otomatis.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Subject Filters */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-medium">
              <button
                type="button"
                onClick={() => setSelectedSubject('semua')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  selectedSubject === 'semua'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Semua Mapel
              </button>
              <button
                type="button"
                onClick={() => setSelectedSubject('matematika')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  selectedSubject === 'matematika'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Matematika
              </button>
              <button
                type="button"
                onClick={() => setSelectedSubject('bahasa_indonesia')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  selectedSubject === 'bahasa_indonesia'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Bahasa Indonesia
              </button>
              <button
                type="button"
                onClick={() => setSelectedSubject('ipa')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  selectedSubject === 'ipa'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                IPA Terpadu
              </button>
            </div>

            {/* Status Filter & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setFilterStatus('semua')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filterStatus === 'semua'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('belum')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filterStatus === 'belum'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Belum Dikerjakan
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('selesai')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filterStatus === 'selesai'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Sudah Dikerjakan
                </button>
              </div>

              {/* Search input */}
              <div className="relative min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama paket..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        {filteredPackages.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
            <Layers className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Tidak ada paket soal yang cocok
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Coba ganti filter mata pelajaran atau hapus kata kunci pencarian.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => {
              const isMTK = pkg.mapelId === 'matematika';
              const isBIND = pkg.mapelId === 'bahasa_indonesia';
              const completedSessionId = completedSessionMap[pkg.id];
              const isCompleted = Boolean(completedSessionId);

              return (
                <div
                  key={pkg.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Top Subject Tag & Status */}
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-full ${
                          isMTK
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                            : isBIND
                            ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {pkg.mapelId.replace('_', ' ')}
                      </span>

                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Sudah Dikerjakan</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          Tersedia
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {pkg.judul}
                    </h2>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {pkg.deskripsi}
                    </p>

                    {/* Metadata Badges */}
                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{pkg.durasiMenit} Menit</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-slate-400" />
                        <span>{pkg.soalIds.length} Butir Soal</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Aturan Nilai:</span>
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                          +{pkg.bobotBenar} Benar / {pkg.bobotSalah} Salah / {pkg.bobotKosong} Kosong
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pembuat:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{pkg.pembuatNama}</span>
                      </div>
                    </div>

                    {/* Code Input if required */}
                    {pkg.kodeAkses && !isCompleted && (
                      <div className="pt-2">
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                          <Lock className="h-3 w-3 text-amber-500" />
                          <span>Wajib Kode Akses Token:</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Masukkan token ujian"
                          value={accessCodeInput[pkg.id] || ''}
                          onChange={(e) => {
                            setAccessCodeInput({ ...accessCodeInput, [pkg.id]: e.target.value });
                            setCodeError({ ...codeError, [pkg.id]: '' });
                          }}
                          className="w-full uppercase rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {codeError[pkg.id] && (
                          <div className="text-[11px] text-rose-500 mt-1">{codeError[pkg.id]}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {isCompleted ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (completedSessionId) {
                              setSelectedSessionId(completedSessionId);
                              setActiveView('murid-hasil');
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Award className="h-3.5 w-3.5 text-amber-500" />
                          <span>Hasil & Pembahasan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartWithCode(pkg.id, pkg.kodeAkses)}
                          className="flex items-center justify-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                          title="Coba Kerjakan Ulang"
                        >
                          <span>Ulangi</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartWithCode(pkg.id, pkg.kodeAkses)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
                      >
                        <Play className="h-4 w-4 fill-white" />
                        <span>Mulai Mengerjakan Ujian</span>
                      </button>
                    )}
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
