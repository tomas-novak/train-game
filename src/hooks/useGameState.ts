import { useState, useCallback, useEffect } from 'react'
import type { Task, GameProgress, ValidationResult, TrainItem, WagonType } from '../types'
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
  trainItems: TrainItem[]
  validation: ValidationResult | null
  levelDef: (typeof LEVELS)[number]
  addToTrain: (item: TrainItem) => void
  removeFromTrain: (index: number) => void
  submit: () => void
  nextRound: () => void
}

export function useGameState(): GameState {
  const [progress, setProgress] = useState<GameProgress>(initialProgress)
  const [task, setTask] = useState<Task>(() =>
    generateTask(LEVELS[initialProgress.level - 1])
  )
  const [phase, setPhase] = useState<GamePhase>('playing')
  const [trainItems, setTrainItems] = useState<TrainItem[]>([])
  const [validation, setValidation] = useState<ValidationResult | null>(null)

  const levelDef = LEVELS[Math.min(progress.level - 1, LEVELS.length - 1)]

  const addToTrain = useCallback((item: TrainItem) => {
    setTrainItems((prev) => {
      if (item.kind === 'loco') {
        const withoutLoco = prev.filter((t) => t.kind !== 'loco')
        return [item, ...withoutLoco]
      }
      // wagon
      const existingWagonType = (
        prev.find((t) => t.kind === 'wagon') as Extract<TrainItem, { kind: 'wagon' }> | undefined
      )?.type
      if (existingWagonType !== undefined && existingWagonType !== item.type) {
        // different type: replace all wagons, keep loco
        const loco = prev.find((t) => t.kind === 'loco')
        return loco ? [loco, item] : [item]
      }
      return [...prev, item]
    })
    setPhase((p) => (p === 'wrong' ? 'playing' : p))
    setValidation(null)
  }, [])

  const removeFromTrain = useCallback((index: number) => {
    setTrainItems((prev) => prev.filter((_, i) => i !== index))
    setPhase((p) => (p === 'wrong' ? 'playing' : p))
    setValidation(null)
  }, [])

  const submit = useCallback(() => {
    const loco = trainItems.find((t) => t.kind === 'loco') as
      | Extract<TrainItem, { kind: 'loco' }>
      | undefined
    const wagonItems = trainItems.filter((t) => t.kind === 'wagon') as Extract<
      TrainItem,
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

  return {
    task,
    progress,
    phase,
    trainItems,
    validation,
    levelDef,
    addToTrain,
    removeFromTrain,
    submit,
    nextRound,
  }
}
