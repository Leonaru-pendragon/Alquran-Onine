import type { SurahDetail, Ayah, SurahTafsirDetail } from '../types/quran.ts';
import { SURAH_METADATA_LIST } from '../data/quranMetadata.ts';

// In-memory cache for loaded surahs
const surahCache = new Map<number, SurahDetail>();
const tafsirCache = new Map<number, SurahTafsirDetail>();

// Local storage cache prefix
const STORAGE_PREFIX = 'quran_surah_cache_v1_';
const TAFSIR_STORAGE_PREFIX = 'quran_tafsir_cache_v1_';

// Audio URL generators with high-reliability CDN endpoints
export function getAyahAudioUrl(surahNomor: number, ayahNomor: number): string {
  const s = String(surahNomor).padStart(3, '0');
  const a = String(ayahNomor).padStart(3, '0');
  return `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${s}${a}.mp3`;
}

export function getAyahFallbackAudioUrl(surahNomor: number, ayahNomor: number): string {
  const s = String(surahNomor).padStart(3, '0');
  const a = String(ayahNomor).padStart(3, '0');
  return `https://everyayah.com/data/Alafasy_128kbps/${s}${a}.mp3`;
}

export function getSurahFullAudioUrl(surahNomor: number): string {
  const s = String(surahNomor).padStart(3, '0');
  return `https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/${s}.mp3`;
}

/**
 * Built-in bundled surahs for instant offline loading
 */
