import type { QariId } from '../types/quran.ts';
import { SURAH_METADATA_LIST } from '../data/quranMetadata.ts';
import {
  DEFAULT_QARI_ID,
  getQariById,
  getAyahAudioUrl,
  getAyahFallbackAudioUrl,
  getSurahFullAudioUrl,
  getSurahFullFallbackAudioUrl,
  isValidQariId
} from '../services/quranApi.ts';
import { sanitizeAudioUrl } from './security.ts';
import {
  AudioTrackTarget,
  computeNextAudioTrack,
  saveAudioSessionToBrowser
} from './sessionPersistence.ts';

export const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5] as const;

/**
 * Generates a valid, spec-compliant 0.1-second 8kHz 8-bit mono PCM silent WAV data URI.
 * Used once inside the user's first Play tap to bless the secondary <audio> deck with
 * permanent iOS Safari / Mobile WebKit gesture activation privilege.
 */
export function createSilentUnlockWavDataUri(): string {
  const sampleRate = 8000;
  const numSamples = 800; // 0.1s
  const dataSize = numSamples;
  const totalSize = 44 + dataSize;
  const bytes = new Uint8Array(totalSize);
  const view = new DataView(bytes.buffer);

  const writeAscii = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      bytes[offset + i] = str.charCodeAt(i);
    }
  };

  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM fmt chunk length
  view.setUint16(20, 1, true); // AudioFormat = 1 (PCM)
  view.setUint16(22, 1, true); // NumChannels = 1 (Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true); // ByteRate = SampleRate * 1 * 1
  view.setUint16(32, 1, true); // BlockAlign = 1
  view.setUint16(34, 8, true); // BitsPerSample = 8
  writeAscii(36, 'data');
  view.setUint32(40, dataSize, true);

  // 8-bit unsigned PCM silence midpoint is 128 (0x80)
  bytes.fill(128, 44);

  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 =
    typeof btoa === 'function'
      ? btoa(binary)
      : Buffer.from(bytes).toString('base64');
  return `data:audio/wav;base64,${base64}`;
}

export const SILENT_UNLOCK_WAV_DATA_URI = createSilentUnlockWavDataUri();

export interface AutoResumeDecisionInput {
  intentToPlay: boolean;
  isEnded: boolean;
  isError: boolean;
  nowMs: number;
  lastBackgroundTransitionMs: number;
  autoResumeCountSinceHide: number;
}

/**
 * Pure decision rule: determines whether an unexpected 'pause' event on <audio>
 * was caused by a mobile browser / WebView hiding the app when the user exited
 * (which MUST be immediately overridden to keep murottal alive) vs. a genuine
 * external OS pause (e.g., lock-screen Pause or phone call minutes later).
 */
export function shouldAutoResumeUnexpectedPause(input: AutoResumeDecisionInput): boolean {
  if (!input.intentToPlay || input.isEnded || input.isError) {
    return false;
  }
  if (input.autoResumeCountSinceHide >= 3) {
    return false;
  }
  const elapsedSinceHide = input.nowMs - input.lastBackgroundTransitionMs;
  return elapsedSinceHide >= 0 && elapsedSinceHide <= 2500;
}

export interface MediaMetadataDescriptor {
  title: string;
  artist: string;
  album: string;
  artwork: Array<{ src: string; sizes: string; type: string }>;
}

/**
 * Pure builder for Lock-Screen / Notification-Shade MediaSession metadata.
 */
export function buildMediaMetadataDescriptor(
  track: Pick<AudioTrackTarget, 'surahNomor' | 'ayahNomor' | 'isFullSurah'>,
  qariId: QariId,
  baseHref: string = 'http://localhost/'
): MediaMetadataDescriptor {
  const safeQari = isValidQariId(qariId) ? qariId : DEFAULT_QARI_ID;
  const qari = getQariById(safeQari);
  const meta = SURAH_METADATA_LIST.find((s) => s.nomor === track.surahNomor);
  const surahLabel = meta?.namaLatin || String(track.surahNomor);

  const title = track.isFullSurah
    ? `Surah ${surahLabel} (Lengkap)`
    : `QS. ${surahLabel} : Ayat ${track.ayahNomor}`;

  let icon192 = './pwa-192x192.png';
  let icon512 = './pwa-512x512.png';
  try {
    icon192 = new URL('./pwa-192x192.png', baseHref).href;
    icon512 = new URL('./pwa-512x512.png', baseHref).href;
  } catch {
    // keep relative fallback if baseHref is unusual
  }

  return {
    title,
    artist: qari.nama,
    album: "Al-Qur'an Digital",
    artwork: [
      { src: icon192, sizes: '192x192', type: 'image/png' },
      { src: icon512, sizes: '512x512', type: 'image/png' }
    ]
  };
}

export interface EngineUiSnapshot {
  currentTime: number;
  duration: number;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  speedIndex: number;
  isRepeat: boolean;
}

export interface EngineCallbacks {
  onAdvanceTrack?: (nextTrack: AudioTrackTarget) => void;
  onAutoplayBlocked?: () => void;
  onExternalPause?: () => void;
  onTogglePlayPause?: () => void;
  onNextAyah?: () => void;
  onPrevAyah?: () => void;
  onClose?: () => void;
}

