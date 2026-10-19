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

  const handleCopy = () => {
    navigator.clipboard.writeText(quoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-slate-900 [body.theme-sepia_&]:bg-[#fbf5e8] border border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
              Bagikan Kutipan Ayat Suci
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-lg space-y-4 text-center relative overflow-hidden">
          <div className="text-[11px] font-medium tracking-widest uppercase opacity-80">
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
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin ke Clipboard' : 'Salin Kutipan Teks'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
