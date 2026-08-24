import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react'
import { useGameState } from './hooks/useGameState'
import { useTablet } from './hooks/useTablet'
import { useWakeLock } from './hooks/useWakeLock'
import { useSpeech } from './hooks/useSpeech'
import { useGameAudio } from './hooks/useGameAudio'
import { CORRECT_PER_LEVEL } from './data/levels'
import { TaskHero } from './components/TaskHero'
import { HelpModal } from './components/HelpModal'
import { DragPalette } from './components/DragPalette'
import { WorldChoice } from './components/WorldChoice'
import { TrackZone } from './components/TrackZone'
import { Celebration } from './components/Celebration'
import { NextButton } from './components/NextButton'
import { MuteButton } from './components/MuteButton'
import { Scene } from './components/Scene'
import { WorldScene } from './components/WorldScene'
import { WorldCheer } from './components/WorldCheer'
import { CHOICE_COUNT } from './data/world'
import { readMode } from './utils/mode'
import { SKY, WORLD } from './theme'
import { showTapRipple } from './utils/tapRipple'
import { playBrake, playOops, playTick, playUnmute, playWhistle } from './utils/sfx'
import { placedLoco, placedWagons } from './utils/train'
import { wagonIcon } from './data/wagons'
import { cargoShownOnWagon } from './data/cargo'
import type { TrainItem, TrainIcon, WagonType } from './types'
import type { PalettePressPayload } from './components/DragPalette'
import type { FC } from 'react'

const t = SKY
/**
 * Which of the two screens this session is. Read once, at module load, from the
 * URL — see `utils/mode.ts`. `?mode=classic` is the finished section-A screen,
 * unchanged; anything else (including no parameter at all) is the section-E
 * world. Both are reachable from one preview URL on one tablet, which is what
 * makes the A/B test possible.
 */
const MODE = readMode()
const isWorld = MODE === 'world'
/**
 * The mode, on the root element, so CSS can see it.
 *
 * The rules that need it are the `html[data-mode='world'] .world-plate` /
 * `.world-badge` pair in index.css: the task panel, the help button and the mute
 * switch are painted as flat signs standing in a place rather than as shadowed
 * cards floating over one. Set here, at module load, because the mode is read here
 * and because it has to be on the element before the first paint. Classic never
 * sets it, so every selector guarded by it is dead on the control screen.
 */
if (isWorld) document.documentElement.dataset.mode = 'world'
/**
 * What the two rows the scene does not own are filled with.
 *
 * Classic fills the page behind the column, and the row the go button stands in,
 * with its own pale sky — which is why the button reads as a thing in a strip
 * below the rails. In world mode both are transparent, so the scene's near bank
 * runs unbroken under the button and the button is standing on the ground.
 */
const PAGE_BG = isWorld ? WORLD.sky : t.skyBot
const GO_ROW_BG = isWorld ? 'transparent' : t.skyBot
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
  /**
   * How much the copy grows on the way — world placements only, 1 everywhere else.
   *
   * The waiting stock stands at the far end of the line and is therefore drawn
   * smaller than the coupled stock (see `OFFER_SCALE` in data/world.ts). The copy
   * starts pixel-identical to the wagon that was standing there — same drawing,
   * same size, same place — and reaches the coupled size as it arrives, so the
   * child watches ONE wagon come towards him down the line rather than a small
   * wagon vanishing and a big one appearing. Round 3's failed gate was a wagon
   * that was drawn at half the size it became with nothing in between; this is
   * the in-between.
   */
  grow: number
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

/**
 * The picture the whole game sits inside. One line, and it is the whole of the
 * mode switch: `Scene` is the classic pale wash with its blurred sun and two
 * grey-blue hills, `WorldScene` is the place behind the rails. Neither knows
 * about the other and the classic one is not touched.
 */
const SceneShell = isWorld ? WorldScene : Scene

