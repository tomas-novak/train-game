import type { CargoDef, LevelDef, Task, WagonType } from '../types'
import { CARGO } from '../data/cargo'
import { WAGONS } from '../data/wagons'
import { CHOICE_COUNT, WORLD_MAX_COUNT } from '../data/world'
import { readMode } from './mode'

/** Canonical left-to-right order, so a type always shows up in the same relative place. */
const WAGON_ORDER: WagonType[] = WAGONS.map((w) => w.type)

/**
 * The wagon cards this round offers: the type the task needs, plus enough
 * distractors drawn from the level's own pool to fill the row, in canonical
 * order so the correct card is not always in the same seat.
 *
 * `want` is how many to end up with. Classic passes the level's own
 * `wagonChoices`, exactly as before; the world passes `CHOICE_COUNT`, because a
 * pick-one-of-three round is three wagons at every level — see
 * `Task.choiceTypeIds`. Either way the correct type goes in first, the rest are
 * drawn at random from the level's pool, and the result is sorted back into
 * canonical order so the right answer is not always in the same seat.
 */
function pickWagonTypes(levelDef: LevelDef, cargo: CargoDef, want: number): WagonType[] {
  const pool = levelDef.wagonTypeIds.filter((type) => type !== cargo.wagonType)
  const take = Math.max(1, Math.min(want, levelDef.wagonTypeIds.length))
  const chosen: WagonType[] = [cargo.wagonType]
  while (chosen.length < take && pool.length > 0) {
    chosen.push(...pool.splice(Math.floor(Math.random() * pool.length), 1))
  }
  return WAGON_ORDER.filter((type) => chosen.includes(type))
}

/**
 * Which screen is asking. Read once, at module load, exactly as App reads it, so a
 * classic session cannot be affected by anything below.
 */
const WORLD = readMode() === 'world'

export function generateTask(levelDef: LevelDef): Task {
  /**
   * How many wagons this round may ask for.
   *
   * Classic uses the level's own number, to the digit, at every level. The world
   * round is capped — see `WORLD_MAX_COUNT` in data/world.ts for the line arithmetic
   * that sets the cap. In short: the world draws its stock at one pinned size and
   * lets the frame cut the line, and past three coupled wagons there is no locomotive
   * left inside the picture.
   */
  const maxNumber = WORLD ? Math.min(levelDef.maxNumber, WORLD_MAX_COUNT) : levelDef.maxNumber
  const count = Math.floor(Math.random() * maxNumber) + 1
  const availableCargo = CARGO.filter((c) => levelDef.cargoIds.includes(c.id))
  if (availableCargo.length === 0) {
    throw new Error(`No cargo matched cargoIds: ${levelDef.cargoIds.join(', ')}`)
  }
  const cargo = availableCargo[Math.floor(Math.random() * availableCargo.length)]
  return {
    count,
    cargo,
    wagonTypeIds: pickWagonTypes(
      levelDef,
      cargo,
      levelDef.wagonChoices ?? levelDef.wagonTypeIds.length,
    ),
    /* Drawn independently of the classic list, so the two screens' distractors
       are chosen the same way but neither constrains the other. */
    choiceTypeIds: pickWagonTypes(levelDef, cargo, CHOICE_COUNT),
    locomotiveIds: levelDef.locomotiveIds,
    cargoHints: levelDef.cargoHints,
  }
}
