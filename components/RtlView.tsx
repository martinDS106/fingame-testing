import { View, type ViewProps } from 'react-native';

import { useT } from '@/hooks/useT';
import { rtlRootDirection } from '@/lib/rtlStyle';

type RtlViewProps = ViewProps & { className?: string };

/** Screen / section root: sets `direction` so Arabic layout mirrors under the locale store. */
export function RtlView({ className, style, ...rest }: RtlViewProps) {
  const { rtl } = useT();
  return <View className={className} style={[rtlRootDirection(rtl), style]} {...rest} />;
}
