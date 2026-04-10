'use client';

import { useState, useMemo, useCallback } from 'react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { AreaStack, LinePath } from '@visx/shape';
import { AxisBottom, AxisLeft, AxisRight } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { globalData, whoData, hdiData } from '@/lib/data/indicator113pwhl';
import EntityPicker, { type EntityCategory } from '@/components/EntityPicker';
import { useChartTheme } from '@/components/ChartThemeContext';
import { useChartHover, Crosshair, TooltipCard, type TooltipPayload } from '@/components/ChartTooltip';
import DualAxisLegend, { DUAL_AXIS } from '@/components/DualAxisLegend';
import { axisColorsForEntities } from '@/lib/dualAxisPalettes';

/** Stacked areas = left axis — teal/cyan ramp (distinct sectors, same family as left scale). */
const SECTORS: { raw: string; label: string; color: string }[] = [
  { raw: 'WHL200Serv', label: 'Services', color: '#67e8f9' },
  { raw: 'WHL300Manuf', label: 'Manufacturing', color: '#2dd4bf' },
  { raw: 'WHL400sunAgr', label: 'Agriculture', color: '#14b8a6' },
  { raw: 'WHL400sunConstr', label: 'Construction', color: '#0f766e' },
];
const ALL_KEYS = SECTORS.map((s) => s.label);
const sectorColorMap: Record<string, string> = Object.fromEntries(SECTORS.map((s) => [s.label, s.color]));

/** Per-worker (right axis) — light amber reads clearly on the emerald strip; avoid dark teal (#004e6f) */
const PER_WORKER_STROKE = '#facc15';
const PER_WORKER_REF_BAND = 'rgba(250, 204, 21, 0.1)';
const PER_WORKER_REF_LINE = 'rgba(250, 204, 21, 0.45)';

const margin = { top: 24, right: 80, bottom: 40, left: 100 };
const fmtB = (v: number) => (v / 1e9).toFixed(2) + 'B';
const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 1 });

const whoRegions: string[] = [...new Set((whoData as unknown as Record<string, unknown>[]).map((d) => d['WHO region'] as string))].sort();
const hdiLevels: string[] = [...new Set((hdiData as unknown as Record<string, unknown>[]).map((d) => d['HDI level'] as string))].sort();

const entityCategories: EntityCategory[] = [
  { category: 'Summary', items: ['Global'] },
  { category: 'WHO Regions', items: whoRegions },
  { category: 'HDI Levels', items: hdiLevels },
];

interface StackDatum { Year: number; [key: string]: number }

function getDataForEntity(entity: string): StackDatum[] {
  const pick = (src: readonly Record<string, unknown>[]): StackDatum[] =>
    src.map((d) => ({
      Year: d.Year as number,
      Services: (d.WHL200Serv as number) / 1e6,
      Manufacturing: (d.WHL300Manuf as number) / 1e6,
      Agriculture: (d.WHL400sunAgr as number) / 1e6,
      Construction: (d.WHL400sunConstr as number) / 1e6,
      TotalSunWHLpp: (d.TotalSunWHLpp as number) ?? 0,
      TotalSunAgCon: ((d.TotalSunAgCon as number) ?? 0) / 1e9,
    }));

  if (entity === 'Global') return pick(globalData as unknown as Record<string, unknown>[]);
  if (whoRegions.includes(entity))
    return pick((whoData as unknown as Record<string, unknown>[]).filter((d) => d['WHO region'] === entity));
  if (hdiLevels.includes(entity))
    return pick((hdiData as unknown as Record<string, unknown>[]).filter((d) => d['HDI level'] === entity));
  return pick(globalData as unknown as Record<string, unknown>[]);
}

