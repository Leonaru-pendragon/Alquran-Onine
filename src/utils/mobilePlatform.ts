import type { ReadingTheme } from '../types/quran';

export interface MobilePlatformInfo {
  isIOS: boolean;
  isIPadOS: boolean;
  isAndroid: boolean;
  isTablet: boolean;
  isMobile: boolean;
}

/**
 * Accurately detects Android phones/tablets, iPhone/iPod, classic iPad, and modern iPadOS 13+
 * (which reports MacIntel in userAgent/platform with maxTouchPoints > 1).
 */
export function detectMobilePlatform(
  userAgent: string,
  maxTouchPoints = 0,
  platform = '',
  screenShortSide = 0
): MobilePlatformInfo {
  const ua = userAgent.toLowerCase();
  const plat = platform.toLowerCase();

  const isClassicIPad = /ipad/.test(ua);
  const isClassicIOS = /iphone|ipad|ipod/.test(ua);
  const isIPadOS =
    !isClassicIOS &&
    maxTouchPoints > 1 &&
    (/macintosh|macintel/.test(ua) || /macintel/.test(plat));

  const isIOS = isClassicIOS || isIPadOS;
  const isAndroid = /android/.test(ua);
  const isAndroidTablet = isAndroid && !/mobile/.test(ua);
  const isGenericTablet = /tablet|playbook|silk/.test(ua);
  const isTouchTabletBySize =
    (isIOS || isAndroid || maxTouchPoints > 1) && screenShortSide >= 600 && !/iphone|ipod/.test(ua);

  const isTablet = isClassicIPad || isIPadOS || isAndroidTablet || isGenericTablet || isTouchTabletBySize;
  const isMobile = isIOS || isAndroid || isTablet || /mobile/.test(ua);

  return {
    isIOS,
    isIPadOS,
    isAndroid,
    isTablet,
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

/**
 * Maps the active reading theme to the exact system status bar / Safari toolbar hex color.
 */
export function getThemeStatusBarColor(theme: ReadingTheme): string {
  if (theme === 'dark') return '#0b1118';
  if (theme === 'sepia') return '#fbf5e8';
  return '#f8fafc';
}

export interface DeviceLayoutProfile {
  formFactor: 'phone' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  isCompactPhone: boolean;
  isTabletPortrait: boolean;
  isTabletLandscape: boolean;
  useBottomNavigationDock: boolean;
  platformInfo: MobilePlatformInfo;
}

/**
 * Classifies device layout ergonomics across compact phones, standard phones,
 * iPadOS / Android tablets (portrait & landscape), and desktop viewports.
 */
export function detectDeviceLayoutProfile(
  width: number,
  height: number,
  userAgent: string,
  maxTouchPoints = 0,
  platform = ''
): DeviceLayoutProfile {
  const shortSide = Math.min(width, height);
  const platformInfo = detectMobilePlatform(userAgent, maxTouchPoints, platform, shortSide);
  const orientation: 'portrait' | 'landscape' = height >= width ? 'portrait' : 'landscape';

  let formFactor: 'phone' | 'tablet' | 'desktop';
  if (platformInfo.isTablet || (width >= 640 && width < 1024 && maxTouchPoints > 0)) {
    formFactor = 'tablet';
  } else if (platformInfo.isMobile || width < 640) {
    formFactor = 'phone';
  } else {
    formFactor = 'desktop';
  }

  const isCompactPhone = formFactor === 'phone' && width < 380;
  const isTabletPortrait = formFactor === 'tablet' && orientation === 'portrait';
  const isTabletLandscape = formFactor === 'tablet' && orientation === 'landscape';
  const useBottomNavigationDock =
    formFactor === 'phone' ||
    (formFactor === 'tablet' && (orientation === 'portrait' || width < 1024));

  return {
    formFactor,
    orientation,
    isCompactPhone,
    isTabletPortrait,
    isTabletLandscape,
    useBottomNavigationDock,
    platformInfo
  };
}
