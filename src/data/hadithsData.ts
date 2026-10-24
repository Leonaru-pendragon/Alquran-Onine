import type { HadithBook, HadithItem } from '../types/quran.ts';

export const HADITH_BOOKS: HadithBook[] = [
  {
    id: 'arbain',
    slug: 'arbain-nawawi',
    nama: 'Arba\'in An-Nawawiyyah',
    penyusun: 'Imam An-Nawawi (w. 676 H)',
    totalHadits: 42,
    deskripsi: 'Kitab legendaris berisi 42 hadis pokok fondasi ajaran Islam yang mencakup aqidah, syariah, dan akhlak.'
  },
  {
    id: 'bukhari',
    slug: 'shahih-bukhari',
    nama: 'Shahih Al-Bukhari',
    penyusun: 'Imam Al-Bukhari (194-256 H)',
    totalHadits: 7563,
    deskripsi: 'Kitab hadis paling shahih dan paling utama di muka bumi setelah Al-Quran Al-Karim.'
  },
  {
    id: 'muslim',
    slug: 'shahih-muslim',
    nama: 'Shahih Muslim',
    penyusun: 'Imam Muslim (204-261 H)',
    totalHadits: 5362,
    deskripsi: 'Kitab shahih rujukan utama kedua umat Islam dengan sistematika sanad dan matan yang sangat rapi.'
  },
  {
    id: 'tirmidzi',
    slug: 'jami-at-tirmidzi',
    nama: 'Jami\' At-Tirmidzi',
    penyusun: 'Imam At-Tirmidzi (209-279 H)',
    totalHadits: 3956,
    deskripsi: 'Memuat hukum fiqih, keutamaan amal, serta penjelasan derajat hadits (Shahih, Hasan, Dhaif).'
  },
  {
    id: 'abu-dawud',
    slug: 'sunan-abu-dawud',
    nama: 'Sunan Abu Dawud',
    penyusun: 'Imam Abu Dawud (202-275 H)',
    totalHadits: 5274,
    deskripsi: 'Kitab rujukan utama dalam bidang hadits-hadits hukum fikih peribadatan dan muamalah.'
  },
  {
    id: 'nasai',
    slug: 'sunan-an-nasai',
    nama: 'Sunan An-Nasa\'i',
    penyusun: 'Imam An-Nasa\'i (215-303 H)',
    totalHadits: 5758,
    deskripsi: 'Terkenal dengan ketatnya seleksi rawi dan ketelitian kritik sanad hadis.'
  },
  {
    id: 'ibnu-majah',
    slug: 'sunan-ibnu-majah',
    nama: 'Sunan Ibnu Majah',
    penyusun: 'Imam Ibnu Majah (209-273 H)',
    totalHadits: 4341,
    deskripsi: 'Pelengkap Kutubus Sittah dengan bab-bab fikih, nasihat zuhud, dan keutamaan menuntut ilmu.'
  },
  {
    id: 'ahmad',
    slug: 'musnad-ahmad',
    nama: 'Musnad Ahmad bin Hanbal',
    penyusun: 'Imam Ahmad bin Hanbal (164-241 H)',
    totalHadits: 27647,
    deskripsi: 'Ensiklopedi hadis raksasa yang disusun berdasarkan musnad masing-masing sahabat Nabi SAW.'
  },
  {
    id: 'malik',
    slug: 'muwatha-malik',
    nama: 'Al-Muwaththa\' Imam Malik',
    penyusun: 'Imam Malik bin Anas (93-179 H)',
    totalHadits: 1850,
    deskripsi: 'Kitab hadis dan fiqih tertua yang menghimpun sunnah dan amalan ahlul Madinah yang masyhur.'
  },
  {
    id: 'darimi',
    slug: 'sunan-ad-darimi',
    nama: 'Sunan Ad-Darimi',
    penyusun: 'Imam Ad-Darimi (181-255 H)',
    totalHadits: 3503,
    deskripsi: 'Kumpulan hadis tentang adab menuntut ilmu, pengagungan Al-Quran, dan sunnah Nabi.'
  }
];

export const HADITH_CATEGORIES = [
  'Semua Topik',
  'Niat & Ikhlas',
  'Iman & Aqidah',
  'Shalat & Ibadah',
  'Akhlak & Adab',
  'Muamalah & Rezeki',
  'Birrul Walidain (Orang Tua)',
  'Sabar & Syukur',
  'Doa & Dzikir',
  'Ilmu Pengetahuan',
  'Puasa & Sedekah'
];

