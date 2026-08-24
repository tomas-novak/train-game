import type { Task, ValidationResult, WagonType } from '../types'

/**
 * The choice moment's own decision — world mode only, roadmap E2.
 *
 * `validateTrain` below answers one question and it is the wrong question for a
 * pick-one-of-three round: it judges the FINISHED train, so on the world screen
 * the answer arrived as a 30 px lamp on the far left edge staying dull, long
 * after the pick was over. Measured on a one-wagon round whose sign showed the
 * milk crate: tapping the coal hopper flew it in and coupled it with the same
 * clunk and the same 90 ms flight as the right answer, and then the tank wagon
 * that actually carried the bottles did nothing at all, three taps running,
 * because the round's one slot was already spent on the mistake. A pick that is
 * rewarded exactly like the right one is not a choice, and the only way out of
 * the state it led to — tapping the wagon already on the rails — is nowhere
 * depicted.
 *
 * So in world mode the pick answers itself, in the frame of the touch: this is
 * the one type the round will take, and a wagon carrying anything else is
 * refused where it stands (see `trainTap`'s `wantType`). Nothing about it is a
 * dimming or a colour — the wrong wagon keeps its paint, keeps its place and
 * rocks back down on its wheels — so the row is still three live wagons and the
 * child still makes the choice. He simply finds out that he made it.
 *
 * Null when the choice is not gated, which is the classic screen: there the
 * child builds a rake from a tray and a wrong load is a change of mind that the
 * next tap corrects, and that screen is the control in the A/B test.
 */
export function pickWanted(task: Task, gated: boolean): WagonType | null {
  return gated ? task.cargo.wagonType : null
}

export function validateTrain(
  task: Task,
  locomotiveId: string | null,
  selectedWagonType: WagonType | null,
  wagonCount: number,
): ValidationResult {
  const locomotiveOk = locomotiveId !== null
  const wagonTypeOk = selectedWagonType === task.cargo.wagonType
  const wagonCountOk = wagonCount === task.count

  return {
    locomotiveOk,
    wagonTypeOk,
    wagonCountOk,
    allCorrect: locomotiveOk && wagonTypeOk && wagonCountOk,
  }
}
