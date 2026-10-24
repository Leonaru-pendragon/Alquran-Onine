/**
 * Data & Kaidah Bacaan Gharib (Musykilat Al-Qur'an)
 * Berdasarkan Riwayat Hafsh 'an 'Ashim melalui Thariq Syathibiyyah
 * Sesuai Standar Mushaf Al-Qur'an Kementerian Agama Republik Indonesia (Kemenag RI).
 */

export type GharibCategoryId =
  | 'semua'
  | 'imalah'
  | 'isymam'
  | 'tashil'
  | 'naql'
  | 'saktah'
  | 'shifr'
  | 'nun_wiqayah'
  | 'shad_khusus';

export interface GharibCategory {
  id: Exclude<GharibCategoryId, 'semua'>;
  nama: string;
  istilahArab: string;
  ringkasan: string;
  pengertian: string;
  pedomanPraktis: string;
}

export interface GharibVerseItem {
  id: string;
  kategoriId: Exclude<GharibCategoryId, 'semua'>;
  kategoriNama: string;
  judul: string;
  surahNomor: number;
  surahNamaLatin: string;
  ayahNomor: number;
  lafazhArab: string;
  potonganAyatArab: string;
  caraBacaLatin: string;
  hindariBacaan?: string;
  panduanBaca: string;
  penjelasanKaidah: string;
}

