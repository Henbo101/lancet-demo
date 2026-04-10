/** Syncs 1.1.1 trend playback year with the Map tab (same indicator). */

let throughYear: number | null = null;
const listeners = new Set<() => void>();

export function setIndicator111AttrPlaybackYear(y: number): void {
  throughYear = y;
  listeners.forEach((fn) => fn());
}

export function getIndicator111AttrPlaybackYear(): number | null {
  return throughYear;
}

export function subscribeIndicator111AttrPlayback(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
