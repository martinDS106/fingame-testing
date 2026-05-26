import { useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Gamepad2, GraduationCap } from 'lucide-react-native';
import { router } from 'expo-router';

import { FadeInView } from '@/components/animated';
import { colors } from '@/theme';
import { useAuthStore } from '@/stores';
import { isApiConfigured } from '@/lib/api';
import { rtlRootDirection, rtlTextStyle } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';

/** Email/password auth: Nest API and/or Supabase (UI shows signup/login if either is available). */
const canUseAccountAuth = isApiConfigured;

export default function WelcomeScreen() {
  const status = useAuthStore((s) => s.status);
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status]);

  // If auth init hangs (slow API / hot reload), unblock the welcome screen.
  useEffect(() => {
    if (status !== 'loading') return;
    const t = setTimeout(() => {
      if (useAuthStore.getState().status === 'loading') {
        useAuthStore.getState().continueAsGuest();
      }
    }, 12000);
    return () => clearTimeout(t);
  }, [status]);

  return (
    <LinearGradient
      colors={[colors.primary[500], colors.primary[600]]}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        className="flex-1 items-center justify-center p-6"
        style={rtlRootDirection(rtl)}
      >
        <FadeInView direction="down" duration={600}>
          <View className="items-center mb-10">
            <View className="relative mb-4">
              <Gamepad2
                size={80}
                color={colors.accent[400]}
                strokeWidth={2}
              />
              <View
                className="absolute -top-2"
                style={rtl ? { left: -8 } : { right: -8 }}
              >
                <GraduationCap
                  size={40}
                  color={colors.accent[300]}
                  strokeWidth={2}
                />
              </View>
            </View>

            <Text className="text-5xl text-white mb-3 font-bold" style={ta}>
              Fin-Game
            </Text>
            <Text
              className={`text-2xl text-accent-300 ${rtl ? '' : 'tracking-wide'}`}
              style={[ta, { letterSpacing: rtl ? 0 : undefined }]}
            >
              {t('welcome.tagline')}
            </Text>
          </View>
        </FadeInView>

        {status === 'loading' ? (
          <ActivityIndicator color={colors.accent[400]} size="large" />
        ) : (
          <FadeInView direction="up" duration={500} delay={250}>
          <View className="w-full max-w-md gap-3">
            <Pressable
              onPress={() => {
                if (canUseAccountAuth) {
                  router.push('/(auth)/signup');
                } else {
                  router.push('/dashboard');
                }
              }}
              className="bg-accent-400 active:bg-accent-500 py-4 rounded-full items-center shadow-xl"
              style={({ pressed }) => [
                {
                  shadowColor: colors.black,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: 8,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <Text className="text-lg text-primary-900 font-semibold" style={ta}>
                {canUseAccountAuth
                  ? t('welcome.getStarted')
                  : t('welcome.startLearning')}
              </Text>
            </Pressable>

            {canUseAccountAuth && (
              <Pressable
                onPress={() => router.push('/(auth)/login')}
                className="bg-white/10 border border-white/30 py-4 px-6 rounded-full active:bg-white/20"
                style={{
                  alignSelf: 'stretch',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  className="text-lg text-white font-semibold text-center"
                  style={{
                    textAlign: 'center',
                    writingDirection: rtl ? 'rtl' : 'ltr',
                  }}
                >
                  {t('welcome.haveAccount')}
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => router.push('/dashboard')}
              className="py-2 items-center"
              hitSlop={8}
            >
              <Text className="text-white/80 text-sm" style={ta}>
                {t('welcome.guestArrow')}
              </Text>
            </Pressable>
          </View>
          </FadeInView>
        )}

        <FadeInView direction="up" duration={500} delay={500}>
          <Text
            className="text-white/80 mt-10 text-center max-w-md text-base px-4"
            style={ta}
          >
            {t('welcome.description')}
          </Text>
        </FadeInView>
      </SafeAreaView>
    </LinearGradient>
  );
}
