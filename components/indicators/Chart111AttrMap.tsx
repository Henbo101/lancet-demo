'use client';

import { useMemo, useState } from 'react';
import { countryData } from '@/lib/data/indicator111attr';
import WorldChoroplethMap from '@/components/WorldChoroplethMap';

export default function Chart111AttrMap() {
  const years = useMemo(() => {
    const y = new Set<number>();
    for (const d of countryData) y.add(d.Year as number);
    return [...y].sort((a, b) => a - b);
  }, []);

  const [year, setYear] = useState(() => years[years.length - 1] ?? 2024);

  const iso3ToValue = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of countryData) {
      if (d.Year !== year) continue;
      const obs = d.Observed as number;
      const attr = d.Attributable_to_CC as number;
      if (obs <= 0) continue;
      const iso = d.ISO3 as string;
      if (!iso) continue;
      m[iso] = (attr / obs) * 100;
    }
    return m;
  }, [year]);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4 mb-3">
        <label className="flex flex-col gap-1 text-[10px] font-headline font-bold uppercase tracking-wider text-on-surface-variant">
          Year
          <select
            className="rounded-xl border border-outline-variant/40 bg-white px-3 py-2 text-sm font-body text-teal-950 shadow-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-on-surface-variant max-w-xl pb-1">
          Share of observed heatwave days attributable to climate change (matches &ldquo;% Attributable&rdquo; in Trend).
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
