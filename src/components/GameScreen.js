import { useEffect, useRef, useState } from 'react'
import { Animated, Easing, StyleSheet, Text, View } from 'react-native'
import * as Speech from 'expo-speech'
import { Metronome, play, speakJa } from '../audio'
import { rodSync } from '../sync'
import { pickSessionWords, SILENT_MORAE } from '../words'
import { COLORS, FONT } from '../theme'
import CircleButton from './CircleButton'
import WindowCard from './WindowCard'
import Needle from './Needle'
import Pic from './Pic'

// The session itself. The metronome alternates sides every beat; the button
// the needle just swung AWAY from glows with the current mora. The child taps
// it (and says the sound). A missed beat simply comes around again.
export default function GameScreen({ settings, progress, voiceRef, micActive, onWordResult, onDone, onOpenSettings, lay }) {
  const [word, setWord] = useState(null)
  const [wordIdx, setWordIdx] = useState(0)
  const [total, setTotal] = useState(0)
  const [moraIndex, setMoraIndex] = useState(0)
  const [glow, setGlow] = useState(null) // { side, mora }
  const [needleSide, setNeedleSide] = useState(0)
  const [phase, setPhase] = useState('intro') // intro | beats | wordDone | bonus
  const [micHint, setMicHint] = useState(false)
  const [gotBonusStar, setGotBonusStar] = useState(false)

  const queueRef = useRef([])
  const qiRef = useRef(0)
  const moraRef = useRef(0)
  const missesRef = useRef(0)
  const starsRef = useRef(0)
  const doneCountRef = useRef(0)
  const glowRef = useRef(null)
  const metRef = useRef(new Metronome())
  const timersRef = useRef([])

  const shakeX = useRef(new Animated.Value(0)).current
  const checkScale = useRef(new Animated.Value(0)).current

  const beatMs = 60000 / settings.bpm

  const later = (fn, ms) => timersRef.current.push(setTimeout(fn, ms))

  const triggerShake = (strength = 8) => {
    Animated.sequence(
      [strength, -strength, strength * 0.6, -strength * 0.6, 0].map((v) =>
        Animated.timing(shakeX, { toValue: v, duration: 55, easing: Easing.linear, useNativeDriver: true })
      )
    ).start()
  }

  const awardStar = () => {
    starsRef.current += 1
    setGotBonusStar(true)
    later(() => setGotBonusStar(false), 700)
  }

  const startWord = () => {
    const w = queueRef.current[qiRef.current]
    voiceRef.current.reset?.() // don't let the last word's voice count here
    moraRef.current = 0
    missesRef.current = 0
    glowRef.current = null
    setWord(w)
    setWordIdx(qiRef.current)
    setMoraIndex(0)
    setGlow(null)
    setMicHint(false)
    setGotBonusStar(false)
    checkScale.setValue(0)
    setPhase('intro')
    speakJa(w.kana)
    later(() => {
      setPhase('beats')
      metRef.current.start(settings.bpm, (k) => onBeat(k, w), 700, rodSync.anchor)
    }, 1500)
  }

  const onBeat = (k, w) => {
    const g = k % 2 // beat 0 glows LEFT (needle swings away to the right)
    const prev = glowRef.current
    if (prev && !prev.handled) {
      missesRef.current += 1
      triggerShake(6)
    }
    glowRef.current = null
    setGlow(null)
    setNeedleSide(g === 0 ? 1 : 0)
    if (g === moraRef.current % 2) {
      const mora = w.morae[moraRef.current]
      glowRef.current = { side: g, mora, at: Date.now(), handled: false }
      setGlow({ side: g, mora })
    }
  }

  const wordComplete = (w) => {
    metRef.current.stop()
    glowRef.current = null
    setGlow(null)
    play('chime')
    starsRef.current += missesRef.current === 0 ? 2 : 1
    doneCountRef.current += 1
    setPhase('wordDone')
    Animated.spring(checkScale, { toValue: 1, friction: 4, useNativeDriver: true }).start()
    onWordResult(w.id, missesRef.current)
    // Flashcard behavior: a struggled word comes back a couple of cards later.
    if (missesRef.current >= 2 && !w.re) {
      queueRef.current.splice(Math.min(qiRef.current + 2, queueRef.current.length), 0, { ...w, re: true })
      setTotal(queueRef.current.length)
    }
    later(() => {
      // Occasionally invite the whole word — never required, auto-advances.
      if (doneCountRef.current % 4 === 0 && !w.re) {
        setPhase('bonus')
        speakJa(w.kana)
        later(advance, 2300)
      } else {
        advance()
      }
    }, 1600)
  }

  const advance = () => {
    qiRef.current += 1
    if (qiRef.current >= queueRef.current.length) {
      onDone({ stars: starsRef.current, words: doneCountRef.current })
    } else {
      startWord()
    }
  }

  // A child says the mora as they tap it, so the voice can land either side of
  // the tap. Look back far enough to catch an early start, and — only when we'd
  // otherwise turn them away — wait a moment for a late one.
  const VOICE_BEFORE_MS = 550
  const VOICE_AFTER_MS = 320

  const tap = (side) => {
    if (phase !== 'beats') return
    const cur = glowRef.current
    const w = queueRef.current[qiRef.current]
    if (cur && !cur.handled && side === cur.side) {
      const silent = SILENT_MORAE.has(cur.mora)
      const det = voiceRef.current
      const tappedAt = Date.now()
      const heard = () => det.heardSince(tappedAt - VOICE_BEFORE_MS)

      const accept = (voiced) => {
        if (cur.handled) return
        cur.handled = true
        play('pop')
        if (settings.micMode === 'bonus' && micActive && voiced && !silent) awardStar()
        moraRef.current += 1
        setMoraIndex(moraRef.current)
        setGlow(null)
        if (moraRef.current >= w.morae.length) wordComplete(w)
      }

      const checking = settings.micMode !== 'off' && micActive && !silent

      if (checking && settings.micMode === 'required' && !heard()) {
        // Don't reject on the spot — give the voice a beat to arrive.
        later(() => {
          if (cur.handled) return
          if (heard()) accept(true)
          else {
            setMicHint(true)
            later(() => setMicHint(false), 900)
          } // glow stays live: say it and tap again
        }, VOICE_AFTER_MS)
        return
      }

      accept(checking && heard())
      // Bonus mode stays snappy: the tap lands now, the star can follow.
      if (checking && settings.micMode === 'bonus' && !heard()) {
        later(() => {
          if (heard()) awardStar()
        }, VOICE_AFTER_MS)
      }
    } else {
      play('boop')
      triggerShake(5)
    }
  }

  useEffect(() => {
    queueRef.current = pickSessionWords(settings, progress)
    qiRef.current = 0
    starsRef.current = 0
    doneCountRef.current = 0
    setTotal(queueRef.current.length)
    if (queueRef.current.length === 0) {
      onDone({ stars: 0, words: 0 })
      return
    }
    startWord()
    const met = metRef.current
    const timers = timersRef.current
    return () => {
      met.stop()
      timers.forEach(clearTimeout)
      Speech.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!word) return null

  return (
    <View style={StyleSheet.absoluteFill}>
      <Needle pivot={lay.needlePivot} len={lay.needleLen} side={needleSide} beatMs={beatMs} visible={settings.showNeedle && phase === 'beats'} />

      <WindowCard win={lay.win} shakeX={shakeX} onOpenSettings={onOpenSettings}>
        {phase === 'bonus' ? (
          <>
            <Pic emoji="🦝" size={56} />
            <Text style={styles.bonusText} allowFontScaling={false}>いっしょに！「{word.kana}」</Text>
          </>
        ) : (
          <>
            <Pic emoji={word.emoji} size={lay.win.height * 0.42} />
            <Text style={[styles.kana, { fontSize: lay.win.height * 0.16 }]} allowFontScaling={false}>{word.kana}</Text>
            <View style={styles.dots}>
              {word.morae.map((m, i) => (
                <View key={i} style={[styles.dot, i < moraIndex ? styles.dotDone : i === moraIndex && phase === 'beats' ? styles.dotNow : null]} />
              ))}
            </View>
          </>
        )}

        {phase === 'wordDone' && (
          <Animated.View style={[StyleSheet.absoluteFill, styles.checkWrap, { transform: [{ scale: checkScale }] }]}>
            <Text style={styles.check} allowFontScaling={false}>✓</Text>
            <View style={styles.checkStars}>
              {Array.from({ length: missesRef.current === 0 ? 2 : 1 }).map((_, i) => (
                <Pic key={i} emoji="⭐" size={30} />
              ))}
            </View>
          </Animated.View>
        )}
        {micHint && (
          <View style={styles.micHint}>
            <Pic emoji="🎤" size={15} />
            <Text style={styles.micHintText} allowFontScaling={false}>こえを きかせて！</Text>
          </View>
        )}
        {gotBonusStar && <Pic emoji="⭐" size={28} style={styles.bonusStar} />}
        <Text style={styles.progress} allowFontScaling={false}>{wordIdx + 1}/{total}</Text>
      </WindowCard>

      <CircleButton
        cx={lay.left.cx} cy={lay.left.cy} r={lay.btnR}
        glowing={glow?.side === 0}
        label={glow?.side === 0 ? glow.mora : '・'}
        onPress={() => tap(0)}
      />
      <CircleButton
        cx={lay.right.cx} cy={lay.right.cy} r={lay.btnR}
        glowing={glow?.side === 1}
        label={glow?.side === 1 ? glow.mora : '・'}
        onPress={() => tap(1)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  kana: { fontFamily: FONT, fontWeight: 'bold', color: COLORS.ink, marginTop: 2 },
  dots: { flexDirection: 'row', gap: 7, marginTop: 8 },
  dot: { width: 13, height: 13, borderRadius: 7, backgroundColor: '#EADDC6' },
  dotNow: { backgroundColor: COLORS.glowDeep, transform: [{ scale: 1.2 }] },
  dotDone: { backgroundColor: COLORS.good },
  checkWrap: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,253,247,0.88)' },
  check: { fontSize: 84, color: COLORS.good, fontWeight: 'bold' },
  checkStars: { flexDirection: 'row', gap: 2, marginTop: -2 },
  micHint: { position: 'absolute', bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  micHintText: { fontFamily: FONT, fontSize: 15, color: COLORS.accent, fontWeight: 'bold' },
  bonusStar: { position: 'absolute', top: 6, right: 10 },
  progress: { position: 'absolute', top: 6, left: 10, fontFamily: FONT, fontSize: 12, color: COLORS.inkSoft },
  bonusText: { fontFamily: FONT, fontSize: 20, fontWeight: 'bold', color: COLORS.ink, marginTop: 6 },
})
