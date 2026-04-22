import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'accent';

interface BadgeProps {
  variant?: BadgeVariant;
  children?: ReactNode;
  className?: string;
  leftIcon?: ReactNode;
}

const variantClasses: Record<BadgeVariant, { container: string; text: string }> = {
  default: { container: 'bg-primary-100 border-primary-200', text: 'text-primary-700' },
  success: { container: 'bg-green-100 border-green-200', text: 'text-green-700' },
  warning: { container: 'bg-yellow-100 border-yellow-200', text: 'text-yellow-700' },
  danger: { container: 'bg-red-100 border-red-200', text: 'text-red-700' },
  info: { container: 'bg-blue-100 border-blue-200', text: 'text-blue-700' },
  neutral: { container: 'bg-gray-100 border-gray-200', text: 'text-gray-700' },
  accent: { container: 'bg-accent-100 border-accent-300', text: 'text-accent-800' },
};

export function Badge({
  variant = 'default',
  children,
  className = '',
  leftIcon,
}: BadgeProps) {
  const v = variantClasses[variant];

  return (
    <View
      className={`flex-row items-center gap-1 px-2 py-0.5 rounded-md border ${v.container} ${className}`}
    >
      {leftIcon}
      {typeof children === 'string' ? (
        <Text className={`text-xs font-medium ${v.text}`}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
