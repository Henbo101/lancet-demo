'use client';

import { useState, useMemo, useCallback } from 'react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { Bar, LinePath } from '@visx/shape';
import { AxisBottom, AxisLeft, AxisRight } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear, scaleBand } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { globalData, whoData, lcData, hdiData } from '@/lib/data/indicator113workers';
import EntityPicker, { buildColorMap, type EntityCategory } from '@/components/EntityPicker';
import { useChartHover, Crosshair, TooltipCard, type TooltipPayload } from '@/components/ChartTooltip';

const margin = { top: 24, right: 80, bottom: 40, left: 100 };
const fmtM = (v: number) => (v / 1e6).toFixed(1) + 'M';
const fmtPct = (v: number) => v.toFixed(1) + '%';

const whoRegions: string[] = [...new Set(whoData.map((d) => d['WHO Region'] as string))].sort();
const lcRegions: string[] = [...new Set(lcData.map((d) => d['Lancet Countdown Region'] as string))].sort();
const hdiLevels: string[] = [...new Set(hdiData.map((d) => d['HDI level'] as string))].sort();

const entityCategories: EntityCategory[] = [
  { category: 'WHO Regions', items: whoRegions },
  { category: 'LC Regions', items: lcRegions },
  { category: 'HDI Levels', items: hdiLevels },
];

interface Row { Year: number; workers: number; pct: number }

function getDataForEntity(entity: string): Row[] {
  const pick = (src: readonly Record<string, unknown>[]): Row[] =>
    src.map((d) => ({
      Year: d.Year as number,
      workers: d['Outdoor workers'] as number,
      pct: d['Outdoor workers_percentage'] as number,
    }));

  if (entity === 'Global') return pick(globalData as unknown as Record<string, unknown>[]);
  if (whoRegions.includes(entity))
    return pick(whoData.filter((d) => d['WHO Region'] === entity) as unknown as Record<string, unknown>[]);
  if (lcRegions.includes(entity))
    return pick(lcData.filter((d) => d['Lancet Countdown Region'] === entity) as unknown as Record<string, unknown>[]);
  if (hdiLevels.includes(entity))
    return pick(hdiData.filter((d) => d['HDI level'] === entity) as unknown as Record<string, unknown>[]);
  return pick(globalData as unknown as Record<string, unknown>[]);
}

export default function Chart113Workers() {
  const [selected, setSelected] = useState<string[]>(['Global']);
  const colorMap = useMemo(() => buildColorMap(selected), [selected]);

  const allData = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const entity of selected) map.set(entity, getDataForEntity(entity));
    return map;
  }, [selected]);

  const years = useMemo(
    () => [...new Set([...allData.values()].flatMap((d) => d.map((r) => r.Year)))].sort(),
    [allData],
  );

  return (
    <>
      <div className="mb-4">
        <EntityPicker categories={entityCategories} selected={selected} onChange={setSelected} />
      </div>

      <div className="h-[420px] relative">
        <ParentSize>
          {({ width, height }) => {
            if (width < 10 || height < 10) return null;
            const innerW = width - margin.left - margin.right;
            const innerH = height - margin.top - margin.bottom;

            const xScale = scaleBand<number>({ domain: years, range: [0, innerW], padding: 0.2 });

            const maxWorkers = Math.max(...[...allData.values()].flatMap((rows) => rows.map((d) => d.workers)), 1);
            const yScale = scaleLinear<number>({ domain: [0, maxWorkers * 1.15], range: [innerH, 0], nice: true });

            const maxPct = Math.max(...[...allData.values()].flatMap((rows) => rows.map((d) => d.pct)), 1);
            const yRightScale = scaleLinear<number>({ domain: [0, Math.min(maxPct * 1.3, 100)], range: [innerH, 0] });

            const entityCount = selected.length;
            const barGroupW = xScale.bandwidth();
            const barW = entityCount > 1 ? Math.max(barGroupW / entityCount - 2, 3) : barGroupW;

            const buildTooltip = (year: number): TooltipPayload => {
              const rows = selected.flatMap((entity) => {
                const d = allData.get(entity)?.find((r) => r.Year === year);
                if (!d) return [];
                const color = colorMap[entity];
                const prefix = entityCount > 1 ? `${entity}: ` : '';
                return [
                  { color, label: `${prefix}Workers`, value: fmtM(d.workers) },
                  { color, label: `${prefix}% of workforce`, value: fmtPct(d.pct) },
                ];
              });
              return { year, rows };
            };

            return <ChartInner width={width} height={height} innerW={innerW} innerH={innerH} xScale={xScale} yScale={yScale} yRightScale={yRightScale} allData={allData} selected={selected} colorMap={colorMap} years={years} barW={barW} entityCount={entityCount} buildTooltip={buildTooltip} />;
          }}
        </ParentSize>
      </div>
    </>
  );
}

