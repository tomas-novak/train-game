import type { FC, ReactNode } from 'react'
import { WORLD } from '../theme'
import {
  BIRDS,
  BUSHES,
  CLOUDS,
  FIELD_BUSHES,
  HILLS_FAR,
  HILLS_MID,
  HILL_BASE_FAR,
  HILL_BASE_MID,
  LAMP,
  RANGE_BASE_FAR,
  RANGE_BASE_NEAR,
  BANK_FRIENDS,
  HEDGE_FOOT,
  PLATFORM,
  RANGE_BOX,
  RANGE_FAR,
  RANGE_NEAR,
  STATION,
  TREES,
  BEAK,
  FRIENDS,
  type BushPlacement,
  type Lobe,
  type TreePlacement,
} from '../data/world'
import { Critter } from './svgs'
import { playTick } from '../utils/sfx'

const w = WORLD

/**
 * How far above the top edge of the track band the horizon sits, in px.
 *
 * The point of the number is that it is positive. The classic screen lays a grey
 * band across a pale wash, so the rails live in a strip and the ground stops
 * where the strip stops; here the field starts above the rails and runs off the
 * bottom of the screen, so the rails are laid ON it and the train stands ON it.
 * 22 px is enough for the ground to be unmistakably behind the top of the band
 * without eating into the row the palette needs.
 */
const HORIZON_LIFT = 22

/**
 * How much of the bottom of the screen the near bank takes.
 *
 * The bank is the third ground step and the one the go button stands on. It has
 * to start below the wheels of the train — the deepest thing on the rails — so
 * it is anchored to the bottom edge of the track band plus a hair, never to a
 * fraction of the screen.
 */
const BANK_ABOVE_TRACK = 10

/**
 * The hill ranges' box: 150 px tall, sunk 70 px below the horizon.
 *
 * The sink is the load-bearing number. The field's own top edge is a curve that
 * dips up to 50 px below the horizon line, so a range whose fill stopped at the
 * horizon would leave a straight-edged slab of hill colour hanging in the sky
 * wherever the curve dips. 70 clears the deepest dip by 20 px in landscape and
 * by more in portrait, where the box is scaled down horizontally and not
 * vertically. See `HILLS_FAR` for the rest of the geometry.
 */
const HILL_BOX = 150
const HILL_SINK = 70

/**
 * How far past the horizon the sky box is drawn, in px.
 *
 * The field's own top edge is a curve that dips below the horizon line, so a range
 * of mountains whose fill stopped at the line would leave a straight-edged slab of
 * hill colour hanging in the sky wherever the curve dips. The field is painted over
 * this, so the extra is only ever visible in the dips, which is exactly where it is
 * needed.
 */
const SKY_OVERLAP = 60

/**
 * Where the bottom of the track band is, measured up from the bottom of the
 * screen — in CSS, not in JavaScript, and that is deliberate.
 *
 * The column below the rails is one row: the go button, pulled up 40 px into the
 * ground band and reserving `--go-pop-room` below itself. Its height is
 * therefore `--go-hit + --go-pop-room - 40px`, and both of those are custom
 * properties that already clamp themselves against the viewport (see
 * `--go-size` in index.css). Expressing the horizon as a calc over them means
 * the scene is pinned to the real geometry at every size — the same 1024x768 and
 * 768x1024 the game is checked at, and anything between — with nothing measured,
 * no ResizeObserver, no state and no second render. The ground cannot drift away
 * from the rails because it is defined by them.
 */
const GO_ROW = 'calc(var(--go-hit) + var(--go-pop-room) - 40px)'

/** A flat lobed cloud: overlapping circles in one fill, like the reference's. */
const Cloud: FC<{ x: number; y: number; width: number }> = ({ x, y, width }) => (
  <div
    className="absolute pointer-events-none"
    style={{ left: `${x * 100}%`, top: `${y * 100}%`, width, height: width * 0.4 }}
  >
    <svg viewBox="0 0 100 40" width="100%" height="100%" aria-hidden="true">
      <circle cx="26" cy="24" r="16" fill={w.cloud} />
      <circle cx="50" cy="18" r="18" fill={w.cloud} />
      <circle cx="72" cy="26" r="14" fill={w.cloud} />
      <rect x="10" y="24" width="80" height="16" rx="8" fill={w.cloud} />
    </svg>
  </div>
)

