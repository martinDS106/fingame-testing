import { Pressable } from 'react-native';
import { Coins } from 'lucide-react-native';
import { router } from 'expo-router';

import { AnimatedNumber } from '@/components/animated';
import { colors } from '@/theme';
import { formatNumber } from '@/lib/format';

interface CoinsCounterProps {
  coins: number;
  className?: string;
  onPress?: () => void;
}

export function CoinsCounter({
  coins,
  className = '',
  onPress,
}: CoinsCounterProps) {
  const handlePress = onPress ?? (() => router.push('/marketplace' as never));

  return (
    <Pressable
      onPress={handlePress}
      className={`flex-row items-center gap-1.5 bg-accent-400 active:bg-accent-500 px-3 py-1.5 rounded-full shadow-md ${className}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Coins size={16} color={colors.primary[900]} />
      <AnimatedNumber
        value={coins}
        formatter={(n) => formatNumber(Math.round(n))}
        className="text-sm text-primary-900 font-semibold"
      />
    </Pressable>
  );
}
