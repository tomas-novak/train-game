import type { FC } from 'react'
import { countRowGap, splitCountRows } from '../utils/countRows'
import { SKY } from '../theme'

const t = SKY

/**
 * The quantity, drawn — under the numeral in the task panel, and again on the
 * ground above the rails as the live count. One component, used in both places,
 * because that is the only way the promise holds: same wrap rule, same pitch as
 * a fraction of the dot, same round ink disc, same ring for a hole. The two rows
 * are then literally the same drawing at two sizes, so "have I got as many as he
 * asked for?" is answered by shape alone — no counting, no words. A ten is a
 * 5 + 5 block in both places; five of ten is a full upper row over five open
 * rings, which reads as half and cannot be mistaken for a finished ten.
 *
 * `variant`:
 *   - `target` — the numeral's quantity. Every slot is solid; there is nothing
 *     outstanding about a target.
 *   - `live` — the count on the rails. Solid for a wagon that is standing there,
 *     an open ring for one that is still missing. The dot itself never changes
 *     colour: dark ink on a pale ground is the strongest thing this screen has,
 *     and the "enough" signal is drawn behind the row instead, by its caller.
 *
 * The numeral above the target row is the one thing on this screen the child
 * cannot read: "3" is a squiggle until somebody teaches it to him. Three dots are
 * not — subitizing is in place years before numeral recognition, so the dots are
 * the half of the pair he can already read, and the numeral learns its meaning by
 * standing over them.
 */
export const CountRow: FC<{
  /** How many slots in total — the round's number. */
  total: number
  /** How many of them are solid. The target row passes `total`. */
  filled: number
  /** Diameter of one dot. The only thing that differs between the two rows. */
  dot: number
  variant: 'target' | 'live'
}> = ({ total, filled, dot, variant }) => {
  const gap = countRowGap(dot)
  const isLive = variant === 'live'
  const ring = Math.max(4, Math.round(dot * 0.17))
  let index = -1

  return (
    <div className="flex flex-col" style={{ gap }}>
      {splitCountRows(total).map((n, ri) => (
        <div key={ri} className="flex" style={{ gap }}>
          {Array.from({ length: n }).map(() => {
            index += 1
            const i = index
            const isFull = i < filled
            return (
              <div
                key={i}
                {...(isLive
                  ? { 'data-pip': i, 'data-slot': isFull ? 'full' : 'empty' }
                  : { 'data-taskdot': '' })}
                /* The first still-empty pip breathes, so "one more to go" is
                   visible without a word, an arrow or a number. */
                {...(isLive && !isFull && i === filled ? { 'data-next': '' } : null)}
                className={`count-pip ${isFull ? 'count-pip-full' : 'count-pip-empty'}`}
                /* The swell is a one-shot: drop the class once it has run, so the
                   pip goes back to being a plain dot. Named, because the waiting
                   pip's endless breathe reports through here too. */
                onAnimationEnd={(e) => {
                  if (e.animationName === 'pip-land') {
                    e.currentTarget.classList.remove('pip-land')
                  }
                }}
                style={{
                  width: dot,
                  height: dot,
                  ...(isFull
                    ? { background: t.ink }
                    : { borderWidth: ring, borderColor: t.rail }),
                }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
