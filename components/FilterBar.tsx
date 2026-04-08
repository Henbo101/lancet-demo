'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useIndicatorStore } from '@/store/useIndicatorStore';
import { REGIONS, YEAR_MIN, YEAR_MAX } from '@/lib/data';

export default function FilterBar() {
  const {
    selectedRegion,
    selectedDataType,
    yearRange,
    setRegion,
    setDataType,
    setYearRange,
  } = useIndicatorStore();

  /* ── Year playback ── */
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    setPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    const store = useIndicatorStore.getState();
    let cursor = store.yearRange[0];

    setYearRange([YEAR_MIN, YEAR_MIN]);
    setPlaying(true);

    intervalRef.current = setInterval(() => {
      cursor += 1;
      if (cursor > YEAR_MAX) {
        stop();
        return;
      }
      setYearRange([YEAR_MIN, cursor]);
    }, 180);
  }, [setYearRange, stop]);

  const toggle = useCallback(() => {
    if (playing) stop();
    else play();
  }, [playing, play, stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const minPct = ((yearRange[0] - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100;
  const maxPct = ((yearRange[1] - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100;

  return (
    <div className="sticky top-0 z-50 bg-lancet-gray-100 border-b border-lancet-gray-border">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-8 gap-y-3">
        {/* ── Region dropdown ── */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-lancet-gray-600">
            Region
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setRegion(e.target.value)}
            className="px-3 py-1.5 text-sm border border-lancet-gray-border rounded bg-white text-lancet-dark focus:outline-none focus:ring-2 focus:ring-lancet-dark-blue"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* ── Data-type toggle ── */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-lancet-gray-600">
            Data Type
          </label>
          <div className="flex rounded-full overflow-hidden border border-lancet-gray-border">
            {(['average', 'total'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setDataType(t)}
                className={`px-4 py-1.5 text-sm capitalize transition-colors ${
                  selectedDataType === t
                    ? 'bg-lancet-dark-blue text-white'
                    : 'bg-white text-lancet-dark hover:bg-gray-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Year range slider ── */}
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <label className="text-sm font-semibold text-lancet-gray-600 whitespace-nowrap">
            Years
          </label>

          {/* Play / Pause button */}
          <button
            onClick={toggle}
            aria-label={playing ? 'Pause year animation' : 'Play year animation'}
            className={`w-7 h-7 flex items-center justify-center rounded-full border transition-colors shrink-0 ${
              playing
                ? 'bg-lancet-dark-blue border-lancet-dark-blue text-white'
                : 'bg-white border-lancet-gray-border text-lancet-dark-blue hover:border-lancet-dark-blue'
            }`}
          >
            {playing ? (
              <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-current">
                <rect x="4" y="3" width="4" height="14" rx="1" />
                <rect x="12" y="3" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-current ml-0.5">
                <path d="M5 3.869C5 3.037 5.927 2.523 6.634 2.969l9.098 5.631c.666.412.666 1.388 0 1.8l-9.098 5.63C5.927 16.478 5 15.964 5 15.132V3.87z" />
              </svg>
            )}
          </button>

          <span className="text-sm tabular-nums text-lancet-dark w-10 text-right">
            {yearRange[0]}
          </span>

          <div className="relative flex-1 h-8 flex items-center">
            {/* track background */}
            <div className="absolute w-full h-1 bg-gray-200 rounded top-1/2 -translate-y-1/2" />
            {/* active track */}
            <div
              className="absolute h-1 rounded top-1/2 -translate-y-1/2"
              style={{
                left: `${minPct}%`,
                width: `${maxPct - minPct}%`,
                background: '#0B6FA1',
              }}
            />
            <input
              type="range"
              min={YEAR_MIN}
              max={YEAR_MAX}
              value={yearRange[0]}
              onChange={(e) =>
                setYearRange([
                  Math.min(+e.target.value, yearRange[1] - 1),
                  yearRange[1],
                ])
              }
              className="absolute w-full pointer-events-none z-10 range-thumb"
            />
            <input
              type="range"
              min={YEAR_MIN}
              max={YEAR_MAX}
              value={yearRange[1]}
              onChange={(e) =>
                setYearRange([
                  yearRange[0],
                  Math.max(+e.target.value, yearRange[0] + 1),
                ])
              }
              className="absolute w-full pointer-events-none z-20 range-thumb"
            />
          </div>

          <span className="text-sm tabular-nums text-lancet-dark w-10">
            {yearRange[1]}
          </span>
        </div>
      </div>
    </div>
  );
}
