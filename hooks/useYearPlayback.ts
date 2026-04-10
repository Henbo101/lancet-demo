'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STEP_MS = 420;

export interface YearPlaybackState {
  /** Earliest year in the series (inclusive). */
  minYear: number;
  /** Latest year in the series (inclusive). */
  maxYear: number;
  /** Animation and display stop at this year (slider). */
  endYear: number;
  setEndYear: (y: number) => void;
  /** Data is shown for years ≤ this value. */
  throughYear: number;
  setThroughYear: (y: number) => void;
  playing: boolean;
  play: () => void;
  pause: () => void;
  /** Show full series (throughYear = max). */
  reset: () => void;
}

function sortedUnique(years: number[]): number[] {
  return [...new Set(years)].sort((a, b) => a - b);
}

export function useYearPlayback(yearsInput: number[]): YearPlaybackState {
  const sortedYears = useMemo(() => sortedUnique(yearsInput), [yearsInput]);
  const yearKey = sortedYears.join(',');

  const minYear = sortedYears[0] ?? 0;
  const maxYear = sortedYears[sortedYears.length - 1] ?? 0;

  const [endYear, setEndYearState] = useState(maxYear);
  const [throughYear, setThroughYearState] = useState(maxYear);
  const [playing, setPlaying] = useState(false);
  const sortedRef = useRef(sortedYears);
  sortedRef.current = sortedYears;

  useEffect(() => {
    const s = sortedRef.current;
    if (s.length === 0) return;
    const max = s[s.length - 1];
    setEndYearState(max);
    setThroughYearState(max);
    setPlaying(false);
  }, [yearKey]);

  const setEndYear = useCallback(
    (y: number) => {
      const s = sortedRef.current;
      if (s.length === 0) return;
      const lo = s[0];
      const hi = s[s.length - 1];
      const clamped = Math.max(lo, Math.min(hi, y));
      setEndYearState(clamped);
      setThroughYearState((ty) => Math.min(ty, clamped));
    },
    [],
  );

  const setThroughYear = useCallback(
    (y: number) => {
      const s = sortedRef.current;
      if (s.length === 0) return;
      const lo = s[0];
      const hi = s[s.length - 1];
      setThroughYearState(Math.max(lo, Math.min(hi, y)));
    },
    [],
  );

  const reset = useCallback(() => {
    const s = sortedRef.current;
    const max = s[s.length - 1] ?? 0;
    setThroughYearState(max);
    setEndYearState(max);
    setPlaying(false);
  }, []);

  const pause = useCallback(() => setPlaying(false), []);

  const play = useCallback(() => {
    const s = sortedRef.current;
    if (s.length === 0) return;
    setThroughYearState(s[0]);
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const s = sortedRef.current;
    if (s.length === 0) {
      setPlaying(false);
      return;
    }
    const cap = Math.min(endYear, s[s.length - 1]);
    const ty = throughYear;
    if (ty >= cap) {
      setPlaying(false);
      return;
    }
    const idx = s.indexOf(ty);
    const next = s.slice(idx + 1).find((y) => y <= cap);
    if (next === undefined) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setThroughYearState(next), STEP_MS);
    return () => window.clearTimeout(id);
  }, [playing, throughYear, endYear]);

  return {
    minYear,
    maxYear,
    endYear,
    setEndYear,
    throughYear,
    setThroughYear,
    playing,
    play,
    pause,
    reset,
  };
}
