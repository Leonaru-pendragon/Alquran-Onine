import { escapeHtml } from '../utils/security';

export interface TajwidOccurrenceSummary {
  ruleId: string;
  nama: string;
  warna: string;
  hexColor: string;
  count: number;
  samples: string[];
}

export interface TajwidToken {
  ruleId: string;
  warna: string;
  text: string;
}

/**
 * Menormalkan spasi sebelum tanda waqaf/saktah/nun-wiqayah mushaf agar tidak merender kotak .notdef
 * dan tetap menjaga spasi antar-kata di Mushaf Kemenag RI maupun Utsmani.
 */
export function normalizeQuranicText(text: string): string {
  return (
    text
      .replace(/(^|\s+)\u06E8([\u064E-\u0652]?)([\u0627\u0671])/g, '$1$3\u06E8$2')
      .replace(
        /(\S)\s+([\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06EA-\u06ED][\u064E-\u0652]?)(?=\S)/g,
        '$1$2 '
      )
      .replace(
        /(\S)\s+([\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06EA-\u06ED][\u064E-\u0652]?)(?=\s|$)/g,
        '$1$2'
      )
  );
}

// ============================================================================
// UNICODE PHONOLOGICAL BUILDING BLOCKS (KEMENAG RI + MADINAH UTSMANI + QIRA'ATI)
// ============================================================================

// Base Arabic letter (plus tatweel when carrying hamza above/below: ـٔ / ـٕ)
const BASE_LETTER = '(?:[\\u0621-\\u063A\\u0641-\\u064A\\u066E-\\u066F\\u0671]|\\u0640(?=[\\u0654\\u0655]))';

// All combining diacritics that attach to a single letter
const LETTER_DIAC = '[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06DF-\\u06E8\\u06EA-\\u06ED\\u08F0-\\u08F2]';
const COMBINING_START_RE = /^[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D4-\u08FF]/;

// Shaddah sequence (handles both NFC and Uthmani/Kemenag diacritic ordering)
const SHADDAH_SEQ = '[\\u064B-\\u0650\\u0654-\\u0657]*\\u0651[\\u064B-\\u0650\\u0654-\\u0657\\u0670]*';

// Waqf / pause symbols EXCEPT Saktah (\u06DC ۜ), which blocks Idgham
const WAQF_NO_SAKTAH_CHARS = '\\u06D5-\\u06DB\\u06DD\\u06DE\\u06E9\\u08D4-\\u08EF';
const WAQF_NO_SAKTAH = `[${WAQF_NO_SAKTAH_CHARS}]`;

// Inter-word boundary allowing optional waqf signs (excluding Saktah \u06DC)
const INTER_WORD = `(?:[\\s${WAQF_NO_SAKTAH_CHARS}]*\\s+[\\s${WAQF_NO_SAKTAH_CHARS}]*|${WAQF_NO_SAKTAH}+[\\s${WAQF_NO_SAKTAH_CHARS}]*)`;

// End of ayah or example segment (allows trailing waqf marks, ࣖ, ۝, ·, or $)
const VERSE_END_LOOKAHEAD = '(?=[\\s\\u06D5-\\u06ED\\u08D4-\\u08FF]*(?:$|·|۝))';
const VERSE_END_RE = /^[\s\u06D5-\u06ED\u08D4-\u08FF]*(?:$|·|۝)/;

// Word-initial Hamzah Qath'i in Uthmani ([ءأإآ]) AND Kemenag RI (ا + explicit vowel/maddah)
const HAMZAH_WORD_START =
  `(?:[ءأإآ]${LETTER_DIAC}*|ا[\\u064E\\u064F\\u0650\\u0653-\\u0657\\u0670\\u06E4]${LETTER_DIAC}*)`;

// Word-internal / final Hamzah in Uthmani & Kemenag RI (including ىٕ, ئ, ـٔ)
const HAMZAH_INTERNAL = '(?:[ءأإئؤ]|[ىي\\u0640][\\u0654\\u0655])';

// Tanwin cluster anchored on its base consonant (never splits combining tanwin from its base letter)
const TANWIN_CLUSTER =
  `(?:${BASE_LETTER}\\u0651?(?:[\\u064B\\u064C\\u064D\\u08F0-\\u08F2][\\u06E2\\u06ED]?[\\u0627\\u0649]?|[\\u0627\\u0649]\\u064B))`;

function unwrapTokens(segment: string, tokens: TajwidToken[]): string {
  return segment.replace(/\uE000(\d+)\uE001/g, (_, idx: string) => tokens[Number(idx)]?.text ?? '');
}

const INTER_WORD_HAMZATUL_WASHAL_RE = new RegExp(
  `^${INTER_WORD}(?:\\u0671|ا(?![\\u064B-\\u0657\\u0670\\u06E4\\u08F0-\\u08F2]))`
);

/**
 * Checks whether the text immediately following a word-final Mad letter begins
 * with Hamzatul Washal (causing Hadzful Mad li-Iltiqa'is Sakinain, e.g. اِهْدِنَا الصِّرَاطَ, فِى الْعُقَدِ).
 */
function isFollowedByHamzatulWashal(rawSuffix: string): boolean {
  return INTER_WORD_HAMZATUL_WASHAL_RE.test(rawSuffix);
}

/**
 * Strips decorative Mushaf waqf symbols from sample chips while preserving all letters & harakat.
 */
export function cleanTajwidSampleText(sample: string): string {
  return sample.replace(/[\u06D5-\u06DC\u06DD\u06DE\u06E9\u08D4-\u08EF]/g, '').trim();
}

/**
 * Deterministic phonological & orthographic Tajwid tokenizer covering all 35 active kaidah
 * of Pelajaran Ilmu Tajwid Praktis (Metode Qira'ati) across Kemenag RI, Madinah Uthmani,
 * and classical vocalized Arabic.
 */
