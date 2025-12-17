import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: true,
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
  },
};

export default nextConfig;
