/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/ToastContainer';

// Pages
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { BerandaPage } from './pages/BerandaPage';

// Murid Pages
import { PaketSoalList } from './pages/murid/PaketSoalList';
import { ExamPlayer } from './pages/murid/ExamPlayer';
import { ExamResultPage } from './pages/murid/ExamResultPage';
import { RiwayatMuridPage } from './pages/murid/RiwayatMuridPage';

// Guru Pages
import { BankSoalPage } from './pages/guru/BankSoalPage';
import { PaketSoalManager } from './pages/guru/PaketSoalManager';
import { HasilAnalisisPage } from './pages/guru/HasilAnalisisPage';

// Admin Pages
import { AdminUserManagement } from './pages/admin/AdminUserManagement';
import { AdminClassManagement } from './pages/admin/AdminClassManagement';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminMonitoringPage } from './pages/admin/AdminMonitoringPage';

const AppContent: React.FC = () => {
  const { activeView, settings } = useApp();

  const isExamRunning = activeView === 'murid-ujian';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Navbar (hidden during active CBT exam to prevent distraction) */}
      {!isExamRunning && <Navbar />}

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'welcome' && <WelcomePage />}
        {activeView === 'login' && <LoginPage />}
        {activeView === 'beranda' && <BerandaPage />}
        
        {/* Murid */}
        {activeView === 'murid-paket' && <PaketSoalList />}
        {activeView === 'murid-ujian' && <ExamPlayer />}
        {activeView === 'murid-hasil' && <ExamResultPage />}
        {activeView === 'murid-riwayat' && <RiwayatMuridPage />}

        {/* Guru */}
        {activeView === 'guru-bank-soal' && <BankSoalPage />}
        {activeView === 'guru-paket-soal' && <PaketSoalManager />}
        {activeView === 'guru-hasil' && <HasilAnalisisPage />}

        {/* Admin */}
        {activeView === 'admin-users' && <AdminUserManagement />}
        {activeView === 'admin-classes' && <AdminClassManagement />}
        {activeView === 'admin-settings' && <AdminSettingsPage />}
        {activeView === 'admin-monitoring' && <AdminMonitoringPage />}
      </main>

      {/* Footer (hidden during active CBT exam and print) */}
      {!isExamRunning && (
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-400 dark:text-slate-500 print:hidden mb-12 md:mb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
            <p className="font-medium text-slate-600 dark:text-slate-400">
              {settings.namaSekolah} · Tahun Ajaran {settings.tahunAjaran} ({settings.semester})
            </p>
            <p>{settings.footerNotice}</p>
          </div>
        </footer>
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
