import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Info,
  Star,
  ThumbsUp,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { BottomNav } from '@/components/BottomNav';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { formatNumber } from '@/lib/format';
import { useMarketplaceStore, useUserStore } from '@/stores';

function ApprovalMeter({ value }: { value: number }) {
  const size = 128;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.min(100, Math.max(0, value)) / 100) * circumference;
  const color =
    value >= 70 ? '#22c55e' : value >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </Svg>
      <View className="absolute inset-0 items-center justify-center">
        <Text className="text-3xl text-gray-800 font-bold">{value}%</Text>
        <Text className="text-xs text-gray-600">Approval</Text>
      </View>
    </View>
  );
}

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const coins = useUserStore((s) => s.coins);
  const addCoins = useUserStore((s) => s.addCoins);

  const products = useMarketplaceStore((s) => s.products);
  const allReviews = useMarketplaceStore((s) => s.reviews);
  const addReview = useMarketplaceStore((s) => s.addReview);
  const markHelpful = useMarketplaceStore((s) => s.markReviewHelpful);
  const submitApplication = useMarketplaceStore((s) => s.submitApplication);

  const product = useMemo(
    () => products.find((p) => p.id === id),
    [products, id]
  );
  const reviews = useMemo(
    () => (id ? allReviews.filter((r) => r.productId === id) : []),
    [allReviews, id]
  );

  const [age, setAge] = useState('25');
  const [income, setIncome] = useState('8000');
  const [creditScore, setCreditScore] = useState('720');
  const [eligibilityResult, setEligibilityResult] = useState<{
    odds: number;
    ageOk: boolean;
    incomeOk: boolean;
    scoreOk: boolean;
  } | null>(null);

  const [reviewInput, setReviewInput] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  const calculateEligibility = () => {
    if (!product) return;
    const a = Number(age) || 0;
    const inc = Number(income) || 0;
    const cs = Number(creditScore) || 0;
    const ageOk = a >= (product.minAge ?? 21) && a <= 65;
    const incomeOk = inc >= product.minIncome;
    const scoreOk = cs >= (product.minCreditScore ?? 650);
    let odds = 0;
    if (ageOk) odds += 25;
    if (incomeOk) odds += 35;
    if (scoreOk) odds += 40;
    setEligibilityResult({ odds: Math.min(95, odds), ageOk, incomeOk, scoreOk });
  };

  const handleApply = () => {
    if (!product) return;
    void (async () => {
      const appId = submitApplication(product.id);
      const ok = await addCoins(100, 'manual');
      if (!ok) {
        Alert.alert(
          'Could not save reward',
          'Your application was created locally, but the coin reward did not sync.',
        );
        return;
      }
      router.push(`/marketplace/application-tracking?id=${appId}`);
    })();
  };

  const handleSubmitReview = () => {
    if (!product || reviewInput.trim().length < 5) {
      Alert.alert('Review too short', 'Please write at least 5 characters.');
      return;
    }
    void (async () => {
      const ok = await addCoins(25, 'manual');
      if (!ok) {
        Alert.alert(
          'Could not save reward',
          'Please sign in again and retry submitting your review.',
        );
        return;
      }
      addReview(product.id, reviewRating, reviewInput.trim());
      setReviewInput('');
      setReviewRating(5);
      Alert.alert('Thank you!', 'You earned +25 coins for your review.');
    })();
  };

  const avgRating = product?.rating ?? 0;

  if (!product) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader
          title="Product Details"
          coins={coins}
          showBack
          gradient={['#a855f7', '#9333ea']}
        />
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-lg text-gray-800 mb-2">Product not found</Text>
          <Button onPress={() => router.back()}>Go Back</Button>
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Product Details"
        coins={coins}
        showBack
        gradient={['#a855f7', '#9333ea']}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View className="flex-row items-start gap-4 mb-3">
            <View className="w-16 h-16 bg-purple-50 rounded-xl items-center justify-center">
              <Text className="text-4xl">{product.logo}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg text-gray-800 font-bold">
                {product.name}
              </Text>
              <Text className="text-sm text-gray-600 mb-2">
                {product.bank}
              </Text>
              <View className="flex-row items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    color={i < Math.floor(avgRating) ? '#eab308' : '#d1d5db'}
                    fill={i < Math.floor(avgRating) ? '#eab308' : 'transparent'}
                  />
                ))}
                <Text className="text-xs text-gray-700 ml-1">
                  {avgRating} · {product.reviewsCount} reviews
                </Text>
              </View>
            </View>
          </View>
          {product.isBestValue && (
            <View className="self-start">
              <Badge variant="success" leftIcon={<Award size={12} color="#15803d" />}>
                Best Value
              </Badge>
            </View>
          )}
        </Card>

        <Card>
          <Text className="text-gray-800 font-semibold mb-3">Overview</Text>
          <View className="flex-row gap-2">
            <View className="flex-1 p-3 bg-blue-50 rounded-lg items-center">
              <Text className="text-xs text-gray-600">APR</Text>
              <Text className="text-lg text-blue-600 font-bold">
                {product.apr}%
              </Text>
            </View>
            <View className="flex-1 p-3 bg-purple-50 rounded-lg items-center">
              <Text className="text-xs text-gray-600">Annual Fee</Text>
              <Text className="text-lg text-purple-600 font-bold">
                {product.annualFee === 0
                  ? 'Free'
                  : `EGP ${formatNumber(product.annualFee)}`}
              </Text>
            </View>
            <View className="flex-1 p-3 bg-green-50 rounded-lg items-center">
              <Text className="text-xs text-gray-600">Cashback</Text>
              <Text className="text-lg text-green-600 font-bold">
                {product.cashback}%
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text className="text-gray-800 font-semibold mb-3">Pros & Cons</Text>
          <View className="gap-2">
            {product.pros.map((pro) => (
              <View key={pro} className="flex-row items-start gap-2">
                <CheckCircle2 size={16} color="#22c55e" />
                <Text className="text-sm text-gray-700 flex-1">{pro}</Text>
              </View>
            ))}
            {product.cons.map((con) => (
              <View key={con} className="flex-row items-start gap-2">
                <AlertTriangle size={16} color="#f97316" />
                <Text className="text-sm text-gray-700 flex-1">{con}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <View className="flex-row items-center gap-2 mb-3">
            <Info size={18} color={colors.primary[600]} />
            <Text className="text-gray-800 font-semibold">
              Approval Odds Calculator
            </Text>
          </View>

          {!eligibilityResult ? (
            <View className="gap-3">
              <View>
                <Text className="text-xs text-gray-600 mb-1">Age</Text>
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  className="bg-gray-50 rounded-lg px-3 py-2.5 text-gray-800"
                />
              </View>
              <View>
                <Text className="text-xs text-gray-600 mb-1">
                  Monthly Income (EGP)
                </Text>
                <TextInput
                  value={income}
                  onChangeText={setIncome}
                  keyboardType="number-pad"
                  className="bg-gray-50 rounded-lg px-3 py-2.5 text-gray-800"
                />
              </View>
              <View>
                <Text className="text-xs text-gray-600 mb-1">
                  Credit Score (300–850)
                </Text>
                <TextInput
                  value={creditScore}
                  onChangeText={setCreditScore}
                  keyboardType="number-pad"
                  className="bg-gray-50 rounded-lg px-3 py-2.5 text-gray-800"
                />
              </View>
              <Button fullWidth onPress={calculateEligibility}>
                Check Eligibility
              </Button>
            </View>
          ) : (
            <View className="gap-3">
              <View className="items-center py-2">
                <ApprovalMeter value={eligibilityResult.odds} />
                <Text
                  className={`mt-3 text-sm font-semibold ${
                    eligibilityResult.odds >= 70
                      ? 'text-green-600'
                      : eligibilityResult.odds >= 40
                        ? 'text-orange-600'
                        : 'text-red-600'
                  }`}
                >
                  {eligibilityResult.odds >= 70
                    ? 'Excellent chances!'
                    : eligibilityResult.odds >= 40
                      ? 'Moderate chances'
                      : 'Improve your profile'}
                </Text>
              </View>

              {[
                { label: 'Age requirement', ok: eligibilityResult.ageOk },
                { label: 'Income requirement', ok: eligibilityResult.incomeOk },
                { label: 'Credit score', ok: eligibilityResult.scoreOk },
              ].map((req) => (
                <View
                  key={req.label}
                  className={`flex-row items-center justify-between p-2 rounded ${
                    req.ok ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <Text className="text-sm text-gray-700">{req.label}</Text>
                  {req.ok ? (
                    <CheckCircle2 size={18} color="#22c55e" />
                  ) : (
                    <AlertTriangle size={18} color="#ef4444" />
                  )}
                </View>
              ))}

              <Button
                variant="outline"
                fullWidth
                onPress={() => setEligibilityResult(null)}
              >
                Check Again
              </Button>
            </View>
          )}
        </Card>

        <Card>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-800 font-semibold">User Reviews</Text>
            <Badge variant="accent">+25 coins</Badge>
          </View>

          <View className="gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
            <Text className="text-xs text-gray-600">Your rating</Text>
            <View className="flex-row gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => setReviewRating(n)}>
                  <Star
                    size={24}
                    color={n <= reviewRating ? '#eab308' : '#d1d5db'}
                    fill={n <= reviewRating ? '#eab308' : 'transparent'}
                  />
                </Pressable>
              ))}
            </View>
            <TextInput
              value={reviewInput}
              onChangeText={setReviewInput}
              placeholder="Share your experience…"
              placeholderTextColor={colors.gray[400]}
              multiline
              numberOfLines={2}
              className="bg-white rounded-lg px-3 py-2.5 text-gray-800 border border-gray-200 min-h-[60px]"
            />
            <Button size="sm" onPress={handleSubmitReview}>
              Submit Review
            </Button>
          </View>

          <View className="gap-3">
            {reviews.length === 0 ? (
              <Text className="text-sm text-gray-500 text-center py-4">
                No reviews yet — be the first!
              </Text>
            ) : (
              reviews.map((r) => (
                <View key={r.id} className="p-3 bg-gray-50 rounded-lg">
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                      <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
                        <Text className="text-sm">{r.avatar}</Text>
                      </View>
                      <View>
                        <Text className="text-sm text-gray-800 font-medium">
                          {r.user}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {relativeTime(r.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          color={i < r.rating ? '#eab308' : '#d1d5db'}
                          fill={i < r.rating ? '#eab308' : 'transparent'}
                        />
                      ))}
                    </View>
                  </View>
                  <Text className="text-sm text-gray-700 mb-2">
                    {r.comment}
                  </Text>
                  <Pressable
                    onPress={() => markHelpful(r.id)}
                    className="flex-row items-center gap-1"
                    hitSlop={6}
                  >
                    <ThumbsUp size={12} color={colors.gray[500]} />
                    <Text className="text-xs text-gray-500">
                      Helpful ({r.helpful})
                    </Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </Card>

        <Button size="lg" fullWidth onPress={handleApply}>
          Apply Now · +100 coins
        </Button>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
