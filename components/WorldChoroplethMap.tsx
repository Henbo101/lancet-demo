'use client';

import { useMemo, useState, useCallback } from 'react';
import { ParentSize } from '@visx/responsive';
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection } from 'geojson';
import { interpolateRgb } from 'd3-interpolate';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import topology from 'world-atlas/countries-110m.json';

countries.registerLocale(enLocale);

// world-atlas JSON is valid TopoJSON; topojson-client typings are strict vs bundle shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const land = feature(topology as any, (topology as any).objects.countries) as unknown as FeatureCollection;

function iso3FromFeatureId(id: string | number | undefined): string | undefined {
  if (id == null) return undefined;
  const s = String(id);
  try {
    return countries.numericToAlpha3(s);
  } catch {
    return undefined;
  }
}

export interface WorldChoroplethMapProps {
  /** ISO 3166-1 alpha-3 → numeric value (omit or NaN for no data) */
  iso3ToValue: Record<string, number>;
  formatValue: (v: number) => string;
  legendLabel: string;
  /** Tailwind-friendly: light panels vs dark strip */
  variant?: 'light' | 'dark';
}

const NO_DATA_LIGHT = '#e5e7eb';
const NO_DATA_DARK = 'rgba(255,255,255,0.12)';
const STROKE_LIGHT = 'rgba(255,255,255,0.85)';
const STROKE_DARK = 'rgba(6,78,59,0.35)';

export default function WorldChoroplethMap({
  iso3ToValue,
  formatValue,
  legendLabel,
  variant = 'light',
}: WorldChoroplethMapProps) {
  const { minV, maxV, color } = useMemo(() => {
    const vals = Object.values(iso3ToValue).filter((v) => Number.isFinite(v));
    const min = vals.length ? Math.min(...vals) : 0;
    const max = vals.length ? Math.max(...vals) : 1;
    const lo = variant === 'dark' ? '#064e3b' : '#ecfdf5';
    const hi = variant === 'dark' ? '#fef08a' : '#0d9488';
    const interp = interpolateRgb(lo, hi);
    const span = max - min || 1;
    return {
      minV: min,
      maxV: max,
      color: (v: number) => interp((v - min) / span),
    };
  }, [iso3ToValue, variant]);

  const noData = variant === 'dark' ? NO_DATA_DARK : NO_DATA_LIGHT;
  const stroke = variant === 'dark' ? STROKE_DARK : STROKE_LIGHT;

  const [hover, setHover] = useState<{
    name: string;
    value: number | null;
    left: number;
    top: number;
  } | null>(null);

  const onLeave = useCallback(() => setHover(null), []);

  return (
    <div className="relative h-[420px] w-full min-w-0">
      <ParentSize debounceTime={0} initialSize={{ width: 400, height: 420 }}>
        {({ width, height }) => {
          if (width < 10 || height < 10) return null;

          const projection = geoNaturalEarth1().fitSize([width, height], land as GeoPermissibleObjects);
          const path = geoPath(projection);

          return (
            <>
              <svg width={width} height={height} className="overflow-visible" onMouseLeave={onLeave}>
                <rect width={width} height={height} fill="transparent" />
                <g>
                  {land.features.map((f, i) => {
                    const iso3 = iso3FromFeatureId(f.id as string | number | undefined);
                    const raw = iso3 ? iso3ToValue[iso3] : undefined;
                    const has = raw != null && Number.isFinite(raw);
                    const fill = has ? color(raw as number) : noData;
                    const d = path(f as Feature);
                    if (!d) return null;
                    const name = (f.properties?.name as string) ?? iso3 ?? 'Unknown';
                    return (
                      <path
                        key={`${f.id ?? i}`}
                        d={d}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={0.35}
                        className="cursor-default"
                        onMouseEnter={(e) => {
                          setHover({
                            name,
                            value: has ? (raw as number) : null,
                            left: e.nativeEvent.offsetX,
                            top: e.nativeEvent.offsetY,
                          });
                        }}
                        onMouseMove={(e) => {
                          setHover((h) =>
                            h
                              ? {
                                  ...h,
                                  left: e.nativeEvent.offsetX,
                                  top: e.nativeEvent.offsetY,
                                }
                              : null,
                          );
                        }}
                      />
                    );
                  })}
                </g>
              </svg>

              {/* Legend */}
              <div
                className={`absolute bottom-2 left-2 right-2 flex flex-wrap items-center gap-3 text-[10px] font-label ${
                  variant === 'dark' ? 'text-white/80' : 'text-on-surface-variant'
                }`}
              >
                <span className="font-bold uppercase tracking-wider">{legendLabel}</span>
                <div className="flex items-center gap-1.5">
                  <span>{formatValue(minV)}</span>
                  <div
                    className="h-2 w-40 rounded-full border border-black/10"
                    style={{
                      background: `linear-gradient(to right, ${color(minV)}, ${color(maxV)})`,
                    }}
                  />
                  <span>{formatValue(maxV)}</span>
                </div>
                <span className={variant === 'dark' ? 'text-white/50' : 'text-slate-400'}>No data</span>
                <span
                  className="inline-block h-2 w-4 rounded-sm border border-black/10"
                  style={{ background: noData }}
                />
              </div>

              {hover && (
                <div
                  className={`pointer-events-none absolute z-10 max-w-[220px] rounded-lg px-3 py-2 text-xs shadow-lg ${
                    variant === 'dark'
                      ? 'border border-emerald-700/50 bg-emerald-950/95 text-white'
                      : 'border border-slate-200 bg-white text-slate-800'
                  }`}
                  style={{
                    left: Math.min(hover.left + 12, width - 200),
                    top: Math.min(hover.top + 12, height - 72),
                  }}
                >
                  <div className="font-headline font-bold">{hover.name}</div>
                  <div className="mt-0.5 opacity-90">
                    {hover.value != null ? formatValue(hover.value) : 'No data'}
                  </div>
                </div>
              )}
            </>
          );
        }}
      </ParentSize>
    </div>
  );
}