const BUNDLED_SURAHS: Record<number, Partial<SurahDetail>> = {
  1: {
    nomor: 1,
    nama: "الفاتحة",
    namaLatin: "Al-Fatihah",
    jumlahAyat: 7,
    tempatTurun: "Makkiyyah",
    arti: "Pembukaan",
    deskripsi: "Surah pembuka Al-Quran yang agung, memuat induk dari seluruh isi Al-Quran (Ummul Quran).",
    audioFull: "https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/001.mp3",
    ayat: [
      {
        nomorAyat: 1,
        nomorSurah: 1,
        teksArab: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        teksLatin: "Bismillāhir-raḥmānir-raḥīm",
        teksIndonesia: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001001.mp3" }
      },
      {
        nomorAyat: 2,
        nomorSurah: 1,
        teksArab: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
        teksLatin: "Al-ḥamdu lillāhi rabbil-'ālamīn",
        teksIndonesia: "Segala puji bagi Allah, Tuhan semesta alam.",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001002.mp3" }
      },
      {
        nomorAyat: 3,
        nomorSurah: 1,
        teksArab: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        teksLatin: "Ar-raḥmānir-raḥīm",
        teksIndonesia: "Maha Pengasih lagi Maha Penyayang,",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001003.mp3" }
      },
      {
        nomorAyat: 4,
        nomorSurah: 1,
        teksArab: "مَٰلِكِ يَوْمِ ٱلدِّينِ",
        teksLatin: "Māliki yaumid-dīn",
        teksIndonesia: "Pemilik hari pembalasan.",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001004.mp3" }
      },
      {
        nomorAyat: 5,
        nomorSurah: 1,
        teksArab: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        teksLatin: "Iyyāka na'budu wa iyyāka nasta'īn",
        teksIndonesia: "Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan.",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001005.mp3" }
      },
      {
        nomorAyat: 6,
        nomorSurah: 1,
        teksArab: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
        teksLatin: "Ihdinaṣ-ṣirāṭal-mustaqīm",
        teksIndonesia: "Tunjukilah kami jalan yang lurus,",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001006.mp3" }
      },
      {
        nomorAyat: 7,
        nomorSurah: 1,
        teksArab: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
        teksLatin: "Ṣirāṭallażīna an'amta 'alaihim gairil-magḍūbi 'alaihim wa laḍ-ḍāllīn",
        teksIndonesia: "(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat.",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001007.mp3" }
      }
    ]
  },
  112: {
    nomor: 112,
    nama: "الإخلاص",
    namaLatin: "Al-Ikhlas",
    jumlahAyat: 4,
    tempatTurun: "Makkiyyah",
    arti: "Ikhlas",
    deskripsi: "Memurnikan keesaan Allah: sebanding dengan sepertiga Al-Quran, tiada beranak dan tiada diperanakkan.",
    audioFull: "https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/112.mp3",
    ayat: [
      {
        nomorAyat: 1,
        nomorSurah: 112,
        teksArab: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
        teksLatin: "Qul huwallāhu aḥad",
        teksIndonesia: "Katakanlah (Muhammad), \"Dialah Allah, Yang Maha Esa.\"",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/112001.mp3" }
      },
      {
        nomorAyat: 2,
        nomorSurah: 112,
        teksArab: "ٱللَّهُ ٱلصَّمَدُ",
        teksLatin: "Allāhuṣ-ṣamad",
        teksIndonesia: "Allah tempat meminta segala sesuatu.",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/112002.mp3" }
      },
      {
        nomorAyat: 3,
        nomorSurah: 112,
        teksArab: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        teksLatin: "Lam yalid wa lam yūlad",
        teksIndonesia: "(Allah) tidak beranak dan tidak pula diperanakkan,",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/112003.mp3" }
      },
      {
        nomorAyat: 4,
        nomorSurah: 112,
        teksArab: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
        teksLatin: "Wa lam yakul lahū kufuwan aḥad",
        teksIndonesia: "dan tidak ada sesuatu yang setara dengan Dia.",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/112004.mp3" }
      }
    ]
  },
  113: {
    nomor: 113,
    nama: "الفلق",
    namaLatin: "Al-Falaq",
    jumlahAyat: 5,
    tempatTurun: "Makkiyyah",
    arti: "Waktu Subuh",
    deskripsi: "Doa perlindungan dari kejahatan makhluk, kegelapan malam, dan kedengkian orang dengki.",
    audioFull: "https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/113.mp3",
    ayat: [
      {
        nomorAyat: 1,
        nomorSurah: 113,
        teksArab: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ",
        teksLatin: "Qul a'ūżu birabbil-falaq",
        teksIndonesia: "Katakanlah, \"Aku berlindung kepada Tuhan yang menguasai subuh (fajar),\"",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/113001.mp3" }
      },
      {
        nomorAyat: 2,
        nomorSurah: 113,
        teksArab: "مِن شَرِّ مَا خَلَقَ",
        teksLatin: "Min syarri mā khalaq",
        teksIndonesia: "dari kejahatan makhluk yang Dia ciptakan,",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/113002.mp3" }
      },
      {
        nomorAyat: 3,
        nomorSurah: 113,
        teksArab: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
        teksLatin: "Wa min syarri gāsiqin iżā waqab",
        teksIndonesia: "dan dari kejahatan malam apabila telah gelap gulita,",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/113003.mp3" }
      },
      {
        nomorAyat: 4,
        nomorSurah: 113,
        teksArab: "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِي ٱلْعُقَدِ",
        teksLatin: "Wa min syarrin-naffāṡāti fil-'uqad",
        teksIndonesia: "dan dari kejahatan (perempuan-perempuan) penyihir yang meniup pada buhul-buhul (talinya),",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/113004.mp3" }
      },
      {
        nomorAyat: 5,
        nomorSurah: 113,
        teksArab: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
        teksLatin: "Wa min syarri ḥāsidin iżā ḥasad",
        teksIndonesia: "dan dari kejahatan orang yang dengki apabila dia dengki.\"",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/113005.mp3" }
      }
    ]
  },
  114: {
    nomor: 114,
    nama: "الناس",
    namaLatin: "An-Nas",
    jumlahAyat: 6,
    tempatTurun: "Makkiyyah",
    arti: "Manusia",
    deskripsi: "Surah penutup Al-Quran memohon perlindungan kepada Raja dan Tuhan manusia.",
    audioFull: "https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/114.mp3",
    ayat: [
      {
        nomorAyat: 1,
        nomorSurah: 114,
        teksArab: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
        teksLatin: "Qul a'ūżu birabbin-nās",
        teksIndonesia: "Katakanlah, \"Aku berlindung kepada Tuhannya manusia,\"",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/114001.mp3" }
      },
      {
        nomorAyat: 2,
        nomorSurah: 114,
        teksArab: "مَلِكِ ٱلنَّاسِ",
        teksLatin: "Malikin-nās",
        teksIndonesia: "Raja manusia,",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/114002.mp3" }
      },
      {
        nomorAyat: 3,
        nomorSurah: 114,
        teksArab: "إِلَٰهِ ٱلنَّاسِ",
        teksLatin: "Ilāhin-nās",
        teksIndonesia: "sembahan manusia,",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/114003.mp3" }
      },
      {
        nomorAyat: 4,
        nomorSurah: 114,
        teksArab: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ",
        teksLatin: "Min syarril-waswāsil-khannās",
        teksIndonesia: "dari kejahatan (bisikan) setan yang bersembunyi,",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/114004.mp3" }
      },
      {
        nomorAyat: 5,
        nomorSurah: 114,
        teksArab: "ٱلَّذِي يُوَسْوِسُ فِي صُدُورِ ٱلنَّاسِ",
        teksLatin: "Allażī yuwaswisu fī ṣudūrin-nās",
        teksIndonesia: "yang membisikkan (kejahatan) ke dalam dada manusia,",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/114005.mp3" }
      },
      {
        nomorAyat: 6,
        nomorSurah: 114,
        teksArab: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
        teksLatin: "Minal-jinnati wan-nās",
        teksIndonesia: "dari (golongan) jin dan manusia.\"",
        audio: { alafasy: "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/114006.mp3" }
      }
    ]
  }
};

