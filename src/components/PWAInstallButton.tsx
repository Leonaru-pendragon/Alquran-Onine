import React, { useState } from 'react';
import { Download, Share, PlusSquare, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'banner' | 'settings';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'settings' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  if (isInstalled) {
    return null;
  }

  // Banner variant only appears when browser offers install prompt (Android/Chromium) or on iOS/iPadOS Safari
  if (variant === 'banner') {
    if (dismissedBanner || (!isInstallable && !isIOS)) {
      return null;
    }

    return (
      <>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 [body.theme-sepia_&]:bg-[#f6eee0] border border-emerald-200/80 dark:border-emerald-900/60 [body.theme-sepia_&]:border-[#dec9a5] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] truncate">
                Pasang Aplikasi Al-Qur'an di Layar Utama
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] truncate">
                Akses cepat layar penuh dan tetap dapat dibaca tanpa sinyal internet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (isInstallable) {
                  void install();
                } else {
                  setShowIOSGuide(true);
                }
              }}
              className="min-h-11 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Pasang
            </button>
            <button
              type="button"
              onClick={() => setDismissedBanner(true)}
              aria-label="Sembunyikan saran pemasangan aplikasi"
              className="min-w-11 min-h-11 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showIOSGuide && <IOSInstallSheet onClose={() => setShowIOSGuide(false)} />}
      </>
    );
  }

  // Settings variant: always offers one-tap install if supported, or clear Android/iOS/Tablet instructions
  return (
    <>
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 [body.theme-sepia_&]:bg-[#ebdcc0]/50 border border-slate-200/80 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
            Aplikasi HP, Tablet & iPad (Layar Penuh)
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] mt-0.5">
            {isInstallable
              ? 'Siap dipasang langsung ke layar utama ponsel atau tablet Anda'
              : isIOS
              ? 'Tambahkan ke Layar Utama Safari di iPhone atau iPad (mendukung Portrait & Landscape)'
              : 'Buka melalui Chrome (HP/Tablet Android) atau Safari (iPhone/iPad) untuk memasang aplikasi'}
          </p>
        </div>

        {(isInstallable || isIOS) ? (
          <button
            type="button"
            onClick={() => {
              if (isInstallable) {
                void install();
              } else {
                setShowIOSGuide(true);
              }
            }}
            className="min-h-11 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isIOS && !isInstallable ? 'Cara Pasang' : 'Pasang Aplikasi'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className="min-h-11 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium shrink-0 cursor-pointer whitespace-nowrap transition-colors"
          >
            Panduan Pasang
          </button>
        )}
      </div>

      {showIOSGuide && <IOSInstallSheet onClose={() => setShowIOSGuide(false)} />}
    </>
  );
};

const IOSInstallSheet: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="ios-install-title"
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
  >
    <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 [body.theme-sepia_&]:bg-[#fbf5e8] border border-slate-200 dark:border-slate-800 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 shadow-2xl space-y-4">
      <div className="sm:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-2" />
      <div className="flex items-center justify-between">
        <h3 id="ios-install-title" className="text-base font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
          Pasang di HP, Tablet Android & iPad
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup panduan pemasangan"
          className="min-w-11 min-h-11 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#382c1e]">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 [body.theme-sepia_&]:bg-[#ebdcc0]/60 space-y-2">
          <div className="font-semibold text-slate-900 dark:text-slate-100">Safari di iPhone & iPad (iPadOS):</div>
          <ol className="space-y-2 list-decimal list-inside">
            <li className="flex items-center gap-2">
              <Share className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Ketuk ikon <strong>Bagikan (Share)</strong> di bilah atas (iPad) atau bawah (iPhone) Safari.</span>
            </li>
            <li className="flex items-center gap-2">
              <PlusSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong> lalu ketuk <strong>Tambah</strong>.</span>
            </li>
          </ol>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 [body.theme-sepia_&]:bg-[#ebdcc0]/60 space-y-1.5">
          <div className="font-semibold text-slate-900 dark:text-slate-100">Chrome di HP & Tablet Android:</div>
          <p>
            Ketuk menu titik tiga di pojok kanan atas Chrome, lalu pilih <strong>Instal aplikasi</strong> atau <strong>Tambahkan ke layar utama</strong>. Mendukung rotasi layar tegak maupun mendatar.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full min-h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold cursor-pointer transition-colors"
      >
        Mengerti
      </button>
    </div>
  </div>
);
