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
  deleteLesson,
  pullLessons,
  upsertLesson,
  type LessonUpsert,
  type RemoteLesson,
} from '@/lib/syncServiceApi';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { colors } from '@/theme';
import { useContentStore, useUserStore } from '@/stores';

function safeInt(v: string, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function normalizeId(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, '-');
}

export default function AdminLessonsScreen() {
  const { rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const allowed = useUserStore((s) => s.isAdmin);
  const syncContent = useContentStore((s) => s.syncFromCloud);
  const params = useLocalSearchParams<{ courseId?: string }>();
  const courseIdParam = (params.courseId ?? '').toString();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<RemoteLesson[]>([]);

  const [courseId, setCourseId] = useState(courseIdParam);
  const [q, setQ] = useState('');

  const [editing, setEditing] = useState<RemoteLesson | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    id: '',
    courseId: '',
    title: '',
    titleAr: '',
    summary: '',
    summaryAr: '',
    durationMinutes: '10',
    sortOrder: '1',
  });

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await pullLessons(courseId.trim() || undefined);
      setLessons(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!allowed) return;
    setCourseId(courseIdParam);
     
  }, [allowed, courseIdParam]);

  useEffect(() => {
    if (!allowed) return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, courseId]);

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return lessons;
    return lessons.filter((l) => {
      const hay = `${l.id} ${l.title} ${l.title_ar ?? ''} ${l.course_id} ${
        l.summary ?? ''
      } ${l.summary_ar ?? ''}`.toLowerCase();
      return hay.includes(query);
    });
  }, [lessons, q]);

  function openCreate() {
    setEditing(null);
    setDraft({
      id: '',
      courseId: courseId.trim(),
      title: '',
      titleAr: '',
      summary: '',
      summaryAr: '',
      durationMinutes: '10',
      sortOrder: String(lessons.length + 1),
    });
    setModalOpen(true);
  }

  function openEdit(l: RemoteLesson) {
    setEditing(l);
    setDraft({
      id: l.id,
      courseId: l.course_id,
      title: l.title,
      titleAr: l.title_ar ?? '',
      summary: l.summary ?? '',
      summaryAr: l.summary_ar ?? '',
      durationMinutes: String(l.duration_minutes ?? 10),
      sortOrder: String(l.sort_order ?? 0),
    });
    setModalOpen(true);
  }

  async function save() {
    const id = normalizeId(draft.id || draft.title);
    const cId = draft.courseId.trim();
    if (!id) {
      Alert.alert('Missing id', 'Please enter an id or a title.');
      return;
    }
    if (!cId) {
      Alert.alert('Missing course id', 'Course id is required.');
      return;
    }
    if (!draft.title.trim()) {
      Alert.alert('Missing title', 'Lesson title is required.');
      return;
    }

    const payload: LessonUpsert = {
      id,
      course_id: cId,
      title: draft.title.trim(),
      title_ar: draft.titleAr.trim() ? draft.titleAr.trim() : null,
      summary: draft.summary.trim() ? draft.summary.trim() : null,
      summary_ar: draft.summaryAr.trim() ? draft.summaryAr.trim() : null,
      duration_minutes: safeInt(draft.durationMinutes, 10),
      sort_order: safeInt(draft.sortOrder, lessons.length + 1),
    };

    setLoading(true);
    const res = await upsertLesson(payload);
    setLoading(false);
    if (!res.ok) {
      Alert.alert('Save failed', res.error ?? 'Unknown error');
      return;
    }
    setModalOpen(false);
    await refresh();
    void syncContent();
  }

  function confirmDelete(l: RemoteLesson) {
    Alert.alert('Delete lesson?', l.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const res = await deleteLesson(l.id);
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
        title="Lessons"
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <View className="px-4 pt-3 pb-2">
        <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between' })}>
          <View className="flex-1 mr-3">
            <Text className="text-xs text-gray-500" style={ta}>
              Course filter
            </Text>
            <TextInput
              value={courseId}
              onChangeText={setCourseId}
              placeholder="investing-basics"
              autoCapitalize="none"
              editable={!courseIdParam}
              className={`px-3 py-2 rounded-lg border border-gray-200 ${
                courseIdParam ? 'bg-gray-100 text-gray-600' : 'bg-white'
              }`}
              style={ta}
            />
          </View>
          <View className="gap-2">
            <Button variant="outline" size="sm" onPress={refresh} disabled={loading}>
              Load
            </Button>
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
      </View>

      <View className="px-4 pb-2">
        <View className="bg-white border border-gray-200 rounded-2xl p-3">
          <Text className="text-xs text-gray-500 mb-1" style={ta}>
            Search
          </Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search by id/title…"
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
          visible.map((l) => (
            <PressableCard key={l.id} onPress={() => openEdit(l)}>
              <View
                style={rtlRowMerge(rtl, {
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                })}
              >
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold" numberOfLines={1} style={ta}>
                    {l.title}
                  </Text>
                  <Text className="text-xs text-gray-500" numberOfLines={1} style={ta}>
                    {l.id} · course: {l.course_id} · {l.duration_minutes}m · order:{' '}
                    {l.sort_order}
                  </Text>
                  {!!l.summary && (
                    <Text className="text-xs text-gray-500" numberOfLines={2} style={ta}>
                      {l.summary}
                    </Text>
                  )}
                </View>
                <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/videos?lessonId=${l.id}`);
                    }}
                    hitSlop={8}
                    className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800"
                  >
                    <Text className="text-white text-xs font-semibold" style={ta}>
                      Videos
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      openEdit(l);
                    }}
                    hitSlop={8}
                    className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 items-center justify-center"
                  >
                    <Pencil size={16} color={colors.primary[700]} />
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      confirmDelete(l);
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
                {editing ? 'Edit lesson' : 'New lesson'}
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
                  id
                </Text>
                <TextInput
                  value={draft.id}
                  onChangeText={(v) => setDraft((s) => ({ ...s, id: v }))}
                  placeholder="ib-1"
                  autoCapitalize="none"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                  style={ta}
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1" style={ta}>
                  course id
                </Text>
                <TextInput
                  value={draft.courseId}
                  onChangeText={(v) => setDraft((s) => ({ ...s, courseId: v }))}
                  placeholder="investing-basics"
                  autoCapitalize="none"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                  style={ta}
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1" style={ta}>
                  title
                </Text>
                <TextInput
                  value={draft.title}
                  onChangeText={(v) => setDraft((s) => ({ ...s, title: v }))}
                  className="px-3 py-2 rounded-lg border border-gray-200"
                  style={ta}
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1" style={ta}>
                  title (ar)
                </Text>
                <TextInput
                  value={draft.titleAr}
                  onChangeText={(v) => setDraft((s) => ({ ...s, titleAr: v }))}
                  className="px-3 py-2 rounded-lg border border-gray-200"
                  style={ta}
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1" style={ta}>
                  summary
                </Text>
                <TextInput
                  value={draft.summary}
                  onChangeText={(v) => setDraft((s) => ({ ...s, summary: v }))}
                  multiline
                  className="px-3 py-2 rounded-lg border border-gray-200 min-h-[88px]"
                  style={ta}
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1" style={ta}>
                  summary (ar)
                </Text>
                <TextInput
                  value={draft.summaryAr}
                  onChangeText={(v) => setDraft((s) => ({ ...s, summaryAr: v }))}
                  multiline
                  className="px-3 py-2 rounded-lg border border-gray-200 min-h-[88px]"
                  style={ta}
                />
              </Card>

              <View style={rtlRowMerge(rtl, { gap: 8 })}>
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1" style={ta}>
                    duration (min)
                  </Text>
                  <TextInput
                    value={draft.durationMinutes}
                    onChangeText={(v) =>
                      setDraft((s) => ({ ...s, durationMinutes: v }))
                    }
                    keyboardType="numeric"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                    style={ta}
                  />
                </Card>
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1" style={ta}>
                    sort order
                  </Text>
                  <TextInput
                    value={draft.sortOrder}
                    onChangeText={(v) => setDraft((s) => ({ ...s, sortOrder: v }))}
                    keyboardType="numeric"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                    style={ta}
                  />
                </Card>
              </View>

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

