/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDuration } from '../../utils/examScoring';
import {
  Clock,
  Users,
  AlertTriangle,
  Play,
  CheckCircle2,
  Send,
} from 'lucide-react';

export const AdminMonitoringPage: React.FC = () => {
  const { activeSession, sessions, submitExamSession, showToast } = useApp();

  const handleForceSubmit = () => {
    if (activeSession) {
      submitExamSession();
      showToast('Sesi ujian murid berhasil dikumpulkan secara paksa oleh Administrator.', 'info');
    }
  };

  const completedSessions = sessions.filter((s) => s.status === 'selesai');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <Clock className="h-6 w-6 text-amber-500" />
              <span>Live Monitoring Ujian CBT</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Pantau secara langsung siswa yang sedang aktif mengerjakan soal, sisa waktu, dan catatan pelanggaran tab.
            </p>
          </div>
        </div>

        {/* Active Exam Sesi Section */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Play className="h-4 w-4 text-emerald-500 fill-emerald-500" />
              <span>Sesi Ujian yang Sedang Berjalan Real-Time</span>
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
              {activeSession ? '1 Sesi Aktif' : '0 Sesi Aktif'}
            </span>
          </div>

          {activeSession ? (
            <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-extrabold text-slate-900 dark:text-white text-base">
                    {activeSession.muridNama}
                  </span>
                  <span className="text-slate-500">({activeSession.kelasNama})</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    ONLINE MENGERJAKAN
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Paket: {activeSession.paketJudul}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Sisa Waktu: <strong className="font-mono text-indigo-600 font-bold">{formatDuration(activeSession.sisaDetik)}</strong></span>
                  <span>Soal Dijawab: <strong className="font-mono font-bold">{Object.keys(activeSession.answers).length} Butir</strong></span>
                  {activeSession.jumlahPelanggaranTab > 0 && (
                    <span className="flex items-center gap-1 text-rose-600 font-bold">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>{activeSession.jumlahPelanggaranTab}x Pindah Tab</span>
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleForceSubmit}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Paksa Kumpulkan</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              Tidak ada sesi ujian aktif saat ini. Siswa yang mulai mengerjakan akan langsung muncul di sini.
            </div>
          )}
        </div>

        {/* Recent Completed Sessions Log */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            <span>Riwayat Sesi yang Telah Selesai ({completedSessions.length})</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-3">Paket Soal</th>
                  <th className="py-2.5 px-3 text-center">Durasi</th>
                  <th className="py-2.5 px-3 text-center">Pelanggaran Tab</th>
                  <th className="py-2.5 px-3 text-right">Nilai Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {completedSessions.map((ses) => (
                  <tr key={ses.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {ses.muridNama}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{ses.kelasNama}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {ses.paketJudul}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {formatDuration(ses.durasiDetikTerpakai)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {ses.jumlahPelanggaranTab > 0 ? (
                        <span className="font-bold text-rose-600">{ses.jumlahPelanggaranTab}x</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">Nihil</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                      {ses.persentaseNilai}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
