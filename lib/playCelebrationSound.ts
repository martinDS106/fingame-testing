import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Platform } from 'react-native';

let configured = false;
let playing: Audio.Sound | null = null;

/**
 * Plays the course-completion celebration chime once.
 * No-op on web (browser autoplay policies).
 */
export async function playCourseCelebrationSound(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    if (!configured) {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });
      configured = true;
    }

    if (playing) {
      try {
        await playing.stopAsync();
        await playing.unloadAsync();
      } catch {
        // ignore stale sound cleanup
      }
      playing = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/sounds/celebration.mp3'),
      { shouldPlay: true, volume: 1 },
    );
    playing = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        void sound.unloadAsync();
        if (playing === sound) playing = null;
      }
    });
  } catch (err) {
    console.warn('[audio] playCourseCelebrationSound failed', err);
  }
}
