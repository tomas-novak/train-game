import { useState, useCallback, useEffect, useRef } from 'react'
import type { Task, GameProgress, ValidationResult, TrainItem, KeyedTrainItem, WagonType } from '../types'
import { LEVELS, CORRECT_PER_LEVEL } from '../data/levels'
import { pickWanted, validateTrain } from '../utils/validation'
import { generateTask } from '../utils/random'
import { canAddToTrain, placedLoco, placedWagons, trainTap } from '../utils/train'
import type { TrainTap } from '../utils/train'
import { readMode } from '../utils/mode'

/**
 * May a wagon of a different load sweep the coupled load off the rails?
 *
 * Only on the classic screen. In world mode a wrong pick is refused outright and
 * the rake is left standing — see `trainTap`, which carries the measured reason.
 * Read once, at module load, because the mode is a property of the URL and a mode
 * change is a reload.
 */
const IS_WORLD = readMode() === 'world'
const ALLOW_REPLACE = !IS_WORLD
/**
 * Does the PICK itself decide, or only the finished train?
 *
 * World mode: the pick decides, in the frame of the touch — see `pickWanted` in
 * utils/validation.ts for the measurement that forced it. Classic: only the
 * finished train, exactly as section A shipped it.
 */
const GATE_PICK = IS_WORLD

const STORAGE_KEY = 'trainGameProgress.sky'
// Key intentionally versioned with ".sky" to reset progress when the Sky theme
// redesign shipped — avoids loading stale progress from the old schema.

const DEPART_MS = 1800
const CELEBRATE_MS = 2200
const PULSE_MS = 600

function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as GameProgress
      if (typeof parsed.level === 'number' && typeof parsed.correctInLevel === 'number') {
        return {
          level: Math.min(Math.max(1, parsed.level), LEVELS.length),
          correctInLevel: Math.max(0, parsed.correctInLevel),
        }
      }
    }
  } catch {
    // ignore malformed data
  }
  return { level: 1, correctInLevel: 0 }
}

