/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/lancet-demo-v2',
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
