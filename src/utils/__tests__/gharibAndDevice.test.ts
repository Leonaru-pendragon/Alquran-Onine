import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GHARIB_CATEGORIES,
  GHARIB_ITEMS,
  getGharibBySurahAyah,
  getGharibBySurah,
  filterGharibItems,
  detectAyahGharibMatches,
  scanSurahGharibSummary
} from '../../data/gharibData';
import { renderTajwidHtml } from '../../data/tajwidRules';
import { detectDeviceLayoutProfile } from '../mobilePlatform';

test('Bacaan Gharib mencakup seluruh kaidah utama Riwayat Hafsh (Imalah, Isymam, Tashil, Naql, 4 Saktah, Shifr, Nun Wiqayah, Shad/Sin)', () => {
  assert.ok(GHARIB_CATEGORIES.length >= 8);
  assert.ok(GHARIB_ITEMS.length >= 18);

  // Setiap kategori wajib memiliki warnaClass & hexColor tersendiri
  const uniqueClasses = new Set(GHARIB_CATEGORIES.map((c) => c.warnaClass));
  assert.equal(uniqueClasses.size, 8);

  // 1. Imalah di QS. Hud [11]: 41
  const hud41 = getGharibBySurahAyah(11, 41);
  assert.equal(hud41.length, 1);
  assert.equal(hud41[0].kategoriId, 'imalah');

  // 2. Isymam di QS. Yusuf [12]: 11
  const yusuf11 = getGharibBySurahAyah(12, 11);
  assert.equal(yusuf11.length, 1);
  assert.equal(yusuf11[0].kategoriId, 'isymam');

  // 3. Tashil di QS. Fussilat [41]: 44
  const fussilat44 = getGharibBySurahAyah(41, 44);
  assert.equal(fussilat44.length, 1);
  assert.equal(fussilat44[0].kategoriId, 'tashil');

  // 4. Naql di QS. Al-Hujurat [49]: 11
  const hujurat11 = getGharibBySurahAyah(49, 11);
  assert.equal(hujurat11.length, 1);
  assert.equal(hujurat11[0].kategoriId, 'naql');

  // 5. Empat ayat Saktah wajib
  const saktahItems = filterGharibItems('', 'saktah');
  assert.equal(saktahItems.length, 4);
  const saktahRefs = saktahItems.map((i) => `${i.surahNomor}:${i.ayahNomor}`).sort();
  assert.deepEqual(saktahRefs, ['18:1', '36:52', '75:27', '83:14']);
});

test('Pencarian Bacaan Gharib mendukung ejaan "ghorib", "gharib", nama surah, istilah, dan nomor ayat', () => {
  const allGhorib = filterGharibItems('ghorib');
  assert.equal(allGhorib.length, GHARIB_ITEMS.length);

  const imalahQuery = filterGharibItems('majrēhā');
  assert.equal(imalahQuery.length, 1);
  assert.equal(imalahQuery[0].surahNomor, 11);

  const hudSurahItems = getGharibBySurah(11);
  assert.equal(hudSurahItems.length, 2); // Hud:41 (Imalah) & Hud:42 (Irkam-ma'anaa)

  const yasinSaktah = filterGharibItems('36:52');
  assert.equal(yasinSaktah.length, 1);
  assert.equal(yasinSaktah[0].kategoriId, 'saktah');
});

