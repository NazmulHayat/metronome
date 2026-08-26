// Word bank. Each word is pre-split into morae (the tap/say unit).
// 「っ」 is a silent beat: tap only, no voice required.
// special: contains yōon (しゃ etc.), sokuon (っ), or long vowels — hardest level.
export const WORDS = [
  // animals どうぶつ
  { id: 'neko', kana: 'ねこ', morae: ['ね', 'こ'], emoji: '🐱', category: 'animals', special: false },
  { id: 'inu', kana: 'いぬ', morae: ['い', 'ぬ'], emoji: '🐶', category: 'animals', special: false },
  { id: 'risu', kana: 'りす', morae: ['り', 'す'], emoji: '🐿️', category: 'animals', special: false },
  { id: 'usagi', kana: 'うさぎ', morae: ['う', 'さ', 'ぎ'], emoji: '🐰', category: 'animals', special: false },
  { id: 'panda', kana: 'ぱんだ', morae: ['ぱ', 'ん', 'だ'], emoji: '🐼', category: 'animals', special: false },
  { id: 'kirin', kana: 'きりん', morae: ['き', 'り', 'ん'], emoji: '🦒', category: 'animals', special: false },
  { id: 'tanuki', kana: 'たぬき', morae: ['た', 'ぬ', 'き'], emoji: '🦝', category: 'animals', special: false },
  { id: 'zou', kana: 'ぞう', morae: ['ぞ', 'う'], emoji: '🐘', category: 'animals', special: true },
  { id: 'raion', kana: 'らいおん', morae: ['ら', 'い', 'お', 'ん'], emoji: '🦁', category: 'animals', special: false },
  { id: 'kaba', kana: 'かば', morae: ['か', 'ば'], emoji: '🦛', category: 'animals', special: false },

  // vehicles のりもの
  { id: 'basu', kana: 'バス', morae: ['バ', 'ス'], emoji: '🚌', category: 'vehicles', special: false },
  { id: 'kuruma', kana: 'くるま', morae: ['く', 'る', 'ま'], emoji: '🚗', category: 'vehicles', special: false },
  { id: 'densha', kana: 'でんしゃ', morae: ['で', 'ん', 'しゃ'], emoji: '🚃', category: 'vehicles', special: true },
  { id: 'hikouki', kana: 'ひこうき', morae: ['ひ', 'こ', 'う', 'き'], emoji: '✈️', category: 'vehicles', special: true },
  { id: 'fune', kana: 'ふね', morae: ['ふ', 'ね'], emoji: '⛴️', category: 'vehicles', special: false },
  { id: 'shoubousha', kana: 'しょうぼうしゃ', morae: ['しょ', 'う', 'ぼ', 'う', 'しゃ'], emoji: '🚒', category: 'vehicles', special: true },
  { id: 'kyuukyuusha', kana: 'きゅうきゅうしゃ', morae: ['きゅ', 'う', 'きゅ', 'う', 'しゃ'], emoji: '🚑', category: 'vehicles', special: true },
  { id: 'shinkansen', kana: 'しんかんせん', morae: ['し', 'ん', 'か', 'ん', 'せ', 'ん'], emoji: '🚄', category: 'vehicles', special: false },

  // foods たべもの
  { id: 'ringo', kana: 'りんご', morae: ['り', 'ん', 'ご'], emoji: '🍎', category: 'foods', special: false },
  { id: 'banana', kana: 'バナナ', morae: ['バ', 'ナ', 'ナ'], emoji: '🍌', category: 'foods', special: false },
  { id: 'mikan', kana: 'みかん', morae: ['み', 'か', 'ん'], emoji: '🍊', category: 'foods', special: false },
  { id: 'ichigo', kana: 'いちご', morae: ['い', 'ち', 'ご'], emoji: '🍓', category: 'foods', special: false },
  { id: 'budou', kana: 'ぶどう', morae: ['ぶ', 'ど', 'う'], emoji: '🍇', category: 'foods', special: true },
  { id: 'onigiri', kana: 'おにぎり', morae: ['お', 'に', 'ぎ', 'り'], emoji: '🍙', category: 'foods', special: false },
  { id: 'omuraisu', kana: 'オムライス', morae: ['オ', 'ム', 'ラ', 'イ', 'ス'], emoji: '🍳', category: 'foods', special: false },
  { id: 'kukkii', kana: 'クッキー', morae: ['ク', 'ッ', 'キ', 'ー'], emoji: '🍪', category: 'foods', special: true },
]

// `label` is what a child sees; `labelEn` is for the parent-facing settings.
export const CATEGORIES = [
  { id: 'animals', label: 'どうぶつ', labelEn: 'Animals', emoji: '🐾' },
  { id: 'vehicles', label: 'のりもの', labelEn: 'Vehicles', emoji: '🚗' },
  { id: 'foods', label: 'たべもの', labelEn: 'Foods', emoji: '🍎' },
]

// Morae that are tapped on the beat but not voiced by themselves.
export const SILENT_MORAE = new Set(['っ', 'ッ'])

export function pickSessionWords(settings, progress, rng = Math.random) {
  const pool = WORDS.filter(
    (w) =>
      settings.categories.includes(w.category) &&
      w.morae.length <= settings.maxMorae &&
      (settings.allowSpecial || !w.special)
  )
  // Prioritize words missed before (flashcard behavior across sessions),
  // then least-practiced words, with a shuffle inside each tier.
  const scored = pool
    .map((w) => {
      const p = progress[w.id] || { done: 0, missTotal: 0 }
      return { w, score: p.missTotal * 10 - p.done + rng() }
    })
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, settings.sessionLength).map((s) => ({ ...s.w }))
}
