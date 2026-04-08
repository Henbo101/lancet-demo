import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── Material Design 3 surface system ── */
        primary: '#004e6f',
        'primary-container': '#006791',
        'on-primary': '#ffffff',
        'on-primary-container': '#b8e1ff',
        'primary-fixed': '#c7e7ff',
        'primary-fixed-dim': '#86cffe',
        secondary: '#486173',
        'secondary-container': '#cbe6fb',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#4e6779',
        tertiary: '#950611',
        'tertiary-container': '#b82726',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#ffd1cc',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        surface: '#f7f9fd',
        'surface-dim': '#d8dade',
        'surface-bright': '#f7f9fd',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f7',
        'surface-container': '#eceef2',
        'surface-container-high': '#e6e8ec',
        'surface-container-highest': '#e0e3e6',
        'surface-variant': '#e0e3e6',
        'surface-tint': '#00658e',
        'on-surface': '#191c1f',
        'on-surface-variant': '#40484e',
        'inverse-surface': '#2d3134',
        'inverse-on-surface': '#eff1f5',
        'inverse-primary': '#86cffe',
        outline: '#70787f',
        'outline-variant': '#bfc7cf',
        background: '#f7f9fd',
        'on-background': '#191c1f',
        /* ── Data-series palette (unchanged for chart legibility) ── */
        'series-red': '#B5334F',
        'series-blue': '#259AD4',
      },
      fontFamily: {
        headline: ['var(--font-oswald)', 'sans-serif'],
        body: ['var(--font-open-sans)', 'sans-serif'],
        label: ['var(--font-open-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
