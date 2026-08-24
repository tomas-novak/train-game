import { useCallback, useEffect, useRef, useState } from 'react'
import { isAudioMuted, resumeAudio, setAudioMuted } from '../utils/sfx'

/**
 * Spoken Czech. This is the single feature that makes "he cannot read a word"
 * stop mattering: the game says the task out loud instead of printing it.
 *
 * Three hard facts about `speechSynthesis` that this hook exists to absorb:
 *
 * 1. The voice list loads asynchronously. On Android Chrome the first
 *    `getVoices()` is empty and the real list arrives later on `voiceschanged`,
 *    so the voice is looked up again on every utterance rather than captured
 *    once at mount.
 * 2. The first utterance must belong to a real user gesture or Chrome discards
 *    it silently. So nothing here speaks until `noteGesture()` has been called
 *    from a pointer event; a mount effect would be thrown away.
 * 3. Startup latency is tens to hundreds of milliseconds. Speech can therefore
 *    never be the reaction to a touch — the Web Audio effect is, and speech
 *    follows it. Every utterance here is deliberately scheduled after the next
 *    paint so it cannot steal the frame the touch feedback needs.
 *
 * A device with no Czech voice loses the speech and keeps the sound effects.
 * Nothing in here can throw into a pointer handler.
 *
 * 4. `speechSynthesis` has one queue and one `cancel()`, which cancels the lot.
 *    So every utterance carries a priority. The sentence that tells the child
 *    what to build is `'task'` and may interrupt anything; a counted number is
 *    `'count'` and may neither interrupt nor wait.
 *
 *    "Nor wait" is the whole of it. A number is not a message, it is a label
 *    stuck onto the wagon that just landed, and a label that arrives after the
 *    thing has stopped moving is stuck to the wrong thing. Queued behind the
 *    task sentence, "jedna" was measured landing 976 ms after the wagon it
 *    named, and three fast taps recited numbers after the train was already
 *    finished — for a child learning to count that is worse than silence,
 *    because it teaches the word against the wrong object. So a count is now
 *    spoken only if it can be said immediately, and only while it is still
 *    fresh; otherwise it is thrown away and the wagon is confirmed by its clunk
 *    alone. Never queued, never more than one, never late.
 *
 * 5. "Immediately" cannot mean "only when the engine happens to be idle". Every
 *    round opens by reading its own task sentence, which holds the single queue
 *    for about two seconds, and a four-year-old touches a card long before a
 *    two-second sentence ends. Waiting for idle therefore dropped the number the
 *    child needs most — "jedna", on the very first wagon of every round — every
 *    single time (measured: taps at +200/+800/+1400 ms all landed inside the
 *    sentence and got no number at all).
 *
 *    So a fresh count is allowed to take the engine away from a sentence: cancel
 *    it, then say the number. This is not a queue jump, it is a priority
 *    inversion in the right direction. A sentence is an instruction that the
 *    child has, by placing a wagon, already acted on; it is still available on
 *    demand, because the task panel is a button that says it again. The number
 *    is a label on a thing that is on screen for one moment. One count never
 *    interrupts another count — a half-said "jedna" teaches nothing — and a
 *    stale count still expires rather than queueing.
 */

const MUTE_KEY = 'trainGameMuted.sky'
const LANG = 'cs-CZ'

/**
 * How old a counted number may be, at the moment the engine would start saying
 * it, and still be about the wagon the child is looking at. One frame of jitter
 * plus a little: past this the word is dropped rather than said late.
 */
const COUNT_MAX_AGE_MS = 120

/** How long to keep re-checking for a voice list that arrives without an event. */
const VOICE_POLL_MS = 500
const VOICE_POLL_TRIES = 12

/**
 * `'task'` — the sentence the game exists to say. Interrupts whatever is talking.
 * `'count'` — a number said over a landing wagon. Waits for nothing: said now or
 * not at all. May take the engine from a sentence, never from another number.
 */
export type SpeechPriority = 'task' | 'count'

/** Errors that mean this device is not going to speak Czech, ever. */
const FATAL_ERRORS = new Set([
  'language-unavailable',
  'voice-unavailable',
  'synthesis-unavailable',
  'synthesis-failed',
  'not-allowed',
])

/**
 * Not `'speechSynthesis' in window`: a platform can carry the property and still
 * hand back undefined, and calling a method on that would throw out of an effect
 * and take the whole game down with it. Anything falsy means "no speech here".
 */
function synth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null
  const s = (window as { speechSynthesis?: SpeechSynthesis }).speechSynthesis
  return s ? s : null
}

/**
 * A Czech voice, or null if the device has none. Re-read on every utterance:
 * the list is populated asynchronously and may still be empty at mount.
 */
function voiceList(s: SpeechSynthesis): SpeechSynthesisVoice[] {
  try {
    return s.getVoices()
  } catch {
    return []
  }
}

