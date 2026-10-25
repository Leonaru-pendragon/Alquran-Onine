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
  ariaLabel: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'surah', label: 'Surah', ariaLabel: 'Daftar Surah', Icon: BookOpen },
  { id: 'reader', label: 'Baca', ariaLabel: 'Baca Quran', Icon: BookMarked },
  { id: 'hadith', label: 'Hadits', ariaLabel: 'Ensiklopedia Hadits', Icon: Library },
  { id: 'tajwid', label: 'Tajwid', ariaLabel: 'Panduan Tajwid', Icon: Sparkles },
  { id: 'saved', label: 'Riwayat', ariaLabel: 'Tersimpan dan Riwayat', Icon: Bookmark }
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav
      aria-label="Navigasi Utama Seluler dan Tablet"
      className="lg:hidden fixed bottom-0 md:bottom-4 inset-x-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[580px] z-40 bg-white/95 dark:bg-slate-950/95 [body.theme-sepia_&]:bg-[#fbf5e8]/95 backdrop-blur-md border-t md:border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#e8dec9] md:rounded-2xl md:shadow-xl pb-[env(safe-area-inset-bottom)] md:pb-0"
    >
      <div className="grid grid-cols-5 items-center h-14 px-1 md:px-2 md:gap-1">
        {MOBILE_TABS.map(({ id, label, ariaLabel, Icon }) => {
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
              className={`min-h-11 w-full flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1.5 rounded-xl transition-all active:scale-95 cursor-pointer px-1 md:px-2.5 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 md:bg-emerald-50/90 md:dark:bg-emerald-950/60 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] md:hover:bg-slate-100/80 md:dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
              <span className="text-[10px] md:text-xs tracking-tight whitespace-nowrap leading-none mt-0.5 md:mt-0">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