export const COMPREHENSIVE_HADITHS: HadithItem[] = [
  // Hadits Arbain An-Nawawi (Pilihan Utama Fondasi Islam)
  {
    id: 'arbain-1',
    kitabSlug: 'arbain-nawawi',
    kitabNama: "Arba'in An-Nawawiyyah",
    nomor: 1,
    judul: 'Niat adalah Landasan Segala Amal',
    tema: 'Niat & Ikhlas',
    arab: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.',
    terjemah: 'Sesungguhnya segala amalan tergantung pada niatnya, dan sesungguhnya setiap orang akan mendapatkan balasan sesuai dengan apa yang ia niatkan. Barangsiapa hijrahnya karena Allah dan Rasul-Nya, maka hijrahnya itu kepada Allah dan Rasul-Nya. Dan barangsiapa yang hijrahnya karena mencari dunia atau karena wanita yang hendak dinikahinya, maka hijrahnya itu kepada apa yang ia tuju.',
    sanadPerawi: 'HR. Bukhari (No. 1) & Muslim (No. 1907) dari Umar bin Al-Khaththab RA',
    derajat: 'Muttafaq Alaih',
    pelajaran: 'Ikhlas adalah syarat diterimanya amal shalih. Suatu amalan mubah dapat bernilai ibadah besar bila diniatkan lillahi ta\'ala.'
  },
  {
    id: 'arbain-2',
    kitabSlug: 'arbain-nawawi',
    kitabNama: "Arba'in An-Nawawiyyah",
    nomor: 2,
    judul: 'Tingkatan Agama: Islam, Iman, dan Ihsan (Hadis Jibril)',
    tema: 'Iman & Aqidah',
    arab: 'قَالَ: فَأَخْبِرْنِي عَنِ الإِسْلاَمِ؟ فَقَالَ رَسُولُ اللَّهِ ﷺ: الإِسْلاَمُ أَنْ تَشْهَدَ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَتُقِيمَ الصَّلاَةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ الْبَيْتَ إِنِ اسْتَطَعْتَ إِلَيْهِ سَبِيلاً. قَالَ: فَأَخْبِرْنِي عَنِ الإِيمَانِ؟ قَالَ: أَنْ تُؤْمِنَ بِاللَّهِ، وَمَلاَئِكَتِهِ، وَكُتُبِهِ، وَرُسُلِهِ، وَالْيَوْمِ الآخِرِ، وَتُؤْمِنَ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ. قَالَ: فَأَخْبِرْنِي عَنِ الإِحْسَانِ؟ قَالَ: أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ.',
    terjemah: 'Malaikat Jibril bertanya: "Beritahukan kepadaku tentang Islam?" Rasulullah ﷺ bersabda: "Islam adalah engkau bersaksi tiada tuhan selain Allah dan Muhammad utusan Allah, mendirikan shalat, menunaikan zakat, berpuasa Ramadhan, dan berhaji ke Baitullah jika mampu." Ia bertanya lagi: "Tentang Iman?" Beliau bersabda: "Engkau beriman kepada Allah, malaikat-malaikat-Nya, kitab-kitab-Nya, rasul-rasul-Nya, hari akhir, dan beriman kepada takdir yang baik maupun yang buruk." Ia bertanya: "Tentang Ihsan?" Beliau menjawab: "Engkau beribadah kepada Allah seakan-akan engkau melihat-Nya. Dan jika engkau tidak melihat-Nya, maka sesungguhnya Dia senantiasa melihatmu."',
    sanadPerawi: 'HR. Muslim (No. 8) dari Umar bin Al-Khaththab RA',
    derajat: 'Shahih',
    pelajaran: 'Hadits induk aqidah yang menghimpun rukun Islam, rukun Iman, dan maqam muraqabah (Ihsan).'
  },
  {
    id: 'arbain-3',
    kitabSlug: 'arbain-nawawi',
    kitabNama: "Arba'in An-Nawawiyyah",
    nomor: 3,
    judul: 'Lima Pondasi Utama Islam',
    tema: 'Shalat & Ibadah',
    arab: 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ الْبَيْتِ، وَصَوْمِ رَمَضَانَ.',
    terjemah: 'Islam dibangun di atas lima perkara: bersaksi bahwa tiada tuhan yang berhak disembah selain Allah dan sesungguhnya Muhammad adalah hamba dan utusan-Nya, mendirikan shalat, menunaikan zakat, berhaji ke Baitullah, dan berpuasa di bulan Ramadhan.',
    sanadPerawi: 'HR. Bukhari (No. 8) & Muslim (No. 16) dari Abdullah bin Umar RA',
    derajat: 'Muttafaq Alaih',
    pelajaran: 'Ibadah-ibadah rukun adalah tiang penopang bangunan keislaman seseorang di dunia dan akhirat.'
  },
  {
    id: 'arbain-4',
    kitabSlug: 'arbain-nawawi',
    kitabNama: "Arba'in An-Nawawiyyah",
    nomor: 5,
    judul: 'Larangan Berbuat Bid\'ah dalam Syariat',
    tema: 'Iman & Aqidah',
    arab: 'مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ فِيهِ فَهُوَ رَدٌّ.',
    terjemah: 'Barangsiapa mengada-adakan perkara baru dalam urusan (agama) kami ini yang bukan bagian darinya, maka perkara tersebut tertolak.',
    sanadPerawi: 'HR. Bukhari (No. 2697) & Muslim (No. 1718) dari Ummul Mukminin Aisyah RA',
    derajat: 'Muttafaq Alaih',
    pelajaran: 'Ibadah mahdhah harus senantiasa memiliki tuntunan shahih dari Rasulullah shallallahu \'alaihi wasallam.'
  },
  {
    id: 'arbain-6',
    kitabSlug: 'arbain-nawawi',
    kitabNama: "Arba'in An-Nawawiyyah",
    nomor: 6,
    judul: 'Menjaga Kehalalan dan Membersihkan Hati',
    tema: 'Muamalah & Rezeki',
    arab: 'إِنَّ الْحَلاَلَ بَيِّنٌ وَإِنَّ الْحَرَامَ بَيِّنٌ، وَبَيْنَهُمَا أُمُورٌ مُشْتَبِهَاتٌ لاَ يَعْلَمُهُنَّ كَثِيرٌ مِنَ النَّاسِ، فَمَنِ اتَّقَى الشُّبُهَاتِ اسْتَبْرَأَ لِدِينِهِ وَعِرْضِهِ... أَلاَ وَإِنَّ فِي الْجَسَدِ مُضْغَةً إِذَا صَلَحَتْ صَلَحَ الْجَسَدُ كُلُّهُ، وَإِذَا فَسَدَتْ فَسَدَ الْجَسَدُ كُلُّهُ، أَلاَ وَهِيَ الْقَلْبُ.',
    terjemah: 'Sesungguhnya yang halal itu jelas dan yang haram itu jelas. Di antara keduanya terdapat perkara-perkara samar (syubhat) yang tidak diketahui oleh kebanyakan manusia. Barangsiapa menjaga diri dari perkara syubhat, maka ia telah membersihkan agama dan kehormatannya... Ketahuilah bahwa di dalam jasad ada segumpal daging; jika ia baik maka baik pula seluruh jasadnya, dan jika ia rusak maka rusak pula seluruh jasadnya. Ketahuilah bahwa itu adalah hati.',
    sanadPerawi: 'HR. Bukhari (No. 52) & Muslim (No. 1599) dari Nu\'man bin Basyir RA',
    derajat: 'Muttafaq Alaih',
    pelajaran: 'Wara\' (menjauhi syubhat) menjaga kesucian hati dari racun makanan dan harta haram.'
  },
  {
    id: 'arbain-7',
    kitabSlug: 'arbain-nawawi',
    kitabNama: "Arba'in An-Nawawiyyah",
    nomor: 7,
    judul: 'Agama adalah Nasihat',
    tema: 'Akhlak & Adab',
    arab: 'الدِّينُ النَّصِيحَةُ. قُلْنَا: لِمَنْ؟ قَالَ: لِلَّهِ، وَلِكِتَابِهِ، وَلِرَسُولِهِ، وَلأَئِمَّةِ الْمُسْلِمِينَ، وَعَامَّتِهِمْ.',
    terjemah: 'Rasulullah ﷺ bersabda: "Agama itu adalah nasihat (ketulusan)." Kami bertanya: "Untuk siapa?" Beliau menjawab: "Untuk Allah, untuk kitab-Nya, untuk rasul-Nya, untuk para pemimpin kaum muslimin, dan untuk kaum muslimin pada umumnya."',
    sanadPerawi: 'HR. Muslim (No. 55) dari Tamim Ad-Dari RA',
    derajat: 'Shahih',
    pelajaran: 'Ketulusan mencintai kebaikan bagi sesama mukmin dan mengingatkan mereka dalam kebenaran dan kesabaran.'
  },
  {
    id: 'arbain-12',
    kitabSlug: 'arbain-nawawi',
    kitabNama: "Arba'in An-Nawawiyyah",
    nomor: 12,
    judul: 'Tanda Kebaikan Keislaman Seseorang',
    tema: 'Akhlak & Adab',
    arab: 'مِنْ حُسْنِ إِسْلاَمِ الْمَرْءِ تَرْكُهُ مَا لاَ يَعْنِيهِ.',
    terjemah: 'Di antara tanda kebaikan keislaman seseorang adalah ia meninggalkan apa yang tidak bermanfaat baginya.',
    sanadPerawi: 'HR. At-Tirmidzi (No. 2317) & Ibnu Majah (No. 3976) dari Abu Hurairah RA',
    derajat: 'Hasan',
    pelajaran: 'Fokus pada hal yang mendatangkan maslahat dunia dan akhirat, serta menjauhi kepo/gosip tak berguna.'
  },
  {
    id: 'arbain-13',
    kitabSlug: 'arbain-nawawi',
    kitabNama: "Arba'in An-Nawawiyyah",
    nomor: 13,
    judul: 'Mencintai Saudaranya Sebagaimana Mencintai Diri Sendiri',
    tema: 'Akhlak & Adab',
    arab: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.',
    terjemah: 'Tidaklah sempurna iman salah seorang di antara kalian sampai ia mencintai bagi saudaranya apa yang ia cintai untuk dirinya sendiri.',
    sanadPerawi: 'HR. Bukhari (No. 13) & Muslim (No. 45) dari Anas bin Malik RA',
    derajat: 'Muttafaq Alaih',
    pelajaran: 'Menjauhkan diri dari sifat hasad dan dengki, serta bergembira atas nikmat yang didapat sesama muslim.'
  },
  {
    id: 'arbain-15',
    kitabSlug: 'arbain-nawawi',
    kitabNama: "Arba'in An-Nawawiyyah",
    nomor: 15,
    judul: 'Berkata Baik, Menghormati Tetangga dan Tamu',
    tema: 'Akhlak & Adab',
    arab: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ.',
    terjemah: 'Barangsiapa yang beriman kepada Allah dan hari akhir, hendaklah ia berkata yang baik atau diam. Barangsiapa yang beriman kepada Allah dan hari akhir, hendaklah ia memuliakan tetangganya. Dan barangsiapa yang beriman kepada Allah dan hari akhir, hendaklah ia memuliakan tamunya.',
    sanadPerawi: 'HR. Bukhari (No. 6018) & Muslim (No. 47) dari Abu Hurairah RA',
    derajat: 'Muttafaq Alaih',
    pelajaran: 'Menjaga lisan adalah kunci keselamatan diri dari murka Allah.'
  },
  {
    id: 'arbain-16',
    kitabSlug: 'arbain-nawawi',
    kitabNama: "Arba'in An-Nawawiyyah",
    nomor: 16,
    judul: 'Jangan Mudah Marah',
    tema: 'Akhlak & Adab',
    arab: 'أَنَّ رَجُلاً قَالَ لِلنَّبِيِّ ﷺ: أَوْصِنِي. قَالَ: لاَ تَغْضَبْ. فَرَدَّدَ مِرَارًا، قَالَ: لاَ تَغْضَبْ.',
    terjemah: 'Seseorang berkata kepada Nabi ﷺ: "Wasiatilah aku." Beliau bersabda: "Janganlah engkau marah." Orang itu mengulang permintaannya berulang kali, dan beliau tetap menjawab: "Janganlah engkau marah."',
    sanadPerawi: 'HR. Bukhari (No. 6116) dari Abu Hurairah RA',
    derajat: 'Shahih',
    pelajaran: 'Mampu menahan emosi dan amarah adalah wujud kekuatan sejati seorang mukmin.'
  },
  {
    id: 'arbain-18',
    kitabSlug: 'arbain-nawawi',
    kitabNama: "Arba'in An-Nawawiyyah",
    nomor: 18,
    judul: 'Ketakwaan dan Akhlak yang Terpuji',
    tema: 'Akhlak & Adab',
    arab: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ.',
    terjemah: 'Bertakwalah kepada Allah di mana pun engkau berada, dan iringilah keburukan dengan kebaikan niscaya kebaikan itu akan menghapusnya, serta pergauililah manusia dengan akhlak yang baik.',
    sanadPerawi: 'HR. At-Tirmidzi (No. 1987) dari Abu Dzar & Mu\'adz bin Jabal RA',
    derajat: 'Hasan',
    pelajaran: 'Trilogi hubungan seorang hamba: muraqabah kepada Allah, taubat dari dosa, dan toleransi berakhlak mulia.'
  },
  {
    id: 'arbain-19',
    kitabSlug: 'arbain-nawawi',
    kitabNama: "Arba'in An-Nawawiyyah",
    nomor: 19,
    judul: 'Jagalah Allah, Niscaya Allah Menjagamu',
    tema: 'Doa & Dzikir',
    arab: 'احْفَظِ اللَّهَ يَحْفَظْكَ، احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ، إِذَا سَأَلْتَ فَاسْأَلِ اللَّهَ، وَإِذَا اسْتَعَنْتَ فَاسْتَعِنْ بِاللَّهِ، وَاعْلَمْ أَنَّ الأُمَّةَ لَوِ اجْتَمَعَتْ عَلَى أَنْ يَنْفَعُوكَ بِشَيْءٍ لَمْ يَنْفَعُوكَ إِلاَّ بِشَيْءٍ قَدْ كَتَبَهُ اللَّهُ لَكَ...',
    terjemah: 'Jagalah Allah (aturan-Nya), niscaya Dia akan menjagamu. Jagalah Allah, niscaya engkau mendapati-Nya di hadapanmu. Jika engkau meminta, mintalah kepada Allah. Jika engkau memohon pertolongan, mohonlah pertolongan kepada Allah. Ketahuilah, seandainya seluruh umat bersatu padu untuk memberimu suatu manfaat, mereka tidak akan mampu melakukannya kecuali apa yang telah Allah tetapkan bagimu...',
    sanadPerawi: 'HR. At-Tirmidzi (No. 2516) dari Abdullah bin Abbas RA',
    derajat: 'Hasan Shahih',
    pelajaran: 'Penyerahan diri (tawakkal) mutlak hanya kepada Allah SWT atas segala urusan hidup.'
  },

  // Hadits Shahih Bukhari
  {
    id: 'bukhari-5027',
    kitabSlug: 'shahih-bukhari',
    kitabNama: 'Shahih Al-Bukhari',
    nomor: 5027,
    judul: 'Keutamaan Belajar dan Mengajarkan Al-Quran',
    tema: 'Ilmu Pengetahuan',
    arab: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ.',
    terjemah: 'Sebaik-baik kalian adalah orang yang mempelajari Al-Quran dan mengajarkannya.',
    sanadPerawi: 'HR. Al-Bukhari (No. 5027) dari Utsman bin Affan RA',
    derajat: 'Shahih',
    pelajaran: 'Derajat tertinggi di sisi Allah diraih oleh insan yang mendedikasikan hidupnya untuk mentadabburi dan membagikan kalam Ilahi.'
  },
  {
    id: 'bukhari-142',
    kitabSlug: 'shahih-bukhari',
    kitabNama: 'Shahih Al-Bukhari',
    nomor: 142,
    judul: 'Kebersihan Sebagian dari Iman',
    tema: 'Shalat & Ibadah',
    arab: 'الطُّهُورُ شَطْرُ الإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلآنِ مَا بَيْنَ السَّمَاءِ وَالأَرْضِ.',
    terjemah: 'Kesucian (kebersihan/wudhu) itu adalah separuh dari keimanan, kalimat alhamdulillah memenuhi timbangan amal, dan kalimat subhanallah serta alhamdulillah memenuhi antara langit dan bumi.',
    sanadPerawi: 'HR. Muslim (No. 223) & Bukhari dalam Al-Adab dari Abu Malik Al-Asy\'ari RA',
    derajat: 'Shahih',
    pelajaran: 'Kesucian lahiriah (wudhu dan mandi) mencerminkan kejernihan batin seorang mukmin.'
  },
  {
    id: 'bukhari-5971',
    kitabSlug: 'shahih-bukhari',
    kitabNama: 'Shahih Al-Bukhari',
    nomor: 5971,
    judul: 'Keutamaan Berbakti kepada Ibu Tiga Kali Lipat',
    tema: 'Birrul Walidain (Orang Tua)',
    arab: 'جَاءَ رَجُلٌ إِلَى رَسُولِ اللَّهِ ﷺ فَقَالَ: يَا رَسُولَ اللَّهِ، مَنْ أَحَقُّ النَّاسِ بِحُسْنِ صَحَابَتِي؟ قَالَ: أُمُّكَ. قَالَ: ثُمَّ مَنْ؟ قَالَ: ثُمَّ أُمُّكَ. قَالَ: ثُمَّ مَنْ؟ قَالَ: ثُمَّ أُمُّكَ. قَالَ: ثُمَّ مَنْ؟ قَالَ: ثُمَّ أَبُوكَ.',
    terjemah: 'Seorang laki-laki datang kepada Rasulullah ﷺ lalu bertanya: "Wahai Rasulullah, siapakah orang yang paling berhak aku perlakukan dengan baik?" Beliau menjawab: "Ibumu." Orang itu bertanya lagi: "Kemudian siapa lagi?" Beliau menjawab: "Ibumu." Orang itu bertanya lagi: "Lalu siapa lagi?" Beliau menjawab: "Ibumu." Orang itu bertanya lagi: "Kemudian siapa lagi?" Beliau menjawab: "Kemudian ayahmu."',
    sanadPerawi: 'HR. Al-Bukhari (No. 5971) & Muslim (No. 2548) dari Abu Hurairah RA',
    derajat: 'Muttafaq Alaih',
    pelajaran: 'Ibu mengandung dalam susah payah, melahirkan bertaruh nyawa, dan menyusui selama dua tahun penuh sehingga berhak atas bakti tertinggi.'
  },
  {
    id: 'bukhari-2060',
    kitabSlug: 'shahih-bukhari',
    kitabNama: 'Shahih Al-Bukhari',
    nomor: 2060,
    judul: 'Mencari Rezeki dari Usaha Tangan Sendiri',
    tema: 'Muamalah & Rezeki',
    arab: 'مَا أَكَلَ أَحَدٌ طَعَامًا قَطُّ خَيْرًا مِنْ أَنْ يَأْكُلَ مِنْ عَمَلِ يَدِهِ، وَإِنَّ نَبِيَّ اللَّهِ دَاوُدَ عَلَيْهِ السَّلاَمُ كَانَ يَأْكُلُ مِنْ عَمَلِ يَدِهِ.',
    terjemah: 'Tidaklah seseorang memakan suatu makanan yang lebih baik daripada apa yang ia makan dari hasil keringat usahanya sendiri. Dan sesungguhnya Nabi Allah Dawud \'alaihissalam dahulu makan dari hasil kerja tangannya sendiri.',
    sanadPerawi: 'HR. Al-Bukhari (No. 2060) dari Al-Miqdam bin Ma\'dikarib RA',
    derajat: 'Shahih',
    pelajaran: 'Islam memuliakan etos kerja keras dan kemandirian finansial yang halal.'
  },
  {
    id: 'bukhari-1423',
    kitabSlug: 'shahih-bukhari',
    kitabNama: 'Shahih Al-Bukhari',
    nomor: 1423,
    judul: 'Tangan di Atas Lebih Baik daripada Tangan di Bawah',
    tema: 'Puasa & Sedekah',
    arab: 'الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى، وَالْيَدُ الْعُلْيَا هِيَ الْمُنْفِقَةُ، وَالسُّفْلَى هِيَ السَّائِلَةُ.',
    terjemah: 'Tangan yang di atas (pemberi) itu lebih baik daripada tangan yang di bawah (peminta-minta). Tangan di atas adalah yang berinfaq dan tangan di bawah adalah yang meminta.',
    sanadPerawi: 'HR. Al-Bukhari (No. 1429) & Muslim (No. 1033) dari Abdullah bin Umar RA',
    derajat: 'Muttafaq Alaih',
    pelajaran: 'Mendorong kedermawanan dan menjaga martabat diri dari kebiasaan mengemis.'
  },

  // Hadits Shahih Muslim
  {
    id: 'muslim-2564',
    kitabSlug: 'shahih-muslim',
    kitabNama: 'Shahih Muslim',
    nomor: 2564,
    judul: 'Allah Tidak Memandang Rupa, Melainkan Hati dan Amal',
    tema: 'Niat & Ikhlas',
    arab: 'إِنَّ اللَّهَ لاَ يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ.',
    terjemah: 'Sesungguhnya Allah tidak memandang kepada rupa dan harta kalian, akan tetapi Dia memandang kepada hati-hati dan amal perbuatan kalian.',
    sanadPerawi: 'HR. Muslim (No. 2564) dari Abu Hurairah RA',
    derajat: 'Shahih',
    pelajaran: 'Kemuliaan sejati manusia di hadapan Sang Khalik diukur dari kebersihan jiwa dan ketulusan amalnya.'
  },
  {
    id: 'muslim-2699',
    kitabSlug: 'shahih-muslim',
    kitabNama: 'Shahih Muslim',
    nomor: 2699,
    judul: 'Menempuh Jalan Menuntut Ilmu Dimudahkan Jalan ke Surga',
    tema: 'Ilmu Pengetahuan',
    arab: 'وَمَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.',
    terjemah: 'Dan barangsiapa menempuh suatu jalan dalam rangka mencari ilmu pengetahuan, niscaya Allah akan memudahkan baginya jalan menuju ke surga.',
    sanadPerawi: 'HR. Muslim (No. 2699) dari Abu Hurairah RA',
    derajat: 'Shahih',
    pelajaran: 'Langkah kaki penuntut ilmu dinaungi sayap malaikat dan didoakan seluruh makhluk di bumi dan lautan.'
  },
  {
    id: 'muslim-2577',
    kitabSlug: 'shahih-muslim',
    kitabNama: 'Shahih Muslim',
    nomor: 2577,
    judul: 'Menolong Kesulitan Saudara dan Menutup Aib',
    tema: 'Akhlak & Adab',
    arab: 'مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ، وَمَنْ يَسَّرَ عَلَى مُعْسِرٍ يَسَّرَ اللَّهُ عَلَيْهِ فِي الدُّنْيَا وَالآخِرَةِ، وَمَنْ سَتَرَ مُسْلِمًا سَتَرَهُ اللَّهُ فِي الدُّنْيَا وَالآخِرَةِ، وَاللَّهُ فِي عَوْنِ الْعَبْدِ مَا كَانَ الْعَبْدُ فِي عَوْنِ أَخِيهِ.',
    terjemah: 'Barangsiapa melapangkan satu kesulitan duniawi dari seorang mukmin, niscaya Allah akan melapangkan darinya satu kesulitan di hari kiamat. Barangsiapa memberi kemudahan bagi orang yang sedang kesulitan, niscaya Allah memudahkan urusannya di dunia dan akhirat. Barangsiapa menutupi aib saudaranya muslim, niscaya Allah menutup aibnya di dunia dan akhirat. Dan Allah senantiasa menolong hamba-Nya selama hamba itu menolong saudaranya.',
    sanadPerawi: 'HR. Muslim (No. 2699) dari Abu Hurairah RA',
    derajat: 'Shahih',
    pelajaran: 'Balasan berbuat kebajikan adalah pertolongan langsung dari Rabb semesta alam.'
  },
  {
    id: 'muslim-2999',
    kitabSlug: 'shahih-muslim',
    kitabNama: 'Shahih Muslim',
    nomor: 2999,
    judul: 'Menakjubkannya Urusan Orang Beriman dalam Syukur dan Sabar',
    tema: 'Sabar & Syukur',
    arab: 'عَجَبًا لأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ، وَلَيْسَ ذَاكَ لأَحَدٍ إِلاَّ لِلْمُؤْمِنِ: إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ، وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ.',
    terjemah: 'Sungguh menakjubkan urusan seorang mukmin, sesungguhnya seluruh urusannya adalah baik, dan hal itu tidak dimiliki oleh siapa pun kecuali orang beriman: jika ia ditimpa kelapangan ia bersyukur maka itu baik baginya, dan jika ia ditimpa musibah ia bersabar maka itu pun baik baginya.',
    sanadPerawi: 'HR. Muslim (No. 2999) dari Shuhaib bin Sinan RA',
    derajat: 'Shahih',
    pelajaran: 'Orang mukmin tidak pernah kalah; dalam kenikmatan ia berpahala syukur, dalam ujian ia berpahala sabar.'
  },

  // Hadits Jami' At-Tirmidzi
  {
    id: 'tirmidzi-2003',
    kitabSlug: 'jami-at-tirmidzi',
    kitabNama: "Jami' At-Tirmidzi",
    nomor: 2003,
    judul: 'Mukmin yang Paling Sempurna Imannya',
    tema: 'Akhlak & Adab',
    arab: 'أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا، وَخِيَارُكُمْ خِيَارُكُمْ لِنِسَائِهِمْ.',
    terjemah: 'Orang mukmin yang paling sempurna imannya adalah yang paling baik akhlaknya, dan sebaik-baik kalian adalah yang paling baik perilakunya terhadap istri-istri mereka.',
    sanadPerawi: 'HR. At-Tirmidzi (No. 1162) dari Abu Hurairah RA',
    derajat: 'Hasan Shahih',
    pelajaran: 'Akhlak yang luhur dalam rumah tangga adalah bukti kedewasaan dan kematangan iman.'
  },
  {
    id: 'tirmidzi-1956',
    kitabSlug: 'jami-at-tirmidzi',
    kitabNama: "Jami' At-Tirmidzi",
    nomor: 1956,
    judul: 'Senyum kepada Saudaramu adalah Sedekah',
    tema: 'Puasa & Sedekah',
    arab: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ.',
    terjemah: 'Senyumanmu di hadapan saudaramu adalah bernilai sedekah bagimu.',
    sanadPerawi: 'HR. At-Tirmidzi (No. 1956) dari Abu Dzar Al-Ghifari RA',
    derajat: 'Hasan',
    pelajaran: 'Sedekah tidak selalu berupa uang tunai; kehangatan, keramahan, dan wajah berseri bernilai pahala sedekah.'
  },
  {
    id: 'tirmidzi-3373',
    kitabSlug: 'jami-at-tirmidzi',
    kitabNama: "Jami' At-Tirmidzi",
    nomor: 3373,
    judul: 'Doa adalah Inti Ibadah',
    tema: 'Doa & Dzikir',
    arab: 'الدُّعَاءُ هُوَ الْعِبَادَةُ. ثُمَّ قَرَأَ: ﴿وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ﴾.',
    terjemah: 'Doa itu adalah inti peribadatan itu sendiri. Kemudian beliau membaca firman Allah: "Dan Tuhanmu berfirman: Berdoalah kepada-Ku, niscaya akan Kuperkenankan bagimu."',
    sanadPerawi: 'HR. At-Tirmidzi (No. 3372) & Abu Dawud (No. 1479) dari An-Nu\'man bin Basyir RA',
    derajat: 'Shahih',
    pelajaran: 'Merendahkan diri memohon kepada Allah merupakan pengakuan atas kefakiran manusia dan keagungan rububiyyah Allah.'
  },

  // Hadits Sunan Abu Dawud
  {
    id: 'abu-dawud-4941',
    kitabSlug: 'sunan-abu-dawud',
    kitabNama: 'Sunan Abu Dawud',
    nomor: 4941,
    judul: 'Menyayangi Makhluk di Bumi agar Disayangi Penghuni Langit',
    tema: 'Akhlak & Adab',
    arab: 'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ.',
    terjemah: 'Orang-orang yang berbelas kasih akan dikasihi oleh Allah Yang Maha Pengasih. Sayangilah siapa pun yang ada di bumi, niscaya yang ada di langit (para malaikat dan Allah) akan menyayangi kalian.',
    sanadPerawi: 'HR. Abu Dawud (No. 4941) & At-Tirmidzi (No. 1924) dari Abdullah bin Amr RA',
    derajat: 'Shahih',
    pelajaran: 'Kasih sayang Islam mencakup seluruh umat manusia, hewan, dan kelestarian alam semesta.'
  },
  {
    id: 'abu-dawud-425',
    kitabSlug: 'sunan-abu-dawud',
    kitabNama: 'Sunan Abu Dawud',
    nomor: 425,
    judul: 'Shalat Berjamaah dan Kedamaian Masjid',
    tema: 'Shalat & Ibadah',
    arab: 'صَلاَةُ الرَّجُلِ فِي جَمَاعَةٍ تَزِيدُ عَلَى صَلاَتِهِ فِي بَيْتِهِ وَصَلاَتِهِ فِي سُوقِهِ سَبْعًا وَعِشْرِينَ دَرَجَةً.',
    terjemah: 'Shalat seorang laki-laki secara berjamaah melipatgandakan pahala shalatnya di rumahnya atau di pasarnya sebanyak dua puluh tujuh derajat.',
    sanadPerawi: 'HR. Al-Bukhari (No. 645) & Abu Dawud (No. 559) dari Ibnu Umar RA',
    derajat: 'Muttafaq Alaih',
    pelajaran: 'Menjaga shalat fardhu berjamaah di masjid adalah syiar agung kaum muslimin.'
  },

  // Hadits Sunan Ibnu Majah
  {
    id: 'ibnu-majah-224',
    kitabSlug: 'sunan-ibnu-majah',
    kitabNama: 'Sunan Ibnu Majah',
    nomor: 224,
    judul: 'Menuntut Ilmu Adalah Kewajiban Setiap Muslim',
    tema: 'Ilmu Pengetahuan',
    arab: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ.',
    terjemah: 'Menuntut ilmu itu hukumnya wajib atas setiap orang muslim (laki-laki maupun perempuan).',
    sanadPerawi: 'HR. Ibnu Majah (No. 224) dari Anas bin Malik RA',
    derajat: 'Shahih',
    pelajaran: 'Mempelajari pokok-pokok syariat dan ilmu yang bermanfaat adalah fardhu \'ain bagi setiap pribadi muslim.'
  },
  {
    id: 'ibnu-majah-4102',
    kitabSlug: 'sunan-ibnu-majah',
    kitabNama: 'Sunan Ibnu Majah',
    nomor: 4102,
    judul: 'Zuhud terhadap Dunia Niscaya Dicintai Allah',
    tema: 'Akhlak & Adab',
    arab: 'ازْهَدْ فِي الدُّنْيَا يُحِبَّكَ اللَّهُ، وَازْهَدْ فِيمَا فِي أَيْدِي النَّاسِ يُحِبَّكَ النَّاسُ.',
    terjemah: 'Zuhudlah engkau terhadap kenikmatan dunia niscaya Allah akan mencintaimu, dan zuhudlah engkau terhadap apa yang ada di tangan manusia niscaya manusia akan mencintaimu.',
    sanadPerawi: 'HR. Ibnu Majah (No. 4102) dari Sahl bin Sa\'ad As-Sa\'idi RA',
    derajat: 'Hasan',
    pelajaran: 'Zuhud bukan berarti miskin, melainkan meletakkan dunia di tangan dan tidak membiarkannya meracuni kalbu.'
  },

  // Hadits Muwatha Malik
  {
    id: 'malik-1601',
    kitabSlug: 'muwatha-malik',
    kitabNama: "Al-Muwaththa' Imam Malik",
    nomor: 1601,
    judul: 'Dua Pusaka Agung: Al-Quran dan As-Sunnah',
    tema: 'Iman & Aqidah',
    arab: 'تَرَكْتُ فِيكُمْ أَمْرَيْنِ لَنْ تَضِلُّوا مَا تَمَسَّكْتُمْ بِهِمَا: كِتَابَ اللَّهِ وَسُنَّةَ نَبِيِّهِ.',
    terjemah: 'Aku tinggalkan kepada kalian dua perkara yang kalian tidak akan tersesat selama-lamanya jika berpegang teguh pada keduanya: Kitabullah (Al-Quran) dan Sunnah Nabi-Nya.',
    sanadPerawi: 'HR. Imam Malik dalam Al-Muwaththa\' (2/899) secara mursal shahih',
    derajat: 'Shahih',
    pelajaran: 'Al-Quran dan Sunnah adalah kompas keselamatan hidup di dunia hingga ke surga.'
  },

  // Hadits Musnad Ahmad
  {
    id: 'ahmad-8939',
    kitabSlug: 'musnad-ahmad',
    kitabNama: 'Musnad Ahmad bin Hanbal',
    nomor: 8939,
    judul: 'Misi Pengutusan Nabi untuk Menyempurnakan Akhlak',
    tema: 'Akhlak & Adab',
    arab: 'إِنَّمَا بُعِثْتُ لِأُتَمِّمَ صَالِحَ الأَخْلاَقِ.',
    terjemah: 'Sesungguhnya aku diutus hanyalah untuk menyempurnakan keluhuran akhlak pekerti manusia.',
    sanadPerawi: 'HR. Ahmad (No. 8939) & Al-Bukhari dalam Al-Adab Al-Mufrad dari Abu Hurairah RA',
    derajat: 'Shahih',
    pelajaran: 'Puncak dari ibadah shalat, puasa, dan membaca Al-Quran adalah membuahkan budi pekerti yang santun dan adil.'
  }
];
