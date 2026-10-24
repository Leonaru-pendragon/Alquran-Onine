import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { detectStaticHost } from '../../services/quranApi';
import { renderTajwidHtml } from '../../data/tajwidRules';
import { createAppServer } from '../../../server';

test('detectStaticHost identifies GitHub Pages and fallback bootloader mode accurately', () => {
  assert.equal(detectStaticHost('leonaru-pendragon.github.io', false), true);
  assert.equal(detectStaticHost('LEONARU-PENDRAGON.GITHUB.IO', false), true);
  assert.equal(detectStaticHost('alquran.pages.dev', false), true);
  assert.equal(detectStaticHost('localhost', false), false);
  assert.equal(detectStaticHost('localhost', true), true);
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
