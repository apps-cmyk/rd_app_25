import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'NEON_SOCIAL_CASINO_STATE_V1';

export async function loadGameState() {
  try {
    const json = await AsyncStorage.getItem(KEY);
    if (!json) return null;
    return JSON.parse(json);
  } catch (e) {
    console.warn('loadGameState error', e);
    return null;
  }
}

export async function saveGameState(state) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('saveGameState error', e);
  }
}
