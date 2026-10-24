import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterSurahs,
  filterHadiths,
  calculateReadingProgress,
  isAyahBookmarked,
  toggleBookmarkItem,
  cleanTafsirText,
  calculateQuranProgressStats,
  mergeReadingHistory,
  toggleSurahCompletionInHistory,
  toggleJuzCompletionInHistory
} from './quranLogic.ts';
import { SURAH_METADATA_LIST } from '../data/quranMetadata.ts';
import type { SurahMeta, HadithItem, BookmarkItem, ReadingHistoryItem } from '../types/quran.ts';

const mockSurahs: SurahMeta[] = [
  { nomor: 1, nama: "الفاتحة", namaLatin: "Al-Fatihah", jumlahAyat: 7, tempatTurun: "Makkiyyah", arti: "Pembukaan", deskripsi: "Surah pembuka" },
  { nomor: 2, nama: "البقرة", namaLatin: "Al-Baqarah", jumlahAyat: 286, tempatTurun: "Madaniyyah", arti: "Sapi Betina", deskripsi: "Surah terpanjang" },
  { nomor: 18, nama: "الكهف", namaLatin: "Al-Kahf", jumlahAyat: 110, tempatTurun: "Makkiyyah", arti: "Gua", deskripsi: "Sunnah Jumat" }
];

test('filterSurahs searches correctly by Latin name', () => {
  const result = filterSurahs(mockSurahs, 'kahf');
  assert.equal(result.length, 1);
  assert.equal(result[0].nomor, 18);
});

test('filterSurahs filters by revelation type', () => {
  const makkiyyah = filterSurahs(mockSurahs, '', 'Makkiyyah');
  assert.equal(makkiyyah.length, 2);
  const madaniyyah = filterSurahs(mockSurahs, '', 'Madaniyyah');
  assert.equal(madaniyyah.length, 1);
  assert.equal(madaniyyah[0].nomor, 2);
});

test('calculateReadingProgress computes valid percentages', () => {
  assert.equal(calculateReadingProgress(7, 7), 100);
  assert.equal(calculateReadingProgress(1, 2), 50);
  assert.equal(calculateReadingProgress(0, 100), 1);
});

test('toggleBookmarkItem adds and removes bookmarks idempotently', () => {
  const initialBookmarks: BookmarkItem[] = [];

  const added = toggleBookmarkItem(initialBookmarks, {
    type: 'ayah',
    surahNomor: 1,
    surahNamaLatin: 'Al-Fatihah',
    ayatNomor: 1,
    teksArab: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    teksTerjemah: 'Dengan nama Allah'
  });

  assert.equal(added.length, 1);
  assert.equal(isAyahBookmarked(added, 1, 1), true);
  assert.equal(isAyahBookmarked(added, 1, 2), false);

  const removed = toggleBookmarkItem(added, {
    type: 'ayah',
    surahNomor: 1,
    surahNamaLatin: 'Al-Fatihah',
    ayatNomor: 1,
    teksArab: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    teksTerjemah: 'Dengan nama Allah'
  });

  assert.equal(removed.length, 0);
  assert.equal(isAyahBookmarked(removed, 1, 1), false);
});

test('filterHadiths matches keywords in Indonesian translation and topic', () => {
  const mockHadiths: HadithItem[] = [
    {
      id: 'h1',
      kitabSlug: 'bukhari',
      kitabNama: 'Shahih Al-Bukhari',
      nomor: 1,
      tema: 'Niat & Ikhlas',
      arab: 'إنما الأعمال بالنيات',
      terjemah: 'Sesungguhnya segala amalan tergantung niatnya',
      sanadPerawi: 'Umar bin Khaththab',
      derajat: 'Muttafaq Alaih'
    },
    {
      id: 'h2',
      kitabSlug: 'muslim',
      kitabNama: 'Shahih Muslim',
      nomor: 2,
      tema: 'Ilmu Pengetahuan',
      arab: 'طلب العلم فريضة',
      terjemah: 'Menuntut ilmu itu wajib bagi setiap muslim',
      sanadPerawi: 'Anas bin Malik',
      derajat: 'Shahih'
    }
  ];

  const resultNiat = filterHadiths(mockHadiths, 'niat');
  assert.equal(resultNiat.length, 1);
  assert.equal(resultNiat[0].nomor, 1);

  const resultTopic = filterHadiths(mockHadiths, '', 'semua', 'Ilmu Pengetahuan');
  assert.equal(resultTopic.length, 1);
  assert.equal(resultTopic[0].id, 'h2');
});

test('cleanTafsirText strips html tags and divides into paragraphs', () => {
  const raw = '<p>Paragraf 1</p><br><br><i>Paragraf 2</i> dengan <b>penjelasan</b>.\n\nParagraf 3.';
  const paragraphs = cleanTafsirText(raw);
  assert.equal(paragraphs.length, 3);
  assert.equal(paragraphs[0], 'Paragraf 1');
  assert.equal(paragraphs[1], 'Paragraf 2 dengan penjelasan.');
  assert.equal(paragraphs[2], 'Paragraf 3.');
});