/**
 * A bird, high in the sky: one flat double-arc in the near range's own colour, so
 * the band above the mountains has shapes in it. See `BIRDS` in data/world.ts.
 */
const Bird: FC<{ x: number; y: number; width: number }> = ({ x, y, width }) => (
  <div
    className="absolute pointer-events-none"
    style={{ left: `${x * 100}%`, top: `${y * 100}%`, width, height: width * 0.42 }}
  >
    <svg viewBox="0 0 100 42" width="100%" height="100%" aria-hidden="true">
      <path
        d="M4,26 Q26,2 50,22 Q74,2 96,26 Q74,16 50,32 Q26,16 4,26 Z"
        fill={w.birdSky}
      />
    </svg>
  </div>
)

/**
 * One range of hills: circles in a stretched box, so every lobe stays a soft
 * hump whatever the aspect ratio, and one flat fill for the whole range. The
 * range is drawn before the ground in front of it, which is the only thing that
 * hides its feet — depth by overlap, exactly as in the reference.
 */
const Hills: FC<{ lobes: Lobe[]; fill: string; bottom: string; base: number }> = ({
  lobes,
  fill,
  bottom,
  base,
}) => (
  <svg
    className="absolute left-0 w-full pointer-events-none"
    style={{ bottom, height: HILL_BOX }}
    viewBox={`0 0 1000 ${HILL_BOX}`}
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    {lobes.map((l, i) => (
      <circle key={i} cx={l.cx} cy={l.cy} r={l.r} fill={fill} />
    ))}
    {/* The flat land the humps stand on, running down past the bottom of the box
        so the ground in front is what cuts this range off. */}
    <rect x="0" y={base} width="1000" height={HILL_BOX - base} fill={fill} />
  </svg>
)

const Tree: FC<{ p: TreePlacement; horizon: string }> = ({ p, horizon }) => {
  const width = (p.h * 100) / 130
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `calc(${p.x * 100}% - ${width / 2}px)`,
        bottom: `calc(${horizon} - ${p.sink}px)`,
        width,
        height: p.h,
      }}
    >
      <svg viewBox="0 0 100 130" width="100%" height="100%" aria-hidden="true">
        <rect
          x={p.shape.trunk.x}
          y={p.shape.trunk.top}
          width={p.shape.trunk.w}
          height={130 - p.shape.trunk.top}
          fill={p.dark ? w.trunkDark : w.trunk}
        />
        {p.shape.crown.map((c, i) => (
          <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={p.dark ? w.crownDark : w.crown} />
        ))}
      </svg>
    </div>
  )
}

/*
 * The giant near tree at the right edge is gone, and it went for a measurement.
 *
 * Its whole job was scale contrast — one object obviously ten times nearer than
 * the landscape, cut off by two edges of the frame. Round 4 made the choices
 * full-size, and three full-size wagons with a companion each are 910 px of a
 * 1024 px frame: there is no longer a right-hand corner for a near tree to stand
 * in that is not also where the third choice stands. Measured at 1024x768 with the
 * crown pushed as far off the edge as it would go, its left lobe still lay across
 * the third choice's animal (crown lobe x 893-1021 against the companion at
 * 856-967). A near object may cross the TRAIN — that is what the lamp post is for
 * — but it may never cover one of the three things the round is asking the child
 * to choose between.
 *
 * What does the near-ground job instead is what the reference's own closest frame
 * does: frames-clean/frame-095 has no near tree at all, it has a ledge with
 * characters standing on it in the foreground and a train in front of that. Ours
 * now has exactly that, plus the lamp post the last coach passes behind and the
 * bushes hanging off the bottom edge of the frame.
 */

/**
 * The station, with a bird sitting on its roof.
 *
 * Flat fills and no stroke: platform, plank edge, wall, roof, lit windows. It
 * stands behind the rails, so the train pulls in past it, and it is warm wood
 * rather than another green — which makes it the one large object up there that
 * is not part of the landscape. The bird is the second face in the frame and it
 * costs four circles and a triangle.
 */
