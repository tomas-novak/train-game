import { useState, useCallback, useEffect } from 'react'
import type { Task, GameProgress, WagonType, ValidationResult } from '../types'
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
        return parsed
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

export type GamePhase = 'playing' | 'celebrating' | 'wrong'

export interface GameState {
  task: Task
  progress: GameProgress
  phase: GamePhase
  locomotiveId: string | null
  selectedWagonType: WagonType | null
  wagonCount: number
  validation: ValidationResult | null
  levelDef: (typeof LEVELS)[number]
  selectLocomotive: (id: string) => void
  selectWagonType: (type: WagonType) => void
  incrementWagons: () => void
  decrementWagons: () => void
  submit: () => void
  nextRound: () => void
}

export function useGameState(): GameState {
  const [progress, setProgress] = useState<GameProgress>(loadProgress)
  const [task, setTask] = useState<Task>(() => generateTask(LEVELS[loadProgress().level - 1]))
  const [phase, setPhase] = useState<GamePhase>('playing')
  const [locomotiveId, setLocomotiveId] = useState<string | null>(null)
  const [selectedWagonType, setSelectedWagonType] = useState<WagonType | null>(null)
  const [wagonCount, setWagonCount] = useState(0)
  const [validation, setValidation] = useState<ValidationResult | null>(null)

  const levelDef = LEVELS[Math.min(progress.level - 1, LEVELS.length - 1)]

  const selectLocomotive = useCallback((id: string) => {
    setLocomotiveId(id)
  }, [])

  const selectWagonType = useCallback((type: WagonType) => {
    setSelectedWagonType(type)
    setWagonCount(0)
  }, [])

  const incrementWagons = useCallback(() => {
    setWagonCount((n) => Math.min(n + 1, 10))
  }, [])

  const decrementWagons = useCallback(() => {
    setWagonCount((n) => Math.max(n - 1, 0))
  }, [])

  const submit = useCallback(() => {
    const result = validateTrain(task, locomotiveId, selectedWagonType, wagonCount)
    setValidation(result)
    if (result.allCorrect) {
      setPhase('celebrating')
    } else {
      setPhase('wrong')
    }
  }, [task, locomotiveId, selectedWagonType, wagonCount])

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
    setLocomotiveId(null)
    setSelectedWagonType(null)
    setWagonCount(0)
    setValidation(null)
    setPhase('playing')
  }, [phase, progress])

  // Auto-advance after celebration
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
    locomotiveId,
    selectedWagonType,
    wagonCount,
    validation,
    levelDef,
    selectLocomotive,
    selectWagonType,
    incrementWagons,
    decrementWagons,
    submit,
    nextRound,
  }
}
