// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuration i18n supprimée car nous utilisons react-i18next directement
  
  // Proxy pour contourner les problèmes CORS
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.virtualsomm.ch/:path*',
      },
    ];
  },
};

export default nextConfig;