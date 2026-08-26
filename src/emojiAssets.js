// Word pictures ship as images rather than emoji glyphs: the iOS Simulator's
// runtime has no usable emoji font (every emoji draws as a tofu box), and the
// system face changes between OS versions. Noto Emoji, Apache-2.0.
const BY_CODEPOINT = {
  '1f431': require('../assets/emoji/1f431.png'),
  '1f436': require('../assets/emoji/1f436.png'),
  '1f43f': require('../assets/emoji/1f43f.png'),
  '1f430': require('../assets/emoji/1f430.png'),
  '1f43c': require('../assets/emoji/1f43c.png'),
  '1f992': require('../assets/emoji/1f992.png'),
  '1f99d': require('../assets/emoji/1f99d.png'),
  '1f418': require('../assets/emoji/1f418.png'),
  '1f981': require('../assets/emoji/1f981.png'),
  '1f99b': require('../assets/emoji/1f99b.png'),
  '1f68c': require('../assets/emoji/1f68c.png'),
  '1f697': require('../assets/emoji/1f697.png'),
  '1f683': require('../assets/emoji/1f683.png'),
  '2708': require('../assets/emoji/2708.png'),
  '26f4': require('../assets/emoji/26f4.png'),
  '1f692': require('../assets/emoji/1f692.png'),
  '1f691': require('../assets/emoji/1f691.png'),
  '1f684': require('../assets/emoji/1f684.png'),
  '1f34e': require('../assets/emoji/1f34e.png'),
  '1f34c': require('../assets/emoji/1f34c.png'),
  '1f34a': require('../assets/emoji/1f34a.png'),
  '1f353': require('../assets/emoji/1f353.png'),
  '1f347': require('../assets/emoji/1f347.png'),
  '1f359': require('../assets/emoji/1f359.png'),
  '1f373': require('../assets/emoji/1f373.png'),
  '1f36a': require('../assets/emoji/1f36a.png'),
  '1f43e': require('../assets/emoji/1f43e.png'),
  '1f4d0': require('../assets/emoji/1f4d0.png'),
  '1f389': require('../assets/emoji/1f389.png'),
  '2b50': require('../assets/emoji/2b50.png'),
  '1f388': require('../assets/emoji/1f388.png'),
  '2728': require('../assets/emoji/2728.png'),
  '1f38a': require('../assets/emoji/1f38a.png'),
  '1f501': require('../assets/emoji/1f501.png'),
  '1f3a4': require('../assets/emoji/1f3a4.png'),
  '1f3af': require('../assets/emoji/1f3af.png'),
}

// Keyed by codepoint so the presentation selector (FE0F) in a source literal
// like 🐿️ can't cause a miss.
export function emojiSource(emoji) {
  if (!emoji) return null
  const cps = [...emoji]
    .map((c) => c.codePointAt(0).toString(16))
    .filter((c) => c !== 'fe0f' && c !== '200d')
  return BY_CODEPOINT[cps.join('-')] || null
}
