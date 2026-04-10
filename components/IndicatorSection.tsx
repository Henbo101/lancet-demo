'use client';

import { useState, useCallback } from 'react';
import type { IndicatorMeta } from '@/lib/metadata';
import DataTable from './DataTable';

type ViewMode = 'trend' | 'table';

interface Props {
  meta: IndicatorMeta;
  downloadData: Record<string, unknown>[];
  downloadFilename: string;
  children: React.ReactNode;
}

function toCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const v = row[h];
        const s = v == null ? '' : String(v);
        return s.includes(',') || s.includes('"') || s.includes('\n')
          ? `"${s.replace(/"/g, '""')}"`
          : s;
      })
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

const VIEWS: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'trend', label: 'Trend', icon: 'show_chart' },
  { id: 'table', label: 'Table', icon: 'table_rows' },
];

export default function IndicatorSection({
  meta,
  downloadData,
  downloadFilename,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>('trend');

  const handleDownload = useCallback(() => {
    const csv = toCsv(downloadData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFilename;
    a.click();
    URL.revokeObjectURL(url);
  }, [downloadData, downloadFilename]);

  return (
    <section id={meta.id} className="scroll-mt-24 mb-20">
      {/* ── Section header ── */}
      <div className="flex items-start gap-4 mb-2">
        <span className="bg-primary text-white text-[11px] font-headline font-bold px-3 py-1.5 rounded-lg shrink-0 mt-1">
          {meta.number}
        </span>
        <div>
          <h2 className="text-2xl xl:text-3xl font-headline font-bold text-teal-950 uppercase tracking-tight leading-tight">
            {meta.title}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1 font-body">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* ── Bento grid ── */}
      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* Chart card */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-[2rem] p-5 xl:p-6 shadow-sm">
          {/* View switcher */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-1.5">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-full border transition-colors ${
                    activeView === v.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-on-surface-variant border-outline-variant/50 hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{v.icon}</span>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart or table */}
          {activeView === 'trend' ? children : <DataTable data={downloadData} />}
        </div>

        {/* Right column */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          {/* Key finding card */}
          <div className="bg-primary text-white rounded-[2rem] p-6 relative overflow-hidden flex-1">
            <h3 className="text-[10px] font-headline tracking-[0.2em] mb-4 opacity-70 uppercase">
              Key Finding
            </h3>
            <p className="text-[15px] font-headline leading-snug italic">
              &ldquo;{meta.keyFinding}&rdquo;
            </p>
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary-container rounded-full opacity-30 blur-3xl" />
          </div>

          {/* Technical details */}
          <div className="bg-surface-container-low rounded-[2rem] p-6">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-[10px] font-headline text-on-surface-variant uppercase tracking-widest">
                Technical Details
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-sm">
                {open ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {open && (
              <div className="mt-4 space-y-4 text-xs text-on-surface-variant leading-relaxed">
                <div>
                  <strong className="text-on-surface block mb-0.5">Authors</strong>
                  {meta.authors}
                </div>
                <div>
                  <strong className="text-on-surface block mb-0.5">Description</strong>
                  {meta.description}
                </div>
                <div>
                  <strong className="text-on-surface block mb-0.5">Caveats</strong>
                  <em>{meta.caveats}</em>
                </div>
                <div>
                  <strong className="text-on-surface block mb-0.5">Data Sources</strong>
                  <ul className="mt-1 space-y-0.5">
                    {meta.dataSources.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong className="text-on-surface block mb-0.5">Citation</strong>
                  {meta.citation}
                </div>
              </div>
            )}

            <button
              onClick={handleDownload}
              className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-[10px] font-bold border border-outline-variant/30 hover:bg-teal-50 transition-colors w-full justify-center"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>DOWNLOAD CSV</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
