import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // allow any domain for rendering images
  // ignore all build errors
  eslint: {
    ignoreDuringBuilds: true,
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
