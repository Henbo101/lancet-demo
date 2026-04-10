'use client';

import { useState, useMemo, useCallback } from 'react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { Bar, LinePath } from '@visx/shape';
import { AxisBottom, AxisLeft, AxisRight } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear, scaleBand } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { interpolateRgb } from 'd3-interpolate';
import { globalData, countryData } from '@/lib/data/indicator111attr';
import { axisColorsForEntities } from '@/lib/dualAxisPalettes';
import EntityPicker, {
  type EntityCategory,
} from '@/components/EntityPicker';
import {
  useChartHover,
  Crosshair,
  TooltipCard,
  type TooltipPayload,
} from '@/components/ChartTooltip';
import { useChartTheme } from '@/components/ChartThemeContext';
import { bandEntityCenterX } from '@/lib/chartGeometry';
import DualAxisLegend, { DUAL_AXIS } from '@/components/DualAxisLegend';

const margin = { top: 24, right: 80, bottom: 40, left: 100 };

const fmt = (v: number) =>
  v.toLocaleString(undefined, { maximumFractionDigits: 1 });
const pct = (v: number) =>
  v.toLocaleString(undefined, { maximumFractionDigits: 0 }) + '%';

const whoRegions: string[] = [
  ...new Set(countryData.map((d) => d['WHO region'] as string)),
].sort();
const hdiLevels: string[] = [...new Set(countryData.map((d) => d['HDI level'] as string))].sort();
const countries: string[] = [...new Set(countryData.map((d) => d.Country as string))].sort();

const entityCategories: EntityCategory[] = [
  { category: 'WHO Regions', items: whoRegions },
  { category: 'HDI Levels', items: hdiLevels },
  { category: 'Countries', items: countries },
];

interface Row {
  Year: number;
  Observed: number;
  Counterfactual: number;
  Attributable_to_CC: number;
}

function getDataForEntity(entity: string): Row[] {
  if (entity === 'Global') return [...globalData];

  if (whoRegions.includes(entity)) {
    const filtered = countryData.filter((d) => (d['WHO region'] as string) === entity);
    const byYear = new Map<number, Row>();
    for (const d of filtered) {
      const existing = byYear.get(d.Year);
      if (existing) {
        existing.Observed += d.Observed;
        existing.Counterfactual += d.Counterfactual;
        existing.Attributable_to_CC += d.Attributable_to_CC;
      } else {
        byYear.set(d.Year, {
          Year: d.Year,
          Observed: d.Observed,
          Counterfactual: d.Counterfactual,
          Attributable_to_CC: d.Attributable_to_CC,
        });
      }
    }
    return [...byYear.values()].sort((a, b) => a.Year - b.Year);
  }

  if (hdiLevels.includes(entity)) {
    const filtered = countryData.filter((d) => (d['HDI level'] as string) === entity);
    const byYear = new Map<number, Row>();
    for (const d of filtered) {
      const existing = byYear.get(d.Year);
      if (existing) {
        existing.Observed += d.Observed;
        existing.Counterfactual += d.Counterfactual;
        existing.Attributable_to_CC += d.Attributable_to_CC;
      } else {
        byYear.set(d.Year, {
          Year: d.Year,
          Observed: d.Observed,
          Counterfactual: d.Counterfactual,
          Attributable_to_CC: d.Attributable_to_CC,
        });
      }
    }
    return [...byYear.values()].sort((a, b) => a.Year - b.Year);
  }

  return [...countryData.filter((d) => (d.Country as string) === entity)];
}

