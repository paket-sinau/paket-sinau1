/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp, ActiveView } from '../context/AppContext';
import { Sun, Moon, LogOut, LogIn, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, activeView, setActiveView, theme, setTheme, logout } = useApp();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Nav links based on authentication state and role
  const getNavLinks = (): { label: string; view: ActiveView }[] => {
    if (!currentUser) {
      return [
        { label: 'Beranda', view: 'welcome' },
        { label: 'Simulasi CBT', view: 'welcome' },
        { label: 'Tiga Model Soal', view: 'welcome' },
        { label: 'Mata Pelajaran', view: 'welcome' },
      ];
    }

    if (currentUser.role === 'murid') {
      return [
        { label: 'Beranda', view: 'beranda' },
        { label: 'Paket Ujian SD', view: 'murid-paket' },
        { label: 'Riwayat & Hasil', view: 'murid-riwayat' },
      ];
    }

    if (currentUser.role === 'guru') {
      return [
        { label: 'Beranda', view: 'beranda' },
        { label: 'Bank Soal SD', view: 'guru-bank-soal' },
        { label: 'Kelola Paket', view: 'guru-paket-soal' },
        { label: 'Hasil & Analisis', view: 'guru-hasil' },
      ];
    }

    // Admin
    return [
      { label: 'Beranda', view: 'beranda' },
      { label: 'Manajemen Akun', view: 'admin-users' },
      { label: 'Data Kelas', view: 'admin-classes' },
      { label: 'Live Monitoring', view: 'admin-monitoring' },
      { label: 'Sistem', view: 'admin-settings' },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Single text element wordmark with logo */}
        <button
          type="button"
          onClick={() => setActiveView(currentUser ? 'beranda' : 'welcome')}
          className="flex items-center gap-2.5 text-left text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <img
            src="/assets/aistudio/paket_sinau_724f1ed0.jpg"
            alt="Logo Paket Sinau"
            className="h-9 w-9 rounded-xl object-cover shadow-sm ring-1 ring-amber-500/30 shrink-0"
          />
          <div className="flex flex-col">
            <span className="leading-tight">PAKET SINAU</span>
            <span className="text-[10px] font-medium tracking-normal text-slate-500 dark:text-slate-400">
              CBT Sekolah Dasar (SD)
            </span>
          </div>
        </button>

        {/* Zone 2: 3–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          {navLinks.map((link, idx) => {
            const isActive = activeView === link.view;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveView(link.view)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action cluster */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'light' ? 'Beralih ke Mode Gelap' : 'Beralih ke Mode Terang'}
            aria-label="Toggle tema gelap atau terang"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Auth Action */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {currentUser.nama}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {currentUser.role}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors whitespace-nowrap shrink-0"
                title="Keluar dari akun"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setActiveView('login')}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors whitespace-nowrap shrink-0"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Masuk Ujian</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
