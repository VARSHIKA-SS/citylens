import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

export const initMobile = async () => {
  if (Capacitor.isNativePlatform()) {
    // Set status bar style
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#6366f1' });
    console.log('Mobile environment initialized');
  }
};

export const triggerHaptic = async () => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Medium });
  }
};

export const getDeviceInfo = async () => {
  return await Device.getInfo();
};

export const isNative = () => Capacitor.isNativePlatform();
