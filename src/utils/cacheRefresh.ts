import { backgroundAudioEngine } from './backgroundAudioEngine';

const SW_RELOAD_SESSION_KEY = 'quran_sw_reloaded_once';

function isAnyMurottalPlaying(): boolean {
  if (backgroundAudioEngine.isActivelyPlaying()) {
    return true;
  }
  if (typeof document === 'undefined') {
    return false;
  }
  const decks = document.querySelectorAll(
    'audio[data-quran-bg-deck="true"], #quran-background-audio, #quran-background-audio-b'
  );
  for (let i = 0; i < decks.length; i++) {
    const el = decks[i] as HTMLAudioElement;
    if (el && !el.paused) {
      return true;
    }
  }
  return false;
}

/**
 * Ensures returning visitors on GitHub Pages / PWA receive newly deployed bundles
 * immediately when a new Service Worker claims control, without infinite reload loops.
 */
export function setupAutoServiceWorkerRefresh(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Only auto-reload when replacing an existing controller (returning visitor), never on first install
  const hadExistingController = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadExistingController) return;
    // Never interrupt active murottal audio playback on either deck with an automatic SW reload
    if (isAnyMurottalPlaying()) return;
    try {
      if (sessionStorage.getItem(SW_RELOAD_SESSION_KEY) === '1') return;
      sessionStorage.setItem(SW_RELOAD_SESSION_KEY, '1');
    } catch {
      // ignore sessionStorage restrictions
    }
    window.location.reload();
  });

  const triggerUpdateCheck = () => {
    if (isAnyMurottalPlaying()) return;
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (const reg of registrations) {
          void reg.update();
        }
      })
      .catch(() => {
        // ignore offline or unsupported states
      });
  };

  window.addEventListener('load', () => {
    triggerUpdateCheck();
    try {
      sessionStorage.removeItem(SW_RELOAD_SESSION_KEY);
    } catch {
      // ignore
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      triggerUpdateCheck();
    }
  });
}

/**
 * Unregisters all Service Workers and purges CacheStorage while preserving
 * user bookmarks, khatam progress, and reading history in localStorage.
 */
export async function forceRefreshAppCache(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }
  } catch {
    // ignore SW unregister errors
  }

  try {
    if ('caches' in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((key) => window.caches.delete(key)));
    }
  } catch {
    // ignore CacheStorage errors
  }

  const url = new URL(window.location.href);
  url.searchParams.set('v', String(Date.now()));
  window.location.replace(url.toString());
}
