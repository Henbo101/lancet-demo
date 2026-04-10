'use client';

import { useState, useMemo, useCallback } from 'react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { AreaStack, LinePath } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { globalData, whoData, hdiData, lcData } from '@/lib/data/indicator112';
import EntityPicker, { type EntityCategory } from '@/components/EntityPicker';
import { axisColorsForEntities } from '@/lib/dualAxisPalettes';
import { useChartTheme } from '@/components/ChartThemeContext';
import { Crosshair, TooltipCard, type TooltipPayload } from '@/components/ChartTooltip';
import YearPlaybackBar from '@/components/YearPlaybackBar';
import { useYearPlayback } from '@/hooks/useYearPlayback';
import { nearestAlongPolylines, nearestYearFromXLinear } from '@/lib/chartProximity';

const LEVELS = [
  { key: 'moderate', label: 'Moderate', color: '#E67E22' },
  { key: 'high', label: 'High', color: '#B5334F' },
  { key: 'extreme', label: 'Extreme', color: '#004e6f' },
] as const;
const margin = { top: 24, right: 30, bottom: 40, left: 100 };
const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 1 });

function fieldName(level: string, cls: 1 | 3) {
  return `annual_yhrs_pp_${level}_${cls}`;
}

const whoRegions: string[] = [...new Set((whoData as unknown as Record<string, unknown>[]).map((d) => d['WHO region'] as string))].sort();
const hdiLevels: string[] = [...new Set((hdiData as unknown as Record<string, unknown>[]).map((d) => d['HDI level'] as string))].sort();
const lcRegions: string[] = [...new Set((lcData as unknown as Record<string, unknown>[]).map((d) => d['Lancet Countdown region'] as string))].sort();

const entityCategories: EntityCategory[] = [
  { category: 'Summary', items: ['Global'] },
  { category: 'WHO Regions', items: whoRegions },
  { category: 'HDI Levels', items: hdiLevels },
  { category: 'LC Regions', items: lcRegions },
];

interface Row {
  Year: number;
  [key: string]: number;
}

function getDataForEntity(entity: string): Row[] {
  const pick = (src: readonly Record<string, unknown>[]) =>
    src.map((d) => {
      const row: Row = { Year: d.Year as number };
      for (const l of ['moderate', 'high', 'extreme', 'low', 'at_least_moderate']) {
        for (const c of [1, 3] as const) {
          const k = fieldName(l, c);
          row[k] = (d[k] as number) ?? 0;
        }
      }
      row.Population = (d.Population as number) ?? 0;
      return row;
    });

  if (entity === 'Global') return pick(globalData as unknown as Record<string, unknown>[]);
  if (whoRegions.includes(entity))
    return pick((whoData as unknown as Record<string, unknown>[]).filter((d) => d['WHO region'] === entity));
  if (hdiLevels.includes(entity))
    return pick((hdiData as unknown as Record<string, unknown>[]).filter((d) => d['HDI level'] === entity));
  if (lcRegions.includes(entity))
    return pick((lcData as unknown as Record<string, unknown>[]).filter((d) => d['Lancet Countdown region'] === entity));
  return pick(globalData as unknown as Record<string, unknown>[]);
}

function stackCumulative(d: Row, fields: string[], upToIndex: number): number {
  let s = 0;
  for (let i = 0; i <= upToIndex; i++) s += d[fields[i]] ?? 0;
  return s;
}

