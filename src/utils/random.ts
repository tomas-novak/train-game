import type { CargoDef, LevelDef, Task, WagonType } from '../types'
import { CARGO } from '../data/cargo'
import { WAGONS } from '../data/wagons'

/** Canonical left-to-right order, so a type always shows up in the same relative place. */
const WAGON_ORDER: WagonType[] = WAGONS.map((w) => w.type)

/**
 * The wagon cards this round offers: the type the task needs, plus enough
 * distractors drawn from the level's own pool to fill the row, in canonical
 * order so the correct card is not always in the same seat.
 */
function pickWagonTypes(levelDef: LevelDef, cargo: CargoDef): WagonType[] {
  const pool = levelDef.wagonTypeIds.filter((type) => type !== cargo.wagonType)
  const want = Math.max(1, Math.min(levelDef.wagonChoices ?? levelDef.wagonTypeIds.length, levelDef.wagonTypeIds.length))
  const chosen: WagonType[] = [cargo.wagonType]
  while (chosen.length < want && pool.length > 0) {
    chosen.push(...pool.splice(Math.floor(Math.random() * pool.length), 1))
  }
  return WAGON_ORDER.filter((type) => chosen.includes(type))
}

export function generateTask(levelDef: LevelDef): Task {
  const count = Math.floor(Math.random() * levelDef.maxNumber) + 1
  const availableCargo = CARGO.filter((c) => levelDef.cargoIds.includes(c.id))
  if (availableCargo.length === 0) {
    throw new Error(`No cargo matched cargoIds: ${levelDef.cargoIds.join(', ')}`)
  }
  const cargo = availableCargo[Math.floor(Math.random() * availableCargo.length)]
  return {
    count,
    cargo,
    wagonTypeIds: pickWagonTypes(levelDef, cargo),
    locomotiveIds: levelDef.locomotiveIds,
    cargoHints: levelDef.cargoHints,
  }
}
