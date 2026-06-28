import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Coins, Info, Trophy, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { useAppNotifyStore, type AppNotifyVariant } from '@/stores/useAppNotifyStore';
import { colors } from '@/theme';
import { useT } from '@/hooks/useT';
import { rtlRowMerge, rtlTextStyle } from '@/lib/rtlStyle';

function variantStyle(variant: AppNotifyVariant) {
  switch (variant) {
    case 'course':
      return {
        gradient: [colors.accent[400], colors.accent[500]] as [string, string],
        icon: Trophy,
        iconColor: colors.primary[900],
        titleColor: colors.primary[900],
        bodyColor: colors.primary[800],
      };
    case 'reward':
      return {
        gradient: [colors.primary[500], colors.primary[700]] as [string, string],
        icon: Coins,
        iconColor: colors.white,
        titleColor: colors.white,
        bodyColor: '#dbeafe',
      };
    case 'success':
      return {
        gradient: ['#22c55e', '#16a34a'] as [string, string],
        icon: Award,
        iconColor: colors.white,
        titleColor: colors.white,
        bodyColor: '#dcfce7',
      };
    default:
      return {
        gradient: [colors.gray[800], colors.gray[900]] as [string, string],
        icon: Info,
        iconColor: colors.white,
        titleColor: colors.white,
        bodyColor: colors.gray[200],
      };
  }
}

export function AppNotifyHost() {
  const insets = useSafeAreaInsets();
  const { rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const current = useAppNotifyStore((s) => s.current);
  const dismiss = useAppNotifyStore((s) => s.dismiss);

  if (!current) return null;

  const style = variantStyle(current.variant);
  const Icon = style.icon;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
      }}
    >
      <Animated.View entering={FadeInDown.duration(280)} exiting={FadeOutUp.duration(200)}>
        <Pressable onPress={dismiss} className="active:opacity-95">
          <LinearGradient
            colors={style.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 16,
              padding: 14,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.18,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <View style={rtlRowMerge(rtl, { alignItems: 'flex-start', gap: 12 })}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.22)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={22} color={style.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[ta, { color: style.titleColor }]}
                  className="text-base font-semibold"
                >
                  {current.title}
                </Text>
                <Text
                  style={[ta, { color: style.bodyColor, marginTop: 2 }]}
                  className="text-sm"
                >
                  {current.message}
                </Text>
              </View>
              <Pressable onPress={dismiss} hitSlop={10}>
                <X size={18} color={style.titleColor} />
              </Pressable>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}
