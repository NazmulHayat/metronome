import { useEffect, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'

// Virtual metronome needle, pivoting at its bottom like the physical one.
// side: 0 = left, 1 = right. Sweeps over one beat interval.
export default function Needle({ pivot, len, side, beatMs, visible }) {
  const rot = useRef(new Animated.Value(0.5)).current

  useEffect(() => {
    Animated.timing(rot, {
      toValue: side,
      duration: Math.max(120, beatMs),
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    }).start()
  }, [side, beatMs, rot])

  if (!visible) return null
  const deg = rot.interpolate({ inputRange: [0, 1], outputRange: ['-26deg', '26deg'] })
  const w = 12

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: pivot.x - w / 2,
        top: pivot.y - len,
        width: w,
        height: len,
        transform: [{ translateY: len / 2 }, { rotate: deg }, { translateY: -len / 2 }],
      }}
    >
      <View style={{ flex: 1, borderRadius: w / 2, backgroundColor: '#B08968', borderWidth: 2, borderColor: '#8A6746' }} />
      <View
        style={{
          position: 'absolute',
          top: -w * 0.9,
          left: -w * 0.4,
          width: w * 1.8,
          height: w * 1.8,
          borderRadius: w,
          backgroundColor: '#8A6746',
        }}
      />
    </Animated.View>
  )
}
