import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // For Docker optimization
};

export default nextConfig;
