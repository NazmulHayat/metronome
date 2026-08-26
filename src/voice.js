// Turns raw metering samples into "the child made a sound just now".
//
// The recorder reports dBFS, roughly -160 (silence) to 0 (clipping). A fixed
// threshold doesn't survive contact with reality: a quiet room, a noisy room,
// and a phone muffled inside the tanuki case all sit at different levels. So
// track the room's own floor and look for a rise above it instead.
export class VoiceDetector {
  constructor(sensitivityDb = 10) {
    this.sensitivityDb = sensitivityDb
    this.floor = null // running estimate of the quiet level
    this.level = null // most recent sample, for the settings meter
    this.lastVoiceAt = -Infinity // never heard anything yet
    this.peakSinceReset = null
  }

  setSensitivity(db) {
    this.sensitivityDb = db
  }

  // Called when a sample is thrown away because the app was making noise.
  // The floor is left alone — the speaker's level says nothing about the room.
  noteMuted() {}

  push(db, at = Date.now()) {
    if (typeof db !== 'number' || !isFinite(db)) return
    this.level = db
    if (this.floor === null) {
      this.floor = db
      return
    }
    const rise = db - this.floor
    if (rise >= this.sensitivityDb) {
      this.lastVoiceAt = at
      this.peakSinceReset = Math.max(this.peakSinceReset ?? -160, db)
    } else {
      // Follow the room: drop fast when it goes quiet, creep up slowly so a
      // long vowel can't drag the floor along with it.
      const a = db < this.floor ? 0.35 : 0.03
      this.floor += (db - this.floor) * a
    }
  }

  heardSince(from) {
    return this.lastVoiceAt >= from
  }

  reset() {
    this.lastVoiceAt = -Infinity
    this.peakSinceReset = null
  }
}
