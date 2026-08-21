/**
 * The place behind the rails — roadmap E1's content.
 *
 * Every shape in the world scene is described here and nothing is described in
 * the component, because that is the house rule and because it is the only way
 * this is tunable: the scene is a list of large flat shapes and the whole design
 * is in where they are and how big they are relative to each other.
 *
 * Two coordinate conventions, and only two:
 *
 *   - Ranges of hills are drawn into a `0 0 1000 H` viewBox stretched across the
 *     full width (`preserveAspectRatio: none`). A hill is a circle, so it stays
 *     a soft lobe at any aspect ratio, and the reference draws its hills exactly
 *     that way: overlapping round humps, one flat fill per range.
 *   - Everything that must not be distorted — a tree, the station, a lamp post —
 *     is a fixed-size SVG placed by `x` (a fraction of the screen width, 0 at
 *     the left edge, 1 at the right) and anchored to the horizon.
 *
 * `sink` is how far an object's base sits BELOW the horizon line, in px. It is
 * the only depth cue the reference uses besides value: a tree whose trunk ends
 * below the horizon is standing in front of it, and one whose trunk ends on it
 * is standing on it. There are no shadows to do this job.
 */

/** A lobe of a hill range: centre and radius in the range's own 1000-wide box. */
export interface Lobe {
  cx: number
  cy: number
  r: number
}

/*
 * The high terrace is gone — roadmap E3, and it is the largest single deletion in
 * this file.
 *
 * It was the palest ground on the screen, a full-width ledge across the upper
 * frame, and its entire job was to be the surface the OFFERED wagons stood on. The
 * measured verdict on it was that the screen therefore held two railways: "the
 * offered band y195-400 is 56.0% ink while the train band y400-595 is 16.9%. The
 * waiting stock carries 3.5x the drawn mass of the train being built, spans the
 * full width, and stands on its own segmented full-width coping ladder — so the
 * child sees two rakes on two lines and the loud one is not his."
 *
 * Every reference frame is one railway. frames-clean/frame-030, -031, -040 and
 * -042 each hold exactly one track, at the bottom, with one line of stock on it
 * running off both edges of the frame; blind/sago-trains-01, -04, -05 and -07 the
 * same. There is no shelf above the train in any of them and nothing touchable is
 * standing anywhere except on the platform beside the line or in the wagons.
 *
 * So the waiting wagons came DOWN onto the running line — they stand at the far
 * end of the very rails the train will grow into (see `OFFER_SCALE`) — and with
 * them went the terrace, its coping, and the second full-width rail ladder that
 * used to be laid across it. What fills the upper frame instead is what fills it in
 * the reference: sky, two ranges of hills, and the station.
 */

/**
 * The two ranges standing in the sky band.
 *
 * Round 2's frame was measured at 34.2% of its pixels in the top luminance bin,
 * "nearly all of it empty pale sky", against 11.5% and 3.6% for two reference
 * frames. The reference has no empty region anywhere: blind/sago-trains-04 fills
 * its upper frame with pink and lilac zig-zag mountains, blind/sago-trains-07
 * with dark teal tree masses, frames-clean/frame-098 with lilac buildings on flat
 * apricot. So the sky band gets the biggest saturated far shape there is.
 *
 * E1 filled it with two rows of hard triangular sawteeth, and E2 replaces them
 * with lobes for the reason in `WORLD.mountainFar`: nothing in the reference's
 * landscape is angular, and a saturated spiky mass over a quarter of the frame
 * competes with the train. Same job, same box — a 1000x100 viewBox stretched
 * across the full width, where y=100 is the terrace's top edge, so both ranges
 * are cut off by the ground in front of them and neither can leave a straight
 * edge in the air — and the same trick as `HILLS_FAR`: a lobe is a circle whose
 * cap alone is inside the box, so `cy` is `r` plus how far its crown sits below
 * the top, and the flat land it rises from is one rect from `RANGE_BASE_*` down.
 *
 * Crowns sit at 26, 22 and 26 of 100 in the far range and 52, 46 and 50 in the
 * near one, so there is a real band of open sky above the highest of them for the
 * two clouds to be in.
 */
/*
 * E3 flattens all six lobes, and it is arithmetic rather than taste. The box these
 * live in is stretched with `preserveAspectRatio: none` from the top of the screen
 * down to the horizon, and E3 deleted the terrace that used to cut it off a third of
 * the way down — so the same box got about half again as tall, and every one of
 * these circles was stretched vertically with it. Measured on the first E3 frame,
 * the far peaks came out as three tall pink cones reaching two thirds of the way up
 * the sky: a loud angular far mass, which is the exact thing `WORLD.mountainFar`
 * exists to prevent.
 *
 * The fix is not shorter humps — that emptied the sky instead, measured as 180 px
 * of flat apricot across the top of the frame — it is a box that does not distort
 * them in the first place. The aspect ratio, not the size, was what made a lobe a
 * cone: with a 100-unit viewBox stretched over the sky, one unit was 1.02 px across
 * and 4.09 px down in landscape and 0.77 by 5.34 in portrait, so a circle of radius
 * 92 was drawn 94 px wide and 376 px tall, and portrait was worse than landscape by
 * a further 70%. The viewBox is 300 units tall now (`RANGE_BOX`), which brings the
 * vertical scale down to about 1.3 px per unit in landscape and 1.7 in portrait, and
 * the radii are large enough that only a broad cap of each circle is inside the box.
 * The drawn humps come out roughly 500 px wide and 230 px tall in landscape, which
 * is the proportion of the reference's own far mass (blind/sago-trains-01 draws
 * three humps about twice as wide as they are tall), and portrait scales with the
 * sky it has rather than stretching into it.
 */
