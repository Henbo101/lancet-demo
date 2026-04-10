'use client';

import { useMemo, useCallback } from 'react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear, scaleBand } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { globalData } from '@/lib/data/indicator114';
import { useChartHover, Crosshair, TooltipCard, type TooltipPayload } from '@/components/ChartTooltip';
import { useChartTheme } from '@/components/ChartThemeContext';

const margin = { top: 28, right: 30, bottom: 48, left: 100 };
const fmt = (v: number) => v.toFixed(2) + '%';

export default function Chart114() {
  const { dark } = useChartTheme();
  const data = useMemo(() => [...globalData], []);
  const years = useMemo(() => data.map((d) => d.Year), [data]);
  return (
    <div className="h-[420px] relative">
      <ParentSize>
        {({ width, height }) => {
          if (width < 10 || height < 10) return null;
          const innerW = width - margin.left - margin.right;
          const innerH = height - margin.top - margin.bottom;

          const xScale = scaleBand<number>({ domain: years, range: [0, innerW], padding: 0.3 });

          const maxV = Math.max(...data.map((d) => d.Sleep_loss_percentage));
          const yScale = scaleLinear<number>({ domain: [0, maxV * 1.25], range: [innerH, 0], nice: true });

          const buildTooltip = (year: number): TooltipPayload => {
            const d = data.find((r) => r.Year === year);
            if (!d) return { year, rows: [] };
            const first = data[0];
            const delta = d.Sleep_loss_percentage - first.Sleep_loss_percentage;
            return {
              year,
              rows: [
                { color: '#004e6f', label: 'Sleep hours lost (% change)', value: fmt(d.Sleep_loss_percentage) },
              ],
              supplementary: [
                { label: `Change vs ${first.Year} (first year in series)`, value: (delta >= 0 ? '+' : '') + delta.toFixed(2) + ' pp' },
              ],
            };
          };

          return (
            <ChartInner
              width={width}
              height={height}
              innerW={innerW}
              innerH={innerH}
              xScale={xScale}
              yScale={yScale}
              data={data}
              years={years}
              buildTooltip={buildTooltip}
              dark={dark}
            />
          );
        }}
      </ParentSize>
    </div>
  );
}

interface InnerProps {
  width: number;
  height: number;
  innerW: number;
  innerH: number;
  xScale: ReturnType<typeof scaleBand<number>>;
  yScale: ReturnType<typeof scaleLinear<number>>;
  data: readonly { Year: number; Sleep_loss_percentage: number }[];
  years: number[];
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
  data,
  years,
  buildTooltip,
  dark,
}: InnerProps) {
  const stableBuild = useCallback(buildTooltip, [buildTooltip]);
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, hoveredYear, handleMouseMove, handleMouseLeave, getXForYear } =
    useChartHover({ xScale, years, margin, buildTooltip: stableBuild });

  const dotPositions = useMemo(() => {
    if (hoveredYear == null) return [];
    const d = data.find((r) => r.Year === hoveredYear);
    if (!d) return [];
    return [{ x: getXForYear(hoveredYear), y: yScale(d.Sleep_loss_percentage), color: '#004e6f' }];
  }, [hoveredYear, data, getXForYear, yScale]);

  return (
    <>
      <svg width={width} height={height} className="overflow-visible">
        <Group left={margin.left} top={margin.top}>
          <GridRows scale={yScale} width={innerW} stroke="#bfc7cf" strokeOpacity={0.3} />

          <LinePath
            data={[...data]}
            x={(d) => (xScale(d.Year) ?? 0) + xScale.bandwidth() / 2}
            y={(d) => yScale(d.Sleep_loss_percentage) ?? 0}
            stroke="#004e6f"
            strokeWidth={2.5}
            curve={curveMonotoneX}
          />
          {data.map((d) => (
            <circle
              key={d.Year}
              cx={(xScale(d.Year) ?? 0) + xScale.bandwidth() / 2}
              cy={yScale(d.Sleep_loss_percentage) ?? 0}
              r={4}
              fill="#004e6f"
              stroke="#fff"
              strokeWidth={2}
            />
          ))}

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
            stroke="#bfc7cf"
            tickStroke="#bfc7cf"
            labelOffset={65}
            tickLabelProps={() => ({
              fill: '#40484e',
              fontSize: 11,
              fontFamily: "'Open Sans', sans-serif",
              textAnchor: 'end' as const,
              dy: '0.33em',
              dx: -4,
            })}
            tickFormat={(v) => `${(v as number).toFixed(1)}%`}
            label="% change in sleep hours lost (indexed to first year)"
            labelProps={{
              fill: '#004e6f',
              fontSize: 11,
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
