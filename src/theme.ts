export const SKY = {
  name: 'Sky',
  skyTop: '#e6f1fa',
  skyBot: '#f3ecf6',
  hillBack: '#d8e2ed',
  hillFront: '#c7d9e6',
  sun: '#fff3c6',
  cloud: '#ffffff',
  panel: '#ffffff',
  panelEdge: '#e6e9f1',
  shadow: 'rgba(60, 70, 110, 0.18)',
  softShadow: 'rgba(60, 70, 110, 0.10)',
  ink: '#2b3856',
  inkSoft: '#7884a3',
  accent: '#7aa6e0',
  accent2: '#f5a3a8',
  good: '#7ac4a0',
  bad: '#e08a8a',
  rail: '#6b7693',
  railHi: '#9aa3bd',
  tie: '#b8c1d5',
  tieDark: '#8a92ab',
  ground: '#d7dde9',
  steam: {
    body: ['#f5a3a8', '#d97a82'] as [string, string],
    boilerHi: '#fbc1c5',
    cab: ['#9aa3bd', '#6b7693'] as [string, string],
    cabHi: '#b8c1d5',
    window: '#dcecf4',
    windowFrame: '#2b3856',
    chimney: '#2b3856',
    steam: '#ffffff',
    wheel: '#2b3856',
    wheelHub: '#b8c1d5',
    head: '#fff3c6',
    plate: '#b8c1d5',
  },
  electric: {
    body: ['#7aa6e0', '#4d7ab8'] as [string, string],
    nose: '#3a629c',
    bodyHi: '#a3c1ec',
    stripe: '#fff3c6',
    window: '#e8f1fb',
    windowFrame: '#2b3856',
    pan: '#b8c1d5',
    wheel: '#2b3856',
    head: '#fff3c6',
    panRail: '#6b7693',
  },
  diesel: {
    body: ['#a5d8c0', '#74b596'] as [string, string],
    bodyHi: '#c6e6d4',
    stripe: '#2b3856',
    window: '#dcecf4',
    windowFrame: '#2b4d3a',
    nose: '#5fa181',
    grille: '#2b4d3a',
    wheel: '#2b3856',
    head: '#fff3c6',
    smoke: '#c6cad8',
  },
  hopper: {
    body: ['#b9a8d8', '#8e79b5'] as [string, string],
    bodyHi: '#d2c4e6',
    stripe: '#fff3c6',
    wheel: '#2b3856',
  },
  tank: {
    body: ['#f0eef6', '#cbc7d8'] as [string, string],
    bodyHi: '#ffffff',
    band: '#f5a3a8',
    cap: '#b8c1d5',
    saddle: '#7884a3',
    wheel: '#2b3856',
  },
  box: {
    body: ['#f5b78a', '#d68d5a'] as [string, string],
    bodyHi: '#fbcfac',
    roof: ['#8a5a3e', '#6b4530'] as [string, string],
    door: '#a87a5a',
    doorHi: '#c89878',
    doorEdge: '#6b4530',
    // The inside of the slid-open door. Deliberately the darkest brown in the
    // set: a load only reads if there is an unlit doorway behind it, which is
    // exactly how the reference lights its basket of apples.
    opening: '#3d2418',
    wheel: '#2b3856',
  },
  flatcar: {
    deck: ['#8a92ab', '#5e677e'] as [string, string],
    deckHi: '#aab2c6',
    stake: '#2b3856',
    wheel: '#2b3856',
  },
  passenger: {
    body: ['#e08a8a', '#b85e60'] as [string, string],
    bodyHi: '#eea8a8',
    roof: ['#8a4044', '#6b2e32'] as [string, string],
    stripe: '#fff3c6',
    window: '#dcecf4',
    windowFrame: '#6b2e32',
    door: '#8a4044',
    wheel: '#2b3856',
  },
  logcar: {
    deck: ['#b8a08a', '#8a6f5a'] as [string, string],
    stake: '#2b3856',
    log3: '#e8d0b3',
    wheel: '#2b3856',
  },
  // ── cargo objects ──────────────────────────────────────────────────────────
  // The wagons are pastel; the things they carry are not. In the reference every
  // payload is a saturated, high-contrast object sitting in the opening, and it
  // never repaints the wagon underneath. These four palettes are the ones a
  // critic read blind at card size and could not name, so they are now built
  // around one strong hue each: milk blue, fuel red, apple red-and-green, a
  // present in amber and red.
  coal: { a: '#2b3856', b: '#4a5577', c: '#6b7693', hi: '#9aa3bd' },
  sand: { a: '#f5d589', b: '#d4b25c', hi: '#fce4ab', dot: '#a87f4a' },
  // Milk stands on top of a near-white tank, against a white card, so every
  // white bottle carries a navy rim and stands in a strong blue crate.
  milk: { bottle: '#ffffff', crate: '#2f6fc4', crateHi: '#6f9bd8', rim: '#17325c', cap: '#2f6fc4' },
  // A red jerrycan: handle, spout, X-braced panel. The old drum was a dusty rose
  // cylinder with a cream striped band and read as a layer cake.
  fuel: { can: '#e0483c', canHi: '#f4756a', canDark: '#a5302a', cap: '#2b3856', brace: '#a5302a' },
  // A woven basket with one red and one green apple over the rim, straight off
  // the reference. Saturated, because salmon circles on a brown wall vanish.
  apples: {
    red: '#e2453c', redDark: '#ab2f28', green: '#5fbd4f', greenDark: '#3d8c36',
    leaf: '#4aa85a', stem: '#6b4530', hi: '#f7938a',
    basket: '#f0cf8f', basketDark: '#c1913f',
  },
  // A wrapped present: amber box, red ribbon, red bow. Brown parcels in a brown
  // doorway were a smudge.
  parcels: { box: '#f2b134', boxHi: '#fbd383', boxDark: '#c8871f', ribbon: '#d9453c', ribbonDark: '#a5302a' },
  cars: { body: '#7aa6e0', bodyDark: '#4d7ab8', window: '#e8f1fb', wheel: '#2b3856', head: '#fff3c6' },
  people: { skinA: '#f5d589', skinB: '#d8967c', shirtA: '#f5a3a8', shirtB: '#7aa6e0', hair: '#5b3024' },
  logs: { outer: '#8a6f5a', mid: '#b89878', inner: '#d1b395', crack: '#5b3024' },
} as const

