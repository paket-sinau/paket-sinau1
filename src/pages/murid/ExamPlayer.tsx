/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { MathRenderer } from '../../components/MathRenderer';
import { ImageModal } from '../../components/ImageModal';
import { Question, StudentAnswerItem, StudentQuestionState } from '../../types';
import { formatDuration } from '../../utils/examScoring';
import {
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle,
  Maximize2,
  Minimize2,
  ZoomIn,
  BookOpen,
  Send,
  HelpCircle,
  FileText,
  Sun,
  Moon,
} from 'lucide-react';

export const ExamPlayer: React.FC = () => {
  const {
    activeSession,
    setActiveSession,
    questions,
    stimuli,
    packages,
    saveStudentAnswer,
    submitExamSession,
    recordTabViolation,
    fontSize,
    setFontSize,
    theme,
    setTheme,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [zoomImageAlt, setZoomImageAlt] = useState<string>('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTabWarningModal, setShowTabWarningModal] = useState(false);
  const [tabWarningCount, setTabWarningCount] = useState(0);
  const [showStimulusMobile, setShowStimulusMobile] = useState(false);

  // If no active session, render fallback
  if (!activeSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="text-center max-w-md">
          <HelpCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Tidak Ada Sesi Ujian Aktif</h2>
          <p className="text-xs text-slate-500 mt-1">
            Silakan kembali ke daftar paket soal untuk memulai ujian.
          </p>
        </div>
      </div>
    );
  }

  const pkg = packages.find((p) => p.id === activeSession.paketId);

  // All questions in this session's assigned order
  const sessionQuestions = useMemo(() => {
    return activeSession.shuffledSoalIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is Question => Boolean(q));
  }, [activeSession.shuffledSoalIds, questions]);

  const currentQuestion = sessionQuestions[currentIndex] || sessionQuestions[0];
  const currentStimulus = currentQuestion?.stimulusId
    ? stimuli.find((s) => s.id === currentQuestion.stimulusId)
    : null;

  // Retrieve current student answer item
  const currentAnswer: StudentAnswerItem = activeSession.answers[currentQuestion?.id] || {
    questionId: currentQuestion?.id,
    modelSoal: currentQuestion?.modelSoal,
    state: 'belum_dijawab',
  };

  // Timer Countdown Effect (Reactive & Thread-safe)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSession((prev) => {
        if (!prev || prev.status !== 'berjalan') return prev;
        if (prev.sisaDetik <= 1) {
          clearInterval(timer);
          setTimeout(() => submitExamSession(), 0);
          return {
            ...prev,
            sisaDetik: 0,
            durasiDetikTerpakai: prev.durasiDetikTerpakai + 1,
          };
        }
        return {
          ...prev,
          sisaDetik: prev.sisaDetik - 1,
          durasiDetikTerpakai: prev.durasiDetikTerpakai + 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setActiveSession, submitExamSession]);

  // Tab switch & visibility detector
  const handleTabSwitch = useCallback(() => {
    if (pkg?.deteksiPindahTab) {
      recordTabViolation();
      setTabWarningCount((prev) => prev + 1);
      setShowTabWarningModal(true);
    }
  }, [pkg, recordTabViolation]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        handleTabSwitch();
      }
    };

    const onBlur = () => {
      handleTabSwitch();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
    };
  }, [handleTabSwitch]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Answer handlers per model
  const handleSelectPilgan = (label: 'A' | 'B' | 'C' | 'D' | 'E') => {
    const isDoubt = currentAnswer.state === 'ragu_ragu';
    saveStudentAnswer(currentQuestion.id, {
      ...currentAnswer,
      pilganAnswer: label,
      state: isDoubt ? 'ragu_ragu' : 'sudah_dijawab',
    });
  };

  const handleToggleMcma = (label: string) => {
    const currentList = currentAnswer.mcmaAnswer || [];
    let nextList: string[];
    if (currentList.includes(label)) {
      nextList = currentList.filter((item) => item !== label);
    } else {
      nextList = [...currentList, label];
    }

    const isDoubt = currentAnswer.state === 'ragu_ragu';
    saveStudentAnswer(currentQuestion.id, {
      ...currentAnswer,
      mcmaAnswer: nextList,
      state: nextList.length > 0 ? (isDoubt ? 'ragu_ragu' : 'sudah_dijawab') : 'belum_dijawab',
    });
  };

  const handleSelectKategori = (statementId: string, category: string) => {
    const currentMap = currentAnswer.kategoriAnswer || {};
    const nextMap = { ...currentMap, [statementId]: category };
    const isDoubt = currentAnswer.state === 'ragu_ragu';

    saveStudentAnswer(currentQuestion.id, {
      ...currentAnswer,
      kategoriAnswer: nextMap,
      state: isDoubt ? 'ragu_ragu' : 'sudah_dijawab',
    });
  };

  const toggleRaguRagu = () => {
    const currentState = currentAnswer.state;
    let nextState: StudentQuestionState = 'ragu_ragu';

    if (currentState === 'ragu_ragu') {
      // Check if already answered
      const isPilganAnswered = Boolean(currentAnswer.pilganAnswer);
      const isMcmaAnswered = Boolean(currentAnswer.mcmaAnswer && currentAnswer.mcmaAnswer.length > 0);
      const isKategoriAnswered = Boolean(currentAnswer.kategoriAnswer && Object.keys(currentAnswer.kategoriAnswer).length > 0);

      nextState = (isPilganAnswered || isMcmaAnswered || isKategoriAnswered)
        ? 'sudah_dijawab'
        : 'belum_dijawab';
    }

    saveStudentAnswer(currentQuestion.id, {
      ...currentAnswer,
      state: nextState,
    });
  };

  // Summary counts for grid & modal
  const answeredCount = Object.values(activeSession.answers).filter(
    (a) => a.state === 'sudah_dijawab' || a.state === 'ragu_ragu'
  ).length;

  const doubtCount = Object.values(activeSession.answers).filter(
    (a) => a.state === 'ragu_ragu'
  ).length;

  const totalCount = sessionQuestions.length;
  const unansweredCount = totalCount - answeredCount;

  // Font size classes
  const textSizeClass =
    fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm';
  const headingSizeClass =
    fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg' : 'text-base';

  const isLowTime = activeSession.sisaDetik <= 300; // < 5 minutes

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none">
      {/* Top Fixed CBT Header */}
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <img
            src="/assets/aistudio/paket_sinau_724f1ed0.jpg"
            alt="Logo Paket Sinau"
            className="h-7 w-7 rounded-lg object-cover shadow-xs ring-1 ring-amber-500/30 shrink-0"
          />
          <span className="font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight text-sm sm:text-base">
            PAKET SINAU
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[140px] sm:max-w-xs">
            {activeSession.paketJudul}
          </span>
        </div>

        {/* Center: Realtime Countdown Timer */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-1 font-mono text-xs sm:text-sm font-bold shadow-xs transition-colors ${
              isLowTime
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <Clock className={`h-4 w-4 ${isLowTime ? 'text-white' : 'text-indigo-500'}`} />
            <span>{formatDuration(activeSession.sisaDetik)}</span>
          </div>

          {isLowTime && (
            <span className="hidden sm:inline-flex text-[11px] font-semibold text-rose-500">
              Sisa waktu &lt; 5 menit!
            </span>
          )}
        </div>

        {/* Right controls: Theme, Font size, Fullscreen, Submit */}
        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'light' ? 'Beralih ke Mode Gelap' : 'Beralih ke Mode Terang'}
            aria-label="Toggle tema gelap atau terang"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Font switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFontSize('sm')}
              className={`px-2 py-0.5 rounded ${fontSize === 'sm' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xs' : 'text-slate-500'}`}
              title="Ukuran teks kecil"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize('md')}
              className={`px-2 py-0.5 rounded ${fontSize === 'md' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xs' : 'text-slate-500'}`}
              title="Ukuran teks normal"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 rounded ${fontSize === 'lg' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xs' : 'text-slate-500'}`}
              title="Ukuran teks besar"
            >
              A+
            </button>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isFullscreen ? 'Keluar Fullscreen' : 'Mode Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Selesai Ujian</span>
          </button>
        </div>
      </header>

      {/* Main CBT Workspace Layout: Left/Center Question, Right Question Navigation */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl w-full mx-auto p-3 sm:p-4 gap-4">
        
        {/* Left/Center Section: Question & Stimulus */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          
          {/* Question Subheader */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-3 text-xs bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                Soal Nomor {currentIndex + 1}
              </span>
              <span className="text-slate-400">/ {totalCount}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {currentQuestion?.modelSoal === 'pilgan'
                  ? 'Pilihan Ganda'
                  : currentQuestion?.modelSoal === 'mcma'
                  ? 'Pilihan Ganda Kompleks (MCMA)'
                  : 'Kategori (Tabel 2 Kolom)'}
              </span>

              {currentStimulus && (
                <button
                  type="button"
                  onClick={() => setShowStimulusMobile(!showStimulusMobile)}
                  className="lg:hidden flex items-center gap-1 rounded-md bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[11px] font-medium"
                >
                  <BookOpen className="h-3 w-3" />
                  <span>{showStimulusMobile ? 'Sembunyikan Wacana' : 'Lihat Wacana'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Question Content Body (Split pane if stimulus present) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* If Stimulus exists: display responsive split or prominent banner */}
            {currentStimulus && (
              <div
                className={`rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-3 ${
                  showStimulusMobile ? 'block' : 'hidden lg:block'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                    <FileText className="h-4 w-4" />
                    <span>{currentStimulus.judul}</span>
                  </div>
                  {currentStimulus.sumber && (
                    <span className="text-[10px] text-slate-400 italic">
                      Sumber: {currentStimulus.sumber}
                    </span>
                  )}
                </div>

                {/* Stimulus Image if exists */}
                {currentStimulus.gambarUrl && (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 max-w-lg">
                    <img
                      src={currentStimulus.gambarUrl}
                      alt={currentStimulus.gambarAlt || 'Diagram Stimulus Wacana'}
                      className="w-full h-auto object-contain cursor-pointer max-h-64"
                      onClick={() => {
                        setZoomImageUrl(currentStimulus.gambarUrl || '');
                        setZoomImageAlt(currentStimulus.gambarAlt || 'Diagram Wacana');
                      }}
                      loading="lazy"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setZoomImageUrl(currentStimulus.gambarUrl || '');
                        setZoomImageAlt(currentStimulus.gambarAlt || 'Diagram Wacana');
                      }}
                      className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-slate-900/80 text-white px-2 py-1 text-[10px] backdrop-blur-xs opacity-90 hover:opacity-100"
                    >
                      <ZoomIn className="h-3 w-3" />
                      <span>Perbesar Diagram</span>
                    </button>
                  </div>
                )}

                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed border-t border-indigo-100/60 dark:border-indigo-900/40 pt-2 font-serif">
                  <MathRenderer content={currentStimulus.teks} />
                </div>
              </div>
            )}

            {/* Question Text */}
            <div className="space-y-3">
              <div className={`font-semibold text-slate-900 dark:text-white leading-relaxed ${headingSizeClass}`}>
                <MathRenderer content={currentQuestion.teksSoal} />
              </div>

              {/* Question Image if present */}
              {currentQuestion.gambarUrl && (
                <div className="relative group max-w-xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white p-2">
                  <img
                    src={currentQuestion.gambarUrl}
                    alt={currentQuestion.gambarAlt || 'Gambar Soal'}
                    className="w-full h-auto object-contain cursor-pointer rounded-lg max-h-80"
                    onClick={() => {
                      setZoomImageUrl(currentQuestion.gambarUrl || '');
                      setZoomImageAlt(currentQuestion.gambarAlt || 'Gambar Soal');
                    }}
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setZoomImageUrl(currentQuestion.gambarUrl || '');
                      setZoomImageAlt(currentQuestion.gambarAlt || 'Gambar Soal');
                    }}
                    className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-slate-900/80 text-white px-2 py-1 text-[10px] backdrop-blur-xs"
                  >
                    <ZoomIn className="h-3 w-3" />
                    <span>Perbesar Gambar</span>
                  </button>
                </div>
              )}
            </div>

            {/* Answer Options Area: Renders according to question model */}
            <div className="pt-2">
              {/* MODEL 1: PILGAN (Pilihan Ganda Biasa) */}
              {currentQuestion.modelSoal === 'pilgan' && currentQuestion.pilganOptions && (
                <div className="space-y-2.5">
                  {currentQuestion.pilganOptions.map((opt) => {
                    const isSelected = currentAnswer.pilganAnswer === opt.label;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handleSelectPilgan(opt.label)}
                        className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-500 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold text-xs transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt.label}
                        </div>
                        <div className={`flex-1 text-slate-800 dark:text-slate-200 ${textSizeClass}`}>
                          <MathRenderer content={opt.teks} />
                          {opt.gambarUrl && (
                            <div className="mt-2 inline-flex flex-col items-start gap-1.5">
                              <img
                                src={opt.gambarUrl}
                                alt={`Gambar Opsi ${opt.label}`}
                                className="max-h-52 sm:max-h-56 w-auto object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-1.5"
                                loading="lazy"
                              />
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setZoomImageUrl(opt.gambarUrl || '');
                                  setZoomImageAlt(`Gambar Opsi ${opt.label}`);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setZoomImageUrl(opt.gambarUrl || '');
                                    setZoomImageAlt(`Gambar Opsi ${opt.label}`);
                                  }
                                }}
                                className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                              >
                                <ZoomIn className="h-3 w-3" />
                                <span>Perbesar Pilihan {opt.label}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* MODEL 2: MCMA (Pilihan Ganda Kompleks - Checkbox) */}
              {currentQuestion.modelSoal === 'mcma' && currentQuestion.mcmaOptions && (
                <div className="space-y-3">
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50/50 dark:bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                    ℹ️ Model MCMA: Anda dapat mencentang lebih dari satu pilihan jawaban yang benar.
                  </div>
                  <div className="space-y-2.5">
                    {currentQuestion.mcmaOptions.map((opt) => {
                      const selectedList = currentAnswer.mcmaAnswer || [];
                      const isChecked = selectedList.includes(opt.label);
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => handleToggleMcma(opt.label)}
                          className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                            isChecked
                              ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-500 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-bold text-xs mt-0.5 transition-colors ${
                              isChecked
                                ? 'bg-indigo-600 text-white'
                                : 'border border-slate-300 dark:border-slate-600 text-transparent'
                            }`}
                          >
                            ✓
                          </div>
                          <div className={`flex-1 text-slate-800 dark:text-slate-200 ${textSizeClass}`}>
                            <span className="font-bold mr-1.5 text-slate-900 dark:text-white">
                              {opt.label}.
                            </span>
                            <MathRenderer content={opt.teks} inline />
                            {opt.gambarUrl && (
                              <img
                                src={opt.gambarUrl}
                                alt={`Gambar Opsi ${opt.label}`}
                                className="mt-2 max-h-48 w-auto object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-1.5"
                                loading="lazy"
                              />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODEL 3: KATEGORI (Tabel Pernyataan 2 Kolom) */}
              {currentQuestion.modelSoal === 'kategori' && currentQuestion.kategoriPernyataan && (
                <div className="space-y-3">
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50/50 dark:bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                    ℹ️ Model Kategori: Pilih satu kategori untuk setiap baris pernyataan pada tabel.
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-200">
                            Pernyataan / Parameter
                          </th>
                          <th className="py-3 px-3 text-center font-bold text-indigo-700 dark:text-indigo-300 w-24">
                            {currentQuestion.kategoriLabels?.[0] || 'Kategori 1'}
                          </th>
                          <th className="py-3 px-3 text-center font-bold text-violet-700 dark:text-violet-300 w-24">
                            {currentQuestion.kategoriLabels?.[1] || 'Kategori 2'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {currentQuestion.kategoriPernyataan.map((stmt, idx) => {
                          const chosen = currentAnswer.kategoriAnswer?.[stmt.id];
                          const cat1 = currentQuestion.kategoriLabels?.[0] || 'Kategori 1';
                          const cat2 = currentQuestion.kategoriLabels?.[1] || 'Kategori 2';

                          return (
                            <tr
                              key={stmt.id}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="py-3 px-4 text-slate-800 dark:text-slate-200 leading-relaxed">
                                <span className="font-semibold mr-1.5">{idx + 1}.</span>
                                <MathRenderer content={stmt.teks} inline />
                                {stmt.gambarUrl && (
                                  <div className="mt-2">
                                    <img
                                      src={stmt.gambarUrl}
                                      alt={`Ilustrasi Pernyataan ${idx + 1}`}
                                      onClick={() => {
                                        setZoomImageUrl(stmt.gambarUrl || '');
                                        setZoomImageAlt(stmt.teks || `Ilustrasi Pernyataan ${idx + 1}`);
                                      }}
                                      className="max-h-36 sm:max-h-40 w-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                                      loading="lazy"
                                    />
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center align-middle">
                                <label className="inline-flex items-center justify-center cursor-pointer p-2">
                                  <input
                                    type="radio"
                                    name={`kategori-${stmt.id}`}
                                    checked={chosen === cat1}
                                    onChange={() => handleSelectKategori(stmt.id, cat1)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  />
                                </label>
                              </td>
                              <td className="py-3 px-3 text-center align-middle">
                                <label className="inline-flex items-center justify-center cursor-pointer p-2">
                                  <input
                                    type="radio"
                                    name={`kategori-${stmt.id}`}
                                    checked={chosen === cat2}
                                    onChange={() => handleSelectKategori(stmt.id, cat2)}
                                    className="h-4 w-4 text-violet-600 focus:ring-violet-500 cursor-pointer"
                                  />
                                </label>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Nav Bar */}
          <div className="flex flex-wrap items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 gap-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
              className={`flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold transition-colors ${
                currentIndex === 0
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Sebelumnya</span>
            </button>

            {/* Ragu-ragu Button */}
            <button
              type="button"
              onClick={toggleRaguRagu}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors border ${
                currentAnswer.state === 'ragu_ragu'
                  ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs font-bold'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100'
              }`}
            >
              <Bookmark className="h-4 w-4" />
              <span>{currentAnswer.state === 'ragu_ragu' ? 'Batal Ragu' : 'Tandai Ragu-Ragu'}</span>
            </button>

            {/* Next or Finish Button */}
            {currentIndex < totalCount - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((idx) => Math.min(totalCount - 1, idx + 1))}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Kumpulkan Ujian</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Panel: Question Grid Number Navigation */}
        <div className="w-full lg:w-72 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Navigasi Soal
            </h3>
            <span className="text-[11px] font-mono font-medium text-slate-500">
              {answeredCount}/{totalCount} Terjawab
            </span>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-1.5 text-[10px] pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
              <span>Sudah ({answeredCount - doubtCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="h-3 w-3 rounded-full bg-amber-400 shrink-0" />
              <span>Ragu ({doubtCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
              <span>Belum ({unansweredCount})</span>
            </div>
          </div>

          {/* Numbers Grid */}
          <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1">
            {sessionQuestions.map((q, idx) => {
              const ans = activeSession.answers[q.id];
              const isCurrent = idx === currentIndex;
              const isDoubt = ans?.state === 'ragu_ragu';
              const isAnswered =
                ans?.state === 'sudah_dijawab' ||
                Boolean(ans?.pilganAnswer) ||
                Boolean(ans?.mcmaAnswer && ans.mcmaAnswer.length > 0) ||
                Boolean(ans?.kategoriAnswer && Object.keys(ans.kategoriAnswer).length > 0);

              let bgClasses = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

              if (isDoubt) {
                bgClasses = 'bg-amber-400 text-slate-900 border-amber-500 font-bold';
              } else if (isAnswered) {
                bgClasses = 'bg-emerald-500 text-white border-emerald-600 font-bold';
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative flex h-10 w-full items-center justify-center rounded-xl border text-xs font-semibold transition-all ${bgClasses} ${
                    isCurrent
                      ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-sm'
                      : 'hover:opacity-90'
                  }`}
                  aria-label={`Pindah ke soal nomor ${idx + 1}`}
                >
                  <span>{idx + 1}</span>
                  {ans?.modelSoal === 'kategori' && (
                    <span className="absolute top-0.5 right-0.5 text-[8px] opacity-70">K</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Submit Trigger Box */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-xs font-semibold shadow-xs transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Selesai & Kumpulkan</span>
            </button>
            <div className="text-[11px] text-slate-400 text-center mt-2">
              Autosave aktif: jawaban disimpan aman ke penyimpanan peramban.
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Lightbox Modal */}
      <ImageModal
        isOpen={Boolean(zoomImageUrl)}
        onClose={() => setZoomImageUrl(null)}
        imageUrl={zoomImageUrl || ''}
        altText={zoomImageAlt}
      />

      {/* Anti-cheat tab violation warning modal */}
      {showTabWarningModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4"
        >
          <div className="rounded-2xl border border-rose-300 bg-white dark:bg-slate-900 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Peringatan Integritas Ujian!
                </h3>
                <span className="text-xs text-rose-600 font-semibold">
                  Terdeteksi Berpindah Tab ({tabWarningCount}x)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Anda terdeteksi meninggalkan halaman atau berpindah aplikasi selama ujian berlangsung.
              Aktivitas ini dicatat dalam log ujian dan dapat membatalkan sesi Anda jika melebihi batas toleransi.
            </p>

            <button
              type="button"
              onClick={() => setShowTabWarningModal(false)}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-semibold transition-colors"
            >
              Saya Mengerti & Kembali ke Soal
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4"
        >
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Konfirmasi Pengumpulan Ujian
                </h3>
                <span className="text-xs text-slate-500">
                  Ringkasan lembar jawaban sebelum dikirim
                </span>
              </div>
            </div>

            {/* Summary statistics */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center text-xs">
              <div>
                <div className="text-lg font-bold text-emerald-600">{answeredCount - doubtCount}</div>
                <div className="text-[10px] text-slate-500">Sudah Dijawab</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-500">{doubtCount}</div>
                <div className="text-[10px] text-slate-500">Ragu-Ragu</div>
              </div>
              <div>
                <div className="text-lg font-bold text-rose-500">{unansweredCount}</div>
                <div className="text-[10px] text-slate-500">Belum Dijawab</div>
              </div>
            </div>

            {doubtCount > 0 && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-2.5 text-[11px] text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                ⚠️ Masih ada <strong>{doubtCount}</strong> soal yang Anda tandai ragu-ragu. Jawaban yang dipilih tetap akan dinilai.
              </div>
            )}

            {unansweredCount > 0 && (
              <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 p-2.5 text-[11px] text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                ⚠️ Anda memiliki <strong>{unansweredCount}</strong> butir soal yang belum diisi sama sekali.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Batal, Lanjut Mengerjakan
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false);
                  submitExamSession();
                }}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-semibold shadow-xs transition-colors"
              >
                Yakin, Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
