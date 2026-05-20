/* eslint-disable @typescript-eslint/no-require-imports */
import type { NextConfig } from "next";
const { i18n } = require('./next-i18next.config.js');

// const nextConfig: NextConfig = {
//   /* config options here */
//   i18n
// };

// export default nextConfig;



const nextConfig: NextConfig = {
  i18n,
  // Disable performance metrics in development if causing issues
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  // Add this to stabilize timings
  experimental: {
    // Helps with timing issues
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
}
export default nextConfig;