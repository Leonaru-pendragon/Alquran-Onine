import { useEffect, useRef } from 'react';

interface WakeLockSentinelLike {
  released: boolean;
  release: () => Promise<void>;
}

/**
 * Keeps Android & iOS (16.4+) screens awake while actively reading the Mushaf
 * or listening to Murottal audio, automatically releasing when hidden or unmounted.
 */
export function useScreenWakeLock(enabled: boolean): void {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined') return;
    const nav = navigator as unknown as {
      wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
    };
    if (!nav.wakeLock?.request) return;

    let cancelled = false;

    const acquireLock = async () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      try {
        sentinelRef.current = await nav.wakeLock!.request('screen');
      } catch {
        // WakeLock may be disallowed in low-power mode or backgrounded frames
      }
    };

    void acquireLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && (!sentinelRef.current || sentinelRef.current.released)) {
        void acquireLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (sentinelRef.current && !sentinelRef.current.released) {
        sentinelRef.current.release().catch(() => {});
      }
      sentinelRef.current = null;
    };
  }, [enabled]);
}
