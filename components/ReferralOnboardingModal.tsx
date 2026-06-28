import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { useT } from '@/hooks/useT';
import { showAppNotify } from '@/lib/appNotify';
import { rtlTextStyle } from '@/lib/rtlStyle';
import { useAuthStore, useUserStore } from '@/stores';

export function ReferralOnboardingModal() {
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const authStatus = useAuthStore((s) => s.status);
  const remoteUserId = useUserStore((s) => s.remoteUserId);
  const pending = useUserStore((s) => s.profile.referralOnboardingPending);
  const applyFriendReferral = useUserStore((s) => s.applyFriendReferral);
  const skipReferralOnboarding = useUserStore((s) => s.skipReferralOnboarding);

  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const visible =
    authStatus === 'authenticated' && !!remoteUserId && pending === true;

  const onSkip = async () => {
    setBusy(true);
    const res = await skipReferralOnboarding();
    setBusy(false);
    if (!res.ok) {
      Alert.alert(t('referral.errorTitle'), res.error ?? '');
    }
  };

  const onApply = async () => {
    const normalized = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (normalized.length !== 5) {
      Alert.alert(t('referral.errorTitle'), t('referral.invalidCode'));
      return;
    }
    setBusy(true);
    const res = await applyFriendReferral(normalized);
    setBusy(false);
    if (!res.ok) {
      Alert.alert(t('referral.errorTitle'), res.error ?? '');
      return;
    }
    if (res.coins && res.coins > 0) {
      showAppNotify({
        variant: 'success',
        title: t('referral.successTitle'),
        message: t('referral.successBody', { coins: res.coins }),
      });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => void onSkip()}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 20,
            gap: 14,
          }}
        >
          <Text style={[ta, { fontSize: 20, fontWeight: '700', color: '#111827' }]}>
            {t('referral.title')}
          </Text>
          <Text style={[ta, { fontSize: 15, color: '#4b5563', lineHeight: 22 }]}>
            {t('referral.subtitle')}
          </Text>
          <TextInput
            value={code}
            onChangeText={(raw) =>
              setCode(raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5))
            }
            placeholder={t('referral.placeholder')}
            autoCapitalize="characters"
            maxLength={5}
            editable={!busy}
            style={{
              borderWidth: 1.5,
              borderColor: '#bfdbfe',
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 22,
              letterSpacing: 6,
              textAlign: 'center',
              color: '#1d4ed8',
              backgroundColor: '#eff6ff',
            }}
          />
          {busy ? <ActivityIndicator color="#2563eb" /> : null}
          <Button fullWidth onPress={() => void onApply()} disabled={busy || code.length < 5}>
            {t('referral.apply')}
          </Button>
          <Pressable onPress={() => void onSkip()} disabled={busy} style={{ alignItems: 'center' }}>
            <Text style={[ta, { fontSize: 15, color: '#6b7280' }]}>{t('referral.skip')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
