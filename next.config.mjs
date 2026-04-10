/** @type {import('next').NextConfig} */
// Production: set BASE_PATH for GitHub Pages (`npm run build:gh-pages`). Vercel uses default `npm run build` with no BASE_PATH (app at `/`).
// Dev must ignore BASE_PATH so a leaked env var after a Pages build cannot break localhost.
// var after `npm run build` cannot break http://localhost:3000/ (missing _next + CSS).
const isDevServer =
  process.argv.some((a) => a === 'dev' || a.endsWith('/dev')) ||
  process.env.npm_lifecycle_event === 'dev';

const basePathFromEnv = (process.env.BASE_PATH ?? '').replace(/\/$/, '') || '';

const basePath = isDevServer ? '' : basePathFromEnv;

const nextConfig = {
  output: 'export',
  basePath,
  images: { unoptimized: true },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/Explore Our Data*/**',
        '**/*.rtf',
        '**/*.pdf',
        '**/*.numbers',
        '**/node_modules/**',
      ],
    };
    return config;
  },
};
export default nextConfig;