export const RANGE_FAR: Lobe[] = [
  { cx: 150, cy: 360, r: 300 },
  { cx: 530, cy: 344, r: 300 },
  { cx: 900, cy: 362, r: 300 },
]
export const RANGE_NEAR: Lobe[] = [
  { cx: 20, cy: 410, r: 260 },
  { cx: 400, cy: 392, r: 260 },
  { cx: 780, cy: 406, r: 260 },
]
/** Where each far range's flat land begins, in the 300-unit sky box. */
export const RANGE_BASE_FAR = 228
export const RANGE_BASE_NEAR = 258
/** The sky box's own height in viewBox units. See `RANGE_FAR`. */
export const RANGE_BOX = 300

/**
 * The two hill ranges.
 *
 * Both live in a `0 0 1000 150` box whose bottom edge is 70 px BELOW the horizon
 * and whose y=78 is the horizon itself. Two consequences, and both of them are
 * the point:
 *
 *   - each range is a flat distant land with humps rising off it, which is how
 *     the reference draws a background (blind/sago-trains-01: a pale mint band
 *     with three round humps standing on it, one flat fill, no outline);
 *   - the fill runs 70 px below the horizon, well past the deepest point of the
 *     field's own curved top edge, so the field always cuts the range off and
 *     there is never a straight edge floating in the middle of the picture.
 *     Getting this wrong is visible immediately: a rectangle of hill colour
 *     hanging in the sky.
 *
 * A lobe is a circle, and only its cap is inside the box, which is why the
 * radii are larger than the box is tall. `cy` is therefore always `r` plus how
 * far the hump's crown sits below the top of the box.
 */
export const HILLS_FAR: Lobe[] = [
  { cx: 130, cy: 168, r: 168 },
  { cx: 520, cy: 190, r: 210 },
  { cx: 930, cy: 176, r: 184 },
]

/**
 * The near range: one step darker, one step lower, offset so no lobe lines up.
 *
 * Round 2 halved the lobe count in both ranges. Round 1 had eleven humps across
 * the two, and eleven humps of roughly one size is texture, not landscape: the
 * middle distance read as wallpaper because nothing in it was much bigger than
 * anything else. The reference uses three (blind/sago-trains-01) and lets them
 * be enormous, and scale contrast is the whole of how it gets depth. So: three
 * and three, each half again as wide as the ones they replaced.
 */
export const HILLS_MID: Lobe[] = [
  { cx: 40, cy: 176, r: 150 },
  { cx: 430, cy: 208, r: 200 },
  { cx: 880, cy: 182, r: 170 },
]

/** Where each range's flat land begins, in its box's own 150-unit height. */
export const HILL_BASE_FAR = 76
export const HILL_BASE_MID = 79

/**
 * A tree, as the reference draws one: a cluster of flat circles for the crown
 * and a straight trunk, no outline and no shading. Two crowns are enough - a
 * big round one and a taller narrow one - because the reference reuses the same
 * two silhouettes at four or five sizes across a frame.
 *
 * Coordinates are in a `0 0 100 130` box whose bottom edge is the foot of the
 * trunk, so placing a tree is a matter of one `x` and one height.
 */
export interface TreeShape {
  crown: Lobe[]
  trunk: { x: number; w: number; top: number }
}

export const TREE_ROUND: TreeShape = {
  crown: [
    { cx: 50, cy: 40, r: 34 },
    { cx: 24, cy: 54, r: 24 },
    { cx: 76, cy: 54, r: 24 },
    { cx: 38, cy: 22, r: 22 },
    { cx: 64, cy: 24, r: 21 },
    { cx: 50, cy: 66, r: 26 },
  ],
  trunk: { x: 43, w: 14, top: 62 },
}

export const TREE_TALL: TreeShape = {
  crown: [
    { cx: 50, cy: 30, r: 25 },
    { cx: 33, cy: 52, r: 22 },
    { cx: 67, cy: 52, r: 22 },
    { cx: 50, cy: 70, r: 24 },
  ],
  trunk: { x: 45, w: 10, top: 66 },
}

/** One tree in the scene. `dark` picks the deeper of the two crown greens. */
export interface TreePlacement {
  shape: TreeShape
  /** Fraction of screen width for the centre of the trunk. */
  x: number
  /** Height of the whole drawing in px, trunk foot to top of crown. */
  h: number
  /** How far the trunk foot sits below the horizon, in px. */
  sink: number
  dark: boolean
}

/**
 * Where the middle-distance trees stand.
 *
 * Round 1 put six here, all between 84 and 190 px, all with near-identical
 * crowns, lined up along one horizon - and got told, correctly, that the middle
 * distance was wallpaper: no scale contrast anywhere, so no depth. Three now, at
 * 210 / 122 / 84, spread left to centre, with the right-hand third left to the
 * station. The middle of the screen above the rails still stays
 * clear of any dark crown, because that is where the count row and the task
 * panel's dot rows have to be read.
 */
/*
 * ...and two more on the right, standing a little in FRONT of the horizon, which is
 * E3 round 2 and one measured region.
 *
 * With the band grown and the horizon raised, the strip of field between the horizon
 * and the hedgerow behind the train came out as the largest flat area left in the
 * portrait frame — one green sheet across the right two thirds of the picture with
 * nothing in it. These fill it the way the reference fills its middle distance
 * (blind/sago-trains-01 stands four trees of four different sizes along one bank):
 * different heights, different sinks, well clear of the rails so nothing they do can
 * reach the rolling stock or the three wagons the round is asking about.
 */
