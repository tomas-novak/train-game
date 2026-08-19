import type { FC } from 'react'
import type { SkyTheme } from '../theme'

export type { SkyTheme }

export type WagonType = 'hopper' | 'tank' | 'box' | 'flatcar' | 'passenger' | 'logcar'

export interface TrainIcon {
  size?: number
  t?: SkyTheme
  /**
   * Draw a load in this wagon: the id of the cargo it is carrying, or undefined
   * for an empty shell. The picture in the wagon opening is the whole mapping
   * lesson — a four-year-old cannot hold "milk belongs in the round one" in his
   * head, but he can match a milk bottle to a milk bottle. Locomotives ignore it.
   */
  showCargo?: string
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
  icon: FC<TrainIcon>
  wagonType: WagonType
}

export interface LevelDef {
  maxNumber: number
  cargoIds: string[]
  /** The wagon types this level may ever put on the palette. */
  wagonTypeIds: WagonType[]
  /** The engines this level may ever put on the palette. */
  locomotiveIds: string[]
  /**
   * How many wagon cards a round of this level offers: the one the task needs
   * plus that many minus one distractors. Fewer cards is the real fix for the
   * dead-card problem — the type rule kills every card but one as soon as a
   * wagon is placed, so a six-card row means five switched-off plates.
   * Undefined means "all of wagonTypeIds".
   */
  wagonChoices?: number
  /** Draw each wagon's load on it. Off at the top level, so the child ends up knowing the mapping. */
  cargoHints: boolean
}

export interface Task {
  count: number
  cargo: CargoDef
  /** The wagon types the palette offers this round, correct one included. */
  wagonTypeIds: WagonType[]
  /** The engines the palette offers this round. */
  locomotiveIds: string[]
  /** Whether this round's wagons are drawn carrying their load. */
  cargoHints: boolean
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