interface InnerProps {
  width: number; height: number; innerW: number; innerH: number;
  xScale: ReturnType<typeof scaleBand<number>>;
  yScale: ReturnType<typeof scaleLinear<number>>;
  yRightScale: ReturnType<typeof scaleLinear<number>>;
  allData: Map<string, Row[]>;
  selected: string[]; colorMap: Record<string, string>;
  years: number[]; barW: number; entityCount: number;
  buildTooltip: (year: number) => TooltipPayload;
}

function ChartInner({ width, height, innerW, innerH, xScale, yScale, yRightScale, allData, selected, colorMap, years, barW, entityCount, buildTooltip }: InnerProps) {
  const stableBuild = useCallback(buildTooltip, [buildTooltip]);
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, hoveredYear, handleMouseMove, handleMouseLeave, getXForYear } =
    useChartHover({ xScale, years, margin, buildTooltip: stableBuild });

  const dotPositions = useMemo(() => {
    if (hoveredYear == null) return [];
    return selected.flatMap((entity) => {
      const d = allData.get(entity)?.find((r) => r.Year === hoveredYear);
      if (!d) return [];
      return [{ x: getXForYear(hoveredYear), y: yRightScale(d.pct), color: colorMap[entity] }];
    });
  }, [hoveredYear, selected, allData, getXForYear, yRightScale, colorMap]);

  return (
    <>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <GridRows scale={yScale} width={innerW} stroke="#bfc7cf" strokeOpacity={0.3} />

          {/* Bars per entity */}
          {selected.map((entity, ei) => {
            const rows = allData.get(entity) ?? [];
            const color = colorMap[entity];
            return rows.map((d) => {
              const baseX = xScale(d.Year) ?? 0;
              const x = entityCount > 1 ? baseX + ei * (barW + 2) : baseX;
              const barH = innerH - (yScale(d.workers) ?? 0);
              return <Bar key={`${entity}-${d.Year}`} x={x} y={yScale(d.workers) ?? 0} width={barW} height={barH} fill={color} fillOpacity={0.65} rx={2} />;
            });
          })}

          {/* % lines per entity (right axis) */}
          {selected.map((entity) => {
            const rows = allData.get(entity) ?? [];
            const color = colorMap[entity];
            return (
              <LinePath
                key={`line-${entity}`}
                data={rows}
                x={(d) => (xScale(d.Year) ?? 0) + xScale.bandwidth() / 2}
                y={(d) => yRightScale(d.pct) ?? 0}
                stroke={color}
                strokeWidth={2.5}
                curve={curveMonotoneX}
              />
            );
          })}

          <AxisBottom top={innerH} scale={xScale} stroke="#bfc7cf" tickStroke="#bfc7cf"
            tickLabelProps={() => ({ fill: '#40484e', fontSize: 11, fontFamily: "'Open Sans', sans-serif", textAnchor: 'middle' as const })}
            tickFormat={(v) => String(v)} />
          <AxisLeft scale={yScale} stroke="#bfc7cf" tickStroke="#bfc7cf" labelOffset={65}
            tickLabelProps={() => ({ fill: '#40484e', fontSize: 11, fontFamily: "'Open Sans', sans-serif", textAnchor: 'end' as const, dy: '0.33em', dx: -4 })}
            tickFormat={(v) => fmtM(v as number)}
            label="Outdoor workers"
            labelProps={{ fill: '#004e6f', fontSize: 12, fontFamily: "'Open Sans', sans-serif", textAnchor: 'middle', fontWeight: 600 }} />
          <AxisRight left={innerW} scale={yRightScale} stroke="#bfc7cf" tickStroke="#bfc7cf" labelOffset={50}
            tickLabelProps={() => ({ fill: '#B5334F', fontSize: 11, fontFamily: "'Open Sans', sans-serif", textAnchor: 'start' as const, dy: '0.33em', dx: 4 })}
            tickFormat={(v) => `${v}%`}
            label="% of total workforce"
            labelProps={{ fill: '#B5334F', fontSize: 12, fontFamily: "'Open Sans', sans-serif", textAnchor: 'middle', fontWeight: 600 }} />
        </Group>
        <Crosshair hoveredYear={hoveredYear} getXForYear={getXForYear} innerHeight={innerH} innerWidth={innerW} margin={margin} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} dotPositions={dotPositions} />
      </svg>
      <TooltipCard tooltipOpen={tooltipOpen} tooltipData={tooltipData} tooltipLeft={tooltipLeft} tooltipTop={tooltipTop} />
    </>
  );
}
