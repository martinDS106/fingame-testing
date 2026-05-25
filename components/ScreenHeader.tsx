import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Bell, Menu } from 'lucide-react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import { CoinsCounter } from '@/components/CoinsCounter';
import { useRTL } from '@/hooks/useRTL';
import { colors } from '@/theme';

interface ScreenHeaderProps {
  title: string;
  coins?: number;
  showBack?: boolean;
  showMenu?: boolean;
  showBell?: boolean;
  notificationCount?: number;
  rightSlot?: ReactNode;
  gradient?: [string, string];
  onBack?: () => void;
  onBellPress?: () => void;
  onMenuPress?: () => void;
}

/** Header bar uses LTR flex so children stay visible when I18nManager.forceRTL is on. */
const BAR: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  paddingHorizontal: 16,
  paddingVertical: 12,
  direction: 'ltr',
};

const SLOT: ViewStyle = {
  width: 40,
  minHeight: 40,
  flexShrink: 0,
  justifyContent: 'center',
  alignItems: 'center',
};

export function ScreenHeader({
  title,
  coins,
  showBack = false,
  showMenu = false,
  showBell = true,
  notificationCount = 0,
  rightSlot,
  gradient,
  onBack,
  onBellPress,
  onMenuPress,
}: ScreenHeaderProps) {
  const gradientColors: [string, string] =
    gradient ?? [colors.primary[600], colors.primary[700]];
  const rtl = useRTL();

  const safeBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    } catch {
      try {
        router.replace('/');
      } catch {
        // ignore
      }
    }
  };

  const safeMenu = () => {
    try {
      router.push('/menu' as never);
    } catch {
      // ignore
    }
  };

  const navControl = showBack ? (
    <Pressable
      onPress={onBack ?? safeBack}
      hitSlop={12}
      style={styles.navBtn}
      accessibilityRole="button"
      accessibilityLabel="Back"
    >
      <Ionicons
        name={rtl ? 'chevron-forward' : 'chevron-back'}
        size={28}
        color={colors.white}
      />
    </Pressable>
  ) : showMenu ? (
    <Pressable
      onPress={onMenuPress ?? safeMenu}
      hitSlop={12}
      style={styles.navBtn}
      accessibilityRole="button"
      accessibilityLabel="Menu"
    >
      <Menu size={24} color={colors.white} />
    </Pressable>
  ) : null;

  const trailing = (
    <View style={styles.trailing}>
      {rightSlot}
      {typeof coins === 'number' && <CoinsCounter coins={coins} />}
      {showBell && (
        <Pressable
          onPress={onBellPress ?? (() => router.push('/notifications' as never))}
          hitSlop={12}
          style={styles.navBtn}
        >
          <View>
            <Bell size={22} color={colors.white} />
            {notificationCount > 0 && (
              <View
                style={[
                  styles.badge,
                  rtl ? styles.badgeRtl : styles.badgeLtr,
                ]}
              >
                <Text style={styles.badgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      )}
    </View>
  );

  const titleNode = (
    <Text
      numberOfLines={1}
      ellipsizeMode="tail"
      style={[styles.title, rtl ? styles.titleRtl : styles.titleLtr]}
    >
      {title}
    </Text>
  );

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <SafeAreaView edges={['top']}>
        <View style={BAR}>
          {rtl ? (
            <>
              {trailing}
              {titleNode}
              <View style={SLOT}>{navControl}</View>
            </>
          ) : (
            <>
              <View style={SLOT}>{navControl}</View>
              {titleNode}
              {trailing}
            </>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  titleLtr: {
    textAlign: 'left',
  },
  titleRtl: {
    textAlign: 'right',
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  badge: {
    position: 'absolute',
    top: -4,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeLtr: {
    right: -4,
  },
  badgeRtl: {
    left: -4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});
