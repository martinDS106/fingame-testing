import { Image } from 'expo-image';
import { Platform, Text, View } from 'react-native';

import { avatarPresetEmoji, getAvatarPreset } from '@/lib/avatarPresets';

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
  const shellStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: preset.backgroundColor,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  // Lucide SVG icons often fail on Expo static web export — use emoji in a colored circle.
  if (Platform.OS === 'web') {
    return (
      <View style={shellStyle}>
        <Text style={{ fontSize: Math.round(size * 0.46), lineHeight: Math.round(size * 0.52) }}>
          {avatarPresetEmoji(avatar)}
        </Text>
      </View>
    );
  }

  const Icon = preset.icon;
  const iconSize = Math.round(size * 0.48);

  return (
    <View style={shellStyle}>
      <Icon size={iconSize} color={preset.iconColor} strokeWidth={2.2} />
    </View>
  );
}
