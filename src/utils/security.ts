import type {
  Ayah,
  BookmarkItem,
  QariId,
  ReadingHistoryItem,
  ReadingSettings,
  ReadingTheme,
  SurahDetail,
  SurahTafsirDetail
} from '../types/quran.ts';

/**
 * Strictly allowlisted external HTTPS origins for Quran/Tafsir APIs and Murottal Audio CDNs.
 */
export const TRUSTED_API_HOSTS: readonly string[] = [
  'equran.id',
  'www.equran.id',
  'api.quran.gading.dev'
];

export const TRUSTED_AUDIO_HOSTS: readonly string[] = [
  'cdn.equran.id',
  'equran.id',
  'everyayah.com',
  'www.everyayah.com',
  'download.quranicaudio.com',
  'server7.mp3quran.net',
  'server8.mp3quran.net',
  'server11.mp3quran.net',
  'server12.mp3quran.net',
  'cdn.islamic.network',
  'audio.qurancdn.com'
];

const DANGEROUS_OBJECT_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Validates that a Surah number is an integer strictly between 1 and 114.
 */
export function isValidSurahNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 114;
}

/**
 * Validates that an Ayah number is a positive integer within bounds (max 286 in Al-Baqarah).
 */
export function isValidAyahNumber(value: unknown, maxAyat: number = 286): value is number {
  const safeMax = Number.isInteger(maxAyat) && maxAyat > 0 && maxAyat <= 286 ? maxAyat : 286;
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= safeMax;
}

/**
 * Escapes HTML special characters to neutralize XSS before controlled markup injection
 * (such as Tajwid span highlighting). Preserves all Arabic Unicode characters and diacritics.
 */
export function escapeHtml(raw: string): string {
  if (!raw) return '';
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strips dangerous HTML blocks (<script>, <style>, <iframe>, <object>, <embed>),
 * HTML tags, dangerous URI schemes, and ASCII control bytes, returning safe plain text.
 */
export function sanitizePlainText(raw: unknown, maxLength: number = 50_000): string {
  if (typeof raw !== 'string') return '';
  if (!raw) return '';

  const sliced = raw.length > maxLength * 2 ? raw.slice(0, maxLength * 2) : raw;

  const cleaned = sliced
    // Remove ASCII control characters except tab (\t), LF (\n), CR (\r)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    // Strip executable/embedded blocks completely including their inner content
    .replace(/<\s*(script|style|iframe|object|embed|applet|meta|link|base)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    // Strip unclosed or self-closing dangerous tags
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|applet|meta|link|base)\b[^>]*>/gi, '')
    // Convert <br> and paragraph closers to newlines for readable Tafsir formatting
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n\n')
    // Strip all remaining HTML tags
    .replace(/<\/?[^>]+(>|$)/g, '')
    // Decode safe common entities to plain text (rendered strictly via React text nodes)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    // Re-strip any angle-bracket tag sequences that could arise from entity decoding
    .replace(/<\s*\/?\s*[a-zA-Z!][^>]*>/g, '')
    .replace(/\r\n/g, '\n');

  return cleaned.length > maxLength ? cleaned.slice(0, maxLength) : cleaned;
}

/**
 * Sanitizes short user-provided text (search queries, voice transcripts, bookmark notes).
 */
export function sanitizeUserInput(input: unknown, maxLength: number = 200): string {
  if (typeof input !== 'string') return '';
  return sanitizePlainText(input, maxLength)
    .replace(/(?:javascript|vbscript|data)\s*:/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Parses JSON safely with a byte-length cap and recursive prototype-pollution protection
 * (strips __proto__, constructor, and prototype own-properties).
 */
export function safeJsonParse<T = unknown>(raw: string, maxBytes: number = 2_500_000): T | null {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > maxBytes) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw, (key, value) => {
      if (DANGEROUS_OBJECT_KEYS.has(key)) {
        return undefined;
      }
      return value;
    });
    return parsed as T;
  } catch {
    return null;
  }
}

/**
 * Verifies that a URL uses HTTPS, has no embedded credentials, uses default port,
 * and belongs to an allowlisted hostname.
 */
