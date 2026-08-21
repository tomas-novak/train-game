import { useId } from 'react'
import type { FC } from 'react'
import type { TrainIcon } from '../types'
import { SKY, WORLD_STOCK } from '../theme'
import type { SkyTheme } from '../theme'
import { readMode } from '../utils/mode'

/**
 * Which set of paints these drawings use when nobody hands them one.
 *
 * Every component in this file already took an optional theme (`t`) and fell
 * back to `SKY`; nothing in the app has ever passed one, so `SKY` was the train.
 * The screen the train stands in is now one of two, decided once from the URL, so
 * the fallback is decided the same way and in the same place: pastel stock on the
 * classic pale-grey screen, saturated stock on the world's green field. See
 * `WORLD_STOCK` in theme.ts for why the world needs its own — round 1's train
 * measured quieter than the field it stood in, and the gate says it must be the
 * loudest thing in the frame.
 *
 * Read at module load, exactly like the mode itself: a mode change is a reload,
 * so no component here has to be able to switch paints while it is running, and
 * the palette card, the flying copy and the wagon on the rails are guaranteed to
 * be the same drawing in the same colours because they are the same component
 * reading the same constant.
 */
const BASE = readMode() === 'world' ? (WORLD_STOCK as unknown as SkyTheme) : SKY

/**
 * Whether the rolling stock casts anything: 1 in classic, 0 in the world.
 *
 * The reference has no drop shadow anywhere, in any frame, and roadmap E1 bans
 * them. The scene has none. The train had two — a soft ellipse under the
 * footplate and a dark smudge under every wheel, both measurable at 3.4x — and
 * they were on the one object the frame is now built around. So in world mode
 * their alpha is multiplied out to nothing. Read at module load exactly like
 * `BASE`, because a mode change is a reload.
 */
const CAST = readMode() === 'world' ? 0 : 1

// ── shared atoms ──────────────────────────────────────────────────────────────

const Wheel: FC<{ cx: number; cy: number; r?: number; wheel: string; wheelHub: string }> = ({
  cx, cy, r = 8, wheel, wheelHub,
}) => (
  <g>
    <circle cx={cx} cy={cy + 1.2} r={r} fill={`rgba(0,0,0,${0.18 * CAST})`} />
    <circle cx={cx} cy={cy} r={r} fill={wheel} />
    <circle cx={cx} cy={cy - r * 0.25} r={r * 0.55} fill="rgba(255,255,255,0.12)" />
    <circle cx={cx} cy={cy} r={r * 0.35} fill={wheelHub} />
    <circle cx={cx} cy={cy} r={r * 0.15} fill="rgba(0,0,0,0.4)" />
  </g>
)

const GroundShadow: FC<{ y?: number; w?: number; opacity?: number }> = ({
  y = 64, w = 110, opacity = 0.18,
}) => (
  <ellipse cx={w / 2} cy={y} rx={w * 0.42} ry={2.5} fill={`rgba(0,0,0,${opacity * CAST})`} />
)

/**
 * The engine's face — world mode only, and roadmap E2 asked for it by name.
 *
 * "There is no face anywhere" was a third of the whole-screen verdict, and the
 * reason it matters is not decoration: every payload and every driver in the
 * reference is a specific creature with two eyes and a smile
 * (blind/sago-trains-01 has a bird driving, -04 a cow, a skunk, a robot and a
 * rabbit riding, frames-clean/frame-095 four animals on the ledge), and that is
 * what a four-year-old looks at and wants. Our locomotive was a machine with a
 * lamp on it.
 *
 * Two flat ink eyes with one highlight each, and for the engine with room for it a
 * smile. No stroke around anything, no gradient, no shadow: the same rules the
 * rest of the world scene is built to. It is drawn inside each engine's mirrored
 * group, so only mirror-safe shapes are used — the pair is symmetric about `cx`
 * and the highlights simply come out on the other side of each eye, which is still
 * a highlight.
 *
 * Classic renders nothing at all here: the control screen's train is the drawing
 * that won its own round and is not touched.
 */
const FACE = readMode() === 'world'
const FACE_INK = '#2c1a0d'

const Face: FC<{ cx: number; cy: number; gap: number; r: number; smile?: string }> = ({
  cx, cy, gap, r, smile,
}) => {
  if (!FACE) return null
  return (
    <g>
      <circle cx={cx - gap / 2} cy={cy} r={r} fill={FACE_INK} />
      <circle cx={cx + gap / 2} cy={cy} r={r} fill={FACE_INK} />
      <circle cx={cx - gap / 2 + r * 0.32} cy={cy - r * 0.34} r={r * 0.32} fill="#ffffff" />
      <circle cx={cx + gap / 2 + r * 0.32} cy={cy - r * 0.34} r={r * 0.32} fill="#ffffff" />
      {smile !== undefined && (
        <path d={smile} fill="none" stroke={FACE_INK} strokeWidth={2.4} strokeLinecap="round" />
      )}
    </g>
  )
}

// ── LOCOMOTIVES ───────────────────────────────────────────────────────────────

