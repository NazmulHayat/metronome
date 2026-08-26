import { useEffect, useRef } from 'react'
import { Animated, Easing, Pressable, StyleSheet, Text } from 'react-native'
import { COLORS, FONT } from '../theme'

// One of the two physical Ø27mm tap targets. `glowing` lights it up and
// pulses; `label` is the mora to say (or an icon on start/celebrate screens).
export default function CircleButton({ cx, cy, r, glowing, label, sub, onPress }) {
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (glowing) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 380, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 380, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      )
      loop.start()
      return () => loop.stop()
    }
    pulse.setValue(0)
  }, [glowing, pulse])

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] })

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={{ position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2 }}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            width: r * 2,
            height: r * 2,
            borderRadius: r,
            transform: [{ scale: glowing ? scale : 1 }],
            backgroundColor: glowing ? COLORS.glow : COLORS.btnBase,
            borderColor: glowing ? COLORS.glowDeep : COLORS.btnBorder,
            shadowOpacity: glowing ? 0.9 : 0,
          },
        ]}
      >
        <Text style={[styles.label, { fontSize: r * 0.72 }]} allowFontScaling={false}>
          {label}
        </Text>
        {sub ? (
          <Text style={[styles.sub, { fontSize: r * 0.22 }]} allowFontScaling={false}>
            {sub}
          </Text>
        ) : null}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    shadowColor: COLORS.glow,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  label: { fontFamily: FONT, fontWeight: 'bold', color: COLORS.ink },
  sub: { fontFamily: FONT, color: COLORS.inkSoft, marginTop: -2 },
})