function czechVoice(s: SpeechSynthesis): SpeechSynthesisVoice | null {
  return (
    voiceList(s).find((v) => v.lang.toLowerCase().replace('_', '-').startsWith('cs')) ?? null
  )
}

/**
 * True when it is worth speaking at all: either a Czech voice is present, or the
 * list has not arrived yet and the platform may still resolve `cs-CZ` itself.
 * An answered list with no Czech in it means skip — better silent than a Czech
 * sentence read by an English voice.
 */
function canSpeak(s: SpeechSynthesis): boolean {
  return czechVoice(s) !== null || voiceList(s).length === 0
}

function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

/** Run after the next paint, so an utterance never lands inside the touch frame. */
function afterPaint(fn: () => void): void {
  requestAnimationFrame(() => {
    window.setTimeout(fn, 0)
  })
}

export interface SpeechApi {
  /**
   * Say something in Czech. Silently does nothing while muted, before the first
   * gesture, or on a device without a Czech voice.
   *
   * A `'task'` utterance cancels whatever is talking, because it is the thing the
   * child needs. A `'count'` utterance queues behind nothing: it either starts
   * within a frame of being asked for — cutting off a sentence if a sentence is
   * what is in the way — or it is dropped. It never cuts off another number, and
   * only the newest count request survives; a wagon is never named a second and a
   * half after it lands, and never named while it is still in the air.
   */
  speak: (text: string, priority?: SpeechPriority) => void
  cancel: () => void
  /**
   * Call from a real pointer event. Resumes the AudioContext and unlocks speech;
   * returns true exactly once, on the gesture that did the unlocking.
   */
  noteGesture: () => boolean
  muted: boolean
  toggleMuted: () => void
  /**
   * False once it is known that this device cannot say a Czech word — no speech
   * engine, no Czech voice, or an engine that refused. The mute button shows it,
   * because a silent instruction channel that looks switched on is a trap for the
   * parent: they would never learn why the child is not being told anything.
   */
  canSpeakCzech: boolean
}

