import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { FC } from 'react'
import type { Task, TrainItem, TrainIcon, WagonType } from '../types'
import type { PalettePress } from './DragPalette'
import { WAGONS, wagonIcon } from '../data/wagons'
import { cargoShownOnWagon } from '../data/cargo'
import { OFFER_GAP, OFFER_HIT, OFFER_PAD } from '../data/world'
import { WagonRider } from './TrackZone'
import { playCouple, playOops, playPoint, playSwap, playTick } from '../utils/sfx'

/**
 * The wagons waiting in the world — roadmap E2, recomposed by E3.
 *
 * This is what replaces the palette. Not a restyled palette: there is no tray, no
 * plate, no rim, no shadow, no divider, no grid and no row of inventory. Three
 * wagons are standing in the picture with their loads visible inside them, and
 * tapping one rolls that wagon down the line onto the train.
 *
 * E3 moved them, and the move is the whole of this round. They stood on a dock — a
 * full-width ledge with a lit coping and a plank face, laid across the upper frame,
 * with the three wagons on top of it. Measured, that dock made the screen two
 * railways: "the offered band y195-400 is 56.0% ink while the train band y400-595
 * is 16.9%. The waiting stock carries 3.5x the drawn mass of the train being built,
 * spans the full width, and stands on its own segmented full-width coping ladder —
 * so the child sees two rakes on two lines and the loud one is not his."
 *
 * So the dock is deleted outright, and with it the coping, the plank face, the
 * seams and the three full-size chaperones that stood beside the wagons. What is
 * left is three wagons parked on the running line itself, at the far end of it, at
 * `OFFER_SCALE` of the size they will be once they are coupled — see data/world.ts
 * for why that fraction and how the flight keeps the wagon the child touched the
 * wagon that travels. TrackZone lays this row out as the last item in the train's
 * own flex row, bottom-aligned on the same rail, so there is exactly one track in
 * the frame and exactly one line of stock standing on it.
 *
 * Three things are structural here, not cosmetic, and none of them changed:
 *
 *   1. **Nothing is ever dimmed.** There is no disabled state in this file and no
 *      hue that means "not this one". When tapping a waiting wagon would genuinely
 *      do nothing — the train already holds the number the round asked for, in
 *      that very type — the wagon is not standing there any more: it rolls away up
 *      the line (see `away`). Absence is a picture; a grey ghost of a wagon is a
 *      convention.
 *   2. **The object touched is the object that moves.** The tapped wagon vanishes
 *      in the same frame the flying copy appears over it, at the same size and in
 *      the same drawing (App's `launchPlace`, fed with this element's own centre
 *      and its own draw size), so what the child sees is one wagon leaving the
 *      siding for the rails. A replacement shunts in behind it a beat later, which
 *      is what a line with a supply of stock on it does.
 *   3. **Feedback is motion, never colour.** A refused tap rocks the wagon on its
 *      wheels; it is never washed red, because red on a plateless object means
 *      painting the wagon itself, and the child has to be able to try it again.
 *      Green is still spent on exactly one thing in this game — the train being
 *      correct — and nothing in this file can produce it.
 *   4. **The pick is the answer.** A wagon whose load is not the load the sign
 *      shows is refused at the moment of the tap and never reaches the rails, so
 *      the child finds out from the wagon and not from a lamp on the far edge of
 *      the screen a second later. See `pickWanted` in utils/validation.ts.
 *
 * Every event, every hit box and every decision is the section-A machinery
 * unchanged: the same `PalettePress` contract, the same synchronous accept/refuse
 * discipline (the press asks first and reacts second, and the coupling clunk fires
 * only at the moment the item is genuinely on the train), the same flight, the
 * same sounds and the same speech. Only the thing the finger lands on is different.
 */

/** Every one-shot feedback class a waiting wagon can wear; only ever one at a time. */
const FX = ['wc-press', 'wc-refuse', 'wc-point', 'wc-arrive', 'wc-swap'] as const
type Fx = (typeof FX)[number]

