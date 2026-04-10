'use client';

import { useMemo, useState, useEffect, useSyncExternalStore } from 'react';
import { countryData } from '@/lib/data/indicator111attr';
import WorldChoroplethMap from '@/components/WorldChoroplethMap';
import {
  getIndicator111AttrPlaybackYear,
  subscribeIndicator111AttrPlayback,
} from '@/lib/indicator111attrPlaybackBridge';

function nearestYear(target: number, years: number[]): number {
  if (years.length === 0) return target;
  return years.reduce((best, y) => (Math.abs(y - target) < Math.abs(best - target) ? y : best), years[0]);
}

export default function Chart111AttrMap() {
  const years = useMemo(() => {
    const y = new Set<number>();
    for (const d of countryData) y.add(d.Year as number);
    return [...y].sort((a, b) => a - b);
  }, []);

  const bridged = useSyncExternalStore(
    subscribeIndicator111AttrPlayback,
    getIndicator111AttrPlaybackYear,
    getIndicator111AttrPlaybackYear,
  );

  const [manualYear, setManualYear] = useState(() => years[years.length - 1] ?? 2024);

  useEffect(() => {
    if (bridged != null) setManualYear(nearestYear(bridged, years));
  }, [bridged, years]);

  const iso3ToValue = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of countryData) {
      if (d.Year !== manualYear) continue;
      const obs = d.Observed as number;
      const attr = d.Attributable_to_CC as number;
      if (obs <= 0) continue;
      const iso = d.ISO3 as string;
      if (!iso) continue;
      m[iso] = (attr / obs) * 100;
    }
    return m;
  }, [manualYear]);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4 mb-3">
        <label className="flex flex-col gap-1 text-[10px] font-headline font-bold uppercase tracking-wider text-on-surface-variant">
          Year
          <select
            className="rounded-xl border border-outline-variant/40 bg-white px-3 py-2 text-sm font-body text-teal-950 shadow-sm"
            value={manualYear}
            onChange={(e) => setManualYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-on-surface-variant max-w-xl pb-1">
          Map updates when you use year playback on the Trend view. You can still pick a year here; playback on Trend
          will update this selector while the indicator is visible.
        </p>
      </div>
      <WorldChoroplethMap
        iso3ToValue={iso3ToValue}
        formatValue={(v) => v.toFixed(1) + '%'}
        legendLabel="% Attributable"
        variant="light"
      />
    </div>
  );
}
