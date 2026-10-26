import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  X,
  Volume2,
  VolumeX,
  Loader2
} from 'lucide-react';
import { SURAH_METADATA_LIST } from '../data/quranMetadata';
import { QariId } from '../types/quran';
import {
  DEFAULT_QARI_ID,
  QARI_OPTIONS,
  getQariById,
  getAyahAudioUrl,
  getAyahFallbackAudioUrl,
  getSurahFullAudioUrl,
  getSurahFullFallbackAudioUrl,
  isValidQariId
} from '../services/quranApi';
import { sanitizeAudioUrl } from '../utils/security';
import {
  AudioTrackTarget,
  PersistedAudioSession,
  computeNextAudioTrack,
  saveAudioSessionToBrowser
} from '../utils/sessionPersistence';

export interface PlayingAudioState {
  surahNomor: number;
  ayahNomor: number;
  audioUrl: string;
  isPlaying: boolean;
  isFullSurah?: boolean;
}

interface AudioPlayerBarProps {
  currentPlaying: PlayingAudioState | null;
  initialAudioSession?: PersistedAudioSession | null;
  selectedQariId?: QariId;
  onSelectQari?: (qariId: QariId) => void;
  onClose: () => void;
  onNextAyah: () => void;
  onPrevAyah: () => void;
  onAdvanceTrack?: (nextTrack: AudioTrackTarget) => void;
  onAutoplayBlocked?: () => void;
  onTogglePlayPause: () => void;
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5];

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentPlaying,
  initialAudioSession = null,
  selectedQariId = DEFAULT_QARI_ID,
  onSelectQari,
  onClose,
  onNextAyah,
  onPrevAyah,
  onAdvanceTrack,
  onAutoplayBlocked,
  onTogglePlayPause
}) => {
  const activeQariId: QariId = isValidQariId(selectedQariId) ? selectedQariId : DEFAULT_QARI_ID;
  const activeQari = getQariById(activeQariId);

  const [isRepeat, setIsRepeat] = useState<boolean>(() => Boolean(initialAudioSession?.isRepeat));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(() =>
    initialAudioSession?.currentTime && initialAudioSession.currentTime > 0
      ? initialAudioSession.currentTime
      : 0
  );
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [speedIndex, setSpeedIndex] = useState<number>(() =>
    typeof initialAudioSession?.speedIndex === 'number' &&
    initialAudioSession.speedIndex >= 0 &&
    initialAudioSession.speedIndex < PLAYBACK_SPEEDS.length
      ? initialAudioSession.speedIndex
      : 1
  );

  // Persistent DOM <audio> elements (never unmounted so mobile OS / PWA background playback stays alive)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastLoadedUrlRef = useRef<string>('');
  const lastPreloadedUrlRef = useRef<string>('');
  const fallbackAttemptedRef = useRef<boolean>(false);
  const pendingResumeTimeRef = useRef<number>(
    initialAudioSession?.currentTime && initialAudioSession.currentTime > 0
      ? initialAudioSession.currentTime
      : 0
  );
  const initialLoadHandledRef = useRef<boolean>(false);
  const lastPersistedTickRef = useRef<number>(0);
  const latestCurrentTimeRef = useRef<number>(currentTime);

  const latestStateRef = useRef({
    currentPlaying,
    isRepeat,
    activeQariId,
    activeQariName: activeQari.nama,
    speedIndex,
    onNextAyah,
    onPrevAyah,
    onAdvanceTrack,
    onAutoplayBlocked,
    onTogglePlayPause,
    onClose
  });

  latestStateRef.current = {
    currentPlaying,
    isRepeat,
    activeQariId,
    activeQariName: activeQari.nama,
    speedIndex,
    onNextAyah,
    onPrevAyah,
    onAdvanceTrack,
    onAutoplayBlocked,
    onTogglePlayPause,
    onClose
  };

  const syncMediaPositionState = (audio: HTMLAudioElement) => {
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
      // Ignore unsupported positionState values on older WebViews
    }
  };

  const persistSnapshot = (overridePlaying?: boolean) => {
    const { currentPlaying: active, speedIndex: sIdx, isRepeat: repeat } = latestStateRef.current;
    if (!active) return;
    const audio = audioRef.current;
    const liveTime =
      audio && Number.isFinite(audio.currentTime) && audio.currentTime > 0
        ? audio.currentTime
        : latestCurrentTimeRef.current;

    saveAudioSessionToBrowser({
      surahNomor: active.surahNomor,
      ayahNomor: active.ayahNomor,
      audioUrl: active.audioUrl,
      isPlaying: overridePlaying ?? active.isPlaying,
      isFullSurah: Boolean(active.isFullSurah),
      currentTime: liveTime,
      speedIndex: sIdx,
      isRepeat: repeat,
      updatedAt: Date.now()
    });
  };

  // Configure persistent DOM <audio> attributes and attach lifecycle listeners once
  useEffect(() => {
    const audio = audioRef.current;
    const preloadAudio = preloadAudioRef.current;
    if (!audio) return;

    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    if (preloadAudio) {
      preloadAudio.setAttribute('playsinline', 'true');
      preloadAudio.setAttribute('webkit-playsinline', 'true');
    }

    const handleWaiting = () => {
      if (latestStateRef.current.currentPlaying?.isPlaying) {
        setIsLoading(true);
      }
    };

    const handlePlaying = () => {
      setIsLoading(false);
      syncMediaPositionState(audio);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !Number.isNaN(audio.duration) && Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
        if (pendingResumeTimeRef.current > 0) {
          const safeTarget = Math.min(
            pendingResumeTimeRef.current,
            Math.max(0, audio.duration - 0.5)
          );
          try {
            audio.currentTime = safeTarget;
            latestCurrentTimeRef.current = safeTarget;
            setCurrentTime(safeTarget);
          } catch {
            // Ignore seek before ready quirks
          }
          pendingResumeTimeRef.current = 0;
        }
      }
      setIsLoading(false);
      syncMediaPositionState(audio);
    };

    const handleTimeUpdate = () => {
      const nowTime = audio.currentTime;
      latestCurrentTimeRef.current = nowTime;
      setCurrentTime(nowTime);
      if (audio.duration && !Number.isNaN(audio.duration) && Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }

      const nowMs = Date.now();
      if (nowMs - lastPersistedTickRef.current >= 2000) {
        lastPersistedTickRef.current = nowMs;
        persistSnapshot();
        syncMediaPositionState(audio);
      }
    };

    // CRITICAL FOR BACKGROUND PLAYBACK:
    // Advance and call audio.play() synchronously inside the native 'ended' event tick
    // BEFORE yielding to React's async render cycle so iOS Safari / Android Chrome keep background audio privilege.
    const handleEnded = () => {
      setIsLoading(false);
      const {
        currentPlaying: active,
        isRepeat: repeat,
        activeQariId: qari,
        speedIndex: sIdx,
        onAdvanceTrack: advance,
        onNextAyah: nextCb
      } = latestStateRef.current;

      if (!active) return;

      if (repeat) {
        audio.currentTime = 0;
        latestCurrentTimeRef.current = 0;
        setCurrentTime(0);
        audio.play().catch(() => {});
        return;
      }

      const nextTrack = computeNextAudioTrack(
        {
          surahNomor: active.surahNomor,
          ayahNomor: active.ayahNomor,
          isFullSurah: Boolean(active.isFullSurah)
        },
        qari
      );

      if (nextTrack) {
        const safeNextUrl = sanitizeAudioUrl(nextTrack.audioUrl, nextTrack.audioUrl);
        if (safeNextUrl) {
          lastLoadedUrlRef.current = safeNextUrl;
          fallbackAttemptedRef.current = false;
          pendingResumeTimeRef.current = 0;
          latestCurrentTimeRef.current = 0;
          setCurrentTime(0);
          setDuration(0);
          setIsLoading(true);

          audio.src = safeNextUrl;
          audio.playbackRate = PLAYBACK_SPEEDS[sIdx] ?? 1;
          audio.load();
          audio.play().catch(() => {});
        }

        saveAudioSessionToBrowser({
          ...nextTrack,
          currentTime: 0,
          speedIndex: sIdx,
          isRepeat: repeat,
          updatedAt: Date.now()
        });

        if (advance) {
          advance(nextTrack);
        } else {
          nextCb();
        }
      } else {
        // Reached end of Surah 114 (An-Nas)
        latestCurrentTimeRef.current = 0;
        saveAudioSessionToBrowser({
          surahNomor: active.surahNomor,
          ayahNomor: active.ayahNomor,
          audioUrl: active.audioUrl,
          isPlaying: false,
          isFullSurah: Boolean(active.isFullSurah),
          currentTime: 0,
          speedIndex: sIdx,
          isRepeat: repeat,
          updatedAt: Date.now()
        });
        if (advance) {
          advance({
            surahNomor: active.surahNomor,
            ayahNomor: active.ayahNomor,
            audioUrl: active.audioUrl,
            isPlaying: false,
            isFullSurah: Boolean(active.isFullSurah)
          });
        }
      }
    };

    const handleError = () => {
      setIsLoading(false);
      const { currentPlaying: active, activeQariId: qari } = latestStateRef.current;
      if (!active || !lastLoadedUrlRef.current) return;

      console.warn('Audio playback error on primary URL:', audio.src);

      // Automatically fallback to verified secondary CDN if primary URL fails
      if (!fallbackAttemptedRef.current) {
        fallbackAttemptedRef.current = true;
        const fallbackUrl = active.isFullSurah
          ? getSurahFullFallbackAudioUrl(active.surahNomor, qari)
          : getAyahFallbackAudioUrl(active.surahNomor, active.ayahNomor, qari);
        const safeFallback = sanitizeAudioUrl(fallbackUrl, fallbackUrl);
        if (safeFallback && safeFallback !== audio.src) {
          console.info('Switching to secondary fallback audio source:', safeFallback);
          lastLoadedUrlRef.current = safeFallback;
          audio.src = safeFallback;
          audio.load();
          if (active.isPlaying) {
            audio.play().catch(() => {});
          }
        }
      }
    };

    // Keep playback alive when user minimizes browser / switches apps / locks screen
    const handleVisibilityChange = () => {
      persistSnapshot();
      const { currentPlaying: active } = latestStateRef.current;
      if (document.visibilityState === 'hidden' && active?.isPlaying && audio.paused && audio.src) {
        audio.play().catch(() => {});
      }
    };

    const handlePageFlush = () => {
      persistSnapshot();
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageFlush);
    window.addEventListener('beforeunload', handlePageFlush);

    return () => {
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageFlush);
      window.removeEventListener('beforeunload', handlePageFlush);
    };
  }, []);

  // Load / switch / pause / teardown audio source when currentPlaying or Qari changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentPlaying) {
      if (lastLoadedUrlRef.current || audio.getAttribute('src')) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        lastLoadedUrlRef.current = '';
        lastPreloadedUrlRef.current = '';
        pendingResumeTimeRef.current = 0;
        latestCurrentTimeRef.current = 0;
        setCurrentTime(0);
        setDuration(0);
        setIsLoading(false);
      }
      if (preloadAudioRef.current?.getAttribute('src')) {
        preloadAudioRef.current.removeAttribute('src');
        preloadAudioRef.current.load();
      }
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        try {
          navigator.mediaSession.playbackState = 'none';
        } catch {
          // ignore
        }
      }
      return;
    }

    const defaultTrustedUrl = currentPlaying.isFullSurah
      ? getSurahFullAudioUrl(currentPlaying.surahNomor, activeQariId)
      : getAyahAudioUrl(currentPlaying.surahNomor, currentPlaying.ayahNomor, activeQariId);
    const safeUrl = sanitizeAudioUrl(currentPlaying.audioUrl, defaultTrustedUrl);

    if (safeUrl && lastLoadedUrlRef.current !== safeUrl) {
      const isInitialColdRestore = !initialLoadHandledRef.current && pendingResumeTimeRef.current > 0;
      initialLoadHandledRef.current = true;

      if (!isInitialColdRestore) {
        pendingResumeTimeRef.current = 0;
        latestCurrentTimeRef.current = 0;
        setCurrentTime(0);
      }

      lastLoadedUrlRef.current = safeUrl;
      fallbackAttemptedRef.current = false;
      setDuration(0);
      setIsLoading(Boolean(currentPlaying.isPlaying));

      audio.src = safeUrl;
      audio.playbackRate = PLAYBACK_SPEEDS[speedIndex] ?? 1;
      audio.load();

      if (currentPlaying.isPlaying) {
        audio.play().catch((err) => {
          setIsLoading(false);
          if (err && (err.name === 'NotAllowedError' || String(err).includes('NotAllowedError'))) {
            // Browser requires a single tap after a cold page refresh; keep player open at exact saved timestamp
            persistSnapshot(false);
            latestStateRef.current.onAutoplayBlocked?.();
          } else if (err && err.name === 'AbortError') {
            // Expected when rapidly advancing to the next ayah before previous play() resolves
          } else {
            console.warn('Playback deferred due to browser policy:', err);
          }
        });
      }
    } else {
      initialLoadHandledRef.current = true;
      audio.playbackRate = PLAYBACK_SPEEDS[speedIndex] ?? 1;
      if (currentPlaying.isPlaying && audio.paused) {
        audio.play().catch((err) => {
          setIsLoading(false);
          if (err && (err.name === 'NotAllowedError' || String(err).includes('NotAllowedError'))) {
            persistSnapshot(false);
            latestStateRef.current.onAutoplayBlocked?.();
          }
        });
      } else if (!currentPlaying.isPlaying && !audio.paused) {
        audio.pause();
        setIsLoading(false);
      }
    }
  }, [
    currentPlaying?.surahNomor,
    currentPlaying?.ayahNomor,
    currentPlaying?.audioUrl,
    currentPlaying?.isPlaying,
    currentPlaying?.isFullSurah,
    speedIndex,
    activeQariId
  ]);

  // Preload next ayah audio in background so lock-screen / minimized track transitions have zero network gap
  useEffect(() => {
    const preloadAudio = preloadAudioRef.current;
    if (!preloadAudio || !currentPlaying || currentPlaying.isFullSurah) return;

    const nextTrack = computeNextAudioTrack(
      {
        surahNomor: currentPlaying.surahNomor,
        ayahNomor: currentPlaying.ayahNomor,
        isFullSurah: false
      },
      activeQariId
    );
    if (!nextTrack) return;

    const safePreloadUrl = sanitizeAudioUrl(nextTrack.audioUrl, nextTrack.audioUrl);
    if (safePreloadUrl && lastPreloadedUrlRef.current !== safePreloadUrl) {
      lastPreloadedUrlRef.current = safePreloadUrl;
      preloadAudio.src = safePreloadUrl;
      preloadAudio.load();
    }
  }, [currentPlaying?.surahNomor, currentPlaying?.ayahNomor, currentPlaying?.isFullSurah, activeQariId]);

  // Persist audio session whenever track, play/pause, speed, or repeat changes
  useEffect(() => {
    if (!currentPlaying) return;
    persistSnapshot();
  }, [
    currentPlaying?.surahNomor,
    currentPlaying?.ayahNomor,
    currentPlaying?.audioUrl,
    currentPlaying?.isPlaying,
    currentPlaying?.isFullSurah,
    speedIndex,
    isRepeat
  ]);

  // Sync with Android & iOS Lock Screen / Control Center / Notification Shade via Media Session API
  useEffect(() => {
    if (!currentPlaying || typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    const meta = SURAH_METADATA_LIST.find((s) => s.nomor === currentPlaying.surahNomor);
    const trackTitle = currentPlaying.isFullSurah
      ? `Surah ${meta?.namaLatin || currentPlaying.surahNomor} (Lengkap)`
      : `QS. ${meta?.namaLatin || currentPlaying.surahNomor} : Ayat ${currentPlaying.ayahNomor}`;

    const icon192 =
      typeof window !== 'undefined'
        ? new URL('./pwa-192x192.png', window.location.href).href
        : './pwa-192x192.png';
    const icon512 =
      typeof window !== 'undefined'
        ? new URL('./pwa-512x512.png', window.location.href).href
        : './pwa-512x512.png';

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: trackTitle,
        artist: activeQari.nama,
        album: "Al-Qur'an Digital",
        artwork: [
          { src: icon192, sizes: '192x192', type: 'image/png' },
          { src: icon512, sizes: '512x512', type: 'image/png' }
        ]
      });
      navigator.mediaSession.playbackState = currentPlaying.isPlaying ? 'playing' : 'paused';
    } catch {
      // Ignore partial MediaSession metadata support
    }

    const safeSetAction = (
      action: MediaSessionAction,
      handler: MediaSessionActionHandler | null
    ) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Ignore unsupported MediaSessionAction on specific browsers
      }
    };

    safeSetAction('play', () => {
      const audio = audioRef.current;
      if (audio && audio.paused) {
        audio.play().catch(() => {});
      }
      if (!latestStateRef.current.currentPlaying?.isPlaying) {
        latestStateRef.current.onTogglePlayPause();
      }
    });

    safeSetAction('pause', () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        audio.pause();
      }
      if (latestStateRef.current.currentPlaying?.isPlaying) {
        latestStateRef.current.onTogglePlayPause();
      }
    });

    safeSetAction('previoustrack', () => {
      latestStateRef.current.onPrevAyah();
    });

    safeSetAction('nexttrack', () => {
      latestStateRef.current.onNextAyah();
    });

    safeSetAction('seekbackward', (details) => {
      const audio = audioRef.current;
      if (!audio) return;
      const offset = details.seekOffset || 10;
      const nextTime = Math.max(0, audio.currentTime - offset);
      audio.currentTime = nextTime;
      latestCurrentTimeRef.current = nextTime;
      setCurrentTime(nextTime);
      syncMediaPositionState(audio);
    });

    safeSetAction('seekforward', (details) => {
      const audio = audioRef.current;
      if (!audio) return;
      const offset = details.seekOffset || 10;
      const maxDur = audio.duration && Number.isFinite(audio.duration) ? audio.duration : audio.currentTime + offset;
      const nextTime = Math.min(maxDur, audio.currentTime + offset);
      audio.currentTime = nextTime;
      latestCurrentTimeRef.current = nextTime;
      setCurrentTime(nextTime);
      syncMediaPositionState(audio);
    });

    safeSetAction('seekto', (details) => {
      const audio = audioRef.current;
      if (typeof details.seekTime === 'number' && audio) {
        audio.currentTime = details.seekTime;
        latestCurrentTimeRef.current = details.seekTime;
        setCurrentTime(details.seekTime);
        syncMediaPositionState(audio);
      }
    });

    safeSetAction('stop', () => {
      latestStateRef.current.onClose();
    });

    if (audioRef.current) {
      syncMediaPositionState(audioRef.current);
    }
  }, [
    currentPlaying?.surahNomor,
    currentPlaying?.ayahNomor,
    currentPlaying?.isFullSurah,
    currentPlaying?.isPlaying,
    activeQari.nama
  ]);

  const currentSurahMeta = currentPlaying
    ? SURAH_METADATA_LIST.find((s) => s.nomor === currentPlaying.surahNomor)
    : undefined;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    latestCurrentTimeRef.current = newTime;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      syncMediaPositionState(audioRef.current);
    }
    persistSnapshot();
  };

  const handleSpeedToggle = () => {
    const nextIdx = (speedIndex + 1) % PLAYBACK_SPEEDS.length;
    setSpeedIndex(nextIdx);
    if (audioRef.current) {
      audioRef.current.playbackRate = PLAYBACK_SPEEDS[nextIdx];
      syncMediaPositionState(audioRef.current);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleToggleMute = () => {
    if (audioRef.current) {
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      audioRef.current.muted = nextMuted;
    }
  };

  const formatTime = (secs: number) => {
    if (Number.isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Persistent DOM media elements — never unmounted so background playback survives app switching & screen lock */}
      <audio
        id="quran-background-audio"
        ref={audioRef}
        preload="auto"
        className="hidden"
        aria-hidden="true"
      />
      <audio
        ref={preloadAudioRef}
        preload="auto"
        className="hidden"
        aria-hidden="true"
      />

      {currentPlaying && (
        <aside
          aria-label="Pemutar Audio Murottal"
          className="fixed bottom-14 bottom-[calc(3.5rem_+_env(safe-area-inset-bottom,0px))] md:bottom-[calc(4.75rem_+_env(safe-area-inset-bottom,0px))] lg:bottom-0 inset-x-0 md:inset-x-6 lg:inset-x-0 md:max-w-2xl md:mx-auto lg:max-w-none z-40 px-3 sm:px-6 py-2 sm:py-3 lg:pb-[calc(0.75rem_+_env(safe-area-inset-bottom,0px))] bg-white/95 dark:bg-slate-900/95 [body.theme-sepia_&]:bg-[#f3ead7]/95 backdrop-blur-md border-t md:border lg:border-x-0 lg:border-b-0 border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] md:rounded-2xl lg:rounded-none shadow-2xl transition-all"
        >
          <div className="max-w-6xl mx-auto space-y-1 sm:space-y-2">
            
            {/* Top Mini Progress Bar / Scrubber */}
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-slate-500">
              <span className="tabular-nums w-8 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || Math.max(1, currentTime)}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                aria-label="Posisi Putar Audio"
                className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 [body.theme-sepia_&]:bg-[#debfa0] rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
              />
              <span className="tabular-nums w-8">{formatTime(duration)}</span>
            </div>

            {/* Main Controls Row */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-4">
              
              {/* Left: Track Details */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                  {isLoading && currentPlaying.isPlaying ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] truncate flex items-center gap-1">
                    <span className="truncate">
                      {currentPlaying.isFullSurah
                        ? `${currentSurahMeta?.namaLatin || `Surah ${currentPlaying.surahNomor}`} (Lengkap)`
                        : `${currentSurahMeta?.namaLatin || `Surah ${currentPlaying.surahNomor}`} : Ayat ${currentPlaying.ayahNomor}`}
                    </span>
                    {currentPlaying.isPlaying && (
                      <span className="inline-flex items-center gap-0.5 h-3 ml-0.5 shrink-0">
                        <span className="w-0.5 h-2 bg-emerald-500 animate-pulse rounded-full" />
                        <span className="w-0.5 h-3 bg-emerald-500 animate-pulse rounded-full delay-75" />
                        <span className="w-0.5 h-1.5 bg-emerald-500 animate-pulse rounded-full delay-150" />
                      </span>
                    )}
                  </h4>
                  {onSelectQari ? (
                    <div className="flex items-center gap-1 text-[11px] leading-tight text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] min-w-0">
                      <span className="shrink-0">Qari:</span>
                      <select
                        value={activeQariId}
                        onChange={(e) => {
                          const next = e.target.value;
                          if (isValidQariId(next)) {
                            onSelectQari(next);
                          }
                        }}
                        aria-label="Pilih Qari Pemutar Audio"
                        className="!text-[11px] leading-tight font-medium text-emerald-700 dark:text-emerald-400 [body.theme-sepia_&]:text-[#4d3c2a] bg-transparent hover:underline focus:outline-none cursor-pointer truncate max-w-[140px] sm:max-w-[210px] py-0.5"
                      >
                        {QARI_OPTIONS.map((q) => (
                          <option
                            key={q.id}
                            value={q.id}
                            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                          >
                            {q.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="text-[11px] leading-tight text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] truncate">
                      Qari: {activeQari.nama}
                    </p>
                  )}
                </div>
              </div>

              {/* Center: Playback Controls */}
              <div className="flex items-center gap-0 sm:gap-2 shrink-0">
                
                {/* Repeat Ayah */}
                <button
                  onClick={() => setIsRepeat(!isRepeat)}
                  aria-label="Ulangi Ayat Ini"
                  title={isRepeat ? 'Ulangi Ayat (Aktif)' : 'Ulangi Ayat (Nonaktif)'}
                  className={`min-w-9 min-h-10 sm:min-w-0 sm:min-h-0 p-1.5 sm:p-2 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                    isRepeat
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                </button>

                {/* Previous */}
                <button
                  onClick={onPrevAyah}
                  aria-label="Ayat Sebelumnya"
                  title="Sebelumnya"
                  className="min-w-9 min-h-10 sm:min-w-0 sm:min-h-0 p-1.5 sm:p-2 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* Play / Pause Primary Button */}
                <button
                  onClick={onTogglePlayPause}
                  aria-label={currentPlaying.isPlaying ? 'Jeda Audio' : 'Lanjutkan Audio'}
                  className="min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 p-2 sm:p-2.5 mx-0.5 flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer transition-transform active:scale-95"
                >
                  {isLoading && currentPlaying.isPlaying ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : currentPlaying.isPlaying ? (
                    <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={onNextAyah}
                  aria-label="Ayat Selanjutnya"
                  title="Selanjutnya"
                  className="min-w-9 min-h-10 sm:min-w-0 sm:min-h-0 p-1.5 sm:p-2 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Playback Speed Toggle */}
                <button
                  onClick={handleSpeedToggle}
                  aria-label={`Kecepatan Putar: ${PLAYBACK_SPEEDS[speedIndex]}x`}
                  title="Atur Kecepatan Putar"
                  className="hidden xs:inline-flex sm:inline-flex min-h-10 sm:min-h-0 items-center justify-center px-2 py-1 text-[11px] font-bold font-mono rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  {PLAYBACK_SPEEDS[speedIndex]}x
                </button>
              </div>

              {/* Right: Volume & Close */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                {/* Volume */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleToggleMute}
                    aria-label={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-red-500" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="Volume Audio"
                    className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                {/* Close */}
                <button
                  onClick={onClose}
                  aria-label="Tutup Pemutar Audio"
                  title="Tutup Pemutar"
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Close Button */}
              <div className="flex sm:hidden">
                <button
                  onClick={onClose}
                  aria-label="Tutup Pemutar Audio"
                  title="Tutup"
                  className="min-w-10 min-h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </aside>
      )}
    </>
  );
};
