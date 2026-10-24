import React from 'react';
import { BookOpen, BookMarked, Library, Sparkles, Bookmark } from 'lucide-react';

type ActiveTabId = 'surah' | 'reader' | 'hadith' | 'tajwid' | 'saved';

interface MobileBottomNavProps {
  activeTab: ActiveTabId;
  setActiveTab: (tab: ActiveTabId) => void;
}

const MOBILE_TABS: Array<{
  id: ActiveTabId;
  label: string;
  tabletLabel: string;
  ariaLabel: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'surah', label: 'Surah', tabletLabel: 'Daftar Surah', ariaLabel: 'Daftar Surah', Icon: BookOpen },
  { id: 'reader', label: 'Baca', tabletLabel: 'Baca Quran', ariaLabel: 'Baca Quran', Icon: BookMarked },
  { id: 'hadith', label: 'Hadits', tabletLabel: 'Hadits', ariaLabel: 'Ensiklopedia Hadits', Icon: Library },
  { id: 'tajwid', label: 'Tajwid', tabletLabel: 'Tajwid & Gharib', ariaLabel: 'Panduan Tajwid dan Bacaan Gharib', Icon: Sparkles },
  { id: 'saved', label: 'Riwayat', tabletLabel: 'Progres & Riwayat', ariaLabel: 'Tersimpan dan Riwayat', Icon: Bookmark }
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav
      aria-label="Navigasi Utama Seluler dan Tablet"
      className="lg:hidden fixed bottom-0 md:bottom-3 inset-x-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-max md:max-w-[94vw] z-40 bg-white/95 dark:bg-slate-950/95 [body.theme-sepia_&]:bg-[#fbf5e8]/95 backdrop-blur-md border-t md:border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#e8dec9] md:rounded-2xl md:shadow-xl pb-[env(safe-area-inset-bottom)] md:pb-0"
    >
      <div className="grid grid-cols-5 md:flex md:items-center md:justify-center h-14 md:h-14 px-1 md:px-2 md:gap-1">
        {MOBILE_TABS.map(({ id, label, tabletLabel, ariaLabel, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveTab(id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label={ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-11 w-full md:w-auto flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 rounded-xl px-1 md:px-3.5 py-1 transition-colors active:scale-95 cursor-pointer shrink-0 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 md:bg-emerald-50/90 dark:md:bg-emerald-950/60 [body.theme-sepia_&]:md:bg-[#ebdcc0] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
              <span className="md:hidden text-[10px] tracking-tight whitespace-nowrap leading-none mt-0.5">
                {label}
              </span>
              <span className="hidden md:inline text-xs tracking-tight whitespace-nowrap leading-none">
                {tabletLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
