import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["resium"]
  },
  env: {
    CESIUM_BASE_URL: "/cesium"
  }
};

export default nextConfig;