export function useSpeech(): SpeechApi {
  const [muted, setMuted] = useState<boolean>(loadMuted)
  /**
   * Optimistic to start with: on Android Chrome the list is empty for the first
   * few hundred milliseconds and a Czech pack usually does turn up.
   */
  const [canSpeakCzech, setCanSpeakCzech] = useState<boolean>(() => {
    const s = synth()
    return s === null ? false : canSpeak(s)
  })
  /** Has a real gesture happened? Ref, not state: reading it must not re-render. */
  const unlockedRef = useRef(false)
  const mutedRef = useRef(muted)
  /**
   * The one count word waiting to be said, with the moment it was asked for. One
   * slot, not a list: a second wagon landing makes the first wagon's number
   * obsolete, so the newest request simply overwrites the older one.
   */
  const pendingCountRef = useRef<{ text: string; askedAt: number } | null>(null)
  /**
   * What the engine is saying right now, as far as this hook knows. Needed
   * because `speechSynthesis` reports *that* it is speaking but never *what*, and
   * the decision a landing wagon has to make is exactly that: a sentence may be
   * cut off for a number, another number may not.
   *
   * `id` guards against a late `onend`/`onerror` from an utterance that has
   * already been cancelled and replaced clearing the record of its replacement.
   */
  const liveRef = useRef<{ id: number; priority: SpeechPriority } | null>(null)
  const seqRef = useRef(0)

  // Push the stored preference into the audio engine before the first sound.
  useEffect(() => {
    mutedRef.current = muted
    setAudioMuted(muted)
    if (muted) {
      pendingCountRef.current = null
      liveRef.current = null
      synth()?.cancel()
    }
  }, [muted])

  /**
   * The voice list arrives late, and on some builds it arrives without firing
   * `voiceschanged` at all — hence the short poll as well as the event. The result
   * is published as state, because the mute button has to be able to show that
   * this device is never going to talk.
   */
  useEffect(() => {
    // The no-engine case is already settled by the state initialiser; there is
    // nothing to subscribe to and nothing to wait for.
    const s = synth()
    if (s === null) return
    let tries = 0
    const check = () => { setCanSpeakCzech(canSpeak(s)) }
    s.addEventListener?.('voiceschanged', check)
    // First look on the next task rather than inside the effect body: the list is
    // asynchronous anyway, and a synchronous setState here would only cost a render.
    const first = window.setTimeout(check, 0)
    const poll = window.setInterval(() => {
      tries += 1
      check()
      if (tries >= VOICE_POLL_TRIES || voiceList(s).length > 0) window.clearInterval(poll)
    }, VOICE_POLL_MS)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(poll)
      s.removeEventListener?.('voiceschanged', check)
      s.cancel()
    }
  }, [])

  /**
   * One Czech utterance, tuned for a four-year-old's ear, and registered as the
   * live one so that a wagon landing during it knows what it would be cutting off.
   */
  const utterance = useCallback((
    s: SpeechSynthesis,
    text: string,
    priority: SpeechPriority,
  ): SpeechSynthesisUtterance => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = LANG
    const v = czechVoice(s)
    if (v !== null) u.voice = v
    // Slower and slightly higher than default: a four-year-old needs the words
    // spaced out, and the game is a friendly thing, not a station PA.
    u.rate = 0.9
    u.pitch = 1.15
    seqRef.current += 1
    const id = seqRef.current
    liveRef.current = { id, priority }
    // Only the utterance that is still the live one may clear the slot; a
    // cancelled utterance's error arrives after its replacement has started.
    const settle = () => { if (liveRef.current?.id === id) liveRef.current = null }
    u.onend = settle
    u.onerror = (e) => {
      settle()
      // A cancel is not a failure; anything else means the engine cannot do this,
      // and the parent's button should stop claiming that it can.
      const err = (e as SpeechSynthesisErrorEvent).error
      if (typeof err === 'string' && FATAL_ERRORS.has(err)) setCanSpeakCzech(false)
    }
    return u
  }, [])

  /**
   * Say the newest pending number now, or throw it away. Ways to throw it away,
   * all of them better than saying it late:
   *   - it has already been superseded or invalidated (nothing in the slot),
   *   - another number is being said, and cutting that one in half teaches
   *     neither of the two,
   *   - the engine is busy with something this hook did not start, so there is
   *     nothing safe to interrupt,
   *   - it has gone stale while waiting for this frame.
   *
   * A sentence, though, gets cut off. It is the round's instruction, the child
   * has just acted on it, and the task panel will repeat it on demand — whereas
   * the number belongs to a wagon that is settling into place right now. Without
   * this, the first wagon of every round was silently uncounted, because the
   * round's own two-second sentence was still running.
   */
  const flushCount = useCallback(() => {
    const c = pendingCountRef.current
    pendingCountRef.current = null
    if (c === null) return
    if (mutedRef.current || isAudioMuted()) return
    const s = synth()
    if (s === null) return
    try {
      if (!canSpeak(s)) return
      const busy = s.speaking || s.pending
      if (busy && liveRef.current?.priority !== 'task') return
      // Freshness is judged before anything is torn down, so a number that is
      // already too old never costs the sentence that was talking.
      if (performance.now() - c.askedAt > COUNT_MAX_AGE_MS) return
      // Never queued: the sentence is stopped, then the number is said.
      if (busy) s.cancel()
      s.speak(utterance(s, c.text, 'count'))
    } catch {
      // A missing or broken speech engine must never break the game.
    }
  }, [utterance])

  const speak = useCallback((text: string, priority: SpeechPriority = 'task') => {
    if (mutedRef.current || isAudioMuted()) return
    if (!unlockedRef.current) return
    const s = synth()
    if (s === null) return
    if (priority === 'count') {
      // Newest wins, and the clock starts now — not after the paint — so the
      // freshness test measures the age of the *event*, not of the callback.
      pendingCountRef.current = { text, askedAt: performance.now() }
      afterPaint(flushCount)
      return
    }
    // A sentence is about to take the engine, which makes any number still
    // waiting a number about the previous moment. Dropped here, synchronously,
    // so it cannot slip out behind the sentence.
    pendingCountRef.current = null
    afterPaint(() => {
      if (mutedRef.current) return
      try {
        if (!canSpeak(s)) return
        // Interrupts anything, including a number: it is what the child is owed.
        s.cancel()
        s.speak(utterance(s, text, 'task'))
      } catch {
        // A missing or broken speech engine must never break the game.
      }
    })
  }, [flushCount, utterance])

  const cancel = useCallback(() => {
    try {
      pendingCountRef.current = null
      liveRef.current = null
      synth()?.cancel()
    } catch {
      // ignore
    }
  }, [])

  const noteGesture = useCallback((): boolean => {
    resumeAudio()
    if (unlockedRef.current) return false
    unlockedRef.current = true
    return true
  }, [])

  const toggleMuted = useCallback(() => {
    // Flipped off the ref, not off a state updater: this runs inside a pointer
    // event and the very next sound may be scheduled before React has committed,
    // so the engine has to know now.
    const next = !mutedRef.current
    mutedRef.current = next
    setAudioMuted(next)
    if (next) {
      try {
        pendingCountRef.current = null
        liveRef.current = null
        synth()?.cancel()
      } catch {
        // ignore
      }
    }
    try {
      localStorage.setItem(MUTE_KEY, next ? '1' : '0')
    } catch {
      // A locked-down browser simply forgets the preference.
    }
    setMuted(next)
  }, [])

  return { speak, cancel, noteGesture, muted, toggleMuted, canSpeakCzech }
}
