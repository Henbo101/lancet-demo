'use client';

import { useIndicatorStore, type ViewMode } from '@/store/useIndicatorStore';

const VIEWS: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'trend', label: 'Trend', icon: 'show_chart' },
  { id: 'map', label: 'Map', icon: 'public' },
  { id: 'table', label: 'Table', icon: 'table_rows' },
];

export default function ModuleHeader() {
  const { activeView, setActiveView, selectedRegion } = useIndicatorStore();

  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h2 className="text-2xl font-headline font-bold text-teal-950 uppercase tracking-tight">
          Heatwave Exposure Trend
        </h2>
        <p className="text-xs text-on-surface-variant font-label mt-1">
          {selectedRegion.toUpperCase()} — PERSON-DAYS OF HEATWAVE EXPOSURE
        </p>
      </div>

      {/* Format switcher pills */}
      <div className="flex space-x-1.5 shrink-0">
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
  );
}
