import type { GameProgress } from '../types'
import { CORRECT_PER_LEVEL, WRONG_TO_DEMOTE } from '../data/levels'

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
 * True for a value `Math.floor`/arithmetic can be trusted on: a genuine finite
 * number, never a string, an object, `NaN` or `Infinity`. `Number.isFinite`
 * already narrows `unknown` to `number` on its own type signature, but reading
 * that narrowing back out of a stored property required an `as number` at every
 * call site below — three of them, one per field. A named guard removes all
 * three: TypeScript narrows through the guard itself, so nothing downstream has
 * to assert what this function already proved.
 */
const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

/**
 * Reads stored progress, and takes the raw string rather than touching
 * localStorage itself so it can be tested without a DOM.
 *
 * Anything it cannot vouch for becomes a fresh start. A stored NaN would survive
 * every clamp below and then poison `LEVELS[level - 1]`, so finiteness is checked
 * rather than assumed — and the same has to be true of the two streaks, not just
 * the level: a stored `correctInLevel` or `wrongStreak` of, say, 99 is exactly
 * as unearned as a level of 99, and left unclamped it promotes or demotes the
 * very next round instead of the next `CORRECT_PER_LEVEL` or `WRONG_TO_DEMOTE`
 * rounds. Neither streak is ever legitimately stored at or above the constant
 * that reads it — `advanceProgress` resets to 0 in the same tick it would
 * otherwise reach one — so that constant minus one is the sane ceiling here.
 */
export function parseProgress(raw: string | null, maxLevel: number): GameProgress {
  if (raw === null) return INITIAL_PROGRESS
  try {
    const parsed = JSON.parse(raw) as Partial<GameProgress>
    if (!isFiniteNumber(parsed.level) || !isFiniteNumber(parsed.correctInLevel)) {
      return INITIAL_PROGRESS
    }
    return {
      level: Math.min(Math.max(1, Math.floor(parsed.level)), maxLevel),
      correctInLevel: Math.min(
        Math.max(0, Math.floor(parsed.correctInLevel)),
        CORRECT_PER_LEVEL - 1,
      ),
      wrongStreak: isFiniteNumber(parsed.wrongStreak)
        ? Math.min(Math.max(0, Math.floor(parsed.wrongStreak)), WRONG_TO_DEMOTE - 1)
        : 0,
    }
  } catch {
    return INITIAL_PROGRESS
  }
}
