import {
  TajwidRule,
  TajwidBookQuestion,
  TajwidQuizQuestion
} from '../types/quran';
import { escapeHtml } from '../utils/security';
import { extractGharibPlaceholders, normalizeQuranicText } from './gharibData';

export const TAJWID_PDF_FILENAME =
  'pdf-p-classtruncatedtext-module-lineclamped-85ulhh-style-max-lines5tajwid-praktis-p_compress_91d71235.pdf';

export const TAJWID_BOOK_META = {
  judul: 'Pelajaran Ilmu Tajwid Praktis',
  subjudul: "Untuk TK. Al-Qur'an — Metode Qira'ati (قِرَاءَتِي)",
  penyusun: 'H. Dachlan Salim Zarkasyi',
  jumlahPelajaran: 13,
  jumlahHalaman: 37,
  pdfUrl: `./assets/aistudio/${TAJWID_PDF_FILENAME}`
} as const;

export function resolveTajwidPdfUrl(isRootFallback?: boolean): string {
  const fallbackActive =
    typeof isRootFallback === 'boolean'
      ? isRootFallback
      : typeof window !== 'undefined' &&
        Boolean((window as unknown as { __GH_FALLBACK_LOADED__?: boolean }).__GH_FALLBACK_LOADED__);

  return fallbackActive
    ? `./public/assets/aistudio/${TAJWID_PDF_FILENAME}`
    : `./assets/aistudio/${TAJWID_PDF_FILENAME}`;
}

export const TAJWID_CATEGORIES = [
  'Semua Pelajaran',
  'Pelajaran 1–2: Ghunnah & Tanwin',
  'Pelajaran 3: Nun Sukun / Tanwin (5)',
  'Pelajaran 4: Mim Sukun (3)',
  'Pelajaran 5–7: Tiga Idgham',
  'Pelajaran 8–9: Qalqalah & Lafadh Allah',
  'Pelajaran 10–11: Al & Idzhar Wajib',
  'Pelajaran 12: Hukum Ra (2)',
  'Pelajaran 13: Hukum Mad (Thabi\'i & 13 Far\'i)'
] as const;

