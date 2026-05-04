import { useEffect } from 'react';
import { DeviceEventEmitter, I18nManager } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { paperTheme } from '@/theme';
import { useAuthStore, useContentStore, useInvestmentStore, useLocaleStore, useUserStore } from '@/stores';
import { isRTL } from '@/lib/i18n';
import { API_SESSION_EXPIRED_EVENT } from '@/lib/api';
import '../global.css';

export default function RootLayout() {
  const router = useRouter();
  const initAuth = useAuthStore((s) => s.init);
  const signOut = useAuthStore((s) => s.signOut);
  const syncContent = useContentStore((s) => s.syncFromCloud);
  const relocalize = useContentStore((s) => s.relocalizeFromCache);
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(API_SESSION_EXPIRED_EVENT, () => {
      void (async () => {
        await signOut();
        try {
          router.replace('/(auth)/login');
        } catch {
          // ignore navigation errors during early boot
        }
      })();
    });
    return () => sub.remove();
  }, [router, signOut]);

  useEffect(() => {
    void (async () => {
      await initAuth();
      // If user is signed in, hydrate simulator portfolio from backend.
      // This makes investment state survive reinstall / new device.
      try {
        const remoteUserId = useUserStore.getState().remoteUserId;
        if (remoteUserId) {
          await useInvestmentStore.getState().pullRemote();
        }
      } catch (err) {
        console.warn('[sim] pullRemote failed', err);
      }
      await syncContent();
    })();
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
