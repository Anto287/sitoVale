export type Pt = readonly [number, number]

/**
 * Curva morbida che passa per tutti i punti (Catmull-Rom convertita in Bézier):
 * nei punti di giunzione la direzione non cambia mai di colpo, quindi niente spigoli.
 */
export function smoothPath(pts: readonly Pt[], digits = 1) {
  const f = (n: number) => n.toFixed(digits)
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`
  }
  return d
}
