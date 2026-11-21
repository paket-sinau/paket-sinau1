/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClassRoom } from '../../types';
import { Layers, Plus, Users, Trash2, Edit, X, GraduationCap } from 'lucide-react';

export const AdminClassManagement: React.FC = () => {
  const { classes, users, saveClass, deleteClass, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  const [nama, setNama] = useState('');
  const [tingkat, setTingkat] = useState<'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'X' | 'XI' | 'XII'>('VI');
  const [jurusan, setJurusan] = useState<'Umum' | 'Tematik' | 'MIPA' | 'IPS'>('Tematik');
  const [waliKelasNama, setWaliKelasNama] = useState('Budi Santoso, S.Pd.');

  const teachers = users.filter((u) => u.role === 'guru');

  const handleOpenCreate = () => {
    setEditingClass(null);
    setNama('');
    setTingkat('VI');
    setJurusan('Tematik');
    setWaliKelasNama(teachers[0]?.nama || 'Budi Santoso, S.Pd.');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassRoom) => {
    setEditingClass(cls);
    setNama(cls.nama);
    setTingkat(cls.tingkat);
    setJurusan(cls.jurusan);
    setWaliKelasNama(cls.waliKelasNama || '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!nama.trim()) {
      showToast('Nama kelas wajib diisi.', 'error');
      return;
    }

    const newClass: ClassRoom = {
      id: editingClass ? editingClass.id : `cls-${Date.now()}`,
      nama: nama.trim(),
      tingkat,
      jurusan,
      waliKelasNama: waliKelasNama.trim(),
      jumlahMurid: editingClass ? editingClass.jumlahMurid : 0,
    };

    saveClass(newClass);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <Layers className="h-6 w-6 text-emerald-600" />
              <span>Manajemen Kelas & Rombel</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Pengaturan rombongan belajar tingkat Sekolah Dasar (Kelas I s.d. VI) dan penugasan wali kelas untuk akses ujian CBT.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kelas Baru</span>
          </button>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {classes.map((c) => {
            const studentCount = users.filter((u) => u.kelasId === c.nama).length;

            return (
              <div
                key={c.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
                      Kelas {c.tingkat} · {c.jurusan}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 font-semibold">
                      <Users className="h-3.5 w-3.5" />
                      <span>{studentCount} Murid</span>
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {c.nama}
                  </h3>

                  <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between">
                      <span>Wali Kelas:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {c.waliKelasNama || 'Belum Ditentukan'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Ubah</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteClass(c.id)}
                    className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 hover:bg-rose-50 text-rose-600 text-xs font-semibold"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Class Form Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4"
        >
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingClass ? 'Ubah Data Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Rombel / Kelas</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Kelas 6A, Kelas 5B"
                  className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tingkat</label>
                  <select
                    value={tingkat}
                    onChange={(e) => setTingkat(e.target.value as any)}
                    className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <optgroup label="Sekolah Dasar (SD)">
                      <option value="I">Kelas I (Satu)</option>
                      <option value="II">Kelas II (Dua)</option>
                      <option value="III">Kelas III (Tiga)</option>
                      <option value="IV">Kelas IV (Empat)</option>
                      <option value="V">Kelas V (Lima)</option>
                      <option value="VI">Kelas VI (Enam)</option>
                    </optgroup>
                    <optgroup label="Tingkat Lain">
                      <option value="X">Kelas X</option>
                      <option value="XI">Kelas XI</option>
                      <option value="XII">Kelas XII</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Program / Fokus</label>
                  <select
                    value={jurusan}
                    onChange={(e) => setJurusan(e.target.value as any)}
                    className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="Tematik">Tematik / Terpadu</option>
                    <option value="Umum">Umum / Reguler</option>
                    <option value="MIPA">MIPA / Sains</option>
                    <option value="IPS">IPS / Sosial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Wali Kelas</label>
                <select
                  value={waliKelasNama}
                  onChange={(e) => setWaliKelasNama(e.target.value)}
                  className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.nama}>
                      {t.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border px-4 py-2 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-semibold shadow-xs"
              >
                Simpan Kelas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
