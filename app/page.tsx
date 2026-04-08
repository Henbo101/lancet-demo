import ModuleHeader from '@/components/ModuleHeader';
import FilterBar from '@/components/FilterBar';
import ChartArea from '@/components/ChartArea';
import MetadataBlock from '@/components/MetadataBlock';
import ActionBar from '@/components/ActionBar';

export default function Home() {
  return (
    <>
      {/* ── Indicator header ── */}
      <div className="mt-8 mb-12">
        <h1 className="text-5xl xl:text-6xl font-bold font-headline text-primary mb-6 leading-none uppercase">
          1.1.1 Exposure of Vulnerable Populations to Heatwaves
        </h1>
        <div className="max-w-4xl space-y-4">
          <p className="text-xl text-on-surface font-body leading-relaxed">
            Exposure to extreme heat has a range of health consequences,
            including heat-related deaths, cardiovascular and respiratory
            diseases, kidney failure, mental health conditions, and adverse
            pregnancy outcomes.
          </p>
          <p className="text-sm text-on-surface-variant font-body">
            The physiological impact of heat is exacerbated by the intensity,
            duration, and frequency of heatwaves. Vulnerable
            populations—including infants, the elderly, and those with
            pre-existing medical conditions—face disproportionate risks as
            global average temperatures continue to rise.
          </p>
        </div>
      </div>

      {/* ── Dashboard bento grid ── */}
      <div className="grid grid-cols-12 gap-6 xl:gap-8 mb-16">
        {/* Main chart card */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-[2.5rem] p-6 xl:p-8 shadow-sm">
          <ModuleHeader />
          <FilterBar />
          <ChartArea />
        </div>

        {/* Right column — headline + metric */}
        <div className="col-span-12 lg:col-span-4 flex flex-col space-y-6 xl:space-y-8">
          {/* Headline finding */}
          <div className="flex-1 bg-tertiary text-white rounded-[2.5rem] p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-[10px] font-headline tracking-[0.2em] mb-6 opacity-80 uppercase">
                Key Finding
              </h3>
              <p className="text-xl xl:text-2xl font-headline leading-tight italic">
                &ldquo;In 2024, people older than 65&nbsp;years and infants
                younger than 1&#8209;year experienced, on average,{' '}
                <span className="text-on-tertiary-container font-bold not-italic">
                  304%
                </span>{' '}
                and{' '}
                <span className="text-on-tertiary-container font-bold not-italic">
                  389%
                </span>{' '}
                more days of heatwaves compared to the 1986–2005
                baseline.&rdquo;
              </p>
            </div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-tertiary-container rounded-full opacity-30 blur-3xl" />
          </div>

          {/* Key metric */}
          <div className="bg-surface-container-high rounded-[2.5rem] p-8">
            <h3 className="text-[10px] font-headline tracking-[0.2em] mb-4 text-on-surface-variant uppercase">
              Key Metric
            </h3>
            <div className="text-5xl font-headline font-bold text-teal-950 mb-2">
              167%
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Increase in heat-related deaths of people over 65 relative to the
              1990–2000 base period.
            </p>
          </div>
        </div>
      </div>

      {/* ── Metadata & actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-outline-variant/15 pt-12 mb-12">
        <MetadataBlock />
        <div className="bg-surface-container-low rounded-3xl p-8">
          <h4 className="text-sm font-headline font-bold text-primary tracking-widest mb-6 uppercase">
            Technical Metadata
          </h4>
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-headline text-slate-400 block mb-1 uppercase">
                Indicator Authors
              </span>
              <p className="text-xs font-bold text-on-surface">
                Dr. Andrew&nbsp;J Pershing, Dr. Marina Romanello, Dr. Claudia di
                Napoli, et&nbsp;al.
              </p>
            </div>
            <div>
              <span className="text-[10px] font-headline text-slate-400 block mb-1 uppercase">
                Data Sources
              </span>
              <ul className="text-xs space-y-1 font-medium text-teal-900">
                <li>• ERA5 Climate Reanalysis (ECMWF)</li>
                <li>• WorldPop Age/Sex Structure (2024 revision)</li>
                <li>• Lancet Countdown Attribution Framework</li>
              </ul>
            </div>
            <div>
              <span className="text-[10px] font-headline text-slate-400 block mb-3 uppercase">
                Data Download
              </span>
              <ActionBar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
