import type { LucideIcon } from 'lucide-react-native';
import {
  Briefcase,
  Cat,
  Gamepad2,
  GraduationCap,
  Rocket,
  Star,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  Wallet,
} from 'lucide-react-native';

export type AvatarPresetId =
  | 'default'
  | 'gamer'
  | 'investor'
  | 'saver'
  | 'champion'
  | 'explorer'
  | 'star'
  | 'focused'
  | 'student'
  | 'professional'
  | 'mascot';

export type AvatarPreset = {
  id: AvatarPresetId;
  icon: LucideIcon;
  backgroundColor: string;
  iconColor: string;
  labelKey: string;
};

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'default',
    icon: UserRound,
    backgroundColor: '#dbeafe',
    iconColor: '#1d4ed8',
    labelKey: 'profile.avatarPreset.default',
  },
  {
    id: 'gamer',
    icon: Gamepad2,
    backgroundColor: '#ede9fe',
    iconColor: '#6d28d9',
    labelKey: 'profile.avatarPreset.gamer',
  },
  {
    id: 'investor',
    icon: TrendingUp,
    backgroundColor: '#dcfce7',
    iconColor: '#15803d',
    labelKey: 'profile.avatarPreset.investor',
  },
  {
    id: 'saver',
    icon: Wallet,
    backgroundColor: '#fef3c7',
    iconColor: '#b45309',
    labelKey: 'profile.avatarPreset.saver',
  },
  {
    id: 'champion',
    icon: Trophy,
    backgroundColor: '#fef9c3',
    iconColor: '#a16207',
    labelKey: 'profile.avatarPreset.champion',
  },
  {
    id: 'explorer',
    icon: Rocket,
    backgroundColor: '#e0e7ff',
    iconColor: '#4338ca',
    labelKey: 'profile.avatarPreset.explorer',
  },
  {
    id: 'star',
    icon: Star,
    backgroundColor: '#ffedd5',
    iconColor: '#c2410c',
    labelKey: 'profile.avatarPreset.star',
  },
  {
    id: 'focused',
    icon: Target,
    backgroundColor: '#fee2e2',
    iconColor: '#b91c1c',
    labelKey: 'profile.avatarPreset.focused',
  },
  {
    id: 'student',
    icon: GraduationCap,
    backgroundColor: '#cffafe',
    iconColor: '#0e7490',
    labelKey: 'profile.avatarPreset.student',
  },
  {
    id: 'professional',
    icon: Briefcase,
    backgroundColor: '#e2e8f0',
    iconColor: '#334155',
    labelKey: 'profile.avatarPreset.professional',
  },
  {
    id: 'mascot',
    icon: Cat,
    backgroundColor: '#fce7f3',
    iconColor: '#be185d',
    labelKey: 'profile.avatarPreset.mascot',
  },
];

const PRESET_BY_ID = Object.fromEntries(
  AVATAR_PRESETS.map((p) => [p.id, p]),
) as Record<AvatarPresetId, AvatarPreset>;

/** Maps old emoji avatars saved before the icon preset migration. */
const LEGACY_EMOJI_TO_ID: Record<string, AvatarPresetId> = {
  '👤': 'default',
  '🎮': 'gamer',
  '📈': 'investor',
  '💰': 'saver',
  '🏆': 'champion',
  '🚀': 'explorer',
  '⭐': 'star',
  '🎯': 'focused',
  '🦊': 'mascot',
  '🐱': 'mascot',
};

export function normalizeAvatarId(avatar: string | null | undefined): AvatarPresetId {
  if (!avatar) return 'default';
  if (avatar in PRESET_BY_ID) return avatar as AvatarPresetId;
  return LEGACY_EMOJI_TO_ID[avatar] ?? 'default';
}

export function getAvatarPreset(avatar: string | null | undefined): AvatarPreset {
  return PRESET_BY_ID[normalizeAvatarId(avatar)];
}

export const DEFAULT_AVATAR_ID: AvatarPresetId = 'default';