export function isTrustedHttpsUrl(rawUrl: unknown, allowedHosts: readonly string[]): boolean {
  if (typeof rawUrl !== 'string' || rawUrl.length === 0 || rawUrl.length > 2048) {
    return false;
  }

  // Reject path traversal sequences prior to URL canonicalization
  if (/(?:^|[\\/])\.{2}(?:[\\/]|$)|%2e%2e/i.test(rawUrl)) {
    return false;
  }

  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return false;
    if (parsed.username || parsed.password) return false;
    if (parsed.port && parsed.port !== '443') return false;

    const hostname = parsed.hostname.toLowerCase();
    return allowedHosts.includes(hostname);
  } catch {
    return false;
  }
}

export function isTrustedApiUrl(rawUrl: unknown): boolean {
  return isTrustedHttpsUrl(rawUrl, TRUSTED_API_HOSTS);
}

export function isTrustedAudioUrl(rawUrl: unknown): boolean {
  if (!isTrustedHttpsUrl(rawUrl, TRUSTED_AUDIO_HOSTS)) {
    return false;
  }
  try {
    const parsed = new URL(rawUrl as string);
    // Ensure safe audio path without directory traversal
    if (parsed.pathname.includes('..')) return false;
    return /\.mp3$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

/**
 * Returns rawUrl only if it passes strict HTTPS + trusted audio CDN validation;
 * otherwise returns the verified fallbackUrl.
 */
export function sanitizeAudioUrl(rawUrl: unknown, fallbackUrl: string): string {
  if (isTrustedAudioUrl(rawUrl)) {
    return rawUrl as string;
  }
  return isTrustedAudioUrl(fallbackUrl) ? fallbackUrl : '';
}

export interface SecureFetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  allowRelativeApi?: boolean;
}

/**
 * Network-hardened JSON fetcher:
 * - Allows only same-origin `/api/...` routes or allowlisted HTTPS API origins
 * - Enforces AbortController request timeout
 * - Omits credentials and Referer on cross-origin requests
 * - Validates JSON Content-Type, caps payload size, and prevents prototype pollution
 */
export async function secureFetchJson<T = unknown>(
  url: string,
  options: SecureFetchOptions = {}
): Promise<T | null> {
  const { timeoutMs = 7500, maxBytes = 2_500_000, allowRelativeApi = true } = options;

  const isLocalApi =
    allowRelativeApi &&
    typeof url === 'string' &&
    url.startsWith('/api/') &&
    !url.startsWith('//') &&
    !url.includes('..');

  const isExternalTrusted = isTrustedApiUrl(url);

  if (!isLocalApi && !isExternalTrusted) {
    throw new Error('Blocked untrusted network URL');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      credentials: isLocalApi ? 'same-origin' : 'omit',
      referrerPolicy: isLocalApi ? 'same-origin' : 'no-referrer',
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return null;
    }

    const contentLengthHeader = response.headers.get('content-length');
    if (contentLengthHeader) {
      const declaredBytes = Number(contentLengthHeader);
      if (Number.isFinite(declaredBytes) && declaredBytes > maxBytes) {
        return null;
      }
    }

    const rawText = await response.text();
    if (rawText.length > maxBytes) {
      return null;
    }

    return safeJsonParse<T>(rawText, maxBytes);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Safe localStorage reader with schema validator and prototype-pollution protection.
 */
export function safeStorageGet<T>(
  key: string,
  validator: (parsed: unknown) => T | null,
  maxBytes: number = 1_500_000
): T | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = safeJsonParse<unknown>(raw, maxBytes);
    if (parsed === null) return null;
    return validator(parsed);
  } catch {
    return null;
  }
}

/**
 * Safe localStorage writer with payload size cap and quota-exception resilience.
 */
export function safeStorageSet(key: string, value: unknown, maxBytes: number = 1_500_000): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const serialized = JSON.stringify(value);
    if (!serialized || serialized.length > maxBytes) return false;
    window.localStorage.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}

const VALID_THEMES: readonly ReadingTheme[] = ['light', 'sepia', 'dark'];
const VALID_QARI_IDS: readonly QariId[] = [
  'mishari_alafasy',
  'abdul_basit',
  'abdurrahman_assudais',
  'maher_almuaiqly',
  'saad_alghamdi'
];

/**
 * Schema validator & normalizer for ReadingSettings.
 */
