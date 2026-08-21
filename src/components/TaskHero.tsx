import { useRef, type FC } from 'react'
import type { Task } from '../types'
import { CountRow } from './CountRow'
import { SKY, WORLD } from '../theme'

const t = SKY

/**
 * The pair of straps a sign hangs from — world mode only, and inert.
 *
 * See `.sign-strap` in index.css for what they are for. They are drawn before the
 * panel and both are positioned, so the panel paints over their lower half and
 * what is left visible is a bracket disappearing off the top of the frame.
 */
const Straps: FC<{ at: string[] }> = ({ at }) => (
  <>
    {at.map((left, i) => (
      <span
        key={left + i}
        className="sign-strap"
        aria-hidden="true"
        style={{ left, background: i === 0 ? WORLD.hangerDark : WORLD.hanger }}
      />
    ))}
  </>
)

interface Props {
  task: Task
  onHelp: (() => void) | null
  pulse: boolean
  /** Read the task out loud. The panel is the child's "say it again" button. */
  onSpeak?: () => void
  isTablet?: boolean
  /**
   * World mode. Two differences and no third: the panel is smaller, and it hangs.
   *
   * Smaller because it was measured at 216x146 in a 1024x768 frame — the biggest
   * single object above the horizon, larger than the station and larger than any
   * wagon on the rails — and the subject of this screen is the train. Every size
   * below it comes down by about a fifth, which leaves the '?' at 68 px and so
   * still clear of the 64 px floor; the numeral is the one thing that comes down
   * least, because it is what the round is.
   */
  world?: boolean
}

export const TaskHero: FC<Props> = ({
  task,
  onHelp,
  pulse,
  onSpeak,
  isTablet = false,
  world = false,
}) => {
  const CargoIcon = task.cargo.icon
  const panelRef = useRef<HTMLButtonElement>(null)

  /* World mode takes another fifth off every one of these. The sign measured
     180x124 above a horizon at y=236, i.e. the biggest object in the sky band and
     bigger than the station behind it, in a mode whose subject is the train. It is
     a sign hanging from the top of the frame — which the reference does
     (frames-clean/frame-094 and -095 both hang a board from the top edge) — and a
     sign in a place is small. The '?' is the one thing that does not shrink: 68 px
     is 4 px above the touch floor and the floor is not negotiable. */
  /* Round 4 takes another fifth off the world numbers again, and it is the same
     objection a third time: the sign measured 142x101 at (12,12) and was still
     "a rounded beige card with a rim floating in the sky". It is a board bolted to
     the top edge of the frame now (App gives the top bar no padding in world mode,
     and see `.world-plate`), and a board on a wall is small. The '?' does not
     exist in this mode at all, so nothing here is anywhere near the 64 px floor
     except the board itself, which is far above it. */
  const badgeSize  = isTablet ? (world ? 48 : 90) : 64
  const badgeFont  = isTablet ? (world ? 34 : 62) : 44
  const iconSize   = isTablet ? (world ? 42 : 78) : 56
  const helpSize   = isTablet ? (world ? 68 : 78) : 66 // never below the 64 px touch floor
  const helpFont   = isTablet ? (world ? 30 : 36) : 26
  /**
   * The dot under the numeral. Its twin on the track is 20 px at trackHeight 200,
   * and the two have to be the same size to the eye or the comparison they exist
   * for does not happen — so this one is 22, not the 24 it once was. The counter
   * cannot grow to meet it: two rows of pips have to fit in the bare strip above
   * the first rail without touching a wheel.
   */
  const dotSize    = isTablet ? (world ? 12 : 22) : 16

  /**
   * The task display is the one thing on screen that answers "what am I supposed
   * to do?", and the child cannot read the answer. So it is a button: press it
   * and the sentence is spoken again. The rock is started imperatively here so
   * its first frame is the frame of the touch — speech has real startup latency
   * and can never be the reaction to a finger.
   */
  const handlePanelPress = () => {
    const el = panelRef.current
    if (el) {
      el.classList.remove('task-poke')
      void el.offsetWidth
      el.classList.add('task-poke')
    }
    onSpeak?.()
  }

  return (
    <div className="flex items-center gap-3">
      <span className="relative flex">
      {world && <Straps at={['22%', '68%']} />}
      <button
        ref={panelRef}
        type="button"
        data-touchable
        onPointerDown={handlePanelPress}
        onAnimationEnd={() => panelRef.current?.classList.remove('task-poke')}
        aria-label="Zadání"
        className={`world-plate relative flex items-center touch-none select-none transition-transform duration-150 ${
          world ? 'gap-2 px-2 pb-2 pt-1' : 'gap-3 rounded-3xl pl-4 pr-5 py-3'
        } ${pulse ? 'scale-105' : 'scale-100'}`}
        style={{
          background: t.panel,
          boxShadow: `0 8px 20px ${t.shadow}, inset 0 -3px 0 ${t.panelEdge}`,
        }}
      >
        {/* The numeral and its quantity, stacked: one column, read top to bottom. */}
        <div className="flex flex-col items-start" style={{ gap: isTablet ? 10 : 7 }}>
          <div
            className="world-badge rounded-2xl flex items-center justify-center"
            style={{
              width: badgeSize, height: badgeSize,
              background: `linear-gradient(180deg, ${t.accent2}, ${t.accent})`,
              boxShadow: `inset 0 -3px 0 rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,0.4)`,
              color: '#fff',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 900,
              fontSize: badgeFont,
              lineHeight: 1,
            }}
          >
            {task.count}
          </div>
          <CountRow total={task.count} filled={task.count} dot={dotSize} variant="target" />
        </div>
        <CargoIcon size={iconSize} />
      </button>
      </span>
      {onHelp && (
        <span className="relative flex">
        <button
          onClick={onHelp}
          className={`${
            world ? 'world-chrome' : 'world-plate'
          } relative rounded-full transition-transform active:scale-90 hover:scale-105 flex items-center justify-center`}
          style={{
            width: helpSize, height: helpSize,
            background: t.panel,
            /* Unplated in world mode, so the glyph itself has to carry: the scene's
               own darkest ink on apricot sky, not a soft grey meant for a white
               plate. */
            color: world ? WORLD.cubInk : t.inkSoft,
            fontWeight: 800, fontSize: helpFont, lineHeight: 1,
            boxShadow: `0 6px 14px ${t.softShadow}, inset 0 -2px 0 ${t.panelEdge}`,
          }}
          aria-label="Help"
        >
          ?
        </button>
        </span>
      )}
    </div>
  )
}
