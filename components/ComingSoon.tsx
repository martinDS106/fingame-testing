import { Text, View } from 'react-native';
import type { ComponentType } from 'react';

import { BottomNav } from '@/components/BottomNav';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/theme';
import { useT } from '@/hooks/useT';
import { rtlRootDirection, rtlTextStyle } from '@/lib/rtlStyle';

interface ComingSoonProps {
  title: string;
  Icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  description?: string;
}

export function ComingSoon({ title, Icon, description }: ComingSoonProps) {
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader title={title} showBack showBell={false} />

      <View className="flex-1 items-center justify-center px-8">
        <View className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center mb-6">
          <Icon size={48} color={colors.primary[600]} strokeWidth={2} />
        </View>
        <Text
          style={[ta, { textAlign: 'center' }]}
          className="text-2xl text-gray-800 font-bold mb-2"
        >
          {title}
        </Text>
        <Text
          style={[ta, { textAlign: 'center' }]}
          className="text-base text-gray-500"
        >
          {description ?? t('common.comingSoon')}
        </Text>
      </View>

      <BottomNav />
    </View>
  );
}