export type SkyTheme = typeof SKY

/**
 * The world mode's palette — roadmap E1.
 *
 * `SKY` above is one value. Measured off our own screen: sky #e6f1fa, ballast
 * rgb(208,224,240), hills #d8e2ed and #c7d9e6, ties #b8c1d5. Every one of those
 * is a pale blue-grey between 199 and 246 per channel, so the whole frame is a
 * single wash and the loudest shape in it is a grey slab that means nothing.
 *
 * This palette is read off `reference/sago/blind/*.png` and
 * `reference/sago/frames-clean/*.jpg` instead, and the thing it copies is not a
 * hue, it is a STRUCTURE: three or four flat grounds in one hue family, each a
 * real step darker than the one behind it, over a sky that is paler and less
 * saturated than any of them, with the warm objects (track, wood, lantern) as
 * the only non-green things standing in it.
 *
 * The steps, in HSL lightness of the green family: 91% sky (ice, barely green),
 * 84% far hill, 76% mid hill, 64% the field the train stands on, 54% the
 * foreground the go button stands on, 38%/31% the tree crowns. Five steps of
 * roughly ten points each — the reference's own interval — so depth comes out
 * of value and overlap and needs no gradient, no stroke and no drop shadow
 * anywhere. There are none of those three in this palette or in the scene that
 * uses it, exactly as there are none anywhere in the reference.
 *
 * Nothing here is shared with `SKY`. The classic screen keeps every colour it
 * has; this is a second set, used only by the world mode.
 */
