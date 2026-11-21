/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, setActiveView } = useApp();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identity.trim()) {
      setErrorMsg('Harap masukkan Username, NIS, atau Email.');
      return;
    }
    if (!password) {
      setErrorMsg('Harap masukkan kata sandi.');
      return;
    }

    const ok = login(identity, password);
    if (!ok) {
      setErrorMsg('Username/NIS atau kata sandi tidak cocok. Harap periksa kembali atau hubungi Administrator.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          type="button"
          onClick={() => setActiveView('welcome')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Halaman Utama</span>
        </button>

        <div className="flex justify-center mb-3">
          <img
            src="/assets/aistudio/paket_sinau_724f1ed0.jpg"
            alt="Logo Paket Sinau"
            className="h-16 w-16 rounded-2xl shadow-xl ring-2 ring-amber-500/30 object-cover"
          />
        </div>
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Masuk ke Portal PAKET SINAU
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
          Masukkan NIS / NIP / Username terdaftar untuk mengakses simulasi CBT
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 px-6 shadow-xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            <div>
              <label
                htmlFor="identity"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Username / NIS / Email
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="identity"
                  type="text"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="Contoh: raditya.p atau guru.budi"
                  className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Kata Sandi
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Ingat saya</span>
              </label>
              <span className="text-slate-400">
                Lupa sandi? Hubungi Admin
              </span>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/25 transition-colors"
            >
              Masuk ke Aplikasi
            </button>
          </form>

          {/* User Guide Card */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 text-center mb-2">
              Panduan Akses Pengguna
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <p>• <strong>Murid:</strong> Masuk dengan username/NIS yang diberikan oleh pihak sekolah.</p>
              <p>• <strong>Guru:</strong> Masuk untuk membuat soal, mengelola paket, dan melihat hasil.</p>
              <p>• <strong>Admin:</strong> Masuk untuk menambah akun pengguna, mengelola kelas, dan pengaturan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
