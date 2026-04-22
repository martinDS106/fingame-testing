import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Briefcase,
  CreditCard,
  DollarSign,
  Lock,
  PiggyBank,
  ShieldQuestion,
  Star,
  TrendingUp,
  Trophy,
  Wallet,
} from 'lucide-react-native';
import { router } from 'expo-router';
import type { ComponentType } from 'react';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/theme';
import { formatNumber } from '@/lib/format';
import { useUserStore, xpProgressToNextLevel } from '@/stores';
import { useT } from '@/hooks/useT';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface Simulation {
  id: string;
  titleKey: string;
  descriptionKey: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
  difficulty: Difficulty;
  difficultyKey: string;
  gradient: [string, string];
  unlocked: boolean;
  progress: number;
  points: number;
  path: string;
}

const simulations: Simulation[] = [
  {
    id: 'banking',
    titleKey: 'simHub.sim.banking.title',
    descriptionKey: 'simHub.sim.banking.desc',
    Icon: Wallet,
    difficulty: 'Beginner',
    difficultyKey: 'difficulty.beginner',
    gradient: [colors.primary[500], colors.primary[600]],
    unlocked: true,
    progress: 75,
    points: 450,
    path: '/simulation/banking',
  },
  {
    id: 'investment',
    titleKey: 'simHub.sim.investment.title',
    descriptionKey: 'simHub.sim.investment.desc',
    Icon: TrendingUp,
    difficulty: 'Intermediate',
    difficultyKey: 'difficulty.intermediate',
    gradient: ['#22c55e', '#16a34a'],
    unlocked: true,
    progress: 40,
    points: 280,
    path: '/simulation/investment',
  },
  {
    id: 'gold',
    titleKey: 'simHub.sim.gold.title',
    descriptionKey: 'simHub.sim.gold.desc',
    Icon: DollarSign,
    difficulty: 'Intermediate',
    difficultyKey: 'difficulty.intermediate',
    gradient: [colors.accent[400], colors.accent[600]],
    unlocked: true,
    progress: 30,
    points: 180,
    path: '/simulation/gold',
  },
  {
    id: 'business',
    titleKey: 'simHub.sim.business.title',
    descriptionKey: 'simHub.sim.business.desc',
    Icon: Briefcase,
    difficulty: 'Advanced',
    difficultyKey: 'difficulty.advanced',
    gradient: ['#a855f7', '#9333ea'],
    unlocked: true,
    progress: 15,
    points: 320,
    path: '/simulation/business',
  },
  {
    id: 'challenges',
    titleKey: 'simHub.sim.challenges.title',
    descriptionKey: 'simHub.sim.challenges.desc',
    Icon: ShieldQuestion,
    difficulty: 'Intermediate',
    difficultyKey: 'difficulty.intermediate',
    gradient: ['#0ea5e9', '#2563eb'],
    unlocked: true,
    progress: 0,
    points: 120,
    path: '/challenges',
  },
  {
    id: 'finance',
    titleKey: 'simHub.sim.finance.title',
    descriptionKey: 'simHub.sim.finance.desc',
    Icon: PiggyBank,
    difficulty: 'Beginner',
    difficultyKey: 'difficulty.beginner',
    gradient: ['#6366f1', '#4f46e5'],
    unlocked: true,
    progress: 60,
    points: 220,
    path: '/simulation/banking',
  },
  {
    id: 'credit',
    titleKey: 'simHub.sim.credit.title',
    descriptionKey: 'simHub.sim.credit.desc',
    Icon: CreditCard,
    difficulty: 'Advanced',
    difficultyKey: 'difficulty.advanced',
    gradient: ['#f97316', '#dc2626'],
    unlocked: false,
    progress: 0,
    points: 0,
    path: '/simulation/credit',
  },
];

function difficultyBadgeVariant(d: Difficulty): BadgeVariant {
  if (d === 'Beginner') return 'success';
  if (d === 'Intermediate') return 'info';
  return 'danger';
}

