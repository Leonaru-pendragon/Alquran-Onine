import type { QariId } from '../types/quran.ts';
import { SURAH_METADATA_LIST } from '../data/quranMetadata.ts';
import {
  DEFAULT_QARI_ID,
  getAyahAudioUrl,
  getSurahFullAudioUrl,
  isValidQariId
} from '../services/quranApi.ts';
import { isTrustedAudioUrl, isValidSurahNumber, sanitizeUserInput } from './security.ts';

export type AppMainTab = 'surah' | 'reader' | 'hadith' | 'tajwid' | 'saved';
export type TajwidSubTab = 'pelajaran' | 'soal-buku' | 'lab' | 'kuis' | 'pdf';
export type SavedSubTab = 'dashboard' | 'bookmarks' | 'history';

export interface PersistedNavigationState {
  activeTab: AppMainTab;
  surahNomor: number;
  ayahNomor: number;
  tajwidTab: TajwidSubTab;
  savedTab: SavedSubTab;
  hadithBookSlug: string;
  hadithCategory: string;
}

export interface AudioTrackState {
  surahNomor: number;
  ayahNomor: number;
  audioUrl: string;
  isPlaying: boolean;
  isFullSurah?: boolean;
}

export interface PersistedAudioSession extends AudioTrackState {
  currentTime: number;
  updatedAt: number;
}

export const NAV_STATE_STORAGE_KEY = 'quran_nav_state_v1';
export const AUDIO_SESSION_STORAGE_KEY = 'quran_audio_session_v1';

const VALID_MAIN_TABS: readonly AppMainTab[] = ['surah', 'reader', 'hadith', 'tajwid', 'saved'];
const VALID_TAJWID_TABS: readonly TajwidSubTab[] = ['pelajaran', 'soal-buku', 'lab', 'kuis', 'pdf'];
const VALID_SAVED_TABS: readonly SavedSubTab[] = ['dashboard', 'bookmarks', 'history'];

export const DEFAULT_NAVIGATION_STATE: PersistedNavigationState = {
  activeTab: 'surah',
  surahNomor: 1,
  ayahNomor: 1,
  tajwidTab: 'pelajaran',
  savedTab: 'dashboard',
  hadithBookSlug: 'semua',
  hadithCategory: 'Semua Topik'
};

export function clampAyahForSurah(surahNomor: number, ayahNomor: unknown): number {
  const meta = SURAH_METADATA_LIST.find((s) => s.nomor === surahNomor);
  const maxAyat = meta?.jumlahAyat || 7;
  const num = typeof ayahNomor === 'number' ? Math.floor(ayahNomor) : Number(ayahNomor);
  if (!Number.isFinite(num) || num < 1) return 1;
  return Math.min(maxAyat, num);
}

/**
 * Builds a clean, subpath-safe URL hash representing the current view so refreshing
 * the browser or sharing the URL keeps the user on the exact same page.
 */
export function buildNavigationHash(state: PersistedNavigationState): string {
  switch (state.activeTab) {
    case 'reader': {
      const s = isValidSurahNumber(state.surahNomor) ? state.surahNomor : 1;
      const a = clampAyahForSurah(s, state.ayahNomor);
      return a > 1 ? `#/baca/${s}/${a}` : `#/baca/${s}`;
    }
    case 'hadith': {
      const slug = sanitizeUserInput(state.hadithBookSlug, 40).toLowerCase();
      return slug && slug !== 'semua' && /^[a-z0-9-]+$/.test(slug)
        ? `#/hadits/${slug}`
        : '#/hadits';
    }
    case 'tajwid': {
      const t = VALID_TAJWID_TABS.includes(state.tajwidTab) ? state.tajwidTab : 'pelajaran';
      return t !== 'pelajaran' ? `#/tajwid/${t}` : '#/tajwid';
    }
    case 'saved': {
      const sv = VALID_SAVED_TABS.includes(state.savedTab) ? state.savedTab : 'dashboard';
      return sv !== 'dashboard' ? `#/riwayat/${sv}` : '#/riwayat';
    }
    case 'surah':
    default:
      return '#/surah';
  }
}

/**
 * Parses a URL hash (e.g. `#/baca/36/12`, `#/tajwid/pdf`, `#/hadits/muslim`, `#/riwayat/bookmarks`)
 * into a validated partial navigation state. Returns null if hash is empty or unrecognized.
 */
