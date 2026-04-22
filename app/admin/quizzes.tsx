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
import { colors } from '@/theme';
import { useContentStore, useUserStore } from '@/stores';
import { deleteQuiz, pullQuizzes, upsertQuiz, type RemoteQuiz, type QuizUpsert } from '@/lib/syncService';

function safeInt(v: string, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function normalizeId(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, '-');
}

export default function AdminQuizzesScreen() {
  const allowed = useUserStore((s) => s.isAdmin);
  const syncContent = useContentStore((s) => s.syncFromCloud);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<RemoteQuiz[]>([]);

  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<RemoteQuiz | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [draft, setDraft] = useState({
    id: '',
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    category: 'general',
    difficulty: 'easy' as RemoteQuiz['difficulty'],
    coinReward: '10',
  });

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await pullQuizzes();
      setQuizzes(data);
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
    const query = q.trim().toLowerCase();
    if (!query) return quizzes;
    return quizzes.filter((x) => {
      const hay = `${x.id} ${x.title} ${x.title_ar ?? ''} ${x.category} ${
        x.description ?? ''
      } ${x.description_ar ?? ''}`.toLowerCase();
      return hay.includes(query);
    });
  }, [quizzes, q]);

  function openCreate() {
    setEditing(null);
    setDraft({
      id: '',
      title: '',
      titleAr: '',
      description: '',
      descriptionAr: '',
      category: 'general',
      difficulty: 'easy',
      coinReward: '10',
    });
    setModalOpen(true);
  }

  function openEdit(row: RemoteQuiz) {
    setEditing(row);
    setDraft({
      id: row.id,
      title: row.title,
      titleAr: row.title_ar ?? '',
      description: row.description ?? '',
      descriptionAr: row.description_ar ?? '',
      category: row.category ?? 'general',
      difficulty: row.difficulty ?? 'easy',
      coinReward: String(row.coin_reward ?? 10),
    });
    setModalOpen(true);
  }

  async function save() {
    const id = normalizeId(draft.id || draft.title);
    if (!id) {
      Alert.alert('Missing id', 'Please enter an id or title.');
      return;
    }
    if (!draft.title.trim()) {
      Alert.alert('Missing title', 'Quiz title is required.');
      return;
    }

    const payload: QuizUpsert = {
      id,
      title: draft.title.trim(),
      title_ar: draft.titleAr.trim() ? draft.titleAr.trim() : null,
      description: draft.description.trim() ? draft.description.trim() : null,
      description_ar: draft.descriptionAr.trim()
        ? draft.descriptionAr.trim()
        : null,
      category: draft.category.trim() || 'general',
      difficulty: draft.difficulty,
      coin_reward: safeInt(draft.coinReward, 10),
    };

    setLoading(true);
    const res = await upsertQuiz(payload);
    setLoading(false);
    if (!res.ok) {
      Alert.alert('Save failed', res.error ?? 'Unknown error');
      return;
    }
    setModalOpen(false);
    await refresh();
    void syncContent();
  }

  function confirmDelete(row: RemoteQuiz) {
    Alert.alert('Delete quiz?', row.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const res = await deleteQuiz(row.id);
          setLoading(false);
          if (!res.ok) {
            Alert.alert('Delete failed', res.error ?? 'Unknown error');
            return;
          }
          await refresh();
          void syncContent();
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
        title="Quizzes"
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <View className="px-4 pt-3 pb-2">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-gray-500">Quiz bank</Text>
            <Text className="text-sm text-gray-800 font-semibold">
              {visible.length} quizzes
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
          <Text className="text-xs text-gray-500 mb-1">Search</Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search by id/title/category…"
            autoCapitalize="none"
            className="px-3 py-2 rounded-lg border border-gray-200"
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
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <Card className="border border-red-200 bg-red-50">
            <Text className="text-gray-900 font-semibold mb-1">Load failed</Text>
            <Text className="text-sm text-gray-700">{error}</Text>
          </Card>
        )}

        {!error &&
          visible.map((row) => (
            <PressableCard
              key={row.id}
              onPress={() => router.push(`/admin/quiz-questions?quizId=${row.id}`)}
            >
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold" numberOfLines={1}>
                    {row.title}
                  </Text>
                  <Text className="text-xs text-gray-500" numberOfLines={1}>
                    {row.id} · {row.category} · {row.difficulty} · reward:{' '}
                    {row.coin_reward}
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      openEdit(row);
                    }}
                    hitSlop={8}
                    className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 items-center justify-center"
                  >
                    <Pencil size={16} color={colors.primary[700]} />
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      confirmDelete(row);
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
                {editing ? 'Edit quiz' : 'New quiz'}
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
                <Text className="text-xs text-gray-500 mb-1">id</Text>
                <TextInput
                  value={draft.id}
                  onChangeText={(v) => setDraft((s) => ({ ...s, id: v }))}
                  placeholder="quiz-investing"
                  autoCapitalize="none"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">title</Text>
                <TextInput
                  value={draft.title}
                  onChangeText={(v) => setDraft((s) => ({ ...s, title: v }))}
                  className="px-3 py-2 rounded-lg border border-gray-200"
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">title (ar)</Text>
                <TextInput
                  value={draft.titleAr}
                  onChangeText={(v) => setDraft((s) => ({ ...s, titleAr: v }))}
                  className="px-3 py-2 rounded-lg border border-gray-200"
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">category</Text>
                <TextInput
                  value={draft.category}
                  onChangeText={(v) => setDraft((s) => ({ ...s, category: v }))}
                  autoCapitalize="none"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">difficulty</Text>
                <View className="flex-row gap-2 flex-wrap">
                  {(['easy', 'medium', 'hard'] as RemoteQuiz['difficulty'][]).map(
                    (d) => (
                      <Button
                        key={d}
                        size="sm"
                        variant={draft.difficulty === d ? 'primary' : 'outline'}
                        onPress={() => setDraft((s) => ({ ...s, difficulty: d }))}
                      >
                        {d}
                      </Button>
                    )
                  )}
                </View>
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">coin reward</Text>
                <TextInput
                  value={draft.coinReward}
                  onChangeText={(v) => setDraft((s) => ({ ...s, coinReward: v }))}
                  keyboardType="numeric"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">description</Text>
                <TextInput
                  value={draft.description}
                  onChangeText={(v) => setDraft((s) => ({ ...s, description: v }))}
                  multiline
                  className="px-3 py-2 rounded-lg border border-gray-200 min-h-[88px]"
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">description (ar)</Text>
                <TextInput
                  value={draft.descriptionAr}
                  onChangeText={(v) =>
                    setDraft((s) => ({ ...s, descriptionAr: v }))
                  }
                  multiline
                  className="px-3 py-2 rounded-lg border border-gray-200 min-h-[88px]"
                />
              </Card>

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