/**
 * Fetch a complete Surah by its number (1 to 114).
 * Uses multi-tier caching: in-memory -> localStorage -> Open API -> Fallback.
 */
export async function fetchSurahDetail(surahNumber: number): Promise<SurahDetail> {
  const meta = SURAH_METADATA_LIST.find(s => s.nomor === surahNumber);
  if (!meta) {
    throw new Error(`Surah nomor ${surahNumber} tidak ditemukan.`);
  }

  // 1. Check in-memory cache
  if (surahCache.has(surahNumber)) {
    return surahCache.get(surahNumber)!;
  }

  // 2. Check localStorage cache
  try {
    const cachedStr = localStorage.getItem(`${STORAGE_PREFIX}${surahNumber}`);
    if (cachedStr) {
      const parsed: SurahDetail = JSON.parse(cachedStr);
      if (parsed && parsed.ayat && parsed.ayat.length > 0) {
        surahCache.set(surahNumber, parsed);
        return parsed;
      }
    }
  } catch {
    // ignore storage read issues
  }

  // 3. Check bundled offline surahs
  if (BUNDLED_SURAHS[surahNumber]) {
    const bundled = {
      ...meta,
      ...BUNDLED_SURAHS[surahNumber],
    } as SurahDetail;
    surahCache.set(surahNumber, bundled);
    return bundled;
  }

  // 4. Fetch from official high-availability Indonesian open API: equran.id v2
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`https://equran.id/api/v2/surat/${surahNumber}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      if (json && json.data && Array.isArray(json.data.ayat)) {
        const fullAudio = json.data.audioFull?.['05'] || json.data.audioFull?.['01'] || '';
        const mappedAyat: Ayah[] = json.data.ayat.map((item: any) => ({
          nomorAyat: item.nomorAyat,
          nomorSurah: surahNumber,
          teksArab: item.teksArab,
          teksLatin: item.teksLatin,
          teksIndonesia: item.teksIndonesia,
          audio: {
            alafasy: item.audio?.['05'] || item.audio?.['01'] || `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${String(surahNumber).padStart(3, '0')}${String(item.nomorAyat).padStart(3, '0')}.mp3`
          }
        }));

        const result: SurahDetail = {
          ...meta,
          nama: json.data.nama || meta.nama,
          audioFull: fullAudio || meta.audioFull,
          ayat: mappedAyat
        };

        // Cache result
        surahCache.set(surahNumber, result);
        try {
          localStorage.setItem(`${STORAGE_PREFIX}${surahNumber}`, JSON.stringify(result));
        } catch {
          // quota exceed or private browsing
        }
        return result;
      }
    }
  } catch (err) {
    console.warn(`Gagal memuat surah ${surahNumber} dari API primer, mencoba fallback:`, err);
  }

  // 5. Secondary fallback API: api.quran.gading.dev
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res2 = await fetch(`https://api.quran.gading.dev/surah/${surahNumber}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res2.ok) {
      const json2 = await res2.json();
      if (json2 && json2.data && Array.isArray(json2.data.verses)) {
        const mappedAyat: Ayah[] = json2.data.verses.map((v: any) => ({
          nomorAyat: v.number.inSurah,
          nomorSurah: surahNumber,
          teksArab: v.text.arab,
          teksLatin: v.text.transliteration?.en || '',
          teksIndonesia: v.translation?.id || '',
          audio: {
            alafasy: v.audio?.primary || `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${String(surahNumber).padStart(3, '0')}${String(v.number.inSurah).padStart(3, '0')}.mp3`
          }
        }));

        const result: SurahDetail = {
          ...meta,
          ayat: mappedAyat
        };
        surahCache.set(surahNumber, result);
        try {
          localStorage.setItem(`${STORAGE_PREFIX}${surahNumber}`, JSON.stringify(result));
        } catch {
          // ignore
        }
        return result;
      }
    }
  } catch (err) {
    console.warn(`Gagal memuat surah ${surahNumber} dari API sekunder:`, err);
  }

  // 6. Graceful synthetic fallback generator if offline for unbundled surahs
  // Generates valid placeholder verses so the reader remains functional
  const fallbackAyat: Ayah[] = Array.from({ length: Math.min(meta.jumlahAyat, 10) }, (_, i) => ({
    nomorAyat: i + 1,
    nomorSurah: surahNumber,
    teksArab: i === 0 && surahNumber !== 9 ? "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" : `﴿${i + 1}﴾ ${meta.nama}`,
    teksLatin: `Ayat ${i + 1} dari Surah ${meta.namaLatin}`,
    teksIndonesia: `Ayat ke-${i + 1} surah ${meta.namaLatin} (${meta.arti}). Hubungkan koneksi internet untuk mengunduh naskah lengkap 114 Surah.`,
    audio: {
      alafasy: `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${String(surahNumber).padStart(3, '0')}${String(i + 1).padStart(3, '0')}.mp3`
    }
  }));

  const fallbackResult: SurahDetail = {
    ...meta,
    ayat: fallbackAyat
  };
  return fallbackResult;
}

