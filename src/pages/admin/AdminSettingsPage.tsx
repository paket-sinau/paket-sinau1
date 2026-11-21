/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Announcement } from '../../types';
import {
  Settings,
  Bell,
  RotateCcw,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    announcements,
    saveAnnouncement,
    deleteAnnouncement,
    resetAllDataToDefault,
  } = useApp();

  const [namaSekolah, setNamaSekolah] = useState(settings.namaSekolah);
  const [tahunAjaran, setTahunAjaran] = useState(settings.tahunAjaran);
  const [semester, setSemester] = useState(settings.semester);
  const [footerNotice, setFooterNotice] = useState(settings.footerNotice);
  const [maksimalPeringatanTab, setMaksimalPeringatanTab] = useState(settings.maksimalPeringatanTab);

  // Announcement state
  const [newJudul, setNewJudul] = useState('');
  const [newKonten, setNewKonten] = useState('');
  const [newTipe, setNewTipe] = useState<'info' | 'penting' | 'jadwal'>('info');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      namaSekolah: namaSekolah.trim(),
      logoUrl: settings.logoUrl || '/assets/aistudio/paket_sinau_724f1ed0.jpg',
      tahunAjaran: tahunAjaran.trim(),
      semester,
      footerNotice: footerNotice.trim(),
      maksimalPeringatanTab: Number(maksimalPeringatanTab),
    });
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudul.trim() || !newKonten.trim()) return;

    const newAnn: Announcement = {
      id: `anc-${Date.now()}`,
      judul: newJudul.trim(),
      konten: newKonten.trim(),
      tipe: newTipe,
      tanggal: new Date().toISOString().split('T')[0],
      penulis: 'Administrator Sistem',
      targetRole: 'semua',
    };

    saveAnnouncement(newAnn);
    setNewJudul('');
    setNewKonten('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-amber-600" />
            <span>Pengaturan Sistem & Informasi Sekolah</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Konfigurasi identitas instansi sekolah, tahun ajaran aktif, pengumuman beranda, dan aturan integritas CBT.
          </p>
        </div>

        {/* Settings Form */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Konfigurasi Aplikasi & Sekolah
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            {/* Official Logo Display */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center gap-4">
              <img
                src={settings.logoUrl || '/assets/aistudio/paket_sinau_724f1ed0.jpg'}
                alt="Logo Resmi Paket Sinau"
                className="h-16 w-16 rounded-xl object-cover ring-2 ring-amber-500/30 shadow-md shrink-0"
              />
              <div className="flex-1 space-y-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                  Logo Resmi PAKET SINAU Aktif
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Logo terpasang otomatis di Favicon, Navigasi Utama, Halaman Login, dan Header Ujian CBT siswa.
                </div>
                <span className="inline-block font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Status: Terpasang & Aktif
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Nama Sekolah / Lembaga</label>
                <input
                  type="text"
                  value={namaSekolah}
                  onChange={(e) => setNamaSekolah(e.target.value)}
                  className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={tahunAjaran}
                    onChange={(e) => setTahunAjaran(e.target.value)}
                    placeholder="2025/2026"
                    className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value as any)}
                    className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Teks Footer Ujian</label>
                <input
                  type="text"
                  value={footerNotice}
                  onChange={(e) => setFooterNotice(e.target.value)}
                  className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Maksimal Toleransi Pindah Tab (Anti-Cheat)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={maksimalPeringatanTab}
                  onChange={(e) => setMaksimalPeringatanTab(Number(e.target.value))}
                  className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 font-semibold shadow-xs"
              >
                Simpan Perubahan Pengaturan
              </button>
            </div>
          </form>
        </div>

        {/* Announcement Management */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <Bell className="h-5 w-5 text-amber-500" />
            <span>Kelola Pengumuman Beranda</span>
          </div>

          {/* New announcement input */}
          <form onSubmit={handleAddAnnouncement} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newJudul}
                  onChange={(e) => setNewJudul(e.target.value)}
                  placeholder="Judul Pengumuman Baru..."
                  className="w-full rounded-lg border py-1.5 px-3 bg-white dark:bg-slate-800 font-semibold"
                />
              </div>
              <div>
                <select
                  value={newTipe}
                  onChange={(e) => setNewTipe(e.target.value as any)}
                  className="w-full rounded-lg border py-1.5 px-3 bg-white dark:bg-slate-800"
                >
                  <option value="info">Info Umum</option>
                  <option value="penting">Penting / Urgent</option>
                  <option value="jadwal">Jadwal Ujian</option>
                </select>
              </div>
            </div>

            <textarea
              rows={2}
              value={newKonten}
              onChange={(e) => setNewKonten(e.target.value)}
              placeholder="Isi pengumuman lengkap yang akan tampil di beranda..."
              className="w-full rounded-lg border p-2.5 bg-white dark:bg-slate-800"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Publikasikan Pengumuman</span>
              </button>
            </div>
          </form>

          {/* Announcements List */}
          <div className="space-y-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        a.tipe === 'penting'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : a.tipe === 'jadwal'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {a.tipe}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{a.judul}</span>
                    <span className="text-slate-400">· {a.tanggal}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 line-clamp-1">{a.konten}</div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteAnnouncement(a.id)}
                  className="p-1.5 rounded text-rose-500 hover:bg-rose-50"
                  title="Hapus pengumuman"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reset Database Bawaan Card */}
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-rose-900 dark:text-rose-300">
              Reset Seluruh Database ke Kondisi Awal Sistem
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mengembalikan semua bank soal (30+ butir), paket ujian, 10 akun murid, 2 guru, dan riwayat nilai ke kondisi master awal.
            </p>
          </div>

          <button
            type="button"
            onClick={resetAllDataToDefault}
            className="flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Data Master</span>
          </button>
        </div>
      </div>
    </div>
  );
};
