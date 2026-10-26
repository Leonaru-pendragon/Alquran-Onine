import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SurahDetail, Ayah, SurahTafsirDetail, BookmarkItem, ReadingHistoryItem, ReadingSettings } from './src/types/quran.ts';
import { SURAH_METADATA_LIST, JUZ_LIST } from './src/data/quranMetadata.ts';
import { HADITH_BOOKS, HADITH_CATEGORIES, COMPREHENSIVE_HADITHS } from './src/data/hadithsData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory server caches for fast API responses
const serverSurahCache = new Map<number, SurahDetail>();
const serverTafsirCache = new Map<number, SurahTafsirDetail>();
const serverPrayerCache = new Map<string, { timestamp: number; data: unknown }>();
const serverHadithBookCache = new Map<string, unknown>();

// Persistent server-side user state directory (.data/user_state.json)
const DATA_DIR = path.join(__dirname, '.data');
const USER_STATE_FILE = path.join(DATA_DIR, 'user_state.json');

interface PersistedUserState {
  bookmarks: BookmarkItem[];
  readingHistory: ReadingHistoryItem[];
  settings?: ReadingSettings;
  updatedAt: number;
}

function readPersistedState(): PersistedUserState | null {
  try {
    if (fs.existsSync(USER_STATE_FILE)) {
      const raw = fs.readFileSync(USER_STATE_FILE, 'utf-8');
      return JSON.parse(raw) as PersistedUserState;
    }
  } catch (err) {
    console.warn('Failed reading persisted state:', err);
  }
  return null;
}

function writePersistedState(state: PersistedUserState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USER_STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed writing persisted state:', err);
  }
}

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function buildAudioUrl(surahNomor: number, ayahNomor: number): string {
  const s = String(surahNomor).padStart(3, '0');
  const a = String(ayahNomor).padStart(3, '0');
  return `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${s}${a}.mp3`;
}

