import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Award,
  Bell,
  CreditCard,
  Globe,
  Bookmark,
  Settings as SettingsIcon,
  Shield,
} from 'lucide-react-native';
import type { ComponentType } from 'react';

import { LocaleChevron } from '@/components/LocaleChevron';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { useLocaleStore } from '@/stores/useLocaleStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useT } from '@/hooks/useT';
import { LOCALES } from '@/lib/i18n';
import {
  listRowLeadingStyle,
  listRowStyle,
  listRowTrailingStyle,
  mergeScrollContentRtl,
  rtlRootDirection,
  rtlRowMerge,
  rtlTextStyle,
} from '@/lib/rtlStyle';
import {
  cancelDailyReminder,
  configureNotifications,
  ensureNotificationPermission,
  scheduleDailyReminder,
} from '@/lib/notifications';

interface SettingItemProps {
  rtl: boolean;
  Icon: ComponentType<{ size?: number; color?: string }>;
  label: string;
  value?: string;
  onPress?: () => void;
}

function SettingItem({ rtl, Icon, label, value, onPress }: SettingItemProps) {
  const ta = rtlTextStyle(rtl);
  return (
    <Pressable
      onPress={onPress}
      style={[listRowStyle(), { borderRadius: 8 }]}
      className="active:bg-gray-100"
    >
      <View style={listRowLeadingStyle()}>
        <Icon size={20} color={colors.gray[600]} />
        <Text
          style={[ta, { flex: 1, fontSize: 16, color: colors.gray[800] }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      <View style={listRowTrailingStyle()}>
        {value ? (
          <Text
            style={[ta, { fontSize: 14, color: colors.gray[500], maxWidth: 120 }]}
            numberOfLines={1}
          >
            {value}
          </Text>
        ) : null}
        <LocaleChevron rtl={rtl} color={colors.gray[500]} />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const currentLocale = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const dailyReminderId = useSettingsStore((s) => s.dailyReminderId);
  const setDailyReminderId = useSettingsStore((s) => s.setDailyReminderId);

  const handleLanguagePick = () => {
    Alert.alert(
      t('profile.chooseLanguage'),
      undefined,
      LOCALES.map((opt) => ({
        text: opt.nativeLabel,
        onPress: () => {
          if (opt.code === locale) return;
          setLocale(opt.code);
        },
      }))
    );
  };

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader title={t('profile.settingsPrefs')} showBack showBell={false} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 100, gap: 12 })}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View
            className="mb-2"
            style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}
          >
            <SettingsIcon size={18} color={colors.primary[700]} />
            <Text style={ta} className="text-gray-900 font-semibold">
              {t('profile.settingsPrefs')}
            </Text>
          </View>
          <View className="gap-1">
            <SettingItem
              rtl={rtl}
              Icon={Globe}
              label={t('profile.language')}
              value={currentLocale.nativeLabel}
              onPress={handleLanguagePick}
            />
            <View
              className="p-3 rounded-lg bg-white"
              style={rtlRowMerge(rtl, {
                alignItems: 'center',
                justifyContent: 'space-between',
              })}
            >
              <View
                className="gap-3"
                style={rtlRowMerge(rtl, { alignItems: 'center' })}
              >
                <Bell size={20} color={colors.gray[600]} />
                <View>
                  <Text style={ta} className="text-gray-800 text-base">
                    {t('profile.notifications')}
                  </Text>
                  <Text style={ta} className="text-xs text-gray-500">
                    Daily reminder at 8:00 PM
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={async (enabled) => {
                  if (enabled) {
                    try {
                      await configureNotifications();
                      const ok = await ensureNotificationPermission();
                      if (!ok) {
                        Alert.alert(
                          t('profile.notifications'),
                          'Please allow notifications in iOS Settings.'
                        );
                        setNotificationsEnabled(false);
                        return;
                      }

                      await cancelDailyReminder(dailyReminderId);
                      const id = await scheduleDailyReminder(20, 0);
                      setDailyReminderId(id);
                      setNotificationsEnabled(true);
                    } catch (e) {
                      const msg =
                        e instanceof Error ? e.message : 'Failed to enable notifications.';
                      Alert.alert(t('profile.notifications'), msg);
                      setDailyReminderId(null);
                      setNotificationsEnabled(false);
                    }
                  } else {
                    try {
                      await cancelDailyReminder(dailyReminderId);
                    } finally {
                      setDailyReminderId(null);
                      setNotificationsEnabled(false);
                    }
                  }
                }}
              />
            </View>
            <SettingItem
              rtl={rtl}
              Icon={CreditCard}
              label={t('profile.paymentSettings')}
              onPress={() => router.push('/coming-soon?title=Payment settings' as never)}
            />
            <SettingItem
              rtl={rtl}
              Icon={Award}
              label={t('profile.viewAllBadges')}
              onPress={() => router.push('/badges' as never)}
            />
            <SettingItem
              rtl={rtl}
              Icon={Shield}
              label={t('profile.rewardRedemption')}
              onPress={() => router.push('/redemptions' as never)}
            />
            <SettingItem
              rtl={rtl}
              Icon={Bookmark}
              label="Saved FinTok"
              onPress={() => router.push('/fintok-saved' as never)}
            />
          </View>
        </Card>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
