import { TajwidRule } from '../types/quran';

export const TAJWID_RULES: TajwidRule[] = [
  {
    id: 'ghunnah',
    nama: 'Ghunnah Musyaddadah',
    kategori: 'Hukum Huruf Bertasydid',
    warna: 'tajwid-ghunnah',
    hexColor: '#10b981',
    deskripsi: 'Setiap huruf Nun (نّ) atau Mim (مّ) yang memiliki harakat tasydid/syaddah.',
    caraBaca: 'Wajib dibaca dengung yang ditahan selama 2 sampai 3 harakat.',
    huruf: ['ن', 'م'],
    contohArab: 'إِنَّ ٱللَّهَ غَفُورٌ رَّحِيمٌ · عَمَّ يَتَسَآءَلُونَ',
    contohLatin: 'Inna - \'Amma',
    penjelasanContoh: 'Nun tasydid pada kata "Inna" dan Mim tasydid pada "Amma" didengungkan dan ditahan.'
  },
  {
    id: 'ikhfa',
    nama: 'Ikhfa Haqiqi',
    kategori: 'Hukum Nun Sukun & Tanwin',
    warna: 'tajwid-ikhfa',
    hexColor: '#f59e0b',
    deskripsi: 'Apabila Nun sukun (نْ) atau Tanwin (ـًـٍـٌ) bertemu dengan salah satu dari 15 huruf Ikhfa.',
    caraBaca: 'Dibaca samar antara izhar dan idgham dengan dengung lembut selama 2 harakat.',
    huruf: ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'],
    contohArab: 'مِن قَبْلِ · كُنتُمْ · أَنزَلْنَا',
    contohLatin: 'Min qabli - Kuntum - Anzalna',
    penjelasanContoh: 'Nun sukun bertemu huruf Qaf (ق), Ta (ت), dan Zai (ز) dibaca samar berdengung.'
  },
  {
    id: 'idgham-bighunnah',
    nama: 'Idgham Bighunnah',
    kategori: 'Hukum Nun Sukun & Tanwin',
    warna: 'tajwid-idgham-bighunnah',
    hexColor: '#06b6d4',
    deskripsi: 'Nun sukun atau Tanwin bertemu salah satu huruf Ya (ي), Nun (ن), Mim (م), atau Wawu (و) di dua kata terpisah.',
    caraBaca: 'Memasukkan bunyi nun/tanwin ke huruf berikutnya disertai dengung 2 harakat.',
    huruf: ['ي', 'ن', 'م', 'و'],
    contohArab: 'مَن يَقُولُ · حَبْلٌ مِّن مَّسَدٍ · خَيْرًا يَرَهُ',
    contohLatin: 'May-yaquulu - Hablum-mim-masad',
    penjelasanContoh: 'Bunyi "man" melebur menjadi "may-yaquulu" dengan dengung lembut.'
  },
  {
    id: 'idgham-bilaghunnah',
    nama: 'Idgham Bilaghunnah',
    kategori: 'Hukum Nun Sukun & Tanwin',
    warna: 'tajwid-idgham-bilaghunnah',
    hexColor: '#0284c7',
    deskripsi: 'Nun sukun atau Tanwin bertemu huruf Lam (ل) atau Ra (ر).',
    caraBaca: 'Memasukkan bunyi nun/tanwin secara penuh ke huruf lam atau ra TANPA dengung sama sekali.',
    huruf: ['ل', 'ر'],
    contohArab: 'مِن رَّبِّهِمْ · هُدًى لِّلْمُتَّقِينَ',
    contohLatin: 'Mir-rabbihim - Hudal-lilmuttaqiin',
    penjelasanContoh: 'Nun sukun bertemu Ra dibaca lebur total "Mir-rabbihim" tanpa dengung.'
  },
  {
    id: 'iqlab',
    nama: 'Iqlab',
    kategori: 'Hukum Nun Sukun & Tanwin',
    warna: 'tajwid-iqlab',
    hexColor: '#6366f1',
    deskripsi: 'Nun sukun atau Tanwin bertemu dengan huruf Ba (ب). Biasanya ditandai tanda mim kecil (مـ) di atas mushaf.',
    caraBaca: 'Mengubah bunyi nun atau tanwin menjadi bunyi mim (m) yang disertai dengung selama 2 harakat.',
    huruf: ['ب'],
    contohArab: 'مِنۢ بَعْدِ · عَلِيمٌۢ بِذَاتِ ٱلصُّدُورِ',
    contohLatin: 'Mim-ba\'di - \'Aliimum-bi-dzaatis-shuduur',
    penjelasanContoh: 'Kata "min ba\'di" diucapkan "mim-ba\'di" dengan bibir merapat santai dan mendengung.'
  },
  {
    id: 'qalqalah',
    nama: 'Qalqalah (Sugra & Kubra)',
    kategori: 'Hukum Memantul',
    warna: 'tajwid-qalqalah',
    hexColor: '#ef4444',
    deskripsi: 'Huruf Qalqalah berharakat sukun asli (Sugra) atau sukun karena waqaf/berhenti di akhir kata (Kubra).',
    caraBaca: 'Memantulkan suara huruf dengan tegas tanpa disertai desisan.',
    huruf: ['ق', 'ط', 'ب', 'ج', 'د'], // Baju di toko
    contohArab: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ (kubra) · لَمْ يَلِدْ وَلَمْ يُولَدْ (sugra) · يَدْخُلُونَ',
    contohLatin: 'Ahad(d) - Lam Yalid - Yadkhuluun',
    penjelasanContoh: 'Huruf Dal sukun memantul di tengah kata (sugra) dan lebih kuat saat diwaqafkan (kubra).'
  },
  {
    id: 'mad',
    nama: 'Hukum Mad (Panjang)',
    kategori: 'Hukum Memanjangkan Suara',
    warna: 'tajwid-mad',
    hexColor: '#a855f7',
    deskripsi: 'Mad Wajib Muttasil, Mad Jaiz Munfasil, Mad Lazim, dan Mad Aridh Lissukun.',
    caraBaca: 'Dipanjangkan antara 4, 5 hingga 6 harakat (tergantung jenis mad dan hamzah/sukun yang mengiringinya).',
    huruf: ['ا', 'و', 'ي', 'ٓ'],
    contohArab: 'جَآءَ · إِنَّآ أَنزَلْنَٰهُ · ٱلصَّآخَّةُ · ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    contohLatin: 'Jaa\'a - Innaa anzalnaahu - As-Saakh-khah',
    penjelasanContoh: 'Tanda mad alis (ٓ) memanjangkan bacaan 4-5 harakat (Wajib/Jaiz) atau 6 harakat (Lazim).'
  }
];

