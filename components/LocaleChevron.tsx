import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type ViewStyle } from 'react-native';

interface LocaleChevronProps {
  /** App locale is Arabic (RTL reading direction). */
  rtl: boolean;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

/**
 * Disclosure chevron for settings / list rows (font icon — always visible on iOS/Android).
 */
export function LocaleChevron({
  rtl,
  size = 20,
  color = '#6b7280',
  style,
}: LocaleChevronProps) {
  const name = rtl ? 'chevron-back' : 'chevron-forward';
  return (
    <View style={[styles.box, style]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
