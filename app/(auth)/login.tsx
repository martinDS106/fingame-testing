import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { Link, router } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { colors } from '@/theme';
import { useAuthStore } from '@/stores';
import { isApiConfigured } from '@/lib/api';
import {
  mergeScrollContentRtl,
  rtlMirrorStyle,
  rtlRootDirection,
  rtlRowMerge,
  rtlTextStyle,
} from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';

export default function LoginScreen() {
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useAuthStore((s) => s.signInWithEmail);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError(t('auth.enterEmailAndPassword'));
      return;
    }
    setLoading(true);
    setError(null);
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.ok) {
      router.replace('/dashboard');
    } else {
      setError(result.error ?? t('auth.loginFailed'));
    }
  };

  return (
    <LinearGradient
      colors={[colors.primary[500], colors.primary[700]]}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1" style={rtlRootDirection(rtl)}>
        <KeyboardAvoidingView
          style={[{ flex: 1 }, rtlRootDirection(rtl)]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="p-4 active:opacity-60"
          >
            <ArrowLeft size={24} color={colors.white} style={rtlMirrorStyle(rtl)} />
          </Pressable>

          <ScrollView
            contentContainerStyle={mergeScrollContentRtl(rtl, { flexGrow: 1, padding: 24 })}
            keyboardShouldPersistTaps="handled"
          >
            <View className="mb-8">
              <Text className="text-4xl text-white font-bold mb-2" style={ta}>
                {t('auth.welcomeBack')} 👋
              </Text>
              <Text className="text-base text-primary-100" style={ta}>
                {t('auth.signInSubtitle')}
              </Text>
            </View>

            {!isApiConfigured && (
              <View className="bg-yellow-100 border border-yellow-300 rounded-xl p-3 mb-4">
                <Text className="text-yellow-900 text-sm" style={ta}>
                  {t('auth.supabaseNotConfiguredTitle')}{' '}
                  {t('auth.supabaseNotConfiguredLogin')}
                </Text>
              </View>
            )}

            <View className="bg-white rounded-2xl p-5 gap-4">
              <View>
                <Text className="text-sm text-gray-700 font-medium mb-2" style={ta}>
                  {t('auth.email')}
                </Text>
                <View
                  className="items-center border border-gray-200 rounded-xl px-3"
                  style={rtlRowMerge(rtl, { alignItems: 'center' })}
                >
                  <Mail size={18} color={colors.gray[500]} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('auth.emailPlaceholder')}
                    placeholderTextColor={colors.gray[400]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    className="flex-1 px-3 py-3 text-base text-gray-900"
                    style={ta}
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm text-gray-700 font-medium mb-2" style={ta}>
                  {t('auth.password')}
                </Text>
                <View
                  className="items-center border border-gray-200 rounded-xl px-3"
                  style={rtlRowMerge(rtl, { alignItems: 'center' })}
                >
                  <Lock size={18} color={colors.gray[500]} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('auth.pwPlaceholderDots')}
                    placeholderTextColor={colors.gray[400]}
                    secureTextEntry={!showPw}
                    autoCapitalize="none"
                    className="flex-1 px-3 py-3 text-base text-gray-900"
                    style={ta}
                  />
                  <Pressable
                    onPress={() => setShowPw((v) => !v)}
                    hitSlop={8}
                    className="p-1"
                  >
                    {showPw ? (
                      <EyeOff size={18} color={colors.gray[500]} />
                    ) : (
                      <Eye size={18} color={colors.gray[500]} />
                    )}
                  </Pressable>
                </View>
              </View>

              {error && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <Text className="text-sm text-red-700" style={ta}>
                    {error}
                  </Text>
                </View>
              )}

              <Button
                variant="primary"
                fullWidth
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? t('auth.signingIn') : t('auth.signIn')}
              </Button>

              <Pressable
                onPress={() => router.push('/(auth)/forgot-password')}
                className="items-center"
                hitSlop={8}
              >
                <Text className="text-primary-700 font-semibold" style={ta}>
                  Forgot password?
                </Text>
              </Pressable>
            </View>

            <View
              style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 24 })}
            >
              <Text className="text-primary-100" style={ta}>
                {t('auth.newHere')}
              </Text>
              <Link href="/(auth)/signup" asChild>
                <Pressable hitSlop={8}>
                  <Text className="text-accent-300 font-semibold" style={ta}>
                    {t('auth.createAccount')}
                  </Text>
                </Pressable>
              </Link>
            </View>

            <Pressable
              onPress={() => router.replace('/dashboard')}
              className="mt-6 items-center"
              hitSlop={8}
            >
              <Text className="text-white/80 text-sm" style={ta}>
                {t('auth.continueGuestArrow')}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
