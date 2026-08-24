import { createElement } from 'react'
import type { FC } from 'react'
import type { TrainIcon, WagonDef, WagonType } from '../types'
import { HopperWagon, TankWagon, BoxWagon, FlatcarWagon, PassengerWagon, LogcarWagon } from '../components/svgs'

export const WAGONS: WagonDef[] = [
  { type: 'hopper', icon: HopperWagon },
  { type: 'tank', icon: TankWagon },
  { type: 'box', icon: BoxWagon },
  { type: 'flatcar', icon: FlatcarWagon },
  { type: 'passenger', icon: PassengerWagon },
  { type: 'logcar', icon: LogcarWagon },
]

const BASE_ICON: Record<WagonType, FC<TrainIcon>> = {
  hopper: HopperWagon,
  tank: TankWagon,
  box: BoxWagon,
  flatcar: FlatcarWagon,
  passenger: PassengerWagon,
  logcar: LogcarWagon,
}

/**
 * One component per (wagon type, load) pair, built once and then handed out
 * again, because identity matters twice over: the palette cards are memoised on
 * their props, and the very same component instance is what flies from the card
 * to the rails and what the drag ghost draws. A fresh wrapper per render would
 * re-render every card on every placement and remount the icon mid-flight.
 */
const loaded = new Map<string, FC<TrainIcon>>()

/** The wagon icon for this type, carrying `cargoId` — or the empty shell for null. */
export function wagonIcon(type: WagonType, cargoId: string | null): FC<TrainIcon> {
  const Base = BASE_ICON[type]
  if (cargoId === null) return Base
  const key = `${type}:${cargoId}`
  const cached = loaded.get(key)
  if (cached !== undefined) return cached
  const Loaded: FC<TrainIcon> = (props) => createElement(Base, { ...props, showCargo: cargoId })
  Loaded.displayName = `${type}Wagon(${cargoId})`
  loaded.set(key, Loaded)
  return Loaded
}
