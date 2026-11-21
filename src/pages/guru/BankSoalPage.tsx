/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, QuestionModel, SubjectId, DifficultyLevel } from '../../types';
import { SoalFormModal } from './SoalFormModal';
import { MathRenderer } from '../../components/MathRenderer';
import {
  FileText,
  Plus,
  Search,
  Upload,
  Download,
  Copy,
  Edit,
  Trash2,
  Eye,
  Filter,
  CheckCircle,
  HelpCircle,
  ArrowUpDown,
  Bookmark,
  RotateCcw,
} from 'lucide-react';

export const BankSoalPage: React.FC = () => {
  const {
    questions,
    deleteQuestion,
    duplicateQuestion,
    saveQuestion,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMapel, setFilterMapel] = useState<SubjectId | 'semua'>('semua');
  const [filterTopik, setFilterTopik] = useState<string>('semua');
  const [filterModel, setFilterModel] = useState<QuestionModel | 'semua'>('semua');
  const [filterKesulitan, setFilterKesulitan] = useState<DifficultyLevel | 'semua'>('semua');
  const [sortBy, setSortBy] = useState<
    'topik_asc' | 'topik_desc' | 'terbaru' | 'terlama' | 'kesulitan' | 'model'
  >('topik_asc');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Bulk import CSV states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [importPreviewData, setImportPreviewData] = useState<Question[]>([]);

  // Unique topics derived dynamically based on selected mapel
  const availableTopics = useMemo(() => {
    const pool =
      filterMapel === 'semua'
        ? questions
        : questions.filter((q) => q.mapelId === filterMapel);
    return Array.from(new Set(pool.map((q) => q.topik.trim()).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'id')
    );
  }, [questions, filterMapel]);

  // Filtered and sorted questions
  const filteredQuestions = useMemo(() => {
    const list = questions.filter((q) => {
      if (filterMapel !== 'semua' && q.mapelId !== filterMapel) return false;
      if (filterTopik !== 'semua' && q.topik !== filterTopik) return false;
      if (filterModel !== 'semua' && q.modelSoal !== filterModel) return false;
      if (filterKesulitan !== 'semua' && q.tingkatKesulitan !== filterKesulitan) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchText = q.teksSoal.toLowerCase().includes(query);
        const matchTopic = q.topik.toLowerCase().includes(query);
        if (!matchText && !matchTopic) return false;
      }
      return true;
    });

    // Sort questions according to selected criteria
    return list.sort((a, b) => {
      if (sortBy === 'topik_asc') {
        const cmp = a.topik.localeCompare(b.topik, 'id');
        if (cmp !== 0) return cmp;
        return a.teksSoal.localeCompare(b.teksSoal, 'id');
      }
      if (sortBy === 'topik_desc') {
        const cmp = b.topik.localeCompare(a.topik, 'id');
        if (cmp !== 0) return cmp;
        return a.teksSoal.localeCompare(b.teksSoal, 'id');
      }
      if (sortBy === 'terbaru') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'terlama') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'model') {
        return a.modelSoal.localeCompare(b.modelSoal);
      }
      if (sortBy === 'kesulitan') {
        const weight: Record<DifficultyLevel, number> = { mudah: 1, sedang: 2, sulit: 3 };
        return weight[a.tingkatKesulitan] - weight[b.tingkatKesulitan];
      }
      return 0;
    });
  }, [questions, filterMapel, filterTopik, filterModel, filterKesulitan, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterMapel('semua');
    setFilterTopik('semua');
    setFilterModel('semua');
    setFilterKesulitan('semua');
    setSortBy('topik_asc');
  };

  // CSV Template download generator
  const downloadCsvTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'mapelId,topik,tingkatKesulitan,modelSoal,teksSoal,opsiA,opsiB,opsiC,opsiD,opsiE,kunciJawaban,pembahasan\n' +
      'matematika,Aljabar,mudah,pilgan,"Berapakah nilai x dari 3x - 6 = 9?","3","4","5","6","7",C,"3x = 15 => x = 5"\n' +
      'bahasa_indonesia,Ejaan Baku,sedang,pilgan,"Manakah penulisan kata baku berikut?","Antar siswa","Antarsiswa","Antar-siswa","Antar Siswa","Antar/Siswa",B,"Antar merupakan bentuk terikat"\n' +
      'ipa,Ekologi,mudah,pilgan,"Organisme pengurai pada ekosistem mangrove adalah...","Fitoplankton","Siput","Bakteri dan fungi","Elang","Kepiting",C,"Bakteri dan fungi berperan merombak serasah daun"';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'template_import_soal_paketsinau.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Template CSV berhasil diunduh.', 'success');
  };

  // Parse CSV text into questions preview
  const handleParseCsv = () => {
    if (!importCsvText.trim()) {
      showToast('Tempelkan teks CSV terlebih dahulu.', 'error');
      return;
    }

    const lines = importCsvText.trim().split('\n');
    if (lines.length < 2) {
      showToast('Data CSV minimal memiliki 1 baris header dan 1 baris data.', 'error');
      return;
    }

    const parsed: Question[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Basic CSV split
      const parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 7) {
        const [mapel, topik, kesul, model, teks, optA, optB, optC, optD, optE, kunci, pbh] = parts;
        const validModel: QuestionModel =
          model === 'mcma' || model === 'kategori' ? model : 'pilgan';
        const validMapel: SubjectId =
          mapel === 'bahasa_indonesia' || mapel === 'ipa' ? mapel : 'matematika';

        parsed.push({
          id: `imp-${Date.now()}-${i}`,
          mapelId: validMapel,
          topik: topik || 'Topik Umum',
          tingkatKesulitan: (kesul as DifficultyLevel) || 'sedang',
          modelSoal: validModel,
          teksSoal: teks || 'Teks Soal',
          pilganKunci: (kunci as any) || 'A',
          pilganOptions: [
            { label: 'A', teks: optA || 'Opsi A' },
            { label: 'B', teks: optB || 'Opsi B' },
            { label: 'C', teks: optC || 'Opsi C' },
            { label: 'D', teks: optD || 'Opsi D' },
            { label: 'E', teks: optE || 'Opsi E' },
          ],
          pembahasan: pbh || '',
          pembuatId: 'usr-guru-import',
          pembuatNama: 'Import Guru',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    if (parsed.length === 0) {
      showToast('Gagal memproses baris CSV. Pastikan kolom sesuai format.', 'error');
      return;
    }

    setImportPreviewData(parsed);
    showToast(`Berhasil memvalidasi ${parsed.length} soal siap diimpor.`, 'success');
  };

  const handleSaveImport = () => {
    importPreviewData.forEach((q) => saveQuestion(q));
    showToast(`Berhasil menambahkan ${importPreviewData.length} butir soal ke Bank Soal!`, 'success');
    setIsImportModalOpen(false);
    setImportCsvText('');
    setImportPreviewData([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Top Header Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span>Kelola Bank Soal CBT</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Pusat penyimpanan butir soal Sekolah Dasar (SD): PILGAN, MCMA, dan KATEGORI dengan dukungan gambar cerita dan rumus matematika.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={downloadCsvTemplate}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Template CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import Massal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingQuestion(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Soal Baru</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Mapel filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Mapel:</span>
              <select
                value={filterMapel}
                onChange={(e) => {
                  setFilterMapel(e.target.value as any);
                  setFilterTopik('semua');
                }}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1 px-2.5 text-xs font-medium"
              >
                <option value="semua">Semua Mata Pelajaran</option>
                <option value="matematika">Matematika</option>
                <option value="bahasa_indonesia">Bahasa Indonesia</option>
                <option value="ipa">IPA Terpadu</option>
              </select>
            </div>

            {/* Topik / Bab filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Bookmark className="h-3 w-3 text-indigo-500" />
                <span>Topik/Bab:</span>
              </span>
              <select
                value={filterTopik}
                onChange={(e) => setFilterTopik(e.target.value)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1 px-2.5 text-xs font-medium max-w-[170px] truncate"
              >
                <option value="semua">Semua Topik/Bab ({availableTopics.length})</option>
                {availableTopics.map((topik) => (
                  <option key={topik} value={topik}>
                    {topik}
                  </option>
                ))}
              </select>
            </div>

            {/* Sortir jenis Topik/Bab dan Kriteria Lain */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3 text-amber-500" />
                <span>Sortir:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/50 py-1 px-2.5 text-xs font-bold text-indigo-900 dark:text-indigo-200"
              >
                <option value="topik_asc">Topik / Bab (A → Z)</option>
                <option value="topik_desc">Topik / Bab (Z → A)</option>
                <option value="terbaru">Terbaru Ditambahkan</option>
                <option value="terlama">Terlama Ditambahkan</option>
                <option value="kesulitan">Tingkat Kesulitan</option>
                <option value="model">Model Soal</option>
              </select>
            </div>

            {/* Model Soal filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Model:</span>
              <select
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value as any)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1 px-2.5 text-xs font-medium"
              >
                <option value="semua">Semua Model</option>
                <option value="pilgan">Pilgan</option>
                <option value="mcma">MCMA</option>
                <option value="kategori">Kategori</option>
              </select>
            </div>

            {/* Difficulty filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Tingkat:</span>
              <select
                value={filterKesulitan}
                onChange={(e) => setFilterKesulitan(e.target.value as any)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1 px-2.5 text-xs font-medium"
              >
                <option value="semua">Semua Kesulitan</option>
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </select>
            </div>

            {/* Reset Button */}
            {(filterMapel !== 'semua' ||
              filterTopik !== 'semua' ||
              filterModel !== 'semua' ||
              filterKesulitan !== 'semua' ||
              searchQuery) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-semibold ml-1"
                title="Hapus semua filter"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari teks soal atau topik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
            <HelpCircle className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Tidak ada butir soal yang sesuai filter
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ubah kriteria pencarian atau tambahkan soal baru melalui tombol di atas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-slate-500 px-1">
              Menampilkan <strong>{filteredQuestions.length}</strong> butir soal terdaftar
            </div>

            {filteredQuestions.map((q, idx) => {
              const isMTK = q.mapelId === 'matematika';
              const isBIND = q.mapelId === 'bahasa_indonesia';

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-3"
                >
                  {/* Item Header Tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        #{idx + 1}
                      </span>
                      <span>·</span>
                      <span
                        className={`font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full ${
                          isMTK
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                            : isBIND
                            ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {q.mapelId.replace('_', ' ')}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px]">
                        <Bookmark className="h-3 w-3 text-indigo-500" />
                        <span>{q.topik}</span>
                      </span>
                      <span>·</span>
                      <span className="text-slate-400 capitalize">{q.tingkatKesulitan}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                        {q.modelSoal}
                      </span>
                      {q.stimulusId && (
                        <span className="text-[10px] text-indigo-600 font-medium">
                          (Wacana)
                        </span>
                      )}
                      {q.gambarUrl && (
                        <span className="text-[10px] text-emerald-600 font-medium">
                          (Gambar)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Snippet */}
                  <div className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2 font-medium">
                    <MathRenderer content={q.teksSoal} />
                  </div>

                  {/* Key Info Preview */}
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 pt-1">
                    {q.modelSoal === 'pilgan' && (
                      <span>Kunci: <strong className="text-emerald-600 font-mono">Opsi {q.pilganKunci}</strong> ({q.pilganOptions?.length || 5} opsi)</span>
                    )}
                    {q.modelSoal === 'mcma' && (
                      <span>Kunci: <strong className="text-purple-600 font-mono">{q.mcmaKunci?.join(', ')}</strong> ({q.mcmaOptions?.length} opsi)</span>
                    )}
                    {q.modelSoal === 'kategori' && (
                      <span>Kategori: <strong className="text-emerald-600">{q.kategoriPernyataan?.length} Baris ({q.kategoriLabels?.join('/')})</strong></span>
                    )}
                    <span>·</span>
                    <span>Oleh: {q.pembuatNama}</span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPreviewQuestion(q)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Pratinjau</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => duplicateQuestion(q.id)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5 text-slate-500" />
                      <span>Duplikat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuestion(q);
                        setIsFormOpen(true);
                      }}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Ubah</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(q.id)}
                      className="flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Question Form Modal */}
      <SoalFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        questionToEdit={editingQuestion}
      />

      {/* Quick Preview Modal */}
      {previewQuestion && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4"
        >
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Pratinjau Butir Soal (Model: {previewQuestion.modelSoal.toUpperCase()})
              </h3>
              <button
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
              <MathRenderer content={previewQuestion.teksSoal} />
            </div>

            {previewQuestion.gambarUrl && (
              <div className="max-w-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white p-1.5">
                <img
                  src={previewQuestion.gambarUrl}
                  alt={previewQuestion.gambarAlt || 'Gambar Soal'}
                  className="w-full h-auto object-contain max-h-64"
                />
              </div>
            )}

            {/* Preview Options / Statements */}
            {previewQuestion.modelSoal === 'pilgan' && previewQuestion.pilganOptions && (
              <div className="space-y-2">
                {previewQuestion.pilganOptions.map((opt) => {
                  const isKey = opt.label === previewQuestion.pilganKunci;
                  return (
                    <div
                      key={opt.label}
                      className={`rounded-xl border p-2.5 text-xs ${
                        isKey
                          ? 'border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`font-bold ${isKey ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-300'}`}>
                          {opt.label}.
                        </span>
                        <div className="flex-1 space-y-1.5">
                          <MathRenderer content={opt.teks} inline />
                          {opt.gambarUrl && (
                            <div>
                              <img
                                src={opt.gambarUrl}
                                alt={`Opsi ${opt.label}`}
                                className="max-h-36 w-auto rounded border border-slate-200 bg-white p-1"
                              />
                            </div>
                          )}
                        </div>
                        {isKey && (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded">
                            Kunci
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {previewQuestion.modelSoal === 'mcma' && previewQuestion.mcmaOptions && (
              <div className="space-y-2">
                {previewQuestion.mcmaOptions.map((opt) => {
                  const isKey = previewQuestion.mcmaKunci?.includes(opt.label);
                  return (
                    <div
                      key={opt.label}
                      className={`rounded-xl border p-2.5 text-xs flex items-start gap-2 ${
                        isKey
                          ? 'border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className="font-bold">{opt.label}.</span>
                      <div className="flex-1">
                        <MathRenderer content={opt.teks} inline />
                      </div>
                      {isKey && (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded">
                          Benar
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {previewQuestion.modelSoal === 'kategori' && previewQuestion.kategoriPernyataan && (
              <div className="space-y-2">
                {previewQuestion.kategoriPernyataan.map((stmt, sIdx) => (
                  <div
                    key={stmt.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1.5">
                      <div>
                        <span className="font-semibold mr-1">{sIdx + 1}.</span>
                        <MathRenderer content={stmt.teks} inline />
                      </div>
                      {stmt.gambarUrl && (
                        <img
                          src={stmt.gambarUrl}
                          alt={stmt.teks}
                          className="max-h-28 w-auto rounded border border-slate-200 bg-white p-1"
                        />
                      )}
                    </div>
                    <span className="self-start sm:self-center shrink-0 rounded-md bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                      Kunci: {stmt.kunciJawaban}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Pembahasan */}
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-3.5 text-xs space-y-1">
              <div className="font-bold text-indigo-900 dark:text-indigo-300">Pembahasan & Solusi:</div>
              <div className="text-slate-700 dark:text-slate-300 font-serif">
                <MathRenderer content={previewQuestion.pembahasan || 'Pembahasan belum tersedia.'} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewQuestion(null)}
              className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4"
        >
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hapus Butir Soal?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Soal ini akan dihapus dari bank soal dan dikeluarkan dari paket soal yang memuatnya. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteQuestion(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-semibold shadow-xs"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk CSV Import Modal */}
      {isImportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4"
        >
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Import Massal Soal dari CSV / Excel
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Salin data dari tabel spreadsheet Anda atau unduh template CSV terlebih dahulu. Format kolom: <code>mapelId, topik, tingkatKesulitan, modelSoal, teksSoal, opsiA, opsiB, opsiC, opsiD, opsiE, kunciJawaban, pembahasan</code>
            </p>

            <textarea
              rows={6}
              value={importCsvText}
              onChange={(e) => setImportCsvText(e.target.value)}
              placeholder="Tempelkan teks CSV di sini..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-mono text-slate-900 dark:text-white"
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={downloadCsvTemplate}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh Contoh Template CSV</span>
              </button>

              <button
                type="button"
                onClick={handleParseCsv}
                className="rounded-xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-950 px-4 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
              >
                Validasi & Pratinjau
              </button>
            </div>

            {/* Import Preview Table */}
            {importPreviewData.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Pratinjau ({importPreviewData.length} butir soal tervalidasi):</span>
                </div>

                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="p-2">No</th>
                        <th className="p-2">Mapel</th>
                        <th className="p-2">Topik</th>
                        <th className="p-2">Teks Soal</th>
                        <th className="p-2">Kunci</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {importPreviewData.map((p, i) => (
                        <tr key={p.id}>
                          <td className="p-2 font-mono">{i + 1}</td>
                          <td className="p-2 uppercase text-[10px] font-bold">{p.mapelId}</td>
                          <td className="p-2 truncate max-w-[120px]">{p.topik}</td>
                          <td className="p-2 truncate max-w-[200px]">{p.teksSoal}</td>
                          <td className="p-2 font-bold text-emerald-600">{p.pilganKunci}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveImport}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-semibold shadow-xs"
                  >
                    Simpan Semua ke Bank Soal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
