import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterSurahs,
  filterHadiths,
  calculateReadingProgress,
  isAyahBookmarked,
  toggleBookmarkItem
} from './quranLogic.ts';
import type { SurahMeta, HadithItem, BookmarkItem } from '../types/quran.ts';

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
  assert.equal(calculateReadingProgress(0, 100), 1); // min clamp 1%
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

  // Toggle again removes it
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