export interface GharibQuizQuestion {
  id: string;
  topik: 'Tajwid' | 'Gharib';
  verseArabic: string;
  reference: string;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export const GHARIB_CATEGORIES: GharibCategory[] = [
  {
    id: 'imalah',
    nama: 'Imalah',
    istilahArab: 'الإمالة',
    ringkasan: 'Memiringkan bunyi fathah ke arah kasrah (vokal "e" seperti kata sate/sore).',
    pengertian:
      'Secara bahasa Imalah berarti memiringkan atau membengkokkan. Secara istilah qiraat, Imalah Kubra adalah memiringkan bunyi harakat fathah mendekati kasrah dan memiringkan alif mendekati ya, sehingga terdengar seperti vokal "e" pada kata "sate" atau "sore".',
    pedomanPraktis:
      'Dalam Riwayat Hafsh \'an \'Ashim hanya terdapat pada 1 tempat di seluruh Al-Qur\'an, yaitu QS. Hud [11]: 41 pada kata مَجْرَىٰهَا (dibaca Majrēhā).'
  },
  {
    id: 'isymam',
    nama: 'Isymam',
    istilahArab: 'الإشمام',
    ringkasan: 'Memonyongkan kedua bibir di tengah dengung nun tasydid tanpa suara dhammah.',
    pengertian:
      'Isymam adalah memonyongkan kedua bibir ke depan (seperti posisi mengucapkan dhammah "u") sesaat setelah huruf disukunkan atau di tengah dengung idgham, tanpa mengeluarkan bunyi suara dhammah sedikit pun, sebagai isyarat bahwa asal huruf tersebut berharakat dhammah.',
    pedomanPraktis:
      'Hanya terdapat 1 tempat wajib dalam Riwayat Hafsh, yakni QS. Yusuf [12]: 11 pada lafazh لَا تَأْمَنَّا (asal katanya لَا تَأْمَنُنَا). Isyarat bibir ini hanya terlihat oleh mata guru (talaqqi), tidak mengubah bunyi suara dengung.'
  },
  {
    id: 'tashil',
    nama: 'Tashil',
    istilahArab: 'التسهيل',
    ringkasan: 'Meringankan bunyi hamzah kedua di antara bunyi hamzah dan alif.',
    pengertian:
      'Tashil menurut bahasa artinya memudahkan atau meringankan. Ketika dua hamzah qatha\' berharakat fathah bertemu berurutan dalam satu kata, hamzah pertama dibaca tegas sedangkan hamzah kedua dibaca lunak (antara hamzah dan huruf mad alif).',
    pedomanPraktis:
      'Hanya terdapat 1 tempat wajib dalam Riwayat Hafsh, yaitu QS. Fussilat [41]: 44 pada lafazh ءَأَعْجَمِىٌّ (dibaca A-a\'jamiyyun lembut pada hamzah kedua, bukan hentakan keras dan bukan pula huruf Ha).'
  },
  {
    id: 'naql',
    nama: 'Naql',
    istilahArab: 'النقل',
    ringkasan: 'Memindahkan harakat kasrah hamzah ke huruf lam sukun sebelumnya.',
    pengertian:
      'Naql berarti memindahkan harakat suatu huruf hidup ke huruf sukun sebelumnya untuk memudahkan pengucapan dua hamzah washal yang mengapit huruf lam ta\'rif.',
    pedomanPraktis:
      'Hanya terdapat 1 tempat dalam Riwayat Hafsh, yaitu QS. Al-Hujurat [49]: 11 pada lafazh بِئْسَ ٱلِٱسْمُ sehingga dibaca Bi\'sal-ismu (bukan bi\'sal-al-ismu).'
  },
  {
    id: 'saktah',
    nama: 'Saktah (4 Tempat)',
    istilahArab: 'السكتة',
    ringkasan: 'Berhenti sejenak ±2 harakat tanpa mengambil napas baru lalu melanjutkan bacaan.',
    pengertian:
      'Saktah adalah memutus suara sejenak sekira 2 harakat tanpa bernapas (menahan napas tetap di dalam) dengan niat langsung melanjutkan bacaan pada kata sesudahnya. Pada Mushaf Standar Indonesia ditandai dengan huruf Sin kecil (س / سكتة).',
    pedomanPraktis:
      'Terdapat 4 ayat Saktah wajib menurut Riwayat Hafsh Thariq Syathibiyyah: QS. Al-Kahf [18]: 1–2, QS. Yasin [36]: 52, QS. Al-Qiyamah [75]: 27, dan QS. Al-Muthaffifin [83]: 14.'
  },
  {
    id: 'shifr',
    nama: 'Shifr Mustadir & Mustathil',
    istilahArab: 'الصفر المستدير والمستطيل',
    ringkasan: 'Tanda bulatan kecil bundar (0) dan lonjong di atas huruf alif tambahan.',
    pengertian:
      'Shifr Mustadir (bulat bundar sempurna ۟) menandakan huruf alif tidak dibaca panjang baik ketika washal maupun waqaf. Sedangkan Shifr Mustathil (bulat lonjong berdiri ۠) menandakan alif dibaca pendek ketika washal (disambung), tetapi dibaca panjang 2 harakat ketika waqaf (berhenti).',
    pedomanPraktis:
      'Perhatikan bentuk bulatan di atas alif: bulat bundar = selalu pendek; bulat lonjong (seperti pada kata أَنَا۠ "Aku") = pendek saat disambung, panjang 2 harakat hanya jika berhenti.'
  },
  {
    id: 'nun_wiqayah',
    nama: 'Nun Wiqayah (Nun Kecil)',
    istilahArab: 'نون الوقاية',
    ringkasan: 'Munculnya bunyi "ni" saat tanwin disambung dengan Hamzah Washal.',
    pengertian:
      'Nun Wiqayah (disebut juga Nun \'Iwadh atau Nun Washal) adalah huruf nun berharakat kasrah (نِ) yang muncul untuk menjaga bunyi tanwin ketika bertemu Hamzah Washal (ٱ) agar tidak terjadi pertemuan dua huruf sukun.',
    pedomanPraktis:
      'Pada Mushaf Indonesia kerap diberi tanda huruf ن kecil di bawah hamzah washal. Tanwin diubah menjadi vokal tunggal lalu ditambah bunyi "ni" saat disambung.'
  },
  {
    id: 'shad_khusus',
    nama: 'Shad/Sin & Lafazh Khusus',
    istilahArab: 'فرش الحروف والكلمات الخاصة',
    ringkasan: 'Huruf Shad bertanda Sin kecil, Dhad tiga wajah/dua wajah, Idgham Ba ke Mim, & Ibtida\' khusus.',
    pengertian:
      'Mencakup kalimat-kalimat khusus dalam rasm Utsmani yang penulisannya berbeda dari bunyi bacaannya menurut Riwayat Hafsh, seperti huruf Shad yang ditulis dengan tanda Sin kecil di atas/bawahnya, variasi harakat Dhad pada QS. Ar-Rum: 54, serta kaidah ibtida\' pada QS. Al-Ahqaf: 4.',
    pedomanPraktis:
      'Jika huruf Sin kecil berada di ATAS Shad, maka wajib dibaca Sin (س). Jika di BAWAH Shad (Ath-Thur: 37), boleh Shad atau Sin (Shad lebih utama).'
  }
];

export const GHARIB_ITEMS: GharibVerseItem[] = [
  // 1. IMALAH
  {
    id: 'gharib-imalah-hud-41',
    kategoriId: 'imalah',
    kategoriNama: 'Imalah',
    judul: 'Imalah Kubra pada Lafazh Majreehaa',
    surahNomor: 11,
    surahNamaLatin: 'Hud',
    ayahNomor: 41,
    lafazhArab: 'مَجْرَىٰهَا',
    potonganAyatArab: 'بِسْمِ ٱللَّهِ مَجْرَىٰهَا وَمُرْسَىٰهَآ ۚ إِنَّ رَبِّى لَغَفُورٌ رَّحِيمٌ',
    caraBacaLatin: 'Bismillāhi majrēhā wa mursāhā',
    hindariBacaan: 'Jangan dibaca fathah murni "majrāhā" atau kasrah murni "majrīhā"',
    panduanBaca:
      'Huruf Ra pada kata مَجْرَىٰهَا dibaca miring antara "a" dan "i" menjadi bunyi "e" taling (seperti kata "sate" atau "sore") sepanjang 2 harakat: Majrēhā, sedangkan Ra sebelumnya sukun dibaca tipis (tarqiq).',
    penjelasanKaidah:
      'Satu-satunya bacaan Imalah dalam Riwayat Hafsh \'an \'Ashim. Pada Mushaf Kemenag RI terdapat tulisan kecil "إمالة" di bawah huruf Ra.'
  },

  // 2. ISYMAM
  {
    id: 'gharib-isymam-yusuf-11',
    kategoriId: 'isymam',
    kategoriNama: 'Isymam',
    judul: 'Isymam pada Lafazh Laa Ta\'mannaa',
    surahNomor: 12,
    surahNamaLatin: 'Yusuf',
    ayahNomor: 11,
    lafazhArab: 'لَا تَأْمَنَّا',
    potonganAyatArab: 'قَالُوا۟ يَٰٓأَبَانَا مَا لَكَ لَا تَأْمَنَّا عَلَىٰ يُوسُفَ وَإِنَّا لَهُۥ لَنَٰصِحُونَ',
    caraBacaLatin: 'Mā laka lā ta\'mannā \'alā Yūsufa (bibir dimonyongkan saat dengung nun)',
    hindariBacaan: 'Jangan mengeluarkan bunyi vokal "u" (bukan ta\'manunnā yang terdengar u-nya)',
    panduanBaca:
      'Tahan dengung (ghunnah) pada huruf Nun bertasydid selama 2–3 harakat sambil memonyongkan kedua bibir ke depan sesaat tanpa mengubah suara dengung, lalu kembalikan bibir ke posisi fathah "nā".',
    penjelasanKaidah:
      'Asal katanya adalah لَا تَأْمَنُنَا (Nun pertama dhammah sebagai marfu\'). Isyarat monyong bibir menampakkan harakat dhammah yang tersembunyi karena diidghamkan.'
  },

  // 3. TASHIL
  {
    id: 'gharib-tashil-fussilat-44',
    kategoriId: 'tashil',
    kategoriNama: 'Tashil',
    judul: 'Tashil Hamzah Kedua pada Lafazh A-a\'jamiyyun',
    surahNomor: 41,
    surahNamaLatin: 'Fussilat',
    ayahNomor: 44,
    lafazhArab: 'ءَأَعْجَمِىٌّ',
    potonganAyatArab: 'لَّقَالُوا۟ لَوْلَا فُصِّلَتْ ءَايَٰتُهُۥٓ ۖ ءَأَعْجَمِىٌّ وَعَرَبِىٌّ',
    caraBacaLatin: 'A-a\'jamiyyuw wa \'arabiyy (hamzah kedua dilunakkan)',
    hindariBacaan: 'Jangan membaca hamzah kedua tegas keras "A\'a\'jamiyyun" atau menjadi huruf Ha "Aha\'jamiyyun"',
    panduanBaca:
      'Ucapkan hamzah pertama dengan jelas (A), lalu lunakkan hamzah kedua di antara bunyi hamzah dan alif secara ringan tanpa hentakan tenggorokan keras, baru masuk ke huruf \'Ain sukun.',
    penjelasanKaidah:
      'Satu-satunya bacaan Tashil wajib dalam Riwayat Hafsh. Pada Mushaf Kemenag RI ditandai bulatan penuh kecil di atas alif kedua dan keterangan "تسهيل".'
  },

  // 4. NAQL
  {
    id: 'gharib-naql-hujurat-11',
    kategoriId: 'naql',
    kategoriNama: 'Naql',
    judul: 'Naql pada Lafazh Bi\'sal-ismu',
    surahNomor: 49,
    surahNamaLatin: 'Al-Hujurat',
    ayahNomor: 11,
    lafazhArab: 'بِئْسَ ٱلِٱسْمُ',
    potonganAyatArab: 'وَلَا تَنَابَزُوا۟ بِٱلْأَلْقَٰبِ ۖ بِئْسَ ٱلِٱسْمُ ٱلْفُسُوقُ بَعْدَ ٱلْإِيمَٰنِ',
    caraBacaLatin: 'Bi\'sal-ismul-fusūqu ba\'dal-īmān',
    hindariBacaan: 'Jangan dibaca "Bi\'sal-al-ismu" atau mengkasrahkan ba/sin secara keliru',
    panduanBaca:
      'Sambungkan huruf Sin berharakat fathah pada بِئْسَ langsung ke Lam berharakat kasrah pada ٱلِٱسْمُ sehingga berbunyi "Bi\'sal-ismu". Jika memulai (ibtida\') tepat dari kata ٱلِٱسْمُ saja, boleh dibaca "Al-ismu" atau "Lismu".',
    penjelasanKaidah:
      'Harakat kasrah dari hamzah kata اسم dipindahkan ke huruf Lam ta\'rif sebelumnya agar tidak bertemu dua sukun di antara dua hamzah washal.'
  },

  // 5. SAKTAH (4 TEMPAT WAJIB)
  {
    id: 'gharib-saktah-kahf-1',
    kategoriId: 'saktah',
    kategoriNama: 'Saktah (4 Tempat)',
    judul: 'Saktah Pertama: QS. Al-Kahf Ayat 1 ke Ayat 2',
    surahNomor: 18,
    surahNamaLatin: 'Al-Kahf',
    ayahNomor: 1,
    lafazhArab: 'عِوَجَا ۜ ﴿١﴾ قَيِّمًا',
    potonganAyatArab: 'وَلَمْ يَجْعَل لَّهُۥ عِوَجَا ۜ ﴿١﴾ قَيِّمًا لِّيُنذِرَ بَأْسًا شَدِيدًا',
    caraBacaLatin: 'Wa lam yaj\'al lahū \'iwajā [berhenti 2 harakat tanpa napas] qayyimal liyunżira',
    hindariBacaan: 'Jika menyambung ke ayat 2 tanpa waqaf napas, jangan di-ikhfa-kan menjadi "\'iwajang-qayyiman"',
    panduanBaca:
      'Apabila pembaca menyambung ayat 1 ke ayat 2, baca عِوَجَا panjang 2 harakat (Mad \'Iwadh), tahan suara 2 harakat tanpa mengambil napas, lalu lanjutkan قَيِّمًا. Namun jika berhenti waqaf sempurna & mengambil napas di akhir ayat 1, maka cukup waqaf biasa.',
    penjelasanKaidah:
      'Saktah ini menjaga kesucian makna Al-Qur\'an agar kata قَيِّمًا ("yang lurus") tidak terdengar menjadi sifat bagi عِوَجَا ("kebengkokan").'
  },
  {
    id: 'gharib-saktah-yasin-52',
    kategoriId: 'saktah',
    kategoriNama: 'Saktah (4 Tempat)',
    judul: 'Saktah Kedua: QS. Yasin Ayat 52',
    surahNomor: 36,
    surahNamaLatin: 'Yasin',
    ayahNomor: 52,
    lafazhArab: 'مِّن مَّرْقَدِنَا ۜ ۗ هَٰذَا',
    potonganAyatArab: 'قَالُوا۟ يَٰوَيْلَنَا مَنۢ بَعَثَنَا مِن مَّرْقَدِنَا ۜ ۗ هَٰذَا مَا وَعَدَ ٱلرَّحْمَٰنُ',
    caraBacaLatin: 'Mim marqadinā [berhenti 2 harakat tanpa napas] hāżā mā wa\'adar-raḥmānu',
    panduanBaca:
      'Jika melanjutkan bacaan melewati kata مَرْقَدِنَا, berhentilah sejenak ±2 harakat tanpa mengambil napas sebelum mengucapkan هَٰذَا. Jika memilih waqaf sempurna (berhenti dan bernapas) karena ada tanda waqaf jaiz/aula, maka berlaku hukum waqaf biasa.',
    penjelasanKaidah:
      'Memisahkan keluhan orang-orang kafir saat dibangkitkan ("Siapakah yang membangkitkan kami dari tempat tidur kami?") dengan jawaban penegas ("Inilah yang dijanjikan Tuhan Yang Maha Pengasih").'
  },
  {
    id: 'gharib-saktah-qiyamah-27',
    kategoriId: 'saktah',
    kategoriNama: 'Saktah (4 Tempat)',
    judul: 'Saktah Ketiga: QS. Al-Qiyamah Ayat 27',
    surahNomor: 75,
    surahNamaLatin: 'Al-Qiyamah',
    ayahNomor: 27,
    lafazhArab: 'وَقِيلَ مَنْ ۜ رَاقٍ',
    potonganAyatArab: 'وَقِيلَ مَنْ ۜ رَاقٍ',
    caraBacaLatin: 'Wa qīla man [berhenti 2 harakat tanpa napas] rāq',
    hindariBacaan: 'Jangan dilebur (idgham bilaghunnah) menjadi "wa qīla marrāq"',
    panduanBaca:
      'Ucapkan huruf Nun sukun pada مَنْ dengan jelas (izhar), tahan suara sejenak ±2 harakat tanpa bernapas, kemudian ucapkan رَاقٍ.',
    penjelasanKaidah:
      'Mencegah meleburnya Nun ke Ra menjadi "marrāq" (yang berarti tukang pembuat kuah/kaldu), sehingga tetap jelas dua kata: مَنْ ("siapakah") dan رَاقٍ ("yang dapat menyembuhkan/meruqyah").'
  },
  {
    id: 'gharib-saktah-muthaffifin-14',
    kategoriId: 'saktah',
    kategoriNama: 'Saktah (4 Tempat)',
    judul: 'Saktah Keempat: QS. Al-Muthaffifin Ayat 14',
    surahNomor: 83,
    surahNamaLatin: 'Al-Muthaffifin',
    ayahNomor: 14,
    lafazhArab: 'كَلَّا ۖ بَلْ ۜ رَانَ',
    potonganAyatArab: 'كَلَّا ۖ بَلْ ۜ رَانَ عَلَىٰ قُلُوبِهِم مَّا كَانُوا۟ يَكْسِبُونَ',
    caraBacaLatin: 'Kallā bal [berhenti 2 harakat tanpa napas] rāna \'alā qulūbihim',
    hindariBacaan: 'Jangan dilebur menjadi "barrāna"',
    panduanBaca:
      'Jelaskan bunyi Lam sukun pada بَلْ, berhenti sejenak ±2 harakat tanpa mengambil napas, lalu lanjutkan membaca رَانَ.',
    penjelasanKaidah:
      'Mencegah peleburan Lam sukun ke huruf Ra menjadi "barrāna", agar tetap tegas terpisah antara بَلْ ("bahkan/tetapi") dan رَانَ ("telah menutupi/berkarat").'
  },

  // 6. SHIFR MUSTADIR & SHIFR MUSTATHIL
  {
    id: 'gharib-shifr-kahf-23',
    kategoriId: 'shifr',
    kategoriNama: 'Shifr Mustadir & Mustathil',
    judul: 'Shifr Mustadir (Bulat Bundar) pada Lafazh Lisyai\'in',
    surahNomor: 18,
    surahNamaLatin: 'Al-Kahf',
    ayahNomor: 23,
    lafazhArab: 'لِشَا۟ىْءٍ',
    potonganAyatArab: 'وَلَا تَقُولَنَّ لِشَا۟ىْءٍ إِنِّى فَاعِلٌ ذَٰلِكَ غَدًا',
    caraBacaLatin: 'Wa lā taqūlanna lisyai\'in innī fā\'ilun żālika ghadā',
    hindariBacaan: 'Jangan dipanjangkan huruf Syin-nya menjadi "lisyāi\'in"',
    panduanBaca:
      'Meskipun tertulis huruf Alif sesudah huruf Syin, di atasnya terdapat Shifr Mustadir (bulatan kecil bundar), sehingga Syin langsung masuk ke Ya\' sukun (lin): lisyai\'in.',
    penjelasanKaidah:
      'Shifr Mustadir menandakan huruf tambahan dalam rasm Utsmani yang gugur bacaannya baik saat disambung (washal) maupun saat berhenti (waqaf).'
  },
  {
    id: 'gharib-shifr-rum-39',
    kategoriId: 'shifr',
    kategoriNama: 'Shifr Mustadir & Mustathil',
    judul: 'Shifr Mustadir pada Lafazh Liyarbuwa',
    surahNomor: 30,
    surahNamaLatin: 'Ar-Rum',
    ayahNomor: 39,
    lafazhArab: 'لِّيَرْبُوَا۟',
    potonganAyatArab: 'وَمَآ ءَاتَيْتُم مِّن رِّبًا لِّيَرْبُوَا۟ فِىٓ أَمْوَٰلِ ٱلنَّاسِ فَلَا يَرْبُوا۟ عِندَ ٱللَّهِ',
    caraBacaLatin: 'Liyarbuwa fī amwālin-nāsi (Wawu pendek 1 harakat)',
    hindariBacaan: 'Jangan memanjangkan huruf Wawu menjadi "liyarbuwā"',
    panduanBaca:
      'Huruf Wawu berharakat fathah dibaca pendek satu ketukan (liyarbuwa) karena Alif sesudahnya bertanda Shifr Mustadir (bulat bundar).',
    penjelasanKaidah:
      'Alif sesudah wawu pada kata kerja tunggal ini adalah alif rasm yang tidak berfungsi sebagai huruf mad.'
  },
  {
    id: 'gharib-shifr-insan-4',
    kategoriId: 'shifr',
    kategoriNama: 'Shifr Mustadir & Mustathil',
    judul: 'Lafazh Salaasilaa (Dua Wajah saat Waqaf)',
    surahNomor: 76,
    surahNamaLatin: 'Al-Insan',
    ayahNomor: 4,
    lafazhArab: 'سَلَٰسِلَا۟',
    potonganAyatArab: 'إِنَّآ أَعْتَدْنَا لِلْكَٰفِرِينَ سَلَٰسِلَا۟ وَأَغْلَٰلًا وَسَعِيرًا',
    caraBacaLatin: 'Washal: salāsila wa aghlālan (pendek) · Waqaf: salāsil atau salāsilā',
    panduanBaca:
      'Jika disambung (washal) wajib dibaca pendek: salāsila wa aghlālan. Jika terpaksa berhenti (waqaf) pada kata tersebut, menurut Riwayat Hafsh boleh dua cara: disukunkan Lam-nya (salāsil — lebih utama) atau dibaca panjang 2 harakat (salāsilā).',
    penjelasanKaidah:
      'Termasuk kalimat khusus di Surah Al-Insan ayat 4 yang memiliki dua wajah bacaan ketika waqaf dalam jalur Syathibiyyah.'
  },
  {
    id: 'gharib-shifr-insan-15-16',
    kategoriId: 'shifr',
    kategoriNama: 'Shifr Mustadir & Mustathil',
    judul: 'Perbedaan Dua Lafazh Qawaariiraa (Ayat 15 vs Ayat 16)',
    surahNomor: 76,
    surahNamaLatin: 'Al-Insan',
    ayahNomor: 15,
    lafazhArab: 'قَوَارِيرَا۠ ﴿١٥﴾ قَوَارِيرَا۟',
    potonganAyatArab: 'كَانَتْ قَوَارِيرَا۠ ﴿١٥﴾ قَوَارِيرَا۟ مِن فِضَّةٍ قَدَّرُوهَا تَقْدِيرًا',
    caraBacaLatin: 'Ayat 15 (waqaf): qawārīrā (2 harakat) · Ayat 16 (washal/waqaf): pendek (qawārīra / qawārīr)',
    panduanBaca:
      'Pada akhir ayat 15 (Shifr Mustathil lonjong): bila berhenti dibaca panjang 2 harakat (qawārīrā), bila disambung pendek (qawārīra). Sedangkan pada awal ayat 16 (Shifr Mustadir bundar): dibaca pendek saat disambung (qawārīra min fiḍḍah) dan sukun bila berhenti (qawārīr).',
    penjelasanKaidah:
      'Pasangan ayat terbaik untuk memahami kontras langsung antara Shifr Mustathil (lonjong di akhir ayat 15) dan Shifr Mustadir (bundar di awal ayat 16).'
  },
  {
    id: 'gharib-shifr-kafirun-4',
    kategoriId: 'shifr',
    kategoriNama: 'Shifr Mustadir & Mustathil',
    judul: 'Shifr Mustathil (Lonjong) pada Semua Lafazh "Ana" (أَنَا۠)',
    surahNomor: 109,
    surahNamaLatin: 'Al-Kafirun',
    ayahNomor: 4,
    lafazhArab: 'وَلَآ أَنَا۠ عَابِدٌ',
    potonganAyatArab: 'وَلَآ أَنَا۠ عَابِدٌ مَّا عَبَدتُّمْ',
    caraBacaLatin: 'Washal: wa lā ana \'ābidum (Nun pendek!) · Waqaf darurat: wa lā anā',
    hindariBacaan: 'Kesalahan sangat umum: memanjangkan "anā" menjadi 2 harakat padahal sedang disambung (washal)',
    panduanBaca:
      'Setiap kata أَنَا۠ yang berarti "Aku/Saya" di seluruh Al-Qur\'an bertanda bulatan lonjong (Shifr Mustathil): huruf Nun WAJIB dibaca pendek 1 harakat saat disambung (wa lā ana \'ābidun), dan hanya panjang 2 harakat bila berhenti.',
    penjelasanKaidah:
      'Berbeda dengan kata أَنَابَ / أَنَابُوا ("kembali bertaubat") atau أَنَامِلَ ("ujung jari") yang tidak bertanda shifr sehingga tetap dibaca panjang 2 harakat.'
  },
  {
    id: 'gharib-shifr-kahf-38',
    kategoriId: 'shifr',
    kategoriNama: 'Shifr Mustadir & Mustathil',
    judul: 'Shifr Mustathil pada Lafazh Laakinnaa',
    surahNomor: 18,
    surahNamaLatin: 'Al-Kahf',
    ayahNomor: 38,
    lafazhArab: 'لَّٰكِنَّا۠ هُوَ ٱللَّهُ',
    potonganAyatArab: 'لَّٰكِنَّا۠ هُوَ ٱللَّهُ رَبِّى وَلَآ أُشْرِكُ بِرَبِّىٓ أَحَدًا',
    caraBacaLatin: 'Washal: lākinna huwallāhu rabbī (Nun tasydid dengung, pendek tanpa mad)',
    hindariBacaan: 'Jangan dipanjangkan "lākinnā huwallāhu" saat membaca sambung',
    panduanBaca:
      'Tahan dengung Nun tasydid 2–3 harakat lalu langsung sambung pendek ke kata هُوَ (lākinna huwallāhu). Hanya jika berhenti darurat pada kata tersebut maka dibaca panjang 2 harakat (lākinnā).',
    penjelasanKaidah:
      'Asal katanya adalah لَٰكِنْ أَنَا ("tetapi aku"), hamzah أَنَا dibuang dan nun-nya diidghamkan sehingga mengikuti hukum Shifr Mustathil.'
  },
  {
    id: 'gharib-shifr-ahzab-10',
    kategoriId: 'shifr',
    kategoriNama: 'Shifr Mustadir & Mustathil',
    judul: 'Shifr Mustathil pada Azh-Zhunuunaa, Ar-Rasuulaa, & As-Sabiilaa',
    surahNomor: 33,
    surahNamaLatin: 'Al-Ahzab',
    ayahNomor: 10,
    lafazhArab: 'ٱلظُّنُونَا۠',
    potonganAyatArab: 'وَبَلَغَتِ ٱلْقُلُوبُ ٱلْحَنَاجِرَ وَتَظُنُّونَ بِٱللَّهِ ٱلظُّنُونَا۠',
    caraBacaLatin: 'Waqaf di akhir ayat: aẓ-ẓunūnā (panjang 2 harakat) · Washal: aẓ-ẓunūna',
    panduanBaca:
      'Karena berada di penghujung ayat, ketika waqaf (berhenti) dibaca panjang 2 harakat: aẓ-ẓunūnā. Apabila disambung ke ayat 11, dibaca pendek: aẓ-ẓunūna hunālika. Hukum yang sama berlaku pada ٱلرَّسُولَا۠ (ayat 66) dan ٱلسَّبِيلَا۠ (ayat 67).',
    penjelasanKaidah:
      'Tiga kata khusus di Surah Al-Ahzab (ayat 10, 66, dan 67) yang diakhiri alif bertanda Shifr Mustathil untuk keselarasan rima fashilah ayat.'
  },

  // 7. NUN WIQAYAH
  {
    id: 'gharib-wiqayah-ikhlas-1',
    kategoriId: 'nun_wiqayah',
    kategoriNama: 'Nun Wiqayah (Nun Kecil)',
    judul: 'Nun Wiqayah saat Menyambung QS. Al-Ikhlas Ayat 1 ke Ayat 2',
    surahNomor: 112,
    surahNamaLatin: 'Al-Ikhlas',
    ayahNomor: 1,
    lafazhArab: 'أَحَدٌ ﴿١﴾ ٱللَّهُ ٱلصَّمَدُ',
    potonganAyatArab: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ ﴿١﴾ ٱللَّهُ ٱلصَّمَدُ',
    caraBacaLatin: 'Jika disambung (washal): Qul huwallāhu aḥadunillāhuṣ-ṣamad',
    panduanBaca:
      'Apabila berhenti di akhir ayat 1 (dianjurkan), baca Qalqalah Kubra: aḥad. Namun apabila menyambung ayat 1 langsung ke ayat 2, dhammatain pada Dal berubah menjadi "du" ditambah bunyi "ni" (Nun Wiqayah): aḥadunillāhuṣ-ṣamad (Lam jalalah tipis karena didahului kasrah "ni").',
    penjelasanKaidah:
      'Tanwin pada hakikatnya adalah nun sukun tambahan; saat bertemu Lam sukun pada Lafazh Jalalah, nun sukun diberi harakat kasrah (ni) agar dapat dibaca.'
  },
  {
    id: 'gharib-wiqayah-baqarah-180',
    kategoriId: 'nun_wiqayah',
    kategoriNama: 'Nun Wiqayah (Nun Kecil)',
    judul: 'Nun Wiqayah di Tengah Ayat pada Lafazh Khairanil-Washiyyah',
    surahNomor: 2,
    surahNamaLatin: 'Al-Baqarah',
    ayahNomor: 180,
    lafazhArab: 'خَيْرًا ٱلْوَصِيَّةُ',
    potonganAyatArab: 'إِن تَرَكَ خَيْرًا ٱلْوَصِيَّةُ لِلْوَٰلِدَيْنِ وَٱلْأَقْرَبِينَ',
    caraBacaLatin: 'In taraka khairanil-waṣiyyatu lil-wālidaini',
    hindariBacaan: 'Jangan dibaca putus hamzah "khairan al-waṣiyyatu" atau "khairal-waṣiyyatu"',
    panduanBaca:
      'Ubah fathatain pada خَيْرًا menjadi fathah biasa "khaira", lalu selipkan bunyi "ni" yang langsung menyambung ke Lam sukun: khairanil-waṣiyyatu.',
    penjelasanKaidah:
      'Pada Mushaf Standar Indonesia terdapat huruf ن kecil berharakat kasrah di bawah alif washal sebagai pengingat Nun Wiqayah.'
  },

  // 8. SHAD BERTANDA SIN & LAFAZH KHUSUS
  {
    id: 'gharib-shad-baqarah-245',
    kategoriId: 'shad_khusus',
    kategoriNama: 'Shad/Sin & Lafazh Khusus',
    judul: 'Huruf Shad Wajib Dibaca Sin pada Wayabsuthu',
    surahNomor: 2,
    surahNamaLatin: 'Al-Baqarah',
    ayahNomor: 245,
    lafazhArab: 'وَيَبْصُطُ',
    potonganAyatArab: 'وَٱللَّهُ يَقْبِضُ وَيَبْصُطُ وَإِلَيْهِ تُرْجَعُونَ',
    caraBacaLatin: 'Wallāhu yaqbiḍu wa yabsuṭu (dibaca dengan huruf Sin tipis, bukan Shad)',
    panduanBaca:
      'Karena huruf Sin kecil tertulis di ATAS huruf Shad, maka wajib dibaca tipis menggunakan makhraj Sin (س): wa yabsuṭu, sambil tetap menebalkan huruf Tha\' sesudahnya.',
    penjelasanKaidah:
      'Rasm Utsmani menuliskannya dengan huruf Shad mengikuti asal akar kata, sedangkan tanda Sin kecil di atasnya menunjukkan bacaan mutawatir Riwayat Hafsh.'
  },
  {
    id: 'gharib-shad-araf-69',
    kategoriId: 'shad_khusus',
    kategoriNama: 'Shad/Sin & Lafazh Khusus',
    judul: 'Huruf Shad Wajib Dibaca Sin pada Basthatan',
    surahNomor: 7,
    surahNamaLatin: "Al-A'raf",
    ayahNomor: 69,
    lafazhArab: 'بَصْطَةً',
    potonganAyatArab: 'وَزَادَكُمْ فِى ٱلْخَلْقِ بَصْطَةً ۖ فَٱذْكُرُوٓا۟ ءَالَآءَ ٱللَّهِ',
    caraBacaLatin: 'Wa zādakum fil-khalqi basṭatan (dibaca Sin sukun tipis)',
    panduanBaca:
      'Huruf Sin kecil berada di ATAS huruf Shad, sehingga wajib dibaca dengan desis tipis huruf Sin sukun: basṭatan (hati-hati jangan ikut menebal menjadi Shad karena pengaruh huruf Tha\' sesudahnya).',
    penjelasanKaidah:
      'Pasangan kedua setelah QS. Al-Baqarah: 245 yang wajib dibaca Sin murni dalam Riwayat Hafsh.'
  },
  {
    id: 'gharib-shad-thur-37',
    kategoriId: 'shad_khusus',
    kategoriNama: 'Shad/Sin & Lafazh Khusus',
    judul: 'Dua Wajah Bacaan (Shad atau Sin) pada Al-Mushaythiruun',
    surahNomor: 52,
    surahNamaLatin: 'Ath-Thur',
    ayahNomor: 37,
    lafazhArab: 'ٱلْمُصَيْطِرُونَ',
    potonganAyatArab: 'أَمْ عِندَهُمْ خَزَآئِنُ رَبِّكَ أَمْ هُمُ ٱلْمُصَيْطِرُونَ',
    caraBacaLatin: 'Al-muṣaiṭirūn (Shad — lebih masyhur) atau Al-musaiṭirūn (Sin)',
    panduanBaca:
      'Sin kecil terletak di BAWAH huruf Shad (atau ditandai dua wajah): boleh dibaca tebal dengan huruf Shad (al-muṣaiṭirūn — lebih populer) maupun tipis dengan huruf Sin (al-musaiṭirūn). Adapun di QS. Al-Ghasyiyah [88]: 22 (بِمُصَيْطِرٍ) wajib dibaca Shad saja.',
    penjelasanKaidah:
      'Letak Sin kecil di bawah huruf Shad menandakan bacaan Shad lebih didahulukan namun bacaan Sin juga sahih dalam jalur Syathibiyyah.'
  },
  {
    id: 'gharib-khusus-hud-42',
    kategoriId: 'shad_khusus',
    kategoriNama: 'Shad/Sin & Lafazh Khusus',
    judul: 'Idgham Mutajanisain Ba\' Sukun ke Mim pada Irkam-Ma\'anaa',
    surahNomor: 11,
    surahNamaLatin: 'Hud',
    ayahNomor: 42,
    lafazhArab: 'ٱرْكَب مَّعَنَا',
    potonganAyatArab: 'وَنَادَىٰ نُوحٌ ٱبْنَهُۥ وَكَانَ فِى مَعْزِلٍ يَٰبُنَىَّ ٱرْكَب مَّعَنَا',
    caraBacaLatin: 'Yā bunayyarkam-ma\'anā (Ba\' lebur sempurna ke Mim disertai dengung)',
    hindariBacaan: 'Jangan dipantulkan qalqalah menjadi "irkab ma\'anā"',
    panduanBaca:
      'Leburkan huruf Ba\' sukun sepenuhnya ke dalam huruf Mim sesudahnya sambil menahan dengung bibir selama 2–3 harakat: Yā bunayyarkam-ma\'anā (tepat satu ayat sesudah ayat Imalah di Surah Hud!).',
    penjelasanKaidah:
      'Pertemuan Ba\' sukun dengan Mim yang sejenis makhrajnya (dua bibir / asy-syafatain) wajib diidghamkan kamil bighunnah.'
  },
  {
    id: 'gharib-khusus-rum-54',
    kategoriId: 'shad_khusus',
    kategoriNama: 'Shad/Sin & Lafazh Khusus',
    judul: 'Dua Cara Baca Harakat Dhad (Dha\'f atau Dhu\'f) di QS. Ar-Rum: 54',
    surahNomor: 30,
    surahNamaLatin: 'Ar-Rum',
    ayahNomor: 54,
    lafazhArab: 'ضَعْفٍ / ضُعْفٍ',
    potonganAyatArab: 'ٱللَّهُ ٱلَّذِى خَلَقَكُم مِّن ضَعْفٍ ثُمَّ جَعَلَ مِنۢ بَعْدِ ضَعْفٍ قُوَّةً ثُمَّ جَعَلَ مِنۢ بَعْدِ قُوَّةٍ ضَعْفًا وَشَيْبَةً',
    caraBacaLatin: 'Boleh fathah ketiganya (ḍa\'fin... ḍa\'fin... ḍa\'fan) atau dhammah ketiganya (ḍu\'fin... ḍu\'fin... ḍu\'fan)',
    panduanBaca:
      'Terdapat tiga kata ضَعْف dalam satu ayat ini. Pembaca boleh memilih harakat fathah (ḍa\'f — sesuai cetakan Mushaf Indonesia) atau dhammah (ḍu\'f), dengan syarat KONSISTEN menyamakan ketiganya dalam satu kali bacaan.',
    penjelasanKaidah:
      'Kedua harakat (fathah dan dhammah pada huruf Dhad) diriwayatkan secara mutawatir oleh Imam Hafsh dari Imam \'Ashim.'
  },
  {
    id: 'gharib-khusus-ahqaf-4',
    kategoriId: 'shad_khusus',
    kategoriNama: 'Shad/Sin & Lafazh Khusus',
    judul: 'Ibtida\' (Memulai Bacaan) pada Lafazh Iituunii',
    surahNomor: 46,
    surahNamaLatin: 'Al-Ahqaf',
    ayahNomor: 4,
    lafazhArab: 'فِى ٱلسَّمَٰوَٰتِ ۖ ٱئْتُونِى',
    potonganAyatArab: 'أَمْ لَهُمْ شِرْكٌ فِى ٱلسَّمَٰوَٰتِ ۖ ٱئْتُونِى بِكِتَٰبٍ مِّن قَبْلِ هَٰذَآ',
    caraBacaLatin: 'Washal: fis-samāwāti\'tūnī · Jika berhenti lalu mulai dari ٱئْتُونِى: Ītūnī bikitābin',
    hindariBacaan: 'Jika berhenti pada السَّمَاوَاتِ, jangan memulai dengan "I\'tūnī" atau "U\'tūnī"',
    panduanBaca:
      'Jika membaca sambung (washal), hamzah sukun tetap terbaca: fis-samāwāti\'tūnī. Namun karena terdapat tanda waqaf sebelum ٱئْتُونِى, jika berhenti lalu memulai bacaan dari kata tersebut, hamzah washal diberi kasrah (i) dan hamzah sukun kedua berubah menjadi Ya\' mad 2 harakat: Ītūnī bikitābin.',
    penjelasanKaidah:
      'Kaidah Ibdal (penggantian hamzah sukun menjadi huruf mad yang sesuai dengan harakat kasrah sebelumnya) ketika memulai bacaan (ibtida\').'
  }
];

export const GHARIB_AND_TAJWID_QUIZ: GharibQuizQuestion[] = [
  {
    id: 'q-imalah',
    topik: 'Gharib',
    verseArabic: 'بِسْمِ ٱللَّهِ مَجْرَىٰهَا وَمُرْسَىٰهَآ',
    reference: 'QS. Hud [11]: 41',
    question: 'Bagaimana cara membaca lafazh مَجْرَىٰهَا menurut Riwayat Hafsh \'an \'Ashim?',
    options: [
      'Imalah — memiringkan fathah Ra ke arah kasrah (Majrēhā)',
      'Isymam — memonyongkan bibir saat dengung',
      'Saktah — berhenti 2 harakat tanpa bernapas',
      'Fathah biasa sepanjang 4 harakat (Majrāhā)'
    ],
    correct: 'Imalah — memiringkan fathah Ra ke arah kasrah (Majrēhā)',
    explanation:
      'QS. Hud: 41 adalah satu-satunya tempat bacaan Imalah Kubra dalam Riwayat Hafsh, sehingga مَجْرَىٰهَا dibaca miring seperti vokal "e" pada kata "sore" (Majrēhā).'
  },
  {
    id: 'q-isymam',
    topik: 'Gharib',
    verseArabic: 'مَا لَكَ لَا تَأْمَنَّا عَلَىٰ يُوسُفَ',
    reference: 'QS. Yusuf [12]: 11',
    question: 'Hukum bacaan Gharib apakah yang terdapat pada kata لَا تَأْمَنَّا?',
    options: [
      'Isymam (memonyongkan bibir di tengah dengung nun tasydid)',
      'Tashil (meringankan hamzah kedua)',
      'Naql (memindahkan harakat kasrah)',
      'Idgham Bilaghunnah'
    ],
    correct: 'Isymam (memonyongkan bibir di tengah dengung nun tasydid)',
    explanation:
      'Lafazh لَا تَأْمَنَّا berasal dari لَا تَأْمَنُنَا. Kedua bibir dimonyongkan ke depan saat menahan dengung nun tanpa mengeluarkan bunyi "u" sebagai isyarat dhammah.'
  },
  {
    id: 'q-saktah-qiyamah',
    topik: 'Gharib',
    verseArabic: 'وَقِيلَ مَنْ ۜ رَاقٍ',
    reference: 'QS. Al-Qiyamah [75]: 27',
    question: 'Tanda huruf Sin kecil (ۜ) di antara kata مَنْ dan رَاقٍ menunjukkan kewajiban membaca:',
    options: [
      'Saktah — berhenti ±2 harakat tanpa mengambil napas',
      'Idgham Bilaghunnah — melebur menjadi marrāq',
      'Ikhfa Haqiqi — menyamarkan nun disertai dengung',
      'Waqaf Lazim — wajib berhenti dan mengambil napas baru'
    ],
    correct: 'Saktah — berhenti ±2 harakat tanpa mengambil napas',
    explanation:
      'Saktah memutus suara sejenak (±2 harakat) tanpa bernapas sehingga Nun pada مَنْ dibaca jelas (izhar) dan tidak melebur menjadi "marrāq".'
  },
  {
    id: 'q-naql',
    topik: 'Gharib',
    verseArabic: 'بِئْسَ ٱلِٱسْمُ ٱلْفُسُوقُ بَعْدَ ٱلْإِيمَٰنِ',
    reference: 'QS. Al-Hujurat [49]: 11',
    question: 'Bagaimanakah bunyi bacaan Naql yang tepat pada rangkaian kata بِئْسَ ٱلِٱسْمُ?',
    options: [
      'Bi\'sal-ismu',
      'Bi\'sal-al-ismu',
      'Bi\'sil-ismu',
      'Ba\'sal-ismu'
    ],
    correct: 'Bi\'sal-ismu',
    explanation:
      'Harakat kasrah pada hamzah kata اسم dipindahkan (Naql) ke huruf Lam sukun sebelumnya, sehingga dibaca ringan dan mengalir: Bi\'sal-ismu.'
  },
  {
    id: 'q-tashil',
    topik: 'Gharib',
    verseArabic: 'ءَأَعْجَمِىٌّ وَعَرَبِىٌّ',
    reference: 'QS. Fussilat [41]: 44',
    question: 'Pada lafazh ءَأَعْجَمِىٌّ, hamzah kedua wajib dibaca dengan kaidah:',
    options: [
      'Tashil (dilunakkan antara bunyi hamzah dan alif)',
      'Imalah (dimiringkan ke kasrah)',
      'Qalqalah Kubra (dipantulkan kuat)',
      'Saktah (berhenti tanpa napas)'
    ],
    correct: 'Tashil (dilunakkan antara bunyi hamzah dan alif)',
    explanation:
      'Pertemuan dua hamzah qatha\' pada ءَأَعْجَمِىٌّ dibaca Tashil pada hamzah kedua agar lembut tanpa hentakan tenggorokan yang kaku.'
  },
  {
    id: 'q-shifr-ana',
    topik: 'Gharib',
    verseArabic: 'وَلَآ أَنَا۠ عَابِدٌ مَّا عَبَدتُّمْ',
    reference: 'QS. Al-Kafirun [109]: 4',
    question: 'Tanda bulatan lonjong (Shifr Mustathil ۠) di atas alif pada kata أَنَا۠ saat dibaca sambung (washal) berarti:',
    options: [
      'Huruf Nun dibaca pendek 1 harakat (wa lā ana \'ābidun)',
      'Huruf Nun dipanjangkan 4–5 harakat (Mad Jaiz Munfashil)',
      'Huruf Nun dipanjangkan 2 harakat baik washal maupun waqaf',
      'Wajib berhenti tanpa napas sesudah kata Ana'
    ],
    correct: 'Huruf Nun dibaca pendek 1 harakat (wa lā ana \'ābidun)',
    explanation:
      'Shifr Mustathil (bulatan lonjong) menandakan alif hanya dibaca panjang 2 harakat bila terpaksa waqaf, dan wajib dibaca pendek ketika washal.'
  },
  {
    id: 'q-tajwid-ikhfa',
    topik: 'Tajwid',
    verseArabic: 'مِن قَبْلِ',
    reference: 'Kaidah Nun Sukun & Tanwin',
    question: 'Hukum bacaan apakah yang terjadi ketika Nun sukun bertemu huruf Qaf (ق)?',
    options: ['Ikhfa Haqiqi', 'Izhar Halqi', 'Idgham Bighunnah', 'Iqlab'],
    correct: 'Ikhfa Haqiqi',
    explanation:
      'Nun sukun bertemu huruf Qaf (salah satu 15 huruf Ikhfa) dibaca samar mendekati makhraj Qaf (tebal/tafkhim) disertai dengung 2 harakat.'
  },
  {
    id: 'q-tajwid-qalqalah',
    topik: 'Tajwid',
    verseArabic: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
    reference: 'QS. Al-Ikhlas [112]: 1',
    question: 'Huruf Dal (د) yang dibaca waqaf/berhenti di akhir kata أَحَدٌ memiliki hukum:',
    options: ['Qalqalah Kubra', 'Qalqalah Sugra', 'Iqlab', 'Idgham'],
    correct: 'Qalqalah Kubra',
    explanation:
      'Huruf Qalqalah (ب ج د ط ق) yang disukunkan karena berhenti (waqaf) di akhir kalimat dipantulkan dengan jelas dan kuat (Qalqalah Kubra).'
  }
];

/**
 * Mengambil seluruh catatan Bacaan Gharib pada pasangan Surah & Ayat tertentu.
 */
export function getGharibBySurahAyah(surahNomor: number, ayahNomor: number): GharibVerseItem[] {
  return GHARIB_ITEMS.filter(
    (item) => item.surahNomor === surahNomor && item.ayahNomor === ayahNomor
  );
}

/**
 * Mengambil daftar ayat Bacaan Gharib yang berada di dalam suatu Surah.
 */
export function getGharibBySurah(surahNomor: number): GharibVerseItem[] {
  return GHARIB_ITEMS.filter((item) => item.surahNomor === surahNomor);
}

/**
 * Memfilter item Bacaan Gharib berdasarkan kata kunci pencarian (nama istilah, ejaan ghorib/gharib,
 * nama surah, nomor surah:ayat, lafazh latin/arab) dan kategori.
 */
export function filterGharibItems(
  query: string,
  categoryId: GharibCategoryId = 'semua'
): GharibVerseItem[] {
  const baseList =
    categoryId === 'semua'
      ? GHARIB_ITEMS
      : GHARIB_ITEMS.filter((item) => item.kategoriId === categoryId);

  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return baseList;

  // Jika pengguna mengetik "gharib", "ghorib", atau "musykilat", tampilkan seluruh daftar yang sesuai kategori
  if (trimmed === 'gharib' || trimmed === 'ghorib' || trimmed === 'bacaan ghorib' || trimmed === 'bacaan gharib' || trimmed === 'musykilat') {
    return baseList;
  }

  return baseList.filter((item) => {
    const refString = `${item.surahNomor}:${item.ayahNomor}`;
    const haystack = [
      item.kategoriNama,
      item.kategoriId,
      item.judul,
      item.surahNamaLatin,
      refString,
      `ayat ${item.ayahNomor}`,
      item.lafazhArab,
      item.caraBacaLatin,
      item.panduanBaca,
      item.penjelasanKaidah
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(trimmed);
  });
}
