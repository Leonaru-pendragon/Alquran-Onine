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

export interface SurahDetail extends SurahMeta {
  ayat: Ayah[];
  bismillah?: {
    teksArab: string;
    teksLatin: string;
    teksIndonesia: string;
  };
}

export interface TajwidRule {
  id: string;
  nama: string;
  kategori: string;
  warna: string; // css color class
  hexColor: string;
  deskripsi: string;
  caraBaca: string;
  huruf: string[];
  contohArab: string;
  contohLatin: string;
  penjelasanContoh: string;
}

export type HadithGrade = 'Shahih' | 'Hasan' | 'Muttafaq Alaih';

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

export interface ReadingHistoryItem {
  surahNomor: number;
  surahNamaLatin: string;
  ayatNomor: number;
  totalAyat: number;
  timestamp: number;
}

export type ReadingTheme = 'light' | 'sepia' | 'dark';

export interface ReadingSettings {
  theme: ReadingTheme;
  arabicFontSize: number;
  translationFontSize: number;
  arabicFontFamily: 'amiri' | 'scheherazade';
  showTajwid: boolean;
  showTranslation: boolean;
  showLatin: boolean;
  autoScrollAudio: boolean;
}

export interface JuzMeta {
  nomor: number;
  namaMulai: string;
  surahMulai: number;
  ayatMulai: number;
  surahSelesai: number;
  ayatSelesai: number;
}
