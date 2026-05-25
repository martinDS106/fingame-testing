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
  deleteCourse,
  pullCourses,
  upsertCourse,
  type CourseUpsert,
  type RemoteCourse,
} from '@/lib/syncServiceApi';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { colors } from '@/theme';
import { useContentStore, useUserStore } from '@/stores';

function safeNumber(v: string, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeId(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, '-');
}

type SortKey = 'sort_order' | 'title' | 'coin_reward';
type SortDir = 'asc' | 'desc';

export default function AdminCoursesScreen() {
  const { rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const allowed = useUserStore((s) => s.isAdmin);
  const syncContent = useContentStore((s) => s.syncFromCloud);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<RemoteCourse[]>([]);

  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('sort_order');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [editing, setEditing] = useState<RemoteCourse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [draft, setDraft] = useState({
    id: '',
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    topic: 'investing',
    icon: '📚',
    color: '#2563eb',
    sortOrder: '1',
    coinReward: '0',
  });

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await pullCourses();
      setCourses(data);
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
    let out = courses;
    if (query) {
      out = out.filter((c) => {
        const hay = `${c.id} ${c.title} ${c.title_ar ?? ''} ${c.description ?? ''} ${
          c.description_ar ?? ''
        }`.toLowerCase();
        return hay.includes(query);
      });
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    out = [...out].sort((a, b) => {
      if (sortKey === 'title') return a.title.localeCompare(b.title) * dir;
      if (sortKey === 'coin_reward') {
        return (Number(a.coin_reward) - Number(b.coin_reward)) * dir;
      }
      return (Number(a.sort_order) - Number(b.sort_order)) * dir;
    });
    return out;
  }, [courses, q, sortKey, sortDir]);

  const subtitle = useMemo(() => {
    if (loading) return 'Loading…';
    if (error) return 'Error — retry';
    if (!courses.length) return '0 courses';
    if (visible.length === courses.length) return `${courses.length} courses`;
    return `${visible.length} of ${courses.length} courses`;
  }, [loading, error, courses.length, visible.length]);

  function openCreate() {
    setEditing(null);
    setDraft({
      id: '',
      title: '',
      titleAr: '',
      description: '',
      descriptionAr: '',
      topic: 'investing',
      icon: '📚',
      color: '#2563eb',
      sortOrder: String(courses.length + 1),
      coinReward: '0',
    });
    setModalOpen(true);
  }

  function openEdit(c: RemoteCourse) {
    setEditing(c);
    setDraft({
      id: c.id,
      title: c.title,
      titleAr: c.title_ar ?? '',
      description: c.description ?? '',
      descriptionAr: c.description_ar ?? '',
      topic: (c.topic ?? '').trim() || 'investing',
      icon: c.icon ?? '📚',
      color: c.color ?? '#2563eb',
      sortOrder: String(c.sort_order ?? 0),
      coinReward: String(c.coin_reward ?? 0),
    });
    setModalOpen(true);
  }

  async function save() {
    const id = normalizeId(draft.id || draft.title);
    if (!id) {
      Alert.alert('Missing id', 'Please enter an id or a title.');
      return;
    }
    if (!draft.title.trim()) {
      Alert.alert('Missing title', 'Course title is required.');
      return;
    }

    const payload: CourseUpsert = {
      id,
      title: draft.title.trim(),
      title_ar: draft.titleAr.trim() ? draft.titleAr.trim() : null,
      description: draft.description.trim() ? draft.description.trim() : null,
      description_ar: draft.descriptionAr.trim() ? draft.descriptionAr.trim() : null,
      topic: draft.topic.trim() ? draft.topic.trim() : 'investing',
      icon: draft.icon.trim() ? draft.icon.trim() : null,
      color: draft.color.trim() ? draft.color.trim() : null,
      sort_order: safeNumber(draft.sortOrder, courses.length + 1),
      coin_reward: safeNumber(draft.coinReward, 0),
    };

    setLoading(true);
    const res = await upsertCourse(payload);
    setLoading(false);
    if (!res.ok) {
      Alert.alert('Save failed', res.error ?? 'Unknown error');
      return;
    }
    setModalOpen(false);
    await refresh();
    void syncContent();
  }

  function confirmDelete(c: RemoteCourse) {
    Alert.alert('Delete course?', c.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const res = await deleteCourse(c.id);
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
        title="Courses"
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <View className="px-4 pt-3 pb-2">
        <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between' })}>
          <View>
            <Text className="text-xs text-gray-500" style={ta}>
              Content
            </Text>
            <Text className="text-sm text-gray-800 font-semibold" style={ta}>
              {subtitle}
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
            placeholder="Search by id or title…"
            autoCapitalize="none"
            className="px-3 py-2 rounded-lg border border-gray-200"
            style={ta}
          />

          <View className="mt-3">
            <Text className="text-xs text-gray-500 mb-2" style={ta}>
              Sort
            </Text>
            <View style={rtlRowMerge(rtl, { gap: 8, flexWrap: 'wrap' })}>
              {(
                [
                  { id: 'sort_order', label: 'Sort order' },
                  { id: 'title', label: 'Title' },
                  { id: 'coin_reward', label: 'Coin reward' },
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
                      style={ta}
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
                <Text className="text-sm font-medium text-gray-800" style={ta}>
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
                setSortKey('sort_order');
                setSortDir('asc');
              }}
            >
              Reset
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
            <View className="mt-3">
              <Button variant="outline" fullWidth onPress={refresh}>
                Retry
              </Button>
            </View>
          </Card>
        )}

        {!error &&
          visible.map((c) => (
            <PressableCard key={c.id} onPress={() => openEdit(c)}>
              <View
                style={rtlRowMerge(rtl, {
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                })}
              >
                <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 12, flex: 1 })}>
                  <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center">
                    <Text className="text-xl">{c.icon ?? '📚'}</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-gray-900 font-semibold"
                      numberOfLines={1}
                      style={ta}
                    >
                      {c.title}
                    </Text>
                    <Text className="text-xs text-gray-500" numberOfLines={1} style={ta}>
                      {c.id} · reward: {c.coin_reward} · order: {c.sort_order}
                    </Text>
                  </View>
                </View>

                <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/lessons?courseId=${c.id}`);
                    }}
                    hitSlop={8}
                    className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800"
                  >
                    <Text className="text-white text-xs font-semibold" style={ta}>
                      Lessons
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      openEdit(c);
                    }}
                    hitSlop={8}
                    className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 items-center justify-center"
                  >
                    <Pencil size={16} color={colors.primary[700]} />
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      confirmDelete(c);
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
                {editing ? 'Edit course' : 'New course'}
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
                  id (slug)
                </Text>
                <TextInput
                  value={draft.id}
                  onChangeText={(v) => setDraft((s) => ({ ...s, id: v }))}
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
                  placeholder="Investing Basics"
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
                  placeholder="أساسيات الاستثمار"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                  style={ta}
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1" style={ta}>
                  description
                </Text>
                <TextInput
                  value={draft.description}
                  onChangeText={(v) => setDraft((s) => ({ ...s, description: v }))}
                  multiline
                  className="px-3 py-2 rounded-lg border border-gray-200 min-h-[88px]"
                  style={ta}
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1" style={ta}>
                  description (ar)
                </Text>
                <TextInput
                  value={draft.descriptionAr}
                  onChangeText={(v) => setDraft((s) => ({ ...s, descriptionAr: v }))}
                  multiline
                  className="px-3 py-2 rounded-lg border border-gray-200 min-h-[88px]"
                  style={ta}
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1" style={ta}>
                  topic (saving / investing / budgeting)
                </Text>
                <TextInput
                  value={draft.topic}
                  onChangeText={(v) => setDraft((s) => ({ ...s, topic: v }))}
                  autoCapitalize="none"
                  placeholder="investing"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                  style={ta}
                />
              </Card>

              <View style={rtlRowMerge(rtl, { gap: 8 })}>
                <Card className="w-24 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1" style={ta}>
                    icon
                  </Text>
                  <TextInput
                    value={draft.icon}
                    onChangeText={(v) => setDraft((s) => ({ ...s, icon: v }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-center"
                    style={ta}
                  />
                </Card>
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1" style={ta}>
                    color
                  </Text>
                  <TextInput
                    value={draft.color}
                    onChangeText={(v) => setDraft((s) => ({ ...s, color: v }))}
                    autoCapitalize="none"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                    style={ta}
                  />
                </Card>
              </View>

              <View style={rtlRowMerge(rtl, { gap: 8 })}>
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
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1" style={ta}>
                    coin reward
                  </Text>
                  <TextInput
                    value={draft.coinReward}
                    onChangeText={(v) => setDraft((s) => ({ ...s, coinReward: v }))}
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

