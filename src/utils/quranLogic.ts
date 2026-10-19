import type { BookmarkItem, HadithItem, SurahMeta } from '../types/quran.ts';

/**
 * Filter list of Surahs by search query and place of revelation
 */
export function filterSurahs(
  surahs: SurahMeta[],
  query: string,
  revelationFilter: 'Semua' | 'Makkiyyah' | 'Madaniyyah' = 'Semua'
): SurahMeta[] {
  const normalizedQuery = query.trim().toLowerCase();

  return surahs.filter(surah => {
    // 1. Revelation match
    if (revelationFilter !== 'Semua' && surah.tempatTurun !== revelationFilter) {
      return false;
    }

    // 2. Query match (if empty, matches all)
    if (!normalizedQuery) return true;

    // Search by number e.g. "1" or "36"
    if (String(surah.nomor) === normalizedQuery) return true;

    // Search by Latin name or translation or Arabic name
    const matchLatin = surah.namaLatin.toLowerCase().includes(normalizedQuery);
    const matchArti = surah.arti.toLowerCase().includes(normalizedQuery);
    const matchArab = surah.nama.includes(normalizedQuery);
    const matchDeskripsi = surah.deskripsi.toLowerCase().includes(normalizedQuery);

    return matchLatin || matchArti || matchArab || matchDeskripsi;
  });
}

/**
 * Filter Hadiths by search query, book filter, and category
 */
export function filterHadiths(
  hadiths: HadithItem[],
  query: string,
  bookSlug: string = 'semua',
  category: string = 'Semua Topik'
): HadithItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return hadiths.filter(hadith => {
    // 1. Book match
    if (bookSlug !== 'semua' && hadith.kitabSlug !== bookSlug) {
      return false;
    }

    // 2. Category match
    if (category !== 'Semua Topik' && hadith.tema !== category) {
      return false;
    }

    // 3. Query match
    if (!normalizedQuery) return true;

    const matchNo = String(hadith.nomor) === normalizedQuery;
    const matchJudul = hadith.judul?.toLowerCase().includes(normalizedQuery) || false;
    const matchTerjemah = hadith.terjemah.toLowerCase().includes(normalizedQuery);
    const matchSanad = hadith.sanadPerawi.toLowerCase().includes(normalizedQuery);
    const matchArab = hadith.arab.includes(normalizedQuery);
    const matchPelajaran = hadith.pelajaran?.toLowerCase().includes(normalizedQuery) || false;

    return matchNo || matchJudul || matchTerjemah || matchSanad || matchArab || matchPelajaran;
  });
}

/**
 * Calculate reading progress percentage (1 - 100%)
 */
export function calculateReadingProgress(currentAyah: number, totalAyahs: number): number {
  if (totalAyahs <= 0) return 0;
  const progress = Math.round((currentAyah / totalAyahs) * 100);
  return Math.min(100, Math.max(1, progress));
}

/**
 * Check if a specific Ayah is currently bookmarked
 */
export function isAyahBookmarked(
  bookmarks: BookmarkItem[],
  surahNomor: number,
  ayatNomor: number
): boolean {
  return bookmarks.some(
    b => b.type === 'ayah' && b.surahNomor === surahNomor && b.ayatNomor === ayatNomor
  );
}

/**
 * Check if a specific Hadith is currently bookmarked
 */
export function isHadithBookmarked(
  bookmarks: BookmarkItem[],
  kitabSlug: string,
  haditsNomor: number
): boolean {
  return bookmarks.some(
    b => b.type === 'hadith' && b.kitabSlug === kitabSlug && b.haditsNomor === haditsNomor
  );
}

/**
 * Toggle bookmark item in the list
 */
export function toggleBookmarkItem(
  currentList: BookmarkItem[],
  item: Omit<BookmarkItem, 'id' | 'timestamp'>
): BookmarkItem[] {
  if (item.type === 'ayah') {
    const exists = currentList.find(
      b => b.type === 'ayah' && b.surahNomor === item.surahNomor && b.ayatNomor === item.ayatNomor
    );
    if (exists) {
      return currentList.filter(b => b.id !== exists.id);
    }
  } else if (item.type === 'hadith') {
    const exists = currentList.find(
      b => b.type === 'hadith' && b.kitabSlug === item.kitabSlug && b.haditsNomor === item.haditsNomor
    );
    if (exists) {
      return currentList.filter(b => b.id !== exists.id);
    }
  }

  const newBookmark: BookmarkItem = {
    ...item,
    id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now()
  };

  return [newBookmark, ...currentList];
}

/**
 * Format relative Indonesian time (e.g. 'Baru saja', '5 menit lalu', '2 jam lalu', 'Kemarin')
 */
export function formatIndonesianRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return 'Kemarin';
  if (diffDay < 30) return `${diffDay} hari lalu`;
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
