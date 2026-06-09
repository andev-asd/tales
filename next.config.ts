import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {},
  env: {
    NEXT_DISABLE_DEVTOOLS: '1',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/prisma/migrations/**',
        ],
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
