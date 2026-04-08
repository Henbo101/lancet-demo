export default function MetadataBlock() {
  return (
    <div>
      <h4 className="text-sm font-headline font-bold text-primary tracking-widest mb-6 uppercase">
        Indicator Description
      </h4>
      <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
        This indicator tracks the exposure of vulnerable populations — infants
        under 1&nbsp;year and adults over 65&nbsp;years — to heatwave events
        globally. Population exposure is calculated using ECMWF ERA5 reanalysis
        data combined with WorldPop age/sex population structure datasets to
        estimate person-days of heatwave exposure for each demographic group
        across WHO regions.
      </p>
      <h4 className="text-sm font-headline font-bold text-primary tracking-widest mb-4 uppercase">
        Caveats
      </h4>
      <p className="text-sm text-on-surface-variant leading-relaxed italic">
        As two distinct sources were used for the temperature and population
        datasets, slight discrepancies in spatial resolution may occur. Exposure
        calculations assume static population distributions within the specific
        census years.
      </p>
    </div>
  );
}
