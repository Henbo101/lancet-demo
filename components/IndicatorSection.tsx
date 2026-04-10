'use client';

import { useState, useCallback } from 'react';
import type { IndicatorMeta } from '@/lib/metadata';
import DataTable from './DataTable';
import { ChartThemeProvider } from './ChartThemeContext';

export type SectionVariant =
  | 'immersive'
  | 'splitLeft'
  | 'splitRight'
  | 'dark'
  | 'dashboard'
  | 'bignum'
  | 'conclusion';

type ViewMode = 'trend' | 'table';

interface Props {
  meta: IndicatorMeta;
  downloadData: Record<string, unknown>[];
  downloadFilename: string;
  children: React.ReactNode;
  variant?: SectionVariant;
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
  variant = 'immersive',
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

  const isDark = variant === 'dark';

  const badge = (
    <span
      className={`text-xs font-headline font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shrink-0 ${
        isDark ? 'bg-white/10 text-white' : 'bg-primary/10 text-primary'
      }`}
    >
      {meta.number}
    </span>
  );

  const header = (
    <div className="flex items-start gap-3 mb-2">
      {badge}
      <div>
        <h2
          className={`text-2xl xl:text-3xl font-headline font-bold uppercase tracking-tight leading-tight ${
            isDark ? 'text-white' : 'text-teal-950'
          }`}
        >
          {meta.title}
        </h2>
        <p className={`text-sm mt-1 font-body ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>
          {meta.subtitle}
        </p>
      </div>
    </div>
  );

  const viewSwitcher = (
    <div className="flex items-center justify-between mb-4">
      <div className="flex space-x-1.5">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-full border transition-colors ${
              activeView === v.id
                ? isDark
                  ? 'bg-white text-emerald-950 border-white'
                  : 'bg-primary text-white border-primary'
                : isDark
                  ? 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'
                  : 'bg-white text-on-surface-variant border-outline-variant/50 hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{v.icon}</span>
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );

  const chartContent = (
    <ChartThemeProvider dark={isDark}>
      {activeView === 'trend' ? children : <DataTable data={downloadData} />}
    </ChartThemeProvider>
  );

  const keyFinding = (
    <div
      className={`rounded-[2rem] p-6 relative overflow-hidden ${
        isDark ? 'bg-white/10' : 'bg-primary text-white'
      }`}
    >
      <h3 className="text-[10px] font-headline tracking-[0.2em] mb-4 opacity-70 uppercase">
        Key Finding
      </h3>
      <p className={`text-[15px] font-headline leading-snug italic ${isDark ? 'text-white' : ''}`}>
        &ldquo;{meta.keyFinding}&rdquo;
      </p>
      <div
        className={`absolute -bottom-16 -right-16 w-48 h-48 rounded-full opacity-30 blur-3xl ${
          isDark ? 'bg-emerald-400' : 'bg-primary-container'
        }`}
      />
    </div>
  );

  const technicalDetails = (
    <div className={`rounded-[2rem] p-6 ${isDark ? 'bg-white/5' : 'bg-surface-container-low'}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className={`text-[10px] font-headline uppercase tracking-widest ${isDark ? 'text-white/50' : 'text-on-surface-variant'}`}>
          Technical Details
        </span>
        <span className={`material-symbols-outlined text-sm ${isDark ? 'text-white/50' : 'text-on-surface-variant'}`}>
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open && (
        <div className={`mt-4 space-y-4 text-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-on-surface-variant'}`}>
          <div><strong className={isDark ? 'text-white' : 'text-on-surface'}>Authors</strong><br />{meta.authors}</div>
          <div><strong className={isDark ? 'text-white' : 'text-on-surface'}>Description</strong><br />{meta.description}</div>
          <div><strong className={isDark ? 'text-white' : 'text-on-surface'}>Caveats</strong><br /><em>{meta.caveats}</em></div>
          <div>
            <strong className={isDark ? 'text-white' : 'text-on-surface'}>Data Sources</strong>
            <ul className="mt-1 space-y-0.5">
              {meta.dataSources.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
          <div><strong className={isDark ? 'text-white' : 'text-on-surface'}>Citation</strong><br />{meta.citation}</div>
        </div>
      )}

      <button
        onClick={handleDownload}
        className={`mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold border w-full justify-center transition-colors ${
          isDark
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            : 'bg-white border-outline-variant/30 hover:bg-teal-50'
        }`}
      >
        <span className="material-symbols-outlined text-sm">download</span>
        <span>DOWNLOAD CSV</span>
      </button>
    </div>
  );

  /* ── LAYOUT VARIANTS ── */

  if (variant === 'immersive') {
    return (
      <section id={meta.id} className="scroll-mt-24 mb-20">
        {header}
        <div className="grid grid-cols-12 gap-6 mt-6">
          <div className="col-span-12 bg-surface-container-lowest rounded-[2rem] p-5 xl:p-6 shadow-sm">
            {viewSwitcher}
            {chartContent}
          </div>
          <div className="col-span-12 lg:col-span-6">{keyFinding}</div>
          <div className="col-span-12 lg:col-span-6">{technicalDetails}</div>
        </div>
      </section>
    );
  }

  if (variant === 'splitLeft') {
    return (
      <section id={meta.id} className="scroll-mt-24 mb-20">
        {header}
        <div className="grid grid-cols-12 gap-6 mt-6">
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {keyFinding}
            {technicalDetails}
          </div>
          <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-[2rem] p-5 xl:p-6 shadow-sm">
            {viewSwitcher}
            {chartContent}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'splitRight') {
    return (
      <section id={meta.id} className="scroll-mt-24 mb-20">
        {header}
        <div className="grid grid-cols-12 gap-6 mt-6">
          <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-[2rem] p-5 xl:p-6 shadow-sm">
            {viewSwitcher}
            {chartContent}
          </div>
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {keyFinding}
            {technicalDetails}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'dark') {
    /* Full-viewport-width strip (no rounded “card”); inner column aligns with main via lg:ml-72 */
    return (
      <section
        id={meta.id}
        className="lc-dark-strip scroll-mt-24 mb-20 w-screen max-w-[100vw] ml-[calc(50%-50vw)] rounded-none border-y border-emerald-800/50 bg-emerald-950 py-12 text-white shadow-none"
      >
        <div className="px-4 sm:px-6 lg:ml-72 lg:pl-0 lg:pr-8 xl:pr-12">
          {header}
          <div className="grid grid-cols-12 gap-6 mt-6">
            <div className="col-span-12 lg:col-span-8 bg-white/5 rounded-[2rem] p-5 xl:p-6 backdrop-blur-sm">
              {viewSwitcher}
              {chartContent}
            </div>
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
              {keyFinding}
              {technicalDetails}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'dashboard') {
    return (
      <section id={meta.id} className="scroll-mt-24 mb-20">
        {header}
        <div className="grid grid-cols-12 gap-4 mt-6">
          <div className="col-span-12 lg:col-span-9 bg-surface-container-lowest rounded-[2rem] p-5 xl:p-6 shadow-sm">
            {viewSwitcher}
            {chartContent}
          </div>
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            {keyFinding}
            {technicalDetails}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'bignum') {
    return (
      <section id={meta.id} className="scroll-mt-24 mb-20">
        {header}
        <div className="mt-6">
          <div className="bg-surface-container-lowest rounded-[2rem] p-5 xl:p-6 shadow-sm mb-6">
            {viewSwitcher}
            {chartContent}
          </div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-7">{keyFinding}</div>
            <div className="col-span-12 lg:col-span-5">{technicalDetails}</div>
          </div>
        </div>
      </section>
    );
  }

  // conclusion (default fallback)
  return (
    <section id={meta.id} className="scroll-mt-24 mb-20">
      {header}
      <div className="mt-6 bg-surface-container-low rounded-[2.5rem] p-6 xl:p-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
            {keyFinding}
            {technicalDetails}
          </div>
          <div className="col-span-12 lg:col-span-7 bg-white rounded-[2rem] p-5 xl:p-6 shadow-sm">
            {viewSwitcher}
            {chartContent}
          </div>
        </div>
      </div>
    </section>
  );
}
