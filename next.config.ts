import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tells Next.js not to bundle pdf-parse, preventing serverless crashing
  serverExternalPackages: ["pdf-parse"], 
};

export default nextConfig;