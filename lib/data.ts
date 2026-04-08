export interface DataPoint {
  year: number;
  region: string;
  exposure_total_infants: number;
  exposure_total_65: number;
  exposure_average_infants: number;
  exposure_average_65: number;
}

export const REGIONS = [
  'Global',
  'Africa',
  'Asia',
  'Europe',
  'Latin America',
  'Oceania',
  'SIDS',
];

export const YEAR_MIN = 1986;
export const YEAR_MAX = 2024;

export function filterData(
  data: DataPoint[],
  region: string,
  yearRange: [number, number]
): DataPoint[] {
  return data.filter(
    (d) =>
      d.region === region &&
      d.year >= yearRange[0] &&
      d.year <= yearRange[1]
  );
}

export type SeriesKey = keyof Pick<
  DataPoint,
  | 'exposure_total_infants'
  | 'exposure_total_65'
  | 'exposure_average_infants'
  | 'exposure_average_65'
>;

export function getSeriesKey(
  dataType: 'average' | 'total',
  demographic: 'infants' | '65plus'
): SeriesKey {
  const dem = demographic === '65plus' ? '65' : 'infants';
  return `exposure_${dataType}_${dem}` as SeriesKey;
}
