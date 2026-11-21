/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDuration } from '../../utils/examScoring';
import { StudentProgressCurve } from '../../components/StudentProgressCurve';
import {
  TrendingUp,
  Download,
  Printer,
  Award,
  Users,
  CheckCircle,
  HelpCircle,
  BarChart3,
  Search,
  LineChart,
  UserCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const HasilAnalisisPage: React.FC = () => {
  const { packages, sessions, questions, users, showToast } = useApp();
  const [selectedPkgId, setSelectedPkgId] = useState<string>(packages[0]?.id || '');
  const [searchMurid, setSearchMurid] = useState('');
  const [activeTab, setActiveTab] = useState<'rekap_paket' | 'kurva_anak'>('rekap_paket');

  // Filter students (role: 'murid')
  const muridUsers = useMemo(() => {
    return users.filter((u) => u.role === 'murid');
  }, [users]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    muridUsers[0]?.id || 'usr-murid-1'
  );
  const [searchStudentCurve, setSearchStudentCurve] = useState('');

  const currentPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];

  // Sessions for this package
  const pkgSessions = useMemo(() => {
    return sessions
      .filter((s) => s.paketId === currentPkg?.id && s.status === 'selesai')
      .sort((a, b) => (b.persentaseNilai || 0) - (a.persentaseNilai || 0));
  }, [sessions, currentPkg]);

  const filteredSessions = useMemo(() => {
    if (!searchMurid.trim()) return pkgSessions;
    const q = searchMurid.toLowerCase();
    return pkgSessions.filter(
      (s) => s.muridNama.toLowerCase().includes(q) || s.kelasNama.toLowerCase().includes(q)
    );
  }, [pkgSessions, searchMurid]);

  // Overall Statistics for this package
  const totalCount = pkgSessions.length;
  const avgScore =
    totalCount > 0
      ? Math.round(
          pkgSessions.reduce((acc, curr) => acc + (curr.persentaseNilai || 0), 0) / totalCount
        )
      : 0;
  const maxScore = totalCount > 0 ? Math.max(...pkgSessions.map((s) => s.persentaseNilai || 0)) : 0;
  const minScore = totalCount > 0 ? Math.min(...pkgSessions.map((s) => s.persentaseNilai || 0)) : 0;

  // Analisis Butir Soal (Item Difficulty Analysis)
  const itemAnalysis = useMemo(() => {
    if (!currentPkg) return [];

    return currentPkg.soalIds.map((soalId, index) => {
      const q = questions.find((item) => item.id === soalId);
      if (!q) return null;

      let correctCount = 0;
      let totalAnswered = 0;

      pkgSessions.forEach((s) => {
        const ans = s.answers[soalId];
        if (ans) {
          totalAnswered++;
          if (ans.isFullyCorrect) {
            correctCount++;
          }
        }
      });

      const percentageCorrect =
        totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

      let tingkatEmpiris = 'Sedang';
      let badgeClass = 'text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300';
      if (percentageCorrect >= 70) {
        tingkatEmpiris = 'Mudah';
        badgeClass = 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300';
      } else if (percentageCorrect < 40) {
        tingkatEmpiris = 'Sulit';
        badgeClass = 'text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300';
      }

      return {
        index: index + 1,
        question: q,
        correctCount,
        totalCount,
        percentageCorrect,
        tingkatEmpiris,
        badgeClass,
      };
    }).filter(Boolean);
  }, [currentPkg, questions, pkgSessions, totalCount]);

  // Export to CSV
  const handleExportCsv = () => {
    if (pkgSessions.length === 0) {
      showToast('Tidak ada data nilai murid untuk diekspor.', 'error');
      return;
    }

    let csv = `Peringkat,Nama Murid,Kelas,Skor %,Benar,Salah,Kosong,Waktu Terpakai,Pelanggaran Tab\n`;
    pkgSessions.forEach((s, idx) => {
      csv += `${idx + 1},"${s.muridNama}","${s.kelasNama}",${s.persentaseNilai},${s.jumlahBenar},${s.jumlahSalah},${s.jumlahKosong},"${formatDuration(s.durasiDetikTerpakai)}",${s.jumlahPelanggaranTab}\n`;
    });

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_nilai_${currentPkg.judul.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Rekap nilai berhasil diekspor ke format Excel/CSV.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 print:bg-white print:text-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span>Hasil Ujian & Analisis Butir Soal</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Rekapitulasi nilai murid, analisis daya pembeda butir soal, dan persentase keberhasilan per nomor.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak Rekap</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Ekspor Excel / CSV</span>
            </button>
          </div>
        </div>

        {/* Main View Mode Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-800/80 w-fit text-xs font-semibold print:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('rekap_paket')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'rekap_paket'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Rekap Paket & Analisis Butir Soal</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kurva_anak')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'kurva_anak'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LineChart className="h-4 w-4" />
            <span>Kurva Perkembangan Nilai Siswa (Setiap Anak)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-[10px] text-indigo-700 dark:text-indigo-300">
              {muridUsers.length} Siswa
            </span>
          </button>
        </div>

        {activeTab === 'kurva_anak' ? (
          <div className="space-y-6">
            {/* Student Picker Bar & List */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-indigo-600" />
                    <span>Pilih Peserta Didik untuk Melihat Kurva Perkembangannya</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Klik kartu nama siswa untuk memantau lintasan grafik kurva peningkatan atau penurunan nilai tryout dari sesi ke sesi.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama siswa atau kelas..."
                    value={searchStudentCurve}
                    onChange={(e) => setSearchStudentCurve(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Student Cards Carousel/Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
                {muridUsers
                  .filter((m) => {
                    if (!searchStudentCurve.trim()) return true;
                    const q = searchStudentCurve.toLowerCase();
                    return (
                      m.nama.toLowerCase().includes(q) || (m.kelasId || '').toLowerCase().includes(q)
                    );
                  })
                  .map((m) => {
                    const isSelected = m.id === selectedStudentId;
                    const mSessions = sessions
                      .filter((s) => s.muridId === m.id && s.status === 'selesai')
                      .sort(
                        (a, b) =>
                          new Date(a.waktuSelesai || a.waktuMulai).getTime() -
                          new Date(b.waktuSelesai || b.waktuMulai).getTime()
                      );
                    const count = mSessions.length;
                    const latest =
                      count > 0 ? mSessions[mSessions.length - 1].persentaseNilai : null;

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedStudentId(m.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs ring-1 ring-indigo-500'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-slate-400">
                            {m.kelasId || 'SD'}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              count > 0
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                            }`}
                          >
                            {count} Tryout
                          </span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {m.nama}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-baseline justify-between">
                          <span>Skor Terkini:</span>
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {latest !== null ? `${latest}%` : '-'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* The Curve View for the Selected Student */}
            <StudentProgressCurve studentId={selectedStudentId} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Package Selector */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Pilih Paket Ujian:</span>
                <select
                  value={selectedPkgId}
                  onChange={(e) => setSelectedPkgId(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 px-3 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.judul} ({p.soalIds.length} Soal)
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama murid atau kelas..."
                  value={searchMurid}
                  onChange={(e) => setSearchMurid(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* 4 Summary Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Peserta Mengerjakan</span>
                  <Users className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {totalCount}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Siswa telah submit</div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Rata-Rata Nilai</span>
                  <BarChart3 className="h-4 w-4 text-violet-500" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-violet-600">
                  {avgScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Standar kelulusan 70</div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Nilai Tertinggi</span>
                  <Award className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-emerald-600">
                  {maxScore}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Skor maksimal kelas</div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Nilai Terendah</span>
                  <HelpCircle className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-amber-600">
                  {minScore}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Perlu remedial</div>
              </div>
            </div>

            {/* Student Ranking Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-600" />
                <span>Peringkat & Daftar Nilai Siswa ({filteredSessions.length})</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">Nama Lengkap Murid</th>
                      <th className="py-2.5 px-3">Kelas</th>
                      <th className="py-2.5 px-3 text-center">Benar</th>
                      <th className="py-2.5 px-3 text-center">Salah</th>
                      <th className="py-2.5 px-3 text-center">Kosong</th>
                      <th className="py-2.5 px-3 text-center">Durasi</th>
                      <th className="py-2.5 px-3 text-right">Nilai Akhir</th>
                      <th className="py-2.5 px-3 text-center">Kurva Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSessions.map((ses, idx) => (
                      <tr key={ses.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-500">
                          #{idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          {ses.muridNama}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{ses.kelasNama}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-600 font-mono">
                          {ses.jumlahBenar}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-rose-600 font-mono">
                          {ses.jumlahSalah}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                          {ses.jumlahKosong}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                          {formatDuration(ses.durasiDetikTerpakai)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold font-mono text-base text-indigo-600 dark:text-indigo-400">
                          {ses.persentaseNilai}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentId(ses.muridId);
                              setActiveTab('kurva_anak');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                            title={`Buka kurva perkembangan ${ses.muridNama}`}
                          >
                            <TrendingUp className="h-3 w-3" />
                            <span>Lihat Kurva</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ANALISIS BUTIR SOAL */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <span>Analisis Butir Soal (Tingkat Kesukaran Empiris)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mengukur persentase siswa yang menjawab tepat untuk mendeteksi soal tersulit dan bahan evaluasi guru.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3 w-16">No</th>
                      <th className="py-2.5 px-3">Topik / Cuplikan Soal</th>
                      <th className="py-2.5 px-3 text-center">Model</th>
                      <th className="py-2.5 px-3 text-center">Siswa Benar</th>
                      <th className="py-2.5 px-3 text-center">Daya Capai (%)</th>
                      <th className="py-2.5 px-3 text-center">Tingkat Kesukaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {itemAnalysis.map((item: any) => (
                      <tr key={item.question.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-400">
                          Soal #{item.index}
                        </td>
                        <td className="py-2.5 px-3 max-w-md">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{item.question.topik}</div>
                          <div className="text-[11px] text-slate-500 truncate">{item.question.teksSoal}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center uppercase font-mono text-[10px]">
                          {item.question.modelSoal}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold">
                          {item.correctCount} / {item.totalCount}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${item.percentageCorrect}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold">{item.percentageCorrect}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeClass}`}>
                            {item.tingkatEmpiris}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
