import type { CargoDef } from '../types'
import {
  CoalCargo, SandCargo, MilkCargo, FuelCargo,
  ApplesCargo, ParcelsCargo, CarsCargo, PeopleCargo, LogsCargo,
} from '../components/CargoSvg'

export const CARGO: CargoDef[] = [
  { id: 'coal',    icon: CoalCargo,    wagonType: 'hopper'    },
  { id: 'sand',    icon: SandCargo,    wagonType: 'hopper'    },
  { id: 'milk',    icon: MilkCargo,    wagonType: 'tank'      },
  { id: 'fuel',    icon: FuelCargo,    wagonType: 'tank'      },
  { id: 'apples',  icon: ApplesCargo,  wagonType: 'box'       },
  { id: 'parcels', icon: ParcelsCargo, wagonType: 'box'       },
  { id: 'cars',    icon: CarsCargo,    wagonType: 'flatcar'   },
  { id: 'people',  icon: PeopleCargo,  wagonType: 'passenger' },
  { id: 'logs',    icon: LogsCargo,    wagonType: 'logcar'    },
]
