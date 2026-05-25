import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { useProfileGamification } from '@/hooks/useProfileGamification';
import { useT } from '@/hooks/useT';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';

export default function BadgesScreen() {
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const { achievements } = useProfileGamification();

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader title={t('profile.viewAllBadges')} showBack showBell={false} />

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
            <Award size={18} color={colors.primary[700]} />
            <Text style={ta} className="text-gray-900 font-semibold">
              {t('profile.viewAllBadges')}
            </Text>
          </View>
          <Text style={ta} className="text-sm text-gray-700">
            Earn badges by completing courses, quizzes, and simulations.
          </Text>
        </Card>

        <View
          style={rtlRowMerge(rtl, {
            flexWrap: 'wrap',
            gap: 12,
          })}
        >
          {achievements.map((achievement) => (
            <View key={achievement.id} style={{ width: '48%' }}>
              {achievement.earned ? (
                <LinearGradient
                  colors={[colors.accent[400], colors.accent[500]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.12,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text className="text-3xl mb-1">{achievement.icon}</Text>
                  <Text
                    className="text-xs text-primary-900 font-medium"
                    style={{
                      textAlign: 'center',
                      writingDirection: rtl ? 'rtl' : 'ltr',
                    }}
                  >
                    {achievement.title}
                  </Text>
                </LinearGradient>
              ) : (
                <View className="p-4 rounded-2xl bg-white border border-gray-200 items-center">
                  <Text className="text-3xl mb-1 opacity-40">{achievement.icon}</Text>
                  <Text
                    className="text-xs text-gray-700 opacity-70"
                    style={{
                      textAlign: 'center',
                      writingDirection: rtl ? 'rtl' : 'ltr',
                    }}
                  >
                    {achievement.title}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
