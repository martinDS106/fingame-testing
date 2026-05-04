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
import { router, useLocalSearchParams } from 'expo-router';
import { Pencil, Plus, Trash2, X } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import {
  deleteQuestion,
  pullQuestions,
  upsertQuestion,
  type QuestionUpsert,
  type RemoteQuestion,
} from '@/lib/syncServiceApi';
import { colors } from '@/theme';
import { useContentStore, useUserStore } from '@/stores';

function safeInt(v: string, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function normalizeId(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, '-');
}

function linesToArray(v: string): string[] {
  return v
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function arrayToLines(v: string[] | null | undefined): string {
  return (v ?? []).join('\n');
}

export default function AdminQuizQuestionsScreen() {
  const allowed = useUserStore((s) => s.isAdmin);
  const syncContent = useContentStore((s) => s.syncFromCloud);
  const params = useLocalSearchParams<{ quizId?: string }>();
  const quizId = (params.quizId ?? '').toString();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<RemoteQuestion[]>([]);
  const [q, setQ] = useState('');

  const [editing, setEditing] = useState<RemoteQuestion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    id: '',
    question: '',
    questionAr: '',
    options: '',
    optionsAr: '',
    correctIndex: '0',
    explanation: '',
    explanationAr: '',
    sortOrder: '1',
  });

  async function refresh() {
    if (!quizId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await pullQuestions(quizId);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, quizId]);

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((r) => {
      if (r.id.toLowerCase().includes(query)) return true;
      if (r.question.toLowerCase().includes(query)) return true;
      if ((r.question_ar ?? '').toLowerCase().includes(query)) return true;
      return false;
    });
  }, [rows, q]);

  function openCreate() {
    setEditing(null);
    setDraft({
      id: '',
      question: '',
      questionAr: '',
      options: '',
      optionsAr: '',
      correctIndex: '0',
      explanation: '',
      explanationAr: '',
      sortOrder: String(rows.length + 1),
    });
    setModalOpen(true);
  }

  function openEdit(r: RemoteQuestion) {
    setEditing(r);
    setDraft({
      id: r.id,
      question: r.question,
      questionAr: r.question_ar ?? '',
      options: arrayToLines(r.options),
      optionsAr: arrayToLines(r.options_ar),
      correctIndex: String(r.correct_index ?? 0),
      explanation: r.explanation ?? '',
      explanationAr: r.explanation_ar ?? '',
      sortOrder: String(r.sort_order ?? 0),
    });
    setModalOpen(true);
  }

  async function save() {
    if (!quizId) return;
    const id = normalizeId(draft.id || `q-${quizId}-${draft.sortOrder}`);
    if (!id) {
      Alert.alert('Missing id', 'Please enter an id.');
      return;
    }
    if (!draft.question.trim()) {
      Alert.alert('Missing question', 'Question text is required.');
      return;
    }

    const opts = linesToArray(draft.options);
    if (opts.length < 2) {
      Alert.alert('Options required', 'Add at least 2 options (one per line).');
      return;
    }

    const optsArRaw = linesToArray(draft.optionsAr);
    const optsAr = optsArRaw.length ? optsArRaw : null;
    if (optsAr && optsAr.length !== opts.length) {
      Alert.alert(
        'Arabic options mismatch',
        `Arabic options must have the same number of lines as English options (${opts.length}).`
      );
      return;
    }
    const correctIndex = safeInt(draft.correctIndex, 0);
    if (correctIndex < 0 || correctIndex >= opts.length) {
      Alert.alert('Invalid correct index', `Must be between 0 and ${opts.length - 1}.`);
      return;
    }

    const payload: QuestionUpsert = {
      id,
      quiz_id: quizId,
      question: draft.question.trim(),
      question_ar: draft.questionAr.trim() ? draft.questionAr.trim() : null,
      options: opts,
      options_ar: optsAr,
      correct_index: correctIndex,
      explanation: draft.explanation.trim() ? draft.explanation.trim() : null,
      explanation_ar: draft.explanationAr.trim() ? draft.explanationAr.trim() : null,
      sort_order: safeInt(draft.sortOrder, rows.length + 1),
    };

    setLoading(true);
    const res = await upsertQuestion(payload);
    setLoading(false);
    if (!res.ok) {
      Alert.alert('Save failed', res.error ?? 'Unknown error');
      return;
    }
    setModalOpen(false);
    await refresh();
    void syncContent();
  }

  function confirmDelete(r: RemoteQuestion) {
    Alert.alert('Delete question?', r.id, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const res = await deleteQuestion(r.id);
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

  if (!quizId) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Quiz Questions" showBack />
        <View className="flex-1 px-4 py-6">
          <Card className="border border-red-200 bg-red-50">
            <Text className="text-gray-900 font-semibold mb-1">Missing quizId</Text>
            <Text className="text-sm text-gray-700">
              Open this screen from the Quizzes list.
            </Text>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Questions"
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <View className="px-4 pt-3 pb-2">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-gray-500">Quiz</Text>
            <Text className="text-sm text-gray-800 font-semibold">{quizId}</Text>
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
            placeholder="Search question text…"
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
          visible.map((r) => (
            <PressableCard key={r.id} onPress={() => openEdit(r)}>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold" numberOfLines={2}>
                    {r.question}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {r.id} · order: {r.sort_order} · correct: {r.correct_index}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
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
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg text-gray-900 font-semibold">
                {editing ? 'Edit question' : 'New question'}
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
                  placeholder={`q-${quizId}-01`}
                  autoCapitalize="none"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">question</Text>
                <TextInput
                  value={draft.question}
                  onChangeText={(v) => setDraft((s) => ({ ...s, question: v }))}
                  multiline
                  className="px-3 py-2 rounded-lg border border-gray-200 min-h-[88px]"
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">question (ar)</Text>
                <TextInput
                  value={draft.questionAr}
                  onChangeText={(v) => setDraft((s) => ({ ...s, questionAr: v }))}
                  multiline
                  className="px-3 py-2 rounded-lg border border-gray-200 min-h-[88px]"
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">
                  options (one per line)
                </Text>
                <TextInput
                  value={draft.options}
                  onChangeText={(v) => setDraft((s) => ({ ...s, options: v }))}
                  multiline
                  className="px-3 py-2 rounded-lg border border-gray-200 min-h-[88px]"
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">
                  options (ar) (one per line)
                </Text>
                <TextInput
                  value={draft.optionsAr}
                  onChangeText={(v) => setDraft((s) => ({ ...s, optionsAr: v }))}
                  multiline
                  className="px-3 py-2 rounded-lg border border-gray-200 min-h-[88px]"
                />
              </Card>

              <View className="flex-row gap-2">
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1">correct index</Text>
                  <TextInput
                    value={draft.correctIndex}
                    onChangeText={(v) => setDraft((s) => ({ ...s, correctIndex: v }))}
                    keyboardType="numeric"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                  />
                </Card>
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1">sort order</Text>
                  <TextInput
                    value={draft.sortOrder}
                    onChangeText={(v) => setDraft((s) => ({ ...s, sortOrder: v }))}
                    keyboardType="numeric"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                  />
                </Card>
              </View>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">explanation</Text>
                <TextInput
                  value={draft.explanation}
                  onChangeText={(v) => setDraft((s) => ({ ...s, explanation: v }))}
                  multiline
                  className="px-3 py-2 rounded-lg border border-gray-200 min-h-[88px]"
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">explanation (ar)</Text>
                <TextInput
                  value={draft.explanationAr}
                  onChangeText={(v) =>
                    setDraft((s) => ({ ...s, explanationAr: v }))
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