const Station: FC<{ foot: string }> = ({ foot }) => (
  <div
    /* So the midground can be measured against the train without guessing at its
       box: the round-1 verdict turned on the station group carrying more ink than
       the train did, and that number has to be checkable. Inert paint either way. */
    data-scene="station"
    className="absolute pointer-events-none"
    style={{
      left: `${STATION.x * 100}%`,
      bottom: foot,
      /* Capped against the frame — see `STATION.wMax`. The drawing keeps its own
         250x150 proportion, so the height follows the width and the queue on the
         platform scales with the building it is standing on. */
      width: `min(${STATION.w}px, ${STATION.wMax * 100}vw)`,
      aspectRatio: `${STATION.w} / ${STATION.h}`,
    }}
  >
    <svg viewBox="0 0 250 150" width="100%" height="100%" aria-hidden="true">
      {/* the platform the building stands on, and its front plank edge */}
      <rect x="0" y="120" width="250" height="18" fill={w.platform} />
      <rect x="0" y="136" width="250" height="14" fill={w.platformEdge} />
      {/* wall, with a darker skirting so the wall is not one unbroken slab */}
      <rect x="42" y="46" width="166" height="76" fill={w.wall} />
      <rect x="42" y="110" width="166" height="12" fill={w.wallDark} />
      {/* roof: one triangle, plus the eaves band under it */}
      <polygon points="24,52 125,6 226,52" fill={w.roof} />
      <rect x="24" y="48" width="202" height="11" rx="5" fill={w.roofDark} />
      {/* three lit windows and a door — the only warm light in the frame */}
      <rect x="58" y="64" width="38" height="30" rx="5" fill={w.window} />
      <rect x="154" y="64" width="38" height="30" rx="5" fill={w.window} />
      <rect x="112" y="26" width="26" height="18" rx="4" fill={w.window} />
      <rect x="110" y="70" width="30" height="52" rx="4" fill={w.door} />
      {/* the queue on the platform, waiting to board — see `PLATFORM` in
          data/world.ts. Small, and behind the rails, so nothing up here can be
          mistaken for one of the three wagons the round is asking about; the
          reference lines its platform with exactly this (frames-clean/frame-030,
          frame-042). */}
      {PLATFORM.map((q, i) => {
        const h = 150 * q.h
        const wq = h * (92 / 124)
        return (
          <g key={i} transform={`translate(${20 + q.x * 210 - wq / 2}, ${121 - h})`}>
            <Critter
              spec={{ ...FRIENDS[q.friend], ink: w.cubInk, beak: BEAK }}
              width={wq}
              height={h}
            />
          </g>
        )
      })}
      {/* the bird on the roof, facing the train */}
      <g>
        <circle cx="172" cy="30" r="13" fill={w.bird} />
        <circle cx="163" cy="33" r="8" fill={w.birdWing} />
        <polygon points="160,27 149,30 160,33" fill={w.birdBeak} />
        <circle cx="169" cy="25" r="2.4" fill={w.cubInk} />
      </g>
    </svg>
  </div>
)

/**
 * A bush: three flat circles, either hanging off the bottom edge of the frame on
 * the near bank or standing on the field along the top edge of the track band.
 */
const Bush: FC<{ p: BushPlacement; bottom: string | number }> = ({ p, bottom }) => (
  <div
    className="absolute pointer-events-none"
    style={{ left: `${p.x * 100}%`, bottom, width: p.w, height: p.h }}
  >
    <svg viewBox="0 0 100 42" width="100%" height="100%" aria-hidden="true">
      <circle cx="26" cy="24" r="20" fill={p.dark ? w.bushDark : w.bush} />
      <circle cx="54" cy="16" r="16" fill={p.dark ? w.bushDark : w.bush} />
      <circle cx="76" cy="26" r="18" fill={p.dark ? w.bushDark : w.bush} />
    </svg>
  </div>
)

/*
 * The bear cub that used to stand on the near bank is gone, and so is the mouse
 * that stood on the dock — deliberately, and it is the whole-screen verdict.
 *
 * Measured: "every object with a face — the bear (80x110 at the bottom edge), the
 * mouse (75x120 on the spur), the bird on the roof — is inert scenery that a real
 * four-year-old will tap first. Tapping the bear at (780,690) produces 0.4% changed
 * pixels, none of them on or near the bear." A big near face that does nothing is
 * worse than no face: it is the loudest instruction on the screen and it points at
 * nothing. The reference never does it — in blind/sago-trains-04 and -07 the
 * nearest, largest, face-bearing object is a quarter of the frame wide and it is
 * the thing you touch.
 *
 * So the faces moved onto the three things that answer a finger: one animal per
 * waiting wagon, standing on the dock inside that wagon's own tap target. See
 * `FRIENDS` in data/world.ts and `Friend` in WorldChoice. What is left inert in
 * this file is landscape and one small bird in a station window's place on the
 * roof — the reference's own raccoon-in-a-window, and nothing a child aims at.
 */