export function parseNavigationHash(rawHash: string): Partial<PersistedNavigationState> | null {
  if (typeof rawHash !== 'string') return null;
  const trimmed = rawHash.trim().replace(/^#+/, '').replace(/^\/+/, '');
  if (!trimmed) return null;

  const segments = trimmed.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const root = segments[0].toLowerCase();

  if (root === 'surah' || root === 'daftar-surah') {
    return { activeTab: 'surah' };
  }

  if (root === 'baca' || root === 'reader') {
    const parsedSurah = segments[1] ? Number(segments[1]) : NaN;
    const surahNomor = isValidSurahNumber(parsedSurah) ? parsedSurah : undefined;
    const parsedAyah = segments[2] ? Number(segments[2]) : 1;
    return {
      activeTab: 'reader',
      ...(surahNomor !== undefined
        ? {
            surahNomor,
            ayahNomor: clampAyahForSurah(surahNomor, parsedAyah)
          }
        : {})
    };
  }

  if (root === 'hadits' || root === 'hadith') {
    const rawSlug = segments[1] ? sanitizeUserInput(decodeURIComponent(segments[1]), 40).toLowerCase() : '';
    const safeSlug = rawSlug && /^[a-z0-9-]+$/.test(rawSlug) ? rawSlug : 'semua';
    return {
      activeTab: 'hadith',
      hadithBookSlug: safeSlug
    };
  }

  if (root === 'tajwid') {
    const sub = segments[1]?.toLowerCase() as TajwidSubTab | undefined;
    return {
      activeTab: 'tajwid',
      tajwidTab: sub && VALID_TAJWID_TABS.includes(sub) ? sub : 'pelajaran'
    };
  }

  if (root === 'riwayat' || root === 'saved' || root === 'tersimpan') {
    const sub = segments[1]?.toLowerCase() as SavedSubTab | undefined;
    return {
      activeTab: 'saved',
      savedTab: sub && VALID_SAVED_TABS.includes(sub) ? sub : 'dashboard'
    };
  }

  return null;
}

/**
 * Validates and normalizes persisted navigation JSON from localStorage.
 */
export function validateNavigationState(raw: unknown): PersistedNavigationState | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;

  const activeTab: AppMainTab = VALID_MAIN_TABS.includes(obj.activeTab as AppMainTab)
    ? (obj.activeTab as AppMainTab)
    : 'surah';

  const surahNomor = isValidSurahNumber(obj.surahNomor) ? obj.surahNomor : 1;
  const ayahNomor = clampAyahForSurah(surahNomor, obj.ayahNomor);

  const tajwidTab: TajwidSubTab = VALID_TAJWID_TABS.includes(obj.tajwidTab as TajwidSubTab)
    ? (obj.tajwidTab as TajwidSubTab)
    : 'pelajaran';

  const savedTab: SavedSubTab = VALID_SAVED_TABS.includes(obj.savedTab as SavedSubTab)
    ? (obj.savedTab as SavedSubTab)
    : 'dashboard';

  const rawBook = sanitizeUserInput(obj.hadithBookSlug, 40).toLowerCase();
  const hadithBookSlug = rawBook && /^[a-z0-9-]+$/.test(rawBook) ? rawBook : 'semua';
  const hadithCategory = sanitizeUserInput(obj.hadithCategory, 60) || 'Semua Topik';

  return {
    activeTab,
    surahNomor,
    ayahNomor,
    tajwidTab,
    savedTab,
    hadithBookSlug,
    hadithCategory
  };
}

/**
 * Resolves the initial navigation state on page load or refresh by combining
 * persisted localStorage state with any explicit URL hash.
 */
export function resolveInitialNavigationState(
  rawHash: string,
  storedRaw: unknown
): PersistedNavigationState {
  const stored = validateNavigationState(storedRaw) || DEFAULT_NAVIGATION_STATE;
  const fromHash = parseNavigationHash(rawHash);
  if (!fromHash) {
    return stored;
  }
  return {
    ...stored,
    ...fromHash
  };
}

/**
 * Validates a persisted audio playback session from localStorage so refreshing or
 * re-opening the app restores the active Murottal player bar seamlessly.
 */
