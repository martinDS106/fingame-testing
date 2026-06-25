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

import { AdminUserEditForm } from '@/components/admin/AdminUserEditForm';
import { AvatarPickerModal } from '@/components/profile/AvatarPickerModal';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import {
  adminDraftToPatch,
  remoteProfileToAdminDraft,
  type AdminUserDraft,
} from '@/lib/adminUserDraft';
import { adminPullProfiles, adminUpdateProfile, type RemoteProfile } from '@/lib/syncServiceApi';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { colors } from '@/theme';
import { useUserStore } from '@/stores';

const EMPTY_DRAFT: AdminUserDraft = {
  displayName: '',
  avatar: 'default',
  level: 'Beginner',
  coins: '0',
  xp: '0',
  streak: '0',
  longestStreak: '0',
  isAdmin: false,
  mobile: '',
  governorate: '',
  city: '',
  gender: '',
  dateOfBirth: '',
  userType: '',
  schoolName: '',
  facultyMajor: '',
  academicYear: '',
  employer: '',
  monthlyIncomeRange: '',
  financialGoals: '',
  financialLiteracy: '',
  persona: '',
  parentEmail: '',
  parentPhone: '',
  referredByCode: '',
  referralOnboardingPending: false,
};

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
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [draft, setDraft] = useState<AdminUserDraft>(EMPTY_DRAFT);

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
    setDraft(remoteProfileToAdminDraft(u));
    setModalOpen(true);
  }

  async function save() {
    if (!editing) return;
    setLoading(true);
    const res = await adminUpdateProfile(editing.id, adminDraftToPatch(draft));
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

        {!error && visible.length === 0 && !loading && (
          <Card>
            <Text className="text-sm text-gray-600" style={ta}>
              No users loaded. Check API URL and admin login, then tap Refresh.
            </Text>
          </Card>
        )}

        {!error &&
          visible.map((u) => (
            <PressableCard key={u.id} onPress={() => openEdit(u)}>
              <View
                style={rtlRowMerge(rtl, {
                  alignItems: 'center',
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
                      {u.email ?? u.id}
                    </Text>
                    <Text className="text-xs text-gray-400" numberOfLines={1} style={ta}>
                      coins: {u.coins} · xp: {u.xp} · 🔥 {u.streak}
                    </Text>
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
            className="bg-white rounded-t-3xl p-4 max-h-[92%]"
            onPress={(e) => e.stopPropagation()}
          >
            <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 })}>
              <Text className="text-lg text-gray-900 font-semibold" style={ta}>
                User profile
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
                <AdminUserEditForm
                  rtl={rtl}
                  editing={editing}
                  draft={draft}
                  onChange={(patch) => setDraft((s) => ({ ...s, ...patch }))}
                  onPickAvatar={() => setAvatarPickerOpen(true)}
                />
              )}

              <View style={rtlRowMerge(rtl, { gap: 8, marginTop: 4 })}>
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

      <AvatarPickerModal
        visible={avatarPickerOpen}
        rtl={rtl}
        selected={draft.avatar || 'default'}
        title="Choose avatar"
        onClose={() => setAvatarPickerOpen(false)}
        onSelect={(avatarId) => {
          setDraft((s) => ({ ...s, avatar: avatarId }));
          setAvatarPickerOpen(false);
        }}
      />
    </View>
  );
}