export const TAJWID_RULES: TajwidRule[] = [
  // =========================================================================
  // PELAJARAN KE-1: GHUNNAH (HAL. 1)
  // =========================================================================
  {
    id: 'ghunnah',
    pelajaranKe: 1,
    halamanBuku: 'Hal. 1',
    urutanBuku: 'Pelajaran ke-1',
    rumusArab: 'نّ — مّ',
    nama: 'Ghunnah',
    kategori: 'Pelajaran 1–2: Ghunnah & Tanwin',
    warna: 'tajwid-ghunnah',
    hexColor: '#059669',
    kadarHarakat: 'Dengung pada Nun/Mim bertasydid',
    aktifDiMushaf: true,
    deskripsi:
      'Setiap huruf Nun atau Mim yang bertasydid (نّ — مّ), dalam Ilmu Tajwid namanya Ghunnah.',
    caraBaca:
      'Dibaca mendengung pada setiap huruf Nun bertasydid (نّ) atau Mim bertasydid (مّ).',
    catatanPenting:
      'Pedoman Mengajar Buku: Setelah murid menerima pelajaran di atas, dilanjutkan membaca Al-Qur\'an. Apabila ayat yang sedang dibaca ada Nun dan Mim bertasydid, langsung ditanyakan ada pelajaran apa yang sedang dibaca. Jangan menambah pelajaran baru sebelum setiap murid dapat menjawab pertanyaan dengan cepat dan tepat.',
    huruf: ['نّ', 'مّ'],
    contohArab: 'إِنَّ · ثُمَّ · إِنَّمَا · فَلَمَّا · وَلَٰكِنَّا',
    contohLatin: 'Inna · Tsumma · Innamā · Falammā · Wa lākinnā',
    penjelasanContoh:
      'Lima contoh langsung dari halaman 1 buku: huruf Nun bertasydid pada إِنَّ, إِنَّمَا, وَلَٰكِنَّا dan Mim bertasydid pada ثُمَّ, فَلَمَّا namanya Ghunnah.',
    soalJawabBuku: [
      {
        soal: 'Setiap huruf Nun dan Mim yang bertasydid dalam ilmu tajwid namanya apa?',
        jawab: 'Setiap huruf Nun dan Mim bertasydid dalam Ilmu Tajwid namanya Ghunnah.'
      }
    ],
    rujukanSurah: { surahNomor: 102, ayatNomor: 4, label: 'QS. At-Takatsur [102]: 4' }
  },

  // =========================================================================
  // PELAJARAN KE-2: PERBEDAAN NUN SUKUN DAN TANWIN (HAL. 2)
  // =========================================================================
  {
    id: 'perbedaan-nun-sukun-tanwin',
    pelajaranKe: 2,
    halamanBuku: 'Hal. 2',
    urutanBuku: 'Pelajaran ke-2',
    rumusArab: 'مَنْ = مًا ❖ مِنْ = مٍ ❖ مُنْ = مٌ',
    nama: 'Perbedaan Nun Sukun dan Tanwin',
    kategori: 'Pelajaran 1–2: Ghunnah & Tanwin',
    warna: 'tajwid-izhar',
    hexColor: '#475569',
    kadarHarakat: 'Sama suara · Lain tulisan',
    aktifDiMushaf: false,
    deskripsi:
      'Perbedaan Nun Sukun dan Tanwin: sama dalam suara, lain dalam tulisan. Suara Nun Sukun dan Tanwin sama, maka hukum Nun Sukun dan Tanwin juga sama.',
    caraBaca:
      'مَنْ dibaca sama suaranya dengan مًا ("man"), مِنْ dibaca sama suaranya dengan مٍ ("min"), dan مُنْ dibaca sama suaranya dengan مٌ ("mun").',
    catatanPenting:
      'Pedoman Mengajar Buku: Soal jawab Ilmu Tajwid diajarkan setelah pelajaran Al-Qur\'an. Berikanlah pelajaran Ilmu Tajwid sedikit demi sedikit, jangan menambah ilmu Tajwid yang baru sebelum murid hafal di luar kepala tanpa menghafal.',
    huruf: ['نْ', 'ـً', 'ـٍ', 'ـٌ'],
    contohArab: 'مَنْ = مًا · مِنْ = مٍ · مُنْ = مٌ',
    contohLatin: 'Man = Man · Min = Min · Mun = Mun',
    penjelasanContoh:
      'Walaupun bentuk tulisannya berbeda (Nun mati نْ dibanding tanda baris dua ً ٍ ٌ), bunyi akhirnya sama persis sehingga seluruh hukum bacaannya juga sama.',
    soalJawabBuku: [
      {
        soal: 'Jelaskan perbedaan Nun Sukun dan Tanwin!',
        jawab: 'Perbedaan Nun Sukun dan Tanwin: sama dalam suara, lain dalam tulisan.'
      }
    ]
  },

  // =========================================================================
  // PELAJARAN KE-3: HUKUM NUN SUKUN / TANWIN — DIBAGI LIMA (HAL. 3–13)
  // =========================================================================
  {
    id: 'idgham-bighunnah',
    pelajaranKe: 3,
    halamanBuku: 'Hal. 3–5',
    urutanBuku: 'Pelajaran ke-3 · Hukum Nun Sukun/Tanwin ke-1 (dari 5)',
    rumusArab: 'نْ / (ً ٍ ٌ) ← ي و م ن',
    nama: '1. Idgham Bighunnah',
    kategori: 'Pelajaran 3: Nun Sukun / Tanwin (5)',
    warna: 'tajwid-idgham-bighunnah',
    hexColor: '#0891b2',
    kadarHarakat: 'Lebur disertai dengung',
    aktifDiMushaf: true,
    deskripsi:
      'Hukum Nun Sukun/Tanwin dibagi lima. Pertama: Yang dinamakan Idgham Bighunnah ialah Nun Sukun/Tanwin bertemu salah satu huruf Ya, Wawu, Mim, Nun (ي و م ن).',
    caraBaca:
      'Suara Nun Sukun atau Tanwin dimasukkan/dilebur ke dalam huruf Ya, Wawu, Mim, atau Nun dengan mendengung (pada dua kalimat terpisah).',
    catatanPenting:
      'Jika Nun Sukun bertemu Ya atau Wawu di dalam SATU kalimat (الدُّنْيَا, بُنْيَانٌ, صِنْوَانٌ, قِنْوَانٌ), bukan Idgham Bighunnah melainkan Idzhar Wajib (lihat Pelajaran ke-11 Hal. 23).',
    huruf: ['ي', 'و', 'م', 'ن'],
    contohArab: 'لِمَنْ يَرَىٰ · مِنْ وَرَآئِهِمْ · نَكُنْ مَعَكُمْ · مِنْ نَاصِرِينَ',
    contohLatin: 'Limay-yarā · Miw-warā’ihim · Nakum-ma‘akum · Min-nāṣirīn',
    penjelasanContoh:
      'Seluruh 16 contoh pada halaman 3–5 buku dikelompokkan lengkap untuk pertemuan dengan huruf Ya, Wawu, Mim, dan Nun.',
    rincianContoh: [
      {
        judul: 'Contoh Nun Sukun/Tanwin bertemu Ya (ي) — Hal. 3',
        rumusArab: 'نْ / (ً ٍ ٌ) ← ي',
        contohArab: 'لِمَنْ يَرَىٰ · وُجُوهٌ يَوْمَئِذٍ · أَنْ يَتُوبَ · لِقَوْمٍ يُوقِنُونَ',
        contohLatin: 'Limay-yarā · Wujūhuy-yauma’iżin · Ay-yatūba · Liqaumiy-yūqinūn'
      },
      {
        judul: 'Contoh Nun Sukun/Tanwin bertemu Wawu (و) — Hal. 4',
        rumusArab: 'نْ / (ً ٍ ٌ) ← و',
        contohArab: 'مِنْ وَرَآئِهِمْ · عَذَابٌ وَاصِبٌ · عِوَجًا وَلَا أَمْتًا · قُوَّةٍ وَلَا نَاصِرٍ',
        contohLatin: 'Miw-warā’ihim · ‘Ażābuw-wāṣib · ‘Iwajaw-wa lā amtā · Quwwatiw-wa lā nāṣir'
      },
      {
        judul: 'Contoh Nun Sukun/Tanwin bertemu Mim (م) — Hal. 4',
        rumusArab: 'نْ / (ً ٍ ٌ) ← م',
        contohArab: 'نَكُنْ مَعَكُمْ · لَكَفُورٌ مُبِينٌ · فَتْحًا مُبِينًا · مِنْ مَآءٍ مَهِينٍ',
        contohLatin: 'Nakum-ma‘akum · Lakafūrum-mubīn · Fatḥam-mubīnā · Mim-mā’im-mahīn'
      },
      {
        judul: 'Contoh Nun Sukun/Tanwin bertemu Nun (ن) — Hal. 5',
        rumusArab: 'نْ / (ً ٍ ٌ) ← ن',
        contohArab: 'مِنْ نَاصِرِينَ · حِطَّةٌ نَغْفِرْ لَكُمْ · عَنْ نَفْسِهِ · دَرَجَاتٍ مَنْ نَشَآءُ',
        contohLatin: 'Min-nāṣirīn · Ḥiṭṭatun-naghfir lakum · ‘An-nafsihī · Darajātim-man-nasyā’'
      }
    ],
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Idgham Bighunnah?',
        jawab: 'Yang dinamakan Idgham Bighunnah ialah Nun Sukun/Tanwin bertemu salah satu huruf Ya, Wawu, Mim, Nun.'
      }
    ],
    rujukanSurah: { surahNomor: 88, ayatNomor: 2, label: 'QS. Al-Ghasyiyah [88]: 2' }
  },
  {
    id: 'idgham-bilaghunnah',
    pelajaranKe: 3,
    halamanBuku: 'Hal. 5–6',
    urutanBuku: 'Pelajaran ke-3 · Hukum Nun Sukun/Tanwin ke-2 (dari 5)',
    rumusArab: 'نْ / (ً ٍ ٌ) ← ل ر',
    nama: '2. Idgham Bilaghunnah',
    kategori: 'Pelajaran 3: Nun Sukun / Tanwin (5)',
    warna: 'tajwid-idgham-bilaghunnah',
    hexColor: '#0284c7',
    kadarHarakat: 'Lebur tanpa dengung',
    aktifDiMushaf: true,
    deskripsi:
      'Yang dinamakan Idgham Bilaghunnah ialah Nun Sukun/Tanwin bertemu Lam/Ra (ل / ر).',
    caraBaca:
      'Suara Nun Sukun atau Tanwin dilebur langsung ke huruf Lam atau Ra tanpa mendengung.',
    huruf: ['ل', 'ر'],
    contohArab: 'مِنْ لَدُنْكَ · ذِكْرٌ لِلْعَالَمِينَ · فَمَنْ رَبُّكُمَا · غَفُورٌ رَحِيمٌ',
    contohLatin: 'Mil-ladunka · Żikrul-lil-‘ālamīn · Famar-rabbukumā · Ghafūrur-raḥīm',
    penjelasanContoh:
      'Delapan contoh lengkap dari halaman 6 buku untuk pertemuan Nun Sukun/Tanwin dengan huruf Lam dan Ra.',
    rincianContoh: [
      {
        judul: 'Contoh Nun Sukun/Tanwin bertemu Lam (ل) — Hal. 6',
        rumusArab: 'نْ / (ً ٍ ٌ) ← ل',
        contohArab: 'مِنْ لَدُنْكَ · قَلِيلٍ لَيُصْبِحُنَّ · لَطِيفٌ لِمَا · ذِكْرٌ لِلْعَالَمِينَ',
        contohLatin: 'Mil-ladunka · Qalīlil-layuṣbiḥunna · Laṭīful-limā · Żikrul-lil-‘ālamīn'
      },
      {
        judul: 'Contoh Nun Sukun/Tanwin bertemu Ra (ر) — Hal. 6',
        rumusArab: 'نْ / (ً ٍ ٌ) ← ر',
        contohArab: 'فَمَنْ رَبُّكُمَا · عِيشَةٍ رَاضِيَةٍ · غَفُورٌ رَحِيمٌ · مِنْ رَبٍّ رَحِيمٍ',
        contohLatin: 'Famar-rabbukumā · ‘Īsyatir-rāḍiyah · Ghafūrur-raḥīm · Mir-rabbir-raḥīm'
      }
    ],
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Idgham Bilaghunnah?',
        jawab: 'Yang dinamakan Idgham Bilaghunnah ialah Nun Sukun/Tanwin bertemu Lam/Ra.'
      }
    ],
    rujukanSurah: { surahNomor: 69, ayatNomor: 21, label: 'QS. Al-Haqqah [69]: 21' }
  },
  {
    id: 'iqlab',
    pelajaranKe: 3,
    halamanBuku: 'Hal. 7',
    urutanBuku: 'Pelajaran ke-3 · Hukum Nun Sukun/Tanwin ke-3 (dari 5)',
    rumusArab: 'نْ / (ً ٍ ٌ) ← ب',
    nama: '3. Iqlab',
    kategori: 'Pelajaran 3: Nun Sukun / Tanwin (5)',
    warna: 'tajwid-iqlab',
    hexColor: '#4f46e5',
    kadarHarakat: 'Suara Nun/Tanwin berganti Mim berdengung',
    aktifDiMushaf: true,
    deskripsi:
      'Yang dinamakan Iqlab ialah Nun Sukun/Tanwin bertemu Ba (ب).',
    caraBaca:
      'Suara Nun Sukun atau Tanwin diganti/dibalik menjadi bunyi Mim (م) yang disertai dengung sebelum mengucapkan huruf Ba.',
    catatanPenting:
      'JANGAN LUPA (Hal. 7): Di waktu sedang membaca Al-Qur\'an, jika ada pelajaran tajwid supaya selalu ditanyakan nama tajwidnya. Selesai belajar Al-Qur\'an ditambah soal jawab Ilmu Tajwid.',
    huruf: ['ب'],
    contohArab: 'مَنْ بَخِلَ · يُنْبِتُ · جَزَآءً بِمَا · مِنْ بَاقِيَةٍ · أَنْبَتَكُمْ · عَوَانٌ بَيْنَ',
    contohLatin: 'Mam-bakhila · Yumbitu · Jazā’am-bimā · Mim-bāqiyah · Ambatakum · ‘Awānum-baina',
    penjelasanContoh:
      'Enam contoh lengkap dari halaman 7 buku baik dalam satu kata (يُنْبِتُ, أَنْبَتَكُمْ) maupun dua kata (مَنْ بَخِلَ, جَزَآءً بِمَا, مِنْ بَاقِيَةٍ, عَوَانٌ بَيْنَ).',
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Iqlab?',
        jawab: 'Yang dinamakan Iqlab ialah Nun Sukun/Tanwin bertemu Ba.'
      }
    ],
    rujukanSurah: { surahNomor: 92, ayatNomor: 8, label: 'QS. Al-Lail [92]: 8' }
  },
  {
    id: 'izhar-halqi',
    pelajaranKe: 3,
    halamanBuku: 'Hal. 8–11',
    urutanBuku: 'Pelajaran ke-3 · Hukum Nun Sukun/Tanwin ke-4 (dari 5)',
    rumusArab: 'نْ / (ً ٍ ٌ) ← ء = ا ح خ ع غ هـ',
    nama: '4. Idzhar',
    kategori: 'Pelajaran 3: Nun Sukun / Tanwin (5)',
    warna: 'tajwid-izhar',
    hexColor: '#475569',
    kadarHarakat: 'Dibaca jelas tanpa dengung',
    aktifDiMushaf: true,
    deskripsi:
      'Yang dinamakan Idzhar ialah Nun Sukun/Tanwin bertemu Hamzah (Alif), Cha, Kha, \'Ain, Ghain, Ha (ء = ا ، ح ، خ ، ع ، غ ، هـ).',
    caraBaca:
      'Suara Nun Sukun atau Tanwin dibaca jelas dan terang tanpa mendengung.',
    huruf: ['ء = ا', 'ح', 'خ', 'ع', 'غ', 'هـ'],
    contohArab: 'مَنْ أُوتِيَ · مِنْ حَيْثُ · مَنْ خَفَّتْ · مِنْ عِنْدِ اللَّهِ · مِنْ غِسْلِينٍ · كُلُّ شَيْءٍ هَالِكٌ',
    contohLatin: 'Man ūtiya · Min ḥaitsu · Man khaffat · Min ‘indillāhi · Min ghislīn · Kullu syai’in hālik',
    penjelasanContoh:
      'Seluruh 24 contoh dari halaman 8–11 buku untuk keenam huruf Idzhar: Hamzah (Alif), Cha, Kha, \'Ain, Ghain, dan Ha.',
    rincianContoh: [
      {
        judul: 'Contoh bertemu Hamzah (ء = ا) — Hal. 8',
        rumusArab: 'نْ / (ً ٍ ٌ) ← ء = ا',
        contohArab: 'مَنْ أُوتِيَ · عَادٍ أَخَاهُمْ · كُفُوًا أَحَدٌ · عَذَابٌ أَلِيمٌ',
        contohLatin: 'Man ūtiya · ‘Ādin akhāhum · Kufuwan aḥad · ‘Ażābun alīm'
      },
      {
        judul: 'Contoh bertemu Cha (ح) — Hal. 9',
        rumusArab: 'نْ / (ً ٍ ٌ) ← ح',
        contohArab: 'مِنْ حَيْثُ · مُلَاقٍ حِسَابِيَهْ · لِمَنْ حَوْلَهُ · عَطَآءً حِسَابًا',
        contohLatin: 'Min ḥaitsu · Mulāqin ḥisābiyah · Liman ḥaulahū · ‘Aṭā’an ḥisābā'
      },
      {
        judul: 'Contoh bertemu Kha (خ) — Hal. 9',
        rumusArab: 'نْ / (ً ٍ ٌ) ← خ',
        contohArab: 'مَنْ خَفَّتْ · كَاذِبَةٍ خَاطِئَةٍ · نِدَآءً خَفِيًّا · إِذًا كَرَّةٌ خَاسِرَةٌ',
        contohLatin: 'Man khaffat · Kāżibatin khāṭi’ah · Nidā’an khafiyyā · Iżan karratun khāsirah'
      },
      {
        judul: "Contoh bertemu 'Ain (ع) — Hal. 10",
        rumusArab: 'نْ / (ً ٍ ٌ) ← ع',
        contohArab: 'مِنْ عِنْدِ اللَّهِ · طَبَقًا عَنْ طَبَقٍ · خُلُقٍ عَظِيمٍ · سَمِيعٌ عَلِيمٌ',
        contohLatin: 'Min ‘indillāhi · Ṭabaqan ‘an ṭabaq · Khuluqin ‘aẓīm · Samī‘un ‘alīm'
      },
      {
        judul: 'Contoh bertemu Ghain (غ) — Hal. 10',
        rumusArab: 'نْ / (ً ٍ ٌ) ← غ',
        contohArab: 'مِنْ غِسْلِينٍ · عَذَابٌ غَلِيظٌ · قَوْمًا غَيْرَكُمْ · إِنْ يَكُنْ غَنِيًّا',
        contohLatin: 'Min ghislīn · ‘Ażābun ghalīẓ · Qauman ghairakum · Iy-yakun ghaniyyā'
      },
      {
        judul: 'Contoh bertemu Ha (هـ) — Hal. 11',
        rumusArab: 'نْ / (ً ٍ ٌ) ← هـ',
        contohArab: 'مِنْهَا الْبُطُونُ · كُلُّ شَيْءٍ هَالِكٌ · لَكُمُ الْأَنْهَارَ · قَالُوٓا أَوَلَمْ نَنْهَكَ',
        contohLatin: 'Minhal-buṭūn · Kullu syai’in hālik · Lakumul-anhāra · Qālū awalam nanhaka'
      }
    ],
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Idzhar?',
        jawab: 'Yang dinamakan Idzhar ialah Nun Sukun/Tanwin bertemu Hamzah (Alif), Cha, Kha, \'Ain, Ghain, Ha.'
      }
    ],
    rujukanSurah: { surahNomor: 112, ayatNomor: 4, label: 'QS. Al-Ikhlas [112]: 4' }
  },
  {
    id: 'ikhfa',
    pelajaranKe: 3,
    halamanBuku: 'Hal. 11–12',
    urutanBuku: 'Pelajaran ke-3 · Hukum Nun Sukun/Tanwin ke-5 (dari 5)',
    rumusArab: 'نْ / (ً ٍ ٌ) ← ت ث ج · د ذ ز · س ش · ص ض · ط ظ · ف ق ك',
    nama: "5. Ikhfa'",
    kategori: 'Pelajaran 3: Nun Sukun / Tanwin (5)',
    warna: 'tajwid-ikhfa',
    hexColor: '#d97706',
    kadarHarakat: 'Dibaca samar disertai dengung',
    aktifDiMushaf: true,
    deskripsi:
      'Yang dinamakan Ikhfa\' ialah Nun Sukun/Tanwin bertemu huruf 15 (Ta, Tsa, Jim, Dal, Dzal, Za, Sin, Syin, Shad, Dhat, Tha, Zha, Fa, Qaf, Kaf).',
    caraBaca:
      'Suara Nun Sukun atau Tanwin dibaca samar disertai dengung menuju makhraj ke-15 huruf Ikhfa\'.',
    tingkatan:
      'Kelompok Hafalan Buku: (Ta, Tsa, Jim) · (Dal, Dzal, Za) · (Sin, Syin) · (Shad, Dhat) · (Tha, Zha) · (Fa, Qaf, Kaf)',
    catatanPenting:
      'Tips Hafalan Buku (Hal. 11): Untuk memudahkan murid supaya hafal tanpa menghafal dalam menyebutkan huruf Ikhfa\', ucapkanlah secara kelompok huruf: (Ta, Tsa, Jim) (Dal, Dzal, Za) (Sin, Syin) (Shad, Dhat) (Tha, Zha) (Fa, Qaf, Kaf).',
    huruf: ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'],
    contohArab: 'مِنْ تَحْتِهَا · مَآءً ثَجَّاجًا · أَنْجَيْنَاكُمْ · قِنْوَانٌ دَانِيَةٌ · مَنْ ذَا الَّذِي',
    contohLatin: 'Min taḥtihā · Mā’an tsajjājā · Anjainākum · Qinwānun dāniyah · Man żal-lażī',
    penjelasanContoh:
      'Seluruh 15 contoh per huruf sesuai urutan di halaman 12 buku disajikan lengkap dalam 6 kelompok hafalan Qira\'ati.',
    rincianContoh: [
      {
        judul: 'Kelompok 1: Ta, Tsa, Jim (ت ث ج) — Hal. 12',
        rumusArab: 'ت · ث · ج',
        contohArab: 'مِنْ تَحْتِهَا · مَآءً ثَجَّاجًا · أَنْجَيْنَاكُمْ',
        contohLatin: 'Min taḥtihā (ت) · Mā’an tsajjājā (ث) · Anjainākum (ج)'
      },
      {
        judul: 'Kelompok 2: Dal, Dzal, Za (د ذ ز) — Hal. 12',
        rumusArab: 'د · ذ · ز',
        contohArab: 'قِنْوَانٌ دَانِيَةٌ · مَنْ ذَا الَّذِي · يَوْمَئِذٍ زُرْقًا',
        contohLatin: 'Qinwānun dāniyah (د) · Man żal-lażī (ذ) · Yauma’iżin zurqā (ز)'
      },
      {
        judul: 'Kelompok 3: Sin, Syin (س ش) — Hal. 12',
        rumusArab: 'س · ش',
        contohArab: 'إِنَّ الْإِنْسَانَ · عَذَابٌ شَدِيدٌ',
        contohLatin: 'Innal-insāna (س) · ‘Ażābun syadīd (ش)'
      },
      {
        judul: 'Kelompok 4: Shad, Dhat (ص ض) — Hal. 12',
        rumusArab: 'ص · ض',
        contohArab: 'قَوْمًا صَالِحِينَ · مُسْفِرَةٌ ضَاحِكَةٌ',
        contohLatin: 'Qauman ṣāliḥīn (ص) · Musfiratun ḍāḥikah (ض)'
      },
      {
        judul: 'Kelompok 5: Tha, Zha (ط ظ) — Hal. 12',
        rumusArab: 'ط · ظ',
        contohArab: 'وَمَا يَنْطِقُ · عَنْ ظُهُورِهِمْ',
        contohLatin: 'Wa mā yanṭiqu (ط) · ‘An ẓuhūrihim (ظ)'
      },
      {
        judul: 'Kelompok 6: Fa, Qaf, Kaf (ف ق ك) — Hal. 12',
        rumusArab: 'ف · ق · ك',
        contohArab: 'عُمْيٌ فَهُمْ · رِزْقًا قَالُوا · مَنْ كَانَ يَرْجُو',
        contohLatin: '‘Umyun fahum (ف) · Rizqan qālū (ق) · Man kāna yarjū (ك)'
      }
    ],
    soalJawabBuku: [
      {
        soal: "Apa yang dinamakan Ikhfa'?",
        jawab: "Yang dinamakan Ikhfa' ialah Nun Sukun/Tanwin bertemu huruf 15: (Ta, Tsa, Jim) (Dal, Dzal, Za) (Sin, Syin) (Shad, Dhat) (Tha, Zha) (Fa, Qaf, Kaf)."
      },
      {
        soal: 'Nun Sukun/Tanwin hukumnya dibagi berapa? Sebutkanlah!',
        jawab: 'Dibagi lima (5): 1. Idgham Bighunnah, 2. Idgham Bilaghunnah, 3. Iqlab, 4. Idzhar, 5. Ikhfa\'.'
      }
    ],
    rujukanSurah: { surahNomor: 78, ayatNomor: 14, label: 'QS. An-Naba\' [78]: 14' }
  },

  // =========================================================================
  // PELAJARAN KE-4: HUKUM MIM SUKUN — DIBAGI TIGA (HAL. 13–15)
  // =========================================================================
  {
    id: 'idgham-mimi',
    pelajaranKe: 4,
    halamanBuku: 'Hal. 13',
    urutanBuku: 'Pelajaran ke-4 · Hukum Mim Sukun ke-1 (dari 3)',
    rumusArab: 'مْ ← م',
    nama: '1. Idgham Mitsli',
    kategori: 'Pelajaran 4: Mim Sukun (3)',
    warna: 'tajwid-idgham-mimi',
    hexColor: '#0d9488',
    kadarHarakat: 'Lebur disertai dengung',
    aktifDiMushaf: true,
    deskripsi:
      'Hukum Mim Sukun dibagi tiga. Pertama: Yang dinamakan Idgham Mitsli ialah Mim Sukun bertemu Mim (مْ ← م).',
    caraBaca:
      'Mim Sukun dilebur masuk ke huruf Mim berikutnya disertai dengung.',
    huruf: ['م'],
    contohArab: 'لَهُمْ مَا يَتَّقُونَ · هُمْ مَآ أَنْفَقُوا · لَكُمْ مَا سَأَلْتُمْ · كُنْتُمْ مُسْلِمِينَ',
    contohLatin: 'Lahum-mā yattaqūn · Hum-mā anfaqū · Lakum-mā sa’altum · Kuntum-muslimīn',
    penjelasanContoh:
      'Empat contoh langsung dari halaman 13 buku untuk pertemuan Mim Sukun dengan huruf Mim.',
    soalJawabBuku: [
      {
        soal: 'Hukum Mim Sukun dibagi berapa? Sebutkanlah!',
        jawab: 'Hukum Mim Sukun dibagi tiga: 1. Idgham Mitsli, 2. Ikhfa\' Syafawi, 3. Idzhar Syafawi.'
      },
      {
        soal: 'Apa yang dinamakan Idgham Mitsli?',
        jawab: 'Yang dinamakan Idgham Mitsli ialah Mim Sukun bertemu Mim.'
      }
    ],
    rujukanSurah: { surahNomor: 39, ayatNomor: 34, label: 'QS. Az-Zumar [39]: 34' }
  },
  {
    id: 'ikhfa-syafawi',
    pelajaranKe: 4,
    halamanBuku: 'Hal. 14',
    urutanBuku: 'Pelajaran ke-4 · Hukum Mim Sukun ke-2 (dari 3)',
    rumusArab: 'مْ ← ب',
    nama: "2. Ikhfa' Syafawi",
    kategori: 'Pelajaran 4: Mim Sukun (3)',
    warna: 'tajwid-ikhfa-syafawi',
    hexColor: '#db2777',
    kadarHarakat: 'Samar di bibir disertai dengung',
    aktifDiMushaf: true,
    deskripsi:
      "Yang dinamakan Ikhfa' Syafawi ialah Mim Sukun bertemu Ba (مْ ← ب).",
    caraBaca:
      'Mim Sukun dibaca samar pada bibir disertai dengung ketika bertemu huruf Ba.',
    huruf: ['ب'],
    contohArab: 'إِنَّهُمْ بِذَٰلِكَ · تَرْمِيهِمْ بِحِجَارَةٍ · ذَٰلِكُمْ بَلَآءٌ · وَمَا هُمْ بِخَارِجِينَ',
    contohLatin: 'Innahum-biżālika · Tarmīhim-biḥijārah · Żālikum-balā’ · Wa mā hum-bikhārijīn',
    penjelasanContoh:
      'Empat contoh langsung dari halaman 14 buku: Mim Sukun bertemu Ba pada إِنَّهُمْ بِذَٰلِكَ, تَرْمِيهِمْ بِحِجَارَةٍ, ذَٰلِكُمْ بَلَآءٌ, dan وَمَا هُمْ بِخَارِجِينَ.',
    soalJawabBuku: [
      {
        soal: "Apa yang dinamakan Ikhfa' Syafawi?",
        jawab: "Yang dinamakan Ikhfa' Syafawi ialah Mim Sukun bertemu Ba."
      }
    ],
    rujukanSurah: { surahNomor: 105, ayatNomor: 4, label: 'QS. Al-Fil [105]: 4' }
  },
  {
    id: 'izhar-syafawi',
    pelajaranKe: 4,
    halamanBuku: 'Hal. 14',
    urutanBuku: 'Pelajaran ke-4 · Hukum Mim Sukun ke-3 (dari 3)',
    rumusArab: 'مْ ← ..... (selain م dan ب)',
    nama: '3. Idzhar Syafawi',
    kategori: 'Pelajaran 4: Mim Sukun (3)',
    warna: 'tajwid-izhar',
    hexColor: '#475569',
    kadarHarakat: 'Dibaca jelas tanpa dengung',
    aktifDiMushaf: false,
    deskripsi:
      'Yang dinamakan Idzhar Syafawi ialah Mim Sukun bertemu huruf selain Mim dan Ba.',
    caraBaca:
      'Bunyi Mim Sukun diucapkan dengan jelas pada katupan bibir tanpa dengung tambahan.',
    huruf: ['Selain م dan ب'],
    contohArab: 'هُمْ نَآئِمُونَ · قُلْ نَعَمْ وَأَنْتُمْ · أَنْتُمْ دَاخِرُونَ · أَمْ لَمْ تُنْذِرْهُمْ',
    contohLatin: 'Hum nā’imūn · Qul na‘am wa antum · Antum dākhirūn · Am lam tunżirhum',
    penjelasanContoh:
      'Empat contoh langsung dari halaman 14 buku: Mim Sukun bertemu Nun, Wawu, Dal, Lam, dan Ta dibaca jelas.',
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Idzhar Syafawi?',
        jawab: 'Yang dinamakan Idzhar Syafawi ialah Mim Sukun bertemu huruf selain Mim dan Ba.'
      }
    ],
    rujukanSurah: { surahNomor: 37, ayatNomor: 18, label: 'QS. Ash-Shaffat [37]: 18' }
  },

  // =========================================================================
  // PELAJARAN KE-5, KE-6, KE-7: IDGHAM TIGA SERANGKAI (HAL. 15–18 & HAL. 35)
  // =========================================================================
  {
    id: 'idgham-mutamatsilain',
    pelajaranKe: 5,
    halamanBuku: 'Hal. 15 & Hal. 35',
    urutanBuku: 'Pelajaran ke-5',
    rumusArab: 'بْ←ب · فْ←ف · دْ←د · تْ←ت',
    nama: 'Idgham Mutamatsilain',
    kategori: 'Pelajaran 5–7: Tiga Idgham',
    warna: 'tajwid-idgham-bilaghunnah',
    hexColor: '#0284c7',
    kadarHarakat: 'Lebur ke huruf kedua yang sama',
    aktifDiMushaf: true,
    deskripsi:
      'Yang dinamakan Idgham Mutamatsilain ialah setiap huruf yang sama yang pertama Sukun.',
    caraBaca:
      'Huruf pertama yang sukun dimasukkan/dilebur langsung ke huruf kedua yang sama sehingga dibaca bertasydid.',
    catatanPenting:
      'Pengecualian Penting Halaman 35 Buku: "Setiap huruf yang sama yang pertama Sukun, namanya Idgham Mutamatsilain. KECUALI huruf Wawu Sukun bertemu Wawu (اِصْبِرُوا وَصَابِرُوا) dan Ya Sukun bertemu Ya (فِي يَوْمٍ), namanya Mad Thabi\'i!"',
    huruf: ['بْ-ب', 'فْ-ف', 'دْ-د', 'تْ-ت'],
    contohArab: 'اِضْرِبْ بِعَصَاكَ · يُسْرِفْ فِي الْقَتْلِ · وَقَدْ دَخَلُوا · رَبِحَتْ تِجَارَتُهُمْ',
    contohLatin: 'Iḍrib-bi‘aṣāka · Yusrif-fil-qatli · Wa qad-dakhalū · Rabiḥat-tijāratuhum',
    penjelasanContoh:
      'Empat contoh langsung dari halaman 15 buku (Ba bertemu Ba, Fa bertemu Fa, Dal bertemu Dal, Ta bertemu Ta), ditambah pengecualian halaman 35.',
    rincianContoh: [
      {
        judul: 'Contoh Idgham Mutamatsilain — Hal. 15',
        contohArab: 'اِضْرِبْ بِعَصَاكَ · يُسْرِفْ فِي الْقَتْلِ · وَقَدْ دَخَلُوا · رَبِحَتْ تِجَارَتُهُمْ',
        contohLatin: 'Iḍrib-bi‘aṣāka · Yusrif-fil-qatli · Wa qad-dakhalū · Rabiḥat-tijāratuhum'
      },
      {
        judul: 'Pengecualian (Tetap Mad Thabi\'i, BUKAN Idgham Mutamatsilain) — Hal. 35',
        rumusArab: 'يْ ← ي  ❖  وْ ← و',
        contohArab: 'فِي يَوْمٍ · اِصْبِرُوا وَصَابِرُوا',
        contohLatin: 'Fī yaumin · Iṣbirū wa ṣābirū (tetap dibaca panjang Mad Thabi\'i)'
      }
    ],
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Idgham Mutamatsilain?',
        jawab: 'Yang dinamakan Idgham Mutamatsilain ialah setiap huruf yang sama yang pertama Sukun.'
      },
      {
        soal: 'Apakah setiap huruf yang sama yang pertama Sukun namanya Idgham Mutamatsilain? (Hal. 35)',
        jawab: 'Tidak. Jika huruf Wawu Sukun bertemu Wawu dan huruf Ya Sukun bertemu Ya, namanya Mad Thabi\'i.'
      }
    ],
    rujukanSurah: { surahNomor: 2, ayatNomor: 60, label: 'QS. Al-Baqarah [2]: 60' }
  },
  {
    id: 'idgham-mutajanisain',
    pelajaranKe: 6,
    halamanBuku: 'Hal. 16–17',
    urutanBuku: 'Pelajaran ke-6',
    rumusArab: 'ت ط – ط ت · ت د – د ت · ل ر – ذ ظ',
    nama: 'Idgham Mutajanisain',
    kategori: 'Pelajaran 5–7: Tiga Idgham',
    warna: 'tajwid-idgham-bilaghunnah',
    hexColor: '#0284c7',
    kadarHarakat: 'Lebur ke huruf kedua (6 pasang huruf)',
    aktifDiMushaf: true,
    deskripsi:
      'Yang dinamakan Idgham Mutajanisain ialah: Ta sukun bertemu Tha, Tha sukun bertemu Ta, Ta sukun bertemu Dal, Dal sukun bertemu Ta, Lam sukun bertemu Ra, dan Dzal sukun bertemu Zha.',
    caraBaca:
      'Huruf pertama yang sukun dilebur ke dalam huruf pasangannya. Untuk memudahkan hafal tanpa menghafal, sebutkan pasangannya: ت ط – ط ت · ت د – د ت · ل ر – ذ ظ.',
    catatanPenting:
      'Tips Hafalan Buku (Hal. 17): Untuk memudahkan murid untuk hafal tanpa menghafal, dalam pelajaran Idgham Mutajanisain sebutkanlah huruf-hurufnya saja: (ت ط - ط ت) · (ت د - د ت) · (ل ر - ذ ظ).',
    huruf: ['ت-ط', 'ط-ت', 'ت-د', 'د-ت', 'ل-ر', 'ذ-ظ'],
    contohArab: 'قَالَتْ طَآئِفَةٌ · لَئِنْ بَسَطْتَ · أَثْقَلَتْ دَعَوَا · قَدْ تَبَيَّنَ · قُلْ رَبِّ · إِذْ ظَلَمُوا',
    contohLatin: 'Qālat-ṭā’ifah · La’im-basaṭ-ta · Atsqalad-da‘awā · Qat-tabayyana · Qur-rabbi · Iẓ-ẓalamū',
    penjelasanContoh:
      'Enam contoh pasangan lengkap sesuai halaman 16 buku untuk seluruh pasangan huruf Idgham Mutajanisain.',
    rincianContoh: [
      {
        judul: 'Pasangan 1 & 2: تْ ← ط dan طْ ← ت (Hal. 16)',
        rumusArab: 'تْ ← ط  ❖  طْ ← ت',
        contohArab: 'قَالَتْ طَآئِفَةٌ · لَئِنْ بَسَطْتَ',
        contohLatin: 'Qālat-ṭā’ifatun · La’im-basaṭ-ta'
      },
      {
        judul: 'Pasangan 3 & 4: تْ ← د dan دْ ← ت (Hal. 16)',
        rumusArab: 'تْ ← د  ❖  دْ ← ت',
        contohArab: 'أَثْقَلَتْ دَعَوَا · قَدْ تَبَيَّنَ',
        contohLatin: 'Atsqalad-da‘awā · Qat-tabayyana'
      },
      {
        judul: 'Pasangan 5 & 6: لْ ← ر dan ذْ ← ظ (Hal. 16)',
        rumusArab: 'لْ ← ر  ❖  ذْ ← ظ',
        contohArab: 'قُلْ رَبِّ · إِذْ ظَلَمُوا',
        contohLatin: 'Qur-rabbi · Iẓ-ẓalamū'
      }
    ],
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Idgham Mutajanisain? Sebutkanlah huruf-hurufnya!',
        jawab: 'Ta sukun bertemu Tha, Tha sukun bertemu Ta, Ta sukun bertemu Dal, Dal sukun bertemu Ta, Lam sukun bertemu Ra, dan Dzal sukun bertemu Zha (ت ط - ط ت ، ت د - د ت ، ل ر - ذ ظ).'
      }
    ],
    rujukanSurah: { surahNomor: 2, ayatNomor: 256, label: 'QS. Al-Baqarah [2]: 256' }
  },
  {
    id: 'idgham-mutaqaribain',
    pelajaranKe: 7,
    halamanBuku: 'Hal. 17–18',
    urutanBuku: 'Pelajaran ke-7',
    rumusArab: 'ث ذ – ق ك – ب م',
    nama: 'Idgham Mutaqarribain',
    kategori: 'Pelajaran 5–7: Tiga Idgham',
    warna: 'tajwid-idgham-bilaghunnah',
    hexColor: '#0284c7',
    kadarHarakat: 'Lebur ke huruf kedua (3 pasang huruf)',
    aktifDiMushaf: true,
    deskripsi:
      'Yang dinamakan Idgham Mutaqarribain ialah: Tsa sukun bertemu Dzal, Qaf sukun bertemu Kaf, Ba sukun bertemu Mim.',
    caraBaca:
      'Meleburkan Tsa sukun ke Dzal, Qaf sukun ke Kaf, dan Ba sukun ke Mim (disertai dengung pada Mim).',
    catatanPenting:
      'Tips Hafalan Buku (Hal. 18): Untuk memudahkan hafal tanpa menghafal maka sebutkanlah huruf-hurufnya saja: ث ذ – ق ك – ب م.',
    huruf: ['ث-ذ', 'ق-ك', 'ب-م'],
    contohArab: 'يَلْهَثْ ذَٰلِكَ · أَلَمْ نَخْلُقْكُمْ · يَابُنَيَّ ارْكَبْ مَعَنَا',
    contohLatin: 'Yalhaż-żālika · Alam nakhluk-kum · Yā bunayyarkam-ma‘anā',
    penjelasanContoh:
      'Tiga contoh lengkap sesuai halaman 18 buku: ثْ ← ذ pada يَلْهَثْ ذَٰلِكَ, قْ ← ك pada أَلَمْ نَخْلُقْكُمْ, dan بْ ← م pada يَابُنَيَّ ارْكَبْ مَعَنَا.',
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Idgham Mutaqarribain? Sebutkanlah huruf-hurufnya!',
        jawab: 'Tsa sukun bertemu Dzal, Qaf sukun bertemu Kaf, Ba sukun bertemu Mim (ث ذ – ق ك – ب م).'
      }
    ],
    rujukanSurah: { surahNomor: 11, ayatNomor: 42, label: 'QS. Hud [11]: 42' }
  },

  // =========================================================================
  // PELAJARAN KE-8: QALQALAH — DIBAGI DUA (HAL. 19–20)
  // =========================================================================
  {
    id: 'qalqalah',
    pelajaranKe: 8,
    halamanBuku: 'Hal. 19–20',
    urutanBuku: 'Pelajaran ke-8 · Bagian 1 (dari 2)',
    rumusArab: 'ق · ط · ب · ج · د (Sukun Asli)',
    nama: '1. Qalqalah Shughra',
    kategori: 'Pelajaran 8–9: Qalqalah & Lafadh Allah',
    warna: 'tajwid-qalqalah',
    hexColor: '#dc2626',
    kadarHarakat: 'Pantulan huruf Qalqalah yang matinya asli',
    aktifDiMushaf: true,
    deskripsi:
      'Huruf Qalqalah ada lima: Qaf, Tha, Ba, Jim, Dal (ق ط ب ج د) jika dibaca sukun. Qalqalah dibagi dua: Qalqalah Shughra dan Qalqalah Kubra. Qalqalah Shughra ialah huruf Qalqalah yang matinya asli.',
    caraBaca:
      'Dipantulkan dengan jelas saat huruf ق ط ب ج د bertanda sukun asli di tengah bacaan.',
    huruf: ['ق', 'ط', 'ب', 'ج', 'د'],
    contohArab: 'يَقْرَأُ · يَطْهُرُ · يَبْخَلُ · يَجْعَلُ · يَدْخُلُ',
    contohLatin: 'Yaqra’u · Yaṭhuru · Yabkhalu · Yaj‘alu · Yadkhulu',
    penjelasanContoh:
      'Lima contoh langsung dari halaman 19 buku mewakili kelima huruf Qalqalah: ق (يَقْرَأُ), ط (يَطْهُرُ), ب (يَبْخَلُ), ج (يَجْعَلُ), dan د (يَدْخُلُ).',
    soalJawabBuku: [
      {
        soal: 'Ada berapa huruf Qalqalah? Sebutkanlah!',
        jawab: 'Huruf Qalqalah ada lima: Qaf, Tha, Ba, Jim, Dal (ق ط ب ج د) jika dibaca sukun.'
      },
      {
        soal: 'Bacaan Qalqalah dibagi berapa? Apa perbedaan Qalqalah Shughra dan Qalqalah Kubra?',
        jawab: 'Dibagi dua: 1. Qalqalah Shughra (huruf Qalqalah yang matinya asli), 2. Qalqalah Kubra (huruf Qalqalah yang matinya mendatang, disebabkan dibaca waqaf).'
      }
    ],
    rujukanSurah: { surahNomor: 105, ayatNomor: 2, label: 'QS. Al-Fil [105]: 2' }
  },
  {
    id: 'qalqalah-kubra',
    pelajaranKe: 8,
    halamanBuku: 'Hal. 19–20',
    urutanBuku: 'Pelajaran ke-8 · Bagian 2 (dari 2)',
    rumusArab: 'ق · ط · ب · ج · د (Sukun karena Waqaf)',
    nama: '2. Qalqalah Kubra',
    kategori: 'Pelajaran 8–9: Qalqalah & Lafadh Allah',
    warna: 'tajwid-qalqalah',
    hexColor: '#dc2626',
    kadarHarakat: 'Pantulan huruf Qalqalah yang matinya karena waqaf',
    aktifDiMushaf: true,
    deskripsi:
      'Qalqalah Kubra ialah huruf Qalqalah (ق ط ب ج د) yang matinya mendatang, disebabkan dibaca waqaf (berhenti).',
    caraBaca:
      'Ketika berhenti (waqaf) pada huruf Qalqalah di akhir kata, huruf tersebut disukunkan dan dipantulkan dengan tegas.',
    huruf: ['ق', 'ط', 'ب', 'ج', 'د'],
    contohArab: 'أَحَدٌ ← أَحَدْ ۝ · خَلَقَ ← خَلَقْ ۝',
    contohLatin: 'Aḥadun → Aḥad · Khalaqa → Khalaq',
    penjelasanContoh:
      'Dua contoh langsung dari halaman 19 buku: أَحَدٌ saat waqaf dibaca أَحَدْ, dan خَلَقَ saat waqaf dibaca خَلَقْ.',
    rujukanSurah: { surahNomor: 112, ayatNomor: 1, label: 'QS. Al-Ikhlas [112]: 1' }
  },

  // =========================================================================
  // PELAJARAN KE-9: LAFADH ALLAH — DIBAGI DUA (HAL. 20)
  // =========================================================================
  {
    id: 'lam-jalalah-tafkhim',
    pelajaranKe: 9,
    halamanBuku: 'Hal. 20',
    urutanBuku: 'Pelajaran ke-9 · Bagian 1 (dari 2)',
    rumusArab: 'ـَ اللَّه  ❖  ـُ اللَّه',
    nama: '1. Lafadh Allah Tafkhim',
    kategori: 'Pelajaran 8–9: Qalqalah & Lafadh Allah',
    warna: 'tajwid-lafadz-allah',
    hexColor: '#b45309',
    kadarHarakat: 'Dibaca Tafkhim (tebal)',
    aktifDiMushaf: true,
    deskripsi:
      'Hukum lafadh Allah dibagi dua: Tafkhim dan Tarqiq. Pertama: Dibaca Tafkhim, jika lafadh Allah didahului harakat fathah atau dhummah.',
    caraBaca:
      'Bunyi Lam pada lafadh Allah diucapkan tebal dan penuh karena huruf sebelumnya berharakat fathah (ـَ) atau dhummah (ـُ).',
    huruf: ['ـَ اللَّه', 'ـُ اللَّه'],
    contohArab: 'وَاللَّهُ · نَصْرُ اللَّهِ',
    contohLatin: 'Wallāhu · Naṣrullāhi',
    penjelasanContoh:
      'Dua contoh langsung dari halaman 20 buku: وَاللَّهُ (didahului fathah) dan نَصْرُ اللَّهِ (didahului dhummah).',
    soalJawabBuku: [
      {
        soal: 'Hukum lafadh Allah dibagi berapa? Jelaskan!',
        jawab: 'Dibagi dua: Tafkhim (jika lafadh Allah didahului harakat fathah atau dhummah) dan Tarqiq (jika lafadh Allah didahului harakat kasroh).'
      }
    ],
    rujukanSurah: { surahNomor: 110, ayatNomor: 1, label: 'QS. An-Nasr [110]: 1' }
  },
  {
    id: 'lam-jalalah-tarqiq',
    pelajaranKe: 9,
    halamanBuku: 'Hal. 20',
    urutanBuku: 'Pelajaran ke-9 · Bagian 2 (dari 2)',
    rumusArab: 'ـِ اللَّه',
    nama: '2. Lafadh Allah Tarqiq',
    kategori: 'Pelajaran 8–9: Qalqalah & Lafadh Allah',
    warna: 'tajwid-lafadz-allah',
    hexColor: '#b45309',
    kadarHarakat: 'Dibaca Tarqiq (tipis)',
    aktifDiMushaf: true,
    deskripsi:
      'Kedua: Dibaca Tarqiq, jika lafadh Allah didahului harakat kasroh.',
    caraBaca:
      'Bunyi Lam pada lafadh Allah diucapkan tipis dan ringan karena huruf sebelumnya berharakat kasroh (ـِ).',
    huruf: ['ـِ اللَّه'],
    contohArab: 'بِاللَّهِ · بِسْمِ اللَّهِ',
    contohLatin: 'Billāhi · Bismillāhi',
    penjelasanContoh:
      'Dua contoh langsung dari halaman 20 buku: بِاللَّهِ dan بِسْمِ اللَّهِ sama-sama didahului harakat kasroh sehingga dibaca Tarqiq.',
    rujukanSurah: { surahNomor: 1, ayatNomor: 1, label: 'QS. Al-Fatihah [1]: 1' }
  },

  // =========================================================================
  // PELAJARAN KE-10: HURUF SYAMSIYAH DAN QAMARIYAH (HAL. 22)
  // =========================================================================
  {
    id: 'al-syamsiyah',
    pelajaranKe: 10,
    halamanBuku: 'Hal. 22',
    urutanBuku: 'Pelajaran ke-10 · Bagian 1 (dari 2)',
    rumusArab: '(ت ث) ❖ (د ذ ر ز س ش ص ض ط ظ) ❖ (ل ن)',
    nama: 'Al Syamsiyah (14 Huruf)',
    kategori: 'Pelajaran 10–11: Al & Idzhar Wajib',
    warna: 'tajwid-al-syamsiyah',
    hexColor: '#ea580c',
    kadarHarakat: 'Alif Lam lebur ke 14 huruf Syamsiyah',
    aktifDiMushaf: true,
    deskripsi:
      'Huruf Syamsiyah dan huruf Qamariyah jumlahnya sama, masing-masing 14 huruf. Al (ال) bertemu salah satu dari 14 huruf Syamsiyah dinamakan bacaan Al Syamsiyah.',
    caraBaca:
      'Huruf Lam pada Al (ال) tidak dibaca melainkan langsung melebur ke huruf Syamsiyah yang bertasydid di depannya.',
    tingkatan:
      'Kelompok Hafalan Buku (Hal. 22): (ت ث) ❖ (د ذ ر ز س ش ص ض ط ظ) ❖ (ل ن)',
    catatanPenting:
      'Untuk mudah hafal tanpa menghafal, sebutkanlah 14 huruf Syamsiyah secara kelompok sesuai urutan abjad di buku halaman 22.',
    huruf: ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'],
    contohArab: 'وَالتِّينِ · الدُّنْيَا · الصَّلَاةُ · وَالشَّمْسِ · الرَّحْمَٰنِ · النِّعْمَةِ · الضَّلَالِ · وَالثَّمَرَاتِ',
    contohLatin: 'Wat-tīni · Ad-dunyā · Aṣ-ṣalātu · Wasy-syamsi · Ar-raḥmāni · An-ni‘mati · Aḍ-ḍalāli · Wats-tsamarāti',
    penjelasanContoh:
      'Delapan contoh Al Syamsiyah persis dari halaman 22 buku.',
    soalJawabBuku: [
      {
        soal: 'Huruf Syamsiyah dan Qamariyah jumlahnya ada berapa? Sebutkanlah!',
        jawab: 'Masing-masing ada 14 huruf. Syamsiyah: (ت ث) (د ذ ر ز س ش ص ض ط ظ) (ل ن). Qamariyah: (ب) (ج ح خ) (ع غ ف ق ك) (م و هـ) (ء ي).'
      }
    ],
    rujukanSurah: { surahNomor: 95, ayatNomor: 1, label: 'QS. At-Tin [95]: 1' }
  },
  {
    id: 'al-qamariyah',
    pelajaranKe: 10,
    halamanBuku: 'Hal. 22',
    urutanBuku: 'Pelajaran ke-10 · Bagian 2 (dari 2)',
    rumusArab: '(ب) ❖ (ج ح خ) ❖ (ع غ ف ق ك) ❖ (م و هـ) ❖ (ء ي)',
    nama: 'Al Qamariyah (14 Huruf)',
    kategori: 'Pelajaran 10–11: Al & Idzhar Wajib',
    warna: 'tajwid-izhar',
    hexColor: '#475569',
    kadarHarakat: 'Lam sukun (الْ) dibaca jelas',
    aktifDiMushaf: false,
    deskripsi:
      'Al (ال) yang bertemu salah satu dari 14 huruf Qamariyah dinamakan bacaan Al Qamariyah.',
    caraBaca:
      'Huruf Lam sukun pada Al (الْ) dibaca terang dan jelas tanpa memantul.',
    tingkatan:
      'Kelompok Hafalan Buku (Hal. 22): (ب) ❖ (ج ح خ) ❖ (ع غ ف ق ك) ❖ (م و هـ) ❖ (ء ي)',
    huruf: ['ب', 'ج', 'ح', 'خ', 'ع', 'غ', 'ف', 'ق', 'ك', 'م', 'و', 'هـ', 'ء', 'ي'],
    contohArab: 'الْبَلَاغُ · الْحَمِيدُ · الْجُمُعَةُ · الْخَبِيرُ · الْوَاحِدُ · الْفِيلُ · الْكَبِيرُ · الْعَزِيزُ',
    contohLatin: 'Al-balāghu · Al-ḥamīdu · Al-jumu‘atu · Al-khabīru · Al-wāḥidu · Al-fīlu · Al-kabīru · Al-‘azīzu',
    penjelasanContoh:
      'Delapan contoh Al Qamariyah persis dari halaman 22 buku.',
    rujukanSurah: { surahNomor: 105, ayatNomor: 1, label: 'QS. Al-Fil [105]: 1' }
  },

  // =========================================================================
  // PELAJARAN KE-11: IDZHAR WAJIB (HAL. 23)
  // =========================================================================
  {
    id: 'idzhar-wajib',
    pelajaranKe: 11,
    halamanBuku: 'Hal. 23',
    urutanBuku: 'Pelajaran ke-11',
    rumusArab: 'نْ + ي / و (dalam satu kalimat — hanya 4 kata)',
    nama: 'Idzhar Wajib',
    kategori: 'Pelajaran 10–11: Al & Idzhar Wajib',
    warna: 'tajwid-izhar',
    hexColor: '#475569',
    kadarHarakat: 'Dibaca jelas tanpa dengung (tidak dilebur)',
    aktifDiMushaf: true,
    deskripsi:
      'Yang dinamakan Idzhar Wajib, ialah: Nun Sukun bertemu huruf Ya atau Wawu dalam satu kalimat (di Al-Qur\'an hanya ada empat).',
    caraBaca:
      'Wajib dibaca jelas suara Nun Sukunnya ("dun-yā", "bun-yānun", "ṣin-wānun", "qin-wānun") dan DILARANG dilebur menjadi Idgham Bighunnah.',
    huruf: ['الدُّنْيَا', 'بُنْيَانٌ', 'صِنْوَانٌ', 'قِنْوَانٌ'],
    contohArab: 'الدُّنْيَا · بُنْيَانٌ · صِنْوَانٌ · قِنْوَانٌ',
    contohLatin: 'Ad-dunyā · Bunyānun · Ṣinwānun · Qinwānun',
    penjelasanContoh:
      'Keempat kata satu-satunya di dalam Al-Qur\'an sesuai halaman 23 buku: الدُّنْيَا, بُنْيَانٌ, صِنْوَانٌ, dan قِنْوَانٌ.',
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Idzhar Wajib? Dan berikanlah contohnya!',
        jawab: 'Nun Sukun bertemu huruf Ya atau Wawu dalam satu kalimat (di Al-Qur\'an hanya ada empat): الدُّنْيَا ، بُنْيَانٌ ، صِنْوَانٌ ، قِنْوَانٌ.'
      }
    ],
    rujukanSurah: { surahNomor: 61, ayatNomor: 4, label: 'QS. Ash-Shaff [61]: 4' }
  },

  // =========================================================================
  // PELAJARAN KE-12: HUKUM RA — DIBAGI DUA (HAL. 24–25)
  // =========================================================================
  {
    id: 'ra-tafkhim',
    pelajaranKe: 12,
    halamanBuku: 'Hal. 24–25',
    urutanBuku: 'Pelajaran ke-12 · Bagian 1 (dari 2)',
    rumusArab: 'Huruf Isti\'la\' 7: خ ص ض ط ظ غ ق',
    nama: '1. Ra Tafkhim (Tebal)',
    kategori: 'Pelajaran 12: Hukum Ra (2)',
    warna: 'tajwid-al-syamsiyah',
    hexColor: '#ea580c',
    kadarHarakat: 'Dibaca tebal (6 sebab)',
    aktifDiMushaf: false,
    deskripsi:
      'Hukum Ra ada dua: Tafkhim dan Tarqiq. Ra dibaca Tafkhim dalam 6 keadaan: (1) Ra fathah / fathah tanwin, (2) Ra dhummah / dhummah tanwin, (3) Ra hidup didahului huruf mati selain Ya\' yang sebelumnya ada fathah/dhummah dibaca waqaf, (4) Ra Sukun didahului fathah/dhummah, (5) Ra Sukun didahului kasroh ada Hamzah washal, (6) Ra Sukun didahului kasroh bertemu huruf Isti\'la\'.',
    caraBaca:
      'Huruf Ra diucapkan tebal dengan mengangkat pangkal lidah.',
    tingkatan:
      'Huruf Isti\'la\' ada tujuh (Hal. 24): خ ص ض ط ظ غ ق',
    huruf: ['خ', 'ص', 'ض', 'ط', 'ظ', 'غ', 'ق'],
    contohArab: 'رَبَّنَا · خَيْرًا · رُوَيْدًا · كَبِيرٌ · شَهْرٍ · الْفَجْرِ · أَرْسَلَ · قُرْآنٌ · أَمِ ارْتَابُوا · ارْجِعُوا · مِرْصَادٌ · قِرْطَاسٌ',
    contohLatin: 'Rabbanā · Khairā · Ruwaidā · Kabīrun · Syahr · Al-fajr · Arsala · Qur’ānun · Amir-tābū · Irji‘ū · Mirṣādun · Qirṭāsun',
    penjelasanContoh:
      'Seluruh 12 contoh Ra Tafkhim dari halaman 24–25 buku dirinci lengkap berdasarkan keenam ketentuannya.',
    rincianContoh: [
      {
        judul: '1. Ra fathah & Ra fathah tanwin (Hal. 24)',
        rumusArab: 'رَ - رًا',
        contohArab: 'رَبَّنَا · خَيْرًا',
        contohLatin: 'Rabbanā · Khairā'
      },
      {
        judul: '2. Ra dhummah & Ra dhummah tanwin (Hal. 24)',
        rumusArab: 'رُ - رٌ',
        contohArab: 'رُوَيْدًا · كَبِيرٌ',
        contohLatin: 'Ruwaidā · Kabīrun'
      },
      {
        judul: "3. Ra hidup didahului huruf mati selain Ya' yang sebelumnya fathah/dhummah dibaca waqaf (Hal. 24)",
        rumusArab: 'ـَ ـُ ْ ر ← Waqaf',
        contohArab: 'شَهْرٍ · الْفَجْرِ',
        contohLatin: 'Syahr · Al-fajr (dibaca waqaf)'
      },
      {
        judul: '4. Ra Sukun didahului fathah atau dhummah (Hal. 24)',
        rumusArab: 'ـَ ـُ رْ',
        contohArab: 'أَرْسَلَ · قُرْآنٌ',
        contohLatin: 'Arsala · Qur’ānun'
      },
      {
        judul: '5. Ra Sukun didahului kasroh ada Hamzah washal (Hal. 25)',
        rumusArab: 'ـِ ا رْ',
        contohArab: 'أَمِ ارْتَابُوا · ارْجِعُوا',
        contohLatin: 'Amir-tābū · Irji‘ū'
      },
      {
        judul: "6. Ra Sukun didahului kasroh bertemu huruf Isti'la' (Hal. 25)",
        rumusArab: 'ـِ رْ + ص / ط',
        contohArab: 'مِرْصَادٌ · قِرْطَاسٌ',
        contohLatin: 'Mirṣādun · Qirṭāsun'
      }
    ],
    soalJawabBuku: [
      {
        soal: "Sebutkanlah huruf-huruf Isti'la'!",
        jawab: "Huruf Isti'la' ada tujuh: Kha, Shad, Dhat, Tha, Zha, Ghain, Qaf (خ ص ض ط ظ غ ق)."
      }
    ],
    rujukanSurah: { surahNomor: 78, ayatNomor: 21, label: 'QS. An-Naba\' [78]: 21' }
  },
  {
    id: 'ra-tarqiq',
    pelajaranKe: 12,
    halamanBuku: 'Hal. 25',
    urutanBuku: 'Pelajaran ke-12 · Bagian 2 (dari 2)',
    rumusArab: 'رِ - رٍ · ـِ رْ · ـَيْرْ · ـِ ْ رْ',
    nama: '2. Ra Tarqiq (Tipis)',
    kategori: 'Pelajaran 12: Hukum Ra (2)',
    warna: 'tajwid-izhar',
    hexColor: '#475569',
    kadarHarakat: 'Dibaca tipis (4 sebab)',
    aktifDiMushaf: false,
    deskripsi:
      'Ra dibaca Tarqiq (tipis) dalam 4 keadaan: (1) Ra kasroh / Ra kasroh tanwin, (2) Ra Sukun didahului kasroh, (3) Ra hidup didahului Ya Sukun dibaca waqaf, (4) Ra hidup didahului huruf mati selain Ya\' yang sebelumnya ada kasroh dibaca waqaf.',
    caraBaca:
      'Huruf Ra diucapkan tipis dan ringan.',
    huruf: ['رِ', 'رٍ', 'ـِرْ', 'ـَيْرْ'],
    contohArab: 'رِجْسٌ · خُسْرٍ · فِرْعَوْنَ · فَكَبِّرْ · خَيْرٌ ۝ · بَصِيرٌ ۝ · بِكْرٌ ۝',
    contohLatin: 'Rijsun · Khusrin · Fir‘auna · Fakabbir · Khair · Baṣīr · Bikr',
    penjelasanContoh:
      'Tujuh contoh langsung dari halaman 25 buku dirinci untuk keempat ketentuan Ra Tarqiq.',
    rincianContoh: [
      {
        judul: '1. Ra kasroh, Ra kasroh tanwin (Hal. 25)',
        rumusArab: 'رِ - رٍ',
        contohArab: 'رِجْسٌ · خُسْرٍ',
        contohLatin: 'Rijsun · Khusrin'
      },
      {
        judul: '2. Ra Sukun didahului kasroh (Hal. 25)',
        rumusArab: 'ـِ رْ',
        contohArab: 'فِرْعَوْنَ · فَكَبِّرْ',
        contohLatin: 'Fir‘auna · Fakabbir'
      },
      {
        judul: '3. Ra hidup didahului Ya Sukun dibaca waqaf (Hal. 25)',
        rumusArab: 'ـَ يْ رُ ← Waqaf',
        contohArab: 'خَيْرٌ ۝ · بَصِيرٌ ۝',
        contohLatin: 'Khair · Baṣīr (saat waqaf)'
      },
      {
        judul: "4. Ra hidup didahului huruf mati selain Ya' yang sebelumnya ada kasroh dibaca waqaf (Hal. 25)",
        rumusArab: 'ـِ ْ رُ ← Waqaf',
        contohArab: 'بِكْرٌ ۝',
        contohLatin: 'Bikr (saat waqaf)'
      }
    ],
    soalJawabBuku: [
      {
        soal: 'Hukum Ra dibagi berapa? Jelaskan dan uraikan!',
        jawab: 'Hukum Ra dibagi dua: Tafkhim (6 ketentuan) dan Tarqiq (4 ketentuan).'
      }
    ],
    rujukanSurah: { surahNomor: 74, ayatNomor: 3, label: 'QS. Al-Muddatstsir [74]: 3' }
  },

  // =========================================================================
  // PELAJARAN KE-13: HUKUM MAD — MAD THABI'I & 13 MAD FAR'I (HAL. 27–34)
  // =========================================================================
  {
    id: 'mad-thabii',
    pelajaranKe: 13,
    halamanBuku: 'Hal. 27',
    urutanBuku: "Pelajaran ke-13 · Mad Thabi'i (Mad Ashli)",
    rumusArab: 'دَا - دِيْ - دُوْ',
    nama: "Mad Thabi'i (Mad Ashli)",
    kategori: "Pelajaran 13: Hukum Mad (Thabi'i & 13 Far'i)",
    warna: 'tajwid-mad-shilah',
    hexColor: '#7c3aed',
    kadarHarakat: '1 Alif (2 harakat)',
    aktifDiMushaf: false,
    deskripsi:
      "Hukum Mad dibagi dua: Mad Thabi'i (atau Mad Ashli) dan Mad Far'i. Yang dinamakan Mad Thabi'i ialah: fathah diikuti Alif, kasroh diikuti Ya, dhummah diikuti Wawu. Dan panjang Mad Thabi'i satu alif (dua harakat).",
    caraBaca:
      'Dipanjangkan tepat 1 Alif (2 harakat).',
    huruf: ['ـَا', 'ـِيْ', 'ـُوْ'],
    contohArab: 'دَا - دِيْ - دُوْ · نُوحِيهَا',
    contohLatin: 'Dā - Dī - Dū · Nūḥīhā',
    penjelasanContoh:
      'Contoh persis dari halaman 27 buku: دَا - دِيْ - دُوْ dan kata نُوحِيهَا yang memuat ketiga huruf Mad Thabi\'i sekaligus.',
    soalJawabBuku: [
      {
        soal: 'Hukum Mad dibagi berapa? Sebutkanlah!',
        jawab: "Hukum Mad dibagi dua: Mad Thabi'i (atau Mad Ashli) dan Mad Far'i (Mad Far'i dibagi 13)."
      },
      {
        soal: "Apa yang dinamakan Mad Thabi'i, dan berapa alif panjangnya?",
        jawab: 'Fathah diikuti Alif, kasroh diikuti Ya, dhummah diikuti Wawu. Panjangnya 1 Alif (2 harakat).'
      }
    ],
    rujukanSurah: { surahNomor: 11, ayatNomor: 49, label: 'QS. Hud [11]: 49' }
  },
  {
    id: 'mad-wajib-muttasil',
    pelajaranKe: 13,
    halamanBuku: 'Hal. 27–28',
    urutanBuku: "Pelajaran ke-13 · Mad Far'i Ke-1 (dari 13)",
    rumusArab: "Mad Thabi'i + ء (satu kalimat)",
    nama: 'Ke-1: Mad Wajib Muttashil',
    kategori: "Pelajaran 13: Hukum Mad (Thabi'i & 13 Far'i)",
    warna: 'tajwid-mad',
    hexColor: '#9333ea',
    kadarHarakat: '2½ Alif (5 harakat)',
    aktifDiMushaf: true,
    deskripsi:
      "Yang dinamakan Mad Wajib Muttashil ialah: Mad Thabi'i bertemu hamzah dalam satu kalimat. Panjangnya 2½ Alif (5 harakat).",
    caraBaca:
      'Dibaca panjang 2½ Alif (5 harakat) sesuai ketetapan halaman 27 buku.',
    huruf: ['ـَآء', 'ـِيٓء', 'ـُوٓء'],
    contohArab: 'جَآءَ · لِقَآءَنَا · نِدَآءً · نِسَآءَنَا',
    contohLatin: 'Jā’a · Liqā’anā · Nidā’an · Nisā’anā',
    penjelasanContoh:
      'Empat contoh langsung dari halaman 28 buku: جَآءَ ، لِقَآءَنَا ، نِدَآءً ، نِسَآءَنَا.',
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Mad Wajib Muttashil, dan berapa Alif panjangnya?',
        jawab: "Mad Thabi'i bertemu hamzah dalam satu kalimat. Panjangnya 2½ Alif (5 harakat)."
      }
    ],
    rujukanSurah: { surahNomor: 110, ayatNomor: 1, label: 'QS. An-Nasr [110]: 1' }
  },
  {
    id: 'mad-jaiz-munfasil',
    pelajaranKe: 13,
    halamanBuku: 'Hal. 27–28',
    urutanBuku: "Pelajaran ke-13 · Mad Far'i Ke-2 (dari 13)",
    rumusArab: "Mad Thabi'i + أ / إ (lain kalimat)",
    nama: 'Ke-2: Mad Jaiz Munfashil',
    kategori: "Pelajaran 13: Hukum Mad (Thabi'i & 13 Far'i)",
    warna: 'tajwid-mad',
    hexColor: '#9333ea',
    kadarHarakat: '2½ Alif (5 harakat)',
    aktifDiMushaf: true,
    deskripsi:
      "Yang dinamakan Mad Jaiz Munfashil ialah: Mad Thabi'i bertemu hamzah di lain kalimat. Panjangnya 2½ Alif (5 harakat).",
    caraBaca:
      'Dibaca panjang 2½ Alif (5 harakat) sesuai ketetapan halaman 27 buku.',
    catatanPenting:
      'Pedoman Mengajar Buku (Hal. 28): Supaya murid mudah hafal tanpa menghafal, berikanlah pelajaran Mad Far\'i ini sedikit demi sedikit dan dipraktikkan di waktu membaca Al-Qur\'an.',
    huruf: ['ـَآ أ', 'ـُوٓا أ', 'ـِيٓ أ'],
    contohArab: 'إِنَّآ أَعْطَيْنَا · وَمَآ أُمِرُوا · إِنَّآ أَنْزَلْنَا',
    contohLatin: 'Innā a‘ṭainā · Wa mā umirū · Innā anzalnā',
    penjelasanContoh:
      'Tiga contoh langsung dari halaman 28 buku: إِنَّآ أَعْطَيْنَا ، وَمَآ أُمِرُوا ، إِنَّآ أَنْزَلْنَا.',
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Mad Jaiz Munfashil, dan berapa Alif panjangnya?',
        jawab: "Mad Thabi'i bertemu hamzah di lain kalimat. Panjangnya 2½ Alif (5 harakat)."
      }
    ],
    rujukanSurah: { surahNomor: 108, ayatNomor: 1, label: 'QS. Al-Kautsar [108]: 1' }
  },
  {
    id: 'mad-aridh-lissukun',
    pelajaranKe: 13,
    halamanBuku: 'Hal. 28–29',
    urutanBuku: "Pelajaran ke-13 · Mad Far'i Ke-3 (dari 13)",
    rumusArab: "Mad Thabi'i + huruf hidup dibaca waqaf",
    nama: "Ke-3: Mad 'Aridh Lissukun",
    kategori: "Pelajaran 13: Hukum Mad (Thabi'i & 13 Far'i)",
    warna: 'tajwid-mad-shilah',
    hexColor: '#7c3aed',
    kadarHarakat: '3 (tiga) Alif (6 harakat)',
    aktifDiMushaf: false,
    deskripsi:
      "Yang dinamakan Mad 'Aridh Lissukun ialah: Mad Thabi'i bertemu huruf hidup dibaca waqaf. Panjangnya Mad 3 (tiga) Alif.",
    caraBaca:
      'Huruf hidup setelah Mad Thabi\'i disukunkan karena berhenti (waqaf), dan dipanjangkan 3 Alif (6 harakat).',
    huruf: ['ـُوْكَ ← ـُوْكْ', 'ـَابٍ ← ـَابْ'],
    contohArab: 'أَبُوكَ ← أَبُوكْ ۝ · عِقَابٍ ← عِقَابْ ۝',
    contohLatin: 'Abūka → Abūk · ‘Iqābin → ‘Iqāb',
    penjelasanContoh:
      'Dua contoh langsung dari halaman 29 buku: أَبُوكَ dibaca waqaf menjadi أَبُوكْ, dan عِقَابٍ dibaca waqaf menjadi عِقَابْ.',
    soalJawabBuku: [
      {
        soal: "Apa yang dinamakan Mad 'Aridh Lissukun, dan berapa Alif panjangnya?",
        jawab: "Mad Thabi'i bertemu huruf hidup dibaca waqaf. Panjangnya 3 (tiga) Alif."
      }
    ],
    rujukanSurah: { surahNomor: 1, ayatNomor: 2, label: 'QS. Al-Fatihah [1]: 2' }
  },
  {
    id: 'mad-iwadh',
    pelajaranKe: 13,
    halamanBuku: 'Hal. 28–29',
    urutanBuku: "Pelajaran ke-13 · Mad Far'i Ke-4 (dari 13)",
    rumusArab: 'ـًا ← ـَا ۝ (selain ةً)',
    nama: "Ke-4: Mad 'Iwadh",
    kategori: "Pelajaran 13: Hukum Mad (Thabi'i & 13 Far'i)",
    warna: 'tajwid-mad-shilah',
    hexColor: '#7c3aed',
    kadarHarakat: '1 (satu) Alif (2 harakat)',
    aktifDiMushaf: false,
    deskripsi:
      "Yang dinamakan Mad 'Iwadh ialah: kalimat fathah tanwin dibaca waqaf, selain Ta' Marbuthah. Panjangnya Mad 1 (satu) Alif.",
    caraBaca:
      'Bunyi fathah tanwin ("-an") diganti menjadi suara panjang "-ā" sepanjang 1 Alif (2 harakat) ketika berhenti (waqaf). Jika berupa Ta\' Marbuthah (ةً), berubah menjadi suara Ha sukun ("-ah"), bukan Mad \'Iwadh.',
    huruf: ['ـًا ← ـَا'],
    contohArab: 'عَلِيمًا ← عَلِيمَا ۝',
    contohLatin: '‘Alīman → ‘Alīmā',
    penjelasanContoh:
      'Contoh langsung dari halaman 29 buku: kata عَلِيمًا ketika diwaqafkan dibaca عَلِيمَا sepanjang 1 Alif.',
    soalJawabBuku: [
      {
        soal: "Apa yang dinamakan Mad 'Iwadh, dan berapa Alif panjangnya?",
        jawab: "Kalimat fathah tanwin dibaca waqaf, selain Ta' Marbuthah. Panjangnya 1 (satu) Alif."
      }
    ],
    rujukanSurah: { surahNomor: 4, ayatNomor: 11, label: 'QS. An-Nisa\' [4]: 11' }
  },
  {
    id: 'mad-shilah',
    pelajaranKe: 13,
    halamanBuku: 'Hal. 29–30',
    urutanBuku: "Pelajaran ke-13 · Mad Far'i Ke-5 (dari 13)",
    rumusArab: 'لَهُۥ — بِهِۦ  ❖  مَالَهُۥٓ أَخْلَدَهُ',
    nama: 'Ke-5: Mad Shilah (Qashirah & Thawilah)',
    kategori: "Pelajaran 13: Hukum Mad (Thabi'i & 13 Far'i)",
    warna: 'tajwid-mad-shilah',
    hexColor: '#7c3aed',
    kadarHarakat: 'Qashirah: 1 Alif · Thawilah: 2½ Alif',
    aktifDiMushaf: true,
    deskripsi:
      'Yang dinamakan Mad Shilah ialah setiap Hu dan Hi (ـهُ / ـهِ) apabila didahului huruf hidup (jika didahului huruf Sukun tidak dibaca Mad). Mad Shilah dibagi dua: Mad Shilah Qashirah (panjang 1 Alif) dan Mad Shilah Thawilah, yaitu Mad Shilah Qashirah bertemu huruf Hamzah yang bentuknya Alif (panjang 2½ Alif).',
    caraBaca:
      'Mad Shilah Qashirah dibaca panjang 1 (satu) Alif (2 harakat); Mad Shilah Thawilah dibaca panjang 2½ Alif (5 harakat).',
    huruf: ['ـهُۥ', 'ـهِۦ', 'ـهُۥٓ أ', 'ـهِۦٓ إ'],
    contohArab: 'لَهُۥ · بِهِۦ · ظَهْرِهِۦٓ إِنَّ · أَنَّ مَالَهُۥٓ أَخْلَدَهُ',
    contohLatin: 'Lahū · Bihī · Ẓahrihī inna · Anna mālahū akhladah',
    penjelasanContoh:
      'Contoh lengkap dari halaman 29–30 buku untuk Mad Shilah Qashirah dan Mad Shilah Thawilah.',
    rincianContoh: [
      {
        judul: 'Contoh Mad Shilah Qashirah — Panjang 1 Alif (Hal. 29)',
        rumusArab: 'لَهُۥ — بِهِۦ',
        contohArab: 'لَهُۥ · بِهِۦ',
        contohLatin: 'Lahū · Bihī (1 Alif / 2 harakat)'
      },
      {
        judul: 'Contoh Mad Shilah Thawilah — Panjang 2½ Alif (Hal. 30)',
        rumusArab: 'ـهِ / ـهُ + أ / إ',
        contohArab: 'ظَهْرِهِۦٓ إِنَّ · أَنَّ مَالَهُۥٓ أَخْلَدَهُ',
        contohLatin: 'Ẓahrihī inna · Anna mālahū akhladah (2½ Alif / 5 harakat)'
      }
    ],
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Mad Shilah Qashirah, dan berapa Alif panjangnya?',
        jawab: 'Setiap Hu dan Hi apabila didahului huruf hidup (tidak bertemu Hamzah). Panjangnya 1 (satu) Alif.'
      },
      {
        soal: 'Apa yang dinamakan Mad Shilah Thawilah, dan berapa Alif panjangnya?',
        jawab: 'Mad Shilah Qashirah bertemu huruf Hamzah (bentuknya Alif). Panjangnya 2½ Alif.'
      }
    ],
    rujukanSurah: { surahNomor: 104, ayatNomor: 3, label: 'QS. Al-Humazah [104]: 3' }
  },
  {
    id: 'mad-badal',
    pelajaranKe: 13,
    halamanBuku: 'Hal. 29–30',
    urutanBuku: "Pelajaran ke-13 · Mad Far'i Ke-6 (dari 13)",
    rumusArab: 'آ (Aa) · إِيْ (Ii) · أُوْ (Uu)',
    nama: 'Ke-6: Mad Badal',
    kategori: "Pelajaran 13: Hukum Mad (Thabi'i & 13 Far'i)",
    warna: 'tajwid-mad-shilah',
    hexColor: '#7c3aed',
    kadarHarakat: '1 (satu) Alif (2 harakat)',
    aktifDiMushaf: false,
    deskripsi:
      'Yang dinamakan Mad Badal ialah setiap Aa, Ii, Uu yang dibaca panjang. Panjangnya Mad Badal 1 (satu) Alif.',
    caraBaca:
      'Dipanjangkan 1 Alif (2 harakat) pada bunyi Hamzah panjang Aa (آ / ءَا), Ii (إِي), dan Uu (أُو).',
    huruf: ['آ / ءَا', 'إِيْ', 'أُوْ'],
    contohArab: 'آمَنُوا · إِيتُونِي · أُوتِيَ',
    contohLatin: 'Āmanū · Ītūnī · Ūtiya',
    penjelasanContoh:
      'Tiga contoh langsung dari halaman 30 buku yang mewakili bunyi Aa (آمَنُوا), Ii (إِيتُونِي), dan Uu (أُوتِيَ).',
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Mad Badal, berikan contohnya, dan berapa Alif panjangnya?',
        jawab: 'Setiap Aa, Ii, Uu yang dibaca panjang (contoh: آمَنُوا ، إِيتُونِي ، أُوتِيَ). Panjangnya 1 (satu) Alif.'
      }
    ],
    rujukanSurah: { surahNomor: 46, ayatNomor: 4, label: 'QS. Al-Ahqaf [46]: 4' }
  },
  {
    id: 'mad-tamkin',
    pelajaranKe: 13,
    halamanBuku: 'Hal. 30',
    urutanBuku: "Pelajaran ke-13 · Mad Far'i Ke-7 (dari 13)",
    rumusArab: 'ـِّيْ (Ya Kasroh bertasydid + Ya Sukun)',
    nama: 'Ke-7: Mad Tamkin',
    kategori: "Pelajaran 13: Hukum Mad (Thabi'i & 13 Far'i)",
    warna: 'tajwid-mad-shilah',
    hexColor: '#7c3aed',
    kadarHarakat: '1 (satu) Alif (2 harakat)',
    aktifDiMushaf: true,
    deskripsi:
      'Yang dinamakan Mad Tamkin ialah Ya Kasroh bertasydid bertemu Ya Sukun (ـِّيْ). Panjangnya 1 (satu) Alif.',
    caraBaca:
      'Menetapkan tekanan tasydid pada Ya pertama yang berharakat kasroh lalu memanjangkannya 1 Alif (2 harakat) melalui Ya Sukun sesudahnya.',
    huruf: ['ـِّيْ'],
    contohArab: 'أُمِّيِّينَ · حُيِّيتُمْ · نَبِيِّينَ',
    contohLatin: 'Ummiyyīna · Ḥuyyītum · Nabiyyīna',
    penjelasanContoh:
      'Tiga contoh langsung dari halaman 30 buku: أُمِّيِّينَ ، حُيِّيتُمْ ، نَبِيِّينَ.',
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Mad Tamkin, dan berapa Alif panjangnya?',
        jawab: 'Ya Kasroh bertasydid bertemu Ya Sukun. Panjangnya 1 (satu) Alif.'
      }
    ],
    rujukanSurah: { surahNomor: 4, ayatNomor: 86, label: 'QS. An-Nisa\' [4]: 86' }
  },
  {
    id: 'mad-lin',
    pelajaranKe: 13,
    halamanBuku: 'Hal. 30',
    urutanBuku: "Pelajaran ke-13 · Mad Far'i Ke-8 (dari 13)",
    rumusArab: 'ـَوْ / ـَيْ + huruf hidup dibaca Waqaf',
    nama: 'Ke-8: Mad Lin',
    kategori: "Pelajaran 13: Hukum Mad (Thabi'i & 13 Far'i)",
    warna: 'tajwid-mad-shilah',
    hexColor: '#7c3aed',
    kadarHarakat: '3 (tiga) Alif (6 harakat)',
    aktifDiMushaf: false,
    deskripsi:
      'Yang dinamakan Mad Lin ialah fathah diikuti Wawu atau Ya Sukun (ـَوْ / ـَيْ), bertemu huruf hidup dibaca Waqaf. Dan panjangnya tiga Alif.',
    caraBaca:
      'Dilafalkan lembut (lin) dan dipanjangkan 3 Alif (6 harakat) ketika berhenti (waqaf) sesuai ketetapan halaman 30 buku.',
    huruf: ['ـَوْ', 'ـَيْ'],
    contohArab: 'خَوْفٌ ← خَوْفْ ۝ · إِلَيْهِ ← إِلَيْهْ ۝',
    contohLatin: 'Khaufun → Khauf · Ilaihi → Ilaih',
    penjelasanContoh:
      'Dua contoh langsung dari halaman 30 buku: خَوْفٌ dibaca waqaf خَوْفْ dan إِلَيْهِ dibaca waqaf إِلَيْهْ.',
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Mad Lin, dan berapa Alif panjangnya?',
        jawab: 'Fathah diikuti Wawu atau Ya Sukun, bertemu huruf hidup dibaca Waqaf. Panjangnya 3 (tiga) Alif.'
      }
    ],
    rujukanSurah: { surahNomor: 106, ayatNomor: 4, label: 'QS. Quraisy [106]: 4' }
  },
  {
    id: 'mad-lazim',
    pelajaranKe: 13,
    halamanBuku: 'Hal. 32',
    urutanBuku: "Pelajaran ke-13 · Mad Far'i Ke-9 (dari 13)",
    rumusArab: "Mad Thabi'i + Tasydid (ّ)",
    nama: 'Ke-9: Mad Lazim Mutsaqqal Kalimi',
    kategori: "Pelajaran 13: Hukum Mad (Thabi'i & 13 Far'i)",
    warna: 'tajwid-mad-lazim',
    hexColor: '#be185d',
    kadarHarakat: '3 (tiga) Alif (6 harakat)',
    aktifDiMushaf: true,
    deskripsi:
      "Yang dinamakan Mad Lazim Mutsaqqal Kalimi ialah Mad Thabi'i bertemu tasydid. Dan panjangnya 3 (tiga) Alif.",
    caraBaca:
      'Wajib dipanjangkan 3 Alif (6 harakat) penuh lalu masuk menekan ke huruf yang bertasydid.',
    huruf: ['آ + ّ'],
    contohArab: 'وَلَا الضَّآلِّينَ · أَتُحَآجُّونِّي',
    contohLatin: 'Wa laḍ-ḍāllīn · Atuḥājjūnnī',
    penjelasanContoh:
      'Dua contoh langsung dari halaman 32 buku: وَلَا الضَّآلِّينَ dan أَتُحَآجُّونِّي.',
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Mad Lazim Mutsaqqal Kalimi, dan berapa Alif panjangnya?',
        jawab: "Mad Thabi'i bertemu tasydid. Panjangnya 3 (tiga) Alif."
      }
    ],
    rujukanSurah: { surahNomor: 1, ayatNomor: 7, label: 'QS. Al-Fatihah [1]: 7' }
  },
  {
    id: 'mad-lazim-mukhaffaf-kalimi',
    pelajaranKe: 13,
    halamanBuku: 'Hal. 32',
    urutanBuku: "Pelajaran ke-13 · Mad Far'i Ke-10 (dari 13)",
    rumusArab: 'Mad Badal + Sukun (ْ)',
    nama: 'Ke-10: Mad Lazim Mukhaffaf Kalimi',
    kategori: "Pelajaran 13: Hukum Mad (Thabi'i & 13 Far'i)",
    warna: 'tajwid-mad-lazim',
    hexColor: '#be185d',
    kadarHarakat: '3 (tiga) Alif (6 harakat)',
    aktifDiMushaf: true,
    deskripsi:
      'Yang dinamakan Mad Lazim Mukhaffaf Kalimi ialah Mad Badal bertemu Sukun. Dan panjangnya 3 (tiga) Alif.',
    caraBaca:
      'Dipanjangkan 3 Alif (6 harakat) dengan ringan karena setelahnya berupa huruf sukun (tanpa tasydid).',
    huruf: ['آ + لْ'],
    contohArab: 'آلْآنَ',
    contohLatin: 'Āl’āna',
    penjelasanContoh:
      'Contoh tunggal di Al-Qur\'an sesuai halaman 32 buku: آلْآنَ (terdapat pada QS. Yunus ayat 51 dan 91).',
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Mad Lazim Mukhaffaf Kalimi, dan berapa Alif panjangnya?',
        jawab: 'Mad Badal bertemu Sukun. Panjangnya 3 (tiga) Alif. Contoh: آلْآنَ.'
      }
    ],
    rujukanSurah: { surahNomor: 10, ayatNomor: 51, label: 'QS. Yunus [10]: 51' }
  },
  {
    id: 'mad-lazim-musyba-harfi',
    pelajaranKe: 13,
    halamanBuku: 'Hal. 33',
    urutanBuku: "Pelajaran ke-13 · Mad Far'i Ke-11 (dari 13)",
    rumusArab: 'ن ق ص ع س ل ك م (8 Huruf)',
    nama: "Ke-11: Mad Lazim Musyba' Harfi",
    kategori: "Pelajaran 13: Hukum Mad (Thabi'i & 13 Far'i)",
    warna: 'tajwid-mad-lazim',
    hexColor: '#be185d',
    kadarHarakat: '3 (tiga) Alif (6 harakat)',
    aktifDiMushaf: true,
    deskripsi:
      "Yang dinamakan Mad Lazim Musyba' Harfi ialah huruf (pembuka surah) yang dibaca panjang tiga alif. Jumlahnya ada 8 (delapan): ن ق ص ع س ل ك م.",
    caraBaca:
      'Setiap satu dari 8 huruf tersebut dibaca panjang 3 Alif (6 harakat). Catatan buku: Huruf Alif (ا) tidak termasuk huruf Mad, dibaca tanpa ada suara panjang (Alif).',
    catatanPenting:
      'Catatan Halaman 33 Buku: "(Huruf Alif tidak termasuk huruf Mad), dibaca tanpa ada suara panjang (Alif)."',
    huruf: ['ن', 'ق', 'ص', 'ع', 'س', 'ل', 'ك', 'م'],
    contohArab: 'نٓ · قٓ · صٓ · الٓمٓ · الٓمٓصٓ',
    contohLatin: 'Nūn · Qāf · Ṣād · Alif-Lām-Mīm · Alif-Lām-Mīm-Ṣād',
    penjelasanContoh:
      'Lima contoh langsung dari halaman 33 buku: نٓ ، قٓ ، صٓ ، الٓمٓ ، الٓمٓصٓ.',
    soalJawabBuku: [
      {
        soal: "Apa yang dinamakan Mad Lazim Musyba' Harfi, dan berapa Alif panjangnya?",
        jawab: 'Huruf yang dibaca panjang 3 (tiga) Alif, jumlahnya ada 8 huruf: ن ق ص ع س ل ك م.'
      }
    ],
    rujukanSurah: { surahNomor: 68, ayatNomor: 1, label: 'QS. Al-Qalam [68]: 1' }
  },
  {
    id: 'mad-lazim-mukhaffaf-harfi',
    pelajaranKe: 13,
    halamanBuku: 'Hal. 33',
    urutanBuku: "Pelajaran ke-13 · Mad Far'i Ke-12 (dari 13)",
    rumusArab: 'ح ي ط هـ ر (5 Huruf)',
    nama: 'Ke-12: Mad Lazim Mukhaffaf Harfi',
    kategori: "Pelajaran 13: Hukum Mad (Thabi'i & 13 Far'i)",
    warna: 'tajwid-mad-shilah',
    hexColor: '#7c3aed',
    kadarHarakat: '1 (satu) Alif (2 harakat)',
    aktifDiMushaf: false,
    deskripsi:
      'Yang dinamakan Mad Lazim Mukhaffaf Harfi ialah huruf (pembuka surah) yang dibaca panjang 1 (satu) Alif, jumlahnya 5 (lima) huruf: ح ي ط هـ ر.',
    caraBaca:
      'Kelima huruf ح ي ط هـ ر pada awal surah dibaca ringan sepanjang 1 Alif (2 harakat): Ḥā, Yā, Ṭā, Hā, Rā.',
    huruf: ['ح', 'ي', 'ط', 'هـ', 'ر'],
    contohArab: 'طٰهٰ · يٰسٓ · حٰمٓ · عٓسٓقٓ · الٓرٰ · الٓمٓرٰ · طٰسٓ · طٰسٓمٓ · كٓهٰيٰعٓصٓ',
    contohLatin: 'Ṭā-Hā · Yā-Sīn · Ḥā-Mīm · ‘Aīn-Sīn-Qāf · Alif-Lām-Rā · Alif-Lām-Mīm-Rā · Ṭā-Sīn · Ṭā-Sīn-Mīm · Kāf-Hā-Yā-‘Aīn-Ṣād',
    penjelasanContoh:
      'Sembilan contoh lengkap dari halaman 33 buku yang memadukan huruf Mukhaffaf Harfi (1 Alif) dan Musyba\' Harfi (3 Alif).',
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Mad Lazim Mukhaffaf Harfi, dan berapa Alif panjangnya?',
        jawab: 'Huruf yang dibaca panjang 1 (satu) Alif, jumlahnya 5 (lima) huruf: ح ي ط هـ ر.'
      }
    ],
    rujukanSurah: { surahNomor: 20, ayatNomor: 1, label: 'QS. Thaha [20]: 1' }
  },
  {
    id: 'mad-farq',
    pelajaranKe: 13,
    halamanBuku: 'Hal. 34',
    urutanBuku: "Pelajaran ke-13 · Mad Far'i Ke-13 (dari 13)",
    rumusArab: 'Mad Badal + Tasydid (ّ)',
    nama: 'Ke-13: Mad Farq',
    kategori: "Pelajaran 13: Hukum Mad (Thabi'i & 13 Far'i)",
    warna: 'tajwid-mad-lazim',
    hexColor: '#be185d',
    kadarHarakat: '3 (tiga) Alif (6 harakat)',
    aktifDiMushaf: true,
    deskripsi:
      'Yang dinamakan Mad Farq ialah Mad Badal bertemu tasydid. Dan panjangnya 3 (tiga) Alif.',
    caraBaca:
      'Dipanjangkan 3 Alif (6 harakat) pada bunyi "Ā" sebelum masuk ke huruf yang bertasydid.',
    huruf: ['آللَّهُ', 'آلذَّكَرَيْنِ'],
    contohArab: 'قُلْ آللَّهُ · قُلْ آلذَّكَرَيْنِ',
    contohLatin: 'Qul āllāhu · Qul āż-żakaraini',
    penjelasanContoh:
      'Dua contoh langsung dari halaman 34 buku: قُلْ آللَّهُ (QS. Yunus: 59) dan قُلْ آلذَّكَرَيْنِ (QS. Al-An\'am: 143–144).',
    soalJawabBuku: [
      {
        soal: 'Apa yang dinamakan Mad Farq, dan berapa Alif panjangnya?',
        jawab: 'Mad Badal bertemu tasydid. Panjangnya 3 (tiga) Alif. Contoh: قُلْ آللَّهُ ، قُلْ آلذَّكَرَيْنِ.'
      }
    ],
    rujukanSurah: { surahNomor: 10, ayatNomor: 59, label: 'QS. Yunus [10]: 59' }
  }
];

