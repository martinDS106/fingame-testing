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
  deleteVideo,
  pullVideos,
  upsertVideo,
  type RemoteVideo,
  type VideoUpsert,
} from '@/lib/syncServiceApi';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import * as ImagePicker from 'expo-image-picker';
import { getApiBaseUrl, getApiAccessToken } from '@/lib/api';
import { colors } from '@/theme';
import { useContentStore, useUserStore } from '@/stores';

function safeInt(v: string, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function normalizeId(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, '-');
}

export default function AdminVideosScreen() {
  const { rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const allowed = useUserStore((s) => s.isAdmin);
  const syncContent = useContentStore((s) => s.syncFromCloud);
  const params = useLocalSearchParams<{ lessonId?: string }>();
  const lessonIdParam = (params.lessonId ?? '').toString();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<RemoteVideo[]>([]);

  const [lessonId, setLessonId] = useState(lessonIdParam);
  const [q, setQ] = useState('');

  const [editing, setEditing] = useState<RemoteVideo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    id: '',
    lessonId: '',
    title: '',
    titleAr: '',
    url: '',
    thumbnail: '',
    duration: '0',
    sortOrder: '1',
  });

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await pullVideos(lessonId.trim() || undefined);
      setVideos(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!allowed) return;
    setLessonId(lessonIdParam);
     
  }, [allowed, lessonIdParam]);

  useEffect(() => {
    if (!allowed) return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, lessonId]);

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return videos;
    return videos.filter((v) => {
      const hay = `${v.id} ${v.title} ${v.title_ar ?? ''} ${v.lesson_id}`.toLowerCase();
      return hay.includes(query);
    });
  }, [videos, q]);

  function openCreate() {
    setEditing(null);
    setDraft({
      id: '',
      lessonId: lessonId.trim(),
      title: '',
      titleAr: '',
      url: '',
      thumbnail: '',
      duration: '0',
      sortOrder: String(videos.length + 1),
    });
    setModalOpen(true);
  }

  function openEdit(v: RemoteVideo) {
    setEditing(v);
    setDraft({
      id: v.id,
      lessonId: v.lesson_id,
      title: v.title,
      titleAr: v.title_ar ?? '',
      url: v.url,
      thumbnail: v.thumbnail ?? '',
      duration: String(v.duration_seconds ?? 0),
      sortOrder: String(v.sort_order ?? 0),
    });
    setModalOpen(true);
  }

  async function save() {
    const id = normalizeId(draft.id || draft.title);
    const lId = draft.lessonId.trim();
    if (!id) {
      Alert.alert('Missing id', 'Please enter an id or a title.');
      return;
    }
    if (!lId) {
      Alert.alert('Missing lesson id', 'Lesson id is required.');
      return;
    }
    if (!draft.title.trim() || !draft.url.trim()) {
      Alert.alert('Missing fields', 'Title and URL are required.');
      return;
    }

    const payload: VideoUpsert = {
      id,
      lesson_id: lId,
      title: draft.title.trim(),
      title_ar: draft.titleAr.trim() ? draft.titleAr.trim() : null,
      url: draft.url.trim(),
      thumbnail: draft.thumbnail.trim() ? draft.thumbnail.trim() : null,
      duration_seconds: safeInt(draft.duration, 0),
      sort_order: safeInt(draft.sortOrder, videos.length + 1),
    };

    setLoading(true);
    const res = await upsertVideo(payload);
    setLoading(false);
    if (!res.ok) {
      Alert.alert('Save failed', res.error ?? 'Unknown error');
      return;
    }
    setModalOpen(false);
    await refresh();
    // Refresh in-app content store so user screens reflect changes immediately.
    void syncContent();
  }

  async function pickAndUploadVideo() {
    try {
      const token = getApiAccessToken();
      const base = getApiBaseUrl();
      if (!token || !base) {
        Alert.alert('Not signed in', 'Please sign in again.');
        return;
      }

      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: false,
        quality: 1,
      });
      if (picked.canceled) return;
      const asset = picked.assets?.[0];
      if (!asset?.uri) return;

      setLoading(true);
      setError(null);

      const form = new FormData();
      form.append('file', {
        uri: asset.uri,
        name: asset.fileName ?? 'video.mp4',
        type: asset.mimeType ?? 'video/mp4',
      } as any);

      const res = await fetch(`${base}/admin/videos/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const json = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !json.ok || !json.url) {
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }

      setDraft((d) => ({ ...d, url: `${base}${json.url}` }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setError(msg);
      Alert.alert('Upload failed', msg);
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete(v: RemoteVideo) {
    Alert.alert('Delete video?', v.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const res = await deleteVideo(v.id);
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
        title="Videos"
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <View className="px-4 pt-3 pb-2">
        <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between' })}>
          <View>
            <Text className="text-xs text-gray-500" style={ta}>
              Lesson filter
            </Text>
            <TextInput
              value={lessonId}
              onChangeText={setLessonId}
              placeholder="ib-1"
              autoCapitalize="none"
              editable={!lessonIdParam}
              className={`px-3 py-2 rounded-lg border border-gray-200 min-w-[140px] ${
                lessonIdParam ? 'bg-gray-100 text-gray-600' : 'bg-white'
              }`}
              style={ta}
            />
          </View>
          <View className="gap-2">
            {!lessonIdParam && (
              <Button
                variant="outline"
                size="sm"
                onPress={refresh}
                disabled={loading}
              >
                Load
              </Button>
            )}
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
          visible.map((v) => (
            <PressableCard key={v.id} onPress={() => openEdit(v)}>
              <View
                style={rtlRowMerge(rtl, {
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                })}
              >
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold" numberOfLines={1} style={ta}>
                    {v.title}
                  </Text>
                  <Text className="text-xs text-gray-500" numberOfLines={1} style={ta}>
                    {v.id} · lesson: {v.lesson_id} · order: {v.sort_order}
                  </Text>
                  <Text className="text-xs text-gray-500" numberOfLines={1} style={ta}>
                    {v.url}
                  </Text>
                </View>

                <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      openEdit(v);
                    }}
                    hitSlop={8}
                    className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 items-center justify-center"
                  >
                    <Pencil size={16} color={colors.primary[700]} />
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      confirmDelete(v);
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
                {editing ? 'Edit video' : 'New video'}
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
                  placeholder="v-ib-1"
                  autoCapitalize="none"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                  style={ta}
                />
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1" style={ta}>
                  lesson id
                </Text>
                <TextInput
                  value={draft.lessonId}
                  onChangeText={(v) => setDraft((s) => ({ ...s, lessonId: v }))}
                  placeholder="ib-1"
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
                  url
                </Text>
                <TextInput
                  value={draft.url}
                  onChangeText={(v) => setDraft((s) => ({ ...s, url: v }))}
                  autoCapitalize="none"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                  style={ta}
                />
                <View className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={pickAndUploadVideo}
                    disabled={loading}
                  >
                    Upload video file
                  </Button>
                </View>
              </Card>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1" style={ta}>
                  thumbnail (optional)
                </Text>
                <TextInput
                  value={draft.thumbnail}
                  onChangeText={(v) => setDraft((s) => ({ ...s, thumbnail: v }))}
                  autoCapitalize="none"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                  style={ta}
                />
              </Card>

              <View style={rtlRowMerge(rtl, { gap: 8 })}>
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1" style={ta}>
                    duration (sec)
                  </Text>
                  <TextInput
                    value={draft.duration}
                    onChangeText={(v) => setDraft((s) => ({ ...s, duration: v }))}
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

