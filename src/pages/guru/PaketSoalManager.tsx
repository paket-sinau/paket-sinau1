/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExamPackage, ExamStatus, SubjectId } from '../../types';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Clock,
  ArrowUp,
  ArrowDown,
  X,
  Sparkles,
  Lock,
  Calendar,
  Minus,
  Check,
  Search,
  Filter,
  HelpCircle,
  BookOpen,
  Bookmark,
  CheckSquare,
  Square,
} from 'lucide-react';

export const PaketSoalManager: React.FC = () => {
  const { packages, questions, classes, currentUser, savePackage, deletePackage, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<ExamPackage | null>(null);

  // Form states
  const [judul, setJudul] = useState('');
  const [mapelId, setMapelId] = useState<SubjectId>('matematika');
  const [deskripsi, setDeskripsi] = useState('');
  const [durasiMenit, setDurasiMenit] = useState(45);
  const [bobotBenar, setBobotBenar] = useState(4);
  const [bobotSalah, setBobotSalah] = useState(0);
  const [bobotKosong, setBobotKosong] = useState(0);
  const [acakSoal, setAcakSoal] = useState(true);
  const [acakOpsi, setAcakOpsi] = useState(true);
  const [waktuBuka, setWaktuBuka] = useState('2026-01-01T00:00');
  const [waktuTutup, setWaktuTutup] = useState('2026-12-31T23:59');
  const [kelasAkses, setKelasAkses] = useState<string[]>(['semua']);
  const [kodeAkses, setKodeAkses] = useState('');
  const [status, setStatus] = useState<ExamStatus>('terbit');
  const [izinkanLihatPembahasan, setIzinkanLihatPembahasan] = useState(true);
  const [deteksiPindahTab, setDeteksiPindahTab] = useState(true);
  const [selectedSoalIds, setSelectedSoalIds] = useState<string[]>([]);

  // In-modal question picker filters
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerModelFilter, setPickerModelFilter] = useState<'semua' | 'pilgan' | 'mcma' | 'kategori'>('semua');
  const [pickerTopikFilter, setPickerTopikFilter] = useState('semua');

  // Filter bank soal questions by current selected package mapel
  const availableQuestionsForMapel = questions.filter(
    (q) => mapelId === 'campuran' || q.mapelId === mapelId
  );

  // Unique topics for the current mapel pool
  const availableTopics = Array.from(
    new Set(availableQuestionsForMapel.map((q) => q.topik.trim()).filter(Boolean))
  );

  // Filtered available questions according to modal picker criteria
  const filteredAvailableQuestions = availableQuestionsForMapel.filter((q) => {
    if (pickerModelFilter !== 'semua' && q.modelSoal !== pickerModelFilter) return false;
    if (pickerTopikFilter !== 'semua' && q.topik !== pickerTopikFilter) return false;
    if (pickerSearch.trim()) {
      const query = pickerSearch.toLowerCase();
      const matchText = q.teksSoal.toLowerCase().includes(query);
      const matchTopic = q.topik.toLowerCase().includes(query);
      if (!matchText && !matchTopic) return false;
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingPkg(null);
    setJudul('');
    setMapelId('matematika');
    setDeskripsi('');
    setDurasiMenit(45);
    setBobotBenar(4);
    setBobotSalah(0);
    setBobotKosong(0);
    setAcakSoal(true);
    setAcakOpsi(true);
    setWaktuBuka('2026-01-01T00:00');
    setWaktuTutup('2026-12-31T23:59');
    setKelasAkses(['semua']);
    setKodeAkses('');
    setStatus('terbit');
    setIzinkanLihatPembahasan(true);
    setDeteksiPindahTab(true);
    setPickerSearch('');
    setPickerModelFilter('semua');
    setPickerTopikFilter('semua');
    // Default select first 10 questions of this mapel (or all if < 10)
    const initialSoal = questions.filter((q) => q.mapelId === 'matematika').slice(0, 10).map((q) => q.id);
    setSelectedSoalIds(initialSoal);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: ExamPackage) => {
    setEditingPkg(pkg);
    setJudul(pkg.judul);
    setMapelId(pkg.mapelId);
    setDeskripsi(pkg.deskripsi);
    setDurasiMenit(pkg.durasiMenit);
    setBobotBenar(pkg.bobotBenar);
    setBobotSalah(pkg.bobotSalah);
    setBobotKosong(pkg.bobotKosong);
    setAcakSoal(pkg.acakSoal);
    setAcakOpsi(pkg.acakOpsi);
    setWaktuBuka(pkg.waktuBuka.substring(0, 16));
    setWaktuTutup(pkg.waktuTutup.substring(0, 16));
    setKelasAkses(pkg.kelasAkses);
    setKodeAkses(pkg.kodeAkses || '');
    setStatus(pkg.status);
    setIzinkanLihatPembahasan(pkg.izinkanLihatPembahasan);
    setDeteksiPindahTab(pkg.deteksiPindahTab);
    setSelectedSoalIds(pkg.soalIds);
    setPickerSearch('');
    setPickerModelFilter('semua');
    setPickerTopikFilter('semua');
    setIsModalOpen(true);
  };

  const moveSoal = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedSoalIds.length) return;

    const next = [...selectedSoalIds];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setSelectedSoalIds(next);
  };

  const toggleSelectSoal = (id: string) => {
    if (selectedSoalIds.includes(id)) {
      setSelectedSoalIds(selectedSoalIds.filter((item) => item !== id));
    } else {
      setSelectedSoalIds([...selectedSoalIds, id]);
    }
  };

  // Helper untuk guru mengatur banyak sedikitnya butir soal secara presisi
  const handleSetQuestionCount = (targetCount: number) => {
    const maxAvailable = availableQuestionsForMapel.length;
    const validTarget = Math.max(0, Math.min(targetCount, maxAvailable));

    if (selectedSoalIds.length === validTarget) return;

    if (selectedSoalIds.length > validTarget) {
      // Kurangi jumlah soal
      setSelectedSoalIds(selectedSoalIds.slice(0, validTarget));
      showToast(`Jumlah soal diatur menjadi ${validTarget} butir.`, 'info');
    } else {
      // Tambahkan soal dari bank soal yang belum terpilih
      const needed = validTarget - selectedSoalIds.length;
      const unselected = availableQuestionsForMapel.filter((q) => !selectedSoalIds.includes(q.id));
      const toAdd = unselected.slice(0, needed).map((q) => q.id);
      setSelectedSoalIds([...selectedSoalIds, ...toAdd]);
      showToast(`Jumlah soal ditambah menjadi ${validTarget} butir.`, 'info');
    }
  };

  const handleSelectAllFiltered = () => {
    const idsToAdd = filteredAvailableQuestions.map((q) => q.id);
    const combined = Array.from(new Set([...selectedSoalIds, ...idsToAdd]));
    setSelectedSoalIds(combined);
    showToast(`Menambahkan ${idsToAdd.length} butir soal dari hasil filter.`, 'success');
  };

  const handleDeselectAllFiltered = () => {
    const idsToRemove = new Set(filteredAvailableQuestions.map((q) => q.id));
    setSelectedSoalIds(selectedSoalIds.filter((id) => !idsToRemove.has(id)));
    showToast(`Menghapus butir soal terpilih dari hasil filter.`, 'info');
  };

  const handleMapelChange = (newMapel: SubjectId) => {
    setMapelId(newMapel);
    const matching = questions.filter((q) => newMapel === 'campuran' || q.mapelId === newMapel);
    const validCurrent = selectedSoalIds.filter((id) => matching.some((q) => q.id === id));
    if (validCurrent.length > 0) {
      setSelectedSoalIds(validCurrent);
    } else {
      setSelectedSoalIds(matching.slice(0, Math.min(10, matching.length)).map((q) => q.id));
    }
    setPickerTopikFilter('semua');
  };

  const handleSave = () => {
    if (!judul.trim()) {
      showToast('Judul paket wajib diisi.', 'error');
      return;
    }
    if (selectedSoalIds.length === 0) {
      showToast('Pilih minimal 1 butir soal untuk dimasukkan ke paket ujian.', 'error');
      return;
    }

    const newPkg: ExamPackage = {
      id: editingPkg ? editingPkg.id : `pkg-${Date.now()}`,
      judul: judul.trim(),
      mapelId,
      deskripsi: deskripsi.trim(),
      durasiMenit: Number(durasiMenit),
      bobotBenar: Number(bobotBenar),
      bobotSalah: Number(bobotSalah),
      bobotKosong: Number(bobotKosong),
      acakSoal,
      acakOpsi,
      waktuBuka: new Date(waktuBuka).toISOString(),
      waktuTutup: new Date(waktuTutup).toISOString(),
      kelasAkses,
      kodeAkses: kodeAkses.trim() || undefined,
      soalIds: selectedSoalIds,
      status,
      izinkanLihatPembahasan,
      deteksiPindahTab,
      pembuatId: currentUser?.id || 'usr-guru-1',
      pembuatNama: currentUser?.nama || 'Guru',
      createdAt: editingPkg ? editingPkg.createdAt : new Date().toISOString(),
    };

    savePackage(newPkg);
    setIsModalOpen(false);
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <Layers className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span>Manajemen Paket Soal Ujian</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Atur durasi, sistem penilaian, aturan pengacakan, kelas peserta, dan susun butir soal CBT.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Paket Baru</span>
          </button>
        </div>

        {/* Packages List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const isMTK = pkg.mapelId === 'matematika';
            const isBIND = pkg.mapelId === 'bahasa_indonesia';

            return (
              <div
                key={pkg.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
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

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        pkg.status === 'terbit'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : pkg.status === 'draft'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {pkg.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {pkg.judul}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2">{pkg.deskripsi}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
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
                      <span>Bobot Skor:</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                        +{pkg.bobotBenar} / {pkg.bobotSalah} / {pkg.bobotKosong}
                      </span>
                    </div>
                    {pkg.kodeAkses && (
                      <div className="flex justify-between text-amber-600 dark:text-amber-400">
                        <span>Token Akses:</span>
                        <span className="font-mono font-bold">{pkg.kodeAkses}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(pkg)}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Ubah Paket</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePackage(pkg.id)}
                    className="flex items-center gap-1 rounded-xl border border-rose-200 dark:border-rose-900 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Package Form Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingPkg ? 'Ubah Pengaturan Paket Soal' : 'Buat Paket Soal Baru'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Row 1: Judul & Mapel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Paket Soal
                  </label>
                  <input
                    type="text"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    placeholder="Contoh: Penilaian Akhir Semester Matematika Kelas 6"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mata Pelajaran
                  </label>
                  <select
                    value={mapelId}
                    onChange={(e) => handleMapelChange(e.target.value as SubjectId)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="matematika">Matematika Dasar</option>
                    <option value="bahasa_indonesia">Bahasa Indonesia</option>
                    <option value="ipa">IPA / IPAS SD</option>
                    <option value="campuran">Gabungan Tematik SD (Campuran)</option>
                  </select>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi & Petunjuk Pengerjaan
                </label>
                <textarea
                  rows={2}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Keterangan singkat paket ujian..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Scoring & Duration */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={durasiMenit}
                    onChange={(e) => setDurasiMenit(Number(e.target.value))}
                    className="w-full rounded-lg border py-1.5 px-2 bg-white dark:bg-slate-800 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Bobot Benar</label>
                  <input
                    type="number"
                    value={bobotBenar}
                    onChange={(e) => setBobotBenar(Number(e.target.value))}
                    className="w-full rounded-lg border py-1.5 px-2 bg-white dark:bg-slate-800 font-mono text-emerald-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Bobot Salah</label>
                  <input
                    type="number"
                    value={bobotSalah}
                    onChange={(e) => setBobotSalah(Number(e.target.value))}
                    className="w-full rounded-lg border py-1.5 px-2 bg-white dark:bg-slate-800 font-mono text-rose-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Bobot Kosong</label>
                  <input
                    type="number"
                    value={bobotKosong}
                    onChange={(e) => setBobotKosong(Number(e.target.value))}
                    className="w-full rounded-lg border py-1.5 px-2 bg-white dark:bg-slate-800 font-mono text-slate-600 font-bold"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acakSoal}
                      onChange={(e) => setAcakSoal(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-semibold">Acak Urutan Soal untuk Tiap Siswa</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acakOpsi}
                      onChange={(e) => setAcakOpsi(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-semibold">Acak Urutan Pilihan Jawaban (A-E)</span>
                  </label>
                </div>

                <div className="space-y-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={izinkanLihatPembahasan}
                      onChange={(e) => setIzinkanLihatPembahasan(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-semibold">Izinkan Murid Langsung Melihat Pembahasan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deteksiPindahTab}
                      onChange={(e) => setDeteksiPindahTab(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-semibold">Aktifkan Deteksi Anti-Cheat Pindah Tab</span>
                  </label>
                </div>
              </div>

              {/* Token & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Kode Akses / Token Ujian (Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={kodeAkses}
                    onChange={(e) => setKodeAkses(e.target.value)}
                    placeholder="Kosongkan jika bebas akses"
                    className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Status Publikasi</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ExamStatus)}
                    className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="terbit">Terbit (Dapat Dikerjakan Siswa)</option>
                    <option value="draft">Draft (Belum Terbit)</option>
                    <option value="ditutup">Ditutup (Ujian Selesai)</option>
                  </select>
                </div>
              </div>

              {/* PENGATURAN BANYAK SEDIKITNYA SOAL (KUANTITAS BUTIR SOAL) */}
              <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Atur Banyaknya Butir Soal dalam Paket</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Tentukan jumlah soal yang akan dikerjakan siswa. Tersedia {availableQuestionsForMapel.length} soal di Bank Soal untuk mata pelajaran ini.
                    </p>
                  </div>

                  {/* Stepper Input */}
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-xl p-1 shadow-xs self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleSetQuestionCount(selectedSoalIds.length - 1)}
                      disabled={selectedSoalIds.length <= 1}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                      title="Kurangi 1 Soal"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="text-center min-w-[3.5rem]">
                      <span className="font-mono text-base font-extrabold text-indigo-700 dark:text-indigo-300">
                        {selectedSoalIds.length}
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-1 font-medium">Soal</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSetQuestionCount(selectedSoalIds.length + 1)}
                      disabled={selectedSoalIds.length >= availableQuestionsForMapel.length}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                      title="Tambah 1 Soal"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Preset Buttons for Instant Sizing */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mr-1">
                    Preset Cepat:
                  </span>
                  {[3, 5, 10, 15, 20, 30].map((num) => {
                    const isPossible = availableQuestionsForMapel.length >= num;
                    const isActive = selectedSoalIds.length === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleSetQuestionCount(num)}
                        disabled={!isPossible}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : isPossible
                            ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700'
                            : 'bg-slate-100 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600 border border-transparent cursor-not-allowed'
                        }`}
                      >
                        {num} Soal
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => handleSetQuestionCount(availableQuestionsForMapel.length)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                  >
                    Pilih Semua ({availableQuestionsForMapel.length} Soal)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSoalIds([])}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                  >
                    Kosongkan Pilihan
                  </button>
                </div>

                {/* Status bar & Question Type Breakdown */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/60 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Rincian Model:
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[11px]">
                      {selectedSoalIds.filter((id) => questions.find((q) => q.id === id)?.modelSoal === 'pilgan').length} Pilgan
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono text-[11px]">
                      {selectedSoalIds.filter((id) => questions.find((q) => q.id === id)?.modelSoal === 'mcma').length} MCMA
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono text-[11px]">
                      {selectedSoalIds.filter((id) => questions.find((q) => q.id === id)?.modelSoal === 'kategori').length} Kategori
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-500 text-[11px]">Perkiraan Nilai Maks: </span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {selectedSoalIds.length * bobotBenar} Poin
                    </span>
                  </div>
                </div>
              </div>

              {/* QUESTION SELECTION & REORDERING */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Urutan Soal Terpilih ({selectedSoalIds.length} Soal Terpilih)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Gunakan panah naik/turun untuk mengatur nomor urut soal
                  </span>
                </div>

                {/* Selected List with Reorder Controls */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  {selectedSoalIds.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      Belum ada soal terpilih. Atur kuantitas di atas atau centang soal dari daftar di bawah.
                    </div>
                  ) : (
                    selectedSoalIds.map((id, index) => {
                      const q = questions.find((item) => item.id === id);
                      if (!q) return null;

                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-mono font-bold text-slate-400 w-6">
                              #{index + 1}
                            </span>
                            <span className="font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                              {q.modelSoal}
                            </span>
                            <span className="font-medium text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                              {q.topik}
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 truncate max-w-sm">
                              {q.teksSoal}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveSoal(index, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                              title="Pindah ke atas"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSoal(index, 'down')}
                              disabled={index === selectedSoalIds.length - 1}
                              className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                              title="Pindah ke bawah"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleSelectSoal(id)}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Hapus dari paket"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Search & Filter within Bank Soal Picker */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Filter className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Cari & Pilih Manual dari Bank Soal ({availableQuestionsForMapel.length} Tersedia):</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllFiltered}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>Pilih Semua yang Tampil ({filteredAvailableQuestions.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllFiltered}
                        className="text-[11px] font-semibold text-rose-500 hover:underline flex items-center gap-1"
                      >
                        <Square className="h-3.5 w-3.5" />
                        <span>Hapus Pilihan</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari teks/topik..."
                        value={pickerSearch}
                        onChange={(e) => setPickerSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-8 pr-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <select
                      value={pickerModelFilter}
                      onChange={(e) => setPickerModelFilter(e.target.value as any)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="semua">Semua Model Soal</option>
                      <option value="pilgan">Pilgan (Pilihan Ganda)</option>
                      <option value="mcma">MCMA (Pilihan Kompleks)</option>
                      <option value="kategori">Kategori (Tabel 2 Kolom)</option>
                    </select>

                    <select
                      value={pickerTopikFilter}
                      onChange={(e) => setPickerTopikFilter(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="semua">Semua Topik/Bab</option>
                      {availableTopics.map((topik) => (
                        <option key={topik} value={topik}>
                          {topik}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Available questions bank to pick from */}
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs">
                    {filteredAvailableQuestions.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Tidak ada soal yang cocok dengan filter pencarian.
                      </div>
                    ) : (
                      filteredAvailableQuestions.map((q) => {
                        const isSelected = selectedSoalIds.includes(q.id);
                        return (
                          <label
                            key={q.id}
                            className={`flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${
                              isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectSoal(q.id)}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-[10px] uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                                  {q.modelSoal}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                  {q.topik}
                                </span>
                                <span className="text-[10px] text-slate-400 capitalize">
                                  · {q.tingkatKesulitan}
                                </span>
                              </div>
                              <p className="text-slate-800 dark:text-slate-200 truncate text-xs">
                                {q.teksSoal}
                              </p>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-900/60">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-xs font-semibold shadow-xs"
              >
                <Sparkles className="h-4 w-4" />
                <span>Simpan Paket Soal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
