# Metron — Speech-Therapy Metronome for Kids (Plan v1)

A phone app that lives inside the 3D-printed tanuki enclosure. A needle
oscillates like a metronome; each time it swings away from a side, the button
on that side glows, the child taps it and says the sound (mora). Rhythm paces
the speech. Target users: children ~2–9 years old, Japanese first.

**This phase: planning + a display-accurate prototype. No full app yet.**

---

## 1. The science (why a metronome helps speech)

**Metronome physics.** A mechanical metronome is an inverted pendulum with an
adjustable sliding weight. Small-angle period: `T = 2π√(L/g)` — the period
depends on effective pendulum length, not swing amplitude (isochronism), which
is why the beat stays even as the swing decays. Sliding the weight **up**
lengthens the effective pendulum → slower tempo; **down** → faster. One full
oscillation = **two beats** (a tick at each extreme). So 60 BPM = one tick per
second = a full left-right-left cycle every 2 seconds. Musical metronomes span
~40–208 BPM.

**Rhythmic Speech Cueing (RSC).** A recognized speech-therapy technique:
the client produces **one syllable (for Japanese: one mora) per beat** —
"syllable-timed speech." Used since the 1960s; near-complete fluency effects
observed in stuttering when speech is timed to a beat, and it's a component of
evidence-based children's programs (e.g., Lidcombe). The beat acts as an
external auditory scaffold for motor timing ("rhythmic entrainment").

**Tempo targets.** Natural conversation is ~150–180 syllables/min — far too
fast for practice. Therapy pacing starts *slower than the child's natural
rate*. Plan: adjustable **40–120 BPM**, default **~60 BPM** for ages 2–4,
ramping to 80–100 as the child succeeds. (Therapist input should tune this.)

**Japanese specifics.** Japanese rhythm is **mora-based** (ne-ko = 2 morae;
しょうぼうしゃ = しょ・う・ぼ・う・しゃ = 5 morae but only 3 syllables).
Research: children under ~9 actually segment by *syllable* first and shift to
morae as they learn kana — so **one glowing button per mora, with the kana
shown**, directly trains the mora awareness that kana literacy builds on.
Difficulty ladder for special morae: plain morae → long vowels (う/ー) →
sokuon (っ) → yōon (しゃ/しゅ/しょ).

## 2. Hardware ↔ screen mapping

**Phone: iPhone 16e** — body 71.5 × 146.7 mm; display 6.1″, 1170 × 2532 px
@ 460 ppi → active area **64.6 × 139.8 mm**, bezel ≈ 3.46 mm all around.
Web viewport: **390 × 844 pt @ 3×**. Conversion: **1 mm ≈ 6.04 pt**.

**Fixture plate (ASADA-01A):** 84 mm (bottom) / 72 mm (top) × 143 mm, 4 mm
thick. Openings:
- Picture window: **43 × 33 mm**, R4 corners (top edge ~120 mm from plate bottom — verify vs CAD)
- Two tap buttons: **Ø27 mm** circles, centers **40 mm apart** (center height ~30 mm from plate bottom — verify vs CAD)

**Estimated CSS coordinates** (plate centered on phone body; verify with calibration screen):

| Element | CSS geometry (pt, 390×844 viewport) |
|---|---|
| Picture window 43×33 mm | x: 65 → 325, y: 129 → 328 |
| Left button Ø27 mm | center (74, 673), r = 81.5 |
| Right button Ø27 mm | center (316, 673), r = 81.5 |

**Built-in calibration screen (must-have):** draws the window + circle
outlines with nudge arrows (offset x/y, scale); saved to localStorage. Print
tolerance is ±0.1 mm but *phone seating* inside the shell varies by
millimeters — never hardcode blind.

**Physical checks for the enclosure:**
- iPhone 16e mic + speaker are on the **bottom edge** — the shell needs acoustic openings there or mic detection and audio ticks will be muffled.
- Ø27 mm buttons ≥ the NN/g child touch-target minimum (20×20 mm) ✓.
- Keep the needle pivot clear of the circles' glow area.

## 3. The needle (rod)

Notes from 友廣さん (2026-08-23): the rod is a **real adjustable-weight
metronome** — sliding the square weight **up slows it, down speeds it up**.
Kids are naturally fascinated by it and try to stop it or dodge it with their
fingers. Metron leans into that: **press the button while dodging the moving
rod**, speaking on the beat at the same time.

The rod is the visible timekeeper; the app follows it:

- **Tap-along sync (implemented):** in settings, 「はりに あわせる」 — tap 8 times as the rod hits its **right** side. The app measures the rod's BPM (median interval) and anchors its beat grid *and glow parity* to the rod, so the glowing button is always the side the rod just left.
- Missed beats aren't punished — the same mora simply comes around on the rod's next pass (fingers in the rod's way included).
- Later options: micro-servo driven from the app (exact sync), or a fully virtual on-screen needle (already included, toggleable).
- The app's beat scheduler is drift-corrected against an absolute timeline — plain `setInterval` drifts far too much for a metronome.

## 4. Game design

**Core loop (revised per the feedback notes):**
1. Word appears in the window: picture + hiragana + model audio ("ねこ").
2. Needle swings **left** → left button glows with 「ね」→ child **taps + says** "ne".
3. Needle swings **right** → right button glows 「こ」→ tap + say "ko".
4. **Done — advance immediately.** No forced final full-word repetition (it bores the child; the notes are right). Occasionally (~1 in 4 words) invite the whole word as a "bonus star", skippable.
5. Words with 3+ morae alternate L-R-L-R (しょ・う・ぼ・う・しゃ = L R L R L).
6. Missed/early tap → gentle picture **shake**, and the same beat simply comes around on the next needle pass — waiting for the needle *is* the therapy.

**Voice detection:** use **voice-activity detection** (mic energy inside a
timing window around each beat, via `getUserMedia` + Web Audio analyser) — did
the child vocalize on the beat — **not** full speech recognition. Child ASR is
unreliable, especially ages 2–4; VAD is robust and honest. On-device ASR is a
later stretch goal for older kids.

**Spaced repetition (flashcard-style):** Leitner queue. Miss a word → it
re-enters the queue 2–3 words later; pass twice → longer interval; mastered →
resurfaces next session. Kills the "repeat neko five times in a row" boredom
while still repeating what needs repeating.

**Feedback & juice (per the notes):**
- Correct: big ✓ stamp on the picture + star burst + the tanuki character cheers; streaks build a rainbow.
- Wrong: center picture shakes softly; no harsh sounds, no "X".
- Every tap gives instant audio + visual response (kids this age need immediate feedback).
- Sounds: warm woodblock tick, cheerful chime, encouraging voice lines.

**Content plan (Japanese first):**
| Level | Morae | Examples |
|---|---|---|
| 1 | 2 | ねこ, いぬ, バス, りす |
| 2 | 3 | うさぎ, りんご, くるま, ぞうさん→later |
| 3 | 4–5, plain | オムライス, しんかんせん |
| 4 | special morae | しょうぼうしゃ (yōon+long), きって (sokuon) |

Categories: animals, **vehicles**, **foods** (per the notes) — pick sets of
8–12 per category, cute consistent illustration style.

**Kid-UX rules applied (ages 2–7):** tap only — no swipes/drags/pinch; huge
targets (ours are physical holes, guaranteed); minimal text, everything spoken;
bright but limited palette; hidden parent/therapist settings behind a
long-press gear; **Guided Access** (iOS kiosk mode) so random taps can't leave
the app; screen wake-lock so it never sleeps mid-session.

## 5. Tech stack & how to share it (your question)

**The "Expired" screen in your photo is the free-Apple-ID sideload limit:
apps signed with a free account die after 7 days.** Don't fight that. Options:

| Option | Cost | Shareable via LINE/Gmail? | Expiry | Verdict |
|---|---|---|---|---|
| **PWA (web app)** | free | ✅ just a URL | never | **← recommended** |
| TestFlight | $99/yr Apple Dev | ✅ invite link | 90 days/build | good later |
| Free-ID sideload | free | ❌ needs Mac + cable | **7 days** | what expired — avoid |

**Recommendation: build it as a web app (PWA), in Vue** (which you already
know from tugofwar), hosted free on Cloudflare Pages (or your Proxmox box).
Recipients open the link from LINE/Gmail in Safari → Share → **"Add to Home
Screen"** → it launches fullscreen like a native app, never expires, and every
deploy updates everyone instantly. Mic (`getUserMedia`), Web Audio, wake lock,
and localStorage all work in iOS Safari/home-screen web apps (iOS 16.4+).
Switch to native + TestFlight only if we later need on-device ASR or haptics.

## 6. Build phases

1. **P0 – Verify hardware facts:** confirm window/button positions against the CAD (my mm readings above are best-guess from the drawing); confirm mic/speaker openings; decide needle approach.
2. **P1 – Display prototype (the current ask):** static Vue page with the calibrated layout — glowing circles, picture window, needle arc — checked physically inside the printed shell using the calibration screen.
3. **P2 – Metronome engine:** Web-Audio scheduled ticks, alternating glow, BPM slider 40–120, tap-to-sync.
4. **P3 – Game loop:** 8 words, tap-on-beat scoring, ✓/shake feedback.
5. **P4 – Mic VAD** (tap + voice required).
6. **P5 – Spaced repetition, full word sets, parent settings.**
7. **P6 – Polish:** animations, sounds, playtest with real kids, tune tempos.
8. **P7 – Ship:** PWA manifest + Cloudflare Pages, share the link.

## 7. Open questions

- Exact vertical positions of window/circles (need CAD or a caliper check).
- Needle: keep physical (tuned pendulum) or motorize or go virtual?
- Therapist guidance on starting BPM per age band.
- Illustration source: draw, commission, or licensed set?
- Should a session have a fixed length (e.g., 10 words) with a big finish celebration? (Recommended: yes — clear endings matter for this age.)