function clearFx(el: HTMLElement | null): void {
  if (!el) return
  el.classList.remove(...FX)
}

/** Restart a feedback class synchronously: remove, force reflow, add. */
function playFx(el: HTMLElement | null, cls: Fx): void {
  if (!el) return
  clearFx(el)
  void el.offsetWidth
  el.classList.add(cls)
}

/**
 * The held state — deliberately not one of the one-shots above, for the same
 * reason the palette's `card-held` is not: the press punch is a 260 ms animation
 * and a finger can rest on a wagon for as long as it likes, so without this there
 * would be a stretch in which a wagon a finger is touching is pixel-identical to a
 * wagon nobody has touched. Removed on the pointerup or pointercancel that ends
 * the press, in the capture phase, so it is off the element before the accept or
 * the refusal starts animating it.
 */
const HELD = 'wc-held'
const heldPointers = new WeakMap<HTMLElement, Set<number>>()

function holdWagon(el: HTMLElement, pointerId: number): void {
  let owners = heldPointers.get(el)
  if (owners === undefined) {
    owners = new Set<number>()
    heldPointers.set(el, owners)
  }
  owners.add(pointerId)
  el.classList.add(HELD)
  const release = (ev: PointerEvent) => {
    if (ev.pointerId !== pointerId) return
    window.removeEventListener('pointerup', release, true)
    window.removeEventListener('pointercancel', release, true)
    const live = heldPointers.get(el)
    if (live === undefined) return
    live.delete(pointerId)
    if (live.size === 0) el.classList.remove(HELD)
  }
  window.addEventListener('pointerup', release, true)
  window.addEventListener('pointercancel', release, true)
}

/**
 * How long the dock stands one wagon short after a wagon has left it.
 *
 * It is App's own flight time plus a breath: the gap has to be real (the wagon
 * genuinely went to the train, and a wagon that never left the dock would make
 * the arriving one a copy) and it has to close before the child's next tap, which
 * on a two-wagon round is the very next thing he does.
 */
const REFILL_MS = 420

interface Props {
  /** The round. It says which three types stand here and what they are carrying. */
  task: Task
  /**
   * The type standing on the rails right now, or null for an empty train, and
   * whether the train already holds the number the round asked for. Together they
   * decide which wagon has nothing left to offer and therefore leaves the dock
   * — see `away`. Off the rendered train on purpose: this is paint.
   */
  placedType: WagonType | null
  full: boolean
  /** The same contract the palette cards use, so App's machinery is untouched. */
  onPress: PalettePress
  /** The train is right: no wagon is the answer any more, so the go button is. */
  popGo: () => void
  /** Asked live, inside the pointer event, for exactly that decision. */
  isRightNow: () => boolean
  /**
   * There is a load on the rails and it is still not the train that was asked for,
   * so there is something here to change. The three wagons rock gently on their
   * wheels — as a group, type-neutrally, never one of them, because singling one
   * out would either endorse the child's mistake or hand him the answer.
   */
  loadUnsettled: boolean
  /**
   * How wide a waiting wagon is drawn — and it is the identical number TrackZone
   * draws a coupled wagon at, reported out of TrackZone itself (`onWagonSize`).
   *
   * This was the failed gate in round 3, and it failed by exactly 2x: the dock
   * drew 132x100 while the same wagon coupled measured 264x201, because App
   * multiplied the band height by its own factor of 0.4 and a comment claimed that
   * was TrackZone's `wagonMax`. It was half of it. There is no factor here now and
   * no second calculation anywhere: the component that measures the row computes
   * the size, folds the dock's own width requirement into the same `fit`, and
   * hands the answer over. A wagon that grew on the way to the rails told the
   * child that the thing he touched was a picture of a wagon; this one is the
   * wagon.
   */
  drawSize: number
  /**
   * How far the drawing's bottom edge must sit above the bottom of the flex row it
   * is in, so a parked wagon's wheels are on the very same rail a coupled wagon's
   * wheels are on.
   *
   * It is arithmetic, and TrackZone does it, because TrackZone owns the rail: every
   * wagon drawing is a 100x76 box whose wheel centres are at y=64 with r=7, so the
   * residue below the wheels is 5/76 of the drawn height — a different number of px
   * for a 108 px wagon than for a 175 px one. Bottom-aligning the two without this
   * put the small ones three px through the rail head.
   */
  bottomPad: number
  /**
   * Which animal is standing on the wagons waiting here — and it is the index the
   * rider of the NEXT coupled wagon will have, i.e. how many wagons are on the train
   * already.
   *
   * "Put a face in each parked wagon's window so the eye lands on a choice instead of
   * on the inert engine." Every wagon in frames-clean/frame-030 and -032 has somebody
   * on it, the ones nobody has picked yet included, and the animal goes with the
   * wagon when the wagon moves. Passing the index rather than picking one here is
   * what makes that true: the animal standing on the wagon the child taps is the same
   * animal that rides it into the train, and it is the same drawing all the way —
   * parked, in flight (see `riding`) and coupled.
   */
  riderIndex: number
}

