import {
  I18nManager,
  Platform,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

/**
 * RTL strategy (see `app/_layout.tsx`):
 * - Native: `I18nManager.forceRTL(locale === 'ar')` so iOS/Android mirror layout like
 *   system RTL apps (Expo Go + NativeWind often ignore `direction: 'rtl'` alone).
 * - When `I18nManager.isRTL` is true, use normal `flexDirection: 'row'` in `rtlRow`
 *   (Yoga already mirrors the main axis). When native is still LTR, use `row-reverse`.
 * - Web: always set explicit `direction` (native flags are not enough for DOM).
 */

/** RN ignores many web-style cascades; set text direction explicitly for Arabic. */
export function rtlTextStyle(rtl: boolean): Pick<TextStyle, 'textAlign' | 'writingDirection'> {
  return {
    textAlign: rtl ? 'right' : 'left',
    writingDirection: rtl ? 'rtl' : 'ltr',
  };
}

export function rtlRootDirection(rtl: boolean): ViewStyle {
  if (Platform.OS === 'web') {
    return { direction: rtl ? 'rtl' : 'ltr' };
  }
  try {
    // Avoid stacking Yoga RTL + explicit direction on the same subtree (RN guidance).
    if (I18nManager.isRTL && rtl) {
      return {};
    }
  } catch {
    /* ignore */
  }
  return { direction: rtl ? 'rtl' : 'ltr' };
}

/**
 * ScrollView content does not always inherit `direction` from the screen root.
 * Pass every vertical ScrollView's `contentContainerStyle` through this so RTL
 * applies to all children when `locale === 'ar'`.
 */
export function mergeScrollContentRtl(
  rtl: boolean,
  contentContainerStyle?: StyleProp<ViewStyle>
): StyleProp<ViewStyle> {
  const dir = rtlRootDirection(rtl);
  if (contentContainerStyle == null) return dir;
  if (Array.isArray(contentContainerStyle)) {
    return [...contentContainerStyle, dir];
  }
  return [contentContainerStyle as ViewStyle, dir];
}

/** Horizontal row: mirror for Arabic when native RTL is off; plain row when native RTL is on. */
export function rtlRow(rtl: boolean): Pick<ViewStyle, 'flexDirection'> {
  let nativeRtl = false;
  try {
    nativeRtl = I18nManager.isRTL;
  } catch {
    nativeRtl = false;
  }
  if (rtl && nativeRtl) return { flexDirection: 'row' };
  if (rtl && !nativeRtl) return { flexDirection: 'row-reverse' };
  return { flexDirection: 'row' };
}

/** Put `rtlRow(rtl)` last so NativeWind `className` cannot override `flexDirection`. */
export function rtlRowMerge(
  rtl: boolean,
  ...styles: Array<ViewStyle | undefined | null | false>
): ViewStyle[] {
  const flat = styles.filter((s): s is ViewStyle => Boolean(s));
  return [...flat, rtlRow(rtl)];
}

/**
 * Mirror directional icons (e.g. auth back ArrowLeft).
 * Prefer `LocaleChevron` for list disclosure arrows — scaleX can clip SVGs on device.
 */
export function rtlMirrorStyle(rtl: boolean): ViewStyle | undefined {
  if (!rtl) return undefined;
  return { transform: [{ scaleX: -1 }] };
}

/**
 * Horizontal media row isolated from I18nManager.forceRTL on ancestors.
 * Pair with child order: AR → [text, icon], EN → [icon, text].
 */
export function localeIconRowStyle(rtl: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    direction: 'ltr',
    alignItems: 'stretch',
    width: '100%',
  };
}

/** Text column beside a trailing icon; copy aligns to the icon side in Arabic. */
export function localeTextBesideIconStyle(rtl: boolean): ViewStyle {
  return {
    flex: 1,
    minWidth: 0,
    alignItems: rtl ? 'flex-end' : 'flex-start',
  };
}

/** Banner / section headings: physical right in Arabic. */
export function localeBannerAlignStyle(rtl: boolean): ViewStyle {
  return {
    width: '100%',
    direction: 'ltr',
    alignItems: rtl ? 'flex-end' : 'flex-start',
  };
}

/**
 * Streak / marketplace row: group hugging the physical right in Arabic.
 * Child order: [icon, text] for both locales.
 */
export function localeTrailingGroupRowStyle(rtl: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    direction: 'ltr',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    justifyContent: rtl ? 'flex-end' : 'flex-start',
  };
}

/** Settings / profile list row — isolated LTR flex row (avoids NativeWind + forceRTL clashes). */
export function listRowStyle(): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 12,
    direction: 'ltr',
  };
}

export function listRowLeadingStyle(): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  };
}

export function listRowTrailingStyle(): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  };
}

