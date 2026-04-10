'use client';

import { useMemo, useState } from 'react';

type SortDir = 'asc' | 'desc';

interface Props {
  data: Record<string, unknown>[];
}

export default function DataTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const headers = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number')
        return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av ?? '').localeCompare(String(bv ?? ''))
        : String(bv ?? '').localeCompare(String(av ?? ''));
    });
  }, [data, sortKey, sortDir]);

  const toggle = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const arrow = (key: string) =>
    sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕';

  if (data.length === 0) return <p className="text-sm text-on-surface-variant p-4">No data available.</p>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 max-h-[420px] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-surface-container-low border-b border-outline-variant/30">
            {headers.map((h) => (
              <th
                key={h}
                onClick={() => toggle(h)}
                className="px-3 py-2.5 text-left font-semibold text-on-surface cursor-pointer hover:bg-surface-container transition-colors select-none whitespace-nowrap"
              >
                <span className="text-[10px] uppercase tracking-wider font-headline">
                  {h.replace(/_/g, ' ')}
                  <span className="text-on-surface-variant font-normal">{arrow(h)}</span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-outline-variant/10 hover:bg-primary-fixed/20 transition-colors ${
                i % 2 === 0 ? 'bg-white' : 'bg-surface-container-lowest'
              }`}
            >
              {headers.map((h) => {
                const v = row[h];
                return (
                  <td key={h} className="px-3 py-2 tabular-nums text-on-surface whitespace-nowrap">
                    {typeof v === 'number'
                      ? v.toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : v == null
                      ? '—'
                      : String(v)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-2 text-[10px] text-on-surface-variant bg-surface-container-low border-t border-outline-variant/30 uppercase tracking-widest font-headline sticky bottom-0">
        {sorted.length} rows
      </div>
    </div>
  );
}