/**
 * Singleton Dual-Deck Gapless + WebAudio Keep-Alive Background Audio Engine.
 *
 * Guarantees continuous playback when the user exits the web app, switches mobile apps,
 * presses Home, or locks the screen on Android (Chrome, Samsung Internet, PWA) and iOS (Safari, Home Screen PWA):
 * 1. Invokes `audio.play()`, `navigator.audioSession.type = 'playback'`, and `AudioContext.resume()`
 *    SYNCHRONOUSLY inside the user's click/tap gesture call stack.
 * 2. Blesses TWO persistent off-screen (non-`display:none`) `<audio>` decks inside the first gesture
 *    and alternates between them (`deckA` <-> `deckB`) so track transitions happen in <1ms with zero `load()` gap.
 * 3. Maintains a sub-audible (`-100 dBFS`) `AudioContext` `{ latencyHint: 'playback' }` keep-alive stream
 *    strictly while `intentToPlay === true` so mobile OS audio focus never drops between short ayahs.
 */
class BackgroundAudioEngine {
  private decks: [HTMLAudioElement | null, HTMLAudioElement | null] = [null, null];
  private deckUrls: [string, string] = ['', ''];
  private activeDeckIndex: 0 | 1 = 0;
  private standbyUnlocked = false;
  private domMounted = false;

  private audioCtx: AudioContext | null = null;
  private keepAliveSource: AudioBufferSourceNode | null = null;

  private currentTrack: AudioTrackTarget | null = null;
  private qariId: QariId = DEFAULT_QARI_ID;
  private intentToPlay = false;
  private fallbackAttempted = false;
  private pendingResumeTime = 0;

  private currentTime = 0;
  private duration = 0;
  private isLoading = false;
  private volume = 1;
  private isMuted = false;
  private speedIndex = 1;
  private isRepeat = false;

  private lastPersistedTickMs = 0;
  private lastBackgroundTransitionMs = 0;
  private autoResumeCountSinceHide = 0;

  private listeners = new Set<(snap: EngineUiSnapshot) => void>();
  private callbacks: EngineCallbacks = {};

  public configureInitialPreferences(prefs: {
    currentTime?: number;
    speedIndex?: number;
    isRepeat?: boolean;
  }): void {
    if (typeof prefs.speedIndex === 'number' && prefs.speedIndex >= 0 && prefs.speedIndex < PLAYBACK_SPEEDS.length) {
      this.speedIndex = prefs.speedIndex;
    }
    if (typeof prefs.isRepeat === 'boolean') {
      this.isRepeat = prefs.isRepeat;
    }
    if (typeof prefs.currentTime === 'number' && prefs.currentTime > 0 && !this.currentTrack) {
      this.currentTime = prefs.currentTime;
      this.pendingResumeTime = prefs.currentTime;
    }
  }

  public setCallbacks(cb: EngineCallbacks): void {
    this.callbacks = cb;
  }

  public getSnapshot(): EngineUiSnapshot {
    return {
      currentTime: this.currentTime,
      duration: this.duration,
      isLoading: this.isLoading,
      volume: this.volume,
      isMuted: this.isMuted,
      speedIndex: this.speedIndex,
      isRepeat: this.isRepeat
    };
  }

