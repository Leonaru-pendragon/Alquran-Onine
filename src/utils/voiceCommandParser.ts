import { SURAH_METADATA_LIST, JUZ_LIST } from '../data/quranMetadata.ts';
import type { SurahMeta } from '../types/quran.ts';

export interface VoiceSearchResult {
  rawTranscript: string;
  type: 'surah_ayah' | 'surah' | 'juz' | 'search_query';
  action?: 'open' | 'play';
  surahNomor?: number;
  surahNamaLatin?: string;
  totalAyat?: number;
  ayahNomor?: number;
  juzNomor?: number;
  searchQuery?: string;
  title: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
}

// Indonesian numbers to integer dictionary
const WORD_TO_NUMBER: Record<string, number> = {
  nol: 0,
  kosong: 0,
  satu: 1,
  se: 1,
  dua: 2,
  tiga: 3,
  empat: 4,
  lima: 5,
  enam: 6,
  tujuh: 7,
  delapan: 8,
  sembilan: 9,
  sepuluh: 10,
  sebelas: 11,
  seratus: 100
};

/**
 * Parses spoken Indonesian number words into an integer (e.g., "dua puluh lima" -> 255, "tiga puluh" -> 30)
 */
export function parseIndonesianNumber(input: string): number | null {
  if (!input) return null;
  const clean = input.trim().toLowerCase();

  // If directly numeric digits
  const digitMatch = clean.match(/\b\d+\b/);
  if (digitMatch) {
    const num = parseInt(digitMatch[0], 10);
    if (!isNaN(num)) return num;
  }

  const words = clean.split(/[\s-]+/).filter(Boolean);
  if (words.length === 0) return null;

  // Single word lookup
  if (words.length === 1 && WORD_TO_NUMBER[words[0]] !== undefined) {
    return WORD_TO_NUMBER[words[0]];
  }

  let total = 0;
  let currentGroup = 0;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];

    if (w === 'ratus' || w === 'seratus') {
      const mult = w === 'seratus' ? 1 : (currentGroup || 1);
      total += mult * 100;
      currentGroup = 0;
    } else if (w === 'puluh') {
      const mult = currentGroup || 1;
      total += mult * 10;
      currentGroup = 0;
    } else if (w === 'belas' || w === 'sebelas') {
      if (w === 'sebelas') {
        total += 11;
      } else {
        const mult = currentGroup || 1;
        total += 10 + mult;
      }
      currentGroup = 0;
    } else if (WORD_TO_NUMBER[w] !== undefined) {
      currentGroup = WORD_TO_NUMBER[w];
    } else {
      // Unrecognized word, try parsing as number
      const parsed = parseInt(w, 10);
      if (!isNaN(parsed)) {
        currentGroup = parsed;
      }
    }
  }

  total += currentGroup;
  return total > 0 ? total : null;
}

/**
 * Normalizes text for Quran name matching:
 * - strips diacritics, dashes, apostrophes
 * - lowercase, trims excess whitespace
 */
export function normalizeQuranText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Aliases for famous Ayahs or common Indonesian variations of Surahs
 */
const SPECIAL_PHRASES: Array<{
  pattern: RegExp;
  result: { surahNomor: number; ayahNomor?: number; title: string; description: string };
}> = [
  {
    pattern: /ayat\s*kursi/i,
    result: {
      surahNomor: 2,
      ayahNomor: 255,
      title: 'Ayat Kursi (Surah Al-Baqarah : 255)',
      description: 'Ayat paling agung dalam Al-Qur\'an tentang kekuasaan dan keagungan Allah'
    }
  },
  {
    pattern: /(?:surah\s*)?qulhu(?:allahu?\s*ahad)?/i,
    result: {
      surahNomor: 112,
      title: 'Surah Al-Ikhlas (112)',
      description: 'Penegasan kemurnian tauhid dan keesaan Allah SWT'
    }
  },
  {
    pattern: /surah\s*(?:al\s*)?tabarak/i,
    result: {
      surahNomor: 67,
      title: 'Surah Al-Mulk (67)',
      description: 'Surah Tabarak pelindung dari siksa kubur'
    }
  }
];

/**
 * Find matching surah from list by name, number, or translation
 */
export function matchSurah(
  query: string,
  surahList: SurahMeta[] = SURAH_METADATA_LIST
): SurahMeta | null {
  const normQuery = normalizeQuranText(query);
  if (!normQuery) return null;

  // Direct number check
  const num = parseInt(normQuery, 10);
  if (!isNaN(num) && num >= 1 && num <= 114) {
    const byNum = surahList.find((s) => s.nomor === num);
    if (byNum) return byNum;
  }

  // Exact normalized match
  for (const s of surahList) {
    const normLatin = normalizeQuranText(s.namaLatin);
    if (normLatin === normQuery) return s;

    // Check without prefix 'al' or 'an' or 'as' etc.
    const cleanLatin = normLatin.replace(/^(al|an|at|ar|as|az|ad)\s+/, '');
    const cleanQuery = normQuery.replace(/^(al|an|at|ar|as|az|ad)\s+/, '');
    if (cleanLatin === cleanQuery && cleanLatin.length > 2) return s;
  }

  // Includes / contains match
  for (const s of surahList) {
    const normLatin = normalizeQuranText(s.namaLatin);
    const cleanLatin = normLatin.replace(/^(al|an|at|ar|as|az|ad)\s+/, '');
    if (normLatin.includes(normQuery) || (cleanLatin.length > 2 && normQuery.includes(cleanLatin))) {
      return s;
    }
  }

  // Indonesian meaning match (e.g. "sapi betina" -> Al-Baqarah, "gua" -> Al-Kahf)
  for (const s of surahList) {
    const normArti = normalizeQuranText(s.arti);
    if (normArti === normQuery || (normArti.length > 3 && normArti.includes(normQuery))) {
      return s;
    }
  }

  return null;
}

