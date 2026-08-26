import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { DEFAULT_CALIB } from '../geometry'
import { COLORS, FONT } from '../theme'
import Pic from './Pic'

// Aligns the on-screen layout with the physical plate openings.
// Put the phone in the case, nudge until the outlines sit centered
// in the holes. Offsets are stored in millimeters.
export default function CalibrationOverlay({ lay, calib, onChange, onClose }) {
  const [target, setTarget] = useState('win') // 'win' | 'btn'
  const STEP = 0.5 // mm

  const nudge = (dx, dy) => {
    const patch =
      target === 'win'
        ? { winDx: +(calib.winDx + dx).toFixed(1), winDy: +(calib.winDy + dy).toFixed(1) }
        : { btnDx: +(calib.btnDx + dx).toFixed(1), btnDy: +(calib.btnDy + dy).toFixed(1) }
    onChange({ ...calib, ...patch })
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.backdrop]}>
      {/* Outlines at the currently calibrated positions */}
      <View
        pointerEvents="none"
        style={[styles.outline, { left: lay.win.left, top: lay.win.top, width: lay.win.width, height: lay.win.height, borderRadius: lay.win.radius }]}
      />
      {[lay.left, lay.right].map((b, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={[styles.outline, { left: b.cx - lay.btnR, top: b.cy - lay.btnR, width: lay.btnR * 2, height: lay.btnR * 2, borderRadius: lay.btnR }]}
        />
      ))}

      <View style={styles.panel}>
        <View style={styles.titleRow}>
          <Pic emoji="📐" size={16} />
          <Text style={styles.title} allowFontScaling={false}>Calibration</Text>
        </View>
        <Text style={styles.hint} allowFontScaling={false}>Nudge until the outlines line up with the case openings</Text>
        <View style={styles.segRow}>
          <Pressable style={[styles.seg, target === 'win' && styles.segOn]} onPress={() => setTarget('win')}>
            <Text style={[styles.segText, target === 'win' && styles.segTextOn]} allowFontScaling={false}>Window</Text>
          </Pressable>
          <Pressable style={[styles.seg, target === 'btn' && styles.segOn]} onPress={() => setTarget('btn')}>
            <Text style={[styles.segText, target === 'btn' && styles.segTextOn]} allowFontScaling={false}>Buttons</Text>
          </Pressable>
        </View>
        <View style={styles.pad}>
          <View style={styles.padRow}>
            <Arrow label="▲" onPress={() => nudge(0, -STEP)} />
          </View>
          <View style={styles.padRow}>
            <Arrow label="◀" onPress={() => nudge(-STEP, 0)} />
            <View style={{ width: 54 }} />
            <Arrow label="▶" onPress={() => nudge(STEP, 0)} />
          </View>
          <View style={styles.padRow}>
            <Arrow label="▼" onPress={() => nudge(0, STEP)} />
          </View>
        </View>
        <Text style={styles.values} allowFontScaling={false}>
          Window ({calib.winDx}, {calib.winDy})mm · Buttons ({calib.btnDx}, {calib.btnDy})mm
        </Text>
        <View style={styles.btnRow}>
          <Pressable style={styles.resetBtn} onPress={() => onChange({ ...DEFAULT_CALIB })}>
            <Text style={styles.resetText} allowFontScaling={false}>Reset</Text>
          </Pressable>
          <Pressable style={styles.okBtn} onPress={onClose}>
            <Text style={styles.okText} allowFontScaling={false}>OK</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

function Arrow({ label, onPress }) {
  return (
    <Pressable style={styles.arrow} onPress={onPress}>
      <Text style={styles.arrowText} allowFontScaling={false}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(30,20,12,0.55)' },
  outline: { position: 'absolute', borderWidth: 3, borderColor: '#4FE3C1', borderStyle: 'dashed' },
  panel: { position: 'absolute', left: 20, right: 20, bottom: 260, backgroundColor: COLORS.card, borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 3, borderColor: COLORS.cardBorder },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontFamily: FONT, fontSize: 16, fontWeight: 'bold', color: COLORS.ink },
  hint: { fontFamily: FONT, fontSize: 11, color: COLORS.inkSoft, marginTop: 2 },
  segRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  seg: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, backgroundColor: '#F3E8D2' },
  segOn: { backgroundColor: COLORS.teal },
  segText: { fontFamily: FONT, fontSize: 13, fontWeight: '600', color: COLORS.inkSoft },
  segTextOn: { color: '#fff' },
  pad: { marginTop: 8, alignItems: 'center' },
  padRow: { flexDirection: 'row', alignItems: 'center' },
  arrow: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.btnBase, borderWidth: 2, borderColor: COLORS.btnBorder, alignItems: 'center', justifyContent: 'center', margin: 3 },
  arrowText: { fontSize: 18, color: COLORS.ink },
  values: { fontFamily: FONT, fontSize: 11, color: COLORS.inkSoft, marginTop: 6 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  resetBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12, backgroundColor: '#F3E8D2' },
  resetText: { fontFamily: FONT, fontSize: 14, color: COLORS.inkSoft, fontWeight: '600' },
  okBtn: { paddingHorizontal: 28, paddingVertical: 9, borderRadius: 12, backgroundColor: COLORS.accent },
  okText: { fontFamily: FONT, fontSize: 14, color: '#fff', fontWeight: 'bold' },
})
