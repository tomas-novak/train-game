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
  /**
   * The engine's expression — roadmap B3, and only the world-mode drawings in
   * `svgs.tsx` read it. Everything else ignores it, exactly like `showCargo`.
   */
  mood?: 'happy' | 'sad'
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
  /**
   * The wagons that stand waiting in the world this round — roadmap E2.
   *
   * A second, shorter list rather than a reinterpretation of the one above,
   * because the two screens ask two different questions. Classic offers a tray of
   * `wagonTypeIds` cards and the child builds from inventory; the world stands
   * `CHOICE_COUNT` wagons on a siding and the child picks one of them. The level's
   * own `wagonChoices` therefore cannot serve both — level 1 offers two cards and
   * level 3 offers six — so the world's list is generated to its own fixed length
   * from the same level pool, and the classic list is untouched to the entry.
   */
  choiceTypeIds: WagonType[]
  /** The engines the palette offers this round. */
  locomotiveIds: string[]
  /** Whether this round's wagons are drawn carrying their load. */
  cargoHints: boolean
}

export interface GameProgress {
  level: number
  /**
   * Clean rounds in a row at this level. A round with a wrong submission in it
   * resets this to zero, which is the whole of roadmap C2: the level used to
   * rise every third round no matter how many mistakes were in them.
   */
  correctInLevel: number
  /** Rounds with a mistake in them, back to back. Reaching WRONG_TO_DEMOTE drops the level. */
  wrongStreak: number
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

/**
 * The round's own state machine, driven by `useGameState`.
 *
 * Lives here rather than in the hook because a pure util (`utils/mood.ts`'s
 * `nextMood`) needs it and importing a type from a hook is backwards — types
 * belong in `src/types/`, hooks consume them. `useGameState.ts` re-exports it
 * so every existing `import type { GamePhase } from '../hooks/useGameState'`
 * keeps working unchanged.
 */
export type GamePhase = 'playing' | 'departing' | 'celebrating' | 'wrong'
