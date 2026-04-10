import IndicatorSection from '@/components/IndicatorSection';
import Chart111Attr from '@/components/indicators/Chart111Attr';
import Chart111Vuln from '@/components/indicators/Chart111Vuln';
import Chart112 from '@/components/indicators/Chart112';
import Chart113Pwhl from '@/components/indicators/Chart113Pwhl';
import Chart113Workers from '@/components/indicators/Chart113Workers';
import Chart114 from '@/components/indicators/Chart114';
import Chart115 from '@/components/indicators/Chart115';
import { indicators } from '@/lib/metadata';
import { globalData as data111attr } from '@/lib/data/indicator111attr';
import { globalData as data111vuln } from '@/lib/data/indicator111vuln';
import { globalData as data112 } from '@/lib/data/indicator112';
import { globalData as data113pwhl } from '@/lib/data/indicator113pwhl';
import { globalData as data113workers } from '@/lib/data/indicator113workers';
import { globalData as data114 } from '@/lib/data/indicator114';
import { globalData as data115 } from '@/lib/data/indicator115';

export default function Home() {
  return (
    <>
      {/* ── Hero section ── */}
      <section id="hero" className="mt-8 mb-16 scroll-mt-24">
        <div className="bg-surface-container-low rounded-[2.5rem] p-8 xl:p-12">
          <div className="inline-block bg-primary/10 text-primary text-xs font-headline font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
            Indicator 1.1
          </div>

          <h1 className="font-headline font-bold text-primary uppercase leading-[0.9] mb-8">
            <span className="text-6xl xl:text-8xl block">Heat &amp;</span>
            <span className="text-6xl xl:text-8xl block text-primary/50">Human</span>
            <span className="text-6xl xl:text-8xl block text-primary/50">Health</span>
          </h1>

          <p className="text-xl xl:text-2xl text-on-surface-variant font-body leading-relaxed max-w-2xl">
            Tracking the surging impact of rising global temperatures on
            vulnerable populations. Our 2026 data reveals unprecedented shifts
            in mortality and labour capacity.
          </p>
        </div>
      </section>

      {/* ── Indicator sections ── */}
      <IndicatorSection
        meta={indicators[0]}
        downloadData={[...data111attr] as Record<string, unknown>[]}
        downloadFilename="indicator-1.1.1-attributable.csv"
      >
        <Chart111Attr />
      </IndicatorSection>

      <IndicatorSection
        meta={indicators[1]}
        downloadData={[...data111vuln] as Record<string, unknown>[]}
        downloadFilename="indicator-1.1.1-vulnerable.csv"
      >
        <Chart111Vuln />
      </IndicatorSection>

      <IndicatorSection
        meta={indicators[2]}
        downloadData={[...data112] as Record<string, unknown>[]}
        downloadFilename="indicator-1.1.2-physical-activity.csv"
      >
        <Chart112 />
      </IndicatorSection>

      <IndicatorSection
        meta={indicators[3]}
        downloadData={[...data113pwhl] as Record<string, unknown>[]}
        downloadFilename="indicator-1.1.3-labour-capacity.csv"
      >
        <Chart113Pwhl />
      </IndicatorSection>

      <IndicatorSection
        meta={indicators[4]}
        downloadData={[...data113workers] as Record<string, unknown>[]}
        downloadFilename="indicator-1.1.3-outdoor-workers.csv"
      >
        <Chart113Workers />
      </IndicatorSection>

      <IndicatorSection
        meta={indicators[5]}
        downloadData={[...data114] as Record<string, unknown>[]}
        downloadFilename="indicator-1.1.4-sleep-loss.csv"
      >
        <Chart114 />
      </IndicatorSection>

      <IndicatorSection
        meta={indicators[6]}
        downloadData={[...data115] as Record<string, unknown>[]}
        downloadFilename="indicator-1.1.5-heat-mortality.csv"
      >
        <Chart115 />
      </IndicatorSection>
    </>
  );
}
