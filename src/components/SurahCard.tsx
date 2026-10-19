import React from 'react';
import { SurahMeta } from '../types/quran';

interface SurahCardProps {
  surah: SurahMeta;
  onSelect: (nomor: number) => void;
  isLastRead?: boolean;
}

export const SurahCard: React.FC<SurahCardProps> = ({ surah, onSelect, isLastRead }) => {
  return (
    <button
      onClick={() => onSelect(surah.nomor)}
      className={`group w-full p-4 rounded-xl text-left transition-all duration-200 cursor-pointer border relative flex items-center justify-between gap-4 ${
        isLastRead
          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 [body.theme-sepia_&]:bg-[#f3ead7] [body.theme-sepia_&]:border-[#cbbda2]'
          : 'bg-white dark:bg-slate-900/70 border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-700/60 hover:shadow-sm [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6]'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Geometric Islamic Number Frame */}
        <div className="relative w-10 h-10 shrink-0 flex items-center justify-center font-semibold text-xs tabular-nums text-emerald-700 dark:text-emerald-400 [body.theme-sepia_&]:text-amber-900 bg-emerald-50 dark:bg-emerald-950/60 [body.theme-sepia_&]:bg-[#ebdcc0] rounded-lg border border-emerald-200/60 dark:border-emerald-800/50 [body.theme-sepia_&]:border-[#dec9a5]">
          {surah.nomor}
        </div>

        {/* Info */}
        <div className="truncate">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
              {surah.namaLatin}
            </h3>
            {isLastRead && (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Terakhir
              </span>
            )}
          </div>

          {/* Clean unboxed metadata with · separator (Zero-pill discipline) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#6b5842] mt-0.5">
            <span className="truncate">{surah.arti}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{surah.tempatTurun}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0 tabular-nums">{surah.jumlahAyat} ayat</span>
          </div>
        </div>
      </div>

      {/* Arabic Script Calligraphy */}
      <div className="font-arabic text-xl font-bold text-slate-800 dark:text-slate-200 [body.theme-sepia_&]:text-[#352718] shrink-0 text-right group-hover:scale-105 transition-transform duration-200">
        {surah.nama}
      </div>
    </button>
  );
};
