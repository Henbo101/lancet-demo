'use client';

import { useState, useMemo } from 'react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { globalData, whoData, hdiData, lcData } from '@/lib/data/indicator111vuln';

const COLORS = ['#004e6f', '#B5334F'];
const SERIES = [
  { key: 'exposure_average_infants', label: 'Infants (<1 yr)', color: COLORS[0] },
  { key: 'exposure_average_65', label: 'Over 65', color: COLORS[1] },
];
const margin = { top: 20, right: 30, bottom: 40, left: 65 };
const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 1 });

export default function Chart111Vuln() {
  const [selected, setSelected] = useState('global');
  const [active, setActive] = useState<string[]>(SERIES.map((s) => s.key));

  const whoRegions = useMemo(() => [...new Set(whoData.map((d) => d['WHO region']))], []);
  const hdiLevels = useMemo(() => [...new Set(hdiData.map((d) => d['HDI level']))], []);
  const lcRegions = useMemo(() => [...new Set(lcData.map((d) => d['Lancet Countdown Region']))], []);

  const data = useMemo(() => {
    const pick = (src: readonly Record<string, unknown>[]) =>
      src.map((d) => ({
        Year: d.Year as number,
        exposure_average_infants: d.exposure_average_infants as number,
        exposure_average_65: d.exposure_average_65 as number,
      }));

    if (selected === 'global') return pick(globalData as unknown as Record<string, unknown>[]);
    const [type, value] = selected.split(':');
    if (type === 'who')
      return pick(whoData.filter((d) => d['WHO region'] === value) as unknown as Record<string, unknown>[]);
    if (type === 'hdi')
      return pick(hdiData.filter((d) => d['HDI level'] === value) as unknown as Record<string, unknown>[]);
    if (type === 'lc')
      return pick(lcData.filter((d) => d['Lancet Countdown Region'] === value) as unknown as Record<string, unknown>[]);
    return pick(globalData as unknown as Record<string, unknown>[]);
  }, [selected]);

  const toggle = (key: string) =>
    setActive((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

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
            <optgroup label="Lancet Countdown Region">
              {lcRegions.map((r) => (
                <option key={r} value={`lc:${r}`}>{r}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {SERIES.map((s) => {
            const on = active.includes(s.key);
            return (
              <button
                key={s.key}
                onClick={() => toggle(s.key)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-all"
                style={
                  on
                    ? { borderColor: s.color, color: s.color, backgroundColor: `${s.color}18` }
                    : { borderColor: '#bfc7cf50', color: '#40484e' }
                }
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: on ? s.color : '#bfc7cf' }}
                />
                {s.label}
              </button>
            );
          })}
        </div>
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
              active.map((k) => (d as unknown as Record<string, number>)[k] ?? 0),
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
                  {SERIES.filter((s) => active.includes(s.key)).map((s) => (
                    <LinePath
                      key={s.key}
                      data={data}
                      x={(d) => xScale(d.Year) ?? 0}
                      y={(d) => yScale((d as unknown as Record<string, number>)[s.key] ?? 0) ?? 0}
                      stroke={s.color}
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
                    label="Avg exposure days per person"
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
