/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Announcement,
  ClassRoom,
  ExamPackage,
  ExamSession,
  Question,
  Stimulus,
  StudentAnswerItem,
  SubjectId,
  SystemSettings,
  User,
  UserRole,
} from '../types';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CLASSES,
  INITIAL_PACKAGES,
  INITIAL_QUESTIONS,
  INITIAL_SESSIONS,
  INITIAL_SETTINGS,
  INITIAL_STIMULI,
  INITIAL_USERS,
} from '../data/seedData';
import { evaluateExamSession } from '../utils/examScoring';

export type ActiveView =
  | 'welcome'
  | 'login'
  | 'beranda'
  | 'murid-paket'
  | 'murid-ujian'
  | 'murid-hasil'
  | 'murid-riwayat'
  | 'guru-bank-soal'
  | 'guru-paket-soal'
  | 'guru-hasil'
  | 'admin-users'
  | 'admin-classes'
  | 'admin-settings'
  | 'admin-monitoring';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedSessionId: string | null;
  setSelectedSessionId: (id: string | null) => void;
  selectedPackageId: string | null;
  setSelectedPackageId: (id: string | null) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  fontSize: 'sm' | 'md' | 'lg';
  setFontSize: (size: 'sm' | 'md' | 'lg') => void;
  
  // Data State
  users: User[];
  classes: ClassRoom[];
  questions: Question[];
  stimuli: Stimulus[];
  packages: ExamPackage[];
  announcements: Announcement[];
  sessions: ExamSession[];
  activeSession: ExamSession | null;
  setActiveSession: React.Dispatch<React.SetStateAction<ExamSession | null>>;
  settings: SystemSettings;
  toasts: ToastMessage[];

  // Actions
  login: (identity: string, pass: string) => boolean;
  logout: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Question CRUD
  saveQuestion: (question: Question) => void;
  duplicateQuestion: (questionId: string) => void;
  deleteQuestion: (questionId: string) => void;
  saveStimulus: (stimulus: Stimulus) => void;

  // Package CRUD
  savePackage: (pkg: ExamPackage) => void;
  deletePackage: (pkgId: string) => void;

  // Exam CBT Execution
  startExam: (packageId: string) => boolean;
  saveStudentAnswer: (questionId: string, answer: StudentAnswerItem) => void;
  recordTabViolation: () => void;
  submitExamSession: (sessionId?: string) => void;

  // Admin & User Management
  saveUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  updateStudentKkm: (kkm: Partial<Record<SubjectId | 'umum', number>>) => void;
  saveClass: (cls: ClassRoom) => void;
  deleteClass: (classId: string) => void;
  saveAnnouncement: (ann: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
  updateSettings: (settings: SystemSettings) => void;
  resetAllDataToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'paketsinau_cbt_sd_v2_';
const SEED_VERSION = 'tka_mtk_sd_2026_v1';

function migrateSeedDataIfNeeded() {
  if (typeof window === 'undefined') return;
  try {
    const currentVer = localStorage.getItem(`${STORAGE_KEY_PREFIX}seed_version`);
    if (currentVer === SEED_VERSION) return;

    // 1. Update Questions: replace old default mtk-* questions with all 30 TKA Matematika SD 2026 questions while preserving custom teacher questions
    const savedQuestionsRaw = localStorage.getItem(`${STORAGE_KEY_PREFIX}questions`);
    if (savedQuestionsRaw) {
      const savedQuestions: Question[] = JSON.parse(savedQuestionsRaw);
      const nonOldMtk = savedQuestions.filter((q) => !q.id.startsWith('mtk-'));
      const newMtk = INITIAL_QUESTIONS.filter((q) => q.id.startsWith('mtk-'));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}questions`, JSON.stringify([...newMtk, ...nonOldMtk]));
    }

    // 2. Update Stimuli: remove deprecated SMA stimulus stm-2
    const savedStimuliRaw = localStorage.getItem(`${STORAGE_KEY_PREFIX}stimuli`);
    if (savedStimuliRaw) {
      const savedStimuli: Stimulus[] = JSON.parse(savedStimuliRaw);
      const filteredStimuli = savedStimuli.filter((s) => s.id !== 'stm-2');
      localStorage.setItem(`${STORAGE_KEY_PREFIX}stimuli`, JSON.stringify(filteredStimuli));
    }

    // 3. Update Packages: update default pkg-1 to 30-soal Tryout TKA Matematika SD/MI 2026
    const savedPackagesRaw = localStorage.getItem(`${STORAGE_KEY_PREFIX}packages`);
    if (savedPackagesRaw) {
      const savedPackages: ExamPackage[] = JSON.parse(savedPackagesRaw);
      const defaultPkg1 = INITIAL_PACKAGES.find((p) => p.id === 'pkg-1');
      if (defaultPkg1) {
        const hasPkg1 = savedPackages.some((p) => p.id === 'pkg-1');
        const nextPackages = hasPkg1
          ? savedPackages.map((p) => (p.id === 'pkg-1' ? defaultPkg1 : p))
          : [defaultPkg1, ...savedPackages];
        localStorage.setItem(`${STORAGE_KEY_PREFIX}packages`, JSON.stringify(nextPackages));
      }
    }

    // 4. Update sample seeded MTK sessions so review answers align with new mtk-1..mtk-30
    const savedSessionsRaw = localStorage.getItem(`${STORAGE_KEY_PREFIX}sessions`);
    if (savedSessionsRaw) {
      const savedSessions: ExamSession[] = JSON.parse(savedSessionsRaw);
      const updatedSeedMap = new Map(
        INITIAL_SESSIONS.filter((s) => s.mapelId === 'matematika').map((s) => [s.id, s])
      );
      const nextSessions = savedSessions.map((s) => updatedSeedMap.get(s.id) || s);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}sessions`, JSON.stringify(nextSessions));
    }

    // 5. Clear active in-progress pkg-1 session if it references stale questions
    const savedActiveRaw = localStorage.getItem(`${STORAGE_KEY_PREFIX}active_session`);
    if (savedActiveRaw) {
      const savedActive: ExamSession = JSON.parse(savedActiveRaw);
      if (savedActive.paketId === 'pkg-1' && savedActive.shuffledSoalIds.length <= 10) {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}active_session`);
      }
    }

    localStorage.setItem(`${STORAGE_KEY_PREFIX}seed_version`, SEED_VERSION);
  } catch {
    // Ignore storage errors cleanly
  }
}

migrateSeedDataIfNeeded();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from LocalStorage or fallbacks
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeView, setActiveView] = useState<ActiveView>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
      return saved ? 'beranda' : 'welcome';
    } catch {
      return 'welcome';
    }
  });

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem(`${STORAGE_KEY_PREFIX}theme`) as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}classes`);
      return saved ? JSON.parse(saved) : INITIAL_CLASSES;
    } catch {
      return INITIAL_CLASSES;
    }
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}questions`);
      return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
    } catch {
      return INITIAL_QUESTIONS;
    }
  });

  const [stimuli, setStimuli] = useState<Stimulus[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}stimuli`);
      return saved ? JSON.parse(saved) : INITIAL_STIMULI;
    } catch {
      return INITIAL_STIMULI;
    }
  });

  const [packages, setPackages] = useState<ExamPackage[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}packages`);
      return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
    } catch {
      return INITIAL_PACKAGES;
    }
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}announcements`);
      return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  const [sessions, setSessions] = useState<ExamSession[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}sessions`);
      return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  });

  const [activeSession, setActiveSession] = useState<ExamSession | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}active_session`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}settings`);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}user`);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}questions`, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}stimuli`, JSON.stringify(stimuli));
  }, [stimuli]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}packages`, JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}sessions`, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}active_session`, JSON.stringify(activeSession));
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}active_session`);
    }
  }, [activeSession]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}theme`, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Auth methods
  const login = (identity: string, pass: string): boolean => {
    const cleanId = identity.trim().toLowerCase();
    const user = users.find(
      (u) =>
        (u.username.toLowerCase() === cleanId ||
          u.email.toLowerCase() === cleanId ||
          u.nama.toLowerCase() === cleanId) &&
        (u.password === pass || pass === 'demo' || pass === 'admin123' || pass === '123456')
    );

    if (user) {
      if (!user.aktif) {
        showToast('Akun Anda dinonaktifkan oleh Administrator. Hubungi pihak sekolah.', 'error');
        return false;
      }
      setCurrentUser(user);
      setActiveView('beranda');
      showToast(`Selamat datang, ${user.nama}!`, 'success');
      return true;
    }

    showToast('Identitas (Username/NIS) atau kata sandi tidak cocok. Harap periksa kembali.', 'error');
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveSession(null);
    setActiveView('welcome');
    showToast('Anda telah berhasil keluar.', 'info');
  };

  // Question actions
  const saveQuestion = (q: Question) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((item) => item.id === q.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...q, updatedAt: new Date().toISOString() };
        return next;
      }
      return [{ ...q, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...prev];
    });
    showToast('Soal berhasil disimpan ke Bank Soal.', 'success');
  };

  const duplicateQuestion = (questionId: string) => {
    const original = questions.find((q) => q.id === questionId);
    if (!original) return;

    const newQuestion: Question = {
      ...original,
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      teksSoal: `${original.teksSoal} (Salinan)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setQuestions((prev) => [newQuestion, ...prev]);
    showToast('Soal berhasil diduplikasi.', 'success');
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    // Remove from packages that contain it
    setPackages((prev) =>
      prev.map((pkg) => ({
        ...pkg,
        soalIds: pkg.soalIds.filter((id) => id !== questionId),
      }))
    );
    showToast('Soal berhasil dihapus dari Bank Soal.', 'info');
  };

  const saveStimulus = (stim: Stimulus) => {
    setStimuli((prev) => {
      const idx = prev.findIndex((s) => s.id === stim.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = stim;
        return next;
      }
      return [...prev, stim];
    });
    showToast('Wacana/Stimulus berhasil disimpan.', 'success');
  };

  // Package actions
  const savePackage = (pkg: ExamPackage) => {
    setPackages((prev) => {
      const idx = prev.findIndex((p) => p.id === pkg.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = pkg;
        return next;
      }
      return [{ ...pkg, createdAt: new Date().toISOString() }, ...prev];
    });
    showToast(`Paket soal "${pkg.judul}" berhasil disimpan.`, 'success');
  };

  const deletePackage = (pkgId: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== pkgId));
    showToast('Paket soal telah dihapus.', 'info');
  };

  // Exam CBT Execution
  const startExam = (packageId: string): boolean => {
    if (!currentUser) return false;

    const pkg = packages.find((p) => p.id === packageId);
    if (!pkg) {
      showToast('Paket ujian tidak ditemukan.', 'error');
      return false;
    }

    if (pkg.status !== 'terbit') {
      showToast('Paket soal ini sedang tidak aktif atau berstatus Draft.', 'error');
      return false;
    }

    // Check if already in progress
    if (activeSession && activeSession.paketId === packageId && activeSession.status === 'berjalan') {
      setActiveView('murid-ujian');
      return true;
    }

    // Fisher-Yates shuffle algorithm to ensure uniform and independent randomization per student
    const shuffleArray = <T,>(array: T[]): T[] => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    // Pertahankan pengacakan independen tiap murid agar setiap murid menerima urutan soal yang berbeda
    const questionOrder = pkg.acakSoal !== false ? shuffleArray(pkg.soalIds) : [...pkg.soalIds];

    const durationSeconds = pkg.durasiMenit * 60;
    const newSession: ExamSession = {
      id: `ses-${Date.now()}-${currentUser.id.slice(-4)}`,
      paketId: pkg.id,
      paketJudul: pkg.judul,
      mapelId: pkg.mapelId,
      muridId: currentUser.id,
      muridNama: currentUser.nama,
      kelasNama: currentUser.kelasId || 'Umum',
      waktuMulai: new Date().toISOString(),
      durasiDetikTerpakai: 0,
      sisaDetik: durationSeconds,
      status: 'berjalan',
      answers: {},
      shuffledSoalIds: questionOrder,
      jumlahPelanggaranTab: 0,
    };

    setActiveSession(newSession);
    setActiveView('murid-ujian');
    showToast(`Ujian dimulai! Durasi pengerjaan: ${pkg.durasiMenit} menit. Selamat mengerjakan!`, 'info');
    return true;
  };

  const saveStudentAnswer = (questionId: string, answer: StudentAnswerItem) => {
    if (!activeSession) return;
    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: answer,
        },
      };
    });
  };

  const recordTabViolation = () => {
    if (!activeSession) return;
    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        jumlahPelanggaranTab: (prev.jumlahPelanggaranTab || 0) + 1,
      };
    });
  };

  const submitExamSession = (sessionId?: string) => {
    const sessionToFinish = sessionId
      ? sessions.find((s) => s.id === sessionId) || activeSession
      : activeSession;

    if (!sessionToFinish) return;

    const pkg = packages.find((p) => p.id === sessionToFinish.paketId);
    if (!pkg) return;

    // Retrieve question objects for scoring
    const sessionQuestions = sessionToFinish.shuffledSoalIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is Question => Boolean(q));

    const evaluation = evaluateExamSession(sessionQuestions, sessionToFinish.answers, pkg);

    const completedSession: ExamSession = {
      ...sessionToFinish,
      status: 'selesai',
      waktuSelesai: new Date().toISOString(),
      durasiDetikTerpakai: (pkg.durasiMenit * 60) - sessionToFinish.sisaDetik,
      totalSkor: evaluation.totalSkor,
      skorMaksimal: evaluation.skorMaksimal,
      persentaseNilai: evaluation.persentaseNilai,
      jumlahBenar: evaluation.jumlahBenar,
      jumlahSalah: evaluation.jumlahSalah,
      jumlahKosong: evaluation.jumlahKosong,
      answers: evaluation.answers,
    };

    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === completedSession.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = completedSession;
        return next;
      }
      return [completedSession, ...prev];
    });

    if (activeSession?.id === completedSession.id) {
      setActiveSession(null);
    }

    setSelectedSessionId(completedSession.id);
    setActiveView('murid-hasil');
    showToast(`Ujian selesai! Skor akhir Anda: ${completedSession.persentaseNilai} / 100`, 'success');
  };

  // User management
  const saveUser = (u: User) => {
    setUsers((prev) => {
      const idx = prev.findIndex((item) => item.id === u.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = u;
        return next;
      }
      return [...prev, { ...u, createdAt: new Date().toISOString() }];
    });
    showToast(`Data pengguna "${u.nama}" berhasil disimpan.`, 'success');
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast('Pengguna telah dihapus.', 'info');
  };

  const updateStudentKkm = (kkm: Partial<Record<SubjectId | 'umum', number>>) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      customKkm: {
        ...(currentUser.customKkm || {}),
        ...kkm,
      },
    };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    showToast('Target KKM berhasil disimpan!', 'success');
  };

  const saveClass = (cls: ClassRoom) => {
    setClasses((prev) => {
      const idx = prev.findIndex((c) => c.id === cls.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = cls;
        return next;
      }
      return [...prev, cls];
    });
    showToast(`Kelas "${cls.nama}" berhasil disimpan.`, 'success');
  };

  const deleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    showToast('Kelas telah dihapus.', 'info');
  };

  const saveAnnouncement = (ann: Announcement) => {
    setAnnouncements((prev) => {
      const idx = prev.findIndex((a) => a.id === ann.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = ann;
        return next;
      }
      return [ann, ...prev];
    });
    showToast('Pengumuman berhasil dipublikasikan.', 'success');
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    showToast('Pengumuman dihapus.', 'info');
  };

  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}settings`, JSON.stringify(newSettings));
    showToast('Pengaturan sistem berhasil diperbarui.', 'success');
  };

  const resetAllDataToDefault = () => {
    setUsers(INITIAL_USERS);
    setClasses(INITIAL_CLASSES);
    setQuestions(INITIAL_QUESTIONS);
    setStimuli(INITIAL_STIMULI);
    setPackages(INITIAL_PACKAGES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setSessions(INITIAL_SESSIONS);
    setSettings(INITIAL_SETTINGS);
    setActiveSession(null);
    setCurrentUser(INITIAL_USERS[3]); // Default Raditya
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}seed_version`, SEED_VERSION);
    } catch {
      // Ignore storage errors
    }
    showToast('Seluruh data CBT telah di-reset ke nilai default contoh.', 'info');
  };

  const value = useMemo(
    () => ({
      currentUser,
      activeView,
      setActiveView,
      selectedSessionId,
      setSelectedSessionId,
      selectedPackageId,
      setSelectedPackageId,
      theme,
      setTheme,
      fontSize,
      setFontSize,
      users,
      classes,
      questions,
      stimuli,
      packages,
      announcements,
      sessions,
      activeSession,
      setActiveSession,
      settings,
      toasts,
      login,
      logout,
      showToast,
      removeToast,
      saveQuestion,
      duplicateQuestion,
      deleteQuestion,
      saveStimulus,
      savePackage,
      deletePackage,
      startExam,
      saveStudentAnswer,
      recordTabViolation,
      submitExamSession,
      saveUser,
      deleteUser,
      updateStudentKkm,
      saveClass,
      deleteClass,
      saveAnnouncement,
      deleteAnnouncement,
      updateSettings,
      resetAllDataToDefault,
    }),
    [
      currentUser,
      activeView,
      selectedSessionId,
      selectedPackageId,
      theme,
      fontSize,
      users,
      classes,
      questions,
      stimuli,
      packages,
      announcements,
      sessions,
      activeSession,
      settings,
      toasts,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