/**
 * Intelligent helper to colorize Arabic Quran text according to Tajwid rules.
 * Uses Quranic orthography patterns (tanwin, nun sukun, tasydid, mad signs, qalqalah sukun).
 */
export function renderTajwidHtml(arabicText: string, showTajwid: boolean = true): string {
  // Attach Quranic combining waqf/saktah marks (e.g. U+06DC ۜ) preceded by ASCII space
  // to the preceding Arabic glyph so HarfBuzz never renders a .notdef box on U+0020.
  const normalized = arabicText.replace(
    /\s+([\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED])/g,
    '$1'
  );
  if (!showTajwid) return normalized;

  let text = normalized;

  // 1. Mad Signs (wavy maddah ٓ or ۧ or ~)
  text = text.replace(/([^\s\u0640]{1,3}[ٓۧ~][^\s\u0640]{0,2})/g, '<span class="tajwid-mad">$1</span>');

  // 2. Ghunnah: Nun Tasydid (نّ) or Mim Tasydid (مّ)
  text = text.replace(/([نم]ّ[َُِ]?)/g, '<span class="tajwid-ghunnah">$1</span>');

  // 3. Iqlab: Nun sukun or tanwin followed by mim kecil (ۢ) or ba
  text = text.replace(/([^\s]{1,2}[ۢ][^\s]{0,2}\s*ب[َُِْ]?)/g, '<span class="tajwid-iqlab">$1</span>');

  // 4. Qalqalah: letters ق ط ب ج د with sukun (ْ)
  text = text.replace(/([قطبجد]ْ)/g, '<span class="tajwid-qalqalah">$1</span>');

  // 5. Idgham Bighunnah / Bilaghunnah: tanwin (ً ٌ ٍ) or nun sukun (نْ / ن) followed by [ي نمو] or [لر]
  text = text.replace(/([ًٌٍ]|نْ?)\s+([يرنملو]ّ?)/g, (match, p1, p2) => {
    const nextLetter = p2[0];
    if (nextLetter === 'ل' || nextLetter === 'ر') {
      return `<span class="tajwid-idgham-bilaghunnah">${p1}</span> <span class="tajwid-idgham-bilaghunnah">${p2}</span>`;
    } else {
      return `<span class="tajwid-idgham-bighunnah">${p1}</span> <span class="tajwid-idgham-bighunnah">${p2}</span>`;
    }
  });

  // 6. Ikhfa: nun sukun / tanwin followed by 15 ikhfa letters
  const ikhfaLetters = 'تثجدذزسشصضطظفقك';
  const ikhfaRegex = new RegExp(`([ًٌٍ]|نْ?)\\s*([${ikhfaLetters}])`, 'g');
  text = text.replace(ikhfaRegex, '<span class="tajwid-ikhfa">$1$2</span>');

  return text;
}
