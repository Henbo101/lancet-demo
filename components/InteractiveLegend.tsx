'use client';

import { useIndicatorStore } from '@/store/useIndicatorStore';

const SERIES = [
  { id: '65plus', label: 'Adults >65', color: '#B5334F' },
  { id: 'infants', label: 'Infants <1', color: '#259AD4' },
] as const;

export default function InteractiveLegend() {
  const { selectedDemographics, toggleDemographic } = useIndicatorStore();

  return (
    <div className="flex items-center gap-3 mb-4">
      {SERIES.map((s) => {
        const active = selectedDemographics.includes(s.id);
        return (
          <button
            key={s.id}
            onClick={() => toggleDemographic(s.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-all ${
              active
                ? 'border-current shadow-sm'
                : 'border-outline-variant opacity-50'
            }`}
            style={{ color: active ? s.color : '#999' }}
          >
            <span
              className="w-3 h-3 rounded-full shrink-0 transition-colors"
              style={{ backgroundColor: active ? s.color : '#ccc' }}
            />
            {s.label}
          </button>
        );
      })}
      <span className="text-[10px] text-on-surface-variant ml-2 tracking-wide uppercase">
        Click to toggle
      </span>
    </div>
  );
}
