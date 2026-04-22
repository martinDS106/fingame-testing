import { Platform } from 'react-native';

// Stable identifier we control (used for schedule + cancel).
const DAILY_REMINDER_ID = 'fin-game.daily-reminder';

async function getNotifications() {
  // Lazy import to avoid crashing Expo Go on Android at module load.
  // (Expo Go removed remote notifications support; the package may throw on import.)
  try {
    const mod = await import('expo-notifications');
    return mod;
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : 'expo-notifications is unavailable in this environment.';
    throw new Error(
      `Notifications are not supported in Expo Go on Android. Use a development build.\n\n${msg}`
    );
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const Notifications = await getNotifications();
  const perm = await Notifications.getPermissionsAsync();
  if (perm.granted) return true;

  const req = await Notifications.requestPermissionsAsync();
  return !!req.granted;
}

export async function configureNotifications(): Promise<void> {
  const Notifications = await getNotifications();
  // iOS requires setting the handler so notifications can show while app is foregrounded.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function scheduleDailyReminder(
  hour = 20,
  minute = 0
): Promise<string> {
  const Notifications = await getNotifications();
  // Use a stable identifier so we can cancel/replace the same reminder.
  return await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: 'Fin-Game',
      body: 'Complete a quick quiz or lesson to keep your streak.',
      ...(Platform.OS === 'android' ? { channelId: 'default' } : null),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      ...(Platform.OS === 'android' ? { channelId: 'default' } : null),
    },
  });
}

export async function cancelDailyReminder(id?: string | null): Promise<void> {
  const Notifications = await getNotifications();
  const identifier = id ?? DAILY_REMINDER_ID;
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

