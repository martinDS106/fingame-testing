import { useEffect, useLayoutEffect } from 'react';
import {
  DeviceEventEmitter,
  I18nManager,
  Platform,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { ReferralOnboardingModal } from '@/components/ReferralOnboardingModal';
import { performDailyCheckIn } from '@/hooks/useDailyCheckIn';
import { waitForPersistHydration } from '@/lib/waitForStoreHydration';
import { paperTheme } from '@/theme';
import { useAuthStore, useContentStore, useInvestmentStore, useLocaleStore, useUserStore } from '@/stores';
import { isRTL } from '@/lib/i18n';
import { rtlRootDirection } from '@/lib/rtlStyle';
import { API_SESSION_EXPIRED_EVENT } from '@/lib/api';
import '../global.css';

export default function RootLayout() {
  const router = useRouter();
  const initAuth = useAuthStore((s) => s.init);
  const signOut = useAuthStore((s) => s.signOut);
  const syncContent = useContentStore((s) => s.syncFromCloud);
  const relocalize = useContentStore((s) => s.relocalizeFromCache);
  const locale = useLocaleStore((s) => s.locale);
  const rtl = isRTL(locale);

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
      await waitForPersistHydration(useUserStore);
      await initAuth();
      await performDailyCheckIn();
      void (async () => {
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
    })();
  }, [initAuth, syncContent]);

  // Native RTL must match locale so iOS/Android mirror flex + screens (Expo Go often
  // ignores `direction: 'rtl'` alone). `lib/rtlStyle.ts` `rtlRow` uses plain `row`
  // when `I18nManager.isRTL` is true to avoid double-reversing rows.
  useLayoutEffect(() => {
    if (Platform.OS === 'web') return;
    try {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(isRTL(locale));
      if (typeof I18nManager.swapLeftAndRightInRTL === 'function') {
        I18nManager.swapLeftAndRightInRTL(false);
      }
    } catch (err) {
      console.warn('[i18n] RTL sync failed', err);
    }
  }, [locale]);

  useEffect(() => {
    // Rebuild localized titles/descriptions from cached raw content.
    relocalize();
  }, [locale, relocalize]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', locale);
    document.body?.setAttribute('dir', rtl ? 'rtl' : 'ltr');
  }, [locale, rtl]);

  return (
    <GestureHandlerRootView style={[{ flex: 1 }, rtlRootDirection(rtl)]}>
      <PaperProvider theme={paperTheme}>
        <StatusBar style="light" backgroundColor="#2563eb" />
        <View style={[{ flex: 1 }, rtlRootDirection(rtl)]} key={locale}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation:
                Platform.OS === 'web'
                  ? 'fade'
                  : rtl
                    ? 'slide_from_left'
                    : 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen
              name="(auth)"
              options={{ animation: 'fade' }}
            />
          </Stack>
        </View>
        <ReferralOnboardingModal />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
