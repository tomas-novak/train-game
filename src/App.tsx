import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react'
import { useGameState } from './hooks/useGameState'
import { useTablet } from './hooks/useTablet'
import { useSpeech } from './hooks/useSpeech'
import { useGameAudio } from './hooks/useGameAudio'
import { CORRECT_PER_LEVEL } from './data/levels'
import { TaskHero } from './components/TaskHero'
import { HelpModal } from './components/HelpModal'
import { DragPalette } from './components/DragPalette'
import { TrackZone } from './components/TrackZone'
import { Celebration } from './components/Celebration'
import { MuteButton } from './components/MuteButton'
import { Scene } from './components/Scene'
import { SKY } from './theme'
import { showTapRipple } from './utils/tapRipple'
import { playBrake, playOops, playTick, playUnmute, playWhistle } from './utils/sfx'
import { placedLoco, placedWagons } from './utils/train'
import { wagonIcon } from './data/wagons'
import { cargoShownOnWagon } from './data/cargo'
import type { TrainItem, TrainIcon, WagonType } from './types'
import type { PalettePressPayload } from './components/DragPalette'
import type { FC } from 'react'

const t = SKY
const RESET_FLASH_MS = 400
/** Wiping progress needs a deliberate hold, not a stray tap on the stars. */
const RESET_HOLD_MS = 900

/** Movement above this (px, from the pointerdown point) starts a drag. */
const TAP_MOVE_PX = 14
/**
 * A press shorter than this is a tap no matter how far the finger slid. A
 * four-year-old's finger rolls several centimetres in the moment it lands, so
 * distance alone would silently throw those presses away.
 */
const TAP_MAX_MS = 220
/** Slack around the originating card when deciding "the finger let go on the card". */
const CARD_RELEASE_PAD = 24
/** A finger held still this long lifts the item so the child can see it is grabbed. */
const HOLD_LIFT_MS = 500
/** How long a tapped item takes to travel from the card to the track. */
const FLY_MS = 340
/** How long a drag dropped off-track takes to snap back to its card. */
const SNAP_MS = 260
/**
 * How long the old load takes to leave the rails.
 *
 * Round 2 cut this from 460 ms and removed the per-wagon delay that went with it.
 * The stagger was `delay: i * 45`, up to 405 ms for a rake of ten, and a WAAPI
 * animation does not hold its element off the screen while it waits: every
 * not-yet-started ghost stood motionless at its old position while the new layout
 * — the landed wagon and the empty recesses that replaced the rest — was already
 * painted underneath it. Measured at +85 ms on a ten-wagon replacement that was
 * five purple hoppers double-exposed over five bays, two sets of wheels each, and
 * the heap only cleared at 865 ms.
 *
 * So the old load leaves as one coupled rake, every wagon starting on the same
 * frame — the frame the removal itself is painted in, because the animation is
 * started from a layout effect — and every wagon moving the same way.
 *
 * The 200 ms is what the child actually gets to watch, and that is the whole
 * reason for the number. The version this replaced ran 300 ms but spent 231 of
 * them at opacity 0: it faded out by offset 0.23, so the rake was measurably gone
 * 42 ms after the tap, inside three painted frames (1.00 at +6.2 ms, 0.80 at
 * +11.4, 0.37 at +25.1, 0.00 at +42.0). That is not a departure, it is a blink,
 * and nine tenths of the child's train did it. Now the rake holds full opacity
 * for two thirds of the flight and fades over the last third: 13 painted frames
 * carry ink, the last of them sampled at +193.5 ms, and what that ink draws is
 * wagons rolling along the rails. See the layout effect for the direction, the
 * distance and the sampled curve.
 */
const SHED_MS = 200
/** Vertical slack around the track so a drop that lands near it still counts. */
const DROP_PAD_Y = 110

/**
 * What pressing the go button means right now.
 *
 * `ready`   — the train is exactly the train this button will accept. Hot pink,
 *             breathing, arrow creeping: the invitation, and it is honest, because
 *             pressing it really does send the train.
 * `built`   — a whole train is standing there but it is not the one that was asked
 *             for. Still pink, still full size, still pressable — and still,
 *             visibly, not inviting: it does not breathe and its pink is the quiet
 *             one. Pressing it submits and gets the refusal, which is where the
 *             "no" belongs.
 * `idle`    — nothing to send at all, so pressing is pointless.
 * `busy`    — the train is already leaving or being cheered.
 *
 * Round 2 made this structural on purpose — "is the answer right" was thought to
 * be a spoiler. It was the wrong call twice over. The button was already going to
 * answer that question a fifth of a second later, so hiding it bought nothing; and
 * with the completion wash and the counter plate flooding green on any full train,
 * the screen was *already* claiming a wrong train was right and the button was the
 * only thing that disagreed. The invitation now comes on at the same instant the
 * signal lamp does, off the same boolean, and the child gets a running "it's right
 * now" he can read before he commits — which is the thing the reference does with
 * its one huge unmistakable action.
 */
type GoState = 'ready' | 'built' | 'idle' | 'busy'

interface ActiveDrag {
  item: TrainItem
  Icon: FC<TrainIcon>
  iconSize: number
  x: number
  y: number
}

/** One pointer currently pressing a palette card. */
interface PressSession {
  pointerId: number
  item: TrainItem
  Icon: FC<TrainIcon>
  iconSize: number
  startX: number
  startY: number
  originX: number
  originY: number
  /** performance.now() at pointerdown — the time half of the tap/drag decision. */
  startTime: number
  /** The card this press started on, re-measured at release time. */
  cardEl: HTMLElement
  /** True once the ghost is visible (moved far enough, or held long enough). */
  lifted: boolean
  /** True once the pointer travelled further than TAP_MOVE_PX. */
  moved: boolean
  /** Shakes the card this press came from. */
  refuse: () => void
  /** Plays the coupling sound for this item — only once it is truly placed. */
  accept: () => void
  /** The same, for a placement that swept another load off the rails on the way in. */
  replace: () => void
  /** Per-pointer hold timer, so one finger's timer cannot cancel another's. */
  holdTimer: ReturnType<typeof setTimeout> | null
}

