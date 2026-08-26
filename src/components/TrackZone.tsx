import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FC,
  type ReactNode,
  type RefObject,
} from 'react'
import type { KeyedTrainItem, TrainIcon, ValidationResult, WagonType } from '../types'
import { LOCOMOTIVES } from '../data/locomotives'
import { wagonIcon } from '../data/wagons'
import {
  BEAK,
  FRIENDS,
  LOCO_RATIO,
  OFFER_GAP,
  OFFER_MIN,
  OFFER_PAD,
  OFFER_SCALE,
  OFFER_SHARE,
  OFFER_TAIL_BLEED,
  RIDER,
  WAGON_BAND,
  WAGON_LINE,
} from '../data/world'
import { Critter } from './svgs'
import type { GamePhase } from '../hooks/useGameState'
import { CountRow } from './CountRow'
import { countRowHeight } from '../utils/countRows'
import { SKY, WORLD } from '../theme'

const t = SKY
const w = WORLD

const LOCO_ICON = Object.fromEntries(LOCOMOTIVES.map((l) => [l.id, l.icon]))

/**
 * The signal beside the rails, and the one place the child can read "it's right
 * now" without committing to anything.
 *
 * It used to be green only while the train was actually leaving, i.e. it repeated
 * a fact the moving train already made obvious and said nothing at the one moment
 * that mattered. Now `isGo` is the train being genuinely answerable — right wagon
 * type, right count, engine on — so the lamp turns green by itself the instant the
 * child gets there, before he presses anything. A full train of the wrong wagons
 * leaves it red, which is the truth and is exactly what the go button will say.
 *
 * The `lamp-go` class is applied by React only on the render where `isGo` first
 * becomes true, so the one-shot swell runs once, on the frame the answer arrives,
 * and never again while it stays right.
 */
const Signal: FC<{ isGo: boolean; trackHeight: number; unit: number; world: boolean }> = ({
  isGo,
  trackHeight,
  unit,
  world,
}) => {
  /* `unit` and not `trackHeight`: in world mode the band is taller than it was and
     the signal is not the thing that should grow with it. Everything about the
     assembly is a fraction of one number so the whole of it scales together. */
  const lampH  = Math.round(unit * 0.543)
  const lampW  = Math.round(unit * 0.229)
  const lightD = Math.round(unit * 0.129)
  /**
   * World mode stands it hard against the left edge of the frame.
   *
   * The train is centred now (see `padStart`), so the space left of it is the
   * signal's and the signal's alone: it is pushed out to the edge and the row's
   * left pad is sized to keep the rolling stock clear of it at every count and in
   * both orientations. It stays behind the train in the paint order, which is
   * where a signal beside a line belongs — and, since it is never overlapped, the
   * lamp that says "the train is right" can never be hidden by the train.
   */
  const left   = Math.round(unit * (world ? 0.06 : 0.286))

  return (
    <div
      className="absolute pointer-events-none flex flex-col items-center"
      /* World: the post runs 20 px past the bottom of the band, so its foot is
         swallowed by the near bank instead of stopping in mid-air. */
      style={{ left, top: -2, height: trackHeight + (world ? 22 : 2) }}
    >
      {/*
        The target board, world mode only — and it is the whole of what turns two
        coloured dots into a railway signal.

        Round 1's signal read as a road sign and round 2's as a traffic light,
        which on a railway is the worse of the two mistakes. What a flat drawing
        has to say "signal" with is the board the lamps are mounted on: every
        real one has a pale target behind the lights, and nothing else on a road
        does. So the housing now sits on a cream board a few px wider than itself,
        and the post below it is a post rather than a stick — see `signalBoard`.
      */}
      <div
        className="rounded-xl"
        style={
          world
            ? { background: w.signalBoard, padding: 5, marginTop: 2 }
            : undefined
        }
      >
      <div
        data-signal={isGo ? 'go' : 'stop'}
        className={`rounded-xl flex flex-col items-center justify-center${isGo ? ' lamp-go' : ''}`}
        style={{
          /* World mode paints flat and casts nothing: the reference art has no
             gradient and no drop shadow anywhere, and a signal box was one of the
             three places ours still had both. */
          background: world ? w.signalHousing : 'linear-gradient(180deg, #3a3a3a, #1a1a1a)',
          width: lampW, height: lampH, padding: 5, gap: 4, marginTop: 6,
          boxShadow: world
            ? 'none'
            : '0 4px 8px rgba(0,0,0,0.3), inset 0 -2px 0 rgba(0,0,0,0.6)',
        }}
      >
        <div
          data-lamp="red"
          data-lit={isGo ? 'false' : 'true'}
          className={isGo ? undefined : 'animate-pulse'}
          style={{
            width: lightD, height: lightD, borderRadius: '50%',
            /* World: flat fills and no cast glow. The brief for this piece bans
               gradients, strokes and drop shadows because the reference has none,
               and the pulsing red lamp was the one place in world mode that still
               painted a `0 0 12px` halo — the critic measured it. The pulse itself
               stays: it is opacity only, and it is the thing that says the signal
               is a live object rather than a painted dot. */
            background: world
              ? isGo ? '#3a4048' : t.bad
              : isGo
                ? 'radial-gradient(circle at 35% 30%, #555, #2a2a2a)'
                : `radial-gradient(circle at 35% 30%, #ff8a8a, ${t.bad})`,
            boxShadow: world || isGo ? 'none' : `0 0 12px 4px ${t.bad}aa`,
          }}
        />
        <div
          data-lamp="green"
          data-lit={isGo ? 'true' : 'false'}
          style={{
            width: lightD, height: lightD, borderRadius: '50%',
            background: world
              ? isGo ? t.good : '#3a4048'
              : isGo
                ? `radial-gradient(circle at 35% 30%, #b8e5b8, ${t.good})`
                : 'radial-gradient(circle at 35% 30%, #555, #2a2a2a)',
            boxShadow: !world && isGo ? `0 0 12px 4px ${t.good}aa` : 'none',
          }}
        />
      </div>
      </div>
      {/* The mast. A wooden post in the world, not a grey rod: the grey mast was
          named as one of the frame's meaningless grey shapes — and in round 3 it
          is a post that has been PLANTED. Round 2's was a 3 px stick that stopped
          in the grass with no foot, which is most of why the thing above it read
          as a traffic light: nothing about the assembly said it had been driven
          into the ground beside a railway. It is 11 px wide now, and there is a
          foot at the bottom of it, buried in the near bank. */}
      <div
        style={{
          flex: 1,
          width: world ? 11 : 4,
          background: world ? w.signalPost : '#666',
          borderRadius: world ? 3 : 2,
          margin: '0 auto',
        }}
      />
      {world && (
        <div
          style={{
            width: 26,
            height: 9,
            marginTop: -1,
            borderRadius: 3,
            background: w.signalPostDark,
          }}
        />
      )}
    </div>
  )
}

/**
 * What a missing wagon is drawn in: three tones of the ballast itself, and nothing
 * else on the screen uses them.
 *
 * Four earlier versions failed, each in its own direction. Drawn in the sleeper's
 * own grey it vanished into the tie pattern. Drawn near-white it stood 20/255 clear
 * of the ballast and ten of them merged into one striped ribbon. Drawn as a
 * finished steel wagon it was countable but so close to a real wagon that filling
 * a hole barely showed. Drawn as a wagon-shaped silhouette in `#454f74` it was
 * countable and unmistakably empty — and it was the darkest ink on the screen,
 * wearing a roof lip, a body and four wheels, at full wagon size, while every real
 * wagon is pale. On a fresh level-3 round the rails read as a finished dark train
 * of ten when the child owned one wagon: the channel that should have said "more
 * needed" said "done".
 *
 * So a hole is now a hole: a shallow bay pressed into the ballast, in the
 * ballast's own value. Nothing about it is wagon-shaped — no roof, no body, no
 * wheels — and nothing about it is dark. It is read as a recess the only way a
 * flat drawing can say recess: an opaque floor a step darker than the ground,
 * a shadow along the lip the light does not reach (the top), and a lit near lip
 * along the bottom. Being opaque it cuts the sleeper stripes, so ten of them are
 * ten smooth bays interrupting a striped bed — countable along the row, and at a
 * glance obviously *unbuilt* ground rather than rolling stock.
 *
 * The ballast is rgb(215,221,233). `FLOOR` is rgb(194,203,219) — about 20 per
 * channel down, one step of shade. `SHADE`, the strip under the far lip, is
 * rgb(155,166,191), around 55 down, and still 40 per channel lighter than the
 * lightest grey any real wagon is drawn with and 100 lighter than the ink of its
 * wheels. `LIP` is rgb(224,229,239), 8 up. So the whole bay lives inside the
 * ground's own value range, and a wagon landing in it is the arrival of the only
 * saturated, wagon-shaped, wagon-tall object in that spot.
 *
 * Deliberately hue-free, so a hole can never pre-announce which type the round
 * wants: choosing the type stays the child's decision.
 */