export function validateReadingSettings(raw: unknown): ReadingSettings | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;

  const theme: ReadingTheme = VALID_THEMES.includes(obj.theme as ReadingTheme)
    ? (obj.theme as ReadingTheme)
    : 'light';

  const rawArabicSize = typeof obj.arabicFontSize === 'number' ? obj.arabicFontSize : 28;
  const arabicFontSize = Math.min(48, Math.max(20, Math.round(rawArabicSize)));

  const rawTransSize = typeof obj.translationFontSize === 'number' ? obj.translationFontSize : 15;
  const translationFontSize = Math.min(22, Math.max(13, Math.round(rawTransSize)));

  const arabicFontFamily = obj.arabicFontFamily === 'scheherazade' ? 'scheherazade' : 'amiri';

  const qariId: QariId = VALID_QARI_IDS.includes(obj.qariId as QariId)
    ? (obj.qariId as QariId)
    : 'mishari_alafasy';

  return {
    theme,
    arabicFontSize: Number.isFinite(arabicFontSize) ? arabicFontSize : 28,
    translationFontSize: Number.isFinite(translationFontSize) ? translationFontSize : 15,
    arabicFontFamily,
    qariId,
    showTajwid: typeof obj.showTajwid === 'boolean' ? obj.showTajwid : true,
    showTranslation: typeof obj.showTranslation === 'boolean' ? obj.showTranslation : true,
    showLatin: typeof obj.showLatin === 'boolean' ? obj.showLatin : true,
    autoScrollAudio: typeof obj.autoScrollAudio === 'boolean' ? obj.autoScrollAudio : true,
    ...(typeof obj.keepScreenAwake === 'boolean' ? { keepScreenAwake: obj.keepScreenAwake } : {})
  };
}

/**
 * Schema validator & sanitizer for BookmarkItem[] (used for localStorage & JSON file import).
 */
