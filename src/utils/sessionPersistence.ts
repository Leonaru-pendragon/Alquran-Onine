import type { QariId } from '../types/quran.ts';
import { SURAH_METADATA_LIST } from '../data/quranMetadata.ts';
import {
  DEFAULT_QARI_ID,
  getAyahAudioUrl,
  getSurahFullAudioUrl,
  isValidQariId
} from '../services/quranApi.ts';
import {
  isValidAyahNumber,
  isValidSurahNumber,
  safeJsonParse,
  sanitizeAudioUrl,
  sanitizeUserInput
} from './security.ts';

export type AppTabId = 'surah' | 'reader' | 'hadith' | 'tajwid' | 'saved';
export type TajwidSubTab = 'pelajaran' | 'soal-buku' | 'lab' | 'kuis' | 'pdf';
export type SavedSubTab = 'dashboard' | 'bookmarks' | 'history';

export interface PersistedNavigationState {
  activeTab: AppTabId;
  surahNomor: number;
  ayahNomor: number;
  tajwidSection: TajwidSubTab;
  savedSubTab: SavedSubTab;
  hadithBookSlug: string;
  scrollY: number;
  updatedAt: number;
}

export interface AudioTrackTarget {
  surahNomor: number;
  ayahNomor: number;
  audioUrl: string;
  isPlaying: boolean;
  isFullSurah: boolean;
}

export interface PersistedAudioSession extends AudioTrackTarget {
  currentTime: number;
  speedIndex: number;
  isRepeat: boolean;
  updatedAt: number;
}

export const NAV_STATE_STORAGE_KEY = 'quran_nav_state_v1';
export const AUDIO_SESSION_STORAGE_KEY = 'quran_audio_state_v1';

const VALID_APP_TABS: readonly AppTabId[] = ['surah', 'reader', 'hadith', 'tajwid', 'saved'];
const VALID_TAJWID_TABS: readonly TajwidSubTab[] = ['pelajaran', 'soal-buku', 'lab', 'kuis', 'pdf'];
const VALID_SAVED_TABS: readonly SavedSubTab[] = ['dashboard', 'bookmarks', 'history'];

export const DEFAULT_NAVIGATION_STATE: PersistedNavigationState = {
  activeTab: 'surah',
  surahNomor: 1,
  ayahNomor: 1,
  tajwidSection: 'pelajaran',
  savedSubTab: 'dashboard',
  hadithBookSlug: 'semua',
  scrollY: 0,
  updatedAt: 0
};

function clampAyahForSurah(surahNomor: number, ayahNomor: unknown): number {
  const meta = SURAH_METADATA_LIST.find((s) => s.nomor === surahNomor);
  const maxAyat = meta?.jumlahAyat ?? 7;
  if (isValidAyahNumber(ayahNomor, maxAyat)) {
    return ayahNomor;
  }
  return 1;
}

/**
 * Serializes navigation state into a GitHub-Pages-safe URL hash (`#/...`).
 */
export function serializeNavHash(state: Pick<
  PersistedNavigationState,
  'activeTab' | 'surahNomor' | 'ayahNomor' | 'tajwidSection' | 'savedSubTab' | 'hadithBookSlug'
>): string {
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
      const sec = VALID_TAJWID_TABS.includes(state.tajwidSection)
        ? state.tajwidSection
        : 'pelajaran';
      return sec !== 'pelajaran' ? `#/tajwid/${sec}` : '#/tajwid';
    }
    case 'saved': {
      const sub = VALID_SAVED_TABS.includes(state.savedSubTab)
        ? state.savedSubTab
        : 'dashboard';
      return sub !== 'dashboard' ? `#/riwayat/${sub}` : '#/riwayat';
    }
    case 'surah':
    default:
      return '#/surah';
  }
}

/**
 * Parses a URL hash (`window.location.hash`) into a validated partial navigation state.
 * Returns null if the hash is empty (`""`, `"#"`, `"#/"`) or unrecognized.
 */