/** An item in flight: either travelling to the track, or snapping back to its card. */
interface Flight {
  id: number
  Icon: FC<TrainIcon>
  iconSize: number
  x: number
  y: number
  /**
   * Where this flight has to end, relative to where it starts — known the moment
   * it is created, for the two modes whose destination does not have to be
   * measured: a snap returns to the card it came from, and a shed rolls a fixed
   * distance along the rails. A placement leaves this null: its target is the
   * reserved slot, which is measured off clean layout on the next frame instead of
   * being guessed.
   */
  dx: number | null
  dy: number | null
  ms: number
  /**
   * `place` flies from a card to its slot, `snap` returns to the card it came from,
   * and `shed` is a wagon of the load the child has just replaced, rolling away
   * along the rails. The last one is a photograph: its real item has already left
   * the train.
   */
  mode: 'place' | 'snap' | 'shed'
  /** The train item this flight is carrying; it stays hidden until the flight lands. */
  itemKey: number | null
}


/**
 * Did the finger let go while still (roughly) on the card it pressed? Measured
 * fresh at release, with slack, because the child's finger covers the whole card.
 */
function releasedOnCard(cardEl: HTMLElement, x: number, y: number): boolean {
  const r = cardEl.getBoundingClientRect()
  return (
    x >= r.left - CARD_RELEASE_PAD &&
    x <= r.right + CARD_RELEASE_PAD &&
    y >= r.top - CARD_RELEASE_PAD &&
    y <= r.bottom + CARD_RELEASE_PAD
  )
}

