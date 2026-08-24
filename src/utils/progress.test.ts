import { describe, it, expect } from 'vitest'
import { advanceProgress, parseProgress, INITIAL_PROGRESS, WRONG_TO_DEMOTE } from './progress'

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
})
