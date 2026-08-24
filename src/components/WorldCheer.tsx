import type { FC } from 'react'
import { CHEER } from '../data/world'
import { WORLD } from '../theme'

const w = WORLD

/**
 * The reward moment, world mode only — and it does not take the place away.
 *
 * The measured objection was blunt: 2.3 s after the go button "the whole world is
 * washed out to the classic pale blue-white with a pastel star and confetti, i.e.
 * the section-A form returns as a full-screen overlay in the mode built to escape
 * it". The classic `Celebration` paints a radial gradient over the entire frame
 * and drops a 200 px gradient-filled star in the middle of it, which is exactly
 * the wash this mode exists to delete — and it deleted the scene at the one moment
 * the child is happiest with it.
 *
 * So world mode cheers the way the reference does. There is no background at all
 * here, no gradient anywhere, and nothing covers the picture: the train is still
 * pulling out of the station the child can see, and what happens is that the
 * station lets off a drift of coloured balloons which rise up the frame and out of
 * the top of it. That is a real frame of the reference —
 * blind/sago-trains-02 has exactly this, a scatter of flat coloured spheres
 * climbing the right-hand side of the picture past the platform — and it is one
 * flat fill per balloon with a single composited transform each.
 *
 * Inert (`pointer-events: none`), so a touch during the cheer still reaches the
 * game underneath it and still gets its ripple and its tick.
 */
export const WorldCheer: FC = () => (
  <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none select-none">
    {CHEER.map((b, i) => (
      <div
        key={i}
        className="absolute"
        style={{
          left: `${b.x * 100}%`,
          bottom: -b.d,
          width: b.d,
          height: b.d,
          animation: `balloon-rise ${b.ms}ms cubic-bezier(0.35, 0.1, 0.4, 1) ${b.delay}ms forwards`,
        }}
      >
        <svg viewBox="0 0 40 52" width="100%" height="100%" aria-hidden="true">
          {/* the string, then the balloon over the top of it: two flat shapes, no
              stroke on the body, no gradient, nothing cast */}
          <path
            d="M20,34 Q24,44 20,52"
            fill="none"
            stroke={w.cubInk}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity={0.45}
          />
          <circle cx="20" cy="18" r="18" fill={b.fill} />
          <polygon points="16,34 24,34 20,39" fill={b.fill} />
        </svg>
      </div>
    ))}
  </div>
)
