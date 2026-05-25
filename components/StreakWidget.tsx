import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Zap } from 'lucide-react-native';
import { router } from 'expo-router';

import { Card } from '@/components/ui/Card';
import { useRTL } from '@/hooks/useRTL';
import {
  localeIconRowStyle,
  localeTextBesideIconStyle,
  rtlTextStyle,
} from '@/lib/rtlStyle';
import { colors } from '@/theme';
import { useT } from '@/hooks/useT';

interface StreakWidgetProps {
  days: number;
}

function getFlameStyle(days: number) {
  if (days >= 100) {
    return {
      gradient: [colors.accent[300], colors.accent[500]] as [string, string],
      icon: <Zap size={24} color={colors.accent[700]} fill={colors.accent[600]} />,
    };
  }
  if (days >= 30) {
    return {
      gradient: ['#f87171', '#dc2626'] as [string, string],
      icon: <Flame size={24} color={colors.white} fill={colors.white} />,
    };
  }
  if (days >= 14) {
    return {
      gradient: ['#c084fc', '#9333ea'] as [string, string],
      icon: <Flame size={24} color={colors.white} fill={colors.white} />,
    };
  }
  if (days >= 7) {
    return {
      gradient: ['#60a5fa', '#2563eb'] as [string, string],
      icon: <Flame size={24} color={colors.white} fill={colors.white} />,
    };
  }
  return {
    gradient: ['#fb923c', '#ea580c'] as [string, string],
    icon: <Flame size={24} color={colors.white} fill={colors.white} />,
  };
}

export function StreakWidget({ days }: StreakWidgetProps) {
  const flame = getFlameStyle(days);
  const { t } = useT();
  const rtl = useRTL();
  const ta = rtlTextStyle(rtl);

  const flameCircle = (
    <LinearGradient
      colors={flame.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      {flame.icon}
    </LinearGradient>
  );

  const textBlock = (
    <View style={localeTextBesideIconStyle(rtl)}>
      <Text style={[ta, { alignSelf: 'stretch' }]} className="text-2xl text-gray-800 font-bold">
        {t('streak.days', { n: days })}
      </Text>
      <Text style={[ta, { alignSelf: 'stretch' }]} className="text-sm text-gray-600">
        {t('streak.learningStreak')}
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={() => router.push('/streak-calendar' as never)}
      className="active:opacity-80"
    >
      <Card>
        <View
          style={[
            localeIconRowStyle(rtl),
            {
              alignItems: 'center',
              gap: 12,
              justifyContent: rtl ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          {rtl ? (
            <>
              {textBlock}
              {flameCircle}
            </>
          ) : (
            <>
              {flameCircle}
              {textBlock}
            </>
          )}
        </View>
      </Card>
    </Pressable>
  );
}
