export function darken(hex: string): string {
  if (!hex.startsWith('#') || hex.length !== 7) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const d = (x: number) => Math.max(0, Math.floor(x * 0.78)).toString(16).padStart(2, '0')
  return `#${d(r)}${d(g)}${d(b)}`
}
