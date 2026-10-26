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
  isValidQariId
} from '../services/quranApi';
import {
  AudioTrackTarget,
  PersistedAudioSession
} from '../utils/sessionPersistence';
import {
  PLAYBACK_SPEEDS,
  EngineUiSnapshot,
  backgroundAudioEngine
} from '../utils/backgroundAudioEngine';

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
  onExternalPause?: () => void;
  onTogglePlayPause: () => void;
}

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
  onExternalPause,
  onTogglePlayPause
}) => {
  const activeQariId: QariId = isValidQariId(selectedQariId) ? selectedQariId : DEFAULT_QARI_ID;
  const activeQari = getQariById(activeQariId);

  const configuredInitialRef = useRef(false);
  if (!configuredInitialRef.current) {
    configuredInitialRef.current = true;
    if (initialAudioSession) {
      backgroundAudioEngine.configureInitialPreferences({
        currentTime: initialAudioSession.currentTime,
        speedIndex: initialAudioSession.speedIndex,
        isRepeat: initialAudioSession.isRepeat
      });
    }
  }

  const [engineSnap, setEngineSnap] = useState<EngineUiSnapshot>(() =>
    backgroundAudioEngine.getSnapshot()
  );

  // Keep engine callbacks synchronized with latest React handlers on every render
  backgroundAudioEngine.setCallbacks({
    onAdvanceTrack,
    onAutoplayBlocked,
    onExternalPause,
    onTogglePlayPause,
    onNextAyah,
    onPrevAyah,
    onClose
  });

  // Mount dual off-screen persistent <audio> decks on document.body once and subscribe to snapshots
  useEffect(() => {
    return backgroundAudioEngine.subscribe(setEngineSnap);
  }, []);

  // Synchronize cold-hydrated or external React state transitions idempotently
  useEffect(() => {
    backgroundAudioEngine.syncFromReactState(currentPlaying, activeQariId);
  }, [
    currentPlaying?.surahNomor,
    currentPlaying?.ayahNomor,
    currentPlaying?.audioUrl,
    currentPlaying?.isPlaying,
    currentPlaying?.isFullSurah,
    activeQariId
  ]);

  const {
    currentTime,
    duration,
    isLoading,
    volume,
    isMuted,
    speedIndex,
    isRepeat
  } = engineSnap;

  const currentSurahMeta = currentPlaying
    ? SURAH_METADATA_LIST.find((s) => s.nomor === currentPlaying.surahNomor)
    : undefined;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    backgroundAudioEngine.seekTo(Number(e.target.value));
  };

  const handleSpeedToggle = () => {
    backgroundAudioEngine.toggleSpeed();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    backgroundAudioEngine.setVolumeLevel(Number(e.target.value));
  };

  const handleToggleMute = () => {
    backgroundAudioEngine.toggleMute();
  };

  const formatTime = (secs: number) => {
    if (Number.isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
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
                        className="!text-[11px] leading-tight font-medium text-emerald-700 dark:text-emerald-400 [body.theme-sepia_&]:text-[#4d3c2a] bg-transparent hover:underline focus:outline-none cursor-pointer truncate max-w-[112px] sm:max-w-[210px] py-0.5"
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
                  onClick={() => backgroundAudioEngine.toggleRepeat()}
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
