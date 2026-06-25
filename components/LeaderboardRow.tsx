import { Text, View } from 'react-native';

import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { rtlRowMerge, rtlTextStyle } from '@/lib/rtlStyle';

type LeaderboardRowProps = {
  rtl: boolean;
  rank: number;
  displayName: string;
  avatar: string;
  coins: number;
  xp?: number;
  streak?: number;
  pointsLabel: string;
  showXpStreak?: boolean;
};

function rankBadgeClass(rank: number) {
  if (rank === 1) return 'bg-accent-100';
  if (rank === 2) return 'bg-gray-100';
  if (rank === 3) return 'bg-orange-100';
  return 'bg-gray-50';
}

function rankTextClass(rank: number) {
  if (rank === 1) return 'text-accent-700';
  if (rank === 2) return 'text-gray-700';
  if (rank === 3) return 'text-orange-700';
  return 'text-gray-700';
}

export function LeaderboardRow({
  rtl,
  rank,
  displayName,
  avatar,
  coins,
  xp,
  streak,
  pointsLabel,
  showXpStreak = false,
}: LeaderboardRowProps) {
  const ta = rtlTextStyle(rtl);

  return (
    <View className="py-2" style={rtlRowMerge(rtl, { alignItems: 'center', gap: 12 })}>
      <ProfileAvatar avatar={avatar || 'default'} size={40} />
      <View className="flex-1">
        <Text style={ta} className="text-sm text-gray-900 font-medium">
          {displayName}
        </Text>
        <Text style={ta} className="text-xs text-gray-500">
          {pointsLabel}
        </Text>
        {showXpStreak ? (
          <Text style={ta} className="text-xs text-gray-400 mt-0.5">
            XP {xp ?? 0} · 🔥 {streak ?? 0}
          </Text>
        ) : null}
      </View>
      <View className={`px-3 py-1 rounded-full ${rankBadgeClass(rank)}`}>
        <Text style={ta} className={`text-sm font-semibold ${rankTextClass(rank)}`}>
          #{rank}
        </Text>
      </View>
    </View>
  );
}
