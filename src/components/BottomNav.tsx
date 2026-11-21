/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp, ActiveView } from '../context/AppContext';
import { Home, BookOpen, Clock, FileEdit, Users, LayoutDashboard } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentUser, activeView, setActiveView } = useApp();

  if (!currentUser || activeView === 'murid-ujian') {
    return null;
  }

  interface NavItem {
    label: string;
    view: ActiveView;
    icon: React.ComponentType<{ className?: string }>;
  }

  let items: NavItem[] = [];

  if (currentUser.role === 'murid') {
    items = [
      { label: 'Beranda', view: 'beranda', icon: Home },
      { label: 'Paket Ujian', view: 'murid-paket', icon: BookOpen },
      { label: 'Riwayat Nilai', view: 'murid-riwayat', icon: Clock },
    ];
  } else if (currentUser.role === 'guru') {
    items = [
      { label: 'Beranda', view: 'beranda', icon: Home },
      { label: 'Bank Soal', view: 'guru-bank-soal', icon: FileEdit },
      { label: 'Paket Soal', view: 'guru-paket-soal', icon: BookOpen },
      { label: 'Analisis', view: 'guru-hasil', icon: LayoutDashboard },
    ];
  } else {
    items = [
      { label: 'Beranda', view: 'beranda', icon: Home },
      { label: 'Pengguna', view: 'admin-users', icon: Users },
      { label: 'Monitoring', view: 'admin-monitoring', icon: LayoutDashboard },
    ];
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 block md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeView === item.view;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveView(item.view)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
