export default function MetadataBlock() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pt-8 border-t border-lancet-gray-border">
      {/* Left — Methodology */}
      <div>
        <h3 className="font-oswald text-lancet-red text-lg uppercase font-semibold mb-3">
          Indicator Description
        </h3>
        <p className="text-sm text-lancet-gray-600 leading-relaxed">
          This indicator tracks the exposure of vulnerable populations — infants
          under 1&nbsp;year and adults over 65&nbsp;years — to heatwave events
          globally. Population exposure is calculated using ECMWF ERA5
          reanalysis data combined with WorldPop age/sex population structure
          datasets to estimate person-days of heatwave exposure for each
          demographic group across WHO regions.
        </p>
        <p className="text-sm text-lancet-gray-600 leading-relaxed mt-3">
          A heatwave is defined as a period of two or more consecutive days
          where both the daily minimum and maximum temperatures exceed the 95th
          percentile of the local historical distribution (1986&ndash;2005
          baseline).
        </p>
      </div>

      {/* Right — Sources & Authors */}
      <div>
        <h3 className="font-oswald text-lancet-red text-lg uppercase font-semibold mb-3">
          Data Sources &amp; Authors
        </h3>
        <div className="text-sm text-lancet-gray-600 leading-relaxed space-y-2">
          <p>
            <span className="font-semibold text-lancet-dark">
              Data Sources:
            </span>{' '}
            ECMWF ERA5 Reanalysis; WorldPop Age/Sex Structure (2024 revision).
          </p>
          <p>
            <span className="font-semibold text-lancet-dark">Authors:</span> Dr.
            Andrew&nbsp;J Pershing, Dr. Marina Romanello, Dr. Claudia di Napoli,
            et&nbsp;al.
          </p>
          <p>
            <span className="font-semibold text-lancet-dark">Citation:</span>{' '}
            Lancet Countdown 2025 Report — Indicator 1.1.1.
          </p>
        </div>
      </div>
    </div>
  );
}
