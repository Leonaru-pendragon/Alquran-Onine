import { detectMobilePlatform } from './mobilePlatform.ts';
import {
  buildSignedAndroidApk,
  buildAppleIpaArchive
} from './mobileBinaryBuilders.ts';

export type MobileDeviceTargetId =
  | 'android-phone'
  | 'android-tablet'
  | 'ios-iphone'
  | 'ios-ipad';

export type InstallerFormatId =
  | 'android-apk'
  | 'android-tablet-apk'
  | 'ios-ipa'
  | 'ipados-ipa';

export interface InstallerFormatSpec {
  formatId: InstallerFormatId;
  deviceId: MobileDeviceTargetId;
  deviceLabel: string;
  shortDeviceLabel: string;
  formatTitle: string;
  fileName: string;
  fileExtension: '.apk' | '.ipa';
  mimeType: string;
  summary: string;
  installSteps: string[];
}

export interface GeneratedInstallerPayload {
  spec: InstallerFormatSpec;
  bytes: Uint8Array;
}

export const INSTALLER_FORMATS: readonly InstallerFormatSpec[] = [
  {
    formatId: 'android-apk',
    deviceId: 'android-phone',
    deviceLabel: 'HP Android',
    shortDeviceLabel: 'Android',
    formatTitle: 'Paket Aplikasi Android (.apk)',
    fileName: 'Al-Quran-Digital-Android.apk',
    fileExtension: '.apk',
    mimeType: 'application/vnd.android.package-archive',
    summary:
      'File instalasi aplikasi Android (.apk) bertanda tangan digital (APK Signature v1 & v2) khusus untuk smartphone Android.',
    installSteps: [
      'Ketuk tombol Unduh untuk menyimpan file Al-Quran-Digital-Android.apk ke HP Android Anda.',
      'Buka file .apk dari notifikasi unduhan peramban atau aplikasi File Manager di folder Download.',
      'Jika muncul konfirmasi keamanan pertama kali, aktifkan "Izinkan dari sumber ini", lalu ketuk Instal (Install).'
    ]
  },
  {
    formatId: 'android-tablet-apk',
    deviceId: 'android-tablet',
    deviceLabel: 'Tablet Android',
    shortDeviceLabel: 'Tablet',
    formatTitle: 'Paket Aplikasi Tablet Android (.apk)',
    fileName: 'Al-Quran-Digital-Tablet-Android.apk',
    fileExtension: '.apk',
    mimeType: 'application/vnd.android.package-archive',
    summary:
      'File instalasi aplikasi Android (.apk) khusus Tablet Android dengan dukungan layar lebar, rotasi potret/lanskap, dan Split-Screen.',
    installSteps: [
      'Unduh file Al-Quran-Digital-Tablet-Android.apk ke Tablet Android Anda.',
      'Buka file dari panel unduhan atau File Manager di folder Download.',
      'Pilih Instal (Install) untuk memasang ikon Al-Qur\'an Digital langsung di layar utama Tablet.'
    ]
  },
  {
    formatId: 'ios-ipa',
    deviceId: 'ios-iphone',
    deviceLabel: 'iPhone (iOS)',
    shortDeviceLabel: 'iPhone',
    formatTitle: 'Paket Aplikasi Apple iOS (.ipa)',
    fileName: 'Al-Quran-Digital-iPhone.ipa',
    fileExtension: '.ipa',
    mimeType: 'application/octet-stream',
    summary:
      'Paket arsip aplikasi iOS (.ipa — ARM64 Bundle) khusus untuk perangkat iPhone dengan dukungan pemutaran audio latar belakang.',
    installSteps: [
      'Unduh file Al-Quran-Digital-iPhone.ipa ke perangkat iPhone Anda.',
      'Buka dan pasang file .ipa menggunakan pemasang IPA iOS pilihan Anda (AltStore, Sideloadly, Scarlet, Feather, atau TrollStore).',
      'Setelah terpasang dan dipercayai pada Pengaturan -> Umum -> Manajemen VPN & Perangkat, buka Al-Qur\'an Digital dari Home Screen.'
    ]
  },
  {
    formatId: 'ipados-ipa',
    deviceId: 'ios-ipad',
    deviceLabel: 'iPad (iPadOS)',
    shortDeviceLabel: 'iPad',
    formatTitle: 'Paket Aplikasi Apple iPadOS (.ipa)',
    fileName: 'Al-Quran-Digital-iPad.ipa',
    fileExtension: '.ipa',
    mimeType: 'application/octet-stream',
    summary:
      'Paket arsip aplikasi iPadOS (.ipa — ARM64 Bundle) khusus untuk iPad dengan dukungan orientasi potret, lanskap, dan Split View.',
    installSteps: [
      'Unduh file Al-Quran-Digital-iPad.ipa ke perangkat iPad Anda.',
      'Pasang file .ipa melalui AltStore, Sideloadly, Scarlet, Feather, atau TrollStore di iPadOS.',
      'Buka Al-Qur\'an Digital langsung dari Layar Utama atau Dock iPad Anda.'
    ]
  }
];

