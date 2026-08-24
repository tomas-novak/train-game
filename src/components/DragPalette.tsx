import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef } from 'react'
import type { FC } from 'react'
import type { KeyedTrainItem, Task, TrainItem, TrainIcon } from '../types'
import { LOCOMOTIVES } from '../data/locomotives'
import { WAGONS, wagonIcon } from '../data/wagons'
import { cargoShownOnWagon } from '../data/cargo'
import { canAddToTrain, placedLoco } from '../utils/train'
import { playCouple, playEngine, playOops, playPoint, playSwap, playTick } from '../utils/sfx'
import { SKY } from '../theme'

const t = SKY

/**
 * The classic screen's palette, and only the classic screen's — roadmap E2.
 *
 * E1 taught this file the world mode: the same nine cards with their plates not
 * painted and a strip of track drawn under each row. That was the wrong shape and
 * the whole-screen verdict said so — a palette with the plates switched off is
 * still a palette, a tray of inventory laid over a picture. The world mode now has
 * no tray at all (see `WorldChoice`), so every branch that knew about it has come
 * back out of here and this component is exactly the control screen's palette
 * again: nine cards, white plates, a rim, a divider, and not one line of it
 * conditional on anything.
 */

/**
 * One immutable TrainItem per card, built once at module load. The cards are
 * memoised, and a fresh `{ kind, id }` literal on every render would defeat that
 * for no reason: the item a card stands for never changes.
 */
const LOCO_ITEMS: Record<string, TrainItem> = Object.fromEntries(
  LOCOMOTIVES.map((l) => [l.id, { kind: 'loco', id: l.id } as TrainItem]),
)
const WAGON_ITEMS: Record<string, TrainItem> = Object.fromEntries(
  WAGONS.map((w) => [w.type, { kind: 'wagon', type: w.type } as TrainItem]),
)

/**
 * The two `data-card` prefixes, and the only place their lengths are written
 * down. A hand-counted `slice(7)` silently turned every wagon lookup into
 * `undefined`, which made every wagon card look illegal to the refusal and sent
 * the whole redirect to the go button — a wrong signpost is worse than none, so
 * the prefixes and the lengths now come from the same two strings.
 */
const LOCO_PREFIX = 'loco-'
const WAGON_PREFIX = 'wagon-'

/** The item a `data-card` id stands for, or undefined if the id is neither. */
function itemForCardId(id: string): TrainItem | undefined {
  if (id.startsWith(LOCO_PREFIX)) return LOCO_ITEMS[id.slice(LOCO_PREFIX.length)]
  if (id.startsWith(WAGON_PREFIX)) return WAGON_ITEMS[id.slice(WAGON_PREFIX.length)]
  return undefined
}

/**
 * Every same-frame feedback class a card can wear; only ever one at a time.
 *
 * `card-squash` is the press: hue-free but as big an event as the refusal —
 * immediate, and it promises nothing except "your finger has hold of this".
 * `card-accept` and `card-refuse` are the answer, and they only ever run at the
 * moment the answer is actually known.
 */
const FX = ['card-squash', 'card-accept', 'card-swap', 'card-refuse', 'attn-yes'] as const

function clearFx(el: HTMLElement | null): void {
  if (!el) return
  el.classList.remove(...FX)
}

/** Restart a feedback class synchronously: remove, force reflow, add. */
function playFx(el: HTMLElement | null, cls: (typeof FX)[number]): void {
  if (!el) return
  clearFx(el)
  void el.offsetWidth
  el.classList.add(cls)
}

/**
 * The held-press state. Deliberately NOT one of the FX classes above: those are
 * one-shot animations that replace each other, and this one has to survive all of
 * them. It is added on pointerdown and removed only on the pointerup or
 * pointercancel that ends that press, so a card is never at rest while a pointer
 * owns it.
 *
 * It exists because the punch is a 300 ms one-shot and the ghost only reaches the
 * hand at HOLD_LIFT_MS: a finger that pressed and held had 215 ms (measured
 * composited, down+374 to down+589) in which the card it was touching was
 * pixel-identical to a card nobody had touched.
 */
