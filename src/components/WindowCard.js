import { Animated, Pressable, StyleSheet } from 'react-native'
import { COLORS } from '../theme'

// The 43×33mm picture window. Long-press opens the hidden parent settings.
export default function WindowCard({ win, shakeX, onOpenSettings, children }) {
  return (
    <Pressable
      onLongPress={onOpenSettings}
      delayLongPress={700}
      style={{ position: 'absolute', left: win.left, top: win.top, width: win.width, height: win.height }}
    >
      <Animated.View style={[styles.card, { borderRadius: win.radius, transform: [{ translateX: shakeX || 0 }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 4,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
})
