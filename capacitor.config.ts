import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hannes.winecellar',
  appName: 'wine-cellar',
  webDir: 'dist',
  server: {
    linuxAndroidStudioPath: '/opt/android-studio/bin/studio.sh',
  },
};

export default config;
