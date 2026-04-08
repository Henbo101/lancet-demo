/**
 * Maps ISO 3166-1 numeric country codes → simplified WHO regions
 * used in the Lancet Countdown dataset.
 *
 * Countries that don't map to any tracked region (e.g. USA, Canada)
 * return null and are rendered in neutral gray on the map.
 */

const africa = new Set([
  12, 24, 72, 108, 120, 132, 140, 148, 174, 178, 180, 204, 226, 231, 232,
  262, 266, 270, 288, 324, 384, 404, 426, 430, 434, 450, 454, 466, 478, 480,
  504, 508, 516, 562, 566, 624, 646, 678, 686, 694, 706, 710, 716, 728, 729,
  748, 768, 788, 800, 834, 854, 894,
]);

const europe = new Set([
  8, 20, 40, 56, 70, 100, 112, 191, 196, 203, 208, 233, 234, 246, 250, 268,
  276, 300, 348, 352, 372, 380, 428, 438, 440, 442, 470, 498, 499, 528, 578,
  616, 620, 642, 643, 674, 688, 703, 705, 724, 752, 756, 804, 807, 826,
]);

const asia = new Set([
  4, 31, 48, 50, 51, 64, 96, 104, 116, 144, 156, 158, 275, 356, 360, 364,
  368, 376, 392, 398, 400, 408, 410, 414, 417, 418, 422, 446, 458, 462, 496,
  512, 524, 586, 608, 634, 682, 702, 704, 760, 762, 764, 784, 792, 860, 887,
]);

const latinAmerica = new Set([
  28, 32, 44, 52, 60, 68, 76, 84, 152, 170, 188, 192, 212, 214, 218, 222,
  308, 320, 328, 332, 340, 388, 484, 558, 591, 600, 604, 630, 740, 780, 858,
  862,
]);

const oceania = new Set([
  36, 90, 242, 258, 296, 520, 540, 548, 554, 570, 574, 580, 583, 584, 585,
  598, 772, 776, 798, 876, 882,
]);

export function getRegionForCountry(
  countryId: string | number,
): string | null {
  const id = Number(countryId);
  if (africa.has(id)) return 'Africa';
  if (europe.has(id)) return 'Europe';
  if (asia.has(id)) return 'Asia';
  if (latinAmerica.has(id)) return 'Latin America';
  if (oceania.has(id)) return 'Oceania';
  return null;
}
