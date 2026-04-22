import { forwardRef, type ReactNode } from 'react';
import { Pressable, Text, View, type PressableProps } from 'react-native';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'outline'
  | 'ghost'
  | 'destructive';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const variantClasses: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary-600 active:bg-primary-700',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-white active:bg-gray-100 border border-gray-200',
    text: 'text-gray-900',
  },
  accent: {
    container: 'bg-accent-400 active:bg-accent-500',
    text: 'text-primary-900',
  },
  outline: {
    container: 'bg-transparent border border-primary-600 active:bg-primary-50',
    text: 'text-primary-600',
  },
  ghost: {
    container: 'bg-transparent active:bg-gray-100',
    text: 'text-primary-600',
  },
  destructive: {
    container: 'bg-red-500 active:bg-red-600',
    text: 'text-white',
  },
};

const sizeClasses: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: 'px-3 py-2 rounded-lg', text: 'text-sm' },
  md: { container: 'px-4 py-3 rounded-xl', text: 'text-base' },
  lg: { container: 'px-6 py-4 rounded-2xl', text: 'text-lg' },
};

export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    className = '',
    ...props
  },
  ref
) {
  const v = variantClasses[variant];
  const s = sizeClasses[size];

  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      className={`${v.container} ${s.container} ${fullWidth ? 'w-full' : ''} ${
        disabled ? 'opacity-50' : ''
      } flex-row items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {leftIcon}
      {typeof children === 'string' ? (
        <Text className={`${v.text} ${s.text} font-semibold`}>{children}</Text>
      ) : (
        children
      )}
      {rightIcon}
    </Pressable>
  );
});
