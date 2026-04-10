'use client';

import { useState, useMemo } from 'react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear, scaleBand } from '@visx/scale';
import { globalData, countryData } from '@/lib/data/indicator111attr';

const margin = { top: 20, right: 20, bottom: 40, left: 65 };
const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 1 });

export default function Chart111Attr() {
  const [selected, setSelected] = useState('Global');

  const countries = useMemo(
    () => [...new Set(countryData.map((d) => d.Country))].sort(),
    [],
  );

  const data = useMemo(() => {
    if (selected === 'Global') return [...globalData];
    return [...countryData.filter((d) => d.Country === selected)];
  }, [selected]);

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
            <option value="Global">Global</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#86cffe' }} />
          Counterfactual
        </span>
        <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#004e6f' }} />
          Attributable to CC
        </span>
      </div>

      <div className="h-[380px]">
        <ParentSize>
          {({ width, height }) => {
            if (width < 10 || height < 10) return null;
            const xMax = width - margin.left - margin.right;
            const yMax = height - margin.top - margin.bottom;

            const years = data.map((d) => d.Year);
            const xScale = scaleBand<number>({
              domain: years,
              range: [0, xMax],
              padding: 0.3,
            });

            const maxY = Math.max(
              ...data.map((d) => d.Counterfactual + d.Attributable_to_CC),
            );
            const yScale = scaleLinear<number>({
              domain: [0, maxY * 1.1],
              range: [yMax, 0],
              nice: true,
            });

            return (
              <svg width={width} height={height}>
                <Group left={margin.left} top={margin.top}>
                  <GridRows
                    scale={yScale}
                    width={xMax}
                    stroke="#bfc7cf"
                    strokeOpacity={0.3}
                  />
                  {data.map((d) => {
                    const x = xScale(d.Year) ?? 0;
                    const bw = xScale.bandwidth();
                    const cfH = yMax - (yScale(d.Counterfactual) ?? 0);
                    const attrH =
                      (yScale(d.Counterfactual) ?? 0) -
                      (yScale(d.Counterfactual + d.Attributable_to_CC) ?? 0);
                    return (
                      <g key={d.Year}>
                        <Bar
                          x={x}
                          y={yScale(d.Counterfactual) ?? 0}
                          width={bw}
                          height={cfH}
                          fill="#86cffe"
                          rx={2}
                        />
                        <Bar
                          x={x}
                          y={
                            yScale(d.Counterfactual + d.Attributable_to_CC) ?? 0
                          }
                          width={bw}
                          height={attrH}
                          fill="#004e6f"
                          rx={2}
                        />
                      </g>
                    );
                  })}
                  <AxisBottom
                    top={yMax}
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
                    label="Heatwave Days"
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