export default function Chart111Attr() {
  const { dark } = useChartTheme();
  const [selected, setSelected] = useState<string[]>(['Global']);

  const { left: leftColorMap, right: rightColorMap } = useMemo(
    () => axisColorsForEntities(selected),
    [selected],
  );

  const allData = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const entity of selected) {
      map.set(entity, getDataForEntity(entity));
    }
    return map;
  }, [selected]);

  const years = useMemo(
    () => [...new Set([...allData.values()].flatMap((d) => d.map((r) => r.Year)))].sort(),
    [allData],
  );

  return (
    <>
      <div className="mb-4">
        <EntityPicker
          categories={entityCategories}
          selected={selected}
          onChange={setSelected}
          dark={dark}
          entityColors={leftColorMap}
        />
      </div>

      <DualAxisLegend
        left={{
          title: 'Heatwave days',
          subtitle: 'Stacked bars — counterfactual (faint) plus attributable (solid), by entity colour.',
          color: DUAL_AXIS.leftTeal,
        }}
        right={{
          title: '% Attributable',
          subtitle: 'Lines — share of observed heatwave days linked to climate change.',
          color: DUAL_AXIS.rightRose,
        }}
      />

      <div className="h-[420px] relative">
        <ParentSize>
          {({ width, height }) => {
            if (width < 10 || height < 10) return null;
            const innerW = width - margin.left - margin.right;
            const innerH = height - margin.top - margin.bottom;

            const xScale = scaleBand<number>({
              domain: years,
              range: [0, innerW],
              padding: selected.length > 1 ? 0.15 : 0.3,
            });

            const maxY = Math.max(
              ...[...allData.values()].flatMap((rows) =>
                rows.map((d) => d.Counterfactual + d.Attributable_to_CC),
              ),
              1,
            );
            const yScale = scaleLinear<number>({
              domain: [0, maxY * 1.15],
              range: [innerH, 0],
              nice: true,
            });

            const maxPct = Math.max(
              5,
              ...[...allData.values()].flatMap((rows) =>
                rows
                  .filter((d) => d.Observed > 0)
                  .map((d) => (d.Attributable_to_CC / d.Observed) * 100),
              ),
            );
            const yRightScale = scaleLinear<number>({
              domain: [0, Math.min(100, maxPct * 1.1)],
              range: [innerH, 0],
            });

            const entityCount = selected.length;
            const barGroupWidth = xScale.bandwidth();
            const barWidth = entityCount > 1
              ? Math.max(barGroupWidth / entityCount - 2, 4)
              : barGroupWidth;

            const buildTooltip = (year: number): TooltipPayload => {
              const rows = selected.flatMap((entity) => {
                const d = allData.get(entity)?.find((r) => r.Year === year);
                if (!d) return [];
                const pctVal = d.Observed > 0 ? (d.Attributable_to_CC / d.Observed) * 100 : 0;
                const lc = leftColorMap[entity];
                const rc = rightColorMap[entity];
                const prefix = entityCount > 1 ? `${entity}: ` : '';
                return [
                  { color: lc, label: `${prefix}Observed`, value: fmt(d.Observed), group: entity },
                  {
                    color: interpolateRgb('#ffffff', lc)(0.35),
                    label: `${prefix}Counterfactual`,
                    value: fmt(d.Counterfactual),
                    group: entity,
                  },
                  { color: lc, label: `${prefix}Attributable`, value: fmt(d.Attributable_to_CC), group: entity },
                  { color: rc, label: `${prefix}% Attributable`, value: pct(pctVal), group: entity },
                ];
              });
              return { year, rows };
            };

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
                leftColorMap={leftColorMap}
                rightColorMap={rightColorMap}
                years={years}
                barWidth={barWidth}
                entityCount={entityCount}
                buildTooltip={buildTooltip}
                dark={dark}
              />
            );
          }}
        </ParentSize>
      </div>
    </>
  );
}

