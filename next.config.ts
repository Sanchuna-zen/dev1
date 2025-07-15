import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.pexels.com',
      pathname: '/images/**',
    },
  ],
};

export default nextConfig;
