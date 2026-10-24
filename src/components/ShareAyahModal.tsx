import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { Ayah } from '../types/quran';

interface ShareAyahModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahName: string;
  surahNomor: number;
  ayah: Ayah | null;
}

export const ShareAyahModal: React.FC<ShareAyahModalProps> = ({
  isOpen,
  onClose,
  surahName,
  surahNomor,
  ayah
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !ayah) return null;

  const quoteText = `${ayah.teksArab}\n\n"${ayah.teksIndonesia}"\n\n(QS. ${surahName} [${surahNomor}]: ${ayah.nomorAyat})`;

  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleCopy = () => {
    navigator.clipboard.writeText(quoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (!canNativeShare) {
      handleCopy();
      return;
    }
    try {
      await navigator.share({
        title: `QS. ${surahName} [${surahNomor}]: Ayat ${ayah.nomorAyat}`,
        text: quoteText
      });
    } catch {
      // User dismissed share sheet or share unavailable in frame
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-ayah-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg p-5 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 [body.theme-sepia_&]:bg-[#fbf5e8] border border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] shadow-2xl space-y-5 max-h-[90dvh] overflow-y-auto overscroll-contain">
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-1 mb-1" />
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 id="share-ayah-title" className="font-bold text-base text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
              Bagikan Kutipan Ayat Suci
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="min-w-11 min-h-11 sm:min-w-0 sm:min-h-0 p-1.5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-lg space-y-4 text-center relative overflow-hidden">
          <div className="text-[11px] font-medium tracking-widest opacity-85">
            Al-Qur'an Al-Karim
          </div>

          <div className="font-arabic text-2xl sm:text-3xl leading-relaxed py-2 font-bold">
            {ayah.teksArab}
          </div>

          <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed font-light">
            "{ayah.teksIndonesia}"
          </p>

          <div className="pt-2 text-xs font-semibold text-emerald-200 border-t border-emerald-500/40">
            QS. {surahName} : Ayat {ayah.nomorAyat}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-1">
          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="min-h-11 flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-sm whitespace-nowrap"
            >
              <Share2 className="w-4 h-4" />
              <span>Bagikan ke Aplikasi</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className={`min-h-11 flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
              canNativeShare
                ? 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin ke Clipboard' : 'Salin Kutipan Teks'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 sm:min-h-0 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
