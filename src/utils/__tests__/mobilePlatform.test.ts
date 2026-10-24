import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectMobilePlatform,
  detectStandaloneMode,
  detectHorizontalSwipe,
  getThemeStatusBarColor
} from '../mobilePlatform';

test('detectMobilePlatform identifies iPhone, iPad, iPadOS 13+, Android, and Desktop accurately', () => {
  const iphone = detectMobilePlatform(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    5,
    'iPhone'
  );
  assert.equal(iphone.isIOS, true);
  assert.equal(iphone.isIPadOS, false);
  assert.equal(iphone.isAndroid, false);
  assert.equal(iphone.isMobile, true);

  // Modern iPadOS 13+ disguises itself as Macintosh + maxTouchPoints > 1
  const ipadOS = detectMobilePlatform(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
    5,
    'MacIntel'
  );
  assert.equal(ipadOS.isIOS, true);
  assert.equal(ipadOS.isIPadOS, true);
  assert.equal(ipadOS.isAndroid, false);
  assert.equal(ipadOS.isMobile, true);

  // Real macOS desktop has maxTouchPoints === 0
  const macDesktop = detectMobilePlatform(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    0,
    'MacIntel'
  );
  assert.equal(macDesktop.isIOS, false);
  assert.equal(macDesktop.isIPadOS, false);
  assert.equal(macDesktop.isAndroid, false);
  assert.equal(macDesktop.isMobile, false);

  const android = detectMobilePlatform(
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
    5,
    'Linux armv8l'
  );
  assert.equal(android.isIOS, false);
  assert.equal(android.isAndroid, true);
  assert.equal(android.isMobile, true);
});

test('detectStandaloneMode detects Android display-mode standalone and iOS navigator.standalone', () => {
  assert.equal(detectStandaloneMode(false, undefined), false);
  assert.equal(detectStandaloneMode(false, false), false);
  assert.equal(detectStandaloneMode(true, undefined), true);
  assert.equal(detectStandaloneMode(false, true), true);
});

test('detectHorizontalSwipe distinguishes intentional left/right swipes from taps and vertical scrolling', () => {
  // Intentional swipe left (next ayah)
  assert.equal(detectHorizontalSwipe(300, 400, 180, 412), 'left');
  // Intentional swipe right (prev ayah)
  assert.equal(detectHorizontalSwipe(120, 400, 260, 390), 'right');
  // Short tap / jitter should return null
  assert.equal(detectHorizontalSwipe(200, 400, 230, 402), null);
  // Vertical scroll with diagonal drift should return null
  assert.equal(detectHorizontalSwipe(200, 500, 110, 380), null);
});

test('getThemeStatusBarColor returns exact status bar hex color for light, sepia, and dark themes', () => {
  assert.equal(getThemeStatusBarColor('light'), '#f8fafc');
  assert.equal(getThemeStatusBarColor('sepia'), '#fbf5e8');
  assert.equal(getThemeStatusBarColor('dark'), '#0b1118');
});
