import type { GamePhase } from '../types'

/**
 * The engine's sad/happy transition rule — roadmap B3, extracted out of
 * `useEngineMood` so it can be tested without a DOM.
 *
 * This one function is where both bugs the review found lived, because it used
 * to be inlined inside a hook (the branch's one new file with logic and no
 * test):
 *
 *   1. A first cut only ever set `sad` from `if (phase === 'wrong') setSad(true)`,
 *      which never cleared it on a touch: `addToTrain`/`removeFromTrain` in
 *      `useGameState.ts` flip `wrong` straight back to `playing` the instant the
 *      child places or removes a wagon, and that left the sad face standing
 *      until the timer happened to fire — sometimes long after the mistake was
 *      already fixed.
 *   2. The fix for that had to cover every way OUT of `wrong`, not just the one
 *      where the train gets corrected: `departing` (the train was right after
 *      all, correction irrelevant) leaves `wrong` exactly as `playing` does, and
 *      both have to clear the face in the same frame as the transition, not on
 *      the 1 s timer.
 *
 * The rule, stated the way both bugs above are about it:
 *   - entering `wrong` from any other phase → sad
 *   - leaving `wrong` for ANY other phase → not sad, immediately
 *   - no phase change → no change
 *
 * The timer-driven revert (a sad face softening back to happy after `SAD_MS`
 * even though the wrong train is still standing there) is not part of this: it
 * has to run from an effect, since `setTimeout` is an external system, and stays
 * in `useEngineMood`.
 */
export function nextMood(prevPhase: GamePhase, phase: GamePhase, wasSad: boolean): boolean {
  if (phase === prevPhase) return wasSad
  return phase === 'wrong'
}
