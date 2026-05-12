import type { Locomotive } from '../types'
import { SteamLoco, ElectricLoco, DieselLoco } from '../components/svgs'

export const LOCOMOTIVES: Locomotive[] = [
  { id: 'steam', icon: SteamLoco },
  { id: 'electric', icon: ElectricLoco },
  { id: 'diesel', icon: DieselLoco },
]