interface ChartInnerProps {
  width: number;
  height: number;
  innerW: number;
  innerH: number;
  xScale: ReturnType<typeof scaleBand<number>>;
  yScale: ReturnType<typeof scaleLinear<number>>;
  yRightScale: ReturnType<typeof scaleLinear<number>>;
  allData: Map<string, Row[]>;
  selected: string[];
  leftColorMap: Record<string, string>;
  rightColorMap: Record<string, string>;
  years: number[];
  barWidth: number;
  entityCount: number;
  buildTooltip: (year: number) => TooltipPayload;
  dark: boolean;
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
  leftColorMap,
  rightColorMap,
  years,
  barWidth,
  entityCount,
  buildTooltip,
  dark,
}: ChartInnerProps) {
  const stableBuildTooltip = useCallback(buildTooltip, [buildTooltip]);
  const gap = 2;

  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, hoveredYear, handleMouseMove, handleMouseLeave, getXForYear } =
    useChartHover({
      xScale,
      years,
      margin,
      buildTooltip: stableBuildTooltip,
    });

  const dotPositions = useMemo(() => {
    if (hoveredYear == null) return [];
    return selected.flatMap((entity, ei) => {
      const d = allData.get(entity)?.find((r) => r.Year === hoveredYear);
      if (!d || d.Observed === 0) return [];
      const pctVal = (d.Attributable_to_CC / d.Observed) * 100;
      return [{
        x: bandEntityCenterX(hoveredYear, ei, entityCount, xScale, barWidth, gap),
        y: yRightScale(pctVal),
        color: rightColorMap[entity],
      }];
    });
  }, [hoveredYear, selected, allData, yRightScale, rightColorMap, entityCount, xScale, barWidth]);

  return (
    <>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <GridRows
            scale={yScale}
            width={innerW}
            stroke={DUAL_AXIS.leftTeal}
            strokeOpacity={0.2}
          />

          {/* Bars per entity */}
          {selected.map((entity, ei) => {
            const rows = allData.get(entity) ?? [];
            const barColor = leftColorMap[entity];
            return rows.map((d) => {
              const baseX = xScale(d.Year) ?? 0;
              const x = entityCount > 1 ? baseX + ei * (barWidth + 2) : baseX;
              const cfH = innerH - (yScale(d.Counterfactual) ?? 0);
              const attrH =
                (yScale(d.Counterfactual) ?? 0) -
                (yScale(d.Counterfactual + d.Attributable_to_CC) ?? 0);
              return (
                <g key={`${entity}-${d.Year}`}>
                  <Bar
                    x={x}
                    y={yScale(d.Counterfactual) ?? 0}
                    width={barWidth}
                    height={cfH}
                    fill={barColor}
                    fillOpacity={0.3}
                    rx={2}
                  />
                  <Bar
                    x={x}
                    y={yScale(d.Counterfactual + d.Attributable_to_CC) ?? 0}
                    width={barWidth}
                    height={attrH}
                    fill={barColor}
                    rx={2}
                  />
                </g>
              );
            });
          })}

          {/* % attributable line per entity (right axis) */}
          {selected.map((entity, ei) => {
            const rows = allData.get(entity) ?? [];
            const lineData = rows
              .filter((d) => d.Observed > 0)
              .map((d) => ({
                year: d.Year,
                pct: (d.Attributable_to_CC / d.Observed) * 100,
              }));
            const lineColor = rightColorMap[entity];
            return (
              <g key={`line-${entity}`}>
                <LinePath
                  data={lineData}
                  x={(d) =>
                    bandEntityCenterX(d.year, ei, entityCount, xScale, barWidth, gap)
                  }
                  y={(d) => yRightScale(d.pct)}
                  stroke={lineColor}
                  strokeWidth={2.5}
                  curve={curveMonotoneX}
                />
              </g>
            );
          })}

          <AxisBottom
            top={innerH}
            scale={xScale}
            stroke="#bfc7cf"
            tickStroke="#bfc7cf"
            tickLabelProps={() => ({
              fill: '#40484e',
              fontSize: 11,
              fontFamily: "'Open Sans', sans-serif",
              textAnchor: 'middle' as const,
            })}
            tickFormat={(v) => String(v)}
          />

          <AxisLeft
            scale={yScale}
            stroke={DUAL_AXIS.leftTeal}
            tickStroke={DUAL_AXIS.leftTeal}
            labelOffset={65}
            tickLabelProps={() => ({
              fill: '#115e59',
              fontSize: 11,
              fontFamily: "'Open Sans', sans-serif",
              textAnchor: 'end' as const,
              dy: '0.33em',
              dx: -4,
            })}
            tickFormat={(v) => fmt(v as number)}
            label="Heatwave days (bars)"
            labelProps={{
              fill: DUAL_AXIS.leftTeal,
              fontSize: 12,
              fontFamily: "'Open Sans', sans-serif",
              textAnchor: 'middle',
              fontWeight: 600,
            }}
          />

          <AxisRight
            left={innerW}
            scale={yRightScale}
            stroke={DUAL_AXIS.rightRose}
            tickStroke={DUAL_AXIS.rightRose}
            tickLabelProps={() => ({
              fill: '#9f1239',
              fontSize: 11,
              fontFamily: "'Open Sans', sans-serif",
              textAnchor: 'start' as const,
              dy: '0.33em',
              dx: 4,
            })}
            tickFormat={(v) => `${v}%`}
            label="% Attributable (lines)"
            labelOffset={50}
            labelProps={{
              fill: DUAL_AXIS.rightRose,
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
          onMouseLeave={handleMouseLeave}
          dotPositions={dotPositions}
        />
      </svg>

      <TooltipCard
        tooltipOpen={tooltipOpen}
        tooltipData={tooltipData}
        tooltipLeft={tooltipLeft}
        tooltipTop={tooltipTop}
        dark={dark}
      />
    </>
  );
}