/**
 * The lamp post standing in FRONT of the train — the reference does this
 * constantly (frames-clean/frame-140 stands its lantern between the camera and
 * the last coach) and it is the cheapest depth there is: one thin object
 * overlapping the rolling stock says "the train is inside this place" more
 * firmly than anything behind it can.
 *
 * Round 1's version was read as a road sign, and fairly: a plain rod with a
 * yellow square on top, planted in the grass with no foot. This one is a lamp —
 * a wide base it stands on, a tapering post, a shoulder, and a lantern with a
 * warm pane and a cap over it — and it is anchored to the bottom of the track
 * band, so its foot is buried in the near bank rather than stopping in mid-air.
 */
const LampPost: FC = () => (
  <div
    className="absolute pointer-events-none"
    style={{ left: `${LAMP.x * 100}%`, bottom: `calc(${GO_ROW} - 18px)`, width: LAMP.h * 0.3, height: LAMP.h }}
  >
    <svg viewBox="0 0 45 190" width="100%" height="100%" aria-hidden="true">
      {/* base, then post */}
      <rect x="8" y="176" width="29" height="14" rx="5" fill={w.lampPost} />
      <rect x="14" y="166" width="17" height="14" rx="4" fill={w.lampPost} />
      <rect x="18" y="46" width="9" height="124" fill={w.lampPost} />
      {/* the lantern: shoulder, warm pane, cap */}
      <rect x="10" y="40" width="25" height="8" rx="4" fill={w.lampPost} />
      <polygon points="12,40 33,40 30,16 15,16" fill={w.lampGlow} />
      <polygon points="22.5,2 38,18 7,18" fill={w.lampPost} />
    </svg>
  </div>
)

/**
 * One of the two animals waiting on the near bank, in front of the rails — see
 * `BANK_FRIENDS` in data/world.ts for why they are here and why they are the only
 * things in this file that are not inert.
 *
 * The hit box is grown around the drawing until it is at least 64 px square, so a
 * small animal is still a target a four-year-old cannot miss, and the drawing sits
 * at the bottom of it: the feet are the contact point with the ground.
 *
 * The reaction is one class swap and one note, both inside the pointer event, with
 * the usual remove -> reflow -> add so the first animated frame is the first painted
 * frame. It carries no hue and it promises nothing: a hop is "I am here", not "that
 * was right". The only green in this game is still the train being correct and the
 * only red is still the signal.
 */
const BankFriend: FC<{ p: (typeof BANK_FRIENDS)[number] }> = ({ p }) => {
  const drawW = Math.round(p.h * (92 / 124))
  const boxW = Math.max(66, drawW + 18)
  const boxH = Math.max(66, p.h + 8)
  return (
    <div
      data-touchable
      className="wb-friend absolute touch-none select-none cursor-pointer flex items-end justify-center"
      style={{
        left: `calc(${p.x * 100}% - ${boxW / 2}px)`,
        bottom: p.foot,
        width: boxW,
        height: boxH,
      }}
      onPointerDown={(e) => {
        e.preventDefault()
        const el = e.currentTarget
        el.classList.remove('wb-hop')
        void el.offsetWidth
        el.classList.add('wb-hop')
        playTick()
      }}
      onAnimationEnd={(e) => {
        if (e.animationName === 'wb-hop') e.currentTarget.classList.remove('wb-hop')
      }}
    >
      <Critter
        spec={{ ...FRIENDS[p.friend], ink: w.cubInk, beak: BEAK }}
        width={drawW}
        height={p.h}
      />
    </div>
  )
}

