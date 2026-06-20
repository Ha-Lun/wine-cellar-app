import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lundstromslogiska.winecellar',
  appName: 'Wine Cellar',
  webDir: 'dist',
  server: {
    linuxAndroidStudioPath: '/opt/android-studio/bin/studio.sh',
  },
};

export default config;