export default function Chart113PWHL() {
  const { dark } = useChartTheme();
  const [selected, setSelected] = useState<string[]>(['Global']);
  const [activeSectors, setActiveSectors] = useState<string[]>(ALL_KEYS);

  const data = useMemo(() => getDataForEntity(selected[0]), [selected]);
  const years = useMemo(() => data.map((d) => d.Year), [data]);
  const activeKeys = useMemo(() => ALL_KEYS.filter((k) => activeSectors.includes(k)), [activeSectors]);

  const toggle = (key: string) =>
    setActiveSectors((prev) => {
      if (prev.includes(key)) {
        if (prev.length <= 1) return prev;
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });

  const baselineRows = useMemo(
    () => data.filter((d) => d.Year >= 1990 && d.Year <= 1999),
    [data],
  );
  const baselinePP = useMemo(() => {
    if (baselineRows.length === 0) return null;
    return baselineRows.reduce((s, d) => s + d.TotalSunWHLpp, 0) / baselineRows.length;
  }, [baselineRows]);

  const pickerEntityColors = useMemo(() => axisColorsForEntities(selected).left, [selected]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <EntityPicker
          categories={entityCategories}
          selected={selected}
          onChange={(next) => {
            if (next.length === 0) setSelected(['Global']);
            else setSelected([next[next.length - 1]]);
          }}
          maxSelections={1}
          dark={dark}
          entityColors={pickerEntityColors}
        />
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {SECTORS.map((s) => {
            const on = activeSectors.includes(s.label);
            return (
              <button
                key={s.label}
                onClick={() => toggle(s.label)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all"
                style={on ? { borderColor: s.color, color: s.color, backgroundColor: `${s.color}15` } : { borderColor: '#bfc7cf50', color: '#94a3b8' }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: on ? s.color : '#bfc7cf' }} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <DualAxisLegend
        dark
        left={{
          title: 'Hours lost (millions)',
          subtitle: 'Stacked areas by sector — read against the left scale.',
          color: DUAL_AXIS.leftMintOnDark,
        }}
        right={{
          title: 'Hours per worker',
          subtitle: 'Yellow line — potential work hours lost per worker (right scale).',
          color: DUAL_AXIS.rightAmber,
        }}
      />

      <div className="h-[420px] w-full min-w-0 relative">
        <ParentSize debounceTime={0} initialSize={{ width: 400, height: 420 }}>
          {({ width, height }) => {
            if (width < 10 || height < 10 || activeKeys.length === 0) return null;
            const innerW = width - margin.left - margin.right;
            const innerH = height - margin.top - margin.bottom;

            const xScale = scaleLinear<number>({ domain: [Math.min(...years), Math.max(...years)], range: [0, innerW] });

            const maxY = Math.max(...data.map((d) => activeKeys.reduce((sum, k) => sum + (d[k] ?? 0), 0)), 1);
            const yScale = scaleLinear<number>({ domain: [0, maxY * 1.15], range: [innerH, 0], nice: true });

            const maxPP = Math.max(...data.map((d) => d.TotalSunWHLpp), 1);
            const yRightScale = scaleLinear<number>({ domain: [0, maxPP * 1.15], range: [innerH, 0], nice: true });

            const buildTooltip = (year: number): TooltipPayload => {
              const d = data.find((r) => r.Year === year);
              if (!d) return { year, rows: [] };
              const rows = SECTORS.filter((s) => activeKeys.includes(s.label)).map((s) => ({
                color: s.color,
                label: s.label,
                value: fmt(d[s.label]) + 'M hrs',
              }));
              rows.push({ color: PER_WORKER_STROKE, label: 'Per-worker', value: fmt(d.TotalSunWHLpp) + ' hrs' });
              return { year, rows, supplementary: [{ label: 'Total (ag+con)', value: d.TotalSunAgCon.toFixed(2) + 'B' }] };
            };

            return <ChartInner width={width} height={height} innerW={innerW} innerH={innerH} xScale={xScale} yScale={yScale} yRightScale={yRightScale} data={data} activeKeys={activeKeys} baselinePP={baselinePP} years={years} buildTooltip={buildTooltip} dark={dark} />;
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
  yRightScale: ReturnType<typeof scaleLinear<number>>;
  data: StackDatum[]; activeKeys: string[];
  baselinePP: number | null; years: number[];
  buildTooltip: (year: number) => TooltipPayload;
  dark: boolean;
}

function ChartInner({ width, height, innerW, innerH, xScale, yScale, yRightScale, data, activeKeys, baselinePP, years, buildTooltip, dark }: InnerProps) {
  const axisBottomTickFill = dark ? 'rgba(255,255,255,0.72)' : '#40484e';
  const leftAxisStroke = dark ? DUAL_AXIS.leftMintOnDark : DUAL_AXIS.leftTeal;
  const leftTickFill = dark ? '#ccfbf1' : '#115e59';
  const stableBuild = useCallback(buildTooltip, [buildTooltip]);
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, hoveredYear, handleMouseMove, handleMouseLeave, getXForYear } =
    useChartHover({ xScale, years, margin, buildTooltip: stableBuild });

  const dotPositions = useMemo(() => {
    if (hoveredYear == null) return [];
    const d = data.find((r) => r.Year === hoveredYear);
    if (!d) return [];
    return [{ x: getXForYear(hoveredYear), y: yRightScale(d.TotalSunWHLpp), color: PER_WORKER_STROKE }];
  }, [hoveredYear, data, getXForYear, yRightScale]);

  return (
    <>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <GridRows scale={yScale} width={innerW} stroke={leftAxisStroke} strokeOpacity={dark ? 0.25 : 0.2} />

          {/* 1990-99 baseline */}
          <rect x={xScale(1990)} y={0} width={xScale(1999) - xScale(1990)} height={innerH} fill={PER_WORKER_REF_BAND} />
          <text x={xScale(1990) + 4} y={14} fontSize={9} fill={PER_WORKER_STROKE} opacity={0.55} fontFamily="'Open Sans', sans-serif">1990–99 Ref</text>

          <AreaStack<StackDatum, string>
            keys={activeKeys}
            data={data}
            x={(d) => xScale(d.data.Year) ?? 0}
            y0={(d) => yScale(d[0]) ?? 0}
            y1={(d) => yScale(d[1]) ?? 0}
            curve={curveMonotoneX}
          >
            {({ stacks, path }) => stacks.map((stack) => (
              <path key={`area-${stack.key}`} d={path(stack) || ''} fill={sectorColorMap[stack.key]} fillOpacity={0.6} stroke={sectorColorMap[stack.key]} strokeWidth={0.5} />
            ))}
          </AreaStack>

          {/* Per-worker line (right axis) */}
          <LinePath
            data={data}
            x={(d) => xScale(d.Year) ?? 0}
            y={(d) => yRightScale(d.TotalSunWHLpp) ?? 0}
            stroke={PER_WORKER_STROKE}
            strokeWidth={2.5}
            curve={curveMonotoneX}
          />

          {/* Baseline per-worker ref line */}
          {baselinePP != null && (
            <line x1={0} x2={innerW} y1={yRightScale(baselinePP)} y2={yRightScale(baselinePP)} stroke={PER_WORKER_REF_LINE} strokeWidth={1} strokeDasharray="4,4" />
          )}

          <AxisBottom
            top={innerH}
            scale={xScale}
            stroke={dark ? 'rgba(255,255,255,0.35)' : '#bfc7cf'}
            tickStroke={dark ? 'rgba(255,255,255,0.35)' : '#bfc7cf'}
            numTicks={8}
            tickLabelProps={() => ({
              fill: dark ? axisBottomTickFill : '#40484e',
              fontSize: 11,
              fontFamily: "'Open Sans', sans-serif",
              textAnchor: 'middle' as const,
            })}
            tickFormat={(v) => String(Math.round(v as number))} />
          <AxisLeft scale={yScale} stroke={leftAxisStroke} tickStroke={leftAxisStroke} labelOffset={65}
            tickLabelProps={() => ({ fill: leftTickFill, fontSize: 11, fontFamily: "'Open Sans', sans-serif", textAnchor: 'end' as const, dy: '0.33em', dx: -4 })}
            tickFormat={(v) => fmt(v as number)}
            label="Millions of hours (stacked areas)"
            labelProps={{ fill: leftAxisStroke, fontSize: 12, fontFamily: "'Open Sans', sans-serif", textAnchor: 'middle', fontWeight: 600 }} />
          <AxisRight left={innerW} scale={yRightScale} stroke={PER_WORKER_STROKE} tickStroke={PER_WORKER_STROKE} labelOffset={50}
            tickLabelProps={() => ({ fill: PER_WORKER_STROKE, fontSize: 11, fontFamily: "'Open Sans', sans-serif", textAnchor: 'start' as const, dy: '0.33em', dx: 4 })}
            tickFormat={(v) => fmt(v as number)}
            label="Hours per worker (line)"
            labelProps={{ fill: PER_WORKER_STROKE, fontSize: 12, fontFamily: "'Open Sans', sans-serif", textAnchor: 'middle', fontWeight: 600 }} />
        </Group>
        <Crosshair hoveredYear={hoveredYear} getXForYear={getXForYear} innerHeight={innerH} innerWidth={innerW} margin={margin} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} dotPositions={dotPositions} />
      </svg>
      <TooltipCard tooltipOpen={tooltipOpen} tooltipData={tooltipData} tooltipLeft={tooltipLeft} tooltipTop={tooltipTop} dark={dark} />
    </>
  );
}