export const TREES: TreePlacement[] = [
  /*
   * The giant at the near edge — back, and back on the left this time.
   *
   * E2 had one at the RIGHT edge and it was deleted for a measured reason: with the
   * choices drawn full size its crown lay across the third one, and a near object may
   * cross the train but never one of the three things the round is asking about. The
   * left edge has no such problem — it is where the engine bleeds off the frame, and
   * every tree in this list is painted before the game's own column, so the train
   * passes in FRONT of it.
   *
   * What it buys is the top of the frame. Measured in round 1, two whole tile rows of
   * the portrait sky held no drawn object at all; this is one dark mass reaching
   * 210 px above the horizon, cut off by the left edge, which is the reference's own
   * device for the corner of a frame (blind/sago-trains-01 stands one at the right
   * edge cut by two edges, blind/sago-trains-07 fills its upper frame with tree
   * masses). It is also the only object in the scene bigger than the locomotive, and
   * it is dark green: value and hue put it behind everything, scale puts it in front.
   */
  { shape: TREE_ROUND, x: 0.03, h: 330, sink: 118, dark: true },
  { shape: TREE_ROUND, x: 0.07, h: 210, sink: 16, dark: true },
  { shape: TREE_TALL, x: 0.205, h: 122, sink: 4, dark: false },
  { shape: TREE_ROUND, x: 0.42, h: 84, sink: -2, dark: false },
  { shape: TREE_TALL, x: 0.66, h: 150, sink: 34, dark: true },
  { shape: TREE_ROUND, x: 0.9, h: 118, sink: 58, dark: false },
]

/**
 * The station, and the reason there is one at all: it is the thing that makes
 * this a place trains come to rather than a field with rails in it. Wood walls,
 * a deep roof, lit windows and a door, standing on a plank platform whose front
 * edge is a darker step - flat fills and not one gradient, which is how the
 * reference builds its lodge (blind/sago-trains-07) and its snowbound station
 * (frames-clean/frame-140).
 *
 * Placed right of centre and behind the rails, so the train pulls in past it,
 * and 20% larger than round 1's, which was one more middle-sized object among
 * eleven hills and six trees.
 */
export const STATION = {
  /**
   * Left, and lifted clear of the dock — both of which are one measured fix.
   *
   * At x 0.55 the building stood directly behind the RIGHT-hand waiting wagon,
   * with its roof over that wagon's roof and its doorway behind the wagon's
   * opening, and the critic read the result as "a market stall with fruit in it"
   * beside the keeper, while the other two choices read as wagons. A
   * picture-to-picture match is the whole of this round, so no choice may borrow
   * its silhouette from the scenery behind it.
   *
   * So the station moves off the dock's right end and steps up onto the terrace:
   * `lift` is how far its platform sits above the field's own top edge, which puts
   * its base line behind and above the line the wagons stand on rather than level
   * with it. Smaller with it, because it is further away — depth by scale and
   * overlap, which is the only way this scene does depth.
   */
  x: 0.26,
  w: 344,
  /**
   * ...and never more than this fraction of the frame's width, which is E3 round 2
   * and a measured cap.
   *
   * 344 px is a building in a 1024 px frame and a landmark in a 768 px one: measured
   * at 768x1024 the station group came to 32,447 ink px against the whole built
   * train's 24,339, i.e. the largest, most legible group of drawn objects on the
   * portrait screen was the scenery. It is midground; it may not out-draw the
   * subject. 0.3 of the width puts it at 230 px in portrait (about 14,500 px of ink,
   * a little over a third of the train's) and leaves landscape at 307, within 11% of
   * what already measured right there.
   */
  wMax: 0.24,
  /** Height of the whole drawing, platform edge to roof ridge, in px. */
  h: 214,
  /**
   * How far above the field's top edge the platform stands, in px.
   *
   * Lower than E2's 52, and larger with it, because the terrace it used to stand
   * on top of is gone (see the note where `TERRACE_TOP` used to be): the station
   * is now the biggest object in the middle distance rather than one more
   * middle-sized thing on a ledge.
   *
   * `foot` is where its platform stands, as a fraction of the track band's height
   * measured UP from the bottom of that band — not as an offset from the horizon,
   * which is what E2 used.
   *
   * A fraction, because the band's height follows the viewport and the horizon with
   * it: anchored to the horizon, the station stayed a fixed distance below a line
   * that moved, and in portrait it measured 178 px of bare field between its base
   * and the roofs of the train. Anchored to the band, it stands the same short
   * distance behind the rails at every screen — which is where the reference puts
   * it, immediately behind the rake in frames-clean/frame-030 and on the bank the
   * train runs along in frame-042.
   */
  foot: 0.62,
}

/** The lamp post standing in FRONT of the rails, at the frame's edge. */
export const LAMP = {
  /*
   * At the EDGE, and that is the whole of round 3's change to it.
   *
   * Round 2 put it at 0.36 "in front of a wagon, exactly as the reference does",
   * and the reference does not: it puts its lantern at the frame edge, overlapping
   * the LAST coach (frames-clean/frame-140, blind/sago-trains-02), precisely so it
   * never lands on the action. Ours landed on the action and was measured doing
   * it — at 768x1024 the post bisected an empty bay outright, and at 1024x768 it
   * stood between the placed wagon and the next bay and cut the train row in two.
   * A vertical object planted in the middle of the row a child is counting along
   * is a worse read than no lamp at all.
   *
   * E3 brings it back in over the train, and that is not a reversal — the reason
   * round 3 moved it out was that it bisected an empty BAY and cut a row the child
   * was counting along into two halves. There are no bays any more (round 4 deleted
   * them) and the train hangs off the left of the line rather than being centred,
   * so a near object over the rake is now what it is in the reference: one thin
   * thing between the camera and the train, which is the cheapest depth there is
   * (frames-clean/frame-040 stands its lantern across the third and fourth wagons,
   * frame-042 across the last one).
   *
   * 0.27 is the one position that is over the TRAIN at every count and never over
   * anything the round is asking about: the parked stock starts at 0.62 of the width
   * in landscape and 0.61 in portrait, and the go button's ring starts at 0.44 and
   * 0.35. Measured at 0.545 it stood across the go button's own ring, and at 0.35 it
   * still clipped the ring in portrait.
   */
  x: 0.27,
  h: 190,
}

/** Foreground bushes on the near bank, drawn over the bottom edge of the frame. */
export interface BushPlacement {
  x: number
  w: number
  h: number
  dark: boolean
}

/**
 * Two, and both bigger than any of round 1's three. Same reasoning as the hills:
 * fewer, larger shapes. Placed to miss the bear cub and the go
 * button in the middle.
 */
