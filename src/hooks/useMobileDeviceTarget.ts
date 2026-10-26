import { useState, useEffect } from 'react';
import {
  MobileDeviceTargetId,
  detectBrowserMobileDeviceTarget
} from '../utils/deviceInstaller';

/**
 * Reactively detects whether the current user is on a Mobile or Tablet device
 * ('android-phone' | 'android-tablet' | 'ios-iphone' | 'ios-ipad'), or returns
 * null on Desktop PCs/Laptops so download UI is shown exclusively to Mobile & Tablet users.
 */
export function useMobileDeviceTarget(): MobileDeviceTargetId | null {
  const [target, setTarget] = useState<MobileDeviceTargetId | null>(() =>
    detectBrowserMobileDeviceTarget()
  );

  useEffect(() => {
    const update = () => {
      setTarget(detectBrowserMobileDeviceTarget());
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return target;
}
