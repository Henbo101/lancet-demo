'use client';

import type { YearPlaybackState } from '@/hooks/useYearPlayback';

type Props = {
  playback: YearPlaybackState;
  /** Shown next to controls (e.g. "Year") */
  label?: string;
  className?: string;
};

export default function YearPlaybackBar({ playback, label = 'Year playback', className = '' }: Props) {
  const {
    minYear,
    maxYear,
    throughYear,
    setThroughYear,
    playing,
    play,
    pause,
    reset,
  } = playback;

  if (minYear === 0 && maxYear === 0) return null;

  const handleThroughInput = (v: number) => {
    pause();
    setThroughYear(v);
  };

  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border border-outline-variant/30 bg-surface-container-low/80 px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2 ${className}`}
    >
      <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant shrink-0">
        {label}
      </span>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => (playing ? pause() : play())}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-primary/40 bg-primary text-white shadow-sm transition hover:bg-primary/90"
          title={playing ? 'Pause' : 'Play'}
          aria-label={playing ? 'Pause year animation' : 'Play year animation'}
        >
          <span className="material-symbols-outlined text-[22px] leading-none">
            {playing ? 'pause' : 'play_arrow'}
          </span>
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center gap-1 rounded-xl border border-outline-variant/50 bg-white px-2.5 text-[11px] font-bold text-teal-900 transition hover:bg-teal-50"
          title="Show full series"
          aria-label="Reset to full year range"
        >
          <span className="material-symbols-outlined text-base">restart_alt</span>
          Full
        </button>
      </div>

      <label className="flex min-w-0 flex-1 items-center gap-2 text-[11px] font-label text-on-surface-variant sm:min-w-[200px]">
        <span className="w-16 shrink-0">Reveal</span>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          step={1}
          value={throughYear}
          onChange={(e) => handleThroughInput(Number(e.target.value))}
          className="h-2 min-w-0 flex-1 cursor-pointer accent-primary"
        />
        <span className="w-10 tabular-nums text-teal-950">{throughYear}</span>
      </label>
    </div>
  );
}