export default function Chart112() {
  const { dark } = useChartTheme();
  const [selected, setSelected] = useState<string[]>(['Global']);
  const [heatClass, setHeatClass] = useState<1 | 3>(1);

  const allData = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const e of selected) m.set(e, getDataForEntity(e));
    return m;
  }, [selected]);

  const fields = LEVELS.map((l) => fieldName(l.key, heatClass));
  const colorMap = Object.fromEntries(
    LEVELS.map((l) => [fieldName(l.key, heatClass), l.color]),
  ) as Record<string, string>;
  const almField = fieldName('at_least_moderate', heatClass);

  const years = useMemo(
    () => [...new Set([...allData.values()].flatMap((rows) => rows.map((r) => r.Year)))].sort(),
    [allData],
  );

  const playback = useYearPlayback(years);

  const pickerEntityColors = useMemo(() => axisColorsForEntities(selected).left, [selected]);

  const primaryData = allData.get(selected[0]) ?? [];

  const baselineYears = useMemo(
    () => primaryData.filter((d) => d.Year >= 1990 && d.Year <= 1999),
    [primaryData],
  );
  const baselineAvg = useMemo(() => {
    if (baselineYears.length === 0) return null;
    const sum = baselineYears.reduce((s, d) => s + d[almField], 0);
    return sum / baselineYears.length;
  }, [baselineYears, almField]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <EntityPicker
          categories={entityCategories}
          selected={selected}
          onChange={setSelected}
          maxSelections={8}
          dark={dark}
          entityColors={pickerEntityColors}
        />
        <div className="flex items-center gap-2 ml-auto">
          {([1, 3] as const).map((c) => (
            <button
              key={c}
              onClick={() => setHeatClass(c)}
              className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${
                heatClass === c
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-on-surface-variant border-outline-variant/50 hover:bg-surface-container-low'
              }`}
            >
              {c === 1 ? 'Class 1 (Walking)' : 'Class 3 (Running)'}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-on-surface-variant mb-2 max-w-3xl">
        {selected.length > 1
          ? 'Comparing at least moderate hours (lines). Select one region only to see the full Moderate / High / Extreme stack.'
          : 'Hover near a line or the top edge of a coloured band to focus that series in the tooltip.'}
      </p>

      <YearPlaybackBar playback={playback} className="mb-3" />

      <div className="h-[420px] w-full min-w-0 relative">
        <ParentSize debounceTime={0} initialSize={{ width: 400, height: 420 }}>
          {({ width, height }) => {
            if (width < 10 || height < 10) return null;
            const innerW = width - margin.left - margin.right;
            const innerH = height - margin.top - margin.bottom;

            const visibleByEntity = new Map<string, Row[]>();
            for (const e of selected) {
              const rows = allData.get(e) ?? [];
              visibleByEntity.set(e, rows.filter((d) => d.Year <= playback.throughYear));
            }

            const maxY = Math.max(
              1,
              ...[...visibleByEntity.values()].flatMap((rows) =>
                rows.map((d) => fields.reduce((sum, f) => sum + (d[f] ?? 0), 0)),
              ),
            );
            const xScale = scaleLinear<number>({
              domain: [Math.min(...years), Math.max(...years)],
              range: [0, innerW],
            });
            const yScale = scaleLinear<number>({
              domain: [0, maxY * 1.15],
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
                allData={allData}
                visibleByEntity={visibleByEntity}
                selected={selected}
                entityColors={pickerEntityColors}
                fields={fields}
                colorMap={colorMap}
                almField={almField}
                heatClass={heatClass}
                baselineAvg={baselineAvg}
                years={years}
                hoverYears={years.filter((y) => y <= playback.throughYear)}
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
  allData: Map<string, Row[]>;
  visibleByEntity: Map<string, Row[]>;
  selected: string[];
  entityColors: Record<string, string>;
  fields: string[];
  colorMap: Record<string, string>;
  almField: string;
  heatClass: 1 | 3;
  baselineAvg: number | null;
  years: number[];
  hoverYears: number[];
  dark: boolean;
}

function ChartInner({
  width,
  height,
  innerW,
  innerH,
  xScale,
  yScale,
  allData,
  visibleByEntity,
  selected,
  entityColors,
  fields,
  colorMap,
  almField,
  heatClass,
  baselineAvg,
  years,
  hoverYears,
  dark,
}: InnerProps) {
  const nEnt = selected.length;
  const primaryRows = visibleByEntity.get(selected[0]) ?? [];

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    showTooltip,
    hideTooltip,
    tooltipOpen,
  } = useTooltip<TooltipPayload>();

  const getXForYear = useCallback((y: number) => xScale(y) ?? 0, [xScale]);

  const buildPayload = useCallback(
    (year: number, hit: string | null): TooltipPayload => {
      const fullRowsForAllEntities = (): TooltipPayload['rows'] => {
        const out: TooltipPayload['rows'] = [];
        for (const entity of selected) {
          const d = allData.get(entity)?.find((r) => r.Year === year);
          if (!d) continue;
          const prefix = selected.length > 1 ? `${entity}: ` : '';
          LEVELS.forEach((L, i) => {
            const fk = fieldName(L.key, heatClass);
            out.push({
              color: L.color,
              label: `${prefix}${L.label}`,
              value: fmt(d[fk]) + ' hrs/pp',
              group: entity,
            });
          });
          out.push({
            color: entityColors[entity] ?? '#64748b',
            label: `${prefix}At least moderate`,
            value: fmt(d[almField]) + ' hrs/pp',
            group: entity,
          });
        }
        return out;
      };

      if (!hit || !hit.includes(':::')) {
        const rows = fullRowsForAllEntities();
        const pop = allData.get(selected[0])?.find((r) => r.Year === year);
        return {
          year,
          rows,
          supplementary: pop
            ? [{ label: 'Population', value: (pop.Population / 1e9).toFixed(2) + 'B' }]
            : [],
          focusedEntity: null,
          focusedSeriesKey: null,
        };
      }

      const [entity, kind] = hit.split(':::');
      const d = allData.get(entity)?.find((r) => r.Year === year);
      if (!d) return { year, rows: [] };

      const ec = entityColors[entity] ?? '#0f766e';
      const prefix = selected.length > 1 ? `${entity}: ` : '';

      if (kind === 'alm') {
        return {
          year,
          rows: [
            {
              color: ec,
              label: `${prefix}At least moderate`,
              value: fmt(d[almField]) + ' hrs/pp',
              group: entity,
            },
          ],
          supplementary: [{ label: 'Population', value: (d.Population / 1e9).toFixed(2) + 'B' }],
          hoverFocus: `${entity} · at least moderate`,
          focusedEntity: entity,
          focusedSeriesKey: 'alm',
        };
      }

      if (kind.startsWith('layer:')) {
        const fieldKey = kind.slice('layer:'.length);
        const L = LEVELS.find((lev) => fieldName(lev.key, heatClass) === fieldKey);
        return {
          year,
          rows: [
            {
              color: colorMap[fieldKey] ?? '#666',
              label: `${prefix}${L?.label ?? fieldKey}`,
              value: fmt(d[fieldKey]) + ' hrs/pp',
              group: entity,
            },
          ],
          supplementary: [{ label: 'Population', value: (d.Population / 1e9).toFixed(2) + 'B' }],
          hoverFocus: `${entity} · ${L?.label ?? 'layer'}`,
          focusedEntity: entity,
          focusedSeriesKey: fieldKey,
        };
      }

      return { year, rows: [] };
    },
    [allData, selected, entityColors, almField, colorMap, heatClass],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      const point = localPoint(event);
      if (!point) return;
      const innerX = point.x - margin.left;
      const innerY = point.y - margin.top;
      const hy = hoverYears.length > 0 ? hoverYears : years;
      const nearestYear = nearestYearFromXLinear(innerX, hy, (y) => xScale(y) ?? 0);

      const polylines: { id: string; pts: { x: number; y: number }[] }[] = [];

      for (const entity of selected) {
        const data = visibleByEntity.get(entity) ?? [];
        const ptsAlm = data.map((d) => ({
          x: xScale(d.Year) ?? 0,
          y: yScale(d[almField] ?? 0) ?? 0,
        }));
        polylines.push({ id: `${entity}:::alm`, pts: ptsAlm });

        if (entity === selected[0] && nEnt === 1) {
          for (let li = 0; li < fields.length; li++) {
            const pts = data.map((d) => ({
              x: xScale(d.Year) ?? 0,
              y: yScale(stackCumulative(d, fields, li)) ?? 0,
            }));
            polylines.push({ id: `${entity}:::layer:${fields[li]}`, pts });
          }
        }
      }

      const hit = nearestAlongPolylines(innerX, innerY, polylines, 24);

      showTooltip({
        tooltipData: buildPayload(nearestYear, hit),
        tooltipLeft: getXForYear(nearestYear) + margin.left + 10,
        tooltipTop: point.y,
      });
    },
    [
      hoverYears,
      years,
      xScale,
      yScale,
      visibleByEntity,
      selected,
      almField,
      fields,
      nEnt,
      buildPayload,
      showTooltip,
      getXForYear,
    ],
  );

  const hoveredYear = tooltipData?.year ?? null;
  const fe = tooltipData?.focusedEntity;
  const fsk = tooltipData?.focusedSeriesKey;
  const dim = (nEnt > 1 && fe != null) || (nEnt === 1 && fe != null && tooltipData?.hoverFocus != null);

  const dotPositions = useMemo(() => {
    if (hoveredYear == null) return [];
    const out: { x: number; y: number; color: string }[] = [];
    for (const entity of selected) {
      if (fe && entity !== fe) continue;
      const d = visibleByEntity.get(entity)?.find((r) => r.Year === hoveredYear);
      if (!d) continue;
      const ec = entityColors[entity] ?? '#94a3b8';
      if (!fsk || fsk === 'alm') {
        out.push({
          x: getXForYear(hoveredYear),
          y: yScale(d[almField]) ?? 0,
          color: ec,
        });
      }
    }
    return out;
  }, [hoveredYear, selected, visibleByEntity, getXForYear, yScale, almField, entityColors, fe, fsk]);

  return (
    <>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <GridRows scale={yScale} width={innerW} stroke="#bfc7cf" strokeOpacity={0.3} />

          {baselineAvg != null && (
            <>
              <rect
                x={xScale(1990)}
                y={0}
                width={xScale(1999) - xScale(1990)}
                height={innerH}
                fill="#004e6f"
                fillOpacity={0.04}
              />
              <text
                x={xScale(1990) + 4}
                y={14}
                fontSize={9}
                fill="#004e6f"
                opacity={0.5}
                fontFamily="'Open Sans', sans-serif"
              >
                Baseline 1990–1999
              </text>
            </>
          )}

          {nEnt === 1 && (
            <AreaStack<Row, string>
              keys={fields}
              data={primaryRows}
              x={(d) => xScale(d.data.Year) ?? 0}
              y0={(d) => yScale(d[0]) ?? 0}
              y1={(d) => yScale(d[1]) ?? 0}
              curve={curveMonotoneX}
            >
              {({ stacks, path }) =>
                stacks.map((stack) => {
                  const isHi =
                    !dim ||
                    (fe === selected[0] &&
                      fsk &&
                      fsk !== 'alm' &&
                      fsk === stack.key);
                  return (
                    <path
                      key={`area-${stack.key}`}
                      d={path(stack) || ''}
                      fill={colorMap[stack.key]}
                      fillOpacity={dim ? (isHi ? 0.62 : 0.12) : 0.55}
                      stroke={colorMap[stack.key]}
                      strokeWidth={0.5}
                    />
                  );
                })
              }
            </AreaStack>
          )}

          {selected.map((entity) => {
            const data = visibleByEntity.get(entity) ?? [];
            const ec = entityColors[entity] ?? '#0f766e';
            const isLineHi =
              !dim || !fe || fe === entity || (fsk === 'alm' && fe === entity);
            const dash =
              nEnt > 1
                ? selected.indexOf(entity) === 0
                  ? ''
                  : selected.indexOf(entity) === 1
                    ? '10 6'
                    : '4 3'
                : '6 3';
            return (
              <LinePath
                key={`alm-${entity}`}
                data={data}
                x={(d) => xScale(d.Year) ?? 0}
                y={(d) => yScale(d[almField] ?? 0) ?? 0}
                stroke={ec}
                strokeWidth={dim ? (isLineHi && (!fe || fe === entity) ? 2.8 : 1.3) : 2.2}
                strokeOpacity={dim ? (isLineHi && (!fe || fe === entity) ? 1 : 0.32) : 1}
                strokeDasharray={dash}
                curve={curveMonotoneX}
              />
            );
          })}

          {baselineAvg != null && (
            <line
              x1={0}
              x2={innerW}
              y1={yScale(baselineAvg)}
              y2={yScale(baselineAvg)}
              stroke="#004e6f"
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.4}
            />
          )}

          <AxisBottom
            top={innerH}
            scale={xScale}
            stroke="#bfc7cf"
            tickStroke="#bfc7cf"
            numTicks={8}
            tickLabelProps={() => ({
              fill: '#40484e',
              fontSize: 11,
              fontFamily: "'Open Sans', sans-serif",
              textAnchor: 'middle' as const,
            })}
            tickFormat={(v) => String(Math.round(v as number))}
          />
          <AxisLeft
            scale={yScale}
            stroke="#bfc7cf"
            tickStroke="#bfc7cf"
            labelOffset={65}
            tickLabelProps={() => ({
              fill: '#40484e',
              fontSize: 11,
              fontFamily: "'Open Sans', sans-serif",
              textAnchor: 'end' as const,
              dy: '0.33em',
              dx: -4,
            })}
            tickFormat={(v) => fmt(v as number)}
            label="Hours per person per year"
            labelProps={{
              fill: '#004e6f',
              fontSize: 12,
              fontFamily: "'Open Sans', sans-serif",
              textAnchor: 'middle',
              fontWeight: 600,
            }}
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
