import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectStaticHost } from '../../services/quranApi';
import { renderTajwidHtml, resolveTajwidPdfUrl, TAJWID_BOOK_META } from '../../data/tajwidRules';
import { createAppServer } from '../../../server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../..');

test('detectStaticHost identifies GitHub Pages and fallback bootloader mode accurately', () => {
  assert.equal(detectStaticHost('leonaru-pendragon.github.io', false), true);
  assert.equal(detectStaticHost('LEONARU-PENDRAGON.GITHUB.IO', false), true);
  assert.equal(detectStaticHost('alquran.pages.dev', false), true);
  assert.equal(detectStaticHost('localhost', false), false);
  assert.equal(detectStaticHost('localhost', true), true);
});

test('resolveTajwidPdfUrl uses relative subpath-safe URLs for both GitHub Actions dist and root fallback modes', () => {
  assert.equal(TAJWID_BOOK_META.pdfUrl.startsWith('./assets/aistudio/'), true);
  assert.equal(resolveTajwidPdfUrl(false).startsWith('./assets/aistudio/'), true);
  assert.equal(resolveTajwidPdfUrl(true).startsWith('./public/assets/aistudio/'), true);

  const diskPdfPath = path.join(ROOT_DIR, resolveTajwidPdfUrl(true));
  assert.equal(fs.existsSync(diskPdfPath), true, 'Qiraati PDF file must exist in public/assets/aistudio');
});

test('GitHub Pages fallback bundle and index.html cache-busting build hash are in sync with latest Qiraati content', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  const buildIdMatch = indexHtml.match(/window\.__APP_BUILD_ID__\s*=\s*'([a-f0-9]{10})'/);
  assert.ok(buildIdMatch, 'index.html must contain a 10-char hex __APP_BUILD_ID__');

  const buildId = buildIdMatch[1];
  assert.ok(
    indexHtml.includes(`./gh-pages-app/app.css?v=${buildId}`),
    'index.html must reference cache-busted app.css?v=<buildId>'
  );
  assert.ok(
    indexHtml.includes(`./gh-pages-app/app.js?v=${buildId}`),
    'index.html must reference cache-busted app.js?v=<buildId>'
  );

  const appJsPath = path.join(ROOT_DIR, 'gh-pages-app', 'app.js');
  assert.equal(fs.existsSync(appJsPath), true, 'gh-pages-app/app.js must exist');
  const appJsContent = fs.readFileSync(appJsPath, 'utf8');
  assert.equal(
    appJsContent.includes('Dachlan Salim Zarkasyi'),
    true,
    'gh-pages-app/app.js must include the latest Qiraati PDF Tajwid content'
  );
  assert.equal(
    appJsContent.includes('Pelajaran Ilmu Tajwid Praktis'),
    true,
    'gh-pages-app/app.js must include Pelajaran Ilmu Tajwid Praktis title'
  );
  assert.equal(
    appJsContent.includes('Warna & Catatan Bacaan Gharib'),
    false,
    'gh-pages-app/app.js must not include removed Gharib settings toggle'
  );
});

test('renderTajwidHtml attaches space-preceded Quranic combining waqf/saktah marks to preceding glyph', () => {
  const raw = 'عِوَجًا \u06DC';
  assert.equal(renderTajwidHtml(raw, false), 'عِوَجًا\u06DC');
  assert.ok(!renderTajwidHtml(raw, true).includes(' \u06DC'));
});

test('Express backend endpoints respond with valid JSON and persist sync state', async () => {
  process.env.NODE_ENV = 'production';
  const app = await createAppServer();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address();
  assert.ok(addr && typeof addr === 'object');
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  try {
    // 1. Health endpoint
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthJson = (await healthRes.json()) as { status: string };
    assert.equal(healthJson.status, 'ok');

    // 2. Surahs metadata endpoint + search query
    const surahsRes = await fetch(`${baseUrl}/api/surahs?q=kahf`);
    assert.equal(surahsRes.status, 200);
    const surahsJson = (await surahsRes.json()) as { total: number; surahs: Array<{ nomor: number }> };
    assert.ok(surahsJson.total >= 1);
    assert.ok(surahsJson.surahs.some((s) => s.nomor === 18));

    // 3. Invalid surah number validation
    const invalidRes = await fetch(`${baseUrl}/api/surahs/999`);
    assert.equal(invalidRes.status, 400);

    // 4. Hadiths endpoint filtering
    const hadithRes = await fetch(`${baseUrl}/api/hadiths?kitab=arbain`);
    assert.equal(hadithRes.status, 200);
    const hadithJson = (await hadithRes.json()) as { total: number; books: unknown[] };
    assert.ok(Array.isArray(hadithJson.books));
    assert.ok(hadithJson.total >= 1);

    // 5. User state sync POST -> GET round-trip
    const syncPayload = {
      bookmarks: [
        {
          id: 'bm_test_1',
          type: 'ayah',
          surahNomor: 1,
          surahNamaLatin: 'Al-Fatihah',
          ayatNomor: 1,
          teksArab: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
          teksTerjemah: 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.',
          timestamp: Date.now()
        }
      ],
      readingHistory: [
        {
          surahNomor: 18,
          surahNamaLatin: 'Al-Kahf',
          ayatNomor: 10,
          totalAyat: 110,
          timestamp: Date.now()
        }
      ],
      settings: {
        theme: 'sepia',
        arabicFontSize: 30,
        translationFontSize: 16,
        arabicFontFamily: 'amiri',
        showTajwid: true,
        showTranslation: true,
        showLatin: true,
        autoScrollAudio: true
      }
    };

    const postSync = await fetch(`${baseUrl}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(syncPayload)
    });
    assert.equal(postSync.status, 200);

    const getSync = await fetch(`${baseUrl}/api/sync`);
    assert.equal(getSync.status, 200);
    const getSyncJson = (await getSync.json()) as {
      hasServerState: boolean;
      state: { readingHistory: Array<{ surahNomor: number }> };
    };
    assert.equal(getSyncJson.hasServerState, true);
    assert.equal(getSyncJson.state.readingHistory[0].surahNomor, 18);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
