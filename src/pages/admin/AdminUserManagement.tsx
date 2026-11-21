/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  Users,
  Plus,
  Search,
  Upload,
  KeyRound,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Shield,
  GraduationCap,
  BookOpen,
  X,
  Sparkles,
} from 'lucide-react';

export const AdminUserManagement: React.FC = () => {
  const { users, classes, saveUser, deleteUser, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'semua'>('semua');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('murid');
  const [kelasId, setKelasId] = useState(classes[0]?.nama || 'Kelas 6A');
  const [password, setPassword] = useState('siswa');
  const [aktif, setAktif] = useState(true);

  // Bulk import modal
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (filterRole !== 'semua' && u.role !== filterRole) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.nama.toLowerCase().includes(q);
        const matchUser = u.username.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchKelas = u.kelasId?.toLowerCase().includes(q);
        if (!matchName && !matchUser && !matchEmail && !matchKelas) return false;
      }
      return true;
    });
  }, [users, filterRole, searchQuery]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setNama('');
    setUsername('');
    setEmail('');
    setRole('murid');
    setKelasId(classes[0]?.nama || 'Kelas 6A');
    setPassword('siswa');
    setAktif(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setNama(user.nama);
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);
    setKelasId(user.kelasId || classes[0]?.nama || 'Kelas 6A');
    setPassword(user.password || '');
    setAktif(user.aktif);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!nama.trim() || !username.trim()) {
      showToast('Nama dan Username/NIS wajib diisi.', 'error');
      return;
    }

    const newUser: User = {
      id: editingUser ? editingUser.id : `usr-${Date.now()}`,
      nama: nama.trim(),
      username: username.trim(),
      email: email.trim() || `${username.trim()}@sekolah.sch.id`,
      role,
      kelasId: role === 'murid' ? kelasId : undefined,
      password: password || '123456',
      aktif,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
    };

    saveUser(newUser);
    setIsModalOpen(false);
  };

  const handleResetPassword = (user: User) => {
    const defaultPass = user.role === 'murid' ? 'siswa' : user.role === 'guru' ? 'guru' : 'admin';
    saveUser({ ...user, password: defaultPass });
    showToast(`Password untuk ${user.nama} di-reset ke "${defaultPass}"`, 'info');
  };

  const handleToggleAktif = (user: User) => {
    saveUser({ ...user, aktif: !user.aktif });
    showToast(`Status pengguna ${user.nama} diubah menjadi ${!user.aktif ? 'Aktif' : 'Nonaktif'}`, 'info');
  };

  // Bulk CSV Import for Users
  const handleBulkImport = () => {
    if (!bulkCsvText.trim()) {
      showToast('Tempelkan teks CSV terlebih dahulu.', 'error');
      return;
    }

    const lines = bulkCsvText.trim().split('\n');
    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const [uName, uUsername, uEmail, uRole, uKelas, uPass] = line
        .split(',')
        .map((p) => p.replace(/^"|"$/g, '').trim());

      if (uName && uUsername) {
        const validRole: UserRole =
          uRole === 'guru' || uRole === 'admin' ? uRole : 'murid';
        saveUser({
          id: `usr-bulk-${Date.now()}-${i}`,
          nama: uName,
          username: uUsername,
          email: uEmail || `${uUsername}@sekolah.sch.id`,
          role: validRole,
          kelasId: validRole === 'murid' ? uKelas || classes[0]?.nama || 'Kelas 6A' : undefined,
          password: uPass || 'siswa',
          aktif: true,
          createdAt: new Date().toISOString(),
        });
        importedCount++;
      }
    }

    showToast(`Berhasil mengimpor ${importedCount} pengguna baru!`, 'success');
    setIsBulkImportOpen(false);
    setBulkCsvText('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <Users className="h-6 w-6 text-amber-600" />
              <span>Manajemen Akun Pengguna</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Kelola data peserta ujian (murid), guru pengajar, dan administrator sistem CBT.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsBulkImportOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import CSV Siswa/Guru</span>
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Pengguna Baru</span>
            </button>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setFilterRole('semua')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterRole === 'semua'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Semua ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterRole('murid')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterRole === 'murid'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Murid ({users.filter((u) => u.role === 'murid').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterRole('guru')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterRole === 'guru'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Guru ({users.filter((u) => u.role === 'guru').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterRole('admin')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterRole === 'admin'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Admin ({users.filter((u) => u.role === 'admin').length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, NIS, username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Nama Pengguna</th>
                  <th className="py-3 px-4">Username / NIS</th>
                  <th className="py-3 px-4">Peran</th>
                  <th className="py-3 px-4">Kelas / Mapel</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{u.nama}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {u.username}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : u.role === 'guru'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}
                      >
                        {u.role === 'admin' && <Shield className="h-3 w-3" />}
                        {u.role === 'guru' && <BookOpen className="h-3 w-3" />}
                        {u.role === 'murid' && <GraduationCap className="h-3 w-3" />}
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {u.role === 'murid' ? u.kelasId || '-' : u.mapelAjar?.join(', ') || 'Semua'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleAktif(u)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                          u.aktif
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                        title="Klik untuk mengubah status aktif"
                      >
                        {u.aktif ? '● Aktif' : '○ Nonaktif'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleResetPassword(u)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="h-3.5 w-3.5 text-amber-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Ubah Data"
                        >
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => deleteUser(u.id)}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 hover:bg-rose-50 text-rose-600 transition-colors"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4"
        >
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingUser ? 'Ubah Data Pengguna' : 'Tambah Pengguna Baru'}
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
                <label className="block font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Budi Pratama"
                  className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Username / NIS</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: budi.p"
                    className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Peran</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="murid">Murid (Peserta Ujian)</option>
                    <option value="guru">Guru (Pembuat Soal)</option>
                    <option value="admin">Admin Sistem</option>
                  </select>
                </div>
              </div>

              {role === 'murid' && (
                <div>
                  <label className="block font-semibold mb-1">Rombongan Belajar / Kelas</label>
                  <select
                    value={kelasId}
                    onChange={(e) => setKelasId(e.target.value)}
                    className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.nama}>
                        {c.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Kata Sandi</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Status Akun</label>
                  <select
                    value={aktif ? 'true' : 'false'}
                    onChange={(e) => setAktif(e.target.value === 'true')}
                    className="w-full rounded-xl border py-2 px-3 bg-white dark:bg-slate-800"
                  >
                    <option value="true">Aktif (Dapat Login)</option>
                    <option value="false">Nonaktif (Diblokir)</option>
                  </select>
                </div>
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
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-xs font-semibold shadow-xs"
              >
                Simpan Pengguna
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk CSV Modal */}
      {isBulkImportOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4"
        >
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 max-w-xl w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Import Massal Pengguna dari CSV
            </h3>
            <p className="text-xs text-slate-500">
              Format baris: <code>Nama,Username,Email,Peran (murid/guru),Kelas,Password</code>
            </p>
            <textarea
              rows={6}
              value={bulkCsvText}
              onChange={(e) => setBulkCsvText(e.target.value)}
              placeholder="Contoh:
Budi Pratama,budi.p,budi@siswa.id,murid,Kelas 6A,siswa123
Siti Aminah,siti.a,siti@siswa.id,murid,Kelas 5B,siswa123"
              className="w-full rounded-xl border p-3 font-mono text-xs bg-white dark:bg-slate-800"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkImportOpen(false)}
                className="rounded-xl border px-4 py-2 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-xs font-semibold"
              >
                Proses Import Pengguna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
