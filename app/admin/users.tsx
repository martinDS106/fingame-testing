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
import { Pencil, Shield, X } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import { adminPullProfiles, adminUpdateProfile, type RemoteProfile } from '@/lib/syncServiceApi';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { colors } from '@/theme';
import { useUserStore } from '@/stores';

function safeInt(v: string, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function fmtField(v: string | null | undefined): string {
  const s = v?.trim();
  return s ? s : '—';
}

function AdminReadOnlyRow({ label, value, rtl }: { label: string; value: string; rtl: boolean }) {
  const ta = rtlTextStyle(rtl);
  return (
    <View>
      <Text className="text-xs text-gray-500 mb-0.5" style={ta}>
        {label}
      </Text>
      <Text className="text-sm text-gray-900" style={ta} selectable>
        {value}
      </Text>
    </View>
  );
}

export default function AdminUsersScreen() {
  const { rtl } = useT();
  const ta = rtlTextStyle(rtl);
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
      const hay = [
        u.id,
        u.display_name,
        u.level,
        u.email,
        u.referral_code,
        u.referred_by_code,
        u.mobile,
        u.governorate,
        u.city,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(query);
    });
  }, [users, q]);

  function openEdit(u: RemoteProfile) {
    setEditing(u);
    setDraft({
      displayName: u.display_name ?? '',
      avatar: u.avatar ?? 'default',
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
        title="Users"
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <View className="px-4 pt-3 pb-2">
        <View className="bg-white border border-gray-200 rounded-2xl p-3">
          <Text className="text-xs text-gray-500 mb-1" style={ta}>
            Search
          </Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search by name, email, referral code…"
            autoCapitalize="none"
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
          visible.map((u) => (
            <PressableCard key={u.id} onPress={() => openEdit(u)}>
              <View
                style={rtlRowMerge(rtl, {
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                })}
              >
                <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 12, flex: 1 })}>
                  <ProfileAvatar avatar={u.avatar || 'default'} size={40} />
                  <View className="flex-1">
                    <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}>
                      <Text className="text-gray-900 font-semibold" numberOfLines={1} style={ta}>
                        {u.display_name}
                      </Text>
                      {u.is_admin && (
                        <View className="px-2 py-0.5 rounded bg-gray-900">
                          <Text className="text-xs text-white font-semibold" style={ta}>
                            ADMIN
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs text-gray-500" numberOfLines={1} style={ta}>
                      {u.email ?? u.id} · coins: {u.coins} · xp: {u.xp} · 🔥 {u.streak}
                    </Text>
                    {(u.referral_code || u.referred_by_code) && (
                      <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1} style={ta}>
                        code: {fmtField(u.referral_code)}
                        {u.referred_by_code ? ` · referred by: ${u.referred_by_code}` : ''}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}>
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
            <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 })}>
              <Text className="text-lg text-gray-900 font-semibold" style={ta}>
                Edit user
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
              {editing && (
                <Card className="border border-gray-200" padded>
                  <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 12, marginBottom: 12 })}>
                    <ProfileAvatar avatar={editing.avatar || 'default'} size={48} />
                    <View className="flex-1">
                      <Text className="text-gray-900 font-semibold" style={ta}>
                        {editing.display_name}
                      </Text>
                      <Text className="text-xs text-gray-500" style={ta}>
                        {editing.email ?? editing.id}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-800 font-semibold mb-2" style={ta}>
                    Profile & referral (read-only)
                  </Text>
                  <View className="gap-2">
                    <AdminReadOnlyRow label="User id" value={editing.id} rtl={rtl} />
                    <AdminReadOnlyRow label="Email" value={fmtField(editing.email)} rtl={rtl} />
                    <AdminReadOnlyRow label="Referral code" value={fmtField(editing.referral_code)} rtl={rtl} />
                    <AdminReadOnlyRow label="Referred by code" value={fmtField(editing.referred_by_code)} rtl={rtl} />
                    <AdminReadOnlyRow
                      label="Referral onboarding pending"
                      value={editing.referral_onboarding_pending ? 'Yes' : 'No'}
                      rtl={rtl}
                    />
                    <AdminReadOnlyRow label="Governorate" value={fmtField(editing.governorate)} rtl={rtl} />
                    <AdminReadOnlyRow label="City" value={fmtField(editing.city)} rtl={rtl} />
                    <AdminReadOnlyRow label="Mobile" value={fmtField(editing.mobile)} rtl={rtl} />
                    <AdminReadOnlyRow label="User type" value={fmtField(editing.user_type)} rtl={rtl} />
                    <AdminReadOnlyRow label="School" value={fmtField(editing.school_name)} rtl={rtl} />
                    <AdminReadOnlyRow label="Faculty / major" value={fmtField(editing.faculty_major)} rtl={rtl} />
                    <AdminReadOnlyRow label="Academic year" value={fmtField(editing.academic_year)} rtl={rtl} />
                    <AdminReadOnlyRow label="Employer" value={fmtField(editing.employer)} rtl={rtl} />
                    <AdminReadOnlyRow
                      label="Monthly income"
                      value={fmtField(editing.monthly_income_range)}
                      rtl={rtl}
                    />
                    <AdminReadOnlyRow
                      label="Financial goals"
                      value={
                        editing.financial_goals?.length
                          ? editing.financial_goals.join(', ')
                          : '—'
                      }
                      rtl={rtl}
                    />
                    <AdminReadOnlyRow
                      label="Financial literacy"
                      value={fmtField(editing.financial_literacy)}
                      rtl={rtl}
                    />
                    <AdminReadOnlyRow label="Persona" value={fmtField(editing.persona)} rtl={rtl} />
                    <AdminReadOnlyRow label="Streak" value={String(editing.streak ?? 0)} rtl={rtl} />
                    <AdminReadOnlyRow
                      label="Longest streak"
                      value={String(editing.longest_streak ?? 0)}
                      rtl={rtl}
                    />
                    <AdminReadOnlyRow
                      label="Profile completed"
                      value={fmtField(editing.profile_completed_at)}
                      rtl={rtl}
                    />
                    <AdminReadOnlyRow label="Joined" value={fmtField(editing.created_at)} rtl={rtl} />
                  </View>
                </Card>
              )}

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-1" style={ta}>
                  display name
                </Text>
                <TextInput
                  value={draft.displayName}
                  onChangeText={(v) => setDraft((s) => ({ ...s, displayName: v }))}
                  className="px-3 py-2 rounded-lg border border-gray-200"
                  style={ta}
                />
              </Card>

              <View style={rtlRowMerge(rtl, { gap: 8 })}>
                <Card className="w-24 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1" style={ta}>
                    avatar
                  </Text>
                  <TextInput
                    value={draft.avatar}
                    onChangeText={(v) => setDraft((s) => ({ ...s, avatar: v }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-center"
                    style={ta}
                  />
                </Card>
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1" style={ta}>
                    level
                  </Text>
                  <TextInput
                    value={draft.level}
                    onChangeText={(v) => setDraft((s) => ({ ...s, level: v }))}
                    className="px-3 py-2 rounded-lg border border-gray-200"
                    style={ta}
                  />
                </Card>
              </View>

              <View style={rtlRowMerge(rtl, { gap: 8 })}>
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1" style={ta}>
                    coins
                  </Text>
                  <TextInput
                    value={draft.coins}
                    onChangeText={(v) => setDraft((s) => ({ ...s, coins: v }))}
                    keyboardType="numeric"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                    style={ta}
                  />
                </Card>
                <Card className="flex-1 border border-gray-200" padded>
                  <Text className="text-xs text-gray-500 mb-1" style={ta}>
                    xp
                  </Text>
                  <TextInput
                    value={draft.xp}
                    onChangeText={(v) => setDraft((s) => ({ ...s, xp: v }))}
                    keyboardType="numeric"
                    className="px-3 py-2 rounded-lg border border-gray-200"
                    style={ta}
                  />
                </Card>
              </View>

              <Card className="border border-gray-200" padded>
                <Text className="text-xs text-gray-500 mb-2" style={ta}>
                  admin
                </Text>
                <View style={rtlRowMerge(rtl, { gap: 8 })}>
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

