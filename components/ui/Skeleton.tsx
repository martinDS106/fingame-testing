import { View, type ViewProps } from 'react-native';

interface SkeletonProps extends ViewProps {
  className?: string;
}

export function Skeleton({ className = '', style, ...props }: SkeletonProps) {
  return (
    <View
      className={`bg-gray-200 rounded-lg ${className}`}
      style={style}
      {...props}
    />
  );
}

