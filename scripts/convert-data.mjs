import XLSX from 'xlsx';
import { writeFileSync, mkdirSync } from 'fs';

mkdirSync('lib/data', { recursive: true });
mkdirSync('public/data', { recursive: true });

const R = (v, d = 2) => (typeof v === 'number' ? Math.round(v * 10 ** d) / 10 ** d : v);

function sheetToArr(wb, name) {
  const ws = wb.Sheets[name];
  if (!ws) return [];
  const raw = XLSX.utils.sheet_to_json(ws, { defval: null });
  return raw.map(row => {
    const o = {};
    for (const [k, v] of Object.entries(row)) {
      const key = k.trim();
      o[key] = typeof v === 'number' ? R(v) : v;
    }
    return o;
  });
}

// ─── 1.1.1 Attributable ───
const wb111a = XLSX.readFile('/Users/henrykillick/Downloads/Indicator-1.1.1_Attributable_Data-Download_2025-Lancet-Countdown-Report-1.xlsx');
const d111a_global = sheetToArr(wb111a, '2025_Report _Data_Global');
const d111a_country = sheetToArr(wb111a, '2025_Report_Data_Country');
writeFileSync('lib/data/indicator111attr.ts',
  `export const globalData = ${JSON.stringify(d111a_global)} as const;\n` +
  `export const countryData = ${JSON.stringify(d111a_country)} as const;\n`
);
console.log(`111attr: global=${d111a_global.length}, country=${d111a_country.length}`);

// ─── 1.1.1 Vulnerable ───
const wb111v = XLSX.readFile('/Users/henrykillick/Downloads/Indicator-1.1.1_Vulnerable_Data-Download_2025-Lancet-Countdown-Report-1.xlsx');
const d111v_global = sheetToArr(wb111v, '2025 Report Data_Global');
const d111v_who = sheetToArr(wb111v, '2025 Report Data_WHO');
const d111v_hdi = sheetToArr(wb111v, '2025 Report Data_HDI');
const d111v_lc = sheetToArr(wb111v, '2025 Report Data_LC');
writeFileSync('lib/data/indicator111vuln.ts',
  `export const globalData = ${JSON.stringify(d111v_global)} as const;\n` +
  `export const whoData = ${JSON.stringify(d111v_who)} as const;\n` +
  `export const hdiData = ${JSON.stringify(d111v_hdi)} as const;\n` +
  `export const lcData = ${JSON.stringify(d111v_lc)} as const;\n`
);
const d111v_country = sheetToArr(wb111v, '2025 Report Data_Country');
writeFileSync('public/data/country-111-vuln.json', JSON.stringify(d111v_country));
console.log(`111vuln: global=${d111v_global.length}, who=${d111v_who.length}, hdi=${d111v_hdi.length}, lc=${d111v_lc.length}, country=${d111v_country.length}`);

// ─── 1.1.2 ───
const wb112 = XLSX.readFile('/Users/henrykillick/Downloads/Indicator-1.1.2_Data-Download_2025-Lancet-Countdown-Report-1.xlsx');
const d112_global = sheetToArr(wb112, '2025 Report Data_Global');
const d112_who = sheetToArr(wb112, '2025 Report Data_WHO');
const d112_hdi = sheetToArr(wb112, '2025 Report Data_HDI');
const d112_lc = sheetToArr(wb112, '2025 Report Data_LC');
writeFileSync('lib/data/indicator112.ts',
  `export const globalData = ${JSON.stringify(d112_global)} as const;\n` +
  `export const whoData = ${JSON.stringify(d112_who)} as const;\n` +
  `export const hdiData = ${JSON.stringify(d112_hdi)} as const;\n` +
  `export const lcData = ${JSON.stringify(d112_lc)} as const;\n`
);
const d112_country = sheetToArr(wb112, '2025 Report Data_Country');
writeFileSync('public/data/country-112.json', JSON.stringify(d112_country));
console.log(`112: global=${d112_global.length}, who=${d112_who.length}, hdi=${d112_hdi.length}, lc=${d112_lc.length}, country=${d112_country.length}`);

