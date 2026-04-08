import { DataPoint, REGIONS } from './data';

/**
 * Region parameters calibrated so Global reaches the headline figures:
 *   65+:     304 % more → baseline × 4.04 by 2024
 *   Infants: 389 % more → baseline × 4.89 by 2024
 */
const regionParams: Record<
  string,
  {
    baseInf: number;
    base65: number;
    totalScale: number;
    seed: number;
    growthFactor: number;
  }
> = {
  Global: { baseInf: 3.0, base65: 4.0, totalScale: 800, seed: 1, growthFactor: 1.0 },
  Africa: { baseInf: 4.2, base65: 5.1, totalScale: 180, seed: 2, growthFactor: 1.15 },
  Asia: { baseInf: 4.8, base65: 6.5, totalScale: 450, seed: 3, growthFactor: 1.1 },
  Europe: { baseInf: 2.2, base65: 3.5, totalScale: 120, seed: 4, growthFactor: 0.85 },
  'Latin America': { baseInf: 3.5, base65: 4.5, totalScale: 90, seed: 5, growthFactor: 0.95 },
  Oceania: { baseInf: 1.8, base65: 2.8, totalScale: 8, seed: 6, growthFactor: 0.7 },
  SIDS: { baseInf: 4.0, base65: 4.8, totalScale: 3, seed: 7, growthFactor: 1.05 },
};

function generate(): DataPoint[] {
  const data: DataPoint[] = [];

  for (const region of REGIONS) {
    const p = regionParams[region];

    for (let year = 1986; year <= 2024; year++) {
      const noise =
        Math.sin(year * 3.7 + p.seed * 17.3) * 0.25 +
        Math.cos(year * 2.1 + p.seed * 11.7) * 0.15;

      let growthInf = 1.0;
      let growth65 = 1.0;

      if (year > 2005) {
        const t = (year - 2005) / 19; // 0 → 1 over 2006‑2024
        growthInf = 1.0 + 3.89 * t * t * p.growthFactor;
        growth65 = 1.0 + 3.04 * t * t * p.growthFactor;
      }

      const avgInf = Math.max(0.5, p.baseInf * growthInf + noise);
      const avg65 = Math.max(0.5, p.base65 * growth65 + noise * 1.2);

      const popGrowth = 1 + (year - 1986) * 0.005;

      data.push({
        year,
        region,
        exposure_average_infants: Math.round(avgInf * 100) / 100,
        exposure_average_65: Math.round(avg65 * 100) / 100,
        exposure_total_infants: Math.round(avgInf * p.totalScale * popGrowth * 10) / 10,
        exposure_total_65: Math.round(avg65 * p.totalScale * popGrowth * 10) / 10,
      });
    }
  }

  return data;
}

export const dataset: DataPoint[] = generate();
