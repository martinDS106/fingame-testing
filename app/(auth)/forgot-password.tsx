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
import { ArrowLeft, Mail } from 'lucide-react-native';
import { router } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { colors } from '@/theme';
import { useT } from '@/hooks/useT';
import { apiPostJson } from '@/lib/api';

export default function ForgotPasswordScreen() {
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function send() {
    if (!email.trim()) {
      setError(t('auth.enterEmailAndPassword'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiPostJson<{ ok: true; sent: boolean }, { email: string }>(
        '/auth/forgot-password',
        { email: email.trim() },
        { timeoutMs: 12000 }
      );
      setSent(true);
      setError(null);
      if (res && res.sent === false) {
        setError('Email is not configured on the server yet (dev mode). Ask the developer to check backend logs for the 6-digit code.');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={[colors.primary[500], colors.primary[700]]} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable onPress={() => router.back()} hitSlop={12} className="p-4 active:opacity-60">
            <ArrowLeft size={24} color={colors.white} />
          </Pressable>

          <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }} keyboardShouldPersistTaps="handled">
            <View className="mb-8">
              <Text className="text-3xl text-white font-bold mb-2">Reset password</Text>
              <Text className="text-base text-primary-100">
                Enter your email and we’ll send a 6-digit reset code.
              </Text>
            </View>

            <View className="bg-white rounded-2xl p-5 gap-4">
              <View>
                <Text className="text-sm text-gray-700 font-medium mb-2">{t('auth.email')}</Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-3">
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
                  />
                </View>
              </View>

              {error && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <Text className="text-sm text-red-700">{error}</Text>
                </View>
              )}

              {sent && (
                <View className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <Text className="text-sm text-green-800">
                    If this email exists, a 6-digit reset code has been sent. Check your inbox.
                  </Text>
                  <View className="mt-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() =>
                        router.push({
                          pathname: '/(auth)/reset-password',
                          params: { email: email.trim() },
                        } as never)
                      }
                    >
                      Enter reset code
                    </Button>
                  </View>
                </View>
              )}

              <Button variant="primary" fullWidth onPress={send} disabled={loading}>
                {loading ? 'Sending…' : 'Send reset email'}
              </Button>
            </View>

            <Pressable onPress={() => router.replace('/(auth)/login')} className="mt-6 items-center" hitSlop={8}>
              <Text className="text-white/80 text-sm">Back to login</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