export const WORLD = {
  name: 'World',
  /**
   * Flat, and warm — the reference's skies are one tint, and they are not always
   * blue: frames-clean/frame-098 is flat apricot behind lilac buildings and
   * blind/sago-trains-04 is flat pink behind rose mountains. Round 2's #dcf0f2
   * measured as 34% of the frame's pixels sitting in the top luminance bin,
   * nearly all of it empty near-white above the horizon. Apricot is about the
   * same value but it is a colour rather than the absence of one, and the
   * mountains standing in it are what actually fill the band.
   */
  sky: '#ffdfae',
  cloud: '#fff6e6',
  /**
   * The two far ranges standing in the sky band.
   *
   * E1 drew these as two rows of hard triangular sawteeth in lilac #c9a9dd and
   * rose #ef97ae, filling the sky band to within 15 px of the top edge. Two
   * things were wrong with that and both are structural. The shape: every peak
   * was a spike with a straight edge, and the reference has no angular landscape
   * anywhere — blind/sago-trains-01 draws its distance as three enormous soft
   * humps in one flat fill, and frame-100's background is round shapes and
   * rectangles. The value: rose at chroma 88 across a quarter of the frame is a
   * loud shape competing with the train for the eye, which is the one thing the
   * gate forbids.
   *
   * So these are round lobes now (see `RANGE_FAR` in data/world.ts) and both
   * tones are dusty: chroma 47 and 50 against the locomotive's 95, so the sky
   * band is filled by something that is unmistakably behind everything and
   * nothing in it out-shouts the rolling stock.
   */
  mountainFar: '#f0cbc0',
  mountainNear: '#dcaab4',
  /**
   * The high terrace — the yard the OFFERED wagons stand on.
   *
   * New in round 3, and the fix for the whole-screen verdict. With the card
   * plates gone the four offered wagons were left standing on nothing: measured,
   * every one of them was entirely above the horizon, two of them in open sky and
   * two apparently parked on a station roof. The reference never leaves a
   * touchable thing in mid-air — it builds the upper half of the frame as a
   * platform and stands its characters ON it, and frames-clean/frame-095,
   * frame-096 and frame-140 are all the same composition: a broad ledge across
   * the picture with characters on top of it and the train on the rails below.
   *
   * This is that ledge: the palest ground, highest on the screen and therefore
   * furthest away, with the hills, the station and the trees all standing in
   * FRONT of its top edge and the sidings the wagons stand on laid across it.
   */
  terrace: '#cfe9c0',
  /** The two hill ranges behind the horizon, palest first. */
  hillFar: '#b8dfae',
  hillMid: '#a2d494',
  /**
   * The field the rails are laid on, and what the train therefore stands ON.
   *
   * Round 2 took the whole green family DOWN in chroma, and that is the fix for
   * the failed gate rather than a taste change. Round 1's field was #83cd75 and
   * measured, over a clear stretch, a mean chroma of 86 against a train of 65:
   * the ground shouted and the train whispered, which is the opposite of the
   * reference (Sago's field measures 99.5 against a loco of 124.2 — the train is
   * the loudest thing in the frame). Two moves, in opposite directions, close it:
   * the grounds come down to the low 60s here, and the rolling stock goes up into
   * the 120-200s in `WORLD_STOCK` below. The value STEPS between the five grounds
   * are untouched, so the depth the last round did win is untouched with them.
   */
  field: '#8ec97e',
  /**
   * The near bank, in front of the rails: one step darker again — and in E2 a
   * much bigger step than the four points E1 left here.
   *
   * The measured objection was that below the horizon the row luminance never
   * left the 142-169 band, so the bottom 45% of the frame — the half the game
   * happens in — was one flat green sheet. #7cbe6c against a field of #8ec97e is
   * six points of lightness, which is not a ground step, it is a seam. This is
   * sixteen, and there are now two more edges in that half of the frame: the
   * embankment `cutting` immediately under the ballast, and the dock face the
   * waiting wagons stand on.
   */
  bank: '#63a755',
  /**
   * The nearest ground of all: a third curve across the bottom of the bank.
   *
   * The measured objection E1 was given and E2 only half closed is that below the
   * horizon the row luminance barely moves, so the half of the frame the game
   * happens in reads as one sheet of green. Two curves were not enough on their
   * own — the bottom quarter, which is the biggest single expanse in the picture
   * and the one the go button stands on, had no edge in it anywhere. This is that
   * edge: one more step down, the same eleven-point interval the other grounds use,
   * running the full width so it is ground and not a shape.
   */
  bankNear: '#54934a',
  /**
   * The strip of turned earth the embankment sits in, immediately below the
   * ballast shoulder. Darkest ground on the screen, ten px tall, and the reason
   * the track no longer looks laid on top of a green sheet: there is a shadow
   * side to the formation it is built on.
   */
  cutting: '#4a7f3e',
  /** Foreground shrubbery, darker than the bank it sits on. */
  bush: '#4c9440',
  bushDark: '#3d7c34',
  /** Tree crowns: the darkest greens on the screen, and the only dark mass. */
  crown: '#3f8a4c',
  crownDark: '#2f7340',
  trunk: '#b58455',
  trunkDark: '#96683c',
  /** The station: warm wood, so it is not another green and not another grey. */
  wall: '#e8bd85',
  wallDark: '#cf9d5f',
  roof: '#c0703c',
  roofDark: '#a25a2e',
  window: '#ffe9b0',
  door: '#8d5a34',
  platform: '#e0c79b',
  platformEdge: '#bb9a63',
  /**
   * The permanent way. Third attempt, and this time it is measured off the
   * reference rather than argued from first principles.
   *
   * Round 1 built a ladder out of two rails with the ties filling the whole gap
   * between them, and it read as a fence lying across the picture with a toy
   * balanced on it. Round 2 over-corrected to ONE 5 px line with pale tan tabs
   * hanging below it, and the critic measured the result: the tabs were lighter
   * than the rail AND lighter than the field, so the assembly read as a dashed
   * road marking, and it was the thinnest object in the lower half of the frame,
   * sitting at exactly the spot the game happens.
   *
   * Every reference frame does the same third thing, and it is neither of ours.
   * blind/sago-trains-02, blind/sago-trains-04, blind/sago-trains-07 and
   * frames-clean/frame-140 all draw: a near-black rail the wheels sit on, a bed
   * of DARK brown ties immediately under it on a grey ballast that is darker
   * than the ground either side, a second near-black rail closing the bed, and a
   * ballast shoulder under that. Roughly 35 px of assembly in a 775 px frame,
   * and it is the second-heaviest thing in the picture after the train.
   *
   * So: `rail` is near-black, `tie` is darker than the field by 100 per channel,
   * `ballast` is darker than the field, and nothing in the assembly is lighter
   * than the ground it is laid on. Which is the whole difference between a
   * railway and a wire fence.
   */
  rail: '#2f2b26',
  ballast: '#8f8578',
  ballastDark: '#776d61',
  tie: '#66452a',
  tieDark: '#4e3420',
  /**
   * A bay on the rails still waiting for a wagon.
   *
   * The classic bay is three greys of the grey ballast it is pressed into. The
   * rule survives; the ground does not. Here the bay is pressed into a green
   * field crossed by a wooden ladder, and neither of those can be a step down
   * into itself: a green bay disappears into the 52 px of field between every
   * pair of sleepers, and a tan one disappears into the sleepers. So the bay is
   * bare turned earth — the one thing that is credibly under both — with the
   * same three tones doing the same three jobs: a lit near lip, an opaque floor,
   * and the shadow under the far lip. Being opaque it cuts the ladder, so ten of
   * them are ten countable gaps in the track.
   *
   * E2 lightens all three. E1's floor was #6f665b against a ballast of #8f8578,
   * i.e. 32 per channel DARKER than the bed it is pressed into, and on the
   * screenshot the two empty bays of a count-2 round were the heaviest objects
   * below the horizon — two charcoal slabs beside a train they outweighed. A bay
   * has to be a dip, and a dip is a few points down, not a hole cut through the
   * picture. These are 5, 21 and 24 points either side of the ballast's own
   * value, so ten of them still read as ten countable gaps and none of them
   * competes with a wagon. The floor stays a little darker than the ballast it is
   * cut into, because that is what a hole is.
   */
  slotFloor: '#7a7064',
  slotShade: '#615748',
  slotLip: '#a89d8e',
  /**
   * The signal beside the rails.
   *
   * Round 1's read as a road sign, round 2's as a traffic light — "a worse
   * mistranslation on a railway", and fair: a brown box with two dots on a 3 px
   * stick that stopped in the grass with no foot is not railway kit in any
   * picture. What makes a signal a signal in flat art is the target board it is
   * mounted on and the fact that it is planted: so the housing now sits on a
   * pale board, the post is a real post with a foot, and there is a ladder up
   * the back of it. Post and board are wood and cream, so the darkest thing on
   * this half of the screen stays the rail.
   */
  signalPost: '#7a5a3c',
  signalPostDark: '#5f4529',
  signalBoard: '#f4e7cd',
  signalHousing: '#4a3625',
  /** The lamp post in the foreground, and the light in it. */
  lampPost: '#4d5a6b',
  lampGlow: '#ffdf8a',
  fence: '#f0e3c4',
  fenceDark: '#d3c29c',
  /**
   * The one live thing in the scene, and it is deliberately not a cat any more.
   *
   * Round 2's was, in the critic's words, "not a face in the reference's manner,
   * it is Sago Mini's cat" — same orange body, same magenta triangular nose, same
   * two dot eyes, same raised paw, next to the same pose in
   * blind/sago-trains-07. Competing with a thing by tracing it is not competing
   * with it, so the animal changed: round ears instead of triangles, a pale
   * muzzle, a round dark nose, no whiskers, rust rather than Sago's orange. It is
   * a bear cub. It keeps the two jobs the cat was doing — a face in the frame and
   * a saturated near object — and none of the shapes.
   */
  /*
   * E2 round 2 takes all three of these down, and it is the measured half of the
   * attention-order fix. #c85f2a is chroma 158 as a fill and the cub's head
   * measured 112.6 as a region — the loudest thing in the opening frame, ahead of
   * the train at 73.5. A character that cannot be touched may not be the loudest
   * object on a screen whose subject is the train, so the cub is a dun brown now:
   * chroma 70, 66 and 41, which puts every one of its fills below every body
   * colour on the rolling stock (120-215) and below the station's own roof. It is
   * still the only face on the near bank and still the warmest thing on a green
   * ground; it simply no longer wins.
   */
  cub: '#a5825f',
  cubDark: '#8a6a48',
  cubMuzzle: '#e6d5bd',
  cubInk: '#33200f',
  bird: '#e2457f',
  birdWing: '#c22f66',
  birdBeak: '#ffc24d',
  /**
   * The birds high in the sky, and they used to be drawn in `mountainNear`.
   *
   * Which meant they were invisible: a dusty rose arc on a dusty rose mountain,
   * measured at 0.3% ink across the entire tile row they live in. A bird up there is
   * the one thing in the sky band meant to be a small dark shape rather than a soft
   * mass, so it gets a tone of its own — the same rose family, two steps down. Far
   * enough from both ranges to read as a silhouette against either of them, and at
   * chroma 53 against the locomotive's 110 nothing up there competes with the train.
   */
  birdSky: '#a8737f',
  /**
   * the keeper standing on the dock beside the waiting wagons — roadmap E2.
   *
   * The choice itself had nothing alive in it: the cub is on the near bank and the
   * bird is on the station roof, and the three wagons a child is being asked to
   * choose between had no face anywhere near them. This is a mouse, in a grey that
   * belongs to none of the three grounds and to none of the rolling stock, with a
   * cap in the loco's own yellow so the one warm accent in the frame is shared
   * with the train rather than being a fourth new hue.
   */
  keeper: '#9aa3ad',
  keeperDark: '#7c848e',
  keeperEar: '#f0b9c4',
  keeperCap: '#f6b21f',
  keeperCapDark: '#d1901a',
  /**
   * The loading dock the waiting wagons stand on — roadmap E2, and this round's
   * biggest single change.
   *
   * E1 stood them on a second railway: a full ladder of two rails, dark ties and
   * ballast, laid across the picture at 55% of the height with a buffer stop at
   * the end of it. The measured objection is that the frame then had TWO
   * full-width rail lines in it, one of them carrying the child's train and one
   * of them carrying the wagons he has not chosen yet, told apart by nothing but
   * position — and the reference has exactly one track per frame, at the very
   * bottom, as the second-heaviest thing in the picture.
   *
   * So the wagons no longer stand on rails at all. They stand on the front edge
   * of the ground behind them: the terrace ends in a low step, and the step has a
   * face. That is the reference's own composition — frames-clean/frame-100 and
   * frame-101 stand a pig, a cow, a raccoon and a rabbit on a broad ledge whose
   * front is a plain darker band with vertical seams in it, with the train on the
   * rails below — and it costs the picture no second railway.
   *
   * `dockFace` is darker than the field below it as well as the terrace above it,
   * because it is a vertical face and the light in this scene comes from above;
   * `dockTop` is the lit edge along the top of it; `dockSeam` is the plank joint,
   * dark enough to be a line and not a shade.
   */
  dockTop: '#bcdcab',
  dockFace: '#6d9d5c',
  dockFaceDark: '#5b8a4c',
  dockSeam: '#4e7a41',
  /**
   * The strap the signs hang from.
   *
   * The task panel, the '?' and the mute switch used to be four pieces of
   * furniture floating in the sky. They are the same panels, at the same
   * geometry, but each now hangs from the top edge of the frame on a wooden
   * strap — which is how the reference hangs the things that are not part of the
   * landscape: frames-clean/frame-100 hangs a station clock and a lamp from the
   * top of its own frame on exactly this kind of bracket.
   */
  hanger: '#a4723d',
  hangerDark: '#7d5326',
} as const

