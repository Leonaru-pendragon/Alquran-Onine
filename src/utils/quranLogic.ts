import type {
  AyahRange,
  BookmarkItem,
  CompletionStatus,
  HadithItem,
  JuzProgressItem,
  QuranProgressStats,
  ReadingHistoryItem,
  SurahMeta,
  SurahProgressItem
} from '../types/quran.ts';
import { JUZ_LIST, SURAH_METADATA_LIST } from '../data/quranMetadata.ts';
import { sanitizePlainText } from './security.ts';

const CANONICAL_SURAH_MAP = new Map<number, SurahMeta>(
  SURAH_METADATA_LIST.map((s) => [s.nomor, s])
);

/**
 * Filter list of Surahs by search query and place of revelation
 */
export function filterSurahs(
  surahs: SurahMeta[],
  query: string,
  revelationFilter: 'Semua' | 'Makkiyyah' | 'Madaniyyah' = 'Semua'
): SurahMeta[] {
  const normalizedQuery = query.trim().toLowerCase();

  return surahs.filter((surah) => {
    if (revelationFilter !== 'Semua' && surah.tempatTurun !== revelationFilter) {
      return false;
    }

    if (!normalizedQuery) return true;

    if (String(surah.nomor) === normalizedQuery) return true;

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

  return hadiths.filter((hadith) => {
    if (bookSlug !== 'semua' && hadith.kitabSlug !== bookSlug) {
      return false;
    }

    if (category !== 'Semua Topik' && hadith.tema !== category) {
      return false;
    }

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
 * Calculate reading progress percentage (1 - 100% when active, 0% when 0)
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
    (b) => b.type === 'ayah' && b.surahNomor === surahNomor && b.ayatNomor === ayatNomor
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
    (b) => b.type === 'hadith' && b.kitabSlug === kitabSlug && b.haditsNomor === haditsNomor
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
      (b) => b.type === 'ayah' && b.surahNomor === item.surahNomor && b.ayatNomor === item.ayatNomor
    );
    if (exists) {
      return currentList.filter((b) => b.id !== exists.id);
    }
  } else if (item.type === 'hadith') {
    const exists = currentList.find(
      (b) => b.type === 'hadith' && b.kitabSlug === item.kitabSlug && b.haditsNomor === item.haditsNomor
    );
    if (exists) {
      return currentList.filter((b) => b.id !== exists.id);
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
 * Format relative Indonesian time
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
  const normalized = sanitizePlainText(rawText, 200_000);

  return normalized
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/**
 * Normalize and merge overlapping or contiguous 1-indexed inclusive ayah intervals
 */
export function normalizeAyahRanges(ranges: AyahRange[], maxAyat?: number): AyahRange[] {
  const valid: AyahRange[] = [];
  for (const [rawStart, rawEnd] of ranges) {
    const start = Math.max(1, Math.floor(rawStart));
    const end = maxAyat ? Math.min(maxAyat, Math.floor(rawEnd)) : Math.floor(rawEnd);
    if (end >= start) {
      valid.push([start, end]);
    }
  }
  if (valid.length === 0) return [];
  valid.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged: AyahRange[] = [[valid[0][0], valid[0][1]]];
  for (let i = 1; i < valid.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = valid[i];
    if (curr[0] <= prev[1] + 1) {
      prev[1] = Math.max(prev[1], curr[1]);
    } else {
      merged.push([curr[0], curr[1]]);
    }
  }
  return merged;
}

/**
 * Remove a specific [start, end] ayah interval from normalized ranges
 */
export function subtractAyahRange(ranges: AyahRange[], remove: AyahRange): AyahRange[] {
  const [rStart, rEnd] = remove;
  if (rEnd < rStart) return ranges;
  const result: AyahRange[] = [];
  for (const [start, end] of ranges) {
    if (end < rStart || start > rEnd) {
      result.push([start, end]);
    } else {
      if (start < rStart) {
        result.push([start, rStart - 1]);
      }
      if (end > rEnd) {
        result.push([rEnd + 1, end]);
      }
    }
  }
  return result;
}

/**
 * Count read ayahs within normalized ranges, optionally clipped to [clipStart, clipEnd]
 */
export function countAyahsInRanges(ranges: AyahRange[], clip?: AyahRange): number {
  let count = 0;
  for (const [s, e] of ranges) {
    const start = clip ? Math.max(s, clip[0]) : s;
    const end = clip ? Math.min(e, clip[1]) : e;
    if (end >= start) {
      count += end - start + 1;
    }
  }
  return count;
}

/**
 * Extract effective read ranges from a single ReadingHistoryItem
 */
export function extractItemRanges(item: ReadingHistoryItem, maxAyat?: number): AyahRange[] {
  const cap = maxAyat ?? item.totalAyat;
  if (item.readRanges && item.readRanges.length > 0) {
    return normalizeAyahRanges(item.readRanges, cap);
  }
  const highest = Math.max(item.ayatNomor || 0, item.highestAyatRead || 0);
  if (highest <= 0) return [];
  return normalizeAyahRanges([[1, highest]], cap);
}

/**
 * Find the first unread ayah inside [clipStart, clipEnd] given normalized ranges
 */
function findFirstUnreadInClip(ranges: AyahRange[], clip: AyahRange): number | null {
  let cursor = clip[0];
  for (const [s, e] of ranges) {
    if (e < cursor) continue;
    if (s > cursor) {
      return cursor <= clip[1] ? cursor : null;
    }
    cursor = e + 1;
    if (cursor > clip[1]) return null;
  }
  return cursor <= clip[1] ? cursor : null;
}

/**
 * Merge a new reading history event without losing previously read ayahs
 * and without capping at 30 Surahs (retains all 114 Surahs for 100% Khatam).
 */
export function mergeReadingHistory(
  prevHistory: ReadingHistoryItem[],
  incoming: ReadingHistoryItem
): ReadingHistoryItem[] {
  const meta = CANONICAL_SURAH_MAP.get(incoming.surahNomor);
  const totalAyat = meta?.jumlahAyat ?? incoming.totalAyat;

  const existingItems = prevHistory.filter((h) => h.surahNomor === incoming.surahNomor);
  const otherItems = prevHistory.filter((h) => h.surahNomor !== incoming.surahNomor);

  const combinedRawRanges: AyahRange[] = [];
  let prevHighest = 0;
  for (const ex of existingItems) {
    combinedRawRanges.push(...extractItemRanges(ex, totalAyat));
    prevHighest = Math.max(prevHighest, ex.highestAyatRead || 0, ex.ayatNomor || 0);
  }
  combinedRawRanges.push(...extractItemRanges(incoming, totalAyat));

  const mergedRanges = normalizeAyahRanges(combinedRawRanges, totalAyat);
  const highestFromRanges =
    mergedRanges.length > 0 ? mergedRanges[mergedRanges.length - 1][1] : 0;
  const highestAyatRead = Math.min(
    totalAyat,
    Math.max(prevHighest, incoming.ayatNomor || 0, incoming.highestAyatRead || 0, highestFromRanges)
  );

  const updatedEntry: ReadingHistoryItem = {
    surahNomor: incoming.surahNomor,
    surahNamaLatin: meta?.namaLatin || incoming.surahNamaLatin,
    ayatNomor: Math.min(totalAyat, Math.max(1, incoming.ayatNomor || 1)),
    highestAyatRead,
    readRanges: mergedRanges,
    totalAyat,
    timestamp: incoming.timestamp || Date.now()
  };

  return [updatedEntry, ...otherItems];
}

/**
 * Toggle full completion of a single Surah in readingHistory
 */
export function toggleSurahCompletionInHistory(
  prevHistory: ReadingHistoryItem[],
  surah: Pick<SurahMeta, 'nomor' | 'namaLatin' | 'jumlahAyat'>,
  nowTimestamp: number = Date.now()
): ReadingHistoryItem[] {
  const existingItems = prevHistory.filter((h) => h.surahNomor === surah.nomor);
  const otherItems = prevHistory.filter((h) => h.surahNomor !== surah.nomor);

  const currentRanges = normalizeAyahRanges(
    existingItems.flatMap((ex) => extractItemRanges(ex, surah.jumlahAyat)),
    surah.jumlahAyat
  );
  const readCount = countAyahsInRanges(currentRanges, [1, surah.jumlahAyat]);

  if (readCount >= surah.jumlahAyat) {
    // Already completed -> unmark Surah
    return otherItems;
  }

  const completedItem: ReadingHistoryItem = {
    surahNomor: surah.nomor,
    surahNamaLatin: surah.namaLatin,
    ayatNomor: surah.jumlahAyat,
    highestAyatRead: surah.jumlahAyat,
    readRanges: [[1, surah.jumlahAyat]],
    totalAyat: surah.jumlahAyat,
    timestamp: nowTimestamp
  };

  return [completedItem, ...otherItems];
}

/**
 * Toggle full completion of a specific Juz (1..30) in readingHistory.
 * Accurately marks or unmarks only the exact verse boundaries of that Juz.
 */
export function toggleJuzCompletionInHistory(
  prevHistory: ReadingHistoryItem[],
  juzNomor: number,
  allSurahs: SurahMeta[] = SURAH_METADATA_LIST,
  nowTimestamp: number = Date.now()
): ReadingHistoryItem[] {
  const juz = JUZ_LIST.find((j) => j.nomor === juzNomor);
  if (!juz) return prevHistory;

  const surahMap = new Map<number, SurahMeta>();
  SURAH_METADATA_LIST.forEach((s) => surahMap.set(s.nomor, s));
  allSurahs.forEach((s) => surahMap.set(s.nomor, s));

  // Determine whether this Juz is currently 100% completed
  const existingBySurah = new Map<number, ReadingHistoryItem[]>();
  for (const h of prevHistory) {
    const arr = existingBySurah.get(h.surahNomor) || [];
    arr.push(h);
    existingBySurah.set(h.surahNomor, arr);
  }

  let isJuzFullyComplete = true;
  for (let sNo = juz.surahMulai; sNo <= juz.surahSelesai; sNo++) {
    const meta = surahMap.get(sNo);
    if (!meta) continue;
    const startAyah = sNo === juz.surahMulai ? juz.ayatMulai : 1;
    const endAyah = sNo === juz.surahSelesai ? Math.min(juz.ayatSelesai, meta.jumlahAyat) : meta.jumlahAyat;
    const segTotal = Math.max(0, endAyah - startAyah + 1);
    const items = existingBySurah.get(sNo) || [];
    const ranges = normalizeAyahRanges(
      items.flatMap((it) => extractItemRanges(it, meta.jumlahAyat)),
      meta.jumlahAyat
    );
    const segRead = countAyahsInRanges(ranges, [startAyah, endAyah]);
    if (segRead < segTotal) {
      isJuzFullyComplete = false;
      break;
    }
  }

  const touchedSurahs = new Set<number>();
  const updatedTouchedItems: ReadingHistoryItem[] = [];

  for (let sNo = juz.surahMulai; sNo <= juz.surahSelesai; sNo++) {
    const meta = surahMap.get(sNo);
    if (!meta) continue;
    touchedSurahs.add(sNo);

    const startAyah = sNo === juz.surahMulai ? juz.ayatMulai : 1;
    const endAyah = sNo === juz.surahSelesai ? Math.min(juz.ayatSelesai, meta.jumlahAyat) : meta.jumlahAyat;
    const items = existingBySurah.get(sNo) || [];
    const prevRanges = normalizeAyahRanges(
      items.flatMap((it) => extractItemRanges(it, meta.jumlahAyat)),
      meta.jumlahAyat
    );

    if (isJuzFullyComplete) {
      const remainingRanges = subtractAyahRange(prevRanges, [startAyah, endAyah]);
      if (remainingRanges.length > 0) {
        const newHighest = remainingRanges[remainingRanges.length - 1][1];
        const prevTimestamp = items[0]?.timestamp ?? nowTimestamp;
        updatedTouchedItems.push({
          surahNomor: sNo,
          surahNamaLatin: meta.namaLatin,
          ayatNomor: Math.min(items[0]?.ayatNomor || newHighest, newHighest),
          highestAyatRead: newHighest,
          readRanges: remainingRanges,
          totalAyat: meta.jumlahAyat,
          timestamp: prevTimestamp
        });
      }
    } else {
      const mergedRanges = normalizeAyahRanges([...prevRanges, [startAyah, endAyah]], meta.jumlahAyat);
      const newHighest = mergedRanges[mergedRanges.length - 1][1];
      updatedTouchedItems.push({
        surahNomor: sNo,
        surahNamaLatin: meta.namaLatin,
        ayatNomor: endAyah,
        highestAyatRead: newHighest,
        readRanges: mergedRanges,
        totalAyat: meta.jumlahAyat,
        timestamp: nowTimestamp
      });
    }
  }

  const untouchedHistory = prevHistory.filter((h) => !touchedSurahs.has(h.surahNomor));
  return [...updatedTouchedItems.reverse(), ...untouchedHistory];
}

function toLocalDateKey(ts: number): string {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateReadingStreakDays(history: ReadingHistoryItem[], now: Date = new Date()): number {
  if (history.length === 0) return 0;
  const activeDates = new Set<string>(history.map((h) => toLocalDateKey(h.timestamp)));

  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  const todayKey = toLocalDateKey(cursor.getTime());
  if (!activeDates.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
    if (!activeDates.has(toLocalDateKey(cursor.getTime()))) {
      return 0;
    }
  }

  let streak = 0;
  while (activeDates.has(toLocalDateKey(cursor.getTime()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
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

  // Build normalized read ranges per surah across history
  const rangesPerSurah = new Map<number, AyahRange[]>();
  const lastVisitedPerSurah = new Map<number, { ayatNomor: number; timestamp: number }>();

  for (const h of history) {
    const meta = surahMetaMap.get(h.surahNomor) || CANONICAL_SURAH_MAP.get(h.surahNomor);
    const maxCap = meta?.jumlahAyat ?? h.totalAyat;
    const itemRanges = extractItemRanges(h, maxCap);
    if (itemRanges.length > 0) {
      const existing = rangesPerSurah.get(h.surahNomor) || [];
      rangesPerSurah.set(h.surahNomor, normalizeAyahRanges([...existing, ...itemRanges], maxCap));
    }

    const prevVisit = lastVisitedPerSurah.get(h.surahNomor);
    if (!prevVisit || h.timestamp >= prevVisit.timestamp) {
      lastVisitedPerSurah.set(h.surahNomor, {
        ayatNomor: h.ayatNomor || 1,
        timestamp: h.timestamp
      });
    }
  }

  let totalAyahsRead = 0;
  let surahsCompletedCount = 0;
  let makkiyyahAyahs = 0;
  let madaniyyahAyahs = 0;

  rangesPerSurah.forEach((ranges, surahNo) => {
    const readCount = countAyahsInRanges(ranges);
    if (readCount <= 0) return;

    const meta = surahMetaMap.get(surahNo);
    // If allSurahs was passed (e.g. full 114 surahs or test subset), clamp to meta if present
    const effectiveRead = meta ? Math.min(meta.jumlahAyat, readCount) : readCount;
    totalAyahsRead += effectiveRead;

    if (meta) {
      if (effectiveRead >= meta.jumlahAyat) {
        surahsCompletedCount += 1;
      }
      if (meta.tempatTurun === 'Makkiyyah') {
        makkiyyahAyahs += effectiveRead;
      } else {
        madaniyyahAyahs += effectiveRead;
      }
    }
  });

  const remainingAyahs = Math.max(0, totalQuranAyahs - totalAyahsRead);
  const rawPct = (totalAyahsRead / totalQuranAyahs) * 100;
  const percentageOverall = Math.min(100, Number(rawPct.toFixed(2)));
  const estimatedJuzProgress = Math.min(30, Number(((totalAyahsRead / totalQuranAyahs) * 30).toFixed(1)));

  // Build SurahProgressItem list for allSurahs
  const surahProgressList: SurahProgressItem[] = allSurahs.map((s) => {
    const ranges = rangesPerSurah.get(s.nomor) || [];
    const readAyahs = Math.min(s.jumlahAyat, countAyahsInRanges(ranges, [1, s.jumlahAyat]));
    const percent = s.jumlahAyat > 0 ? Math.round((readAyahs / s.jumlahAyat) * 100) : 0;
    const status: CompletionStatus =
      readAyahs >= s.jumlahAyat ? 'completed' : readAyahs > 0 ? 'in_progress' : 'unread';
    const firstUnread = findFirstUnreadInClip(ranges, [1, s.jumlahAyat]);
    const visit = lastVisitedPerSurah.get(s.nomor);

    return {
      nomor: s.nomor,
      nama: s.nama,
      namaLatin: s.namaLatin,
      arti: s.arti,
      tempatTurun: s.tempatTurun,
      readAyahs,
      lastVisitedAyah: visit?.ayatNomor ?? (readAyahs > 0 ? readAyahs : 1),
      totalAyahs: s.jumlahAyat,
      percent,
      status,
      lastTimestamp: visit?.timestamp,
      nextUnreadAyah: firstUnread ?? 1
    };
  });

  // Build exact 30-Juz progress list using canonical JUZ_LIST boundaries
  let juzCompletedCount = 0;
  let juzInProgressCount = 0;

  const juzProgressList: JuzProgressItem[] = JUZ_LIST.map((juz) => {
    let juzTotalAyahs = 0;
    let juzReadAyahs = 0;
    let nextUnreadSurah: number | null = null;
    let nextUnreadAyah: number | null = null;

    for (let sNo = juz.surahMulai; sNo <= juz.surahSelesai; sNo++) {
      const meta = surahMetaMap.get(sNo) || CANONICAL_SURAH_MAP.get(sNo);
      const surahTotal = meta?.jumlahAyat ?? 0;
      if (surahTotal <= 0) continue;

      const startAyah = sNo === juz.surahMulai ? juz.ayatMulai : 1;
      const endAyah = sNo === juz.surahSelesai ? Math.min(juz.ayatSelesai, surahTotal) : surahTotal;
      if (endAyah < startAyah) continue;

      const segTotal = endAyah - startAyah + 1;
      juzTotalAyahs += segTotal;

      const ranges = rangesPerSurah.get(sNo) || [];
      const segRead = countAyahsInRanges(ranges, [startAyah, endAyah]);
      juzReadAyahs += segRead;

      if (segRead < segTotal && nextUnreadSurah === null) {
        const unreadAyah = findFirstUnreadInClip(ranges, [startAyah, endAyah]);
        nextUnreadSurah = sNo;
        nextUnreadAyah = unreadAyah ?? startAyah;
      }
    }

    const percent = juzTotalAyahs > 0 ? Math.round((juzReadAyahs / juzTotalAyahs) * 100) : 0;
    const status: CompletionStatus =
      juzTotalAyahs > 0 && juzReadAyahs >= juzTotalAyahs
        ? 'completed'
        : juzReadAyahs > 0
        ? 'in_progress'
        : 'unread';

    if (status === 'completed') juzCompletedCount += 1;
    else if (status === 'in_progress') juzInProgressCount += 1;

    const startMeta = surahMetaMap.get(juz.surahMulai) || CANONICAL_SURAH_MAP.get(juz.surahMulai);
    const endMeta = surahMetaMap.get(juz.surahSelesai) || CANONICAL_SURAH_MAP.get(juz.surahSelesai);

    return {
      nomor: juz.nomor,
      namaMulai: juz.namaMulai,
      surahMulai: juz.surahMulai,
      ayatMulai: juz.ayatMulai,
      surahSelesai: juz.surahSelesai,
      ayatSelesai: juz.ayatSelesai,
      surahMulaiNama: startMeta?.namaLatin || `Surah ${juz.surahMulai}`,
      surahSelesaiNama: endMeta?.namaLatin || `Surah ${juz.surahSelesai}`,
      readAyahs: juzReadAyahs,
      totalAyahs: juzTotalAyahs,
      percent,
      status,
      nextUnreadSurah: nextUnreadSurah ?? juz.surahMulai,
      nextUnreadAyah: nextUnreadAyah ?? juz.ayatMulai
    };
  });

  // Derive 6-group Juz breakdown accurately from the 30 Juz items
  const groupLabels = ['Juz 1-5', 'Juz 6-10', 'Juz 11-15', 'Juz 16-20', 'Juz 21-25', 'Juz 26-30'];
  const juzBreakdown = groupLabels.map((name, groupIdx) => {
    const slice = juzProgressList.slice(groupIdx * 5, groupIdx * 5 + 5);
    const total = slice.reduce((acc, j) => acc + j.totalAyahs, 0);
    const completed = slice.reduce((acc, j) => acc + j.readAyahs, 0);
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { name, total, completed, percent };
  });

  // Determine smart next recommended reading position
  let nextRecommendedRead = {
    surahNomor: 1,
    surahNamaLatin: 'Al-Fatihah',
    ayahNomor: 1
  };

  if (history.length > 0) {
    // Prefer most recently visited incomplete surah
    const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);
    let foundIncomplete = false;
    for (const h of sortedHistory) {
      const sp = surahProgressList.find((s) => s.nomor === h.surahNomor);
      if (sp && sp.status !== 'completed') {
        nextRecommendedRead = {
          surahNomor: sp.nomor,
          surahNamaLatin: sp.namaLatin,
          ayahNomor: sp.nextUnreadAyah
        };
        foundIncomplete = true;
        break;
      }
    }
    if (!foundIncomplete) {
      const firstUnreadSurah = surahProgressList.find((s) => s.status !== 'completed');
      if (firstUnreadSurah) {
        nextRecommendedRead = {
          surahNomor: firstUnreadSurah.nomor,
          surahNamaLatin: firstUnreadSurah.namaLatin,
          ayahNomor: firstUnreadSurah.nextUnreadAyah
        };
      }
    }
  }

  // Calculate real 7-day activity based on history timestamps (no fabricated baseline)
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
      const meta = surahMetaMap.get(h.surahNomor) || CANONICAL_SURAH_MAP.get(h.surahNomor);
      const itemAyahs = countAyahsInRanges(extractItemRanges(h, meta?.jumlahAyat ?? h.totalAyat));
      weeklyMap.set(key, (weeklyMap.get(key) || 0) + itemAyahs);
    }
  });

  const weeklyActivity: Array<{ day: string; ayat: number }> = [];
  weeklyMap.forEach((ayatCount, time) => {
    const d = new Date(time);
    weeklyActivity.push({
      day: daysLabel[d.getDay()],
      ayat: ayatCount
    });
  });

  const exploredSurahsCount = Array.from(rangesPerSurah.values()).filter(
    (ranges) => countAyahsInRanges(ranges) > 0
  ).length;

  return {
    totalAyahsRead,
    totalQuranAyahs,
    remainingAyahs,
    percentageOverall,
    surahsExploredCount: exploredSurahsCount,
    surahsCompletedCount,
    juzCompletedCount,
    juzInProgressCount,
    estimatedJuzProgress,
    currentStreakDays: calculateReadingStreakDays(history, now),
    makkiyyahAyahs,
    madaniyyahAyahs,
    nextRecommendedRead,
    juzProgressList,
    surahProgressList,
    juzBreakdown,
    weeklyActivity
  };
}
