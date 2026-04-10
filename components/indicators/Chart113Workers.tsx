'use client';

import { useState, useMemo } from 'react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import {
  globalData,
  whoData,
  lcData,
  hdiData,
} from '@/lib/data/indicator113workers';

const COLORS = [
  '#004e6f',
  '#B5334F',
  '#259AD4',
  '#E67E22',
  '#2ECC71',
  '#9B59B6',
  '#1ABC9C',
  '#E74C3C',
];
const margin = { top: 20, right: 30, bottom: 40, left: 80 };
const fmt = (v: number) =>
  v.toLocaleString(undefined, { maximumFractionDigits: 1 });

type GeoLevel = 'Global' | 'WHO Region' | 'LC Region' | 'HDI Level';

interface LineData {
  name: string;
  points: { year: number; value: number }[];
}

export default function Chart113Workers() {
  const [geoLevel, setGeoLevel] = useState<GeoLevel>('Global');

  const lines: LineData[] = useMemo(() => {
    if (geoLevel === 'Global') {
      return [
        {
          name: 'Global',
          points: globalData.map((d) => ({
            year: d.Year,
            value: d['Outdoor workers'] / 1000,
          })),
        },
      ];
    }

    if (geoLevel === 'WHO Region') {
      const regions = [...new Set(whoData.map((d) => d['WHO Region']))];
      return regions.map((r) => ({
        name: r,
        points: whoData
          .filter((d) => d['WHO Region'] === r)
          .map((d) => ({ year: d.Year, value: d['Outdoor workers'] / 1000 })),
      }));
    }

    if (geoLevel === 'LC Region') {
      const regions = [
        ...new Set(lcData.map((d) => d['Lancet Countdown Region'])),
      ];
      return regions.map((r) => ({
        name: r,
        points: lcData
          .filter((d) => d['Lancet Countdown Region'] === r)
          .map((d) => ({ year: d.Year, value: d['Outdoor workers'] / 1000 })),
      }));
    }

    const levels = [...new Set(hdiData.map((d) => d['HDI level']))];
    return levels.map((l) => ({
      name: l,
      points: hdiData
        .filter((d) => d['HDI level'] === l)
        .map((d) => ({ year: d.Year, value: d['Outdoor workers'] / 1000 })),
    }));
  }, [geoLevel]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4 mb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-headline text-on-surface-variant uppercase tracking-widest">
            Level
          </span>
          <select
            value={geoLevel}
            onChange={(e) => setGeoLevel(e.target.value as GeoLevel)}
            className="px-3 py-1.5 text-sm border border-outline-variant rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="Global">Global</option>
            <option value="WHO Region">WHO Region</option>
            <option value="LC Region">LC Region</option>
            <option value="HDI Level">HDI Level</option>
          </select>
        </div>
      </div>

      {lines.length > 1 && (
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {lines.map((l, i) => (
            <span
              key={l.name}
              className="flex items-center gap-1.5 text-xs text-on-surface-variant"
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              {l.name}
            </span>
          ))}
        </div>
      )}

      <div className="h-[380px]">
        <ParentSize>
          {({ width, height }) => {
            if (width < 10 || height < 10) return null;
            const xMax = width - margin.left - margin.right;
            const yMax = height - margin.top - margin.bottom;

            const allPts = lines.flatMap((l) => l.points);
            const xScale = scaleLinear<number>({
              domain: [
                Math.min(...allPts.map((p) => p.year)),
                Math.max(...allPts.map((p) => p.year)),
              ],
              range: [0, xMax],
            });

            const yScale = scaleLinear<number>({
              domain: [0, Math.max(1, ...allPts.map((p) => p.value)) * 1.1],
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
                  {lines.map((l, i) => (
                    <LinePath
                      key={l.name}
                      data={l.points}
                      x={(d) => xScale(d.year) ?? 0}
                      y={(d) => yScale(d.value) ?? 0}
                      stroke={COLORS[i % COLORS.length]}
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
                    label="Outdoor workers (thousands)"
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
