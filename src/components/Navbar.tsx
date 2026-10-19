import React from 'react';
import { BookOpen, BookMarked, Sparkles, Moon, Sun, Coffee, Settings2, Search } from 'lucide-react';
import { ReadingTheme } from '../types/quran';

interface NavbarProps {
  activeTab: 'surah' | 'reader' | 'hadith' | 'tajwid' | 'saved';
  setActiveTab: (tab: 'surah' | 'reader' | 'hadith' | 'tajwid' | 'saved') => void;
  theme: ReadingTheme;
  setTheme: (theme: ReadingTheme) => void;
  onOpenSettings: () => void;
  onQuickSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  onOpenSettings,
  onQuickSearch
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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-200 border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 [body.theme-sepia_&]:bg-[#fbf5e8]/90 [body.theme-sepia_&]:border-[#e8dec9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text wordmark (Top Bar Contract) */}
        <button
          onClick={() => setActiveTab('surah')}
          className="text-left group cursor-pointer focus:outline-none shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-600 text-white font-arabic text-lg font-bold shadow-sm shadow-emerald-500/20">
              ق
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] whitespace-nowrap">
              Al-Qur'an Digital
            </span>
          </div>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
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
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onQuickSearch}
            aria-label="Cari Cepat"
            title="Pencarian Ayat & Hadits"
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 [body.theme-sepia_&]:text-[#6e5840] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTheme}
            aria-label={`Ganti Tema: ${getThemeTitle()}`}
            title={`Ganti Tema: ${getThemeTitle()}`}
            className="p-2 text-slate-600 dark:text-slate-300 [body.theme-sepia_&]:text-[#54412c] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {getThemeIcon()}
            <span className="hidden sm:inline text-xs font-medium">
              {theme === 'dark' ? 'Malam' : theme === 'sepia' ? 'Sepia' : 'Terang'}
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Pengaturan Tampilan dan Font"
            title="Pengaturan Aksesibilitas & Ukuran Teks"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-sm shadow-emerald-600/20"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pengaturan</span>
          </button>
        </div>

      </div>

      {/* Mobile Navigation Strip */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-200/60 dark:border-slate-800/60 [body.theme-sepia_&]:border-[#e8dec9]/60 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('surah')}
          className={`px-2.5 py-1 rounded-md cursor-pointer whitespace-nowrap ${
            activeTab === 'surah'
              ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Surah
        </button>
        <button
          onClick={() => setActiveTab('reader')}
          className={`px-2.5 py-1 rounded-md cursor-pointer whitespace-nowrap ${
            activeTab === 'reader'
              ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Baca
        </button>
        <button
          onClick={() => setActiveTab('hadith')}
          className={`px-2.5 py-1 rounded-md cursor-pointer whitespace-nowrap ${
            activeTab === 'hadith'
              ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Hadits
        </button>
        <button
          onClick={() => setActiveTab('tajwid')}
          className={`px-2.5 py-1 rounded-md cursor-pointer whitespace-nowrap ${
            activeTab === 'tajwid'
              ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Tajwid
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-2.5 py-1 rounded-md cursor-pointer whitespace-nowrap ${
            activeTab === 'saved'
              ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Riwayat
        </button>
      </div>
    </header>
  );
};