export const SteamLoco: FC<TrainIcon> = ({ size = 100, t }) => {
  const raw = useId()
  const id = raw.replace(/[^a-zA-Z0-9_-]/g, '')
  const s = (t ?? BASE).steam as SkyTheme['steam']
  return (
    <svg viewBox="0 0 140 76" width={size} height={(size * 76) / 140} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.body[0]} />
          <stop offset="1" stopColor={s.body[1]} />
        </linearGradient>
        <linearGradient id={`c${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.cab[0]} />
          <stop offset="1" stopColor={s.cab[1]} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={140} />
      <g transform="translate(140,0) scale(-1,1)">
        <rect x="6" y="58" width="128" height="6" rx="2" fill={s.plate} />
        <path d="M6,24 Q6,18 12,18 L42,18 L42,58 L6,58 Z" fill={`url(#c${id})`} />
        <rect x="8" y="20" width="32" height="4" fill={s.cabHi} opacity={0.5} />
        <rect x="11" y="28" width="13" height="12" rx="2.5" fill={s.window} />
        <rect x="26" y="28" width="13" height="12" rx="2.5" fill={s.window} />
        <rect x="11" y="28" width="13" height="3" fill={s.windowFrame} opacity={0.25} />
        <rect x="26" y="28" width="13" height="3" fill={s.windowFrame} opacity={0.25} />
        <rect x="38" y="28" width="74" height="30" rx="9" fill={`url(#b${id})`} />
        <rect x="40" y="29" width="68" height="5" rx="2.5" fill={s.boilerHi} opacity={0.55} />
        <ellipse cx="112" cy="44" rx="13" ry="15" fill={s.body[1]} />
        <circle cx="112" cy="44" r="9" fill={s.body[0]} opacity={0.35} />
        <ellipse cx="64" cy="27" rx="9" ry="7" fill={`url(#b${id})`} />
        <ellipse cx="64" cy="24" rx="6" ry="2.5" fill={s.boilerHi} opacity={0.7} />
        <rect x="92" y="10" width="10" height="22" rx="2" fill={s.chimney} />
        <ellipse cx="97" cy="11" rx="7" ry="2.2" fill={s.chimney} />
        <circle cx="93" cy="6" r="5.5" fill={s.steam} opacity={0.95} />
        <circle cx="103" cy="3" r="4.5" fill={s.steam} opacity={0.8} />
        <circle cx="112" cy="6" r="3.8" fill={s.steam} opacity={0.6} />
        <circle cx="123" cy="44" r="6" fill={s.head} />
        <circle cx="123" cy="44" r="3.5" fill="#fff" opacity={0.85} />
        <Wheel cx={20} cy={64} r={8.5} wheel={s.wheel} wheelHub={s.wheelHub} />
        <Wheel cx={56} cy={64} r={11.5} wheel={s.wheel} wheelHub={s.wheelHub} />
        <Wheel cx={82} cy={64} r={10} wheel={s.wheel} wheelHub={s.wheelHub} />
        <Wheel cx={108} cy={64} r={7} wheel={s.wheel} wheelHub={s.wheelHub} />
        <rect x="22" y="62" width="92" height="3.5" rx="1.5" fill={s.plate} opacity={0.7} />
        {/* The smokebox door is already a round face plate at the front of the
            engine, so the face goes on it and needs nothing added to carry it. */}
        <Face cx={112} cy={40} gap={13} r={4.4} smile="M105,49 Q112,55 119,49" />
      </g>
    </svg>
  )
}

export const ElectricLoco: FC<TrainIcon> = ({ size = 100, t }) => {
  const raw = useId()
  const id = raw.replace(/[^a-zA-Z0-9_-]/g, '')
  const s = (t ?? BASE).electric as SkyTheme['electric']
  return (
    <svg viewBox="0 0 140 76" width={size} height={(size * 76) / 140} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.body[0]} />
          <stop offset="1" stopColor={s.body[1]} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={140} />
      <g transform="translate(140,0) scale(-1,1)">
        <path d="M10,24 Q10,18 18,18 L122,18 Q132,22 132,38 Q132,54 122,58 L10,58 Z" fill={`url(#b${id})`} />
        <path d="M122,18 Q132,22 132,38 Q132,54 122,58 Z" fill={s.nose} />
        <rect x="14" y="19" width="106" height="4" rx="2" fill={s.bodyHi} opacity={0.55} />
        <rect x="6" y="45" width="124" height="7" fill={s.stripe} />
        <rect x="6" y="45" width="124" height="2" fill="#fff" opacity={0.25} />
        <path d="M114,24 Q124,26 126,36 L114,36 Z" fill={s.window} />
        <rect x="114" y="24" width="12" height="2" fill={s.windowFrame} opacity={0.4} />
        {([12, 28, 44, 60, 76, 92] as number[]).map((x, i) => (
          <rect key={i} x={x} y={24} width={12} height={11} rx={2} fill={s.window} />
        ))}
        <line x1="42" y1="18" x2="36" y2="9" stroke={s.pan} strokeWidth="2" strokeLinecap="round" />
        <line x1="42" y1="18" x2="48" y2="9" stroke={s.pan} strokeWidth="2" strokeLinecap="round" />
        <rect x="34" y="6" width="16" height="3.5" rx="1.5" fill={s.pan} />
        <line x1="76" y1="18" x2="70" y2="9" stroke={s.pan} strokeWidth="2" strokeLinecap="round" />
        <line x1="76" y1="18" x2="82" y2="9" stroke={s.pan} strokeWidth="2" strokeLinecap="round" />
        <rect x="68" y="6" width="16" height="3.5" rx="1.5" fill={s.pan} />
        <line x1="0" y1="6.5" x2="140" y2="6.5" stroke={s.panRail} strokeWidth="0.8" opacity={0.5} />
        <circle cx="128" cy="40" r="4" fill={s.head} />
        <circle cx="128" cy="40" r="2" fill="#fff" opacity={0.9} />
        <rect x="12" y="56" width="32" height="4" rx="2" fill={s.windowFrame} opacity={0.5} />
        <Wheel cx={20} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
        <Wheel cx={36} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
        <rect x="92" y="56" width="32" height="4" rx="2" fill={s.windowFrame} opacity={0.5} />
        <Wheel cx={100} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
        <Wheel cx={116} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
        {/* Behind the cab glass, which is where a face belongs on an engine with
            no smokebox door to put one on. */}
        <Face cx={120} cy={30} gap={7} r={2.9} />
      </g>
    </svg>
  )
}

export const DieselLoco: FC<TrainIcon> = ({ size = 100, t }) => {
  const raw = useId()
  const id = raw.replace(/[^a-zA-Z0-9_-]/g, '')
  const s = (t ?? BASE).diesel as SkyTheme['diesel']
  return (
    <svg viewBox="0 0 140 76" width={size} height={(size * 76) / 140} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.body[0]} />
          <stop offset="1" stopColor={s.body[1]} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={140} />
      <g transform="translate(140,0) scale(-1,1)">
        <rect x="6" y="26" width="124" height="32" rx="4" fill={`url(#b${id})`} />
        <rect x="8" y="27" width="120" height="4" rx="2" fill={s.bodyHi} opacity={0.55} />
        <path d="M112,26 Q130,30 130,42 Q130,54 112,58 Z" fill={s.nose} />
        <rect x="6" y="40" width="124" height="6" fill={s.stripe} opacity={0.9} />
        <rect x="24" y="14" width="44" height="44" rx="3" fill={`url(#b${id})`} />
        <rect x="25" y="15" width="42" height="4" rx="2" fill={s.bodyHi} opacity={0.55} />
        <rect x="27" y="18" width="18" height="13" rx="2.5" fill={s.window} />
        <rect x="48" y="18" width="17" height="13" rx="2.5" fill={s.window} />
        <rect x="27" y="18" width="18" height="3" fill={s.windowFrame} opacity={0.25} />
        <rect x="48" y="18" width="17" height="3" fill={s.windowFrame} opacity={0.25} />
        {([0, 11, 22] as number[]).map((off) => (
          <rect key={off} x={9 + off} y={30} width={7} height={8} rx={1.5} fill={s.grille} opacity={0.85} />
        ))}
        <rect x="36" y="6" width="9" height="12" rx="2" fill={s.grille} />
        <ellipse cx="40.5" cy="7" rx="5.5" ry="2" fill={s.grille} />
        <circle cx="38" cy="2" r="4" fill={s.smoke} opacity={0.7} />
        <circle cx="46" cy="0" r="3" fill={s.smoke} opacity={0.55} />
        <circle cx="123" cy="38" r="4" fill={s.head} />
        <circle cx="123" cy="38" r="2.2" fill="#fff" opacity={0.9} />
        <rect x="10" y="56" width="34" height="4" rx="2" fill={s.grille} opacity={0.6} />
        <Wheel cx={18} cy={64} r={8} wheel={s.wheel} wheelHub={s.bodyHi} />
        <Wheel cx={36} cy={64} r={8} wheel={s.wheel} wheelHub={s.bodyHi} />
        <rect x="88" y="56" width="34" height="4" rx="2" fill={s.grille} opacity={0.6} />
        <Wheel cx={96} cy={64} r={8} wheel={s.wheel} wheelHub={s.bodyHi} />
        <Wheel cx={114} cy={64} r={8} wheel={s.wheel} wheelHub={s.bodyHi} />
        {/* On the nose, above the headlamp — which then reads as the nose of the
            face rather than as a fitting, and no smile is needed to say so. */}
        <Face cx={122} cy={31} gap={9} r={3.4} />
      </g>
    </svg>
  )
}

// ── WAGON LOADS ───────────────────────────────────────────────────────────────
//
// What the child actually reads. The wagons used to be empty shells, so the game
// asked him to know that milk belongs in the round one and coal in the
// open-topped one — a category he has no name for and cannot hold in his head.
// Every load below is instead the SAME specific object the task shows him: the
// milk task draws a milk bottle, and the tank wagon carries that same milk
// bottle. Matching a picture to a picture is something a four-year-old can do
// with no instruction at all.
//
// Drawn the way the reference draws a payload: one nameable everyday object per
// wagon, big (60-80% of the opening), flat, no strokes, and sitting in or on the
// wagon rather than hovering over it.

