import { useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { bpmFromTaps } from '../sync'
import { COLORS, FONT } from '../theme'
import Pic from './Pic'

// Tap along with the physical rod: tap each time it hits the RIGHT side.
// From ≥4 taps we get its tempo (median interval) and a phase anchor,
// so the app's glow follows the real rod.
export default function SyncOverlay({ onApply, onClose }) {
  const tapsRef = useRef([])
  const [count, setCount] = useState(0)
  const [bpm, setBpm] = useState(null)

  const tap = () => {
    const now = Date.now()
    const taps = tapsRef.current
    // A long pause means they stopped and restarted — reset the run.
    if (taps.length && now - taps[taps.length - 1] > 3000) taps.length = 0
    taps.push(now)
    if (taps.length > 12) taps.shift()
    setCount(taps.length)
    setBpm(bpmFromTaps(taps))
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.backdrop]}>
      <View style={styles.panel}>
        <View style={styles.titleRow}>
          <Pic emoji="🎯" size={18} />
          <Text style={styles.title} allowFontScaling={false}>Tap-along sync</Text>
        </View>
        <Text style={styles.hint} allowFontScaling={false}>
          Tap in time with the rod — once each time it reaches the{'\n'}RIGHT side. About 8 taps.
        </Text>
        <Pressable style={styles.tapBtn} onPress={tap}>
          <Text style={styles.tapBtnText} allowFontScaling={false}>TAP</Text>
        </Pressable>
        <Text style={styles.readout} allowFontScaling={false}>
          {count} taps {bpm ? `· ${Math.round(bpm * 10) / 10} BPM` : ''}
        </Text>
        <View style={styles.btnRow}>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText} allowFontScaling={false}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.okBtn, !bpm && styles.okBtnOff]}
            disabled={!bpm}
            onPress={() => onApply(bpm, tapsRef.current[tapsRef.current.length - 1])}
          >
            <Text style={styles.okText} allowFontScaling={false}>Use this tempo</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(74,55,40,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  panel: { backgroundColor: COLORS.card, borderRadius: 22, padding: 20, alignItems: 'center', borderWidth: 3, borderColor: COLORS.cardBorder, alignSelf: 'stretch' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  title: { fontFamily: FONT, fontSize: 18, fontWeight: 'bold', color: COLORS.ink },
  hint: { fontFamily: FONT, fontSize: 13, color: COLORS.inkSoft, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  tapBtn: { width: 150, height: 150, borderRadius: 75, backgroundColor: COLORS.glow, borderWidth: 6, borderColor: COLORS.glowDeep, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  tapBtnText: { fontFamily: FONT, fontSize: 30, fontWeight: 'bold', color: COLORS.ink },
  readout: { fontFamily: FONT, fontSize: 16, color: COLORS.ink, fontWeight: 'bold', marginTop: 12, minHeight: 22 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F3E8D2' },
  cancelText: { fontFamily: FONT, fontSize: 14, color: COLORS.inkSoft, fontWeight: '600' },
  okBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.teal },
  okBtnOff: { opacity: 0.4 },
  okText: { fontFamily: FONT, fontSize: 14, color: '#fff', fontWeight: 'bold' },
})
