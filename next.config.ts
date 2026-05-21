import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
}

export default nextConfig;