/** Coal: a heap of angular near-black lumps mounded over the hopper rim. */
function coalLoad(s: SkyTheme['coal']) {
  return (
    <g>
      <polygon points="9,23 17,12 26,16 35,5 46,11 56,3 66,12 76,8 85,15 91,23" fill={s.a} />
      <polygon points="14,23 21,11 30,15 27,23" fill={s.b} />
      <polygon points="32,23 40,6 50,12 47,23" fill={s.c} />
      <polygon points="52,23 59,4 68,11 65,23" fill={s.b} />
      <polygon points="69,23 77,9 86,16 83,23" fill={s.c} />
      <polygon points="21,12 27,15 24,18 18,16" fill={s.hi} opacity={0.55} />
      <polygon points="40,7 48,12 43,16 37,12" fill={s.hi} opacity={0.5} />
      <polygon points="59,5 67,11 62,15 56,10" fill={s.hi} opacity={0.55} />
      <polygon points="77,10 85,16 80,19 74,15" fill={s.hi} opacity={0.5} />
    </g>
  )
}

/** Sand: a smooth bright dune, the shape opposite of coal so the two never blur. */
function sandLoad(s: SkyTheme['sand']) {
  return (
    <g>
      <path d="M8,23 Q26,8 50,5 Q74,8 92,23 Z" fill={s.b} />
      <path d="M8,23 Q26,8 50,5 Q58,14 55,23 Z" fill={s.a} />
      <path d="M26,23 Q34,10 50,6 Q52,13 44,23 Z" fill={s.hi} opacity={0.75} />
      {([[22, 18], [34, 14], [46, 11], [58, 14], [70, 18], [80, 20], [40, 19]] as [number, number][]).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.3} fill={s.dot} opacity={0.65} />
      ))}
    </g>
  )
}

/**
 * Milk: a crate of white bottles standing on the crown of the tank.
 *
 * The hard constraint here is the wagon underneath. The barrel spans y24-52 in
 * this frame, and the level-3 card the child must eventually recognise is that
 * bare barrel with a dome on it. Two earlier versions painted the load — a
 * bottle, then a crate on a navy cradle bar — straight across the cylinder, so
 * the loaded tank read as "bottles on a grey flatbed" and the one shape he has
 * to carry forward was the one shape level 1 never showed him. So every mark
 * below sits at y <= 24: nothing opaque, and above all no dark horizontal bar,
 * ever touches the barrel. Loaded and empty tank share one body.
 *
 * The bottles are white on a white card, so each one gets a navy rim of its own
 * and stands in a strong blue crate — the reference's basket-of-apples trick,
 * where a saturated container is what makes a pale payload nameable.
 */
function milkLoad(s: SkyTheme['milk']) {
  const bottle = (w: number, sy: number, nw: number, topY: number) => (cx: number) =>
    `M${cx - w},24 L${cx - w},${sy} Q${cx - w},${sy - 5} ${cx - nw},${sy - 5.6} L${cx - nw},${topY} L${cx + nw},${topY} L${cx + nw},${sy - 5.6} Q${cx + w},${sy - 5} ${cx + w},${sy} L${cx + w},24 Z`
  const rim = bottle(7.2, 12.4, 4.5, 1.8)
  const body = bottle(5.4, 12.8, 2.9, 3.4)
  const bottles = [36, 50, 64]
  return (
    <g>
      {bottles.map((cx) => (
        <path key={`r${cx}`} d={rim(cx)} fill={s.rim} />
      ))}
      {bottles.map((cx) => (
        <g key={`b${cx}`}>
          <path d={body(cx)} fill={s.bottle} />
          <rect x={cx - 3.3} y={3.6} width={6.6} height={3.8} rx={1.2} fill={s.cap} />
        </g>
      ))}
      {/* the crate, sitting on the crown of the barrel and no lower */}
      <rect x="22.5" y="13.4" width="55" height="3.8" rx="1.8" fill={s.rim} />
      <rect x="24" y="16.6" width="52" height="7.4" fill={s.crate} />
      <rect x="24" y="16.6" width="52" height="2.2" fill={s.crateHi} />
      <rect x="41" y="16.6" width="2.6" height="7.4" fill={s.rim} opacity={0.5} />
      <rect x="56.4" y="16.6" width="2.6" height="7.4" fill={s.rim} opacity={0.5} />
    </g>
  )
}

/**
 * Fuel: a red jerrycan — handle, spout, X-braced panel — standing on the crown
 * of the tank, under the same y <= 24 rule as the milk crate.
 *
 * It used to be a dusty-rose drum with a cream diagonal-striped band across the
 * top, which a critic reading the card blind called a layer cake. A jerrycan is
 * the one fuel object with a silhouette of its own.
 */
function fuelLoad(s: SkyTheme['fuel']) {
  return (
    <g>
      <rect x="40" y="1.4" width="20" height="3.6" rx="1.8" fill={s.canDark} />
      <rect x="40" y="3.4" width="4.4" height="5" fill={s.canDark} />
      <rect x="55.6" y="3.4" width="4.4" height="5" fill={s.canDark} />
      <rect x="62" y="3.6" width="7.5" height="6.4" rx="2.2" fill={s.cap} />
      <rect x="66" y="6.4" width="6" height="3.4" rx="1.7" fill={s.cap} />
      <rect x="31" y="7.4" width="38" height="16.6" rx="3" fill={s.can} />
      <rect x="31" y="7.4" width="38" height="3" rx="1.5" fill={s.canHi} />
      <rect x="33.5" y="10.6" width="4" height="13.4" fill={s.canHi} opacity={0.55} />
      <line x1="37" y1="11.4" x2="63" y2="22" stroke={s.canDark} strokeWidth="2.8" />
      <line x1="63" y1="11.4" x2="37" y2="22" stroke={s.canDark} strokeWidth="2.8" />
    </g>
  )
}

/**
 * Apples: one red and one green apple over the rim of a woven basket, filling
 * the open door of the box wagon. Straight off the reference, which sets a
 * basket of exactly two fully saturated apples in the box wagon's opening.
 *
 * The previous pass drew two desaturated salmon circles on a mid-brown wall with
 * the leaf riding up over the roof beam, and a critic could not name it. Now the
 * doorway behind is the darkest brown in the palette, the apples are saturated
 * and of two different colours, and every mark stays inside the opening (y >= 23)
 * so nothing leaks onto the roof.
 */
function applesLoad(s: SkyTheme['apples']) {
  return (
    <g>
      <circle cx="59.5" cy="39" r="7.6" fill={s.greenDark} />
      <circle cx="59.5" cy="39" r="6" fill={s.green} />
      <ellipse cx="57.4" cy="36.6" rx="2" ry="1.9" fill="#fff" opacity={0.4} />
      <path d="M43,28 Q44.6,26.4 45.8,26" stroke={s.stem} strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="50" cy="27.4" rx="5" ry="2.6" fill={s.leaf} transform="rotate(14 50 27.4)" />
      <circle cx="43" cy="37.5" r="10.4" fill={s.redDark} />
      <circle cx="43" cy="37.5" r="8.6" fill={s.red} />
      <ellipse cx="39.4" cy="34" rx="2.9" ry="2.7" fill={s.hi} opacity={0.8} />
      {/* the basket they sit in */}
      <polygon points="32,44.4 68,44.4 64.2,54.6 35.8,54.6" fill={s.basket} />
      <path d="M33.4,48 L66.6,48 M34.4,51.4 L65.6,51.4" stroke={s.basketDark} strokeWidth="1.4" opacity={0.75} />
      <path d="M42,44.4 L41.2,54.6 M50,44.4 L50,54.6 M58,44.4 L58.8,54.6" stroke={s.basketDark} strokeWidth="1.2" opacity={0.55} />
      <rect x="29.5" y="41.4" width="41" height="4.8" rx="2.4" fill={s.basketDark} />
      <rect x="29.5" y="41.4" width="41" height="1.6" rx="0.8" fill={s.basket} opacity={0.7} />
    </g>
  )
}

