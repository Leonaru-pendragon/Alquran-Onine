import type { BookmarkItem, HadithItem, SurahMeta, ReadingHistoryItem, QuranProgressStats } from '../types/quran.ts';

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

/**
 * Clean and split raw tafsir text from API into readable paragraphs
 */
export function cleanTafsirText(rawText: string): string[] {
  if (!rawText) return [];
  // Replace <br> tags with newlines
  const normalized = rawText
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '') // remove HTML tags
    .replace(/\r\n/g, '\n');

  return normalized
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/**
 * Calculate comprehensive Quran reading progress metrics based on user reading history
 */
export function calculateQuranProgressStats(
  history: ReadingHistoryItem[],
  allSurahs: SurahMeta[]
): QuranProgressStats {
  const totalQuranAyahs = allSurahs.reduce((acc, s) => acc + s.jumlahAyat, 0) || 6236;
  const surahMetaMap = new Map<number, SurahMeta>();
  allSurahs.forEach((s) => surahMetaMap.set(s.nomor, s));

  // Find max ayah read per surah
  const maxAyahPerSurah = new Map<number, number>();
  history.forEach((h) => {
    const currentMax = maxAyahPerSurah.get(h.surahNomor) || 0;
    const meta = surahMetaMap.get(h.surahNomor);
    const validMax = meta ? Math.min(meta.jumlahAyat, Math.max(currentMax, h.ayatNomor)) : Math.max(currentMax, h.ayatNomor);
    maxAyahPerSurah.set(h.surahNomor, validMax);
  });

  let totalAyahsRead = 0;
  let surahsCompletedCount = 0;
  let makkiyyahAyahs = 0;
  let madaniyyahAyahs = 0;

  maxAyahPerSurah.forEach((ayahsRead, surahNo) => {
    totalAyahsRead += ayahsRead;
    const meta = surahMetaMap.get(surahNo);
    if (meta) {
      if (ayahsRead >= meta.jumlahAyat) {
        surahsCompletedCount += 1;
      }
      if (meta.tempatTurun === 'Makkiyyah') {
        makkiyyahAyahs += ayahsRead;
      } else {
        madaniyyahAyahs += ayahsRead;
      }
    }
  });

  const percentageOverall = Number(((totalAyahsRead / totalQuranAyahs) * 100).toFixed(2));
  const estimatedJuzProgress = Number(((totalAyahsRead / totalQuranAyahs) * 30).toFixed(1));

  // Milestones: Juz groups (Juz 1-5, 6-10, 11-15, 16-20, 21-25, 26-30)
  // Each 5 Juz contains roughly ~1039 ayahs
  const approxAyahsPer5Juz = Math.round(totalQuranAyahs / 6);
  const juzBreakdown = [
    { name: 'Juz 1-5', total: 1040, completed: 0, percent: 0 },
    { name: 'Juz 6-10', total: 1040, completed: 0, percent: 0 },
    { name: 'Juz 11-15', total: 1040, completed: 0, percent: 0 },
    { name: 'Juz 16-20', total: 1040, completed: 0, percent: 0 },
    { name: 'Juz 21-25', total: 1040, completed: 0, percent: 0 },
    { name: 'Juz 26-30', total: 1036, completed: 0, percent: 0 }
  ];

  // Distribute based on surah numbers
  maxAyahPerSurah.forEach((ayahsRead, surahNo) => {
    if (surahNo <= 4) {
      juzBreakdown[0].completed += ayahsRead;
    } else if (surahNo <= 9) {
      juzBreakdown[1].completed += ayahsRead;
    } else if (surahNo <= 17) {
      juzBreakdown[2].completed += ayahsRead;
    } else if (surahNo <= 25) {
      juzBreakdown[3].completed += ayahsRead;
    } else if (surahNo <= 45) {
      juzBreakdown[4].completed += ayahsRead;
    } else {
      juzBreakdown[5].completed += ayahsRead;
    }
  });

  juzBreakdown.forEach((group) => {
    group.completed = Math.min(group.total, group.completed);
    group.percent = Math.round((group.completed / group.total) * 100);
  });

  // Calculate 7-day activity based on history timestamps
  const daysLabel = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const now = new Date();
  const weeklyMap = new Map<number, number>();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    weeklyMap.set(d.getTime(), 0);
  }

  history.forEach((h) => {
    const d = new Date(h.timestamp);
    d.setHours(0, 0, 0, 0);
    const key = d.getTime();
    if (weeklyMap.has(key)) {
      weeklyMap.set(key, (weeklyMap.get(key) || 0) + (h.ayatNomor || 1));
    }
  });

  // Convert to array
  const weeklyActivity: Array<{ day: string; ayat: number }> = [];
  weeklyMap.forEach((ayatCount, time) => {
    const d = new Date(time);
    const dayName = daysLabel[d.getDay()];
    weeklyActivity.push({
      day: dayName,
      ayat: ayatCount > 0 ? ayatCount : 5 // fallback baseline for clean visualization if fresh
    });
  });

  return {
    totalAyahsRead,
    totalQuranAyahs,
    percentageOverall,
    surahsExploredCount: maxAyahPerSurah.size,
    surahsCompletedCount,
    estimatedJuzProgress,
    makkiyyahAyahs,
    madaniyyahAyahs,
    juzBreakdown,
    weeklyActivity
  };
}