test('Pewarnaan Bacaan Gharib (renderTajwidHtml + detectAyahGharibMatches) mewarnai lafazh Gharib secara akurat di setiap surah tanpa merusak tag HTML Tajwid', () => {
  // 1. QS. Hud [11]: 41 (Kemenag RI equran.id: مَجْرٰ۪ىهَا) -> gharib-imalah + tajwid lainnya tetap utuh
  const hud41Arab = '۞ وَقَالَ ارْكَبُوْا فِيْهَا بِسْمِ اللّٰهِ مَجْرٰ۪ىهَا وَمُرْسٰىهَا ۗاِنَّ رَبِّيْ لَغَفُوْرٌ رَّحِيْمٌ';
  const hud41Html = renderTajwidHtml(hud41Arab, true, {
    showGharib: true,
    surahNomor: 11,
    ayahNomor: 41
  });
  assert.ok(hud41Html.includes('class="gharib-mark gharib-imalah"'));
  assert.ok(hud41Html.includes('>مَجْرٰ۪ىهَا</span>'));
  assert.ok(hud41Html.includes('tajwid-ghunnah'));
  assert.ok(!hud41Html.includes('\uE000'), 'Placeholder PUA tidak boleh tersisa di output HTML');

  // 2. Mode hanya Gharib berwarna (Tajwid reguler dimatikan)
  const gharibOnlyHtml = renderTajwidHtml(hud41Arab, false, {
    showGharib: true,
    surahNomor: 11,
    ayahNomor: 41
  });
  assert.ok(gharibOnlyHtml.includes('gharib-imalah'));
  assert.ok(!gharibOnlyHtml.includes('tajwid-ghunnah'));

  // 3. Deteksi otomatis di surah mana pun (mis. QS. Ali 'Imran [3]: 81 وَاَنَا۠ & [3]: 144 اَفَا۟ىِٕنْ & QS. Al-Humazah [104]: 2 ۨالَّذِيْ)
  const aliImranSummary = scanSurahGharibSummary(3, [
    { nomorAyat: 80, teksArab: 'وَلَا يَأْمُرَكُمْ اَنْ تَتَّخِذُوا الْمَلٰۤىِٕكَةَ' },
    { nomorAyat: 81, teksArab: 'قَالَ فَاَشْهَدُوْا وَاَنَا۠ مَعَكُمْ مِّنَ الشّٰهِدِيْنَ' },
    { nomorAyat: 144, teksArab: 'وَمَا مُحَمَّدٌ اِلَّا رَسُوْلٌۚ قَدْ خَلَتْ مِنْ قَبْلِهِ الرُّسُلُ ۗ اَفَا۟ىِٕنْ مَّاتَ اَوْ قُتِلَ' }
  ]);
  assert.equal(aliImranSummary.ayahEntries.length, 2);
  assert.deepEqual(
    aliImranSummary.ayahEntries.map((e) => e.ayahNomor),
    [81, 144]
  );

  const humazah2Matches = detectAyahGharibMatches(' ۨالَّذِيْ جَمَعَ مَالًا وَّعَدَّدَهٗۙ', 104, 2);
  assert.equal(humazah2Matches.length, 1);
  assert.equal(humazah2Matches[0].kategoriId, 'nun_wiqayah');
  assert.equal(humazah2Matches[0].warnaClass, 'gharib-nun-wiqayah');

  // 4. Saktah QS. Al-Qiyamah [75]: 27 menjaga spasi kata sesudah tanda saktah & memberi warna gharib-saktah
  const qiyamah27Html = renderTajwidHtml('وَقِيْلَ مَنْ ۜرَاقٍۙ', true, {
    showGharib: true,
    surahNomor: 75,
    ayahNomor: 27
  });
  assert.ok(qiyamah27Html.includes('gharib-saktah'));
  assert.ok(qiyamah27Html.includes('مَنْۜ رَاقٍ'));

  // 5. Wawu jama' rasm Utsmani biasa (قَالُوا۟) TIDAK boleh salah diwarnai sebagai Gharib Shifr Mustadir
  const ordinaryPluralHtml = renderTajwidHtml('قَالُوا۟ سَمِعْنَا وَأَطَعْنَا', false, {
    showGharib: true,
    surahNomor: 2,
    ayahNomor: 285
  });
  assert.ok(!ordinaryPluralHtml.includes('gharib-shifr'));
});

test('detectDeviceLayoutProfile mengklasifikasikan ponsel sempit, ponsel standar, iPad/Tablet (portrait & landscape), dan desktop secara akurat', () => {
  // Narrow Android phone (360x800)
  const narrowPhone = detectDeviceLayoutProfile(
    360,
    800,
    'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Mobile Safari/537.36',
    5
  );
  assert.equal(narrowPhone.formFactor, 'phone');
  assert.equal(narrowPhone.isCompactPhone, true);
  assert.equal(narrowPhone.useBottomNavigationDock, true);

  // iPhone 15 Pro (393x852)
  const iphone = detectDeviceLayoutProfile(
    393,
    852,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
    5
  );
  assert.equal(iphone.formFactor, 'phone');
  assert.equal(iphone.isCompactPhone, false);
  assert.equal(iphone.useBottomNavigationDock, true);

  // iPad Air Portrait (820x1180, iPadOS 17 reporting MacIntel + 5 touch points)
  const ipadPortrait = detectDeviceLayoutProfile(
    820,
    1180,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
    5,
    'MacIntel'
  );
  assert.equal(ipadPortrait.formFactor, 'tablet');
  assert.equal(ipadPortrait.orientation, 'portrait');
  assert.equal(ipadPortrait.isTabletPortrait, true);
  assert.equal(ipadPortrait.useBottomNavigationDock, true);

  // iPad Air Landscape (1180x820)
  const ipadLandscape = detectDeviceLayoutProfile(
    1180,
    820,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
    5,
    'MacIntel'
  );
  assert.equal(ipadLandscape.formFactor, 'tablet');
  assert.equal(ipadLandscape.orientation, 'landscape');
  assert.equal(ipadLandscape.isTabletLandscape, true);
  assert.equal(ipadLandscape.useBottomNavigationDock, false);

  // Android Tablet Portrait (800x1280, Android without 'Mobile')
  const androidTablet = detectDeviceLayoutProfile(
    800,
    1280,
    'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 Chrome/122.0 Safari/537.36',
    5
  );
  assert.equal(androidTablet.formFactor, 'tablet');
  assert.equal(androidTablet.isTabletPortrait, true);

  // Standard Desktop (1440x900)
  const desktop = detectDeviceLayoutProfile(
    1440,
    900,
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/122.0 Safari/537.36',
    0
  );
  assert.equal(desktop.formFactor, 'desktop');
  assert.equal(desktop.useBottomNavigationDock, false);
});
