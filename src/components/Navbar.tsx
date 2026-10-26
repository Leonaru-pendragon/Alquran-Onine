import React from 'react';
import { Moon, Sun, Coffee, Settings2, Search, Mic, Download } from 'lucide-react';
import { ReadingTheme } from '../types/quran';

interface NavbarProps {
  activeTab: 'surah' | 'reader' | 'hadith' | 'tajwid' | 'saved';
  setActiveTab: (tab: 'surah' | 'reader' | 'hadith' | 'tajwid' | 'saved') => void;
  theme: ReadingTheme;
  setTheme: (theme: ReadingTheme) => void;
  onOpenSettings: () => void;
  onQuickSearch: () => void;
  onOpenVoiceSearch: () => void;
  onOpenDownloadModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  onOpenSettings,
  onQuickSearch,
  onOpenVoiceSearch,
  onOpenDownloadModal
}) => {
  const toggleTheme = () => {
    if (theme === 'light') setTheme('sepia');
    else if (theme === 'sepia') setTheme('dark');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="w-4 h-4 text-emerald-400" />;
    if (theme === 'sepia') return <Coffee className="w-4 h-4 text-amber-700" />;
    return <Sun className="w-4 h-4 text-amber-500" />;
  };

  const getThemeTitle = () => {
    if (theme === 'dark') return 'Mode Malam (Aktif)';
    if (theme === 'sepia') return 'Mode Sepia (Aktif)';
    return 'Mode Terang (Aktif)';
  };

  return (
    <header className="sticky top-0 z-40 w-full pt-[env(safe-area-inset-top)] backdrop-blur-md border-b transition-colors duration-200 border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 [body.theme-sepia_&]:bg-[#fbf5e8]/90 [body.theme-sepia_&]:border-[#e8dec9]">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-5 xl:px-8 h-14 md:h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-4 xl:gap-8">
        
        {/* Zone 1: Single text wordmark (Top Bar Contract) */}
        <button
          onClick={() => setActiveTab('surah')}
          className="text-left group cursor-pointer focus:outline-none shrink-0 min-h-11 flex items-center"
        >
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-600 text-white font-arabic text-lg font-bold shadow-sm shadow-emerald-500/20 shrink-0">
              ق
            </div>
            <span className="text-sm sm:text-base xl:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] whitespace-nowrap">
              Al-Qur'an Digital
            </span>
          </div>
        </button>

        {/* Zone 2: Clean single-line navigation links (visible on iPad Landscape & Desktop 1024px+) */}
        <nav className="hidden lg:flex items-center gap-3.5 xl:gap-7 text-[13px] xl:text-sm font-medium">
          <button
            onClick={() => setActiveTab('surah')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'surah'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 [body.theme-sepia_&]:text-[#5c4a36]'
            }`}
          >
            Daftar Surah
          </button>

          <button
            onClick={() => setActiveTab('reader')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'reader'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 [body.theme-sepia_&]:text-[#5c4a36]'
            }`}
          >
            Baca Quran
          </button>

          <button
            onClick={() => setActiveTab('hadith')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'hadith'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 [body.theme-sepia_&]:text-[#5c4a36]'
            }`}
          >
            Ensiklopedia Hadits
          </button>

          <button
            onClick={() => setActiveTab('tajwid')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'tajwid'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 [body.theme-sepia_&]:text-[#5c4a36]'
            }`}
          >
            Panduan Tajwid
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'saved'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 [body.theme-sepia_&]:text-[#5c4a36]'
            }`}
          >
            Tersimpan & Riwayat
          </button>
        </nav>

        {/* Zone 3: Primary Action & Preferences */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 xl:gap-2 shrink-0">
          <button
            onClick={onOpenVoiceSearch}
            aria-label="Pencarian Suara Al-Qur'an"
            title="Pencarian Suara Al-Qur'an (Web Speech API)"
            className="min-w-10 min-h-11 sm:min-w-11 lg:min-w-0 lg:min-h-0 p-2 flex items-center justify-center text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 [body.theme-sepia_&]:text-amber-800 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer relative group"
          >
            <Mic className="w-4 h-4" />
            <span className="sr-only">Pencarian Suara</span>
          </button>

          <button
            onClick={onQuickSearch}
            aria-label="Cari Cepat"
            title="Pencarian Ayat & Hadits"
            className="min-w-10 min-h-11 sm:min-w-11 lg:min-w-0 lg:min-h-0 p-2 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 [body.theme-sepia_&]:text-[#6e5840] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTheme}
            aria-label={`Ganti Tema: ${getThemeTitle()}`}
            title={`Ganti Tema: ${getThemeTitle()}`}
            className="min-w-10 min-h-11 sm:min-w-11 lg:min-w-0 lg:min-h-0 p-2 text-slate-600 dark:text-slate-300 [body.theme-sepia_&]:text-[#54412c] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            {getThemeIcon()}
            <span className="hidden sm:inline lg:hidden xl:inline text-xs font-medium whitespace-nowrap">
              {theme === 'dark' ? 'Malam' : theme === 'sepia' ? 'Sepia' : 'Terang'}
            </span>
          </button>

          {onOpenDownloadModal && (
            <button
              type="button"
              onClick={onOpenDownloadModal}
              aria-label="Unduh Aplikasi Sesuai Perangkat"
              title="Unduh Aplikasi Sesuai Perangkat (HP, Tablet, Laptop)"
              className="hidden sm:flex min-w-11 min-h-11 lg:min-w-0 lg:min-h-0 items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 [body.theme-sepia_&]:text-[#4d3c2a] border border-emerald-200 dark:border-emerald-800/80 [body.theme-sepia_&]:border-[#dec9a5] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline lg:hidden xl:inline">Unduh</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            aria-label="Pengaturan Tampilan dan Font"
            title="Pengaturan Aksesibilitas & Ukuran Teks"
            className="min-w-10 min-h-11 sm:min-w-11 lg:min-w-0 lg:min-h-0 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-sm shadow-emerald-600/20 whitespace-nowrap"
          >
            <Settings2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Pengaturan</span>
          </button>
        </div>

      </div>
    </header>
  );
};
