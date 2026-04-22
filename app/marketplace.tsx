import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import {
  Coins,
  Gift,
  ShoppingBag,
  Star,
  Ticket,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { router } from 'expo-router';

import { BottomNav } from '@/components/BottomNav';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { formatNumber } from '@/lib/format';
import { useUserStore } from '@/stores';
import { useT } from '@/hooks/useT';
import { createRedemption } from '@/lib/syncService';

interface Reward {
  id: number;
  title: string;
  category: RewardCategory;
  points: number;
  image: string;
  description: string;
  available: boolean;
}

type RewardCategory =
  | 'Gift Cards'
  | 'Discounts'
  | 'Exclusive Offers';

type CategoryFilter = 'All' | RewardCategory;

const rewards: Reward[] = [
  {
    id: 1,
    title: 'Carrefour Gift Card',
    category: 'Gift Cards',
    points: 500,
    image: '🛒',
    description: 'EGP 100 Carrefour voucher',
    available: true,
  },
  {
    id: 2,
    title: 'Amazon Voucher',
    category: 'Gift Cards',
    points: 1000,
    image: '📦',
    description: 'EGP 200 Amazon credit',
    available: true,
  },
  {
    id: 3,
    title: 'Course Discount',
    category: 'Discounts',
    points: 200,
    image: '🎓',
    description: '20% off premium courses',
    available: true,
  },
  {
    id: 4,
    title: 'Coffee Voucher',
    category: 'Discounts',
    points: 150,
    image: '☕',
    description: 'Free coffee at selected cafes',
    available: true,
  },
  {
    id: 5,
    title: 'Investment Book',
    category: 'Exclusive Offers',
    points: 800,
    image: '📚',
    description: 'Best-selling finance book',
    available: true,
  },
  {
    id: 6,
    title: 'Premium Access',
    category: 'Exclusive Offers',
    points: 2000,
    image: '⭐',
    description: '1 month premium features',
    available: false,
  },
];

interface Category {
  id: CategoryFilter;
  label: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
}

const categories: Category[] = [
  { id: 'All', label: 'All', Icon: ShoppingBag },
  { id: 'Gift Cards', label: 'Gift Cards', Icon: Gift },
  { id: 'Discounts', label: 'Discounts', Icon: Ticket },
  { id: 'Exclusive Offers', label: 'Exclusive', Icon: Star },
];

export default function MarketplaceScreen() {
  const [selected, setSelected] = useState<CategoryFilter>('All');
  const [redeemedIds, setRedeemedIds] = useState<number[]>([]);
  const userPoints = useUserStore((s) => s.coins);
  const spendCoins = useUserStore((s) => s.spendCoins);
  const remoteUserId = useUserStore((s) => s.remoteUserId);
  const { t } = useT();

  const visibleRewards =
    selected === 'All'
      ? rewards
      : rewards.filter((r) => r.category === selected);

  const handleRedeem = (reward: Reward) => {
    Alert.alert(
      t('rewards.redeemTitle', { title: reward.title }),
      t('rewards.redeemCost', { points: reward.points }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('rewards.redeem'),
          onPress: async () => {
            const ok = spendCoins(reward.points);
            if (!ok) {
              Alert.alert(t('rewards.oops'), t('rewards.notEnoughCoins'));
              return;
            }

            // Best effort: if user is logged in, record redemption in Supabase.
            if (remoteUserId) {
              const res = await createRedemption(remoteUserId, {
                rewardId: String(reward.id),
                rewardTitle: reward.title,
                cost: reward.points,
              });
              if (!res.ok) {
                Alert.alert(
                  t('rewards.oops'),
                  res.error ?? 'Failed to record redemption.'
                );
              }
            }

            setRedeemedIds((prev) => [...prev, reward.id]);
            Alert.alert(t('rewards.success'), t('rewards.redeemedMsg', { title: reward.title }), [
              {
                text: 'View',
                onPress: () => router.push('/redemptions' as never),
              },
              { text: 'OK', style: 'cancel' },
            ]);
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title={t('rewards.title')} showBell={false} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-4">
          <View
            className="bg-accent-400 rounded-2xl p-4 flex-row items-center justify-between"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center gap-3 flex-1">
              <Coins size={32} color={colors.primary[900]} />
              <View>
                <Text className="text-sm text-primary-900/80">
                  {t('rewards.yourBalance')}
                </Text>
                <Text className="text-2xl text-primary-900 font-bold">
                  {t('rewards.pointsLabel', {
                    points: formatNumber(userPoints),
                  })}
                </Text>
              </View>
            </View>
            <Button variant="secondary" size="sm">
              {t('rewards.earnMore')}
            </Button>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            gap: 8,
          }}
        >
          {categories.map((cat) => {
            const active = selected === cat.id;
            const label =
              cat.id === 'All'
                ? t('rewards.all')
                : cat.id === 'Gift Cards'
                  ? t('rewards.giftCards')
                  : cat.id === 'Discounts'
                    ? t('rewards.discounts')
                    : t('rewards.exclusive');
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelected(cat.id)}
                className={`flex-row items-center gap-2 px-4 py-2 rounded-full border ${
                  active
                    ? 'bg-primary-600 border-primary-600'
                    : 'bg-white border-gray-200 active:bg-gray-50'
                }`}
              >
                <cat.Icon
                  size={16}
                  color={active ? colors.white : colors.gray[600]}
                />
                <Text
                  className={`text-sm font-medium ${
                    active ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="px-4 gap-3">
          {visibleRewards.map((reward) => {
            const canAfford = userPoints >= reward.points;
            const alreadyRedeemed = redeemedIds.includes(reward.id);
            const disabled =
              !reward.available || !canAfford || alreadyRedeemed;

            return (
              <Card key={reward.id} className={disabled ? 'opacity-70' : ''}>
                <View className="flex-row gap-4">
                  <View
                    className="w-20 h-20 rounded-xl items-center justify-center"
                    style={{
                      backgroundColor: colors.primary[50],
                    }}
                  >
                    <Text className="text-4xl">{reward.image}</Text>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-1">
                      <Text
                        className="text-gray-800 font-semibold flex-1 pr-2"
                        numberOfLines={1}
                      >
                        {reward.title}
                      </Text>
                      {!reward.available && (
                        <Badge variant="neutral">{t('rewards.outOfStock')}</Badge>
                      )}
                    </View>

                    <Text
                      className="text-sm text-gray-600 mb-2"
                      numberOfLines={2}
                    >
                      {reward.description}
                    </Text>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-1">
                        <Coins size={14} color={colors.accent[500]} />
                        <Text
                          className={`text-sm font-semibold ${
                            canAfford ? 'text-primary-600' : 'text-red-600'
                          }`}
                        >
                          {t('rewards.pts', { points: formatNumber(reward.points) })}
                        </Text>
                      </View>

                      <Button
                        size="sm"
                        variant={disabled ? 'secondary' : 'primary'}
                        disabled={disabled}
                        onPress={() => handleRedeem(reward)}
                      >
                        {alreadyRedeemed
                          ? t('rewards.redeemed')
                          : !reward.available
                            ? t('rewards.unavailable')
                            : !canAfford
                              ? t('rewards.notEnough')
                              : t('rewards.redeem')}
                      </Button>
                    </View>
                  </View>
                </View>
              </Card>
            );
          })}

          <Card className="bg-purple-50 border-purple-100 mt-2">
            <View className="flex-row items-center gap-3">
              <Text className="text-3xl">💡</Text>
              <View className="flex-1">
                <Text className="text-gray-800 font-semibold mb-1">
                  {t('rewards.earnMorePoints')}
                </Text>
                <Text className="text-sm text-gray-600">
                  {t('rewards.earnMoreBody')}
                </Text>
              </View>
            </View>
            <View className="mt-3">
              <Button
                variant="outline"
                fullWidth
                onPress={() => router.push('/marketplace-home' as never)}
              >
                Earn more
              </Button>
            </View>
          </Card>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
