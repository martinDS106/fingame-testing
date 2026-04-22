// AsyncStorage mock (Zustand persist uses it)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// URL polyfill is ESM; not needed in Jest environment.
jest.mock('react-native-url-polyfill/auto', () => ({}));

// Silence Supabase "missing env" warning during tests (printed at import-time).
const __originalWarn = console.warn.bind(console);
// eslint-disable-next-line no-console
console.warn = (...args) => {
  const msg = String(args[0] ?? '');
  if (msg.includes('[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL')) return;
  // @ts-expect-error - keep signature flexible
  return __originalWarn(...args);
};

// Reanimated mock
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Gesture handler mock (common RN testing requirement)
jest.mock('react-native-gesture-handler', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    PanGestureHandler: View,
    TapGestureHandler: View,
    LongPressGestureHandler: View,
    FlingGestureHandler: View,
    NativeViewGestureHandler: View,
    RotationGestureHandler: View,
    PinchGestureHandler: View,
    TouchableOpacity: require('react-native').TouchableOpacity,
    TouchableHighlight: require('react-native').TouchableHighlight,
    TouchableWithoutFeedback: require('react-native').TouchableWithoutFeedback,
    ScrollView: require('react-native').ScrollView,
    FlatList: require('react-native').FlatList,
    Directions: {},
  };
});

// Testing Library matchers (deprecated package, but fine for now)
require('@testing-library/jest-native/extend-expect');

// Notifications mock (avoid native module calls in Jest)
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  scheduleNotificationAsync: jest.fn(async () => 'mock-scheduled-id'),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  AndroidImportance: { DEFAULT: 3 },
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchImageLibraryAsync: jest.fn(async () => ({
    canceled: true,
    assets: [],
  })),
}));