const SLOT_FLOOR = '#c2cbdb'
const SLOT_SHADE = '#9ba6bf'
const SLOT_LIP = '#e0e5ef'

/**
 * ...and in world mode the ground the bay is pressed into is a green field, not
 * grey ballast, so the three tones have to be that field's own. The rule is the
 * same rule and it is the only thing that carries over: a bay is a step down
 * into whatever it is standing in, so it is drawn in three values of the ground
 * and in no hue of its own. The classic values are the literals above; the world
 * values are `WORLD.slot*`, and the swap is a custom property set on the band
 * root, because these two SVGs are shared by both modes and must not learn which
 * one they are in.
 */
const slotVar = (name: string, fallback: string) => `var(${name}, ${fallback})`

/**
 * An empty slot on the rails — the bay a wagon is going to stand in.
 *
 * This replaces the old ghost train, which drew a locomotive and exactly two
 * wagons whatever the round had asked for, in the colours of the first engine and
 * the first wagon type on the list. It was decoration that happened to be wrong:
 * a round asking for one wagon and a round asking for five showed the same two.
 *
 * Now there is one of these per wagon the round is still missing, at the real
 * wagon's own footprint, in the real train row, immediately after the last real
 * wagon. So "how many more?" is answered by the train itself — three bays, fill
 * them — which is the same question the dots answer, asked in the place the child
 * is looking while he builds.
 *
 * Same viewBox and the same width as every real wagon icon, so bays and wagons
 * stand in one unbroken line and one common scale; but only the bottom half of
 * that box is drawn in, because the space a wagon's body and roof will occupy has
 * to read as empty air. See `SLOT_FLOOR` for why it is a dip and not a drawing of
 * a wagon.
 */
