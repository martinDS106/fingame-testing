import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { useT } from '@/hooks/useT';

type Achievement = {
  id: number;
  title: string;
  icon: string;
  earned: boolean;
};

// Keep in sync with Profile achievements for now.
const achievements: Achievement[] = [
  { id: 1, title: 'First Course', icon: '🎓', earned: true },
  { id: 2, title: 'Quiz Master', icon: '🏆', earned: true },
  { id: 3, title: 'Trading Pro', icon: '📈', earned: true },
  { id: 4, title: 'Streak King', icon: '🔥', earned: false },
  { id: 5, title: 'Top 10', icon: '⭐', earned: false },
  { id: 6, title: 'Perfect Score', icon: '💯', earned: false },
];

export default function BadgesScreen() {
  const { t } = useT();

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title={t('profile.viewAllBadges')} showBack showBell={false} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View className="flex-row items-center gap-2 mb-2">
            <Award size={18} color={colors.primary[700]} />
            <Text className="text-gray-900 font-semibold">
              {t('profile.viewAllBadges')}
            </Text>
          </View>
          <Text className="text-sm text-gray-700">
            Earn badges by completing courses, quizzes, and simulations.
          </Text>
        </Card>

        <View className="flex-row flex-wrap gap-3">
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
                  <Text className="text-xs text-primary-900 text-center font-medium">
                    {achievement.title}
                  </Text>
                </LinearGradient>
              ) : (
                <View className="p-4 rounded-2xl bg-white border border-gray-200 items-center">
                  <Text className="text-3xl mb-1 opacity-40">{achievement.icon}</Text>
                  <Text className="text-xs text-gray-700 text-center opacity-70">
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