export function parseNavHash(rawHash: string): Partial<PersistedNavigationState> | null {
  if (typeof rawHash !== 'string') return null;
  const trimmed = rawHash.trim().replace(/^#\/?/, '').replace(/\/+$/, '');
  if (!trimmed) return null;

  const segments = trimmed.split('/').map((seg) => {
    try {
      return decodeURIComponent(seg).trim();
    } catch {
      return seg.trim();
    }
  });

  const head = (segments[0] || '').toLowerCase();

  if (head === 'surah' || head === 'beranda') {
    return { activeTab: 'surah' };
  }

  if (head === 'baca' || head === 'reader') {
    const rawSurah = segments[1] ? Number(segments[1]) : NaN;
    const result: Partial<PersistedNavigationState> = { activeTab: 'reader' };
    if (isValidSurahNumber(rawSurah)) {
      result.surahNomor = rawSurah;
      const rawAyah = segments[2] ? Number(segments[2]) : 1;
      result.ayahNomor = clampAyahForSurah(rawSurah, rawAyah);
    }
    return result;
  }

  if (head === 'hadits' || head === 'hadith') {
    const rawSlug = (segments[1] || '').toLowerCase();
    const validSlug = rawSlug && /^[a-z0-9-]+$/.test(rawSlug) ? rawSlug : 'semua';
    return {
      activeTab: 'hadith',
      hadithBookSlug: validSlug
    };
  }

  if (head === 'tajwid') {
    const rawSec = (segments[1] || '').toLowerCase() as TajwidSubTab;
    return {
      activeTab: 'tajwid',
      tajwidSection: VALID_TAJWID_TABS.includes(rawSec) ? rawSec : 'pelajaran'
    };
  }

  if (head === 'riwayat' || head === 'saved' || head === 'tersimpan') {
    const rawSub = (segments[1] || '').toLowerCase() as SavedSubTab;
    return {
      activeTab: 'saved',
      savedSubTab: VALID_SAVED_TABS.includes(rawSub) ? rawSub : 'dashboard'
    };
  }

  return null;
}

/**
 * Validates a persisted navigation state object loaded from storage.
 */
export function validatePersistedNavigationState(raw: unknown): PersistedNavigationState | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;

  const activeTab: AppTabId = VALID_APP_TABS.includes(obj.activeTab as AppTabId)
    ? (obj.activeTab as AppTabId)
    : 'surah';

  const surahNomor = isValidSurahNumber(obj.surahNomor) ? obj.surahNomor : 1;
  const ayahNomor = clampAyahForSurah(surahNomor, obj.ayahNomor);

  const tajwidSection: TajwidSubTab = VALID_TAJWID_TABS.includes(obj.tajwidSection as TajwidSubTab)
    ? (obj.tajwidSection as TajwidSubTab)
    : 'pelajaran';

  const savedSubTab: SavedSubTab = VALID_SAVED_TABS.includes(obj.savedSubTab as SavedSubTab)
    ? (obj.savedSubTab as SavedSubTab)
    : 'dashboard';

  const rawSlug = typeof obj.hadithBookSlug === 'string' ? obj.hadithBookSlug.trim().toLowerCase() : '';
  const hadithBookSlug = rawSlug && /^[a-z0-9-]+$/.test(rawSlug) ? rawSlug : 'semua';

  const rawScroll = typeof obj.scrollY === 'number' && Number.isFinite(obj.scrollY) ? obj.scrollY : 0;
  const scrollY = Math.max(0, Math.min(200_000, Math.round(rawScroll)));

  const updatedAt =
    typeof obj.updatedAt === 'number' && Number.isFinite(obj.updatedAt) ? obj.updatedAt : 0;

  return {
    activeTab,
    surahNomor,
    ayahNomor,
    tajwidSection,
    savedSubTab,
    hadithBookSlug,
    scrollY,
    updatedAt
  };
}

/**
 * Resolves initial navigation state on page load / refresh / PWA relaunch.
 * - Restores stored navigation state from localStorage first (so PWA launch or root refresh stays on current page).
 * - Applies explicit URL hash on top (so deep links, F5 on hashed URL, and Back/Forward buttons work accurately).
 */
export function resolveInitialNavigationState(
  rawHash: string,
  storedRaw: unknown
): PersistedNavigationState {
  const stored = validatePersistedNavigationState(storedRaw) ?? { ...DEFAULT_NAVIGATION_STATE };
  const fromHash = parseNavHash(rawHash);

  if (!fromHash) {
    return stored;
  }

  const nextTab = fromHash.activeTab ?? stored.activeTab;
  const nextSurah = fromHash.surahNomor ?? stored.surahNomor;
  const isSameContext =
    nextTab === stored.activeTab &&
    (nextTab !== 'reader' || nextSurah === stored.surahNomor);

  return {
    ...stored,
    ...fromHash,
    surahNomor: nextSurah,
    ayahNomor:
      fromHash.ayahNomor !== undefined
        ? fromHash.ayahNomor
        : nextSurah === stored.surahNomor
          ? stored.ayahNomor
          : 1,
    scrollY: isSameContext ? stored.scrollY : 0
  };
}

