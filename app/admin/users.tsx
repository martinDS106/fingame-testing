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
import { Pencil, Shield, Trash2, X } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import { adminPullProfiles, adminUpdateProfile, type RemoteProfile } from '@/lib/syncService';
import { colors } from '@/theme';
import { useUserStore } from '@/stores';

function safeInt(v: string, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export default function AdminUsersScreen() {
  const allowed = useUserStore((s) => s.isAdmin);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<RemoteProfile[]>([]);

  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<RemoteProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [draft, setDraft] = useState({
    displayName: '',
    avatar: '',
    level: 'Beginner',
    coins: '0',
    xp: '0',
    isAdmin: false,
  });

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminPullProfiles(300);
      setUsers(data);
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
    if (!query) return users;
    return users.filter((u) => {
      const hay = `${u.id} ${u.display_name} ${u.level}`.toLowerCase();
      return hay.includes(query);
    });
  }, [users, q]);

  function openEdit(u: RemoteProfile) {
    setEditing(u);
    setDraft({
      displayName: u.display_name ?? '',
      avatar: u.avatar ?? '👤',
      level: u.level ?? 'Beginner',
      coins: String(u.coins ?? 0),
      xp: String(u.xp ?? 0),
      isAdmin: !!u.is_admin,
    });
    setModalOpen(true);
  }

  async function save() {
    if (!editing) return;
    setLoading(true);
    const res = await adminUpdateProfile(editing.id, {
      display_name: draft.displayName.trim() || 'Player',
      avatar: draft.avatar.trim() || '👤',
      level: draft.level as any,
      coins: safeInt(draft.coins, editing.coins ?? 0),
      xp: safeInt(draft.xp, editing.xp ?? 0),
      is_admin: draft.isAdmin,
    });
    setLoading(false);
    if (!res.ok) {
      Alert.alert('Save failed', res.error ?? 'Unknown error');
      return;
    }
    setModalOpen(false);
    await refresh();
  }

  function confirmRevokeAdmin(u: RemoteProfile) {
    Alert.alert('Revoke admin?', u.display_name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Revoke',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const res = await adminUpdateProfile(u.id, { is_admin: false });
          setLoading(false);
          if (!res.ok) {
            Alert.alert('Update failed', res.error ?? 'Unknown error');
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
        title="Users"
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <View className="px-4 pt-3 pb-2">
        <View className="bg-white border border-gray-200 rounded-2xl p-3">
          <Text className="text-xs text-gray-500 mb-1">Search</Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search by id or name…"
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
          visible.map((u) => (
            <PressableCard key={u.id} onPress={() => openEdit(u)}>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center">
                    <Text className="text-xl">{u.avatar ?? '👤'}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-gray-900 font-semibold" numberOfLines={1}>
                        {u.display_name}
                      </Text>
                      {u.is_admin && (
                        <View className="px-2 py-0.5 rounded bg-gray-900">
                          <Text className="text-xs text-white font-semibold">ADMIN</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                      {u.id} · coins: {u.coins} · xp: {u.xp}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  {u.is_admin && (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        confirmRevokeAdmin(u);
                      }}
                      hitSlop={8}
                      className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 items-center justify-center"
                    >
                      <Shield size={16} color="#ef4444" />
                    </Pressable>
                  )}
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      openEdit(u);
                    }}
                    hitSlop={8}
                    className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 items-center justify-center"
                  >
                    <Pencil size={16} color={colors.primary[700]} />
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
              <Text className="text-lg text-gray-900 font-semibold">Edit user</Text>
              <Pressable onPress={() => setModalOpen(false)} hitSlop={8}>
                <X size={20} color={colors.gray[600]} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={{ paddingBottom: 16, gap: 10 }}
              showsVerticalScrollIndicator={false}
            >
              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1">display name</Text>
                <TextInput
                  value={draft.displayName}
                  onChangeText={(v) => setDraft((s) => ({ ...s, displayName: v }))}
                  className="px-3 py-2 rounded-lg border border-gray-200"
                />
              </Card>

              <View className="flex-row gap-2">
                <Card className="w-24 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1">avatar</Text>
                  <TextInput
                    value={draft.avatar}
                    onChangeText={(v) => setDraft((s) => ({ ...s, avatar: v }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-center"
                  />
                </Card>
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1">level</Text>
                  <TextInput
                    value={draft.level}
                    onChangeText={(v) => setDraft((s) => ({ ...s, level: v }))}
                    className="px-3 py-2 rounded-lg border border-gray-200"
                  />
                </Card>
              </View>

              <View className="flex-row gap-2">
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1">coins</Text>
                  <TextInput
                    value={draft.coins}
                    onChangeText={(v) => setDraft((s) => ({ ...s, coins: v }))}
                    keyboardType="numeric"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                  />
                </Card>
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1">xp</Text>
                  <TextInput
                    value={draft.xp}
                    onChangeText={(v) => setDraft((s) => ({ ...s, xp: v }))}
                    keyboardType="numeric"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                  />
                </Card>
              </View>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-2">admin</Text>
                <View className="flex-row gap-2">
                  <Button
                    size="sm"
                    variant={draft.isAdmin ? 'primary' : 'outline'}
                    onPress={() => setDraft((s) => ({ ...s, isAdmin: true }))}
                  >
                    Yes
                  </Button>
                  <Button
                    size="sm"
                    variant={!draft.isAdmin ? 'primary' : 'outline'}
                    onPress={() => setDraft((s) => ({ ...s, isAdmin: false }))}
                  >
                    No
                  </Button>
                </View>
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