export const BUSHES: BushPlacement[] = [
  { x: 0.08, w: 200, h: 66, dark: false },
  { x: 0.42, w: 160, h: 54, dark: true },
  { x: 0.93, w: 170, h: 58, dark: false },
  /* Two more, because the near bank measured as the emptiest part of the frame —
     it was the reason an inert bear was the biggest-faced thing on the opening
     screen. Placed to miss the three things that must stay clear down here: the go
     disc at the centre, the cub at 0.71 and the lamp at 0.82. */
  { x: 0.21, w: 150, h: 76, dark: true },
  { x: 0.6, w: 130, h: 48, dark: false },
]

/**
 * Bushes on the FIELD, standing along the top edge of the track band.
 *
 * The band of field between the lower siding and the running line was measured
 * empty: about 165 px of one flat green across the whole width, with nothing in it
 * but the count pips, the drop arrow and the bays. "Sago has no empty region" was
 * a third of the round-2 verdict, and the reference's answer is always the same —
 * put large dark shapes in it. These three are drawn BEFORE the train, so the
 * train passes in front of them, and they are the darkest greens on that half of
 * the screen, so they also pull the frame's histogram off the top bin.
 *
 * Placed to miss the three things that have to stay readable there: the count row
 * at the left of the band, the drop arrow at the centre, and the station's
 * platform at the right.
 */
/*
 * ...and like the station they are anchored to a FRACTION of the track band rather
 * than to a fixed offset from the horizon — see `STATION.foot`. `HEDGE_FOOT` is that
 * fraction, and it is below the roofs of the train on purpose: these are drawn
 * before the rolling stock, so the train passes in front of them and their tops
 * stand above its roofs, which is how the reference stages the greenery behind a
 * rake (frames-clean/frame-030, frame-031).
 */
export const HEDGE_FOOT = 0.42

export const FIELD_BUSHES: BushPlacement[] = [
  { x: -0.04, w: 280, h: 120, dark: true },
  { x: 0.16, w: 200, h: 84, dark: false },
  { x: 0.52, w: 250, h: 104, dark: true },
  { x: 0.78, w: 210, h: 88, dark: false },
]

/** Flat lobed clouds, placed as fractions of the sky box. */
export interface CloudPlacement {
  x: number
  /** Fraction of the height above the horizon. 0 is the top of the screen. */
  y: number
  w: number
}

/*
 * Two, both high, and both inside the sky band.
 *
 * The band is only `TERRACE_TOP` of the screen tall now — 154 px in landscape —
 * and a cloud drawn below its bottom edge would be a white lobe floating on a
 * green terrace. Round 2's third cloud was at y=0.3 and would now be exactly
 * that, so it is gone; the two that remain are placed to miss the mountain
 * peaks and the task panel.
 */
export const CLOUDS: CloudPlacement[] = [
  { x: 0.04, y: 0.05, w: 120 },
  { x: 0.34, y: 0.012, w: 170 },
  { x: 0.63, y: 0.05, w: 130 },
  { x: 0.84, y: 0.008, w: 145 },
  /* Two lower ones, in the band the birds are in, for the same reason the birds
     multiplied: a tall frame has sky where a wide one has none. */
  { x: 0.16, y: 0.17, w: 96 },
  { x: 0.68, y: 0.2, w: 110 },
  /*
   * Two lower still, over the far range itself — E3 round 4, and one measured band.
   *
   * "In portrait rows y224-384 are 0.4% ink over 160 rows": a sixth of the tall frame
   * with nothing drawn in it. The reason is that the shapes there ARE the far
   * mountains, which are single flat fills and therefore read as background, exactly
   * as they are meant to. What breaks a sheet is a small near-ish object standing on
   * it, and the reference does this constantly — blind/sago-trains-01 lays two clouds
   * across the crowns of its hills, frames-clean/frame-042 a whole snow bank over
   * them. These two are drawn after the ranges and before the green hills, so they sit
   * ON the pink and are cut off by the land in front of them. Placed clear of the
   * badge at the top left and the mute switch at the top right.
   */
  { x: 0.42, y: 0.245, w: 118 },
  { x: 0.78, y: 0.285, w: 100 },
]

/**
 * Birds, high up — and the whole reason for them is a measurement.
 *
 * In portrait the top 18% of the frame (rows 0-184, all between 209 and 231)
 * held nothing but two clouds and a piece of chrome: one luminance sheet across
 * the widest part of the picture. The reference never leaves that band empty —
 * blind/sago-trains-02 fills it with balloons and a snowflake pennant,
 * blind/sago-trains-05 with a whole field of stars — so two more clouds went in
 * above and these three go with them. One flat shape each, no stroke, no
 * gradient, inert, and small enough that nothing up here can compete with the
 * train.
 */
export interface BirdPlacement {
  x: number
  y: number
  w: number
}

/*
 * Seven now rather than three, and spread across the whole width at four different
 * heights, because the round-1 critic's portrait measurement was that two full tile
 * rows of the sky — y=128 and y=256, the entire width of the frame — held not one
 * drawn object. The train has taken the bottom of that frame back (see `WAGON_BAND`);
 * this is what stops the top of it being a sheet. Still tiny, still inert, still one
 * flat path each: nothing up here may compete with the rolling stock, it only has to
 * be there.
 */
export const BIRDS: BirdPlacement[] = [
  { x: 0.2, y: 0.1, w: 36 },
  { x: 0.26, y: 0.14, w: 28 },
  { x: 0.73, y: 0.12, w: 32 },
  { x: 0.09, y: 0.23, w: 30 },
  { x: 0.46, y: 0.19, w: 34 },
  { x: 0.53, y: 0.25, w: 26 },
  { x: 0.88, y: 0.21, w: 32 },
  /* Four in the lower sky, over the far range — see the last two entries in `CLOUDS`
     for the measured band these fill. */
  { x: 0.13, y: 0.3, w: 30 },
  { x: 0.3, y: 0.335, w: 26 },
  { x: 0.6, y: 0.32, w: 32 },
  { x: 0.93, y: 0.335, w: 28 },
]

