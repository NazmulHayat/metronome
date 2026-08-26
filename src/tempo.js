// Matches the range of the physical Nikko metronome (40–208 BPM).
export const BPM_MIN = 40
export const BPM_MAX = 208

// Tempo names as printed on the Nikko scale.
const MARKS = [
  [40, 'Grave'],
  [44, 'Largo'],
  [52, 'Lento'],
  [56, 'Larghetto'],
  [60, 'Adagio'],
  [63, 'Adagietto'],
  [69, 'Andante'],
  [76, 'Andantino'],
  [84, 'Maestoso'],
  [92, 'Moderato'],
  [100, 'Allegretto'],
  [116, 'Animato'],
  [126, 'Allegro'],
  [152, 'Vivace'],
  [168, 'Presto'],
  [200, 'Prestissimo'],
]

export function tempoName(bpm) {
  let name = MARKS[0][1]
  for (const [from, n] of MARKS) {
    if (bpm >= from) name = n
  }
  return name
}
