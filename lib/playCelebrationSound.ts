import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let configured = false;

/**
 * Plays the course-completion celebration chime once.
 * No-op on web (browser autoplay policies).
 */
export async function playCourseCelebrationSound(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    if (!configured) {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });
      configured = true;
    }

    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/sounds/celebration.mp3'),
      { shouldPlay: true, volume: 1 },
    );

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        void sound.unloadAsync();
      }
    });
  } catch (err) {
    console.warn('[audio] playCourseCelebrationSound failed', err);
  }
}