/**
 * Built-in bundled tafsir for key surahs (offline resilience)
 */
const BUNDLED_TAFSIR: Record<number, Record<number, string>> = {
  1: {
    1: "Surah al-Fatihah dimulai dengan Basmalah. Basmalah adalah ayat tersendiri yang mengawali surah-surah Al-Qur'an (kecuali at-Taubah). Membaca Basmalah mengingatkan seorang muslim bahwa setiap pekerjaan baik harus diniatkan lillahi ta'ala demi mengharap ridha dan berkah Allah SWT.",
    2: "Segala puji hanya milik Allah, Tuhan yang memelihara, mendidik, dan mengayomi seluruh alam semesta. Dialah sumber segala nikmat yang ada di langit dan di bumi.",
    3: "Maha Pengasih lagi Maha Penyayang. Dua sifat kemuliaan Allah: Ar-Rahman (kasih sayang luas kepada seluruh makhluk di dunia) dan Ar-Rahim (kasih sayang khusus bagi orang-orang beriman di akhirat kelak).",
    4: "Pemilik dan Penguasa mutlak di hari pembalasan (Yaumid-Din), hari ketika segala amal perbuatan manusia dihisab dengan seadil-adilnya tanpa kezaliman sedikit pun.",
    5: "Hanya kepada-Mu ya Allah kami beribadah memurnikan tauhid, dan hanya kepada-Mu kami bersimpuh memohon pertolongan dalam segala urusan dunia dan akhirat.",
    6: "Tunjukilah dan bimbinglah kami ke jalan yang lurus (ash-shirathal mustaqim), jalan kebenaran Islam yang terang benderang yang membawa kepada keselamatan.",
    7: "Yaitu jalan orang-orang yang telah Engkau anugerahi nikmat iman dan hidayah kepada mereka (para nabi, shiddiqin, syuhada, dan shalihin); bukan jalan mereka yang dimurkai (karena mengetahui kebenaran namun meninggalkannya) dan bukan pula jalan mereka yang tersesat (karena berbuat tanpa ilmu)."
  },
  112: {
    1: "Katakanlah wahai Muhammad: Dialah Allah, Tuhan Yang Maha Esa dalam Zat, Sifat, dan Perbuatan-Nya. Tidak ada sekutu bagi-Nya.",
    2: "Allah adalah As-Samad: tempat bergantung dan meminta segala hajat seluruh makhluk.",
    3: "Allah tidak beranak dan tidak pula diperanakkan, Maha Suci Dia dari sifat-sifat makhluk.",
    4: "Dan tidak ada seorang pun atau sesuatu pun yang sebanding, setara, atau serupa dengan Dia."
  },
  113: {
    1: "Katakanlah: Aku berlindung kepada Tuhan yang menguasai waktu subuh (fajar) yang menyingsingkan kegelapan malam.",
    2: "Memohon perlindungan dari kejahatan dan mara bahaya segala makhluk yang diciptakan-Nya.",
    3: "Dan dari kejahatan malam apabila telah gelap gulita, ketika marabahaya dan kejahatan kerap bertebaran.",
    4: "Dan dari kejahatan perempuan-perempuan tukang sihir yang meniup buhul-buhul tali untuk mencelakakan manusia.",
    5: "Serta dari kejahatan orang-orang yang berhati dengki (hasad) apabila ia melampiaskan kedengkiannya."
  },
  114: {
    1: "Katakanlah: Aku berlindung kepada Tuhan yang memelihara dan mendidik seluruh manusia.",
    2: "Raja dan Penguasa tertinggi yang memiliki kedaulatan mutlak atas sekalian manusia.",
    3: "Sembahan yang hak bagi manusia, tiada sekutu bagi-Nya.",
    4: "Dari kejahatan bisikan setan yang bersembunyi (al-khannas), yang lari ketika manusia mengingat Allah dan kembali berbisik saat manusia lalai.",
    5: "Yang senantiasa membisikkan keraguan dan keburukan ke dalam dada-dada manusia.",
    6: "Dari golongan jin dan manusia yang menjadi corong-corong godaan dan keburukan."
  }
};

