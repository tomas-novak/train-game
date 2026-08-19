import {
  forwardRef,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FC,
  type RefObject,
} from 'react'
import type { KeyedTrainItem, TrainIcon, ValidationResult, WagonType } from '../types'
import { LOCOMOTIVES } from '../data/locomotives'
import { wagonIcon } from '../data/wagons'
import type { GamePhase } from '../hooks/useGameState'
import { CountRow } from './CountRow'
import { countRowHeight } from '../utils/countRows'
import { SKY } from '../theme'

const t = SKY

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
const Signal: FC<{ isGo: boolean; trackHeight: number }> = ({ isGo, trackHeight }) => {
  const lampH  = Math.round(trackHeight * 0.543)
  const lampW  = Math.round(trackHeight * 0.229)
  const lightD = Math.round(trackHeight * 0.129)
  const left   = Math.round(trackHeight * 0.286)

  return (
    <div className="absolute pointer-events-none flex flex-col" style={{ left, top: -2, height: trackHeight + 2 }}>
      <div
        data-signal={isGo ? 'go' : 'stop'}
        className={`rounded-xl flex flex-col items-center justify-center${isGo ? ' lamp-go' : ''}`}
        style={{
          background: 'linear-gradient(180deg, #3a3a3a, #1a1a1a)',
          width: lampW, height: lampH, padding: 5, gap: 4, marginTop: 6,
          boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 -2px 0 rgba(0,0,0,0.6)',
        }}
      >
        <div
          data-lamp="red"
          data-lit={isGo ? 'false' : 'true'}
          className={isGo ? undefined : 'animate-pulse'}
          style={{
            width: lightD, height: lightD, borderRadius: '50%',
            background: isGo
              ? 'radial-gradient(circle at 35% 30%, #555, #2a2a2a)'
              : `radial-gradient(circle at 35% 30%, #ff8a8a, ${t.bad})`,
            boxShadow: isGo ? 'none' : `0 0 12px 4px ${t.bad}aa`,
          }}
        />
        <div
          data-lamp="green"
          data-lit={isGo ? 'true' : 'false'}
          style={{
            width: lightD, height: lightD, borderRadius: '50%',
            background: isGo
              ? `radial-gradient(circle at 35% 30%, #b8e5b8, ${t.good})`
              : 'radial-gradient(circle at 35% 30%, #555, #2a2a2a)',
            boxShadow: isGo ? `0 0 12px 4px ${t.good}aa` : 'none',
          }}
        />
      </div>
      <div style={{ flex: 1, width: 4, background: '#666', borderRadius: 2, margin: '0 auto' }} />
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
    <rect x="6" y="39" width="88" height="31" rx="13" fill={SLOT_LIP} />
    <rect x="8" y="36" width="84" height="30" rx="12" fill={SLOT_FLOOR} />
    <rect x="12" y="36" width="76" height="11" rx="5" fill={SLOT_SHADE} />
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
    <rect x="6" y="39" width="128" height="31" rx="13" fill={SLOT_LIP} />
    <rect x="8" y="36" width="124" height="30" rx="12" fill={SLOT_FLOOR} />
    <rect x="12" y="36" width="116" height="11" rx="5" fill={SLOT_SHADE} />
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
    },
    ref,
  ) => {
    const isWrong = phase === 'wrong'
    const isDeparting = phase === 'departing'
    const patternId = useId()
    const rowRef = useRef<HTMLDivElement>(null)
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
        const train = rowRef.current
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
      const row = rowRef.current
      if (row && !isDeparting) {
        row.classList.remove('ghost-jump')
        void row.offsetWidth
        row.classList.add('ghost-jump')
      }
      onTapTrack?.()
    }

    const railOff = Math.round(trackHeight * 0.371)
    const slpY    = railOff + 4
    const slpH    = trackHeight - railOff * 2 - 8
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
    const ROW_PAD_R = 16
    const slotsWanted = Math.max(1, targetCount)
    const locoMax  = Math.round(trackHeight * 0.657)
    const wagonMax = Math.round(trackHeight * 0.557)
    /* Only the drawings scale; the padding either side of each of them does not,
       so it comes off the top before the factor is worked out. Four px of slack
       covers the rounding of every individual size. */
    const drawNeed = locoMax + slotsWanted * wagonMax
    const drawRoom = rowW > 0
      ? Math.max(120, rowW - padL - ROW_PAD_R - ITEM_PAD * (slotsWanted + 1) - 4)
      : drawNeed
    const fit      = Math.min(1, drawRoom / drawNeed)
    const locoSz   = Math.max(28, Math.round(locoMax * fit))
    const wagonSz  = Math.max(24, Math.round(wagonMax * fit))

    /** The top of the rolling stock, which the counter must stay clear of. */
    const itemBoxH = Math.round((wagonSz * 76) / 100) + ITEM_PAD
    const itemTop  = Math.max(0, Math.round((trackHeight - itemBoxH) / 2))
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
          background: activeOver
            ? `linear-gradient(180deg, ${t.accent2}33, ${t.accent}55)`
            : t.ground,
          boxShadow: activeOver
            ? `inset 0 0 0 4px ${t.accent}`
            : blockedOver
              ? `inset 0 0 0 4px ${t.bad}`
              : 'inset 0 1px 0 rgba(0,0,0,0.08), inset 0 -1px 0 rgba(0,0,0,0.08)',
        }}
      >
        {/* sleepers – pattern tiles at fixed pitch regardless of container width */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <pattern id={patternId} x="0" y="0" width="72" height={trackHeight} patternUnits="userSpaceOnUse">
              <rect x="4" y={slpY} width="28" height={slpH} rx="3" fill={t.tie} />
              <rect x="40" y={slpY} width="28" height={slpH} rx="3" fill={t.tieDark} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} opacity={activeOver ? 0.4 : 0.9} />
        </svg>

        {/* rails */}
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
        <Signal isGo={isRight || isDeparting} trackHeight={trackHeight} />

        {/* How many are asked for, and how many are here. */}
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

        {/* train row */}
        <div
          ref={rowRef}
          /* Gated by name: a landing item's animation bubbles through here too,
             and it must not cut short a rail-tap hop that is still running. */
          onAnimationEnd={(e) => {
            if (e.animationName === 'ghost-jump') rowRef.current?.classList.remove('ghost-jump')
            if (e.animationName === 'train-full') rowRef.current?.classList.remove('train-full')
          }}
          className={`absolute inset-0 flex items-center gap-0 overflow-hidden ${
            isDeparting ? 'train-depart' : ''
          }`}
          style={{ paddingLeft: padL, paddingRight: ROW_PAD_R }}
        >
          {/* The bay the engine goes in, while there is no engine — and while it is
              there it is the first empty slot in the row, so it is the one that
              breathes. The palette's engine cards breathe with it (see `locoSpot`
              in DragPalette): "an engine, and it goes here". */}
          {needLoco && (
            <div
              data-slot-kind="loco"
              data-slot-next
              className="train-slot shrink-0 rounded-2xl p-1 flex items-center justify-center select-none pointer-events-none"
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
                    }}
                    /* `transition` (not `transition-all`): visibility must flip
                       in the landing frame, never fade in a quarter-second late. */
                    className={`relative shrink-0 rounded-2xl p-1 transition duration-150 touch-none select-none active:scale-90 cursor-pointer flex items-center justify-center ${
                      hasError ? 'animate-bounce' : 'hover:bg-white/15'
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
                      ...(hasError ? { background: `${t.bad}72` } : null),
                      ...(isPending ? { visibility: 'hidden' as const } : null),
                    }}
                  >
                    <Icon size={item.kind === 'loco' ? locoSz : wagonSz} />
                  </button>
                )
              })}
          {/* One bay per wagon still missing, right where the next wagon will
              stand. The first of them breathes — "this one next" — unless the
              engine is still missing, in which case the engine's bay is the first
              empty slot in the row and only that one breathes. Exactly one
              breathing hole at a time, ever. */}
          {Array.from({ length: missing }).map((_, i) => (
            <div
              key={`slot-${i}`}
              data-slot-kind="wagon"
              {...(i === 0 && !needLoco ? { 'data-slot-next': '' } : null)}
              className="train-slot shrink-0 rounded-2xl p-1 flex items-center justify-center select-none pointer-events-none"
            >
              <SlotWagon size={wagonSz} />
            </div>
          ))}
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
