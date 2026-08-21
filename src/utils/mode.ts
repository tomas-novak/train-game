/**
 * Which screen this session is playing — roadmap section E.
 *
 * Two whole screens live in this app at once and both must stay reachable from
 * one preview URL on one tablet, because the point of the second one is to be
 * A/B tested against the first with a real four-year-old:
 *
 *   `?mode=classic`  the finished section-A screen: nine white cards on a pale
 *                    blue-grey wash over a grey ballast band. Unchanged, to the
 *                    pixel, and it is the control.
 *   `?mode=world`    the section-E screen: a place behind the rails.
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
