import type { ReadingTheme } from '../types/quran';

export interface MobilePlatformInfo {
  isIOS: boolean;
  isIPadOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
}

/**
 * Accurately detects Android, iPhone/iPod/iPad, and modern iPadOS 13+
 * (which reports MacIntel in userAgent/platform with maxTouchPoints > 1).
 */
export function detectMobilePlatform(
  userAgent: string,
  maxTouchPoints = 0,
  platform = ''
): MobilePlatformInfo {
  const ua = userAgent.toLowerCase();
  const plat = platform.toLowerCase();

  const isClassicIOS = /iphone|ipad|ipod/.test(ua);
  const isIPadOS =
    !isClassicIOS &&
    maxTouchPoints > 1 &&
    (/macintosh|macintel/.test(ua) || /macintel/.test(plat));

  const isIOS = isClassicIOS || isIPadOS;
  const isAndroid = /android/.test(ua);
  const isMobile = isIOS || isAndroid || /mobile/.test(ua);

  return {
    isIOS,
    isIPadOS,
    isAndroid,
    isMobile
  };
}

/**
 * Determines whether the web app is already running as an installed standalone PWA
 * on Android (display-mode: standalone / minimal-ui / fullscreen) or iOS Safari (navigator.standalone).
 */
export function detectStandaloneMode(
  matchMediaStandalone: boolean,
  navigatorStandalone?: boolean
): boolean {
  return Boolean(matchMediaStandalone || navigatorStandalone === true);
}

/**
 * Evaluates a touch gesture and returns 'left' or 'right' if it qualifies as an intentional
 * horizontal swipe without vertical scroll drift.
 */
export function detectHorizontalSwipe(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  minDistance = 64,
  maxVerticalDrift = 48
): 'left' | 'right' | null {
  const dx = endX - startX;
  const dy = Math.abs(endY - startY);

  if (Math.abs(dx) < minDistance || dy > maxVerticalDrift) {
    return null;
  }
  if (Math.abs(dx) < dy * 1.5) {
    return null;
  }
  return dx < 0 ? 'left' : 'right';
}

export type DeviceFormFactor = 'phone' | 'tablet' | 'desktop';
export type ViewportOrientation = 'portrait' | 'landscape';

export interface DeviceLayoutProfile {
  formFactor: DeviceFormFactor;
  orientation: ViewportOrientation;
  isCompactPhone: boolean;
  isTabletPortrait: boolean;
  isTabletLandscape: boolean;
  useBottomNavigationDock: boolean;
  recommendedArabicFontSize: number;
}

/**
 * Evaluates viewport dimensions + touch/UA signals to classify narrow phones, standard phones,
 * tablets/iPads (both portrait & landscape), and desktop screens accurately.
 */
export function detectDeviceLayoutProfile(
  width: number,
  height: number,
  userAgent = '',
  maxTouchPoints = 0,
  platform = ''
): DeviceLayoutProfile {
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);
  const orientation: ViewportOrientation = safeWidth > safeHeight ? 'landscape' : 'portrait';
  const ua = userAgent.toLowerCase();
  const mobileInfo = detectMobilePlatform(userAgent, maxTouchPoints, platform);

  const minEdge = Math.min(safeWidth, safeHeight);
  const maxEdge = Math.max(safeWidth, safeHeight);

  const isExplicitTabletUA =
    /ipad|tablet|playbook|silk/.test(ua) ||
    mobileInfo.isIPadOS ||
    (/android/.test(ua) && !/mobile/.test(ua));

  let formFactor: DeviceFormFactor;
  if (safeWidth < 768 && minEdge < 600 && !isExplicitTabletUA) {
    formFactor = 'phone';
  } else if (
    isExplicitTabletUA ||
    (minEdge >= 600 && maxEdge <= 1366 && (maxTouchPoints > 0 || safeWidth < 1200))
  ) {
    formFactor = 'tablet';
  } else if (safeWidth < 768) {
    formFactor = 'phone';
  } else if (safeWidth < 1024) {
    formFactor = 'tablet';
  } else {
    formFactor = 'desktop';
  }

  const isCompactPhone = formFactor === 'phone' && safeWidth > 0 && safeWidth <= 375;
  const isTabletPortrait = formFactor === 'tablet' && orientation === 'portrait';
  const isTabletLandscape = formFactor === 'tablet' && orientation === 'landscape';

  // Use bottom thumb bar / floating iPad dock on viewports < 1024px so top navbar never collides
  const useBottomNavigationDock = safeWidth < 1024;

  const recommendedArabicFontSize = isCompactPhone
    ? 26
    : formFactor === 'phone'
    ? 28
    : formFactor === 'tablet'
    ? 32
    : 30;

  return {
    formFactor,
    orientation,
    isCompactPhone,
    isTabletPortrait,
    isTabletLandscape,
    useBottomNavigationDock,
    recommendedArabicFontSize
  };
}

/**
 * Maps the active reading theme to the exact system status bar / Safari toolbar hex color.
 */
export function getThemeStatusBarColor(theme: ReadingTheme): string {
  if (theme === 'dark') return '#0b1118';
  if (theme === 'sepia') return '#fbf5e8';
  return '#f8fafc';
}