/**
 * How many wagons stand waiting on the siding — roadmap E2's whole round shape.
 *
 * Three. The roadmap calls this mode "Který vagón? — jen výběr 1 ze 3" and names
 * it the simplest form there is, and three is also what the reference frames hold
 * in one glance: frames-clean/frame-095 and frame-096 stand exactly three
 * characters on the ledge above the train, and blind/sago-trains-02 puts three
 * animals on the platform. Two is not a choice worth making and four starts to be
 * a row to scan.
 *
 * It is a fixed number rather than the level's `wagonChoices`, which is 2 at
 * level 1 and 6 at level 3: the pick-one-of-three round is the same round at
 * every level here, and what the levels change is the count asked for and how
 * many types the distractors are drawn from.
 */
export const CHOICE_COUNT = 3

/**
 * How big a WAITING wagon is drawn, as a fraction of the wagon it becomes once it
 * is coupled — roadmap E3, and the number the whole composition turns on.
 *
 * The dock is gone. There is no ledge, no coping, no plank face and no second rail
 * ladder: the three wagons a round offers stand on the running line itself, at the
 * far end of it, as stock parked on the rails the train will grow into. That is the
 * reference's own staging — blind/sago-trains-07 has one line with the near stock
 * large at the right and further stock smaller and partly behind the foreground,
 * frames-clean/frame-030 runs one rake off both edges of the frame — and it is what
 * makes the frame read as one railway rather than as a shop above a railway.
 *
 * Standing them on the same line forces the arithmetic that E2 could dodge by
 * giving the offer a row of its own. A frame 1024 px wide has to hold, in one line:
 * the engine (1.62 wagon widths), one wagon per unit the round asks for, and the
 * three that are waiting. At coupled size and a count of two that is 6.6 wagon
 * widths, so a wagon comes out 155 px wide — the train would have SHRUNK, and the
 * offer would still have carried three of those 6.6 widths. Measured as area, three
 * full-size wagons is 3.0 units of ink against the train's 3.6: the two sides stay
 * within a quarter of each other at every count a four-year-old plays, which is the
 * failed verdict restated rather than fixed.
 *
 * Drawing the waiting stock at half the coupled size settles it, and settles it by a
 * wide margin, because ink is an area: three wagons at 0.5 are 3 x 0.5^2 = 0.75
 * units against the train's 3.55 — the train carries nearly five times the drawn
 * mass of the offer, which is the ratio the E2 round had backwards. It was 0.66 in
 * E3 round 1, which measured 3.7x in landscape and still lost portrait outright; the
 * remaining px go where the round-1 critic asked for them, into the coupled stock.
 * The block is capped against the frame as well — see `OFFER_SHARE`. The
 * coupled stock also comes out LARGER than it would at parity (about 175 px wide at
 * a count of two, 133 px of drawn height, 17% of a 768 px frame — the reference's
 * own rolling stock is 18-20%), because the offer stops eating a third of the line.
 *
 * The size difference is a depth cue and not a convention: the waiting stock is
 * further along the line, and scale is the only way flat art says "further" — it is
 * how every hill, tree and station in this scene is placed. The identity the round-3
 * gate protects is kept by the flight instead of by the size: a tapped wagon leaves
 * the line in the same frame the copy appears over it, at exactly the size it was
 * standing at, and the copy GROWS to the coupled size as it rolls in. So the child
 * still watches one wagon travel; it simply comes towards him.
 */
/*
 * E3 round 3 raises it to 0.8, and the number it is answering is a measurement of
 * the CARGO rather than of the wagon.
 *
 * At 0.5 the parked stock was drawn 103x78 in landscape and 73x55 in portrait
 * against a 214 px coupled wagon, and the consequence was measured on the one thing
 * the round is actually about: "the cargo a non-reader must match is ~30 px
 * landscape and ~22 px portrait, smaller than the 42 px icon in the corner badge he
 * must match it to", and "blur both screens to a first glance and ours survives as a
 * yellow-and-red blob with the three choices dissolved into unreadable specks". A
 * round whose whole question is picture-to-picture may not draw one of the two
 * pictures below the size of the other.
 *
 * 0.8 puts the load on a parked wagon comfortably above the badge icon it has to be
 * compared with at both orientations, and it keeps the two properties the smaller
 * size was bought for:
 *
 *   - the parked stock is still visibly the FURTHER stock, because it is still the
 *     smaller (scale is the only depth cue this scene has), and
 *   - the train still carries the frame's mass, because ink is an area: three wagons
 *     at 0.8 are 3 x 0.8^2 = 1.92 units against a count-2 train's 3.5, and the
 *     coupled rake also gains the rider on every wagon.
 *
 * The width it costs is not taken out of the train. It is taken out of the FRAME:
 * the line now runs off both edges (`HEAD_BLEED` at the near end, `OFFER_TAIL_BLEED`
 * at the far one), which is what every reference frame does with a rake it cannot
 * contain — frames-clean/frame-030 and -031 cut the leading wagon off the left edge,
 * blind/sago-trains-02 and -04 cut the last one off the right.
 */
export const OFFER_SCALE = 0.8

/**
 * How tall a COUPLED wagon is drawn, as a fraction of the track band's height —
 * roadmap E3 round 2, and the number that decides whether the train carries the
 * frame or not.
 *
 * Round 1 had no such number. Every size on the line came out of one `fit` factor
 * that divided the row's WIDTH between the engine, the round's wagons and the three
 * that are waiting, and the band's height only ever acted as a ceiling nothing
 * reached. That is correct arithmetic for a frame 1024 px wide and it is the wrong
 * arithmetic for a frame 768 px wide and 1024 tall: the surplus went to sky.
 * Measured at 768x1024, "768x384 = 294,912 px, 37.5% of the screen, is zero ink,
 * and the built train measures 24,339 ink px against the station group's 32,447 and
 * the go disc's 21,409 — the train is NOT the largest or loudest group."
 *
 * So the wish is a height now: a coupled wagon WANTS to be drawn this fraction of
 * the band, whatever the width, and `fit` in TrackZone may only ever shrink it from
 * there. 0.62 of the band puts a landscape wagon at 157 px of drawn height (20% of
 * 768) and lets a count-2 rake run off the near edge of the frame at both
 * orientations, which is what every reference frame does — frames-clean/frame-030
 * and -031 cut the leading wagon off the left edge, blind/sago-trains-02 and -04
 * cut the last one.
 */
