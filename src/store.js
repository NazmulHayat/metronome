import AsyncStorage from '@react-native-async-storage/async-storage'
import { DEFAULT_CALIB } from './geometry'

const SETTINGS_KEY = 'metron.settings.v1'
const PROGRESS_KEY = 'metron.progress.v1'

export const DEFAULT_SETTINGS = {
  bpm: 60, // one mora per beat; therapy pacing is slower than natural speech
  sessionLength: 8,
  micMode: 'off', // 'off' | 'bonus' | 'required'
  micSensitivityDb: 8, // how far above the room's noise floor counts as a voice
  categories: ['animals', 'vehicles', 'foods'],
  maxMorae: 3,
  allowSpecial: false,
  sound: true,
  showNeedle: true,
  calib: { ...DEFAULT_CALIB },
}

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const saved = JSON.parse(raw)
    return { ...DEFAULT_SETTINGS, ...saved, calib: { ...DEFAULT_CALIB, ...(saved.calib || {}) } }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {})
}

export async function loadProgress() {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveProgress(progress) {
  AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)).catch(() => {})
}
