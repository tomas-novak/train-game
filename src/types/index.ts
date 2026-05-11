import type { FC } from 'react'

export type WagonType = 'hopper' | 'tank' | 'box' | 'flatcar' | 'passenger'

export interface TrainIcon {
  size?: number
}

export interface Locomotive {
  id: string
  icon: FC<TrainIcon>
}

export interface WagonDef {
  type: WagonType
  icon: FC<TrainIcon>
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

export type TrainItem =
  | { kind: 'loco'; id: string }
  | { kind: 'wagon'; type: WagonType }

export type KeyedTrainItem = TrainItem & { _key: number }
