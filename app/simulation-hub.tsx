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
import { useLearningProgress } from '@/hooks/useLearningProgress';
import type { SimulationModuleId } from '@/lib/learningProgress';
import { useUserStore, xpProgressToNextLevel } from '@/stores';
import { useT } from '@/hooks/useT';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';

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
    path: '/simulation/savings-goal',
  },
  {
    id: 'credit',
    titleKey: 'simHub.sim.credit.title',
    descriptionKey: 'simHub.sim.credit.desc',
    Icon: CreditCard,
    difficulty: 'Advanced',
    difficultyKey: 'difficulty.advanced',
    gradient: ['#f97316', '#dc2626'],
    unlocked: true,
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
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const { simulationByModule } = useLearningProgress();

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title={t('simHub.title')}
        showBack
        showBell={false}
        rightSlot={
          <View
            className="items-center gap-1.5 bg-accent-400 px-3 py-1 rounded-full"
            style={rtlRowMerge(rtl, { alignItems: 'center', gap: 6 })}
          >
            <Star
              size={14}
              color={colors.primary[900]}
              fill={colors.primary[900]}
            />
            <Text className="text-primary-900 text-sm font-semibold" style={ta}>
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
          <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 })}>
            <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}>
              <Trophy size={18} color={colors.accent[300]} />
              <Text className="text-white text-sm font-medium" style={ta}>
                {t('simHub.level', { n: userLevel })}
              </Text>
            </View>
            <Text className="text-white/80 text-sm" style={ta}>
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
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 32, gap: 16 })}
        showsVerticalScrollIndicator={false}
      >
        <Card className="bg-primary-50 border-primary-100">
          <Text className="text-gray-800 font-semibold mb-2" style={ta}>
            {t('simHub.chooseTitle')}
          </Text>
          <Text className="text-sm text-gray-600" style={ta}>
            {t('simHub.chooseBody')}
          </Text>
        </Card>

        <View className="gap-3">
          {simulations.map((sim) => {
            const { Icon } = sim;
            const live = simulationByModule[sim.id as SimulationModuleId];
            const progress = live?.progress ?? 0;
            const points = live?.points ?? 0;
            return (
              <PressableCard
                key={sim.id}
                disabled={!sim.unlocked}
                onPress={() =>
                  sim.unlocked && router.push(sim.path as never)
                }
                className={sim.unlocked ? '' : 'opacity-60'}
              >
                <View style={rtlRowMerge(rtl, { gap: 16 })}>
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
                    <View
                      style={rtlRowMerge(rtl, {
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                        gap: 8,
                      })}
                    >
                      <Text
                        className="text-gray-800 font-semibold flex-1"
                        numberOfLines={1}
                        style={ta}
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
                      style={ta}
                    >
                      {t(sim.descriptionKey)}
                    </Text>

                    {sim.unlocked ? (
                      <>
                        <View style={rtlRowMerge(rtl, { justifyContent: 'space-between', marginBottom: 4 })}>
                          <Text className="text-xs text-gray-600" style={ta}>
                            {t('simHub.progress')}
                          </Text>
                          <Text className="text-xs text-gray-600 font-medium" style={ta}>
                            {progress}%
                          </Text>
                        </View>
                        <ProgressBar
                          value={progress}
                          height={6}
                          gradient={sim.gradient}
                          className="mb-2"
                        />
                        <View
                          style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between' })}
                        >
                          <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 4 })}>
                            <Star
                              size={14}
                              color={colors.accent[500]}
                              fill={colors.accent[500]}
                            />
                            <Text className="text-sm text-gray-600" style={ta}>
                              {t('simHub.pointsEarned', { n: points })}
                            </Text>
                          </View>
                          <Button
                            variant="primary"
                            size="sm"
                            onPress={() => router.push(sim.path as never)}
                          >
                            {t('simHub.continue')}
                          </Button>
                        </View>
                      </>
                    ) : (
                      <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}>
                        <Lock size={14} color={colors.gray[500]} />
                        <Text className="text-sm text-gray-500" style={ta}>
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
          <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 12 })}>
            <Trophy size={48} color={colors.white} />
            <View className="flex-1">
              <Text className="text-white font-semibold mb-1" style={ta}>
                {t('simHub.masterAllTitle')}
              </Text>
              <Text className="text-sm text-white/80" style={ta}>
                {t('simHub.masterAllBody')}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}
