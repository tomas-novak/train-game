/**
 * The whole sound of the game, generated in code. No audio files, no
 * dependencies: oscillators, one shared noise buffer, and gain envelopes.
 *
 * Two timing rules this file exists to obey.
 *
 * 1. Constructing an AudioContext costs ~200 ms of main-thread work, which is
 *    longer than the entire "react within 100 ms" budget. So the context is
 *    built once, between frames, after the app has painted — never inside a
 *    pointer handler. It comes up `suspended` (no gesture yet); `resumeAudio()`
 *    is called from the first real touch, which is cheap and asynchronous.
 * 2. Scheduling a note on a live context is sub-millisecond, so every effect
 *    here is safe to fire synchronously from a pointerdown. Speech is not:
 *    that is why speech is a separate module and always follows the effect.
 *
 * Everything is wrapped so that a device with no Web Audio at all simply plays
 * nothing. Sound is a second channel, never the only one.
 */

let ctx: AudioContext | null = null
/** Master volume, and the mute switch: one gain node in front of everything. */
let master: GainNode | null = null
let noiseBuf: AudioBuffer | null = null
let warming = false
let muted = false

const MASTER_GAIN = 0.85

function ctor(): typeof AudioContext | undefined {
  const w = window as unknown as {
    AudioContext?: typeof AudioContext
    webkitAudioContext?: typeof AudioContext
  }
  return w.AudioContext ?? w.webkitAudioContext
}

/** Build the context between frames, so no pointer event ever waits for it. */
function warm(): void {
  if (ctx !== null || warming) return
  const Ctor = ctor()
  if (!Ctor) return
  warming = true
  requestAnimationFrame(() => {
    window.setTimeout(() => {
      try {
        const ac = new Ctor()
        const g = ac.createGain()
        g.gain.value = muted ? 0 : MASTER_GAIN
        g.connect(ac.destination)
        ctx = ac
        master = g
      } catch {
        // No audio on this device. The visible answer is the whole answer.
      }
    }, 0)
  })
}

if (typeof window !== 'undefined') warm()

/**
 * A suspended context makes no sound at all, and it stays suspended until a
 * gesture. Called from the first touch anywhere on the screen.
 */
export function resumeAudio(): void {
  const ac = ctx
  if (ac === null) {
    warm()
    return
  }
  if (ac.state === 'suspended') {
    try {
      void ac.resume()
    } catch {
      // Nothing to do; the game is still fully playable in silence.
    }
  }
}

/** Parent switch. Silence is immediate, and it also stops speech (see useSpeech). */
export function setAudioMuted(next: boolean): void {
  muted = next
  const g = master
  const ac = ctx
  if (g === null || ac === null) return
  try {
    g.gain.cancelScheduledValues(ac.currentTime)
    g.gain.setValueAtTime(next ? 0 : MASTER_GAIN, ac.currentTime)
  } catch {
    // ignore
  }
}

export function isAudioMuted(): boolean {
  return muted
}

/** One second of white noise, built once: the raw material of clunks and chuffs. */
function noise(ac: AudioContext): AudioBuffer {
  if (noiseBuf !== null) return noiseBuf
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate), ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  noiseBuf = buf
  return buf
}

/** The live context, or null when there is nothing to play into. */
function live(): { ac: AudioContext; out: GainNode } | null {
  const ac = ctx
  const out = master
  if (ac === null || out === null) {
    warm()
    return null
  }
  if (muted) return null
  if (ac.state === 'suspended') resumeAudio()
  return { ac, out }
}

interface ToneOpts {
  from: number
  to?: number
  ms: number
  gain: number
  type?: OscillatorType
  /** Seconds from now. */
  delay?: number
  /** Attack length in seconds; short for percussion, longer for a whistle. */
  attack?: number
}

function tone({ from, to, ms, gain, type = 'triangle', delay = 0, attack = 0.012 }: ToneOpts): void {
  const l = live()
  if (l === null) return
  try {
    const { ac, out } = l
    const t0 = ac.currentTime + delay
    const dur = ms / 1000
    const osc = ac.createOscillator()
    const amp = ac.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(from, t0)
    if (to !== undefined && to !== from) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur)
    amp.gain.setValueAtTime(0.0001, t0)
    amp.gain.linearRampToValueAtTime(gain, t0 + Math.min(attack, dur * 0.5))
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(amp)
    amp.connect(out)
    osc.start(t0)
    osc.stop(t0 + dur + 0.02)
  } catch {
    // Audio is a bonus channel; losing it must never break the game.
  }
}

