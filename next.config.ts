/* eslint-disable @typescript-eslint/no-require-imports */
import type { NextConfig } from "next";
const { i18n } = require('./next-i18next.config.js');

const nextConfig: NextConfig = {
  /* config options here */
  i18n
};

export default nextConfig;