test('calculateQuranProgressStats computes accurate progress and breakdown', () => {
  const history: ReadingHistoryItem[] = [
    { surahNomor: 1, surahNamaLatin: 'Al-Fatihah', ayatNomor: 7, totalAyat: 7, timestamp: Date.now() },
    { surahNomor: 18, surahNamaLatin: 'Al-Kahf', ayatNomor: 10, totalAyat: 110, timestamp: Date.now() - 86400000 }
  ];

  const stats = calculateQuranProgressStats(history, mockSurahs);
  assert.equal(stats.totalAyahsRead, 17);
  assert.equal(stats.surahsExploredCount, 2);
  assert.equal(stats.surahsCompletedCount, 1);
  assert.equal(stats.juzBreakdown.length, 6);
  assert.equal(stats.weeklyActivity.length, 7);
});

test('30 Juz canonical totals sum to exactly 6,236 ayahs with zero overlap', () => {
  const emptyStats = calculateQuranProgressStats([], SURAH_METADATA_LIST);
  assert.equal(emptyStats.totalQuranAyahs, 6236);
  assert.equal(emptyStats.totalAyahsRead, 0);
  assert.equal(emptyStats.remainingAyahs, 6236);
  assert.equal(emptyStats.percentageOverall, 0);
  assert.equal(emptyStats.juzProgressList.length, 30);

  const sumJuzTotals = emptyStats.juzProgressList.reduce((acc, j) => acc + j.totalAyahs, 0);
  assert.equal(sumJuzTotals, 6236);

  // Zero activity on empty history (no fabricated baseline)
  const weeklySum = emptyStats.weeklyActivity.reduce((acc, d) => acc + d.ayat, 0);
  assert.equal(weeklySum, 0);
});

test('mergeReadingHistory preserves highestAyatRead on revisit and retains all 114 surahs', () => {
  let history: ReadingHistoryItem[] = [];

  // Complete Al-Fatihah (7/7)
  history = mergeReadingHistory(history, {
    surahNomor: 1,
    surahNamaLatin: 'Al-Fatihah',
    ayatNomor: 7,
    totalAyat: 7,
    timestamp: 1000
  });

  // Re-open Al-Fatihah at Ayah 1 -> should NOT lose 7/7 completion
  history = mergeReadingHistory(history, {
    surahNomor: 1,
    surahNamaLatin: 'Al-Fatihah',
    ayatNomor: 1,
    totalAyat: 7,
    timestamp: 2000
  });

  const statsAfterRevisit = calculateQuranProgressStats(history, SURAH_METADATA_LIST);
  assert.equal(statsAfterRevisit.totalAyahsRead, 7);
  assert.equal(statsAfterRevisit.surahsCompletedCount, 1);
  assert.equal(history[0].ayatNomor, 1);
  assert.equal(history[0].highestAyatRead, 7);

  // Add all 114 surahs as completed -> reaches 100% Khatam (6,236 ayahs, 30 Juz, 114 Surahs)
  let fullHistory: ReadingHistoryItem[] = [];
  for (const s of SURAH_METADATA_LIST) {
    fullHistory = mergeReadingHistory(fullHistory, {
      surahNomor: s.nomor,
      surahNamaLatin: s.namaLatin,
      ayatNomor: s.jumlahAyat,
      totalAyat: s.jumlahAyat,
      timestamp: 3000 + s.nomor
    });
  }
  assert.equal(fullHistory.length, 114);

  const khatamStats = calculateQuranProgressStats(fullHistory, SURAH_METADATA_LIST);
  assert.equal(khatamStats.totalAyahsRead, 6236);
  assert.equal(khatamStats.remainingAyahs, 0);
  assert.equal(khatamStats.percentageOverall, 100);
  assert.equal(khatamStats.juzCompletedCount, 30);
  assert.equal(khatamStats.surahsCompletedCount, 114);
});

test('toggleJuzCompletionInHistory marks and unmarks exact Juz boundaries cleanly', () => {
  let history: ReadingHistoryItem[] = [];

  // Mark Juz 2 (Al-Baqarah 142-252 = 111 ayahs) complete without touching Juz 1
  history = toggleJuzCompletionInHistory(history, 2, SURAH_METADATA_LIST, 5000);
  const statsWithJuz2 = calculateQuranProgressStats(history, SURAH_METADATA_LIST);

  assert.equal(statsWithJuz2.totalAyahsRead, 111);
  assert.equal(statsWithJuz2.juzCompletedCount, 1);
  assert.equal(statsWithJuz2.juzProgressList[0].readAyahs, 0); // Juz 1 untouched
  assert.equal(statsWithJuz2.juzProgressList[1].readAyahs, 111); // Juz 2 100%
  assert.equal(statsWithJuz2.juzProgressList[1].status, 'completed');

  // Toggle Juz 2 again -> unmarks Juz 2 back to 0
  history = toggleJuzCompletionInHistory(history, 2, SURAH_METADATA_LIST, 6000);
  const statsUnmarked = calculateQuranProgressStats(history, SURAH_METADATA_LIST);
  assert.equal(statsUnmarked.totalAyahsRead, 0);
  assert.equal(statsUnmarked.juzCompletedCount, 0);

  // Toggle Surah completion helper
  const fatihah = SURAH_METADATA_LIST[0];
  history = toggleSurahCompletionInHistory(history, fatihah, 7000);
  assert.equal(calculateQuranProgressStats(history, SURAH_METADATA_LIST).surahsCompletedCount, 1);
  history = toggleSurahCompletionInHistory(history, fatihah, 8000);
  assert.equal(calculateQuranProgressStats(history, SURAH_METADATA_LIST).surahsCompletedCount, 0);
});
