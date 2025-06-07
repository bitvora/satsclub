import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // allow any domain for rendering images
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