export function validatePersistedAudioSession(
  raw: unknown,
  qariId: QariId = DEFAULT_QARI_ID
): PersistedAudioSession | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;

  if (!isValidSurahNumber(obj.surahNomor)) return null;
  const surahNomor = obj.surahNomor;
  const ayahNomor = clampAyahForSurah(surahNomor, obj.ayahNomor);
  const isFullSurah = Boolean(obj.isFullSurah);
  const safeQari = isValidQariId(qariId) ? qariId : DEFAULT_QARI_ID;

  const fallbackUrl = isFullSurah
    ? getSurahFullAudioUrl(surahNomor, safeQari)
    : getAyahAudioUrl(surahNomor, ayahNomor, safeQari);

  const audioUrl = isTrustedAudioUrl(obj.audioUrl) ? (obj.audioUrl as string) : fallbackUrl;
  const rawTime = typeof obj.currentTime === 'number' && Number.isFinite(obj.currentTime) ? obj.currentTime : 0;
  const currentTime = Math.max(0, Math.min(36_000, rawTime));
  const updatedAt =
    typeof obj.updatedAt === 'number' && Number.isFinite(obj.updatedAt) ? obj.updatedAt : Date.now();

  return {
    surahNomor,
    ayahNomor,
    audioUrl,
    isPlaying: Boolean(obj.isPlaying),
    isFullSurah,
    currentTime,
    updatedAt
  };
}

/**
 * Pure synchronous calculator for the next Murottal track (ayah-by-ayah or full-surah).
 * Used synchronously inside the HTMLAudioElement `ended` event so mobile browsers
 * (iOS Safari / Android Chrome) maintain continuous background playback when minimized.
 */
export function computeNextAudioTrack(
  current: AudioTrackState,
  qariId: QariId = DEFAULT_QARI_ID
): AudioTrackState | null {
  const safeQari = isValidQariId(qariId) ? qariId : DEFAULT_QARI_ID;

  if (current.isFullSurah) {
    if (current.surahNomor < 114) {
      const nextSurah = current.surahNomor + 1;
      return {
        surahNomor: nextSurah,
        ayahNomor: 1,
        audioUrl: getSurahFullAudioUrl(nextSurah, safeQari),
        isPlaying: true,
        isFullSurah: true
      };
    }
    return null;
  }

  const currentMeta = SURAH_METADATA_LIST.find((s) => s.nomor === current.surahNomor);
  const totalAyat = currentMeta?.jumlahAyat || 7;
  const nextAyah = current.ayahNomor + 1;

  if (nextAyah <= totalAyat) {
    return {
      surahNomor: current.surahNomor,
      ayahNomor: nextAyah,
      audioUrl: getAyahAudioUrl(current.surahNomor, nextAyah, safeQari),
      isPlaying: true,
      isFullSurah: false
    };
  }

  if (current.surahNomor < 114) {
    const nextSurah = current.surahNomor + 1;
    return {
      surahNomor: nextSurah,
      ayahNomor: 1,
      audioUrl: getAyahAudioUrl(nextSurah, 1, safeQari),
      isPlaying: true,
      isFullSurah: false
    };
  }

  return null;
}

/**
 * Pure synchronous calculator for the previous Murottal track.
 */
export function computePrevAudioTrack(
  current: AudioTrackState,
  qariId: QariId = DEFAULT_QARI_ID
): AudioTrackState | null {
  const safeQari = isValidQariId(qariId) ? qariId : DEFAULT_QARI_ID;

  if (current.isFullSurah) {
    if (current.surahNomor > 1) {
      const prevSurah = current.surahNomor - 1;
      return {
        surahNomor: prevSurah,
        ayahNomor: 1,
        audioUrl: getSurahFullAudioUrl(prevSurah, safeQari),
        isPlaying: true,
        isFullSurah: true
      };
    }
    return null;
  }

  const prevAyah = current.ayahNomor - 1;
  if (prevAyah >= 1) {
    return {
      surahNomor: current.surahNomor,
      ayahNomor: prevAyah,
      audioUrl: getAyahAudioUrl(current.surahNomor, prevAyah, safeQari),
      isPlaying: true,
      isFullSurah: false
    };
  }

  if (current.surahNomor > 1) {
    const prevSurah = current.surahNomor - 1;
    const prevMeta = SURAH_METADATA_LIST.find((s) => s.nomor === prevSurah);
    const lastAyahOfPrev = prevMeta?.jumlahAyat || 1;
    return {
      surahNomor: prevSurah,
      ayahNomor: lastAyahOfPrev,
      audioUrl: getAyahAudioUrl(prevSurah, lastAyahOfPrev, safeQari),
      isPlaying: true,
      isFullSurah: false
    };
  }

  return null;
}
