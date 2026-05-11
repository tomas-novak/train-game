import type { LevelDef } from '../types'

export const LEVELS: LevelDef[] = [
  {
    maxNumber: 3,
    cargoIds: ['coal', 'sand', 'milk', 'apples'],
  },
  {
    maxNumber: 5,
    cargoIds: ['coal', 'sand', 'milk', 'fuel', 'apples', 'parcels', 'cars'],
  },
  {
    maxNumber: 10,
    cargoIds: ['coal', 'sand', 'milk', 'fuel', 'apples', 'parcels', 'cars', 'people'],
  },
]

export const CORRECT_PER_LEVEL = 3