interface HissOpts {
  ms: number
  gain: number
  /** Centre of the band the noise is squeezed through. */
  freq: number
  q?: number
  filter?: BiquadFilterType
  delay?: number
  attack?: number
}

function hiss({ ms, gain, freq, q = 1, filter = 'bandpass', delay = 0, attack = 0.006 }: HissOpts): void {
  const l = live()
  if (l === null) return
  try {
    const { ac, out } = l
    const t0 = ac.currentTime + delay
    const dur = ms / 1000
    const src = ac.createBufferSource()
    src.buffer = noise(ac)
    src.loop = true
    const bq = ac.createBiquadFilter()
    bq.type = filter
    bq.frequency.setValueAtTime(freq, t0)
    bq.Q.setValueAtTime(q, t0)
    const amp = ac.createGain()
    amp.gain.setValueAtTime(0.0001, t0)
    amp.gain.linearRampToValueAtTime(gain, t0 + Math.min(attack, dur * 0.5))
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    src.connect(bq)
    bq.connect(amp)
    amp.connect(out)
    src.start(t0)
    src.stop(t0 + dur + 0.02)
  } catch {
    // ignore
  }
}

/**
 * A wagon joins the train: the coupling clunk. Two layers, because a single
 * oscillator sounds like a beep and a beep is not a piece of steel meeting
 * another piece of steel — a short low thud plus a wooden knock on top.
 */
export function playCouple(): void {
  hiss({ ms: 90, gain: 0.5, freq: 260, q: 0.7, filter: 'lowpass', attack: 0.002 })
  tone({ from: 165, to: 62, ms: 150, gain: 0.34, type: 'sine', attack: 0.004 })
  tone({ from: 520, to: 300, ms: 90, gain: 0.14, type: 'triangle', delay: 0.008, attack: 0.003 })
}

/**
 * The engine goes on the rails. Deliberately NOT the coupling clunk: coupling is
 * one wagon meeting another, and the child is doing two different things with two
 * different rows of cards. So this one rises where the clunk falls — a warm low
 * rumble that comes up to a hum, the engine waking rather than steel meeting steel.
 */
export function playEngine(): void {
  hiss({ ms: 280, gain: 0.32, freq: 150, q: 0.6, filter: 'lowpass', attack: 0.02 })
  tone({ from: 70, to: 130, ms: 300, gain: 0.3, type: 'sine', attack: 0.05 })
  tone({ from: 210, to: 330, ms: 260, gain: 0.1, type: 'triangle', delay: 0.05, attack: 0.04 })
}

/**
 * "No, THIS one." A wagon of a different load was tapped, so the wagons already
 * coupled roll off and this one starts the train.
 *
 * It has to be a third sound, distinguishable by ear from both of the two it sits
 * between, because it is a third thing that can happen to a tap. Against the
 * coupling clunk (a low thud that falls) it is a bright hiss that *rises*; against
 * the refusal's sag (quiet, low, falling, two soft notes) it is louder, higher and
 * going the other way. Three parts, in the order the picture on screen shows them:
 * the old wagons rolling away, the new load arriving, and the coupling that closes
 * it — so what the child hears is a swap and never a scolding.
 */
export function playSwap(): void {
  // the old ones rolling off: a filtered sweep away from the ear
  hiss({ ms: 200, gain: 0.3, freq: 1100, q: 0.7, filter: 'bandpass', attack: 0.004 })
  // the new load arriving: rising, which nothing else that answers a tap does
  tone({ from: 300, to: 620, ms: 220, gain: 0.2, type: 'triangle', attack: 0.01 })
  // and it does go on, so it ends on a light knock rather than in mid-air
  tone({ from: 700, to: 420, ms: 90, gain: 0.13, type: 'sine', delay: 0.19, attack: 0.004 })
}

/**
 * Refused. A low, soft two-note wobble that sags rather than buzzes: the child
 * hears "not that one", never "you are wrong". It is deliberately the quietest
 * and lowest thing in the game, and nothing about it is a buzzer.
 */