/**
 * Padding around each drawing, and it is what turns a small parked wagon into a
 * target a four-year-old's finger cannot miss.
 *
 * The waiting stock is drawn at `OFFER_SCALE` of the coupled size now (see
 * data/world.ts), so on a ten-wagon round a wagon is 72 px wide and 55 px of drawn
 * height — under the 64 px floor on its own. The padding therefore has a job it did
 * not have when every offered wagon was 228 px: it is grown until the element is at
 * least `MIN_HIT` square, so the hit box never depends on how long the round's train
 * is. It is padding and nothing else — no plate, no rim, no fill.
 */
const PAD = OFFER_PAD
const MIN_HIT = OFFER_HIT
/** Between two wagons parked on the line. Close: they are stock standing together. */
const ROW_GAP = OFFER_GAP

export function WorldChoice({
  task,
  placedType,
  full,
  onPress,
  popGo,
  isRightNow,
  loadUnsettled,
  drawSize,
  bottomPad,
  riderIndex,
}: Props) {
  const rowRef = useRef<HTMLDivElement>(null)
  const refillRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const timers = refillRef.current
    return () => {
      timers.forEach(clearTimeout)
      timers.clear()
    }
  }, [])

  /**
   * The three wagons standing here, each drawn carrying a load.
   *
   * The one the task asks for carries the very object the task shows — the same
   * basket of apples, the same milk bottle — and the other two carry their own
   * default loads, so the row reads as "which of these is carrying the thing I was
   * shown" and matching a picture to a picture is the whole of the puzzle. That is
   * a thing a four-year-old can do with nothing explained to him, which is why the
   * load is drawn here at every level: the classic screen takes the hints away at
   * level 3 to make the mapping be learned, and this mode is the easiest round in
   * the game and keeps them.
   */
  const choices = useMemo(
    () =>
      // Seat order comes from the TASK, not from WAGONS. Filtering the canonical
      // list threw the round's shuffle away and pinned the answer to a seat its
      // cargo decided — hopper left, tank middle, box right, every round — so the
      // level could be won by remembering a position instead of matching the load.
      task.choiceTypeIds
        .map((id) => WAGONS.find((wg) => wg.type === id))
        .filter((wg): wg is (typeof WAGONS)[number] => wg !== undefined)
        .map((wg) => ({
          type: wg.type,
          Icon: wagonIcon(wg.type, cargoShownOnWagon(wg.type, task.cargo)),
        })),
    [task.choiceTypeIds, task.cargo],
  )

  /**
   * The same three wagons with their rider on, as one drawable — which is what the
   * flying copy is made of.
   *
   * The copy App launches is drawn from the component handed to `onPress`, and the
   * wagon standing here has somebody on it, so the component handed over has to be
   * the wagon AND the rider or the face would blink out of existence at the exact
   * moment the child's finger lands on it. Same `WagonRider`, same index, same size:
   * parked, in flight and coupled are one drawing throughout.
   */
  const riding = useMemo(
    () =>
      choices.map(({ type, Icon }) => {
        const Riding: FC<TrainIcon> = ({ size }) => {
          const px = size ?? 80
          return (
            <span className="relative block">
              <Icon size={px} />
              <WagonRider index={riderIndex} wagonSz={px} pad={0} />
            </span>
          )
        }
        return { type, Icon, Riding }
      }),
    [choices, riderIndex],
  )

  const drawH = (drawSize * 76) / 100
  /* Grown until the element is a target, never until it is a plate. */
  const padX = Math.max(PAD, Math.ceil((MIN_HIT - drawSize) / 2))
  /* Room for the rider standing on the roof, so the animal is INSIDE the wagon's own
     tap target rather than hanging over the field above it: it stands on the body's
     top rim at 0.74 of the drawn height and is 0.62 of it tall, so it reaches
     0.36 of the drawn height above the drawing. A four-year-old who aims at the
     animal has aimed at the wagon. */
  const padTop = Math.max(
    PAD,
    MIN_HIT - Math.round(drawH) - bottomPad,
    Math.ceil(drawH * 0.36) + 2,
  )

  /**
   * "This one instead." The second half of every refusal: a "no" that does not
   * also say "here" is a dead end. Two honest destinations and no third: if the
   * train is already right the go button is genuinely the only thing left, and
   * otherwise the load is what is unfinished, so the wagons that are still
   * standing nod — all of them, never one, for the reason on `loadUnsettled`.
   */
  const pointElsewhere = useCallback(
    (refused: HTMLElement) => {
      playPoint()
      /* The train IS the answer already, so there is nothing left on the dock to
         want: the one thing a tap can still do is send it. */
      if (isRightNow()) {
        popGo()
        return
      }
      /* Otherwise the refused pick was the wrong load, and the honest "here
         instead" is the rest of the dock — because since round 3 a wrong pick
         cannot reach the rails at all (see `pickWanted` in utils/validation.ts),
         so the load standing on the train is never the thing that is wrong and
         nothing the child has placed ever needs taking off. The other wagons that
         are still standing nod, as a group and never one of them: singling the
         right one out would hand him the answer he was asked for. */
      const row = rowRef.current
      if (!row) return
      row.querySelectorAll<HTMLElement>('[data-card]').forEach((el) => {
        if (el === refused || el.dataset.away === 'true') return
        playFx(el, 'wc-point')
      })
    },
    [isRightNow, popGo],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, item: TrainItem, Icon: FC<TrainIcon>) => {
      e.preventDefault()
      const el = e.currentTarget
      const rect = el.getBoundingClientRect()

      /**
       * The refusal, in one synchronous call — and since round 3 this is the
       * answer to the pick itself, not just to a pointless tap.
       *
       * A wagon carrying something other than what the sign shows rocks back down
       * on its wheels where it stands: no flight, no coupling clunk, nothing joins
       * the train. That is the whole of what a one-of-three round has to deliver
       * and it was measured absent — the wrong pick used to fly in and couple with
       * the identical reward, and on a one-wagon round the right wagon was then
       * dead. The wagon keeps its paint and its place: no hue, no dimming, no grey
       * ghost. The only red in this game is the signal lamp and the only green is
       * the train being correct.
       */
      const refuse = () => {
        playFx(el, 'wc-refuse')
        pointElsewhere(el)
        playOops()
      }

      /**
       * It really is on the train, so this wagon has really left. It goes out in
       * the same frame the flying copy appears over it — App's `launchPlace` was
       * handed this element's centre and this drawing's size, so the copy starts
       * pixel-identical to what was standing here — and one flight later another
       * wagon of the same type shunts up the dock to take its place.
       *
       * Pixels first, then the sound, both inside this one task.
       */
      const leave = (swap: boolean) => {
        clearFx(el)
        el.dataset.gone = 'true'
        if (swap) playSwap()
        else playCouple()
        const timers = refillRef.current
        const key = String(el.dataset.card)
        const running = timers.get(key)
        if (running !== undefined) clearTimeout(running)
        timers.set(
          key,
          setTimeout(() => {
            timers.delete(key)
            delete el.dataset.gone
            /* ...unless this type has nothing left to offer, in which case it is
               not standing here any more and there is nothing to shunt up: the
               train now holds the number the round asked for, in this very type.
               See `away`. */
            if (el.dataset.away !== 'true') playFx(el, 'wc-arrive')
          }, REFILL_MS),
        )
      }

      // Ask first, react second: a press that looks placeable on the way down can
      // still be refused on the way up, so nothing here claims anything yet.
      const accepted = onPress(
        {
          item,
          Icon,
          iconSize: drawSize,
          originX: rect.left + rect.width / 2,
          originY: rect.top + rect.height / 2,
          cardEl: el,
          refuse,
          accept: () => leave(false),
          replace: () => leave(true),
        },
        e,
      )
      if (accepted) {
        // The visible half of "your finger has hold of this", in the same frame as
        // the finger: the wagon dips on its springs and settles. Hue-free, and it
        // promises nothing except that the touch registered.
        playFx(el, 'wc-press')
        holdWagon(el, e.pointerId)
        playTick()
      } else {
        refuse()
      }
    },
    [drawSize, onPress, pointElsewhere],
  )

  return (
    <div
      ref={rowRef}
      /* App's refusal nudge points at this, so it needs a handle: in the world
         mode the classic palette wrapper renders nothing. */
      data-dock
      className={`flex items-end${loadUnsettled ? ' wc-hint' : ''}`}
      style={{ gap: ROW_GAP }}
    >
      {riding.map(({ type, Icon, Riding }) => {
        /**
         * Has this wagon anything left to offer?
         *
         * It has not when the train already holds the number the round asked for
         * IN THIS TYPE: another one of these is the one tap the game genuinely
         * refuses, so rather than standing here to be refused, this wagon rolls
         * away up the line. The other two stay, because tapping one of those is a
         * change of mind and is always taken — and if the child does change his
         * mind, this one rolls straight back.
         */
        const away = full && placedType === type
        return (
          <div
            key={type}
            data-touchable
            data-card={`wagon-${type}`}
            data-away={away ? 'true' : 'false'}
            onPointerDown={(e) => handlePointerDown(e, { kind: 'wagon', type }, Riding)}
            /* Only this element's own animations may clear the feedback class;
               nothing inside it animates. */
            onAnimationEnd={(e) => {
              if (e.target === e.currentTarget && e.pseudoElement === '') clearFx(e.currentTarget)
            }}
            /* Constant className on purpose: a re-render caused by this very
               press must not rewrite it and wipe the feedback class off the
               element mid-animation. The two state classes are data attributes
               for the same reason. */
            className="wc-wagon relative touch-none select-none cursor-pointer"
            style={{
              paddingLeft: padX,
              paddingRight: padX,
              paddingTop: padTop,
              paddingBottom: bottomPad,
            }}
          >
            {/* The wagon itself. Wrapped so it can roll away up the line without
                the element's own hit box moving — see `.wc-body` in index.css. */}
            <span className="wc-body relative">
              <Icon size={drawSize} />
              {/* Somebody is already on it, and it is the animal that will ride it
                  once it is coupled — see `riderIndex`. Inside `.wc-body`, so it
                  rolls off the line with the wagon rather than being left standing
                  on the rails. */}
              <WagonRider index={riderIndex} wagonSz={drawSize} pad={0} />
            </span>
          </div>
        )
      })}
    </div>
  )
}
