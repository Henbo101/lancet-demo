'use client';

import { useMemo } from 'react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { LinePath, AreaClosed } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { globalData } from '@/lib/data/indicator114';

const COLOR = '#004e6f';
const margin = { top: 20, right: 20, bottom: 40, left: 60 };
const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 1 });

export default function Chart114() {
  const data = useMemo(() => [...globalData], []);

  return (
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

          const yScale = scaleLinear<number>({
            domain: [0, Math.max(...data.map((d) => d.Sleep_loss_percentage)) * 1.15],
            range: [yMax, 0],
            nice: true,
          });

          return (
            <svg width={width} height={height}>
              <Group left={margin.left} top={margin.top}>
                <GridRows scale={yScale} width={xMax} stroke="#bfc7cf" strokeOpacity={0.3} />
                <AreaClosed
                  data={data}
                  x={(d) => xScale(d.Year) ?? 0}
                  y={(d) => yScale(d.Sleep_loss_percentage) ?? 0}
                  yScale={yScale}
                  curve={curveMonotoneX}
                  fill={COLOR}
                  fillOpacity={0.12}
                />
                <LinePath
                  data={data}
                  x={(d) => xScale(d.Year) ?? 0}
                  y={(d) => yScale(d.Sleep_loss_percentage) ?? 0}
                  stroke={COLOR}
                  strokeWidth={2.5}
                  curve={curveMonotoneX}
                />
                <AxisBottom
                  top={yMax}
                  scale={xScale}
                  stroke="#bfc7cf"
                  tickStroke="#bfc7cf"
                  numTicks={data.length}
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
                  tickFormat={(v) => `${fmt(v as number)}%`}
                  label="% change in sleep hours lost vs 1986–2005 baseline"
                  labelProps={{
                    fill: '#40484e',
                    fontSize: 11,
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
  );
}