/**
 * A place behind the rails — roadmap E1, world mode only.
 *
 * The classic screen (see `Scene`) is a pale lilac-to-blue gradient with a
 * blurred sun, three translucent clouds and two grey-blue hills, over a flat
 * grey ballast band. Measured by earlier critics, the whole frame lived between
 * 199 and 246 per channel and the strongest shape on it was a grey slab. It is
 * still there, untouched, because it is the control in the A/B test.
 *
 * This is the other thing. Five flat grounds in one hue family, each a real step
 * darker than the one behind it — sky, far hills, near hills, the field the
 * rails are laid on, the bank the button stands on — with three dark tree crowns
 * standing in them, a wooden station, a giant tree cut off by two edges of the
 * frame, a lamp in front of the train and a cat on the bank with a face on it.
 * Every fill is flat, there is not one gradient, not one stroke and not one drop
 * shadow in the file, and depth comes only from value, scale and overlap, which
 * is the whole of how the reference does it.
 *
 * Round 2's changes are all in one direction: fewer and larger. Eleven hill
 * lobes became six, six middle-distance trees became three, the fence went
 * altogether, three bushes became two, and the two objects the critic could not
 * name — a lamp that read as a road sign and a signal that ended in mid-air —
 * were rebuilt or planted. What the room bought is the giant and the cat.
 *
 * It costs the frame rate nothing: every shape is static, painted once, and
 * nothing here animates or is animated. There is no filter, no blur and no
 * transparency to composite.
 */