/**
 * Parcels: a wrapped present — amber box, red ribbon, red bow — in the box
 * wagon's open door.
 *
 * It used to be two brown boxes in a brown doorway on a brown wagon: a critic
 * reading the card blind saw "a smudge with a pink cross" and the second box was
 * invisible. One box in a colour the wagon never uses, with a bow, is a thing a
 * four-year-old names on sight.
 */
function parcelsLoad(s: SkyTheme['parcels']) {
  return (
    <g>
      <ellipse cx="43.5" cy="28.5" rx="6.4" ry="4.4" fill={s.ribbon} transform="rotate(-18 43.5 28.5)" />
      <ellipse cx="56.5" cy="28.5" rx="6.4" ry="4.4" fill={s.ribbon} transform="rotate(18 56.5 28.5)" />
      <ellipse cx="43.5" cy="28.5" rx="2.6" ry="1.8" fill={s.ribbonDark} opacity={0.5} transform="rotate(-18 43.5 28.5)" />
      <ellipse cx="56.5" cy="28.5" rx="2.6" ry="1.8" fill={s.ribbonDark} opacity={0.5} transform="rotate(18 56.5 28.5)" />
      <rect x="30.5" y="32" width="39" height="8" rx="1.6" fill={s.box} />
      <rect x="30.5" y="32" width="39" height="2.6" rx="1.3" fill={s.boxHi} />
      <rect x="33" y="40" width="34" height="14" rx="1.6" fill={s.box} />
      <rect x="61" y="40" width="6" height="14" fill={s.boxDark} opacity={0.45} />
      <rect x="46.4" y="32" width="7.2" height="22" fill={s.ribbon} />
      <rect x="46.4" y="32" width="2.2" height="22" fill={s.ribbonDark} opacity={0.35} />
      <circle cx="50" cy="30" r="3.4" fill={s.ribbonDark} />
    </g>
  )
}

/** Cars: the same blue car the task shows, parked on the flat deck. */
function carsLoad(s: SkyTheme['cars']) {
  return (
    <g>
      <path d="M26,32 Q30,17 39,16 L59,16 Q68,18 72,32 Z" fill={s.bodyDark} />
      <path d="M31,31 Q34,21 40,20 L48,20 L48,31 Z" fill={s.window} />
      <path d="M52,20 L58,20 Q64,22 67,31 L52,31 Z" fill={s.window} opacity={0.85} />
      <rect x="14" y="30" width="72" height="13" rx="5" fill={s.body} />
      <rect x="14" y="30" width="72" height="3" rx="1.5" fill={s.window} opacity={0.35} />
      <ellipse cx="84" cy="34" rx="3" ry="2.6" fill={s.head} />
      <circle cx="28" cy="43" r="6" fill={s.wheel} />
      <circle cx="28" cy="43" r="2.6" fill={s.window} />
      <circle cx="72" cy="43" r="6" fill={s.wheel} />
      <circle cx="72" cy="43" r="2.6" fill={s.window} />
    </g>
  )
}

/** Logs: three stacked trunks with their end grain showing, between the stakes. */
function logsLoad(s: SkyTheme['logs']) {
  const p = { outer: s.outer, mid: s.mid, inner: s.inner, crack: s.crack }
  return (
    <g>
      <LogShape cx={50} cy={41} w={58} h={13} {...p} />
      <LogShape cx={48} cy={30} w={54} h={13} {...p} />
      <LogShape cx={50} cy={20} w={42} h={12} {...p} />
    </g>
  )
}

/** People: passengers leaning out of the coach windows, faces and all. */
function peopleLoad(s: SkyTheme['people']) {
  const riders: { x: number; skin: string; shirt: string }[] = [
    { x: 16, skin: s.skinA, shirt: s.shirtA },
    { x: 48, skin: s.skinB, shirt: s.shirtB },
    { x: 80, skin: s.skinA, shirt: s.shirtB },
  ]
  return (
    <g>
      {riders.map((r) => (
        <g key={r.x}>
          <path d={`M${r.x - 7},40 Q${r.x - 6},33 ${r.x},32 Q${r.x + 6},33 ${r.x + 7},40 Z`} fill={r.shirt} />
          <circle cx={r.x} cy={32} r={6} fill={r.skin} />
          <path d={`M${r.x - 6},30 Q${r.x - 5},25 ${r.x},25 Q${r.x + 5},25 ${r.x + 6},30 Q${r.x + 4},27 ${r.x},27 Q${r.x - 4},27 ${r.x - 6},30 Z`} fill={s.hair} />
          <circle cx={r.x - 2.2} cy={32.4} r={1.1} fill={s.hair} />
          <circle cx={r.x + 2.2} cy={32.4} r={1.1} fill={s.hair} />
        </g>
      ))}
    </g>
  )
}

// ── WAGONS ────────────────────────────────────────────────────────────────────

