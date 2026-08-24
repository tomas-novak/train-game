/**
 * Every Czech word the game says out loud. Content, so it lives here and never
 * inside a component (AGENTS.md).
 *
 * The child cannot read, so this file is the only place the task is ever
 * *stated*. Everything else on screen is a picture or a number.
 */

import { ENGINE_NAME } from './world'

/**
 * Counting out loud, the way a Czech child counts objects: "jedna, dva, tři".
 * Index 0 is unused in play; it is there so the array can be indexed by count.
 */
export const COUNT_WORDS: readonly string[] = [
  'nula',
  'jedna',
  'dva',
  'tři',
  'čtyři',
  'pět',
  'šest',
  'sedm',
  'osm',
  'devět',
  'deset',
]

/** What each cargo is called after "s" (instrumental): "vagony s uhlím". */
const CARGO_WITH: Record<string, string> = {
  coal: 'uhlím',
  sand: 'pískem',
  milk: 'mlékem',
  fuel: 'naftou',
  apples: 'jablky',
  parcels: 'balíky',
  cars: 'auty',
  people: 'lidmi',
  logs: 'kládami',
}

/**
 * Czech counts things in three shapes: one wagon, two to four wagons, five and
 * up wagons. Saying "tři vagonů" would be the kind of wrong that a four-year-old
 * hears immediately, so the shape is picked properly rather than pluralised once.
 */
function wagons(count: number): string {
  if (count === 1) return 'jeden vagon'
  if (count >= 2 && count <= 4) return `${COUNT_WORDS[count]} vagony`
  return `${COUNT_WORDS[count] ?? count} vagonů`
}

/** The whole task in one sentence: "Tři vagony s uhlím!" */
export function taskPhrase(count: number, cargoId: string): string {
  const with_ = CARGO_WITH[cargoId]
  const head = wagons(count)
  return with_ === undefined ? `${head}!` : `${head} s ${with_}!`
}

/**
 * The task as the world screen says it: the engine asks for the train himself.
 *
 * Builds on `taskPhrase` instead of repeating it, so the Czech plural shapes
 * ("jeden vagon", "dva vagony", "pět vagonů") have exactly one implementation.
 * The name is nominative and the verb carries the sentence, so no name ever
 * needs declining here.
 */
export function worldTaskPhrase(count: number, cargoId: string): string {
  return `${ENGINE_NAME} chce ${taskPhrase(count, cargoId)}`
}

/**
 * The round closes with a story instead of a score — roadmap B3, world only.
 *
 * Deliberately free of the cargo noun. Naming the load would need it in the
 * accusative and that is a second declension table for one sentence, so these
 * lines end the journey rather than describe the freight.
 */
export const STORY_PHRASES: readonly string[] = [
  `${ENGINE_NAME} to všechno odvezl do města!`,
  `Ve městě už čekají. ${ENGINE_NAME} to zvládl!`,
  `${ENGINE_NAME} jede spát do depa. Dobrá práce!`,
]

/** Said as each wagon lands, so the count is heard as well as seen. */
export function countPhrase(count: number): string {
  return COUNT_WORDS[count] ?? String(count)
}

/** The train leaves. */
export const DEPART_PHRASES: readonly string[] = ['Jedeme!', 'Vlak jede!']

/** A correct train. Short, because the cheer sound is already saying it. */
export const PRAISE_PHRASES: readonly string[] = [
  'Výborně!',
  'Super!',
  'Krásný vlak!',
  'Máš to!',
]

/**
 * A wrong train. Never a scolding: the child tapped, tried and was brave, and
 * the only useful next thought is "again". The task is repeated right after.
 */
export const RETRY_PHRASES: readonly string[] = [
  'Skoro! Zkusíme to znovu.',
  'Nic se nestalo. Zkus to ještě.',
  'Ještě jednou.',
]
