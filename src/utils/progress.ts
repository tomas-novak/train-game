import type { GameProgress } from '../types'
import { CORRECT_PER_LEVEL } from '../data/levels'

/**
 * How many rounds WITH A MISTAKE IN THEM, back to back, drop the level.
 *
 * Two, not three. The roadmap offered 2-3 and a four-year-old who has just had
 * three rounds in a row go wrong has already stopped playing, so help that
 * arrives after the third one arrives too late.
 */
export const WRONG_TO_DEMOTE = 2

export const INITIAL_PROGRESS: GameProgress = { level: 1, correctInLevel: 0, wrongStreak: 0 }

/**
 * The unit here is a ROUND, not a submission, and that distinction is the whole
 * of roadmap C2.
 *
 * A round in this game can only end in success: `nextRound` is called from the
 * celebration timer and from the next button, never from a failure, and after a
 * wrong train the child keeps working on the same one until it is right. So a
 * streak counted per submission would be cleared by the success that every round
 * ends with, `wrongStreak` would never reach two, and the demotion below would be
 * dead code that looks finished.
 *
 * `roundWasDirty` therefore means "the child submitted a wrong train at least
 * once during this round". It is a boolean and not a count on purpose: pressing
 * the go button twice on the same unchanged wrong train is one mistake, not two.
 */
export function advanceProgress(
  current: GameProgress,
  roundWasDirty: boolean,
  maxLevel: number,
): GameProgress {
  if (roundWasDirty) {
    const wrongStreak = current.wrongStreak + 1
    if (wrongStreak >= WRONG_TO_DEMOTE) {
      return { level: Math.max(1, current.level - 1), correctInLevel: 0, wrongStreak: 0 }
    }
    return { level: current.level, correctInLevel: 0, wrongStreak }
  }
  const correctInLevel = current.correctInLevel + 1
  if (correctInLevel >= CORRECT_PER_LEVEL) {
    return { level: Math.min(maxLevel, current.level + 1), correctInLevel: 0, wrongStreak: 0 }
  }
  return { level: current.level, correctInLevel, wrongStreak: 0 }
}

/**
 * Reads stored progress, and takes the raw string rather than touching
 * localStorage itself so it can be tested without a DOM.
 *
 * Anything it cannot vouch for becomes a fresh start. A stored NaN would survive
 * every clamp below and then poison `LEVELS[level - 1]`, so finiteness is checked
 * rather than assumed.
 */
export function parseProgress(raw: string | null, maxLevel: number): GameProgress {
  if (raw === null) return INITIAL_PROGRESS
  try {
    const parsed = JSON.parse(raw) as Partial<GameProgress>
    if (!Number.isFinite(parsed.level) || !Number.isFinite(parsed.correctInLevel)) {
      return INITIAL_PROGRESS
    }
    return {
      level: Math.min(Math.max(1, Math.floor(parsed.level as number)), maxLevel),
      correctInLevel: Math.max(0, Math.floor(parsed.correctInLevel as number)),
      wrongStreak: Number.isFinite(parsed.wrongStreak)
        ? Math.max(0, Math.floor(parsed.wrongStreak as number))
        : 0,
    }
  } catch {
    return INITIAL_PROGRESS
  }
}