const FORMAT_MAP = new Map<InstallerFormatId, InstallerFormatSpec>(
  INSTALLER_FORMATS.map((spec) => [spec.formatId, spec])
);

export function isValidInstallerFormatId(value: unknown): value is InstallerFormatId {
  return typeof value === 'string' && FORMAT_MAP.has(value as InstallerFormatId);
}

export function getInstallerFormatSpec(formatId: InstallerFormatId): InstallerFormatSpec {
  return FORMAT_MAP.get(formatId) || INSTALLER_FORMATS[0];
}

export function getPrimaryFormatForMobileDevice(
  deviceId: MobileDeviceTargetId
): InstallerFormatId {
  switch (deviceId) {
    case 'android-phone':
      return 'android-apk';
    case 'android-tablet':
      return 'android-tablet-apk';
    case 'ios-iphone':
      return 'ios-ipa';
    case 'ios-ipad':
      return 'ipados-ipa';
  }
}

/**
 * Strictly classifies Mobile & Tablet devices ONLY:
 * - HP Android -> 'android-phone' (.apk)
 * - Tablet Android -> 'android-tablet' (.apk)
 * - iPhone / iPod -> 'ios-iphone' (.ipa)
 * - iPad / iPadOS 13+ -> 'ios-ipad' (.ipa)
 * - Desktop (Windows, macOS, Linux, ChromeOS) -> null (not eligible for mobile download UI)
 */
export function detectMobileDeviceTarget(
  userAgent: string,
  maxTouchPoints = 0,
  platform = '',
  screenShortSide = 0
): MobileDeviceTargetId | null {
  const ua = (userAgent || '').toLowerCase();
  const mobileInfo = detectMobilePlatform(
    userAgent || '',
    maxTouchPoints,
    platform || '',
    screenShortSide
  );

  if (mobileInfo.isIOS) {
    if (mobileInfo.isIPadOS || mobileInfo.isTablet || /ipad/.test(ua)) {
      return 'ios-ipad';
    }
    return 'ios-iphone';
  }

  if (mobileInfo.isAndroid) {
    if (mobileInfo.isTablet) {
      return 'android-tablet';
    }
    return 'android-phone';
  }

  // Generic mobile/tablet UA tokens (e.g. HarmonyOS / KaiOS / Silk / PlayBook) default to Android APK
  if (mobileInfo.isTablet) {
    return 'android-tablet';
  }
  if (mobileInfo.isMobile) {
    return 'android-phone';
  }

  return null;
}

/**
 * Browser helper returning the detected Mobile/Tablet target, or null on Desktop PCs/Laptops.
 */
export function detectBrowserMobileDeviceTarget(): MobileDeviceTargetId | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return null;
  }
  const ua = navigator.userAgent || '';
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const platform = navigator.platform || '';
  const shortSide =
    typeof window.screen !== 'undefined'
      ? Math.min(
          window.screen.width || window.innerWidth,
          window.screen.height || window.innerHeight
        )
      : Math.min(window.innerWidth || 0, window.innerHeight || 0);

  return detectMobileDeviceTarget(ua, maxTouchPoints, platform, shortSide);
}

/**
 * Normalizes and validates the application base URL embedded inside .apk / .ipa packages.
 */
