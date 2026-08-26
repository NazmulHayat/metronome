import { useEffect, useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useKeepAwake } from 'expo-keep-awake'
import { RecordingPresets, getRecordingPermissionsAsync, requestRecordingPermissionsAsync, useAudioRecorder } from 'expo-audio'
import { configureAudioSession, micMuted, play, setSoundOn, speakJa } from './src/audio'
import { layout } from './src/geometry'
import { DEFAULT_SETTINGS, loadProgress, loadSettings, saveProgress, saveSettings } from './src/store'
import { COLORS, FONT } from './src/theme'
import StartScreen from './src/components/StartScreen'
import GameScreen from './src/components/GameScreen'
import CelebrateScreen from './src/components/CelebrateScreen'
import SettingsPanel from './src/components/SettingsPanel'
import CalibrationOverlay from './src/components/CalibrationOverlay'
import SyncOverlay from './src/components/SyncOverlay'
import Pic from './src/components/Pic'
import { rodSync } from './src/sync'
import { VoiceDetector } from './src/voice'
import { BPM_MAX, BPM_MIN } from './src/tempo'

export default function App() {
  useKeepAwake()
  const { width, height } = useWindowDimensions()

  const [settings, setSettings] = useState(null)
  const [progress, setProgress] = useState({})
  const [mode, setMode] = useState('start') // start | play | celebrate
  const [result, setResult] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [calibOpen, setCalibOpen] = useState(false)
  const [syncOpen, setSyncOpen] = useState(false)
  const [micActive, setMicActive] = useState(false)
  const [gameKey, setGameKey] = useState(0)

  const voiceRef = useRef(new VoiceDetector(DEFAULT_SETTINGS.micSensitivityDb))
  const recorder = useAudioRecorder({ ...RecordingPresets.LOW_QUALITY, isMeteringEnabled: true })
  const [micLevel, setMicLevel] = useState(null) // { db, floor, heard } for the settings meter

  useEffect(() => {
    ;(async () => {
      const [s, p] = await Promise.all([loadSettings(), loadProgress()])
      setSoundOn(s.sound)
      setSettings(s)
      setProgress(p)
      configureAudioSession(false)
    })()
  }, [])

  // Mic lifecycle: record (for level metering only) while a session runs, and
  // while the settings sheet is open so the level meter there is live.
  useEffect(() => {
    if (!settings) return
    const wantMic = settings.micMode !== 'off' && (mode === 'play' || settingsOpen)
    let pollTimer = null
    let cancelled = false
    if (wantMic) {
      ;(async () => {
        try {
          // micMode can be restored from storage (or permission revoked in
          // iOS Settings) — never assume the toggle-time request still holds.
          let perm = await getRecordingPermissionsAsync()
          if (!perm.granted) perm = await requestRecordingPermissionsAsync()
          if (cancelled) return
          if (!perm.granted) {
            setMicActive(false)
            Alert.alert('Microphone', 'Voice check needs microphone access. Enable it for Metron in iOS Settings.')
            return
          }
          await configureAudioSession(true)
          await recorder.prepareToRecordAsync()
          if (cancelled) return
          recorder.record()
          setMicActive(true)
          const det = voiceRef.current
          det.setSensitivity(settings.micSensitivityDb)
          det.floor = null // re-learn the room each time the mic opens
          let uiTick = 0
          pollTimer = setInterval(() => {
            try {
              const st = recorder.getStatus()
              if (!st || typeof st.metering !== 'number') return
              const now = Date.now()
              // Skip anything the app itself is playing — ticks, pops, speech.
              if (micMuted(now)) det.noteMuted()
              else det.push(st.metering, now)
              // Drive the settings meter at ~8 Hz; no need to re-render faster.
              if (settingsOpen && ++uiTick % 8 === 0) {
                setMicLevel({ db: det.level, floor: det.floor, heard: det.heardSince(now - 400), muted: micMuted(now) })
              }
            } catch {}
          }, 50)
        } catch {
          setMicActive(false)
        }
      })()
    }
    return () => {
      cancelled = true
      if (pollTimer) clearInterval(pollTimer)
      if (wantMic) {
        setMicActive(false)
        setMicLevel(null)
        // release the mic before flipping the session back to playback-only
        recorder.stop().catch(() => {}).then(() => configureAudioSession(false))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, settingsOpen, settings?.micMode, settings?.micSensitivityDb])

  if (!settings) {
    return (
      <View style={[styles.root, styles.center]}>
        <Pic emoji="🦝" size={48} />
      </View>
    )
  }

  const lay = layout(width, height, settings.calib)

  const handleSettingsChange = async (next) => {
    if (next.micMode !== 'off' && settings.micMode === 'off') {
      const perm = await requestRecordingPermissionsAsync()
      if (!perm.granted) {
        Alert.alert('Microphone', 'Voice check needs microphone access. Enable it for Metron in iOS Settings.')
        next = { ...next, micMode: 'off' }
      }
    }
    setSoundOn(next.sound)
    setSettings(next)
    saveSettings(next)
  }

  const handleWordResult = (wordId, misses) => {
    setProgress((prev) => {
      const cur = prev[wordId] || { done: 0, missTotal: 0 }
      const next = { ...prev, [wordId]: { done: cur.done + 1, missTotal: cur.missTotal + misses } }
      saveProgress(next)
      return next
    })
  }

  const handleDone = (r) => {
    setResult(r)
    setMode('celebrate')
    play('fanfare')
    setTimeout(() => speakJa('よくできました！'), 400)
  }

  const startSession = () => {
    setGameKey((k) => k + 1)
    setMode('play')
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      {/* Soft scenery, mostly hidden when the phone sits inside the case */}
      <View style={styles.sky} />
      <View style={[styles.sun, { left: width * 0.72 }]} />
      <View style={styles.ground} />

      {mode === 'start' && (
        <StartScreen lay={lay} onStart={startSession} onOpenSettings={() => setSettingsOpen(true)} />
      )}
      {mode === 'play' && (
        <GameScreen
          key={gameKey}
          settings={settings}
          progress={progress}
          voiceRef={voiceRef}
          micActive={micActive}
          onWordResult={handleWordResult}
          onDone={handleDone}
          onOpenSettings={() => setSettingsOpen(true)}
          lay={lay}
        />
      )}
      {mode === 'celebrate' && (
        <CelebrateScreen lay={lay} result={result} onAgain={startSession} onOpenSettings={() => setSettingsOpen(true)} />
      )}

      {/* Corner tab for the parent. The long-press on the picture window still
          works; this exists because that gesture is undiscoverable, and the
          corner sits under the case when the phone is docked. */}
      {!settingsOpen && !calibOpen && !syncOpen && (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <Pressable style={styles.gear} onPress={() => setSettingsOpen(true)} hitSlop={12}>
            <Text style={styles.gearText} allowFontScaling={false}>Settings</Text>
          </Pressable>
        </View>
      )}

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onChange={handleSettingsChange}
          micLevel={micLevel}
          micActive={micActive}
          onOpenCalibration={() => {
            setSettingsOpen(false)
            setCalibOpen(true)
          }}
          onOpenSync={() => {
            setSettingsOpen(false)
            setSyncOpen(true)
          }}
          onClose={() => {
            setSettingsOpen(false)
            if (mode === 'play') setMode('start') // avoid resuming a half-run word with stale tempo
          }}
        />
      )}
      {syncOpen && (
        <SyncOverlay
          onApply={(bpm, anchor) => {
            rodSync.anchor = anchor
            handleSettingsChange({ ...settings, bpm: Math.min(BPM_MAX, Math.max(BPM_MIN, Math.round(bpm))) })
            setSyncOpen(false)
          }}
          onClose={() => setSyncOpen(false)}
        />
      )}
      {calibOpen && (
        <CalibrationOverlay
          lay={lay}
          calib={settings.calib}
          onChange={(calib) => handleSettingsChange({ ...settings, calib })}
          onClose={() => setCalibOpen(false)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  sky: { position: 'absolute', left: 0, right: 0, top: 0, height: '26%', backgroundColor: COLORS.bgSky, borderBottomLeftRadius: 60, borderBottomRightRadius: 60 },
  sun: { position: 'absolute', top: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.glow, opacity: 0.9 },
  ground: { position: 'absolute', left: -40, right: -40, bottom: 0, height: '14%', backgroundColor: '#CFE8C0', borderTopLeftRadius: 200, borderTopRightRadius: 200 },
  gear: { position: 'absolute', left: 10, top: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,253,247,0.72)', borderWidth: 1, borderColor: COLORS.cardBorder },
  gearText: { fontFamily: FONT, fontSize: 11, fontWeight: 'bold', color: COLORS.inkSoft },
})