export async function createAppServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // 1. Health & Cache Status Endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      cache: {
        surahsCached: serverSurahCache.size,
        tafsirsCached: serverTafsirCache.size,
        prayerLocationsCached: serverPrayerCache.size
      }
    });
  });

  // 2. Surah & Juz Metadata Endpoint
  app.get('/api/surahs', (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const tempatTurun = typeof req.query.revelation === 'string' ? req.query.revelation : '';

    let surahs = SURAH_METADATA_LIST;
    if (tempatTurun === 'Makkiyyah' || tempatTurun === 'Madaniyyah') {
      surahs = surahs.filter((s) => s.tempatTurun === tempatTurun);
    }
    if (q) {
      surahs = surahs.filter(
        (s) =>
          String(s.nomor) === q ||
          s.namaLatin.toLowerCase().includes(q) ||
          s.arti.toLowerCase().includes(q)
      );
    }

    res.json({
      total: surahs.length,
      surahs,
      juz: JUZ_LIST
    });
  });

  // 3. Surah Detail Proxy + Server Cache Endpoint
  app.get('/api/surahs/:nomor', async (req, res) => {
    const nomor = Number(req.params.nomor);
    if (!Number.isInteger(nomor) || nomor < 1 || nomor > 114) {
      res.status(400).json({ error: 'Nomor surah harus antara 1 sampai 114.' });
      return;
    }

    const meta = SURAH_METADATA_LIST.find((s) => s.nomor === nomor);
    if (!meta) {
      res.status(404).json({ error: 'Surah tidak ditemukan.' });
      return;
    }

    if (serverSurahCache.has(nomor)) {
      res.json(serverSurahCache.get(nomor));
      return;
    }

    // Primary Upstream: equran.id v2
    try {
      const upstream = await fetchWithTimeout(`https://equran.id/api/v2/surat/${nomor}`, 8000);
      if (upstream.ok) {
        const json = (await upstream.json()) as {
          data?: {
            nama?: string;
            audioFull?: Record<string, string>;
            ayat?: Array<{
              nomorAyat: number;
              teksArab: string;
              teksLatin: string;
              teksIndonesia: string;
              audio?: Record<string, string>;
            }>;
          };
        };

        if (json?.data && Array.isArray(json.data.ayat)) {
          const fullAudio =
            json.data.audioFull?.['05'] ||
            json.data.audioFull?.['01'] ||
            `https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/${String(nomor).padStart(3, '0')}.mp3`;

          const mappedAyat: Ayah[] = json.data.ayat.map((item) => ({
            nomorAyat: item.nomorAyat,
            nomorSurah: nomor,
            teksArab: item.teksArab,
            teksLatin: item.teksLatin,
            teksIndonesia: item.teksIndonesia,
            audio: {
              alafasy: item.audio?.['05'] || item.audio?.['01'] || buildAudioUrl(nomor, item.nomorAyat)
            }
          }));

          const detail: SurahDetail = {
            ...meta,
            nama: json.data.nama || meta.nama,
            audioFull: fullAudio,
            ayat: mappedAyat
          };

          serverSurahCache.set(nomor, detail);
          res.json(detail);
          return;
        }
      }
    } catch (err) {
      console.warn(`[API] Primary surah upstream failed for ${nomor}:`, err);
    }

    // Secondary Upstream: api.quran.gading.dev
    try {
      const upstream2 = await fetchWithTimeout(`https://api.quran.gading.dev/surah/${nomor}`, 7000);
      if (upstream2.ok) {
        const json2 = (await upstream2.json()) as {
          data?: {
            verses?: Array<{
              number: { inSurah: number };
              text: { arab: string; transliteration?: { en?: string } };
              translation?: { id?: string };
              audio?: { primary?: string };
            }>;
          };
        };
        if (json2?.data && Array.isArray(json2.data.verses)) {
          const mappedAyat: Ayah[] = json2.data.verses.map((v) => ({
            nomorAyat: v.number.inSurah,
            nomorSurah: nomor,
            teksArab: v.text.arab,
            teksLatin: v.text.transliteration?.en || '',
            teksIndonesia: v.translation?.id || '',
            audio: {
              alafasy: v.audio?.primary || buildAudioUrl(nomor, v.number.inSurah)
            }
          }));

          const detail: SurahDetail = {
            ...meta,
            audioFull: `https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/${String(nomor).padStart(3, '0')}.mp3`,
            ayat: mappedAyat
          };

          serverSurahCache.set(nomor, detail);
          res.json(detail);
          return;
        }
      }
    } catch (err) {
      console.warn(`[API] Secondary surah upstream failed for ${nomor}:`, err);
    }

    res.status(502).json({ error: 'Upstream Al-Quran API sedang tidak terjangkau, menggunakan cache lokal.' });
  });

  // 4. Surah Tafsir Kemenag RI Proxy + Server Cache Endpoint
  app.get('/api/surahs/:nomor/tafsir', async (req, res) => {
    const nomor = Number(req.params.nomor);
    if (!Number.isInteger(nomor) || nomor < 1 || nomor > 114) {
      res.status(400).json({ error: 'Nomor surah harus antara 1 sampai 114.' });
      return;
    }

    const meta = SURAH_METADATA_LIST.find((s) => s.nomor === nomor);
    if (!meta) {
      res.status(404).json({ error: 'Surah tidak ditemukan.' });
      return;
    }

    if (serverTafsirCache.has(nomor)) {
      res.json(serverTafsirCache.get(nomor));
      return;
    }

    try {
      const upstream = await fetchWithTimeout(`https://equran.id/api/v2/tafsir/${nomor}`, 8000);
      if (upstream.ok) {
        const json = (await upstream.json()) as {
          data?: {
            nama?: string;
            namaLatin?: string;
            jumlahAyat?: number;
            tafsir?: Array<{ ayat: number; teks: string }>;
          };
        };

        if (json?.data && Array.isArray(json.data.tafsir)) {
          const tafsirDict: Record<number, string> = {};
          for (const item of json.data.tafsir) {
            tafsirDict[item.ayat] = item.teks;
          }

          const detail: SurahTafsirDetail = {
            nomor,
            nama: json.data.nama || meta.nama,
            namaLatin: json.data.namaLatin || meta.namaLatin,
            jumlahAyat: json.data.jumlahAyat || meta.jumlahAyat,
            sumber: 'Tafsir Tahlili & Wajiz Kementerian Agama Republik Indonesia (Kemenag RI)',
            tafsir: tafsirDict
          };

          serverTafsirCache.set(nomor, detail);
          res.json(detail);
          return;
        }
      }
    } catch (err) {
      console.warn(`[API] Primary tafsir upstream failed for ${nomor}:`, err);
    }

    res.status(502).json({ error: 'Upstream Tafsir API sedang tidak terjangkau, menggunakan fallback lokal.' });
  });

  // 5. Hadith Encyclopedia Search & Book Proxy Endpoint
  app.get('/api/hadiths', async (req, res) => {
    const kitab = typeof req.query.kitab === 'string' ? req.query.kitab.trim() : 'all';
    const tema = typeof req.query.tema === 'string' ? req.query.tema.trim() : 'Semua';
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const range = typeof req.query.range === 'string' ? req.query.range.trim() : '';

    // Optional live upstream book range lookup (e.g., bukhari?range=1-20)
    if (range && kitab !== 'all' && kitab !== 'arbain') {
      const cacheKey = `${kitab}:${range}`;
      if (serverHadithBookCache.has(cacheKey)) {
        res.json(serverHadithBookCache.get(cacheKey));
        return;
      }
      try {
        const upstream = await fetchWithTimeout(
          `https://api.hadith.gading.dev/books/${encodeURIComponent(kitab)}?range=${encodeURIComponent(range)}`,
          7000
        );
        if (upstream.ok) {
          const json = await upstream.json();
          serverHadithBookCache.set(cacheKey, json);
          res.json(json);
          return;
        }
      } catch {
        // Fallback to curated hadiths below
      }
    }

    let items = COMPREHENSIVE_HADITHS;
    if (kitab && kitab !== 'all') {
      items = items.filter((h) => h.kitabSlug === kitab || h.id.startsWith(kitab));
    }
    if (tema && tema !== 'Semua' && tema !== 'Semua Topik') {
      items = items.filter((h) => h.tema === tema);
    }
    if (q) {
      items = items.filter(
        (h) =>
          h.terjemah.toLowerCase().includes(q) ||
          (h.judul && h.judul.toLowerCase().includes(q)) ||
          h.tema.toLowerCase().includes(q) ||
          h.kitabNama.toLowerCase().includes(q)
      );
    }

    res.json({
      books: HADITH_BOOKS,
      categories: HADITH_CATEGORIES,
      total: items.length,
      hadiths: items
    });
  });

  // 6. Prayer Times (Jadwal Sholat Kemenag RI Method 20) Endpoint
  app.get('/api/prayer-times', async (req, res) => {
    const city = typeof req.query.city === 'string' && req.query.city.trim() ? req.query.city.trim() : 'Jakarta';
    const country =
      typeof req.query.country === 'string' && req.query.country.trim() ? req.query.country.trim() : 'Indonesia';
    const todayKey = `${city.toLowerCase()}_${country.toLowerCase()}_${new Date().toISOString().slice(0, 10)}`;

    const cached = serverPrayerCache.get(todayKey);
    if (cached && Date.now() - cached.timestamp < 6 * 3600 * 1000) {
      res.json(cached.data);
      return;
    }

    try {
      const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=20`;
      const upstream = await fetchWithTimeout(url, 6000);
      if (upstream.ok) {
        const json = (await upstream.json()) as { data?: unknown };
        if (json?.data) {
          const payload = { city, country, source: 'Kemenag RI (Method 20)', data: json.data };
          serverPrayerCache.set(todayKey, { timestamp: Date.now(), data: payload });
          res.json(payload);
          return;
        }
      }
    } catch {
      // Fallback schedule for Jakarta WIB
    }

    res.json({
      city,
      country,
      source: 'Jadwal Standar WIB (Fallback)',
      data: {
        timings: {
          Imsak: '04:18',
          Fajr: '04:28',
          Sunrise: '05:44',
          Dhuhr: '11:52',
          Asr: '15:08',
          Maghrib: '17:56',
          Isha: '19:06'
        }
      }
    });
  });

  // 7. Persistent User State Sync Endpoints (Bookmarks, Reading History, Settings)
  app.get('/api/sync', (_req, res) => {
    const state = readPersistedState();
    res.json({
      hasServerState: Boolean(state),
      state: state || null
    });
  });

  app.post('/api/sync', (req, res) => {
    const body = req.body as Partial<PersistedUserState> | undefined;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Payload tidak valid.' });
      return;
    }

    const existing = readPersistedState();
    const bookmarks = Array.isArray(body.bookmarks)
      ? body.bookmarks.slice(0, 500)
      : existing?.bookmarks || [];
    const readingHistory = Array.isArray(body.readingHistory)
      ? body.readingHistory.slice(0, 100)
      : existing?.readingHistory || [];
    const settings = body.settings && typeof body.settings === 'object' ? body.settings : existing?.settings;

    const nextState: PersistedUserState = {
      bookmarks,
      readingHistory,
      settings,
      updatedAt: Date.now()
    };

    writePersistedState(nextState);
    res.json({ ok: true, updatedAt: nextState.updatedAt });
  });

  // Serve pre-built gh-pages fallback assets and /public mirror (for GitHub Pages root mode verification)
  const ghFallbackDir = path.join(__dirname, 'gh-pages-app');
  if (fs.existsSync(ghFallbackDir)) {
    app.use('/gh-pages-app', express.static(ghFallbackDir));
  }
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    app.use('/public', express.static(publicDir));
  }
  app.get('/gh-pages-preview', (_req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  // Mount Vite in development or serve static dist in production
  if (process.env.NODE_ENV !== 'production') {
    if (!process.env.DISABLE_HMR) {
      process.env.DISABLE_HMR = 'true';
    }
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false
      },
      appType: 'spa'
    });

    app.get('/@vite/client', async (req, res, next) => {
      try {
        const result = await vite.transformRequest(req.originalUrl || '/@vite/client');
        if (!result?.code) {
          next();
          return;
        }
        const patchedCode = result.code
          .replace('console.debug("[vite] connecting...");', '')
          .replace(
            'const createWebSocketModuleRunnerTransport = (options) => {',
            'const createWebSocketModuleRunnerTransport = (options) => { return { async connect() {}, disconnect() {}, send() {} };'
          );
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).send(patchedCode);
      } catch (err) {
        next(err);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  const PORT = Number(process.env.PORT) || 3000;
  createAppServer().then((app) => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  });
}