/*
 * E3 round 4 demotes this to a CEILING, and that demotion is the whole of the
 * failed gate.
 *
 * Round 3 wanted this height and then let one `fit` factor divide the line's WIDTH
 * between the engine, every wagon the round asked for and the three parked ones — so
 * the drawn size came out as a function of THE ROUND'S NUMBER. Measured: "at count 2
 * the loco is 256x143 and the train band holds 55% of all drawn ink; at count 5 the
 * loco is 165x93 and the band holds 37%; at count 10 the loco is 98x57, the band
 * holds 26% and the trees/house/bushes carry 2.9x the train's ink." The composition
 * was therefore only true at the one count it was tuned on, and a long train read as
 * a small train.
 *
 * The reference never does this. It draws its stock at one size and lets the frame
 * cut the line: blind/sago-trains-02 and -04 and frames-clean/frame-041 all clip a
 * wagon at x=0 and run the rails off the far edge. So the size is pinned now — see
 * `WAGON_LINE` — and this fraction survives only as an upper bound, so a short band
 * can never draw a wagon taller than the band it stands in.
 */
export const WAGON_BAND = 0.62

/**
 * How wide a coupled wagon is drawn, as a fraction of the LINE's width — and this is
 * the number the composition rests on now.
 *
 * It does not mention the round's number, and that is the point: a wagon is the same
 * size on a one-wagon round and on a three-wagon round, so "the train carries the
 * frame" is either true at every count or false at every count, and it cannot quietly
 * stop being true as the level goes up.
 *
 * 0.16 of the line, measured against the reference's own stock: blind/sago-trains-02
 * draws a wagon body about 300 px wide in a 1600 px frame (0.19), frames-clean/
 * frame-042 about 155 in 980 (0.16), frame-040 about 165 in 980 (0.17). At 1024x768
 * that is a 164 px wagon, 125 px of drawn height — 16.3% of the frame's height,
 * inside the 18-20% band the reference measures at once the rider on its roof is
 * counted — and a 249x135 locomotive.
 *
 * A fraction of the WIDTH and not of the band, because the line is what the stock has
 * to share and the band's height is not: portrait's band is 430 px of a 1024 px frame
 * and a wagon sized off it comes out 350 px wide, which is half the width of the
 * portrait line. Anchoring to the width gives 123 px in portrait against the 121 the
 * previous round measured at its best count and the 67 it measured at its worst.
 */
export const WAGON_LINE = 0.16

/**
 * The most wagons a world round may ask for — and it is a consequence of the line's
 * arithmetic rather than a preference.
 *
 * Pinning the size means the frame no longer stretches to fit the round; the round has
 * to fit what a line at reference scale can actually hold. Measured, at 1024x768, in
 * wagon widths: the engine is 1.52, the three wagons parked at the far end are 2.18
 * (2.72 widths at `OFFER_SCALE`, less the outer end of the last one hanging off the
 * frame), and the padding and the gap between the rake and the parked stock are
 * another 0.4. That is 4.1 of the 5.5 widths the frame can show, so what is left for
 * the coupled rake is a little under one and a half wagons — and every wagon past
 * that pushes the near end of the line out of the picture, which is exactly what the
 * reference does and what this round was told to let happen.
 *
 * It may not let it happen without limit, though, and the limit is the ENGINE. The
 * locomotive drawing is a 140x76 box drawn mirrored, with its face painted on the
 * smokebox door in the left 8-29% of the drawing, and the left edge is the edge the
 * line runs off. Measured at the pinned size: at a count of 2 the engine stands at
 * x=-3 of 257 in landscape and x=-22 of 195 in portrait, i.e. whole, with its face
 * and its chimney in the picture. At a count of 3 it is at x=-175 and x=-153 — a
 * 40-80 px stub of boiler at the frame edge with no face on it — and the engine is
 * both the most saturated object in the frame and the only large face on it.
 *
 * So the world round asks for one or two. That is not a loss of what this section is
 * for: the roadmap calls this mode "Který vagón? — jen výběr 1 ze 3" and its subject
 * is WHICH wagon, not how many; the counting mode is the classic screen, whose train
 * is drawn small in a strip precisely so that ten of it fit. Its own progression is
 * carried by the type pool the distractors come from and by the cargo hints, which is
 * where a pick-one-of-three round's difficulty lives.
 *
 * `?mode=classic` reads `levelDef.maxNumber` untouched, at every level.
 *
 * Raising this number is not a free edit: it has to be paid for either by a smaller
 * wagon (at 3 the largest wagon that keeps the engine's face in the frame is 148 px
 * in landscape and 107 in portrait, and 107 is smaller than the 121 the previous
 * round already measured as too small) or by a smaller parked wagon (at `OFFER_SCALE`
 * 0.62 a count of 3 fits at 160 px, but the load painted on a parked wagon drops to
 * 41 px in landscape and to the `OFFER_MIN` floor in portrait, which is the round-2
 * failure — the child must match that load to a 42 px badge icon).
 */
export const WORLD_MAX_COUNT = 2

/**
 * How much wider than a wagon the engine is drawn.
 *
 * The two drawings are a 140x76 box and a 100x76 box, so at equal width the engine
 * is nearly half as tall; 1.4 makes the two drawn heights identical and this is
 * deliberately past it, because in blind/sago-trains-01 and frames-clean/frame-030
 * the engine is visibly the tallest thing on the rails.
 */
export const LOCO_RATIO = 1.52

