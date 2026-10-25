import React, { useState, useEffect, useRef } from 'react';
import { X, BookOpen, ChevronLeft, ChevronRight, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { Ayah, SurahTafsirDetail } from '../types/quran';
import { fetchSurahTafsir } from '../services/quranApi';
import { cleanTafsirText } from '../utils/quranLogic';
import { detectHorizontalSwipe } from '../utils/mobilePlatform';

interface TafsirModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNomor: number;
  surahName: string;
  totalAyah: number;
  currentAyah: Ayah | null;
  onNavigateAyah: (ayahNomor: number) => void;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  isOpen,
  onClose,
  surahNomor,
  surahName,
  totalAyah,
  currentAyah,
  onNavigateAyah
}) => {
  const [tafsirData, setTafsirData] = useState<SurahTafsirDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<number>(15);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const ayahNomor = currentAyah?.nomorAyat || 1;

  // Load tafsir for the current surah
  useEffect(() => {
    if (!isOpen || !surahNomor) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchSurahTafsir(surahNomor)
      .then((data) => {
        if (!isMounted) return;
        setTafsirData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Gagal memuat tafsir dari server.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, surahNomor]);

  // Keyboard navigation for iPad Magic Keyboard & Desktop (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isOpen || !currentAyah) return;
    const curNo = currentAyah.nomorAyat || 1;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && curNo > 1) {
        onNavigateAyah(curNo - 1);
      } else if (e.key === 'ArrowRight' && curNo < totalAyah) {
        onNavigateAyah(curNo + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentAyah, totalAyah, onClose, onNavigateAyah]);

  if (!isOpen || !currentAyah) return null;

  const rawTafsirText = tafsirData?.tafsir?.[ayahNomor] || '';
  const paragraphs = cleanTafsirText(rawTafsirText);

  const prevAyah = ayahNomor > 1 ? ayahNomor - 1 : null;
  const nextAyah = ayahNomor < totalAyah ? ayahNomor + 1 : null;

  const handleCopy = () => {
    const fullText = `Tafsir QS. ${surahName} [${surahNomor}]: Ayat ${ayahNomor}\n\n${currentAyah.teksArab}\n"${currentAyah.teksIndonesia}"\n\nPenafsiran (Kemenag RI):\n${paragraphs.join('\n\n')}\n\nSumber: ${tafsirData?.sumber || 'Kementerian Agama Republik Indonesia'}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchSurahTafsir(surahNomor)
      .then((data) => {
        setTafsirData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Gagal memuat tafsir.');
        setLoading(false);
      });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    if (t) {
      touchStartRef.current = { x: t.clientX, y: t.clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!t) return;

    const dir = detectHorizontalSwipe(start.x, start.y, t.clientX, t.clientY);
    if (dir === 'left' && nextAyah) {
      onNavigateAyah(nextAyah);
    } else if (dir === 'right' && prevAyah) {
      onNavigateAyah(prevAyah);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tafsir-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-3xl max-h-[90dvh] sm:max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 [body.theme-sepia_&]:bg-[#fbf5e8] border border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] shadow-2xl overflow-hidden pb-[env(safe-area-inset-bottom)]">
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 shrink-0" />
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#e8dec9] flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 id="tafsir-modal-title" className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                Tafsir Kemenag RI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
                QS. {surahName} [{surahNomor}] : Ayat {ayahNomor}
              </p>
            </div>
          </div>

          {/* Ayat Navigation & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Prev / Next Ayah Navigator */}
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/40">
              <button
                onClick={() => prevAyah && onNavigateAyah(prevAyah)}
                disabled={!prevAyah}
                aria-label="Tafsir Ayat Sebelumnya"
                title="Tafsir Ayat Sebelumnya"
                className="min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 p-1.5 flex items-center justify-center hover:bg-slate-200/60 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                {ayahNomor} / {totalAyah}
              </span>
              <button
                onClick={() => nextAyah && onNavigateAyah(nextAyah)}
                disabled={!nextAyah}
                aria-label="Tafsir Ayat Selanjutnya"
                title="Tafsir Ayat Selanjutnya"
                className="min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 p-1.5 flex items-center justify-center hover:bg-slate-200/60 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-slate-600 dark:text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Font size adjustments (accessible on mobile & desktop) */}
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/40 text-xs">
              <button
                onClick={() => setFontSize(Math.max(13, fontSize - 1))}
                aria-label="Perkecil Font Tafsir"
                title="Perkecil Font Tafsir"
                className="min-w-9 min-h-10 sm:min-w-0 sm:min-h-0 px-2 py-1.5 font-bold hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer text-slate-600 dark:text-slate-300"
              >
                A-
              </button>
              <span className="hidden sm:inline px-1.5 text-[11px] font-mono tabular-nums text-slate-400 border-x border-slate-200 dark:border-slate-800">
                {fontSize}px
              </span>
              <button
                onClick={() => setFontSize(Math.min(22, fontSize + 1))}
                aria-label="Perbesar Font Tafsir"
                title="Perbesar Font Tafsir"
                className="min-w-9 min-h-10 sm:min-w-0 sm:min-h-0 px-2 py-1.5 font-bold border-l sm:border-l-0 border-slate-200 dark:border-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer text-slate-600 dark:text-slate-300"
              >
                A+
              </button>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              disabled={loading || !!error || paragraphs.length === 0}
              aria-label="Salin Tafsir"
              title="Salin Tafsir Lengkap"
              className="min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 p-1.5 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Tutup Tafsir"
              className="min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 p-1.5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

          </div>

        </div>

        {/* Modal Scrollable Body (supports horizontal swipe for prev/next ayah on touch screens) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6"
        >
          
          {/* Reference Verse Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 [body.theme-sepia_&]:bg-[#ebdcc0]/50 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
            <div className="arabic-verse font-arabic text-xl sm:text-2xl text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] leading-relaxed">
              {currentAyah.teksArab}
              <span className="inline-flex items-center justify-center px-1.5 text-sm text-emerald-700 dark:text-emerald-400 select-none">
                ﴿{currentAyah.nomorAyat}﴾
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#3b2e20] leading-relaxed italic border-t border-slate-200/60 dark:border-slate-700/60 pt-2.5">
              "{currentAyah.teksIndonesia}"
            </p>
          </div>

          {/* Tafsir Content Area */}
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mengambil teks tafsir resmi Kementerian Agama RI...
              </p>
            </div>
          ) : error ? (
            <div className="p-5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-center space-y-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto" />
              <p className="text-xs text-red-700 dark:text-red-300">
                {error}
              </p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Lagi</span>
              </button>
            </div>
          ) : paragraphs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Tafsir untuk ayat ini sedang dipersiapkan.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  Uraian Penafsiran:
                </span>
                <span className="text-[11px] truncate max-w-xs">
                  {tafsirData?.sumber || 'Kemenag RI'}
                </span>
              </div>

              <div
                className="space-y-3.5 text-slate-800 dark:text-slate-200 [body.theme-sepia_&]:text-[#2c2217] leading-relaxed text-justify"
                style={{ fontSize: `${fontSize}px` }}
              >
                {paragraphs.map((p, idx) => (
                  <p key={idx} className="indent-4 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#e8dec9] bg-slate-50/60 dark:bg-slate-900/60 [body.theme-sepia_&]:bg-[#f3ead7]/60 flex items-center justify-between gap-2 text-xs shrink-0">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
            <span className="sm:hidden">Geser kiri/kanan pindah ayat · </span>Tafsir Kemenag RI
          </span>
          <button
            onClick={onClose}
            className="min-h-10 sm:min-h-0 px-4 py-1.5 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg cursor-pointer shrink-0"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
