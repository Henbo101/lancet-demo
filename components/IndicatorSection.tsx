'use client';

import { useState, useCallback, useMemo } from 'react';
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

type ViewMode = 'trend' | 'table' | 'map';

interface Props {
  meta: IndicatorMeta;
  downloadData: Record<string, unknown>[];
  downloadFilename: string;
  children: React.ReactNode;
  /** When set, a Map tab is shown (choropleth or other geography). Omit when data is not spatial. */
  mapView?: React.ReactNode;
  variant?: SectionVariant;
  /** Set false when a parent page heading already shows the indicator number (e.g. grouped 1.1.1). */
  showNumberBadge?: boolean;
  /** Set false when a parent `SubsectionHead` already shows the same title as `meta.title`. */
  showSectionTitle?: boolean;
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

const BASE_VIEWS: { id: Exclude<ViewMode, 'map'>; label: string; icon: string }[] = [
  { id: 'trend', label: 'Trend', icon: 'show_chart' },
  { id: 'table', label: 'Table', icon: 'table_rows' },
];

export default function IndicatorSection({
  meta,
  downloadData,
  downloadFilename,
  children,
  mapView,
  variant = 'immersive',
  showNumberBadge = true,
  showSectionTitle = true,
}: Props) {
  const [activeView, setActiveView] = useState<ViewMode>('trend');

  const viewTabs = useMemo(() => {
    const tabs: { id: ViewMode; label: string; icon: string }[] = [...BASE_VIEWS];
    if (mapView) tabs.push({ id: 'map', label: 'Map', icon: 'map' });
    return tabs;
  }, [mapView]);

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
    <div className={`flex items-start mb-2 ${showNumberBadge ? 'gap-3' : ''}`}>
      {showNumberBadge ? badge : null}
      <div>
        {showSectionTitle && (
          <h2
            className={`text-2xl xl:text-3xl font-headline font-bold uppercase tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-teal-950'
            }`}
          >
            {meta.title}
          </h2>
        )}
        <p
          className={`text-sm font-body ${showSectionTitle ? 'mt-1' : ''} ${
            isDark ? 'text-white/60' : 'text-on-surface-variant'
          }`}
        >
          {meta.subtitle}
        </p>
      </div>
    </div>
  );