/*
 * `HEAD_BLEED` is gone — E3 round 4.
 *
 * It was the fraction of the engine the sizing arithmetic was allowed to leave
 * outside the near edge, and it existed only because that arithmetic solved for "the
 * whole rake fits between the two frame edges" and needed somewhere to put the
 * overflow. The size is pinned now (see `WAGON_LINE`), so the bleed is not a budgeted
 * fraction any more: it is simply what happens at the near end of a line the frame
 * cannot contain, and how much of it there is depends on the count. At one wagon the
 * whole engine is in the picture; at three the smokebox is cut by the frame edge and
 * the boiler, cab and chimney are not. The locomotive drawing is a 140x76 box drawn
 * mirrored with its face on the smokebox door between x=11 and x=41 of those units,
 * i.e. in the left 8-29% of the drawing, which is why `WORLD_MAX_COUNT` stops at the
 * count where that plate starts to leave the frame.
 */

/**
 * How much of the last parked wagon may hang off the FAR edge of the frame.
 *
 * The other half of "one railway that the frame cannot contain". The parked stock is
 * pinned to the far end of the line, so the far end of the line is where the picture
 * runs out — and a wagon cut by the frame edge is the reference's own way of saying
 * the rails go on (blind/sago-trains-02 and -04 both cut their last wagon, and
 * frames-clean/frame-041 cuts a whole wagon and half of another).
 *
 * 0.28 and not more, because what is inside the frame has to stay a CHOICE: every
 * load is drawn about the middle of its wagon (the apple basket spans x=29-70 of the
 * 100-wide box, the milk crate x=22-78), so at 0.28 the whole load and both wheels of
 * the third wagon are still in the picture and only the far end of its body is cut.
 * The two nearer wagons are never touched by this.
 */
export const OFFER_TAIL_BLEED = 0.28

/**
 * The largest share of the line the three waiting wagons may claim.
 *
 * `OFFER_SCALE` alone is a ratio between two drawings and says nothing about the
 * frame: at the height-driven size a portrait wagon wants, half of it is 175 px and
 * three of those are 525 px of a 768 px line — the offer would be back to owning
 * two thirds of the railway, which is the verdict this whole section exists to fix.
 * This caps the block instead, so the parked stock can never be more than a bit
 * over a third of the line however tall the frame gets, and `OFFER_MIN` still keeps
 * the load inside it legible.
 */
/*
 * 0.46 in round 3, up from 0.38, for the same reason `OFFER_SCALE` moved: at 0.38 the
 * cap was what actually decided the portrait size, and it decided it at 73 px of
 * wagon with a 22 px load in it. It is still a cap and it still bites before parity —
 * the three parked wagons may claim a little under half the line and the train keeps
 * the rest of it plus everything that runs off the two edges.
 */
export const OFFER_SHARE = 0.46

/**
 * The padding around each parked wagon, the gap between two of them, and the
 * smallest box a finger may be asked to hit.
 *
 * Exported rather than declared twice: TrackZone reserves this room when it divides
 * the line up and WorldChoice paints it, and round 3 of the previous section failed
 * a gate on exactly this kind of duplicated constant.
 */
export const OFFER_PAD = 8
export const OFFER_GAP = 3
export const OFFER_HIT = 68

/**
 * ...and it may never be drawn so small that the load inside it stops being
 * legible, because the load is the whole question the round asks. 72 px of wagon
 * width is where the cargo drawing stops being a shape and starts being a smudge,
 * measured on the ten-wagon round, which is the only round tight enough to reach
 * it. When the floor bites, the extra width comes off the train's own room rather
 * than off the choice — see `fit` in TrackZone.
 */
export const OFFER_MIN = 72

/**
 * The animals — and where they are is roadmap E3's second change.
 *
 * E2 stood one of these full-size BESIDE each offered wagon, inside its tap
 * target, and the measurement was that it was a third of why the offer outweighed
 * the train: "each offered wagon has its own full-size animal standing beside it,
 * which is a large part of why the offer outweighs the train."
 *
 * The reference never puts a character beside a wagon. It puts them IN the wagons
 * and ON them — frames-clean/frame-030 has a rabbit standing on the leading
 * wagon's roof and four more heads looking out of the openings, frame-040 has a
 * rabbit and a sloth up on the wagons — and it lines the platform with the ones
 * still waiting to board (frame-030, frame-042). So they went to both places:
 *
 *   - `RIDERS` ride. One animal stands on each wagon that is actually ON the
 *     train, so the train the child has built is the thing in the frame with the
 *     faces on it, and the faces are on objects that answer a finger (tapping a
 *     coupled wagon takes it off again).
 *   - `PLATFORM` waits. Three more stand on the station platform, small and far,
 *     the way a queue of passengers does. They are inert, and that is only safe
 *     because they are small and distant: the objection E2 was given was a large
 *     NEAR face that did nothing (80x110 at the bottom edge, "the loudest
 *     instruction on the screen pointing at nothing"), and these are a third of
 *     that height, up behind the rails, quieter than the rolling stock in every
 *     channel.
 *
 * The offered wagons themselves carry no animal at all now. What the child is
 * being asked to read on them is the load, and nothing else may compete with it.
 */
export const FRIENDS = [
  { kind: 'piglet' as const, coat: '#e5a3ae', dark: '#cf8b97', inner: '#f6cdd4' },
  /* The duckling is dustier than E2's. As a chaperone it stood beside a wagon at
     the edge of the frame; as a rider it stands on the train and as a waiting
     passenger it stands at the bottom edge, and at #efc352 its region measured a
     mean chroma of 148 against the locomotive's 103 — which breaks the one gate that
     says the train is the loudest thing in the picture. Ochre still reads as a
     duckling: it is the beak and the crest that do that work, not the saturation. */
  { kind: 'duckling' as const, coat: '#e0c887', dark: '#c8ab63', inner: '#f0e3bd' },
  { kind: 'bunny' as const, coat: '#b3a6d6', dark: '#9a8cc0', inner: '#ded6f0' },
]