/**
 * Fetch Tafsir for a complete Surah from official API (equran.id v2 / Kemenag RI).
 * Returns a SurahTafsirDetail object containing tafsir text indexed by ayah number.
 */
export async function fetchSurahTafsir(surahNumber: number): Promise<SurahTafsirDetail> {
  const meta = SURAH_METADATA_LIST.find((s) => s.nomor === surahNumber);
  const surahName = meta?.namaLatin || `Surah ${surahNumber}`;
  const totalAyat = meta?.jumlahAyat || 7;

  // 1. Check in-memory cache
  if (tafsirCache.has(surahNumber)) {
    return tafsirCache.get(surahNumber)!;
  }

  // 2. Check localStorage cache
  try {
    const cachedStr = localStorage.getItem(`${TAFSIR_STORAGE_PREFIX}${surahNumber}`);
    if (cachedStr) {
      const parsed: SurahTafsirDetail = JSON.parse(cachedStr);
      if (parsed && parsed.tafsir && Object.keys(parsed.tafsir).length > 0) {
        tafsirCache.set(surahNumber, parsed);
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  // 3. Fetch from equran.id API v2 (Official Kemenag RI Tafsir)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`https://equran.id/api/v2/tafsir/${surahNumber}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data.tafsir)) {
        const tafsirDict: Record<number, string> = {};
        json.data.tafsir.forEach((item: { ayat: number; teks: string }) => {
          tafsirDict[item.ayat] = item.teks;
        });

        const detail: SurahTafsirDetail = {
          nomor: surahNumber,
          nama: json.data.nama || meta?.nama || '',
          namaLatin: json.data.namaLatin || surahName,
          jumlahAyat: json.data.jumlahAyat || totalAyat,
          sumber: 'Tafsir Tahlili & Wajiz Kementerian Agama Republik Indonesia (Kemenag RI)',
          tafsir: tafsirDict
        };

        tafsirCache.set(surahNumber, detail);
        try {
          localStorage.setItem(`${TAFSIR_STORAGE_PREFIX}${surahNumber}`, JSON.stringify(detail));
        } catch {
          // ignore
        }
        return detail;
      }
    }
  } catch (err) {
    console.warn(`Gagal memuat tafsir surah ${surahNumber} dari API primer:`, err);
  }

  // 4. Secondary fallback: api.quran.gading.dev
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res2 = await fetch(`https://api.quran.gading.dev/surah/${surahNumber}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res2.ok) {
      const json2 = await res2.json();
      if (json2 && json2.data && Array.isArray(json2.data.verses)) {
        const tafsirDict: Record<number, string> = {};
        json2.data.verses.forEach((v: any) => {
          const ayahNo = v.number?.inSurah;
          const textTafsir = v.tafsir?.id?.short || v.tafsir?.id?.long || v.translation?.id || '';
          if (ayahNo && textTafsir) {
            tafsirDict[ayahNo] = textTafsir;
          }
        });

        const detail: SurahTafsirDetail = {
          nomor: surahNumber,
          nama: meta?.nama || '',
          namaLatin: surahName,
          jumlahAyat: totalAyat,
          sumber: 'Tafsir Ringkas Kementerian Agama RI (Kemenag)',
          tafsir: tafsirDict
        };

        tafsirCache.set(surahNumber, detail);
        try {
          localStorage.setItem(`${TAFSIR_STORAGE_PREFIX}${surahNumber}`, JSON.stringify(detail));
        } catch {
          // ignore
        }
        return detail;
      }
    }
  } catch (err) {
    console.warn(`Gagal memuat tafsir surah ${surahNumber} dari API sekunder:`, err);
  }

  // 5. Check bundled offline tafsir
  if (BUNDLED_TAFSIR[surahNumber]) {
    const detail: SurahTafsirDetail = {
      nomor: surahNumber,
      nama: meta?.nama || '',
      namaLatin: surahName,
      jumlahAyat: totalAyat,
      sumber: 'Tafsir Ringkas Kementerian Agama RI (Kemenag)',
      tafsir: BUNDLED_TAFSIR[surahNumber]
    };
    tafsirCache.set(surahNumber, detail);
    return detail;
  }

  // 6. Generic synthetic fallback tafsir
  const fallbackDict: Record<number, string> = {};
  for (let i = 1; i <= totalAyat; i++) {
    fallbackDict[i] = `Tafsir ayat ke-${i} dari Surah ${surahName} (${meta?.arti || ''}). Hubungkan perangkat ke internet untuk mengunduh naskah tafsir lengkap Kemenag RI secara otomatis.`;
  }

  const fallbackDetail: SurahTafsirDetail = {
    nomor: surahNumber,
    nama: meta?.nama || '',
    namaLatin: surahName,
    jumlahAyat: totalAyat,
    sumber: 'Tafsir Kementerian Agama Republik Indonesia',
    tafsir: fallbackDict
  };

  return fallbackDetail;
}

