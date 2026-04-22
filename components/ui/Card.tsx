import { forwardRef, type ReactNode } from 'react';
import {
  Pressable,
  View,
  type PressableProps,
  type ViewProps,
} from 'react-native';

interface CardProps extends ViewProps {
  children?: ReactNode;
  className?: string;
  padded?: boolean;
}

interface PressableCardProps extends Omit<PressableProps, 'children'> {
  children?: ReactNode;
  className?: string;
  padded?: boolean;
}

const cardBase =
  'bg-white rounded-2xl border border-gray-100 shadow-sm';

export const Card = forwardRef<View, CardProps>(function Card(
  { children, className = '', padded = true, style, ...props },
  ref
) {
  return (
    <View
      ref={ref}
      className={`${cardBase} ${padded ? 'p-4' : ''} ${className}`}
      style={[
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
});

export const PressableCard = forwardRef<View, PressableCardProps>(
  function PressableCard(
    { children, className = '', padded = true, style, ...props },
    ref
  ) {
    return (
      <Pressable
        ref={ref}
        className={`${cardBase} ${padded ? 'p-4' : ''} active:opacity-80 ${className}`}
        style={({ pressed }) => [
          {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: pressed ? 0.1 : 0.06,
            shadowRadius: pressed ? 10 : 8,
            elevation: pressed ? 4 : 2,
          },
          typeof style === 'function' ? style({ pressed }) : style,
        ]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }
);