export default function App() {
  const game = useGameState()
  const isTablet = useTablet()
  useWakeLock()
  /**
   * The viewport's height in px, because world mode's track band is a fraction of
   * it and the whole scene is anchored to that band. Read once and then on resize
   * (which is what an orientation change is); nothing else in the app needs it, and
   * classic never reads it.
   */
  /* The width comes with it, and for one reason only: a tall frame and a wide one
     want different shares of their height for the band the train stands in — see
     `trackHeight`. Nothing else reads it. */
  const [viewport, setViewport] = useState(() => ({
    h: typeof window === 'undefined' ? 768 : window.innerHeight,
    w: typeof window === 'undefined' ? 1024 : window.innerWidth,
  }))
  useEffect(() => {
    const onResize = () => setViewport({ h: window.innerHeight, w: window.innerWidth })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const viewportH = viewport.h
  const viewportW = viewport.w
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
  /**
   * Whether the wagons are drawn carrying their load.
   *
   * The level decides it on the classic screen and takes it away at level 3, so
   * the mapping ends up learned. In world mode it is always on, and that is
   * roadmap E2 rather than an oversight: this mode's whole question is "find the
   * wagon carrying the thing the task asks for", a picture-to-picture match, and a
   * row of three empty shells would turn it back into the abstract categorisation
   * a four-year-old has not got. Same rule for the wagons standing on the siding
   * and for the wagons on the rails, so the wagon that arrives is the identical
   * drawing to the one that was tapped.
   */
  const cargoHints = isWorld || game.task.cargoHints
  const wagonCargo = useCallback(
    (type: WagonType): string | null =>
      cargoHints ? cargoShownOnWagon(type, taskCargo) : null,
    [cargoHints, taskCargo],
  )
  /**
   * The accepted-but-still-flying item, and the verdict that excludes it, both now
   * owned by the hook. They used to live here, and `submit` did not know about them:
   * the button said "not yet" and the train departed anyway, in one gesture.
   */
  const { pendingKey, setPendingKey } = game
  const visiblyRight = game.isRight
  const hasLoco = placedLoco(game.trainItems) !== undefined
  /**
   * Will pressing the button actually send this train? The hook's one answer to
   * that, the same call `submit` makes — so the invitation, the signal lamp and
   * what actually happens on the press cannot come apart.
   */
  const willDepart = visiblyRight
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
    placeSeq: game.placeSeq,
    speech,
  })
  /**
   * How tall the band the train stands in is — and in world mode it is 36 px
   * taller than it was, because the measured whole-screen objection was that the
   * subject of the picture was not the biggest thing in it. The train came third
   * on chroma behind an inert bear and the dock, and its visible box was 4.5% of
   * the frame, where every reference frame gives the rolling stock the whole lower
   * half. Every size on the rails is a fraction of this one number — the engine,
   * the wagons, the rails, the ties, the ballast, the signal — and so is the size
   * a waiting wagon is drawn at, so the train grows without the waiting stock
   * becoming a different size from the coupled stock. The room comes out of the
   * one row that is allowed to give (the choice row's `flex-1`), never out of the
   * go button, which clamps itself against the viewport in CSS.
   */
  /**
   * How tall the band the train stands in is.
   *
   * World mode's grows again in E3, and this time it buys ground rather than
   * drawings. The waiting stock used to have a row of its own above the rails —
   * measured as the reason the frame read as two railways — and it now stands on
   * the running line itself, so the row it vacated is gone from the column and the
   * band takes the room — but only six px of it, and that is the measured answer
   * rather than a shy one. The stock's size is decided by the WIDTH of the line it
   * has to share (see `fit` in TrackZone), never by this number, so a taller band
   * buys nothing but bare field above the rails: at 300 px it measured 180 px of
   * empty green inside the band, which is the "flat green sheet" objection restated
   * one row higher. What fills y=440 to y=592 now is the train itself and the stock
   * parked at the far end of the same line, edge to edge, which is what the brief
   * calls the preferred fix. The rest of the freed row goes to the sky, where the
   * two ranges of hills grow into it.
   *
   * And it is a fraction of the VIEWPORT rather than a pair of literals, because the
   * two orientations are not the same shape. 246 px measured right in landscape and
   * left portrait with the horizon a third of the way up a 1024 px frame and 178 px
   * of bare field between the station and the train. A third of the height is 253 px
   * in landscape and 338 in portrait, which puts the rails, the horizon and the
   * midground in the same relative place at both — and every object in the scene
   * that is not on the horizon is now anchored to this number too (see
   * `STATION.foot` and `HEDGE_FOOT`), so the whole midground moves with it.
   */
  /*
   * ...and in E3 round 2 the two orientations stop sharing one fraction.
   *
   * A third of the height was measured right in landscape (253 px of a 768 px frame,
   * the rails a third of the way up, the midground where the reference puts it) and
   * measured wrong in portrait: the very same 33% left 384 px of the 1024 with no
   * drawn object in it at all, "37.5% of the screen, zero ink". A tall frame does not
   * want the same share as a wide one, because the thing the band holds is a
   * horizontal train and the surplus above it is sky.
   *
   * So the band takes 0.33 of a landscape frame and 0.42 of a portrait one, which
   * pulls the horizon 92 px up the portrait screen and — since the coupled wagon's
   * size is now a fraction of THIS number (see `WAGON_BAND` and `wagonMax` in
   * TrackZone) — buys the drawings the height the round-1 critic asked for rather
   * than buying bare field. Every midground object is anchored to the band as well
   * (`STATION.foot`, `HEDGE_FOOT`), so the station and the hedgerow come up with it
   * and the strip between them and the roofs of the train does not open up.
   */
  const trackHeight = isWorld
    ? Math.max(
        150,
        Math.min(460, Math.round(viewportH * (viewportH > viewportW ? 0.42 : 0.33))),
      )
    : isTablet
      ? 200
      : 140
  /**
   * The sizes on this screen — ONE calculation, done by TrackZone (the component
   * that measures the row) and reported back out of it, which is the reason the
   * parked stock and the coupled stock can never disagree about anything. See
   * `onSizes` there and `drawSize` in WorldChoice for the gate this closes. The
   * fallback is only ever used for the single frame before the row is measured.
   */
  const [worldSizes, setWorldSizes] = useState({
    coupled: Math.round(trackHeight * 0.6),
    offer: Math.round(trackHeight * 0.37),
    bottomPad: 4,
  })
  const handleWorldSizes = useCallback(
    (next: { coupled: number; offer: number; bottomPad: number }) => setWorldSizes(next),
    [],
  )
  /**
   * How much a placed wagon grows on its way in. See `grow` on `Flight`.
   *
   * Kept in a ref as well as computed, because the placement is decided inside a
   * pointer event and must read the CURRENT sizes without the callback that does it
   * being rebuilt (and every press handler with it) every time the row is measured.
   */
  const worldGrowRef = useRef(1)
  useEffect(() => {
    worldGrowRef.current = worldSizes.offer > 0 ? worldSizes.coupled / worldSizes.offer : 1
  }, [worldSizes])
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const paletteRef = useRef<HTMLDivElement>(null)
  /** Latches one go press so a second finger cannot send the train twice. */
  const goPressedRef = useRef(false)
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

  /**
   * Bounce the choices so a tap that hit nothing still points somewhere.
   *
   * In the world mode `paletteRef` wraps nothing — the choices are drawn inside
   * TrackZone as the dock — so bouncing the ref animated an empty transparent
   * band and the child got sound with no direction. Point at whichever of the two
   * is really on screen.
   */
  const nudgePalette = useCallback(() => {
    const el = isWorld
      ? document.querySelector<HTMLElement>('[data-dock]')
      : paletteRef.current
    if (!el) return
    // The dock needs its own class: the row it lives on also carries `wc-hint`,
    // which would otherwise swallow `attn` outright. See index.css.
    const cls = isWorld ? 'dock-attn' : 'attn'
    el.classList.remove(cls)
    void el.offsetWidth
    el.classList.add(cls)
    // isWorld is module scope, not a render value, so it is not a dependency.
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
      grow: 1,
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
    // The one press path that had no per-pointer guard: two simultaneous
    // pointerdowns both read the same `goState` and fired two whistles and two
    // submits — the "two trains" the sfx notes warn about.
    if (goPressedRef.current) return
    goPressedRef.current = true
    window.setTimeout(() => { goPressedRef.current = false }, 400)
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
      // A train, but not the one that was asked for. Air brakes, never the
      // whistle, and `submit` still runs: it is what marks the wrong wagons red and
      // re-reads the task, which is the only place the game explains a "no".
      //
      // In world mode this state can only ever mean ONE thing — the load is right
      // and there are not enough of it yet, because a wagon carrying anything else
      // never reaches the rails (see `pickWanted` in utils/validation.ts). So the
      // refusal also points at the dock, which is where the missing wagon is
      // standing, in the same frame as the recoil.
      playBrake()
      if (isWorld) nudgePalette()
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
  }, [setPendingKey])

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
    (
      Icon: FC<TrainIcon>,
      iconSize: number,
      fromX: number,
      fromY: number,
      itemKey: number,
      grow: number,
    ) => {
      // Close out any earlier placement still in the air: only one slot may hide.
      const prevPending = pendingRef.current
      if (prevPending) finishFlight(prevPending.flightId)
      const id = flightIdRef.current++
      pendingRef.current = { flightId: id, itemKey }
      setPendingKey(itemKey)
      setFlights((prev) => [
        ...prev,
        { id, Icon, iconSize, x: fromX, y: fromY, dx: null, dy: null, ms: FLY_MS, mode: 'place', grow, itemKey },
      ])
      armFlightTimer(id, FLY_MS)
    },
    [armFlightTimer, finishFlight, setPendingKey],
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
          grow: 1,
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
        /**
         * How the copy travels, and world mode's is a different journey.
         *
         * Classic flies a card's icon: it grows to 1.22, tilts, and lands at 1.18,
         * which is the language of a token being carried out of a tray and dropped
         * into a slot. In the world there is no tray and no token — the thing that
         * left the siding is a wagon, at the size it will be on the rails, and a
         * wagon that swelled by a fifth and tilted five degrees on the way would
         * not be the same wagon that was standing there a frame ago. So it keeps
         * its size and its attitude and simply rolls from where it stood to where
         * it is going. Nothing here is a verdict; both journeys are hue-free and
         * compositor-only.
         */
        const worldRoll = isWorld && f.mode === 'place'
        const anim = el.animate(
          f.mode === 'place'
            ? worldRoll
              ? [
                  { transform: 'translate(0px, 0px) translate(-50%, -50%) scale(1)' },
                  {
                    transform: `translate(${dx}px, ${dy}px) translate(-50%, -50%) scale(${f.grow})`,
                  },
                ]
              : [
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
                {
                  transform: `translate(0px, 0px) translate(-50%, -50%) scale(${isWorld ? 1 : 1.18})`,
                  opacity: 1,
                },
                {
                  transform: `translate(${dx}px, ${dy}px) translate(-50%, -50%) scale(${isWorld ? 0.94 : 0.8})`,
                  opacity: 0.15,
                },
              ],
          {
            duration: f.ms,
            easing:
              f.mode === 'place'
                ? worldRoll
                  ? 'cubic-bezier(0.3, 0.7, 0.4, 1)'
                  : 'cubic-bezier(0.34, 0.72, 0.36, 1)'
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
      launchPlace(s.Icon, s.iconSize, fromX, fromY, res.key, isWorld ? worldGrowRef.current : 1)
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
        // Classic only: in the world mode this ref wraps nothing, so the whole
        // empty sky band counted as "released on the card" and a drag let go in
        // mid-air coupled the wagon instead of snapping back.
        (!isWorld &&
          paletteRef.current !== null &&
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

  /**
   * World mode: the engine is already standing on the rails — roadmap E2.
   *
   * Pick-one-of-three is one decision, and choosing the engine was never the
   * decision: every engine a round offers is a right answer (`validateTrain` asks
   * only that there IS one), so the engine row was three taps that could not be
   * got wrong standing between the child and the one choice that matters. On the
   * classic screen it stays, because that screen is the control. Here the engine is
   * simply part of the scene from the first frame, exactly as it is in every
   * reference frame — the train is always already there, waiting, and what the
   * child does is add to it.
   *
   * A layout effect, so it lands in the same paint as the round it belongs to: an
   * ordinary effect would show one frame of an empty engine bay at the start of
   * every round. Which engine changes with the round's own number, so the child
   * sees all three across a session without a random draw in a component.
   */
  const trainItems = game.trainItems
  const taskLocos = game.task.locomotiveIds
  const taskCount = game.task.count
  const phase = game.phase
  useLayoutEffect(() => {
    if (!isWorld || taskLocos.length === 0) return
    if (phase !== 'playing' && phase !== 'wrong') return
    if (placedLoco(trainItems) !== undefined) return
    /**
     * And it is the yellow steam engine every time.
     *
     * Round 2 rotated the three engines with the round's own number, and the
     * measured cost was that the round's engine was often the blue electric —
     * chroma 116, quieter than the orange box wagon standing on the dock at
     * 183.2. The subject of this screen may not be out-shouted by the shop, and
     * `validateTrain` asks only that there IS an engine, so which one it is was
     * never the child's decision to make. The reference picks the same way: every
     * frame of Sago's own footage runs one saturated warm engine — yellow in
     * frames-clean/frame-100 to -102 and in blind/sago-trains-02, green in
     * blind/sago-trains-05 — as the loudest object in the picture.
     */
    const warm = taskLocos.includes('steam') ? 'steam' : taskLocos[0]
    addToTrain({ kind: 'loco', id: isWorld ? warm : taskLocos[taskCount % taskLocos.length] })
  }, [addToTrain, phase, taskCount, taskLocos, trainItems])

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
  /**
   * The gesture unlock is a session-level concern, not a subtree one.
   *
   * `handleAnyPress` only fires for touches inside App's own container, but the
   * world scene paints decoration outside it — the two animals on the near bank
   * sit after `{children}` in `WorldScene`. If the first touch of the session
   * landed on one of those, `noteGesture()` never ran, so the AudioContext stayed
   * suspended and the Czech task sentence — the only channel a non-reader has —
   * was never spoken until something else was touched. A capture listener on the
   * document catches the first touch wherever it lands.
   */
  useEffect(() => {
    const unlock = () => audio.noteGesture()
    document.addEventListener('pointerdown', unlock, { capture: true })
    return () => document.removeEventListener('pointerdown', unlock, { capture: true })
  }, [audio])

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

  /**
   * The progress cluster: three level stars over a row of round-completion dots.
   *
   * World mode draws it about a third smaller, and it is INERT there and no longer
   * in the sky. Measured hazard, and it was in the frame from E1: the cluster was
   * a live 110x72 button whose accessible name is "Reset progress", sitting in the
   * top right corner of a screen a four-year-old is playing on. Holding it wipes
   * his level. Nothing in any reference frame is a destructive control and nothing
   * in any reference frame is chrome at all, so in world mode this is paint: it
   * hangs low on the near bank, out of the sky the critic measured empty, with
   * `pointer-events: none`, and there is no way to reset from this screen. The
   * parent's reset lives on the classic screen, which is one query string away and
   * shares the same stored progress.
   */
  const starSize = isWorld ? (isTablet ? 22 : 16) : isTablet ? 30 : 22
  const dotFilled = isWorld ? (isTablet ? 15 : 11) : isTablet ? 22 : 16
  const dotEmpty  = isWorld ? (isTablet ? 12 : 9) : isTablet ? 17 : 12

  const progressCluster = (
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
  )

  /**
   * The stock waiting at the far end of the running line — roadmap E3.
   *
   * Built here and handed to TrackZone, which renders it as the last item in the
   * train's own flex row so it stands on the same rail, bottom-aligned, with no
   * ledge, no coping and no second ladder anywhere in the frame. The sizes come
   * back out of TrackZone (`onSizes`) because TrackZone is the component that
   * measures the row; there is one calculation and both ends of the line read it.
   */
  const worldOffer = isWorld ? (
    <WorldChoice
      task={game.task}
      /* Which wagon has nothing left to offer, and therefore is not standing
         there — see `away` in WorldChoice. Off the rendered train, because it
         decides paint. */
      placedType={placedWagons(game.trainItems)[0]?.type ?? null}
      full={wagonsOn >= game.task.count}
      onPress={handlePalettePress}
      popGo={popGo}
      isRightNow={isRightNow}
      loadUnsettled={
        wagonsOn > 0 && !willDepart && game.phase !== 'departing' && game.phase !== 'celebrating'
      }
      /* Both straight out of the component that draws the coupled wagon — never a
         factor applied here. Round 3 failed a gate on exactly that line: it read
         `Math.round(trackHeight * 0.4)` under a comment claiming to be TrackZone's
         own `wagonMax`, which was 0.8. */
      drawSize={worldSizes.offer}
      bottomPad={worldSizes.bottomPad}
      /* Whose face is on the wagons still waiting on the line: the rider the NEXT
         coupled wagon will have, so the animal standing on the wagon he taps is the
         animal that rides it in. TrackZone hands its riders out by position in the
         rake, so the next one is simply the number already on it. */
      riderIndex={wagonsOn}
    />
  ) : null

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
    <div className="h-svh overflow-hidden flex justify-center" style={{ background: PAGE_BG }}>
      <div className="w-full h-full flex flex-col">
        <SceneShell trackHeight={trackHeight}>
        <div
          ref={containerRef}
          onPointerDownCapture={handleAnyPress}
          className="relative w-full h-full flex flex-col select-none overflow-hidden"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: t.ink }}
        >
          {/* top bar

              World mode gives it no top padding, so the task sign's own top edge
              IS the top edge of the frame. That is the difference between a board
              screwed to the top of the picture and a card floating in the sky, and
              floating in the sky was the measured objection: "a rounded beige card
              with a rim floating in the sky". Twelve px of column height back, too,
              which the choice row spends on the wagons. */}
          <div className={`flex items-start justify-between px-3 gap-2 ${isWorld ? 'pt-0' : 'pt-3'}`}>
            <div data-touchable>
              <TaskHero
                task={game.task}
                onHelp={isWorld ? null : () => setHelpOpen(true)}
                pulse={pulseTask}
                onSpeak={audio.speakTask}
                isTablet={isTablet}
                /* World mode: a smaller sign, hanging from the top of the frame
                   rather than a card floating in the sky. */
                world={isWorld}
              />
            </div>
            {/* The parent's corner: the mute switch, and on the classic screen the
                stars with the hold-to-reset behind them. World mode's progress is
                paint on the near bank instead — see `progressCluster`. */}
            <div className="flex items-center gap-2">
              <MuteButton
                muted={speech.muted}
                onToggle={handleMuteToggle}
                speechOff={!speech.canSpeakCzech}
                isTablet={isTablet}
                world={isWorld}
              />
              {!isWorld && (
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
                  {progressCluster}
                </button>
              )}
            </div>
          </div>

          {/* World mode has no progress meter at all, and that is the last piece
              of furniture leaving the picture.

              It was a row of stars and dots floating bottom-left over the grass —
              named, with the task sign, as one of "the last two pieces of furniture
              in the frame" — and it was already inert paint here, because the
              hold-to-reset behind it is a destructive control and had no business on
              a four-year-old's screen. So it is gone. No reference frame has a
              progress meter of any kind; the parent's copy still lives on the
              classic screen, one query string away, off the same stored progress. */}

          {/* The sky and the middle distance, and in world mode nothing else.

              This is the row the waiting wagons used to stand in, and it is empty
              now on purpose: they came down onto the running line (see `worldOffer`
              below and `offer` in TrackZone), which is the whole of E3. The row
              still exists and is still the one that gives, because that is what
              guarantees the rows below it — the rails and the go button — always get
              their full height on a screen too short for all of them; what stands
              in it in world mode is the scene's own sky, hills and station, drawn
              behind this column by `WorldScene`.

              Classic keeps the palette here exactly as it was: `min-h-0` lets it
              shrink below its own content, and it has slack at both orientations at
              the worst count there is (measured at count 10: 257 px of room for a
              250 px row of cards in landscape, 415 for 364 in portrait). */}
          <div
            ref={paletteRef}
            className={`flex-1 min-h-0 flex justify-center px-3 ${
              isWorld ? 'items-end' : 'items-center'
            }`}
          >
            {!isWorld && (
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
            )}
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
            {/* Classic only. In world mode this was measured as "an abstract grey
                arrow glyph on the retaining wall" — and that is what it is: a
                symbol, in a mode built on the principle that the thing you touch is
                the thing that moves. It has nothing to point at either, because the
                place the load goes is already drawn as an empty bay in the rails and
                that bay breathes on its own. There is no glyph anywhere in the
                reference. */}
            {!isWorld && game.trainItems.length === 0 && (
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
            isRight={visiblyRight}
            phase={game.phase}
            trackHeight={trackHeight}
            onTapTrack={nudgePalette}
            pendingKey={pendingKey}
            /* World mode: the band paints no ground of its own — the field the
               rails are laid on belongs to the scene. */
            world={isWorld}
            /* And in world mode this component owns the ONE wagon size on the
               screen: it folds the dock's width requirement into its own fit and
               hands the answer to the dock. See `choiceCount` there. */
            choiceCount={isWorld ? CHOICE_COUNT : 0}
            /* The waiting stock, standing at the far end of these very rails. */
            offer={worldOffer}
            onSizes={isWorld ? handleWorldSizes : undefined}
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
              background: GO_ROW_BG,
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
                /* World mode: same size, level, and casting nothing. The scene has
                   no drop shadow anywhere in it and neither has the reference. */
                transform: isWorld
                  ? 'translate(-50%, -50%)'
                  : 'translate(-50%, -50%) scale(1.18) rotate(-5deg)',
                filter: isWorld ? 'none' : `drop-shadow(0 12px 16px ${t.shadow})`,
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
                  f.mode === 'shed' || isWorld
                    ? 'translate(0px, 0px) translate(-50%, -50%)'
                    : 'translate(0px, 0px) translate(-50%, -50%) scale(1.05) rotate(-5deg)',
                filter: isWorld ? 'none' : `drop-shadow(0 12px 16px ${t.shadow})`,
                willChange: 'transform',
              }}
            >
              <f.Icon size={f.iconSize} />
            </div>
          ))}

          {/* help modal */}
          <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} task={game.task} />

          {/* The cheer. Classic washes the frame and drops a star on it; world
              mode does not cover the place it just spent the whole round building
              — see `WorldCheer`. */}
          {game.phase === 'celebrating' && (isWorld ? <WorldCheer /> : <Celebration />)}

          {game.phase === 'celebrating' && (
            <div
              className="absolute inset-x-0 z-50 flex justify-center"
              style={{ bottom: 'var(--go-pop-room)' }}
            >
              <NextButton onPress={game.nextRound} />
            </div>
          )}

          {/* reset flash */}
          {resetting && (
            <div
              className="absolute inset-0 z-50 pointer-events-none"
              style={{ background: '#fff', animation: 'flash 400ms ease-out' }}
            />
          )}
        </div>
        </SceneShell>
      </div>
    </div>
  )
}
