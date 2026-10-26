import React from 'react';
import { X, Sun, Moon, Coffee, RotateCw, Check, Volume2 } from 'lucide-react';
import { ReadingSettings } from '../types/quran';
import { QARI_OPTIONS, DEFAULT_QARI_ID, isValidQariId } from '../services/quranApi';
import { PWAInstallButton } from './PWAInstallButton';
import { forceRefreshAppCache } from '../utils/cacheRefresh';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReadingSettings;
  onUpdateSettings: (newSettings: Partial<ReadingSettings>) => void;
  onOpenDownloadModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenDownloadModal
}) => {
  if (!isOpen) return null;

  const selectedQariId = isValidQariId(settings.qariId) ? settings.qariId : DEFAULT_QARI_ID;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-xl p-5 sm:p-7 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-7 rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 [body.theme-sepia_&]:bg-[#fbf5e8] border border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] shadow-2xl space-y-5 max-h-[88dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain">
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-1 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 id="settings-modal-title" className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
              Pengaturan Membaca & Aksesibilitas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sesuaikan kenyamanan mata, ukuran teks, HP, Tablet & iPad
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Pengaturan"
            className="min-w-11 min-h-11 sm:min-w-0 sm:min-h-0 p-1.5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device-Matched App Download & PWA Installation */}
        <PWAInstallButton
          variant="settings"
          onOpenDownloadModal={
            onOpenDownloadModal
              ? () => {
                  onClose();
                  onOpenDownloadModal();
                }
              : undefined
          }
        />

        {/* Section 1: Tema Tampilan (Mode Gelap / Sepia / Terang) */}
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#2c2217]">
            Mode Tampilan (Kenyamanan Mata):
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => onUpdateSettings({ theme: 'light' })}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                settings.theme === 'light'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-slate-50 text-slate-900 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sun className="w-5 h-5 mx-auto mb-1 text-amber-500" />
              <span className="text-xs">Terang</span>
            </button>

            <button
              onClick={() => onUpdateSettings({ theme: 'sepia' })}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                settings.theme === 'sepia'
                  ? 'border-amber-600 ring-2 ring-amber-600/30 bg-[#f3ead7] text-[#2c2217] font-semibold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Coffee className="w-5 h-5 mx-auto mb-1 text-amber-700" />
              <span className="text-xs">Sepia Hangat</span>
            </button>

            <button
              onClick={() => onUpdateSettings({ theme: 'dark' })}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                settings.theme === 'dark'
                  ? 'border-emerald-400 ring-2 ring-emerald-400/30 bg-slate-800 text-white font-semibold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Moon className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
              <span className="text-xs">Malam Gelap</span>
            </button>
          </div>
        </div>

        {/* Section 2: Arabic Font Style */}
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#2c2217]">
            Gaya Kaligrafi Arab:
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onUpdateSettings({ arabicFontFamily: 'amiri' })}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                settings.arabicFontFamily === 'amiri'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40'
              }`}
            >
              <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">Amiri (Utsmani)</div>
              <div className="font-arabic text-lg text-emerald-700 dark:text-emerald-400 mt-1">الرَّحْمَٰنِ الرَّحِيمِ</div>
            </button>

            <button
              onClick={() => onUpdateSettings({ arabicFontFamily: 'scheherazade' })}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                settings.arabicFontFamily === 'scheherazade'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40'
              }`}
            >
              <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">Scheherazade (Naskh)</div>
              <div className="font-scheherazade text-lg text-emerald-700 dark:text-emerald-400 mt-1">الرَّحْمَٰنِ الرَّحِيمِ</div>
            </button>
          </div>
        </div>

        {/* Section 3: Pilihan Qari / Voice Actor Murottal */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#2c2217]">
              Pilihan Qari (Pelantun Murottal):
            </label>
          </div>
          <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label="Pilihan Qari Murottal">
            {QARI_OPTIONS.map((qari) => {
              const isSelected = selectedQariId === qari.id;
              return (
                <button
                  key={qari.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onUpdateSettings({ qariId: qari.id })}
                  className={`min-h-11 px-3.5 py-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/40 [body.theme-sepia_&]:bg-[#ebdcc0]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 [body.theme-sepia_&]:bg-[#f6eee0] hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] truncate">
                      {qari.nama}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] truncate">
                      {qari.keterangan}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-arabic text-base text-emerald-700 dark:text-emerald-400 [body.theme-sepia_&]:text-[#4d3c2a]">
                      {qari.namaArab}
                    </span>
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-700 text-transparent'
                      }`}
                      aria-hidden="true"
                    >
                      <Check className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Ukuran Teks Huruf Arab Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#2c2217]">
              Ukuran Huruf Arab:
            </label>
            <span className="text-xs font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">
              {settings.arabicFontSize} px
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={48}
            step={2}
            value={settings.arabicFontSize}
            onChange={(e) => onUpdateSettings({ arabicFontSize: Number(e.target.value) })}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          {/* Live Preview Box */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 [body.theme-sepia_&]:bg-[#ebdcc0]/50 border border-slate-200/60 dark:border-slate-800/60 text-right arabic-verse">
            <span
              className={`${settings.arabicFontFamily === 'scheherazade' ? 'font-scheherazade' : 'font-arabic'} text-slate-900 dark:text-slate-100`}
              style={{ fontSize: `${settings.arabicFontSize}px` }}
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </span>
          </div>
        </div>

        {/* Section 4: Ukuran Teks Terjemahan Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#2c2217]">
              Ukuran Huruf Terjemahan:
            </label>
            <span className="text-xs font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">
              {settings.translationFontSize} px
            </span>
          </div>
          <input
            type="range"
            min={13}
            max={22}
            step={1}
            value={settings.translationFontSize}
            onChange={(e) => onUpdateSettings({ translationFontSize: Number(e.target.value) })}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <p
            className="text-slate-600 dark:text-slate-300 leading-relaxed"
            style={{ fontSize: `${settings.translationFontSize}px` }}
          >
            "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang."
          </p>
        </div>

        {/* Section 5: Toggles */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center justify-between gap-3 py-1 cursor-pointer">
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">Warna Tajwid Interaktif</span>
              <span className="text-slate-500 dark:text-slate-400">Tampilkan hukum tajwid berwarna pada naskah ayat</span>
            </div>
            <input
              type="checkbox"
              checked={settings.showTajwid}
              onChange={(e) => onUpdateSettings({ showTajwid: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
            />
          </label>

          <label className="flex items-center justify-between gap-3 py-1 cursor-pointer">
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">Tampilkan Tulisan Latin</span>
              <span className="text-slate-500 dark:text-slate-400">Transliterasi memudahkan pembaca pemula</span>
            </div>
            <input
              type="checkbox"
              checked={settings.showLatin}
              onChange={(e) => onUpdateSettings({ showLatin: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
            />
          </label>

          <label className="flex items-center justify-between gap-3 py-1 cursor-pointer">
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">Tampilkan Terjemahan Kemenag RI</span>
              <span className="text-slate-500 dark:text-slate-400">Arti bahasa Indonesia setiap ayat</span>
            </div>
            <input
              type="checkbox"
              checked={settings.showTranslation}
              onChange={(e) => onUpdateSettings({ showTranslation: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
            />
          </label>

          <label className="flex items-center justify-between gap-3 py-1 cursor-pointer">
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">Auto-scroll Audio</span>
              <span className="text-slate-500 dark:text-slate-400">Gulir otomatis ke ayat yang sedang dilantunkan murottal</span>
            </div>
            <input
              type="checkbox"
              checked={settings.autoScrollAudio}
              onChange={(e) => onUpdateSettings({ autoScrollAudio: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
            />
          </label>

          <label className="flex items-center justify-between gap-3 py-1 cursor-pointer">
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">Layar Tetap Menyala Saat Tilawah</span>
              <span className="text-slate-500 dark:text-slate-400">Cegah layar HP, Tablet Android & iPad meredup saat membaca atau memutar audio</span>
            </div>
            <input
              type="checkbox"
              checked={settings.keepScreenAwake !== false}
              onChange={(e) => onUpdateSettings({ keepScreenAwake: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
            />
          </label>
        </div>

        {/* Section 6: Segarkan Cache Pembaruan */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs min-w-0">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block">
              Segarkan Cache Pembaruan
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Muat ulang versi terbaru aplikasi tanpa menghapus markah atau riwayat bacaan
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              void forceRefreshAppCache();
            }}
            className="min-h-10 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Perbarui</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full min-h-11 py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Selesai & Terapkan
          </button>
        </div>

      </div>
    </div>
  );
};
