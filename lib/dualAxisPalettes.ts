import { interpolateRgb } from 'd3-interpolate';
import { distinctEntityColors } from '@/lib/entityColorPalette';

const TEAL_LO = '#ccfbf1';
const TEAL_HI = '#0f766e';
const ROSE_LO = '#fecdd3';
const ROSE_HI = '#9f1239';

/** @deprecated Prefer distinctEntityColors for multi-entity charts */
export function leftEntityColors(count: number): string[] {
  if (count <= 0) return [];
  if (count === 1) return [TEAL_HI];
  return Array.from({ length: count }, (_, i) =>
    interpolateRgb(TEAL_LO, TEAL_HI)(i / (count - 1)),
  );
}

/** @deprecated Prefer distinctEntityColors for multi-entity charts */
export function rightEntityColors(count: number): string[] {
  if (count <= 0) return [];
  if (count === 1) return [ROSE_HI];
  return Array.from({ length: count }, (_, i) =>
    interpolateRgb(ROSE_LO, ROSE_HI)(i / (count - 1)),
  );
}

/**
 * One clearly separated colour per entity for both axes (bars + lines track the same region/country).
 */
export function axisColorsForEntities(selected: string[]): {
  left: Record<string, string>;
  right: Record<string, string>;
} {
  const cols = distinctEntityColors(selected.length);
  const left = Object.fromEntries(selected.map((e, i) => [e, cols[i]]));
  return { left, right: { ...left } };
}

/** Distinct teal-line shades for multiple series on the left axis only (e.g. age groups). */
export const LEFT_SERIES_TEAL: string[] = ['#5eead4', '#14b8a6', '#0f766e'];
