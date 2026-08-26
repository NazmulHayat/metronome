import { StyleSheet, Text, View } from 'react-native'
import { COLORS, FONT } from '../theme'
import CircleButton from './CircleButton'
import WindowCard from './WindowCard'
import Pic from './Pic'

export default function StartScreen({ lay, onStart, onOpenSettings }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <WindowCard win={lay.win} onOpenSettings={onOpenSettings}>
        <Pic emoji="🦝" size={64} />
        <Text style={styles.title} allowFontScaling={false}>メトロン</Text>
        <Text style={styles.hint} allowFontScaling={false}>まるを タップして スタート！</Text>
      </WindowCard>
      <CircleButton cx={lay.left.cx} cy={lay.left.cy} r={lay.btnR} glowing label="▶" onPress={onStart} />
      <CircleButton cx={lay.right.cx} cy={lay.right.cy} r={lay.btnR} glowing label="▶" onPress={onStart} />
    </View>
  )
}

const styles = StyleSheet.create({
  mascot: { fontSize: 64 },
  title: { fontFamily: FONT, fontSize: 26, fontWeight: 'bold', color: COLORS.ink, marginTop: 2 },
  hint: { fontFamily: FONT, fontSize: 13, color: COLORS.inkSoft, marginTop: 4 },
})