const HELD = 'card-held'

/**
 * Which pointers are currently holding each card. Two fingers on one card means
 * the first release must not un-press it while the second is still down, so the
 * class comes off on the last release, not the first.
 */
const heldPointers = new WeakMap<HTMLElement, Set<number>>()

/**
 * Mark this card as held by this pointer until that pointer goes up or is
 * cancelled. Capture phase on purpose: App's own pointerup listener sits on
 * window too and plays the accept or the refusal, and the held look has to be off
 * the card before either of those animations starts on it.
 */
function holdCard(el: HTMLElement, pointerId: number): void {
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

/** Everything App needs to either fly the item to the track (tap) or drag it (drag). */
export interface PalettePressPayload {
  item: TrainItem
  Icon: FC<TrainIcon>
  iconSize: number
  /** Centre of the card in viewport coords — the flight starts here. */
  originX: number
  originY: number
  /** The card itself, so a release still over it can be read as a tap. */
  cardEl: HTMLElement
  /** Lets App shake this exact card if the item turns out not to fit after all. */
  refuse: () => void
  /**
   * The whole coupling — the neutral punch, the ring and the clunk. Called by App
   * at the one moment the item is genuinely on the train, never at press time.
   *
   * Press time is not that moment. Two fingers on two different cards are both
   * legal when they land — the train has not changed yet — and the second one is
   * refused a tenth of a second later when it is actually placed. Answering on
   * the way down meant that touch got yes and then no, ~170 ms apart, for one
   * press: first in sound, and after the sound was fixed, still in colour. Both
   * channels now follow the same authoritative answer the placement does.
   */
  accept: () => void
  /**
   * The item went on AND it threw the other load off: "no, THIS one". Called by App
   * instead of `accept` when the placement was a replacement, because a child who
   * has just changed his mind must not be answered with the same clunk as a child
   * who added a second identical wagon — the thing that happened on the rails is
   * different, so the answer on the card is different too. Its own motion (the card
   * sweeps sideways as it couples) and its own sound, which is neither the coupling
   * nor the refusal.
   */
  replace: () => void
}

/** True means "accepted, I am handling it"; false means "refused". */
export type PalettePress = (payload: PalettePressPayload, e: React.PointerEvent) => boolean

interface PaletteCardProps {
  item: TrainItem
  Icon: FC<TrainIcon>
  iconSize: number
  dragSize: number
  /**
   * This card is legal *and* it is what the train is missing: it breathes.
   *
   * Optional, and only the engine row ever passes it. The wagon row deliberately
   * has no breathe of its own — motion is one of the two ways this game says "this
   * one", and every wagon card is legal at every moment, so anything the row could
   * breathe at would either be the child's own mistake or the answer to the round.
   * "One more, and it goes here" is said instead by the breathing recess on the
   * rails (`.train-slot[data-slot-next]` in TrackZone), which is type-blind.
   */
  spotlight?: boolean
  cardMinW: number
  cardMinH: number
  cardId: string
  onPress: PalettePress
  /** Throws the eye at whatever IS allowed, in the same frame as the refusal. */
  popLegal: (refusedCard: HTMLElement) => void
}

function PaletteCardBase({
  item,
  Icon,
  iconSize,
  dragSize,
  spotlight = false,
  cardMinW,
  cardMinH,
  cardId,
  onPress,
  popLegal,
}: PaletteCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  /**
   * The whole refusal, in one synchronous call: this card turns red and wobbles
   * at full opacity, the low note plays, and the single nearest card that is
   * legal right now jumps. A "no" that does not also say "this one instead" is a
   * dead end — but a whole row saying it is a fairground, so it is only ever one.
   */
  const refuse = () => {
    const el = ref.current
    // Pixels first, sound second: nothing audible may sit between the finger
    // landing and the next painted frame. Both are inside this one task, so the
    // sound still begins in the same millisecond as the touch.
    playFx(el, 'card-refuse')
    if (el) popLegal(el)
    playOops()
  }

  /**
   * The item really is on the train. This is a coupling, and — since round 3 — it
   * is *only* a coupling: the punch is hue-free, and it means "it went on", not
   * "that was the right one".
   *
   * It used to flood the card with the same saturated green as the go lamp, which
   * made every placement a correctness verdict. Once the game stopped hiding the
   * wrong wagon types behind dead grey plates, that verdict became a lie again in a
   * new direction: a hopper coupling onto an apples round would have been flooded
   * green and then refused by the go button. So the colour that means "right" is
   * spent in one channel only — the completion wash and the go lamp — and this
   * punch is the deep neutral clunk of two couplings meeting, as loud as before and
   * carrying no claim.
   *
   * It still runs here and never at pointerdown, for the same reason the sound
   * does: two fingers landing on two cards are both placeable as they land, and the
   * second is refused a tenth of a second later. Pixels first, then the sound, both
   * inside this one task.
   *
   * Two placements, two sounds: the engine rumbling onto the rails is not the same
   * event as a wagon coupling on, and a child learning the game by ear should be
   * able to hear which of the two he just did.
   */
  const accept = () => {
    playFx(ref.current, 'card-accept')
    if (item.kind === 'loco') playEngine()
    else playCouple()
  }

  /**
   * Accepted, and it cleared the other load off the rails on the way in.
   *
   * This is the branch that used to be the red refusal, and on a one-wagon round it
   * was the *correct* card that got it: a full wrong train had no room, so the right
   * answer was turned red and the child was pointed at a go button that was about to
   * refuse him too. Now the tap is taken, and the only thing left to do is say so in
   * a way that reads as a swap and not as an error — so it keeps the coupling's
   * hue-free steel (something really did couple on) and adds a sideways sweep that
   * the plain coupling has not got. Pixels first, sound second, both in this task.
   */
  const replace = () => {
    playFx(ref.current, 'card-swap')
    playSwap()
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    const cardEl = ref.current
    if (!cardEl) return
    const rect = cardEl.getBoundingClientRect()
    // Ask first, react second. Note what "accepted" means here: the press may
    // start a session, not that the item will end up on the train. So this
    // branch is allowed to say "I felt that" and nothing more.
    const accepted = onPress(
      {
        item,
        Icon,
        iconSize: dragSize,
        originX: rect.left + rect.width / 2,
        originY: rect.top + rect.height / 2,
        cardEl,
        refuse,
        accept,
        replace,
      },
      e,
    )
    if (accepted) {
      // The visible half of "this touch registered", in the same frame as the
      // finger: a deep hue-free punch, the card lifting off the sheet on a neutral
      // ink shadow, and the picture starting to climb out of the card — the
      // payload beginning to travel. Loud on purpose. It used to be a 12% shrink
      // hidden under the fingertip, five times quieter than the red flood a wrong
      // press gets, which taught the child that the game shouts for "no".
      //
      // Loud, but with no hue that means anything, and now neither does the
      // coupling punch that follows it: green is spent only on the completion wash
      // and the go lamp. The two neutral events differ in weight and direction —
      // this one is a light slate wash with the picture climbing out of the card,
      // the coupling is a dark ink clunk with a ring — so "I have hold of it" and
      // "it went on" are still two distinguishable answers.
      //
      // Two parts, and the split is the fix for the hole the last round measured:
      // `card-squash` is the entry punch and `card-held` is the state it settles
      // into. The punch used to be the whole press, so once its 300 ms were up the
      // card a finger was still resting on looked exactly like a card nobody had
      // touched — 215 ms of that, until HOLD_LIFT_MS finally put the ghost in the
      // hand. The held class comes off on the pointerup/pointercancel that ends
      // this press and not before, so there is no frame in which a pressed card
      // looks untouched.
      playFx(cardEl, 'card-squash')
      holdCard(cardEl, e.pointerId)
      // The audible half, in the same millisecond as the finger: the same tiny
      // tick every other touch on the screen gets. The coupling clunk is not here
      // for exactly the same reason the green flood is not.
      playTick()
    } else {
      refuse()
    }
  }

  return (
    // The feedback lives on the card body itself, not on an inner box: the
    // refusal has to recolour the thing the child actually pressed, at full
    // opacity, or the commonest answer in the game is also the faintest.
    <div
      ref={ref}
      data-touchable
      data-card={cardId}
      data-spotlight={spotlight ? 'true' : 'false'}
      onPointerDown={handlePointerDown}
      /* Only the card body's own animation may clear the feedback class. The
         accept's fill and ring are pseudo-elements on this same card and they
         report their end through this handler too; letting one of those clear the
         class would cut the other two short. */
      onAnimationEnd={(e) => {
        if (e.target === ref.current && e.pseudoElement === '') clearFx(ref.current)
      }}
      /* Constant className on purpose: a re-render caused by this very press would
         rewrite a conditional className and wipe the feedback class off the element
         mid-animation. */
      className="palette-card rounded-2xl touch-none select-none cursor-pointer flex items-center justify-center"
      /* Fill, rim and shadow deliberately NOT inline: the refusal animates the
         card's own background-color, and an inline background would outrank it. */
      style={{ padding: 8, minWidth: cardMinW, minHeight: cardMinH }}
    >
      <div className="card-icon w-full h-full rounded-2xl flex items-center justify-center pointer-events-none">
        <Icon size={iconSize} />
      </div>
    </div>
  )
}

/**
 * Memoised on purpose. Placing an item re-renders the palette, and re-rendering
 * all nine cards in the same task as the press is what used to freeze the main
 * thread through the whole accept animation. Every prop here is either stable for
 * the life of the screen or a boolean that genuinely changed, so an accept now
 * re-renders only the cards whose meaning changed.
 */
const PaletteCard = memo(PaletteCardBase)

interface Props {
  trainItems: KeyedTrainItem[]
  /**
   * The round. It decides which cards exist at all: the level's data says how
   * many wagon types a round may offer and whether they are drawn carrying their
   * load, and the task carries the resulting set. Nothing here picks or hardcodes
   * it — the palette only lays out what the round hands it.
   */
  task: Task
  maxWagons: number
  onPress: PalettePress
  /**
   * The authoritative placement rule — the same one `addToTrain` applies, read
   * live rather than off the frame the palette happens to be showing. Used by the
   * refusal to decide which card the "this one instead" jump may land on: pointing
   * at a card that would itself be refused turns a helpful signpost into a second
   * dead end. It knows the round's count and nothing else about the round, so the
   * jump can say "there is still room, try a wagon" without ever saying which
   * wagon is right.
   */
  canPlace: (item: TrainItem) => boolean
  /**
   * The train is RIGHT — the go button will accept it — so the go button really is
   * the only thing left to do. Read live, inside the pointer event: this is the one
   * condition that may nod at the go button, and answering it off a stale render
   * would nod at the wrong moment.
   */
  isRightNow: () => boolean
  /** The authoritative train, for a refusal that must not answer from a stale frame. */
  liveTrain: () => KeyedTrainItem[]
  /** The train is right: no card is the answer, so the go button is. */
  popGo: () => void
  /**
   * There is a load on the rails and the train is still not the one that was asked
   * for. A STATE, not the tail of a refusal, and that is the whole point of it.
   *
   * A settled full-but-wrong train used to be a dead-still screen: measured at
   * counts 1, 3 and 10, the only animated element in the document was a cloud. The
   * breathing hole on the rails is gone once the train is full — at count 1 it never
   * exists at all, because the train is full at the first wagon — and the row hop
   * was only ever the second half of a refusal, so the child had to repeat his
   * mistake to be shown where to look. Now the pointer runs off the state itself.
   *
   * It moves the wagon row as a row, type-neutrally, and never one card: with a
   * wrong load standing on the rails the single nearest legal card is either the
   * child's own mistake or the answer handed to him, and the game may say neither.
   */
  loadUnsettled: boolean
  isTablet?: boolean
}

export function DragPalette({ trainItems, task, maxWagons, onPress, popGo, canPlace, isRightNow, liveTrain, loadUnsettled, isTablet = false }: Props) {
  const locoRowRef = useRef<HTMLDivElement>(null)
  const wagonRowRef = useRef<HTMLDivElement>(null)

  /**
   * The cards this round actually offers.
   *
   * Level 1 used to show all three engines and all six wagon types however small
   * the task was, which made the wagon a one-in-six guess and then switched five
   * of the six plates off the moment one was placed — most of the screen dead,
   * and a refusal firing five times out of six. Fewer, better-chosen cards is the
   * fix, so the row is the wagon the task needs plus the distractors the level
   * asked for, and each of them is drawn carrying its own load while the level
   * says so.
   */
  const locos = useMemo(
    () => LOCOMOTIVES.filter((l) => task.locomotiveIds.includes(l.id)),
    [task.locomotiveIds],
  )
  const wagons = useMemo(
    // Seat order comes from the task, for the same reason as the world dock: the
    // round shuffles the seats so the answer is not always in the same place, and
    // filtering the canonical WAGONS list would discard that.
    () => task.wagonTypeIds
      .map((id) => WAGONS.find((w) => w.type === id))
      .filter((w): w is (typeof WAGONS)[number] => w !== undefined)
      .map((w) => ({
        type: w.type,
        icon: wagonIcon(w.type, task.cargoHints ? cargoShownOnWagon(w.type, task.cargo) : null),
      })),
    [task.wagonTypeIds, task.cargoHints, task.cargo],
  )

  /**
   * Which cards look alive is repainted one beat behind the press. Going grey
   * means recolouring five card bodies and desaturating five pictures, and doing
   * that inside the same task as the pointerdown stole the frames the accept
   * animation needed. Deferring it costs nothing that matters: nobody is deciding
   * anything from these pixels — every accept/refuse decision is taken from the
   * live train in `canAdd`, synchronously, at press time.
   */
  const shownItems = useDeferredValue(trainItems)

  /**
   * Live values for the refusal, which must not answer from a stale frame. Kept in
   * a ref so the refusal handler can stay one stable function for the life of the
   * screen: it is a prop of nine memoised cards, and a new closure per render would
   * re-render every one of them on every placement. Written after commit, which is
   * always before the next pointer event can be dispatched.
   */
  const liveRef = useRef({ canPlace, isRightNow, liveTrain })
  useEffect(() => {
    liveRef.current = { canPlace, isRightNow, liveTrain }
  }, [canPlace, isRightNow, liveTrain])

  /**
   * "This one instead." A refusal in this game always answers two things — "not
   * that" on the card the finger is on, and "here" somewhere else — and this is the
   * second half.
   *
   * What can still be refused is now a very short list, because a wagon of a
   * different load is a change of mind and is always taken: only the same engine
   * again, and the same wagon type when the train already holds the number the round
   * asked for. So there are exactly three honest destinations, in this order:
   *
   *   1. the train is RIGHT — pressing the go button is genuinely the only thing
   *      left, so the button pops. This branch used to read "the train is FULL",
   *      which is a different sentence: a full train of the wrong wagons sent the
   *      child to a button that was about to refuse him, in the same frame as the
   *      one correct card on the screen turned red.
   *   2. the train has no engine — the engine row can always answer, because every
   *      engine the round offers is a right answer and nodding at one cannot
   *      endorse a mistake.
   *   3. otherwise the load is what is unfinished or wrong, and the honest answer
   *      is "choose one of these" — so the wagon ROW nods as a row. Never one wagon
   *      card: with a wrong load standing on the rails, the single nearest legal
   *      card is either the child's own mistake or the answer handed to him, and
   *      the game is not allowed to say either.
   */
  const popLegal = useCallback((refusedCard: HTMLElement) => {
    const { canPlace: place, isRightNow: right, liveTrain: train } = liveRef.current
    // Its own sound, on purpose: "this one instead" must not be audibly confusable
    // with the refusal's sag, the accept's clunk or the swap. Two rising taps.
    playPoint()
    if (right()) {
      popGo()
      return
    }
    if (placedLoco(train()) === undefined) {
      /**
       * Placeable now, by the same rule the placement itself uses, read live rather
       * than off the frame the palette happens to be showing: pointing at a card
       * that would itself be refused turns a signpost into a second dead end.
       */
      const targets = Array.from(
        locoRowRef.current?.querySelectorAll<HTMLElement>('[data-card]') ?? [],
      ).filter((el) => {
        const item = itemForCardId(el.dataset.card ?? '')
        return item !== undefined && place(item)
      })
      if (targets.length > 0) {
        // Exactly one card, never a row of them, and the nearest one: the eye
        // travels the shortest possible distance from the finger to the thing it
        // should have pressed.
        const rr = refusedCard.getBoundingClientRect()
        const cx = rr.left + rr.width / 2
        const cy = rr.top + rr.height / 2
        let best = targets[0]
        let bestDist = Infinity
        for (const el of targets) {
          const r = el.getBoundingClientRect()
          const d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy)
          if (d < bestDist) {
            bestDist = d
            best = el
          }
        }
        playFx(best, 'attn-yes')
        return
      }
    }
    // The load is the thing to change, and which load is the child's decision. The
    // whole row hops once — one motion, no hue, no single card singled out.
    const row = wagonRowRef.current
    if (row !== null) {
      row.classList.remove('row-attn')
      void row.offsetWidth
      row.classList.add('row-attn')
    }
    // Stable identity: this is a prop of nine memoised cards, and a new closure
    // on every render would re-render all of them on every placement.
  }, [popGo])

  /**
   * Which engine cards the game would take if pressed right now, by the exact rule
   * that decides it — `canAddToTrain`, the one `addToTrain` runs.
   *
   * It no longer changes how a card *looks*, and that is this round's fix. Three
   * versions of that lied or broke in turn. Painted off the level's ceiling it was
   * too loose: on a one-wagon round the card the child had just used kept its white
   * panel and answered the next tap with red. Painted off the task's wagon type it
   * was too tight: one bright card per round, always the right one, so the palette
   * answered the round and the cargo drawn on the wagons became decoration. Painted
   * off the count alone it was honest and still wrong, because it was *painted*: a
   * fresh level-3 round put five of six wagon cards on screen as flat desaturated
   * plates the moment a wagon was placed, and to a four-year-old a screen of
   * switched-off objects reads as a broken game. The reference never shows a
   * disabled control — every animal on the platform can be touched, and touching
   * one that cannot board simply answers.
   *
   * So every card keeps its white panel, its rim and its full-colour picture at all
   * times, engines and wagons alike. This boolean now feeds exactly one thing —
   * whether the engine row has anything to breathe at — and the wagon row has no
   * equivalent at all, for the reason set out on the `spotlight` prop above. When the
   * train is full nothing here dims: the invitation moves to the go button, and a
   * card pressed anyway gets the refusal, which is a real answer and arrives in the
   * same frame as the finger.
   */
  const locoAvailable = useMemo(
    () => locos.map((l) => canAddToTrain(shownItems, LOCO_ITEMS[l.id], maxWagons)),
    [shownItems, maxWagons, locos],
  )

  const locoAvail = locoAvailable.filter(Boolean).length
  const shownNeedLoco = placedLoco(shownItems) === undefined
  /**
   * The locomotive row breathes while the train has no engine.
   *
   * It used to carry `&& locoAvail * 2 < locos.length` as well — "and only while
   * the placeable engines are a minority of their row" — which was dead code
   * pretending to be a feature. Whenever `shownNeedLoco` is true every engine the
   * round offers is placeable, so `locoAvail === locos.length` and `2N < N` is
   * false for every N: measured `data-spotlight="false"` on every card at round
   * start on all three levels, under a comment claiming the row kept its breathe.
   *
   * The condition it wanted is the honest one and it is now the whole of it: no
   * engine on the rails, and at least one engine card that would be taken if
   * pressed. The minority clause existed to stop a whole row breathing at once,
   * and here that reason does not apply — every engine the round offers is a right
   * answer, so all of them moving says "an engine goes here", which is true, and
   * cannot point at a mistake. The engine's own bay on the rails breathes in the
   * same moment (`data-slot-next` in TrackZone), so the pair reads as one sentence.
   * The instant an engine is coupled this goes false and stays false for the round.
   */
  const locoSpot = shownNeedLoco && locoAvail > 0

  /* How big the offered vehicles are drawn, and how big the plate around them is. */
  const locoDisplay  = isTablet ? 120 : 86
  const locoDrag     = isTablet ? 134 : 96
  const wagonDisplay = isTablet ? 98 : 70
  const wagonDrag    = isTablet ? 112 : 80
  const cardMinW     = isTablet ? 130 : 92
  const cardMinH     = isTablet ? 106 : 76

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Locomotives row. */}
      <div ref={locoRowRef} className="flex gap-3 justify-center flex-wrap">
        {locos.map((loco, i) => {
          const available = locoAvailable[i]
          return (
            <PaletteCard
              key={loco.id}
              item={LOCO_ITEMS[loco.id]}
              Icon={loco.icon}
              iconSize={locoDisplay}
              dragSize={locoDrag}
              spotlight={available && locoSpot}
              cardMinW={cardMinW}
              cardMinH={cardMinH}
              cardId={`${LOCO_PREFIX}${loco.id}`}
              onPress={onPress}
              popLegal={popLegal}
            />
          )
        })}
      </div>

      {/* Divider between the two rows. */}
      <div className="flex items-center gap-2">
        <div className="h-px w-10" style={{ background: t.panelEdge }} />
        <div className="rounded-full" style={{ width: 6, height: 6, background: t.inkSoft, opacity: 0.5 }} />
        <div className="h-px w-10" style={{ background: t.panelEdge }} />
      </div>

      {/* Wagons row. */}
      <div
        ref={wagonRowRef}
        /* The row nod is a one-shot: it comes off when it ends, so the next refusal
           can restart it. Gated by name — every card's own animation bubbles up
           through here as well. */
        onAnimationEnd={(e) => {
          if (e.animationName === 'row-attn') wagonRowRef.current?.classList.remove('row-attn')
        }}
        className="flex justify-center"
      >
        {/* Two nested rows on purpose, and it is not decoration: the refusal's
            one-shot nod (`row-attn`) and the standing "the load is the thing to
            change" hint (`row-hint`) both animate a row's transform, and one
            `animation` property cannot hold both. The outer row owns the one-shot,
            the inner one owns the standing hint, so a refusal still nods at full
            strength while the hint is running and neither cuts the other short. */}
        <div
          className={`flex gap-2 justify-center flex-wrap${loadUnsettled ? ' row-hint' : ''}`}
        >
          {wagons.map((wagon) => {
            return (
              <PaletteCard
                key={wagon.type}
                item={WAGON_ITEMS[wagon.type]}
                Icon={wagon.icon}
                iconSize={wagonDisplay}
                dragSize={wagonDrag}
                /* No `spotlight` on purpose — see the prop's own note. */
                cardMinW={cardMinW}
                cardMinH={cardMinH}
                cardId={`${WAGON_PREFIX}${wagon.type}`}
                onPress={onPress}
                popLegal={popLegal}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
