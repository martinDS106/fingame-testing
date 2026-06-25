import { Image } from 'expo-image';
import { View } from 'react-native';

import { getAvatarPreset } from '@/lib/avatarPresets';

type ProfileAvatarProps = {
  avatar: string;
  avatarImageUri?: string | null;
  size?: number;
};

export function ProfileAvatar({
  avatar,
  avatarImageUri,
  size = 48,
}: ProfileAvatarProps) {
  if (avatarImageUri) {
    return (
      <Image
        source={{ uri: avatarImageUri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
      />
    );
  }

  const preset = getAvatarPreset(avatar);
  const Icon = preset.icon;
  const iconSize = Math.round(size * 0.48);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: preset.backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={iconSize} color={preset.iconColor} strokeWidth={2.2} />
    </View>
  );
}
