import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GHARIB_CATEGORIES,
  GHARIB_ITEMS,
  getGharibBySurahAyah,
  getGharibBySurah,
  filterGharibItems
} from '../../data/gharibData';
import { detectDeviceLayoutProfile } from '../mobilePlatform';

test('Bacaan Gharib mencakup seluruh kaidah utama Riwayat Hafsh (Imalah, Isymam, Tashil, Naql, 4 Saktah, Shifr, Nun Wiqayah, Shad/Sin)', () => {
  assert.ok(GHARIB_CATEGORIES.length >= 8);
  assert.ok(GHARIB_ITEMS.length >= 18);

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
