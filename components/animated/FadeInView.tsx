import type { ReactNode } from 'react';
import { Platform, View, type ViewStyle, type StyleProp } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

export type FadeDirection = 'none' | 'up' | 'down';

interface FadeInViewProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: FadeDirection;
  distance?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function FadeInView({
  children,
  delay = 0,
  duration = 400,
  direction = 'up',
  distance = 16,
  style,
  className,
}: FadeInViewProps) {
  // Reanimated layout entering crashes on Expo Web (reading 'top' of undefined).
  if (Platform.OS === 'web') {
    return (
      <View style={style} className={className}>
        {children}
      </View>
    );
  }

  const animation =
    direction === 'up'
      ? FadeInDown.duration(duration).delay(delay).springify().damping(18)
      : direction === 'down'
        ? FadeInUp.duration(duration).delay(delay).springify().damping(18)
        : FadeIn.duration(duration).delay(delay);

  const initialOffset = direction === 'up' ? distance : direction === 'down' ? -distance : 0;

  return (
    <Animated.View
      entering={animation.withInitialValues({
        transform: [{ translateY: initialOffset }],
        opacity: 0,
      })}
      style={style}
      className={className}
    >
      {children}
    </Animated.View>
  );
}
