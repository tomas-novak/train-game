import type { KeyedTrainItem, TrainItem, WagonType } from '../types'

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
 * Whether it knows which type the round wants is now a parameter, `wantType`, and
 * it is set on exactly one of the two screens. On the CLASSIC screen it is null,
 * for the reason that was measured there: the palette gates its cards on this
 * answer, so a type test made exactly one card bright and it was always the right
 * one, the cargo drawn on the cards became decoration, and the child's choice was
 * gone. Which train is right is asked once there, by the go button.
 *
 * On the WORLD screen it is the task's type, because nothing there is gated on the
 * answer — no card goes dim, no wagon leaves the dock, all three stay live and
 * fully painted — so the answer costs the child nothing until he taps. See
 * `pickWanted` in utils/validation.ts. 'replace' is not a verdict either: it says
 * "your load is now this one", not "your load is now correct".
 */
export type TrainTap = 'add' | 'replace' | 'refuse'

/**
 * `allowReplace` — and it is false in world mode, which is this round's fix.
 *
 * On the classic screen a wrong-type tap is a change of mind: the wagons of the
 * old load come off and the new one starts the train. That is right for a
 * build-from-inventory screen, where a card is a request and the tray is
 * inventory, and it was measured as the thing that rescued a full-but-wrong train
 * from being a dead end.
 *
 * In the world it is destructive, and it was measured as such: with two coal
 * hoppers coupled, the lamp green and the round won, ONE tap on the milk tanker
 * standing on the dock deleted both hoppers, darkened the lamp — and, because the
 * outcome was 'replace' rather than 'refuse', answered with the coupling clunk.
 * The child's only signal that he had just destroyed his own answer was a happy
 * noise. In a round whose whole shape is "pick one of three", the two wrong picks
 * must not be able to touch the right answer at all: nothing in any reference
 * frame removes anything the child has placed. So here the wrong pick is refused
 * — the wagon rocks on its wheels and the rake is left exactly as it stands — and
 * the way to take a load off is what it always was, a tap on the wagon that is
 * already on the train.
 */
export function trainTap(
  items: KeyedTrainItem[],
  item: TrainItem,
  maxWagons: number,
  allowReplace = true,
  wantType: WagonType | null = null,
): TrainTap {
  if (item.kind === 'loco') {
    const current = placedLoco(items)
    return current === undefined || current.id !== item.id ? 'add' : 'refuse'
  }
  /**
   * `wantType` — the pick carries the answer. World mode only; see
   * `pickWanted` in utils/validation.ts for the measured reason.
   *
   * It is deliberately checked BEFORE the cap and before the change-of-mind
   * branch, so it is the first thing a wagon tap meets. It is also the reason
   * the world screen can no longer reach a wrong train at all: the rake is
   * always the engine plus 0..N wagons of the one type the round asked for, so
   * "full but wrong" — the state section A had to invent replacement to escape
   * from — cannot happen there, and nothing the child has placed ever has to be
   * removed to let him finish.
   *
   * Not a dimming and not a hue: the caller's answer to 'refuse' is that the
   * wagon rocks on its wheels where it stands (WorldChoice's `refuse`). Every
   * wagon on the dock stays a live, fully painted, tappable wagon, so the choice
   * is still the child's.
   */
  if (wantType !== null && item.type !== wantType) return 'refuse'
  const wagons = placedWagons(items)
  // A different load: the child is changing his mind, which is always allowed and
  // deliberately not measured against the cap — the replacement train is one wagon
  // long, and one is never more than the round asked for.
  if (wagons.length > 0 && wagons[0].type !== item.type) {
    return allowReplace ? 'replace' : 'refuse'
  }
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
  allowReplace = true,
  wantType: WagonType | null = null,
): boolean {
  return trainTap(items, item, maxWagons, allowReplace, wantType) !== 'refuse'
}
