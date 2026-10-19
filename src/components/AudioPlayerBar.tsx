import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, X, Volume2 } from 'lucide-react';
import { SURAH_METADATA_LIST } from '../data/quranMetadata';

interface AudioPlayerBarProps {
  currentPlaying: {
    surahNomor: number;
    ayahNomor: number;
    audioUrl: string;
    isPlaying: boolean;
  } | null;
  onClose: () => void;
  onNextAyah: () => void;
  onPrevAyah: () => void;
  onTogglePlayPause: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentPlaying,
  onClose,
  onNextAyah,
  onPrevAyah,
  onTogglePlayPause
}) => {
  const [isRepeat, setIsRepeat] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!currentPlaying) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(currentPlaying.audioUrl);
    } else {
      audioRef.current.src = currentPlaying.audioUrl;
    }

    if (currentPlaying.isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn('Autoplay terhalang oleh browser:', err);
      });
    } else {
      audioRef.current.pause();
    }

    const handleEnded = () => {
      if (isRepeat) {
        audioRef.current?.play().catch(() => {});
      } else {
        onNextAyah();
      }
    };

    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [currentPlaying?.audioUrl, currentPlaying?.isPlaying, isRepeat]);

  // Handle Pause / Play state changes
  useEffect(() => {
    if (!audioRef.current || !currentPlaying) return;
    if (currentPlaying.isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [currentPlaying?.isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  if (!currentPlaying) return null;

  const currentSurahMeta = SURAH_METADATA_LIST.find((s) => s.nomor === currentPlaying.surahNomor);

  return (
    <aside aria-label="Pemutar Audio Murottal" className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 [body.theme-sepia_&]:bg-[#f3ead7]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] shadow-lg">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
          <div className="truncate">
            <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] truncate">
              Surah {currentSurahMeta?.namaLatin || `Surah ${currentPlaying.surahNomor}`} : Ayat {currentPlaying.ayahNomor}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] truncate">
              Murottal: Syaikh Misyari Rasyid Al-Afasy
            </p>
          </div>
        </div>

        {/* Central Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsRepeat(!isRepeat)}
            aria-label="Ulangi Ayat Ini"
            title={isRepeat ? 'Ulangi Ayat (Aktif)' : 'Ulangi Ayat (Nonaktif)'}
            className={`p-2 rounded-lg cursor-pointer transition-colors ${
              isRepeat
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>

          <button
            onClick={onPrevAyah}
            aria-label="Ayat Sebelumnya"
            title="Ayat Sebelumnya"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlayPause}
            aria-label={currentPlaying.isPlaying ? 'Jeda Audio' : 'Lanjutkan Audio'}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer transition-transform active:scale-95"
          >
            {currentPlaying.isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onNextAyah}
            aria-label="Ayat Selanjutnya"
            title="Ayat Selanjutnya"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            aria-label="Tutup Pemutar Audio"
            title="Tutup Pemutar"
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </aside>
  );
};
