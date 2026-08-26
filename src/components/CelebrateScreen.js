import { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet, Text, View } from 'react-native'
import { COLORS, FONT } from '../theme'
import CircleButton from './CircleButton'
import WindowCard from './WindowCard'
import Pic from './Pic'

const CONFETTI = ['🎉', '⭐', '🎈', '✨', '🎊']

export default function CelebrateScreen({ lay, result, onAgain, onOpenSettings }) {
  const float = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start()
  }, [float])

  const bounce = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] })

  return (
    <View style={StyleSheet.absoluteFill}>
      <WindowCard win={lay.win} onOpenSettings={onOpenSettings}>
        <View style={styles.confettiRow}>
          {CONFETTI.map((c, i) => (
            <Animated.View key={i} style={{ transform: [{ translateY: i % 2 ? bounce : 0 }] }}>
              <Pic emoji={c} size={22} />
            </Animated.View>
          ))}
        </View>
        <Animated.View style={[styles.mascot, { transform: [{ translateY: bounce }] }]}>
          <Pic emoji="🦝" size={46} />
        </Animated.View>
        <Text style={styles.big} allowFontScaling={false}>よくできました！</Text>
        <View style={styles.starsRow}>
          <Pic emoji="⭐" size={17} />
          <Text style={styles.stars} allowFontScaling={false}>× {result?.stars ?? 0}</Text>
        </View>
      </WindowCard>
      <CircleButton cx={lay.left.cx} cy={lay.left.cy} r={lay.btnR} glowing label="↻" sub="もういっかい" onPress={onAgain} />
      <CircleButton cx={lay.right.cx} cy={lay.right.cy} r={lay.btnR} glowing label="↻" sub="もういっかい" onPress={onAgain} />
    </View>
  )
}

const styles = StyleSheet.create({
  confettiRow: { flexDirection: 'row', gap: 6 },
  mascot: { marginTop: 2 },
  big: { fontFamily: FONT, fontSize: 20, fontWeight: 'bold', color: COLORS.ink, marginTop: 2 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  stars: { fontFamily: FONT, fontSize: 17, color: COLORS.star, fontWeight: 'bold' },
})
