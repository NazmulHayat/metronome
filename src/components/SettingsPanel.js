import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import Slider from '@react-native-community/slider'
import { CATEGORIES } from '../words'
import { COLORS, FONT } from '../theme'
import Pic from './Pic'
import { BPM_MAX, BPM_MIN, tempoName } from '../tempo'

function Row({ label, children }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label} allowFontScaling={false}>{label}</Text>
      <View style={styles.rowRight}>{children}</View>
    </View>
  )
}

function Stepper({ value, onChange, min, max, step = 1, suffix = '' }) {
  return (
    <View style={styles.stepper}>
      <Pressable style={styles.stepBtn} onPress={() => onChange(Math.max(min, value - step))}>
        <Text style={styles.stepBtnText} allowFontScaling={false}>−</Text>
      </Pressable>
      <Text style={styles.stepValue} allowFontScaling={false}>{value}{suffix}</Text>
      <Pressable style={styles.stepBtn} onPress={() => onChange(Math.min(max, value + step))}>
        <Text style={styles.stepBtnText} allowFontScaling={false}>＋</Text>
      </Pressable>
    </View>
  )
}

// 40–208 like the physical metronome. Drag for coarse moves (committed on
// release so we don't spam AsyncStorage), −/＋ for single-BPM fine tuning.
function TempoSlider({ value, onChange }) {
  const [drag, setDrag] = useState(null)
  const shown = drag ?? value
  const nudge = (d) => onChange(Math.min(BPM_MAX, Math.max(BPM_MIN, value + d)))
  return (
    <View style={styles.tempo}>
      <View style={styles.tempoHeader}>
        <Text style={styles.tempoValue} allowFontScaling={false}>{shown} BPM</Text>
        <Text style={styles.tempoName} allowFontScaling={false}>{tempoName(shown)}</Text>
      </View>
      <View style={styles.tempoRow}>
        <Pressable style={styles.stepBtn} onPress={() => nudge(-1)}>
          <Text style={styles.stepBtnText} allowFontScaling={false}>−</Text>
        </Pressable>
        <Slider
          style={styles.tempoSlider}
          minimumValue={BPM_MIN}
          maximumValue={BPM_MAX}
          step={1}
          value={value}
          onValueChange={(v) => setDrag(Math.round(v))}
          onSlidingComplete={(v) => {
            setDrag(null)
            onChange(Math.round(v))
          }}
          minimumTrackTintColor={COLORS.teal}
          maximumTrackTintColor="#F3E8D2"
          thumbTintColor={COLORS.accent}
        />
        <Pressable style={styles.stepBtn} onPress={() => nudge(1)}>
          <Text style={styles.stepBtnText} allowFontScaling={false}>＋</Text>
        </Pressable>
      </View>
      <View style={styles.tempoScale}>
        <Text style={styles.tempoScaleText} allowFontScaling={false}>{BPM_MIN}</Text>
        <Text style={styles.tempoScaleText} allowFontScaling={false}>{BPM_MAX}</Text>
      </View>
    </View>
  )
}

// Live level, so "is the mic working" stops being guesswork. dBFS runs about
// -60 (silence) to 0 (loud); the marker shows the floor the detector has
// learned, and the bar turns green when it counts a sample as a voice.
function MicMeter({ level, active }) {
  const FLOOR_DB = -60
  const pct = (db) => Math.max(0, Math.min(1, (db - FLOOR_DB) / -FLOOR_DB))
  if (!active || !level || typeof level.db !== 'number') {
    return (
      <View style={styles.meterWrap}>
        <View style={styles.meterTrack} />
        <Text style={styles.meterText} allowFontScaling={false}>
          {active ? 'listening…' : 'starting the mic…'}
        </Text>
      </View>
    )
  }
  return (
    <View style={styles.meterWrap}>
      <View style={styles.meterTrack}>
        <View
          style={[
            styles.meterFill,
            { width: pct(level.db) * 100 + '%', backgroundColor: level.heard ? COLORS.good : COLORS.teal },
          ]}
        />
        {typeof level.floor === 'number' && (
          <View style={[styles.meterFloor, { left: pct(level.floor) * 100 + '%' }]} />
        )}
      </View>
      <Text style={styles.meterText} allowFontScaling={false}>
        {level.muted ? 'app is playing sound…' : Math.round(level.db) + ' dB'}
        {level.heard ? '  ·  heard you' : ''}
      </Text>
    </View>
  )
}

