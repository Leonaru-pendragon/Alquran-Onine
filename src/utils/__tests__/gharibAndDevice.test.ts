import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeQuranicText, renderTajwidHtml } from '../../data/tajwidRules';
import { validateReadingSettings } from '../security';
import { detectDeviceLayoutProfile } from '../mobilePlatform';

test('normalizeQuranicText menempelkan tanda waqaf, saktah, dan nun wiqayah yang didahului spasi tanpa merusak pemisah kata', () => {
  assert.equal(normalizeQuranicText('عِوَجًا \u06DC'), 'عِوَجًا\u06DC');
  assert.equal(normalizeQuranicText('وَقِيْلَ مَنْ \u06DCرَاقٍۙ'), 'وَقِيْلَ مَنْ\u06DC رَاقٍۙ');
  assert.equal(
    normalizeQuranicText(' \u06E8الَّذِيْ جَمَعَ مَالًا'),
    ' ا\u06E8لَّذِيْ جَمَعَ مَالًا'
  );
});

test('renderTajwidHtml hanya mewarnai kaidah Pelajaran Ilmu Tajwid Praktis (Qiraati) tanpa menyisipkan span Gharib', () => {
  const hud41Arab = '۞ وَقَالَ ارْكَبُوْا فِيْهَا بِسْمِ اللّٰهِ مَجْرٰ۪ىهَا وَمُرْسٰىهَا ۗاِنَّ رَبِّيْ لَغَفُوْرٌ رَّحِيْمٌ';
  const hud41Html = renderTajwidHtml(hud41Arab, true);

  assert.equal(hud41Html.includes('gharib-mark'), false);
  assert.equal(hud41Html.includes('data-gharib'), false);
  assert.ok(hud41Html.includes('tajwid-ghunnah'));
  assert.ok(!hud41Html.includes('\uE000'), 'Placeholder PUA tidak boleh tersisa di output HTML');

  const plainHtml = renderTajwidHtml(hud41Arab, false);
  assert.equal(plainHtml.includes('<span'), false);

  const qiyamah27Html = renderTajwidHtml('وَقِيْلَ مَنْ \u06DCرَاقٍۙ', true);
  assert.equal(qiyamah27Html.includes('gharib-saktah'), false);
  assert.ok(qiyamah27Html.includes('مَنْ\u06DC رَاقٍ'));
});

test('validateReadingSettings mengabaikan properti lama showGharib dari localStorage agar pengaturan bersih', () => {
  const cleaned = validateReadingSettings({
    theme: 'light',
    arabicFontSize: 28,
    translationFontSize: 15,
    arabicFontFamily: 'amiri',
    showTajwid: true,
    showGharib: true,
    showTranslation: true,
    showLatin: true,
    autoScrollAudio: true
  });
  assert.ok(cleaned);
  assert.equal('showGharib' in cleaned, false);
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