/**
 * Lookup helper that resolves both canonical IDs and sub-variant aliases
 * emitted by renderTajwidHtml.
 */
export function getTajwidRuleById(ruleId: string): TajwidRule | undefined {
  const direct = TAJWID_RULES.find((r) => r.id === ruleId);
  if (direct) return direct;
  const aliasMap: Record<string, string> = {
    mad: 'mad-wajib-muttasil',
    'mad-shilah-qashirah': 'mad-shilah',
    'mad-shilah-thawilah': 'mad-shilah',
    'mad-aridh-lin': 'mad-aridh-lissukun'
  };
  const mapped = aliasMap[ruleId];
  return mapped ? TAJWID_RULES.find((r) => r.id === mapped) : undefined;
}

// ============================================================================
// 33 SOAL EVALUASI LENGKAP DARI BUKU (HALAMAN 35–37 PDF ASLI)
// ============================================================================

export const TAJWID_BOOK_QUESTIONS: TajwidBookQuestion[] = [
  {
    nomor: 1,
    pelajaran: 'Pelajaran ke-1 · Hal. 1',
    pertanyaan: 'Apa yang dinamakan Ghunnah?',
    jawaban: 'Setiap huruf Nun atau Mim yang bertasydid (نّ — مّ), dalam Ilmu Tajwid namanya Ghunnah.',
    contohArab: 'إِنَّ · ثُمَّ · إِنَّمَا · فَلَمَّا · وَلَٰكِنَّا',
    ruleId: 'ghunnah'
  },
  {
    nomor: 2,
    pelajaran: 'Pelajaran ke-2 · Hal. 2',
    pertanyaan: 'Apa perbedaan Nun Sukun dan Tanwin?',
    jawaban: 'Perbedaan Nun Sukun dan Tanwin: sama dalam suara, lain dalam tulisan. Karena suaranya sama, maka hukumnya juga sama.',
    contohArab: 'مَنْ = مًا · مِنْ = مٍ · مُنْ = مٌ',
    ruleId: 'perbedaan-nun-sukun-tanwin'
  },
  {
    nomor: 3,
    pelajaran: 'Pelajaran ke-3 · Hal. 3',
    pertanyaan: 'Nun Sukun/Tanwin hukumnya dibagi berapa? Sebutkanlah!',
    jawaban: "Hukum Nun Sukun/Tanwin dibagi lima (5): 1. Idgham Bighunnah, 2. Idgham Bilaghunnah, 3. Iqlab, 4. Idzhar, 5. Ikhfa'.",
    ruleId: 'idgham-bighunnah'
  },
  {
    nomor: 4,
    pelajaran: 'Pelajaran ke-3 · Hal. 3–5',
    pertanyaan: 'Apa yang dinamakan Idgham Bighunnah?',
    jawaban: 'Yang dinamakan Idgham Bighunnah ialah Nun Sukun/Tanwin bertemu salah satu huruf Ya, Wawu, Mim, Nun (ي و م ن).',
    contohArab: 'لِمَنْ يَرَىٰ · مِنْ وَرَآئِهِمْ · نَكُنْ مَعَكُمْ · مِنْ نَاصِرِينَ',
    ruleId: 'idgham-bighunnah'
  },
  {
    nomor: 5,
    pelajaran: 'Pelajaran ke-3 · Hal. 5–6',
    pertanyaan: 'Apa yang dinamakan Idgham Bilaghunnah?',
    jawaban: 'Yang dinamakan Idgham Bilaghunnah ialah Nun Sukun/Tanwin bertemu Lam/Ra (ل / ر).',
    contohArab: 'مِنْ لَدُنْكَ · ذِكْرٌ لِلْعَالَمِينَ · فَمَنْ رَبُّكُمَا · غَفُورٌ رَحِيمٌ',
    ruleId: 'idgham-bilaghunnah'
  },
  {
    nomor: 6,
    pelajaran: 'Pelajaran ke-3 · Hal. 7',
    pertanyaan: 'Apa yang dinamakan Iqlab?',
    jawaban: 'Yang dinamakan Iqlab ialah Nun Sukun/Tanwin bertemu Ba (ب).',
    contohArab: 'مَنْ بَخِلَ · يُنْبِتُ · جَزَآءً بِمَا · مِنْ بَاقِيَةٍ',
    ruleId: 'iqlab'
  },
  {
    nomor: 7,
    pelajaran: 'Pelajaran ke-3 · Hal. 8–11',
    pertanyaan: 'Apa yang dinamakan Idzhar?',
    jawaban: "Yang dinamakan Idzhar ialah Nun Sukun/Tanwin bertemu Hamzah (Alif), Cha, Kha, 'Ain, Ghain, Ha (ء=ا ح خ ع غ هـ).",
    contohArab: 'مَنْ أُوتِيَ · مِنْ حَيْثُ · مَنْ خَفَّتْ · مِنْ عِنْدِ اللَّهِ · مِنْ غِسْلِينٍ · كُلُّ شَيْءٍ هَالِكٌ',
    ruleId: 'izhar-halqi'
  },
  {
    nomor: 8,
    pelajaran: 'Pelajaran ke-3 · Hal. 11–12',
    pertanyaan: "Apa yang dinamakan Ikhfa'?",
    jawaban: "Yang dinamakan Ikhfa' ialah Nun Sukun/Tanwin bertemu huruf 15: (Ta, Tsa, Jim) (Dal, Dzal, Za) (Sin, Syin) (Shad, Dhat) (Tha, Zha) (Fa, Qaf, Kaf).",
    contohArab: 'مِنْ تَحْتِهَا · مَآءً ثَجَّاجًا · أَنْجَيْنَاكُمْ · عُمْيٌ فَهُمْ · رِزْقًا قَالُوا · مَنْ كَانَ يَرْجُو',
    ruleId: 'ikhfa'
  },
  {
    nomor: 9,
    pelajaran: 'Pelajaran ke-4 · Hal. 13–15',
    pertanyaan: 'Hukum Mim Sukun dibagi berapa? Sebutkanlah!',
    jawaban: "Hukum Mim Sukun dibagi tiga (3): 1. Idgham Mitsli, 2. Ikhfa' Syafawi, 3. Idzhar Syafawi.",
    ruleId: 'idgham-mimi'
  },
  {
    nomor: 10,
    pelajaran: 'Pelajaran ke-4 · Hal. 13',
    pertanyaan: 'Apa yang dinamakan Idgham Mitsli?',
    jawaban: 'Yang dinamakan Idgham Mitsli ialah Mim Sukun bertemu Mim (مْ ← م).',
    contohArab: 'لَهُمْ مَا يَتَّقُونَ · هُمْ مَآ أَنْفَقُوا · لَكُمْ مَا سَأَلْتُمْ · كُنْتُمْ مُسْلِمِينَ',
    ruleId: 'idgham-mimi'
  },
  {
    nomor: 11,
    pelajaran: 'Pelajaran ke-4 · Hal. 14',
    pertanyaan: "Apa yang dinamakan Ikhfa' Syafawi?",
    jawaban: "Yang dinamakan Ikhfa' Syafawi ialah Mim Sukun bertemu Ba (مْ ← ب).",
    contohArab: 'إِنَّهُمْ بِذَٰلِكَ · تَرْمِيهِمْ بِحِجَارَةٍ · ذَٰلِكُمْ بَلَآءٌ · وَمَا هُمْ بِخَارِجِينَ',
    ruleId: 'ikhfa-syafawi'
  },
  {
    nomor: 12,
    pelajaran: 'Pelajaran ke-4 · Hal. 14',
    pertanyaan: 'Apa yang dinamakan Idzhar Syafawi?',
    jawaban: 'Yang dinamakan Idzhar Syafawi ialah Mim Sukun bertemu huruf selain Mim dan Ba.',
    contohArab: 'هُمْ نَآئِمُونَ · قُلْ نَعَمْ وَأَنْتُمْ · أَنْتُمْ دَاخِرُونَ · أَمْ لَمْ تُنْذِرْهُمْ',
    ruleId: 'izhar-syafawi'
  },
  {
    nomor: 13,
    pelajaran: 'Pelajaran ke-6 · Hal. 16–17',
    pertanyaan: 'Apa yang dinamakan Idgham Mutajanisain? Sebutkanlah huruf-hurufnya!',
    jawaban: 'Ta sukun bertemu Tha, Tha sukun bertemu Ta, Ta sukun bertemu Dal, Dal sukun bertemu Ta, Lam sukun bertemu Ra, dan Dzal sukun bertemu Zha (ت ط – ط ت · ت د – د ت · ل ر – ذ ظ).',
    contohArab: 'قَالَتْ طَآئِفَةٌ · لَئِنْ بَسَطْتَ · أَثْقَلَتْ دَعَوَا · قَدْ تَبَيَّنَ · قُلْ رَبِّ · إِذْ ظَلَمُوا',
    ruleId: 'idgham-mutajanisain'
  },
  {
    nomor: 14,
    pelajaran: 'Pelajaran ke-7 · Hal. 17–18',
    pertanyaan: 'Apa yang dinamakan Idgham Mutaqarribain? Sebutkanlah huruf-hurufnya!',
    jawaban: 'Tsa sukun bertemu Dzal, Qaf sukun bertemu Kaf, dan Ba sukun bertemu Mim (ث ذ – ق ك – ب م).',
    contohArab: 'يَلْهَثْ ذَٰلِكَ · أَلَمْ نَخْلُقْكُمْ · يَابُنَيَّ ارْكَبْ مَعَنَا',
    ruleId: 'idgham-mutaqaribain'
  },
  {
    nomor: 15,
    pelajaran: 'Pelajaran ke-5 · Hal. 15 & 35',
    pertanyaan: 'Apa yang dinamakan Idgham Mutamatsilain?',
    jawaban: "Setiap huruf yang sama yang pertama Sukun (kecuali Wawu Sukun bertemu Wawu dan Ya Sukun bertemu Ya yang tetap dinamakan Mad Thabi'i).",
    contohArab: 'اِضْرِبْ بِعَصَاكَ · يُسْرِفْ فِي الْقَتْلِ · وَقَدْ دَخَلُوا · رَبِحَتْ تِجَارَتُهُمْ',
    ruleId: 'idgham-mutamatsilain'
  },
  {
    nomor: 16,
    pelajaran: 'Pelajaran ke-8 · Hal. 19',
    pertanyaan: 'Qalqalah dibagi berapa? Sebutkanlah huruf-hurufnya!',
    jawaban: 'Qalqalah dibagi dua (2): Qalqalah Shughra (matinya asli) dan Qalqalah Kubra (matinya mendatang sebab dibaca waqaf). Huruf Qalqalah ada lima: Qaf, Tha, Ba, Jim, Dal (ق ط ب ج د).',
    contohArab: 'يَقْرَأُ · يَطْهُرُ · يَبْخَلُ · يَجْعَلُ · يَدْخُلُ · أَحَدْ ۝ · خَلَقْ ۝',
    ruleId: 'qalqalah'
  },
  {
    nomor: 17,
    pelajaran: 'Pelajaran ke-9 · Hal. 20',
    pertanyaan: 'Jelaskanlah lafadz Allah yang dibaca Tafkhim dan yang dibaca Tarqiq!',
    jawaban: 'Dibaca Tafkhim (tebal) jika lafadh Allah didahului harakat fathah atau dhummah. Dibaca Tarqiq (tipis) jika lafadh Allah didahului harakat kasroh.',
    contohArab: 'وَاللَّهُ · نَصْرُ اللَّهِ · بِاللَّهِ · بِسْمِ اللَّهِ',
    ruleId: 'lam-jalalah-tafkhim'
  },
  {
    nomor: 18,
    pelajaran: 'Pelajaran ke-10 · Hal. 22',
    pertanyaan: 'Huruf Syamsiyah dan Qamariyah jumlahnya ada berapa? Sebutkanlah!',
    jawaban: 'Jumlahnya sama, masing-masing ada 14 huruf. Syamsiyah: (ت ث) (د ذ ر ز س ش ص ض ط ظ) (ل ن). Qamariyah: (ب) (ج ح خ) (ع غ ف ق ك) (م و هـ) (ء ي).',
    contohArab: 'وَالتِّينِ · وَالشَّمْسِ · الْبَلَاغُ · الْحَمِيدُ',
    ruleId: 'al-syamsiyah'
  },
  {
    nomor: 19,
    pelajaran: 'Pelajaran ke-11 · Hal. 23',
    pertanyaan: 'Apa yang namanya Idzhar Wajib? Sebutkan contohnya!',
    jawaban: "Nun Sukun bertemu huruf Ya atau Wawu dalam satu kalimat (di Al-Qur'an hanya ada empat).",
    contohArab: 'الدُّنْيَا · بُنْيَانٌ · صِنْوَانٌ · قِنْوَانٌ',
    ruleId: 'idzhar-wajib'
  },
  {
    nomor: 20,
    pelajaran: 'Pelajaran ke-12 · Hal. 24–25',
    pertanyaan: 'Hukum Ra dibagi berapa? Uraikanlah!',
    jawaban: "Hukum Ra dibagi dua: 1. Tafkhim (Ra fathah/fathatain, Ra dhummah/dhummatain, Ra hidup didahului huruf mati selain Ya' yang sebelumnya fathah/dhummah dibaca waqaf, Ra sukun didahului fathah/dhummah, Ra sukun didahului kasroh ada Hamzah washal, Ra sukun didahului kasroh bertemu 7 huruf Isti'la' خ ص ض ط ظ غ ق), dan 2. Tarqiq (Ra kasroh/kasratain, Ra sukun didahului kasroh, Ra hidup didahului Ya sukun dibaca waqaf, Ra hidup didahului huruf mati selain Ya' yang sebelumnya kasroh dibaca waqaf).",
    contohArab: 'رَبَّنَا · أَرْسَلَ · ارْجِعُوا · مِرْصَادٌ · رِجْسٌ · فِرْعَوْنَ · خَيْرٌ ۝',
    ruleId: 'ra-tafkhim'
  },
  {
    nomor: 21,
    pelajaran: 'Pelajaran ke-13 · Hal. 27',
    pertanyaan: 'Hukum Mad dibagi berapa? Uraikanlah dan sebutkanlah contoh-contohnya!',
    jawaban: "Hukum Mad dibagi dua: 1. Mad Thabi'i (atau Mad Ashli, panjang 1 Alif) dan 2. Mad Far'i (dibagi menjadi 13 macam, mulai dari Mad Wajib Muttashil hingga Mad Farq).",
    contohArab: 'نُوحِيهَا · جَآءَ · إِنَّآ أَعْطَيْنَا · وَلَا الضَّآلِّينَ',
    ruleId: 'mad-thabii'
  },
  {
    nomor: 22,
    pelajaran: 'Pelajaran ke-13 · Hal. 27',
    pertanyaan: "Apa yang dinamakan Mad Thabi'i? Sebutkan contohnya!",
    jawaban: 'Fathah diikuti Alif, kasroh diikuti Ya, dhummah diikuti Wawu. Panjangnya 1 Alif (2 harakat).',
    contohArab: 'دَا - دِيْ - دُوْ · نُوحِيهَا',
    ruleId: 'mad-thabii'
  },
  {
    nomor: 23,
    pelajaran: 'Pelajaran ke-13 (Ke-1) · Hal. 27–28',
    pertanyaan: 'Apa yang dinamakan Mad Wajib Muttashil? Sebutkan contohnya!',
    jawaban: "Mad Thabi'i bertemu hamzah dalam satu kalimat. Panjangnya 2½ Alif (5 harakat).",
    contohArab: 'جَآءَ · لِقَآءَنَا · نِدَآءً · نِسَآءَنَا',
    ruleId: 'mad-wajib-muttasil'
  },
  {
    nomor: 24,
    pelajaran: 'Pelajaran ke-13 (Ke-2) · Hal. 27–28',
    pertanyaan: 'Apa yang dinamakan Mad Jaiz Munfashil? Sebutkan contohnya!',
    jawaban: "Mad Thabi'i bertemu hamzah di lain kalimat. Panjangnya 2½ Alif (5 harakat).",
    contohArab: 'إِنَّآ أَعْطَيْنَا · وَمَآ أُمِرُوا · إِنَّآ أَنْزَلْنَا',
    ruleId: 'mad-jaiz-munfasil'
  },
  {
    nomor: 25,
    pelajaran: 'Pelajaran ke-13 (Ke-3) · Hal. 28–29',
    pertanyaan: "Apa yang dinamakan Mad 'Aridh Lissukun? Sebutkan contohnya!",
    jawaban: "Mad Thabi'i bertemu huruf hidup dibaca waqaf. Panjangnya 3 (tiga) Alif.",
    contohArab: 'أَبُوكَ ← أَبُوكْ ۝ · عِقَابٍ ← عِقَابْ ۝',
    ruleId: 'mad-aridh-lissukun'
  },
  {
    nomor: 26,
    pelajaran: 'Pelajaran ke-13 (Ke-4) · Hal. 28–29',
    pertanyaan: "Apa yang dinamakan Mad 'Iwadh? Sebutkan contohnya!",
    jawaban: "Kalimat fathah tanwin dibaca waqaf, selain Ta' Marbuthah. Panjangnya 1 (satu) Alif.",
    contohArab: 'عَلِيمًا ← عَلِيمَا ۝',
    ruleId: 'mad-iwadh'
  },
  {
    nomor: 27,
    pelajaran: 'Pelajaran ke-13 (Ke-7) · Hal. 30',
    pertanyaan: 'Apa yang dinamakan Mad Tamkin? Sebutkan contohnya!',
    jawaban: 'Ya Kasroh bertasydid bertemu Ya Sukun. Panjangnya 1 (satu) Alif.',
    contohArab: 'أُمِّيِّينَ · حُيِّيتُمْ · نَبِيِّينَ',
    ruleId: 'mad-tamkin'
  },
  {
    nomor: 28,
    pelajaran: 'Pelajaran ke-13 (Ke-8) · Hal. 30',
    pertanyaan: 'Apa yang dinamakan Mad Lin? Sebutkan contohnya!',
    jawaban: 'Fathah diikuti Wawu atau Ya Sukun, bertemu huruf hidup dibaca Waqaf. Panjangnya 3 (tiga) Alif.',
    contohArab: 'خَوْفٌ ← خَوْفْ ۝ · إِلَيْهِ ← إِلَيْهْ ۝',
    ruleId: 'mad-lin'
  },
  {
    nomor: 29,
    pelajaran: 'Pelajaran ke-13 (Ke-9) · Hal. 32',
    pertanyaan: 'Apa yang dinamakan Mad Lazim Mutsaqqal Kalimi? Sebutkan contohnya!',
    jawaban: "Mad Thabi'i bertemu tasydid. Panjangnya 3 (tiga) Alif.",
    contohArab: 'وَلَا الضَّآلِّينَ · أَتُحَآجُّونِّي',
    ruleId: 'mad-lazim'
  },
  {
    nomor: 30,
    pelajaran: 'Pelajaran ke-13 (Ke-10) · Hal. 32',
    pertanyaan: 'Apa yang dinamakan Mad Lazim Mukhaffaf Kalimi? Sebutkan contohnya!',
    jawaban: 'Mad Badal bertemu Sukun. Panjangnya 3 (tiga) Alif.',
    contohArab: 'آلْآنَ',
    ruleId: 'mad-lazim-mukhaffaf-kalimi'
  },
  {
    nomor: 31,
    pelajaran: 'Pelajaran ke-13 (Ke-11) · Hal. 33',
    pertanyaan: "Apa yang dinamakan Mad Lazim Musyba' Harfi? Sebutkan contohnya!",
    jawaban: 'Huruf pembuka surah yang dibaca panjang 3 (tiga) Alif, jumlahnya ada 8 (delapan): ن ق ص ع س ل ك م (Huruf Alif tidak termasuk huruf Mad).',
    contohArab: 'نٓ · قٓ · صٓ · الٓمٓ · الٓمٓصٓ',
    ruleId: 'mad-lazim-musyba-harfi'
  },
  {
    nomor: 32,
    pelajaran: 'Pelajaran ke-13 (Ke-12) · Hal. 33',
    pertanyaan: 'Apa yang dinamakan Mad Lazim Mukhaffaf Harfi? Sebutkan contohnya!',
    jawaban: 'Huruf pembuka surah yang dibaca panjang 1 (satu) Alif, jumlahnya 5 (lima) huruf: ح ي ط هـ ر.',
    contohArab: 'طٰهٰ · يٰسٓ · حٰمٓ · عٓسٓقٓ · الٓرٰ · الٓمٓرٰ · طٰسٓ · طٰسٓمٓ · كٓهٰيٰعٓصٓ',
    ruleId: 'mad-lazim-mukhaffaf-harfi'
  },
  {
    nomor: 33,
    pelajaran: 'Pelajaran ke-13 (Ke-13) · Hal. 34',
    pertanyaan: 'Apa yang dinamakan Mad Farq? Sebutkan contohnya!',
    jawaban: 'Mad Badal bertemu tasydid. Panjangnya 3 (tiga) Alif.',
    contohArab: 'قُلْ آللَّهُ · قُلْ آلذَّكَرَيْنِ',
    ruleId: 'mad-farq'
  }
];

