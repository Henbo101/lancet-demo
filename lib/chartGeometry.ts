import type { ScaleBand } from 'd3-scale';

/** X centre for a bar in a grouped band-scale chart (multiple entities per year). */
export function bandEntityCenterX(
  year: number,
  entityIndex: number,
  entityCount: number,
  xScale: ScaleBand<number>,
  barWidth: number,
  gap: number,
): number {
  const base = xScale(year) ?? 0;
  if (entityCount <= 1) return base + xScale.bandwidth() / 2;
  return base + entityIndex * (barWidth + gap) + barWidth / 2;
}

/** X centre for grouped marks on a linear year scale (multiple entities per year). */
export function linearGroupedCenterX(
  entityIndex: number,
  entityCount: number,
  xAtYear: number,
  slotWidth: number,
): number {
  if (entityCount <= 1) return xAtYear;
  const offset = (entityIndex - (entityCount - 1) / 2) * slotWidth;
  return xAtYear + offset;
}
