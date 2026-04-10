'use client';

import { useState, useMemo } from 'react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { globalData, whoData, hdiData } from '@/lib/data/indicator112';

const COLORS = ['#E67E22', '#B5334F', '#004e6f'];
const LEVELS = [
  { key: 'moderate', label: 'Moderate', color: COLORS[0] },
  { key: 'high', label: 'High', color: COLORS[1] },
  { key: 'extreme', label: 'Extreme', color: COLORS[2] },
];
const margin = { top: 20, right: 30, bottom: 40, left: 85 };
const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 1 });

function fieldName(level: string, cls: 1 | 3) {
  return `annual_yhrs_pp_${level}_${cls}`;
}

export default function Chart112() {
  const [selected, setSelected] = useState('global');
  const [heatClass, setHeatClass] = useState<1 | 3>(1);

  const whoRegions = useMemo(() => [...new Set(whoData.map((d) => d['WHO region']))], []);
  const hdiLevels = useMemo(() => [...new Set(hdiData.map((d) => d['HDI level']))], []);

  const data = useMemo(() => {
    const pick = (src: readonly Record<string, unknown>[]) =>
      src.map((d) => ({
        Year: d.Year as number,
        annual_yhrs_pp_moderate_1: d.annual_yhrs_pp_moderate_1 as number,
        annual_yhrs_pp_high_1: d.annual_yhrs_pp_high_1 as number,
        annual_yhrs_pp_extreme_1: d.annual_yhrs_pp_extreme_1 as number,
        annual_yhrs_pp_moderate_3: d.annual_yhrs_pp_moderate_3 as number,
        annual_yhrs_pp_high_3: d.annual_yhrs_pp_high_3 as number,
        annual_yhrs_pp_extreme_3: d.annual_yhrs_pp_extreme_3 as number,
      }));

    if (selected === 'global') return pick(globalData as unknown as Record<string, unknown>[]);
    const [type, value] = selected.split(':');
    if (type === 'who')
      return pick(whoData.filter((d) => d['WHO region'] === value) as unknown as Record<string, unknown>[]);
    if (type === 'hdi')
      return pick(hdiData.filter((d) => d['HDI level'] === value) as unknown as Record<string, unknown>[]);
    return pick(globalData as unknown as Record<string, unknown>[]);
  }, [selected]);

  const fields = LEVELS.map((l) => fieldName(l.key, heatClass));

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4 mb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-headline text-on-surface-variant uppercase tracking-widest">
            Region
          </span>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="px-3 py-1.5 text-sm border border-outline-variant rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="global">Global</option>
            <optgroup label="WHO Region">
              {whoRegions.map((r) => (
                <option key={r} value={`who:${r}`}>{r}</option>
              ))}
            </optgroup>
            <optgroup label="HDI Level">
              {hdiLevels.map((l) => (
                <option key={l} value={`hdi:${l}`}>{l}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-headline text-on-surface-variant uppercase tracking-widest">
            Heat stress
          </span>
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

      <div className="flex items-center gap-4 mb-3">
        {LEVELS.map((l) => (
          <span key={l.key} className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: l.color }}
            />
            {l.label}
          </span>
        ))}
      </div>

      <div className="h-[380px]">
        <ParentSize>
          {({ width, height }) => {
            if (width < 10 || height < 10) return null;
            const xMax = width - margin.left - margin.right;
            const yMax = height - margin.top - margin.bottom;

            const xScale = scaleLinear<number>({
              domain: [
                Math.min(...data.map((d) => d.Year)),
                Math.max(...data.map((d) => d.Year)),
              ],
              range: [0, xMax],
            });

            const allVals = data.flatMap((d) =>
              fields.map((f) => (d as unknown as Record<string, number>)[f] ?? 0),
            );
            const yScale = scaleLinear<number>({
              domain: [0, Math.max(1, ...allVals) * 1.1],
              range: [yMax, 0],
              nice: true,
            });

            return (
              <svg width={width} height={height}>
                <Group left={margin.left} top={margin.top}>
                  <GridRows scale={yScale} width={xMax} stroke="#bfc7cf" strokeOpacity={0.3} />
                  {LEVELS.map((l, i) => (
                    <LinePath
                      key={l.key}
                      data={data}
                      x={(d) => xScale(d.Year) ?? 0}
                      y={(d) => yScale((d as unknown as Record<string, number>)[fields[i]] ?? 0) ?? 0}
                      stroke={l.color}
                      strokeWidth={2}
                      curve={curveMonotoneX}
                    />
                  ))}
                  <AxisBottom
                    top={yMax}
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
                      fill: '#40484e',
                      fontSize: 12,
                      fontFamily: "'Open Sans', sans-serif",
                      textAnchor: 'middle',
                    }}
                  />
                </Group>
              </svg>
            );
          }}
        </ParentSize>
      </div>
    </>
  );
}
