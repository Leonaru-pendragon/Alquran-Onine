import { useEffect, useState, useCallback } from 'react';
import { detectMobilePlatform, detectStandaloneMode } from '../utils/mobilePlatform';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIPadOS, setIsIPadOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const navStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;
    setIsInstalled(detectStandaloneMode(standaloneQuery.matches, navStandalone));

    const shortSide = Math.min(window.screen?.width || 0, window.screen?.height || 0);
    const platformInfo = detectMobilePlatform(
      window.navigator.userAgent || '',
      window.navigator.maxTouchPoints || 0,
      window.navigator.platform || '',
      shortSide
    );
    setIsIOS(platformInfo.isIOS);
    setIsIPadOS(platformInfo.isIPadOS);
    setIsAndroid(platformInfo.isAndroid);
    setIsTablet(platformInfo.isTablet);

    const handleDisplayModeChange = (ev: MediaQueryListEvent) => {
      if (ev.matches) setIsInstalled(true);
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    standaloneQuery.addEventListener?.('change', handleDisplayModeChange);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      standaloneQuery.removeEventListener?.('change', handleDisplayModeChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    isIPadOS,
    isAndroid,
    isTablet,
    install
  };
}
