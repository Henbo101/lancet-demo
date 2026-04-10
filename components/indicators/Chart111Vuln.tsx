'use client';

import { useState, useMemo, useCallback } from 'react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { LinePath, Bar } from '@visx/shape';
import { AxisBottom, AxisLeft, AxisRight } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { globalData, whoData, hdiData, lcData } from '@/lib/data/indicator111vuln';
import EntityPicker, { type EntityCategory } from '@/components/EntityPicker';
import { Crosshair, TooltipCard, type TooltipPayload } from '@/components/ChartTooltip';
import { useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { useChartTheme } from '@/components/ChartThemeContext';
import { linearGroupedCenterX } from '@/lib/chartGeometry';
import { axisColorsForEntities, LEFT_SERIES_TEAL } from '@/lib/dualAxisPalettes';
import { nearestAlongPolylines, nearestYearFromXLinear } from '@/lib/chartProximity';
import DualAxisLegend, { DUAL_AXIS } from '@/components/DualAxisLegend';
import YearPlaybackBar from '@/components/YearPlaybackBar';
import { useYearPlayback } from '@/hooks/useYearPlayback';

const margin = { top: 24, right: 80, bottom: 40, left: 100 };
const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 1 });
const fmtB = (v: number) => (v / 1e9).toFixed(1) + 'B';

const SERIES_DEFS = [
  { avgKey: 'exposure_average_infants', totalKey: 'exposure_total_infants', label: 'Infants (<1 yr)' },
  { avgKey: 'exposure_average_65', totalKey: 'exposure_total_65', label: 'Over 65' },
  { avgKey: 'exposure_average_75', totalKey: 'exposure_total_75', label: 'Over 75' },
] as const;

/** Dash pattern per age series so entity hue stays consistent across lines. */
const SERIES_DASH: Record<string, string> = {
  exposure_average_infants: '',
  exposure_average_65: '10 6',
  exposure_average_75: '4 3',
};

const whoRegions: string[] = [...new Set(whoData.map((d) => d['WHO region'] as string))].sort();
const hdiLevels: string[] = [...new Set(hdiData.map((d) => d['HDI level'] as string))].sort();
const lcRegions: string[] = [...new Set(lcData.map((d) => d['Lancet Countdown Region'] as string))].sort();

const entityCategories: EntityCategory[] = [
  { category: 'WHO Regions', items: whoRegions },
  { category: 'HDI Levels', items: hdiLevels },
  { category: 'LC Regions', items: lcRegions },
];

interface Row {
  Year: number;
  [key: string]: number;
}

function getDataForEntity(entity: string): Row[] {
  const pick = (src: readonly Record<string, unknown>[]): Row[] =>
    src.map((d) => {
      const row: Row = { Year: d.Year as number };
      for (const s of SERIES_DEFS) {
        row[s.avgKey] = (d[s.avgKey] as number) ?? 0;
        row[s.totalKey] = (d[s.totalKey] as number) ?? 0;
      }
      return row;
    });

  if (entity === 'Global') return pick(globalData as unknown as Record<string, unknown>[]);
  if (whoRegions.includes(entity))
    return pick(whoData.filter((d) => d['WHO region'] === entity) as unknown as Record<string, unknown>[]);
  if (hdiLevels.includes(entity))
    return pick(hdiData.filter((d) => d['HDI level'] === entity) as unknown as Record<string, unknown>[]);
  if (lcRegions.includes(entity))
    return pick(lcData.filter((d) => d['Lancet Countdown Region'] === entity) as unknown as Record<string, unknown>[]);
  return pick(globalData as unknown as Record<string, unknown>[]);
}

