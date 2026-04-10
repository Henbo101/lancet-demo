'use client';

import { useState, useCallback } from 'react';
import type { IndicatorMeta } from '@/lib/metadata';

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

export default function IndicatorSection({
  meta,
  downloadData,
  downloadFilename,
  children,
}: Props) {
  const [open, setOpen] = useState(false);

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
    <section id={meta.id} className="scroll-mt-24 mb-16">
      {/* Header: number badge + title */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="bg-primary text-white text-xs font-headline font-bold px-2.5 py-1 rounded-lg">
          {meta.number}
        </span>
        <h2 className="text-2xl font-headline font-bold text-teal-950 uppercase tracking-tight">
          {meta.title}
        </h2>
      </div>
      <p className="text-sm text-on-surface-variant mb-6 max-w-3xl">
        {meta.subtitle}
      </p>

      {/* Bento row: chart card (8 col) + key finding (4 col) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-[2rem] p-6 shadow-sm">
          {children}
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          {/* Key finding card */}
          <div className="bg-primary text-white rounded-[2rem] p-6 relative overflow-hidden flex-1">
            <h3 className="text-[10px] font-headline tracking-[0.2em] mb-4 opacity-80 uppercase">
              Key Finding
            </h3>
            <p className="text-base font-headline leading-snug italic">
              &ldquo;{meta.keyFinding}&rdquo;
            </p>
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary-container rounded-full opacity-30 blur-3xl" />
          </div>

          {/* Metadata toggle */}
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
              <div className="mt-4 space-y-4 text-xs text-on-surface-variant">
                <div>
                  <strong className="text-on-surface">Authors:</strong>{' '}
                  {meta.authors}
                </div>
                <div>
                  <strong className="text-on-surface">Description:</strong>{' '}
                  {meta.description}
                </div>
                <div>
                  <strong className="text-on-surface">Caveats:</strong>{' '}
                  <em>{meta.caveats}</em>
                </div>
                <div>
                  <strong className="text-on-surface">Data Sources:</strong>
                  <ul className="mt-1">
                    {meta.dataSources.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong className="text-on-surface">Citation:</strong>{' '}
                  {meta.citation}
                </div>
              </div>
            )}

            {/* Download button (always visible) */}
            <button
              onClick={handleDownload}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-[10px] font-bold border border-outline-variant/30 hover:bg-teal-50 transition-colors w-full justify-center"
            >
              <span className="material-symbols-outlined text-sm">
                download
              </span>
              <span>DOWNLOAD CSV</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