export function sanitizeInstallerAppUrl(
  rawUrl: unknown,
  fallbackUrl = 'https://localhost:3000/'
): string {
  const safeDefault = 'https://localhost:3000/';

  const tryNormalize = (candidate: unknown): string | null => {
    if (typeof candidate !== 'string') return null;
    const trimmed = candidate.trim();
    if (!trimmed || trimmed.length > 1024) return null;
    if (/[\r\n\0"'`<>|;&]/.test(trimmed)) return null;

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return null;
      }
      if (parsed.username || parsed.password) {
        return null;
      }
      parsed.search = '';
      parsed.hash = '';
      parsed.pathname = parsed.pathname.replace(/\/index\.html$/i, '/');
      if (!parsed.pathname.endsWith('/')) {
        parsed.pathname = `${parsed.pathname}/`;
      }
      const normalized = parsed.toString();
      if (/[\r\n\0"'`<>|;&]/.test(normalized)) {
        return null;
      }
      return normalized;
    } catch {
      return null;
    }
  };

  return tryNormalize(rawUrl) || tryNormalize(fallbackUrl) || safeDefault;
}

function resolveBrowserAppBaseUrl(): string {
  if (typeof window === 'undefined' || !window.location) {
    return 'https://localhost:3000/';
  }
  const { origin, pathname } = window.location;
  const cleanPath = pathname
    .replace(/\/gh-pages-preview\/?$/i, '/')
    .replace(/\/index\.html$/i, '/');
  return sanitizeInstallerAppUrl(`${origin}${cleanPath}`);
}

/**
 * Builds the binary .apk or .ipa package for any of the 4 Mobile/Tablet device targets.
 */
export async function buildInstallerFilePayload(
  formatId: InstallerFormatId,
  rawAppUrl: string,
  options?: { iconPngBytes?: Uint8Array }
): Promise<GeneratedInstallerPayload> {
  const spec = getInstallerFormatSpec(formatId);
  const appUrl = sanitizeInstallerAppUrl(rawAppUrl);
  const iconPngBytes = options?.iconPngBytes;

  switch (spec.formatId) {
    case 'android-apk':
      return {
        spec,
        bytes: await buildSignedAndroidApk({
          appUrl,
          isTablet: false,
          iconPngBytes
        })
      };

    case 'android-tablet-apk':
      return {
        spec,
        bytes: await buildSignedAndroidApk({
          appUrl,
          isTablet: true,
          iconPngBytes
        })
      };

    case 'ios-ipa':
      return {
        spec,
        bytes: await buildAppleIpaArchive({
          appUrl,
          isIPad: false,
          iconPngBytes
        })
      };

    case 'ipados-ipa':
      return {
        spec,
        bytes: await buildAppleIpaArchive({
          appUrl,
          isIPad: true,
          iconPngBytes
        })
      };
  }
}

let cachedBrowserIconBytes: Uint8Array | null = null;

async function loadBrowserAppIconBytes(appUrl: string): Promise<Uint8Array | undefined> {
  if (cachedBrowserIconBytes !== null) {
    return cachedBrowserIconBytes.length > 0 ? cachedBrowserIconBytes : undefined;
  }
  if (typeof window === 'undefined' || typeof fetch !== 'function') {
    return undefined;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const iconUrl = new URL('pwa-192x192.png', appUrl).toString();
    const res = await fetch(iconUrl, { signal: controller.signal });
    if (!res.ok) {
      cachedBrowserIconBytes = new Uint8Array(0);
      return undefined;
    }
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (bytes.length > 0 && bytes.length < 500_000) {
      cachedBrowserIconBytes = bytes;
      return bytes;
    }
    return undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Generates and downloads the binary .apk or .ipa package directly in the mobile/tablet browser
 * (works identically on Express full-stack and static GitHub Pages).
 */
export async function triggerDeviceInstallerDownload(
  formatId?: InstallerFormatId,
  customAppUrl?: string
): Promise<GeneratedInstallerPayload> {
  const detectedMobile = detectBrowserMobileDeviceTarget();
  const resolvedFormatId =
    formatId && isValidInstallerFormatId(formatId)
      ? formatId
      : getPrimaryFormatForMobileDevice(detectedMobile || 'android-phone');

  const appUrl = sanitizeInstallerAppUrl(customAppUrl || resolveBrowserAppBaseUrl());
  const iconPngBytes = await loadBrowserAppIconBytes(appUrl);
  const payload = await buildInstallerFilePayload(resolvedFormatId, appUrl, { iconPngBytes });

  if (typeof document !== 'undefined' && typeof URL !== 'undefined' && typeof Blob !== 'undefined') {
    const blob = new Blob([payload.bytes as BlobPart], { type: payload.spec.mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = payload.spec.fileName;
    anchor.rel = 'noopener';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => {
      if (anchor.parentNode) {
        anchor.parentNode.removeChild(anchor);
      }
      URL.revokeObjectURL(objectUrl);
    }, 2000);
  }

  return payload;
}
