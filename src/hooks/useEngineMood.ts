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
    if (phase === 'wrong') setSad(true)
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
