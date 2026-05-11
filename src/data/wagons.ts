import type { WagonDef } from '../types'
import { HopperWagon, TankWagon, BoxWagon, FlatcarWagon, PassengerWagon } from '../components/TrainSvg'

export const WAGONS: WagonDef[] = [
  { type: 'hopper', icon: HopperWagon },
  { type: 'tank', icon: TankWagon },
  { type: 'box', icon: BoxWagon },
  { type: 'flatcar', icon: FlatcarWagon },
  { type: 'passenger', icon: PassengerWagon },
]
