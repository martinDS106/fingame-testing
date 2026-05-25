import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { User } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

import { ScreenHeader } from '@/components/ScreenHeader';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { useT } from '@/hooks/useT';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useUserStore } from '@/stores';

export default function EditProfileScreen() {
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const inputAlign = rtl ? 'right' : 'left';
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const pushSnapshot = useUserStore((s) => s.pushSnapshot);
  const remoteUserId = useUserStore((s) => s.remoteUserId);

  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [avatarImageUri, setAvatarImageUri] = useState(profile.avatarImageUri ?? null);

  const canSave = useMemo(() => name.trim().length > 0, [name]);

  async function save() {
    if (!canSave) return;
    updateProfile({
      name: name.trim(),
      avatar: avatar.trim() || '👤',
      avatarImageUri,
    });
    if (remoteUserId) {
      await pushSnapshot();
    }
    Alert.alert(t('rewards.success'), 'Profile updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader title={t('profile.editProfile')} showBack showBell={false} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 100, gap: 12 })}
        showsVerticalScrollIndicator={false}
      >
        <Card className="border border-gray-200 bg-white" padded>
          <View
            className="mb-2"
            style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}
          >
            <User size={18} color={colors.primary[700]} />
            <Text style={ta} className="text-gray-900 font-semibold">
              {t('profile.editProfile')}
            </Text>
          </View>
          <Text style={ta} className="text-sm text-gray-700">
            Update your display name, avatar emoji, and profile photo.
          </Text>
        </Card>

        <Card className="border border-gray-200 bg-white" padded>
          <Text style={ta} className="text-xs text-gray-500 mb-2">
            Profile photo
          </Text>
          <View
            style={rtlRowMerge(rtl, { alignItems: 'center', gap: 12 })}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.gray[100],
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {avatarImageUri ? (
                <Image
                  source={{ uri: avatarImageUri }}
                  style={{ width: 72, height: 72, borderRadius: 36 }}
                  contentFit="cover"
                />
              ) : (
                <Text className="text-3xl">{avatar || '👤'}</Text>
              )}
            </View>

            <View className="flex-1 gap-2">
              <Button
                variant="outline"
                fullWidth
                onPress={async () => {
                  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (!perm.granted) {
                    Alert.alert('Permission needed', 'Please allow photo access.');
                    return;
                  }
                  const res = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.85,
                  });
                  if (res.canceled) return;
                  const uri = res.assets?.[0]?.uri;
                  if (!uri) return;
                  setAvatarImageUri(uri);
                }}
              >
                Upload from gallery
              </Button>

              {avatarImageUri && (
                <Pressable
                  onPress={() => setAvatarImageUri(null)}
                  className="active:opacity-60"
                >
                  <Text style={ta} className="text-sm text-red-600 font-semibold">
                    Remove photo
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </Card>

        <Card className="border border-gray-200 bg-white" padded>
          <Text style={ta} className="text-xs text-gray-500 mb-1">
            Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Player"
            className="px-3 py-2 rounded-lg border border-gray-200"
            style={{ textAlign: inputAlign, writingDirection: rtl ? 'rtl' : 'ltr' }}
          />
        </Card>

        <Card className="border border-gray-200 bg-white" padded>
          <Text style={ta} className="text-xs text-gray-500 mb-1">
            Avatar (emoji)
          </Text>
          <TextInput
            value={avatar}
            onChangeText={setAvatar}
            placeholder="👤"
            className="px-3 py-2 rounded-lg border border-gray-200"
            style={{ textAlign: inputAlign, writingDirection: rtl ? 'rtl' : 'ltr' }}
          />
        </Card>

        <View style={rtlRowMerge(rtl, { gap: 8 })}>
          <View className="flex-1">
            <Button variant="outline" fullWidth onPress={() => router.back()}>
              Cancel
            </Button>
          </View>
          <View className="flex-1">
            <Button fullWidth onPress={save} disabled={!canSave}>
              Save
            </Button>
          </View>
        </View>

        {!remoteUserId && (
          <Card className="border border-yellow-200 bg-yellow-50" padded>
            <Text style={ta} className="text-sm text-gray-800 font-semibold mb-1">
              Not signed in
            </Text>
            <Text style={ta} className="text-sm text-gray-700">
              Changes will be saved locally. Sign in to sync to the cloud.
            </Text>
          </Card>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}
