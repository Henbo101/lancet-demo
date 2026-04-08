import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lancet: {
          blue: '#259AD4',
          'dark-blue': '#0B6FA1',
          red: '#B5334F',
          'teal-bg': '#D5F0F2',
          'gray-100': '#F7F7F7',
          'gray-border': '#E0E0E0',
          'gray-600': '#757575',
          dark: '#363636',
        },
      },
      fontFamily: {
        oswald: ['var(--font-oswald)', 'sans-serif'],
        'open-sans': ['var(--font-open-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
