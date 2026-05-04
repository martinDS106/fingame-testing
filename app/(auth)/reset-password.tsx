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
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { colors } from '@/theme';
import { apiPostJson } from '@/lib/api';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const initialEmail = (params.email ?? '').toString();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!email.trim() || code.trim().length !== 6 || !newPassword) {
      setError('Please enter your email, 6-digit code, and a new password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiPostJson<
        { ok: true },
        { email: string; code: string; newPassword: string }
      >(
        '/auth/reset-password',
        { email: email.trim(), code: code.trim(), newPassword },
        { timeoutMs: 12000 },
      );
      setDone(true);
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
              <Text className="text-3xl text-white font-bold mb-2">Set new password</Text>
              <Text className="text-base text-primary-100">
                Paste the reset token, then choose a new password.
              </Text>
            </View>

            <View className="bg-white rounded-2xl p-5 gap-4">
              <View>
                <Text className="text-sm text-gray-700 font-medium mb-2">Email</Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-3">
                  <KeyRound size={18} color={colors.gray[500]} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.gray[400]}
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="flex-1 px-3 py-3 text-base text-gray-900"
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm text-gray-700 font-medium mb-2">
                  6-digit code
                </Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-3">
                  <KeyRound size={18} color={colors.gray[500]} />
                  <TextInput
                    value={code}
                    onChangeText={(v) => setCode(v.replace(/\\D+/g, '').slice(0, 6))}
                    placeholder="Enter code"
                    placeholderTextColor={colors.gray[400]}
                    keyboardType="number-pad"
                    className="flex-1 px-3 py-3 text-base text-gray-900"
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm text-gray-700 font-medium mb-2">
                  New password
                </Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-3">
                  <Lock size={18} color={colors.gray[500]} />
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={colors.gray[400]}
                    secureTextEntry={!showPw}
                    className="flex-1 px-3 py-3 text-base text-gray-900"
                  />
                  <Pressable onPress={() => setShowPw((s) => !s)} hitSlop={8} className="py-2 pl-2">
                    {showPw ? <EyeOff size={18} color={colors.gray[500]} /> : <Eye size={18} color={colors.gray[500]} />}
                  </Pressable>
                </View>
              </View>

              {error && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <Text className="text-sm text-red-700">{error}</Text>
                </View>
              )}

              {done && (
                <View className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <Text className="text-sm text-green-800">
                    Password updated. You can log in now.
                  </Text>
                </View>
              )}

              <Button variant="primary" fullWidth onPress={submit} disabled={loading}>
                {loading ? 'Saving…' : 'Save new password'}
              </Button>

              <Button
                variant="outline"
                fullWidth
                onPress={() => router.replace('/(auth)/login')}
                disabled={loading}
              >
                Back to login
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