/**
 * Validates a persisted audio session from localStorage.
 */
export function validatePersistedAudioSession(
  raw: unknown,
  qariId: QariId = DEFAULT_QARI_ID
): PersistedAudioSession | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;

  if (!isValidSurahNumber(obj.surahNomor)) return null;
  const surahNomor = obj.surahNomor;
  const isFullSurah = Boolean(obj.isFullSurah);
  const ayahNomor = isFullSurah ? 1 : clampAyahForSurah(surahNomor, obj.ayahNomor);

  const safeQari = isValidQariId(qariId) ? qariId : DEFAULT_QARI_ID;
  const fallbackUrl = isFullSurah
    ? getSurahFullAudioUrl(surahNomor, safeQari)
    : getAyahAudioUrl(surahNomor, ayahNomor, safeQari);

  const audioUrl = sanitizeAudioUrl(obj.audioUrl, fallbackUrl);
  if (!audioUrl) return null;

  const currentTime =
    typeof obj.currentTime === 'number' && Number.isFinite(obj.currentTime) && obj.currentTime >= 0
      ? Math.min(36_000, obj.currentTime)
      : 0;

  const speedIndex =
    typeof obj.speedIndex === 'number' &&
    Number.isInteger(obj.speedIndex) &&
    obj.speedIndex >= 0 &&
    obj.speedIndex <= 3
      ? obj.speedIndex
      : 1;

  return {
    surahNomor,
    ayahNomor,
    audioUrl,
    isPlaying: Boolean(obj.isPlaying),
    isFullSurah,
    currentTime,
    speedIndex,
    isRepeat: Boolean(obj.isRepeat),
    updatedAt: typeof obj.updatedAt === 'number' && Number.isFinite(obj.updatedAt) ? obj.updatedAt : 0
  };
}

/**
 * Pure calculator for the next audio track (shared between React UI & synchronous background ended listener).
 */
export function computeNextAudioTrack(
  current: Pick<AudioTrackTarget, 'surahNomor' | 'ayahNomor' | 'isFullSurah'>,
  qariId: QariId = DEFAULT_QARI_ID
): AudioTrackTarget | null {
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
  const totalAyat = currentMeta?.jumlahAyat ?? 7;
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
 * Pure calculator for the previous audio track.
 */
export function computePrevAudioTrack(
  current: Pick<AudioTrackTarget, 'surahNomor' | 'ayahNomor' | 'isFullSurah'>,
  qariId: QariId = DEFAULT_QARI_ID
): AudioTrackTarget | null {
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
    const lastAyahOfPrev = prevMeta?.jumlahAyat ?? 1;
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

export function loadNavigationStateFromBrowser(): PersistedNavigationState {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_NAVIGATION_STATE };
  }
  let storedRaw: unknown = null;
  try {
    const rawStr = window.localStorage.getItem(NAV_STATE_STORAGE_KEY);
    if (rawStr) {
      storedRaw = safeJsonParse(rawStr, 32_000);
    }
  } catch {
    // ignore storage errors
  }
  return resolveInitialNavigationState(window.location.hash || '', storedRaw);
}

export function saveNavigationStateToBrowser(state: PersistedNavigationState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      NAV_STATE_STORAGE_KEY,
      JSON.stringify({
        ...state,
        updatedAt: Date.now()
      })
    );
  } catch {
    // ignore quota or private mode
  }
}

export function loadAudioSessionFromBrowser(
  qariId: QariId = DEFAULT_QARI_ID
): PersistedAudioSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const rawStr = window.localStorage.getItem(AUDIO_SESSION_STORAGE_KEY);
    if (!rawStr) return null;
    const parsed = safeJsonParse(rawStr, 32_000);
    return validatePersistedAudioSession(parsed, qariId);
  } catch {
    return null;
  }
}

export function saveAudioSessionToBrowser(session: PersistedAudioSession | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!session) {
      window.localStorage.removeItem(AUDIO_SESSION_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      AUDIO_SESSION_STORAGE_KEY,
      JSON.stringify({
        ...session,
        updatedAt: Date.now()
      })
    );
  } catch {
    // ignore quota or private mode
  }
}
