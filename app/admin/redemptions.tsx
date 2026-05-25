import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Gift, RefreshCw } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import { colors } from '@/theme';
import { useUserStore } from '@/stores';
import { isApiConfigured } from '@/lib/api';
import {
  adminPullRedemptions,
  adminUpdateRedemptionStatus,
  type RemoteRedemption,
} from '@/lib/syncServiceApi';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';

type Status = RemoteRedemption['status'];

const STATUS_OPTS: { id: Status; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'fulfilled', label: 'Fulfilled' },
  { id: 'rejected', label: 'Rejected' },
];

export default function AdminRedemptionsScreen() {
  const { rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const allowed = useUserStore((s) => s.isAdmin);
  const apiMode = isApiConfigured;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<RemoteRedemption[]>([]);
  const [q, setQ] = useState('');

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminPullRedemptions(200);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!allowed) return;
    void refresh();
  }, [allowed]);

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((r) => {
      const hay = `${r.id} ${r.user_id} ${r.reward_id} ${r.reward_title} ${r.status}`.toLowerCase();
      return hay.includes(query);
    });
  }, [rows, q]);

  if (!allowed) {
    return (
      <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
        <ScreenHeader title="Admin" showBack />
        <View className="flex-1 px-4 py-6">
          <Card className="border border-red-200 bg-red-50">
            <Text className="text-gray-900 font-semibold mb-1" style={ta}>
              Access denied
            </Text>
            <Text className="text-sm text-gray-700" style={ta}>
              This area is restricted to admins.
            </Text>
          </Card>
          <View className="mt-4">
            <Button variant="outline" fullWidth onPress={() => router.back()}>
              Go Back
            </Button>
          </View>
        </View>
      </View>
    );
  }

  if (apiMode) {
    return (
      <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
        <ScreenHeader title="Admin • Redemptions" showBack />
        <View className="flex-1 px-4 py-6">
          <Card className="border border-yellow-200 bg-yellow-50">
            <Text className="text-gray-900 font-semibold mb-1" style={ta}>
              Not supported
            </Text>
            <Text className="text-sm text-gray-700" style={ta}>
              Redemptions admin tools are not available in MySQL API mode yet.
            </Text>
          </Card>
          <View className="mt-4">
            <Button variant="outline" fullWidth onPress={() => router.back()}>
              Go Back
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title="Redemptions"
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <View className="px-4 pt-3 pb-2">
        <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between' })}>
          <View>
            <Text className="text-xs text-gray-500" style={ta}>
              Requests
            </Text>
            <Text className="text-sm text-gray-800 font-semibold" style={ta}>
              {visible.length} redemptions
            </Text>
          </View>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw size={16} color={colors.gray[700]} />}
            onPress={refresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </View>
      </View>

      <View className="px-4 pb-2">
        <View className="bg-white border border-gray-200 rounded-2xl p-3">
          <Text className="text-xs text-gray-500 mb-1" style={ta}>
            Search
          </Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search by user, reward, status…"
            autoCapitalize="none"
            className="px-3 py-2 rounded-lg border border-gray-200"
            style={ta}
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        style={rtlRootDirection(rtl)}
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 24, gap: 10 })}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <Card className="border border-red-200 bg-red-50">
            <Text className="text-gray-900 font-semibold mb-1" style={ta}>
              Load failed
            </Text>
            <Text className="text-sm text-gray-700" style={ta}>
              {error}
            </Text>
          </Card>
        )}

        {!error &&
          visible.map((r) => (
            <Card key={r.id} className="border border-gray-200 bg-white" padded>
              <View
                style={rtlRowMerge(rtl, {
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                })}
              >
                <View className="flex-1">
                  <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8, marginBottom: 4 })}>
                    <Gift size={16} color={colors.primary[700]} />
                    <Text className="text-gray-900 font-semibold" numberOfLines={1} style={ta}>
                      {r.reward_title}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500" numberOfLines={1} style={ta}>
                    user: {r.user_id}
                  </Text>
                  <Text className="text-xs text-gray-500" numberOfLines={1} style={ta}>
                    cost: {r.cost} · status: {r.status}
                  </Text>
                </View>

                <View className="gap-2">
                  {STATUS_OPTS.map((opt) => {
                    const active = r.status === opt.id;
                    return (
                      <Pressable
                        key={opt.id}
                        disabled={loading}
                        onPress={async () => {
                          if (active) return;
                          setLoading(true);
                          const res = await adminUpdateRedemptionStatus(r.id, opt.id);
                          setLoading(false);
                          if (!res.ok) {
                            Alert.alert('Update failed', res.error ?? 'Unknown error');
                            return;
                          }
                          setRows((prev) =>
                            prev.map((x) => (x.id === r.id ? { ...x, status: opt.id } : x))
                          );
                        }}
                        className={`px-3 py-2 rounded-lg border ${
                          active
                            ? 'bg-purple-600 border-purple-600'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            active ? 'text-white' : 'text-gray-800'
                          }`}
                          style={ta}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </Card>
          ))}

        {!loading && !error && rows.length === 0 && (
          <PressableCard onPress={refresh}>
            <Text className="text-gray-900 font-semibold" style={ta}>
              No redemptions yet — tap to refresh
            </Text>
          </PressableCard>
        )}
      </ScrollView>
    </View>
  );
}

