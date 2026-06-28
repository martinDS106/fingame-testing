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
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserRound,
} from 'lucide-react-native';
import { Link, router } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { colors } from '@/theme';
import { useAuthStore, useUserStore, waitForAuthReady } from '@/stores';
import { isApiConfigured } from '@/lib/api';
import {
  mergeScrollContentRtl,
  rtlMirrorStyle,
  rtlRootDirection,
  rtlRowMerge,
  rtlTextStyle,
} from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { notifySuccess } from '@/lib/celebration';

export default function SignupScreen() {
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = useAuthStore((s) => s.signUpWithEmail);
  const authStatus = useAuthStore((s) => s.status);
  const updateProfile = useUserStore((s) => s.updateProfile);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.pwMinChars', { n: 6 }));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (authStatus === 'loading') {
        await waitForAuthReady();
      }
      const result = await signUp(email.trim(), password, name.trim());
      if (!result.ok) {
        setError(result.error ?? t('auth.signUpFailed'));
        return;
      }

      updateProfile({ name: name.trim(), email: email.trim() });

      if (result.needsVerification) {
        notifySuccess(t('auth.almostThere'), t('auth.verifyEmailBody', { email }));
        router.replace('/(auth)/login');
      } else {
        router.replace('/dashboard');
      }
    } finally {
      setLoading(false);
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
            <View className="mb-6">
              <Text className="text-4xl text-white font-bold mb-2" style={ta}>
                {t('auth.createAccountTitle')}
              </Text>
              <Text className="text-base text-primary-100" style={ta}>
                {t('auth.createAccountSubtitle')}
              </Text>
            </View>

            {!isApiConfigured && (
              <View className="bg-yellow-100 border border-yellow-300 rounded-xl p-3 mb-4">
                <Text className="text-yellow-900 text-sm" style={ta}>
                  {t('auth.supabaseNotConfiguredTitle')}{' '}
                  {t('auth.supabaseNotConfiguredSignup')}
                </Text>
              </View>
            )}

            <View className="bg-white rounded-2xl p-5 gap-4">
              <View>
                <Text className="text-sm text-gray-700 font-medium mb-2" style={ta}>
                  {t('auth.name')}
                </Text>
                <View
                  className="items-center border border-gray-200 rounded-xl px-3"
                  style={rtlRowMerge(rtl, { alignItems: 'center' })}
                >
                  <UserRound size={18} color={colors.gray[500]} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder={t('auth.namePlaceholder')}
                    placeholderTextColor={colors.gray[400]}
                    autoCapitalize="words"
                    autoComplete="name"
                    className="flex-1 px-3 py-3 text-base text-gray-900"
                    style={ta}
                  />
                </View>
              </View>

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
                    placeholder={t('auth.pwPlaceholderMin', { n: 6 })}
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
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? t('auth.creatingAccount') : t('auth.signUp')}
              </Button>
            </View>

            <View
              style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 24 })}
            >
              <Text className="text-primary-100" style={ta}>
                {t('auth.alreadyHaveAccount')}
              </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable hitSlop={8}>
                  <Text className="text-accent-300 font-semibold" style={ta}>
                    {t('auth.signIn')}
                  </Text>
                </Pressable>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
