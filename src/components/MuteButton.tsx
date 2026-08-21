import { useRef, type FC } from 'react'
import { SKY, WORLD } from '../theme'

const t = SKY

/**
 * The parent's switch. No text anywhere near it, and the states are told apart by
 * several things at once — the colour of the whole button, the bar across the
 * speaker, and whether the sound waves are there at all — so it can be read from
 * across the room without reading anything.
 *
 * Sound on:      white panel, dark speaker, three slate waves.
 * Sound off:     flat red plate, white speaker, one thick white bar, no waves.
 * Cannot speak:  white panel, dark speaker, three AMBER waves, and an amber badge
 *                with a crossed-out speech bubble.
 *
 * That third state exists because a device with no Czech voice pack — the default
 * on a lot of Android tablets — plays every sound effect and says nothing at all.
 * With only two states the button would sit there showing green while the one
 * channel the child depends on was dead, and the parent would never find out.
 */

const AMBER = '#f79e2d'

interface Props {
  muted: boolean
  onToggle: () => void
  /** This device has no Czech voice: effects work, speech does not. */
  speechOff?: boolean
  isTablet?: boolean
  /**
   * World mode: the switch hangs from the top edge of the frame instead of
   * floating in the sky. Nothing else about it changes — same disc, same
   * diameter, same hit box, same three states — see `.sign-strap` in index.css.
   */
  world?: boolean
}

export const MuteButton: FC<Props> = ({
  muted,
  onToggle,
  speechOff = false,
  isTablet = false,
  world = false,
}) => {
  const ref = useRef<HTMLButtonElement>(null)
  // Never below the 64 px touch floor, at either orientation.
  const size = isTablet ? 88 : 72
  const glyph = Math.round(size * 0.62)
  const badge = Math.round(size * 0.36)
  /** The warning only makes sense while sound is on; muted is already the louder fact. */
  const warnVoice = speechOff && !muted
  /**
   * Slate, not the correctness green. A tree scan of a full wrong-type train found
   * these three little wave bars wearing SKY.good — the one hue that is now allowed
   * to mean exactly one thing, "the train on the rails is right". A parent's mute
   * switch is not a verdict on the child's train, and the child does not need it to
   * be readable at all; the amber warning state keeps its own hue, because that one
   * genuinely is a warning.
   */
  const waveFill = warnVoice ? AMBER : t.inkSoft

  /**
   * The muted glyph's ink. Classic paints the whole disc red and the speaker
   * white on top of it; world mode has no disc to paint, so the cross and the cone
   * are drawn in the scene's own darkest ink instead — white on apricot sky is
   * invisible, and this switch has to read in both states.
   */
  const mutedInk = world ? WORLD.cubInk : '#ffffff'

  const handlePointerDown = () => {
    // Same frame as the finger: the squash starts before the icon has swapped,
    // so a mute (which makes the game silent) still answers instantly.
    const el = ref.current
    if (el) {
      el.classList.remove('mute-poke')
      void el.offsetWidth
      el.classList.add('mute-poke')
    }
    onToggle()
  }

  return (
    <span className="relative flex shrink-0">
    {/* No strap in world mode any more, and no plate under it either: this is the
        parent's switch, not a sign in the place, so what is left is the glyph. See
        `.world-chrome` in index.css. */}
    <button
      ref={ref}
      data-touchable
      data-mute
      type="button"
      onPointerDown={handlePointerDown}
      onAnimationEnd={() => ref.current?.classList.remove('mute-poke')}
      className={`${
        world ? 'world-chrome' : 'world-plate'
      } relative rounded-full flex items-center justify-center touch-none select-none shrink-0`}
      style={{
        width: size,
        height: size,
        background: muted ? t.bad : t.panel,
        boxShadow: muted
          ? 'none'
          : warnVoice
            ? `0 0 0 3px ${AMBER}, 0 6px 14px ${t.softShadow}`
            : `0 6px 14px ${t.softShadow}, inset 0 -2px 0 ${t.panelEdge}`,
      }}
      aria-label={
        muted ? 'Zvuk zapnout' : warnVoice ? 'Zvuk vypnout, mluvení není dostupné' : 'Zvuk vypnout'
      }
      aria-pressed={muted}
    >
      <svg width={glyph} height={glyph} viewBox="0 0 32 32" aria-hidden="true">
        {/* the speaker cone: one flat shape, Sago-style, no strokes or gradients */}
        <path
          d="M6 12 h5 L18 6 v20 l-7-6 H6 z"
          fill={muted ? mutedInk : t.ink}
        />
        {muted ? (
          /* one thick bar, corner to corner: the universal "off" */
          <rect
            x="0.5"
            y="14.1"
            width="31"
            height="3.8"
            rx="1.9"
            fill={mutedInk}
            transform="rotate(-45 16 16)"
          />
        ) : (
          /* Sound coming out: three flat bars, growing. Filled shapes rather than
             strokes, because the reference art has no strokes anywhere. */
          <>
            <rect x="20.5" y="13" width="3.4" height="6" rx="1.7" fill={waveFill} />
            <rect x="24.4" y="10.4" width="3.4" height="11.2" rx="1.7" fill={waveFill} />
            <rect x="28.3" y="7.6" width="3.4" height="16.8" rx="1.7" fill={waveFill} />
          </>
        )}
      </svg>
      {/* "It cannot talk here": a crossed-out speech bubble, sitting on the corner
          of a button that is otherwise saying sound is on. Flat shapes only. */}
      {warnVoice && (
        <span
          className="absolute rounded-full flex items-center justify-center"
          style={{ width: badge, height: badge, right: -2, bottom: -2, background: AMBER }}
        >
          <svg width={badge} height={badge} viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5 5 h14 a2 2 0 0 1 2 2 v7 a2 2 0 0 1 -2 2 h-7 l-4 3 v-3 h-3 a2 2 0 0 1 -2 -2 v-7 a2 2 0 0 1 2 -2 z"
              fill="#ffffff"
            />
            <rect x="1.6" y="10.6" width="20.8" height="3.2" rx="1.6" fill={AMBER} transform="rotate(-45 12 12)" />
          </svg>
        </span>
      )}
    </button>
    </span>
  )
}
