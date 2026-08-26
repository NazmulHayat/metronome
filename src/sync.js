// Runtime link to the physical metronome rod (not persisted — the rod stops
// when nobody winds it, so a saved anchor would be meaningless).
// anchor: timestamp of a tap made as the rod hit its RIGHT side.
export const rodSync = { anchor: null }

// Median inter-tap interval → BPM. Robust against one mistimed tap.
export function bpmFromTaps(taps) {
  if (taps.length < 4) return null
  const iv = []
  for (let i = 1; i < taps.length; i++) iv.push(taps[i] - taps[i - 1])
  iv.sort((a, b) => a - b)
  const mid = iv.length % 2 ? iv[(iv.length - 1) / 2] : (iv[iv.length / 2 - 1] + iv[iv.length / 2]) / 2
  const bpm = 60000 / mid
  if (bpm < 30 || bpm > 220) return null // physical range is 40–208; leave tap slack
  return bpm
}