export const HopperWagon: FC<TrainIcon> = ({ size = 80, t, showCargo }) => {
  const raw = useId()
  const id = raw.replace(/[^a-zA-Z0-9_-]/g, '')
  const sky = t ?? BASE
  const s = sky.hopper as SkyTheme['hopper']
  return (
    <svg viewBox="0 0 100 76" width={size} height={(size * 76) / 100} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.body[0]} />
          <stop offset="1" stopColor={s.body[1]} />
        </linearGradient>
        <linearGradient id={`bi${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.body[1]} stopOpacity={0.85} />
          <stop offset="1" stopColor={s.body[1]} stopOpacity={0.35} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={100} />
      <rect x="4" y="56" width="92" height="5" rx="2" fill={s.body[1]} opacity={0.55} />
      <polygon points="6,22 94,22 84,56 16,56" fill={`url(#b${id})`} />
      <polygon points="12,24 88,24 80,52 20,52" fill={`url(#bi${id})`} />
      <polygon points="12,24 88,24 84,26 16,26" fill={s.body[1]} opacity={0.7} />
      <rect x="4" y="19" width="92" height="5" rx="2" fill={s.bodyHi} opacity={0.95} />
      <rect x="4" y="19" width="92" height="1.5" rx="0.75" fill="#fff" opacity={0.55} />
      <rect x="4" y="34" width="92" height="7" fill={s.stripe} />
      <rect x="4" y="34" width="92" height="2" fill="#fff" opacity={0.3} />
      <rect x="36" y="50" width="28" height="6" rx="2" fill={s.body[1]} />
      {showCargo === 'sand' ? sandLoad(sky.sand) : showCargo === undefined ? null : coalLoad(sky.coal)}
      <Wheel cx={20} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={38} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={62} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={80} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
    </svg>
  )
}

export const TankWagon: FC<TrainIcon> = ({ size = 80, t, showCargo }) => {
  const raw = useId()
  const id = raw.replace(/[^a-zA-Z0-9_-]/g, '')
  const sky = t ?? BASE
  const s = sky.tank as SkyTheme['tank']
  return (
    <svg viewBox="0 0 100 76" width={size} height={(size * 76) / 100} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.bodyHi} />
          <stop offset="0.45" stopColor={s.body[0]} />
          <stop offset="1" stopColor={s.body[1]} />
        </linearGradient>
        <radialGradient id={`cap${id}`} cx="0.35" cy="0.4" r="0.75">
          <stop offset="0" stopColor={s.bodyHi} />
          <stop offset="0.6" stopColor={s.cap} />
          <stop offset="1" stopColor={s.saddle} />
        </radialGradient>
        <linearGradient id={`man${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.bodyHi} />
          <stop offset="1" stopColor={s.cap} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={100} />
      <rect x="4" y="55" width="92" height="6" rx="2" fill={s.saddle} />
      <rect x="4" y="55" width="92" height="1.5" fill="#fff" opacity={0.25} />
      <rect x="0" y="57" width="6" height="3" rx="1" fill={s.saddle} />
      <rect x="94" y="57" width="6" height="3" rx="1" fill={s.saddle} />
      <path d="M14,55 Q14,42 24,40 L34,40 Q44,42 44,55 Z" fill={s.saddle} />
      <path d="M14,55 Q14,42 24,40 L34,40 Q44,42 44,55 Z" fill="#fff" opacity={0.08} />
      <path d="M56,55 Q56,42 66,40 L76,40 Q86,42 86,55 Z" fill={s.saddle} />
      <path d="M56,55 Q56,42 66,40 L76,40 Q86,42 86,55 Z" fill="#fff" opacity={0.08} />
      <rect x="10" y="24" width="80" height="28" rx="14" fill={`url(#b${id})`} />
      <rect x="14" y="26" width="72" height="3.5" rx="1.75" fill="#fff" opacity={0.5} />
      <rect x="14" y="46" width="72" height="3" rx="1.5" fill={s.body[1]} opacity={0.45} />
      <ellipse cx="10" cy="38" rx="6" ry="14" fill={`url(#cap${id})`} />
      <ellipse cx="10" cy="32" rx="3.5" ry="6" fill={s.bodyHi} opacity={0.65} />
      <ellipse cx="90" cy="38" rx="6" ry="14" fill={`url(#cap${id})`} />
      <ellipse cx="90" cy="32" rx="3.5" ry="6" fill={s.bodyHi} opacity={0.65} />
      <rect x="28" y="24" width="2.5" height="28" fill={s.band} opacity={0.85} />
      <rect x="28" y="24" width="0.8" height="28" fill="#fff" opacity={0.45} />
      <rect x="69.5" y="24" width="2.5" height="28" fill={s.band} opacity={0.85} />
      <rect x="69.5" y="24" width="0.8" height="28" fill="#fff" opacity={0.45} />
      <rect x="36" y="22.5" width="28" height="3" rx="1" fill={s.saddle} />
      <rect x="36" y="22.5" width="28" height="1" rx="0.5" fill="#fff" opacity={0.3} />
      {([40, 46, 52, 58] as number[]).map((x) => (
        <circle key={x} cx={x} cy={24} r="0.5" fill={s.band} opacity={0.7} />
      ))}
      {/* The dome and the valve wheel, or — when the wagon is carrying something —
          the load standing in their place, on the crown of the barrel. Both
          loads are authored entirely at y <= 24, so the barrel itself is never
          repainted and the loaded tank keeps the silhouette of the empty one. */}
      {showCargo === undefined ? (
        <>
          <ellipse cx="50" cy="20" rx="9" ry="3" fill={s.saddle} opacity={0.55} />
          <rect x="41" y="14" width="18" height="8" rx="3" fill={`url(#man${id})`} />
          <rect x="41" y="14" width="18" height="2.5" rx="1.25" fill="#fff" opacity={0.55} />
          {([44, 48, 52, 56] as number[]).map((x) => (
            <circle key={x} cx={x} cy="18" r="0.9" fill={s.saddle} />
          ))}
          <ellipse cx="50" cy="13" rx="7" ry="2.2" fill={s.cap} />
          <ellipse cx="50" cy="12.5" rx="5" ry="1.2" fill={s.bodyHi} opacity={0.8} />
          <rect x="49" y="8" width="2" height="6" fill={s.saddle} />
          <circle cx="50" cy="8" r="3" fill="none" stroke={s.saddle} strokeWidth="1.2" />
          <line x1="47" y1="8" x2="53" y2="8" stroke={s.saddle} strokeWidth="1.2" />
          <line x1="50" y1="5" x2="50" y2="11" stroke={s.saddle} strokeWidth="1.2" />
        </>
      ) : showCargo === 'fuel' ? (
        fuelLoad(sky.fuel)
      ) : (
        milkLoad(sky.milk)
      )}
      <line x1="6" y1="30" x2="6" y2="52" stroke={s.saddle} strokeWidth="1.4" />
      <line x1="14" y1="30" x2="14" y2="52" stroke={s.saddle} strokeWidth="1.4" />
      {([34, 40, 46] as number[]).map((y) => (
        <line key={y} x1="6" y1={y} x2="14" y2={y} stroke={s.saddle} strokeWidth="1" />
      ))}
      <line x1="86" y1="30" x2="86" y2="52" stroke={s.saddle} strokeWidth="1.4" />
      <line x1="94" y1="30" x2="94" y2="52" stroke={s.saddle} strokeWidth="1.4" />
      {([34, 40, 46] as number[]).map((y) => (
        <line key={y} x1="86" y1={y} x2="94" y2={y} stroke={s.saddle} strokeWidth="1" />
      ))}
      <rect x="12" y="58" width="20" height="4" rx="2" fill={s.saddle} opacity={0.85} />
      <rect x="68" y="58" width="20" height="4" rx="2" fill={s.saddle} opacity={0.85} />
      <Wheel cx={20} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={38} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={62} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={80} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
    </svg>
  )
}

export const BoxWagon: FC<TrainIcon> = ({ size = 80, t, showCargo }) => {
  const raw = useId()
  const id = raw.replace(/[^a-zA-Z0-9_-]/g, '')
  const sky = t ?? BASE
  const s = sky.box as SkyTheme['box']
  return (
    <svg viewBox="0 0 100 76" width={size} height={(size * 76) / 100} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.body[0]} />
          <stop offset="1" stopColor={s.body[1]} />
        </linearGradient>
        <linearGradient id={`r${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.roof[0]} />
          <stop offset="1" stopColor={s.roof[1]} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={100} />
      <rect x="4" y="56" width="92" height="5" rx="2" fill={s.roof[1]} opacity={0.6} />
      <rect x="6" y="20" width="88" height="38" rx="3" fill={`url(#b${id})`} />
      <rect x="3" y="14" width="94" height="9" rx="3" fill={`url(#r${id})`} />
      <rect x="6" y="15" width="88" height="3" rx="1.5" fill="#fff" opacity={0.18} />
      {/* Shut sliding door, or — when loaded — the door slid open with the goods
          sitting in the opening, which is exactly how the reference shows a box
          wagon full of fruit. */}
      {showCargo === undefined ? (
        <>
          <rect x="30" y="22" width="40" height="34" rx="2" fill={s.door} />
          <rect x="31" y="23" width="38" height="6" rx="1" fill={s.doorHi} opacity={0.7} />
          <line x1="50" y1="22" x2="50" y2="56" stroke={s.doorEdge} strokeWidth="1.5" opacity={0.55} />
          <rect x="28" y="20" width="44" height="4" rx="1" fill={s.doorEdge} opacity={0.5} />
          <rect x="28" y="54" width="44" height="4" rx="1" fill={s.doorEdge} opacity={0.5} />
          <rect x="62" y="36" width="5" height="8" rx="2.5" fill={s.doorEdge} />
        </>
      ) : (
        <>
          {/* The unlit inside of the wagon. A saturated payload needs a dark
              ground behind it, or the whole card is one brown smudge. */}
          <rect x="28" y="22" width="44" height="34" rx="2" fill={s.opening} />
          <rect x="26" y="20" width="48" height="4" rx="1" fill={s.doorEdge} />
          <rect x="26" y="54" width="48" height="4" rx="1" fill={s.doorEdge} />
          {showCargo === 'parcels' ? parcelsLoad(sky.parcels) : applesLoad(sky.apples)}
        </>
      )}
      <rect x="6" y="22" width="22" height="34" fill={s.bodyHi} opacity={0.25} />
      <rect x="72" y="22" width="22" height="34" fill={s.body[1]} opacity={0.18} />
      <Wheel cx={20} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={38} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={62} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={80} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
    </svg>
  )
}

export const FlatcarWagon: FC<TrainIcon> = ({ size = 80, t, showCargo }) => {
  const raw = useId()
  const id = raw.replace(/[^a-zA-Z0-9_-]/g, '')
  const sky = t ?? BASE
  const s = sky.flatcar as SkyTheme['flatcar']
  return (
    <svg viewBox="0 0 100 76" width={size} height={(size * 76) / 100} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`d${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.deckHi} />
          <stop offset="1" stopColor={s.deck[1]} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={100} />
      <rect x="4" y="46" width="92" height="12" rx="2" fill={`url(#d${id})`} />
      <rect x="4" y="46" width="92" height="2" fill="#fff" opacity={0.3} />
      {([18, 32, 46, 60, 74] as number[]).map((x) => (
        <line key={x} x1={x} y1="48" x2={x} y2="56" stroke={s.stake} strokeWidth="0.8" opacity={0.35} />
      ))}
      <rect x="4" y="38" width="5" height="10" rx="1.5" fill={s.stake} />
      <rect x="91" y="38" width="5" height="10" rx="1.5" fill={s.stake} />
      <rect x="28" y="40" width="3" height="7" rx="1" fill={s.stake} opacity={0.9} />
      <rect x="50" y="40" width="3" height="7" rx="1" fill={s.stake} opacity={0.9} />
      <rect x="72" y="40" width="3" height="7" rx="1" fill={s.stake} opacity={0.9} />
      {showCargo === undefined ? null : carsLoad(sky.cars)}
      <Wheel cx={20} cy={64} r={7} wheel={s.wheel} wheelHub={s.deckHi} />
      <Wheel cx={38} cy={64} r={7} wheel={s.wheel} wheelHub={s.deckHi} />
      <Wheel cx={62} cy={64} r={7} wheel={s.wheel} wheelHub={s.deckHi} />
      <Wheel cx={80} cy={64} r={7} wheel={s.wheel} wheelHub={s.deckHi} />
    </svg>
  )
}

export const PassengerWagon: FC<TrainIcon> = ({ size = 80, t, showCargo }) => {
  const raw = useId()
  const id = raw.replace(/[^a-zA-Z0-9_-]/g, '')
  const sky = t ?? BASE
  const s = sky.passenger as SkyTheme['passenger']
  return (
    <svg viewBox="0 0 100 76" width={size} height={(size * 76) / 100} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.body[0]} />
          <stop offset="1" stopColor={s.body[1]} />
        </linearGradient>
        <linearGradient id={`r${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.roof[0]} />
          <stop offset="1" stopColor={s.roof[1]} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={100} />
      <rect x="4" y="56" width="92" height="5" rx="2" fill={s.roof[1]} opacity={0.55} />
      <rect x="6" y="22" width="88" height="36" rx="4" fill={`url(#b${id})`} />
      <rect x="4" y="14" width="92" height="12" rx="4" fill={`url(#r${id})`} />
      <rect x="6" y="15" width="88" height="3.5" rx="1.5" fill="#fff" opacity={0.22} />
      <rect x="6" y="46" width="88" height="7" fill={s.stripe} />
      <rect x="6" y="46" width="88" height="2" fill="#fff" opacity={0.3} />
      {([10, 26, 42, 58, 74] as number[]).map((x, i) => (
        <g key={i}>
          <rect x={x} y={28} width={12} height={12} rx={2.5} fill={s.window} />
          <rect x={x} y={28} width={12} height={3} fill={s.windowFrame} opacity={0.22} />
        </g>
      ))}
      <rect x="38" y="36" width="20" height="22" rx="2" fill={s.door} />
      <line x1="48" y1="38" x2="48" y2="56" stroke={s.windowFrame} strokeWidth="1.2" opacity={0.55} />
      <circle cx="55" cy="48" r="1.5" fill={s.windowFrame} />
      {showCargo === undefined ? null : peopleLoad(sky.people)}
      <Wheel cx={20} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={38} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={62} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={80} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
    </svg>
  )
}

export const LogcarWagon: FC<TrainIcon> = ({ size = 80, t, showCargo }) => {
  const raw = useId()
  const id = raw.replace(/[^a-zA-Z0-9_-]/g, '')
  const sky = t ?? BASE
  const s = sky.logcar as SkyTheme['logcar']
  return (
    <svg viewBox="0 0 100 76" width={size} height={(size * 76) / 100} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`d${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.deck[0]} />
          <stop offset="1" stopColor={s.deck[1]} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={100} />
      <rect x="4" y="48" width="92" height="10" rx="2" fill={`url(#d${id})`} />
      <rect x="4" y="48" width="92" height="2" fill="#fff" opacity={0.25} />
      <rect x="12" y="22" width="6" height="28" rx="1.5" fill={s.stake} />
      <rect x="12" y="22" width="2" height="28" fill="#fff" opacity={0.18} />
      <rect x="47" y="22" width="6" height="28" rx="1.5" fill={s.stake} />
      <rect x="47" y="22" width="2" height="28" fill="#fff" opacity={0.18} />
      <rect x="82" y="22" width="6" height="28" rx="1.5" fill={s.stake} />
      <rect x="82" y="22" width="2" height="28" fill="#fff" opacity={0.18} />
      <rect x="6" y="44" width="88" height="4" rx="1.5" fill={s.stake} opacity={0.85} />
      <rect x="6" y="44" width="88" height="1.2" rx="0.6" fill="#fff" opacity={0.25} />
      {showCargo === undefined ? null : logsLoad(sky.logs)}
      <Wheel cx={20} cy={64} r={7} wheel={s.wheel} wheelHub={s.log3} />
      <Wheel cx={38} cy={64} r={7} wheel={s.wheel} wheelHub={s.log3} />
      <Wheel cx={62} cy={64} r={7} wheel={s.wheel} wheelHub={s.log3} />
      <Wheel cx={80} cy={64} r={7} wheel={s.wheel} wheelHub={s.log3} />
    </svg>
  )
}

// ── CARGO ICONS ───────────────────────────────────────────────────────────────

export const CoalCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const s = (t ?? BASE).coal as SkyTheme['coal']
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="54" rx="22" ry="3" fill={`rgba(0,0,0,${0.15 * CAST})`} />
      <polygon points="6,50 4,36 14,22 28,26 30,42 18,52" fill={s.b} />
      <polygon points="22,52 18,33 36,18 50,24 54,42 42,52" fill={s.a} />
      <polygon points="12,52 8,40 18,30 32,34 32,46 22,54" fill={s.c} opacity={0.85} />
      <polygon points="20,28 32,22 40,24 32,32" fill={s.hi} opacity={0.45} />
      <polygon points="10,38 18,30 22,34 14,42" fill={s.hi} opacity={0.35} />
    </svg>
  )
}

export const SandCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const s = (t ?? BASE).sand as SkyTheme['sand']
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="54" rx="24" ry="3" fill={`rgba(0,0,0,${0.15 * CAST})`} />
      <path d="M4,54 Q10,28 30,14 Q50,28 56,54 Z" fill={s.b} />
      <path d="M4,54 Q10,28 30,14 Q40,30 30,54 Z" fill={s.a} />
      <path d="M16,50 Q22,28 30,18 Q34,30 30,50 Z" fill={s.hi} opacity={0.5} />
      {([[20, 44], [28, 38], [38, 44], [24, 48], [42, 40], [34, 34]] as [number, number][]).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.2} fill={s.dot} opacity={0.6} />
      ))}
    </svg>
  )
}

