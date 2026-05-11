export type WagonType = 'hopper' | 'tank' | 'box' | 'flatcar' | 'passenger'

export interface Locomotive {
  id: string
  emoji: string
}

export interface WagonDef {
  type: WagonType
  emoji: string
}

export interface CargoDef {
  id: string
  emoji: string
  wagonType: WagonType
}

export interface LevelDef {
  maxNumber: number
  cargoIds: string[]
}

export interface Task {
  count: number
  cargo: CargoDef
}

export interface GameProgress {
  level: number
  correctInLevel: number
}

export type ValidationResult = {
  locomotiveOk: boolean
  wagonTypeOk: boolean
  wagonCountOk: boolean
  allCorrect: boolean
}
