import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Coffee, Flame, Star } from 'lucide-react-native';
import type { ComponentType } from 'react';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { useUserStore } from '@/stores';

interface Milestone {
  days: number;
  reward: string;
  reached: boolean;
}

const milestones: Milestone[] = [
  { days: 30, reward: '100 Coins', reached: false },
  { days: 50, reward: 'Special Badge', reached: false },
  { days: 100, reward: 'Lightning Streak', reached: false },
];

interface ProtectionOption {
  label: string;
  cost: number;
  Icon: ComponentType<{ size?: number; color?: string }>;
  color: string;
}

const protections: ProtectionOption[] = [
  { label: 'Freeze', cost: 50, Icon: Clock, color: colors.primary[600] },
  { label: 'Vacation', cost: 100, Icon: Coffee, color: '#9333ea' },
  { label: 'Repair', cost: 150, Icon: Star, color: colors.accent[600] },
];

export default function StreakCalendarScreen() {
  const currentStreak = useUserStore((s) => s.streak);
  const longestStreak = useUserStore((s) => s.longestStreak);

  const days = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    completed: i < currentStreak,
    isMilestone: [7, 14, 21, 30].includes(i + 1),
  }));

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Learning Streak"
        showBack
        showBell={false}
        gradient={['#ea580c', '#dc2626']}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#f97316', '#dc2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16, padding: 20 }}
        >
          <View className="flex-row items-center justify-center gap-4 mb-6">
            <View
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Flame size={44} color={colors.white} fill={colors.white} />
            </View>
            <View>
              <Text className="text-sm text-orange-100">Current Streak</Text>
              <Text className="text-5xl text-white font-bold">
                {currentStreak}
              </Text>
              <Text className="text-sm text-orange-100">days</Text>
            </View>
          </View>

          <View className="flex-row gap-4">
            <View
              className="flex-1 rounded-lg p-3 items-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text className="text-sm text-orange-100">Longest</Text>
              <Text className="text-2xl text-white font-bold">
                {longestStreak}
              </Text>
            </View>
            <View
              className="flex-1 rounded-lg p-3 items-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text className="text-sm text-orange-100">This Month</Text>
              <Text className="text-2xl text-white font-bold">
                {currentStreak}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <Card>
          <Text className="text-lg text-gray-800 font-semibold mb-4">
            March 2026
          </Text>
          <View className="flex-row flex-wrap -m-1">
            {weekDays.map((wd) => (
              <View
                key={wd}
                style={{ width: '14.2857%' }}
                className="items-center p-1"
              >
                <Text className="text-xs text-gray-600 py-2">{wd}</Text>
              </View>
            ))}
            {days.map((d) => (
              <View
                key={d.day}
                style={{ width: '14.2857%' }}
                className="p-1"
              >
                <View
                  style={{ aspectRatio: 1 }}
                  className={`rounded-lg items-center justify-center ${
                    d.completed ? '' : 'bg-gray-100'
                  }`}
                >
                  {d.completed ? (
                    <LinearGradient
                      colors={['#fb923c', '#ea580c']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text className="text-sm text-white font-semibold">
                        {d.day}
                      </Text>
                      {d.isMilestone && (
                        <View className="absolute -top-1 -right-1">
                          <Star
                            size={12}
                            color={colors.accent[300]}
                            fill={colors.accent[300]}
                          />
                        </View>
                      )}
                    </LinearGradient>
                  ) : (
                    <Text className="text-sm text-gray-400">{d.day}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text className="text-gray-800 font-semibold mb-3">
            Upcoming Milestones
          </Text>
          <View className="gap-2">
            {milestones.map((m) => (
              <View
                key={m.days}
                className={`flex-row items-center justify-between p-3 rounded-lg ${
                  m.reached ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      m.reached ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <Flame size={18} color={colors.white} fill={colors.white} />
                  </View>
                  <View>
                    <Text className="text-sm text-gray-800 font-medium">
                      {m.days} Days
                    </Text>
                    <Text className="text-xs text-gray-600">{m.reward}</Text>
                  </View>
                </View>
                <Badge variant="neutral">
                  {m.days - currentStreak} to go
                </Badge>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text className="text-gray-800 font-semibold mb-3">
            Streak Protection
          </Text>
          <View className="flex-row gap-2">
            {protections.map(({ label, cost, Icon, color }) => (
              <Pressable
                key={label}
                className="flex-1 items-center p-3 rounded-xl border border-gray-200 active:bg-gray-50"
              >
                <Icon size={22} color={color} />
                <Text className="text-xs text-gray-800 font-medium mt-1">
                  {label}
                </Text>
                <Text className="text-xs text-gray-500">{cost} coins</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card className="bg-primary-50 border-primary-100">
          <Text className="text-gray-800 font-semibold mb-2">
            💡 Streak Tips
          </Text>
          <View className="gap-1">
            <Text className="text-sm text-gray-600">
              • Complete any activity daily to maintain your streak
            </Text>
            <Text className="text-sm text-gray-600">
              • Use freeze to protect your streak when needed
            </Text>
            <Text className="text-sm text-gray-600">
              • Reach milestones to earn special rewards
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
