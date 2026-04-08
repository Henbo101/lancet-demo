'use client';

import { useIndicatorStore, type ViewMode } from '@/store/useIndicatorStore';

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: 'map', label: 'Map' },
  { id: 'trend', label: 'Trend' },
  { id: 'table', label: 'Table' },
];

export default function ModuleHeader() {
  const { activeView, setActiveView } = useIndicatorStore();

  return (
    <div className="mb-8">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-3xl font-oswald text-lancet-dark uppercase font-semibold leading-tight">
          1.1.1 Exposure of Vulnerable Populations to Heatwaves
        </h1>

        {/* Format switcher pills */}
        <div className="flex rounded-full overflow-hidden border border-lancet-gray-border shrink-0">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`px-4 py-1.5 text-sm transition-colors ${
                activeView === v.id
                  ? 'bg-lancet-dark-blue text-white'
                  : 'bg-white text-lancet-dark hover:bg-gray-50'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key finding callout */}
      <div className="bg-lancet-teal-bg rounded-2xl p-6 mb-8 border-l-4 border-lancet-dark-blue">
        <h2 className="font-oswald text-sm uppercase tracking-widest text-lancet-dark-blue font-semibold mb-2">
          Key Finding
        </h2>
        <p className="text-[17px] leading-relaxed text-lancet-dark">
          In 2024, people older than 65&nbsp;years and infants younger than
          1&#8209;year experienced, on average,{' '}
          <span className="font-semibold text-lancet-red">304%</span> and{' '}
          <span className="font-semibold text-lancet-red">389%</span> more days
          of heatwaves compared to the 1986&ndash;2005 baseline, underscoring
          the accelerating health risks posed by rising temperatures to the most
          vulnerable populations worldwide.
        </p>
      </div>
    </div>
  );
}
