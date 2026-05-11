import { useState, useCallback, useEffect, useRef } from 'react'
import type { Task, GameProgress, ValidationResult, TrainItem, KeyedTrainItem, WagonType } from '../types'
import { LEVELS, CORRECT_PER_LEVEL } from '../data/levels'
import { validateTrain } from '../utils/validation'
import { generateTask } from '../utils/random'

const STORAGE_KEY = 'trainGameProgress'

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

export type GamePhase = 'playing' | 'celebrating' | 'wrong'

export interface GameState {
  task: Task
  progress: GameProgress
  phase: GamePhase
  trainItems: KeyedTrainItem[]
  validation: ValidationResult | null
  atCap: boolean
  addToTrain: (item: TrainItem) => void
  removeFromTrain: (key: number) => void
  submit: () => void
  nextRound: () => void
}

export function useGameState(): GameState {
  const [progress, setProgress] = useState<GameProgress>(initialProgress)
  const [task, setTask] = useState<Task>(() =>
    generateTask(LEVELS[initialProgress.level - 1])
  )
  const [phase, setPhase] = useState<GamePhase>('playing')
  const [trainItems, setTrainItems] = useState<KeyedTrainItem[]>([])
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const keyCounter = useRef(0)
  const trainChangedRef = useRef(false)

  const levelDef = LEVELS[Math.min(progress.level - 1, LEVELS.length - 1)]

  const addToTrain = useCallback(
    (item: TrainItem) => {
      trainChangedRef.current = false
      setTrainItems((prev) => {
        const keyed = { ...item, _key: keyCounter.current++ } as KeyedTrainItem
        if (item.kind === 'loco') {
          trainChangedRef.current = true
          const withoutLoco = prev.filter((t) => t.kind !== 'loco')
          return [keyed, ...withoutLoco]
        }
        // Type switch resets to 1 wagon (always within cap) — check before cap
        const existingType = (
          prev.find((t) => t.kind === 'wagon') as Extract<KeyedTrainItem, { kind: 'wagon' }> | undefined
        )?.type
        if (existingType !== undefined && existingType !== item.type) {
          trainChangedRef.current = true
          const loco = prev.find((t) => t.kind === 'loco')
          return loco ? [loco, keyed] : [keyed]
        }
        // Same type: enforce wagon count cap
        const wagonCount = prev.filter((t) => t.kind === 'wagon').length
        if (wagonCount >= levelDef.maxNumber) return prev
        trainChangedRef.current = true
        return [...prev, keyed]
      })
      // Only clear error state when train actually changed — a cap-blocked
      // drop must not erase the validation highlights the child is reading.
      if (trainChangedRef.current) {
        setPhase((p) => (p === 'wrong' ? 'playing' : p))
        setValidation(null)
      }
    },
    [levelDef.maxNumber],
  )

  const removeFromTrain = useCallback((key: number) => {
    setTrainItems((prev) => prev.filter((t) => t._key !== key))
    setPhase((p) => (p === 'wrong' ? 'playing' : p))
    setValidation(null)
  }, [])

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
      setPhase('celebrating')
    } else {
      setPhase('wrong')
    }
  }, [task, trainItems])

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
    setTrainItems([])
    setValidation(null)
    setPhase('playing')
  }, [phase, progress])

  useEffect(() => {
    if (phase === 'celebrating') {
      const timer = setTimeout(() => {
        nextRound()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [phase, nextRound])

  const atCap =
    trainItems.filter((t) => t.kind === 'wagon').length >= levelDef.maxNumber

  return {
    task,
    progress,
    phase,
    trainItems,
    validation,
    atCap,
    addToTrain,
    removeFromTrain,
    submit,
    nextRound,
  }
}
