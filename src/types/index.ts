/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'murid' | 'guru' | 'admin';

export type SubjectId = 'matematika' | 'bahasa_indonesia' | 'ipa' | 'campuran';

export type QuestionModel = 'pilgan' | 'mcma' | 'kategori';

export type DifficultyLevel = 'mudah' | 'sedang' | 'sulit';

export interface User {
  id: string;
  username: string; // atau NIS untuk murid / NIP untuk guru
  nama: string;
  email: string;
  role: UserRole;
  password?: string;
  kelasId?: string; // Khusus murid, e.g. "Kelas 6A", "Kelas 5B"
  mapelAjar?: SubjectId[]; // Khusus guru
  avatarUrl?: string;
  aktif: boolean;
  createdAt: string;
  customKkm?: Partial<Record<SubjectId | 'umum', number>>; // Target batas KKM mandiri siswa
}

export interface ClassRoom {
  id: string;
  nama: string;
  tingkat: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'X' | 'XI' | 'XII';
  jurusan: 'Umum' | 'Tematik' | 'MIPA' | 'IPS';
  waliKelasId?: string;
  waliKelasNama?: string;
  jumlahMurid: number;
}

export interface SubjectInfo {
  id: SubjectId;
  nama: string;
  singkatan: string;
  deskripsi: string;
  warnaTema: string; // Tailwind color class or hex
  bgSoft: string;
  badgeColor: string;
  borderAccent: string;
  ikon: string; // Lucide icon identifier
}

export interface Stimulus {
  id: string;
  judul: string;
  teks: string;
  sumber?: string;
  gambarUrl?: string;
  gambarAlt?: string;
}

export interface PilganOption {
  label: 'A' | 'B' | 'C' | 'D' | 'E';
  teks: string;
  gambarUrl?: string;
}

export interface KategoriStatement {
  id: string;
  teks: string;
  kunciJawaban: string; // nama kategori yang benar (e.g. "Benar", "Fakta")
  gambarUrl?: string;
}

export interface Question {
  id: string;
  mapelId: SubjectId;
  topik: string;
  tingkatKesulitan: DifficultyLevel;
  modelSoal: QuestionModel;
  teksSoal: string;
  gambarUrl?: string;
  gambarAlt?: string;
  stimulusId?: string; // Relasi ke wacana/stimulus jika ada
  
  // Model 1: PILGAN (Pilihan Ganda biasa - 1 jawaban benar)
  pilganOptions?: PilganOption[];
  pilganKunci?: 'A' | 'B' | 'C' | 'D' | 'E';

  // Model 2: MCMA (Pilihan Ganda Kompleks - multi jawaban benar)
  mcmaOptions?: { id: string; label: string; teks: string; gambarUrl?: string }[];
  mcmaKunci?: string[]; // array label/id yang benar, e.g. ["A", "C"]
  mcmaScoringMode?: 'all_or_nothing' | 'proportional'; // default: 'proportional'

  // Model 3: KATEGORI (Tabel Pernyataan 2 Kolom)
  kategoriLabels?: [string, string]; // e.g. ["Benar", "Salah"] atau ["Fakta", "Opini"]
  kategoriPernyataan?: KategoriStatement[]; // 2-8 baris
  kategoriScoringMode?: 'all_or_nothing' | 'per_row'; // default: 'per_row'

  pembahasan: string;
  pembuatId: string;
  pembuatNama: string;
  createdAt: string;
  updatedAt: string;
}

export type ExamStatus = 'draft' | 'terbit' | 'ditutup';

export interface ExamPackage {
  id: string;
  judul: string;
  mapelId: SubjectId;
  deskripsi: string;
  durasiMenit: number;
  bobotBenar: number; // default: 4 atau 1
  bobotSalah: number; // default: 0 atau -1
  bobotKosong: number; // default: 0
  acakSoal: boolean;
  acakOpsi: boolean;
  waktuBuka: string; // ISO date string
  waktuTutup: string; // ISO date string
  kelasAkses: string[]; // id kelas atau ['semua']
  kodeAkses?: string; // token jika ada
  soalIds: string[]; // urutan soal
  status: ExamStatus;
  izinkanLihatPembahasan: boolean; // apakah murid langsung bisa lihat pembahasan
  deteksiPindahTab: boolean; // catat/peringatkan jika pindah tab
  pembuatId: string;
  pembuatNama: string;
  createdAt: string;
}

export type StudentQuestionState = 'belum_dijawab' | 'sudah_dijawab' | 'ragu_ragu';

export interface StudentAnswerItem {
  questionId: string;
  modelSoal: QuestionModel;
  state: StudentQuestionState;
  
  // Jawaban untuk masing-masing model
  pilganAnswer?: 'A' | 'B' | 'C' | 'D' | 'E';
  mcmaAnswer?: string[]; // array label/id terpilih
  kategoriAnswer?: Record<string, string>; // statementId -> chosenCategory

  // Hasil koreksi otomatis
  isFullyCorrect?: boolean;
  scoreAwarded?: number; // Nilai yang didapat
  maxScorePossible?: number; // Nilai maksimum untuk soal ini
}

export interface ExamSession {
  id: string;
  paketId: string;
  paketJudul: string;
  mapelId: SubjectId;
  muridId: string;
  muridNama: string;
  kelasNama: string;
  waktuMulai: string;
  waktuSelesai?: string;
  durasiDetikTerpakai: number;
  sisaDetik: number;
  status: 'berjalan' | 'selesai' | 'dibatalkan';
  answers: Record<string, StudentAnswerItem>; // questionId -> answer
  shuffledSoalIds: string[]; // urutan yang diacak untuk sesi murid ini
  jumlahPelanggaranTab: number;
  totalSkor?: number;
  skorMaksimal?: number;
  persentaseNilai?: number;
  jumlahBenar?: number;
  jumlahSalah?: number;
  jumlahKosong?: number;
}

export interface Announcement {
  id: string;
  judul: string;
  konten: string;
  tipe: 'info' | 'penting' | 'jadwal';
  tanggal: string;
  penulis: string;
  targetRole?: UserRole | 'semua';
}

export interface SystemSettings {
  namaSekolah: string;
  logoUrl?: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  footerNotice: string;
  maksimalPeringatanTab: number;
}
