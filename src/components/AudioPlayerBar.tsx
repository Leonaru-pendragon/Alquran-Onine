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
  Loader2,
  Gauge
} from 'lucide-react';
import { SURAH_METADATA_LIST } from '../data/quranMetadata';
import { getAyahAudioUrl, getAyahFallbackAudioUrl, getSurahFullAudioUrl } from '../services/quranApi';
import { sanitizeAudioUrl } from '../utils/security';

export interface PlayingAudioState {
  surahNomor: number;
  ayahNomor: number;
  audioUrl: string;
  isPlaying: boolean;
  isFullSurah?: boolean;
}

interface AudioPlayerBarProps {
  currentPlaying: PlayingAudioState | null;
  onClose: () => void;
  onNextAyah: () => void;
  onPrevAyah: () => void;
  onTogglePlayPause: () => void;
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5];

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentPlaying,
  onClose,
  onNextAyah,
  onPrevAyah,
  onTogglePlayPause
}) => {
  const [isRepeat, setIsRepeat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1); // default 1.0x

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastLoadedUrlRef = useRef<string>('');
  const fallbackAttemptedRef = useRef<boolean>(false);

  // Initialize and handle URL changes
  useEffect(() => {
    if (!currentPlaying) return;

    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    const defaultTrustedUrl = currentPlaying.isFullSurah
      ? getSurahFullAudioUrl(currentPlaying.surahNomor)
      : getAyahAudioUrl(currentPlaying.surahNomor, currentPlaying.ayahNomor);
    const safeUrl = sanitizeAudioUrl(currentPlaying.audioUrl, defaultTrustedUrl);

    // Load new audio source only when URL changes
    if (safeUrl && lastLoadedUrlRef.current !== safeUrl) {
      lastLoadedUrlRef.current = safeUrl;
      fallbackAttemptedRef.current = false;
      setIsLoading(true);
      setCurrentTime(0);
      setDuration(0);

      audio.src = safeUrl;
      audio.playbackRate = PLAYBACK_SPEEDS[speedIndex];
      audio.load();

      if (currentPlaying.isPlaying) {
        audio.play().catch((err) => {
          console.warn('Playback deferred due to browser policy:', err);
        });
      }
    } else if (currentPlaying.isPlaying && audio.paused) {
      audio.play().catch(() => {});
    } else if (!currentPlaying.isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [currentPlaying?.audioUrl, currentPlaying?.isPlaying, speedIndex]);

  // Handle Play / Pause toggling without reloading audio source
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentPlaying) return;

    if (currentPlaying.isPlaying && audio.paused) {
      audio.play().catch(() => {});
    } else if (!currentPlaying.isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [currentPlaying?.isPlaying]);

  // Attach event listeners for audio lifecycle
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    const handleCanPlay = () => setIsLoading(false);
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsLoading(false);
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        onNextAyah();
      }
    };

    const handleError = () => {
      setIsLoading(false);
      console.warn('Audio playback error on primary URL:', audio.src);

      // Automatically fallback to EveryAyah CDN if primary URL fails
      if (currentPlaying && !fallbackAttemptedRef.current && !currentPlaying.isFullSurah) {
        fallbackAttemptedRef.current = true;
        const fallbackUrl = getAyahFallbackAudioUrl(currentPlaying.surahNomor, currentPlaying.ayahNomor);
        const safeFallback = sanitizeAudioUrl(fallbackUrl, fallbackUrl);
        if (safeFallback) {
          console.info('Switching to secondary fallback audio source:', safeFallback);
          audio.src = safeFallback;
          audio.load();
          if (currentPlaying.isPlaying) {
            audio.play().catch(() => {});
          }
        }
      }
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [isRepeat, onNextAyah, currentPlaying]);

  // Teardown audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Sync with Android & iOS Lock Screen / Control Center via Media Session API
  useEffect(() => {
    if (!currentPlaying || typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    const meta = SURAH_METADATA_LIST.find((s) => s.nomor === currentPlaying.surahNomor);
    const trackTitle = currentPlaying.isFullSurah
      ? `Surah ${meta?.namaLatin || currentPlaying.surahNomor} (Lengkap)`
      : `QS. ${meta?.namaLatin || currentPlaying.surahNomor} : Ayat ${currentPlaying.ayahNomor}`;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: trackTitle,
        artist: 'Syaikh Misyari Rasyid Al-Afasy',
        album: "Al-Qur'an Digital",
        artwork: [
          { src: './pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: './pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      });
      navigator.mediaSession.playbackState = currentPlaying.isPlaying ? 'playing' : 'paused';

      navigator.mediaSession.setActionHandler('play', () => {
        if (!currentPlaying.isPlaying) onTogglePlayPause();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (currentPlaying.isPlaying) onTogglePlayPause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        onPrevAyah();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        onNextAyah();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (typeof details.seekTime === 'number' && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
          setCurrentTime(details.seekTime);
        }
      });
    } catch {
      // Ignore partial MediaSession support on older WebViews
    }
  }, [
    currentPlaying?.surahNomor,
    currentPlaying?.ayahNomor,
    currentPlaying?.isFullSurah,
    currentPlaying?.isPlaying,
    onTogglePlayPause,
    onPrevAyah,
    onNextAyah
  ]);

  if (!currentPlaying) return null;

  const currentSurahMeta = SURAH_METADATA_LIST.find((s) => s.nomor === currentPlaying.surahNomor);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSpeedToggle = () => {
    const nextIdx = (speedIndex + 1) % PLAYBACK_SPEEDS.length;
    setSpeedIndex(nextIdx);
    if (audioRef.current) {
      audioRef.current.playbackRate = PLAYBACK_SPEEDS[nextIdx];
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
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <aside
      aria-label="Pemutar Audio Murottal"
      className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-[calc(4.75rem+env(safe-area-inset-bottom))] lg:bottom-0 inset-x-0 md:inset-x-6 lg:inset-x-0 md:max-w-2xl md:mx-auto lg:max-w-none z-40 px-3 sm:px-6 py-2 sm:py-3 lg:pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-white/95 dark:bg-slate-900/95 [body.theme-sepia_&]:bg-[#f3ead7]/95 backdrop-blur-md border-t md:border lg:border-x-0 lg:border-b-0 border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] md:rounded-2xl lg:rounded-none shadow-2xl transition-all"
    >
      <div className="max-w-6xl mx-auto space-y-1 sm:space-y-2">
        
        {/* Top Mini Progress Bar / Scrubber */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-slate-500">
          <span className="tabular-nums w-8 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Posisi Putar Audio"
            className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 [body.theme-sepia_&]:bg-[#debfa0] rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
          />
          <span className="tabular-nums w-8">{formatTime(duration)}</span>
        </div>

        {/* Main Controls Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Track Details */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </div>

            <div className="truncate">
              <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] truncate flex items-center gap-1.5">
                <span>
                  {currentPlaying.isFullSurah
                    ? `Surah ${currentSurahMeta?.namaLatin || currentPlaying.surahNomor} (Lengkap)`
                    : `Surah ${currentSurahMeta?.namaLatin || currentPlaying.surahNomor} : Ayat ${currentPlaying.ayahNomor}`}
                </span>
                {currentPlaying.isPlaying && (
                  <span className="inline-flex items-center gap-0.5 h-3 ml-1">
                    <span className="w-0.5 h-2 bg-emerald-500 animate-pulse rounded-full" />
                    <span className="w-0.5 h-3 bg-emerald-500 animate-pulse rounded-full delay-75" />
                    <span className="w-0.5 h-1.5 bg-emerald-500 animate-pulse rounded-full delay-150" />
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] truncate">
                Murottal: Syaikh Misyari Rasyid Al-Afasi
              </p>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
            
            {/* Repeat Ayah */}
            <button
              onClick={() => setIsRepeat(!isRepeat)}
              aria-label="Ulangi Ayat Ini"
              title={isRepeat ? 'Ulangi Ayat (Aktif)' : 'Ulangi Ayat (Nonaktif)'}
              className={`min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 p-2 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
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
              className="min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 p-2 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              onClick={onTogglePlayPause}
              disabled={isLoading}
              aria-label={currentPlaying.isPlaying ? 'Jeda Audio' : 'Lanjutkan Audio'}
              className="min-w-11 min-h-11 sm:min-w-0 sm:min-h-0 p-2.5 flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
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
              className="min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 p-2 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
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
  );
};
