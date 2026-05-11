import type { LevelDef } from '../types'

export const LEVELS: LevelDef[] = [
  {
    level: 1,
    maxNumber: 3,
    cargoIds: ['coal', 'sand', 'milk', 'apples'],
  },
  {
    level: 2,
    maxNumber: 5,
    cargoIds: ['coal', 'sand', 'milk', 'fuel', 'apples', 'parcels', 'cars'],
  },
  {
    level: 3,
    maxNumber: 10,
    cargoIds: ['coal', 'sand', 'milk', 'fuel', 'apples', 'parcels', 'cars', 'people'],
  },
]

export const CORRECT_PER_LEVEL = 3
