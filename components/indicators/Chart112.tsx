'use client';

import { useState, useMemo, useCallback } from 'react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { AreaStack, LinePath } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { globalData, whoData, hdiData, lcData } from '@/lib/data/indicator112';
import EntityPicker, { type EntityCategory } from '@/components/EntityPicker';
import { useChartHover, Crosshair, TooltipCard, type TooltipPayload } from '@/components/ChartTooltip';

const LEVELS = [
  { key: 'extreme', label: 'Extreme', color: '#004e6f' },
  { key: 'high', label: 'High', color: '#B5334F' },
  { key: 'moderate', label: 'Moderate', color: '#E67E22' },
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
  { category: 'WHO Regions', items: whoRegions },
  { category: 'HDI Levels', items: hdiLevels },
  { category: 'LC Regions', items: lcRegions },
];

interface Row { Year: number; [key: string]: number }

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

export default function Chart112() {
  const [selected, setSelected] = useState<string[]>(['Global']);
  const [heatClass, setHeatClass] = useState<1 | 3>(1);

  const data = useMemo(() => getDataForEntity(selected[0]), [selected]);

  const fields = LEVELS.map((l) => fieldName(l.key, heatClass));
  const colorMap = Object.fromEntries(
    LEVELS.map((l) => [fieldName(l.key, heatClass), l.color]),
  ) as Record<string, string>;
  const almField = fieldName('at_least_moderate', heatClass);

  const years = useMemo(() => data.map((d) => d.Year), [data]);

  const baselineYears = useMemo(
    () => data.filter((d) => d.Year >= 1990 && d.Year <= 1999),
    [data],
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
          onChange={(entities) => setSelected(entities.length > 0 ? [entities[entities.length - 1]] : ['Global'])}
          maxSelections={1}
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

      <div className="h-[420px] relative">
        <ParentSize>
          {({ width, height }) => {
            if (width < 10 || height < 10) return null;
            const innerW = width - margin.left - margin.right;
            const innerH = height - margin.top - margin.bottom;

            const xScale = scaleLinear<number>({
              domain: [Math.min(...years), Math.max(...years)],
              range: [0, innerW],
            });

            const maxY = Math.max(
              ...data.map((d) => fields.reduce((sum, f) => sum + (d[f] ?? 0), 0)),
              1,
            );
            const yScale = scaleLinear<number>({
              domain: [0, maxY * 1.15],
              range: [innerH, 0],
              nice: true,
            });

            const buildTooltip = (year: number): TooltipPayload => {
              const d = data.find((r) => r.Year === year);
              if (!d) return { year, rows: [] };
              const rows: { color: string; label: string; value: string }[] = LEVELS.map((l) => ({
                color: l.color as string,
                label: l.label as string,
                value: fmt(d[fieldName(l.key, heatClass)]) + ' hrs/pp',
              }));
              rows.push({
                color: '#94a3b8',
                label: 'At least moderate',
                value: fmt(d[almField]) + ' hrs/pp',
              });
              return {
                year,
                rows,
                supplementary: [
                  { label: 'Population', value: (d.Population / 1e9).toFixed(2) + 'B' },
                ],
              };
            };

            return (
              <ChartInner
                width={width}
                height={height}
                innerW={innerW}
                innerH={innerH}
                xScale={xScale}
                yScale={yScale}
                data={data}
                fields={fields}
                colorMap={colorMap}
                almField={almField}
                baselineAvg={baselineAvg}
                years={years}
                buildTooltip={buildTooltip}
              />
            );
          }}
        </ParentSize>
      </div>
    </>
  );
}

interface InnerProps {
  width: number; height: number; innerW: number; innerH: number;
  xScale: ReturnType<typeof scaleLinear<number>>;
  yScale: ReturnType<typeof scaleLinear<number>>;
  data: Row[]; fields: string[];
  colorMap: Record<string, string>;
  almField: string; baselineAvg: number | null;
  years: number[];
  buildTooltip: (year: number) => TooltipPayload;
}

function ChartInner({ width, height, innerW, innerH, xScale, yScale, data, fields, colorMap, almField, baselineAvg, years, buildTooltip }: InnerProps) {
  const stableBuild = useCallback(buildTooltip, [buildTooltip]);
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, hoveredYear, handleMouseMove, handleMouseLeave, getXForYear } =
    useChartHover({ xScale, years, margin, buildTooltip: stableBuild });

  const dotPositions = useMemo(() => {
    if (hoveredYear == null) return [];
    const d = data.find((r) => r.Year === hoveredYear);
    if (!d) return [];
    return [{ x: getXForYear(hoveredYear), y: yScale(d[almField]) ?? 0, color: '#94a3b8' }];
  }, [hoveredYear, data, getXForYear, yScale, almField]);

  return (
    <>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <GridRows scale={yScale} width={innerW} stroke="#bfc7cf" strokeOpacity={0.3} />

          {/* 1990-99 baseline band */}
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
              <text x={xScale(1990) + 4} y={14} fontSize={9} fill="#004e6f" opacity={0.5} fontFamily="'Open Sans', sans-serif">
                Baseline 1990–1999
              </text>
            </>
          )}

          {/* Stacked area */}
          <AreaStack<Row, string>
            keys={fields}
            data={data}
            x={(d) => xScale(d.data.Year) ?? 0}
            y0={(d) => yScale(d[0]) ?? 0}
            y1={(d) => yScale(d[1]) ?? 0}
            curve={curveMonotoneX}
          >
            {({ stacks, path }) =>
              stacks.map((stack) => (
                <path
                  key={`area-${stack.key}`}
                  d={path(stack) || ''}
                  fill={colorMap[stack.key]}
                  fillOpacity={0.55}
                  stroke={colorMap[stack.key]}
                  strokeWidth={0.5}
                />
              ))
            }
          </AreaStack>

          {/* "At least moderate" overlay line */}
          <LinePath
            data={data}
            x={(d) => xScale(d.Year) ?? 0}
            y={(d) => yScale(d[almField] ?? 0) ?? 0}
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="6,3"
            curve={curveMonotoneX}
          />

          {/* Baseline average reference line */}
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
            top={innerH} scale={xScale} stroke="#bfc7cf" tickStroke="#bfc7cf" numTicks={8}
            tickLabelProps={() => ({ fill: '#40484e', fontSize: 11, fontFamily: "'Open Sans', sans-serif", textAnchor: 'middle' as const })}
            tickFormat={(v) => String(Math.round(v as number))}
          />
          <AxisLeft
            scale={yScale} stroke="#bfc7cf" tickStroke="#bfc7cf" labelOffset={65}
            tickLabelProps={() => ({ fill: '#40484e', fontSize: 11, fontFamily: "'Open Sans', sans-serif", textAnchor: 'end' as const, dy: '0.33em', dx: -4 })}
            tickFormat={(v) => fmt(v as number)}
            label="Hours per person per year"
            labelProps={{ fill: '#004e6f', fontSize: 12, fontFamily: "'Open Sans', sans-serif", textAnchor: 'middle', fontWeight: 600 }}
          />
        </Group>
        <Crosshair hoveredYear={hoveredYear} getXForYear={getXForYear} innerHeight={innerH} innerWidth={innerW} margin={margin} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} dotPositions={dotPositions} />
      </svg>
      <TooltipCard tooltipOpen={tooltipOpen} tooltipData={tooltipData} tooltipLeft={tooltipLeft} tooltipTop={tooltipTop} />
    </>
  );
}