  public subscribe(listener: (snap: EngineUiSnapshot) => void): () => void {
    this.ensureMounted();
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public isActivelyPlaying(): boolean {
    if (this.intentToPlay) return true;
    const d0 = this.decks[0];
    const d1 = this.decks[1];
    return Boolean((d0 && !d0.paused) || (d1 && !d1.paused));
  }

  public getDebugState(): {
    activeDeckIndex: 0 | 1;
    deckUrls: [string, string];
    intentToPlay: boolean;
    standbyUnlocked: boolean;
    audioContextState: string;
  } {
    return {
      activeDeckIndex: this.activeDeckIndex,
      deckUrls: [this.deckUrls[0], this.deckUrls[1]],
      intentToPlay: this.intentToPlay,
      standbyUnlocked: this.standbyUnlocked,
      audioContextState: this.audioCtx ? this.audioCtx.state : 'uninitialized'
    };
  }

  private emit(): void {
    const snap = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snap);
    }
  }

  /**
   * Configures iOS 17+ Safari / WebKit `navigator.audioSession.type = 'playback'`
   * so audio continues when exiting Safari/PWA or locking the screen (even with silent switch on).
   */
  private configurePlatformAudioSession(): void {
    if (typeof navigator === 'undefined') return;
    try {
      const navWithSession = navigator as unknown as {
        audioSession?: { type: string };
      };
      if (navWithSession.audioSession && navWithSession.audioSession.type !== 'playback') {
        navWithSession.audioSession.type = 'playback';
      }
    } catch {
      // Ignore on browsers without mutable navigator.audioSession
    }
  }

  /**
   * Starts or suspends an ultra-low-level (-100 dBFS, 20Hz) Web Audio stream with
   * `latencyHint: 'playback'` so Android & iOS maintain continuous hardware audio focus
   * across 3-second ayahs and between track transitions while minimized.
   */
  private syncKeepAliveAudioContext(shouldRun: boolean): void {
    if (typeof window === 'undefined') return;

    if (!shouldRun) {
      if (this.audioCtx && this.audioCtx.state === 'running') {
        this.audioCtx.suspend().catch(() => {});
      }
      return;
    }

    try {
      const AudioContextCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextCtor({ latencyHint: 'playback' });
        this.audioCtx.addEventListener?.('statechange', () => {
          if (!this.audioCtx || !this.intentToPlay) return;
          const elapsed = Date.now() - this.lastBackgroundTransitionMs;
          if (
            (this.audioCtx.state === 'suspended' || (this.audioCtx.state as string) === 'interrupted') &&
            elapsed >= 0 &&
            elapsed <= 2500
          ) {
            this.audioCtx.resume().catch(() => {});
          }
        });
      }

      if (!this.keepAliveSource && this.audioCtx) {
        const ctx = this.audioCtx;
        const sr = ctx.sampleRate || 22050;
        const length = sr * 2; // 2-second seamless loop
        const buffer = ctx.createBuffer(1, length, sr);
        const channel = buffer.getChannelData(0);
        const twoPiF = (2 * Math.PI * 20) / sr;
        for (let i = 0; i < length; i++) {
          // 1e-5 amplitude (-100 dBFS): non-zero so silence detectors never suspend the stream,
          // yet completely below human hearing threshold and 16-bit DAC noise floor.
          channel[i] = Math.sin(i * twoPiF) * 0.00001;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gain = ctx.createGain();
        gain.gain.value = 0.00001;

        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0);
        this.keepAliveSource = source;
      }

      if (this.audioCtx.state === 'suspended' || (this.audioCtx.state as string) === 'interrupted') {
        this.audioCtx.resume().catch(() => {});
      }
    } catch {
      // Ignore if WebAudio is restricted
    }
  }

  /**
   * Mounts two persistent off-screen (non-`display:none`) <audio> elements directly in `document.body`
   * so React tree re-renders never unmount them and mobile browsers never deprioritize hidden media.
   */
  public ensureMounted(): void {
    if (this.domMounted || typeof document === 'undefined' || !document.body) return;
    this.domMounted = true;

    const createDeck = (id: string): HTMLAudioElement => {
      const existing = document.getElementById(id) as HTMLAudioElement | null;
      const audio = existing ?? document.createElement('audio');
      audio.id = id;
      audio.preload = 'auto';
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.setAttribute('x-webkit-airplay', 'allow');
      audio.setAttribute('data-quran-bg-deck', 'true');
      audio.setAttribute('aria-hidden', 'true');
      // IMPORTANT: Explicitly set `display:block` to override UA `audio:not([controls]){display:none}`, as mobile WebViews suspend display:none media on app exit.
      audio.style.cssText =
        'display:block;position:fixed;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;opacity:0.01;pointer-events:none;z-index:-1;';
      if (!existing) {
        document.body.appendChild(audio);
      }
      this.bindDeckEvents(audio);
      return audio;
    };

    this.decks[0] = createDeck('quran-background-audio');
    this.decks[1] = createDeck('quran-background-audio-b');

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('pagehide', this.handlePageLifecycleFlush);
    window.addEventListener('beforeunload', this.handlePageLifecycleFlush);
  }

  private getActiveDeck(): HTMLAudioElement | null {
    return this.decks[this.activeDeckIndex];
  }

  private getStandbyDeckIndex(): 0 | 1 {
    return this.activeDeckIndex === 0 ? 1 : 0;
  }

  private getStandbyDeck(): HTMLAudioElement | null {
    return this.decks[this.getStandbyDeckIndex()];
  }

  /**
   * Unlocks the standby <audio> deck inside the user's first Play tap so that when the active deck
   * ends while the browser is in the background, the standby deck is already gesture-authorized on iOS Safari.
   */
  private unlockStandbyDeckFromGesture(): void {
    const standbyIdx = this.getStandbyDeckIndex();
    const standby = this.decks[standbyIdx];
    if (!standby || this.standbyUnlocked) {
      this.preloadNextTrackOnStandby();
      return;
    }

    this.standbyUnlocked = true;
    this.deckUrls[standbyIdx] = '';
    standby.muted = true;
    standby.src = SILENT_UNLOCK_WAV_DATA_URI;

    const finalizeUnlock = () => {
      // Never touch the deck if it became the active deck before the unlock promise settled
      if (this.activeDeckIndex === standbyIdx) return;
      try {
        standby.pause();
      } catch {
        // ignore
      }
      standby.muted = this.isMuted || this.volume === 0;
      standby.volume = this.volume;
      this.preloadNextTrackOnStandby();
    };

    try {
      const p = standby.play();
      if (p && typeof p.then === 'function') {
        p.then(finalizeUnlock).catch(finalizeUnlock);
      } else {
        finalizeUnlock();
      }
    } catch {
      finalizeUnlock();
    }
  }

  private preloadNextTrackOnStandby(): void {
    if (!this.currentTrack || this.currentTrack.isFullSurah) return;
    const standbyIdx = this.getStandbyDeckIndex();
    const standby = this.decks[standbyIdx];
    if (!standby) return;

    const nextTrack = computeNextAudioTrack(
      {
        surahNomor: this.currentTrack.surahNomor,
        ayahNomor: this.currentTrack.ayahNomor,
        isFullSurah: false
      },
      this.qariId
    );
    if (!nextTrack) return;

    const safePreloadUrl = sanitizeAudioUrl(nextTrack.audioUrl, nextTrack.audioUrl);
    if (safePreloadUrl && this.deckUrls[standbyIdx] !== safePreloadUrl) {
      this.deckUrls[standbyIdx] = safePreloadUrl;
      standby.muted = this.isMuted || this.volume === 0;
      standby.volume = this.volume;
      standby.playbackRate = PLAYBACK_SPEEDS[this.speedIndex] ?? 1;
      standby.src = safePreloadUrl;
      standby.load();
    }
  }

  private bindDeckEvents(deck: HTMLAudioElement): void {
    deck.addEventListener('waiting', () => {
      if (deck !== this.getActiveDeck()) return;
      if (this.intentToPlay) {
        this.isLoading = true;
        this.emit();
      }
    });

    deck.addEventListener('playing', () => {
      if (deck !== this.getActiveDeck()) return;
      this.isLoading = false;
      if (deck.duration && Number.isFinite(deck.duration) && deck.duration > 0) {
        this.duration = deck.duration;
      }
      this.syncMediaSessionPosition(deck);
      this.updateMediaSessionPlaybackState('playing');
      this.emit();
    });

    deck.addEventListener('canplay', () => {
      if (deck !== this.getActiveDeck()) return;
      this.isLoading = false;
      this.emit();
    });

    deck.addEventListener('loadedmetadata', () => {
      if (deck !== this.getActiveDeck()) return;
      if (deck.duration && Number.isFinite(deck.duration) && deck.duration > 0) {
        this.duration = deck.duration;
        if (this.pendingResumeTime > 0) {
          const safeTarget = Math.min(this.pendingResumeTime, Math.max(0, deck.duration - 0.5));
          try {
            deck.currentTime = safeTarget;
            this.currentTime = safeTarget;
          } catch {
            // ignore seek quirks
          }
          this.pendingResumeTime = 0;
        }
      }
      this.isLoading = false;
      this.syncMediaSessionPosition(deck);
      this.emit();
    });

    deck.addEventListener('timeupdate', () => {
      if (deck !== this.getActiveDeck()) return;
      this.currentTime = deck.currentTime;
      if (deck.duration && Number.isFinite(deck.duration) && deck.duration > 0) {
        this.duration = deck.duration;
      }

      const nowMs = Date.now();
      if (nowMs - this.lastPersistedTickMs >= 2000) {
        this.lastPersistedTickMs = nowMs;
        this.persistSession();
        this.syncMediaSessionPosition(deck);
      }
      this.emit();
    });

    deck.addEventListener('pause', () => {
      if (deck !== this.getActiveDeck()) return;
      // Ignore natural end-of-track pause events (HTML5 fires 'pause' immediately prior to 'ended')
      const nearNaturalEnd =
        deck.ended ||
        (deck.duration > 0 &&
          Number.isFinite(deck.duration) &&
          deck.currentTime >= deck.duration - 0.35);
      if (nearNaturalEnd) return;

      const nowMs = Date.now();
      const shouldResume = shouldAutoResumeUnexpectedPause({
        intentToPlay: this.intentToPlay,
        isEnded: nearNaturalEnd,
        isError: Boolean(deck.error),
        nowMs,
        lastBackgroundTransitionMs: this.lastBackgroundTransitionMs,
        autoResumeCountSinceHide: this.autoResumeCountSinceHide
      });

      if (shouldResume) {
        this.autoResumeCountSinceHide += 1;
        this.configurePlatformAudioSession();
        this.syncKeepAliveAudioContext(true);
        deck.play().catch(() => {});
        return;
      }

      // If paused externally long after backgrounding (e.g. phone call / headset unplug), verify after 250ms
      // that the track did not simply reach 'ended' or swap decks before marking session paused.
      if (this.intentToPlay && typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        setTimeout(() => {
          if (
            this.intentToPlay &&
            deck === this.getActiveDeck() &&
            deck.paused &&
            !deck.ended
          ) {
            this.intentToPlay = false;
            this.syncKeepAliveAudioContext(false);
            this.updateMediaSessionPlaybackState('paused');
            this.persistSession(false);
            this.callbacks.onExternalPause?.();
          }
        }, 250);
      }
    });

    deck.addEventListener('ended', () => {
      if (deck !== this.getActiveDeck()) return;
      this.handleActiveDeckEnded(deck);
    });

    deck.addEventListener('error', () => {
      if (deck !== this.getActiveDeck()) return;
      this.isLoading = false;
      if (!this.currentTrack || !this.deckUrls[this.activeDeckIndex]) {
        this.emit();
        return;
      }

      if (!this.fallbackAttempted) {
        this.fallbackAttempted = true;
        const fallbackUrl = this.currentTrack.isFullSurah
          ? getSurahFullFallbackAudioUrl(this.currentTrack.surahNomor, this.qariId)
          : getAyahFallbackAudioUrl(
              this.currentTrack.surahNomor,
              this.currentTrack.ayahNomor,
              this.qariId
            );
        const safeFallback = sanitizeAudioUrl(fallbackUrl, fallbackUrl);
        if (safeFallback && safeFallback !== deck.src) {
          this.deckUrls[this.activeDeckIndex] = safeFallback;
          deck.src = safeFallback;
          deck.load();
          if (this.intentToPlay) {
            deck.play().catch(() => {});
          }
          return;
        }
      }
      this.emit();
    });
  }

  private handleActiveDeckEnded(endedDeck: HTMLAudioElement): void {
    this.isLoading = false;
    if (!this.currentTrack) {
      this.emit();
      return;
    }

    if (this.isRepeat) {
      endedDeck.currentTime = 0;
      this.currentTime = 0;
      this.configurePlatformAudioSession();
      this.syncKeepAliveAudioContext(true);
      endedDeck.play().catch(() => {});
      this.emit();
      return;
    }

    const nextTrack = computeNextAudioTrack(
      {
        surahNomor: this.currentTrack.surahNomor,
        ayahNomor: this.currentTrack.ayahNomor,
        isFullSurah: Boolean(this.currentTrack.isFullSurah)
      },
      this.qariId
    );

    if (!nextTrack) {
      // End of Surah 114 An-Nas
      this.intentToPlay = false;
      this.currentTime = 0;
      this.syncKeepAliveAudioContext(false);
      this.updateMediaSessionPlaybackState('paused');
      const finishedState: AudioTrackTarget = {
        ...this.currentTrack,
        isPlaying: false
      };
      this.currentTrack = finishedState;
      this.persistSession(false);
      this.emit();
      this.callbacks.onAdvanceTrack?.(finishedState);
      return;
    }

    const safeNextUrl = sanitizeAudioUrl(nextTrack.audioUrl, nextTrack.audioUrl);
    this.currentTrack = nextTrack;
    this.intentToPlay = true;
    this.fallbackAttempted = false;
    this.pendingResumeTime = 0;
    this.currentTime = 0;

    const standbyIdx = this.getStandbyDeckIndex();
    const standbyDeck = this.decks[standbyIdx];

    this.configurePlatformAudioSession();
    this.syncKeepAliveAudioContext(true);

    // GAPLESS PING-PONG SWITCH: Flip activeDeckIndex FIRST so endedDeck's pause event is ignored
    if (standbyDeck && safeNextUrl && this.deckUrls[standbyIdx] === safeNextUrl) {
      this.activeDeckIndex = standbyIdx;
      try {
        endedDeck.pause();
      } catch {
        // ignore
      }
      standbyDeck.muted = this.isMuted || this.volume === 0;
      standbyDeck.volume = this.volume;
      standbyDeck.playbackRate = PLAYBACK_SPEEDS[this.speedIndex] ?? 1;
      try {
        standbyDeck.currentTime = 0;
      } catch {
        // ignore if metadata still settling
      }
      this.duration =
        standbyDeck.duration && Number.isFinite(standbyDeck.duration) && standbyDeck.duration > 0
          ? standbyDeck.duration
          : 0;
      this.isLoading = standbyDeck.readyState < 2;
      standbyDeck.play().catch(() => {});
    } else if (safeNextUrl) {
      this.deckUrls[this.activeDeckIndex] = safeNextUrl;
      this.duration = 0;
      this.isLoading = true;
      endedDeck.src = safeNextUrl;
      endedDeck.playbackRate = PLAYBACK_SPEEDS[this.speedIndex] ?? 1;
      endedDeck.load();
      endedDeck.play().catch(() => {});
    }

    // Update Lock Screen & preload N+2 track onto the new standby deck immediately
    this.syncMediaSessionMetadata();
    this.updateMediaSessionPlaybackState('playing');
    this.persistSession(true);
    this.preloadNextTrackOnStandby();
    this.emit();

    if (this.callbacks.onAdvanceTrack) {
      this.callbacks.onAdvanceTrack(nextTrack);
    } else {
      this.callbacks.onNextAyah?.();
    }
  }

  private handleWindowBlur = (): void => {
    if (this.intentToPlay) {
      this.lastBackgroundTransitionMs = Date.now();
      this.autoResumeCountSinceHide = 0;
    }
  };

  private handleVisibilityChange = (): void => {
    this.persistSession();
    if (typeof document === 'undefined') return;

    if (document.visibilityState === 'hidden') {
      this.lastBackgroundTransitionMs = Date.now();
      this.autoResumeCountSinceHide = 0;

      if (this.intentToPlay) {
        this.configurePlatformAudioSession();
        this.syncKeepAliveAudioContext(true);
        const resumeIfPaused = () => {
          const active = this.getActiveDeck();
          if (this.intentToPlay && active && active.paused && !active.ended && active.src) {
            active.play().catch(() => {});
          }
        };
        resumeIfPaused();
        setTimeout(resumeIfPaused, 90);
        setTimeout(resumeIfPaused, 280);
        setTimeout(resumeIfPaused, 650);
      }
    } else if (document.visibilityState === 'visible') {
      const active = this.getActiveDeck();
      if (active) {
        this.syncMediaSessionPosition(active);
      }
    }
  };

  private handlePageLifecycleFlush = (): void => {
    this.persistSession();
  };

  private resolveSafeTrackUrl(track: AudioTrackTarget, qariId: QariId): string {
    const defaultTrusted = track.isFullSurah
      ? getSurahFullAudioUrl(track.surahNomor, qariId)
      : getAyahAudioUrl(track.surahNomor, track.ayahNomor, qariId);
    return sanitizeAudioUrl(track.audioUrl, defaultTrusted);
  }

  /**
   * MUST BE INVOKED SYNCHRONOUSLY INSIDE USER CLICK / CHANGE GESTURE HANDLERS.
   * Starts or switches playback directly inside the user activation frame so iOS Safari
   * and Android Chrome grant full OS-level background audio playback privilege.
   */
  public playTrackFromGesture(
    track: AudioTrackTarget,
    qariId: QariId,
    resumeTimeSec: number = 0
  ): void {
    this.ensureMounted();
    const safeQari = isValidQariId(qariId) ? qariId : DEFAULT_QARI_ID;
    const safeUrl = this.resolveSafeTrackUrl(track, safeQari);
    if (!safeUrl) return;

    this.qariId = safeQari;
    this.currentTrack = { ...track, audioUrl: safeUrl, isPlaying: true };
    this.intentToPlay = true;
    this.fallbackAttempted = false;

    this.configurePlatformAudioSession();
    this.syncKeepAliveAudioContext(true);

    const standbyIdx = this.getStandbyDeckIndex();
    const standbyDeck = this.decks[standbyIdx];
    const activeDeck = this.getActiveDeck();

    // Update Lock Screen metadata BEFORE play() so Chromium immediately associates MediaSession
    this.syncMediaSessionMetadata();
    this.registerMediaSessionHandlers();
    this.updateMediaSessionPlaybackState('playing');

    if (standbyDeck && this.standbyUnlocked && this.deckUrls[standbyIdx] === safeUrl) {
      this.activeDeckIndex = standbyIdx;
      if (activeDeck) {
        try {
          activeDeck.pause();
        } catch {
          // ignore
        }
      }
      this.pendingResumeTime = resumeTimeSec > 0 ? resumeTimeSec : 0;
      this.currentTime = this.pendingResumeTime;
      this.duration =
        standbyDeck.duration && Number.isFinite(standbyDeck.duration) && standbyDeck.duration > 0
          ? standbyDeck.duration
          : 0;
      this.isLoading = standbyDeck.readyState < 2;
      standbyDeck.muted = this.isMuted || this.volume === 0;
      standbyDeck.volume = this.volume;
      standbyDeck.playbackRate = PLAYBACK_SPEEDS[this.speedIndex] ?? 1;
      if (this.pendingResumeTime === 0) {
        try {
          standbyDeck.currentTime = 0;
        } catch {
          // ignore
        }
      }
      standbyDeck.play().catch((err) => this.handlePlayRejection(err));
      this.preloadNextTrackOnStandby();
    } else if (activeDeck) {
      if (this.deckUrls[this.activeDeckIndex] !== safeUrl) {
        this.deckUrls[this.activeDeckIndex] = safeUrl;
        this.pendingResumeTime = resumeTimeSec > 0 ? resumeTimeSec : 0;
        this.currentTime = this.pendingResumeTime;
        this.duration = 0;
        this.isLoading = true;
        activeDeck.src = safeUrl;
        activeDeck.muted = this.isMuted || this.volume === 0;
        activeDeck.volume = this.volume;
        activeDeck.playbackRate = PLAYBACK_SPEEDS[this.speedIndex] ?? 1;
        activeDeck.load();
      } else {
        this.isLoading = false;
      }

      activeDeck.play().catch((err) => this.handlePlayRejection(err));
      this.unlockStandbyDeckFromGesture();
    }

    this.persistSession(true);
    this.emit();
  }

  /**
   * Resumes the currently loaded track synchronously inside a user Play button click.
   */
  public resumeFromGesture(): void {
    this.ensureMounted();
    const active = this.getActiveDeck();
    if (!active || !this.currentTrack) return;

    this.intentToPlay = true;
    this.currentTrack = { ...this.currentTrack, isPlaying: true };
    this.configurePlatformAudioSession();
    this.syncKeepAliveAudioContext(true);
    this.unlockStandbyDeckFromGesture();
    this.syncMediaSessionMetadata();
    this.registerMediaSessionHandlers();
    this.updateMediaSessionPlaybackState('playing');

    const safeUrl = this.resolveSafeTrackUrl(this.currentTrack, this.qariId);
    if (safeUrl && this.deckUrls[this.activeDeckIndex] !== safeUrl) {
      this.deckUrls[this.activeDeckIndex] = safeUrl;
      active.src = safeUrl;
      active.playbackRate = PLAYBACK_SPEEDS[this.speedIndex] ?? 1;
      active.load();
    }

    active.play().catch((err) => this.handlePlayRejection(err));
    this.persistSession(true);
    this.emit();
  }

  public pauseFromUser(): void {
    this.intentToPlay = false;
    if (this.currentTrack) {
      this.currentTrack = { ...this.currentTrack, isPlaying: false };
    }
    const active = this.getActiveDeck();
    if (active && !active.paused) {
      try {
        active.pause();
      } catch {
        // ignore
      }
    }
    this.isLoading = false;
    this.syncKeepAliveAudioContext(false);
    this.updateMediaSessionPlaybackState('paused');
    this.persistSession(false);
    this.emit();
  }

  public stopAndClear(): void {
    this.intentToPlay = false;
    this.currentTrack = null;
    this.pendingResumeTime = 0;
    this.currentTime = 0;
    this.duration = 0;
    this.isLoading = false;
    this.syncKeepAliveAudioContext(false);

    for (let i = 0; i < 2; i++) {
      const d = this.decks[i];
      this.deckUrls[i] = '';
      if (d) {
        try {
          d.pause();
          d.removeAttribute('src');
          d.load();
        } catch {
          // ignore
        }
      }
    }

    this.updateMediaSessionPlaybackState('none');
    saveAudioSessionToBrowser(null);
    this.emit();
  }

  /**
   * Idempotent state synchronizer called from React effects (handles cold-reload session
   * hydration or non-gesture state updates without double-loading tracks already started by gesture).
   */
  public syncFromReactState(
    playing: {
      surahNomor: number;
      ayahNomor: number;
      audioUrl: string;
      isPlaying: boolean;
      isFullSurah?: boolean;
    } | null,
    qariId: QariId
  ): void {
    this.ensureMounted();

    if (!playing) {
      if (this.currentTrack || this.deckUrls[0] || this.deckUrls[1]) {
        this.stopAndClear();
      }
      return;
    }

    const safeQari = isValidQariId(qariId) ? qariId : DEFAULT_QARI_ID;
    const targetTrack: AudioTrackTarget = {
      surahNomor: playing.surahNomor,
      ayahNomor: playing.ayahNomor,
      audioUrl: playing.audioUrl,
      isPlaying: playing.isPlaying,
      isFullSurah: Boolean(playing.isFullSurah)
    };
    const safeUrl = this.resolveSafeTrackUrl(targetTrack, safeQari);
    if (!safeUrl) return;

    const qariChanged = this.qariId !== safeQari;
    this.qariId = safeQari;
    this.currentTrack = { ...targetTrack, audioUrl: safeUrl };

    const active = this.getActiveDeck();
    if (!active) return;

    if (this.deckUrls[this.activeDeckIndex] !== safeUrl) {
      this.deckUrls[this.activeDeckIndex] = safeUrl;
      this.fallbackAttempted = false;
      this.duration = 0;
      this.isLoading = Boolean(playing.isPlaying);
      active.src = safeUrl;
      active.muted = this.isMuted || this.volume === 0;
      active.volume = this.volume;
      active.playbackRate = PLAYBACK_SPEEDS[this.speedIndex] ?? 1;
      active.load();

      this.syncMediaSessionMetadata();
      this.registerMediaSessionHandlers();

      if (playing.isPlaying) {
        this.intentToPlay = true;
        this.configurePlatformAudioSession();
        this.syncKeepAliveAudioContext(true);
        this.updateMediaSessionPlaybackState('playing');
        active.play().catch((err) => this.handlePlayRejection(err));
      } else {
        this.intentToPlay = false;
        this.isLoading = false;
        this.updateMediaSessionPlaybackState('paused');
      }
      this.preloadNextTrackOnStandby();
      this.persistSession(playing.isPlaying);
      this.emit();
      return;
    }

    if (qariChanged) {
      this.syncMediaSessionMetadata();
      this.preloadNextTrackOnStandby();
    }

    if (playing.isPlaying && !this.intentToPlay) {
      this.intentToPlay = true;
      this.configurePlatformAudioSession();
      this.syncKeepAliveAudioContext(true);
      this.updateMediaSessionPlaybackState('playing');
      if (active.paused) {
        active.play().catch((err) => this.handlePlayRejection(err));
      }
      this.persistSession(true);
      this.emit();
    } else if (!playing.isPlaying && (this.intentToPlay || !active.paused)) {
      this.pauseFromUser();
    }
  }

  public seekTo(newTimeSec: number): void {
    const active = this.getActiveDeck();
    const clamped = Math.max(0, newTimeSec);
    this.currentTime = clamped;
    this.pendingResumeTime = 0;
    if (active) {
      try {
        active.currentTime = clamped;
        this.syncMediaSessionPosition(active);
      } catch {
        // ignore if metadata not yet loaded
      }
    }
    this.persistSession();
    this.emit();
  }

  public toggleSpeed(): void {
    const nextIdx = (this.speedIndex + 1) % PLAYBACK_SPEEDS.length;
    this.speedIndex = nextIdx;
    const rate = PLAYBACK_SPEEDS[nextIdx] ?? 1;
    for (const d of this.decks) {
      if (d) d.playbackRate = rate;
    }
    const active = this.getActiveDeck();
    if (active) this.syncMediaSessionPosition(active);
    this.persistSession();
    this.emit();
  }

  public toggleRepeat(): void {
    this.isRepeat = !this.isRepeat;
    this.persistSession();
    this.emit();
  }

  public setVolumeLevel(val: number): void {
    const safeVal = Math.max(0, Math.min(1, val));
    this.volume = safeVal;
    this.isMuted = safeVal === 0;
    for (const d of this.decks) {
      if (d) {
        d.volume = safeVal;
        d.muted = this.isMuted;
      }
    }
    this.emit();
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    for (const d of this.decks) {
      if (d) {
        d.muted = this.isMuted || this.volume === 0;
      }
    }
    this.emit();
  }

  private handlePlayRejection(err: unknown): void {
    this.isLoading = false;
    const errName = (err as { name?: string } | null)?.name || '';
    const errMsg = String(err || '');
    if (errName === 'AbortError') {
      return;
    }
    if (errName === 'NotAllowedError' || errMsg.includes('NotAllowedError')) {
      this.intentToPlay = false;
      this.syncKeepAliveAudioContext(false);
      this.updateMediaSessionPlaybackState('paused');
      this.persistSession(false);
      this.emit();
      this.callbacks.onAutoplayBlocked?.();
      return;
    }
    this.emit();
  }

  private persistSession(overridePlaying?: boolean): void {
    if (!this.currentTrack) return;
    const active = this.getActiveDeck();
    const liveTime =
      active && Number.isFinite(active.currentTime) && active.currentTime > 0
        ? active.currentTime
        : this.currentTime;

    saveAudioSessionToBrowser({
      surahNomor: this.currentTrack.surahNomor,
      ayahNomor: this.currentTrack.ayahNomor,
      audioUrl: this.currentTrack.audioUrl,
      isPlaying: overridePlaying ?? this.intentToPlay,
      isFullSurah: Boolean(this.currentTrack.isFullSurah),
      currentTime: liveTime,
      speedIndex: this.speedIndex,
      isRepeat: this.isRepeat,
      updatedAt: Date.now()
    });
  }

  private syncMediaSessionMetadata(): void {
    if (!this.currentTrack || typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }
    try {
      const baseHref = typeof window !== 'undefined' ? window.location.href : 'http://localhost/';
      const desc = buildMediaMetadataDescriptor(this.currentTrack, this.qariId, baseHref);
      navigator.mediaSession.metadata = new MediaMetadata(desc);
    } catch {
      // Ignore partial MediaSession support
    }
  }

  private updateMediaSessionPlaybackState(state: MediaSessionPlaybackState): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state;
    } catch {
      // ignore
    }
  }

  private syncMediaSessionPosition(audio: HTMLAudioElement): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    if (typeof navigator.mediaSession.setPositionState !== 'function') return;
    const dur = audio.duration;
    if (!dur || !Number.isFinite(dur) || dur <= 0) return;
    const pos = Math.max(0, Math.min(dur, Number.isFinite(audio.currentTime) ? audio.currentTime : 0));
    const rate = Number.isFinite(audio.playbackRate) && audio.playbackRate > 0 ? audio.playbackRate : 1;
    try {
      navigator.mediaSession.setPositionState({
        duration: dur,
        playbackRate: rate,
        position: pos
      });
    } catch {
      // ignore
    }
  }

  private registerMediaSessionHandlers(): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const safeSet = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // ignore unsupported action
      }
    };

    safeSet('play', () => {
      this.resumeFromGesture();
      if (!this.currentTrack?.isPlaying) {
        this.callbacks.onTogglePlayPause?.();
      } else {
        this.callbacks.onAdvanceTrack?.({ ...this.currentTrack, isPlaying: true });
      }
    });

    safeSet('pause', () => {
      this.pauseFromUser();
      this.callbacks.onExternalPause?.();
    });

    safeSet('previoustrack', () => {
      this.callbacks.onPrevAyah?.();
    });

    safeSet('nexttrack', () => {
      this.callbacks.onNextAyah?.();
    });

    safeSet('seekbackward', (details) => {
      const offset = details.seekOffset || 10;
      this.seekTo(Math.max(0, this.currentTime - offset));
    });

    safeSet('seekforward', (details) => {
      const offset = details.seekOffset || 10;
      const maxDur = this.duration > 0 ? this.duration : this.currentTime + offset;
      this.seekTo(Math.min(maxDur, this.currentTime + offset));
    });

    safeSet('seekto', (details) => {
      if (typeof details.seekTime === 'number') {
        this.seekTo(details.seekTime);
      }
    });

    safeSet('stop', () => {
      this.stopAndClear();
      this.callbacks.onClose?.();
    });
  }
}

export const backgroundAudioEngine = new BackgroundAudioEngine();
