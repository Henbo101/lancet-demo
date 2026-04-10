'use client';

import { useCallback, useMemo } from 'react';
import { useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import type { ScaleLinear, ScaleBand } from 'd3-scale';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

export interface TooltipRow {
  color: string;
  label: string;
  value: string;
  group?: string;
}

export interface TooltipPayload {
  year: number;
  rows: TooltipRow[];
  supplementary?: { label: string; value: string }[];
  /** Shown under the year when the user hovers a specific series/entity (e.g. line focus). */
  hoverFocus?: string;
  /** When set, chart should de-emphasise other entities’ geometry. */
  focusedEntity?: string | null;
  /** Age/series key for multi-series line charts (e.g. 111 vulnerable). */
  focusedSeriesKey?: string | null;
}

/* ────────────────────────────────────────────
   useChartHover hook
   ──────────────────────────────────────────── */

interface UseChartHoverOpts {
  xScale: ScaleLinear<number, number> | ScaleBand<number>;
  years: number[];
  margin: { left: number; top: number };
  buildTooltip: (year: number) => TooltipPayload;
}

export function useChartHover({
  xScale,
  years,
  margin,
  buildTooltip,
}: UseChartHoverOpts) {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    showTooltip,
    hideTooltip,
    tooltipOpen,
  } = useTooltip<TooltipPayload>();

  const sortedYears = useMemo(() => [...years].sort((a, b) => a - b), [years]);

  const getXForYear = useCallback(
    (y: number) => {
      if ('bandwidth' in xScale) {
        return (xScale(y) ?? 0) + xScale.bandwidth() / 2;
      }
      return xScale(y) ?? 0;
    },
    [xScale],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      const point = localPoint(event);
      if (!point) return;

      const x0 = point.x - margin.left;

      let nearestYear = sortedYears[0];
      let minDist = Infinity;
      for (const y of sortedYears) {
        const dist = Math.abs(getXForYear(y) - x0);
        if (dist < minDist) {
          minDist = dist;
          nearestYear = y;
        }
      }

      const payload = buildTooltip(nearestYear);
      showTooltip({
        tooltipData: payload,
        tooltipLeft: getXForYear(nearestYear) + margin.left + 10,
        tooltipTop: point.y,
      });
    },
    [sortedYears, getXForYear, margin, buildTooltip, showTooltip],
  );

  const hoveredYear = tooltipData?.year ?? null;

  return {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    hoveredYear,
    handleMouseMove,
    handleMouseLeave: hideTooltip,
    getXForYear,
  };
}

/* ────────────────────────────────────────────
   Crosshair overlay (rendered inside SVG)
   ──────────────────────────────────────────── */

interface CrosshairProps {
  hoveredYear: number | null;
  getXForYear: (y: number) => number;
  innerHeight: number;
  innerWidth: number;
  margin: { left: number; top: number; right: number; bottom: number };
  onMouseMove: (e: React.MouseEvent<SVGRectElement>) => void;
  onMouseLeave: () => void;
  dotPositions?: { x: number; y: number; color: string }[];
}

export function Crosshair({
  hoveredYear,
  getXForYear,
  innerHeight,
  innerWidth,
  margin,
  onMouseMove,
  onMouseLeave,
  dotPositions,
}: CrosshairProps) {
  return (
    <>
      {/* transparent overlay to capture mouse */}
      <rect
        x={margin.left}
        y={margin.top}
        width={innerWidth}
        height={innerHeight}
        fill="transparent"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      />

      {hoveredYear != null && (
        <g>
          {/* vertical crosshair line */}
          <line
            x1={getXForYear(hoveredYear) + margin.left}
            x2={getXForYear(hoveredYear) + margin.left}
            y1={margin.top}
            y2={margin.top + innerHeight}
            stroke="#94a3b8"
            strokeWidth={1}
            strokeDasharray="4,3"
            pointerEvents="none"
          />

          {/* dot markers */}
          {dotPositions?.map((d, i) => (
            <circle
              key={i}
              cx={d.x + margin.left}
              cy={d.y + margin.top}
              r={4}
              fill={d.color}
              stroke="#fff"
              strokeWidth={1.5}
              pointerEvents="none"
            />
          ))}
        </g>
      )}
    </>
  );
}

/* ────────────────────────────────────────────
   Tooltip card (rendered outside SVG)
   ──────────────────────────────────────────── */

interface TooltipCardProps {
  tooltipOpen: boolean;
  tooltipData: TooltipPayload | undefined;
  tooltipLeft: number | undefined;
  tooltipTop: number | undefined;
  dark?: boolean;
}

export function TooltipCard({
  tooltipOpen,
  tooltipData,
  tooltipLeft,
  tooltipTop,
  dark,
}: TooltipCardProps) {
  if (!tooltipOpen || !tooltipData) return null;

  const groups = new Map<string, TooltipRow[]>();
  for (const r of tooltipData.rows) {
    const g = r.group ?? '';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(r);
  }

  return (
    <TooltipWithBounds
      left={tooltipLeft}
      top={tooltipTop}
      unstyled
      applyPositionStyle
      className={`pointer-events-none z-50 px-4 py-3 rounded-xl shadow-lg border text-sm ${
        dark
          ? 'bg-emerald-950/95 backdrop-blur-md border-emerald-700/50 text-white'
          : 'bg-white/95 backdrop-blur-md border-slate-200/50 text-slate-900'
      }`}
    >
      <div className="font-headline text-xs tracking-widest uppercase opacity-60 mb-1">
        {tooltipData.year}
      </div>
      {tooltipData.hoverFocus && (
        <div className="text-[11px] font-headline font-semibold text-teal-800 mb-2 leading-snug border-b border-slate-200/80 pb-2 dark:text-teal-100 dark:border-emerald-700/50">
          {tooltipData.hoverFocus}
        </div>
      )}

      {[...groups.entries()].map(([group, rows], gi) => (
        <div key={gi}>
          {group && (
            <div className="text-[10px] font-headline uppercase tracking-wider opacity-40 mt-2 mb-1">
              {group}
            </div>
          )}
          {rows.map((row, ri) => (
            <div key={ri} className="flex items-center gap-2 py-0.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: row.color }}
              />
              <span className="text-xs opacity-70 flex-1 truncate">
                {row.label}
              </span>
              <span className="text-xs font-bold tabular-nums ml-3">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      ))}

      {tooltipData.supplementary && tooltipData.supplementary.length > 0 && (
        <div className="mt-2 pt-2 border-t border-current/10">
          {tooltipData.supplementary.map((s, i) => (
            <div
              key={i}
              className="flex justify-between text-[10px] opacity-50 py-0.5"
            >
              <span>{s.label}</span>
              <span className="tabular-nums">{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </TooltipWithBounds>
  );
}
