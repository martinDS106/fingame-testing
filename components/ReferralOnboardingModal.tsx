import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { useT } from '@/hooks/useT';
import { notifyError, notifySuccess } from '@/lib/celebration';
import { pullProfile } from '@/lib/syncServiceApi';
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
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !remoteUserId) return;
    let cancelled = false;
    setSyncing(true);
    void pullProfile(remoteUserId)
      .then((remote) => {
        if (cancelled || !remote?.referral_onboarding_pending) return;
        useUserStore.setState((state) => ({
          profile: {
            ...state.profile,
            referralOnboardingPending: true,
            referralCode: remote.referral_code ?? state.profile.referralCode,
          },
        }));
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus, remoteUserId]);

  const visible =
    authStatus === 'authenticated' && !!remoteUserId && pending === true;

  const onSkip = async () => {
    setBusy(true);
    const res = await skipReferralOnboarding();
    setBusy(false);
    if (!res.ok) {
      notifyError(t('referral.errorTitle'), res.error ?? '');
    }
  };

  const onApply = async () => {
    const normalized = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (normalized.length !== 5) {
      notifyError(t('referral.errorTitle'), t('referral.invalidCode'));
      return;
    }
    setBusy(true);
    const res = await applyFriendReferral(normalized);
    setBusy(false);
    if (!res.ok) {
      notifyError(t('referral.errorTitle'), res.error ?? '');
      return;
    }
    if (res.coins && res.coins > 0) {
      notifySuccess(
        t('referral.successTitle'),
        t('referral.successBody', { coins: res.coins }),
      );
    }
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => void onSkip()}>
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
            editable={!busy && !syncing}
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
          {busy || syncing ? <ActivityIndicator color="#2563eb" /> : null}
          <Button fullWidth onPress={() => void onApply()} disabled={busy || syncing || code.length < 5}>
            {t('referral.apply')}
          </Button>
          <Pressable onPress={() => void onSkip()} disabled={busy || syncing} style={{ alignItems: 'center' }}>
            <Text style={[ta, { fontSize: 15, color: '#6b7280' }]}>{t('referral.skip')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