/**
 * Main parser for spoken voice commands
 */
export function parseVoiceQuranCommand(
  rawTranscript: string,
  surahList: SurahMeta[] = SURAH_METADATA_LIST
): VoiceSearchResult {
  const trimmed = rawTranscript.trim();
  if (!trimmed) {
    return {
      rawTranscript: '',
      type: 'search_query',
      title: 'Pencarian Kosong',
      description: 'Silakan ucapkan kata kunci atau nama surah.',
      confidence: 'low'
    };
  }

  const isPlayIntent = /\b(?:putar|dengarkan|bunyikan|play|murottal|suara)\b/i.test(trimmed);

  // 1. Check special phrases (e.g., Ayat Kursi, Qulhu)
  for (const item of SPECIAL_PHRASES) {
    if (item.pattern.test(trimmed)) {
      const surah = surahList.find((s) => s.nomor === item.result.surahNomor);
      return {
        rawTranscript: trimmed,
        type: item.result.ayahNomor ? 'surah_ayah' : 'surah',
        action: isPlayIntent ? 'play' : 'open',
        surahNomor: item.result.surahNomor,
        surahNamaLatin: surah?.namaLatin || 'Surah',
        totalAyat: surah?.jumlahAyat || 1,
        ayahNomor: item.result.ayahNomor,
        title: item.result.title,
        description: item.result.description,
        confidence: 'high'
      };
    }
  }

  // 2. Check for Juz command (e.g. "Juz 30", "Juz tiga puluh", "Juz satu")
  const juzMatch = trimmed.match(/(?:juz|jus)\s*([0-9a-zA-Z\s]+)/i);
  if (juzMatch) {
    const juzNum = parseIndonesianNumber(juzMatch[1]);
    if (juzNum && juzNum >= 1 && juzNum <= 30) {
      const juzMeta = JUZ_LIST.find((j) => j.nomor === juzNum);
      return {
        rawTranscript: trimmed,
        type: 'juz',
        action: 'open',
        juzNomor: juzNum,
        title: `Juz ${juzNum}`,
        description: juzMeta ? `Mulai dari ${juzMeta.namaMulai}` : `Bagian Juz ke-${juzNum}`,
        confidence: 'high'
      };
    }
  }

  // 3. Check for pattern: "Surah [Name/No] ayat [No]" or "[Name] ayat [No]"
  // Example: "Surah Al-Baqarah ayat 255", "Yasin ayat 10", "Surah 36 ayat 1", "Al Kahfi ayat sepuluh"
  const surahAyahRegex = /(?:surah|surat)?\s*(.+?)\s+(?:ayat|ke|nomor|no)\s+([0-9a-zA-Z\s]+)/i;
  const saMatch = trimmed.match(surahAyahRegex);

  if (saMatch) {
    const rawSurahPart = saMatch[1].trim();
    const rawAyahPart = saMatch[2].trim();

    const matched = matchSurah(rawSurahPart, surahList);
    const parsedAyah = parseIndonesianNumber(rawAyahPart);

    if (matched) {
      const validAyah = parsedAyah && parsedAyah >= 1
        ? Math.min(parsedAyah, matched.jumlahAyat)
        : 1;

      return {
        rawTranscript: trimmed,
        type: 'surah_ayah',
        action: isPlayIntent ? 'play' : 'open',
        surahNomor: matched.nomor,
        surahNamaLatin: matched.namaLatin,
        totalAyat: matched.jumlahAyat,
        ayahNomor: validAyah,
        title: `Surah ${matched.namaLatin} : Ayat ${validAyah}`,
        description: `Buka langsung ayat ${validAyah} dari total ${matched.jumlahAyat} ayat (${matched.arti})`,
        confidence: 'high'
      };
    }
  }

  // 4. Check for pattern: "Surah [Name/No]" or just "[Name]"
  const surahOnlyMatch = trimmed.replace(/^(?:buka|cari|putar|baca|surah|surat)\s+/i, '').trim();
  const matchedSurah = matchSurah(surahOnlyMatch, surahList) || matchSurah(trimmed, surahList);

  if (matchedSurah) {
    return {
      rawTranscript: trimmed,
      type: 'surah',
      action: isPlayIntent ? 'play' : 'open',
      surahNomor: matchedSurah.nomor,
      surahNamaLatin: matchedSurah.namaLatin,
      totalAyat: matchedSurah.jumlahAyat,
      ayahNomor: 1,
      title: `Surah ${matchedSurah.namaLatin} (${matchedSurah.nomor})`,
      description: `${matchedSurah.jumlahAyat} Ayat · ${matchedSurah.tempatTurun} · Arti: ${matchedSurah.arti}`,
      confidence: 'high'
    };
  }

  // 5. Fallback: treat as general search query for surahs or hadiths
  return {
    rawTranscript: trimmed,
    type: 'search_query',
    action: 'open',
    searchQuery: trimmed,
    title: `Cari "${trimmed}"`,
    description: `Mencari kata kunci "${trimmed}" di seluruh 114 Surah dan Ensiklopedia Hadits`,
    confidence: 'medium'
  };
}
