'use client';

import { useMemo, useCallback } from 'react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { curveMonotoneX } from '@visx/curve';
import { useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { useIndicatorStore } from '@/store/useIndicatorStore';
import { filterData, getSeriesKey } from '@/lib/data';
import { dataset } from '@/lib/dataset';

const margin = { top: 24, right: 30, bottom: 52, left: 72 };

const COLORS: Record<string, string> = {
  '65plus': '#B5334F',
  infants: '#259AD4',
};

interface TooltipData {
  year: number;
  infants: number;
  '65plus': number;
}

/* ──────────────────────────────────────────────
   Inner chart – receives exact pixel dimensions
   ────────────────────────────────────────────── */
function TrendChartInner({ width, height }: { width: number; height: number }) {
  const {
    selectedRegion,
    selectedDataType,
    selectedDemographics,
    yearRange,
  } = useIndicatorStore();

  const { showTooltip, hideTooltip, tooltipOpen, tooltipData, tooltipLeft } =
    useTooltip<TooltipData>();

  /* ── Derived data ── */
  const filteredData = useMemo(
    () => filterData(dataset, selectedRegion, yearRange),
    [selectedRegion, yearRange]
  );

  const infantsKey = getSeriesKey(selectedDataType, 'infants');
  const elderlyKey = getSeriesKey(selectedDataType, '65plus');

  const infantsSeries = useMemo(
    () => filteredData.map((d) => ({ year: d.year, value: d[infantsKey] as number })),
    [filteredData, infantsKey]
  );

  const elderlySeries = useMemo(
    () => filteredData.map((d) => ({ year: d.year, value: d[elderlyKey] as number })),
    [filteredData, elderlyKey]
  );

  /* ── Scales ── */
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const yMax = useMemo(() => {
    const all = [...infantsSeries.map((d) => d.value), ...elderlySeries.map((d) => d.value)];
    return Math.max(...all) * 1.12;
  }, [infantsSeries, elderlySeries]);

  const xScale = useMemo(
    () => scaleLinear<number>({ domain: [yearRange[0], yearRange[1]], range: [0, innerWidth] }),
    [yearRange, innerWidth]
  );

  const yScale = useMemo(
    () => scaleLinear<number>({ domain: [0, yMax], range: [innerHeight, 0], nice: true }),
    [yMax, innerHeight]
  );

  /* ── X-axis tick values (integer years, well-spaced) ── */
  const xTickValues = useMemo(() => {
    const range = yearRange[1] - yearRange[0];
    const step = range > 30 ? 5 : range > 15 ? 3 : range > 8 ? 2 : 1;
    const ticks: number[] = [];
    const first = Math.ceil(yearRange[0] / step) * step;
    for (let y = first; y <= yearRange[1]; y += step) ticks.push(y);
    return ticks;
  }, [yearRange]);

  /* ── Tooltip handler ── */
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      const point = localPoint(event);
      if (!point) return;

      const x = point.x - margin.left;
      const year = Math.round(xScale.invert(x));
      const clamped = Math.max(yearRange[0], Math.min(yearRange[1], year));

      const inf = infantsSeries.find((d) => d.year === clamped);
      const eld = elderlySeries.find((d) => d.year === clamped);

      if (inf && eld) {
        showTooltip({
          tooltipData: { year: clamped, infants: inf.value, '65plus': eld.value },
          tooltipLeft: xScale(clamped) + margin.left,
          tooltipTop: 0,
        });
      }
    },
    [xScale, infantsSeries, elderlySeries, yearRange, showTooltip]
  );

  /* ── Baseline reference window ── */
  const baselineStart = Math.max(1986, yearRange[0]);
  const baselineEnd = Math.min(2005, yearRange[1]);
  const showBaseline = baselineStart < baselineEnd;

  const infantsActive = selectedDemographics.includes('infants');
  const elderlyActive = selectedDemographics.includes('65plus');

  if (innerWidth <= 0 || innerHeight <= 0) return null;

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {/* Grid rows */}
          <GridRows
            scale={yScale}
            width={innerWidth}
            numTicks={6}
            stroke="#E0E0E0"
            strokeOpacity={0.6}
            strokeDasharray="3,3"
          />

          {/* Baseline band */}
          {showBaseline && (
            <>
              <rect
                x={xScale(baselineStart)}
                y={0}
                width={xScale(baselineEnd) - xScale(baselineStart)}
                height={innerHeight}
                fill="#E0E0E0"
                fillOpacity={0.25}
                rx={3}
              />
              <text
                x={xScale((baselineStart + baselineEnd) / 2)}
                y={16}
                textAnchor="middle"
                fontSize={11}
                fill="#757575"
                fontFamily="'Open Sans', sans-serif"
              >
                1986–2005 Baseline
              </text>
            </>
          )}

          {/* Line: Adults >65 */}
          <LinePath
            data={elderlySeries}
            x={(d) => xScale(d.year)}
            y={(d) => yScale(d.value)}
            stroke={COLORS['65plus']}
            strokeWidth={2.5}
            strokeOpacity={elderlyActive ? 1 : 0.1}
            curve={curveMonotoneX}
            style={{ transition: 'stroke-opacity 300ms ease' }}
          />

          {/* Line: Infants <1 */}
          <LinePath
            data={infantsSeries}
            x={(d) => xScale(d.year)}
            y={(d) => yScale(d.value)}
            stroke={COLORS.infants}
            strokeWidth={2.5}
            strokeOpacity={infantsActive ? 1 : 0.1}
            curve={curveMonotoneX}
            style={{ transition: 'stroke-opacity 300ms ease' }}
          />

          {/* Crosshair + data dots */}
          {tooltipOpen && tooltipData && (
            <>
              <line
                x1={xScale(tooltipData.year)}
                x2={xScale(tooltipData.year)}
                y1={0}
                y2={innerHeight}
                stroke="#363636"
                strokeWidth={1}
                strokeDasharray="4,4"
                pointerEvents="none"
              />
              {elderlyActive && (
                <circle
                  cx={xScale(tooltipData.year)}
                  cy={yScale(tooltipData['65plus'])}
                  r={5}
                  fill={COLORS['65plus']}
                  stroke="white"
                  strokeWidth={2}
                  pointerEvents="none"
                />
              )}
              {infantsActive && (
                <circle
                  cx={xScale(tooltipData.year)}
                  cy={yScale(tooltipData.infants)}
                  r={5}
                  fill={COLORS.infants}
                  stroke="white"
                  strokeWidth={2}
                  pointerEvents="none"
                />
              )}
            </>
          )}

          {/* Axes */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            tickValues={xTickValues}
            tickFormat={(v) => `${v}`}
            stroke="#E0E0E0"
            tickStroke="#E0E0E0"
            tickLabelProps={() => ({
              fill: '#757575',
              fontSize: 12,
              fontFamily: "'Open Sans', sans-serif",
              textAnchor: 'middle' as const,
              dy: '0.25em',
            })}
          />

          <AxisLeft
            scale={yScale}
            numTicks={6}
            stroke="#E0E0E0"
            tickStroke="#E0E0E0"
            tickLabelProps={() => ({
              fill: '#757575',
              fontSize: 12,
              fontFamily: "'Open Sans', sans-serif",
              textAnchor: 'end' as const,
              dx: '-0.4em',
              dy: '0.33em',
            })}
          />

          {/* Y-axis label */}
          <text
            x={-innerHeight / 2}
            y={-54}
            transform="rotate(-90)"
            textAnchor="middle"
            fontSize={12}
            fill="#757575"
            fontFamily="'Open Sans', sans-serif"
          >
            {selectedDataType === 'average'
              ? 'Avg. exposure days per person'
              : 'Total person-days (millions)'}
          </text>

          {/* Invisible overlay for mouse interaction */}
          <rect
            x={0}
            y={0}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => hideTooltip()}
          />
        </Group>
      </svg>

      {/* Floating tooltip card */}
      {tooltipOpen && tooltipData && (
        <div
          className="absolute pointer-events-none bg-white/95 backdrop-blur-sm border border-lancet-gray-border rounded-lg shadow-lg px-3.5 py-2.5 text-sm"
          style={{
            left: tooltipLeft,
            top: margin.top + 30,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-semibold text-lancet-dark mb-1.5 tabular-nums">
            {tooltipData.year}
          </div>
          {elderlyActive && (
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: COLORS['65plus'] }}
              />
              <span className="text-lancet-gray-600">Adults &gt;65:</span>
              <span
                className="font-semibold tabular-nums"
                style={{ color: COLORS['65plus'] }}
              >
                {tooltipData['65plus'].toLocaleString(undefined, {
                  maximumFractionDigits: 1,
                })}
              </span>
            </div>
          )}
          {infantsActive && (
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: COLORS.infants }}
              />
              <span className="text-lancet-gray-600">Infants &lt;1:</span>
              <span
                className="font-semibold tabular-nums"
                style={{ color: COLORS.infants }}
              >
                {tooltipData.infants.toLocaleString(undefined, {
                  maximumFractionDigits: 1,
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Responsive wrapper
   ────────────────────────────────────────────── */
export default function TrendChart() {
  return (
    <ParentSize>
      {({ width, height }) => (
        <TrendChartInner width={width} height={height} />
      )}
    </ParentSize>
  );
}
