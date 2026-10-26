/**
 * Types for Al-Quran & Hadits Application
 */

export type RevelationType = 'Makkiyyah' | 'Madaniyyah';

export interface SurahMeta {
  nomor: number;
  nama: string; // Arabic name
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: RevelationType;
  arti: string;
  deskripsi: string;
  audioFull?: string;
  juzMulai?: number;
}

export interface Ayah {
  nomorAyat: number;
  nomorSurah?: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio?: {
    alafasy?: string;
    [key: string]: string | undefined;
  };
  tafsir?: string;
}

export interface AyahTafsirItem {
  ayat: number;
  teks: string;
}

export interface SurahTafsirDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  sumber: string;
  tafsir: Record<number, string>;
}

export interface SurahDetail extends SurahMeta {
  ayat: Ayah[];
  bismillah?: {
    teksArab: string;
    teksLatin: string;
    teksIndonesia: string;
  };
}

export interface TajwidExampleGroup {
  judul: string;
  rumusArab?: string;
  contohArab: string;
  contohLatin?: string;
}

export interface TajwidRule {
  id: string;
  pelajaranKe: number;
  halamanBuku: string;
  urutanBuku?: string;
  rumusArab?: string;
  nama: string;
  kategori: string;
  warna: string; // css color class
  hexColor: string;
  kadarHarakat?: string;
  aktifDiMushaf?: boolean;
  deskripsi: string;
  caraBaca: string;
  tingkatan?: string;
  catatanPenting?: string;
  huruf: string[];
  contohArab: string;
  contohLatin: string;
  penjelasanContoh: string;
  rincianContoh?: TajwidExampleGroup[];
  soalJawabBuku?: Array<{
    soal: string;
    jawab: string;
  }>;
  rujukanSurah?: {
    surahNomor: number;
    ayatNomor: number;
    label: string;
  };
}

export interface TajwidBookQuestion {
  nomor: number;
  pelajaran: string;
  pertanyaan: string;
  jawaban: string;
  contohArab?: string;
  ruleId?: string;
}

export interface TajwidQuizQuestion {
  id: string;
  bab: string;
  verseArabic: string;
  highlightWord: string;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export type HadithGrade = 'Shahih' | 'Hasan' | 'Hasan Shahih' | 'Muttafaq Alaih';

export interface HadithItem {
  id: string;
  kitabSlug: string;
  kitabNama: string;
  nomor: number;
  judul?: string;
  tema: string;
  arab: string;
  terjemah: string;
  sanadPerawi: string;
  derajat: HadithGrade;
  pelajaran?: string;
}

export interface HadithBook {
  id: string;
  slug: string;
  nama: string;
  penyusun: string;
  totalHadits: number;
  deskripsi: string;
}

export interface BookmarkItem {
  id: string;
  type: 'ayah' | 'hadith';
  surahNomor?: number;
  surahNamaLatin?: string;
  ayatNomor?: number;
  haditsNomor?: number;
  kitabSlug?: string;
  kitabNama?: string;
  teksArab: string;
  teksTerjemah: string;
  catatan?: string;
  timestamp: number;
}

export type AyahRange = [number, number];

export interface ReadingHistoryItem {
  surahNomor: number;
  surahNamaLatin: string;
  ayatNomor: number;
  highestAyatRead?: number;
  readRanges?: AyahRange[];
  totalAyat: number;
  timestamp: number;
}

export type CompletionStatus = 'completed' | 'in_progress' | 'unread';

export interface JuzProgressItem {
  nomor: number;
  namaMulai: string;
  surahMulai: number;
  ayatMulai: number;
  surahSelesai: number;
  ayatSelesai: number;
  surahMulaiNama: string;
  surahSelesaiNama: string;
  readAyahs: number;
  totalAyahs: number;
  percent: number;
  status: CompletionStatus;
  nextUnreadSurah: number;
  nextUnreadAyah: number;
}

export interface SurahProgressItem {
  nomor: number;
  nama: string;
  namaLatin: string;
  arti: string;
  tempatTurun: RevelationType;
  readAyahs: number;
  lastVisitedAyah: number;
  totalAyahs: number;
  percent: number;
  status: CompletionStatus;
  lastTimestamp?: number;
  nextUnreadAyah: number;
}

export interface QuranProgressStats {
  totalAyahsRead: number;
  totalQuranAyahs: number;
  remainingAyahs: number;
  percentageOverall: number;
  surahsExploredCount: number;
  surahsCompletedCount: number;
  juzCompletedCount: number;
  juzInProgressCount: number;
  estimatedJuzProgress: number;
  currentStreakDays: number;
  makkiyyahAyahs: number;
  madaniyyahAyahs: number;
  nextRecommendedRead: {
    surahNomor: number;
    surahNamaLatin: string;
    ayahNomor: number;
  };
  juzProgressList: JuzProgressItem[];
  surahProgressList: SurahProgressItem[];
  juzBreakdown: Array<{
    name: string;
    completed: number;
    total: number;
    percent: number;
  }>;
  weeklyActivity: Array<{
    day: string;
    ayat: number;
  }>;
}

export type ReadingTheme = 'light' | 'sepia' | 'dark';

export type QariId =
  | 'mishari_alafasy'
  | 'abdul_basit'
  | 'abdurrahman_assudais'
  | 'maher_almuaiqly'
  | 'saad_alghamdi';

export interface QariOption {
  id: QariId;
  nama: string;
  namaArab: string;
  keterangan: string;
}

export interface ReadingSettings {
  theme: ReadingTheme;
  arabicFontSize: number;
  translationFontSize: number;
  arabicFontFamily: 'amiri' | 'scheherazade';
  qariId?: QariId;
  showTajwid: boolean;
  showTranslation: boolean;
  showLatin: boolean;
  autoScrollAudio: boolean;
  keepScreenAwake?: boolean;
}

export interface JuzMeta {
  nomor: number;
  namaMulai: string;
  surahMulai: number;
  ayatMulai: number;
  surahSelesai: number;
  ayatSelesai: number;
}