  const viewSwitcher = (
    <div className="flex items-center justify-between mb-4">
      <div className="flex space-x-1.5">
        {viewTabs.map((v) => (
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
      {activeView === 'trend' && children}
      {activeView === 'table' && <DataTable data={downloadData} />}
      {activeView === 'map' && mapView}
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

  const metaLabel = `text-[10px] font-headline font-semibold uppercase tracking-[0.18em] ${
    isDark ? 'text-white/40' : 'text-on-surface-variant/80'
  }`;
  const metaBody = `text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-white/65' : 'text-on-surface-variant'}`;
  const metaBodyProse = `${metaBody} ${isDark ? 'text-white/70' : 'text-on-surface'}`;

  const technicalDetails = (
    <div
      className={`rounded-xl border px-4 py-4 sm:px-5 sm:py-5 ${
        isDark
          ? 'border-white/10 bg-white/[0.04] shadow-none'
          : 'border-outline-variant/25 bg-white/70 shadow-sm shadow-slate-200/20'
      }`}
    >
      <div
        className={`flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between ${
          isDark ? 'border-white/10' : 'border-outline-variant/15'
        }`}
      >
        <h3 className={`text-[10px] font-headline font-bold uppercase tracking-[0.2em] ${isDark ? 'text-white/45' : 'text-on-surface-variant'}`}>
          Methodology &amp; data
        </h3>
        <button
          type="button"
          onClick={handleDownload}
          className={`inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors sm:w-auto ${
            isDark
              ? 'border-white/15 text-white/85 hover:bg-white/10'
              : 'border-outline-variant/40 text-teal-900 hover:bg-teal-50/80'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          Data (CSV)
        </button>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-0">
        <div className="space-y-4">
          <div>
            <p className={`${metaLabel} mb-1.5`}>Description</p>
            <p className={metaBodyProse}>{meta.description}</p>
          </div>
          <div>
            <p className={`${metaLabel} mb-1.5`}>Caveats</p>
            <p className={`${metaBody} italic`}>{meta.caveats}</p>
          </div>
        </div>

        <div className={`space-y-4 lg:border-l lg:pl-8 ${isDark ? 'border-white/10' : 'border-outline-variant/20'}`}>
          <div>
            <p className={`${metaLabel} mb-1.5`}>Authors</p>
            <p className={metaBodyProse}>{meta.authors}</p>
          </div>
          <div>
            <p className={`${metaLabel} mb-1.5`}>Data sources</p>
            <ul className={`${metaBody} list-none space-y-1.5 pl-0`}>
              {meta.dataSources.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${isDark ? 'bg-white/35' : 'bg-primary/40'}`} />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`border-t pt-4 ${isDark ? 'border-white/10' : 'border-outline-variant/20'}`}>
            <p className={`${metaLabel} mb-1.5`}>Citation</p>
            <p className={`${metaBody} text-[10px] sm:text-[11px] leading-snug`}>{meta.citation}</p>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── LAYOUT VARIANTS ── */

  if (variant === 'immersive') {
    return (
      <section id={meta.id} className="scroll-mt-28 mb-20">
        {header}
        <div className="grid grid-cols-12 gap-6 mt-6">
          <div className="col-span-12 min-w-0 bg-surface-container-lowest rounded-[2rem] p-5 xl:p-6 shadow-sm">
            {viewSwitcher}
            {chartContent}
          </div>
          <div className="col-span-12 lg:col-span-4">{keyFinding}</div>
          <div className="col-span-12 lg:col-span-8">{technicalDetails}</div>
        </div>
      </section>
    );
  }

  if (variant === 'splitLeft') {
    return (
      <section id={meta.id} className="scroll-mt-28 mb-20">
        {header}
        <div className="grid grid-cols-12 gap-6 mt-6">
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {keyFinding}
            {technicalDetails}
          </div>
          <div className="col-span-12 lg:col-span-8 min-w-0 bg-surface-container-lowest rounded-[2rem] p-5 xl:p-6 shadow-sm">
            {viewSwitcher}
            {chartContent}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'splitRight') {
    return (
      <section id={meta.id} className="scroll-mt-28 mb-20">
        {header}
        <div className="grid grid-cols-12 gap-6 mt-6">
          <div className="col-span-12 lg:col-span-8 min-w-0 bg-surface-container-lowest rounded-[2rem] p-5 xl:p-6 shadow-sm">
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
    /* Strip aligns with main column (same horizontal rhythm as other sections). Avoid w-screen +
       calc(50%-50vw) here: main is offset by lg:ml-72, so viewport bleed misaligns left/right. */
    return (
      <section
        id={meta.id}
        className="lc-dark-strip scroll-mt-28 mb-20 rounded-none border-y border-emerald-800/50 bg-emerald-950 py-12 text-white shadow-none"
      >
        {header}
        <div className="grid grid-cols-12 gap-6 mt-6">
          <div className="col-span-12 lg:col-span-8 min-w-0 bg-white/5 rounded-[2rem] p-5 xl:p-6 backdrop-blur-sm">
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

  if (variant === 'dashboard') {
    return (
      <section id={meta.id} className="scroll-mt-28 mb-20">
        {header}
        <div className="grid grid-cols-12 gap-4 mt-6">
          <div className="col-span-12 lg:col-span-9 min-w-0 bg-surface-container-lowest rounded-[2rem] p-5 xl:p-6 shadow-sm">
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
      <section id={meta.id} className="scroll-mt-28 mb-20">
        {header}
        <div className="mt-6">
          <div className="min-w-0 bg-surface-container-lowest rounded-[2rem] p-5 xl:p-6 shadow-sm mb-6">
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
    <section id={meta.id} className="scroll-mt-28 mb-20">
      {header}
      <div className="mt-6 bg-surface-container-low rounded-[2.5rem] p-6 xl:p-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
            {keyFinding}
            {technicalDetails}
          </div>
          <div className="col-span-12 lg:col-span-7 min-w-0 bg-white rounded-[2rem] p-5 xl:p-6 shadow-sm">
            {viewSwitcher}
            {chartContent}
          </div>
        </div>
      </div>
    </section>
  );
}
