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
  deleteMarketplaceProduct,
  pullMarketplaceProducts,
  upsertMarketplaceProduct,
  type MarketplaceProductUpsert,
  type RemoteMarketplaceProduct,
} from '@/lib/syncService';
import { colors } from '@/theme';
import { useUserStore } from '@/stores';

type Tier = RemoteMarketplaceProduct['tier'];
type TierFilter = 'all' | Tier;
type BestValueFilter = 'all' | 'yes' | 'no';
type SortKey = 'sort_order' | 'name' | 'min_income';
type SortDir = 'asc' | 'desc';

function linesToArray(v: string): string[] {
  return v
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function arrayToLines(v: string[] | null | undefined): string {
  return (v ?? []).join('\n');
}

function safeNumber(v: string, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeId(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, '-');
}

const TIER_OPTIONS: { id: Tier; label: string }[] = [
  { id: 'strong', label: 'Strong' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'high', label: 'High cost' },
];

export default function AdminMarketplaceProductsScreen() {
  const allowed = useUserStore((s) => s.isAdmin);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<RemoteMarketplaceProduct[]>([]);

  const [q, setQ] = useState('');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [bestValueFilter, setBestValueFilter] =
    useState<BestValueFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('sort_order');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [editing, setEditing] = useState<RemoteMarketplaceProduct | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [draft, setDraft] = useState({
    id: '',
    bank: '',
    logo: '🏦',
    name: '',
    apr: '0',
    annualFee: '0',
    cashback: '0',
    tier: 'moderate' as Tier,
    minIncome: '0',
    minAge: '',
    minCreditScore: '',
    bestFor: '',
    isBestValue: false,
    sortOrder: '1',
    benefits: '',
    pros: '',
    cons: '',
  });

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await pullMarketplaceProducts('credit-cards');
      setProducts(data);
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

  const visibleProducts = useMemo(() => {
    const query = q.trim().toLowerCase();
    let out = products;
    if (query) {
      out = out.filter((p) => {
        const hay = `${p.id} ${p.name} ${p.bank}`.toLowerCase();
        return hay.includes(query);
      });
    }
    if (tierFilter !== 'all') {
      out = out.filter((p) => p.tier === tierFilter);
    }
    if (bestValueFilter !== 'all') {
      const flag = bestValueFilter === 'yes';
      out = out.filter((p) => !!p.is_best_value === flag);
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    out = [...out].sort((a, b) => {
      if (sortKey === 'name') {
        return a.name.localeCompare(b.name) * dir;
      }
      if (sortKey === 'min_income') {
        return (Number(a.min_income) - Number(b.min_income)) * dir;
      }
      return (Number(a.sort_order) - Number(b.sort_order)) * dir;
    });

    return out;
  }, [products, q, tierFilter, bestValueFilter, sortKey, sortDir]);

  const subtitle = useMemo(() => {
    if (loading) return 'Loading…';
    if (error) return 'Error — pull to retry';
    if (!products.length) return '0 products';
    if (visibleProducts.length === products.length) return `${products.length} products`;
    return `${visibleProducts.length} of ${products.length} products`;
  }, [loading, error, products.length, visibleProducts.length]);

  function openCreate() {
    setEditing(null);
    setDraft({
      id: '',
      bank: '',
      logo: '🏦',
      name: '',
      apr: '0',
      annualFee: '0',
      cashback: '0',
      tier: 'moderate',
      minIncome: '0',
      minAge: '',
      minCreditScore: '',
      bestFor: '',
      isBestValue: false,
      sortOrder: String(products.length + 1),
      benefits: '',
      pros: '',
      cons: '',
    });
    setModalOpen(true);
  }

  function openEdit(p: RemoteMarketplaceProduct) {
    setEditing(p);
    setDraft({
      id: p.id,
      bank: p.bank,
      logo: p.logo,
      name: p.name,
      apr: String(p.apr ?? 0),
      annualFee: String(p.annual_fee ?? 0),
      cashback: String(p.cashback ?? 0),
      tier: p.tier,
      minIncome: String(p.min_income ?? 0),
      minAge: p.min_age == null ? '' : String(p.min_age),
      minCreditScore: p.min_credit_score == null ? '' : String(p.min_credit_score),
      bestFor: p.best_for ?? '',
      isBestValue: !!p.is_best_value,
      sortOrder: String(p.sort_order ?? 0),
      benefits: arrayToLines(p.benefits),
      pros: arrayToLines(p.pros),
      cons: arrayToLines(p.cons),
    });
    setModalOpen(true);
  }

  async function save() {
    const id = normalizeId(draft.id || draft.name);
    if (!id) {
      Alert.alert('Missing id', 'Please enter an id or a name.');
      return;
    }
    if (!draft.name.trim() || !draft.bank.trim()) {
      Alert.alert('Missing fields', 'Name and bank are required.');
      return;
    }

    const payload: MarketplaceProductUpsert = {
      id,
      category: 'credit-cards',
      bank: draft.bank.trim(),
      logo: draft.logo.trim() || '🏦',
      name: draft.name.trim(),
      apr: safeNumber(draft.apr),
      annual_fee: safeNumber(draft.annualFee),
      cashback: safeNumber(draft.cashback),
      rating: editing?.rating ?? 0,
      reviews_count: editing?.reviews_count ?? 0,
      tier: draft.tier,
      min_income: safeNumber(draft.minIncome),
      min_age: draft.minAge ? safeNumber(draft.minAge) : null,
      min_credit_score: draft.minCreditScore ? safeNumber(draft.minCreditScore) : null,
      benefits: linesToArray(draft.benefits),
      pros: linesToArray(draft.pros),
      cons: linesToArray(draft.cons),
      best_for: draft.bestFor.trim(),
      is_best_value: draft.isBestValue,
      sort_order: safeNumber(draft.sortOrder, products.length + 1),
    };

    setLoading(true);
    const res = await upsertMarketplaceProduct(payload);
    setLoading(false);
    if (!res.ok) {
      Alert.alert('Save failed', res.error ?? 'Unknown error');
      return;
    }
    setModalOpen(false);
    await refresh();
  }

  function confirmDelete(p: RemoteMarketplaceProduct) {
    Alert.alert('Delete product?', p.name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const res = await deleteMarketplaceProduct(p.id);
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
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Admin" showBack />
        <View className="flex-1 px-4 py-6">
          <Card className="border border-red-200 bg-red-50">
            <Text className="text-gray-900 font-semibold mb-1">Access denied</Text>
            <Text className="text-sm text-gray-700">
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
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Marketplace Products"
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <View className="px-4 pt-3 pb-2">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-gray-500">Credit cards</Text>
            <Text className="text-sm text-gray-800 font-semibold">{subtitle}</Text>
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
          <Text className="text-xs text-gray-500 mb-1">Search</Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search by id, name, or bank…"
            autoCapitalize="none"
            className="px-3 py-2 rounded-lg border border-gray-200"
          />

          <View className="mt-3">
            <Text className="text-xs text-gray-500 mb-2">Filters</Text>
            <View className="flex-row gap-2 flex-wrap">
              {(
                [
                  { id: 'all', label: 'All tiers' },
                  { id: 'strong', label: 'Strong' },
                  { id: 'moderate', label: 'Moderate' },
                  { id: 'high', label: 'High' },
                ] as { id: TierFilter; label: string }[]
              ).map((opt) => {
                const active = tierFilter === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setTierFilter(opt.id)}
                    className={`px-3 py-2 rounded-lg border ${
                      active
                        ? 'bg-gray-900 border-gray-900'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        active ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-3 flex-row gap-2 flex-wrap">
              {(
                [
                  { id: 'all', label: 'Best value: All' },
                  { id: 'yes', label: 'Best value: Yes' },
                  { id: 'no', label: 'Best value: No' },
                ] as { id: BestValueFilter; label: string }[]
              ).map((opt) => {
                const active = bestValueFilter === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setBestValueFilter(opt.id)}
                    className={`px-3 py-2 rounded-lg border ${
                      active
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        active ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="mt-3">
            <Text className="text-xs text-gray-500 mb-2">Sort</Text>
            <View className="flex-row gap-2 flex-wrap">
              {(
                [
                  { id: 'sort_order', label: 'Sort order' },
                  { id: 'name', label: 'Name' },
                  { id: 'min_income', label: 'Min income' },
                ] as { id: SortKey; label: string }[]
              ).map((opt) => {
                const active = sortKey === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setSortKey(opt.id)}
                    className={`px-3 py-2 rounded-lg border ${
                      active
                        ? 'bg-purple-600 border-purple-600'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        active ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}

              <Pressable
                onPress={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                className="px-3 py-2 rounded-lg border bg-white border-gray-200"
              >
                <Text className="text-sm font-medium text-gray-800">
                  {sortDir === 'asc' ? 'Asc' : 'Desc'}
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-3">
            <Button
              variant="outline"
              fullWidth
              onPress={() => {
                setQ('');
                setTierFilter('all');
                setBestValueFilter('all');
                setSortKey('sort_order');
                setSortDir('asc');
              }}
            >
              Reset search & filters
            </Button>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <Card className="border border-red-200 bg-red-50">
            <Text className="text-gray-900 font-semibold mb-1">Load failed</Text>
            <Text className="text-sm text-gray-700">{error}</Text>
            <View className="mt-3">
              <Button variant="outline" fullWidth onPress={refresh}>
                Retry
              </Button>
            </View>
          </Card>
        )}

        {!error &&
          visibleProducts.map((p) => (
            <PressableCard key={p.id} onPress={() => openEdit(p)}>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center">
                    <Text className="text-xl">{p.logo}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold" numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                      {p.id} · {p.bank} · tier: {p.tier}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      openEdit(p);
                    }}
                    hitSlop={8}
                    className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 items-center justify-center"
                  >
                    <Pencil size={16} color={colors.primary[700]} />
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      confirmDelete(p);
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
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg text-gray-900 font-semibold">
                {editing ? 'Edit product' : 'New product'}
              </Text>
              <Pressable onPress={() => setModalOpen(false)} hitSlop={8}>
                <X size={20} color={colors.gray[600]} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={{ paddingBottom: 16, gap: 10 }}
              showsVerticalScrollIndicator={false}
            >
              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">id (slug)</Text>
                <TextInput
                  value={draft.id}
                  onChangeText={(v) => setDraft((s) => ({ ...s, id: v }))}
                  placeholder="cib-smart"
                  autoCapitalize="none"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                />
              </Card>

              <View className="flex-row gap-2">
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1">bank</Text>
                  <TextInput
                    value={draft.bank}
                    onChangeText={(v) => setDraft((s) => ({ ...s, bank: v }))}
                    placeholder="CIB"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                  />
                </Card>
                <Card className="w-28 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1">logo</Text>
                  <TextInput
                    value={draft.logo}
                    onChangeText={(v) => setDraft((s) => ({ ...s, logo: v }))}
                    placeholder="🏦"
                    className="px-3 py-2 rounded-lg border border-gray-200 text-center"
                  />
                </Card>
              </View>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">name</Text>
                <TextInput
                  value={draft.name}
                  onChangeText={(v) => setDraft((s) => ({ ...s, name: v }))}
                  placeholder="CIB Smart Credit Card"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                />
              </Card>

              <View className="flex-row gap-2">
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1">APR</Text>
                  <TextInput
                    value={draft.apr}
                    onChangeText={(v) => setDraft((s) => ({ ...s, apr: v }))}
                    keyboardType="numeric"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                  />
                </Card>
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1">annual fee</Text>
                  <TextInput
                    value={draft.annualFee}
                    onChangeText={(v) => setDraft((s) => ({ ...s, annualFee: v }))}
                    keyboardType="numeric"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                  />
                </Card>
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1">cashback</Text>
                  <TextInput
                    value={draft.cashback}
                    onChangeText={(v) => setDraft((s) => ({ ...s, cashback: v }))}
                    keyboardType="numeric"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                  />
                </Card>
              </View>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-2">tier</Text>
                <View className="flex-row gap-2 flex-wrap">
                  {TIER_OPTIONS.map((opt) => {
                    const active = draft.tier === opt.id;
                    return (
                      <Pressable
                        key={opt.id}
                        onPress={() => setDraft((s) => ({ ...s, tier: opt.id }))}
                        className={`px-3 py-2 rounded-lg border ${
                          active
                            ? 'bg-gray-900 border-gray-900'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            active ? 'text-white' : 'text-gray-800'
                          }`}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Card>

              <View className="flex-row gap-2">
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1">min income</Text>
                  <TextInput
                    value={draft.minIncome}
                    onChangeText={(v) => setDraft((s) => ({ ...s, minIncome: v }))}
                    keyboardType="numeric"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                  />
                </Card>
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1">min age</Text>
                  <TextInput
                    value={draft.minAge}
                    onChangeText={(v) => setDraft((s) => ({ ...s, minAge: v }))}
                    keyboardType="numeric"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                  />
                </Card>
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1">min score</Text>
                  <TextInput
                    value={draft.minCreditScore}
                    onChangeText={(v) =>
                      setDraft((s) => ({ ...s, minCreditScore: v }))
                    }
                    keyboardType="numeric"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                  />
                </Card>
              </View>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">best for</Text>
                <TextInput
                  value={draft.bestFor}
                  onChangeText={(v) => setDraft((s) => ({ ...s, bestFor: v }))}
                  placeholder="Regular spenders with travel needs"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">
                  benefits (one per line)
                </Text>
                <TextInput
                  value={draft.benefits}
                  onChangeText={(v) => setDraft((s) => ({ ...s, benefits: v }))}
                  multiline
                  className="px-3 py-2 rounded-lg border border-gray-200 min-h-[88px]"
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">
                  pros (one per line)
                </Text>
                <TextInput
                  value={draft.pros}
                  onChangeText={(v) => setDraft((s) => ({ ...s, pros: v }))}
                  multiline
                  className="px-3 py-2 rounded-lg border border-gray-200 min-h-[88px]"
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">
                  cons (one per line)
                </Text>
                <TextInput
                  value={draft.cons}
                  onChangeText={(v) => setDraft((s) => ({ ...s, cons: v }))}
                  multiline
                  className="px-3 py-2 rounded-lg border border-gray-200 min-h-[88px]"
                />
              </Card>

              <View className="flex-row gap-2">
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1">sort order</Text>
                  <TextInput
                    value={draft.sortOrder}
                    onChangeText={(v) => setDraft((s) => ({ ...s, sortOrder: v }))}
                    keyboardType="numeric"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                  />
                </Card>
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1">best value</Text>
                  <View className="flex-row gap-2">
                    <Button
                      size="sm"
                      variant={draft.isBestValue ? 'primary' : 'outline'}
                      onPress={() => setDraft((s) => ({ ...s, isBestValue: true }))}
                    >
                      Yes
                    </Button>
                    <Button
                      size="sm"
                      variant={!draft.isBestValue ? 'primary' : 'outline'}
                      onPress={() =>
                        setDraft((s) => ({ ...s, isBestValue: false }))
                      }
                    >
                      No
                    </Button>
                  </View>
                </Card>
              </View>

              <View className="flex-row gap-2">
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

