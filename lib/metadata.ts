export interface IndicatorMeta {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  authors: string;
  keyFinding: string;
  description: string;
  caveats: string;
  dataSources: string[];
  citation: string;
}

export const indicators: IndicatorMeta[] = [
  {
    id: '111attr',
    number: '1.1.1',
    title: 'Heatwave Days Attributable to Climate Change',
    subtitle: 'Observed vs counterfactual heatwave exposure',
    authors: 'Dr Andrew J. Pershing, Joseph Giguere',
    keyFinding:
      'Globally, 84% of the heatwave days that people were exposed to on average annually in 2020–2024 would not have occurred without climate change.',
    description:
      'This indicator contrasts the number of heatwave days that people were exposed to from 2020 to 2024, with the number of heatwave days that people would have been exposed to in a hypothetical alternative climate scenario with no human-caused global heating (counterfactual scenario). It defines a heatwave as a period of at least two consecutive days when minimum and maximum temperatures exceed the local 1986–2005 95th percentile. 24 paired climate model simulations from CMIP6 are used.',
    caveats:
      'As two distinct sources were used for population data to obtain estimates of both the spatial and temporal characteristics there may be some inconsistencies between the pre and post 2000 values.',
    dataSources: [
      'ERA5 Climate Reanalysis (ECMWF)',
      'Hybrid gridded demographic data for the world, 1950–2020',
      'WorldPop Age and Sex Structure (2000–2020)',
    ],
    citation:
      'Romanello M, Walawender M, Hsu S-C, et al. The 2025 report of the Lancet Countdown on health and climate change. Lancet 2025.',
  },
  {
    id: '111vuln',
    number: '1.1.1',
    title: 'Exposure of Vulnerable Populations to Heatwaves',
    subtitle: 'Person-days of heatwave exposure for infants and elderly',
    authors: 'Dr Federico Tartarini, Prof Ollie Jay',
    keyFinding:
      'In 2024, people older than 65 years and infants younger than 1 year experienced record-high heatwave exposures — up by 304% and 389%, respectively, from the 1986–2005 baseline.',
    description:
      'This indicator defines a heatwave as a period of two or more consecutive days in which both the minimum and maximum temperatures exceed the 95th percentile of the local climatology, based on the 1986–2005 reference period. Exposure is calculated using the person-days metric, which quantifies heatwave exposure by multiplying the number of heatwave days by the total vulnerable population.',
    caveats:
      'As two distinct sources were used for population data to obtain estimates of both the spatial and temporal characteristics there may be some inconsistencies between the pre and post 2000 values.',
    dataSources: [
      'ERA5 Climate Reanalysis (ECMWF)',
      'Hybrid gridded demographic data for the world, 1950–2020',
      'WorldPop Age and Sex Structure (2000–2020)',
    ],
    citation:
      'Romanello M, Walawender M, Hsu S-C, et al. The 2025 report of the Lancet Countdown on health and climate change. Lancet 2025.',
  },
  {
    id: '112',
    number: '1.1.2',
    title: 'Heat and Physical Activity',
    subtitle: 'Hours of heat stress risk during outdoor exercise',
    authors: 'Dr Troy J Cross, Dr Samuel H Gunther, Prof Jason KW Lee, Prof Ollie Jay',
    keyFinding:
      'In 2024, each person was exposed, on average, to a record-high 1,609 hours during which ambient heat posed at least a moderate heat stress risk during light outdoor exercise — 35.8% above the 1990–1999 average.',
    description:
      'Hourly temperature and dew point data from ERA5 are used to estimate heat stress risk in accordance with the 2021 Sports Medicine Australia Extreme Heat Policy, which stratifies risk into four categories (low, moderate, high, extreme). The analysis covers Risk Classification 1 (walking) and Risk Classification 3 (jogging/cycling).',
    caveats:
      'Risk estimates may differ for older adults, young children, pregnant women, and those with chronic diseases. A more detailed model would incorporate age, health status, physiology, and clothing.',
    dataSources: [
      'ERA5 Climate Reanalysis (ECMWF)',
      'WHO Detailed Boundary ADM0 Shapefiles',
      'Gridded Population of the World v4 (NASA SEDAC)',
    ],
    citation:
      'Romanello M, Walawender M, Hsu S-C, et al. The 2025 report of the Lancet Countdown on health and climate change. Lancet 2025.',
  },
  {
    id: '113pwhl',
    number: '1.1.3',
    title: 'Change in Labour Capacity — Potential Work Hours Lost',
    subtitle: 'Work hours lost due to heat by economic sector',
    authors: 'Chris Freyberg, Dr Bruno Lemke, Matthias Otto',
    keyFinding:
      'A record-high 640 billion potential work hours were lost in 2024, a 98% increase compared to the 1990–99 annual average.',
    description:
      'This indicator monitors potential hours lost by linking Wet Bulb Globe Temperature with the metabolic rate of workers in four sectors. It combines this with the working-age population (15+) in each sector per country to estimate potential work hours lost per year.',
    caveats:
      'Sector distributions are country averages applied evenly to each grid cell, not accounting for sub-national variation. Only formal employment is considered. A methodology change in 2020 may appear as a discontinuity in time series spanning 2019–2020.',
    dataSources: [
      'ERA5 Climate Reanalysis (ECMWF)',
      'Gridded Population of the World v4 (NASA SEDAC)',
      'UN Population Division (2025)',
      'ILOSTAT Data Explorer (2025)',
    ],
    citation:
      'Romanello M, Walawender M, Hsu S-C, et al. The 2025 report of the Lancet Countdown on health and climate change. Lancet 2025.',
  },
  {
    id: '113workers',
    number: '1.1.3',
    title: 'Outdoor Workers',
    subtitle: 'Number and proportion of working-age outdoor workers',
    authors: 'Dr Natalie Momen, Dr Frank Pega',
    keyFinding:
      'Globally, in 2024, an estimated 1.5 billion people — 25.3% of the working-age population — worked outdoors, representing a small decrease from 2023 (25.9%).',
    description:
      'This indicator presents estimates of the number and percentage of outdoor workers among the working-age population (≥15 years). WHO/ILO estimates of occupational exposure to solar UV radiation are combined with UN population estimates for 195 countries, 2000–2024, disaggregated by sex and age.',
    caveats:
      'The 2024 estimate assumes a linear trend. Workers in the formal economy were captured by all Labour Force Surveys, but only some captured informal workers.',
    dataSources: [
      'WHO/ILO Joint Estimates of Work-related Burden of Disease (2023)',
      'UN World Population Prospects (2024 revision)',
    ],
    citation:
      'Romanello M, Walawender M, Hsu S-C, et al. The 2025 report of the Lancet Countdown on health and climate change. Lancet 2025.',
  },
  {
    id: '114',
    number: '1.1.4',
    title: 'Rising Night-time Temperatures and Sleep Loss',
    subtitle: 'Global change in sleep hours lost due to warming nights',
    authors: 'Dr Kelton Minor, Dr Nick Obradovich',
    keyFinding:
      'Total sleep time lost due to high night-time temperatures increased by 6% in 2020–24 relative to the 1986–2005 baseline, reaching a record 9% increase in 2024.',
    description:
      'This indicator tracks the relationship between sleep and nighttime temperatures using over 10 billion sleep observations from fitness trackers across 40,000+ individuals in 68 countries (2015–2017). It estimates the percentage change in annual hours of sleep lost globally due to warmer-than-optimal nighttime temperatures relative to the 1986–2005 baseline.',
    caveats:
      'The sample may over-represent wealthier persons who can afford fitness trackers. The relationship between temperature and sleep may change with future adaptation (e.g., air conditioning availability).',
    dataSources: [
      'ERA5 Climate Reanalysis (ECMWF)',
      'Gridded Population of the World v4 (NASA SEDAC)',
      'Minor et al. 2022 (linear spline parameters)',
    ],
    citation:
      'Romanello M, Walawender M, Hsu S-C, et al. The 2025 report of the Lancet Countdown on health and climate change. Lancet 2025.',
  },
  {
    id: '115',
    number: '1.1.5',
    title: 'Heat-Related Mortality',
    subtitle: 'Deaths attributable to heat exposure',
    authors: 'Prof Joan Ballester, Prof Xavier Basagaña, Jorge Ruiz-Cabrejos',
    keyFinding:
      'In 2012–2021, global heat-related mortality reached an estimated average of 546,000 deaths annually, up 63.2% from 335,000 in 1990–1999.',
    description:
      'The analysis uses quasi-Poisson regression with distributed lag non-linear models to estimate the temperature–mortality association in each location. A multilevel meta-regression pools location-specific results, and predictions are obtained for all countries using the fitted model.',
    caveats:
      'Exposure–response associations were meta-predicted for all countries. Estimated values are more uncertain for smaller regions.',
    dataSources: [
      'ERA5 Climate Reanalysis (ECMWF)',
      'UN Population Division (2025)',
      'World Mortality Dataset (Karlinsky & Kobak 2021)',
      'Global Burden of Disease Study 2021',
      'Gridded Population of the World v4 (NASA SEDAC)',
    ],
    citation:
      'Romanello M, Walawender M, Hsu S-C, et al. The 2025 report of the Lancet Countdown on health and climate change. Lancet 2025.',
  },
];