function saveProgress(progress: GameProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

const initialProgress = loadProgress()

export type GamePhase = 'playing' | 'departing' | 'celebrating' | 'wrong'

/** The outcome of a placement: the item that went on, and what came off for it. */
export interface PlaceResult {
  key: number
  /** Keys of the wagons of the other load that this tap replaced. Usually empty. */
  replaced: number[]
}

export interface GameState {
  task: Task
  progress: GameProgress
  phase: GamePhase
  trainItems: KeyedTrainItem[]
  validation: ValidationResult | null
  atCap: boolean
  maxWagons: number
  /**
   * Is the train standing on the rails right now *exactly* the train the go
   * button will accept — engine present, wagon type correct, count correct?
   *
   * The one thing in this game allowed to turn anything green. Green used to mean
   * two different things: "a wagon coupled on" (every placement) and "the count is
   * full" (which fired on a full train of the wrong wagons, with the signal still
   * red and the go button about to refuse it). One colour, two meanings, one of
   * them false. Now the correctness green has exactly one source and it is this
   * boolean, so the signal lamp, the ground wash and the counter plate can only
   * ever say a true thing.
   *
   * Deliberately the same call `submit` makes, from the same two inputs, so "it
   * looks right" and "it is accepted" cannot come apart.
   */
  isRight: boolean
  /** `isRight`, ignoring one key: the wagon that is accepted but still in flight. */
  isRightExcluding: (hiddenKey: number | null) => boolean
  shakeKey: number
  /** Increments on every accepted wagon placement, replacements included. */
  placeSeq: number
  pulseTask: boolean
  /**
   * Is the train RIGHT at this instant, read from the authoritative mirror rather
   * than from the frame on screen. `isRight` above drives paint and so must agree
   * with what the child can see; this one is for decisions taken inside a pointer
   * event, where the last placement may not have re-rendered yet.
   */
  isRightNow: () => boolean
  /** The authoritative train, correct *during* a pointer event. Never for paint. */
  liveTrain: () => KeyedTrainItem[]
  /** Synchronous, authoritative: true only if this item can go on right now. */
  canAdd: (item: TrainItem) => boolean
  /**
   * What a tap on this item would do right now — see `TrainTap`. The caller needs
   * the difference between 'add' and 'replace' *before* the placement, because a
   * replacement has to photograph the wagons that are about to leave.
   */
  tapKind: (item: TrainItem) => TrainTap
  /**
   * Places the item and reports what happened, or null if it was refused. Never
   * silent. `key` lets the caller animate exactly this item into place; `replaced`
   * is the keys of the wagons that came off to make room for it, which the caller
   * animates off the rails.
   */
  addToTrain: (item: TrainItem) => PlaceResult | null
  removeFromTrain: (key: number) => void
  submit: () => void
  nextRound: () => void
  resetProgress: () => void
}

export function useGameState(): GameState {
  const [progress, setProgress] = useState<GameProgress>(initialProgress)
  const [task, setTask] = useState<Task>(() =>
    generateTask(LEVELS[initialProgress.level - 1])
  )
  const [phase, setPhaseState] = useState<GamePhase>('playing')
  const [trainItems, setTrainItems] = useState<KeyedTrainItem[]>([])
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [shakeKey, setShakeKey] = useState(0)
  /**
   * Bumped once for every wagon the game actually takes, replacements included.
   * A replacement leaves the count at one, or lowers it, so anything listening for
   * "a wagon just landed" cannot use the count alone — it would miss exactly the
   * placements a child makes when he changes his mind.
   */
  const [placeSeq, setPlaceSeq] = useState(0)
  const [pulseTask, setPulseTask] = useState(false)
  const keyCounter = useRef(0)
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Mirror of trainItems that is correct *during* the pointer event, before
  // React has re-rendered. Every accept/refuse decision reads this, so two
  // taps 60 ms apart cannot both be told "yes" for the same last slot.
  const trainRef = useRef<KeyedTrainItem[]>([])
  // Same trick for the phase. A placement decided during a pointer event must
  // know whether the round is still open, and `phase` in the render closure can
  // be a frame stale — which is long enough for a tap during the 1.8 s departure
  // to rebuild an already-validated train and still collect the round.
  const phaseRef = useRef<GamePhase>('playing')
  /** Sets the phase and its synchronous mirror together, so they cannot drift. */
  const setPhase = useCallback(
    (next: GamePhase | ((p: GamePhase) => GamePhase)) => {
      setPhaseState((p) => {
        const resolved = typeof next === 'function' ? next(p) : next
        phaseRef.current = resolved
        return resolved
      })
    },
    [],
  )
  /** Is the round open to placements at all? False while the train departs. */
  const roundIsOpen = useCallback(
    () => phaseRef.current === 'playing' || phaseRef.current === 'wrong',
    [],
  )

  useEffect(() => {
    return () => { if (pulseTimerRef.current !== null) clearTimeout(pulseTimerRef.current) }
  }, [])

  /**
   * How many wagons this train may hold: the task's own count, never the level's
   * ceiling.
   *
   * This one number was the last of the lie. It is what the palette reads to
   * decide which cards look alive, so with a level ceiling of two and a task
   * asking for one, the wagon card the child had just used kept its white panel
   * and its raised rim — and answered the very next tap with the red refusal. On
   * half of all level-1 rounds. The task's count is the only ceiling the game
   * ever enforces (`canAddToTrain` below), so it has to be the only ceiling the
   * game ever *shows*.
   *
   * It leaks the answer's count into the palette, and that is fine: the numeral,
   * the dots under it, the dots on the ground and the empty wagon slots on the
   * rails all announce that count already. Nothing is given away that the child
   * was not just told four times over. The count is a fact he has been handed,
   * not a verdict on a choice he made — which is exactly why the *type* is no
   * longer gated here: that one would have been the verdict.
   */
  const maxWagons = task.count

  /**
   * The one wagon type this round will take, or null when the choice is not
   * gated. Every decision below reads it, so "will this pick be taken" is one
   * answer given in one place and the wagon that rocks back down on the dock and
   * the wagon that couples on cannot disagree.
   */
  const wantType = pickWanted(task, GATE_PICK)

  /** The only writer of the train: keeps the ref and the state in lockstep. */
  const applyTrain = useCallback((next: KeyedTrainItem[]) => {
    trainRef.current = next
    setTrainItems(next)
  }, [])

  /**
   * The gate every placement passes through: the cap is the task's own count, not
   * the level's ceiling, so a card that still looks bright is always a card the
   * game will actually take, and a press that would make the train longer than the
   * round asked for is refused in the same frame instead of being coupled on and
   * contradicted by the go button a moment later.
   *
   * It does not consult the task's wagon *type*, and that is the round-3 fix: a
   * gate that knew the type made the palette answer the round (one bright card, all
   * the others dead) and deleted the only decision the child had. Choosing the
   * wagon is his; the verdict on that choice is the go button's, said once.
   */
  const canAdd = useCallback(
    (item: TrainItem) =>
      roundIsOpen() && canAddToTrain(trainRef.current, item, maxWagons, ALLOW_REPLACE, wantType),
    [maxWagons, roundIsOpen, wantType],
  )

  const liveTrain = useCallback(() => trainRef.current, [])

  const tapKind = useCallback(
    (item: TrainItem) => trainTap(trainRef.current, item, maxWagons, ALLOW_REPLACE, wantType),
    [maxWagons, wantType],
  )

  /**
   * The one writer of items onto the train, and since this round it has three
   * outcomes rather than two.
   *
   * A wagon whose load disagrees with the wagons already coupled is a change of
   * mind, not an error: those wagons come off in this same commit and the new one
   * starts the train. So the train is never in a state the child cannot get out of,
   * and — this is the whole point — the *correct* card can never be refused for
   * want of room, because taking it swaps the room free.
   */
  const addToTrain = useCallback(
    (item: TrainItem): PlaceResult | null => {
      // The invariant lives here, not in the component: a placement after the
      // train has left would otherwise replace a validated rake mid-departure
      // and still be awarded the round by the phase timer.
      if (!roundIsOpen()) return null
      const prev = trainRef.current
      const kind = trainTap(prev, item, maxWagons, ALLOW_REPLACE, wantType)
      if (kind === 'refuse') return null
      const keyed = { ...item, _key: keyCounter.current++ } as KeyedTrainItem
      let replaced: number[] = []
      if (item.kind === 'loco') {
        applyTrain([keyed, ...prev.filter((x) => x.kind !== 'loco')])
      } else if (kind === 'replace') {
        const shed = placedWagons(prev)
        replaced = shed.map((w) => w._key)
        applyTrain([...prev.filter((x) => x.kind !== 'wagon'), keyed])
      } else {
        applyTrain([...prev, keyed])
      }
      if (item.kind === 'wagon') setPlaceSeq((n) => n + 1)
      setPhase((p) => (p === 'wrong' ? 'playing' : p))
      setValidation(null)
      return { key: keyed._key, replaced }
    },
    [applyTrain, maxWagons, roundIsOpen, setPhase, wantType],
  )

  const removeFromTrain = useCallback((key: number) => {
    // The same invariant `addToTrain` carries, and for the same reason: the train
    // items stay tappable while the train departs and while the cheer plays, so
    // without this a tap on the engine mid-cheer deleted it, flipped the signal
    // back to red, and — because the world mode's auto-locomotive is phase-gated —
    // the engine never came back.
    if (!roundIsOpen()) return
    applyTrain(trainRef.current.filter((t) => t._key !== key))
    setPhase((p) => (p === 'wrong' ? 'playing' : p))
    setValidation(null)
  }, [applyTrain, roundIsOpen, setPhase])

  const submit = useCallback(() => {
    const loco = trainItems.find((t) => t.kind === 'loco') as
      | Extract<KeyedTrainItem, { kind: 'loco' }>
      | undefined
    const wagonItems = trainItems.filter((t) => t.kind === 'wagon') as Extract<
      KeyedTrainItem,
      { kind: 'wagon' }
    >[]
    const locomotiveId = loco?.id ?? null
    const selectedWagonType: WagonType | null = wagonItems[0]?.type ?? null
    const wagonCount = wagonItems.length

    const result = validateTrain(task, locomotiveId, selectedWagonType, wagonCount)
    setValidation(result)
    if (result.allCorrect) {
      setPhase('departing')
    } else {
      setPhase('wrong')
      setShakeKey((k) => k + 1)
      if (pulseTimerRef.current !== null) clearTimeout(pulseTimerRef.current)
      setPulseTask(true)
      pulseTimerRef.current = setTimeout(() => setPulseTask(false), PULSE_MS)
    }
  }, [task, trainItems, setPhase])

  const nextRound = useCallback(() => {
    const newProgress = { ...progress }
    if (phase === 'celebrating') {
      newProgress.correctInLevel = progress.correctInLevel + 1
      if (newProgress.correctInLevel >= CORRECT_PER_LEVEL) {
        const maxLevel = LEVELS.length
        newProgress.level = Math.min(progress.level + 1, maxLevel)
        newProgress.correctInLevel = 0
      }
      saveProgress(newProgress)
      setProgress(newProgress)
    }
    const nextLevelDef = LEVELS[Math.min(newProgress.level - 1, LEVELS.length - 1)]
    setTask(generateTask(nextLevelDef))
    applyTrain([])
    setValidation(null)
    setPhase('playing')
  }, [applyTrain, phase, progress, setPhase])

  const resetProgress = useCallback(() => {
    const p = { level: 1, correctInLevel: 0 }
    saveProgress(p)
    setProgress(p)
    setTask(generateTask(LEVELS[0]))
    applyTrain([])
    setValidation(null)
    setPhase('playing')
  }, [applyTrain, setPhase])

  useEffect(() => {
    if (phase === 'departing') {
      const timer = setTimeout(() => {
        setPhase('celebrating')
      }, DEPART_MS)
      return () => clearTimeout(timer)
    }
  }, [phase, setPhase])

  useEffect(() => {
    if (phase === 'celebrating') {
      const timer = setTimeout(() => {
        nextRound()
      }, CELEBRATE_MS)
      return () => clearTimeout(timer)
    }
  }, [phase, nextRound])

  const atCap = placedWagons(trainItems).length >= maxWagons

  /**
   * The single source of the correctness green — see the field's doc above.
   *
   * Read off `trainItems` rather than `trainRef`, on purpose: this drives paint,
   * and paint must agree with the train the child can actually see. The ref is for
   * decisions taken inside a pointer event, before React has re-rendered.
   */
  const isRightExcluding = useCallback(
    (hiddenKey: number | null) => {
      const visible = hiddenKey === null
        ? trainItems
        : trainItems.filter((t) => t._key !== hiddenKey)
      const wagons = placedWagons(visible)
      return validateTrain(
        task,
        placedLoco(visible)?.id ?? null,
        wagons[0]?.type ?? null,
        wagons.length,
      ).allCorrect
    },
    [task, trainItems],
  )
  /**
   * Correct as the child can SEE it. A wagon that has been accepted but is still
   * flying is in `trainItems` and hidden on the rails, so counting it turned the
   * signal green, fired the track wash and closed the counter for the whole 340 ms
   * of the flight, while the last pip was still an open ring and the rails still
   * showed a gap. The green may not arrive before the wagon does.
   */
  const isRight = isRightExcluding(null)

  /**
   * The same question asked of the mirror instead of the frame, for the code that
   * has to answer inside a pointer event: a refusal decides where to point, and
   * "the train is already the answer" is the one case where the answer is the go
   * button. Reading that off a render that has not happened yet would send a child
   * who fills the last slot and taps once more to the wrong place.
   */
  const isRightNow = useCallback(() => {
    const items = trainRef.current
    const wagons = placedWagons(items)
    return validateTrain(
      task,
      placedLoco(items)?.id ?? null,
      wagons[0]?.type ?? null,
      wagons.length,
    ).allCorrect
  }, [task])

  return {
    task,
    progress,
    phase,
    trainItems,
    validation,
    atCap,
    maxWagons,
    isRight,
    isRightExcluding,
    isRightNow,
    shakeKey,
    placeSeq,
    pulseTask,
    liveTrain,
    canAdd,
    tapKind,
    addToTrain,
    removeFromTrain,
    submit,
    nextRound,
    resetProgress,
  }
}