export type WorldTheme = typeof WORLD

/**
 * The rolling stock, in world mode only — roadmap E1's second deliverable.
 *
 * The brief asked for "real value separation between sky, ground and the train,
 * so the train is the most saturated thing in the frame rather than the palest",
 * and round 1 failed it by measurement: in world mode the train's own bounding
 * box came out at mean chroma 65 against a ground of 89, i.e. the train was
 * QUIETER than the field it stood in, quieter than the sleepers, quieter than
 * the lamp and far behind the go button. The cause is that `SKY`'s rolling stock
 * is a pastel set built for a pale blue-grey screen: dusty rose, lilac, near
 * white, grey-blue steel. On a green field those are the palest objects present.
 *
 * So world mode draws the same train in a different set of paints. Nothing but
 * the colours changes — every shape, size, silhouette, cargo and animation is
 * the section-A drawing, which is the one that already won its own round — and
 * the colours are read off the reference: one saturated hue per vehicle, a dark
 * warm opening where the reference has a doorway or a window, one warm accent
 * band, and grey-green wheels. Measured chroma of the bodies runs 120-215, so
 * the train outranks every ground on the screen by a wide margin, which is the
 * relationship the reference has and the gate asks for.
 *
 * Built by spreading `SKY`: the cargo palettes (coal, milk, apples, parcels…)
 * are already saturated objects designed to sit in an unlit opening and are
 * deliberately shared, so the load the child matched on the card is the identical
 * drawing on the rails in both modes. `SKY` itself is not touched, so the classic
 * screen is byte-for-byte the control it was.
 *
 * Round 3 flattens every one of them. The pairs are still pairs, because the
 * drawings feed them to a `linearGradient` that both modes share, but in this set
 * both stops are the same colour, so the world's rolling stock paints flat. The
 * critic measured the drift the pairs used to produce — loco body rgb(239,170,27)
 * to rgb(220,149,19) over 17 px, cab rgb(207,56,37) to rgb(195,48,30) — and the
 * objection is exactly right: the scene had been cleaned of gradients and drop
 * shadows and the train, now the focal object, was the last thing wearing both.
 * The soft ellipse under the footplate and the smudge under each wheel go the
 * same way; see `GroundShadow` in components/svgs.tsx, gated on the mode for the
 * same reason and in the same round.
 */
