import IndicatorSection from '@/components/IndicatorSection';
import Chart111Attr from '@/components/indicators/Chart111Attr';
import Chart111AttrMap from '@/components/indicators/Chart111AttrMap';
import Chart111Vuln from '@/components/indicators/Chart111Vuln';
import Chart112 from '@/components/indicators/Chart112';
import { indicators } from '@/lib/metadata';
import { globalData as data111attr } from '@/lib/data/indicator111attr';
import { globalData as data111vuln } from '@/lib/data/indicator111vuln';
import { globalData as data112 } from '@/lib/data/indicator112';

function SubsectionHead({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-6 w-full max-w-none border-b-2 border-outline-variant/55 pb-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="inline-flex shrink-0 bg-primary/10 text-primary text-xs font-headline font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          {number}
        </span>
        <h2 className="font-headline text-base sm:text-lg font-bold text-teal-950 tracking-tight uppercase min-w-0 leading-snug">
          {title}
        </h2>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* ── Hero section ── */}
      <section id="hero" className="mt-8 mb-16 scroll-mt-28 w-full max-w-none">
        <div className="bg-surface-container-low rounded-[2.5rem] p-8 xl:p-12 w-full max-w-none">
          <div className="inline-block bg-primary/10 text-primary text-xs font-headline font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
            Indicator 1.1
          </div>

          <h1 className="w-full max-w-none font-headline font-bold uppercase leading-[0.95] tracking-tight mb-8 text-4xl min-[480px]:text-5xl sm:text-6xl md:text-7xl xl:text-8xl">
            <span className="text-primary">Heat &amp; </span>
            <span className="text-primary/50">Human </span>
            <span className="text-primary/50">Health</span>
          </h1>

          <p className="text-xl xl:text-2xl text-on-surface-variant font-body leading-relaxed max-w-2xl">
            Tracking the surging impact of rising global temperatures on
            vulnerable populations. Our 2026 data reveals unprecedented shifts
            in exposure and physical activity under heat stress.
          </p>
        </div>
      </section>

      {/* ── 1.1.1 Heatwaves — groups the two 1.1.1 chart blocks below ── */}
      <SubsectionHead number="1.1.1" title="Heatwaves" />

      {/* ── Attributable — full-width immersive opener ── */}
      <IndicatorSection
        meta={indicators[0]}
        downloadData={[...data111attr] as Record<string, unknown>[]}
        downloadFilename="indicator-1.1.1-attributable.csv"
        variant="immersive"
        showNumberBadge={false}
        mapView={<Chart111AttrMap />}
      >
        <Chart111Attr />
      </IndicatorSection>

      {/* ── 1.1.1 Vulnerable — chart left, metadata right ── */}
      <IndicatorSection
        meta={indicators[1]}
        downloadData={[...data111vuln] as Record<string, unknown>[]}
        downloadFilename="indicator-1.1.1-vulnerable.csv"
        variant="splitRight"
        showNumberBadge={false}
      >
        <Chart111Vuln />
      </IndicatorSection>

      {/* ── 1.1.2 Physical Activity — sidebar right ── */}
      <SubsectionHead number={indicators[2].number} title={indicators[2].title} />
      <IndicatorSection
        meta={indicators[2]}
        downloadData={[...data112] as Record<string, unknown>[]}
        downloadFilename="indicator-1.1.2-physical-activity.csv"
        variant="splitRight"
        showNumberBadge={false}
        showSectionTitle={false}
      >
        <Chart112 />
      </IndicatorSection>
    </>
  );
}
