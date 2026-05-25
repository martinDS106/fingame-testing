import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme';
import { isApiConfigured } from '@/lib/api';
import {
  adminDeleteFinTokVideo,
  adminPullFinTokVideos,
  adminUpsertFinTokVideo,
  type RemoteFinTokVideo,
} from '@/lib/syncServiceApi';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';

function safeJsonTags(input: string): string[] {
  const raw = input.trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AdminFinTokScreen() {
  const { rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<RemoteFinTokVideo[]>([]);
  const [query, setQuery] = useState('');

  const [editing, setEditing] = useState<RemoteFinTokVideo | null>(null);

  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [creatorName, setCreatorName] = useState('Fin-Game Team');
  const [creatorNameAr, setCreatorNameAr] = useState('فريق Fin-Game');
  const [creatorAvatar, setCreatorAvatar] = useState('👨‍🏫');
  const [caption, setCaption] = useState('');
  const [captionAr, setCaptionAr] = useState('');
  const [tags, setTags] = useState('budget, tips');
  const [simulationRoute, setSimulationRoute] = useState('/simulation-hub');
  const [sortOrder, setSortOrder] = useState('0');
  const [published, setPublished] = useState(true);

  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [pickedMime, setPickedMime] = useState<string | null>(null);

  async function refresh() {
    if (isApiConfigured) {
      setVideos([]);
      Alert.alert(
        'Not supported',
        'FinTok admin is not available in MySQL API mode yet.'
      );
      return;
    }
    setLoading(true);
    try {
      const rows = await adminPullFinTokVideos(500);
      setVideos(rows);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return videos;
    return videos.filter((v) => {
      const hay = [
        v.title,
        v.title_ar,
        v.creator_name,
        v.creator_name_ar,
        v.caption,
        v.caption_ar,
        v.storage_path,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [videos, query]);

  function openNew() {
    setEditing(null);
    setTitle('');
    setTitleAr('');
    setCreatorName('Fin-Game Team');
    setCreatorNameAr('فريق Fin-Game');
    setCreatorAvatar('👨‍🏫');
    setCaption('');
    setCaptionAr('');
    setTags('');
    setSimulationRoute('/simulation-hub');
    setSortOrder('0');
    setPublished(true);
    setPickedUri(null);
    setPickedMime(null);
  }

  function openEdit(v: RemoteFinTokVideo) {
    setEditing(v);
    setTitle(v.title);
    setTitleAr(v.title_ar || '');
    setCreatorName(v.creator_name || 'Fin-Game Team');
    setCreatorNameAr(v.creator_name_ar || '');
    setCreatorAvatar(v.creator_avatar || '👨‍🏫');
    setCaption(v.caption || '');
    setCaptionAr(v.caption_ar || '');
    setTags((v.tags || []).join(', '));
    setSimulationRoute(v.simulation_route || '/simulation-hub');
    setSortOrder(String(v.sort_order ?? 0));
    setPublished(Boolean(v.is_published));
    setPickedUri(null);
    setPickedMime(null);
  }

  async function pickVideo() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });
    if (res.canceled) return;
    const asset = res.assets?.[0];
    if (!asset?.uri) return;
    setPickedUri(asset.uri);
    setPickedMime(asset.mimeType ?? null);
    const hint =
      asset.mimeType?.includes('quicktime') || asset.uri.toLowerCase().endsWith('.mov')
        ? '\n\nTip: If playback fails, export as MP4 (H.264/AAC) instead of MOV/HEVC.'
        : '';
    Alert.alert('Picked', `Video selected. Now press Save to upload.${hint}`);
  }

  async function uploadToStorage(
    uri: string
  ): Promise<{ ok: boolean; path?: string; error?: string }> {
    if (isApiConfigured) {
      void uri;
      return { ok: false, error: 'FinTok storage is not supported in API mode.' };
    }
    try {
      const lowerUri = uri.toLowerCase();
      const inferredExt =
        (pickedMime?.includes('quicktime') || lowerUri.endsWith('.mov')) ? 'mov' :
        lowerUri.endsWith('.mp4') ? 'mp4' :
        lowerUri.endsWith('.m4v') ? 'm4v' :
        'mp4';

      const inferredType =
        pickedMime ||
        (inferredExt === 'mov' ? 'video/quicktime' : 'video/mp4');

      const ext = inferredExt;
      const fileName = `videos/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
      const resp = await fetch(uri);
      const blob = await resp.blob();

      void fileName;
      void blob;
      void inferredType;
      return { ok: false, error: 'FinTok storage is not supported in API mode.' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Upload failed' };
    }
  }

  async function save() {
    const t = title.trim();
    if (!t) {
      Alert.alert('Missing title', 'Please enter a title.');
      return;
    }

    setLoading(true);
    try {
      let storagePath = editing?.storage_path ?? '';
      if (pickedUri) {
        const upload = await uploadToStorage(pickedUri);
        if (!upload.ok || !upload.path) {
          Alert.alert('Upload failed', upload.error || 'Unknown error');
          return;
        }
        storagePath = upload.path;
      }

      if (!storagePath) {
        Alert.alert('Missing video', 'Pick a video to upload (or edit an existing row).');
        return;
      }

      const payload = {
        ...(editing ? { id: editing.id } : {}),
        title: t,
        title_ar: titleAr.trim() || null,
        creator_name: creatorName.trim() || 'Fin-Game Team',
        creator_name_ar: creatorNameAr.trim() || null,
        creator_avatar: creatorAvatar.trim() || '👨‍🏫',
        caption: caption.trim() || null,
        caption_ar: captionAr.trim() || null,
        tags: safeJsonTags(tags),
        simulation_route: simulationRoute.trim() || null,
        storage_bucket: 'fintok',
        storage_path: storagePath,
        video_url: null,
        sort_order: Number(sortOrder || 0) || 0,
        is_published: published,
        published_at: published ? new Date().toISOString() : null,
      };

      const res = await adminUpsertFinTokVideo(payload as any);
      if (!res.ok) {
        Alert.alert('Save failed', res.error || 'Unknown error');
        return;
      }

      await refresh();
      setPickedUri(null);
      setPickedMime(null);
      if (!editing && res.id) {
        const created = videos.find((v) => v.id === res.id) ?? null;
        setEditing(created);
      }
      Alert.alert('Saved', 'FinTok video updated.');
    } finally {
      setLoading(false);
    }
  }

  async function remove(row: RemoteFinTokVideo) {
    Alert.alert('Delete video?', 'This will delete the DB row (and tries storage).', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const db = await adminDeleteFinTokVideo(row.id);
            if (!db.ok) {
              Alert.alert('Delete failed', db.error || 'Unknown error');
              return;
            }
            // storage delete not supported in API mode
            await refresh();
            if (editing?.id === row.id) openNew();
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title="Admin • FinTok"
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <ScrollView
        className="flex-1"
        style={rtlRootDirection(rtl)}
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 24, gap: 12 })}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <Text className="text-gray-900 font-semibold mb-2" style={ta}>
            FinTok videos
          </Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search…"
            placeholderTextColor="#9ca3af"
            style={[
              ta,
              {
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
              },
            ]}
          />
          <View className="mt-3" style={rtlRowMerge(rtl, { gap: 8 })}>
            <Button fullWidth onPress={openNew}>
              New
            </Button>
          </View>
        </Card>

        <Card>
          <Text className="text-gray-900 font-semibold mb-3" style={ta}>
            {editing ? 'Edit video' : 'Create video'}
          </Text>
          <Text className="text-xs text-gray-600 mb-3" style={ta}>
            Tip: Press &quot;New&quot; to create a new video. If you edit an existing row, Save will
            replace that video.
          </Text>

          <View style={{ gap: 10 }}>
            <View>
              <Text className="text-xs text-gray-600 mb-1" style={ta}>
                Title (EN)
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Title"
                placeholderTextColor="#9ca3af"
                style={[
                  ta,
                  {
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  },
                ]}
              />
            </View>

            <View>
              <Text className="text-xs text-gray-600 mb-1" style={ta}>
                Title (AR)
              </Text>
              <TextInput
                value={titleAr}
                onChangeText={setTitleAr}
                placeholder="العنوان"
                placeholderTextColor="#9ca3af"
                style={[
                  ta,
                  {
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  },
                ]}
              />
            </View>

            <View style={rtlRowMerge(rtl, { gap: 8 })}>
              <View style={{ flex: 1 }}>
                <Text className="text-xs text-gray-600 mb-1" style={ta}>
                  Creator (EN)
                </Text>
                <TextInput
                  value={creatorName}
                  onChangeText={setCreatorName}
                  placeholder="Creator name"
                  placeholderTextColor="#9ca3af"
                  style={[
                    ta,
                    {
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    },
                  ]}
                />
              </View>
              <View style={{ width: 70 }}>
                <Text className="text-xs text-gray-600 mb-1" style={ta}>
                  Avatar
                </Text>
                <TextInput
                  value={creatorAvatar}
                  onChangeText={setCreatorAvatar}
                  placeholder="👨‍🏫"
                  placeholderTextColor="#9ca3af"
                  style={[
                    ta,
                    {
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      textAlign: 'center',
                    },
                  ]}
                />
              </View>
            </View>

            <View>
              <Text className="text-xs text-gray-600 mb-1" style={ta}>
                Creator (AR)
              </Text>
              <TextInput
                value={creatorNameAr}
                onChangeText={setCreatorNameAr}
                placeholder="اسم المُعلم"
                placeholderTextColor="#9ca3af"
                style={[
                  ta,
                  {
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  },
                ]}
              />
            </View>

            <View>
              <Text className="text-xs text-gray-600 mb-1" style={ta}>
                Caption (EN)
              </Text>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="Caption"
                placeholderTextColor="#9ca3af"
                multiline
                style={[
                  ta,
                  {
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    minHeight: 70,
                  },
                ]}
              />
            </View>

            <View>
              <Text className="text-xs text-gray-600 mb-1" style={ta}>
                Caption (AR)
              </Text>
              <TextInput
                value={captionAr}
                onChangeText={setCaptionAr}
                placeholder="الوصف"
                placeholderTextColor="#9ca3af"
                multiline
                style={[
                  ta,
                  {
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    minHeight: 70,
                  },
                ]}
              />
            </View>

            <View>
              <Text className="text-xs text-gray-600 mb-1" style={ta}>
                Tags (comma separated)
              </Text>
              <TextInput
                value={tags}
                onChangeText={setTags}
                placeholder="budget, investing, credit"
                placeholderTextColor="#9ca3af"
                style={[
                  ta,
                  {
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  },
                ]}
              />
            </View>

            <View style={rtlRowMerge(rtl, { gap: 8 })}>
              <View style={{ flex: 1 }}>
                <Text className="text-xs text-gray-600 mb-1" style={ta}>
                  Simulation route
                </Text>
                <TextInput
                  value={simulationRoute}
                  onChangeText={setSimulationRoute}
                  placeholder="/simulation/banking"
                  placeholderTextColor="#9ca3af"
                  style={[
                    ta,
                    {
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    },
                  ]}
                />
              </View>
              <View style={{ width: 90 }}>
                <Text className="text-xs text-gray-600 mb-1" style={ta}>
                  Sort
                </Text>
                <TextInput
                  value={sortOrder}
                  onChangeText={setSortOrder}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  style={[
                    ta,
                    {
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      textAlign: 'center',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={rtlRowMerge(rtl, { gap: 8 })}>
              <Button variant="outline" fullWidth onPress={pickVideo}>
                {pickedUri ? 'Video picked' : 'Pick video'}
              </Button>
              <Button
                variant={published ? 'secondary' : 'outline'}
                fullWidth
                onPress={() => setPublished((v) => !v)}
              >
                {published ? 'Published' : 'Draft'}
              </Button>
            </View>

            {!!pickedUri && (
              <Text className="text-xs text-gray-600" style={ta}>
                Selected: {pickedUri.split('/').pop() ?? pickedUri}
              </Text>
            )}

            <Button fullWidth onPress={save} disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </Button>
          </View>
        </Card>

        <Card>
          <Text className="text-gray-900 font-semibold mb-2" style={ta}>
            Library ({filtered.length})
          </Text>
          {filtered.map((v) => (
            <View key={v.id} className="py-2 border-t border-gray-100">
              <Text className="text-sm text-gray-900 font-medium" numberOfLines={1} style={ta}>
                {v.title}
              </Text>
              <Text className="text-xs text-gray-500" numberOfLines={1} style={ta}>
                {v.is_published ? 'Published' : 'Draft'} · sort {v.sort_order} ·{' '}
                {v.storage_path}
              </Text>
              <View className="mt-2" style={rtlRowMerge(rtl, { gap: 8 })}>
                <Button size="sm" variant="outline" onPress={() => openEdit(v)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline" onPress={() => remove(v)}>
                  Delete
                </Button>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