// ============================================================================
// CONTOH AYAT UNTUK LAB DETEKSI TAJWID OTOMATIS (SESUAI CONTOH DI BUKU PDF)
// ============================================================================

export const TAJWID_LAB_VERSES = [
  {
    id: 'pelajaran-1-3-nun-tanwin',
    label: 'Pelajaran 1–3: Ghunnah & Nun Sukun/Tanwin (Hal. 1–12)',
    arabic:
      'إِنَّمَا · لِمَنْ يَرَىٰ · فَمَنْ رَبُّكُمَا · جَزَآءً بِمَا · كُفُوًا أَحَدٌ · مِنْ تَحْتِهَا'
  },
  {
    id: 'pelajaran-4-mim-sukun',
    label: 'Pelajaran 4: Hukum Mim Sukun (Hal. 13–14)',
    arabic:
      'لَهُمْ مَا يَتَّقُونَ · تَرْمِيهِمْ بِحِجَارَةٍ · كُنْتُمْ مُسْلِمِينَ · وَمَا هُمْ بِخَارِجِينَ'
  },
  {
    id: 'pelajaran-5-7-tiga-idgham',
    label: 'Pelajaran 5–7: Mutamatsilain, Mutajanisain & Mutaqarribain (Hal. 15–18)',
    arabic:
      'اِضْرِبْ بِعَصَاكَ · قَدْ تَبَيَّنَ · قُلْ رَبِّ · يَلْهَثْ ذَٰلِكَ · أَلَمْ نَخْلُقْكُمْ · ارْكَبْ مَعَنَا'
  },
  {
    id: 'pelajaran-8-11-qalqalah-allah-wajib',
    label: 'Pelajaran 8–11: Qalqalah, Lafadh Allah & Idzhar Wajib (Hal. 19–23)',
    arabic:
      'يَدْخُلُ · نَصْرُ اللَّهِ · بِسْمِ اللَّهِ · وَالشَّمْسِ · الدُّنْيَا · بُنْيَانٌ · صِنْوَانٌ · قِنْوَانٌ'
  },
  {
    id: 'pelajaran-13-mad-fari',
    label: "Pelajaran 13: Mad Far'i 1–13 (Hal. 27–34)",
    arabic:
      'جَآءَ · إِنَّآ أَعْطَيْنَا · مَالَهُۥٓ أَخْلَدَهُ · حُيِّيتُمْ · وَلَا الضَّآلِّينَ · آلْآنَ · قُلْ آللَّهُ'
  },
  {
    id: 'al-qadr-full-practice',
    label: 'Praktik Ayat Penuh: QS. Al-Qadr [97]: 1 & 4–5',
    arabic:
      'إِنَّآ أَنزَلْنَٰهُ فِى لَيْلَةِ ٱلْقَدْرِ · تَنَزَّلُ ٱلْمَلَٰٓئِكَةُ وَٱلرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ · سَلَٰمٌ هِىَ حَتَّىٰ مَطْلَعِ ٱلْفَجْرِ'
  }
];

