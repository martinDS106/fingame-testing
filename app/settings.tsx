import { Alert, I18nManager, Pressable, ScrollView, Switch, Text, View } from 'react-native';
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

import { ScreenHeader } from '@/components/ScreenHeader';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { useLocaleStore } from '@/stores/useLocaleStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useT } from '@/hooks/useT';
import { isRTL, LOCALES } from '@/lib/i18n';
import {
  cancelDailyReminder,
  configureNotifications,
  ensureNotificationPermission,
  scheduleDailyReminder,
} from '@/lib/notifications';

interface SettingItemProps {
  Icon: ComponentType<{ size?: number; color?: string }>;
  label: string;
  value?: string;
  onPress?: () => void;
}

function SettingItem({ Icon, label, value, onPress }: SettingItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between p-3 rounded-lg active:bg-gray-100"
    >
      <View className="flex-row items-center gap-3">
        <Icon size={20} color={colors.gray[600]} />
        <Text className="text-gray-800 text-base">{label}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        {value && <Text className="text-sm text-gray-500">{value}</Text>}
        <Text className="text-gray-400 text-lg">{'›'}</Text>
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { t } = useT();
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
          const targetRTL = isRTL(opt.code);
          if (I18nManager.isRTL !== targetRTL) {
            Alert.alert(t('profile.languageChanged'), t('profile.restartNeeded'));
          }
        },
      }))
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title={t('profile.settingsPrefs')} showBack showBell={false} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View className="flex-row items-center gap-2 mb-2">
            <SettingsIcon size={18} color={colors.primary[700]} />
            <Text className="text-gray-900 font-semibold">
              {t('profile.settingsPrefs')}
            </Text>
          </View>
          <View className="gap-1">
            <SettingItem
              Icon={Globe}
              label={t('profile.language')}
              value={currentLocale.nativeLabel}
              onPress={handleLanguagePick}
            />
            <View className="flex-row items-center justify-between p-3 rounded-lg bg-white">
              <View className="flex-row items-center gap-3">
                <Bell size={20} color={colors.gray[600]} />
                <View>
                  <Text className="text-gray-800 text-base">
                    {t('profile.notifications')}
                  </Text>
                  <Text className="text-xs text-gray-500">
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

                      // Replace existing reminder.
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
              Icon={CreditCard}
              label={t('profile.paymentSettings')}
              onPress={() => router.push('/coming-soon?title=Payment settings' as never)}
            />
            <SettingItem
              Icon={Award}
              label={t('profile.viewAllBadges')}
              onPress={() => router.push('/badges' as never)}
            />
            <SettingItem
              Icon={Shield}
              label={t('profile.rewardRedemption')}
              onPress={() => router.push('/redemptions' as never)}
            />
            <SettingItem
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

