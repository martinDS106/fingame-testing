import { Stack } from 'expo-router';

import { useT } from '@/hooks/useT';

export default function AuthLayout() {
  const { rtl } = useT();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: rtl ? 'slide_from_left' : 'slide_from_right',
      }}
    />
  );
}