// ============================================================================
// KUIS PILIHAN GANDA AKURAT SESUAI BUKU PDF QIRA'ATI (14 SOAL)
// ============================================================================

export const TAJWID_QUIZ_QUESTIONS: TajwidQuizQuestion[] = [
  {
    id: 'q1',
    bab: 'Pelajaran ke-1 · Ghunnah (Hal. 1)',
    verseArabic: 'إِنَّ · ثُمَّ · إِنَّمَا · فَلَمَّا · وَلَٰكِنَّا',
    highlightWord: 'إِنَّ · ثُمَّ',
    question: 'Setiap huruf Nun atau Mim yang bertasydid dalam Ilmu Tajwid namanya apa?',
    options: ['Ghunnah', 'Idzhar Wajib', "Ikhfa' Syafawi", 'Qalqalah Shughra'],
    correct: 'Ghunnah',
    explanation:
      'Sesuai Pelajaran ke-1 (Hal. 1): Setiap huruf Nun atau Mim yang bertasydid (نّ — مّ) dalam Ilmu Tajwid namanya Ghunnah.'
  },
  {
    id: 'q2',
    bab: 'Pelajaran ke-2 · Nun Sukun & Tanwin (Hal. 2)',
    verseArabic: 'مَنْ = مًا · مِنْ = مٍ · مُنْ = مٌ',
    highlightWord: 'مَنْ = مًا',
    question: 'Jelaskan perbedaan antara Nun Sukun dan Tanwin menurut Pelajaran ke-2!',
    options: [
      'Sama dalam suara, lain dalam tulisan',
      'Sama dalam tulisan, lain dalam suara',
      'Berbeda suara dan berbeda hukum bacaannya',
      'Tanwin dibaca 3 Alif sedangkan Nun Sukun 1 Alif'
    ],
    correct: 'Sama dalam suara, lain dalam tulisan',
    explanation:
      'Sesuai Pelajaran ke-2 (Hal. 2): Perbedaan Nun Sukun dan Tanwin ialah sama dalam suara, lain dalam tulisan. Karena suaranya sama, maka hukumnya juga sama.'
  },
  {
    id: 'q3',
    bab: 'Pelajaran ke-3 · Nun Sukun/Tanwin (Hal. 3–11)',
    verseArabic: 'لِمَنْ يَرَىٰ · مِنْ وَرَآئِهِمْ · نَكُنْ مَعَكُمْ · مِنْ نَاصِرِينَ',
    highlightWord: 'لِمَنْ يَرَىٰ',
    question: 'Nun Sukun/Tanwin bertemu salah satu huruf Ya, Wawu, Mim, Nun (ي و م ن) dinamakan:',
    options: ['Idgham Bighunnah', 'Idgham Bilaghunnah', 'Idzhar', 'Iqlab'],
    correct: 'Idgham Bighunnah',
    explanation:
      'Sesuai Pelajaran ke-3 Bagian 1 (Hal. 3): Hukum Nun Sukun/Tanwin dibagi lima; bila bertemu Ya, Wawu, Mim, atau Nun (dalam dua kalimat) dinamakan Idgham Bighunnah.'
  },
  {
    id: 'q4',
    bab: "Pelajaran ke-3 · Ikhfa' (Hal. 11–12)",
    verseArabic: 'مِنْ تَحْتِهَا · قِنْوَانٌ دَانِيَةٌ · قَوْمًا صَالِحِينَ · رِزْقًا قَالُوا',
    highlightWord: 'مِنْ تَحْتِهَا',
    question: "Berapa jumlah huruf Ikhfa' dan bagaimana kelompok hafalannya di buku?",
    options: [
      '15 huruf: (ت ث ج) (د ذ ز) (س ش) (ص ض) (ط ظ) (ف ق ك)',
      '6 huruf: Hamzah, Cha, Kha, \'Ain, Ghain, Ha',
      '4 huruf: Ya, Wawu, Mim, Nun',
      '5 huruf: Qaf, Tha, Ba, Jim, Dal'
    ],
    correct: '15 huruf: (ت ث ج) (د ذ ز) (س ش) (ص ض) (ط ظ) (ف ق ك)',
    explanation:
      "Sesuai Pelajaran ke-3 Bagian 5 (Hal. 11): Huruf Ikhfa' berjumlah 15 dan dihafalkan per kelompok: (Ta, Tsa, Jim) (Dal, Dzal, Za) (Sin, Syin) (Shad, Dhat) (Tha, Zha) (Fa, Qaf, Kaf)."
  },
  {
    id: 'q5',
    bab: 'Pelajaran ke-4 · Hukum Mim Sukun (Hal. 13–14)',
    verseArabic: 'لَهُمْ مَا يَتَّقُونَ · كُنْتُمْ مُسْلِمِينَ',
    highlightWord: 'لَهُمْ مَا',
    question: 'Mim Sukun bertemu huruf Mim (مْ ← م) dalam Pelajaran ke-4 dinamakan:',
    options: ['Idgham Mitsli', "Ikhfa' Syafawi", 'Idzhar Syafawi', 'Iqlab'],
    correct: 'Idgham Mitsli',
    explanation:
      "Sesuai Pelajaran ke-4 (Hal. 13–15): Hukum Mim Sukun dibagi tiga: 1. Idgham Mitsli (مْ ← م), 2. Ikhfa' Syafawi (مْ ← ب), 3. Idzhar Syafawi (مْ ← selain م dan ب)."
  },
  {
    id: 'q6',
    bab: 'Pelajaran ke-5 & Hal. 35 · Pengecualian Mutamatsilain',
    verseArabic: 'فِي يَوْمٍ · اِصْبِرُوا وَصَابِرُوا',
    highlightWord: 'فِي يَوْمٍ',
    question: 'Jika huruf Wawu Sukun bertemu Wawu atau Ya Sukun bertemu Ya seperti di atas, apakah namanya Idgham Mutamatsilain?',
    options: [
      "Tidak, namanya Mad Thabi'i",
      'Ya, namanya Idgham Mutamatsilain',
      'Namanya Idzhar Wajib',
      'Namanya Mad Lin 3 Alif'
    ],
    correct: "Tidak, namanya Mad Thabi'i",
    explanation:
      "Sesuai Halaman 35 Buku: Setiap huruf yang sama yang pertama Sukun namanya Idgham Mutamatsilain, KECUALI huruf Wawu Sukun bertemu Wawu dan Ya Sukun bertemu Ya — namanya Mad Thabi'i."
  },
  {
    id: 'q7',
    bab: 'Pelajaran ke-6 · Idgham Mutajanisain (Hal. 16–17)',
    verseArabic: 'قَالَتْ طَآئِفَةٌ · قَدْ تَبَيَّنَ · قُلْ رَبِّ · إِذْ ظَلَمُوا',
    highlightWord: 'قُلْ رَبِّ',
    question: 'Manakah kelompok pasangan huruf Idgham Mutajanisain yang tepat sesuai halaman 16–17 buku?',
    options: [
      'ت ط – ط ت · ت د – د ت · ل ر – ذ ظ',
      'ث ذ – ق ك – ب م',
      'ي و م ن',
      'خ ص ض ط ظ غ ق'
    ],
    correct: 'ت ط – ط ت · ت د – د ت · ل ر – ذ ظ',
    explanation:
      'Sesuai Pelajaran ke-6 (Hal. 16–17): Pasangan huruf Idgham Mutajanisain adalah ت ط – ط ت ، ت د – د ت ، ل ر – ذ ظ.'
  },
  {
    id: 'q8',
    bab: 'Pelajaran ke-7 · Idgham Mutaqarribain (Hal. 17–18)',
    verseArabic: 'يَلْهَثْ ذَٰلِكَ · أَلَمْ نَخْلُقْكُمْ · يَابُنَيَّ ارْكَبْ مَعَنَا',
    highlightWord: 'ارْكَبْ مَعَنَا',
    question: 'Tsa sukun bertemu Dzal, Qaf sukun bertemu Kaf, dan Ba sukun bertemu Mim (ث ذ – ق ك – ب م) adalah huruf-huruf:',
    options: [
      'Idgham Mutaqarribain',
      'Idgham Mutajanisain',
      'Idgham Mutamatsilain',
      'Idzhar Syafawi'
    ],
    correct: 'Idgham Mutaqarribain',
    explanation:
      'Sesuai Pelajaran ke-7 (Hal. 17–18): Yang dinamakan Idgham Mutaqarribain ialah ثْ ← ذ (يَلْهَثْ ذَٰلِكَ), قْ ← ك (أَلَمْ نَخْلُقْكُمْ), dan بْ ← م (يَابُنَيَّ ارْكَبْ مَعَنَا).'
  },
  {
    id: 'q9',
    bab: 'Pelajaran ke-8 · Qalqalah (Hal. 19)',
    verseArabic: 'أَحَدٌ ← أَحَدْ ۝ · خَلَقَ ← خَلَقْ ۝',
    highlightWord: 'أَحَدْ ۝',
    question: 'Huruf Qalqalah (ق ط ب ج د) yang matinya mendatang disebabkan dibaca waqaf dinamakan:',
    options: [
      'Qalqalah Kubra',
      'Qalqalah Shughra',
      "Mad 'Aridh Lissukun",
      "Mad 'Iwadh"
    ],
    correct: 'Qalqalah Kubra',
    explanation:
      'Sesuai Pelajaran ke-8 (Hal. 19): Qalqalah dibagi dua, yaitu Qalqalah Shughra (matinya asli) dan Qalqalah Kubra (matinya mendatang disebabkan dibaca waqaf).'
  },
  {
    id: 'q10',
    bab: 'Pelajaran ke-11 · Idzhar Wajib (Hal. 23)',
    verseArabic: 'الدُّنْيَا · بُنْيَانٌ · صِنْوَانٌ · قِنْوَانٌ',
    highlightWord: 'بُنْيَانٌ',
    question: 'Nun Sukun bertemu Ya atau Wawu dalam satu kalimat (di Al-Qur\'an hanya ada 4 kata di atas) dinamakan:',
    options: [
      'Idzhar Wajib',
      'Idgham Bighunnah',
      'Idgham Bilaghunnah',
      'Al Qamariyah'
    ],
    correct: 'Idzhar Wajib',
    explanation:
      "Sesuai Pelajaran ke-11 (Hal. 23): Nun Sukun bertemu huruf Ya atau Wawu dalam satu kalimat dinamakan Idzhar Wajib dan di Al-Qur'an hanya ada empat: الدُّنْيَا ، بُنْيَانٌ ، صِنْوَانٌ ، قِنْوَانٌ."
  },
  {
    id: 'q11',
    bab: 'Pelajaran ke-12 · Hukum Ra (Hal. 24–25)',
    verseArabic: 'مِرْصَادٌ · قِرْطَاسٌ',
    highlightWord: 'مِرْصَادٌ',
    question: "Mengapa Ra Sukun pada kata مِرْصَادٌ dan قِرْطَاسٌ dibaca Tafkhim padahal didahului harakat kasroh?",
    options: [
      "Karena bertemu salah satu dari 7 huruf Isti'la' (خ ص ض ط ظ غ ق)",
      'Karena bertemu huruf Mad Thabi\'i',
      'Karena dibaca waqaf di akhir ayat',
      'Karena didahului Ya Sukun'
    ],
    correct: "Karena bertemu salah satu dari 7 huruf Isti'la' (خ ص ض ط ظ غ ق)",
    explanation:
      "Sesuai Pelajaran ke-12 (Hal. 24–25): Ra Sukun didahului kasroh yang bertemu huruf Isti'la' (7 huruf: خ ص ض ط ظ غ ق) tetap dibaca Tafkhim (tebal)."
  },
  {
    id: 'q12',
    bab: 'Pelajaran ke-13 · Mad Wajib & Jaiz (Hal. 27–28)',
    verseArabic: 'جَآءَ · لِقَآءَنَا · إِنَّآ أَعْطَيْنَا · إِنَّآ أَنْزَلْنَا',
    highlightWord: 'جَآءَ · إِنَّآ أَعْطَيْنَا',
    question: 'Berapa Alif panjang bacaan Mad Wajib Muttashil dan Mad Jaiz Munfashil menurut halaman 27 buku?',
    options: [
      '2½ Alif (5 harakat)',
      '1 Alif (2 harakat)',
      '3 Alif (6 harakat)',
      'Tanpa panjang suara'
    ],
    correct: '2½ Alif (5 harakat)',
    explanation:
      'Sesuai Pelajaran ke-13 (Hal. 27): Panjangnya Mad Wajib Muttashil dan Mad Jaiz Munfashil (serta Mad Shilah Thawilah) adalah 2½ Alif (5 harakat).'
  },
  {
    id: 'q13',
    bab: "Pelajaran ke-13 · Mad Lazim Harfi (Hal. 33)",
    verseArabic: 'طٰهٰ · يٰسٓ · حٰمٓ · الٓرٰ',
    highlightWord: 'طٰهٰ',
    question: 'Berapa jumlah huruf Mad Lazim Mukhaffaf Harfi yang dibaca panjang 1 (satu) Alif, dan apa saja hurufnya?',
    options: [
      '5 huruf: ح ي ط هـ ر',
      '8 huruf: ن ق ص ع س ل ك م',
      '7 huruf: خ ص ض ط ظ غ ق',
      '6 huruf: ء ح خ ع غ هـ'
    ],
    correct: '5 huruf: ح ي ط هـ ر',
    explanation:
      "Sesuai Halaman 33 Buku: Mad Lazim Mukhaffaf Harfi dibaca panjang 1 (satu) Alif dan berjumlah 5 huruf (ح ي ط هـ ر), sedangkan Mad Lazim Musyba' Harfi panjangnya 3 Alif dan berjumlah 8 huruf (ن ق ص ع س ل ك م)."
  },
  {
    id: 'q14',
    bab: 'Pelajaran ke-13 · Ke-10 & Ke-13 (Hal. 32 & 34)',
    verseArabic: 'قُلْ آللَّهُ · قُلْ آلذَّكَرَيْنِ',
    highlightWord: 'قُلْ آللَّهُ',
    question: 'Mad Badal bertemu tasydid dengan panjang 3 (tiga) Alif seperti pada contoh di atas dinamakan:',
    options: [
      'Mad Farq',
      'Mad Lazim Mukhaffaf Kalimi',
      'Mad Tamkin',
      "Mad 'Iwadh"
    ],
    correct: 'Mad Farq',
    explanation:
      'Sesuai Pelajaran ke-13 Ke-13 (Hal. 34): Mad Badal bertemu tasydid dinamakan Mad Farq (panjang 3 Alif), sedangkan Mad Badal bertemu Sukun (آلْآنَ) dinamakan Mad Lazim Mukhaffaf Kalimi (Hal. 32).'
  }
];

