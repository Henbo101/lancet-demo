'use client';

import { useMemo } from 'react';
import { Mercator } from '@visx/geo';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import * as topojson from 'topojson-client';
import worldTopo from 'world-atlas/countries-110m.json';
import { useIndicatorStore } from '@/store/useIndicatorStore';
import { dataset } from '@/lib/dataset';
import { getSeriesKey } from '@/lib/data';
import { getRegionForCountry } from '@/lib/countryRegions';

const HEAT = [
  '#FFF7BC',
  '#FEE391',
  '#FEC44F',
  '#FE9929',
  '#EC7014',
  '#CC4C02',
  '#8C2D04',
];
const BG = '#eceef2';
const UNMATCHED = '#e0e3e6';

function pick(value: number, lo: number, hi: number): string {
  if (hi === lo) return HEAT[3];
  const t = Math.max(0, Math.min(1, (value - lo) / (hi - lo)));
  return HEAT[Math.min(HEAT.length - 1, Math.floor(t * HEAT.length))];
}

const margin = { top: 10, right: 20, bottom: 50, left: 20 };

const countries = (
  topojson.feature(
    worldTopo as any,
    (worldTopo as any).objects.countries,
  ) as any
).features as GeoJSON.Feature[];

function MapInner({ width, height }: { width: number; height: number }) {
  const { selectedRegion, selectedDataType, yearRange } = useIndicatorStore();

  const mapYear = yearRange[1];
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const regionValues = useMemo(() => {
    const m = new Map<string, number>();
    const key = getSeriesKey(selectedDataType, '65plus');
    for (const d of dataset) {
      if (d.year === mapYear) m.set(d.region, d[key] as number);
    }
    return m;
  }, [mapYear, selectedDataType]);

  const { lo, hi } = useMemo(() => {
    const vals = Array.from(regionValues.values());
    return { lo: Math.min(...vals), hi: Math.max(...vals) };
  }, [regionValues]);

  if (innerW <= 0 || innerH <= 0) return null;

  return (
    <div className="relative h-full">
      <svg width={width} height={height}>
        <rect width={width} height={height} fill={BG} rx={16} />

        <Group left={margin.left} top={margin.top}>
          <Mercator<GeoJSON.Feature>
            data={countries}
            fitSize={[[innerW, innerH], { type: 'Sphere' } as any]}
          >
            {(mercator) => (
              <g>
                {mercator.features.map(({ feature, path }, i) => {
                  const region = getRegionForCountry(
                    (feature as any).id ?? '',
                  );
                  const val = region ? regionValues.get(region) : undefined;
                  const fill =
                    val !== undefined ? pick(val, lo, hi) : UNMATCHED;

                  const dimmed =
                    selectedRegion !== 'Global' &&
                    selectedRegion !== 'SIDS' &&
                    region !== selectedRegion;

                  return (
                    <path
                      key={`c-${i}`}
                      d={path || ''}
                      fill={fill}
                      fillOpacity={dimmed ? 0.2 : 1}
                      stroke="white"
                      strokeWidth={0.5}
                      style={{ transition: 'fill-opacity 300ms ease' }}
                    />
                  );
                })}
              </g>
            )}
          </Mercator>
        </Group>
      </svg>

      {/* Colour legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-outline-variant/30 text-xs">
        <div className="font-semibold text-on-surface mb-1">
          Adults &gt;65 exposure
          <span className="font-normal text-on-surface-variant ml-1">
            ({selectedDataType === 'average' ? 'days / person' : 'M person-days'})
          </span>
        </div>
        <div className="flex items-center gap-px">
          {HEAT.map((c, i) => (
            <div
              key={i}
              className="w-5 h-2.5 first:rounded-l last:rounded-r"
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-on-surface-variant mt-0.5 tabular-nums">
          <span>{lo.toFixed(1)}</span>
          <span>{hi.toFixed(1)}</span>
        </div>
      </div>

      {/* Year badge */}
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-outline-variant/30">
        <span className="text-[10px] text-on-surface-variant font-headline uppercase tracking-widest">Year </span>
        <span className="text-sm font-bold text-teal-950 tabular-nums font-headline">
          {mapYear}
        </span>
      </div>

      {selectedRegion === 'SIDS' && (
        <div className="absolute top-3 left-3 bg-primary-fixed rounded-xl px-3 py-1.5 text-xs text-on-surface">
          SIDS nations span multiple regions — showing all.
        </div>
      )}
    </div>
  );
}

export default function MapView() {
  return (
    <ParentSize>
      {({ width, height }) => <MapInner width={width} height={height} />}
    </ParentSize>
  );
}
