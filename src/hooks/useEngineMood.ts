import { useEffect, useState } from 'react'
import type { GamePhase } from './useGameState'

/** How long the engine looks sad after a refused train. */
const SAD_MS = 1000

/**
 * The engine's expression, on a timer rather than on the phase — roadmap B3.
 *
 * The `wrong` phase lasts until the child fixes the train, which can be a long
 * while, and a face that stays sad the whole time stops being a reaction and
 * becomes a verdict on the child. So it falls for a second and then goes back to
 * a smile even though nothing has been fixed yet: the game is disappointed for a
 * moment, never disapproving.
 *
 * Leaving `wrong` clears the sadness immediately, whatever the reason — a
 * corrected train and a child who simply touched a card both count, because
 * `wrong` can end either way (see the comment below). The timer only ever
 * covers the case where he leaves the wrong train standing and does nothing.
 */
export function useEngineMood(phase: GamePhase): 'happy' | 'sad' {
  const [sad, setSad] = useState(false)
  /**
   * Entering `wrong` is caught here, during render, rather than by calling
   * `setSad(true)` straight from inside the effect below. The two read as the
   * same behaviour, but the direct call is a lint ERROR here
   * (`react-hooks/set-state-in-effect`, and the project's lint gate allows
   * exactly one warning total, `useTablet.ts`'s), because it schedules a second
   * render as a side effect of the first instead of settling the state before
   * anything paints. This is React's own documented fix for "adjust state when
   * a prop changes": comparing against the previous value during the render
   * itself, so the state is already correct in the render that reacts to the
   * phase change and no extra render is scheduled afterwards.
   */
  const [prevPhase, setPrevPhase] = useState(phase)
  if (phase !== prevPhase) {
    setPrevPhase(phase)
    // Unconditional, not `if (phase === 'wrong') setSad(true)`: the phase can
    // leave `wrong` on a touch rather than on a correction — `addToTrain` in
    // useGameState.ts flips `wrong` back to `playing` the instant the child
    // places or removes any wagon, which for a four-year-old is well inside
    // the second the timer below is still counting down. Without this branch
    // covering the leaving side too, `sad` was left `true` forever in that
    // case: the timer that was supposed to clear it had already been armed
    // for a `wrong` phase that no longer exists, so its cleanup below just
    // cancels it, and nothing else ever calls `setSad(false)` again. Setting
    // it here, from the phase transition itself, means a child who fixes his
    // train gets the smile back the moment he fixes it, and the timer keeps
    // its one remaining job: returning the smile when he leaves the wrong
    // train standing and does nothing.
    setSad(phase === 'wrong')
  }
  /**
   * The fall lives here: a timer that puts the smile back after `SAD_MS`,
   * independent of whether the train has actually been fixed. Only this half
   * belongs in an effect — `setSad(false)` runs from a timer callback, an
   * external system, which is exactly what effects are for.
   */
  useEffect(() => {
    if (phase !== 'wrong') return
    const timer = setTimeout(() => setSad(false), SAD_MS)
    return () => clearTimeout(timer)
  }, [phase])
  return sad ? 'sad' : 'happy'
}