/**
 * The task pictures below are the same objects the wagons carry — the same blue
 * crate of white bottles, the same red jerrycan, the same basket of apples, the
 * same present — laid out to fill a square instead of a wagon roof or a doorway.
 * Matching a picture to the same picture is the one comparison a four-year-old
 * makes with no instruction at all, and it is the whole reason the loads exist.
 */
export const MilkCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const s = (t ?? BASE).milk as SkyTheme['milk']
  const bottle = (w: number, sy: number, nw: number, topY: number) => (cx: number) =>
    `M${cx - w},52 L${cx - w},${sy} Q${cx - w},${sy - 11} ${cx - nw},${sy - 12.4} L${cx - nw},${topY} L${cx + nw},${topY} L${cx + nw},${sy - 12.4} Q${cx + w},${sy - 11} ${cx + w},${sy} L${cx + w},52 Z`
  const rim = bottle(8.4, 26, 5.2, 5)
  const body = bottle(6.3, 27, 3.4, 7)
  const bottles = [14, 30, 46]
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      {bottles.map((cx) => <path key={`r${cx}`} d={rim(cx)} fill={s.rim} />)}
      {bottles.map((cx) => (
        <g key={`b${cx}`}>
          <path d={body(cx)} fill={s.bottle} />
          <rect x={cx - 3.9} y={7.4} width={7.8} height={4.4} rx={1.4} fill={s.cap} />
        </g>
      ))}
      <rect x="1.5" y="28.5" width="57" height="4.4" rx="2.2" fill={s.rim} />
      <rect x="3" y="32.2" width="54" height="19.8" rx="1.5" fill={s.crate} />
      <rect x="3" y="32.2" width="54" height="3.4" fill={s.crateHi} />
      <rect x="20.5" y="32.2" width="3" height="19.8" fill={s.rim} opacity={0.5} />
      <rect x="36.5" y="32.2" width="3" height="19.8" fill={s.rim} opacity={0.5} />
    </svg>
  )
}

