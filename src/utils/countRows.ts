/**
 * The shape of a small number.
 *
 * One place, because two rows on the screen have to agree: the dots under the
 * target numeral in the task panel, and the live count on the ground above the
 * rails. The child's whole task is "is my row the same shape as his row?", and
 * that question is only answerable if both rows break in the same place at the
 * same pitch. So neither component is allowed its own opinion about it.
 */

/**
 * How many dots may stand in one row. Five, because five is the biggest group a
 * four-year-old still takes in at a glance, and because "five and some more" is
 * the arrangement he will meet again on every ten-frame he ever sees. Seven dots
 * in one long line is a line he has to count; 5 + 2 is a shape he can read.
 */
export const COUNT_ROW_MAX = 5

/** The pitch between dots, as a fraction of the dot. One number, both rows. */
export const countRowGap = (dot: number): number => Math.max(3, Math.round(dot / 3))

/** 8 -> [5, 3]. A ten is 5 + 5 wherever it is drawn. */
export const splitCountRows = (n: number): number[] => {
  const rows: number[] = []
  for (let left = n; left > 0; left -= COUNT_ROW_MAX) {
    rows.push(Math.min(COUNT_ROW_MAX, left))
  }
  return rows
}

/**
 * The height a count block claims, so a caller can place it in a band it is
 * known to fit — the counter has to sit above the rails without covering a wheel.
 */
export const countRowHeight = (total: number, dot: number): number => {
  const rows = Math.max(1, splitCountRows(total).length)
  return rows * dot + (rows - 1) * countRowGap(dot)
}
