import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/theme';

interface ProgressBarProps {
  value: number;
  max?: number;
  height?: number;
  className?: string;
  trackClassName?: string;
  gradient?: [string, string];
  color?: string;
}

export function ProgressBar({
  value,
  max = 100,
  height = 8,
  className = '',
  trackClassName = 'bg-gray-200',
  gradient,
  color = colors.primary[600],
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <View
      className={`rounded-full overflow-hidden ${trackClassName} ${className}`}
      style={{ height }}
    >
      {gradient ? (
        <LinearGradient
          colors={gradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: `${pct}%`, height: '100%' }}
        />
      ) : (
        <View
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: color,
          }}
        />
      )}
    </View>
  );
}
