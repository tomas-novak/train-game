import { describe, it, expect } from 'vitest'
import { advanceProgress, parseProgress, INITIAL_PROGRESS } from './progress'
import { CORRECT_PER_LEVEL, WRONG_TO_DEMOTE } from '../data/levels'

const MAX_LEVEL = 3
const at = (level: number, correctInLevel: number, wrongStreak: number) => ({
  level,
  correctInLevel,
  wrongStreak,
})

describe('advanceProgress', () => {
  it('counts a clean round and clears the mistake streak', () => {
    expect(advanceProgress(at(1, 0, 1), false, MAX_LEVEL)).toEqual(at(1, 1, 0))
  })

  it('promotes after three clean rounds and resets the streak', () => {
    expect(advanceProgress(at(1, 2, 0), false, MAX_LEVEL)).toEqual(at(2, 0, 0))
  })

  it('does not promote past the top level', () => {
    expect(advanceProgress(at(3, 2, 0), false, MAX_LEVEL)).toEqual(at(3, 0, 0))
  })

  it('a round with a mistake clears the clean streak and counts the mistake', () => {
    expect(advanceProgress(at(2, 2, 0), true, MAX_LEVEL)).toEqual(at(2, 0, 1))
  })

  it('demotes after two rounds with mistakes and resets both streaks', () => {
    expect(advanceProgress(at(3, 0, 1), true, MAX_LEVEL)).toEqual(at(2, 0, 0))
  })

  it('does not demote below level 1', () => {
    expect(advanceProgress(at(1, 0, 1), true, MAX_LEVEL)).toEqual(at(1, 0, 0))
  })

  // The regression test for the bug the spec review caught: a round can only end
  // in success in this game, so streaks counted per SUBMISSION would let every
  // success clear wrongStreak and the demotion would never fire. The streak must
  // survive a success and die only on a CLEAN round.
  it('needs two mistake rounds in a row, not two mistakes with a clean round between', () => {
    const afterFirstMistake = advanceProgress(at(3, 0, 0), true, MAX_LEVEL)
    expect(afterFirstMistake).toEqual(at(3, 0, 1))
    const afterCleanRound = advanceProgress(afterFirstMistake, false, MAX_LEVEL)
    expect(afterCleanRound).toEqual(at(3, 1, 0))
    const afterSecondMistake = advanceProgress(afterCleanRound, true, MAX_LEVEL)
    expect(afterSecondMistake.level).toBe(3)
    expect(afterSecondMistake.wrongStreak).toBe(1)
  })

  it('WRONG_TO_DEMOTE is two, so one mistake round never demotes', () => {
    expect(WRONG_TO_DEMOTE).toBe(2)
    expect(advanceProgress(at(3, 0, 0), true, MAX_LEVEL).level).toBe(3)
  })
})

describe('parseProgress', () => {
  it('returns the initial progress for missing storage', () => {
    expect(parseProgress(null, MAX_LEVEL)).toEqual(INITIAL_PROGRESS)
  })

  it('returns the initial progress for malformed json', () => {
    expect(parseProgress('{not json', MAX_LEVEL)).toEqual(INITIAL_PROGRESS)
  })

  it('returns the initial progress when the shape is wrong', () => {
    expect(parseProgress('{"level":"two"}', MAX_LEVEL)).toEqual(INITIAL_PROGRESS)
  })

  it('defaults a missing wrongStreak to zero', () => {
    expect(parseProgress('{"level":2,"correctInLevel":1}', MAX_LEVEL)).toEqual(at(2, 1, 0))
  })

  it('clamps a level above the top and below one', () => {
    expect(parseProgress('{"level":99,"correctInLevel":0}', MAX_LEVEL).level).toBe(MAX_LEVEL)
    expect(parseProgress('{"level":0,"correctInLevel":0}', MAX_LEVEL).level).toBe(1)
  })

  it('rejects non-finite numbers instead of storing NaN', () => {
    expect(parseProgress('{"level":null,"correctInLevel":0}', MAX_LEVEL)).toEqual(INITIAL_PROGRESS)
  })

  // Both of these parse to a value whose properties are absent or of the wrong
  // shape rather than throwing at JSON.parse, so the fallback that saves them
  // is the `try`'s catch of the property access below it (`null.level` throws;
  // `[].level` is merely `undefined`) — not a check written for this case on
  // purpose. Pinned here so a future refactor of the guard cannot silently stop
  // covering either shape.
  it('returns the initial progress for the JSON literal null', () => {
    expect(parseProgress('null', MAX_LEVEL)).toEqual(INITIAL_PROGRESS)
  })

  it('returns the initial progress for an empty array', () => {
    expect(parseProgress('[]', MAX_LEVEL)).toEqual(INITIAL_PROGRESS)
  })

  // `parseProgress`'s job is "anything it cannot vouch for becomes a fresh
  // start" — that has to cover the streaks as much as the level. Neither streak
  // is ever legitimately stored at or above the constant that reads it, so a
  // stored value at the old `sky` key's ceiling (or a corrupted one past it)
  // must not survive into a round that would otherwise promote or demote
  // immediately instead of after the real number of clean or dirty rounds.
  it('clamps correctInLevel below the promotion threshold', () => {
    expect(
      parseProgress('{"level":2,"correctInLevel":99}', MAX_LEVEL).correctInLevel,
    ).toBe(CORRECT_PER_LEVEL - 1)
  })

  it('clamps wrongStreak below the demotion threshold', () => {
    expect(
      parseProgress('{"level":2,"correctInLevel":0,"wrongStreak":99}', MAX_LEVEL).wrongStreak,
    ).toBe(WRONG_TO_DEMOTE - 1)
  })
})
