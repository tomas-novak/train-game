import type { KeyedTrainItem, TrainItem } from '../types'

type PlacedLoco = Extract<KeyedTrainItem, { kind: 'loco' }>
type PlacedWagon = Extract<KeyedTrainItem, { kind: 'wagon' }>

const isLoco = (x: KeyedTrainItem): x is PlacedLoco => x.kind === 'loco'
const isWagon = (x: KeyedTrainItem): x is PlacedWagon => x.kind === 'wagon'

export const placedLoco = (items: KeyedTrainItem[]): PlacedLoco | undefined => items.find(isLoco)
export const placedWagons = (items: KeyedTrainItem[]): PlacedWagon[] => items.filter(isWagon)

/**
 * What a tap on this card does to the train as it stands. Three answers, and the
 * middle one is this round's fix.
 *
 *   'add'      — it couples on behind what is already there (or, for an engine,
 *                takes the empty engine place, or swaps the engine standing in it).
 *   'replace'  — a wagon whose load disagrees with the wagons already coupled:
 *                "no, THIS one". The wagons of the other type come off and this one
 *                starts the train again. Accepted, always.
 *   'refuse'   — the tap is genuinely pointless: the same engine again, or the same
 *                wagon type when the train already holds the number the round asked
 *                for. Nothing else is ever refused.
 *
 * A wrong-type wagon used to be 'refuse', and because `maxWagons` is the round's
 * own count, a full train of the wrong wagons had no room for the right one — so on
 * a one-wagon round the *correct* card was refused, turned red, and the go button
 * was nodded at instead. That is a dead end with the answer inside it, and the only
 * way out was tapping a placed wagon to take it off, which nothing tells a
 * four-year-old. A mistake in this game has to be self-correcting: choosing a
 * different load is now how you change your mind, and it can never be refused.
 *
 * What it still deliberately does NOT know is which wagon type the round wants. A
 * `wantType` test here would make the palette answer the round — measured, exactly
 * one wagon card was bright and it was always the right one, so the cargo drawn on
 * the wagons became decoration. Which train is *right* is asked once, by the go
 * button, and green is spent nowhere else. 'replace' is not a verdict either: it
 * says "your load is now this one", not "your load is now correct".
 */
export type TrainTap = 'add' | 'replace' | 'refuse'

export function trainTap(
  items: KeyedTrainItem[],
  item: TrainItem,
  maxWagons: number,
): TrainTap {
  if (item.kind === 'loco') {
    const current = placedLoco(items)
    return current === undefined || current.id !== item.id ? 'add' : 'refuse'
  }
  const wagons = placedWagons(items)
  // A different load: the child is changing his mind, which is always allowed and
  // deliberately not measured against the cap — the replacement train is one wagon
  // long, and one is never more than the round asked for.
  if (wagons.length > 0 && wagons[0].type !== item.type) return 'replace'
  return wagons.length < maxWagons ? 'add' : 'refuse'
}

/**
 * Will the game take this tap at all? True for both 'add' and 'replace': the only
 * false is a tap that does nothing whatsoever, which is the only thing the red
 * refusal is allowed to fire on.
 */
export function canAddToTrain(
  items: KeyedTrainItem[],
  item: TrainItem,
  maxWagons: number,
): boolean {
  return trainTap(items, item, maxWagons) !== 'refuse'
}