// ============================================================================
// PLACEHOLDER-PROTECTED TAJWID HIGHLIGHTING & OCCURRENCE ENGINE
// (Aligned 100% with Pelajaran 1–13 of Ilmu Tajwid Praktis — Metode Qira'ati)
// ============================================================================

export interface TajwidOccurrenceSummary {
  ruleId: string;
  nama: string;
  warna: string;
  hexColor: string;
  count: number;
  samples: string[];
}

interface TajwidToken {
  ruleId: string;
  warna: string;
  text: string;
}

/**
 * Internal tokenizer that detects Tajwid segments in priority order using
 * private-use Unicode placeholders (\uE000idx\uE001) so rules never nest or
 * corrupt generated HTML markup.
 */
function tokenizeTajwidText(arabicText: string): {
  tokenizedText: string;
  tokens: TajwidToken[];
} {
  const normalized = normalizeQuranicText(arabicText);

  const tokens: TajwidToken[] = [];
  const pushToken = (ruleId: string, warna: string, matchedText: string): string => {
    const idx = tokens.length;
    tokens.push({ ruleId, warna, text: matchedText });
    return `\uE000${idx}\uE001`;
  };

  const hasHarakat = /[\u0622\u064B-\u0653\u0670\u06E1\u06E2]/.test(normalized);
  let text = normalized;

  // Shaddah with optional harakat before or after (handles both Uthmani & NFC canonical order)
  const SHADDAH_SEQ = '[\\u064B-\\u0650]*\\u0651[\\u064B-\\u0650\\u0670]*';
  const NON_BOUNDARY = '[^\\s\\uE000\\uE001\\uE200\\uE201·۝&;<>]';

  // 1a. Mad Farq (Ke-13, Hal. 34): قُلْ آللَّهُ / ءَآللَّهُ / آلذَّكَرَيْنِ
  const madFarqRegex = new RegExp(
    `((?:ءَ)?\\u0622ل[لذ]${SHADDAH_SEQ}${NON_BOUNDARY}{0,6})`,
    'g'
  );
  text = text.replace(madFarqRegex, (m) => pushToken('mad-farq', 'tajwid-mad-lazim', m));

  // 1b. Mad Lazim Mukhaffaf Kalimi (Ke-10, Hal. 32): آلْآنَ / ءَآلْـَٰٔنَ
  text = text.replace(
    /((?:ءَ)?\u0622ل[\u0652\u06E1][^\s\uE000\uE001\uE200\uE201·۝&;<>]{1,6})/g,
    (m) => pushToken('mad-lazim-mukhaffaf-kalimi', 'tajwid-mad-lazim', m)
  );

  // 1c. Mad Lazim Mutsaqqal Kalimi (Ke-9, Hal. 32) & Musyba' Harfi (Ke-11, Hal. 33)
  const madLazimKalimiRegex = new RegExp(
    `(${NON_BOUNDARY}{0,5}(?:\\u0622|[\\u0653\\u06E4~])[اوى]?[^\\s\\uE000\\uE001\\uE200\\uE201·۝&;<>\\u064B-\\u0653\\u0670](?:${SHADDAH_SEQ}|[\\u0652\\u06E1])${NON_BOUNDARY}{0,3})`,
    'g'
  );
  text = text.replace(madLazimKalimiRegex, (m) => pushToken('mad-lazim', 'tajwid-mad-lazim', m));

  // Standalone Muqaththa'at letters with maddah (نٓ, قٓ, صٓ, الٓمٓ, كٓهٰيٰعٓصٓ)
  text = text.replace(
    /([المصقنطسعكهيرحٰ]{1,5}[\u0653\u06E4][المصقنطسعكهيرحٰ\u0653\u06E4]*)/g,
    (m) => pushToken('mad-lazim-musyba-harfi', 'tajwid-mad-lazim', m)
  );

  // 2a. Mad Shilah Thawilah (Ke-5, Hal. 29–30): Ha dhamir + maddah + Hamzah
  text = text.replace(
    /([^\s\uE000\uE001\uE200\uE201·۝&;<>]{0,4}ه[\u064F\u0650][\u06E5\u06E6]?[\u0653~]\s+[أإآء][\u064E\u064F\u0650]?)/g,
    (m) => pushToken('mad-shilah', 'tajwid-mad-shilah', m)
  );

  // 2b. Mad Jaiz Munfashil (Ke-2, Hal. 27–28): attached yā-ayyuhā / hā-ulā'i or word-end mad + Hamzah
  text = text.replace(
    /([يوه][\u064E]?\u0670[\u0653~][أؤإء][\u064E\u064F\u0650]?)/g,
    (m) => pushToken('mad-jaiz-munfasil', 'tajwid-mad', m)
  );
  text = text.replace(
    /([^\s\uE000\uE001\uE200\uE201·۝&;<>]{1,6}(?:\u0622|[\u0653~][\u0627\u0649\u06DF\u06E0]?)\s+[أإآء][\u064E\u064F\u0650]?)/g,
    (m) => pushToken('mad-jaiz-munfasil', 'tajwid-mad', m)
  );

  // 3. Mad Wajib Muttashil (Ke-1, Hal. 27–28): remaining آ + hamzah in same word, or internal maddah
  text = text.replace(
    /([^\s\uE000\uE001\uE200\uE201·۝&;<>]{0,5}(?:\u0622[ءئؤ]|[\u0653\u06E7~])[^\s\uE000\uE001\uE200\uE201·۝&;<>]{0,4})/g,
    (m) => pushToken('mad-wajib-muttasil', 'tajwid-mad', m)
  );

  // 4. Idzhar Wajib (Pelajaran ke-11, Hal. 23): the 4 exact words in the Qur'an
  const idzharWajibRegex = new RegExp(
    `((?:[ٱا]لد${SHADDAH_SEQ}|دُ)ن[\\u0652\\u06E1]?يَا|بُن[\\u0652\\u06E1]?يَ[اٰ]ن[\\u064B-\\u0652]*|صِن[\\u0652\\u06E1]?وَ[اٰ]ن[\\u064B-\\u0652]*|قِن[\\u0652\\u06E1]?وَ[اٰ]ن[\\u064B-\\u0652]*)`,
    'g'
  );
  text = text.replace(idzharWajibRegex, (m) => pushToken('idzhar-wajib', 'tajwid-izhar', m));

  // 5a. Lafadh Allah Tarqiq (Pelajaran ke-9, Hal. 20): preceded by kasrah (بِاللَّهِ / لِلَّهِ / بِسْمِ اللَّهِ)
  const lamTarqiqRegex = new RegExp(
    `((?:لِل[\\u064E\\u0651\\u0670]{1,3}هِ|بِ[ٱا]لل[\\u064E\\u0651\\u0670]{1,3}هِ)|[\\u0650]\\s+[ٱا]لل[\\u064E\\u0651\\u0670]{1,3}ه[\\u064E\\u064F\\u0650]?)`,
    'g'
  );
  text = text.replace(lamTarqiqRegex, (m) =>
    pushToken('lam-jalalah-tarqiq', 'tajwid-lafadz-allah', m)
  );

  // 5b. Lafadh Allah Tafkhim (Pelajaran ke-9, Hal. 20): remaining Allah (وَاللَّهُ / نَصْرُ اللَّهِ / ٱللَّهُ)
  const lamTafkhimRegex = new RegExp(
    `((?:[وف][\\u064E])?[ٱا]لل[\\u064E\\u0651\\u0670]{1,3}ه[\\u064E\\u064F\\u0650]?)`,
    'g'
  );
  text = text.replace(lamTafkhimRegex, (m) =>
    pushToken('lam-jalalah-tafkhim', 'tajwid-lafadz-allah', m)
  );

  // 6. Iqlab (Pelajaran ke-3 Bagian 3, Hal. 7): small meem + ب, or nun sukun/tanwin + ب
  text = text.replace(
    /((?:[^\s\uE000\uE001\uE200\uE201·۝&;<>]{0,2}[\u06E2\u06ED]\s*ب[\u064B-\u0652\u0670\u06E1]*)|(?:(?:[\u0627\u0649]?[\u064B\u064C\u064D][\u0627\u0649]?|ن[\u0652\u06E1])\s*ب[\u064B-\u0652\u0670\u06E1]*))/g,
    (m) => pushToken('iqlab', 'tajwid-iqlab', m)
  );

  // 7. Hukum Mim Sukun (Pelajaran ke-4, Hal. 13–14): Ikhfa' Syafawi & Idgham Mitsli
  if (hasHarakat) {
    text = text.replace(
      /(م[\u0652\u06E1]?\s+ب[\u064B-\u0652\u0670\u06E1]*)/g,
      (m) => pushToken('ikhfa-syafawi', 'tajwid-ikhfa-syafawi', m)
    );
    text = text.replace(
      /(م[\u0652\u06E1]?\s+م[\u064B-\u0651\u0670]*)/g,
      (m) => pushToken('idgham-mimi', 'tajwid-idgham-mimi', m)
    );
  }

  // 8. Idgham Bighunnah (ي و م ن) & Idgham Bilaghunnah (ل ر) across two words (skip Saktah \u06DC)
  if (hasHarakat) {
    text = text.replace(
      /((?:[\u0627\u0649]?[\u064B\u064C\u064D][\u0627\u0649]?|ن[\u0652\u06E1]?))\s+([يوملنر][\u064B-\u0651\u0670]*)/g,
      (full, p1: string, p2: string) => {
        if (p1.includes('\u06DC')) return full;
        const nextChar = p2[0];
        if (nextChar === 'ل' || nextChar === 'ر') {
          return pushToken('idgham-bilaghunnah', 'tajwid-idgham-bilaghunnah', full);
        }
        return pushToken('idgham-bighunnah', 'tajwid-idgham-bighunnah', full);
      }
    );
  }

  // 9. Idzhar (Pelajaran ke-3 Bagian 4, Hal. 8–11): Nun sukun/tanwin + [ءأإآحخعغه]
  text = text.replace(
    /((?:[\u0627\u0649]?[\u064B\u064C\u064D][\u0627\u0649]?\s+|ن[\u0652\u06E1]\s*)[ءأإآحخعغه][\u064B-\u0652\u0670\u06E1]*)/g,
    (m) => pushToken('izhar-halqi', 'tajwid-izhar', m)
  );

  // 10. Ikhfa' (Pelajaran ke-3 Bagian 5, Hal. 11–12): Nun sukun/tanwin + 15 huruf Ikhfa'
  if (hasHarakat) {
    text = text.replace(
      /((?:[\u0627\u0649]?[\u064B\u064C\u064D][\u0627\u0649]?|ن[\u0652\u06E1]?)\s*[تثجدذزسشصضطظفقك][\u064B-\u0652\u0670\u06E1]*)/g,
      (m) => pushToken('ikhfa', 'tajwid-ikhfa', m)
    );
  }

  // 11a. Idgham Mutajanisain (Pelajaran ke-6, Hal. 16–17): ت-ط, ط-ت, ت-د, د-ت, ل-ر, ذ-ظ
  if (hasHarakat) {
    text = text.replace(
      /((?:ت[\u0652\u06E1]?\s*ط|ط[\u0652\u06E1]?\s*ت|ت[\u0652\u06E1]?\s*د|د[\u0652\u06E1]?\s+ت|ل[\u0652\u06E1]?\s+ر|ذ[\u0652\u06E1]?\s+ظ)[\u064B-\u0651\u0670]*)/g,
      (full) => {
        if (full.includes('\u06DC')) return full;
        if (!/[\u0652\u06E1\u0651]/.test(full)) return full;
        return pushToken('idgham-mutajanisain', 'tajwid-idgham-bilaghunnah', full);
      }
    );

    // 11b. Idgham Mutaqarribain (Pelajaran ke-7, Hal. 17–18): ث-ذ, ق-ك, ب-م
    text = text.replace(
      /((?:ث[\u0652\u06E1]?\s+ذ|ق[\u0652\u06E1]?\s*ك|ب[\u0652\u06E1]?\s+م)[\u064B-\u0651\u0670]*)/g,
      (full) => {
        if (!/[\u0652\u06E1\u0651]/.test(full)) return full;
        return pushToken('idgham-mutaqaribain', 'tajwid-idgham-bilaghunnah', full);
      }
    );

    // 11c. Idgham Mutamatsilain (Pelajaran ke-5 & Hal. 35): identical consonant across word boundary (excluding م, ن, و, ي)
    text = text.replace(
      /(([بتثجحخدذرزسشصضطظعغفقكله])[\u0652\u06E1]?\s+\2[\u064B-\u0651\u0670]*)/g,
      (full) => {
        if (full.includes('\u06DC')) return full;
        if (!/[\u0652\u06E1\u0651]/.test(full)) return full;
        return pushToken('idgham-mutamatsilain', 'tajwid-idgham-bilaghunnah', full);
      }
    );
  }

  // 12. Ghunnah (Pelajaran ke-1, Hal. 1): Nun Tasydid (نّ) or Mim Tasydid (مّ)
  const ghunnahRegex = new RegExp(`([نم]${SHADDAH_SEQ})`, 'g');
  text = text.replace(ghunnahRegex, (m) => pushToken('ghunnah', 'tajwid-ghunnah', m));

  // 13. Al Syamsiyah (Pelajaran ke-10, Hal. 22)
  const syamsiyahRegex = new RegExp(`([ٱا]ل[تثدذرزسشصضطظل]${SHADDAH_SEQ})`, 'g');
  text = text.replace(syamsiyahRegex, (m) =>
    pushToken('al-syamsiyah', 'tajwid-al-syamsiyah', m)
  );

  // 14a. Qalqalah Shughra (Pelajaran ke-8, Hal. 19): [قطبجد] with explicit sukun (ْ / ۡ)
  text = text.replace(
    /([قطبجد][\u0652\u06E1])/g,
    (m) => pushToken('qalqalah', 'tajwid-qalqalah', m)
  );

  // 14b. Qalqalah Kubra (Pelajaran ke-8, Hal. 19): at end of verse or segment
  if (hasHarakat) {
    text = text.replace(
      /([قطبجد][\u064B-\u0651\u0670]*)(?=\s*(?:$|·|۝))/g,
      (m) => pushToken('qalqalah-kubra', 'tajwid-qalqalah', m)
    );
  }

  // 15a. Mad Tamkin (Pelajaran ke-13 Ke-7, Hal. 30): Ya kasrah bertasydid + Ya sukun
  const madTamkinRegex = new RegExp(`(ي${SHADDAH_SEQ}[\\u064A\\u06E6][\\u0652\\u06E1]?)`, 'g');
  text = text.replace(madTamkinRegex, (m) => pushToken('mad-tamkin', 'tajwid-mad-shilah', m));

  // 15b. Mad Shilah Qashirah (Pelajaran ke-13 Ke-5, Hal. 29): Uthmani small waw (ۥ) or small yeh (ۦ) after Ha dhamir
  text = text.replace(
    /(ه[\u064F\u0650][\u06E5\u06E6])/g,
    (m) => pushToken('mad-shilah', 'tajwid-mad-shilah', m)
  );

  return { tokenizedText: text, tokens };
}

