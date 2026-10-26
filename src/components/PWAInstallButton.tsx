import React, { useState, useMemo } from 'react';
import {
  Download,
  Smartphone,
  Tablet,
  Check,
  X
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useMobileDeviceTarget } from '../hooks/useMobileDeviceTarget';
import {
  MobileDeviceTargetId,
  getPrimaryFormatForMobileDevice,
  getInstallerFormatSpec,
  triggerDeviceInstallerDownload
} from '../utils/deviceInstaller';

interface PWAInstallButtonProps {
  variant?: 'banner' | 'settings';
  onOpenDownloadModal?: () => void;
}

function getMobileIcon(deviceId: MobileDeviceTargetId) {
  return deviceId === 'android-tablet' || deviceId === 'ios-ipad' ? Tablet : Smartphone;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'settings',
  onOpenDownloadModal
}) => {
  const { isInstalled } = usePWAInstall();
  const mobileDeviceTarget = useMobileDeviceTarget();
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [justDownloaded, setJustDownloaded] = useState(false);

  const primarySpec = useMemo(() => {
    const formatId = getPrimaryFormatForMobileDevice(mobileDeviceTarget || 'android-phone');
    return getInstallerFormatSpec(formatId);
  }, [mobileDeviceTarget]);

  // Exclusively shown to Mobile & Tablet users (Android Phone, Android Tablet, iPhone, iPad)
  if (!mobileDeviceTarget) {
    return null;
  }

  const DeviceIcon = getMobileIcon(mobileDeviceTarget);

  const handleDirectDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await triggerDeviceInstallerDownload(primarySpec.formatId);
      setJustDownloaded(true);
      setTimeout(() => {
        setJustDownloaded(false);
      }, 4000);
    } finally {
      setIsDownloading(false);
    }
  };

  if (variant === 'banner') {
    if (isInstalled || dismissedBanner) {
      return null;
    }

    return (
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 [body.theme-sepia_&]:bg-[#f6eee0] border border-emerald-200/80 dark:border-emerald-900/60 [body.theme-sepia_&]:border-[#dec9a5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <DeviceIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 pr-7 sm:pr-0 relative">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] truncate">
              Unduh Aplikasi untuk {primarySpec.deviceLabel}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] truncate">
              Format <span className="font-mono">{primarySpec.fileExtension}</span> otomatis sesuai perangkat · {primarySpec.fileName}
            </p>
            <button
              type="button"
              onClick={() => setDismissedBanner(true)}
              aria-label="Sembunyikan kartu unduh aplikasi"
              className="sm:hidden absolute -top-1.5 -right-1.5 min-w-11 min-h-11 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isDownloading}
            onClick={() => void handleDirectDownload()}
            className="flex-1 sm:flex-initial min-h-11 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
          >
            {justDownloaded ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Terunduh ({primarySpec.fileExtension})</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isDownloading
                    ? 'Menyiapkan...'
                    : `Unduh (${primarySpec.fileExtension})`}
                </span>
              </>
            )}
          </button>

          {onOpenDownloadModal && (
            <button
              type="button"
              onClick={onOpenDownloadModal}
              className="min-h-11 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 [body.theme-sepia_&]:border-[#dec9a5] text-slate-700 dark:text-slate-200 [body.theme-sepia_&]:text-[#2c2217] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Pilih Perangkat
            </button>
          )}

          <button
            type="button"
            onClick={() => setDismissedBanner(true)}
            aria-label="Sembunyikan saran unduh aplikasi"
            className="hidden sm:flex min-w-11 min-h-11 items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 [body.theme-sepia_&]:bg-[#ebdcc0]/50 border border-slate-200/80 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
          Unduh Aplikasi {primarySpec.deviceLabel} ({primarySpec.fileExtension})
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] mt-0.5">
          Paket <span className="font-mono">{primarySpec.fileName}</span> · Khusus Android, Tablet, iPhone &amp; iPad
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          disabled={isDownloading}
          onClick={() => void handleDirectDownload()}
          className="flex-1 sm:flex-initial min-h-11 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors disabled:opacity-60"
        >
          {justDownloaded ? (
            <>
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Terunduh</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isDownloading ? 'Menyiapkan...' : `Unduh (${primarySpec.fileExtension})`}
              </span>
            </>
          )}
        </button>

        {onOpenDownloadModal && (
          <button
            type="button"
            onClick={onOpenDownloadModal}
            className="min-h-11 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 [body.theme-sepia_&]:border-[#dec9a5] text-slate-700 dark:text-slate-200 [body.theme-sepia_&]:text-[#2c2217] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors"
          >
            Opsi Lain
          </button>
        )}
      </div>
    </div>
  );
};
