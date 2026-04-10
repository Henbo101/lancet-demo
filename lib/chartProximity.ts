/** Geometry helpers for hover: nearest point on polyline segments. */

export function distancePointToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-12) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const qx = x1 + t * dx;
  const qy = y1 + t * dy;
  return Math.hypot(px - qx, py - qy);
}

export function nearestAlongPolylines<T extends string>(
  mx: number,
  my: number,
  polylines: { id: T; pts: { x: number; y: number }[] }[],
  maxDist: number,
): T | null {
  let best: T | null = null;
  let bestD = maxDist;
  for (const pl of polylines) {
    const { pts, id } = pl;
    if (pts.length === 0) continue;
    if (pts.length === 1) {
      const d = Math.hypot(mx - pts[0].x, my - pts[0].y);
      if (d < bestD) {
        bestD = d;
        best = id;
      }
      continue;
    }
    for (let i = 0; i < pts.length - 1; i++) {
      const d = distancePointToSegment(
        mx,
        my,
        pts[i].x,
        pts[i].y,
        pts[i + 1].x,
        pts[i + 1].y,
      );
      if (d < bestD) {
        bestD = d;
        best = id;
      }
    }
  }
  return best;
}

export function nearestYearFromXLinear(
  innerX: number,
  years: number[],
  xAt: (y: number) => number,
): number {
  if (years.length === 0) return 0;
  let best = years[0];
  let bestDx = Infinity;
  for (const y of years) {
    const dx = Math.abs(xAt(y) - innerX);
    if (dx < bestDx) {
      bestDx = dx;
      best = y;
    }
  }
  return best;
}
