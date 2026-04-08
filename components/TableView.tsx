'use client';

import { useMemo, useState } from 'react';
import { useIndicatorStore } from '@/store/useIndicatorStore';
import { filterData, type DataPoint } from '@/lib/data';
import { dataset } from '@/lib/dataset';

type SortKey = keyof DataPoint;
type SortDir = 'asc' | 'desc';

export default function TableView() {
  const { selectedRegion, selectedDataType, yearRange } = useIndicatorStore();

  const [sortKey, setSortKey] = useState<SortKey>('year');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const filtered = useMemo(
    () => filterData(dataset, selectedRegion, yearRange),
    [selectedRegion, yearRange],
  );

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number')
        return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortKey, sortDir]);

  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const cols: { key: SortKey; label: string; unit: string }[] = [
    { key: 'year', label: 'Year', unit: '' },
    ...(selectedDataType === 'average'
      ? [
          {
            key: 'exposure_average_infants' as SortKey,
            label: 'Infants <1',
            unit: 'days / person',
          },
          {
            key: 'exposure_average_65' as SortKey,
            label: 'Adults >65',
            unit: 'days / person',
          },
        ]
      : [
          {
            key: 'exposure_total_infants' as SortKey,
            label: 'Infants <1',
            unit: 'M person-days',
          },
          {
            key: 'exposure_total_65' as SortKey,
            label: 'Adults >65',
            unit: 'M person-days',
          },
        ]),
  ];

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕';

  return (
    <div className="overflow-x-auto rounded-lg border border-lancet-gray-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-lancet-gray-100 border-b border-lancet-gray-border">
            {cols.map((c) => (
              <th
                key={c.key}
                onClick={() => toggle(c.key)}
                className="px-4 py-3 text-left font-semibold text-lancet-dark cursor-pointer hover:bg-gray-200 transition-colors select-none"
              >
                <div className="flex flex-col">
                  <span>
                    {c.label}
                    <span className="text-lancet-gray-600 font-normal">
                      {arrow(c.key)}
                    </span>
                  </span>
                  {c.unit && (
                    <span className="text-[11px] font-normal text-lancet-gray-600">
                      {c.unit}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sorted.map((d, i) => (
            <tr
              key={d.year}
              className={`border-b border-gray-100 hover:bg-lancet-teal-bg/30 transition-colors ${
                i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
              }`}
            >
              {cols.map((c) => {
                const v = d[c.key];
                return (
                  <td
                    key={c.key}
                    className="px-4 py-2.5 tabular-nums text-lancet-dark"
                  >
                    {typeof v === 'number'
                      ? v.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="px-4 py-2 text-xs text-lancet-gray-600 bg-lancet-gray-100 border-t border-lancet-gray-border">
        {sorted.length} rows · {selectedRegion} ·{' '}
        {yearRange[0]}–{yearRange[1]}
      </div>
    </div>
  );
}