function Segmented({ value, options, onChange }) {
  return (
    <View style={styles.seg}>
      {options.map((o) => (
        <Pressable
          key={o.value}
          style={[styles.segItem, value === o.value && styles.segItemOn]}
          onPress={() => onChange(o.value)}
        >
          <Text style={[styles.segText, value === o.value && styles.segTextOn]} allowFontScaling={false}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  )
}

// Parent/therapist settings — opened with a long press on the picture window.
export default function SettingsPanel({ settings, onChange, onOpenCalibration, onOpenSync, onClose, micLevel, micActive }) {
  const set = (patch) => onChange({ ...settings, ...patch })

  return (
    <View style={[StyleSheet.absoluteFill, styles.backdrop]}>
      <View style={styles.sheet}>
        <Text style={styles.title} allowFontScaling={false}>Settings</Text>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <Row label="Tempo (BPM)">
            <TempoSlider value={Math.round(settings.bpm)} onChange={(bpm) => set({ bpm })} />
          </Row>
          <Pressable style={styles.calibBtn} onPress={onOpenSync}>
            <Pic emoji="🎯" size={17} />
            <Text style={styles.calibBtnText} allowFontScaling={false}>Tap-along sync</Text>
          </Pressable>
          <Row label="Words per session">
            <Stepper value={settings.sessionLength} min={4} max={20} step={2} onChange={(sessionLength) => set({ sessionLength })} />
          </Row>
          <Row label="Microphone (voice check)">
            <Segmented
              value={settings.micMode}
              options={[
                { value: 'off', label: 'Off' },
                { value: 'bonus', label: 'Bonus' },
                { value: 'required', label: 'Required' },
              ]}
              onChange={(micMode) => set({ micMode })}
            />
          </Row>
          {settings.micMode !== 'off' && (
            <Row label="Mic test — say a word">
              <MicMeter level={micLevel} active={micActive} />
              <View style={styles.sensRow}>
                <Text style={styles.sensLabel} allowFontScaling={false}>Sensitivity</Text>
                <Stepper
                  value={settings.micSensitivityDb}
                  min={4}
                  max={24}
                  step={2}
                  suffix=" dB"
                  onChange={(micSensitivityDb) => set({ micSensitivityDb })}
                />
              </View>
              <Text style={styles.note} allowFontScaling={false}>
                Lower = picks up quieter voices. The bar ignores the app's own ticks and speech.
              </Text>
            </Row>
          )}
          <Row label="Max morae per word">
            <Stepper value={settings.maxMorae} min={2} max={6} onChange={(maxMorae) => set({ maxMorae })} />
          </Row>
          <Row label="Hard sounds (っ・しゃ・ー)">
            <Switch value={settings.allowSpecial} onValueChange={(allowSpecial) => set({ allowSpecial })} trackColor={{ true: COLORS.teal }} />
          </Row>
          <Row label="Categories">
            <View style={styles.chips}>
              {CATEGORIES.map((c) => {
                const on = settings.categories.includes(c.id)
                return (
                  <Pressable
                    key={c.id}
                    style={[styles.chip, on && styles.chipOn]}
                    onPress={() => {
                      const categories = on
                        ? settings.categories.filter((x) => x !== c.id)
                        : [...settings.categories, c.id]
                      if (categories.length > 0) set({ categories })
                    }}
                  >
                    <Pic emoji={c.emoji} size={15} />
                    <Text style={[styles.chipText, on && styles.chipTextOn]} allowFontScaling={false}>{c.labelEn}</Text>
                  </Pressable>
                )
              })}
            </View>
          </Row>
          <Row label="Sound effects">
            <Switch value={settings.sound} onValueChange={(sound) => set({ sound })} trackColor={{ true: COLORS.teal }} />
          </Row>
          <Row label="On-screen needle">
            <Switch value={settings.showNeedle} onValueChange={(showNeedle) => set({ showNeedle })} trackColor={{ true: COLORS.teal }} />
          </Row>

          <Pressable style={styles.calibBtn} onPress={onOpenCalibration}>
            <Pic emoji="📐" size={17} />
            <Text style={styles.calibBtnText} allowFontScaling={false}>Case alignment / Calibration</Text>
          </Pressable>
          <Text style={styles.note} allowFontScaling={false}>
            Tip: turn on Guided Access in iOS Settings so your child can't leave the app.
          </Text>
        </ScrollView>
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText} allowFontScaling={false}>Close</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(74,55,40,0.45)', justifyContent: 'center', padding: 18 },
  sheet: { backgroundColor: COLORS.card, borderRadius: 22, padding: 18, maxHeight: '86%', borderWidth: 3, borderColor: COLORS.cardBorder },
  title: { fontFamily: FONT, fontSize: 18, fontWeight: 'bold', color: COLORS.ink, marginBottom: 10, textAlign: 'center' },
  row: { paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F3E8D2', gap: 6 },
  label: { fontFamily: FONT, fontSize: 14, color: COLORS.ink, fontWeight: '600' },
  rowRight: { alignItems: 'flex-start' },
  tempo: { alignSelf: 'stretch' },
  tempoHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 10 },
  tempoValue: { fontFamily: FONT, fontSize: 20, fontWeight: 'bold', color: COLORS.ink },
  tempoName: { fontFamily: FONT, fontSize: 13, color: COLORS.inkSoft, fontWeight: '600', fontStyle: 'italic' },
  tempoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tempoSlider: { flex: 1, height: 40 },
  tempoScale: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 52 },
  tempoScaleText: { fontFamily: FONT, fontSize: 11, color: COLORS.inkSoft },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.btnBase, borderWidth: 2, borderColor: COLORS.btnBorder, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 20, color: COLORS.ink, fontWeight: 'bold' },
  stepValue: { fontFamily: FONT, fontSize: 18, fontWeight: 'bold', color: COLORS.ink, minWidth: 46, textAlign: 'center' },
  meterWrap: { alignSelf: 'stretch', gap: 4 },
  meterTrack: { height: 14, borderRadius: 7, backgroundColor: '#F3E8D2', overflow: 'hidden', justifyContent: 'center' },
  meterFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 7 },
  meterFloor: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: COLORS.inkSoft, opacity: 0.55 },
  meterText: { fontFamily: FONT, fontSize: 12, color: COLORS.inkSoft },
  sensRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  sensLabel: { fontFamily: FONT, fontSize: 13, color: COLORS.ink, fontWeight: '600' },
  seg: { flexDirection: 'row', backgroundColor: '#F3E8D2', borderRadius: 12, padding: 3 },
  segItem: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9 },
  segItemOn: { backgroundColor: COLORS.teal },
  segText: { fontFamily: FONT, fontSize: 13, color: COLORS.inkSoft, fontWeight: '600' },
  segTextOn: { color: '#fff' },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#F3E8D2' },
  chipOn: { backgroundColor: COLORS.glow },
  chipText: { fontFamily: FONT, fontSize: 13, color: COLORS.inkSoft, fontWeight: '600' },
  chipTextOn: { color: COLORS.ink },
  calibBtn: { marginTop: 14, flexDirection: 'row', gap: 7, backgroundColor: COLORS.btnBase, borderWidth: 2, borderColor: COLORS.btnBorder, borderRadius: 14, padding: 12, alignItems: 'center', justifyContent: 'center' },
  calibBtnText: { fontFamily: FONT, fontSize: 15, fontWeight: 'bold', color: COLORS.ink },
  note: { fontFamily: FONT, fontSize: 11, color: COLORS.inkSoft, marginTop: 10, lineHeight: 16 },
  closeBtn: { marginTop: 12, backgroundColor: COLORS.accent, borderRadius: 14, padding: 13, alignItems: 'center' },
  closeBtnText: { fontFamily: FONT, fontSize: 16, fontWeight: 'bold', color: '#fff' },
})