export const FuelCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const s = (t ?? BASE).fuel as SkyTheme['fuel']
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="56" rx="20" ry="2.5" fill={`rgba(0,0,0,${0.18 * CAST})`} />
      <rect x="17" y="4" width="26" height="5" rx="2.5" fill={s.canDark} />
      <rect x="17" y="7" width="6" height="8" fill={s.canDark} />
      <rect x="37" y="7" width="6" height="8" fill={s.canDark} />
      <rect x="44" y="8" width="10" height="8.5" rx="3" fill={s.cap} />
      <rect x="49" y="12" width="8" height="4.5" rx="2.2" fill={s.cap} />
      <rect x="7" y="14" width="46" height="40" rx="4" fill={s.can} />
      <rect x="7" y="14" width="46" height="4.5" rx="2.2" fill={s.canHi} />
      <rect x="10.5" y="19" width="5.5" height="35" fill={s.canHi} opacity={0.55} />
      <line x1="14" y1="21" x2="46" y2="49" stroke={s.canDark} strokeWidth="4" />
      <line x1="46" y1="21" x2="14" y2="49" stroke={s.canDark} strokeWidth="4" />
    </svg>
  )
}

export const ApplesCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const s = (t ?? BASE).apples as SkyTheme['apples']
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="57" rx="22" ry="2.5" fill={`rgba(0,0,0,${0.18 * CAST})`} />
      <circle cx="43.5" cy="24" r="11.2" fill={s.greenDark} />
      <circle cx="43.5" cy="24" r="8.9" fill={s.green} />
      <ellipse cx="40.2" cy="20.6" rx="3" ry="2.8" fill="#fff" opacity={0.4} />
      <path d="M22,10.5 Q24.4,8 26.4,7.4" stroke={s.stem} strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <ellipse cx="32.5" cy="8.4" rx="7.4" ry="3.8" fill={s.leaf} transform="rotate(14 32.5 8.4)" />
      <circle cx="22" cy="24" r="14" fill={s.redDark} />
      <circle cx="22" cy="24" r="11.4" fill={s.red} />
      <ellipse cx="17.4" cy="19.4" rx="4" ry="3.6" fill={s.hi} opacity={0.8} />
      <polygon points="6,32 54,32 49,55 11,55" fill={s.basket} />
      <path d="M8,40 L52,40 M9.6,47.6 L50.4,47.6" stroke={s.basketDark} strokeWidth="2" opacity={0.75} />
      <path d="M20,32 L18.4,55 M30,32 L30,55 M40,32 L41.6,55" stroke={s.basketDark} strokeWidth="1.8" opacity={0.55} />
      <rect x="3" y="27.5" width="54" height="6.5" rx="3.2" fill={s.basketDark} />
      <rect x="3" y="27.5" width="54" height="2.2" rx="1.1" fill={s.basket} opacity={0.7} />
    </svg>
  )
}

export const ParcelsCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const s = (t ?? BASE).parcels as SkyTheme['parcels']
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="57" rx="22" ry="2.5" fill={`rgba(0,0,0,${0.18 * CAST})`} />
      <ellipse cx="20.5" cy="12" rx="9.4" ry="6.4" fill={s.ribbon} transform="rotate(-18 20.5 12)" />
      <ellipse cx="39.5" cy="12" rx="9.4" ry="6.4" fill={s.ribbon} transform="rotate(18 39.5 12)" />
      <ellipse cx="20.5" cy="12" rx="3.8" ry="2.6" fill={s.ribbonDark} opacity={0.5} transform="rotate(-18 20.5 12)" />
      <ellipse cx="39.5" cy="12" rx="3.8" ry="2.6" fill={s.ribbonDark} opacity={0.5} transform="rotate(18 39.5 12)" />
      <rect x="3" y="18" width="54" height="11" rx="2" fill={s.box} />
      <rect x="3" y="18" width="54" height="3.6" rx="1.8" fill={s.boxHi} />
      <rect x="7" y="29" width="46" height="25" rx="2" fill={s.box} />
      <rect x="45" y="29" width="8" height="25" fill={s.boxDark} opacity={0.45} />
      <rect x="24.8" y="18" width="10.4" height="36" fill={s.ribbon} />
      <rect x="24.8" y="18" width="3" height="36" fill={s.ribbonDark} opacity={0.35} />
      <circle cx="30" cy="14.5" r="5" fill={s.ribbonDark} />
    </svg>
  )
}

export const CarsCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const raw = useId()
  const id = raw.replace(/[^a-zA-Z0-9_-]/g, '')
  const s = (t ?? BASE).cars as SkyTheme['cars']
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`c${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.body} />
          <stop offset="1" stopColor={s.bodyDark} />
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="54" rx="24" ry="2.5" fill={`rgba(0,0,0,${0.18 * CAST})`} />
      <rect x="3" y="32" width="54" height="16" rx="5" fill={`url(#c${id})`} />
      <path d="M12,32 Q16,16 24,14 L38,14 Q46,16 50,32 Z" fill={s.bodyDark} />
      <path d="M16,32 Q19,20 24,18 L30,18 L30,32 Z" fill={s.window} opacity={0.9} />
      <path d="M30,18 L36,18 Q41,20 44,32 L30,32 Z" fill={s.window} opacity={0.75} />
      <line x1="30" y1="18" x2="30" y2="32" stroke={s.bodyDark} strokeWidth="1.5" />
      <rect x="32" y="38" width="8" height="3" rx="1.5" fill={s.bodyDark} />
      <circle cx="15" cy="50" r="7" fill={s.wheel} />
      <circle cx="15" cy="50" r="3" fill={s.window} />
      <circle cx="45" cy="50" r="7" fill={s.wheel} />
      <circle cx="45" cy="50" r="3" fill={s.window} />
      <ellipse cx="56" cy="38" rx="2.5" ry="3" fill={s.head} />
    </svg>
  )
}

export const PeopleCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const s = (t ?? BASE).people as SkyTheme['people']
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="56" rx="22" ry="2.5" fill={`rgba(0,0,0,${0.18 * CAST})`} />
      <path d="M30,54 Q31,38 41,34 Q51,38 52,54 Z" fill={s.shirtB} />
      <circle cx="41" cy="22" r="9" fill={s.skinB} />
      <path d="M32,17 Q33,12 41,11 Q49,12 50,18 Q49,15 41,14 Q33,15 32,17 Z" fill={s.hair} />
      <path d="M8,56 Q10,38 20,34 Q30,38 32,56 Z" fill={s.shirtA} />
      <circle cx="20" cy="22" r="10" fill={s.skinA} />
      <path d="M10,18 Q11,11 20,10 Q29,11 30,18 Q28,14 20,13 Q12,14 10,18 Z" fill={s.hair} />
      <circle cx="17" cy="22" r="1.2" fill={s.hair} />
      <circle cx="23" cy="22" r="1.2" fill={s.hair} />
    </svg>
  )
}

