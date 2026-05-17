import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
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
};

export default nextConfig;
