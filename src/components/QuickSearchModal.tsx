import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, ChevronRight, Mic } from 'lucide-react';
import { SURAH_METADATA_LIST } from '../data/quranMetadata';
import { COMPREHENSIVE_HADITHS } from '../data/hadithsData';
import { TAJWID_RULES } from '../data/tajwidRules';
import { filterSurahs, filterHadiths } from '../utils/quranLogic';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSurah: (nomor: number, initialAyah?: number) => void;
  onSelectHadith: () => void;
  onSelectTajwid?: () => void;
  onOpenVoiceSearch?: () => void;
  initialQuery?: string;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectSurah,
  onSelectHadith,
  onSelectTajwid,
  onOpenVoiceSearch,
  initialQuery
}) => {
  const [query, setQuery] = useState(initialQuery || '');

  useEffect(() => {
    if (initialQuery !== undefined) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const surahResults = useMemo(() => {
    if (!query.trim()) return [];
    return filterSurahs(SURAH_METADATA_LIST, query).slice(0, 5);
  }, [query]);

  const tajwidResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return TAJWID_RULES.filter(
      (r) =>
        r.nama.toLowerCase().includes(q) ||
        r.kategori.toLowerCase().includes(q) ||
        r.deskripsi.toLowerCase().includes(q) ||
        r.caraBaca.toLowerCase().includes(q) ||
        r.contohLatin.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [query]);

  const hadithResults = useMemo(() => {
    if (!query.trim()) return [];
    return filterHadiths(COMPREHENSIVE_HADITHS, query).slice(0, 4);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian Cepat Surah, Kaidah Tajwid, dan Hadits"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:p-4 sm:pt-16 bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 [body.theme-sepia_&]:bg-[#fbf5e8] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Search Bar Input */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 sm:gap-3">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            autoFocus
            type="search"
            enterKeyHint="search"
            maxLength={150}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik surah, kaidah tajwid (mis. Ghunnah, Ikhfa), atau hadits..."
            className="w-full text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Bersihkan pencarian"
              className="min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 p-1.5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {onOpenVoiceSearch && (
            <button
              onClick={() => {
                onClose();
                onOpenVoiceSearch();
              }}
              aria-label="Pencarian Suara"
              title="Gunakan Suara"
              className="min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 p-1.5 flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg cursor-pointer transition-colors"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Tutup Pencarian Cepat"
            className="min-h-10 sm:min-h-0 text-xs font-medium px-2.5 py-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Tutup
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[68dvh] sm:max-h-[65vh] overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-4">
          {!query.trim() ? (
            <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <p>Mulai ketik kata kunci untuk mencari di 114 Surah Al-Qur'an, Kaidah Ilmu Tajwid Praktis, dan Ensiklopedia Hadits.</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                <span className="text-[11px] text-slate-400">Pencarian populer:</span>
                {['Al-Kahf', 'Yasin', 'Ghunnah', 'Ikhfa', 'Qalqalah', 'Idzhar Wajib', 'Sabar'].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => setQuery(sample)}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Surah Matches */}
              {surahResults.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2">
                    Surah Al-Qur'an ({surahResults.length})
                  </div>
                  {surahResults.map((s) => (
                    <button
                      key={s.nomor}
                      onClick={() => {
                        onSelectSurah(s.nomor);
                        onClose();
                      }}
                      className="w-full p-3 rounded-xl flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold tabular-nums">
                          {s.nomor}
                        </div>
                        <div>
                          <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            Surah {s.namaLatin}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {s.arti} · {s.jumlahAyat} ayat · {s.tempatTurun}
                          </div>
                        </div>
                      </div>
                      <span className="font-arabic text-lg text-slate-700 dark:text-slate-300">
                        {s.nama}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Kaidah Ilmu Tajwid Praktis Matches */}
              {tajwidResults.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2">
                    Ilmu Tajwid Praktis ({tajwidResults.length})
                  </div>
                  {tajwidResults.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        if (onSelectTajwid) {
                          onSelectTajwid();
                        } else if (r.rujukanSurah) {
                          onSelectSurah(r.rujukanSurah.surahNomor, r.rujukanSurah.ayatNomor);
                        }
                        onClose();
                      }}
                      className="w-full p-3 rounded-xl flex items-center justify-between gap-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-semibold text-xs text-emerald-700 dark:text-emerald-400">
                          {r.nama} · Pelajaran ke-{r.pelajaranKe} ({r.halamanBuku})
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1">
                          {r.deskripsi}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Hadith Matches */}
              {hadithResults.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2">
                    Hadits Mulia ({hadithResults.length})
                  </div>
                  {hadithResults.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        onSelectHadith();
                        onClose();
                      }}
                      className="w-full p-3 rounded-xl flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                    >
                      <div className="space-y-1 min-w-0 pr-2">
                        <div className="font-semibold text-xs text-emerald-700 dark:text-emerald-400">
                          {h.kitabNama} : No. {h.nomor} · {h.tema}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1">
                          "{h.terjemah}"
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {surahResults.length === 0 && tajwidResults.length === 0 && hadithResults.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  Tidak ditemukan hasil untuk "{query}". Coba kata kunci seperti Ghunnah, Ikhfa, Yasin, atau Sabar.
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
