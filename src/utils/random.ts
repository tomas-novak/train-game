import type { LevelDef, Task } from '../types'
import { CARGO } from '../data/cargo'

export function generateTask(levelDef: LevelDef): Task {
  const count = Math.floor(Math.random() * levelDef.maxNumber) + 1
  const availableCargo = CARGO.filter((c) => levelDef.cargoIds.includes(c.id))
  if (availableCargo.length === 0) {
    throw new Error(`No cargo matched cargoIds: ${levelDef.cargoIds.join(', ')}`)
  }
  const cargo = availableCargo[Math.floor(Math.random() * availableCargo.length)]
  return { count, cargo }
}
