import { useMemo } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Award,
  CheckCircle,
  Circle,
  Clock,
  Coins,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { BottomNav } from '@/components/BottomNav';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import {
  useMarketplaceStore,
  useUserStore,
  type ApplicationStatus,
} from '@/stores';

const STEP_FLOW: {
  status: ApplicationStatus;
  label: string;
  description: string;
}[] = [
  {
    status: 'submitted',
    label: 'Submitted',
    description: 'Application received',
  },
  {
    status: 'docs_verified',
    label: 'Documents Verified',
    description: 'ID & income docs OK',
  },
  {
    status: 'under_review',
    label: 'Under Review',
    description: 'Our team is reviewing',
  },
  {
    status: 'approved',
    label: 'Decision',
    description: 'Final credit decision',
  },
];

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ApplicationTrackingScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const coins = useUserStore((s) => s.coins);
  const applications = useMarketplaceStore((s) => s.applications);
  const advance = useMarketplaceStore((s) => s.advanceApplication);
  const products = useMarketplaceStore((s) => s.products);

  const application = useMemo(() => {
    if (id) return applications.find((a) => a.id === id);
    return applications[0];
  }, [id, applications]);

  const alternatives = useMemo(() => {
    if (!application) return [];
    return products
      .filter((p) => p.id !== application.productId)
      .slice(0, 2);
  }, [application, products]);

  if (!application) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader
          title="Application Status"
          coins={coins}
          showBack
          gradient={['#a855f7', '#9333ea']}
        />
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-5xl mb-4">📄</Text>
          <Text className="text-lg text-gray-800 font-semibold mb-2">
            No applications yet
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            Apply for a credit card to start tracking its progress here.
          </Text>
          <Button onPress={() => router.replace('/marketplace/credit-cards')}>
            Browse Credit Cards
          </Button>
        </View>
        <BottomNav />
      </View>
    );
  }

  const currentIdx = STEP_FLOW.findIndex((s) => s.status === application.status);
  const isDone =
    application.status === 'approved' || application.status === 'rejected';

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Application Status"
        coins={coins}
        showBack
        gradient={['#a855f7', '#9333ea']}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View className="flex-row items-start gap-3 mb-3">
            <View className="w-12 h-12 bg-purple-50 rounded-lg items-center justify-center">
              <Text className="text-2xl">{application.bankLogo}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold">
                {application.productName}
              </Text>
              <Text className="text-xs text-gray-500">
                Application ID: #{application.id.slice(-8).toUpperCase()}
              </Text>
              <View className="mt-2 self-start">
                <Badge
                  variant={
                    application.status === 'approved'
                      ? 'success'
                      : application.status === 'rejected'
                        ? 'danger'
                        : 'info'
                  }
                  leftIcon={<Clock size={10} color="#1e40af" />}
                >
                  {application.status === 'approved'
                    ? 'Approved'
                    : application.status === 'rejected'
                      ? 'Rejected'
                      : 'In Progress'}
                </Badge>
              </View>
            </View>
          </View>
          <View className="pt-3 border-t border-gray-100">
            <Text className="text-xs text-gray-600">
              Submitted on {formatDate(application.submittedAt)}
            </Text>
            {application.decidedAt ? (
              <Text className="text-xs text-gray-600">
                Decided on {formatDate(application.decidedAt)}
              </Text>
            ) : (
              <Text className="text-xs text-gray-600">
                Expected decision: 3-5 business days
              </Text>
            )}
          </View>
        </Card>

        {application.status === 'approved' && (
          <LinearGradient
            colors={['#16a34a', '#15803d']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 12, padding: 16 }}
          >
            <View className="items-center">
              <Award size={40} color={colors.white} />
              <Text className="text-white text-xl font-bold mt-2">
                Congratulations!
              </Text>
              <Text className="text-white/90 text-sm text-center mt-1">
                Your application has been approved.
              </Text>
            </View>
          </LinearGradient>
        )}

        <Card>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-800 font-semibold">
              Application Progress
            </Text>
            {!isDone && (
              <Pressable
                onPress={() => advance(application.id)}
                hitSlop={6}
                className="px-3 py-1 bg-purple-100 rounded-lg"
              >
                <Text className="text-xs text-purple-700 font-medium">
                  Simulate next step
                </Text>
              </Pressable>
            )}
          </View>

          <View className="gap-0">
            {STEP_FLOW.map((step, index) => {
              const isCompleted = index < currentIdx;
              const isCurrent = index === currentIdx;
              const isLast = index === STEP_FLOW.length - 1;

              return (
                <View key={step.status} className="flex-row items-start gap-3">
                  <View className="items-center">
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        isCompleted
                          ? 'bg-green-500'
                          : isCurrent
                            ? 'bg-blue-500'
                            : 'bg-gray-200'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle size={22} color={colors.white} />
                      ) : isCurrent ? (
                        <Clock size={22} color={colors.white} />
                      ) : (
                        <Circle size={22} color={colors.gray[400]} />
                      )}
                    </View>
                    {!isLast && (
                      <View
                        style={{
                          width: 2,
                          height: 36,
                          backgroundColor: isCompleted
                            ? '#22c55e'
                            : colors.gray[200],
                        }}
                      />
                    )}
                  </View>
                  <View className="flex-1 pt-2 pb-4">
                    <Text
                      className={`text-sm font-medium ${
                        isCompleted || isCurrent
                          ? 'text-gray-800'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </Text>
                    <Text
                      className={`text-xs mt-0.5 ${
                        isCurrent
                          ? 'text-blue-600'
                          : isCompleted
                            ? 'text-green-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {isCompleted
                        ? '✓ Completed'
                        : isCurrent
                          ? step.description + '…'
                          : step.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        <Card className="bg-blue-50 border border-blue-200">
          <Text className="text-gray-800 font-semibold mb-2">
            What happens next?
          </Text>
          <View className="gap-2">
            <View className="flex-row gap-2">
              <Text className="text-blue-600 font-semibold">1.</Text>
              <Text className="text-sm text-gray-700 flex-1">
                Bank reviews your application and documents
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Text className="text-blue-600 font-semibold">2.</Text>
              <Text className="text-sm text-gray-700 flex-1">
                You will receive an email with the decision
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Text className="text-blue-600 font-semibold">3.</Text>
              <Text className="text-sm text-gray-700 flex-1">
                If approved, your card will be delivered in 7-10 days
              </Text>
            </View>
          </View>
        </Card>

        {alternatives.length > 0 && (
          <View>
            <Text className="text-gray-800 font-semibold mb-3">
              While you wait, check these out
            </Text>
            <View className="gap-2">
              {alternatives.map((alt) => (
                <Pressable
                  key={alt.id}
                  onPress={() =>
                    router.push(`/marketplace/product/${alt.id}`)
                  }
                >
                  <Card>
                    <View className="flex-row items-start gap-3">
                      <View className="w-12 h-12 bg-purple-50 rounded-lg items-center justify-center">
                        <Text className="text-2xl">{alt.logo}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm text-gray-800 font-semibold">
                          {alt.name}
                        </Text>
                        <Text className="text-xs text-gray-600 mb-2">
                          {alt.bank}
                        </Text>
                        <View className="flex-row items-center gap-2 mb-2">
                          <Badge variant="neutral">{`APR ${alt.apr}%`}</Badge>
                          <Badge variant="neutral">
                            {alt.annualFee === 0
                              ? 'No fee'
                              : `Fee ${alt.annualFee}`}
                          </Badge>
                        </View>
                        <View className="flex-row justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() =>
                              router.push(`/marketplace/product/${alt.id}`)
                            }
                          >
                            View
                          </Button>
                        </View>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <Card>
          <Text className="text-gray-800 font-semibold mb-3">Need Help?</Text>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onPress={() =>
                  router.push(
                    `/coming-soon?title=${encodeURIComponent(
                      'Chat support'
                    )}&description=${encodeURIComponent(
                      'In-app support chat is coming soon. For now, contact your bank by phone.'
                    )}` as never
                  )
                }
              >
                Chat Support
              </Button>
            </View>
            <View className="flex-1">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onPress={() => {
                  // Placeholder number — replace per bank/product if you have a directory.
                  void Linking.openURL('tel:+202000000000');
                }}
              >
                Call Bank
              </Button>
            </View>
          </View>
        </Card>

        <Card className="bg-yellow-50 border border-yellow-200">
          <View className="flex-row items-center gap-2">
            <Coins size={18} color="#ca8a04" />
            <Text className="text-sm text-gray-700 flex-1">
              You earned{' '}
              <Text className="font-bold text-yellow-700">+100 coins</Text>{' '}
              for submitting your first application!
            </Text>
          </View>
        </Card>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