// ─── 1.1.3 PWHL ───
const wb113p = XLSX.readFile('/Users/henrykillick/Downloads/Indicator-1.1.3_PWHL_Data-Download_2025-Lancet-Countdown-Report_v2-1.xlsx');
const d113p_global = sheetToArr(wb113p, '2025 Report Data_Global');
const d113p_who = sheetToArr(wb113p, '2025 Report Data_WHO');
const d113p_hdi = sheetToArr(wb113p, '2025 Report Data_HDI');
writeFileSync('lib/data/indicator113pwhl.ts',
  `export const globalData = ${JSON.stringify(d113p_global)} as const;\n` +
  `export const whoData = ${JSON.stringify(d113p_who)} as const;\n` +
  `export const hdiData = ${JSON.stringify(d113p_hdi)} as const;\n`
);
const d113p_country = sheetToArr(wb113p, '2025 Report Data_Country');
writeFileSync('public/data/country-113-pwhl.json', JSON.stringify(d113p_country));
console.log(`113pwhl: global=${d113p_global.length}, who=${d113p_who.length}, hdi=${d113p_hdi.length}, country=${d113p_country.length}`);

// ─── 1.1.3 Workers ───
const wb113w = XLSX.readFile('/Users/henrykillick/Downloads/Indicator-1.1.3_Workers_Data-Download_2025-Lancet-Countdown-Report.xlsx');
const d113w_global = sheetToArr(wb113w, '2025 Report Data_Global');
const d113w_who = sheetToArr(wb113w, '2025 Report Data_WHO');
const d113w_lc = sheetToArr(wb113w, '2025 Report Data_LC');
const d113w_hdi = sheetToArr(wb113w, '2025 Report Data_HDI');
writeFileSync('lib/data/indicator113workers.ts',
  `export const globalData = ${JSON.stringify(d113w_global)} as const;\n` +
  `export const whoData = ${JSON.stringify(d113w_who)} as const;\n` +
  `export const lcData = ${JSON.stringify(d113w_lc)} as const;\n` +
  `export const hdiData = ${JSON.stringify(d113w_hdi)} as const;\n`
);
const d113w_country = sheetToArr(wb113w, '2025 Report Data_Country');
writeFileSync('public/data/country-113-workers.json', JSON.stringify(d113w_country));
console.log(`113workers: global=${d113w_global.length}, who=${d113w_who.length}, lc=${d113w_lc.length}, hdi=${d113w_hdi.length}, country=${d113w_country.length}`);

// ─── 1.1.4 ───
const wb114 = XLSX.readFile('/Users/henrykillick/Downloads/Indicator-1.1.4_Data-Download_2025-Lancet-Countdown-Report-1.xlsx');
const d114_global = sheetToArr(wb114, '2025 Report Data_Global');
writeFileSync('lib/data/indicator114.ts',
  `export const globalData = ${JSON.stringify(d114_global)} as const;\n`
);
console.log(`114: global=${d114_global.length}`);

// ─── 1.1.5 ───
const wb115 = XLSX.readFile('/Users/henrykillick/Downloads/Indicator-1.1.5_Data-Download_2025-Lancet-Countdown-Report-1.xlsx');
const d115_global = sheetToArr(wb115, '2025 Report Data_Global');
const d115_who = sheetToArr(wb115, '2025 Report Data_WHO');
const d115_lc = sheetToArr(wb115, '2025 Report Data_LC');
const d115_hdi = sheetToArr(wb115, '2025 Report Data_HDI');
writeFileSync('lib/data/indicator115.ts',
  `export const globalData = ${JSON.stringify(d115_global)} as const;\n` +
  `export const whoData = ${JSON.stringify(d115_who)} as const;\n` +
  `export const lcData = ${JSON.stringify(d115_lc)} as const;\n` +
  `export const hdiData = ${JSON.stringify(d115_hdi)} as const;\n`
);
console.log(`115: global=${d115_global.length}, who=${d115_who.length}, lc=${d115_lc.length}, hdi=${d115_hdi.length}`);

console.log('\n✅ All data files generated.');
