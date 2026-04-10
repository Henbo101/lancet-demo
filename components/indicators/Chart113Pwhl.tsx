'use client';

import { useState, useMemo } from 'react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { AreaStack } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { globalData, whoData, hdiData } from '@/lib/data/indicator113pwhl';

const SECTORS: { raw: string; label: string; color: string }[] = [
  { raw: 'WHL200Serv', label: 'Services', color: '#004e6f' },
  { raw: 'WHL300Manuf', label: 'Manufacturing', color: '#B5334F' },
  { raw: 'WHL400sunAgr', label: 'Agriculture', color: '#2ECC71' },
  { raw: 'WHL400sunConstr', label: 'Construction', color: '#E67E22' },
];
const ALL_KEYS = SECTORS.map((s) => s.label);
const colorMap: Record<string, string> = Object.fromEntries(
  SECTORS.map((s) => [s.label, s.color]),
);
const margin = { top: 20, right: 30, bottom: 40, left: 90 };
const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 1 });

interface StackDatum {
  Year: number;
  Services: number;
  Manufacturing: number;
  Agriculture: number;
  Construction: number;
  [key: string]: number;
}

export default function Chart113PWHL() {
  const [selected, setSelected] = useState('global');
  const [activeSectors, setActiveSectors] = useState<string[]>(ALL_KEYS);

  const whoRegions = useMemo(() => [...new Set(whoData.map((d) => d['WHO region']))], []);
  const hdiLevels = useMemo(() => [...new Set(hdiData.map((d) => d['HDI level']))], []);

  const raw = useMemo(() => {
    if (selected === 'global') return [...globalData];
    const [type, value] = selected.split(':');
    if (type === 'who')
      return [...whoData.filter((d) => d['WHO region'] === value)];
    if (type === 'hdi')
      return [...hdiData.filter((d) => d['HDI level'] === value)];
    return [...globalData];
  }, [selected]);

  const data: StackDatum[] = useMemo(
    () =>
      raw.map((d: Record<string, unknown>) => ({
        Year: d.Year as number,
        Services: (d.WHL200Serv as number) / 1000,
        Manufacturing: (d.WHL300Manuf as number) / 1000,
        Agriculture: (d.WHL400sunAgr as number) / 1000,
        Construction: (d.WHL400sunConstr as number) / 1000,
      })),
    [raw],
  );

  const activeKeys = useMemo(
    () => ALL_KEYS.filter((k) => activeSectors.includes(k)),
    [activeSectors],
  );

  const toggle = (key: string) =>
    setActiveSectors((prev) =>
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
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SECTORS.map((s) => {
            const on = activeSectors.includes(s.label);
            return (
              <button
                key={s.label}
                onClick={() => toggle(s.label)}
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
            if (width < 10 || height < 10 || activeKeys.length === 0) return null;
            const xMax = width - margin.left - margin.right;
            const yMax = height - margin.top - margin.bottom;

            const xScale = scaleLinear<number>({
              domain: [
                Math.min(...data.map((d) => d.Year)),
                Math.max(...data.map((d) => d.Year)),
              ],
              range: [0, xMax],
            });

            const maxY = Math.max(
              ...data.map((d) =>
                activeKeys.reduce((sum, k) => sum + (d[k] ?? 0), 0),
              ),
            );
            const yScale = scaleLinear<number>({
              domain: [0, maxY * 1.1],
              range: [yMax, 0],
              nice: true,
            });

            return (
              <svg width={width} height={height}>
                <Group left={margin.left} top={margin.top}>
                  <GridRows scale={yScale} width={xMax} stroke="#bfc7cf" strokeOpacity={0.3} />
                  <AreaStack<StackDatum, string>
                    keys={activeKeys}
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
                          fillOpacity={0.7}
                          stroke={colorMap[stack.key]}
                          strokeWidth={0.5}
                        />
                      ))
                    }
                  </AreaStack>
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
                    label="Work hours lost (thousands)"
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
