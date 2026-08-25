import { describe, it, expect } from 'vitest'
import { nextMood } from './mood'

describe('nextMood', () => {
  // The core of both bugs this branch shipped: the engine has to fall the
  // instant it goes wrong...
  it('sets sad on entering wrong from playing', () => {
    expect(nextMood('playing', 'wrong', false)).toBe(true)
  })

  it('sets sad on entering wrong from departing', () => {
    expect(nextMood('departing', 'wrong', false)).toBe(true)
  })

  // ...and clear again the instant it leaves, by ANY door, not just the one
  // where the child actually fixes the train.
  it('clears sad on leaving wrong for playing (a touch, not necessarily a fix)', () => {
    expect(nextMood('wrong', 'playing', true)).toBe(false)
  })

  it('clears sad on leaving wrong for departing (a correct train submitted from wrong)', () => {
    expect(nextMood('wrong', 'departing', true)).toBe(false)
  })

  // No transition, no change — whatever the current mood is, it is untouched.
  it('leaves the mood alone when the phase does not change', () => {
    expect(nextMood('playing', 'playing', false)).toBe(false)
    expect(nextMood('wrong', 'wrong', true)).toBe(true)
  })

  // A transition between two phases neither of which is `wrong` never sets sad.
  it('does not set sad for a transition that never touches wrong', () => {
    expect(nextMood('departing', 'celebrating', false)).toBe(false)
  })
})