export default function Chart111Vuln() {
  const { dark } = useChartTheme();
  const [selected, setSelected] = useState<string[]>(['Global']);
  const [activeSeries, setActiveSeries] = useState<string[]>([
    SERIES_DEFS[0].avgKey,
    SERIES_DEFS[1].avgKey,
  ]);
  const pickerEntityColors = useMemo(() => axisColorsForEntities(selected).left, [selected]);

  const allData = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const entity of selected) map.set(entity, getDataForEntity(entity));
    return map;
  }, [selected]);

  const years = useMemo(
    () => [...new Set([...allData.values()].flatMap((d) => d.map((r) => r.Year)))].sort(),
    [allData],
  );

  const playback = useYearPlayback(years);

  const toggleSeries = (key: string) =>
    setActiveSeries((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  /** Chip colours for age-group toggles (series type), not entity. */
  const seriesUiColors: Record<string, string> = {
    [SERIES_DEFS[0].avgKey]: LEFT_SERIES_TEAL[0],
    [SERIES_DEFS[1].avgKey]: LEFT_SERIES_TEAL[1],
    [SERIES_DEFS[2].avgKey]: LEFT_SERIES_TEAL[2],
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <EntityPicker
          categories={entityCategories}
          selected={selected}
          onChange={setSelected}
          dark={dark}
          entityColors={pickerEntityColors}
        />
        <div className="flex items-center gap-2 ml-auto">
          {SERIES_DEFS.map((s) => {
            const on = activeSeries.includes(s.avgKey);
            const c = seriesUiColors[s.avgKey];
            return (
              <button
                key={s.avgKey}
                onClick={() => toggleSeries(s.avgKey)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all"
                style={
                  on
                    ? { borderColor: c, color: c, backgroundColor: `${c}15` }
                    : { borderColor: '#bfc7cf50', color: '#94a3b8' }
                }
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: on ? c : '#bfc7cf' }} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <DualAxisLegend
        left={{
          title: 'Avg exposure (days / person)',
          subtitle:
            'Line colour = region/country; dash pattern = age group. Hover a line to isolate it.',
          color: DUAL_AXIS.leftTeal,
        }}
        right={{
          title: 'Total person-days',
          subtitle: 'Pale vertical bars behind the lines — height uses the right-hand scale (billions).',
          color: DUAL_AXIS.rightDeepTeal,
        }}
      />

      <YearPlaybackBar playback={playback} className="mb-3" />

      <div className="h-[420px] w-full min-w-0 relative">
        <ParentSize debounceTime={0} initialSize={{ width: 400, height: 420 }}>
          {({ width, height }) => {
            if (width < 10 || height < 10) return null;
            const innerW = width - margin.left - margin.right;
            const innerH = height - margin.top - margin.bottom;

            const xScale = scaleLinear<number>({
              domain: [Math.min(...years), Math.max(...years)],
              range: [0, innerW],
            });

            const allAvgVals = [...allData.values()].flatMap((rows) =>
              rows.flatMap((d) => activeSeries.map((k) => d[k] ?? 0)),
            );
            const yScale = scaleLinear<number>({
              domain: [0, Math.max(1, ...allAvgVals) * 1.15],
              range: [innerH, 0],
              nice: true,
            });

            const activeTotalKeys = activeSeries.map((k) => k.replace('average', 'total'));
            const allTotalVals = [...allData.values()].flatMap((rows) =>
              rows.flatMap((d) => activeTotalKeys.map((k) => d[k] ?? 0)),
            );
            const yRightScale = scaleLinear<number>({
              domain: [0, Math.max(1, ...allTotalVals) * 1.15],
              range: [innerH, 0],
              nice: true,
            });

            return (
              <ChartInner
                width={width}
                height={height}
                innerW={innerW}
                innerH={innerH}
                xScale={xScale}
                yScale={yScale}
                yRightScale={yRightScale}
                allData={allData}
                selected={selected}
                activeSeries={activeSeries}
                entityColors={pickerEntityColors}
                years={years}
                throughYear={playback.throughYear}
                dark={dark}
              />
            );
          }}
        </ParentSize>
      </div>
    </>
  );
}

interface InnerProps {
  width: number;
  height: number;
  innerW: number;
  innerH: number;
  xScale: ReturnType<typeof scaleLinear<number>>;
  yScale: ReturnType<typeof scaleLinear<number>>;
  yRightScale: ReturnType<typeof scaleLinear<number>>;
  allData: Map<string, Row[]>;
  selected: string[];
  activeSeries: string[];
  entityColors: Record<string, string>;
  years: number[];
  throughYear: number;
  dark: boolean;
}

type LineFocus = { entity: string; seriesKey: string | '*' } | null;

function parseLineId(id: string | null): LineFocus {
  if (!id || !id.includes(':::')) return null;
  const [entity, seriesKey] = id.split(':::');
  if (!entity || !seriesKey) return null;
  return { entity, seriesKey: seriesKey === '*' ? '*' : seriesKey };
}

function ChartInner({
  width,
  height,
  innerW,
  innerH,
  xScale,
  yScale,
  yRightScale,
  allData,
  selected,
  activeSeries,
  entityColors,
  years,
  throughYear,
  dark,
}: InnerProps) {
  const nEnt = selected.length;
  const slotWidth = Math.max(5, Math.min(14, 42 / Math.max(nEnt, 1)));

  const hoverYears = useMemo(
    () => years.filter((y) => y <= throughYear),
    [years, throughYear],
  );

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    showTooltip,
    hideTooltip,
    tooltipOpen,
  } = useTooltip<TooltipPayload>();

  const getXForYear = useCallback(
    (y: number) => xScale(y) ?? 0,
    [xScale],
  );

  const buildPayload = useCallback(
    (year: number, lineId: string | null): TooltipPayload => {
      const focus = parseLineId(lineId);
      const rows = selected.flatMap((entity) => {
        const d = allData.get(entity)?.find((r) => r.Year === year);
        if (!d) return [];
        const prefix = selected.length > 1 ? `${entity}: ` : '';
        return activeSeries
          .filter((k) => {
            if (!focus) return true;
            if (focus.entity !== entity) return false;
            if (focus.seriesKey === '*') return true;
            return focus.seriesKey === k;
          })
          .map((k) => {
            const def = SERIES_DEFS.find((s) => s.avgKey === k)!;
            const totalK = k.replace('average', 'total');
            return {
              color: entityColors[entity] ?? '#0f766e',
              label: `${prefix}${def.label}`,
              value: `${fmt(d[k])} avg / ${fmtB(d[totalK])} total`,
              group: entity,
            };
          });
      });
      let hoverFocus: string | undefined;
      let focusedEntity: string | null = null;
      let focusedSeriesKey: string | null = null;
      if (focus && (selected.length > 1 || activeSeries.length > 1)) {
        if (focus.seriesKey === '*') {
          hoverFocus = `${focus.entity} · bar total`;
        } else {
          const def = SERIES_DEFS.find((s) => s.avgKey === focus.seriesKey)!;
          hoverFocus = `${focus.entity} · ${def.label}`;
        }
        focusedEntity = focus.entity;
        focusedSeriesKey = focus.seriesKey === '*' ? null : focus.seriesKey;
      }
      return { year, rows, hoverFocus, focusedEntity, focusedSeriesKey };
    },
    [allData, selected, activeSeries, entityColors],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      const point = localPoint(event);
      if (!point) return;
      const innerX = point.x - margin.left;
      const innerY = point.y - margin.top;
      const hy = hoverYears.length > 0 ? hoverYears : years;
      const nearestYear = nearestYearFromXLinear(innerX, hy, (y) => xScale(y) ?? 0);

      const polylines = selected.flatMap((entity, ei) =>
        activeSeries.map((k) => {
          const rows = (allData.get(entity) ?? []).filter((d) => d.Year <= throughYear);
          const pts = rows.map((d) => ({
            x: linearGroupedCenterX(ei, nEnt, xScale(d.Year) ?? 0, slotWidth),
            y: yScale(d[k] ?? 0) ?? 0,
          }));
          return { id: `${entity}:::${k}`, pts };
        }),
      );

      let hit = nearestAlongPolylines(innerX, innerY, polylines, 22);

      if (!hit && nEnt > 1) {
        for (let ei = 0; ei < nEnt; ei++) {
          const entity = selected[ei];
          const d = allData.get(entity)?.find((r) => r.Year === nearestYear);
          if (!d) continue;
          const activeTotalKeys = activeSeries.map((kk) => kk.replace('average', 'total'));
          const totalSum = activeTotalKeys.reduce((sum, kk) => sum + (d[kk] ?? 0), 0);
          const barW = Math.max(2, slotWidth - 1);
          const cx = linearGroupedCenterX(ei, nEnt, xScale(nearestYear) ?? 0, slotWidth);
          const yTop = yRightScale(totalSum) ?? 0;
          if (
            innerX >= cx - barW / 2 &&
            innerX <= cx + barW / 2 &&
            innerY >= yTop &&
            innerY <= innerH
          ) {
            hit = `${entity}:::*`;
            break;
          }
        }
      }

      showTooltip({
        tooltipData: buildPayload(nearestYear, hit),
        tooltipLeft: getXForYear(nearestYear) + margin.left + 10,
        tooltipTop: point.y,
      });
    },
    [
      hoverYears,
      years,
      allData,
      throughYear,
      selected,
      activeSeries,
      nEnt,
      slotWidth,
      xScale,
      yScale,
      yRightScale,
      innerH,
      buildPayload,
      showTooltip,
      getXForYear,
    ],
  );

  const hoveredYear = tooltipData?.year ?? null;
  const lf: { entity: string; seriesKey: string | '*' } | null =
    tooltipData?.focusedEntity
      ? {
          entity: tooltipData.focusedEntity,
          seriesKey: tooltipData.focusedSeriesKey ?? '*',
        }
      : null;

  const dotPositions = useMemo(() => {
    if (hoveredYear == null) return [];
    const xYear = getXForYear(hoveredYear);
    return selected.flatMap((entity, ei) => {
      const d = allData.get(entity)?.find((r) => r.Year === hoveredYear);
      if (!d) return [];
      return activeSeries
        .filter(
          (k) =>
            !lf ||
            (lf.entity === entity &&
              (lf.seriesKey === '*' || lf.seriesKey === k)),
        )
        .map((k) => ({
          x: linearGroupedCenterX(ei, nEnt, xYear, slotWidth),
          y: yScale(d[k] ?? 0),
          color: entityColors[entity] ?? '#0f766e',
        }));
    });
  }, [hoveredYear, selected, allData, getXForYear, yScale, activeSeries, entityColors, nEnt, slotWidth, lf]);

  const baselineX1 = xScale(1986);
  const baselineX2 = xScale(2005);

  const dim =
    (selected.length > 1 || activeSeries.length > 1) &&
    tooltipData?.focusedEntity != null &&
    tooltipData?.hoverFocus != null;

  return (
    <>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <GridRows scale={yScale} width={innerW} stroke={DUAL_AXIS.leftTeal} strokeOpacity={0.18} />

          {/* Baseline band 1986-2005 */}
          {baselineX1 != null && baselineX2 != null && (
            <rect
              x={baselineX1}
              y={0}
              width={baselineX2 - baselineX1}
              height={innerH}
              fill={DUAL_AXIS.leftTeal}
              fillOpacity={0.06}
            />
          )}
          {baselineX1 != null && (
            <text x={baselineX1 + 4} y={14} fontSize={9} fill={DUAL_AXIS.leftTeal} opacity={0.55} fontFamily="'Open Sans', sans-serif">
              Baseline 1986–2005
            </text>
          )}

          {/* Total person-days bars (right axis) — tinted by entity */}
          {selected.map((entity, ei) => {
            const rows = (allData.get(entity) ?? []).filter((d) => d.Year <= throughYear);
            const activeTotalKeys = activeSeries.map((k) => k.replace('average', 'total'));
            const barW = Math.max(2, slotWidth - 1);
            const ec = entityColors[entity] ?? '#0f766e';
            return rows.map((d) => {
              const totalSum = activeTotalKeys.reduce((sum, k) => sum + (d[k] ?? 0), 0);
              const barH = innerH - (yRightScale(totalSum) ?? 0);
              const cx = linearGroupedCenterX(ei, nEnt, xScale(d.Year) ?? 0, slotWidth);
              const isBarHi =
                !dim ||
                (tooltipData?.focusedEntity === entity &&
                  tooltipData?.focusedSeriesKey == null);
              return (
                <Bar
                  key={`${entity}-${d.Year}-tot`}
                  x={cx - barW / 2}
                  y={yRightScale(totalSum) ?? 0}
                  width={barW}
                  height={barH}
                  fill={ec}
                  fillOpacity={dim ? (isBarHi ? 0.22 : 0.05) : 0.12}
                  rx={1}
                />
              );
            });
          })}

          {/* Lines: colour = entity, dash = age group */}
          {selected.map((entity, ei) => {
            const rows = (allData.get(entity) ?? []).filter((d) => d.Year <= throughYear);
            const strokeC = entityColors[entity] ?? '#0f766e';
            return activeSeries.map((k) => {
              const isLineHi =
                !dim ||
                (tooltipData?.focusedEntity === entity &&
                  (tooltipData?.focusedSeriesKey == null ||
                    tooltipData?.focusedSeriesKey === k));
              return (
                <LinePath
                  key={`${entity}-${k}`}
                  data={rows}
                  x={(d) => linearGroupedCenterX(ei, nEnt, xScale(d.Year) ?? 0, slotWidth)}
                  y={(d) => yScale(d[k] ?? 0) ?? 0}
                  stroke={strokeC}
                  strokeWidth={dim ? (isLineHi ? 3 : 1.4) : 2.2}
                  strokeOpacity={dim ? (isLineHi ? 1 : 0.28) : 1}
                  strokeDasharray={SERIES_DASH[k] ?? ''}
                  curve={curveMonotoneX}
                />
              );
            });
          })}

          {/* 2024 endpoint annotations for primary entity */}
          {throughYear >= 2024 &&
            (() => {
            const rows = allData.get(selected[0]) ?? [];
            const last = rows.find((d) => d.Year === 2024);
            if (!last) return null;
            const baselineRows = rows.filter((d) => d.Year >= 1986 && d.Year <= 2005);
            const x2024 = xScale(2024) ?? 0;
            const labelX = Math.min(x2024 + 6, innerW - 4);
            const ec = entityColors[selected[0]] ?? '#0f766e';
            return activeSeries.map((k, i) => {
              if (baselineRows.length === 0) return null;
              const baselineAvg = baselineRows.reduce((s, d) => s + (d[k] ?? 0), 0) / baselineRows.length;
              if (baselineAvg === 0) return null;
              const changePct = Math.round(((last[k] - baselineAvg) / baselineAvg) * 100);
              const def = SERIES_DEFS.find((s) => s.avgKey === k)!;
              return (
                <text
                  key={k}
                  x={labelX}
                  y={(yScale(last[k]) ?? 0) + i * 16}
                  fontSize={10}
                  fontWeight={700}
                  fill={ec}
                  fontFamily="'Open Sans', sans-serif"
                  textAnchor="start"
                >
                  {def.label}: +{changePct}%
                </text>
              );
            });
          })()}

          <AxisBottom
            top={innerH}
            scale={xScale}
            stroke="#bfc7cf"
            tickStroke="#bfc7cf"
            numTicks={8}
            tickLabelProps={() => ({
              fill: '#40484e', fontSize: 11, fontFamily: "'Open Sans', sans-serif", textAnchor: 'middle' as const,
            })}
            tickFormat={(v) => String(Math.round(v as number))}
          />
          <AxisLeft
            scale={yScale}
            stroke={DUAL_AXIS.leftTeal}
            tickStroke={DUAL_AXIS.leftTeal}
            labelOffset={65}
            tickLabelProps={() => ({
              fill: '#115e59', fontSize: 11, fontFamily: "'Open Sans', sans-serif", textAnchor: 'end' as const, dy: '0.33em', dx: -4,
            })}
            tickFormat={(v) => fmt(v as number)}
            label="Avg days / person (lines)"
            labelProps={{ fill: DUAL_AXIS.leftTeal, fontSize: 12, fontFamily: "'Open Sans', sans-serif", textAnchor: 'middle', fontWeight: 600 }}
          />
          <AxisRight
            left={innerW}
            scale={yRightScale}
            stroke={DUAL_AXIS.rightDeepTeal}
            tickStroke={DUAL_AXIS.rightDeepTeal}
            labelOffset={50}
            tickLabelProps={() => ({
              fill: '#134e4a', fontSize: 11, fontFamily: "'Open Sans', sans-serif", textAnchor: 'start' as const, dy: '0.33em', dx: 4,
            })}
            tickFormat={(v) => fmtB(v as number)}
            label="Total person-days (bars)"
            labelProps={{ fill: DUAL_AXIS.rightDeepTeal, fontSize: 12, fontFamily: "'Open Sans', sans-serif", textAnchor: 'middle', fontWeight: 600 }}
          />
        </Group>

        <Crosshair
          hoveredYear={hoveredYear}
          getXForYear={getXForYear}
          innerHeight={innerH}
          innerWidth={innerW}
          margin={margin}
          onMouseMove={handleMouseMove}
          onMouseLeave={hideTooltip}
          dotPositions={dotPositions}
        />
      </svg>
      <TooltipCard tooltipOpen={tooltipOpen} tooltipData={tooltipData} tooltipLeft={tooltipLeft} tooltipTop={tooltipTop} dark={dark} />
    </>
  );
}
