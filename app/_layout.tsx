import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { paperTheme } from '@/theme';
import { useAuthStore, useContentStore, useLocaleStore } from '@/stores';
import { isRTL } from '@/lib/i18n';
import '../global.css';

export default function RootLayout() {
  const initAuth = useAuthStore((s) => s.init);
  const syncContent = useContentStore((s) => s.syncFromCloud);
  const relocalize = useContentStore((s) => s.relocalizeFromCache);
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    initAuth();
    void syncContent();
  }, [initAuth, syncContent]);

  useEffect(() => {
    const shouldBeRTL = isRTL(locale);
    if (I18nManager.isRTL !== shouldBeRTL) {
      try {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
      } catch (err) {
        console.warn('[i18n] Failed to set RTL flag', err);
      }
    }

    // Rebuild localized titles/descriptions from cached raw content.
    relocalize();
  }, [locale, relocalize]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <StatusBar style="light" backgroundColor="#2563eb" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="(auth)"
            options={{ animation: 'fade' }}
          />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
