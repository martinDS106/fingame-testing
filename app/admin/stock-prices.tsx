import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Pencil, Plus, Trash2, X } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import {
  deleteStockPrice,
  pullStockPrices,
  upsertStockPrice,
  type RemoteStockPrice,
} from '@/lib/syncServiceApi';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { colors } from '@/theme';
import { useUserStore } from '@/stores';

function safeNumber(v: string, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function AdminStockPricesScreen() {
  const { rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const allowed = useUserStore((s) => s.isAdmin);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<RemoteStockPrice[]>([]);

  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<RemoteStockPrice | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [draft, setDraft] = useState({ symbol: '', price: '' });

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await pullStockPrices();
      setRows(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!allowed) return;
    void refresh();
  }, [allowed]);

  const visible = useMemo(() => {
    const query = q.trim().toUpperCase();
    if (!query) return rows;
    return rows.filter((r) => r.symbol.toUpperCase().includes(query));
  }, [rows, q]);

  function openCreate() {
    setEditing(null);
    setDraft({ symbol: '', price: '' });
    setModalOpen(true);
  }

  function openEdit(r: RemoteStockPrice) {
    setEditing(r);
    setDraft({ symbol: r.symbol, price: String(r.price ?? 0) });
    setModalOpen(true);
  }

  async function save() {
    const symbol = draft.symbol.trim().toUpperCase();
    const price = safeNumber(draft.price, NaN);
    if (!symbol) {
      Alert.alert('Missing symbol', 'Please enter a stock symbol.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      Alert.alert('Invalid price', 'Price must be a positive number.');
      return;
    }

    setLoading(true);
    const res = await upsertStockPrice({ symbol, price });
    setLoading(false);
    if (!res.ok) {
      Alert.alert('Save failed', res.error ?? 'Unknown error');
      return;
    }
    setModalOpen(false);
    await refresh();
  }

  function confirmDelete(r: RemoteStockPrice) {
    Alert.alert('Delete override?', r.symbol, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const res = await deleteStockPrice(r.symbol);
          setLoading(false);
          if (!res.ok) {
            Alert.alert('Delete failed', res.error ?? 'Unknown error');
            return;
          }
          await refresh();
        },
      },
    ]);
  }

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

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title="Stock Prices"
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <View className="px-4 pt-3 pb-2">
        <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between' })}>
          <View>
            <Text className="text-xs text-gray-500" style={ta}>
              Overrides
            </Text>
            <Text className="text-sm text-gray-800 font-semibold" style={ta}>
              {visible.length} rows
            </Text>
          </View>
          <Button
            size="sm"
            leftIcon={<Plus size={16} color={colors.white} />}
            onPress={openCreate}
            disabled={loading}
          >
            Add
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
            placeholder="COMI, ETEL…"
            autoCapitalize="characters"
            className="px-3 py-2 rounded-lg border border-gray-200"
            style={ta}
          />
          <View className="mt-3">
            <Button variant="outline" fullWidth onPress={refresh} disabled={loading}>
              Refresh
            </Button>
          </View>
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
            <PressableCard key={r.symbol} onPress={() => openEdit(r)}>
              <View
                style={rtlRowMerge(rtl, {
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                })}
              >
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold" style={ta}>
                    {r.symbol}
                  </Text>
                  <Text className="text-xs text-gray-500" style={ta}>
                    price: {r.price} · updated:{' '}
                    {new Date(r.updated_at).toLocaleString()}
                  </Text>
                </View>

                <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      openEdit(r);
                    }}
                    hitSlop={8}
                    className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 items-center justify-center"
                  >
                    <Pencil size={16} color={colors.primary[700]} />
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      confirmDelete(r);
                    }}
                    hitSlop={8}
                    className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 items-center justify-center"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </Pressable>
                </View>
              </View>
            </PressableCard>
          ))}
      </ScrollView>

      <Modal visible={modalOpen} animationType="slide" transparent>
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setModalOpen(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl p-4"
            onPress={(e) => e.stopPropagation()}
          >
            <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 })}>
              <Text className="text-lg text-gray-900 font-semibold" style={ta}>
                {editing ? 'Edit price' : 'New override'}
              </Text>
              <Pressable onPress={() => setModalOpen(false)} hitSlop={8}>
                <X size={20} color={colors.gray[600]} />
              </Pressable>
            </View>

            <ScrollView
              style={rtlRootDirection(rtl)}
              contentContainerStyle={mergeScrollContentRtl(rtl, { paddingBottom: 16, gap: 10 })}
              showsVerticalScrollIndicator={false}
            >
              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1" style={ta}>
                  symbol
                </Text>
                <TextInput
                  value={draft.symbol}
                  onChangeText={(v) => setDraft((s) => ({ ...s, symbol: v }))}
                  placeholder="COMI"
                  autoCapitalize="characters"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                  style={ta}
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1" style={ta}>
                  price
                </Text>
                <TextInput
                  value={draft.price}
                  onChangeText={(v) => setDraft((s) => ({ ...s, price: v }))}
                  keyboardType="numeric"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                  style={ta}
                />
              </Card>

              <View style={rtlRowMerge(rtl, { gap: 8 })}>
                <View className="flex-1">
                  <Button
                    variant="outline"
                    fullWidth
                    onPress={() => setModalOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </View>
                <View className="flex-1">
                  <Button fullWidth onPress={save} disabled={loading}>
                    Save
                  </Button>
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

