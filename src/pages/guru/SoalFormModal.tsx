/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DifficultyLevel,
  PilganOption,
  Question,
  QuestionModel,
  SubjectId,
  KategoriStatement,
  Stimulus,
} from '../../types';
import { MathRenderer } from '../../components/MathRenderer';
import {
  X,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  Edit3,
  Sparkles,
  HelpCircle,
  FileText,
  BookOpen,
} from 'lucide-react';

interface SoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionToEdit?: Question | null;
}

export const SoalFormModal: React.FC<SoalFormModalProps> = ({
  isOpen,
  onClose,
  questionToEdit,
}) => {
  const { currentUser, saveQuestion, saveStimulus, stimuli, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Form Fields
  const [mapelId, setMapelId] = useState<SubjectId>('matematika');
  const [topik, setTopik] = useState('');
  const [tingkatKesulitan, setTingkatKesulitan] = useState<DifficultyLevel>('sedang');
  const [modelSoal, setModelSoal] = useState<QuestionModel>('pilgan');
  
  // Wacana / Stimulus states (Opsional & Dapat Diisi Mandiri)
  const [stimulusMode, setStimulusMode] = useState<'none' | 'custom' | 'select'>('none');
  const [stimulusId, setStimulusId] = useState<string>('');
  const [customStimulusJudul, setCustomStimulusJudul] = useState('');
  const [customStimulusTeks, setCustomStimulusTeks] = useState('');
  const [customStimulusSumber, setCustomStimulusSumber] = useState('');
  const [customStimulusGambarUrl, setCustomStimulusGambarUrl] = useState('');
  const [customStimulusGambarAlt, setCustomStimulusGambarAlt] = useState('');

  const [teksSoal, setTeksSoal] = useState('');
  const [gambarUrl, setGambarUrl] = useState('');
  const [gambarAlt, setGambarAlt] = useState('');
  const [pembahasan, setPembahasan] = useState('');

  // Model 1: PILGAN
  const [pilganOptions, setPilganOptions] = useState<PilganOption[]>([
    { label: 'A', teks: '' },
    { label: 'B', teks: '' },
    { label: 'C', teks: '' },
    { label: 'D', teks: '' },
    { label: 'E', teks: '' },
  ]);
  const [pilganKunci, setPilganKunci] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');

  // Model 2: MCMA
  const [mcmaOptions, setMcmaOptions] = useState<
    { id: string; label: string; teks: string; gambarUrl?: string }[]
  >([
    { id: 'A', label: 'A', teks: '' },
    { id: 'B', label: 'B', teks: '' },
    { id: 'C', label: 'C', teks: '' },
    { id: 'D', label: 'D', teks: '' },
  ]);
  const [mcmaKunci, setMcmaKunci] = useState<string[]>(['A', 'C']);
  const [mcmaScoringMode, setMcmaScoringMode] = useState<'all_or_nothing' | 'proportional'>(
    'proportional'
  );

  // Model 3: KATEGORI
  const [kategoriLabel1, setKategoriLabel1] = useState('Benar');
  const [kategoriLabel2, setKategoriLabel2] = useState('Salah');
  const [kategoriPernyataan, setKategoriPernyataan] = useState<KategoriStatement[]>([
    { id: 'stmt-1', teks: '', kunciJawaban: 'Benar' },
    { id: 'stmt-2', teks: '', kunciJawaban: 'Salah' },
    { id: 'stmt-3', teks: '', kunciJawaban: 'Benar' },
  ]);
  const [kategoriScoringMode, setKategoriScoringMode] = useState<'all_or_nothing' | 'per_row'>(
    'per_row'
  );

  // Populate when editing
  useEffect(() => {
    if (questionToEdit) {
      setMapelId(questionToEdit.mapelId);
      setTopik(questionToEdit.topik);
      setTingkatKesulitan(questionToEdit.tingkatKesulitan);
      setModelSoal(questionToEdit.modelSoal);
      if (questionToEdit.stimulusId) {
        setStimulusMode('select');
        setStimulusId(questionToEdit.stimulusId);
        const existingStim = stimuli.find((s) => s.id === questionToEdit.stimulusId);
        if (existingStim) {
          setCustomStimulusJudul(existingStim.judul);
          setCustomStimulusTeks(existingStim.teks);
          setCustomStimulusSumber(existingStim.sumber || '');
          setCustomStimulusGambarUrl(existingStim.gambarUrl || '');
          setCustomStimulusGambarAlt(existingStim.gambarAlt || '');
        }
      } else {
        setStimulusMode('none');
        setStimulusId('');
        setCustomStimulusJudul('');
        setCustomStimulusTeks('');
        setCustomStimulusSumber('');
        setCustomStimulusGambarUrl('');
        setCustomStimulusGambarAlt('');
      }
      setTeksSoal(questionToEdit.teksSoal);
      setGambarUrl(questionToEdit.gambarUrl || '');
      setGambarAlt(questionToEdit.gambarAlt || '');
      setPembahasan(questionToEdit.pembahasan);

      if (questionToEdit.pilganOptions) {
        setPilganOptions(questionToEdit.pilganOptions);
      }
      if (questionToEdit.pilganKunci) {
        setPilganKunci(questionToEdit.pilganKunci);
      }

      if (questionToEdit.mcmaOptions) {
        setMcmaOptions(questionToEdit.mcmaOptions);
      }
      if (questionToEdit.mcmaKunci) {
        setMcmaKunci(questionToEdit.mcmaKunci);
      }
      if (questionToEdit.mcmaScoringMode) {
        setMcmaScoringMode(questionToEdit.mcmaScoringMode);
      }

      if (questionToEdit.kategoriLabels) {
        setKategoriLabel1(questionToEdit.kategoriLabels[0]);
        setKategoriLabel2(questionToEdit.kategoriLabels[1]);
      }
      if (questionToEdit.kategoriPernyataan) {
        setKategoriPernyataan(questionToEdit.kategoriPernyataan);
      }
      if (questionToEdit.kategoriScoringMode) {
        setKategoriScoringMode(questionToEdit.kategoriScoringMode);
      }
    } else {
      // Reset defaults
      setMapelId('matematika');
      setTopik('');
      setTingkatKesulitan('sedang');
      setModelSoal('pilgan');
      setStimulusMode('none');
      setStimulusId('');
      setCustomStimulusJudul('');
      setCustomStimulusTeks('');
      setCustomStimulusSumber('');
      setCustomStimulusGambarUrl('');
      setCustomStimulusGambarAlt('');
      setTeksSoal('');
      setGambarUrl('');
      setGambarAlt('');
      setPembahasan('');
      setPilganOptions([
        { label: 'A', teks: '' },
        { label: 'B', teks: '' },
        { label: 'C', teks: '' },
        { label: 'D', teks: '' },
        { label: 'E', teks: '' },
      ]);
      setPilganKunci('A');
      setMcmaOptions([
        { id: 'A', label: 'A', teks: '' },
        { id: 'B', label: 'B', teks: '' },
        { id: 'C', label: 'C', teks: '' },
        { id: 'D', label: 'D', teks: '' },
      ]);
      setMcmaKunci(['A', 'C']);
      setKategoriLabel1('Benar');
      setKategoriLabel2('Salah');
      setKategoriPernyataan([
        { id: 'stmt-1', teks: '', kunciJawaban: 'Benar' },
        { id: 'stmt-2', teks: '', kunciJawaban: 'Salah' },
        { id: 'stmt-3', teks: '', kunciJawaban: 'Benar' },
      ]);
    }
    setActiveTab('editor');
  }, [questionToEdit, isOpen]);

  if (!isOpen) return null;

  // Image Upload handler (supports local compression to dataURL or URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal 2 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      setGambarUrl(dataUrl);
      if (!gambarAlt) {
        setGambarAlt(file.name.replace(/\.[^/.]+$/, ''));
      }
      showToast('Gambar berhasil dimuat dan dikompres.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleCustomStimulusFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran gambar wacana maksimal 2 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      setCustomStimulusGambarUrl(dataUrl);
      if (!customStimulusGambarAlt) {
        setCustomStimulusGambarAlt('Infografis / Gambar Wacana');
      }
      showToast('Gambar wacana berhasil diunggah.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!teksSoal.trim()) {
      showToast('Teks soal wajib diisi.', 'error');
      return;
    }
    if (!topik.trim()) {
      showToast('Topik/Bab wajib diisi.', 'error');
      return;
    }

    // Resolve final stimulusId (mandiri / dari bank / tanpa wacana)
    let finalStimulusId: string | undefined = undefined;

    if (stimulusMode === 'custom') {
      if (customStimulusJudul.trim() || customStimulusTeks.trim()) {
        const newStimId = `stim-${Date.now()}`;
        const newStim: Stimulus = {
          id: newStimId,
          judul: customStimulusJudul.trim() || `Wacana ${topik.trim() || 'Soal SD'}`,
          teks: customStimulusTeks.trim(),
          sumber: customStimulusSumber.trim() || undefined,
          gambarUrl: customStimulusGambarUrl.trim() || undefined,
          gambarAlt: customStimulusGambarAlt.trim() || undefined,
        };
        saveStimulus(newStim);
        finalStimulusId = newStimId;
      }
    } else if (stimulusMode === 'select') {
      finalStimulusId = stimulusId || undefined;
    }

    // Validation per model
    if (modelSoal === 'pilgan') {
      const emptyOpt = pilganOptions.some((o) => !o.teks.trim());
      if (emptyOpt) {
        showToast('Semua opsi pilihan ganda wajib memiliki teks.', 'error');
        return;
      }
    } else if (modelSoal === 'mcma') {
      const emptyMcma = mcmaOptions.some((o) => !o.teks.trim());
      if (emptyMcma) {
        showToast('Semua opsi MCMA wajib memiliki teks.', 'error');
        return;
      }
      if (mcmaKunci.length < 2) {
        showToast('Soal MCMA harus memiliki minimal dua kunci jawaban benar.', 'error');
        return;
      }
    } else if (modelSoal === 'kategori') {
      if (kategoriPernyataan.length < 2) {
        showToast('Model kategori memerlukan minimal 2 baris pernyataan.', 'error');
        return;
      }
      const emptyStmt = kategoriPernyataan.some((s) => !s.teks.trim());
      if (emptyStmt) {
        showToast('Semua baris pernyataan pada kategori harus diisi.', 'error');
        return;
      }
    }

    const newQuestion: Question = {
      id: questionToEdit ? questionToEdit.id : `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      mapelId,
      topik: topik.trim(),
      tingkatKesulitan,
      modelSoal,
      stimulusId: finalStimulusId,
      teksSoal: teksSoal.trim(),
      gambarUrl: gambarUrl.trim() || undefined,
      gambarAlt: gambarAlt.trim() || undefined,
      pembahasan: pembahasan.trim(),
      pembuatId: currentUser?.id || 'usr-guru-1',
      pembuatNama: currentUser?.nama || 'Guru',
      createdAt: questionToEdit ? questionToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Model fields
      pilganOptions: modelSoal === 'pilgan' ? pilganOptions : undefined,
      pilganKunci: modelSoal === 'pilgan' ? pilganKunci : undefined,

      mcmaOptions: modelSoal === 'mcma' ? mcmaOptions : undefined,
      mcmaKunci: modelSoal === 'mcma' ? mcmaKunci : undefined,
      mcmaScoringMode: modelSoal === 'mcma' ? mcmaScoringMode : undefined,

      kategoriLabels: modelSoal === 'kategori' ? [kategoriLabel1.trim(), kategoriLabel2.trim()] : undefined,
      kategoriPernyataan: modelSoal === 'kategori' ? kategoriPernyataan : undefined,
      kategoriScoringMode: modelSoal === 'kategori' ? kategoriScoringMode : undefined,
    };

    saveQuestion(newQuestion);
    onClose();
  };

  // Preset sample diagrams for quick authoring
  const sampleImages = [
    { name: 'Diagram Ekosistem Pesisir IPA', url: '/src/assets/images/stimulus_ipa_ekosistem_1793242666027.jpg' },
    { name: 'Diagram Prisma Geometri MTK', url: '/src/assets/images/stimulus_matematika_geometri_1793242666131.jpg' },
    { name: 'Infografis Literasi Energi BIND', url: '/src/assets/images/stimulus_literasi_infografis_1793242665841.jpg' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {questionToEdit ? 'Ubah Butir Soal' : 'Masukkan Soal Baru ke Bank Soal'}
              </h2>
              <span className="text-xs text-slate-500">
                Lengkapi metadata, stimulus wacana, rumus KaTeX, dan kunci jawaban
              </span>
            </div>
          </div>

          {/* Tab Switcher: Editor vs Student Preview */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'editor'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Form Input</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Pratinjau Murid</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Tutup modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'editor' ? (
            <div className="space-y-6">
              
              {/* Row 1: Mapel, Topik, Kesulitan, Model Soal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mata Pelajaran
                  </label>
                  <select
                    value={mapelId}
                    onChange={(e) => setMapelId(e.target.value as SubjectId)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="matematika">Matematika</option>
                    <option value="bahasa_indonesia">Bahasa Indonesia</option>
                    <option value="ipa">IPA Terpadu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Topik / Bab
                  </label>
                  <input
                    type="text"
                    value={topik}
                    onChange={(e) => setTopik(e.target.value)}
                    placeholder="Contoh: Geometri Ruang"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={tingkatKesulitan}
                    onChange={(e) => setTingkatKesulitan(e.target.value as DifficultyLevel)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit">Sulit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Model Soal
                  </label>
                  <select
                    value={modelSoal}
                    onChange={(e) => setModelSoal(e.target.value as QuestionModel)}
                    className="w-full rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/40 py-2 px-3 text-xs font-bold text-indigo-900 dark:text-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="pilgan">1. PILGAN (Pilihan Ganda)</option>
                    <option value="mcma">2. MCMA (Pilihan Kompleks)</option>
                    <option value="kategori">3. KATEGORI (Tabel 2 Kolom)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Wacana / Stimulus Bacaan (Opsional & Dapat Diisi Mandiri) */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <span>Wacana / Stimulus Bacaan (Opsional)</span>
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Gunakan bacaan teks atau infografis jika butir soal ini merujuk pada wacana bersama (sangat penting untuk Bahasa Indonesia & IPA).
                    </p>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto shadow-2xs">
                    <button
                      type="button"
                      onClick={() => {
                        setStimulusMode('none');
                        setStimulusId('');
                      }}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        stimulusMode === 'none'
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Tanpa Wacana
                    </button>
                    <button
                      type="button"
                      onClick={() => setStimulusMode('custom')}
                      className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                        stimulusMode === 'custom'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                    >
                      <Plus className="h-3 w-3" />
                      <span>Isi Mandiri Baru</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStimulusMode('select')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        stimulusMode === 'select'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                    >
                      Pilih dari Bank ({stimuli.length})
                    </button>
                  </div>
                </div>

                {/* Sub-Panel 1: Mode Isi Mandiri Baru */}
                {stimulusMode === 'custom' && (
                  <div className="space-y-3 pt-2 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" />
                        <span>Form Pengisian Wacana Mandiri oleh Guru</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Tersimpan otomatis ke bank wacana</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Judul Wacana / Teks Bacaan *
                        </label>
                        <input
                          type="text"
                          value={customStimulusJudul}
                          onChange={(e) => setCustomStimulusJudul(e.target.value)}
                          placeholder="Contoh: Konservasi Hutan Mangrove dan Penyerapan Karbon"
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 px-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Sumber / Referensi Wacana (Opsional)
                        </label>
                        <input
                          type="text"
                          value={customStimulusSumber}
                          onChange={(e) => setCustomStimulusSumber(e.target.value)}
                          placeholder="Contoh: Kementerian LHK & LIPI, 2025"
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 px-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Isi Teks Bacaan Wacana *
                        </label>
                        <span className="text-[10px] text-slate-400">
                          Mendukung rumus LaTeX ($...$) dan paragraf bacaan
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={customStimulusTeks}
                        onChange={(e) => setCustomStimulusTeks(e.target.value)}
                        placeholder="Ketikkan teks bacaan wacana lengkap di sini..."
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white leading-relaxed font-serif"
                      />
                    </div>

                    {/* Gambar Wacana Opsional */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <ImageIcon className="h-3.5 w-3.5 text-indigo-500" />
                          <span>Gambar / Diagram Wacana (Opsional, Maks 2 MB)</span>
                        </label>
                        {customStimulusGambarUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomStimulusGambarUrl('');
                              setCustomStimulusGambarAlt('');
                            }}
                            className="text-[11px] text-rose-500 hover:underline"
                          >
                            Hapus Gambar Wacana
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        <input
                          type="text"
                          value={customStimulusGambarUrl}
                          onChange={(e) => setCustomStimulusGambarUrl(e.target.value)}
                          placeholder="URL gambar wacana atau unggah berkas..."
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 px-2 text-xs text-slate-900 dark:text-white"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            id="custom-stimulus-upload"
                            onChange={handleCustomStimulusFileUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="custom-stimulus-upload"
                            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>Unggah Foto Wacana</span>
                          </label>
                          {customStimulusGambarUrl && (
                            <img
                              src={customStimulusGambarUrl}
                              alt="Pratinjau wacana"
                              className="h-8 w-14 object-cover rounded-md border border-slate-300 dark:border-slate-700"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Panel 2: Mode Pilih dari Bank */}
                {stimulusMode === 'select' && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <select
                      value={stimulusId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStimulusId(val);
                        const found = stimuli.find((s) => s.id === val);
                        if (found) {
                          setCustomStimulusJudul(found.judul);
                          setCustomStimulusTeks(found.teks);
                          setCustomStimulusSumber(found.sumber || '');
                          setCustomStimulusGambarUrl(found.gambarUrl || '');
                        }
                      }}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">-- Pilih Wacana Tersimpan --</option>
                      {stimuli.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.judul} ({st.teks.substring(0, 45)}...)
                        </option>
                      ))}
                    </select>

                    {/* Excerpt preview if selected */}
                    {stimulusId && (
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-serif leading-relaxed line-clamp-3">
                        <span className="font-sans font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                          Pratinjau: {stimuli.find((s) => s.id === stimulusId)?.judul}
                        </span>
                        {stimuli.find((s) => s.id === stimulusId)?.teks}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Row 3: Teks Soal with LaTeX KaTeX guide */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Teks Soal
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Gunakan <code>$rumus$</code> untuk rumus inline dan <code>$$rumus$$</code> untuk blok
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={teksSoal}
                  onChange={(e) => setTeksSoal(e.target.value)}
                  placeholder="Ketikkan teks soal di sini. Contoh: Tentukan nilai $x$ jika $2x^2 + 5x - 3 = 0$."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* Row 4: Upload / Atur Gambar Soal */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-indigo-500" />
                    <span>Gambar / Diagram Soal (Opsional, Maks 2 MB)</span>
                  </div>
                  {gambarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setGambarUrl('');
                        setGambarAlt('');
                      }}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Hapus Gambar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                      <Upload className="h-6 w-6 text-slate-400 mb-1" />
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        Pilih File Gambar (JPG / PNG / WebP)
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Dikompres otomatis</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Presets */}
                    <div className="mt-2 text-[11px] text-slate-500 flex flex-wrap gap-1 items-center">
                      <span>Contoh preset:</span>
                      {sampleImages.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setGambarUrl(s.url);
                            setGambarAlt(s.name);
                          }}
                          className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-100"
                        >
                          {s.name.split(' ')[1]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {gambarUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 p-2 bg-white dark:bg-slate-900 flex flex-col items-center">
                      <img
                        src={gambarUrl}
                        alt={gambarAlt || 'Pratinjau'}
                        className="max-h-36 w-auto object-contain rounded"
                      />
                      <input
                        type="text"
                        placeholder="Teks alternatif gambar (Alt)"
                        value={gambarAlt}
                        onChange={(e) => setGambarAlt(e.target.value)}
                        className="mt-2 w-full text-xs rounded border border-slate-200 dark:border-slate-700 px-2 py-1 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  ) : (
                    <div className="text-center text-xs text-slate-400 italic">
                      Tidak ada gambar terpilih. Soal tanpa gambar tetap dapat disimpan.
                    </div>
                  )}
                </div>
              </div>

              {/* ================= DYNAMIC FORM SESUAI MODEL SOAL ================= */}
              
              {/* MODEL 1: PILGAN */}
              {modelSoal === 'pilgan' && (
                <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                      Opsi Jawaban Pilihan Ganda (Tentukan 1 Kunci Radio)
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Kunci Terpilih: <strong>Opsi {pilganKunci}</strong>
                    </span>
                  </div>

                  <div className="space-y-3">
                    {pilganOptions.map((opt, idx) => {
                      const isKey = pilganKunci === opt.label;
                      return (
                        <div
                          key={opt.label}
                          className={`flex items-start gap-3 p-3 rounded-xl border bg-white dark:bg-slate-900 transition-colors ${
                            isKey ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <label className="flex items-center gap-2 pt-1 cursor-pointer">
                            <input
                              type="radio"
                              name="pilgan-kunci"
                              checked={isKey}
                              onChange={() => setPilganKunci(opt.label)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                              {opt.label}.
                            </span>
                          </label>

                          <div className="flex-1">
                            <input
                              type="text"
                              value={opt.teks}
                              onChange={(e) => {
                                const next = [...pilganOptions];
                                next[idx].teks = e.target.value;
                                setPilganOptions(next);
                              }}
                              placeholder={`Teks opsi ${opt.label} (mendukung $formula$)`}
                              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          {isKey && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                              KUNCI BENAR
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODEL 2: MCMA */}
              {modelSoal === 'mcma' && (
                <div className="rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                        Opsi MCMA (Centang Semua Opsi Kunci Benar)
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        Kunci aktif: {mcmaKunci.join(', ')} (Minimal 2 opsi)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Aturan Skor:</span>
                      <select
                        value={mcmaScoringMode}
                        onChange={(e) => setMcmaScoringMode(e.target.value as any)}
                        className="rounded-lg border border-purple-300 bg-white dark:bg-slate-800 text-xs py-1 px-2"
                      >
                        <option value="proportional">Proporsional (Nilai Sebagian)</option>
                        <option value="all_or_nothing">Semua Benar Baru Dinilai</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {mcmaOptions.map((opt, idx) => {
                      const isChecked = mcmaKunci.includes(opt.label);
                      return (
                        <div
                          key={opt.label}
                          className={`flex items-start gap-3 p-3 rounded-xl border bg-white dark:bg-slate-900 transition-colors ${
                            isChecked ? 'border-purple-500 ring-1 ring-purple-500' : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <label className="flex items-center gap-2 pt-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setMcmaKunci([...mcmaKunci, opt.label]);
                                } else {
                                  setMcmaKunci(mcmaKunci.filter((k) => k !== opt.label));
                                }
                              }}
                              className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                            <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                              {opt.label}.
                            </span>
                          </label>

                          <div className="flex-1">
                            <input
                              type="text"
                              value={opt.teks}
                              onChange={(e) => {
                                const next = [...mcmaOptions];
                                next[idx].teks = e.target.value;
                                setMcmaOptions(next);
                              }}
                              placeholder={`Teks pilihan ${opt.label}`}
                              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          {isChecked && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                              KUNCI
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODEL 3: KATEGORI */}
              {modelSoal === 'kategori' && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                        Tabel Pernyataan Kategori (2 Kolom)
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        Minimal 2 baris, maksimal 8 baris pernyataan
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Aturan Skor:</span>
                      <select
                        value={kategoriScoringMode}
                        onChange={(e) => setKategoriScoringMode(e.target.value as any)}
                        className="rounded-lg border border-emerald-300 bg-white dark:bg-slate-800 text-xs py-1 px-2"
                      >
                        <option value="per_row">Parsial per Baris Benar</option>
                        <option value="all_or_nothing">Semua Baris Harus Benar</option>
                      </select>
                    </div>
                  </div>

                  {/* Kategori Name Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Nama Kolom Kategori 1
                      </label>
                      <input
                        type="text"
                        value={kategoriLabel1}
                        onChange={(e) => setKategoriLabel1(e.target.value)}
                        placeholder="Contoh: Benar / Fakta / Ya"
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Nama Kolom Kategori 2
                      </label>
                      <input
                        type="text"
                        value={kategoriLabel2}
                        onChange={(e) => setKategoriLabel2(e.target.value)}
                        placeholder="Contoh: Salah / Opini / Tidak"
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Statements Rows */}
                  <div className="space-y-2">
                    {kategoriPernyataan.map((stmt, idx) => (
                      <div
                        key={stmt.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        <span className="font-bold text-xs text-slate-400 w-4">{idx + 1}.</span>
                        <input
                          type="text"
                          value={stmt.teks}
                          onChange={(e) => {
                            const next = [...kategoriPernyataan];
                            next[idx].teks = e.target.value;
                            setKategoriPernyataan(next);
                          }}
                          placeholder="Ketik teks pernyataan di sini..."
                          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 px-3 text-xs text-slate-900 dark:text-white"
                        />

                        {/* Radio for key */}
                        <div className="flex items-center gap-3 text-xs font-semibold px-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`kunci-stmt-${stmt.id}`}
                              checked={stmt.kunciJawaban === kategoriLabel1}
                              onChange={() => {
                                const next = [...kategoriPernyataan];
                                next[idx].kunciJawaban = kategoriLabel1;
                                setKategoriPernyataan(next);
                              }}
                              className="text-emerald-600"
                            />
                            <span>{kategoriLabel1}</span>
                          </label>

                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`kunci-stmt-${stmt.id}`}
                              checked={stmt.kunciJawaban === kategoriLabel2}
                              onChange={() => {
                                const next = [...kategoriPernyataan];
                                next[idx].kunciJawaban = kategoriLabel2;
                                setKategoriPernyataan(next);
                              }}
                              className="text-rose-600"
                            />
                            <span>{kategoriLabel2}</span>
                          </label>
                        </div>

                        {kategoriPernyataan.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              setKategoriPernyataan(kategoriPernyataan.filter((s) => s.id !== stmt.id));
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500"
                            title="Hapus baris"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {kategoriPernyataan.length < 8 && (
                    <button
                      type="button"
                      onClick={() => {
                        setKategoriPernyataan([
                          ...kategoriPernyataan,
                          {
                            id: `stmt-${Date.now()}`,
                            teks: '',
                            kunciJawaban: kategoriLabel1,
                          },
                        ]);
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah Baris Pernyataan</span>
                    </button>
                  )}
                </div>
              )}

              {/* Pembahasan Soal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pembahasan Soal & Langkah Solusi
                </label>
                <textarea
                  rows={4}
                  value={pembahasan}
                  onChange={(e) => setPembahasan(e.target.value)}
                  placeholder="Ketikkan pembahasan lengkap untuk dipelajari siswa setelah ujian selesai. Dukungan LaTeX formula $...$ aktif."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>
          ) : (
            /* ================= PRATINJAU PERSIS TAMPILAN MURID ================= */
            <div className="space-y-6 max-w-2xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 shadow-xs">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                  Pratinjau Tampilan Ujian Murid
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 font-semibold text-[10px]">
                  {modelSoal.toUpperCase()}
                </span>
              </div>

              {/* Pratinjau Wacana / Stimulus jika ada */}
              {((stimulusMode === 'custom' && customStimulusTeks.trim()) || (stimulusMode === 'select' && stimulusId)) && (
                <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      <span>
                        {stimulusMode === 'custom'
                          ? customStimulusJudul || 'Wacana Bacaan'
                          : stimuli.find((s) => s.id === stimulusId)?.judul}
                      </span>
                    </span>
                    {(stimulusMode === 'custom' ? customStimulusSumber : stimuli.find((s) => s.id === stimulusId)?.sumber) && (
                      <span className="text-[10px] text-slate-400 italic">
                        Sumber: {stimulusMode === 'custom' ? customStimulusSumber : stimuli.find((s) => s.id === stimulusId)?.sumber}
                      </span>
                    )}
                  </div>
                  {((stimulusMode === 'custom' ? customStimulusGambarUrl : stimuli.find((s) => s.id === stimulusId)?.gambarUrl)) && (
                    <img
                      src={stimulusMode === 'custom' ? customStimulusGambarUrl : stimuli.find((s) => s.id === stimulusId)?.gambarUrl}
                      alt="Gambar Wacana"
                      className="max-h-48 object-contain rounded-lg border bg-white dark:bg-slate-800"
                    />
                  )}
                  <div className="text-xs text-slate-700 dark:text-slate-300 font-serif leading-relaxed pt-1">
                    <MathRenderer
                      content={
                        stimulusMode === 'custom'
                          ? customStimulusTeks
                          : stimuli.find((s) => s.id === stimulusId)?.teks || ''
                      }
                    />
                  </div>
                </div>
              )}

              {/* Teks Soal */}
              <div className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                <MathRenderer content={teksSoal || '(Teks soal belum diisi)'} />
              </div>

              {gambarUrl && (
                <div className="max-w-md rounded-xl overflow-hidden border border-slate-200 p-1 bg-white">
                  <img src={gambarUrl} alt={gambarAlt} className="w-full h-auto object-contain max-h-56" />
                </div>
              )}

              {/* Preview Opsi */}
              <div className="space-y-2 pt-2">
                {modelSoal === 'pilgan' &&
                  pilganOptions.map((opt) => (
                    <div
                      key={opt.label}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                    >
                      <div className="h-6 w-6 rounded-full border border-slate-300 flex items-center justify-center font-bold">
                        {opt.label}
                      </div>
                      <div className="flex-1">
                        <MathRenderer content={opt.teks || `(Pilihan ${opt.label})`} />
                      </div>
                    </div>
                  ))}

                {modelSoal === 'mcma' &&
                  mcmaOptions.map((opt) => (
                    <div
                      key={opt.label}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                    >
                      <div className="h-5 w-5 rounded border border-slate-300" />
                      <div className="flex-1">
                        <span className="font-bold mr-1">{opt.label}.</span>
                        <MathRenderer content={opt.teks || `(Pilihan ${opt.label})`} inline />
                      </div>
                    </div>
                  ))}

                {modelSoal === 'kategori' && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                        <tr>
                          <th className="p-3">Pernyataan</th>
                          <th className="p-3 text-center">{kategoriLabel1}</th>
                          <th className="p-3 text-center">{kategoriLabel2}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {kategoriPernyataan.map((s, i) => (
                          <tr key={s.id}>
                            <td className="p-3">
                              {i + 1}. {s.teks || '(Teks pernyataan)'}
                            </td>
                            <td className="p-3 text-center">
                              <input type="radio" disabled />
                            </td>
                            <td className="p-3 text-center">
                              <input type="radio" disabled />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Preview Pembahasan */}
              <div className="mt-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs space-y-1">
                <div className="font-bold text-indigo-900 dark:text-indigo-300">
                  Pratinjau Pembahasan:
                </div>
                <div className="text-slate-700 dark:text-slate-300 font-serif">
                  <MathRenderer content={pembahasan || '(Pembahasan belum diisi)'} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Simpan Soal ke Bank Soal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
