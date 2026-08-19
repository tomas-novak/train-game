import type { CargoDef, WagonType } from '../types'
import {
  CoalCargo, SandCargo, MilkCargo, FuelCargo,
  ApplesCargo, ParcelsCargo, CarsCargo, PeopleCargo, LogsCargo,
} from '../components/svgs'

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

/**
 * The load a wagon of this type is drawn carrying when the round is not about
 * it: its first cargo, i.e. coal for the hopper, milk for the tank. A distractor
 * card has to be carrying something, or "the one with the picture on it" would
 * itself become the answer and the matching would stop being a choice.
 */
const DEFAULT_CARGO_ID: Record<WagonType, string> = {
  hopper: 'coal',
  tank: 'milk',
  box: 'apples',
  flatcar: 'cars',
  passenger: 'people',
  logcar: 'logs',
}

/**
 * Which cargo picture goes in a wagon of this type this round.
 *
 * The wagon the task asks for carries exactly the object the task shows — the
 * same coal, the same milk bottle — because identical pictures is the one
 * matching a four-year-old can do without being taught anything. Every other
 * wagon carries its own default load, so the row reads as "which of these is
 * carrying the thing I was shown".
 */
export function cargoShownOnWagon(type: WagonType, taskCargo: CargoDef): string {
  return taskCargo.wagonType === type ? taskCargo.id : DEFAULT_CARGO_ID[type]
}
