import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone output for Vercel deployment
  // output: 'standalone', // Only needed for Docker/self-hosted
};

export default nextConfig;