export default function SimulationHubScreen() {
  const coins = useUserStore((s) => s.coins);
  const xp = useUserStore((s) => s.xp);
  const userLevel = useUserStore((s) => s.level);
  const xpInfo = xpProgressToNextLevel(xp);
  const xpProgress = xpInfo.pct;
  const { t } = useT();

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title={t('simHub.title')}
        showBack
        showBell={false}
        rightSlot={
          <View className="flex-row items-center gap-1.5 bg-accent-400 px-3 py-1 rounded-full">
            <Star
              size={14}
              color={colors.primary[900]}
              fill={colors.primary[900]}
            />
            <Text className="text-primary-900 text-sm font-semibold">
              {t('rewards.pts', { points: formatNumber(coins) })}
            </Text>
          </View>
        }
      />

      <LinearGradient
        colors={[colors.primary[600], colors.primary[700]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ paddingHorizontal: 16, paddingBottom: 12 }}
      >
        <View
          className="rounded-xl p-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Trophy size={18} color={colors.accent[300]} />
              <Text className="text-white text-sm font-medium">
                {t('simHub.level', { n: userLevel })}
              </Text>
            </View>
            <Text className="text-white/80 text-sm">
              {t('simHub.xpProgress', {
                current: formatNumber(xpInfo.current),
                target: formatNumber(xpInfo.target),
              })}
            </Text>
          </View>
          <ProgressBar
            value={xpProgress}
            height={6}
            trackClassName="bg-white/20"
            color={colors.accent[400]}
          />
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Card className="bg-primary-50 border-primary-100">
          <Text className="text-gray-800 font-semibold mb-2">
            {t('simHub.chooseTitle')}
          </Text>
          <Text className="text-sm text-gray-600">
            {t('simHub.chooseBody')}
          </Text>
        </Card>

        <View className="gap-3">
          {simulations.map((sim) => {
            const { Icon } = sim;
            return (
              <PressableCard
                key={sim.id}
                disabled={!sim.unlocked}
                onPress={() =>
                  sim.unlocked && router.push(sim.path as never)
                }
                className={sim.unlocked ? '' : 'opacity-60'}
              >
                <View className="flex-row gap-4">
                  <LinearGradient
                    colors={sim.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {sim.unlocked ? (
                      <Icon size={30} color={colors.white} />
                    ) : (
                      <Lock size={28} color={colors.white} />
                    )}
                  </LinearGradient>

                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-1 gap-2">
                      <Text
                        className="text-gray-800 font-semibold flex-1"
                        numberOfLines={1}
                      >
                        {t(sim.titleKey)}
                      </Text>
                      <Badge variant={difficultyBadgeVariant(sim.difficulty)}>
                        {t(sim.difficultyKey)}
                      </Badge>
                    </View>

                    <Text
                      className="text-sm text-gray-600 mb-2"
                      numberOfLines={2}
                    >
                      {t(sim.descriptionKey)}
                    </Text>

                    {sim.unlocked ? (
                      <>
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-xs text-gray-600">
                            {t('simHub.progress')}
                          </Text>
                          <Text className="text-xs text-gray-600 font-medium">
                            {sim.progress}%
                          </Text>
                        </View>
                        <ProgressBar
                          value={sim.progress}
                          height={6}
                          gradient={sim.gradient}
                          className="mb-2"
                        />
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-1">
                            <Star
                              size={14}
                              color={colors.accent[500]}
                              fill={colors.accent[500]}
                            />
                            <Text className="text-sm text-gray-600">
                              {t('simHub.pointsEarned', { n: sim.points })}
                            </Text>
                          </View>
                          <Button variant="primary" size="sm">
                            {t('simHub.continue')}
                          </Button>
                        </View>
                      </>
                    ) : (
                      <View className="flex-row items-center gap-2">
                        <Lock size={14} color={colors.gray[500]} />
                        <Text className="text-sm text-gray-500">
                          {t('simHub.unlockHint', {
                            name: t('simHub.sim.finance.title'),
                          })}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </PressableCard>
            );
          })}
        </View>

        <LinearGradient
          colors={['#a855f7', colors.primary[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 16, padding: 16 }}
        >
          <View className="flex-row items-center gap-3">
            <Trophy size={48} color={colors.white} />
            <View className="flex-1">
              <Text className="text-white font-semibold mb-1">
                {t('simHub.masterAllTitle')}
              </Text>
              <Text className="text-sm text-white/80">
                {t('simHub.masterAllBody')}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}