export function playOops(): void {
  tone({ from: 300, to: 205, ms: 150, gain: 0.13, type: 'sine', attack: 0.02 })
  tone({ from: 250, to: 168, ms: 170, gain: 0.11, type: 'sine', delay: 0.13, attack: 0.02 })
}

/**
 * "This one instead." The other half of a refusal, and it must not sound like
 * either the clunk or the sag: two quick rising notes, like a finger tapping
 * the thing it wants you to look at.
 */
export function playPoint(): void {
  tone({ from: 700, to: 720, ms: 80, gain: 0.12, type: 'triangle', attack: 0.006 })
  tone({ from: 1040, to: 1060, ms: 110, gain: 0.11, type: 'triangle', delay: 0.1, attack: 0.006 })
}

/**
 * Any touch that is not a card. Tiny and dry — its whole job is to prove the
 * screen is alive within the same millisecond as the finger landing.
 */
export function playTick(): void {
  tone({ from: 880, to: 660, ms: 45, gain: 0.07, type: 'triangle', attack: 0.003 })
}

/** Unmuted: a short bright confirmation, so the parent hears that it worked. */
export function playUnmute(): void {
  tone({ from: 660, ms: 90, gain: 0.12, type: 'triangle', attack: 0.008 })
  tone({ from: 990, ms: 130, gain: 0.11, type: 'triangle', delay: 0.09, attack: 0.008 })
}

/** The steam whistle: two detuned voices plus the breath around them. */
export function playWhistle(delay = 0): void {
  tone({ from: 690, to: 660, ms: 620, gain: 0.16, type: 'triangle', delay, attack: 0.05 })
  tone({ from: 1035, to: 990, ms: 620, gain: 0.11, type: 'triangle', delay, attack: 0.06 })
  hiss({ ms: 640, gain: 0.05, freq: 2000, q: 0.8, delay, attack: 0.06 })
}

/**
 * The go button was pressed on a train that will NOT be sent: air brakes, not a
 * whistle. Deliberately built as the whistle's opposite on every axis a
 * four-year-old can hear — a falling pitch instead of a held rising one, a short
 * escaping hiss instead of a 620 ms steam voice, and over in a quarter second.
 * "The train stayed here", never "the train left".
 */
export function playBrake(): void {
  hiss({ ms: 250, gain: 0.2, freq: 1250, q: 0.9, attack: 0.004 })
  tone({ from: 224, to: 96, ms: 270, gain: 0.15, type: 'sine', attack: 0.006 })
}

/** One chuff: a puff of steam through the stack. */
export function playChuff(delay = 0, gain = 0.28): void {
  hiss({ ms: 130, gain, freq: 480, q: 1.1, delay, attack: 0.004 })
  tone({ from: 110, to: 70, ms: 110, gain: gain * 0.4, type: 'sine', delay, attack: 0.004 })
}

/**
 * The departure roll: the chuffs, starting slow and speeding up as the train
 * picks up the slack, laid out over the departure animation.
 *
 * Deliberately without the whistle. The whistle belongs to the finger: the go
 * button blows it inside its own pointer event, which is the only way a
 * four-year-old hears "departure" in the same millisecond as his own press.
 * By the time the phase actually turns to `departing` the whistle is already
 * sounding, and a departure that whistles twice is two trains.
 */
export function playDepartureRoll(): void {
  let at = 0.42
  let step = 0.2
  for (let i = 0; i < 9; i++) {
    playChuff(at, 0.3 - i * 0.015)
    at += step
    step = Math.max(0.085, step * 0.86)
  }
}

/** A correct train: a little rising fanfare, plus a sparkle on top. */
export function playCheer(): void {
  const notes = [523, 659, 784, 1046]
  notes.forEach((f, i) => {
    tone({ from: f, ms: 200, gain: 0.15, type: 'triangle', delay: i * 0.09, attack: 0.008 })
  })
  tone({ from: 1568, to: 2093, ms: 260, gain: 0.09, type: 'sine', delay: 0.38, attack: 0.02 })
  hiss({ ms: 300, gain: 0.05, freq: 3200, q: 0.7, delay: 0.38, attack: 0.03 })
}
