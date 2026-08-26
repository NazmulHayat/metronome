# メトロン (Metron)

Speech-therapy metronome game for kids (~2–9), built for the 3D-printed tanuki
device (fixture plate ASADA-01A) with an iPhone 16e inside. Japanese first.

The physical metronome rod swings; the button the rod just left **glows** with
one mora (「ね」…), the child **taps it and says the sound**. One beat = one
mora. Full design rationale in [PLAN.md](PLAN.md).

## Run it on your iPhone (development)

```bash
npm install
npx expo start --tunnel
```

Scan the QR code in the terminal with the iPhone camera → opens in **Expo Go**
(free on the App Store). `--tunnel` lets phones on other networks connect too.

## Share it with others (real app)

Native iOS distribution needs an Apple Developer account ($99/yr). Then:

```bash
npm install -g eas-cli
eas login              # your Expo account
eas init               # once, links the project
eas build -p ios       # cloud build (~15 min)
eas submit -p ios      # upload to App Store Connect
```

In App Store Connect → TestFlight → add the build to an **external group** →
copy the **public invite link**. Turn that link into a QR code and send it via
LINE/Gmail. Recipients install TestFlight, tap the link, done. Builds last 90
days; push a new one with the same two commands.

## Using it with the physical device

1. **Calibration** (once per printed case): long-press the picture window →
   おとなの設定 → 位置あわせ. Nudge the dashed outlines until they sit
   centered in the case openings. Saved on the phone.
2. **Rod sync**: start the rod, then 設定 → はりに あわせる → tap 8 times as
   the rod hits its **right** side. The app adopts the rod's tempo and phase.
   (Weight up = slower, weight down = faster.)
3. **Guided Access**: Settings → Accessibility → Guided Access, then
   triple-click the side button in the app, so kids can't leave it.
4. **Mic (voice check)**: 設定 → マイク. `ボーナス⭐` gives an extra star when
   the child speaks on the beat; `ひつよう` requires it. Levels only — nothing
   is recorded or stored.

## Structure

- [App.js](App.js) — mode switching, mic metering, settings/calibration/sync overlays
- [src/geometry.js](src/geometry.js) — mm → pt mapping of the fixture plate openings
- [src/audio.js](src/audio.js) — drift-corrected beat scheduler, sound effects, ja-JP TTS
- [src/words.js](src/words.js) — word bank pre-split into morae, session picker (Leitner-ish)
- [src/sync.js](src/sync.js) — tap-along rod sync (tempo + phase anchor)
- [src/components/GameScreen.js](src/components/GameScreen.js) — the game loop
- `assets/sounds/` — synthesized WAVs (regenerate: `python3 scripts/make_sounds.py`)
