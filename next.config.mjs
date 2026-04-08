/** @type {import('next').NextConfig} */
const nextConfig = {
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
