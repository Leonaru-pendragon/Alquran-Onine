import React, { useState, useMemo, useEffect } from 'react';
import { Search, Bookmark, ChevronRight, X, Sparkles, BookOpen, TrendingUp, Mic } from 'lucide-react';
import { SurahMeta, ReadingHistoryItem, JuzMeta } from '../types/quran';
import { SURAH_METADATA_LIST, JUZ_LIST } from '../data/quranMetadata';
import { filterSurahs, calculateReadingProgress, formatIndonesianRelativeTime } from '../utils/quranLogic';
import { SurahCard } from './SurahCard';
import { PWAInstallButton } from './PWAInstallButton';

interface SurahListViewProps {
  onSelectSurah: (nomor: number, initialAyah?: number) => void;
  lastRead: ReadingHistoryItem | null;
  onNavigateToHadith: () => void;
  onNavigateToTajwid: () => void;
  onNavigateToProgress?: () => void;
  onOpenVoiceSearch?: () => void;
  onOpenDownloadModal?: () => void;
  externalSearchQuery?: string;
  initialFilter?: 'Semua' | 'Makkiyyah' | 'Madaniyyah' | 'Juz';
}

export const SurahListView: React.FC<SurahListViewProps> = ({
  onSelectSurah,
  lastRead,
  onNavigateToHadith,
  onNavigateToTajwid,
  onNavigateToProgress,
  onOpenVoiceSearch,
  onOpenDownloadModal,
  externalSearchQuery,
  initialFilter
}) => {
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');
  const [activeFilter, setActiveFilter] = useState<'Semua' | 'Makkiyyah' | 'Madaniyyah' | 'Juz'>(
    initialFilter || 'Semua'
  );

  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  useEffect(() => {
    if (initialFilter !== undefined) {
      setActiveFilter(initialFilter);
    }
  }, [initialFilter]);

  // Filter surahs
  const filteredSurahs = useMemo(() => {
    if (activeFilter === 'Juz') return SURAH_METADATA_LIST;
    return filterSurahs(SURAH_METADATA_LIST, searchQuery, activeFilter);
  }, [searchQuery, activeFilter]);

  // Filter Juz
  const filteredJuz = useMemo(() => {
    if (!searchQuery.trim()) return JUZ_LIST;
    const q = searchQuery.toLowerCase();
    return JUZ_LIST.filter(j => 
      String(j.nomor) === q ||
      j.namaMulai.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Device-Matched App Download & Home Screen Install Banner */}
      <PWAInstallButton variant="banner" onOpenDownloadModal={onOpenDownloadModal} />

      {/* Hero: Lanjutkan Membaca Card (if history exists) */}
      {lastRead && (
        <section aria-labelledby="resume-heading" className="relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent [body.theme-sepia_&]:border-[#dec9a5] [body.theme-sepia_&]:bg-[#ebdcc0]/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 [body.theme-sepia_&]:text-amber-900">
                <Bookmark className="w-3.5 h-3.5" />
                <span id="resume-heading">Terakhir Dibaca</span>
                <span aria-hidden="true">·</span>
                <span>{formatIndonesianRelativeTime(lastRead.timestamp)}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                Surah {lastRead.surahNamaLatin} <span className="text-emerald-600 dark:text-emerald-400 font-semibold">: Ayat {lastRead.ayatNomor}</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
                Progres: {calculateReadingProgress(lastRead.ayatNomor, lastRead.totalAyat)}% ({lastRead.ayatNomor} dari {lastRead.totalAyat} ayat)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
              {onNavigateToProgress && (
                <button
                  onClick={onNavigateToProgress}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-white/60 dark:bg-slate-900/60 hover:bg-emerald-500/10 rounded-xl transition-all border border-emerald-300/80 dark:border-emerald-700/80 cursor-pointer shadow-xs"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Progres Khatam</span>
                </button>
              )}
              <button
                onClick={() => onSelectSurah(lastRead.surahNomor, lastRead.ayatNomor)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl transition-all cursor-pointer shadow-sm shadow-emerald-600/30"
              >
                <span>Lanjutkan Membaca</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Quick Discovery Cards (1 col phone, 2x2 on iPad/Tablet Portrait, 4 cols on iPad Landscape & Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          onClick={() => onSelectSurah(18)}
          className="p-4 rounded-xl text-left bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] hover:border-emerald-400/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Sunnah Hari Jumat</span>
            <span className="font-arabic text-sm">الكهف</span>
          </div>
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            Surah Al-Kahf
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#705e49] mt-0.5">
            110 ayat · Cahaya pelindung fitnah akhir zaman
          </p>
        </button>

        <button
          onClick={() => onSelectSurah(67)}
          className="p-4 rounded-xl text-left bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] hover:border-emerald-400/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Dibaca Setiap Malam</span>
            <span className="font-arabic text-sm">الملك</span>
          </div>
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            Surah Al-Mulk
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#705e49] mt-0.5">
            30 ayat · Penyelamat dari siksa kubur
          </p>
        </button>

        <button
          onClick={() => onSelectSurah(36)}
          className="p-4 rounded-xl text-left bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] hover:border-emerald-400/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Jantung Al-Qur'an</span>
            <span className="font-arabic text-sm">يس</span>
          </div>
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            Surah Yasin
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#705e49] mt-0.5">
            83 ayat · Meneguhkan kepastian hari kebangkitan
          </p>
        </button>

        <button
          onClick={onNavigateToTajwid}
          className="p-4 rounded-xl text-left bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] hover:border-emerald-400/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Metode Qira'ati</span>
            <span className="font-arabic text-sm">قِرَاءَتِي</span>
          </div>
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            Ilmu Tajwid Praktis
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#705e49] mt-0.5">
            13 Pelajaran & 33 Soal Jawab · H. Dachlan Salim Zarkasyi
          </p>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input with Voice Search Button */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="search"
              enterKeyHint="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari surah, nomor, atau arti (mis. Al-Kahf, 36)..."
              className="w-full pl-10 pr-16 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#dec9a5] text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {onOpenVoiceSearch && (
                <button
                  type="button"
                  onClick={onOpenVoiceSearch}
                  aria-label="Pencarian Suara"
                  title="Cari dengan Perintah Suara"
                  className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg cursor-pointer transition-colors"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive Filter Tabs (Segmented controls) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/80 [body.theme-sepia_&]:bg-[#ebdcc0] rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
            {(['Semua', 'Makkiyyah', 'Madaniyyah', 'Juz'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === filter
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs [body.theme-sepia_&]:bg-[#fbf5e8] [body.theme-sepia_&]:text-[#2c2217]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 [body.theme-sepia_&]:text-[#624f3a]'
                }`}
              >
                {filter === 'Semua' ? 'Semua Surah (114)' : filter === 'Juz' ? 'Daftar 30 Juz' : filter}
              </button>
            ))}
          </div>

        </div>

        {/* Search Results Count info */}
        {searchQuery && (
          <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#705e49]">
            Ditemukan {activeFilter === 'Juz' ? filteredJuz.length : filteredSurahs.length} hasil untuk pencarian "{searchQuery}"
          </p>
        )}
      </div>

      {/* Main Content: Surah Grid or Juz List */}
      {activeFilter === 'Juz' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredJuz.map((juz) => (
            <button
              key={juz.nomor}
              onClick={() => onSelectSurah(juz.surahMulai, juz.ayatMulai)}
              className="p-4 rounded-xl text-left bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Juz {juz.nomor}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#6b5842] mt-1">
                  <span>Mulai: {juz.namaMulai}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      ) : (
        <>
          {filteredSurahs.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:bg-[#f6eee0]/40">
              <Search className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <h3 className="font-semibold text-base text-slate-800 dark:text-slate-200 [body.theme-sepia_&]:text-[#2c2217]">
                Surah Tidak Ditemukan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#705e49] mt-1 max-w-sm mx-auto">
                Coba gunakan kata kunci lain seperti nomor surah (mis. 1, 18, 114) atau nama surah dalam bahasa Latin maupun arti.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg cursor-pointer"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredSurahs.map((surah) => (
                <SurahCard
                  key={surah.nomor}
                  surah={surah}
                  onSelect={onSelectSurah}
                  isLastRead={lastRead?.surahNomor === surah.nomor}
                />
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
};
