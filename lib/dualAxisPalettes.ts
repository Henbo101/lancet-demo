import { interpolateRgb } from 'd3-interpolate';

const TEAL_LO = '#ccfbf1';
const TEAL_HI = '#0f766e';
const ROSE_LO = '#fecdd3';
const ROSE_HI = '#9f1239';

/** Colours for left-Y geometry (bars, stacked areas, left-axis lines) — teal family, one per entity. */
export function leftEntityColors(count: number): string[] {
  if (count <= 0) return [];
  if (count === 1) return [TEAL_HI];
  return Array.from({ length: count }, (_, i) =>
    interpolateRgb(TEAL_LO, TEAL_HI)(i / (count - 1)),
  );
}

/** Colours for right-Y geometry (lines, rates) — rose family, one per entity. */
export function rightEntityColors(count: number): string[] {
  if (count <= 0) return [];
  if (count === 1) return [ROSE_HI];
  return Array.from({ length: count }, (_, i) =>
    interpolateRgb(ROSE_LO, ROSE_HI)(i / (count - 1)),
  );
}

export function axisColorsForEntities(selected: string[]): {
  left: Record<string, string>;
  right: Record<string, string>;
} {
  const n = selected.length;
  const L = leftEntityColors(n);
  const R = rightEntityColors(n);
  return {
    left: Object.fromEntries(selected.map((e, i) => [e, L[i]])),
    right: Object.fromEntries(selected.map((e, i) => [e, R[i]])),
  };
}

/** Distinct teal-line shades for multiple series on the left axis only (e.g. age groups). */
export const LEFT_SERIES_TEAL: string[] = ['#5eead4', '#14b8a6', '#0f766e'];
