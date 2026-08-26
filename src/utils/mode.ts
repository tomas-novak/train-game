/**
 * Which screen this session is playing — roadmap section E.
 *
 * Two whole screens live in this app at once and both must stay reachable from
 * one preview URL on one tablet, because the point of the second one is to be
 * A/B tested against the first with a real four-year-old:
 *
 *   `?mode=classic`  the finished section-A screen: nine white cards on a pale
 *                    blue-grey wash over a grey ballast band, its own drawings,
 *                    its own palette and its own cheer, none of it touched.
 *   `?mode=world`    the section-E screen: a place behind the rails.
 *
 * Not pixel-identical to the pre-vrstva-1 control any more, and that is an
 * approved change rather than drift: this task's next button (roadmap B1) and
 * its 8 s celebration fallback apply to both modes, on purpose and identically,
 * because the one thing an A/B test cannot survive is a pacing difference
 * neither side chose — a button on one screen and an auto-advance on the other
 * would make the comparison two variables instead of one. So the shared control
 * is everything ELSE: the drawings, the palette and the cheer are classic's own
 * and stay that way; only the pacing mechanism is common to both screens.
 *
 * World is the default when no parameter is given, so the plain preview URL
 * shows the new screen and the old one is one query string away.
 *
 * Read once, from the URL, and never from state: a mode change is a reload, so
 * nothing in the app has to be able to switch palettes while it is running.
 */
export type SceneMode = 'world' | 'classic'

export function readMode(search: string = window.location.search): SceneMode {
  return new URLSearchParams(search).get('mode') === 'classic' ? 'classic' : 'world'
}