export function validateBookmarkList(raw: unknown, maxItems: number = 500): BookmarkItem[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length > maxItems) return null;

  const validated: BookmarkItem[] = [];

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const item = entry as Record<string, unknown>;

    const type = item.type;
    if (type !== 'ayah' && type !== 'hadith') continue;

    const teksArab = sanitizePlainText(item.teksArab, 5000).trim();
    const teksTerjemah = sanitizePlainText(item.teksTerjemah, 5000).trim();
    if (!teksArab || !teksTerjemah) continue;

    const rawId = typeof item.id === 'string' ? sanitizeUserInput(item.id, 80) : '';
    const safeId =
      rawId && /^[a-zA-Z0-9_-]+$/.test(rawId)
        ? rawId
        : `bm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const rawTimestamp = typeof item.timestamp === 'number' && Number.isFinite(item.timestamp)
      ? item.timestamp
      : Date.now();
    const timestamp = Math.max(0, Math.min(Date.now() + 86_400_000, Math.floor(rawTimestamp)));

    const catatanRaw = typeof item.catatan === 'string' ? sanitizeUserInput(item.catatan, 500) : '';

    if (type === 'ayah') {
      if (!isValidSurahNumber(item.surahNomor) || !isValidAyahNumber(item.ayatNomor)) {
        continue;
      }
      validated.push({
        id: safeId,
        type: 'ayah',
        surahNomor: item.surahNomor,
        surahNamaLatin: sanitizeUserInput(item.surahNamaLatin, 80) || `Surah ${item.surahNomor}`,
        ayatNomor: item.ayatNomor,
        teksArab,
        teksTerjemah,
        ...(catatanRaw ? { catatan: catatanRaw } : {}),
        timestamp
      });
    } else {
      const haditsNomor =
        typeof item.haditsNomor === 'number' &&
        Number.isInteger(item.haditsNomor) &&
        item.haditsNomor >= 1 &&
        item.haditsNomor <= 50_000
          ? item.haditsNomor
          : null;
      const kitabSlug = sanitizeUserInput(item.kitabSlug, 50);
      if (!haditsNomor || !kitabSlug || !/^[a-z0-9-]+$/i.test(kitabSlug)) {
        continue;
      }
      validated.push({
        id: safeId,
        type: 'hadith',
        haditsNomor,
        kitabSlug,
        kitabNama: sanitizeUserInput(item.kitabNama, 100) || kitabSlug,
        teksArab,
        teksTerjemah,
        ...(catatanRaw ? { catatan: catatanRaw } : {}),
        timestamp
      });
    }
  }

  return validated;
}

/**
 * Schema validator & sanitizer for ReadingHistoryItem[].
 */
export function validateReadingHistory(
  raw: unknown,
  maxItems: number = 30
): ReadingHistoryItem[] | null {
  if (!Array.isArray(raw)) return null;

  const validated: ReadingHistoryItem[] = [];
  for (const entry of raw.slice(0, maxItems)) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const item = entry as Record<string, unknown>;

    if (!isValidSurahNumber(item.surahNomor)) continue;
    const totalAyat = isValidAyahNumber(item.totalAyat) ? item.totalAyat : 7;
    const ayatNomor = isValidAyahNumber(item.ayatNomor, totalAyat) ? item.ayatNomor : 1;
    const surahNamaLatin = sanitizeUserInput(item.surahNamaLatin, 80);
    if (!surahNamaLatin) continue;

    const timestamp =
      typeof item.timestamp === 'number' && Number.isFinite(item.timestamp) && item.timestamp > 0
        ? Math.min(Date.now() + 86_400_000, Math.floor(item.timestamp))
        : Date.now();

    validated.push({
      surahNomor: item.surahNomor,
      surahNamaLatin,
      ayatNomor,
      totalAyat,
      timestamp
    });
  }

  return validated;
}

/**
 * Schema validator & sanitizer for cached/proxied SurahDetail payloads.
 */
export function validateSurahDetail(
  raw: unknown,
  expectedSurahNomor: number
): SurahDetail | null {
  if (!isValidSurahNumber(expectedSurahNomor)) return null;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const obj = raw as Record<string, unknown>;
  if (obj.nomor !== expectedSurahNomor) return null;
  if (!Array.isArray(obj.ayat) || obj.ayat.length === 0 || obj.ayat.length > 286) return null;

  const defaultFullAudio = `https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/${String(expectedSurahNomor).padStart(3, '0')}.mp3`;
  const tempatTurun = obj.tempatTurun === 'Madaniyyah' ? 'Madaniyyah' : 'Makkiyyah';

  const sanitizedAyat: Ayah[] = [];
  for (const rawAyah of obj.ayat) {
    if (!rawAyah || typeof rawAyah !== 'object' || Array.isArray(rawAyah)) return null;
    const a = rawAyah as Record<string, unknown>;
    if (!isValidAyahNumber(a.nomorAyat)) return null;

    const teksArab = sanitizePlainText(a.teksArab, 10_000).trim();
    const teksIndonesia = sanitizePlainText(a.teksIndonesia, 10_000).trim();
    if (!teksArab) return null;

    const defaultAyahAudio = `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${String(expectedSurahNomor).padStart(3, '0')}${String(a.nomorAyat).padStart(3, '0')}.mp3`;
    const audioObj =
      a.audio && typeof a.audio === 'object' && !Array.isArray(a.audio)
        ? (a.audio as Record<string, unknown>)
        : {};

    sanitizedAyat.push({
      nomorAyat: a.nomorAyat,
      nomorSurah: expectedSurahNomor,
      teksArab,
      teksLatin: sanitizePlainText(a.teksLatin, 5_000).trim(),
      teksIndonesia,
      audio: {
        alafasy: sanitizeAudioUrl(audioObj.alafasy, defaultAyahAudio)
      }
    });
  }

  return {
    nomor: expectedSurahNomor,
    nama: sanitizePlainText(obj.nama, 120).trim(),
    namaLatin: sanitizeUserInput(obj.namaLatin, 80) || `Surah ${expectedSurahNomor}`,
    jumlahAyat: isValidAyahNumber(obj.jumlahAyat) ? obj.jumlahAyat : sanitizedAyat.length,
    tempatTurun,
    arti: sanitizeUserInput(obj.arti, 120),
    deskripsi: sanitizePlainText(obj.deskripsi, 4000).trim(),
    audioFull: sanitizeAudioUrl(obj.audioFull, defaultFullAudio),
    ...(typeof obj.juzMulai === 'number' && obj.juzMulai >= 1 && obj.juzMulai <= 30
      ? { juzMulai: obj.juzMulai }
      : {}),
    ayat: sanitizedAyat
  };
}

/**
 * Schema validator & sanitizer for cached/proxied SurahTafsirDetail payloads.
 */
export function validateSurahTafsirDetail(
  raw: unknown,
  expectedSurahNomor: number
): SurahTafsirDetail | null {
  if (!isValidSurahNumber(expectedSurahNomor)) return null;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const obj = raw as Record<string, unknown>;
  if (obj.nomor !== expectedSurahNomor) return null;
  if (!obj.tafsir || typeof obj.tafsir !== 'object' || Array.isArray(obj.tafsir)) return null;

  const rawTafsirMap = obj.tafsir as Record<string, unknown>;
  const sanitizedTafsir: Record<number, string> = {};
  let count = 0;

  for (const [key, val] of Object.entries(rawTafsirMap)) {
    if (DANGEROUS_OBJECT_KEYS.has(key)) continue;
    const ayahNo = Number(key);
    if (!isValidAyahNumber(ayahNo)) continue;
    const cleanText = sanitizePlainText(val, 40_000).trim();
    if (cleanText) {
      sanitizedTafsir[ayahNo] = cleanText;
      count++;
    }
  }

  if (count === 0) return null;

  return {
    nomor: expectedSurahNomor,
    nama: sanitizePlainText(obj.nama, 120).trim(),
    namaLatin: sanitizeUserInput(obj.namaLatin, 80) || `Surah ${expectedSurahNomor}`,
    jumlahAyat: isValidAyahNumber(obj.jumlahAyat) ? obj.jumlahAyat : count,
    sumber:
      sanitizeUserInput(obj.sumber, 200) ||
      'Tafsir Kementerian Agama Republik Indonesia (Kemenag RI)',
    tafsir: sanitizedTafsir
  };
}

export interface RateLimitCheckResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

/**
 * Bounded in-memory sliding-window rate limiter for protecting API proxy endpoints.
 */
export class SlidingWindowRateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly maxTrackedKeys: number;
  private readonly hits = new Map<string, number[]>();

  constructor(options: { windowMs: number; maxRequests: number; maxTrackedKeys?: number }) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
    this.maxTrackedKeys = options.maxTrackedKeys ?? 5000;
  }

  public check(clientKey: string, now: number = Date.now()): RateLimitCheckResult {
    const safeKey = (clientKey || 'unknown').slice(0, 128);
    const windowStart = now - this.windowMs;

    if (this.hits.size >= this.maxTrackedKeys && !this.hits.has(safeKey)) {
      this.prune(now);
    }

    const existing = this.hits.get(safeKey) || [];
    const recent = existing.filter((ts) => ts > windowStart);

    if (recent.length >= this.maxRequests) {
      this.hits.set(safeKey, recent);
      const oldestInWindow = recent[0] ?? now;
      return {
        allowed: false,
        limit: this.maxRequests,
        remaining: 0,
        resetMs: Math.max(0, oldestInWindow + this.windowMs - now)
      };
    }

    recent.push(now);
    this.hits.set(safeKey, recent);

    return {
      allowed: true,
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - recent.length),
      resetMs: this.windowMs
    };
  }

  public prune(now: number = Date.now()): void {
    const windowStart = now - this.windowMs;
    for (const [key, timestamps] of this.hits.entries()) {
      const recent = timestamps.filter((ts) => ts > windowStart);
      if (recent.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, recent);
      }
    }
    if (this.hits.size >= this.maxTrackedKeys) {
      const firstKey = this.hits.keys().next().value;
      if (firstKey !== undefined) {
        this.hits.delete(firstKey);
      }
    }
  }
}

/**
 * Generates HTTP security response headers.
 * Designed to be 100% compatible with the AI Studio preview iframe (no X-Frame-Options
 * or restrictive frame-ancestors) while enforcing strict CSP, HSTS, MIME nosniff,
 * Referrer-Policy, and microphone-preserving Permissions-Policy.
 */
export function buildSecurityHeaders(isProduction: boolean): Record<string, string> {
  const scriptSrc = isProduction
    ? "script-src 'self'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

  const connectSrc = isProduction
    ? "connect-src 'self' https://equran.id https://www.equran.id https://cdn.equran.id https://api.quran.gading.dev https://everyayah.com"
    : "connect-src 'self' https://equran.id https://www.equran.id https://cdn.equran.id https://api.quran.gading.dev https://everyayah.com ws: wss:";

  const cspDirectives = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' https://cdn.equran.id https://equran.id https://everyayah.com https://www.everyayah.com https://download.quranicaudio.com https://server7.mp3quran.net https://server8.mp3quran.net https://server11.mp3quran.net https://server12.mp3quran.net https://cdn.islamic.network https://audio.qurancdn.com blob: data:",
    connectSrc,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  return {
    'Content-Security-Policy': cspDirectives,
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), geolocation=(), gyroscope=(), magnetometer=(), payment=(), usb=(), microphone=(self), autoplay=(self), screen-wake-lock=(self)',
    'X-DNS-Prefetch-Control': 'off',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  };
}
