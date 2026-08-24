import type { LevelDef } from '../types'

/**
 * Levels, and every knob that decides how hard a round is lives here — never in
 * a component.
 *
 * Level 1 used to constrain only the numbers. The palette still offered three
 * engines and all six wagon types, so the chance of picking the right wagon
 * blind was one in six, and the rule it wanted ("milk means the round one, coal
 * means the open-topped one") is abstract categorisation a four-year-old does
 * not have yet. Two changes fix that without a single word of instruction:
 *
 *   - `wagonChoices` cuts the row to the wagon the task needs plus two
 *     distractors, so there is a real choice to make and only two cards can go
 *     dead when it is made.
 *   - `cargoHints` draws the load in the wagon, which turns the abstract rule
 *     into "find the picture that matches the picture". It stays on for level 2
 *     and goes off at level 3, where the child is expected to know the mapping.
 */
export const LEVELS: LevelDef[] = [
  {
    maxNumber: 2,
    cargoIds: ['coal', 'sand', 'milk', 'apples'],
    wagonTypeIds: ['hopper', 'tank', 'box'],
    locomotiveIds: ['steam', 'electric'],
    // Two cards: the wagon the task needs and one distractor, and which
    // distractor it is changes from round to round. So the row is a real choice
    // that the picture on the wagon settles, exactly one card can go dead once
    // the choice is made, and the refusal fires at most one press in two.
    wagonChoices: 2,
    cargoHints: true,
  },
  {
    maxNumber: 5,
    cargoIds: ['coal', 'sand', 'milk', 'fuel', 'apples', 'parcels', 'cars', 'logs'],
    wagonTypeIds: ['hopper', 'tank', 'box', 'flatcar', 'passenger', 'logcar'],
    locomotiveIds: ['steam', 'electric', 'diesel'],
    wagonChoices: 4,
    cargoHints: true,
  },
  {
    // Roadmap C2. Ten was a five-year-old's ceiling. The dots under the numeral
    // and the empty berths beside the track still handle ten (roadmap A4) and
    // COUNT_WORDS still speaks it, so this is a knob and not a demolition.
    maxNumber: 5,
    cargoIds: ['coal', 'sand', 'milk', 'fuel', 'apples', 'parcels', 'cars', 'logs', 'people'],
    wagonTypeIds: ['hopper', 'tank', 'box', 'flatcar', 'passenger', 'logcar'],
    locomotiveIds: ['steam', 'electric', 'diesel'],
    cargoHints: false,
  },
]

export const CORRECT_PER_LEVEL = 3
