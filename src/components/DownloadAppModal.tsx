import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  Smartphone,
  Tablet,
  Check,
  X,
  AppWindow
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useMobileDeviceTarget } from '../hooks/useMobileDeviceTarget';
import {
  INSTALLER_FORMATS,
  InstallerFormatId,
  MobileDeviceTargetId,
  getPrimaryFormatForMobileDevice,
  getInstallerFormatSpec,
  triggerDeviceInstallerDownload
} from '../utils/deviceInstaller';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getMobileIcon(deviceId: MobileDeviceTargetId) {
  return deviceId === 'android-tablet' || deviceId === 'ios-ipad' ? Tablet : Smartphone;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const detectedMobile = useMobileDeviceTarget();

  const recommendedFormatId = useMemo<InstallerFormatId>(
    () => getPrimaryFormatForMobileDevice(detectedMobile || 'android-phone'),
    [detectedMobile]
  );

  const [selectedFormatId, setSelectedFormatId] = useState<InstallerFormatId>(recommendedFormatId);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedFileName, setDownloadedFileName] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedFormatId(recommendedFormatId);
      setDownloadedFileName(null);
    }
  }, [isOpen, recommendedFormatId]);

  if (!isOpen || !detectedMobile) return null;

  const activeSpec = getInstallerFormatSpec(selectedFormatId);
  const ActiveIcon = getMobileIcon(activeSpec.deviceId);
  const isCurrentDeviceSelected = activeSpec.deviceId === detectedMobile;

  const handleDownloadSelected = async () => {
    setIsDownloading(true);
    try {
      const payload = await triggerDeviceInstallerDownload(selectedFormatId);
      setDownloadedFileName(payload.spec.fileName);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNativeInstall = async () => {
    const accepted = await install();
    if (accepted) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl p-5 sm:p-7 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-7 rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 [body.theme-sepia_&]:bg-[#fbf5e8] border border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] shadow-2xl space-y-5 max-h-[90dvh] overflow-y-auto overscroll-contain">
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-1 mb-1" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 [body.theme-sepia_&]:border-[#e5dac6]">
          <div className="space-y-1">
            <h2
              id="download-modal-title"
              className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]"
            >
              Unduh Aplikasi Mobile &amp; Tablet
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
              Format <span className="font-mono">.apk</span> untuk HP &amp; Tablet Android, serta format <span className="font-mono">.ipa</span> untuk iPhone &amp; iPad
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Jendela Unduhan"
            className="min-w-11 min-h-11 sm:min-w-0 sm:min-h-0 p-1.5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected / Auto-Detected Mobile or Tablet Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 [body.theme-sepia_&]:bg-[#f3ead7] border border-emerald-200/80 dark:border-emerald-900/60 [body.theme-sepia_&]:border-[#dec9a5] space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ActiveIcon className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 [body.theme-sepia_&]:text-amber-900">
                <span>
                  {isCurrentDeviceSelected
                    ? 'Terdeteksi Otomatis di Perangkat Ini'
                    : 'Perangkat Mobile Terpilih'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{activeSpec.fileName}</span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                {activeSpec.deviceLabel} — {activeSpec.formatTitle}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 [body.theme-sepia_&]:text-[#4d3c2a] leading-relaxed">
                {activeSpec.summary}
              </p>
            </div>
          </div>

          {/* Primary APK / IPA Download Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              disabled={isDownloading}
              onClick={() => void handleDownloadSelected()}
              className="flex-1 min-h-12 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs disabled:opacity-60"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>
                {isDownloading
                  ? `Menyiapkan File ${activeSpec.fileExtension}...`
                  : `Unduh ${activeSpec.deviceLabel} (${activeSpec.fileExtension})`}
              </span>
            </button>

            {isCurrentDeviceSelected && isInstallable && !isInstalled && (
              <button
                type="button"
                onClick={() => void handleNativeInstall()}
                className="min-h-12 px-4 py-3 rounded-xl border border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
              >
                <AppWindow className="w-4 h-4 shrink-0" />
                <span>Pasang Instan</span>
              </button>
            )}
          </div>

          {/* Download Success Feedback */}
          {downloadedFileName && (
            <div
              role="status"
              className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                File <strong className="font-mono">{downloadedFileName}</strong> berhasil diunduh. Ikuti langkah pemasangan di bawah ini.
              </span>
            </div>
          )}

          {/* Mobile/Tablet Installation Steps */}
          <div className="pt-3 border-t border-slate-200/70 dark:border-slate-700/60 [body.theme-sepia_&]:border-[#dec9a5] space-y-2">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
              Cara Memasang di {activeSpec.deviceLabel}:
            </div>
            <ol className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 [body.theme-sepia_&]:text-[#4d3c2a] list-decimal list-inside leading-relaxed">
              {activeSpec.installSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* 4 Mobile & Tablet Formats Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#2c2217]">
              Pilih Perangkat Mobile / Tablet:
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Android (.apk) · iOS &amp; iPadOS (.ipa)
            </span>
          </div>

          <div
            role="radiogroup"
            aria-label="Daftar Format File Mobile dan Tablet"
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {INSTALLER_FORMATS.map((fmt) => {
              const Icon = getMobileIcon(fmt.deviceId);
              const isSelected = fmt.formatId === selectedFormatId;
              const isAutoRecommended = fmt.formatId === recommendedFormatId;

              return (
                <button
                  key={fmt.formatId}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => {
                    setSelectedFormatId(fmt.formatId);
                    setDownloadedFileName(null);
                  }}
                  className={`min-h-12 p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/40 [body.theme-sepia_&]:bg-[#ebdcc0]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 [body.theme-sepia_&]:bg-[#f6eee0] hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isSelected
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] truncate">
                        {fmt.deviceLabel}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] truncate">
                        Format <span className="font-mono">{fmt.fileExtension}</span>
                        {isAutoRecommended ? ' · Perangkat Anda' : ''}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-700 text-transparent'
                    }`}
                    aria-hidden="true"
                  >
                    <Check className="w-3 h-3" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