interface LogShapeProps {
  cx: number; cy: number; w: number; h: number
  outer: string; mid: string; inner: string; crack: string
}

function LogShape({ cx, cy, w, h, outer, mid, inner, crack }: LogShapeProps) {
  const bodyLeft = cx - w / 2
  const bodyRight = cx + w / 2
  const capCx = bodyRight - h * 0.45
  const capRx = h * 0.42
  const capRy = h / 2 - 1
  return (
    <g>
      <rect x={bodyLeft} y={cy - h / 2} width={w} height={h} rx={h / 2} fill={outer} />
      <rect x={bodyLeft + 3} y={cy - h / 2 + 1.5} width={w - 6} height={1.5} rx={0.75} fill="#fff" opacity={0.18} />
      <path d={`M${bodyLeft + 4} ${cy - h * 0.22} q3 -1.5 6 0 t6 0 t6 0 t6 0`} stroke={crack} strokeWidth="0.9" fill="none" opacity={0.55} />
      <path d={`M${bodyLeft + 3} ${cy} q3 1.5 6 0 t6 0 t6 0 t6 0`} stroke={crack} strokeWidth="0.9" fill="none" opacity={0.55} />
      <path d={`M${bodyLeft + 4} ${cy + h * 0.22} q3 -1.5 6 0 t6 0 t6 0 t6 0`} stroke={crack} strokeWidth="0.9" fill="none" opacity={0.45} />
      <ellipse cx={bodyLeft + 6} cy={cy - h * 0.05} rx="1" ry="0.6" fill={crack} opacity={0.55} />
      <ellipse cx={capCx} cy={cy} rx={capRx} ry={capRy} fill={inner} />
      <ellipse cx={capCx} cy={cy} rx={capRx * 0.78} ry={capRy * 0.78} fill="none" stroke={mid} strokeWidth="0.9" />
      <ellipse cx={capCx} cy={cy} rx={capRx * 0.5} ry={capRy * 0.5} fill="none" stroke={mid} strokeWidth="0.9" />
      <ellipse cx={capCx} cy={cy} rx={capRx * 0.22} ry={capRy * 0.22} fill={mid} />
      <ellipse cx={capCx + 0.4} cy={cy + 0.3} rx={capRx} ry={capRy} fill="none" stroke={outer} strokeWidth="0.6" opacity={0.5} />
    </g>
  )
}

export const LogsCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const s = (t ?? BASE).logs as SkyTheme['logs']
  const p = { outer: s.outer, mid: s.mid, inner: s.inner, crack: s.crack }
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="55" rx="24" ry="2.5" fill={`rgba(0,0,0,${0.18 * CAST})`} />
      <LogShape cx={36} cy={20} w={36} h={14} {...p} />
      <LogShape cx={28} cy={26} w={46} h={15} {...p} />
      <LogShape cx={32} cy={42} w={50} h={16} {...p} />
    </svg>
  )
}

/**
 * A small animal — roadmap E3, world mode only.
 *
 * This is the drawing that used to be `Friend` in WorldChoice, where three of
 * them stood full-size BESIDE the three offered wagons. Measured, that was a
 * large part of why the offer outweighed the train: the offered band carried 56%
 * object ink against the train's 16.9%, and a third of the offer's ink was three
 * chaperones that had nothing to do with the choice being made.
 *
 * So it moved, and it moved to the two places the reference puts its characters:
 * standing ON the wagons of the train being built (frames-clean/frame-030 stands
 * a rabbit on the leading wagon's roof, frame-040 a rabbit and a sloth on two of
 * them) and standing on the station platform waiting to board (frame-030 and
 * frame-042 both line the platform with them). Every one of them is now either on
 * the child's own train — which is what makes a Sago train worth looking at — or
 * small and far away up at the station.
 *
 * One 92x124 box, three silhouettes, and what separates them is the head and one
 * raised arm: a piglet with folded ears, a snout and two nostrils; a duckling with
 * a wedge beak and a crest; a bunny with two long uprights and lined ears. Every
 * fill is flat, the smile is the only stroke, nothing casts and nothing has a
 * gradient.
 */
export interface CritterSpec {
  kind: 'piglet' | 'duckling' | 'bunny'
  coat: string
  dark: string
  inner: string
  /** The face ink, and the duckling's beak. Passed in so this file owns no palette. */
  ink: string
  beak: string
}

export const Critter: FC<{ spec: CritterSpec; width: number; height: number }> = ({
  spec,
  width,
  height,
}) => (
  <svg
    viewBox="0 0 92 124"
    width={width}
    height={height}
    style={{ display: 'block' }}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* body: a low round-shouldered mass, feet flat on whatever it stands on */}
    <path d="M22,72 Q46,60 70,72 L73,120 Q46,128 19,120 Z" fill={spec.coat} />
    {/* the raised arm, on the free side of the box so it is not buried under the
        body the way the old one was — measured invisible at this size */}
    <path d="M64,84 Q82,72 78,50 L65,54 Q68,70 56,80 Z" fill={spec.dark} />
    <circle cx="79" cy="47" r="9" fill={spec.dark} />
    {/* what is on top of the head, then the head over its feet */}
    {spec.kind === 'piglet' && (
      <>
        <path d="M22,32 Q17,10 36,17 Z" fill={spec.dark} />
        <path d="M70,32 Q75,10 56,17 Z" fill={spec.dark} />
      </>
    )}
    {spec.kind === 'bunny' && (
      <>
        <rect x="27" y="0" width="14" height="36" rx="7" fill={spec.coat} />
        <rect x="51" y="0" width="14" height="36" rx="7" fill={spec.coat} />
        <rect x="30.5" y="5" width="7" height="25" rx="3.5" fill={spec.inner} />
        <rect x="54.5" y="5" width="7" height="25" rx="3.5" fill={spec.inner} />
      </>
    )}
    {spec.kind === 'duckling' && <path d="M46,4 Q34,6 40,20 L52,18 Z" fill={spec.dark} />}
    <circle cx="46" cy="44" r="26" fill={spec.coat} />
    {spec.kind === 'piglet' && <ellipse cx="46" cy="56" rx="14" ry="10.5" fill={spec.inner} />}
    {/* The duckling's beak goes on the FRONT of the face, under the eyes, and not
        off the side of the head: at this size a beak on the silhouette's edge
        measured as a stray pixel and the animal read as a yellow blob. */}
    {spec.kind === 'duckling' && <path d="M33,50 L59,50 L46,64 Z" fill={spec.beak} />}
    {spec.kind === 'bunny' && <ellipse cx="46" cy="57" rx="10.5" ry="7" fill={spec.inner} />}
    {/* the face: two eyes, and either a smile or the piglet's two nostrils */}
    <circle cx="36" cy="41" r="4.6" fill={spec.ink} />
    <circle cx="56" cy="41" r="4.6" fill={spec.ink} />
    {spec.kind === 'piglet' && (
      <>
        <circle cx="42" cy="56" r="2.6" fill={spec.ink} />
        <circle cx="50" cy="56" r="2.6" fill={spec.ink} />
      </>
    )}
    {spec.kind === 'bunny' && (
      <path
        d="M38,58 Q46,66 54,58"
        fill="none"
        stroke={spec.ink}
        strokeWidth="3"
        strokeLinecap="round"
      />
    )}
  </svg>
)