export interface RenderTajwidOptions {
  showGharib?: boolean;
  surahNomor?: number;
  ayahNomor?: number;
}

/**
 * Intelligent helper to colorize Arabic Quran text according to Pelajaran 1–13
 * of Ilmu Tajwid Praktis (Qira'ati) and optional Riwayat Hafsh Gharib markers,
 * with strict XSS escaping and non-nested placeholder protection.
 */
export function renderTajwidHtml(
  arabicText: string,
  showTajwid: boolean = true,
  options?: RenderTajwidOptions
): string {
  const safeInput = escapeHtml(arabicText);
  const normalized = normalizeQuranicText(safeInput);

  if (!showTajwid && !options?.showGharib) {
    return normalized;
  }

  let working = normalized;
  let gharibTokens: ReturnType<typeof extractGharibPlaceholders>['tokens'] = [];

  if (options?.showGharib) {
    const extracted = extractGharibPlaceholders(
      working,
      options.surahNomor,
      options.ayahNomor
    );
    gharibTokens = extracted.tokens;
    // Remap Gharib placeholders from \uE000N\uE001 to \uE200N\uE201 so they never collide with Tajwid tokens
    working = extracted.textWithPlaceholders.replace(/\uE000(\d+)\uE001/g, '\uE200$1\uE201');
  }

  if (showTajwid) {
    const { tokenizedText, tokens } = tokenizeTajwidText(working);
    working = tokenizedText.replace(/\uE000(\d+)\uE001/g, (_, idxStr: string) => {
      const token = tokens[Number(idxStr)];
      if (!token) return '';
      if (token.ruleId === 'ghunnah') {
        return `<span class="tajwid-ghunnah">${token.text}</span>`;
      }
      return `<span class="${token.warna}" data-tajwid="${token.ruleId}">${token.text}</span>`;
    });
  }

  if (options?.showGharib && gharibTokens.length > 0) {
    working = working.replace(/\uE200(\d+)\uE201/g, (_, idxStr: string) => {
      const gtok = gharibTokens[Number(idxStr)];
      if (!gtok) return '';
      const safeTitle = escapeHtml(`${gtok.kategoriNama}: ${gtok.caraBacaSingkat}`);
      return `<span class="gharib-mark ${gtok.warnaClass}" data-gharib="${gtok.kategoriId}" title="${safeTitle}">${gtok.segment}</span>`;
    });
  }

  return working;
}

/**
 * Analyzes an Arabic verse/passage and returns grouped Tajwid rule occurrences
 * in order of appearance for the interactive Tajwid Lab & Inspector.
 */
export function analyzeTajwidOccurrences(arabicText: string): TajwidOccurrenceSummary[] {
  const { tokens } = tokenizeTajwidText(arabicText);
  const grouped = new Map<string, TajwidOccurrenceSummary>();

  for (const tok of tokens) {
    const rule = getTajwidRuleById(tok.ruleId);
    if (!rule) continue;
    const existing = grouped.get(rule.id);
    if (existing) {
      existing.count += 1;
      if (existing.samples.length < 4 && !existing.samples.includes(tok.text.trim())) {
        existing.samples.push(tok.text.trim());
      }
    } else {
      grouped.set(rule.id, {
        ruleId: rule.id,
        nama: rule.nama,
        warna: tok.warna,
        hexColor: rule.hexColor,
        count: 1,
        samples: [tok.text.trim()]
      });
    }
  }

  return Array.from(grouped.values());
}
