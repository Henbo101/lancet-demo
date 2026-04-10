'use client';

/** Use these for AxisLeft / AxisRight stroke + tickStroke to match the legend swatches. */
export const DUAL_AXIS = {
  leftTeal: '#0d9488',
  rightRose: '#b5334f',
  /** Faint total bars (111 Vuln) */
  rightDeepTeal: '#0f766e',
  /** Per-worker line on PWHL dark strip */
  rightAmber: '#facc15',
  /** Stacked hours (PWHL) on emerald — left axis */
  leftMintOnDark: '#5eead4',
} as const;

/**
 * Explains which geometry reads against which Y scale (paired with matching axis stroke colours).
 */
export interface DualAxisLegendProps {
  left: { title: string; subtitle: string; color: string };
  right: { title: string; subtitle: string; color: string };
  /** PWHL dark strip uses light text */
  dark?: boolean;
}

export default function DualAxisLegend({ left, right, dark }: DualAxisLegendProps) {
  const text = dark ? 'text-white/90' : 'text-teal-950';
  const sub = dark ? 'text-white/65' : 'text-on-surface-variant';

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3"
      role="note"
      aria-label="Dual-axis chart: left and right scales"
    >
      <div className="flex gap-2 min-w-0">
        <span
          className="mt-0.5 h-9 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: left.color }}
          aria-hidden
        />
        <div className="min-w-0">
          <div className={`text-[10px] font-headline font-bold uppercase tracking-wider ${text}`}>
            <span style={{ color: left.color }}>Left axis</span>
            <span className={dark ? 'text-white/80' : 'text-on-surface'}> · {left.title}</span>
          </div>
          <p className={`text-[11px] font-body leading-snug mt-0.5 ${sub}`}>{left.subtitle}</p>
        </div>
      </div>
      <div className="flex gap-2 min-w-0">
        <span
          className="mt-0.5 h-9 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: right.color }}
          aria-hidden
        />
        <div className="min-w-0">
          <div className={`text-[10px] font-headline font-bold uppercase tracking-wider ${text}`}>
            <span style={{ color: right.color }}>Right axis</span>
            <span className={dark ? 'text-white/80' : 'text-on-surface'}> · {right.title}</span>
          </div>
          <p className={`text-[11px] font-body leading-snug mt-0.5 ${sub}`}>{right.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
