import { useCallback, useEffect, useRef } from 'react'
import type { Task } from '../types'
import type { GamePhase } from './useGameState'
import type { SpeechApi } from './useSpeech'
import { countPhrase, DEPART_PHRASES, PRAISE_PHRASES, RETRY_PHRASES, taskPhrase } from '../data/phrases'
import { playCheer, playDepartureRoll, playOops } from '../utils/sfx'

/**
 * Everything the game says and plays *because of a change in the game*, as
 * opposed to because of a touch. Touch sounds are fired straight from the
 * handlers that own the touch, so that they begin in the same millisecond; the
 * events in here follow a state change and are allowed a frame.
 *
 * Kept out of App on purpose: components stay dumb, and this is game logic.
 */

/**
 * How long a tapped wagon spends in the air: App's `FLY_MS`. The number is asked
 * for at the moment the wagon touches down, not a beat after it, because the word
 * has to name the thing while the thing is still the newest thing on screen.
 */
const COUNT_DELAY_MS = 340

function pick(list: readonly string[]): string {
  return list[Math.floor(Math.random() * list.length)]
}

interface Args {
  phase: GamePhase
  task: Task
  /** How many wagons are on the train right now. */
  wagonCount: number
  /**
   * Increments on every wagon the game accepts, replacements included. Counting
   * hangs off this rather than off `wagonCount`, because a replacement leaves the
   * count at one or lowers it — so a child who changes his mind would otherwise
   * hear nothing at all for the wagon he just chose.
   */
  placeSeq: number
  speech: SpeechApi
}

export interface GameAudioApi {
  /**
   * Call from a real pointer event, on every touch. Wakes the AudioContext, and
   * on the very first touch of the session also reads the task out loud — which
   * is the only legal moment to start speaking, because Chrome throws away any
   * utterance that is not owed to a gesture.
   */
  noteGesture: () => void
  /** Read the current task out loud. The task display calls this when tapped. */
  speakTask: () => void
}

export function useGameAudio({ phase, task, wagonCount, placeSeq, speech }: Args): GameAudioApi {
  const { speak, noteGesture: unlock } = speech
  const taskRef = useRef(task)
  const prevWagonsRef = useRef(wagonCount)
  const prevPlaceSeqRef = useRef(placeSeq)
  const prevPhaseRef = useRef<GamePhase>(phase)
  /**
   * One timer, holding at most one number: the newest one. Wagons that land
   * faster than the words can be said are not queued up and recited afterwards —
   * three wagons in a second used to produce "jedna / dva / tři" arriving 1.8 to
   * 2.7 s in, still counting after the train was finished. A number that cannot
   * be said over its own wagon is dropped, and the coupling clunk is the
   * confirmation instead.
   */
  const countTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Has the task for this round been read out yet? */
  const announcedRef = useRef<Task | null>(null)

  /** Guards against saying the same sentence twice inside one gesture. */
  const lastTaskSpeechRef = useRef(0)

  /** A number still waiting to be said is about a train that no longer exists. */
  const dropPendingCounts = useCallback(() => {
    if (countTimerRef.current !== null) {
      clearTimeout(countTimerRef.current)
      countTimerRef.current = null
    }
  }, [])

  const speakTask = useCallback(() => {
    // The very first touch of the session is often the touch on the task display
    // itself, which both unlocks speech and asks for the sentence — two calls, one
    // finger. A deliberate second tap a moment later still repeats the sentence.
    const now = performance.now()
    if (now - lastTaskSpeechRef.current < 150) return
    lastTaskSpeechRef.current = now
    const current = taskRef.current
    announcedRef.current = current
    speak(taskPhrase(current.count, current.cargo.id), 'task')
  }, [speak])

  const noteGesture = useCallback(() => {
    // The first gesture is the one chance to start speaking. Take it, and use it
    // to say the thing the child cannot read.
    if (unlock()) speakTask()
  }, [unlock, speakTask])

  /**
   * Declared first on purpose: effects run in declaration order, so the phase
   * effect below always reads the task belonging to the commit it is running in.
   */
  useEffect(() => {
    taskRef.current = task
  }, [task])

  useEffect(() => dropPendingCounts, [dropPendingCounts])

  /**
   * A new round: read the task. `speak` is a no-op until the first gesture, so
   * on a cold start this does nothing and the first touch does the announcing
   * instead — never a lost utterance, never one Chrome will discard.
   */
  useEffect(() => {
    if (phase !== 'playing') return
    if (announcedRef.current === task) return
    announcedRef.current = task
    speak(taskPhrase(task.count, task.cargo.id), 'task')
  }, [task, phase, speak])

  /**
   * Counting out loud. A wagon that arrives says its own number, so the child
   * hears the word at the moment he sees the wagon touch down — the count is
   * taught and the placement is confirmed by the same word. Delayed by the length
   * of the flight and no more: the clunk already answered the finger, in the same
   * millisecond, and this answers the landing.
   *
   * Timeliness is the whole value of it, so it is timely or it does not happen.
   * Only the newest number is ever pending here, and `useSpeech` will drop even
   * that one if it has aged past a frame or two, or if another number is already
   * being said. What it will not do is wait for the round's own task sentence:
   * that sentence is stopped mid-word instead, because the child who has just
   * placed a wagon has already acted on it, while the wagon is on screen now.
   * A number said a second after its wagon is not a slightly worse count, it is a
   * count of the wrong thing.
   */
  useEffect(() => {
    const prevSeq = prevPlaceSeqRef.current
    prevPlaceSeqRef.current = placeSeq
    const prev = prevWagonsRef.current
    prevWagonsRef.current = wagonCount
    const placed = placeSeq !== prevSeq
    // Nothing was placed: the count only ever went down, or a wagon came off, so
    // any number still waiting describes a train that no longer exists.
    if (!placed) {
      if (wagonCount !== prev || wagonCount === 0) dropPendingCounts()
      return
    }
    if (wagonCount === 0) {
      dropPendingCounts()
      return
    }
    // Two wagons inside one flight: the older number is dropped, not stacked.
    // "Dva" over the second wagon is true; "jedna" over it is not. A replacement
    // arrives here too, with the count it actually leaves behind — one.
    dropPendingCounts()
    const n = wagonCount
    countTimerRef.current = setTimeout(() => {
      countTimerRef.current = null
      speak(countPhrase(n), 'count')
    }, COUNT_DELAY_MS)
  }, [wagonCount, placeSeq, speak, dropPendingCounts])

  /** The three moments that are about the whole train rather than one wagon. */
  useEffect(() => {
    const prev = prevPhaseRef.current
    prevPhaseRef.current = phase
    if (phase === prev) return
    // The train is no longer being counted, so a number still on its way out
    // would arrive over the whistle or over the "try again".
    if (phase !== 'playing') dropPendingCounts()
    if (phase === 'departing') {
      // The whistle has already been blown by the finger that pressed the go
      // button; this is the roll that follows it — the sound of the reward.
      playDepartureRoll()
      speak(pick(DEPART_PHRASES), 'task')
      return
    }
    if (phase === 'celebrating') {
      playCheer()
      speak(pick(PRAISE_PHRASES), 'task')
      return
    }
    if (phase === 'wrong') {
      // Soft and low, then a friendly "again" and the task once more, because a
      // child who cannot read has no other way to check what was asked.
      playOops()
      const t = taskRef.current
      speak(`${pick(RETRY_PHRASES)} ${taskPhrase(t.count, t.cargo.id)}`, 'task')
      announcedRef.current = t
    }
  }, [phase, speak, dropPendingCounts])

  return { noteGesture, speakTask }
}