export default function App() {
  const game = useGameState()
  const isTablet = useTablet()
  const speech = useSpeech()
  const wagonsOn = placedWagons(game.trainItems).length
  /**
   * The load drawn inside a wagon of this type — on the rails, and on the copy of it
   * that rolls away when the child changes his mind. Null while the level wants empty
   * shells.
   *
   * It is the palette's own rule (`cargoShownOnWagon`), so a wagon standing on the
   * rails is the identical picture to the card that put it there. It used to be the
   * task's cargo id for every wagon regardless of type, which drew the task's coal
   * inside a milk tank the moment a child chose the wrong one: the rails then showed
   * a correctly loaded train and the go button refused it. Now a wrong choice looks
   * on the rails exactly as wrong as it looked in the palette.
   */
  const taskCargo = game.task.cargo
  const cargoHints = game.task.cargoHints
  const wagonCargo = useCallback(
    (type: WagonType): string | null =>
      cargoHints ? cargoShownOnWagon(type, taskCargo) : null,
    [cargoHints, taskCargo],
  )
  const hasLoco = placedLoco(game.trainItems) !== undefined
  /**
   * Will pressing the button actually send this train? The hook's one answer to
   * that, the same call `submit` makes — so the invitation, the signal lamp and
   * what actually happens on the press cannot come apart.
   */
  const willDepart = game.isRight
  /** Which of the four things the go button is right now. See `GoState`. */
  const goState: GoState =
    game.phase === 'departing' || game.phase === 'celebrating'
      ? 'busy'
      : willDepart
        ? 'ready'
        : hasLoco && wagonsOn > 0
          ? 'built'
          : 'idle'
  const audio = useGameAudio({
    phase: game.phase,
    task: game.task,
    wagonCount: wagonsOn,
    speech,
  })
  const trackHeight = isTablet ? 200 : 140
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const paletteRef = useRef<HTMLDivElement>(null)
  const starsRef = useRef<HTMLDivElement>(null)
  const goRef = useRef<HTMLButtonElement>(null)
  // One live press per pointer id. A second finger or a resting palm gets its
  // own entry and can never steer or end another finger's press.
  const sessionsRef = useRef<Map<number, PressSession>>(new Map())
  /** Which pointer currently owns the single drag ghost. */
  const ghostPointerRef = useRef<number | null>(null)
  const flightTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())
  const flightIdRef = useRef(0)
  /** Flights whose travel has already been handed to the compositor. */
  const startedRef = useRef<Set<number>>(new Set())
  /** The placement currently in the air: its item is on the train but not yet painted. */
  const pendingRef = useRef<{ flightId: number; itemKey: number } | null>(null)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetHoldRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const flightTimers = flightTimersRef.current
    const sessions = sessionsRef.current
    return () => {
      if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current)
      if (resetHoldRef.current !== null) clearTimeout(resetHoldRef.current)
      sessions.forEach((s) => { if (s.holdTimer !== null) clearTimeout(s.holdTimer) })
      sessions.clear()
      flightTimers.forEach(clearTimeout)
      flightTimers.clear()
    }
  }, [])

  const [dragging, setDragging] = useState<ActiveDrag | null>(null)
  const [flights, setFlights] = useState<Flight[]>([])
  /** The train item that exists in state but is still flying: reserved, invisible. */
  const [pendingKey, setPendingKey] = useState<number | null>(null)
  const [isOverTrack, setIsOverTrack] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const {
    addToTrain,
    canAdd,
    tapKind,
    liveTrain,
    isRightNow,
    removeFromTrain,
    submit,
    resetProgress,
    shakeKey,
    pulseTask,
  } = game

  /** Bounce the palette so a tap that hit nothing still points somewhere. */
  const nudgePalette = useCallback(() => {
    const el = paletteRef.current
    if (!el) return
    el.classList.remove('attn')
    void el.offsetWidth
    el.classList.add('attn')
  }, [])

  /**
   * The train is built, so every palette card is now a dead end: a refusal has
   * to point at the one thing that still does something. The button swells and
   * throws a green ring in the same frame as the refused card turns red.
   */
  const popGo = useCallback(() => {
    const el = goRef.current
    if (!el) return
    el.classList.remove('go-attn')
    void el.offsetWidth
    el.classList.add('go-attn')
  }, [])

  /**
   * The wagons of the old load, leaving.
   *
   * A tap on a wagon card of a different type means "no, THIS one": the wagons
   * already coupled come off in the very same commit the new one goes on, so the
   * train is instantly the train the child just asked for and there is no interval
   * in which the game owes him an animation before he may tap again.
   *
   * That leaves nothing on the rails to animate, so each departing wagon is
   * photographed one line before it is removed — position, size and the very icon it
   * was drawn with — and the copy is what rolls away along the rails, all of them on
   * one frame together and all of them by the same distance, so a row of ten reads
   * as one rake pulling out rather than as ten things vanishing one after another.
   *
   * `dx` is that distance: three wagon widths, one number for the whole rake, and
   * measured off the wagons rather than fixed, so it is the same-looking departure at
   * count 2 (where a wagon is 119.6 px wide, giving a 358 px roll) as at count 10
   * (where the whole train is scaled down to fit the row: 78.4 px per wagon and a
   * 235 px roll in landscape, 54.9 and 166 in portrait — 3.00 wagon widths in every
   * one of the four, measured). One number matters: it used to
   * be `round(width * 3)` per ghost, and the wagons' boxes differ by a fraction of a
   * pixel, so the rounded distances differed by up to three px — measured as a rake
   * spread that grew from 0 to 2.98 px across the flight, which is a coupling with
   * play in it. Negative, because that is the direction this game's trains leave in —
   * the same way the real departure takes the whole row (`train-depart`,
   * translateX(-140%)) and the same way the reference's train crosses its own frames
   * (frames 100-102 of reference/sago/frames-clean: the rake tracks sideways across
   * the platform, level, on its wheels, at full opacity throughout). The engine stays
   * where it is; the load rolls out past the head of the train and off the side of
   * the screen.
   *
   * Compositor-only, like every other flight in this file, and hue-free: the greens
   * and reds here are verdicts about the whole train, and this is a change of mind.
   */
  const shedWagons = useCallback((keys: number[]): Flight[] => {
    const root = trackRef.current
    if (!root || keys.length === 0) return []
    const seen: { type: WagonType; r: DOMRect }[] = []
    keys.forEach((key) => {
      const el = root.querySelector<HTMLElement>(`[data-item-key="${key}"]`)
      if (!el) return
      const type = el.dataset.itemType as WagonType | undefined
      if (type === undefined) return
      seen.push({ type, r: el.getBoundingClientRect() })
    })
    if (seen.length === 0) return []
    const dist = -Math.round(Math.max(...seen.map((s) => s.r.width)) * 3)
    return seen.map(({ type, r }) => ({
      id: flightIdRef.current++,
      Icon: wagonIcon(type, wagonCargo(type)),
      // The button carries p-1 either side of the drawing.
      iconSize: Math.max(8, Math.round(r.width - 8)),
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
      dx: dist,
      dy: 0,
      ms: SHED_MS,
      mode: 'shed',
      itemKey: null,
    }))
  }, [wagonCargo])

  /** Every same-frame answer the go button can give; only ever one at a time. */
  const clearGoFx = useCallback(() => {
    goRef.current?.classList.remove('go-press', 'go-nope', 'go-refuse', 'go-attn')
  }, [])

  /**
   * The whole press, in one synchronous call, and it answers the one question a
   * non-reader most needs answered: did my train go?
   *
   * Three genuinely different answers, decided here rather than after the fact,
   * because `willDepart` is already known in this same task:
   *
   *   departs   — the confident squash, the steam whistle, and the disc keeps its
   *               pink while the arrow flies out of it. The chuffs follow from
   *               the phase change.
   *   refused   — a train is built but it is not the one that was asked for: the
   *               disc recoils backwards and the arrow is pulled back home, and
   *               what plays is air brakes, never the whistle. Nothing about this
   *               press may look or sound like a departure.
   *   pointless — nothing to send at all: the dead disc shivers, the soft "not
   *               that" note plays, and the cards bounce, because the cards are
   *               the only thing that can turn this into something worth pressing.
   */
  const handleGoPress = useCallback(() => {
    const el = goRef.current
    if (el && goState !== 'busy') {
      clearGoFx()
      void el.offsetWidth
      el.classList.add(
        goState === 'ready' ? 'go-press' : goState === 'built' ? 'go-refuse' : 'go-nope',
      )
    }
    if (goState === 'ready') {
      // Pixels first, then this sound, then the state change.
      playWhistle()
      submit()
      return
    }
    if (goState === 'built') {
      // A whole train, but not the one that was asked for. Air brakes, never the
      // whistle, and `submit` still runs: it is what marks the wrong wagons red and
      // re-reads the task, which is the only place the game explains a "no".
      playBrake()
      submit()
      return
    }
    // Already leaving: the disc is mid-departure and must not be interrupted by a
    // press animation. The ripple and tick every touch gets are the answer here.
    if (goState === 'busy') return
    playOops()
    nudgePalette()
  }, [clearGoFx, goState, nudgePalette, submit])

  // Forgiving hit test: the full width of the track plus generous vertical slack,
  // so a drop that lands above or below the rails still counts.
  const checkOverTrack = useCallback((x: number, y: number): boolean => {
    if (!trackRef.current) return false
    const rect = trackRef.current.getBoundingClientRect()
    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top - DROP_PAD_Y &&
      y <= rect.bottom + DROP_PAD_Y
    )
  }, [])

  /**
   * The flight is over: drop the flying copy and reveal the real item in the same
   * React commit, so the child never sees two of the same wagon at once.
   */
  const finishFlight = useCallback((id: number) => {
    startedRef.current.delete(id)
    const timer = flightTimersRef.current.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
      flightTimersRef.current.delete(id)
    }
    if (pendingRef.current?.flightId === id) {
      pendingRef.current = null
      setPendingKey(null)
    }
    setFlights((prev) => prev.filter((f) => f.id !== id))
  }, [])

  /** Safety net: reveal the item even if the animation never reports finishing. */
  const armFlightTimer = useCallback((id: number, ms: number) => {
    const timer = setTimeout(() => finishFlight(id), ms + 200)
    flightTimersRef.current.set(id, timer)
  }, [finishFlight])

  /**
   * The item is already committed to the train, but it stays invisible in its
   * reserved slot until this copy arrives there. dx/dy are left null for one
   * commit so the real slot can be measured instead of guessed.
   */
  const launchPlace = useCallback(
    (Icon: FC<TrainIcon>, iconSize: number, fromX: number, fromY: number, itemKey: number) => {
      // Close out any earlier placement still in the air: only one slot may hide.
      const prevPending = pendingRef.current
      if (prevPending) finishFlight(prevPending.flightId)
      const id = flightIdRef.current++
      pendingRef.current = { flightId: id, itemKey }
      setPendingKey(itemKey)
      setFlights((prev) => [
        ...prev,
        { id, Icon, iconSize, x: fromX, y: fromY, dx: null, dy: null, ms: FLY_MS, mode: 'place', itemKey },
      ])
      armFlightTimer(id, FLY_MS)
    },
    [armFlightTimer, finishFlight],
  )

  /** A drag that ended nowhere useful: the item visibly returns to its card. */
  const launchSnap = useCallback(
    (session: PressSession, fromX: number, fromY: number) => {
      const id = flightIdRef.current++
      setFlights((prev) => [
        ...prev,
        {
          id,
          Icon: session.Icon,
          iconSize: session.iconSize,
          x: fromX,
          y: fromY,
          dx: session.originX - fromX,
          dy: session.originY - fromY,
          ms: SNAP_MS,
          mode: 'snap',
          itemKey: null,
        },
      ])
      armFlightTimer(id, SNAP_MS)
    },
    [armFlightTimer],
  )

  /**
   * The load the child has just replaced, leaving. Its real items are already off
   * the train, so these copies are the only thing that can show them going. Nothing
   * about it is a verdict — no hue, no flash — because changing your mind is not a
   * mistake, and the wagon it made room for is arriving in the same breath.
   *
   * Four things this does, and every one of them is measurable:
   *
   * 1. It starts in a LAYOUT effect, in the same commit that removed the wagons and
   *    before that commit is painted, so the flight is already attached in the
   *    ghosts' own first painted frame. The other two flight modes wait a frame on
   *    purpose (they have to measure the slot they are flying to; see the effect
   *    below), and a shed ghost has nothing to measure — it flies relative to where
   *    it already is. Waiting cost real frames: with the start deferred to the next
   *    rAF, portrait runs measured the whole rake standing motionless on the new
   *    layout for up to 120 ms, which is the pile this was supposed to end. No
   *    layout is read here, so nothing is forced in the press's own task.
   *
   * 2. Every ghost of one replacement starts on that same frame, travels the same
   *    distance and fades on the same schedule, so ten of them read as one rake
   *    being uncoupled rather than as ten separate disappearances. Measured at
   *    count 10, both orientations, on all 13 painted frames of the flight: the
   *    leading ghost and the trailing one differ by at most 0.1 px in how far they
   *    have travelled — which is the rounding of the two rect readouts, not play in
   *    the coupling — and by 0.0 px in height.
   *
   * 3. It goes sideways, along the rails, in the direction this game's trains
   *    leave — which is what makes it read as a departure and not as a deletion.
   *    A train leaves sideways: it is the reference's own idiom (frames 100-102 of
   *    reference/sago/frames-clean are one shot, and across them the rake tracks
   *    leftward across the platform on its wheels — level, opaque, never fading)
   *    and it is already this game's idiom, because `train-depart` takes the whole
   *    row out on translateX(-140%). The version this replaced
   *    rose 150 px instead, and the rise existed only to get the ghosts clear of
   *    the wagon cards before they reached them — a problem a horizontal exit
   *    simply does not have, since the rake never leaves the height of the track
   *    band. So nothing here lifts, nothing rotates and nothing rescales: the
   *    wagons stay on their wheels, at their own size, and roll off the side.
   *
   * 4. And it stays visible for the whole of the flight. That is the fix this round.
   *    The old keyframes put opacity 0 at offset 0.23 of 300 ms — 69 ms, after 62 px
   *    of lift — so the rake was gone inside three painted frames (measured at level
   *    3, count 10: 1.00 at +6.2 ms, 0.80 at +11.4, 0.37 at +25.1, 0.00 at +42.0)
   *    and the child saw nine tenths of his train blink out rather than leave. Now
   *    the fade is the last third and nothing else: full opacity to offset 0.66,
   *    then down to 0 at the end. Timing is linear, so the offsets are milliseconds
   *    of a 200 ms flight, and the distance is three wagon widths, so the rake is
   *    almost two whole wagons clear of the bays it vacated before the fade even
   *    begins. Sampled off the flight's own clock at level 3, count 10, landscape:
   *    opacity 1.000 at 0, 16.7, 33.3, 50, 66.8, 83.3, 100.2 and 116.8 ms — by which
   *    point the rake has rolled 137 px — then 0.980 / 0.735 / 0.488 / 0.244 at
   *    133.4, 150, 166.8 and 183.4, reaching 0 only at 200 ms and 235 px, which is
   *    3.00 widths of the 78.4 px wagon it left. The fade starts at 132 ms, by which
   *    point the roll is 155 px, 1.98 wagon widths. Portrait runs the identical curve
   *    over 166 px, and count 2 over 358 px (359 in portrait). All four runs paint 13
   *    inked frames, so the rake carries ink for essentially the whole 200 ms and two
   *    thirds of that at full strength: a departure a four-year-old can watch happen.
   */
  useLayoutEffect(() => {
    for (const f of flights) {
      if (f.mode !== 'shed' || startedRef.current.has(f.id)) continue
      const el = containerRef.current?.querySelector<HTMLElement>(`[data-flight="${f.id}"]`)
      if (!el) continue
      startedRef.current.add(f.id)
      const dist = f.dx ?? 0
      const shedAnim = el.animate(
        [
          { transform: 'translate(0px, 0px) translate(-50%, -50%)', opacity: 1 },
          {
            offset: 0.66,
            transform: `translate(${Math.round(dist * 0.66)}px, 0px) translate(-50%, -50%)`,
            opacity: 1,
          },
          {
            transform: `translate(${dist}px, 0px) translate(-50%, -50%)`,
            opacity: 0,
          },
        ],
        { duration: f.ms, easing: 'linear', fill: 'forwards' },
      )
      /**
       * The start time is left alone deliberately, and that is a change this round.
       *
       * A freshly created animation is "pending": it binds its start time to the
       * first frame it is actually rendered in, which is exactly what a departure
       * wants. The ghosts' first painted frame is progress zero — the old wagons
       * standing where they stood, over the recesses they have just vacated — and
       * every frame after it is real time from there. It cannot stall on top of the
       * recesses for more than that one frame, because there is no frame in which it
       * is rendered and not yet started.
       *
       * It used to be pinned to `document.timeline.currentTime` plus the age of that
       * reading, on the theory that a janky commit would otherwise freeze the rake.
       * A layout effect already rules that out, and the pin cost real departure:
       * measured at count 10 in landscape it put the flight 62.6 ms in the FUTURE at
       * the first painted ghost frame, so the rake stood still for a frame and then
       * jumped 44 px. Unpinned, the same run reads 0.0 ms at the first painted frame
       * and full opacity through +117 ms.
       */
      shedAnim.onfinish = () => finishFlight(f.id)
    }
  }, [flights, finishFlight])

  /**
   * Start the travel of every flight that has not started yet, on the frame after
   * the one that created it. Shed ghosts are not among them — they are already
   * running, from the layout effect above.
   *
   * This used to measure the reserved slot inside a layout effect and then set
   * state again, which forced a second synchronous render and layout into the very
   * task that the press animation needs the main thread for. Now the accept commit
   * ends at the accept: one frame later, with layout already clean, the slot is
   * read once and the travel is driven straight off the compositor by the Web
   * Animations API — no React re-render, no forced layout, nothing to repaint.
   */
  useEffect(() => {
    if (flights.length === 0) return
    const raf = requestAnimationFrame(() => {
      for (const f of flights) {
        if (startedRef.current.has(f.id)) continue
        const el = containerRef.current?.querySelector<HTMLElement>(`[data-flight="${f.id}"]`)
        if (!el) continue
        let dx = f.dx
        let dy = f.dy
        if (dx === null || dy === null) {
          const slot = trackRef.current?.querySelector('[data-pending]')
          if (!slot) {
            // Nothing to fly to (the item is gone already): show it, do not hide it.
            finishFlight(f.id)
            continue
          }
          const r = slot.getBoundingClientRect()
          dx = r.left + r.width / 2 - f.x
          dy = r.top + r.height / 2 - f.y
        }
        startedRef.current.add(f.id)
        const anim = el.animate(
          f.mode === 'place'
            ? [
                { transform: 'translate(0px, 0px) translate(-50%, -50%) scale(1.05) rotate(-5deg)' },
                {
                  offset: 0.6,
                  transform: `translate(${dx * 0.72}px, ${dy * 0.72}px) translate(-50%, -50%) scale(1.22) rotate(3deg)`,
                },
                {
                  transform: `translate(${dx}px, ${dy}px) translate(-50%, -50%) scale(1.18) rotate(0deg)`,
                },
              ]
            : [
                { transform: 'translate(0px, 0px) translate(-50%, -50%) scale(1.18)', opacity: 1 },
                {
                  transform: `translate(${dx}px, ${dy}px) translate(-50%, -50%) scale(0.8)`,
                  opacity: 0.15,
                },
              ],
          {
            duration: f.ms,
            easing:
              f.mode === 'place'
                ? 'cubic-bezier(0.34, 0.72, 0.36, 1)'
                : 'cubic-bezier(0.4, 0.1, 0.3, 1)',
            fill: 'forwards',
          },
        )
        anim.onfinish = () => finishFlight(f.id)
      }
    })
    return () => cancelAnimationFrame(raf)
  }, [flights, finishFlight])

  /**
   * The whole placement, in one synchronous call, and the one place the three
   * answers a press can get are chosen.
   *
   * Order matters and is deliberate. The wagons that are about to be replaced are
   * measured BEFORE the train is written, because a photograph of something that has
   * already been removed is a photograph of nothing — and this must not depend on
   * React happening to batch the two updates.
   *
   * Returns false only when the game genuinely refused the item, which is now a very
   * short list: the same engine again, or the same wagon type when the train already
   * holds the number the round asked for. A wagon of a *different* load is never
   * refused, whatever the count says, which is what stops the correct card being
   * turned red on a full wrong train.
   */
  const commit = useCallback(
    (s: PressSession, fromX: number, fromY: number): boolean => {
      const kind = tapKind(s.item)
      const ghosts =
        kind === 'replace' ? shedWagons(placedWagons(liveTrain()).map((w) => w._key)) : []
      const res = addToTrain(s.item)
      if (res === null) {
        s.refuse()
        return false
      }
      // Pixels and sound for the answer that actually happened: a coupling, or a
      // coupling that swept the other load off with it.
      if (kind === 'replace') s.replace()
      else s.accept()
      if (ghosts.length > 0) {
        setFlights((prev) => [...prev, ...ghosts])
        for (const g of ghosts) armFlightTimer(g.id, g.ms)
      }
      // Glide from the card (or the finger) into the reserved slot rather than
      // appearing there.
      launchPlace(s.Icon, s.iconSize, fromX, fromY, res.key)
      return true
    },
    [addToTrain, armFlightTimer, launchPlace, liveTrain, shedWagons, tapKind],
  )

  const endSession = useCallback(
    (e: PointerEvent) => {
      const s = sessionsRef.current.get(e.pointerId)
      if (!s) return
      if (s.holdTimer !== null) {
        clearTimeout(s.holdTimer)
        s.holdTimer = null
      }
      sessionsRef.current.delete(e.pointerId)
      // Only the finger that owns the ghost may put it away.
      if (ghostPointerRef.current === e.pointerId) {
        ghostPointerRef.current = null
        setDragging(null)
        setIsOverTrack(false)
      }

      // A real drag that ended over (or near) the rails: land it where it was dropped.
      if (s.moved && checkOverTrack(e.clientX, e.clientY)) {
        // Genuinely on the train, which is the whole of what the coupling claims:
        // the clunk and the neutral punch mean "it went on", never "that was right".
        // Whether the train is right is the go button's one question.
        if (!commit(s, e.clientX, e.clientY)) launchSnap(s, e.clientX, e.clientY)
        return
      }

      // Otherwise: was this a tap? Three independent ways to say yes, because a
      // small child produces all three and every one of them means "I want this".
      //   1. the finger barely moved
      //   2. the press was over almost immediately, however far the finger slid
      //   3. the finger let go while still on the card it started on
      //   4. the finger let go somewhere in the card area without ever leaving it
      const quick = performance.now() - s.startTime < TAP_MAX_MS
      const onCard =
        releasedOnCard(s.cardEl, e.clientX, e.clientY) ||
        (paletteRef.current !== null &&
          releasedOnCard(paletteRef.current, e.clientX, e.clientY))
      if (!s.moved || quick || onCard) {
        // The decision is made here and now; the flight is only the story of it.
        //
        // The authoritative answer, and the only place the clunk, the swap or the
        // punch is allowed: a press that looked placeable on the way down can still
        // be refused here, so it must not already have been answered in sound OR in
        // pixels.
        //
        // And the answer is exactly one fact — "it is on the train", plus, for a
        // change of load, "and the others came off". It is not a verdict on the
        // choice: the punch is hue-free steel, so a wagon carrying the wrong load
        // couples on like any other and is judged once, by the go button. What
        // cannot get here at all is a tap that would do nothing — the same engine
        // again, or an (N+1)th wagon of a load the train already has N of, N being
        // the count the numeral, both dot rows and the holes on the rails have
        // already stated. That one gets the red card and the low note in this frame.
        if (!commit(s, s.originX, s.originY) && s.moved) launchSnap(s, e.clientX, e.clientY)
        return
      }

      // A deliberate drag that ended nowhere useful: visibly snap back rather than vanish.
      launchSnap(s, e.clientX, e.clientY)
    },
    [checkOverTrack, commit, launchSnap],
  )

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      // Strictly the pointer that started this press: a second finger or a
      // resting palm steers its own press or nothing at all.
      const s = sessionsRef.current.get(e.pointerId)
      if (!s) return
      const dist = Math.hypot(e.clientX - s.startX, e.clientY - s.startY)
      if (!s.moved && dist > TAP_MOVE_PX) {
        s.moved = true
        s.lifted = true
      }
      if (!s.lifted) return
      ghostPointerRef.current = e.pointerId
      setDragging({ item: s.item, Icon: s.Icon, iconSize: s.iconSize, x: e.clientX, y: e.clientY })
      setIsOverTrack(checkOverTrack(e.clientX, e.clientY))
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', endSession)
    window.addEventListener('pointercancel', endSession)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', endSession)
      window.removeEventListener('pointercancel', endSession)
    }
  }, [checkOverTrack, endSession])

  // Trigger shake animation when shakeKey increments
  useEffect(() => {
    if (shakeKey > 0 && containerRef.current) {
      containerRef.current.classList.remove('shake')
      void containerRef.current.offsetWidth
      containerRef.current.classList.add('shake')
    }
  }, [shakeKey])

  const handlePalettePress = useCallback((payload: PalettePressPayload, e: React.PointerEvent): boolean => {
    // Decided here, synchronously, from the authoritative train: whatever this
    // returns is exactly what will happen, so the card can react honestly. A
    // second finger on a legal card gets its own press — it is never told "no"
    // for something that is in fact allowed.
    if (!canAdd(payload.item)) return false
    const existing = sessionsRef.current.get(e.pointerId)
    if (existing) {
      if (existing.holdTimer !== null) clearTimeout(existing.holdTimer)
      sessionsRef.current.delete(e.pointerId)
    }
    const session: PressSession = {
      pointerId: e.pointerId,
      item: payload.item,
      Icon: payload.Icon,
      iconSize: payload.iconSize,
      startX: e.clientX,
      startY: e.clientY,
      originX: payload.originX,
      originY: payload.originY,
      startTime: performance.now(),
      cardEl: payload.cardEl,
      lifted: false,
      moved: false,
      refuse: payload.refuse,
      accept: payload.accept,
      replace: payload.replace,
      holdTimer: null,
    }
    sessionsRef.current.set(e.pointerId, session)
    session.holdTimer = setTimeout(() => {
      session.holdTimer = null
      if (sessionsRef.current.get(session.pointerId) !== session || session.lifted) return
      // Held still: lift the item so the child sees it is in hand and can move it.
      session.lifted = true
      ghostPointerRef.current = session.pointerId
      setDragging({
        item: session.item,
        Icon: session.Icon,
        iconSize: session.iconSize,
        x: session.startX,
        y: session.startY,
      })
      setIsOverTrack(checkOverTrack(session.startX, session.startY))
    }, HOLD_LIFT_MS)
    return true
  }, [canAdd, checkOverTrack])

  const handleReset = useCallback(() => {
    resetProgress()
    if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current)
    setResetting(true)
    resetTimerRef.current = setTimeout(() => setResetting(false), RESET_FLASH_MS)
  }, [resetProgress])

  const stopResetHold = useCallback(() => {
    if (resetHoldRef.current !== null) {
      clearTimeout(resetHoldRef.current)
      resetHoldRef.current = null
    }
    starsRef.current?.classList.remove('hold-reset')
  }, [])

  // Press the stars and the whole cluster starts visibly draining; let go early
  // and nothing is lost. A stray tap can no longer wipe the child's progress.
  const startResetHold = useCallback(() => {
    stopResetHold()
    const el = starsRef.current
    if (el) {
      void el.offsetWidth
      el.classList.add('hold-reset')
    }
    resetHoldRef.current = setTimeout(() => {
      resetHoldRef.current = null
      starsRef.current?.classList.remove('hold-reset')
      handleReset()
    }, RESET_HOLD_MS)
  }, [handleReset, stopResetHold])

  // Any touch anywhere gets an answer: a disc under the finger, drawn straight
  // into the DOM during the event, plus a nudge toward the cards if the tap
  // landed on nothing that does anything.
  const handleAnyPress = useCallback((e: React.PointerEvent) => {
    const target = e.target as Element | null
    // First thing of all, and cheap: an AudioContext comes up suspended and stays
    // that way until a gesture, so every sound in the session depends on this
    // line running inside a real pointer event. It also buys the one chance to
    // start speaking, which is what reads the task to a child who cannot read it.
    audio.noteGesture()
    // A palette card answers with its whole body — every press squashes it, and
    // the colour answer follows on the same body — so a white disc on top of it
    // would only wash that out. Every other touch on the screen still gets the disc.
    const onCard = target?.closest('[data-card]') != null
    if (!onCard) showTapRipple(e.clientX, e.clientY, isTablet ? 140 : 110)
    // The audible half of "every touch gets an answer". Scheduling a note on a
    // live context costs a fraction of a millisecond, so this is safe here and
    // the sound genuinely begins in the same task as the touch. Cards make their
    // own, louder noise; the mute switch is excluded because a tick is a silly
    // way to answer "be quiet".
    if (!onCard && target?.closest('[data-mute]') == null) playTick()
    if (!target || !target.closest('[data-touchable]')) nudgePalette()
  }, [audio, isTablet, nudgePalette])

  /** The switch itself is audible when it turns sound back on. */
  const handleMuteToggle = useCallback(() => {
    const wasMuted = speech.muted
    speech.toggleMuted()
    if (wasMuted) playUnmute()
  }, [speech])

  const starSize = isTablet ? 30 : 22
  const dotFilled = isTablet ? 22 : 16
  const dotEmpty  = isTablet ? 17 : 12

  /*
   * Exactly one screen tall, and every box in the chain says so.
   *
   * This used to be `min-h-svh` wrapping a column with `minHeight: 100svh`, which
   * is a floor and not a ceiling: in landscape the rows summed to 821 px inside a
   * 768 px viewport, the document grew to match, and the bottom 26 px of the go
   * button sat below the fold at every count from 7 up. A definite height all the
   * way down plus `overflow-hidden` means the column has to fit, and the row that
   * gives when it cannot is the palette — see the palette's own `min-h-0`.
   */
  return (
    <div className="h-svh overflow-hidden flex justify-center" style={{ background: t.skyBot }}>
      <div className="w-full h-full flex flex-col">
        <Scene trackHeight={trackHeight}>
        <div
          ref={containerRef}
          onPointerDownCapture={handleAnyPress}
          className="relative w-full h-full flex flex-col select-none overflow-hidden"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: t.ink }}
        >
          {/* top bar */}
          <div className="flex items-start justify-between px-3 pt-3 gap-2">
            <div data-touchable>
              <TaskHero
                task={game.task}
                onHelp={() => setHelpOpen(true)}
                pulse={pulseTask}
                onSpeak={audio.speakTask}
                isTablet={isTablet}
              />
            </div>
            {/* The parent's corner: mute first, then the stars. */}
            <div className="flex items-center gap-2">
              <MuteButton
                muted={speech.muted}
                onToggle={handleMuteToggle}
                speechOff={!speech.canSpeakCzech}
                isTablet={isTablet}
              />
              <button
              data-touchable
              onPointerDown={startResetHold}
              onPointerUp={stopResetHold}
              onPointerLeave={stopResetHold}
              onPointerCancel={stopResetHold}
              onKeyDown={(e) => { if (e.key === 'Enter') handleReset() }}
              className="flex items-center justify-end touch-none"
              style={{ minWidth: 88, minHeight: 72, padding: '8px 6px' }}
              title="Hold to reset progress"
              aria-label="Reset progress"
            >
              <div ref={starsRef} className="flex flex-col items-end gap-2 rounded-xl">
                {/* stars */}
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <svg key={i} width={starSize} height={starSize} viewBox="0 0 24 24">
                      <polygon
                        points="12,2 14.8,9 22,9.5 16.5,14 18.2,21 12,17 5.8,21 7.5,14 2,9.5 9.2,9"
                        fill={i <= game.progress.level ? t.accent2 : t.panelEdge}
                        stroke={i <= game.progress.level ? t.accent : 'transparent'}
                        strokeWidth="0.6"
                      />
                    </svg>
                  ))}
                </div>
                {/* progress dots */}
                <div className="flex gap-1.5">
                  {Array.from({ length: CORRECT_PER_LEVEL }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all"
                      style={{
                        width: i < game.progress.correctInLevel ? dotFilled : dotEmpty,
                        height: i < game.progress.correctInLevel ? dotFilled : dotEmpty,
                        background: i < game.progress.correctInLevel ? t.good : t.panelEdge,
                        boxShadow: i < game.progress.correctInLevel
                          ? `inset 0 -2px 0 rgba(0,0,0,0.15), 0 2px 4px ${t.softShadow}`
                          : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            </button>
            </div>
          </div>

          {/* palette
              The one flexible row, and the one that is allowed to give. `min-h-0`
              lets it shrink below its own content, which is what guarantees the
              rows below it — the rails and the go button — always get their full
              height on a screen too short for all four. It has slack at both
              orientations at the worst count there is (measured at count 10: 257 px
              of room for a 250 px row of cards in landscape, 415 for 364 in
              portrait, where the wagon row wraps), so nothing is clipped today.
              This is the ordering of the sacrifice, not a sacrifice — and it is
              also why the button no longer moves between rounds: the 29 px a
              two-row dot block adds to the task panel comes out of this row's
              slack instead of out of the bottom of the screen. */}
          <div ref={paletteRef} className="flex-1 min-h-0 flex items-center justify-center px-3">
            <DragPalette
              trainItems={game.trainItems}
              /* The round decides which cards exist — see data/levels.ts. */
              task={game.task}
              maxWagons={game.maxWagons}
              canPlace={canAdd}
              /* Both read live, inside the pointer event: a refusal may only nod at
                 the go button when the train really is the answer. */
              isRightNow={isRightNow}
              liveTrain={liveTrain}
              onPress={handlePalettePress}
              popGo={popGo}
              /* There is a load on the rails and it is still not the train that was
                 asked for, so there is something to change and the wagon row is
                 where it is changed. Off the STATE, not off a refusal: a settled
                 full-but-wrong train was a dead-still screen, and the child had to
                 repeat his mistake to be shown anything. Not while the train is
                 leaving or being cheered — the answer has been given by then. */
              loadUnsettled={
                wagonsOn > 0 && !willDepart && game.phase !== 'departing' && game.phase !== 'celebrating'
              }
              isTablet={isTablet}
            />
          </div>

          {/* Where the item goes.

              Drawn out of flow on purpose. This used to be a 48 px box in the
              column, so the instant the first item reached the rails the box
              collapsed and everything under it moved: the go button's centre went
              from y=693.7 to y=653.9, a 39.8 px jump upward — 23% of the button's
              own diameter — and back down again on every new round. That jump
              landed in the same frame as the disc turning from grey-and-shrunk to
              pink-and-breathing, so the one object a non-reader is learning to aim
              at changed colour, size AND position at once, once per round, forever.

              A zero-height marker plus an absolutely positioned arrow: the hint
              appearing or disappearing now costs the layout nothing, at either
              orientation, so the button cannot move for it. The arrow hangs into
              the top of the ground band, above the rails — which is where it is
              pointing anyway. */}
          <div className="relative h-0 shrink-0 flex justify-center pointer-events-none select-none z-10">
            {game.trainItems.length === 0 && (
              <svg
                width="38"
                height="44"
                viewBox="0 0 38 44"
                className="absolute top-0 left-1/2 -translate-x-1/2 animate-bounce"
              >
                <path
                  d="M19,4 L19,30 M19,30 L7,18 M19,30 L31,18"
                  stroke={t.ink}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.55}
                />
              </svg>
            )}
          </div>

          {/* track */}
          <TrackZone
            ref={trackRef}
            trainItems={game.trainItems}
            /* Every wagon on the rails is one type, so the load drawn on it is the
               task's own whenever it matches — the same picture the child matched in
               the palette now rolling along the track. */
            wagonCargo={wagonCargo}
            /* The round's number, so the rails can show it as holes to fill. */
            targetCount={game.task.count}
            onRemoveItem={removeFromTrain}
            isOver={isOverTrack}
            isBlocked={dragging !== null && !canAdd(dragging.item)}
            validation={game.validation}
            /* The one input that may turn anything on the track green. */
            isRight={game.isRight}
            phase={game.phase}
            trackHeight={trackHeight}
            onTapTrack={nudgePalette}
            pendingKey={pendingKey}
          />

          {/* Send the train. Icon only: one disc, one arrow, no word anywhere near
              it — and it is the biggest single object on the screen, in a colour
              nothing else on the screen uses. */}
          <div
            className="flex justify-center shrink-0"
            /* Pulled up into the bottom of the ground band on purpose. It stops the
               button being "a thing in a strip below the rails" and gives the white
               ring something other than pale sky to be seen against, while staying
               clear of the wagons, which sit in the middle of the band: at
               trackHeight 200 the band ends at y=644 in landscape and the deepest
               a wagon reaches is 587.5, i.e. 56 px above that bottom edge (and
               further above it at count 10, where the whole train is scaled down
               to fit the width: 571.9, 72 px clear). So a 40 px overlap runs
               through bare ballast only, and measured at counts 1, 2, 7 and 10 in
               both orientations nothing on the rails — no wagon and no empty bay —
               ever reaches into this button's box: the tightest clearance is
               13.8 px, from an empty bay at count 1. Those 40 px are 40 px of
               column height the button does not have to be shrunk by; the old 26
               were paid for out of the disc.

               The bottom padding is the room the attention pop and the ring it
               throws need to grow into, and it is `--go-pop-room` rather than a
               number because it has to scale with the button: the pop is a 1.18
               scale on the hit box, so the room it needs is a fraction of that
               box, not 18 px. A primary action that gets clipped when it shouts is
               not a primary action — and `--go-size` is capped by what this column
               has left precisely so that this padding is always real room inside
               the viewport and never an overhang past the bottom of the screen.
               Nothing pads the top: the pop overflows upward into the ground band
               and the track, which clip nothing. */
            style={{
              background: t.skyBot,
              paddingBottom: 'var(--go-pop-room)',
              marginTop: -40,
            }}
          >
            <button
              ref={goRef}
              data-touchable
              type="button"
              data-go={goState}
              /* pointerdown, not click: the squash, the whistle and the departure
                 all begin in the same task as the finger landing. */
              onPointerDown={handleGoPress}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleGoPress()
              }}
              /* Only the button body's own animation may clear the classes: the
                 attention ring is a pseudo-element on this same button and
                 reports its end through here too. */
              onAnimationEnd={(e) => {
                if (e.target === goRef.current && e.pseudoElement === '') clearGoFx()
              }}
              className="go-btn touch-none select-none"
              aria-label="Vypravit vlak"
            >
              <span className="go-disc">
                {/* Flat white arrow, corners rounded by a round-joined stroke of
                    its own colour — the reference draws its triangle the same way. */}
                <svg className="go-arrow" viewBox="0 0 100 100" aria-hidden="true">
                  <polygon
                    points="26,18 84,50 26,82"
                    fill="#ffffff"
                    stroke="#ffffff"
                    strokeWidth="22"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
          </div>

          {/* drag ghost */}
          {dragging && (
            <div
              className="fixed pointer-events-none z-50"
              style={{
                left: dragging.x,
                top: dragging.y,
                transform: 'translate(-50%, -50%) scale(1.18) rotate(-5deg)',
                filter: `drop-shadow(0 12px 16px ${t.shadow})`,
              }}
            >
              <dragging.Icon size={dragging.iconSize} />
            </div>
          )}

          {/* items travelling from a tapped card to the track (or snapping back) */}
          {flights.map((f) => (
            <div
              key={f.id}
              data-flight={f.id}
              /* Which of the three journeys this copy is on — see `Flight.mode`. */
              data-flight-mode={f.mode}
              /* A wagon arriving flies over everything; the rake leaving passes
                 behind the train it is leaving, so the engine that stays put is
                 never painted over. See the `zIndex` on the track's own items. */
              className={`fixed pointer-events-none ${f.mode === 'shed' ? 'z-0' : 'z-50'}`}
              style={{
                left: f.x,
                top: f.y,
                // Where the copy sits for the one frame before the compositor takes
                // it over: exactly on the card it came from, so that frame is
                // indistinguishable from the card the finger is still touching — or,
                // for a wagon being replaced, exactly on the rails where that wagon
                // stood, so the frame it is removed in is the frame this appears in.
                transform:
                  f.mode === 'shed'
                    ? 'translate(0px, 0px) translate(-50%, -50%)'
                    : 'translate(0px, 0px) translate(-50%, -50%) scale(1.05) rotate(-5deg)',
                filter: `drop-shadow(0 12px 16px ${t.shadow})`,
                willChange: 'transform',
              }}
            >
              <f.Icon size={f.iconSize} />
            </div>
          ))}

          {/* help modal */}
          <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} task={game.task} />

          {/* celebration overlay */}
          {game.phase === 'celebrating' && <Celebration />}

          {/* reset flash */}
          {resetting && (
            <div
              className="absolute inset-0 z-50 pointer-events-none"
              style={{ background: '#fff', animation: 'flash 400ms ease-out' }}
            />
          )}
        </div>
        </Scene>
      </div>
    </div>
  )
}