/**
 * The duckling's beak. Its own warm brown: the bird on the station roof uses
 * #ffc24d, which against an ochre duckling measured as no beak at all, and E2's
 * #e8802a is chroma 190 on an object that may not out-shout the locomotive.
 */
export const BEAK = '#c07f4a'

/**
 * A rider standing on a coupled wagon, all of it relative to the wagon itself so
 * the two can never come out at different scales.
 *
 * `h` is a multiple of the wagon's own DRAWN height and `foot` is where its feet
 * go, as a fraction of that height measured up from the bottom of the drawing:
 * every wagon drawing is a 100x76 box whose body top edge is at y=19, i.e. 0.75 of
 * the way up, so 0.74 tucks the feet a hair behind the rim it is standing on.
 * `x` is the centre of the rider as a fraction of the wagon's width — over the near
 * END of the wagon, never over the opening, so the load is never covered.
 */
export const RIDER = { h: 0.62, aspect: 92 / 124, foot: 0.74, x: 0.24 } as const

/**
 * The queue on the station platform: which animal, where along the platform, and
 * how tall as a fraction of the station drawing's own height. Small, and behind the
 * rails, so nothing up here can be mistaken for one of the three things the round
 * is asking the child to choose between.
 */
export const PLATFORM = [
  { friend: 2, x: 0.1, h: 0.34 },
  { friend: 0, x: 0.62, h: 0.31 },
  { friend: 1, x: 0.78, h: 0.29 },
]

/**
 * The two animals waiting on the near bank, in FRONT of the rails — the other half
 * of "the characters ride, or they wait on the platform".
 *
 * The reference stages this constantly and it is the one composition our frame did
 * not have: frames-clean/frame-030 stands a sloth, a cow and a bird on the platform
 * in front of the train, frame-040 a cat and a monkey, frame-042 a raccoon at the
 * left edge and three more mid-frame. Every one of them is nearer than the train
 * and smaller than it, and the platform they stand on is the bottom of the frame.
 *
 * That bottom band was the largest flat region left here — the near bank, below the
 * ballast, with nothing in it but the go button and the tops of three bushes. These
 * two fill it, at the far left and far right so the go disc keeps the middle to
 * itself, and they are drawn SMALLER than a coupled wagon so the train stays the
 * subject.
 *
 * They ANSWER A FINGER, and that is not decoration. The measured objection E2 was
 * given was a large near face that did nothing — "the loudest instruction on the
 * screen, pointing at nothing" — so tapping one of these makes it hop where it
 * stands and chirp, inside the same frame as the touch, on a target at least 64 px
 * square. A four-year-old who aims at the animal instead of the wagon gets an
 * answer; he does not get a dead screen.
 *
 * `x` is the centre as a fraction of the frame width, `h` the drawing's height in
 * px, and `foot` how far its feet stand above the BOTTOM EDGE OF THE FRAME.
 *
 * The frame's bottom edge, and not the top of the go button's row, and that is a
 * measured constraint rather than a taste. These are painted after the game's own
 * column, so anything of theirs that overlaps a piece of rolling stock would TAKE
 * ITS TAP — and nothing may ever stand in front of one of the three things the round
 * is asking about, or in front of a coupled wagon the child is trying to take off
 * again. Anchored to the go row's top, the right-hand animal's hit box overlapped
 * the third parked wagon by three px in landscape and the locomotive by 17 px in
 * portrait, because the go row is 157 px in one orientation and 222 px in the other.
 * Anchored to the bottom edge, the top of a 100 px box is at y=660 in landscape
 * against rolling stock that ends at 609, and at y=916 in portrait against 819:
 * clear by 51 px and by 97 px, at the two sizes the game is checked at and at
 * everything between, because the frame's bottom edge does not move.
 *
 * Standing at the bottom edge is also where the reference puts them —
 * frames-clean/frame-042 lines its foreground with four of them at the very bottom
 * of the picture, two of them cut off by it.
 */
export const BANK_FRIENDS = [
  { friend: 0, x: 0.13, h: 92, foot: 8 },
  { friend: 2, x: 0.87, h: 84, foot: 4 },
]

/**
 * The balloons the station lets off when a train has gone — world mode's whole
 * reward moment. See `WorldCheer` for why it is not the classic full-screen wash.
 *
 * Fourteen of them, staggered, in the warm end of the scene's own palette plus the
 * two cool notes the sky already carries, so the cheer belongs to this place
 * rather than arriving from the section-A screen. `x` is a fraction of the frame
 * width, `d` the diameter in px, `ms` the climb and `delay` when it starts. They
 * are spread across the whole width and weighted towards the two thirds of it the
 * train does not stand in, so the rolling stock is never hidden by them.
 */
export const CHEER = [
  { x: 0.06, d: 46, ms: 2100, delay: 0, fill: '#e8695a' },
  { x: 0.14, d: 34, ms: 2400, delay: 180, fill: '#f0b93f' },
  { x: 0.23, d: 40, ms: 2200, delay: 90, fill: '#7fb8e0' },
  { x: 0.31, d: 28, ms: 2600, delay: 320, fill: '#e5a3ae' },
  { x: 0.40, d: 44, ms: 2300, delay: 240, fill: '#efc352' },
  { x: 0.48, d: 32, ms: 2500, delay: 60, fill: '#b3a6d6' },
  { x: 0.56, d: 38, ms: 2200, delay: 400, fill: '#e8695a' },
  { x: 0.64, d: 30, ms: 2650, delay: 150, fill: '#8ec98a' },
  { x: 0.71, d: 46, ms: 2150, delay: 300, fill: '#f0b93f' },
  { x: 0.79, d: 34, ms: 2450, delay: 30, fill: '#7fb8e0' },
  { x: 0.86, d: 40, ms: 2300, delay: 360, fill: '#e5a3ae' },
  { x: 0.92, d: 28, ms: 2600, delay: 200, fill: '#b3a6d6' },
  { x: 0.97, d: 36, ms: 2250, delay: 120, fill: '#efc352' },
  { x: 0.02, d: 30, ms: 2550, delay: 420, fill: '#8ec98a' },
]