export function tokenizeTajwidText(arabicText: string): {
  tokenizedText: string;
  tokens: TajwidToken[];
} {
  const normalized = normalizeQuranicText(arabicText);
  const tokens: TajwidToken[] = [];

  const pushToken = (ruleId: string, warna: string, matchedText: string): string => {
    if (!matchedText || COMBINING_START_RE.test(matchedText)) {
      return matchedText;
    }
    const idx = tokens.length;
    tokens.push({ ruleId, warna, text: matchedText });
    return `\uE000${idx}\uE001`;
  };

  const hasHarakat = /[\u0622\u064B-\u0657\u0670\u06E1\u06E2\u06E4-\u06E7\u06ED\u08F0-\u08F2]/.test(
    normalized
  );
  let text = normalized;

  // =========================================================================
  // 0. HURUF MUQATHTHA'AT / FAWATIHUS SUWAR (Pelajaran 13 Ke-11 & Ke-12, Hal. 33)
  // Restricted strictly to standalone opening letter sequences with NO normal vowels
  // (\u064B-\u0650, \u0652), so ordinary words like عَلٰٓى, سَوَاۤءٌ, الشِّتَاۤءِ are never hijacked.
  // =========================================================================
  const muqaththaatWordRegex =
    /(^|[\s·۝])([المصقنطسعكهيرح][\u0670\u0653\u06E4\u0651~]*(?:[لمصقنطسعكهيرح][\u0670\u0653\u06E4\u0651~]*)*)(?=[\s·۝\u06D5-\u06ED\u08D4-\u08FF]|$)/g;

  text = text.replace(muqaththaatWordRegex, (full, lead: string, word: string) => {
    if (!/[\u0670\u0653\u06E4~]/.test(word)) {
      return full;
    }
    const inner = word
      .replace(/([نقصعسلكم]\u0651?[\u0653\u06E4~]\u0651?)/g, (m) =>
        pushToken('mad-lazim-musyba-harfi', 'tajwid-mad-lazim', m)
      )
      .replace(/([حيطهر]\u0670(?![\u0653\u06E4~]))/g, (m) =>
        pushToken('mad-lazim-mukhaffaf-harfi', 'tajwid-mad-shilah', m)
      );
    return `${lead}${inner}`;
  });

  // =========================================================================
  // 1a. MAD FARQ (Pelajaran 13 Ke-13, Hal. 34): قُلْ آللَّهُ / ءٰۤاللّٰهُ / ءٰۤالذَّكَرَيْنِ
  // =========================================================================
  const madFarqRegex = new RegExp(
    `((?:ء[\\u064E\\u0670]*[\\u0653\\u06E4~]?[ٱا]?|(?:ءَ)?\\u0622|[ا][\\u0670][\\u0653\\u06E4~])ل(?:ل${SHADDAH_SEQ}ه${LETTER_DIAC}*|ذ${SHADDAH_SEQ}))`,
    'g'
  );
  text = text.replace(madFarqRegex, (m) => pushToken('mad-farq', 'tajwid-mad-lazim', m));

  // =========================================================================
  // 1b. MAD LAZIM MUKHAFFAF KALIMI (Pelajaran 13 Ke-10, Hal. 32): آلْآنَ / اٰۤلْـٰٔنَ / ءَآلْـَٰٔنَ
  // =========================================================================
  const madLazimMukhaffafKalimiRegex = new RegExp(
    `((?:(?:ء[\\u064E\\u0670]*[\\u0653\\u06E4~]?[ٱا]?)|(?:ءَ)?\\u0622|ا\\u0670[\\u0653\\u06E4~])ل[\\u0652\\u06E1](?:\\u0640?\\u0654[\\u064E\\u0670]*|[آاأ][\\u064E\\u0670]*)ن${LETTER_DIAC}*)`,
    'g'
  );
  text = text.replace(madLazimMukhaffafKalimiRegex, (m) =>
    pushToken('mad-lazim-mukhaffaf-kalimi', 'tajwid-mad-lazim', m)
  );

  // =========================================================================
  // 1c. MAD LAZIM MUTSAQQAL KALIMI (Pelajaran 13 Ke-9, Hal. 32): الضَّاۤلِّيْنَ, الْحَاۤقَّةُ, دَاۤبَّةٍ
  // Matches the elongated syllable + geminated consonant precisely without swallowing Alif-Lam or endings.
  // =========================================================================
  const madLazimMutsaqqalRegex = new RegExp(
    `((?:\\u0622|[اوي][\\u0652\\u06E1]?[\\u0653\\u06E4~]|${BASE_LETTER}\\u0651?[\\u064E]?\\u0670[\\u0653\\u06E4~])${BASE_LETTER}${SHADDAH_SEQ})`,
    'g'
  );
  text = text.replace(madLazimMutsaqqalRegex, (m) => pushToken('mad-lazim', 'tajwid-mad-lazim', m));

  // =========================================================================
  // 2a. MAD SHILAH THAWILAH (Pelajaran 13 Ke-5, Hal. 29–30): مَالَهٗٓ اَخْلَدَهٗ / مَالَهُۥٓ أَخْلَدَهُ
  // =========================================================================
  const madShilahThawilahRegex = new RegExp(
    `(ه(?:[\\u0657\\u0656][\\u0653\\u06E4~]?|[\\u064F\\u0650][\\u06E5\\u06E6][\\u0653\\u06E4~]?|[\\u064F\\u0650][\\u0653\\u06E4~])${INTER_WORD}${HAMZAH_WORD_START})`,
    'g'
  );
  text = text.replace(madShilahThawilahRegex, (m) =>
    pushToken('mad-shilah', 'tajwid-mad-shilah', m)
  );

  // =========================================================================
  // 2b. MAD JAIZ MUNFASHIL (Pelajaran 13 Ke-2, Hal. 27–28)
  // Joined vocative/demonstrative (يٰٓاَيُّهَا, هٰٓؤُلَاۤءِ) + inter-word Mad before Hamzah Qath'i
  // =========================================================================
  const madJaizJoinedRegex = new RegExp(
    `([يوه][\\u064E]?\\u0670?[\\u0653\\u06E4~](?:[أؤإآء]${LETTER_DIAC}*|ا[\\u064E\\u064F\\u0650\\u0656\\u0657\\u0670]${LETTER_DIAC}*))`,
    'g'
  );
  text = text.replace(madJaizJoinedRegex, (m) => pushToken('mad-jaiz-munfasil', 'tajwid-mad', m));

  const madJaizInterWordRegex = new RegExp(
    `((?:\\u0622|ا[\\u0653\\u06E4~]|[ويى][\\u0652\\u06E1]?[\\u0653\\u06E4~](?:ا[\\u06DF\\u06E0]?)?|${BASE_LETTER}\\u0651?[\\u064E\\u064F\\u0650]?\\u0670[\\u0653\\u06E4~][\\u0649\\u0627]?)${INTER_WORD}${HAMZAH_WORD_START})`,
    'g'
  );
  text = text.replace(madJaizInterWordRegex, (m) =>
    pushToken('mad-jaiz-munfasil', 'tajwid-mad', m)
  );

  if (hasHarakat) {
    // Also support textbook/standard vocalized Mad Jaiz without explicit maddah sign (e.g. وَمَا أُمِرُوا, قَالُوا آمَنَّا),
    // excluding Shifr Mustathil/Mustadir silent Alifs like أَنَا۠ أُحْيِي.
    const madJaizPlainRegex = new RegExp(
      `((?:(?<=\\u064E)ا(?![\\u064B-\\u065F\\u0670\\u06DF\\u06E0])|(?<=\\u0650)[ي\\u0649][\\u0652\\u06E1]?(?![\\u064B-\\u0651\\u0653-\\u0657\\u0670\\u06DF])|(?<=\\u064F)و[\\u0652\\u06E1]?(?:ا[\\u06DF\\u06E0]?)?(?![\\u064B-\\u0651\\u0653-\\u0657\\u0670\\u06DF])|${BASE_LETTER}\\u0651?\\u064E?\\u0670\\u0649?)${INTER_WORD}${HAMZAH_WORD_START})`,
      'g'
    );
    text = text.replace(madJaizPlainRegex, (m) => pushToken('mad-jaiz-munfasil', 'tajwid-mad', m));
  }

  // =========================================================================
  // 2c. MAD WAJIB MUTTASHIL (Pelajaran 13 Ke-1, Hal. 27–28): جَاۤءَ, سَوَاۤءٌ, الْمَلٰۤىِٕكَةُ, الشِّتَاۤءِ
  // If the internal/final Hamzah carries tanwin or Iqlab meem (e.g. سَوَاۤءٌ عَ, جَزَاۤءً بِمَا, مَاۤءٍ وَّاحِدٍ),
  // leave the Hamzah+tanwin free so Step 5 also highlights the tanwin Tajwid rule!
  // =========================================================================
  const TANWIN_OR_IQLAB_LOOKAHEAD = '(?=[\\u0654\\u0655]?[\\u064B-\\u064D\\u06E2\\u06ED\\u08F0-\\u08F2])';

  const madWajibBeforeTanwinHamzahRegex = new RegExp(
    `((?:\\u0622|[اوي][\\u0652\\u06E1]?[\\u0653\\u06E4~]|${BASE_LETTER}\\u0651?[\\u064E]?\\u0670[\\u0653\\u06E4~]))(?=${HAMZAH_INTERNAL}${TANWIN_OR_IQLAB_LOOKAHEAD})`,
    'g'
  );
  text = text.replace(madWajibBeforeTanwinHamzahRegex, (m) =>
    pushToken('mad-wajib-muttasil', 'tajwid-mad', m)
  );

  const madWajibFullRegex = new RegExp(
    `((?:\\u0622|[اوي][\\u0652\\u06E1]?[\\u0653\\u06E4~]|${BASE_LETTER}\\u0651?[\\u064E]?\\u0670[\\u0653\\u06E4~])${HAMZAH_INTERNAL}${LETTER_DIAC}*)`,
    'g'
  );
  text = text.replace(madWajibFullRegex, (m) => pushToken('mad-wajib-muttasil', 'tajwid-mad', m));

  // =========================================================================
  // 3. IDZHAR WAJIB (Pelajaran 11, Hal. 23): الدُّنْيَا, بُنْيَانٌ, صِنْوَانٌ, قِنْوَانٌ
  // Leaves final نٌ/نٍ free so following tanwin rules (e.g. قِنْوَانٌ دَانِيَةٌ, بُنْيَانٌ مَّرْصُوْصٌ) also match!
  // =========================================================================
  const idzharWajibRegex = new RegExp(
    `((?:(?:[ٱا]\\u064E?ل)?د${SHADDAH_SEQ}|دُ)ن[\\u0652\\u06E1]?يَا|بُن[\\u0652\\u06E1]?يَ[اٰ]|صِن[\\u0652\\u06E1]?وَ[اٰ]|قِن[\\u0652\\u06E1]?وَ[اٰ])`,
    'g'
  );
  text = text.replace(idzharWajibRegex, (m) => pushToken('idzhar-wajib', 'tajwid-izhar', m));

  // =========================================================================
  // 4. LAFADZ ALLAH TAFKHIM & TARQIQ (Pelajaran 9, Hal. 20)
  // Uses context inspection via unwrapTokens so preceding kasrah is never split from its base letter.
  // =========================================================================
  const attachedAllahRegex = new RegExp(
    `((?:[وف][\\u064E])?(?:لِل${SHADDAH_SEQ}ه[\\u064E\\u064F\\u0650]?|بِ[ٱا]لل${SHADDAH_SEQ}ه[\\u064E\\u064F\\u0650]?))`,
    'g'
  );
  text = text.replace(attachedAllahRegex, (m) =>
    pushToken('lam-jalalah-tarqiq', 'tajwid-lafadz-allah', m)
  );

  const standaloneAllahRegex = new RegExp(
    `((?:[وفت][\\u064E])?[ٱا]\\u064E?لل${SHADDAH_SEQ}ه[\\u064E\\u064F\\u0650]?)`,
    'g'
  );
  text = text.replace(standaloneAllahRegex, (m, _g1: string, offset: number, full: string) => {
    if (/^[وفت]\u064E/.test(m) || /^[ٱا]\u064E/.test(m)) {
      return pushToken('lam-jalalah-tafkhim', 'tajwid-lafadz-allah', m);
    }
    const rawPrefix = unwrapTokens(full.slice(0, offset), tokens);
    // Preceded by kasrah (e.g. بِسْمِ اللّٰهِ, قُلِ اللّٰهُمَّ, فِى اللّٰهِ, فِيْ اللّٰهِ) or Nun Wiqayah kasrah
    const kasrahBeforeRe = new RegExp(
      `(?:\\u0650(?:[\\u064A\\u0649][\\u0652\\u06E1]?)?|\\u0656|\\u06E8\\u0650?)${INTER_WORD}$`
    );
    if (kasrahBeforeRe.test(rawPrefix)) {
      return pushToken('lam-jalalah-tarqiq', 'tajwid-lafadz-allah', m);
    }
    return pushToken('lam-jalalah-tafkhim', 'tajwid-lafadz-allah', m);
  });

  // =========================================================================
  // 5. HUKUM NUN SUKUN & TANWIN (Pelajaran 3 — 5 Hukum)
  // =========================================================================
  const NUN_SAKIN_EXPLICIT = 'ن[\\u0652\\u06E1]';
  const NUN_SAKIN_ANY =
    '(?:ن[\\u0652\\u06E1]|(?<=[\\u064E\\u064F\\u0650\\u0651\\uE001])ن(?![\\u064B-\\u065F\\u0670\\u06DF-\\u06ED\\u08F0-\\u08F2]))';

  const hasValidPrecedingShortVowel = (fullStr: string, matchOffset: number, matched: string): boolean => {
    if (!/^[نم](?![\u0652\u06E1])/.test(matched)) return true;
    const rawPrefix = unwrapTokens(fullStr.slice(0, matchOffset), tokens);
    return /[\u064E\u064F\u0650\u0651]$/.test(rawPrefix);
  };

  // 5a. Iqlab (Hal. 7): Nun sukun / tanwin / small meem (\u06E2 / \u06ED) + ب
  const iqlabRegex = new RegExp(
    `((?:${BASE_LETTER}${LETTER_DIAC}*[\\u06E2\\u06ED][\\u0627\\u0649]?(?:${INTER_WORD})?|${TANWIN_CLUSTER}${INTER_WORD}|${NUN_SAKIN_EXPLICIT}(?:${INTER_WORD})?)ب${LETTER_DIAC}*)`,
    'g'
  );
  text = text.replace(iqlabRegex, (m) => pushToken('iqlab', 'tajwid-iqlab', m));

  // 5b. Idgham Bighunnah (ي و م ن) & Idgham Bilaghunnah (ل ر) across two words (Saktah \u06DC excluded by INTER_WORD)
  if (hasHarakat) {
    const idghamNunRegex = new RegExp(
      `((?:${TANWIN_CLUSTER}|${NUN_SAKIN_ANY}))(${INTER_WORD})([يوملنر]${LETTER_DIAC}*)`,
      'g'
    );
    text = text.replace(
      idghamNunRegex,
      (full, p1: string, _gap: string, p3: string, offset: number, fullStr: string) => {
        if (p1.includes('\u06DC')) return full;
        if (!hasValidPrecedingShortVowel(fullStr, offset, p1)) return full;
        const nextChar = p3[0];
        if (nextChar === 'ل' || nextChar === 'ر') {
          return pushToken('idgham-bilaghunnah', 'tajwid-idgham-bilaghunnah', full);
        }
        return pushToken('idgham-bighunnah', 'tajwid-idgham-bighunnah', full);
      }
    );
  }

  // 5c. Idzhar Halqi (Hal. 8–11): Nun sukun / tanwin + 6 huruf halqi (ء/ا ح خ ع غ هـ)
  const izharHalqiTarget = `(?:${HAMZAH_WORD_START}|${HAMZAH_INTERNAL}${LETTER_DIAC}*|[حخعغه]${LETTER_DIAC}*)`;
  const izharHalqiRegex = new RegExp(
    `((?:${TANWIN_CLUSTER}${INTER_WORD}|${NUN_SAKIN_EXPLICIT}(?:${INTER_WORD})?)${izharHalqiTarget})`,
    'g'
  );
  text = text.replace(izharHalqiRegex, (m) => pushToken('izhar-halqi', 'tajwid-izhar', m));

  // 5d. Ikhfa' Haqiqi (Hal. 11–12): Nun sukun / tanwin + 15 huruf Ikhfa'
  if (hasHarakat) {
    const ikhfaRegex = new RegExp(
      `((?:${TANWIN_CLUSTER}${INTER_WORD}|${NUN_SAKIN_ANY}(?:${INTER_WORD})?)[تثجدذزسشصضطظفقك]${LETTER_DIAC}*)`,
      'g'
    );
    text = text.replace(ikhfaRegex, (m, _g1: string, offset: number, fullStr: string) => {
      if (!hasValidPrecedingShortVowel(fullStr, offset, m)) return m;
      return pushToken('ikhfa', 'tajwid-ikhfa', m);
    });
  }

  // =========================================================================
  // 6. HUKUM MIM SUKUN (Pelajaran 4 — 3 Hukum)
  // =========================================================================
  if (hasHarakat) {
    const MIM_SAKIN_ANY =
      '(?:م[\\u0652\\u06E1]|(?<=[\\u064E\\u064F\\u0650\\u0651\\uE001])م(?![\\u064B-\\u065F\\u0670\\u06DF-\\u06ED\\u08F0-\\u08F2]))';

    // 6a. Ikhfa' Syafawi (Hal. 14): مْ + ب
    const ikhfaSyafawiRegex = new RegExp(
      `(${MIM_SAKIN_ANY}${INTER_WORD}ب${LETTER_DIAC}*)`,
      'g'
    );
    text = text.replace(ikhfaSyafawiRegex, (m, _g1: string, offset: number, fullStr: string) => {
      if (!hasValidPrecedingShortVowel(fullStr, offset, m)) return m;
      return pushToken('ikhfa-syafawi', 'tajwid-ikhfa-syafawi', m);
    });

    // 6b. Idgham Mitsli / Mimi (Hal. 13): مْ + م
    const idghamMimiRegex = new RegExp(
      `(${MIM_SAKIN_ANY}${INTER_WORD}م${LETTER_DIAC}*)`,
      'g'
    );
    text = text.replace(idghamMimiRegex, (m, _g1: string, offset: number, fullStr: string) => {
      if (!hasValidPrecedingShortVowel(fullStr, offset, m)) return m;
      return pushToken('idgham-mimi', 'tajwid-idgham-mimi', m);
    });

    // 6c. Idzhar Syafawi (Hal. 14): explicit مْ meeting any letter other than م and ب
    // Highlights مْ cleanly without consuming the next letter so subsequent rules remain intact.
    const izharSyafawiRegex = /م[\u0652\u06E1]/g;
    text = text.replace(izharSyafawiRegex, (m, offset: number, full: string) => {
      const rawSuffix = unwrapTokens(full.slice(offset + m.length), tokens);
      const nextLetterRe = new RegExp(`^(?:${INTER_WORD})?(${BASE_LETTER})`);
      const match = rawSuffix.match(nextLetterRe);
      if (!match) return m;
      const nextBase = match[1];
      if (nextBase === 'م' || nextBase === 'ب') return m;
      return pushToken('izhar-syafawi', 'tajwid-izhar-syafawi', m);
    });
  }

  // =========================================================================
  // 7. TIGA IDGHAM: MUTAJANISAIN, MUTAQARRIBAIN, MUTAMATSILAIN (Pelajaran 5–7)
  // =========================================================================
  if (hasHarakat) {
    const OPT_GAP = `(?:${INTER_WORD})?`;

    // 7a. Idgham Mutajanisain (Pelajaran 6, Hal. 16–17): ت-ط, ط-ت, ت-د, د-ت, ل-ر, ذ-ظ
    const mutajanisainRegex = new RegExp(
      `((?:ت[\\u0652\\u06E1]?${OPT_GAP}ط|ط[\\u0652\\u06E1]?${OPT_GAP}ت|ت[\\u0652\\u06E1]?${OPT_GAP}د|د[\\u0652\\u06E1]?${OPT_GAP}ت|ل[\\u0652\\u06E1]?${INTER_WORD}ر|ذ[\\u0652\\u06E1]?${OPT_GAP}ظ)${LETTER_DIAC}*)`,
      'g'
    );
    text = text.replace(mutajanisainRegex, (full) => {
      if (full.includes('\u06DC')) return full;
      // First consonant must be sakin or unvoweled (not carrying a short vowel/shaddah/tanwin)
      const firstDiac = full.slice(1).match(new RegExp(`^${LETTER_DIAC}*`))?.[0] ?? '';
      if (/[\u064B-\u0651\u0653-\u0657\u0670]/.test(firstDiac)) return full;
      if (!/[\u0652\u06E1\u0651]/.test(full)) return full;
      return pushToken('idgham-mutajanisain', 'tajwid-idgham-bilaghunnah', full);
    });

    // 7b. Idgham Mutaqarribain (Pelajaran 7, Hal. 17–18): ث-ذ, ق-ك, ب-م
    const mutaqarribainRegex = new RegExp(
      `((?:ث[\\u0652\\u06E1]?${INTER_WORD}ذ|ق[\\u0652\\u06E1]?${OPT_GAP}ك|ب[\\u0652\\u06E1]?${INTER_WORD}م)${LETTER_DIAC}*)`,
      'g'
    );
    text = text.replace(mutaqarribainRegex, (full) => {
      if (full.includes('\u06DC')) return full;
      const firstDiac = full.slice(1).match(new RegExp(`^${LETTER_DIAC}*`))?.[0] ?? '';
      if (/[\u064B-\u0651\u0653-\u0657\u0670]/.test(firstDiac)) return full;
      if (!/[\u0652\u06E1\u0651]/.test(full)) return full;
      return pushToken('idgham-mutaqaribain', 'tajwid-idgham-bilaghunnah', full);
    });

    // 7c. Idgham Mutamatsilain (Pelajaran 5 & Hal. 35): identical consonant (excluding م, ن, و, ي)
    const mutamatsilainRegex = new RegExp(
      `(([بتثجحخدذرزسشصضطظعغفقكله])([\\u0652\\u06E1]?)(?:${INTER_WORD}|(?=\\2\\u0651))\\2${LETTER_DIAC}*)`,
      'g'
    );
    text = text.replace(mutamatsilainRegex, (full, _g1: string, _c: string, sukunPart: string) => {
      if (full.includes('\u06DC')) return full;
      if (!sukunPart && !/\u0651/.test(full)) return full;
      return pushToken('idgham-mutamatsilain', 'tajwid-idgham-bilaghunnah', full);
    });
  }

  // =========================================================================
  // 8. AL SYAMSIYAH & AL QAMARIYAH (Pelajaran 10, Hal. 22)
  // Word-boundary or particle-prefix ([وفبكل]) validated so root letters like قَالَ are never matched.
  // =========================================================================
  const isDefiniteArticleContext = (rawPrefix: string, alToken: string): boolean => {
    // Allow start of string/whitespace/waqf, optionally followed by inseparable particle وَ / فَ / بِ / كَ / أَ / لِ
    const prefixRe = /(?:^|[\s·۝\u06D5-\u06ED\u08D4-\u08FF])(?:[وف]\u064E?)?(?:[بك][\u0650\u064E]?)?$/;
    if (!prefixRe.test(rawPrefix)) return false;
    // In Kemenag RI, اَلْ with explicit fathah on ا only represents definite article at start of verse/segment
    // (whereas mid-verse اَلْفِ, اَلْقٰى, اَلْسِنَتُكُمْ are Hamzah Qath'i words; and اَلْهٰىكُمُ is verb أَلْهَى).
    if (/^ا\u064E/.test(alToken)) {
      const atSegmentStart = /(?:^|[·۝])\s*$/.test(rawPrefix);
      if (!atSegmentStart) return false;
    }
    return true;
  };

  // 8a. Al Syamsiyah (14 Huruf: ت ث د ذ ر ز س ش ص ض ط ظ ل ن)
  // When followed by نّ (e.g. النَّاسِ), match only ال so نّ is ALSO highlighted as Ghunnah!
  const alSyamsiyahBeforeNunRegex = new RegExp(
    `([ٱا]\\u064E?ل)(?=ن${SHADDAH_SEQ})`,
    'g'
  );
  text = text.replace(alSyamsiyahBeforeNunRegex, (m, _g1: string, offset: number, full: string) => {
    const rawPrefix = unwrapTokens(full.slice(0, offset), tokens);
    if (!isDefiniteArticleContext(rawPrefix, m)) return m;
    return pushToken('al-syamsiyah', 'tajwid-al-syamsiyah', m);
  });

  // لِلنَّاسِ / لِلرَّحْمٰنِ / لِلسَّائِلِيْنَ (preposition لِ + assimilated Lam Syamsiyah)
  const lilSyamsiyahRegex = new RegExp(
    `((?:^|[\\s·۝\\u06D5-\\u06ED])(?:[وف]\\u064E?)?ل\\u0651?\\u0650)(ل(?=[تثدذرزسشصضطظن]${SHADDAH_SEQ}))`,
    'g'
  );
  text = text.replace(lilSyamsiyahRegex, (_full, lead: string, lam: string) => {
    return `${lead}${pushToken('al-syamsiyah', 'tajwid-al-syamsiyah', lam)}`;
  });

  const alSyamsiyahOtherRegex = new RegExp(
    `([ٱا]\\u064E?ل[تثدذرزسشصضطظل]${SHADDAH_SEQ})`,
    'g'
  );
  text = text.replace(alSyamsiyahOtherRegex, (m, _g1: string, offset: number, full: string) => {
    const rawPrefix = unwrapTokens(full.slice(0, offset), tokens);
    if (!isDefiniteArticleContext(rawPrefix, m)) return m;
    return pushToken('al-syamsiyah', 'tajwid-al-syamsiyah', m);
  });

  // 8b. Al Qamariyah (14 Huruf: ب ج ح خ ع غ ف ق ك م و هـ ء/ا ي)
  const QAMARIYAH_NEXT =
    '(?:[بجحخعغفقكموهيءأإآ]|ا[\\u064E\\u064F\\u0650\\u0653-\\u0657\\u0670\\u06E4])';

  const lilQamariyahRegex = new RegExp(
    `((?:^|[\\s·۝\\u06D5-\\u06ED])(?:[وف]\\u064E?)?ل\\u0651?\\u0650)(ل[\\u0652\\u06E1])(?=${QAMARIYAH_NEXT})`,
    'g'
  );
  text = text.replace(lilQamariyahRegex, (_full, lead: string, lam: string) => {
    return `${lead}${pushToken('al-qamariyah', 'tajwid-al-qamariyah', lam)}`;
  });

  const alQamariyahRegex = /([ٱا]\u064E?ل[\u0652\u06E1])/g;
  text = text.replace(alQamariyahRegex, (m, _g1: string, offset: number, full: string) => {
    const rawPrefix = unwrapTokens(full.slice(0, offset), tokens);
    const rawSuffix = unwrapTokens(full.slice(offset + m.length), tokens);
    if (!isDefiniteArticleContext(rawPrefix, m)) return m;
    // Exclude verb أَلْهَىٰكُمُ at start of QS 102:1
    if (/^ا\u064E/.test(m) && /^ه[\u064E\u0670]/.test(rawSuffix)) return m;
    if (!new RegExp(`^${QAMARIYAH_NEXT}`).test(rawSuffix)) return m;
    return pushToken('al-qamariyah', 'tajwid-al-qamariyah', m);
  });

  // =========================================================================
  // 9. GHUNNAH (Pelajaran 1, Hal. 1): Nun bertasydid (نّ) & Mim bertasydid (مّ)
  // =========================================================================
  const ghunnahRegex = new RegExp(`([نم]${SHADDAH_SEQ})`, 'g');
  text = text.replace(ghunnahRegex, (m) => pushToken('ghunnah', 'tajwid-ghunnah', m));

  // =========================================================================
  // 10. QALQALAH KUBRA & SHUGHRA (Pelajaran 8, Hal. 19)
  // Kubra runs at verse/segment end (excluding fathatain Mad 'Iwadh like مِهٰدًا / اَبَدًا).
  // =========================================================================
  if (hasHarakat) {
    const qalqalahKubraRegex = new RegExp(
      `([قطبجد](?![\\u0651]?[\\u064B\\u08F0])[\\u064C-\\u0657\\u0670\\u06E1]*[\\u06D6-\\u06DB]?)${VERSE_END_LOOKAHEAD}`,
      'g'
    );
    text = text.replace(qalqalahKubraRegex, (m) =>
      pushToken('qalqalah-kubra', 'tajwid-qalqalah', m)
    );
  }

  const qalqalahShughraRegex = /([قطبجد][\u0652\u06E1])/g;
  text = text.replace(qalqalahShughraRegex, (m) => pushToken('qalqalah', 'tajwid-qalqalah', m));

  // =========================================================================
  // 11. MAD TAMKIN (Pelajaran 13 Ke-7, Hal. 30): حُيِّيْتُمْ, النَّبِيّٖنَ, عِلِّيِّيْنَ
  // Runs before Mad 'Aridh Lissukun so عِلِّيِّيْنَۗ is accurately recognized as Mad Tamkin.
  // =========================================================================
  const madTamkinRegex = new RegExp(
    `(ي\\u0651(?:\\u0656|\\u0650\\u0640?[\\u06E6\\u06E7]|\\u0650ي[\\u0652\\u06E1]?(?![\\u064B-\\u0651\\u0653-\\u0657\\u0670])))`,
    'g'
  );
  text = text.replace(madTamkinRegex, (m) => pushToken('mad-tamkin', 'tajwid-mad-shilah', m));

  // =========================================================================
  // 12. WAQAF MADS AT VERSE END: MAD 'IWADH, MAD LIN, MAD 'ARIDH LISSUKUN
  // =========================================================================
  if (hasHarakat) {
    // 12a. Mad 'Iwadh (Pelajaran 13 Ke-4, Hal. 28–29): fathatain at waqaf EXCEPT Ta' Marbuthah (ةً)
    const madIwadhRegex = new RegExp(
      `((?!ة)${BASE_LETTER}\\u0651?(?:[\\u064B\\u08F0][\\u0627\\u0649]?|[\\u0627\\u0649]\\u064B)[\\u06D6-\\u06DC]?)${VERSE_END_LOOKAHEAD}`,
      'g'
    );
    text = text.replace(madIwadhRegex, (m) => pushToken('mad-iwadh', 'tajwid-mad-shilah', m));

    // Helper: checks if rawSuffix consists of exactly ONE final consonant (not fathatain, not shaddah) + VERSE_END,
    // and in tokenized text that final consonant is either untokenized or Qalqalah Kubra (never Mad 'Iwadh).
    const isBeforeWaqafFinalConsonant = (afterSlice: string, rawSuffix: string): boolean => {
      // Check tokenized slice: if it starts with a placeholder, only allow qalqalah-kubra
      const tokMatch = afterSlice.match(/^\uE000(\d+)\uE001([\s\u06D5-\u06ED\u08D4-\u08FF]*(?:$|·|۝))/);
      if (tokMatch) {
        const tok = tokens[Number(tokMatch[1])];
        return Boolean(tok && tok.ruleId === 'qalqalah-kubra');
      }
      const singleFinalRe = new RegExp(
        `^${BASE_LETTER}(?![\\u064B\\u08F0\\u0651])[\\u064C-\\u0650\\u0652\\u0654-\\u0657\\u06E1]*[\\u06D6-\\u06DC]?`
      );
      const m = rawSuffix.match(singleFinalRe);
      if (!m) return false;
      return VERSE_END_RE.test(rawSuffix.slice(m[0].length));
    };

    // 12b. Mad Lin (Pelajaran 13 Ke-8, Hal. 30): Fathah + وْ/يْ + final consonant at waqaf
    const madLinCandidateRegex = /([وي][\u0652\u06E1])/g;
    text = text.replace(madLinCandidateRegex, (m, _g1: string, offset: number, full: string) => {
      const afterSlice = full.slice(offset + m.length);
      const rawSuffix = unwrapTokens(afterSlice, tokens);
      if (!isBeforeWaqafFinalConsonant(afterSlice, rawSuffix)) return m;
      const rawPrefix = unwrapTokens(full.slice(0, offset), tokens);
      if (!/\u064E$/.test(rawPrefix)) return m;
      return pushToken('mad-lin', 'tajwid-mad-aridh', m);
    });

    // 12c. Mad 'Aridh Lissukun (Pelajaran 13 Ke-3, Hal. 28–29): Mad Thabi'i + final consonant at waqaf
    const madAridhDaggerOrSubscriptRegex = new RegExp(
      `(${BASE_LETTER}\\u0651?(?:\\u064E?\\u0670(?:و(?![\\u064B-\\u0657\\u0670\\u06E1]))?|\\u0656|\\u0657))`,
      'g'
    );
    text = text.replace(
      madAridhDaggerOrSubscriptRegex,
      (m, _g1: string, offset: number, full: string) => {
        const afterSlice = full.slice(offset + m.length);
        const rawSuffix = unwrapTokens(afterSlice, tokens);
        if (!isBeforeWaqafFinalConsonant(afterSlice, rawSuffix)) return m;
        return pushToken('mad-aridh-lissukun', 'tajwid-mad-aridh', m);
      }
    );

    const madAridhLetterRegex =
      /(ا(?![\u064B-\u065F\u0670\u06DF\u06E0\u08F0-\u08F2])|[وي][\u0652\u06E1]?(?![\u064B-\u0651\u0653-\u0657\u0670\u06DF\u08F0-\u08F2]))/g;
    text = text.replace(madAridhLetterRegex, (m, _g1: string, offset: number, full: string) => {
      const afterSlice = full.slice(offset + m.length);
      const rawSuffix = unwrapTokens(afterSlice, tokens);
      if (!isBeforeWaqafFinalConsonant(afterSlice, rawSuffix)) return m;
      const rawPrefix = unwrapTokens(full.slice(0, offset), tokens);
      const ch = m[0];
      if (ch === 'ا' && /\u064E$/.test(rawPrefix)) {
        return pushToken('mad-aridh-lissukun', 'tajwid-mad-aridh', m);
      }
      if (ch === 'ي' && /\u0650$/.test(rawPrefix)) {
        return pushToken('mad-aridh-lissukun', 'tajwid-mad-aridh', m);
      }
      if (ch === 'و' && /\u064F$/.test(rawPrefix)) {
        return pushToken('mad-aridh-lissukun', 'tajwid-mad-aridh', m);
      }
      return m;
    });
  }

  // =========================================================================
  // 13. MAD SHILAH QASHIRAH, MAD BADAL, & MAD THABI'I (Pelajaran 13)
  // =========================================================================

  // 13a. Mad Shilah Qashirah (Pelajaran 13 Ke-5, Hal. 29): mid-verse هٗ / هٖ / هُۥ / هِۦ (not at waqaf end)
  const madShilahQashirahRegex = /(ه(?:[\u0657\u0656]|[\u064F\u0650][\u06E5\u06E6]))/g;
  text = text.replace(madShilahQashirahRegex, (m, _g1: string, offset: number, full: string) => {
    const rawSuffix = unwrapTokens(full.slice(offset + m.length), tokens);
    if (VERSE_END_RE.test(rawSuffix)) return m;
    return pushToken('mad-shilah', 'tajwid-mad-shilah', m);
  });

  // 13b. Mad Badal (Pelajaran 13 Ke-6, Hal. 29–30): اٰ, آ, ءَا, إِيْ/اِيْ/اٖ, أُوْ/اُوْ (excluding silent و in أُولَٰٓئِكَ/اُوْلِى)
  if (hasHarakat) {
    const madBadalRegex =
      /(?:\u0622|ا\u0670|ء\u064E[ا\u0670]|(?:إ|ا)\u0656|(?:إ\u0650|ا\u0650)[ي\u0649][\u0652\u06E1]?(?![\u064B-\u0651\u0653-\u0657\u0670\u06DF])|(?:أ\u064F|ا\u064F)و[\u0652\u06E1]?(?![\u064B-\u0651\u0653-\u0657\u0670\u06DF])(?!(?:ل[\u064E\u0670\u0650\u064F])))/g;
    text = text.replace(madBadalRegex, (m, offset: number, full: string) => {
      const rawSuffix = unwrapTokens(full.slice(offset + m.length), tokens);
      if (isFollowedByHamzatulWashal(rawSuffix)) return m;
      return pushToken('mad-badal', 'tajwid-mad-shilah', m);
    });
  }

  // 13c. Mad Thabi'i / Mad Ashli (Pelajaran 13, Hal. 27): 1 Alif (2 harakat), skipping Iltiqa'us Sakinain
  if (hasHarakat) {
    // Standing vowels: dagger alif (\u0670, plus silent seat و/ى as in الصَّلٰوةَ, عَلٰى), subscript alef (\u0656), inverted dhammah (\u0657)
    const madThabiiStandingRegex = new RegExp(
      `(${BASE_LETTER}\\u0651?(?:\\u064E?\\u0670(?:\\u0649|و(?![\\u064B-\\u0657\\u0670\\u06E1]))?|\\u0656|\\u0657))`,
      'g'
    );
    text = text.replace(
      madThabiiStandingRegex,
      (m, _g1: string, offset: number, full: string) => {
        const rawSuffix = unwrapTokens(full.slice(offset + m.length), tokens);
        if (m.endsWith('\u0649') && isFollowedByHamzatulWashal(rawSuffix)) {
          return m;
        }
        return pushToken('mad-thabii', 'tajwid-mad-thabii', m);
      }
    );

    // Letter Mads: ا after fathah, ي/ى after kasrah, و (plus optional plural silent ا) after dhammah
    const madThabiiLetterRegex =
      /(ا(?![\u064B-\u065F\u0670\u06DF\u06E0\u06E8\u08F0-\u08F2])|[ي\u0649][\u0652\u06E1]?(?![\u064B-\u0651\u0653-\u0657\u0670\u06DF\u08F0-\u08F2])|و[\u0652\u06E1]?(?:ا[\u06DF\u06E0]?)?(?![\u064B-\u0651\u0653-\u0657\u0670\u06DF\u08F0-\u08F2]))/g;
    text = text.replace(madThabiiLetterRegex, (m, _g1: string, offset: number, full: string) => {
      const rawPrefix = unwrapTokens(full.slice(0, offset), tokens);
      const rawSuffix = unwrapTokens(full.slice(offset + m.length), tokens);
      if (isFollowedByHamzatulWashal(rawSuffix)) return m;

      const ch = m[0];
      if (ch === 'ا') {
        if (!/\u064E$/.test(rawPrefix)) return m;
        return pushToken('mad-thabii', 'tajwid-mad-thabii', m);
      }
      if (ch === 'ي' || ch === '\u0649') {
        if (!/\u0650$/.test(rawPrefix)) return m;
        return pushToken('mad-thabii', 'tajwid-mad-thabii', m);
      }
      if (ch === 'و') {
        // Exclude silent rasm ziyadah waw in أُولَٰٓئِكَ / اُوْلٰۤىِٕكَ / اُوْلِى / اُوْلُوا
        if (/(?:أ\u064F|ا\u064F)$/.test(rawPrefix) && /^ل[\u064E\u0670\u0650\u064F]/.test(rawSuffix)) {
          return m;
        }
        if (!/\u064F$/.test(rawPrefix)) return m;
        return pushToken('mad-thabii', 'tajwid-mad-thabii', m);
      }
      return m;
    });
  }

  // =========================================================================
  // 14. HUKUM RA: RA TAFKHIM & RA TARQIQ (Pelajaran 12, Hal. 24–25)
  // =========================================================================
  if (hasHarakat) {
    const raRegex = new RegExp(`(ر${LETTER_DIAC}*[\\u06D6-\\u06DB]?)`, 'g');
    text = text.replace(raRegex, (m, _g1: string, offset: number, full: string) => {
      const rawPrefix = unwrapTokens(full.slice(0, offset), tokens);
      const rawSuffix = unwrapTokens(full.slice(offset + m.length), tokens);
      const atWaqaf = VERSE_END_RE.test(rawSuffix);

      // 1. Ra at end of verse (waqaf): becomes sakin, judged by preceding context (unless fathatain, already handled by Mad 'Iwadh)
      if (atWaqaf) {
        // Preceded by Ya sukun / Ya Mad (خَيْرٌ ۝, بَصِيْرٌ ۝, قَدِيْرٌ ۝) or subscript kasrah -> Tarqiq
        if (/(?:[ي\u0649][\u0652\u06E1]?|\u0656)$/.test(rawPrefix)) {
          return pushToken('ra-tarqiq', 'tajwid-ra-tarqiq', m);
        }
        // Preceded directly by kasrah -> Tarqiq
        if (/\u0650$/.test(rawPrefix)) {
          return pushToken('ra-tarqiq', 'tajwid-ra-tarqiq', m);
        }
        // Preceded by non-Ya sakin consonant whose preceding vowel is kasrah (e.g. السِّحْرُ ۝, الذِّكْرِ ۝) -> Tarqiq
        const sakinAfterKasrahRe = new RegExp(`\\u0650${BASE_LETTER}[\\u0652\\u06E1]$`);
        if (sakinAfterKasrahRe.test(rawPrefix) && !/م\u0650ص[\u0652\u06E1]$/.test(rawPrefix)) {
          return pushToken('ra-tarqiq', 'tajwid-ra-tarqiq', m);
        }
        return pushToken('ra-tafkhim', 'tajwid-ra-tafkhim', m);
      }

      // 2. Mid-verse Ra Sakinah (رْ)
      if (/^ر[\u0652\u06E1]/.test(m)) {
        // Preceded by Hamzatul Washal (ارْجِعِي, ارْكَبْ, لِمَنِ ارْتَضٰى) -> Tafkhim
        if (/(?:^|[\s·۝\u06D5-\u06ED])(?:[وفب]\u064E?)?[ٱا]$/.test(rawPrefix)) {
          return pushToken('ra-tafkhim', 'tajwid-ra-tafkhim', m);
        }
        // Preceded by kasrah -> Tafkhim ONLY if followed in same word by non-kasrah Isti'la' [خصضطظغق] (مِرْصَادًا, قِرْطَاسٍ, فِرْقَةٍ)
        if (/\u0650$/.test(rawPrefix)) {
          if (/^[خصضطظغق](?![\u0650\u064D])/.test(rawSuffix)) {
            return pushToken('ra-tafkhim', 'tajwid-ra-tafkhim', m);
          }
          return pushToken('ra-tarqiq', 'tajwid-ra-tarqiq', m);
        }
        if (/[ي\u0649][\u0652\u06E1]?$/.test(rawPrefix)) {
          return pushToken('ra-tarqiq', 'tajwid-ra-tarqiq', m);
        }
        return pushToken('ra-tafkhim', 'tajwid-ra-tafkhim', m);
      }

      // 3. Mid-verse vocalized Ra
      if (/[\u0650\u064D\u0656]/.test(m)) {
        return pushToken('ra-tarqiq', 'tajwid-ra-tarqiq', m);
      }
      if (/[\u064E\u064B\u064F\u064C\u0670\u0657]/.test(m)) {
        return pushToken('ra-tafkhim', 'tajwid-ra-tafkhim', m);
      }

      return m;
    });
  }

  return { tokenizedText: text, tokens };
}

/**
 * Colorizes Arabic Quran text according to Pelajaran 1–13 of Ilmu Tajwid Praktis (Qira'ati)
 * with strict XSS escaping and non-nested placeholder protection.
 */
export function renderTajwidHtml(arabicText: string, showTajwid: boolean = true): string {
  const safeInput = escapeHtml(arabicText);
  const normalized = normalizeQuranicText(safeInput);

  if (!showTajwid) {
    return normalized;
  }

  const { tokenizedText, tokens } = tokenizeTajwidText(normalized);
  return tokenizedText.replace(/\uE000(\d+)\uE001/g, (_, idxStr: string) => {
    const token = tokens[Number(idxStr)];
    if (!token) return '';
    if (token.ruleId === 'ghunnah') {
      return `<span class="tajwid-ghunnah">${token.text}</span>`;
    }
    return `<span class="${token.warna}" data-tajwid="${token.ruleId}">${token.text}</span>`;
  });
}