const SlotWagon: FC<TrainIcon> = ({ size = 80 }) => (
  <svg
    viewBox="0 0 100 76"
    width={size}
    height={(size * 76) / 100}
    style={{ display: 'block' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Three flat fills, no strokes and no gradients, like everything else in the
        game: the lit near lip, the floor of the bay, and the shadow under the far
        lip. Drawn bottom-up so each sits on the one before it. */}
    <rect x="6" y="39" width="88" height="31" rx="13" fill={slotVar('--slot-lip', SLOT_LIP)} />
    <rect x="8" y="36" width="84" height="30" rx="12" fill={slotVar('--slot-floor', SLOT_FLOOR)} />
    <rect x="12" y="36" width="76" height="11" rx="5" fill={slotVar('--slot-shade', SLOT_SHADE)} />
  </svg>
)

/**
 * The same bay for the engine, shown only while the train has none. Wider, because
 * an engine is wider; otherwise identical, and deliberately nobody's engine — the
 * round offers two or three of them and every one is a right answer, so the hole
 * must not look like a particular one.
 */
const SlotLoco: FC<TrainIcon> = ({ size = 100 }) => (
  <svg
    viewBox="0 0 140 76"
    width={size}
    height={(size * 76) / 140}
    style={{ display: 'block' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="6" y="39" width="128" height="31" rx="13" fill={slotVar('--slot-lip', SLOT_LIP)} />
    <rect x="8" y="36" width="124" height="30" rx="12" fill={slotVar('--slot-floor', SLOT_FLOOR)} />
    <rect x="12" y="36" width="116" height="11" rx="5" fill={slotVar('--slot-shade', SLOT_SHADE)} />
  </svg>
)

/**
 * The live count, standing on the ground above the rails.
 *
 * One slot per wagon the task asked for: an open ring while that wagon is
 * missing, a solid ink dot once it is standing on the rails. So the child can
 * answer "have I got enough?" by looking, before he ever presses the button —
 * three rings, two of them filled, one still open — instead of building blind
 * and being told no afterwards.
 *
 * It draws itself with `CountRow`, the very component the task panel uses for
 * the dots under the numeral. Not a copy of it: the same code, so the wrap at
 * five, the pitch, the disc and the ring cannot drift apart. A ten is a 5 + 5
 * block in both places, an eight is 5 + 3 in both places, and at five of ten the
 * lower row is five open rings — the shape says "half", which is exactly what a
 * single ten-long line of pips could not say. Only the diameter differs, and by
 * less than a tenth.
 *
 * Not interactive, and it must never be: it sits over the drop zone, so it is
 * `pointer-events-none` and a finger that lands on it still taps the rails.
 */
const CountPips: FC<{
  pipsRef: RefObject<HTMLDivElement | null>
  target: number
  filled: number
  pip: number
  /** The block's own measured height, so the strip it claims is explicit. */
  height: number
  left: number
  top: number
  dimmed: boolean
  /** The one input allowed to turn this row's plate green. */
  isRight: boolean
}> = ({ pipsRef, target, filled, pip, height, left, top, dimmed, isRight }) => (
  <div
    ref={pipsRef}
    data-counter
    className="absolute pointer-events-none select-none transition-opacity duration-300"
    /* Anchored at its bottom edge: when the row swells it grows upward, into the
       bare strip, and never down over the wheels. */
    style={{ left, top, height, opacity: dimmed ? 0 : 1, transformOrigin: 'left bottom' }}
    /* The full-row swell is a one-shot; the pips' own animations bubble up here
       too, so it is gated by name. */
    onAnimationEnd={(e) => {
      if (e.animationName === 'pips-done') {
        e.currentTarget.classList.remove('count-row-done')
      }
    }}
  >
    {/*
      "That is the right train." A flat green plate behind the dots, the green of
      the go lamp, the largest new shape on the track — and it leaves the dots
      themselves dark, so the count stays as readable as it was and the verdict
      sits behind it. Inset, so not one dot moves, and it takes its air upward:
      below the row there is a locomotive roof.

      Gated on `isRight`, not on the row being full. Full-and-wrong used to get
      this plate: ten green-backed dots over a train of the wrong wagons, beside a
      red signal, in front of a go button that was about to refuse it. The count
      being full is a fact the dots already state by filling in; green is a
      verdict, and it now waits for the verdict to be true.
    */}
    {isRight && (
      <div
        data-counter-done
        className="absolute rounded-full"
        style={{
          left: -Math.round(pip * 0.45),
          right: -Math.round(pip * 0.45),
          top: -Math.round(pip * 0.4),
          bottom: -Math.round(pip * 0.08),
          background: t.good,
        }}
      />
    )}
    <div className="relative">
      <CountRow total={target} filled={filled} dot={pip} variant="live" />
    </div>
  </div>
)

/**
 * The animal riding on a coupled wagon — roadmap E3, world mode only.
 *
 * E2 stood a full-size animal BESIDE each of the three OFFERED wagons, and the
 * measured verdict was that it was a large part of why the offer outweighed the
 * train. The reference puts its characters on the train instead: in
 * frames-clean/frame-030 a rabbit is standing on the leading wagon's roof with
 * four more heads looking out of the openings, and frame-040 has a rabbit and a
 * sloth up on two wagons of a moving rake. That is what makes a Sago train worth
 * looking at, and it is the difference between a train and a row of containers.
 *
 * So one of them stands on every wagon the child has actually coupled. Three
 * consequences, all of them the point:
 *
 *   - the faces are on the train, so the loudest, most legible objects in the frame
 *     belong to the thing the child built;
 *   - every one of them is inside a tap target that answers (tapping a coupled
 *     wagon takes it off again), which is the objection E2 was given about inert
 *     faces on the near bank, closed by construction;
 *   - the train visibly gains a passenger each time a wagon arrives, so growing the
 *     rake is a thing that happens to somebody rather than a count going up.
 *
 * It stands over the near END of the wagon (`RIDER.x`), never over the opening, so
 * the load the round asked for is never covered. Feet on the body's top rim: every
 * wagon drawing is a 100x76 box whose body top edge is at y=19, i.e. 0.75 of the
 * way up, and `RIDER.foot` tucks them a hair behind it.
 */
/*
 * Exported in E3 round 3, because the wagons WAITING on the line carry one too now.
 *
 * "Put a face in each parked wagon's window so the eye lands on a choice instead of
 * on the inert engine — a face costs almost no ink and is how frames-clean/frame-030
 * makes its stock the subject." Every wagon standing in frame-030, -031, -032 and
 * -041 has somebody on it or in it, the parked ones included, and the same animal
 * stays with the same wagon when it moves. So WorldChoice draws this on each parked
 * wagon, at the index the wagon's rider will have once it is coupled, and the flying
 * copy carries it too — one drawing, one component, one set of numbers, rather than
 * a second rider re-derived beside this one.
 */
export const WagonRider: FC<{ index: number; wagonSz: number; pad: number }> = ({ index, wagonSz, pad }) => {
  const drawH = (wagonSz * 76) / 100
  const h = Math.round(drawH * RIDER.h)
  const w2 = Math.round(h * RIDER.aspect)
  const spec = FRIENDS[index % FRIENDS.length]
  return (
    <span
      aria-hidden="true"
      /* Idling, and out of step with the other riders: every character in every
         reference frame breathes. One composited transform on one element. */
      className="wr-rider absolute pointer-events-none select-none"
      style={{
        left: pad + Math.round(wagonSz * RIDER.x - w2 / 2),
        bottom: pad + Math.round(drawH * RIDER.foot),
        width: w2,
        height: h,
        animationDelay: `${(index % 3) * 780}ms`,
      }}
    >
      <Critter
        spec={{ ...spec, ink: w.cubInk, beak: BEAK }}
        width={w2}
        height={h}
      />
    </span>
  )
}

interface Props {
  trainItems: KeyedTrainItem[]
  onRemoveItem: (key: number) => void
  isOver: boolean
  isBlocked: boolean
  /**
   * The load to draw inside a wagon of this type, or null while the level wants
   * empty shells. A function and not one id for the whole train, because a child
   * may well have chosen a load the round did not ask for: a tank on a coal round
   * must be drawn carrying milk, exactly as the card he tapped was drawn, and never
   * carrying the coal the task wants.
   */
  wagonCargo: (type: WagonType) => string | null
  /** How many wagons this round is asking for — one count pip each. */
  targetCount: number
  validation: ValidationResult | null
  /**
   * The train on these rails is exactly what the go button will accept. The only
   * input in this component allowed to produce the correctness green: the signal
   * lamp, the ground wash and the counter plate all hang off this and nothing else.
   */
  isRight: boolean
  phase: GamePhase
  trackHeight?: number
  /** A bare tap on the rails: the child aimed at where things go. */
  onTapTrack?: () => void
  /**
   * The item that is on the train but still flying in from its card. Its slot
   * reserves the width so nothing jumps, but it stays invisible until the
   * flying copy lands on it — the child only ever sees one of each item.
   */
  pendingKey?: number | null
  /**
   * World mode — roadmap E1.
   *
   * The band stops being a band. In classic it paints its own flat grey ballast
   * across the full width, with a grey-blue rail gradient on it and a shadow
   * along both inside edges: a strip laid over the picture, and the strongest
   * shape on the screen. In world mode it paints nothing at all — the ground it
   * stands on belongs to `WorldScene` and runs from above the rails to off the
   * bottom of the screen — and all this component contributes is the permanent
   * way itself: warm wooden sleepers and two brown rails, sitting on that
   * ground. Nothing about the layout, the sizing, the slots, the counter or any
   * of the events changes; this only ever chooses colours and whether a fill is
   * painted.
   */
  world?: boolean
  /**
   * How many wagons stand waiting in the world, world mode only — a SIZING input.
   *
   * They are on THIS row now. E2 gave them a row of their own above the rails,
   * which is what made the frame read as two railways, so the width they need is
   * folded into the same `fit` the train uses and comes out of the same line. See
   * `offerUnits`.
   */
  choiceCount?: number
  /**
   * ...and the waiting wagons themselves, rendered as the last item in this row so
   * they stand on the very rail the train stands on.
   *
   * A node and not a component, because the sizes it needs are computed here (they
   * depend on the measured row width) and reported back out through `onSizes`. The
   * one thing that may never happen again is two independent size calculations with
   * a comment asserting they agree — that was round 3's failed gate, a waiting wagon
   * drawn at exactly half the wagon it became.
   */
  offer?: ReactNode
  /**
   * The three numbers the offer is drawn from: the coupled wagon size, the parked
   * wagon size, and how far a parked wagon's box must be padded at the bottom for
   * its wheels to land on the same rail head as a coupled wagon's.
   */
  onSizes?: (s: { coupled: number; offer: number; bottomPad: number }) => void
  /**
   * The engine's expression — roadmap B3, world mode only. Applies to the engine
   * standing on these rails, never to a palette card: a sad face on an unplaced
   * card would be reacting to something that card did not do. Undefined draws the
   * default happy face, exactly as before this prop existed.
   */
  mood?: 'happy' | 'sad'
}

export const TrackZone = forwardRef<HTMLDivElement, Props>(
  (
    {
      trainItems,
      onRemoveItem,
      isOver,
      isBlocked,
      wagonCargo,
      targetCount,
      validation,
      isRight,
      phase,
      trackHeight = 140,
      onTapTrack,
      pendingKey = null,
      world = false,
      choiceCount = 0,
      offer = null,
      onSizes,
      mood,
    },
    ref,
  ) => {
    const isWrong = phase === 'wrong'
    const isDeparting = phase === 'departing'
    /**
     * Has the train left the rails? True for the whole time it is gone, which is
     * the departure AND the celebration that follows it.
     *
     * `train-depart` runs 1.6s after a 0.2s delay and holds its last frame
     * (`forwards`), and that is exactly `DEPART_MS`. So the train reached
     * `translateX(-140%)` at the same moment the phase flipped to `celebrating` —
     * and because the class was keyed on `departing` alone, it was removed right
     * then, the animation stopped holding, and the whole train snapped back onto
     * the rails to sit there for the rest of the celebration. Reported from the
     * tablet: the train "comes back before it restarts".
     *
     * The rake stays in `trainItems` until `nextRound` clears it, so the class is
     * what has to outlive the phase, not the items.
     */
    const hasLeft = isDeparting || phase === 'celebrating'
    const patternId = useId()
    const rowRef = useRef<HTMLDivElement>(null)
    /**
     * The train's own group inside that row, and the reason it exists is the
     * departure.
     *
     * E3 puts the waiting stock in this same row (that is the whole point: one
     * line), and the row is what carries `train-depart`, `train-full` and the
     * rail-tap hop. Measured on the first departure after the move: the three parked
     * wagons slid off the left edge with the train, so a round ended with the child
     * watching the wagons he had NOT chosen leave as well. Every one-shot that means
     * "the train" now lives on this element instead, and the row keeps only the two
     * jobs that are genuinely the row's: being measured, and holding the offer at the
     * far end of it.
     */
    const trainRef = useRef<HTMLDivElement>(null)
    const counterRef = useRef<HTMLDivElement>(null)
    /** The flat green wash that fires once when the train reaches its length. */
    const washRef = useRef<HTMLDivElement>(null)
    /** Which key was still in the air on the previous commit. */
    const prevPendingRef = useRef<number | null>(pendingKey)

    /**
     * How wide the train row actually is, in px. The row is `inset-0` in the
     * ground, so this is the ground's width and it does not depend on what the row
     * holds — measuring it cannot feed back into it. It is what the round is sized
     * against, so the number of holes on the rails is always the number asked for,
     * in either orientation.
     */
    const [rowW, setRowW] = useState(0)
    useLayoutEffect(() => {
      const el = rowRef.current
      if (!el) return
      const measure = () => setRowW(el.clientWidth)
      measure()
      const ro = new ResizeObserver(measure)
      ro.observe(el)
      return () => ro.disconnect()
    }, [])

    /**
     * How many wagons are actually standing on the rails right now — the one in
     * the air is deliberately not counted. A pip that filled while its wagon was
     * still flying would be a counter that runs ahead of the train it counts, and
     * the whole point of it is that it agrees with what the child can see. So the
     * wagon appears and its pip fills in the same commit.
     */
    const filled = trainItems.filter(
      (item) => item.kind === 'wagon' && item._key !== pendingKey,
    ).length
    const prevFilledRef = useRef(filled)

    /**
     * The holes. Counted off every wagon the train *holds*, the one in the air
     * included, because that wagon's slot already exists in the row (invisible,
     * holding its width open for the flight to land in). Counting only the visible
     * ones would draw a hole and a hidden wagon side by side for one flight, and
     * the row would jump when the flight landed.
     */
    const wagonsHeld = trainItems.filter((item) => item.kind === 'wagon').length
    const missing = Math.max(0, targetCount - wagonsHeld)
    const needLoco = trainItems.every((item) => item.kind !== 'loco')

    /**
     * The arrival. The instant an item stops being pending its slot goes from
     * invisible to visible, and that used to be the whole of the good news: the
     * flying copy stopped and an identical icon simply existed. Now the real item
     * is squashed, flashed green and kicks up dust in that same commit, so the
     * destination reacts to being filled. Layout effect, and the same imperative
     * remove -> reflow -> add as everywhere else, so the first animated frame is
     * the first painted frame.
     */
    useLayoutEffect(() => {
      const prev = prevPendingRef.current
      prevPendingRef.current = pendingKey
      if (prev === null || prev === pendingKey) return
      const el = rowRef.current?.querySelector<HTMLElement>(`[data-item-key="${prev}"]`)
      if (!el) return
      el.classList.remove('item-land')
      void el.offsetWidth
      el.classList.add('item-land')
    }, [pendingKey])

    /**
     * A pip has just been filled. It swells once, in the same commit the wagon
     * becomes visible, so the child sees his wagon and the hole it closed as one
     * event rather than two things that happened to change. Same imperative
     * remove -> reflow -> add as everywhere else in this file, so the first
     * animated frame is the first painted frame.
     *
     * And if that was the last hole, the whole train squashes once on its wheels
     * too: the last hole closing is the thing the child has been working toward,
     * so it is an event and not merely the absence of an outline — nine of ten and
     * ten of ten differ by one small ring, which is nothing at tablet distance.
     *
     * Both are transform-only and carry no hue at all, and that is the point. They
     * say "that is the number of wagons you were asked for" — a fact the numeral,
     * both dot rows and the holes on the rails have already stated — and nothing
     * about whether those are the *right* wagons. The green half of what used to
     * live here moved out to the effect below, where it can be true.
     */
    useLayoutEffect(() => {
      const prev = prevFilledRef.current
      prevFilledRef.current = filled
      if (filled <= prev) return
      for (let i = prev; i < filled; i++) {
        const el = counterRef.current?.querySelector<HTMLElement>(`[data-pip="${i}"]`)
        if (!el) continue
        el.classList.remove('pip-land')
        void el.offsetWidth
        el.classList.add('pip-land')
      }
      if (targetCount > 0 && filled >= targetCount) {
        const train = trainRef.current
        if (train) {
          train.classList.remove('train-full')
          void train.offsetWidth
          train.classList.add('train-full')
        }
      }
    }, [filled, targetCount])

    /**
     * "It's right now." Roadmap C1, and the only green event on the track.
     *
     * The instant the train becomes exactly what the go button will accept, three
     * things happen without the child committing to anything: the signal lamp goes
     * green by itself (a state, above, that outlasts any animation), the ground
     * washes the same green once, and the counter row swells behind its green
     * plate. So he can read "it's right" off the screen while his finger is still
     * nowhere near the button, and the button then agrees with him.
     *
     * It fires on the false -> true edge only, so it is one event and not a state
     * that keeps re-announcing itself; and if he takes a wagon off again it will
     * fire once more when he puts the right one back. Opacity and transform only,
     * handed to the compositor in the commit the train changed.
     */
    const prevRightRef = useRef(isRight)
    useLayoutEffect(() => {
      const wasRight = prevRightRef.current
      prevRightRef.current = isRight
      if (!isRight || wasRight) return
      const wash = washRef.current
      if (wash) {
        wash.classList.remove('track-full-wash')
        void wash.offsetWidth
        wash.classList.add('track-full-wash')
      }
      const row = counterRef.current
      if (row) {
        row.classList.remove('count-row-done')
        void row.offsetWidth
        row.classList.add('count-row-done')
      }
    }, [isRight])

    // The faint train is the first thing a four-year-old aims at, so a tap on
    // the rails has to answer. Class swapped imperatively for a same-frame start.
    const handleTrackPress = (e: React.PointerEvent) => {
      const target = e.target as Element | null
      if (target && target.closest('button')) return
      /* A tap on one of the parked wagons is that wagon's own event: it is inside
         this band now, and hopping the whole row would jog the train the child did
         not touch. WorldChoice answers it in the same frame. */
      if (target && target.closest('[data-card]')) return
      const row = trainRef.current
      if (row && !isDeparting) {
        row.classList.remove('ghost-jump')
        void row.offsetWidth
        row.classList.add('ghost-jump')
      }
      onTapTrack?.()
    }

    const railOff = Math.round(trackHeight * 0.371)
    /**
     * The sleepers.
     *
     * Classic keeps its own numbers exactly: 28-wide ties on a 72 px pitch,
     * inset four px inside the rails.
     *
     * World mode's are the ties of a real ladder — see `WORLD.rail` in theme.ts
     * for the two failed attempts and what the reference actually draws. They are
     * DARK BROWN on a mid-grey ballast, 26 of every 48 px so there is a real stone
     * gap between each pair, and they are laid on a bed between two rails rather
     * than hanging under one. Both tones are darker than the field either side of
     * them, which is the whole of what round 2 got backwards: its tabs were
     * LIGHTER than both the rail and the ground, so the assembly read as a dashed
     * road marking. This one is 35 px of dark ladder on a green field — the
     * second-heaviest object in the picture, which is its rank in every reference
     * frame.
     */
    const slpW    = world ? 26 : 28
    const padL    = Math.round(trackHeight * 0.686)

    /**
     * The train is sized to the round, not to the screen.
     *
     * The holes are the device the child checks his own answer with, so every one
     * of them has to be in the frame. Sized at a fixed 119 px they were not: a
     * ten-wagon round needed 1482 px of row, and the row is 1024 px wide in
     * landscape and 768 in portrait, so the train said "six holes and a sliver"
     * while the numeral and the dots said ten. Three statements of the round's
     * number, one of them false, in the one place built for checking. A
     * four-year-old does not discover horizontal scroll, and what he must count
     * must never leave the screen.
     *
     * So the engine and all `targetCount` slots are made to fit the measured row:
     * full size while they fit, shrunk by one common factor when they do not, so
     * ten wagons are ten smaller wagons rather than six wagons and a promise. The
     * whole chain keeps one scale — engine, wagons and holes together — because a
     * train drawn at two sizes is not a train. `overflow-x` is now hidden in every
     * phase: there is nothing left to scroll to, and nothing can hide off-frame.
     */
    const ITEM_PAD = 8   // the p-1 either side of every item and every slot
    const ROW_PAD_R = world ? 4 : 16
    const slotsWanted = Math.max(1, targetCount)
    /**
     * What the signal is sized against, and it is deliberately not the band.
     *
     * The band is the ground the train stands on; the signal is one small piece of
     * lineside furniture standing beside it, and in every reference frame that
     * carries one it is about a wagon tall. Tying it to `trackHeight` meant a
     * taller band grew the signal with it and the room reserved for it ate the
     * rails the train needed.
     */
    /* ...and clamped, because E3 round 2 grew the band and a fraction of a bigger
       band is a bigger signal. 210 px of assembly is what measured right at
       trackHeight 338 and there is no reason for a taller frame to want a taller
       piece of lineside furniture. */
    const signalUnit = world ? Math.min(210, Math.round(trackHeight * 0.62)) : trackHeight
    /**
     * ...and in world mode the drawings are bigger inside that same band.
     *
     * Measured on round 2: our locomotive was 37 px of body and about 72 px
     * including chimney and steam in a 768 px frame — 9% — while the reference's
     * rolling stock is 25-30% of frame height and is the subject of the picture
     * (frames-clean/frame-095, frame-140; blind/sago-trains-02 makes one wagon
     * taller than half the frame). The train had become the most saturated thing
     * on our screen and was still one of the smallest.
     *
     * The band's height cannot grow — the column is full, and the row that would
     * pay for it is the palette, which has 7 px of slack at count 10 — but the
     * drawing inside the band can: a wagon at 0.68 of the band instead of 0.557
     * is 103 px of drawn height rather than 84, i.e. 13.4% of a 768 px frame
     * rather than 11%, and it still clears the rail assembly below it and the
     * count row above it at both orientations. Classic keeps 0.657/0.557 exactly.
     */
    /*
     * Round 4 raised both factors and took the band's height down to pay for it.
     * E3 lowers the wagon's factor again, and this time the band is not what
     * limits it: the WIDTH is.
     *
     * The three waiting wagons used to have a row of their own above the rails, so
     * the train had the whole width to itself and a count-2 round drew a 228 px
     * wagon. They now stand on the running line, at the far end of it, so one line
     * has to hold the engine, every wagon the round asks for, AND the three that
     * are waiting. `fit` below is what resolves that, and at a count of two on a
     * 1024 px frame it lands a wagon at about 175 px wide and 133 px of drawn
     * height — 17% of a 768 px frame, against the reference's own 18-20%
     * (frames-clean/frame-030 draws five wagons of ~180 px in a 980 px frame,
     * frame-040 four of ~175). So these factors are only ceilings now; they stop a
     * one-wagon round drawing a wagon taller than the band, and nothing else.
     *
     * The engine's factor is higher than the wagons' because its drawing is a
     * 140x76 box against their 100x76: at equal width it is nearly half as tall.
     * 1.4 makes the two drawn heights identical, and 1.55 is deliberately past it,
     * because in blind/sago-trains-01 and frames-clean/frame-030 the engine is
     * visibly the tallest thing on the rails. Classic keeps 0.657/0.557 exactly.
     */
    /*
     * E3 round 2 turns the world's wish into a HEIGHT, and that is the whole of the
     * failed gate.
     *
     * Round 1 wrote these as fractions of the band and then let one `fit` factor
     * divide the row's WIDTH between the engine, the round's wagons and the three
     * parked ones — so the band's height was a ceiling nothing ever reached and the
     * drawing size was, in the end, a function of the frame's width alone. In
     * landscape that lands where the reference lands. In portrait the surplus 256 px
     * of a 768x1024 frame went to empty sky and the train came out at 24,339 ink px
     * against a 32,447 px station and a 21,409 px button: measured, and the reason
     * this round exists.
     *
     * So a coupled wagon now WANTS `WAGON_BAND` of the band's height (see
     * data/world.ts) whatever the frame's shape, the engine is `LOCO_RATIO` of that
     * width, and `fit` below may only ever shrink the pair from there. The 100/76 is
     * the wagon drawing's own box: the wish is a drawn HEIGHT and this is the width
     * that produces it.
     */
    /* Classic's two ceilings, to the digit as they have always been. World mode's
       size does not come from here any more — see `worldWagon` below. */
    const locoMax  = Math.round(trackHeight * 0.657)
    const wagonMax = Math.round(trackHeight * 0.557)
    /* Only the drawings scale; the padding either side of each of them does not,
       so it comes off the top before the factor is worked out. Four px of slack
       covers the rounding of every individual size. */
    /**
     * Where the train starts.
     *
     * Classic hangs the row off a left pad wide enough for the signal and the
     * count pips. World mode centred, which was right while the train was the only
     * thing on the line; it is wrong now that the waiting stock is parked at the
     * far end of the same line, because the two would be centred as one block and
     * the train would drift right as the round got longer. So the train hangs off
     * the LEFT — after the signal's own room — and grows towards the stock it is
     * going to absorb, which is the only reading of the frame that makes the offer
     * "further along the line" rather than "a second train".
     *
     * The pad is the signal's room and nothing else. It has to be real room: the
     * signal is the one device that says the train is right, so it may never be
     * covered, and it stands BEHIND the rolling stock (no z-index) because that is
     * where a signal beside a line is.
     */
    /*
     * ...and in E3 round 2 the world reserves nothing at all here.
     *
     * The signal used to be given a third of its own width as room, so no piece of
     * rolling stock could stand on it. That room is 71 px of a 768 px line — 10% of
     * the railway spent on a gap — and it bought nothing, because the one part of the
     * signal that carries information is the LAMP, and the lamp is at the top of the
     * band while the stock stands at the bottom of it: at trackHeight 430 the lamp
     * assembly ends 145 px down and the tallest thing on the rails begins 253 px
     * down. So the post is behind the train, as a lineside post is, the lamp is above
     * its roofs where nothing can cover it, and the 71 px went to the wagons.
     */
    const padStart = world ? 8 : padL
    /**
     * One line, two claims on it — and this is the arithmetic the whole
     * composition rests on.
     *
     * `drawNeed` is what the train wants: the engine plus one wagon per unit the
     * round asked for. `offerNeed` is what the waiting stock wants: three wagons at
     * `OFFER_SCALE` of that same size. They are summed, not compared, because they
     * are standing on the same rails — E2 gave each of them the full width of its
     * own row and that is exactly what made the frame read as two railways.
     *
     * Drawing the offer at a fraction of the coupled size is what keeps the trade
     * from eating the train: ink is an area, so three wagons at `OFFER_SCALE` (0.8)
     * carry 3 x 0.8^2 = 1.92 units of drawn mass against a count-2 train's 3.5, and
     * the coupled rake also gains a rider on every wagon. See `OFFER_SCALE` in data/world.ts for the measurement that fraction
     * answers and for why the flight, not the size, is what keeps the wagon the
     * child touched the wagon that travels.
     */
    /**
     * CLASSIC's sizing, unchanged to the digit: one factor that makes the engine and
     * every bay of the round fit between the two edges of the strip. It is the right
     * arithmetic there — the classic band is a 200 px strip laid across a picture, its
     * bays are the device the child counts along, and ten of them must all be in it.
     */
    const drawNeed = locoMax + slotsWanted * wagonMax
    const classicPads = padStart + ROW_PAD_R + ITEM_PAD * (slotsWanted + 1) + 4
    const classicRoom = rowW > 0 ? Math.max(120, rowW - classicPads) : drawNeed
    const classicFit = Math.min(1, classicRoom / drawNeed)

    /**
     * WORLD's sizing — and this is E3 round 4, the failed gate, and the only real
     * change in this file.
     *
     * Every earlier round solved for "the engine, all `targetCount` wagons and the
     * three parked ones fit between the two frame edges", so the drawn size was a
     * function of the round's NUMBER. Measured: count 2 gave a 256x143 engine and a
     * train band holding 55% of the frame's ink; count 5 gave 165x93 and 37%; count 10
     * gave 98x57, 26%, and scenery carrying 2.9x the train's ink. The composition was
     * true only at the count it had been tuned on, and a long train read as a small
     * train.
     *
     * The reference solves the opposite way round. It draws its stock at one size and
     * lets the frame cut the line — blind/sago-trains-02 and -04 clip the last wagon
     * at the right edge, frames-clean/frame-041 clips a whole wagon and half of another
     * at the left, sago-trains-04 does not have its engine in the picture at all. So
     * the size is PINNED here:
     *
     *   - it is `WAGON_LINE` of the line's width, which mentions no count at all, so
     *     a one-wagon round and a three-wagon round draw the same wagon;
     *   - `WAGON_BAND` of the band survives only as a ceiling, so a short band can
     *     never draw a wagon taller than the ground it stands on;
     *   - the engine is `LOCO_RATIO` of the wagon, as before, because the two drawings
     *     are a 140x76 box and a 100x76 box and this is what makes the engine the
     *     tallest thing on the rails;
     *   - and anything the line cannot hold runs off the NEAR edge, where the row's
     *     `justify-end` and `overflow-hidden` put it. Nothing is scrollable and
     *     nothing is reachable off-frame; the newest wagon, the whole of the rake's
     *     growing end and all three parked wagons are always inside the picture,
     *     because the growing end is the end pinned to the frame.
     *
     * What stops the line growing without limit is `WORLD_MAX_COUNT`, in
     * data/world.ts: the engine is the frame's most saturated object and its only
     * large face, and past three coupled wagons there is none of it left in the
     * picture. The world round therefore asks for at most three.
     */
    const wagonWish = world ? Math.round((trackHeight * WAGON_BAND * 100) / 76) : 0
    const worldWagon = rowW > 0
      ? Math.max(OFFER_MIN, Math.min(wagonWish, Math.round(rowW * WAGON_LINE)))
      : wagonWish
    /**
     * The room the parked block is measured against — the line minus the padding that
     * does not scale. Count-independent on purpose (`SLOT_ALLOW` and not
     * `slotsWanted`): the one thing this round exists to delete is a size that moves
     * when the round's number does.
     */
    const SLOT_ALLOW = 3
    const worldPads =
      padStart +
      ROW_PAD_R +
      ITEM_PAD * (SLOT_ALLOW + 1) +
      choiceCount * OFFER_PAD * 2 +
      Math.max(0, choiceCount - 1) * OFFER_GAP +
      /* the gap between the rake and the stock parked in front of it */
      26 +
      4
    const lineRoom = rowW > 0 ? Math.max(120, rowW - worldPads) : worldWagon * 5
    /**
     * How big a PARKED wagon is drawn: `OFFER_SCALE` of the coupled size, never
     * larger than the coupled size (the further stock may not be the bigger stock),
     * never more than `OFFER_SHARE` of the line between the three of them, and never
     * below `OFFER_MIN`, because the load painted inside it is the whole question the
     * round asks and below that width it stops being a shape.
     */
    const parkedCap = Math.max(OFFER_MIN, Math.floor((lineRoom * OFFER_SHARE) / Math.max(1, choiceCount)))
    const parkedSize = (coupled: number) =>
      Math.min(coupled, parkedCap, Math.max(OFFER_MIN, Math.round(coupled * OFFER_SCALE)))
    const locoSz  = world
      ? Math.max(28, Math.round(worldWagon * LOCO_RATIO))
      : Math.max(28, Math.round(locoMax * classicFit))
    const wagonSz = world
      ? Math.max(24, worldWagon)
      : Math.max(24, Math.round(wagonMax * classicFit))
    const offerSz = parkedSize(wagonSz)

    /**
     * Where the one rail line goes, in world mode — under the wheels, and now at
     * the BOTTOM of the band rather than half way up it.
     *
     * Round 1 drew classic's ladder in brown: a 6 px rail at `railOff` from the
     * top, another at `railOff` from the bottom, ties filling the gap. Measured at
     * 1024x768 that put the upper rail across the locomotive at chimney height,
     * ties above and below the rolling stock, and the wheels resting on nothing —
     * a fence lying across the picture with a toy balanced on it.
     *
     * The reference never does that. One dark line, the wheels sitting ON it, the
     * sleepers hanging below it, nothing above it (blind/sago-trains-02 and -07,
     * frames-clean/frame-140). Rounds 2-4 placed the line by CENTRING the wagon
     * drawing in the band and putting the rail under its wheels, which worked but
     * tied the track's height to the wagon's: shrink the round's wagons and the
     * whole permanent way climbed up the frame with them. E3 anchors it to the
     * bottom of the band instead — the track is the ground, and ground does not
     * move when the stock on it changes size — and hangs the stock off it.
     *
     * The assembly's own thicknesses come off the BAND, so the permanent way is the
     * same permanent way whatever the round asks for: 38 px in landscape and 49 in
     * portrait, which is 4.9% and 4.8% of the frame against the reference's own
     * ~4.5%, and clamped either side so no viewport can draw a hairline or a wall.
     * Deriving them from the wagon instead was tried and rejected — it made the
     * track thin out as the round got longer, and the ground has no business
     * changing when the stock standing on it does.
     */
    const wagonDrawH = (wagonSz * 76) / 100
    const railH    = world
      ? Math.min(10, Math.max(5, Math.round(trackHeight * 0.033)))
      : Math.max(4, Math.round(trackHeight * 0.03))
    const tieBand  = world
      ? Math.min(26, Math.max(11, Math.round(trackHeight * 0.056)))
      : Math.max(12, Math.round(trackHeight * 0.085))
    const shoulder = world ? railH : Math.max(4, Math.round(trackHeight * 0.03))
    const bedH       = railH + tieBand + railH
    /** Ground left below the ballast shoulder, inside the band. */
    const RAIL_FOOT = 10
    const railTopWorld = Math.max(0, trackHeight - RAIL_FOOT - shoulder - bedH)
    const railLowTop = railTopWorld + railH + tieBand

    /**
     * How the engine ends up standing on the same rail as a wagon.
     *
     * The engine's drawing is a 140x76 box and a wagon's is 100x76, so at their
     * own widths the two are different HEIGHTS — and a row that centres each
     * drawing vertically therefore puts their wheels at two different heights.
     * Measured at 1024x768: the empty locomotive bay's bottom was at y=568 while
     * the rail top was at y=578, so the bay the engine goes in hovered 9 px above
     * the rails it is supposed to be a hole in, while the wagon bay beside it
     * touched. Two bays at two heights on the same track is the "floating toy"
     * read that round 1 was told to fix.
     *
     * Centring was the cause, so world mode stops centring: the row hangs its
     * contents off its BOTTOM edge (`items-end`), which is the physical model
     * anyway — things on a railway are level with each other because they are all
     * standing on the same rail, not because they are the same height. `railPad`
     * is then the single number that positions the whole train, worked out from
     * the wagon, which is what the child counts and what the line is levelled to.
     * Every drawing's wheels are at 71/76 of its own height, so bottom-alignment
     * leaves a residual of `drawH * 5/76`, and the largest disagreement left
     * between an engine and a wagon is 1.2 px at trackHeight 200 — against the
     * 9 px measured. Classic keeps `items-center` and no padding, exactly as it
     * was: its band has two rails and no single line to be level with.
     */
    const railPad = world
      ? Math.max(
          0,
          Math.round(trackHeight - (railTopWorld + 3) - ITEM_PAD / 2 - (wagonDrawH * 5) / 76),
        )
      : 0

    /**
     * Where a PARKED wagon's box has to end so its wheels land on the same rail
     * head a coupled wagon's wheels land on.
     *
     * The row is bottom-aligned, so every child's box bottom is level; but the
     * residue of a wagon drawing below its own wheels is 5/76 of its drawn height,
     * which is a different number of px for a 108 px wagon than for a 175 px one.
     * Bottom-aligning the two without this put the small ones three px through the
     * rail. Arithmetic, computed here because this is where the rail is.
     */
    const offerDrawH = (offerSz * 76) / 100
    const offerBottomPad = Math.max(
      0,
      Math.round(ITEM_PAD / 2 + ((wagonDrawH - offerDrawH) * 5) / 76),
    )
    /* Out to the offer, once, whenever any of the three actually changes. */
    const lastSent = useRef('')
    useEffect(() => {
      const key = `${wagonSz}|${offerSz}|${offerBottomPad}`
      if (onSizes === undefined || lastSent.current === key) return
      lastSent.current = key
      onSizes({ coupled: wagonSz, offer: offerSz, bottomPad: offerBottomPad })
    }, [onSizes, wagonSz, offerSz, offerBottomPad])

    /**
     * How far a bay drops into the track. Zero everywhere now, and it stays as a
     * name rather than a literal because the classic bays still read it.
     *
     * World mode has no bays at all since round 4 — see the wagon bays in the train
     * row for the measured gate failure that removed them — and classic presses its
     * bays into flat ballast, where there is nothing to cut.
     */
    const bayDrop = 0

    /** The top of the rolling stock, which the counter must stay clear of. */
    const itemBoxH = Math.round((wagonSz * 76) / 100) + ITEM_PAD
    const itemTop  = Math.max(
      0,
      world
        ? trackHeight - railPad - itemBoxH
        : Math.round((trackHeight - itemBoxH) / 2),
    )
    /**
     * The counter's size and where it stands.
     *
     * It is a scaled copy of the hero's dot row — same component, same wrap at
     * five, same pitch — and at trackHeight 200 the pip is now 22 px, which is
     * exactly the hero's tablet dot. Literally the same drawing at the same size,
     * so "is my row like his row?" is one comparison and not two.
     *
     * And it no longer sits on the top edge of the ground. At `top: 0` its 20 px
     * strip touched the palette's bottom edge and stood 54 px clear of the wagons,
     * which made it read as a strip belonging to the palette — pagination, not a
     * train. Now it is centred in the bare band above the first rail (no sleepers,
     * no rolling stock there), which puts a clear gap between it and the palette
     * and stands it directly over the wagons it counts.
     *
     * The band is the bare strip above the first rail, and a two-row block used to
     * hang 9 px into the roofs of the wagons below it. So the pip is shrunk until
     * the whole block clears them: still the hero's row, same wrap at five and the
     * same pitch as a fraction of the dot, only smaller — a scaled copy, which is
     * the one thing it must stay.
     */
    const COUNTER_TOP_GAP = 12   // clear of the palette above
    const COUNTER_BOT_GAP = 6    // clear of the roofs below
    const pipBand   = Math.max(14, itemTop - COUNTER_TOP_GAP - COUNTER_BOT_GAP)
    let pipSize     = Math.round(trackHeight * 0.11)
    while (pipSize > 8 && countRowHeight(targetCount, pipSize) > pipBand) pipSize -= 1
    const counterH  = countRowHeight(targetCount, pipSize)
    const counterTop = Math.min(
      Math.max(COUNTER_TOP_GAP, Math.round((itemTop - counterH) / 2)),
      Math.max(4, itemTop - COUNTER_BOT_GAP - counterH),
    )

    function itemError(item: KeyedTrainItem): boolean {
      if (!isWrong || !validation) return false
      if (item.kind === 'loco') return !validation.locomotiveOk
      return !validation.wagonTypeOk
    }

    const hasNoWagons = trainItems.filter((item) => item.kind === 'wagon').length === 0
    const showCountError =
      isWrong &&
      validation !== null &&
      !validation.wagonCountOk &&
      (validation.wagonTypeOk || hasNoWagons)

    /**
     * Which animal rides which wagon: the wagon's position in the rake, so a given
     * wagon keeps its own passenger for as long as it is coupled and the three
     * silhouettes alternate along the train instead of repeating.
     */
    const riderIndex = new Map<number, number>()
    let riderN = 0
    for (const item of trainItems) {
      if (item.kind === 'wagon') riderIndex.set(item._key, riderN++)
    }

    const activeOver = isOver && !isBlocked
    const blockedOver = isOver && isBlocked

    return (
      <div
        ref={ref}
        data-touchable
        onPointerDown={handleTrackPress}
        className="relative w-full transition-colors duration-200"
        style={{
          height: trackHeight,
          /* World: no fill of its own, ever. The ground under the rails is the
             scene's field, and the band is transparent so the train stands on it
             rather than in a strip laid across it. The one thing still painted
             here is the drop feedback, and in world mode that is a flat white
             veil rather than a two-stop gradient. */
          background: world
            ? activeOver
              ? 'rgba(255,255,255,0.26)'
              : 'transparent'
            : activeOver
              ? `linear-gradient(180deg, ${t.accent2}33, ${t.accent}55)`
              : t.ground,
          boxShadow: activeOver
            ? `inset 0 0 0 4px ${t.accent}`
            : blockedOver
              ? `inset 0 0 0 4px ${t.bad}`
              : world
                ? 'none'
                : 'inset 0 1px 0 rgba(0,0,0,0.08), inset 0 -1px 0 rgba(0,0,0,0.08)',
          /* The three tones an empty bay is drawn in, chosen once, here. See
             `slotVar` — the bay SVGs are shared and read these. */
          ...(world
            ? ({
                '--slot-floor': w.slotFloor,
                '--slot-shade': w.slotShade,
                '--slot-lip': w.slotLip,
              } as React.CSSProperties)
            : null),
        }}
      >
        {/* The permanent way.
            Classic keeps exactly what it had: two grey-blue gradient rails with
            its two ties filling the gap between them, across its own grey
            ballast band.
            World builds the assembly the reference builds, back to front — the
            ballast bed and its shoulder, the ties on the bed, then both rails on
            top of the ties. Nothing in it is lighter than the field it is laid
            on, and it is 35 px tall at trackHeight 200. */}
        {world && (
          <>
            <div
              className="absolute inset-x-0"
              style={{ top: railTopWorld, height: bedH, background: w.ballast }}
            />
            <div
              className="absolute inset-x-0"
              style={{ top: railTopWorld + bedH, height: shoulder, background: w.ballastDark }}
            />
          </>
        )}

        {/* sleepers – pattern tiles at fixed pitch regardless of container width. */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            {world ? (
              <pattern id={patternId} x="0" y="0" width="48" height={trackHeight} patternUnits="userSpaceOnUse">
                <rect x="4" y={railTopWorld + railH} width={slpW} height={tieBand} fill={w.tie} />
                <rect
                  x="4"
                  y={railTopWorld + railH + tieBand - 3}
                  width={slpW}
                  height={3}
                  fill={w.tieDark}
                />
              </pattern>
            ) : (
              <pattern id={patternId} x="0" y="0" width="72" height={trackHeight} patternUnits="userSpaceOnUse">
                <rect x="4" y={railOff + 4} width={slpW} height={trackHeight - railOff * 2 - 8} rx="3" fill={t.tie} />
                <rect x="40" y={railOff + 4} width={slpW} height={trackHeight - railOff * 2 - 8} rx="3" fill={t.tieDark} />
              </pattern>
            )}
          </defs>
          <rect
            width="100%"
            height="100%"
            fill={`url(#${patternId})`}
            opacity={activeOver ? 0.4 : world ? 1 : 0.9}
          />
        </svg>

        {/* The rails themselves: near-black, and in world mode there are two of
            them, close together, with the ties between. The wheels sit on the
            upper one — see `railTopWorld` — and the lower one closes the bed, which
            is what makes the whole thing read as track rather than as one line
            with things hanging off it. */}
        {world ? (
          <>
            <div
              className="absolute inset-x-0"
              style={{ top: railTopWorld, height: railH, background: w.rail }}
            />
            <div
              className="absolute inset-x-0"
              style={{ top: railLowTop, height: railH, background: w.rail }}
            />
          </>
        ) : (
          <>
            <div
              className="absolute inset-x-0"
              style={{
                top: railOff, height: 6,
                background: `linear-gradient(180deg, ${t.railHi}, ${t.rail})`,
                boxShadow: '0 1px 0 rgba(0,0,0,0.2)',
              }}
            />
            <div
              className="absolute inset-x-0"
              style={{
                bottom: railOff, height: 6,
                background: `linear-gradient(180deg, ${t.railHi}, ${t.rail})`,
                boxShadow: '0 1px 0 rgba(0,0,0,0.2)',
              }}
            />
          </>
        )}

        {/* "The train is right." Fires once, on the frame the train first becomes
            exactly what the go button will accept, and is invisible at every other
            moment. Opacity only. Never on a full train of the wrong wagons: that
            was the loudest lie in the game, a full-width green wash beside a red
            signal and a button that was about to say no. */}
        <div
          ref={washRef}
          data-full-wash
          className="absolute inset-0 pointer-events-none"
          style={{ background: t.good, opacity: 0 }}
          onAnimationEnd={(e) => {
            if (e.animationName === 'track-full-wash') {
              e.currentTarget.classList.remove('track-full-wash')
            }
          }}
        />

        {/* Green as soon as the train is genuinely right, without being asked, and
            it stays green through the departure. Red for everything else — an
            unfinished train and a finished wrong one alike. */}
        <Signal
          isGo={isRight || isDeparting}
          trackHeight={trackHeight}
          unit={signalUnit}
          world={world}
        />

        {/* How many are asked for, and how many are here — and NOT in world mode.
            Measured objection: the round's count was stated three times over on
            one screen, as the numeral on the sign, as the dots under it, and as
            this row of rings on the ground. The first two are one drawing read top
            to bottom and they won their own round; this third one is the only one
            of the three whose "filled versus outlined" reading is a pure
            convention, and the reference has no counterpart to it anywhere. The
            green plate behind it goes with it, which costs nothing: the signal
            lamp beside the rails is this mode's one green, and it is the reference's
            own device. */}
        {!world && (
        <CountPips
          pipsRef={counterRef}
          target={targetCount}
          filled={filled}
          pip={pipSize}
          height={counterH}
          left={padL}
          top={counterTop}
          /* The train is leaving with the answer inside it; counting is over. */
          dimmed={isDeparting}
          isRight={isRight}
        />
        )}

        {/* train row */}
        <div
          ref={rowRef}
          /* Gated by name: a landing item's animation bubbles through here too,
             and it must not cut short a rail-tap hop that is still running. */
          onAnimationEnd={(e) => {
            if (e.animationName === 'ghost-jump') trainRef.current?.classList.remove('ghost-jump')
            if (e.animationName === 'train-full') trainRef.current?.classList.remove('train-full')
          }}
          /* World: the train hangs off the LEFT of the line and the stock waiting
             for it is pushed to the far end by `ml-auto`, so what the frame holds
             is one railway with one line of things standing on it — train at the
             near end, parked wagons at the far end, one rail under all of them.
             E2 centred the train, which was right while it was alone on the line
             and wrong the moment the choice came down onto it. */
          /* `justify-end` in world mode, and it is what puts the bleed on the right
             end of the line rather than the wrong one. The parked stock is pinned to
             the far end of the rails, the train stands against it, and anything the
             line cannot hold runs off the NEAR (left) edge — where the engine is, and
             where the reference always cuts (frames-clean/frame-030 and -031,
             blind/sago-trains-02 and -04). Round 1 justified this row to the start,
             so a line that overflowed pushed the three things the child has to choose
             between off the far edge instead. `overflow-hidden` is unchanged: nothing
             can be scrolled to and there is nothing to scroll. */
          className={`absolute inset-0 flex ${
            world ? 'items-end justify-end' : 'items-center'
          } gap-0 overflow-hidden ${
            hasLeft && !world ? 'train-depart' : ''
          }`}
          /* `paddingBottom` is what stands the whole train on the rail in world
             mode — see `railPad`. Zero in classic, which centres instead. */
          style={{ paddingLeft: padStart, paddingRight: ROW_PAD_R, paddingBottom: railPad }}
        >
          {/* The train itself: engine, wagons, and in classic the bays. World mode
              wraps it so the departure, the full-train squash and the rail-tap hop
              belong to the TRAIN and not to the whole line — see `trainRef`. */}
          <div
            ref={trainRef}
            className={`flex ${world ? 'items-end' : 'items-center'} gap-0 ${
              hasLeft && world ? 'train-depart' : ''
            }`}
          >
          {/* The bay the engine goes in, while there is no engine — and while it is
              there it is the first empty slot in the row, so it is the one that
              breathes. The palette's engine cards breathe with it (see `locoSpot`
              in DragPalette): "an engine, and it goes here".

              Classic only, and that is the failed `noTray` gate from round 3
              rather than a tidy-up — see the wagon bays at the bottom of this row
              for the measurement and the reasoning. World mode's engine is on the
              rails from the first frame anyway (App's own layout effect), so this
              bay was never anything but a flash of furniture. */}
          {needLoco && !world && (
            <div
              data-slot-kind="loco"
              data-slot-next
              className="train-slot shrink-0 rounded-2xl p-1 flex items-center justify-center select-none pointer-events-none"
              /* Into the track — see `bayDrop`. Offset with `top` and not with a
                 transform, because this element already carries the `slot-wait`
                 breathe and an animation on transform would simply overwrite an
                 inline one. */
              style={bayDrop ? { position: 'relative', top: bayDrop } : undefined}
            >
              <SlotLoco size={locoSz} />
            </div>
          )}
          {trainItems.map((item) => {
                const Icon =
                  item.kind === 'loco' ? LOCO_ICON[item.id] : wagonIcon(item.type, wagonCargo(item.type))
                const hasError = itemError(item)
                // Still in the air: the slot is held open, the item itself waits.
                const isPending = item._key === pendingKey
                return (
                  <button
                    key={item._key}
                    data-item-key={item._key}
                    /* So a wagon that is about to be replaced can be photographed
                       before it goes: App reads the type off the element to redraw
                       the copy that rolls away with the very picture it had here. */
                    data-item-kind={item.kind}
                    {...(item.kind === 'wagon' ? { 'data-item-type': item.type } : null)}
                    {...(isPending ? { 'data-pending': '' } : null)}
                    onClick={() => onRemoveItem(item._key)}
                    onAnimationEnd={(e) => {
                      if (e.animationName === 'item-land') {
                        e.currentTarget.classList.remove('item-land')
                      }
                      /* The "here is the load, and here is where it comes off"
                         nod. Classic only since round 3: in world mode a wrong
                         pick can no longer reach the rails, so the load standing
                         there is never the thing that needs taking off. One shot,
                         so it takes itself off again. */
                      if (e.animationName === 'item-nudge') {
                        e.currentTarget.classList.remove('item-nudge')
                      }
                    }}
                    /* `transition` (not `transition-all`): visibility must flip
                       in the landing frame, never fade in a quarter-second late. */
                    /* World mode carries no plate here, and that is the failed
                       gate from the last round rather than a tidy-up. `rounded-2xl`
                       plus the refusal's `background` painted a khaki rounded-
                       rectangle card around the wagon on the grass — measured
                       rgb(179,173,132) on grass rgb(142,201,126), 164x93 with a
                       16 px radius, overlapping the bush behind it — so the one
                       convention this mode exists to delete was how the game said
                       "wrong", and it said it with a tray. The refusal is motion
                       now, like every other refusal in the world: the wagon rocks.
                       Classic keeps its plate, to the pixel. */
                    className={`relative shrink-0 p-1 transition duration-150 touch-none select-none active:scale-90 cursor-pointer flex items-center justify-center ${
                      world ? '' : 'rounded-2xl '
                    }${
                      hasError ? (world ? 'item-rock' : 'animate-bounce') : world ? '' : 'hover:bg-white/15'
                    }`}
                    style={{
                      /* Above the rake that rolls away when the child changes his
                         mind. Those ghosts leave leftward, along the rails and
                         straight past the engine, which is not going anywhere — and
                         at z-50 they were painted ON it: measured at count 10, a
                         departing hopper covered 98.7% of the locomotive. One px of
                         stacking and the rake passes behind the train instead, so the
                         engine the child is keeping stays whole while the load he
                         dropped slides out from under it. Only the shed ghosts sit
                         below this; an arriving wagon still flies over the top. */
                      zIndex: 1,
                      ...(hasError && !world ? { background: `${t.bad}72` } : null),
                      ...(isPending ? { visibility: 'hidden' as const } : null),
                    }}
                  >
                    <Icon
                      size={item.kind === 'loco' ? locoSz : wagonSz}
                      {...(item.kind === 'loco' ? { mood } : null)}
                    />
                    {/* Somebody is riding on it — see `Rider`. Only on the wagons:
                        the engine already has a face of its own, and only once the
                        wagon has actually landed, so the flying copy and the wagon
                        under it stay the same drawing. */}
                    {world && item.kind === 'wagon' && !isPending && (
                      <WagonRider
                        index={riderIndex.get(item._key) ?? 0}
                        wagonSz={wagonSz}
                        pad={ITEM_PAD / 2}
                      />
                    )}
                  </button>
                )
              })}
          {/* One bay per wagon still missing, right where the next wagon will
              stand. The first of them breathes — "this one next" — unless the
              engine is still missing, in which case the engine's bay is the first
              empty slot in the row and only that one breathes. Exactly one
              breathing hole at a time, ever.

              Classic only, and this is round 3's failed `noTray` gate. Measured in
              world mode at 1024x768: a 272x206 rounded plate at (723,414) painting
              "a grey-brown rounded lozenge with a lighter rounded rim inset into
              the ballast", breathing, and two of them on a count-2 round. That is
              the drop-target convention of the classic screen surviving into the
              mode built to delete it — an empty plate that says "a wagon belongs
              here" — and it stated the round's number a fourth time on top of the
              numeral, the pips and the Czech speech. There is no placeholder
              anywhere in the reference: the rails are simply empty until something
              is standing on them, and what says "one more" is the signal beside
              the line staying red and the wagons still waiting on the dock.

              Nothing else needed changing for it. The size of the train is still
              computed off `slotsWanted` (see `drawNeed`), so a count-2 round draws
              its wagons at count-2 size from the first frame and nothing resizes
              as they arrive; and the arriving wagon's flight still measures its
              destination off `[data-pending]`, which is the wagon's own reserved
              button and not a bay. */}
          {!world && Array.from({ length: missing }).map((_, i) => (
            <div
              key={`slot-${i}`}
              data-slot-kind="wagon"
              {...(i === 0 && !needLoco ? { 'data-slot-next': '' } : null)}
              className="train-slot shrink-0 rounded-2xl p-1 flex items-center justify-center select-none pointer-events-none"
              /* Into the track — see `bayDrop`. `top` and not a transform, because
                 the leading bay carries the `slot-wait` breathe. */
              style={bayDrop ? { position: 'relative', top: bayDrop } : undefined}
            >
              <SlotWagon size={wagonSz} />
            </div>
          ))}
          </div>

          {/* The stock waiting at the far end of the same line — E3, and the whole
              of this round. `ml-auto` is what makes it the far end: the train grows
              rightward out of the left of the frame and this stands where it is
              going, so the picture is one railway rather than a shop above one.
              Inside the row, so it is bottom-aligned on the same rail; see
              `offerBottomPad`. */}
          {world && offer !== null && (
            /* A real gap between the rake and the stock parked in front of it: they
               are two separate things standing on one line, and at `gap-0` the
               nearest parked wagon read as coupled to the train. A fraction of the
               wagon, so it scales with everything else. */
            <div
              className="shrink-0 flex items-end self-end"
              style={{
                marginLeft: Math.round(wagonSz * 0.1),
                /* ...and off the far edge of the picture. The block is pinned to the
                   end of the line and the line does not end where the frame does:
                   this hangs the outer end of the last parked wagon outside it by
                   `OFFER_TAIL_BLEED` of its width (plus the row's own right pad, which
                   would otherwise hold it inside), so the rails read as going on.
                   `overflow-hidden` on the row is what cuts it, and nothing can be
                   scrolled to — the negative margin makes the content narrower, not
                   wider. */
                marginRight: -(Math.round(offerSz * OFFER_TAIL_BLEED) + ROW_PAD_R),
              }}
            >
              {offer}
            </div>
          )}
        </div>

        {/* "Not that many." Taken out of the train row and stood at its far end:
            in the row it added its own width, and at ten wagons the row has none
            spare, so the mark that says the count is wrong would have been the
            thing that got clipped. */}
        {showCountError && (
          <div
            className="absolute flex items-center justify-center animate-bounce select-none pointer-events-none rounded-full"
            style={{
              right: 8, top: Math.max(4, itemTop - 22),
              width: 44, height: 44, background: t.bad, color: '#fff', fontSize: 28, fontWeight: 900,
            }}
          >
            ✕
          </div>
        )}

        {/* drop hints */}
        {activeOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="rounded-full px-4 py-2"
              style={{ background: t.accent, color: '#fff', fontWeight: 800 }}
            >
              ⬇
            </div>
          </div>
        )}
        {blockedOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="rounded-full w-12 h-12 flex items-center justify-center"
              style={{ background: '#fff', color: t.bad, fontSize: 28, fontWeight: 900 }}
            >
              ✕
            </div>
          </div>
        )}
      </div>
    )
  },
)

TrackZone.displayName = 'TrackZone'
