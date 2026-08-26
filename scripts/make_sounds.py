"""Synthesize the game's sound effects as WAV files (no external deps)."""
import wave, struct, math, os, random

SR = 44100
OUT = "/Users/nazmulhayat/Desktop/Programming/metron/assets/sounds"
os.makedirs(OUT, exist_ok=True)

def write_wav(name, samples):
    path = os.path.join(OUT, name)
    with wave.open(path, "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", max(-32767, min(32767, int(s * 32767)))) for s in samples))
    print(name, round(len(samples) / SR, 2), "s")

def tone(freq, dur, amp=0.5, decay=8.0, harm=None):
    n = int(SR * dur)
    out = []
    for i in range(n):
        t = i / SR
        env = math.exp(-decay * t) * min(1.0, i / 80)  # tiny attack ramp, exp decay
        s = math.sin(2 * math.pi * freq * t)
        if harm:
            for mult, a in harm:
                s += a * math.sin(2 * math.pi * freq * mult * t)
        out.append(amp * env * s)
    return out

def mix(*tracks):
    n = max(len(t) for t in tracks)
    return [sum(t[i] if i < len(t) else 0.0 for t in tracks) for i in range(n)]

def delay(track, sec):
    return [0.0] * int(SR * sec) + track

# tick: warm woodblock — short 950Hz knock with a 1.6x harmonic
write_wav("tick.wav", tone(950, 0.09, amp=0.85, decay=45, harm=[(1.62, 0.4), (2.9, 0.15)]))

# pop: success tap — quick rising blip
n = int(SR * 0.12)
pop = []
for i in range(n):
    t = i / SR
    f = 500 + 700 * (t / 0.12)
    pop.append(0.6 * math.exp(-22 * t) * math.sin(2 * math.pi * f * t))
write_wav("pop.wav", pop)

# chime: word complete — C5 E5 G5 arpeggio with bell harmonics
bell = [(2.0, 0.35), (3.0, 0.12)]
write_wav("chime.wav", mix(
    tone(523.25, 0.7, 0.42, 5, bell),
    delay(tone(659.25, 0.7, 0.42, 5, bell), 0.11),
    delay(tone(783.99, 0.9, 0.45, 4, bell), 0.22),
))

# boop: gentle "not that one" — soft low sine, no harshness
write_wav("boop.wav", tone(240, 0.18, amp=0.35, decay=14, harm=[(0.5, 0.3)]))

# fanfare: session complete — C E G C6 + sparkle
write_wav("fanfare.wav", mix(
    tone(523.25, 0.5, 0.4, 4, bell),
    delay(tone(659.25, 0.5, 0.4, 4, bell), 0.14),
    delay(tone(783.99, 0.5, 0.4, 4, bell), 0.28),
    delay(tone(1046.5, 1.2, 0.5, 3, bell), 0.42),
    delay(tone(1567.98, 0.8, 0.2, 5, bell), 0.62),
))
