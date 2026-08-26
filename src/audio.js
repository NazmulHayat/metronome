import { createAudioPlayer, setAudioModeAsync } from 'expo-audio'
import * as Speech from 'expo-speech'

const players = {
  tick: createAudioPlayer(require('../assets/sounds/tick.wav')),
  pop: createAudioPlayer(require('../assets/sounds/pop.wav')),
  chime: createAudioPlayer(require('../assets/sounds/chime.wav')),
  boop: createAudioPlayer(require('../assets/sounds/boop.wav')),
  fanfare: createAudioPlayer(require('../assets/sounds/fanfare.wav')),
}

let soundOn = true
export function setSoundOn(on) {
  soundOn = on
}

// The speaker and the mic are open at the same time during a session, so every
// tick, pop and spoken word goes straight back into the recording. Voice
// detection has to ignore those windows or it just hears the app itself.
let micMutedUntil = 0
const SPEAKER_TAIL_MS = 160 // speaker → mic latency plus room decay

export function muteMic(ms) {
  micMutedUntil = Math.max(micMutedUntil, Date.now() + ms + SPEAKER_TAIL_MS)
}
export function unmuteMicSoon() {
  micMutedUntil = Date.now() + SPEAKER_TAIL_MS
}
export function micMuted(at = Date.now()) {
  return at < micMutedUntil
}

export function play(name) {
  if (!soundOn) return
  try {
    const p = players[name]
    if (!p) return
    // duration is in seconds once the asset is loaded; fall back generously
    const ms = p.duration > 0 ? p.duration * 1000 : 250
    muteMic(ms)
    p.seekTo(0).catch(() => {})
    p.play()
  } catch {}
}

export async function configureAudioSession(micOn) {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      allowsRecording: micOn,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false, // keep the loud speaker even while recording
    })
  } catch {}
}

export function speakJa(text) {
  try {
    Speech.stop()
    muteMic(600) // covers the gap before the voice actually starts
    Speech.speak(text, {
      language: 'ja-JP',
      rate: 0.85,
      pitch: 1.1,
      onStart: () => muteMic(4000), // held open, then released by onDone
      onDone: unmuteMicSoon,
      onStopped: unmuteMicSoon,
      onError: unmuteMicSoon,
    })
  } catch {}
}

// Drift-corrected beat scheduler. setTimeout alone accumulates error;
// each beat is scheduled against an absolute timeline (t0 + k * interval).
export class Metronome {
  constructor() {
    this.timer = null
    this.onBeat = null
  }
  // `anchor`: timestamp of a beat where the physical rod hit its RIGHT side
  // (from the tap-along sync). Beats are aligned to that grid, with parity
  // preserved, so the glow always lights the side the rod just left.
  start(bpm, onBeat, leadInMs = 700, anchor = null) {
    this.stop()
    this.interval = 60000 / bpm
    this.onBeat = onBeat
    this.k = 0
    const earliest = Date.now() + leadInMs
    if (anchor) {
      let n = Math.ceil((earliest - anchor) / this.interval)
      if (n % 2 !== 0) n += 1 // keep parity: anchor beat = "rod at right" = even k
      this.t0 = anchor + n * this.interval
    } else {
      this.t0 = earliest
    }
    this._schedule()
  }
  _schedule() {
    const target = this.t0 + this.k * this.interval
    this.timer = setTimeout(() => {
      const k = this.k
      this.k += 1
      try {
        play('tick')
      } catch {}
      try {
        if (this.onBeat) this.onBeat(k)
      } catch {}
      this._schedule()
    }, Math.max(0, target - Date.now()))
  }
  stop() {
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    this.onBeat = null
  }
}
