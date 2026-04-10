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
import { useChartHover, Crosshair, TooltipCard, type TooltipPayload } from '@/components/ChartTooltip';

const SECTORS: { raw: string; label: string; color: string }[] = [
  { raw: 'WHL200Serv', label: 'Services', color: '#259AD4' },
  { raw: 'WHL300Manuf', label: 'Manufacturing', color: '#B5334F' },
  { raw: 'WHL400sunAgr', label: 'Agriculture', color: '#2ECC71' },
  { raw: 'WHL400sunConstr', label: 'Construction', color: '#E67E22' },
];
const ALL_KEYS = SECTORS.map((s) => s.label);
const sectorColorMap: Record<string, string> = Object.fromEntries(SECTORS.map((s) => [s.label, s.color]));

const margin = { top: 24, right: 80, bottom: 40, left: 100 };
const fmtB = (v: number) => (v / 1e9).toFixed(2) + 'B';
const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 1 });

const whoRegions: string[] = [...new Set((whoData as unknown as Record<string, unknown>[]).map((d) => d['WHO region'] as string))].sort();
const hdiLevels: string[] = [...new Set((hdiData as unknown as Record<string, unknown>[]).map((d) => d['HDI level'] as string))].sort();

const entityCategories: EntityCategory[] = [
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
  const [selected, setSelected] = useState<string[]>(['Global']);
  const [activeSectors, setActiveSectors] = useState<string[]>(ALL_KEYS);

  const data = useMemo(() => getDataForEntity(selected[0]), [selected]);
  const years = useMemo(() => data.map((d) => d.Year), [data]);
  const activeKeys = useMemo(() => ALL_KEYS.filter((k) => activeSectors.includes(k)), [activeSectors]);

  const toggle = (key: string) =>
    setActiveSectors((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const baselineRows = useMemo(
    () => data.filter((d) => d.Year >= 1990 && d.Year <= 1999),
    [data],
  );
  const baselinePP = useMemo(() => {
    if (baselineRows.length === 0) return null;
    return baselineRows.reduce((s, d) => s + d.TotalSunWHLpp, 0) / baselineRows.length;
  }, [baselineRows]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <EntityPicker
          categories={entityCategories}
          selected={selected}
          onChange={(entities) => setSelected(entities.length > 0 ? [entities[entities.length - 1]] : ['Global'])}
          maxSelections={1}
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

      <div className="h-[420px] relative">
        <ParentSize>
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
              rows.push({ color: '#004e6f', label: 'Per-worker', value: fmt(d.TotalSunWHLpp) + ' hrs' });
              return { year, rows, supplementary: [{ label: 'Total (ag+con)', value: d.TotalSunAgCon.toFixed(2) + 'B' }] };
            };

            return <ChartInner width={width} height={height} innerW={innerW} innerH={innerH} xScale={xScale} yScale={yScale} yRightScale={yRightScale} data={data} activeKeys={activeKeys} baselinePP={baselinePP} years={years} buildTooltip={buildTooltip} />;
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
}

function ChartInner({ width, height, innerW, innerH, xScale, yScale, yRightScale, data, activeKeys, baselinePP, years, buildTooltip }: InnerProps) {
  const stableBuild = useCallback(buildTooltip, [buildTooltip]);
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, hoveredYear, handleMouseMove, handleMouseLeave, getXForYear } =
    useChartHover({ xScale, years, margin, buildTooltip: stableBuild });

  const dotPositions = useMemo(() => {
    if (hoveredYear == null) return [];
    const d = data.find((r) => r.Year === hoveredYear);
    if (!d) return [];
    return [{ x: getXForYear(hoveredYear), y: yRightScale(d.TotalSunWHLpp), color: '#004e6f' }];
  }, [hoveredYear, data, getXForYear, yRightScale]);

  return (
    <>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <GridRows scale={yScale} width={innerW} stroke="#bfc7cf" strokeOpacity={0.3} />

          {/* 1990-99 baseline */}
          <rect x={xScale(1990)} y={0} width={xScale(1999) - xScale(1990)} height={innerH} fill="#004e6f" fillOpacity={0.04} />
          <text x={xScale(1990) + 4} y={14} fontSize={9} fill="#004e6f" opacity={0.5} fontFamily="'Open Sans', sans-serif">1990–99 Ref</text>

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
            stroke="#004e6f"
            strokeWidth={2.5}
            curve={curveMonotoneX}
          />

          {/* Baseline per-worker ref line */}
          {baselinePP != null && (
            <line x1={0} x2={innerW} y1={yRightScale(baselinePP)} y2={yRightScale(baselinePP)} stroke="#004e6f" strokeWidth={1} strokeDasharray="4,4" opacity={0.3} />
          )}

          <AxisBottom top={innerH} scale={xScale} stroke="#bfc7cf" tickStroke="#bfc7cf" numTicks={8}
            tickLabelProps={() => ({ fill: '#40484e', fontSize: 11, fontFamily: "'Open Sans', sans-serif", textAnchor: 'middle' as const })}
            tickFormat={(v) => String(Math.round(v as number))} />
          <AxisLeft scale={yScale} stroke="#bfc7cf" tickStroke="#bfc7cf" labelOffset={65}
            tickLabelProps={() => ({ fill: '#40484e', fontSize: 11, fontFamily: "'Open Sans', sans-serif", textAnchor: 'end' as const, dy: '0.33em', dx: -4 })}
            tickFormat={(v) => fmt(v as number)}
            label="Millions of hours lost"
            labelProps={{ fill: '#004e6f', fontSize: 12, fontFamily: "'Open Sans', sans-serif", textAnchor: 'middle', fontWeight: 600 }} />
          <AxisRight left={innerW} scale={yRightScale} stroke="#bfc7cf" tickStroke="#bfc7cf" labelOffset={50}
            tickLabelProps={() => ({ fill: '#004e6f', fontSize: 11, fontFamily: "'Open Sans', sans-serif", textAnchor: 'start' as const, dy: '0.33em', dx: 4 })}
            tickFormat={(v) => fmt(v as number)}
            label="Hours per worker"
            labelProps={{ fill: '#004e6f', fontSize: 12, fontFamily: "'Open Sans', sans-serif", textAnchor: 'middle', fontWeight: 600 }} />
        </Group>
        <Crosshair hoveredYear={hoveredYear} getXForYear={getXForYear} innerHeight={innerH} innerWidth={innerW} margin={margin} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} dotPositions={dotPositions} />
      </svg>
      <TooltipCard tooltipOpen={tooltipOpen} tooltipData={tooltipData} tooltipLeft={tooltipLeft} tooltipTop={tooltipTop} />
    </>
  );
}