export const WorldScene: FC<{ children: ReactNode; trackHeight?: number }> = ({
  children,
  trackHeight = 140,
}) => {
  /** The horizon, as a distance up from the bottom edge of the screen. */
  const horizon = `calc(${GO_ROW} + ${trackHeight + HORIZON_LIFT}px)`
  /** The top of the near bank, likewise. */
  const bank = `calc(${GO_ROW} + ${BANK_ABOVE_TRACK}px)`
  /**
   * Where the station stands and where the hedgerow behind the train stands, both
   * as a distance up from the bottom edge of the track band.
   *
   * Fractions of the band and not offsets from the horizon — see `STATION.foot` and
   * `HEDGE_FOOT` in data/world.ts. The band's height follows the viewport, so the
   * horizon moves with it; anchoring the two biggest midground objects to the band
   * instead keeps them the same short distance behind the rails at every screen,
   * which is what stops the strip between them and the roofs of the train from
   * opening up into a flat green sheet in portrait.
   */
  const stationFoot = `calc(${GO_ROW} + ${Math.round(trackHeight * STATION.foot)}px)`
  const hedgeFoot = `calc(${GO_ROW} + ${Math.round(trackHeight * HEDGE_FOOT)}px)`

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: w.sky }}>
      {/* The two far ranges, filling the sky band. Round lobes in one flat fill
          each, in a box stretched from the top of the screen down to the horizon,
          so the ground in front cuts them off and neither can leave a straight edge
          in the air. See `RANGE_FAR` for why they stopped being sawteeth and
          `WORLD.mountainFar` for why they stopped being saturated.

          The box used to stop at the terrace's top edge, which was a third of the
          way down the screen; the terrace is gone (see the note where TERRACE_TOP
          used to be in data/world.ts), so the ranges now run all the way down to
          the field itself and the sky band is theirs entirely. That is the same
          move E2 made when it grew them: the reference fills its upper frame with
          one enormous far mass — blind/sago-trains-04 gives its pink and lilac
          peaks the top 40% of the picture — and never with empty sky. */}
      <svg
        className="absolute left-0 top-0 w-full pointer-events-none"
        style={{ height: `calc(100% - ${horizon} + ${SKY_OVERLAP}px)` }}
        viewBox={`0 0 1000 ${RANGE_BOX}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {RANGE_FAR.map((l, i) => (
          <circle key={`f${i}`} cx={l.cx} cy={l.cy} r={l.r} fill={w.mountainFar} />
        ))}
        <rect
          x="0"
          y={RANGE_BASE_FAR}
          width="1000"
          height={RANGE_BOX - RANGE_BASE_FAR}
          fill={w.mountainFar}
        />
        {RANGE_NEAR.map((l, i) => (
          <circle key={`n${i}`} cx={l.cx} cy={l.cy} r={l.r} fill={w.mountainNear} />
        ))}
        <rect
          x="0"
          y={RANGE_BASE_NEAR}
          width="1000"
          height={RANGE_BOX - RANGE_BASE_NEAR}
          fill={w.mountainNear}
        />
      </svg>

      {/* The clouds, and they are painted AFTER the range rather than before it.
          The order is the depth: the far peaks reach within a few px of the top
          edge, so clouds drawn first were simply covered by them and the sky lost
          its only soft shape. Cloud in
          front of mountain is also the true reading — the reference stacks a near
          white lobe over a far pale mass the same way in blind/sago-trains-05 —
          and it costs nothing: they are still flat fills with no transparency. */}
      {CLOUDS.map((c, i) => (
        <Cloud key={i} x={c.x} y={c.y} width={c.w} />
      ))}
      {BIRDS.map((b, i) => (
        <Bird key={i} x={b.x} y={b.y} width={b.w} />
      ))}

      {/* The two ranges. Both are drawn before the field, so the field is what
          cuts their feet off and the overlap is the depth. */}
      <Hills
        lobes={HILLS_FAR}
        fill={w.hillFar}
        bottom={`calc(${horizon} - ${HILL_SINK}px)`}
        base={HILL_BASE_FAR}
      />
      <Hills
        lobes={HILLS_MID}
        fill={w.hillMid}
        bottom={`calc(${horizon} - ${HILL_SINK}px)`}
        base={HILL_BASE_MID}
      />

      {/* The field the rails are laid on. Its top edge is a long, lazy curve
          rather than a straight line: a straight horizon is the one thing that
          would make this a band again. It runs from the horizon all the way off
          the bottom of the screen, so there is no edge below the train either. */}
      <svg
        className="absolute left-0 bottom-0 w-full pointer-events-none"
        style={{ height: horizon }}
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,58 Q170,14 380,30 Q620,50 790,22 Q910,4 1000,26 L1000,400 L0,400 Z"
          fill={w.field}
        />
      </svg>

      {/* What stands on the horizon, back to front. */}
      <Station foot={stationFoot} />
      {/* ...and what stands on the field just in front of it, filling the band the
          critic measured empty. Drawn before the train, so the train is in front. */}
      {FIELD_BUSHES.map((p, i) => (
        <Bush key={i} p={p} bottom={hedgeFoot} />
      ))}
      {TREES.map((p, i) => (
        <Tree key={i} p={p} horizon={horizon} />
      ))}

      {/* The near bank: the last ground step, starting just below the wheels, so
          the train has ground behind it AND ground in front of it. */}
      <svg
        className="absolute left-0 bottom-0 w-full pointer-events-none"
        style={{ height: bank }}
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Two passes of one curve, the second dropped 22 units, so the top of the
            bank is a dark lip and the bank itself is below it. That lip is the
            shadow side of the formation the track is built on, and it is why the
            bottom of the frame is no longer one flat sheet: between the field
            above the rails and the go button there are now four values — field,
            ballast, cutting, bank — where E1 had two that differed by six points.
            See `WORLD.cutting`. */}
        <path d="M0,34 Q260,4 520,20 Q780,36 1000,8 L1000,200 L0,200 Z" fill={w.cutting} />
        <path d="M0,56 Q260,26 520,42 Q780,58 1000,30 L1000,200 L0,200 Z" fill={w.bank} />
        {/* ...and the nearest ground of all, so the bottom quarter of the frame has
            an edge in it. Same curve again, dropped another 74 units, which lands
            it below the go button's own centre at both orientations. */}
        <path d="M0,130 Q260,100 520,116 Q780,132 1000,104 L1000,200 L0,200 Z" fill={w.bankNear} />
      </svg>

      {children}

      {/* In front of the train: bushes hanging off the bottom edge and the lamp the
          last coach passes behind. Both inert, and both `pointer-events: none`, so a
          touch lands on whatever the game has under it. */}
      <div className="absolute inset-0 pointer-events-none">
        {BUSHES.map((p, i) => (
          <Bush key={i} p={p} bottom={-p.h * 0.28} />
        ))}
        <LampPost />
      </div>

      {/* ...and the two waiting to board, on the near bank at either edge. The only
          things in this file a finger can reach, and the only ones with a face
          outside the train and the station queue. */}
      {BANK_FRIENDS.map((p, i) => (
        <BankFriend key={i} p={p} />
      ))}
    </div>
  )
}