export const WORLD_STOCK = {
  ...SKY,
  name: 'WorldStock',
  steam: {
    body: ['#f6b21f', '#f6b21f'] as [string, string],
    boilerHi: '#ffd05e',
    cab: ['#e2452f', '#e2452f'] as [string, string],
    cabHi: '#f4715b',
    window: '#6b3f22',
    windowFrame: '#3a2110',
    chimney: '#3a2a20',
    steam: '#ffffff',
    wheel: '#4a5a52',
    wheelHub: '#9fb0a5',
    head: '#ffe98a',
    plate: '#b5541f',
  },
  electric: {
    body: ['#2f6fc4', '#2f6fc4'] as [string, string],
    nose: '#173d78',
    bodyHi: '#5b95dd',
    stripe: '#ffd34d',
    window: '#e8f1fb',
    windowFrame: '#12305e',
    pan: '#8b9aa8',
    wheel: '#4a5a52',
    head: '#ffe98a',
    panRail: '#3a4a58',
  },
  diesel: {
    body: ['#2fa564', '#2fa564'] as [string, string],
    bodyHi: '#5cc48c',
    stripe: '#ffd34d',
    window: '#e8fbf1',
    windowFrame: '#12452c',
    nose: '#17683c',
    grille: '#124a2b',
    wheel: '#4a5a52',
    head: '#ffe98a',
    smoke: '#dfe4ea',
  },
  hopper: {
    body: ['#8b4ecb', '#8b4ecb'] as [string, string],
    bodyHi: '#b47ae6',
    stripe: '#ffd34d',
    wheel: '#4a5a52',
  },
  tank: {
    body: ['#2fb3c9', '#2fb3c9'] as [string, string],
    bodyHi: '#6fd6e5',
    band: '#ffd34d',
    cap: '#12586a',
    saddle: '#12586a',
    wheel: '#4a5a52',
  },
  box: {
    body: ['#f2871f', '#f2871f'] as [string, string],
    bodyHi: '#ffb15c',
    roof: ['#7a4322', '#7a4322'] as [string, string],
    door: '#b8601a',
    doorHi: '#e08434',
    doorEdge: '#5e3018',
    opening: '#3d2418',
    wheel: '#4a5a52',
  },
  flatcar: {
    deck: ['#c0562a', '#c0562a'] as [string, string],
    deckHi: '#e0783f',
    stake: '#3a2110',
    wheel: '#4a5a52',
  },
  passenger: {
    body: ['#e2452f', '#e2452f'] as [string, string],
    bodyHi: '#f4715b',
    roof: ['#8c2b1c', '#8c2b1c'] as [string, string],
    stripe: '#ffd34d',
    window: '#ffe9b0',
    windowFrame: '#6d2014',
    door: '#8c2b1c',
    wheel: '#4a5a52',
  },
  logcar: {
    deck: ['#b5854f', '#b5854f'] as [string, string],
    stake: '#3a2110',
    log3: '#e8d0b3',
    wheel: '#4a5a52',
  },
} as const
