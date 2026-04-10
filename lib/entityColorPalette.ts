/**
 * Per-entity colours for multi-series charts — spaced for hue/lightness separation
 * (works better than teal↔teal interpolation when many regions/countries are selected).
 */
export const ENTITY_DISTINCT_COLORS = [
  '#0f766e', // teal
  '#1d4ed8', // blue
  '#7c3aed', // violet
  '#db2777', // pink
  '#c2410c', // orange
  '#ca8a04', // amber
  '#15803d', // green
  '#0e7490', // cyan
  '#4f46e5', // indigo
  '#b45309', // brown
  '#be185d', // rose
  '#047857', // emerald
  '#a16207', // yellow-brown
  '#0369a1', // sky
] as const;

export function distinctEntityColors(count: number): string[] {
  if (count <= 0) return [];
  return Array.from({ length: count }, (_, i) => ENTITY_DISTINCT_COLORS[i % ENTITY_DISTINCT_COLORS.length]);
}
